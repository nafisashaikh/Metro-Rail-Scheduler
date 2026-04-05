import { useState } from 'react';
import type { PassengerUser } from '../types/metro';
import { ArrowLeft, User, Lock, Eye, EyeOff, UserPlus, Train } from 'lucide-react';
import { apiUrl } from '../config/api';

interface PassengerSignupPageProps {
  onSignupSuccess: (payload: { user: PassengerUser; token: string }) => void;
  onBack: () => void;
  onSwitchToLogin: () => void;
}

export function PassengerSignupPage({
  onSignupSuccess,
  onBack,
  onSwitchToLogin,
}: PassengerSignupPageProps) {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const passwordPolicy = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

  const handleSignup = async () => {
    if (!name.trim() || !username.trim() || !password || !confirmPassword) return;

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (!passwordPolicy.test(password)) {
      setError('Use 8+ chars with uppercase, lowercase, number, and special character.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await fetch(apiUrl('/auth/signup/passenger'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          username: username.trim(),
          password,
        }),
      });

      const data = (await response.json()) as {
        error?: string;
        token?: string;
        user?: PassengerUser;
      };

      if (!response.ok || !data.user || !data.token) {
        setError(data.error ?? 'Unable to sign up right now.');
        return;
      }

      onSignupSuccess({ user: data.user, token: data.token });
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 selection:bg-orange-600 selection:text-white dark:selection:bg-white dark:selection:text-black p-6">
      <div className="w-full max-w-md">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-orange-600 dark:hover:text-white mb-12 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Portal Selection
        </button>

        <div className="mb-10 text-center">
          <div className="w-12 h-12 bg-orange-600 dark:bg-white text-white dark:text-black rounded-xl flex items-center justify-center mx-auto mb-6">
            <UserPlus className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight mb-2">Passenger Sign Up</h1>
          <p className="text-sm text-slate-500">Create your commuter account for journey planning</p>
        </div>

        <div className="space-y-5">
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-transparent border-b-2 border-slate-200 dark:border-slate-800 focus:border-orange-600 dark:focus:border-white outline-none transition-colors text-sm font-medium"
                autoComplete="name"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Username or Email</label>
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
            <p className="mt-1 text-xs text-slate-400">Allowed: letters, numbers, dot, underscore, hyphen, @</p>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-3 bg-transparent border-b-2 border-slate-200 dark:border-slate-800 focus:border-orange-600 dark:focus:border-white outline-none transition-colors text-sm font-medium"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="mt-1 text-xs text-slate-400">At least 8 chars with upper, lower, number, and special.</p>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSignup()}
                className="w-full pl-10 pr-10 py-3 bg-transparent border-b-2 border-slate-200 dark:border-slate-800 focus:border-orange-600 dark:focus:border-white outline-none transition-colors text-sm font-medium"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && <p className="text-xs text-red-500 font-medium pt-2">{error}</p>}

          <div className="pt-6">
            <button
              onClick={handleSignup}
              disabled={loading || !name.trim() || !username.trim() || !password || !confirmPassword}
              className="w-full py-4 bg-orange-600 dark:bg-white text-white dark:text-black rounded-full font-semibold text-sm hover:opacity-80 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <Train className="w-4 h-4" />
              )}
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-slate-500">
            Already have an account?{' '}
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 font-semibold"
            >
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
