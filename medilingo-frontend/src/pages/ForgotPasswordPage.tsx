import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../services/authService';
import { useThemeStore } from '../hooks/useThemeStore';

export function ForgotPasswordPage() {
  const { dark, toggle } = useThemeStore();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await forgotPassword(email);
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed');
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
                <rect width="20" height="14" x="2" y="5" rx="2"/>
                <path d="m2 10 10 5 10-5"/>
              </svg>
            </div>
            <h1 className="font-display text-[24px] font-semibold text-ink tracking-tight">Forgot Password</h1>
            <p className="text-[13px] text-ink-3 mt-1.5">Enter your email and we'll send a reset link</p>
          </div>

          <div className="card p-6">
            {sent ? (
              <div className="text-center py-2">
                <div className="w-12 h-12 rounded-full bg-teal-50 flex items-center justify-center mx-auto mb-4">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#06A77D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
                <p className="text-[14px] font-medium text-ink mb-1.5">Check your inbox</p>
                <p className="text-[13px] text-ink-3 leading-relaxed">
                  If <span className="text-ink font-medium">{email}</span> is registered, you'll receive a reset link shortly.
                </p>
                <p className="text-[12px] text-ink-4 mt-3">Didn't get it? Check spam or try again.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-[12px] font-medium text-ink-3 mb-1.5" htmlFor="fp-email">
                    Email address
                  </label>
                  <input
                    id="fp-email"
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
                      Sending…
                    </span>
                  ) : (
                    'Send Reset Link'
                  )}
                </button>
              </form>
            )}
          </div>

          <div className="text-center mt-5 flex items-center justify-center gap-4">
            <Link to="/login" className="text-[12px] text-ink-4 hover:text-ink transition-colors">
              ← Back to login
            </Link>
            <span className="text-ink-5 text-[12px]">·</span>
            <Link to="/admin/login" className="text-[12px] text-ink-4 hover:text-ink transition-colors">
              Admin login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
