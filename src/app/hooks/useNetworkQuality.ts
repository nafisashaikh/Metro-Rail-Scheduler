import { useState, useEffect } from 'react';

export type NetworkQuality = 'high' | 'low';

interface ConnectionInfo {
  effectiveType?: string;
  saveData?: boolean;
  addEventListener?: (event: 'change', listener: () => void) => void;
  removeEventListener?: (event: 'change', listener: () => void) => void;
}

export function useNetworkQuality() {
  const [quality, setQuality] = useState<NetworkQuality>('high');

  useEffect(() => {
    const connection = (navigator as Navigator & { connection?: ConnectionInfo }).connection;

    const checkNetwork = () => {
      if (connection) {
        // If effective speed is 2g or 3g, or saveData is enabled
        if (
          connection.effectiveType === '2g' ||
          connection.effectiveType === '3g' ||
          connection.saveData === true
        ) {
          setQuality('low');
        } else {
          setQuality('high');
        }
      }
    };

    checkNetwork();

    // Monitor changes
    if (connection?.addEventListener) {
      connection.addEventListener('change', checkNetwork);
      return () => {
        connection.removeEventListener?.('change', checkNetwork);
      };
    }
  }, []);

  return quality;
}
