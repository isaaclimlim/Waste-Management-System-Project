import React, { createContext, useContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { api } from '../lib/axios';
import { useAuth } from './AuthContext';

const WasteRequestContext = createContext(null);

export function WasteRequestProvider({ children }) {
  const { token, user } = useAuth();
  const [requestSubmitted, setRequestSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [statusCounts, setStatusCounts] = useState({
    pending: 0,
    accepted: 0,
    rejected: 0,
    completed: 0,
    cancelled: 0
  });
  const [requests, setRequests] = useState([]);

  const fetchStatusCounts = async () => {
    if (isLoading || !token) {
      console.log('Skipping fetchStatusCounts:', { isLoading, hasToken: !!token });
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      console.log('Fetching status counts with token:', token ? 'Token exists' : 'No token');
      const response = await api.get('/waste-requests/status-counts');
      console.log('Status counts response:', response.data);
      
      if (response.data.success) {
        setStatusCounts(response.data.data);
      } else {
        console.error('Failed to fetch status counts:', response.data);
        setError(response.data.message || 'Failed to fetch status counts');
      }
    } catch (error) {
      console.error('Error fetching status counts:', error);
      console.error('Error details:', error.response?.data);
      setError(error.response?.data?.message || 'Error fetching status counts');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRequests = async () => {
    if (!token) {
      console.log('Skipping fetchRequests: No token available');
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      console.log('Fetching requests with token:', token ? 'Token exists' : 'No token');
      const response = await api.get('/waste-requests/resident');
      console.log('Requests response:', response.data);
      
      if (response.data.success) {
        setRequests(response.data.data);
      } else {
        console.error('Failed to fetch requests:', response.data);
        setError(response.data.message || 'Failed to fetch requests');
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
      console.error('Error details:', error.response?.data);
      setError(error.response?.data?.message || 'Error fetching requests');
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize WebSocket connection
  useEffect(() => {
    if (!user?._id || !token) {
      console.log('Skipping WebSocket connection:', { 
        hasUserId: !!user?._id, 
        hasToken: !!token,
        userId: user?._id,
        userIdType: typeof user?._id
      });
      return;
    }

    console.log('Initializing WebSocket connection for user:', {
      userId: user._id,
      userIdType: typeof user._id
    });
    const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000');
    
    // Join user's room
    socket.emit('join', user._id);

    // Listen for new requests
    socket.on('newRequest', (newRequest) => {
      console.log('Received new request:', newRequest);
      setRequests(prev => [newRequest, ...prev]);
      fetchStatusCounts();
    });

    // Listen for status updates
    socket.on('requestStatusUpdate', ({ requestId, status, updatedAt }) => {
      console.log('Received status update:', { requestId, status, updatedAt });
      setRequests(prev => 
        prev.map(request => 
          request._id === requestId 
            ? { ...request, status, updatedAt }
            : request
        )
      );
      fetchStatusCounts();
    });

    socket.on('connect', () => {
      console.log('WebSocket connected');
    });

    socket.on('error', (error) => {
      console.error('WebSocket error:', error);
    });

    return () => {
      console.log('Disconnecting WebSocket');
      socket.disconnect();
    };
  }, [user?._id, token]);

  useEffect(() => {
    if (token) {
      console.log('Token available, fetching initial data', {
        userId: user?._id,
        userIdType: typeof user?._id
      });
      fetchRequests();
      fetchStatusCounts();
    }
  }, [token]);

  const markRequestSubmitted = () => {
    setRequestSubmitted(true);
    fetchStatusCounts();
    fetchRequests();
  };

  const resetRequestSubmitted = () => {
    setRequestSubmitted(false);
  };

  return (
    <WasteRequestContext.Provider 
      value={{ 
        requestSubmitted, 
        markRequestSubmitted, 
        resetRequestSubmitted,
        statusCounts,
        requests,
        isLoading,
        error,
        fetchStatusCounts,
        fetchRequests
      }}
    >
      {children}
    </WasteRequestContext.Provider>
  );
}

export function useWasteRequest() {
  const context = useContext(WasteRequestContext);
  if (!context) {
    throw new Error('useWasteRequest must be used within a WasteRequestProvider');
  }
  return context;
} 