import { z } from "zod";

const E164 = /^\+[1-9]\d{7,14}$/;
// Pakistani mobile numbers are +92 3XX XXXXXXX: country code, a leading 3, then nine digits.
const PK_MOBILE = /^\+923\d{9}$/;
const HEX_COLOR = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

const internalOrAbsoluteUrl = z
  .string()
  .refine((value) => value.startsWith("/") || /^https?:\/\//.test(value), {
    message: 'Use a site path like "/collections/all" or a full URL starting with https://',
  });

const linkSchema = z.strictObject({
  title: z.string().min(1, "Give the link a label"),
  url: internalOrAbsoluteUrl,
});

const navigationItemSchema = z.strictObject({
  items: z.array(linkSchema).optional(),
  title: z.string().min(1, "Give the menu item a label"),
  url: internalOrAbsoluteUrl,
});

const footerGroupSchema = z.strictObject({
  items: z.array(linkSchema).optional(),
  title: z.string().min(1, "Give the footer column a heading"),
  url: internalOrAbsoluteUrl.optional(),
});

const socialUrl = z.url("Use the full profile URL, starting with https://").optional();

const disabledByDesign = (skill: string) =>
  z.literal(false, {
    error: `This stays false in brand/config.ts. Turning it on is a developer task through the ${skill} skill.`,
  });

export const brandSchema = z
  .strictObject({
    analytics: z.strictObject({
      shopify: z.boolean(),
      shopifyConsentBanner: z.boolean(),
      speedInsights: z.boolean(),
      vercel: z.boolean(),
    }),
    commerceCopy: z.strictObject({
      codNotice: z.string(),
      deliveryEstimate: z.string(),
      freeDeliveryMessage: z.string(),
      returnsSummary: z.string(),
    }),
    features: z.strictObject({
      agent: z.boolean(),
      announcementBar: z.boolean(),
      badges: z.boolean(),
      botProtection: z.boolean(),
      bundles: z.boolean(),
      codNotice: z.boolean(),
      customerAccounts: z.boolean(),
      deliveryNotice: z.boolean(),
      faqPage: z.boolean(),
      i18n: disabledByDesign("enable-i18n"),
      markets: disabledByDesign("enable-shopify-markets"),
      modelInfo: z.boolean(),
      predictiveSearch: z.boolean(),
      preorders: z.boolean(),
      productDetails: z.boolean(),
      relatedProducts: z.boolean(),
      sizeChart: z.boolean(),
      whatsappButton: z.boolean(),
    }),
    identity: z.strictObject({
      address: z.strictObject({
        city: z.string(),
        country: z.string(),
        line1: z.string(),
        line2: z.string().optional(),
        postalCode: z.string().optional(),
        region: z.string().optional(),
      }),
      legalName: z.string().min(1, "Enter the registered business name"),
      name: z.string().min(1, "Enter the store name shoppers see"),
      siteUrl: z.url("Use the full site address, like https://www.example.pk").optional(),
      social: z.strictObject({
        facebook: socialUrl,
        instagram: socialUrl,
        linkedin: socialUrl,
        pinterest: socialUrl,
        tiktok: socialUrl,
        x: socialUrl,
        youtube: socialUrl,
      }),
      supportEmail: z.email("Use a real email address, like help@example.pk"),
      supportPhone: z
        .string()
        .regex(E164, "Write the phone number in international format, like +924212345678"),
      tagline: z.string(),
      whatsappNumber: z
        .string()
        .regex(E164, "Write the WhatsApp number in international format, like +923001234567"),
    }),
    localization: z.strictObject({
      country: z.string().length(2, "Use a two-letter country code, like PK"),
      currency: z.string().length(3, "Use a three-letter currency code, like PKR"),
      currencyDisplay: z.enum(["code", "symbol"], {
        error: 'Use "symbol" (Rs 4,999) or "code" (PKR 4,999)',
      }),
      language: z.string().length(2, "Use a two-letter language code, like EN"),
      locale: z.string().min(2, 'Use a locale like "en-PK"'),
      timeZone: z.string().min(1, 'Use a time zone like "Asia/Karachi"'),
    }),
    navigation: z.strictObject({
      footer: z.array(footerGroupSchema).max(5, "The footer shows at most 5 columns"),
      main: z.array(navigationItemSchema),
    }),
    seo: z.strictObject({
      defaultDescription: z.string().min(1, "Write a one-sentence description of the store"),
      defaultOgImage: z
        .string()
        .startsWith("/", 'Use a path inside public/, like "/og-default.png"'),
      themeColor: z.string().regex(HEX_COLOR, 'Use a hex color, like "#ffffff"'),
      titleTemplate: z.string().includes("%s", {
        message: 'Keep "%s" in the template; it is replaced by the page title',
      }),
      twitterHandle: z.string().startsWith("@", 'Start the handle with "@"').optional(),
    }),
  })
  .superRefine((brand, context) => {
    if (brand.localization.country === "PK" && !PK_MOBILE.test(brand.identity.whatsappNumber)) {
      context.addIssue({
        code: "custom",
        message:
          "Use a Pakistani mobile number in international format: +92, then the number without its leading 0, like +923001234567",
        path: ["identity", "whatsappNumber"],
      });
    }
    try {
      new Intl.DateTimeFormat(brand.localization.locale, {
        timeZone: brand.localization.timeZone,
      }).resolvedOptions();
    } catch {
      context.addIssue({
        code: "custom",
        message: 'Use a valid locale and IANA time zone, like "en-PK" and "Asia/Karachi"',
        path: ["localization", "timeZone"],
      });
    }
  });

export type BrandConfigInput = z.input<typeof brandSchema>;
export type BrandConfig = z.output<typeof brandSchema>;

export class BrandConfigError extends Error {
  readonly issues: string[];

  constructor(issues: string[]) {
    super(
      [
        "brand/config.ts has a problem:",
        ...issues.map((issue) => `  • ${issue}`),
        "Fix the field above in brand/config.ts (see docs/05-brand-config.md), then restart.",
      ].join("\n"),
    );
    this.issues = issues;
    this.name = "BrandConfigError";
  }
}

export function validateBrand(input: unknown): BrandConfig {
  const result = brandSchema.safeParse(input);
  if (result.success) return result.data;
  throw new BrandConfigError(
    result.error.issues.map((issue) => {
      const path = issue.path.map(String).join(".") || "(top level)";
      return `${path}: ${issue.message}`;
    }),
  );
}
