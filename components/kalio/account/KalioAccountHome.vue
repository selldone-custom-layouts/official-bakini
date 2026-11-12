<!--
  Bakini Noir — the account's Overview (bakio-design/account-b.html): the
  last order (its photos, number and date, the way · window and how it is
  paid, and the mockup's four steps with a label under each; "View order"),
  then the saved address and the profile side by side, then "Order again"
  with the last order's products (compact rows with their + box). No order
  yet: the mockup's "No orders yet" card. Nothing shows as an empty box: a
  card without data is left out (no address: a line that asks for one).
-->
<template>
  <div class="nx-ahome">
    <!-- The last order -->
    <div v-if="latest" class="gcard last">
      <div class="gc-hd">
        <h2>{{ t("bakini.n.acc.lastOrder", "Last order") }}</h2>
        <router-link :to="orderRoute(latest)" class="link">{{ t("bakini.n.acc.viewOrder", "View order") }}<nx-icon name="arrow" cls="flip-rtl" /></router-link>
      </div>
      <div class="last-in">
        <div v-if="thumbs.length" class="last-thumbs">
          <span v-for="th in thumbs" :key="th.key" :style="{ '--bk-hue': hueOf(th.category) }" class="th"><img v-if="th.src" :src="th.src" alt="" class="cut" loading="lazy" /></span>
        </div>
        <div class="last-t">
          <b>{{ t("bakini.n.acc.orderOn", "Order {code} · {date}", { code: code(latest), date: longDate(latest.reserved_at || latest.created_at) }) }}</b>
          <span class="muted">{{ lastLine }}</span>
        </div>
      </div>
      <ol v-if="tone.tone !== 'off'" :aria-label="t('bakini.n.ord.progress', 'Order progress')" class="tl">
        <li v-for="(s, i) in steps" :key="s.key" :aria-current="i === stepAt ? 'step' : undefined" :class="stepClass(i)">
          <span class="tl-dot"><nx-icon :name="stepClass(i) === 'done' ? 'check' : s.icon" /></span>
          <span class="tl-l">{{ s.label }}</span>
        </li>
      </ol>
      <p v-else class="nx-ahome__off"><nx-icon name="close" />{{ tone.word }}</p>
      <div v-if="tone.tone === 'pay'" class="nx-ahome__pay">
        <span>{{ t("bakini.n.acc.waitingPay", "This order is waiting for payment.") }}</span>
        <router-link :to="orderRoute(latest)" class="btn sm"><nx-icon name="lock" />{{ t("bakini.n.acc.payNow", "Pay now") }}</router-link>
      </div>
    </div>

    <div v-else-if="account.loaded" class="empty">
      <span class="ec"><nx-icon name="box" /></span>
      <h3>{{ t("bakini.n.acc.noOrders", "No orders yet") }}</h3>
      <p>{{ t("bakini.n.acc.noOrdersP", "When you place an order, it appears here with its delivery window and progress.") }}</p>
      <div class="acts">
        <router-link :to="{ path: '/' }" class="btn">{{ t("bakini.n.acc.startShopping", "Start shopping") }}</router-link>
      </div>
    </div>
    <div v-else aria-busy="true" class="gcard last nx-ahome__wait"><span></span><span></span></div>

    <div class="desk-two">
      <!-- The saved address -->
      <div class="gcard">
        <div class="gc-hd">
          <h2>{{ t("bakini.n.acc.address", "Saved address") }}</h2>
          <router-link :to="sectionRoute('USER_ADDRESSES_PAGE')" class="link">{{ address ? t("bakini.n.acc.manage", "Manage") : t("bakini.n.acc.add", "Add") }}</router-link>
        </div>
        <div class="ilines">
          <template v-if="address">
            <div class="iline">
              <nx-icon name="home" />
              <div>
                <b>{{ address.name || address.title || t("bakini.n.acc.addressUntitled", "Address") }}</b><span>{{ addressLine(address) }}</span>
              </div>
            </div>
            <div v-if="address.phone" class="iline">
              <nx-icon name="phone" />
              <div>
                <b>{{ address.phone }}</b><span>{{ t("bakini.n.acc.receiverPhone", "Receiver phone") }}</span>
              </div>
            </div>
          </template>
          <div v-else class="iline">
            <nx-icon name="pin" />
            <div>
              <b>{{ account.addresses ? t("bakini.n.acc.noAddress", "No saved address yet") : t("bakini.n.acc.moment", "One moment…") }}</b
              ><span>{{ t("bakini.n.acc.noAddressP", "Save one and pick it at checkout in a tap.") }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- The profile -->
      <div class="gcard">
        <div class="gc-hd">
          <h2>{{ t("bakini.n.acc.profile", "Profile") }}</h2>
          <router-link :to="sectionRoute('USER_PROFILE_PAGE')" class="link">{{ t("bakini.n.acc.edit", "Edit") }}</router-link>
        </div>
        <div class="ilines">
          <div class="iline">
            <nx-icon name="user" />
            <div>
              <b>{{ user?.name }}</b><span>{{ t("bakini.n.acc.name", "Name") }}</span>
            </div>
          </div>
          <div v-if="user?.email" class="iline">
            <nx-icon name="mail" />
            <div>
              <b>{{ user.email }}</b><span>{{ t("bakini.n.acc.emailFor", "Email for order updates") }}</span>
            </div>
          </div>
          <div v-if="user?.phone" class="iline">
            <nx-icon name="phone" />
            <div>
              <b>{{ user.phone }}</b><span>{{ t("bakini.n.acc.phone", "Phone") }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Order again -->
    <div v-if="again.length" class="gcard">
      <div class="gc-hd">
        <h2>{{ t("bakini.n.acc.again", "Order again") }}</h2>
        <span class="muted">{{ t("bakini.n.acc.fromLast", "From your last order") }}</span>
      </div>
      <div class="again">
        <nx-mini v-for="p in again" :key="p.id" :product="p" />
      </div>
    </div>
  </div>
</template>

<script>
import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";
import CurrencyMixin from "@selldone/components-vue/mixin/currency/CurrencyMixin.ts";
import { reorder } from "../kalio-basket";
import { t } from "../i18n/kalio-i18n";
import { productImage, productsById, vendors } from "../kalio-catalog";
import NxIcon from "../../bakini/noir/NxIcon.vue";
import NxMini from "../../bakini/noir/NxMini.vue";
import { hueOf } from "../../bakini/noir/noir";
import { longDate, noirStepAt, noirStepClass, noirSteps, orderLine } from "../../bakini/noir/account/noir-account";
import {
  STATES,
  account,
  loadAddresses,
  loadDetail,
  loadGiftcards,
  loadOrders,
  loadWallets,
  orderCode,
  paidWords,
  standing,
  stepOf,
  userKnown,
  when,
} from "./kalio-account";

const LINES = 4;

export default {
  name: "KalioAccountHome",
  components: { NxIcon, NxMini },
  mixins: [CurrencyMixin],
  inject: ["$shop"],

  data() {
    return {
      account,
      states: STATES,
      sellers: new Map(),
      catalogue: new Map(),
      busy_again: false,
      again_done: false,
    };
  },

  computed: {
    // ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Bakini Noir ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅
    user() {
      return this.USER();
    },
    steps() {
      return noirSteps();
    },
    stepAt() {
      return noirStepAt((this.detail || this.latest)?.delivery_state);
    },
    /* Up to three of the last order's photos. */
    thumbs() {
      const items = (this.detail?.items || this.latest?.items || []).slice(0, 3);
      return items.map((item, i) => {
        const product = item.product || this.catalogue.get(item.product_id);
        return {
          key: i,
          src: this.detail ? this.image(item) : (product && productImage(product, true)) || this.getProductImage(item.product_id),
          category: product?.category_id,
        };
      });
    },
    lastLine() {
      return orderLine(this.$shop, this.latest, this.detail);
    },
    address() {
      return (account.addresses || [])[0] || null;
    },
    /* The last order's products, as the shop sells them now. */
    again() {
      const items = this.detail?.items || this.latest?.items || [];
      const ids = [...new Set(items.map((it) => it.product_id))];
      /* The shop's listing when it has the product; else the order's own copy. */
      return ids
        .map((id) => this.catalogue.get(id) || items.find((it) => it.product_id === id && it.product?.title)?.product)
        .filter((p) => p && p.status !== "Close")
        .slice(0, 3);
    },
    currency() {
      return this.latest?.currency || this.GetUserSelectedCurrency()?.code || this.$shop.currency;
    },
    latest() {
      return account.orders[0] || null;
    },
    detail() {
      return this.latest ? account.details[this.latest.id] : null;
    },
    tone() {
      return standing(this.latest);
    },
    lines() {
      const detail = this.detail;
      if (detail) {
        return (detail.items || []).slice(0, LINES).map((item) => ({
          key: item.id,
          src: this.image(item),
          title: item.product?.title || t("account.home.anItem", "An item"),
          count: item.count,
          price: item.price,
          total: this.lineTotal(item),
          seller: this.sellerName(item),
          currency: detail.currency,
        }));
      }
      // Before the full order (or without it): the list's products and counts.
      const missing = !!account.missing[this.latest?.id];
      return (this.latest?.items || []).slice(0, LINES).map((item, i) => {
        const product = this.catalogue.get(item.product_id);
        return {
          key: `l${i}`,
          src: (product && productImage(product, true)) || this.getProductImage(item.product_id),
          title: product?.title || (missing ? t("account.home.anItem", "An item") : null),
          count: item.count,
          price: null,
          total: null,
          seller: null,
          currency: this.latest.currency,
        };
      });
    },
    moreLines() {
      return Math.max(0, (this.detail?.items || this.latest?.items || []).length - LINES);
    },
    footWords() {
      const parts = [paidWords(this.latest)];
      if (this.detail?.discount > 0) parts.push(t("account.home.youSaved", "you saved {amount}", { amount: this.money(this.detail.discount, this.detail.currency) }));
      return parts.filter(Boolean).join(" · ");
    },
    moving() {
      return account.orders.filter((o) => ["go", "prep"].includes(standing(o).tone)).length;
    },
    /** "orders · 2 on the way", under the count of orders. */
    ordersWords() {
      const orders = t("account.home.tile.orders", { one: "order", other: "orders" }, { n: account.total });
      return this.moving ? t("account.home.tile.ordersMoving", "{orders} · {n} on the way", { orders, n: this.moving }) : orders;
    },
    waiting() {
      return account.orders.find((o) => standing(o).tone === "pay") || null;
    },
    /** What deals took off, over the orders read in full (not cancelled). */
    saved() {
      return Object.values(account.details)
        .filter((o) => o.status !== "Canceled")
        .reduce((sum, o) => sum + (o.discount || 0), 0);
    },
    savedWords() {
      const read = Object.keys(account.details).length;
      return read < account.total ? t("account.home.tile.savedRecent", "saved on recent orders") : t("account.home.tile.savedDeals", "saved with deals");
    },
    wallet() {
      const list = account.wallets || [];
      const mine = list.find((w) => w.currency === this.currency) || list[0];
      return { amount: mine?.balance || 0, currency: mine?.currency || this.currency };
    },
    ordersRoute() {
      return { name: window.$storefront.routes.HISTORY_ORDERS_PHYSICAL };
    },
  },

  watch: {
    latest: {
      handler(order) {
        if (order) loadDetail(this, order.id);
      },
      immediate: true,
    },
  },

  created() {
    this.setPageTitle?.(t("account.pageTitle.home", "My account"));
    vendors().then((list) => (this.sellers = new Map(list.map((v) => [v.id, v]))));
    productsById().then((map) => (this.catalogue = map));
    // After a reload the shopper is read first; a guest has only the
    // orders kept on this device.
    userKnown(this).then(() => {
      if (!this.USER()) {
        this.$router.replace(this.ordersRoute);
        return;
      }
      loadOrders(this);
      loadAddresses();
      loadWallets(this);
      loadGiftcards(this);
    });
  },

  methods: {
    t,
    hueOf,
    longDate,
    when,
    code(order) {
      return orderCode(this, order);
    },
    orderRoute(order) {
      return { name: "MyPhysicalOrderInfoPage", params: { basket_id: order.id } };
    },
    sectionRoute(name) {
      return { name: window.$storefront.routes[name] };
    },
    stepClass(i) {
      return noirStepClass(i, this.stepAt, this.steps.length - 1);
    },
    /** The times Selldone records: placed, sent, delivered. */
    stepTime(i) {
      const trip = this.detail?.transportation_order;
      const at = i === 0 ? this.latest.reserved_at : i === 3 ? trip?.send_at : i === 4 ? this.detail?.delivery_at || trip?.deliver_at : null;
      if (!at || this.stepClass(i) !== "-done") return null;
      return new Date(at).toLocaleTimeString(document.documentElement.lang || "en", { hour: "numeric", minute: "2-digit" });
    },
    image(item) {
      if (item.variant?.image) return window.CDN.GET_SHOP_IMAGE_PATH(item.variant.image, 128);
      return productImage(item.product, true);
    },
    sellerName(item) {
      return this.sellers.get(item.vendor_id)?.name || null;
    },
    lineTotal(item) {
      return (item.price || 0) * (item.count || 0) - (item.offer_amount || 0);
    },
    money(amount, currency) {
      try {
        return new Intl.NumberFormat(document.documentElement.lang || "en", { style: "currency", currency: currency || "USD" }).format(amount || 0);
      } catch (e) {
        return `${amount}`;
      }
    },
    addressLine(a) {
      const street = [a.address, a.no, a.unit].filter(Boolean).join(", ");
      const place = [a.city, [a.state_code || a.state, a.postal].filter(Boolean).join(" ")].filter(Boolean).join(", ");
      return [street, place, a.country ? this.countryName(a.country) : null].filter(Boolean).join(", ");
    },
    countryName(code) {
      try {
        return new Intl.DisplayNames([document.documentElement.lang || "en"], { type: "region" }).of(code) || code;
      } catch (e) {
        return code;
      }
    },
    async buyAgain() {
      this.busy_again = true;
      try {
        const full = this.detail || (await loadDetail(this, this.latest.id));
        if (!full) throw new Error("no order");
        const { added, failed } = await reorder(this, full.items);
        if (added) {
          this.again_done = true;
          setTimeout(() => (this.again_done = false), 2400);
        }
        if (failed) NotificationService.showErrorAlert(null, t("orders.reorder.failed", { one: "{n} item is not sold any more and stayed out.", other: "{n} items are not sold any more and stayed out." }, { n: failed }));
      } catch (e) {
        NotificationService.showErrorAlert(null, t("orders.reorder.error", "This order could not be added again."));
      } finally {
        this.busy_again = false;
      }
    },
  },
};
</script>
