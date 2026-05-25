import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useAuthStore } from '../hooks/useAuthStore';
import type { SessionSummary } from '../types/index';
import { SessionItem } from './SessionItem';

// ── Icons ─────────────────────────────────────────────────────────────────────

function MedilingoMark() {
  return (
    <svg width="20" height="20" viewBox="0 0 36 36" fill="none" style={{ display: 'block', flexShrink: 0 }}>
      <rect width="36" height="36" rx="9" fill="#1A5F7A" />
      <rect x="14.5" y="8" width="7" height="20" rx="2.5" fill="white" />
      <rect x="8" y="14.5" width="20" height="7" rx="2.5" fill="white" />
      <circle cx="27" cy="27" r="5.5" fill="#06A77D" />
      <path d="M24 27 L25.5 27 L26.2 24.8 L27 29.2 L27.8 27 L29.2 27"
        stroke="white" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

function Icon({ d }: { d: string }) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block', flexShrink: 0 }}>
      <path d={d} />
    </svg>
  );
}

const ICONS = {
  plus:     'M12 5v14M5 12h14',
  history:  'M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5M12 7v5l3 2',
  settings: 'M12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8ZM19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1A2 2 0 1 1 4.4 17l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1A2 2 0 1 1 7 4.4l.1.1a1.7 1.7 0 0 0 1.8.3h.1a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8v.1a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z',
  logout:   'M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1',
  login:    'M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1',
  close:    'M18 6L6 18M6 6l12 12',
};

// ── Props ─────────────────────────────────────────────────────────────────────

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: SessionSummary[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onDeleteSession: (id: string) => void;
  onRenameSession: (id: string, title: string) => void;
  onCreateSession: () => void;
  isLoadingSessions: boolean;
  sessionsError: string | null;
  onRetryLoadSessions: () => void;
}

// ── Content ───────────────────────────────────────────────────────────────────

function SidebarContent({
  sessions,
  activeSessionId,
  onSelectSession,
  onDeleteSession,
  onRenameSession,
  onCreateSession,
  onClose,
  isLoadingSessions,
  sessionsError,
  onRetryLoadSessions,
}: Omit<SidebarProps, 'isOpen'>) {
  const { logout } = useAuth();
  const accessToken = useAuthStore((s) => s.accessToken);
  const isAuthenticated = accessToken !== null;

  return (
    <div className="flex flex-col h-full bg-bg border-r border-line w-56" style={{ userSelect: 'none' }}>

      {/* Logo + close (mobile only) */}
      <div className="flex items-center justify-between px-4 py-[22px]">
        <Link to="/" className="flex items-center gap-2 px-2">
          <MedilingoMark />
          <span className="font-display font-semibold text-[16px] tracking-tight text-ink leading-none">
            Medilingo
          </span>
        </Link>
        <button
          type="button"
          onClick={onClose}
          className="md:hidden p-1.5 rounded-sm text-ink-4 hover:text-ink hover:bg-paper-2 transition-colors"
          aria-label="Close sidebar"
        >
          <Icon d={ICONS.close} />
        </button>
      </div>

      {/* New chat button */}
      <div className="px-4 pb-3">
        <button
          type="button"
          onClick={() => { onCreateSession(); onClose(); }}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-sm bg-blue text-white text-[13px] font-medium hover:bg-blue-700 transition-colors"
        >
          <Icon d={ICONS.plus} />
          New consultation
        </button>
      </div>

      {/* Recent label */}
      <div className="px-6 pb-2">
        <span className="kicker">Recent</span>
      </div>

      {/* Session list */}
      <div className="flex-1 overflow-y-auto px-3 pb-2">
        {isLoadingSessions ? (
          <div className="flex flex-col gap-1.5 px-1 py-1">
            {[100, 90, 75].map((w) => (
              <div key={w} className="h-7 rounded-sm bg-line animate-pulse" style={{ width: `${w}%` }} />
            ))}
          </div>
        ) : sessionsError ? (
          <div className="mx-1 px-3 py-3 rounded-sm bg-amber-50 border border-amber/20 text-center">
            <p className="text-[12px] text-amber mb-2">{sessionsError}</p>
            <button
              type="button"
              onClick={onRetryLoadSessions}
              className="text-[11px] font-medium text-blue hover:underline"
            >
              Retry
            </button>
          </div>
        ) : sessions.length === 0 ? (
          <p className="px-3 py-2 text-[12px] text-ink-5 italic">
            {isAuthenticated ? 'No recent consultations' : 'Sign in to save history'}
          </p>
        ) : (
          <div className="flex flex-col gap-0.5">
            {sessions.map((s) => (
              <SessionItem
                key={s.id}
                session={s}
                isActive={activeSessionId === s.id}
                onSelect={(id) => { onSelectSession(id); onClose(); }}
                onDelete={onDeleteSession}
                onRename={onRenameSession}
              />
            ))}
          </div>
        )}
      </div>

      {/* Tools section */}
      <div className="border-t border-line px-3 pt-3 pb-1">
        <span className="kicker px-3 mb-1 block">Tools</span>
        <Link to="/symptoms" className="nav-item">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3"/><path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/><circle cx="20" cy="10" r="2"/></svg>
          Symptom Checker
        </Link>
        <Link to="/drugs" className="nav-item">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18"/></svg>
          Drug Interactions
        </Link>
      </div>

      {/* Footer nav */}
      <div className="border-t border-line px-3 py-3 flex flex-col gap-0.5">
        {isAuthenticated ? (
          <>
            <Link to="/profile" className="nav-item">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM12 14a7 7 0 0 0-7 7h14a7 7 0 0 0-7-7Z" />
              </svg>
              My profile
            </Link>
            <button type="button" onClick={() => logout()} className="nav-item hover:text-danger">
              <Icon d={ICONS.logout} />
              Sign out
            </button>
          </>
        ) : (
          <Link to="/login" className="nav-item">
            <Icon d={ICONS.login} />
            Sign in to save history
          </Link>
        )}
      </div>
    </div>
  );
}

// ── Export ────────────────────────────────────────────────────────────────────

export function Sidebar(props: SidebarProps) {
  const { isOpen, onClose, ...rest } = props;

  return (
    <>
      {/* Desktop — always visible */}
      <aside className="hidden md:block flex-shrink-0 h-full">
        <SidebarContent onClose={onClose} {...rest} />
      </aside>

      {/* Mobile drawer */}
      <div
        className={`fixed inset-0 z-50 md:hidden transition-opacity duration-200 ${
          isOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
      >
        <div onClick={onClose} className="absolute inset-0 bg-ink/40" />
        <div
          className={`absolute inset-y-0 left-0 h-full shadow-browser transition-transform duration-200 ease-out ${
            isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <SidebarContent onClose={onClose} {...rest} />
        </div>
      </div>
    </>
  );
}
