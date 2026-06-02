import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { resetPassword } from '../services/authService';
import { useThemeStore } from '../hooks/useThemeStore';

export function ResetPasswordPage() {
  const { dark, toggle } = useThemeStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setLoading(true);
    try {
      await resetPassword(token, password);
      setDone(true);
      setTimeout(() => navigate('/login', { replace: true }), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Reset failed');
    } finally {
      setLoading(false);
    }
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

          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-xl bg-blue flex items-center justify-center mx-auto mb-4 shadow-card">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>
            <h1 className="font-display text-[24px] font-semibold text-ink tracking-tight">New Password</h1>
            <p className="text-[13px] text-ink-3 mt-1.5">Choose a strong password for your account</p>
          </div>

          <div className="card p-6">
            {!token ? (
              <div className="text-center py-2">
                <p className="text-[13px] text-danger mb-4">No reset token found. Please use the link from your email.</p>
                <Link to="/forgot-password" className="btn btn-primary text-[13px]">Request New Link</Link>
              </div>
            ) : done ? (
              <div className="text-center py-2">
                <div className="w-12 h-12 rounded-full bg-teal-50 flex items-center justify-center mx-auto mb-4">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#06A77D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
                <p className="text-[14px] font-medium text-ink mb-1.5">Password updated!</p>
                <p className="text-[13px] text-ink-3">Redirecting you to login…</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-[12px] font-medium text-ink-3 mb-1.5" htmlFor="rp-password">
                    New password
                  </label>
                  <input
                    id="rp-password"
                    type="password"
                    autoComplete="new-password"
                    autoFocus
                    required
                    minLength={8}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Min. 8 characters"
                    className="w-full px-3 py-2.5 rounded-md border border-line bg-paper text-ink text-[13px] placeholder:text-ink-5 focus:outline-none focus:ring-2 focus:ring-blue/30 focus:border-blue transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-medium text-ink-3 mb-1.5" htmlFor="rp-confirm">
                    Confirm password
                  </label>
                  <input
                    id="rp-confirm"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
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
                      Updating…
                    </span>
                  ) : (
                    'Update Password'
                  )}
                </button>
              </form>
            )}
          </div>

          <div className="text-center mt-5">
            <Link to="/login" className="text-[12px] text-ink-4 hover:text-ink transition-colors">
              ← Back to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResetPasswordPage;
