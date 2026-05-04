// Base64 Encode / Decode

export function init(container) {
  container.innerHTML = `
    <style>
      #base64-root { display: flex; flex-direction: column; height: 100%; width: 100%; overflow: hidden; }
      #base64-root .subtabs { flex-shrink: 0; }
      #base64-root .options-row { flex-shrink: 0; }
      #base64-root .subtab-panel { flex: 1; overflow: hidden; }
      #base64-root .editor-panes { flex: 1; overflow: hidden; }
    </style>
    <div id="base64-root">
    <div class="subtabs">
      <div class="subtab active" data-tab="encode">Encode</div>
      <div class="subtab" data-tab="decode">Decode</div>
    </div>

    <div class="subtab-panel active" id="b64-encode" style="flex-direction:column;overflow:hidden;">
      <div class="editor-panes">
        <div class="editor-pane">
          <div class="pane-toolbar">
            <span class="pane-label">Plain text</span>
            <button class="btn danger" id="b64-enc-clear">Clear</button>
          </div>
          <textarea class="pane-textarea" id="b64-enc-input" placeholder="Type or paste text to encode..."></textarea>
        </div>
        <div class="editor-pane">
          <div class="pane-toolbar">
            <span class="pane-label">Base64</span>
            <button class="btn" id="b64-enc-copy">Copy</button>
          </div>
          <div class="pane-output" id="b64-enc-output"></div>
        </div>
      </div>
    </div>

    <div class="subtab-panel" id="b64-decode" style="flex-direction:column;overflow:hidden;">
      <div class="editor-panes">
        <div class="editor-pane">
          <div class="pane-toolbar">
            <span class="pane-label">Base64</span>
            <button class="btn" id="b64-dec-paste">Paste</button>
            <button class="btn danger" id="b64-dec-clear">Clear</button>
          </div>
          <textarea class="pane-textarea" id="b64-dec-input" placeholder="Paste Base64 string..."></textarea>
        </div>
        <div class="editor-pane">
          <div class="pane-toolbar">
            <span class="pane-label">Decoded text</span>
            <span id="b64-dec-status"></span>
            <button class="btn" id="b64-dec-copy">Copy</button>
          </div>
          <div class="pane-output" id="b64-dec-output"></div>
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
      container.querySelector('#b64-' + tab.dataset.tab).classList.add('active');
    });
  });

  // Encode
  const encIn = container.querySelector('#b64-enc-input');
  const encOut = container.querySelector('#b64-enc-output');

  encIn.addEventListener('input', () => {
    try {
      encOut.textContent = btoa(unescape(encodeURIComponent(encIn.value)));
      encOut.className = 'pane-output';
    } catch (e) {
      encOut.textContent = e.message;
      encOut.className = 'pane-output error';
    }
  });

  container.querySelector('#b64-enc-clear').addEventListener('click', () => {
    encIn.value = ''; encOut.textContent = '';
  });
  container.querySelector('#b64-enc-copy').addEventListener('click', () => {
    navigator.clipboard.writeText(encOut.textContent);
    flashBtn(container.querySelector('#b64-enc-copy'), 'Copied!');
  });

  // Decode
  const decIn = container.querySelector('#b64-dec-input');
  const decOut = container.querySelector('#b64-dec-output');
  const decStatus = container.querySelector('#b64-dec-status');

  decIn.addEventListener('input', () => {
    const val = decIn.value.trim();
    if (!val) { decOut.textContent = ''; decStatus.innerHTML = ''; return; }
    try {
      decOut.textContent = decodeURIComponent(escape(atob(val)));
      decOut.className = 'pane-output';
      decStatus.innerHTML = '<span class="status-badge ok">Valid</span>';
    } catch (e) {
      decOut.textContent = 'Invalid Base64: ' + e.message;
      decOut.className = 'pane-output error';
      decStatus.innerHTML = '<span class="status-badge err">Invalid</span>';
    }
  });

  container.querySelector('#b64-dec-paste').addEventListener('click', async () => {
    decIn.value = await navigator.clipboard.readText();
    decIn.dispatchEvent(new Event('input'));
  });
  container.querySelector('#b64-dec-clear').addEventListener('click', () => {
    decIn.value = ''; decOut.textContent = ''; decStatus.innerHTML = '';
  });
  container.querySelector('#b64-dec-copy').addEventListener('click', () => {
    navigator.clipboard.writeText(decOut.textContent);
    flashBtn(container.querySelector('#b64-dec-copy'), 'Copied!');
  });
}

function flashBtn(btn, text) {
  const orig = btn.textContent;
  btn.textContent = text;
  setTimeout(() => { btn.textContent = orig; }, 1500);
}
