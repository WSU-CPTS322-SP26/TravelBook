import { useState, useCallback, ReactNode, useEffect, useRef } from 'react';
import { NotificationContext } from './NotificationContext';
import NotificationBox from '../components/NotificationBox';
import { useWebSocketContext } from './WebSocketContext';
import { useAuth } from './AuthContext';
import { Notification } from '../types/types';

export interface NotificationContextType {
  notifications: Notification[];
  addNotification: (title: string, message: string, type?: 'info' | 'success' | 'error' | 'warning', duration?: number) => void;
  dismiss: (id: number) => void;
  setActiveConversation: (id: number | null) => void;
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { isConnected, subscribe } = useWebSocketContext();
  const { user } = useAuth();

  const activeConversationRef = useRef<number | null>(null);

  const setActiveConversation = useCallback((id: number| null) => {
    activeConversationRef.current = id;
  }, []);

  const dismiss = useCallback((id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const addNotification = useCallback((title: string, message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info', duration: number = 5000) => {
    const id = crypto.randomUUID() as unknown as number; // Generate a unique ID for the notification
    const notification: Notification = { id, title, message, type };
    setNotifications(prev => [...prev, notification]);
    
    setTimeout(() => dismiss(id), 5000);
    }, [dismiss]);
    

  // Subscribe to WebSocket notifications when connected
  useEffect(() => {
    const unsubscribe = subscribe('new_message', (data: any) => {
        const msg = data.message; // Cast to your message type

        if (data.sender_user_id !== user?.id) return;

        if (Number(msg.conversation_id) === activeConversationRef.current) return;

        const senderName = msg.sender_username ?? `User ${data.sender_user_id}`;
        const preview = msg.content ? msg.content.slice(0, 60) + (msg.content.length > 60 ? '...' : '') : 'New poll';

        addNotification(senderName, preview, 'info');
    });

    return unsubscribe;
    }, [subscribe, addNotification, user?.id]);

  return (
    <NotificationContext.Provider value={{ notifications, dismiss, addNotification, setActiveConversation }}>
      {children}

      <div className="notification-container">
        {notifications.map(n => (
          <div key={n.id} onClick={() => dismiss(n.id)}>
            <NotificationBox title={n.title} message={n.message} />
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
}

export default NotificationProvider;