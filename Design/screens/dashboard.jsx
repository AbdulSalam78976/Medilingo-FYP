// Dashboard — two variations.

function DashSidebar({ active = 'Ask' }) {
  const items = [
    { name: 'Ask', icon: 'sparkle' },
    { name: 'History', icon: 'history' },
    { name: 'Saved', icon: 'pin' },
    { name: 'Topics', icon: 'chat' },
  ];
  const bottom = [
    { name: 'Settings', icon: 'settings' },
  ];
  return (
    <div style={{ width: 224, borderRight: '1px solid var(--ml-line)', display: 'flex', flexDirection: 'column', padding: '22px 14px', flexShrink: 0 }}>
      <div style={{ padding: '0 8px 24px' }}>
        <MedlingoWordmark size={17} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {items.map((it) => (
          <div key={it.name} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '8px 10px', borderRadius: 8,
            background: active === it.name ? 'var(--ml-paper-2)' : 'transparent',
            color: active === it.name ? 'var(--ml-ink)' : 'var(--ml-ink-3)',
            fontSize: 14, fontWeight: active === it.name ? 500 : 400,
          }}>
            <I name={it.icon} size={15} />
            <span>{it.name}</span>
            {it.name === 'History' && (
              <span className="ml-mono" style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--ml-ink-4)' }}>42</span>
            )}
          </div>
        ))}
      </div>

      <div style={{ marginTop: 24, padding: '0 8px' }}>
        <div className="ml-kicker" style={{ marginBottom: 8 }}>Recent</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {[
            'Flu vs. seasonal allergies',
            'Migraine without painkillers',
            'بچے کا بخار 39°',
            'Ibuprofen + ramipril',
          ].map((t, i) => (
            <div key={i} className={t.match(/[^\u0000-\u007F]/) ? 'ur' : ''} style={{
              padding: '6px 8px', borderRadius: 6,
              fontSize: t.match(/[^\u0000-\u007F]/) ? 14 : 12.5,
              color: 'var(--ml-ink-3)',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
              {t}
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {bottom.map((it) => (
          <div key={it.name} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', color: 'var(--ml-ink-3)', fontSize: 14 }}>
            <I name={it.icon} size={15} /> <span>{it.name}</span>
          </div>
        ))}
        <div style={{ marginTop: 8, padding: 12, background: 'var(--ml-paper-2)', borderRadius: 10 }}>
          <div className="ml-kicker" style={{ marginBottom: 4 }}>Free plan</div>
          <div style={{ fontSize: 12, color: 'var(--ml-ink-3)', marginBottom: 10 }}>
            3 of 5 questions left this month
          </div>
          <button className="ml-btn ml-btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '8px 12px', fontSize: 13 }}>
            Upgrade
          </button>
        </div>
      </div>
    </div>
  );
}

function CategoryCard({ icon, name, hint, tint }) {
  return (
    <div className="ml-card" style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 14, minHeight: 110 }}>
      <div style={{ width: 32, height: 32, borderRadius: 8, background: tint, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <I name={icon} size={16} color="var(--ml-blue)" />
      </div>
      <div>
        <div style={{ fontSize: 14, fontWeight: 500 }}>{name}</div>
        <div style={{ fontSize: 12, color: 'var(--ml-ink-4)', marginTop: 2 }}>{hint}</div>
      </div>
    </div>
  );
}

/* ─── Variation A · Sidebar + conversational center ──────────────── */
function DashboardA() {
  return (
    <div className="ml" style={{ width: 1280, height: 900, background: 'var(--ml-bg)', display: 'flex', overflow: 'hidden' }}>
      <DashSidebar active="Ask" />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Top bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 32px', borderBottom: '1px solid var(--ml-line)' }}>
          <div style={{ flex: 1, position: 'relative', maxWidth: 480 }}>
            <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}><I name="search" size={14} color="var(--ml-ink-4)" /></span>
            <input
              placeholder="Search your questions, topics, medicines…"
              style={{ width: '100%', padding: '8px 12px 8px 34px', border: '1px solid var(--ml-line)', borderRadius: 10, background: 'var(--ml-paper)', fontSize: 13, color: 'var(--ml-ink-2)', outline: 'none', fontFamily: 'inherit' }}
            />
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 14 }}>
            <span className="ml-pill"><I name="globe" size={11} /> EN · auto-translate</span>
            <I name="bell" size={16} color="var(--ml-ink-3)" />
            <div style={{ width: 30, height: 30, borderRadius: 999, background: 'var(--ml-blue)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 500 }}>AS</div>
          </div>
        </div>
        <div style={{ flex: 1, overflow: 'hidden', padding: '36px 48px 0', display: 'flex', flexDirection: 'column' }}>

          {/* Greeting */}
          <div style={{ marginBottom: 30 }}>
            <div className="ml-kicker" style={{ marginBottom: 10 }}>Monday · 25 May</div>
            <h1 className="ml-display" style={{ fontSize: 38, lineHeight: 1.1, margin: 0, fontWeight: 500 }}>
              Salam Ayesha. What's on your mind?
            </h1>
            <div style={{ marginTop: 8, fontSize: 14, color: 'var(--ml-ink-3)' }}>
              Ask in any language. We answer in the same one — or whichever you prefer.
            </div>
          </div>

          {/* Composer */}
          <div className="ml-card" style={{ padding: 22, marginBottom: 24, boxShadow: '0 1px 0 rgba(20,23,28,0.02)' }}>
            <div style={{ fontSize: 17, color: 'var(--ml-ink-4)', minHeight: 64, lineHeight: 1.5 }}>
              Describe your symptom, a medicine, or a worry…
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14 }}>
              <div style={{ display: 'flex', gap: 6 }}>
                <span className="ml-pill" data-active="true">English</span>
                <span className="ml-pill">اردو</span>
                <span className="ml-pill">Roman Urdu</span>
                <span style={{ width: 1, background: 'var(--ml-line)', margin: '0 4px' }} />
                <span className="ml-pill"><I name="plus" size={11} /> Attach report</span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="ml-btn ml-btn-ghost" style={{ borderRadius: 999, width: 38, height: 38, padding: 0, justifyContent: 'center' }}>
                  <I name="mic" size={16} color="var(--ml-ink-2)" />
                </button>
                <button className="ml-btn ml-btn-primary">
                  Ask <I name="arrow" size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* Two-column lower section */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 24, flex: 1, minHeight: 0 }}>
            {/* Suggested starters */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div className="ml-kicker">Suggested for you</div>
                <span style={{ fontSize: 12, color: 'var(--ml-ink-4)' }}>Based on your last 5 questions</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { q: 'Why does my heartburn come back after meals?', tag: 'Follow-up · Acid reflux' },
                  { q: 'صحت مند نیند کے لیے کتنے گھنٹے کافی ہیں؟', tag: 'Topic · Sleep', urdu: true },
                  { q: 'Is intermittent fasting safe if I take metformin?', tag: 'Medicine · Diabetes' },
                ].map((s, i) => (
                  <div key={i} className="ml-card" style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 14 }}>
                    <I name="sparkle" size={14} color="var(--ml-blue)" />
                    <div style={{ flex: 1 }}>
                      <div className={s.urdu ? 'ur' : ''} style={{ fontSize: s.urdu ? 17 : 14, color: 'var(--ml-ink)', lineHeight: 1.4 }}>{s.q}</div>
                      <div className="ml-kicker" style={{ marginTop: 4 }}>{s.tag}</div>
                    </div>
                    <I name="arrow" size={14} color="var(--ml-ink-4)" />
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 22 }}>
                <div className="ml-kicker" style={{ marginBottom: 12 }}>Quick topics</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                  <CategoryCard icon="pill" name="Medications" hint="Doses, interactions" tint="var(--ml-blue-50)" />
                  <CategoryCard icon="heart" name="Heart" hint="BP, cholesterol" tint="var(--ml-teal-50)" />
                  <CategoryCard icon="baby" name="Child health" hint="Fever, vaccines" tint="var(--ml-green-50)" />
                </div>
              </div>
            </div>

            {/* Continue last + insights */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div className="ml-card" style={{ padding: 18 }}>
                <div className="ml-kicker" style={{ marginBottom: 10 }}>Pick up where you left off</div>
                <div style={{ fontFamily: 'var(--ml-display)', fontSize: 19, lineHeight: 1.25, marginBottom: 10 }}>
                  Migraine without prescription medicine
                </div>
                <div style={{ fontSize: 13, color: 'var(--ml-ink-3)', lineHeight: 1.5, marginBottom: 14 }}>
                  You asked about hydration thresholds — there's one follow-up Medlingo flagged for a clinician review.
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '8px 12px', background: 'var(--ml-amber-50)', borderRadius: 8 }}>
                  <I name="warning" size={13} color="var(--ml-amber)" />
                  <span style={{ fontSize: 12, color: 'var(--ml-amber)' }}>1 item needs a doctor's sign-off</span>
                </div>
                <button className="ml-btn ml-btn-ghost" style={{ marginTop: 14, width: '100%', justifyContent: 'center' }}>Continue conversation</button>
              </div>

              <div className="ml-card" style={{ padding: 18 }}>
                <div className="ml-kicker" style={{ marginBottom: 12 }}>This month</div>
                <div style={{ display: 'flex', gap: 24 }}>
                  <div>
                    <div className="ml-mono" style={{ fontSize: 28, fontWeight: 500 }}>23</div>
                    <div style={{ fontSize: 11, color: 'var(--ml-ink-4)' }}>questions</div>
                  </div>
                  <div>
                    <div className="ml-mono" style={{ fontSize: 28, fontWeight: 500 }}>14m</div>
                    <div style={{ fontSize: 11, color: 'var(--ml-ink-4)' }}>spent listening</div>
                  </div>
                  <div>
                    <div className="ml-mono" style={{ fontSize: 28, fontWeight: 500, color: 'var(--ml-green)' }}>2</div>
                    <div style={{ fontSize: 11, color: 'var(--ml-ink-4)' }}>doctor visits avoided*</div>
                  </div>
                </div>
                <div style={{ marginTop: 10, fontSize: 11, color: 'var(--ml-ink-4)' }}>
                  *Based on triage outcomes flagged as “self-care appropriate”.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Tiny top-bar helper used by Dashboard A (search + right-side buttons)
function DashTopbarRight() {
  return null;
}

/* ─── Variation B · Top-nav + grid of starting points ────────────── */
function DashboardB() {
  return (
    <div className="ml" style={{ width: 1280, height: 900, background: 'var(--ml-bg)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Top nav */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 24, padding: '14px 32px', borderBottom: '1px solid var(--ml-line)' }}>
        <MedlingoWordmark size={17} />
        <div style={{ display: 'flex', gap: 4, marginLeft: 16 }}>
          {['Ask', 'History', 'Saved', 'Topics'].map((x) => (
            <div key={x} style={{
              padding: '7px 12px', borderRadius: 8, fontSize: 13.5,
              color: x === 'Ask' ? 'var(--ml-ink)' : 'var(--ml-ink-3)',
              background: x === 'Ask' ? 'var(--ml-paper-2)' : 'transparent',
              fontWeight: x === 'Ask' ? 500 : 400,
            }}>{x}</div>
          ))}
        </div>
        <div style={{ flex: 1, maxWidth: 420, marginLeft: 24, position: 'relative' }}>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}><I name="search" size={14} color="var(--ml-ink-4)" /></span>
            <input
              placeholder="Search…"
              style={{ width: '100%', padding: '8px 12px 8px 34px', border: '1px solid var(--ml-line)', borderRadius: 10, background: 'var(--ml-paper)', fontSize: 13, color: 'var(--ml-ink-2)', outline: 'none', fontFamily: 'inherit' }}
            />
            <span className="ml-mono" style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 11, color: 'var(--ml-ink-4)', padding: '2px 6px', border: '1px solid var(--ml-line)', borderRadius: 4 }}>⌘K</span>
          </div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 14 }}>
          <I name="bell" size={16} color="var(--ml-ink-3)" />
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div style={{ width: 28, height: 28, borderRadius: 999, background: 'var(--ml-blue)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 500 }}>AS</div>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'hidden', padding: '40px 48px', display: 'flex', flexDirection: 'column' }}>
        {/* Big hero ask */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <h1 className="ml-display" style={{ fontSize: 40, lineHeight: 1.05, margin: 0, fontWeight: 500 }}>
            Ask anything about your health.
          </h1>
          <div style={{ marginTop: 6, fontSize: 14, color: 'var(--ml-ink-3)' }}>
            In English, اردو, or Roman Urdu — by voice or text.
          </div>
        </div>

        <div style={{ maxWidth: 760, margin: '0 auto 40px', width: '100%' }}>
          <div className="ml-card" style={{ display: 'flex', alignItems: 'center', padding: 8, paddingLeft: 18, gap: 12, boxShadow: '0 1px 0 rgba(20,23,28,0.02)' }}>
            <I name="sparkle" size={16} color="var(--ml-blue)" />
            <div style={{ flex: 1, fontSize: 15, color: 'var(--ml-ink-4)' }}>Type a question or press the mic to speak…</div>
            <span className="ml-pill" data-active="true" style={{ marginRight: 4 }}>Auto-detect</span>
            <button className="ml-btn ml-btn-ghost" style={{ width: 44, height: 44, borderRadius: 999, padding: 0, justifyContent: 'center' }}>
              <I name="mic" size={16} />
            </button>
            <button className="ml-btn ml-btn-primary" style={{ padding: '12px 18px' }}>
              Ask <I name="arrow" size={14} />
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28, flex: 1, minHeight: 0 }}>
          {/* Left — six topic tiles */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div className="ml-kicker">Start a question</div>
              <span style={{ fontSize: 12, color: 'var(--ml-ink-4)' }}>By topic</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              <CategoryCard icon="bug" name="Infections" hint="Flu, dengue, COVID" tint="var(--ml-blue-50)" />
              <CategoryCard icon="pill" name="Medications" hint="Doses, side effects" tint="var(--ml-teal-50)" />
              <CategoryCard icon="heart" name="Heart" hint="BP & cholesterol" tint="var(--ml-green-50)" />
              <CategoryCard icon="brain" name="Mental health" hint="Sleep, anxiety" tint="var(--ml-blue-50)" />
              <CategoryCard icon="baby" name="Child health" hint="Fever, vaccines" tint="var(--ml-amber-50)" />
              <CategoryCard icon="dumbbell" name="Fitness" hint="Diet, exercise" tint="var(--ml-teal-50)" />
            </div>
          </div>

          {/* Right — recent chats */}
          <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div className="ml-kicker">Recent</div>
              <span style={{ fontSize: 12, color: 'var(--ml-ink-3)' }}>See all</span>
            </div>
            <div className="ml-card" style={{ flex: 1, padding: '4px 0', overflow: 'hidden' }}>
              {[
                { q: 'Symptoms of seasonal flu', t: '2h ago', lang: 'EN', tone: 'blue' },
                { q: 'درد شقیقہ کے لیے گھریلو علاج', t: '5h ago', lang: 'اردو', tone: 'teal', urdu: true },
                { q: 'Ibuprofen + ramipril interaction', t: 'Yesterday', lang: 'EN', tone: 'blue' },
                { q: 'Bachay ka bukhar 39 degree', t: '2 days', lang: 'RU', tone: 'green' },
                { q: 'Foods to avoid with type 2 diabetes', t: '4 days', lang: 'EN', tone: 'blue' },
              ].map((it, i, arr) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', borderBottom: i < arr.length - 1 ? '1px solid var(--ml-line-2)' : 'none' }}>
                  <I name="chat" size={14} color="var(--ml-ink-4)" />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className={it.urdu ? 'ur' : ''} style={{ fontSize: it.urdu ? 16 : 14, color: 'var(--ml-ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{it.q}</div>
                    <div style={{ fontSize: 12, color: 'var(--ml-ink-4)', marginTop: 2 }}>{it.t}</div>
                  </div>
                  <span className={`ml-pill ml-pill-${it.tone}`} style={{ fontFamily: it.urdu ? 'var(--ml-urdu)' : 'inherit' }}>{it.lang}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { DashboardA, DashboardB });
