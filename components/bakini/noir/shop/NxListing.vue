<!--
  Bakini Noir — the shop pages that list pastries (b/pages-shop.js
  listingPage(): category-b, search-b, deals-b): a short head (a
  collection's name, line and picture with every collection as a chip; the
  search box with what was asked; the deals' headline with the biggest
  saving), then the filter panel and the grid.

  The filters are the collection's own spec, read live: a key becomes a
  filter only when the collection has two or more short values for it (28
  characters at most: a sentence such as an allergen note is never a filter;
  the coordinator's rule of 12 November 2026), plus Price (a two-thumb range
  with short boxes) and "On offer". No filter is invented, so a collection
  may show fewer than five. Sort: Featured, Best sellers, Customer review,
  Price low to high and high to low, Newest (deals: Biggest saving first).
  Every change dims the cards, shows "Updating results…" and fades the new
  ones up in steps (nothing moves with reduced motion). Phone: a Filter
  button opens the panel as a sheet.

  The products are the shop's live catalogue (one read, shared); search
  matches the title, the collection and the spec, like the header's
  suggestions.
-->
<template>
  <div class="nx nx-listing">
    <div class="lt">
      <!-- The head -->
      <div class="wrap lt-head">
        <template v-if="kind === 'category'">
          <div :style="{ '--bk-hue': hueOf(cat?.id) }" class="cath">
            <div class="cath-txt">
              <nav :aria-label="t('bakini.n.ls.crumbs', 'Breadcrumb')" class="crumbs">
                <router-link :to="{ path: '/' }">{{ t("bakini.n.ls.home", "Home") }}</router-link><nx-icon name="right" /><span aria-current="page"><bdi>{{ catTitle(cat) || categoryName }}</bdi></span>
              </nav>
              <h1 class="serif"><bdi>{{ catTitle(cat) || categoryName }}</bdi></h1>
              <p v-if="catLine" class="muted">{{ catLine }}</p>
            </div>
            <div aria-hidden="true" class="cath-ph"><img v-if="catImg(cat)" :src="catImg(cat)" alt="" class="cut" /></div>
          </div>
          <div class="cat-chips">
            <router-link
              v-for="c in noir.cats"
              :key="c.id"
              :aria-current="c.id === cat?.id ? 'page' : undefined"
              :class="['chip', { on: c.id === cat?.id }]"
              :to="catTo(c)"
              ><img v-if="catImg(c, 128)" :src="catImg(c, 128)" alt="" /><bdi>{{ catTitle(c) }}</bdi></router-link
            >
          </div>
        </template>

        <div v-else-if="kind === 'search'" class="sr-head">
          <nav :aria-label="t('bakini.n.ls.crumbs', 'Breadcrumb')" class="crumbs">
            <router-link :to="{ path: '/' }">{{ t("bakini.n.ls.home", "Home") }}</router-link><nx-icon name="right" /><span aria-current="page">{{ t("bakini.n.ls.search", "Search") }}</span>
          </nav>
          <form class="sr-form" role="search" @submit.prevent="submitSearch">
            <nx-icon name="search" />
            <input :aria-label="t('bakini.n.ls.searchLabel', 'Search the bakery')" :value="q" autocomplete="off" enterkeyhint="search" type="search" @input="q = $event.target.value" />
            <button class="btn" type="submit">{{ t("bakini.n.ls.search", "Search") }}</button>
          </form>
          <template v-if="base.length">
            <p class="sr-sum">
              {{ t("bakini.n.ls.resultsFor", "Results for") }}{{ " " }}<b class="serif">“{{ search }}”</b>{{ " " }}{{ resultCats.length > 1 ? t("bakini.n.ls.acrossAll", "across the collections") : t("bakini.n.ls.in", "in {name}", { name: catTitle(catOf(resultCats[0])) }) }}
            </p>
            <div v-if="resultCats.length > 1" class="cat-chips tabs">
              <button :aria-pressed="tab === 'all' ? 'true' : 'false'" class="chip" type="button" @click="setTab('all')">{{ t("bakini.n.ls.all", "All") }}</button>
              <button v-for="id in resultCats" :key="id" :aria-pressed="tab === id ? 'true' : 'false'" class="chip" type="button" @click="setTab(id)">
                <img v-if="catImg(catOf(id), 128)" :src="catImg(catOf(id), 128)" alt="" /><bdi>{{ catTitle(catOf(id)) }}</bdi>
              </button>
            </div>
          </template>
        </div>

        <template v-else>
          <div :style="{ '--bk-hue': hueOf(topSave?.category_id) }" class="dl-head">
            <div>
              <nav :aria-label="t('bakini.n.ls.crumbs', 'Breadcrumb')" class="crumbs">
                <router-link :to="{ path: '/' }">{{ t("bakini.n.ls.home", "Home") }}</router-link><nx-icon name="right" /><span aria-current="page">{{ kind === "deals" ? t("bakini.n.ls.deals", "Deals") : t("bakini.n.ls.everything", "Everything") }}</span>
              </nav>
              <h1 v-if="kind === 'deals'" class="serif">
                <template v-if="dealsEvery">{{ t("bakini.n.ls.dealsEvery", "{off}% off.", { off: maxOff }) }}{{ " " }}<em>{{ t("bakini.n.ls.dealsEveryEm", "Every piece.") }}</em></template>
                <template v-else-if="maxOff">{{ t("bakini.n.ls.dealsUpTo", "Up to {off}% off.", { off: maxOff }) }}{{ " " }}<em>{{ t("bakini.n.ls.dealsUpToEm", "This week.") }}</em></template>
                <template v-else>{{ t("bakini.n.ls.dealsNone", "Deals") }}</template>
              </h1>
              <h1 v-else class="serif">{{ t("bakini.n.ls.allH", "Every") }}{{ " " }}<em>{{ t("bakini.n.ls.allHem", "pastry.") }}</em></h1>
              <p class="muted">{{ kind === "deals" ? t("bakini.n.ls.dealsLine", "The saving is already in each price — no codes, no timers. Sorted by the biggest saving first.") : t("bakini.n.ls.allLine", "Every collection in one place, sold one by one.") }}</p>
            </div>
            <div v-if="kind === 'deals' && topSave" class="dl-best">
              <span class="th"><img :src="img(topSave)" alt="" class="cut" /></span>
              <span>
                <small class="eyebrow">{{ t("bakini.n.ls.biggest", "Biggest saving") }}</small><b>{{ topSave.title }}</b
                ><span class="gold">{{ t("bakini.n.ls.save", "Save {amount}", { amount: money(pv(topSave).save) }) }}</span>
              </span>
            </div>
          </div>
          <div class="cat-chips tabs">
            <button :aria-pressed="tab === 'all' ? 'true' : 'false'" class="chip" type="button" @click="setTab('all')">{{ t("bakini.n.ls.all", "All") }}</button>
            <button v-for="c in tabCats" :key="c.id" :aria-pressed="tab === c.id ? 'true' : 'false'" class="chip" type="button" @click="setTab(c.id)">
              <img v-if="catImg(c, 128)" :src="catImg(c, 128)" alt="" /><bdi>{{ catTitle(c) }}</bdi>
            </button>
          </div>
        </template>
      </div>

      <!-- Nothing found (search) -->
      <div v-if="kind === 'search' && ready && !base.length" class="wrap" style="padding-bottom: 80px">
        <div class="empty">
          <span class="ec"><nx-icon name="search" /></span>
          <h3>{{ t("bakini.n.ls.noMatchT", "No pastries match “{q}”", { q: search }) }}</h3>
          <p>{{ noMatchLine }}</p>
          <div class="acts"><router-link v-if="noir.cats[0]" :to="catTo(noir.cats[0])" class="btn">{{ t("bakini.n.ls.browse", "Browse {name}", { name: catTitle(noir.cats[0]).toLowerCase() }) }}</router-link></div>
        </div>
        <nx-row :accent="t('bakini.n.ls.lovedEm', 'loved.')" :items="loved" :title="t('bakini.n.ls.loved', 'Most')" cls="tight" />
      </div>

      <!-- The panel and the grid -->
      <div v-else class="wrap lt-body">
        <aside :aria-label="t('bakini.n.ls.filters', 'Filters')" class="fp">
          <div :aria-label="t('bakini.n.ls.filters', 'Filters')" :class="['fp-sheet', { open: sheet }]" role="dialog">
            <div class="fp-in">
              <div class="fp-h">
                <h2>{{ t("bakini.n.ls.filter", "Filter") }}</h2>
                <button class="link" type="button" @click="reset">{{ t("bakini.n.ls.reset", "Reset") }}</button>
              </div>
              <div v-if="hi > lo" class="fg fg-price">
                <p class="fg-t">{{ t("bakini.n.ls.price", "Price") }}</p>
                <div class="range">
                  <div class="range-track"><span :style="fillStyle" class="range-fill"></span></div>
                  <input :aria-label="t('bakini.n.ls.minPrice', 'Minimum price')" :max="hi" :min="lo" :value="min" step="0.25" type="range" @change="update" @input="onMin($event.target.value)" />
                  <input :aria-label="t('bakini.n.ls.maxPrice', 'Maximum price')" :max="hi" :min="lo" :value="max" step="0.25" type="range" @change="update" @input="onMax($event.target.value)" />
                </div>
                <div class="range-boxes">
                  <label
                    ><span>{{ t("bakini.n.ls.min", "Min") }}</span
                    ><span class="rb"
                      >{{ sign
                      }}<input :aria-label="t('bakini.n.ls.minPrice', 'Minimum price')" :max="hi" :min="lo" :value="min.toFixed(2)" inputmode="decimal" step="0.25" type="number" @change="boxMin($event.target.value)" /></span
                  ></label>
                  <span class="dash">–</span>
                  <label
                    ><span>{{ t("bakini.n.ls.max", "Max") }}</span
                    ><span class="rb"
                      >{{ sign
                      }}<input :aria-label="t('bakini.n.ls.maxPrice', 'Maximum price')" :max="hi" :min="lo" :value="max.toFixed(2)" inputmode="decimal" step="0.25" type="number" @change="boxMax($event.target.value)" /></span
                  ></label>
                </div>
              </div>
              <div v-if="anyOffer" class="fg fg-offer">
                <label class="switch"><input :checked="offer" type="checkbox" @change="setOffer($event.target.checked)" /><span class="tr"></span>{{ t("bakini.n.ls.onOffer", "On offer") }}</label>
              </div>
              <details v-for="(f, gi) in facets" :key="f.key" :open="gi < 3" class="fg">
                <summary>{{ f.key }}<nx-icon name="down" /></summary>
                <div class="fg-body">
                  <template v-for="(v, i) in f.values" :key="v">
                    <button v-if="i < 12 || moreOpen[f.key]" :aria-pressed="picked(f.key, v) ? 'true' : 'false'" class="fchip" type="button" @click="toggle(f.key, v)">{{ v }}</button>
                  </template>
                  <button v-if="f.values.length > 12" :aria-expanded="moreOpen[f.key] ? 'true' : 'false'" class="fmore" type="button" @click="moreOpen[f.key] = !moreOpen[f.key]">
                    <nx-icon name="down" />{{ moreOpen[f.key] ? t("bakini.n.ls.fewer", "Show fewer") : t("bakini.n.ls.more", "Show {n} more", { n: f.values.length - 12 }) }}
                  </button>
                </div>
              </details>
            </div>
            <div class="fp-foot">
              <button class="btn block" type="button" @click="closeSheet">{{ t("bakini.n.ls.showResults", { one: "Show {n} result", other: "Show {n} results" }, { n: list.length }) }}</button>
            </div>
          </div>
        </aside>

        <div class="lt-main">
          <div class="lt-bar">
            <button class="btn quiet sm lt-fbtn" type="button" @click="openSheet">
              <nx-icon name="filter" />{{ t("bakini.n.ls.filter", "Filter") }}<span v-if="active.length" class="fcount">{{ active.length }}</span>
            </button>
            <div class="lt-active">
              <button v-for="a in active" :key="a.id" aria-pressed="true" class="chip on" type="button" @click="a.clear()">{{ a.label }}<nx-icon name="close" /></button>
            </div>
            <div ref="sortw" class="sortw">
              <button :aria-expanded="sortOpen ? 'true' : 'false'" aria-haspopup="listbox" class="btn quiet sm" type="button" @click="sortOpen = !sortOpen">
                <nx-icon name="sort" /><span>{{ t("bakini.n.ls.sortBy", "Sort:") }}{{ " " }}<b>{{ sortLabel }}</b></span>
              </button>
              <div :aria-label="t('bakini.n.ls.sort', 'Sort')" :class="['sortmenu', { open: sortOpen }]" role="listbox">
                <button v-for="s in sorts" :key="s[0]" :aria-selected="s[0] === sort ? 'true' : 'false'" role="option" type="button" @click="setSort(s[0])">
                  {{ s[1] }}<nx-icon name="check" />
                </button>
              </div>
            </div>
          </div>
          <div aria-live="polite" class="upd-slot">
            <span v-if="busy" class="updating"><span class="spin"></span>{{ t("bakini.n.ls.updating", "Updating results…") }}</span>
          </div>
          <div :class="['grid5', 'lt-grid', { dim: busy }]">
            <template v-if="ready">
              <nx-card
                v-for="(p, i) in shown"
                :key="p.id + '-' + drawn"
                :class="{ 'fade-up': animate && i < 12 }"
                :product="p"
                :style="animate && i < 12 ? { animationDelay: i * 25 + 'ms' } : null"
                look
              />
            </template>
            <template v-else>
              <div v-for="n in 8" :key="n" aria-hidden="true" class="pc nx-skel"><div class="pc-plate"></div><div class="pc-body"><i></i><i></i><i></i></div></div>
            </template>
          </div>
          <div v-if="ready && !shown.length">
            <div class="empty">
              <span class="ec"><nx-icon name="search" /></span>
              <h3>{{ t("bakini.n.ls.noneT", "No pastries match these filters") }}</h3>
              <p>{{ t("bakini.n.ls.noneP", "Loosen the price range or clear a filter to see more of the collection.") }}</p>
              <div class="acts"><button class="btn" type="button" @click="reset">{{ t("bakini.n.ls.resetFilters", "Reset filters") }}</button></div>
            </div>
          </div>
        </div>
      </div>
      <div v-if="sheet" class="nx-fscrim" @click="closeSheet"></div>
    </div>
  </div>
</template>

<script>
import NxIcon from "../NxIcon.vue";
import NxCard from "../NxCard.vue";
import NxRow from "../NxRow.vue";
import { bySells, catImage, catOf, catTitle, catTo, hueOf, inCat, loadNoir, money, noir, priceView, productImage, specGroups, specValue } from "../noir";
import { currentCurrency, signOf } from "../../../region-switcher/region";
import { t } from "../../../kalio/i18n/kalio-i18n";

const MAX_VALUE = 28;

export default {
  name: "NxListing",
  components: { NxIcon, NxCard, NxRow },
  props: {
    categoryName: { type: String, default: null },
    search: { type: String, default: "" },
    deals: Boolean,
    initialSort: { type: String, default: "" },
  },
  /* fetched: the page's search-engine data (StorefrontSeo.updateProducts). */
  emits: ["fetched"],

  data: () => ({
    noir,
    q: "",
    tab: "all",
    sort: "featured",
    f: {},
    offer: false,
    min: 0,
    max: 0,
    sortOpen: false,
    sheet: false,
    busy: false,
    animate: false,
    drawn: 0,
    snapshot: null,
    moreOpen: {},
  }),

  computed: {
    shop() {
      return this.$store.getters.getShop;
    },
    currency() {
      return currentCurrency();
    },
    sign() {
      return signOf(this.currency) || this.currency;
    },
    ready() {
      return this.noir.ready;
    },
    kind() {
      if (this.categoryName) return "category";
      if (this.search) return "search";
      if (this.deals) return "deals";
      return "all";
    },
    cat() {
      return this.noir.cats.find((c) => c.name === this.categoryName) || null;
    },
    /* The products this page starts from. */
    base() {
      const all = this.noir.products;
      if (this.kind === "category") return this.cat ? inCat(this.cat.id) : all.filter((p) => String(p.category_id) === String(this.categoryName));
      if (this.kind === "search") return this.matches(this.search);
      if (this.kind === "deals") return all.filter((p) => this.pv(p).save > 0);
      return all;
    },
    prices() {
      return this.base.map((p) => this.pv(p).now);
    },
    lo() {
      return this.prices.length ? Math.floor(Math.min(...this.prices)) : 0;
    },
    hi() {
      return this.prices.length ? Math.ceil(Math.max(...this.prices)) : 0;
    },
    anyOffer() {
      return this.kind !== "deals" && this.base.some((p) => this.pv(p).save > 0);
    },
    /* Real filters: spec keys with two or more short values here (a long value,
       a sentence, is left out; a key with one value is no filter). */
    facets() {
      const map = new Map();
      for (const p of this.base) {
        for (const g of specGroups(p)) {
          for (const [k, v] of g.rows) {
            if (!map.has(k)) map.set(k, new Set());
            map.get(k).add(v);
          }
        }
      }
      return [...map.entries()]
        .map(([key, set]) => ({ key, values: [...set].filter((v) => String(v).length <= MAX_VALUE) }))
        .filter((x) => x.values.length >= 2)
        .sort((a, b) => a.values.length - b.values.length || 0);
    },
    sorts() {
      const s = [
        ["featured", t("bakini.n.ls.sFeatured", "Featured")],
        ["best", t("bakini.n.ls.sBest", "Best sellers")],
        ["review", t("bakini.n.ls.sReview", "Customer review")],
        ["low", t("bakini.n.ls.sLow", "Price: low to high")],
        ["high", t("bakini.n.ls.sHigh", "Price: high to low")],
        ["new", t("bakini.n.ls.sNew", "Newest")],
      ];
      return this.kind === "deals" ? [["saving", t("bakini.n.ls.sSaving", "Biggest saving")], ...s] : s;
    },
    sortLabel() {
      return (this.sorts.find((s) => s[0] === this.sort) || this.sorts[0])[1];
    },
    /* The filtered and sorted list, as last applied (the dim-and-fade step). */
    list() {
      const l = this.base.filter((p) => {
        if (this.tab !== "all" && p.category_id !== this.tab) return false;
        const now = this.pv(p).now;
        if (this.hi > this.lo && (now < this.min - 0.001 || now > this.max + 0.001)) return false;
        if (this.offer && !(this.pv(p).save > 0)) return false;
        for (const k of Object.keys(this.f)) if (this.f[k].length && !this.f[k].includes(specValue(p, k))) return false;
        return true;
      });
      return this.sorted(l);
    },
    /* What the grid shows: the list as of the last change applied (the cards
       dim while it updates, then the new ones fade up). */
    shown() {
      return this.snapshot || this.list;
    },
    active() {
      const out = [];
      for (const k of Object.keys(this.f))
        for (const v of this.f[k]) out.push({ id: k + ":" + v, label: v, clear: () => this.toggle(k, v) });
      if (this.offer) out.push({ id: "offer", label: t("bakini.n.ls.onOffer", "On offer"), clear: () => this.setOffer(false) });
      if (this.hi > this.lo && (this.min > this.lo || this.max < this.hi))
        out.push({
          id: "price",
          label: `${money(this.min)}–${money(this.max)}`,
          clear: () => {
            this.min = this.lo;
            this.max = this.hi;
            this.update();
          },
        });
      return out;
    },
    fillStyle() {
      const span = this.hi - this.lo || 1;
      return { left: ((this.min - this.lo) / span) * 100 + "%", right: (100 - ((this.max - this.lo) / span) * 100) + "%" };
    },
    catLine() {
      const c = this.cat;
      if (!c) return "";
      const offs = this.base.map((p) => this.pv(p).off);
      const every = offs.length && offs.every((o) => o > 0 && o === offs[0]);
      const desc = c.description || "";
      return [desc, every ? t("bakini.n.ls.everyOff", "Every piece {off}% off.", { off: offs[0] }) : ""].filter(Boolean).join(" ");
    },
    resultCats() {
      return [...new Set(this.base.map((p) => p.category_id))];
    },
    tabCats() {
      const ids = new Set(this.base.map((p) => p.category_id));
      return this.noir.cats.filter((c) => ids.has(c.id));
    },
    maxOff() {
      const offs = this.base.map((p) => this.pv(p).off).filter((x) => x > 0);
      return offs.length ? Math.max(...offs) : 0;
    },
    dealsEvery() {
      const offs = this.noir.products.map((p) => this.pv(p).off);
      return offs.length > 0 && offs.every((o) => o > 0 && o === offs[0]);
    },
    topSave() {
      return [...this.base].sort((a, b) => this.pv(b).save - this.pv(a).save || a.id - b.id)[0] || null;
    },
    loved() {
      return bySells(this.noir.products).slice(0, 12);
    },
    noMatchLine() {
      const words = this.noir.products.slice(0, 40).map((p) => String(p.title).split(/\s+/)[0]).filter((w) => w.length > 3);
      const ex = [...new Set(words)].slice(0, 3).join(", ").toLowerCase();
      return ex ? t("bakini.n.ls.noMatchP", "Try another word, such as {examples} — or browse a collection.", { examples: ex }) : t("bakini.n.ls.noMatchP0", "Try another word, or browse a collection.");
    },
  },

  watch: {
    base: {
      handler(list) {
        this.resetRange();
        this.snapshot = null;
        if (this.ready && (this.kind !== "category" || this.cat)) this.$emit("fetched", { parent: this.cat || null, products: list });
      },
      immediate: true,
    },
    search: {
      handler(v) {
        this.q = v || "";
        this.tab = "all";
      },
      immediate: true,
    },
    categoryName() {
      this.f = {};
      this.offer = false;
      this.tab = "all";
      this.animate = false;
    },
  },

  created() {
    loadNoir();
    this.sort = this.deals ? "saving" : { most_sales: "best", newest: "new", cheapest: "low", most_expensive: "high" }[this.initialSort] || "featured";
  },

  mounted() {
    this.onDoc = (e) => {
      if (this.sortOpen && this.$refs.sortw && !this.$refs.sortw.contains(e.target)) this.sortOpen = false;
    };
    this.onKey = (e) => {
      if (e.key !== "Escape") return;
      if (this.sortOpen) this.sortOpen = false;
      if (this.sheet) this.closeSheet();
    };
    document.addEventListener("click", this.onDoc, true);
    document.addEventListener("keydown", this.onKey);
  },

  beforeUnmount() {
    document.removeEventListener("click", this.onDoc, true);
    document.removeEventListener("keydown", this.onKey);
    clearTimeout(this.timer);
    if (this.sheet) document.documentElement.style.overflow = "";
  },

  methods: {
    t,
    money,
    hueOf,
    catOf,
    catTitle,
    catTo,
    pv(p) {
      void this.currency;
      return priceView(this.shop, p);
    },
    img(p) {
      return productImage(p, 128);
    },
    catImg(c, size = 512) {
      return catImage(c, size);
    },
    matches(q) {
      const words = String(q || "").toLowerCase().split(/\s+/).filter(Boolean);
      if (!words.length) return [];
      return this.noir.products
        .map((p) => {
          const title = String(p.title || "").toLowerCase();
          const hay = (title + " " + catTitle(catOf(p.category_id)) + " " + Object.values(p.spec || {}).flat().join(" ")).toLowerCase();
          let s = 0;
          for (const w of words) {
            if (title.includes(w)) s += 3;
            else if (hay.includes(w)) s += 1;
            else return { p, s: 0 };
          }
          return { p, s };
        })
        .filter((x) => x.s > 0)
        .sort((a, b) => b.s - a.s || (b.p.sells || 0) - (a.p.sells || 0))
        .map((x) => x.p);
    },
    sorted(l) {
      const out = [...l];
      const key = this.sort;
      if (key === "best") return bySells(out);
      if (key === "review") return out.sort((a, b) => (b.rate || 0) - (a.rate || 0) || (b.rate_count || 0) - (a.rate_count || 0));
      if (key === "low") return out.sort((a, b) => this.pv(a).now - this.pv(b).now || a.id - b.id);
      if (key === "high") return out.sort((a, b) => this.pv(b).now - this.pv(a).now || a.id - b.id);
      if (key === "new") return out.sort((a, b) => String(b.created_at || "").localeCompare(String(a.created_at || "")) || b.id - a.id);
      if (key === "saving") return out.sort((a, b) => this.pv(b).save - this.pv(a).save || a.id - b.id);
      return out;
    },
    resetRange() {
      this.min = this.lo;
      this.max = this.hi;
    },
    /* Dim, say "Updating results…", then draw the new list fading up. */
    update() {
      const still = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
      if (still) {
        this.animate = false;
        this.snapshot = [...this.list];
        return;
      }
      this.busy = true;
      clearTimeout(this.timer);
      this.timer = setTimeout(() => {
        this.busy = false;
        this.animate = true;
        this.drawn++;
        this.snapshot = [...this.list];
      }, 360);
    },
    picked(k, v) {
      return !!(this.f[k] && this.f[k].includes(v));
    },
    toggle(k, v) {
      const cur = [...(this.f[k] || [])];
      const i = cur.indexOf(v);
      if (i >= 0) cur.splice(i, 1);
      else cur.push(v);
      this.f = { ...this.f, [k]: cur };
      this.update();
    },
    setOffer(v) {
      this.offer = v;
      this.update();
    },
    setSort(s) {
      this.sort = s;
      this.sortOpen = false;
      this.update();
    },
    setTab(id) {
      this.tab = id;
      this.update();
    },
    onMin(v) {
      this.min = Math.min(Number(v), this.max);
    },
    onMax(v) {
      this.max = Math.max(Number(v), this.min);
    },
    boxMin(v) {
      const n = parseFloat(v);
      this.min = isNaN(n) ? this.lo : Math.max(this.lo, Math.min(n, this.max));
      this.update();
    },
    boxMax(v) {
      const n = parseFloat(v);
      this.max = isNaN(n) ? this.hi : Math.min(this.hi, Math.max(n, this.min));
      this.update();
    },
    reset() {
      this.f = {};
      this.offer = false;
      this.resetRange();
      this.update();
    },
    openSheet() {
      this.sheet = true;
      document.documentElement.style.overflow = "hidden";
    },
    closeSheet() {
      this.sheet = false;
      document.documentElement.style.overflow = "";
    },
    submitSearch() {
      const q = this.q.trim();
      if (!q) return;
      this.$router.push({ name: window.$storefront.routes.SHOP_PAGE, query: { search: q } });
    },
  },
};
</script>
