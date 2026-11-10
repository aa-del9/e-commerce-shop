import { describe, expect, it } from "vitest";

import {
  toAddToCartEvent,
  toGa4Args,
  toInitiateCheckoutEvent,
  toMetaPixelArgs,
} from "@/lib/analytics/marketing";
import { getMarketingConfig } from "@/lib/analytics/marketing/server";

const line = (quantity: number) => ({
  id: "gid://shopify/CartLine/1",
  merchandise: {
    id: "gid://shopify/ProductVariant/42",
    price: { amount: "4999.0", currencyCode: "PKR" },
    product: { id: "gid://shopify/Product/7", title: "Item", vendor: "Store" },
    title: "M",
  },
  quantity,
});

describe("marketing events", () => {
  it("counts only added units for AddToCart and shares the event id", () => {
    const event = toAddToCartEvent({ currentLine: line(3), prevLine: line(1) }, "evt-1");
    expect(event).toMatchObject({ currency: "PKR", name: "AddToCart", value: 9998 });
    expect(toAddToCartEvent({ currentLine: line(1), prevLine: line(2) }, "evt-2")).toBeNull();
    const [, name, params, options] = toMetaPixelArgs(event!);
    expect([name, params.content_ids, options.eventID]).toEqual(["AddToCart", ["42"], "evt-1"]);
    const [, ga4Name, ga4Params] = toGa4Args(event!);
    expect([ga4Name, ga4Params.event_id]).toEqual(["add_to_cart", "evt-1"]);
  });

  it("sums the cart for InitiateCheckout", () => {
    const event = toInitiateCheckoutEvent(
      { id: "c", lines: { nodes: [line(2)] }, updatedAt: "" },
      "evt-3",
    );
    expect(event).toMatchObject({ currency: "PKR", name: "InitiateCheckout", value: 9998 });
  });

  it("loads only in production or when forced", () => {
    const ids = { NEXT_PUBLIC_GA4_MEASUREMENT_ID: "G-TEST", NEXT_PUBLIC_META_PIXEL_ID: "123" };
    expect(getMarketingConfig({ ...ids, VERCEL_ENV: "preview" })).toBeNull();
    expect(getMarketingConfig({ ...ids })).toBeNull();
    expect(getMarketingConfig({ ...ids, VERCEL_ENV: "production" })).toEqual({
      ga4MeasurementId: "G-TEST",
      metaPixelId: "123",
    });
    expect(getMarketingConfig({ ...ids, ANALYTICS_FORCE_ENABLE: "true" })).not.toBeNull();
    expect(getMarketingConfig({ VERCEL_ENV: "production" })).toBeNull();
  });
});
