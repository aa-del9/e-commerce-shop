# 1. How this repo works

## Base and stores

There are two kinds of repositories (a repository, or "repo", is the folder of code that GitHub keeps):

- **The base** (`aa-del9/e-commerce-shop`): a neutral online store with no brand. It is built on Vercel's
  open-source `vercel/shop` template and set up for Pakistan: prices in rupees, cash on delivery, WhatsApp.
- **Store repos**: one per store, created from the base. Each store has its own name, colors, logo and
  Shopify store.

Improvements flow one way: `vercel/shop` → base → every store. When the base gets a fix, each store can pull
it in (Claude Code's `sync-from-base` skill does this). That only works smoothly if stores change as little as
possible outside their own folder.

The file `.repo-role` says which kind a repo is: `base` or `store`.

## The `brand/` folder

Everything that makes a store look and sound like itself lives in `brand/`:

| File or folder    | What it controls                                                                                                                      |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `brand/config.ts` | Store name, contacts, WhatsApp number, which features are on, delivery and COD wording, SEO, menu links ([guide](05-brand-config.md)) |
| `brand/theme.css` | Colors, corner roundness, shadows, heading sizes ([guide](06-theme-and-figma.md))                                                     |
| `brand/fonts.ts`  | Fonts                                                                                                                                 |
| `brand/assets/`   | Logo, favicon (the little browser-tab icon) and the image shown when a link is shared                                                 |
| `brand/pages/`    | The layout of each page: home, product, collection, search, cart, FAQ, contact, not found                                             |
| `brand/sections/` | Building blocks used on pages: announcement bar, WhatsApp button, product info blocks, home sections                                  |

In a store repo, Claude Code only edits `brand/`, `public/` (images and files served as-is), `docs/` and
`.env.example`. A safety check (a "hook") stops it from editing anything else unless a developer allows it.

## What lives where

| You want to change…                                                 | Where                                                                                |
| ------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Products, prices, stock, photos, collections, discounts             | **Shopify admin**                                                                    |
| Home page sections, FAQ, announcement bar, size charts, lookbooks   | **Shopify admin** → Content → Metaobjects ([guide](07-content-in-shopify.md))        |
| Product highlights, badges, preorder, delivery note                 | **Shopify admin** → the product → Metafields ([guide](07-content-in-shopify.md))     |
| Shipping rates, payment methods, checkout, taxes, policies          | **Shopify admin** → Settings                                                         |
| Store name, contacts, features, wording, colors, fonts, page layout | **Code**, in `brand/` (ask Claude Code)                                              |
| Tokens, passwords, tracking IDs, the site address                   | **Vercel** → Settings → Environment Variables ([guide](04-environment-variables.md)) |
| Domain name                                                         | **Vercel** → Domains, and **Shopify** → Settings → Domains for checkout              |

Rule of thumb: if it changes often or a shop assistant should be able to change it, it belongs in the Shopify
admin. If it changes how the site looks or behaves, it is code in `brand/`.

## What Shopify does and what this site does

Shopify owns the shop: products, cart, checkout, payments, customers and orders. This repo is only the
storefront, the part shoppers browse. When a shopper taps "Checkout", they continue on Shopify's checkout.
That is why payment methods, shipping rates and order emails are set up in Shopify, not here.

## Is it safe to change?

- **Safe:** anything in `brand/` through Claude Code, and anything in the Shopify admin. Every code change goes
  through a pull request with a preview link first, so nothing reaches the live site without review.
- **Needs a developer:** anything Claude Code calls "a base change" (see
  [Working with Claude Code](02-working-with-claude-code.md#this-is-a-base-change)).
- **Never:** pasting passwords or tokens into a chat, an issue or a code file. They go only into Vercel or into
  `.env.local` on your own computer.
