import { useEffect, useState } from 'react';
import { useWebSocketContext } from '../context/WebSocketContext';

export const useWebSocket = (eventType = null) => {
  const { isConnected, send, subscribe } = useWebSocketContext();
  const [data, setData] = useState(null);

  useEffect(() => {
    if (eventType) {
      // Subscribe to specific event
      const unsubscribe = subscribe(eventType, (eventData) => {
        setData(eventData);
      });

      // Cleanup
      return unsubscribe;
    }
  }, [eventType, subscribe]);

  return {
    isConnected,
    data,
    send
  };
};