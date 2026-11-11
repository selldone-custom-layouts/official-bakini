/*
 * Medio — the theme switcher's config (the footer's Theme row; the owner's
 * rules: colour palettes, a custom colour and Light / Dark, a click changes
 * the whole site; the same shared package in every Layout,
 * components/theme-switcher/).
 *
 * Medio paints every action with one colour, the palette's `primary` (deep
 * violet by default): buttons, the search button, links, chosen states. The
 * old two-colour names (--md-buy*, --md-brand*) both carry it, so the shared
 * Kalio pieces follow too. Savings stay magenta in every palette (a fixed
 * sale colour, like a price tag), the campaign tags stay black.
 *
 * storefront.ts calls bootThemeSwitcher(MEDIO_THEME, vuetify) before
 * mounting, so the chosen theme paints first, with no flash. The merchant's
 * choice is in medio-theme.settings.ts.
 *
 * Contrast (WCAG 2.1, measured 11 November 2026 with paletteFromColor and the
 * surfaces below). White on each light primary: Medio violet #5a2ed0 7.67,
 * ocean 6.70, emerald 6.24, ruby 6.83, copper 6.10. White on each dark
 * primary 5.08 or more, each 3.3:1 or more against the dark card #1b1a23;
 * each dark "text" colour on that card 7.98 or more.
 */
import type { ThemeSwitcherConfig } from "../theme-switcher/theme-switcher";
import { THEME_SETTINGS } from "./medio-theme.settings";
import { t } from "../kalio/i18n/kalio-i18n";

/* One palette: the light and dark values, with the old buy/brand names
   pointing at the same colour. */
function pal(id: string, name: () => string, light: Record<string, string>, dark: Record<string, string>) {
  const both = (v: Record<string, string>) => ({
    ...v,
    brand: v.primary,
    brandDeep: v.deep,
    brandSoft: v.soft,
    brandText: v.text,
  });
  /* The name is read when drawn, so it follows the visitor's language. */
  return {
    id,
    get name() {
      return name();
    },
    light: both(light),
    dark: both(dark),
  };
}

export const MEDIO_THEME: ThemeSwitcherConfig = {
  /* The merchant's choice: medio-theme.settings.ts, the one file to edit. */
  settings: THEME_SETTINGS,

  /* The owner (9 November 2026): a merchant who imports Medio into their own
     shop must not see the switcher. With themeSwitcher "showcase" it shows
     only on these shops (window.shop.id, else <meta name="shop-name">). */
  showcaseShops: [
    { id: 15549, name: "digini-hzgablru" }, // Digini: Digito, Besti, Argon, Senso, Medio
    { id: 15645, name: "molino" }, // Molino: Molino, Tario, Walio, Dino, Valero
  ],

  storageKey: "medio-theme",
  darkClass: "md-dark",

  palettes: [
    pal(
      "medio",
      () => t("medio.palette.medio", "Medio violet"),
      { primary: "#5a2ed0", deep: "#4a06b8", soft: "#efeaff", onPrimary: "#ffffff", text: "#5a2ed0" },
      { primary: "#7250f0", deep: "#653edf", soft: "#2b274f", onPrimary: "#ffffff", text: "#ada7ff" },
    ),
    pal(
      "ocean",
      () => t("medio.palette.ocean", "Ocean"),
      { primary: "#0a5ab4", deep: "#004794", soft: "#e7f1ff", onPrimary: "#ffffff", text: "#0a5ab4" },
      { primary: "#256dc9", deep: "#115eb8", soft: "#142e50", onPrimary: "#ffffff", text: "#7bb3ff" },
    ),
    pal(
      "emerald",
      () => t("medio.palette.emerald", "Emerald"),
      { primary: "#0b6e52", deep: "#005840", soft: "#dbf8eb", onPrimary: "#ffffff", text: "#0b6e52" },
      { primary: "#227b5f", deep: "#076c50", soft: "#003727", onPrimary: "#ffffff", text: "#6dc1a1" },
    ),
    pal(
      "ruby",
      () => t("medio.palette.ruby", "Ruby"),
      { primary: "#b3123f", deep: "#940030", soft: "#ffeaeb", onPrimary: "#ffffff", text: "#b3123f" },
      { primary: "#cb3252", deep: "#b91c44", soft: "#4b1d23", onPrimary: "#ffffff", text: "#ff919c" },
    ),
    pal(
      "copper",
      () => t("medio.palette.copper", "Copper"),
      { primary: "#a2470d", deep: "#863700", soft: "#ffece3", onPrimary: "#ffffff", text: "#a2470d" },
      { primary: "#b0541f", deep: "#a04509", soft: "#49210b", onPrimary: "#ffffff", text: "#fb9766" },
    ),
  ],

  /* Palette value -> the variables that carry it. --md-head (the round logo,
     the hub's campaign strip) keeps the light primary in both modes, with
     --md-on-head words; --md-on-brand is the words on a button (dark on a
     light merchant brand, textOnBrand "auto"). */
  tokens: {
    "--md-buy": "primary",
    "--md-buy-d": "deep",
    "--md-buy-l": "soft",
    "--md-buy-t": "text",
    "--md-buy-rgb": "primary:rgb",
    "--md-brand": "brand",
    "--md-brand-d": "brandDeep",
    "--md-brand-l": "brandSoft",
    "--md-brand-t": "brandText",
    "--md-brand-rgb": "brand:rgb",
    "--md-head": "light.brand",
    "--md-head-d": "light.brandDeep",
    "--md-on-head": "light.onPrimary",
    "--md-on-head-rgb": "light.onPrimary:rgb",
    "--md-on-brand": "onPrimary",
    "--md-on-brand-rgb": "onPrimary:rgb",
  },

  /* While dark (removed on light). Packshot tiles (--md-photo, --k-well,
     --k-tint) stay white, so a white packshot keeps its edge hidden. */
  dark: {
    "--md-bg": "#121118",
    "--md-surface": "#1b1a23",
    "--md-page": "#24232e",
    "--md-tile": "#2a2935",
    "--md-line": "#34333f",
    "--md-line-2": "#4a4856",
    "--md-hover-line": "#5e5c6b",
    "--md-deco": "#827f90",
    "--md-ink": "#efedf5",
    "--md-ink-2": "#d8d5e2",
    "--md-brand-ink": "#efedf5",
    "--md-muted": "#aeaabb",
    "--md-soft": "#a19dae",
    "--md-off-bg": "#34333f",
    "--md-off-ink": "#bdb9c8",
    "--md-pill": "#efedf5",
    "--md-on-pill": "#121118",
    "--md-pill-hover": "#ffffff",
    "--md-dark-card": "#26213a",
    "--md-strip": "#0b0a10",
    "--md-ph-c0": "#26252f",
    "--md-ph-c1": "#33323d",
    "--md-ph-c2": "#cbc7d8",
    "--md-red-t": "#ff7ab8",
    "--md-sale-t": "#ff7ab8",
    "--md-green-t": "#6fd39b",
    "--md-warn-t": "#ffb366",
    "--md-yellow-l": "#3a3312",
    "--md-note": "#262141",
    "--md-sw-edge": "rgba(255, 255, 255, 0.55)",
    "--md-shine": "rgba(255, 255, 255, 0.07)",
    "--md-pop-shadow": "rgba(0, 0, 0, 0.6)",
    "--k-line-soft": "#2a2935",
    "--k-coral-soft": "#3a1529",
    "--k-star-off": "#827f90",
    "--k-plain": "#1b1a23",
    "--k-shadow": "0 10px 28px -14px rgba(0, 0, 0, 0.7)",
  },

  vuetify: {
    light: "light",
    dark: "dark",
    paletteColors: { primary: "primary", "on-primary": "onPrimary" },
    darkColors: {
      background: "#121118",
      surface: "#1b1a23",
      "surface-bright": "#24232e",
      "surface-variant": "#34333f",
      "on-background": "#efedf5",
      "on-surface": "#efedf5",
      "on-surface-variant": "#d8d5e2",
      "on-primary": "#ffffff",
      secondary: "#efedf5",
      "on-secondary": "#121118",
      error: "#ff8a9e",
      info: "#ada7ff",
      success: "#6fd39b",
      warning: "#ffb366",
    },
  },

  metaThemeColor: "light.brand",
  ui: { ink: "var(--md-ink)", muted: "var(--md-muted)", line: "var(--md-line)", surface: "var(--md-surface)", font: '"Outfit", system-ui, sans-serif' },
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
     by paletteFromColor(). The header is white, so white on the light primary
     needs 4.5:1; 5 keeps a margin for the small words on the hub's strip. */
  custom: {
    headerContrast: 5,
    darkSurfaces: ["#121118", "#1b1a23", "#24232e"],
    lightSurfaces: ["#ffffff", "#f4f3f7", "#efeef3"],
    darkText: "#1c1b22",
    extras: (v) => ({
      brand: v.primary,
      brandDeep: v.deep,
      brandSoft: v.soft,
      brandText: v.text,
    }),
  },
};
