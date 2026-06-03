import { useVoiceSettingsStore } from '../hooks/useVoiceSettingsStore';
import type { VoicePersona } from '../hooks/useVoiceSettingsStore';
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

const PERSONAS: { id: VoicePersona; label: string; sub: string }[] = [
  { id: 'Saira', label: 'Saira', sub: 'Female · Urdu / English' },
  { id: 'Bilal', label: 'Bilal', sub: 'Male · Urdu / English'   },
  { id: 'Aria',  label: 'Aria',  sub: 'Female · English'        },
];

export function SettingsPanel({ isOpen, onClose, config, onConfigChange }: SettingsPanelProps) {
  const persona    = useVoiceSettingsStore(s => s.persona);
  const speed      = useVoiceSettingsStore(s => s.speed);
  const autoPlay   = useVoiceSettingsStore(s => s.autoPlay);
  const setPersona = useVoiceSettingsStore(s => s.setPersona);
  const setSpeed   = useVoiceSettingsStore(s => s.setSpeed);
  const setAutoPlay= useVoiceSettingsStore(s => s.setAutoPlay);

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

          {/* ── Voice settings ───────────────────────────────────── */}
          <div className="border-t border-line pt-5 flex flex-col gap-4">
            <p className="text-[12px] font-semibold text-ink-3 uppercase tracking-[.06em]">
              Voice
            </p>

            {/* Persona picker */}
            <div className="flex flex-col gap-1.5">
              <p className="text-[13px] font-medium text-ink">Voice persona</p>
              <div className="flex flex-col gap-1.5 mt-1">
                {PERSONAS.map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPersona(p.id)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-md border text-left transition-colors ${
                      persona === p.id
                        ? 'border-blue bg-blue-50 text-blue'
                        : 'border-line text-ink-3 hover:border-line-strong hover:text-ink hover:bg-paper-2'
                    }`}
                  >
                    {/* Avatar icon */}
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-[11px] font-bold ${
                      persona === p.id ? 'bg-blue text-white' : 'bg-line text-ink-4'
                    }`}>
                      {p.id[0]}
                    </div>
                    <div>
                      <div className="text-[13px] font-medium leading-none">{p.label}</div>
                      <div className="text-[11px] mt-0.5 opacity-70">{p.sub}</div>
                    </div>
                    {persona === p.id && (
                      <svg className="ml-auto" width="14" height="14" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <path d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Speed slider */}
            <SliderRow
              label="Speech speed"
              description="How fast the voice reads the response"
              value={speed}
              min={0.5}
              max={2.0}
              step={0.1}
              display={speed === 1.0 ? 'Normal' : speed < 1 ? 'Slow' : 'Fast'}
              onChange={setSpeed}
            />

            {/* Auto-play toggle */}
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[13px] font-medium text-ink">Auto-play responses</p>
                <p className="text-[11px] text-ink-4 mt-0.5 leading-snug">
                  Speak every AI response automatically
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={autoPlay}
                onClick={() => setAutoPlay(!autoPlay)}
                className={`flex-shrink-0 relative w-10 h-5 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue/30 ${
                  autoPlay ? 'bg-blue' : 'bg-line-strong'
                }`}
              >
                <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${
                  autoPlay ? 'translate-x-5' : 'translate-x-0'
                }`} />
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
