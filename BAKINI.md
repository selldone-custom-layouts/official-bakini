# Bakini Noir — Selldone Layout

**Bakini Noir Patisserie** (package `bakini-noir-patisserie`, first version `1.0.0`) is a Layout of the Selldone shop **Bakio** (shop 15740, xapi name `bakio`, `https://bakio.myselldone.com`): one pâtisserie at 1 The Embarcadero, San Francisco, selling individual pastries for courier delivery, worldwide shipping and pickup, cash on delivery, guest checkout. Single seller, English only, USD only. It is to run on **bakini.selldone.shop** (domain 1247) only; the shop's default Layout (id 8) is never changed.

The design is mockup set **B, "Noir"** (`../bakio-design/`: `BRIEF-ALL-PAGES.md`, the 27 `<page>-b.html` pages, their source in `b/`, screenshots in `shots/`): an Apple-Store-like product theatre on a dark stage. Build brief: `../bakio-design/BUILD-NOIR.md`.

It started from Medio 1.0.9 (`medio-layout`, `git clone`, history kept; `md-` → `bk-`, Medio → Bakini), so the shared pieces are kept: the theme switcher (a footer row, showcase only), the region switcher, the i18n runtime and `t()`, fit-in-circle, the compare page, the bag drawer (design C), the desk account, the guest order code fix, the listing motion, real deal timers (none show: no Bakio deal has an end date), the release scripts.

## Phase 1 — setup (12 November 2026)

| Area | What is set |
| --- | --- |
| Repo | `bakini-layout`, branch `bakini`; remotes `medio` (the local Medio repo) and `upstream` (selldone/storefront), both fetch-only. `modules/` (the six Selldone modules, with `patches/*.patch` applied) and `node_modules/` copied from Medio; `/modules/` and `/dist.zip` are ignored |
| Names | `manifest.json`: `bakini-noir-patisserie`, "Bakini Noir Patisserie", `1.0.0`; `selldone-layout.json`; `package.json` repository `official-bakini` |
| Dev server | port **9135**, shop `bakio`, home = shop page (`.env`); `npx vite --port 9135` or `npm run serve` in this folder (launch entry `bakini-layout` in `../.claude/launch.json`) |
| Tokens | `style/bakini-theme.scss`: the mockup's Noir tokens with a `--bk-` prefix (`--bk-bg`, `--bk-s1..3`, `--bk-ink`, `--bk-mut`, `--bk-gold`, `--bk-line`, `--bk-plate`, `--bk-glass`, `--bk-halo-a`, `--bk-act*`, radii, `--bk-wrap`, `--bk-gut`…). `:root` = ivory (Light), `html.bk-dark` = Noir (Dark). Every inherited name (`--bk-buy`, `--bk-surface`, `--bk-photo`… and through `kalio-tokens.scss` the `--k-*` names) is mapped onto them, so the inherited pages already wear Noir |
| Dark first | `bakini-theme.settings.ts` `mode: "dark"`; the switcher paints `html.bk-dark` and Vuetify's dark theme before the first paint on every shop (its `fixedTheme` where the switcher is hidden). The build step (`postcss-dark-tokens`) gives every other fixed colour a Noir value (card `#1c1419`, raise `#261b22`, ink `#f4ede6`, muted `#b8a9af`); `lightVars` is empty because the pastry photos are transparent cut-outs on dark plates |
| Type | Instrument Serif (display, italic accents) + Manrope (text), loaded from JS (`components/kalio/kalio-fonts.ts`); Material Symbols stays until the pages move to the mockup's inline line icons |
| Theme row | footer `ThemeSwitcherRow`: Caramel (brand), Cassis, Pistachio, Sapphire, Gold-safe + Custom + Light/Dark (`components/bakini/bakini-theme.ts`); palettes from `paletteFromColor` with Noir's surfaces, equal to the mockup's (`b/theme-color.js`); Bakio 15740 added to `showcaseShops`; storage key `bakini-theme`, dark class `bk-dark` |
| Wordmark and mark | `BakiniLogo.vue` draws the shop's live title like the mockup (`bak` + italic `io` + a gold dot; several words: the last word italic). `BRAND.name` is `null`. The tab icon and message avatar are an inline SVG drawn from the title's first letter (`kalio-brand.ts` `markFor`) |
| Region pill | the kit's current `region.ts` (with `format` and `prepareLanguage`, the SM-355 lessons) and `price-text.ts`; a Layout-side option `showSingle` so the pill ("USD") and the phone menu's row show with one currency and one language; the panel then shows the one currency chip and "Prices and totals are in US dollars." The pill sits with the header actions; on a phone it is the menu's "Language & currency" row |
| Bag | every Layout word says bag (`t()` English rewritten at the call sites, dictionaries re-extracted: `base/en.ts` 728 keys, `bakini.en.ts` 380 keys), the bag icon, and Selldone's own English strings (`bagWords()` in `kalio-brand.ts`: buy button, basket page and menu, remove dialogs, share order, "others have this in their bags") |
| Languages | English, plus Arabic kept for right-to-left (`lang-ar.ts`); Hindi and Danish removed (Digini's). `bakini.ar.ts` is stale (Medio's words; i18n-lint: 136 problems) and is rewritten in Phase 2 |
| Taken out | the photo hero slider, promo photo tiles, "The latest from <brand>", brand deals, "Discover offers", "Why shop with", the category hub (Can't decide?, buying guides, brands), the add-ons ("What you'll need"), "Ways to pay", Services menus, the message and promise strips, the electronics photos, Medio's screenshots and wiki, Medio's mark; sample About/Terms copy now speaks of a pastry shop (no invented history) |

## Phase 2 — porting map (every page to its B mockup)

The mockup hard-codes Bakio's ids and copy; the Layout must take each from live data:

| Mockup | Live source in the Layout |
| --- | --- |
| `HUES[slug]` per collection | a warm hue list cycled by the category's order (or read from its image), never by slug |
| Hero: three named products | the best seller of the three best-selling collections (`sells`), with the gallery photo when there is one; tabs, no autoplay |
| "Which croissant is yours?" (4 ids, two spec keys) | the best-selling collection's top four, the first two rows of its first spec group, stock |
| Morning trio (croissant, Danish, tart) | three collections, each starting on its best seller; "Add all three" |
| Bento facts (hours, windows, shipping, COD, pickup) | `/info`: `transportations` (types, windows, fees, free-over), `gateways` (COD description), the pickup point and the shop's `info` (address, hours) |
| Story and visit copy | sentences built from the shop's address, collection names and delivery ways; the visit map is the mockup's Embarcadero SVG only as an illustration style, drawn generically (no street names) |
| Category filters | the category's own spec values (flat spec), price range, On offer; grid only (Medio's List view goes) |
| Product page | gallery (one row of thumbnails), sticky buy column, Selldone variants as option tiles when a product has them (none on Bakio: the labelled preview from the mockup), pros, spec groups, reviews empty state with the rating criteria, "More <collection>", Buy together (this + two from other collections) |
| Checkout | the Kalio basket page's template rebuilt as the B numbered glass cards (Contact, Delivery method + windows, Address, Billing halves, Note) and the floating receipt ("Place order · pay $X on delivery"), keeping Selldone's script (bill, shipping options, address sheet with map on and off, payment window) |

What needs the most rework from the Medio base: the header (Medio's big-retailer header → the slim glass header), the home (a rewrite), the product page (Medio's key-spec grid and buy card → the B gallery and sticky buy column), the checkout and basket page (Kalio's card layout → B's numbered glass cards), the card (white rounded retail card → floating pastry on a dark plate with the + in the free corner), the category page (List/Grid toggle and hub → short head, filter sheet, grid), the footer (dense dark footer with the visit lines), and every icon (Material Symbols → inline line SVG).

Also from the kits for a new Layout (SYNC-ALL-LAYOUTS §SM-355), still to take in Phase 2: `StorefrontSeo.firstTitle`, `addressLine`/`streetOf` in the address sheet, the order page's tab title, the basket's delivery line written like the order page's.

## Releases

None yet. `1.0.0` will be the first upload (it creates the Layout id).
