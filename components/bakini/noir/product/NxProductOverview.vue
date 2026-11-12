<!--
  Bakini Noir — the top of the product page (bakio-design/product-b.html,
  b/pages-product.js): the gallery on the left (the pastry on its stage, the
  photo the stage's width, one row of thumbnails: Selldone's own photos of
  the product); the buy column on the right, which stays in view while the
  page scrolls (sticky): the collection, the name, "per <unit> · sold
  individually", the price with the struck was-price and "Save $x · n%", the
  deal's own clock only when the deal has a real end date (Selldone's rule),
  the stock, the options (only when the product has real variants: tiles
  with their own photo, the chosen one ringed inside and tinted, no tick;
  Selldone's own picker in the same dress when the variants differ in more
  than one way), the big quantity box ("Add to bag · $x", then − n +),
  Compare (the theme colour) and Copy link, and the shop's delivery, pickup
  and payment lines with their icons on one edge.

  On a phone, once the Add box has scrolled away, a buy bar at the foot.

  Every behaviour is Selldone's SProductOverview (through Kalio's): the
  chosen variant, the store, the basket line. A product that needs more than
  a count (a service, a valuation form, extra pricing, a subscription) keeps
  Selldone's own buy section here.
-->
<template>
  <section :style="{ '--bk-hue': hue }" class="wrap pd">
    <div class="pd-gal">
      <div class="pd-stage">
        <div class="pd-ph">
          <img v-if="photo" :key="photo.src" :alt="photo.alt" :src="photo.src" decoding="async" loading="eager" />
        </div>
      </div>
      <div v-if="photos.length > 1" :aria-label="t('bakini.n.pd.photos', 'Photos')" class="pd-thumbs" role="group">
        <button
          v-for="(ph, i) in photos"
          :key="ph.src"
          :aria-label="t('bakini.n.pd.photoN', 'Photo {n} of {total}', { n: i + 1, total: photos.length })"
          :aria-pressed="i === at ? 'true' : 'false'"
          class="pd-th"
          type="button"
          @click="at = i"
        >
          <img :src="ph.thumb" alt="" loading="lazy" />
        </button>
      </div>
    </div>

    <div class="pd-buy">
      <div class="pd-buy-in">
        <p v-if="catName" class="eyebrow"><bdi>{{ catName }}</bdi></p>
        <h1 class="serif">{{ $product.title }}</h1>
        <p class="pd-unit">{{ t("bakini.n.pd.unitLine", "per {unit} · sold individually", { unit }) }}</p>

        <div v-if="isSubscription" class="pd-opt nx-sd-sub">
          <s-subscription-price-select
            v-model="selected_subscription_price"
            :disabled="!$product.quantity"
            :subscription-prices="subscription_prices"
            return-object
          ></s-subscription-price-select>
        </div>
        <template v-else>
          <div class="pd-price">
            <span class="now money">{{ money(pv.now) }}</span><span v-if="pv.was" class="was money">{{ money(pv.was) }}</span
            ><span v-if="pv.save > 0" class="pd-save">{{ t("bakini.n.pd.save", "Save {amount} · {off}%", { amount: money(pv.save), off: pv.off }) }}</span>
          </div>
          <p v-if="dealEndsAt" class="pd-stock nx-pd-deal">{{ t("bakini.n.pd.dealEnds", "Deal ends in") }}{{ " " }}<bakini-deal-clock :end="dealEndsAt" mode="bare" /></p>
        </template>
        <s-product-section-tax></s-product-section-tax>

        <p :class="['pd-stock', { '-out': stock <= 0 }]">
          <i></i><span v-if="stock <= 0" class="pc-low">{{ t("bakini.n.pd.soldOut", "Sold out") }}</span
          ><span v-else-if="stock <= 5" class="pc-low">{{ t("bakini.n.pd.onlyLeft", "Only {n} left", { n: stock }) }}</span
          ><template v-else>{{ stockLine }}</template>
        </p>
        <p v-if="!has_original_warranty" class="pd-unit">{{ $t("product_info.fake") }}</p>

        <!-- Options: only for a product that really has them. -->
        <div v-if="tiles.length" class="pd-opt nx-pd-opt">
          <p class="pd-opt-h">
            {{ dimWord }}<template v-if="currentLabel">{{ " " }}<span class="muted">· {{ currentLabel }}</span></template>
          </p>
          <div :aria-label="dimWord" class="opt-tiles" role="radiogroup">
            <button
              v-for="tl in tiles"
              :key="tl.v.id"
              :aria-checked="current_variant && current_variant.id === tl.v.id ? 'true' : 'false'"
              :class="['opt-tile', { '-out': !(tl.v.quantity > 0) }]"
              role="radio"
              type="button"
              @click="current_variant = tl.v"
            >
              <span class="ot-ph"
                ><img v-if="tl.img" :src="tl.img" alt="" loading="lazy" /><i v-else-if="tl.swatch" :style="{ background: tl.swatch }" aria-hidden="true" class="nx-ot-sw"></i
              ></span>
              <span class="ot-n">{{ tl.label }}</span>
              <small v-if="tl.price !== null" class="ot-p money">{{ money(tl.price) }}</small>
            </button>
          </div>
        </div>
        <div v-else-if="product_variants.length" class="pd-opt nx-pd-opt nx-sd-variants">
          <s-product-section-variants
            v-model:current-variant="current_variant"
            v-model:filter="filter"
            v-model:selection-values="selection_values"
          ></s-product-section-variants>
        </div>

        <div class="nx-sd-more">
          <s-product-section-service v-model:preferences="preferences"></s-product-section-service>
          <s-product-section-valuation
            v-if="preferences && preferences.valuation"
            :correspondingBasketItem="corresponding_basket_item"
            :current-variant="current_variant"
            :preferences="preferences"
          ></s-product-section-valuation>
          <s-product-section-extra-pricings
            :current-variant="current_variant"
            :preferences="preferences"
            :quantity="corresponding_basket_item?.count"
            :selected-vendor-product="selected_vendor_product"
            @select="(val) => $refs.buy_section?.triggerBuyButton(val.min)"
          ></s-product-section-extra-pricings>
        </div>

        <div ref="add" class="pd-add">
          <nx-pd-qb
            v-if="simple"
            :label="t('bakini.n.pd.addPrice', 'Add to bag · {price}', { price: money(pv.now) })"
            :needs-choice="needsChoice"
            :product="$product"
            :variant="current_variant"
            size="big"
          />
          <s-product-section-buy-button
            v-else
            ref="buy_section"
            :can-buy="canBuy"
            :current-variant="current_variant"
            :hss-sticky-but-button="hssStickyButButton"
            :preferences="preferences"
            :quick-buy-mode="quickBuyMode"
            :selected-subscription-price="selected_subscription_price"
            :selected-vendor-product="selected_vendor_product"
            class="nx-sd-buy"
          ></s-product-section-buy-button>
        </div>

        <div class="pd-acts">
          <button class="btn tone" type="button" @click="compareNow"><nx-icon name="compare" />{{ t("bakini.n.pd.compare", "Compare") }}</button>
          <button class="btn ghost" type="button" @click="copyLink">
            <nx-icon :name="copied ? 'check' : 'link'" />{{ copied ? t("bakini.n.pd.copied", "Link copied") : t("bakini.n.pd.copy", "Copy link") }}
          </button>
        </div>

        <div v-if="lines.length" class="ilines pd-lines">
          <div v-for="l in lines" :key="l.key" class="iline">
            <nx-icon :name="l.icon" />
            <div>
              <b>{{ l.title }}</b><span v-if="l.line">{{ l.line }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- The phone's buy bar, once the Add box has scrolled away. -->
    <teleport to="body">
      <div class="nx nx-pdbar">
        <div :aria-hidden="barOn ? undefined : 'true'" :class="['pd-bar', { on: barOn }]">
          <div class="wrap pd-bar-in">
            <span class="th"><img v-if="photos[0]" :src="photos[0].thumb" alt="" /></span>
            <span class="pd-bar-t"
              ><b>{{ $product.title }}</b
              ><span
                ><span class="money">{{ money(pv.now) }}</span>{{ " " }}<span v-if="pv.was" class="was money">{{ money(pv.was) }}</span></span
              ></span
            >
            <nx-pd-qb v-if="simple" :label="t('bakini.n.pd.addToBag', 'Add to bag')" :needs-choice="needsChoice" :product="$product" :variant="current_variant" size="mid" />
            <button v-else class="btn" type="button" @click="toAdd">{{ t("bakini.n.pd.addToBag", "Add to bag") }}</button>
          </div>
        </div>
      </div>
    </teleport>
  </section>
</template>

<script>
import KalioProductOverview from "../../../kalio/product/KalioProductOverview.vue";
import BakiniDealClock from "../../BakiniDealClock.vue";
import NxIcon from "../NxIcon.vue";
import NxPdQb from "./NxPdQb.vue";
import { catOf, catTitle, hueOf, money, noir, priceView, unitOf } from "../noir";
import { deliveryLines, galleryOf, isEnglish, plural } from "./pd";
import { colourName, dealEnd, moneyOf, swatchBg, variantDimension } from "../../bakini";
import { currentCurrency } from "../../../region-switcher/region";
import { t } from "../../../kalio/i18n/kalio-i18n";

export default {
  name: "NxProductOverview",
  extends: KalioProductOverview,
  components: { BakiniDealClock, NxIcon, NxPdQb },

  data() {
    return { at: 0, copied: false, barOn: false, noir };
  },

  computed: {
    currency() {
      return currentCurrency();
    },
    hue() {
      return hueOf(this.$product?.category_id);
    },
    catName() {
      return catTitle(this.$product?.category || catOf(this.$product?.category_id));
    },
    unit() {
      return unitOf(this.$product);
    },
    pv() {
      void this.currency;
      return priceView(this.shop || this.$shop, this.$product, this.current_variant);
    },
    dealEndsAt() {
      return dealEnd(this.$product, this.current_variant);
    },
    photos() {
      return galleryOf(this.$product, this.current_variant);
    },
    photo() {
      return this.photos[Math.min(this.at, this.photos.length - 1)] || null;
    },
    stock() {
      const n = this.current_variant ? this.current_variant.quantity : this.$product.quantity;
      return Number(n) || 0;
    },
    stockLine() {
      const n = this.stock;
      if (isEnglish()) return t("bakini.n.pd.inStockUnits", "In stock · {n} {units} left", { n, units: plural(this.unit, n) });
      return t("bakini.n.pd.inStockN", "In stock · {n} left", { n });
    },
    lines() {
      return deliveryLines(this.shop || this.$shop);
    },
    enabledVariants() {
      return this.product_variants.filter((v) => v.enable !== false && v.enable !== 0);
    },
    dimension() {
      return variantDimension(this.enabledVariants);
    },
    dimWord() {
      const k = this.dimension?.key;
      if (k === "color") return t("bakini.n.pd.colour", "Colour");
      const w = this.dimension?.word || t("bakini.n.pd.option", "Option");
      return w.charAt(0).toUpperCase() + w.slice(1);
    },
    /* One dimension: a tile per variant with its own photo and price. */
    tiles() {
      const d = this.dimension;
      if (!d || d.key === "mixed") return [];
      return this.enabledVariants.map((v) => {
        const own = v.pricing && v.price != null;
        return {
          v,
          img: v.image ? window.CDN.GET_SHOP_IMAGE_PATH(v.image, 128) : d.key === "color" ? null : window.CDN.GET_SHOP_IMAGE_PATH(this.$product.icon, 128),
          swatch: d.key === "color" ? swatchBg(v.color) : null,
          label: d.key === "color" ? colourName(v.color) || t("bakini.n.pd.colour", "Colour") : v[d.key],
          price: own ? moneyOf(this.shop, this.$product, v, this.currency).now : null,
        };
      });
    },
    currentLabel() {
      const x = this.tiles.find((y) => this.current_variant && y.v.id === this.current_variant.id);
      return x ? x.label : "";
    },
    needsChoice() {
      return this.product_variants.length > 0 && !this.current_variant;
    },
    /* A plain product: the quantity box; anything Selldone's own button
       knows more about keeps that button. */
    simple() {
      const p = this.$product;
      if (!p || this.isSubscription) return false;
      if ((p.type || "PHYSICAL") !== "PHYSICAL") return false;
      if (this.preferences && (this.preferences.valuation || this.preferences.service)) return false;
      if (p.valuation || (p.extra_pricings && p.extra_pricings.length)) return false;
      return true;
    },
    comparing() {
      return (this.$store.getters.getProductsComparison || []).some((p) => p.id === this.$product.id);
    },
  },

  watch: {
    "$product.id"() {
      this.at = 0;
      this.copied = false;
    },
    "current_variant.id"() {
      this.at = 0;
    },
  },

  mounted() {
    if (typeof IntersectionObserver !== "undefined" && this.$refs.add) {
      this.io = new IntersectionObserver(
        (entries) => {
          const e = entries[entries.length - 1];
          this.barOn = !!e && !e.isIntersecting && e.boundingClientRect.bottom < 0;
        },
        { threshold: 0 },
      );
      this.io.observe(this.$refs.add);
    }
  },

  beforeUnmount() {
    this.io?.disconnect();
    clearTimeout(this.copyTimer);
  },

  methods: {
    t,
    money,
    /* Add this pastry to Selldone's comparison and open the Layout's compare
       page: what the shopper already compares, else this with two of its own
       collection's best sellers. */
    compareNow() {
      if (!this.comparing) this.addToProductComparison(this.$product, this.current_variant, true);
      const stored = (this.$store.getters.getProductsComparison || []).map((p) => ({ p: p.id, v: p.variant?.id || null }));
      let refs = stored.filter((r) => r.p !== this.$product.id);
      refs.unshift({ p: this.$product.id, v: this.current_variant?.id || null });
      if (refs.length < 2) {
        const mates = this.noir.products
          .filter((p) => p.category_id === this.$product.category_id && p.id !== this.$product.id)
          .sort((a, b) => (b.sells || 0) - (a.sells || 0))
          .slice(0, 2);
        refs = refs.concat(mates.map((p) => ({ p: p.id, v: null })));
      }
      const list = refs
        .slice(0, 4)
        .map((r) => `p${r.p}${r.v ? `v${r.v}` : ""}`)
        .join("_");
      this.$router.push({ name: window.$storefront.routes.COMPARISON_PAGE, query: { list } });
    },
    copyLink() {
      const url = window.location.href;
      const done = () => {
        this.copied = true;
        clearTimeout(this.copyTimer);
        this.copyTimer = setTimeout(() => (this.copied = false), 1600);
      };
      try {
        navigator.clipboard.writeText(url).then(done, done);
      } catch {
        done();
      }
    },
    toAdd() {
      this.$refs.add?.scrollIntoView({ behavior: "smooth", block: "center" });
    },
  },
};
</script>
