import { z } from "zod";

// Every environment variable the storefront and its scripts read. Drives the dev setup page,
// the production build check, `pnpm env:check`, and docs/04-environment-variables.md.
// Imported by proxy.ts, next.config.ts and Node scripts, so it must only import zod.

export const PLACEHOLDER = "__REPLACE_ME__";

export type EnvGroup =
  | "Site"
  | "Shopify Storefront"
  | "Shopify webhooks & revalidation"
  | "Customer accounts"
  | "Shopify Admin (setup script only)"
  | "Analytics"
  | "Agent & bot protection (dormant)"
  | "Debugging";

export type VercelEnvironment = "Development" | "Preview" | "Production";

export interface EnvVarSpec {
  docs?: string;
  group: EnvGroup;
  name: string;
  purpose: string;
  // "always": the storefront cannot start without it. "customerAccounts": required when that feature is on.
  required: "always" | "customerAccounts" | false;
  schema?: z.ZodType<string>;
  secret: boolean;
  vercel: VercelEnvironment[];
  where: string;
}

const ALL: VercelEnvironment[] = ["Production", "Preview", "Development"];
const LOCAL_ONLY: VercelEnvironment[] = [];

const hostname = z
  .string()
  .regex(
    /^[a-z0-9.-]+$/i,
    "Use only the host name, like your-store.myshopify.com (no https://, no slash)",
  );

export const ENV_VARS: EnvVarSpec[] = [
  {
    docs: "https://vercel.com/docs/domains",
    group: "Site",
    name: "NEXT_PUBLIC_SITE_URL",
    purpose: "Public address of the store, used for canonical links, sitemap and webhook URLs.",
    required: false,
    schema: z.url("Use the full address, like https://www.example.pk"),
    secret: false,
    vercel: ["Production"],
    where:
      "Your domain in Vercel → Project → Domains. Leave empty to use the Vercel production domain.",
  },
  {
    docs: "https://shopify.dev/docs/storefronts/headless/building-with-the-storefront-api/getting-started",
    group: "Shopify Storefront",
    name: "NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN",
    purpose: "Which Shopify store the site reads products, cart and checkout from.",
    required: "always",
    schema: hostname,
    secret: false,
    vercel: ALL,
    where: "Shopify admin → Settings → Domains: the your-store.myshopify.com address.",
  },
  {
    docs: "https://shopify.dev/docs/storefronts/headless/building-with-the-storefront-api/manage-headless-channels",
    group: "Shopify Storefront",
    name: "NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN",
    purpose: "Public token that lets the site read the catalog and manage carts.",
    required: "always",
    secret: false,
    vercel: ALL,
    where:
      "Shopify admin → Sales channels → Headless → your storefront → Storefront API → Public access token.",
  },
  {
    docs: "https://shopify.dev/docs/storefronts/headless/building-with-the-storefront-api/getting-started",
    group: "Shopify Storefront",
    name: "NEXT_PUBLIC_SHOPIFY_SHOP_ID",
    purpose: "Numeric shop ID used by Shopify analytics and checkout.",
    required: "always",
    schema: z.string().regex(/^\d+$/, "Use only the digits, like 123456789"),
    secret: false,
    vercel: ALL,
    where:
      "Set the store domain and token first, then run `pnpm env:check`: it looks the number up and prints it.",
  },
  {
    group: "Shopify Storefront",
    name: "NEXT_PUBLIC_SHOPIFY_STOREFRONT_ID",
    purpose: "Headless storefront ID for analytics attribution.",
    required: false,
    schema: z.string().regex(/^\d+$/, "Use only the digits"),
    secret: false,
    vercel: ALL,
    where: "Shopify admin → Sales channels → Headless → your storefront (number in the URL).",
  },
  {
    group: "Shopify Storefront",
    name: "SHOPIFY_API_VERSION",
    purpose: "Overrides the Storefront API version. Leave empty.",
    required: false,
    secret: false,
    vercel: ALL,
    where: "Only set when a developer asks you to.",
  },
  {
    docs: "https://shopify.dev/docs/apps/build/webhooks/subscribe/https",
    group: "Shopify webhooks & revalidation",
    name: "SHOPIFY_WEBHOOK_SECRET",
    purpose: "Lets the site trust Shopify's change notifications, so edits show up within seconds.",
    required: false,
    secret: true,
    vercel: ["Production", "Preview"],
    where:
      "The client secret of the app that ran `pnpm shopify:setup` (Dev Dashboard → app → Settings).",
  },
  {
    group: "Shopify webhooks & revalidation",
    name: "REVALIDATE_SECRET",
    purpose:
      "Password for refreshing content Shopify sends no notification for (menus, pages, policies).",
    required: false,
    secret: true,
    vercel: ["Production", "Preview"],
    where: "Make one up: a long random string (for example from a password manager).",
  },
  {
    docs: "https://shopify.dev/docs/storefronts/headless/building-with-the-customer-account-api/getting-started",
    group: "Customer accounts",
    name: "CUSTOMER_ACCOUNT_SESSION_SECRET",
    purpose: "Encrypts customer login sessions. Only needed when customer accounts are on.",
    required: "customerAccounts",
    secret: true,
    vercel: ALL,
    where: "Make one up: a long random string. It is not a Shopify value.",
  },
  {
    docs: "https://shopify.dev/docs/storefronts/headless/building-with-the-customer-account-api/getting-started",
    group: "Customer accounts",
    name: "SHOPIFY_CUSTOMER_ACCOUNT_API_CLIENT_ID",
    purpose: "Identifies the store to Shopify's customer login.",
    required: "customerAccounts",
    secret: true,
    vercel: ALL,
    where: "Shopify admin → Sales channels → Headless → your storefront → Customer Account API.",
  },
  {
    docs: "https://shopify.dev/docs/storefronts/headless/building-with-the-customer-account-api/getting-started",
    group: "Customer accounts",
    name: "SHOPIFY_CUSTOMER_ACCOUNT_API_CLIENT_SECRET",
    purpose: "Secret for Shopify's customer login.",
    required: "customerAccounts",
    secret: true,
    vercel: ALL,
    where: "Same screen as the client ID.",
  },
  {
    group: "Shopify Admin (setup script only)",
    name: "SHOPIFY_STORE_DOMAIN",
    purpose: "Store the setup script changes. Defaults to NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN.",
    required: false,
    schema: hostname,
    secret: false,
    vercel: LOCAL_ONLY,
    where: "your-store.myshopify.com. Only in .env.local on the computer that runs setup.",
  },
  {
    docs: "https://shopify.dev/docs/apps/build/authentication-authorization/client-credentials-grant",
    group: "Shopify Admin (setup script only)",
    name: "SHOPIFY_ADMIN_API_ACCESS_TOKEN",
    purpose: "Admin API token for `pnpm shopify:setup`. Never needed by the live site.",
    required: false,
    secret: true,
    vercel: LOCAL_ONLY,
    where:
      "See docs/03-setting-up-a-new-store.md → Admin API access. Or use the client ID and secret below.",
  },
  {
    docs: "https://shopify.dev/docs/apps/build/authentication-authorization/client-credentials-grant",
    group: "Shopify Admin (setup script only)",
    name: "SHOPIFY_ADMIN_CLIENT_ID",
    purpose: "Dev Dashboard app client ID; setup exchanges it for a 24-hour Admin token.",
    required: false,
    secret: false,
    vercel: LOCAL_ONLY,
    where: "Shopify Dev Dashboard → your app → Settings.",
  },
  {
    docs: "https://shopify.dev/docs/apps/build/authentication-authorization/client-credentials-grant",
    group: "Shopify Admin (setup script only)",
    name: "SHOPIFY_ADMIN_CLIENT_SECRET",
    purpose: "Dev Dashboard app client secret (pairs with the client ID).",
    required: false,
    secret: true,
    vercel: LOCAL_ONLY,
    where: "Shopify Dev Dashboard → your app → Settings.",
  },
  {
    group: "Shopify Admin (setup script only)",
    name: "SHOPIFY_ADMIN_API_VERSION",
    purpose: "Admin API version the setup script uses (default 2026-10).",
    required: false,
    secret: false,
    vercel: LOCAL_ONLY,
    where: "Leave empty unless a developer asks you to change it.",
  },
  {
    docs: "https://www.facebook.com/business/help/952192354843755",
    group: "Analytics",
    name: "NEXT_PUBLIC_META_PIXEL_ID",
    purpose: "Meta (Facebook/Instagram) Pixel for ads measurement. Loads only on the live site.",
    required: false,
    schema: z.string().regex(/^\d+$/, "Use only the digits of the Pixel ID"),
    secret: false,
    vercel: ["Production"],
    where: "Meta Events Manager → Data sources → your Pixel → ID.",
  },
  {
    docs: "https://support.google.com/analytics/answer/9539598",
    group: "Analytics",
    name: "NEXT_PUBLIC_GA4_MEASUREMENT_ID",
    purpose: "Google Analytics 4 measurement. Loads only on the live site.",
    required: false,
    schema: z.string().regex(/^G-[A-Z0-9]+$/i, "Use the measurement ID, like G-ABC123XYZ"),
    secret: false,
    vercel: ["Production"],
    where: "Google Analytics → Admin → Data streams → your web stream → Measurement ID.",
  },
  {
    group: "Analytics",
    name: "ANALYTICS_FORCE_ENABLE",
    purpose: 'Set to "true" to test Pixel/GA4 outside production. Never set it in Production.',
    required: false,
    schema: z.enum(["true", "false"], { error: 'Use "true" or leave empty' }),
    secret: false,
    vercel: ["Development"],
    where: "Only for testing tracking locally or on one preview.",
  },
  {
    group: "Analytics",
    name: "META_CAPI_ACCESS_TOKEN",
    purpose: "Reserved for a future server-side Meta Conversions API. Not read yet; leave empty.",
    required: false,
    secret: true,
    vercel: [],
    where: "See docs/maintainers/roadmap.md.",
  },
  {
    group: "Agent & bot protection (dormant)",
    name: "AI_GATEWAY_API_KEY",
    purpose: "Model access for the Shop Agent (features.agent). Off by default.",
    required: false,
    secret: true,
    vercel: LOCAL_ONLY,
    where: "Vercel → AI Gateway. Only when a developer turns the agent on.",
  },
  {
    group: "Agent & bot protection (dormant)",
    name: "UCP_AGENT_PROFILE_URL",
    purpose: "Override for the Shop Agent's public profile. Leave empty.",
    required: false,
    secret: false,
    vercel: [],
    where: "Only when a developer turns the agent on.",
  },
  {
    group: "Agent & bot protection (dormant)",
    name: "EVE_DEV",
    purpose: "Set automatically by the agent's dev command. Leave empty.",
    required: false,
    secret: false,
    vercel: [],
    where: "Never set by hand.",
  },
  {
    group: "Debugging",
    name: "DEBUG_SHOPIFY",
    purpose: 'Set to "1" to log how long each Shopify request takes.',
    required: false,
    secret: false,
    vercel: ["Development"],
    where: "Only while a developer investigates slowness.",
  },
];

// Upstream's example values count as missing, so a copied .env.example never looks configured.
const EXAMPLE_VALUES = new Set([
  "your-store.myshopify.com",
  "123456789",
  "shp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
]);

export function isUnset(value: string | undefined): boolean {
  const trimmed = value?.trim();
  return (
    !trimmed ||
    trimmed.includes(PLACEHOLDER) ||
    EXAMPLE_VALUES.has(trimmed) ||
    /^your-.*-here$/.test(trimmed)
  );
}

export type EnvStatus = "invalid" | "missing" | "ok" | "unset";

export interface EnvCheckRow {
  message?: string;
  required: boolean;
  spec: EnvVarSpec;
  status: EnvStatus;
}

export interface EnvReport {
  ok: boolean;
  problems: EnvCheckRow[];
  rows: EnvCheckRow[];
}

export function checkEnv(
  env: Record<string, string | undefined>,
  options: { customerAccounts: boolean },
): EnvReport {
  const rows = ENV_VARS.map((spec): EnvCheckRow => {
    const required =
      spec.required === "always" ||
      (spec.required === "customerAccounts" && options.customerAccounts);
    const value = env[spec.name];
    if (isUnset(value)) return { required, spec, status: required ? "missing" : "unset" };
    const parsed = spec.schema?.safeParse(value?.trim());
    if (parsed && !parsed.success) {
      return { message: parsed.error.issues[0]?.message, required, spec, status: "invalid" };
    }
    return { required, spec, status: "ok" };
  });
  const problems = rows.filter((row) => row.status === "missing" || row.status === "invalid");
  return { ok: problems.length === 0, problems, rows };
}

export function formatEnvReport(report: EnvReport, { all = false } = {}): string {
  const rows = all ? report.rows : report.problems;
  const lines = rows.map((row) => {
    const icon = row.status === "ok" ? "✅" : row.status === "unset" ? "➖" : "❌";
    const need = row.required ? "required" : "optional";
    const detail =
      row.status === "missing"
        ? `missing — ${row.spec.purpose} Where: ${row.spec.where}`
        : row.status === "invalid"
          ? `invalid — ${row.message}`
          : row.status === "unset"
            ? "not set"
            : "set";
    return `${icon} ${row.spec.name} (${need}): ${detail}`;
  });
  return lines.join("\n");
}
