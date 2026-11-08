import { defineConfig, devices } from "@playwright/test";

// End-to-end smoke tests. They seed, change and reset a database, so they never read
// POSTGRES_URL from .env: point E2E_POSTGRES_URL at a throwaway Postgres
// (CI uses a service container). A non-local database needs E2E_ALLOW_REMOTE_DB=1.
const databaseUrl = process.env.E2E_POSTGRES_URL;
if (!databaseUrl) {
  throw new Error(
    "Set E2E_POSTGRES_URL to a throwaway database, e.g. postgres://postgres:postgres@localhost:5432/facturo_e2e?sslmode=disable",
  );
}
const host = new URL(databaseUrl).hostname;
if (!["localhost", "127.0.0.1", "::1"].includes(host) && process.env.E2E_ALLOW_REMOTE_DB !== "1") {
  throw new Error(`E2E_POSTGRES_URL points at ${host}. The tests wipe that database; use a local one.`);
}

const port = Number(process.env.E2E_PORT ?? 3100);
export const e2eEnv = {
  POSTGRES_URL: databaseUrl,
  AUTH_SECRET: "e2e-only-secret-not-used-anywhere-else",
  AUTH_TRUST_HOST: "true",
  CRON_SECRET: "e2e-cron-secret",
  DEMO_EMAIL: "demo@facturo.app",
  DEMO_PASSWORD: "facturo-demo",
  DEMO_DISABLED: "",
  SITE_URL: `http://localhost:${port}`,
};
// The global setup and the tests read the same values.
Object.assign(process.env, e2eEnv);

export default defineConfig({
  testDir: "./e2e",
  globalSetup: "./e2e/global-setup.ts",
  // One shared workspace: run the files one after another.
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: `http://localhost:${port}`,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    // A production build, like the deployed app. Set E2E_SKIP_BUILD=1 to reuse the last one.
    command: process.env.E2E_SKIP_BUILD ? `pnpm start -p ${port}` : `pnpm build && pnpm start -p ${port}`,
    url: `http://localhost:${port}`,
    env: e2eEnv,
    timeout: 300_000,
    reuseExistingServer: false,
    stdout: "ignore",
    stderr: "pipe",
  },
});
