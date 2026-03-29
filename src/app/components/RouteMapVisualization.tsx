import { MetroLine } from '../types/metro';
import { MapPin } from 'lucide-react';

interface RouteMapVisualizationProps {
  line: MetroLine;
  currentStation?: string;
}

export function RouteMapVisualization({ line, currentStation }: RouteMapVisualizationProps) {
  const currentIndex = currentStation ? line.stations.indexOf(currentStation) : -1;

  return (
    <div className="p-4">
      {/* Line info */}
      <div className="flex items-center gap-2.5 mb-4 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900">
        <div
          className="w-4 h-4 rounded-full flex-shrink-0"
          style={{ backgroundColor: line.color }}
        />
        <div className="min-w-0">
          <p
            className="text-xs text-slate-700 dark:text-slate-300 truncate"
            style={{ fontWeight: 600 }}
          >
            {line.name}
          </p>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
            {line.stations[0]} ↔ {line.stations[line.stations.length - 1]}
          </p>
        </div>
      </div>

      {/* Station list */}
      <div className="max-h-72 overflow-y-auto">
        <div className="space-y-0">
          {line.stations.map((station, idx) => {
            const isCurrent = idx === currentIndex;
            const isPast = currentIndex !== -1 && idx < currentIndex;
            const isFuture = currentIndex !== -1 && idx > currentIndex;

            return (
              <div key={station} className="relative flex items-center gap-3 py-1.5">
                {/* Connector line */}
                {idx < line.stations.length - 1 && (
                  <div
                    className="absolute left-2 top-8 w-0.5 h-5 z-0"
                    style={{ backgroundColor: line.color, opacity: isPast ? 0.8 : 0.25 }}
                  />
                )}

                {/* Dot */}
                <div className="relative z-10 flex-shrink-0">
                  {isCurrent ? (
                    <div
                      className="w-4 h-4 rounded-full border-2 flex items-center justify-center animate-pulse"
                      style={{ borderColor: line.color, backgroundColor: line.color }}
                    >
                      <MapPin className="w-2 h-2 text-white" />
                    </div>
                  ) : (
                    <div
                      className="w-4 h-4 rounded-full border-2 transition-all"
                      style={{
                        borderColor: line.color,
                        backgroundColor: isPast ? line.color : 'transparent',
                        opacity: isPast ? 1 : isFuture ? 0.4 : 0.7,
                      }}
                    />
                  )}
                </div>

                {/* Station name */}
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-xs leading-tight transition-all ${
                      isCurrent
                        ? 'text-slate-900 dark:text-white'
                        : isPast
                          ? 'text-slate-400 dark:text-slate-600'
                          : 'text-slate-600 dark:text-slate-400'
                    }`}
                    style={{ fontWeight: isCurrent ? 700 : 400 }}
                  >
                    {station}
                  </p>
                  {isCurrent && (
                    <span
                      className="text-[9px] px-1 py-0.5 rounded text-white"
                      style={{ backgroundColor: line.color, fontWeight: 600 }}
                    >
                      Selected
                    </span>
                  )}
                </div>

                {/* Index */}
                <span className="text-[10px] text-slate-300 dark:text-slate-600 font-mono flex-shrink-0">
                  {String(idx + 1).padStart(2, '0')}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
