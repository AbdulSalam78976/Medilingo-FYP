import { create } from 'zustand';
import type { AuthUser } from '../types/index';

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  setAuth: (user: AuthUser | null, token: string) => void;
  clearAuth: () => void;
  isAuthenticated: () => boolean;
}

/**
 * Zustand store for authentication state.
 * Access token is stored in memory only — never persisted to localStorage/sessionStorage.
 * Requirements: 3.5, 4.3, 5.4
 */
export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,

  setAuth: (user, token) => set({ user, accessToken: token }),

  clearAuth: () => set({ user: null, accessToken: null }),

  isAuthenticated: () => get().accessToken !== null,
}));
