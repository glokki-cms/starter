import { createLayoutRegistry } from "@glokki-cms/sdk"

import { Default } from "./default"
import { Empty } from "./empty"

export { type FooterData, footerSchema } from "./default/footer"
export { type HeaderData, headerSchema } from "./default/header"

export const layoutRegistry = createLayoutRegistry([Default, Empty])
