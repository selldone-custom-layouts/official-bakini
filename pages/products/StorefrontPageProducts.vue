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
<!--
  Bakini Noir — the shop page: the bare page is the home (NxHome); a
  collection, a search, the deals and every pastry are the listing
  (NxListing). The page keeps Selldone's search-engine data for the listing
  (StorefrontSeo) and never starts on Selldone's Insta view.
-->
<template>
  <div class="nx-shop-page">
    <slot name="header" :center="true"></slot>
    <nx-home v-if="show_home" />
    <nx-listing
      v-else
      :key="'ls-' + (category_name || '') + '|' + search_query + '|' + (deals_page ? 1 : 0)"
      :category-name="category_name"
      :deals="deals_page"
      :initial-sort="String($route.query.sort || '')"
      :search="search_query"
      @fetched="updateProductsSeo"
    />
  </div>
</template>

<script lang="ts">
import NxHome from "../../components/bakini/noir/NxHome.vue";
import NxListing from "../../components/bakini/noir/shop/NxListing.vue";
import { StorefrontSeo } from "../../helpers/StorefrontSeo";

/* The query keys that ask for the listing. Anything else in the address
   (utm_*, fbclid, gclid, a cache-buster…) keeps the home. */
const LISTING_KEYS = ["search", "filter", "sort", "dir", "page", "offset", "vendor_id", "tags"];

function filterOf(query: any): any {
  try {
    return query?.filter ? JSON.parse(query.filter) : null;
  } catch {
    return null;
  }
}

export default {
  name: "StorefrontPageProducts",
  components: { NxHome, NxListing },
  inject: ["$shop"],

  data: () => ({
    seoNavigation: StorefrontSeo.captureNavigation(),
  }),

  computed: {
    shop_theme() {
      return this.getShop()?.theme;
    },
    vendor_id() {
      return this.$route.params?.vendor_id || this.$route.query?.vendor_id || null;
    },
    category_name() {
      return this.$route.params?.category_name || null;
    },
    search_query() {
      return String(this.$route.query?.search || "").trim();
    },
    deals_page() {
      return !!filterOf(this.$route.query)?.only_has_discount && !this.search_query && !this.category_name;
    },
    show_home() {
      return (
        String(this.$route.name || "").startsWith(window.$storefront.routes.SHOP_PAGE) &&
        !this.vendor_id &&
        !Object.keys(this.$route.query || {}).some((k) => LISTING_KEYS.includes(k))
      );
    },
  },

  watch: {
    /* Selldone's Insta view (a photo wall without names or buttons) is never the starting view. */
    shop_theme: {
      handler(theme) {
        if (!theme) return;
        for (const device of ["mobile", "tablet", "pc"]) if (theme[device] === "insta") theme[device] = "normal";
      },
      immediate: true,
    },
    "$route.fullPath"() {
      this.seoNavigation = StorefrontSeo.captureNavigation();
    },
  },

  created() {
    this.setPageTitle();
  },

  methods: {
    updateProductsSeo(data) {
      StorefrontSeo.updateProducts(data, this.getShop(), this.seoNavigation);
    },
  },
};
</script>
