import { brand } from "../../brand/config";
import type { CommerceLocale, ShopConfig } from "./types";

// Base adapter: every value below is derived from brand/config.ts; edit that file, not this one.
const defaultUrl =
  brand.identity.siteUrl ||
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

export const shopConfig = {
  agent: {
    isEnabled: brand.features.agent,
  },
  analytics: {
    shopify: {
      consent: {
        isEnabled: brand.analytics.shopifyConsentBanner,
        mode: "default-banner",
      },
      isEnabled: brand.analytics.shopify,
    },
    speedInsights: {
      isEnabled: brand.analytics.speedInsights,
    },
    vercel: {
      isEnabled: brand.analytics.vercel,
    },
  },
  auth: {
    isEnabled: brand.features.customerAccounts,
  },
  botid: {
    checkLevel: "basic",
    isEnabled: brand.features.botProtection,
  },
  localization: {
    // Validated as two-letter codes at startup; Shopify rejects codes it does not know.
    country: brand.localization.country as CommerceLocale["country"],
    language: brand.localization.language as CommerceLocale["language"],
    locale: brand.localization.locale,
  },
  pdp: {
    bundles: {
      isEnabled: brand.features.bundles,
    },
    buyWithShop: {
      isEnabled: false,
    },
    complementaryProducts: {
      isEnabled: brand.features.relatedProducts,
    },
    quantityPicker: {
      isEnabled: true,
    },
    relatedProducts: {
      isEnabled: brand.features.relatedProducts,
    },
  },
  redirects: {
    shopifyNotFound: {
      isEnabled: false,
    },
  },
  search: {
    isEnabled: brand.features.predictiveSearch,
  },
  shopify: {
    webmcp: {
      isEnabled: false,
    },
  },
  site: {
    description: brand.seo.defaultDescription,
    name: brand.identity.name,
    url: defaultUrl,
  },
} satisfies ShopConfig;

export const isShopifyScriptsEnabled =
  shopConfig.analytics.shopify.isEnabled ||
  shopConfig.analytics.shopify.consent.isEnabled ||
  shopConfig.shopify.webmcp.isEnabled;
