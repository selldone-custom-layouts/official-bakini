<!--
  - Copyright (c) 2023. Selldone® Business OS™
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

<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
  <!--
    Medio — the product page (digini-design/medio-product.html), after a big
    electronics retailer's: the breadcrumb of the category; the overview
    (MedioProductOverview: the name, the gallery and key specs on the left,
    the sticky buy card on the right); "Buy together and save"; four
    accordions (Product information, Specifications, Reviews, Delivery &
    returns); then "We recommend" and "More like this" rails.
  -->
  <div class="s--product k-product md-product">
    <div style="order: 0">
      <div class="s--product-section-info md-wrap">
        <slot name="header" :center="true"></slot>
        <nav :aria-label="t('medio.crumbs', 'Breadcrumb')" class="md-crumbs">
          <router-link :to="{ path: '/' }">{{ t("medio.home", "Home") }}</router-link>
          <template v-if="product && product.category">
            <span aria-hidden="true" class="ms md-chev">chevron_right</span>
            <router-link :to="{ name: window.$storefront.routes.SHOP_CATEGORY_PAGE, params: { category_name: product.category.name } }">{{
              product.category.title || product.category.name
            }}</router-link>
          </template>
          <template v-if="product">
            <span aria-hidden="true" class="ms md-chev">chevron_right</span>
            <span aria-current="page" class="md-crumbs__here">{{ product.title }}</span>
          </template>
          <span class="md-crumbs__tools">
            <s-product-admin-button v-if="$vuetify.display.mdAndUp"></s-product-admin-button>
          </span>
        </nav>
        <medio-product-overview v-if="product" :related="related || []" can-buy show-cover @open="openPanel" />
        <s-product-overview-loading v-else />
        <u-loading-progress v-if="busy"></u-loading-progress>
      </div>
    </div>

    <template v-if="product">
      <div class="md-wrap" style="order: 1">
        <medio-together :product="product" />

        <!-- ▆▆▆▆ Accordions ▆▆▆▆ -->
        <div class="md-acc">
          <section v-for="sec in panels" :id="'md-' + sec.key" :key="sec.key" :class="{ '-open': open[sec.key] }" class="md-acc__sec">
            <h2 class="md-acc__h">
              <button :aria-controls="'md-acc-' + sec.key" :aria-expanded="open[sec.key] ? 'true' : 'false'" type="button" @click="toggle(sec.key)">
                {{ sec.title }}<span aria-hidden="true" class="ms">{{ open[sec.key] ? "expand_less" : "expand_more" }}</span>
              </button>
            </h2>
            <div v-show="open[sec.key]" :id="'md-acc-' + sec.key" class="md-acc__b">
              <!-- Product information -->
              <template v-if="sec.key === 'info'">
                <p class="md-acc__code">{{ t("medio.pdp.code", "Product code {code}", { code: String(product.sku || product.id) }) }}</p>
                <ul v-if="features.length" class="md-acc__bullets">
                  <li v-for="f in features" :key="f.key"><b>{{ f.key }}:</b> {{ f.value }}</li>
                </ul>
                <s-product-article v-if="article" class="k-prose" hide-title></s-product-article>
                <p v-else-if="aboutLine" class="md-acc__p">{{ aboutLine }}</p>
              </template>
              <!-- Specifications, in the shop's own groups -->
              <template v-else-if="sec.key === 'specs'">
                <table v-for="g in spec_groups" :key="g.title" class="md-spec">
                  <caption v-if="spec_groups.length > 1 || g.title">{{ g.title }}</caption>
                  <tbody>
                    <tr v-for="r in g.rows" :key="r.key">
                      <th scope="row">{{ r.key }}</th>
                      <td>{{ r.value }}</td>
                    </tr>
                  </tbody>
                </table>
              </template>
              <!-- Reviews -->
              <div v-else-if="sec.key === 'reviews'" class="k-reviews md-reviews">
                <kalio-reviews></kalio-reviews>
              </div>
              <!-- Delivery and returns -->
              <template v-else-if="sec.key === 'delivery'">
                <ul v-if="ways.length" class="md-acc__ways">
                  <li v-for="w in ways" :key="w.key">
                    <span class="ms">{{ w.icon === "storefront" ? "storefront" : "local_shipping" }}</span>
                    <span>
                      <b>{{ w.word }}</b> · {{ w.line }}.
                      <template v-if="w.free"> {{ t("medio.pdp.free", "Free") }}.</template>
                      <template v-else-if="w.freeOver">
                        {{ t("medio.pdp.freeOverShort", "Free on orders over {amount}", { amount: moneyFrom(w.freeOver, w.currency, { short: "auto" }) }) }}.</template
                      >
                    </span>
                  </li>
                </ul>
                <p v-else class="md-acc__p">{{ t("medio.pdp.deliveryAtCheckout", "Delivery options and prices are shown at checkout") }}</p>
                <s-product-shipping class="md-block"></s-product-shipping>
                <s-product-warranty class="md-block"></s-product-warranty>
                <s-product-guide class="md-block"></s-product-guide>
                <router-link :to="{ name: window.$storefront.routes.SHOP_PROFILE_PAGE_TERMS }" class="md-link"
                  >{{ t("medio.pdp.returnsTerms", "Returns and terms") }}<span class="ms md-chev">chevron_right</span></router-link
                >
              </template>
            </div>
          </section>
        </div>
      </div>

      <div :style="{ order: getOrder('offer') }">
        <s-product-offers class="s--product-section md-wrap md-block"></s-product-offers>
      </div>
      <div :style="{ order: getOrder('includes') }">
        <s-product-includes class="md-wrap md-block"></s-product-includes>
      </div>
      <div :style="{ order: getOrder('files') }">
        <s-product-files-list class="md-wrap md-block"></s-product-files-list>
      </div>
      <div :style="{ order: getOrder('contents') }">
        <s-product-subscription-membership class="md-wrap md-block"></s-product-subscription-membership>
      </div>
      <div :style="{ order: getOrder('page') }">
        <s-product-landing></s-product-landing>
      </div>
      <!-- We recommend (related, from other departments) and More like this (same category) -->
      <div :style="{ order: getOrder('related-products') }">
        <div id="md-related">
          <medio-rail v-if="related === null || related.length" :products="related" :title="t('medio.pdp.recommend', 'We recommend')" class="md-wrap" @quick-buy="quickBuy" />
        </div>
        <medio-row
          v-if="product.category"
          :key="'cat-' + product.category.id"
          :dir="product.category.name"
          :exclude="product.id"
          :more-to="{ name: window.$storefront.routes.SHOP_CATEGORY_PAGE, params: { category_name: product.category.name } }"
          :title="t('medio.pdp.moreLike', 'More like this')"
          class="md-wrap"
          lazy
          sort="bestselling"
        />
      </div>
    </template>

    <kalio-quick-buy v-model="sheet" :product="picked" />
  </div>
</template>

<script lang="ts">
import { money as moneyFrom } from "../../components/region-switcher/region";
import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

import MedioProductOverview from "../../components/medio/product/MedioProductOverview.vue";
import MedioRail from "../../components/medio/MedioRail.vue";
import KalioQuickBuy from "../../components/kalio/KalioQuickBuy.vue";
import { specGroups, specRows } from "../../components/medio/product/medio-spec";
import { catalogue, mixByCategory, rememberViewed, tagged } from "../../components/medio/medio";
import MedioRow from "../../components/medio/MedioRow.vue";
import MedioTogether from "../../components/medio/product/MedioTogether.vue";
import { t } from "../../components/kalio/i18n/kalio-i18n";
import { waysOf } from "../../components/walio/walio-home";
import { EventBus } from "@selldone/components-vue/utils/events/EventBus.ts";
import SProductOverviewLoading from "@selldone/components-vue/storefront/product/overview/loading/SProductOverviewLoading.vue";

import { GtagEcommerce } from "@selldone/components-vue/plugins/gtag/GtagEcommerce";

import SProductIncludes from "@selldone/components-vue/storefront/product/includes/SProductIncludes.vue";
import SProductShipping from "@selldone/components-vue/storefront/product/shipping/SProductShipping.vue";
import SProductWarranty from "@selldone/components-vue/storefront/product/warranty/SProductWarranty.vue";
import SProductGuide from "@selldone/components-vue/storefront/product/guide/SProductGuide.vue";
import SProductFilesList from "@selldone/components-vue/storefront/product/file/list/SProductFilesList.vue";
import KalioReviews from "../../components/kalio/product/KalioReviews.vue";
import SProductSubscriptionMembership from "@selldone/components-vue/storefront/product/subscription/membership/SProductSubscriptionMembership.vue";
import SProductOffers from "@selldone/components-vue/storefront/product/offers/SProductOffers.vue";
import SProductCrossSells from "@selldone/components-vue/storefront/product/cross-sells/SProductCrossSells.vue";
import ProductSection from "@selldone/core-js/enums/product/ProductSection";
import { Article } from "@selldone/core-js";
import { computed } from "vue";
import SProductAdminButton from "@selldone/components-vue/storefront/product/admin/button/SProductAdminButton.vue";
import SProductQr from "@selldone/components-vue/storefront/product/qr/SProductQr.vue";
import SProductSpec from "@selldone/components-vue/storefront/product/spec/SProductSpec.vue";
import SProductArticle from "@selldone/components-vue/storefront/product/article/SProductArticle.vue";
import { XapiProductGetTypes } from "@selldone/sdk-storefront/product";
import SProductLanding from "@selldone/components-vue/storefront/product/landing/SProductLanding.vue";
import CurrencyMixin from "@selldone/components-vue/mixin/currency/CurrencyMixin.ts";
import {StorefrontSeo} from "../../helpers/StorefrontSeo";

export default {
  name: "StorefrontPageProduct",
  mixins: [CurrencyMixin],

  inject: ["$shop"],
  props: {},
  components: {
    SProductLanding,
    SProductArticle,
    SProductSpec,
    SProductQr,
    SProductAdminButton,
    SProductCrossSells,
    SProductOffers,
    SProductSubscriptionMembership,
    KalioReviews,
    SProductFilesList,
    SProductGuide,
    SProductWarranty,
    SProductShipping,
    SProductIncludes,

    SProductOverviewLoading,
    MedioProductOverview,
    MedioRail,
    MedioRow,
    MedioTogether,
    KalioQuickBuy,

  },

  /**
   * ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
   *  🔷 Provide
   * ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
   */
  provide() {
    return {
      $product: computed(() => this.product),

      /**
       * Current selected variant by user
       */
      $variant: computed(() => this.current_variant),
    };
  },
  /**
   * ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
   *  🔷 Data
   * ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
   */
  data: function () {
    return {
      show_article: true, // For refresh article!
      tab: "details",

      product: null,

      busy: false,

      article_type: Article.Types.Product,
      related: null,
      open: { info: true, specs: false, reviews: false, delivery: false },
      sheet: false,
      picked: null,
    };
  },

  computed: {
    theme() {
      return this.$shop.theme && !Array.isArray(this.$shop.theme)
        ? this.$shop.theme
        : {};
    },

    current_variant() {
      return this.$store.getters.getCurrentSelectedVariant;
    },

    article() {
      return (
        this.product &&
        this.product.article_pack &&
        this.product.article_pack.article &&
        this.product.article_pack.article
      );
    },

    // ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃ Admin URLs: ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃

    /* The product's pros and cons, as label → note pairs, for Highlights. */
    pros_list() {
      return this.toPairs(this.product?.pros);
    },
    cons_list() {
      return this.toPairs(this.product?.cons);
    },
    ways() {
      return waysOf(this.$shop);
    },
    panels() {
      const out = [{ key: "info", title: t("medio.pdp.info", "Product information") }];
      if (this.spec_groups.length) out.push({ key: "specs", title: t("medio.pdp.specs", "Specifications") });
      out.push({ key: "reviews", title: t("medio.pdp.reviews", "Reviews") });
      out.push({ key: "delivery", title: t("medio.pdp.deliveryReturns", "Delivery & returns") });
      return out;
    },
    tabs() {
      return [
        { key: "details", label: "Details" },
        { key: "spec", label: "Specifications" },
        { key: "ship", label: "Shipping & returns" },
      ];
    },
    /* Highlights: the merchant's pros, else the spec's first group. */
    highlight_rows() {
      if (this.pros_list.length) return this.pros_list.slice(0, 6);
      const spec = this.product?.spec;
      if (!spec || typeof spec !== "object") return [];
      const order = Array.isArray(spec.spec_order) && spec.spec_order.length ? spec.spec_order : Object.keys(spec);
      const out = [];
      let groups = 0;
      for (const key of order) {
        if (key === "spec_order") continue;
        const value = spec[key];
        if (value === "group") {
          if (++groups > 1) break;
          continue;
        }
        if (value === null || value === undefined || value === "") continue;
        out.push({ key, value: Array.isArray(value) ? value.join(", ") : String(value) });
        if (out.length >= 6) break;
      }
      return out;
    },
    /* About this product: the first spec rows as bullets (the shop's own words). */
    features() {
      return this.product ? specRows(this.product).slice(0, 5) : [];
    },
    /* The category's own line when the product has no article. */
    aboutLine() {
      const d = (this.product?.category?.description || '').trim();
      return d;
    },
    spec_groups() {
      return specGroups(this.product);
    },
    /* The groups in two columns of about the same height. */
    spec_cols() {
      const cols = [[], []];
      const size = [0, 0];
      for (const g of this.spec_groups) {
        const i = size[0] <= size[1] ? 0 : 1;
        cols[i].push(g);
        size[i] += g.rows.length + 1;
      }
      return cols.filter((c) => c.length);
    },
    has_pros_cons() {
      return (
        (this.product?.pros && Object.keys(this.product.pros).length > 0) ||
        (this.product?.cons && Object.keys(this.product.cons).length > 0)
      );
    },
  },

  watch: {
    $route() {
      this.getProduct();
      this.$forceUpdate(); // Notice we have to use a $ here
    },
  },
  created() {
    this.getProduct();
  },

  methods: {
    t,
    moneyFrom,
    toggle(key) {
      this.open = { ...this.open, [key]: !this.open[key] };
    },
    /* A row in the buy card opens its accordion and brings it into view. */
    openPanel(key) {
      this.open = { ...this.open, [key]: true };
      this.$nextTick(() => document.getElementById("md-" + key)?.scrollIntoView({ behavior: "smooth", block: "start" }));
    },
    jump(id) {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    },
    quickBuy(p) {
      this.picked = p;
      this.sheet = true;
    },
    /* Related: products from other departments that share a tag with this
       one; else deals from other departments. */
    async readRelated(product) {
      if (this.related_for === product.id) return;
      this.related_for = product.id;
      this.related = null;
      const [all, tags] = await Promise.all([catalogue(), tagged()]);
      if (this.related_for !== product.id) return;
      const rich = new Map(all.map((p) => [p.id, p]));
      const mine = [...tags.entries()].filter(([, list]) => list.some((p) => p.id === product.id)).map(([t]) => t);
      const seen = new Set([product.id]);
      const out = [];
      for (const t of mine)
        for (const p of tags.get(t))
          if (!seen.has(p.id) && p.category_id !== product.category_id && p.quantity > 0) {
            seen.add(p.id);
            out.push(rich.get(p.id) || p);
          }
      if (out.length < 6)
        for (const p of all)
          if (!seen.has(p.id) && p.category_id !== product.category_id && p.quantity > 0 && Number(p.discount) > 0) {
            seen.add(p.id);
            out.push(p);
          }
      this.related = mixByCategory(out, 12);
      this.open = { info: true, specs: false, reviews: false, delivery: false };
    },
    askToSignIn() {
      EventBus.$emit("need-login", true);
    },
    toPairs(value) {
      if (!value || typeof value !== "object") return [];
      return Object.entries(value)
        .filter(([key, note]) => key && note != null)
        .map(([key, note]) => ({ key, value: String(note) }));
    },
    getOrder(code) {
      if (!this.theme?.order || !Array.isArray(this.theme?.order)) {
        this.theme.order = Object.values(ProductSection).map((x) => x.code);
      } else {
        // Add missing sections
        Object.values(ProductSection).forEach((t) => {
          if (!this.theme.order.includes(t)) this.theme.order.push(t);
        });
      }

      return this.theme.order.indexOf(code) + 1;
    },

    getProduct() {
      const seoNavigation = StorefrontSeo.captureNavigation();
      const handleSuccessResponse = ({
        product,
      }: XapiProductGetTypes.IResponse) => {
        this.product = product;
        rememberViewed(product.id);
        this.readRelated(product);

        GtagEcommerce.MeasuringViewsOfProductDetails(
          this.$shop,
          product,
          this.GetUserSelectedCurrency().code,
          "product-page",
        );

        // Reject initial-load and superseded responses, including SDK cache callbacks.
        StorefrontSeo.updateProduct(
          product,
          this.$shop,
          seoNavigation,
          this.GetUserSelectedCurrency().code,
        );
      };

      if (window.PRE_LOADED_DATA?.PRODUCT_PACK) {
        console.log("⚡ Turbo load product.");
        handleSuccessResponse(window.PRE_LOADED_DATA.PRODUCT_PACK);
        window.PRE_LOADED_DATA = null; // Clear!
      } else {
        this.busy = true; // Do not show loading!
      }

      window.$storefront.products
        .optimize(60)
        .get(this.getId(this.$route.params.product_id), {
          "augmented-categories": 3, // Return 3 categories in the parent folder of current category
          "augmented-cross-sells": true, // Return max 3 cross-selling items
        })
        .cache(handleSuccessResponse)
        .then(handleSuccessResponse)
        .catch((e) => {
          NotificationService.showLaravelError(e);
        })
        .finally(() => {
          this.busy = false;
        });
    },
  },
};
</script>

<style lang="scss" scoped></style>
