import { useState } from 'react';
import { ArrowRight, Clock, Heart, Search } from 'lucide-react';
import { LiveTrainStatus } from './LiveTrainStatus';
import { SavedRoutes, useSavedRoutes, type SavedRoute } from './SavedRoutes';

interface StationOption {
  id: string;
  name: string;
  lineId: string;
}

interface PlannedRoute {
  fromStation: StationOption;
  toStation: StationOption;
  lineId: string;
  lineName: string;
  duration: number;
  distance: string;
  stopsCount: number;
  crowdingLevel: string;
}

// Simple station list for demo
const stations: StationOption[] = [
  { id: 'ameerpet', name: 'Ameerpet', lineId: 'redline' },
  { id: 'begumpet', name: 'Begumpet', lineId: 'redline' },
  { id: 'rasoolpura', name: 'Rasoolpura', lineId: 'redline' },
  { id: 'prakashnagar', name: 'Prakash Nagar', lineId: 'redline' },
  { id: 'kphb', name: 'KPHB Colony', lineId: 'redline' },
  { id: 'miyapur', name: 'Miyapur', lineId: 'redline' },
  { id: 'jubileehills', name: 'Jubilee Hills', lineId: 'greenline' },
  { id: 'madhapur', name: 'Madhapur', lineId: 'greenline' },
  { id: 'hitechcity', name: 'Hitech City', lineId: 'greenline' },
];

export function SimpleJourneyPlanner() {
  const [fromStation, setFromStation] = useState('');
  const [toStation, setToStation] = useState('');
  const [selectedRoute, setSelectedRoute] = useState<PlannedRoute | null>(null);
  const [showLiveStatus, setShowLiveStatus] = useState(false);
  const { addRoute } = useSavedRoutes();

  const buildRouteInfo = (fromStationData: StationOption, toStationData: StationOption): PlannedRoute => ({
    fromStation: fromStationData,
    toStation: toStationData,
    lineId: fromStationData.lineId,
    lineName: fromStationData.lineId === 'redline' ? 'Red Line' : 'Green Line',
    duration: Math.floor(Math.random() * 20) + 15,
    distance: '12.5 km',
    stopsCount: Math.abs(stations.indexOf(fromStationData) - stations.indexOf(toStationData)),
    crowdingLevel: 'Medium crowding expected'
  });

  const planRoute = () => {
    if (!fromStation || !toStation || fromStation === toStation) {
      alert('Please select different from and to stations');
      return;
    }

    const fromStationData = stations.find(s => s.id === fromStation);
    const toStationData = stations.find(s => s.id === toStation);

    if (!fromStationData || !toStationData) {
      alert('Invalid station selection');
      return;
    }

    const routeInfo = buildRouteInfo(fromStationData, toStationData);

    setSelectedRoute(routeInfo);
    setShowLiveStatus(true);
  };

  const handleSaveRoute = () => {
    if (selectedRoute) {
      const success = addRoute(
        selectedRoute.fromStation,
        selectedRoute.toStation,
        selectedRoute.lineId,
        selectedRoute.lineName
      );
      
      if (success) {
        alert('Route saved successfully!');
      } else {
        alert('Route already saved');
      }
    }
  };

  const handleSavedRouteSelect = (route: SavedRoute) => {
    const fromStationData = stations.find((station) => station.id === route.fromStation.id);
    const toStationData = stations.find((station) => station.id === route.toStation.id);

    if (!fromStationData || !toStationData) {
      alert('Saved route uses station data that is no longer available');
      return;
    }

    setFromStation(fromStationData.id);
    setToStation(toStationData.id);
    setSelectedRoute(buildRouteInfo(fromStationData, toStationData));
    setShowLiveStatus(true);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-4">
      {/* Saved Routes Section */}
      <SavedRoutes onRouteSelect={handleSavedRouteSelect} />

      {/* Journey Planning Form */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Search className="w-6 h-6 text-blue-600" />
          Plan Your Journey
        </h2>

        <div className="grid md:grid-cols-2 gap-4">
          {/* From Station */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              From Station
            </label>
            <select
              value={fromStation}
              onChange={(e) => setFromStation(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select departure station</option>
              {stations.map(station => (
                <option key={station.id} value={station.id}>
                  {station.name}
                </option>
              ))}
            </select>
          </div>

          {/* To Station */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              To Station
            </label>
            <select
              value={toStation}
              onChange={(e) => setToStation(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select destination station</option>
              {stations.map(station => (
                <option key={station.id} value={station.id}>
                  {station.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={planRoute}
          disabled={!fromStation || !toStation}
          className="mt-4 w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <ArrowRight className="w-5 h-5" />
          Find Best Route
        </button>

        {selectedRoute && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Recommended Route</h3>
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <Clock className="w-4 h-4" />
                  <span>{selectedRoute.duration} minutes</span>
                  <span>•</span>
                  <span>{selectedRoute.distance}</span>
                  <span>•</span>
                  <span>{selectedRoute.stopsCount} stops</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                    {selectedRoute.lineName}
                  </span>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {selectedRoute.fromStation.name} → {selectedRoute.toStation.name}
                  </span>
                </div>
              </div>
              <button
                onClick={handleSaveRoute}
                className="flex items-center gap-1 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-200"
              >
                <Heart className="w-4 h-4" />
                Save Route
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Live Train Status */}
      {showLiveStatus && selectedRoute && (
        <LiveTrainStatus 
          stationId={fromStation} 
          lineId={selectedRoute.lineId}
        />
      )}
    </div>
  );
}