import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../hooks/useAuthStore';
import { useScrollReveal } from '../hooks/useScrollReveal';

// ── Brand mark (solid cross + green AI pulse dot) ─────────────────────────────

function MedilingoMark({ size = 22, invert = false }: { size?: number; invert?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none" style={{ display: 'block', flexShrink: 0 }}>
      <rect width="36" height="36" rx="9" fill={invert ? 'white' : '#1A5F7A'} />
      <rect x="14.5" y="8"  width="7"  height="20" rx="2.5" fill={invert ? '#1A5F7A' : 'white'} />
      <rect x="8"    y="14.5" width="20" height="7"  rx="2.5" fill={invert ? '#1A5F7A' : 'white'} />
      <circle cx="27" cy="27" r="5.5" fill="#06A77D" />
      <path d="M24 27 L25.5 27 L26.2 24.8 L27 29.2 L27.8 27 L29.2 27"
        stroke="white" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

// ── 3-D chatbot hero ──────────────────────────────────────────────────────────

const DEMO_MESSAGES = [
  { role: 'user',      text: 'What are symptoms of diabetes?' },
  { role: 'assistant', text: 'Common symptoms include increased thirst, frequent urination, fatigue, and blurred vision. Type 2 is most prevalent — early detection is key.' },
  { role: 'user',      text: 'بخار اور سردرد کیا وجہ ہے؟' },
] as const;

function ChatbotHero3D() {
  const [visibleCount, setVisibleCount] = useState(0);
  const [showTyping, setShowTyping] = useState(false);

  useEffect(() => {
    let i = 0;
    function next() {
      if (i < DEMO_MESSAGES.length) {
        const msg = DEMO_MESSAGES[i];
        if (msg.role === 'assistant') {
          setShowTyping(true);
          setTimeout(() => {
            setShowTyping(false);
            i++;
            setVisibleCount(i);
            setTimeout(next, 1600);
          }, 1400);
        } else {
          i++;
          setVisibleCount(i);
          setTimeout(next, 800);
        }
      } else {
        // loop
        setTimeout(() => { setVisibleCount(0); i = 0; setTimeout(next, 600); }, 3000);
      }
    }
    const t = setTimeout(next, 800);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="relative flex items-center justify-center" style={{ width: 400, minHeight: 460 }}>

      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 70% 60% at 55% 45%, rgba(0,180,216,0.18) 0%, rgba(6,167,125,0.10) 50%, transparent 100%)',
          filter: 'blur(18px)',
        }} />

      {/* DNA helix — decorative, behind card */}
      <div className="absolute left-0 top-8 opacity-40 animate-float-slow pointer-events-none" style={{ width: 52 }}>
        <svg viewBox="0 0 52 200" fill="none">
          {Array.from({ length: 9 }, (_, i) => {
            const y = 10 + i * 20;
            const x1 = 26 + Math.sin((i / 8) * Math.PI * 3) * 18;
            const x2 = 26 - Math.sin((i / 8) * Math.PI * 3) * 18;
            return (
              <g key={i}>
                <line x1={x1} y1={y} x2={x2} y2={y} stroke={i % 2 === 0 ? '#1A5F7A' : '#00B4D8'} strokeWidth="1.5" strokeOpacity="0.6" />
                <circle cx={x1} cy={y} r="3" fill="#00B4D8" fillOpacity="0.7" />
                <circle cx={x2} cy={y} r="3" fill="#06A77D" fillOpacity="0.6" />
              </g>
            );
          })}
        </svg>
      </div>

      {/* 3-D card */}
      <div
        className="relative w-full rounded-2xl overflow-hidden"
        style={{
          transform: 'perspective(1100px) rotateX(6deg) rotateY(-14deg) rotateZ(-1deg)',
          boxShadow: '0 40px 80px -20px rgba(20,30,40,0.30), 0 8px 20px rgba(20,30,40,0.10), inset 0 1px 0 rgba(255,255,255,0.8)',
          background: 'white',
          maxWidth: 360,
          marginLeft: 'auto',
        }}
      >
        {/* Subtle dot-grid bg */}
        <div className="absolute inset-0 dot-grid opacity-30 pointer-events-none" />

        {/* Chat header */}
        <div className="flex items-center gap-2.5 px-4 py-3 bg-bg border-b border-line relative">
          <div className="w-8 h-8 rounded-lg bg-blue flex items-center justify-center flex-shrink-0">
            <svg width="16" height="16" viewBox="0 0 36 36" fill="none">
              <rect x="13" y="6"  width="6.5" height="19" rx="2" fill="white" />
              <rect x="6"  y="13" width="19"  height="6.5" rx="2" fill="white" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-semibold text-ink leading-none">Medilingo AI</div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green animate-pulse" />
              <span className="text-[10px] text-ink-4 font-mono">Online · Medical expert</span>
            </div>
          </div>
          {/* fake browser dots */}
          <div className="flex gap-1">
            <span className="w-2 h-2 rounded-full" style={{ background: '#E5C9C0' }} />
            <span className="w-2 h-2 rounded-full" style={{ background: '#E8DFC2' }} />
            <span className="w-2 h-2 rounded-full" style={{ background: '#C9DECE' }} />
          </div>
        </div>

        {/* Messages */}
        <div className="px-4 py-4 flex flex-col gap-3 min-h-[220px] bg-bg/50">
          {DEMO_MESSAGES.slice(0, visibleCount).map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-up`}
              style={{ animationFillMode: 'both' }}
            >
              {msg.role === 'user' ? (
                <div
                  className={`max-w-[75%] px-3.5 py-2.5 rounded-xl rounded-tr-sm bg-blue text-white text-[12.5px] leading-relaxed shadow-card ${
                    /[؀-ۿ]/.test(msg.text) ? 'font-urdu text-right text-[14px] leading-[1.7]' : ''
                  }`}
                  dir={/[؀-ۿ]/.test(msg.text) ? 'rtl' : 'ltr'}
                >
                  {msg.text}
                </div>
              ) : (
                <div className="max-w-[82%] flex gap-2 items-start">
                  <div className="w-6 h-6 rounded-md bg-blue flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg width="12" height="12" viewBox="0 0 36 36" fill="none">
                      <rect x="13" y="6"  width="6.5" height="19" rx="2" fill="white" />
                      <rect x="6"  y="13" width="19"  height="6.5" rx="2" fill="white" />
                    </svg>
                  </div>
                  <div className="px-3.5 py-2.5 rounded-xl rounded-tl-sm bg-paper border border-line text-[12.5px] text-ink-2 leading-relaxed shadow-card">
                    {msg.text}
                  </div>
                </div>
              )}
            </div>
          ))}

          {showTyping && (
            <div className="flex justify-start animate-fade-in">
              <div className="flex gap-2 items-center">
                <div className="w-6 h-6 rounded-md bg-blue flex items-center justify-center">
                  <svg width="12" height="12" viewBox="0 0 36 36" fill="none">
                    <rect x="13" y="6"  width="6.5" height="19" rx="2" fill="white" />
                    <rect x="6"  y="13" width="19"  height="6.5" rx="2" fill="white" />
                  </svg>
                </div>
                <div className="px-4 py-2.5 rounded-xl rounded-tl-sm bg-paper border border-line shadow-card flex gap-1.5 items-center">
                  {[0, 0.2, 0.4].map((d, k) => (
                    <span key={k} className="w-1.5 h-1.5 rounded-full bg-ink-4 animate-pulse"
                      style={{ animationDelay: `${d}s` }} />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input bar */}
        <div className="px-4 py-3 border-t border-line bg-paper flex items-center gap-2">
          <div className="flex-1 px-3 py-2 rounded-lg bg-bg border border-line text-[12px] text-ink-5">
            Ask a medical question…
          </div>
          <div className="w-8 h-8 rounded-lg bg-blue flex items-center justify-center flex-shrink-0">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
              <path d="M5 12 21 4l-4 17-5-7-7-2Z" />
            </svg>
          </div>
        </div>

        {/* Language pills row */}
        <div className="px-4 py-2 bg-paper border-t border-line flex items-center gap-1.5 flex-wrap">
          <span className="pill pill-blue text-[10px]">English</span>
          <span className="pill pill-teal font-urdu text-[11px]">اردو</span>
          <span className="pill pill-green text-[10px]">Roman Urdu</span>
          <span className="ml-auto text-[10px] text-ink-5 font-mono">No login needed</span>
        </div>
      </div>

      {/* Floating badge — right */}
      <div
        className="absolute glass rounded-xl px-3.5 py-2.5 shadow-card-raised animate-float"
        style={{ top: 20, right: -10, animationDelay: '0.5s' }}
      >
        <div className="text-[10px] text-ink-4 font-mono mb-0.5">SOURCES</div>
        <div className="flex items-center gap-1.5">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#1A5F7A" strokeWidth="1.8" strokeLinecap="round">
            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
          </svg>
          <span className="text-[11px] text-ink font-medium">BNF · WHO · Davidson's</span>
        </div>
      </div>

      {/* Floating badge — bottom left */}
      <div
        className="absolute glass rounded-xl px-3.5 py-2.5 shadow-card-raised animate-float-delay2"
        style={{ bottom: 40, left: -8 }}
      >
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-green-50 border border-green/20 flex items-center justify-center">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#06A77D" strokeWidth="2.5" strokeLinecap="round">
              <path d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <span className="text-[11px] text-ink font-medium">Clinician reviewed</span>
        </div>
      </div>
    </div>
  );
}

// ── ECG decoration ────────────────────────────────────────────────────────────

function ECGDecoration() {
  return (
    <div className="w-full overflow-hidden opacity-25 py-2 pointer-events-none">
      <svg viewBox="0 0 800 40" preserveAspectRatio="none" className="w-full h-8">
        <path
          className="ecg-path"
          d="M0,20 L80,20 L100,20 L115,4 L125,36 L135,20 L155,20
             L200,20 L215,20 L230,5 L240,35 L250,20 L270,20
             L320,20 L335,20 L350,6 L360,34 L370,20 L390,20
             L440,20 L455,20 L470,5 L480,35 L490,20 L510,20
             L560,20 L575,20 L590,4 L600,36 L610,20 L630,20
             L680,20 L695,20 L710,6 L720,34 L730,20 L750,20 L800,20"
          stroke="#1A5F7A" strokeWidth="1.5" fill="none"
          strokeLinecap="round" strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

// ── Top nav ───────────────────────────────────────────────────────────────────

function TopNav() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const authed = isAuthenticated();

  return (
    <nav className="flex items-center justify-between px-6 sm:px-14 py-4 border-b border-line bg-bg/90 sticky top-0 z-40 backdrop-blur-sm">
      <Link to="/" className="inline-flex items-center gap-2.5">
        <MedilingoMark size={28} />
        <span className="font-display font-semibold text-[17px] tracking-tight text-ink leading-none">
          Medilingo
        </span>
      </Link>

      <div className="hidden sm:flex items-center gap-8">
        {['How it works', 'Languages', 'Safety'].map((item) => (
          <span key={item} className="text-sm text-ink-3 hover:text-ink cursor-pointer transition-colors">
            {item}
          </span>
        ))}
      </div>

      <div className="flex items-center gap-2">
        {!authed && (
          <Link to="/login" className="text-sm text-ink-3 hover:text-ink transition-colors px-3 py-2">
            Sign in
          </Link>
        )}
        <Link to="/chat" className="btn-primary text-sm">
          {authed ? 'Open app' : 'Try free'}
        </Link>
      </div>
    </nav>
  );
}

// ── Landing page ──────────────────────────────────────────────────────────────

export function LandingPage() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  useScrollReveal();

  return (
    <div className="min-h-screen bg-bg text-ink flex flex-col">
      <TopNav />

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="gradient-hero px-6 sm:px-14 pt-16 pb-14 overflow-hidden">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-20">

          {/* Left — text */}
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 border border-line-strong rounded-pill text-[12px] text-ink-3 mb-6">
              <span className="live-dot" />
              Trained with physicians at AKU, Shaukat Khanum &amp; DUHS
            </div>

            <h1 className="font-display text-[46px] sm:text-[56px] lg:text-[62px] font-medium leading-[1.04] tracking-[-0.03em] max-w-2xl">
              Your AI medical guide in{' '}
              <span className="gradient-text">any language.</span>
            </h1>

            <p className="mt-5 text-[17px] text-ink-3 max-w-[560px] leading-relaxed">
              Ask in{' '}
              <span className="font-medium text-blue">English</span>,{' '}
              <span className="font-urdu text-teal-600">اردو</span>, or{' '}
              <span className="font-medium text-green">Roman Urdu</span>.
              Get clinician-reviewed answers backed by major medical references — by voice or text.
            </p>

            <div className="mt-8 flex gap-3 items-center flex-wrap justify-center lg:justify-start">
              <Link to="/chat" className="btn-primary btn-lg inline-flex items-center gap-2">
                Ask a question — no login needed
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <path d="M5 12h14M13 5l7 7-7 7" />
                </svg>
              </Link>
              <Link to={isAuthenticated() ? '/chat' : '/register'} className="btn-ghost btn-lg">
                {isAuthenticated() ? 'My sessions' : 'Create account'}
              </Link>
            </div>

            <div className="mt-8 flex items-center gap-5 flex-wrap justify-center lg:justify-start">
              {[
                { icon: '🔒', text: 'No login for guests' },
                { icon: '🌐', text: 'English · اردو · Roman Urdu' },
                { icon: '📖', text: 'Evidence-based' },
              ].map((t) => (
                <div key={t.text} className="flex items-center gap-1.5 text-[12px] text-ink-4">
                  <span>{t.icon}</span>
                  <span>{t.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right — 3D chatbot */}
          <div className="flex-shrink-0 w-full lg:w-auto flex justify-center reveal-right">
            <ChatbotHero3D />
          </div>
        </div>

        {/* ECG decoration below hero */}
        <div className="max-w-6xl mx-auto mt-10">
          <ECGDecoration />
        </div>
      </section>

      {/* ── Scrolling ticker ─────────────────────────────────────────── */}
      <div className="bg-ink text-white overflow-hidden py-3 border-y border-ink/10">
        <div className="flex gap-10 whitespace-nowrap" style={{ animation: 'ticker 28s linear infinite' }}>
          {[
            'Evidence-based medical answers',
            'Voice input in 3 languages',
            'No login needed to start',
            'Clinician-reviewed responses',
            'Sources cited with every answer',
            'British National Formulary',
            "Davidson's Principles of Medicine",
            'WHO clinical guidelines',
            'Ask in اردو or Roman Urdu',
          ].concat([
            'Evidence-based medical answers',
            'Voice input in 3 languages',
            'No login needed to start',
          ]).map((item, i) => (
            <span key={i} className="font-mono text-[11px] text-white/60 flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-teal inline-block" />
              {item}
            </span>
          ))}
        </div>
      </div>
      <style>{`
        @keyframes ticker { from { transform: translateX(0); } to { transform: translateX(-50%); } }
      `}</style>

      {/* ── Features ─────────────────────────────────────────────────── */}
      <section className="bg-paper border-t border-line px-6 sm:px-14 py-20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14 reveal">
            <div className="kicker mb-3">Why Medilingo</div>
            <h2 className="font-display text-[34px] font-medium leading-tight tracking-tight">
              Built for the way Pakistan actually uses healthcare.
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                title: 'Three languages, one answer',
                desc: 'Ask in English, اردو or Roman Urdu. Get the same evidence-backed answer in whichever you chose.',
                icon: (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                    <path d="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18ZM3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
                  </svg>
                ),
                color: '#1A5F7A', bg: 'bg-blue-50', delay: 'delay-100',
              },
              {
                title: 'Cited, not guessed',
                desc: 'Every answer references the medical guideline it came from — WHO, NICE, BNF, or Pakistani clinical protocols.',
                icon: (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                    <path d="M12 3 4 6v6c0 5 3.5 8.5 8 9 4.5-.5 8-4 8-9V6l-8-3Z" />
                  </svg>
                ),
                color: '#06A77D', bg: 'bg-green-50', delay: 'delay-200',
              },
              {
                title: 'Voice first',
                desc: 'Speak your question in any language. Medilingo reads the clinician-reviewed answer back to you.',
                icon: (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                    <path d="M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3ZM5 11a7 7 0 0 0 14 0M12 18v3M8 21h8" />
                  </svg>
                ),
                color: '#00B4D8', bg: 'bg-teal-50', delay: 'delay-300',
              },
            ].map((f) => (
              <div key={f.title} className={`reveal card-3d card p-6 flex flex-col gap-4 ${f.delay}`}>
                <div className={`w-11 h-11 rounded-lg ${f.bg} flex items-center justify-center`} style={{ color: f.color }}>
                  {f.icon}
                </div>
                <div>
                  <div className="text-[15px] font-semibold text-ink mb-2">{f.title}</div>
                  <div className="text-[13px] text-ink-3 leading-relaxed">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────── */}
      <section className="px-6 sm:px-14 py-20 bg-bg">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14 reveal">
            <div className="kicker mb-3">How it works</div>
            <h2 className="font-display text-[34px] font-medium leading-tight tracking-tight">
              From question to answer in seconds.
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 relative">
            <div className="hidden sm:block absolute top-10 left-[33%] w-[34%] h-px bg-line-strong" />
            <div className="hidden sm:block absolute top-10 left-[66%] w-[34%] h-px bg-line-strong" />

            {[
              { step: '01', title: 'Ask your question', desc: 'Type or speak in any of 3 languages. No account needed to start.', color: '#1A5F7A', delay: 'delay-100' },
              { step: '02', title: 'AI finds evidence', desc: 'Semantic search retrieves the most relevant passages across major medical references.', color: '#00B4D8', delay: 'delay-200' },
              { step: '03', title: 'Get your answer', desc: 'A clinician-reviewed response with source citations — in your language, by voice or text.', color: '#06A77D', delay: 'delay-300' },
            ].map((s) => (
              <div key={s.step} className={`reveal flex flex-col items-center text-center gap-4 ${s.delay}`}>
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center font-display font-bold text-[26px] text-white shadow-card-raised"
                  style={{ background: `linear-gradient(135deg, ${s.color}, ${s.color}99)` }}>
                  {s.step}
                </div>
                <div className="font-semibold text-[15px] text-ink">{s.title}</div>
                <div className="text-[13px] text-ink-3 leading-relaxed max-w-[200px]">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Sources strip ─────────────────────────────────────────────── */}
      <section className="bg-paper border-y border-line px-6 sm:px-14 py-12">
        <div className="max-w-5xl mx-auto reveal">
          <div className="kicker text-center mb-6">Knowledge sources</div>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              'British National Formulary',
              'Robbins & Cotran Pathology',
              "Davidson's Medicine",
              'Standard Treatment Guidelines',
              'Differential Diagnosis — Internal Medicine',
            ].map((src) => (
              <div key={src} className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-bg border border-line text-[13px] text-ink-3">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#1A5F7A" strokeWidth="1.6" strokeLinecap="round">
                  <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
                </svg>
                {src}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────── */}
      <section className="px-6 sm:px-14 py-20 flex flex-col items-center text-center reveal">
        <div className="relative">
          <div className="absolute -inset-8 rounded-3xl blur-3xl opacity-20"
            style={{ background: 'radial-gradient(ellipse at center, #1A5F7A, #00B4D8)' }} />
          <div className="relative bg-ink rounded-2xl px-10 py-14 max-w-2xl text-white shadow-browser">
            <div className="kicker text-white/50 mb-4">Start now · no login needed</div>
            <h2 className="font-display text-[38px] font-medium tracking-tight leading-tight mb-4">
              Your medical question<br />deserves a real answer.
            </h2>
            <p className="text-white/60 text-[15px] max-w-md mx-auto leading-relaxed mb-8">
              No installation. No account required. Just ask — in any language.
            </p>
            <div className="flex gap-3 flex-wrap justify-center">
              <Link to="/chat" className="inline-flex items-center gap-2 px-6 py-3.5 rounded-lg bg-white text-ink font-medium text-[15px] hover:bg-paper-2 transition-colors">
                Ask a question free
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <path d="M5 12h14M13 5l7 7-7 7" />
                </svg>
              </Link>
              <Link to="/register" className="inline-flex items-center gap-2 px-6 py-3.5 rounded-lg border border-white/20 text-white/80 font-medium text-[15px] hover:bg-white/10 transition-colors">
                Create account to save history
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <footer className="border-t border-line bg-paper px-6 sm:px-14 py-10">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <MedilingoMark size={24} />
            <span className="font-display font-semibold text-sm tracking-tight text-ink">Medilingo</span>
          </div>
          <div className="flex items-center gap-6 flex-wrap">
            <Link to="/login"    className="text-[13px] text-ink-4 hover:text-ink transition-colors">Sign in</Link>
            <Link to="/register" className="text-[13px] text-ink-4 hover:text-ink transition-colors">Register</Link>
            <Link to="/chat"     className="text-[13px] text-ink-4 hover:text-ink transition-colors">Try free</Link>
            <span className="text-[13px] text-ink-4 cursor-default">Privacy</span>
          </div>
          <div className="text-[12px] text-ink-5">
            © {new Date().getFullYear()} Medilingo. Information only — not a substitute for medical advice.
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
