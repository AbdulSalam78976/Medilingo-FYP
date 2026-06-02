import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { AppRoutes } from './router';
import { useAuthStore } from './hooks/useAuthStore';
import { useThemeStore } from './hooks/useThemeStore';
import * as authService from './services/authService';
import './index.css';

export function App() {
  const { setAuth, setRestoring } = useAuthStore();
  const { dark } = useThemeStore(); // still needed to sync class on mount

  // Sync persisted theme to <html> class on mount
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      try {
        const newToken = await authService.refreshAccessToken();
        if (cancelled) return;
        const user = await authService.getMe(newToken);
        if (cancelled) return;
        setAuth(user, newToken);
      } catch {
        // No valid refresh cookie — user stays as guest
      } finally {
        if (!cancelled) setRestoring(false);
      }
    }

    restoreSession();
    return () => { cancelled = true; };
  }, [setAuth, setRestoring]);

  return (
    <div className="min-h-screen bg-bg text-ink font-sans antialiased">
      <AppRoutes />
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: 'rgb(var(--color-paper))',
            color: 'rgb(var(--color-ink))',
            fontSize: '13px',
            border: '1px solid rgb(var(--color-line))',
            boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
            borderRadius: '8px',
            padding: '10px 14px',
          },
          success: {
            iconTheme: { primary: '#06A77D', secondary: '#fff' },
          },
          error: {
            iconTheme: { primary: '#C2483B', secondary: '#fff' },
          },
        }}
      />
    </div>
  );
}

export default App;
