import { useState, useEffect, useCallback } from 'react';

interface CacheInfo {
  [cacheName: string]: number;
}

interface OfflineData {
  isOnline: boolean;
  isServiceWorkerSupported: boolean;
  isServiceWorkerRegistered: boolean;
  lastOnline: Date | null;
  cacheInfo: CacheInfo | null;
  cacheSize: number;
}

interface UseOfflineModeReturn extends OfflineData {
  registerServiceWorker: () => Promise<boolean>;
  clearCache: () => Promise<boolean>;
  getCacheInfo: () => Promise<CacheInfo>;
  cacheScheduleData: (data: unknown) => Promise<boolean>;
  isDataStale: (timestamp: number, maxAge?: number) => boolean;
}

const useOfflineMode = (): UseOfflineModeReturn => {
  const [offlineData, setOfflineData] = useState<OfflineData>({
    isOnline: navigator.onLine,
    isServiceWorkerSupported: 'serviceWorker' in navigator,
    isServiceWorkerRegistered: false,
    lastOnline: navigator.onLine ? new Date() : null,
    cacheInfo: null,
    cacheSize: 0
  });

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setOfflineData(prev => ({
        ...prev,
        isOnline: true,
        lastOnline: new Date()
      }));
    };

    const handleOffline = () => {
      setOfflineData(prev => ({
        ...prev,
        isOnline: false
      }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Register service worker
  const registerServiceWorker = useCallback(async (): Promise<boolean> => {
    if (!offlineData.isServiceWorkerSupported) {
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      
      setOfflineData(prev => ({
        ...prev,
        isServiceWorkerRegistered: true
      }));

      // Listen for SW updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        
        newWorker?.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // Could show update notification here
          }
        });
      });

      return true;
    } catch {
      return false;
    }
  }, [offlineData.isServiceWorkerSupported]);

  // Clear all caches
  const clearCache = useCallback(async (): Promise<boolean> => {
    if (!navigator.serviceWorker.controller) {
      return false;
    }

    try {
      const messageChannel = new MessageChannel();
      
      const response = await new Promise<boolean>((resolve) => {
        messageChannel.port1.onmessage = (event) => {
          resolve(event.data.success);
        };
        
        navigator.serviceWorker.controller!.postMessage(
          { action: 'CLEAR_CACHE' },
          [messageChannel.port2]
        );
      });

      if (response) {
        setOfflineData(prev => ({
          ...prev,
          cacheInfo: null,
          cacheSize: 0
        }));
      }

      return response;
    } catch {
      return false;
    }
  }, []);

  // Get cache information
  const getCacheInfo = useCallback(async (): Promise<CacheInfo> => {
    if (!navigator.serviceWorker.controller) {
      return {};
    }

    try {
      const messageChannel = new MessageChannel();
      
      const cacheInfo = await new Promise<CacheInfo>((resolve) => {
        messageChannel.port1.onmessage = (event) => {
          resolve(event.data.cacheInfo || {});
        };
        
        navigator.serviceWorker.controller!.postMessage(
          { action: 'GET_CACHE_INFO' },
          [messageChannel.port2]
        );
      });

      const totalSize = Object.values(cacheInfo).reduce((sum, count) => sum + count, 0);
      
      setOfflineData(prev => ({
        ...prev,
        cacheInfo,
        cacheSize: totalSize
      }));

      return cacheInfo;
    } catch {
      return {};
    }
  }, []);

  // Cache schedule data
  const cacheScheduleData = useCallback(async (data: unknown): Promise<boolean> => {
    if (!navigator.serviceWorker.controller) {
      return false;
    }

    try {
      const messageChannel = new MessageChannel();
      
      const response = await new Promise<boolean>((resolve) => {
        messageChannel.port1.onmessage = (event) => {
          resolve(event.data.success);
        };
        
        navigator.serviceWorker.controller!.postMessage(
          { action: 'CACHE_SCHEDULES', data },
          [messageChannel.port2]
        );
      });

      return response;
    } catch {
      return false;
    }
  }, []);

  // Check if data is stale
  const isDataStale = useCallback((timestamp: number, maxAge: number = 30 * 60 * 1000): boolean => {
    return Date.now() - timestamp > maxAge;
  }, []);

  // Auto-register service worker on mount
  useEffect(() => {
    if (offlineData.isServiceWorkerSupported && !offlineData.isServiceWorkerRegistered) {
      registerServiceWorker();
    }
  }, [offlineData.isServiceWorkerSupported, offlineData.isServiceWorkerRegistered, registerServiceWorker]);

  // Periodically update cache info
  useEffect(() => {
    if (offlineData.isServiceWorkerRegistered) {
      getCacheInfo();
      
      const interval = setInterval(() => {
        getCacheInfo();
      }, 5 * 60 * 1000); // Update every 5 minutes

      return () => clearInterval(interval);
    }
  }, [offlineData.isServiceWorkerRegistered, getCacheInfo]);

  return {
    ...offlineData,
    registerServiceWorker,
    clearCache,
    getCacheInfo,
    cacheScheduleData,
    isDataStale
  };
};

export default useOfflineMode;

// Utility functions for offline handling

export const formatCacheAge = (timestamp: number): string => {
  const ageMs = Date.now() - timestamp;
  const ageMinutes = Math.floor(ageMs / (60 * 1000));
  const ageHours = Math.floor(ageMinutes / 60);
  const ageDays = Math.floor(ageHours / 24);

  if (ageDays > 0) return `${ageDays} day${ageDays > 1 ? 's' : ''} ago`;
  if (ageHours > 0) return `${ageHours} hour${ageHours > 1 ? 's' : ''} ago`;
  if (ageMinutes > 0) return `${ageMinutes} minute${ageMinutes > 1 ? 's' : ''} ago`;
  return 'Just now';
};

export const getCacheStatus = (
  isOnline: boolean, 
  timestamp?: number, 
  maxAge: number = 30 * 60 * 1000
): 'online' | 'cached' | 'stale' | 'offline' => {
  if (isOnline && !timestamp) return 'online';
  if (isOnline && timestamp && Date.now() - timestamp < maxAge) return 'cached';
  if (timestamp && Date.now() - timestamp >= maxAge) return 'stale';
  return 'offline';
};

export const shouldShowOfflineWarning = (
  isOnline: boolean,
  hasCache: boolean,
  cacheAge?: number,
  maxAge: number = 30 * 60 * 1000
): boolean => {
  if (isOnline) return false;
  if (!hasCache) return true;
  return cacheAge ? cacheAge > maxAge : true;
};