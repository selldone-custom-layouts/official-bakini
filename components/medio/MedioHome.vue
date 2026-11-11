<!--
  Medio — the home page (digini-design/medio-home.html), after a big
  electronics retailer's home, by its sections (never its name, logo,
  slogans or images). Everything is the shop's live data; nothing names a
  product, a price, a brand, a category or a tag.

   1. A slim magenta campaign strip: the biggest saving and the deals' real
      end date (a link to the deals).
   2. The hero: a photo when hero-main.webp is in the build; until then a
      deep violet panel with the three biggest deals on a white stage.
   3. "Shop deals": round tiles of every category (its top deal's
      packshot), "All deals" first, with arrows. (The categories are the
      page's second section, the owner's rule.)
   4. Promo tiles: one tall, a 2×2, then a row of two, each a category's
      own photo (the owner's photos; a collage of its products without one)
      with its best saving.
   5. "The latest from <brand>": the brand with the most products, its three
      newest.
   6. "Deals from our top brands": white brand cards with "Shop <brand> deals".
   7. "Deals": dark cards, the biggest savings, each with its own clock.
   8. Product rails: Best sellers, Just arrived (from the shop's tags), and
      "Popular picks" with one tab per other tag (a new tag adds a tab; a tag
      with no products shows nothing).
   9. "Discover our amazing offers": four grey cards.
  10. "Why shop with <shop>": six pastel tiles, each a link to a real page.
  11. "Guides & inspiration": the four newest articles with their dates
      (the owner's rule: articles last).
  12. A small note: how prices, deals and payment work.
-->
<template>
  <div class="md-home">
    <div class="md-wrap">
      <!-- ▆▆▆▆ 1. Campaign strip ▆▆▆▆ -->
      <router-link :to="dealsTo" class="md-campaign">
        <span>{{ campaignLine }}</span><span aria-hidden="true" class="ms md-chev">chevron_right</span>
      </router-link>

      <!-- ▆▆▆▆ 2. Hero ▆▆▆▆ -->
      <section :class="{ '-photo': heroPhoto }" class="md-hero" :aria-label="t('medio.home.heroLabel', 'Deals')">
        <img v-if="heroPhoto" :src="heroPhoto" alt="" class="md-hero__photo" fetchpriority="high" />
        <div class="md-hero__txt">
          <span class="md-tag">{{ t("medio.home.dealsTag", "Deals") }}</span>
          <h1 class="md-hero__h">{{ t("medio.home.heroH", "Big savings on the tech you love") }}</h1>
          <p v-if="heroLine" class="md-hero__p">{{ heroLine }}</p>
          <router-link :to="dealsTo" class="md-btn -white">{{ t("medio.home.shopDeals", "Shop deals") }}</router-link>
        </div>
        <div v-if="!heroPhoto" class="md-hero__stage">
          <router-link v-for="p in heroDeals" :key="p.id" :to="productTo(p)" class="md-hero__pick">
            <span class="md-hero__img"><img :src="pic(p)" :srcset="srcset(p)" alt="" sizes="(max-width: 760px) 30vw, 200px" @error="dropSrcset" /></span>
            <span class="md-hero__tag">
              <u-price :amount="price(p).now" :currency="currency" />
              <b class="md-sale-t">{{ t("medio.card.save", "Save {amount}", { amount: whole(price(p).save) }) }}</b>
            </span>
          </router-link>
          <template v-if="!heroDeals.length">
            <span v-for="n in 3" :key="n" aria-hidden="true" class="md-hero__pick -skel"><span class="md-hero__img"></span></span>
          </template>
        </div>
      </section>

      <!-- ▆▆▆▆ 3. Shop deals: round category tiles ▆▆▆▆ -->
      <section class="md-sec" :aria-label="t('medio.home.shopDealsH', 'Shop deals')">
        <h2 class="md-title">{{ t("medio.home.shopDealsH", "Shop deals") }}</h2>
        <medio-scroller :label="t('medio.home.shopDealsH', 'Shop deals')" :watch-key="cats.length" class="md-rounds">
          <router-link :to="dealsTo" class="md-round-tile -all" role="listitem">
            <span class="md-round-tile__disc"><span class="ms">sell</span></span>
            <span class="md-round-tile__t">{{ t("medio.home.allDeals", "All deals") }}</span>
            <small v-if="bestSave > 0" class="md-sale-t">{{ t("medio.header.upTo", "Up to {amount} off", { amount: whole(bestSave) }) }}</small>
          </router-link>
          <router-link v-for="c in roundCats" :key="c.cat.id" :to="catTo(c.cat)" class="md-round-tile" role="listitem">
            <span class="md-round-tile__disc"><img v-if="c.pick" :src="pic(c.pick, true)" alt="" loading="lazy" /></span>
            <span class="md-round-tile__t">{{ c.cat.title || c.cat.name }}</span>
            <small :class="{ 'md-sale-t': c.save > 0 }">{{ c.line }}</small>
          </router-link>
        </medio-scroller>
      </section>

      <!-- ▆▆▆▆ 4. Promo tiles ▆▆▆▆ -->
      <section v-if="promos.tall" class="md-sec md-promos" :aria-label="t('medio.home.offers', 'Offers')">
        <div class="md-promos__top">
          <router-link :to="catTo(promos.tall.cat)" class="md-ptile -tall">
            <medio-photo :alt="promos.tall.cat.title" :photo="promos.tall.photo" :products="inCategory(promos.tall.cat)" sizes="(max-width: 760px) 92vw, 520px" />
            <span class="md-ptile__txt"><b v-html="promoHtml(promos.tall)"></b><small>{{ t("medio.home.shopNow", "Shop now") }}<span class="ms md-chev">chevron_right</span></small></span>
          </router-link>
          <div class="md-promos__grid">
            <router-link v-for="p in promos.grid" :key="p.cat.id" :to="catTo(p.cat)" class="md-ptile">
              <medio-photo :alt="p.cat.title" :photo="p.photo" :products="inCategory(p.cat)" sizes="(max-width: 760px) 46vw, 420px" />
              <span class="md-ptile__txt"><b v-html="promoHtml(p)"></b><small>{{ t("medio.home.shopNow", "Shop now") }}<span class="ms md-chev">chevron_right</span></small></span>
            </router-link>
          </div>
        </div>
        <div v-if="promos.wide.length === 2" class="md-promos__wide">
          <router-link v-for="p in promos.wide" :key="p.cat.id" :to="catTo(p.cat)" class="md-ptile -wide">
            <medio-photo :alt="p.cat.title" :photo="p.photo" :products="inCategory(p.cat)" sizes="(max-width: 760px) 92vw, 690px" />
            <span class="md-ptile__txt"><b v-html="promoHtml(p)"></b><small>{{ t("medio.home.shopNow", "Shop now") }}<span class="ms md-chev">chevron_right</span></small></span>
          </router-link>
        </div>
      </section>

      <!-- ▆▆▆▆ 5. The latest from <brand> ▆▆▆▆ -->
      <section v-if="latest.items.length === 3" class="md-sec" :aria-label="latestTitle">
        <h2 class="md-title">{{ latestTitle }}</h2>
        <div class="md-latest">
          <router-link v-for="(p, i) in latest.items" :key="p.id" :class="{ '-dark': i === 0 }" :to="productTo(p)" class="md-latest__tile">
            <span class="md-latest__txt">
              <small>{{ latest.brand }} · {{ catName(p.category_id) }}</small>
              <b>{{ p.title }}</b>
              <em>{{ t("medio.home.shopNow", "Shop now") }}<span class="ms md-chev">chevron_right</span></em>
            </span>
            <span class="md-latest__img"><img :src="pic(p)" :srcset="srcset(p)" alt="" loading="lazy" sizes="180px" @error="dropSrcset" /></span>
          </router-link>
        </div>
      </section>

      <!-- ▆▆▆▆ 6. Deals from our top brands ▆▆▆▆ -->
      <section v-if="brandDeals.length >= 3" class="md-sec" :aria-label="t('medio.home.brandsH', 'Deals from our top brands')">
        <h2 class="md-title">{{ t("medio.home.brandsH", "Deals from our top brands") }}</h2>
        <medio-scroller :label="t('medio.home.brandsH', 'Deals from our top brands')" :watch-key="brandDeals.length" class="md-brands">
          <router-link v-for="b in brandDeals" :key="b.brand" :to="brandDealsTo(b.brand)" class="md-brandcard" role="listitem">
            <b class="md-brandcard__w">{{ b.brand }}</b>
            <span class="md-brandcard__img"><img :src="pic(b.top, true)" alt="" loading="lazy" /></span>
            <span class="md-pill -line">{{ t("medio.home.shopBrandDeals", "Shop {brand} deals", { brand: iso(b.brand) }) }}</span>
          </router-link>
        </medio-scroller>
      </section>

      <!-- ▆▆▆▆ 7. Deals: dark cards ▆▆▆▆ -->
      <section v-if="dealCards.length" class="md-sec" :aria-label="t('medio.home.dealsH', 'Deals')">
        <header class="md-head -center">
          <h2 class="md-title">{{ t("medio.home.dealsH", "Deals") }}</h2>
          <router-link :to="dealsTo" class="md-more">{{ t("medio.home.seeAllDeals", "See all deals") }}<span class="ms md-chev">chevron_right</span></router-link>
        </header>
        <medio-scroller :label="t('medio.home.dealsH', 'Deals')" :watch-key="dealCards.length" class="md-darkdeals" edge>
          <router-link v-for="p in dealCards" :key="p.id" :to="productTo(p)" class="md-dcard" role="listitem">
            <span class="md-dcard__img"><img :src="pic(p)" :srcset="srcset(p)" alt="" loading="lazy" sizes="(max-width: 760px) 70vw, 300px" @error="dropSrcset" /></span>
            <span class="md-dcard__t">
              <b class="md-dcard__save">{{ t("medio.card.save", "Save {amount}", { amount: whole(price(p).save) }) }}</b>
              {{ t("medio.home.onProduct", "on {name}", { name: iso(p.title) }) }}
            </span>
            <span class="md-dcard__l">
              {{ t("medio.home.wasLine", "Was {amount}", { amount: full(price(p).was) }) }}<template v-if="ends(p)"> · <medio-deal-clock :end="ends(p)" mode="bare" /></template>
            </span>
          </router-link>
        </medio-scroller>
      </section>

      <!-- ▆▆▆▆ 8. Product rails from the shop's tags ▆▆▆▆ -->
      <medio-rail
        v-if="bestTag"
        :more-to="tagTo(bestTag)"
        :products="ready ? best : null"
        :title="t('medio.home.bestH', 'Best sellers')"
        @quick-buy="quickBuy"
      />
      <medio-rail
        :more-to="newTag ? tagTo(newTag) : newestTo"
        :products="ready ? fresh : null"
        :title="t('medio.home.newH', 'Just arrived')"
        @quick-buy="quickBuy"
      />
      <medio-rail
        v-if="popTags.length"
        :more-to="tagTo(popTag)"
        :products="ready ? popList : null"
        :title="t('medio.home.popH', 'Popular picks')"
        @quick-buy="quickBuy"
      >
        <template #head>
          <div :aria-label="t('medio.home.popH', 'Popular picks')" class="md-tabs" role="tablist">
            <button
              v-for="tg in popTags"
              :key="tg"
              :aria-selected="tg === popTag ? 'true' : 'false'"
              :class="{ '-on': tg === popTag }"
              class="md-tab"
              role="tab"
              type="button"
              @click="pop_tag = tg"
            >
              {{ tagTitle(tg) }}
            </button>
          </div>
        </template>
      </medio-rail>

      <!-- ▆▆▆▆ 9. Discover our amazing offers ▆▆▆▆ -->
      <section v-if="offers.length === 4" class="md-sec" :aria-label="t('medio.home.discoverH', 'Discover our amazing offers')">
        <h2 class="md-title">{{ t("medio.home.discoverH", "Discover our amazing offers") }}</h2>
        <div class="md-offers">
          <router-link v-for="p in offers" :key="p.id" :to="productTo(p)" class="md-ocard">
            <span class="md-ocard__img"><img :src="pic(p)" :srcset="srcset(p)" alt="" loading="lazy" sizes="(max-width: 760px) 46vw, 300px" @error="dropSrcset" /></span>
            <span class="md-ocard__t">{{ t("medio.home.saveOn", "Save {amount} on {name}", { amount: whole(price(p).save), name: iso(p.title) }) }}</span>
            <span class="md-ocard__l md-sale-t">{{ t("medio.home.nowWas", "Now {now}, was {was}", { now: full(price(p).now), was: full(price(p).was) }) }}</span>
          </router-link>
        </div>
      </section>

      <!-- ▆▆▆▆ 10. Why shop with … ▆▆▆▆ -->
      <section class="md-sec" :aria-label="t('medio.home.whyH', 'Why shop with {name}', { name: iso(shopTitle) })">
        <h2 class="md-title">{{ t("medio.home.whyH", "Why shop with {name}", { name: iso(shopTitle) }) }}</h2>
        <div class="md-why">
          <router-link v-for="w in why" :key="w.key" :class="'-' + w.tint" :to="w.to" class="md-why__tile">
            <span class="md-why__txt"><b>{{ w.title }}</b><small>{{ w.line }}</small></span>
            <medio-slot :place="w.slot" class="md-why__img" />
          </router-link>
        </div>
      </section>

      <!-- ▆▆▆▆ 11. Guides (the last section) ▆▆▆▆ -->
      <section v-if="posts.length" class="md-sec" :aria-label="t('medio.home.guidesH', 'Guides & inspiration')">
        <header class="md-head -center">
          <h2 class="md-title">{{ t("medio.home.guidesH", "Guides & inspiration") }}</h2>
          <router-link :to="blogTo" class="md-more">{{ t("medio.home.allGuides", "All guides") }}<span class="ms md-chev">chevron_right</span></router-link>
        </header>
        <div class="md-posts">
          <router-link v-for="a in posts" :key="a.id" :to="postTo(a)" class="md-post">
            <span class="md-post__img"><img v-if="a.image" :src="postImage(a)" :srcset="postSrcset(a)" alt="" loading="lazy" sizes="(max-width: 760px) 92vw, 340px" @error="dropSrcset" /></span>
            <time :datetime="a.created_at">{{ postDate(a) }}</time>
            <b class="md-post__t">{{ a.title }}</b>
            <span v-if="a.description" class="md-post__p">{{ a.description }}</span>
          </router-link>
        </div>
      </section>

      <!-- ▆▆▆▆ 12. The note ▆▆▆▆ -->
      <p class="md-note">
        {{ t("medio.home.note", "Prices shown include any discount. Each deal ends on the date shown with it. Ways to pay are shown at checkout.") }}
      </p>
    </div>

    <kalio-quick-buy v-model="sheet" :product="picked" />
  </div>
</template>

<script>
import { currentCurrency } from "../region-switcher/region";
import CurrencyMixin from "@selldone/components-vue/mixin/currency/CurrencyMixin.ts";
import MedioRail from "./MedioRail.vue";
import MedioPhoto from "./MedioPhoto.vue";
import MedioSlot from "./MedioSlot.vue";
import MedioScroller from "./MedioScroller.vue";
import MedioDealClock from "./MedioDealClock.vue";
import KalioQuickBuy from "../kalio/KalioQuickBuy.vue";
import { aisleRoute, aisles, catalogueRoute, dealsRoute, dropSrcset, photoSrcset, productSrcset } from "../kalio/kalio-catalog";
import { journalPage, journalRoute, postRoute } from "../kalio/pages/kalio-journal";
import { SLOTS, slotSrc } from "./medio-photos";
import {
  brandsOf,
  catalogue,
  dealEnd,
  dealsEndDate,
  dealsOf,
  isBestSellerTag,
  isNewTag,
  mixByCategory,
  moneyOf,
  moneyText,
  photoOf,
  tagged,
  tagTitle,
  iso,
} from "./medio";
import { formatDate, t } from "../kalio/i18n/kalio-i18n";

export default {
  name: "MedioHome",
  components: { MedioRail, MedioPhoto, MedioSlot, MedioScroller, MedioDealClock, KalioQuickBuy },
  mixins: [CurrencyMixin],
  inject: ["$shop"],

  data: () => ({
    cats: [],
    products: [],
    tags: new Map(),
    ready: false,
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
    heroPhoto() {
      return slotSrc(SLOTS["hero-main"]);
    },
    deals() {
      return dealsOf(this.$shop, this.products);
    },
    dealsUntil() {
      const d = dealsEndDate(this.$shop, this.products);
      return d ? formatDate(d) : "";
    },
    bestSave() {
      return Math.max(0, ...this.deals.map((p) => this.price(p).save));
    },
    campaignLine() {
      if (this.bestSave > 0 && this.dealsUntil)
        return t("medio.home.campaign", "Save up to {amount} across the store · deals end {date}", { amount: this.whole(this.bestSave), date: this.dealsUntil });
      if (this.bestSave > 0) return t("medio.home.campaignNoDate", "Save up to {amount} across the store", { amount: this.whole(this.bestSave) });
      return t("medio.home.campaignNone", "Shop the latest tech across the store");
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
    heroLine() {
      const top = this.heroDeals[0];
      if (!top) return "";
      const cat = this.catName(top.category_id);
      return t("medio.home.heroP", "Save up to {amount} on {category}", { amount: this.whole(this.price(top).save), category: cat.toLowerCase() });
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
            line: save > 0 ? t("medio.header.upTo", "Up to {amount} off", { amount: this.whole(save) }) : t("medio.home.from", "From {amount}", { amount: this.full(from) }),
          };
        })
        .filter(Boolean);
    },
    /* Promo tiles: the categories with the owner's photos, the biggest
       saving first; one tall (portrait), four (square), two wide. A shop
       without the photos gets the same tiles as collages of each category's
       own products. */
    promos() {
      const withSave = this.roundCats.slice().sort((a, b) => b.save - a.save);
      const used = new Set();
      const take = (shape, n) => {
        const list = withSave.filter((c) => !used.has(c.cat.id) && photoOf(c.cat, shape));
        const rest = withSave.filter((c) => !used.has(c.cat.id) && !list.includes(c));
        const out = [...list, ...rest].slice(0, n).map((c) => ({ ...c, photo: photoOf(c.cat, shape) }));
        out.forEach((c) => used.add(c.cat.id));
        return out;
      };
      if (this.roundCats.length < 7) return { tall: null, grid: [], wide: [] };
      const tall = take("portrait", 1)[0];
      const grid = take("square", 4);
      const wide = take("wide", 2);
      return { tall, grid, wide };
    },
    /* The brand with the most products and its three newest. */
    latest() {
      const brand = brandsOf(this.products)[0];
      if (!brand) return { brand: null, items: [] };
      const items = this.products
        .filter((p) => p.brand === brand && p.quantity > 0)
        .sort((a, b) => String(b.created_at || "").localeCompare(String(a.created_at || "")) || b.id - a.id);
      return { brand, items: mixByCategory(items, 3) };
    },
    latestTitle() {
      return t("medio.home.latestH", "The latest from {brand}", { brand: iso(this.latest.brand || "") });
    },
    /* Brands with deals, the most deals first, each with its best deal. */
    brandDeals() {
      const n = new Map();
      for (const p of this.deals) {
        if (!p.brand) continue;
        if (!n.has(p.brand)) n.set(p.brand, []);
        n.get(p.brand).push(p);
      }
      return [...n.entries()]
        .sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0]))
        .slice(0, 10)
        .map(([brand, list]) => ({ brand, top: list[0] }));
    },
    /* The dark Deals cards: the biggest savings not in the hero. */
    dealCards() {
      const hero = new Set(this.heroDeals.map((p) => p.id));
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
    /* Four more offers, not shown above. */
    offers() {
      const shown = new Set([...this.heroDeals, ...this.dealCards].map((p) => p.id));
      const rest = this.deals.filter((p) => !shown.has(p.id));
      return mixByCategory(rest.length >= 4 ? rest : this.deals, 4);
    },
    why() {
      const r = this.r;
      const faq = this.$router.hasRoute("ShopFAQ") ? { name: "ShopFAQ" } : { name: r.SHOP_CONTACT_US };
      return [
        { key: "deals", tint: "lemon", slot: "why-deals", title: t("medio.why.deals", "Real deal end dates"), line: t("medio.why.dealsL", "Every deal shows when it ends, to the second."), to: this.dealsTo },
        { key: "compare", tint: "pink", slot: "why-compare", title: t("medio.why.compare", "Compare before you buy"), line: t("medio.why.compareL", "Put up to four products side by side."), to: { name: r.COMPARISON_PAGE } },
        { key: "track", tint: "mint", slot: "why-track", title: t("medio.why.track", "Track every order"), line: t("medio.why.trackL", "See where your parcel is, from our door to yours."), to: { name: r.HISTORY_ORDERS_PHYSICAL } },
        { key: "returns", tint: "lilac", slot: "why-returns", title: t("medio.why.returns", "Clear returns"), line: t("medio.why.returnsL", "Our delivery and returns terms, in plain words."), to: { name: r.SHOP_PROFILE_PAGE_TERMS } },
        { key: "help", tint: "peach", slot: "why-help", title: t("medio.why.help", "Help when you need it"), line: t("medio.why.helpL", "Quick answers on orders, delivery and payment."), to: faq },
        { key: "secure", tint: "sky", slot: "why-secure", title: t("medio.why.secure", "Secure checkout"), line: t("medio.why.secureL", "Your details are protected. Read how we use them."), to: { name: r.SHOP_PROFILE_PAGE_PRIVACY } },
      ];
    },
  },

  mounted() {
    aisles().then((list) => (this.cats = list));
    catalogue().then((list) => {
      this.products = list;
      this.ready = true;
    });
    tagged().then((map) => (this.tags = map));
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
    brandDealsTo(b) {
      return { name: this.r.SHOP_PAGE, query: { filter: JSON.stringify({ brands: [b], only_has_discount: true }) } };
    },
    /* "Up to $400 off <b>headphones</b>" (the saving is the accent). */
    promoHtml(p) {
      const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
      const name = iso(esc(p.cat.title || p.cat.name));
      return p.save > 0
        ? t("medio.home.promoSave", "<em>Up to {amount} off</em> {name}", { amount: esc(this.whole(p.save)), name })
        : t("medio.home.promoFrom", "{name} <em>{line}</em>", { name, line: esc(p.line) });
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
