// Run from the repo root: node templates/starter/scripts/generate-seed-assets.mjs
import { mkdirSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

import sharp from "sharp"

const out = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "seed",
  "assets"
)
mkdirSync(out, { recursive: true })

function svg(w, h, body) {
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${body}</svg>`
  )
}
const grad = (id, a, b) =>
  `<defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs>`

const images = {
  "hero.webp": [
    1600,
    1000,
    `${grad("g", "#d9dde4", "#8a93a3")}<rect width="1600" height="1000" fill="url(#g)"/><circle cx="1180" cy="380" r="260" fill="#ffffff" fill-opacity=".35"/><rect x="180" y="560" width="760" height="260" rx="28" fill="#ffffff" fill-opacity=".55"/>`,
  ],
  "team.webp": [
    1200,
    900,
    `${grad("g", "#e7e2da", "#a59c8f")}<rect width="1200" height="900" fill="url(#g)"/>${[0, 1, 2].map((i) => `<circle cx="${300 + i * 300}" cy="420" r="120" fill="#ffffff" fill-opacity=".5"/>`).join("")}`,
  ],
  "office.webp": [
    1200,
    900,
    `${grad("g", "#dfe6e2", "#86998f")}<rect width="1200" height="900" fill="url(#g)"/><rect x="140" y="160" width="420" height="580" rx="20" fill="#ffffff" fill-opacity=".45"/><rect x="640" y="160" width="420" height="270" rx="20" fill="#ffffff" fill-opacity=".45"/>`,
  ],
}
for (let i = 1; i <= 5; i++) {
  images[`logo-${i}.webp`] = [
    320,
    96,
    `<rect width="320" height="96" fill="#ffffff" fill-opacity="0"/><rect x="16" y="28" width="40" height="40" rx="${i * 4}" fill="#6b7280"/><rect x="72" y="38" width="${120 + i * 16}" height="20" rx="10" fill="#6b7280"/>`,
  ]
}

for (const [name, [w, h, body]] of Object.entries(images)) {
  await sharp(svg(w, h, body))
    .webp({ quality: 82 })
    .toFile(join(out, name))
  console.log("wrote", name)
}
