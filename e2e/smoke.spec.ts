import { expect, type Page, test } from "@playwright/test";

test.skip(!process.env.BASE_URL, "Set BASE_URL to run the storefront smoke tests.");

// E2E_PRODUCT_PATH (for example /products/some-handle) pins the product; otherwise the first listed one is used.
async function openFirstProduct(page: Page) {
  if (process.env.E2E_PRODUCT_PATH) {
    await page.goto(process.env.E2E_PRODUCT_PATH);
    return;
  }
  await page.goto("/collections/all");
  const productLink = page.locator('main a[href*="/products/"]').first();
  await expect(productLink).toBeVisible();
  await productLink.click();
  await page.waitForURL(/\/products\//);
}

test("home page renders", async ({ page }) => {
  const response = await page.goto("/");
  expect(response?.status()).toBe(200);
  await expect(page.locator("main#main-content")).toBeVisible();
  await expect(page.locator("h1")).toHaveCount(1);
});

test("a product page renders", async ({ page }) => {
  await openFirstProduct(page);
  await expect(page.locator("h1")).toBeVisible();
  await expect(
    page.getByRole("button", { name: /add to cart|preorder|sold out/i }).first(),
  ).toBeVisible();
});

test("add to cart, then checkout produces a Shopify checkout URL", async ({ page }) => {
  await openFirstProduct(page);
  const addToCart = page.getByRole("button", { name: /add to cart/i }).first();
  await expect(addToCart).toBeEnabled({ timeout: 15_000 });
  const cartWrite = page.waitForResponse(
    (response) => response.url().includes("/api/cart") && response.request().method() === "POST",
  );
  await addToCart.click();
  expect((await cartWrite).ok()).toBe(true);

  await page.goto("/cart");
  const checkout = page.getByRole("button", { name: /checkout/i });
  await expect(checkout).toBeEnabled({ timeout: 15_000 });

  const base = new URL(process.env.BASE_URL ?? "http://localhost");
  await checkout.click();
  await page.waitForURL((url) => url.host !== base.host, { timeout: 30_000 });
  // Shopify checkout URLs look like /cart/c/…, /checkouts/… or /checkout on mock.shop.
  expect(page.url()).toMatch(/\/(cart\/c\/|checkouts?\b)/);
});
