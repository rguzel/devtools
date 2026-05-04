const LANGUAGES = [
  { code: 'tr', label: 'Turkish' },
  { code: 'en', label: 'English' },
  { code: 'de', label: 'German' },
  { code: 'fr', label: 'French' },
  { code: 'es', label: 'Spanish' },
  { code: 'it', label: 'Italian' },
  { code: 'pt', label: 'Portuguese' },
  { code: 'ru', label: 'Russian' },
  { code: 'ar', label: 'Arabic' },
  { code: 'zh', label: 'Chinese' },
  { code: 'ja', label: 'Japanese' },
  { code: 'ko', label: 'Korean' },
  { code: 'nl', label: 'Dutch' },
  { code: 'pl', label: 'Polish' },
];

export function init(container) {
  container.innerHTML = `
    <style>
      .ocr-layout {
        display: grid;
        grid-template-columns: 300px 1fr;
        height: 100%;
        overflow: hidden;
      }

      /* ── Left panel ── */
      .ocr-left {
        display: flex;
        flex-direction: column;
        border-right: 1px solid var(--border);
        overflow: hidden;
      }

      .ocr-section {
        padding: 14px 16px;
        border-bottom: 1px solid var(--border);
        flex-shrink: 0;
      }
      .ocr-section-title {
        font-size: 10px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.7px;
        color: var(--text-muted);
        margin-bottom: 10px;
      }

      /* Drop zone */
      .ocr-drop {
        border: 2px dashed var(--border);
        border-radius: var(--radius);
        padding: 20px 12px;
        text-align: center;
        cursor: pointer;
        transition: border-color 0.2s, background 0.2s;
      }
      .ocr-drop:hover, .ocr-drop.drag-over {
        border-color: var(--accent);
        background: color-mix(in srgb, var(--accent) 6%, transparent);
      }
      .ocr-drop-icon { font-size: 1.6rem; margin-bottom: 6px; }
      .ocr-drop p { margin: 0; color: var(--text-muted); font-size: 0.82rem; line-height: 1.4; }
      .ocr-drop p strong { color: var(--accent); }
      .ocr-file-badge {
        display: none;
        align-items: center;
        gap: 8px;
        margin-top: 10px;
        padding: 6px 10px;
        background: var(--surface);
        border-radius: var(--radius);
        font-size: 0.8rem;
        color: var(--text);
        word-break: break-all;
      }
      .ocr-file-badge.visible { display: flex; }
      .ocr-file-badge svg { flex-shrink: 0; color: var(--accent); }

      /* Language chips */
      .ocr-lang-grid {
        display: flex;
        flex-wrap: wrap;
        gap: 5px;
      }
      .lang-chip {
        padding: 3px 10px;
        border-radius: 20px;
        border: 1px solid var(--border);
        cursor: pointer;
        font-size: 0.78rem;
        user-select: none;
        color: var(--text-muted);
        transition: all 0.15s;
        background: var(--surface);
      }
      .lang-chip:hover { border-color: var(--accent); color: var(--text); }
      .lang-chip.selected {
        background: var(--accent);
        color: #fff;
        border-color: var(--accent);
      }

      /* Options */
      .ocr-option-row {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 0.85rem;
        color: var(--text-muted);
        cursor: pointer;
        user-select: none;
      }
      .ocr-option-row input { accent-color: var(--accent); cursor: pointer; }

      /* Run button */
      .ocr-run-wrap {
        padding: 14px 16px;
        flex-shrink: 0;
      }
      .ocr-run-btn {
        width: 100%;
        padding: 9px;
        border-radius: var(--radius);
        border: none;
        background: var(--accent);
        color: #fff;
        font-size: 0.9rem;
        font-weight: 600;
        font-family: var(--font-ui);
        cursor: pointer;
        transition: background 0.15s, opacity 0.15s;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
      }
      .ocr-run-btn:hover { background: var(--accent-hover); }
      .ocr-run-btn:disabled { opacity: 0.45; cursor: not-allowed; }
      .ocr-spinner {
        width: 16px; height: 16px;
        border: 2px solid #fff5;
        border-top-color: #fff;
        border-radius: 50%;
        animation: ocr-spin 0.7s linear infinite;
        flex-shrink: 0;
      }
      @keyframes ocr-spin { to { transform: rotate(360deg); } }

      /* ── Right panel ── */
      .ocr-right {
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }

      .ocr-right-toolbar {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 14px;
        background: var(--surface);
        border-bottom: 1px solid var(--border);
        flex-shrink: 0;
        flex-wrap: wrap;
      }
      .ocr-right-label {
        font-size: 11px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        color: var(--text-muted);
        margin-right: auto;
      }

      .page-tab {
        padding: 3px 10px;
        border-radius: 4px;
        border: 1px solid var(--border);
        cursor: pointer;
        font-size: 0.78rem;
        color: var(--text-muted);
        background: var(--surface2);
        transition: all 0.15s;
      }
      .page-tab:hover { border-color: var(--accent); color: var(--text); }
      .page-tab.active { background: var(--accent); color: #fff; border-color: var(--accent); }

      .ocr-result-area {
        flex: 1;
        padding: 18px 20px;
        font-family: var(--font-mono);
        font-size: 13px;
        line-height: 1.7;
        color: var(--text);
        white-space: pre-wrap;
        word-break: break-word;
        overflow-y: auto;
        background: var(--bg);
      }

      .ocr-placeholder {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
        gap: 12px;
        color: var(--text-muted);
        font-family: var(--font-ui);
        font-size: 0.9rem;
        opacity: 0.5;
      }
      .ocr-placeholder svg { opacity: 0.4; }

      .ocr-error-bar {
        display: none;
        align-items: center;
        gap: 8px;
        padding: 10px 16px;
        background: #2a1010;
        border-top: 1px solid #a33;
        color: var(--error);
        font-size: 0.85rem;
        flex-shrink: 0;
      }
      .ocr-error-bar.visible { display: flex; }
    </style>

    <div class="ocr-layout">

      <!-- Left: controls -->
      <div class="ocr-left">

        <div class="ocr-section">
          <div class="ocr-section-title">File</div>
          <div class="ocr-drop" id="ocr-drop">
            <div class="ocr-drop-icon">📄</div>
            <p>Drop image or PDF here<br>or <strong>click to browse</strong></p>
            <input type="file" id="ocr-file-input" accept="image/*,.pdf" style="display:none">
          </div>
          <div class="ocr-file-badge" id="ocr-file-badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            <span id="ocr-file-name"></span>
          </div>
        </div>

        <div class="ocr-section">
          <div class="ocr-section-title">Languages</div>
          <div class="ocr-lang-grid" id="ocr-lang-grid"></div>
        </div>

        <div class="ocr-section">
          <div class="ocr-section-title">Options</div>
          <label class="ocr-option-row">
            <input type="checkbox" id="ocr-detail">
            Show bounding boxes
          </label>
        </div>

        <div style="flex:1"></div>

        <div class="ocr-run-wrap">
          <button class="ocr-run-btn" id="ocr-run" disabled>Extract Text</button>
        </div>

      </div>

      <!-- Right: result -->
      <div class="ocr-right">
        <div class="ocr-right-toolbar">
          <span class="ocr-right-label">Result</span>
          <div id="ocr-page-tabs" style="display:flex;gap:5px;flex-wrap:wrap"></div>
          <button class="btn" id="ocr-copy" style="display:none">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            Copy
          </button>
          <button class="btn" id="ocr-download" style="display:none">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Download
          </button>
        </div>

        <div class="ocr-result-area" id="ocr-result">
          <div class="ocr-placeholder">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 8h3v3H7z"/><path d="M14 8h3"/><path d="M14 12h3"/><path d="M7 16h10"/></svg>
            <span>Upload a file and click Extract Text</span>
          </div>
        </div>

        <div class="ocr-error-bar" id="ocr-error"></div>
      </div>

    </div>
  `;

  const drop = container.querySelector('#ocr-drop');
  const fileInput = container.querySelector('#ocr-file-input');
  const fileBadge = container.querySelector('#ocr-file-badge');
  const fileNameEl = container.querySelector('#ocr-file-name');
  const runBtn = container.querySelector('#ocr-run');
  const resultArea = container.querySelector('#ocr-result');
  const pageTabs = container.querySelector('#ocr-page-tabs');
  const copyBtn = container.querySelector('#ocr-copy');
  const downloadBtn = container.querySelector('#ocr-download');
  const errorEl = container.querySelector('#ocr-error');
  const detailCb = container.querySelector('#ocr-detail');
  const langGrid = container.querySelector('#ocr-lang-grid');

  // Language chips
  const selected = new Set(['tr', 'en']);
  LANGUAGES.forEach(({ code, label }) => {
    const chip = document.createElement('div');
    chip.className = 'lang-chip' + (selected.has(code) ? ' selected' : '');
    chip.textContent = label;
    chip.dataset.code = code;
    chip.addEventListener('click', () => {
      if (selected.has(code)) {
        if (selected.size === 1) return;
        selected.delete(code);
        chip.classList.remove('selected');
      } else {
        selected.add(code);
        chip.classList.add('selected');
      }
    });
    langGrid.appendChild(chip);
  });

  let currentFile = null;
  let pages = [];

  drop.addEventListener('click', () => fileInput.click());
  drop.addEventListener('dragover', e => { e.preventDefault(); drop.classList.add('drag-over'); });
  drop.addEventListener('dragleave', () => drop.classList.remove('drag-over'));
  drop.addEventListener('drop', e => {
    e.preventDefault();
    drop.classList.remove('drag-over');
    const f = e.dataTransfer.files[0];
    if (f) setFile(f);
  });
  fileInput.addEventListener('change', () => { if (fileInput.files[0]) setFile(fileInput.files[0]); });

  function setFile(f) {
    currentFile = f;
    fileNameEl.textContent = f.name;
    fileBadge.classList.add('visible');
    runBtn.disabled = false;
    errorEl.classList.remove('visible');
  }

  runBtn.addEventListener('click', async () => {
    if (!currentFile) return;
    runBtn.disabled = true;
    runBtn.innerHTML = '<span class="ocr-spinner"></span>Processing…';
    errorEl.classList.remove('visible');
    resultArea.innerHTML = '<div class="ocr-placeholder"><span style="opacity:.5">Processing…</span></div>';
    copyBtn.style.display = 'none';
    downloadBtn.style.display = 'none';
    pageTabs.innerHTML = '';

    const form = new FormData();
    form.append('file', currentFile);
    form.append('languages', Array.from(selected).join(','));
    form.append('detail', detailCb.checked ? 'true' : 'false');

    try {
      const res = await fetch('https://ocr.recepguzel.com/ocr', { method: 'POST', body: form });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: res.statusText }));
        throw new Error(err.detail || res.statusText);
      }
      const data = await res.json();
      pages = data.pages_detail || [{ text: data.text || '' }];
      renderPages(0);
      copyBtn.style.display = '';
      downloadBtn.style.display = '';
    } catch (e) {
      resultArea.innerHTML = '<div class="ocr-placeholder"><span>Upload a file and click Extract Text</span></div>';
      errorEl.textContent = '⚠ ' + e.message;
      errorEl.classList.add('visible');
    } finally {
      runBtn.disabled = false;
      runBtn.textContent = 'Extract Text';
    }
  });

  function renderPages(active) {
    pageTabs.innerHTML = '';
    if (pages.length > 1) {
      pages.forEach((_, i) => {
        const tab = document.createElement('div');
        tab.className = 'page-tab' + (i === active ? ' active' : '');
        tab.textContent = `Page ${i + 1}`;
        tab.addEventListener('click', () => renderPages(i));
        pageTabs.appendChild(tab);
      });
    }
    resultArea.textContent = pages[active]?.text ?? '';
  }

  copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(resultArea.textContent);
    copyBtn.textContent = 'Copied!';
    setTimeout(() => { copyBtn.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> Copy'; }, 1500);
  });

  downloadBtn.addEventListener('click', () => {
    const all = pages.map((p, i) => pages.length > 1 ? `--- Page ${i + 1} ---\n${p.text}` : p.text).join('\n\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([all], { type: 'text/plain' }));
    a.download = 'ocr-result.txt';
    a.click();
  });
}
