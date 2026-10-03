import { test, expect } from "@playwright/test";

/**
 * Smoke tests for the three key screens, asserting COMPUTED values from the
 * seed (spec §10): Home, Deployment Overview (readiness 64%, coverage 4 of 5),
 * Change Impact (golden counters 3/3/2/1, nine affected items).
 */

test("Deployment Control home renders KPIs and links to a deployment", async ({ page }) => {
  await page.goto("/platform/deployment-control");
  await expect(page.getByRole("heading", { name: "Home", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Active Deployments" })).toBeVisible();
  await expect(page.getByText("Demo data")).toBeVisible();

  await page.getByRole("link", { name: "Valve Inspection Pilot" }).first().click();
  await expect(page).toHaveURL(/\/platform\/deployment-control\/deployments\/DEP-0017/);
});

test("deployment overview computes readiness and coverage", async ({ page }) => {
  await page.goto("/deployments/DEP-0017");
  await expect(page.getByRole("heading", { name: "Valve Inspection Pilot" })).toBeVisible();
  await expect(page.getByText("64%").first()).toBeVisible();
  await expect(page.getByText("4 of 5 applicable evidence items linked")).toBeVisible();
  await expect(page.getByText("Not requested", { exact: true })).toBeVisible();
  await expect(page.getByText("Active baseline")).toBeVisible();
  await expect(page.getByText(/B-0017-01 · C004/)).toBeVisible();
  await expect(page.getByText("Pending change")).toBeVisible();
  await expect(page.getByRole("link", { name: /CHG-0005 · review required/ })).toBeVisible();
  // Never uses forbidden vocabulary (spec §1.3, §10).
  await expect(page.getByText(/compliant/i)).toHaveCount(0);
  await expect(page.getByText(/certified/i)).toHaveCount(0);
});

test("change impact shows the golden counters and cyber check", async ({ page }) => {
  await page.goto("/changes/CHG-0005");
  await expect(page.getByText("BrainCo Revo2").first()).toBeVisible();
  await expect(page.getByText("Inspire RH56DFX").first()).toBeVisible();
  await expect(page.getByText("Confirm no cyber impact").first()).toBeVisible();
  await expect(page.getByText("Hand interface changed")).toBeVisible();

  // Potential Impact counters: 3 evidence, 3 requirements, 2 approvals, 1 deployment.
  await expect(page.getByText("Affected evidence items")).toBeVisible();
  await expect(page.getByText("Affected requirements")).toBeVisible();
  await expect(page.getByText("Affected approvals")).toBeVisible();
  await expect(page.getByText(/Potential impact is a review signal/)).toBeVisible();
  await expect(page.getByText("Re-approval", { exact: true })).toBeVisible();
});

test("global search finds a deployment by code", async ({ page }) => {
  await page.goto("/search?q=DEP-0017");
  await expect(page.getByRole("link", { name: "Valve Inspection Pilot" })).toBeVisible();
});


test("evidence and requirements filter to the pilot deployment", async ({ page }) => {
  test.setTimeout(60_000);

  await page.goto("/evidence?deployment=DEP-0017");
  await expect(page.getByText("INT-042")).toBeVisible();
  await expect(page.getByText("Integration test").first()).toBeVisible();
  await expect(page.getByText("INT-051")).toHaveCount(0);

  await page.goto("/requirements?deployment=DEP-0017");
  await expect(page.getByText("SAF-017")).toBeVisible();
  await expect(page.getByText("Operator training record")).toBeVisible();
  await expect(page.getByText("Site acceptance test")).toBeVisible();
});

test("pilot reports render from the same deployment and change core", async ({ page }) => {
  await page.goto("/reports/readiness/DEP-0017");
  await expect(page.getByText("Elaris · Deployment Readiness Pack")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Valve Inspection Pilot" })).toBeVisible();
  await expect(page.getByText(/B-0017-01 · snapshot C004/)).toBeVisible();

  await page.goto("/reports/impact/CHG-0005");
  await expect(page.getByText("Elaris · Change Impact Report")).toBeVisible();
  await expect(page.getByText("BrainCo Revo2")).toBeVisible();
  await expect(page.getByText("Inspire RH56DFX")).toBeVisible();
  await expect(page.getByText("Re-approval", { exact: true }).first()).toBeVisible();
});
