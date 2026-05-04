// Code Converter — LLM-backed via Ollama

const LANGUAGES = [
  { value: 'sql',    label: 'SQL'    },
  { value: 'csharp', label: 'C#'     },
  { value: 'cpp',    label: 'C++'    },
  { value: 'python', label: 'Python' },
  { value: 'pascal', label: 'Pascal' },
  { value: 'delphi', label: 'Delphi' },
  { value: 'custom', label: 'Custom…'},
];

const STYLE_HINTS = [
  { value: '',        label: 'Default' },
  { value: 'dapper',  label: 'Dapper'  },
  { value: 'linq',    label: 'LINQ'    },
  { value: 'efcore',  label: 'EF Core' },
];

const MODELS = [
  { value: 'qwen2.5-coder:14b',     label: 'qwen2.5-coder:14b'  },
  { value: 'deepseek-coder:latest', label: 'deepseek-coder'      },
  { value: 'qwen2.5-coder:3b',      label: 'qwen2.5-coder:3b'   },
  { value: 'gemma4:e2b',            label: 'gemma4:e2b (hm-local)' },
  { value: 'gemma4:e4b',            label: 'gemma4:e4b (hm-local)' },
];

const SAMPLES = {
  'sql->csharp': `SELECT u.Name, u.Email, SUM(o.Total) AS TotalSpent
FROM Users u
INNER JOIN Orders o ON u.Id = o.UserId
WHERE u.IsActive = 1
GROUP BY u.Name, u.Email
HAVING SUM(o.Total) > 500
ORDER BY TotalSpent DESC;`,

  'csharp->sql': `public List<UserOrderSummary> GetTopSpenders()
{
    return _context.Users
        .Where(u => u.IsActive)
        .Join(_context.Orders, u => u.Id, o => o.UserId, (u, o) => new { u, o })
        .GroupBy(x => new { x.u.Name, x.u.Email })
        .Where(g => g.Sum(x => x.o.Total) > 500)
        .OrderByDescending(g => g.Sum(x => x.o.Total))
        .Select(g => new UserOrderSummary {
            Name = g.Key.Name,
            Email = g.Key.Email,
            TotalSpent = g.Sum(x => x.o.Total)
        }).ToList();
}`,

  'cpp->csharp': `#include <iostream>
#include <vector>
#include <algorithm>

class NumberSorter {
private:
    std::vector<int> numbers;
public:
    void add(int n) { numbers.push_back(n); }
    void sort() { std::sort(numbers.begin(), numbers.end()); }
    void print() {
        for (int n : numbers) std::cout << n << " ";
        std::cout << std::endl;
    }
};`,

  'pascal->csharp': `program HelloWorld;
type
  TPerson = record
    Name: string;
    Age: Integer;
  end;

function Greet(p: TPerson): string;
begin
  Result := 'Hello, ' + p.Name + '! You are ' + IntToStr(p.Age) + ' years old.';
end;

var
  person: TPerson;
begin
  person.Name := 'Alice';
  person.Age := 30;
  WriteLn(Greet(person));
end.`,

  'python->csharp': `from dataclasses import dataclass
from typing import Optional
import sqlite3

@dataclass
class User:
    id: int
    name: str
    email: str
    is_active: bool = True
    score: Optional[float] = None

def get_top_users(db_path: str, min_score: float = 90.0) -> list[User]:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute(
        "SELECT id, name, email, is_active, score FROM users WHERE score >= ? ORDER BY score DESC",
        (min_score,)
    )
    rows = cursor.fetchall()
    conn.close()
    return [User(*row) for row in rows]

def format_user(user: User) -> str:
    status = "active" if user.is_active else "inactive"
    return f"{user.name} <{user.email}> [{status}] score={user.score:.1f}"`,

  'csharp->python': `public class UserService
{
    private readonly List<User> _users;

    public UserService(List<User> users)
    {
        _users = users;
    }

    public IEnumerable<User> GetTopUsers(double minScore = 90.0)
    {
        return _users
            .Where(u => u.IsActive && u.Score >= minScore)
            .OrderByDescending(u => u.Score);
    }

    public string FormatUser(User user)
    {
        var status = user.IsActive ? "active" : "inactive";
        return $"{user.Name} <{user.Email}> [{status}] score={user.Score:F1}";
    }
}`,

  'python->cpp': `def bubble_sort(arr: list[int]) -> list[int]:
    n = len(arr)
    result = arr.copy()
    for i in range(n):
        for j in range(0, n - i - 1):
            if result[j] > result[j + 1]:
                result[j], result[j + 1] = result[j + 1], result[j]
    return result`,
};

export function init(container) {
  container.style.flexDirection = 'column';
  const langOptions = LANGUAGES.map(l => `<option value="${l.value}">${l.label}</option>`).join('');

  container.innerHTML = `
    <div class="pane-toolbar" style="gap:10px;padding:10px 14px;flex-shrink:0;flex-wrap:nowrap;border-bottom:1px solid var(--border);overflow-x:auto;">
      <label class="option-label">From:
        <select id="cc-from">${langOptions}</select>
      </label>
      <span style="color:var(--text-muted);font-size:14px;">→</span>
      <label class="option-label">To:
        <select id="cc-to">${langOptions}</select>
      </label>

      <span id="cc-custom-row" style="display:none;align-items:center;gap:6px;">
        <input type="text" id="cc-src-lang" placeholder="source" style="width:90px;background:var(--surface2);border:1px solid var(--border);color:var(--text);padding:4px 8px;border-radius:var(--radius);font-size:12px;outline:none;">
        <span style="color:var(--text-muted);">→</span>
        <input type="text" id="cc-dst-lang" placeholder="target" style="width:90px;background:var(--surface2);border:1px solid var(--border);color:var(--text);padding:4px 8px;border-radius:var(--radius);font-size:12px;outline:none;">
      </span>

      <span id="cc-style-row" style="display:none;">
        <label class="option-label">Style:
          <select id="cc-style">${STYLE_HINTS.map(s => `<option value="${s.value}">${s.label}</option>`).join('')}</select>
        </label>
      </span>

      <label class="option-label" style="margin-left:auto;">Model:
        <select id="cc-model">${MODELS.map(m => `<option value="${m.value}">${m.label}</option>`).join('')}</select>
      </label>

      <button class="btn primary" id="cc-convert">▶ Convert</button>
      <div id="cc-spinner" style="display:none;align-items:center;"><span class="streaming-dot"></span></div>
      <span id="cc-status"></span>
    </div>

    <div class="editor-panes">
      <div class="editor-pane">
        <div class="pane-toolbar">
          <span class="pane-label" id="cc-src-label">Source</span>
          <button class="btn" id="cc-paste">Paste</button>
          <button class="btn" id="cc-sample">Sample</button>
          <button class="btn danger" id="cc-clear">Clear</button>
        </div>
        <textarea class="pane-textarea" id="cc-input" placeholder="Paste code here..."></textarea>
      </div>
      <div class="editor-pane">
        <div class="pane-toolbar">
          <span class="pane-label" id="cc-dst-label">Output</span>
          <button class="btn" id="cc-copy">Copy</button>
        </div>
        <div class="pane-output" id="cc-output" style="font-family:var(--font-mono);"></div>
      </div>
    </div>
  `;

  const fromSel   = container.querySelector('#cc-from');
  const toSel     = container.querySelector('#cc-to');
  const customRow = container.querySelector('#cc-custom-row');
  const styleRow  = container.querySelector('#cc-style-row');
  const srcLabel  = container.querySelector('#cc-src-label');
  const dstLabel  = container.querySelector('#cc-dst-label');
  const srcLangIn = container.querySelector('#cc-src-lang');
  const dstLangIn = container.querySelector('#cc-dst-lang');

  // Set sensible defaults: SQL → C#
  fromSel.value = 'sql';
  toSel.value   = 'csharp';

  function updateUI() {
    const src = fromSel.value;
    const dst = toSel.value;
    const isCustom = src === 'custom' || dst === 'custom';
    const showStyle = src === 'sql' && dst === 'csharp';

    customRow.style.display = isCustom ? 'flex' : 'none';
    styleRow.style.display  = showStyle ? '' : 'none';

    const srcDisplay = src === 'custom' ? (srcLangIn.value || 'Source') : LANGUAGES.find(l => l.value === src).label;
    const dstDisplay = dst === 'custom' ? (dstLangIn.value || 'Output') : LANGUAGES.find(l => l.value === dst).label;
    srcLabel.textContent = srcDisplay;
    dstLabel.textContent = dstDisplay;
  }

  fromSel.addEventListener('change', updateUI);
  toSel.addEventListener('change', updateUI);
  srcLangIn.addEventListener('input', updateUI);
  dstLangIn.addEventListener('input', updateUI);
  updateUI();

  // Sample button
  container.querySelector('#cc-sample').addEventListener('click', () => {
    const src = fromSel.value;
    const dst = toSel.value;
    const key = `${src}->${dst}`;
    const fallback = `// No sample for ${src} → ${dst}\n// Paste your ${src.toUpperCase()} code here`;
    container.querySelector('#cc-input').value = SAMPLES[key] || fallback;
  });

  container.querySelector('#cc-paste').addEventListener('click', async () => {
    container.querySelector('#cc-input').value = await navigator.clipboard.readText();
  });

  container.querySelector('#cc-clear').addEventListener('click', () => {
    container.querySelector('#cc-input').value = '';
    container.querySelector('#cc-output').textContent = '';
    container.querySelector('#cc-output').className = 'pane-output';
    container.querySelector('#cc-status').innerHTML = '';
  });

  container.querySelector('#cc-copy').addEventListener('click', () => {
    navigator.clipboard.writeText(container.querySelector('#cc-output').textContent);
    flashBtn(container.querySelector('#cc-copy'), 'Copied!');
  });

  // Convert
  let abortCtrl = null;

  container.querySelector('#cc-convert').addEventListener('click', async () => {
    const code = container.querySelector('#cc-input').value.trim();
    if (!code) return;

    if (abortCtrl) { abortCtrl.abort(); }
    abortCtrl = new AbortController();

    const src   = fromSel.value === 'custom' ? srcLangIn.value.trim() : fromSel.value;
    const dst   = toSel.value   === 'custom' ? dstLangIn.value.trim() : toSel.value;
    const style = (fromSel.value === 'sql' && toSel.value === 'csharp')
                    ? container.querySelector('#cc-style').value : '';
    const model = container.querySelector('#cc-model').value;

    const output     = container.querySelector('#cc-output');
    const status     = container.querySelector('#cc-status');
    const spinner    = container.querySelector('#cc-spinner');
    const convertBtn = container.querySelector('#cc-convert');

    output.textContent = '';
    output.className   = 'pane-output';
    status.innerHTML   = '<span class="status-badge info">Converting…</span>';
    spinner.style.display = 'flex';
    convertBtn.disabled   = true;

    try {
      const res = await fetch('/api/convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source_lang: src, target_lang: dst, code, style_hint: style, model }),
        signal: abortCtrl.signal,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: res.statusText }));
        throw new Error(err.detail || res.statusText);
      }

      const reader  = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let done   = false;

      while (!done) {
        const { value, done: d } = await reader.read();
        done = d;
        buffer += decoder.decode(value || new Uint8Array(), { stream: !d });
        const lines = buffer.split('\n');
        buffer = lines.pop();
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6);
          if (data === '[DONE]') { done = true; break; }
          try {
            const { token } = JSON.parse(data);
            if (token) output.textContent += token;
            output.scrollTop = output.scrollHeight;
          } catch {}
        }
      }

      status.innerHTML = '<span class="status-badge ok">Done</span>';
    } catch (e) {
      if (e.name === 'AbortError') {
        status.innerHTML = '<span class="status-badge info">Cancelled</span>';
      } else {
        output.textContent += '\n\n[Error: ' + e.message + ']';
        output.className   = 'pane-output error';
        status.innerHTML   = '<span class="status-badge err">Error</span>';
      }
    } finally {
      spinner.style.display = 'none';
      convertBtn.disabled   = false;
    }
  });
}

function flashBtn(btn, text) {
  const orig = btn.textContent;
  btn.textContent = text;
  setTimeout(() => { btn.textContent = orig; }, 1500);
}
