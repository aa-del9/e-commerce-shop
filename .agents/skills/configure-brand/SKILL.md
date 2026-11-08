---
name: configure-brand
description: Interview the product manager one question at a time and fill in brand/config.ts (store name, contacts, WhatsApp, address, social links, features, delivery/COD copy, SEO). Use when setting up a new store's identity or when the PM asks to change store details or turn features on or off.
---

# Configure the brand

`brand/config.ts` holds the store's identity, features and copy. Every field is explained in
`docs/05-brand-config.md`; the schema is `lib/brand/schema.ts`. Do not edit `lib/config/**`.

## Interview

Ask **one question per message**, in plain language, and show the current value as the default. Skip
questions the PM already answered. Accept "skip" and keep the current value.

1. Store name as shoppers see it, and the registered business name.
2. A one-line tagline (optional).
3. Support email and support phone.
4. WhatsApp number for customers. Convert local format to international: `0300 1234567` → `+923001234567`.
5. Business address (street, city, country).
6. Social profile links (Instagram, Facebook, TikTok, YouTube, X, Pinterest, LinkedIn). Full URLs.
7. Price style: "Rs 4,999" (`symbol`, default) or "PKR 4,999" (`code`).
8. Delivery estimate, cash-on-delivery line, free-delivery line, returns/exchange line. Remind the PM these
   are display text only; real rules live in Shopify (shipping rates, payment methods).
9. Features: read the list from `docs/05-brand-config.md` → Features and ask which to turn off. Explain each in
   one line. `i18n` and `markets` always stay `false`; `agent`, `botProtection` and `customerAccounts` need a
   developer, so only note the request.
10. SEO: default description (one sentence) and the title format (`%s | Store Name`).
11. Header and footer links (optional; defaults are fine for launch).

## Apply

1. Edit `brand/config.ts` with the answers. Keep keys alphabetized as the file already is.
2. Run `pnpm env:check`. It validates `brand/config.ts` and names the exact field to fix if anything is wrong.
   Fix it and run again until `✅ brand/config.ts is valid`.
3. If the store name changed, update the text in `brand/assets/og-image.svg` and `brand/assets/wordmark.svg`,
   then run `pnpm brand:assets` to regenerate the social image and icons.
4. Start `pnpm dev` and check the header, footer and a product page at 360px and 1280px
   (`pnpm screenshots / /contact`).

## Report

Tell the PM, in plain language:

- what changed on the site;
- which environment variables are still unset for Vercel: run `pnpm env:check` and list the ❌ and the
  relevant ➖ rows with the "Where" text from `docs/04-environment-variables.md`
  (for example `NEXT_PUBLIC_META_PIXEL_ID` if they want ads tracking);
- that the change goes live through the `ship-change` skill.
