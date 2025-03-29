import React, { useState, useEffect } from 'react';
import { MapPin, Clock, Calendar, AlertCircle, CheckCircle, XCircle, DollarSign } from 'lucide-react';
import { collector } from '../../services/api';
import { socketService } from '../../services/socket';

export function CollectorHome() {
  const [assignedRequests, setAssignedRequests] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mapError, setMapError] = useState(null);
  const [stats, setStats] = useState({
    totalPickups: 0,
    totalEarnings: 0,
    averageTimePerPickup: 0
  });

  // Fetch assigned requests
  useEffect(() => {
    const fetchAssignedRequests = async () => {
      try {
        setLoading(true);
        const response = await collector.getAssignedRequests();
        if (response?.data) {
          setAssignedRequests(response.data);
        }
      } catch (error) {
        console.error('Error fetching assigned requests:', error);
        setError(error.response?.data?.message || 'Failed to fetch assigned requests');
      } finally {
        setLoading(false);
      }
    };

    fetchAssignedRequests();
  }, []);

  // Get current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setCurrentLocation(location);
          collector.updateLocation(location);
        },
        (error) => {
          console.error('Error getting location:', error);
          setMapError('Unable to get your current location. Please enable location services.');
        }
      );
    } else {
      setMapError('Geolocation is not supported by your browser.');
    }
  }, []);

  // Subscribe to real-time updates
  useEffect(() => {
    const socket = socketService.connect();

    socketService.subscribeToNewRequests((request) => {
      setAssignedRequests(prev => [...prev, request]);
    });

    socketService.subscribeToRequestUpdates((updatedRequest) => {
      setAssignedRequests(prev =>
        prev.map(request =>
          request._id === updatedRequest._id ? updatedRequest : request
        )
      );
    });

    return () => {
      socketService.unsubscribeFromNewRequests();
      socketService.unsubscribeFromRequestUpdates();
      socketService.disconnect();
    };
  }, []);

  const handleStatusUpdate = async (requestId, newStatus) => {
    try {
      await collector.updateRequestStatus(requestId, newStatus);
    } catch (error) {
      console.error('Error updating status:', error);
      setError('Failed to update request status');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-700 p-4 rounded-md">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900">Welcome Back!</h2>
        <p className="mt-2 text-gray-600">
          You have {assignedRequests.length} active requests to handle today.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-full">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Completed Today</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalPickups}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-full">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Avg. Time/Pickup</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.averageTimePerPickup} mins</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-full">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Today's Earnings</p>
              <p className="text-2xl font-semibold text-gray-900">${stats.totalEarnings.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Map View */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Current Location & Routes</h3>
          {mapError ? (
            <div className="bg-yellow-50 text-yellow-700 p-4 rounded-md">
              {mapError}
            </div>
          ) : (
            <div className="h-[400px]">
              {/* Current Location Marker */}
              {currentLocation && (
                <div
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                  style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    backgroundColor: 'green',
                    border: '2px solid white'
                  }}
                ></div>
              )}

              {/* Request Location Markers */}
              {assignedRequests.map(request => (
                <div
                  key={request._id}
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                  style={{
                    width: '25px',
                    height: '25px',
                    borderRadius: '50%',
                    backgroundColor: request.status === 'pending' ? 'yellow' : 'blue',
                    border: '2px solid white'
                  }}
                ></div>
              ))}
            </div>
          )}
        </div>

        {/* Request List */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Today's Requests</h3>
          <div className="space-y-4">
            {assignedRequests.map(request => (
              <div key={request._id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {request.type === 'bulk' ? 'Bulk Waste Collection' : 'Regular Pickup'}
                    </h4>
                    <p className="text-sm text-gray-500">ID: {request._id}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {request.status}
                  </span>
                </div>

                <div className="mt-3 space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    {request.address}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    {new Date(request.date).toLocaleDateString()}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="h-4 w-4 mr-2" />
                    {request.time}
                  </div>
                  {request.description && (
                    <div className="flex items-start text-sm text-gray-600">
                      <AlertCircle className="h-4 w-4 mr-2 mt-1" />
                      {request.description}
                    </div>
                  )}
                </div>

                <div className="mt-4 flex space-x-2">
                  {request.status === 'pending' && (
                    <button
                      onClick={() => handleStatusUpdate(request._id, 'in_progress')}
                      className="px-3 py-1 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Start Pickup
                    </button>
                  )}
                  {request.status === 'in_progress' && (
                    <button
                      onClick={() => handleStatusUpdate(request._id, 'completed')}
                      className="px-3 py-1 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      Complete Pickup
                    </button>
                  )}
                  <button
                    onClick={() => handleStatusUpdate(request._id, 'cancelled')}
                    className="px-3 py-1 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ))}

            {assignedRequests.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No assigned requests at the moment
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 