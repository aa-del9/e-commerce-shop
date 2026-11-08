# 7. Content in Shopify

Much of what shoppers read is edited in the Shopify admin, not in code. Shopify has two tools for this:

- **Metafields**: extra fields on a product, such as highlights or a size chart. Edit them on the product page
  in the admin, in the **Metafields** section near the bottom.
- **Metaobjects**: standalone content entries, such as FAQ questions or home page sections. Edit them in
  **Content → Metaobjects**.

These fields are created by `pnpm shopify:setup` (see [Setting up a new store](03-setting-up-a-new-store.md)).
Their definitions live in `shopify/schema.ts`.

Three rules to remember:

1. **Set entries to Active.** New metaobject entries start as **Draft** and don't show on the site. Change the
   status to **Active** when ready.
2. **Changes appear within seconds** once webhooks are set up (`pnpm shopify:setup` with the live site address,
   plus `SHOPIFY_WEBHOOK_SECRET` on Vercel). Without webhooks, edits only show after the next deploy.
3. **Empty means hidden.** Every block disappears when its content is empty, and each can also be switched off
   with a feature in `brand/config.ts` ([Brand config](05-brand-config.md#features)).

## Product metafields

Open a product in the admin → scroll to **Metafields**.

[screenshot: the Metafields section on a product in the Shopify admin]

| Field                                  | Type                    | What it does / where it shows                                                      | Feature switch   |
| -------------------------------------- | ----------------------- | ---------------------------------------------------------------------------------- | ---------------- |
| Highlights (`custom.highlights`)       | List of short texts     | Bullet list in a "Highlights" section under Add to Cart                            | `productDetails` |
| Materials (`custom.materials`)         | Multi-line text         | "Materials" section under Add to Cart                                              | `productDetails` |
| Care (`custom.care`)                   | Multi-line text         | "Care" section under Add to Cart                                                   | `productDetails` |
| Model info (`custom.model_info`)       | Short text              | Line under the price, like "Model is 183 cm and wears M"                           | `modelInfo`      |
| Badges (`custom.badges`)               | List of short texts     | Small labels under the price, like "New" or "Limited"                              | `badges`         |
| Size chart (`custom.size_chart`)       | Pick a Size chart entry | "Size chart" link that opens a drawer                                              | `sizeChart`      |
| Preorder (`custom.preorder`)           | True/false              | "Preorder" label under the price, and shows the dispatch note                      | `preorders`      |
| Drop at (`custom.drop_at`)             | Date and time           | "Drops 12-Mar-2027, 8:00 pm · in 3d 4h 0m" under the price, until that time        | `preorders`      |
| Dispatch note (`custom.dispatch_note`) | Short text              | Shown with a box icon when Preorder is on, like "Ships in the first week of March" | `preorders`      |
| Delivery note (`custom.delivery_note`) | Short text              | Replaces the store-wide delivery estimate for this product                         | `deliveryNotice` |

### Preorders and drops

- To let customers order something that is out of stock, turn on **Continue selling when out of stock** for each
  variant (product → variant → Inventory). This is per variant, in Shopify.
- The drop countdown is information only: it **does not block buying**. Until the drop, keep the product
  unpublished from the Headless channel, or keep it at zero stock with "continue selling" off.
- Payment for preorders is the normal checkout. Advance or partial payments are not supported.

## Metaobjects

Shopify admin → **Content → Metaobjects** → pick the type → **Add entry**.

[screenshot: the Metaobjects list in the Shopify admin]

### Size chart

A table attached to products through the product's **Size chart** field. One chart can serve many products.

| Field   | What to enter                                                                       |
| ------- | ----------------------------------------------------------------------------------- |
| Name    | Internal name and drawer title, like "Tops"                                         |
| Unit    | `cm` or `in`. When set, shoppers get a cm / inches switch and numbers are converted |
| Columns | Column headings, the first being the size: `Size`, `Width`, `Length`                |
| Rows    | One entry per size, cells separated by `\|`: `S \| 50 \| 68`, `M \| 53 \| 70`       |
| Note    | Optional text under the table, like "Measurements are approximate."                 |

### FAQ item

Each entry is one question on the `/faq` page (feature `faqPage`).

| Field      | What to enter                                        |
| ---------- | ---------------------------------------------------- |
| Question   | The question                                         |
| Answer     | The answer (line breaks are kept)                    |
| Category   | Optional group heading, like "Delivery" or "Returns" |
| Sort order | Lower numbers show first                             |

### Announcement

The bar above the header (feature `announcementBar`). The first live announcement shows.

| Field               | What to enter                                                               |
| ------------------- | --------------------------------------------------------------------------- |
| Text                | The message, short enough for a phone screen                                |
| Link                | Optional: a site path like `/collections/sale` or a full `https://` address |
| Starts at / Ends at | Optional time window. Outside it, the bar hides                             |

Scheduled start and end times take effect within about 5 minutes (Shopify sends no notification when a time
window opens or closes, so the site checks again around those times).

### Home section

Each entry is one block on the home page, shown in **Sort order** (lower first). The first section is the top of
the page. If there are no Active home sections, the home page shows the store name, tagline and the latest
products.

| Field            | What to enter                                                                 |
| ---------------- | ----------------------------------------------------------------------------- |
| Section type     | `hero`, `featured_collection`, `product_grid`, `image_text` or `lookbook`     |
| Heading, Body    | Text for the section                                                          |
| Image            | For `hero` and `image_text`                                                   |
| Link, Link label | Button: a site path like `/collections/new` and its text (default "Shop now") |
| Collection       | For `featured_collection`                                                     |
| Lookbook         | For `lookbook`: pick a Lookbook entry                                         |
| Sort order       | Position on the page                                                          |

What each type needs to show up:

| Type                  | Shows                                                    | Needs                              |
| --------------------- | -------------------------------------------------------- | ---------------------------------- |
| `hero`                | Big banner with optional image, heading, text and button | A heading or an image              |
| `featured_collection` | Up to 8 products from a collection, with "View All"      | A collection                       |
| `product_grid`        | The first 8 products of "All products"                   | Nothing (heading optional)         |
| `image_text`          | Image beside heading, text and button                    | An image plus a heading or text    |
| `lookbook`            | Lookbook photos and its products                         | A lookbook with photos or products |

### Lookbook

A set of photos and products, shown through a `lookbook` home section.

| Field    | What to enter                                                  |
| -------- | -------------------------------------------------------------- |
| Title    | Name, used as the section heading if the home section has none |
| Images   | Photos                                                         |
| Products | Products to show under the photos                              |

## Content not managed here

- Products, prices, stock, collections, discounts: the usual Shopify product and collection pages.
- Policies (refund, privacy, terms, shipping): Settings → Policies. The footer links to them.
- Header and footer links: `brand/config.ts` → navigation ([Brand config](05-brand-config.md#navigation)).
- Store-wide delivery, COD and returns wording: `brand/config.ts` → commerceCopy.

Need a new kind of content (for example a "fabric weight" field)? That is a base change: ask Claude Code to use the
`add-content-type` skill, or request it from the base maintainer.
