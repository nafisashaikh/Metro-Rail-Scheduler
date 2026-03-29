import { MetroLine } from '../types/metro';

interface MetroLineSelectorProps {
  lines: MetroLine[];
  selectedLine: MetroLine | null;
  onSelectLine: (line: MetroLine) => void;
}

const statusConfig = {
  operational: {
    label: 'Operational',
    color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  },
  partial: {
    label: 'Partial',
    color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  },
  construction: {
    label: 'Under Construction',
    color: 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400',
  },
};

export function MetroLineSelector({ lines, selectedLine, onSelectLine }: MetroLineSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="text-xs text-slate-500 dark:text-slate-400" style={{ fontWeight: 600 }}>
        SELECT LINE
      </label>
      <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
        {lines.map((line) => {
          const isSelected = selectedLine?.id === line.id;
          const statusCfg = statusConfig[line.operationalStatus];
          return (
            <button
              key={line.id}
              onClick={() => onSelectLine(line)}
              className={`w-full flex items-start gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                isSelected
                  ? 'shadow-sm'
                  : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700/50'
              }`}
              style={{
                borderColor: isSelected ? line.color : undefined,
                backgroundColor: isSelected ? `${line.color}10` : undefined,
              }}
            >
              <div className="flex-shrink-0 mt-0.5">
                <div
                  className="w-3 h-3 rounded-full mt-1"
                  style={{ backgroundColor: line.color }}
                />
              </div>
              <div className="min-w-0 flex-1">
                <p
                  className="text-xs leading-tight text-slate-800 dark:text-slate-200 truncate"
                  style={{ fontWeight: isSelected ? 600 : 500 }}
                >
                  {line.name}
                </p>
                {line.description && (
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                    {line.description}
                  </p>
                )}
                <span
                  className={`inline-block mt-1.5 text-[10px] px-1.5 py-0.5 rounded ${statusCfg.color}`}
                  style={{ fontWeight: 600 }}
                >
                  {statusCfg.label}
                </span>
              </div>
              {isSelected && (
                <div
                  className="flex-shrink-0 w-1.5 h-1.5 rounded-full mt-2"
                  style={{ backgroundColor: line.color }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
