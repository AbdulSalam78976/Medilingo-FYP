import { useState, useCallback, useRef } from 'react';
import type { QueryConfig, QueryPayload, AppError, QueryResponse, RetrievedDoc } from '../types/index';
import { LANGUAGE_INSTRUCTIONS } from '../types/index';
import { isValidQuery, buildQuery } from '../utils/queryUtils';
import * as apiClient from '../services/apiClient';

export interface UseChatReturn {
  isLoading: boolean;
  lastError: AppError | null;
  submitQuery: (text: string, config: QueryConfig) => Promise<QueryResponse>;
  submitQueryStream: (
    text: string,
    config: QueryConfig,
    onDocs: (docs: RetrievedDoc[]) => void,
    onToken: (token: string) => void,
    history?: Array<{ role: string; content: string }>,
  ) => Promise<void>;
  submitImageQuery: (
    file: File,
    question: string,
    language: QueryConfig['language'],
  ) => Promise<{ response: string }>;
  retryLast: () => Promise<QueryResponse | undefined>;
  clearError: () => void;
  clearHistory: () => void;
}

export function useChat(): UseChatReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [lastError, setLastError] = useState<AppError | null>(null);
  const [lastFailedPayload, setLastFailedPayload] = useState<QueryPayload | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const submitQuery = useCallback(
    async (text: string, config: QueryConfig): Promise<QueryResponse> => {
      if (!isValidQuery(text)) throw new Error('Invalid query');

      const payload: QueryPayload = {
        query: buildQuery(text, config.language),
        top_k: config.top_k,
        temperature: config.temperature,
        max_tokens: config.max_tokens,
        use_advanced: config.use_advanced,
      };

      setIsLoading(true);
      setLastError(null);

      try {
        const response = await apiClient.postQuery(payload);
        setLastFailedPayload(null);
        return response;
      } catch (err) {
        setLastError(err as AppError);
        setLastFailedPayload(payload);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const submitQueryStream = useCallback(
    async (
      text: string,
      config: QueryConfig,
      onDocs: (docs: RetrievedDoc[]) => void,
      onToken: (token: string) => void,
      history?: Array<{ role: string; content: string }>,
    ): Promise<void> => {
      if (!isValidQuery(text)) throw new Error('Invalid query');

      const payload: QueryPayload = {
        query: buildQuery(text, config.language),
        top_k: config.top_k,
        temperature: config.temperature,
        max_tokens: config.max_tokens,
        use_advanced: config.use_advanced,
        conversation_history: history?.length ? history : undefined,
      };

      setIsLoading(true);
      setLastError(null);

      try {
        await apiClient.streamQuery(payload, onDocs, onToken);
        setLastFailedPayload(null);
      } catch (err) {
        setLastError(err as AppError);
        setLastFailedPayload(payload);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const retryLast = useCallback(async (): Promise<QueryResponse | undefined> => {
    if (!lastFailedPayload) return undefined;
    setIsLoading(true);
    setLastError(null);
    try {
      const response = await apiClient.postQuery(lastFailedPayload);
      setLastFailedPayload(null);
      return response;
    } catch (err) {
      setLastError(err as AppError);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [lastFailedPayload]);

  const submitImageQuery = useCallback(
    async (
      file: File,
      question: string,
      language: QueryConfig['language'],
    ): Promise<{ response: string }> => {
      const langInstruction = language === 'auto'
        ? 'Respond in English'
        : LANGUAGE_INSTRUCTIONS[language] ?? 'Respond in English';

      setIsLoading(true);
      setLastError(null);
      try {
        const result = await apiClient.queryImage(file, question || 'Analyze this medical document.', langInstruction);
        return result;
      } catch (err) {
        setLastError(err as AppError);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const clearError = useCallback(() => {
    setLastError(null);
    setLastFailedPayload(null);
    abortRef.current?.abort();
  }, []);

  return { isLoading, lastError, submitQuery, submitQueryStream, submitImageQuery, retryLast, clearError, clearHistory: clearError };
}
