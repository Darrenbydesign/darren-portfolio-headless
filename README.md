# Darren Portfolio Headless

Portfolio project managed as a small monorepo:

- `apps/cms` is the Strapi headless CMS.
- `apps/web` is the Astro frontend.

## Run Locally

Install dependencies from the repository root:

```bash
npm install
```

Run the Astro frontend:

```bash
npm run dev:web
```

Run the Strapi CMS:

```bash
npm run dev:cms
```

Build both apps:

```bash
npm run build
```
