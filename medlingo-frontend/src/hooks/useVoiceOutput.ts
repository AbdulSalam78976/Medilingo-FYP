import { useState, useCallback, useEffect } from 'react';
import type { Language } from '../types/index';
import { detectLanguage } from '../utils/queryUtils';
import { useVoiceSettingsStore, type VoicePersona } from './useVoiceSettingsStore';

export interface UseVoiceOutputReturn {
  isSupported: boolean;
  isSpeaking: boolean;
  speak: (text: string) => void;
  stop: () => void;
}

function pickVoice(
  persona: VoicePersona,
  lang: Language,
  voices: SpeechSynthesisVoice[],
): SpeechSynthesisVoice | null {
  if (voices.length === 0) return null;

  if (persona === 'Saira') {
    const urFemale = voices.find(v =>
      v.lang.startsWith('ur') && !v.name.toLowerCase().includes('male'),
    );
    if (urFemale) return urFemale;
    const ur = voices.find(v => v.lang.startsWith('ur'));
    if (ur) return ur;
    return (
      voices.find(v =>
        v.lang.startsWith('en') &&
        (v.name.includes('Samantha') || v.name.includes('Karen') ||
         v.name.includes('Victoria') || v.name.includes('Aria') ||
         v.name.includes('Moira')),
      ) ?? voices[0]
    );
  }

  if (persona === 'Bilal') {
    const urMale = voices.find(v =>
      v.lang.startsWith('ur') && v.name.toLowerCase().includes('male'),
    );
    if (urMale) return urMale;
    const ur = voices.find(v => v.lang.startsWith('ur'));
    if (ur) return ur;
    return (
      voices.find(v =>
        v.lang.startsWith('en') &&
        (v.name.includes('Daniel') || v.name.includes('David') ||
         v.name.includes('Alex') || v.name.includes('Tom') ||
         v.name.includes('Fred')),
      ) ?? voices[0]
    );
  }

  // Aria — English female
  if (lang === 'Urdu') {
    const ur = voices.find(v => v.lang.startsWith('ur'));
    if (ur) return ur;
  }
  return (
    voices.find(v =>
      v.lang.startsWith('en') &&
      (v.name.includes('Aria') || v.name.includes('Samantha') ||
       v.name.includes('Karen') || v.name.includes('Victoria') ||
       v.name.includes('Moira') || v.name.includes('Tessa')),
    ) ?? voices.find(v => v.lang.startsWith('en')) ?? voices[0]
  );
}

export function useVoiceOutput(): UseVoiceOutputReturn {
  const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;
  const [isSpeaking, setIsSpeaking] = useState(false);
  const persona = useVoiceSettingsStore(s => s.persona);
  const speed = useVoiceSettingsStore(s => s.speed);

  useEffect(() => {
    return () => {
      if (isSupported) window.speechSynthesis.cancel();
    };
  }, [isSupported]);

  const speak = useCallback((text: string): void => {
    if (!isSupported) return;
    window.speechSynthesis.cancel();

    const lang = detectLanguage(text);

    const doSpeak = (voices: SpeechSynthesisVoice[]) => {
      const voice = pickVoice(persona, lang, voices);
      const utterance = new SpeechSynthesisUtterance(text);
      if (voice) utterance.voice = voice;
      utterance.rate = speed;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    };

    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      doSpeak(voices);
    } else {
      // Voices load asynchronously on first call in some browsers
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.onvoiceschanged = null;
        doSpeak(window.speechSynthesis.getVoices());
      };
    }
  }, [isSupported, persona, speed]);

  const stop = useCallback((): void => {
    if (!isSupported) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, [isSupported]);

  return { isSupported, isSpeaking, speak, stop };
}
