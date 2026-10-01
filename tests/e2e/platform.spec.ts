import { test, expect } from "@playwright/test";

test("platform home exposes actor-specific products without replacing Deployment Control", async ({ page }) => {
  await page.goto("/platform");

  await expect(page.getByRole("heading", { name: /Una infraestructura compartida/ })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Deployment Control", exact: true })).toBeVisible();
  await expect(page.getByText("Operational Readiness", { exact: true })).toBeVisible();
  await expect(page.getByText("Safety Change Control", { exact: true })).toBeVisible();
  await expect(page.getByText("Broker Workspace", { exact: true })).toBeVisible();
  await expect(page.getByText("Underwriting Workspace", { exact: true })).toBeVisible();
  await expect(page.getByText("Incident Reconstruction", { exact: true })).toBeVisible();

  await page.getByRole("link", { name: /Deployment Control/ }).last().click();
  await expect(page).toHaveURL(/\/platform\/deployment-control/);
  await expect(page.getByText("Frozen reference boundary")).toBeVisible();
});

test("different actor products reuse the same DEP-0017 source record", async ({ page }) => {
  for (const [slug, heading] of [
    ["operational-readiness", "Operational Readiness"],
    ["safety-change-control", "Safety Change Control"],
    ["broker-workspace", "Broker Workspace"],
    ["underwriting-workspace", "Underwriting Workspace"],
    ["incident-reconstruction", "Incident Reconstruction"],
  ]) {
    await page.goto(`/platform/${slug}`);
    await expect(page.getByRole("heading", { name: heading })).toBeVisible();
    await expect(page.getByText(/DEP-0017 · G1 #017/)).toBeVisible();
    await expect(page.getByText("Valve Inspection Pilot")).toBeVisible();
    await expect(page.getByRole("link", { name: "Open source record" })).toHaveAttribute("href", "/deployments/DEP-0017");
  }
});


test("Deployment Control exposes a platform switcher without changing its product routes", async ({ page }) => {
  await page.goto("/deployments/DEP-0017");
  const switcher = page.getByRole("link", { name: "Platform", exact: true });
  await expect(switcher).toBeVisible();
  await switcher.click();
  await expect(page).toHaveURL(/\/platform$/);
  await expect(page.getByRole("heading", { name: /Una infraestructura compartida/ })).toBeVisible();
});
