// Domain types for MedLingo AI Frontend

export type Language = 'English' | 'Urdu' | 'Roman Urdu';

export type MessageRole = 'user' | 'assistant';

export interface RetrievedDoc {
  content: string;
  source: string;          // book name
  chunk_index: string;
  similarity_score: number; // 0.0–1.0
  rank: number;
}

export interface AppError {
  type: 'network' | 'timeout' | 'http' | 'validation' | 'speech';
  message: string;
  statusCode?: number;     // for HTTP errors
  retryable: boolean;
}

export interface Message {
  id: string;              // crypto.randomUUID()
  role: MessageRole;
  text: string;            // raw text (language instruction stripped for display)
  sources: RetrievedDoc[]; // populated for assistant messages
  timestamp: number;       // Date.now()
  error?: AppError;        // set when this message represents a failed query
  imageDataUrl?: string;   // base64 data URL for image messages
}

export interface QueryConfig {
  top_k: number;                    // 1–20, default 5
  temperature: number;              // 0.0–2.0, default 0.7
  max_tokens: number;               // 100–4096, default 2048
  use_advanced: boolean;            // default false
  language: Language | 'auto';      // default 'auto' (detect from text)
}

export interface StreamingState {
  text: string;
  docs: RetrievedDoc[];
  isStreaming: boolean;
}

export interface QueryPayload {
  query: string;           // language-prefixed: "Respond in Urdu: <text>"
  top_k: number;
  temperature: number;
  max_tokens: number;
  use_advanced: boolean;
  conversation_history?: Array<{ role: string; content: string }>;
}

export interface QueryResponse {
  query: string;
  response: string;
  retrieved_docs: RetrievedDoc[];
  num_retrieved: number;
  model: string;
  timestamp: string;
}

export interface HealthResponse {
  status: 'healthy' | string;
  timestamp: string;
  groq_configured: boolean;
}

// Language instruction mapping — prepended to query text before sending to backend
export const LANGUAGE_INSTRUCTIONS: Record<Language, string> = {
  'English':    'Respond in English',
  'Urdu':       'Respond in Urdu',
  'Roman Urdu': 'Respond in Roman Urdu (Latin script transliteration of Urdu)',
};

// Speech recognition locale mapping (Requirements 4.6, 4.7, 4.8)
export const SPEECH_RECOGNITION_LANG: Record<Language, string> = {
  'English':    'en-US',
  'Urdu':       'ur-PK',
  'Roman Urdu': 'en-US',
};

// Text direction mapping — RTL for Urdu, LTR for all others (Requirements 2.3, 2.4)
export const TEXT_DIRECTION: Record<Language, 'rtl' | 'ltr'> = {
  'English':    'ltr',
  'Urdu':       'rtl',
  'Roman Urdu': 'ltr',
};

// ── New types for redesign ──────────────────────────────────────────────────

// Auth types
export interface AuthUser {
  id: string;
  email: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

// Session types
export interface SessionSummary {
  id: string;
  title: string | null;
  created_at: string;   // ISO 8601
  updated_at: string;   // ISO 8601
}

export interface ChatMessage {
  id: string;
  session_id: string;
  role: 'user' | 'assistant';
  content: string;
  sources: RetrievedDoc[] | null;
  created_at: string;   // ISO 8601
}

// Derived display title (client-side utility)
export function deriveSessionTitle(session: SessionSummary, firstUserMessage?: string): string {
  if (session.title) return session.title;
  if (firstUserMessage) {
    const cleaned = firstUserMessage.trim();
    if (cleaned.length <= 45) return cleaned;
    const truncated = cleaned.slice(0, 45);
    const lastSpace = truncated.lastIndexOf(' ');
    return (lastSpace > 20 ? truncated.slice(0, lastSpace) : truncated) + '…';
  }
  return 'New Consultation';
}
