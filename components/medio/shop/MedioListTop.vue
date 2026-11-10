<!--
  Medio — the top of a results page, after a big catalogue store's: the
  crumbs, a small "Results for ‘…’ in…" line on a search, then the big
  title (the category, the search, Today's deals, a brand or All
  products) with the category's one-line description. On a search across
  the shop, the categories it was found in follow as chips. Today's deals
  says until when the deal prices hold (the deals' own end date). No
  product counts in the words (the filter row carries the result count).
-->
<template>
  <div class="md-ltop">
    <nav aria-label="Breadcrumb" class="md-crumbs">
      <router-link :to="{ path: '/' }">Home</router-link>
      <span aria-hidden="true" class="ms">chevron_right</span>
      <span aria-current="page">{{ crumb }}</span>
    </nav>

    <p v-if="search" class="md-ltop__for">Results for ‘{{ search }}’ in…</p>
    <h1 class="md-ltop__t">{{ heading }}</h1>
    <p v-if="mode === 'aisle' && aisle && aisle.description" class="md-ltop__d">{{ aisle.description }}</p>
    <p v-else-if="deals_page && dealsUntil" class="md-ltop__d"><span class="ms">verified</span>Deal prices locked until {{ dealsUntil }}</p>

    <div v-if="mode !== 'aisle' && hits.length > 1" class="md-inaisles">
      <span>Found in</span>
      <router-link v-for="h in hits" :key="h.aisle.id" :to="h.to" class="md-chip">{{ h.aisle.title || h.aisle.name }}</router-link>
    </div>
  </div>
</template>

<script>
import { catalogue, dealsEndDate, shortDate } from "../medio";
import { aisleIndex } from "../../kalio/kalio-catalog";

export default {
  name: "MedioListTop",
  inject: ["$shop"],

  props: {
    mode: { type: String, default: "aisle" },
    aisle: { type: Object, default: null },
    categoryName: { type: String, default: null },
    filter: { type: Object, default: null },
    products: { type: Array, default: () => [] },
  },

  data: () => ({ index: null, all: [] }),

  computed: {
    search() {
      return String(this.$route.query.search || "").trim();
    },
    deals() {
      return !!this.filter?.only_has_discount;
    },
    deals_page() {
      return this.deals && !this.search && this.mode !== "aisle";
    },
    dealsUntil() {
      return shortDate(dealsEndDate(this.$shop, this.all));
    },
    aisleName() {
      return this.aisle ? this.aisle.title || this.aisle.name : this.categoryName;
    },
    heading() {
      if (this.mode === "aisle") return this.aisleName;
      if (this.search) return "All categories";
      if (this.deals) return "Today’s deals";
      /* A brand's page (the home's brand cards). */
      if (this.filter?.brands?.length === 1) return this.filter.brands[0];
      return "All products";
    },
    crumb() {
      if (this.mode === "aisle") return this.aisleName;
      return this.search ? "Search" : this.heading;
    },
    /* A search across the shop: the categories its results are in. */
    hits() {
      if (!this.index || !this.products.length || !this.search) return [];
      const by = new Map();
      for (const p of this.products) {
        const aisle = this.index.get(p.category_id);
        if (!aisle) continue;
        if (!by.has(aisle.id)) by.set(aisle.id, { aisle, n: 0 });
        by.get(aisle.id).n++;
      }
      return [...by.values()]
        .sort((a, b) => b.n - a.n)
        .slice(0, 8)
        .map((h) => ({
          aisle: h.aisle,
          to: { name: window.$storefront.routes.SHOP_CATEGORY_PAGE, params: { category_name: h.aisle.name }, query: { search: this.search } },
        }));
    },
  },

  mounted() {
    aisleIndex().then((index) => (this.index = index));
    catalogue().then((list) => (this.all = list));
  },
};
</script>
