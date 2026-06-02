import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type VoicePersona = 'Saira' | 'Bilal' | 'Aria';

interface VoiceSettingsStore {
  persona: VoicePersona;
  speed: number;
  autoPlay: boolean;
  setPersona: (p: VoicePersona) => void;
  setSpeed: (s: number) => void;
  setAutoPlay: (v: boolean) => void;
}

export const useVoiceSettingsStore = create<VoiceSettingsStore>()(
  persist(
    (set) => ({
      persona: 'Saira',
      speed: 1.0,
      autoPlay: false,
      setPersona: (persona) => set({ persona }),
      setSpeed: (speed) => set({ speed }),
      setAutoPlay: (autoPlay) => set({ autoPlay }),
    }),
    { name: 'medilingo-voice' },
  ),
);
