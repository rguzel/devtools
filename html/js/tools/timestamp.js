// Unix Timestamp Converter

export function init(container) {
  container.innerHTML = `
    <div style="display:flex;flex-direction:column;gap:20px;padding:24px;max-width:700px;overflow-y:auto;flex:1;">

      <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;">
        <button class="btn primary" id="ts-now">Use Now</button>
        <span id="ts-live" style="font-family:var(--font-mono);font-size:13px;color:var(--text-muted);"></span>
      </div>

      <div class="card" style="background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:20px;display:flex;flex-direction:column;gap:14px;">
        <div class="field-row">
          <label>Unix Timestamp (seconds)</label>
          <div style="display:flex;gap:8px;">
            <input type="number" id="ts-unix-sec" placeholder="e.g. 1700000000" style="flex:1;">
            <button class="btn" id="ts-unix-sec-copy">Copy</button>
          </div>
        </div>
        <div class="field-row">
          <label>Unix Timestamp (milliseconds)</label>
          <div style="display:flex;gap:8px;">
            <input type="number" id="ts-unix-ms" placeholder="e.g. 1700000000000" style="flex:1;">
            <button class="btn" id="ts-unix-ms-copy">Copy</button>
          </div>
        </div>
        <div class="field-row">
          <label>ISO 8601 (UTC)</label>
          <div style="display:flex;gap:8px;">
            <input type="text" id="ts-iso" placeholder="e.g. 2023-11-14T22:13:20.000Z" style="flex:1;">
            <button class="btn" id="ts-iso-copy">Copy</button>
          </div>
        </div>
        <div class="field-row">
          <label>Local Date/Time</label>
          <div style="display:flex;gap:8px;">
            <input type="datetime-local" id="ts-local" style="flex:1;">
            <button class="btn" id="ts-local-copy">Copy</button>
          </div>
        </div>
        <div class="field-row">
          <label>Human-readable (UTC)</label>
          <div style="display:flex;gap:8px;">
            <input type="text" id="ts-human" readonly style="flex:1;opacity:0.7;">
            <button class="btn" id="ts-human-copy">Copy</button>
          </div>
        </div>
      </div>

      <div id="ts-diff-section" style="background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:20px;">
        <div style="font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;color:var(--text-muted);margin-bottom:12px;">Relative Time</div>
        <div id="ts-relative" style="font-size:14px;"></div>
      </div>
    </div>
  `;

  // Styles for the card fields
  const style = document.createElement('style');
  style.textContent = `
    .field-row { display:flex;flex-direction:column;gap:6px; }
    .field-row label { font-size:11px;color:var(--text-muted);font-weight:600;text-transform:uppercase;letter-spacing:0.4px; }
    .field-row input { background:var(--bg);border:1px solid var(--border);color:var(--text);padding:7px 10px;
      border-radius:var(--radius);font-size:13px;font-family:var(--font-mono);outline:none;transition:border-color 0.15s; }
    .field-row input:focus { border-color:var(--accent); }
    .field-row input[readonly] { cursor:default; }
  `;
  container.appendChild(style);

  let currentDate = new Date();
  let updating = false;

  const unixSec = container.querySelector('#ts-unix-sec');
  const unixMs = container.querySelector('#ts-unix-ms');
  const iso = container.querySelector('#ts-iso');
  const local = container.querySelector('#ts-local');
  const human = container.querySelector('#ts-human');
  const relative = container.querySelector('#ts-relative');
  const live = container.querySelector('#ts-live');

  function setDate(d) {
    if (isNaN(d.getTime())) return;
    currentDate = d;
    updating = true;
    unixSec.value = Math.floor(d.getTime() / 1000);
    unixMs.value = d.getTime();
    iso.value = d.toISOString();
    // datetime-local format: YYYY-MM-DDTHH:mm
    const pad = n => String(n).padStart(2, '0');
    local.value = `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    human.value = d.toUTCString();
    updateRelative(d);
    updating = false;
  }

  function updateRelative(d) {
    const diff = d.getTime() - Date.now();
    const abs = Math.abs(diff);
    const past = diff < 0;
    const mins = Math.floor(abs / 60000);
    const hours = Math.floor(abs / 3600000);
    const days = Math.floor(abs / 86400000);
    let rel;
    if (abs < 60000) rel = 'just now';
    else if (mins < 60) rel = `${mins} minute${mins > 1 ? 's' : ''} ${past ? 'ago' : 'from now'}`;
    else if (hours < 24) rel = `${hours} hour${hours > 1 ? 's' : ''} ${past ? 'ago' : 'from now'}`;
    else rel = `${days} day${days > 1 ? 's' : ''} ${past ? 'ago' : 'from now'}`;
    relative.textContent = rel;
  }

  unixSec.addEventListener('input', () => { if (!updating) setDate(new Date(parseInt(unixSec.value) * 1000)); });
  unixMs.addEventListener('input', () => { if (!updating) setDate(new Date(parseInt(unixMs.value))); });
  iso.addEventListener('change', () => { if (!updating) setDate(new Date(iso.value)); });
  local.addEventListener('input', () => { if (!updating) setDate(new Date(local.value)); });

  container.querySelector('#ts-now').addEventListener('click', () => setDate(new Date()));

  // Copy buttons
  [['#ts-unix-sec-copy', unixSec], ['#ts-unix-ms-copy', unixMs],
   ['#ts-iso-copy', iso], ['#ts-local-copy', local], ['#ts-human-copy', human]].forEach(([sel, inp]) => {
    container.querySelector(sel).addEventListener('click', () => {
      navigator.clipboard.writeText(inp.value);
      flashBtn(container.querySelector(sel), 'Copied!');
    });
  });

  // Live clock
  function tick() {
    live.textContent = `Now: ${new Date().toISOString()}`;
  }
  tick();
  const interval = setInterval(tick, 1000);

  // Clean up interval when panel is removed
  const observer = new MutationObserver(() => {
    if (!document.contains(container)) { clearInterval(interval); observer.disconnect(); }
  });
  observer.observe(document.body, { childList: true, subtree: true });

  setDate(new Date());
}

function flashBtn(btn, text) {
  const orig = btn.textContent;
  btn.textContent = text;
  setTimeout(() => { btn.textContent = orig; }, 1500);
}
