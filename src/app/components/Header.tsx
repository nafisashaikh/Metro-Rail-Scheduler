import { User, SystemSection, Alert, PassengerUser } from '../types/metro';
import { WeatherData } from '../types/metro';
import {
  Train,
  Sun,
  Moon,
  Bell,
  LogOut,
  Shield,
  Users,
  ChevronDown,
  User as UserIcon,
  ArrowLeft,
} from 'lucide-react';
import { WeatherWidget } from './WeatherWidget';
import { useState } from 'react';

// ─── Staff header ─────────────────────────────────────────────────────────────

interface HeaderProps {
  user: User;
  section: SystemSection;
  onSectionChange: (s: SystemSection) => void;
  isDark: boolean;
  onToggleDark: () => void;
  onLogout: () => void;
  alerts: Alert[];
  weather: WeatherData;
  onOpenAlerts: () => void;
  onSwitchPortal?: () => void;
}

const roleConfig = {
  admin: { icon: Shield, color: 'text-blue-400', label: 'Administrator' },
  supervisor: { icon: Users, color: 'text-purple-400', label: 'Supervisor' },
  employee: { icon: Train, color: 'text-emerald-400', label: 'Employee' },
  passenger: { icon: UserIcon, color: 'text-orange-400', label: 'Passenger' },
};

export function Header({
  user,
  section,
  onSectionChange,
  isDark,
  onToggleDark,
  onLogout,
  alerts,
  weather,
  onOpenAlerts,
  onSwitchPortal,
}: HeaderProps) {
  const activeAlerts = alerts.filter((a) => !a.resolved);
  const criticalAlerts = activeAlerts.filter((a) => a.severity === 'critical');
  const [showUser, setShowUser] = useState(false);
  const roleCfg = roleConfig[user.role] ?? roleConfig.employee;
  const RoleIcon = roleCfg.icon;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-100 dark:border-slate-800/80 bg-white/95 dark:bg-[#0a0a0a]/95 backdrop-blur-md">
      <div className="max-w-screen-2xl mx-auto px-4 py-3 flex items-center gap-3">
        {/* Logo */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <div
            className={`p-1.5 rounded-lg ${user.role === 'passenger' ? 'bg-orange-500' : 'bg-blue-600'}`}
          >
            <Train className="w-5 h-5 text-white" />
          </div>
          <div className="hidden sm:block">
            <p
              className="text-sm text-slate-900 dark:text-white leading-tight"
              style={{ fontWeight: 700 }}
            >
              Metro Rail Scheduler
            </p>
            <p className="text-[10px] text-slate-400 leading-tight">
              {user.role === 'passenger' ? '🚇 Passenger Portal' : 'Maharashtra Rail Services'}
            </p>
          </div>
        </div>

        {/* Section tabs */}
        <div className="flex gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 mx-2">
          {(['metro', 'railway'] as SystemSection[]).map((s) => (
            <button
              key={s}
              onClick={() => onSectionChange(s)}
              className={`px-4 py-1.5 rounded-lg text-sm capitalize transition-all ${
                section === s
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
              style={{ fontWeight: section === s ? 600 : 400 }}
            >
              {s === 'metro' ? '🚇 Metro' : '🚂 Railway'}
            </button>
          ))}
        </div>

        {/* Live indicator */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span
            className="text-xs text-emerald-700 dark:text-emerald-400"
            style={{ fontWeight: 600 }}
          >
            Live
          </span>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Weather compact */}
        <WeatherWidget weather={weather} compact />

        {/* Dark mode toggle */}
        <button
          onClick={onToggleDark}
          className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-300"
          title={isDark ? 'Light mode' : 'Dark mode'}
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Alert bell — staff only */}
        {user.role !== 'passenger' && (
          <button
            onClick={onOpenAlerts}
            className="relative p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-300"
          >
            <Bell className="w-4 h-4" />
            {activeAlerts.length > 0 && (
              <span
                className={`absolute -top-1 -right-1 w-4 h-4 rounded-full text-[10px] text-white flex items-center justify-center ${
                  criticalAlerts.length > 0 ? 'bg-red-500' : 'bg-amber-500'
                }`}
                style={{ fontWeight: 700 }}
              >
                {activeAlerts.length > 9 ? '9+' : activeAlerts.length}
              </span>
            )}
          </button>
        )}

        {/* Switch portal button */}
        {onSwitchPortal && (
          <button
            onClick={onSwitchPortal}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-xs text-slate-500 dark:text-slate-400"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Switch Portal
          </button>
        )}

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setShowUser((s) => !s)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center ${user.role === 'passenger' ? 'bg-orange-500' : 'bg-blue-600'}`}
            >
              <span className="text-[10px] text-white" style={{ fontWeight: 700 }}>
                {user.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2)}
              </span>
            </div>
            <div className="hidden md:block text-left">
              <p
                className="text-xs text-slate-700 dark:text-slate-200 leading-tight"
                style={{ fontWeight: 600 }}
              >
                {user.name}
              </p>
              <p className="text-[10px] text-slate-400 leading-tight">{roleCfg.label}</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden md:block" />
          </button>

          {showUser && (
            <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-xl z-50">
              <div className="p-3 border-b border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${user.role === 'passenger' ? 'bg-orange-500' : 'bg-blue-600'}`}
                  >
                    <span className="text-xs text-white" style={{ fontWeight: 700 }}>
                      {user.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .slice(0, 2)}
                    </span>
                  </div>
                  <div>
                    <p
                      className="text-sm text-slate-900 dark:text-white"
                      style={{ fontWeight: 600 }}
                    >
                      {user.name}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {user.role === 'passenger' ? `Passenger Portal` : user.employeeId}
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-2">
                <div className="px-3 py-2 rounded-lg">
                  <div className="flex items-center gap-2">
                    <RoleIcon className={`w-4 h-4 ${roleCfg.color}`} />
                    <span className="text-sm text-slate-700 dark:text-slate-300">
                      {roleCfg.label}
                    </span>
                  </div>
                </div>
                {user.role !== 'passenger' && (
                  <div className="px-3 py-2 rounded-lg">
                    <p className="text-xs text-slate-500 dark:text-slate-400">Department</p>
                    <p className="text-sm text-slate-700 dark:text-slate-300">{user.department}</p>
                  </div>
                )}
                {onSwitchPortal && (
                  <button
                    onClick={() => {
                      setShowUser(false);
                      onSwitchPortal();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-sm"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Switch Portal
                  </button>
                )}
                <button
                  onClick={() => {
                    setShowUser(false);
                    onLogout();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-sm"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

// ─── Passenger header (minimal, for passenger portal) ─────────────────────────

interface PassengerHeaderProps {
  user: PassengerUser;
  section: SystemSection;
  onSectionChange: (s: SystemSection) => void;
  isDark: boolean;
  onToggleDark: () => void;
  onLogout: () => void;
  onSwitchPortal: () => void;
  weather: WeatherData;
}

export function PassengerHeader({
  user,
  section,
  onSectionChange,
  isDark,
  onToggleDark,
  onLogout,
  onSwitchPortal,
  weather,
}: PassengerHeaderProps) {
  const [showUser, setShowUser] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-100 dark:border-slate-800/80 bg-white/95 dark:bg-[#0a0a0a]/95 backdrop-blur-md">
      <div className="max-w-screen-2xl mx-auto px-4 py-3 flex items-center gap-3">
        {/* Logo */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <div className="p-1.5 bg-orange-500 rounded-lg">
            <Train className="w-5 h-5 text-white" />
          </div>
          <div className="hidden sm:block">
            <p
              className="text-sm text-slate-900 dark:text-white leading-tight"
              style={{ fontWeight: 700 }}
            >
              Metro Rail Scheduler
            </p>
            <p className="text-[10px] text-orange-500 leading-tight" style={{ fontWeight: 600 }}>
              🚇 Passenger Portal
            </p>
          </div>
        </div>

        {/* Section */}
        <div className="flex gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 mx-2">
          {(['metro', 'railway'] as SystemSection[]).map((s) => (
            <button
              key={s}
              onClick={() => onSectionChange(s)}
              className={`px-3 py-1.5 rounded-lg text-xs capitalize transition-all ${
                section === s
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
              style={{ fontWeight: section === s ? 600 : 400 }}
            >
              {s === 'metro' ? '🚇 Metro' : '🚂 Railway'}
            </button>
          ))}
        </div>

        <div className="flex-1" />

        <WeatherWidget weather={weather} compact />

        <button
          onClick={onToggleDark}
          className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-300"
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        <button
          onClick={onSwitchPortal}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-xs text-slate-500 dark:text-slate-400"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Staff Portal
        </button>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setShowUser((s) => !s)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors"
          >
            <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center">
              <span className="text-[10px] text-white" style={{ fontWeight: 700 }}>
                {user.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2)}
              </span>
            </div>
            <div className="hidden md:block text-left">
              <p
                className="text-xs text-orange-700 dark:text-orange-300 leading-tight"
                style={{ fontWeight: 600 }}
              >
                {user.name}
              </p>
              {user.cardNumber && (
                <p className="text-[10px] text-orange-500 leading-tight">{user.cardNumber}</p>
              )}
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-orange-400 hidden md:block" />
          </button>
          {showUser && (
            <div className="absolute right-0 top-full mt-2 w-52 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-xl z-50">
              <div className="p-3 border-b border-slate-100 dark:border-slate-700">
                <p className="text-sm text-slate-900 dark:text-white" style={{ fontWeight: 600 }}>
                  {user.name}
                </p>
                <p className="text-xs text-slate-500">@{user.username}</p>
                {user.cardNumber && (
                  <p className="text-xs text-orange-500 mt-1">Card: {user.cardNumber}</p>
                )}
              </div>
              <div className="p-2">
                <button
                  onClick={() => {
                    setShowUser(false);
                    onSwitchPortal();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-sm"
                >
                  <ArrowLeft className="w-4 h-4" /> Switch Portal
                </button>
                <button
                  onClick={() => {
                    setShowUser(false);
                    onLogout();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-sm"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
