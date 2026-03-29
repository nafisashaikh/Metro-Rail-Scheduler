import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface StationSelectorProps {
  stations: string[];
  selectedStation: string | null;
  onSelectStation: (station: string) => void;
  disabled?: boolean;
}

export function StationSelector({
  stations,
  selectedStation,
  onSelectStation,
  disabled,
}: StationSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="text-xs text-slate-500 dark:text-slate-400" style={{ fontWeight: 600 }}>
        SELECT STATION
      </label>
      <Select value={selectedStation || ''} onValueChange={onSelectStation} disabled={disabled}>
        <SelectTrigger className="w-full bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white">
          <SelectValue placeholder={disabled ? 'Select a line first…' : 'Choose a station…'} />
        </SelectTrigger>
        <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
          {stations.map((station) => (
            <SelectItem
              key={station}
              value={station}
              className="text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {station}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
