# 8. Launch checklist

Work through this before sending real customers to the store. Tick each item in your launch pull request or
issue. Steps marked "Shopify" happen in the Shopify admin; "Vercel" in the Vercel dashboard.

## Store setup

- [ ] `pnpm shopify:setup` has run against the live store with the final site address (webhooks registered).
- [ ] Vercel: `SHOPIFY_WEBHOOK_SECRET` is set (the setup app's client secret). Edit a product and confirm the
      change shows on the site within a minute.
- [ ] Vercel: `REVALIDATE_SECRET` is set (a long random password), so menus, pages and policies can be refreshed
      ([how](09-troubleshooting.md#my-shopify-edit-doesnt-show-on-the-site)).
- [ ] `pnpm env:check` shows ✅ for everything required ([Environment variables](04-environment-variables.md)).
- [ ] `brand/config.ts` is final: name, contacts, WhatsApp number (send it a test message), address, wording.
- [ ] Logo, favicon and share image replaced, and `pnpm brand:assets` run.
- [ ] Sample content from `pnpm shopify:seed` deleted or replaced (entries whose handle starts with
      `base-sample-`).

## Domains

- [ ] Vercel: store domain added and verified; `NEXT_PUBLIC_SITE_URL` set to it (Production).
- [ ] Shopify: checkout subdomain (`checkout.<your-domain>`) set up and working
      ([steps](03-setting-up-a-new-store.md#8-domains-and-checkout)).
- [ ] Shopify: the `myshopify.com` online store password page is not what shoppers land on (all links point to
      the Vercel domain).

## Shopify settings

- [ ] Shipping zones and rates for Pakistan (Settings → Shipping and delivery).
- [ ] Taxes reviewed with your accountant (Settings → Taxes and duties).
- [ ] Policies written: refund, privacy, terms of service, shipping (Settings → Policies). They appear in the footer.
- [ ] Checkout branding: logo, colors, fonts (Settings → Checkout → Customize).
- [ ] Order notification emails show the right store name and contact details (Settings → Notifications).
- [ ] Products, collections and prices are final; every product is available on the **Headless** sales channel.
- [ ] Preorder products: "Continue selling when out of stock" set per variant where intended.

## Payments: decision pending

> **Not decided yet.** Online payment gateways (cards, wallets, bank transfer integrations) are out of scope for
> this base for now. Do not add payment code to the site; payments always happen in Shopify's checkout.

- [ ] Decide which payment methods to offer at launch (owner decision).
- [ ] **Cash on Delivery** is ready to switch on: Shopify → Settings → Payments → Manual payment methods →
      **Cash on Delivery (COD)** → Activate. The site already shows the COD notice (`features.codNotice`).
- [ ] If online payments are chosen later, they are set up in Shopify (Settings → Payments), not in this repo.

## Analytics and tracking

- [ ] Vercel (Production only): `NEXT_PUBLIC_META_PIXEL_ID` and/or `NEXT_PUBLIC_GA4_MEASUREMENT_ID`, if used.
      They load only on the live site, never on previews.
- [ ] `brand/config.ts` → `analytics.shopify` set to `true` if you want Shopify's built-in analytics.
- [ ] Purchase tracking: install Shopify's **Facebook & Instagram** and **Google & YouTube** apps; purchases are
      reported from Shopify's checkout by those apps.
- [ ] `ANALYTICS_FORCE_ENABLE` is **not** set in Production.

## Test orders

- [ ] Place a test order with Cash on Delivery (or a test gateway) from a phone, start to finish.
- [ ] Add to cart, change quantity, remove an item, apply a discount code.
- [ ] Cancel and archive test orders afterwards.

## Look and feel

- [ ] Home, a collection, a product, search, cart, FAQ and contact pages checked at 360px (phone) and 1280px
      (laptop) on the preview link, and on a real Android phone.
- [ ] WhatsApp button opens a chat with the right number and, on product pages, the product link.
- [ ] Announcement bar, size chart, badges and delivery notices show where expected.

## Safety and costs

- [ ] Vercel: spend management budget and alerts at 50%, 75% and 90%
      ([settings](maintainers/repo-setup.md#vercel-project-one-per-store)).
- [ ] Vercel: Firewall bot protection on.
- [ ] GitHub: `main` is protected ([settings](maintainers/repo-setup.md)).

## Search engines

- [ ] Visit `https://<your-domain>/robots.txt` and `/sitemap.xml`; both load and use your domain.
- [ ] Share a product link in WhatsApp: the preview shows the right image and title.
- [ ] Submit the sitemap in Google Search Console.
