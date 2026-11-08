// pnpm shopify:seed [--dry-run]
// Creates a few neutral sample entries so a fresh store shows every content block.
// Upserts by handle (safe to re-run). Only touches metaobject entries; never products or orders.
// Run `pnpm shopify:setup` first so the definitions exist.
import {
  adminRequest,
  assertNoUserErrors,
  getAdminCredentials,
  hasAdminCredentials,
  type UserError,
} from "./lib/shopify-admin.mts";

interface SeedEntry {
  fields: Record<string, string>;
  handle: string;
  type: string;
}

const SEED_ENTRIES: SeedEntry[] = [
  {
    fields: { text: "Free delivery on qualifying orders across Pakistan." },
    handle: "base-sample-announcement",
    type: "announcement",
  },
  {
    fields: {
      answer: "Orders are usually delivered in 3–5 working days.",
      category: "Delivery",
      question: "How long does delivery take?",
      sort_order: "1",
    },
    handle: "base-sample-faq-delivery",
    type: "faq_item",
  },
  {
    fields: {
      answer: "Yes. Choose Cash on Delivery at checkout and pay when your order arrives.",
      category: "Payment",
      question: "Can I pay cash on delivery?",
      sort_order: "2",
    },
    handle: "base-sample-faq-cod",
    type: "faq_item",
  },
  {
    fields: {
      answer: "Contact us within 7 days of delivery and we will arrange an exchange.",
      category: "Returns",
      question: "How do exchanges work?",
      sort_order: "3",
    },
    handle: "base-sample-faq-exchanges",
    type: "faq_item",
  },
  {
    fields: {
      body: "Replace this section in Shopify admin → Content → Metaobjects → Home section.",
      heading: "Welcome to the store",
      link: "/collections/all",
      link_label: "Shop all",
      sort_order: "1",
      type: "hero",
    },
    handle: "base-sample-home-hero",
    type: "home_section",
  },
  {
    fields: {
      heading: "New arrivals",
      link: "/collections/all",
      sort_order: "2",
      type: "product_grid",
    },
    handle: "base-sample-home-products",
    type: "home_section",
  },
  {
    fields: {
      columns: JSON.stringify(["Size", "Width", "Length"]),
      name: "Sample size chart",
      note: "Measurements are approximate.",
      rows: JSON.stringify(["S | 50 | 68", "M | 53 | 70", "L | 56 | 72", "XL | 59 | 74"]),
      unit: "cm",
    },
    handle: "base-sample-size-chart",
    type: "size_chart",
  },
];

const UPSERT = `#graphql
  mutation BaseSeedMetaobject($handle: MetaobjectHandleInput!, $metaobject: MetaobjectUpsertInput!) {
    metaobjectUpsert(handle: $handle, metaobject: $metaobject) {
      metaobject { id handle }
      userErrors { field message code }
    }
  }
`;

async function main() {
  const isDryRun = process.argv.includes("--dry-run");
  for (const entry of SEED_ENTRIES) console.log(`  + ${entry.type}/${entry.handle}`);
  if (isDryRun) {
    console.log("\nDry run: nothing written.");
    return;
  }
  if (!hasAdminCredentials()) {
    console.error("Missing Admin API credentials. See docs/03-setting-up-a-new-store.md.");
    process.exitCode = 1;
    return;
  }
  const credentials = await getAdminCredentials();
  for (const entry of SEED_ENTRIES) {
    const data = await adminRequest<{ metaobjectUpsert: { userErrors: UserError[] } }>(
      credentials,
      UPSERT,
      {
        handle: { handle: entry.handle, type: entry.type },
        metaobject: {
          capabilities: { publishable: { status: "ACTIVE" } },
          fields: Object.entries(entry.fields).map(([key, value]) => ({ key, value })),
        },
      },
    );
    assertNoUserErrors(`${entry.type}/${entry.handle}`, data.metaobjectUpsert.userErrors);
    console.log(`  ✓ ${entry.type}/${entry.handle}`);
  }
  console.log(
    "\nSample content is Active. Edit or delete it in Shopify admin → Content → Metaobjects.",
  );
}

await main().catch((error: unknown) => {
  console.error(`\nSeed stopped: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
