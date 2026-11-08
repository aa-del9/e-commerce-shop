---
name: add-content-type
description: Add a product metafield or a metaobject type to the store's Shopify content model (shopify/schema.ts), create it in Shopify with the setup script, render it on the site, and document it for the PM. This is a base change. Use when a request needs new editable content in the Shopify admin.
---

# Add a content type (base change)

The content model is code: `shopify/schema.ts` declares every metafield and metaobject definition, and
`pnpm shopify:setup` creates them in Shopify. This changes the base, so:

- In a **store** repo (`.repo-role` = `store`), stop and tell the user this is a base change. Offer to draft a
  Change request for the base repo instead. Continue only if the user explicitly says to make a base change
  here (the maintainer sets `ALLOW_BASE_EDITS=1`).
- In the **base** repo, continue.

## Steps

1. **Verify the Shopify facts.** Use the Shopify Dev MCP (`shopify-dev-mcp` in `.mcp.json`) or shopify.dev to
   confirm the type name (`single_line_text_field`, `list.product_reference`, …), validation names
   (`choices`, `file_type_options`, `metaobject_definition_type`), and that the Storefront API can read it.
   Never guess. Remember: `url` fields only accept absolute URLs; types can never change once created.
2. **Declare it** in `shopify/schema.ts`: a new entry in `PRODUCT_METAFIELD_DEFINITIONS` or
   `METAOBJECT_DEFINITIONS`. Generic names only (no product categories). Add a description the PM will see
   in the admin. New metaobject types are also added to `METAOBJECT_WEBHOOK_FILTER` automatically.
3. **Plan:** `pnpm shopify:setup --dry-run`. Show the plan. Then, after the user agrees, run
   `pnpm shopify:setup` (needs Admin credentials in `.env.local`).
4. **Read it:**
   - Product metafields are fetched automatically (`fetchProductContent` requests every key in the schema).
     Add the field to `ProductContent` in `lib/store-content/types.ts` and map it in `toProductContent`
     (`lib/shopify/transforms/store-content/index.ts`).
   - Metaobjects: add a domain type, a transform, and a cached `get*` loader in `lib/store-content/server.ts`
     (`"use cache: remote"`, `cacheLife("max")`, `cacheTag("metaobjects", "metaobjects-<type>")`) that returns
     an empty result on errors. Validate the GraphQL against the Storefront schema with the Shopify Dev MCP.
5. **Render it** in `brand/sections/` behind a feature flag if it is optional (`features` in
   `lib/brand/schema.ts` and `brand/config.ts`). It must render nothing when the data is empty.
6. **Test:** add unit tests for the transform in `tests/`. Run `pnpm verify`.
7. **Document** in `docs/07-content-in-shopify.md`: what it does, where it shows on the site, and the exact
   admin path to edit it. List any upstream file you touched in `UPSTREAM.md`.
