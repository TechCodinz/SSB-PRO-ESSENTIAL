import { test, expect } from "@playwright/test";

test.describe("Landing experience", () => {
  test("home hero renders key messaging", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: /financial fraud detection/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /start free trial/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Pricing/i })).toBeVisible();
  });

  test("primary navigation routes to pricing", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /Pricing/i }).click();
    await expect(page).toHaveURL(/\/pricing/);
    await expect(page.getByRole("heading", { name: /Simple, Transparent Pricing/i })).toBeVisible();
  });

  test("features page is accessible from navigation", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /Features/i }).click();
    await expect(page).toHaveURL(/\/features/);
    await expect(page.getByRole("heading", { name: /Enterprise Features/i })).toBeVisible();
  });
});

test.describe("Responsive navigation", () => {
  test.use({ viewport: { width: 414, height: 896 } });

  test("mobile menu toggles and navigates", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /toggle menu/i }).click();
    const pricingLink = page.getByRole("link", { name: /Pricing/i });
    await expect(pricingLink).toBeVisible();
    await pricingLink.click();
    await expect(page).toHaveURL(/\/pricing/);
  });
});

test.describe("Critical routes", () => {
  const routes = ["/security", "/documentation", "/contact"];

  for (const route of routes) {
    test(`route ${route} renders without error`, async ({ page }) => {
      await page.goto(route);
      await expect(page).toHaveURL(new RegExp(route.replace("/", "\\/") + "$"));
      await expect(page.locator("main")).toBeVisible();
    });
  }
});
