// Chat history — two variations.

function HistTopnav() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 24, padding: '14px 32px', borderBottom: '1px solid var(--ml-line)' }}>
      <MedlingoWordmark size={17} />
      <div style={{ display: 'flex', gap: 4, marginLeft: 12 }}>
        {['Ask', 'History', 'Saved', 'Topics'].map((x) => (
          <div key={x} style={{
            padding: '7px 12px', borderRadius: 8, fontSize: 13.5,
            color: x === 'History' ? 'var(--ml-ink)' : 'var(--ml-ink-3)',
            background: x === 'History' ? 'var(--ml-paper-2)' : 'transparent',
            fontWeight: x === 'History' ? 500 : 400,
          }}>{x}</div>
        ))}
      </div>
      <div style={{ marginLeft: 'auto', display: 'flex', gap: 14, alignItems: 'center' }}>
        <I name="bell" size={16} color="var(--ml-ink-3)" />
        <div style={{ width: 28, height: 28, borderRadius: 999, background: 'var(--ml-blue)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 500 }}>AS</div>
      </div>
    </div>
  );
}

const HIST_ITEMS = [
  // today
  { id: 1, q: 'Symptoms of seasonal flu, and when to see a doctor', lang: 'EN', tone: 'blue', t: '09:42 · 2h ago', preview: 'Flu usually starts suddenly with fever, body aches, dry cough and exhaustion. See a doctor if breathing gets hard or fever passes 39 °C…', day: 'Today', pinned: true, sources: 3 },
  { id: 2, q: 'درد شقیقہ کے لیے گھریلو علاج', lang: 'اردو', tone: 'teal', t: '07:13 · 4h ago', preview: 'پانی کم ہونا، نیند کی کمی اور کیفین درد شقیقہ کی بڑی وجوہات ہیں۔ گھریلو حد تک تین چیزیں آزمائیں…', day: 'Today', urdu: true, sources: 2 },
  // yesterday
  { id: 3, q: 'Can I take ibuprofen with my blood pressure medicine?', lang: 'EN', tone: 'blue', t: 'Yesterday · 22:11', preview: 'Generally no — ibuprofen can blunt the effect of ramipril and stress the kidneys. For occasional pain, paracetamol is safer.', day: 'Yesterday', sources: 4 },
  { id: 4, q: 'Bachay ka bukhar 39 degree, paracetamol kab dein?', lang: 'RU', tone: 'green', t: 'Yesterday · 14:02', preview: 'Paracetamol 15 mg/kg, har 4–6 ghantay baad, din mein 4 doses se zyada nahin. Agar bukhar 3 din se zyada raha to doctor dikhayein.', day: 'Yesterday', sources: 2 },
  // last week
  { id: 5, q: 'ٹائپ 2 ذیابیطس میں کن غذاؤں سے پرہیز کرنا چاہیے؟', lang: 'اردو', tone: 'teal', t: '23 May · 17:55', preview: 'سفید چینی، میٹھے مشروبات، اور سفید چاول کم سے کم رکھیں۔ پھل ٹھیک ہیں لیکن جوس کے بجائے پورا پھل لیں۔', day: 'Last week', urdu: true, sources: 5 },
  { id: 6, q: 'Metformin nausea — when does it usually settle?', lang: 'EN', tone: 'blue', t: '22 May · 11:31', preview: 'Most patients see nausea ease within 2 weeks of starting metformin. Taking it with food and increasing the dose slowly helps.', day: 'Last week', sources: 3 },
  { id: 7, q: 'Stress se neend nahin aati, kya karoon?', lang: 'RU', tone: 'green', t: '20 May · 23:48', preview: 'Sone se ek ghanta pehle screens band karein. Kamre ko thanda aur andhera rakhein. Caffeine 2 baje ke baad avoid karein.', day: 'Last week', sources: 2 },
  { id: 8, q: 'Is intermittent fasting safe while on metformin?', lang: 'EN', tone: 'blue', t: '20 May · 09:14', preview: 'It can be — but watch for low blood sugar. Speak to your doctor before starting, especially if you take any other diabetes medicine.', day: 'Last week', sources: 4 },
];

/* ─── Variation A · Timeline list w/ preview pane ─────────────────── */
function HistoryA() {
  const days = ['Today', 'Yesterday', 'Last week'];
  const selectedId = 3;
  const sel = HIST_ITEMS.find((x) => x.id === selectedId);

  return (
    <div className="ml" style={{ width: 1280, height: 900, background: 'var(--ml-bg)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <HistTopnav />

      {/* Header strip */}
      <div style={{ padding: '32px 48px 18px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <div className="ml-kicker" style={{ marginBottom: 6 }}>History</div>
          <h1 className="ml-display" style={{ fontSize: 30, margin: 0, lineHeight: 1.1, fontWeight: 500 }}>42 conversations</h1>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}><I name="search" size={13} color="var(--ml-ink-4)" /></span>
            <input placeholder="Search conversations…" style={{ width: 280, padding: '9px 12px 9px 32px', border: '1px solid var(--ml-line)', borderRadius: 10, background: 'var(--ml-paper)', fontSize: 13, outline: 'none', fontFamily: 'inherit' }} />
          </div>
          <button className="ml-btn ml-btn-ghost"><I name="filter" size={13} /> Filter</button>
        </div>
      </div>

      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0, padding: '0 48px 48px', minHeight: 0 }}>
        {/* List */}
        <div style={{ paddingRight: 24, overflow: 'auto' }}>
          {days.map((day) => {
            const items = HIST_ITEMS.filter((x) => x.day === day);
            return (
              <div key={day} style={{ marginBottom: 22 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <span className="ml-kicker">{day}</span>
                  <span style={{ flex: 1, height: 1, background: 'var(--ml-line)' }} />
                  <span className="ml-mono" style={{ fontSize: 11, color: 'var(--ml-ink-4)' }}>{items.length}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {items.map((it) => {
                    const active = it.id === selectedId;
                    return (
                      <div key={it.id} style={{
                        display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 14px',
                        borderRadius: 10,
                        background: active ? 'var(--ml-paper)' : 'transparent',
                        border: active ? '1px solid var(--ml-line)' : '1px solid transparent',
                        boxShadow: active ? '0 1px 0 rgba(20,23,28,0.02)' : 'none',
                      }}>
                        <span style={{ width: 4, height: 36, borderRadius: 4, background: it.tone === 'blue' ? 'var(--ml-blue)' : it.tone === 'teal' ? 'var(--ml-teal)' : 'var(--ml-green)', marginTop: 4, flexShrink: 0 }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                            <span className={it.urdu ? 'ur' : ''} style={{
                              fontSize: it.urdu ? 16 : 14, fontWeight: 500, color: 'var(--ml-ink)',
                              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1, minWidth: 0,
                            }}>
                              {it.q}
                            </span>
                            {it.pinned && <I name="pin" size={11} color="var(--ml-ink-4)" />}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 11, color: 'var(--ml-ink-4)' }}>
                            <span className={`ml-pill ml-pill-${it.tone}`} style={{ fontSize: 10, padding: '2px 8px', fontFamily: it.urdu ? 'var(--ml-urdu)' : 'inherit' }}>{it.lang}</span>
                            <span>{it.t}</span>
                            <span>·</span>
                            <span>{it.sources} sources</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Preview pane */}
        <div style={{ borderLeft: '1px solid var(--ml-line)', paddingLeft: 32, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <span className="ml-kicker">Preview</span>
            <div style={{ display: 'flex', gap: 4 }}>
              <button className="ml-btn ml-btn-quiet" style={{ padding: '5px 8px', fontSize: 11 }}><I name="pin" size={12} /> Save</button>
              <button className="ml-btn ml-btn-quiet" style={{ padding: '5px 8px', fontSize: 11 }}><I name="share" size={12} /> Share</button>
              <button className="ml-btn ml-btn-quiet" style={{ padding: 6 }}><I name="more" size={12} /></button>
            </div>
          </div>

          <h2 className="ml-display" style={{ fontSize: 24, margin: 0, lineHeight: 1.25, fontWeight: 500 }}>
            {sel.q}
          </h2>
          <div style={{ display: 'flex', gap: 12, marginTop: 10, fontSize: 12, color: 'var(--ml-ink-4)' }}>
            <span>{sel.t}</span><span>·</span><span>{sel.lang}</span><span>·</span><span>4 messages</span>
          </div>

          {/* Snippet */}
          <div className="ml-card" style={{ marginTop: 20, padding: 18 }}>
            <div className="ml-kicker" style={{ marginBottom: 8 }}>Short answer</div>
            <div style={{ fontSize: 14, color: 'var(--ml-ink-2)', lineHeight: 1.55 }}>
              {sel.preview}
            </div>
          </div>

          {/* Mini audio */}
          <div style={{ marginTop: 14, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12, background: 'var(--ml-paper-2)', borderRadius: 10 }}>
            <button style={{ width: 30, height: 30, borderRadius: 999, background: 'var(--ml-ink)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <I name="play" size={11} color="#fff" />
            </button>
            <div style={{ flex: 1, height: 3, background: 'var(--ml-line-strong)', borderRadius: 999, position: 'relative' }}>
              <div style={{ position: 'absolute', inset: 0, width: '0%', background: 'var(--ml-ink)', borderRadius: 999 }} />
            </div>
            <span className="ml-mono" style={{ fontSize: 11, color: 'var(--ml-ink-4)' }}>0:00 / 1:18</span>
          </div>

          <div style={{ marginTop: 22 }}>
            <div className="ml-kicker" style={{ marginBottom: 10 }}>Cited sources</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                'BNF · NSAIDs and ACE inhibitor interaction',
                'NICE NG136 · Hypertension management in adults',
                'NEJM · Renal effects of NSAID + ACEi combination',
                'JAMA Internal Medicine, 2024',
              ].map((s, i) => (
                <div key={s} style={{ display: 'flex', gap: 10, alignItems: 'baseline', fontSize: 13 }}>
                  <span className="ml-mono" style={{ color: 'var(--ml-ink-4)', fontSize: 11 }}>{(i + 1).toString().padStart(2, '0')}</span>
                  <span style={{ color: 'var(--ml-ink-2)' }}>{s}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: 'auto', paddingTop: 20, display: 'flex', gap: 8 }}>
            <button className="ml-btn ml-btn-primary" style={{ flex: 1, justifyContent: 'center' }}>Open conversation <I name="arrow" size={14} /></button>
            <button className="ml-btn ml-btn-ghost"><I name="download" size={13} /> PDF</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Variation B · Filterable card grid ──────────────────────────── */
function HistoryB() {
  return (
    <div className="ml" style={{ width: 1280, height: 900, background: 'var(--ml-bg)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <HistTopnav />

      <div style={{ padding: '36px 48px 18px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <div className="ml-kicker" style={{ marginBottom: 6 }}>History</div>
          <h1 className="ml-display" style={{ fontSize: 34, margin: 0, fontWeight: 500, letterSpacing: '-0.02em' }}>Everything you've asked</h1>
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <span className="ml-kicker" style={{ marginRight: 6 }}>View</span>
          <button className="ml-btn ml-btn-ghost" style={{ padding: '6px 10px', fontSize: 12 }}>Timeline</button>
          <button className="ml-btn ml-btn-primary" style={{ padding: '6px 10px', fontSize: 12 }}>Grid</button>
        </div>
      </div>

      {/* Filter bar */}
      <div style={{ padding: '0 48px 24px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 360 }}>
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}><I name="search" size={13} color="var(--ml-ink-4)" /></span>
          <input placeholder="Search questions, medicines, symptoms…" style={{ width: '100%', padding: '9px 12px 9px 32px', border: '1px solid var(--ml-line)', borderRadius: 10, background: 'var(--ml-paper)', fontSize: 13, outline: 'none', fontFamily: 'inherit' }} />
        </div>
        <span className="ml-pill" data-active="true">All</span>
        <span className="ml-pill">English</span>
        <span className="ml-pill">اردو</span>
        <span className="ml-pill">Roman Urdu</span>
        <span style={{ width: 1, height: 22, background: 'var(--ml-line)', margin: '0 4px' }} />
        <span className="ml-pill">Last 30 days</span>
        <span className="ml-pill"><I name="pin" size={11} /> Saved only</span>
        <span style={{ flex: 1 }} />
        <span style={{ fontSize: 12, color: 'var(--ml-ink-4)' }}>Sort:</span>
        <span className="ml-pill">Newest first</span>
      </div>

      {/* Grid */}
      <div style={{ flex: 1, overflow: 'auto', padding: '0 48px 48px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
          {HIST_ITEMS.map((it) => (
            <div key={it.id} className="ml-card" style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 12, minHeight: 200, position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className={`ml-pill ml-pill-${it.tone}`} style={{ fontFamily: it.urdu ? 'var(--ml-urdu)' : 'inherit' }}>{it.lang}</span>
                {it.pinned && <I name="pin" size={11} color="var(--ml-ink-4)" />}
                <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--ml-ink-4)' }}>{it.t}</span>
              </div>
              <div className={it.urdu ? 'ur' : ''} style={{ fontSize: it.urdu ? 17 : 15, fontWeight: 500, lineHeight: 1.35, color: 'var(--ml-ink)' }}>
                {it.q}
              </div>
              <div className={it.urdu ? 'ur' : ''} style={{
                fontSize: it.urdu ? 14 : 13, color: 'var(--ml-ink-3)', lineHeight: 1.55,
                display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden',
              }}>
                {it.preview}
              </div>
              <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: 12, fontSize: 11, color: 'var(--ml-ink-4)' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><I name="speaker" size={11} /> Audio</span>
                <span>·</span>
                <span>{it.sources} sources</span>
                <span style={{ flex: 1 }} />
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--ml-blue)', fontWeight: 500 }}>Open <I name="arrow" size={11} color="var(--ml-blue)" /></span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { HistoryA, HistoryB });
