import { expect, test } from "@playwright/test";

test("Component Health V0.2.1 navigates real field evidence without synthetic health claims", async ({ page }) => {
  await page.goto("/platform/component-health");

  await expect(
    page.getByRole("heading", { name: /Component Health · Field Evidence/ })
  ).toBeVisible();
  await expect(page.getByText(/Real field evidence · Unitree G1/)).toBeVisible();

  // Zero unvalidated health alerts in the real-data demo shell.
  await expect(page.getByRole("button", { name: "Attention required: 0" })).toBeVisible();

  await page.getByRole("link", { name: "Phases", exact: true }).click();
  await expect(page).toHaveURL(/component-health\/phases/);

  await page.getByRole("button", { name: "Turning" }).click();
  await expect(page.getByText("×27.10").first()).toBeVisible();

  await page.getByRole("button", { name: "Mixed operation" }).click();
  await expect(page.getByText("×20.25").first()).toBeVisible();

  await page.goto("/platform/component-health/components/joint-00-left-hip-pitch");
  await expect(page.getByRole("heading", { name: /Left hip pitch/ })).toBeVisible();
  await expect(page.getByText("Operational signature across phases")).toBeVisible();
  await expect(page.getByText("9.527 N·m")).toBeVisible();

  await page.goto("/platform/component-health/components/joint-28-right-wrist-yaw");
  await expect(page.getByText("UNRESOLVED").first()).toBeVisible();

  // Old synthetic routes do not present fictional health evidence as observations.
  await page.goto("/platform/component-health/components/CMP-KNEE-L-002");
  await expect(page).toHaveURL(/\/platform\/component-health\/components$/);
});
