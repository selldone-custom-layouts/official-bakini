<!--
  - Copyright (c) 2024. Selldone® Business OS™
  -
  - Author: M.Pajuhaan
  - Web: https://selldone.com
  -->
<template>
  <!-- Medio 404: a friendly panel with a large 404 (the 0 in the brand
       colour), a search, quick ways out; then every category as a tile
       (the home's tiles) and today's deals. -->
  <div class="md-404">
    <section class="md-404__panel md-wrap">
      <div class="md-404__in">
        <span aria-hidden="true" class="md-404__big">4<em>0</em>4</span>
        <div class="md-404__txt">
          <h1>We can't find that page</h1>
          <p>The link may be old, or the page has moved. Try a search or start from a department.</p>
          <form class="md-search -big" role="search" @submit.prevent="go">
            <span aria-hidden="true" class="ms md-search__ic">search</span>
            <input v-model="q" aria-label="Search" enterkeyhint="search" placeholder="What can we help you find?" type="search" />
            <button aria-label="Search" class="md-search__go" type="submit"><span class="ms">search</span></button>
          </form>
          <div class="md-404__links">
            <span>Or go to</span>
            <router-link :to="deals" class="md-chip">Today's deals</router-link>
            <router-link :to="newest" class="md-chip">New arrivals</router-link>
            <router-link :to="{ name: r.HISTORY_ORDERS_PHYSICAL }" class="md-chip">Track an order</router-link>
            <router-link :to="{ name: r.SHOP_CONTACT_US }" class="md-chip">Help</router-link>
          </div>
        </div>
      </div>
    </section>

    <section v-if="cats.length" class="md-sec md-wrap">
      <header class="md-head">
        <h2>Shop by category</h2>
        <router-link :to="catalogue" class="md-more">All products<span class="ms">chevron_right</span></router-link>
      </header>
      <div class="md-404__cats">
        <router-link v-for="c in cats.slice(0, 15)" :key="c.id" :to="catTo(c)" class="md-cat">
          <span class="md-cat__tile"><img v-if="c.icon" :src="icon(c)" alt="" loading="lazy" /><span v-else class="ms">category</span></span>
          <span class="md-cat__t">{{ c.title || c.name }}</span>
        </router-link>
        <!-- Full rows only (the owner's rule): an "All products" tile evens them out. -->
        <router-link v-if="cats.length % 2 === 1 || cats.length > 15" :to="catalogue" class="md-cat -all">
          <span class="md-cat__tile"><span class="ms">grid_view</span></span>
          <span class="md-cat__t">All products</span>
        </router-link>
      </div>
    </section>

    <medio-row :filter="{ only_has_discount: true }" :limit="12" :more-to="deals" class="md-wrap" more-label="See all deals" title="Today's deals" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import MedioRow from "../../../components/medio/MedioRow.vue";
import { aisleRoute, aisles, catalogueRoute, dealsRoute } from "../../../components/kalio/kalio-catalog";

export default defineComponent({
  name: "StorefrontPageError404",
  components: { MedioRow },
  data: () => ({ q: "", cats: [] as any[] }),
  computed: {
    r(): any {
      return (window as any).$storefront.routes;
    },
    deals() {
      return dealsRoute();
    },
    newest() {
      return catalogueRoute({ sort: "newest" });
    },
    catalogue() {
      return catalogueRoute();
    },
  },
  mounted() {
    aisles().then((list) => (this.cats = list));
  },
  methods: {
    catTo(c: any) {
      return aisleRoute(c);
    },
    icon(c: any) {
      return (window as any).CDN.GET_CATEGORY_ICON(c.id, 256);
    },
    go() {
      const text = this.q.trim();
      this.$router.push(text ? { name: this.r.SHOP_PAGE, query: { search: text } } : catalogueRoute());
    },
  },
});
</script>
