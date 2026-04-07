import React, { useState } from 'react';
import { Train, Users, Wifi, Clock, Calendar } from 'lucide-react';
import CrowdingInsightsPanel from './components/CrowdingInsightsPanel';
import OfflineStatusBar from './components/OfflineStatusBar';
import useOfflineMode from './utils/useOfflineMode';

const Day2DemoPage: React.FC = () => {
  const [selectedStation, setSelectedStation] = useState({
    id: 'ameerpet',
    name: 'Ameerpet Metro Station'
  });
  
  const [selectedLine] = useState('blue-line');
  const { isOnline, cacheSize, isServiceWorkerRegistered } = useOfflineMode();

  const stations = [
    { id: 'ameerpet', name: 'Ameerpet Metro Station' },
    { id: 'begumpet', name: 'Begumpet' },
    { id: 'rasoolpura', name: 'Rasoolpura' },
    { id: 'jubileehills', name: 'Jubilee Hills' },
    { id: 'madhapur', name: 'Madhapur' },
    { id: 'hitech_city', name: 'Hi-Tech City' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Train className="h-8 w-8 text-blue-600" />
              <h1 className="ml-2 text-xl font-bold text-gray-900">
                Metro Rail Scheduler
              </h1>
              <span className="ml-3 px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
                DAY 2 DEMO
              </span>
            </div>
            
            {/* Station Selector */}
            <select
              value={selectedStation.id}
              onChange={(e) => {
                const station = stations.find(s => s.id === e.target.value);
                if (station) {
                  setSelectedStation({ id: station.id, name: station.name });
                }
              }}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {stations.map((station) => (
                <option key={station.id} value={station.id}>
                  {station.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

      {/* Day 2 Features Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h2 className="text-2xl font-bold mb-2">🚀 Day 2 Features: Crowding & Offline Mode</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            
            {/* Crowding Features */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <Users className="h-6 w-6" />
                <h3 className="text-lg font-semibold">Smart Crowding Insights</h3>
              </div>
              <ul className="text-sm space-y-1 opacity-90">
                <li>✅ Real-time crowding levels (Low/Medium/High)</li>
                <li>✅ Time-based patterns (Rush hour modeling)</li>
                <li>✅ Smart suggestions (Wait for next train)</li>
                <li>✅ Historical insights (Weekday vs weekend)</li>
                <li>✅ Confidence scores (70-95% accuracy)</li>
              </ul>
            </div>

            {/* Offline Features */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <Wifi className="h-6 w-6" />
                <h3 className="text-lg font-semibold">Offline Mode</h3>
              </div>
              <ul className="text-sm space-y-1 opacity-90">
                <li>✅ Service Worker caching (7 days static, 30 min data)</li>
                <li>✅ Intelligent cache fallbacks</li>
                <li>✅ Offline status indicators</li>
                <li>✅ Cache management tools</li>
                <li>✅ Data freshness tracking</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Status Overview */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-8">
          
          {/* Connection Status */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              {isOnline ? (
                <Wifi className="h-8 w-8 text-green-600" />
              ) : (
                <Wifi className="h-8 w-8 text-red-600" />
              )}
              <div>
                <div className="font-medium text-gray-900">
                  {isOnline ? 'Online' : 'Offline'}
                </div>
                <div className="text-sm text-gray-600">
                  Connection Status
                </div>
              </div>
            </div>
          </div>

          {/* Cache Status */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-blue-600" />
              <div>
                <div className="font-medium text-gray-900">
                  {cacheSize} Items
                </div>
                <div className="text-sm text-gray-600">
                  Cached Data
                </div>
              </div>
            </div>
          </div>

          {/* Service Worker */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-8 w-8 text-purple-600" />
              <div>
                <div className="font-medium text-gray-900">
                  {isServiceWorkerRegistered ? 'Active' : 'Inactive'}
                </div>
                <div className="text-sm text-gray-600">
                  Service Worker
                </div>
              </div>
            </div>
          </div>

          {/* Current Time */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-orange-600" />
              <div>
                <div className="font-medium text-gray-900">
                  {new Date().toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
                <div className="text-sm text-gray-600">
                  Current Time
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Demo Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Crowding Insights - Takes 2/3 width */}
          <div className="lg:col-span-2">
            <CrowdingInsightsPanel
              stationId={selectedStation.id}
              stationName={selectedStation.name}
              lineId={selectedLine}
            />
          </div>

          {/* Offline Status - Takes 1/3 width */}
          <div className="lg:col-span-1">
            <OfflineStatusBar
              lastUpdated={new Date()}
              dataTimestamp={Date.now()}
            />
          </div>
        </div>

        {/* Demo Instructions */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🎮 Try These Demo Features</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Crowding Insights Testing:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Switch between different stations to see varying crowding patterns</li>
                <li>• Notice how rush hour times (7-10 AM, 5-8 PM) show higher crowding</li>
                <li>• Observe smart suggestions for crowded trains</li>
                <li>• Check confidence scores and historical patterns</li>
                <li>• Try different times of day to see pattern changes</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Offline Mode Testing:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Open DevTools → Network → Set to "Offline"</li>
                <li>• Refresh the page and see cached content</li>
                <li>• Notice offline indicators and stale data warnings</li>
                <li>• Try clearing cache and see the difference</li>
                <li>• Go back online to see live data resuming</li>
              </ul>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>💡 Pro Tip:</strong> This demo shows realistic crowding simulation based on actual 
              Mumbai Metro patterns. In production, this would connect to real GTFS-Realtime feeds 
              with actual occupancy data from train sensors and historical ridership analytics.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-sm text-gray-600">
            <p className="mb-2">
              Metro Rail Scheduler - Day 2 MVP: Crowding Intelligence & Offline Resilience
            </p>
            <div className="flex justify-center items-center gap-4 text-xs">
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Crowding AI Active
              </span>
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                Offline Mode Ready
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Real-time Updates
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Day2DemoPage;