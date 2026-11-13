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
  Kalio — an order's page: a light page with the way back to the orders,
  then the order itself (the router's child; a physical order draws its
  own steps, KalioOrder in physical/dashbaord). Other kinds of order keep
  Selldone's steps above theirs. Fetching the order is Selldone's, below.
-->
<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
  <div class="k-order nx nx-orderpage">
    <div class="wrap">
      <nav :aria-label="t('bakini.n.ord.crumbs', 'Breadcrumb')" class="crumbs nx-ord-crumbs">
        <router-link
          :to="
            buildReturnRoute(
              $route.query.return_id
                ? window.$storefront.routes.USER_RETURN_REQUESTS
                : history_list_page_name,
            )
          "
          >{{ $route.query.return_id ? t("bakini.n.ord.returns", "Your returns") : t("bakini.n.ord.yourOrders", "Your orders") }}</router-link
        ><nx-icon name="right" /><span aria-current="page">{{ t("bakini.n.ord.orderWord", "Order") }}</span>
      </nav>

      <s-order-delivery-status-stepper
        v-if="orders_states && basket && !isPhysical"
        :has-subscription="isSubscription"
        :is-subscribed="isSubscription && basket.status === 'Payed'"
        :state="basket.delivery_state"
        :states="orders_states"
        class="k-order__stepper"
      />

      <!-- Kalio (5 November 2026): an order that cannot be opened says why
           and where to go, where Selldone kept the loading dots and a
           "Basket not found" toast. -->
      <div v-if="!basket && failed" class="empty nx-ord-missing">
        <span class="ec"><nx-icon :name="USER() ? 'doc' : 'lock'" /></span>
        <h3>{{ t("order.missing.title", "We can’t open this order") }}</h3>
        <p v-if="USER()">{{ t("order.missing.user", "It isn’t in your account. The link may be wrong, or the order belongs to someone else.") }}</p>
        <p v-else>{{ t("order.missing.guest", "If you placed it, sign in to see it, or open the link in your order email on the device you ordered from.") }}</p>
        <div class="acts">
          <button v-if="!USER()" class="btn" type="button" @click="signIn">{{ t("common.signIn", "Sign in") }}</button>
          <router-link :to="buildReturnRoute(history_list_page_name)" :class="USER() ? 'btn' : 'btn ghost'">{{ t("account.yourOrders", "Your orders") }}</router-link>
        </div>
      </div>
      <div v-else-if="!basket" class="k-order__loading">
        <u-loading-ellipsis css-mode></u-loading-ellipsis>
      </div>
      <router-view
        v-else
        :basket="basket"
        @request:refresh="fetchOrderInfo()"
      />
    </div>
  </div>
</template>

<script lang="ts">
import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

import { GtagEcommerce } from "@selldone/components-vue/plugins/gtag/GtagEcommerce";
import { ProductType } from "@selldone/core-js/enums/product/ProductType";
import SOrderDeliveryStatusStepper from "@selldone/components-vue/storefront/order/shipping/stepper/SOrderDeliveryStatusStepper.vue";
import { StorefrontLocalStorages } from "@selldone/core-js/helper/local-storage/StorefrontLocalStorages";
import { RouteMixin } from "@selldone/components-vue/mixin/route/RouteMixin.ts";
import { Basket } from "@selldone/core-js";
import ULoadingEllipsis from "@selldone/components-vue/ui/loading/ellipsis/ULoadingEllipsis.vue";
import TemplateMixin from "@selldone/components-vue/mixin/template/TemplateMixin.ts";
import {EventBus} from "@selldone/components-vue/utils/events/EventBus.ts";
import { t } from "../../../components/kalio/i18n/kalio-i18n";
import NxIcon from "../../../components/bakini/noir/NxIcon.vue";

export default {
  name: "StorefrontPageBasketOrder",
  mixins: [RouteMixin, TemplateMixin],

  components: { ULoadingEllipsis, SOrderDeliveryStatusStepper, NxIcon },
  inject: ["$shop"],
  props: {},

  data: function () {
    return {
      basket: null,

      busy: false,
      failed: false, // Kalio: the order could not be read
    };
  },

  computed: {
    isSubscription() {
      return this.basket && this.basket.type === ProductType.SUBSCRIPTION.code;
    },
    isPhysical() {
      return this.basket && this.basket.type === ProductType.PHYSICAL.code;
    },

    type() {
      if (!this.basket) return null;
      return Object.values(ProductType).find(
        (item) => item.code === this.basket.type,
      );
    },
    history_list_page_name() {
      if (!this.type) return null;

      let page_name = window.$storefront.routes.HISTORY_ORDERS_PHYSICAL;
      if (this.type.code === ProductType.PHYSICAL.code) {
        page_name = window.$storefront.routes.HISTORY_ORDERS_PHYSICAL;
      } else if (this.type.code === ProductType.VIRTUAL.code) {
        page_name = window.$storefront.routes.HISTORY_ORDERS_VIRTUAL;
      } else if (this.type.code === ProductType.FILE.code) {
        page_name = window.$storefront.routes.HISTORY_ORDERS_FILE;
      } else if (this.type.code === ProductType.SERVICE.code) {
        page_name = window.$storefront.routes.HISTORY_ORDERS_SERVICE;
      } else if (this.type.code === ProductType.SUBSCRIPTION.code) {
        page_name = window.$storefront.routes.HISTORY_ORDERS_SUBSCRIPTION;
      }
      return page_name;
    },

    orders_states() {
      if (!this.type) return null;

      if (this.type.code === ProductType.PHYSICAL.code) {
        return Basket.PhysicalOrderStates;
      } else if (this.type.code === ProductType.VIRTUAL.code) {
        return Basket.VirtualOrderStates;
      } else if (this.type.code === ProductType.FILE.code) {
        return Basket.FileOrderStates;
      } else if (this.type.code === ProductType.SERVICE.code) {
        return Basket.ServiceOrderStates;
      } else if (this.type.code === ProductType.SUBSCRIPTION.code) {
        return Basket.SubscriptionOrderStates;
      }
      return null;
    },
  },

  watch: {
    type() {
      this.titleOrder();
    },
    basket() {
      this.titleOrder();
    },
    "$route.params.basket_id"() {
      this.basket = null; // Force re-render page!
      this.fetchOrderInfo();
    },
    // Kalio: signed in from the "can't open" message (or known only now
    // after a reload): try the order again.
    "$store.getters.getUser"(user) {
      if (user && this.failed) this.fetchOrderInfo();
    },
    "$store.getters.getBusyUser"(busy) {
      if (!busy && !this.basket && !this.busy) this.fetchOrderInfo();
    },
  },

  created() {
    // Kalio: after a reload the shopper is read first; asking for the order
    // before that reads it as a guest and fails (see the watch above).
    if (!this.$store.getters.getBusyUser) this.fetchOrderInfo();
  },
  mounted() {
    EventBus.$on("on-payment-completed", ({ order_type, order_id }) => {
      console.log("on-payment-completed", order_type, order_id);
      if (this.basket && this.basket.id === order_id) this.fetchOrderInfo();
    });
  },
  beforeUnmount() {
    EventBus.$off("on-payment-completed");
  },

  methods: {
    /* The tab says the number the page says: the shop's own order label
       ("SM-39") once the order is read, not the basket id ("SM-30072") the
       address carries (Bakio's test order, 13 November 2026; Molino's SM-355). */
    titleOrder() {
      if (!this.type || !this.basket) return;
      const code = this.getBasketOrderCode({ ...this.basket, type: this.basket.type || this.type.code });
      this.setPageTitle(t("order.pageTitle", "Order {code}", { code })); // Set Page Title!
    },

    /** Kalio: sign in from the "can't open" message; the order is read
     *  again once the shopper is known (watch USER). */
    signIn() {
      EventBus.$emit("need-login", true);
    },
    fetchOrderInfo() {
      this.busy = true;
      this.failed = false;
      const basket_id = this.$route.params.basket_id;
      const signature = this.$route.query.signature;
      const guest_code = !this.USER()
        ? StorefrontLocalStorages.GetShopHistoryGuestCodeOfOrder(basket_id)
        : undefined;
      axios
        .get(
          window.XAPI.GET_ORDER_BASKET_INFO(this.$shop.name, basket_id),
          {
            params: {
              code: guest_code /*🥶 Guest*/,
              /**
                   This property holds the signature from the URL query parameters.
                   The signature is a cryptographic hash that ensures the integrity and authenticity
                   of the URL, preventing tampering. It's typically generated by shop staff when creating
                   secure, time-limited URLs to display order details.
                   */

              signature: signature,
              /**
                   This property holds the timestamp from the URL query parameters.
                   The timestamp indicates when the URL was created and is used to ensure the URL's validity
                   within a specific time frame. Like the signature, this is also generated by shop staff
                   when creating secure URLs to display order details.
                   */
              timestamp: this.$route.query.timestamp,
            },
          },
        )
        .then(({ data }) => {
          if (!data.error) {
            this.basket = data.basket;

            // Keep this order's guest access for downloads after the active basket code rotates.
            if (guest_code && !signature)
              this.basket.code ??= guest_code;

            if (this.basket.status === Basket.Status.Payed.code || this.basket.status === Basket.Status.COD.code)
              GtagEcommerce.MeasuringPurchasesBasket(this.basket);
          } else {
            this.failed = true; // Kalio: said on the page, not in a toast
          }
        })
        .catch((error) => {
          this.failed = true;
          if (error?.response?.status && ![401, 403, 404].includes(error.response.status)) NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy = false;
        });
    },
  },
};
</script>

<style lang="scss" scoped></style>
