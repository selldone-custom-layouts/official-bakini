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
| Type | Instrument Serif (display, italic accents) + Manrope (text), loaded from JS (`components/kalio/kalio-fonts.ts`); the Noir pages draw the mockup's inline line icons (`nx-icons.ts`), Material Symbols stays only for Selldone's own parts |
| Theme row | footer `ThemeSwitcherRow`: Caramel (brand), Cassis, Pistachio, Sapphire, Gold-safe + Custom + Light/Dark (`components/bakini/bakini-theme.ts`); palettes from `paletteFromColor` with Noir's surfaces, equal to the mockup's (`b/theme-color.js`); Bakio 15740 added to `showcaseShops`; storage key `bakini-theme`, dark class `bk-dark` |
| Wordmark and mark | `BakiniLogo.vue` draws the shop's live title like the mockup (`bak` + italic `io` + a gold dot; several words: the last word italic). `BRAND.name` is `null`. The tab icon and message avatar are an inline SVG drawn from the title's first letter (`kalio-brand.ts` `markFor`) |
| Region pill | the kit's current `region.ts` (with `format` and `prepareLanguage`, the SM-355 lessons) and `price-text.ts`; a Layout-side option `showSingle` so the pill ("USD") and the phone menu's row show with one currency and one language; the panel then shows the one currency chip and "Prices and totals are in US dollars." The pill sits with the header actions; on a phone it is the menu's "Language & currency" row |
| Bag | every Layout word says bag (`t()` English rewritten at the call sites, dictionaries re-extracted: `base/en.ts` 728 keys, `bakini.en.ts` 380 keys), the bag icon, and Selldone's own English strings (`bagWords()` in `kalio-brand.ts`: buy button, basket page and menu, remove dialogs, share order, "others have this in their bags") |
| Languages | English, plus Arabic kept for right-to-left (`lang-ar.ts`); Hindi and Danish removed (Digini's). Phase 2 rewrote `bakini.ar.ts` for every Noir word and brought `base/ar.ts` level with `base/en.ts` (glossary: bag الحقيبة, counter الكاونتر; i18n-lint OK) |
| Taken out | the photo hero slider, promo photo tiles, "The latest from <brand>", brand deals, "Discover offers", "Why shop with", the category hub (Can't decide?, buying guides, brands), the add-ons ("What you'll need"), "Ways to pay", Services menus, the message and promise strips, the electronics photos, Medio's screenshots and wiki, Medio's mark; sample About/Terms copy now speaks of a pastry shop (no invented history) |

## Phase 2 — the port (12–13 November 2026)

**How the mockup became the Layout.** The B mockup's five stylesheets are carried over unchanged:
`scripts/noir-css.cjs` turns `bakio-design/b/{core,pages,product,buy,read}.css` into `style/noir/*.css`
(generated, never edited). Each rule is scoped to Bakini's own markup: its first compound gets
`:is(.nx, .nx *)` (a bare element rule gets `:where()`), so the mockup's cascade holds, Selldone's
and Vuetify's parts outside a `.nx` wrapper are never touched, and a later-loaded reset of the same
weight (Vuetify's `[type=button]`, Selldone's draggable `.ghost`) cannot win. Custom properties take
the `--bk-` prefix (the tokens are `style/bakini-theme.scss`), `html[data-mode=dark]` becomes
`html.bk-dark`, the cut-out `img[src^=img/…]` rule becomes `img.cut`, the footer theme band's `.ts-*`
becomes `.nts-*` (the kit's row owns `.ts-*`), keyframes become `nx-*`. The Vue components write the
mockup's markup with live data; `style/bakini-noir*.scss` hold the Layout's own touches. The dark
build step leaves these files alone (they hold both modes). Re-run the script after a mockup change.

| Page | Where |
| --- | --- |
| Shared: data, layers, icons, card, quantity box, rows, bag drawer, quick look, map, journal card | `components/bakini/noir/` (`noir.ts`, `nx-icons.ts` generated from `b/core.js`, `Nx*.vue`) |
| Header (glass bar, Shop panel, search with live suggestions, region pill and panel, account panel, phone menu, language sheet) and footer (Theme band with the kit's row) | `components/bakini/shell/` |
| Home (stage, collections, selection, facts bento, most loved, "Which <unit> is yours?", deals band with the Save roundel, trio, story, visit with the real map, journal) | `components/bakini/noir/NxHome.vue` |
| Category, search, deals, every pastry | `components/bakini/noir/shop/NxListing.vue` (in `pages/products/StorefrontPageProducts.vue`) |
| Product, compare | `components/bakini/noir/product/`, `components/bakini/noir/compare/`, `pages/product/`, `pages/comparison/` |
| Bag page, checkout, address and delivery sheets, payment, order, account, addresses | `components/bakini/noir/buy/`, `components/bakini/noir/account/`, `pages/basket/`, `pages/user/`, `components/kalio/{checkout,order,account}/` |
| Journal, article, about, terms, privacy, contact, FAQ, 404, sign-in | `components/bakini/noir/read/`, `pages/blog/`, `pages/official/`, `pages/faq/`, `pages/errors/`, `components/kalio/shell/KalioSignIn.vue` |

**What the mockup hard-codes and the Layout reads live.** The collections' hues: the mockup's six
warm hues given in the shop's order (Bakio gets exactly the mockup's), cycled for more. The stage:
the best seller of each of the three best-selling collections. "Which croissant": the best-selling
collection's top four, its unit word ("cookie"), the first spec rows that are short and differ.
Trio: three collections by sales. Bento, story, visit, footer: the shop's `info` (address, days),
its pickup point's note (the counter hours are read from it, "8:00-18:00"), its delivery ways
(`transportations`: titles or words from their kind, windows, fees, free threshold, distance), its
gateway (name and description). The map: the mockup draws the Embarcadero's streets; the Layout shows
a static map of the shop's real location (Selldone's map service and token, dark style in dark
mode, attribution kept) with the mockup's pin and label card, so any bakery gets its own street.
"Popular" search words: the words most product titles share. Deals headline: "{off}% off. Every
piece." only when every product has the same saving, else "Up to {off}% off."

**Filters (the coordinator's rule, 12 November 2026).** A spec key is a filter only when the
collection has two or more distinct short values for it (28 characters at most; a sentence such as
"Visual Finish" or an allergen note never is), plus Price (two-thumb range with short boxes) and On
offer. No filter is invented: Bakio's collections each get Flavor Theme (cookies: Style and
Chocolate Format) + Price + On offer, fewer than five because the shop's other spec keys have one
value or long sentences. The listing works on the live catalogue (one read of `products/list`, up to
250 products); search matches title, collection and spec.

**Card photo (the coordinator's correction).** The cut-out fills about 80–85% of the plate's width
(`.pc-ph` inset 4px 6px 24px, the zoom 1.3), with the quick-look eye in the empty top corner and the
+ in the free lower corner.

**Checks (dev, 13 November 2026, `bash scripts/run-checks.sh http://localhost:9135 <logs>`).** One
browser at a time, 1440 and 390, dark and light (Caramel), plus a custom yellow and Arabic. Every one
TOTAL 0: ring-sweep dark/light/Arabic (16 pages, or the 8 main ones in Arabic), card-edge (kit) and
the Noir card-edge dark/light, corner-clear, circle-fit (long prices) and circle-fit in Arabic,
contrast dark/light/yellow/Arabic, contrast with the bag drawer or phone menu open (dark/light) and
with the sign-in sheet open, cart-audit dark/light (drawer, bag page, address sheet), currency-check,
box-check dark/light/Arabic (photos never on words, icon rows aligned) and underline-check
dark/light. The light pages (category, product, checkout, bag drawer, sign-in, phone menu) were
compared by eye with `shots/*-b-*-light.png`, the dark ones with every `shots/*-b-1440/390.png`. The
check tools block Selldone's `/buy/` API only (the dev server serves modules from `/buy/` folders).

**Notes for the next person.**

- *Account.* `.env`'s `VITE_KALIO_ACCOUNT=desk` is no longer read: `ACCOUNT_STYLE` is always `"home"`
  (`components/kalio/account/kalio-account.ts`) so `/user` opens the Overview, and `ORDERS_DESK`
  keeps the orders list as cards. Selldone keeps no "default" address, so there is no Default tag.
  Selldone's other account sections (saved, wallet, gift cards, returns, reviews) stay reachable as
  small links under the side menu, in the glass card look.
- *Payment window.* Selldone's own dialog (it lives in `modules/`), dressed in Noir by CSS only, so
  its words stay Selldone's and the mockup's "Have $X ready for the courier" line is not shown.
  Without a gateway the checkout shows "This shop is not taking payment right now" instead of Pay.
- *Address sheet.* Bakio has the map off; the map-on path is Kalio's existing one, not re-tested.
- *Quick look.* A product with variants shows "Choose options" (to its page, Selldone's option
  picker) instead of the quantity box.
- *Selldone parts kept inside Noir.* The shop's checkout questions, coupons and lottery prizes
  (shown only when the shopper has some), the discount code box, the billing form. Selldone's
  `.link` class shares the mockup's name: `.nx .link` wins (colour and weight) in `bakini-noir.scss`.
- *Not done (Bakio is English-only, coordinator's priority).* The SM-355 language items that need a
  second shop language to show: the first-title fallback for untranslated collection names, the
  address line and street from the shop's info in other scripts (`streetOf` in
  `noir/read/rd.ts` reads the English line), and the order tab's title. Right-to-left layout works
  (ring, contrast and box checks run in Arabic too).

## Releases

None yet. `1.0.0` will be the first upload (it creates the Layout id).
