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

Set `PUBLIC_STRAPI_API_URL` in `apps/web/.env` if Strapi is not running at
`http://localhost:1337/api`.
