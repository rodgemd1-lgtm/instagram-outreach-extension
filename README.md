# Alex Recruiting Project

Monorepo for Jacob Rodgers' college recruiting system.

## Repo Structure

```
alex-recruiting-project/
├── alex-recruiting/       ← Next.js recruiting website (deploys to Vercel)
├── src/                   ← Chrome extension (local build only)
│   ├── background/
│   ├── content-scripts/
│   ├── popup/
│   └── dashboard/
├── manifest.json          ← Chrome extension manifest
├── webpack.config.js      ← Chrome extension build config
└── dist/                  ← Chrome extension build output (gitignored)
```

### `alex-recruiting/` — Recruiting Website

Next.js 14 app with App Router. Jacob's public recruiting profile, coach CRM, content engine, and operations dashboard.

- **Deployed to**: [alex-recruiting.vercel.app](https://alex-recruiting.vercel.app)
- **Public recruit page**: [alex-recruiting.vercel.app/recruit](https://alex-recruiting.vercel.app/recruit)
- **Only this subdirectory deploys to Vercel.** The root-level Chrome extension does not.

```bash
cd alex-recruiting
npm install
npm run dev       # http://localhost:3000
npm run build     # Production build
npm test          # Run tests
```

### Root Level — Chrome Extension

Recruiting intelligence Chrome extension for Instagram/Twitter outreach and campaign management. Built locally and loaded into Chrome — never deployed to Vercel.

```bash
npm install
npm run build     # Outputs to dist/
# Load dist/ as unpacked extension in chrome://extensions
```

## Vercel Deployment

Only `alex-recruiting/` has a Vercel project. The Vercel project root is set to `alex-recruiting/`. Large media files in `public/recruit/` (~264 MB) are excluded from serverless bundles via `outputFileTracingExcludes` in `next.config.mjs`.
