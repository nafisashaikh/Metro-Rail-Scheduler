import { TrainHealth } from '../types/metro';
import { Activity, Wrench, AlertTriangle, CheckCircle } from 'lucide-react';

interface TrainHealthCardProps {
  trainNumber: string;
  health: TrainHealth;
}

export function TrainHealthCard({ trainNumber, health }: TrainHealthCardProps) {
  const getStatusStyle = (status: TrainHealth['status']) => {
    switch (status) {
      case 'excellent':
        return 'text-emerald-600 dark:text-emerald-400';
      case 'good':
        return 'text-blue-600 dark:text-blue-400';
      case 'fair':
        return 'text-amber-600 dark:text-amber-400';
      case 'poor':
        return 'text-red-600 dark:text-red-400';
    }
  };

  const getBarColor = (value: number) => {
    if (value >= 85) return 'bg-emerald-500';
    if (value >= 70) return 'bg-blue-500';
    if (value >= 60) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const healthMetrics = [
    { label: 'Engine', value: health.engine },
    { label: 'Brakes', value: health.brakes },
    { label: 'Doors', value: health.doors },
    { label: 'AC System', value: health.ac },
  ];

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-slate-500 dark:text-slate-400" />
          <span className="text-sm text-slate-800 dark:text-slate-200" style={{ fontWeight: 600 }}>
            Train {trainNumber}
          </span>
        </div>
        <div className={`flex items-center gap-1.5 ${getStatusStyle(health.status)}`}>
          {health.status === 'excellent' || health.status === 'good' ? (
            <CheckCircle className="w-4 h-4" />
          ) : (
            <AlertTriangle className="w-4 h-4" />
          )}
          <span className="text-xs capitalize" style={{ fontWeight: 600 }}>
            {health.status}
          </span>
        </div>
      </div>

      {/* Overall */}
      <div className="rounded-lg bg-slate-50 dark:bg-slate-900 p-3 mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-slate-500 dark:text-slate-400" style={{ fontWeight: 500 }}>
            Overall Health
          </span>
          <span className="text-xl text-slate-900 dark:text-white" style={{ fontWeight: 700 }}>
            {health.overall}%
          </span>
        </div>
        <div className="h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <div
            className={`h-full ${getBarColor(health.overall)} transition-all duration-500 rounded-full`}
            style={{ width: `${health.overall}%` }}
          />
        </div>
      </div>

      {/* Component metrics */}
      <div className="space-y-2.5 mb-4">
        {healthMetrics.map((m) => (
          <div key={m.label}>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-500 dark:text-slate-400">{m.label}</span>
              <span className="text-slate-700 dark:text-slate-300" style={{ fontWeight: 600 }}>
                {m.value}%
              </span>
            </div>
            <div className="h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className={`h-full ${getBarColor(m.value)} transition-all duration-500 rounded-full`}
                style={{ width: `${m.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Maintenance */}
      <div className="border-t border-slate-100 dark:border-slate-700 pt-3 space-y-1.5">
        <div className="flex items-center gap-2 text-xs">
          <Wrench className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-400 dark:text-slate-500">Last:</span>
          <span className="text-slate-600 dark:text-slate-400">{health.lastMaintenance}</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <Wrench className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-400 dark:text-slate-500">Next:</span>
          <span className="text-slate-600 dark:text-slate-400" style={{ fontWeight: 600 }}>
            {health.nextMaintenance}
          </span>
        </div>
      </div>
    </div>
  );
}
