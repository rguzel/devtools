// JSON Formatter / Minifier / Validator

export function init(container) {
  container.innerHTML = `
    <style>
      #json-format-root { display: flex; flex-direction: column; height: 100%; width: 100%; overflow: hidden; }
      #json-format-root .subtabs { flex-shrink: 0; }
      #json-format-root .options-row { flex-shrink: 0; }
      #json-format-root .subtab-panel { flex: 1; overflow: hidden; }
      #json-format-root .editor-panes { flex: 1; overflow: hidden; }
    </style>
    <div id="json-format-root">
    <div class="subtabs">
      <div class="subtab active" data-tab="format">Formatter</div>
      <div class="subtab" data-tab="minify">Minifier</div>
      <div class="subtab" data-tab="validate">Validator</div>
    </div>

    <!-- Format -->
    <div class="subtab-panel active" id="jf-format" style="flex-direction:column;overflow:hidden;">
      <div class="options-row">
        <label class="option-label">Indent:
          <select id="jf-indent">
            <option value="2">2 spaces</option>
            <option value="4">4 spaces</option>
            <option value="tab">Tab</option>
          </select>
        </label>
        <label class="option-label">
          <input type="checkbox" id="jf-sort-keys"> Sort keys
        </label>
      </div>
      <div class="editor-panes">
        <div class="editor-pane">
          <div class="pane-toolbar">
            <span class="pane-label">Input JSON</span>
            <button class="btn" id="jf-fmt-paste">Paste</button>
            <button class="btn danger" id="jf-fmt-clear">Clear</button>
          </div>
          <textarea class="pane-textarea" id="jf-input" placeholder='{"key":"value"}'></textarea>
        </div>
        <div class="editor-pane">
          <div class="pane-toolbar">
            <span class="pane-label">Formatted</span>
            <span id="jf-status"></span>
            <button class="btn" id="jf-copy">Copy</button>
          </div>
          <div class="pane-output" id="jf-output"></div>
        </div>
      </div>
    </div>

    <!-- Minify -->
    <div class="subtab-panel" id="jf-minify" style="flex-direction:column;overflow:hidden;">
      <div class="editor-panes">
        <div class="editor-pane">
          <div class="pane-toolbar">
            <span class="pane-label">Input JSON</span>
            <button class="btn danger" id="jf-min-clear">Clear</button>
          </div>
          <textarea class="pane-textarea" id="jf-min-input" placeholder="Paste JSON here..."></textarea>
        </div>
        <div class="editor-pane">
          <div class="pane-toolbar">
            <span class="pane-label">Minified</span>
            <span id="jf-min-size"></span>
            <button class="btn" id="jf-min-copy">Copy</button>
          </div>
          <div class="pane-output" id="jf-min-output"></div>
        </div>
      </div>
    </div>

    <!-- Validate -->
    <div class="subtab-panel" id="jf-validate" style="flex-direction:column;overflow:hidden;">
      <div class="editor-panes">
        <div class="editor-pane">
          <div class="pane-toolbar">
            <span class="pane-label">Input JSON</span>
            <button class="btn danger" id="jf-val-clear">Clear</button>
          </div>
          <textarea class="pane-textarea" id="jf-val-input" placeholder="Paste JSON to validate..."></textarea>
        </div>
        <div class="editor-pane">
          <div class="pane-toolbar">
            <span class="pane-label">Result</span>
          </div>
          <div class="pane-output" id="jf-val-output"></div>
        </div>
      </div>
    </div>
    </div>
  `;

  // Subtab routing
  container.querySelectorAll('.subtab').forEach(tab => {
    tab.addEventListener('click', () => {
      container.querySelectorAll('.subtab').forEach(t => t.classList.remove('active'));
      container.querySelectorAll('.subtab-panel').forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      container.querySelector('#jf-' + tab.dataset.tab).classList.add('active');
    });
  });

  // ── Format tab ──
  const input = container.querySelector('#jf-input');
  const output = container.querySelector('#jf-output');
  const status = container.querySelector('#jf-status');
  const indentSel = container.querySelector('#jf-indent');
  const sortKeys = container.querySelector('#jf-sort-keys');

  function format() {
    const raw = input.value.trim();
    if (!raw) { output.textContent = ''; status.innerHTML = ''; return; }
    try {
      const parsed = JSON.parse(raw);
      const indent = indentSel.value === 'tab' ? '\t' : parseInt(indentSel.value);
      const result = JSON.stringify(sortKeys.checked ? sortObj(parsed) : parsed, null, indent);
      output.textContent = result;
      output.className = 'pane-output success';
      status.innerHTML = '<span class="status-badge ok">Valid</span>';
    } catch (e) {
      output.textContent = e.message;
      output.className = 'pane-output error';
      status.innerHTML = '<span class="status-badge err">Invalid</span>';
    }
  }

  input.addEventListener('input', format);
  indentSel.addEventListener('change', format);
  sortKeys.addEventListener('change', format);

  container.querySelector('#jf-fmt-paste').addEventListener('click', async () => {
    input.value = await navigator.clipboard.readText();
    format();
  });
  container.querySelector('#jf-fmt-clear').addEventListener('click', () => {
    input.value = ''; output.textContent = ''; output.className = 'pane-output'; status.innerHTML = '';
  });
  container.querySelector('#jf-copy').addEventListener('click', () => {
    navigator.clipboard.writeText(output.textContent);
    flashBtn(container.querySelector('#jf-copy'), 'Copied!');
  });

  // ── Minify tab ──
  const minInput = container.querySelector('#jf-min-input');
  const minOutput = container.querySelector('#jf-min-output');
  const minSize = container.querySelector('#jf-min-size');

  function minify() {
    const raw = minInput.value.trim();
    if (!raw) { minOutput.textContent = ''; minSize.textContent = ''; return; }
    try {
      const result = JSON.stringify(JSON.parse(raw));
      minOutput.textContent = result;
      minOutput.className = 'pane-output';
      const saved = ((1 - result.length / raw.length) * 100).toFixed(1);
      minSize.innerHTML = `<span class="status-badge info">${result.length} bytes (-${saved}%)</span>`;
    } catch (e) {
      minOutput.textContent = e.message;
      minOutput.className = 'pane-output error';
      minSize.innerHTML = '';
    }
  }

  minInput.addEventListener('input', minify);
  container.querySelector('#jf-min-clear').addEventListener('click', () => {
    minInput.value = ''; minOutput.textContent = ''; minSize.textContent = '';
  });
  container.querySelector('#jf-min-copy').addEventListener('click', () => {
    navigator.clipboard.writeText(minOutput.textContent);
    flashBtn(container.querySelector('#jf-min-copy'), 'Copied!');
  });

  // ── Validate tab ──
  const valInput = container.querySelector('#jf-val-input');
  const valOutput = container.querySelector('#jf-val-output');

  function validate() {
    const raw = valInput.value.trim();
    if (!raw) { valOutput.textContent = ''; valOutput.className = 'pane-output'; return; }
    try {
      const parsed = JSON.parse(raw);
      const info = analyzeJson(parsed);
      valOutput.className = 'pane-output success';
      valOutput.textContent = `✓ Valid JSON\n\n${info}`;
    } catch (e) {
      valOutput.className = 'pane-output error';
      valOutput.textContent = `✗ Invalid JSON\n\n${e.message}`;
    }
  }

  valInput.addEventListener('input', validate);
  container.querySelector('#jf-val-clear').addEventListener('click', () => {
    valInput.value = ''; valOutput.textContent = ''; valOutput.className = 'pane-output';
  });
}

function sortObj(val) {
  if (Array.isArray(val)) return val.map(sortObj);
  if (val !== null && typeof val === 'object') {
    return Object.keys(val).sort().reduce((acc, k) => { acc[k] = sortObj(val[k]); return acc; }, {});
  }
  return val;
}

function analyzeJson(obj) {
  let keys = 0, arrays = 0, objs = 0, nulls = 0, depth = 0;
  function walk(v, d) {
    if (d > depth) depth = d;
    if (Array.isArray(v)) { arrays++; v.forEach(i => walk(i, d + 1)); }
    else if (v !== null && typeof v === 'object') { objs++; Object.values(v).forEach(i => { keys++; walk(i, d + 1); }); }
    else if (v === null) nulls++;
  }
  walk(obj, 0);
  const topType = Array.isArray(obj) ? 'Array' : (obj !== null && typeof obj === 'object') ? 'Object' : typeof obj;
  return `Type: ${topType}\nObjects: ${objs}\nArrays: ${arrays}\nKeys (total): ${keys}\nNull values: ${nulls}\nMax depth: ${depth}`;
}

function flashBtn(btn, text) {
  const orig = btn.textContent;
  btn.textContent = text;
  setTimeout(() => { btn.textContent = orig; }, 1500);
}
