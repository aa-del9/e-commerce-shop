import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { checkEnv, ENV_VARS, formatEnvReport, isUnset } from "@/lib/env";
import { renderSetupPage } from "@/lib/env/request";

const VALID = {
  NEXT_PUBLIC_SHOPIFY_SHOP_ID: "123456",
  NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN: "demo-store.myshopify.com",
  NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN: "abc123",
};

describe("environment validation", () => {
  it("passes with the three required Shopify values", () => {
    expect(checkEnv(VALID, { customerAccounts: false }).ok).toBe(true);
  });

  it("treats placeholders and upstream examples as missing", () => {
    expect(isUnset("__REPLACE_ME__")).toBe(true);
    expect(isUnset("your-store.myshopify.com")).toBe(true);
    expect(isUnset("your-session-secret-here")).toBe(true);
    expect(isUnset("")).toBe(true);
    expect(isUnset("real-value")).toBe(false);

    const report = checkEnv(
      { ...VALID, NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN: "__REPLACE_ME__" },
      { customerAccounts: false },
    );
    expect(report.ok).toBe(false);
    expect(report.problems.map((row) => row.spec.name)).toEqual([
      "NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN",
    ]);
  });

  it("requires customer account secrets only when the feature is on", () => {
    expect(checkEnv(VALID, { customerAccounts: false }).ok).toBe(true);
    const report = checkEnv(VALID, { customerAccounts: true });
    expect(report.problems.map((row) => row.spec.name).sort()).toEqual([
      "CUSTOMER_ACCOUNT_SESSION_SECRET",
      "SHOPIFY_CUSTOMER_ACCOUNT_API_CLIENT_ID",
      "SHOPIFY_CUSTOMER_ACCOUNT_API_CLIENT_SECRET",
    ]);
  });

  it("flags malformed values with a readable message", () => {
    const report = checkEnv(
      {
        ...VALID,
        NEXT_PUBLIC_GA4_MEASUREMENT_ID: "UA-1234",
        NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN: "https://demo-store.myshopify.com/",
      },
      { customerAccounts: false },
    );
    const text = formatEnvReport(report);
    expect(text).toContain("NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN (required): invalid");
    expect(text).toContain("NEXT_PUBLIC_GA4_MEASUREMENT_ID (optional): invalid");
  });

  it("renders a setup page that names each missing variable and where to get it", () => {
    const html = renderSetupPage(checkEnv({}, { customerAccounts: false }));
    for (const name of [
      "NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN",
      "NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN",
      "NEXT_PUBLIC_SHOPIFY_SHOP_ID",
    ]) {
      expect(html).toContain(name);
    }
    expect(html).toContain("Sales channels → Headless");
  });

  it("keeps .env.example, the PM doc and turbo.json in sync with lib/env (run pnpm env:example)", () => {
    const example = readFileSync(".env.example", "utf8");
    const doc = readFileSync("docs/04-environment-variables.md", "utf8");
    const turbo = JSON.parse(readFileSync("turbo.json", "utf8")) as { globalEnv: string[] };
    for (const spec of ENV_VARS) {
      expect(example).toContain(`${spec.name}=`);
      expect(doc).toContain(`\`${spec.name}\``);
      expect(turbo.globalEnv).toContain(spec.name);
      if (spec.required === "always") expect(example).toContain(`${spec.name}="__REPLACE_ME__"`);
    }
  });
});
