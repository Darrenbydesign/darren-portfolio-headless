# Darren Portfolio Web

Astro frontend for the Darren Portfolio Headless project.

## Structure

- `src/pages` contains Astro routes.
- `src/layouts/BaseLayout.astro` contains the shared page shell.
- `public/css` and `public/js` contain browser assets served from the site root.

## Run

From the repository root:

```bash
npm run dev:web
```

Or from this folder:

```bash
npm run dev
```

Copy `.env.example` to `.env` and set `STRAPI_API_URL` plus a read-only
`STRAPI_API_TOKEN`. Astro reads Strapi during the build, so neither value is
included in browser JavaScript.

Production hosting and domain steps are documented in the repository root at
`PUBLISHING.md`.
