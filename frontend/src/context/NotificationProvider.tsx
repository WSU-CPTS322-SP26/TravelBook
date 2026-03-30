import { useState, useCallback, ReactNode } from 'react';
import { NotificationContext } from './NotificationContext';

export interface Notification {
  id: number;
  message: string;
  type: 'info' | 'success' | 'error' | 'warning';
}

export interface NotificationContextType {
  notifications: Notification[];
  addNotification: (message: string, type?: 'info' | 'success' | 'error' | 'warning', duration?: number) => number;
  removeNotification: (id: number) => void;
}

interface NotificationProviderProps {
  children: ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info', duration: number = 5000): number => {
    const id = Date.now();
    const notification: Notification = { id, message, type };
    
    setNotifications(prev => [...prev, notification]);
    
    if (duration > 0) {
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== id));
      }, duration);
    }
    
    return id;
  }, []);

  const removeNotification = useCallback((id: number): void => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const value: NotificationContextType = {
    notifications,
    addNotification,
    removeNotification
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}
