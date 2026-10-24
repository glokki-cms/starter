import type { WelcomeState } from "./diagnose"

const DOCS = "https://github.com/glokki-cms/starter#readme"

function Card({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <div className="rounded-theme-lg border-line bg-surface w-full max-w-xl border p-8 sm:p-10">
        <p className="text-xs font-semibold tracking-[0.12em] text-accent uppercase">
          glokki starter
        </p>
        <h1 className="heading text-fg mt-3 text-3xl">{title}</h1>
        <div className="mt-6 space-y-4 text-muted">{children}</div>
        <p className="mt-8 text-sm">
          <a href={DOCS} className="text-accent underline underline-offset-4">
            Setup guide
          </a>
        </p>
      </div>
    </main>
  )
}

const code = "rounded bg-bg px-1.5 py-0.5 font-mono text-sm text-fg"

export function WelcomeScreen({
  state,
  cmsUrl,
}: {
  state: WelcomeState
  cmsUrl?: string
}) {
  switch (state.kind) {
    case "missing-env":
      return (
        <Card title="Your site is running — connect it to glokki">
          <p>Set these environment variables and redeploy:</p>
          <ul className="space-y-1">
            {state.missing.map((m) => (
              <li key={m}>
                <code className={code}>{m}</code>
              </li>
            ))}
          </ul>
          <p>
            Locally, copy <code className={code}>.env.example</code> to{" "}
            <code className={code}>.env.local</code>.
          </p>
        </Card>
      )
    case "unauthorized":
      return (
        <Card title="glokki rejected the connection">
          <p>
            The CMS answered{" "}
            <strong className="text-fg">HTTP {state.httpStatus}</strong>. Check
            that <code className={code}>CMS_API_KEY</code> is a Delivery key of
            this organization and that <code className={code}>CMS_TENANT</code>{" "}
            is its slug.
          </p>
        </Card>
      )
    case "unreachable":
      return (
        <Card title="Can’t reach glokki">
          <p>
            The request failed before the CMS answered ({state.message}). Check{" "}
            <code className={code}>CMS_BASE_URL</code>.
          </p>
        </Card>
      )
    case "cms-error":
      return (
        <Card title="glokki returned an error">
          <p>
            HTTP {state.httpStatus}: {state.message}. Try again in a moment.
          </p>
        </Card>
      )
    case "no-pages":
      return (
        <Card title="Connected! Now create your first page">
          <p>
            Your site talks to glokki, but nothing is published yet. Open the
            editor, create a page with the slug <code className={code}>/</code>{" "}
            and publish it.
          </p>
          {cmsUrl && (
            <p>
              <a
                href={`${cmsUrl.replace(/\/+$/, "")}/pages`}
                className="font-medium text-accent"
              >
                Open glokki →
              </a>
            </p>
          )}
        </Card>
      )
  }
}
