# 5. Brand config

`brand/config.ts` is the one file that holds the store's identity, features and wording. The easiest way to
fill it in is the `configure-brand` skill, which asks you one question at a time.

The file is checked automatically when the site starts (`pnpm dev`), when Vercel builds it, and when you run
`pnpm env:check`. If something is wrong, you get a message naming the exact field and the fix, for example:

```
brand/config.ts has a problem:
  • identity.whatsappNumber: Use a Pakistani mobile number in international format: +92, then the number without its leading 0, like +923001234567
```

Prices, stock and shipping rules always come from Shopify. Everything in this file is display only.

## identity

| Field            | What it is                                                                                                                          | Example                                                               |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| `name`           | Store name shoppers see (header, page titles, footer)                                                                               | `"Example"`                                                           |
| `legalName`      | Registered business name                                                                                                            | `"Example (Private) Limited"`                                         |
| `tagline`        | One short line, shown on the default home page                                                                                      | `"Everyday essentials, delivered."`                                   |
| `siteUrl`        | Optional. Leave out to use `NEXT_PUBLIC_SITE_URL` / the Vercel domain                                                               | `"https://www.example.pk"`                                            |
| `supportEmail`   | Customer support email (Contact page)                                                                                               | `"help@example.pk"`                                                   |
| `supportPhone`   | Support phone in international format (Contact page)                                                                                | `"+924212345678"`                                                     |
| `whatsappNumber` | WhatsApp for customers. For Pakistan: `+92` then the mobile number without the leading 0                                            | `"+923001234567"`                                                     |
| `address`        | `line1`, optional `line2`, `city`, optional `region` and `postalCode`, `country` (Contact page)                                     | `{ line1: "12 Main Boulevard", city: "Lahore", country: "Pakistan" }` |
| `social`         | Full profile links, any of `instagram`, `facebook`, `tiktok`, `youtube`, `x`, `pinterest`, `linkedin`. Shown as icons in the footer | `{ instagram: "https://instagram.com/example" }`                      |

## localization

| Field             | What it is                                                                                 | Default          |
| ----------------- | ------------------------------------------------------------------------------------------ | ---------------- |
| `country`         | Country used when asking Shopify for prices and availability                               | `"PK"`           |
| `language`        | Language code sent to Shopify                                                              | `"EN"`           |
| `locale`          | Formatting style for numbers and dates                                                     | `"en-PK"`        |
| `currency`        | The store's currency in Shopify. Prices always use Shopify's own currency; this is a check | `"PKR"`          |
| `currencyDisplay` | `"symbol"` shows **Rs 4,999**; `"code"` shows **PKR 4,999**                                | `"symbol"`       |
| `timeZone`        | Time zone for drop dates and countdowns                                                    | `"Asia/Karachi"` |

## features

Each feature is `true` (on) or `false` (off). Turning a feature off never deletes anything; it just hides it.
Blocks that depend on Shopify content also hide themselves when that content is empty.

| Feature            | What it does / where it shows                                                                                                                                     | Default |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| `announcementBar`  | Bar above the header with the current announcement from Shopify                                                                                                   | on      |
| `whatsappButton`   | Round WhatsApp button at the bottom right of every page; on product pages the message includes the product name and link. Also shows WhatsApp on the Contact page | on      |
| `sizeChart`        | "Size chart" link and drawer on product pages that have a size chart                                                                                              | on      |
| `productDetails`   | Highlights, Materials and Care sections on product pages                                                                                                          | on      |
| `modelInfo`        | Line like "Model is 183 cm and wears M" under the price                                                                                                           | on      |
| `badges`           | Small labels like "New" or "Limited" under the price                                                                                                              | on      |
| `preorders`        | "Preorder" label, drop date countdown and dispatch note on product pages                                                                                          | on      |
| `codNotice`        | Cash-on-delivery line on product pages (`commerceCopy.codNotice`)                                                                                                 | on      |
| `deliveryNotice`   | Delivery estimate, free-delivery and returns lines on product pages                                                                                               | on      |
| `faqPage`          | The `/faq` page (shows "not found" when off; remove the footer link too)                                                                                          | on      |
| `predictiveSearch` | Search button and instant results in the header                                                                                                                   | on      |
| `relatedProducts`  | "You May Also Like" and "Pairs Well With" on product pages                                                                                                        | on      |
| `bundles`          | Shopify bundle contents on product pages (only for stores using Shopify Bundles)                                                                                  | off     |
| `customerAccounts` | Customer sign-in and order history. **Needs a developer** and three extra settings                                                                                | off     |
| `agent`            | AI shopping assistant. **Needs a developer**; costs money per conversation                                                                                        | off     |
| `botProtection`    | Vercel BotID for the assistant. **Needs a developer**                                                                                                             | off     |
| `i18n`             | Multiple languages. **Must stay `false`**; it is a developer project                                                                                              | off     |
| `markets`          | Multiple countries and currencies. **Must stay `false`**; it is a developer project                                                                               | off     |

## commerceCopy

Short texts shown on product pages. They describe your policies; the real rules are set in Shopify.

| Field                 | Example                                                                          |
| --------------------- | -------------------------------------------------------------------------------- |
| `codNotice`           | `"Cash on delivery available across Pakistan."`                                  |
| `deliveryEstimate`    | `"Delivered in 3–5 working days."` (a product's own delivery note replaces this) |
| `freeDeliveryMessage` | `"Free delivery on orders over Rs 5,000."`                                       |
| `returnsSummary`      | `"Easy exchanges within 7 days of delivery."`                                    |

Leave a text empty (`""`) to hide that line.

## seo

| Field                | What it is                                                        | Example                                   |
| -------------------- | ----------------------------------------------------------------- | ----------------------------------------- |
| `titleTemplate`      | Browser tab and Google title; `%s` is replaced by the page title  | `"%s \| Example"`                         |
| `defaultDescription` | One sentence about the store for Google and link previews         | `"Shop … with delivery across Pakistan."` |
| `defaultOgImage`     | Image shown when a link is shared (1200×628), a file in `public/` | `"/og-default.png"`                       |
| `themeColor`         | Browser bar color on phones                                       | `"#ffffff"`                               |
| `twitterHandle`      | Optional, starts with `@`                                         | `"@example"`                              |

## navigation

| Field    | What it is                                                                     |
| -------- | ------------------------------------------------------------------------------ |
| `main`   | Header links. Each has `title`, `url` and optional `items` (a dropdown)        |
| `footer` | Up to 5 footer columns. Each has a `title`, optional `url` and `items` (links) |

Links can be site paths (`"/collections/new"`) or full addresses (`"https://…"`). Example:

```ts
navigation: {
  main: [
    { title: "New in", url: "/collections/new" },
    { title: "Shop", url: "/collections/all" },
  ],
  footer: [
    { title: "Help", items: [{ title: "FAQ", url: "/faq" }, { title: "Contact", url: "/contact" }] },
  ],
},
```

Footer policy links (refund, privacy, terms, shipping) come from Shopify automatically.

## analytics

| Field                  | What it is                                                                   | Default |
| ---------------------- | ---------------------------------------------------------------------------- | ------- |
| `shopify`              | Shopify's own visitor and sales analytics (Shopify admin → Analytics)        | off     |
| `shopifyConsentBanner` | Shopify's cookie consent banner. Usually not needed for Pakistan-only stores | off     |
| `vercel`               | Vercel Web Analytics (may cost money on Vercel)                              | off     |
| `speedInsights`        | Vercel Speed Insights (may cost money on Vercel)                             | off     |

Meta Pixel and Google Analytics 4 are not set here: add their IDs as environment variables
(see [Environment variables](04-environment-variables.md)). They only load on the live site.
