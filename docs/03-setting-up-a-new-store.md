# 3. Setting up a new store

From nothing to a running store. Claude Code's `new-store-checklist` skill walks you through these steps one at a
time. Plan about half a day, most of it waiting on Shopify and domain settings.

You will need: a GitHub account with access to the base repo, a Shopify store (a free development store is fine
for building), a Vercel account, and the store's domain name.

## 1. Create the store repo

Pick one option. Both keep the link to the base so improvements can flow in later.

- **Private repo with a `base` remote (recommended).** GitHub does not allow a fork of a public repo to be
  private, and a store usually should be. Create an empty private repo on GitHub, then Claude Code (or a
  developer) copies the base into it and adds the base as a second source called `base`:

  ```sh
  git clone https://github.com/aa-del9/e-commerce-shop.git my-store
  cd my-store
  git remote rename origin base
  git remote add origin https://github.com/<you>/my-store.git
  git push -u origin main
  ```

- **GitHub fork.** Click **Fork** on the base repo. Simple, and GitHub's **Sync fork** button pulls updates, but
  the fork is public if the base is public.

Then mark the repo as a store and commit it:

```sh
echo store > .repo-role
```

From now on Claude Code only edits the brand layer in this repo ([why](01-how-this-repo-works.md)).

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

## 7. Brand the store

1. Run the `configure-brand` skill: name, contacts, WhatsApp, address, wording, features.
2. Update `brand/assets/` (logo, favicon, share image) and run `pnpm brand:assets` to regenerate the icons and the
   share image.
3. Apply the design: `apply-figma-theme` for colors and fonts, `build-section-from-figma` for custom sections.
   See [Theme and Figma](06-theme-and-figma.md).

## 8. Domains and checkout

1. Add the store domain in Vercel → Project → Domains and update `NEXT_PUBLIC_SITE_URL`.
2. **Checkout domain:** checkout runs on Shopify. Add a `checkout.<your-domain>` CNAME record pointing to
   Shopify (`shops.myshopify.com`), add `checkout.<your-domain>` in Shopify → Settings → Domains, and make it
   the primary domain for the online store. Only the checkout subdomain points to Shopify; the main domain stays
   on Vercel. Guide: [Redirect traffic to your headless storefront](https://shopify.dev/docs/storefronts/headless/hydrogen/migrate/redirect-traffic).
3. Re-run `pnpm shopify:setup` if the site address changed, so webhooks point to the right place.

Then work through the [launch checklist](08-launch-checklist.md).
