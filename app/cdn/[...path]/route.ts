// /cdn/... images served from your own domain (docs/guides/asset-cdn-proxy.md)
import { createAssetProxy } from "@glokki-cms/sdk/asset-proxy"

const handler = createAssetProxy()
export const GET = handler
export const HEAD = handler
