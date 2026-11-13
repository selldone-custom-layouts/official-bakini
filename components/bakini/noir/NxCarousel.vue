<!--
  Bakini Noir — the home's first section (bakio-design/home-hero4-b.html, "Slider 2 · Carousel"),
  in place of the stage that blew one 640 px product photo up (soft, and cut at the top).

  The shop's line and headline, then every collection that has pieces, best-selling first, as a
  tall arched card holding the collection's portrait photo (hero-photos.ts; a collection without
  one shows a collage of its own three best sellers). The chosen card stands in the middle with
  its name on glass; two more on each side step back, smaller and dimmer. Arrows, a click on a
  side card, the arrow keys or a swipe turn it; it never moves by itself. Under it: the count,
  the collection's best seller with its quantity box, and "Shop <collection>".
  Right to left, the cards and the arrows mirror.
-->
<template>
  <section :style="{ '--bk-hue': hue }" aria-labelledby="hp-h" class="hp">
    <div class="wrap hp-hd">
      <p v-if="eyebrow" class="eyebrow">{{ eyebrow }}</p>
      <h1 id="hp-h" class="hp-h">{{ t("bakini.n.home.h1", "Pastry,") }} <em>{{ t("bakini.n.home.h1em", "in the spotlight.") }}</em></h1>
      <p v-if="lede" class="hp-lede">{{ lede }}</p>
    </div>

    <div
      v-if="items.length"
      :aria-label="t('bakini.n.home.carouselAria', 'Collections')"
      aria-roledescription="carousel"
      class="hp-stage"
      role="group"
      @keydown="keys"
      @pointercancel="x0 = null"
      @pointerdown="down"
      @pointerup="up"
      @click.capture="guard"
    >
      <div class="hp-track">
        <button
          v-for="(it, k) in items"
          :key="it.cat.id"
          :aria-current="k === cur ? 'true' : undefined"
          :aria-label="t('bakini.n.home.showCat', 'Show {name}', { name: catTitle(it.cat) })"
          :class="['hp-card', { on: k === cur, far: dist(k) > 2 }]"
          :style="cardStyle(k)"
          :tabindex="dist(k) === 1 ? 0 : -1"
          type="button"
          @click="k !== cur && go(k)"
        >
          <span :style="{ '--bk-hue': hueOf(it.cat.id) }" class="hp-arch">
            <img v-if="it.photo" :fetchpriority="k === cur ? 'high' : 'low'" :src="it.photo" alt="" decoding="async" draggable="false" height="1125" loading="eager" width="900" />
            <span v-else aria-hidden="true" class="hp-collage">
              <img v-for="p in it.top" :key="p.id" :src="img(p)" alt="" draggable="false" />
            </span>
          </span>
          <span aria-hidden="true" class="hp-cap"><b>{{ catTitle(it.cat) }}</b><span>{{ meta(it) }}</span></span>
        </button>
      </div>
      <template v-if="items.length > 1">
        <button :aria-label="t('bakini.n.home.prevCat', 'Previous collection')" class="arrow hp-prev" type="button" @click="go(cur - 1)"><nx-icon :name="rtl ? 'right' : 'left'" /></button>
        <button :aria-label="t('bakini.n.home.nextCat', 'Next collection')" class="arrow hp-next" type="button" @click="go(cur + 1)"><nx-icon :name="rtl ? 'left' : 'right'" /></button>
      </template>
    </div>

    <div v-if="active" aria-live="polite" class="wrap hp-detail">
      <p v-if="items.length > 1" class="hp-count"><span>{{ pad(cur + 1) }}</span> / {{ pad(items.length) }}</p>
      <div v-if="active.best" class="hp-best">
        <router-link :to="productTo(active.best)" aria-hidden="true" class="th" tabindex="-1"><img :src="thumb(active.best)" alt="" /></router-link>
        <div class="tx">
          <span class="eyebrow">{{ t("bakini.badge.best", "Best seller") }}</span>
          <b><router-link :to="productTo(active.best)">{{ active.best.title }}</router-link></b>
          <span class="pr"
            ><span class="money now">{{ money(pv(active.best).now) }}</span>{{ " " }}<span v-if="pv(active.best).was" class="was money">{{ money(pv(active.best).was) }}</span
            >{{ " · " + t("bakini.n.card.per", "per {unit}", { unit: unitOf(active.best).toLowerCase() }) }}</span
          >
        </div>
        <nx-qb :product="active.best" />
      </div>
      <router-link :to="catTo(active.cat)" class="btn lg">{{ t("bakini.n.home.shopCol", "Shop {name}", { name: catTitle(active.cat).toLowerCase() }) }}<nx-icon name="arrow" /></router-link>
    </div>
  </section>
</template>

<script>
import NxIcon from "./NxIcon.vue";
import NxQb from "./NxQb.vue";
import { bySells, catTitle, catTo, hueOf, inCat, money, priceView, productImage, productTo, unitOf } from "./noir";
import { heroPhotoOf } from "./hero-photos";
import { currentCurrency, isRtl } from "../../region-switcher/region";
import { t } from "../../kalio/i18n/kalio-i18n";

export default {
  name: "NxCarousel",
  components: { NxIcon, NxQb },
  props: {
    /** The collections, best-selling first. */
    cats: { type: Array, default: () => [] },
    eyebrow: { type: String, default: "" },
    lede: { type: String, default: "" },
  },

  data: () => ({ cur: 0, x0: null, y0: 0, swiped: 0 }),

  computed: {
    shop() {
      return this.$store.getters.getShop;
    },
    currency() {
      return currentCurrency();
    },
    rtl() {
      return isRtl();
    },
    items() {
      return this.cats
        .map((c) => {
          const list = inCat(c.id);
          const top = bySells(list.filter((p) => p.quantity > 0));
          const ranked = top.length ? top : bySells(list);
          return { cat: c, list, top: ranked.slice(0, 3), best: ranked[0] || null, photo: heroPhotoOf(c) };
        })
        .filter((x) => x.list.length);
    },
    active() {
      return this.items[this.cur] || this.items[0] || null;
    },
    hue() {
      return hueOf(this.active?.cat?.id);
    },
  },

  watch: {
    "items.length"(n) {
      if (this.cur >= n) this.cur = 0;
    },
  },

  methods: {
    t,
    money,
    hueOf,
    catTitle,
    catTo,
    productTo,
    unitOf,
    pv(p) {
      void this.currency;
      return priceView(this.shop, p);
    },
    img(p) {
      return productImage(p); // the shop's own size (Selldone serves no 256 or 512 copy of a product photo)
    },
    thumb(p) {
      return productImage(p, 128);
    },
    pad(n) {
      return String(n).padStart(2, "0");
    },
    meta(it) {
      void this.currency;
      const from = Math.min(...it.list.map((p) => this.pv(p).now));
      return t("bakini.n.home.catMeta", { one: "{n} piece · from {price}", other: "{n} pieces · from {price}" }, { n: it.list.length, price: this.money(from) });
    },
    /** Signed distance of card k from the chosen one, the short way round. */
    off(k) {
      const n = this.items.length;
      let o = k - this.cur;
      if (o > n / 2) o -= n;
      if (o < -n / 2) o += n;
      return o;
    },
    dist(k) {
      return Math.abs(this.off(k));
    },
    cardStyle(k) {
      const o = this.off(k);
      return { "--o": o * (this.rtl ? -1 : 1), "--a": Math.abs(o), zIndex: 10 - Math.abs(o) };
    },
    go(i) {
      const n = this.items.length;
      if (n) this.cur = (i + n) % n;
    },
    keys(e) {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      e.preventDefault();
      this.go(this.cur + ((e.key === "ArrowRight") !== this.rtl ? 1 : -1));
    },
    down(e) {
      if (e.pointerType === "mouse" && e.button) return;
      this.x0 = e.clientX;
      this.y0 = e.clientY;
    },
    up(e) {
      if (this.x0 === null) return;
      const dx = e.clientX - this.x0;
      const dy = e.clientY - this.y0;
      this.x0 = null;
      if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.3) {
        this.swiped = Date.now();
        this.go(this.cur + (dx < 0 !== this.rtl ? 1 : -1));
      }
    },
    /** A mouse drag ends in a click on the card under it; that click must not turn the carousel back. */
    guard(e) {
      if (Date.now() - this.swiped < 400) {
        e.stopPropagation();
        e.preventDefault();
      }
    },
  },
};
</script>
