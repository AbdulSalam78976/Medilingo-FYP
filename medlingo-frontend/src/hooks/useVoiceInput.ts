import { useState, useEffect, useRef } from 'react';

interface ISpeechRecognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start(): void;
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

/**
 * Wraps the Web Speech API.
 * Language is NOT specified — the browser uses its default locale which
 * handles multilingual input well. The detected transcript is then passed
 * through detectLanguage() in queryUtils for response language selection.
 */
export function useVoiceInput(): UseVoiceInputReturn {
  const SpeechRecognitionAPI =
    typeof window !== 'undefined'
      ? (window.SpeechRecognition ?? window.webkitSpeechRecognition ?? null)
      : null;

  const isSupported = SpeechRecognitionAPI !== null;
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

  const startListening = (): void => {
    if (!isSupported || !SpeechRecognitionAPI) return;
    recognitionRef.current?.abort();

    const recognition = new SpeechRecognitionAPI();
    recognitionRef.current = recognition;
    // Use browser default locale — handles Urdu, English, Roman Urdu input
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
    };
    recognition.onend = () => setIsListening(false);

    recognition.start();
    setIsListening(true);
    setError(null);
  };

  const stopListening = (): void => {
    recognitionRef.current?.abort();
    recognitionRef.current = null;
    setIsListening(false);
  };

  return { isSupported, isListening, transcript, error, startListening, stopListening };
}
