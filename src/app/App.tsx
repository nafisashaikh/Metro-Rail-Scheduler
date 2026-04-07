import { useState, useEffect, useCallback } from 'react';

// ── Types ────────────────────────────────────────────────────────────────────
import type { User, Alert, SystemSection, WeatherData, PassengerUser } from './types/metro';

// ── Data ─────────────────────────────────────────────────────────────────────
import {
  mumbaiMetroLines,
  maharashtraRailwayLines,
  mumbaiWeather,
  thaneWeather,
  seedAlerts,
} from './data';

// ── Components ────────────────────────────────────────────────────────────────
import {
  PortalSelector,
  LoginPage,
  PassengerLoginPage,
  Header,
  PassengerHeader,
  DashboardSection,
  AnnouncementTicker,
} from './components';
import { PassengerSignupPage } from './components/PassengerSignupPage';
import { apiUrl } from './config/api';

// ─── Portal type ──────────────────────────────────────────────────────────────
type AppPortal = 'selector' | 'staff' | 'passenger';
const AUTH_TOKEN_KEY = 'mrs_auth_token';
const AUTH_PORTAL_KEY = 'mrs_auth_portal';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Returns the weather data relevant to the given rail section. */
function getWeatherForSection(section: SystemSection): WeatherData {
  return section === 'railway' ? thaneWeather : mumbaiWeather;
}

/** Auto-generates a random non-medical alert for the given station / section. */
function createRandomAlert(section: SystemSection): Alert {
  const types: Alert['type'][] = ['technical', 'delay', 'security'];
  const type = types[Math.floor(Math.random() * types.length)];
  const metroStations = ['Ghatkopar', 'Andheri', 'D.N. Nagar', 'BKC', 'Dadar'];
  const railwayStations = ['Thane', 'Bandra', 'Borivali', 'Mumbai CSMT', 'Kurla'];
  const station = (section === 'metro' ? metroStations : railwayStations)[
    Math.floor(Math.random() * 5)
  ];
  const messages: Record<Alert['type'], string> = {
    technical: `Minor technical issue reported at ${station}. Engineers on site.`,
    delay: `Train running 6 minutes late at ${station} due to congestion.`,
    security: `Security check in progress at ${station}. Brief delay expected.`,
    medical: `Medical assistance required at ${station}.`,
    weather: `Reduced visibility at ${station} due to weather conditions.`,
  };
  return {
    id: `auto-${Date.now()}`,
    type,
    severity: 'warning',
    title: `${type.charAt(0).toUpperCase() + type.slice(1)} Alert`,
    message: messages[type],
    station,
    section,
    timestamp: new Date(),
    resolved: false,
  };
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  // ── Portal routing ────────────────────────────────────────────────────────
  const [portal, setPortal] = useState<AppPortal>('selector');

  // ── Staff state ───────────────────────────────────────────────────────────
  const [staffUser, setStaffUser] = useState<User | null>(null);
  const [staffSection, setStaffSection] = useState<SystemSection>('metro');
  const [showAlerts, setShowAlerts] = useState(false);

  // ── Passenger state ───────────────────────────────────────────────────────
  const [passengerUser, setPassengerUser] = useState<PassengerUser | null>(null);
  const [passengerSection, setPassengerSection] = useState<SystemSection>('metro');
  const [passengerAuthMode, setPassengerAuthMode] = useState<'login' | 'signup'>('login');

  // ── Shared state ──────────────────────────────────────────────────────────
  const [alerts, setAlerts] = useState<Alert[]>(seedAlerts);
  const [isDark, setIsDark] = useState(false);
  const [isRestoringSession, setIsRestoringSession] = useState(true);

  // ── Effects ───────────────────────────────────────────────────────────────

  /** Sync dark-mode class on the document root. */
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      const savedPortal = localStorage.getItem(AUTH_PORTAL_KEY) as AppPortal | null;

      if (!token || !savedPortal || (savedPortal !== 'staff' && savedPortal !== 'passenger')) {
        setIsRestoringSession(false);
        return;
      }

      try {
        const response = await fetch(apiUrl('/auth/me'), {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          localStorage.removeItem(AUTH_TOKEN_KEY);
          localStorage.removeItem(AUTH_PORTAL_KEY);
          setIsRestoringSession(false);
          return;
        }

        const data = (await response.json()) as {
          user?: User | PassengerUser;
        };

        if (!data.user) {
          setIsRestoringSession(false);
          return;
        }

        if (savedPortal === 'passenger' && data.user.role === 'passenger') {
          setPassengerUser(data.user as PassengerUser);
          setPortal('passenger');
        } else if (savedPortal === 'staff' && data.user.role !== 'passenger') {
          setStaffUser(data.user as User);
          setPortal('staff');
        }
      } catch {
        localStorage.removeItem(AUTH_TOKEN_KEY);
        localStorage.removeItem(AUTH_PORTAL_KEY);
      } finally {
        setIsRestoringSession(false);
      }
    };

    void restoreSession();
  }, []);

  /** Auto-generate random alerts every 90s while staff is logged in. */
  useEffect(() => {
    if (!staffUser) return;
    const interval = setInterval(() => {
      if (Math.random() < 0.3) {
        setAlerts((prev) => [createRandomAlert(staffSection), ...prev]);
      }
    }, 90_000);
    return () => clearInterval(interval);
  }, [staffUser, staffSection]);

  // ── Event handlers ────────────────────────────────────────────────────────

  const handleStaffLogin = useCallback((payload: { user: User; token: string }) => {
    setStaffUser(payload.user);
    setPortal('staff');
    localStorage.setItem(AUTH_TOKEN_KEY, payload.token);
    localStorage.setItem(AUTH_PORTAL_KEY, 'staff');
  }, []);
  const handleStaffLogout = useCallback(() => {
    setStaffUser(null);
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_PORTAL_KEY);
    setPortal('selector');
  }, []);

  const handlePassengerLogin = useCallback((payload: { user: PassengerUser; token: string }) => {
    setPassengerUser(payload.user);
    setPortal('passenger');
    localStorage.setItem(AUTH_TOKEN_KEY, payload.token);
    localStorage.setItem(AUTH_PORTAL_KEY, 'passenger');
  }, []);
  const handlePassengerLogout = useCallback(() => {
    setPassengerUser(null);
    setPassengerAuthMode('login');
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_PORTAL_KEY);
    setPortal('selector');
  }, []);

  const handlePassengerSignupSuccess = useCallback(
    (payload: { user: PassengerUser; token: string }) => {
      setPassengerUser(payload.user);
      setPortal('passenger');
      localStorage.setItem(AUTH_TOKEN_KEY, payload.token);
      localStorage.setItem(AUTH_PORTAL_KEY, 'passenger');
    },
    []
  );

  const handleSwitchPortal = useCallback(() => {
    setPortal('selector');
    setStaffUser(null);
    setPassengerUser(null);
    setPassengerAuthMode('login');
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_PORTAL_KEY);
    setShowAlerts(false);
  }, []);

  const handleResolveAlert = useCallback((id: string) => {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, resolved: true } : a)));
  }, []);

  const handleAddAlert = useCallback((alert: Omit<Alert, 'id' | 'timestamp' | 'resolved'>) => {
    setAlerts((prev) => [
      { ...alert, id: `manual-${Date.now()}`, timestamp: new Date(), resolved: false },
      ...prev,
    ]);
  }, []);

  // ── Derived values ────────────────────────────────────────────────────────

  const activeAlerts = alerts.filter((a) => !a.resolved);
  const criticalSectionAlerts = activeAlerts.filter(
    (a) => a.severity === 'critical' && a.section === staffSection
  );

  if (isRestoringSession) {
    return (
      <div className={isDark ? 'dark' : ''}>
        <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-300">
          Restoring session...
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // Render: Portal Selector
  // ════════════════════════════════════════════════════════════════════════════
  if (portal === 'selector') {
    return (
      <div className={isDark ? 'dark' : ''}>
        <PortalSelector onSelectPortal={setPortal} />
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // Render: Staff Portal
  // ════════════════════════════════════════════════════════════════════════════
  if (portal === 'staff') {
    if (!staffUser) {
      return (
        <div className={isDark ? 'dark' : ''}>
          <LoginPage onLogin={handleStaffLogin} onBack={() => setPortal('selector')} />
        </div>
      );
    }

    return (
      <div className={isDark ? 'dark' : ''}>
        <div className="min-h-screen bg-white dark:bg-[#0a0a0a] text-slate-900 dark:text-slate-100">
          {/* ── Header ── */}
          <Header
            user={staffUser}
            section={staffSection}
            onSectionChange={(s) => {
              setStaffSection(s);
              setShowAlerts(false);
            }}
            isDark={isDark}
            onToggleDark={() => setIsDark((d) => !d)}
            onLogout={handleStaffLogout}
            alerts={alerts}
            weather={getWeatherForSection(staffSection)}
            onOpenAlerts={() => setShowAlerts((s) => !s)}
            onSwitchPortal={handleSwitchPortal}
          />

          {/* ── Critical-alert banner ── */}
          {criticalSectionAlerts.length > 0 && (
            <div className="bg-red-600 dark:bg-red-700">
              <div className="max-w-screen-2xl mx-auto px-4 py-2 flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-white animate-pulse flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  {criticalSectionAlerts.slice(0, 1).map((a) => (
                    <span key={a.id} className="text-xs text-white">
                      <span style={{ fontWeight: 700 }}>CRITICAL: </span>
                      {a.message}
                      {a.journeyContinued && (
                        <span
                          className="ml-2 px-1.5 py-0.5 rounded bg-white/20 text-[10px]"
                          style={{ fontWeight: 600 }}
                        >
                          JOURNEY CONTINUING TO {a.nextStation?.toUpperCase()}
                        </span>
                      )}
                    </span>
                  ))}
                </div>
                <button
                  onClick={() => setShowAlerts(true)}
                  className="text-xs text-white/80 hover:text-white flex-shrink-0 underline"
                >
                  View alerts
                </button>
              </div>
            </div>
          )}

          {/* ── Main content ── */}
          <main className="max-w-screen-2xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-slate-900 dark:text-white" style={{ fontWeight: 700 }}>
                  {staffSection === 'metro' ? '🚇 Mumbai Metro' : '🚂 Maharashtra Railway'}
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {staffSection === 'metro'
                    ? 'Mumbai Metro Lines 1, 2A, 2B, 3 & 7 · Real-time monitoring'
                    : 'Western, Central & Harbour Lines + Intercity · Real-time monitoring'}
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Updated{' '}
                {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>

            <DashboardSection
              key={staffSection}
              section={staffSection}
              lines={staffSection === 'metro' ? mumbaiMetroLines : maharashtraRailwayLines}
              alerts={alerts}
              onResolveAlert={handleResolveAlert}
              onAddAlert={handleAddAlert}
              userRole={staffUser.role}
              weather={getWeatherForSection(staffSection)}
              isDark={isDark}
              showAlerts={showAlerts}
              onCloseAlerts={() => setShowAlerts(false)}
            />
          </main>

          {/* ── Footer ── */}
          <footer className="border-t border-slate-200 dark:border-slate-800 mt-8 py-4">
            <div className="max-w-screen-2xl mx-auto px-4 flex items-center justify-between text-xs text-slate-400 dark:text-slate-600">
              <span>Metro Rail Scheduler · Maharashtra Rail Services</span>
              <span>
                Logged in as <span style={{ fontWeight: 600 }}>{staffUser.name}</span> (
                {staffUser.role}) ·{' '}
                <button onClick={handleSwitchPortal} className="underline hover:text-slate-600">
                  Switch Portal
                </button>
              </span>
            </div>
          </footer>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // Render: Passenger Portal
  // ════════════════════════════════════════════════════════════════════════════
  if (portal === 'passenger') {
    if (!passengerUser) {
      return (
        <div className={isDark ? 'dark' : ''}>
          {passengerAuthMode === 'login' ? (
            <PassengerLoginPage
              onLogin={handlePassengerLogin}
              onBack={() => setPortal('selector')}
              onSwitchToSignup={() => setPassengerAuthMode('signup')}
            />
          ) : (
            <PassengerSignupPage
              onSignupSuccess={handlePassengerSignupSuccess}
              onBack={() => setPortal('selector')}
              onSwitchToLogin={() => setPassengerAuthMode('login')}
            />
          )}
        </div>
      );
    }

    const publicAlerts = alerts.filter((a) => a.section === passengerSection);

    return (
      <div className={isDark ? 'dark' : ''}>
        <div className="min-h-screen bg-white dark:bg-[#0a0a0a] text-slate-900 dark:text-slate-100">
          {/* ── Header ── */}
          <PassengerHeader
            user={passengerUser}
            section={passengerSection}
            onSectionChange={setPassengerSection}
            isDark={isDark}
            onToggleDark={() => setIsDark((d) => !d)}
            onLogout={handlePassengerLogout}
            onSwitchPortal={handleSwitchPortal}
            weather={getWeatherForSection(passengerSection)}
          />

          {/* ── Live announcement ticker ── */}
          <AnnouncementTicker alerts={publicAlerts} />

          {/* ── Main content ── */}
          <main className="w-full max-w-screen-2xl mx-auto px-3 sm:px-4 py-3 sm:py-5">
            <DashboardSection
              key={`passenger-${passengerSection}`}
              section={passengerSection}
              lines={passengerSection === 'metro' ? mumbaiMetroLines : maharashtraRailwayLines}
              alerts={alerts}
              onResolveAlert={() => {}} // read-only for passengers
              onAddAlert={() => {}} // read-only for passengers
              userRole="passenger"
              weather={getWeatherForSection(passengerSection)}
              isDark={isDark}
              showAlerts={false}
              onCloseAlerts={() => {}}
            />
          </main>

          {/* ── Footer ── */}
          <footer className="border-t border-slate-200 dark:border-slate-800 mt-8 py-4">
            <div className="max-w-screen-2xl mx-auto px-4 flex items-center justify-between text-xs text-slate-400 dark:text-slate-600">
              <span>Metro Rail Scheduler · Passenger Portal</span>
              <span>
                Logged in as <span style={{ fontWeight: 600 }}>{passengerUser.name}</span> ·{' '}
                <button onClick={handleSwitchPortal} className="underline hover:text-slate-600">
                  Switch Portal
                </button>
              </span>
            </div>
          </footer>
        </div>
      </div>
    );
  }

  return null;
}
