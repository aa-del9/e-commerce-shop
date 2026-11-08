# Base setup run log

Decisions made during the unattended base-setup run. Each entry: decision, alternatives, why, how to reverse.

## R1. Node 26 from fnm, not the shell default

- **Decision:** run every command with Node 26.13 (fnm install) because the shell default is Node 22 and the repo requires `node: 26`.
- **Alternatives:** let pnpm's `devEngines` download Node.
- **Why:** devEngines download is slow on this network; Node 26 was already installed.
- **Reverse:** n/a (environment only).

## R2. No demo mode

- **Decision:** upstream has no credential-free mode, so none is built. Dev shows a setup page instead; docs point to a free Shopify dev store.
- **Alternatives:** a mock Storefront API.
- **Why:** the brief says don't build one; mock data would drift from Shopify.
- **Reverse:** n/a.

## R3. PKR formatting default

- **Decision:** `currencyDisplay: "symbol"` is the default. Node 26 `Intl` gives `Rs 124,999` for `en-PK` (0 fraction digits, western grouping); `"code"` gives `PKR 124,999`.
- **Alternatives:** `"code"` default.
- **Why:** "Rs" is how Pakistani shoppers read prices.
- **Reverse:** set `localization.currencyDisplay: "code"` in `brand/config.ts`.

## R4. Shopify facts verified against shopify.dev (Admin API 2026-10)

- The Shopify Dev MCP was not authenticated in this run; facts come from shopify.dev reference pages.
- Metafield/metaobject definitions: `access: { storefront: PUBLIC_READ }` (default `NONE`, which hides them from the Storefront API). `custom` namespace is merchant-owned. Type can never change after creation.
- Metaobject reference validation: `{ name: "metaobject_definition_id", value: "<MetaobjectDefinition GID>" }`.
- `metaobjectDefinitionUpdate(id, definition: { fieldDefinitions: [{ create } | { update } | { delete }] })`.
- Publishable capability: entries default to DRAFT; unpublished entries do not show on the storefront.
- Metaobject webhooks (`METAOBJECTS_CREATE/UPDATE/DELETE`) **require** a `filter` such as `type:faq_item OR type:announcement`. `webhookSubscriptionCreate` takes `webhookSubscription: { uri, filter, format }` (`callbackUrl` is deprecated).
- CDN image params: `width`, `height` (≤ 5760), `crop`; format negotiation (WebP/AVIF) is automatic.
- Admin tokens: custom apps can no longer be created in the admin (since 2026-01-01). Use a Dev Dashboard app in the same organization, install it on the store, then the client credentials grant (`POST /admin/oauth/access_token`, 24 h token).

## R5. Size chart as list fields, not JSON

- **Decision:** `size_chart` metaobject has `columns` (list of single-line text) and `rows` (list of single-line text, cells separated by `|`).
- **Alternatives:** a `json` field (raw JSON editing in admin), or Shopify's example of one metaobject entry per row (fixed measurement fields, not generic).
- **Why:** the PM edits lists in the admin without JSON; any number of columns works for any sized product.
- **Reverse:** change the definition in `shopify/schema.ts` (types cannot change in place: create a new field key) and the transform in `lib/shopify/transforms/store-content/index.ts`.

## R6. Buy with Shop off

- **Decision:** `shopConfig.pdp.buyWithShop.isEnabled` is `false` in the adapter.
- **Why:** Shop Pay is not available to Pakistani merchants; the button would fail.
- **Reverse:** set it back to `true` in `lib/config/index.ts` (base change).
