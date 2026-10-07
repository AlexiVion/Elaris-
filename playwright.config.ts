import { defineConfig, devices } from "@playwright/test";

/**
 * E2E owns a dedicated port to avoid accidentally testing a different local app
 * (ClickDialog has occupied :3000 on the same host).
 */
const e2ePort = process.env.ELARIS_E2E_PORT ?? "3105";
const e2eURL = `http://127.0.0.1:${e2ePort}`;

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 180_000,
  expect: { timeout: 20_000 },
  fullyParallel: true,
  reporter: "list",
  use: {
    baseURL: e2eURL,
    navigationTimeout: 180_000,
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    // Make the E2E gate self-contained. Next dev can cold-compile for several
    // minutes on /mnt/c, while a previous dev run can also leave .next without
    // a production BUILD_ID. Build first, then exercise the production server.
    command: `pnpm build && node ./node_modules/next/dist/bin/next start --hostname 127.0.0.1 --port ${e2ePort}`,
    url: e2eURL,
    reuseExistingServer: !process.env.CI,
    timeout: 900_000,
  },
});
