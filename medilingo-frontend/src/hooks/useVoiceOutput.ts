import { useState, useCallback, useEffect, useRef } from 'react';
import type { Language } from '../types/index';
import { detectLanguage } from '../utils/queryUtils';
import { useVoiceSettingsStore, type VoicePersona } from './useVoiceSettingsStore';

export interface UseVoiceOutputReturn {
  isSupported: boolean;
  isSpeaking: boolean;
  isLoading: boolean;   // true while fetching audio from backend, before playback starts
  speak: (text: string, personaOverride?: VoicePersona) => void;
  stop: () => void;
}

// ── Markdown stripper ─────────────────────────────────────────────────────────
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

// ── English browser TTS voice picker ─────────────────────────────────────────
function pickEnglishVoice(
  persona: VoicePersona,
  voices: SpeechSynthesisVoice[],
): SpeechSynthesisVoice | null {
  if (voices.length === 0) return null;

  if (persona === 'Saira') {
    return (
      voices.find(v =>
        v.lang.startsWith('en') &&
        (v.name.includes('Samantha') || v.name.includes('Karen') ||
         v.name.includes('Victoria') || v.name.includes('Aria') ||
         v.name.includes('Moira')),
      ) ?? voices.find(v => v.lang.startsWith('en')) ?? voices[0]
    );
  }

  if (persona === 'Bilal') {
    return (
      voices.find(v =>
        v.lang.startsWith('en') &&
        (v.name.includes('Daniel') || v.name.includes('David') ||
         v.name.includes('Alex') || v.name.includes('Tom') ||
         v.name.includes('Fred')),
      ) ?? voices.find(v => v.lang.startsWith('en')) ?? voices[0]
    );
  }

  // Aria (default)
  return (
    voices.find(v =>
      v.lang.startsWith('en') &&
      (v.name.includes('Aria') || v.name.includes('Samantha') ||
       v.name.includes('Karen') || v.name.includes('Victoria')),
    ) ?? voices.find(v => v.lang.startsWith('en')) ?? voices[0]
  );
}

// ── Backend Edge TTS call (streams MP3, collects into ArrayBuffer) ────────────
async function fetchTTSAudio(
  text: string,
  language: Language,
  persona: VoicePersona,
  speed: number,
): Promise<ArrayBuffer> {
  const res = await fetch('/tts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, language, persona, speed }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail ?? `TTS request failed (${res.status})`);
  }
  // Collect streamed chunks — browser starts receiving immediately,
  // audio decodes as soon as all bytes arrive (typically < 1 s for short text)
  const chunks: Uint8Array[] = [];
  const reader = res.body!.getReader();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) chunks.push(value);
  }
  const total = chunks.reduce((n, c) => n + c.byteLength, 0);
  const merged = new Uint8Array(total);
  let offset = 0;
  for (const c of chunks) { merged.set(c, offset); offset += c.byteLength; }
  return merged.buffer;
}

// ── Hook ──────────────────────────────────────────────────────────────────────
export function useVoiceOutput(): UseVoiceOutputReturn {
  const isSupported = typeof window !== 'undefined' &&
    ('speechSynthesis' in window || 'AudioContext' in window || 'webkitAudioContext' in window);

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading,  setIsLoading]  = useState(false);

  // Read from store
  const persona = useVoiceSettingsStore(s => s.persona);
  const speed   = useVoiceSettingsStore(s => s.speed);

  // Refs — always hold latest values so speak() never has a stale closure
  const personaRef = useRef(persona);
  const speedRef   = useRef(speed);
  useEffect(() => { personaRef.current = persona; }, [persona]);
  useEffect(() => { speedRef.current   = speed;   }, [speed]);

  const audioCtxRef    = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

  useEffect(() => {
    return () => {
      audioSourceRef.current?.stop();
      audioCtxRef.current?.close();
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    };
  }, []);

  const stop = useCallback((): void => {
    audioSourceRef.current?.stop();
    audioSourceRef.current = null;
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsLoading(false);
  }, []);

  // speak is stable (no persona/speed deps) — reads latest via refs instead
  const speak = useCallback((text: string, personaOverride?: VoicePersona): void => {
    if (!isSupported) return;

    stop();

    const clean = stripMarkdown(text);
    if (!clean) return;

    const lang          = detectLanguage(clean);
    const activePersona = personaOverride ?? personaRef.current;
    const activeSpeed   = speedRef.current;

    setIsLoading(true);

    fetchTTSAudio(clean, lang, activePersona, activeSpeed)
      .then(async (arrayBuffer) => {
        const AudioCtx = window.AudioContext ?? (window as any).webkitAudioContext;
        const ctx = new AudioCtx();
        audioCtxRef.current = ctx;

        const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
        const source = ctx.createBufferSource();
        source.buffer             = audioBuffer;
        source.playbackRate.value = activeSpeed;
        source.connect(ctx.destination);

        source.onended = () => {
          setIsSpeaking(false);
          setIsLoading(false);
          audioSourceRef.current = null;
        };

        audioSourceRef.current = source;
        setIsLoading(false);
        setIsSpeaking(true);
        source.start(0);
      })
      .catch((err) => {
        console.warn('Edge TTS failed, falling back to browser TTS:', err);
        setIsLoading(false);
        _speakWithBrowser(clean, lang, activePersona, activeSpeed, setIsSpeaking);
      });
  }, [isSupported, stop]); // stable — persona/speed come from refs

  return { isSupported, isSpeaking, isLoading, speak, stop };
}

// ── Browser SpeechSynthesis helper (English only) ────────────────────────────
function _speakWithBrowser(
  clean: string,
  lang: Language,
  persona: VoicePersona,
  speed: number,
  setIsSpeaking: (v: boolean) => void,
): void {
  if (!('speechSynthesis' in window)) return;

  const doSpeak = (voices: SpeechSynthesisVoice[]) => {
    const voice = pickEnglishVoice(persona, voices);
    const utterance = new SpeechSynthesisUtterance(clean);
    if (voice) utterance.voice = voice;
    utterance.rate   = speed;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend   = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const voices = window.speechSynthesis.getVoices();
  if (voices.length > 0) {
    doSpeak(voices);
  } else {
    window.speechSynthesis.onvoiceschanged = () => {
      window.speechSynthesis.onvoiceschanged = null;
      doSpeak(window.speechSynthesis.getVoices());
    };
  }
}
