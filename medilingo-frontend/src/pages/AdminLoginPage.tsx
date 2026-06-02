import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../hooks/useAuthStore';
import * as authService from '../services/authService';
import { useThemeStore } from '../hooks/useThemeStore';

export function AdminLoginPage() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const user = useAuthStore(s => s.user);
  const isRestoring = useAuthStore(s => s.isRestoring);
  const { dark, toggle } = useThemeStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If already logged in, skip the form and go straight to /admin
  useEffect(() => {
    if (!isRestoring && user) {
      navigate('/admin', { replace: true });
    }
  }, [isRestoring, user, navigate]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { user: u, token } = await authService.loginUser(email, password);
      setAuth(u, token.access_token);
      navigate('/admin', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  if (isRestoring) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <svg className="w-5 h-5 animate-spin text-ink-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4Z"/>
        </svg>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      {/* Theme toggle */}
      <div className="absolute top-4 right-4">
        <button
          type="button"
          onClick={toggle}
          aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
          className="flex items-center justify-center w-8 h-8 rounded-md border border-line-strong hover:bg-paper-2 transition-colors text-ink-3 hover:text-ink"
        >
          {dark ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <circle cx="12" cy="12" r="5"/>
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
          )}
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">

          {/* Header */}
          <div className="text-center mb-8">
            {/* Shield icon */}
            <div className="w-14 h-14 rounded-xl bg-blue flex items-center justify-center mx-auto mb-4 shadow-card">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
            <h1 className="font-display text-[24px] font-semibold text-ink tracking-tight">Admin Access</h1>
            <p className="text-[13px] text-ink-3 mt-1.5">Sign in to the MediLingo dashboard</p>
          </div>

          {/* Form card */}
          <div className="card p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[12px] font-medium text-ink-3 mb-1.5" htmlFor="admin-email">
                  Email address
                </label>
                <input
                  id="admin-email"
                  type="email"
                  autoComplete="email"
                  autoFocus
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-3 py-2.5 rounded-md border border-line bg-paper text-ink text-[13px] placeholder:text-ink-5 focus:outline-none focus:ring-2 focus:ring-blue/30 focus:border-blue transition-colors"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[12px] font-medium text-ink-3" htmlFor="admin-password">
                    Password
                  </label>
                  <Link to="/forgot-password" className="text-[12px] text-blue hover:text-blue-700 transition-colors">
                    Forgot password?
                  </Link>
                </div>
                <input
                  id="admin-password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2.5 rounded-md border border-line bg-paper text-ink text-[13px] placeholder:text-ink-5 focus:outline-none focus:ring-2 focus:ring-blue/30 focus:border-blue transition-colors"
                />
              </div>

              {error && (
                <div className="flex items-start gap-2.5 px-3 py-2.5 bg-danger/8 border border-danger/20 rounded-md">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C2483B" strokeWidth="1.8" strokeLinecap="round" className="flex-shrink-0 mt-0.5">
                    <circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>
                  </svg>
                  <p className="text-[12px] text-danger leading-snug">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full justify-center text-[13px] mt-1 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4Z"/>
                    </svg>
                    Signing in…
                  </span>
                ) : (
                  'Sign in to Admin'
                )}
              </button>
            </form>
          </div>

          {/* Footer note */}
          <p className="text-center text-[12px] text-ink-4 mt-4">
            Your email must be in{' '}
            <code className="text-blue text-[11px]">ADMIN_EMAILS</code>
            {' '}in <code className="text-blue text-[11px]">backend/.env</code>
          </p>

          <div className="text-center mt-5">
            <Link to="/" className="text-[12px] text-ink-4 hover:text-ink transition-colors">
              ← Back to site
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminLoginPage;
