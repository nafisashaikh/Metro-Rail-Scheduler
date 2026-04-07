import React, { useState, useEffect } from 'react';
import { Heart, Clock, ArrowRight, Plus, Trash2, MapPin } from 'lucide-react';

interface SavedRoute {
  id: string;
  name: string;
  fromStation: {
    id: string;
    name: string;
  };
  toStation: {
    id: string;
    name: string;
  };
  lineId: string;
  lineName: string;
  createdAt: string;
  lastUsed?: string;
  usageCount: number;
}

interface SavedRoutesProps {
  onRouteSelect?: (route: SavedRoute) => void;
}

export function SavedRoutes({ onRouteSelect }: SavedRoutesProps) {
  const [savedRoutes, setSavedRoutes] = useState<SavedRoute[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    loadSavedRoutes();
  }, []);

  const loadSavedRoutes = () => {
    const saved = localStorage.getItem('metro-saved-routes');
    if (saved) {
      try {
        setSavedRoutes(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to load saved routes:', error);
      }
    }
  };

  const saveSavedRoutes = (routes: SavedRoute[]) => {
    localStorage.setItem('metro-saved-routes', JSON.stringify(routes));
    setSavedRoutes(routes);
  };

  const addRoute = (fromStation: any, toStation: any, lineId: string, lineName: string, customName?: string) => {
    const newRoute: SavedRoute = {
      id: Date.now().toString(),
      name: customName || `${fromStation.name} → ${toStation.name}`,
      fromStation,
      toStation,
      lineId,
      lineName,
      createdAt: new Date().toISOString(),
      usageCount: 0
    };

    const updated = [...savedRoutes, newRoute];
    saveSavedRoutes(updated);
  };

  const deleteRoute = (routeId: string) => {
    const updated = savedRoutes.filter(route => route.id !== routeId);
    saveSavedRoutes(updated);
  };

  const selectRoute = (route: SavedRoute) => {
    // Update usage stats
    const updated = savedRoutes.map(r => 
      r.id === route.id 
        ? { ...r, lastUsed: new Date().toISOString(), usageCount: r.usageCount + 1 }
        : r
    );
    saveSavedRoutes(updated);

    // Call the onSelect handler
    onRouteSelect?.(route);
  };

  const getRouteFrequency = (route: SavedRoute) => {
    if (route.usageCount >= 10) return 'Daily commute';
    if (route.usageCount >= 5) return 'Weekly route';
    if (route.usageCount >= 2) return 'Occasional';
    return 'New route';
  };

  const mostUsedRoutes = savedRoutes
    .sort((a, b) => b.usageCount - a.usageCount)
    .slice(0, 3);

  if (savedRoutes.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex items-center gap-2 mb-3">
          <Heart className="w-5 h-5 text-gray-400" />
          <h3 className="font-semibold text-gray-900">Saved Routes</h3>
        </div>
        <div className="text-center py-6 text-gray-500">
          <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="mb-2">No saved routes yet</p>
          <p className="text-sm">Plan a journey to save your favorite routes</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div 
        className="p-4 border-b bg-gray-50 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-500" />
            <h3 className="font-semibold text-gray-900">Your Routes</h3>
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
              {savedRoutes.length}
            </span>
          </div>
          <ArrowRight className={`w-4 h-4 text-gray-500 transform transition-transform ${
            isExpanded ? 'rotate-90' : ''
          }`} />
        </div>
      </div>

      <div className="p-4">
        {/* Quick access - always show top 2 */}
        <div className="space-y-2">
          {mostUsedRoutes.slice(0, isExpanded ? savedRoutes.length : 2).map(route => (
            <div 
              key={route.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors group"
              onClick={() => selectRoute(route)}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-gray-900">
                    {route.name}
                  </span>
                  <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded">
                    {route.lineName}
                  </span>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>{getRouteFrequency(route)}</span>
                  {route.lastUsed && (
                    <span>Last used {new Date(route.lastUsed).toLocaleDateString()}</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteRoute(route.id);
                  }}
                  className="p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {!isExpanded && savedRoutes.length > 2 && (
          <button
            onClick={() => setIsExpanded(true)}
            className="w-full mt-3 py-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Show {savedRoutes.length - 2} more routes
          </button>
        )}
      </div>
    </div>
  );
}

// Hook for easy access to saved routes functionality
export function useSavedRoutes() {
  const addRoute = (fromStation: any, toStation: any, lineId: string, lineName: string, customName?: string) => {
    const saved = localStorage.getItem('metro-saved-routes');
    const routes = saved ? JSON.parse(saved) : [];

    // Check if route already exists
    const exists = routes.some((route: SavedRoute) => 
      route.fromStation.id === fromStation.id && 
      route.toStation.id === toStation.id &&
      route.lineId === lineId
    );

    if (exists) {
      return false; // Already saved
    }

    const newRoute: SavedRoute = {
      id: Date.now().toString(),
      name: customName || `${fromStation.name} → ${toStation.name}`,
      fromStation,
      toStation,
      lineId,
      lineName,
      createdAt: new Date().toISOString(),
      usageCount: 0
    };

    routes.push(newRoute);
    localStorage.setItem('metro-saved-routes', JSON.stringify(routes));
    return true; // Successfully added
  };

  return { addRoute };
}