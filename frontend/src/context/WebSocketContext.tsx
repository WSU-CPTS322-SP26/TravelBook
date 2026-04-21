import React, { createContext, useContext, useEffect, useState, useCallback, useMemo, useRef } from 'react';
import wsService from '../services/websocket';
import { useAuth } from '../hooks/useAuth';
import { Message, MessageType } from '../types/types';

interface WebSocketContextType {
  isConnected: boolean;
  messages: Message[];
  onlineUsers: any[];
  sendMessage: (conversationId: string | number, content: string) => void;
  addPoll: (conversationId:number, content: string, meta_data: Record<string, Array<any>>) => void;
  sendTyping: (conversationId: string | number) => void;
  updateVote: (conversationId: number, content: string, meta_data: Record<string, Array<any>>) => void;
  joinConversation: (conversationId: string | number) => void;
  leaveConversation: (conversationId: string | number) => void;
  send: (data: any) => void;
  subscribe: (eventType: string, callback: (data: any) => void) => () => void;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export const WebSocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<any[]>([]);
  const {user} = useAuth();
  const listenersRef = useRef<any>(null);
  
  const userId = user?.id;
  console.log('WebSocketContext render, userId:', userId, 'user:', user, 'isConnected:', isConnected);
  
  console.log('WebSocket useEffect triggered, userId:', userId, 'wsService.userId:', wsService.userId);
  // Memoize wsUrl since it's a static environment variable
  const wsUrl = useMemo(() => {
    return ((import.meta as any).env.VITE_WS_URL as string) || 'ws://localhost:8000/ws';
  }, []);
  

  useEffect(() => {
    if(!userId) {
      console.log('No userId, disconnecting WebSocket');
      
      listenersRef.current?.cleanup();
      listenersRef.current = null;
      wsService.disconnect();
      wsService.userId = null;
      setIsConnected(false);
      return;
    }

    console.log('WebSocket useEffect triggered with userId:', userId);
    
    // Only connect once per userId - don't reconnect if already connected to this user
    if (wsService.isConnected() && wsService.userId === userId) {
      setIsConnected(true);
      console.log('Already connected to this user');
      return;
    }

    // Clear old listeners before reconnecting
    listenersRef.current?.cleanup();
    listenersRef.current = null;
    wsService.disconnect();
    wsService.userId = userId;
    
    wsService.connect(`${wsUrl}/${userId}`);

    const onConnected = () => { 
      console.log('Connected to WebSocket'); 
      setIsConnected(true); 
    };
    const onDisconnected = () => { 
      console.log('Disconnected from WebSocket'); 
      setIsConnected(false); 
    };
    const onError = (error: any) => { 
      console.error('WebSocket error:', error); 
    };
    const onNewMessage = (data: any) => {
      console.log("sender_id:", data.message.sender_id, "userId:", userId, "match:", data.message.sender_id === userId);
      setMessages(prev => [...prev, {...data.message, mine: data.message.sender_id == userId}] as Message[]); 
    };
    const onOnlineUsers = (data: any) => { 
      setOnlineUsers(data.users ?? []); 
    };

    wsService.on('connected', onConnected);
    wsService.on('disconnected', onDisconnected);
    wsService.on('error', onError);
    wsService.on('new_message', onNewMessage);
    wsService.on('online_users', onOnlineUsers);

    // Store cleanup function
    listenersRef.current = {
      cleanup: () => {
        wsService.off('connected', onConnected);
        wsService.off('disconnected', onDisconnected);
        wsService.off('error', onError);
        wsService.off('new_message', onNewMessage);
        wsService.off('online_users', onOnlineUsers);
      }
    };
  }, [userId, wsUrl]);

  // Send message function
  const sendMessage = (conversationId: string | number, content: string) => {
    let message: Message = {
      id: null,
      content: content,
      type: MessageType.TEXT,
      meta_data: null,
      sender_user_id: userId as number,
      receiver_user_id: null,
      conversation_id: conversationId as number,
      timestamp: new Date().toISOString()
    }

    wsService.send({ws_event: 'send_message', message});
  };

    // Send typing indicator
  const sendTyping = (conversationId: string | number) => {
    wsService.send({
      ws_event: 'typing',
      conversation_id: conversationId
    });
  };

  // Add poll function
  const addPoll = (conversationId: number, content: string, meta_data: Record<string, Array<any>>) => {
    let message: Message = {
      id: null,
      content: content,
      type: MessageType.POLL,
      meta_data: meta_data,
      sender_user_id: userId as number,
      receiver_user_id: null,
      conversation_id: conversationId as number,
      timestamp: new Date().toISOString()
    }
    
    wsService.send({
      ws_event: 'add_poll',
      message: message
    });
  };

  const updateVote = (conversationId: number, content: string, meta_data: Record<string, Array<any>>) => {
    let message: Message = {
      id: null,
      content: content, 
      type: MessageType.POLL,
      meta_data: meta_data,
      sender_user_id: userId as number,
      receiver_user_id: null,
      conversation_id: conversationId as number,
      timestamp: new Date().toISOString()
    }
    wsService.send({
      ws_event: 'update_poll',
      message: message
    });
  };

  const joinConversation = useCallback((conversationId: string | number) => {
    wsService.send({
        ws_event: 'join_conversation',
        conversation_id: conversationId
    });
}, []);

const leaveConversation = useCallback((conversationId: string | number) => {
    wsService.send({
        ws_event: 'leave_conversation',
        conversation_id: conversationId
    });
}, []);

  // Generic send function
  const send = (data: any) => {
    wsService.send(data);
  };

  // Subscribe to specific event
  const subscribe = useCallback((eventType: string, callback: (data: any) => void) => {
    wsService.on(eventType, callback);
    return () => wsService.off(eventType, callback);
  }, []);

  const value: WebSocketContextType = {
    isConnected,
    messages,
    onlineUsers,
    sendMessage,
    addPoll,
    sendTyping,
    updateVote,
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
export const useWebSocketContext = (): WebSocketContextType => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocketContext must be used within WebSocketProvider');
  }
  return context;
};

export default WebSocketContext;