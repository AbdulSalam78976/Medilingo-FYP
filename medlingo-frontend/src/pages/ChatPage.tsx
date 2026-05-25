import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import type { Message, ChatMessage, RetrievedDoc } from '../types/index';

import { useChat } from '../hooks/useChat';
import { useQueryConfig } from '../hooks/useQueryConfig';
import { useSessions } from '../hooks/useSessions';
import { useVoiceSettingsStore } from '../hooks/useVoiceSettingsStore';
import { useVoiceInput } from '../hooks/useVoiceInput';
import { useVoiceOutput } from '../hooks/useVoiceOutput';
import { useAuthStore } from '../hooks/useAuthStore';
import { deriveSessionTitle } from '../types/index';

import { Sidebar } from '../components/Sidebar';
import { ChatHeader } from '../components/ChatHeader';
import { MessageList } from '../components/MessageList';
import { InputBar } from '../components/InputBar';

export function ChatPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);

  const [streamingState, setStreamingState] = useState<{
    text: string;
    docs: RetrievedDoc[];
  } | null>(null);

  const prevSessionIdRef = useRef<string | null>(null);

  const accessToken = useAuthStore((s) => s.accessToken);
  const isGuest = !accessToken;

  // ── Hooks ───────────────────────────────────────────────────────────────────
  const {
    sessions,
    activeSessionId,
    messages: chatMessages,
    isLoadingSessions,
    sessionsError,
    createSession,
    deleteSession,
    renameSession,
    setActiveSession,
    postMessage,
    retryLoadSessions,
  } = useSessions();

  const { isLoading: isQuerying, lastError: queryError, submitQueryStream, submitImageQuery, retryLast, clearError } = useChat();
  const { config, setConfig } = useQueryConfig();
  const autoPlay = useVoiceSettingsStore(s => s.autoPlay);

  const { isSupported: voiceInputSupported, isListening, transcript, startListening, stopListening } = useVoiceInput();
  const { isSupported: voiceSynthSupported, isSpeaking, speak, stop: stopSpeaking } = useVoiceOutput();

  // ── Effects ─────────────────────────────────────────────────────────────────
  useEffect(() => { if (transcript) setInputValue(transcript); }, [transcript]);

  useEffect(() => {
    if (prevSessionIdRef.current !== null && prevSessionIdRef.current !== activeSessionId) {
      setInputValue('');
      stopSpeaking();
      setSpeakingMessageId(null);
      setStreamingState(null);
      clearError();
    }
    prevSessionIdRef.current = activeSessionId;
  }, [activeSessionId, stopSpeaking, clearError]);

  useEffect(() => { if (!isSpeaking) setSpeakingMessageId(null); }, [isSpeaking]);

  // ── Derived data ─────────────────────────────────────────────────────────────
  const mappedMessages: Message[] = chatMessages.map((msg: ChatMessage) => ({
    id: msg.id,
    role: msg.role,
    text: msg.content,
    sources: msg.sources ?? [],
    timestamp: new Date(msg.created_at).getTime(),
  }));

  const conversationHistory = mappedMessages.slice(-8).map(m => ({ role: m.role, content: m.text }));

  const activeSession = sessions.find(s => s.id === activeSessionId);
  const sessionTitle = activeSession
    ? deriveSessionTitle(activeSession, chatMessages.find(m => m.role === 'user')?.content)
    : 'New consultation';

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handleSelectSession = useCallback(async (id: string) => {
    clearError();
    await setActiveSession(id);
  }, [setActiveSession, clearError]);

  const handleCreateSession = useCallback(async () => {
    clearError();
    await createSession();
  }, [createSession, clearError]);

  const handleDeleteSession = useCallback(async (id: string) => {
    await deleteSession(id);
    toast.success('Conversation deleted');
  }, [deleteSession]);

  const handleRenameSession = useCallback(async (id: string, title: string) => {
    await renameSession(id, title);
    toast.success('Renamed');
  }, [renameSession]);

  const handleSubmit = useCallback(async (text: string, imageFile?: File) => {
    const hasText = !!text.trim();
    const hasImage = !!imageFile;
    if (!hasText && !hasImage) return;

    if (!activeSessionId && !isGuest) {
      await createSession();
      if (hasText) setInputValue(text);
      return;
    }

    setInputValue('');

    // ── Image analysis path ────────────────────────────────────────────────────
    if (hasImage) {
      const question = hasText ? text : 'Analyze this medical document.';
      if (!isGuest) await postMessage('user', question);
      setStreamingState({ text: '', docs: [] });
      try {
        const result = await submitImageQuery(imageFile, question, config.language);
        setStreamingState(null);
        if (!isGuest && result.response) await postMessage('assistant', result.response, []);
        if (autoPlay && result.response) speak(result.response);
      } catch {
        setStreamingState(null);
        toast.error('Image analysis failed. Make sure Gemini provider is configured.');
      }
      return;
    }

    // ── Text query path ────────────────────────────────────────────────────────
    setStreamingState({ text: '', docs: [] });
    if (!isGuest) await postMessage('user', text);

    try {
      let finalText = '';
      let finalDocs: RetrievedDoc[] = [];

      await submitQueryStream(
        text,
        config,
        (docs) => {
          finalDocs = docs;
          setStreamingState(prev => prev ? { ...prev, docs } : null);
        },
        (token) => {
          finalText += token;
          setStreamingState(prev => prev ? { ...prev, text: prev.text + token } : null);
        },
        conversationHistory,
      );

      setStreamingState(null);
      if (!isGuest && finalText) await postMessage('assistant', finalText, finalDocs);
      if (autoPlay && finalText) speak(finalText);
    } catch {
      setStreamingState(null);
      toast.error('Something went wrong. Please try again.');
    }
  }, [activeSessionId, isGuest, autoPlay, config, conversationHistory, createSession, postMessage, submitQueryStream, submitImageQuery, speak]);

  const handleRetry = useCallback(async () => {
    try {
      const res = await retryLast();
      if (res && activeSessionId && !isGuest) {
        await postMessage('assistant', res.response, res.retrieved_docs);
      }
    } catch {
      toast.error('Retry failed. Please try again.');
    }
  }, [retryLast, postMessage, activeSessionId, isGuest]);

  const handleSpeak = useCallback((messageId: string, text: string) => {
    setSpeakingMessageId(messageId);
    speak(text);
  }, [speak]);

  const handleStopSpeaking = useCallback(() => { stopSpeaking(); setSpeakingMessageId(null); }, [stopSpeaking]);

  const handleSuggestedQuestion = useCallback((q: string) => { setInputValue(q); }, []);

  const handleExport = useCallback(() => {
    if (mappedMessages.length === 0) return;
    const title = activeSession ? deriveSessionTitle(activeSession) : 'Medilingo Chat';
    const lines = [
      `Medilingo — ${title}`,
      `Exported: ${new Date().toLocaleString()}`,
      '─'.repeat(60),
      '',
      ...mappedMessages.map(m => `[${m.role === 'user' ? 'You' : 'Medilingo'}]\n${m.text}\n`),
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `medilingo-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Chat exported');
  }, [mappedMessages, activeSession]);

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen overflow-hidden bg-bg text-ink">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={handleSelectSession}
        onDeleteSession={handleDeleteSession}
        onRenameSession={handleRenameSession}
        onCreateSession={handleCreateSession}
        isLoadingSessions={isLoadingSessions}
        sessionsError={sessionsError}
        onRetryLoadSessions={retryLoadSessions}
      />

      <div className="flex flex-col flex-1 h-full overflow-hidden">
        <ChatHeader
          sessionTitle={sessionTitle}
          onMenuToggle={() => setIsSidebarOpen(true)}
          onRenameSession={
            activeSessionId && !isGuest
              ? (title) => handleRenameSession(activeSessionId, title)
              : undefined
          }
          language={config.language}
          onExport={mappedMessages.length > 0 ? handleExport : undefined}
        />

        {/* Guest notice */}
        {isGuest && (
          <div className="flex-shrink-0 flex items-center justify-between gap-3 px-4 py-2.5 bg-gradient-to-r from-blue-50 to-teal-50 border-b border-blue/15 text-[12px] animate-slide-in">
            <div className="flex items-center gap-2 text-ink-3 min-w-0">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#1A5F7A" strokeWidth="1.8" strokeLinecap="round">
                <path d="M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM12 14a7 7 0 0 0-7 7h14a7 7 0 0 0-7-7Z" />
              </svg>
              <span className="truncate">Guest mode — history won't be saved across sessions.</span>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <Link
                to="/login"
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xs bg-blue text-white text-[11px] font-medium hover:bg-blue-700 transition-colors"
              >
                Sign in
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xs bg-white border border-line text-ink text-[11px] font-medium hover:bg-paper-2 transition-colors"
              >
                Register
              </Link>
            </div>
          </div>
        )}

        <MessageList
          messages={mappedMessages}
          isLoading={isQuerying && !streamingState}
          lastError={queryError}
          voiceSynthSupported={voiceSynthSupported}
          speakingMessageId={speakingMessageId}
          onSpeak={handleSpeak}
          onStopSpeaking={handleStopSpeaking}
          onRetry={handleRetry}
          onSuggestedQuestion={handleSuggestedQuestion}
          streamingState={streamingState}
        />

        <InputBar
          value={inputValue}
          onChange={setInputValue}
          onSubmit={handleSubmit}
          isLoading={isQuerying}
          voiceInputSupported={voiceInputSupported}
          isListening={isListening}
          onStartListening={startListening}
          onStopListening={stopListening}
          language={config.language}
          onLanguageChange={(lang) => setConfig({ language: lang })}
        />
      </div>
    </div>
  );
}

export default ChatPage;
