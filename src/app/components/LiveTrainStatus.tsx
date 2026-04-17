import { useState, useEffect } from 'react';
import { Clock, AlertTriangle, Users } from 'lucide-react';
import { apiUrl } from '../config/api';

interface TrainArrival {
  trainId: string;
  lineId: string;
  lineName: string;
  arrivalTime: number;
  delay: number;
  crowding: 'low' | 'medium' | 'high';
  platform: string;
  status: 'on-time' | 'minor-delay' | 'delayed';
}

interface LiveStatusProps {
  stationId: string;
  lineId?: string;
}

export function LiveTrainStatus({ stationId, lineId }: LiveStatusProps) {
  const [arrivals, setArrivals] = useState<TrainArrival[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const fetchArrivals = async () => {
    try {
      const url = `/realtime/arrivals/${stationId}${lineId ? `?lineId=${lineId}` : ''}`;
      const response = await fetch(apiUrl(url));
      
      if (response.ok) {
        const data = await response.json();
        setArrivals(data.arrivals || []);
        setLastUpdated(data.lastUpdated);
      }
    } catch (error) {
      console.error('Failed to fetch arrivals:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArrivals();
    
    // Update every 30 seconds
    const interval = setInterval(fetchArrivals, 30000);
    return () => clearInterval(interval);
  }, [stationId, lineId]);

  const getMinutesUntilArrival = (arrivalTime: number): number => {
    return Math.max(0, Math.ceil((arrivalTime - Date.now()) / (1000 * 60)));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-time': return 'text-green-600 bg-green-50';
      case 'minor-delay': return 'text-yellow-600 bg-yellow-50';
      case 'delayed': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getCrowdingIcon = (crowding: string) => {
    const baseClasses = "w-4 h-4";
    switch (crowding) {
      case 'low': return <Users className={`${baseClasses} text-green-600`} />;
      case 'medium': return <Users className={`${baseClasses} text-yellow-600`} />;
      case 'high': return <Users className={`${baseClasses} text-red-600`} />;
      default: return <Users className={`${baseClasses} text-gray-600`} />;
    }
  };

  const getCrowdingText = (crowding: string) => {
    switch (crowding) {
      case 'low': return 'Seats available';
      case 'medium': return 'Standing room';
      case 'high': return 'Crowded';
      default: return 'Unknown';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-4 animate-pulse">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="w-5 h-5 text-gray-400" />
          <div className="h-5 bg-gray-200 rounded w-32"></div>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex justify-between items-center">
              <div className="h-4 bg-gray-200 rounded w-40"></div>
              <div className="h-4 bg-gray-200 rounded w-20"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-4 border-b bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900">Next Arrivals</h3>
          </div>
          {lastUpdated && (
            <span className="text-xs text-gray-500">
              Updated {new Date(lastUpdated).toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      <div className="p-4">
        {arrivals.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No trains approaching</p>
          </div>
        ) : (
          <div className="space-y-3">
            {arrivals.map((arrival) => {
              const minutes = getMinutesUntilArrival(arrival.arrivalTime);
              const isImminent = minutes <= 1;
              
              return (
                <div key={arrival.trainId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-900">
                        {arrival.lineName}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(arrival.status)}`}>
                        {arrival.status === 'on-time' ? 'On time' : 
                         arrival.status === 'minor-delay' ? `${arrival.delay}m delay` :
                         `${arrival.delay}m delayed`}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>Platform {arrival.platform}</span>
                      <div className="flex items-center gap-1">
                        {getCrowdingIcon(arrival.crowding)}
                        <span>{getCrowdingText(arrival.crowding)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className={`text-lg font-bold ${
                      isImminent ? 'text-orange-600' : 
                      minutes <= 5 ? 'text-blue-600' : 'text-gray-900'
                    }`}>
                      {isImminent ? 'Now' : `${minutes} min`}
                    </div>
                    {arrival.delay > 0 && (
                      <div className="flex items-center gap-1 text-xs text-red-600">
                        <AlertTriangle className="w-3 h-3" />
                        Delayed
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}