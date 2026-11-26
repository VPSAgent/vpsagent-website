# VPSAgent Website

Official static marketing website for **VPSAgent** ("Give your AI agent a $5 VPS, safely.").

## Files

- `index.html` — Marketing page sections, interactive 4-tab sidebar dashboard preview, MCP client workbench, zero-root pipeline, and live action gate
- `styles.css` — H4 White-on-Black monochrome architectural theme (`#0B0B0B` + `#FFFFFF`) with self-hosted `@font-face` rules and responsive layout
- `main.js` — Interactive 4-tab dashboard preview, ARIA tabs helper, MCP client snippet switcher, live safety gate simulator, and copy helpers
- `fonts/` — Self-hosted IBM Plex Sans, IBM Plex Mono, and Saira Semi Condensed WOFF2 subsets plus OFL license texts
- `favicon.svg` & `icons/` — Pixel-V brand mark (large halftone + small lattice) and supported AI MCP client logos
- `share.jpg` — Open Graph social preview card
- `Dockerfile`, `Caddyfile.container`, `docker-compose.yml` — Static Caddy container deployment setup (listens on port `8080`)

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
