# Bakini Noir Patisserie — a Selldone custom Layout

**Bakini Noir** (package `bakini-noir-patisserie`) is a custom Layout for Selldone's open-source storefront ([selldone/storefront](https://github.com/selldone/storefront)), made for **Bakio**, a single pâtisserie that sells individual pastries for delivery and pickup. It dresses the shop as a dark pastry theatre: a deep stage with ivory type, one deep caramel for every action, gold for small type and hairlines, Instrument Serif over Manrope, pastries floating on dark plates under a warm halo. Dark is the designed default; an ivory light mode and four more palettes sit in the footer's Theme row.

> **Status: in progress.** The base is set up (tokens, type, theme, language and currency pill, "bag" wording, live data); every page is being ported to its mockup. Release notes and the porting map are in [`BAKINI.md`](BAKINI.md).

Everything is read live from the shop: its title (drawn as the wordmark), collections, products, prices and savings, delivery ways, pickup counter, payment, articles. Nothing about the shop is written in the code, so another bakery can import the Layout and get its own data.

## Quick start (developers)

```bash
git clone https://github.com/selldone-custom-layouts/official-bakini.git
cd official-bakini
npm run setup            # the six Selldone modules (modules/)
for p in components translate; do git -C modules/$p apply ../../patches/modules-$p.kalio.patch; done
npm install --force
npm run serve            # dev server on http://localhost:9135, reading the shop named in .env
```

`.env` names the shop the dev server reads (`VITE_APP_SAMPLE_SHOP_NAME=bakio`). Releases:

```bash
LAYOUT_ID=<your Layout id> SELLDONE_CLI_SRC=<cli clone> bash scripts/release.sh <new version> desk
```

Leave `LAYOUT_ID` out on the first upload; use the id printed after it from then on.

## Theme and colours

The shared theme switcher (`components/theme-switcher/`, the same code as the other custom Layouts). On your own shop the visitor switcher is hidden and Bakini shows the theme you set in **one file**, [`components/bakini/bakini-theme.settings.ts`](components/bakini/bakini-theme.settings.ts): a palette (`caramel`, `cassis`, `pistachio`, `sapphire`, `gold`) or any brand colour, `dark` or `light`, and whether your visitors get the switcher (`themeSwitcher: "showcase" | "on" | "off"`). An AI agent finds the steps in the "Theme" section of [`AGENTS.md`](AGENTS.md).

## Where things are

| What | Where |
| --- | --- |
| Tokens for both modes (Noir and ivory) | [`style/bakini-theme.scss`](style/bakini-theme.scss) |
| Palettes, Vuetify's themes, the Custom colour | [`components/bakini/bakini-theme.ts`](components/bakini/bakini-theme.ts) |
| The merchant's theme | [`components/bakini/bakini-theme.settings.ts`](components/bakini/bakini-theme.settings.ts) |
| Typefaces (loaded by the app) | [`components/kalio/kalio-fonts.ts`](components/kalio/kalio-fonts.ts) |
| The wordmark and the tab mark, from the shop's title; "bag" in Selldone's strings | [`components/bakini/BakiniLogo.vue`](components/bakini/BakiniLogo.vue), [`components/kalio/kalio-brand.ts`](components/kalio/kalio-brand.ts) |
| Header, footer | [`components/bakini/shell/`](components/bakini/shell/) |
| Home, cards, rows | [`components/bakini/`](components/bakini/) |
| The Layout's words (English, Arabic) | [`components/kalio/i18n/`](components/kalio/i18n/) |
| Language and currency pill | [`components/region-switcher/`](components/region-switcher/) |

## Credits and license

Built on Selldone's storefront (see [`README.selldone.md`](README.selldone.md) and [`LICENSE.md`](LICENSE.md)). It carries forward the shared pieces of the earlier custom Layouts (the Kalio base: basket, checkout, account, compare; the theme and region switchers).
