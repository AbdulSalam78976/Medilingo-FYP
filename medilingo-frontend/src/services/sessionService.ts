import type { SessionSummary, ChatMessage } from '../types/index';
import { authenticatedFetch } from './apiClient';

const BASE_URL = import.meta.env.VITE_API_URL ?? '';

/** GET /sessions */
export async function getSessions(): Promise<SessionSummary[]> {
  const response = await authenticatedFetch(`${BASE_URL}/sessions`);
  if (!response.ok) throw new Error('Failed to load sessions');
  return response.json();
}

/** POST /sessions */
export async function createSession(title?: string): Promise<SessionSummary> {
  const response = await authenticatedFetch(`${BASE_URL}/sessions`, {
    method: 'POST',
    body: JSON.stringify({ title: title ?? null }),
  });
  if (!response.ok) throw new Error('Failed to create session');
  return response.json();
}

/** GET /sessions/{id} */
export async function getSession(id: string): Promise<SessionSummary> {
  const response = await authenticatedFetch(`${BASE_URL}/sessions/${id}`);
  if (!response.ok) throw new Error('Session not found');
  return response.json();
}

/** DELETE /sessions/{id} */
export async function deleteSession(id: string): Promise<void> {
  const response = await authenticatedFetch(`${BASE_URL}/sessions/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete session');
}

/** PATCH /sessions/{id} — rename a session */
export async function renameSession(id: string, title: string): Promise<SessionSummary> {
  const response = await authenticatedFetch(`${BASE_URL}/sessions/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ title }),
  });
  if (!response.ok) throw new Error('Failed to rename session');
  return response.json();
}
export async function getMessages(sessionId: string): Promise<ChatMessage[]> {
  const response = await authenticatedFetch(`${BASE_URL}/sessions/${sessionId}/messages`);
  if (!response.ok) throw new Error('Failed to load messages');
  return response.json();
}

/** POST /sessions/{id}/messages */
export async function postMessage(
  sessionId: string,
  role: 'user' | 'assistant',
  content: string,
  sources?: unknown[] | null,
): Promise<ChatMessage> {
  const response = await authenticatedFetch(`${BASE_URL}/sessions/${sessionId}/messages`, {
    method: 'POST',
    body: JSON.stringify({ role, content, sources: sources ?? null }),
  });
  if (!response.ok) throw new Error('Failed to save message');
  return response.json();
}
