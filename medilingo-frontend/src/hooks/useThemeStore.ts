import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const ZOOM_STEPS = [80, 90, 100, 110, 120] as const;

interface ThemeStore {
  dark: boolean;
  toggle: () => void;
  zoom: number;
  zoomIn: () => void;
  zoomOut: () => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      dark: false,
      toggle: () => {
        const next = !get().dark;
        document.documentElement.classList.toggle('dark', next);
        set({ dark: next });
      },
      zoom: 100,
      zoomIn: () => {
        const idx = ZOOM_STEPS.indexOf(get().zoom as typeof ZOOM_STEPS[number]);
        if (idx < ZOOM_STEPS.length - 1) set({ zoom: ZOOM_STEPS[idx + 1] });
      },
      zoomOut: () => {
        const idx = ZOOM_STEPS.indexOf(get().zoom as typeof ZOOM_STEPS[number]);
        if (idx > 0) set({ zoom: ZOOM_STEPS[idx - 1] });
      },
    }),
    { name: 'medilingo-theme' },
  ),
);
