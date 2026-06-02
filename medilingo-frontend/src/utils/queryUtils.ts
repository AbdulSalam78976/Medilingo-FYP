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

  // Roman Urdu detection — covers formal words AND informal Pakistani texting shorthand.
  // Deliberately excludes "to", "hi", "ho" — too common in English to be useful signals.
  const romanUrduPattern = /\b(kya|kia|kyun|kyunke|kahan|kaisy|kaise|kesy|kese|kasy|kab|kaun|kitna|kitni|hai|hain|hy|hein|hoga|hogi|honge|hosakta|tha|thi|raha|rahi|rahe|gaya|gayi|gaye|aya|ayi|aye|karo|kry|kro|krna|karna|kren|kiya|karein|kijiye|chahiye|chahte|chahti|chaho|nahi|nahin|nhi|mat|mujhe|mujhy|meri|mera|mere|aap|ap|tum|tumhara|tumhari|hamara|hamari|hum|mujh|yeh|yh|woh|wo|usse|isko|usko|iska|uska|unka|inki|unki|apna|apni|apne|bhi|toh|lekin|magar|phir|aur|agar|jab|jis|jaise|ke|ki|ka|ko|se|par|pe|bohat|bohot|bahut|ziada|zyada|bilkul|zaroor|zarori|sirf|bas|kuch|koi|dono|theek|acha|accha|galat|mushkil|asaan|shayad|lagta|lagti|samajh|pata|maloom|haan|han|waqt|wakt|tarika|tareeqa|wajah|waja|dawa|dawai|bimari|sehat|ilaj|mareez|dard|bukhar|khoon)\b/i;
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
