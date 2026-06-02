import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { checkSymptoms } from '../services/apiClient';
import { DocMarkdown } from '../components/DocMarkdown';
import { ThemeToggle } from '../components/ThemeToggle';
import type { Language } from '../types/index';
import { LANGUAGE_INSTRUCTIONS } from '../types/index';

type LangOption = Language | 'auto';
type Step = 'symptoms' | 'details' | 'result';

const SEVERITY_OPTIONS = [
  { value: 'mild', label: 'Mild', desc: 'Noticeable but not affecting daily activities' },
  { value: 'moderate', label: 'Moderate', desc: 'Affecting some daily activities' },
  { value: 'severe', label: 'Severe', desc: 'Significantly limiting daily activities' },
];

export function SymptomCheckerPage() {
  const [step, setStep] = useState<Step>('symptoms');
  const [symptoms, setSymptoms] = useState('');
  const [duration, setDuration] = useState('');
  const [severity, setSeverity] = useState('moderate');
  const [age, setAge] = useState('');
  const [context, setContext] = useState('');
  const [language, setLanguage] = useState<LangOption>('auto');
  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleCheck() {
    if (!symptoms.trim()) {
      toast.error('Please describe your symptoms first.');
      return;
    }
    const langInstruction = language === 'auto' ? 'Respond in English' : LANGUAGE_INSTRUCTIONS[language as Language];
    setIsLoading(true);
    try {
      const res = await checkSymptoms({
        symptoms,
        duration,
        severity,
        age: age ? parseInt(age) : undefined,
        additional_context: context,
        language: langInstruction,
      });
      setResult(res.response);
      setStep('result');
    } catch (err: unknown) {
      const msg = (err as { message?: string }).message ?? 'Symptom check failed.';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }

  function handleReset() {
    setStep('symptoms');
    setSymptoms('');
    setDuration('');
    setSeverity('moderate');
    setAge('');
    setContext('');
    setResult(null);
  }

  return (
    <div className="min-h-screen bg-bg text-ink">
      {/* Header */}
      <header className="border-b border-line bg-bg sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3.5 flex items-center gap-3">
          <Link to="/chat" className="p-1.5 rounded-sm text-ink-4 hover:text-ink hover:bg-paper-2 transition-colors" aria-label="Back to chat">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-sm bg-teal-50 flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1A5F7A" strokeWidth="1.8" strokeLinecap="round"><path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3"/><path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/><circle cx="20" cy="10" r="2"/></svg>
            </div>
            <h1 className="text-[15px] font-semibold text-ink">Symptom Checker</h1>
          </div>
          <div className="ml-auto flex items-center gap-1">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as LangOption)}
              className="text-[12px] bg-paper border border-line rounded-xs px-2 py-1 text-ink-3 focus:outline-none focus:ring-1 focus:ring-teal/30"
            >
              <option value="auto">Auto</option>
              <option value="English">English</option>
              <option value="Urdu">اردو</option>
              <option value="Roman Urdu">Roman Urdu</option>
            </select>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Progress indicator */}
        {step !== 'result' && (
          <div className="flex items-center gap-2 mb-8">
            {(['symptoms', 'details'] as Step[]).map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-semibold transition-colors ${
                  step === s ? 'bg-blue text-white' : 'bg-paper-2 text-ink-4 border border-line'
                }`}>
                  {i + 1}
                </div>
                <span className={`text-[12px] ${step === s ? 'text-ink font-medium' : 'text-ink-4'}`}>
                  {s === 'symptoms' ? 'Symptoms' : 'Details'}
                </span>
                {i === 0 && <div className="w-8 h-px bg-line mx-1" />}
              </div>
            ))}
          </div>
        )}

        {/* Step 1 — Symptoms */}
        {step === 'symptoms' && (
          <div className="space-y-6 animate-slide-in">
            <div>
              <h2 className="text-[20px] font-bold text-ink mb-1">What symptoms are you experiencing?</h2>
              <p className="text-[13px] text-ink-3">Describe your main symptoms in detail. The more specific you are, the better the analysis.</p>
            </div>
            <textarea
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="e.g., I have a headache on the right side, fever of 38.5°C, and feel nauseous. The headache started this morning and gets worse when I move..."
              maxLength={2000}
              rows={5}
              className="w-full bg-paper border border-line rounded-sm px-4 py-3 text-[14px] text-ink placeholder:text-ink-5 focus:outline-none focus:ring-2 focus:ring-teal/20 focus:border-teal resize-none"
            />
            <div className="flex justify-end">
              <span className="text-[11px] text-ink-5 font-mono">{symptoms.length}/2000</span>
            </div>
            <button
              type="button"
              onClick={() => { if (symptoms.trim()) setStep('details'); else toast.error('Please describe your symptoms.'); }}
              className="btn-primary w-full py-3"
            >
              Continue →
            </button>
          </div>
        )}

        {/* Step 2 — Details */}
        {step === 'details' && (
          <div className="space-y-6 animate-slide-in">
            <div>
              <h2 className="text-[20px] font-bold text-ink mb-1">Tell us more</h2>
              <p className="text-[13px] text-ink-3">These details help produce a more accurate assessment.</p>
            </div>

            {/* Severity */}
            <div className="space-y-2">
              <label className="text-[13px] font-medium text-ink">Severity</label>
              <div className="grid grid-cols-3 gap-2">
                {SEVERITY_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setSeverity(opt.value)}
                    className={`card p-3 text-left transition-all ${
                      severity === opt.value ? 'border-blue bg-blue-50 shadow-none' : 'hover:border-line-strong'
                    }`}
                  >
                    <div className={`text-[13px] font-semibold mb-0.5 ${severity === opt.value ? 'text-blue' : 'text-ink'}`}>{opt.label}</div>
                    <div className="text-[11px] text-ink-4 leading-snug">{opt.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Duration */}
            <div className="space-y-1.5">
              <label className="text-[13px] font-medium text-ink">Duration</label>
              <input
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="e.g., 2 days, since this morning, 1 week"
                maxLength={200}
                className="w-full bg-paper border border-line rounded-sm px-3 py-2.5 text-[14px] text-ink placeholder:text-ink-5 focus:outline-none focus:ring-2 focus:ring-teal/20 focus:border-teal"
              />
            </div>

            {/* Age */}
            <div className="space-y-1.5">
              <label className="text-[13px] font-medium text-ink">Age <span className="text-ink-4 font-normal">(optional)</span></label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="e.g., 35"
                min="0"
                max="130"
                className="w-full bg-paper border border-line rounded-sm px-3 py-2.5 text-[14px] text-ink placeholder:text-ink-5 focus:outline-none focus:ring-2 focus:ring-teal/20 focus:border-teal"
              />
            </div>

            {/* Additional context */}
            <div className="space-y-1.5">
              <label className="text-[13px] font-medium text-ink">Additional context <span className="text-ink-4 font-normal">(optional)</span></label>
              <textarea
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="e.g., I have diabetes, recently travelled, taking metformin"
                maxLength={500}
                rows={2}
                className="w-full bg-paper border border-line rounded-sm px-3 py-2.5 text-[14px] text-ink placeholder:text-ink-5 focus:outline-none focus:ring-2 focus:ring-teal/20 focus:border-teal resize-none"
              />
            </div>

            <div className="flex gap-3">
              <button type="button" onClick={() => setStep('symptoms')} className="btn-secondary flex-1 py-3">
                ← Back
              </button>
              <button type="button" onClick={handleCheck} disabled={isLoading} className="btn-primary flex-[2] py-3 disabled:opacity-60">
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4Z"/></svg>
                    Analyzing…
                  </span>
                ) : 'Get Assessment'}
              </button>
            </div>
          </div>
        )}

        {/* Step 3 — Result */}
        {step === 'result' && result && (
          <div className="space-y-6 animate-slide-in">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-[20px] font-bold text-ink mb-1">Symptom Assessment</h2>
                <p className="text-[13px] text-ink-3">This is an AI-generated assessment, not a medical diagnosis. Always consult a doctor.</p>
              </div>
              <button type="button" onClick={handleReset} className="btn-secondary text-[13px] flex-shrink-0">
                New Check
              </button>
            </div>

            <div className="card p-5 shadow-card">
              <DocMarkdown>{result}</DocMarkdown>
            </div>

            <div className="flex items-start gap-2.5 p-3.5 bg-amber/8 border border-amber/20 rounded-sm">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#B45309" strokeWidth="1.8" strokeLinecap="round" className="flex-shrink-0 mt-0.5"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0ZM12 9v4M12 17h.01"/></svg>
              <p className="text-[12px] text-ink-3 leading-relaxed">
                This assessment is for informational purposes only and does not constitute medical advice. If you have serious symptoms, please visit a doctor or call emergency services.
              </p>
            </div>

            <div className="flex gap-3">
              <Link to="/chat" className="btn-primary flex-1 py-3 text-center">
                Discuss with Medilingo →
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SymptomCheckerPage;
