import { Train, Shield, User, ArrowRight, Activity, Globe, Lock, Zap } from 'lucide-react';

interface PortalSelectorProps {
  onSelectPortal: (portal: 'staff' | 'passenger') => void;
}

const STATS = [
  { value: '842', label: 'Trains' },
  { value: '8.2M', label: 'Passengers' },
  { value: '189', label: 'Stations' },
  { value: '99.2%', label: 'Uptime' },
];

export function PortalSelector({ onSelectPortal }: PortalSelectorProps) {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] flex flex-col text-slate-900 dark:text-slate-100 font-sans selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black">
      {/* ── Top Nav (Tight) ── */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-slate-100 dark:border-slate-800/50">
        <div className="flex items-center gap-2">
          <Train className="w-4 h-4 text-black dark:text-white" />
          <span className="text-sm font-semibold tracking-tight">Metro Rail Scheduler</span>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          System Online
        </div>
      </header>

      {/* ── Main Canvas (Dense Center) ── */}
      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-2xl px-4 sm:px-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
              Metro Rail Scheduler
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Unified transportation access point. Select your portal to proceed.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {/* Staff Portal Row */}
            <button
              onClick={() => onSelectPortal('staff')}
              className="group flex flex-col sm:flex-row items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all duration-200 text-left"
            >
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700 shadow-sm group-hover:bg-transparent group-hover:border-transparent group-hover:shadow-none transition-all hidden sm:block">
                  <Shield className="w-5 h-5 text-slate-700 dark:text-slate-300 group-hover:text-white dark:group-hover:text-black" />
                </div>
                <div>
                  <h2 className="text-base font-semibold">Staff Portal</h2>
                  <p className="text-xs text-slate-500 group-hover:text-slate-300 dark:text-slate-400 dark:group-hover:text-slate-600 mt-0.5">
                    Operations, scheduling, &amp; infrastructure management
                  </p>
                </div>
              </div>
              <div className="hidden sm:flex items-center gap-3 text-xs font-medium text-slate-400 group-hover:text-white/70 dark:group-hover:text-black/70">
                <Activity className="w-3.5 h-3.5" />
                <Globe className="w-3.5 h-3.5" />
                <Lock className="w-3.5 h-3.5" />
                <ArrowRight className="w-4 h-4 ml-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>

            {/* Passenger Portal Row */}
            <button
              onClick={() => onSelectPortal('passenger')}
              className="group flex flex-col sm:flex-row items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all duration-200 text-left"
            >
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700 shadow-sm group-hover:bg-transparent group-hover:border-transparent group-hover:shadow-none transition-all hidden sm:block">
                  <User className="w-5 h-5 text-slate-700 dark:text-slate-300 group-hover:text-white dark:group-hover:text-black" />
                </div>
                <div>
                  <h2 className="text-base font-semibold">Passenger Portal</h2>
                  <p className="text-xs text-slate-500 group-hover:text-slate-300 dark:text-slate-400 dark:group-hover:text-slate-600 mt-0.5">
                    Real-time schedules, mapping, &amp; travel assistance
                  </p>
                </div>
              </div>
              <div className="hidden sm:flex items-center gap-3 text-xs font-medium text-slate-400 group-hover:text-white/70 dark:group-hover:text-black/70">
                <Train className="w-3.5 h-3.5" />
                <Globe className="w-3.5 h-3.5" />
                <Zap className="w-3.5 h-3.5" />
                <ArrowRight className="w-4 h-4 ml-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          </div>

          {/* ── Compact Metrics ── */}
          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800/80 flex justify-between gap-4 max-w-lg mx-auto">
            {STATS.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-base font-semibold tracking-tight">{s.value}</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-0.5">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
