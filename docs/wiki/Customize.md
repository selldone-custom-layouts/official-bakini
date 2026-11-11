# Customize

Medio's design lives in its own components and style sheets. Selldone's commerce logic underneath (basket, bill, checkout, variants, orders) stays untouched. After any change: build and upload a new version ([Build and Upload](Build-and-Upload)) and put it live ([Go Live](Go-Live)).

## The name and the logo

`components/kalio/kalio-brand.ts`: `BRAND.name = "Medio"`. The logo (`components/medio/MedioLogo.vue`) draws it in lower case, white, inside a round violet disc with a small magenta dot; the page titles, footer and messages follow. Set it to `null` to use your shop's own title.

The mark, `assets/brand/medio-mark.svg` (a white "m" on the violet disc with the magenta dot, 64×64), is the tab icon and the avatar on order messages. Replace the file to use your own.

## The colours, light or dark

One file: `components/medio/medio-theme.settings.ts`. See [Theme and colours](Theme-and-colours). Do not edit the palettes in `components/medio/medio-theme.ts` or the tokens in `style/medio-theme.scss` for a merchant's theme.

## Type, tokens and words

| What | Where |
| --- | --- |
| Fonts (Outfit, Material Symbols Rounded) | `components/kalio/kalio-fonts.ts` |
| Colour tokens (violet actions, magenta savings, black pills, grey page, white cards, slate footer, pastels) | `style/medio-theme.scss` |
| The word for the basket in Selldone's own English strings | `components/kalio/kalio-brand.ts` (`cartWords`) |
| Medio's own words (every one through `t("medio.…", "English")`) | the components; the English in `components/kalio/i18n/medio.en.ts`, the languages in `medio.<code>.ts` (see [Languages](#languages)) |

## Photos

Medio has two kinds of photo. Both are plain files: drop them in, build, release. No code change.

### Photo slots

The slots are registered in `components/medio/medio-photos.ts`. Each looks for `assets/photos/<file>.webp`. Until that file exists, the slot shows a calm tinted placeholder of the same shape with a photo icon and the file's name, so you can see which file goes where.

| File | Size | Where |
| --- | --- | --- |
| `hero-main.webp` | 2400×960 | Home, the big hero (words on its calm left side); without it the hero shows the three biggest deals on a white stage |
| `why-deals.webp`, `why-compare.webp`, `why-track.webp`, `why-returns.webp`, `why-help.webp`, `why-secure.webp` | 800×800 | Home, the six "Why shop with" tiles (shown in a circle) |
| `help-hero.webp` | 2400×640 | Help & Support (the FAQ), beside the banner's words |
| `about-hero.webp` | 2400×900 | About us |
| `notfound.webp` | 1200×900 | The 404 page |
| `choose-<tag>.webp` | 1200×800 | A category hub's "Can't decide?" choice for that tag (`choose-wireless.webp`, `choose-4k.webp`…); a new tag looks for its own file |

The photo prompts used for Medio's showcase shop are kept in the owner's design folder (`digini-design/codex-photos-medio.md`, not in this repository). They are a good starting point for your own: no text, logos or faces in any photo.

### Category photos

The home's promo tiles use the category photos: `assets/medio/<shape>-<category slug>.webp`. The slug is the category's `name` in Selldone.

| Shape | Size | Where |
| --- | --- | --- |
| `portrait-<slug>.webp` | 4:5 | the tall promo tile |
| `square-<slug>.webp` | 1:1 | the 2×2 promo tiles |
| `wide-<slug>.webp` | 16:9 (a calm left third) | the two wide promo tiles |

A category without a photo gets a collage of its own products, so the Layout is complete with no photos at all. Add, replace or remove files the same way: drop them in `assets/medio/`, build, release.

## Sections and pages

| What | Where |
| --- | --- |
| Header (message strip, utility row, logo, Shop All / Services / Deals panels, search, actions, promises, phone menu, basket drawer) | `components/medio/shell/MedioHeader.vue` |
| Footer (five columns, the Theme strip, legal row) | `components/medio/shell/MedioFooter.vue` |
| Home | `components/medio/MedioHome.vue`, `MedioRail.vue`, `MedioRow.vue`, `MedioScroller.vue`, `MedioPhoto.vue`, `MedioSlot.vue`, `medio.ts` |
| Product card and list row (everywhere, also inside Selldone's listing) | `components/medio/MedioCard.vue`, `medio-buy.ts`, `MedioDealClock.vue` |
| Category hub | `components/medio/shop/MedioHub.vue` |
| Results page (title, banner, Filters, toolbar, List / Grid) | `pages/products/StorefrontPageProducts.vue`, `components/medio/shop/MedioFilterPanel.vue`, `components/medio/medio-listing.ts` |
| Product page | `pages/product/StorefrontPageProduct.vue`, `components/medio/product/` (`MedioProductOverview.vue`, `MedioAddons.vue`, `MedioTogether.vue`, `medio-spec.ts`) |
| Quick-buy sheet | `components/kalio/KalioQuickBuy.vue` (Medio's overview inside) |
| Help & Support (FAQ) | `pages/faq/StorefrontPageFaq.vue` |
| 404 | `pages/errors/404/StorefrontPageError404.vue` |
| Styles | `style/medio.scss` (base, header, footer, cards), `medio-home.scss`, `medio-shop.scss`, `medio-pdp.scss`, `medio-dress.scss` (the other pages), loaded last |

## Languages

Every word Medio writes goes through `t("key", "English")` (`components/kalio/i18n/kalio-i18n.ts`). The English is the second argument and `medio.en.ts`; the other languages are files beside it:

| File | Holds |
| --- | --- |
| `components/kalio/i18n/base/<code>.ts` | the shared Kalio words (basket, checkout, account, compare…), the same in every Kalio-family Layout |
| `components/kalio/i18n/medio.<code>.ts` | Medio's own words (`medio.*`) |
| `components/kalio/i18n/lang-<code>.ts` | merges the two; loaded only when a visitor picks that language |
| `components/kalio/i18n/index.ts` | the list of languages Medio knows |

Medio ships English, Arabic (`ar`, right to left: the whole page mirrors, prices and numbers keep their own direction), Hindi (`hi`) and Danish (`da`). The visitor picks one from the language and currency pill in the header (the phone menu's last row); the list is the shop's own languages (Selldone dashboard › Shop › Languages).

To add a language your shop offers:

1. Copy `medio.en.ts` to `medio.<code>.ts` and translate every value (keep `{n}`, `{shop}` and the other `{…}` words; plural keys end in `.one` / `.other`, and a language with more forms adds `.zero`, `.two`, `.few`, `.many`).
2. Get `base/<code>.ts` from the shared Kalio set (or translate `base/en.ts` the same way).
3. Copy `lang-da.ts` to `lang-<code>.ts` and change its two imports.
4. Add one line to `LOADERS` in `index.ts`.
5. Build and check every page in that language. A word still in English is a string that is not wrapped in `t()` yet: wrap it with a new `medio.…` key.

The words the shop writes (product names, categories, tags, articles, the footer's page links) are the shop's data: translate them in the Selldone dashboard.

## Rules the design keeps

- **One action colour.** Violet for every button, the round search button, links and chosen states; magenta only for savings and the campaign strip; black pills only for campaign tags. Every colour is a token.
- **Flat.** Buttons are pills without shadows; hover changes the colour only; no line under any word or icon.
- **Rings inside the box.** Every selection ring and card edge is an inset shadow, never an outline.
- **Packshots on white.** Product photos have white grounds, so they always sit on a white well (in dark mode too).
- **Honest words.** No product counts in shopper text, no invented credit offers ("Pay in parts at checkout where available"), delivery lines only from the shop's own delivery ways, deal clocks only to a deal's real end date.
- **Live data.** Nothing names a product, price, category, brand or tag; tags make their own sections and hub choices.
