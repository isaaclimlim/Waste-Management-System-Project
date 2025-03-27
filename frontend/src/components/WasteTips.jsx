import React, { useState, useEffect } from 'react';
import { api } from '../lib/axios';
import { Leaf, Recycle, Trash2 } from 'lucide-react';

export function WasteTips() {
  const [tips, setTips] = useState({
    biodegradable: [],
    'non-biodegradable': [],
    recyclable: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTips = async () => {
      try {
        const response = await api.get('/waste-tips');
        if (response.data.success) {
          setTips(response.data.data);
        } else {
          setError('Failed to fetch waste tips');
        }
      } catch (err) {
        setError('An error occurred while fetching waste tips');
        console.error('Error fetching waste tips:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTips();
  }, []);

  const renderTipsSection = (category, icon, title) => (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center mb-4">
        {icon}
        <h2 className="text-2xl font-semibold text-gray-800 ml-2">{title}</h2>
      </div>
      <div className="space-y-4">
        {tips[category]?.map((tip, index) => (
          <div
            key={index}
            className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
          >
            <p className="text-gray-700">{tip.content}</p>
          </div>
        ))}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-4">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
        Waste Management Tips
      </h1>
      
      <div className="grid gap-6">
        {renderTipsSection(
          'biodegradable',
          <Leaf className="h-8 w-8 text-green-500" />,
          'Biodegradable Waste'
        )}
        
        {renderTipsSection(
          'non-biodegradable',
          <Trash2 className="h-8 w-8 text-red-500" />,
          'Non-Biodegradable Waste'
        )}
        
        {renderTipsSection(
          'recyclable',
          <Recycle className="h-8 w-8 text-blue-500" />,
          'Recyclable Waste'
        )}
      </div>
    </div>
  );
} 