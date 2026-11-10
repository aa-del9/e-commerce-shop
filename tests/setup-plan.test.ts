import { describe, expect, it } from "vitest";

import { type ExistingState, planSetup, resolveWebhookUri, STOREFRONT_READ } from "@/shopify/plan";
import {
  METAFIELD_NAMESPACE,
  METAOBJECT_DEFINITIONS,
  PRODUCT_METAFIELD_DEFINITIONS,
  WEBHOOK_SUBSCRIPTIONS,
} from "@/shopify/schema";

const EMPTY: ExistingState = { metafieldDefinitions: [], metaobjectDefinitions: [], webhooks: [] };
const WEBHOOK_URI = "https://shop.example.pk/api/webhooks/shopify";

function plan(existing: ExistingState, webhookUri: string | null = WEBHOOK_URI) {
  return planSetup({
    existing,
    metafieldDefinitions: PRODUCT_METAFIELD_DEFINITIONS,
    metafieldNamespace: METAFIELD_NAMESPACE,
    metaobjectDefinitions: METAOBJECT_DEFINITIONS,
    webhooks: WEBHOOK_SUBSCRIPTIONS,
    webhookUri,
  });
}

// What Shopify would report after a successful setup run.
function syncedState(): ExistingState {
  return {
    metafieldDefinitions: PRODUCT_METAFIELD_DEFINITIONS.map((definition) => ({
      description: definition.description,
      key: definition.key,
      name: definition.name,
      namespace: METAFIELD_NAMESPACE,
      storefrontAccess: STOREFRONT_READ,
      type: definition.type,
      validations: "validations" in definition ? [...definition.validations] : [],
    })),
    metaobjectDefinitions: METAOBJECT_DEFINITIONS.map((definition, index) => ({
      fields: definition.fields.map((field) => ({
        description: "description" in field ? field.description : null,
        key: field.key,
        name: field.name,
        required: "required" in field ? field.required : false,
        type: field.type,
        validations: "validations" in field ? [...field.validations] : [],
      })),
      id: `gid://shopify/MetaobjectDefinition/${index + 1}`,
      name: definition.name,
      publishable: definition.publishable,
      storefrontAccess: STOREFRONT_READ,
      type: definition.type,
    })),
    webhooks: WEBHOOK_SUBSCRIPTIONS.map((webhook) => ({
      filter: "filter" in webhook ? webhook.filter : null,
      topic: webhook.topic,
      uri: WEBHOOK_URI,
    })),
  };
}

describe("shopify:setup planning", () => {
  it("creates everything on an empty store, referenced definitions first", () => {
    const result = plan(EMPTY);
    const kinds = result.actions.map((action) => action.kind);
    expect(kinds.filter((kind) => kind === "create-metaobject")).toHaveLength(
      METAOBJECT_DEFINITIONS.length,
    );
    expect(kinds.filter((kind) => kind === "create-metafield")).toHaveLength(
      PRODUCT_METAFIELD_DEFINITIONS.length,
    );
    expect(kinds.filter((kind) => kind === "create-webhook")).toHaveLength(
      WEBHOOK_SUBSCRIPTIONS.length,
    );
    const order = result.actions.flatMap((action) =>
      action.kind === "create-metaobject" ? [action.definition.type] : [],
    );
    expect(order.indexOf("lookbook")).toBeLessThan(order.indexOf("home_section"));
    expect(result.warnings).toEqual([]);
  });

  it("is idempotent: a synced store needs no changes", () => {
    const result = plan(syncedState());
    expect(result.actions).toEqual([]);
    expect(result.warnings).toEqual([]);
  });

  it("adds missing fields and fixes storefront access without deleting extras", () => {
    const state = syncedState();
    const faq = state.metaobjectDefinitions.find(({ type }) => type === "faq_item")!;
    faq.fields = faq.fields.filter(({ key }) => key !== "category");
    faq.fields.push({
      description: null,
      key: "legacy",
      name: "Legacy",
      required: false,
      type: "single_line_text_field",
      validations: [],
    });
    faq.storefrontAccess = "NONE";
    const result = plan(state);
    expect(result.actions).toHaveLength(1);
    const [action] = result.actions;
    expect(action?.kind).toBe("update-metaobject");
    if (action?.kind !== "update-metaobject") return;
    expect(action.createFields.map(({ key }) => key)).toEqual(["category"]);
    expect(action.changes).toContain("storefront access");
    expect(result.warnings.join("\n")).toContain('"legacy" exists only in Shopify');
  });

  it("never plans a type change; it warns instead", () => {
    const state = syncedState();
    state.metafieldDefinitions.find(({ key }) => key === "badges")!.type = "single_line_text_field";
    const result = plan(state);
    expect(result.actions).toEqual([]);
    expect(result.warnings.join("\n")).toContain("custom.badges");
  });

  it("updates names, descriptions and validations in place", () => {
    const state = syncedState();
    state.metafieldDefinitions.find(({ key }) => key === "care")!.name = "Care instructions";
    const result = plan(state);
    expect(result.actions).toMatchObject([
      { changes: ["name"], definition: { key: "care" }, kind: "update-metafield" },
    ]);
  });

  it("skips webhooks without a public https site URL", () => {
    expect(resolveWebhookUri(undefined)).toBeNull();
    expect(resolveWebhookUri("http://localhost:3000")).toBeNull();
    expect(resolveWebhookUri("https://localhost:3000")).toBeNull();
    expect(resolveWebhookUri("__REPLACE_ME__")).toBeNull();
    expect(resolveWebhookUri("https://shop.example.pk")).toBe(WEBHOOK_URI);
    const result = plan(EMPTY, null);
    expect(result.actions.some((action) => action.kind === "create-webhook")).toBe(false);
    expect(result.warnings.join("\n")).toContain("NEXT_PUBLIC_SITE_URL");
  });

  it("filters metaobject webhooks by type, as Shopify requires", () => {
    const metaobjectTopics = WEBHOOK_SUBSCRIPTIONS.filter(({ topic }) =>
      topic.startsWith("METAOBJECTS"),
    );
    for (const webhook of metaobjectTopics) {
      expect("filter" in webhook && webhook.filter).toContain("type:faq_item");
    }
  });

  it("keeps content names generic", () => {
    const names = JSON.stringify([
      METAOBJECT_DEFINITIONS,
      PRODUCT_METAFIELD_DEFINITIONS,
    ]).toLowerCase();
    for (const word of ["jacket", "coat", "apparel", "clothing", "shirt"]) {
      expect(names).not.toContain(word);
    }
  });
});
