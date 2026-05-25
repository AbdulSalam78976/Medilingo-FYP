import type { QueryPayload, QueryResponse, HealthResponse, AppError, RetrievedDoc } from '../types/index';
import { useAuthStore } from '../hooks/useAuthStore';
import { refreshAccessToken } from './authService';

// In dev, VITE_API_URL is empty so all requests go through the Vite proxy (same-origin).
// In production, set VITE_API_URL to the deployed backend URL.
const BASE_URL = import.meta.env.VITE_API_URL ?? '';
const TIMEOUT_MS = 30_000;

/**
 * Wraps fetch with a 30-second AbortController timeout.
 * Throws AppError on timeout or network failure.
 */
export async function fetchWithTimeout(url: string, options: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    return response;
  } catch (err) {
    const error = err as Error;
    if (error.name === 'AbortError') {
      const appError: AppError = {
        type: 'timeout',
        message: 'Request timed out. The server may be busy.',
        retryable: true,
      };
      throw appError;
    }
    const appError: AppError = {
      type: 'network',
      message: 'Could not reach the server. Check your connection.',
      retryable: true,
    };
    throw appError;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Authenticated fetch wrapper.
 * Attaches Bearer token from auth store, handles 401 with token refresh and retry.
 */
export async function authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = useAuthStore.getState().accessToken;
  const headers = new Headers(options.headers);
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  headers.set('Content-Type', 'application/json');

  let response = await fetchWithTimeout(url, {
    ...options,
    headers,
    credentials: 'include',
  });

  if (response.status === 401) {
    // Attempt token refresh once
    try {
      const newToken = await refreshAccessToken();
      const currentUser = useAuthStore.getState().user;
      useAuthStore.getState().setAuth(currentUser, newToken);

      const retryHeaders = new Headers(options.headers);
      retryHeaders.set('Authorization', `Bearer ${newToken}`);
      retryHeaders.set('Content-Type', 'application/json');

      response = await fetchWithTimeout(url, {
        ...options,
        headers: retryHeaders,
        credentials: 'include',
      });
    } catch {
      // Refresh failed — clear auth and redirect to login
      useAuthStore.getState().clearAuth();
      window.location.href = '/login';
      throw new Error('Session expired');
    }
  }

  return response;
}

/**
 * POST /query — sends a query payload and returns the parsed QueryResponse.
 * Throws AppError on HTTP 4xx (not retryable) or 5xx (retryable).
 */
export async function postQuery(payload: QueryPayload): Promise<QueryResponse> {
  const response = await fetchWithTimeout(`${BASE_URL}/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const retryable = response.status >= 500;
    const appError: AppError = {
      type: 'http',
      message: retryable
        ? 'Server error. Please try again.'
        : `Request failed with status ${response.status}.`,
      statusCode: response.status,
      retryable,
    };
    throw appError;
  }

  return response.json() as Promise<QueryResponse>;
}

/**
 * GET /health — checks backend connectivity.
 */
export async function getHealth(): Promise<HealthResponse> {
  try {
    const response = await fetchWithTimeout(`${BASE_URL}/health`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      const appError: AppError = {
        type: 'network',
        message: 'Backend health check failed.',
        statusCode: response.status,
        retryable: true,
      };
      throw appError;
    }

    return response.json() as Promise<HealthResponse>;
  } catch (err) {
    const error = err as AppError;
    if (error.type) throw error;
    const appError: AppError = {
      type: 'network',
      message: 'Could not reach the server. Check your connection.',
      retryable: true,
    };
    throw appError;
  }
}

/**
 * POST /query/stream — streams a RAG response as SSE.
 * Calls onDocs once with retrieved sources, then onToken for each text chunk.
 */
export async function streamQuery(
  payload: QueryPayload,
  onDocs: (docs: RetrievedDoc[]) => void,
  onToken: (token: string) => void,
): Promise<void> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 90_000);

  try {
    const token = useAuthStore.getState().accessToken;
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(`${BASE_URL}/query/stream`, {
      method: 'POST',
      headers,
      credentials: 'include',
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    if (!response.ok) {
      const appError: AppError = {
        type: 'http',
        message: response.status >= 500 ? 'Server error. Please try again.' : `Request failed (${response.status}).`,
        statusCode: response.status,
        retryable: response.status >= 500,
      };
      throw appError;
    }

    if (!response.body) throw { type: 'network', message: 'No response body.', retryable: true } as AppError;

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const raw = line.slice(6).trim();
        if (!raw) continue;
        try {
          const event = JSON.parse(raw);
          if (event.type === 'docs') onDocs(event.docs as RetrievedDoc[]);
          else if (event.type === 'token') onToken(event.token as string);
          else if (event.type === 'error') throw { type: 'http', message: event.message, retryable: true } as AppError;
        } catch (parseErr) {
          if ((parseErr as AppError).type) throw parseErr;
        }
      }
    }
  } finally {
    clearTimeout(timer);
  }
}

/**
 * GET /pipeline/status — returns the pipeline status as parsed JSON.
 */
export async function getPipelineStatus(): Promise<unknown> {
  const response = await fetchWithTimeout(`${BASE_URL}/pipeline/status`, {
    method: 'GET',
    credentials: 'include',
  });

  if (!response.ok) {
    const appError: AppError = {
      type: 'network',
      message: `Pipeline status request failed with status ${response.status}.`,
      statusCode: response.status,
      retryable: true,
    };
    throw appError;
  }

  return response.json();
}

/**
 * POST /query/image — upload an image/PDF for Gemini vision analysis.
 */
export async function queryImage(
  file: File,
  question: string,
  language: string,
): Promise<{ response: string; question: string; filename: string }> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('question', question);
  formData.append('language', language);

  const token = useAuthStore.getState().accessToken;
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 60_000);
  try {
    const response = await fetch(`${BASE_URL}/query/image`, {
      method: 'POST',
      headers,
      credentials: 'include',
      body: formData,
      signal: controller.signal,
    });
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw { type: 'http', message: body.detail ?? 'Image analysis failed.', statusCode: response.status, retryable: false } as AppError;
    }
    return response.json();
  } catch (err) {
    const e = err as AppError;
    if (e.type) throw e;
    throw { type: 'network', message: 'Could not reach the server.', retryable: true } as AppError;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * POST /symptom-check — structured symptom triage.
 */
export async function checkSymptoms(payload: {
  symptoms: string;
  duration?: string;
  severity?: string;
  age?: number;
  additional_context?: string;
  language: string;
}): Promise<{ response: string }> {
  const response = await fetchWithTimeout(`${BASE_URL}/symptom-check`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw { type: 'http', message: body.detail ?? 'Symptom check failed.', statusCode: response.status, retryable: response.status >= 500 } as AppError;
  }
  return response.json();
}

/**
 * POST /drug-interactions — check interactions between medicines.
 */
export async function checkDrugInteractions(payload: {
  medicines: string;
  language: string;
}): Promise<{ response: string }> {
  const response = await fetchWithTimeout(`${BASE_URL}/drug-interactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw { type: 'http', message: body.detail ?? 'Drug interaction check failed.', statusCode: response.status, retryable: response.status >= 500 } as AppError;
  }
  return response.json();
}

/**
 * GET /admin/stats — platform statistics (admin only).
 */
export async function getAdminStats(): Promise<unknown> {
  const response = await authenticatedFetch(`${BASE_URL}/admin/stats`);
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw { type: 'http', message: body.detail ?? 'Failed to load admin stats.', statusCode: response.status, retryable: false } as AppError;
  }
  return response.json();
}

/**
 * GET /admin/queries — recent user queries (admin only).
 */
export async function getAdminQueries(limit = 50): Promise<unknown> {
  const response = await authenticatedFetch(`${BASE_URL}/admin/queries?limit=${limit}`);
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw { type: 'http', message: body.detail ?? 'Failed to load admin queries.', statusCode: response.status, retryable: false } as AppError;
  }
  return response.json();
}

/**
 * GET /admin/users — list registered users (admin only).
 */
export async function getAdminUsers(): Promise<unknown> {
  const response = await authenticatedFetch(`${BASE_URL}/admin/users`);
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw { type: 'http', message: body.detail ?? 'Failed to load users.', statusCode: response.status, retryable: false } as AppError;
  }
  return response.json();
}
