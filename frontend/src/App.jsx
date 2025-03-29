import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { WasteRequestProvider } from './contexts/WasteRequestContext';
import ErrorBoundary from './components/ErrorBoundary';
import WasteRequestErrorBoundary from './components/WasteRequestErrorBoundary';
import { AppRoutes } from './routes';

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <WasteRequestErrorBoundary>
            <WasteRequestProvider>
              <AppRoutes />
            </WasteRequestProvider>
          </WasteRequestErrorBoundary>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;