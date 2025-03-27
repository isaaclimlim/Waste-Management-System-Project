import React from 'react';
import { Clock, CheckCircle2, XCircle, AlertCircle, Trash2 } from 'lucide-react';
import { useWasteRequest } from '../contexts/WasteRequestContext';

export function RequestStatusSummary() {
  const { statusCounts, isLoading, error } = useWasteRequest();

  const statusConfig = [
    {
      status: 'pending',
      label: 'Pending',
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    {
      status: 'accepted',
      label: 'Accepted',
      icon: CheckCircle2,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      status: 'rejected',
      label: 'Rejected',
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      status: 'completed',
      label: 'Completed',
      icon: CheckCircle2,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      status: 'cancelled',
      label: 'Cancelled',
      icon: Trash2,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50'
    }
  ];

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-lg shadow-sm">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
      {statusConfig.map(({ status, label, icon: Icon, color, bgColor }) => (
        <div key={status} className={`${bgColor} p-4 rounded-lg shadow-sm`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">{label}</span>
            <Icon className={`h-5 w-5 ${color}`} />
          </div>
          <p className="text-2xl font-semibold text-gray-900">
            {isLoading && !statusCounts[status] ? (
              <span className="inline-block h-8 w-8 animate-pulse bg-gray-200 rounded"></span>
            ) : (
              statusCounts[status] || 0
            )}
          </p>
        </div>
      ))}
    </div>
  );
} 