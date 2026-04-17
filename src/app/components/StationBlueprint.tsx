import { useMemo, useState } from 'react';
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

type StationLayoutProfile = {
  title: string;
  platformText: string;
  concourseText: string;
  exitText: string;
  directionText: string;
  platform1Label: string;
  platform2Label: string;
  platformMarkerText: string;
  concourseMarkerText: string;
};

const DEFAULT_PROFILE: StationLayoutProfile = {
  title: 'Station layout',
  platformText: 'Platforms are shown in a standard schematic layout.',
  concourseText: 'Concourse and ticketing zones are shown as a simple guide.',
  exitText: 'Exit direction shown as the main station-side exit.',
  directionText: 'Use station signage for final platform confirmation.',
  platform1Label: 'PLATFORM 1',
  platform2Label: 'PLATFORM 2',
  platformMarkerText: 'Platform approach',
  concourseMarkerText: 'Station services',
};

const STATION_PROFILES: Record<string, StationLayoutProfile> = {
  ameerpet: {
    title: 'Ameerpet station layout',
    platformText: 'Platform split is shown for the interchange corridor and metro decks.',
    concourseText: 'Concourse access is concentrated around the main entry plaza.',
    exitText: 'Main exit points toward the road-side concourse.',
    directionText: 'Follow interchange signs for line changes.',
    platform1Label: 'METRO PLATFORM 1',
    platform2Label: 'METRO PLATFORM 2',
    platformMarkerText: 'Interchange approach',
    concourseMarkerText: 'Ticketing & interchange',
  },
  begumpet: {
    title: 'Begumpet station layout',
    platformText: 'Platforms are arranged around the central station spine.',
    concourseText: 'Ticketing and waiting areas are on the main concourse level.',
    exitText: 'Use the main entrance side for station exit.',
    directionText: 'Platform guidance is schematic; check display boards on arrival.',
    platform1Label: 'UP PLATFORM',
    platform2Label: 'DOWN PLATFORM',
    platformMarkerText: 'Platform access',
    concourseMarkerText: 'Concourse services',
  },
  rasoolpura: {
    title: 'Rasoolpura station layout',
    platformText: 'The map shows a simple two-platform metro layout.',
    concourseText: 'Entry gates and help desk are placed on the concourse side.',
    exitText: 'Exit side follows the main station frontage.',
    directionText: 'Check live station boards for platform assignment.',
    platform1Label: 'PLATFORM A',
    platform2Label: 'PLATFORM B',
    platformMarkerText: 'Platform approach',
    concourseMarkerText: 'Help desk & gates',
  },
  jubileehills: {
    title: 'Jubilee Hills station layout',
    platformText: 'Platforms sit beneath the main concourse footprint.',
    concourseText: 'Concourse areas include ticketing and digital guidance points.',
    exitText: 'Exit points are shown on the main access side.',
    directionText: 'Use platform indicators at the station for final boarding.',
    platform1Label: 'PLATFORM 1',
    platform2Label: 'PLATFORM 2',
    platformMarkerText: 'Train side',
    concourseMarkerText: 'Ticketing zone',
  },
  madhapur: {
    title: 'Madhapur station layout',
    platformText: 'Platform positions are shown as a linear metro schematic.',
    concourseText: 'Concourse and stair access are highlighted on the entry side.',
    exitText: 'Exit routes are simplified to the station frontage.',
    directionText: 'Verify platform signage before boarding.',
    platform1Label: 'CITY BOUND',
    platform2Label: 'OUTER BOUND',
    platformMarkerText: 'Platform access',
    concourseMarkerText: 'Digital help desk',
  },
  hitech_city: {
    title: 'Hi-Tech City station layout',
    platformText: 'Platform layout is shown with the main station corridor.',
    concourseText: 'Concourse includes entry gates and service counters.',
    exitText: 'Main exit points toward the station approach road.',
    directionText: 'Boarding direction is schematic and may differ by service.',
    platform1Label: 'UP PLATFORM',
    platform2Label: 'DOWN PLATFORM',
    platformMarkerText: 'Platform access',
    concourseMarkerText: 'Service counters',
  },
};

function normalizeStationKey(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
}

export function StationBlueprint({ stationName }: StationBlueprintProps) {
  const [activeLevel, setActiveLevel] = useState<'concourse' | 'platform'>('platform');
  const profile = useMemo(() => {
    const key = normalizeStationKey(stationName);
    return STATION_PROFILES[key] ?? DEFAULT_PROFILE;
  }, [stationName]);
  const levelLabel = activeLevel === 'platform' ? 'Platform View' : 'Concourse View';

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <MapIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{stationName} Explorer</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">{profile.title}</p>
          </div>
        </div>

        <span className="hidden sm:inline-flex items-center rounded-full bg-blue-50 dark:bg-blue-900/30 px-3 py-1 text-[10px] font-semibold text-blue-700 dark:text-blue-300">
          Live Station Guide
        </span>

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
              {level === 'platform' ? 'Platform' : 'Concourse'}
            </button>
          ))}
        </div>
      </div>

      {/* Blueprint Area */}
      <div className="relative aspect-[16/9] w-full rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden group bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-[#0f172a] dark:via-[#111827] dark:to-[#0b1220]">
        <div className="absolute top-3 left-3 z-10 rounded-md border border-slate-200/80 dark:border-slate-700 bg-white/85 dark:bg-slate-900/70 backdrop-blur px-2 py-1 text-[10px] font-semibold text-slate-600 dark:text-slate-300">
          {levelLabel}
        </div>

        {/* Dynamic SVG Layout */}
        <svg viewBox="0 0 800 450" className="w-full h-full text-slate-200 dark:text-slate-800/10">
          {/* Main Hall */}
          <rect x="100" y="50" width="600" height="350" rx="12" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="8 4" />
          
          {activeLevel === 'platform' ? (
            <>
              {/* Platforms */}
              <rect x="150" y="100" width="500" height="60" rx="4" fill="currentColor" opacity="0.1" />
              <rect x="150" y="290" width="500" height="60" rx="4" fill="currentColor" opacity="0.1" />
              <text x="160" y="135" className="fill-slate-400 font-bold text-xs">{profile.platform1Label}</text>
              <text x="160" y="325" className="fill-slate-400 font-bold text-xs">{profile.platform2Label}</text>
              
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
              <text x="205" y="255" className="fill-slate-400 font-bold text-[10px]">{profile.concourseText}</text>
            </>
          )}

          {/* Stairs/Escalators */}
          <rect x="400" y="200" width="40" height="50" rx="2" fill="currentColor" opacity="0.2" />
        </svg>

        {/* Floating Labels (HTML overlay for better styling) */}
        <div className="absolute inset-0 pointer-events-none">
          {activeLevel === 'platform' ? (
            <>
              <Marker x="30%" y="25%" icon={Navigation} label={profile.platformMarkerText} color="text-emerald-500" />
              <Marker x="70%" y="25%" icon={ArrowRightLeft} label="Transfer Tunnel" color="text-amber-500" />
              <Marker x="50%" y="75%" icon={DoorOpen} label={profile.exitText} color="text-blue-500" />
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
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between p-3 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-xl border border-white/30 dark:border-slate-700 shadow-lg">
          <div className="flex items-center gap-3">
             <div className="p-1.5 bg-blue-600 rounded-lg">
                <Search className="w-3.5 h-3.5 text-white" />
             </div>
             <p className="text-[11px] font-medium text-slate-700 dark:text-slate-200">{profile.directionText}</p>
          </div>
          <button className="px-3 py-1.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-bold rounded-lg flex items-center gap-1 hover:opacity-90 transition-opacity">
            Get Directions <MoveUpRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
        <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 flex items-center gap-2 text-slate-600 dark:text-slate-300">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          Platform movement
        </div>
        <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 flex items-center gap-2 text-slate-600 dark:text-slate-300">
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          Transfer links
        </div>
        <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 flex items-center gap-2 text-slate-600 dark:text-slate-300">
          <span className="w-2 h-2 rounded-full bg-blue-500" />
          Exit route
        </div>
      </div>

      {/* Guide Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700/50 flex items-start gap-3">
           <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
           <div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">First Time Here?</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">Always stand behind the yellow line. {profile.directionText}</p>
           </div>
        </div>
        <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700/50 flex items-start gap-3">
           <Smartphone className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
           <div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">Digital Guide</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">{profile.concourseText}</p>
           </div>
        </div>
      </div>
    </div>
  );
}

function Marker({ x, y, icon: Icon, label, color }: { x: string; y: string; icon: React.ElementType; label: string; color: string }) {
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

const ShieldAlert = (props: React.SVGProps<SVGSVGElement>) => (
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
