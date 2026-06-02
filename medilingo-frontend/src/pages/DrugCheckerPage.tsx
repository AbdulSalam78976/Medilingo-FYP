import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { checkDrugInteractions } from '../services/apiClient';
import { DocMarkdown } from '../components/DocMarkdown';
import { ThemeToggle } from '../components/ThemeToggle';
import type { Language } from '../types/index';
import { LANGUAGE_INSTRUCTIONS } from '../types/index';

type LangOption = Language | 'auto';

const EXAMPLE_MEDS = [
  'Aspirin, Warfarin',
  'Metformin, Lisinopril, Atorvastatin',
  'Paracetamol, Ibuprofen, Omeprazole',
  'Amoxicillin, Metronidazole',
];

export function DrugCheckerPage() {
  const [medicines, setMedicines] = useState('');
  const [language, setLanguage] = useState<LangOption>('auto');
  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleCheck() {
    const trimmed = medicines.trim();
    if (!trimmed) {
      toast.error('Please enter at least two medicine names.');
      return;
    }
    const parts = trimmed.split(/[,\n]+/).filter(p => p.trim());
    if (parts.length < 2) {
      toast.error('Enter at least two medicines separated by commas.');
      return;
    }
    const langInstruction = language === 'auto' ? 'Respond in English' : LANGUAGE_INSTRUCTIONS[language as Language];
    setIsLoading(true);
    setResult(null);
    try {
      const res = await checkDrugInteractions({ medicines: trimmed, language: langInstruction });
      setResult(res.response);
    } catch (err: unknown) {
      const msg = (err as { message?: string }).message ?? 'Drug interaction check failed.';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
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
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1A5F7A" strokeWidth="1.8" strokeLinecap="round"><path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18"/></svg>
            </div>
            <h1 className="text-[15px] font-semibold text-ink">Drug Interaction Checker</h1>
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

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Intro card */}
        <div className="card p-5 border-l-[3px] border-l-blue">
          <h2 className="text-[16px] font-semibold text-ink mb-1.5">Check Medicine Interactions</h2>
          <p className="text-[13px] text-ink-3 leading-relaxed">
            Enter a list of medicines separated by commas or new lines. The AI will analyze potential interactions, their severity, and advise you on next steps.
          </p>
        </div>

        {/* Input */}
        <div className="space-y-2">
          <label className="text-[13px] font-medium text-ink">Medicine names</label>
          <textarea
            value={medicines}
            onChange={(e) => setMedicines(e.target.value)}
            placeholder={"Aspirin, Warfarin, Metformin\n\n(one medicine per line, or comma-separated)"}
            maxLength={1000}
            rows={5}
            className="w-full bg-paper border border-line rounded-sm px-4 py-3 text-[14px] text-ink placeholder:text-ink-5 focus:outline-none focus:ring-2 focus:ring-teal/20 focus:border-teal resize-none font-mono"
          />
          <div className="flex items-center justify-between">
            <p className="text-[11px] text-ink-4">Include brand names or generic names — both work.</p>
            <span className="text-[11px] text-ink-5 font-mono">{medicines.length}/1000</span>
          </div>
        </div>

        {/* Examples */}
        <div className="space-y-2">
          <p className="text-[12px] font-medium text-ink-3">Quick examples:</p>
          <div className="flex flex-wrap gap-2">
            {EXAMPLE_MEDS.map(ex => (
              <button
                key={ex}
                type="button"
                onClick={() => setMedicines(ex)}
                className="pill text-[11px] hover:border-blue hover:text-blue transition-colors"
              >
                {ex}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={handleCheck}
          disabled={isLoading || !medicines.trim()}
          className="btn-primary w-full py-3 disabled:opacity-60"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4Z"/></svg>
              Checking interactions…
            </span>
          ) : 'Check Interactions'}
        </button>

        {/* Result */}
        {result && (
          <div className="space-y-4 animate-slide-in">
            <div className="card p-5 shadow-card">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-line">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1A5F7A" strokeWidth="1.8" strokeLinecap="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>
                <span className="text-[13px] font-semibold text-ink">Interaction Analysis</span>
              </div>
              <DocMarkdown>{result}</DocMarkdown>
            </div>

            <div className="flex items-start gap-2.5 p-3.5 bg-amber/8 border border-amber/20 rounded-sm">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#B45309" strokeWidth="1.8" strokeLinecap="round" className="flex-shrink-0 mt-0.5"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0ZM12 9v4M12 17h.01"/></svg>
              <p className="text-[12px] text-ink-3 leading-relaxed">
                This analysis is for informational purposes only. Always consult your pharmacist or doctor before changing your medications.
              </p>
            </div>

            <div className="flex gap-3">
              <button type="button" onClick={() => { setResult(null); setMedicines(''); }} className="btn-secondary flex-1 py-2.5">
                Clear
              </button>
              <Link to="/chat" className="btn-primary flex-1 py-2.5 text-center">
                Discuss with Medilingo →
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DrugCheckerPage;
