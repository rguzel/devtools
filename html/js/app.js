import { init as initJsonFormat }    from './tools/json-format.js';
import { init as initJsonToCsharp }  from './tools/json-to-csharp.js';
import { init as initCodeConvert }   from './tools/code-convert.js';
import { init as initBase64 }        from './tools/base64.js';
import { init as initUrlEncode }     from './tools/url-encode.js';
import { init as initJwtDecode }     from './tools/jwt-decode.js';
import { init as initTimestamp }     from './tools/timestamp.js';
import { init as initMinify }        from './tools/minify.js';
import { init as initSqlFormat }     from './tools/sql-format.js';
import { init as initSqlExplain }    from './tools/sql-explain.js';
import { init as initOcr }           from './tools/ocr.js';
import { init as initIpTools }           from './tools/ip-tools.js';
import { init as initPdfGenerator }  from './tools/pdf-generator.js';

const TOOLS = [
  {
    id: 'code-convert',
    label: 'Code Converter',
    section: 'converters',
    icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m7 16 4-4-4-4"/><path d="m17 8-4 4 4 4"/></svg>`,
    init: initCodeConvert,
  },
  {
    id: 'json-format',
    label: 'JSON Formatter',
    section: 'json',
    icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`,
    init: initJsonFormat,
  },
  {
    id: 'json-to-csharp',
    label: 'JSON → C# Class',
    section: 'json',
    icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>`,
    init: initJsonToCsharp,
  },
  {
    id: 'base64',
    label: 'Base64',
    section: 'encoders',
    icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
    init: initBase64,
  },
  {
    id: 'url-encode',
    label: 'URL Encode/Decode',
    section: 'encoders',
    icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`,
    init: initUrlEncode,
  },
  {
    id: 'jwt-decode',
    label: 'JWT Inspector',
    section: 'encoders',
    icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
    init: initJwtDecode,
  },
  {
    id: 'timestamp',
    label: 'Timestamp',
    section: 'utils',
    icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
    init: initTimestamp,
  },
  {
    id: 'minify',
    label: 'Minifier',
    section: 'minifiers',
    icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/><path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/><line x1="9" y1="12" x2="15" y2="12"/></svg>`,
    init: initMinify,
  },
  {
    id: 'sql-format',
    label: 'SQL Formatter',
    section: 'sql',
    icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 8h4m-4 4h8m-8 4h6"/></svg>`,
    init: initSqlFormat,
  },
  {
    id: 'sql-explain',
    label: 'SQL Explainer',
    section: 'sql',
    icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>`,
    init: initSqlExplain,
  },
  {
    id: 'ocr',
    label: 'Image / PDF OCR',
    section: 'documents',
    icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 8h3v3H7z"/><path d="M14 8h3"/><path d="M14 12h3"/><path d="M7 16h10"/></svg>`,
    init: initOcr,
  },
  {
    id: 'ip-tools',
    label: 'IP Tools',
    section: 'network',
    icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a15 15 0 0 1 4 10 15 15 0 0 1-4 10 15 15 0 0 1-4-10 15 15 0 0 1 4-10z"/><path d="M2 12h20"/></svg>`,
    init: initIpTools,
  },
  {
    id: 'pdf-generator',
    label: 'Markdown → PDF',
    section: 'documents',
    icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M9 15h6"/><path d="M9 11h3"/></svg>`,
    init: initPdfGenerator,
  },
];

const SECTIONS = {
  converters: 'Converters',
  json: 'JSON Tools',
  sql: 'SQL Tools',
  encoders: 'Encoders',
  utils: 'Utilities',
  minifiers: 'Minifiers',
  network: 'Network Tools',
  documents: 'Documents',
};

const sidebar = document.getElementById('sidebar');
const main = document.getElementById('main');

// Build sidebar sections
const sectionEls = {};
for (const [key, label] of Object.entries(SECTIONS)) {
  const sec = document.createElement('div');
  sec.className = 'sidebar-section';
  sec.innerHTML = `<div class="sidebar-section-label">${label}</div>`;
  sidebar.appendChild(sec);
  sectionEls[key] = sec;
}

// Build nav items and panels
const panels = {};
const navItems = {};

TOOLS.forEach(tool => {
  // Nav item
  const item = document.createElement('div');
  item.className = 'nav-item';
  item.dataset.tool = tool.id;
  item.innerHTML = `${tool.icon}<span>${tool.label}</span>`;
  sectionEls[tool.section].appendChild(item);
  navItems[tool.id] = item;

  // Panel
  const panel = document.createElement('div');
  panel.className = 'tool-panel';
  panel.id = `panel-${tool.id}`;
  panel.innerHTML = `
    <div class="tool-header">
      ${tool.icon}
      <div>
        <h1>${tool.label}</h1>
      </div>
    </div>
    <div class="tool-body" id="body-${tool.id}"></div>
  `;
  main.appendChild(panel);
  panels[tool.id] = panel;

  item.addEventListener('click', () => activateTool(tool.id));
});

let activeToolId = null;
const initialized = new Set();

function activateTool(id) {
  if (activeToolId === id) return;
  activeToolId = id;

  // Update nav
  Object.values(navItems).forEach(n => n.classList.remove('active'));
  navItems[id].classList.add('active');

  // Update panels
  Object.values(panels).forEach(p => p.classList.remove('active'));
  panels[id].classList.add('active');

  // Lazy init
  if (!initialized.has(id)) {
    const tool = TOOLS.find(t => t.id === id);
    const body = document.getElementById(`body-${id}`);
    tool.init(body);
    initialized.add(id);
  }

  // Update URL hash
  history.replaceState(null, '', '#' + id);
}

// Initial tool from hash or default
const hash = location.hash.slice(1);
const startTool = TOOLS.find(t => t.id === hash) ? hash : TOOLS[0].id;
activateTool(startTool);
