# CLAUDE.md — devtools operational notes

This file documents non-obvious decisions, past bugs, and operational knowledge for future sessions.

---

## CI/CD Pipeline

- Uses a **self-hosted GitHub Actions runner** on the server (not cloud runners)
- Runner is at `/home/admincik/actions-runner/`, registered against `https://github.com/rguzel/devtools`
- Managed by systemd: `sudo systemctl status github-runner-devtools`
- Workflow uses `runs-on: self-hosted`, `environment: production`
- Deploy = rsync `html/` + `api/` then `docker compose restart` — **no SSH secrets needed**
- The environment variables (`DEPLOY_HOST`, etc.) in the README are stale — the current workflow does NOT use SSH or those secrets at all
- Push to `main` → runner picks it up locally → files sync → containers restart

---

## Server Layout

| Path | Purpose |
|------|---------|
| `/home/admincik/codetoolbox/` | Live deployment root |
| `/home/admincik/codetoolbox/html/` | Frontend static files |
| `/home/admincik/codetoolbox/api/` | FastAPI backend |
| `/home/admincik/actions-runner/` | GitHub Actions self-hosted runner |
| `/home/admincik/projects/olivia-restaurant/` | Separate project, don't touch |

Reverse proxy: **native nginx** on host (ports 80/443), managed via nginx-ui container at port 9043.  
SSL: Certbot / Let's Encrypt. Configs in `/etc/nginx/sites-enabled/`.

---

## External Services (called from frontend)

| Service | URL | Notes |
|---------|-----|-------|
| OCR API | `https://ocr.recepguzel.com` | FastAPI + EasyOCR, Docker container |
| PDF generator | `https://pdf.recepguzel.com` | MCP server (Gotenberg), Docker container |
| IP geolocation | `https://ipapi.co/json/` | Free tier, no key needed |
| DoH (DNS leak test) | Cloudflare/Google/Quad9/AdGuard | Queried client-side via fetch |

---

## Known Bugs Fixed

### pdf-generator.js — regex syntax error (fixed 2026-05-04)
The URL rewrite regex was `/^http://[^/]+/` — the `//` ended the regex early causing `SyntaxError: Unexpected token '^'`.  
**Fix:** escape the slashes: `/^https?:\/\/[^/]+/`  
File: `html/js/tools/pdf-generator.js` line ~230.

### OCR 500 error — numpy not JSON serializable
EasyOCR returns `numpy.int32` values which FastAPI can't serialize.  
**Fix:** Added `_NumpyEncoder` in `ocr-api/main.py` and returned `JSONResponse(content=json.loads(json.dumps(payload, cls=_NumpyEncoder)))`.

### OCR returns 200 but no text
`data.pages` is an integer count, not an array. The actual page text is in `data.pages_detail`.  
**Fix:** `pages = data.pages_detail || [{ text: data.text || '' }]` in `ocr.js`.

### pdf-generator fetch 406 Not Acceptable
Wrong `Accept` header and wrong tool name.  
**Fix:** `Accept: application/json, text/event-stream`, tool name `generate_pdf`, params `title` + `content`.

### pdf-tool container loses edits on restart
`docker exec` writes are lost when container restarts.  
**Workflow:** Edit host files → `docker cp file container:/path` → `docker restart container`.

### DNS leak test ERR_TUNNEL_CONNECTION_FAILED
bash.ws probe subdomains have no SSL certs — can't fetch from HTTPS pages (mixed content blocked).  
**Fix:** Switched to DNS-over-HTTPS (DoH) providers queried via fetch. Tests DNS resolution rather than which resolver is used.

---

## Tool Layout Pattern

All tools use a scoped root wrapper to prevent flex/height bleed:

```js
<style>
  #toolname-root {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    overflow: hidden;
  }
  #toolname-root .toolbar { flex-shrink: 0; }
  #toolname-root .content { flex: 1; overflow: hidden; }
</style>
<div id="toolname-root">...</div>
```

Two-column tools (OCR, PDF generator) use: `grid-template-columns: 260-300px 1fr`.

---

## Public Repo Notes

- Repo is public: `https://github.com/rguzel/devtools`
- Public = read-only for everyone; only collaborators can push
- All internal IPs (192.168.50.x) replaced with `localhost` before committing
- No keys or secrets in the repo — pipeline doesn't need them (self-hosted runner runs locally)
