// Shared by the app's client (lib/db.ts) and `pnpm db:seed`, so only plain TypeScript here.

/** `sslmode=disable` in the URL turns SSL off (a local or CI Postgres); otherwise it's required. */
export function sslFor(url: string): "require" | false {
  return /[?&]sslmode=disable\b/.test(url) ? false : "require";
}
