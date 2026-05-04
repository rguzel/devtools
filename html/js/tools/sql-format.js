// sql-formatter loaded lazily so a CDN failure can't break the whole app
let _fmt = null;
async function getSqlFormat() {
  if (!_fmt) {
    const mod = await import('https://esm.sh/sql-formatter@15');
    _fmt = mod.format;
  }
  return _fmt;
}

const DIALECTS = [
  { value: 'tsql',       label: 'T-SQL (SQL Server)' },
  { value: 'mysql',      label: 'MySQL' },
  { value: 'postgresql', label: 'PostgreSQL' },
  { value: 'sql',        label: 'Standard SQL' },
  { value: 'sqlite',     label: 'SQLite' },
  { value: 'mariadb',    label: 'MariaDB' },
];

const SAMPLE = `select u.id,u.name,u.email,count(o.id) as order_count,sum(o.total) as total_spent from users u inner join orders o on u.id=o.user_id where u.is_active=1 and o.created_at>='2024-01-01' group by u.id,u.name,u.email having sum(o.total)>500 order by total_spent desc`;

export function init(container) {
  container.style.flexDirection = 'column';

  container.innerHTML = `
    <div class="options-row" style="flex-shrink:0;">
      <label class="option-label">Dialect:
        <select id="sf-dialect">${DIALECTS.map(d => `<option value="${d.value}"${d.value === 'tsql' ? ' selected' : ''}>${d.label}</option>`).join('')}</select>
      </label>
      <label class="option-label">Indent:
        <select id="sf-indent">
          <option value="4" selected>4 spaces</option>
          <option value="2">2 spaces</option>
          <option value="tab">Tab</option>
        </select>
      </label>
      <label class="option-label">
        <input type="checkbox" id="sf-uppercase" checked> Uppercase keywords
      </label>
      <label class="option-label">
        <input type="checkbox" id="sf-lines"> Blank line between clauses
      </label>
    </div>
    <div class="editor-panes" style="flex:1;overflow:hidden;">
      <div class="editor-pane">
        <div class="pane-toolbar">
          <span class="pane-label">Input SQL</span>
          <button class="btn" id="sf-paste">Paste</button>
          <button class="btn" id="sf-sample">Sample</button>
          <button class="btn danger" id="sf-clear">Clear</button>
        </div>
        <textarea class="pane-textarea" id="sf-input" placeholder="Paste SQL here…" spellcheck="false"></textarea>
      </div>
      <div class="editor-pane">
        <div class="pane-toolbar">
          <span class="pane-label">Formatted SQL</span>
          <span id="sf-status"></span>
          <button class="btn" id="sf-copy">Copy</button>
        </div>
        <div class="pane-output" id="sf-output"></div>
      </div>
    </div>
  `;

  const inputEl    = container.querySelector('#sf-input');
  const outputEl   = container.querySelector('#sf-output');
  const statusEl   = container.querySelector('#sf-status');
  const dialectSel = container.querySelector('#sf-dialect');
  const indentSel  = container.querySelector('#sf-indent');
  const upperCb    = container.querySelector('#sf-uppercase');
  const linesCb    = container.querySelector('#sf-lines');

  async function doFormat() {
    const raw = inputEl.value.trim();
    if (!raw) { outputEl.textContent = ''; outputEl.className = 'pane-output'; statusEl.innerHTML = ''; return; }
    statusEl.innerHTML = '<span class="status-badge info">…</span>';
    try {
      const fmt      = await getSqlFormat();
      const tabWidth = indentSel.value === 'tab' ? 1 : parseInt(indentSel.value);
      const useTabs  = indentSel.value === 'tab';
      const result   = fmt(raw, {
        language: dialectSel.value,
        tabWidth,
        useTabs,
        keywordCase: upperCb.checked ? 'upper' : 'lower',
        linesBetweenQueries: linesCb.checked ? 2 : 1,
      });
      outputEl.textContent = result;
      outputEl.className   = 'pane-output';
      statusEl.innerHTML   = '';
    } catch (e) {
      outputEl.textContent = e.message;
      outputEl.className   = 'pane-output error';
      statusEl.innerHTML   = '<span class="status-badge err">Error</span>';
    }
  }

  inputEl.addEventListener('input', doFormat);
  dialectSel.addEventListener('change', doFormat);
  indentSel.addEventListener('change', doFormat);
  upperCb.addEventListener('change', doFormat);
  linesCb.addEventListener('change', doFormat);

  container.querySelector('#sf-paste').addEventListener('click', async () => {
    inputEl.value = await navigator.clipboard.readText();
    doFormat();
  });
  container.querySelector('#sf-sample').addEventListener('click', () => {
    inputEl.value = SAMPLE;
    doFormat();
  });
  container.querySelector('#sf-clear').addEventListener('click', () => {
    inputEl.value = '';
    outputEl.textContent = '';
    outputEl.className = 'pane-output';
    statusEl.innerHTML = '';
  });
  container.querySelector('#sf-copy').addEventListener('click', () => {
    if (!outputEl.textContent.trim()) return;
    navigator.clipboard.writeText(outputEl.textContent);
    flashBtn(container.querySelector('#sf-copy'), 'Copied!');
  });
}

function flashBtn(btn, text) {
  const orig = btn.textContent;
  btn.textContent = text;
  setTimeout(() => { btn.textContent = orig; }, 1500);
}
