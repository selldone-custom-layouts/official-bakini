# Customize

Bakini's design lives in its own components and style sheets. Selldone's commerce logic underneath (basket, bill, checkout, variants, orders, payment) stays untouched. After any change in the code: build and upload a new version ([Build and Upload](Build-and-Upload)) and put it live ([Go Live](Go-Live)). A change in your shop's data (a title, a photo, a delivery window, an article) needs no release: it shows on the next visit.

## The name and the wordmark

The wordmark is your **shop's title**, read live. `components/bakini/BakiniLogo.vue` draws it in lower case in Instrument Serif, its last part in italic, then a small gold dot: a one-word title puts its last two fifths in italic ("bak" + "io"), a title of several words its last word ("maison" + "noir"). The footer, the page titles and the messages use the same title. Rename the shop in Selldone and the Layout follows.

`components/kalio/kalio-brand.ts`: `BRAND.name = null` keeps the shop's title. A string there replaces it everywhere the storefront names the shop.

The mark (the browser tab's icon, the avatar on order messages and the compare page's share card) is drawn from the title's first letter by `markFor()` in the same file: an italic serif letter, ivory on the dark stage, with the gold dot. It is an inline SVG, so there is no image file to replace.

## The colours, dark or light

One file: `components/bakini/bakini-theme.settings.ts`. See [Theme and colours](Theme-and-colours). Do not edit the palettes in `components/bakini/bakini-theme.ts` or the tokens in `style/bakini-theme.scss` for a merchant's theme.

## Type, tokens and words

| What | Where |
| --- | --- |
| Fonts (Instrument Serif for display, Manrope for text; Material Symbols Rounded only for Selldone's own parts) | `components/kalio/kalio-fonts.ts` |
| Icons (the mockup's inline line icons) | `components/bakini/noir/nx-icons.ts` (generated from the mockup), drawn by `NxIcon.vue` |
| Colour tokens for both modes (the stage, surfaces, ivory words, gold, lines, plates, glass, halo, the action colour) | `style/bakini-theme.scss`: `:root` is the ivory light mode, `html.bk-dark` the Noir dark mode |
| The collections' warm hues (six, given in the shop's order, then repeated) | `HUES` in `components/bakini/noir/noir.ts` |
| "Bag" instead of basket in Selldone's own English strings | `components/kalio/kalio-brand.ts` (`bagWords()`) |
| Bakini's own words (every one through `t("bakini.…", "English")`) | the components; the English in `components/kalio/i18n/bakini.en.ts`, the languages in `bakini.<code>.ts` (see [Languages](#languages)) |

## Photos

Bakini has **no photo files and no photo slots**. Every picture is your shop's own:

| Picture | Where it comes from |
| --- | --- |
| Pastries on every card, the stage, the quick look, the product page | each product's main photo, a transparent cut-out (PNG or WebP); more photos make the gallery |
| Collections in the Shop panel, the home's collection cards, the listing head and the chips | each category's image, a cut-out too |
| The journal and each story | each article's cover image |
| Visit & pickup and Contact | a static map of the shop's location (Selldone's map service) |

So a photo is changed in the Selldone dashboard, not in the code. The cut-outs matter: the Layout sets every pastry on a dark plate under its collection's halo, and a photo with its own ground shows as a square. See [Shop Requirements](Shop-Requirements#products).

## Sections and pages

| What | Where |
| --- | --- |
| Header (glass bar, Shop panel, search with live suggestions, language and currency pill and panel, account panel, bag button, phone menu, language sheet) | `components/bakini/shell/BakiniHeader.vue` |
| Footer (wordmark and shop line, collections, your footer menu, Help, Visit the counter, the Theme row, the legal row) | `components/bakini/shell/BakiniFooter.vue` |
| Shared pieces (the shop's data and facts, layers, icons, card, quantity box, rows, bag drawer, quick look, map, journal card) | `components/bakini/noir/` (`noir.ts`, `NxCard.vue`, `NxQb.vue`, `NxRow.vue`, `NxBagDrawer.vue`, `NxQuick.vue`, `NxMap.vue`, `NxPost.vue`) |
| Home (stage, collections, selection, facts bento, most loved, "Which <unit> is yours?", deals band with the Save roundel, trio, story, visit, journal) | `components/bakini/noir/NxHome.vue` |
| Listings (a collection, search, deals, every pastry; filters, sort, phone filter sheet) | `components/bakini/noir/shop/NxListing.vue`, inside `pages/products/StorefrontPageProducts.vue` |
| Product page (gallery, sticky buy column, phone buy bar, Why you'll love it, Product information, Buy together, reviews, More <collection>) | `pages/product/StorefrontPageProduct.vue`, `components/bakini/noir/product/` (`NxProductOverview.vue`, `NxPdQb.vue`, `NxTogether.vue`, `NxReviews.vue`, `pd.ts`) |
| Compare | `components/bakini/noir/compare/NxCompare.vue`, `pages/comparison/` |
| Bag page and checkout (step pills, contact, delivery cards and windows, address or pickup counter, billing, note, payment) | `pages/basket/cart/StorefrontPageBasketCart.vue`, `components/bakini/noir/buy/noir-cart.ts`, `components/kalio/checkout/KalioAddressSheet.vue` |
| Order page (receipt, delivery, chat) | `pages/basket/order/`, `components/kalio/order/` |
| Account desk (Overview, Orders, Addresses, Profile) | `components/kalio/account/`, `components/bakini/noir/account/noir-account.ts`, `pages/user/` |
| Sign-in sheet | `components/kalio/shell/KalioSignIn.vue` |
| Journal and story | `pages/blog/list/StorefrontPageBlogsList.vue`, `pages/blog/view/StorefrontPageBlogsView.vue` |
| About, Terms, Privacy, Contact, FAQ (with the sample text and its label) | `pages/official/`, `pages/faq/StorefrontPageFaq.vue`, `components/bakini/noir/read/` (`NxLegal.vue`, `NxSampleTag.vue`, `rd.ts`) |
| 404 | `pages/errors/404/StorefrontPageError404.vue` |

A shop with its own custom header or footer code in Selldone keeps Selldone's header or footer (`layouts/StorefrontLayout.vue`).

## Styles

| File | Holds |
| --- | --- |
| `style/noir/core.css`, `pages.css`, `product.css`, `buy.css`, `read.css` | the mockup's five stylesheets, converted by `scripts/noir-css.cjs`: every rule scoped to Bakini's own markup (`.nx`), the custom properties renamed `--bk-…`, dark mode as `html.bk-dark`. **Generated: never edit them.** |
| `style/bakini-noir.scss`, `bakini-noir-shop.scss`, `bakini-noir-product.scss`, `bakini-noir-buy.scss`, `bakini-noir-read.scss` | the Layout's own touches on top (for example Selldone's own parts dressed inside the Noir pages). Change the look here. |
| `style/bakini-theme.scss` | the tokens for both modes |

All of them are loaded from `StorefrontApp.vue`. Every Bakini component wraps its markup in an element with the class `nx`, so the Noir rules never touch Selldone's or Vuetify's parts outside it.

## Languages

Every word Bakini writes goes through `t("key", "English")` (`components/kalio/i18n/kalio-i18n.ts`). The English is the second argument at the call site; the dictionaries are files beside it:

| File | Holds |
| --- | --- |
| `components/kalio/i18n/base/<code>.ts` | the shared Kalio words (bag, checkout, account, compare…), the same in every Kalio-family Layout |
| `components/kalio/i18n/bakini.<code>.ts` | Bakini's own words (`bakini.*`) |
| `components/kalio/i18n/lang-<code>.ts` | merges the two; loaded only when a visitor picks that language |
| `components/kalio/i18n/index.ts` | `EN` (English, bundled) and `LOADERS`, the list of other languages Bakini knows |

Bakini ships English and Arabic (`ar`, right to left: the whole page mirrors). The visitor picks one from the language and currency pill in the header (the phone menu's "Language & currency" row); the list is the shop's own languages (Selldone dashboard › Shop › Languages).

To change a word: edit the English at the call site, and the same key's value in `bakini.en.ts` and in each `bakini.<code>.ts` (a shared Kalio word, one without the `bakini.` prefix, lives in `base/en.ts` and `base/<code>.ts` instead).

To add a language your shop offers:

1. Copy `bakini.en.ts` to `bakini.<code>.ts` and translate every value (keep `{n}`, `{shop}` and the other `{…}` words; plural keys end in `.one` / `.other`, and a language with more forms adds `.zero`, `.two`, `.few`, `.many`).
2. Translate `base/en.ts` into `base/<code>.ts` the same way.
3. Copy `lang-ar.ts` to `lang-<code>.ts` and change its two imports.
4. Add one line to `LOADERS` in `index.ts`, next to `ar: () => import("./lang-ar")`.
5. Build and check every page in that language. A word still in English is a string that is not wrapped in `t()` yet: wrap it with a new `bakini.…` key.

The words the shop writes (product names, collections, units, pros, spec, articles, the footer menu) are the shop's data: translate them in the Selldone dashboard.

Right to left, Bakini keeps these rules:

- logical CSS everywhere (`margin-inline`, `inset-inline`, `text-align: start`), so the page mirrors;
- the shop's own words (names, collections, addresses) sit in `<bdi>`, so each keeps its own direction inside a translated sentence;
- words in a circle (the deals band's Save roundel) stay inside it in every currency and language: the amount may take two lines and `components/bakini/fit-in-circle.ts` shrinks it until it fits;
- an Arabic face (Noto Sans Arabic) is loaded only when Arabic is picked.

## Rules the design keeps

- **One action colour.** Caramel (or your palette) for every button, chosen state and link; gold only for small type, savings and hairlines. Every colour is a token.
- **Flat.** Buttons without shadows; hover changes the colour only; no line under any word or icon. The only underlined words are the links inside a story's own text.
- **Rings inside the box.** Every selection ring and card edge is an inset shadow, never an outline.
- **Cut-outs on dark plates.** Product and collection photos are transparent cut-outs; their plates turn ivory in light mode, so there is no white tile in either mode.
- **Bag, not cart.** In the Layout's words and in Selldone's own English strings.
- **Honest words.** No invented history, awards, names, counts or reviews; sample pages say they are samples; delivery lines and windows only from the shop's own delivery ways; counter hours only from the pickup note; deal clocks only to a deal's real end date; "not taking payment" when there is no payment method.
- **Live data.** Nothing names a product, price, collection, delivery way or opening hour; another bakery gets its own.
