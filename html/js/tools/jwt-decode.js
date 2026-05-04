// JWT Inspector (decode without verification)

export function init(container) {
  container.innerHTML = `
    <div class="editor-panes">
      <div class="editor-pane">
        <div class="pane-toolbar">
          <span class="pane-label">JWT Token</span>
          <button class="btn" id="jwt-paste">Paste</button>
          <button class="btn danger" id="jwt-clear">Clear</button>
        </div>
        <textarea class="pane-textarea" id="jwt-input" placeholder="Paste JWT token here...
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"></textarea>
      </div>
      <div class="editor-pane" style="flex-direction:column;">
        <div class="pane-toolbar">
          <span class="pane-label">Header</span>
          <span id="jwt-algo"></span>
        </div>
        <div class="pane-output" id="jwt-header" style="flex:0;min-height:80px;max-height:120px;border-bottom:1px solid var(--border);"></div>
        <div class="pane-toolbar" style="border-top:none;">
          <span class="pane-label">Payload</span>
          <span id="jwt-exp"></span>
        </div>
        <div class="pane-output" id="jwt-payload" style="flex:1;"></div>
        <div class="pane-toolbar" style="border-top:1px solid var(--border);">
          <span class="pane-label">Signature</span>
          <span class="status-badge info" style="font-size:10px;">Not verified</span>
        </div>
        <div class="pane-output" id="jwt-sig" style="flex:0;min-height:40px;max-height:60px;color:var(--text-muted);font-size:11px;"></div>
      </div>
    </div>
  `;

  const input = container.querySelector('#jwt-input');
  const header = container.querySelector('#jwt-header');
  const payload = container.querySelector('#jwt-payload');
  const sig = container.querySelector('#jwt-sig');
  const algoEl = container.querySelector('#jwt-algo');
  const expEl = container.querySelector('#jwt-exp');

  function decode() {
    const val = input.value.trim();
    if (!val) { header.textContent = ''; payload.textContent = ''; sig.textContent = ''; algoEl.innerHTML = ''; expEl.innerHTML = ''; return; }

    const parts = val.split('.');
    if (parts.length !== 3) {
      header.textContent = 'Invalid: JWT must have 3 parts separated by dots';
      header.className = 'pane-output error';
      payload.textContent = ''; sig.textContent = '';
      return;
    }

    try {
      const h = JSON.parse(b64url(parts[0]));
      const p = JSON.parse(b64url(parts[1]));

      header.textContent = JSON.stringify(h, null, 2);
      header.className = 'pane-output';
      algoEl.innerHTML = h.alg ? `<span class="status-badge info">${h.alg}</span>` : '';

      payload.textContent = JSON.stringify(p, null, 2);
      payload.className = 'pane-output';

      if (p.exp) {
        const expDate = new Date(p.exp * 1000);
        const expired = expDate < new Date();
        const label = expDate.toLocaleString();
        expEl.innerHTML = `<span class="status-badge ${expired ? 'err' : 'ok'}">${expired ? 'Expired' : 'Valid'}: ${label}</span>`;
      } else {
        expEl.innerHTML = '<span class="status-badge info">No exp claim</span>';
      }

      sig.textContent = parts[2];
    } catch (e) {
      header.textContent = 'Decode error: ' + e.message;
      header.className = 'pane-output error';
      payload.textContent = ''; sig.textContent = '';
    }
  }

  input.addEventListener('input', decode);
  container.querySelector('#jwt-paste').addEventListener('click', async () => {
    input.value = await navigator.clipboard.readText(); decode();
  });
  container.querySelector('#jwt-clear').addEventListener('click', () => {
    input.value = ''; header.textContent = ''; payload.textContent = ''; sig.textContent = ''; algoEl.innerHTML = ''; expEl.innerHTML = '';
  });
}

function b64url(str) {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) str += '=';
  return decodeURIComponent(escape(atob(str)));
}
