# 3. Setting up a new store

From nothing to a running store. Claude Code's `new-store-checklist` skill walks you through these steps one at a
time. Plan about half a day, most of it waiting on Shopify and domain settings.

You will need: a GitHub account with access to the base repo, a Shopify store (a free development store is fine
for building), a Vercel account, and the store's domain name.

## 1. Create the store repo

The store gets its own repo in your GitHub account, holding a copy of the base. The copy keeps a link to the base
so improvements can flow in later.

1. On GitHub, create a **new empty repository** in your account or organization (no README, no license, no
   .gitignore). Private is fine.
2. Copy the base into it and keep the base as a second source called `base`:

   ```sh
   git clone https://github.com/aa-del9/e-commerce-shop.git my-store
   cd my-store
   git remote rename origin base
   git remote add origin https://github.com/<you>/my-store.git
   git push -u origin main
   gh repo set-default <you>/my-store   # pull requests go to the store repo, never the base
   ```

3. Mark the repo as a store and commit it:

   ```sh
   echo store > .repo-role
   git add .repo-role && git commit -m "chore: mark this repo as a store"
   git push
   ```

   From now on Claude Code only edits the brand layer in this repo ([why](01-how-this-repo-works.md)).

4. Open the repo's **Actions** tab on GitHub and check that the **CI** workflow ran on that push. If Actions is
   switched off for the account, turn it on (Settings → Actions → General); without it, pull requests show no
   checks. The checks run on your account's Actions minutes.
5. `.github/CODEOWNERS` names the base maintainer (`@aa-del9`). If you turn on "require review from code owners",
   ask the maintainer whether to keep it or replace the name; this file is a base file, so change it only as an
   agreed base change.

Base updates arrive through the `sync-from-base` skill, which pulls from the `base` source.

## 2. Set up Shopify

1. Create the Shopify store (or a development store from your Shopify Partner or organization account).
2. Set the store currency to **PKR**: Settings → Store details → Store currency.
3. Install the **Headless** sales channel: Shopify App Store → search "Headless" → Install. Open
   **Sales channels → Headless → Create storefront**.
   [screenshot: the Headless channel's storefront page]
4. In that storefront, open **Storefront API** and copy the **Public access token**. Make sure the permissions
   include products, collections, cart, metaobjects and metafields reading.
5. Note the store's `your-store.myshopify.com` address (Settings → Domains).

## 3. Give the setup script admin access

`pnpm shopify:setup` creates the store's content fields in Shopify (see [Content in Shopify](07-content-in-shopify.md)).
It needs admin access, used only on your computer and never by the live site.

Since 1 January 2026, new "custom apps" can no longer be created inside the Shopify admin. Use the Dev Dashboard:

1. Shopify admin → **Settings → Apps → Develop apps → Build apps in Dev Dashboard** → **Create app**.
2. Create a **version**: any app URL (for example `https://shopify.dev/apps/default-app-home`), and under
   **Access** add these scopes: `read_products`, `write_products`, `read_metaobject_definitions`,
   `write_metaobject_definitions`, `read_metaobjects`, `write_metaobjects`. **Release** the version.
3. Under **Installs**, install the app on your store. The app and the store must belong to the same Shopify
   organization.
4. In the app's **Settings**, copy the **Client ID** and **Client secret**.
5. On your computer, add them to `.env.local` (copy `.env.example` to `.env.local` first if it doesn't exist):

   ```
   SHOPIFY_STORE_DOMAIN="your-store.myshopify.com"
   SHOPIFY_ADMIN_CLIENT_ID="…"
   SHOPIFY_ADMIN_CLIENT_SECRET="…"
   ```

   The script trades these for a temporary admin token (valid 24 hours) each time it runs. If you already have
   an admin token from an older custom app, put it in `SHOPIFY_ADMIN_API_ACCESS_TOKEN` instead.

Guides: [Install and set up apps](https://help.shopify.com/en/manual/apps/install-setup-apps) ·
[Client credentials grant](https://shopify.dev/docs/apps/build/authentication-authorization/client-credentials-grant)

## 4. Run the site on your computer (optional)

1. In `.env.local`, fill in `NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN` and `NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN`.
2. Run `pnpm env:check`. Once the domain and token work, it prints your **shop ID**; copy it into
   `NEXT_PUBLIC_SHOPIFY_SHOP_ID`.
3. Run `pnpm dev` and open http://localhost:3000. Until everything required is set, you see a setup page listing
   what is missing.

## 5. Create the Vercel project

1. In Vercel, **Add New → Project** and import the store repo. Keep the defaults.
2. Add the environment variables from [Environment variables](04-environment-variables.md). The table says which
   are required and which Vercel environments (Production, Preview, Development) to tick.
3. Deploy. Vercel builds stop with a readable list if a required variable is missing.
4. Follow the Vercel settings in [Repo and Vercel setup](maintainers/repo-setup.md) (spend alerts, firewall).

## 6. Create the content fields in Shopify

1. Set `NEXT_PUBLIC_SITE_URL` in `.env.local` to the store's public `https://` address (not localhost); webhooks
   need it.
2. Preview: `pnpm shopify:setup --dry-run`. It lists the definitions and webhooks it would create.
3. Apply: `pnpm shopify:setup`. It never deletes anything and is safe to run again. At the end it prints a
   checklist of manual admin steps.
4. **Webhook secret:** webhooks (Shopify's change notifications) registered by the script are signed with the
   app's **Client secret**. Put that same value in `SHOPIFY_WEBHOOK_SECRET` on Vercel, so content edits show on
   the site within seconds.
5. Optional: `pnpm shopify:seed` adds a few neutral sample entries (an announcement, 3 FAQs, 2 home sections and
   a size chart) so you can see every block. It never touches products or orders. Delete them before launch.

## 7. Test with the real store

Before branding or showing anyone the site, check that the base works with this Shopify store. Most of this was
only tested against Shopify's demo data, so this run is the real test. Use the Vercel preview (or `pnpm dev`)
with the sample content from step 6 and at least two real test products.

On one test product, fill in its metafields in the Shopify admin (product → **Metafields**): highlights, badges,
a size chart, preorder plus a drop date in the future, and a delivery note.

| Check                        | What you should see                                                                                                                                                                                                                           |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm env:check`             | ✅ for brand config and the three required Shopify values                                                                                                                                                                                     |
| `pnpm shopify:setup`         | Finishes without errors. The definitions appear in Shopify admin → Settings → Custom data. Run `pnpm shopify:setup --dry-run` again: it should say everything is already up to date (webhooks created by the app are not listed in the admin) |
| Home page                    | The sample hero and "New arrivals" sections. Set them to Draft and the page falls back to the store name and a product grid                                                                                                                   |
| Announcement bar             | The sample announcement above the header                                                                                                                                                                                                      |
| FAQ page (`/faq`)            | The 3 sample questions, grouped by category                                                                                                                                                                                                   |
| Product page (test product)  | Badges, Preorder label, drop countdown, size chart drawer with cm/inch switch, delivery note, COD notice, Highlights accordion                                                                                                                |
| Product page (other product) | No empty boxes or headings where content is missing                                                                                                                                                                                           |
| Prices                       | Shown as `Rs 4,999` (no decimals) on product, collection, cart and search pages                                                                                                                                                               |
| Cart and checkout            | Add to cart works; **Checkout** opens Shopify's checkout with the same items                                                                                                                                                                  |
| Live updates                 | Change the announcement text in Shopify; the site shows it within about a minute without a redeploy                                                                                                                                           |
| WhatsApp button              | Opens WhatsApp with the store number; on a product page the message includes the product name and link                                                                                                                                        |
| Phone and desktop            | Every page above looks right on a phone and on a laptop                                                                                                                                                                                       |

Claude Code can run the automated part for you: `BASE_URL=<preview link> pnpm test:e2e` (home page, product page,
add to cart, checkout link) and `pnpm screenshots` for phone and desktop screenshots.

If a check fails, open a **Something is broken** issue on the base repo with the page link and a screenshot. Fixes
belong in the base, so every store gets them.

## 8. Brand the store

1. Run the `configure-brand` skill: name, contacts, WhatsApp, address, wording, features.
2. Update `brand/assets/` (logo, favicon, share image) and run `pnpm brand:assets` to regenerate the icons and the
   share image.
3. Apply the design: `apply-figma-theme` for colors and fonts, `build-section-from-figma` for custom sections.
   See [Theme and Figma](06-theme-and-figma.md).

## 9. Domains and checkout

1. Add the store domain in Vercel → Project → Domains and update `NEXT_PUBLIC_SITE_URL`.
2. **Checkout domain:** checkout runs on Shopify. Add a `checkout.<your-domain>` CNAME record pointing to
   Shopify (`shops.myshopify.com`), add `checkout.<your-domain>` in Shopify → Settings → Domains, and make it
   the primary domain for the online store. Only the checkout subdomain points to Shopify; the main domain stays
   on Vercel. Guide: [Redirect traffic to your headless storefront](https://shopify.dev/docs/storefronts/headless/hydrogen/migrate/redirect-traffic).
3. Re-run `pnpm shopify:setup` if the site address changed, so webhooks point to the right place.

Then work through the [launch checklist](08-launch-checklist.md).
