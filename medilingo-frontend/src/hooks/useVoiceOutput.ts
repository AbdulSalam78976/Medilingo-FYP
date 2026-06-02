import { useState, useCallback, useEffect } from 'react';
import type { Language } from '../types/index';
import { detectLanguage } from '../utils/queryUtils';
import { useVoiceSettingsStore, type VoicePersona } from './useVoiceSettingsStore';

export interface UseVoiceOutputReturn {
  isSupported: boolean;
  isSpeaking: boolean;
  speak: (text: string, personaOverride?: VoicePersona) => void;
  stop: () => void;
}

function stripMarkdown(text: string): string {
  return text
    .replace(/#{1,6}\s+/g, '')
    .replace(/\*\*\*(.+?)\*\*\*/g, '$1')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/`{1,3}[\s\S]*?`{1,3}/g, '')
    .replace(/\[(.+?)\]\(.+?\)/g, '$1')
    .replace(/^[-*+]\s+/gm, '')
    .replace(/^\d+\.\s+/gm, '')
    .replace(/^>\s+/gm, '')
    .replace(/^-{3,}$/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
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

  const speak = useCallback((text: string, personaOverride?: VoicePersona): void => {
    if (!isSupported) return;
    window.speechSynthesis.cancel();

    const clean = stripMarkdown(text);
    const lang = detectLanguage(clean);
    const activePersona = personaOverride ?? persona;

    const doSpeak = (voices: SpeechSynthesisVoice[]) => {
      const voice = pickVoice(activePersona, lang, voices);
      const utterance = new SpeechSynthesisUtterance(clean);
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
  }, [isSupported, persona, speed]); // personaOverride is runtime arg, not a dep

  const stop = useCallback((): void => {
    if (!isSupported) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, [isSupported]);

  return { isSupported, isSpeaking, speak, stop };
}
