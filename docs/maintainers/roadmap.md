# Roadmap and extension points

Out of scope for the base today. Each entry says where it would plug in so a future change lands in the
right owner. Ideas found during the base setup are at the end.

## Out of scope (by decision)

**Payment gateways and payment flows.** Shopify checkout owns payments. Online gateways for Pakistan (cards,
wallets) are installed as Shopify payment apps and appear in checkout without storefront code. If a
storefront-side flow is ever needed (for example a bank-transfer instructions page), it is a new route under
`app/` with copy in `brand/pages/`, reading order data only through Shopify. Never collect payment data in this
repo.

**Advance or partial payments.** Belongs in Shopify (deposit selling plans, draft orders, or a payments app).
The storefront already renders selling plans through upstream's `PurchaseOptions`; a deposit plan shows there
once it exists in Shopify.

**WhatsApp Cloud API automation.** Order notifications and chat automation run server-to-server from Shopify
webhooks to a separate service (Shopify Flow, an app, or a small worker). Not in the storefront. The storefront's
part stays the `wa.me` button (`brand/sections/whatsapp-button.tsx`).

**Order confirmation flows.** Shopify checkout's thank-you page and notifications own this. Customizations go
through checkout extensibility apps, not this repo.

**Courier integration (PostEx).** Fulfilment happens in Shopify (a courier app creates bookings from orders).
The storefront only shows delivery copy (`commerceCopy.deliveryEstimate`, `custom.delivery_note`).

**Order tracking page.** Would be a new route `app/track/page.tsx` + `brand/pages/track.tsx`, reading status
from the Customer Account API (logged-in) or a courier tracking API through a new `lib/<domain>/server.ts`
loader. Needs customer accounts or a server-side lookup with rate limiting.

**Product reviews.** Use a Shopify reviews app that writes product metafields or metaobjects; add the
definitions to `shopify/schema.ts` (`add-content-type`) and a section in the PDP `afterBuyButtons` slot. Review
JSON-LD goes in `components/product-detail/schema.tsx` (Next.js owner).

**Fit finder.** A brand section on the PDP reading the existing `size_chart` metaobject; recommendations need
body measurements input (client component) and no backend.

**Wishlist.** Logged-out: localStorage client component in `brand/sections/`. Synced: needs customer accounts
and a customer metafield (Customer Account API), defined in `shopify/schema.ts`.

**Back-in-stock alerts.** A Shopify app collects emails/phone numbers and sends alerts. The storefront shows the
app's form in the PDP slot when `availableForSale` is false.

**Ops/staff dashboard.** Shopify admin is the dashboard. Custom reporting belongs in a separate app, not the
storefront.

**Any database.** The storefront has none by design; Shopify metafields/metaobjects are the CMS (ADR 005).

**Urdu / i18n.** Use upstream's `enable-i18n` skill (next-intl, locale-prefixed URLs), then set
`features.i18n` handling in the schema. RTL needs `dir` on `<html>` and logical CSS properties in sections.

**Shopify Markets.** Use upstream's `enable-shopify-markets` skill. `brand.localization.country` would become a
default market rather than the only one.

**Customer accounts.** Supported upstream and off by default: set `features.customerAccounts: true` and the
three env vars (`docs/04-environment-variables.md`), then configure the Customer Account API callback URLs
(HTTPS only). See upstream `AGENTS.md` → Customer accounts.

## Deferred from this setup

**Meta Conversions API.** Browser events already carry a shared `event_id`. A sender would be a Route Handler
(`app/api/analytics/meta/route.ts`) called from the marketing destination for AddToCart, forwarding
`event_id`, value, content IDs, client IP, user agent and the `_fbp`/`_fbc` cookies to
`graph.facebook.com/<version>/<pixel>/events` with `META_CAPI_ACCESS_TOKEN`. It needs rate limiting and request
validation (it is a public endpoint). Run log R7.

**Sitemap entries for `/faq` and `/contact`.** Upstream's sitemap lists Shopify resources; the two base routes
could be added in `app/sitemap*` (Next.js owner).

**FAQPage JSON-LD.** Add a schema component under `components/schema/` and render it from the FAQ shell.

**Shopify menus by default.** Navigation comes from `brand/config.ts`. Upstream's `enable-shopify-menus` skill
switches to admin-managed menus (with `brand.navigation` as fallback) if PMs want to edit menus in Shopify.

**`fromMinorUnits` for PKR.** Upstream derives minor units from `Intl`, which reports 0 fraction digits for PKR
(ISO 4217 says 2). Only the Eve agent uses it; check before enabling the agent.

**Size chart rows as metaobjects.** If PMs find pipe-separated rows awkward, add a `size_chart_row`
metaobject (one entry per size) referenced from `size_chart`.

**Image `crop`/`height` parameters.** The loader only sets `width`; art-directed crops could pass `crop` and
`height` through a custom prop on a wrapper component.
