import { useMemo, useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MetroLine, Train } from '../types/metro';

interface SatelliteMapProps {
  line: MetroLine;
  selectedStation?: string;
  fromStation?: string;
  toStation?: string;
  trains?: Train[];
  onTrainSelect?: (train: Train, position: [number, number]) => void;
}

const INDIA_CENTER: [number, number] = [22.0, 79.0];

// Interactive map view with stations, route, and live train tracking powered by Leaflet + OpenStreetMap (free)
export function SatelliteMap({ line, selectedStation, fromStation, toStation, trains = [], onTrainSelect }: SatelliteMapProps) {
  const [fullIndiaView, setFullIndiaView] = useState<boolean>(true);
  const [isSatellite, setIsSatellite] = useState<boolean>(false);

  const coords = useMemo(() => {
    let base = line.stationCoords || [];
    if (fromStation && toStation) {
      const idx1 = line.stations.indexOf(fromStation);
      const idx2 = line.stations.indexOf(toStation);
      if (idx1 !== -1 && idx2 !== -1) {
        const start = Math.min(idx1, idx2);
        const end = Math.max(idx1, idx2);
        base = base.slice(start, end + 1);
      }
    }
    return base;
  }, [line, fromStation, toStation]);

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
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const stationMarkersRef = useRef<L.Layer[]>([]);
  const polylineRef = useRef<L.Polyline | null>(null);
  const streetLayerRef = useRef<L.Layer | null>(null);
  const satelliteLayerRef = useRef<L.Layer | null>(null);
  const [activeTrain, setActiveTrain] = useState<Train | null>(null);
  const [activeTrainPosition, setActiveTrainPosition] = useState<[number, number] | null>(null);

  // Map initialization and cleanup
  useEffect(() => {
    if (!containerRef.current) return;

    if (!mapRef.current) {
      mapRef.current = L.map(containerRef.current).setView([centerPoint[0], centerPoint[1]], zoom);

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

      streetLayerRef.current = streetLayer;
      satelliteLayerRef.current = satelliteLayer;

      L.control.zoom({ position: 'bottomright' }).addTo(mapRef.current);
    }

    // Cleanup on unmount
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []); // Only run once on mount

  // View updates
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.setView([effectiveViewPoint[0], effectiveViewPoint[1]], effectiveZoom);
    }
  }, [effectiveViewPoint, effectiveZoom]);

  // Handle satellite toggle
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    const streetLyr = streetLayerRef.current;
    const satelliteLyr = satelliteLayerRef.current;

    if (isSatellite) {
      if (streetLyr) map.removeLayer(streetLyr);
      if (satelliteLyr && !map.hasLayer(satelliteLyr)) {
        map.addLayer(satelliteLyr);
      }
    } else {
      if (satelliteLyr) map.removeLayer(satelliteLyr);
      if (streetLyr && !map.hasLayer(streetLyr)) {
        map.addLayer(streetLyr);
      }
    }
  }, [isSatellite]);

  // Update route polyline and station markers (less frequent changes)
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    // Remove existing polyline
    if (polylineRef.current) {
      map.removeLayer(polylineRef.current);
    }

    // Add route polyline
    if (stationPoints.length > 0) {
      polylineRef.current = L.polyline(
        stationPoints.map((p) => [p[0], p[1]] as [number, number]),
        { color: line.color, weight: 4, className: 'animated-route' }
      ).addTo(map);
    }

    // Clear and recreate station markers
    stationMarkersRef.current.forEach((marker) => map.removeLayer(marker));
    stationMarkersRef.current = [];

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

      marker.on('click', () => {
        setFullIndiaView(false);
        if (map) {
          map.setView([point[0], point[1]], 13, { animate: true });
        }
      });

      stationMarkersRef.current.push(marker);
    });
  }, [stationPoints, selectedStation, line.color, coords]);

  // Update train markers (optimized for frequent changes with train positions)
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    // For each train, update or create marker
    trainsPoints.forEach((trainData) => {
      const train = trainData.train;
      const trainKey = train.id;
      const isMetro = line.name.includes('Metro') || line.name.includes('Line');
      const icon = isMetro ? '🚇' : '🚂';
      
      const isFwd = train.id.includes('-fwd-');
      const arrowRight = `<span style="font-size: 16px; margin-left: -4px; color: ${line.color}; text-shadow: 0 0 2px white;">➔</span>`;
      const arrowLeft = `<span style="font-size: 16px; margin-right: -4px; color: ${line.color}; text-shadow: 0 0 2px white;">⬅</span>`;
      const displayIcon = isFwd ? `${icon}${arrowRight}` : `${arrowLeft}${icon}`;
      
      const healthColor = train.health.overall > 70 ? '#10b981' : train.health.overall > 40 ? '#f59e0b' : '#ef4444';
      const healthStatus = train.health.overall > 70 ? '✓ Operational' : train.health.overall > 40 ? '⚠ Warning' : '✗ Critical';
      
      const markerHtml = `
        <div style="
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 26px;
          filter: drop-shadow(0 0 3px rgba(0,0,0,0.6));
          animation: pulse 2s infinite;
          cursor: pointer;
          pointer-events: auto;
          background: rgba(255,255,255,0.8);
          border-radius: 20px;
          padding: 2px 6px;
          border: 1px solid ${line.color};
        ">
          ${displayIcon}
        </div>
      `;

      // Check if marker exists
      let marker = markersRef.current.get(trainKey);
      
      if (marker) {
        // Update existing marker position and popup
        marker.setLatLng([trainData.position[0], trainData.position[1]]);
      } else {
        // Create new marker
        marker = L.marker([trainData.position[0], trainData.position[1]], {
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

        marker.on('click', () => {
          setActiveTrain(train);
          setActiveTrainPosition(trainData.position);
          if (map) {
            map.setView(trainData.position, 12, { animate: true });
          }
          if (onTrainSelect) {
            onTrainSelect(train, trainData.position);
          }
        });
        marker.addTo(map);
        markersRef.current.set(trainKey, marker);
      }
    });

    // Remove markers for trains that no longer exist
    const trainIds = new Set(trainsPoints.map((tp) => tp.train.id));
    Array.from(markersRef.current.keys()).forEach((trainId) => {
      if (!trainIds.has(trainId)) {
        const marker = markersRef.current.get(trainId);
        if (marker && map.hasLayer(marker)) {
          map.removeLayer(marker);
        }
        markersRef.current.delete(trainId);
      }
    });
  }, [trainsPoints, line.color, line.name, onTrainSelect]);

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
        <div className="flex gap-2 rounded-full bg-white/90 dark:bg-slate-900/80 p-1 shadow-sm backdrop-blur border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setFullIndiaView(true)}
            className={`rounded-full px-3 py-1 text-xs font-semibold border transition-colors ${fullIndiaView ? 'bg-orange-600 text-white border-orange-600' : 'bg-transparent text-slate-600 dark:text-slate-300 border-transparent'}`}
            type="button"
          >
            India
          </button>
          <button
            onClick={() => setFullIndiaView(false)}
            className={`rounded-full px-3 py-1 text-xs font-semibold border transition-colors ${!fullIndiaView ? 'bg-orange-600 text-white border-orange-600' : 'bg-transparent text-slate-600 dark:text-slate-300 border-transparent'}`}
            type="button"
          >
            Line
          </button>
          <button
            onClick={() => setIsSatellite(false)}
            className={`rounded-full px-3 py-1 text-xs font-semibold border transition-colors ${!isSatellite ? 'bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900 dark:border-white' : 'bg-transparent text-slate-600 dark:text-slate-300 border-transparent'}`}
            type="button"
          >
            Street
          </button>
          <button
            onClick={() => setIsSatellite(true)}
            className={`rounded-full px-3 py-1 text-xs font-semibold border transition-colors ${isSatellite ? 'bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900 dark:border-white' : 'bg-transparent text-slate-600 dark:text-slate-300 border-transparent'}`}
            type="button"
          >
            Satellite
          </button>
        </div>

        <div className="rounded-2xl bg-slate-900/90 text-white px-4 py-3 backdrop-blur border border-white/10 shadow-lg max-w-xs">
          <div className="flex items-center justify-between gap-3 mb-2">
            <div>
              <p className="text-[10px] uppercase tracking-[0.25em] text-white/50">Live route</p>
              <p className="text-sm font-semibold leading-tight">{line.name}</p>
            </div>
            <span className={`w-2.5 h-2.5 rounded-full ${overallHealth > 70 ? 'bg-emerald-400' : overallHealth > 40 ? 'bg-amber-400' : 'bg-red-400'}`} />
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
            <div className="rounded-xl bg-white/5 py-2">
              <div className="text-white/50">Stations</div>
              <div className="font-semibold">{coords.length}</div>
            </div>
            <div className="rounded-xl bg-white/5 py-2">
              <div className="text-white/50">Trains</div>
              <div className="font-semibold">{trains.length}</div>
            </div>
            <div className="rounded-xl bg-white/5 py-2">
              <div className="text-white/50">Health</div>
              <div className="font-semibold">{overallHealth}%</div>
            </div>
          </div>
          {selectedStation && <div className="mt-2 text-xs text-white/80">Selected: {selectedStation}</div>}
          {activeTrain && activeTrainPosition && (
            <div className="mt-2 text-xs text-white/80 border-t border-white/10 pt-2">
              <div className="font-semibold text-white">{activeTrain.id}</div>
              <div>{activeTrain.status.toUpperCase()} · {activeTrain.capacity.current}/{activeTrain.capacity.total}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

