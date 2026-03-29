import { useEffect, useRef, useState } from 'react';
import { Alert } from '../types/metro';
import { Megaphone, Wifi, WifiOff } from 'lucide-react';

interface AnnouncementTickerProps {
  alerts: Alert[];
  isOffline?: boolean;
}

const ALERT_EMOJIS: Record<Alert['type'], string> = {
  delay: '🕐',
  weather: '🌧️',
  medical: '🚑',
  technical: '⚠️',
  security: '🔒',
};

const ALERT_COLORS: Record<Alert['severity'], string> = {
  critical: 'text-red-400',
  warning: 'text-amber-400',
  info: 'text-blue-400',
};

// Only show passenger-relevant alerts (delay + weather + critical medical)
function isPassengerRelevant(alert: Alert): boolean {
  if (alert.resolved) return false;
  if (alert.type === 'delay' || alert.type === 'weather') return true;
  if (alert.type === 'medical' && alert.severity === 'critical') return true;
  return false;
}

export function AnnouncementTicker({ alerts, isOffline = false }: AnnouncementTickerProps) {
  const relevant = alerts.filter(isPassengerRelevant);
  const [dismissed, _setDismissed] = useState<Set<string>>(new Set());
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const tickerRef = useRef<HTMLDivElement>(null);

  const visible = relevant.filter((a) => !dismissed.has(a.id));

  useEffect(() => {
    const t = setInterval(() => setLastUpdate(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  // Format relative time
  const relativeTime = (ts: Date) => {
    const mins = Math.floor((Date.now() - ts.getTime()) / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    return `${Math.floor(mins / 60)}h ago`;
  };

  return (
    <div className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/80">
      {/* Offline banner */}
      {isOffline && (
        <div className="bg-amber-500 flex items-center gap-2 px-4 py-1.5">
          <WifiOff className="w-3.5 h-3.5 text-amber-900 flex-shrink-0" />
          <p className="text-xs text-amber-900" style={{ fontWeight: 600 }}>
            You are offline — showing last known data. Reconnect for live updates.
          </p>
        </div>
      )}

      <div className="max-w-screen-2xl mx-auto px-4 py-2 flex items-center gap-3">
        {/* Label */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <Megaphone className="w-3.5 h-3.5 text-orange-500" />
          <span
            className="text-xs text-orange-600 dark:text-orange-400"
            style={{ fontWeight: 700 }}
          >
            LIVE
          </span>
        </div>
        <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 flex-shrink-0" />

        {visible.length === 0 ? (
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span style={{ fontWeight: 500 }}>No disruptions — all services running normally</span>
          </div>
        ) : (
          /* Scrolling ticker */
          <div className="flex-1 overflow-hidden relative">
            <div
              ref={tickerRef}
              className="flex gap-8 items-center"
              style={{
                animation:
                  visible.length > 1 ? `ticker ${visible.length * 12}s linear infinite` : 'none',
                whiteSpace: 'nowrap',
              }}
            >
              {[...visible, ...visible].map((alert, idx) => (
                <div key={`${alert.id}-${idx}`} className="flex items-center gap-2 flex-shrink-0">
                  <span>{ALERT_EMOJIS[alert.type]}</span>
                  <span
                    className={`text-xs ${ALERT_COLORS[alert.severity]}`}
                    style={{ fontWeight: 600 }}
                  >
                    {alert.title.toUpperCase()}:
                  </span>
                  <span className="text-xs text-slate-600 dark:text-slate-400 truncate max-w-xs">
                    {alert.message}
                  </span>
                  {alert.station && (
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 flex-shrink-0">
                      📍 {alert.station}
                    </span>
                  )}
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 flex-shrink-0">
                    · {relativeTime(alert.timestamp)}
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600 flex-shrink-0 mx-2" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Connection status */}
        <div className="flex items-center gap-1 flex-shrink-0 ml-2">
          {isOffline ? (
            <WifiOff className="w-3 h-3 text-amber-400" />
          ) : (
            <Wifi className="w-3 h-3 text-emerald-400" />
          )}
          <span className="text-[10px] text-slate-400 hidden sm:inline">
            Updated {relativeTime(lastUpdate)}
          </span>
        </div>
      </div>

      <style>{`
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
