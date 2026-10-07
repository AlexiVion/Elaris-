import { expect, test } from "@playwright/test";

test("Component Health V0.4.2 uses private V0.3 artifacts, persists review and verifies technical semantics without health claims", async ({ page }) => {
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

  await page.goto("/platform/component-health/review");
  await expect(
    page.getByRole("heading", { name: "Review & Next Actions" })
  ).toBeVisible();
  await expect(page.getByText("Qué tenés que decidir acá")).toBeVisible();
  await expect(page.getByText(/No tenés que decidir si el robot está sano/)).toBeVisible();
  await expect(page.getByText(/Data export/i).first()).toBeVisible();
  await expect(page.getByText(/NOT APPROVED/i).first()).toBeVisible();

  // Persist the overall review workflow through the real local API/SQLite path.
  const reviewNote =
    "E2E persistence check: technical review started; no robot-health conclusion.";
  const reviewSelect = page.getByRole("combobox").first();
  await reviewSelect.selectOption("IN_REVIEW");
  await page.locator("textarea").first().fill(reviewNote);
  await page.getByRole("button", { name: "Guardar" }).first().click();
  await expect(page.getByRole("button", { name: "Guardado" }).first()).toBeVisible();

  // Persist a concrete unresolved-evidence action without turning it into a failure claim.
  const unresolvedTitle = page.getByText("UNRESOLVED COMPONENT SLOT", {
    exact: true,
  });
  await expect(unresolvedTitle).toBeVisible();
  const unresolvedCard = unresolvedTitle.locator(
    "xpath=ancestor::div[contains(@class,'rounded-xl')][1]"
  );
  const unresolvedNote =
    "OEM slot mapping / physical telemetry remains unresolved. Technical verification required before stronger interpretation.";
  await unresolvedCard.getByRole("combobox").selectOption("NEEDS_FOLLOWUP");
  await unresolvedCard.locator("textarea").fill(unresolvedNote);
  await unresolvedCard.getByRole("button", { name: "Guardar" }).click();
  await expect(
    unresolvedCard.getByRole("button", { name: "Guardado" })
  ).toBeVisible();

  // Full refresh proves the review state is persisted, not just held in React state.
  await page.reload();
  await expect(page.getByRole("combobox").first()).toHaveValue("IN_REVIEW");
  await expect(page.locator("textarea").first()).toHaveValue(reviewNote);

  const persistedUnresolvedTitle = page.getByText(
    "UNRESOLVED COMPONENT SLOT",
    { exact: true }
  );
  const persistedUnresolvedCard = persistedUnresolvedTitle.locator(
    "xpath=ancestor::div[contains(@class,'rounded-xl')][1]"
  );
  await expect(persistedUnresolvedCard.getByRole("combobox")).toHaveValue(
    "NEEDS_FOLLOWUP"
  );
  await expect(persistedUnresolvedCard.locator("textarea")).toHaveValue(
    unresolvedNote
  );
  await expect(page.getByText(/NOT APPROVED/i).first()).toBeVisible();

  // V0.4.2 confirms public OEM mappings while preserving unresolved physical availability.
  await page.goto("/platform/component-health/semantics");
  await expect(
    page.getByRole("heading", { name: "Technical Semantics Verification" })
  ).toBeVisible();
  await expect(page.getByText("G1_RIGHT_WRIST_YAW_MAPPING")).toBeVisible();
  await expect(
    page.getByText("G1_RIGHT_WRIST_YAW_PHYSICAL_AVAILABILITY")
  ).toBeVisible();
  await expect(page.getByText("CONFIRMED SUPPORTED").first()).toBeVisible();
  await expect(page.getByText("STILL UNRESOLVED").first()).toBeVisible();
  await expect(page.getByText(/NO_HEALTH_OR_SAFETY_CONCLUSION/)).toBeVisible();
  await expect(page.getByText(/23-DOF \/ 29-DOF/)).toBeVisible();

  await page.goto("/platform/component-health/reports/draft");
  await expect(
    page.getByRole("heading", { name: "Internal Draft Report" })
  ).toBeVisible();
  await expect(page.getByText("DRAFT · NOT APPROVED FOR EXPORT")).toBeVisible();

  // Old synthetic component stories remain inaccessible as real evidence.
  await page.goto("/platform/component-health/components/CMP-KNEE-L-002");
  await expect(page).toHaveURL(/\/platform\/component-health\/components$/);
});
