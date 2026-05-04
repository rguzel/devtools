const MODELS = [
  { value: 'qwen2.5-coder:14b',     label: 'qwen2.5-coder:14b' },
  { value: 'deepseek-coder:latest', label: 'deepseek-coder'     },
  { value: 'qwen2.5-coder:3b',      label: 'qwen2.5-coder:3b'  },
  { value: 'gemma4:e2b',            label: 'gemma4:e2b (hm-local)' },
  { value: 'gemma4:e4b',            label: 'gemma4:e4b (hm-local)' },
];

const SAMPLE = `SELECT
    u.Name,
    u.Email,
    COUNT(o.Id) AS OrderCount,
    SUM(o.Total) AS TotalSpent,
    MAX(o.CreatedAt) AS LastOrderDate
FROM Users u
INNER JOIN Orders o ON u.Id = o.UserId
LEFT JOIN OrderItems oi ON o.Id = oi.OrderId
WHERE u.IsActive = 1
    AND o.CreatedAt >= '2024-01-01'
GROUP BY u.Name, u.Email
HAVING SUM(o.Total) > 500
ORDER BY TotalSpent DESC;`;

export function init(container) {
  container.style.flexDirection = 'column';

  container.innerHTML = `
    <div class="pane-toolbar" style="flex-shrink:0;flex-wrap:wrap;gap:8px;">
      <label class="option-label" style="margin-right:auto;">Model:
        <select id="se-model">${MODELS.map(m => `<option value="${m.value}">${m.label}</option>`).join('')}</select>
      </label>
      <button class="btn" id="se-sample">Sample</button>
      <button class="btn" id="se-paste">Paste</button>
      <button class="btn danger" id="se-clear">Clear</button>
      <button class="btn primary" id="se-explain">&#9654; Explain</button>
      <div id="se-spinner" style="display:none;align-items:center;"><span class="streaming-dot"></span></div>
      <span id="se-status"></span>
    </div>
    <div class="editor-panes" style="flex:1;overflow:hidden;">
      <div class="editor-pane">
        <div class="pane-toolbar">
          <span class="pane-label">SQL Query</span>
        </div>
        <textarea class="pane-textarea" id="se-input" placeholder="Paste your SQL query here…" spellcheck="false"></textarea>
      </div>
      <div class="editor-pane">
        <div class="pane-toolbar">
          <span class="pane-label">Explanation</span>
          <button class="btn" id="se-copy">Copy</button>
        </div>
        <div class="pane-output se-prose" id="se-output"></div>
      </div>
    </div>
  `;

  const inputEl    = container.querySelector('#se-input');
  const outputEl   = container.querySelector('#se-output');
  const statusEl   = container.querySelector('#se-status');
  const spinner    = container.querySelector('#se-spinner');
  const explainBtn = container.querySelector('#se-explain');
  let rawText = '';

  container.querySelector('#se-sample').addEventListener('click', () => { inputEl.value = SAMPLE; });
  container.querySelector('#se-paste').addEventListener('click', async () => { inputEl.value = await navigator.clipboard.readText(); });
  container.querySelector('#se-clear').addEventListener('click', () => {
    inputEl.value = ''; outputEl.innerHTML = ''; rawText = ''; statusEl.innerHTML = '';
  });
  container.querySelector('#se-copy').addEventListener('click', () => {
    if (!rawText.trim()) return;
    navigator.clipboard.writeText(rawText);
    flashBtn(container.querySelector('#se-copy'), 'Copied!');
  });

  let abortCtrl = null;

  explainBtn.addEventListener('click', async () => {
    const sql = inputEl.value.trim();
    if (!sql) return;

    if (abortCtrl) abortCtrl.abort();
    abortCtrl = new AbortController();

    const model = container.querySelector('#se-model').value;
    rawText = '';
    outputEl.innerHTML = '';
    outputEl.className = 'pane-output se-prose';
    statusEl.innerHTML = '<span class="status-badge info">Thinking&#8230;</span>';
    spinner.style.display = 'flex';
    explainBtn.disabled = true;

    try {
      const res = await fetch('/api/sql-explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sql, model }),
        signal: abortCtrl.signal,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: res.statusText }));
        throw new Error(err.detail || res.statusText);
      }

      const reader  = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let done   = false;

      while (!done) {
        const { value, done: d } = await reader.read();
        done = d;
        buffer += decoder.decode(value || new Uint8Array(), { stream: !d });
        const lines = buffer.split('\n');
        buffer = lines.pop();
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6);
          if (data === '[DONE]') { done = true; break; }
          try {
            const { token } = JSON.parse(data);
            if (token) {
              rawText += token;
              outputEl.innerHTML = renderMd(rawText);
              outputEl.scrollTop = outputEl.scrollHeight;
            }
          } catch {}
        }
      }

      statusEl.innerHTML = '<span class="status-badge ok">Done</span>';
    } catch (e) {
      if (e.name === 'AbortError') {
        statusEl.innerHTML = '<span class="status-badge info">Cancelled</span>';
      } else {
        outputEl.innerHTML += `<p style="color:var(--error)">[Error: ${esc(e.message)}]</p>`;
        statusEl.innerHTML  = '<span class="status-badge err">Error</span>';
      }
    } finally {
      spinner.style.display = 'none';
      explainBtn.disabled   = false;
    }
  });
}

function renderMd(text) {
  let h = esc(text);
  h = h.replace(/^#### (.+)$/gm, '<h4 class="md-h4">$1</h4>');
  h = h.replace(/^### (.+)$/gm,  '<h3 class="md-h3">$1</h3>');
  h = h.replace(/^## (.+)$/gm,   '<h2 class="md-h2">$1</h2>');
  h = h.replace(/^# (.+)$/gm,    '<h1 class="md-h1">$1</h1>');
  h = h.replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>');
  h = h.replace(/\*([^*\n]+)\*/g,     '<em>$1</em>');
  h = h.replace(/`([^`\n]+)`/g, '<code class="md-code">$1</code>');
  h = h.replace(/^[\*\-] (.+)$/gm, '<li>$1</li>');
  h = h.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');
  h = h.replace(/(<li>[^\n]*<\/li>\n?)+/g, s => `<ul class="md-ul">${s}</ul>`);
  h = h.replace(/\n\n+/g, '\n</p><p class="md-p">\n');
  h = h.replace(/\n/g, '<br>');
  return `<p class="md-p">${h}</p>`;
}

function esc(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function flashBtn(btn, text) {
  const orig = btn.textContent;
  btn.textContent = text;
  setTimeout(() => { btn.textContent = orig; }, 1500);
}
