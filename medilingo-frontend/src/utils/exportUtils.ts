import type { Message } from '../types/index';

// ── Lightweight markdown → HTML ───────────────────────────────────────────────
// Handles the subset the LLM actually produces: headings, bold, italic,
// inline code, fenced code blocks, ordered/unordered lists, blockquotes, hr.

function mdToHtml(md: string): string {
  const lines = md.split('\n');
  const out: string[] = [];
  let inUl = false;
  let inOl = false;
  let inCode = false;
  let codeLines: string[] = [];

  function closeList() {
    if (inUl) { out.push('</ul>'); inUl = false; }
    if (inOl) { out.push('</ol>'); inOl = false; }
  }

  function inline(s: string): string {
    return s
      .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code>$1</code>');
  }

  for (const raw of lines) {
    const line = raw;

    // Fenced code block
    if (line.startsWith('```')) {
      if (!inCode) {
        closeList();
        inCode = true;
        codeLines = [];
      } else {
        out.push(`<pre><code>${codeLines.map(l =>
          l.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
        ).join('\n')}</code></pre>`);
        inCode = false;
        codeLines = [];
      }
      continue;
    }
    if (inCode) { codeLines.push(line); continue; }

    // Headings
    const h3 = line.match(/^###\s+(.*)/);
    const h2 = line.match(/^##\s+(.*)/);
    const h1 = line.match(/^#\s+(.*)/);
    if (h3) { closeList(); out.push(`<h3>${inline(h3[1])}</h3>`); continue; }
    if (h2) { closeList(); out.push(`<h2>${inline(h2[1])}</h2>`); continue; }
    if (h1) { closeList(); out.push(`<h1>${inline(h1[1])}</h1>`); continue; }

    // Horizontal rule
    if (/^---+$/.test(line.trim())) { closeList(); out.push('<hr>'); continue; }

    // Blockquote
    const bq = line.match(/^>\s*(.*)/);
    if (bq) { closeList(); out.push(`<blockquote>${inline(bq[1])}</blockquote>`); continue; }

    // Ordered list
    const ol = line.match(/^\d+\.\s+(.*)/);
    if (ol) {
      if (inUl) { out.push('</ul>'); inUl = false; }
      if (!inOl) { out.push('<ol>'); inOl = true; }
      out.push(`<li>${inline(ol[1])}</li>`);
      continue;
    }

    // Unordered list
    const ul = line.match(/^[-*]\s+(.*)/);
    if (ul) {
      if (inOl) { out.push('</ol>'); inOl = false; }
      if (!inUl) { out.push('<ul>'); inUl = true; }
      out.push(`<li>${inline(ul[1])}</li>`);
      continue;
    }

    closeList();

    // Blank line → paragraph break
    if (line.trim() === '') { out.push('<br>'); continue; }

    out.push(`<p>${inline(line)}</p>`);
  }

  closeList();
  return out.join('\n');
}

// ── Full HTML page generator ──────────────────────────────────────────────────

export function generateChatHtml(
  messages: Message[],
  title: string,
): string {
  const exportedAt = new Date().toLocaleString('en-PK', {
    weekday: 'long', year: 'numeric', month: 'long',
    day: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  const messagesHtml = messages.map((m) => {
    const time = new Date(m.timestamp).toLocaleTimeString('en-PK', {
      hour: '2-digit', minute: '2-digit',
    });

    if (m.role === 'user') {
      const escaped = m.text
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      return `
        <div class="msg user-msg">
          <div class="meta user-meta">You &middot; ${time}</div>
          <div class="bubble user-bubble">${escaped.replace(/\n/g, '<br>')}</div>
        </div>`;
    }

    return `
      <div class="msg asst-msg">
        <div class="asst-header">
          <div class="asst-avatar">
            <svg width="13" height="13" viewBox="0 0 36 36" fill="none">
              <rect x="13" y="6" width="6.5" height="19" rx="2" fill="white"/>
              <rect x="6" y="13" width="19" height="6.5" rx="2" fill="white"/>
            </svg>
          </div>
          <span class="meta">MediLingo &middot; ${time}</span>
        </div>
        <div class="asst-card">
          <div class="asst-body">${mdToHtml(m.text)}</div>
          <div class="asst-footer">MediLingo AI &mdash; For informational purposes only. Always consult a qualified doctor.</div>
        </div>
      </div>`;
  }).join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MediLingo — ${title}</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
      background: #F5F5F0;
      color: #2E3540;
      line-height: 1.6;
      padding: 0;
    }

    /* ── Header bar ─────────────────────────── */
    .page-header {
      background: linear-gradient(135deg, #1A5F7A 0%, #0E3D50 100%);
      color: white;
      padding: 20px 32px 18px;
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .page-header .logo {
      width: 38px; height: 38px;
      background: rgba(0,180,216,0.25);
      border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .page-header h1 { font-size: 17px; font-weight: 600; letter-spacing: -0.02em; }
    .page-header p  { font-size: 11px; opacity: 0.65; margin-top: 2px; }
    .page-header .pill {
      margin-left: auto;
      background: rgba(255,255,255,0.12);
      border: 1px solid rgba(255,255,255,0.2);
      border-radius: 999px;
      padding: 4px 12px;
      font-size: 11px;
      font-family: monospace;
      white-space: nowrap;
    }

    /* ── Chat container ─────────────────────── */
    .chat {
      max-width: 760px;
      margin: 0 auto;
      padding: 28px 20px 40px;
      display: flex;
      flex-direction: column;
      gap: 22px;
    }

    /* ── Shared message layout ──────────────── */
    .msg { display: flex; flex-direction: column; }
    .meta {
      font-size: 10.5px;
      font-family: monospace;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: #8A93A1;
      margin-bottom: 5px;
    }

    /* ── User message ───────────────────────── */
    .user-msg { align-items: flex-end; }
    .user-meta { text-align: right; }
    .user-bubble {
      max-width: 72%;
      background: linear-gradient(135deg, #1A5F7A, #144B61);
      color: white;
      padding: 12px 18px;
      border-radius: 14px 14px 3px 14px;
      font-size: 14px;
      line-height: 1.65;
      word-break: break-word;
    }

    /* ── Assistant message ──────────────────── */
    .asst-msg { align-items: flex-start; }
    .asst-header {
      display: flex; align-items: center; gap: 8px; margin-bottom: 8px;
    }
    .asst-avatar {
      width: 24px; height: 24px;
      background: linear-gradient(135deg, #00B4D8, #1A5F7A);
      border-radius: 7px;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .asst-card {
      background: #FFFFFF;
      border: 1px solid #E7E5DE;
      border-radius: 12px;
      overflow: hidden;
      display: flex;
      border-left: 3px solid #00B4D8;
    }
    .asst-body {
      padding: 18px 20px;
      font-size: 14px;
      line-height: 1.75;
      color: #2E3540;
      flex: 1;
    }
    .asst-footer {
      font-size: 10px;
      color: #B4BAC4;
      padding: 7px 20px;
      border-top: 1px solid #F0EDE8;
      background: #FAFAF7;
      font-style: italic;
    }

    /* ── Prose inside assistant ─────────────── */
    .asst-body p   { margin-bottom: 10px; }
    .asst-body p:last-child { margin-bottom: 0; }
    .asst-body h1  { font-size: 16px; font-weight: 700; color: #0092B0; border-bottom: 1px solid rgba(0,180,216,0.2); padding-bottom: 5px; margin: 18px 0 10px; }
    .asst-body h1:first-child { margin-top: 0; }
    .asst-body h2  { font-size: 14.5px; font-weight: 700; color: #1A5F7A; border-bottom: 1px solid #E7E5DE; padding-bottom: 4px; margin: 14px 0 8px; }
    .asst-body h3  { font-size: 13.5px; font-weight: 600; color: #2E3540; margin: 12px 0 6px; }
    .asst-body ul  { list-style: none; padding-left: 0; margin: 8px 0 12px; }
    .asst-body ol  { list-style: none; padding-left: 0; margin: 8px 0 12px; counter-reset: item; }
    .asst-body ul li { display: flex; align-items: flex-start; gap: 8px; margin-bottom: 6px; }
    .asst-body ol li { display: flex; align-items: flex-start; gap: 8px; margin-bottom: 6px; counter-increment: item; }
    .asst-body ul li::before {
      content: '';
      width: 6px; height: 6px;
      border-radius: 50%;
      background: #00B4D8;
      flex-shrink: 0;
      margin-top: 8px;
    }
    .asst-body ol li::before {
      content: counter(item);
      width: 20px; height: 20px;
      border-radius: 50%;
      background: rgba(0,180,216,0.12);
      color: #0092B0;
      font-size: 10px; font-weight: 700;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .asst-body code {
      background: #E0F7FC;
      color: #0092B0;
      padding: 1px 6px;
      border-radius: 4px;
      font-size: 12.5px;
      font-family: 'Fira Code', 'Cascadia Code', Consolas, monospace;
      border: 1px solid rgba(0,180,216,0.2);
    }
    .asst-body pre {
      background: #1A2530;
      color: #E2E8EF;
      padding: 14px 16px;
      border-radius: 8px;
      overflow-x: auto;
      margin: 10px 0;
      font-size: 12.5px;
      font-family: 'Fira Code', Consolas, monospace;
    }
    .asst-body pre code {
      background: none; color: inherit; border: none; padding: 0; font-size: inherit;
    }
    .asst-body blockquote {
      border-left: 3px solid rgba(0,180,216,0.5);
      background: rgba(0,180,216,0.05);
      margin: 10px 0;
      padding: 8px 14px;
      border-radius: 0 6px 6px 0;
      color: #5A6373;
      font-style: italic;
    }
    .asst-body hr {
      border: none;
      height: 1px;
      background: linear-gradient(90deg, transparent, #E7E5DE, transparent);
      margin: 14px 0;
    }
    .asst-body strong { font-weight: 600; color: #1A2530; }
    .asst-body em     { font-style: italic; color: #5A6373; }

    /* ── Page footer ────────────────────────── */
    .page-footer {
      text-align: center;
      padding: 18px;
      font-size: 11px;
      color: #B4BAC4;
      border-top: 1px solid #E7E5DE;
      margin-top: 12px;
    }

    /* ── Print styles ───────────────────────── */
    @media print {
      body    { background: white; }
      .chat   { padding: 16px; }
      .page-header { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .user-bubble { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .asst-card   { break-inside: avoid; }
    }
  </style>
</head>
<body>

<header class="page-header">
  <div class="logo">
    <svg width="20" height="20" viewBox="0 0 36 36" fill="none">
      <rect x="13" y="6" width="6.5" height="19" rx="2" fill="white"/>
      <rect x="6" y="13" width="19" height="6.5" rx="2" fill="white"/>
    </svg>
  </div>
  <div>
    <h1>MediLingo AI</h1>
    <p>${title}</p>
  </div>
  <div class="pill">Exported ${exportedAt}</div>
</header>

<main class="chat">
${messagesHtml}
</main>

<footer class="page-footer">
  MediLingo AI &mdash; This conversation is for informational purposes only.<br>
  Always consult a qualified medical professional for personal health decisions.
</footer>

</body>
</html>`;
}
