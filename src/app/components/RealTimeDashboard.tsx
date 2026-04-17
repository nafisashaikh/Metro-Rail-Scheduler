import React, { useState, useEffect } from 'react';
import { Loader2, Wifi, WifiOff, AlertTriangle, Clock, Users, MapPin } from 'lucide-react';
import { API_BASE_URL } from '../config/api';

interface RealTimeArrival {
  trainId: string;
  lineId: string;
  lineName: string;
  destination: string;
  arrivalTime: number;
  delay: number;
  platform: string;
  crowding: 'low' | 'medium' | 'high';
  status: 'on-time' | 'minor-delay' | 'delayed';
  vehicleId?: string;
  occupancyStatus?: string;
}

interface ServiceAlert {
  id: string;
  severity: 'low' | 'medium' | 'high';
  type: string;
  title: string;
  message: string;
  cause?: string;
  effect?: string;
  affectedLines?: string[];
  startTime: number;
  estimatedEndTime?: number;
}

interface RealTimeDashboardProps {
  stationId: string;
  stationName: string;
  lineId?: string;
}

const RealTimeDashboard: React.FC<RealTimeDashboardProps> = ({ 
  stationId, 
  stationName, 
  lineId 
}) => {
  const [arrivals, setArrivals] = useState<RealTimeArrival[]>([]);
  const [alerts, setAlerts] = useState<ServiceAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [dataSource, setDataSource] = useState<'mock' | 'gtfs' | 'hybrid'>('mock');

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const query = lineId ? `?lineId=${lineId}` : '';
        const gtfsUrl = `${API_BASE_URL}/api/realtime-gtfs/arrivals/${stationId}${query}`;
        const mockUrl = `${API_BASE_URL}/realtime/arrivals/${stationId}${query}`;

        let nextDataSource: 'mock' | 'gtfs' | 'hybrid' = 'mock';
        let gtfsErrorMessage = '';
        let gtfsArrivals: RealTimeArrival[] = [];
        let mockArrivals: RealTimeArrival[] = [];

        // Try GTFS first, then degrade gracefully if feed is unavailable or empty.
        try {
          const gtfsResponse = await fetch(gtfsUrl);
          if (!gtfsResponse.ok) {
            throw new Error(`GTFS API failed: ${gtfsResponse.status}`);
          }

          const gtfsData = await gtfsResponse.json() as { arrivals?: RealTimeArrival[] };
          gtfsArrivals = Array.isArray(gtfsData.arrivals) ? gtfsData.arrivals : [];
        } catch (error) {
          gtfsErrorMessage = error instanceof Error ? error.message : 'Unknown GTFS API error';
        }

        if (gtfsArrivals.length > 0) {
          nextDataSource = 'gtfs';
        } else {
          try {
            const mockResponse = await fetch(mockUrl);
            if (!mockResponse.ok) {
              throw new Error(`Mock API failed: ${mockResponse.status}`);
            }

            const mockData = await mockResponse.json() as { arrivals?: RealTimeArrival[] };
            mockArrivals = Array.isArray(mockData.arrivals) ? mockData.arrivals : [];
          } catch (error) {
            const mockErrorMessage = error instanceof Error ? error.message : 'Unknown Mock API error';
            const gtfsPart = gtfsErrorMessage || 'GTFS API returned no arrivals';
            throw new Error(`Real-time APIs failed: GTFS (${gtfsPart}), Mock (${mockErrorMessage})`);
          }

          nextDataSource = gtfsErrorMessage ? 'mock' : 'hybrid';
        }

        setDataSource(nextDataSource);
        setArrivals(gtfsArrivals.length > 0 ? gtfsArrivals : mockArrivals);
        setLastUpdated(new Date());

        // Fetch alerts
        try {
          const alertUrls = nextDataSource === 'gtfs'
            ? [`${API_BASE_URL}/api/realtime-gtfs/alerts`]
            : nextDataSource === 'mock'
              ? [`${API_BASE_URL}/realtime/alerts`]
              : [`${API_BASE_URL}/api/realtime-gtfs/alerts`, `${API_BASE_URL}/realtime/alerts`];

          const alertResults = await Promise.allSettled(
            alertUrls.map((url) => fetch(url))
          );

          const mergedAlerts: ServiceAlert[] = [];
          for (const result of alertResults) {
            if (result.status !== 'fulfilled' || !result.value.ok) {
              continue;
            }

            const alertData = await result.value.json() as { alerts?: ServiceAlert[] };
            if (Array.isArray(alertData.alerts)) {
              mergedAlerts.push(...alertData.alerts);
            }
          }

          const dedupedAlerts = Array.from(new Map(mergedAlerts.map((alert) => [alert.id, alert])).values());
          setAlerts(dedupedAlerts);
        } catch (alertError) {
          console.warn('Failed to fetch alerts:', alertError);
        }

      } catch (error) {
        console.error('Failed to fetch real-time data:', error);
        const message = error instanceof Error ? error.message : 'Failed to fetch real-time data';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [stationId, lineId]);

  // Network status monitoring
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const formatTimeUntilArrival = (arrivalTime: number): string => {
    const now = Date.now();
    const minutes = Math.floor((arrivalTime - now) / 60000);
    
    if (minutes < 0) return 'Departed';
    if (minutes === 0) return 'Now';
    if (minutes === 1) return '1 min';
    return `${minutes} mins`;
  };

  const getCrowdingColor = (level: string): string => {
    switch (level) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getCrowdingLabel = (level: string): string => {
    switch (level) {
      case 'low': return 'Comfortable';
      case 'medium': return 'Moderate';
      case 'high': return 'Crowded';
      default: return 'Unknown';
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'on-time': return 'text-green-600';
      case 'minor-delay': return 'text-yellow-600';
      case 'delayed': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getAlertSeverityColor = (severity: string): string => {
    switch (severity) {
      case 'low': return 'border-blue-200 bg-blue-50';
      case 'medium': return 'border-yellow-200 bg-yellow-50';
      case 'high': return 'border-red-200 bg-red-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <MapPin className="h-6 w-6" />
              {stationName}
            </h1>
            <p className="text-gray-600 mt-1">Station ID: {stationId}</p>
            {lineId && <p className="text-sm text-blue-600">Line: {lineId}</p>}
          </div>
          
          <div className="flex items-center gap-4">
            {/* Data source indicator */}
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${
                dataSource === 'gtfs' ? 'bg-green-500' : 
                dataSource === 'mock' ? 'bg-yellow-500' : 'bg-gray-500'
              }`} />
              <span className="text-sm text-gray-600">
                {dataSource === 'gtfs' ? 'Real GTFS Data' : 
                 dataSource === 'mock' ? 'Mock Data' : 'Hybrid'}
              </span>
            </div>
            
            {/* Network status */}
            <div className="flex items-center gap-2">
              {isOnline ? (
                <Wifi className="h-5 w-5 text-green-600" />
              ) : (
                <WifiOff className="h-5 w-5 text-red-600" />
              )}
              <span className="text-sm text-gray-600">
                {isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
            
            {/* Last updated */}
            {lastUpdated && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Clock className="h-4 w-4" />
                Updated {lastUpdated.toLocaleTimeString()}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Service Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            Service Alerts
          </h2>
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`border rounded-lg p-4 ${getAlertSeverityColor(alert.severity)}`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-gray-900">{alert.title}</h3>
                  <p className="text-sm text-gray-700 mt-1">{alert.message}</p>
                  {alert.affectedLines && alert.affectedLines.length > 0 && (
                    <div className="flex gap-1 mt-2">
                      {alert.affectedLines.map((line) => (
                        <span
                          key={line}
                          className="px-2 py-1 bg-white rounded text-xs font-medium"
                        >
                          {line}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  alert.severity === 'high' ? 'bg-red-100 text-red-800' :
                  alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {alert.severity.toUpperCase()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Real-time Arrivals */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Next Arrivals</h2>
            {loading && (
              <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
            )}
          </div>
        </div>
        
        <div className="divide-y">
          {loading && arrivals.length === 0 ? (
            <div className="p-8 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Loading real-time data...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <AlertTriangle className="h-8 w-8 text-red-600 mx-auto mb-4" />
              <p className="text-red-600 font-medium">Failed to load data</p>
              <p className="text-sm text-gray-600 mt-2">{error}</p>
            </div>
          ) : arrivals.length === 0 ? (
            <div className="p-8 text-center text-gray-600">
              <Clock className="h-8 w-8 mx-auto mb-4" />
              <p>No upcoming arrivals</p>
            </div>
          ) : (
            arrivals.map((arrival) => (
              <div key={arrival.trainId} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-3 h-3 bg-blue-600 rounded-full" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <span className="font-medium text-gray-900">
                            {arrival.lineName}
                          </span>
                          <span className="text-gray-600">→</span>
                          <span className="text-gray-900">{arrival.destination}</span>
                        </div>
                        
                        <div className="flex items-center gap-4 mt-1 text-sm">
                          <span className="text-gray-600">
                            Platform {arrival.platform}
                          </span>
                          
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span className={getCrowdingColor(arrival.crowding)}>
                              {getCrowdingLabel(arrival.crowding)}
                            </span>
                          </div>
                          
                          <span className={getStatusColor(arrival.status)}>
                            {arrival.status.replace('-', ' ').toUpperCase()}
                            {arrival.delay > 0 && ` (+${arrival.delay}m)`}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right ml-4">
                    <div className="text-2xl font-bold text-gray-900">
                      {formatTimeUntilArrival(arrival.arrivalTime)}
                    </div>
                    <div className="text-sm text-gray-600">
                      {new Date(arrival.arrivalTime).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      
      {!isOnline && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <WifiOff className="h-5 w-5 text-yellow-600" />
            <span className="text-yellow-800 font-medium">
              You&apos;re offline - showing last cached data
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default RealTimeDashboard;