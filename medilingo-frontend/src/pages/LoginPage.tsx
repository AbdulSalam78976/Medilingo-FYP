import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import { useAuthStore } from '../hooks/useAuthStore';
import { ThemeToggle } from '../components/ThemeToggle';

function MediLingoMark({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none" style={{ display: 'block' }}>
      <rect width="36" height="36" rx="9" fill="#1A5F7A" />
      <rect x="14.5" y="8" width="7" height="20" rx="2.5" fill="white" />
      <rect x="8" y="14.5" width="20" height="7" rx="2.5" fill="white" />
      <circle cx="27" cy="27" r="5.5" fill="#06A77D" />
      <path d="M24 27 L25.5 27 L26.2 24.8 L27 29.2 L27.8 27 L29.2 27"
        stroke="white" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

export function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoading, error } = useAuth();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    if (isAuthenticated()) navigate('/chat');
  }, [isAuthenticated, navigate]);

  function validateEmail(v: string) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    setEmailError('');
    return true;
  }

  function validatePassword(v: string) {
    if (!v) { setPasswordError('Password is required'); return false; }
    setPasswordError('');
    return true;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validateEmail(email) || !validatePassword(password)) return;
    try {
      await login(email, password);
      toast.success('Welcome back!');
    } catch { /* handled by useAuth */ }
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-4 relative">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-[400px] animate-fade-in">

        {/* Wordmark */}
        <Link to="/" className="flex items-center justify-center gap-2.5 mb-10">
          <MediLingoMark size={24} />
          <span className="font-display font-semibold text-[18px] tracking-tight text-ink">MediLingo</span>
        </Link>

        {/* Card */}
        <div className="bg-paper border border-line rounded-lg shadow-card p-8">
          <h1 className="font-display text-[22px] font-medium text-ink text-center mb-1">
            Welcome back
          </h1>
          <p className="text-[13px] text-ink-4 text-center mb-7">
            Sign in to your account
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
            {/* Email */}
            <div>
              <label htmlFor="login-email" className="block text-[13px] font-medium text-ink-2 mb-1.5">
                Email
              </label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); if (emailError) validateEmail(e.target.value); }}
                onBlur={() => validateEmail(email)}
                className={`field ${emailError ? 'field-error' : ''}`}
                placeholder="you@example.com"
                autoComplete="email"
                disabled={isLoading}
              />
              {emailError && (
                <p className="mt-1.5 text-[12px] text-danger" role="alert">{emailError}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="login-password" className="block text-[13px] font-medium text-ink-2">
                  Password
                </label>
                <Link to="/forgot-password" className="text-[12px] text-blue hover:text-blue-700 transition-colors">
                  Forgot password?
                </Link>
              </div>
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); if (passwordError) validatePassword(e.target.value); }}
                onBlur={() => validatePassword(password)}
                className={`field ${passwordError ? 'field-error' : ''}`}
                placeholder="••••••••"
                autoComplete="current-password"
                disabled={isLoading}
              />
              {passwordError && (
                <p className="mt-1.5 text-[12px] text-danger" role="alert">{passwordError}</p>
              )}
            </div>

            {/* Server error */}
            {error && (
              <div className="bg-amber-50 border border-amber/30 rounded-sm px-3.5 py-3" role="alert">
                <p className="text-[13px] text-amber">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full justify-center py-3 mt-1"
            >
              {isLoading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in…
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-[13px] text-ink-4">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue font-medium hover:text-blue-700 transition-colors">
              Register
            </Link>
          </p>
        </div>

        {/* Disclaimer */}
        <p className="mt-5 text-center text-[11px] text-ink-5 leading-relaxed">
          MediLingo provides health information only.<br />
          It does not replace professional medical advice.
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
