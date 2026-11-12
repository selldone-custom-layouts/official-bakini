<!--
  Bakini Noir — page not found (bakio-design/404-b.html, b/pages-shop.js
  N.pages["404"]): inside the Layout, with the header and footer
  (router: BakiniNotFound). "This page is not on the menu." with a search,
  every collection as a chip, the big 404 on a lit plate; then "Something
  good instead": four best sellers from different collections as cards.
-->
<template>
  <div class="nx nx-404">
    <section class="nf">
      <div class="wrap nf-in">
        <div class="nf-copy">
          <p class="eyebrow">{{ t("bakini.n.rd.err", "Error 404") }}</p>
          <h1 class="serif">{{ t("bakini.n.rd.nfH", "This page is") }} <em>{{ t("bakini.n.rd.nfHem", "not on the menu.") }}</em></h1>
          <p class="muted">{{ t("bakini.n.rd.nfP", "The link may be old, or the page has moved. Search the bakery or start from a collection.") }}</p>
          <form class="sr-form nf-form" role="search" @submit.prevent="go">
            <nx-icon name="search" />
            <input
              :aria-label="t('bakini.n.rd.searchBakery', 'Search the bakery')"
              :placeholder="t('bakini.n.rd.searchBakery', 'Search the bakery')"
              :value="q"
              enterkeyhint="search"
              name="q"
              type="search"
              @input="q = $event.target.value"
            />
            <button class="btn" type="submit">{{ t("bakini.n.rd.search", "Search") }}</button>
          </form>
          <div v-if="noir.cats.length" :aria-label="t('bakini.n.rd.collections', 'Collections')" class="es-chips nf-chips">
            <router-link v-for="c in noir.cats" :key="c.id" :to="catTo(c)" class="chip"
              ><img v-if="catImage(c, 128)" :src="catImage(c, 128)" alt="" /><bdi>{{ catTitle(c) }}</bdi></router-link
            >
          </div>
        </div>
        <div aria-hidden="true" class="nf-plate"><span class="nf-num serif">404</span></div>
      </div>
    </section>
    <section v-if="picks.length" class="sec tight">
      <div class="wrap">
        <div class="sec-hd">
          <div>
            <p class="eyebrow">{{ t("bakini.n.rd.whileHere", "While you are here") }}</p>
            <h2>{{ t("bakini.n.rd.goodH", "Something") }} <em>{{ t("bakini.n.rd.goodHem", "good instead.") }}</em></h2>
          </div>
        </div>
        <div class="nf-grid">
          <nx-card v-for="p in picks" :key="p.id" :product="p" />
        </div>
      </div>
    </section>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import NxIcon from "../../../components/bakini/noir/NxIcon.vue";
import NxCard from "../../../components/bakini/noir/NxCard.vue";
import { bySells, catImage, catTitle, catTo, loadNoir, noir } from "../../../components/bakini/noir/noir";
import { catalogueRoute } from "../../../components/kalio/kalio-catalog";
import { t } from "../../../components/kalio/i18n/kalio-i18n";

export default defineComponent({
  name: "StorefrontPageError404",
  components: { NxIcon, NxCard },
  data: () => ({ q: "", noir }),
  computed: {
    /* Four best sellers in stock, one per collection. */
    picks(): any[] {
      const out: any[] = [];
      const used = new Set();
      for (const p of bySells(this.noir.products.filter((x: any) => x.quantity > 0))) {
        if (out.length < 4 && !used.has(p.category_id)) {
          out.push(p);
          used.add(p.category_id);
        }
      }
      return out;
    },
  },
  created() {
    loadNoir();
    (this as any).setPageTitle?.(t("bakini.n.rd.nfTitle", "Page not found"));
  },
  methods: {
    t,
    catTo,
    catTitle,
    catImage,
    go() {
      const text = this.q.trim();
      const r = (window as any).$storefront.routes;
      this.$router.push(text ? { name: r.SHOP_PAGE, query: { search: text } } : catalogueRoute({}));
    },
  },
});
</script>
