// JSON to C# Class Generator

export function init(container) {
  container.innerHTML = `
    <style>
      #json-to-csharp-root { display: flex; flex-direction: column; height: 100%; width: 100%; overflow: hidden; }
      #json-to-csharp-root .subtabs { flex-shrink: 0; }
      #json-to-csharp-root .options-row { flex-shrink: 0; }
      #json-to-csharp-root .subtab-panel { flex: 1; overflow: hidden; }
      #json-to-csharp-root .editor-panes { flex: 1; overflow: hidden; }
    </style>
    <div id="json-to-csharp-root">
    <div class="options-row">
      <label class="option-label">Root class name:
        <input type="text" id="jtc-classname" value="Root" style="
          background:var(--surface2);border:1px solid var(--border);color:var(--text);
          padding:4px 8px;border-radius:var(--radius);font-size:12px;width:120px;outline:none;">
      </label>
      <label class="option-label">
        <input type="checkbox" id="jtc-nullable" checked> Nullable annotations
      </label>
      <label class="option-label">
        <input type="checkbox" id="jtc-jsonattr" checked> [JsonPropertyName]
      </label>
      <label class="option-label">Style:
        <select id="jtc-style">
          <option value="class">class</option>
          <option value="record">record</option>
        </select>
      </label>
    </div>
    <div class="editor-panes">
      <div class="editor-pane">
        <div class="pane-toolbar">
          <span class="pane-label">Input JSON</span>
          <button class="btn" id="jtc-paste">Paste</button>
          <button class="btn" id="jtc-sample">Sample</button>
          <button class="btn danger" id="jtc-clear">Clear</button>
        </div>
        <textarea class="pane-textarea" id="jtc-input" placeholder='Paste JSON object or array here...'></textarea>
      </div>
      <div class="editor-pane">
        <div class="pane-toolbar">
          <span class="pane-label">C# Classes</span>
          <span id="jtc-status"></span>
          <button class="btn" id="jtc-copy">Copy</button>
        </div>
        <div class="pane-output" id="jtc-output"></div>
      </div>
    </div>
    </div>
  `;

  const input = container.querySelector('#jtc-input');
  const output = container.querySelector('#jtc-output');
  const status = container.querySelector('#jtc-status');
  const classNameInput = container.querySelector('#jtc-classname');
  const nullableCheck = container.querySelector('#jtc-nullable');
  const jsonAttrCheck = container.querySelector('#jtc-jsonattr');
  const styleSelect = container.querySelector('#jtc-style');

  const SAMPLE = `{
  "id": 1,
  "name": "Jane Doe",
  "email": "jane@example.com",
  "createdAt": "2024-01-15T10:30:00Z",
  "isActive": true,
  "score": 98.5,
  "tags": ["admin", "user"],
  "address": {
    "street": "123 Main St",
    "city": "Toronto",
    "zip": "M5V 2T6"
  },
  "orders": [
    { "orderId": 1001, "total": 49.99, "items": ["book", "pen"] },
    { "orderId": 1002, "total": 129.00, "items": ["laptop"] }
  ],
  "metadata": null
}`;

  function generate() {
    const raw = input.value.trim();
    if (!raw) { output.textContent = ''; status.innerHTML = ''; return; }
    try {
      const parsed = JSON.parse(raw);
      const rootName = toPascal(classNameInput.value.trim() || 'Root');
      const classes = [];
      inferClass(rootName, Array.isArray(parsed) ? (parsed[0] || {}) : parsed, classes);
      const useNullable = nullableCheck.checked;
      const useJsonAttr = jsonAttrCheck.checked;
      const useRecord = styleSelect.value === 'record';
      const result = renderClasses(classes, useNullable, useJsonAttr, useRecord);
      output.textContent = result;
      output.className = 'pane-output';
      status.innerHTML = `<span class="status-badge ok">${classes.length} class${classes.length > 1 ? 'es' : ''}</span>`;
    } catch (e) {
      output.textContent = e.message;
      output.className = 'pane-output error';
      status.innerHTML = '<span class="status-badge err">Invalid JSON</span>';
    }
  }

  input.addEventListener('input', generate);
  classNameInput.addEventListener('input', generate);
  nullableCheck.addEventListener('change', generate);
  jsonAttrCheck.addEventListener('change', generate);
  styleSelect.addEventListener('change', generate);

  container.querySelector('#jtc-paste').addEventListener('click', async () => {
    input.value = await navigator.clipboard.readText(); generate();
  });
  container.querySelector('#jtc-sample').addEventListener('click', () => {
    input.value = SAMPLE; generate();
  });
  container.querySelector('#jtc-clear').addEventListener('click', () => {
    input.value = ''; output.textContent = ''; output.className = 'pane-output'; status.innerHTML = '';
  });
  container.querySelector('#jtc-copy').addEventListener('click', () => {
    navigator.clipboard.writeText(output.textContent);
    flashBtn(container.querySelector('#jtc-copy'), 'Copied!');
  });
}

// ── Type inference engine ──

function inferClass(className, obj, classList) {
  const props = [];
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return;

  for (const [key, val] of Object.entries(obj)) {
    props.push({ key, type: inferType(key, val, classList) });
  }

  // Avoid duplicate class definitions
  if (!classList.find(c => c.name === className)) {
    classList.push({ name: className, props });
  }
}

function inferType(key, val, classList, nullable = false) {
  if (val === null || val === undefined) return { cs: 'object', nullable: true };

  if (Array.isArray(val)) {
    if (val.length === 0) return { cs: 'List<object>', nullable: false };
    const inner = inferType(key, val[0], classList);
    return { cs: `List<${inner.cs}>`, nullable: false };
  }

  const t = typeof val;
  if (t === 'boolean') return { cs: 'bool', nullable: false };
  if (t === 'number') {
    if (Number.isInteger(val)) {
      if (val > 2147483647 || val < -2147483648) return { cs: 'long', nullable: false };
      return { cs: 'int', nullable: false };
    }
    return { cs: 'double', nullable: false };
  }
  if (t === 'string') {
    if (isIsoDate(val)) return { cs: 'DateTime', nullable: false };
    return { cs: 'string', nullable: false };
  }
  if (t === 'object') {
    const childName = toPascal(key);
    inferClass(childName, val, classList);
    return { cs: childName, nullable: false };
  }
  return { cs: 'object', nullable: false };
}

function renderClasses(classes, useNullable, useJsonAttr, useRecord) {
  const lines = ['using System.Text.Json.Serialization;', ''];
  for (const cls of classes) {
    if (useRecord) {
      lines.push(`public record ${cls.name}(`);
      const paramLines = cls.props.map(({ key, type }, i) => {
        const csType = nullableType(type, useNullable);
        const attr = useJsonAttr ? `    [property: JsonPropertyName("${key}")] ` : '    ';
        const comma = i < cls.props.length - 1 ? ',' : '';
        return `${attr}${csType} ${toPascal(key)}${comma}`;
      });
      lines.push(...paramLines, ');');
    } else {
      lines.push(`public class ${cls.name}`);
      lines.push('{');
      for (const { key, type } of cls.props) {
        const csType = nullableType(type, useNullable);
        if (useJsonAttr) lines.push(`    [JsonPropertyName("${key}")]`);
        const init = csType === 'string' ? ' = string.Empty;' : (csType.startsWith('List<') ? ` = new();` : '');
        lines.push(`    public ${csType} ${toPascal(key)} { get; set; }${init}`);
      }
      lines.push('}');
    }
    lines.push('');
  }
  return lines.join('\n');
}

function nullableType({ cs, nullable }, useNullable) {
  if (!useNullable) return cs;
  if (nullable) return cs + '?';
  // Reference types that are already nullable-aware
  if (cs === 'string') return cs + '?';
  return cs;
}

function isIsoDate(str) {
  return /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:\d{2})?)?$/.test(str);
}

function toPascal(str) {
  return str
    .replace(/[-_\s]+(.)/g, (_, c) => c.toUpperCase())
    .replace(/^(.)/, c => c.toUpperCase());
}

function flashBtn(btn, text) {
  const orig = btn.textContent;
  btn.textContent = text;
  setTimeout(() => { btn.textContent = orig; }, 1500);
}
