import type { Language, RetrievedDoc } from '../types/index';

/**
 * Detects whether text is Urdu (Arabic script), Roman Urdu, or English.
 *
 * Detection rules:
 *  - If ≥15% of characters are in the Arabic/Urdu Unicode block → Urdu
 *  - Else if common Roman Urdu words are present → Roman Urdu
 *  - Otherwise → English
 */
export function detectLanguage(text: string): Language {
  if (!text.trim()) return 'English';

  // Arabic/Urdu Unicode block: U+0600–U+06FF
  const arabicChars = (text.match(/[\u0600-\u06FF]/g) ?? []).length;
  const ratio = arabicChars / text.length;
  if (ratio >= 0.15) return 'Urdu';

  // Common Roman Urdu words (case-insensitive)
  const romanUrduPattern =
    /\b(kya|hai|hain|mujhe|aap|tum|yeh|woh|kaise|kyun|kahan|kab|mera|tera|hamara|tumhara|unka|apna|bhi|nahi|nahin|hoga|hogi|karo|karna|chahiye|lagta|lagti|pata|samajh|theek|bilkul|zaroor|shayad|lekin|aur|ya|ke|ki|ka|ko|se|mein|par|pe|ne|ho|tha|thi|the|raha|rahi|rahe|gaya|gayi|gaye|aya|ayi|aye)\b/i;
  if (romanUrduPattern.test(text)) return 'Roman Urdu';

  return 'English';
}

/**
 * Builds the query string sent to the backend.
 * If an explicit language is provided, uses it; otherwise auto-detects.
 * Format must match the regex in backend/app/rag/engine.py _strip_lang_prefix().
 */
export function buildQuery(userText: string, explicitLang?: Language | 'auto'): string {
  const lang = (explicitLang && explicitLang !== 'auto')
    ? explicitLang
    : detectLanguage(userText);
  const instructions: Record<Language, string> = {
    'English':    'Respond in English',
    'Urdu':       'Respond in Urdu',
    'Roman Urdu': 'Respond in Roman Urdu',
  };
  return `${instructions[lang]}: ${userText}`;
}

/**
 * Returns true if the text contains at least one non-whitespace character.
 */
export function isValidQuery(text: string): boolean {
  return text.trim().length > 0;
}

/**
 * Clamps a numeric config value to its declared valid range.
 */
export function clampConfig(
  value: number,
  param: 'top_k' | 'temperature' | 'max_tokens',
): number {
  const ranges: Record<'top_k' | 'temperature' | 'max_tokens', [number, number]> = {
    top_k:       [1,   20],
    temperature: [0.0, 2.0],
    max_tokens:  [100, 4096],
  };
  const [min, max] = ranges[param];
  return Math.min(max, Math.max(min, value));
}

/**
 * Selects the best available TTS voice for the given language.
 */
export function selectVoice(
  language: Language,
  voices: SpeechSynthesisVoice[],
): SpeechSynthesisVoice | null {
  if (voices.length === 0) return null;
  if (language === 'Urdu') {
    return voices.find((v) => v.lang.startsWith('ur')) ?? voices[0];
  }
  return voices[0];
}

/**
 * Returns a new array of RetrievedDoc sorted descending by similarity_score.
 */
export function sortSourcesByScore(docs: RetrievedDoc[]): RetrievedDoc[] {
  return [...docs].sort((a, b) => b.similarity_score - a.similarity_score);
}
