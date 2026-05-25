import { useState, useRef, useEffect } from 'react';
import type { SessionSummary } from '../types/index';
import { deriveSessionTitle } from '../types/index';

interface SessionItemProps {
  session: SessionSummary;
  isActive: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, title: string) => void;
  firstUserMessage?: string;
}

function getRelativeTime(iso: string): string {
  try {
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff / 60000);
    const h = Math.floor(m / 60);
    const d = Math.floor(h / 24);
    if (m < 1) return 'Just now';
    if (m < 60) return `${m}m ago`;
    if (h < 24) return `${h}h ago`;
    if (d === 1) return 'Yesterday';
    if (d < 7) return `${d}d ago`;
    return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  } catch { return ''; }
}

export function SessionItem({ session, isActive, onSelect, onDelete, onRename, firstUserMessage }: SessionItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (isEditing) inputRef.current?.select(); }, [isEditing]);

  function startEditing(e: React.MouseEvent) {
    e.stopPropagation();
    setDraft(deriveSessionTitle(session, firstUserMessage));
    setIsEditing(true);
  }

  function commitRename() {
    const t = draft.trim();
    if (t) onRename(session.id, t);
    setIsEditing(false);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') { e.preventDefault(); commitRename(); }
    if (e.key === 'Escape') { e.preventDefault(); setIsEditing(false); }
  }

  const title = deriveSessionTitle(session, firstUserMessage);

  if (isEditing) {
    return (
      <div className={`flex items-center gap-1 px-2 py-1.5 rounded-xs border ${
        isActive ? 'border-blue/20 bg-blue-50' : 'border-line bg-paper'
      }`}>
        <input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={commitRename}
          maxLength={80}
          className="flex-1 min-w-0 bg-transparent text-[12px] font-medium text-ink focus:outline-none"
          onClick={(e) => e.stopPropagation()}
        />
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); commitRename(); }}
          className="p-0.5 text-green hover:bg-green-50 rounded-xs transition-colors"
          aria-label="Confirm"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 13l4 4L19 7" /></svg>
        </button>
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); setIsEditing(false); }}
          className="p-0.5 text-ink-4 hover:text-danger rounded-xs transition-colors"
          aria-label="Cancel"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
        </button>
      </div>
    );
  }

  return (
    <div
      onClick={() => onSelect(session.id)}
      className={`group relative flex items-center gap-2 px-2.5 py-1.5 rounded-xs cursor-pointer transition-colors ${
        isActive ? 'text-ink bg-paper-2' : 'text-ink-3 hover:text-ink hover:bg-paper-2'
      }`}
    >
      <div className="flex-1 min-w-0 pr-10">
        <div className="text-[12.5px] truncate leading-snug">{title}</div>
        <div className="text-[10px] text-ink-5 mt-0.5">{getRelativeTime(session.updated_at)}</div>
      </div>

      {/* Hover actions */}
      <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          type="button"
          onClick={startEditing}
          className="p-1 rounded-xs text-ink-5 hover:text-ink-3 hover:bg-line transition-colors"
          aria-label="Rename"
          title="Rename"
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <path d="M11 5H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-5m-1.414-9.414a2 2 0 1 1 2.828 2.828L11.828 15H9v-2.828l8.586-8.586Z" />
          </svg>
        </button>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onDelete(session.id); }}
          className="p-1 rounded-xs text-ink-5 hover:text-danger hover:bg-amber-50 transition-colors"
          aria-label="Delete"
          title="Delete"
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <path d="M19 7l-.867 12.142A2 2 0 0 1 16.138 21H7.862a2 2 0 0 1-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
}
