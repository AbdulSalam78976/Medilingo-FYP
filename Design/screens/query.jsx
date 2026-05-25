// Query input — two variations.

/* ─── Variation A · Focused minimal · the "stage" ─────────────────── */
function QueryA() {
  return (
    <div className="ml" style={{ width: 1280, height: 900, background: 'var(--ml-bg)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Slim top */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <button className="ml-btn ml-btn-quiet" style={{ padding: 8 }}>
            <I name="arrowLeft" size={16} />
          </button>
          <MedlingoWordmark size={16} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span className="ml-pill"><I name="shield" size={11} /> Encrypted</span>
          <div style={{ width: 28, height: 28, borderRadius: 999, background: 'var(--ml-blue)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 500 }}>AS</div>
        </div>
      </div>

      {/* Center stage */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 80px', position: 'relative' }}>

        <div className="ml-kicker" style={{ marginBottom: 18 }}>New question</div>
        <h1 className="ml-display" style={{ fontSize: 48, lineHeight: 1.05, margin: 0, fontWeight: 500, textAlign: 'center', letterSpacing: '-0.02em' }}>
          What's on your mind?
        </h1>
        <div style={{ marginTop: 12, fontSize: 15, color: 'var(--ml-ink-3)' }}>
          Type, or hold the mic and speak — in any language.
        </div>

        {/* Big textarea */}
        <div style={{ width: '100%', maxWidth: 720, marginTop: 48 }}>
          <div className="ml-card" style={{ padding: 26, minHeight: 200, position: 'relative' }}>
            <div style={{ fontSize: 22, lineHeight: 1.4, color: 'var(--ml-ink)', fontFamily: 'var(--ml-display)' }}>
              I've had a dull headache for three days, mostly on the right side,
              <span style={{ color: 'var(--ml-ink-4)' }}>{' '}and light hurts my eyes. Should I be worried?</span>
              <span style={{ display: 'inline-block', width: 2, height: 22, background: 'var(--ml-blue)', verticalAlign: '-4px', marginLeft: 2, animation: 'none' }} />
            </div>

            <div style={{ position: 'absolute', bottom: 18, left: 26, right: 26, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div className="ml-mono" style={{ fontSize: 11, color: 'var(--ml-ink-4)' }}>136 / 600</div>
              <div style={{ display: 'flex', gap: 4 }}>
                <span className="ml-pill" data-active="true">EN</span>
                <span className="ml-pill">اردو</span>
                <span className="ml-pill">Roman</span>
              </div>
            </div>
          </div>

          {/* OR divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, margin: '28px 0' }}>
            <span style={{ flex: 1, height: 1, background: 'var(--ml-line)' }} />
            <span className="ml-kicker">or speak</span>
            <span style={{ flex: 1, height: 1, background: 'var(--ml-line)' }} />
          </div>

          {/* Mic — listening state */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
            <div style={{ position: 'relative', width: 80, height: 80 }}>
              <div style={{ position: 'absolute', inset: -22, borderRadius: 999, background: 'var(--ml-blue-50)' }} />
              <div style={{ position: 'absolute', inset: -10, borderRadius: 999, background: 'rgba(26, 95, 122, 0.12)' }} />
              <div style={{ position: 'absolute', inset: 0, borderRadius: 999, background: 'var(--ml-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 20px -8px rgba(26,95,122,0.6)' }}>
                <I name="mic" size={26} color="#fff" />
              </div>
            </div>
            <div style={{ marginTop: 16, fontSize: 13, color: 'var(--ml-ink-3)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="ml-livedot" /> Listening · release to send · 0:04
            </div>
            {/* Live caption */}
            <div className="ur" style={{ marginTop: 20, fontSize: 18, color: 'var(--ml-ink-4)', textAlign: 'center', lineHeight: 1.5, maxWidth: 520 }}>
              "تین دن سے سر میں ہلکا درد ہو رہا ہے…"
            </div>
          </div>
        </div>

        {/* Bottom action */}
        <div style={{ position: 'absolute', bottom: 36, left: 0, right: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          <button className="ml-btn ml-btn-ghost ml-btn-lg">Cancel</button>
          <button className="ml-btn ml-btn-primary ml-btn-lg">
            Get answer <I name="arrow" size={15} />
          </button>
        </div>

        <div style={{ position: 'absolute', bottom: 14, left: 0, right: 0, textAlign: 'center', fontSize: 11, color: 'var(--ml-ink-4)' }}>
          Medlingo answers are educational. If you have severe symptoms, call 1166.
        </div>
      </div>
    </div>
  );
}

/* ─── Variation B · Composer with starters + context ─────────────── */
function QueryB() {
  return (
    <div className="ml" style={{ width: 1280, height: 900, background: 'var(--ml-bg)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Top */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 32px', borderBottom: '1px solid var(--ml-line)' }}>
        <button className="ml-btn ml-btn-quiet" style={{ padding: '6px 10px' }}>
          <I name="arrowLeft" size={14} /> Back
        </button>
        <MedlingoWordmark size={16} />
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
          <span className="ml-pill"><I name="shield" size={11} /> Private</span>
          <span className="ml-pill ml-pill-blue">3 of 5 left</span>
        </div>
      </div>

      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 320px', gap: 0 }}>
        {/* Composer column */}
        <div style={{ padding: '40px 48px', display: 'flex', flexDirection: 'column' }}>
          <div className="ml-kicker" style={{ marginBottom: 8 }}>Compose</div>
          <h2 className="ml-display" style={{ fontSize: 30, margin: 0, lineHeight: 1.15, fontWeight: 500 }}>
            What would you like to ask Medlingo?
          </h2>

          {/* Lang picker */}
          <div style={{ marginTop: 22, display: 'flex', gap: 6, alignItems: 'center' }}>
            <span className="ml-kicker" style={{ marginRight: 4 }}>Language</span>
            <span className="ml-pill" data-active="true">English</span>
            <span className="ml-pill">اردو</span>
            <span className="ml-pill">Roman Urdu</span>
            <span className="ml-pill"><I name="sparkle" size={11} /> Auto</span>
            <span style={{ flex: 1 }} />
            <span className="ml-kicker">Reply in</span>
            <span className="ml-pill" data-active="true">Same language</span>
          </div>

          {/* Composer card */}
          <div className="ml-card" style={{ marginTop: 18, padding: 22, flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ flex: 1, fontSize: 16, color: 'var(--ml-ink)', lineHeight: 1.6 }}>
              My father, 62, has type 2 diabetes and was started on metformin two weeks ago. He says he feels nauseous after dinner most nights.
              <span style={{ display: 'inline-block', width: 2, height: 18, background: 'var(--ml-blue)', verticalAlign: '-3px', marginLeft: 2 }} />
              <div style={{ marginTop: 14, color: 'var(--ml-ink-4)', fontSize: 14 }}>
                Is this normal? Should we change anything?
              </div>
            </div>

            {/* Toolbar */}
            <div style={{ borderTop: '1px solid var(--ml-line)', paddingTop: 14, marginTop: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
              <button className="ml-btn ml-btn-quiet" style={{ padding: '6px 10px', fontSize: 12 }}>
                <I name="plus" size={12} /> Attach report
              </button>
              <button className="ml-btn ml-btn-quiet" style={{ padding: '6px 10px', fontSize: 12 }}>
                <I name="pill" size={12} /> Add medicine
              </button>
              <button className="ml-btn ml-btn-quiet" style={{ padding: '6px 10px', fontSize: 12 }}>
                <I name="bug" size={12} /> Symptom checker
              </button>
              <span style={{ flex: 1 }} />
              <span className="ml-mono" style={{ fontSize: 11, color: 'var(--ml-ink-4)' }}>148 / 600</span>
              <button className="ml-btn ml-btn-ghost" style={{ borderRadius: 999, width: 36, height: 36, padding: 0, justifyContent: 'center' }}>
                <I name="mic" size={15} />
              </button>
              <button className="ml-btn ml-btn-primary">
                Ask Medlingo <I name="send" size={13} />
              </button>
            </div>
          </div>

          {/* Disclaimer */}
          <div style={{ marginTop: 14, display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 14px', background: 'var(--ml-amber-50)', borderRadius: 10 }}>
            <I name="warning" size={14} color="var(--ml-amber)" />
            <div style={{ fontSize: 12, color: 'var(--ml-amber)', lineHeight: 1.4 }}>
              Medlingo gives educational answers — not a diagnosis. For chest pain, fainting, or severe bleeding, call <strong>1166</strong> immediately.
            </div>
          </div>
        </div>

        {/* Right rail — starters + last similar */}
        <div style={{ borderLeft: '1px solid var(--ml-line)', background: 'var(--ml-paper-2)', padding: '40px 28px', overflow: 'auto' }}>
          <div className="ml-kicker" style={{ marginBottom: 12 }}>Quick starters</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 28 }}>
            {[
              'My medicine is causing…',
              'Is it safe to take ___ during pregnancy?',
              'My child has a fever of ___',
              'Help me understand this lab result',
              'Explain ___ in simple Urdu',
            ].map((t) => (
              <div key={t} className="ml-card" style={{ padding: '10px 12px', fontSize: 13, color: 'var(--ml-ink-2)' }}>
                {t}
              </div>
            ))}
          </div>

          <div className="ml-kicker" style={{ marginBottom: 12 }}>Similar past questions</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { q: 'Metformin nausea — when does it settle?', t: '6 days ago', match: '92%' },
              { q: 'Best foods for newly-diagnosed type 2', t: '2 weeks ago', match: '74%' },
            ].map((it) => (
              <div key={it.q} className="ml-card" style={{ padding: 12 }}>
                <div style={{ fontSize: 13, color: 'var(--ml-ink)', lineHeight: 1.4, marginBottom: 6 }}>{it.q}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--ml-ink-4)' }}>
                  <span>{it.t}</span>
                  <span className="ml-mono" style={{ color: 'var(--ml-green)' }}>● {it.match} match</span>
                </div>
              </div>
            ))}
          </div>

          <div className="ml-kicker" style={{ marginTop: 28, marginBottom: 12 }}>Tips</div>
          <ul style={{ margin: 0, padding: '0 0 0 14px', fontSize: 12, color: 'var(--ml-ink-3)', lineHeight: 1.6 }}>
            <li>Include age and any medicines being taken.</li>
            <li>Describe when symptoms started.</li>
            <li>Mention any allergies or conditions.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { QueryA, QueryB });
