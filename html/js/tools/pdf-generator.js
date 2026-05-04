export function init(container) {
  container.innerHTML = `
    <style>
      .pdf-layout {
        display: grid;
        grid-template-columns: 260px 1fr;
        height: 100%;
        overflow: hidden;
      }
      .pdf-left {
        display: flex;
        flex-direction: column;
        border-right: 1px solid var(--border);
        overflow: hidden;
      }
      .pdf-section {
        padding: 14px 16px;
        border-bottom: 1px solid var(--border);
        flex-shrink: 0;
      }
      .pdf-section-title {
        font-size: 10px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.7px;
        color: var(--text-muted);
        margin-bottom: 10px;
      }
      .pdf-field {
        display: flex;
        flex-direction: column;
        gap: 5px;
        margin-bottom: 10px;
      }
      .pdf-field:last-child { margin-bottom: 0; }
      .pdf-field label { font-size: 0.82rem; color: var(--text-muted); }
      .pdf-input {
        background: var(--surface2);
        border: 1px solid var(--border);
        border-radius: var(--radius);
        color: var(--text);
        padding: 6px 10px;
        font-size: 0.85rem;
        font-family: var(--font-ui);
        width: 100%;
        box-sizing: border-box;
        transition: border-color 0.15s;
      }
      .pdf-input:focus { outline: none; border-color: var(--accent); }
      .pdf-run-wrap {
        padding: 14px 16px;
        flex-shrink: 0;
        margin-top: auto;
      }
      .pdf-run-btn {
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
      .pdf-run-btn:hover { background: var(--accent-hover); }
      .pdf-run-btn:disabled { opacity: 0.45; cursor: not-allowed; }
      .pdf-spinner {
        width: 16px; height: 16px;
        border: 2px solid #fff5;
        border-top-color: #fff;
        border-radius: 50%;
        animation: pdf-spin 0.7s linear infinite;
        flex-shrink: 0;
      }
      @keyframes pdf-spin { to { transform: rotate(360deg); } }
      .pdf-right {
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }
      .pdf-right-toolbar {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 14px;
        background: var(--surface);
        border-bottom: 1px solid var(--border);
        flex-shrink: 0;
      }
      .pdf-right-label {
        font-size: 11px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        color: var(--text-muted);
        margin-right: auto;
      }
      .pdf-editor {
        flex: 1;
        background: var(--bg);
        border: none;
        outline: none;
        color: var(--text);
        font-family: var(--font-mono);
        font-size: 13px;
        line-height: 1.7;
        padding: 18px 20px;
        resize: none;
        overflow-y: auto;
      }
      .pdf-error-bar {
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
      .pdf-error-bar.visible { display: flex; }
    </style>

    <div class="pdf-layout">
      <div class="pdf-left">
        <div class="pdf-section">
          <div class="pdf-section-title">Document</div>
          <div class="pdf-field">
            <label>Title</label>
            <input class="pdf-input" id="pdf-title" type="text" placeholder="My Document">
          </div>
        </div>
        <div class="pdf-section">
          <div class="pdf-section-title">Page</div>
          <div class="pdf-field">
            <label>Size</label>
            <select class="pdf-input" id="pdf-size">
              <option value="A4">A4</option>
              <option value="Letter">Letter</option>
              <option value="A3">A3</option>
            </select>
          </div>
          <div class="pdf-field">
            <label>Orientation</label>
            <select class="pdf-input" id="pdf-orient">
              <option value="portrait">Portrait</option>
              <option value="landscape">Landscape</option>
            </select>
          </div>
        </div>
        <div class="pdf-section">
          <div class="pdf-section-title">Options</div>
          <label style="display:flex;align-items:center;gap:8px;font-size:0.85rem;color:var(--text-muted);cursor:pointer">
            <input type="checkbox" id="pdf-show-meta" checked style="accent-color:var(--accent)">
            Show generation date &amp; footer
          </label>
        </div>
        <div style="flex:1"></div>
        <div class="pdf-run-wrap">
          <button class="pdf-run-btn" id="pdf-run">Generate PDF</button>
        </div>
      </div>

      <div class="pdf-right">
        <div class="pdf-right-toolbar">
          <span class="pdf-right-label">Markdown</span>
          <span style="font-size:0.78rem;color:var(--text-muted)">Supports **bold**, # headings, - lists, \`code\`</span>
        </div>
        <textarea class="pdf-editor" id="pdf-md" placeholder="# Hello World&#10;&#10;Write your **markdown** here…"></textarea>
        <div class="pdf-error-bar" id="pdf-error"></div>
      </div>
    </div>
  `;

  const mdInput = container.querySelector('#pdf-md');
  const titleInput = container.querySelector('#pdf-title');
  const runBtn = container.querySelector('#pdf-run');
  const errorEl = container.querySelector('#pdf-error');
  const showMetaCb = container.querySelector('#pdf-show-meta');

  runBtn.addEventListener('click', async () => {
    const content = mdInput.value.trim();
    if (!content) return;

    runBtn.disabled = true;
    runBtn.innerHTML = '<span class="pdf-spinner"></span>Generating…';
    errorEl.classList.remove('visible');

    try {
      const res = await fetch('https://pdf.recepguzel.com/mcp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json, text/event-stream',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'tools/call',
          id: 1,
          params: {
            name: 'generate_pdf',
            arguments: {
              title: titleInput.value.trim() || 'Document',
              content,
              show_meta: showMetaCb.checked,
            },
          },
        }),
      });

      if (!res.ok) throw new Error(`Server error: ${res.status}`);

      const data = await res.json();
      if (data.error) throw new Error(data.error.message || JSON.stringify(data.error));

      // Response contains a download URL in the text content
      const text = data.result?.content?.[0]?.text || '';
      const urlMatch = text.match(/https?:\/\/\S+\.pdf/);
      if (!urlMatch) throw new Error('No PDF URL in response: ' + text);

      // Rewrite internal URL to go through the public domain
      const pdfUrl = urlMatch[0].replace(/^https?:\/\/[^/]+/, 'https://pdf.recepguzel.com');

      const a = document.createElement('a');
      a.href = pdfUrl;
      const filename = (titleInput.value.trim() || 'document').replace(/[^a-z0-9_-]/gi, '_') + '.pdf';
      a.download = filename;
      a.target = '_blank';
      a.click();
    } catch (e) {
      errorEl.textContent = '⚠ ' + e.message;
      errorEl.classList.add('visible');
    } finally {
      runBtn.disabled = false;
      runBtn.textContent = 'Generate PDF';
    }
  });
}
