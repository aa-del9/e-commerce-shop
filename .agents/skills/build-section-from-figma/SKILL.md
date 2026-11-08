---
name: build-section-from-figma
description: Build or update a brand/sections component from a Figma frame URL using components/ui primitives and theme tokens only, wire it into a brand page, and check it at 360px and 1280px. Use when the PM shares a Figma frame and asks to build or change a part of a page.
---

# Build a section from Figma

Sections are presentational components in `brand/sections/`. Pages in `brand/pages/` compose them. Read
`docs/ai/brand-layer.md` first: sections never fetch data, mutate the cart, or hard-code colors or prices.

## Steps

1. Ask for the Figma frame URL (a link to one frame, with `node-id`) and which page it belongs on.
2. Read the frame through the Figma MCP (`figma` server). If it is not connected, ask the PM to run `/mcp` and
   sign in. Fetch the design context and a screenshot of the frame.
3. Identify the content:
   - **Fixed copy** (headings that never change): inline in the component, like upstream.
   - **Store-wide text** already in `brand/config.ts` (contacts, delivery copy): read it from `brand`.
   - **Merchant-edited content** (images, headings the PM changes often): use an existing content type
     (`home_section`, `lookbook`, product metafields). If none fits, stop: a new content type is a base change
     (`add-content-type`).
   - **Products, prices, collections**: reuse `ProductCard`, `ProductsGrid`, `Price`, and data a base `get*`
     loader returns.
4. Build the component:
   - Use `components/ui` primitives (`Button`, `Badge`, `Accordion`, `Sheet`, `Container`, `Sections`, `Link`).
   - Use token utilities only (`bg-primary`, `text-muted-foreground`, `rounded-lg`, `shadow-floating`). If the
     design uses a color that is not a token, map it to the closest token and report it; do not write hex.
   - Images: `next/image` with width/height and `sizes="100vw"` (Shopify CDN handles resizing).
   - Mobile first: design for 360px, then add `md:`/`lg:` styles.
   - Named export, `kebab-case.tsx` file, `PascalCase` component, props interface `<Name>Props`.
5. Render it from the right `brand/pages/*.tsx`. Do not touch `app/**` route shells.
6. Check: `pnpm dev`, then `pnpm screenshots <path>`; compare both widths with the Figma frame. Fix spacing
   using values nearby code already uses.
7. Run `pnpm verify`.

## Report

Show the PM the screenshots, list any design value you mapped to a different token, and anything you could not
build without a base change.
