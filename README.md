# VPSAgent Website

Official static marketing website for **VPSAgent** ("Give your AI agent a $5 VPS, safely.").

## Files

- `index.html` — Marketing page sections and interactive product demos
- `styles.css` — Pure-black + emerald (`#10b981`) responsive styles
- `main.js` — Subtle hero parallax, interactive 4-tab dashboard preview, approval simulator, and copy helpers
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
