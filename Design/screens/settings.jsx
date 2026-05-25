// Settings — two variations.

// Small reusable toggle (visual only).
function Toggle({ on = false, label }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      <span style={{
        width: 32, height: 18, borderRadius: 999,
        background: on ? 'var(--ml-blue)' : 'var(--ml-line-strong)',
        position: 'relative', transition: 'background .15s', flexShrink: 0,
      }}>
        <span style={{
          position: 'absolute', top: 2, left: on ? 16 : 2,
          width: 14, height: 14, borderRadius: 999, background: '#fff',
          boxShadow: '0 1px 2px rgba(0,0,0,.18)', transition: 'left .15s',
        }} />
      </span>
      {label && <span style={{ fontSize: 13, color: 'var(--ml-ink-2)' }}>{label}</span>}
    </div>
  );
}

function Select({ value, hint }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 8,
      padding: '8px 12px', border: '1px solid var(--ml-line-strong)', borderRadius: 8,
      background: 'var(--ml-paper)', fontSize: 13, color: 'var(--ml-ink)', minWidth: 180, justifyContent: 'space-between',
    }}>
      <span>{value}</span>
      <I name="arrow" size={11} color="var(--ml-ink-4)" />
    </div>
  );
}

// A reusable settings "row": label/desc on left, control on right.
function Row({ label, desc, control, last = false }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 24,
      padding: '16px 0',
      borderBottom: last ? 'none' : '1px solid var(--ml-line-2)',
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--ml-ink)' }}>{label}</div>
        {desc && <div style={{ fontSize: 12, color: 'var(--ml-ink-4)', marginTop: 3, lineHeight: 1.5 }}>{desc}</div>}
      </div>
      <div style={{ flexShrink: 0 }}>{control}</div>
    </div>
  );
}

function SettingsTopnav() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 24, padding: '14px 32px', borderBottom: '1px solid var(--ml-line)' }}>
      <MedlingoWordmark size={17} />
      <div style={{ display: 'flex', gap: 4, marginLeft: 12 }}>
        {['Ask', 'History', 'Saved', 'Topics'].map((x) => (
          <div key={x} style={{ padding: '7px 12px', borderRadius: 8, fontSize: 13.5, color: 'var(--ml-ink-3)' }}>{x}</div>
        ))}
      </div>
      <div style={{ marginLeft: 'auto', display: 'flex', gap: 14, alignItems: 'center' }}>
        <I name="bell" size={16} color="var(--ml-ink-3)" />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 4px 4px 12px', border: '1px solid var(--ml-line)', borderRadius: 999 }}>
          <span style={{ fontSize: 13, color: 'var(--ml-ink-2)' }}>Ayesha S.</span>
          <div style={{ width: 24, height: 24, borderRadius: 999, background: 'var(--ml-blue)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 500 }}>AS</div>
        </div>
      </div>
    </div>
  );
}

/* ─── Variation A · Two-pane: left nav + content ─────────────────── */
function SettingsA() {
  const nav = [
    { name: 'Profile', icon: 'sparkle' },
    { name: 'Languages', icon: 'globe' },
    { name: 'Voice', icon: 'speaker' },
    { name: 'Privacy & security', icon: 'shield' },
    { name: 'Notifications', icon: 'bell' },
    { name: 'Subscription', icon: 'pill' },
    { name: 'Connected accounts', icon: 'plus' },
  ];
  const active = 'Languages';

  return (
    <div className="ml" style={{ width: 1280, height: 900, background: 'var(--ml-bg)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <SettingsTopnav />

      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '260px 1fr', overflow: 'hidden' }}>
        {/* Left nav */}
        <div style={{ borderRight: '1px solid var(--ml-line)', padding: '32px 20px', display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div>
            <div className="ml-kicker" style={{ marginBottom: 8 }}>Settings</div>
            <h2 className="ml-display" style={{ fontSize: 22, margin: 0, fontWeight: 500 }}>Your account</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {nav.map((it) => (
              <div key={it.name} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 10px', borderRadius: 8,
                background: active === it.name ? 'var(--ml-paper-2)' : 'transparent',
                color: active === it.name ? 'var(--ml-ink)' : 'var(--ml-ink-3)',
                fontSize: 13.5, fontWeight: active === it.name ? 500 : 400,
              }}>
                <I name={it.icon} size={14} />
                <span>{it.name}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 'auto', paddingTop: 16, borderTop: '1px solid var(--ml-line)', display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ padding: '8px 10px', fontSize: 13, color: 'var(--ml-ink-3)' }}>Sign out</div>
            <div style={{ padding: '8px 10px', fontSize: 13, color: 'var(--ml-red)' }}>Delete account</div>
          </div>
        </div>

        {/* Content */}
        <div style={{ overflow: 'auto', padding: '36px 48px 48px' }}>
          <div style={{ maxWidth: 720, margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <h1 className="ml-display" style={{ fontSize: 30, margin: 0, fontWeight: 500, letterSpacing: '-0.02em' }}>Languages</h1>
              <span style={{ fontSize: 12, color: 'var(--ml-ink-4)' }}>Last saved 2 min ago · <span style={{ color: 'var(--ml-green)' }}>● synced</span></span>
            </div>
            <p style={{ fontSize: 14, color: 'var(--ml-ink-3)', lineHeight: 1.55, marginTop: 0, maxWidth: 540 }}>
              Medlingo can detect your language automatically, or you can pin defaults. Each setting is per-device and never sent in plain text.
            </p>

            {/* What I speak */}
            <div style={{ marginTop: 28 }}>
              <div className="ml-kicker" style={{ marginBottom: 14 }}>What I speak / write</div>
              <div className="ml-card" style={{ padding: '4px 18px' }}>
                <Row
                  label="Detect input language automatically"
                  desc="Medlingo guesses from the first 2 seconds of voice or first sentence of text. Disable if you usually mix languages mid-sentence."
                  control={<Toggle on={true} />}
                />
                <Row
                  label="Default input language"
                  desc="Used when auto-detect is off, or to break ties."
                  control={<Select value="English" />}
                />
                <Row
                  label="Allow code-switching"
                  desc="Recognize sentences that mix English and Urdu words (e.g., 'mujhe heartburn ho raha hai')."
                  control={<Toggle on={true} />}
                  last
                />
              </div>
            </div>

            {/* Answers */}
            <div style={{ marginTop: 28 }}>
              <div className="ml-kicker" style={{ marginBottom: 14 }}>Answers come back in</div>
              <div className="ml-card" style={{ padding: '4px 18px' }}>
                <Row
                  label="Default response language"
                  desc="Override per-question with the picker above the composer."
                  control={
                    <div style={{ display: 'flex', gap: 6 }}>
                      <span className="ml-pill">English</span>
                      <span className="ml-pill" data-active="true">اردو</span>
                      <span className="ml-pill">Roman Urdu</span>
                      <span className="ml-pill">Match question</span>
                    </div>
                  }
                />
                <Row
                  label="Interface language"
                  desc="Menus, buttons and dates. Changes apply on next page load."
                  control={<Select value="English" />}
                />
                <Row
                  label="Show transliteration"
                  desc="Display Roman Urdu under اردو text in answers."
                  control={<Toggle on={false} />}
                  last
                />
              </div>
            </div>

            {/* Reading level */}
            <div style={{ marginTop: 28 }}>
              <div className="ml-kicker" style={{ marginBottom: 14 }}>How Medlingo talks to me</div>
              <div className="ml-card" style={{ padding: 18 }}>
                <div style={{ fontSize: 13, color: 'var(--ml-ink-3)', marginBottom: 14 }}>Reading level for answers</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ flex: 1, position: 'relative', height: 4, background: 'var(--ml-line-strong)', borderRadius: 999 }}>
                    <div style={{ position: 'absolute', inset: 0, width: '55%', background: 'var(--ml-blue)', borderRadius: 999 }} />
                    <div style={{ position: 'absolute', left: '55%', top: '50%', transform: 'translate(-50%, -50%)', width: 16, height: 16, borderRadius: 999, background: '#fff', border: '2px solid var(--ml-blue)' }} />
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, fontSize: 11, color: 'var(--ml-ink-4)' }}>
                  <span>Plain · Grade 5</span>
                  <span style={{ color: 'var(--ml-blue)', fontWeight: 500 }}>Conversational · Grade 8</span>
                  <span>Clinical</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div style={{ marginTop: 36, display: 'flex', alignItems: 'center', gap: 10 }}>
              <button className="ml-btn ml-btn-primary">Save changes</button>
              <button className="ml-btn ml-btn-ghost">Discard</button>
              <span style={{ flex: 1 }} />
              <span style={{ fontSize: 12, color: 'var(--ml-ink-4)' }}>Changes auto-saved per section.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Variation B · Single scroll, conversational grouped cards ───── */
function SettingsB() {
  return (
    <div className="ml" style={{ width: 1280, height: 900, background: 'var(--ml-bg)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <SettingsTopnav />

      <div style={{ flex: 1, overflow: 'auto', padding: '40px 0' }}>
        <div style={{ maxWidth: 880, margin: '0 auto', padding: '0 40px' }}>

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 32 }}>
            <div>
              <div className="ml-kicker" style={{ marginBottom: 8 }}>Account</div>
              <h1 className="ml-display" style={{ fontSize: 36, margin: 0, lineHeight: 1.05, fontWeight: 500, letterSpacing: '-0.025em' }}>
                Make Medlingo your own.
              </h1>
            </div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              {['Profile', 'Languages', 'Voice', 'Privacy', 'Plan'].map((s, i) => (
                <span key={s} className="ml-pill" data-active={i === 0 ? 'true' : 'false'}>{s}</span>
              ))}
            </div>
          </div>

          {/* Profile card */}
          <div className="ml-card" style={{ padding: 26, marginBottom: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <div style={{ width: 64, height: 64, borderRadius: 999, background: 'var(--ml-blue)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 500, fontFamily: 'var(--ml-display)' }}>AS</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 18, fontWeight: 500, fontFamily: 'var(--ml-display)' }}>Ayesha Siddiqui</div>
                <div style={{ fontSize: 13, color: 'var(--ml-ink-3)', marginTop: 2 }}>ayesha.s@gmail.com · Free plan · Member since March 2026</div>
              </div>
              <button className="ml-btn ml-btn-ghost">Edit profile</button>
              <button className="ml-btn ml-btn-primary">Upgrade to Premium</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginTop: 22, paddingTop: 22, borderTop: '1px solid var(--ml-line-2)' }}>
              {[
                { k: '23', v: 'Questions this month', sub: 'of 5 free · 18 from premium trial' },
                { k: '4', v: 'Languages used' },
                { k: '186', v: 'Total questions answered' },
              ].map((s) => (
                <div key={s.v}>
                  <div className="ml-mono" style={{ fontSize: 24, fontWeight: 500 }}>{s.k}</div>
                  <div style={{ fontSize: 12, color: 'var(--ml-ink-3)', marginTop: 2 }}>{s.v}</div>
                  {s.sub && <div style={{ fontSize: 11, color: 'var(--ml-ink-4)', marginTop: 2 }}>{s.sub}</div>}
                </div>
              ))}
            </div>
          </div>

          {/* Two-up: Voice + Languages */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginBottom: 18 }}>
            {/* Voice */}
            <div className="ml-card" style={{ padding: 22 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <span style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--ml-blue-50)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                  <I name="speaker" size={14} color="var(--ml-blue)" />
                </span>
                <span style={{ fontFamily: 'var(--ml-display)', fontSize: 17, fontWeight: 500 }}>Voice</span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--ml-ink-4)', marginBottom: 18, lineHeight: 1.5 }}>
                How answers sound when read aloud.
              </div>

              {/* Voice options */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
                {[
                  { n: 'Saira', l: 'Urdu · F', active: true },
                  { n: 'Bilal', l: 'Urdu · M' },
                  { n: 'Aria', l: 'English · F' },
                ].map((v) => (
                  <div key={v.n} style={{
                    flex: 1, padding: '10px 12px', borderRadius: 10,
                    border: v.active ? '1px solid var(--ml-blue)' : '1px solid var(--ml-line)',
                    background: v.active ? 'var(--ml-blue-50)' : 'var(--ml-paper)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 13, fontWeight: 500 }}>{v.n}</span>
                      <I name="play" size={11} color="var(--ml-ink-3)" />
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--ml-ink-4)', marginTop: 2 }}>{v.l}</div>
                  </div>
                ))}
              </div>

              {/* Speed slider */}
              <div style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--ml-ink-3)', marginBottom: 8 }}>
                  <span>Speed</span><span className="ml-mono">1.0×</span>
                </div>
                <div style={{ position: 'relative', height: 4, background: 'var(--ml-line-strong)', borderRadius: 999 }}>
                  <div style={{ position: 'absolute', inset: 0, width: '40%', background: 'var(--ml-blue)', borderRadius: 999 }} />
                  <div style={{ position: 'absolute', left: '40%', top: '50%', transform: 'translate(-50%, -50%)', width: 14, height: 14, borderRadius: 999, background: '#fff', border: '2px solid var(--ml-blue)' }} />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: 13 }}>Auto-play answers</div>
                <Toggle on={true} />
              </div>
            </div>

            {/* Languages mini-card */}
            <div className="ml-card" style={{ padding: 22 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <span style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--ml-teal-50)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                  <I name="globe" size={14} color="var(--ml-teal-600)" />
                </span>
                <span style={{ fontFamily: 'var(--ml-display)', fontSize: 17, fontWeight: 500 }}>Languages</span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--ml-ink-4)', marginBottom: 18, lineHeight: 1.5 }}>
                Defaults when auto-detect can't decide.
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <div style={{ fontSize: 12, color: 'var(--ml-ink-3)', marginBottom: 6 }}>I ask in</div>
                  <Select value="Detect automatically" />
                </div>
                <div>
                  <div style={{ fontSize: 12, color: 'var(--ml-ink-3)', marginBottom: 6 }}>Answer me in</div>
                  <Select value="اردو (Urdu)" />
                </div>
                <div>
                  <div style={{ fontSize: 12, color: 'var(--ml-ink-3)', marginBottom: 6 }}>Interface</div>
                  <Select value="English" />
                </div>
              </div>
            </div>
          </div>

          {/* Privacy */}
          <div className="ml-card" style={{ padding: 22, marginBottom: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <span style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--ml-green-50)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                <I name="shield" size={14} color="var(--ml-green)" />
              </span>
              <span style={{ fontFamily: 'var(--ml-display)', fontSize: 17, fontWeight: 500 }}>Privacy & security</span>
            </div>

            <Row
              label="End-to-end encryption"
              desc="Your questions and answers are encrypted on your device before they leave it. Only you can read them."
              control={
                <span className="ml-pill ml-pill-green"><I name="check" size={11} color="var(--ml-green)" /> Enabled</span>
              }
            />
            <Row
              label="Save chat history"
              desc="Off: questions disappear when you close the tab. On: kept for 90 days, then deleted."
              control={<Toggle on={true} />}
            />
            <Row
              label="Two-factor authentication"
              desc="Add a 6-digit code from your phone whenever you sign in."
              control={
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{ fontSize: 12, color: 'var(--ml-ink-4)' }}>Not set up</span>
                  <button className="ml-btn ml-btn-ghost" style={{ padding: '6px 12px', fontSize: 12 }}>Enable</button>
                </div>
              }
            />
            <Row
              label="Help improve Medlingo"
              desc="Share anonymized questions with our clinical team to improve answers. Off by default."
              control={<Toggle on={false} />}
              last
            />
          </div>

          {/* Danger zone */}
          <div className="ml-card" style={{ padding: 22, borderColor: 'rgba(194, 72, 59, 0.25)' }}>
            <div style={{ fontFamily: 'var(--ml-display)', fontSize: 16, fontWeight: 500, color: 'var(--ml-red)', marginBottom: 4 }}>Sign out & data</div>
            <div style={{ fontSize: 12, color: 'var(--ml-ink-4)', marginBottom: 16 }}>These can't be undone.</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="ml-btn ml-btn-ghost">Sign out everywhere</button>
              <button className="ml-btn ml-btn-ghost">Export my data</button>
              <span style={{ flex: 1 }} />
              <button className="ml-btn ml-btn-ghost" style={{ borderColor: 'rgba(194, 72, 59, 0.4)', color: 'var(--ml-red)' }}>Delete account</button>
            </div>
          </div>

          <div style={{ height: 40 }} />
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { SettingsA, SettingsB });
