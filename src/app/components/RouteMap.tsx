import { MetroLine } from '../types/metro';

interface RouteMapProps {
  line: MetroLine;
  currentStation?: string;
}

export function RouteMap({ line, currentStation }: RouteMapProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: line.color }} />
        <h3 className="font-semibold">{line.name} Route</h3>
      </div>

      <div className="relative">
        {line.stations.map((station, index) => (
          <div key={station} className="relative flex items-center gap-4 pb-6 last:pb-0">
            {/* Connecting line */}
            {index < line.stations.length - 1 && (
              <div
                className="absolute left-3 top-6 w-1 h-full"
                style={{ backgroundColor: line.color, opacity: 0.3 }}
              />
            )}

            {/* Station dot */}
            <div
              className={`relative z-10 w-6 h-6 rounded-full border-4 flex-shrink-0 ${
                currentStation === station ? 'scale-125' : ''
              }`}
              style={{
                borderColor: line.color,
                backgroundColor: currentStation === station ? line.color : 'white',
              }}
            />

            {/* Station name */}
            <div className={`flex-1 ${currentStation === station ? 'font-semibold' : ''}`}>
              {station}
              {currentStation === station && (
                <span className="ml-2 text-xs bg-gray-100 px-2 py-1 rounded">Current</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
