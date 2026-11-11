<!--
  Medio — the header, after a big electronics retailer's (its sections, not
  its brand):

  1. A thin dark strip with ONE honest message at a time (the deals' real
     end date, compare, track), turning every few seconds, and a close ×.
  2. A utility row at the top right: Help & Support, Track my order,
     Delivery & returns, Compare, Buying guides, then the language and
     currency pill (the shared region package).
  3. The main row: the round logo; "Shop All ⌄" (a mega panel: every
     category on the left, the chosen one's top deals on the right),
     "Services ⌄" and a black "Deals ⌄" pill; a big rounded search with a
     round violet button and suggestions while typing; then icon-over-label
     actions: Help, Account, Saved, Basket (the count on the icon and the
     basket's total as its label). Every panel opens and closes on a click
     (and Esc, a click elsewhere, a page change), with no scrim.
  4. A strip of four honest promises with line icons, each a link.

  Phone: the strip, the logo with Account, Saved, Basket and Menu as
  icon-over-label actions, and the search across the screen. Menu opens a
  right drawer: Deals, "Shop" with the first 6 categories and "Show N more",
  the services and the language & currency row. No bottom tab bar. The
  basket opens Kalio's drawer (design C). A shop with custom header code
  keeps Selldone's header (StorefrontLayout).
-->
<template>
  <header v-if="!$store.getters.getIsNative" class="md-header">
    <!-- ▆▆▆▆ 1. The message strip ▆▆▆▆ -->
    <div v-if="strip_on" class="md-strip">
      <div class="md-wrap md-strip__in">
        <transition mode="out-in" name="md-msg">
          <router-link :key="msgAt" :to="messages[msgAt].to" class="md-strip__msg">{{ messages[msgAt].text }}</router-link>
        </transition>
        <button :aria-label="t('medio.header.closeStrip', 'Close message')" class="md-strip__x" type="button" @click="closeStrip"><span class="ms">close</span></button>
      </div>
    </div>

    <!-- ▆▆▆▆ 2. Utility row ▆▆▆▆ -->
    <div class="md-util">
      <nav :aria-label="t('medio.header.help', 'Help')" class="md-wrap md-util__in">
        <router-link :to="helpTo">{{ t("medio.header.helpSupport", "Help & Support") }}</router-link>
        <router-link :to="ordersTo">{{ t("medio.header.track", "Track my order") }}</router-link>
        <router-link :to="returnsTo">{{ t("medio.header.returns", "Delivery & returns") }}</router-link>
        <router-link :to="compareTo">{{ t("medio.header.compare", "Compare") }}</router-link>
        <router-link :to="blogTo">{{ t("medio.header.guides", "Buying guides") }}</router-link>
        <!-- Language and currency (the owner's choice B): hidden when the
             shop has one of each. -->
        <region-switcher-button :key="regionKey" button-class="md-util__region" />
      </nav>
    </div>

    <!-- ▆▆▆▆ 3. The main row ▆▆▆▆ -->
    <div ref="main" class="md-wrap md-header__main">
      <medio-logo class="md-header__logo" />

      <nav :aria-label="t('medio.header.shop', 'Shop')" class="md-nav">
        <button :aria-expanded="dd === 'mega' ? 'true' : 'false'" class="md-nav__b" data-dd="mega" type="button" @click="toggle('mega')">
          {{ t("medio.header.shopAll", "Shop All") }}<span :class="{ '-up': dd === 'mega' }" class="ms">expand_more</span>
        </button>
        <button :aria-expanded="dd === 'services' ? 'true' : 'false'" class="md-nav__b" data-dd="services" type="button" @click="toggle('services')">
          {{ t("medio.header.services", "Services") }}<span :class="{ '-up': dd === 'services' }" class="ms">expand_more</span>
        </button>
        <button :aria-expanded="dd === 'deals' ? 'true' : 'false'" class="md-nav__b -pill" data-dd="deals" type="button" @click="toggle('deals')">
          {{ t("medio.header.deals", "Deals") }}<span :class="{ '-up': dd === 'deals' }" class="ms">expand_more</span>
        </button>
      </nav>

      <form v-if="showSearch" class="md-search" role="search" @submit.prevent="submit()">
        <input
          ref="q"
          :aria-label="t('medio.header.searchLabel', 'Search products or brands')"
          :placeholder="t('medio.header.searchPh', 'Tell us what you’re looking for…')"
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
        <button :aria-label="t('medio.header.search', 'Search')" class="md-search__go" type="submit"><span aria-hidden="true" class="ms">search</span></button>

        <div v-if="open_suggest && (hits.length || catHits.length)" class="md-suggest" role="listbox">
          <router-link
            v-for="c in catHits"
            :key="'c' + c.id"
            :to="catTo(c)"
            class="md-suggest__cat"
            role="option"
            @click="open_suggest = false"
            @mousedown.prevent
          >
            <span class="ms">category</span>{{ c.title || c.name }}<small>{{ t("medio.header.category", "Category") }}</small>
          </router-link>
          <router-link
            v-for="(p, i) in hits"
            :key="p.id"
            :class="{ '-on': i === cursor }"
            :to="productTo(p)"
            class="md-suggest__p"
            role="option"
            @click="open_suggest = false"
            @mousedown.prevent
          >
            <span class="md-suggest__img"><img :src="thumb(p)" alt="" /></span>
            <span class="md-suggest__t">{{ p.title }}</span>
            <u-price :amount="price(p).now" :currency="currency" />
          </router-link>
          <button class="md-suggest__all" type="button" @click="submit()" @mousedown.prevent>
            {{ t("medio.header.seeAllFor", "See all results for “{q}”", { q }) }}<span class="ms md-chev">arrow_forward</span>
          </button>
        </div>
      </form>
      <span v-else class="md-header__sp"></span>

      <nav :aria-label="t('medio.header.yourAccount', 'Your account')" class="md-acts">
        <router-link :to="helpTo" class="md-act -help"><span class="ms">help</span><span class="md-act__t">{{ t("medio.header.helpShort", "Help") }}</span></router-link>
        <router-link v-if="user" :to="accountTo" class="md-act -me">
          <span class="ms">person</span><span class="md-act__t">{{ firstName }}</span>
        </router-link>
        <button v-else-if="!busyUser" class="md-act -me" type="button" @click="signIn">
          <span class="ms">person</span><span class="md-act__t">{{ t("medio.header.account", "Account") }}</span>
        </button>
        <span v-else class="md-act -me -wait"><span class="ms">person</span><span class="md-act__t">{{ t("medio.header.account", "Account") }}</span></span>

        <component
          :is="user ? 'router-link' : 'button'"
          :to="user ? savedTo : undefined"
          :type="user ? undefined : 'button'"
          class="md-act -saved"
          @click="!user && signIn()"
        >
          <span class="ms">favorite</span><span class="md-act__t">{{ t("medio.header.saved", "Saved") }}</span>
        </component>

        <button
          :aria-label="t('medio.header.basketAria', { one: 'Basket, {n} item', other: 'Basket, {n} items' }, { n: units })"
          class="md-act -basket"
          type="button"
          @click="cart = true"
        >
          <span class="ms">shopping_basket</span><i v-if="units" class="md-act__n">{{ units > 99 ? "99+" : units }}</i>
          <span class="md-act__t">{{ basketTotal || t("medio.header.basket", "Basket") }}</span>
        </button>
        <button :aria-expanded="menu ? 'true' : 'false'" :aria-label="t('medio.header.menu', 'Menu')" class="md-act -menu" type="button" @click="menu = true">
          <span class="ms">menu</span><span class="md-act__t">{{ t("medio.header.menu", "Menu") }}</span>
        </button>
      </nav>

      <!-- Shop All: every category on the left; the chosen one's top deals on
           the right. Opened and closed by "Shop All" only (and Esc, a click
           elsewhere, or a page change). No scrim. -->
      <div v-if="dd === 'mega'" ref="dd" class="md-dd -mega" @keydown.esc="dd = null">
        <div class="md-mega__list" role="list">
          <router-link
            v-for="c in cats"
            :key="c.id"
            :class="{ '-on': megaCat && megaCat.id === c.id }"
            :to="catTo(c)"
            class="md-mega__cat"
            role="listitem"
            @focus="mega_at = c.id"
            @mouseenter="mega_at = c.id"
          >
            <span class="md-mega__ic"><img v-if="c.icon" :src="catIcon(c)" alt="" /></span>
            <span class="md-mega__name">{{ c.title || c.name }}</span>
            <span aria-hidden="true" class="ms md-chev">chevron_right</span>
          </router-link>
        </div>
        <div v-if="megaCat" class="md-mega__side">
          <div class="md-mega__head">
            <h3>{{ megaCat.title || megaCat.name }}</h3>
            <router-link :to="catTo(megaCat)" class="md-more">{{ t("medio.header.shopAllIn", "Shop all {name}", { name: iso(megaCat.title || megaCat.name) }) }}<span class="ms md-chev">chevron_right</span></router-link>
          </div>
          <p v-if="megaLine" class="md-mega__line">{{ megaLine }}</p>
          <div class="md-mega__picks">
            <router-link v-for="p in megaPicks" :key="p.id" :to="productTo(p)" class="md-mini">
              <span class="md-mini__img"><img :src="thumb(p, 256)" alt="" loading="lazy" /></span>
              <span class="md-mini__t">{{ p.title }}</span>
              <span class="md-mini__p">
                <u-price :amount="price(p).now" :currency="currency" />
                <small v-if="price(p).save > 0" class="md-save">{{ t("medio.card.save", "Save {amount}", { amount: whole(price(p).save) }) }}</small>
              </span>
            </router-link>
          </div>
          <div class="md-mega__links">
            <router-link :to="dealsTo"><span class="ms">sell</span>{{ t("medio.header.allDeals", "All deals") }}</router-link>
            <router-link :to="newTo"><span class="ms">new_releases</span>{{ t("medio.header.newIn", "New in") }}</router-link>
            <router-link :to="allTo"><span class="ms">grid_view</span>{{ t("medio.header.allProducts", "All products") }}</router-link>
          </div>
        </div>
      </div>

      <!-- Services: honest links to the shop's own pages. -->
      <div v-if="dd === 'services'" ref="dd" class="md-dd -services" @keydown.esc="dd = null">
        <router-link v-for="s in services" :key="s.key" :to="s.to" class="md-svc">
          <span class="md-svc__ic"><span class="ms">{{ s.icon }}</span></span>
          <span class="md-svc__w"><b>{{ s.title }}</b><small>{{ s.line }}</small></span>
        </router-link>
      </div>

      <!-- Deals: every deal, then each category with deals and its best saving. -->
      <div v-if="dd === 'deals'" ref="dd" class="md-dd -deals" @keydown.esc="dd = null">
        <router-link :to="dealsTo" class="md-dealrow -all">
          <span class="md-svc__ic -sale"><span class="ms">sell</span></span>
          <span class="md-svc__w"><b>{{ t("medio.header.allDeals", "All deals") }}</b><small v-if="dealsUntil">{{ t("medio.header.dealsEnd", "Deals end {date}", { date: dealsUntil }) }}</small></span>
        </router-link>
        <router-link v-for="c in dealCats" :key="c.cat.id" :to="dealsIn(c.cat)" class="md-dealrow">
          <span class="md-mega__ic"><img v-if="c.cat.icon" :src="catIcon(c.cat)" alt="" /></span>
          <span class="md-svc__w"><b>{{ c.cat.title || c.cat.name }}</b><small class="md-sale-t">{{ t("medio.header.upTo", "Up to {amount} off", { amount: whole(c.save) }) }}</small></span>
        </router-link>
      </div>
    </div>

    <!-- ▆▆▆▆ 4. Promises ▆▆▆▆ -->
    <nav :aria-label="t('medio.header.why', 'Why shop with us')" class="md-usp">
      <div class="md-wrap md-usp__in">
        <router-link v-for="(b, i) in usps" :key="b.key" :class="{ '-on': i === usp_at }" :to="b.to" class="md-usp__i">
          <span class="ms">{{ b.icon }}</span><span>{{ b.text }}</span>
        </router-link>
      </div>
    </nav>

    <!-- ▆▆▆▆ The phone menu: a right drawer (a plain teleported panel) ▆▆▆▆ -->
    <teleport to="body">
      <transition name="md-fade">
        <div v-if="menu" aria-hidden="true" class="md-menu-scrim" @click="menu = false"></div>
      </transition>
      <transition name="md-slide">
        <div v-if="menu" :aria-label="t('medio.header.menu', 'Menu')" :dir="rtl ? 'rtl' : 'ltr'" aria-modal="true" class="md-menu" role="dialog" @keydown.esc="menu = false">
          <div class="md-menu__head">
            <medio-logo />
            <button ref="menuClose" :aria-label="t('medio.menu.close', 'Close menu')" class="md-x" type="button" @click="menu = false"><span class="ms">close</span></button>
          </div>
          <div class="md-menu__body">
            <router-link :to="dealsTo" class="md-menu__row -deal"><span class="md-menu__ic -sale"><span class="ms">sell</span></span>{{ t("medio.header.allDeals", "All deals") }}</router-link>
            <p class="md-menu__h">{{ t("medio.menu.shop", "Shop") }}</p>
            <!-- The first 6 categories in the shop's order; the rest behind
                 "Show N more" (8 or fewer: all, no button). The owner's option A. -->
            <router-link v-for="c in menuFirst" :key="c.id" :to="catTo(c)" class="md-menu__row">
              <span class="md-menu__ic"><img v-if="c.icon" :src="catIcon(c)" alt="" /></span>{{ c.title || c.name }}
            </router-link>
            <transition name="md-mm">
              <div v-if="menuRest.length && menu_more" id="md-menu-more" class="md-menu__extra">
                <div class="md-menu__extra-in">
                  <router-link v-for="(c, i) in menuRest" :key="c.id" :style="{ '--i': i }" :to="catTo(c)" class="md-menu__row">
                    <span class="md-menu__ic"><img v-if="c.icon" :src="catIcon(c)" alt="" /></span>{{ c.title || c.name }}
                  </router-link>
                </div>
              </div>
            </transition>
            <button
              v-if="menuRest.length"
              :aria-expanded="menu_more ? 'true' : 'false'"
              aria-controls="md-menu-more"
              class="md-menu__row md-menu__more"
              type="button"
              @click="menu_more = !menu_more"
            >
              <span aria-hidden="true" class="md-menu__ic -more"><span class="ms">{{ menu_more ? "expand_less" : "expand_more" }}</span></span>
              {{ menu_more ? t("medio.menu.showFewer", "Show fewer") : t("medio.menu.showMore", "Show {n} more", { n: menuRest.length }) }}
            </button>
            <p class="md-menu__h">{{ t("medio.menu.services", "Services") }}</p>
            <router-link v-for="s in services" :key="s.key" :to="s.to" class="md-menu__row -link">
              <span class="md-menu__ic -line"><span class="ms">{{ s.icon }}</span></span>{{ s.title }}
            </router-link>
            <region-sheet :key="regionKey" row-class="md-menu__row -link md-menu__region" />
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
        class="k-drawer -basket md-drawer"
        temporary
      >
        <div class="k-drawer__head">
          <p class="k-drawer__title">
            {{ t("medio.basket.title", "Your basket") }}<small v-if="units">{{ t("medio.basket.count", { one: "{n} item", other: "{n} items" }, { n: units }) }}</small>
          </p>
          <button :aria-label="t('medio.basket.close', 'Close')" class="md-x" type="button" @click="cart = false"><span class="ms">close</span></button>
        </div>
        <div v-if="!units" class="md-empty -drawer">
          <span aria-hidden="true" class="md-empty__ic"><span class="ms">shopping_basket</span></span>
          <p class="md-empty__t">{{ t("medio.basket.emptyT", "Your basket is empty") }}</p>
          <p class="md-empty__p">{{ t("medio.basket.emptyP", "Find something you love and it will wait for you here.") }}</p>
          <router-link :to="dealsTo" class="md-btn" @click="cart = false">{{ t("medio.basket.shopDeals", "Shop today’s deals") }}</router-link>
          <router-link :to="allTo" class="md-btn -line" @click="cart = false">{{ t("medio.basket.continue", "Continue shopping") }}</router-link>
        </div>
        <kalio-basket-drawer v-else @close="cart = false" />
      </v-navigation-drawer>
    </teleport>
  </header>
</template>

<script>
import CurrencyMixin from "@selldone/components-vue/mixin/currency/CurrencyMixin.ts";
import { EventBus } from "@selldone/components-vue/utils/events/EventBus.ts";
import MedioLogo from "../MedioLogo.vue";
import KalioBasketDrawer from "../../kalio/shell/KalioBasketDrawer.vue";
import { aisleRoute, aisles, catalogueRoute, dealsRoute } from "../../kalio/kalio-catalog";
import { journalRoute } from "../../kalio/pages/kalio-journal";
import { basketView } from "../../kalio/kalio-basket";
import { catalogue, dealsEndDate, dealsOf, iso, moneyOf, moneyText } from "../medio";
import RegionSwitcherButton from "../../region-switcher/RegionSwitcherButton.vue";
import RegionSheet from "../../region-switcher/RegionSheet.vue";
import { currentCurrency, isRtl, money } from "../../region-switcher/region";
import { formatDate, t } from "../../kalio/i18n/kalio-i18n";

const STRIP_KEY = "medio:strip-closed";

export default {
  name: "MedioHeader",
  components: { MedioLogo, KalioBasketDrawer, RegionSwitcherButton, RegionSheet },
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
    msgAt: 0,
    usp_at: 0,
    strip_on: true,
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
      return String(this.user?.name || t("medio.header.account", "Account")).split(/\s+/)[0].slice(0, 12);
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
    /* One message at a time, each true and each a link. */
    messages() {
      return [
        {
          to: this.dealsTo,
          text: this.dealsUntil
            ? t("medio.strip.deals", "Every deal shows its real end date — deals end {date}", { date: this.dealsUntil })
            : t("medio.strip.dealsNoDate", "Today’s deals across the store"),
        },
        { to: this.compareTo, text: t("medio.strip.compare", "Compare up to 4 products side by side") },
        { to: this.ordersTo, text: t("medio.strip.track", "Track any order from your account") },
      ];
    },
    usps() {
      return [
        { key: "deals", icon: "sell", text: t("medio.usp.deals", "Every deal has a real end date"), to: this.dealsTo },
        { key: "compare", icon: "compare_arrows", text: t("medio.usp.compare", "Compare up to 4 products"), to: this.compareTo },
        { key: "track", icon: "local_shipping", text: t("medio.usp.track", "Track every order"), to: this.ordersTo },
        { key: "help", icon: "support_agent", text: t("medio.usp.help", "Help & Support when you need it"), to: this.helpTo },
      ];
    },
    services() {
      return [
        { key: "track", icon: "local_shipping", title: t("medio.svc.track", "Track my order"), line: t("medio.svc.trackL", "See where your parcel is"), to: this.ordersTo },
        { key: "returns", icon: "assignment_return", title: t("medio.svc.returns", "Delivery & returns"), line: t("medio.svc.returnsL", "Our delivery and returns terms"), to: this.returnsTo },
        { key: "compare", icon: "compare_arrows", title: t("medio.svc.compare", "Compare products"), line: t("medio.svc.compareL", "Up to 4, side by side"), to: this.compareTo },
        { key: "help", icon: "support_agent", title: t("medio.svc.help", "Help & Support"), line: t("medio.svc.helpL", "Answers on orders and payment"), to: this.helpTo },
        { key: "contact", icon: "mail", title: t("medio.svc.contact", "Contact us"), line: t("medio.svc.contactL", "Talk to our team"), to: this.contactTo },
        { key: "guides", icon: "menu_book", title: t("medio.svc.guides", "Buying guides"), line: t("medio.svc.guidesL", "Choose with confidence"), to: this.blogTo },
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
      return best > 0 ? t("medio.header.upTo", "Up to {amount} off", { amount: this.whole(best) }) : "";
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

  created() {
    try {
      this.strip_on = sessionStorage.getItem(STRIP_KEY) !== "1";
    } catch (e) {
      this.strip_on = true;
    }
  },

  mounted() {
    aisles().then((list) => (this.cats = list));
    catalogue().then((list) => (this.products = list));
    this.onResize = () => (this.windowWidth = window.innerWidth);
    window.addEventListener("resize", this.onResize, { passive: true });
    /* Any part of the page can open the basket (the footer's Basket link). */
    this.openCart = () => (this.cart = true);
    EventBus.$on("medio:open-cart", this.openCart);
    /* Esc closes the basket drawer and the menu (Vuetify's temporary
       drawer does not close on Esc by itself; SYNC §16). */
    this.onKey = (e) => {
      if (e.key !== "Escape") return;
      if (this.cart) this.cart = false;
      else if (this.menu) this.menu = false;
      else if (this.dd) this.dd = null;
    };
    document.addEventListener("keydown", this.onKey);
    /* The strip's message and the phone's one promise line turn every few
       seconds (not with reduced motion). */
    const still = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    if (!still) {
      this.msgTimer = setInterval(() => (this.msgAt = (this.msgAt + 1) % 3), 6000);
      this.uspTimer = setInterval(() => (this.usp_at = (this.usp_at + 1) % 4), 4000);
    }
  },

  beforeUnmount() {
    window.removeEventListener("resize", this.onResize);
    document.removeEventListener("click", this.outside, true);
    document.removeEventListener("keydown", this.onKey);
    EventBus.$off("medio:open-cart", this.openCart);
    clearTimeout(this.typing);
    clearInterval(this.msgTimer);
    clearInterval(this.uspTimer);
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
    closeStrip() {
      this.strip_on = false;
      try {
        sessionStorage.setItem(STRIP_KEY, "1");
      } catch (e) {
        /* private window */
      }
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
