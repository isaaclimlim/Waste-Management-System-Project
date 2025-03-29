import React, { createContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { business } from '../services/api';
import { socketService } from '../services/socket';

const WasteRequestContext = createContext(null);

export function WasteRequestProvider({ children }) {
  const { token, user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [statusCounts, setStatusCounts] = useState({
    pending: 0,
    in_progress: 0,
    completed: 0,
    cancelled: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await business.getRequests();
      console.log('API Response:', response); // Debug log
      
      if (response.data?.success) {
        setRequests(response.data.data);
      } else {
        setError(response.data?.message || 'Failed to fetch requests');
      }
    } catch (err) {
      console.error('Error fetching requests:', err);
      setError(err.response?.data?.message || 'Error fetching requests');
    } finally {
      setLoading(false);
    }
  };

  const fetchStatusCounts = async () => {
    if (!token || user?.role !== 'business') return;
    
    try {
      const response = await business.getStatusCounts();
      
      if (response.data?.success) {
        setStatusCounts(response.data.data);
      } else {
        setError(response.data?.message || 'Failed to fetch status counts');
      }
    } catch (err) {
      console.error('Error fetching status counts:', err);
      setError(err.response?.data?.message || 'Error fetching status counts');
    }
  };

  // Initial data fetch
  useEffect(() => {
    if (token && user?.role === 'business') {
      fetchRequests();
      fetchStatusCounts();
    }
  }, [token, user]);

  // Set up WebSocket connection for real-time updates
  useEffect(() => {
    if (!token || user?.role !== 'business') return;

    try {
      const socket = socketService.connect();

      // Subscribe to real-time updates
      socketService.subscribeToRequests((data) => {
        setRequests(prev => [...prev, data]);
      });

      socketService.subscribeToRequestUpdates((data) => {
        setRequests(prev => 
          prev.map(request => 
            request._id === data._id ? data : request
          )
        );
      });

      socketService.subscribeToStatusCounts((data) => {
        setStatusCounts(data);
      });

      // Periodic refresh every 30 seconds
      const refreshInterval = setInterval(() => {
        fetchRequests();
        fetchStatusCounts();
      }, 30000);

      // Cleanup
      return () => {
        socketService.unsubscribeFromRequests();
        socketService.unsubscribeFromRequestUpdates();
        socketService.unsubscribeFromStatusCounts();
        socketService.disconnect();
        clearInterval(refreshInterval);
      };
    } catch (err) {
      console.error('Error setting up socket connection:', err);
      setError('Failed to establish real-time connection');
    }
  }, [token, user]);

  const value = {
    requests,
    statusCounts,
    loading,
    error,
    refresh: () => {
      fetchRequests();
      fetchStatusCounts();
    }
  };

  return (
    <WasteRequestContext.Provider value={value}>
      {children}
    </WasteRequestContext.Provider>
  );
}

// Custom hook to use the waste request context
export function useWasteRequest() {
  const context = React.useContext(WasteRequestContext);
  if (!context) {
    throw new Error('useWasteRequest must be used within a WasteRequestProvider');
  }
  return context;
}

// Export the context for testing purposes
export { WasteRequestContext }; 