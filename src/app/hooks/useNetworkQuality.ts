import { useState, useEffect } from 'react';

export type NetworkQuality = 'high' | 'low';

export function useNetworkQuality() {
  const [quality, setQuality] = useState<NetworkQuality>('high');

  useEffect(() => {
    const checkNetwork = () => {
      // @ts-ignore - navigator.connection is not standard in all TS versions but works in Chrome/Edge
      const conn = navigator.connection;
      
      if (conn) {
        // If effective speed is 2g or 3g, or saveData is enabled
        if (
          conn.effectiveType === '2g' || 
          conn.effectiveType === '3g' || 
          conn.saveData === true
        ) {
          setQuality('low');
        } else {
          setQuality('high');
        }
      }
    };

    checkNetwork();

    // Monitor changes
    if ('connection' in navigator) {
      // @ts-ignore
      navigator.connection.addEventListener('change', checkNetwork);
      return () => {
        // @ts-ignore
        navigator.connection.removeEventListener('change', checkNetwork);
      };
    }
  }, []);

  return quality;
}
