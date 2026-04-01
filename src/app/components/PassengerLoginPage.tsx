import { useState, useCallback } from 'react';
import { PassengerUser } from '../types/metro';
import { User, Lock, Eye, EyeOff, ArrowLeft, Train, Shield } from 'lucide-react';

interface PassengerLoginPageProps {
  onLogin: (user: PassengerUser) => void;
  onBack: () => void;
}

// ─── SHA-256 via Web Crypto API (zero dependencies, works offline) ─────────────
async function sha256(message: string): Promise<string> {
  const data = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

const PASSENGER_ACCOUNTS = [
  {
    id: 'p001',
    name: 'Rahul Mishra',
    username: 'user001',
    passwordHash: '9b8769a4a742959a2d0298c36fb70623f2dfacda8436237df08d8dfd5b37374c', // pass123
    cardNumber: 'MPC-7842',
  },
  {
    id: 'p002',
    name: 'Ananya Singh',
    username: 'user002',
    passwordHash: 'b276ca769fa5a98df338ab412db9d97f4d394519e273d8165bc63c438b6c7d53', // metro2024
    cardNumber: 'MPC-3391',
  },
];

const DEMO_CREDS = [
  { username: 'user001', password: 'pass123', label: 'Regular Commuter' },
  { username: 'user002', password: 'metro2024', label: 'Frequent Traveler' }
];

export function PassengerLoginPage({ onLogin, onBack }: PassengerLoginPageProps) {
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
      const inputHash = await sha256(password);
      let matchedUser = null;

      for (const account of PASSENGER_ACCOUNTS) {
        if (
          account.username.toLowerCase() === username.trim().toLowerCase() &&
          inputHash === account.passwordHash
        ) {
          matchedUser = account;
          break;
        }
      }

      await new Promise((r) => setTimeout(r, 600));

      if (matchedUser) {
        onLogin({
          id: matchedUser.id,
          name: matchedUser.name,
          username: matchedUser.username,
          cardNumber: matchedUser.cardNumber,
          role: 'passenger',
        });
      } else {
        setError('Invalid credentials.');
      }
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
              Username
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
        </div>
      </div>
    </div>
  );
}
