import { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import type { Message, AppError, RetrievedDoc } from '../types/index';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';

// ── Suggested questions ───────────────────────────────────────────────────────

const SUGGESTED: { text: string; isUrdu?: boolean }[] = [
  { text: 'What are the symptoms of diabetes?' },
  { text: 'بخار اور سردرد کی وجوہات کیا ہیں؟', isUrdu: true },
  { text: 'High blood pressure ki alamaat kya hain?' },
  { text: 'What is the treatment for hypertension?' },
  { text: 'بچوں میں نمونیا کی علامات کیا ہیں؟', isUrdu: true },
  { text: 'Dengue fever ke symptoms kya hain?' },
];

// ── Animated medical icon for welcome ────────────────────────────────────────

function MedicalWelcomeIcon() {
  return (
    <div className="relative flex items-center justify-center" style={{ width: 80, height: 80 }}>
      {/* Outer glow ring */}
      <div className="absolute inset-0 rounded-2xl bg-blue/10 animate-heartbeat" />
      {/* Pulse ring */}
      <div className="absolute inset-0 rounded-2xl animate-glow-pulse" />
      {/* Card */}
      <div className="relative w-16 h-16 rounded-2xl bg-blue flex items-center justify-center shadow-card-raised">
        <svg width="32" height="32" viewBox="0 0 36 36" fill="none">
          <rect x="12" y="5" width="7" height="20" rx="2.5" fill="white" />
          <rect x="5.5" y="12" width="20" height="7" rx="2.5" fill="white" />
          <circle cx="27" cy="27" r="5.5" fill="#06A77D" />
          <path d="M24 27 L25.5 27 L26.2 24.8 L27 29.2 L27.8 27 L29.2 27"
            stroke="white" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
      </div>
      {/* Orbiting dot 1 */}
      <div className="absolute top-0 right-0 w-3 h-3 -mt-1 -mr-1 rounded-full bg-teal border-2 border-white animate-float" />
      {/* Orbiting dot 2 */}
      <div className="absolute bottom-0 left-0 w-2.5 h-2.5 -mb-1 -ml-1 rounded-full bg-green border-2 border-white animate-float-delay" />
    </div>
  );
}

// ── Welcome screen ────────────────────────────────────────────────────────────

function WelcomeScreen({ onSelect }: { onSelect: (q: string) => void }) {
  const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div className="flex flex-col items-center justify-center h-full text-center max-w-xl mx-auto px-4 py-10 animate-fade-in">

      {/* Animated 3D medical icon */}
      <div className="mb-6">
        <MedicalWelcomeIcon />
      </div>

      <div className="kicker mb-3">{today}</div>

      <h2 className="font-display text-[28px] font-medium leading-tight tracking-tight text-ink mb-2">
        What's on your mind?
      </h2>
      <p className="text-[14px] text-ink-3 leading-relaxed mb-2 max-w-sm">
        Ask a medical question in{' '}
        <span className="font-medium text-blue">English</span>,{' '}
        <span className="font-urdu text-teal-600">اردو</span>, or{' '}
        <span className="font-medium text-green">Roman Urdu</span>.
      </p>
      <p className="text-[12px] text-ink-5 mb-8">Language detected automatically · No login needed</p>

      {/* Suggested questions */}
      <div className="w-full">
        <div className="kicker mb-3">Try asking</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {SUGGESTED.map((q, i) => (
            <button
              key={q.text}
              type="button"
              onClick={() => onSelect(q.text)}
              className={`group text-start px-3.5 py-3 rounded-xs bg-paper border border-line
                hover:border-blue/40 hover:shadow-card hover:bg-blue-50/30
                transition-all duration-200 text-[13px] text-ink-3 hover:text-ink
                animate-fade-up ${q.isUrdu ? 'ur text-right text-[15px] leading-[1.7]' : ''}`}
              style={{ animationDelay: `${i * 60}ms`, animationFillMode: 'both' }}
            >
              <span className="group-hover:translate-x-0.5 inline-block transition-transform duration-150">
                {q.text}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8 flex items-center gap-2 text-[11px] text-ink-5">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
          <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10ZM12 8v4M12 16h.01" />
        </svg>
        Information only — always consult a qualified doctor for medical advice.
      </div>
    </div>
  );
}

// ── Error banner ──────────────────────────────────────────────────────────────

function ErrorBanner({ error, onRetry }: { error: AppError; onRetry: () => void }) {
  return (
    <div className="flex justify-start w-full" role="alert" aria-live="assertive">
      <div className="max-w-[75%] rounded-lg bg-amber-50 border border-amber/25 px-4 py-3 shadow-card animate-slide-up flex flex-col gap-2">
        <p className="text-[13px] text-amber font-medium">⚠ {error.message}</p>
        {error.retryable && (
          <button
            type="button"
            onClick={onRetry}
            className="w-fit text-[12px] font-medium text-blue hover:underline"
          >
            Retry last query
          </button>
        )}
      </div>
    </div>
  );
}

// ── Streaming bubble ──────────────────────────────────────────────────────────

function StreamingBubble({ text }: { text: string }) {
  return (
    <div className="flex gap-3 justify-start w-full">
      <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-blue flex items-center justify-center mt-0.5">
        <svg width="16" height="16" viewBox="0 0 36 36" fill="none">
          <rect x="13" y="6" width="6.5" height="19" rx="2" fill="white" />
          <rect x="6" y="13" width="19" height="6.5" rx="2" fill="white" />
        </svg>
      </div>

      <div className="flex-1 max-w-[78%] min-w-0">
        <div className="kicker mb-1.5 text-ink-5">Medilingo</div>
        <div className="card shadow-card px-4 py-3.5 rounded-lg rounded-tl-xs animate-fade-in">
          {text.trim() ? (
            <div className="prose-medical text-[14px] leading-relaxed text-ink-2">
              <ReactMarkdown
                components={{
                  p: ({ children }) => <p>{children}</p>,
                  strong: ({ children }) => <strong>{children}</strong>,
                  ul: ({ children }) => <ul>{children}</ul>,
                  ol: ({ children }) => <ol>{children}</ol>,
                  li: ({ children }) => <li>{children}</li>,
                }}
              >{text}</ReactMarkdown>
              <span className="inline-block w-0.5 h-3.5 bg-teal animate-pulse ml-0.5 align-middle" />
            </div>
          ) : (
            <TypingIndicator />
          )}
        </div>
      </div>
    </div>
  );
}

// ── MessageList ───────────────────────────────────────────────────────────────

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  lastError: AppError | null;
  voiceSynthSupported: boolean;
  speakingMessageId: string | null;
  onSpeak: (messageId: string, text: string) => void;
  onStopSpeaking: () => void;
  onRetry: () => void;
  onSuggestedQuestion?: (q: string) => void;
  streamingState?: { text: string; docs: RetrievedDoc[] } | null;
}

export function MessageList({
  messages,
  isLoading,
  lastError,
  voiceSynthSupported,
  speakingMessageId,
  onSpeak,
  onStopSpeaking,
  onRetry,
  onSuggestedQuestion,
  streamingState,
}: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, lastError, streamingState?.text]);

  const showWelcome = messages.length === 0 && !isLoading && !streamingState;

  return (
    <div
      className="flex-1 overflow-y-auto bg-bg scroll-smooth"
      aria-label="Message history"
      role="log"
      aria-live="polite"
      style={{ scrollBehavior: 'smooth' }}
    >
      {showWelcome ? (
        <WelcomeScreen onSelect={onSuggestedQuestion ?? (() => {})} />
      ) : (
        <div className="max-w-[760px] mx-auto px-4 sm:px-8 py-8 flex flex-col gap-6">
          {messages.map((message, i) => (
            <div
              key={message.id}
              className="animate-fade-up"
              style={{ animationDelay: `${Math.min(i * 30, 150)}ms`, animationFillMode: 'both' }}
            >
              <MessageBubble
                message={message}
                voiceSynthSupported={voiceSynthSupported}
                isSpeakingThis={speakingMessageId === message.id}
                onSpeak={(text) => onSpeak(message.id, text)}
                onStopSpeaking={onStopSpeaking}
              />
            </div>
          ))}

          {streamingState && <StreamingBubble text={streamingState.text} />}

          {isLoading && !streamingState && (
            <div className="flex justify-start w-full animate-fade-in">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-blue flex items-center justify-center">
                  <svg width="15" height="15" viewBox="0 0 36 36" fill="none">
                    <rect x="13" y="6" width="6.5" height="19" rx="2" fill="white" />
                    <rect x="6" y="13" width="19" height="6.5" rx="2" fill="white" />
                  </svg>
                </div>
                <TypingIndicator />
              </div>
            </div>
          )}

          {lastError && !isLoading && !streamingState && (
            <ErrorBanner error={lastError} onRetry={onRetry} />
          )}

          <div ref={bottomRef} aria-hidden="true" />
        </div>
      )}
    </div>
  );
}

export default MessageList;
