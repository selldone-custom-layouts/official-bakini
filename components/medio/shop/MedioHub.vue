<!--
  Medio — a category's hub, above its results (digini-design/
  medio-category.html), after a big electronics retailer's department
  landing:
    the breadcrumb; a slim violet campaign strip (the category's best saving
    and its deals' real end date); the category's name; a round carousel of
    the shop's categories (this one ringed and first, its sub-categories
    when it has any);
    then two columns: on the left, chevron lists in white cards ("Top
    categories", "Popular links": the category's tags and brands, "Buying
    guides": the shop's articles); on the right, "Top deals" (dark cards),
    "Can't decide?" (one choice per tag the category's products carry, each
    a photo slot and an outline pill; its brands when it has too few tags),
    three pastel guide cards and the brands as wordmarks.
  Everything is live; a part with nothing to show is not drawn.

  part="top" draws all of it on a computer; on a phone it draws the strip,
  the name, the carousel, Top deals and the chooser, and part="foot" (under
  the results) draws the lists, the guides and the brands.
-->
<template>
  <div v-if="cat" :class="'-' + part" class="md-hub">
    <template v-if="part === 'top'">
      <nav :aria-label="t('medio.crumbs', 'Breadcrumb')" class="md-crumbs">
        <router-link :to="{ path: '/' }">{{ t("medio.home", "Home") }}</router-link>
        <span aria-hidden="true" class="ms md-chev">chevron_right</span>
        <span aria-current="page" class="md-crumbs__here">{{ catTitle }}</span>
      </nav>

      <router-link :to="stripTo" class="md-hubstrip">
        <span>{{ stripLine }}</span><span aria-hidden="true" class="ms md-chev">chevron_right</span>
      </router-link>

      <h1 class="md-hub__h">{{ catTitle }}</h1>

      <medio-scroller :label="t('medio.hub.cats', 'Categories')" :watch-key="cat.id" class="md-rounds -hub">
        <router-link
          v-for="c in roundList"
          :key="c.cat.id"
          :aria-current="c.cat.id === cat.id ? 'page' : undefined"
          :class="{ '-on': c.cat.id === cat.id }"
          :to="catTo(c.cat)"
          class="md-round-tile"
          role="listitem"
        >
          <span class="md-round-tile__disc"><img v-if="c.pick" :src="pic(c.pick, true)" alt="" loading="lazy" /></span>
          <span class="md-round-tile__t">{{ c.cat.title || c.cat.name }}</span>
        </router-link>
      </medio-scroller>
    </template>

    <div class="md-hub__cols">
      <!-- Left: chevron lists (on a phone: under the results) -->
      <aside v-if="part === 'foot' || !phone" class="md-hub__side">
        <section class="md-hub__block">
          <h2>{{ t("medio.hub.topCats", "Top categories") }}</h2>
          <div class="md-chevlist">
            <router-link v-for="c in sideCats" :key="c.id" :class="{ '-on': c.id === cat.id }" :to="catTo(c)" class="md-chevrow">
              <span>{{ c.title || c.name }}</span><span aria-hidden="true" class="ms md-chev">chevron_right</span>
            </router-link>
            <button v-if="cats.length > 8" :aria-expanded="more_cats ? 'true' : 'false'" class="md-chevrow -more" type="button" @click="more_cats = !more_cats">
              <span>{{ more_cats ? t("medio.menu.showFewer", "Show fewer") : t("medio.menu.showMore", "Show {n} more", { n: cats.length - 8 }) }}</span>
              <span aria-hidden="true" class="ms">{{ more_cats ? "expand_less" : "expand_more" }}</span>
            </button>
          </div>
        </section>
        <section v-if="popular.length" class="md-hub__block">
          <h2>{{ t("medio.hub.popular", "Popular links") }}</h2>
          <div class="md-chevlist">
            <router-link v-for="l in popular" :key="l.key" :to="l.to" class="md-chevrow">
              <span>{{ l.label }}</span><span aria-hidden="true" class="ms md-chev">chevron_right</span>
            </router-link>
          </div>
        </section>
        <section v-if="posts.length" class="md-hub__block">
          <h2>{{ t("medio.hub.guides", "Buying guides") }}</h2>
          <div class="md-chevlist">
            <router-link v-for="a in posts" :key="a.id" :to="postTo(a)" class="md-chevrow">
              <span>{{ a.title }}</span><span aria-hidden="true" class="ms md-chev">chevron_right</span>
            </router-link>
          </div>
        </section>
      </aside>

      <div class="md-hub__main">
        <template v-if="part === 'top'">
          <!-- Top deals -->
          <section v-if="topDeals.length" class="md-hub__sec">
            <h2 class="md-title">{{ topIsDeals ? t("medio.hub.topDeals", "Top deals") : t("medio.hub.topPicks", "Top picks") }}</h2>
            <div class="md-hub__deals">
              <router-link v-for="p in topDeals" :key="p.id" :to="productTo(p)" class="md-dcard">
                <span class="md-dcard__img"><img :src="pic(p)" :srcset="srcset(p)" alt="" loading="lazy" sizes="(max-width: 760px) 44vw, 240px" @error="dropSrcset" /></span>
                <span class="md-dcard__t">
                  <template v-if="price(p).save > 0"><b class="md-dcard__save">{{ t("medio.card.save", "Save {amount}", { amount: whole(price(p).save) }) }}</b> {{ t("medio.home.onProduct", "on {name}", { name: iso(p.title) }) }}</template>
                  <template v-else>{{ p.title }}</template>
                </span>
                <span class="md-dcard__l">
                  <template v-if="price(p).save > 0">{{ t("medio.home.wasLine", "Was {amount}", { amount: full(price(p).was) }) }}<template v-if="ends(p)"> · <medio-deal-clock :end="ends(p)" mode="bare" /></template></template>
                  <template v-else>{{ full(price(p).now) }}</template>
                </span>
              </router-link>
            </div>
          </section>

          <!-- Can't decide? -->
          <section v-if="choices.length >= 2" class="md-hub__sec md-chooser">
            <h2 class="md-chooser__h">{{ t("medio.hub.chooserH", "Can’t decide? Find the right {name} for you", { name: iso(catWord) }) }}</h2>
            <p class="md-chooser__p">{{ t("medio.hub.chooserP", "Pick the one that sounds most like you.") }}</p>
            <div :style="{ '--n': choices.length }" class="md-chooser__grid">
              <router-link v-for="c in choices" :key="c.key" :to="c.to" class="md-choice">
                <medio-slot v-if="c.slot" :place="c.slot" class="md-choice__img" />
                <span v-else class="md-choice__img -pack"><img :src="pic(c.product)" alt="" loading="lazy" /></span>
                <span class="md-pill -line">{{ c.label }}</span>
              </router-link>
            </div>
          </section>
        </template>

        <template v-if="part === 'foot' || !phone">
          <!-- Pastel guide cards -->
          <section v-if="guideCards.length" class="md-hub__sec">
            <div class="md-gcards">
              <router-link v-for="(a, i) in guideCards" :key="a.id" :class="'-' + ['lilac', 'mint', 'lemon'][i % 3]" :to="postTo(a)" class="md-gcard">
                <span class="md-gcard__cap"><span class="ms">{{ ["lightbulb", "tune", "verified"][i % 3] }}</span></span>
                <b>{{ a.title }}</b>
                <small v-if="a.description">{{ a.description }}</small>
                <em>{{ t("medio.hub.readMore", "Read more") }}<span class="ms md-chev">chevron_right</span></em>
              </router-link>
            </div>
          </section>

          <!-- Brands -->
          <section v-if="brands.length" class="md-hub__sec">
            <h2 class="md-title">{{ t("medio.hub.brands", "Brands in {name}", { name: iso(catTitle) }) }}</h2>
            <div class="md-wordmarks">
              <router-link v-for="b in brands" :key="b" :to="brandTo(b)" class="md-wordmark">{{ b }}</router-link>
            </div>
          </section>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import { currentCurrency } from "../../region-switcher/region";
import MedioScroller from "../MedioScroller.vue";
import MedioSlot from "../MedioSlot.vue";
import MedioDealClock from "../MedioDealClock.vue";
import { aisleRoute, aisles, dropSrcset, productSrcset } from "../../kalio/kalio-catalog";
import { journalPage, postRoute } from "../../kalio/pages/kalio-journal";
import { chooseSlot } from "../medio-photos";
import { iso, brandsOf, catalogue, dealEnd, dealsEndDate, dealsOf, isBestSellerTag, isNewTag, moneyOf, moneyText, tagged, tagsIn, tagTitle } from "../medio";
import { formatDate, t } from "../../kalio/i18n/kalio-i18n";

export default {
  name: "MedioHub",
  components: { MedioScroller, MedioSlot, MedioDealClock },
  inject: ["$shop"],
  props: {
    categoryName: { type: String, required: true },
    part: { type: String, default: "top" },
  },
  data: () => ({
    cats: [],
    products: [],
    tags: new Map(),
    articles: [],
    more_cats: false,
    phone: typeof window !== "undefined" ? window.innerWidth < 900 : false,
  }),
  computed: {
    r() {
      return window.$storefront.routes;
    },
    currency() {
      return currentCurrency();
    },
    cat() {
      return this.cats.find((c) => c.name === this.categoryName) || null;
    },
    catTitle() {
      return this.cat ? this.cat.title || this.cat.name : "";
    },
    /* The name inside a sentence ("monitor", "laptop"). */
    catWord() {
      const w = this.catTitle.toLowerCase();
      return w.endsWith("s") && !w.endsWith("ss") ? w.slice(0, -1) : w;
    },
    mine() {
      return this.cat ? this.products.filter((p) => p.category_id === this.cat.id) : [];
    },
    deals() {
      return dealsOf(this.$shop, this.mine);
    },
    bestSave() {
      return Math.max(0, ...this.mine.map((p) => this.price(p).save));
    },
    stripTo() {
      if (!this.cat) return { path: "/" };
      if (this.deals.length) return { ...aisleRoute(this.cat), query: { filter: JSON.stringify({ only_has_discount: true }) } };
      return { name: this.r.COMPARISON_PAGE };
    },
    stripLine() {
      const end = dealsEndDate(this.$shop, this.mine);
      if (this.bestSave > 0 && end)
        return t("medio.hub.strip", "{name} deals end {date} · save up to {amount}", { name: iso(this.catTitle), date: formatDate(end), amount: this.whole(this.bestSave) });
      if (this.bestSave > 0) return t("medio.hub.stripNoDate", "{name} deals · save up to {amount}", { name: iso(this.catTitle), amount: this.whole(this.bestSave) });
      return t("medio.hub.stripCompare", "Not sure which to pick? Compare up to 4 side by side");
    },
    /* The round carousel: this category first, then the others in the
       shop's order (or its own sub-categories when it has them). */
    roundList() {
      const kids = (this.cat?.children || []).filter((c) => c && c.id);
      const list = kids.length ? [this.cat, ...kids] : [this.cat, ...this.cats.filter((c) => c.id !== this.cat?.id)];
      return list.map((c) => {
        const ps = this.products.filter((p) => p.category_id === c.id);
        return { cat: c, pick: dealsOf(this.$shop, ps)[0] || ps[0] || null };
      });
    },
    sideCats() {
      return this.more_cats || this.cats.length <= 8 ? this.cats : this.cats.slice(0, 8);
    },
    catTags() {
      return this.cat ? tagsIn(this.tags, this.cat.id) : [];
    },
    brands() {
      return brandsOf(this.mine).slice(0, 8);
    },
    /* Popular links: the category's deals, its tags, its top brands. */
    popular() {
      if (!this.cat) return [];
      const name = this.catTitle;
      const out = [];
      if (this.deals.length) out.push({ key: "deals", label: t("medio.hub.dealsLink", "{name} deals", { name: iso(name) }), to: this.stripTo });
      for (const x of this.catTags.slice(0, 4))
        out.push({ key: "t" + x.tag, label: t("medio.hub.tagLink", "{tag} {name}", { tag: iso(this.tagWord(x.tag)), name: iso(name.toLowerCase()) }), to: this.tagTo(x.tag) });
      for (const b of this.brands.slice(0, 3)) out.push({ key: "b" + b, label: t("medio.hub.brandLink", "{brand} {name}", { brand: iso(b), name: iso(name.toLowerCase()) }), to: this.brandTo(b) });
      out.push({ key: "all", label: t("medio.hub.allLink", "All {name}", { name: iso(name.toLowerCase()) }), to: { ...aisleRoute(this.cat), query: { sort: "newest" } } });
      return out;
    },
    posts() {
      return this.articles.slice(0, 4);
    },
    guideCards() {
      return this.articles.slice(0, 3);
    },
    topIsDeals() {
      return this.deals.length >= 2;
    },
    topDeals() {
      if (this.topIsDeals) return [...this.deals].sort((a, b) => this.price(b).save - this.price(a).save).slice(0, 4);
      return this.mine.filter((p) => p.quantity > 0).slice(0, 4);
    },
    /* One choice per tag the category's products carry (a photo slot each);
       with fewer than two tags, its brands (their own packshots). */
    choices() {
      if (!this.cat) return [];
      const tags = this.catTags.filter((x) => !isBestSellerTag(x.tag) || this.catTags.length <= 4).slice(0, 4);
      if (tags.length >= 2)
        return tags.map((x) => ({ key: "t" + x.tag, label: this.tagWord(x.tag), slot: chooseSlot(x.tag), to: this.tagTo(x.tag) }));
      return this.brands.slice(0, 4).map((b) => ({ key: "b" + b, label: b, slot: null, product: this.mine.find((p) => p.brand === b), to: this.brandTo(b) }));
    },
  },
  watch: {
    categoryName() {
      this.more_cats = false;
    },
  },
  mounted() {
    aisles().then((list) => (this.cats = list));
    catalogue().then((list) => (this.products = list));
    tagged().then((map) => (this.tags = map));
    journalPage({ page: 1, limit: 6 })
      .then(({ articles }) => (this.articles = articles))
      .catch(() => (this.articles = []));
    this.onResize = () => (this.phone = window.innerWidth < 900);
    window.addEventListener("resize", this.onResize, { passive: true });
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.onResize);
  },
  methods: {
    iso,
    t,
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
    tagWord(tag) {
      if (isNewTag(tag)) return t("medio.badge.new", "New");
      if (isBestSellerTag(tag)) return t("medio.hub.bestSelling", "Best-selling");
      return tagTitle(tag);
    },
    catTo: aisleRoute,
    productTo(p) {
      return { name: this.r.PRODUCT_PAGE, params: { product_id: p.id } };
    },
    tagTo(tag) {
      return { ...aisleRoute(this.cat), query: { search: tag } };
    },
    brandTo(b) {
      return { ...aisleRoute(this.cat), query: { filter: JSON.stringify({ brands: [b] }) } };
    },
    postTo(a) {
      return postRoute(a);
    },
  },
};
</script>
