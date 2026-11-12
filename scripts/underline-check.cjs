// underline-check.cjs — no line under any word or icon, at rest or on hover (the owner's rule):
// only a link inside an article's own text may be underlined.
//
// For each page (opened in-app), every visible link and button (up to MAX per page) is hovered, then
// the element, its ancestors up to the page and its descendants with words are read:
//   LINE  text-decoration-line is not "none" (underline / overline / line-through on a link or button,
//         except a struck "was" price, which is a price, not a link line).
// Usage: node scripts/underline-check.cjs <base> [wait-selector]
//   PAGES="home=/,…" WIDTHS=1440,390 STORAGE='{"bakini-theme":"{\"palette\":\"caramel\",\"mode\":\"dark\"}"}' MAX=80
// Prints each finding and "TOTAL n". Deliver at 0.
const PW = process.env.PW || "D:/Kalio Sample Shop Claude/kalio-marketplace/node_modules/playwright";
const { chromium } = require(PW);
const base = (process.argv[2] || "http://localhost:9135").replace(/\/$/, "");
const WAIT = process.argv[3] || ".ftr";
const PAGES = (process.env.PAGES || "home=/,category=/croissants-category,product=/product/720375,blog=/blog,about=/about-us,contact=/contact-us,faq=/faq,404=/no-such-page")
  .split(",")
  .map((s) => [s.slice(0, s.indexOf("=")), s.slice(s.indexOf("=") + 1)]);
const WIDTHS = (process.env.WIDTHS || "1440,390").split(",").map(Number);
const MAX = Number(process.env.MAX || 80);

(async () => {
  const b = await chromium.launch();
  let total = 0;
  for (const w of WIDTHS) {
    const mob = w < 600;
    const ctx = await b.newContext({ viewport: { width: w, height: mob ? 844 : 900 }, isMobile: mob, hasTouch: mob });
    if (process.env.STORAGE) await ctx.addInitScript((st) => { for (const [k, v] of Object.entries(JSON.parse(st))) localStorage.setItem(k, v); }, process.env.STORAGE);
    await ctx.route(/^https:\/\/[^/]*selldone\.com\/.*\/buy\//, (r) => r.abort());
    const pg = await ctx.newPage();
    await pg.goto(base + "/", { waitUntil: "domcontentloaded", timeout: 90000 });
    await pg.waitForSelector(WAIT, { timeout: 90000 });
    for (const [label, to] of PAGES) {
      if (to !== "/") await pg.evaluate((p) => window.$global_router.push(p).catch(() => {}), to);
      await pg.waitForTimeout(4000);
      const n = await pg.evaluate((max) => {
        const vis = (e) => { const r = e.getBoundingClientRect(); const s = getComputedStyle(e); return r.width > 2 && r.height > 2 && s.visibility !== "hidden" && s.display !== "none" && +s.opacity > 0.05; };
        const els = [...document.querySelectorAll("a[href], button, [role=button], .v-btn")].filter(vis).filter((e) => !e.closest(".ar-body, .k-prose, .rd-body, .blog-body, article .body"));
        els.forEach((e, i) => e.setAttribute("data-ul", i));
        return Math.min(els.length, max);
      }, MAX);
      const found = [];
      for (let i = 0; i < n; i++) {
        const sel = `[data-ul="${i}"]`;
        const h = await pg.$(sel);
        if (!h) continue;
        await h.hover({ timeout: 1500, force: true }).catch(() => {});
        const bad = await pg.evaluate((s) => {
          const e = document.querySelector(s);
          if (!e) return null;
          const scope = [e, ...e.querySelectorAll("*")].filter((x) => [...x.childNodes].some((c) => c.nodeType === 3 && c.textContent.trim()) || x.tagName === "svg");
          for (const x of scope) {
            if (x.closest(".was, s, del, .k-was")) continue;
            const d = getComputedStyle(x).textDecorationLine;
            if (d && d !== "none") return `${e.tagName.toLowerCase()}.${String(e.className?.baseVal ?? e.className).split(" ").slice(0, 2).join(".")} "${(e.textContent || "").trim().slice(0, 30)}" ${d}`;
          }
          return null;
        }, sel);
        if (bad) found.push(bad);
      }
      for (const f of found) console.log(`${w} ${label}  LINE ${f}`);
      total += found.length;
    }
    await ctx.close();
  }
  await b.close();
  console.log(`TOTAL ${total}`);
})().catch((e) => { console.error("FAIL", e.message); process.exit(1); });
