import React, { useState } from 'react';
import { useWasteRequest } from '../contexts/WasteRequestContext';
import { Clock, CheckCircle2, XCircle, Trash2 } from 'lucide-react';

export function RequestsList() {
  const { requests, isLoading } = useWasteRequest();
  const [selectedStatus, setSelectedStatus] = useState('all');

  const statusConfig = {
    pending: { icon: Clock, color: 'text-yellow-600', bgColor: 'bg-yellow-50' },
    accepted: { icon: CheckCircle2, color: 'text-green-600', bgColor: 'bg-green-50' },
    rejected: { icon: XCircle, color: 'text-red-600', bgColor: 'bg-red-50' },
    completed: { icon: CheckCircle2, color: 'text-blue-600', bgColor: 'bg-blue-50' },
    cancelled: { icon: Trash2, color: 'text-gray-600', bgColor: 'bg-gray-50' }
  };

  const filteredRequests = selectedStatus === 'all'
    ? requests
    : requests.filter(request => request.status === selectedStatus);

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white p-6 rounded-lg shadow-md">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-900">Collection Requests</h2>
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="p-2 border rounded-md text-sm"
        >
          <option value="all">All Requests</option>
          <option value="pending">Pending</option>
          <option value="accepted">Accepted</option>
          <option value="rejected">Rejected</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No requests found</p>
          </div>
        ) : (
          filteredRequests.map((request) => {
            const StatusIcon = statusConfig[request.status]?.icon;
            return (
              <div
                key={request._id}
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">
                      {request.wasteType.charAt(0).toUpperCase() + request.wasteType.slice(1)} Waste
                    </h3>
                    <p className="text-gray-600">Address: {request.address}</p>
                    <p className="text-gray-600">
                      Date: {new Date(request.date).toLocaleDateString()}
                    </p>
                    <p className="text-gray-600">Time: {request.time}</p>
                  </div>
                  <div className={`flex items-center ${statusConfig[request.status]?.bgColor} px-3 py-1 rounded-full`}>
                    {StatusIcon && <StatusIcon className={`h-4 w-4 mr-1.5 ${statusConfig[request.status]?.color}`} />}
                    <span className={`text-sm font-medium ${statusConfig[request.status]?.color}`}>
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Last updated: {new Date(request.updatedAt).toLocaleString()}
                </p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
} 