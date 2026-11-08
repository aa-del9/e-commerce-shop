# ADR 005: Shopify metafields and metaobjects are the CMS

- **Status:** accepted (2026-11-08)

## Context

Stores need editable homepage sections, FAQs, announcements, size charts and product details. An external CMS
adds a paid service, another login for the PM, and another webhook path.

## Decision

- Model content in Shopify: product metafields in the `custom` namespace and merchant-owned metaobject types
  (`size_chart`, `faq_item`, `announcement`, `home_section`, `lookbook`), all with Storefront `PUBLIC_READ`
  access and publishable (Draft/Active) entries.
- Declare the model in `shopify/schema.ts`; `pnpm shopify:setup` creates or updates it idempotently and never
  deletes. Names stay generic (no product categories).
- Read content through cached `get*` loaders tagged `metaobjects` / `product-<handle>`, invalidated by
  upstream's webhook route. Every block renders nothing when its content is empty.

## Consequences

- The PM edits everything in one admin; no extra cost or credentials.
- Shopify's editors are basic (no rich layouts); home sections are a fixed set of types.
- Metafield and field types can never change once created; changes need a new key.
- Metaobject webhooks require a type filter, maintained in `shopify/schema.ts`.
