# Rextensions

Monorepo for **Rextensions** — a Chrome MV3 extension that manages installed extensions, export/import sync lists, and optional Google cloud backup — plus the marketing site.

## Packages

| Path | Package | Role |
|------|---------|------|
| `apps/extension` | `@rextensions/extension` | Chrome extension (Vue 3 + Vite). Load **`apps/extension/dist`** in Chrome. |
| `apps/web` | `@rextensions/web` | Astro SSG marketing site (SEO, Firebase Hosting). |

## Quick start

```bash
npm install
```

### Extension

```bash
cp apps/extension/.env.example apps/extension/.env
# set VITE_CHROME_OAUTH_CLIENT_ID for Google backup/restore
npm run build:extension
```

Load unpacked: `chrome://extensions` → Developer mode → Load unpacked → select **`apps/extension/dist`**.

Watch mode: `npm run dev:extension`

### Marketing site

```bash
cp apps/web/.env.example apps/web/.env
# set PUBLIC_SITE_URL to your Hosting URL or custom domain
npm run dev:web
```

Production build: `npm run build:web` → output in `apps/web/dist`.

Deploy Hosting (requires [Firebase CLI](https://firebase.google.com/docs/cli) logged into project `rextensions-1d87a`):

```bash
npm run deploy:web
```

## Google Search Console

1. Deploy the site to a stable HTTPS URL (`PUBLIC_SITE_URL`).
2. Add the property in [Google Search Console](https://search.google.com/search-console).
3. Submit the sitemap: `https://<your-host>/sitemap-index.xml`
4. `robots.txt` already points at that sitemap for the default Hosting URL; update `apps/web/public/robots.txt` if the domain changes.

## Features (extension)

- Unified list of installed extensions with enable / disable / remove
- Search by name or description
- Export / import JSON sync lists
- Optional Google backup / restore (restore does **not** auto-install — Open Store for missing)
- Dark / light theme

## Local Google sign-in (extension)

1. Build and load unpacked from `apps/extension/dist`, copy the Extension ID.
2. Google Cloud Console → OAuth client type **Chrome extension** → paste Extension ID.
3. Set `VITE_CHROME_OAUTH_CLIENT_ID` in `apps/extension/.env`, rebuild, reload.
4. Firebase Auth → enable Google; authorized domains as needed.
5. Deploy [`firestore.rules`](firestore.rules).

## Site pages

`/`, `/features`, `/how-it-works`, `/privacy`, `/faq`, `/changelog`, `/contribute`, `/developer`, `/contact`

Developer and contact pages pull public GitHub profile data for `rkanik` at build time (with a checked-in fallback).

## Scripts (root)

| Script | Action |
|--------|--------|
| `npm run build` | Build all workspaces |
| `npm run build:extension` | Extension only |
| `npm run build:web` | Marketing site only |
| `npm run dev:extension` | Extension watch build |
| `npm run dev:web` | Astro dev server |
| `npm run deploy:web` | Build web + `firebase deploy --only hosting` |

## License

MIT — see [LICENSE](LICENSE).
