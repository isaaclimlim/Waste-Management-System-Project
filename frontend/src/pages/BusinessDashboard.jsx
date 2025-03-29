import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Menu, X, Calendar, History, Settings, LogOut, Clock, Trash2, MapPin, RefreshCw, AlertCircle, BarChart2, Lightbulb } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { socketService } from '../services/socket';
import { business, expenses } from '../services/api';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export function BusinessDashboard() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('bulk-requests');
  const [bulkRequests, setBulkRequests] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [scheduledPickups, setScheduledPickups] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [
          analyticsData,
          recommendationsData,
          bulkRequestsData,
          scheduledPickupsData
        ] = await Promise.all([
          business.getAnalytics(),
          business.getRecommendations(),
          business.getBulkRequests(),
          business.getScheduledPickups()
        ]);

        if (analyticsData?.data) setAnalytics(analyticsData.data);
        if (recommendationsData?.data) setRecommendations(recommendationsData.data);
        if (bulkRequestsData?.data) setBulkRequests(bulkRequestsData.data);
        if (scheduledPickupsData?.data) setScheduledPickups(scheduledPickupsData.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error.response?.data?.message || 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Socket.io subscriptions
  useEffect(() => {
    const socket = socketService.connect();

    // Subscribe to real-time updates
    socketService.subscribeToBulkRequests((data) => {
      setBulkRequests(prev => [...prev, data]);
    });

    socketService.subscribeToAnalytics((data) => {
      setAnalytics(data);
    });

    socketService.subscribeToScheduledPickups((data) => {
      setScheduledPickups(prev => [...prev, data]);
    });

    socketService.subscribeToRecommendations((data) => {
      setRecommendations(data);
    });

    // Cleanup subscriptions
    return () => {
      socketService.unsubscribeFromBulkRequests();
      socketService.unsubscribeFromAnalytics();
      socketService.unsubscribeFromScheduledPickups();
      socketService.unsubscribeFromRecommendations();
      socketService.disconnect();
    };
  }, []);

  const handleLogout = () => {
    logout();
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'bulk-requests':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-6">Bulk Waste Collection Requests</h2>
            <div className="bg-white rounded-lg shadow p-6">
              {renderBulkRequestForm()}
            </div>
          </div>
        );

      case 'analytics':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-6">Analytics & Reports</h2>
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
              </div>
            ) : error ? (
              <div className="bg-red-50 text-red-700 p-4 rounded-md">{error}</div>
            ) : !analytics?.monthlyData?.length && !analytics?.wasteTypeDistribution?.length ? (
              <div className="bg-white rounded-lg shadow p-6 text-center">
                <p className="text-gray-600">No analytics data available yet. Complete some waste collection requests to see your analytics.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {analytics?.monthlyData?.length > 0 && (
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold mb-4">Monthly Waste Disposal Trends</h3>
                    <LineChart width={500} height={300} data={analytics.monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="quantity" stroke="#10B981" />
                    </LineChart>
                  </div>
                )}
                {analytics?.wasteTypeDistribution?.length > 0 && (
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold mb-4">Waste Type Distribution</h3>
                    <PieChart width={500} height={300}>
                      <Pie
                        data={analytics.wasteTypeDistribution}
                        dataKey="quantity"
                        nameKey="type"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label
                      >
                        {analytics.wasteTypeDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </div>
                )}
              </div>
            )}
          </div>
        );

      case 'scheduled-pickups':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-6">Scheduled Pickups</h2>
            <div className="bg-white rounded-lg shadow p-6">
              {renderScheduledPickupForm()}
            </div>
          </div>
        );

      case 'recommendations':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-6">Recycling Recommendations</h2>
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
              </div>
            ) : error ? (
              <div className="bg-red-50 text-red-700 p-4 rounded-md">{error}</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommendations.map((recommendation, index) => (
                  <div key={index} className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold mb-2">{recommendation.title}</h3>
                    <p className="text-gray-600 mb-4">{recommendation.description}</p>
                    <div className="text-sm text-green-600">
                      <strong>Potential Impact:</strong> {recommendation.impact}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const renderBulkRequestForm = () => (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Submit Bulk Waste Collection Request</h2>
      <form onSubmit={handleBulkRequestSubmit} className="space-y-6">
        {/* Date Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-green-600 mr-2" />
              Collection Date
            </div>
          </label>
          <input
            type="date"
            name="date"
            min={new Date().toISOString().split('T')[0]}
            className="mt-1 block w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 border-gray-300"
          />
        </div>

        {/* Time Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-green-600 mr-2" />
              Preferred Time
            </div>
          </label>
          <select
            name="time"
            className="mt-1 block w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 border-gray-300"
          >
            <option value="">Select time</option>
            <option value="morning">Morning (8:00 AM - 12:00 PM)</option>
            <option value="afternoon">Afternoon (1:00 PM - 5:00 PM)</option>
            <option value="evening">Evening (6:00 PM - 9:00 PM)</option>
          </select>
        </div>

        {/* Waste Type Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            <div className="flex items-center">
              <Trash2 className="h-5 w-5 text-green-600 mr-2" />
              Waste Type
            </div>
          </label>
          <select
            name="wasteType"
            className="mt-1 block w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 border-gray-300"
          >
            <option value="">Select waste type</option>
            <option value="biodegradable">Biodegradable</option>
            <option value="non-biodegradable">Non-Biodegradable</option>
            <option value="recyclable">Recyclable</option>
          </select>
        </div>

        {/* Quantity Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            <div className="flex items-center">
              <Trash2 className="h-5 w-5 text-green-600 mr-2" />
              Estimated Quantity (kg)
            </div>
          </label>
          <input
            type="number"
            name="quantity"
            min="1"
            className="mt-1 block w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 border-gray-300"
          />
        </div>

        {/* Address Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            <div className="flex items-center">
              <MapPin className="h-5 w-5 text-green-600 mr-2" />
              Collection Address
            </div>
          </label>
          <textarea
            name="address"
            rows="3"
            className="mt-1 block w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 border-gray-300"
          />
        </div>

        {/* Description Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-green-600 mr-2" />
              Additional Details
            </div>
          </label>
          <textarea
            name="description"
            rows="3"
            className="mt-1 block w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 border-gray-300"
          />
        </div>

        <div>
          <button
            type="submit"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Submit Request
          </button>
        </div>
      </form>
    </div>
  );

  const renderScheduledPickupForm = () => (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Schedule Regular Pickup</h2>
      <form onSubmit={handleScheduledPickupSubmit} className="space-y-6">
        {/* Frequency Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            <div className="flex items-center">
              <RefreshCw className="h-5 w-5 text-green-600 mr-2" />
              Collection Frequency
            </div>
          </label>
          <select
            name="frequency"
            className="mt-1 block w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 border-gray-300"
          >
            <option value="">Select frequency</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="biweekly">Bi-weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>

        {/* Day of Week Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-green-600 mr-2" />
              Day of Week
            </div>
          </label>
          <select
            name="dayOfWeek"
            className="mt-1 block w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 border-gray-300"
          >
            <option value="">Select day</option>
            <option value="monday">Monday</option>
            <option value="tuesday">Tuesday</option>
            <option value="wednesday">Wednesday</option>
            <option value="thursday">Thursday</option>
            <option value="friday">Friday</option>
            <option value="saturday">Saturday</option>
            <option value="sunday">Sunday</option>
          </select>
        </div>

        {/* Time Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-green-600 mr-2" />
              Preferred Time
            </div>
          </label>
          <select
            name="time"
            className="mt-1 block w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 border-gray-300"
          >
            <option value="">Select time</option>
            <option value="morning">Morning (8:00 AM - 12:00 PM)</option>
            <option value="afternoon">Afternoon (1:00 PM - 5:00 PM)</option>
            <option value="evening">Evening (6:00 PM - 9:00 PM)</option>
          </select>
        </div>

        {/* Waste Type Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            <div className="flex items-center">
              <Trash2 className="h-5 w-5 text-green-600 mr-2" />
              Waste Type
            </div>
          </label>
          <select
            name="wasteType"
            className="mt-1 block w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 border-gray-300"
          >
            <option value="">Select waste type</option>
            <option value="biodegradable">Biodegradable</option>
            <option value="non-biodegradable">Non-Biodegradable</option>
            <option value="recyclable">Recyclable</option>
          </select>
        </div>

        {/* Address Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            <div className="flex items-center">
              <MapPin className="h-5 w-5 text-green-600 mr-2" />
              Collection Address
            </div>
          </label>
          <textarea
            name="address"
            rows="3"
            className="mt-1 block w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 border-gray-300"
          />
        </div>

        {/* Start Date Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-green-600 mr-2" />
              Start Date
            </div>
          </label>
          <input
            type="date"
            name="startDate"
            min={new Date().toISOString().split('T')[0]}
            className="mt-1 block w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 border-gray-300"
          />
        </div>

        <div>
          <button
            type="submit"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Schedule Pickup
          </button>
        </div>
      </form>
    </div>
  );

  const handleBulkRequestSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const requestData = {
      date: formData.get('date'),
      time: formData.get('time'),
      wasteType: formData.get('wasteType'),
      quantity: formData.get('quantity'),
      address: formData.get('address'),
      description: formData.get('description')
    };

    try {
      console.log('Submitting bulk request:', requestData);
      const response = await business.createBulkRequest(requestData);
      console.log('Bulk request response:', response);
      e.target.reset();
      // Socket.io will handle the real-time update
    } catch (error) {
      console.error('Error submitting bulk request:', error);
      console.error('Error details:', error.response?.data);
      setError(error.response?.data?.message || 'Failed to submit bulk request');
    }
  };

  const handleScheduledPickupSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const scheduleData = {
      frequency: formData.get('frequency'),
      dayOfWeek: formData.get('dayOfWeek'),
      time: formData.get('time'),
      wasteType: formData.get('wasteType'),
      address: formData.get('address'),
      startDate: formData.get('startDate')
    };

    try {
      console.log('Submitting scheduled pickup:', scheduleData);
      const response = await business.createScheduledPickup(scheduleData);
      console.log('Scheduled pickup response:', response);
      e.target.reset();
      // Socket.io will handle the real-time update
    } catch (error) {
      console.error('Error scheduling pickup:', error);
      console.error('Error details:', error.response?.data);
      setError(error.response?.data?.message || 'Failed to schedule pickup');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-200 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-4 border-b">
            <Link to="/" className="text-xl font-bold text-green-600 hover:text-green-700 transition-colors">
              SmartTrash
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1">
            <button
              onClick={() => setActiveTab('bulk-requests')}
              className={`w-full flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                activeTab === 'bulk-requests'
                  ? 'bg-green-100 text-green-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Trash2 className="h-5 w-5 mr-3" />
              Bulk Requests
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`w-full flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                activeTab === 'analytics'
                  ? 'bg-green-100 text-green-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <BarChart2 className="h-5 w-5 mr-3" />
              Analytics
            </button>
            <button
              onClick={() => setActiveTab('scheduled-pickups')}
              className={`w-full flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                activeTab === 'scheduled-pickups'
                  ? 'bg-green-100 text-green-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Calendar className="h-5 w-5 mr-3" />
              Scheduled Pickups
            </button>
            <button
              onClick={() => setActiveTab('recommendations')}
              className={`w-full flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                activeTab === 'recommendations'
                      ? 'bg-green-100 text-green-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
              <Lightbulb className="h-5 w-5 mr-3" />
              Recommendations
            </button>
          </nav>

          {/* User Info & Logout */}
          <div className="p-4 border-t">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                  <span className="text-green-600 font-medium">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="mt-4 w-full flex items-center px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md"
            >
              <LogOut className="h-5 w-5 mr-3" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`lg:pl-64 flex flex-col flex-1 ${isSidebarOpen ? 'lg:ml-0' : 'ml-0'}`}>
        {/* Top Bar */}
        <div className="sticky top-0 z-10 flex-shrink-0 flex h-16 bg-white shadow">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-green-500"
          >
            <Menu className="h-6 w-6" />
          </button>
          </div>

        {/* Page Content */}
        <main className="flex-1">
          {renderContent()}
        </main>
      </div>
    </div>
  );
} 