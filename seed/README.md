# Seed content

Demo content for a fresh tenant: three pages (home, about, contact) in `en` and `pl`, plus the default layout header and footer. P3's "Connect your site" flow imports it. Until then you can recreate it by hand in the editor.

## Formats

Page (`seed/pages/<name>.<locale>.json`):

```ts
{
  slug: string // leading slash: "/", "/about"
  locale: string
  title: string
  layoutKey: "default" | "empty"
  seo: { title: string; description: string }
  componentTree: Array<{ id: string; type: string; props: Record<string, unknown> }>
}
```

Layout (`seed/layouts/default.<locale>.json`):

```ts
{ layoutKey: "default"; locale: string; header: HeaderData; footer: FooterData }
```

Asset reference: the string `"seed/assets/<file>.webp"` in any image prop. The importer uploads the file and swaps the reference for its `/cdn/` URL.

`tests/seed.test.ts` validates every block's props against the block schemas, both layouts against the layout schemas, and that every referenced asset exists.
