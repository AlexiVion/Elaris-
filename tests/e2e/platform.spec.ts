import { test, expect } from "@playwright/test";

test("platform home is the first level and Deployment Control opens as a full product", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByText("Elaris Platform", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Shared infrastructure/ })).toBeVisible();
  await expect(page.getByText("Deployment Control", { exact: true })).toBeVisible();
  await expect(page.getByText("Placement Workspace", { exact: true })).toBeVisible();
  await expect(page.getByText("Underwriting Workspace", { exact: true })).toBeVisible();

  await page.getByRole("link", { name: /Deployment Control/ }).click();
  await expect(page).toHaveURL(/\/platform\/deployment-control$/);
  await expect(page.getByRole("heading", { name: "Home" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Active Deployments" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Deployments", exact: true })).toBeVisible();
});

test("Operational Readiness behaves like a complete buyer workspace", async ({ page }) => {
  await page.goto("/platform/operational-readiness");

  await expect(page.getByRole("heading", { name: "Operational Readiness" })).toBeVisible();
  await expect(page.getByText("Needs attention")).toBeVisible();
  await expect(page.getByText("Deployment portfolio")).toBeVisible();
  await expect(page.getByText("Acceptance snapshot")).toBeVisible();

  await page.getByRole("link", { name: "Deployments", exact: true }).click();
  await expect(page).toHaveURL(/operational-readiness\/deployments$/);
  await expect(page.getByRole("heading", { name: "Deployments" })).toBeVisible();
  await expect(page.getByText("Assembly Line Pilot")).toBeVisible();
  await expect(page.getByText("Warehouse Manipulation Demo")).toBeVisible();

  await page.getByRole("link", { name: /Valve Inspection Pilot/ }).click();
  await expect(page).toHaveURL(/operational-readiness\/deployments\/DEP-0017/);
  await expect(page.getByRole("heading", { name: "Exact configuration" })).toBeVisible();
  await expect(page.getByText("Acceptance gates")).toBeVisible();

  await page.getByRole("link", { name: "Acceptance", exact: true }).click();
  await expect(page).toHaveURL(/operational-readiness\/acceptance/);
  await expect(page.getByRole("heading", { name: "Deployment Acceptance" })).toBeVisible();
  await expect(page.getByText("Procurement / Customer")).toBeVisible();
  await expect(page.getByText("IT / Cyber")).toBeVisible();

  await page.getByRole("button", { name: "Accept with conditions" }).click();
  await page.getByRole("button", { name: "Record demo decision" }).click();
  await expect(page.getByText(/Demo decision recorded.*Accept with conditions/)).toBeVisible();

  await page.getByRole("link", { name: "Review Queue", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Review Queue" })).toBeVisible();
  await expect(page.getByText("Operator training record").first()).toBeVisible();

  await page.getByRole("link", { name: "Changes", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Changes Since Acceptance" })).toBeVisible();
  await expect(page.getByText("BrainCo Revo2")).toBeVisible();

  await page.getByRole("link", { name: "Reports", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Reports & Records" })).toBeVisible();
  await expect(page.getByText("Deployment Due Diligence Pack")).toBeVisible();
  await expect(page.getByText("Acceptance Record")).toBeVisible();
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

test("Placement Workspace matches the full demo application standard", async ({ page }) => {
  test.setTimeout(90_000);

  await page.goto("/platform/placement-workspace");

  await expect(page.getByRole("complementary", { name: "Placement Workspace navigation" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Home", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Attention Required" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Active Submissions" })).toBeVisible();
  await expect(page.getByText("SUB-0042").first()).toBeVisible();

  await page.getByRole("link", { name: "Clients", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Clients" })).toBeVisible();
  await expect(page.getByText("Humandroid", { exact: true }).first()).toBeVisible();

  await page.getByRole("link", { name: "Submissions", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Submissions" })).toBeVisible();
  await page.getByRole("link", { name: "SUB-0042" }).click();
  await expect(page.getByRole("heading", { name: "Humandroid Robotics Programme" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Exact Deployed Configuration" })).toBeVisible();
  await expect(page.getByText("B-0017-01 · C004")).toBeVisible();

  await page.getByRole("link", { name: "Information Requests", exact: true }).click();
  await expect(page).toHaveURL(/\/platform\/placement-workspace\/requests$/);
  await expect(page.getByRole("heading", { name: "Information Requests", exact: true })).toBeVisible({ timeout: 20_000 });
  await expect(page.getByText("Operator training record")).toBeVisible();

  await page.getByRole("link", { name: "Market Questions", exact: true }).click();
  await expect(page).toHaveURL(/\/platform\/placement-workspace\/questions$/);
  await expect(page.getByRole("heading", { name: "Market Questions", exact: true })).toBeVisible({ timeout: 20_000 });
  await expect(page.getByText(/restricted-zone entry/).first()).toBeVisible();
  await page.getByRole("button", { name: "Mark ready for broker review" }).click();
  await expect(page.getByText(/Nothing was sent externally/)).toBeVisible();

  await page.getByRole("link", { name: "Renewals", exact: true }).click();
  await expect(page).toHaveURL(/\/platform\/placement-workspace\/renewals$/);
  await expect(page.getByRole("heading", { name: "Renewals", exact: true })).toBeVisible({ timeout: 20_000 });
  await page.getByRole("link", { name: "REN-0042" }).click();
  await expect(page.getByRole("heading", { name: "Humandroid · Renewal Review" })).toBeVisible();
  await expect(page.getByText("BrainCo Revo2")).toBeVisible();
  await expect(page.getByText("Inspire RH56DFX")).toBeVisible();

  await page.getByRole("link", { name: "Reports", exact: true }).click();
  await expect(page).toHaveURL(/\/platform\/placement-workspace\/reports$/);
  await expect(page.getByRole("heading", { name: "Reports", exact: true })).toBeVisible({ timeout: 20_000 });
  await page.getByText("Technical Submission Pack").click();
  await expect(page.getByRole("heading", { name: "Technical Submission Pack" })).toBeVisible();
  await expect(page.getByText("Humandroid · SUB-0042 · v2 · illustrative broker output")).toBeVisible();
});

test("Underwriting generic prototype still reuses the same DEP-0017 source record", async ({ page }) => {
  await page.goto("/platform/underwriting-workspace");
  await expect(page.getByRole("heading", { name: "Underwriting Workspace" })).toBeVisible();
  await expect(page.getByText(/DEP-0017 · G1 #017/)).toBeVisible();
  await expect(page.getByText("Valve Inspection Pilot")).toBeVisible();
  await expect(page.getByRole("link", { name: "Open source record" })).toHaveAttribute("href", "/platform/deployment-control/deployments/DEP-0017");
});

test("Deployment Control stays full-screen at second depth and returns to platform home", async ({ page }) => {
  await page.goto("/platform/deployment-control/deployments/DEP-0017");
  await expect(page.getByRole("heading", { name: "Valve Inspection Pilot" })).toBeVisible();
  const mainNavigation = page.getByRole("complementary", { name: "Main navigation" });
  await expect(mainNavigation.getByRole("link", { name: "Deployments", exact: true })).toBeVisible();

  const switcher = page.getByRole("link", { name: "Platform", exact: true });
  await expect(switcher).toBeVisible();
  await switcher.click();

  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByText("Elaris Platform", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Shared infrastructure/ })).toBeVisible();
});
