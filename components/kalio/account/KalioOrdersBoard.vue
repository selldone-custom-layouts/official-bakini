<!--
  Kalio — the shopper's grocery orders (4 November 2026).

  In place of Selldone's order table (SOrdersList) for physical orders.
  Two looks, one per account design:
    table (B): a row per order — code and messages, the things in it,
               total, where it stands;
    cards (A): a card per order — code, date, where it stands, total and
               how it is paid, the things in it, a line on where it is with
               the five steps as a bar, and what to do next (pay, view,
               buy again, track, messages).
  Filters (All, On the way, To pay, Delivered, Cancelled) count the orders
  read so far; ten show at first and "Show older orders" reads on. The
  label ("SM-1"), the sellers and the payment come from each order on
  screen as it is read (kalio-account.ts).
-->
<template>
  <section :class="[`-${mode}`, { '-compact': compact }]" class="k-board">
    <header v-if="!compact" class="k-board__head">
      <div class="k-board__titles">
        <h2 class="nx-sr">{{ title }}</h2>
        <p v-if="line">{{ line }}</p>
      </div>
      <kalio-order-kinds current="PHYSICAL" />
    </header>

    <div v-if="!compact && account.orders.length" :aria-label="t('orders.filter.label', 'Show')" class="k-board__filters" role="tablist">
      <button
        v-for="f in filters"
        :key="f.key"
        :aria-selected="filter === f.key"
        :class="{ '-on': filter === f.key }"
        role="tab"
        type="button"
        @click="pick(f.key)"
      >
        {{ f.word }}<small v-if="counts[f.key]">{{ counts[f.key] }}</small>
      </button>
    </div>

    <!-- Waiting for the first read -->
    <div v-if="!account.loaded && !account.failed" aria-busy="true" class="k-board__wait">
      <span v-for="n in compact ? 2 : 3" :key="n" class="k-board__ghost"></span>
    </div>

    <!-- Bakini: a guest whose device holds no order is not an error (Selldone
         refuses the read when the shop takes no guest orders). -->
    <div v-else-if="account.failed && !account.orders.length && !USER()" class="empty">
      <span class="ec"><nx-icon name="box" /></span>
      <h3>{{ t("bakini.n.acc.noOrders", "No orders yet") }}</h3>
      <p>{{ t("bakini.n.acc.deviceP", "No orders on this device yet. Sign in to see the orders on your account.") }}</p>
      <div class="acts">
        <button class="btn" type="button" @click="askSignIn">{{ t("bakini.n.acc.signIn", "Sign in") }}</button>
      </div>
    </div>

    <div v-else-if="account.failed && !account.orders.length" class="empty">
      <span class="ec"><nx-icon name="info" /></span>
      <h3>{{ t("bakini.n.acc.loadFailed", "Your orders did not load.") }}</h3>
      <div class="acts">
        <button class="btn ghost" type="button" @click="retry">{{ t("bakini.n.acc.tryAgain", "Try again") }}</button>
      </div>
    </div>

    <div v-else-if="!visible.length" class="empty">
      <span class="ec"><nx-icon :name="filter === 'all' ? 'box' : 'filter'" /></span>
      <h3>{{ filter === "all" ? t("bakini.n.acc.noOrders", "No orders yet") : emptyWords }}</h3>
      <p v-if="filter === 'all'">{{ t("bakini.n.acc.noOrdersP", "When you place an order, it appears here with its delivery window and progress.") }}</p>
      <div class="acts">
        <router-link v-if="filter === 'all'" :to="{ path: '/' }" class="btn">{{ t("bakini.n.acc.startShopping", "Start shopping") }}</router-link>
        <button v-else class="btn ghost" type="button" @click="pick('all')">{{ t("bakini.n.acc.showAll", "Show all orders") }}</button>
      </div>
    </div>

    <!-- ━━━━━━━━ B: rows ━━━━━━━━ -->
    <div v-else-if="mode === 'table'" class="k-board__table">
      <div aria-hidden="true" class="k-board__row -head">
        <span>{{ t("orders.table.order", "Order") }}</span><span>{{ t("orders.table.items", "Items") }}</span><span>{{ t("orders.table.total", "Total") }}</span><span>{{ t("orders.table.status", "Status") }}</span><span></span>
      </div>
      <router-link v-for="order in visible" :key="order.id" :to="orderRoute(order)" class="k-board__row">
        <span class="k-board__code">
          <b>
            {{ code(order) }}
            <span v-if="chatCount(order)" :title="t('orders.messageCount', { one: '{n} message', other: '{n} messages' }, { n: chatCount(order) })" class="k-board__chat"><v-icon size="15">chat_bubble_outline</v-icon>{{ chatCount(order) }}</span>
          </b>
          <small>{{ when(order.reserved_at) }}</small>
        </span>
        <span class="k-board__thumbs">
          <span v-for="pic in thumbs(order, 5)" :key="pic.id" class="k-board__thumb">
            <img v-if="pic.src" :src="pic.src" alt="" loading="lazy" />
            <em v-if="pic.count > 1">×{{ pic.count }}</em>
          </span>
          <span v-if="productIds(order).length > 5" class="k-board__thumb -more">+{{ productIds(order).length - 5 }}</span>
        </span>
        <span class="k-board__money">
          <u-price :amount="order.price" :currency="order.currency" />
          <small>{{ t("orders.items", { one: "{n} item", other: "{n} items" }, { n: units(order) }) }}</small>
        </span>
        <span class="k-board__status">
          <span :class="`-${standing(order).tone}`" class="k-tag">
            <span v-if="standing(order).tone === 'go'" class="k-tag__beat"></span>
            <v-icon v-else-if="standing(order).icon" size="15">{{ standing(order).icon }}</v-icon>
            {{ standing(order).word }}
          </span>
        </span>
        <v-icon class="k-flip k-board__go" size="20">chevron_right</v-icon>
      </router-link>
    </div>

    <!-- ━━━━━━━━ Bakini Noir: a card per order (account-b's last order) ━━━━━━━━ -->
    <div v-else class="k-board__cards nx-orders">
      <article v-for="order in visible" :key="order.id" class="gcard last">
        <div class="gc-hd">
          <h2>{{ t("bakini.n.acc.orderCode", "Order {code}", { code: code(order) }) }}</h2>
          <span :class="`-${standing(order).tone}`" class="nx-orders__tag">{{ standing(order).word }}</span>
        </div>
        <router-link :to="orderRoute(order)" class="last-in">
          <span class="last-thumbs" aria-hidden="true">
            <span v-for="pic in thumbs(order, 3)" :key="pic.id" class="th"><img v-if="pic.src" :src="pic.src" alt="" class="cut" loading="lazy" /></span>
          </span>
          <span class="last-t">
            <b>{{ longDate(order.reserved_at || order.created_at) }}{{ " · " + t("bakini.n.acc.pieces", { one: "{n} piece", other: "{n} pieces" }, { n: units(order) }) }}</b>
            <span class="muted">{{ lineOf(order) }}</span>
          </span>
        </router-link>
        <ol v-if="standing(order).tone !== 'off'" :aria-label="t('bakini.n.ord.progress', 'Order progress')" class="tl">
          <li v-for="(s, i) in noirSteps" :key="s.key" :aria-current="i === noirAt(order) ? 'step' : undefined" :class="noirClass(order, i)">
            <span class="tl-dot"><nx-icon :name="noirClass(order, i) === 'done' ? 'check' : s.icon" /></span>
            <span class="tl-l">{{ s.label }}</span>
          </li>
        </ol>
        <div class="nx-orders__acts">
          <router-link v-if="standing(order).tone === 'pay'" :to="orderRoute(order)" class="btn sm"><nx-icon name="lock" />{{ t("bakini.n.acc.payNow", "Pay now") }}</router-link>
          <router-link v-else :to="orderRoute(order)" class="btn sm">{{ t("bakini.n.acc.viewOrder", "View order") }}</router-link>
          <button v-if="['ok', 'off'].includes(standing(order).tone)" :disabled="busy[order.id]" class="btn ghost sm" type="button" @click="buyAgain(order)">
            <nx-icon :name="done[order.id] ? 'check' : 'bag'" />{{ done[order.id] ? t("bakini.n.acc.inBag", "In your bag") : t("bakini.n.acc.buyAgain", "Buy again") }}
          </button>
          <router-link :to="orderRoute(order)" class="link">
            <nx-icon name="chat" />{{ chatCount(order) ? t("bakini.n.acc.messages", { one: "{n} message", other: "{n} messages" }, { n: chatCount(order) }) : t("bakini.n.acc.ask", "Write to the bakery") }}
          </router-link>
        </div>
      </article>
    </div>

    <div v-if="canShowMore" class="k-board__more">
      <button :disabled="account.loading" class="k-btn -line" type="button" @click="more">
        <v-progress-circular v-if="account.loading" indeterminate size="16" width="2" />{{ t("orders.showOlder", "Show older orders") }}
      </button>
    </div>
    <router-link v-if="compact && filtered.length > limit" :to="allRoute" class="k-board__all">
      {{ t("orders.seeAll", { one: "See all {n} orders", other: "See all {n} orders" }, { n: account.total }) }}<v-icon class="k-flip" size="18">chevron_right</v-icon>
    </router-link>
  </section>
</template>

<script>
import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";
import { EventBus } from "@selldone/components-vue/utils/events/EventBus.ts";
import { reorder } from "../kalio-basket";
import { t } from "../i18n/kalio-i18n";
import { productImage, vendors } from "../kalio-catalog";
import KalioOrderKinds from "./KalioOrderKinds.vue";
import NxIcon from "../../bakini/noir/NxIcon.vue";
import { longDate, noirStepAt, noirStepClass, noirSteps, orderLine } from "../../bakini/noir/account/noir-account";
import {
  ORDERS_DESK,
  FILTERS,
  account,
  joinNames,
  loadDetail,
  loadDetails,
  loadOlder,
  loadOrders,
  orderCode,
  paidWords,
  placeOf,
  productIds,
  sellersOf,
  standing,
  STATES,
  stepOf,
  TRAIL,
  unitsOf,
  when,
} from "./kalio-account";

const STEP = 10;

export default {
  name: "KalioOrdersBoard",
  components: { KalioOrderKinds, NxIcon },
  inject: ["$shop"],

  props: {
    mode: { type: String, default: ORDERS_DESK ? "cards" : "table" },
    /** On the Overview: the first few, no head or filters. */
    compact: Boolean,
    limit: { type: Number, default: 5 },
  },

  data() {
    return {
      account,
      trail: TRAIL,
      filters: FILTERS,
      filter: "all",
      showing: STEP,
      sellers: new Map(),
      busy: {},
      done: {},
    };
  },

  computed: {
    noirSteps() {
      return noirSteps();
    },
    title() {
      return ORDERS_DESK ? t("account.yourOrders", "Your orders") : t("orders.history", "Order history");
    },
    line() {
      if (!account.loaded || !ORDERS_DESK) return null;
      const n = account.total;
      if (!n) return null;
      const moving = account.orders.filter((o) => ["go", "prep"].includes(standing(o).tone)).length;
      const orders = t("orders.line.count", { one: "{n} order", other: "{n} orders" }, { n });
      return moving ? t("orders.line.moving", { one: "{orders} · {n} on its way to you", other: "{orders} · {n} on their way to you" }, { n: moving, orders }) : orders;
    },
    counts() {
      const out = {};
      for (const f of FILTERS) out[f.key] = account.orders.filter(f.test).length;
      out.all = account.total || out.all;
      return out;
    },
    filtered() {
      const f = FILTERS.find((x) => x.key === this.filter) || FILTERS[0];
      return account.orders.filter(f.test);
    },
    visible() {
      return this.filtered.slice(0, this.compact ? this.limit : this.showing);
    },
    canShowMore() {
      if (this.compact) return false;
      return this.filtered.length > this.showing || (this.filter === "all" && account.orders.length < account.total);
    },
    emptyWords() {
      if (this.filter === "all") return t("orders.empty.all", "No orders yet. What you buy shows up here, with where it is.");
      return {
        go: t("orders.empty.go", "Nothing on the way right now."),
        pay: t("orders.empty.pay", "Nothing waiting for payment."),
        ok: t("orders.empty.ok", "Nothing delivered yet."),
        off: t("orders.empty.off", "No cancelled orders."),
      }[this.filter];
    },
    allRoute() {
      return { name: window.$storefront.routes.HISTORY_ORDERS_PHYSICAL };
    },
  },

  watch: {
    visible: {
      handler(list) {
        loadDetails(this, list);
      },
      immediate: true,
    },
  },

  created() {
    loadOrders(this);
    vendors().then((list) => (this.sellers = new Map(list.map((v) => [v.id, v]))));
  },

  methods: {
    /** The app's sign-in sheet (KalioSignIn). This board has no AuthMixin, so
     *  NeedLogin() was not a function and the guest's "Sign in" did nothing. */
    askSignIn() {
      EventBus.$emit("need-login", true);
    },
    standing,
    productIds,
    paidWords,
    when,
    units: unitsOf,
    code(order) {
      return orderCode(this, order);
    },
    orderRoute(order) {
      return { name: "MyPhysicalOrderInfoPage", params: { basket_id: order.id } };
    },
    chatCount(order) {
      return order.chat?.length || 0;
    },
    /** One picture per product, with how many, from the full order when read. */
    longDate,
    /* Bakini Noir: B's four steps and the order's one line. */
    noirAt(order) {
      return noirStepAt((account.details[order.id] || order).delivery_state);
    },
    noirClass(order, i) {
      return noirStepClass(i, this.noirAt(order), 3);
    },
    lineOf(order) {
      return orderLine(this.$shop, order, account.details[order.id]);
    },
    thumbs(order, max) {
      const full = account.details[order.id];
      const byProduct = new Map();
      for (const item of order.items || []) {
        const at = byProduct.get(item.product_id) || { id: item.product_id, count: 0, src: null };
        at.count += item.count || 0;
        byProduct.set(item.product_id, at);
      }
      if (full) {
        for (const item of full.items || []) {
          const at = byProduct.get(item.product_id);
          if (!at) continue;
          at.src = item.variant?.image ? window.CDN.GET_SHOP_IMAGE_PATH(item.variant.image, 128) : productImage(item.product, true) || at.src;
        }
      }
      for (const at of byProduct.values()) if (!at.src) at.src = this.getProductImage(at.id);
      return [...byProduct.values()].slice(0, max);
    },
    headline(order) {
      const s = standing(order);
      const full = account.details[order.id];
      if (s.tone === "ok") return full?.delivery_at ? t("orders.headline.reached", "Reached you {when}", { when: when(full.delivery_at) }) : t("orders.headline.delivered", "Delivered");
      if (s.tone === "go") return t("orders.headline.onItsWay", "On its way to you");
      if (s.tone === "pay") return t("orders.headline.pay", "Pay to keep this order");
      if (s.tone === "off") return order.reject ? t("orders.headline.rejected", "The shop could not take this order") : t("orders.headline.cancelled", "This order was cancelled");
      if (s.key === "preparing") return t("orders.headline.packing", "The shop is packing it");
      if (s.key === "confirmed") return t("orders.headline.accepted", "The shop has accepted it");
      return t("orders.headline.waiting", "Waiting for the shop to accept it");
    },
    subline(order) {
      const n = unitsOf(order);
      const names = joinNames(sellersOf(order, this.sellers));
      const place = placeOf(order);
      const items = names
        ? t("orders.subline.itemsFrom", { one: "{n} item from {names}", other: "{n} items from {names}" }, { n, names })
        : t("orders.items", { one: "{n} item", other: "{n} items" }, { n });
      return [items, place && standing(order).tone !== "pay" ? t("orders.subline.to", "to {place}", { place }) : null].filter(Boolean).join(" · ");
    },
    /** Selldone's own name for a step, for the tooltip. */
    stepName(i) {
      const name = STATES[i]?.name;
      return name ? this.$t(name) : null;
    },
    barClass(order, i) {
      const step = stepOf(order);
      if (i < step || (i === step && step === 4)) return "-on";
      if (i === step) return "-now";
      return "";
    },
    pick(key) {
      this.filter = key;
      this.showing = STEP;
    },
    more() {
      if (this.filtered.length > this.showing) this.showing += STEP;
      else loadOlder(this).then(() => (this.showing += STEP));
    },
    retry() {
      loadOrders(this, true);
    },
    async buyAgain(order) {
      this.busy[order.id] = true;
      try {
        const full = account.details[order.id] || (await loadDetail(this, order.id));
        if (!full) throw new Error("no order");
        const { added, failed } = await reorder(this, full.items);
        if (added) {
          this.done[order.id] = true;
          setTimeout(() => (this.done[order.id] = false), 2400);
        }
        if (failed) NotificationService.showErrorAlert(null, t("orders.reorder.failed", { one: "{n} item is not sold any more and stayed out.", other: "{n} items are not sold any more and stayed out." }, { n: failed }));
      } catch (e) {
        NotificationService.showErrorAlert(null, t("orders.reorder.error", "This order could not be added again."));
      } finally {
        this.busy[order.id] = false;
      }
    },
  },
};
</script>
