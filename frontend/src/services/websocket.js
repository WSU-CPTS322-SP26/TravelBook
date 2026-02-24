class WebSocketService {
  constructor() {
    this.ws = null;
    this.url = null;
    this.baseUrl = null;
    this.userId = null;
    this.listeners = {};
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectInterval = 3000;
    this.isIntentionallyClosed = false;
  }

  // Connect to WebSocket server
  connect(url, userId = null) {
    this.baseUrl = url;
    this.userId = userId;
    this.url = userId ? `${url}/${userId}` : url;
    this.isIntentionallyClosed = false;
    
    try {
      this.ws = new WebSocket(this.url);
      
      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
        this.emit('connected');
      };
      
      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('WebSocket message received:', data);
          
          // Emit event to all listeners
          this.emit(data.type, data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
      
      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.emit('error', error);
      };
      
      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.emit('disconnected');
        
        // Auto-reconnect if not intentionally closed
        if (!this.isIntentionallyClosed) {
          this.reconnect();
        }
      };
      
    } catch (error) {
      console.error('Error connecting to WebSocket:', error);
    }
  }

  // Send message to server
  send(data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      console.error('WebSocket is not connected');
    }
  }

  // Disconnect
  disconnect() {
    this.isIntentionallyClosed = true;
    if (this.ws) {
      this.ws.close();
    }
  }

  // Auto-reconnect logic
  reconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Reconnecting... Attempt ${this.reconnectAttempts}`);
      
      setTimeout(() => {
        this.connect(this.baseUrl, this.userId);
      }, this.reconnectInterval);
    } else {
      console.error('Max reconnection attempts reached');
      this.emit('max_reconnect_failed');
    }
  }

  // Event listener system
  on(eventType, callback) {
    if (!this.listeners[eventType]) {
      this.listeners[eventType] = [];
    }
    this.listeners[eventType].push(callback);
  }

  // Remove event listener
  off(eventType, callback) {
    if (this.listeners[eventType]) {
      this.listeners[eventType] = this.listeners[eventType].filter(
        cb => cb !== callback
      );
    }
  }

  // Emit event to all listeners
  emit(eventType, data) {
    if (this.listeners[eventType]) {
      this.listeners[eventType].forEach(callback => callback(data));
    }
  }

  // Check connection status
  isConnected() {
    return this.ws && this.ws.readyState === WebSocket.OPEN;
  }
}

// Create singleton instance
const wsService = new WebSocketService();

export default wsService;