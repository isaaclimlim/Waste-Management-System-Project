import React from 'react';
import { RequestStatusSummary } from '../components/RequestStatusSummary';
import { RequestsList } from '../components/RequestsList';
import { useAuth } from '../contexts/AuthContext';

export function ResidentHome() {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Welcome back, {user?.name}!</h1>
        <RequestStatusSummary />
      </div>
      
      <div>
        <RequestsList />
      </div>
    </div>
  );
} 