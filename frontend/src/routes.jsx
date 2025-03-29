import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ResidentDashboard } from './pages/ResidentDashboard';
import { LearnMorePage } from './pages/LearnMore';
import { RegisterPage } from './pages/Register';
import { LoginPage } from './pages/Login';
import { BusinessDashboard } from './pages/BusinessDashboard';
import { CollectorDashboard } from './pages/CollectorDashboard';
import { Home } from './pages/Home';
import { RequestPickup } from './pages/RequestPickup';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ResidentHome } from './pages/ResidentHome';
import { WasteTips } from './components/WasteTips';
import { CollectorProfile } from './pages/collector/CollectorProfile';
import { CollectorSettings } from './pages/collector/CollectorSettings';
import { CollectorAnalytics } from './pages/collector/CollectorAnalytics';
import { CollectorHistory } from './pages/collector/CollectorHistory';

export function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/learn-more" element={<LearnMorePage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/waste-tips" element={<WasteTips />} />
      
      {/* Resident routes */}
      <Route
        path="/resident"
        element={
          <ProtectedRoute allowedRoles={['resident']}>
            <ResidentDashboard />
          </ProtectedRoute>
        }
      >
        <Route index element={<ResidentHome />} />
        <Route path="request" element={<RequestPickup />} />
        <Route path="track" element={<div>Track Request Page</div>} />
        <Route path="tips" element={<WasteTips />} />
        <Route path="history" element={<div>History Page</div>} />
      </Route>

      {/* Business routes */}
      <Route
        path="/business"
        element={
          <ProtectedRoute allowedRoles={['business']}>
            <BusinessDashboard />
          </ProtectedRoute>
        }
      >
        <Route index element={<div>Business Dashboard</div>} />
        <Route path="schedule" element={<div>Schedule Page</div>} />
        <Route path="history" element={<div>History Page</div>} />
        <Route path="settings" element={<div>Settings Page</div>} />
      </Route>

      {/* Collector routes */}
      <Route
        path="/collector"
        element={
          <ProtectedRoute allowedRoles={['collector']}>
            <CollectorDashboard />
          </ProtectedRoute>
        }
      >
        <Route index element={<div>Collector Dashboard</div>} />
        <Route path="routes" element={<div>Routes Page</div>} />
        <Route path="history" element={<CollectorHistory />} />
        <Route path="analytics" element={<CollectorAnalytics />} />
        <Route path="profile" element={<CollectorProfile />} />
        <Route path="settings" element={<CollectorSettings />} />
      </Route>
    </Routes>
  );
} 