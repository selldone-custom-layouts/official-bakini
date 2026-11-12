<!--
  Bakini Noir — the header. PHASE 1 BASE: the inherited header with the
  electronics-only parts taken out (message strip, utility row, Services,
  promise strip); the language & currency pill sits with the actions. Phase 2
  replaces it with the B mockup's slim glass header (bakio-design/b/core.js
  header(): wordmark left; "Shop ⌄" mega panel, the collections and Deals in
  the middle; search, the region pill, account and the bag on the right).

  Every panel opens and closes on a click (and Esc, a click elsewhere, a page
  change), with no scrim. Phone: Menu opens a drawer: Deals, the first 6
  collections (8 or fewer: all), the bakery's own pages and the language &
  currency row. No bottom tab bar. The bag opens the bag drawer. A shop with
  custom header code keeps Selldone's header (StorefrontLayout).
-->
<template>
  <header v-if="!$store.getters.getIsNative" class="bk-header">
    <!-- ▆▆▆▆ The main row ▆▆▆▆ -->
    <div ref="main" class="bk-wrap bk-header__main">
      <bakini-logo class="bk-header__logo" />

      <nav :aria-label="t('bakini.header.shop', 'Shop')" class="bk-nav">
        <button :aria-expanded="dd === 'mega' ? 'true' : 'false'" class="bk-nav__b" data-dd="mega" type="button" @click="toggle('mega')">
          {{ t("bakini.header.shopAll", "Shop") }}<span :class="{ '-up': dd === 'mega' }" class="ms">expand_more</span>
        </button>
        <button :aria-expanded="dd === 'deals' ? 'true' : 'false'" class="bk-nav__b -pill" data-dd="deals" type="button" @click="toggle('deals')">
          {{ t("bakini.header.deals", "Deals") }}<span :class="{ '-up': dd === 'deals' }" class="ms">expand_more</span>
        </button>
      </nav>

      <form v-if="showSearch" class="bk-search" role="search" @submit.prevent="submit()">
        <input
          ref="q"
          :aria-label="t('bakini.header.searchLabel', 'Search products or brands')"
          :placeholder="t('bakini.header.searchPh', 'Tell us what you’re looking for…')"
          :value="q"
          aria-autocomplete="list"
          autocomplete="off"
          enterkeyhint="search"
          type="search"
          @blur="blurSoon"
          @focus="open_suggest = true"
          @input="onType($event.target.value)"
          @keydown.down.prevent="move(1)"
          @keydown.up.prevent="move(-1)"
          @keydown.esc="open_suggest = false"
        />
        <button :aria-label="t('bakini.header.search', 'Search')" class="bk-search__go" type="submit"><span aria-hidden="true" class="ms">search</span></button>

        <div v-if="open_suggest && (hits.length || catHits.length)" class="bk-suggest" role="listbox">
          <router-link
            v-for="c in catHits"
            :key="'c' + c.id"
            :to="catTo(c)"
            class="bk-suggest__cat"
            role="option"
            @click="open_suggest = false"
            @mousedown.prevent
          >
            <span class="ms">category</span>{{ c.title || c.name }}<small>{{ t("bakini.header.category", "Category") }}</small>
          </router-link>
          <router-link
            v-for="(p, i) in hits"
            :key="p.id"
            :class="{ '-on': i === cursor }"
            :to="productTo(p)"
            class="bk-suggest__p"
            role="option"
            @click="open_suggest = false"
            @mousedown.prevent
          >
            <span class="bk-suggest__img"><img :src="thumb(p)" alt="" /></span>
            <span class="bk-suggest__t">{{ p.title }}</span>
            <u-price :amount="price(p).now" :currency="currency" />
          </router-link>
          <button class="bk-suggest__all" type="button" @click="submit()" @mousedown.prevent>
            {{ t("bakini.header.seeAllFor", "See all results for “{q}”", { q }) }}<span class="ms bk-chev">arrow_forward</span>
          </button>
        </div>
      </form>
      <span v-else class="bk-header__sp"></span>

      <nav :aria-label="t('bakini.header.yourAccount', 'Your account')" class="bk-acts">
        <!-- Language and currency (the owner's choice B; showSingle: the one
             currency shows too, with what the shop sells in). -->
        <region-switcher-button :key="regionKey" button-class="bk-acts__region" />
        <router-link v-if="user" :to="accountTo" class="bk-act -me">
          <span class="ms">person</span><span class="bk-act__t">{{ firstName }}</span>
        </router-link>
        <button v-else-if="!busyUser" class="bk-act -me" type="button" @click="signIn">
          <span class="ms">person</span><span class="bk-act__t">{{ t("bakini.header.account", "Account") }}</span>
        </button>
        <span v-else class="bk-act -me -wait"><span class="ms">person</span><span class="bk-act__t">{{ t("bakini.header.account", "Account") }}</span></span>

        <component
          :is="user ? 'router-link' : 'button'"
          :to="user ? savedTo : undefined"
          :type="user ? undefined : 'button'"
          class="bk-act -saved"
          @click="!user && signIn()"
        >
          <span class="ms">favorite</span><span class="bk-act__t">{{ t("bakini.header.saved", "Saved") }}</span>
        </component>

        <button
          :aria-label="t('bakini.header.basketAria', { one: 'Bag, {n} item', other: 'Bag, {n} items' }, { n: units })"
          class="bk-act -basket"
          type="button"
          @click="cart = true"
        >
          <span class="ms">shopping_bag</span><i v-if="units" class="bk-act__n">{{ units > 99 ? "99+" : units }}</i>
          <span class="bk-act__t">{{ basketTotal || t("bakini.header.basket", "Bag") }}</span>
        </button>
        <button :aria-expanded="menu ? 'true' : 'false'" :aria-label="t('bakini.header.menu', 'Menu')" class="bk-act -menu" type="button" @click="menu = true">
          <span class="ms">menu</span><span class="bk-act__t">{{ t("bakini.header.menu", "Menu") }}</span>
        </button>
      </nav>

      <!-- Shop All: every category on the left; the chosen one's top deals on
           the right. Opened and closed by "Shop All" only (and Esc, a click
           elsewhere, or a page change). No scrim. -->
      <div v-if="dd === 'mega'" ref="dd" class="bk-dd -mega" @keydown.esc="dd = null">
        <div class="bk-mega__list" role="list">
          <router-link
            v-for="c in cats"
            :key="c.id"
            :class="{ '-on': megaCat && megaCat.id === c.id }"
            :to="catTo(c)"
            class="bk-mega__cat"
            role="listitem"
            @focus="mega_at = c.id"
            @mouseenter="mega_at = c.id"
          >
            <span class="bk-mega__ic"><img v-if="c.icon" :src="catIcon(c)" alt="" /></span>
            <span class="bk-mega__name">{{ c.title || c.name }}</span>
            <span aria-hidden="true" class="ms bk-chev">chevron_right</span>
          </router-link>
        </div>
        <div v-if="megaCat" class="bk-mega__side">
          <div class="bk-mega__head">
            <h3>{{ megaCat.title || megaCat.name }}</h3>
            <router-link :to="catTo(megaCat)" class="bk-more">{{ t("bakini.header.shopAllIn", "Shop all {name}", { name: iso(megaCat.title || megaCat.name) }) }}<span class="ms bk-chev">chevron_right</span></router-link>
          </div>
          <p v-if="megaLine" class="bk-mega__line">{{ megaLine }}</p>
          <div class="bk-mega__picks">
            <router-link v-for="p in megaPicks" :key="p.id" :to="productTo(p)" class="bk-mini">
              <span class="bk-mini__img"><img :src="thumb(p, 256)" alt="" loading="lazy" /></span>
              <span class="bk-mini__t">{{ p.title }}</span>
              <span class="bk-mini__p">
                <u-price :amount="price(p).now" :currency="currency" />
                <small v-if="price(p).save > 0" class="bk-save">{{ t("bakini.card.save", "Save {amount}", { amount: whole(price(p).save) }) }}</small>
              </span>
            </router-link>
          </div>
          <div class="bk-mega__links">
            <router-link :to="dealsTo"><span class="ms">sell</span>{{ t("bakini.header.allDeals", "All deals") }}</router-link>
            <router-link :to="newTo"><span class="ms">new_releases</span>{{ t("bakini.header.newIn", "New in") }}</router-link>
            <router-link :to="allTo"><span class="ms">grid_view</span>{{ t("bakini.header.allProducts", "All products") }}</router-link>
          </div>
        </div>
      </div>

      <!-- Deals: every deal, then each category with deals and its best saving. -->
      <div v-if="dd === 'deals'" ref="dd" class="bk-dd -deals" @keydown.esc="dd = null">
        <router-link :to="dealsTo" class="bk-dealrow -all">
          <span class="bk-svc__ic -sale"><span class="ms">sell</span></span>
          <span class="bk-svc__w"><b>{{ t("bakini.header.allDeals", "All deals") }}</b><small v-if="dealsUntil">{{ t("bakini.header.dealsEnd", "Deals end {date}", { date: dealsUntil }) }}</small></span>
        </router-link>
        <router-link v-for="c in dealCats" :key="c.cat.id" :to="dealsIn(c.cat)" class="bk-dealrow">
          <span class="bk-mega__ic"><img v-if="c.cat.icon" :src="catIcon(c.cat)" alt="" /></span>
          <span class="bk-svc__w"><b>{{ c.cat.title || c.cat.name }}</b><small class="bk-sale-t">{{ t("bakini.header.upTo", "Up to {amount} off", { amount: whole(c.save) }) }}</small></span>
        </router-link>
      </div>
    </div>

    <!-- ▆▆▆▆ The phone menu: a right drawer (a plain teleported panel) ▆▆▆▆ -->
    <teleport to="body">
      <transition name="bk-fade">
        <div v-if="menu" aria-hidden="true" class="bk-menu-scrim" @click="menu = false"></div>
      </transition>
      <transition name="bk-slide">
        <div v-if="menu" :aria-label="t('bakini.header.menu', 'Menu')" :dir="rtl ? 'rtl' : 'ltr'" aria-modal="true" class="bk-menu" role="dialog" @keydown.esc="menu = false">
          <div class="bk-menu__head">
            <bakini-logo />
            <button ref="menuClose" :aria-label="t('bakini.menu.close', 'Close menu')" class="bk-x" type="button" @click="menu = false"><span class="ms">close</span></button>
          </div>
          <div class="bk-menu__body">
            <router-link :to="dealsTo" class="bk-menu__row -deal"><span class="bk-menu__ic -sale"><span class="ms">sell</span></span>{{ t("bakini.header.allDeals", "All deals") }}</router-link>
            <p class="bk-menu__h">{{ t("bakini.menu.shop", "Shop") }}</p>
            <!-- The first 6 categories in the shop's order; the rest behind
                 "Show N more" (8 or fewer: all, no button). The owner's option A. -->
            <router-link v-for="c in menuFirst" :key="c.id" :to="catTo(c)" class="bk-menu__row">
              <span class="bk-menu__ic"><img v-if="c.icon" :src="catIcon(c)" alt="" /></span>{{ c.title || c.name }}
            </router-link>
            <transition name="bk-mm">
              <div v-if="menuRest.length && menu_more" id="bk-menu-more" class="bk-menu__extra">
                <div class="bk-menu__extra-in">
                  <router-link v-for="(c, i) in menuRest" :key="c.id" :style="{ '--i': i }" :to="catTo(c)" class="bk-menu__row">
                    <span class="bk-menu__ic"><img v-if="c.icon" :src="catIcon(c)" alt="" /></span>{{ c.title || c.name }}
                  </router-link>
                </div>
              </div>
            </transition>
            <button
              v-if="menuRest.length"
              :aria-expanded="menu_more ? 'true' : 'false'"
              aria-controls="bk-menu-more"
              class="bk-menu__row bk-menu__more"
              type="button"
              @click="menu_more = !menu_more"
            >
              <span aria-hidden="true" class="bk-menu__ic -more"><span class="ms">{{ menu_more ? "expand_less" : "expand_more" }}</span></span>
              {{ menu_more ? t("bakini.menu.showFewer", "Show fewer") : t("bakini.menu.showMore", "Show {n} more", { n: menuRest.length }) }}
            </button>
            <p class="bk-menu__h">{{ t("bakini.menu.bakery", "The bakery") }}</p>
            <router-link v-for="s in services" :key="s.key" :to="s.to" class="bk-menu__row -link">
              <span class="bk-menu__ic -line"><span class="ms">{{ s.icon }}</span></span>{{ s.title }}
            </router-link>
            <region-sheet :key="regionKey" row-class="bk-menu__row -link bk-menu__region" />
          </div>
        </div>
      </transition>
    </teleport>

    <!-- ▆▆▆▆ The basket drawer (design C) ▆▆▆▆ -->
    <teleport to="body">
      <v-navigation-drawer
        v-model="cart"
        :location="$vuetify.locale.isRtl ? 'left' : 'right'"
        :width="windowWidth < 520 ? windowWidth : 440"
        class="k-drawer -basket bk-drawer"
        temporary
      >
        <div class="k-drawer__head">
          <p class="k-drawer__title">
            {{ t("bakini.basket.title", "Your bag") }}<small v-if="units">{{ t("bakini.basket.count", { one: "{n} item", other: "{n} items" }, { n: units }) }}</small>
          </p>
          <button :aria-label="t('bakini.basket.close', 'Close')" class="bk-x" type="button" @click="cart = false"><span class="ms">close</span></button>
        </div>
        <div v-if="!units" class="bk-empty -drawer">
          <span aria-hidden="true" class="bk-empty__ic"><span class="ms">shopping_bag</span></span>
          <p class="bk-empty__t">{{ t("bakini.basket.emptyT", "Your bag is empty") }}</p>
          <p class="bk-empty__p">{{ t("bakini.basket.emptyP", "Find something you love and it will wait for you here.") }}</p>
          <router-link :to="dealsTo" class="bk-btn" @click="cart = false">{{ t("bakini.basket.shopDeals", "Shop today’s deals") }}</router-link>
          <router-link :to="allTo" class="bk-btn -line" @click="cart = false">{{ t("bakini.basket.continue", "Continue shopping") }}</router-link>
        </div>
        <kalio-basket-drawer v-else @close="cart = false" />
      </v-navigation-drawer>
    </teleport>
  </header>
</template>

<script>
import CurrencyMixin from "@selldone/components-vue/mixin/currency/CurrencyMixin.ts";
import { EventBus } from "@selldone/components-vue/utils/events/EventBus.ts";
import BakiniLogo from "../BakiniLogo.vue";
import KalioBasketDrawer from "../../kalio/shell/KalioBasketDrawer.vue";
import { aisleRoute, aisles, catalogueRoute, dealsRoute } from "../../kalio/kalio-catalog";
import { journalRoute } from "../../kalio/pages/kalio-journal";
import { basketView } from "../../kalio/kalio-basket";
import { catalogue, dealsEndDate, dealsOf, iso, moneyOf, moneyText } from "../bakini";
import RegionSwitcherButton from "../../region-switcher/RegionSwitcherButton.vue";
import RegionSheet from "../../region-switcher/RegionSheet.vue";
import { currentCurrency, isRtl, money } from "../../region-switcher/region";
import { formatDate, t } from "../../kalio/i18n/kalio-i18n";


export default {
  name: "BakiniHeader",
  components: { BakiniLogo, KalioBasketDrawer, RegionSwitcherButton, RegionSheet },
  mixins: [CurrencyMixin],
  inject: ["$shop"],

  props: {
    showSearch: { type: Boolean, default: true },
  },

  emits: ["search", "clear"],

  data: () => ({
    cats: [],
    products: [],
    q: "",
    hits: [],
    cursor: -1,
    open_suggest: false,
    dd: null,
    mega_at: null,
    menu: false,
    menu_more: false,
    cart: false,
    windowWidth: typeof window !== "undefined" ? window.innerWidth : 1440,
  }),

  computed: {
    /* The region package reads its words when it draws: redraw the pill and
       the menu's row once the language file has loaded (SYNC §21). */
    regionKey() {
      return t("region.title", "Language & currency");
    },
    rtl() {
      return isRtl();
    },
    user() {
      return this.$store.getters.getUser;
    },
    busyUser() {
      return this.$store.getters.getBusyUser;
    },
    firstName() {
      return String(this.user?.name || t("bakini.header.account", "Account")).split(/\s+/)[0].slice(0, 12);
    },
    currency() {
      return currentCurrency();
    },
    units() {
      return this.getBaskets().reduce((sum, b) => sum + (b?.items || []).reduce((n, it) => n + (it.count || 0), 0), 0);
    },
    /* The basket's total as the Basket action's label (in the visitor's currency). */
    basketTotal() {
      const b = this.getBaskets().find((x) => x?.items?.length);
      if (!b || !this.units) return "";
      const bill = b.bill || {};
      const total = typeof bill.price === "number" ? bill.price : b.price;
      if (!(Number(total) > 0)) return "";
      return money(total, bill.currency || b.currency);
    },
    r() {
      return window.$storefront.routes;
    },
    ordersTo() {
      return { name: this.r.HISTORY_ORDERS_PHYSICAL };
    },
    returnsTo() {
      return { name: this.r.SHOP_PROFILE_PAGE_TERMS };
    },
    helpTo() {
      return this.$router.hasRoute("ShopFAQ") ? { name: "ShopFAQ" } : { name: this.r.SHOP_CONTACT_US };
    },
    contactTo() {
      return { name: this.r.SHOP_CONTACT_US };
    },
    compareTo() {
      return { name: this.r.COMPARISON_PAGE };
    },
    blogTo() {
      return journalRoute();
    },
    savedTo() {
      return { name: this.r.USER_FAVORITES_PAGE };
    },
    accountTo() {
      return { name: "KalioAccountHome" };
    },
    dealsTo() {
      return dealsRoute();
    },
    newTo() {
      return catalogueRoute({ sort: "newest" });
    },
    allTo() {
      return catalogueRoute();
    },
    deals() {
      return dealsOf(this.$shop, this.products);
    },
    dealsUntil() {
      const d = dealsEndDate(this.$shop, this.products);
      return d ? formatDate(d) : "";
    },
    /* The phone menu's own pages: honest links to the shop's pages. */
    services() {
      return [
        { key: "journal", icon: "menu_book", title: t("bakini.menu.journal", "Journal"), to: this.blogTo },
        { key: "about", icon: "storefront", title: t("bakini.menu.about", "About"), to: { name: window.$storefront.routes.SHOP_PROFILE_PAGE_ABOUT_US } },
        { key: "contact", icon: "mail", title: t("bakini.menu.contact", "Contact"), to: this.contactTo },
        { key: "help", icon: "help", title: t("bakini.menu.faq", "FAQ"), to: this.helpTo },
        { key: "track", icon: "local_shipping", title: t("bakini.menu.orders", "Your orders"), to: this.ordersTo },
      ];
    },
    /* The phone menu: 6 categories, the rest behind "Show N more"; 8 or
       fewer show all. */
    menuFirst() {
      return this.cats.length <= 8 ? this.cats : this.cats.slice(0, 6);
    },
    menuRest() {
      return this.cats.length <= 8 ? [] : this.cats.slice(6);
    },
    megaCat() {
      return this.cats.find((c) => c.id === this.mega_at) || this.cats[0] || null;
    },
    megaPicks() {
      const c = this.megaCat;
      if (!c) return [];
      const mine = this.products.filter((p) => p.category_id === c.id && p.quantity > 0);
      const deals = dealsOf(this.$shop, mine);
      const rest = mine.filter((p) => !deals.includes(p));
      return [...deals, ...rest].slice(0, 3);
    },
    megaLine() {
      const c = this.megaCat;
      if (!c) return "";
      const best = Math.max(0, ...this.products.filter((p) => p.category_id === c.id).map((p) => this.price(p).save));
      return best > 0 ? t("bakini.header.upTo", "Up to {amount} off", { amount: this.whole(best) }) : "";
    },
    /* Categories with deals, the biggest saving first. */
    dealCats() {
      const best = new Map();
      for (const p of this.deals) {
        const s = this.price(p).save;
        if (s > (best.get(p.category_id) || 0)) best.set(p.category_id, s);
      }
      return this.cats
        .filter((c) => best.has(c.id))
        .map((c) => ({ cat: c, save: best.get(c.id) }))
        .sort((a, b) => b.save - a.save)
        .slice(0, 8);
    },
    catHits() {
      const q = this.q.trim().toLowerCase();
      if (q.length < 2) return [];
      return this.cats.filter((c) => `${c.title} ${c.name}`.toLowerCase().includes(q)).slice(0, 2);
    },
  },

  watch: {
    $route() {
      this.dd = null;
      this.menu = false;
      this.cart = false;
      this.open_suggest = false;
    },
    cart(open) {
      basketView.drawerOpen = open;
      this.$store.commit("setForceHideNavigation", open);
    },
    dd() {
      this.listenOutside();
    },
    menu(open) {
      if (open) this.menu_more = false; /* each time the menu opens it starts collapsed */
      document.documentElement.style.overflow = open ? "hidden" : "";
      if (open) this.$nextTick(() => this.$refs.menuClose?.focus());
    },
    "$route.query.search": {
      handler(v) {
        this.q = v ? String(v) : "";
      },
      immediate: true,
    },
  },

  mounted() {
    aisles().then((list) => (this.cats = list));
    catalogue().then((list) => (this.products = list));
    this.onResize = () => (this.windowWidth = window.innerWidth);
    window.addEventListener("resize", this.onResize, { passive: true });
    /* Any part of the page can open the basket (the footer's Basket link). */
    this.openCart = () => (this.cart = true);
    EventBus.$on("bakini:open-cart", this.openCart);
    /* Esc closes the basket drawer and the menu (Vuetify's temporary
       drawer does not close on Esc by itself; SYNC §16). */
    this.onKey = (e) => {
      if (e.key !== "Escape") return;
      if (this.cart) this.cart = false;
      else if (this.menu) this.menu = false;
      else if (this.dd) this.dd = null;
    };
    document.addEventListener("keydown", this.onKey);
  },

  beforeUnmount() {
    window.removeEventListener("resize", this.onResize);
    document.removeEventListener("click", this.outside, true);
    document.removeEventListener("keydown", this.onKey);
    EventBus.$off("bakini:open-cart", this.openCart);
    clearTimeout(this.typing);
    if (this.menu) document.documentElement.style.overflow = "";
  },

  methods: {
    iso,
    t,
    price(p) {
      return moneyOf(this.$shop, p, null, this.currency);
    },
    whole(n) {
      return moneyText(Math.round(n), this.currency, true);
    },
    catTo: aisleRoute,
    dealsIn(c) {
      return { ...aisleRoute(c), query: { filter: JSON.stringify({ only_has_discount: true }) } };
    },
    catIcon(c) {
      return window.CDN.GET_CATEGORY_ICON(c.id, 128);
    },
    productTo(p) {
      return { name: this.r.PRODUCT_PAGE, params: { product_id: p.id } };
    },
    thumb(p, size = 64) {
      return window.CDN.GET_SHOP_IMAGE_PATH(p.icon, size > 128 ? null : 128);
    },
    signIn() {
      EventBus.$emit("need-login", true);
    },
    toggle(which) {
      this.dd = this.dd === which ? null : which;
    },
    listenOutside() {
      document.removeEventListener("click", this.outside, true);
      if (this.dd) document.addEventListener("click", this.outside, true);
    },
    outside(e) {
      const el = e.target;
      const inPanel = this.$refs.dd?.contains?.(el);
      const onButton = el?.closest?.("[data-dd]");
      if (!inPanel && !onButton) this.dd = null;
    },
    /* Suggestions while typing: the input's own value (v-model waits for an
       Android keyboard's composition to end). */
    onType(value) {
      this.q = value;
      this.cursor = -1;
      this.open_suggest = true;
      clearTimeout(this.typing);
      const q = value.trim();
      if (q.length < 2) {
        this.hits = [];
        return;
      }
      this.typing = setTimeout(() => {
        window.axios
          .get(window.XAPI.GET_SEARCH_QUERY(window.$storefront.name, encodeURIComponent(q)))
          .then(({ data }) => {
            if (this.q.trim() !== q) return;
            this.hits = (data?.items || []).filter((p) => p && p.id && p.title && p.icon).slice(0, 6);
          })
          .catch(() => (this.hits = []));
      }, 250);
    },
    move(d) {
      if (!this.hits.length) return;
      this.cursor = (this.cursor + d + this.hits.length) % this.hits.length;
    },
    blurSoon() {
      setTimeout(() => (this.open_suggest = false), 150);
    },
    submit() {
      if (this.cursor >= 0 && this.hits[this.cursor]) {
        this.$router.push(this.productTo(this.hits[this.cursor]));
        this.open_suggest = false;
        return;
      }
      const text = this.q.trim();
      this.open_suggest = false;
      this.$refs.q?.blur();
      if (!text) {
        this.$emit("clear");
        return;
      }
      this.$emit("search", { search: text, search_type: null });
    },
  },
};
</script>
