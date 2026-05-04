# devtools — tools.recepguzel.com

A self-hosted developer toolbox running at [tools.recepguzel.com](https://tools.recepguzel.com).  
Pure vanilla JS frontend (no build step) + FastAPI backend for AI-powered tools.

---

## Tools

### Converters
| Tool | Description |
|------|-------------|
| **Code Converter** | Convert code between languages (Python, C#, C++, SQL, Pascal, Delphi) powered by a local Ollama model |

### JSON Tools
| Tool | Description |
|------|-------------|
| **JSON Formatter** | Pretty-print, minify, validate and inspect JSON. Supports key sorting and stats |
| **JSON → C# Class** | Generate C# POCO classes or records from a JSON object with nullable annotations and `[JsonPropertyName]` support |

### SQL Tools
| Tool | Description |
|------|-------------|
| **SQL Formatter** | Format and indent SQL queries with configurable keyword casing and dialect |
| **SQL Explainer** | Plain-English explanation of SQL queries via local Ollama model |

### Encoders
| Tool | Description |
|------|-------------|
| **Base64** | Encode/decode Base64 (text and file support) |
| **URL Encode/Decode** | URL encode, decode, and query string parser |
| **JWT Inspector** | Decode and inspect JWT header, payload and signature |

### Utilities
| Tool | Description |
|------|-------------|
| **Timestamp** | Convert between Unix timestamps and human-readable dates |

### Minifiers
| Tool | Description |
|------|-------------|
| **Minifier** | Minify HTML, CSS, and JavaScript. HTML minifier handles embedded `<script>`/`<style>` blocks |

### Network Tools
| Tool | Description |
|------|-------------|
| **IP Tools** | Show your public IP with geolocation details, DNS leak test via DoH providers (Cloudflare, Google, Quad9, AdGuard), and WebRTC leak detection |

### Documents
| Tool | Description |
|------|-------------|
| **Image / PDF OCR** | Extract text from images and multi-page PDFs using EasyOCR. Supports 14 languages |
| **Markdown → PDF** | Convert Markdown to a styled PDF via the pdf.recepguzel.com MCP server (Gotenberg-powered) |

---

## Architecture

```
Browser
  └── HTTPS → nginx (tools.recepguzel.com)
        └── proxy → codetoolbox-ui :3110 (nginx:alpine)
                      ├── /              → html/ (static files)
                      └── /api/*         → codetoolbox-api :8000 (FastAPI)
                                              └── Ollama (AI model server)
```

External services used by the frontend:
- `ocr.recepguzel.com` — OCR API (EasyOCR, self-hosted)
- `pdf.recepguzel.com` — PDF generator MCP server (Gotenberg, self-hosted)
- `ipapi.co` — IP geolocation (free tier)
- `cloudflare-dns.com`, `dns.google`, `dns.quad9.net`, `dns.adguard-dns.com` — DoH providers for DNS leak test

---

## Project Structure

```
devtools/
├── html/                        # Frontend (served as static files)
│   ├── index.html
│   ├── nginx.conf               # nginx config for the UI container
│   ├── css/
│   │   └── app.css              # Global design system (CSS variables, layout, components)
│   └── js/
│       ├── app.js               # Tool registry, sidebar builder, lazy init
│       └── tools/               # One file per tool, each exports init(container)
│           ├── base64.js
│           ├── code-convert.js
│           ├── ip-tools.js
│           ├── json-format.js
│           ├── json-to-csharp.js
│           ├── jwt-decode.js
│           ├── minify.js
│           ├── ocr.js
│           ├── pdf-generator.js
│           ├── sql-explain.js
│           ├── sql-format.js
│           ├── timestamp.js
│           └── url-encode.js
├── api/                         # Backend (FastAPI)
│   ├── main.py                  # App entry point, CORS, router registration
│   ├── requirements.txt
│   ├── Dockerfile
│   ├── routers/
│   │   ├── convert.py           # Code conversion endpoint (SSE streaming)
│   │   └── sql.py               # SQL explain endpoint (SSE streaming)
│   └── prompts/                 # Prompt templates per conversion pair
│       ├── generic_convert.txt
│       ├── python_to_csharp.txt
│       └── ...
├── docker-compose.yml
├── .env.example
└── .github/
    └── workflows/
        └── deploy.yml           # CI/CD: rsync to server on push to main
```

---

## Adding a New Tool

1. Create `html/js/tools/<your-tool>.js` exporting `init(container)`:
```js
export function init(container) {
  container.innerHTML = `
    <style>/* scoped styles */</style>
    <div id="mytool-root" style="...">
      <!-- your HTML -->
    </div>
  `;
  // wire up events
}
```

2. Register it in `html/js/app.js`:
```js
import { init as initMyTool } from './tools/my-tool.js';

// Add to TOOLS array:
{ id: 'my-tool', label: 'My Tool', section: 'utils', icon: `<svg...>`, init: initMyTool }

// Add section to SECTIONS if new:
utils: 'Utilities'
```

3. Push to `main` — the deploy pipeline syncs files to the server automatically.

---

## Local Development

No build step required. Serve `html/` with any static server:

```bash
cd html
npx serve .
# or
python3 -m http.server 8080
```

For AI-powered tools (Code Converter, SQL Explainer), run the API locally:

```bash
# Copy env
cp .env.example .env
# Edit .env with your Ollama URL

# Run with Docker Compose
docker compose up

# Or run API directly
cd api
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

---

## Deployment

Deployments run automatically via GitHub Actions on push to `main`.  
The workflow rsyncs `html/` and `api/` to the server and restarts containers.

**Manual deploy:**
```bash
rsync -az --delete html/ admincik@tools.recepguzel.com:/home/admincik/codetoolbox/html/
ssh admincik@tools.recepguzel.com "cd /home/admincik/codetoolbox && docker compose restart"
```

### GitHub Environment: `production`

| Name | Type | Description |
|------|------|-------------|
| `DEPLOY_HOST` | Variable | Server hostname |
| `DEPLOY_USER` | Variable | SSH user |
| `DEPLOY_PATH` | Variable | Remote path for frontend files |
| `APP_PORT` | Variable | Container port mapping |
| `OLLAMA_MODEL` | Variable | Primary Ollama model name |
| `OLLAMA_FALLBACK_MODEL` | Variable | Fallback Ollama model name |
| `DEPLOY_SSH_PRIVATE_KEY` | Secret | SSH private key for server access |
| `OLLAMA_BASE_URL` | Secret | Internal Ollama server URL |

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | Vanilla JS (ES modules), no framework, no build step |
| Fonts | Inter (UI), JetBrains Mono (code) via Google Fonts |
| Backend | Python 3.12, FastAPI, Uvicorn |
| AI | Ollama (local LLM, `qwen2.5-coder:14b`) |
| Container | Docker Compose, nginx:alpine |
| CI/CD | GitHub Actions → rsync over SSH |
| Reverse proxy | nginx (host) + Certbot (Let's Encrypt) |
