<!--
  - Copyright (c) 2024. Selldone® Business OS™
  -
  - Author: M.Pajuhaan
  - Web: https://selldone.com
  -->
<template>
  <!-- Bakini 404: a white card with a big violet "404", a search and quick
       ways out (the picture slot notfound.webp beside it); then every
       category as a round tile in two even rows (an "All products" tile
       evens them out) and today's deals. Inside the Layout, with the header. -->
  <div class="bk-404 bk-wrap">
    <section class="bk-404__card">
      <div class="bk-404__txt">
        <p aria-hidden="true" class="bk-404__big">404</p>
        <h1>{{ t("bakini.nf.h", "We can’t find that page") }}</h1>
        <p class="bk-404__p">{{ t("bakini.nf.p", "The link may be old, or the page has moved. Try a search, or start from a category.") }}</p>
        <form class="bk-search" role="search" @submit.prevent="go">
          <input
            :aria-label="t('bakini.header.searchLabel', 'Search products or brands')"
            :placeholder="t('bakini.nf.ph', 'What can we help you find?')"
            :value="q"
            enterkeyhint="search"
            type="search"
            @input="q = $event.target.value"
          />
          <button :aria-label="t('bakini.header.search', 'Search')" class="bk-search__go" type="submit"><span class="ms">search</span></button>
        </form>
        <div class="bk-404__links">
          <span>{{ t("bakini.nf.or", "Or go to") }}</span>
          <router-link :to="deals" class="bk-chip">{{ t("bakini.header.allDeals", "All deals") }}</router-link>
          <router-link :to="newest" class="bk-chip">{{ t("bakini.header.newIn", "New in") }}</router-link>
          <router-link :to="{ name: r.HISTORY_ORDERS_PHYSICAL }" class="bk-chip">{{ t("bakini.header.track", "Track my order") }}</router-link>
          <router-link :to="help" class="bk-chip">{{ t("bakini.header.helpSupport", "Help & Support") }}</router-link>
        </div>
      </div>
      <bakini-slot class="bk-404__img" place="notfound" />
    </section>

    <section v-if="cats.length" class="bk-sec">
      <h2 class="bk-title">{{ t("bakini.nf.cats", "Shop by category") }}</h2>
      <div :style="{ '--cols': tiles.cols }" class="bk-404__cats">
        <router-link v-for="c in tiles.cats" :key="c.id" :to="catTo(c)" class="bk-round-tile">
          <span class="bk-round-tile__disc"><img v-if="c.icon" :src="icon(c)" alt="" loading="lazy" /><span v-else class="ms">category</span></span>
          <span class="bk-round-tile__t">{{ c.title || c.name }}</span>
        </router-link>
        <router-link v-if="tiles.all" :to="catalogue" class="bk-round-tile -all">
          <span class="bk-round-tile__disc"><span class="ms">grid_view</span></span>
          <span class="bk-round-tile__t">{{ t("bakini.header.allProducts", "All products") }}</span>
        </router-link>
      </div>
    </section>

    <bakini-row :filter="{ only_has_discount: true }" :limit="12" :more-label="t('bakini.home.seeAllDeals', 'See all deals')" :more-to="deals" :title="t('bakini.nf.deals', 'Today’s deals')" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import BakiniRow from "../../../components/bakini/BakiniRow.vue";
import BakiniSlot from "../../../components/bakini/BakiniSlot.vue";
import { aisleRoute, aisles, catalogueRoute, dealsRoute } from "../../../components/kalio/kalio-catalog";
import { catTiles } from "../../../components/bakini/bakini";
import { t } from "../../../components/kalio/i18n/kalio-i18n";

export default defineComponent({
  name: "StorefrontPageError404",
  components: { BakiniRow, BakiniSlot },
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
