// URL Encode / Decode

export function init(container) {
  container.innerHTML = `
    <style>
      #url-encode-root { display: flex; flex-direction: column; height: 100%; width: 100%; overflow: hidden; }
      #url-encode-root .subtabs { flex-shrink: 0; }
      #url-encode-root .options-row { flex-shrink: 0; }
      #url-encode-root .subtab-panel { flex: 1; overflow: hidden; }
      #url-encode-root .editor-panes { flex: 1; overflow: hidden; }
    </style>
    <div id="url-encode-root">
    <div class="subtabs">
      <div class="subtab active" data-tab="encode">Encode</div>
      <div class="subtab" data-tab="decode">Decode</div>
      <div class="subtab" data-tab="parse">Query Parser</div>
    </div>

    <div class="subtab-panel active" id="url-encode" style="flex-direction:column;overflow:hidden;">
      <div class="options-row">
        <label class="option-label">Mode:
          <select id="url-enc-mode">
            <option value="component">encodeURIComponent (recommended)</option>
            <option value="full">encodeURI (full URL)</option>
          </select>
        </label>
      </div>
      <div class="editor-panes">
        <div class="editor-pane">
          <div class="pane-toolbar">
            <span class="pane-label">Plain text</span>
            <button class="btn danger" id="url-enc-clear">Clear</button>
          </div>
          <textarea class="pane-textarea" id="url-enc-input" placeholder="Type or paste text to encode..."></textarea>
        </div>
        <div class="editor-pane">
          <div class="pane-toolbar">
            <span class="pane-label">URL-encoded</span>
            <button class="btn" id="url-enc-copy">Copy</button>
          </div>
          <div class="pane-output" id="url-enc-output"></div>
        </div>
      </div>
    </div>

    <div class="subtab-panel" id="url-decode" style="flex-direction:column;overflow:hidden;">
      <div class="editor-panes">
        <div class="editor-pane">
          <div class="pane-toolbar">
            <span class="pane-label">URL-encoded</span>
            <button class="btn" id="url-dec-paste">Paste</button>
            <button class="btn danger" id="url-dec-clear">Clear</button>
          </div>
          <textarea class="pane-textarea" id="url-dec-input" placeholder="Paste URL-encoded string..."></textarea>
        </div>
        <div class="editor-pane">
          <div class="pane-toolbar">
            <span class="pane-label">Decoded</span>
            <span id="url-dec-status"></span>
            <button class="btn" id="url-dec-copy">Copy</button>
          </div>
          <div class="pane-output" id="url-dec-output"></div>
        </div>
      </div>
    </div>

    <div class="subtab-panel" id="url-parse" style="flex-direction:column;overflow:hidden;">
      <div class="editor-panes">
        <div class="editor-pane">
          <div class="pane-toolbar">
            <span class="pane-label">Full URL</span>
            <button class="btn" id="url-parse-paste">Paste</button>
            <button class="btn danger" id="url-parse-clear">Clear</button>
          </div>
          <textarea class="pane-textarea" id="url-parse-input" placeholder="https://example.com/path?key=value&foo=bar#section" style="max-height:80px;"></textarea>
        </div>
        <div class="editor-pane">
          <div class="pane-toolbar">
            <span class="pane-label">Parsed</span>
          </div>
          <div class="pane-output" id="url-parse-output"></div>
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
      container.querySelector('#url-' + tab.dataset.tab).classList.add('active');
    });
  });

  // Encode
  const encIn = container.querySelector('#url-enc-input');
  const encOut = container.querySelector('#url-enc-output');
  const encMode = container.querySelector('#url-enc-mode');

  function encode() {
    const fn = encMode.value === 'component' ? encodeURIComponent : encodeURI;
    try { encOut.textContent = fn(encIn.value); encOut.className = 'pane-output'; }
    catch (e) { encOut.textContent = e.message; encOut.className = 'pane-output error'; }
  }
  encIn.addEventListener('input', encode);
  encMode.addEventListener('change', encode);
  container.querySelector('#url-enc-clear').addEventListener('click', () => { encIn.value = ''; encOut.textContent = ''; });
  container.querySelector('#url-enc-copy').addEventListener('click', () => {
    navigator.clipboard.writeText(encOut.textContent);
    flashBtn(container.querySelector('#url-enc-copy'), 'Copied!');
  });

  // Decode
  const decIn = container.querySelector('#url-dec-input');
  const decOut = container.querySelector('#url-dec-output');
  const decStatus = container.querySelector('#url-dec-status');

  decIn.addEventListener('input', () => {
    const val = decIn.value.trim();
    if (!val) { decOut.textContent = ''; decStatus.innerHTML = ''; return; }
    try {
      decOut.textContent = decodeURIComponent(val);
      decOut.className = 'pane-output';
      decStatus.innerHTML = '<span class="status-badge ok">OK</span>';
    } catch (e) {
      decOut.textContent = e.message;
      decOut.className = 'pane-output error';
      decStatus.innerHTML = '<span class="status-badge err">Error</span>';
    }
  });
  container.querySelector('#url-dec-paste').addEventListener('click', async () => {
    decIn.value = await navigator.clipboard.readText();
    decIn.dispatchEvent(new Event('input'));
  });
  container.querySelector('#url-dec-clear').addEventListener('click', () => { decIn.value = ''; decOut.textContent = ''; decStatus.innerHTML = ''; });
  container.querySelector('#url-dec-copy').addEventListener('click', () => {
    navigator.clipboard.writeText(decOut.textContent);
    flashBtn(container.querySelector('#url-dec-copy'), 'Copied!');
  });

  // Query parser
  const parseIn = container.querySelector('#url-parse-input');
  const parseOut = container.querySelector('#url-parse-output');

  parseIn.addEventListener('input', () => {
    const val = parseIn.value.trim();
    if (!val) { parseOut.textContent = ''; return; }
    try {
      let url;
      try { url = new URL(val); } catch { url = new URL('https://dummy.com/' + val); }
      const parts = [];
      if (parseIn.value.includes('://')) {
        parts.push(`Protocol:  ${url.protocol}`);
        parts.push(`Host:      ${url.host}`);
        if (url.pathname !== '/') parts.push(`Path:      ${url.pathname}`);
        if (url.hash) parts.push(`Hash:      ${url.hash}`);
        parts.push('');
      }
      if (url.search) {
        parts.push('Query Parameters:');
        url.searchParams.forEach((v, k) => {
          parts.push(`  ${k} = ${decodeURIComponent(v)}`);
        });
      } else {
        parts.push('No query parameters.');
      }
      parseOut.textContent = parts.join('\n');
      parseOut.className = 'pane-output';
    } catch (e) {
      parseOut.textContent = e.message;
      parseOut.className = 'pane-output error';
    }
  });
  container.querySelector('#url-parse-paste').addEventListener('click', async () => {
    parseIn.value = await navigator.clipboard.readText();
    parseIn.dispatchEvent(new Event('input'));
  });
  container.querySelector('#url-parse-clear').addEventListener('click', () => { parseIn.value = ''; parseOut.textContent = ''; });
}

function flashBtn(btn, text) {
  const orig = btn.textContent;
  btn.textContent = text;
  setTimeout(() => { btn.textContent = orig; }, 1500);
}
