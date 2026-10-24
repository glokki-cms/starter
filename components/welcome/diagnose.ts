import type { CmsProbe } from "@/lib/cms"

export type WelcomeState =
  | { kind: "missing-env"; missing: string[] }
  | { kind: "unreachable"; message: string }
  | { kind: "unauthorized"; httpStatus: number }
  | { kind: "cms-error"; httpStatus: number; message: string }
  | { kind: "no-pages" }

export function diagnose({
  missing,
  probe,
}: {
  missing: string[]
  probe?: CmsProbe
}): WelcomeState | null {
  if (missing.length > 0) return { kind: "missing-env", missing }
  if (!probe) return null
  switch (probe.status) {
    case "unauthorized":
      return { kind: "unauthorized", httpStatus: probe.httpStatus }
    case "error":
      return probe.httpStatus === undefined
        ? { kind: "unreachable", message: probe.message }
        : {
            kind: "cms-error",
            httpStatus: probe.httpStatus,
            message: probe.message,
          }
    case "ok":
      return probe.pageCount === 0 ? { kind: "no-pages" } : null
  }
}
