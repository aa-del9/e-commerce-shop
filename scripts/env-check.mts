// pnpm env:check [--warn-only] [--all]
// Prints every environment variable with ✅/❌ for the current environment and validates brand/config.ts.
// --warn-only never fails (used by `pnpm verify` in CI, where real credentials are absent).
import "./lib/ts-resolve.mts";

const { brand } = await import("../brand/config.ts");
const { validateBrand } = await import("../lib/brand/schema.ts");
const { checkEnv, formatEnvReport } = await import("../lib/env/index.ts");

const warnOnly = process.argv.includes("--warn-only");
let failed = false;

try {
  validateBrand(brand);
  console.log("✅ brand/config.ts is valid");
} catch (error) {
  failed = true;
  console.log(`❌ ${error instanceof Error ? error.message : String(error)}`);
}

const report = checkEnv(process.env, { customerAccounts: brand.features.customerAccounts });
console.log(`\nEnvironment variables (${process.env.VERCEL_ENV ?? "local"}):`);
console.log(formatEnvReport(report, { all: true }));
if (!report.ok) {
  failed = true;
  console.log(
    `\n${report.problems.length} problem(s). Set them in .env.local (local) or Vercel → Settings → Environment Variables. See docs/04-environment-variables.md.`,
  );
}

// The shop ID is not shown anywhere obvious in the admin, so look it up once the token works.
const domainRow = report.rows.find((row) => row.spec.name === "NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN");
const tokenRow = report.rows.find(
  (row) => row.spec.name === "NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN",
);
const shopIdRow = report.rows.find((row) => row.spec.name === "NEXT_PUBLIC_SHOPIFY_SHOP_ID");
if (domainRow?.status === "ok" && tokenRow?.status === "ok" && shopIdRow?.status !== "ok") {
  try {
    const response = await fetch(
      `https://${process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN}/api/2026-10/graphql.json`,
      {
        body: JSON.stringify({ query: "{ shop { id } }" }),
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Storefront-Access-Token":
            process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN ?? "",
        },
        method: "POST",
      },
    );
    const body = (await response.json()) as { data?: { shop?: { id?: string } } };
    const id = body.data?.shop?.id?.split("/").pop();
    if (id) console.log(`\nYour shop ID is ${id}. Set NEXT_PUBLIC_SHOPIFY_SHOP_ID="${id}".`);
  } catch {
    console.log("\nCould not reach Shopify to look up the shop ID; check the domain and token.");
  }
}

if (failed && !warnOnly) process.exitCode = 1;
