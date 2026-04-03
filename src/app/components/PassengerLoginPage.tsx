import { useState, useCallback } from 'react';
import type { PassengerUser } from '../types/metro';
import { User, Lock, Eye, EyeOff, ArrowLeft, Train, Shield } from 'lucide-react';

interface PassengerLoginPageProps {
  onLogin: (payload: { user: PassengerUser; token: string }) => void;
  onBack: () => void;
  onSwitchToSignup: () => void;
}

const API_BASE = `${window.location.protocol}//${window.location.hostname}:4000`;

const DEMO_CREDS = [
  { username: 'user001', password: 'pass123', label: 'Regular Commuter' },
  { username: 'user002', password: 'metro2024', label: 'Frequent Traveler' },
];

export function PassengerLoginPage({ onLogin, onBack, onSwitchToSignup }: PassengerLoginPageProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = useCallback(async () => {
    if (!username.trim() || !password) return;
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: 'passenger',
          identifier: username.trim(),
          password,
        }),
      });

      const data = (await response.json()) as {
        error?: string;
        token?: string;
        user?: PassengerUser;
      };

      if (!response.ok || !data.user || !data.token) {
        setError(data.error ?? 'Invalid credentials.');
        return;
      }

      onLogin({ user: data.user, token: data.token });
    } catch {
      setError('Authentication failed.');
    } finally {
      setLoading(false);
    }
  }, [username, password, onLogin]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 selection:bg-orange-600 selection:text-white dark:selection:bg-white dark:selection:text-black p-6">
      <div className="w-full max-w-md">
        {/* Top bar / Back button */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-orange-600 dark:hover:text-white mb-12 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Portal Selection
        </button>

        {/* Header */}
        <div className="mb-10 text-center">
          <div className="w-12 h-12 bg-orange-600 dark:bg-white text-white dark:text-black rounded-xl flex items-center justify-center mx-auto mb-6">
            <User className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight mb-2">Passenger Portal</h1>
          <p className="text-sm text-slate-500">
            Secure entry to journey planner & active schedules
          </p>
        </div>

        {/* Security badge */}
        <div className="flex items-center justify-center gap-2 text-xs font-medium text-emerald-600 dark:text-emerald-400 mb-8">
          <Shield className="w-3.5 h-3.5" />
          SHA-256 Encrypted Login
        </div>

        {/* Inputs */}
        <div className="space-y-5">
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">
              Username or Email
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-transparent border-b-2 border-slate-200 dark:border-slate-800 focus:border-orange-600 dark:focus:border-white outline-none transition-colors text-sm font-medium"
                autoComplete="username"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                className="w-full pl-10 pr-10 py-3 bg-transparent border-b-2 border-slate-200 dark:border-slate-800 focus:border-orange-600 dark:focus:border-white outline-none transition-colors text-sm font-medium"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && <p className="text-xs text-red-500 font-medium pt-2">{error}</p>}

          <div className="pt-6">
            <button
              onClick={handleLogin}
              disabled={loading || !username.trim() || !password}
              className="w-full py-4 bg-orange-600 dark:bg-white text-white dark:text-black rounded-full font-semibold text-sm hover:opacity-80 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <Train className="w-4 h-4" />
              )}
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </div>
        </div>

        {/* Demo Hints */}
        <div className="mt-12 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
          <p className="text-xs text-slate-400 mb-2">Demo Credentials</p>
          <div className="flex flex-wrap justify-center gap-4 text-xs font-mono text-slate-500">
            {DEMO_CREDS.map((c) => (
              <span key={c.username}>
                {c.username} : {c.password}
              </span>
            ))}
          </div>
          <p className="text-sm text-slate-500 mt-5">
            New passenger?{' '}
            <button
              type="button"
              onClick={onSwitchToSignup}
              className="text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 font-semibold"
            >
              Create an account
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
