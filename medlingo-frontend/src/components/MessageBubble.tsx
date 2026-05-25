import { useState } from 'react';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';
import type { Message } from '../types/index';
import { detectLanguage } from '../utils/queryUtils';
import { TEXT_DIRECTION } from '../types/index';

// ── Helpers ───────────────────────────────────────────────────────────────────

function relativeTime(ts: number) {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'Just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

// ── Markdown renderer ─────────────────────────────────────────────────────────

function DocMarkdown({ text, dir }: { text: string; dir: 'ltr' | 'rtl' }) {
  return (
    <div
      dir={dir}
      className={`text-[14px] leading-relaxed text-ink-2 ${dir === 'rtl' ? 'ur text-[16px] leading-[1.85]' : ''}`}
    >
      <ReactMarkdown
        components={{
          p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
          strong: ({ children }) => <strong className="font-semibold text-ink">{children}</strong>,
          em: ({ children }) => <em className="italic text-ink-3">{children}</em>,
          ul: ({ children }) => <ul className="mt-1 mb-3 pl-5 list-none space-y-2">{children}</ul>,
          ol: ({ children }) => <ol className="mt-1 mb-3 pl-5 list-decimal marker:text-ink-4 space-y-2">{children}</ol>,
          li: ({ children }) => (
            <li className="flex items-start gap-2.5 leading-relaxed [&>ul]:mt-1 [&>ol]:mt-1 list-none">
              <span className="flex-shrink-0 w-[18px] h-[18px] rounded-full bg-teal-50 text-teal-600 flex items-center justify-center mt-[2px]">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 13l4 4L19 7" /></svg>
              </span>
              <span className="flex-1">{children}</span>
            </li>
          ),
          h1: ({ children }) => (
            <h1 className="font-display text-[20px] font-semibold text-ink mt-6 mb-2.5 first:mt-0 tracking-tight">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="font-display text-[18px] font-semibold text-ink mt-5 mb-2 first:mt-0 tracking-tight">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="font-display text-[15px] font-medium text-ink-2 mt-4 mb-1.5 first:mt-0">{children}</h3>
          ),
          code: ({ children }) => (
            <code className="px-1.5 py-0.5 rounded-xs bg-paper-2 text-blue text-[12px] font-mono border border-line">{children}</code>
          ),
          hr: () => <hr className="my-4 border-line" />,
          blockquote: ({ children }) => (
            <blockquote className="my-3 pl-4 border-l-2 border-blue text-ink-3 italic">{children}</blockquote>
          ),
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface MessageBubbleProps {
  message: Message;
  voiceSynthSupported: boolean;
  isSpeakingThis: boolean;
  onSpeak: (text: string) => void;
  onStopSpeaking: () => void;
}

// ── User message ──────────────────────────────────────────────────────────────

function UserMessage({ message }: { message: Message }) {
  const lang = detectLanguage(message.text);
  const dir = TEXT_DIRECTION[lang];

  return (
    <div className="flex flex-col items-end gap-1 w-full animate-slide-up">
      <div className="kicker text-ink-5">You · {relativeTime(message.timestamp)}</div>
      <div
        dir={dir}
        className={`max-w-[72%] px-5 py-3.5 rounded-lg rounded-tr-xs bg-blue text-white shadow-card ${
          dir === 'rtl' ? 'ur text-[17px] leading-[1.75]' : 'text-[14px] leading-relaxed'
        }`}
      >
        <p className="whitespace-pre-wrap break-words">{message.text}</p>
      </div>
    </div>
  );
}

// ── Assistant message ─────────────────────────────────────────────────────────

function AssistantMessage({
  message,
  voiceSynthSupported,
  isSpeakingThis,
  onSpeak,
  onStopSpeaking,
}: MessageBubbleProps) {
  const [copied, setCopied] = useState(false);
  const lang = detectLanguage(message.text);
  const dir = TEXT_DIRECTION[lang];

  function handleCopy() {
    navigator.clipboard.writeText(message.text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('Copied to clipboard');
    });
  }

  return (
    <div className="w-full animate-slide-up">
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <div className="w-6 h-6 rounded-md bg-blue flex items-center justify-center flex-shrink-0">
          <svg width="13" height="13" viewBox="0 0 36 36" fill="none">
            <rect x="13" y="6" width="6.5" height="19" rx="2" fill="white" />
            <rect x="6" y="13" width="19" height="6.5" rx="2" fill="white" />
          </svg>
        </div>
        <div className="kicker text-ink-5">
          Medilingo · {relativeTime(message.timestamp)}
        </div>
      </div>

      {/* Response card */}
      <div className="bg-paper border border-line rounded-lg shadow-card overflow-hidden">
        <div className="px-5 py-5">
          <DocMarkdown text={message.text} dir={dir} />
        </div>

        {/* Action row */}
        <div className="flex items-center gap-2 px-5 py-3 border-t border-line-2 bg-paper-2">
          <button
            type="button"
            onClick={handleCopy}
            aria-label={copied ? 'Copied' : 'Copy response'}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xs text-[11px] font-medium transition-colors ${
              copied
                ? 'bg-green-50 text-green border border-green/20'
                : 'text-ink-4 hover:text-ink hover:bg-paper border border-transparent hover:border-line'
            }`}
          >
            {copied ? (
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 13l4 4L19 7" /></svg>
            ) : (
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M9 9h10a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V10a1 1 0 0 1 1-1ZM4 15V4a1 1 0 0 1 1-1h11" /></svg>
            )}
            {copied ? 'Copied' : 'Copy'}
          </button>

          {voiceSynthSupported && (
            <button
              type="button"
              onClick={() => isSpeakingThis ? onStopSpeaking() : onSpeak(message.text)}
              aria-label={isSpeakingThis ? 'Stop speaking' : 'Read aloud'}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xs text-[11px] font-medium transition-colors ${
                isSpeakingThis
                  ? 'bg-blue-50 text-blue border border-blue/20'
                  : 'text-ink-4 hover:text-ink hover:bg-paper border border-transparent hover:border-line'
              }`}
            >
              {isSpeakingThis ? (
                <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><rect x="5" y="5" width="14" height="14" rx="2" /></svg>
              ) : (
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M11 5 6 9H3v6h3l5 4V5ZM16 9a4 4 0 0 1 0 6" /></svg>
              )}
              {isSpeakingThis ? 'Stop' : 'Listen'}
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              const blob = new Blob([message.text], { type: 'text/plain;charset=utf-8' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url; a.download = `medilingo-${message.id.slice(0, 8)}.txt`; a.click();
              URL.revokeObjectURL(url);
              toast.success('Answer saved');
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xs text-[11px] font-medium text-ink-4 hover:text-ink hover:bg-paper border border-transparent hover:border-line transition-colors"
            aria-label="Download answer"
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M12 4v12m0 0 4-4m-4 4-4-4M5 19h14" /></svg>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Export ────────────────────────────────────────────────────────────────────

export function MessageBubble(props: MessageBubbleProps) {
  if (props.message.role === 'user') {
    return <UserMessage message={props.message} />;
  }
  return <AssistantMessage {...props} />;
}

export default MessageBubble;
