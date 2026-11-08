// pnpm shopify:setup [--dry-run]
// Creates or updates every definition in shopify/schema.ts and registers the cache webhooks.
// Idempotent and additive: it never deletes definitions, fields, entries or webhooks.
import {
  describeAction,
  type ExistingState,
  type Plan,
  type PlanAction,
  planSetup,
  resolveWebhookUri,
  STOREFRONT_READ,
} from "../shopify/plan.ts";
import {
  METAFIELD_NAMESPACE,
  METAOBJECT_DEFINITIONS,
  type MetaobjectFieldDefinition,
  PRODUCT_METAFIELD_DEFINITIONS,
  WEBHOOK_SUBSCRIPTIONS,
} from "../shopify/schema.ts";
import {
  type AdminCredentials,
  adminRequest,
  ADMIN_API_VERSION,
  assertNoUserErrors,
  getAdminCredentials,
  hasAdminCredentials,
  type UserError,
} from "./lib/shopify-admin.mts";

const isDryRun = process.argv.includes("--dry-run");

const STATE_QUERY = `#graphql
  query BaseSetupState($namespace: String!) {
    shop { name currencyCode }
    metafieldDefinitions(first: 250, ownerType: PRODUCT, namespace: $namespace) {
      nodes {
        key
        namespace
        name
        description
        type { name }
        access { storefront }
        validations { name value }
      }
    }
    metaobjectDefinitions(first: 250) {
      nodes {
        id
        type
        name
        access { storefront }
        capabilities { publishable { enabled } }
        fieldDefinitions {
          key
          name
          description
          required
          type { name }
          validations { name value }
        }
      }
    }
    webhookSubscriptions(first: 250) {
      nodes { topic uri filter }
    }
  }
`;

interface StateResponse {
  metafieldDefinitions: {
    nodes: Array<{
      access: { storefront: string | null };
      description: string | null;
      key: string;
      name: string;
      namespace: string;
      type: { name: string };
      validations: Array<{ name: string; value: string | null }>;
    }>;
  };
  metaobjectDefinitions: {
    nodes: Array<{
      access: { storefront: string | null };
      capabilities: { publishable: { enabled: boolean } };
      fieldDefinitions: Array<{
        description: string | null;
        key: string;
        name: string;
        required: boolean;
        type: { name: string };
        validations: Array<{ name: string; value: string | null }>;
      }>;
      id: string;
      name: string;
      type: string;
    }>;
  };
  shop: { currencyCode: string; name: string };
  webhookSubscriptions: { nodes: Array<{ filter: string | null; topic: string; uri: string }> };
}

async function readState(
  credentials: AdminCredentials,
): Promise<{ currencyCode: string; shopName: string; state: ExistingState }> {
  const data = await adminRequest<StateResponse>(credentials, STATE_QUERY, {
    namespace: METAFIELD_NAMESPACE,
  });
  return {
    currencyCode: data.shop.currencyCode,
    shopName: data.shop.name,
    state: {
      metafieldDefinitions: data.metafieldDefinitions.nodes.map((node) => ({
        description: node.description,
        key: node.key,
        name: node.name,
        namespace: node.namespace,
        storefrontAccess: node.access.storefront ?? "NONE",
        type: node.type.name,
        validations: node.validations,
      })),
      metaobjectDefinitions: data.metaobjectDefinitions.nodes.map((node) => ({
        fields: node.fieldDefinitions.map((field) => ({
          description: field.description,
          key: field.key,
          name: field.name,
          required: field.required,
          type: field.type.name,
          validations: field.validations,
        })),
        id: node.id,
        name: node.name,
        publishable: node.capabilities.publishable.enabled,
        storefrontAccess: node.access.storefront ?? "NONE",
        type: node.type,
      })),
      webhooks: data.webhookSubscriptions.nodes,
    },
  };
}

function fieldInput(field: MetaobjectFieldDefinition) {
  return {
    description: field.description,
    key: field.key,
    name: field.name,
    required: field.required ?? false,
    type: field.type,
    validations: field.validations ?? [],
  };
}

async function apply(credentials: AdminCredentials, action: PlanAction) {
  switch (action.kind) {
    case "create-metaobject": {
      const { definition } = action;
      const data = await adminRequest<{
        metaobjectDefinitionCreate: { userErrors: UserError[] };
      }>(
        credentials,
        `#graphql
        mutation BaseCreateMetaobjectDefinition($definition: MetaobjectDefinitionCreateInput!) {
          metaobjectDefinitionCreate(definition: $definition) {
            metaobjectDefinition { id }
            userErrors { field message code }
          }
        }`,
        {
          definition: {
            access: { storefront: STOREFRONT_READ },
            capabilities: { publishable: { enabled: definition.publishable } },
            description: definition.description,
            displayNameKey: definition.displayNameKey,
            fieldDefinitions: definition.fields.map(fieldInput),
            name: definition.name,
            type: definition.type,
          },
        },
      );
      assertNoUserErrors(describeAction(action), data.metaobjectDefinitionCreate.userErrors);
      return;
    }
    case "update-metaobject": {
      const { definition } = action;
      const data = await adminRequest<{
        metaobjectDefinitionUpdate: { userErrors: UserError[] };
      }>(
        credentials,
        `#graphql
        mutation BaseUpdateMetaobjectDefinition($id: ID!, $definition: MetaobjectDefinitionUpdateInput!) {
          metaobjectDefinitionUpdate(id: $id, definition: $definition) {
            metaobjectDefinition { id }
            userErrors { field message code }
          }
        }`,
        {
          definition: {
            access: { storefront: STOREFRONT_READ },
            capabilities: { publishable: { enabled: definition.publishable } },
            fieldDefinitions: [
              ...action.createFields.map((field) => ({ create: fieldInput(field) })),
              ...action.updateFields.map((field) => {
                const { type: _type, ...update } = fieldInput(field);
                return { update };
              }),
            ],
            name: definition.name,
          },
          id: action.id,
        },
      );
      assertNoUserErrors(describeAction(action), data.metaobjectDefinitionUpdate.userErrors);
      return;
    }
    case "create-metafield": {
      const { definition } = action;
      const data = await adminRequest<{
        metafieldDefinitionCreate: { userErrors: UserError[] };
      }>(
        credentials,
        `#graphql
        mutation BaseCreateMetafieldDefinition($definition: MetafieldDefinitionInput!) {
          metafieldDefinitionCreate(definition: $definition) {
            createdDefinition { id }
            userErrors { field message code }
          }
        }`,
        {
          definition: {
            access: { storefront: STOREFRONT_READ },
            description: definition.description,
            key: definition.key,
            name: definition.name,
            namespace: METAFIELD_NAMESPACE,
            ownerType: "PRODUCT",
            type: definition.type,
            validations: definition.validations ?? [],
          },
        },
      );
      assertNoUserErrors(describeAction(action), data.metafieldDefinitionCreate.userErrors);
      return;
    }
    case "update-metafield": {
      const { definition } = action;
      const data = await adminRequest<{
        metafieldDefinitionUpdate: { userErrors: UserError[] };
      }>(
        credentials,
        `#graphql
        mutation BaseUpdateMetafieldDefinition($definition: MetafieldDefinitionUpdateInput!) {
          metafieldDefinitionUpdate(definition: $definition) {
            updatedDefinition { id }
            userErrors { field message code }
          }
        }`,
        {
          definition: {
            access: { storefront: STOREFRONT_READ },
            description: definition.description,
            key: definition.key,
            name: definition.name,
            namespace: METAFIELD_NAMESPACE,
            ownerType: "PRODUCT",
            validations: definition.validations ?? [],
          },
        },
      );
      assertNoUserErrors(describeAction(action), data.metafieldDefinitionUpdate.userErrors);
      return;
    }
    case "create-webhook": {
      const data = await adminRequest<{
        webhookSubscriptionCreate: { userErrors: UserError[] };
      }>(
        credentials,
        `#graphql
        mutation BaseCreateWebhook($topic: WebhookSubscriptionTopic!, $webhookSubscription: WebhookSubscriptionInput!) {
          webhookSubscriptionCreate(topic: $topic, webhookSubscription: $webhookSubscription) {
            webhookSubscription { id }
            userErrors { field message }
          }
        }`,
        {
          topic: action.topic,
          webhookSubscription: {
            format: "JSON",
            uri: action.uri,
            ...(action.filter ? { filter: action.filter } : {}),
          },
        },
      );
      assertNoUserErrors(describeAction(action), data.webhookSubscriptionCreate.userErrors);
    }
  }
}

function printPlan(plan: Plan) {
  if (plan.actions.length === 0)
    console.log("Nothing to change: Shopify already matches shopify/schema.ts.");
  for (const action of plan.actions) console.log(`  + ${describeAction(action)}`);
  if (plan.unchanged.length > 0) console.log(`  = ${plan.unchanged.length} already up to date`);
  for (const warning of plan.warnings) console.log(`  ! ${warning}`);
}

const MANUAL_CHECKLIST = [
  [
    "Headless channel + Storefront API token (NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN)",
    "https://shopify.dev/docs/storefronts/headless/building-with-the-storefront-api/manage-headless-channels",
  ],
  [
    "Webhook secret: webhooks registered here are signed with the app's client secret; put that value in SHOPIFY_WEBHOOK_SECRET in Vercel",
    "https://shopify.dev/docs/apps/build/webhooks/subscribe/https",
  ],
  [
    "Checkout domain: point checkout.<your-domain> to Shopify (CNAME) and set it in Settings → Domains",
    "https://shopify.dev/docs/storefronts/headless/hydrogen/migrate/redirect-traffic",
  ],
  [
    "Checkout branding: logo, colors and fonts in the checkout editor",
    "https://help.shopify.com/en/manual/checkout-settings/customize-checkout-configurations/checkout-editor",
  ],
  [
    "Cash on Delivery: Settings → Payments → Manual payment methods → Cash on Delivery (COD)",
    "https://help.shopify.com/en/manual/payments/manual-payments",
  ],
  [
    "Shipping zones and rates for Pakistan",
    "https://help.shopify.com/en/manual/shipping/setting-up-and-managing-your-shipping/setting-up-shipping-zones",
  ],
  [
    "Store policies (refund, privacy, terms, shipping) — the footer links to them",
    "https://help.shopify.com/en/manual/checkout-settings/refund-privacy-tos",
  ],
  [
    "Customer Account API (only if features.customerAccounts is true)",
    "https://shopify.dev/docs/storefronts/headless/building-with-the-customer-account-api/getting-started",
  ],
  [
    "Publish content: metaobject entries start as Draft; set them to Active to show them",
    "https://help.shopify.com/en/manual/custom-data/metaobjects",
  ],
] as const;

function printChecklist() {
  console.log("\nManual steps in the Shopify admin (not automated):");
  for (const [step, link] of MANUAL_CHECKLIST) console.log(`  [ ] ${step}\n      ${link}`);
}

async function main() {
  const webhookUri = resolveWebhookUri(process.env.NEXT_PUBLIC_SITE_URL);
  const planInput = {
    metafieldDefinitions: PRODUCT_METAFIELD_DEFINITIONS,
    metafieldNamespace: METAFIELD_NAMESPACE,
    metaobjectDefinitions: METAOBJECT_DEFINITIONS,
    webhooks: WEBHOOK_SUBSCRIPTIONS,
    webhookUri,
  };

  if (!hasAdminCredentials()) {
    if (!isDryRun) {
      console.error(
        "Missing Admin API credentials. Add SHOPIFY_STORE_DOMAIN and SHOPIFY_ADMIN_API_ACCESS_TOKEN (or SHOPIFY_ADMIN_CLIENT_ID + SHOPIFY_ADMIN_CLIENT_SECRET) to .env.local.\nSee docs/03-setting-up-a-new-store.md. Use --dry-run to preview the plan without credentials.",
      );
      process.exitCode = 1;
      return;
    }
    console.log("Dry run without Admin API credentials: planning against an empty store.\n");
    printPlan(
      planSetup({
        ...planInput,
        existing: { metafieldDefinitions: [], metaobjectDefinitions: [], webhooks: [] },
      }),
    );
    printChecklist();
    return;
  }

  const credentials = await getAdminCredentials();
  const { currencyCode, shopName, state } = await readState(credentials);
  console.log(`Store: ${shopName} (${credentials.domain}), Admin API ${ADMIN_API_VERSION}`);
  if (currencyCode !== "PKR") {
    console.log(
      `  ! Store currency is ${currencyCode}; brand/config.ts expects the store's real currency.`,
    );
  }
  const plan = planSetup({ ...planInput, existing: state });
  console.log(isDryRun ? "\nPlanned changes (dry run, nothing written):" : "\nApplying changes:");
  printPlan(plan);

  if (!isDryRun) {
    for (const action of plan.actions) {
      await apply(credentials, action);
      console.log(`  ✓ ${describeAction(action)}`);
    }
    console.log(
      `\nDone: ${plan.actions.length} change(s), ${plan.unchanged.length} unchanged, ${plan.warnings.length} warning(s).`,
    );
  }
  printChecklist();
}

await main().catch((error: unknown) => {
  console.error(`\nSetup stopped: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
