/*
 * Bakini Noir — typefaces (bakio-design/BRIEF-ALL-PAGES.md §5½, set B).
 *
 * Instrument Serif (display, large, with italic accents) over Manrope (text
 * and UI). Material Symbols Rounded still draws the icons of the shared
 * pieces until each page is ported to the mockup's inline line icons. They
 * are requested from the app at start-up rather than from index.html: in
 * production the Layout runs inside the HTML Selldone renders for the shop,
 * and index.html never reaches the visitor. Selldone's own components keep
 * their Material Icons (v-icon). An Arabic face is loaded by the i18n runtime
 * only when Arabic is picked.
 */

const FONTS = [
  "https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Manrope:wght@400..800&display=swap",
  "https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..24,400..600,0..1,0&display=block",
];

function addLink(attrs: Record<string, string>) {
  if (document.head.querySelector(`link[href="${attrs.href}"]`)) return;
  const link = document.createElement("link");
  Object.entries(attrs).forEach(([key, value]) => link.setAttribute(key, value));
  document.head.appendChild(link);
}

addLink({ rel: "preconnect", href: "https://fonts.googleapis.com" });
addLink({ rel: "preconnect", href: "https://fonts.gstatic.com", crossorigin: "" });
for (const href of FONTS) addLink({ rel: "stylesheet", href });
