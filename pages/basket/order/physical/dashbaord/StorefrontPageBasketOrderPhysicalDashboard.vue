<!--
  - Copyright (c) 2023-2024. Selldone® Business OS™
  -
  - Author: M.Pajuhaan
  - Web: https://selldone.com
  - ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  -
  - All rights reserved. In the weave of time, where traditions and innovations intermingle, this content was crafted.
  - From the essence of thought, through the corridors of creativity, each word, and sentiment has been molded.
  - Not just to exist, but to inspire. Like an artist's stroke or a sculptor's chisel, every nuance is deliberate.
  - Our journey is not just about reaching a destination, but about creating a masterpiece.
  - Tread carefully, for you're treading on dreams.
  -->

<!--
  Bakini Noir — a physical order's page (bakio-design/order-b.html,
  b/pages-buy.js order): the order's own words and number ("Thank you. It's
  in the oven."), when it was placed, the way and its window; the Invoice
  and a share link; the steps as the mockup's timeline with a label and an
  icon under each (Placed · Baking · On the way · Delivered, from
  Selldone's delivery states); the items with the receipt (Selldone's sums:
  an order's price is after every discount, with delivery in it); how it is
  paid ("Pay on delivery $X", or "Pay now" while an online payment waits:
  KalioOrderReceipt); the delivery card (the way · window, the receiver,
  the address; KalioOrderDelivery keeps "Change address" and the trip);
  and the messages beside them (KalioOrderChat, the shop's mark as its
  avatar). A bank transfer's details, the sellers' own orders, returns and
  refunds stay Selldone's own.
-->
<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
  <div class="nx nx-order">
    <section class="ord">
      <div class="ord-t">
        <div>
          <h1 class="serif">{{ heroTitle }}{{ heroEm ? " " : "" }}<em v-if="heroEm">{{ heroEm }}</em></h1>
          <p class="muted">
            {{ t("bakini.n.ord.order", "Order {code}", { code: getBasketOrderCode(basket) }) }}<template v-if="placedAt">{{ " · " + t("bakini.n.ord.placed", "Placed {date}", { date: placedAt }) }}</template
            ><template v-if="wayLine">{{ " · " + wayLine }}</template>
          </p>
        </div>
        <div class="nx-ord-acts">
          <button :disabled="busy_invoice" class="btn ghost sm" type="button" @click="downloadInvoice">
            <nx-icon name="doc" />{{ t("bakini.n.ord.invoice", "Invoice") }}
          </button>
          <s-shop-share-order-button :basket="basket" class="nx-share"></s-shop-share-order-button>
          <router-link :to="{ name: window.$storefront.routes.SHOP_PAGE }" class="btn ghost sm">{{ t("bakini.n.ord.continue", "Continue shopping") }}</router-link>
        </div>
      </div>

      <div v-if="tone !== 'off'" class="gcard ord-tl">
        <ol :aria-label="t('bakini.n.ord.progress', 'Order progress')" class="tl">
          <li v-for="(s, i) in steps" :key="s.key" :aria-current="i === stepAt ? 'step' : undefined" :class="i < stepAt || (i === stepAt && i === steps.length - 1) ? 'done' : i === stepAt ? 'cur' : ''">
            <span class="tl-dot"><nx-icon :name="i < stepAt || (i === stepAt && i === steps.length - 1) ? 'check' : s.icon" /></span>
            <span class="tl-l">{{ s.label }}</span>
          </li>
        </ol>
      </div>
      <div v-else class="gcard nx-ord-off">
        <span class="dm-ic"><nx-icon name="close" /></span>
        <div>
          <b>{{ t("bakini.n.ord.cancelledT", "This order was cancelled") }}</b><span>{{ t("bakini.n.ord.cancelledP", "Nothing more will happen with it. Write to the bakery if you have a question.") }}</span>
        </div>
      </div>

      <div class="ord-grid">
        <div class="ord-main">
          <div class="gcard">
            <div class="gc-hd">
              <h2>{{ t("bakini.n.ord.items", "Items") }}</h2>
              <span class="muted">{{ t("bakini.n.ord.pieces", { one: "{n} piece", other: "{n} pieces" }, { n: units }) }}</span>
            </div>
            <div v-for="item in basket.items" :key="item.id" :style="{ '--bk-hue': hueOf(item.product?.category_id) }" class="brow">
              <router-link :to="productRoute(item.product_id)" aria-hidden="true" class="th" tabindex="-1"><img v-if="image(item)" :src="image(item)" alt="" class="cut" /></router-link>
              <div style="min-width: 0">
                <router-link :to="productRoute(item.product_id)" class="nm">{{ item.product?.title }}</router-link>
                <div class="meta">
                  <span class="money">{{ amount(item.price) }}</span><template v-if="item.dis > 0"
                    >{{ " " }}<span class="was money">{{ amount(item.price + item.dis) }}</span>{{ " · " }}<span class="gold">{{ t("bakini.n.ord.save", "Save {amount}", { amount: amount(item.dis) }) }}</span></template
                  ><template v-if="size(item)">{{ " · " + size(item) }}</template>
                </div>
              </div>
              <div class="rt">
                <span class="lt money">{{ amount(item.price * item.count - (item.offer_amount || 0)) }}</span><span class="muted" style="font-size: 12.5px">× {{ item.count }}</span>
              </div>
            </div>
            <div class="ord-rc">
              <div class="rcpt">
                <div class="ln">
                  <span>{{ t("bakini.n.ord.full", "Items at full price") }}</span><span class="money">{{ amount(sums.full) }}</span>
                </div>
                <div v-if="sums.save > 0" class="ln save">
                  <span>{{ t("bakini.n.ord.savings", "Savings") }}</span><span class="money">−{{ amount(sums.save) }}</span>
                </div>
                <div v-if="sums.other > 0.004" class="ln save">
                  <span>{{ t("bakini.n.ord.offers", "Offers and codes") }}</span><span class="money">−{{ amount(sums.other) }}</span>
                </div>
                <div class="ln">
                  <span>{{ deliveryLabel }}</span><span>{{ basket.delivery_price > 0 ? amount(basket.delivery_price) : t("bakini.n.ord.free", "Free") }}</span>
                </div>
                <div class="ln tot">
                  <span>{{ t("bakini.n.ord.total", "Total") }}</span><span class="money">{{ amount(basket.price) }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- How it is paid -->
          <div v-if="payCard" class="gcard ord-pay">
            <span class="dm-ic"><nx-icon :name="payCard.icon" /></span>
            <div>
              <p class="eyebrow">{{ t("bakini.n.ord.payment", "Payment") }}</p>
              <b class="serif">{{ payCard.title }}</b>
              <span v-if="payCard.line">{{ payCard.line }}</span>
            </div>
          </div>
          <kalio-order-receipt v-else :basket="basket" class="nx-ord-receipt" />

          <section v-if="transfers.length" class="gcard">
            <div class="gc-hd">
              <h2>{{ t("bakini.n.ord.transfer", "Pay by bank transfer") }}</h2>
            </div>
            <table class="nx-ord-legacy">
              <tbody>
                <s-shop-row-customer-pending-payment v-for="tr in transfers" :key="tr.id" :order="basket" :transaction="tr" />
              </tbody>
            </table>
          </section>

          <kalio-order-delivery :basket="basket" class="nx-ord-delivery" />
          <s-basket-vendor-orders v-if="basket.vendor_orders?.length" :basket="basket" class="nx-ord-box"></s-basket-vendor-orders>
          <s-order-basket-return :basket="basket" class="nx-ord-box" />
          <s-shop-customer-order-withdraw :order="basket" :payment="basket.payment" class="nx-ord-box" @request:refresh="$emit('request:refresh')" />
        </div>

        <aside class="ord-side">
          <kalio-order-chat :basket="basket" class="nx-ord-chat" />
        </aside>
      </div>
    </section>
  </div>
</template>

<script lang="ts">
import SOrderBasketReturn from "@selldone/components-vue/storefront/order/basket/return/SOrderBasketReturn.vue";
import SShopRowCustomerPendingPayment from "@selldone/components-vue/storefront/order/payment/rows/SShopRowCustomerPendingPayment.vue";
import SShopCustomerOrderWithdraw from "@selldone/components-vue/storefront/order/payment/withdraw/SShopCustomerOrderWithdraw.vue";
import KalioOrderDelivery from "../../../../../components/kalio/order/KalioOrderDelivery.vue";
import KalioOrderChat from "../../../../../components/kalio/order/KalioOrderChat.vue";
import KalioOrderReceipt from "../../../../../components/kalio/order/KalioOrderReceipt.vue";

import SShopShareOrderButton from "@selldone/components-vue/storefront/order/share-order/SShopShareOrderButton.vue";
import { ProductType } from "@selldone/core-js/enums/product/ProductType";
import SBasketVendorOrders from "@selldone/components-vue/storefront/order/vendor-order/SBasketVendorOrders.vue";
import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";
import { Basket } from "@selldone/core-js";
import { productImage, vendorImage, vendors } from "../../../../../components/kalio/kalio-catalog";
import { t } from "../../../../../components/kalio/i18n/kalio-i18n";
import NxIcon from "../../../../../components/bakini/noir/NxIcon.vue";
import { hueOf, loadNoir, shopFacts, wayTitle } from "../../../../../components/bakini/noir/noir";
import { money } from "../../../../../components/region-switcher/region";
import { wayWindowLine } from "../../../../../components/bakini/noir/buy/noir-cart";

/* The size of a variant in words: its volume, weight, pack, colour or style. */
function sizeOf(variant) {
  if (!variant) return null;
  return variant.volume || variant.weight || variant.pack || variant.type || variant.style || null;
}

export default {
  name: "StorefrontPageBasketOrderPhysicalDashboard",
  components: {
    SBasketVendorOrders: SBasketVendorOrders,
    SShopShareOrderButton,
    SShopRowCustomerPendingPayment,
    SShopCustomerOrderWithdraw,
    SOrderBasketReturn,
    KalioOrderDelivery,
    KalioOrderChat,
    KalioOrderReceipt,
    NxIcon,
  },

  emits: ["request:refresh"],

  props: {
    basket: {
      type: Object,
      require: true,
    },
  },

  data: function () {
    return {
      ProductType: ProductType,

      orderType: ProductType.PHYSICAL,
      busy_invoice: false,
      sellers: new Map(),
    };
  },
  computed: {
    shop() {
      return this.getShop();
    },

    // ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Bakini Noir ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅
    /* The mockup's four steps over Selldone's five delivery states. */
    steps() {
      return [
        { key: "placed", label: t("bakini.n.ord.stPlaced", "Placed"), icon: "check", codes: ["CheckQueue", "OrderConfirm"] },
        { key: "baking", label: t("bakini.n.ord.stBaking", "Baking"), icon: "oven", codes: ["PreparingOrder"] },
        { key: "way", label: t("bakini.n.ord.stWay", "On the way"), icon: "bike", codes: ["SentOrder"] },
        { key: "done", label: t("bakini.n.ord.stDone", "Delivered"), icon: "home", codes: ["ToCustomer"] },
      ];
    },
    stepAt() {
      const at = this.steps.findIndex((s) => s.codes.includes(this.basket?.delivery_state));
      return at < 0 ? 0 : at;
    },
    heroEm() {
      if (this.tone !== "ok") return "";
      return [t("bakini.n.ord.emPlaced", "We have it."), t("bakini.n.ord.emBaking", "It's in the oven."), t("bakini.n.ord.emWay", "It's on the way."), t("bakini.n.ord.emDone", "Enjoy.")][this.stepAt];
    },
    units() {
      return (this.basket?.items || []).reduce((n, it) => n + (it.count || 0), 0);
    },
    currency() {
      return this.basket?.currency;
    },
    /* Selldone's sums: the items at full price, their savings, any other
       discount (offers, codes, coupons, the club, the wallet) as what is
       left between them and the order's price. */
    sums() {
      const items = this.basket?.items || [];
      const full = items.reduce((s, it) => s + (it.price + (it.dis || 0)) * it.count, 0);
      const save = items.reduce((s, it) => s + (it.dis || 0) * it.count, 0);
      const delivery = this.basket?.delivery_price > 0 ? this.basket.delivery_price : 0;
      const other = full - save + delivery + (this.basket?.tax_included ? 0 : this.basket?.tax || 0) - (this.basket?.price || 0);
      return { full, save, other: other > 0 ? other : 0 };
    },
    way() {
      const type = this.basket?.delivery_info?.type;
      return (this.shop?.transportations || []).find((x) => x.type === type) || (type ? { type } : null);
    },
    wayLine() {
      return this.way ? wayWindowLine(this.shop, this.basket?.delivery_info) : "";
    },
    deliveryLabel() {
      return this.way ? t("bakini.n.ord.deliveryOf", "Delivery · {way}", { way: wayTitle(this.way, this.shop) }) : t("bakini.n.ord.delivery", "Delivery");
    },
    /* Cash on delivery or paid: one calm card. Waiting for an online
       payment: KalioOrderReceipt with "Pay now". */
    payCard() {
      const b = this.basket || {};
      if (b.status === "Payed") {
        const g = b.payment?.gateway;
        return { icon: "check", title: t("bakini.n.ord.paid", "Paid {amount}", { amount: this.amount(b.price) }), line: g?.name || "" };
      }
      const cod = (b.transactions_pending || []).find((x) => x.cod) || (b.status === "COD" ? {} : null);
      if (cod) {
        const facts = shopFacts(this.shop);
        return { icon: "cash", title: t("bakini.n.ord.payOnDelivery", "Pay on delivery {amount}", { amount: this.amount(b.price) }), line: facts.gateway?.description || cod.name || "" };
      }
      if (b.status === "Canceled") return { icon: "close", title: t("bakini.n.ord.notCharged", "Nothing to pay"), line: "" };
      return null;
    },

    // ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Kalio ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅
    states() {
      return Object.values(Basket.PhysicalOrderStates || {});
    },
    stateIndex() {
      const at = this.states.findIndex((state) => state.code === this.basket?.delivery_state);
      return at < 0 ? 0 : at;
    },
    /** ok: paid or paying on delivery · wait: not paid yet · off: cancelled */
    tone() {
      const status = this.basket?.status;
      if (status === "Canceled") return "off";
      if (status === "Payed" || status === "COD") return "ok";
      return "wait";
    },
    toneIcon() {
      return { ok: "check", wait: "schedule", off: "close" }[this.tone];
    },
    heroTitle() {
      if (this.tone === "off") return t("bakini.n.ord.cancelled", "Cancelled.");
      if (this.tone === "wait") return t("bakini.n.ord.waiting", "Waiting for payment.");
      return t("bakini.n.ord.thanks", "Thank you.");
    },
    heroNote() {
      if (this.tone !== "ok") return null;
      const state = this.states[this.stateIndex];
      return state ? this.$t(state.name) : null;
    },
    /** Bank transfers still waiting: their details and the receipt upload. */
    transfers() {
      return (this.basket?.transactions_pending || []).filter((t) => t.dir && t.status !== "Succeeded");
    },
    placedAt() {
      const at = this.basket?.reserved_at || this.basket?.created_at;
      if (!at) return null;
      return new Date(at).toLocaleString(document.documentElement.lang || "en", { day: "numeric", month: "long", year: "numeric" });
    },
    /* The items by seller, as the basket page shows them. */
    groups() {
      const groups = new Map();
      for (const item of this.basket?.items || []) {
        const key = item.vendor_id || 0;
        if (!groups.has(key)) {
          const vendor = this.sellers.get(item.vendor_id);
          groups.set(key, {
            key,
            name: vendor?.name || this.shop?.title || "",
            logo: vendor ? vendorImage(vendor, true) : null,
            items: [],
            units: 0,
            subtotal: 0,
          });
        }
        const group = groups.get(key);
        group.items.push(item);
        group.units += item.count || 0;
        group.subtotal += (item.price || 0) * (item.count || 0) - (item.offer_amount || 0);
      }
      return [...groups.values()];
    },
  },
  created() {
    loadNoir();
    vendors().then((list) => {
      this.sellers = new Map(list.map((vendor) => [vendor.id, vendor]));
    });
  },
  methods: {
    t,
    hueOf,
    amount(n) {
      return money(Number(n) || 0, this.currency);
    },
    image(item) {
      if (item.variant?.image) return window.CDN.GET_SHOP_IMAGE_PATH(item.variant.image, 128);
      return productImage(item.product, true);
    },
    size(item) {
      return sizeOf(item.variant);
    },
    productRoute(id) {
      return { name: window.$storefront.routes.PRODUCT_PAGE, params: { product_id: id } };
    },

    downloadInvoice() {
      this.busy_invoice = true;

      axios
        .get(
          window.XAPI.GET_ORDER_BASKET_RECEIPT(
            this.shop.name,
            this.basket.id,
          ),
          {
            params: {
              code: this.basket.code || undefined,
              signature: this.$route.query.signature,
              timestamp: this.$route.query.timestamp,
            },
            responseType: "blob",
          },
        )
        .then(({ data }) => {
          const download_url = window.URL.createObjectURL(
            new Blob([data], { type: "application/pdf" }),
          );
          const link = document.createElement("a");
          link.href = download_url;
          link.download = `${this.getBasketOrderCode(this.basket)}.pdf`;
          document.body.appendChild(link);
          link.click();
          link.remove();
          window.setTimeout(
            () => window.URL.revokeObjectURL(download_url),
            0,
          );
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy_invoice = false;
        });
    },
  },
};
</script>

<style lang="scss" scoped></style>
