import { useState, useEffect } from 'react';
import { getHealth } from '../services/apiClient';

export interface UseHealthReturn {
  status: 'connected' | 'unavailable' | 'checking';
}

const POLL_INTERVAL_MS = 30_000;

/**
 * Polls GET /health once on mount and every 30 seconds thereafter.
 * Returns 'connected' when the backend responds with status === 'healthy',
 * 'unavailable' on any error or non-healthy status, and 'checking' as the
 * initial state before the first response arrives.
 * Requirements: 7.1, 7.2
 */
export function useHealth(): UseHealthReturn {
  const [status, setStatus] = useState<'connected' | 'unavailable' | 'checking'>('checking');

  useEffect(() => {
    let cancelled = false;

    async function checkHealth(): Promise<void> {
      try {
        const response = await getHealth();
        if (!cancelled) {
          setStatus(response.status === 'healthy' ? 'connected' : 'unavailable');
        }
      } catch {
        if (!cancelled) {
          setStatus('unavailable');
        }
      }
    }

    // Poll immediately on mount
    checkHealth();

    // Then poll every 30 seconds
    const intervalId = setInterval(checkHealth, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, []);

  return { status };
}
