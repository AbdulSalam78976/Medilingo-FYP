import type { QueryConfig } from '../types/index';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  config: QueryConfig;
  onConfigChange: (partial: Partial<QueryConfig>) => void;
}

function SliderRow({
  label,
  description,
  value,
  min,
  max,
  step,
  display,
  onChange,
}: {
  label: string;
  description: string;
  value: number;
  min: number;
  max: number;
  step: number;
  display: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[13px] font-medium text-ink">{label}</p>
          <p className="text-[11px] text-ink-4 mt-0.5 leading-snug">{description}</p>
        </div>
        <span className="text-[13px] font-mono text-blue tabular-nums min-w-[3.5rem] text-end">{display}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        className="w-full h-1 rounded-full accent-blue bg-line-strong cursor-pointer"
      />
      <div className="flex justify-between text-[10px] font-mono text-ink-5">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}

export function SettingsPanel({ isOpen, onClose, config, onConfigChange }: SettingsPanelProps) {
  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-ink/20 transition-opacity duration-200 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <aside
        className={`fixed top-0 right-0 h-full w-72 z-50 bg-bg border-l border-line shadow-browser flex flex-col transition-transform duration-250 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        aria-label="Query settings"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-line">
          <h2 className="font-display text-[15px] font-medium text-ink">Settings</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close settings"
            className="p-1.5 rounded-sm text-ink-4 hover:text-ink hover:bg-paper-2 transition-colors"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-6 flex flex-col gap-6">
          <SliderRow
            label="Sources to check"
            description="Document chunks retrieved per query"
            value={config.top_k}
            min={1}
            max={10}
            step={1}
            display={`${config.top_k}`}
            onChange={v => onConfigChange({ top_k: v })}
          />

          <SliderRow
            label="Response style"
            description="Lower = precise and factual. Higher = more creative."
            value={config.temperature}
            min={0}
            max={1}
            step={0.1}
            display={config.temperature <= 0.3 ? 'Precise' : config.temperature <= 0.6 ? 'Balanced' : 'Creative'}
            onChange={v => onConfigChange({ temperature: v })}
          />

          <SliderRow
            label="Response length"
            description="Maximum length of the AI response"
            value={config.max_tokens}
            min={256}
            max={2048}
            step={256}
            display={config.max_tokens >= 2048 ? 'Long' : config.max_tokens >= 1024 ? 'Medium' : 'Short'}
            onChange={v => onConfigChange({ max_tokens: v })}
          />

          <div className="border-t border-line pt-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[13px] font-medium text-ink">Advanced mode</p>
                <p className="text-[11px] text-ink-4 mt-0.5 leading-snug">
                  Rewrites your question multiple ways for better retrieval. Slower but more thorough.
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={config.use_advanced}
                onClick={() => onConfigChange({ use_advanced: !config.use_advanced })}
                className={`flex-shrink-0 relative w-10 h-5 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue/30 ${
                  config.use_advanced ? 'bg-blue' : 'bg-line-strong'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${
                    config.use_advanced ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-line">
          <button
            type="button"
            onClick={() => onConfigChange({ top_k: 5, temperature: 0.4, max_tokens: 1024, use_advanced: false })}
            className="w-full py-2 rounded-sm text-[13px] text-ink-4 hover:text-ink hover:bg-paper-2 border border-line transition-colors"
          >
            Reset to defaults
          </button>
        </div>
      </aside>
    </>
  );
}

export default SettingsPanel;
