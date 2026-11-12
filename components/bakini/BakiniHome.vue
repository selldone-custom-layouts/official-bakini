<!--
  Bakini Noir — the home page. PHASE 1 BASE: only the generic live-data
  sections are kept (a deals stage, the collections, the deals, rows from
  the shop's tags, the journal last). Phase 2 replaces it with the B
  mockup's home (bakio-design/home-b.html): stage hero, collections lineup,
  facts bento, selection rows, most loved, compare strip, deals band,
  story, visit, journal. Nothing names a product, price, category or tag.
-->
<template>
  <div class="bk-home">
    <div class="bk-wrap">
      <!-- ▆▆▆▆ 2. Hero ▆▆▆▆ -->
      <section class="bk-hero" :aria-label="t('bakini.home.heroLabel', 'Deals')">
        <div class="bk-hero__txt">
          <span class="bk-tag">{{ t("bakini.home.dealsTag", "Deals") }}</span>
          <h1 class="bk-hero__h">{{ t("bakini.home.heroH", "Fresh from the counter") }}</h1>
          <p v-if="heroLine" class="bk-hero__p">{{ heroLine }}</p>
          <router-link :to="dealsTo" class="bk-btn -white">{{ t("bakini.home.shopDeals", "Shop deals") }}</router-link>
        </div>
        <div class="bk-hero__stage">
          <router-link v-for="p in heroDeals" :key="p.id" :to="productTo(p)" class="bk-hero__pick">
            <span class="bk-hero__img"><img :src="pic(p)" :srcset="srcset(p)" alt="" sizes="(max-width: 760px) 30vw, 200px" @error="dropSrcset" /></span>
            <span class="bk-hero__tag">
              <u-price :amount="price(p).now" :currency="currency" />
              <b class="bk-sale-t">{{ t("bakini.card.save", "Save {amount}", { amount: whole(price(p).save) }) }}</b>
            </span>
          </router-link>
          <template v-if="!heroDeals.length">
            <span v-for="n in 3" :key="n" aria-hidden="true" class="bk-hero__pick -skel"><span class="bk-hero__img"></span></span>
          </template>
        </div>
      </section>

      <!-- ▆▆▆▆ 3. Shop deals: round category tiles ▆▆▆▆ -->
      <section class="bk-sec" :aria-label="t('bakini.home.collectionsH', 'Explore the collections')">
        <h2 class="bk-title">{{ t("bakini.home.collectionsH", "Explore the collections") }}</h2>
        <bakini-scroller :label="t('bakini.home.collectionsH', 'Explore the collections')" :watch-key="cats.length" class="bk-rounds">
          <router-link :to="dealsTo" class="bk-round-tile -all" role="listitem">
            <span class="bk-round-tile__disc"><span class="ms">sell</span></span>
            <span class="bk-round-tile__t">{{ t("bakini.home.allDeals", "All deals") }}</span>
            <small v-if="bestSave > 0" class="bk-sale-t">{{ t("bakini.header.upTo", "Up to {amount} off", { amount: whole(bestSave) }) }}</small>
          </router-link>
          <router-link v-for="c in roundCats" :key="c.cat.id" :to="catTo(c.cat)" class="bk-round-tile" role="listitem">
            <span class="bk-round-tile__disc"><img v-if="c.pick" :src="pic(c.pick, true)" alt="" loading="lazy" /></span>
            <span class="bk-round-tile__t">{{ c.cat.title || c.cat.name }}</span>
            <small :class="{ 'bk-sale-t': c.save > 0 }">{{ c.line }}</small>
          </router-link>
        </bakini-scroller>
      </section>

      <!-- ▆▆▆▆ 4. Deals ▆▆▆▆ -->
      <section v-if="dealCards.length" class="bk-sec" :aria-label="t('bakini.home.dealsH', 'Deals')">
        <header class="bk-head -center">
          <h2 class="bk-title">{{ t("bakini.home.dealsH", "Deals") }}</h2>
          <router-link :to="dealsTo" class="bk-more">{{ t("bakini.home.seeAllDeals", "See all deals") }}<span class="ms bk-chev">chevron_right</span></router-link>
        </header>
        <bakini-scroller :label="t('bakini.home.dealsH', 'Deals')" :watch-key="dealCards.length" class="bk-darkdeals" edge>
          <router-link v-for="p in dealCards" :key="p.id" :to="productTo(p)" class="bk-dcard" role="listitem">
            <span class="bk-dcard__img"><img :src="pic(p)" :srcset="srcset(p)" alt="" loading="lazy" sizes="(max-width: 760px) 70vw, 300px" @error="dropSrcset" /></span>
            <span class="bk-dcard__t">
              <b class="bk-dcard__save">{{ t("bakini.card.save", "Save {amount}", { amount: whole(price(p).save) }) }}</b>
              {{ t("bakini.home.onProduct", "on {name}", { name: iso(p.title) }) }}
            </span>
            <span class="bk-dcard__l">
              {{ t("bakini.home.wasLine", "Was {amount}", { amount: full(price(p).was) }) }}<template v-if="ends(p)"> · <bakini-deal-clock :end="ends(p)" mode="bare" /></template>
            </span>
          </router-link>
        </bakini-scroller>
      </section>

      <!-- ▆▆▆▆ 5. Product rows from the shop's tags ▆▆▆▆ -->
      <bakini-rail
        v-if="bestTag"
        :more-to="tagTo(bestTag)"
        :products="ready ? best : null"
        :title="t('bakini.home.bestH', 'Best sellers')"
        @quick-buy="quickBuy"
      />
      <bakini-rail
        :more-to="newTag ? tagTo(newTag) : newestTo"
        :products="ready ? fresh : null"
        :title="t('bakini.home.newH', 'Just arrived')"
        @quick-buy="quickBuy"
      />
      <bakini-rail
        v-if="popTags.length"
        :more-to="tagTo(popTag)"
        :products="ready ? popList : null"
        :title="t('bakini.home.popH', 'Popular picks')"
        @quick-buy="quickBuy"
      >
        <template #head>
          <div :aria-label="t('bakini.home.popH', 'Popular picks')" class="bk-tabs" role="tablist">
            <button
              v-for="tg in popTags"
              :key="tg"
              :aria-selected="tg === popTag ? 'true' : 'false'"
              :class="{ '-on': tg === popTag }"
              class="bk-tab"
              role="tab"
              type="button"
              @click="pop_tag = tg"
            >
              {{ tagTitle(tg) }}
            </button>
          </div>
        </template>
      </bakini-rail>

      <!-- ▆▆▆▆ 6. Journal (the last section) ▆▆▆▆ -->
      <section v-if="posts.length" class="bk-sec" :aria-label="t('bakini.home.journalH', 'From the journal')">
        <header class="bk-head -center">
          <h2 class="bk-title">{{ t("bakini.home.journalH", "From the journal") }}</h2>
          <router-link :to="blogTo" class="bk-more">{{ t("bakini.home.allPosts", "All stories") }}<span class="ms bk-chev">chevron_right</span></router-link>
        </header>
        <div class="bk-posts">
          <router-link v-for="a in posts" :key="a.id" :to="postTo(a)" class="bk-post">
            <span class="bk-post__img"><img v-if="a.image" :src="postImage(a)" :srcset="postSrcset(a)" alt="" loading="lazy" sizes="(max-width: 760px) 92vw, 340px" @error="dropSrcset" /></span>
            <time :datetime="a.created_at">{{ postDate(a) }}</time>
            <b class="bk-post__t">{{ a.title }}</b>
            <span v-if="a.description" class="bk-post__p">{{ a.description }}</span>
          </router-link>
        </div>
      </section>

    </div>

    <kalio-quick-buy v-model="sheet" :product="picked" />
  </div>
</template>

<script>
import { currentCurrency } from "../region-switcher/region";
import CurrencyMixin from "@selldone/components-vue/mixin/currency/CurrencyMixin.ts";
import BakiniRail from "./BakiniRail.vue";
import BakiniScroller from "./BakiniScroller.vue";
import BakiniDealClock from "./BakiniDealClock.vue";
import KalioQuickBuy from "../kalio/KalioQuickBuy.vue";
import { aisleRoute, aisles, catalogueRoute, dealsRoute, dropSrcset, photoSrcset, productSrcset } from "../kalio/kalio-catalog";
import { journalPage, journalRoute, postRoute } from "../kalio/pages/kalio-journal";
import {
  bestSellerIds,
  catalogue,
  dealEnd,
  dealsOf,
  isBestSellerTag,
  isNewTag,
  mixByCategory,
  moneyOf,
  moneyText,
  tagged,
  tagTitle,
  iso,
} from "./bakini";
import { formatDate, t } from "../kalio/i18n/kalio-i18n";

export default {
  name: "BakiniHome",
  components: { BakiniRail, BakiniScroller, BakiniDealClock, KalioQuickBuy },
  mixins: [CurrencyMixin],
  inject: ["$shop"],

  data: () => ({
    cats: [],
    products: [],
    tags: new Map(),
    ready: false,
    best_ids: null,
    posts: [],
    sheet: false,
    picked: null,
    pop_tag: null,
  }),

  computed: {
    currency() {
      return currentCurrency();
    },
    shopTitle() {
      return this.$shop?.title || "";
    },
    dealsTo() {
      return dealsRoute();
    },
    newestTo() {
      return catalogueRoute({ sort: "newest" });
    },
    blogTo() {
      return journalRoute();
    },
    r() {
      return window.$storefront.routes;
    },
    deals() {
      return dealsOf(this.$shop, this.products);
    },
    bestSave() {
      return Math.max(0, ...this.deals.map((p) => this.price(p).save));
    },
    /* The three biggest savings (in money), from three categories. */
    heroDeals() {
      const bySave = [...this.deals].sort((a, b) => this.price(b).save - this.price(a).save);
      const seen = new Set();
      const out = [];
      for (const p of bySave) {
        if (seen.has(p.category_id)) continue;
        seen.add(p.category_id);
        out.push(p);
        if (out.length === 3) break;
      }
      return out;
    },
    /* The products the hero shows, kept out of the sections below. */
    heroIds() {
      return new Set(this.heroDeals.map((p) => p.id));
    },
    heroLine() {
      const top = this.heroDeals[0];
      if (!top) return "";
      const cat = this.catName(top.category_id);
      return t("bakini.home.heroP", "Save up to {amount} on {category}", { amount: this.whole(this.price(top).save), category: cat.toLowerCase() });
    },
    /* Every category with its best deal's packshot and saving line. */
    roundCats() {
      return this.cats
        .map((c) => {
          const mine = this.inCategory(c);
          if (!mine.length) return null;
          const deals = dealsOf(this.$shop, mine);
          const pick = deals[0] || mine.find((p) => p.quantity > 0) || mine[0];
          const save = Math.max(0, ...mine.map((p) => this.price(p).save));
          const from = Math.min(...mine.map((p) => this.price(p).now));
          return {
            cat: c,
            pick,
            save,
            line: save > 0 ? t("bakini.header.upTo", "Up to {amount} off", { amount: this.whole(save) }) : t("bakini.home.from", "From {amount}", { amount: this.full(from) }),
          };
        })
        .filter(Boolean);
    },
    /* The dark Deals cards: the biggest savings not in the hero. */
    dealCards() {
      const hero = this.heroIds;
      return mixByCategory(
        [...this.deals].filter((p) => !hero.has(p.id)).sort((a, b) => this.price(b).save - this.price(a).save),
        10,
      );
    },
    bestTag() {
      return [...this.tags.keys()].find(isBestSellerTag) || null;
    },
    newTag() {
      return [...this.tags.keys()].find(isNewTag) || null;
    },
    best() {
      const list = this.bestTag ? this.tags.get(this.bestTag) || [] : [];
      return mixByCategory(list.filter((p) => p.icon), 12);
    },
    fresh() {
      const list = this.newTag
        ? this.tags.get(this.newTag) || []
        : [...this.products].sort((a, b) => String(b.created_at || "").localeCompare(String(a.created_at || "")));
      return mixByCategory(list.filter((p) => p.icon), 12);
    },
    /* Every other tag, most used first: one tab each. */
    popTags() {
      return [...this.tags.entries()]
        .filter(([tg, list]) => !isBestSellerTag(tg) && !isNewTag(tg) && list.length)
        .sort((a, b) => b[1].length - a[1].length)
        .slice(0, 6)
        .map(([tg]) => tg);
    },
    popTag() {
      return this.popTags.includes(this.pop_tag) ? this.pop_tag : this.popTags[0];
    },
    popList() {
      return mixByCategory((this.tags.get(this.popTag) || []).filter((p) => p.icon), 12);
    },
  },

  mounted() {
    aisles().then((list) => (this.cats = list));
    catalogue().then((list) => {
      this.products = list;
      this.ready = true;
    });
    tagged().then((map) => (this.tags = map));
    bestSellerIds().then((ids) => (this.best_ids = ids));
    journalPage({ page: 1, limit: 8 })
      .then(({ articles }) => (this.posts = articles.slice(0, 4)))
      .catch(() => (this.posts = []));
  },

  methods: {
    iso,
    t,
    tagTitle,
    dropSrcset,
    price(p) {
      return moneyOf(this.$shop, p, null, this.currency);
    },
    whole(n) {
      return moneyText(Math.round(n || 0), this.currency, true);
    },
    full(n) {
      return moneyText(n || 0, this.currency, false);
    },
    ends(p) {
      return dealEnd(p, null);
    },
    pic(p, thumb = false) {
      return p?.icon ? window.CDN.GET_SHOP_IMAGE_PATH(p.icon, thumb ? 128 : null) : null;
    },
    srcset(p) {
      return productSrcset(p);
    },
    catTo(c) {
      return aisleRoute(c);
    },
    catName(id) {
      const c = this.cats.find((x) => x.id === id);
      return c ? c.title || c.name : "";
    },
    inCategory(c) {
      return this.products.filter((p) => p.category_id === c.id);
    },
    productTo(p) {
      return { name: this.r.PRODUCT_PAGE, params: { product_id: p.id } };
    },
    tagTo(tag) {
      return { name: this.r.SHOP_PAGE, query: { search: tag } };
    },
    postTo(a) {
      return postRoute(a);
    },
    postImage(a) {
      return window.CDN.GET_SHOP_IMAGE_PATH(a.image, null);
    },
    postSrcset(a) {
      return photoSrcset(this.postImage(a));
    },
    postDate(a) {
      return a.created_at ? formatDate(a.created_at) : "";
    },
    quickBuy(p) {
      this.picked = p;
      this.sheet = true;
    },
  },
};
</script>
