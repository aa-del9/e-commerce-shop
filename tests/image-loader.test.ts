import { describe, expect, it } from "vitest";

import shopifyImageLoader, { isShopifyCdnUrl } from "@/lib/media";

describe("Shopify CDN image loader", () => {
  it("asks Shopify's CDN for the requested width", () => {
    expect(
      shopifyImageLoader({
        src: "https://cdn.shopify.com/s/files/1/0001/products/a.jpg",
        width: 1320,
      }),
    ).toBe("https://cdn.shopify.com/s/files/1/0001/products/a.jpg?width=1320");
  });

  it("keeps existing query parameters and replaces an old width", () => {
    expect(
      shopifyImageLoader({
        src: "https://cdn.shopify.com/s/files/a.jpg?v=1700000000&width=100",
        width: 1920,
      }),
    ).toBe("https://cdn.shopify.com/s/files/a.jpg?v=1700000000&width=1920");
  });

  it("caps the width at Shopify's 5760px maximum", () => {
    expect(shopifyImageLoader({ src: "https://cdn.shopify.com/a.png", width: 8000 })).toContain(
      "width=5760",
    );
  });

  it("passes local and third-party images through unchanged", () => {
    expect(shopifyImageLoader({ src: "/og-default.png", width: 1320 })).toBe("/og-default.png");
    expect(shopifyImageLoader({ src: "https://example.com/a.jpg", width: 1320 })).toBe(
      "https://example.com/a.jpg",
    );
    expect(isShopifyCdnUrl("https://cdn.shopify.com.evil.example/a.jpg")).toBe(false);
  });
});
