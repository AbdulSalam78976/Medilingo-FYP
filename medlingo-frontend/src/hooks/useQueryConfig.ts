import { useState } from 'react';
import type { QueryConfig } from '../types/index';
import { clampConfig } from '../utils/queryUtils';

const DEFAULT_CONFIG: QueryConfig = {
  top_k: 5,
  temperature: 0.4,
  max_tokens: 1024,
  use_advanced: false,
  language: 'auto',
};

export interface UseQueryConfigReturn {
  config: QueryConfig;
  setConfig: (partial: Partial<QueryConfig>) => void;
}

/**
 * Manages QueryConfig state with sensible defaults.
 * Numeric values are clamped to their valid ranges via clampConfig.
 * Requirements: 8.1, 8.3, 8.4
 */
export function useQueryConfig(): UseQueryConfigReturn {
  const [config, setConfigState] = useState<QueryConfig>(DEFAULT_CONFIG);

  const setConfig = (partial: Partial<QueryConfig>) => {
    setConfigState((prev) => {
      const merged = { ...prev, ...partial };

      return {
        top_k: clampConfig(merged.top_k, 'top_k'),
        temperature: clampConfig(merged.temperature, 'temperature'),
        max_tokens: clampConfig(merged.max_tokens, 'max_tokens'),
        use_advanced: merged.use_advanced,
        language: merged.language,
      };
    });
  };

  return { config, setConfig };
}
