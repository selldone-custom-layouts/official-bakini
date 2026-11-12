<!--
  Bakini Noir — the header (b/core.js header(), megaHTML(), searchHTML(),
  regionHTML(), acctHTML(), pmenuHTML()): a slim glass bar that sticks to
  the top: the wordmark (the shop's live title) on the left; "Shop ⌄" (the
  collections panel), the collections themselves (from 1240px) and Deals in
  the middle; search, the language & currency pill, the account and the bag
  with its count on the right.

  Every panel opens on a click and closes on a second click, Esc, a click
  outside or a page change, with no scrim (noir.ts layers). The panels are
  teleported to <body> (the glass bar's backdrop-filter would trap fixed
  panels inside it). Phone (≤760px): the menu button, the wordmark (never
  lost), search and the bag; the menu is a full panel under the bar with the
  collections (the first 6, "Show N more" past 8), Deals, the bakery's pages,
  the account and the "Language & currency" row, which opens a bottom sheet.
  No bottom tab bar. A shop with custom header code keeps Selldone's header
  (StorefrontLayout).
-->
<template>
  <div v-if="!$store.getters.getIsNative" class="nx nx-hdrwrap">
    <a class="skip" href="#main" @click.prevent="skip">{{ t("bakini.n.hdr.skip", "Skip to content") }}</a>
    <header id="hdr" class="hdr">
      <div class="hdr-in">
        <button
          :aria-expanded="is('pmenu') ? 'true' : 'false'"
          :aria-label="is('pmenu') ? t('bakini.n.hdr.closeMenu', 'Close menu') : t('bakini.n.hdr.menu', 'Menu')"
          aria-controls="pmenu"
          class="iconbtn menu-btn"
          type="button"
          @click="toggle('pmenu', $event)"
        >
          <nx-icon :name="is('pmenu') ? 'close' : 'menu'" />
        </button>
        <bakini-logo />
        <nav :aria-label="t('bakini.n.hdr.collections', 'Collections')" class="hdr-nav">
          <button :aria-expanded="is('mega') ? 'true' : 'false'" aria-controls="mega" type="button" @click="toggle('mega', $event)">
            {{ t("bakini.n.hdr.shop", "Shop") }}<nx-icon name="down" />
          </button>
          <span class="hdr-cats">
            <router-link v-for="c in cats" :key="c.id" :aria-current="c.name === currentCat ? 'page' : undefined" :to="catTo(c)"><bdi>{{ catTitle(c) }}</bdi></router-link>
          </span>
          <router-link :aria-current="onDeals ? 'page' : undefined" :to="dealsTo" class="deal">{{ t("bakini.n.hdr.deals", "Deals") }}</router-link>
        </nav>
        <div class="hdr-tools">
          <button :aria-expanded="is('srch') ? 'true' : 'false'" :aria-label="t('bakini.n.hdr.search', 'Search')" aria-controls="srch" class="iconbtn" type="button" @click="toggle('srch', $event)">
            <nx-icon name="search" />
          </button>
          <button
            v-if="regionOn"
            :key="regionKey"
            :aria-expanded="is('region') ? 'true' : 'false'"
            :aria-label="t('bakini.n.hdr.regionAria', 'Language and currency: {value}', { value: regionLabel })"
            aria-controls="region"
            class="pill-region"
            type="button"
            @click="toggle('region', $event)"
          >
            <nx-icon name="globe" />{{ regionLabel }}
          </button>
          <button :aria-expanded="is('acct') ? 'true' : 'false'" :aria-label="t('bakini.n.hdr.account', 'Account')" aria-controls="acct" class="iconbtn acct-btn" type="button" @click="toggle('acct', $event)">
            <nx-icon name="user" />
          </button>
          <button
            :aria-label="t('bakini.n.hdr.bagAria', { one: 'Bag, {n} piece', other: 'Bag, {n} pieces' }, { n: units })"
            aria-controls="drawer"
            class="iconbtn bag-btn"
            type="button"
            @click="toggle('drawer', $event)"
          >
            <nx-icon name="bag" /><span :data-n="units" class="count">{{ units > 99 ? "99+" : units }}</span>
          </button>
        </div>
      </div>
    </header>

    <teleport to="body">
      <div :dir="rtl ? 'rtl' : 'ltr'" class="nx nx-layers">
        <!-- Shop: every collection with its photo and line; the side links. -->
        <div id="mega" :aria-label="t('bakini.n.hdr.shopCollections', 'Shop the collections')" :class="['drop', { open: is('mega') }]" role="region">
          <div class="drop-in">
            <div class="mega">
              <div class="mega-cats">
                <router-link v-for="c in cats" :key="c.id" :style="{ '--bk-hue': hueOf(c.id) }" :to="catTo(c)" class="mega-cat">
                  <div class="ph"><img v-if="catImg(c)" :src="catImg(c)" alt="" class="cut" loading="lazy" /></div>
                  <div><b><bdi>{{ catTitle(c) }}</bdi></b><span v-if="c.description"><bdi>{{ c.description }}</bdi></span></div>
                </router-link>
              </div>
              <div class="mega-side">
                <router-link :to="dealsTo"><nx-icon name="tag" /><span><b>{{ t("bakini.n.hdr.deals", "Deals") }}</b><small>{{ dealsLine }}</small></span></router-link>
                <router-link :to="lovedTo"><nx-icon name="heart" /><span><b>{{ t("bakini.n.hdr.loved", "Most loved") }}</b><small>{{ t("bakini.n.hdr.lovedL", "Ranked by what sells") }}</small></span></router-link>
                <router-link :to="compareTo"><nx-icon name="compare" /><span><b>{{ t("bakini.n.hdr.compare", "Compare") }}</b><small>{{ t("bakini.n.hdr.compareL", "Side by side, row by row") }}</small></span></router-link>
                <router-link :to="blogTo"><nx-icon name="book" /><span><b>{{ t("bakini.n.hdr.journal", "Journal") }}</b><small>{{ t("bakini.n.hdr.journalL", "Stories from the counter") }}</small></span></router-link>
              </div>
            </div>
          </div>
        </div>

        <!-- Search: suggestions while typing (the live catalogue); Enter opens every result. -->
        <div id="srch" :class="['drop', { open: is('srch') }]" role="search">
          <div class="drop-in">
            <form class="srch-form" @submit.prevent="submit()">
              <nx-icon name="search" />
              <input
                ref="q"
                :aria-label="t('bakini.n.hdr.searchLabel', 'Search the bakery')"
                :placeholder="t('bakini.n.hdr.searchPh', 'Search {examples}…', { examples: searchExamples })"
                :value="q"
                autocomplete="off"
                enterkeyhint="search"
                type="search"
                @input="q = $event.target.value"
                @keydown.down.prevent="move(1)"
                @keydown.up.prevent="move(-1)"
              />
              <button class="btn sm" type="submit">{{ t("bakini.n.hdr.search", "Search") }}</button>
            </form>
            <div class="srch-body">
              <div v-if="!query" class="srch-pop">
                <span class="lbl">{{ t("bakini.n.hdr.popular", "Popular") }}</span>
                <router-link v-for="w in popular" :key="w" :to="searchTo(w)" class="chip">{{ w }}</router-link>
              </div>
              <template v-else>
                <div v-if="sugCats.length" class="srch-pop" style="margin-bottom: 10px">
                  <router-link v-for="c in sugCats" :key="c.id" :to="catTo(c)" class="chip"><img v-if="catImg(c)" :src="catImg(c)" alt="" /><bdi>{{ catTitle(c) }}</bdi></router-link>
                </div>
                <div v-if="hits.length" class="sugg" role="listbox">
                  <router-link v-for="(p, i) in hits" :key="p.id" :class="{ hl: i === cursor }" :style="{ '--bk-hue': hueOf(p.category_id) }" :to="productTo(p)" role="option">
                    <span class="th"><img :src="thumb(p)" alt="" /></span>
                    <span style="min-width: 0"><b v-html="mark(p.title)"></b><small><bdi>{{ catTitle(catOf(p.category_id)) }}</bdi> · {{ t("bakini.n.card.per", "per {unit}", { unit: unitOf(p) }) }}</small></span>
                    <span class="pr money">{{ money(priceView(shop, p).now) }}</span>
                  </router-link>
                </div>
                <p v-if="!hits.length && !sugCats.length" class="muted" style="padding: 6px 4px">
                  {{ t("bakini.n.hdr.noMatch", "Nothing matches “{q}”. Try another word.", { q: query }) }}
                </p>
                <div v-else class="sugg-all">
                  <router-link :to="searchTo(query)" class="link">{{ t("bakini.n.hdr.allFor", "See every result for “{q}”", { q: query }) }}<nx-icon name="arrow" /></router-link>
                </div>
              </template>
            </div>
          </div>
        </div>

        <!-- Language and currency (the region-switcher kit's chips). -->
        <div v-if="regionOn" id="region" ref="region" :aria-label="t('region.title', 'Language & currency')" :class="['pop', { open: is('region') }]" :style="popPos.region" role="dialog">
          <h3>{{ regionTitle }}</h3>
          <region-chips :key="regionKey" @picked="closeLayer()" />
          <p class="note">{{ regionNote }}</p>
        </div>

        <!-- Account. -->
        <div id="acct" ref="acct" :aria-label="t('bakini.n.hdr.account', 'Account')" :class="['pop', 'acct-pop', { open: is('acct') }]" :style="popPos.acct" role="dialog">
          <h3>{{ user ? t("bakini.n.hdr.hello", "Hello, {name}", { name: firstName }) : t("bakini.n.hdr.yourAccount", "Your account") }}</h3>
          <button v-if="!user" class="btn block" type="button" @click="signIn">{{ t("bakini.n.hdr.signIn", "Sign in") }}</button>
          <div class="acct-links">
            <router-link :to="accountTo"><nx-icon name="grid" />{{ t("bakini.n.hdr.overview", "Overview") }}</router-link>
            <router-link :to="ordersTo"><nx-icon name="box" />{{ t("bakini.n.hdr.orders", "Orders") }}</router-link>
            <router-link :to="addressesTo"><nx-icon name="pin" />{{ t("bakini.n.hdr.addresses", "Addresses") }}</router-link>
            <a v-if="user" href="#" @click.prevent="signOut"><nx-icon name="logout" />{{ t("bakini.n.hdr.signOut", "Sign out") }}</a>
          </div>
          <p v-if="!user" class="note">{{ t("bakini.n.hdr.guestNote", "Checkout works without an account.") }}</p>
        </div>

        <!-- The phone menu: a panel under the bar. -->
        <nav id="pmenu" :aria-label="t('bakini.n.hdr.menu', 'Menu')" :class="['pmenu', { open: is('pmenu') }]">
          <div class="pmenu-in">
            <p class="pm-h">{{ t("bakini.n.hdr.collections", "Collections") }}</p>
            <div class="pm-list">
              <router-link v-for="c in menuFirst" :key="c.id" :to="catTo(c)">
                <span class="ic"><img v-if="catImg(c)" :src="catImg(c)" alt="" loading="lazy" /></span><span><bdi>{{ catTitle(c) }}</bdi></span><nx-icon cls="chev" name="right" />
              </router-link>
              <template v-if="menuRest.length && moreOpen">
                <router-link v-for="c in menuRest" :key="c.id" :to="catTo(c)">
                  <span class="ic"><img v-if="catImg(c)" :src="catImg(c)" alt="" loading="lazy" /></span><span><bdi>{{ catTitle(c) }}</bdi></span><nx-icon cls="chev" name="right" />
                </router-link>
              </template>
              <button v-if="menuRest.length" :aria-expanded="moreOpen ? 'true' : 'false'" class="pm-more" type="button" @click="moreOpen = !moreOpen">
                <span class="ic"><nx-icon :name="moreOpen ? 'minus' : 'down'" /></span>
                <span>{{ moreOpen ? t("bakini.n.hdr.fewer", "Show fewer") : t("bakini.n.hdr.more", "Show {n} more", { n: menuRest.length }) }}</span><span></span>
              </button>
            </div>
            <div class="pm-list">
              <router-link :to="dealsTo"><span class="ic"><nx-icon name="tag" /></span><span>{{ t("bakini.n.hdr.deals", "Deals") }}<small>{{ dealsLine }}</small></span><nx-icon cls="chev" name="right" /></router-link>
              <router-link :to="blogTo"><span class="ic"><nx-icon name="book" /></span><span>{{ t("bakini.n.hdr.journal", "Journal") }}</span><nx-icon cls="chev" name="right" /></router-link>
              <router-link :to="aboutTo"><span class="ic"><nx-icon name="info" /></span><span>{{ t("bakini.n.hdr.about", "About") }}</span><nx-icon cls="chev" name="right" /></router-link>
              <router-link :to="contactTo"><span class="ic"><nx-icon name="phone" /></span><span>{{ t("bakini.n.hdr.contact", "Contact") }}</span><nx-icon cls="chev" name="right" /></router-link>
            </div>
            <div class="pm-list">
              <router-link v-if="user" :to="accountTo"><span class="ic"><nx-icon name="user" /></span><span>{{ firstName }}<small>{{ t("bakini.n.hdr.acctLine", "Orders, addresses and profile") }}</small></span><nx-icon cls="chev" name="right" /></router-link>
              <button v-else type="button" @click="signIn"><span class="ic"><nx-icon name="user" /></span><span>{{ t("bakini.n.hdr.signIn", "Sign in") }}<small>{{ t("bakini.n.hdr.acctLine", "Orders, addresses and profile") }}</small></span><nx-icon cls="chev" name="right" /></button>
              <button v-if="regionOn" :key="regionKey" aria-controls="langsheet" type="button" @click="openLayer('langsheet', $event.currentTarget)">
                <span class="ic"><nx-icon name="globe" /></span><span>{{ t("region.title", "Language & currency") }}<small>{{ regionLong }}</small></span><nx-icon cls="chev" name="right" />
              </button>
            </div>
          </div>
        </nav>

        <!-- The language & currency sheet (phone). -->
        <div v-if="regionOn" id="langsheet" :aria-label="t('region.title', 'Language & currency')" :class="['bsheet', { open: is('langsheet') }]" aria-modal="true" role="dialog">
          <div class="grab"></div>
          <h2>{{ t("region.title", "Language & currency") }}</h2>
          <region-chips :key="regionKey" />
          <p class="muted" style="font-size: 13px; margin: 14px 0 18px">{{ regionNote }}</p>
          <button class="btn block" type="button" @click="closeLayer()">{{ t("region.done", "Done") }}</button>
        </div>

        <div :class="['scrim', { open: scrim }]" @click="closeLayer()"></div>
        <nx-bag-drawer />
        <nx-quick />
      </div>
    </teleport>
  </div>
</template>

<script>
import BakiniLogo from "../BakiniLogo.vue";
import NxIcon from "../noir/NxIcon.vue";
import NxBagDrawer from "../noir/NxBagDrawer.vue";
import NxQuick from "../noir/NxQuick.vue";
import RegionChips from "../../region-switcher/RegionChips.vue";
import { EventBus } from "@selldone/components-vue/utils/events/EventBus.ts";
import { catalogueRoute, dealsRoute } from "../../kalio/kalio-catalog";
import { journalRoute } from "../../kalio/pages/kalio-journal";
import { currencies, currentCurrency, currentLanguage, hasChoice, isRtl, languages, regionLabel, regionState, showLanguages } from "../../region-switcher/region";
import {
  catImage,
  catOf,
  catTitle,
  catTo,
  closeLayer,
  closeOnRoute,
  hueOf,
  isModal,
  layer,
  loadNoir,
  money,
  noir,
  openLayer,
  priceView,
  productImage,
  productTo,
  toggleLayer,
  unitOf,
  wireLayers,
} from "../noir/noir";
import { percentOff } from "../../kalio/kalio-catalog";
import { t } from "../../kalio/i18n/kalio-i18n";

/* Words that say nothing about a pastry, left out of "Popular". */
const STOP = new Set(["and", "with", "the", "of", "a", "an", "in", "on", "mini", "classic", "double", "cake", "cakes"]);

export default {
  name: "BakiniHeader",
  components: { BakiniLogo, NxIcon, NxBagDrawer, NxQuick, RegionChips },
  props: {
    showSearch: { type: Boolean, default: true },
  },
  emits: ["search", "clear"],

  data: () => ({ q: "", cursor: -1, moreOpen: false, popPos: { region: {}, acct: {} }, layer, noir, region: regionState }),

  computed: {
    shop() {
      return this.$store.getters.getShop;
    },
    user() {
      return this.$store.getters.getUser;
    },
    firstName() {
      return String(this.user?.name || "").split(/\s+/)[0].slice(0, 16);
    },
    rtl() {
      void this.region.language;
      return isRtl();
    },
    cats() {
      return this.noir.cats;
    },
    currentCat() {
      return this.$route?.params?.category_name || null;
    },
    onDeals() {
      return !!this.$route?.query?.filter && /only_has_discount/.test(String(this.$route.query.filter)) && !this.currentCat;
    },
    units() {
      return this.getBaskets().reduce((sum, b) => sum + (b?.items || []).reduce((n, it) => n + (it.count || 0), 0), 0);
    },
    scrim() {
      return !!this.layer.open && isModal(this.layer.open);
    },
    /* The region package reads its words when it draws. */
    regionKey() {
      return t("region.title", "Language & currency") + this.region.words;
    },
    regionOn() {
      void this.shop;
      return hasChoice();
    },
    regionLabel() {
      void this.region.currency;
      void this.region.language;
      void this.shop;
      return regionLabel();
    },
    regionTitle() {
      void this.shop;
      return showLanguages() ? t("region.title", "Language & currency") : t("region.currency", "Currency");
    },
    regionLong() {
      void this.region.currency;
      const lang = languages().find((l) => l.code === currentLanguage());
      return [lang?.title, currentCurrency()].filter(Boolean).join(" · ");
    },
    regionNote() {
      void this.shop;
      const lang = languages().find((l) => l.code === currentLanguage());
      if (currencies().length <= 1 && !showLanguages())
        return t("bakini.n.hdr.sellsIn", "{shop} sells in {language} and in {currency}.", { shop: this.shop?.title || "", language: lang?.title || "", currency: currentCurrency() });
      return t("region.note", "Prices everywhere change at once: cards, filters, bag and checkout.");
    },
    menuFirst() {
      return this.cats.length <= 8 ? this.cats : this.cats.slice(0, 6);
    },
    menuRest() {
      return this.cats.length <= 8 ? [] : this.cats.slice(6);
    },
    /* "Up to 25% off every pastry", from the live deals. */
    dealsLine() {
      const offs = this.noir.products.map((p) => percentOff(this.shop, p)).filter((x) => x > 0);
      if (!offs.length) return t("bakini.n.hdr.dealsNone", "Offers when there are some");
      const max = Math.max(...offs);
      const every = offs.length === this.noir.products.length && Math.min(...offs) === max;
      return every ? t("bakini.n.hdr.dealsEvery", "{off}% off every piece right now", { off: max }) : t("bakini.n.hdr.dealsUpTo", "Up to {off}% off right now", { off: max });
    },
    /* "Popular": the words most products share (flavours), from the live catalogue. */
    popular() {
      const count = new Map();
      const catWords = new Set(this.cats.flatMap((c) => catTitle(c).toLowerCase().split(/\s+/)).concat(this.cats.flatMap((c) => catTitle(c).toLowerCase().replace(/s$/, "").split(/\s+/))));
      for (const p of this.noir.products) {
        const seen = new Set();
        for (const w of String(p.title || "").split(/[^\p{L}]+/u)) {
          const k = w.toLowerCase();
          if (k.length < 4 || STOP.has(k) || catWords.has(k) || catWords.has(k + "s") || seen.has(k)) continue;
          seen.add(k);
          count.set(k, (count.get(k) || 0) + 1);
        }
      }
      return [...count.entries()]
        .filter(([, n]) => n >= 2)
        .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
        .slice(0, 6)
        .map(([w]) => w.charAt(0).toUpperCase() + w.slice(1));
    },
    searchExamples() {
      return this.cats.slice(0, 2).map((c) => catTitle(c).toLowerCase()).concat(this.popular.length ? [] : []).join(", ") || t("bakini.n.hdr.pastries", "pastries");
    },
    query() {
      return this.q.trim();
    },
    hits() {
      const q = this.query.toLowerCase();
      if (!q) return [];
      const words = q.split(/\s+/).filter(Boolean);
      const score = (p) => {
        const title = String(p.title || "").toLowerCase();
        const hay = (title + " " + catTitle(catOf(p.category_id)) + " " + Object.values(p.spec || {}).flat().join(" ")).toLowerCase();
        let s = 0;
        for (const w of words) {
          if (title.includes(w)) s += 3;
          else if (hay.includes(w)) s += 1;
          else return 0;
        }
        return s;
      };
      return this.noir.products
        .map((p) => ({ p, s: score(p) }))
        .filter((x) => x.s > 0)
        .sort((a, b) => b.s - a.s || (b.p.sells || 0) - (a.p.sells || 0))
        .slice(0, 6)
        .map((x) => x.p);
    },
    sugCats() {
      const q = this.query.toLowerCase();
      return q ? this.cats.filter((c) => catTitle(c).toLowerCase().includes(q)) : [];
    },
    r() {
      return window.$storefront.routes;
    },
    dealsTo() {
      return dealsRoute();
    },
    lovedTo() {
      return catalogueRoute({ sort: "most_sales" });
    },
    compareTo() {
      return { name: this.r.COMPARISON_PAGE };
    },
    blogTo() {
      return journalRoute();
    },
    aboutTo() {
      return { name: this.r.SHOP_PROFILE_PAGE_ABOUT_US };
    },
    contactTo() {
      return { name: this.r.SHOP_CONTACT_US };
    },
    accountTo() {
      return { name: "KalioAccountHome" };
    },
    ordersTo() {
      return { name: this.r.HISTORY_ORDERS_PHYSICAL };
    },
    addressesTo() {
      return { name: this.r.USER_ADDRESSES_PAGE };
    },
  },

  watch: {
    "layer.open"(id) {
      if (id === "srch") this.$nextTick(() => setTimeout(() => this.$refs.q?.focus({ preventScroll: true }), 60));
      if (id === "region" || id === "acct") this.$nextTick(() => this.place(id));
      if (id !== "pmenu") this.moreOpen = false;
    },
    query() {
      this.cursor = -1;
    },
  },

  created() {
    loadNoir();
    wireLayers();
    closeOnRoute(this.$router);
  },

  mounted() {
    this.onResize = () => {
      if (this.layer.open === "region" || this.layer.open === "acct") this.place(this.layer.open);
    };
    window.addEventListener("resize", this.onResize, { passive: true });
    /* Any part of the page can open the bag. */
    this.openBag = () => openLayer("drawer");
    EventBus.$on("bakini:open-cart", this.openBag);
  },

  beforeUnmount() {
    window.removeEventListener("resize", this.onResize);
    EventBus.$off("bakini:open-cart", this.openBag);
  },

  methods: {
    t,
    money,
    priceView,
    catTitle,
    catTo,
    catOf,
    hueOf,
    unitOf,
    productTo,
    openLayer,
    closeLayer,
    is(id) {
      return this.layer.open === id;
    },
    toggle(id, e) {
      toggleLayer(id, e?.currentTarget || null);
    },
    catImg(c) {
      return catImage(c, 256);
    },
    thumb(p) {
      return productImage(p, 128);
    },
    /* Under the button, its right edge on the button's, never within 12px of an edge. */
    place(id) {
      const btn = document.querySelector(`[aria-controls="${id}"]`);
      const el = this.$refs[id];
      if (!btn || !el) return;
      const r = btn.getBoundingClientRect();
      const w = el.offsetWidth || 320;
      const left = Math.max(12, Math.min(window.innerWidth - w - 12, r.right - w));
      this.popPos[id] = { top: `${r.bottom + 10}px`, left: `${left}px` };
    },
    mark(title) {
      const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
      let out = esc(title);
      for (const w of this.query.split(/\s+/).filter(Boolean)) out = out.replace(new RegExp(`(${w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "ig"), "<mark>$1</mark>");
      return out;
    },
    move(d) {
      const n = this.hits.length;
      if (!n) return;
      this.cursor = (this.cursor + d + n) % n;
    },
    searchTo(q) {
      return { name: this.r.SHOP_PAGE, query: { search: q } };
    },
    submit() {
      if (this.cursor >= 0 && this.hits[this.cursor]) {
        this.$router.push(productTo(this.hits[this.cursor]));
        return;
      }
      const text = this.query;
      closeLayer(true);
      if (!text) return this.$emit("clear");
      this.$emit("search", { search: text, search_type: null });
    },
    signIn() {
      closeLayer(true);
      EventBus.$emit("need-login", true);
    },
    signOut() {
      closeLayer(true);
      try {
        this.Logout(() => {});
      } catch (e) {
        window.$storefront?.user?.logout?.();
      }
    },
    skip() {
      const m = document.getElementById("main") || document.querySelector("main");
      if (m) {
        m.setAttribute("tabindex", "-1");
        m.focus();
      }
    },
  },
};
</script>
