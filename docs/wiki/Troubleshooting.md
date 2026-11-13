# Troubleshooting

## Sign in goes to Selldone and shows an error

The shop has no OAuth client for sign-in. Set up the shop's OAuth client id (shop dashboard, or the Selldone MCP connector's `selldone_shop_client_create`). See [Shop Requirements](Shop-Requirements).

## The shop shows a blank page, or an old page flashes first

A chunk imports `../shop.js`, so the app loads twice through Selldone's redirect. Keep shared code in the `core` chunk and don't use `experimentalMinChunkSize` (both in `vite.config.ts`). `release.sh` refuses such a build.

## Chunks fail with a MIME error (`text/x-java`)

Selldone stores the MIME type it sniffs from each file. Every JS file must start with `"use strict";`: that is `sniffAsJavaScript` in `vite.config.ts`. Check with `file --mime-type dist/app/js/*.js`.

## The upload is rejected

| Message | Fix |
| --- | --- |
| "The manifest must be an array." | Upload with `scripts/kalio-deploy.mjs`, not the plain CLI. |
| "Archive paths must be safe relative app/ paths." | Remove `dist/index.html`, and use no spaces or brackets in file names. |
| "Active SVG attributes" / "only passive vector shapes" | Run `node scripts/kalio-svg-flatten.mjs dist/app`. |
| Request cut off after ~100 s, and the version exists but is empty | Too many files. Stay under ~360 (Bakini's first release had 354), then upload a **new** version number. |
| 401 | The CLI is signed out (`~/.selldone-dev/.persist` is empty). Run `selldone` → Login. |
| `node: bad option: --use-system-ca` | Your Node.js is too old for the release scripts. Use Node.js 22.15 or newer. |

## The upload worked but the shop still shows the old version

- The version isn't attached yet: see [Go Live](Go-Live).
- A custom domain keeps its own selection. Attach the version to that domain, or set it to **inherit**.
- You checked a URL with a query. Open the plain address and read `window.sdShopLayout`.
- The ZIP was stale: always package with `--force` and compare `shop.js` with `cmp`.

## `/` shows a landing page, the Layout is only on `/shop`

The Home is a Page Builder page. Set Home to **Shop** for the shop, or for that domain: see [Go Live](Go-Live).

## A pastry sits on a white or coloured square

Its photo has its own ground. Bakini sets every pastry on a dark plate under a warm halo (an ivory plate in light mode), so the main photo must be a **transparent cut-out** (PNG or WebP). Replace the photo in Selldone; no release is needed. The same goes for a collection's image. See [Shop Requirements](Shop-Requirements#products).

## A home section is missing

Each section folds away without its data:

| Section | Needs |
| --- | --- |
| The stage | products in your collections (the three best-selling collections each give one) |
| Tonight's selection | products in stock |
| The facts bento | open days in the shop info, a courier or shipping way, a payment method or a pickup point |
| "Which <unit> is yours?" | two or more products in the best-selling collection |
| Deals | a product in stock with a saving |
| Compose a trio | three collections with products in stock |
| Visit & pickup | an address in the shop info |
| The journal | published articles |

See [Shop Requirements](Shop-Requirements).

## The counter hours are missing

They are read from the pickup point's note, as a time range: `8:00-18:00`, `8:00–18:00` or `8:00 to 18:00`. Write them that way in the note. Without a range, the hours are left out everywhere; nothing is guessed.

## Checkout shows no time windows

The windows are your delivery ways' own time spans. Add them to each delivery way in the Selldone dashboard.

## The map shows no streets

Neither the shop info nor the pickup point has a location. Set the shop's location on the map in the Selldone dashboard. Without one, Visit & pickup and Contact show the plate and the pin only.

## Filters are missing, or a spec key never becomes a filter

- Specs must be **flat**, plus `spec_order`. A nested spec is not shown anywhere.
- A key becomes a filter only with **two or more different values** on that page, each **28 characters or fewer**. A long sentence stays under Product information and never becomes a filter. Price is always there, and On offer when something on the page has a saving.

See [Shop Requirements](Shop-Requirements#specs-and-filters).

## The quick look says "Choose options"

The product has variants. The quick look sends the shopper to the product page, where the options are chosen. This is by design.

## Checkout says "This shop is not taking payment right now"

The shop has no payment method for this currency. Add one in the Selldone dashboard (cash on delivery is fine). Bakini shows this line instead of a Pay button that opens an empty window.

## About, Terms, Privacy or FAQ say "Sample text"

The shop has not written that page yet. The sample is built only from your shop's facts. Write the page (or the FAQ entries) in the Selldone dashboard and the label goes away.

## A story ends with no pastries

The panel under a story shows the pastries its text links to (`/product/<id>` links, four at most), else the ones it names. Link the pastries in the article's text.

## The footer's Theme row doesn't show on my shop

That is by design: with `themeSwitcher: "showcase"` it shows only on the Layout's own showcase shops. Set `themeSwitcher: "on"` in `components/bakini/bakini-theme.settings.ts` to give your visitors the switcher. See [Theme and colours](Theme-and-colours).

## Selldone's default purple appears in some places

Those are Selldone's own components using the theme colour. Bakini sets `--v-theme-primary` from its action colour in `style/kalio-tokens.scss`, and Vuetify's theme from the palette in `components/bakini/bakini-theme.ts`; if a part still shows Selldone's purple, make it read that variable rather than a fixed colour. To change the colours themselves, use the settings file, not the tokens.

## Selldone's header or footer shows instead of Bakini's

The shop has custom header or footer code in Selldone. A shop with its own code keeps Selldone's header or footer (`layouts/StorefrontLayout.vue`). Remove the custom code to get Bakini's.

## I edited `style/noir/*.css` and my change was lost

Those files are generated from the mockup by `scripts/noir-css.cjs`. Put the change in `style/bakini-noir*.scss` instead. See [Customize](Customize#styles).

## A product page shows a plain purple page in a headless test

A headless browser opening a `/product/` link directly gets Selldone's SEO page. Open the home first and move with the Layout's links, or test in a normal browser or the dev server.

## The map in the address sheet is grey or 0 px tall

`mapbox-gl.css` sets `position: relative` on the map; the canvas must stay `position: absolute`. Use the `streets-v12` style. Search finds streets and numbers, not landmarks. With the checkout map off, the address sheet is a short form with search instead.

## Sticky parts don't stick

Vuetify's `.v-application` has `overflow: hidden`. Switch it to `overflow: clip` on the pages that need sticky (the product page's buy column is one).

## GitHub blocks the push: "Mapbox Secret Access Token"

Selldone's storefront history contains Selldone's **public** Mapbox browser key (`pk.`). It has been public in `selldone/storefront` since 2023. Allow it once with the link GitHub prints, or remove it from your own commits.

## A word stays in English after picking another language

If it is your shop's data (a product, collection, unit, pros, spec, article or a footer menu link), translate it in the Selldone dashboard. If Bakini writes it, it is a string not yet wrapped in `t()`: wrap it with a new `bakini.…` key, add the key to `bakini.en.ts` and to each `bakini.<code>.ts`, then build and release. See [Customize](Customize#languages).

## A red "429 Too Many Attempts" message, or a page that stays empty

Selldone limits how many requests one address may send in a minute. Many test browsers at once (or several Layouts tested from one computer) reach it; shoppers do not. Bakini retries its shared reads up to four times; wait a minute and reload. Run the checks one at a time.
