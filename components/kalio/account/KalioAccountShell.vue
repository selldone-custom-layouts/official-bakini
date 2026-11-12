<!--
  Bakini Noir — the account's desk (bakio-design/account-b.html,
  addresses-b.html; b/pages-buy.js deskMenu): the page's own words as a
  serif heading ("Good to see you.", "Your addresses."), then the side menu
  (the shopper, Overview · Orders · Addresses · Profile · Sign out, as the
  mockup; Selldone's other sections — saved, wallet, gift cards, returns,
  reviews — stay reachable in a quieter list under them) beside the open
  section. A guest (orders kept on this device) sees the orders and a way
  to sign in. The data is Kalio's (kalio-account.ts).
-->
<template>
  <div class="nx nx-acct">
    <section class="wrap desk">
      <div class="desk-hd">
        <h1 class="serif">{{ heading[0] }}{{ " " }}<em>{{ heading[1] }}</em></h1>
      </div>
      <div class="desk-grid">
        <aside class="desk-side">
          <div class="desk-me">
            <span aria-hidden="true" class="av lg">
              <img v-if="avatar" :src="avatar" alt="" class="nx-acct__img" @error="avatar_failed = true" />
              <template v-else-if="initials">{{ initials }}</template>
              <nx-icon v-else name="user" />
            </span>
            <div>
              <b>{{ user ? user.name : pending ? t("bakini.n.acc.moment", "One moment…") : t("bakini.n.acc.guest", "Shopping as a guest") }}</b>
              <span>{{ user ? user.email || user.phone : t("bakini.n.acc.guestNote", "Orders placed on this device") }}</span>
            </div>
          </div>
          <nav :aria-label="t('bakini.n.acc.nav', 'Your account')" class="desk-nav">
            <router-link v-for="item in mainItems" :key="item.key" :aria-current="isOn(item) ? 'page' : undefined" :to="item.route">
              <nx-icon :name="item.icon" /><span>{{ item.word }}</span>
            </router-link>
            <button v-if="user" :disabled="busy_out" type="button" @click="signOut">
              <nx-icon name="logout" /><span>{{ t("bakini.n.acc.signOut", "Sign out") }}</span>
            </button>
            <button v-else-if="!pending" type="button" @click="signIn">
              <nx-icon name="user" /><span>{{ t("bakini.n.acc.signIn", "Sign in") }}</span>
            </button>
          </nav>
          <nav v-if="moreItems.length" :aria-label="t('bakini.n.acc.more', 'More in your account')" class="nx-acct__more">
            <router-link v-for="item in moreItems" :key="item.key" :aria-current="isOn(item) ? 'page' : undefined" :to="item.route">
              <nx-icon :name="item.icon" /><span>{{ item.word }}</span>
            </router-link>
          </nav>
        </aside>
        <div class="desk-main">
          <router-view />
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { EventBus } from "@selldone/components-vue/utils/events/EventBus.ts";
import { t } from "../i18n/kalio-i18n";
import NxIcon from "../../bakini/noir/NxIcon.vue";
import { ACCOUNT_HOME, ACCOUNT_STYLE, account, greeting, loadAddresses, loadOrders, sections, standing } from "./kalio-account";

export default {
  name: "KalioAccountShell",
  components: { NxIcon },
  inject: ["$shop"],

  data() {
    return {
      style: ACCOUNT_STYLE,
      ACCOUNT_HOME,
      account,
      avatar_failed: false,
      busy_out: false,
    };
  },

  computed: {
    user() {
      return this.USER();
    },
    /** Still asking who is signed in (just after a reload). */
    pending() {
      return !this.user && !!this.$store.getters.getBusyUser;
    },
    firstName() {
      return (this.user?.name || "").trim().split(/\s+/)[0] || t("account.greeting.there", "there");
    },
    initials() {
      const parts = (this.user?.name || "").trim().split(/\s+/).filter(Boolean);
      return parts.length ? (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase() : "";
    },
    avatar() {
      return this.user && !this.avatar_failed ? this.getUserAvatar(this.user.id) : null;
    },
    hello() {
      return greeting();
    },
    /* ── Bakini Noir ── */
    /* The mockup's menu: Overview, Orders, Addresses, Profile. */
    mainItems() {
      const r = window.$storefront.routes;
      const items = [];
      if (this.user) items.push({ key: "home", word: t("bakini.n.acc.overview", "Overview"), icon: "grid", route: { name: ACCOUNT_HOME } });
      items.push({ key: "orders", word: t("bakini.n.acc.orders", "Orders"), icon: "box", route: { name: r.HISTORY_ORDERS_PHYSICAL } });
      if (this.user) {
        items.push({ key: "addresses", word: t("bakini.n.acc.addresses", "Addresses"), icon: "pin", route: { name: r.USER_ADDRESSES_PAGE } });
        items.push({ key: "profile", word: t("bakini.n.acc.profile", "Profile"), icon: "user", route: { name: r.USER_PROFILE_PAGE } });
      }
      return items;
    },
    /* Selldone's other sections, kept reachable under the menu. */
    moreItems() {
      if (!this.user) return [];
      const r = window.$storefront.routes;
      return [
        { key: "saved", word: t("bakini.n.acc.saved", "Saved"), icon: "heart", route: { name: r.USER_FAVORITES_PAGE } },
        { key: "wallet", word: t("bakini.n.acc.wallet", "Wallet"), icon: "cash", route: { name: r.USER_WALLETS_PAGE } },
        { key: "gift", word: t("bakini.n.acc.gift", "Gift cards"), icon: "tag", route: { name: r.USER_GIFTCARDS_PAGE } },
        { key: "returns", word: t("bakini.n.acc.returns", "Returns"), icon: "arrowL", route: { name: r.USER_RETURN_REQUESTS } },
        { key: "reviews", word: t("bakini.n.acc.reviews", "Reviews"), icon: "star", route: { name: r.USER_COMMENTS_PAGE } },
      ];
    },
    /* The open section's own words, as the mockup's heading. */
    heading() {
      const r = window.$storefront.routes;
      const name = this.$route.name;
      if (name === ACCOUNT_HOME) return [t("bakini.n.acc.hHome", "Good to see"), t("bakini.n.acc.hHomeEm", "you.")];
      if (this.$route.matched.some((m) => m.name === r.ORDERS_PAGE)) return [t("bakini.n.acc.hYour", "Your"), t("bakini.n.acc.hOrders", "orders.")];
      const words = {
        [r.USER_ADDRESSES_PAGE]: [t("bakini.n.acc.hYour", "Your"), t("bakini.n.acc.hAddresses", "addresses.")],
        [r.USER_PROFILE_PAGE]: [t("bakini.n.acc.hYour", "Your"), t("bakini.n.acc.hProfile", "profile.")],
        [r.USER_FAVORITES_PAGE]: [t("bakini.n.acc.hSaved", "Saved"), t("bakini.n.acc.hSavedEm", "for later.")],
        [r.USER_WALLETS_PAGE]: [t("bakini.n.acc.hYour", "Your"), t("bakini.n.acc.hWallet", "wallet.")],
        [r.USER_GIFTCARDS_PAGE]: [t("bakini.n.acc.hGift", "Gift"), t("bakini.n.acc.hGiftEm", "cards.")],
        [r.USER_RETURN_REQUESTS]: [t("bakini.n.acc.hYour", "Your"), t("bakini.n.acc.hReturns", "returns.")],
        [r.USER_COMMENTS_PAGE]: [t("bakini.n.acc.hYour", "Your"), t("bakini.n.acc.hReviews", "reviews.")],
      };
      return words[name] || [t("bakini.n.acc.hYour", "Your"), t("bakini.n.acc.hAccount", "account.")];
    },
    shown() {
      return sections().filter((item) => this.user || !item.user);
    },
    groups() {
      const groups = [];
      for (const item of this.shown) {
        let group = groups.find((g) => g.name === item.group);
        if (!group) groups.push((group = { name: item.group, items: [] }));
        group.items.push(item);
      }
      return groups;
    },
    /** What is happening to the orders, in a sentence. */
    summary() {
      if (this.pending) return t("account.summary.opening", "One moment, opening your account…");
      if (!account.loaded) return this.user ? t("account.summary.default", "Your orders, money and addresses in one place.") : t("account.summary.guest", "The orders placed on this device.");
      const tones = account.orders.map((o) => standing(o).tone);
      const moving = tones.filter((tone) => tone === "go" || tone === "prep").length;
      const paying = tones.filter((tone) => tone === "pay").length;
      if (moving && paying)
        return t("account.summary.both", "{moving}, {paying}.", {
          moving: t("account.summary.movingLead", { one: "One order is on its way to you", other: "{n} orders are on their way to you" }, { n: moving }),
          paying: t("account.summary.payingToo", { one: "one is waiting for payment", other: "{n} are waiting for payment" }, { n: paying }),
        });
      if (moving) return t("account.summary.moving", { one: "One order is on its way to you.", other: "{n} orders are on their way to you." }, { n: moving });
      if (paying) return t("account.summary.paying", { one: "One order is waiting for payment.", other: "{n} orders are waiting for payment." }, { n: paying });
      if (!account.total) return t("bakini.k.account.none", "No orders yet. Your first order is a few taps away.");
      return tones[0] === "ok" ? t("account.summary.allDelivered", "Everything you ordered has reached you.") : t("account.summary.default", "Your orders, money and addresses in one place.");
    },
  },

  watch: {
    // Signed in (or out) here, or known only now after a reload.
    "user.id"() {
      loadOrders(this);
      if (this.user) loadAddresses();
    },
    "$route.fullPath"() {
      this.showActive();
    },
  },

  mounted() {
    this.showActive();
  },

  created() {
    loadOrders(this);
    if (this.user) loadAddresses();
  },

  methods: {
    t,
    /** On a phone the sections are one row that scrolls sideways: bring the
     *  open one into view (Wallet, Profile… were off the right edge). */
    showActive() {
      this.$nextTick(() => {
        for (const nav of this.$el?.querySelectorAll?.(".desk-nav, .nx-acct__more") || []) {
          const on = nav.querySelector('[aria-current="page"]');
          if (!on || nav.scrollWidth <= nav.clientWidth + 1) continue;
          const delta = on.getBoundingClientRect().left - nav.getBoundingClientRect().left;
          nav.scrollLeft = Math.max(0, nav.scrollLeft + delta - (nav.clientWidth - on.offsetWidth) / 2);
        }
      });
    },
    isOn(item) {
      if (item.key === "home") return this.$route.name === ACCOUNT_HOME;
      if (item.key === "orders") return this.$route.matched.some((m) => m.name === window.$storefront.routes.ORDERS_PAGE);
      return this.$route.name === item.route.name;
    },
    countOf(item) {
      if (item.key === "orders") return account.total || null;
      if (item.key === "addresses") return account.addresses?.length || null;
      return null;
    },
    signIn() {
      EventBus.$emit("need-login", true);
    },
    signOut() {
      this.busy_out = true;
      this.Logout(() => {
        this.busy_out = false;
        this.$router.push({ path: "/" });
      });
    },
  },
};
</script>
