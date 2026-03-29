import { useState, useEffect } from 'react';
import {
  MetroLine,
  Train,
  StationMetrics,
  Alert,
  SystemSection,
  UserRole,
  WeatherData,
} from '../types/metro';
import { generateTrainsForStation, getStationMetrics } from '../data/metroData';
import { generateRailwayTrains, getRailwayStationMetrics } from '../data/railwayData';
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
}

// Staff tabs
const STAFF_TABS = [
  { id: 'schedule', label: 'Schedule', icon: Calendar },
  { id: 'map', label: 'Satellite Map', icon: Map },
  { id: 'health', label: 'Train Health', icon: Activity },
  { id: 'analytics', label: 'Analytics', icon: BarChart2 },
  { id: 'alerts', label: 'Alerts', icon: Bell },
  { id: 'medical', label: 'Medical Guide', icon: Stethoscope },
] as const;

// Passenger tabs (read-only, public-safe)
const PASSENGER_TABS = [
  { id: 'journey', label: 'Journey Planner', icon: MapPin },
  { id: 'map', label: 'Live Map', icon: Map },
  { id: 'alerts', label: 'Announcements', icon: Bell },
  { id: 'medical', label: 'Medical Guide', icon: Stethoscope },
] as const;

type StaffTabId = (typeof STAFF_TABS)[number]['id'];
type PassengerTabId = (typeof PASSENGER_TABS)[number]['id'];
type TabId = StaffTabId | PassengerTabId;

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
}: DashboardSectionProps) {
  const isPassenger = userRole === 'passenger';
  const TAB_LIST = isPassenger ? PASSENGER_TABS : STAFF_TABS;
  const [selectedLine, setSelectedLine] = useState<MetroLine | null>(lines[0] || null);
  const [selectedStation, setSelectedStation] = useState<string | null>(null);
  const [trains, setTrains] = useState<Train[]>([]);
  const [activeTrain, setActiveTrain] = useState<Train | null>(null);
  const [activeTrainPosition, setActiveTrainPosition] = useState<[number, number] | null>(null);
  const [metrics, setMetrics] = useState<StationMetrics | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>(isPassenger ? 'journey' : 'schedule');

  useEffect(() => {
    if (selectedLine && selectedStation) {
      const generated =
        section === 'metro'
          ? generateTrainsForStation(selectedStation, selectedLine)
          : generateRailwayTrains(selectedStation, selectedLine);
      setTrains(generated);
      const m =
        section === 'metro'
          ? getStationMetrics(selectedStation)
          : getRailwayStationMetrics(selectedStation);
      setMetrics(m);
    } else {
      setTrains([]);
      setMetrics(null);
    }
  }, [selectedLine, selectedStation, section]);

  useEffect(() => {
    if (showAlerts) setActiveTab('alerts');
  }, [showAlerts]);

  const handleLineSelect = (line: MetroLine) => {
    setSelectedLine(line);
    setSelectedStation(null);
  };

  // Stats
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

  // Analytics data
  const hourlyPassengers = Array.from({ length: 12 }, (_, i) => ({
    hour: `${i + 6}:00`,
    passengers: Math.round(2000 + Math.sin((i - 2) * 0.8) * 1500 + Math.random() * 300),
  }));
  const healthTrend = Array.from({ length: 7 }, (_, i) => ({
    day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
    health: Math.round(75 + Math.random() * 20),
    onTime: Math.round(80 + Math.random() * 15),
  }));

  return (
    <div className="flex gap-6 min-h-0">
      {/* Left sidebar - Made sticky and independently scrollable to prevent massive empty white space on the right */}
      <div className="w-72 flex-shrink-0 flex flex-col gap-4 sticky top-[80px] self-start max-h-[calc(100vh-100px)] overflow-y-auto pb-8 scrollbar-hide">
        {/* Line selector */}
        <div className="rounded-2xl border border-slate-100 dark:border-slate-800/60 bg-white dark:bg-slate-900/50 p-4">
          <MetroLineSelector
            lines={lines}
            selectedLine={selectedLine}
            onSelectLine={handleLineSelect}
          />
        </div>

        {/* Station selector */}
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

        {/* Quick stats */}
        {selectedStation && trains.length > 0 && (
          <div className="rounded-2xl border border-slate-100 dark:border-slate-800/60 bg-white dark:bg-slate-900/50 p-4">
            <p
              className="text-xs text-slate-500 dark:text-slate-400 mb-3"
              style={{ fontWeight: 600 }}
            >
              QUICK STATS
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
                    <p
                      className="text-lg text-slate-900 dark:text-white"
                      style={{ fontWeight: 700 }}
                    >
                      {stat.value}
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">{stat.label}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Alerts mini panel */}
        {sectionAlerts.length > 0 && (
          <div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Bell className="w-4 h-4 text-red-500" />
              <span className="text-sm text-red-700 dark:text-red-300" style={{ fontWeight: 600 }}>
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
              className="mt-2 text-xs text-red-600 dark:text-red-400 flex items-center gap-1 hover:text-red-700 dark:hover:text-red-300"
              style={{ fontWeight: 600 }}
            >
              View all alerts <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Route diagram (collapsed state) */}
        {selectedLine && (
          <div className="rounded-2xl border border-slate-100 dark:border-slate-800/60 bg-white dark:bg-slate-900/50 overflow-hidden">
            <RouteMapVisualization
              line={selectedLine}
              currentStation={selectedStation || undefined}
            />
          </div>
        )}

        {/* Weather */}
        <WeatherWidget weather={weather} />
      </div>

      {/* Main content */}
      <div className="flex-1 min-w-0 flex flex-col gap-4">
        {/* Tab bar */}
        <div className="flex gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 w-fit">
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
                className={`relative flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm transition-all ${
                  activeTab === tab.id
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
                style={{ fontWeight: activeTab === tab.id ? 600 : 400 }}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
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

        {/* Tab content */}
        {activeTrain && activeTrainPosition && (
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 p-3 mb-3">
            <p className="text-xs text-slate-500 dark:text-slate-400" style={{ fontWeight: 600 }}>
              Active train selected: {activeTrain.id} at ({activeTrainPosition[0].toFixed(3)}, {activeTrainPosition[1].toFixed(3)})
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Status: {activeTrain.status}, Health: {activeTrain.health.overall}%
            </p>
          </div>
        )}
        <div className="flex-1 min-h-[500px]">
          {/* ── Journey Planner (passenger only) ── */}
          {activeTab === 'journey' && (
            <div className="rounded-2xl border border-slate-100 dark:border-slate-800/60 bg-white dark:bg-slate-900/50 p-6 min-h-96">
              <PassengerJourneyPlanner
                lines={lines}
                section={section}
                onTrainSelect={(train, source) => {
                  setActiveTrain(train);
                  setActiveTab('map');
                  if (source) setSelectedStation(source);
                }}
              />
            </div>
          )}
          {/* ── Schedule ── */}
          {activeTab === 'schedule' && (
            <div className="rounded-2xl border border-slate-100 dark:border-slate-800/60 bg-white dark:bg-slate-900/50 p-6 min-h-96">
              {!selectedStation ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400 dark:text-slate-600">
                  <Calendar className="w-16 h-16 mb-4 opacity-30" />
                  <p
                    className="text-lg mb-1 text-slate-500 dark:text-slate-400"
                    style={{ fontWeight: 500 }}
                  >
                    Select a station
                  </p>
                  <p className="text-sm">
                    Choose a line and station from the sidebar to view live schedules
                  </p>
                </div>
              ) : (
                <ScheduleDisplay
                  trains={trains}
                  station={selectedStation}
                  lineColor={selectedLine?.color || '#3b82f6'}
                />
              )}
            </div>
          )}

          {/* ── Satellite Map ── */}
          {activeTab === 'map' && (
            <div
              className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden"
              style={{ height: 520 }}
            >
              {selectedLine ? (
                <SatelliteMap
                  line={selectedLine}
                  selectedStation={selectedStation || undefined}
                  trains={trains}
                  onTrainSelect={(train, position) => {
                    setActiveTrain(train);
                    setActiveTrainPosition(position);
                    setActiveTab('map');
                    // Keep selected station as-is when picking a train marker.
                    setSelectedStation(selectedStation);
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

          {/* ── Train Health ── */}
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
                      <p className="text-sm">No trains available for health monitoring</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── Analytics ── */}
          {activeTab === 'analytics' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {metrics && <StationEfficiencyCard metrics={metrics} />}
                {trains.length > 0 && <CapacityVisualization capacity={trains[0].capacity} />}
              </div>

              {/* Hourly passengers chart */}
              <div className="rounded-2xl border border-slate-100 dark:border-slate-800/60 bg-white dark:bg-slate-900/50 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-4 h-4 text-blue-500" />
                  <p
                    className="text-sm text-slate-700 dark:text-slate-200"
                    style={{ fontWeight: 600 }}
                  >
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

              {/* Health trend */}
              <div className="rounded-2xl border border-slate-100 dark:border-slate-800/60 bg-white dark:bg-slate-900/50 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                  <p
                    className="text-sm text-slate-700 dark:text-slate-200"
                    style={{ fontWeight: 600 }}
                  >
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
                    <span className="text-xs text-slate-500 dark:text-slate-400">Avg Health %</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-0.5 bg-emerald-500" />
                    <span className="text-xs text-slate-500 dark:text-slate-400">On-Time %</span>
                  </div>
                </div>
              </div>

              {/* Capacity donut */}
              {trains.length > 0 && (
                <div className="rounded-2xl border border-slate-100 dark:border-slate-800/60 bg-white dark:bg-slate-900/50 p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Zap className="w-4 h-4 text-amber-500" />
                    <p
                      className="text-sm text-slate-700 dark:text-slate-200"
                      style={{ fontWeight: 600 }}
                    >
                      Average Capacity Distribution
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
                      <p
                        className="text-3xl text-slate-900 dark:text-white"
                        style={{ fontWeight: 700 }}
                      >
                        {avgCapacity}%
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Average load across all trains
                      </p>
                      <div className="mt-3 space-y-1">
                        <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                          <div className="w-2.5 h-2.5 rounded-sm bg-blue-500" />
                          <span>Occupied — {avgCapacity}%</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                          <div className="w-2.5 h-2.5 rounded-sm bg-slate-200 dark:bg-slate-600" />
                          <span>Available — {100 - avgCapacity}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Alerts ── */}
          {activeTab === 'alerts' && (
            <div
              className="rounded-2xl border border-slate-100 dark:border-slate-800/60 bg-white dark:bg-slate-900/50 p-6"
              style={{ minHeight: 480 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <Bell className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                <h3 className="text-slate-900 dark:text-white" style={{ fontWeight: 600 }}>
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

          {/* ── Medical Guide ── */}
          {activeTab === 'medical' && (
            <div
              className="rounded-2xl border border-slate-100 dark:border-slate-800/60 bg-white dark:bg-slate-900/50 p-6"
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
