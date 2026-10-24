import { defineLayout } from "@glokki-cms/sdk"

import { Footer, footerSchema } from "./footer"
import { Header, headerSchema } from "./header"

export const Default = defineLayout({
  key: "default",
  label: "Default",
  headerSchema,
  footerSchema,
  Header,
  Footer,
})
