import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuthStore } from '../hooks/useAuthStore';
import { useAuth } from '../hooks/useAuth';
import { useThemeStore } from '../hooks/useThemeStore';
import { useVoiceSettingsStore, type VoicePersona } from '../hooks/useVoiceSettingsStore';
import { useVoiceOutput } from '../hooks/useVoiceOutput';
import * as sessionService from '../services/sessionService';
import type { SessionSummary } from '../types/index';

function MediLingoMark({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none" style={{ display: 'block', flexShrink: 0 }}>
      <rect width="36" height="36" rx="9" fill="#1A5F7A" />
      <rect x="14.5" y="8"  width="7"  height="20" rx="2.5" fill="white" />
      <rect x="8"    y="14.5" width="20" height="7"  rx="2.5" fill="white" />
      <circle cx="27" cy="27" r="5.5" fill="#06A77D" />
      <path d="M24 27 L25.5 27 L26.2 24.8 L27 29.2 L27.8 27 L29.2 27"
        stroke="white" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      aria-checked={on}
      role="switch"
      onClick={onChange}
      style={{
        width: 32, height: 18, borderRadius: 999,
        background: on ? 'rgb(var(--color-blue))' : 'rgb(var(--color-line-strong))',
        position: 'relative', transition: 'background .15s', flexShrink: 0,
        border: 'none', cursor: 'pointer', padding: 0,
      }}
    >
      <span style={{
        position: 'absolute', top: 2, left: on ? 16 : 2,
        width: 14, height: 14, borderRadius: 999, background: '#fff',
        boxShadow: '0 1px 2px rgba(0,0,0,.18)', transition: 'left .15s',
        display: 'block',
      }} />
    </button>
  );
}

function Row({ label, desc, control, last = false }: {
  label: string; desc?: string; control: React.ReactNode; last?: boolean;
}) {
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 24,
      padding: '16px 0',
      borderBottom: last ? 'none' : '1px solid rgb(var(--color-line))',
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 500, color: 'rgb(var(--color-ink))' }}>{label}</div>
        {desc && <div style={{ fontSize: 12, color: 'rgb(var(--color-ink-4))', marginTop: 3, lineHeight: 1.5 }}>{desc}</div>}
      </div>
      <div style={{ flexShrink: 0 }}>{control}</div>
    </div>
  );
}

export function ProfilePage() {
  const navigate = useNavigate();
  const user = useAuthStore(s => s.user);
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  const isRestoring = useAuthStore(s => s.isRestoring);
  const { logout } = useAuth();
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const { dark, toggle: toggleTheme } = useThemeStore();
  const { persona, speed, autoPlay, setPersona, setSpeed, setAutoPlay } = useVoiceSettingsStore();
  const { speak, isSupported: voiceSupported } = useVoiceOutput();

  useEffect(() => {
    if (isRestoring) return;
    if (!isAuthenticated()) { navigate('/login'); return; }
    sessionService.getSessions()
      .then(setSessions)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isAuthenticated, isRestoring, navigate]);

  const email = user?.email ?? '';
  const initials = email.slice(0, 2).toUpperCase();
  const hue = (email.charCodeAt(0) * 37) % 360;
  const memberSince = new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });

  const voices: { n: VoicePersona; l: string }[] = [
    { n: 'Saira', l: 'Urdu · Female' },
    { n: 'Bilal', l: 'Urdu · Male' },
    { n: 'Aria',  l: 'English · Female' },
  ];

  const samplePhrases: Record<VoicePersona, string> = {
    Saira: 'بخار کی بنیادی وجوہات انفیکشن ہوتی ہیں۔',
    Bilal: 'آپ کو ڈاکٹر سے مشورہ کرنا چاہیے۔',
    Aria:  'High blood pressure can be managed with lifestyle changes.',
  };

  return (
    <div className="min-h-screen bg-bg text-ink flex flex-col">

      {/* Nav */}
      <nav className="sticky top-0 z-40 bg-bg/90 backdrop-blur-sm border-b border-line px-8 py-3.5 flex items-center gap-6">
        <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
          <MediLingoMark size={26} />
          <span className="font-display font-semibold text-[16px] tracking-tight text-ink">MediLingo</span>
        </Link>
        <Link to="/chat" className="px-3 py-1.5 rounded-lg text-[13.5px] text-ink-3 hover:text-ink hover:bg-paper transition-colors ml-3">
          Back to chat
        </Link>
        <div className="ml-auto flex items-center gap-2 px-3 py-1 border border-line rounded-full">
          <span className="text-[13px] text-ink-2">{email.split('@')[0]}</span>
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[11px] font-medium flex-shrink-0"
            style={{ background: `linear-gradient(135deg, hsl(${hue},60%,40%), hsl(${(hue+40)%360},65%,50%))` }}
          >
            {initials}
          </div>
        </div>
      </nav>

      <div className="flex-1 overflow-auto py-10">
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 40px' }}>

          {/* Header */}
          <div className="mb-8 animate-slide-up">
            <div className="kicker mb-2">Account</div>
            <h1 className="font-display text-[32px] font-medium leading-none tracking-tight text-ink m-0">
              Your profile
            </h1>
          </div>

          {/* Profile card */}
          <div className="card mb-4 animate-fade-up" style={{ padding: 26, animationFillMode: 'both' }}>
            <div className="flex items-center gap-5">
              <div
                className="flex-shrink-0 flex items-center justify-center text-white font-display font-medium rounded-full"
                style={{
                  width: 64, height: 64, fontSize: 22,
                  background: `linear-gradient(135deg, hsl(${hue},60%,38%), hsl(${(hue+40)%360},65%,48%))`,
                }}
              >
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-display text-[18px] font-medium text-ink leading-tight truncate">
                  {email.split('@')[0]}
                </div>
                <div className="text-[13px] text-ink-3 mt-1">
                  {email} · Member since {memberSince}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3.5 mt-5 pt-5" style={{ borderTop: '1px solid rgb(var(--color-line))' }}>
              <div>
                <div className="font-mono text-[24px] font-medium text-ink leading-none">
                  {loading ? '—' : sessions.length}
                </div>
                <div className="text-[12px] text-ink-3 mt-1.5">Sessions</div>
                <div className="text-[11px] text-ink-5 mt-0.5">Total conversations</div>
              </div>
              <div>
                <div className="font-mono text-[24px] font-medium text-ink leading-none">3</div>
                <div className="text-[12px] text-ink-3 mt-1.5">Languages</div>
                <div className="text-[11px] text-ink-5 mt-0.5">EN · اردو · Roman Urdu</div>
              </div>
            </div>
          </div>

          {/* Voice settings */}
          <div className="card mb-4 animate-fade-up" style={{ padding: 22, animationDelay: '60ms', animationFillMode: 'both' }}>
            <div className="flex items-center gap-2.5 mb-1.5">
              <span className="w-7 h-7 rounded-lg bg-blue-50 inline-flex items-center justify-center flex-shrink-0">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1A5F7A" strokeWidth="1.8" strokeLinecap="round">
                  <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5" />
                  <path d="M17.5 3.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 7.5-7.5z" />
                </svg>
              </span>
              <span className="font-display text-[17px] font-medium text-ink">Voice</span>
            </div>
            <div className="text-[12px] text-ink-4 mb-4 leading-relaxed">
              How answers sound when read aloud.
            </div>

            {/* Persona selector */}
            <div className="flex gap-2 mb-4">
              {voices.map((v) => (
                <div
                  key={v.n}
                  role="button"
                  tabIndex={0}
                  onClick={() => { setPersona(v.n); toast.success(`Voice set to ${v.n}`); }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setPersona(v.n);
                      toast.success(`Voice set to ${v.n}`);
                    }
                  }}
                  className="flex-1 transition-all rounded-md cursor-pointer"
                  style={{
                    padding: '10px 12px',
                    border: persona === v.n
                      ? '1px solid rgb(var(--color-blue))'
                      : '1px solid rgb(var(--color-line-strong))',
                    background: persona === v.n
                      ? 'rgb(var(--color-blue-50))'
                      : 'rgb(var(--color-paper))',
                  }}
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[13px] font-medium text-ink">{v.n}</span>
                    {voiceSupported && (
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); speak(samplePhrases[v.n], v.n); }}
                        className="text-ink-4 hover:text-blue transition-colors p-0.5"
                        title={`Preview ${v.n}`}
                      >
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                      </button>
                    )}
                  </div>
                  <div className="text-[11px] text-ink-4">{v.l}</div>
                </div>
              ))}
            </div>

            {/* Speed */}
            <div className="mb-4">
              <div className="flex justify-between text-[12px] text-ink-3 mb-2">
                <span>Playback speed</span>
                <span className="font-mono">{speed.toFixed(1)}×</span>
              </div>
              <input
                type="range" min={0.5} max={2.0} step={0.1} value={speed}
                onChange={e => setSpeed(parseFloat(e.target.value))}
                className="w-full h-1 rounded-full accent-blue bg-line-strong cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-ink-5 mt-1">
                <span>0.5×</span><span>2.0×</span>
              </div>
            </div>

            {/* Auto-play */}
            <div className="flex justify-between items-center">
              <div>
                <div className="text-[13px] text-ink">Auto-play answers</div>
                <div className="text-[11px] text-ink-4 mt-0.5">Read each response aloud automatically</div>
              </div>
              <Toggle on={autoPlay} onChange={() => setAutoPlay(!autoPlay)} />
            </div>
          </div>

          {/* Appearance + sign out */}
          <div className="card animate-fade-up" style={{ padding: 22, animationDelay: '120ms', animationFillMode: 'both' }}>
            <div className="flex items-center gap-2.5 mb-1.5">
              <span className="w-7 h-7 rounded-lg bg-green-50 inline-flex items-center justify-center flex-shrink-0">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#06A77D" strokeWidth="1.8" strokeLinecap="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </span>
              <span className="font-display text-[17px] font-medium text-ink">Settings</span>
            </div>

            <Row
              label="Appearance"
              desc="Switch between light and dark interface."
              control={
                <div className="flex items-center gap-2">
                  <span className="text-[12px] text-ink-3">{dark ? 'Dark' : 'Light'}</span>
                  <button
                    type="button"
                    onClick={() => { toggleTheme(); toast.success(dark ? 'Switched to light mode' : 'Switched to dark mode'); }}
                    className="flex items-center justify-center w-8 h-8 rounded-md border border-line-strong hover:bg-paper-2 transition-colors text-ink-3 hover:text-ink"
                  >
                    {dark ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                        <circle cx="12" cy="12" r="5" />
                        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                      </svg>
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                      </svg>
                    )}
                  </button>
                </div>
              }
            />

            <Row
              label="Sign out"
              desc="Ends your session on this device."
              last
              control={
                <button
                  type="button"
                  className="btn btn-ghost text-[13px]"
                  onClick={() => { logout(); toast.success('Signed out'); navigate('/'); }}
                >
                  Sign out
                </button>
              }
            />
          </div>

          <div style={{ height: 40 }} />
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
