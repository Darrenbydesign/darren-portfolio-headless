# darren-portfolio-headless

My revitalization of my portfolio using more modern tooling.

## Astro integration

This repository is now Astro-enabled so your existing vanilla HTML/CSS/JS frontend can be migrated into Astro with minimal structural changes.

### What was added

- Astro project scripts and dependency in `package.json`
- `astro.config.mjs`
- `src/layouts/BaseLayout.astro`
- `src/pages/index.astro` starter route

### Use your current frontend page structure

To keep your existing multi-page frontend organization:

1. Copy each existing page into `src/pages` with matching route paths.
   - Example: `about.html` → `src/pages/about.astro`
   - Example: `projects/index.html` → `src/pages/projects/index.astro`
2. Keep your existing CSS/JS assets where they already live (no `public/styles` folder is required).
3. Reference those assets in your Astro pages/layout exactly as you do now.

### Run locally

```bash
npm install
npm run dev
```

> Note: In this execution environment, npm registry access was blocked (`403 Forbidden`), so dependency installation must be run in your local/dev environment.

## Strapi next steps

1. Add Strapi environment variables in `.env`.
2. Fetch Strapi data in Astro pages/endpoints.
3. Add dynamic routes with `getStaticPaths()` where needed.
