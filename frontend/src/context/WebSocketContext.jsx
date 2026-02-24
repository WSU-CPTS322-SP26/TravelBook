import React, { createContext, useContext, useEffect, useState } from 'react';
import wsService from '../services/websocket';

const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  
  // Get user ID from your auth context or localStorage
  const userId = localStorage.getItem('userId') || '42';
  const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws/sendmsg';

  useEffect(() => {
    // Connect to WebSocket
    wsService.connect(wsUrl);

    // Set up event listeners
    wsService.on('connected', () => {
      console.log('Connected to WebSocket');
      setIsConnected(true);
    });

    wsService.on('disconnected', () => {
      console.log('Disconnected from WebSocket');
      setIsConnected(false);
    });

    wsService.on('error', (error) => {
      console.error('WebSocket error:', error);
    });

    // Listen for specific events
    wsService.on('new_message', (data) => {
      setMessages(prev => [...prev, data.message]);
    });

    wsService.on('online_users', (data) => {
      setOnlineUsers(data.users || []);
    });

    // Cleanup on unmount
    return () => {
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
      author: `User ${userId}`
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

  // Generic send function
  const send = (data) => {
    wsService.send(data);
  };

  // Subscribe to specific event
  const subscribe = (eventType, callback) => {
    wsService.on(eventType, callback);
    
    // Return unsubscribe function
    return () => wsService.off(eventType, callback);
  };

  const value = {
    isConnected,
    messages,
    onlineUsers,
    sendMessage,
    addPlace,
    sendTyping,
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