import React from 'react';
import { useWasteRequest } from '../hooks/useWasteRequest';
import { Clock, CheckCircle2, AlertCircle, XCircle } from 'lucide-react';

export function RequestStatusSummary() {
  const { statusCounts } = useWasteRequest();

  const statuses = [
    {
      title: 'Pending',
      count: statusCounts.pending,
      icon: Clock,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-50'
    },
    {
      title: 'In Progress',
      count: statusCounts.in_progress,
      icon: AlertCircle,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Completed',
      count: statusCounts.completed,
      icon: CheckCircle2,
      color: 'text-green-500',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Cancelled',
      count: statusCounts.cancelled,
      icon: XCircle,
      color: 'text-red-500',
      bgColor: 'bg-red-50'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statuses.map((status) => (
        <div
          key={status.title}
          className={`${status.bgColor} p-4 rounded-lg shadow-sm`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{status.title}</p>
              <p className="text-2xl font-semibold text-gray-900">{status.count}</p>
            </div>
            <status.icon className={`h-8 w-8 ${status.color}`} />
          </div>
        </div>
      ))}
    </div>
  );
} 