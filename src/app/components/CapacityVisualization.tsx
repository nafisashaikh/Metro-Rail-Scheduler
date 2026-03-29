import { TrainCapacity } from '../types/metro';
import { Users } from 'lucide-react';

interface CapacityVisualizationProps {
  capacity: TrainCapacity;
}

export function CapacityVisualization({ capacity }: CapacityVisualizationProps) {
  const getBarColor = (p: number) => {
    if (p >= 90) return 'bg-red-500';
    if (p >= 75) return 'bg-orange-500';
    if (p >= 50) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  const getLabel = (p: number) => {
    if (p >= 90) return 'Very Crowded';
    if (p >= 75) return 'Crowded';
    if (p >= 50) return 'Moderate';
    return 'Comfortable';
  };

  const predictedPct = Math.round((capacity.predicted / capacity.total) * 100);

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5">
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-4 h-4 text-slate-500 dark:text-slate-400" />
        <span className="text-sm text-slate-800 dark:text-slate-200" style={{ fontWeight: 600 }}>
          Passenger Capacity
        </span>
      </div>

      {/* Current */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-xs text-slate-500 dark:text-slate-400">Current Load</span>
          <div className="text-right">
            <span className="text-lg text-slate-900 dark:text-white" style={{ fontWeight: 700 }}>
              {capacity.percentage}%
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500 ml-1">
              ({capacity.current.toLocaleString()}/{capacity.total.toLocaleString()})
            </span>
          </div>
        </div>
        <div className="h-5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
          <div
            className={`h-full ${getBarColor(capacity.percentage)} flex items-center justify-center text-white text-[10px] transition-all duration-500 rounded-full`}
            style={{ width: `${Math.min(capacity.percentage, 100)}%`, fontWeight: 600 }}
          >
            {capacity.percentage > 25 && getLabel(capacity.percentage)}
          </div>
        </div>
      </div>

      {/* Predicted */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-xs text-slate-500 dark:text-slate-400">Predicted Load</span>
          <div className="text-right">
            <span className="text-lg text-slate-900 dark:text-white" style={{ fontWeight: 700 }}>
              {predictedPct}%
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500 ml-1">
              ({capacity.predicted.toLocaleString()})
            </span>
          </div>
        </div>
        <div className="h-5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
          <div
            className={`h-full ${getBarColor(predictedPct)} opacity-60 flex items-center justify-center text-white text-[10px] transition-all duration-500 rounded-full`}
            style={{ width: `${Math.min(predictedPct, 100)}%` }}
          >
            {predictedPct > 25 && getLabel(predictedPct)}
          </div>
        </div>
      </div>

      {/* Grid visualization */}
      <div className="mb-4">
        <p className="text-[10px] text-slate-400 dark:text-slate-500 mb-1.5">Visual distribution</p>
        <div className="grid grid-cols-10 gap-0.5">
          {Array.from({ length: 100 }, (_, i) => (
            <div
              key={i}
              className={`h-2.5 rounded-sm ${i < capacity.percentage ? getBarColor(capacity.percentage) : 'bg-slate-100 dark:bg-slate-700'}`}
            />
          ))}
        </div>
      </div>

      {/* Recommendation */}
      <div
        className={`p-3 rounded-lg text-xs ${
          capacity.percentage >= 90
            ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-100 dark:border-red-900'
            : capacity.percentage >= 75
              ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-900'
              : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900'
        }`}
      >
        {capacity.percentage >= 90
          ? '⚠️ Very crowded – consider waiting for the next train'
          : capacity.percentage >= 75
            ? '🟡 Crowded – board with caution'
            : '✓ Comfortable – good time to board'}
      </div>
    </div>
  );
}
