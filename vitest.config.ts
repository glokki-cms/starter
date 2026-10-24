import path from "node:path"

import react from "@vitejs/plugin-react"
import { defineConfig } from "vitest/config"

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    include: ["**/*.test.{ts,tsx}"],
    exclude: ["node_modules/**", ".next/**"],
    // @glokki-cms/react imports "next/navigation" without an extension; inline it so Vite resolves it.
    server: { deps: { inline: [/@glokki-cms/] } },
  },
  resolve: { alias: { "@": path.resolve(import.meta.dirname, ".") } },
})
