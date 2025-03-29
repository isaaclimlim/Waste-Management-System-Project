import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

class WasteRequestErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    console.error('WasteRequest Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-center mb-4">
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
            Error Loading Waste Requests
          </h3>
          <p className="text-gray-600 text-center mb-4">
            There was a problem loading the waste requests. Please try refreshing the data.
          </p>
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-600">
              {this.state.error && this.state.error.toString()}
            </div>
          )}
          <div className="flex justify-center mt-4">
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Data
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default WasteRequestErrorBoundary; 