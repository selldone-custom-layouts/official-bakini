# Theme and colours

Medio runs the **shared theme switcher** (`components/theme-switcher/`), the same code as the other custom Layouts. Medio's palettes and tokens are in `components/medio/medio-theme.ts`; the **one file a merchant edits** is `components/medio/medio-theme.settings.ts`.

## Medio's colours

Medio paints every action with **one colour**, deep violet `#5a2ed0` (white words 7.67:1): pill buttons, the round search button, links, chosen states and the round logo.

Around it: hot magenta `#c40c63` for savings ("Save $X") and the campaign strip (white words 5.87:1) in every palette, black pills for campaign tags, a light grey page `#f4f3f7` with white rounded cards, a dark slate footer `#26333a` and six pastel tiles. Every colour is a token in `style/medio-theme.scss`.

## On Medio's showcase shop

The **Theme** row sits in the footer, in a strip of its own above the legal row (the owner, 10 November 2026: the theme setting lives in the footer on every Layout). It holds:

- **Colour:** Medio violet (the default), Ocean, Emerald, Ruby, Copper, and **Custom colour** (any colour from the browser's colour picker; it is made readable in light and dark, with a note "Adjusted for readability" when it had to change).
- **Mode:** Light or Dark.

One click changes the whole site at once, with no reload: Medio's colours, the Kalio base, Vuetify's theme and Selldone's own parts (the buy button, prices, the basket drawer, the checkout sheets, dialogs). The choice is kept in the browser (key `medio-theme`) and painted before the first paint, so the default never flashes. The row works with the keyboard: Tab reaches every swatch and the switch, arrow keys move between swatches. On a phone the palettes stay on one line and Light / Dark wraps under them.

## On your own shop

The visitor switcher is a **showcase** feature. With `themeSwitcher: "showcase"` it shows only on Medio's own showcase shops (Digini 15549, Molino 15645). On any other shop it is not shown, a saved choice is ignored, and Medio shows the theme from the settings file:

```ts
export const THEME_SETTINGS: ThemeSettings = {
  palette: "medio",          // "medio" | "ocean" | "emerald" | "ruby" | "copper"
  // brandColor: "#F5C400",  // any colour; replaces palette
  mode: "light",             // "light" | "dark"
  themeSwitcher: "showcase", // "showcase" | "on" (your visitors get it) | "off"
  textOnBrand: "auto",       // with brandColor: "auto" (a light brand keeps dark words) | "white"
};
```

| Setting | Allowed values |
| --- | --- |
| `palette` | `"medio"` (Medio violet; the default), `"ocean"`, `"emerald"`, `"ruby"`, `"copper"` |
| `brandColor` | any `"#RRGGBB"`; when set it replaces `palette` |
| `mode` | `"light"` or `"dark"` |
| `themeSwitcher` | `"showcase"` (the visitor switcher shows only on Medio's own showcase shop, Digini 15549; the default), `"on"` (your visitors get the Theme row in the footer), `"off"` |
| `textOnBrand` | only with `brandColor`: `"auto"` (a light brand such as yellow keeps its colour, with dark words on it) or `"white"` (white words; a light colour is darkened) |

Every colour is made readable automatically: buttons, links, the round logo and dark mode.

## Examples

Change only these lines; leave the rest of the file as it is.

| You want | Set |
| --- | --- |
| "Use the yellow theme" | No palette is yellow, so use a brand colour: `brandColor: "#F5C400", textOnBrand: "auto"` |
| "My brand colour is #F5C400" | `brandColor: "#F5C400", textOnBrand: "auto"`; use `textOnBrand: "white"` for white words (the colour is then darkened) |
| "Make it dark" | `mode: "dark"` |
| "Let visitors switch themes" | `themeSwitcher: "on"` |
| "Remove the switcher" | `themeSwitcher: "off"` (on your own shop it is already hidden with `"showcase"`) |
| "Go back to the original colours" | remove `brandColor`, set `palette: "medio", mode: "light"` |

Then build and upload a new version and put it live:

```bash
LAYOUT_ID=<your Layout id> SELLDONE_CLI_SRC=<cli clone> bash scripts/release.sh <new version> desk
```

See [Build and Upload](Build-and-Upload) and [Go Live](Go-Live).

## Contrast

| Palette | White words on the action colour (light) |
| --- | --- |
| Medio violet | `#5a2ed0` 7.67:1 |
| Ocean | `#0a5ab4` 6.70:1 |
| Emerald | `#0b6e52` 6.24:1 |
| Ruby | `#b3123f` 6.83:1 |
| Copper | `#a2470d` 6.10:1 |

In dark mode, white words on every palette's action colour read at 5.08:1 or more, each action colour stands at 3.3:1 or more against the dark card `#1b1a23`, and every dark text colour reads at 7.98:1 or more on it. Savings stay magenta (lightened to `#ff7ab8` in dark mode). A custom or brand colour goes through `paletteFromColor()`, which moves only its lightness until each role reads. In dark mode, product photos keep a white tile so their white edge never shows.

## Checks

Run these from the repository root after a theme change. They need Playwright; set `PW` to your install (`PW=<path>/node_modules/playwright`) if the default path is not yours. A palette argument is a palette id, or `custom:#rrggbb` for a custom colour.

1. **Contrast** on the live shop, at desktop and phone width. It must print `TOTAL 0`:
   ```sh
   PAGES="home=/,category=/<a category>,product=/product/<id>" \
     node components/theme-switcher/tools/contrast-audit.cjs https://<your shop> ".md-header"
   ```
   To test one palette and mode, add `STORAGE='{"medio-theme":"{\"palette\":\"medio\",\"mode\":\"dark\"}"}'` (this works where the switcher is shown).
2. **Basket drawer, basket page and address sheet.** It must print `TOTAL 0`. It fills a basket in the browser only and blocks every order request:
   ```sh
   SHOP=<your shop's xapi name> STORAGE_KEY=medio-theme WAIT=".md-header" CART=".md-act.-basket" \
     node components/theme-switcher/tools/cart-audit.cjs https://<your shop> medio dark
   ```
3. **Rings and edges**, only if the visitor switcher is on (the Theme row is in the footer). It must print `TOTAL 0` in light and in dark:
   ```sh
   STORAGE='{"medio-theme":"{\"palette\":\"medio\",\"mode\":\"dark\"}"}' PAGES="home=/"      node <kit>/single-vendor-shop/ring-sweep.cjs https://<your shop> ".md-header"
   ```
4. **Colour maths:** `node components/theme-switcher/theme-color.test.mjs`.

On Medio's showcase shop the same checks run with `https://medio.selldone.shop`, `SHOP=digini-hzgablru`, `PAGES="home=/,category=/digital-camera-category,product=/product/709990"`, for each palette in light and dark.
