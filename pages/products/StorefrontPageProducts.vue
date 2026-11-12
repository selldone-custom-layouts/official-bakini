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
  Bakini — the shop page, every category, a search, the deals and "All
  products" (digini-design/bakini-category.html), after a big electronics
  retailer's results pages:
    a category: its breadcrumb, then "All <category>";
    the others: the breadcrumb and the title;
    a slim violet promo banner (compare, an honest offer);
    the Filters panel on the left (BakiniFilterPanel; a side sheet on a phone);
    a toolbar: Sort by, Show 20 / 40 / 60, the item count and List / Grid;
    the results: LIST rows on a computer (the reference's signature), GRID
    cards on a phone (BakiniCard, drawn inside Selldone's own listing);
    the loading motion (listing-motion: dimmed cards and "Updating results…").
  The bare shop page is the home (BakiniHome).
-->
<template>
  <div>
    <v-card :flat="isMobile" class="s--shop-card s--shadow-no-padding -hide1720 pb-16">
      <!-- ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ Top Shop Menu ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ -->
      <div>
        <slot name="header" :center="true"></slot>
      </div>

      <!-- ▆▆▆▆▆▆▆▆ Shop page: the home ▆▆▆▆▆▆▆▆ -->
      <nx-home v-if="show_home" />

      <!-- ▆▆▆▆▆▆▆▆ Category, search, Deals, All products: Bakini Noir's listing ▆▆▆▆▆▆▆▆ -->
      <nx-listing
        v-else
        :key="'ls-' + (category_name || '') + '|' + search_query + '|' + (deals_page ? 1 : 0)"
        :category-name="category_name"
        :deals="deals_page"
        :initial-sort="String($route.query.sort || '')"
        :search="search_query"
      />
    </v-card>


    <!-- A card's "Choose options" opens Kalio's quick-buy sheet (kalio-listing-quick-buy.ts). -->
    <kalio-quick-buy v-model="quick_open" :product="quick_pick" />
  </div>
</template>

<script lang="ts">
import SProductsListing from "@selldone/components-vue/storefront/products/listing/SProductsListing.vue";
import TemplateMixin from "@selldone/components-vue/mixin/template/TemplateMixin.ts";
import NxHome from "../../components/bakini/noir/NxHome.vue";
import NxListing from "../../components/bakini/noir/shop/NxListing.vue";
import BakiniFilterPanel from "../../components/bakini/shop/BakiniFilterPanel.vue";
import BakiniRow from "../../components/bakini/BakiniRow.vue";
import { SORTS, countOn, fromRoute } from "../../components/walio/shop/walio-filters";
import { catalogue, colourName, iso, dealsEndDate, setView, viewMode } from "../../components/bakini/bakini";
import { PAGE_SIZES, perPage } from "../../components/bakini/bakini-listing";
import { aisles } from "../../components/kalio/kalio-catalog";
import { StorefrontSeo } from "../../helpers/StorefrontSeo";
import KalioQuickBuy from "../../components/kalio/KalioQuickBuy.vue";
import { hostQuickBuy } from "../../components/kalio/kalio-listing-quick-buy";
import { quickAdd } from "../../components/kalio/kalio-basket";
import "../../components/kalio/kalio-card-basket"; // a card in the basket shows − n +
import { listingMotion } from "../../components/kalio/listing-motion";
import { isRtl } from "../../components/region-switcher/region";
import { formatDate, t } from "../../components/kalio/i18n/kalio-i18n";

export default {
  name: "StorefrontPageProducts",
  components: {
    SProductsListing,
    NxHome,
    NxListing,
    BakiniFilterPanel,
    BakiniRow,
    KalioQuickBuy,
  },
  mixins: [TemplateMixin],
  inject: ["$shop"],

  data: () => ({
    vendor_id: null as any /* Selldone routes seller pages here too (no seller UI in Bakini). */,
    seoNavigation: StorefrontSeo.captureNavigation(),
    catalogue_total: null as number | null /* The listing's total, for the toolbar. */,
    quick_open: false /* Kalio's quick-buy sheet, for a card's "Choose options". */,
    quick_pick: null as any,
    listing_parent: null as any,
    t_filter: null as any /* The filter the listing has (the panel shows it). */,
    t_sort: null as any,
    hide_out: false,
    aisle_list: [] as any[],
    products: [] as any[],
    sheet_open: false,
    phone: typeof window !== "undefined" ? window.innerWidth < 900 : false,
    PAGE_SIZES,
    lm: listingMotion() /* the results' loading motion */,
  }),

  computed: {
    shop_theme() {
      return this.getShop()?.theme;
    },
    category_name() {
      return this.$route.params?.category_name || null;
    },
    search_query() {
      return String(this.$route.query?.search || "").trim();
    },
    rtl() {
      return isRtl();
    },
    view() {
      return viewMode();
    },
    per_page() {
      return perPage.n;
    },
    skelCount() {
      const list = this.view === "list";
      return this.lm.first ? (list ? 3 : 8) : list ? 2 : 4;
    },
    sorts() {
      const words: Record<string, string> = {
        bestselling: t("bakini.sort.best", "Best sellers"),
        newest: t("bakini.sort.newest", "Newest"),
        cheapest: t("bakini.sort.low", "Price: low to high"),
        most_expensive: t("bakini.sort.high", "Price: high to low"),
        most_popular: t("bakini.sort.liked", "Most liked"),
        most_visited: t("bakini.sort.viewed", "Most viewed"),
      };
      return SORTS.map((s) => ({ val: s.val, name: words[s.val] || s.name }));
    },
    /* Selldone's filter record: the category's own, or the shop's on the catalogue. */
    filters_def() {
      if (this.category_name) return this.listing_parent?.filters || null;
      return this.getShop()?.filters || null;
    },
    on_count() {
      return countOn(this.t_filter) + (this.hide_out ? 1 : 0);
    },
    category() {
      return this.aisle_list.find((a) => a.name === this.category_name) || null;
    },
    compareTo() {
      return { name: window.$storefront.routes.COMPARISON_PAGE };
    },
    deals_page() {
      return !!this.t_filter?.only_has_discount && !this.search_query && !this.category_name;
    },
    dealsUntil() {
      const d = dealsEndDate(this.$shop, this.products);
      return d ? formatDate(d) : "";
    },
    crumb() {
      if (this.category_name) return this.category?.title || this.listing_parent?.title || this.category_name;
      if (this.search_query) return t("bakini.list.search", "Search");
      if (this.deals_page) return t("bakini.list.deals", "Deals");
      return t("bakini.list.all", "All products");
    },
    heading() {
      if (this.category_name) {
        const name = this.category?.title || this.listing_parent?.title || this.category_name;
        if (this.search_query) return t("bakini.list.resultsIn", "Results for “{q}” in {name}", { q: iso(this.search_query), name: iso(name) });
        return t("bakini.list.allIn", "All {name}", { name: iso(String(name).toLowerCase()) });
      }
      if (this.search_query) return t("bakini.list.resultsFor", "Results for “{q}”", { q: this.search_query });
      if (this.deals_page) return t("bakini.list.dealsH", "Deals");
      return t("bakini.list.allH", "All products");
    },
    bannerLine() {
      if (this.deals_page) return t("bakini.list.bannerDeals", "Found a few deals you like? Compare up to 4 side by side");
      if (this.category_name) {
        const name = String(this.category?.title || this.category_name || "").toLowerCase();
        return t("bakini.list.bannerCat", "Not sure which {name} to pick? Compare up to 4 side by side", { name: iso(name) });
      }
      return t("bakini.list.banner", "Not sure which to pick? Compare up to 4 products side by side");
    },

    /* The narrowing choices that are on, each with its own way off. */
    on_chips() {
      const f = this.t_filter;
      if (!f) return [];
      const out: any[] = [];
      const next = () => JSON.parse(JSON.stringify(f));
      if (f.only_has_discount) out.push({ key: "sale", label: t("bakini.filters.onSale", "On sale"), off: () => this.setFilter({ ...next(), only_has_discount: false }) });
      if (f.prices && Object.keys(f.prices).length) out.push({ key: "price", label: t("bakini.filters.priceChip", "Price"), off: () => this.setFilter({ ...next(), prices: null }) });
      for (const b of f.brands || []) out.push({ key: "b" + b, label: b, off: () => this.setFilter({ ...next(), brands: (f.brands || []).filter((x) => x !== b) }) });
      for (const [k, vals] of Object.entries(f.selected_spec || {}))
        for (const v of (vals as any[]) || [])
          out.push({
            key: "s" + k + v,
            label: String(v).split("|")[0],
            off: () => {
              const n = next();
              n.selected_spec[k] = (n.selected_spec[k] || []).filter((x) => x !== v);
              this.setFilter(n);
            },
          });
      for (const [k, vals] of Object.entries(f.selected_variants || {}))
        for (const v of (vals as any[]) || [])
          out.push({
            key: "v" + k + v,
            label: k === "colors" ? colourName(String(v).split("|")[0]) || t("bakini.filters.colour", "Colour") : String(v).split("|")[0],
            off: () => {
              const n = next();
              n.selected_variants[k] = (n.selected_variants[k] || []).filter((x) => x !== v);
              this.setFilter(n);
            },
          });
      return out;
    },

    /* The shop page asked for the catalogue itself (no category). */
    catalogue() {
      return String(this.$route.name || "").startsWith(window.$storefront.routes.SHOP_PAGE) && !this.vendor_id && !this.show_home;
    },
    show_home() {
      return String(this.$route.name || "").startsWith(window.$storefront.routes.SHOP_PAGE) && !this.vendor_id && !Object.keys(this.$route.query || {}).length;
    },
  },

  watch: {
    /* The results show Bakini's own cards; Selldone's Insta view (a photo
       wall without names or buttons) is never the starting view. */
    shop_theme: {
      handler(theme) {
        if (!theme) return;
        if (theme.hover_actions === undefined) theme.hover_actions = true;
        for (const device of ["mobile", "tablet", "pc"]) {
          if (theme[device] === "insta") theme[device] = "normal";
        }
      },
      immediate: true,
    },
    "$route.path"() {
      this.seoNavigation = StorefrontSeo.captureNavigation();
      this.catalogue_total = null;
      this.listing_parent = null;
      this.sheet_open = false;
      this.$nextTick(() => this.readRoute());
    },
    "$route.query.filter"() {
      this.t_filter = fromRoute(this.$route.query);
    },
    "$route.query.only_available"(v) {
      this.hide_out = v === "true" || v === true;
    },
    "$route.name"() {
      this.vendor_id = this.vendorIdFromRoute();
    },
    sheet_open(open) {
      document.documentElement.style.overflow = open ? "hidden" : "";
      if (open) this.$nextTick(() => (this.$refs.sheetX as any)?.focus());
    },
  },

  created() {
    this.releaseQuickBuy = hostQuickBuy((product) =>
      quickAdd(this, product, (picked) => {
        this.quick_pick = picked;
        this.quick_open = true;
      }),
    );
    this.vendor_id = this.vendorIdFromRoute();
    this.setPageTitle();
    this.readRoute();
    aisles().then((list) => (this.aisle_list = list));
    catalogue().then((list) => (this.products = list));
  },
  mounted() {
    this.onResize = () => (this.phone = window.innerWidth < 900);
    window.addEventListener("resize", this.onResize, { passive: true });
    this.onKey = (e) => {
      if (e.key === "Escape" && this.sheet_open) this.sheet_open = false;
    };
    document.addEventListener("keydown", this.onKey);
  },
  beforeUnmount() {
    this.releaseQuickBuy?.();
    window.removeEventListener("resize", this.onResize);
    document.removeEventListener("keydown", this.onKey);
    if (this.sheet_open) document.documentElement.style.overflow = "";
  },

  methods: {
    iso,
    t,
    vendorIdFromRoute() {
      return this.$route.params?.vendor_id ? this.$route.params?.vendor_id : this.$route.query?.vendor_id || null;
    },
    updateProductsSeo(data) {
      this.catalogue_total = typeof data?.total === "number" ? data.total : null;
      const l: any = this.$refs.listing;
      if (l && typeof l.only_available === "boolean") this.hide_out = l.only_available;
      if (data?.parent !== undefined) this.listing_parent = data.parent && data.parent.id ? data.parent : null;
      StorefrontSeo.updateProducts(data, this.getShop(), this.seoNavigation);
    },
    readRoute() {
      this.t_filter = fromRoute(this.$route.query);
      this.t_sort = this.$route.query?.sort || null;
      const a = this.$route.query?.only_available;
      this.hide_out = a === "true" || a === true;
    },
    setFilter(filter) {
      this.t_filter = filter;
      (this.$refs.listing as any)?.setFilter(filter);
    },
    setSort(sort) {
      this.t_sort = sort;
      if (this.$refs.listing) (this.$refs.listing as any).sort = sort;
    },
    /* Selldone's own switch (only_available): its watcher reads again and
       keeps the choice in the address. */
    setHideOut(on) {
      this.hide_out = !!on;
      if (this.$refs.listing) (this.$refs.listing as any).only_available = !!on;
    },
    setPerPage(n) {
      perPage.n = n;
      (this.$refs.listing as any)?.fetchData?.(false);
    },
    setView(mode) {
      setView(mode);
    },
  },
};
</script>
