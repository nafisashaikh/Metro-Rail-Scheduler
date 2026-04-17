import React, { useState, useEffect } from 'react';
import { Users, Clock, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import { API_BASE_URL } from '../config/api';

interface TrainArrival {
  trainId: string;
  lineId: string;
  lineName: string;
  destination: string;
  arrivalTime: number;
  delay: number;
  platform: string;
  crowding: 'low' | 'medium' | 'high';
  crowdingLabel?: string;
  crowdingConfidence?: number;
  crowdingSuggestion?: string;
  historicalPattern?: string;
}

interface CrowdingInsightsPanelProps {
  stationId: string;
  stationName: string;
  lineId?: string;
}

const CrowdingInsightsPanel: React.FC<CrowdingInsightsPanelProps> = ({
  stationId,
  stationName,
  lineId
}) => {
  const [arrivals, setArrivals] = useState<TrainArrival[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    const fetchCrowdingData = async () => {
      try {
        setLoading(true);
        setError(null);

        const url = `${API_BASE_URL}/realtime/arrivals/${stationId}${lineId ? `?lineId=${lineId}` : ''}`;
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();
        setArrivals(data.arrivals || []);
        setLastUpdated(new Date());

      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unable to fetch crowding data.';
        setError(message);
        
        // Mock data fallback with enhanced crowding simulation
        const mockArrivals = generateMockCrowdingData();
        setArrivals(mockArrivals);
        setLastUpdated(new Date());
      } finally {
        setLoading(false);
      }
    };

    fetchCrowdingData();
    const interval = setInterval(fetchCrowdingData, 45000); // Refresh every 45 seconds

    return () => clearInterval(interval);
  }, [stationId, lineId]);

  const generateMockCrowdingData = (): TrainArrival[] => {
    const now = Date.now();
    const hour = new Date().getHours();
    
    // Time-based crowding patterns
    const isRushHour = (hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19);
    const isWeekend = new Date().getDay() === 0 || new Date().getDay() === 6;
    
    let baseCrowdingLevel: 'low' | 'medium' | 'high' = 'medium';
    if (isRushHour && !isWeekend) {
      baseCrowdingLevel = Math.random() > 0.3 ? 'high' : 'medium';
    } else if (isWeekend || hour < 7 || hour > 21) {
      baseCrowdingLevel = Math.random() > 0.7 ? 'medium' : 'low';
    }

    const trains = ['BL-101', 'BL-205', 'BL-318'];
    
    return trains.map((trainId, index) => {
      const arrivalMinutes = (index + 1) * 4 + Math.random() * 3;
      const crowdingVariation = Math.random() - 0.5; // -0.5 to +0.5
      
      let crowdingLevel = baseCrowdingLevel;
      if (crowdingVariation > 0.3) {
        crowdingLevel = baseCrowdingLevel === 'low' ? 'medium' : 'high';
      } else if (crowdingVariation < -0.3) {
        crowdingLevel = baseCrowdingLevel === 'high' ? 'medium' : 'low';
      }

      const suggestions = {
        low: undefined,
        medium: isRushHour ? "Standing room available" : undefined,
        high: isRushHour ? 
          "Consider waiting 4-6 minutes for next train" : 
          "Peak time - expect crowded conditions"
      };

      const patterns = {
        low: `${new Date().toLocaleDateString('en-US', { weekday: 'long' })}s at ${hour}:00 typically quiet`,
        medium: `Moderate crowding typical for this time`,
        high: isRushHour ? `Rush hour - usually busy` : `High demand at this station`
      };

      return {
        trainId,
        lineId: 'blue-line',
        lineName: 'Blue Line',
        destination: index % 2 === 0 ? 'Ghatkopar' : 'Versova',
        arrivalTime: now + (arrivalMinutes * 60 * 1000),
        delay: Math.random() > 0.8 ? Math.floor(Math.random() * 5) : 0,
        platform: '1',
        crowding: crowdingLevel,
        crowdingLabel: {
          low: 'Seats Available',
          medium: 'Standing Room',
          high: 'Crowded'
        }[crowdingLevel],
        crowdingConfidence: Math.floor(70 + Math.random() * 25),
        crowdingSuggestion: suggestions[crowdingLevel],
        historicalPattern: patterns[crowdingLevel]
      };
    });
  };

  const getCrowdingIcon = (level: string) => {
    switch (level) {
      case 'low':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'medium':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'high':
        return <Users className="h-4 w-4 text-red-600" />;
      default:
        return <Users className="h-4 w-4 text-gray-600" />;
    }
  };

  const getCrowdingColor = (level: string) => {
    switch (level) {
      case 'low':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'medium':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'high':
        return 'bg-red-50 border-red-200 text-red-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const formatTimeUntilArrival = (arrivalTime: number): string => {
    const now = Date.now();
    const minutes = Math.floor((arrivalTime - now) / 60000);
    
    if (minutes < 0) return 'Departed';
    if (minutes === 0) return 'Now';
    if (minutes === 1) return '1 min';
    return `${minutes} mins`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users className="h-6 w-6 text-blue-600" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Crowding Insights</h2>
              <p className="text-sm text-gray-600">{stationName}</p>
            </div>
          </div>
          
          {lastUpdated && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Clock className="h-4 w-4" />
              Updated {lastUpdated.toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </div>
          )}
        </div>
      </div>

      <div className="p-6 space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading crowding data...</p>
          </div>
        ) : error && arrivals.length === 0 ? (
          <div className="text-center py-8">
            <AlertCircle className="h-8 w-8 text-red-600 mx-auto mb-4" />
            <p className="text-red-600 font-medium">Failed to load data</p>
            <p className="text-sm text-gray-600 mt-2">{error}</p>
          </div>
        ) : (
          <>
            {error && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm text-yellow-800">
                    Using simulated data - backend unavailable
                  </span>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Next Arrivals & Crowding</h3>
              
              {arrivals.map((arrival) => (
                <div
                  key={arrival.trainId}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-medium text-gray-900">
                          {arrival.lineName}
                        </span>
                        <span className="text-gray-600">→</span>
                        <span className="text-gray-900">{arrival.destination}</span>
                        <div className={`flex items-center gap-1 px-2 py-1 rounded-full border text-xs font-medium ${getCrowdingColor(arrival.crowding)}`}>
                          {getCrowdingIcon(arrival.crowding)}
                          {arrival.crowdingLabel}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>Platform {arrival.platform}</span>
                        <span>Train {arrival.trainId}</span>
                        {arrival.crowdingConfidence && (
                          <span className="flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" />
                            {arrival.crowdingConfidence}% confidence
                          </span>
                        )}
                      </div>
                      
                      {arrival.crowdingSuggestion && (
                        <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
                          💡 {arrival.crowdingSuggestion}
                        </div>
                      )}
                      
                      {arrival.historicalPattern && (
                        <div className="mt-2 text-xs text-gray-500">
                          📊 {arrival.historicalPattern}
                        </div>
                      )}
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
                      {arrival.delay > 0 && (
                        <div className="text-xs text-red-600">
                          +{arrival.delay}m delay
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* General Tips */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">💡 Smart Travel Tips</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Peak hours (7-10 AM, 5-8 PM) are typically crowded</li>
                <li>• Weekends are usually 40-60% less crowded</li>
                <li>• First and last cars tend to be less crowded</li>
                <li>• Consider traveling 15-30 minutes earlier during rush hour</li>
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CrowdingInsightsPanel;