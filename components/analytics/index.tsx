import type { ShopifyScriptsI18n, ShopifyScriptsShop } from "@shopify/hydrogen";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

import { getMarketingConfig } from "@/lib/analytics/marketing/server";
import { isShopifyScriptsEnabled, shopConfig } from "@/lib/config";

import { MarketingDestinations } from "./marketing-client";
import { ShopifyScriptsTracker } from "./shopify-client";

export function AnalyticsComponents() {
  // Base: Meta Pixel and GA4 ride Hydrogen's analytics bus, so they need Shopify's scripts mounted.
  const marketing = getMarketingConfig();
  const i18n: ShopifyScriptsI18n = {
    country: shopConfig.localization.country,
    language: shopConfig.localization.language,
  };
  const shop: ShopifyScriptsShop = {
    myshopifyDomain: process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN as string,
    shopId: process.env.NEXT_PUBLIC_SHOPIFY_SHOP_ID as string,
    storefrontId: process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ID ?? "",
  };

  return (
    <>
      {shopConfig.analytics.vercel.isEnabled && <Analytics />}
      {shopConfig.analytics.speedInsights.isEnabled && <SpeedInsights />}
      {(isShopifyScriptsEnabled || marketing) && <ShopifyScriptsTracker i18n={i18n} shop={shop} />}
      {marketing && <MarketingDestinations config={marketing} />}
    </>
  );
}
