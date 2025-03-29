import io from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.subscribers = {
      newRequests: new Set(),
      requestUpdates: new Set(),
      analytics: new Set(),
      scheduledPickups: new Set(),
      recommendations: new Set(),
      bulkRequests: new Set()
    };
  }

  connect() {
    if (!this.socket) {
      const API_URL = import.meta.env.VITE_API_URL || 'https://waste-management-system-project.onrender.com';
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('No authentication token found');
        return null;
      }

      this.socket = io(API_URL, {
        path: '/api/socket.io',
        auth: { token },
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        transports: ['websocket', 'polling']
      });

      this.socket.on('connect', () => {
        console.log('Socket connected successfully');
      });

      this.socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
      });

      this.socket.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
      });

      // Set up event listeners
      this.socket.on('newRequest', (data) => {
        this.notifySubscribers('newRequests', data);
      });

      this.socket.on('requestUpdate', (data) => {
        this.notifySubscribers('requestUpdates', data);
      });

      this.socket.on('analyticsUpdate', (data) => {
        this.notifySubscribers('analytics', data);
      });

      this.socket.on('scheduledPickupUpdate', (data) => {
        this.notifySubscribers('scheduledPickups', data);
      });

      this.socket.on('recommendationUpdate', (data) => {
        this.notifySubscribers('recommendations', data);
      });

      this.socket.on('bulkRequestUpdate', (data) => {
        this.notifySubscribers('bulkRequests', data);
      });
    }
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  subscribeToNewRequests(callback) {
    this.subscribers.newRequests.add(callback);
    return () => this.subscribers.newRequests.delete(callback);
  }

  subscribeToRequestUpdates(callback) {
    this.subscribers.requestUpdates.add(callback);
    return () => this.subscribers.requestUpdates.delete(callback);
  }

  subscribeToAnalytics(callback) {
    this.subscribers.analytics.add(callback);
    return () => this.subscribers.analytics.delete(callback);
  }

  subscribeToScheduledPickups(callback) {
    this.subscribers.scheduledPickups.add(callback);
    return () => this.subscribers.scheduledPickups.delete(callback);
  }

  subscribeToRecommendations(callback) {
    this.subscribers.recommendations.add(callback);
    return () => this.subscribers.recommendations.delete(callback);
  }

  subscribeToBulkRequests(callback) {
    this.subscribers.bulkRequests.add(callback);
    return () => this.subscribers.bulkRequests.delete(callback);
  }

  unsubscribeFromNewRequests() {
    this.subscribers.newRequests.clear();
  }

  unsubscribeFromRequestUpdates() {
    this.subscribers.requestUpdates.clear();
  }

  unsubscribeFromAnalytics() {
    this.subscribers.analytics.clear();
  }

  unsubscribeFromScheduledPickups() {
    this.subscribers.scheduledPickups.clear();
  }

  unsubscribeFromRecommendations() {
    this.subscribers.recommendations.clear();
  }

  unsubscribeFromBulkRequests() {
    this.subscribers.bulkRequests.clear();
  }

  notifySubscribers(event, data) {
    this.subscribers[event].forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in ${event} subscriber:`, error);
      }
    });
  }
}

export const socketService = new SocketService(); 