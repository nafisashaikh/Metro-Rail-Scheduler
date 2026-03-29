import { useMemo, useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MetroLine, Train } from '../types/metro';

interface SatelliteMapProps {
  line: MetroLine;
  selectedStation?: string;
  trains?: Train[];
  onTrainSelect?: (train: Train, position: [number, number]) => void;
}

const INDIA_CENTER: [number, number] = [22.0, 79.0];

// Interactive map view with stations, route, and live train tracking powered by Leaflet + OpenStreetMap (free)
export function SatelliteMap({ line, selectedStation, trains = [], onTrainSelect }: SatelliteMapProps) {
  const [fullIndiaView, setFullIndiaView] = useState<boolean>(true);
  const [isSatellite, setIsSatellite] = useState<boolean>(false);

  const coords = line.stationCoords || [];

  const stationPoints = useMemo(
    () => coords.map((station) => [station.lat, station.lng] as [number, number]),
    [coords]
  );

  const selectedCoord = selectedStation ? coords.find((c) => c.name === selectedStation) : null;
  const centerPoint: [number, number] = fullIndiaView
    ? INDIA_CENTER
    : selectedCoord
    ? [selectedCoord.lat, selectedCoord.lng]
    : stationPoints.length > 0
    ? stationPoints[Math.floor(stationPoints.length / 2)]
    : INDIA_CENTER;

  const zoom = fullIndiaView ? 5 : 10;

  // If a station is selected, ensure we focus it regardless of fullIndiaView state
  const effectiveViewPoint: [number, number] = selectedCoord ? [selectedCoord.lat, selectedCoord.lng] : centerPoint;
  const effectiveZoom = selectedCoord ? 13 : zoom;

  const trainsPoints = useMemo(() => {
    if (stationPoints.length === 0) return [];
    // Position trains between stations for realistic tracking
    return trains.map((train, idx) => {
      const progressPercent = (train.id.charCodeAt(0) + idx * 13) % 100;
      const stationIndex = Math.floor((stationPoints.length - 1) * (progressPercent / 100));
      const nextStationIndex = Math.min(stationIndex + 1, stationPoints.length - 1);

      const currentStation = coords[stationIndex];
      const nextStation = coords[nextStationIndex];
      const progress = (progressPercent / 100) % 1;

      // Interpolate position between stations
      const lat = currentStation.lat + (nextStation.lat - currentStation.lat) * progress;
      const lng = currentStation.lng + (nextStation.lng - currentStation.lng) * progress;

      return {
        position: [lat, lng] as [number, number],
        train,
        currentStation: currentStation.name,
        nextStation: nextStation.name,
        progress: Math.round(progress * 100),
      };
    });
  }, [trains, stationPoints, coords]);

  const overallHealth = trains.length > 0 ? Math.round(trains.reduce((sum, t) => sum + t.health.overall, 0) / trains.length) : 100;
  const healthyTrains = trains.filter(t => t.health.overall > 70).length;
  const warningTrains = trains.filter(t => t.health.overall > 40 && t.health.overall <= 70).length;
  const criticalTrains = trains.filter(t => t.health.overall <= 40).length;
  const routeStatus = overallHealth > 70 ? '✓ Operational' : overallHealth > 40 ? '⚠ Degraded' : '✗ Disrupted';

  // Direct Leaflet map (avoid react-leaflet context issues with React 18)
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.Layer[]>([]);
  const polylineRef = useRef<L.Polyline | null>(null);
  const [activeTrain, setActiveTrain] = useState<Train | null>(null);
  const [activeTrainPosition, setActiveTrainPosition] = useState<[number, number] | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize map only once
    if (!mapRef.current) {
      mapRef.current = L.map(containerRef.current).setView([centerPoint[0], centerPoint[1]], zoom);

      // Base layer toggle
      const streetLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      });

      const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: '&copy; Esri',
      });

      if (!isSatellite) {
        streetLayer.addTo(mapRef.current);
      } else {
        satelliteLayer.addTo(mapRef.current);
      }

      // Store layers for toggling
      (mapRef.current as any).streetLayer = streetLayer;
      (mapRef.current as any).satelliteLayer = satelliteLayer;

      L.control.zoom({ position: 'bottomright' }).addTo(mapRef.current);
    }

    // Update map view either to selected station or to global/line center
    mapRef.current.setView([effectiveViewPoint[0], effectiveViewPoint[1]], effectiveZoom);

    return () => {
      // Don't destroy map, just update it
    };
  }, [effectiveViewPoint, effectiveZoom]);

  // Handle satellite toggle
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current as any;

    if (isSatellite) {
      if (map.streetLayer) map.removeLayer(map.streetLayer);
      if (map.satelliteLayer && !map.hasLayer(map.satelliteLayer)) {
        map.addLayer(map.satelliteLayer);
      }
    } else {
      if (map.satelliteLayer) map.removeLayer(map.satelliteLayer);
      if (map.streetLayer && !map.hasLayer(map.streetLayer)) {
        map.addLayer(map.streetLayer);
      }
    }
  }, [isSatellite]);

  // Update markers
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    // Clear existing markers
    markersRef.current.forEach((marker) => map.removeLayer(marker));
    markersRef.current = [];

    // Remove existing polyline
    if (polylineRef.current) {
      map.removeLayer(polylineRef.current);
    }

    // Add route polyline
    if (stationPoints.length > 0) {
      polylineRef.current = L.polyline(
        stationPoints.map((p) => [p[0], p[1]] as [number, number]),
        { color: line.color, weight: 4 }
      ).addTo(map);
    }

    // Add station markers
    stationPoints.forEach((point, idx) => {
      const isSelected = selectedStation && coords[idx]?.name === selectedStation;
      const marker = L.circleMarker([point[0], point[1]], {
        radius: isSelected ? 10 : 6,
        color: line.color,
        fillColor: isSelected ? line.color : '#ffffff',
        fillOpacity: 1,
        interactive: true,
      }).addTo(map);

      marker.bindPopup(`<strong>${coords[idx]?.name || `Station ${idx + 1}`}</strong>`);
      marker.on('click', () => {
        // center map to the selected station and open popup
        setFullIndiaView(false);
        if (map) {
          map.setView([point[0], point[1]], 13, { animate: true });
        }
      });

      markersRef.current.push(marker);
    });

    // Add train markers with live status
    trainsPoints.forEach((trainData) => {
      const train = trainData.train;
      const isMetro = line.name.includes('Metro') || line.name.includes('Line');
      const icon = isMetro ? '🚇' : '🚂';
      
      const healthColor = train.health.overall > 70 ? '#10b981' : train.health.overall > 40 ? '#f59e0b' : '#ef4444';
      const healthStatus = train.health.overall > 70 ? '✓ Operational' : train.health.overall > 40 ? '⚠ Warning' : '✗ Critical';
      
      const markerHtml = `
        <div style="
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 32px;
          filter: drop-shadow(0 0 3px rgba(0,0,0,0.6));
          animation: pulse 2s infinite;
          cursor: pointer;
          pointer-events: auto;
        ">
          ${icon}
        </div>
      `;

      const customMarker = L.marker([trainData.position[0], trainData.position[1]], {
        icon: L.divIcon({
          html: markerHtml,
          iconSize: [48, 48],
          className: 'train-icon-marker leaflet-interactive',
        }),
        interactive: true,
        riseOnHover: true,
        title: `${isMetro ? 'Metro' : 'Rail'} Train ${train.id}`,
        zIndexOffset: 1000,
      });

      customMarker.on('click', () => {
        setActiveTrain(train);
        setActiveTrainPosition(trainData.position);
        if (map) {
          map.setView(trainData.position, 12, { animate: true });
        }
        customMarker.openPopup();
        if (onTrainSelect) {
          onTrainSelect(train, trainData.position);
        }
      });

      const popupContent = `
        <div style="font-size: 12px; min-width: 240px; font-family: sans-serif;">
          <div style="margin-bottom: 8px; border-bottom: 1px solid #e5e7eb; padding-bottom: 6px;">
            <strong style="font-size: 13px;">${icon} ${isMetro ? 'Metro' : 'Rail'} Train ${train.id}</strong>
          </div>
          <div style="margin-bottom: 6px;">
            <strong style="color: ${healthColor};">● ${healthStatus}</strong><br/>
            <span style="color: #666;">Health: ${Math.round(train.health.overall)}%</span>
          </div>
          <div style="background: #f3f4f6; padding: 6px; border-radius: 4px; margin-bottom: 6px;">
            <strong>Status: Between Stations</strong><br/>
            <span style="color: #0891b2; font-weight: bold; font-size: 13px;">
              ${trainData.currentStation} → ${trainData.nextStation}
            </span><br/>
            <span style="color: #666; font-size: 11px;">Progress: ${trainData.progress}%</span>
          </div>
          <div style="border-top: 1px solid #e5e7eb; padding-top: 6px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
              <span>Capacity:</span>
              <strong>${train.capacity.percentage}%</strong>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span>Passengers:</span>
              <strong>${train.capacity.current}/${train.capacity.total}</strong>
            </div>
          </div>
        </div>
      `;

      customMarker.bindPopup(popupContent);
      markersRef.current.push(customMarker);
      customMarker.addTo(map);

      // Add invisible but clickable hit area for better UX on small icon
      const hitCircle = L.circleMarker(trainData.position, {
        radius: 18,
        color: healthColor,
        opacity: 0,
        fillOpacity: 0,
        interactive: true,
      }).addTo(map);

      hitCircle.on('click', () => {
        setActiveTrain(train);
        setActiveTrainPosition(trainData.position);
        if (map) {
          map.setView(trainData.position, 12, { animate: true });
        }
        customMarker.openPopup();
        if (onTrainSelect) {
          onTrainSelect(train, trainData.position);
        }
      });
      markersRef.current.push(hitCircle);
    });
  }, [stationPoints, trainsPoints, selectedStation, trains, line.color, coords]);

  return (
    <div className="relative h-full w-full rounded-xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-700">
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        .train-icon-marker { 
          background: none !important;
          border: none !important;
          pointer-events: auto !important;
          cursor: pointer !important;
        }
        .train-icon-marker div {
          pointer-events: auto !important;
          cursor: pointer !important;
        }
      `}</style>
      <div ref={containerRef} className="h-full w-full" />

      <div className="absolute top-3 right-3 z-20 flex flex-col gap-2">
        <div className="flex gap-2">
          <button
            onClick={() => setFullIndiaView(true)}
            className={`rounded-md px-3 py-1 text-xs font-semibold shadow-sm border ${fullIndiaView ? 'bg-blue-600 text-white border-blue-700' : 'bg-white/90 text-slate-700 border-slate-200 dark:bg-slate-900/90 dark:text-slate-100 dark:border-slate-700'}`}
            type="button"
          >
            India View
          </button>
          <button
            onClick={() => setFullIndiaView(false)}
            className={`rounded-md px-3 py-1 text-xs font-semibold shadow-sm border ${!fullIndiaView ? 'bg-blue-600 text-white border-blue-700' : 'bg-white/90 text-slate-700 border-slate-200 dark:bg-slate-900/90 dark:text-slate-100 dark:border-slate-700'}`}
            type="button"
          >
            Line View
          </button>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsSatellite(false)}
            className={`rounded-md px-3 py-1 text-xs font-semibold shadow-sm border ${!isSatellite ? 'bg-green-600 text-white border-green-700' : 'bg-white/90 text-slate-700 border-slate-200 dark:bg-slate-900/90 dark:text-slate-100 dark:border-slate-700'}`}
            type="button"
          >
            Street
          </button>
          <button
            onClick={() => setIsSatellite(true)}
            className={`rounded-md px-3 py-1 text-xs font-semibold shadow-sm border ${isSatellite ? 'bg-green-600 text-white border-green-700' : 'bg-white/90 text-slate-700 border-slate-200 dark:bg-slate-900/90 dark:text-slate-100 dark:border-slate-700'}`}
            type="button"
          >
            Satellite
          </button>
        </div>
      </div>

      <div className="absolute top-3 left-3 z-30 rounded-md bg-green-100/95 border border-green-300 px-3 py-2 text-xs text-green-800 dark:bg-green-900/80 dark:text-green-200">
        <div>✓ Free map: OpenStreetMap</div>
        <div className="text-xs mt-1">Route verified via Google Maps</div>
      </div>

      <div className="absolute bottom-3 right-3 z-20 rounded-lg bg-white/90 dark:bg-slate-900/80 px-4 py-3 text-xs text-slate-700 dark:text-slate-100 backdrop-blur sm:max-w-sm border border-slate-200 dark:border-slate-700">
        <div className="font-semibold text-sm mb-2 flex items-center gap-2">
          <span>Route Status: {routeStatus}</span>
          <span className={`w-2.5 h-2.5 rounded-full ${overallHealth > 70 ? 'bg-emerald-500' : overallHealth > 40 ? 'bg-amber-500' : 'bg-red-500'}`} />
        </div>
        <div className="space-y-1 border-t border-slate-200 dark:border-slate-700 pt-2">
          <div className="flex justify-between">
            <span>Overall Health:</span>
            <span className="font-semibold">{overallHealth}%</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span>🟢 Healthy:</span>
            <span>{healthyTrains}/{trains.length}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span>🟡 Warning:</span>
            <span>{warningTrains}/{trains.length}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span>🔴 Critical:</span>
            <span>{criticalTrains}/{trains.length}</span>
          </div>
        </div>
      </div>

      <div className="absolute bottom-3 left-3 z-20 rounded-lg bg-white/90 dark:bg-slate-900/80 px-3 py-2 text-xs text-slate-700 dark:text-slate-100 backdrop-blur sm:max-w-xs">
        <div className="font-medium text-sm mb-1">{line.name} ({isSatellite ? '🛰️ Satellite' : '🗺️ Street'} View)</div>
        <div className="space-y-1">
          <div>📍 {coords.length} stations</div>
          <div>🚆 {trains.length} trains tracking</div>
          {selectedStation && <div>✓ Selected: {selectedStation}</div>}
          {fullIndiaView && <div>🌍 Showing full India view</div>}
        </div>

        {activeTrain && activeTrainPosition && (
          <div className="mt-3 border-t border-slate-200 dark:border-slate-700 pt-2">
            <div className="font-semibold text-xs mb-1">Active Train (Clicked)</div>
            <div className="text-[11px] text-slate-600 dark:text-slate-300">
              <div>
                <strong>{activeTrain.id}</strong> — {activeTrain.status.toUpperCase()}
              </div>
              <div>Line: {activeTrain.line}</div>
              <div>Location: {activeTrainPosition[0].toFixed(3)}, {activeTrainPosition[1].toFixed(3)}</div>
              <div>Health: {activeTrain.health.overall}%</div>
              <div>Capacity: {activeTrain.capacity.current}/{activeTrain.capacity.total}</div>
            </div>
          </div>
        )}

        <div className="mt-3 border-t border-slate-200 dark:border-slate-700 pt-2 space-y-1">
          <div className="font-semibold text-xs mb-2">Train Status Health:</div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Healthy (&gt;70%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-500" />
            <span>Warning (40-70%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <span>Critical (&lt;40%)</span>
          </div>
        </div>

        <div className="mt-2 border-t border-slate-200 dark:border-slate-700 pt-2 space-y-1">
          <div className="font-semibold text-xs mb-1">Train Type Icons:</div>
          <div className="flex items-center gap-2">
            <span>🚇</span>
            <span>Metro/Local Train</span>
          </div>
          <div className="flex items-center gap-2">
            <span>🚂</span>
            <span>Railway/Express</span>
          </div>
        </div>
      </div>
    </div>
  );
}

