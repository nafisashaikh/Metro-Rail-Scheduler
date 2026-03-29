import { StationMetrics } from '../types/metro';
import { TrendingUp, Users, Clock, AlertCircle } from 'lucide-react';

interface StationEfficiencyCardProps {
  metrics: StationMetrics;
}

export function StationEfficiencyCard({ metrics }: StationEfficiencyCardProps) {
  const getCongestionStyle = (level: StationMetrics['congestionLevel']) => {
    switch (level) {
      case 'low':
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'medium':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
      case 'high':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
    }
  };

  const getEfficiencyColor = (e: number) =>
    e >= 85
      ? 'text-emerald-600 dark:text-emerald-400'
      : e >= 70
        ? 'text-blue-600 dark:text-blue-400'
        : e >= 60
          ? 'text-amber-600 dark:text-amber-400'
          : 'text-red-600 dark:text-red-400';

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-slate-500 dark:text-slate-400" />
          <span className="text-sm text-slate-800 dark:text-slate-200" style={{ fontWeight: 600 }}>
            Station Efficiency
          </span>
        </div>
        <span
          className={`text-[10px] px-2 py-0.5 rounded-full ${getCongestionStyle(metrics.congestionLevel)}`}
          style={{ fontWeight: 600 }}
        >
          {metrics.congestionLevel.toUpperCase()} CONGESTION
        </span>
      </div>

      {/* Score grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="rounded-lg bg-slate-50 dark:bg-slate-900 p-3 text-center">
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Efficiency</p>
          <p
            className={`text-2xl ${getEfficiencyColor(metrics.efficiency)}`}
            style={{ fontWeight: 700 }}
          >
            {metrics.efficiency}%
          </p>
        </div>
        <div className="rounded-lg bg-slate-50 dark:bg-slate-900 p-3 text-center">
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">On-Time Rate</p>
          <p className="text-2xl text-blue-600 dark:text-blue-400" style={{ fontWeight: 700 }}>
            {metrics.onTimePercentage}%
          </p>
        </div>
      </div>

      {/* Metrics list */}
      <div className="space-y-2.5 mb-4">
        <div className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400" />
            <span className="text-xs text-slate-600 dark:text-slate-400">Avg Delay</span>
          </div>
          <span className="text-sm text-slate-800 dark:text-slate-200" style={{ fontWeight: 600 }}>
            {metrics.avgDelay} min
          </span>
        </div>

        <div className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-slate-400" />
            <span className="text-xs text-slate-600 dark:text-slate-400">Daily Passengers</span>
          </div>
          <span className="text-sm text-slate-800 dark:text-slate-200" style={{ fontWeight: 600 }}>
            {(metrics.dailyPassengers / 1000).toFixed(1)}K
          </span>
        </div>
      </div>

      {/* Peak hours */}
      <div className="border-t border-slate-100 dark:border-slate-700 pt-3">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-3.5 h-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
          <div>
            <p
              className="text-xs text-slate-600 dark:text-slate-400 mb-1.5"
              style={{ fontWeight: 600 }}
            >
              Peak Hours
            </p>
            <div className="flex gap-1.5 flex-wrap">
              {metrics.peakHours.map((t) => (
                <span
                  key={t}
                  className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-600"
                  style={{ fontWeight: 600 }}
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
