import { describe, expect, it } from "vitest";

import { brand } from "@/brand/config";
import { BrandConfigError, validateBrand } from "@/lib/brand/schema";

function withChanges(change: (config: Record<string, any>) => void) {
  const copy = structuredClone(brand) as Record<string, any>;
  change(copy);
  return copy;
}

function issuesFor(input: unknown): string[] {
  try {
    validateBrand(input);
    return [];
  } catch (error) {
    if (error instanceof BrandConfigError) return error.issues;
    throw error;
  }
}

describe("brand config schema", () => {
  it("accepts the shipped neutral config", () => {
    expect(() => validateBrand(brand)).not.toThrow();
  });

  it("ships Pakistan defaults and dormant upstream features", () => {
    expect(brand.localization).toMatchObject({
      country: "PK",
      currency: "PKR",
      language: "EN",
      locale: "en-PK",
    });
    expect(brand.features).toMatchObject({
      agent: false,
      botProtection: false,
      customerAccounts: false,
      i18n: false,
      markets: false,
    });
  });

  it("names the field and the fix for a non-Pakistani WhatsApp number", () => {
    const issues = issuesFor(withChanges((c) => (c.identity.whatsappNumber = "03001234567")));
    expect(issues.join("\n")).toContain("identity.whatsappNumber");
    expect(issues.join("\n")).toContain("+923001234567");
  });

  it("accepts any E.164 WhatsApp number outside Pakistan", () => {
    const issues = issuesFor(
      withChanges((c) => {
        c.localization.country = "AE";
        c.identity.whatsappNumber = "+971501234567";
      }),
    );
    expect(issues).toEqual([]);
  });

  it("keeps i18n and markets off through config", () => {
    const issues = issuesFor(withChanges((c) => (c.features.i18n = true)));
    expect(issues.join("\n")).toContain("features.i18n");
    expect(issues.join("\n")).toContain("enable-i18n");
  });

  it("requires %s in the title template", () => {
    const issues = issuesFor(withChanges((c) => (c.seo.titleTemplate = "Store Name")));
    expect(issues.join("\n")).toContain("seo.titleTemplate");
  });

  it("rejects unknown keys so typos surface", () => {
    const issues = issuesFor(withChanges((c) => (c.features.whatsapButton = true)));
    expect(issues.join("\n")).toContain("whatsapButton");
  });

  it("rejects an invalid email and currency display", () => {
    const issues = issuesFor(
      withChanges((c) => {
        c.identity.supportEmail = "not-an-email";
        c.localization.currencyDisplay = "name";
      }),
    );
    expect(issues.some((issue) => issue.startsWith("identity.supportEmail"))).toBe(true);
    expect(issues.some((issue) => issue.startsWith("localization.currencyDisplay"))).toBe(true);
  });
});
