import { useState, useEffect, useRef, useCallback } from 'react';

interface ISpeechRecognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

interface ISpeechRecognitionConstructor {
  new (): ISpeechRecognition;
}

declare global {
  interface Window {
    SpeechRecognition: ISpeechRecognitionConstructor;
    webkitSpeechRecognition: ISpeechRecognitionConstructor;
  }
}

export interface UseVoiceInputReturn {
  isSupported: boolean;
  isListening: boolean;
  transcript: string;
  error: string | null;
  startListening: () => void;
  stopListening: () => void;
}

export function useVoiceInput(): UseVoiceInputReturn {
  // Stable reference — window.SpeechRecognition never changes at runtime
  const SpeechRecognitionAPI = useRef<ISpeechRecognitionConstructor | null>(
    typeof window !== 'undefined'
      ? (window.SpeechRecognition ?? window.webkitSpeechRecognition ?? null)
      : null,
  );

  const isSupported = SpeechRecognitionAPI.current !== null;
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<ISpeechRecognition | null>(null);

  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
      recognitionRef.current = null;
    };
  }, []);

  const startListening = useCallback((): void => {
    if (!SpeechRecognitionAPI.current) return;
    if (isListening) return; // already running

    // Abort any stale instance first
    recognitionRef.current?.abort();
    recognitionRef.current = null;

    // Reset transcript so the same phrase said twice re-triggers the ChatPage effect
    setTranscript('');
    setError(null);

    const recognition = new SpeechRecognitionAPI.current();
    recognitionRef.current = recognition;
    recognition.lang = navigator.language || 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const result = event.results[event.results.length - 1];
      if (result.isFinal) setTranscript(result[0].transcript);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      setError(event.error);
      setIsListening(false);
      recognitionRef.current = null;
    };

    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };

    recognition.start();
    setIsListening(true);
  }, [isListening]);

  const stopListening = useCallback((): void => {
    if (!recognitionRef.current) return;
    // stop() finalises pending audio so onresult fires before onend
    // abort() would discard it — that's why the last word was always lost
    recognitionRef.current.stop();
    setIsListening(false); // immediate UI feedback; onend will clean up the ref
  }, []);

  return { isSupported, isListening, transcript, error, startListening, stopListening };
}
