export function init(container) {
  container.innerHTML = `
    <style>
      .ipt-layout {
        display: flex;
        flex-direction: column;
        height: 100%;
        overflow-y: auto;
        overflow-x: hidden;
        box-sizing: border-box;
        width: 100%;
        padding: 24px;
        gap: 20px;
        background: var(--bg);
      }

      /* Cards */
      .ipt-card {
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: 10px;
        overflow: hidden;
        min-width: 0;
      }
      .ipt-card-header {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 14px 18px;
        background: var(--surface2);
        border-bottom: 1px solid var(--border);
      }
      .ipt-card-title {
        font-size: 13px;
        font-weight: 600;
        color: var(--text);
      }
      .ipt-card-body {
        padding: 18px;
      }

      /* IP hero */
      .ipt-ip-hero {
        display: flex;
        align-items: center;
        gap: 20px;
        flex-wrap: wrap;
      }
      .ipt-ip-address {
        font-size: 2rem;
        font-weight: 700;
        font-family: var(--font-mono);
        color: var(--accent);
        letter-spacing: 1px;
      }
      .ipt-ip-meta {
        display: flex;
        flex-direction: column;
        gap: 3px;
      }
      .ipt-ip-flag {
        font-size: 1.5rem;
      }
      .ipt-ip-location {
        font-size: 0.9rem;
        color: var(--text);
      }
      .ipt-ip-org {
        font-size: 0.8rem;
        color: var(--text-muted);
      }

      /* Info grid */
      .ipt-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 12px;
      }
      .ipt-info-item {
        display: flex;
        flex-direction: column;
        gap: 3px;
      }
      .ipt-info-label {
        font-size: 10px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.6px;
        color: var(--text-muted);
      }
      .ipt-info-value {
        font-size: 0.88rem;
        color: var(--text);
        font-family: var(--font-mono);
      }

      /* DNS leak */
      .ipt-dns-controls {
        display: flex;
        align-items: center;
        gap: 10px;
        flex-wrap: wrap;
      }
      .ipt-btn {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 7px 16px;
        border-radius: var(--radius);
        border: none;
        background: var(--accent);
        color: #fff;
        font-size: 0.85rem;
        font-weight: 600;
        font-family: var(--font-ui);
        cursor: pointer;
        transition: background 0.15s, opacity 0.15s;
      }
      .ipt-btn:hover { background: var(--accent-hover); }
      .ipt-btn:disabled { opacity: 0.45; cursor: not-allowed; }
      .ipt-btn.secondary {
        background: var(--surface2);
        color: var(--text);
        border: 1px solid var(--border);
      }
      .ipt-btn.secondary:hover { border-color: var(--accent); color: var(--accent); background: var(--surface2); }
      .ipt-spinner {
        width: 14px; height: 14px;
        border: 2px solid #fff5;
        border-top-color: #fff;
        border-radius: 50%;
        animation: ipt-spin 0.7s linear infinite;
      }
      @keyframes ipt-spin { to { transform: rotate(360deg); } }

      .ipt-dns-status {
        font-size: 0.82rem;
        color: var(--text-muted);
      }

      .ipt-dns-results {
        margin-top: 14px;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .ipt-dns-server {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 10px 14px;
        background: var(--bg);
        border: 1px solid var(--border);
        border-radius: var(--radius);
        font-size: 0.85rem;
        min-width: 0;
        overflow: hidden;
      }
      .ipt-dns-server .ip { font-family: var(--font-mono); color: var(--text); min-width: 140px; }
      .ipt-dns-server .country { color: var(--text-muted); font-size: 0.8rem; flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .ipt-dns-server .isp { color: var(--text-muted); font-size: 0.8rem; margin-left: auto; white-space: nowrap; flex-shrink: 0; }
      .ipt-badge {
        padding: 2px 8px;
        border-radius: 10px;
        font-size: 0.72rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.4px;
      }
      .ipt-badge.same { background: #0d2a1a; color: var(--success); }
      .ipt-badge.diff { background: #2a1a0a; color: var(--warning); }

      /* WebRTC */
      .ipt-webrtc-results {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-top: 4px;
      }
      .ipt-ip-chip {
        padding: 5px 12px;
        border-radius: 20px;
        border: 1px solid var(--border);
        font-family: var(--font-mono);
        font-size: 0.82rem;
        color: var(--text);
        background: var(--bg);
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .ipt-ip-chip .chip-label {
        font-size: 0.7rem;
        color: var(--text-muted);
        font-family: var(--font-ui);
      }

      /* Copy button */
      .ipt-copy-btn {
        padding: 3px 10px;
        border-radius: 4px;
        border: 1px solid var(--border);
        background: var(--surface2);
        color: var(--text-muted);
        font-size: 0.75rem;
        cursor: pointer;
        font-family: var(--font-ui);
        transition: all 0.15s;
      }
      .ipt-copy-btn:hover { border-color: var(--accent); color: var(--accent); }

      .ipt-skeleton {
        height: 16px;
        background: linear-gradient(90deg, var(--surface) 25%, var(--surface2) 50%, var(--surface) 75%);
        background-size: 200% 100%;
        animation: ipt-shimmer 1.2s infinite;
        border-radius: 4px;
        width: 120px;
      }
      @keyframes ipt-shimmer { to { background-position: -200% 0; } }
    </style>

    <!-- IP Address Card -->
    <div class="ipt-layout" id="ipt-layout">

      <div class="ipt-card">
        <div class="ipt-card-header">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a15 15 0 0 1 4 10 15 15 0 0 1-4 10 15 15 0 0 1-4-10 15 15 0 0 1 4-10z"/><path d="M2 12h20"/></svg>
          <span class="ipt-card-title">Your IP Address#</span>
          <button class="ipt-copy-btn" id="ipt-copy-ip" style="margin-left:auto">Copy</button>
        </div>
        <div class="ipt-card-body">
          <div class="ipt-ip-hero">
            <div>
              <div class="ipt-ip-address" id="ipt-ip"><div class="ipt-skeleton" style="width:200px;height:32px"></div></div>
            </div>
            <div class="ipt-ip-meta">
              <div id="ipt-location" class="ipt-ip-location"><div class="ipt-skeleton"></div></div>
              <div id="ipt-org" class="ipt-ip-org"><div class="ipt-skeleton" style="width:180px"></div></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Details Card -->
      <div class="ipt-card">
        <div class="ipt-card-header">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <span class="ipt-card-title">Connection Details</span>
        </div>
        <div class="ipt-card-body">
          <div class="ipt-grid" id="ipt-details">
            ${['Type','Country','Region','City','Postal','Timezone','ASN','Currency'].map(l =>
              `<div class="ipt-info-item"><div class="ipt-info-label">${l}</div><div class="ipt-info-value ipt-skeleton"></div></div>`
            ).join('')}
          </div>
        </div>
      </div>

      <!-- DNS Leak Test -->
      <div class="ipt-card">
        <div class="ipt-card-header">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          <span class="ipt-card-title">DNS Leak Test</span>
        </div>
        <div class="ipt-card-body">
          <div class="ipt-dns-controls">
            <button class="ipt-btn" id="ipt-dns-btn">Run Test</button>
            <span class="ipt-dns-status" id="ipt-dns-status">Queries Cloudflare, Google, Quad9 and AdGuard DoH resolvers with a random hostname. Any resolver returning answers for a non-existent domain indicates DNS spoofing or interception.</span>
          </div>
          <div class="ipt-dns-results" id="ipt-dns-results"></div>
        </div>
      </div>

      <!-- WebRTC Leak Test -->
      <div class="ipt-card">
        <div class="ipt-card-header">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.6 13.5a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.51 2.78h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 10.1a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 21.92 17z"/></svg>
          <span class="ipt-card-title">WebRTC Leak Test</span>
          <span id="ipt-webrtc-badge" style="margin-left:auto"></span>
        </div>
        <div class="ipt-card-body">
          <p style="font-size:0.82rem;color:var(--text-muted);margin-bottom:12px">WebRTC can expose your real IP even through a VPN. IPs detected by your browser:</p>
          <div class="ipt-webrtc-results" id="ipt-webrtc-results">
            <span style="font-size:0.85rem;color:var(--text-muted)">Detecting…</span>
          </div>
        </div>
      </div>

    </div>
  `;

  // ── IP Info ───────────────────────────────────────────────────────────────
  let userIp = '';

  async function loadIpInfo() {
    try {
      const d = await fetch('https://ipapi.co/json/').then(r => r.json());
      userIp = d.ip || '';

      container.querySelector('#ipt-ip').textContent = d.ip || '—';
      container.querySelector('#ipt-location').innerHTML =
        `<span class="ipt-ip-flag">${flagEmoji(d.country_code)}</span> ${d.city || ''}, ${d.region || ''}, ${d.country_name || ''}`;
      container.querySelector('#ipt-org').textContent = d.org || d.asn || '';

      const fields = [
        ['Type', d.version || 'IPv4'],
        ['Country', `${flagEmoji(d.country_code)} ${d.country_name}`],
        ['Region', d.region],
        ['City', d.city],
        ['Postal', d.postal],
        ['Timezone', d.timezone],
        ['ASN', d.asn],
        ['Currency', d.currency ? `${d.currency} (${d.currency_name})` : '—'],
      ];
      container.querySelector('#ipt-details').innerHTML = fields.map(([label, val]) => `
        <div class="ipt-info-item">
          <div class="ipt-info-label">${label}</div>
          <div class="ipt-info-value">${val || '—'}</div>
        </div>`).join('');
    } catch {
      container.querySelector('#ipt-ip').textContent = 'Failed to load';
    }
  }

  container.querySelector('#ipt-copy-ip').addEventListener('click', () => {
    if (!userIp) return;
    navigator.clipboard.writeText(userIp);
    const btn = container.querySelector('#ipt-copy-ip');
    btn.textContent = 'Copied!';
    setTimeout(() => { btn.textContent = 'Copy'; }, 1500);
  });

  // ── DNS Leak Test ─────────────────────────────────────────────────────────
  container.querySelector('#ipt-dns-btn').addEventListener('click', runDnsTest);

  async function runDnsTest() {
    const btn = container.querySelector('#ipt-dns-btn');
    const status = container.querySelector('#ipt-dns-status');
    const results = container.querySelector('#ipt-dns-results');

    btn.disabled = true;
    btn.innerHTML = '<span class="ipt-spinner"></span>Testing…';
    results.innerHTML = '';
    status.textContent = 'Querying DNS resolvers…';

    // Query a unique hostname via multiple DoH providers simultaneously.
    // A mismatch in resolved IPs indicates DNS manipulation or interception.
    const testHost = `${Math.random().toString(36).slice(2)}.recepguzel.com`;
    const resolvers = [
      { name: 'Cloudflare',  url: `https://cloudflare-dns.com/dns-query?name=${testHost}&type=A`, color: '#f48120' },
      { name: 'Google',      url: `https://dns.google/resolve?name=${testHost}&type=A`,            color: '#4285f4' },
      { name: 'Quad9',       url: `https://dns.quad9.net/dns-query?name=${testHost}&type=A`,       color: '#c00' },
      { name: 'AdGuard',     url: `https://dns.adguard-dns.com/resolve?name=${testHost}&type=A`,   color: '#68bc71' },
    ];

    try {
      const responses = await Promise.all(
        resolvers.map(r =>
          fetch(r.url, { headers: { Accept: 'application/dns-json' } })
            .then(res => res.json())
            .then(data => ({ ...r, answers: data.Answer || [], status: data.Status }))
            .catch(() => ({ ...r, answers: [], error: true }))
        )
      );

      // A random subdomain should return NXDOMAIN (no answers) from all resolvers.
      // If any resolver returns answers, it means someone is intercepting/spoofing DNS.
      const anyAnswers = responses.some(r => r.answers.length > 0);

      if (anyAnswers) {
        status.textContent = '⚠ Anomaly detected — some resolvers returned unexpected answers for a non-existent domain.';
      } else {
        status.textContent = `All ${responses.filter(r => !r.error).length} resolvers correctly returned NXDOMAIN. No DNS spoofing detected.`;
      }

      results.innerHTML = responses.map(r => `
        <div class="ipt-dns-server">
          <span class="ip" style="min-width:90px;font-family:var(--font-ui);font-weight:600;color:${r.color}">${r.name}</span>
          ${r.error
            ? '<span class="country" style="color:var(--text-muted)">Unavailable</span>'
            : r.answers.length > 0
              ? `<span class="country" style="color:var(--warning)">⚠ Returned answers: ${r.answers.map(a => a.data).join(', ')}</span>`
              : '<span class="country" style="color:var(--success)">✓ NXDOMAIN (expected)</span>'
          }
          ${!r.error ? `<span class="ipt-badge ${r.answers.length > 0 ? 'diff' : 'same'}" style="margin-left:auto">${r.answers.length > 0 ? 'Anomaly' : 'OK'}</span>` : ''}
        </div>`).join('');

      // Also show which DoH providers are reachable (indicates browser's DoH config)
      const reachable = responses.filter(r => !r.error).map(r => r.name);
      if (reachable.length < responses.length) {
        const blocked = responses.filter(r => r.error).map(r => r.name).join(', ');
        results.innerHTML += `<div style="margin-top:8px;font-size:0.78rem;color:var(--text-muted)">Unreachable resolvers: ${blocked} (may be blocked by your network or firewall)</div>`;
      }

    } catch (e) {
      status.textContent = 'Test failed: ' + e.message;
    } finally {
      btn.disabled = false;
      btn.textContent = 'Run Again';
    }
  }

  // ── WebRTC Leak Test ──────────────────────────────────────────────────────
  function detectWebRtcIps() {
    const resultsEl = container.querySelector('#ipt-webrtc-results');
    const badgeEl = container.querySelector('#ipt-webrtc-badge');

    if (!window.RTCPeerConnection) {
      resultsEl.innerHTML = '<span style="font-size:0.85rem;color:var(--text-muted)">WebRTC not supported in this browser.</span>';
      return;
    }

    const ips = new Set();
    const pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
    pc.createDataChannel('');
    pc.createOffer().then(o => pc.setLocalDescription(o));

    pc.onicecandidate = e => {
      if (!e.candidate) {
        pc.close();
        renderWebRtcResults(ips, resultsEl, badgeEl);
        return;
      }
      const match = e.candidate.candidate.match(/(\d+\.\d+\.\d+\.\d+)/g);
      if (match) match.forEach(ip => ips.add(ip));
    };

    setTimeout(() => {
      pc.close();
      renderWebRtcResults(ips, resultsEl, badgeEl);
    }, 4000);
  }

  function renderWebRtcResults(ips, resultsEl, badgeEl) {
    const list = [...ips].filter(ip => ip !== '0.0.0.0');
    if (list.length === 0) {
      resultsEl.innerHTML = '<span class="ipt-badge same" style="font-size:0.8rem;padding:4px 10px">No leak detected</span>';
      badgeEl.innerHTML = '<span class="ipt-badge same">No Leak</span>';
      return;
    }
    const hasPrivate = list.some(ip => /^(10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.)/.test(ip));
    const hasPublic = list.some(ip => !/^(10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.|127\.)/.test(ip));
    badgeEl.innerHTML = hasPublic
      ? '<span class="ipt-badge diff">Potential Leak</span>'
      : '<span class="ipt-badge same">No Leak</span>';
    resultsEl.innerHTML = list.map(ip => {
      const isPrivate = /^(10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.|127\.)/.test(ip);
      return `<div class="ipt-ip-chip">
        <span>${ip}</span>
        <span class="chip-label">${isPrivate ? 'private' : 'public'}</span>
      </div>`;
    }).join('');
  }

  // ── Flag emoji helper ─────────────────────────────────────────────────────
  function flagEmoji(code) {
    if (!code || code.length !== 2) return '';
    return [...code.toUpperCase()].map(c => String.fromCodePoint(0x1F1E6 + c.charCodeAt(0) - 65)).join('');
  }

  // ── Init ──────────────────────────────────────────────────────────────────
  loadIpInfo();
  detectWebRtcIps();
}
