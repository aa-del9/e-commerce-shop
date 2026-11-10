import { defineBrand } from "../lib/brand";

// The one file a store edits to set its identity, features and copy.
// Every field is explained in docs/05-brand-config.md. `pnpm verify` checks it.
export const brand = defineBrand({
  analytics: {
    // Shopify's own storefront analytics (Shopify admin → Analytics). Needs the Headless channel.
    shopify: false,
    // Shopify's cookie banner. Usually off for Pakistan-only stores.
    shopifyConsentBanner: false,
    speedInsights: false,
    vercel: false,
  },
  commerceCopy: {
    codNotice: "Cash on delivery available across Pakistan.",
    deliveryEstimate: "Delivered in 3–5 working days.",
    freeDeliveryMessage: "Free delivery on qualifying orders.",
    returnsSummary: "Easy exchanges within 7 days of delivery.",
  },
  features: {
    agent: false,
    announcementBar: true,
    badges: true,
    botProtection: false,
    bundles: false,
    codNotice: true,
    customerAccounts: false,
    deliveryNotice: true,
    faqPage: true,
    i18n: false,
    markets: false,
    modelInfo: true,
    predictiveSearch: true,
    preorders: true,
    productDetails: true,
    relatedProducts: true,
    sizeChart: true,
    whatsappButton: true,
  },
  identity: {
    address: {
      city: "Lahore",
      country: "Pakistan",
      line1: "Street address",
    },
    legalName: "Store Name (Private) Limited",
    name: "Store Name",
    social: {},
    supportEmail: "support@example.com",
    supportPhone: "+924200000000",
    tagline: "A short line about the store.",
    whatsappNumber: "+923000000000",
  },
  localization: {
    country: "PK",
    currency: "PKR",
    currencyDisplay: "symbol",
    language: "EN",
    locale: "en-PK",
    timeZone: "Asia/Karachi",
  },
  navigation: {
    footer: [
      {
        items: [{ title: "All products", url: "/collections/all" }],
        title: "Shop",
      },
      {
        items: [
          { title: "FAQ", url: "/faq" },
          { title: "Contact", url: "/contact" },
        ],
        title: "Help",
      },
    ],
    main: [{ title: "Shop", url: "/collections/all" }],
  },
  seo: {
    defaultDescription: "Shop the latest products online with delivery across Pakistan.",
    defaultOgImage: "/og-default.png",
    themeColor: "#ffffff",
    titleTemplate: "%s | Store Name",
  },
});
