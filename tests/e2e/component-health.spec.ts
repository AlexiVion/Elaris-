import { expect, test } from "@playwright/test";

test("Component Health V0.4 uses private V0.3 artifacts without exposing synthetic health claims", async ({ page }) => {
  await page.goto("/platform/component-health");

  await expect(
    page.getByRole("button", { name: "Attention required: 0" })
  ).toBeVisible();

  const emptyState = page.getByText("NO PRIVATE V0.3 ARTIFACT");
  if (await emptyState.isVisible().catch(() => false)) {
    await expect(page.getByText("Private evidence source required")).toBeVisible();
    await expect(
      page.getByText(/refuses report paths inside the Git working tree/i)
    ).toBeVisible();
    return;
  }

  await expect(
    page.getByRole("heading", { name: "Component Health · Audit Workbench" })
  ).toBeVisible();
  await expect(page.getByText("REAL V0.3 ARTIFACT · V0.4")).toBeVisible();
  await expect(page.getByText(/export NOT APPROVED/i).first()).toBeVisible();

  await page.getByRole("link", { name: "Sessions", exact: true }).click();
  await expect(page).toHaveURL(/component-health\/sessions/);
  await expect(page.getByText("PRIVATE ARTIFACT CATALOGUE")).toBeVisible();
  await expect(page.getByText(/CH-A03-/).first()).toBeVisible();

  await page.getByRole("link", { name: "Components", exact: true }).click();
  await expect(page).toHaveURL(/component-health\/components$/);
  await expect(page.getByText(/29 Unitree G1 component slots/)).toBeVisible();

  await page.goto(
    "/platform/component-health/components/joint-00-left-hip-pitch"
  );
  await expect(
    page.getByRole("heading", { name: /Left hip pitch/ })
  ).toBeVisible();
  await expect(page.getByText("Operational evidence across phases")).toBeVisible();
  await expect(page.getByText(/Same-session idle torque absP95/).first()).toBeVisible();

  await page.goto("/platform/component-health/phases");
  await expect(page.getByRole("heading", { name: "Phase Explorer" })).toBeVisible();
  await page.getByRole("button", { name: "Turning" }).click();
  await expect(page.getByText("Cross-phase torque matrix")).toBeVisible();

  await page.goto("/platform/component-health/quality");
  await expect(page.getByRole("heading", { name: "Quality Review" })).toBeVisible();
  await expect(page.getByText(/QA RECORDS/)).toBeVisible();
  await expect(page.getByText(/not component failures/i)).toBeVisible();

  await page.goto("/platform/component-health/reports/draft");
  await expect(
    page.getByRole("heading", { name: "Internal Draft Report" })
  ).toBeVisible();
  await expect(page.getByText("DRAFT · NOT APPROVED FOR EXPORT")).toBeVisible();

  // Old synthetic component stories remain inaccessible as real evidence.
  await page.goto("/platform/component-health/components/CMP-KNEE-L-002");
  await expect(page).toHaveURL(/\/platform\/component-health\/components$/);
});
