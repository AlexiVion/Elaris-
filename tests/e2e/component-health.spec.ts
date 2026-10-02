import { expect, test } from "@playwright/test";

test("Component Health V0 completes the synthetic reliability loop", async ({ page }) => {
  await page.goto("/platform/component-health");

  await expect(page.getByRole("heading", { name: "Fleet Health" })).toBeVisible();
  await expect(page.getByText(/SYNTHETIC DEMO DATA/)).toBeVisible();
  await expect(page.getByText("HMND-0002").first()).toBeVisible();

  await page.getByRole("link", { name: /HMND-0002 · Unitree G1/ }).click();
  await expect(page).toHaveURL(/component-health\/robots\/HMND-0002/);
  await expect(page.getByText("Left knee actuator").first()).toBeVisible();

  await page.getByRole("link", { name: "Left knee actuator" }).click();
  await expect(page).toHaveURL(/component-health\/components\/CMP-KNEE-L-002/);
  await expect(page.getByRole("heading", { name: "Why Elaris is flagging this" })).toBeVisible();
  await expect(page.getByText("+11.8% vs own synthetic baseline")).toBeVisible();

  await page.getByRole("link", { name: /Open service case SV-0014/ }).click();
  await expect(page).toHaveURL(/component-health\/service\/SV-0014/);
  await expect(page.getByRole("heading", { name: "Synthetic replacement scenario" })).toBeVisible();

  await page.getByRole("link", { name: "Continue to Return-to-Service" }).click();
  await expect(page).toHaveURL(/component-health\/return-to-service\/RTS-0007/);
  await expect(page.getByText(/does not declare the robot safe, certified or compliant/)).toBeVisible();
});
