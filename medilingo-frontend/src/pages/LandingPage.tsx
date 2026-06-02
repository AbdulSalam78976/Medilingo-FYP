import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../hooks/useAuthStore';

// ── Brand mark ────────────────────────────────────────────────────────────────

function MedilingoMark({ size = 22, invert = false }: { size?: number; invert?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none" style={{ display: 'block', flexShrink: 0 }}>
      <rect width="36" height="36" rx="9" fill={invert ? 'white' : '#1A5F7A'} />
      <rect x="14.5" y="8"   width="7"  height="20" rx="2.5" fill={invert ? '#1A5F7A' : 'white'} />
      <rect x="8"    y="14.5" width="20" height="7"  rx="2.5" fill={invert ? '#1A5F7A' : 'white'} />
      <circle cx="27" cy="27" r="5.5" fill="#06A77D" />
      <path d="M24 27 L25.5 27 L26.2 24.8 L27 29.2 L27.8 27 L29.2 27"
        stroke="white" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

// ── Atmospheric background ────────────────────────────────────────────────────

function HeroBg() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }} aria-hidden="true">

      {/* Gradient glows */}
      <div className="absolute rounded-full" style={{
        top: '-18%', right: '-8%', width: '72vmax', height: '72vmax',
        background: 'radial-gradient(circle, rgba(0,180,216,.17) 0%, rgba(26,95,122,.07) 42%, transparent 68%)',
        filter: 'blur(50px)',
      }} />
      <div className="absolute rounded-full" style={{
        bottom: '-22%', left: '-10%', width: '66vmax', height: '66vmax',
        background: 'radial-gradient(circle, rgba(6,167,125,.13) 0%, rgba(6,167,125,.04) 45%, transparent 70%)',
        filter: 'blur(50px)',
      }} />
      <div className="absolute rounded-full" style={{
        top: '35%', left: '50%', transform: 'translate(-50%, -50%)',
        width: '48vmax', height: '48vmax',
        background: 'radial-gradient(circle, rgba(26,95,122,.08) 0%, transparent 65%)',
        filter: 'blur(70px)',
      }} />

      {/* Faint dot-grid */}
      <div className="absolute inset-0 dot-grid opacity-30" style={{
        WebkitMaskImage: 'radial-gradient(ellipse 78% 68% at 50% 44%, #000 22%, transparent 100%)',
        maskImage: 'radial-gradient(ellipse 78% 68% at 50% 44%, #000 22%, transparent 100%)',
      }} />

      {/* ECG sweep */}
      <svg
        className="absolute left-0 right-0 w-full"
        style={{ bottom: '13%', height: 120, opacity: .3 }}
        viewBox="0 0 1440 120" preserveAspectRatio="none"
      >
        <path
          d="M0 60 H340 l18 0 l14 -50 l20 100 l16 -80 l16 30 H500 l520 0 l16 0 l14 -42 l18 84 l14 -64 l16 22 H1220 H1440"
          fill="none" stroke="#00B4D8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
          strokeDasharray="2800" strokeDashoffset="2800"
          style={{ animation: 'bgTrace 7s linear infinite' }}
        />
      </svg>


      {/* ── DNA helix — top left ───────────────────────────────── */}
      <svg className="absolute" style={{ top: '6%', left: '3%', opacity: .13, animation: 'bgDrift 11s ease-in-out 0s infinite' }}
        width="80" height="160" viewBox="0 0 80 160" fill="none"
        stroke="#1A5F7A" strokeWidth="2" strokeLinecap="round">
        {/* left strand */}
        <path d="M15 0 C45 20 45 40 15 60 C45 80 45 100 15 120 C45 140 45 160 15 180" strokeOpacity=".9"/>
        {/* right strand */}
        <path d="M65 0 C35 20 35 40 65 60 C35 80 35 100 65 120 C35 140 35 160 65 180" strokeOpacity=".9"/>
        {/* rungs */}
        {[12, 30, 48, 72, 90, 108, 132, 150].map((y, i) => (
          <line key={i} x1="15" y1={y} x2="65" y2={y} strokeOpacity=".5" stroke="#00B4D8" />
        ))}
        {/* strand dots */}
        {[0, 60, 120].map((y, i) => (
          <circle key={i} cx="15" cy={y} r="4" fill="#1A5F7A" stroke="none" fillOpacity=".7" />
        ))}
        {[0, 60, 120].map((y, i) => (
          <circle key={i} cx="65" cy={y} r="4" fill="#00B4D8" stroke="none" fillOpacity=".7" />
        ))}
      </svg>

      {/* ── Stethoscope — right side ───────────────────────────── */}
      <svg className="absolute" style={{ top: '18%', right: '4%', opacity: .12, animation: 'bgDrift 13s ease-in-out 1.5s infinite' }}
        width="110" height="130" viewBox="0 0 110 130" fill="none"
        stroke="#00B4D8" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        {/* earpieces */}
        <path d="M22 10 C22 20 28 24 28 34" />
        <path d="M88 10 C88 20 82 24 82 34" />
        {/* tubing down */}
        <path d="M28 34 C28 60 55 72 55 90" />
        <path d="M82 34 C82 60 55 72 55 90" />
        {/* chest piece circle */}
        <circle cx="55" cy="108" r="18" stroke="#1A5F7A" strokeWidth="2.5" />
        <circle cx="55" cy="108" r="10" stroke="#06A77D" strokeWidth="1.5" fill="none" />
        {/* earpiece tips */}
        <circle cx="22" cy="8"  r="4" fill="#00B4D8" fillOpacity=".6" stroke="none" />
        <circle cx="88" cy="8"  r="4" fill="#00B4D8" fillOpacity=".6" stroke="none" />
        {/* ECG inside chest piece */}
        <path d="M44 108 L49 108 L51 103 L54 113 L56 108 L61 108" stroke="#06A77D" strokeWidth="1.5" />
      </svg>

      {/* ── DNA helix — bottom right ───────────────────────────── */}
      <svg className="absolute" style={{ bottom: '8%', right: '5%', opacity: .11, animation: 'bgDrift 14s ease-in-out 2.5s infinite' }}
        width="70" height="140" viewBox="0 0 80 160" fill="none"
        stroke="#06A77D" strokeWidth="2" strokeLinecap="round">
        <path d="M15 0 C45 20 45 40 15 60 C45 80 45 100 15 120 C45 140 45 160 15 180" />
        <path d="M65 0 C35 20 35 40 65 60 C35 80 35 100 65 120 C35 140 35 160 65 180" />
        {[12, 30, 48, 72, 90, 108, 132, 150].map((y, i) => (
          <line key={i} x1="15" y1={y} x2="65" y2={y} strokeOpacity=".45" stroke="#1A5F7A" />
        ))}
        {[60, 120].map((y, i) => (
          <circle key={i} cx="15" cy={y} r="4" fill="#06A77D" stroke="none" fillOpacity=".7" />
        ))}
        {[0, 60, 120].map((y, i) => (
          <circle key={i} cx="65" cy={y} r="4" fill="#1A5F7A" stroke="none" fillOpacity=".7" />
        ))}
      </svg>

      {/* ── Pill / capsule — top right ─────────────────────────── */}
      <svg className="absolute" style={{ top: '8%', right: '22%', opacity: .11, animation: 'bgDrift 9s ease-in-out 0.8s infinite' }}
        width="72" height="36" viewBox="0 0 72 36" fill="none">
        <rect x="2" y="2" width="68" height="32" rx="16" stroke="#1A5F7A" strokeWidth="2" />
        <line x1="36" y1="2" x2="36" y2="34" stroke="#1A5F7A" strokeWidth="1.5" strokeOpacity=".5" />
        <rect x="2" y="2" width="34" height="32" rx="16" fill="#1A5F7A" fillOpacity=".12" />
        <rect x="36" y="2" width="34" height="32" rx="16" fill="#00B4D8" fillOpacity=".12" />
      </svg>

      {/* ── Syringe — bottom left ──────────────────────────────── */}
      <svg className="absolute" style={{ bottom: '20%', left: '4%', opacity: .11, animation: 'bgDrift 12s ease-in-out 3s infinite' }}
        width="130" height="50" viewBox="0 0 130 50" fill="none"
        stroke="#06A77D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {/* needle */}
        <line x1="2" y1="25" x2="22" y2="25" stroke="#1A5F7A" strokeWidth="1.5" />
        {/* barrel */}
        <rect x="22" y="14" width="80" height="22" rx="4" stroke="#06A77D" />
        {/* plunger rod */}
        <line x1="102" y1="25" x2="128" y2="25" />
        {/* plunger handle */}
        <line x1="122" y1="14" x2="122" y2="36" strokeWidth="2.5" />
        {/* graduation marks */}
        {[38, 52, 66, 80, 94].map((x, i) => (
          <line key={i} x1={x} y1="18" x2={x} y2="32" stroke="#00B4D8" strokeWidth="1.2" strokeOpacity=".6" />
        ))}
        {/* liquid fill */}
        <rect x="24" y="16" width="36" height="18" rx="3" fill="#06A77D" fillOpacity=".18" stroke="none" />
      </svg>

      {/* ── Molecule — left centre ─────────────────────────────── */}
      <svg className="absolute" style={{ top: '42%', left: '5%', opacity: .10, animation: 'bgDrift 10s ease-in-out 1.8s infinite' }}
        width="100" height="100" viewBox="0 0 100 100" fill="none">
        {/* bonds */}
        <line x1="50" y1="50" x2="20" y2="22" stroke="#1A5F7A" strokeWidth="1.8" />
        <line x1="50" y1="50" x2="80" y2="22" stroke="#1A5F7A" strokeWidth="1.8" />
        <line x1="50" y1="50" x2="82" y2="68" stroke="#1A5F7A" strokeWidth="1.8" />
        <line x1="50" y1="50" x2="18" y2="68" stroke="#1A5F7A" strokeWidth="1.8" />
        <line x1="50" y1="50" x2="50" y2="88" stroke="#1A5F7A" strokeWidth="1.8" />
        <line x1="20" y1="22" x2="80" y2="22" stroke="#00B4D8" strokeWidth="1.2" strokeOpacity=".5" />
        <line x1="18" y1="68" x2="82" y2="68" stroke="#00B4D8" strokeWidth="1.2" strokeOpacity=".5" />
        {/* atoms */}
        <circle cx="50" cy="50" r="10" fill="#1A5F7A" fillOpacity=".25" stroke="#1A5F7A" strokeWidth="1.5" />
        <circle cx="20" cy="22" r="7"  fill="#00B4D8" fillOpacity=".2"  stroke="#00B4D8" strokeWidth="1.5" />
        <circle cx="80" cy="22" r="7"  fill="#00B4D8" fillOpacity=".2"  stroke="#00B4D8" strokeWidth="1.5" />
        <circle cx="82" cy="68" r="7"  fill="#06A77D" fillOpacity=".2"  stroke="#06A77D" strokeWidth="1.5" />
        <circle cx="18" cy="68" r="7"  fill="#06A77D" fillOpacity=".2"  stroke="#06A77D" strokeWidth="1.5" />
        <circle cx="50" cy="88" r="7"  fill="#1A5F7A" fillOpacity=".2"  stroke="#1A5F7A" strokeWidth="1.5" />
      </svg>

      {/* ── Pills scattered — top left mid ────────────────────── */}
      <svg className="absolute" style={{ top: '30%', left: '10%', opacity: .09, animation: 'bgDrift 8s ease-in-out 4s infinite' }}
        width="50" height="22" viewBox="0 0 50 22" fill="none">
        <rect x="1" y="1" width="48" height="20" rx="10" stroke="#00B4D8" strokeWidth="1.8" />
        <line x1="25" y1="1" x2="25" y2="21" stroke="#00B4D8" strokeWidth="1.2" strokeOpacity=".5" />
        <rect x="1" y="1" width="24" height="20" rx="10" fill="#00B4D8" fillOpacity=".1" stroke="none" />
      </svg>

      {/* ── Medical cross — top right far ─────────────────────── */}
      <svg className="absolute" style={{ top: '14%', right: '14%', opacity: .10, animation: 'bgDrift 9s ease-in-out 2s infinite' }}
        width="52" height="52" viewBox="0 0 52 52" fill="none">
        <rect x="18" y="2"  width="16" height="48" rx="5" fill="#06A77D" fillOpacity=".2" stroke="#06A77D" strokeWidth="1.8" />
        <rect x="2"  y="18" width="48" height="16" rx="5" fill="#06A77D" fillOpacity=".2" stroke="#06A77D" strokeWidth="1.8" />
      </svg>

      {/* ── Heartbeat line — bottom centre ────────────────────── */}
      <svg className="absolute" style={{ bottom: '5%', left: '28%', opacity: .12, animation: 'bgDrift 15s ease-in-out 0.5s infinite' }}
        width="200" height="50" viewBox="0 0 200 50" fill="none"
        stroke="#1A5F7A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M0 25 H40 L50 5 L60 45 L70 15 L80 35 H110 L120 5 L130 45 L140 15 L150 35 H200" />
        <circle cx="40"  cy="25" r="3" fill="#1A5F7A" stroke="none" fillOpacity=".6" />
        <circle cx="110" cy="25" r="3" fill="#1A5F7A" stroke="none" fillOpacity=".6" />
        <circle cx="150" cy="25" r="3" fill="#1A5F7A" stroke="none" fillOpacity=".6" />
      </svg>

      {/* ── Molecule small — right bottom ─────────────────────── */}
      <svg className="absolute" style={{ bottom: '30%', right: '14%', opacity: .09, animation: 'bgDrift 11s ease-in-out 3.5s infinite' }}
        width="70" height="70" viewBox="0 0 70 70" fill="none">
        <line x1="35" y1="35" x2="12" y2="12" stroke="#00B4D8" strokeWidth="1.5" />
        <line x1="35" y1="35" x2="58" y2="12" stroke="#00B4D8" strokeWidth="1.5" />
        <line x1="35" y1="35" x2="60" y2="50" stroke="#00B4D8" strokeWidth="1.5" />
        <line x1="35" y1="35" x2="10" y2="50" stroke="#00B4D8" strokeWidth="1.5" />
        <circle cx="35" cy="35" r="8"  fill="#00B4D8" fillOpacity=".2" stroke="#00B4D8" strokeWidth="1.5" />
        <circle cx="12" cy="12" r="5"  fill="#1A5F7A" fillOpacity=".2" stroke="#1A5F7A" strokeWidth="1.5" />
        <circle cx="58" cy="12" r="5"  fill="#1A5F7A" fillOpacity=".2" stroke="#1A5F7A" strokeWidth="1.5" />
        <circle cx="60" cy="50" r="5"  fill="#06A77D" fillOpacity=".2" stroke="#06A77D" strokeWidth="1.5" />
        <circle cx="10" cy="50" r="5"  fill="#06A77D" fillOpacity=".2" stroke="#06A77D" strokeWidth="1.5" />
      </svg>
    </div>
  );
}

// ── Medical orb (compact icon above kicker) ───────────────────────────────────

function MedOrb() {
  return (
    <div className="relative flex items-center justify-center mb-9" style={{ width: 132, height: 132 }}>

      {/* Outer halo */}
      <div className="absolute rounded-full pointer-events-none" style={{
        inset: -26,
        background: 'radial-gradient(circle at 50% 42%, rgba(0,180,216,.28), transparent 65%)',
        filter: 'blur(14px)',
      }} />

      {/* Inner fade ring */}
      <div className="absolute rounded-full pointer-events-none" style={{
        inset: -12,
        border: '1px solid rgba(26,95,122,.18)',
        WebkitMaskImage: 'linear-gradient(to bottom, #000 25%, transparent 80%)',
        maskImage: 'linear-gradient(to bottom, #000 25%, transparent 80%)',
      }} />

      {/* Spinning dashed ring */}
      <div className="absolute rounded-full pointer-events-none" style={{
        inset: -24,
        border: '1px dashed rgba(0,180,216,.22)',
        animation: 'orbSpin 24s linear infinite',
      }} />

      {/* Body */}
      <div
        className="relative rounded-full flex items-center justify-center"
        style={{
          width: 132, height: 132,
          background: 'linear-gradient(145deg, #ddeef5 0%, #c6e4ef 50%, #b8d8e8 100%)',
          border: '1px solid rgba(26,95,122,.14)',
          boxShadow: '0 22px 48px -18px rgba(26,95,122,.38), inset 0 1px 0 rgba(255,255,255,.85)',
          animation: 'orbBob 5.5s ease-in-out infinite',
        }}
      >
        <svg width="58" height="58" viewBox="0 0 58 58" fill="none">
          <rect x="25" y="10" width="8" height="38" rx="4" fill="#1A5F7A" opacity=".85" />
          <rect x="10" y="25" width="38" height="8" rx="4" fill="#1A5F7A" opacity=".85" />
          <circle cx="29" cy="29" r="10" fill="#00B4D8" opacity=".16" />
          <circle cx="21" cy="29" r="2.8" fill="#00B4D8" opacity=".45" />
          <circle cx="29" cy="29" r="2.8" fill="#00B4D8" opacity=".65" />
          <circle cx="37" cy="29" r="2.8" fill="#00B4D8" opacity=".45" />
        </svg>
      </div>
    </div>
  );
}

// ── Chat preview ──────────────────────────────────────────────────────────────

function ChatPreview() {
  return (
    <div
      className="w-full flex flex-col gap-2.5"
      style={{ maxWidth: 420 }}
      role="presentation" aria-hidden="true"
    >
      {/* Urdu user query */}
      <div className="flex justify-end" style={{ animation: 'bubbleIn .45s cubic-bezier(.2,.8,.2,1) .9s both' }}>
        <div
          className="px-4 py-3 rounded-2xl rounded-tr-sm text-white text-[14.5px] leading-[1.75] shadow-card"
          style={{
            background: '#1A5F7A',
            fontFamily: "'Noto Nastaliq Urdu', serif",
            direction: 'rtl',
            maxWidth: '82%',
            boxShadow: '0 4px 16px -6px rgba(26,95,122,.45)',
          }}
        >
          بلڈ پریشر بڑھنے کی وجوہات کیا ہیں؟
        </div>
      </div>

      {/* AI response in Urdu with citation */}
      <div className="flex items-end gap-2" style={{ animation: 'bubbleIn .45s cubic-bezier(.2,.8,.2,1) 1.6s both' }}>
        <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mb-0.5"
          style={{ background: 'linear-gradient(135deg,#1A5F7A,#0c8aaa)', boxShadow: '0 2px 8px -3px rgba(26,95,122,.5)' }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12h3.5l2.5-6 4 12 3-6H21" />
          </svg>
        </div>
        <div
          className="glass rounded-2xl rounded-bl-sm px-4 py-3 text-ink-2"
          style={{ maxWidth: '82%', boxShadow: '0 4px 16px -8px rgba(13,27,42,.12)' }}
        >
          <span
            style={{
              fontFamily: "'Noto Nastaliq Urdu', serif",
              fontSize: 15, lineHeight: 1.85, direction: 'rtl',
              display: 'block', textAlign: 'right',
            }}
          >
            ہائی بلڈ پریشر کی اہم وجوہات میں زیادہ نمک، موٹاپا اور تناؤ شامل ہیں۔
          </span>
          <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-line text-[11.5px] text-teal-600">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            WHO Hypertension Guidelines 2023
          </div>
        </div>
      </div>

      {/* English follow-up */}
      <div className="flex justify-end" style={{ animation: 'bubbleIn .45s cubic-bezier(.2,.8,.2,1) 2.4s both' }}>
        <div
          className="px-4 py-2.5 rounded-2xl rounded-tr-sm text-white text-[13.5px] leading-relaxed shadow-card"
          style={{ background: '#1A5F7A', maxWidth: '82%', boxShadow: '0 4px 16px -6px rgba(26,95,122,.45)' }}
        >
          What lifestyle changes help the most?
        </div>
      </div>
    </div>
  );
}

// ── Landing page ──────────────────────────────────────────────────────────────

export function LandingPage() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const authed = isAuthenticated();

  return (
    <div className="h-screen bg-bg text-ink flex flex-col overflow-hidden relative">

      <style>{`
        @keyframes bgTrace  { to { stroke-dashoffset: 0; } }
        @keyframes bgDrift  { 0%,100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-18px) rotate(5deg); } }
        @keyframes orbSpin  { to { transform: rotate(360deg); } }
        @keyframes orbBob   { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-11px); } }
        @keyframes bubbleIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes heroRise { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
        .hero-rise-1 { animation: heroRise .8s cubic-bezier(.2,.7,.2,1) .04s both; }
        .hero-rise-2 { animation: heroRise .8s cubic-bezier(.2,.7,.2,1) .12s both; }
        .hero-rise-3 { animation: heroRise .8s cubic-bezier(.2,.7,.2,1) .20s both; }
        .hero-rise-4 { animation: heroRise .8s cubic-bezier(.2,.7,.2,1) .28s both; }
        .hero-rise-5 { animation: heroRise .8s cubic-bezier(.2,.7,.2,1) .36s both; }
        .hero-rise-6 { animation: heroRise .8s cubic-bezier(.2,.7,.2,1) .44s both; }
        @media (prefers-reduced-motion: reduce) {
          .hero-rise-1,.hero-rise-2,.hero-rise-3,.hero-rise-4,.hero-rise-5,.hero-rise-6 {
            animation: none; opacity: 1; transform: none;
          }
        }
      `}</style>

      <HeroBg />

      {/* ── Nav ───────────────────────────────────────────────────────────── */}
      <nav className="relative z-10 flex-shrink-0 flex items-center justify-between
                      px-6 sm:px-12 lg:px-16 py-4 hero-rise-1">
        <Link to="/" className="inline-flex items-center gap-2.5" aria-label="MediLingo home">
          <MedilingoMark size={28} />
          <span className="font-display font-semibold text-[17px] tracking-tight text-ink leading-none">
            MediLingo
          </span>
        </Link>
        <div className="flex items-center gap-2">
          {!authed && (
            <Link to="/login" className="text-sm text-ink-3 hover:text-ink transition-colors px-3 py-2">
              Sign in
            </Link>
          )}
          <Link to={authed ? '/chat' : '/register'} className="btn-primary text-sm">
            {authed ? 'Open app' : 'Get started'}
          </Link>
        </div>
      </nav>

      {/* ── Hero — fills remaining viewport, never scrolls ────────────────── */}
      <main className="relative z-10 flex-1 flex items-center overflow-hidden
                       px-6 sm:px-12 lg:px-16 pb-4">
        <div className="w-full max-w-6xl mx-auto flex flex-col lg:flex-row
                        items-center gap-8 lg:gap-14">

          {/* ── Left: copy ────────────────────────────────────────────────── */}
          <div className="flex-1 flex flex-col items-center lg:items-start
                          text-center lg:text-left min-w-0">

            {/* Kicker */}
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-pill
                             border border-line-strong bg-paper/70 backdrop-blur-sm
                             text-[11px] font-medium tracking-[.055em] uppercase
                             text-ink-3 mb-4 hero-rise-2">
              <span className="live-dot" />
              Multilingual Medical AI
            </span>

            {/* Headline */}
            <h1
              className="font-display font-medium leading-[.94] tracking-[-0.038em] text-ink hero-rise-3"
              style={{ fontSize: 'clamp(36px, 4.8vw, 72px)' } as CSSProperties}
            >
              Medicine in<br />
              <span className="gradient-text" style={{ fontStyle: 'italic' }}>your language.</span>
            </h1>

            {/* Language chips */}
            <div className="flex items-center gap-2 flex-wrap mt-4 hero-rise-3">
              <span className="pill pill-blue text-[12px]">English</span>
              <span className="text-ink-5 select-none leading-none" aria-hidden="true">·</span>
              <span className="pill pill-teal font-urdu" style={{ fontSize: 14, letterSpacing: 0 }}>اردو</span>
              <span className="text-ink-5 select-none leading-none" aria-hidden="true">·</span>
              <span className="pill text-[12px]">Roman Urdu</span>
            </div>

            {/* Lede */}
            <p
              className="mt-4 text-ink-3 leading-relaxed hero-rise-4"
              style={{ fontSize: 'clamp(14px, 1.1vw, 17px)', maxWidth: '38em' } as CSSProperties}
            >
              Ask medical questions by voice or text. Every answer is drawn from{' '}
              <strong className="font-semibold text-ink-2">verified clinical documents</strong>
              {' '}— not model memory — and cites its source.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-2.5 mt-5 hero-rise-5">
              <Link to="/chat" className="btn-primary btn-lg inline-flex items-center gap-2">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3ZM5 11a7 7 0 0 0 14 0M12 18v3M8 21h8" />
                </svg>
                Ask by voice
              </Link>
              <Link to="/chat" className="btn-ghost btn-lg inline-flex items-center gap-2">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                Type a question
              </Link>
            </div>

            <p className="mt-2.5 text-[12px] text-ink-4 hero-rise-5">
              No account needed for your first five questions
            </p>

            {/* Stats */}
            <div className="flex gap-6 sm:gap-10 mt-6 pt-5 border-t border-line hero-rise-6">
              {[
                { k: '3 languages', v: 'voice & text' },
                { k: 'RAG-grounded', v: 'no hallucinations' },
                { k: 'Source-cited', v: 'every response' },
              ].map((s) => (
                <div key={s.k}>
                  <div className="font-mono font-medium text-[15px] text-ink">{s.k}</div>
                  <div className="text-[11.5px] text-ink-4 mt-0.5">{s.v}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right: animated chat preview ──────────────────────────────── */}
          <div className="hidden lg:flex flex-shrink-0 items-center hero-rise-4">
            <ChatPreview />
          </div>

        </div>
      </main>
    </div>
  );
}

export default LandingPage;
