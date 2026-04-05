import { useState } from 'react';
import type { User } from '../types/metro';
import { Train, Shield, Eye, EyeOff, Lock, LogIn, ArrowLeft } from 'lucide-react';
import { apiUrl } from '../config/api';

type StaffRole = 'admin' | 'supervisor' | 'employee';

interface LoginPageProps {
  onLogin: (payload: { user: User; token: string }) => void;
  onBack?: () => void;
}

const DEMO_USERS: { role: StaffRole; user: User; password: string }[] = [
  {
    role: 'admin',
    password: 'admin123',
    user: {
      id: '1',
      name: 'Rajesh Kumar',
      role: 'admin',
      employeeId: 'MRS-A-001',
      department: 'Administration',
    },
  },
  {
    role: 'supervisor',
    password: 'super123',
    user: {
      id: '2',
      name: 'Priya Sharma',
      role: 'supervisor',
      employeeId: 'MRS-S-042',
      department: 'Operations',
    },
  },
  {
    role: 'employee',
    password: 'emp123',
    user: {
      id: '3',
      name: 'Amit Patil',
      role: 'employee',
      employeeId: 'MRS-E-187',
      department: 'Station Management',
    },
  },
];

export function LoginPage({ onLogin, onBack }: LoginPageProps) {
  const [selectedRole, setSelectedRole] = useState<StaffRole>('admin');
  const [employeeId, setEmployeeId] = useState('MRS-A-001');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRoleSelect = (role: StaffRole) => {
    setSelectedRole(role);
    const match = DEMO_USERS.find((u) => u.role === role);
    if (match) {
      setEmployeeId(match.user.employeeId);
    }
    setPassword('');
    setError('');
  };

  const handleLogin = async () => {
    setError('');
    setLoading(true);

    try {
      const response = await fetch(apiUrl('/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: selectedRole,
          identifier: employeeId.trim(),
          password,
        }),
      });

      const data = (await response.json()) as {
        error?: string;
        token?: string;
        user?: User;
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
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black p-6">
      <div className="w-full max-w-md">
        {/* Top bar / Back button */}
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-black dark:hover:text-white mb-12 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Portal Selection
          </button>
        )}

        {/* Header */}
        <div className="mb-10 text-center">
          <div className="w-12 h-12 bg-black dark:bg-white text-white dark:text-black rounded-xl flex items-center justify-center mx-auto mb-6">
            <Train className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight mb-2">Staff Access</h1>
          <p className="text-sm text-slate-500">Authenticate to operations dashboard</p>
        </div>

        {/* Role pills */}
        <div className="flex gap-2 mb-8 bg-slate-50 border border-slate-100 dark:bg-slate-900 dark:border-slate-800 p-1 rounded-xl">
          {(['admin', 'supervisor', 'employee'] as StaffRole[]).map((role) => (
            <button
              key={role}
              onClick={() => handleRoleSelect(role)}
              className={`flex-1 py-1.5 text-xs font-medium rounded-lg capitalize transition-colors ${
                selectedRole === role
                  ? 'bg-white dark:bg-black shadow-sm dark:shadow-none border border-slate-200 dark:border-slate-700 text-black dark:text-white'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              {role}
            </button>
          ))}
        </div>

        {/* Inputs */}
        <div className="space-y-5">
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">
              Employee ID
            </label>
            <div className="relative">
              <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-transparent border-b-2 border-slate-200 dark:border-slate-800 focus:border-black dark:focus:border-white outline-none transition-colors text-sm font-medium"
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
                className="w-full pl-10 pr-10 py-3 bg-transparent border-b-2 border-slate-200 dark:border-slate-800 focus:border-black dark:focus:border-white outline-none transition-colors text-sm font-medium"
                placeholder="••••••••"
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
              disabled={loading || !password}
              className="w-full py-4 bg-black dark:bg-white text-white dark:text-black rounded-full font-semibold text-sm hover:opacity-80 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <LogIn className="w-4 h-4" />
              )}
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </div>
        </div>

        {/* Demo Hints (only visible in dev) */}
        {window.location.hostname === 'localhost' && (
          <div className="mt-12 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
            <p className="text-xs text-slate-400 mb-2">Demo Credentials</p>
            <div className="flex flex-wrap justify-center gap-4 text-xs font-mono text-slate-500">
              {DEMO_USERS.map((u) => (
                <span key={u.role}>
                  {u.user.employeeId} : {u.password}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
