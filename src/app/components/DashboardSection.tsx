import { useState, useEffect } from 'react';
import { useNetworkQuality } from '../hooks/useNetworkQuality';
import { MetroLine, Train, StationMetrics, Alert, UserRole, WeatherData, PassengerUser, SystemSection } from '../types/metro';
import { translations, Language } from '../i18n/translations';
import { generateTrainsForStation, getStationMetrics } from '../data/metroData';
import { generateRailwayTrains, getRailwayStationMetrics } from '../data/railwayData';
import { createSchedule, fetchTrainsForStation } from '../services/schedules';
import { MetroLineSelector } from './MetroLineSelector';
import { StationSelector } from './StationSelector';
import { ScheduleDisplay } from './ScheduleDisplay';
import { TrainHealthCard } from './TrainHealthCard';
import { StationEfficiencyCard } from './StationEfficiencyCard';
import { CapacityVisualization } from './CapacityVisualization';
import { AlertPanel } from './AlertPanel';
import { SatelliteMap } from './SatelliteMap';
import { WeatherWidget } from './WeatherWidget';
import { RouteMapVisualization } from './RouteMapVisualization';
import { MedicalPrescription } from './MedicalPrescription';
import { PassengerJourneyPlanner } from './PassengerJourneyPlanner';
import { PassengerPass } from './PassengerPass';
import { AiHelpDesk } from './AiHelpDesk';
import { StationBlueprint } from './StationBlueprint';
import { EcoStats } from './EcoStats';
import { StaffTasks } from './StaffTasks';
import { StaffBroadcast } from './StaffBroadcast';
import {
  Calendar,
  Map,
  Activity,
  BarChart2,
  Bell,
  Train as TrainIcon,
  TrendingUp,
  Users,
  Clock,
  ChevronRight,
  Zap,
  AlertTriangle,
  MapPin,
  Stethoscope,
  QrCode,
  Bot,
  Compass,
  WifiOff,
  ZapOff,
  Megaphone
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface DashboardSectionProps {
  section: SystemSection;
  lines: MetroLine[];
  alerts: Alert[];
  onResolveAlert: (id: string) => void;
  onAddAlert: (alert: Omit<Alert, 'id' | 'timestamp' | 'resolved'>) => void;
  userRole: UserRole;
  weather: WeatherData;
  isDark: boolean;
  showAlerts: boolean;
  onCloseAlerts: () => void;
  passengerUser?: PassengerUser;
  lang?: string;
}

// Staff tabs
const STAFF_TABS = [
  { id: 'schedule', label: 'Schedule', icon: Calendar },
  { id: 'map', label: 'Satellite Map', icon: Map },
  { id: 'health', label: 'Train Health', icon: Activity },
  { id: 'analytics', label: 'Analytics', icon: BarChart2 },
  { id: 'alerts', label: 'Alerts', icon: Bell },
  { id: 'medical', label: 'Medical Guide', icon: Stethoscope },
  { id: 'broadcast', label: 'Broadcast', icon: Megaphone },
] as const;

// Passenger tabs — full feature set including Medical
interface PassengerTabLabels {
  journey: string;
  pass: string;
  map: string;
  guide: string;
  alerts: string;
  medical: string;
  support: string;
}

const getPassengerTabs = (t: PassengerTabLabels) => [
  { id: 'journey', icon: MapPin, label: t.journey },
  { id: 'pass', icon: QrCode, label: t.pass },
  { id: 'map', icon: Map, label: t.map },
  { id: 'guide', icon: Compass, label: t.guide },
  { id: 'alerts', icon: Bell, label: t.alerts },
  { id: 'medical', icon: Stethoscope, label: t.medical },
  { id: 'support', icon: Bot, label: t.support },
] as const;



const CAPACITY_PIE_COLORS = ['#3b82f6', '#e5e7eb'];

export function DashboardSection({
  section,
  lines,
  alerts,
  onResolveAlert,
  onAddAlert,
  userRole,
  weather,
  isDark,
  showAlerts,
  onCloseAlerts,
  passengerUser,
  lang = 'en',
}: DashboardSectionProps) {
  const t = translations[lang as Language] || translations.en;
  const isPassenger = userRole === 'passenger';
  const isEmployee = userRole === 'employee';
  
  const PASSENGER_TABS = getPassengerTabs(t);
  
  const ROLE_TABS = isEmployee 
    ? [
        { id: 'duties', label: 'My Duties', icon: Calendar },
        { id: 'map', label: 'Live Network', icon: Map },
        { id: 'incident', label: 'Report Incident', icon: AlertTriangle },
        { id: 'broadcast', label: 'Messages', icon: Megaphone },
      ]
    : STAFF_TABS;
    
  const TAB_LIST = isPassenger ? PASSENGER_TABS : ROLE_TABS;
  const [selectedLine, setSelectedLine] = useState<MetroLine | null>(lines[0] || null);
  const [selectedStation, setSelectedStation] = useState<string | null>(null);
  const [trains, setTrains] = useState<Train[]>([]);
  const [activeTrain, setActiveTrain] = useState<Train | null>(null);
  const [activeTrainPosition, setActiveTrainPosition] = useState<[number, number] | null>(null);
  const [metrics, setMetrics] = useState<StationMetrics | null>(null);
  const [activeTab, setActiveTab] = useState<string>(isPassenger ? 'journey' : isEmployee ? 'duties' : 'schedule');
  const [scheduleDestination, setScheduleDestination] = useState('');
  const [scheduleDepartureTime, setScheduleDepartureTime] = useState('');
  const [schedulePlatform, setSchedulePlatform] = useState('');
  const [scheduleTrainNumber, setScheduleTrainNumber] = useState('');
  const [scheduleStatus, setScheduleStatus] = useState<'on-time' | 'delayed' | 'cancelled'>('on-time');
  const [scheduleSaving, setScheduleSaving] = useState(false);
  const [scheduleError, setScheduleError] = useState('');

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (selectedLine && selectedStation) {
        const m =
          section === 'metro'
            ? getStationMetrics(selectedStation)
            : getRailwayStationMetrics(selectedStation);
        setMetrics(m);

        if (isPassenger) {
          const generated =
            section === 'metro'
              ? generateTrainsForStation(selectedStation, selectedLine, weather.condition)
              : generateRailwayTrains(selectedStation, selectedLine, weather.condition);
          if (!cancelled) setTrains(generated);
          return;
        }

        try {
          const apiTrains = await fetchTrainsForStation({
            station: selectedStation,
            line: selectedLine.name,
          });
          if (!cancelled) setTrains(apiTrains);
        } catch {
          if (!cancelled) setTrains([]);
        }
      } else {
        setTrains([]);
        setMetrics(null);
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [selectedLine, selectedStation, section, isPassenger, weather.condition]);

  const canManageSchedules = !isPassenger && (userRole === 'admin' || userRole === 'supervisor');

  const handleCreateSchedule = async () => {
    if (!selectedLine || !selectedStation) return;

    setScheduleError('');

    const destination = scheduleDestination.trim();
    const departureTime = scheduleDepartureTime.trim();
    const platform = schedulePlatform.trim();
    const trainNumber = scheduleTrainNumber.trim();

    if (!destination || !departureTime || !platform || !trainNumber) {
      setScheduleError('Please fill all fields.');
      return;
    }

    setScheduleSaving(true);
    try {
      await createSchedule({
        station: selectedStation,
        line: selectedLine.name,
        destination,
        departureTime,
        platform,
        status: scheduleStatus,
        trainNumber,
      });

      const refreshed = await fetchTrainsForStation({ station: selectedStation, line: selectedLine.name });
      setTrains(refreshed);

      setScheduleDestination('');
      setScheduleDepartureTime('');
      setSchedulePlatform('');
      setScheduleTrainNumber('');
      setScheduleStatus('on-time');
    } catch (e) {
      setScheduleError(e instanceof Error ? e.message : 'Failed to create schedule.');
    } finally {
      setScheduleSaving(false);
    }
  };

  useEffect(() => {
    if (showAlerts) setActiveTab('alerts');
  }, [showAlerts]);

  const handleLineSelect = (line: MetroLine) => {
    setSelectedLine(line);
    setSelectedStation(null);
  };

  const onTimeCount = trains.filter((t) => t.status === 'on-time').length;
  const delayedCount = trains.filter((t) => t.status === 'delayed').length;
  const avgHealth =
    trains.length > 0
      ? Math.round(trains.reduce((s, t) => s + t.health.overall, 0) / trains.length)
      : 0;
  const avgCapacity =
    trains.length > 0
      ? Math.round(trains.reduce((s, t) => s + t.capacity.percentage, 0) / trains.length)
      : 0;
  const sectionAlerts = alerts.filter((a) => a.section === section && !a.resolved);

  const hourlyPassengers = Array.from({ length: 12 }, (_, i) => ({
    hour: `${i + 6}:00`,
    passengers: Math.round(2000 + Math.sin((i - 2) * 0.8) * 1500 + Math.random() * 300),
  }));
  const healthTrend = Array.from({ length: 7 }, (_, i) => ({
    day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
    health: Math.round(75 + Math.random() * 20),
    onTime: Math.round(80 + Math.random() * 15),
  }));

  // ── Tab bar (shared) ─────────────────────────────────────────────────────────
  const TabBar = (
    <div className="flex gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-x-auto scrollbar-hide w-full">
      {TAB_LIST.map((tab) => {
        const Icon = tab.icon;
        const isBadge = tab.id === 'alerts' && sectionAlerts.length > 0;
        return (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              if (tab.id !== 'alerts') onCloseAlerts();
            }}
            className={`relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm transition-all flex-shrink-0 ${activeTab === tab.id
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            style={{ fontWeight: activeTab === tab.id ? 600 : 400 }}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            <span className="whitespace-nowrap">{tab.label}</span>
            {isBadge && (
              <span
                className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center"
                style={{ fontWeight: 700 }}
              >
                {sectionAlerts.length}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );

  // ══════════════════════════════════════════════════════════════════════════════
  // PASSENGER LAYOUT — full-width, no sidebar, mobile-first
  // ══════════════════════════════════════════════════════════════════════════════
  const networkQuality = useNetworkQuality();
  const [forceLowBandwidth, setForceLowBandwidth] = useState(false);
  const isLowBandwidth = networkQuality === 'low' || forceLowBandwidth;

  useEffect(() => {
    if (networkQuality === 'low') {
      setForceLowBandwidth(true);
    }
  }, [networkQuality]);

  const toggleDataSaver = () => setForceLowBandwidth(!forceLowBandwidth);

  if (isPassenger) {
    return (
      <div className="flex flex-col gap-4">
        {/* Data Saver Mode Active Alert */}
        {isLowBandwidth && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/30 p-2.5 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <WifiOff className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span className="text-[11px] font-bold text-amber-700 dark:text-amber-300">{t.liteMode}</span>
            </div>
            <button
              onClick={toggleDataSaver}
              className="text-[10px] font-bold text-amber-600 dark:text-amber-400 hover:underline"
            >
              {t.switchFull}
            </button>
          </div>
        )}

        {/* Eco Stats Banner - HIDDEN in low bandwidth to save data/rendering */}
        {!isLowBandwidth && <EcoStats />}

        {/* Tab bar */}
        {TabBar}

        {/* Journey Planner */}
        {activeTab === 'journey' && (
          <div className="rounded-2xl border border-slate-100 dark:border-slate-800/60 bg-white dark:bg-slate-900/50 p-4 sm:p-6">
            <PassengerJourneyPlanner
              lines={lines}
              section={section}
              isLowBandwidth={isLowBandwidth}
              weatherCondition={weather.condition}
              onTrainSelect={(train, source) => {
                setActiveTrain(train);
                setActiveTab('map');
                if (source) setSelectedStation(source);
              }}
            />
          </div>
        )}

        {/* Live Map — full width, tall */}
        {activeTab === 'map' && (
          <div className="flex flex-col gap-3">
            {/* Line + station pickers in a compact row */}
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-xl border border-slate-100 dark:border-slate-800/60 bg-white dark:bg-slate-900/50 p-3">
                <MetroLineSelector
                  lines={lines}
                  selectedLine={selectedLine}
                  onSelectLine={handleLineSelect}
                />
              </div>
              <div className="rounded-xl border border-slate-100 dark:border-slate-800/60 bg-white dark:bg-slate-900/50 p-3">
                <StationSelector
                  stations={selectedLine?.stations || []}
                  selectedStation={selectedStation}
                  onSelectStation={setSelectedStation}
                  disabled={!selectedLine}
                />
                {selectedLine && (
                  <p className="text-xs text-slate-400 mt-1">
                    {selectedLine.stations.length} stations
                  </p>
                )}
              </div>
            </div>

            {/* Train details banner when active train selected */}
            {activeTrain && (
              <div className="rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 px-4 py-3 flex items-center gap-3">
                <TrainIcon className="w-5 h-5 text-blue-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-blue-800 dark:text-blue-200 truncate">
                    {activeTrain.id}
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-400">
                    {activeTrain.status.toUpperCase()} · Health {activeTrain.health.overall}% ·{' '}
                    {activeTrain.capacity.current}/{activeTrain.capacity.total} seats
                  </p>
                </div>
                <button
                  onClick={() => setActiveTrain(null)}
                  className="text-blue-400 hover:text-blue-600 text-lg leading-none"
                >
                  ×
                </button>
              </div>
            )}

            {/* Map — tall on mobile */}
            <div
              className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden"
              style={{ height: 'min(70vh, 580px)' }}
            >
              {selectedLine ? (
                <SatelliteMap
                  line={selectedLine}
                  selectedStation={selectedStation || undefined}
                  trains={trains}
                  onTrainSelect={(train, position) => {
                    setActiveTrain(train);
                    setActiveTrainPosition(position);
                  }}
                />
              ) : (
                <div className="h-full flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-800 gap-3 text-slate-400">
                  <Map className="w-16 h-16 opacity-20" />
                  <p className="text-sm">Select a line above to view live map</p>
                </div>
              )}
            </div>

            {/* Quick stats strip */}
            {trains.length > 0 && (
              <div className="grid grid-cols-4 gap-2">
                {[
                  {
                    label: 'Trains',
                    value: trains.length,
                    color: 'text-blue-600 dark:text-blue-400',
                    bg: 'bg-blue-50 dark:bg-blue-900/20',
                  },
                  {
                    label: 'On Time',
                    value: onTimeCount,
                    color: 'text-emerald-600 dark:text-emerald-400',
                    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
                  },
                  {
                    label: 'Delayed',
                    value: delayedCount,
                    color: 'text-amber-600 dark:text-amber-400',
                    bg: 'bg-amber-50 dark:bg-amber-900/20',
                  },
                  {
                    label: 'Avg Health',
                    value: `${avgHealth}%`,
                    color: 'text-purple-600 dark:text-purple-400',
                    bg: 'bg-purple-50 dark:bg-purple-900/20',
                  },
                ].map((s) => (
                  <div key={s.label} className={`rounded-xl p-3 text-center ${s.bg}`}>
                    <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">{s.label}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Announcements */}
        {activeTab === 'alerts' && (
          <div
            className="rounded-2xl border border-slate-100 dark:border-slate-800/60 bg-white dark:bg-slate-900/50 p-4 sm:p-6"
            style={{ minHeight: 400 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Bell className="w-5 h-5 text-slate-600 dark:text-slate-300" />
              <h3 className="text-slate-900 dark:text-white font-semibold">
                {section === 'metro' ? 'Metro' : 'Railway'} Announcements
              </h3>
            </div>
            <AlertPanel
              alerts={alerts.filter((a) => a.section === section)}
              onResolve={() => { }}
              onAdd={() => { }}
              userRole={userRole}
              section={section}
            />
          </div>
        )}

        {/* Medical Guide — available for passengers too */}
        {activeTab === 'medical' && (
          <div
            className="rounded-2xl border border-slate-100 dark:border-slate-800/60 bg-white dark:bg-slate-900/50 p-4 sm:p-6"
            style={{ minHeight: 480 }}
          >
            <MedicalPrescription selectedStation={selectedStation} />
          </div>
        )}

        {/* Passenger Pass */}
        {activeTab === 'pass' && passengerUser && (
          <div
            className="rounded-2xl border border-slate-100 dark:border-slate-800/60 bg-white dark:bg-slate-900/50 p-4 sm:p-6"
            style={{ minHeight: 480 }}
          >
            <PassengerPass user={passengerUser} />
          </div>
        )}

        {/* AI Support */}
        {activeTab === 'support' && (
          <div
            className="rounded-2xl border border-slate-100 dark:border-slate-800/60 bg-white dark:bg-slate-900/50 p-4 sm:p-6"
            style={{ minHeight: 480 }}
          >
            <div className="max-w-3xl mx-auto">
              <AiHelpDesk />
            </div>
          </div>
        )}

        {/* Station Guide */}
        {activeTab === 'guide' && (
          <div
            className="rounded-2xl border border-slate-100 dark:border-slate-800/60 bg-white dark:bg-slate-900/50 p-4 sm:p-6"
            style={{ minHeight: 480 }}
          >
            {selectedStation ? (
              isLowBandwidth ? (
                <div className="h-full flex flex-col items-center justify-center py-20 text-center">
                  <ZapOff className="w-12 h-12 mb-4 text-slate-300" />
                  <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">Map restricted in Lite Mode</h3>
                  <p className="text-xs text-slate-500 max-w-xs mt-1">Downloading station blueprints requires high bandwidth. Please switch to &apos;Full Mode&apos; to view the map.</p>
                  <button
                    onClick={toggleDataSaver}
                    className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-full text-xs font-bold"
                  >
                    Enable Full Mode
                  </button>
                </div>
              ) : (
                <StationBlueprint stationName={selectedStation} />
              )
            ) : (
              <div className="h-full flex flex-col items-center justify-center py-20 text-slate-400">
                <Compass className="w-16 h-16 mb-4 opacity-30" />
                <p className="text-lg mb-1 text-slate-500 font-medium">Select a station first</p>
                <p className="text-sm text-center max-w-xs">Use the Live Map or Journey Planner to select a station and view its layout guide.</p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // STAFF LAYOUT — sidebar + main content (desktop-first, responsive)
  // ══════════════════════════════════════════════════════════════════════════════
  return (
    <div className="flex flex-col lg:flex-row gap-6 min-h-0">
      {/* Left sidebar */}
      <div className="w-full lg:w-72 flex-shrink-0 flex flex-col gap-4 lg:sticky lg:top-[80px] lg:self-start lg:max-h-[calc(100vh-100px)] lg:overflow-y-auto lg:pb-8 scrollbar-hide">
        <div className="rounded-2xl border border-slate-100 dark:border-slate-800/60 bg-white dark:bg-slate-900/50 p-4">
          <MetroLineSelector
            lines={lines}
            selectedLine={selectedLine}
            onSelectLine={handleLineSelect}
          />
        </div>
        <div className="rounded-2xl border border-slate-100 dark:border-slate-800/60 bg-white dark:bg-slate-900/50 p-4">
          <StationSelector
            stations={selectedLine?.stations || []}
            selectedStation={selectedStation}
            onSelectStation={setSelectedStation}
            disabled={!selectedLine}
          />
          {selectedLine && (
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
              {selectedLine.stations.length} stations · {selectedLine.totalLength || 'N/A'}
            </p>
          )}
        </div>

        {selectedStation && trains.length > 0 && (
          <div className="rounded-2xl border border-slate-100 dark:border-slate-800/60 bg-white dark:bg-slate-900/50 p-4">
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 font-semibold uppercase tracking-wide">
              Quick Stats
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              {[
                {
                  label: 'Total Trains',
                  value: trains.length,
                  icon: TrainIcon,
                  color: 'text-blue-500',
                  bg: 'bg-blue-50 dark:bg-blue-900/20',
                },
                {
                  label: 'On Time',
                  value: onTimeCount,
                  icon: Clock,
                  color: 'text-emerald-500',
                  bg: 'bg-emerald-50 dark:bg-emerald-900/20',
                },
                {
                  label: 'Delayed',
                  value: delayedCount,
                  icon: AlertTriangle,
                  color: 'text-amber-500',
                  bg: 'bg-amber-50 dark:bg-amber-900/20',
                },
                {
                  label: 'Avg Health',
                  value: `${avgHealth}%`,
                  icon: Activity,
                  color: 'text-purple-500',
                  bg: 'bg-purple-50 dark:bg-purple-900/20',
                },
              ].map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} className={`rounded-lg p-3 ${stat.bg}`}>
                    <Icon className={`w-4 h-4 ${stat.color} mb-1`} />
                    <p className="text-lg text-slate-900 dark:text-white font-bold">{stat.value}</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">{stat.label}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {sectionAlerts.length > 0 && (
          <div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Bell className="w-4 h-4 text-red-500" />
              <span className="text-sm text-red-700 dark:text-red-300 font-semibold">
                {sectionAlerts.length} Active Alert{sectionAlerts.length > 1 ? 's' : ''}
              </span>
            </div>
            {sectionAlerts.slice(0, 2).map((a) => (
              <div key={a.id} className="text-xs text-red-600 dark:text-red-400 mb-1 truncate">
                • {a.title}: {a.station}
              </div>
            ))}
            <button
              onClick={() => setActiveTab('alerts')}
              className="mt-2 text-xs text-red-600 dark:text-red-400 flex items-center gap-1 hover:text-red-700 font-semibold"
            >
              View all alerts <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        )}

        {selectedLine && (
          <div className="rounded-2xl border border-slate-100 dark:border-slate-800/60 bg-white dark:bg-slate-900/50 overflow-hidden">
            <RouteMapVisualization
              line={selectedLine}
              currentStation={selectedStation || undefined}
            />
          </div>
        )}

        {/* Staff Task Manager */}
        <div className="rounded-2xl border border-slate-100 dark:border-slate-800/60 bg-white dark:bg-slate-900/50 p-4">
          <StaffTasks />
        </div>

        <WeatherWidget weather={weather} />
      </div>

      {/* Main content */}
      <div className="flex-1 min-w-0 flex flex-col gap-4">
        {/* Tab bar */}
        {TabBar}

        {activeTrain && activeTrainPosition && (
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 p-3 mb-1">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
              Active train: {activeTrain.id} · Status: {activeTrain.status} · Health:{' '}
              {activeTrain.health.overall}%
            </p>
          </div>
        )}

        <div className="flex-1 min-h-[500px]">
          {activeTab === 'schedule' && (
            <div className="rounded-2xl border border-slate-100 dark:border-slate-800/60 bg-white dark:bg-slate-900/50 p-4 sm:p-6 min-h-96">
              {!selectedStation ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                  <Calendar className="w-16 h-16 mb-4 opacity-30" />
                  <p className="text-lg mb-1 text-slate-500 font-medium">Select a station</p>
                  <p className="text-sm">Choose a line and station from the sidebar</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {canManageSchedules && selectedLine && (
                    <div className="rounded-2xl border border-slate-100 dark:border-slate-800/60 bg-white/70 dark:bg-slate-900/40 p-4">
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div>
                          <p className="text-xs text-slate-400 uppercase tracking-wider font-bold">
                            Create schedule
                          </p>
                          <p className="text-sm text-slate-700 dark:text-slate-200 font-semibold">
                            {selectedLine.name} · {selectedStation}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                        <div className="lg:col-span-2">
                          <label className="text-[10px] text-slate-500 uppercase font-bold">Destination</label>
                          <input
                            value={scheduleDestination}
                            onChange={(e) => setScheduleDestination(e.target.value)}
                            placeholder="e.g., Ghatkopar"
                            className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] text-slate-500 uppercase font-bold">Time</label>
                          <input
                            value={scheduleDepartureTime}
                            onChange={(e) => setScheduleDepartureTime(e.target.value)}
                            placeholder="HH:MM"
                            className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm font-mono"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] text-slate-500 uppercase font-bold">Platform</label>
                          <input
                            value={schedulePlatform}
                            onChange={(e) => setSchedulePlatform(e.target.value)}
                            placeholder="e.g., 2"
                            className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] text-slate-500 uppercase font-bold">Status</label>
                          <select
                            title="Status"
                            value={scheduleStatus}
                            onChange={(e) => setScheduleStatus(e.target.value as 'on-time' | 'delayed' | 'cancelled')}
                            className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm"
                          >
                            <option value="on-time">On time</option>
                            <option value="delayed">Delayed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </div>

                        <div className="lg:col-span-2">
                          <label className="text-[10px] text-slate-500 uppercase font-bold">Train number</label>
                          <input
                            value={scheduleTrainNumber}
                            onChange={(e) => setScheduleTrainNumber(e.target.value)}
                            placeholder="e.g., MRS-L1-101"
                            className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm font-mono"
                          />
                        </div>
                      </div>

                      {scheduleError && (
                        <p className="mt-3 text-xs text-red-600 dark:text-red-400 font-semibold">
                          {scheduleError}
                        </p>
                      )}

                      <div className="mt-3 flex items-center justify-end">
                        <button
                          type="button"
                          onClick={handleCreateSchedule}
                          disabled={scheduleSaving}
                          className="px-4 py-2 rounded-full bg-black dark:bg-white text-white dark:text-black text-sm font-semibold disabled:opacity-60"
                        >
                          {scheduleSaving ? 'Saving…' : 'Add Schedule'}
                        </button>
                      </div>
                    </div>
                  )}

                  <ScheduleDisplay
                    trains={trains}
                    station={selectedStation}
                    lineColor={selectedLine?.color || '#3b82f6'}
                  />
                </div>
              )}
            </div>
          )}

          {activeTab === 'duties' && (
            <div className="rounded-2xl border border-slate-100 dark:border-slate-800/60 bg-white dark:bg-slate-900/50 p-4 sm:p-6 min-h-96">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-bold dark:text-white">Upcoming Duties & Roster</h3>
                  <p className="text-sm opacity-70">View your assigned shifts and associated train lines.</p>
                </div>
                <button
                  onClick={() => alert('Clocked in successfully!')}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center gap-2 transform transition-all active:scale-95 shadow-lg shadow-blue-500/30"
                >
                  <MapPin size={18} /> GPS Clock-In
                </button>
              </div>
              {!selectedStation ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                  <Calendar className="w-16 h-16 mb-4 opacity-30" />
                  <p className="text-sm">Select a station from the sidebar to view current local rosters.</p>
                </div>
              ) : (
                <div className="mt-4">
                  <div className="mb-4 p-4 rounded-xl border border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800 flex items-start gap-3">
                    <Clock className="text-blue-500 w-5 h-5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-bold text-blue-900 dark:text-blue-100">Next Shift: 14:00 - 22:00</p>
                      <p className="text-xs text-blue-700 dark:text-blue-300">Station Manager - {selectedStation}</p>
                    </div>
                  </div>
                  <ScheduleDisplay
                    trains={trains.slice(0, 5)}
                    station={selectedStation}
                    lineColor={selectedLine?.color || '#3b82f6'}
                  />
                </div>
              )}
            </div>
          )}

          {activeTab === 'incident' && (
            <div className="rounded-2xl border border-rose-100 dark:border-rose-900/30 bg-white dark:bg-[#110505] p-4 sm:p-6 min-h-96 shadow-md shadow-rose-900/5">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-900/40 flex items-center justify-center text-rose-600 dark:text-rose-400">
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-bold dark:text-white text-rose-950">On-Ground Incident Report</h3>
                  <p className="text-sm opacity-70">Directly alert supervisors and dispatch about live issues.</p>
                </div>
              </div>
              
              <form className="max-w-xl space-y-5" onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                onAddAlert({
                  type: formData.get('type') as any,
                  severity: formData.get('severity') as any,
                  title: String(formData.get('title')),
                  message: String(formData.get('message')),
                  station: selectedStation || 'System',
                  section: section
                });
                alert('Alert dispatched instantly to Supervisor board.');
                e.currentTarget.reset();
              }}>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold uppercase opacity-60 mb-2 block text-rose-900 dark:text-rose-100">Type</label>
                    <select name="type" className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-lg p-3 text-sm">
                      <option value="technical">Technical Fault</option>
                      <option value="security">Security Issue</option>
                      <option value="medical">Medical Emergency</option>
                      <option value="delay">Crowd Overload</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase opacity-60 mb-2 block text-rose-900 dark:text-rose-100">Severity</label>
                    <select name="severity" className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-lg p-3 text-sm text-red-600 font-semibold">
                      <option value="warning">Warning / Minor</option>
                      <option value="critical">CRITICAL / Requires Halt</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="text-xs font-bold uppercase opacity-60 mb-2 block text-rose-900 dark:text-rose-100">Incident Heading</label>
                  <input name="title" required placeholder="e.g. Broken Fare Gate" className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-lg p-3 text-sm" />
                </div>
                
                <div>
                  <label className="text-xs font-bold uppercase opacity-60 mb-2 block text-rose-900 dark:text-rose-100">Detailed Description</label>
                  <textarea name="message" required placeholder="Provide exact location and context..." rows={4} className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-lg p-3 text-sm resize-none"></textarea>
                </div>

                <div className="pt-2">
                  <button type="submit" className="w-full py-4 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 text-white font-bold text-sm hover:from-rose-600 hover:to-red-700 shadow-xl shadow-red-500/20 active:scale-95 transition-all">Submit Live Report</button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'map' && (
            <div
              className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden"
              style={{ height: 'min(70vh, 600px)' }}
            >
              {selectedLine ? (
                <SatelliteMap
                  line={selectedLine}
                  selectedStation={selectedStation || undefined}
                  trains={trains}
                  onTrainSelect={(train, position) => {
                    setActiveTrain(train);
                    setActiveTrainPosition(position);
                  }}
                />
              ) : (
                <div className="h-full flex items-center justify-center bg-slate-50 dark:bg-slate-800">
                  <div className="text-center text-slate-400">
                    <Map className="w-16 h-16 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">Select a line to view the satellite map</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'health' && (
            <div className="space-y-4">
              {!selectedStation ? (
                <div className="rounded-2xl border border-slate-100 dark:border-slate-800/60 bg-white dark:bg-slate-900/50 p-12 flex flex-col items-center text-slate-400">
                  <Activity className="w-16 h-16 mb-4 opacity-30" />
                  <p className="text-sm">Select a station to view train health data</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {trains.slice(0, 4).map((train) => (
                    <TrainHealthCard
                      key={train.id}
                      trainNumber={train.trainNumber}
                      health={train.health}
                    />
                  ))}
                  {trains.length === 0 && (
                    <div className="col-span-2 rounded-2xl border border-slate-100 dark:border-slate-800/60 bg-white dark:bg-slate-900/50 p-12 text-center text-slate-400">
                      <p className="text-sm">No trains available</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {metrics && <StationEfficiencyCard metrics={metrics} />}
                {trains.length > 0 && <CapacityVisualization capacity={trains[0].capacity} />}
              </div>
              <div className="rounded-2xl border border-slate-100 dark:border-slate-800/60 bg-white dark:bg-slate-900/50 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-4 h-4 text-blue-500" />
                  <p className="text-sm text-slate-700 dark:text-slate-200 font-semibold">
                    Hourly Passenger Flow
                  </p>
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart
                    data={hourlyPassengers}
                    margin={{ top: 5, right: 10, bottom: 5, left: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#f0f0f0'} />
                    <XAxis
                      dataKey="hour"
                      tick={{ fontSize: 11, fill: isDark ? '#9ca3af' : '#6b7280' }}
                    />
                    <YAxis tick={{ fontSize: 11, fill: isDark ? '#9ca3af' : '#6b7280' }} />
                    <Tooltip
                      contentStyle={{
                        background: isDark ? '#1e293b' : '#fff',
                        border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                        borderRadius: 8,
                        fontSize: 12,
                        color: isDark ? '#f1f5f9' : '#1e293b',
                      }}
                    />
                    <Bar dataKey="passengers" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="rounded-2xl border border-slate-100 dark:border-slate-800/60 bg-white dark:bg-slate-900/50 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                  <p className="text-sm text-slate-700 dark:text-slate-200 font-semibold">
                    Weekly Performance Trend
                  </p>
                </div>
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={healthTrend} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#f0f0f0'} />
                    <XAxis
                      dataKey="day"
                      tick={{ fontSize: 11, fill: isDark ? '#9ca3af' : '#6b7280' }}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: isDark ? '#9ca3af' : '#6b7280' }}
                      domain={[60, 100]}
                    />
                    <Tooltip
                      contentStyle={{
                        background: isDark ? '#1e293b' : '#fff',
                        border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                        borderRadius: 8,
                        fontSize: 12,
                        color: isDark ? '#f1f5f9' : '#1e293b',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="health"
                      stroke="#8b5cf6"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      name="Avg Health"
                    />
                    <Line
                      type="monotone"
                      dataKey="onTime"
                      stroke="#10b981"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      name="On-Time %"
                    />
                  </LineChart>
                </ResponsiveContainer>
                <div className="flex gap-4 mt-2">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-0.5 bg-purple-500" />
                    <span className="text-xs text-slate-500">Avg Health %</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-0.5 bg-emerald-500" />
                    <span className="text-xs text-slate-500">On-Time %</span>
                  </div>
                </div>
              </div>
              {trains.length > 0 && (
                <div className="rounded-2xl border border-slate-100 dark:border-slate-800/60 bg-white dark:bg-slate-900/50 p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Zap className="w-4 h-4 text-amber-500" />
                    <p className="text-sm text-slate-700 dark:text-slate-200 font-semibold">
                      Average Capacity
                    </p>
                  </div>
                  <div className="flex items-center gap-6">
                    <ResponsiveContainer width={140} height={140}>
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Occupied', value: avgCapacity },
                            { name: 'Available', value: 100 - avgCapacity },
                          ]}
                          cx="50%"
                          cy="50%"
                          innerRadius={45}
                          outerRadius={65}
                          dataKey="value"
                          startAngle={90}
                          endAngle={-270}
                        >
                          {CAPACITY_PIE_COLORS.map((c, i) => (
                            <Cell key={i} fill={c} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div>
                      <p className="text-3xl text-slate-900 dark:text-white font-bold">
                        {avgCapacity}%
                      </p>
                      <p className="text-sm text-slate-500">Average load across all trains</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'alerts' && (
            <div
              className="rounded-2xl border border-slate-100 dark:border-slate-800/60 bg-white dark:bg-slate-900/50 p-4 sm:p-6"
              style={{ minHeight: 480 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <Bell className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                <h3 className="text-slate-900 dark:text-white font-semibold">
                  {section === 'metro' ? 'Metro' : 'Railway'} Alert System
                </h3>
              </div>
              <AlertPanel
                alerts={alerts.filter((a) => a.section === section)}
                onResolve={onResolveAlert}
                onAdd={onAddAlert}
                userRole={userRole}
                section={section}
              />
            </div>
          )}

          {/* Staff Broadcast Section */}
          {activeTab === 'broadcast' && (
            <div className="max-w-2xl mx-auto py-10">
              <StaffBroadcast
                section={section}
                onBroadcast={onAddAlert}
              />
            </div>
          )}

          {activeTab === 'medical' && (
            <div
              className="rounded-2xl border border-slate-100 dark:border-slate-800/60 bg-white dark:bg-slate-900/50 p-4 sm:p-6"
              style={{ minHeight: 480 }}
            >
              <MedicalPrescription selectedStation={selectedStation} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
