// CSS / JS / HTML Minifier

export function init(container) {
  container.innerHTML = `
    <style>
      #minify-root { display: flex; flex-direction: column; height: 100%; width: 100%; overflow: hidden; }
      #minify-root .subtabs { flex-shrink: 0; }
      #minify-root .subtab-panel { flex: 1; overflow: hidden; }
    </style>
    <div id="minify-root">
    <div class="subtabs">
      <div class="subtab active" data-tab="html">HTML</div>
      <div class="subtab" data-tab="css">CSS</div>
      <div class="subtab" data-tab="js">JavaScript</div>
    </div>

    <!-- HTML tab -->
    <div class="subtab-panel active" id="min-html" style="flex-direction:column;overflow:hidden;">
      <div class="options-row">
        <label class="option-label"><input type="checkbox" id="html-rm-comments" checked> Remove comments</label>
        <label class="option-label"><input type="checkbox" id="html-minify-embedded" checked> Minify embedded &lt;script&gt;/&lt;style&gt;</label>
      </div>
      <div class="editor-panes">
        <div class="editor-pane">
          <div class="pane-toolbar">
            <span class="pane-label">Input HTML</span>
            <button class="btn" id="html-paste">Paste</button>
            <button class="btn danger" id="html-clear">Clear</button>
          </div>
          <textarea class="pane-textarea" id="html-input" placeholder="Paste HTML here..."></textarea>
        </div>
        <div class="editor-pane">
          <div class="pane-toolbar">
            <span class="pane-label">Minified</span>
            <span id="html-size"></span>
            <button class="btn" id="html-preview-toggle">Preview</button>
            <button class="btn" id="html-copy">Copy</button>
          </div>
          <div class="pane-output" id="html-output"></div>
          <iframe id="html-preview" style="display:none;flex:1;border:none;background:#fff;border-radius:4px;" sandbox="allow-scripts"></iframe>
        </div>
      </div>
    </div>

    <!-- CSS tab -->
    <div class="subtab-panel" id="min-css" style="flex-direction:column;overflow:hidden;">
      <div class="options-row">
        <label class="option-label"><input type="checkbox" id="css-rm-comments" checked> Remove comments</label>
      </div>
      <div class="editor-panes">
        <div class="editor-pane">
          <div class="pane-toolbar">
            <span class="pane-label">Input CSS</span>
            <button class="btn" id="css-paste">Paste</button>
            <button class="btn danger" id="css-clear">Clear</button>
          </div>
          <textarea class="pane-textarea" id="css-input" placeholder="Paste CSS here..."></textarea>
        </div>
        <div class="editor-pane">
          <div class="pane-toolbar">
            <span class="pane-label">Minified</span>
            <span id="css-size"></span>
            <button class="btn" id="css-copy">Copy</button>
          </div>
          <div class="pane-output" id="css-output"></div>
        </div>
      </div>
    </div>

    <!-- JS tab -->
    <div class="subtab-panel" id="min-js" style="flex-direction:column;overflow:hidden;">
      <div class="options-row">
        <label class="option-label"><input type="checkbox" id="js-rm-comments" checked> Remove comments</label>
        <label class="option-label"><input type="checkbox" id="js-keep-license" checked> Keep license comments (<code>/*! … */</code>)</label>
      </div>
      <div class="editor-panes">
        <div class="editor-pane">
          <div class="pane-toolbar">
            <span class="pane-label">Input JavaScript</span>
            <button class="btn" id="js-paste">Paste</button>
            <button class="btn danger" id="js-clear">Clear</button>
          </div>
          <textarea class="pane-textarea" id="js-input" placeholder="Paste JavaScript here..."></textarea>
        </div>
        <div class="editor-pane">
          <div class="pane-toolbar">
            <span class="pane-label">Minified</span>
            <span id="js-size"></span>
            <button class="btn" id="js-copy">Copy</button>
          </div>
          <div class="pane-output" id="js-output"></div>
        </div>
      </div>
    </div>
    </div>
  `;

  // ── Subtab routing ──
  container.querySelectorAll('.subtab').forEach(tab => {
    tab.addEventListener('click', () => {
      container.querySelectorAll('.subtab').forEach(t => t.classList.remove('active'));
      container.querySelectorAll('.subtab-panel').forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      container.querySelector('#min-' + tab.dataset.tab).classList.add('active');
    });
  });

  // ── HTML tab ──
  const htmlIn           = container.querySelector('#html-input');
  const htmlOut          = container.querySelector('#html-output');
  const htmlPreview      = container.querySelector('#html-preview');
  const htmlPreviewToggle = container.querySelector('#html-preview-toggle');
  const htmlSize         = container.querySelector('#html-size');
  const htmlRmCom        = container.querySelector('#html-rm-comments');
  const htmlEmbed        = container.querySelector('#html-minify-embedded');
  let htmlPreviewMode    = false;
  let lastMinifiedHTML   = '';

  function runHTML() {
    const raw = htmlIn.value;
    if (!raw.trim()) {
      htmlOut.textContent = ''; htmlSize.innerHTML = '';
      lastMinifiedHTML = '';
      if (htmlPreviewMode) htmlPreview.srcdoc = '';
      return;
    }
    try {
      const result = minifyHTML(raw, {
        removeComments: htmlRmCom.checked,
        minifyEmbedded: htmlEmbed.checked,
      });
      lastMinifiedHTML = result;
      htmlOut.textContent = result;
      htmlOut.className = 'pane-output';
      htmlSize.innerHTML = sizeBadge(raw.length, result.length);
      if (htmlPreviewMode) htmlPreview.srcdoc = result;
    } catch (e) {
      htmlOut.textContent = e.message;
      htmlOut.className = 'pane-output error';
      htmlSize.innerHTML = '';
      lastMinifiedHTML = '';
    }
  }

  htmlPreviewToggle.addEventListener('click', () => {
    htmlPreviewMode = !htmlPreviewMode;
    if (htmlPreviewMode) {
      htmlOut.style.display = 'none';
      htmlPreview.style.display = 'flex';
      htmlPreview.srcdoc = lastMinifiedHTML;
      htmlPreviewToggle.textContent = 'Source';
      htmlPreviewToggle.classList.add('active');
    } else {
      htmlPreview.style.display = 'none';
      htmlOut.style.display = '';
      htmlPreviewToggle.textContent = 'Preview';
      htmlPreviewToggle.classList.remove('active');
    }
  });

  htmlIn.addEventListener('input', runHTML);
  htmlRmCom.addEventListener('change', runHTML);
  htmlEmbed.addEventListener('change', runHTML);
  container.querySelector('#html-paste').addEventListener('click', async () => {
    htmlIn.value = await navigator.clipboard.readText(); runHTML();
  });
  container.querySelector('#html-clear').addEventListener('click', () => {
    htmlIn.value = ''; htmlOut.textContent = ''; htmlSize.innerHTML = '';
    lastMinifiedHTML = '';
    if (htmlPreviewMode) htmlPreview.srcdoc = '';
  });
  container.querySelector('#html-copy').addEventListener('click', () => {
    navigator.clipboard.writeText(lastMinifiedHTML || htmlOut.textContent);
    flashBtn(container.querySelector('#html-copy'), 'Copied!');
  });

  // ── CSS tab ──
  const cssIn   = container.querySelector('#css-input');
  const cssOut  = container.querySelector('#css-output');
  const cssSize = container.querySelector('#css-size');
  const cssRmCom = container.querySelector('#css-rm-comments');

  function runCSS() {
    const raw = cssIn.value;
    if (!raw.trim()) { cssOut.textContent = ''; cssSize.innerHTML = ''; return; }
    const result = minifyCSS(raw, { removeComments: cssRmCom.checked });
    cssOut.textContent = result;
    cssOut.className = 'pane-output';
    cssSize.innerHTML = sizeBadge(raw.length, result.length);
  }

  cssIn.addEventListener('input', runCSS);
  cssRmCom.addEventListener('change', runCSS);
  container.querySelector('#css-paste').addEventListener('click', async () => {
    cssIn.value = await navigator.clipboard.readText(); runCSS();
  });
  container.querySelector('#css-clear').addEventListener('click', () => {
    cssIn.value = ''; cssOut.textContent = ''; cssSize.innerHTML = '';
  });
  container.querySelector('#css-copy').addEventListener('click', () => {
    navigator.clipboard.writeText(cssOut.textContent);
    flashBtn(container.querySelector('#css-copy'), 'Copied!');
  });

  // ── JS tab ──
  const jsIn      = container.querySelector('#js-input');
  const jsOut     = container.querySelector('#js-output');
  const jsSize    = container.querySelector('#js-size');
  const jsRmCom   = container.querySelector('#js-rm-comments');
  const jsKeepLic = container.querySelector('#js-keep-license');

  function runJS() {
    const raw = jsIn.value;
    if (!raw.trim()) { jsOut.textContent = ''; jsSize.innerHTML = ''; return; }
    const result = minifyJS(raw, {
      removeComments: jsRmCom.checked,
      keepLicense: jsKeepLic.checked,
    });
    jsOut.textContent = result;
    jsOut.className = 'pane-output';
    jsSize.innerHTML = sizeBadge(raw.length, result.length);
  }

  jsIn.addEventListener('input', runJS);
  jsRmCom.addEventListener('change', runJS);
  jsKeepLic.addEventListener('change', runJS);
  container.querySelector('#js-paste').addEventListener('click', async () => {
    jsIn.value = await navigator.clipboard.readText(); runJS();
  });
  container.querySelector('#js-clear').addEventListener('click', () => {
    jsIn.value = ''; jsOut.textContent = ''; jsSize.innerHTML = '';
  });
  container.querySelector('#js-copy').addEventListener('click', () => {
    navigator.clipboard.writeText(jsOut.textContent);
    flashBtn(container.querySelector('#js-copy'), 'Copied!');
  });
}

// ─────────────────────────────────────────────
// HTML Minifier
// ─────────────────────────────────────────────

// Tags whose text content must not be touched (preserve whitespace exactly)
const PRESERVE_TAGS = new Set(['pre', 'textarea']);

// Inline-level elements: whitespace between/around them is significant
const INLINE_TAGS = new Set([
  'a','abbr','acronym','b','bdo','big','br','button','cite','code','dfn',
  'em','i','img','input','kbd','label','map','object','output','q','s',
  'samp','select','small','span','strong','sub','sup','time','tt','u','var',
]);

// Void elements (no closing tag, no children)
const VOID_TAGS = new Set([
  'area','base','br','col','embed','hr','img','input',
  'link','meta','param','source','track','wbr',
]);

function minifyHTML(input, opts = {}) {
  const { removeComments = true, minifyEmbedded = true } = opts;

  // ── Step 1: tokenise ──
  const tokens = tokenizeHTML(input);

  // ── Step 2: reconstruct with whitespace collapsing ──
  let out = '';

  for (let i = 0; i < tokens.length; i++) {
    const tok = tokens[i];

    if (tok.type === 'doctype') {
      out += tok.val;
      continue;
    }

    if (tok.type === 'comment') {
      // Keep IE conditional comments and "!" forced-keep comments
      if (!removeComments || tok.val.startsWith('<!--[if') || tok.val.startsWith('<!--!')) {
        out += tok.val;
      }
      continue;
    }

    if (tok.type === 'open' || tok.type === 'close') {
      out += normalizeTagAttrs(tok.val);
      continue;
    }

    if (tok.type === 'rawcontent') {
      if (minifyEmbedded && tok.context === 'style') {
        out += minifyCSS(tok.val, { removeComments });
      } else if (minifyEmbedded && tok.context === 'script') {
        out += minifyJS(tok.val, { removeComments, keepLicense: true });
      } else {
        // pre / textarea: preserve exactly
        out += tok.val;
      }
      continue;
    }

    if (tok.type === 'text') {
      const isOnlyWS = /^\s+$/.test(tok.val);

      if (isOnlyWS) {
        // Decide whether to keep a single space based on neighbours.
        // A whitespace-only text node between/around inline elements is
        // visually significant (it renders as a space character).
        const prev = tokens[i - 1];
        const next = tokens[i + 1];

        const prevIsInline = prev &&
          (prev.type === 'open' || prev.type === 'close') &&
          INLINE_TAGS.has(prev.name);

        const nextIsInline = next &&
          (next.type === 'open' || next.type === 'close') &&
          INLINE_TAGS.has(next.name);

        // Also keep if sandwiched between a tag and real text content
        const prevIsText = prev && prev.type === 'text' && !/^\s+$/.test(prev.val);
        const nextIsText = next && next.type === 'text' && !/^\s+$/.test(next.val);

        if (prevIsInline || nextIsInline || prevIsText || nextIsText) {
          out += ' ';
        }
        // else: discard (between block elements — no visual effect)
      } else {
        // Mixed content: collapse internal whitespace runs to a single space,
        // but preserve at least one leading/trailing space when the text
        // starts/ends with whitespace (may adjoin an inline element).
        const leadSpace  = /^\s/.test(tok.val) ? ' ' : '';
        const trailSpace = /\s$/.test(tok.val) ? ' ' : '';
        const inner = tok.val.trim().replace(/\s+/g, ' ');
        out += leadSpace + inner + trailSpace;
      }
    }
  }

  return out.trim();
}

function tokenizeHTML(html) {
  const tokens = [];
  let i = 0;

  while (i < html.length) {
    if (html[i] !== '<') {
      // Text node
      const end = html.indexOf('<', i);
      const text = end === -1 ? html.slice(i) : html.slice(i, end);
      if (text) tokens.push({ type: 'text', val: text });
      if (end === -1) break;
      i = end;
      continue;
    }

    // Comment
    if (html.startsWith('<!--', i)) {
      const end = html.indexOf('-->', i + 4);
      if (end === -1) { tokens.push({ type: 'comment', val: html.slice(i) }); break; }
      tokens.push({ type: 'comment', val: html.slice(i, end + 3) });
      i = end + 3;
      continue;
    }

    // DOCTYPE / CDATA / processing instructions
    if (html.startsWith('<!', i) || html.startsWith('<?', i)) {
      const end = html.indexOf('>', i);
      if (end === -1) { tokens.push({ type: 'doctype', val: html.slice(i) }); break; }
      tokens.push({ type: 'doctype', val: html.slice(i, end + 1) });
      i = end + 1;
      continue;
    }

    // Regular tag — find the matching > (skipping attribute strings)
    const tagEnd = findTagClose(html, i);
    if (tagEnd === -1) { tokens.push({ type: 'text', val: html.slice(i) }); break; }

    const tagStr  = html.slice(i, tagEnd + 1);
    const nameM   = tagStr.match(/^<\/?([a-z][a-z0-9-]*)/i);
    const tagName = nameM ? nameM[1].toLowerCase() : '';
    const isClose = tagStr[1] === '/';

    tokens.push({ type: isClose ? 'close' : 'open', name: tagName, val: tagStr });
    i = tagEnd + 1;

    // Raw-content tags: consume inner content as a single token
    if (!isClose && !VOID_TAGS.has(tagName) && (tagName === 'script' || tagName === 'style' || PRESERVE_TAGS.has(tagName))) {
      const closeTag  = `</${tagName}`;
      const closeIdx  = html.toLowerCase().indexOf(closeTag, i);
      if (closeIdx !== -1) {
        const raw = html.slice(i, closeIdx);
        if (raw) tokens.push({ type: 'rawcontent', val: raw, context: tagName });
        const closeEnd = html.indexOf('>', closeIdx);
        tokens.push({ type: 'close', name: tagName, val: html.slice(closeIdx, closeEnd + 1) });
        i = closeEnd + 1;
      }
    }
  }

  return tokens;
}

// Find the index of the tag-closing '>', accounting for quoted attribute values.
function findTagClose(html, start) {
  let i = start + 1;
  let quote = '';
  while (i < html.length) {
    const c = html[i];
    if (!quote && (c === '"' || c === "'")) { quote = c; }
    else if (quote && c === quote)           { quote = ''; }
    else if (!quote && c === '>')            { return i; }
    i++;
  }
  return -1;
}

// Collapse redundant whitespace between tag attributes (never inside values).
function normalizeTagAttrs(tagStr) {
  let out = '';
  let quote = '';
  let lastWasSpace = false;

  for (let i = 0; i < tagStr.length; i++) {
    const c = tagStr[i];
    if (!quote && (c === '"' || c === "'")) {
      quote = c; lastWasSpace = false; out += c;
    } else if (quote && c === quote) {
      quote = ''; out += c;
    } else if (!quote && /[\t\n\r ]/.test(c)) {
      // Emit at most one space; never right after '<' or before '>'/'/'
      if (!lastWasSpace && out.length > 1) { out += ' '; lastWasSpace = true; }
    } else {
      lastWasSpace = false; out += c;
    }
  }
  // Remove trailing space before > and />
  return out.replace(/ \/>$/, '/>').replace(/ >$/, '>');
}

// ─────────────────────────────────────────────
// CSS Minifier
// ─────────────────────────────────────────────

function minifyCSS(input, opts = {}) {
  const { removeComments = true } = opts;
  let css = input;

  // Protect url(...) so we don't mangle its content
  const urlBlocks = [];
  css = css.replace(/url\(([^)]*)\)/gi, m => {
    urlBlocks.push(m);
    return `\x00U${urlBlocks.length - 1}\x00`;
  });

  // Protect quoted strings (e.g. content: "foo bar")
  const strBlocks = [];
  css = css.replace(/"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'/g, m => {
    strBlocks.push(m);
    return `\x00S${strBlocks.length - 1}\x00`;
  });

  if (removeComments) {
    css = css.replace(/\/\*[\s\S]*?\*\//g, '');
  }

  // Collapse all whitespace (including newlines) to a single space
  css = css.replace(/\s+/g, ' ');

  // Remove spaces around structural characters
  css = css.replace(/\s*\{\s*/g, '{');
  css = css.replace(/\s*\}\s*/g, '}');
  css = css.replace(/\s*;\s*/g, ';');
  css = css.replace(/\s*,\s*/g, ',');

  // Remove spaces around combinators (>, +, ~) and the colon in declarations.
  // The pattern ([a-z0-9_%*-]) ensures we only strip ':' that follows an
  // identifier or unit, not a pseudo-selector colon that starts a selector.
  css = css.replace(/\s*([>+~])\s*/g, '$1');
  css = css.replace(/([a-z0-9_%*\-\])'"])\s*:\s*/gi, '$1:');

  // Remove trailing semicolons before closing brace
  css = css.replace(/;}/g, '}');

  // Restore url() and string blocks
  css = css.replace(/\x00U(\d+)\x00/g, (_, n) => urlBlocks[+n]);
  css = css.replace(/\x00S(\d+)\x00/g, (_, n) => strBlocks[+n]);

  return css.trim();
}

// ─────────────────────────────────────────────
// JS Minifier  (comment removal + whitespace collapse)
// Note: no identifier renaming — this is a safe, structural minifier.
// ─────────────────────────────────────────────

function minifyJS(input, opts = {}) {
  const { removeComments = true, keepLicense = true } = opts;
  let js = input;

  // ── Step 1: extract string / template-literal / regex literals ──
  // We replace them with placeholders so later passes cannot corrupt their content.
  const preserved = [];

  function protect(m) {
    preserved.push(m);
    return `\x00P${preserved.length - 1}\x00`;
  }

  // Template literals (may span lines)
  js = js.replace(/`(?:[^`\\]|\\.|\r?\n)*`/g, protect);

  // Double- and single-quoted strings (single-line only, escape-aware)
  js = js.replace(/"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'/g, protect);

  // Regex literals: /pattern/flags — only after operators/keywords, not division
  // (heuristic: after = ( , ; ! & | ? : [ { return typeof void)
  js = js.replace(/(?<=[=(\[!&|?:,;{}]|return|typeof|void)\s*\/(?![/*])(?:[^/\\\n]|\\.)+\/[gimsuy]*/g, protect);

  // ── Step 2: remove comments ──
  if (removeComments) {
    if (keepLicense) {
      // Keep /*! ... */ license comments
      js = js.replace(/\/\*(?!!)([\s\S]*?)\*\//g, '');
    } else {
      js = js.replace(/\/\*[\s\S]*?\*\//g, '');
    }
    // Single-line comments — careful: // inside a string is already protected
    js = js.replace(/\/\/[^\n]*/g, '');
  }

  // ── Step 3: collapse whitespace ──
  // Collapse runs of whitespace (spaces, tabs, newlines) to a single space.
  js = js.replace(/[ \t]*\n[ \t]*/g, '\n'); // trim lines
  js = js.replace(/\n{2,}/g, '\n');          // collapse blank lines
  js = js.replace(/[ \t]+/g, ' ');           // collapse inline spaces

  // Remove space/newline around characters that never need flanking space
  js = js.replace(/[ \t\n]*([{}()\[\],;])[ \t\n]*/g, '$1');

  // Remove newlines that are safe to drop (where ASI would not fire):
  // after tokens that cannot end a statement.
  // Newlines AFTER: { } ( [ , ; = => operators etc.
  js = js.replace(/([{(\[,;=+\-*/%&|^!~<>?:])\n/g, '$1');
  // Newlines BEFORE: } ) ]
  js = js.replace(/\n([})\]])/g, '$1');

  // Trim remaining leading/trailing whitespace per line, then collapse newlines
  js = js.replace(/^ +| +$/gm, '');
  js = js.replace(/\n+/g, '\n');

  // ── Step 4: restore preserved literals ──
  js = js.replace(/\x00P(\d+)\x00/g, (_, n) => preserved[+n]);

  return js.trim();
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function sizeBadge(before, after) {
  const saved = ((1 - after / before) * 100).toFixed(1);
  return `<span class="status-badge info">${fmtBytes(after)} <span style="opacity:.6">(-${saved}%)</span></span>`;
}

function fmtBytes(n) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
}

function flashBtn(btn, text) {
  const orig = btn.textContent;
  btn.textContent = text;
  setTimeout(() => { btn.textContent = orig; }, 1500);
}
