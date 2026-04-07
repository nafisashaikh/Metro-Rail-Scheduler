import { useState } from 'react';
import { 
    Map as MapIcon, 
    ArrowRightLeft, 
    DoorOpen, 
    Ticket, 
    Smartphone, 
    Info, 
    Navigation,
    MoveUpRight,
    Search
} from 'lucide-react';

interface StationBlueprintProps {
  stationName: string;
}

export function StationBlueprint({ stationName }: StationBlueprintProps) {
  const [activeLevel, setActiveLevel] = useState<'concourse' | 'platform'>('platform');

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <MapIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{stationName} Explorer</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Station layout & floor plan</p>
          </div>
        </div>

        {/* Level Switcher */}
        <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
          {(['concourse', 'platform'] as const).map((level) => (
            <button
              key={level}
              onClick={() => setActiveLevel(level)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all capitalize ${
                activeLevel === level 
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      {/* Blueprint Area */}
      <div className="relative aspect-[16/9] w-full bg-slate-50 dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden group">
        {/* Dynamic SVG Layout */}
        <svg viewBox="0 0 800 450" className="w-full h-full text-slate-200 dark:text-slate-800/10">
          {/* Main Hall */}
          <rect x="100" y="50" width="600" height="350" rx="12" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="8 4" />
          
          {activeLevel === 'platform' ? (
            <>
              {/* Platforms */}
              <rect x="150" y="100" width="500" height="60" rx="4" fill="currentColor" opacity="0.1" />
              <rect x="150" y="290" width="500" height="60" rx="4" fill="currentColor" opacity="0.1" />
              <text x="160" y="135" className="fill-slate-400 font-bold text-xs">PLATFORM 1 (UP)</text>
              <text x="160" y="325" className="fill-slate-400 font-bold text-xs">PLATFORM 2 (DOWN)</text>
              
              {/* Tracks */}
              <line x1="150" y1="180" x2="650" y2="180" stroke="currentColor" strokeWidth="4" />
              <line x1="150" y1="270" x2="650" y2="270" stroke="currentColor" strokeWidth="4" />
            </>
          ) : (
            <>
              {/* Concourse Layout */}
              <rect x="200" y="150" width="120" height="150" rx="8" fill="currentColor" opacity="0.1" />
              <rect x="480" y="150" width="120" height="150" rx="8" fill="currentColor" opacity="0.1" />
              <text x="210" y="175" className="fill-slate-400 font-bold text-[10px]">TICKET COUNTERS</text>
              <text x="490" y="175" className="fill-slate-400 font-bold text-[10px]">RETAIL ZONE</text>
            </>
          )}

          {/* Stairs/Escalators */}
          <rect x="400" y="200" width="40" height="50" rx="2" fill="currentColor" opacity="0.2" />
        </svg>

        {/* Floating Labels (HTML overlay for better styling) */}
        <div className="absolute inset-0 pointer-events-none">
          {activeLevel === 'platform' ? (
            <>
              <Marker x="30%" y="25%" icon={Navigation} label="Front Of Train" color="text-emerald-500" />
              <Marker x="70%" y="25%" icon={ArrowRightLeft} label="Transfer Tunnel" color="text-amber-500" />
              <Marker x="50%" y="75%" icon={DoorOpen} label="Exit To S.V. Road" color="text-blue-500" />
            </>
          ) : (
            <>
              <Marker x="25%" y="50%" icon={Ticket} label="Smart Card Recharge" color="text-purple-500" />
              <Marker x="75%" y="50%" icon={Smartphone} label="Digital Help Desk" color="text-orange-500" />
              <Marker x="50%" y="20%" icon={ShieldAlert} label="Security Point" color="text-red-500" />
            </>
          )}
        </div>

        {/* Navigation Prompt */}
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between p-3 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-xl border border-white/20 shadow-lg">
          <div className="flex items-center gap-3">
             <div className="p-1.5 bg-blue-600 rounded-lg">
                <Search className="w-3.5 h-3.5 text-white" />
             </div>
             <p className="text-xs font-medium text-slate-700 dark:text-slate-200">Where are you going?</p>
          </div>
          <button className="px-3 py-1.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-bold rounded-lg flex items-center gap-1">
            Get Directions <MoveUpRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Guide Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700/50 flex items-start gap-3">
           <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
           <div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">First Time Here?</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">Always stand behind the yellow line. Platform 1 is towards {stationName.split(' ')[0]} East.</p>
           </div>
        </div>
        <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700/50 flex items-start gap-3">
           <Smartphone className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
           <div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">Digital Guide</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">Scan QR codes at platform pillars for local area maps and rickshaw stands.</p>
           </div>
        </div>
      </div>
    </div>
  );
}

function Marker({ x, y, icon: Icon, label, color }: { x: string; y: string; icon: any; label: string; color: string }) {
  return (
    <div 
        className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 group/marker"
        style={{ left: x, top: y }}
    >
      <div className={`p-2 rounded-full bg-white dark:bg-slate-800 shadow-md border border-slate-100 dark:border-slate-700 transition-all group-hover/marker:scale-110 pointer-events-auto cursor-help`}>
          <Icon className={`w-3.5 h-3.5 ${color}`} />
      </div>
      <div className="px-2 py-0.5 bg-slate-900/80 backdrop-blur-sm text-white text-[9px] font-bold rounded-md whitespace-nowrap opacity-0 group-hover/marker:opacity-100 transition-opacity">
        {label}
      </div>
    </div>
  );
}

const ShieldAlert = (props: any) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
    <path d="M12 8v4" />
    <path d="M12 16h.01" />
  </svg>
);
