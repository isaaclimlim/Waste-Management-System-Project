import { useContext } from 'react';
import { WasteRequestContext } from '../contexts/WasteRequestContext';

export function useWasteRequest() {
  const context = useContext(WasteRequestContext);
  if (!context) {
    throw new Error('useWasteRequest must be used within a WasteRequestProvider');
  }
  return context;
} 