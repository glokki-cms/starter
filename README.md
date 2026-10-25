# glokki Starter

A Next.js 16 website starter for [glokki CMS](https://app.glokki.com). It ships ten ready-made blocks, three themes, a default header and footer layout, and the plumbing a real site needs: visual-editor preview, webhook-driven revalidation, a sitemap, robots rules, an image proxy and Markdown for agents. Connect it to your glokki organization, edit content in the visual editor, and publish.

## Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fglokki-cms%2Fstarter&env=CMS_BASE_URL,CMS_TENANT,CMS_API_KEY,CMS_REVALIDATE_SECRET&envDefaults=%7B%22CMS_BASE_URL%22%3A%22https%3A%2F%2Fapp.glokki.com%22%7D&envDescription=Values%20from%20your%20glokki%20organization&envLink=https%3A%2F%2Fgithub.com%2Fglokki-cms%2Fstarter%23connect-to-glokki)

The build does not need the CMS to be reachable or to contain any content. A fresh deploy shows a diagnostic welcome screen until you have connected and published a page.

## Connect to glokki

Set these four variables (Vercel asks for them on deploy; locally they go in `.env.local`):

| Variable                | Where to find it                                                                            |
| ----------------------- | ------------------------------------------------------------------------------------------- |
| `CMS_BASE_URL`          | Your glokki address, `https://app.glokki.com` for the hosted CMS.                           |
| `CMS_TENANT`            | Your organization's slug (Settings → General).                                              |
| `CMS_API_KEY`           | An API key with **only** the `delivery:read` scope (Settings → API keys). See below.        |
| `CMS_REVALIDATE_SECRET` | A secret you invent: `openssl rand -hex 32`. Paste the same value into the CMS (see below). |

Then, in the CMS under **Settings → Visual Editor**:

1. Set **Frontend URL** to your deployed site, for example `https://my-site.vercel.app`.
2. Set **Revalidation URL** to `https://<your-site>/api/revalidate`.
3. Set **Webhook Secret** to the same value as `CMS_REVALIDATE_SECRET`.

**Create `CMS_API_KEY` with only the `delivery:read` scope.** The key is embedded in your site's JavaScript (the contact form calls the Delivery API from the browser), so anyone can read it. Never use an admin-scoped key, or one you created for the import CLI or MCP: every scope you tick is published to every visitor.

Set `CMS_LOCALES` (comma-separated, default `en`) to your organization's locales. A locale the CMS doesn't have would get its own URL prefix serving the default-locale content. If you add a locale in glokki (Settings → Locales), add it here too.

Open the visual editor once. That handshake sends the block and layout definitions to the CMS, so the block picker shows this starter's blocks.

See [`.env.example`](.env.example) for every variable, including the optional ones.

## Run locally

```bash
npm install
cp .env.example .env.local   # then fill in the four required values
npm run dev                  # http://localhost:3001
```

Other scripts: `npm run test`, `npm run typecheck`, `npm run lint`, `npm run build`.

## Themes

Three presets live in `themes/`:

- **paper**: light, warm and editorial, with serif type.
- **grid**: light, crisp and structured, with a blue accent. This is the default.
- **dusk**: dark only, with a lime accent.

Pick one with `NEXT_PUBLIC_THEME=paper|grid|dusk`. Casing and surrounding whitespace are ignored.

To rebrand in about five minutes, edit one `themes/*.css` file (colors, radii and spacing are tokens there) and swap the fonts in `fonts/<theme>.ts` (only the active theme's fonts are loaded and preloaded). Blocks never contain colors; they only use tokens. A token-guard test enforces this, so a hard-coded color in `blocks/`, `layouts/` or `components/` fails `npm run test`.

## Blocks

Four categories: Sections, Content, Media and Conversion.

| Block           | Category   | What it is                           |
| --------------- | ---------- | ------------------------------------ |
| `hero`          | Sections   | Headline, copy, buttons and an image |
| `rich-text`     | Content    | Formatted text                       |
| `features-grid` | Sections   | A grid of feature cards              |
| `media-text`    | Sections   | Image beside text, either way around |
| `image`         | Media      | A single image with caption          |
| `logo-cloud`    | Media      | A row of customer or partner logos   |
| `testimonials`  | Content    | Quotes with names and roles          |
| `faq`           | Content    | Collapsible questions and answers    |
| `cta`           | Conversion | A call-to-action banner              |
| `contact`       | Conversion | Contact details and a glokki form    |

The `contact` block needs the ID of a glokki form (Forms → copy ID). Until you set one, the visual editor shows a setup hint in its place; visitors see only the contact details.

### Adding a block

1. Create `blocks/my-block.tsx` and declare it with `defineBlock()` from `@glokki-cms/sdk`: a type, label, category, Zod schema, default props and the React component.
2. Add it to the list in `blocks/registry.ts`.
3. Reopen the visual editor so the CMS picks up the new definition.

Image props store `/cdn/`-rewritable URL strings, so validate them with `z.string()` and not `.url()`.

## Seed content

`seed/` holds demo content for a fresh organization: a home, an about and a contact page in `en` and `pl`, the default layout header and footer in both locales, and the CC0 images they use. The CMS "Connect your site" flow will import it. Until then you can recreate it by hand in the editor. `seed/README.md` documents the file formats.

## Caching

Pages are fetched with the Next.js Data Cache under a `cms` tag. When you publish, the CMS calls `/api/revalidate`; the route verifies the signed payload (and rejects anything older than five minutes) and expires that tag immediately, so the next request fetches fresh content. As a backstop, every cached read also expires after an hour, so a misconfigured webhook delays edits by at most an hour instead of freezing them. No extra infrastructure is needed.

If edits don't appear within seconds, check **Settings → Visual Editor**: the **Revalidation URL** must point at `https://<your-site>/api/revalidate` and the **Webhook Secret** must equal `CMS_REVALIDATE_SECRET`.

If you want the site to keep serving through a CMS outage, upgrade to `@glokki-cms/cache` with `@glokki-cms/cache-redis` or `@glokki-cms/cache-postgres`. They add a stale-while-revalidate layer in your own Redis or Postgres. The glokki guide "Tenant-side caching with PostgreSQL" walks through the setup.

## SEO

- **`APP_ENV`**: only `production` is indexable. An explicit `APP_ENV` wins; otherwise `VERCEL_ENV=production` counts as production; anything else is treated as development and gets `noindex`. On a host other than Vercel, set `APP_ENV=production` when you build your live site or it will not be indexed. `APP_ENV` is read at build time, so setting it only at runtime (for example on a Docker image built once and promoted) has no effect.
- **Sitemap**: `/sitemap.xml` is served from the CMS Delivery API, with your public origin as the host of every URL.
- **Robots**: `/robots.txt` allows crawling in production only and points at the sitemap.
- **Markdown for agents**: request any page with `Accept: text/markdown`, or fetch `/md/<path>`, to get a Markdown rendering.

Set `NEXT_PUBLIC_SITE_URL` to your public origin if it differs from the Vercel production domain. Like `APP_ENV`, it is inlined at build time: rebuild after changing it.

## License

[MIT](LICENSE)
