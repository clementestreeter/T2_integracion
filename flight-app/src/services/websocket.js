class WebSocketService {
  constructor(url) {
    this.url = url;
    this.socket = null;
    this.eventListeners = {};
  }

  connect() {
    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
      console.log('WebSocket is already connected or connecting');
      return;
    }

    this.socket = new WebSocket(this.url);

    this.socket.onopen = () => {
      console.log('Connected to WebSocket serve');
      this.emit('open');
    };

    this.socket.onmessage = (message) => {
      const data = JSON.parse(message.data);
      this.emit(data.type, data);
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    this.socket.onclose = (event) => {
      console.log('WebSocket connection closed:', event.code, event.reason);
      if (event.code !== 1000) {
        setTimeout(() => this.connect(), 3000);
      }
    };
  }

  join(userId, username = 'User') {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(
        JSON.stringify({
          type: 'join',
          id: userId,
          username: username,
        })
      );
      console.log(`Join event sent for user: ${username}`);
    } else {
      this.on('open', () => {
        this.join(userId, username);
      });
    }
  }

  sendMessage(messageContent) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      try {
        this.socket.send(
          JSON.stringify({
            type: 'chat',
            content: messageContent,
          })
        );
        console.log('Message sent:', messageContent);
      } catch (error) {
        console.error('Error while sending message:', error);
      }
    } else {
      console.error('WebSocket is not open. Cannot send message.');
    }
  }

  on(eventType, callback) {
    if (!this.eventListeners[eventType]) {
      this.eventListeners[eventType] = [];
    }
    this.eventListeners[eventType].push(callback);
  }

  emit(eventType, data) {
    const listeners = this.eventListeners[eventType];
    if (listeners) {
      listeners.forEach((callback) => callback(data));
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.close(1000, 'Client disconnect'); 
    }
  }
}

const websocketService = new WebSocketService('wss://tarea-2.2024-2.tallerdeintegracion.cl/connect');
export default websocketService;