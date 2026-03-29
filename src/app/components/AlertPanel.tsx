import { useState } from 'react';
import { Alert, SystemSection, UserRole } from '../types/metro';
import {
  Heart,
  Wrench,
  Shield,
  CloudRain,
  Clock,
  CheckCircle,
  ChevronRight,
  X,
  ArrowRight,
  Plus,
} from 'lucide-react';

interface AlertPanelProps {
  alerts: Alert[];
  onResolve: (id: string) => void;
  onAdd: (alert: Omit<Alert, 'id' | 'timestamp' | 'resolved'>) => void;
  userRole: UserRole;
  section: SystemSection;
}

const alertTypeConfig = {
  medical: {
    icon: Heart,
    color: 'text-red-500',
    bg: 'bg-red-50 dark:bg-red-900/20',
    border: 'border-red-200 dark:border-red-800',
    badgeColor: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  },
  technical: {
    icon: Wrench,
    color: 'text-amber-500',
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    border: 'border-amber-200 dark:border-amber-800',
    badgeColor: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  },
  security: {
    icon: Shield,
    color: 'text-purple-500',
    bg: 'bg-purple-50 dark:bg-purple-900/20',
    border: 'border-purple-200 dark:border-purple-800',
    badgeColor: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  },
  weather: {
    icon: CloudRain,
    color: 'text-blue-500',
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    border: 'border-blue-200 dark:border-blue-800',
    badgeColor: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  },
  delay: {
    icon: Clock,
    color: 'text-orange-500',
    bg: 'bg-orange-50 dark:bg-orange-900/20',
    border: 'border-orange-200 dark:border-orange-800',
    badgeColor: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  },
};

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

export function AlertPanel({ alerts, onResolve, onAdd, userRole, section }: AlertPanelProps) {
  const [filter, setFilter] = useState<'all' | 'active' | 'resolved'>('active');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAlert, setNewAlert] = useState({
    type: 'technical' as Alert['type'],
    station: '',
    message: '',
  });

  const canManageAlerts = userRole === 'admin' || userRole === 'supervisor';

  const filtered = alerts.filter((a) => {
    if (filter === 'active') return !a.resolved;
    if (filter === 'resolved') return a.resolved;
    return true;
  });

  const handleAddAlert = () => {
    if (!newAlert.station || !newAlert.message) return;
    onAdd({
      type: newAlert.type,
      severity: newAlert.type === 'medical' ? 'critical' : 'warning',
      title: `${newAlert.type.charAt(0).toUpperCase() + newAlert.type.slice(1)} Alert`,
      message: newAlert.message,
      station: newAlert.station,
      section,
      journeyContinued: newAlert.type === 'medical' ? true : undefined,
    });
    setNewAlert({ type: 'technical', station: '', message: '' });
    setShowAddForm(false);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-1 p-1 rounded-lg bg-slate-100 dark:bg-slate-800">
          {(['active', 'all', 'resolved'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-md text-xs capitalize transition-all ${
                filter === f
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
              style={{ fontWeight: filter === f ? 600 : 400 }}
            >
              {f}{' '}
              {f !== 'all' && (
                <span className="ml-1 opacity-70">
                  ({alerts.filter((a) => (f === 'active' ? !a.resolved : a.resolved)).length})
                </span>
              )}
            </button>
          ))}
        </div>
        {canManageAlerts && (
          <button
            onClick={() => setShowAddForm((s) => !s)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs transition-colors"
            style={{ fontWeight: 600 }}
          >
            <Plus className="w-3.5 h-3.5" />
            Add Alert
          </button>
        )}
      </div>

      {/* Add form */}
      {showAddForm && canManageAlerts && (
        <div className="mb-4 p-4 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20">
          <p
            className="text-sm text-slate-700 dark:text-slate-300 mb-3"
            style={{ fontWeight: 600 }}
          >
            New Alert
          </p>
          <div className="space-y-2.5">
            <select
              value={newAlert.type}
              onChange={(e) =>
                setNewAlert((a) => ({ ...a, type: e.target.value as Alert['type'] }))
              }
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
            >
              <option value="medical">Medical Emergency</option>
              <option value="technical">Technical Issue</option>
              <option value="security">Security Alert</option>
              <option value="weather">Weather Alert</option>
              <option value="delay">Service Delay</option>
            </select>
            <input
              type="text"
              placeholder="Station name..."
              value={newAlert.station}
              onChange={(e) => setNewAlert((a) => ({ ...a, station: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
            />
            <input
              type="text"
              placeholder="Alert message..."
              value={newAlert.message}
              onChange={(e) => setNewAlert((a) => ({ ...a, message: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
            />
            <div className="flex gap-2">
              <button
                onClick={handleAddAlert}
                className="flex-1 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700 transition-colors"
                style={{ fontWeight: 600 }}
              >
                Submit Alert
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Alert list */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <CheckCircle className="w-12 h-12 mx-auto text-emerald-300 dark:text-emerald-600 mb-3" />
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {filter === 'active' ? 'No active alerts' : 'No alerts found'}
            </p>
          </div>
        ) : (
          filtered.map((alert) => {
            const cfg = alertTypeConfig[alert.type];
            const Icon = cfg.icon;
            return (
              <div
                key={alert.id}
                className={`rounded-xl border p-4 transition-all ${cfg.bg} ${cfg.border} ${alert.resolved ? 'opacity-60' : ''}`}
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 flex-shrink-0 ${cfg.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${cfg.badgeColor}`}
                        style={{ fontWeight: 600 }}
                      >
                        {alert.type.toUpperCase()}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          alert.severity === 'critical'
                            ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
                            : alert.severity === 'warning'
                              ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                        style={{ fontWeight: 600 }}
                      >
                        {alert.severity}
                      </span>
                      {alert.resolved && (
                        <span
                          className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                          style={{ fontWeight: 600 }}
                        >
                          RESOLVED
                        </span>
                      )}
                    </div>
                    <p
                      className="text-sm text-slate-700 dark:text-slate-200 mb-0.5"
                      style={{ fontWeight: 600 }}
                    >
                      {alert.title}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      {alert.message}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                      📍 {alert.station} · {formatTime(alert.timestamp)}
                    </p>

                    {/* Medical alert special UI */}
                    {alert.type === 'medical' && alert.journeyContinued && (
                      <div className="mt-2 flex items-center gap-2 p-2 rounded-lg bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800">
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
                        <div className="flex items-center gap-1 text-xs text-red-700 dark:text-red-300 flex-wrap">
                          <span style={{ fontWeight: 600 }}>Journey continuing</span>
                          {alert.nextStation && (
                            <>
                              <ArrowRight className="w-3 h-3" />
                              <span>{alert.nextStation}</span>
                              <span className="text-red-500">· Medical team en route</span>
                            </>
                          )}
                        </div>
                      </div>
                    )}

                    {canManageAlerts && !alert.resolved && (
                      <button
                        onClick={() => onResolve(alert.id)}
                        className="mt-2 flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
                        style={{ fontWeight: 600 }}
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        Mark as resolved
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                  {canManageAlerts && !alert.resolved && (
                    <button
                      onClick={() => onResolve(alert.id)}
                      className="flex-shrink-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
