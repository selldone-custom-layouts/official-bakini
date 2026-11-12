// noir-css.cjs: ports the B mockup's stylesheets (bakio-design/b/*.css) into
// the Layout as style/noir/*.css, unchanged in look:
//
//   node scripts/noir-css.cjs [<path to bakio-design/b>]
//
// - Every rule is scoped to Bakini's own markup: the first compound of each
//   selector gets :is(.nx, .nx *) (or :where() for a bare element rule), so a
//   rule matches only an element that is (inside) an element with class "nx"
//   (every Bakini component wraps its markup in one); Selldone's and
//   Vuetify's parts outside .nx are never touched.
// - Custom properties take the --bk- prefix (style/bakini-theme.scss holds the
//   tokens); the core token blocks (:root and dark) are left out because that
//   file holds them.
// - html[data-mode="dark"] -> html.bk-dark (the theme switcher's dark class).
// - img[src^="img/…"] (the mockup's cut-out photos) -> img.cut.
// - The mockup's footer theme band (.ts-*) -> .nts-* (the kit's
//   ThemeSwitcherRow uses .ts-*); keyframes -> nx-*.
// Re-run after the mockup changes; style/noir/ is generated, never edited.
const fs = require("fs");
const path = require("path");
const postcss = require("postcss");
const sp = require("postcss-selector-parser");

const SRC = process.argv[2] || path.resolve(__dirname, "../../bakio-design/b");
const OUT = path.resolve(__dirname, "../style/noir");
const FILES = ["core", "pages", "product", "buy", "read"];
const SCOPE = ":where(.nx, .nx *)";
const KEYFRAMES = new Map();

const renameVars = (v) => v.replace(/var\(\s*--(?!bk-)([\w-]+)/g, "var(--bk-$1");

function scopeSelector(sel) {
  sel = sel
    .replace(/html\[data-mode=["']?dark["']?\]/g, "html.bk-dark")
    .replace(/html:not\(\[data-mode=["']?dark["']?\]\)/g, "html:not(.bk-dark)")
    .replace(/img\[src\^=["']?img\/[\w-]*["']?\]/g, "img.cut")
    .replace(/\.ts-/g, ".nts-");
  if (/^\s*(:root|html)\s*$/.test(sel)) return sel;
  return sp((root) => {
    root.each((selector) => {
      // html… prefix: keep it, scope what follows.
      let first = selector.first;
      const nodes = selector.nodes;
      let i = 0;
      if (first && first.type === "tag" && first.value === "html") {
        // skip the html compound
        while (i < nodes.length && nodes[i].type !== "combinator") i++;
        i++; // past the combinator
        if (i >= nodes.length) return;
      }
      if (first && first.type === "tag" && first.value === "body") {
        // "body" (and body.long …) is the scope root itself.
        const bodyNode = nodes[0];
        const scope = sp.pseudo({ value: ":where" });
        scope.append(sp.selector({ nodes: [sp.className({ value: "nx" })] }));
        bodyNode.replaceWith(scope);
        return;
      }
      // find the end of the compound starting at i (before a pseudo-element)
      let j = i;
      let insertAt = -1;
      while (j < nodes.length && nodes[j].type !== "combinator") {
        if (nodes[j].type === "pseudo" && nodes[j].value.startsWith("::")) {
          insertAt = j;
          break;
        }
        j++;
      }
      if (insertAt < 0) insertAt = j;
      /* A compound that names a class, attribute or id gets :is() (one class
         more for every such Noir rule alike, so the mockup's own order and
         weights hold, while a later-loaded reset of the same weight, such as
         Vuetify's [type=button] { color: inherit } or Selldone's .ghost, no
         longer wins). A bare element rule (button, a, h2) keeps :where(), so
         Vuetify's and Selldone's own parts inside a Noir page are not touched. */
      const compound = nodes.slice(i, insertAt);
      const named = compound.some((n) => n.type === "class" || n.type === "attribute" || n.type === "id");
      const where = sp.pseudo({ value: named ? ":is" : ":where" });
      where.append(sp.selector({ nodes: [sp.className({ value: "nx" })] }));
      where.append(sp.selector({ nodes: [sp.className({ value: "nx" }), sp.combinator({ value: " " }), sp.universal()] }));
      if (insertAt < nodes.length) selector.insertBefore(nodes[insertAt], where);
      else selector.append(where);
    });
  }).processSync(sel);
}

const out = [];
for (const name of FILES) {
  const file = path.join(SRC, `${name}.css`);
  if (!fs.existsSync(file)) continue;
  const root = postcss.parse(fs.readFileSync(file, "utf8"), { from: file });
  root.walkAtRules("keyframes", (at) => {
    const n = `nx-${at.params.trim()}`;
    KEYFRAMES.set(at.params.trim(), n);
    at.params = n;
  });
  root.walkRules((rule) => {
    if (rule.parent && rule.parent.type === "atrule" && /keyframes/.test(rule.parent.name)) return;
    const sels = rule.selectors || [];
    // The core token blocks live in style/bakini-theme.scss.
    if (name === "core" && sels.length === 1 && /^(:root|html\[data-mode=["']?dark["']?\])$/.test(sels[0].trim())) {
      rule.remove();
      return;
    }
    rule.selectors = sels.map(scopeSelector);
  });
  root.walkDecls((d) => {
    if (d.prop.startsWith("--") && !d.prop.startsWith("--bk-")) d.prop = "--bk-" + d.prop.slice(2);
    d.value = renameVars(d.value);
    if (/^animation(-name)?$/.test(d.prop)) for (const [a, b] of KEYFRAMES) d.value = d.value.replace(new RegExp(`\\b${a}\\b`, "g"), b);
  });
  const css = root.toString();
  fs.mkdirSync(OUT, { recursive: true });
  const head = `/* GENERATED by scripts/noir-css.cjs from bakio-design/b/${name}.css (the B "Noir" mockup). Do not edit: change the mockup or style/bakini-noir.scss, then re-run. */\n`;
  fs.writeFileSync(path.join(OUT, `${name}.css`), head + css);
  out.push(`${name}.css ${css.length}`);
}
console.log(out.join("\n"));
