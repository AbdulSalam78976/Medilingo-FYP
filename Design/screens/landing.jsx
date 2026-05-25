// Landing page — two variations.

function LandingTopNav({ active = 'How it works' }) {
  const items = ['How it works', 'Languages', 'Safety', 'Pricing'];
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px 56px', borderBottom: '1px solid var(--ml-line)' }}>
      <MedlingoWordmark size={18} />
      <div style={{ display: 'flex', gap: 32 }}>
        {items.map((x) => (
          <span key={x} style={{ fontSize: 14, color: x === active ? 'var(--ml-ink)' : 'var(--ml-ink-3)', fontWeight: x === active ? 500 : 400 }}>{x}</span>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <span style={{ fontSize: 14, color: 'var(--ml-ink-3)' }}>Sign in</span>
        <button className="ml-btn ml-btn-primary">Get started</button>
      </div>
    </div>
  );
}

/* ─── Variation A · Editorial ─────────────────────────────────────── */
function LandingA() {
  return (
    <div className="ml" style={{ width: 1280, height: 900, background: 'var(--ml-bg)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <LandingTopNav active="How it works" />

      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 0 }}>
        {/* Left — editorial type */}
        <div style={{ padding: '72px 56px 56px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div className="ml-kicker" style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
              <span className="ml-livedot" />
              <span>Now in clinical preview · Pakistan</span>
            </div>

            <h1 className="ml-display" style={{ fontSize: 76, lineHeight: 0.98, letterSpacing: '-0.03em', margin: 0, fontWeight: 500, color: 'var(--ml-ink)' }}>
              Your health<br/>
              deserves your<br/>
              <span style={{ fontStyle: 'italic', color: 'var(--ml-blue)' }}>language.</span>
            </h1>

            <p style={{ marginTop: 32, fontSize: 18, lineHeight: 1.5, color: 'var(--ml-ink-3)', maxWidth: 480 }}>
              Medlingo answers medical questions in English, اردو and Roman Urdu — by voice or text — citing the guidelines clinicians actually use. Built with physicians at AKU and Shaukat Khanum.
            </p>

            <div style={{ marginTop: 36, display: 'flex', gap: 12, alignItems: 'center' }}>
              <button className="ml-btn ml-btn-primary ml-btn-lg">
                <I name="mic" size={16} /> Ask by voice
              </button>
              <button className="ml-btn ml-btn-ghost ml-btn-lg">
                Try a written question
              </button>
            </div>

            <div style={{ marginTop: 18, fontSize: 13, color: 'var(--ml-ink-4)' }}>
              Free for 5 questions a month · No card required
            </div>
          </div>

          {/* Footer trust row */}
          <div style={{ borderTop: '1px solid var(--ml-line)', paddingTop: 20, display: 'flex', gap: 32 }}>
            {[
              { k: '180K+', v: 'questions answered' },
              { k: '12 hospitals', v: 'clinical advisors' },
              { k: 'HIPAA-aligned', v: 'encryption at rest' },
            ].map((s) => (
              <div key={s.k}>
                <div className="ml-mono" style={{ fontSize: 18, color: 'var(--ml-ink)', fontWeight: 500 }}>{s.k}</div>
                <div style={{ fontSize: 12, color: 'var(--ml-ink-4)', marginTop: 2 }}>{s.v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right — answer-in-three-languages collage */}
        <div style={{ background: 'var(--ml-paper-2)', borderLeft: '1px solid var(--ml-line)', padding: 56, position: 'relative', overflow: 'hidden' }}>
          <div className="ml-kicker" style={{ marginBottom: 18 }}>One question · three languages</div>

          {/* Card 1: English */}
          <div className="ml-card" style={{ padding: 18, marginBottom: 14, boxShadow: '0 1px 0 rgba(20,23,28,0.02)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <span className="ml-pill ml-pill-blue">EN</span>
              <span className="ml-mono" style={{ fontSize: 11, color: 'var(--ml-ink-4)' }}>09:42</span>
            </div>
            <div style={{ fontSize: 14, color: 'var(--ml-ink-2)', lineHeight: 1.5 }}>
              Is it safe to give paracetamol to a 2-year-old with a fever of 39 °C?
            </div>
          </div>

          {/* Card 2: Urdu */}
          <div className="ml-card" dir="rtl" style={{ padding: 18, marginBottom: 14, marginLeft: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, direction: 'ltr' }}>
              <span className="ml-pill ml-pill-teal">اردو</span>
              <span className="ml-mono" style={{ fontSize: 11, color: 'var(--ml-ink-4)' }}>09:43</span>
            </div>
            <div className="ur" style={{ fontSize: 17, color: 'var(--ml-ink-2)', lineHeight: 1.75 }}>
              کیا 2 سال کے بچے کو 39 ڈگری بخار میں پیراسیٹامول دینا محفوظ ہے؟
            </div>
          </div>

          {/* Card 3: Roman Urdu */}
          <div className="ml-card" style={{ padding: 18, marginBottom: 22, marginLeft: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <span className="ml-pill ml-pill-green">RU</span>
              <span className="ml-mono" style={{ fontSize: 11, color: 'var(--ml-ink-4)' }}>09:43</span>
            </div>
            <div style={{ fontSize: 14, color: 'var(--ml-ink-2)', lineHeight: 1.5, fontStyle: 'italic' }}>
              Kya 2 saal ke bachay ko 39 degree bukhar mein paracetamol dena mahfooz hai?
            </div>
          </div>

          {/* Answer summary card */}
          <div className="ml-card" style={{ padding: 20, background: 'var(--ml-ink)', color: '#fff', borderColor: 'var(--ml-ink)' }}>
            <div className="ml-kicker" style={{ color: 'rgba(255,255,255,0.55)', marginBottom: 10 }}>Same answer · referenced</div>
            <div style={{ fontSize: 15, lineHeight: 1.55, color: 'rgba(255,255,255,0.92)' }}>
              Yes — 15&nbsp;mg/kg every 4–6 hours, max 4 doses/24h. Watch for rash, refusal to drink, or lethargy. Call a pediatrician if fever lasts more than 3 days.
            </div>
            <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.12)', fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>
              Cites: WHO IMCI · BNF for Children · NICE NG143
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Variation B · Product-forward ───────────────────────────────── */
function LandingB() {
  return (
    <div className="ml" style={{ width: 1280, height: 900, background: 'var(--ml-bg)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <LandingTopNav active="How it works" />

      <div style={{ padding: '64px 56px 0', textAlign: 'center', flexShrink: 0 }}>
        <div className="ml-kicker" style={{ marginBottom: 20 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 12px', border: '1px solid var(--ml-line-strong)', borderRadius: 999, color: 'var(--ml-ink-3)' }}>
            <span className="ml-livedot" /> Trained with physicians at AKU, Shaukat Khanum & DUHS
          </span>
        </div>
        <h1 className="ml-display" style={{ fontSize: 64, lineHeight: 1.05, letterSpacing: '-0.03em', margin: 0, fontWeight: 500 }}>
          The medical answer engine that<br/>
          speaks <span style={{ fontStyle: 'italic', color: 'var(--ml-blue)' }}>English</span>, <span className="ur" style={{ fontStyle: 'normal' }}>اردو</span> and <span style={{ fontStyle: 'italic', color: 'var(--ml-teal-600)' }}>Roman Urdu</span>.
        </h1>
        <p style={{ marginTop: 22, fontSize: 17, color: 'var(--ml-ink-3)', maxWidth: 700, margin: '22px auto 0', lineHeight: 1.5 }}>
          Ask by voice or text. Get a clinician-reviewed answer, an audio readout, and links to the underlying guidelines — in seconds.
        </p>
        <div style={{ marginTop: 30, display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button className="ml-btn ml-btn-primary ml-btn-lg">Try Medlingo free <I name="arrow" size={16} /></button>
          <button className="ml-btn ml-btn-ghost ml-btn-lg">Watch 90-sec demo</button>
        </div>
      </div>

      {/* Product mock floats below */}
      <div style={{ flex: 1, padding: '48px 56px 0', position: 'relative' }}>
        <div style={{
          width: '100%', maxWidth: 980, margin: '0 auto',
          background: 'var(--ml-paper)', border: '1px solid var(--ml-line)', borderRadius: 18,
          boxShadow: '0 24px 60px -28px rgba(20, 30, 40, 0.18), 0 2px 6px rgba(20, 30, 40, 0.04)',
          overflow: 'hidden',
        }}>
          {/* fake browser chrome */}
          <div style={{ height: 36, background: 'var(--ml-paper-2)', borderBottom: '1px solid var(--ml-line)', display: 'flex', alignItems: 'center', padding: '0 14px', gap: 6 }}>
            <span style={{ width: 10, height: 10, borderRadius: 999, background: '#E5C9C0' }} />
            <span style={{ width: 10, height: 10, borderRadius: 999, background: '#E8DFC2' }} />
            <span style={{ width: 10, height: 10, borderRadius: 999, background: '#C9DECE' }} />
            <div style={{ flex: 1, textAlign: 'center', fontFamily: 'var(--ml-mono)', fontSize: 11, color: 'var(--ml-ink-4)' }}>medlingo.app/ask</div>
          </div>
          <div style={{ padding: 36, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 36, alignItems: 'start' }}>
            <div>
              <div className="ml-kicker" style={{ marginBottom: 12 }}>You asked</div>
              <div style={{ fontFamily: 'var(--ml-display)', fontSize: 22, lineHeight: 1.25, color: 'var(--ml-ink)' }}>
                Can I take ibuprofen with my blood pressure medicine, ramipril?
              </div>
              <div style={{ marginTop: 16, display: 'flex', gap: 6 }}>
                <span className="ml-pill ml-pill-blue">English</span>
                <span className="ml-pill">Voice · 7 sec</span>
              </div>
            </div>
            <div>
              <div className="ml-kicker" style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                Medlingo says <span className="ml-livedot" />
              </div>
              <div style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--ml-ink-2)' }}>
                <strong style={{ color: 'var(--ml-ink)' }}>Generally, no — not regularly.</strong> Ibuprofen can blunt the blood-pressure-lowering effect of ramipril and stress your kidneys, especially with long-term use. For occasional pain, paracetamol is safer.
              </div>
              <div style={{ marginTop: 14, display: 'flex', gap: 10, alignItems: 'center', padding: '10px 12px', background: 'var(--ml-blue-50)', borderRadius: 10 }}>
                <I name="speaker" size={14} color="var(--ml-blue)" />
                <div style={{ flex: 1, height: 4, borderRadius: 999, background: 'rgba(26,95,122,0.18)' }}>
                  <div style={{ width: '38%', height: '100%', background: 'var(--ml-blue)', borderRadius: 999 }} />
                </div>
                <span className="ml-mono" style={{ fontSize: 11, color: 'var(--ml-blue)' }}>0:24 / 1:03</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { LandingA, LandingB });
