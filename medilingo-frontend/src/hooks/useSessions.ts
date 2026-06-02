import { useState, useEffect, useCallback, useRef } from 'react';
import type { SessionSummary, ChatMessage, RetrievedDoc } from '../types/index';
import * as sessionService from '../services/sessionService';
import { useAuthStore } from './useAuthStore';

function uuid(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

export interface UseSessionsReturn {
  sessions: SessionSummary[];
  activeSessionId: string | null;
  messages: ChatMessage[];
  isLoadingSessions: boolean;
  isLoadingMessages: boolean;
  sessionsError: string | null;
  messagesError: string | null;
  createSession: (title?: string) => Promise<SessionSummary>;
  deleteSession: (id: string) => Promise<void>;
  renameSession: (id: string, title: string) => Promise<void>;
  setActiveSession: (id: string) => Promise<void>;
  postMessage: (role: 'user' | 'assistant', content: string, sources?: RetrievedDoc[]) => Promise<void>;
  retryLoadSessions: () => void;
  retryLoadMessages: () => void;
}

function deriveAutoTitle(firstUserMessage: string): string {
  const cleaned = firstUserMessage.trim();
  if (!cleaned) return 'New Consultation';
  if (cleaned.length <= 45) return cleaned;
  const truncated = cleaned.slice(0, 45);
  const lastSpace = truncated.lastIndexOf(' ');
  return (lastSpace > 20 ? truncated.slice(0, lastSpace) : truncated) + 'â€¦';
}

function makeGuestSession(id: string, title?: string): SessionSummary {
  const now = new Date().toISOString();
  return { id, title: title ?? null, created_at: now, updated_at: now };
}

export function useSessions(): UseSessionsReturn {
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messagesBySession, setMessagesBySession] = useState<Record<string, ChatMessage[]>>({});
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [sessionsError, setSessionsError] = useState<string | null>(null);
  const [messagesError, setMessagesError] = useState<string | null>(null);

  const accessToken = useAuthStore((state) => state.accessToken);

  // Track whether we've already initialised for the current token value
  const initialisedForToken = useRef<string | null | undefined>(undefined);
  // Track whether a guest session has been created (prevents duplicates)
  const guestSessionCreated = useRef(false);

  // Convenience: messages for the active session
  const messages: ChatMessage[] = activeSessionId
    ? (messagesBySession[activeSessionId] ?? [])
    : [];

  // â”€â”€ Load sessions (runs once per token change) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const loadSessions = useCallback(async () => {
    if (!accessToken) {
      // Guest mode â€” create exactly one local session if none exists yet
      if (!guestSessionCreated.current) {
        guestSessionCreated.current = true;
        const guestId = uuid();
        const guest = makeGuestSession(guestId);
        setSessions([guest]);
        setActiveSessionId(guestId);
      }
      return;
    }

    // Authenticated â€” fetch from backend
    setIsLoadingSessions(true);
    setSessionsError(null);
    try {
      const data = await sessionService.getSessions();
      setSessions(data);
      // Auto-select the most recent session if none is active
      if (data.length > 0) {
        setActiveSessionId((prev) => prev ?? data[0].id);
      }
    } catch (err) {
      setSessionsError(err instanceof Error ? err.message : 'Failed to load sessions');
    } finally {
      setIsLoadingSessions(false);
    }
  }, [accessToken]); // â† NO sessions.length here â€” that was the bug

  // Run only when the token value actually changes
  useEffect(() => {
    if (initialisedForToken.current === accessToken) return;
    initialisedForToken.current = accessToken;

    // When logging in, clear guest state
    if (accessToken) {
      guestSessionCreated.current = false;
      setSessions([]);
      setActiveSessionId(null);
      setMessagesBySession({});
    }

    loadSessions();
  }, [accessToken, loadSessions]);

  // â”€â”€ Load messages when active session changes (authenticated only) â”€â”€â”€â”€â”€â”€â”€â”€â”€
  useEffect(() => {
    if (!accessToken || !activeSessionId) return;

    // Use a ref-based check to avoid stale closure issues
    let cancelled = false;

    async function fetchMessages() {
      setIsLoadingMessages(true);
      setMessagesError(null);
      try {
        const msgs = await sessionService.getMessages(activeSessionId!);
        if (!cancelled) {
          setMessagesBySession((prev) => {
            // Don't overwrite if we already have messages (e.g. optimistic)
            if (prev[activeSessionId!]?.length) return prev;
            return { ...prev, [activeSessionId!]: msgs };
          });
        }
      } catch (err) {
        if (!cancelled) {
          setMessagesError(err instanceof Error ? err.message : 'Failed to load messages');
        }
      } finally {
        if (!cancelled) setIsLoadingMessages(false);
      }
    }

    fetchMessages();
    return () => { cancelled = true; };
  }, [accessToken, activeSessionId]); // â† clean deps, no messagesBySession

  // â”€â”€ Create session â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const createSessionFn = useCallback(async (title?: string): Promise<SessionSummary> => {
    if (!accessToken) {
      const id = uuid();
      const guest = makeGuestSession(id, title);
      setSessions((prev) => [guest, ...prev]);
      setActiveSessionId(id);
      return guest;
    }
    const newSession = await sessionService.createSession(title);
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    return newSession;
  }, [accessToken]);

  // â”€â”€ Rename session â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const renameSessionFn = useCallback(async (id: string, title: string): Promise<void> => {
    // Update locally immediately for instant feedback
    setSessions((prev) => prev.map((s) => (s.id === id ? { ...s, title } : s)));
    if (!accessToken) return;
    try {
      const updated = await sessionService.renameSession(id, title);
      setSessions((prev) => prev.map((s) => (s.id === id ? updated : s)));
    } catch {
      // Non-critical â€” local title already updated
    }
  }, [accessToken]);

  // â”€â”€ Delete session â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const deleteSessionFn = useCallback(async (id: string): Promise<void> => {
    // Remove locally first
    setSessions((prev) => {
      const remaining = prev.filter((s) => s.id !== id);
      if (activeSessionId === id) {
        setActiveSessionId(remaining[0]?.id ?? null);
      }
      return remaining;
    });
    setMessagesBySession((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });

    if (!accessToken) return;
    await sessionService.deleteSession(id);
  }, [accessToken, activeSessionId]);

  // â”€â”€ Set active session â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const setActiveSessionFn = useCallback(async (id: string): Promise<void> => {
    setActiveSessionId(id);
    // Message loading is handled by the useEffect above
  }, []); // â† no deps needed â€” just sets state

  // â”€â”€ Post message â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const postMessageFn = useCallback(async (
    role: 'user' | 'assistant',
    content: string,
    sources?: RetrievedDoc[],
  ): Promise<void> => {
    if (!activeSessionId) return;

    const optimisticId = uuid();
    const optimistic: ChatMessage = {
      id: optimisticId,
      session_id: activeSessionId,
      role,
      content,
      sources: sources ?? null,
      created_at: new Date().toISOString(),
    };

    // Show optimistically immediately
    setMessagesBySession((prev) => ({
      ...prev,
      [activeSessionId]: [...(prev[activeSessionId] ?? []), optimistic],
    }));

    // Auto-name from first user message
    if (role === 'user') {
      setSessions((prev) => {
        const session = prev.find((s) => s.id === activeSessionId);
        if (!session || session.title) return prev; // already named
        const existingMessages = messagesBySession[activeSessionId] ?? [];
        if (existingMessages.some((m) => m.role === 'user')) return prev; // not first
        const autoTitle = deriveAutoTitle(content);
        if (accessToken) {
          sessionService.renameSession(activeSessionId, autoTitle).catch(() => {});
        }
        return prev.map((s) => (s.id === activeSessionId ? { ...s, title: autoTitle } : s));
      });
    }

    if (!accessToken) return; // guest: keep optimistic only

    try {
      const saved = await sessionService.postMessage(activeSessionId, role, content, sources);
      setMessagesBySession((prev) => ({
        ...prev,
        [activeSessionId]: (prev[activeSessionId] ?? []).map((m) =>
          m.id === optimisticId ? saved : m,
        ),
      }));
      setSessions((prev) =>
        prev
          .map((s) => (s.id === activeSessionId ? { ...s, updated_at: saved.created_at } : s))
          .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()),
      );
    } catch {
      // Keep optimistic; useChat surfaces the error
    }
  }, [accessToken, activeSessionId, messagesBySession]);

  // â”€â”€ Retry helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const retryLoadSessions = useCallback(() => {
    initialisedForToken.current = undefined; // force re-init
    loadSessions();
  }, [loadSessions]);

  const retryLoadMessages = useCallback(() => {
    if (!activeSessionId) return;
    // Clear cache to force re-fetch
    setMessagesBySession((prev) => {
      const next = { ...prev };
      delete next[activeSessionId];
      return next;
    });
  }, [activeSessionId]);

  return {
    sessions,
    activeSessionId,
    messages,
    isLoadingSessions,
    isLoadingMessages,
    sessionsError,
    messagesError,
    createSession: createSessionFn,
    deleteSession: deleteSessionFn,
    renameSession: renameSessionFn,
    setActiveSession: setActiveSessionFn,
    postMessage: postMessageFn,
    retryLoadSessions,
    retryLoadMessages,
  };
}

