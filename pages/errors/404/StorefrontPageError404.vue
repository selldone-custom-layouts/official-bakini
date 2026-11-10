<!--
  - Copyright (c) 2024. Selldone® Business OS™
  -
  - Author: M.Pajuhaan
  - Web: https://selldone.com
  -->
<template>
  <!-- Medio 404: a white card with a big violet "404", a search and quick
       ways out (the picture slot notfound.webp beside it); then every
       category as a round tile in two even rows (an "All products" tile
       evens them out) and today's deals. Inside the Layout, with the header. -->
  <div class="md-404 md-wrap">
    <section class="md-404__card">
      <div class="md-404__txt">
        <p aria-hidden="true" class="md-404__big">404</p>
        <h1>{{ t("medio.nf.h", "We can’t find that page") }}</h1>
        <p class="md-404__p">{{ t("medio.nf.p", "The link may be old, or the page has moved. Try a search, or start from a category.") }}</p>
        <form class="md-search" role="search" @submit.prevent="go">
          <input
            :aria-label="t('medio.header.searchLabel', 'Search products or brands')"
            :placeholder="t('medio.nf.ph', 'What can we help you find?')"
            :value="q"
            enterkeyhint="search"
            type="search"
            @input="q = $event.target.value"
          />
          <button :aria-label="t('medio.header.search', 'Search')" class="md-search__go" type="submit"><span class="ms">search</span></button>
        </form>
        <div class="md-404__links">
          <span>{{ t("medio.nf.or", "Or go to") }}</span>
          <router-link :to="deals" class="md-chip">{{ t("medio.header.allDeals", "All deals") }}</router-link>
          <router-link :to="newest" class="md-chip">{{ t("medio.header.newIn", "New in") }}</router-link>
          <router-link :to="{ name: r.HISTORY_ORDERS_PHYSICAL }" class="md-chip">{{ t("medio.header.track", "Track my order") }}</router-link>
          <router-link :to="help" class="md-chip">{{ t("medio.header.helpSupport", "Help & Support") }}</router-link>
        </div>
      </div>
      <medio-slot class="md-404__img" place="notfound" />
    </section>

    <section v-if="cats.length" class="md-sec">
      <h2 class="md-title">{{ t("medio.nf.cats", "Shop by category") }}</h2>
      <div :style="{ '--cols': tiles.cols }" class="md-404__cats">
        <router-link v-for="c in tiles.cats" :key="c.id" :to="catTo(c)" class="md-round-tile">
          <span class="md-round-tile__disc"><img v-if="c.icon" :src="icon(c)" alt="" loading="lazy" /><span v-else class="ms">category</span></span>
          <span class="md-round-tile__t">{{ c.title || c.name }}</span>
        </router-link>
        <router-link v-if="tiles.all" :to="catalogue" class="md-round-tile -all">
          <span class="md-round-tile__disc"><span class="ms">grid_view</span></span>
          <span class="md-round-tile__t">{{ t("medio.header.allProducts", "All products") }}</span>
        </router-link>
      </div>
    </section>

    <medio-row :filter="{ only_has_discount: true }" :limit="12" :more-label="t('medio.home.seeAllDeals', 'See all deals')" :more-to="deals" :title="t('medio.nf.deals', 'Today’s deals')" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import MedioRow from "../../../components/medio/MedioRow.vue";
import MedioSlot from "../../../components/medio/MedioSlot.vue";
import { aisleRoute, aisles, catalogueRoute, dealsRoute } from "../../../components/kalio/kalio-catalog";
import { catTiles } from "../../../components/medio/medio";
import { t } from "../../../components/kalio/i18n/kalio-i18n";

export default defineComponent({
  name: "StorefrontPageError404",
  components: { MedioRow, MedioSlot },
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
    help(): any {
      return this.$router.hasRoute("ShopFAQ") ? { name: "ShopFAQ" } : { name: this.r.SHOP_CONTACT_US };
    },
    /* Two even rows (the owner's rule): an odd count gets an "All" tile. */
    tiles(): any {
      return catTiles(this.cats);
    },
  },
  mounted() {
    aisles().then((list) => (this.cats = list));
  },
  methods: {
    t,
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
