import { useRef, useState, useLayoutEffect, type KeyboardEvent } from 'react';
import { isValidQuery } from '../utils/queryUtils';
import type { Language } from '../types/index';

type LangOption = Language | 'auto';

const LANG_OPTIONS: { value: LangOption; label: string; short: string }[] = [
  { value: 'auto',       label: 'Auto-detect', short: 'Auto' },
  { value: 'English',    label: 'English',      short: 'EN'  },
  { value: 'Urdu',       label: 'اردو',         short: 'اردو'},
  { value: 'Roman Urdu', label: 'Roman Urdu',   short: 'RU'  },
];

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'];
const MAX_FILE_MB = 20;

interface InputBarProps {
  value: string;
  onChange: (v: string) => void;
  onSubmit: (text: string, imageFile?: File) => void;
  isLoading: boolean;
  voiceInputSupported: boolean;
  isListening: boolean;
  onStartListening: () => void;
  onStopListening: () => void;
  language: LangOption;
  onLanguageChange: (lang: LangOption) => void;
}

export function InputBar({
  value,
  onChange,
  onSubmit,
  isLoading,
  voiceInputSupported,
  isListening,
  onStartListening,
  onStopListening,
  language,
  onLanguageChange,
}: InputBarProps) {
  const [validationError, setValidationError] = useState<string | null>(null);
  const [langOpen, setLangOpen] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useLayoutEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [value]);

  function handleSubmit() {
    if (!imageFile && !isValidQuery(value)) {
      setValidationError('Please enter a question before submitting.');
      textareaRef.current?.focus();
      return;
    }
    setValidationError(null);
    onSubmit(value, imageFile ?? undefined);
    // Clear image after submit
    setImageFile(null);
    setImagePreview(null);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); }
  }

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    onChange(e.target.value);
    if (validationError && e.target.value.trim()) setValidationError(null);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setValidationError('Unsupported file type. Use JPG, PNG, WebP, GIF, or PDF.');
      return;
    }
    if (file.size > MAX_FILE_MB * 1024 * 1024) {
      setValidationError(`File too large (max ${MAX_FILE_MB} MB).`);
      return;
    }
    setValidationError(null);
    setImageFile(file);
    if (file.type !== 'application/pdf') {
      const reader = new FileReader();
      reader.onload = (ev) => setImagePreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
    // Reset so the same file can be re-selected
    e.target.value = '';
  }

  function removeImage() {
    setImageFile(null);
    setImagePreview(null);
  }

  const currentLang = LANG_OPTIONS.find(o => o.value === language) ?? LANG_OPTIONS[0];
  const canSubmit = !isLoading && (!!value.trim() || !!imageFile);
  const nearLimit = value.length > 900;

  return (
    <div className="border-t border-line bg-bg px-4 py-4 flex-shrink-0 z-20">
      {validationError && (
        <p role="alert" aria-live="assertive" className="mb-2 text-[12px] text-amber font-medium px-1">
          ⚠ {validationError}
        </p>
      )}

      <div className="max-w-[760px] mx-auto">
        {/* Image preview strip */}
        {imageFile && (
          <div className="mb-2 flex items-center gap-2 px-1">
            {imagePreview ? (
              <img src={imagePreview} alt="Attached" className="h-14 w-14 object-cover rounded-sm border border-line" />
            ) : (
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm bg-paper border border-line text-[12px] text-ink-3">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/></svg>
                {imageFile.name}
              </div>
            )}
            <button
              type="button"
              onClick={removeImage}
              className="p-1 rounded-xs text-ink-4 hover:text-danger transition-colors"
              aria-label="Remove attached file"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>
        )}

        {/* Composer card */}
        <div className={`card shadow-card flex items-end gap-2 p-2 pl-4 transition-shadow ${
          isListening ? 'border-teal ring-2 ring-teal/20' : 'hover:border-line-strong'
        }`}>
          {/* Sparkle icon */}
          <svg className="flex-shrink-0 mb-[10px]" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#1A5F7A" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8" />
          </svg>

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={imageFile ? "Ask about the attached file…" : "Describe your symptom, a medicine, or a worry…"}
            aria-label="Medical question input"
            maxLength={1000}
            rows={1}
            disabled={isLoading}
            className="flex-1 resize-none bg-transparent text-[14px] text-ink placeholder:text-ink-5 focus:outline-none disabled:opacity-50 py-2"
            style={{ minHeight: '40px', maxHeight: '160px' }}
          />

          {/* Controls row */}
          <div className="flex items-center gap-1.5 flex-shrink-0 mb-1">
            {/* Language selector */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setLangOpen(o => !o)}
                onBlur={() => setTimeout(() => setLangOpen(false), 150)}
                aria-label="Select response language"
                className="pill text-[11px] hover:border-line-strong transition-colors"
              >
                {currentLang.short}
                <svg className={`w-2.5 h-2.5 transition-transform ${langOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {langOpen && (
                <div className="absolute bottom-full mb-2 right-0 bg-paper border border-line rounded-sm shadow-card-raised py-1 w-32 z-50 animate-slide-up">
                  {LANG_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onMouseDown={() => { onLanguageChange(opt.value); setLangOpen(false); }}
                      className={`w-full text-start px-3 py-2 text-[13px] transition-colors ${
                        opt.value === language
                          ? 'text-blue bg-blue-50 font-medium'
                          : 'text-ink-3 hover:text-ink hover:bg-paper-2'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Image attach */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,application/pdf"
              onChange={handleFileChange}
              className="hidden"
              aria-label="Attach image or document"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              aria-label="Attach image or document"
              title="Attach image or PDF (prescription, lab report, X-ray)"
              className={`w-9 h-9 rounded-sm flex items-center justify-center border transition-colors ${
                imageFile
                  ? 'bg-teal-50 text-teal border-teal/40'
                  : 'text-ink-4 border-line hover:text-ink hover:bg-paper-2'
              } disabled:opacity-40`}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
              </svg>
            </button>

            {/* Mic */}
            {voiceInputSupported && (
              <button
                type="button"
                onClick={isListening ? onStopListening : onStartListening}
                aria-label={isListening ? 'Stop listening' : 'Start voice input'}
                aria-pressed={isListening}
                className={`w-9 h-9 rounded-sm flex items-center justify-center border transition-colors ${
                  isListening
                    ? 'bg-teal-50 text-teal border-teal/40 animate-pulse'
                    : 'text-ink-4 border-line hover:text-ink hover:bg-paper-2'
                }`}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                  <path d="M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3ZM5 11a7 7 0 0 0 14 0M12 18v3M8 21h8" />
                </svg>
              </button>
            )}

            {/* Send */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canSubmit}
              aria-label="Submit question"
              className={`w-9 h-9 rounded-sm flex items-center justify-center transition-colors ${
                canSubmit
                  ? 'bg-blue text-white hover:bg-blue-700 active:scale-95'
                  : 'bg-paper-2 text-ink-5 border border-line cursor-not-allowed'
              }`}
            >
              {isLoading ? (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4Z" />
                </svg>
              ) : (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12 21 4l-4 17-5-7-7-2Z" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Character count */}
        <div className="mt-1 flex justify-end">
          <span className={`text-[10px] font-mono ${nearLimit ? 'text-amber' : 'text-ink-5'}`} aria-live="polite">
            {value.length}/1000
          </span>
        </div>
      </div>
    </div>
  );
}

export default InputBar;
