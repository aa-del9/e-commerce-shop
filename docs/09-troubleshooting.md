# 9. Troubleshooting

Start with `pnpm verify` and `pnpm env:check`, or ask Claude Code to run the `verify` skill: it explains failures in
plain language.

## "Almost there: the store needs a few settings" page

You are running the site on your computer (`pnpm dev`) and required settings are missing or still say
`__REPLACE_ME__`. The page lists each one, what it's for and where to find it.

Fix: open `.env.local`, fill in the values, save, and restart `pnpm dev`. Details in
[Environment variables](04-environment-variables.md). The live site never shows this page.

## Vercel build fails with "Missing or invalid environment variables"

The build stopped on purpose because a required setting is missing in Vercel. The build log lists each one with ❌.

Fix: Vercel → Project → Settings → Environment Variables → add the missing values for the right environment
(Production and/or Preview) → Redeploy.

## "brand/config.ts has a problem"

A field in `brand/config.ts` is invalid. The message names the field and how to fix it, for example a WhatsApp
number written as `0300…` instead of `+92300…`. Ask Claude Code to fix it, or run the `configure-brand` skill.

## My Shopify edit doesn't show on the site

Check in this order:

1. **Is the entry Active?** Metaobject entries start as Draft. Content → Metaobjects → the entry → Status: Active.
2. **Is the feature on?** Each block has a switch in `brand/config.ts` → features.
3. **Are webhooks set up?** Shopify tells the site about product, collection and metaobject edits through webhooks.
   They need `pnpm shopify:setup` run with the live site address, and `SHOPIFY_WEBHOOK_SECRET` in Vercel. Without
   them, changes only show after the next deploy.
4. **Can the site read it?** `pnpm shopify:setup --dry-run` reports any definition whose storefront access is off;
   run `pnpm shopify:setup` to fix it.
5. **Previews:** preview links use the same Shopify store, so they update the same way.

Pages, policies and blogs send no webhook. Refresh them with the `REVALIDATE_SECRET` password:

```sh
curl -X POST -H "Authorization: Bearer $REVALIDATE_SECRET" "https://<site>/api/revalidate?tag=pages&tag=policies"
```

Use `tag=blogs` the same way, and `tag=menus` if a developer has switched the header to Shopify menus (by default
menus come from `brand/config.ts` and update with a deploy). Up to 20 `tag=` values per request. Announcements with a start or
end time update within about 5 minutes of that time.

## A content block is not showing

Blocks hide themselves when their content is empty. Check:

- the feature switch in `brand/config.ts`;
- the content exists, is filled in, and is Active ([Content in Shopify](07-content-in-shopify.md));
- home sections have what their type needs (for example a `featured_collection` needs a collection picked);
- on products, the metafield is filled in on that product (not on a variant).

## Images don't load

Product and content images come straight from Shopify's image servers (`cdn.shopify.com`), not from Vercel.

- Check the image exists on the product in Shopify and opens in the admin.
- If only some images fail, re-upload them in Shopify.
- Images in `public/` (like the share image) must be in the `public/` folder and referenced with a leading `/`.

## Prices show the wrong currency

Prices always come from Shopify. If they show USD or another currency:

- Shopify → Settings → Store details → Store currency should be PKR.
- `brand/config.ts` → `localization.country` should be `"PK"`.
- If Shopify Markets is set up in the store, Pakistan must be in the market whose currency is PKR.

To switch between "Rs 4,999" and "PKR 4,999", change `localization.currencyDisplay`.

## The WhatsApp button is missing

- Check `features.whatsappButton` is `true` and `identity.whatsappNumber` is set.
- The button fades out on purpose while another button (like Add to Cart or quantity) is underneath it, so it never
  blocks buying. Scroll a little and it comes back.

## Claude Code says "Blocked: … is part of the shared base"

This is the safety hook in store repos: only `brand/`, `public/`, `docs/` and `.env.example` may change. The
request needs a base change; see [Working with Claude Code](02-working-with-claude-code.md#this-is-a-base-change).

## Meta Pixel or Google Analytics shows no data

- They only load on the **live site** (Vercel Production), never on previews or your computer.
- Check `NEXT_PUBLIC_META_PIXEL_ID` / `NEXT_PUBLIC_GA4_MEASUREMENT_ID` are set for **Production** and redeploy.
- To test elsewhere, a developer can set `ANALYTICS_FORCE_ENABLE=true` on one preview or locally. Never in
  Production.
- If the Shopify cookie banner is on, events wait until the shopper accepts.
- Purchases come from Shopify's checkout through the Facebook & Instagram and Google & YouTube apps, not from the site.

## Still stuck?

Open a **Bug** issue on GitHub with the page link, what you did, and a screenshot, or ask Claude Code to look at it.
