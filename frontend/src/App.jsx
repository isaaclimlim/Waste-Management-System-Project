import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { WasteRequestProvider } from './contexts/WasteRequestContext';
import { AppRoutes } from './routes';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <WasteRequestProvider>
          <AppRoutes />
        </WasteRequestProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;