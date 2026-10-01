import { test, expect } from "@playwright/test";

test("platform home exposes the product portfolio without replacing Deployment Control", async ({ page }) => {
  await page.goto("/platform");

  await expect(page.getByRole("heading", { name: /Una infraestructura compartida/ })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Deployment Control", exact: true })).toBeVisible();
  await expect(page.getByText("Operational Readiness", { exact: true })).toBeVisible();
  await expect(page.getByText("Safety Change Control", { exact: true })).toBeVisible();
  await expect(page.getByText("Evidence Review", { exact: true })).toBeVisible();
  await expect(page.getByText("Broker Workspace", { exact: true })).toBeVisible();
  await expect(page.getByText("Underwriting Workspace", { exact: true })).toBeVisible();
  await expect(page.getByText("Incident Reconstruction", { exact: true })).toBeVisible();

  await page.getByRole("link", { name: /Deployment Control/ }).last().click();
  await expect(page).toHaveURL(/\/platform\/deployment-control/);
  await expect(page.getByText("Frozen reference boundary")).toBeVisible();
});

test("Operational Readiness behaves like an actor-specific app", async ({ page }) => {
  await page.goto("/platform/operational-readiness");

  await expect(page.getByRole("heading", { name: "Operational Readiness" })).toBeVisible();
  await expect(page.getByText("Buyer work queue")).toBeVisible();
  await expect(page.getByText("OPT-005 · Customer requirement")).toBeVisible();

  await page.getByRole("link", { name: /Open deployment review/ }).click();
  await expect(page).toHaveURL(/operational-readiness\/deployments\/DEP-0017/);
  await expect(page.getByText("DEP-0017", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Exact configuration" })).toBeVisible();

  await page.getByRole("link", { name: /Open acceptance gates/ }).click();
  await expect(page).toHaveURL(/operational-readiness\/acceptance/);
  await expect(page.getByRole("heading", { name: "Acceptance Gates" })).toBeVisible();
  await expect(page.getByText("Procurement / Customer")).toBeVisible();
  await expect(page.getByText("IT / Cyber")).toBeVisible();
});

test("Safety Change Control presents CHG-0005 as a safety review, not a generic dashboard", async ({ page }) => {
  await page.goto("/platform/safety-change-control");

  await expect(page.getByRole("heading", { name: "Safety Change Control" })).toBeVisible();
  await expect(page.getByText("Hazards & controls — prototype view")).toBeVisible();

  await page.goto("/platform/safety-change-control/changes/CHG-0005");
  await expect(page.getByRole("heading", { name: "CHG-0005" })).toBeVisible();
  await expect(page.getByText("Potentially impacted — human review required")).toBeVisible();
  await expect(page.getByText("BrainCo Revo2")).toBeVisible();
  await expect(page.getByText("Inspire RH56DFX")).toBeVisible();

  await page.getByRole("link", { name: /Open re-test queue/ }).click();
  await expect(page.getByRole("heading", { name: "Re-test & Review Queue" })).toBeVisible();
  await expect(page.getByText("Integration test (INT-042)")).toBeVisible();
});

test("Evidence Review exposes assessment, evidence matrix and prototype findings", async ({ page }) => {
  await page.goto("/platform/evidence-review");

  await expect(page.getByRole("heading", { name: "Assessment Queue" })).toBeVisible();
  await expect(page.getByText("ASMT-0017 · Valve Inspection Pilot")).toBeVisible();

  await page.getByRole("link", { name: /Open assessment/ }).click();
  await expect(page).toHaveURL(/evidence-review\/assessments\/ASMT-0017/);
  await expect(page.getByText("Evidence review matrix")).toBeVisible();
  await expect(page.getByText("SAF-017 · Safety assessment")).toBeVisible();

  await page.goto("/platform/evidence-review/findings");
  await expect(page.getByRole("heading", { name: "Open Findings" })).toBeVisible();
  await expect(page.getByText(/Operator training record/)).toBeVisible();
  await expect(page.getByText(/Site acceptance test/)).toBeVisible();
});

test("Incident Reconstruction reconstructs baseline, timeline and evidence gaps", async ({ page }) => {
  await page.goto("/platform/incident-reconstruction");

  await expect(page.getByRole("heading", { name: "Incident Reconstruction" })).toBeVisible();
  await expect(page.getByText(/INC-2026-001/)).toBeVisible();
  await expect(page.getByText(/B-0017-01 · C004/)).toBeVisible();

  await page.getByRole("link", { name: /INC-2026-001/ }).click();
  await expect(page).toHaveURL(/incident-reconstruction\/incidents\/INC-2026-001/);
  await expect(page.getByText("Configuration at time is reconstructable")).toBeVisible();
  await expect(page.getByText("Person detected in restricted zone")).toBeVisible();

  await page.getByRole("link", { name: /Open evidence room/ }).click();
  await expect(page.getByRole("heading", { name: "Evidence Room · INC-2026-001" })).toBeVisible();
  await expect(page.getByText("Robot log bundle")).toBeVisible();
  await expect(page.getByText("Photos / video")).toBeVisible();
});

test("generic Wave B prototypes still reuse the same DEP-0017 source record", async ({ page }) => {
  for (const [slug, heading] of [
    ["broker-workspace", "Broker Workspace"],
    ["underwriting-workspace", "Underwriting Workspace"],
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
