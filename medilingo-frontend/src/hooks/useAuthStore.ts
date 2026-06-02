import { create } from 'zustand';
import type { AuthUser } from '../types/index';

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  isRestoring: boolean;
  setAuth: (user: AuthUser | null, token: string) => void;
  clearAuth: () => void;
  setRestoring: (v: boolean) => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  isRestoring: true, // true until App.tsx finishes the initial refresh attempt

  setAuth: (user, token) => set({ user, accessToken: token }),
  clearAuth: () => set({ user: null, accessToken: null }),
  setRestoring: (v) => set({ isRestoring: v }),
  isAuthenticated: () => get().accessToken !== null,
}));
