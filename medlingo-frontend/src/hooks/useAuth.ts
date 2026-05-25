import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from './useAuthStore';
import * as authService from '../services/authService';

export interface UseAuthReturn {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

/**
 * Auth actions hook: login, register, logout.
 * Session restoration is handled once in App.tsx — not here.
 */
export function useAuth(): UseAuthReturn {
  const navigate = useNavigate();
  const { setAuth, clearAuth } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(
    async (email: string, password: string): Promise<void> => {
      setIsLoading(true);
      setError(null);
      try {
        const { user, token } = await authService.loginUser(email, password);
        setAuth(user, token.access_token);
        navigate('/chat');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Login failed');
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [navigate, setAuth],
  );

  const register = useCallback(
    async (email: string, password: string): Promise<void> => {
      setIsLoading(true);
      setError(null);
      try {
        const { user, token } = await authService.registerUser(email, password);
        setAuth(user, token.access_token);
        navigate('/chat');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Registration failed');
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [navigate, setAuth],
  );

  const logout = useCallback(async (): Promise<void> => {
    try {
      await authService.logoutUser();
    } finally {
      clearAuth();
      navigate('/');
    }
  }, [navigate, clearAuth]);

  return { login, register, logout, isLoading, error };
}
