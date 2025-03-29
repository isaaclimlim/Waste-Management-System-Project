import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Trash2, MapPin, CheckCircle2 } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useWasteRequest } from '../hooks/useWasteRequest';

export function RequestWasteCollection() {
  const { user, token } = useAuth();
  const { refresh } = useWasteRequest();
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

  const timeSlots = [
    { value: 'morning', label: 'Morning (8:00 AM - 12:00 PM)' },
    { value: 'afternoon', label: 'Afternoon (1:00 PM - 5:00 PM)' },
    { value: 'evening', label: 'Evening (6:00 PM - 9:00 PM)' }
  ];

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.date) {
      newErrors.date = 'Date is required';
    } else {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        newErrors.date = 'Date cannot be in the past';
      }
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
      // Format the date to ISO string
      const formattedDate = new Date(formData.date).toISOString();
      
      const requestData = {
        date: formattedDate,
        time: formData.time,
        wasteType: formData.wasteType,
        address: formData.address.trim()
      };

      console.log('Submitting request data:', requestData);

      const response = await api.post('/waste-requests', requestData);
      
      if (response.data.success) {
        setSubmittedRequest(response.data.data);
        refresh(); // Refresh the requests list
        toast.success('Waste collection request submitted successfully!');
      } else {
        console.error('Request failed:', response.data);
        toast.error(response.data.message || 'Failed to submit request');
      }
    } catch (error) {
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });

      if (error.response?.status === 401) {
        toast.error('Please login to submit a waste collection request');
        navigate('/login');
      } else if (error.response?.status === 400) {
        toast.error(error.response.data.message || 'Invalid request data');
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
    setFormData({
      date: '',
      time: '',
      wasteType: '',
      address: ''
    });
    setSubmittedRequest(null);
    setErrors({});
  };

  if (submittedRequest) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-green-500" />
          <h2 className="mt-4 text-xl font-semibold text-gray-900">Request Submitted Successfully!</h2>
          <p className="mt-2 text-gray-600">Your waste collection request has been submitted.</p>
          <div className="mt-6">
            <button
              onClick={handleNewRequest}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Submit Another Request
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Request Waste Collection</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
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
            value={formData.date}
            onChange={handleChange}
            min={new Date().toISOString().split('T')[0]}
            className={`mt-1 block w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
              errors.date ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.date && (
            <p className="mt-1 text-sm text-red-500">{errors.date}</p>
          )}
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
            value={formData.time}
            onChange={handleChange}
            className={`mt-1 block w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
              errors.time ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Select time</option>
            {timeSlots.map(slot => (
              <option key={slot.value} value={slot.value}>
                {slot.label}
              </option>
            ))}
          </select>
          {errors.time && (
            <p className="mt-1 text-sm text-red-500">{errors.time}</p>
          )}
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
            value={formData.wasteType}
            onChange={handleChange}
            className={`mt-1 block w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
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
          <label className="block text-sm font-medium text-gray-700">
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
            className={`mt-1 block w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
              errors.address ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.address && (
            <p className="mt-1 text-sm text-red-500">{errors.address}</p>
          )}
        </div>

        <div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Request'}
          </button>
        </div>
      </form>
    </div>
  );
}