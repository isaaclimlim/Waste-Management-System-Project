import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Trash2, MapPin, CheckCircle2 } from 'lucide-react';
import { api } from '../lib/axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useWasteRequest } from '../contexts/WasteRequestContext';

export function RequestWasteCollection() {
  const { user, token } = useAuth();
  const { markRequestSubmitted } = useWasteRequest();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    wasteType: '',
    address: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedRequest, setSubmittedRequest] = useState(null);

  useEffect(() => {
    if (!token) {
      toast.error('Please login to submit a waste collection request');
      navigate('/login');
    }
  }, [token, navigate]);

  const wasteTypes = [
    { value: 'biodegradable', label: 'Biodegradable' },
    { value: 'non-biodegradable', label: 'Non-Biodegradable' },
    { value: 'recyclable', label: 'Recyclable' }
  ];

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.date) {
      newErrors.date = 'Date is required';
    }

    if (!formData.time) {
      newErrors.time = 'Time is required';
    }

    if (!formData.wasteType) {
      newErrors.wasteType = 'Waste type is required';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const response = await api.post('/waste-requests', formData);
      
      if (response.data.success) {
        setSubmittedRequest(response.data.data);
        markRequestSubmitted();
        toast.success('Waste collection request submitted successfully!');
      } else {
        toast.error(response.data.message || 'Failed to submit request');
      }
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error('Please login to submit a waste collection request');
        navigate('/login');
      } else {
        toast.error(error.response?.data?.message || 'An error occurred while submitting the request');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleNewRequest = () => {
    navigate('/resident');
  };

  if (!token) {
    return null;
  }

  if (submittedRequest) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-sm">
        <div className="text-center mb-8">
          <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Request Submitted Successfully!</h2>
          <p className="text-gray-600">Your waste collection request has been received and is pending collector assignment.</p>
        </div>

        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Request Details</h3>
          <div className="space-y-3">
            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-green-600 mr-2" />
              <span className="text-gray-700">Date: {new Date(submittedRequest.date).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-green-600 mr-2" />
              <span className="text-gray-700">Time: {submittedRequest.time}</span>
            </div>
            <div className="flex items-center">
              <Trash2 className="h-5 w-5 text-green-600 mr-2" />
              <span className="text-gray-700">Waste Type: {submittedRequest.wasteType}</span>
            </div>
            <div className="flex items-center">
              <MapPin className="h-5 w-5 text-green-600 mr-2" />
              <span className="text-gray-700">Address: {submittedRequest.address}</span>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                Status: Pending
              </span>
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <button
            onClick={handleNewRequest}
            className="bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors duration-200"
          >
            Okay
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-sm">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Request Waste Collection</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Date Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-green-600 mr-2" />
              Collection Date
            </div>
          </label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
              errors.date ? 'border-red-500' : 'border-gray-300'
            }`}
            min={new Date().toISOString().split('T')[0]}
          />
          {errors.date && (
            <p className="mt-1 text-sm text-red-500">{errors.date}</p>
          )}
        </div>

        {/* Time Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-green-600 mr-2" />
              Preferred Time
            </div>
          </label>
          <input
            type="time"
            name="time"
            value={formData.time}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
              errors.time ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.time && (
            <p className="mt-1 text-sm text-red-500">{errors.time}</p>
          )}
        </div>

        {/* Waste Type Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <div className="flex items-center">
              <Trash2 className="h-5 w-5 text-green-600 mr-2" />
              Waste Type
            </div>
          </label>
          <select
            name="wasteType"
            value={formData.wasteType}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
              errors.wasteType ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Select waste type</option>
            {wasteTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
          {errors.wasteType && (
            <p className="mt-1 text-sm text-red-500">{errors.wasteType}</p>
          )}
        </div>

        {/* Address Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <div className="flex items-center">
              <MapPin className="h-5 w-5 text-green-600 mr-2" />
              Collection Address
            </div>
          </label>
          <textarea
            name="address"
            value={formData.address}
            onChange={handleChange}
            rows="3"
            placeholder="Enter your complete address"
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
              errors.address ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.address && (
            <p className="mt-1 text-sm text-red-500">{errors.address}</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Request'}
        </button>
      </form>
    </div>
  );
}