import { useState, useMemo } from 'react';
import { MetroLine, Train, SystemSection } from '../types/metro';
import { generateTrainsForStation } from '../data/metroData';
import { generateRailwayTrains } from '../data/railwayData';
import {
  Search,
  Train as TrainIcon,
  Clock,
  ChevronRight,
  ChevronDown,
  Users,
  MapPin,
  RefreshCw,
  WifiOff,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';

interface PassengerJourneyPlannerProps {
  lines: MetroLine[];
  section: SystemSection;
  onTrainSelect?: (train: Train, sourceStation?: string, destinationStation?: string) => void;
}

// ─── Skeleton card for low-bandwidth loading state ─────────────────────────────
function SkeletonTrainCard() {
  return (
    <div
      className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 overflow-hidden relative"
      aria-hidden="true"
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(90deg, transparent 0%, rgba(148,163,184,0.08) 50%, transparent 100%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.5s infinite',
        }}
      />
      <div className="flex items-center justify-between">
        <div className="space-y-2 flex-1">
          <div className="h-5 w-24 rounded-md bg-slate-200 dark:bg-slate-700" />
          <div className="h-3 w-40 rounded-md bg-slate-200 dark:bg-slate-700 opacity-60" />
        </div>
        <div className="h-6 w-16 rounded-full bg-slate-200 dark:bg-slate-700" />
      </div>
      <div className="mt-3 h-2.5 w-full rounded-full bg-slate-200 dark:bg-slate-700 opacity-40" />
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  );
}

// ─── Capacity indicator ────────────────────────────────────────────────────────
function CapacityBadge({ pct }: { pct: number }) {
  const level = pct >= 85 ? 'high' : pct >= 60 ? 'medium' : 'low';
  const config = {
    low: {
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-900/30',
      dot: 'bg-emerald-500',
      label: 'Low',
    },
    medium: {
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-900/30',
      dot: 'bg-amber-500',
      label: 'Moderate',
    },
    high: {
      color: 'text-red-600 dark:text-red-400',
      bg: 'bg-red-50 dark:bg-red-900/30',
      dot: 'bg-red-500',
      label: 'Crowded',
    },
  }[level];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs ${config.bg} ${config.color}`}
      style={{ fontWeight: 600 }}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label} · {pct}%
    </span>
  );
}

// ─── Train card ────────────────────────────────────────────────────────────────
function TrainCard({ train, lineColor, onClick }: { train: Train; lineColor: string; onClick?: () => void }) {
  const statusConfig = {
    'on-time': {
      label: 'On Time',
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-900/30',
    },
    delayed: {
      label: 'Delayed',
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-900/30',
    },
    cancelled: {
      label: 'Cancelled',
      color: 'text-red-600 dark:text-red-400',
      bg: 'bg-red-50 dark:bg-red-900/30',
    },
  }[train.status];

  return (
    <div
      onClick={onClick}
      className={`rounded-xl border bg-white dark:bg-slate-800 p-4 transition-all cursor-pointer hover:shadow-md ${
        train.status === 'cancelled'
          ? 'border-red-200 dark:border-red-900 opacity-60'
          : 'border-slate-200 dark:border-slate-700'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          {/* Color strip */}
          <div
            className="w-1 h-10 rounded-full flex-shrink-0 mt-0.5"
            style={{ background: lineColor }}
          />
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-0.5">
              <p className="text-lg text-slate-900 dark:text-white" style={{ fontWeight: 700 }}>
                {train.departureTime}
              </p>
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${statusConfig.bg} ${statusConfig.color}`}
                style={{ fontWeight: 600 }}
              >
                {statusConfig.label}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" /> Plat. {train.platform}
              </span>
              <span className="flex items-center gap-1">
                <ArrowRight className="w-3 h-3" /> {train.destination}
              </span>
            </div>
          </div>
        </div>
        <CapacityBadge pct={train.capacity.percentage} />
      </div>

      {/* Capacity bar */}
      <div className="mt-3">
        <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-700">
          <div
            className="h-1.5 rounded-full transition-all"
            style={{
              width: `${train.capacity.percentage}%`,
              background:
                train.capacity.percentage >= 85
                  ? '#ef4444'
                  : train.capacity.percentage >= 60
                    ? '#f59e0b'
                    : '#10b981',
            }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <p className="text-[10px] text-slate-400">
            {train.capacity.current} / {train.capacity.total} passengers
          </p>
          <p className="text-[10px] text-slate-400">
            {train.capacity.total - train.capacity.current} seats available
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────
const PAGE_SIZE = 4;

export function PassengerJourneyPlanner({ lines, section, onTrainSelect }: PassengerJourneyPlannerProps) {
  const [selectedLine, setSelectedLine] = useState<MetroLine | null>(lines[0] || null);
  const [fromStation, setFromStation] = useState('');
  const [toStation, setToStation] = useState('');
  const [trains, setTrains] = useState<Train[]>([]);
  const [loadState, setLoadState] = useState<'idle' | 'loading' | 'done' | 'offline'>('idle');
  const [showCount, setShowCount] = useState(PAGE_SIZE);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const allStations = useMemo(() => selectedLine?.stations ?? [], [selectedLine]);

  const toStations = useMemo(
    () => allStations.filter((s) => s !== fromStation),
    [allStations, fromStation]
  );

  const handleSearch = () => {
    if (!fromStation || !toStation || !selectedLine) return;
    setLoadState('loading');
    setShowCount(PAGE_SIZE);
    setTrains([]);

    // Simulate low-bandwidth loading (realistic for 2G/3G)
    setTimeout(() => {
      try {
        const fromIndex = selectedLine.stations.indexOf(fromStation);
        const toIndex = selectedLine.stations.indexOf(toStation);
        const isForward = toIndex > fromIndex;

        const generated =
          section === 'metro'
            ? generateTrainsForStation(fromStation, selectedLine)
            : generateRailwayTrains(fromStation, selectedLine);

        const filteredTrains = generated.filter((train) => {
          const trainIsForward = train.id.includes('-fwd-');
          return trainIsForward === isForward;
        });

        setTrains(filteredTrains);
        setLastRefresh(new Date());
        setLoadState('done');
      } catch {
        setLoadState('offline');
      }
    }, 1200); // deliberate delay simulates network fetch
  };

  const handleRefresh = () => {
    if (loadState === 'done') handleSearch();
  };

  // Auto-search when swap happens
  const handleSwap = () => {
    const temp = fromStation;
    setFromStation(toStation);
    setToStation(temp);
    setTrains([]);
    setLoadState('idle');
  };

  const visibleTrains = trains.slice(0, showCount);
  const hasMore = trains.length > showCount;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-slate-900 dark:text-white text-base" style={{ fontWeight: 700 }}>
            Journey Planner
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Find next trains between any two stations
          </p>
        </div>
        {lastRefresh && (
          <button
            onClick={handleRefresh}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            <span className="hidden sm:inline">
              Updated{' '}
              {lastRefresh.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </button>
        )}
      </div>

      {/* Line selector */}
      <div>
        <label
          className="text-xs text-slate-500 dark:text-slate-400 mb-1.5 block"
          style={{ fontWeight: 600 }}
        >
          SELECT LINE
        </label>
        <div className="flex gap-2 flex-wrap">
          {lines.slice(0, 5).map((line) => (
            <button
              key={line.id}
              onClick={() => {
                setSelectedLine(line);
                setFromStation('');
                setToStation('');
                setTrains([]);
                setLoadState('idle');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs border transition-all ${
                selectedLine?.id === line.id
                  ? 'border-transparent text-white shadow-sm'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'
              }`}
              style={{
                fontWeight: selectedLine?.id === line.id ? 700 : 400,
                background: selectedLine?.id === line.id ? line.color : undefined,
              }}
            >
              {line.name}
            </button>
          ))}
        </div>
      </div>

      {/* From → To + Search */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-end">
          {/* From */}
          <div className="flex-1">
            <label
              className="text-xs text-slate-500 dark:text-slate-400 mb-1.5 block"
              style={{ fontWeight: 600 }}
            >
              FROM STATION
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select
                value={fromStation}
                onChange={(e) => {
                  setFromStation(e.target.value);
                  setToStation('');
                  setTrains([]);
                  setLoadState('idle');
                }}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 appearance-none"
              >
                <option value="">Select origin…</option>
                {allStations.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Swap button */}
          <button
            onClick={handleSwap}
            disabled={!fromStation && !toStation}
            className="sm:mb-0 self-center w-9 h-9 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:text-slate-700 dark:hover:text-white hover:border-orange-400 transition-all flex-shrink-0 disabled:opacity-40"
            title="Swap stations"
          >
            ⇄
          </button>

          {/* To */}
          <div className="flex-1">
            <label
              className="text-xs text-slate-500 dark:text-slate-400 mb-1.5 block"
              style={{ fontWeight: 600 }}
            >
              TO STATION
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select
                value={toStation}
                onChange={(e) => setToStation(e.target.value)}
                disabled={!fromStation}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 appearance-none disabled:opacity-50"
              >
                <option value="">Select destination…</option>
                {toStations.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Search */}
          <button
            onClick={handleSearch}
            disabled={!fromStation || !toStation || loadState === 'loading'}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, rgb(249,115,22), rgb(225,29,72)',
              fontWeight: 600,
            }}
          >
            {loadState === 'loading' ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            {loadState === 'loading' ? 'Loading…' : 'Search'}
          </button>
        </div>
      </div>

      {/* Results area */}
      {/* ── Loading skeletons (low-bandwidth UX) ── */}
      {loadState === 'loading' && (
        <div className="space-y-3">
          <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <div className="w-3 h-3 border-2 border-slate-300 border-t-orange-500 rounded-full animate-spin" />
            Fetching live train data…
          </p>
          {[...Array(3)].map((_, i) => (
            <SkeletonTrainCard key={i} />
          ))}
        </div>
      )}

      {/* ── Offline fallback ── */}
      {loadState === 'offline' && (
        <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 p-6 text-center">
          <WifiOff className="w-10 h-10 mx-auto text-amber-500 mb-3 opacity-70" />
          <p className="text-sm text-amber-700 dark:text-amber-300" style={{ fontWeight: 600 }}>
            No connection detected
          </p>
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
            Schedule data unavailable. Please check your network and retry.
          </p>
          <button
            onClick={handleSearch}
            className="mt-4 px-4 py-2 rounded-lg bg-amber-500 text-white text-xs hover:bg-amber-600 transition-colors"
            style={{ fontWeight: 600 }}
          >
            Retry
          </button>
        </div>
      )}

      {/* ── Idle state ── */}
      {loadState === 'idle' && (
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-10 flex flex-col items-center text-center">
          <TrainIcon className="w-14 h-14 text-slate-300 dark:text-slate-600 mb-3" />
          <p className="text-sm text-slate-500 dark:text-slate-400" style={{ fontWeight: 500 }}>
            Select a line, choose your stations, then tap Search
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
            Includes real-time capacity & delay info
          </p>
        </div>
      )}

      {/* ── Train results ── */}
      {loadState === 'done' && (
        <div className="space-y-3">
          {/* Summary */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <TrainIcon className="w-4 h-4" />
              <span style={{ fontWeight: 600 }}>{trains.length} trains</span>
              <span>from {fromStation}</span>
              <ChevronRight className="w-3 h-3" />
              <span>{toStation}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="w-3 h-3 text-slate-400" />
              <span className="text-xs text-slate-400">Live capacity</span>
            </div>
          </div>

          {trains.length === 0 ? (
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-8 text-center">
              <AlertTriangle className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
              <p className="text-sm text-slate-500 dark:text-slate-400">
                No trains found for this route right now.
              </p>
            </div>
          ) : (
            <>
              {visibleTrains.map((train) => (
                <TrainCard
                  key={train.id}
                  train={train}
                  lineColor={selectedLine?.color || '#3b82f6'}
                  onClick={() => {
                    onTrainSelect?.(train, fromStation, toStation);
                  }}
                />
              ))}

              {/* Load more (pagination for low-bandwidth) */}
              {hasMore ? (
                <button
                  onClick={() => setShowCount((c) => c + PAGE_SIZE)}
                  className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
                >
                  <ChevronDown className="w-4 h-4" />
                  Show {Math.min(PAGE_SIZE, trains.length - showCount)} more trains
                </button>
              ) : (
                <p className="text-center text-xs text-slate-400 dark:text-slate-500 flex items-center justify-center gap-1">
                  <Clock className="w-3 h-3" />
                  All {trains.length} upcoming trains shown
                </p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
