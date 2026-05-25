// Brand foundations strip: logo + palette + type + voice.

function BrandStrip() {
  const swatches = [
    { name: 'Medical Blue', hex: '#1A5F7A', var: '--ml-blue', ink: '#fff' },
    { name: 'Vibrant Teal', hex: '#00B4D8', var: '--ml-teal', ink: '#fff' },
    { name: 'Health Green', hex: '#06A77D', var: '--ml-green', ink: '#fff' },
    { name: 'Warm Off-white', hex: '#FAFAF7', var: '--ml-bg', ink: '#14171C' },
    { name: 'Ink', hex: '#14171C', var: '--ml-ink', ink: '#fff' },
    { name: 'Caution', hex: '#B07A2B', var: '--ml-amber', ink: '#fff' },
  ];
  return (
    <div className="ml" style={{ width: 1280, padding: 56, background: 'var(--ml-bg)' }}>
      {/* Top row: logo + tagline */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 56 }}>
        <div>
          <div className="ml-kicker" style={{ marginBottom: 16 }}>Brand · v1 · May 2026</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <MedlingoMark size={44} />
            <span style={{ fontFamily: 'var(--ml-display)', fontWeight: 600, fontSize: 56, letterSpacing: '-0.03em', lineHeight: 1 }}>Medlingo</span>
          </div>
          <div style={{ marginTop: 14, fontFamily: 'var(--ml-display)', fontStyle: 'italic', fontSize: 18, color: 'var(--ml-ink-3)' }}>
            Health, in the language you think in.
          </div>
        </div>
        <div style={{ display: 'flex', gap: 24, textAlign: 'right' }}>
          <div>
            <div className="ml-kicker" style={{ marginBottom: 6 }}>Display</div>
            <div style={{ fontFamily: 'var(--ml-display)', fontWeight: 500, fontSize: 22 }}>Instrument Sans</div>
          </div>
          <div>
            <div className="ml-kicker" style={{ marginBottom: 6 }}>UI</div>
            <div style={{ fontFamily: 'var(--ml-sans)', fontWeight: 500, fontSize: 22 }}>Geist</div>
          </div>
          <div>
            <div className="ml-kicker" style={{ marginBottom: 6 }}>Urdu</div>
            <div style={{ fontFamily: 'var(--ml-urdu)', fontWeight: 500, fontSize: 22 }}>نسخ</div>
          </div>
        </div>
      </div>

      {/* Palette */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 12 }}>
        {swatches.map((s) => (
          <div key={s.hex} style={{ border: '1px solid var(--ml-line)', borderRadius: 14, overflow: 'hidden', background: 'var(--ml-paper)' }}>
            <div style={{ background: s.hex, height: 120, padding: 14, display: 'flex', alignItems: 'flex-end' }}>
              <span style={{ color: s.ink, fontFamily: 'var(--ml-mono)', fontSize: 11, letterSpacing: '0.05em' }}>{s.hex}</span>
            </div>
            <div style={{ padding: '12px 14px' }}>
              <div style={{ fontWeight: 500, fontSize: 13 }}>{s.name}</div>
              <div className="ml-mono" style={{ color: 'var(--ml-ink-4)', fontSize: 11, marginTop: 2 }}>{s.var}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Type specimens */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 24, marginTop: 56 }}>
        <div>
          <div className="ml-kicker" style={{ marginBottom: 10 }}>English</div>
          <div className="ml-display" style={{ fontSize: 32, lineHeight: 1.1 }}>
            Your health deserves your language.
          </div>
          <div style={{ marginTop: 10, fontSize: 14, color: 'var(--ml-ink-3)', lineHeight: 1.5 }}>
            Ask any medical question — get a clear, evidence-aligned answer in plain words.
          </div>
        </div>
        <div dir="rtl">
          <div className="ml-kicker" style={{ marginBottom: 10, direction: 'ltr', textAlign: 'right' }}>اردو</div>
          <div className="ur" style={{ fontSize: 32, lineHeight: 1.3, fontWeight: 600 }}>
            آپ کی صحت آپ کی زبان کی مستحق ہے۔
          </div>
          <div className="ur" style={{ marginTop: 10, fontSize: 16, color: 'var(--ml-ink-3)', lineHeight: 1.7 }}>
            کوئی بھی طبی سوال پوچھیں — سادہ الفاظ میں واضح، تحقیق پر مبنی جواب حاصل کریں۔
          </div>
        </div>
        <div>
          <div className="ml-kicker" style={{ marginBottom: 10 }}>Roman Urdu</div>
          <div className="ml-display" style={{ fontSize: 32, lineHeight: 1.15, fontStyle: 'italic' }}>
            Aap ki sehat aap ki zubaan ki haqdaar hai.
          </div>
          <div style={{ marginTop: 10, fontSize: 14, color: 'var(--ml-ink-3)', lineHeight: 1.5 }}>
            Koi bhi tibbi sawaal poochiye — saaf alfaaz mein wazeh jawab hasil karein.
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { BrandStrip });
