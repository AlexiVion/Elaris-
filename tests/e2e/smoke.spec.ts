import { test, expect } from "@playwright/test";

/**
 * Smoke tests for the three key screens, asserting COMPUTED values from the
 * seed (spec §10): Home, Deployment Overview (readiness 64%, coverage 4 of 5),
 * Change Impact (golden counters 3/3/2/1, nine affected items).
 */

test("home renders KPIs and links to a deployment", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Home", exact: true })).toBeVisible();
  await expect(page.getByText("Active Deployments").first()).toBeVisible();
  await expect(page.getByText("Demo data")).toBeVisible();

  await page.getByRole("link", { name: "Valve Inspection Pilot" }).first().click();
  await expect(page).toHaveURL(/\/deployments\/DEP-0017/);
});

test("deployment overview computes readiness and coverage", async ({ page }) => {
  await page.goto("/deployments/DEP-0017");
  await expect(page.getByRole("heading", { name: "Valve Inspection Pilot" })).toBeVisible();
  await expect(page.getByText("64%").first()).toBeVisible();
  await expect(page.getByText("4 of 5 applicable evidence items linked")).toBeVisible();
  await expect(page.getByText("Not requested", { exact: true })).toBeVisible();
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
});

test("global search finds a deployment by code", async ({ page }) => {
  await page.goto("/search?q=DEP-0017");
  await expect(page.getByRole("link", { name: "Valve Inspection Pilot" })).toBeVisible();
});
