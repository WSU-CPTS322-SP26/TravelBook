import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import wsService from '../services/websocket';
import { useAuth } from './AuthContext';

const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const {user} = useAuth();
  
  
  const userId = user?.id;
  const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws';
  

  useEffect(() => {
    if(!userId) return;
    // Connect to WebSocket with user_id in path
    wsService.connect(`${wsUrl}/${userId}`);

    const onConnected = () => { console.log('Connected to WebSocket'); setIsConnected(true); };
    const onDisconnected = () => { console.log('Disconnected from WebSocket'); setIsConnected(false); };
    const onError = (error) => { console.error('WebSocket error:', error); };
    const onNewMessage = (data) => {
      console.log("sender_id:", data.message.sender_id, "userId:", userId, "match:", data.message.sender_id === userId);
      setMessages(prev => [...prev, {...data.message, mine: data.message.sender_id == userId}]); 
    };
    const onOnlineUsers = (data) => { setOnlineUsers(data.users || []); };

    wsService.on('connected', onConnected);
    wsService.on('disconnected', onDisconnected);
    wsService.on('error', onError);
    wsService.on('new_message', onNewMessage);
    wsService.on('online_users', onOnlineUsers);

    return () => {
      wsService.off('connected', onConnected);
      wsService.off('disconnected', onDisconnected);
      wsService.off('error', onError);
      wsService.off('new_message', onNewMessage);
      wsService.off('online_users', onOnlineUsers);
      wsService.disconnect();
    };
  }, [userId, wsUrl]);

  // Send message function
  const sendMessage = (conversationId, content) => {
    wsService.send({
      type: 'send_message',
      conversation_id: conversationId,
      content: content,
      sender_id: userId,
      author: `${user.username}`
    });
  };

  // Add place function
  const addPlace = (planId, place) => {
    wsService.send({
      type: 'add_place',
      plan_id: planId,
      place: place
    });
  };

  // Send typing indicator
  const sendTyping = (conversationId) => {
    wsService.send({
      type: 'typing',
      conversation_id: conversationId
    });
  };

  const votePlace = (planId, placeId) => {
    wsService.send({
      type: 'vote_place',
      plan_id: planId,
      place_id: placeId
    });
  };

  const removeVote = (planId, placeId) => {
    wsService.send({
      type: 'remove_vote',
      plan_id: planId,
      place_id: placeId
    });
  };

  const joinConversation = useCallback((conversationId) => {
    wsService.send({
        type: 'join_conversation',
        conversation_id: conversationId
    });
}, []);

const leaveConversation = useCallback((conversationId) => {
    wsService.send({
        type: 'leave_conversation',
        conversation_id: conversationId
    });
}, []);

  // Generic send function
  const send = (data) => {
    wsService.send(data);
  };

  // Subscribe to specific event
  const subscribe = useCallback((eventType, callback) => {
    wsService.on(eventType, callback);
    return () => wsService.off(eventType, callback);
  }, []);

  const value = {
    isConnected,
    messages,
    onlineUsers,
    sendMessage,
    addPlace,
    sendTyping,
    votePlace,
    removeVote,
    joinConversation,
    leaveConversation,
    send,
    subscribe
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};

// Custom hook to use WebSocket
export const useWebSocketContext = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocketContext must be used within WebSocketProvider');
  }
  return context;
};