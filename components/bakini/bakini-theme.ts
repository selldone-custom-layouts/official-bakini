/*
 * Bakini Noir — the theme switcher's config (the footer's Theme row: the
 * owner's rules: colour palettes, a custom colour and Light / Dark, a click
 * changes the whole site; the same shared package in every Layout,
 * components/theme-switcher/).
 *
 * Noir is dark first, like Valero: the designed default is the dark stage
 * (bakini-theme.settings.ts says mode "dark"), so on every shop the switcher
 * paints html.bk-dark before the first paint, also where the switcher itself
 * is hidden (its fixedTheme). Light is the refined ivory version. Both sets
 * of grounds, lines and words are in style/bakini-theme.scss (:root = ivory,
 * html.bk-dark = Noir); this config writes only the palette's action colour
 * (--bk-act*) and Vuetify's theme.
 *
 * The palettes are the mockup's (bakio-design/b/core.js PRESETS): Caramel
 * (the brand), Cassis, Pistachio, Sapphire and Gold-safe, each built by
 * paletteFromColor() with Noir's surfaces (the same function the Custom
 * swatch uses; Caramel's result equals the mockup's hand-set values).
 *
 * Contrast (WCAG 2.1, measured 12 November 2026 with paletteFromColor and
 * the surfaces below). White on each light primary: Caramel #a0522d 5.62,
 * Cassis 7.81, Pistachio 5.47, Sapphire 6.16, Gold-safe 5.53. White on each
 * dark primary 5.19 or more, each 3.2:1 or more against the dark card
 * #1c1419; each dark "text" colour on the raised surface #261b22 7.15 or more.
 */
import type { ThemeSwitcherConfig } from "../theme-switcher/theme-switcher";
import { THEME_SETTINGS } from "./bakini-theme.settings";
import { t } from "../kalio/i18n/kalio-i18n";

/* One palette; the name is read when drawn, so it follows the visitor's language. */
function pal(id: string, name: () => string, light: Record<string, string>, dark: Record<string, string>) {
  return {
    id,
    get name() {
      return name();
    },
    light,
    dark,
  };
}

export const BAKINI_THEME: ThemeSwitcherConfig = {
  /* The merchant's choice: bakini-theme.settings.ts, the one file to edit. */
  settings: THEME_SETTINGS,

  /* The owner (9 November 2026): a merchant who imports the Layout into their
     own shop must not see the switcher. With themeSwitcher "showcase" it
     shows only on these shops (window.shop.id, else <meta name="shop-name">). */
  showcaseShops: [
    { id: 15740, name: "bakio" }, // Bakio: Bakini Noir
    { id: 15549, name: "digini-hzgablru" }, // Digini: Digito, Besti, Argon, Senso, Medio
    { id: 15645, name: "molino" }, // Molino: Molino, Tario, Walio, Dino, Valero
  ],

  storageKey: "bakini-theme",
  darkClass: "bk-dark",
  defaultMode: "dark",

  palettes: [
    pal(
      "caramel",
      () => t("bakini.palette.caramel", "Caramel"),
      { primary: "#a0522d", deep: "#893e17", soft: "#ffece3", onPrimary: "#ffffff", text: "#a0522d" },
      { primary: "#a0522d", deep: "#90431d", soft: "#4a200c", onPrimary: "#ffffff", text: "#ea9570" },
    ),
    pal(
      "cassis",
      () => t("bakini.palette.cassis", "Cassis"),
      { primary: "#8e2f55", deep: "#771842", soft: "#ffeaf0", onPrimary: "#ffffff", text: "#8e2f55" },
      { primary: "#ad4b70", deep: "#9c3c61", soft: "#491d2d", onPrimary: "#ffffff", text: "#f48aae" },
    ),
    pal(
      "pistachio",
      () => t("bakini.palette.pistachio", "Pistachio"),
      { primary: "#477526", deep: "#34600c", soft: "#e7f6de", onPrimary: "#ffffff", text: "#477526" },
      { primary: "#4a782a", deep: "#3c6919", soft: "#1e350d", onPrimary: "#ffffff", text: "#87b868" },
    ),
    pal(
      "sapphire",
      () => t("bakini.palette.sapphire", "Sapphire"),
      { primary: "#2f5fb3", deep: "#1b4a9c", soft: "#e8f1ff", onPrimary: "#ffffff", text: "#2f5fb3" },
      { primary: "#3a6bc0", deep: "#2c5cb0", soft: "#182d51", onPrimary: "#ffffff", text: "#79abff" },
    ),
    pal(
      "gold",
      () => t("bakini.palette.gold", "Gold-safe"),
      { primary: "#8c5f30", deep: "#774b1a", soft: "#ffeddc", onPrimary: "#ffffff", text: "#8c5f30" },
      { primary: "#906334", deep: "#815525", soft: "#442500", onPrimary: "#ffffff", text: "#d4a373" },
    ),
  ],

  /* Palette value -> the variables that carry it (style/bakini-theme.scss
     maps every inherited name onto these). */
  tokens: {
    "--bk-act": "primary",
    "--bk-act-deep": "deep",
    "--bk-act-soft": "soft",
    "--bk-act-on": "onPrimary",
    "--bk-act-text": "text",
    "--bk-act-rgb": "primary:rgb",
    "--bk-act-on-rgb": "onPrimary:rgb",
  },

  /* The grounds, lines and words of each mode are in bakini-theme.scss
     (:root and html.bk-dark), so nothing is written inline for a mode. */
  dark: {},
  light: {},

  vuetify: {
    light: "light",
    dark: "dark",
    paletteColors: { primary: "primary", "on-primary": "onPrimary" },
    /* Noir's stage: Selldone's fields, menus, dialogs and sheets are dark too. */
    darkColors: {
      background: "#120c10",
      surface: "#1c1419",
      "surface-bright": "#261b22",
      "surface-variant": "#30232b",
      "on-background": "#f4ede6",
      "on-surface": "#f4ede6",
      "on-surface-variant": "#e2d7d0",
      "on-primary": "#ffffff",
      secondary: "#d4a373",
      "on-secondary": "#120c10",
      error: "#f2a07f",
      info: "#d4a373",
      success: "#8fd19e",
      warning: "#f2c27f",
    },
    lightColors: {
      background: "#f8f5f2",
      surface: "#ffffff",
      "on-background": "#1d1418",
      "on-surface": "#1d1418",
      secondary: "#8a5e2e",
      "on-secondary": "#ffffff",
      error: "#c4122f",
    },
  },

  /* The browser's own bar: the page's ground, not the action colour. */
  metaThemeColor: false,
  ui: { ink: "var(--bk-ink)", muted: "var(--bk-mut)", line: "var(--bk-line-2)", surface: "var(--bk-s1)", font: "var(--bk-ft)" },
  /* Read when drawn, so they follow the visitor's language (theme.* are the
     shared Kalio words). */
  labels: {
    get theme() {
      return t("theme.title", "Theme");
    },
    get palettes() {
      return t("theme.palettes", "Colour");
    },
    get mode() {
      return t("theme.mode", "Light or dark");
    },
    get modeTitle() {
      return t("theme.modeTitle", "Mode");
    },
    get light() {
      return t("theme.light", "Light");
    },
    get dark() {
      return t("theme.dark", "Dark");
    },
    get custom() {
      return t("theme.custom", "Custom colour");
    },
    get adjusted() {
      return t("theme.adjusted", "Adjusted for readability");
    },
    get brand() {
      return t("theme.brand", "Brand colour");
    },
  },

  /* "Custom colour" (the owner, 9 November 2026): any colour, made readable
     by paletteFromColor() against Noir's own surfaces (the mockup's
     NOIR_OPTIONS). No header band carries the action colour, so 4.5:1. */
  custom: {
    headerContrast: 4.5,
    darkSurfaces: ["#120c10", "#1c1419", "#261b22"],
    lightSurfaces: ["#ffffff", "#f8f5f2", "#efe8e2"],
    darkText: "#1d1418",
  },
};
