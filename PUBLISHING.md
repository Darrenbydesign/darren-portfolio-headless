# Publishing Darren Sorrels Design

The live site uses four services with one job each:

- IONOS owns `darrensorrelsdesign.com` and handles email.
- GitHub stores the code.
- Strapi Cloud stores portfolio content.
- Netlify builds and serves the website, manages DNS and HTTPS, and receives contact forms.

## 1. Create the Strapi build token

1. Open the Strapi Cloud admin.
2. Go to **Settings > API Tokens**.
3. Create a read-only token named `Netlify build`.
4. Copy it immediately. Do not put it in a committed file.

The token lets Netlify read published blog posts and case studies during a build. It is never sent to browsers.

## 2. Import the repository into Netlify

1. Sign in to Netlify with GitHub.
2. Choose **Add new project > Import an existing project**.
3. Select `Darrenbydesign/darren-portfolio-headless`.
4. Keep `main` as the production branch.
5. Netlify reads these settings from `netlify.toml`:
   - Build command: `npm run build:web`
   - Publish directory: `apps/web/dist`
6. Add these environment variables under **Project configuration > Environment variables**:
   - `STRAPI_API_URL` = `https://wonderful-beauty-a74f7d1b3e.strapiapp.com/api`
   - `STRAPI_API_TOKEN` = the read-only token from step 1
7. Deploy the site and open the temporary `netlify.app` URL.

## 3. Enable contact submissions

1. In Netlify, open **Forms**.
2. Enable form detection.
3. Trigger a new deployment.
4. Submit the contact form on the temporary site.
5. Confirm the message appears in **Forms > contact > Verified submissions**.

The form uses Netlify spam filtering plus a hidden honeypot field. Strapi does not accept contact-message writes from the public site.

## 4. Rebuild when Strapi content changes

1. In Netlify, open **Project configuration > Build & deploy > Build hooks**.
2. Create a hook named `Strapi publish` for the `main` branch and copy its URL.
3. In Strapi, open **Settings > Webhooks** and create a webhook named `Rebuild Netlify`.
4. Paste the Netlify build-hook URL.
5. Enable entry create, update, delete, publish, and unpublish events.
6. Publish a test entry and confirm Netlify starts a deployment.

Treat the build-hook URL like a password. Anyone with it can trigger deployments.

## 5. Connect the IONOS domain

1. In Netlify, open **Domain management** and add `darrensorrelsdesign.com`.
2. Make the bare domain the primary domain and add `www.darrensorrelsdesign.com` as an alias.
3. Enable Netlify DNS and note the assigned nameservers.
4. Before changing IONOS nameservers, copy every existing DNS record into Netlify DNS.
5. Verify these IONOS email records are present in Netlify DNS:
   - MX `mx00.ionos.com`, priority 10
   - MX `mx01.ionos.com`, priority 10
   - TXT `v=spf1 include:_spf-us.ionos.com ~all`
   - CNAME `_dmarc` to `dmarc.ionos.com`
   - Any DKIM records shown in IONOS
6. In IONOS **Domains & SSL**, replace the domain's nameservers with the Netlify nameservers.
7. Do not transfer the domain away from IONOS.
8. Wait for Netlify to confirm DNS and issue HTTPS certificates.

The old `www` destination pointing to `darrensorrels.herokuapp.com` disappears when the Netlify DNS zone becomes active.

## 6. Verify the launch

1. Open both domain versions in a private browser window.
2. Confirm `www` redirects to `https://darrensorrelsdesign.com` without losing the page path.
3. Check home, about, blog, work, one blog detail, and one case-study detail page.
4. Send and receive a test email through the IONOS mailbox.
5. Submit a contact form and verify it in Netlify.
6. Run mobile PageSpeed Insights on home, blog, work, and one detail page. Each Lighthouse category should score at least 90.

## Normal publishing workflow

- Code change: merge to `main`; Netlify deploys automatically.
- Content change: publish in Strapi; the webhook tells Netlify to rebuild.
- Failed deployment: Netlify continues serving the previous successful deployment.
