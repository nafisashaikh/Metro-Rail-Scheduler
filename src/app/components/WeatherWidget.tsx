import { WeatherData } from '../types/metro';
import {
  Wind,
  Droplets,
  Eye,
  Thermometer,
  Sun,
  Cloud,
  CloudRain,
  CloudLightning,
} from 'lucide-react';

interface WeatherWidgetProps {
  weather: WeatherData;
  compact?: boolean;
}

function WeatherIcon({ code, className = 'w-5 h-5' }: { code: string; className?: string }) {
  switch (code) {
    case 'sunny':
      return <Sun className={`${className} text-yellow-500`} />;
    case 'partly-cloudy':
      return <Cloud className={`${className} text-slate-400`} />;
    case 'cloudy':
      return <Cloud className={`${className} text-slate-500`} />;
    case 'rainy':
      return <CloudRain className={`${className} text-blue-400`} />;
    case 'storm':
      return <CloudLightning className={`${className} text-purple-500`} />;
    case 'fog':
      return <Cloud className={`${className} text-gray-400`} />;
    default:
      return <Sun className={`${className} text-yellow-500`} />;
  }
}

export function WeatherWidget({ weather, compact = false }: WeatherWidgetProps) {
  if (compact) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
        <WeatherIcon code={weather.conditionCode} className="w-4 h-4" />
        <span className="text-sm text-slate-700 dark:text-slate-300" style={{ fontWeight: 600 }}>
          {weather.temperature}°C
        </span>
        <span className="text-xs text-slate-500 hidden sm:inline">{weather.condition}</span>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-gradient-to-br from-sky-50 to-blue-50 dark:from-slate-800 dark:to-slate-900 overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-sky-400 to-blue-500 dark:from-sky-600 dark:to-blue-700">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-sky-100 mb-0.5">{weather.location}</p>
            <div className="flex items-end gap-2">
              <span className="text-4xl text-white" style={{ fontWeight: 700 }}>
                {weather.temperature}°
              </span>
              <span className="text-white/80 text-sm pb-1">C</span>
            </div>
            <p className="text-sky-100 text-sm">{weather.condition}</p>
          </div>
          <WeatherIcon code={weather.conditionCode} className="w-12 h-12 opacity-90" />
        </div>
        <p className="text-xs text-sky-200 mt-1">Feels like {weather.feelsLike}°C</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3 p-4">
        <div className="flex items-center gap-2">
          <Droplets className="w-4 h-4 text-blue-500" />
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Humidity</p>
            <p className="text-sm text-slate-700 dark:text-slate-200" style={{ fontWeight: 600 }}>
              {weather.humidity}%
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Wind className="w-4 h-4 text-slate-500" />
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Wind</p>
            <p className="text-sm text-slate-700 dark:text-slate-200" style={{ fontWeight: 600 }}>
              {weather.windSpeed} km/h
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-slate-500" />
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Visibility</p>
            <p className="text-sm text-slate-700 dark:text-slate-200" style={{ fontWeight: 600 }}>
              {weather.visibility} km
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Thermometer className="w-4 h-4 text-red-400" />
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">UV Index</p>
            <p className="text-sm text-slate-700 dark:text-slate-200" style={{ fontWeight: 600 }}>
              {weather.uvIndex}
            </p>
          </div>
        </div>
      </div>

      {/* Forecast */}
      <div className="border-t border-slate-200 dark:border-slate-700 px-4 py-3">
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-2" style={{ fontWeight: 600 }}>
          5-DAY FORECAST
        </p>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {weather.forecast.map((day) => (
            <div key={day.day} className="flex flex-col items-center gap-1 min-w-[52px]">
              <p className="text-xs text-slate-500 dark:text-slate-400">{day.day}</p>
              <WeatherIcon code={day.conditionCode} className="w-5 h-5" />
              <p className="text-xs text-slate-700 dark:text-slate-300" style={{ fontWeight: 600 }}>
                {day.high}°
              </p>
              <p className="text-xs text-slate-400">{day.low}°</p>
            </div>
          ))}
        </div>
      </div>

      {/* Rail impact */}
      {(weather.conditionCode === 'rainy' || weather.conditionCode === 'storm') && (
        <div className="mx-4 mb-4 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700">
          <p className="text-xs text-amber-800 dark:text-amber-300" style={{ fontWeight: 600 }}>
            ⚠️ Weather Impact: Possible delays of 5–15 min on elevated routes
          </p>
        </div>
      )}
    </div>
  );
}
