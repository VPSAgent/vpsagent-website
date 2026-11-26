# VPSAgent Website

Official static marketing website for **VPSAgent** ("Your coding agent's own VPS. Paste one link into Claude Code, and it deploys.").

## Files

- `index.html` — Marketing page sections, interactive 4-tab dashboard preview, demo slot, MCP client workbench, tool catalog, approval gate simulator, install guide, and early access form
- `styles.css` — Deep obsidian-emerald architectural grid theme (`#050908` + `#10b981`) with self-hosted `@font-face` rules and responsive layout
- `main.js` — Vanilla JS: ARIA tabs helper, interactive 4-tab dashboard preview, agent activity line, click-to-load YouTube demo embed, MCP client snippet switcher, approval gate simulator, install switcher, and copy helpers
- `fonts/` — Self-hosted Space Grotesk and JetBrains Mono WOFF2 subsets plus OFL license texts
- `favicon.svg` & `icons/` — Terminal brand mark and supported MCP client logos
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
