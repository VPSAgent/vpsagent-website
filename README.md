# VPSAgent Website

Official static marketing website for **VPSAgent** ("Give your AI agent a $5 VPS, safely.").

## Files

- `index.html` — Marketing page sections, interactive 4-tab dashboard preview, MCP client workbench, and live action gate
- `styles.css` — Deep obsidian-emerald architectural grid theme (`#050908` + `#10b981`) with responsive layout
- `main.js` — Interactive 4-tab dashboard preview, MCP client snippet switcher, live safety gate simulator, and copy helpers
- `favicon.svg` & `icons/` — Brand mark and supported AI MCP client logos
- `share.jpg` — Open Graph social preview card
- `Dockerfile`, `Caddyfile.container`, `docker-compose.yml` — Static container deployment setup (listens on port `8080`)

## Preview Locally

Run any local static file server inside this directory:

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

## Deploy With Docker / VPSAgent

```bash
docker compose up -d --build
```
