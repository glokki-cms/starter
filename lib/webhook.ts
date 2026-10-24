import { createHmac, timingSafeEqual } from "node:crypto"

/**
 * Verifies a CMS → site webhook. Same protocol as @glokki-cms/cache's
 * createInvalidationHandler: X-Editor-Timestamp + X-Editor-Signature
 * (hex HMAC-SHA256 of `${timestamp}.${rawBody}`), 5-minute replay window.
 * Re-implemented here because the starter has no cache store to hand to
 * that handler — its cache is the Next.js Data Cache.
 */
export const REPLAY_WINDOW_MS = 5 * 60 * 1000

export type VerifyResult =
  | { ok: true; payload: unknown }
  | { ok: false; status: 400 | 401 }

export async function verifySignedRequest(
  req: Request,
  secret: string,
  now = Date.now()
): Promise<VerifyResult> {
  const ts = req.headers.get("X-Editor-Timestamp")
  const sig = req.headers.get("X-Editor-Signature")
  if (!ts || !sig) return { ok: false, status: 401 }

  const tsMs = Date.parse(ts)
  if (!Number.isFinite(tsMs) || Math.abs(now - tsMs) > REPLAY_WINDOW_MS) {
    return { ok: false, status: 401 }
  }

  const raw = await req.text()
  const expected = createHmac("sha256", secret)
    .update(`${ts}.${raw}`)
    .digest("hex")
  const a = Buffer.from(sig)
  const b = Buffer.from(expected)
  if (a.length !== b.length || !timingSafeEqual(a, b))
    return { ok: false, status: 401 }

  try {
    return { ok: true, payload: JSON.parse(raw) }
  } catch {
    return { ok: false, status: 400 }
  }
}
