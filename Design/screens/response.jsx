// Response display — two variations.

/* ─── Variation A · Document / long-form ──────────────────────────── */
function ResponseA() {
  return (
    <div className="ml" style={{ width: 1280, height: 900, background: 'var(--ml-bg)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Top */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 32px', borderBottom: '1px solid var(--ml-line)' }}>
        <button className="ml-btn ml-btn-quiet" style={{ padding: '6px 10px' }}>
          <I name="arrowLeft" size={14} /> Back
        </button>
        <MedlingoWordmark size={16} />
        <span style={{ marginLeft: 8, fontSize: 13, color: 'var(--ml-ink-4)' }}>· Answer · 2h ago</span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
          <button className="ml-btn ml-btn-ghost" style={{ padding: '7px 10px', fontSize: 12 }}><I name="copy" size={13} /> Copy</button>
          <button className="ml-btn ml-btn-ghost" style={{ padding: '7px 10px', fontSize: 12 }}><I name="download" size={13} /> PDF</button>
          <button className="ml-btn ml-btn-ghost" style={{ padding: '7px 10px', fontSize: 12 }}><I name="share" size={13} /> Share</button>
          <button className="ml-btn ml-btn-quiet" style={{ padding: 8 }}><I name="more" size={14} /></button>
        </div>
      </div>

      {/* Body — 2 cols: doc + sidebar */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 320px', overflow: 'hidden' }}>
        {/* Document */}
        <div style={{ overflow: 'auto', padding: '40px 64px 140px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ width: '100%', maxWidth: 640 }}>

            {/* Question header */}
            <div className="ml-kicker" style={{ marginBottom: 12 }}>Your question · English</div>
            <h1 className="ml-display" style={{ fontSize: 32, lineHeight: 1.2, margin: 0, fontWeight: 500, letterSpacing: '-0.015em' }}>
              What are the symptoms of seasonal flu, and when should I see a doctor?
            </h1>
            <div style={{ display: 'flex', gap: 14, marginTop: 14, fontSize: 12, color: 'var(--ml-ink-4)', alignItems: 'center' }}>
              <span>Asked 2 hours ago</span>
              <span>·</span>
              <span>Answered in 4.2s</span>
              <span>·</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><I name="check" size={11} color="var(--ml-green)" /> Clinician-reviewed</span>
            </div>

            {/* Top-line answer */}
            <div style={{ marginTop: 32, padding: 20, background: 'var(--ml-blue-50)', borderRadius: 12, borderLeft: '3px solid var(--ml-blue)' }}>
              <div className="ml-kicker" style={{ color: 'var(--ml-blue)', marginBottom: 8 }}>Short answer</div>
              <div style={{ fontSize: 16, color: 'var(--ml-ink)', lineHeight: 1.55 }}>
                Flu usually starts <strong>suddenly</strong> with fever, body aches, dry cough and exhaustion — and gets better on its own in 5–7 days. See a doctor if breathing gets hard, fever passes 39 °C for more than three days, or you're pregnant or over 65.
              </div>
            </div>

            {/* Sections */}
            <h2 className="ml-display" style={{ fontSize: 20, marginTop: 32, marginBottom: 10, fontWeight: 600 }}>
              Common symptoms
            </h2>
            <ul style={{ margin: 0, paddingLeft: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                ['Fever 38–40 °C', 'Often appears within hours'],
                ['Dry cough', 'Sometimes lingers for 1–2 weeks'],
                ['Muscle aches & fatigue', 'Distinct from regular tiredness'],
                ['Sore throat & runny nose', 'Often milder than with a cold'],
                ['Headache', 'Frequently with light sensitivity'],
              ].map(([t, s]) => (
                <li key={t} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <span style={{ width: 18, height: 18, borderRadius: 999, background: 'var(--ml-teal-50)', color: 'var(--ml-teal-600)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginTop: 2, flexShrink: 0 }}>
                    <I name="check" size={11} color="var(--ml-teal-600)" />
                  </span>
                  <div style={{ fontSize: 14, lineHeight: 1.5 }}>
                    <strong style={{ color: 'var(--ml-ink)' }}>{t}.</strong>
                    <span style={{ color: 'var(--ml-ink-3)' }}> {s}.</span>
                  </div>
                </li>
              ))}
            </ul>

            <h2 className="ml-display" style={{ fontSize: 20, marginTop: 30, marginBottom: 10, fontWeight: 600 }}>
              See a doctor if…
            </h2>
            <div className="ml-card" style={{ padding: 16, marginBottom: 8 }}>
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 14, color: 'var(--ml-ink-2)', lineHeight: 1.7 }}>
                <li>You feel short of breath at rest, or chest pain that comes with breathing.</li>
                <li>Fever stays above 39 °C for more than 3 days, or returns after improving.</li>
                <li>You're pregnant, over 65, or have asthma, diabetes, or heart disease.</li>
                <li>A child under 2 is feeding poorly or unusually drowsy.</li>
              </ul>
            </div>

            <h2 className="ml-display" style={{ fontSize: 20, marginTop: 30, marginBottom: 10, fontWeight: 600 }}>
              At home
            </h2>
            <div style={{ fontSize: 14, color: 'var(--ml-ink-2)', lineHeight: 1.6 }}>
              Most flu episodes improve with rest, fluids, and paracetamol for fever/aches (max 4 g/24h in adults). Antibiotics do not help — flu is caused by a virus. If you're high-risk, an antiviral (oseltamivir) within the first 48 hours can shorten the illness; talk to a doctor.
            </div>

            {/* Sources */}
            <div style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid var(--ml-line)' }}>
              <div className="ml-kicker" style={{ marginBottom: 12 }}>Sources</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
                {[
                  'CDC · Flu Symptoms & Complications (2025 update)',
                  'NICE NG191 · Managing the symptoms of acute infection',
                  'WHO · Influenza (Seasonal) fact sheet, Mar 2026',
                ].map((s, i) => (
                  <div key={s} style={{ display: 'flex', gap: 10, alignItems: 'baseline' }}>
                    <span className="ml-mono" style={{ color: 'var(--ml-ink-4)', fontSize: 11 }}>{(i + 1).toString().padStart(2, '0')}</span>
                    <span style={{ color: 'var(--ml-ink-2)' }}>{s}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginTop: 30, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', background: 'var(--ml-paper-2)', borderRadius: 10 }}>
              <span style={{ fontSize: 13, color: 'var(--ml-ink-3)' }}>Was this helpful?</span>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="ml-btn ml-btn-ghost" style={{ padding: '6px 12px', fontSize: 12 }}>Yes</button>
                <button className="ml-btn ml-btn-ghost" style={{ padding: '6px 12px', fontSize: 12 }}>Not quite</button>
              </div>
            </div>
          </div>
        </div>

        {/* Right sidebar: audio + meta */}
        <div style={{ borderLeft: '1px solid var(--ml-line)', background: 'var(--ml-paper-2)', padding: 24, display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Audio player */}
          <div className="ml-card" style={{ padding: 18, background: 'var(--ml-ink)', borderColor: 'var(--ml-ink)', color: '#fff' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <I name="speaker" size={14} color="#fff" />
                <span className="ml-kicker" style={{ color: 'rgba(255,255,255,0.55)' }}>Listen</span>
              </div>
              <span className="ml-pill" style={{ background: 'rgba(255,255,255,0.08)', borderColor: 'transparent', color: 'rgba(255,255,255,0.85)' }}>1.0×</span>
            </div>
            {/* Waveform mock */}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 36, marginBottom: 12 }}>
              {Array.from({ length: 60 }).map((_, i) => {
                const h = 6 + Math.abs(Math.sin(i * 1.3)) * 28 + (i % 7) * 1.5;
                const active = i < 22;
                return <span key={i} style={{ flex: 1, height: Math.min(h, 36), background: active ? 'var(--ml-teal)' : 'rgba(255,255,255,0.22)', borderRadius: 2 }} />;
              })}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 11, color: 'rgba(255,255,255,0.55)', fontFamily: 'var(--ml-mono)' }}>
              <span>1:35</span><span>3:45</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, marginTop: 14 }}>
              <I name="speaker" size={14} color="rgba(255,255,255,0.55)" />
              <button style={{ width: 44, height: 44, borderRadius: 999, background: '#fff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <I name="pause" size={16} color="var(--ml-ink)" />
              </button>
              <I name="download" size={14} color="rgba(255,255,255,0.55)" />
            </div>
            <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.1)', fontSize: 11, color: 'rgba(255,255,255,0.55)', textAlign: 'center' }}>
              Voice · Saira (female) · Urdu translation available
            </div>
          </div>

          {/* Translate */}
          <div className="ml-card" style={{ padding: 16 }}>
            <div className="ml-kicker" style={{ marginBottom: 10 }}>Read in</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', borderRadius: 8, background: 'var(--ml-ink)', color: '#fff' }}>
                <span style={{ fontSize: 13 }}>English</span>
                <I name="check" size={12} color="#fff" />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', borderRadius: 8 }}>
                <span style={{ fontSize: 13 }}>اردو <span style={{ color: 'var(--ml-ink-4)', marginLeft: 4 }}>· Urdu</span></span>
                <span style={{ fontSize: 11, color: 'var(--ml-ink-4)' }}>Switch</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', borderRadius: 8 }}>
                <span style={{ fontSize: 13 }}>Roman Urdu</span>
                <span style={{ fontSize: 11, color: 'var(--ml-ink-4)' }}>Switch</span>
              </div>
            </div>
          </div>

          {/* Follow-ups */}
          <div className="ml-card" style={{ padding: 16 }}>
            <div className="ml-kicker" style={{ marginBottom: 10 }}>Follow-up</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                'What antiviral should I ask for?',
                'How is flu different from COVID-19?',
                'Is my 6-year-old high-risk?',
              ].map((t) => (
                <div key={t} style={{ fontSize: 13, color: 'var(--ml-ink-2)', padding: '8px 10px', borderRadius: 8, background: 'var(--ml-paper)', border: '1px solid var(--ml-line)' }}>
                  {t}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Variation B · Conversational chat thread ─────────────────────── */
function ResponseB() {
  return (
    <div className="ml" style={{ width: 1280, height: 900, background: 'var(--ml-bg)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Top */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 32px', borderBottom: '1px solid var(--ml-line)' }}>
        <button className="ml-btn ml-btn-quiet" style={{ padding: '6px 10px' }}>
          <I name="arrowLeft" size={14} />
        </button>
        <div>
          <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--ml-ink)' }}>Migraine without prescription medicine</div>
          <div style={{ fontSize: 11, color: 'var(--ml-ink-4)', marginTop: 1 }}>3 messages · started 14 min ago · اردو</div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <span className="ml-pill"><I name="pin" size={11} /> Save</span>
          <span className="ml-pill"><I name="share" size={11} /> Share</span>
          <button className="ml-btn ml-btn-quiet" style={{ padding: 8 }}><I name="more" size={14} /></button>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Thread */}
        <div style={{ flex: 1, overflow: 'auto', padding: '32px 0' }}>
          <div style={{ maxWidth: 760, margin: '0 auto', padding: '0 32px', display: 'flex', flexDirection: 'column', gap: 24 }}>

            {/* User bubble — Urdu */}
            <div style={{ display: 'flex', gap: 14, justifyContent: 'flex-end' }}>
              <div style={{ maxWidth: '78%' }}>
                <div className="ml-kicker" style={{ textAlign: 'right', marginBottom: 6, color: 'var(--ml-ink-4)' }}>You · اردو · 14m ago</div>
                <div dir="rtl" className="ur" style={{ padding: '14px 18px', background: 'var(--ml-blue)', color: '#fff', borderRadius: '14px 14px 4px 14px', fontSize: 17, lineHeight: 1.75 }}>
                  مجھے ہفتے میں دو تین بار شدید سر درد ہوتا ہے، خاص طور پر آنکھوں کے پیچھے۔ بغیر کسی نسخے کی دوا کے کیا کر سکتی ہوں؟
                </div>
              </div>
              <div style={{ width: 32, height: 32, borderRadius: 999, background: 'var(--ml-paper-2)', border: '1px solid var(--ml-line)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: 'var(--ml-ink-3)', flexShrink: 0 }}>AS</div>
            </div>

            {/* Medlingo bubble */}
            <div style={{ display: 'flex', gap: 14 }}>
              <div style={{ width: 32, height: 32, borderRadius: 999, background: 'var(--ml-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <MedlingoMark size={16} color="#fff" />
              </div>
              <div style={{ flex: 1, maxWidth: '78%' }}>
                <div className="ml-kicker" style={{ marginBottom: 6 }}>Medlingo · clinician-reviewed</div>
                <div className="ml-card" style={{ padding: 20, borderRadius: '14px 14px 14px 4px' }}>
                  <div dir="rtl" className="ur" style={{ fontSize: 17, lineHeight: 1.85, color: 'var(--ml-ink)' }}>
                    آپ کی علامات درد شقیقہ (migraine) سے مشابہ ہیں۔ گھریلو حد تک یہ کام آزمائیں:
                  </div>
                  <ul dir="rtl" className="ur" style={{ marginTop: 12, paddingRight: 22, color: 'var(--ml-ink-2)', fontSize: 16, lineHeight: 1.9 }}>
                    <li>روزانہ کم از کم 8 گلاس پانی پئیں۔ کم پانی ایک بڑی وجہ ہے۔</li>
                    <li>ہر روز ایک ہی وقت پر سونا اور جاگنا — نیند کا انتظام مدد کرتا ہے۔</li>
                    <li>کیفین والی چائے یا کافی ایک دن میں دو سے زیادہ نہیں۔</li>
                    <li>درد شروع ہوتے ہی اندھیرے، خاموش کمرے میں 30 منٹ آرام کریں۔</li>
                  </ul>
                  <div dir="rtl" className="ur" style={{ marginTop: 14, padding: '12px 14px', background: 'var(--ml-amber-50)', borderRadius: 10, fontSize: 15, color: 'var(--ml-amber)', lineHeight: 1.7 }}>
                    اگر سر درد اچانک بہت شدید ہو، یا بخار، الٹی، یا بینائی میں تبدیلی کے ساتھ ہو — تو فوراً ڈاکٹر سے رابطہ کریں۔
                  </div>

                  {/* Inline audio */}
                  <div style={{ marginTop: 16, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12, background: 'var(--ml-paper-2)', borderRadius: 10 }}>
                    <button style={{ width: 34, height: 34, borderRadius: 999, background: 'var(--ml-blue)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
                      <I name="play" size={13} color="#fff" />
                    </button>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 2, height: 22 }}>
                        {Array.from({ length: 40 }).map((_, i) => {
                          const h = 4 + Math.abs(Math.sin(i * 0.9)) * 16 + (i % 4) * 1;
                          return <span key={i} style={{ flex: 1, height: Math.min(h, 22), background: i < 4 ? 'var(--ml-blue)' : 'var(--ml-line-strong)', borderRadius: 2 }} />;
                        })}
                      </div>
                      <div className="ml-mono" style={{ fontSize: 10, color: 'var(--ml-ink-4)', marginTop: 4, display: 'flex', justifyContent: 'space-between' }}>
                        <span>0:08</span>
                        <span>Saira · Urdu · 1:42</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                    <button className="ml-btn ml-btn-quiet" style={{ padding: '5px 8px', fontSize: 11 }}><I name="copy" size={11} /> Copy</button>
                    <button className="ml-btn ml-btn-quiet" style={{ padding: '5px 8px', fontSize: 11 }}><I name="download" size={11} /> PDF</button>
                    <button className="ml-btn ml-btn-quiet" style={{ padding: '5px 8px', fontSize: 11 }}><I name="share" size={11} /> Share</button>
                    <span style={{ flex: 1 }} />
                    <span style={{ fontSize: 11, color: 'var(--ml-ink-4)' }}>Sources: NICE NG150 · BNF</span>
                  </div>
                </div>

                {/* Follow-up chips */}
                <div style={{ marginTop: 10, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {['کیا یہ ٹیومر کی علامت ہو سکتی ہے؟', 'Show me in English', 'When to take painkillers?'].map((t, i) => (
                    <span key={i} className={`ml-pill ${i === 0 ? '' : ''}`} style={{ fontFamily: i === 0 ? 'var(--ml-urdu)' : 'inherit', fontSize: i === 0 ? 14 : 12 }}>
                      <I name="sparkle" size={11} color="var(--ml-blue)" /> {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Composer dock */}
        <div style={{ borderTop: '1px solid var(--ml-line)', padding: '16px 32px', background: 'var(--ml-bg)' }}>
          <div style={{ maxWidth: 760, margin: '0 auto' }}>
            <div className="ml-card" style={{ display: 'flex', alignItems: 'center', padding: 8, paddingLeft: 16, gap: 10 }}>
              <I name="sparkle" size={14} color="var(--ml-blue)" />
              <div style={{ flex: 1, fontSize: 14, color: 'var(--ml-ink-4)' }}>Reply or ask a follow-up…</div>
              <span className="ml-pill" data-active="true">اردو</span>
              <button className="ml-btn ml-btn-ghost" style={{ borderRadius: 999, width: 36, height: 36, padding: 0, justifyContent: 'center' }}>
                <I name="mic" size={14} />
              </button>
              <button className="ml-btn ml-btn-primary" style={{ padding: '10px 14px' }}>
                <I name="send" size={13} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { ResponseA, ResponseB });
