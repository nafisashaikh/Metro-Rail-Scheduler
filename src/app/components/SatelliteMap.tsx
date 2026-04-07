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

interface TrainDetailPanel {
  train: Train;
  position: [number, number];
  currentStation: string;
  nextStation: string;
}

export function SatelliteMap({
  line,
  selectedStation,
  fromStation,
  toStation,
  trains = [],
  onTrainSelect,
}: SatelliteMapProps) {
  const [isSatellite, setIsSatellite] = useState(false);
  const [activePanel, setActivePanel] = useState<TrainDetailPanel | null>(null);

  // Slice coords to journey segment when from+to given
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
    () => coords.map((s) => [s.lat, s.lng] as [number, number]),
    [coords]
  );

  const overallHealth =
    trains.length > 0
      ? Math.round(trains.reduce((s, t) => s + t.health.overall, 0) / trains.length)
      : 100;

  const trainsPoints = useMemo(() => {
    if (stationPoints.length === 0) return [];
    return trains.map((train, idx) => {
      const pct = (train.id.charCodeAt(0) + idx * 13) % 100;
      const si = Math.floor((stationPoints.length - 1) * (pct / 100));
      const ni = Math.min(si + 1, stationPoints.length - 1);
      const cur = coords[si];
      const nxt = coords[ni];
      const prog = (pct / 100) % 1;
      const lat = cur.lat + (nxt.lat - cur.lat) * prog;
      const lng = cur.lng + (nxt.lng - cur.lng) * prog;
      return {
        position: [lat, lng] as [number, number],
        train,
        currentStation: cur.name,
        nextStation: nxt.name,
      };
    });
  }, [trains, stationPoints, coords]);

  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const stationMarkersRef = useRef<L.Layer[]>([]);
  const polylineRef = useRef<L.Polyline | null>(null);
  const streetLayerRef = useRef<L.Layer | null>(null);
  const satelliteLayerRef = useRef<L.Layer | null>(null);

  // Init once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const center: [number, number] =
      stationPoints.length > 0
        ? stationPoints[Math.floor(stationPoints.length / 2)]
        : [19.076, 72.877];

    mapRef.current = L.map(containerRef.current, { zoomControl: false }).setView(center, 11);

    const street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
    });
    const satellite = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      { attribution: '© Esri' }
    );

    street.addTo(mapRef.current);
    streetLayerRef.current = street;
    satelliteLayerRef.current = satellite;

    L.control.zoom({ position: 'bottomright' }).addTo(mapRef.current);

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  // Fit to route
  useEffect(() => {
    if (!mapRef.current || stationPoints.length === 0) return;
    if (stationPoints.length === 1) {
      mapRef.current.setView(stationPoints[0], 14);
    } else {
      mapRef.current.fitBounds(L.latLngBounds(stationPoints.map((p) => L.latLng(p[0], p[1]))), {
        padding: [40, 40],
        animate: true,
      });
    }
  }, [stationPoints]);

  // Satellite toggle
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    if (isSatellite) {
      if (streetLayerRef.current) map.removeLayer(streetLayerRef.current);
      if (satelliteLayerRef.current && !map.hasLayer(satelliteLayerRef.current))
        map.addLayer(satelliteLayerRef.current);
    } else {
      if (satelliteLayerRef.current) map.removeLayer(satelliteLayerRef.current);
      if (streetLayerRef.current && !map.hasLayer(streetLayerRef.current))
        map.addLayer(streetLayerRef.current);
    }
  }, [isSatellite]);

  // Route + station markers
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    if (polylineRef.current) map.removeLayer(polylineRef.current);
    if (stationPoints.length > 0) {
      polylineRef.current = L.polyline(stationPoints, {
        color: line.color,
        weight: 5,
        opacity: 0.9,
      }).addTo(map);
    }

    stationMarkersRef.current.forEach((m) => map.removeLayer(m));
    stationMarkersRef.current = [];

    stationPoints.forEach((pt, idx) => {
      const stName = coords[idx]?.name ?? '';
      const isFrom = stName === fromStation;
      const isTo = stName === toStation;
      const isSelected = stName === selectedStation;
      const isEndpoint = isFrom || isTo;

      const marker = L.circleMarker(pt, {
        radius: isEndpoint ? 10 : isSelected ? 9 : 6,
        color: line.color,
        fillColor: isFrom ? '#3b82f6' : isTo ? '#ef4444' : isSelected ? line.color : '#ffffff',
        fillOpacity: 1,
        weight: isEndpoint ? 3 : 2,
        interactive: false,
      }).addTo(map);

      if (isEndpoint || isSelected) {
        marker.bindTooltip(stName, {
          permanent: true,
          direction: 'top',
          offset: [0, -10],
          className: 'stn-tip',
        });
      }

      stationMarkersRef.current.push(marker);
    });
  }, [stationPoints, selectedStation, fromStation, toStation, line.color, coords]);

  // Train markers — click shows details panel + zoom
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    trainsPoints.forEach((td) => {
      const { train, position, currentStation, nextStation } = td;
      const key = train.id;
      const isMetro = line.name.includes('Metro') || line.name.includes('Line');
      const icon = isMetro ? '🚇' : '🚂';
      const isFwd = train.id.includes('-fwd-');
      const statusColor =
        train.health.overall > 70 ? '#10b981' : train.health.overall > 40 ? '#f59e0b' : '#ef4444';

      const html = `
        <div style="
          position:relative;
          display:flex;
          align-items:center;
          justify-content:center;
          font-size:20px;
          background:rgba(255,255,255,0.95);
          border-radius:18px;
          padding:4px 8px;
          border:2.5px solid ${line.color};
          box-shadow:0 2px 10px rgba(0,0,0,0.22);
          cursor:pointer;
          white-space:nowrap;
        ">
          ${isFwd ? '' : '◀ '}${icon}${isFwd ? ' ▶' : ''}
          <span style="
            position:absolute;
            top:-4px;right:-4px;
            width:11px;height:11px;
            background:${statusColor};
            border-radius:50%;
            border:2px solid #fff;
            animation:lp 1.4s infinite;
          "></span>
        </div>`;

      let marker = markersRef.current.get(key);

      if (marker) {
        marker.setLatLng(position);
        // update icon to refresh status dot color
        marker.setIcon(
          L.divIcon({ html, iconSize: [56, 36], iconAnchor: [28, 18], className: 'train-mk' })
        );
      } else {
        marker = L.marker(position, {
          icon: L.divIcon({
            html,
            iconSize: [56, 36],
            iconAnchor: [28, 18],
            className: 'train-mk',
          }),
          interactive: true,
          riseOnHover: true,
          zIndexOffset: 1000,
        });

        marker.on('click', () => {
          // Zoom in on train
          map.setView(position, Math.max(map.getZoom(), 14), { animate: true });

          // Show detail panel
          setActivePanel({ train, position, currentStation, nextStation });

          if (onTrainSelect) onTrainSelect(train, position);
        });

        marker.bindTooltip(`${train.id}`, {
          direction: 'top',
          offset: [0, -22],
          className: 'train-tip',
        });

        marker.addTo(map);
        markersRef.current.set(key, marker);
      }
    });

    // Cleanup stale
    const ids = new Set(trainsPoints.map((t) => t.train.id));
    markersRef.current.forEach((m, id) => {
      if (!ids.has(id)) {
        if (map.hasLayer(m)) map.removeLayer(m);
        markersRef.current.delete(id);
      }
    });
  }, [trainsPoints, line.color, line.name, onTrainSelect]);

  const healthColor = overallHealth > 70 ? '#10b981' : overallHealth > 40 ? '#f59e0b' : '#ef4444';

  return (
    <div className="relative h-full w-full rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
      <style>{`
        @keyframes lp {
          0%,100% { opacity:1; transform:scale(1); }
          50% { opacity:.4; transform:scale(1.4); }
        }
        .train-mk { background:none !important; border:none !important; }
        .stn-tip, .train-tip {
          background:rgba(15,23,42,.92) !important;
          border:none !important;
          color:#f1f5f9 !important;
          font-size:11px !important;
          font-weight:600 !important;
          padding:3px 8px !important;
          border-radius:6px !important;
          box-shadow:0 2px 8px rgba(0,0,0,.3) !important;
          white-space:nowrap !important;
        }
        .stn-tip::before,.train-tip::before { display:none !important; }
        .leaflet-popup { display:none !important; }
      `}</style>

      <div ref={containerRef} className="h-full w-full" />

      {/* Street / Satellite toggle */}
      <div className="absolute top-3 left-3 z-20">
        <div className="flex gap-1 rounded-full bg-white/90 dark:bg-slate-900/85 p-1 shadow backdrop-blur border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setIsSatellite(false)}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${!isSatellite ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'text-slate-500 dark:text-slate-400'}`}
            type="button"
          >
            Street
          </button>
          <button
            onClick={() => setIsSatellite(true)}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${isSatellite ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'text-slate-500 dark:text-slate-400'}`}
            type="button"
          >
            Satellite
          </button>
        </div>
      </div>

      {/* Live status card — top right */}
      <div className="absolute top-3 right-3 z-20">
        <div className="rounded-2xl bg-slate-900/92 text-white px-4 py-3 backdrop-blur border border-white/10 shadow-lg min-w-[150px]">
          <div className="flex items-center gap-2 mb-2">
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: healthColor,
                boxShadow: `0 0 6px ${healthColor}`,
                animation: 'lp 1.4s infinite',
                display: 'inline-block',
                flexShrink: 0,
              }}
            />
            <p className="text-xs font-semibold leading-tight truncate max-w-[110px]">
              {line.name}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-center text-[11px]">
            <div className="rounded-lg bg-white/5 py-1.5">
              <div className="text-white/50">Stations</div>
              <div className="font-bold">{coords.length}</div>
            </div>
            <div className="rounded-lg bg-white/5 py-1.5">
              <div className="text-white/50">Trains</div>
              <div className="font-bold">{trains.length}</div>
            </div>
          </div>
          {fromStation && toStation && (
            <div className="mt-2 pt-2 border-t border-white/10 space-y-1">
              <div className="flex items-center gap-1.5 text-[10px] text-white/70">
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: '#3b82f6',
                    display: 'inline-block',
                    flexShrink: 0,
                  }}
                />
                <span className="truncate">{fromStation}</span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-white/70">
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: '#ef4444',
                    display: 'inline-block',
                    flexShrink: 0,
                  }}
                />
                <span className="truncate">{toStation}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Train detail slide-up panel */}
      {activePanel && (
        <div
          className="absolute bottom-0 left-0 right-0 z-30 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 shadow-2xl"
          style={{ borderRadius: '20px 20px 0 0', padding: '16px 20px 20px' }}
        >
          {/* Handle bar */}
          <div className="w-10 h-1 bg-slate-300 dark:bg-slate-600 rounded-full mx-auto mb-4" />

          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg">{line.name.includes('Metro') ? '🚇' : '🚂'}</span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {activePanel.train.id}
                </h3>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                    activePanel.train.status === 'on-time'
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                      : activePanel.train.status === 'delayed'
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                  }`}
                >
                  {activePanel.train.status === 'on-time'
                    ? '✓ On Time'
                    : activePanel.train.status === 'delayed'
                      ? '⚠ Delayed'
                      : '✗ Cancelled'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Train #{activePanel.train.trainNumber}
              </p>
            </div>
            <button
              onClick={() => setActivePanel(null)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-2xl leading-none font-light"
            >
              ×
            </button>
          </div>

          {/* Route info */}
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 rounded-xl px-3 py-2.5 mb-3">
            <div className="flex flex-col items-center gap-0.5 flex-shrink-0">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-800" />
              <div className="w-0.5 h-4 bg-slate-300 dark:bg-slate-600" />
              <div className="w-2.5 h-2.5 rounded-full bg-blue-500 border-2 border-white dark:border-slate-800" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-slate-500 dark:text-slate-400">At Station</p>
              <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                {activePanel.currentStation}
              </p>
              <p className="text-xs text-slate-400 mt-1">Next Stop</p>
              <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                {activePanel.nextStation}
              </p>
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-xl bg-slate-50 dark:bg-slate-800 p-3 text-center">
              <p className="text-xs text-slate-400 mb-1">Health</p>
              <p
                className={`text-lg font-bold ${
                  activePanel.train.health.overall > 70
                    ? 'text-emerald-600'
                    : activePanel.train.health.overall > 40
                      ? 'text-amber-600'
                      : 'text-red-600'
                }`}
              >
                {activePanel.train.health.overall}%
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 dark:bg-slate-800 p-3 text-center">
              <p className="text-xs text-slate-400 mb-1">Capacity</p>
              <p className="text-lg font-bold text-slate-900 dark:text-white">
                {activePanel.train.capacity.percentage}%
              </p>
              <p className="text-[10px] text-slate-400">
                {activePanel.train.capacity.current}/{activePanel.train.capacity.total}
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 dark:bg-slate-800 p-3 text-center">
              <p className="text-xs text-slate-400 mb-1">Status</p>
              <p
                className={`text-sm font-bold ${
                  activePanel.train.status === 'on-time'
                    ? 'text-emerald-600'
                    : activePanel.train.status === 'delayed'
                      ? 'text-amber-600'
                      : 'text-red-600'
                }`}
              >
                {activePanel.train.status === 'on-time'
                  ? 'On Time'
                  : activePanel.train.status === 'delayed'
                    ? 'Delayed'
                    : 'Cancelled'}
              </p>
            </div>
          </div>

          {/* Status warnings */}
          {activePanel.train.status === 'delayed' && (
            <div className="mt-3 flex items-center gap-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl px-3 py-2">
              <span className="text-amber-500">⚠</span>
              <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">
                This train is currently running behind schedule
              </p>
            </div>
          )}
          {activePanel.train.status === 'cancelled' && (
            <div className="mt-3 flex items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-3 py-2">
              <span className="text-red-500">🛑</span>
              <p className="text-xs text-red-700 dark:text-red-400 font-medium">
                This train service has been cancelled
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
