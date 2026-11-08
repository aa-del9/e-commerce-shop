import { afterEach, describe, expect, it, vi } from "vitest";

// Intl separates the currency and amount with a non-breaking space (U+00A0).
describe("PKR price formatting", () => {
  afterEach(() => {
    vi.resetModules();
    vi.doUnmock("@/brand/config");
  });

  it("shows Rs with en-PK grouping and no decimals by default", async () => {
    const { formatPrice } = await import("@/lib/money");
    expect(formatPrice({ amount: "4999.0", currencyCode: "PKR" })).toBe("Rs\u00a04,999");
    expect(formatPrice({ amount: "124999.00", currencyCode: "PKR" })).toBe("Rs\u00a0124,999");
  });

  it("shows the PKR code when currencyDisplay is code", async () => {
    const actual = await vi.importActual<typeof import("@/brand/config")>("@/brand/config");
    vi.doMock("@/brand/config", () => ({
      brand: {
        ...actual.brand,
        localization: { ...actual.brand.localization, currencyDisplay: "code" },
      },
    }));
    const { formatPrice } = await import("@/lib/money");
    expect(formatPrice({ amount: "4999", currencyCode: "PKR" })).toBe("PKR\u00a04,999");
  });

  it("keeps Shopify's currency when the store sells in another currency", async () => {
    const { formatPrice } = await import("@/lib/money");
    expect(formatPrice({ amount: "40.00", currencyCode: "USD" })).toBe("US$40.00");
  });
});
