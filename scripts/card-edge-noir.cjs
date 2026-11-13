// card-edge-noir.cjs: the kit's card-edge-check.cjs, with Bakini Noir's own card classes counted as cards
// (the kit looks for class names with card/tile/panel/item). Same usage, plus STORAGE (a theme, a language).
//
// card-edge-check.cjs: does any card's content touch its card's edge?
//
// A "card" is any element that looks like a box: a background different from
// its parent, a border, or a box-shadow, at least 120px wide, with text or
// buttons inside (product cards, promo tiles, panels). For each one, every
// visible text, button, input or swatch inside must sit at least MIN px
// inside the box on the left and right. Cards with no visible box (transparent,
// no border, no shadow) are skipped: their content may sit flush on purpose.
//
// Why: on 10 Nov 2026 Senso's listing cards lost all inner padding because
// Selldone's SProductsListing hands its column classes (v-col-*, pa-0) to the
// card it draws, and Vuetify's `.pa-0 { padding: 0 !important }` won.
//
// Usage:
//   node card-edge-check.cjs <url> [<url> ...]
//   A url ending in "#cat" opens the site, then the first "-category" link
//   in-app (cold /product/ and category URLs can get Selldone's SEO page).
// Env: MIN (default 8), WIDTHS (default "1440,390"), DARK=1 for dark mode.
// Output: one line per url and width, and TOTAL at the end; TOTAL must be 0.
const path = require("path");
const PW = process.env.PLAYWRIGHT || "D:/Kalio Sample Shop Claude/kalio-marketplace/node_modules/playwright";
const { chromium } = require(PW);

const MIN = Number(process.env.MIN || 8);
const WIDTHS = (process.env.WIDTHS || "1440,390").split(",").map(Number);

function check(min) {
  const solid = (c) => c && c !== "transparent" && !/rgba\(\s*\d+,\s*\d+,\s*\d+,\s*0\s*\)/.test(c);
  const bgOf = (el) => {
    for (let e = el; e; e = e.parentElement) {
      const c = getComputedStyle(e).backgroundColor;
      if (solid(c)) return c;
    }
    return "rgb(255, 255, 255)";
  };
  const boxed = (el) => {
    const cs = getComputedStyle(el);
    if (parseFloat(cs.borderLeftWidth) > 0 && cs.borderLeftStyle !== "none") return true;
    if (cs.boxShadow && cs.boxShadow !== "none") return true;
    return solid(cs.backgroundColor) && cs.backgroundColor !== bgOf(el.parentElement);
  };
  const leafs = "a, button, input, label, output, b, strong, em, span, p, h2, h3, h4, [role=radio]";
  /* Bakini Noir: the kit's names plus the mockup's own boxes (pc = product card, lu = collection card, bt = bento tile, wc = side-by-side card, gcard = glass card, brow/mini = bag rows, …). */
  const looksCard = (el) => /card|tile|panel|item|(^|\s)(pc|lu|bt|wc|gcard|brow|mini|post|empty|visit|trio|deal-band|cath|dl-head|lv-hero|qv|rc-card|fp-sheet|pro|spec-g|bt2|tr-col|sr-sum|ftr-col)(\s|$)/i.test(el.className && el.className.toString());
  const cards = [...document.querySelectorAll("article, li, div, a")].filter((el) => {
    if (!looksCard(el) || !el.offsetParent) return false;
    const r = el.getBoundingClientRect();
    return r.width >= 120 && r.height >= 120 && boxed(el);
  });
  const bad = [];
  for (const c of cards) {
    const r = c.getBoundingClientRect();
    if (r.bottom < 0 || r.top > innerHeight * 3) continue;
    let minL = Infinity, minR = Infinity, who = "";
    for (const k of c.querySelectorAll(leafs)) {
      if (!k.offsetParent) continue;
      const kr = k.getBoundingClientRect();
      if (kr.width < 2 || kr.height < 2) continue;
      if (!k.textContent.trim() && !/button|input|radio/i.test(k.tagName + k.getAttribute("role"))) continue;
      // a nested card is measured on its own
      const inner = k.closest("article, li, div, a");
      if (inner && inner !== c && cards.includes(inner) && c.contains(inner)) continue;
      const l = kr.left - r.left, rr = r.right - kr.right;
      if (l < minL) { minL = l; who = k.textContent.trim().slice(0, 30) || k.tagName; }
      if (rr < minR) minR = rr;
    }
    if (minL < min || minR < min) {
      bad.push({ card: c.className.toString().replace(/\s+/g, " ").slice(0, 100), padding: getComputedStyle(c).padding, left: Math.round(minL), right: Math.round(minR), first: who });
    }
  }
  return { cards: cards.length, bad };
}

(async () => {
  const browser = await chromium.launch();
  let total = 0;
  for (const url of process.argv.slice(2)) {
    for (const w of WIDTHS) {
      const page = await browser.newPage({
        viewport: { width: w, height: 1000 },
        colorScheme: process.env.DARK ? "dark" : "light",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36",
      });
      if (process.env.STORAGE) await page.addInitScript((st) => { for (const [k, v] of Object.entries(JSON.parse(st))) localStorage.setItem(k, v); }, process.env.STORAGE);
      try {
        const auto = url.endsWith("#cat");
        await page.goto(url.replace("#cat", ""), { waitUntil: "domcontentloaded", timeout: 60000 });
        await page.waitForTimeout(9000);
        if (auto) {
          const href = await page.evaluate(() => {
            const a = document.querySelector('a[href$="-category"]');
            return a && a.getAttribute("href");
          });
          if (href) {
            await page.evaluate((h) => document.querySelector("#app").__vue_app__.config.globalProperties.$router.push(h), href);
            await page.waitForTimeout(8000);
          }
        }
        await page.mouse.wheel(0, 700);
        await page.waitForTimeout(2000);
        const res = await page.evaluate(check, MIN);
        total += res.bad.length;
        console.log(`${url} @${w}: boxed cards ${res.cards}, touching the edge ${res.bad.length}`);
        for (const b of res.bad.slice(0, 5)) console.log("   ", JSON.stringify(b));
      } catch (e) {
        console.log(`${url} @${w}: ERROR ${e.message.split("\n")[0]} (rerun; Selldone may have answered 429)`);
      }
      await page.close();
      await new Promise((r) => setTimeout(r, 2500));
    }
  }
  await browser.close();
  console.log(`TOTAL ${total}`);
})();
