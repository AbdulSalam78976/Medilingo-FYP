// Shared bits for Medlingo screens: logo, icons, placeholder photo.

function MedlingoMark({ size = 22, color = 'var(--ml-blue)' }) {
  // Geometric mark: a square frame with a "speech wave" notch — reads as
  // "language inside a clinic card". Original, simple, geometric only.
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" style={{ display: 'block' }}>
      <rect x="2" y="2" width="28" height="28" rx="7" stroke={color} strokeWidth="2" />
      <path d="M9 13.5 V18.5 M13 11 V21 M17 9 V23 M21 12 V20 M25 14.5 V17.5" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function MedlingoWordmark({ size = 18, color = 'var(--ml-ink)', markColor = 'var(--ml-blue)' }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color }}>
      <MedlingoMark size={Math.round(size * 1.15)} color={markColor} />
      <span style={{
        fontFamily: 'var(--ml-display)',
        fontWeight: 600,
        fontSize: size,
        letterSpacing: '-0.02em',
        lineHeight: 1,
      }}>
        Medlingo
      </span>
    </div>
  );
}

// Generic icon helper — strokes only.
function Icon({ d, size = 16, color = 'currentColor', strokeWidth = 1.6, fill = 'none' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block', flex: '0 0 auto' }}>
      <path d={d} />
    </svg>
  );
}

const ICONS = {
  search: 'M11 4a7 7 0 1 1 0 14 7 7 0 0 1 0-14ZM20 20l-3.5-3.5',
  mic: 'M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3ZM5 11a7 7 0 0 0 14 0M12 18v3M8 21h8',
  send: 'M5 12 21 4l-4 17-5-7-7-2Z',
  arrow: 'M5 12h14M13 5l7 7-7 7',
  arrowLeft: 'M19 12H5M11 19l-7-7 7-7',
  play: 'M7 4v16l13-8Z',
  pause: 'M8 5v14M16 5v14',
  download: 'M12 4v12m0 0 4-4m-4 4-4-4M5 19h14',
  share: 'M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7M16 6l-4-4-4 4M12 2v14',
  copy: 'M9 9h10a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V10a1 1 0 0 1 1-1ZM4 15V4a1 1 0 0 1 1-1h11',
  more: 'M5 12h.01M12 12h.01M19 12h.01',
  settings: 'M12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8ZM19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1A2 2 0 1 1 4.4 17l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1A2 2 0 1 1 7 4.4l.1.1a1.7 1.7 0 0 0 1.8.3h.1a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8v.1a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z',
  bell: 'M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10 21a2 2 0 0 0 4 0',
  history: 'M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5M12 7v5l3 2',
  chat: 'M21 12a8 8 0 0 1-11.6 7.1L4 21l1.9-5.4A8 8 0 1 1 21 12Z',
  globe: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18ZM3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18',
  shield: 'M12 3 4 6v6c0 5 3.5 8.5 8 9 4.5-.5 8-4 8-9V6l-8-3Z',
  sparkle: 'M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8',
  check: 'M5 13l4 4L19 7',
  plus: 'M12 5v14M5 12h14',
  pin: 'M12 3v8M5 11h14l-2 5H7l-2-5ZM12 16v5',
  filter: 'M3 5h18M6 12h12M10 19h4',
  warning: 'M12 3 2 21h20L12 3ZM12 10v5M12 18h.01',
  speaker: 'M11 5 6 9H3v6h3l5 4V5ZM16 9a4 4 0 0 1 0 6M19 6a8 8 0 0 1 0 12',
  pill: 'M10.5 3.5a5 5 0 0 0-7 7l10 10a5 5 0 0 0 7-7l-10-10ZM7 7l10 10',
  heart: 'M12 21s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 5.5-7 10-7 10Z',
  brain: 'M9 3a3 3 0 0 0-3 3 3 3 0 0 0-2 5 3 3 0 0 0 0 4 3 3 0 0 0 2 5 3 3 0 0 0 3 3V3ZM15 3a3 3 0 0 1 3 3 3 3 0 0 1 2 5 3 3 0 0 1 0 4 3 3 0 0 1-2 5 3 3 0 0 1-3 3V3Z',
  baby: 'M9 12a3 3 0 0 0 6 0M9 9h.01M15 9h.01M5 13a7 7 0 0 0 14 0V8a7 7 0 0 0-14 0v5Z',
  bug: 'M12 3v2M12 19v2M5 8 3 6M19 8l2-2M5 16l-2 2M19 16l2 2M8 8h8a4 4 0 0 1 4 4v3a8 8 0 0 1-16 0v-3a4 4 0 0 1 4-4Z',
  dumbbell: 'M5 9v6M19 9v6M3 11v2M21 11v2M7 7v10M17 7v10M7 12h10',
};
function I({ name, ...rest }) { return <Icon d={ICONS[name]} {...rest} />; }

// Subtle striped placeholder image
function PhotoSlot({ width = '100%', height = 220, label = 'illustration', tone = 'blue', radius = 14, style = {} }) {
  const tones = {
    blue: { bg: '#EAF3F7', stripe: '#D7E6EE', ink: '#587684' },
    paper: { bg: '#F4F4EE', stripe: '#EAEAE0', ink: '#7F7A6D' },
    teal: { bg: '#E0F7FC', stripe: '#C9EEF6', ink: '#1F7E94' },
  };
  const t = tones[tone] || tones.blue;
  return (
    <div style={{
      width, height,
      borderRadius: radius,
      background: `repeating-linear-gradient(135deg, ${t.bg} 0 14px, ${t.stripe} 14px 15px)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: t.ink, fontFamily: 'var(--ml-mono)', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase',
      ...style,
    }}>
      {label}
    </div>
  );
}

Object.assign(window, { MedlingoMark, MedlingoWordmark, Icon, I, ICONS, PhotoSlot });
