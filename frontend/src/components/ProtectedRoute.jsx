import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, token } = useAuth();
  const location = useLocation();

  if (!token) {
    // Redirect to login but save the attempted location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    // Redirect to home if user's role is not allowed
    return <Navigate to="/" replace />;
  }

  return children;
} 