import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { collector } from '../../services/api';
import { MapPin, Clock, Calendar, AlertCircle, RefreshCw, Filter } from 'lucide-react';

const mapContainerStyle = {
  width: '100%',
  height: '600px'
};

const center = {
  lat: 12.9716, // Default to Bangalore coordinates
  lng: 77.5946
};

export function CollectorRoutes() {
  const { user } = useAuth();
  const [assignedRequests, setAssignedRequests] = useState([]);
  const [directions, setDirections] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchAssignedRequests();
  }, [selectedDate, filterStatus]);

  const fetchAssignedRequests = async () => {
    try {
      setLoading(true);
      const response = await collector.getAssignedRequests();
      if (response?.data) {
        setAssignedRequests(response.data);
        calculateRoute(response.data);
      }
    } catch (error) {
      console.error('Error fetching assigned requests:', error);
      setError(error.response?.data?.message || 'Failed to fetch assigned requests');
    } finally {
      setLoading(false);
    }
  };

  const calculateRoute = async (requests) => {
    if (!requests.length) return;

    const directionsService = new google.maps.DirectionsService();
    const waypoints = requests.map(request => ({
      location: request.address,
      stopover: true
    }));

    try {
      const result = await directionsService.route({
        origin: user.location || center,
        destination: user.location || center,
        waypoints: waypoints,
        optimizeWaypoints: true,
        travelMode: google.maps.TravelMode.DRIVING
      });

      setDirections(result);
    } catch (error) {
      console.error('Error calculating route:', error);
    }
  };

  const handleStatusUpdate = async (requestId, newStatus) => {
    try {
      await collector.updateRequestStatus(requestId, newStatus);
      fetchAssignedRequests();
    } catch (error) {
      console.error('Error updating request status:', error);
      setError(error.response?.data?.message || 'Failed to update request status');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 text-red-700 p-4 rounded-md">{error}</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Collection Routes</h1>
        <p className="text-gray-600">Optimized routes for efficient waste collection</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Calendar className="h-4 w-4 inline mr-1" />
              Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Filter className="h-4 w-4 inline mr-1" />
              Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={fetchAssignedRequests}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <RefreshCw className="h-4 w-4 inline mr-1" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Collection Points</h3>
        </div>
        <div className="p-6">
          {assignedRequests.length === 0 ? (
            <p className="text-gray-600 text-center">No collection points assigned</p>
          ) : (
            <div className="space-y-4">
              {assignedRequests.map((request) => (
                <div
                  key={request._id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div>
                    <h4 className="font-medium text-gray-900">{request.businessName}</h4>
                    <p className="text-sm text-gray-600">{request.address}</p>
                    <div className="flex items-center mt-2 space-x-4">
                      <span className="text-sm text-gray-600">
                        <Clock className="h-4 w-4 inline mr-1" />
                        {request.scheduledTime}
                      </span>
                      <span className="text-sm text-gray-600">
                        <MapPin className="h-4 w-4 inline mr-1" />
                        {request.distance} km
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      request.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {request.status.replace('_', ' ')}
                    </span>
                    {request.status !== 'completed' && (
                      <select
                        value={request.status}
                        onChange={(e) => handleStatusUpdate(request._id, e.target.value)}
                        className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                      </select>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 