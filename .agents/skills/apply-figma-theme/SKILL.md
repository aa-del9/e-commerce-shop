---
name: apply-figma-theme
description: Read color, radius, shadow and typography variables and styles from a Figma file URL through the Figma MCP server and write them into brand/theme.css and brand/fonts.ts. Use when the PM shares a Figma file and asks to apply its look, colors or fonts to the store.
---

# Apply a Figma theme

Tokens live in `brand/theme.css` (values) and `brand/fonts.ts` (font loading). `app/globals.css` maps them to
Tailwind and must not change for a theme. See `docs/06-theme-and-figma.md`.

## Before you start

- The Figma MCP server (`figma` in `.mcp.json`) must be connected. If its tools are missing, tell the PM to run
  `/mcp`, choose **figma**, and sign in with the Figma account that can open the file. Stop until it works.
- Ask for the Figma file URL if it was not given.

## Steps

1. Read the file's variables and styles through the Figma MCP (variable definitions, color styles, text
   styles, effect styles). Prefer variables over raw layer values.
2. Map them onto the existing tokens. Every token in `brand/theme.css` must keep a value:

   | Token | Typical Figma source |
   | --- | --- |
   | `--background`, `--foreground` | page background, body text |
   | `--card`, `--popover` (+ `-foreground`) | surface / elevated surface |
   | `--primary`, `--primary-foreground` | primary button fill and its text |
   | `--secondary`, `--accent`, `--muted` (+ `-foreground`) | secondary fills, hover fills, subdued text |
   | `--border`, `--input`, `--ring` | dividers, input fill, focus ring |
   | `--destructive`, `--positive`, `--warning*` | error, success, warning colors |
   | `--overlay` | scrim behind drawers and dialogs (usually black) |
   | `--radius` | the most common corner radius (the `lg` step) |
   | `--shadow-floating-value` | floating button shadow |
   | `--text-scale-display`, `--text-scale-display-mobile` | largest heading sizes |

3. Write hex (or `oklch()`) values into `brand/theme.css`. Keep comments and token names unchanged.
4. Fonts: if Figma uses Google fonts, change the imports in `brand/fonts.ts` (`next/font/google`, keep the
   `--font-brand-sans` / `--font-brand-mono` variable names). For custom font files, put them in
   `brand/assets/fonts/` and use `next/font/local`. Ask the PM to confirm they have a license for web use.
5. Check contrast: text on `--primary`, `--background` and `--muted` should reach WCAG AA (4.5:1). Report
   any pair that fails instead of silently changing the design.
6. Run `pnpm dev`, then `pnpm screenshots / /products/<a-product-handle> /cart` and look at both widths.
7. Run `pnpm verify`.

## Report

List what was applied, and **every Figma token you could not map** (name, value, why), so the PM can decide.
Never invent tokens in `app/globals.css` for a single store; if the design truly needs a new token type,
that is a base change.
