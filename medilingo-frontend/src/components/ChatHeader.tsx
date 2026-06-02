import { useState, useRef, useEffect } from 'react';
import type { Language } from '../types/index';
import { useThemeStore } from '../hooks/useThemeStore';

type LangOption = Language | 'auto';

const LANG_LABELS: Record<LangOption, string> = {
  auto:         'Auto',
  English:      'EN',
  Urdu:         'اردو',
  'Roman Urdu': 'RU',
};

interface ChatHeaderProps {
  sessionTitle: string;
  onMenuToggle: () => void;
  onRenameSession?: (newTitle: string) => void;
  language: LangOption;
  onExport?: () => void;
  onShare?: () => void;
}

function Btn({ onClick, label, title, children }: {
  onClick: () => void;
  label: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={title}
      className="flex items-center justify-center w-8 h-8 rounded-sm text-ink-4 hover:text-ink hover:bg-paper-2 transition-colors"
    >
      {children}
    </button>
  );
}

export function ChatHeader({
  sessionTitle,
  onMenuToggle,
  onRenameSession,
  language,
  onExport,
  onShare,
}: ChatHeaderProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(sessionTitle);
  const { dark, toggle: toggleTheme, zoom, zoomIn, zoomOut } = useThemeStore();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setDraft(sessionTitle); setIsEditing(false); }, [sessionTitle]);
  useEffect(() => { if (isEditing) inputRef.current?.select(); }, [isEditing]);

  function startEditing() {
    if (!onRenameSession) return;
    setDraft(sessionTitle);
    setIsEditing(true);
  }

  function commitRename() {
    const t = draft.trim();
    if (t && t !== sessionTitle && onRenameSession) onRenameSession(t);
    setIsEditing(false);
  }

  function cancelRename() { setDraft(sessionTitle); setIsEditing(false); }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') { e.preventDefault(); commitRename(); }
    if (e.key === 'Escape') { e.preventDefault(); cancelRename(); }
  }

  return (
    <header className="flex items-center gap-3 px-4 py-3.5 bg-bg border-b border-line flex-shrink-0 z-30">
      {/* Mobile hamburger */}
      <button
        type="button"
        onClick={onMenuToggle}
        className="md:hidden flex-shrink-0 p-1.5 rounded-sm text-ink-4 hover:text-ink hover:bg-paper-2 transition-colors"
        aria-label="Toggle sidebar"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
          <path d="M4 6h16M4 12h10M4 18h16" />
        </svg>
      </button>

      {/* Session title */}
      <div className="flex-1 min-w-0">
        {isEditing ? (
          <div className="flex items-center gap-1.5">
            <input
              ref={inputRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={commitRename}
              maxLength={80}
              className="flex-1 min-w-0 bg-paper border border-line-strong rounded-sm px-2.5 py-1 text-[13px] font-medium text-ink focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
              aria-label="Rename conversation"
            />
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); commitRename(); }}
              className="p-1 rounded-xs text-green hover:bg-green-50 transition-colors"
              aria-label="Confirm rename"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 13l4 4L19 7" /></svg>
            </button>
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); cancelRename(); }}
              className="p-1 rounded-xs text-ink-4 hover:text-danger transition-colors"
              aria-label="Cancel rename"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
            </button>
          </div>
        ) : (
          <div className="group flex items-center gap-1.5 min-w-0">
            <h1 className="text-[14px] font-medium text-ink truncate">{sessionTitle}</h1>
            {onRenameSession && (
              <button
                type="button"
                onClick={startEditing}
                className="opacity-0 group-hover:opacity-100 focus:opacity-100 flex-shrink-0 p-1 rounded-xs text-ink-5 hover:text-ink-3 transition-all"
                aria-label="Rename conversation"
                title="Rename"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <path d="M11 5H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-5m-1.414-9.414a2 2 0 1 1 2.828 2.828L11.828 15H9v-2.828l8.586-8.586Z" />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-0.5 flex-shrink-0">
        {/* Language badge */}
        <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-xs bg-paper border border-line text-[11px] font-mono text-ink-4 mr-1">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18ZM3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" /></svg>
          {LANG_LABELS[language]}
        </div>

        {/* Zoom controls */}
        <div className="hidden sm:flex items-center gap-0.5 mr-1">
          <button
            type="button"
            onClick={zoomOut}
            disabled={zoom <= 80}
            aria-label="Zoom out"
            title="Zoom out (−)"
            className="flex items-center justify-center w-7 h-7 rounded-sm text-ink-4 hover:text-ink hover:bg-paper-2 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35M8 11h6"/>
            </svg>
          </button>
          <span className="w-9 text-center text-[10px] font-mono text-ink-4 select-none tabular-nums">{zoom}%</span>
          <button
            type="button"
            onClick={zoomIn}
            disabled={zoom >= 120}
            aria-label="Zoom in"
            title="Zoom in (+)"
            className="flex items-center justify-center w-7 h-7 rounded-sm text-ink-4 hover:text-ink hover:bg-paper-2 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35M11 8v6M8 11h6"/>
            </svg>
          </button>
        </div>

        {/* Theme toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
          title={dark ? 'Light mode' : 'Dark mode'}
          className="flex items-center justify-center w-8 h-8 rounded-sm text-ink-4 hover:text-ink hover:bg-paper-2 transition-colors"
        >
          {dark ? (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
              <circle cx="12" cy="12" r="5" />
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
            </svg>
          ) : (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
        </button>

        {onShare && (
          <Btn onClick={onShare} label="Share chat" title="Share — open in new tab (printable)">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13"/>
            </svg>
          </Btn>
        )}

        {onExport && (
          <Btn onClick={onExport} label="Save chat as HTML" title="Save as HTML file">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M12 4v12m0 0 4-4m-4 4-4-4M5 19h14" /></svg>
          </Btn>
        )}

      </div>
    </header>
  );
}
