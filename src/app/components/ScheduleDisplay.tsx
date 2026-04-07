import { Train } from '../types/metro';
import { AlertCircle, Activity, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { TrainHealthCard } from './TrainHealthCard';
import { CapacityVisualization } from './CapacityVisualization';
import { PredictiveScheduling } from './PredictiveScheduling';
import { predictTrainArrival } from '../data/metroData';

interface ScheduleDisplayProps {
  trains: Train[];
  station: string;
  lineColor: string;
}

export function ScheduleDisplay({ trains, station, lineColor }: ScheduleDisplayProps) {
  const [selectedTrain, setSelectedTrain] = useState<Train | null>(null);

  const getStatusStyle = (status: Train['status']) => {
    switch (status) {
      case 'on-time':
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'delayed':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
      case 'cancelled':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
    }
  };

  const getStatusText = (status: Train['status']) => {
    switch (status) {
      case 'on-time':
        return '● On Time';
      case 'delayed':
        return '▲ Delayed';
      case 'cancelled':
        return '✕ Cancelled';
    }
  };

  const getHealthColor = (h: number) =>
    h >= 85
      ? 'text-emerald-600 dark:text-emerald-400'
      : h >= 70
        ? 'text-blue-600 dark:text-blue-400'
        : h >= 60
          ? 'text-amber-600 dark:text-amber-400'
          : 'text-red-600 dark:text-red-400';

  const getCapacityColor = (p: number) =>
    p >= 90
      ? 'text-red-600 dark:text-red-400'
      : p >= 75
        ? 'text-orange-600 dark:text-orange-400'
        : p >= 50
          ? 'text-amber-600 dark:text-amber-400'
          : 'text-emerald-600 dark:text-emerald-400';

  if (trains.length === 0) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
        <p className="text-sm text-slate-500 dark:text-slate-400">No upcoming trains scheduled</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: lineColor }} />
        <span className="text-sm text-slate-700 dark:text-slate-300" style={{ fontWeight: 600 }}>
          Departures from {station}
        </span>
        <span className="ml-auto text-xs text-slate-400 dark:text-slate-500">
          {trains.length} trains
        </span>
      </div>

      <div className="space-y-2.5">
        {trains.map((train) => {
          const prediction = predictTrainArrival(train, station);
          return (
            <button
              key={train.id}
              type="button"
              className={`w-full flex items-start gap-4 p-4 rounded-xl border transition-all text-left group ${
                selectedTrain?.id === train.id
                  ? 'border-orange-400 bg-orange-50 dark:bg-orange-950/20 shadow-sm'
                  : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-sm'
              }`}
              onClick={() => setSelectedTrain(train)}
            >
              <div className="flex-shrink-0 text-center min-w-[72px]">
                <div
                  className="text-2xl text-slate-900 dark:text-white"
                  style={{ fontWeight: 700, lineHeight: 1 }}
                >
                  {train.departureTime}
                </div>
                <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                  Plat. {train.platform}
                </div>
              </div>

              <div className="w-px self-stretch bg-slate-200 dark:bg-slate-700 mx-1 hidden sm:block" />

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-xs text-slate-400 dark:text-slate-500">To</span>
                      <span
                        className="text-sm text-slate-800 dark:text-slate-200"
                        style={{ fontWeight: 600 }}
                      >
                        {train.destination}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 dark:text-slate-500 font-mono">
                      {train.trainNumber}
                    </div>
                  </div>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full flex-shrink-0 ${getStatusStyle(train.status)}`}
                    style={{ fontWeight: 600 }}
                  >
                    {getStatusText(train.status)}
                  </span>
                </div>

                <div className="flex items-center gap-4 mt-2 flex-wrap">
                  <div className="flex items-center gap-1 text-xs">
                    <Activity className="w-3 h-3 text-slate-400" />
                    <span className={getHealthColor(train.health.overall)}>
                      {train.health.overall}%
                    </span>
                  </div>
                  <div className={`text-xs ${getCapacityColor(train.capacity.percentage)}`}>
                    {train.capacity.percentage}% full
                  </div>
                  {prediction.factors.length > 1 && (
                    <div className="text-xs text-amber-600 dark:text-amber-400">
                      ETA {prediction.predictedTime}
                    </div>
                  )}
                </div>
              </div>

              <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-slate-500 dark:group-hover:text-slate-400 flex-shrink-0 mt-1 transition-colors" />
            </button>
          );
        })}
      </div>

      {selectedTrain &&
        (() => {
          const pred = predictTrainArrival(selectedTrain, station);
          return (
            <div className="mt-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p
                    className="text-xs text-slate-400 uppercase tracking-wider"
                    style={{ fontWeight: 700 }}
                  >
                    Selected train
                  </p>
                  <p className="text-sm text-slate-900 dark:text-white" style={{ fontWeight: 700 }}>
                    {selectedTrain.trainNumber} · {selectedTrain.destination}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedTrain(null)}
                  className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                >
                  Clear
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TrainHealthCard
                  trainNumber={selectedTrain.trainNumber}
                  health={selectedTrain.health}
                />
                <CapacityVisualization capacity={selectedTrain.capacity} />
              </div>

              <PredictiveScheduling
                scheduledTime={selectedTrain.departureTime}
                predictedTime={pred.predictedTime}
                confidence={pred.confidence}
                factors={pred.factors}
              />
            </div>
          );
        })()}
    </div>
  );
}
