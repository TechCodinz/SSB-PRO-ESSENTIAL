import { test, expect } from "@playwright/test";

test.describe("Admin smoke flows", () => {
  test.skip(
    process.env.ADMIN_SMOKE !== "true",
    "Set ADMIN_SMOKE=true to execute admin smoke tests against a running instance.",
  );

  test("dashboard renders control center shell", async ({ page }) => {
    await page.goto("/dashboard/admin");
    await expect(page.getByRole("heading", { name: /Admin Control Center/i })).toBeVisible();
  });

  test("plan management entry point is accessible", async ({ page }) => {
    await page.goto("/dashboard/admin/plans");
    await expect(page.getByRole("heading", { name: /Plan Management/i })).toBeVisible();
  });

  test("mobile hamburger stays aligned to the right", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");

    const toggle = page.getByRole("button", { name: /toggle menu/i });
    await expect(toggle).toBeVisible();

    const box = await toggle.boundingBox();
    expect(box).not.toBeNull();
    const rightEdge = (box?.x ?? 0) + (box?.width ?? 0);

    // With a 390px viewport, keep the toggle anchored within the rightmost band.
    expect(rightEdge).toBeGreaterThan(310);
  });
});
