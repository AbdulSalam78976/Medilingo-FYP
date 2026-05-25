import { renderHook, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useHealth } from './useHealth';
import * as apiClient from '../services/apiClient';

vi.mock('../services/apiClient');

const mockGetHealth = vi.mocked(apiClient.getHealth);

/** Flush all pending microtasks (resolved promises) without advancing timers. */
const flushPromises = () => act(async () => { await Promise.resolve(); });

describe('useHealth', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockGetHealth.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts with status "checking"', () => {
    mockGetHealth.mockResolvedValue({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      groq_configured: true,
    });

    const { result } = renderHook(() => useHealth());
    expect(result.current.status).toBe('checking');
  });

  it('sets status to "connected" when backend responds with status === "healthy"', async () => {
    mockGetHealth.mockResolvedValue({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      groq_configured: true,
    });

    const { result } = renderHook(() => useHealth());

    // Flush the initial async checkHealth call
    await flushPromises();

    expect(result.current.status).toBe('connected');
  });

  it('sets status to "unavailable" when backend responds with non-healthy status', async () => {
    mockGetHealth.mockResolvedValue({
      status: 'degraded',
      timestamp: new Date().toISOString(),
      groq_configured: false,
    });

    const { result } = renderHook(() => useHealth());

    await flushPromises();

    expect(result.current.status).toBe('unavailable');
  });

  it('sets status to "unavailable" on network error', async () => {
    mockGetHealth.mockRejectedValue({
      type: 'network',
      message: 'Could not reach the server.',
      retryable: true,
    });

    const { result } = renderHook(() => useHealth());

    await flushPromises();

    expect(result.current.status).toBe('unavailable');
  });

  it('polls again after 30 seconds', async () => {
    mockGetHealth.mockResolvedValue({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      groq_configured: true,
    });

    renderHook(() => useHealth());

    // First call on mount
    await flushPromises();
    expect(mockGetHealth).toHaveBeenCalledTimes(1);

    // Advance 30 seconds to trigger the interval, then flush the resulting promise
    await act(async () => {
      vi.advanceTimersByTime(30_000);
    });
    await flushPromises();

    expect(mockGetHealth).toHaveBeenCalledTimes(2);
  });

  it('cleans up the interval on unmount', async () => {
    mockGetHealth.mockResolvedValue({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      groq_configured: true,
    });

    const { unmount } = renderHook(() => useHealth());

    // First call on mount
    await flushPromises();
    expect(mockGetHealth).toHaveBeenCalledTimes(1);

    unmount();

    // Advance time — no further calls should be made after unmount
    await act(async () => {
      vi.advanceTimersByTime(60_000);
    });
    await flushPromises();

    expect(mockGetHealth).toHaveBeenCalledTimes(1);
  });
});
