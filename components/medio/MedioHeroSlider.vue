<!--
  Medio — the home's first section as a photo slider (the owner's pick, hero
  option B of digini-design/medio-hero-b.html, 11 November 2026).

  One slide per category that has the owner's wide photo (assets/medio/
  wide-<slug>.webp), the biggest saving first, at most five. MedioHome picks
  the slides from the shop's live data (slides prop); this file draws them
  and plays them. Each slide: the photo with a dark scrim on the words' side,
  a kicker (the category and its top "% off"), a line for that kind of
  department, the pick's price sentence, "Shop <category>", a white card of
  the pick (the category's best-selling deal, else its biggest saving) and a
  magenta "Save" roundel. Under the slides, one pill tab per slide whose
  tint fills while its slide plays (never a bar under it), and a pause
  button.

  Plays 6 s a slide; holds while the pointer is on it or a key has focus in
  it, while the page is hidden, and from the start for "reduce motion". A
  swipe on a phone moves one slide. In Arabic the photo and its scrim are
  mirrored, so the words still sit on the photo's calm side.
-->
<template>
  <section
    :aria-label="t('medio.hero.label', 'Featured departments')"
    :class="{ '-skel': !shown.length }"
    aria-roledescription="carousel"
    class="md-hero-s"
    @focusin="focusIn"
    @focusout="hold_key = false"
    @mouseenter="hold_mouse = true"
    @mouseleave="hold_mouse = false"
    @touchend="touchEnd"
    @touchstart.passive="touchStart"
  >
    <div class="md-hero-s__slides">
      <div
        v-for="(s, k) in shown"
        :id="'md-hs-' + k"
        :key="s.cat.id"
        :aria-label="s.title"
        :class="{ '-on': k === on }"
        aria-roledescription="slide"
        class="md-hero-s__slide"
        role="tabpanel"
      >
        <span class="md-hero-s__ph">
          <img :fetchpriority="k === 0 ? 'high' : 'auto'" :src="s.photo.src" :srcset="s.photo.srcset || undefined" alt="" class="md-hero-s__img" sizes="(max-width: 960px) 100vw, 1376px" />
        </span>
        <div class="md-hero-s__txt">
          <span class="md-hero-s__kick"
            ><bdi>{{ s.title }}</bdi
            ><template v-if="s.pct > 0"> · <em class="md-hero-s__off">{{ t("medio.card.upToOff", "Up to {n}% off", { n: s.pct }) }}</em></template></span
          >
          <component :is="k === 0 ? 'h1' : 'h2'" class="md-hero-s__h">{{ s.line }}</component>
          <p v-if="s.sentence" :class="{ '-merchant': s.merchant }" class="md-hero-s__p">{{ s.sentence }}</p>
          <router-link :to="catTo(s.cat)" class="md-btn -white">
            {{ t("medio.hero.shop", "Shop {category}", { category: iso(s.title) }) }}<span aria-hidden="true" class="ms md-chev">chevron_right</span>
          </router-link>
        </div>
        <router-link :to="productTo(s.pick)" class="md-hero-s__pick">
          <span class="md-hero-s__pimg"><img :src="pic(s.pick)" :srcset="srcset(s.pick)" alt="" sizes="72px" @error="dropSrcset" /></span>
          <span class="md-hero-s__pt">
            <b>{{ s.pick.title }}</b>
            <span
              ><b>{{ full(s.money.now) }}</b
              ><em v-if="s.money.save > 0" class="md-hero-s__psave">{{ t("medio.card.save", "Save {amount}", { amount: whole(s.money.save) }) }}</em></span
            >
          </span>
        </router-link>
        <span v-if="s.money.save > 0" :ref="(el) => keep('rounds', k, el)" aria-hidden="true" class="md-hero-s__round"
          ><small>{{ t("medio.hero.save", "Save") }}</small><b>{{ breakable(whole(s.money.save)) }}</b></span
        >
      </div>
      <div v-if="!shown.length" aria-hidden="true" class="md-hero-s__skel"><i></i><i></i><i></i><i></i></div>
    </div>

    <div class="md-hero-s__bar">
      <div ref="tabs" :aria-label="t('medio.hero.label', 'Featured departments')" class="md-hero-s__tabs" role="tablist" @keydown="keys">
        <button
          v-for="(s, k) in shown"
          :key="s.cat.id"
          :ref="(el) => keep('tabEls', k, el)"
          :aria-controls="'md-hs-' + k"
          :aria-selected="k === on ? 'true' : 'false'"
          :class="{ '-on': k === on }"
          :tabindex="k === on ? 0 : -1"
          class="md-hero-s__tab"
          role="tab"
          type="button"
          @click="go(k)"
        >
          <i :ref="(el) => keep('fills', k, el)" aria-hidden="true" class="md-hero-s__fill"></i>
          <span aria-hidden="true" class="ms">{{ s.icon }}</span>
          <span class="md-hero-s__tt"
            ><b>{{ s.title }}</b><small :class="{ '-sale': s.save > 0 }">{{ s.tabLine }}</small></span
          >
        </button>
        <template v-if="!shown.length">
          <span v-for="n in 5" :key="n" aria-hidden="true" class="md-hero-s__tab -skel"></span>
        </template>
      </div>
      <button
        v-if="shown.length > 1"
        :aria-label="paused ? t('medio.hero.play', 'Play the slides') : t('medio.hero.pause', 'Pause the slides')"
        :aria-pressed="paused ? 'true' : 'false'"
        class="md-hero-s__pause"
        type="button"
        @click="paused = !paused"
      >
        <span aria-hidden="true" class="ms">{{ paused ? "play_arrow" : "pause" }}</span>
      </button>
    </div>
  </section>
</template>

<script>
import { aisleRoute, dropSrcset, productSrcset } from "../kalio/kalio-catalog";
import { isRtl } from "../region-switcher/region";
import { iso, moneyText } from "./medio";
import { breakable, fitInCircle } from "./fit-in-circle";
import { t } from "../kalio/i18n/kalio-i18n";

/** How long a slide plays (ms). */
const SPAN = 6000;

/* A line and an icon for each kind of department, found in the category's
   slug and title (so any shop's categories get one; a category that is none
   of these gets the general line). The first match wins: "microphone" is
   tried before "phone", "mouse" before "computer". */
const KINDS = [
  { re: /micro ?phone|\bmics?\b/, icon: "mic", line: () => t("medio.hero.line.mic", "Sound like a pro.") },
  { re: /camera|camcorder|\bdslr\b|\blens/, icon: "photo_camera", line: () => t("medio.hero.line.camera", "Catch every golden hour.") },
  { re: /\btvs?\b|television|projector/, icon: "tv", line: () => t("medio.hero.line.tv", "Cinema nights, sorted.") },
  { re: /keyboard|\bmouse|\bmice\b/, icon: "keyboard", line: () => t("medio.hero.line.input", "Every click, every key.") },
  { re: /laptop|notebook|computer|\bpcs?\b|tablet/, icon: "laptop_mac", line: () => t("medio.hero.line.laptop", "Power for work and play.") },
  { re: /monitor|display|screen/, icon: "desktop_windows", line: () => t("medio.hero.line.monitor", "See the whole picture.") },
  { re: /power|batter|charg|generator|solar|\brv\b/, icon: "battery_charging_full", line: () => t("medio.hero.line.power", "Power that goes where you go.") },
  { re: /head ?phone|ear ?buds?|earphone|speaker|audio|sound/, icon: "headphones", line: () => t("medio.hero.line.audio", "Sound that moves you.") },
  { re: /phone|mobile/, icon: "smartphone", line: () => t("medio.hero.line.phone", "Your next phone is here.") },
  { re: /print/, icon: "print", line: () => t("medio.hero.line.print", "Sharp prints, every time.") },
  { re: /drive|storage|\bssd\b|memory/, icon: "hard_drive", line: () => t("medio.hero.line.storage", "Room for everything.") },
  { re: /gam(e|ing)|console/, icon: "sports_esports", line: () => t("medio.hero.line.gaming", "Level up your setup.") },
  { re: /watch|wearable|fitness/, icon: "watch", line: () => t("medio.hero.line.watch", "Time for an upgrade.") },
];

export default {
  name: "MedioHeroSlider",
  props: {
    /** [{ cat, photo, pick, money: { now, was, save }, save, pct, from }] from MedioHome; [] while loading. */
    slides: { type: Array, default: () => [] },
    currency: { type: String, default: "" },
  },

  data: () => ({
    on: 0,
    paused: false,
    hold_mouse: false,
    hold_key: false,
  }),

  computed: {
    shown() {
      return this.slides.map((s) => {
        const title = s.cat.title || s.cat.name || "";
        const text = `${s.cat.name || ""} ${title}`.toLowerCase().replace(/[-_]+/g, " ");
        const kind = KINDS.find((k) => k.re.test(text));
        const deal = s.money.save > 0 && s.money.was;
        return {
          ...s,
          title,
          icon: kind ? kind.icon : "devices",
          line: kind ? kind.line() : t("medio.hero.line.any", "{category}, for less.", { category: iso(title) }),
          sentence: deal
            ? t("medio.hero.nowWas", "The {name} is now {now}, was {was}.", { name: iso(s.pick.title), now: this.full(s.money.now), was: this.full(s.money.was) })
            : s.cat.description || "",
          merchant: !deal,
          tabLine:
            s.save > 0
              ? t("medio.header.upTo", "Up to {amount} off", { amount: this.whole(s.save) })
              : t("medio.home.from", "From {amount}", { amount: moneyText(Math.floor(s.from || 0), this.currency, true) }), /* whole, never rounded up */
        };
      });
    },
  },

  watch: {
    "slides.length"() {
      this.on = 0;
      this.elapsed = 0;
    },
    /* New amounts (data, currency): fit them in their circles again. */
    shown: {
      handler() {
        this.$nextTick(this.fitRounds);
      },
      flush: "post",
    },
    paused() {
      this.last = 0;
    },
  },

  created() {
    /* Not reactive: written every frame. */
    this.fills = [];
    this.tabEls = [];
    this.elapsed = 0;
    this.last = 0;
    this.raf = 0;
    this.touch = null;
    this.rounds = [];
    this.resized = 0;
  },

  mounted() {
    try {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) this.paused = true;
    } catch {
      /* no matchMedia: play */
    }
    this.raf = requestAnimationFrame(this.tick);
    this.fitRounds();
    document.fonts?.ready.then(this.fitRounds).catch(() => {});
    window.addEventListener("resize", this.onResize, { passive: true });
  },

  beforeUnmount() {
    cancelAnimationFrame(this.raf);
    window.removeEventListener("resize", this.onResize);
  },

  methods: {
    t,
    iso,
    dropSrcset,
    whole(n) {
      return moneyText(Math.round(n || 0), this.currency, true);
    },
    full(n) {
      return moneyText(n || 0, this.currency, false);
    },
    /* In the circle a long amount may take two lines ("AED" over "1,837"). */
    breakable,
    pic(p) {
      return p?.icon ? window.CDN.GET_SHOP_IMAGE_PATH(p.icon, null) : null;
    },
    srcset(p) {
      return productSrcset(p);
    },
    catTo(c) {
      return aisleRoute(c);
    },
    productTo(p) {
      return { name: window.$storefront.routes.PRODUCT_PAGE, params: { product_id: p.id } };
    },
    /* The Save circles: every amount stays inside its circle (the owner's
       rule, 11 Nov 2026: "AED 1,837" ran out of it), smaller or on two
       lines, in every currency and language (fit-in-circle.ts). */
    fitRounds() {
      this.rounds.forEach((el) => fitInCircle(el));
    },
    onResize() {
      clearTimeout(this.resized);
      this.resized = setTimeout(this.fitRounds, 150);
    },
    /* The tabs and their tints, kept outside Vue's reactivity. */
    keep(list, k, el) {
      this[list][k] = el;
    },

    /* One frame: the playing tab's tint grows; at the end, the next slide. */
    tick(now) {
      const n = this.shown.length;
      const dt = this.last ? Math.min(100, now - this.last) : 0;
      this.last = now;
      if (n > 1 && !this.paused && !this.hold_mouse && !this.hold_key && !document.hidden) this.elapsed += dt;
      const f = Math.min(1, this.elapsed / SPAN);
      const el = this.fills[this.on];
      if (el) el.style.transform = `scaleX(${f.toFixed(4)})`;
      if (f >= 1 && n > 1) this.go((this.on + 1) % n, false);
      this.raf = requestAnimationFrame(this.tick);
    },
    go(k, focus = false) {
      const old = this.fills[this.on];
      if (old) old.style.transform = "scaleX(0)";
      this.on = k;
      this.elapsed = 0;
      this.$nextTick(() => {
        const tab = this.tabEls[k];
        if (!tab) return;
        if (focus) tab.focus({ preventScroll: true });
        /* Keep the playing tab in the phone's scrolling row, without moving
           the page when the hero is out of sight. */
        const row = this.$refs.tabs;
        if (row && row.scrollWidth > row.clientWidth) {
          const r = tab.getBoundingClientRect();
          if (r.top >= 0 && r.bottom <= window.innerHeight) tab.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
        }
      });
    },
    /* Arrow keys move along the tabs (mirrored in Arabic), Home and End jump. */
    keys(e) {
      const n = this.shown.length;
      if (!n) return;
      const back = isRtl() ? "ArrowRight" : "ArrowLeft";
      const fwd = isRtl() ? "ArrowLeft" : "ArrowRight";
      let k = null;
      if (e.key === fwd) k = (this.on + 1) % n;
      else if (e.key === back) k = (this.on - 1 + n) % n;
      else if (e.key === "Home") k = 0;
      else if (e.key === "End") k = n - 1;
      if (k === null) return;
      e.preventDefault();
      this.go(k, true);
    },
    /* A key's focus holds the slide; a click's focus does not. */
    focusIn(e) {
      try {
        this.hold_key = e.target.matches(":focus-visible");
      } catch {
        this.hold_key = false;
      }
    },
    touchStart(e) {
      if (e.target.closest(".md-hero-s__bar")) return (this.touch = null);
      const p = e.changedTouches[0];
      this.touch = { x: p.clientX, y: p.clientY };
    },
    touchEnd(e) {
      if (!this.touch) return;
      const p = e.changedTouches[0];
      const dx = p.clientX - this.touch.x;
      const dy = p.clientY - this.touch.y;
      this.touch = null;
      const n = this.shown.length;
      if (n < 2 || Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
      const fwd = (dx < 0) !== isRtl();
      this.go((this.on + (fwd ? 1 : -1) + n) % n);
    },
  },
};
</script>
