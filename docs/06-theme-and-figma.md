# 6. Theme and Figma

The store's look comes from **design tokens**: named values like "primary color" or "corner roundness". Change a
token once and every button, card and drawer that uses it follows.

## How tokens work

1. **`brand/theme.css`** holds the values (for example `--primary: #111111;`). This is the file you change.
2. **`app/globals.css`** (shared base, don't edit) connects each token to a styling name.
3. Components use those names, such as `bg-primary` (primary background) or `rounded-lg` (standard corners).

So no color is written inside a component; everything points back to `brand/theme.css`. The base ships a
neutral black-and-white look that is meant to be replaced.

There is no dark mode: the template does not support one.

## Tokens

| Token                                                 | Used for                                                                                      |
| ----------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `--background`, `--foreground`                        | Page background and main text                                                                 |
| `--card`, `--popover` (and `-foreground`)             | Cards, menus and popups                                                                       |
| `--primary`, `--primary-foreground`                   | Main buttons (Add to Cart, Checkout) and their text; the announcement bar and WhatsApp button |
| `--secondary`, `--accent` (and `-foreground`)         | Secondary buttons, hover backgrounds                                                          |
| `--muted`, `--muted-foreground`                       | Quiet backgrounds and grey text                                                               |
| `--border`, `--input`, `--ring`                       | Lines, input fields, keyboard focus outline                                                   |
| `--destructive`, `--positive`, `--warning…`           | Error, success and warning messages                                                           |
| `--overlay`                                           | The dim layer behind drawers and popups                                                       |
| `--radius`                                            | Corner roundness (`0` for square, `0.5rem` default, `1rem` very round)                        |
| `--shadow-floating-value`                             | Shadow under floating buttons                                                                 |
| `--text-scale-display`, `--text-scale-display-mobile` | Size of the biggest headings on desktop and phone                                             |
| `--font-body`, `--font-code`                          | Which font each text style uses (from `brand/fonts.ts`)                                       |

## Fonts

Fonts are loaded in `brand/fonts.ts`. Google Fonts are downloaded at build time and served from the store's own
domain, so shoppers don't load anything from Google. For a paid or custom font, put the files in
`brand/assets/fonts/` and ask Claude Code to switch to them. Make sure the license allows web use.

## Logo, favicon and share image

The source files are in `brand/assets/`:

- `wordmark.svg`: the logo (the header shows the store name as text by default; ask Claude Code to switch to the logo file).
- `favicon.svg`: the small icon in browser tabs and on phone home screens.
- `og-image.svg`: the image shown when someone shares a link (1200×628).

After changing them, run `pnpm brand:assets`. It regenerates the favicon, app icons and share image in the formats
browsers and social apps need.

## Applying a Figma design

Connect Figma first (see [Working with Claude Code](02-working-with-claude-code.md#connecting-figma-and-shopify-docs-mcp)).

**Whole look (colors, fonts, roundness):** ask "apply the theme from this Figma file: <link>". The
`apply-figma-theme` skill reads the file's variables and styles, writes `brand/theme.css` and `brand/fonts.ts`, checks
text contrast, and lists any design value it couldn't match to a token. It works best when the Figma file uses
named color and text styles (or variables) rather than one-off colors.

**One section (a hero, a banner, a feature row):** select the frame in Figma, copy its link (it includes
`node-id=`), and ask "build this section on the home page: <link>". The `build-section-from-figma` skill builds it
in `brand/sections/` using only the shared building blocks and tokens, places it on the page, and screenshots it.

If a section shows content you want to edit often (images, headings), say so: it will use Shopify content
(see [Content in Shopify](07-content-in-shopify.md)), or tell you a new content type is needed (a base change).

## Checking phone and desktop

Every visual change is checked at **360px** (a small phone) and **1280px** (a laptop):

```sh
pnpm dev
pnpm screenshots / /products/<a-product> /cart
```

Screenshots are saved in `docs/maintainers/screenshots/` (not committed). Pull requests include them, and the
Vercel preview link lets you check on your own phone.

[screenshot: the home page at 360px and 1280px side by side]
