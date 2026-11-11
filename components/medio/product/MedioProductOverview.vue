<!--
  Medio — the top of a product page (digini-design/medio-product.html),
  after a big electronics retailer's:

  Left: the name and its badges (Deal, New, Best seller, "n% off": the deal
  and the shop's own tags), a white gallery card (the picture with round
  arrows, "1 / 8" under it, ONE row of thumbnails) and a key-spec grid
  (the first eight rows of the product's own flat spec).
  Right, a buy card that stays in view while the left scrolls:
    the price, a magenta "Save $X" and "Was $Y (until <the deal's end>)";
    the deal's own clock; the choice (colour or capacity tiles, the chosen
    one ringed and tinted, no tick); "Ways to pay" (static, honest words);
    offer rows with chevrons (compare, the deals' end date, free delivery
    when the shop's delivery has a threshold); a stock notice when few are
    left; "Other customers bought" (one related product at a time, arrows);
    the quantity and a big "Add to basket" ("− n +" once in the basket);
    Save for later and Share; the shop's delivery ways and the help rows
    (links to the shop's own pages); then "What you'll need to make it even
    better" (MedioAddons: real related products with tick boxes).
  After the buy button scrolls away: a bar at the top of the screen (the
  name, the price, Add to basket) on a computer, a buy bar at the foot on a
  phone (plain panels teleported to the body).

  In the quick-buy sheet (quickBuyMode) only the picture, the name, the
  price, the choice and the buy controls show. Every behaviour is Kalio's
  overview, which is Selldone's SProductOverview (extends): variants, stock,
  the basket. A product whose variants differ in more than one way keeps
  Selldone's own picker; a product with a service, valuation, subscription
  or extra pricing keeps Selldone's own buy button.
-->
<template>
  <div :class="{ '-quick': quickBuyMode }" class="md-pdp">
    <div class="md-pdp__left">
      <header v-if="!quickBuyMode" class="md-pdp__top">
        <h1 class="md-pdp__title">{{ $product.title }}</h1>
        <div class="md-pdp__badges">
          <span v-for="b in badges" :key="b.key" :class="'-' + b.key" class="md-badge">{{ b.label }}</span>
          <span v-if="off > 0" class="md-badge -off">{{ t("medio.card.pctOff", "{n}% off", { n: off }) }}</span>
          <router-link v-if="$product.brand" :to="brandTo" class="md-pdp__brand">{{ $product.brand }}</router-link>
          <span class="md-pdp__code">{{ t("medio.pdp.code", "Product code {code}", { code: String($product.sku || $product.id) }) }}</span>
        </div>
      </header>

      <!-- ▆▆▆▆ Gallery ▆▆▆▆ -->
      <section v-if="showCover" :aria-label="t('medio.pdp.images', 'Product images')" class="md-pcard md-pdp__media">
        <div class="md-gal">
          <s-shop-product-slide-show ref="gallery" :current-variant="current_variant" :vertical="false" />
          <template v-if="galN > 1">
            <button :aria-label="t('medio.pdp.prev', 'Previous picture')" class="md-arrow md-gal__prev" type="button" @click="galGo(-1)"><span class="ms md-chev">chevron_left</span></button>
            <button :aria-label="t('medio.pdp.next', 'Next picture')" class="md-arrow md-gal__next" type="button" @click="galGo(1)"><span class="ms md-chev">chevron_right</span></button>
          </template>
          <button :aria-label="t('medio.pdp.zoom', 'Zoom in')" class="md-round md-gal__zoom" type="button" @click="galZoom"><span class="ms">zoom_in</span></button>
        </div>
        <p v-if="galN > 1" aria-live="polite" class="md-gal__n">{{ galAt + 1 }} / {{ galN }}</p>
      </section>

      <!-- ▆▆▆▆ Key specs ▆▆▆▆ -->
      <section v-if="!quickBuyMode && keySpecs.length >= 4" :aria-label="t('medio.pdp.keySpecs', 'Key specifications')" class="md-pcard md-keyspec">
        <div v-for="s in keySpecs" :key="s.key" class="md-keyspec__c">
          <small>{{ s.key }}</small>
          <b>{{ s.value }}</b>
        </div>
      </section>
      <slot name="below"></slot>
    </div>

    <div class="md-pdp__right">
      <section class="md-pcard md-buycard">
        <h1 v-if="quickBuyMode" class="md-pdp__title -quick">{{ $product.title }}</h1>
        <p v-if="!has_original_warranty" class="md-pdp__warn">
          <span class="ms">error</span>{{ $t("product_info.fake") }}
        </p>

        <div v-if="isSubscription" class="md-pdp__sub">
          <s-subscription-price-select
            v-model="selected_subscription_price"
            :class="{ pen: !!corresponding_basket_item?.subscription_price_id || !!membership_subscribed_plan }"
            :disabled="!$product.quantity"
            :subscription-prices="subscription_prices"
            return-object
          ></s-subscription-price-select>
        </div>
        <template v-else>
          <div class="md-price -xl">
            <u-price :amount="money.now" :currency="currency" class="md-price__now" />
            <span v-if="money.save > 0" class="md-save">{{ t("medio.card.save", "Save {amount}", { amount: moneyWhole(money.save) }) }}</span>
          </div>
          <div v-if="money.save > 0" class="md-was">
            <span class="md-was__t">
              {{ t("medio.card.was", "Was") }} <s><u-price :amount="money.was" :currency="currency" /></s>
              <template v-if="dealEndsAt"> {{ t("medio.pdp.until", "(until {date})", { date: dateOf(dealEndsAt) }) }}</template>
            </span>
          </div>
          <!-- The deal's own end (the chosen variant's when it has its own
               pricing); no end date, no clock. -->
          <div v-if="dealEndsAt" class="md-pdp__deal">
            <span class="md-pdp__dealt"><span class="ms">schedule</span>{{ t("medio.card.dealEnds", "Deal ends in") }}</span>
            <medio-deal-clock :end="dealEndsAt" mode="blocks" />
          </div>
        </template>
        <s-product-section-tax></s-product-section-tax>

        <!-- ▆▆▆▆ The choice ▆▆▆▆ -->
        <div v-if="tiles.length" class="md-pdp__choice">
          <p class="md-lbl">
            {{ dimWord }}: <b>{{ currentLabel }}</b>
          </p>
          <div :aria-label="dimWord" :class="{ '-text': !tilesHavePhotos }" class="md-vtiles" role="radiogroup">
            <button
              v-for="tl in tiles"
              :key="tl.v.id"
              :aria-checked="current_variant && current_variant.id === tl.v.id ? 'true' : 'false'"
              :class="{ '-on': current_variant && current_variant.id === tl.v.id, '-out': !(tl.v.quantity > 0) }"
              class="md-vtile"
              role="radio"
              type="button"
              @click="current_variant = tl.v"
            >
              <span v-if="tilesHavePhotos" class="md-vtile__ph"><img :src="tl.img" alt="" loading="lazy" /></span>
              <span class="md-vtile__l">
                <i v-if="tl.swatch" :style="{ background: tl.swatch }" aria-hidden="true"></i>{{ tl.label }}
              </span>
              <small v-if="tl.price !== null"><u-price :amount="tl.price" :currency="currency" /></small>
              <small v-if="!(tl.v.quantity > 0)" class="-out">{{ t("medio.card.outOfStock", "Out of stock") }}</small>
            </button>
          </div>
        </div>
        <div v-else-if="product_variants.length" class="md-pdp__choice -selldone">
          <s-product-section-variants
            v-model:current-variant="current_variant"
            v-model:filter="filter"
            v-model:selection-values="selection_values"
          ></s-product-section-variants>
        </div>

        <template v-if="!quickBuyMode">
          <!-- ▆▆▆▆ Ways to pay (honest, static words: no credit product) ▆▆▆▆ -->
          <div class="md-paybox">
            <p class="md-paybox__h"><span class="ms">account_balance_wallet</span>{{ t("medio.pdp.waysPay", "Ways to pay") }}</p>
            <div class="md-paybox__row"><span class="ms">payments</span>{{ t("medio.pdp.payFull", "Pay in full at checkout") }}</div>
            <div class="md-paybox__row"><span class="ms">calendar_month</span>{{ t("medio.pdp.payParts", "Pay in parts at checkout where available") }}</div>
          </div>

          <!-- ▆▆▆▆ Offer rows ▆▆▆▆ -->
          <div class="md-offrows">
            <button class="md-offrow" type="button" @click="toggleCompare">
              <span class="ms">compare_arrows</span>
              <span>{{ comparing ? t("medio.card.inCompare", "Added to compare") : t("medio.card.compareSimilar", "Compare with similar products") }}</span>
              <span class="ms md-chev">chevron_right</span>
            </button>
            <router-link v-if="dealEndsAt" :to="dealsTo" class="md-offrow">
              <span class="ms">sell</span>
              <span>{{ t("medio.pdp.allDealsEnd", "This deal ends {date}: see every deal", { date: dateOf(dealEndsAt) }) }}</span>
              <span class="ms md-chev">chevron_right</span>
            </router-link>
            <button v-if="freeOver" class="md-offrow" type="button" @click="$emit('open', 'delivery')">
              <span class="ms">local_shipping</span>
              <span>{{ t("medio.pdp.freeOver", "Free delivery on orders over {amount}", { amount: moneyFrom(freeOver.amount, freeOver.currency, { short: 'auto' }) }) }}</span>
              <span class="ms md-chev">chevron_right</span>
            </button>
          </div>

          <!-- ▆▆▆▆ Notices ▆▆▆▆ -->
          <p v-if="stock > 0 && stock <= 5" class="md-notice"><span class="ms">warning</span>{{ t("medio.pdp.fewLeft", "Only {n} left — order soon", { n: stock }) }}</p>
          <p v-else-if="stock <= 0" class="md-notice -no"><span class="ms">block</span>{{ t("medio.pdp.outNow", "Out of stock right now") }}</p>

          <!-- ▆▆▆▆ Other customers bought ▆▆▆▆ -->
          <div v-if="others.length" class="md-others">
            <p class="md-others__h">{{ t("medio.pdp.others", "Other customers bought") }}</p>
            <div class="md-others__row">
              <button :aria-label="t('medio.scroll.back', 'Scroll back')" class="md-arrow -sm" type="button" @click="otherGo(-1)"><span class="ms md-chev">chevron_left</span></button>
              <router-link :to="toProduct(otherNow)" class="md-others__card">
                <span class="md-others__img"><img :src="thumb(otherNow)" alt="" loading="lazy" /></span>
                <span class="md-others__w">
                  <b>{{ otherNow.title }}</b>
                  <span class="md-others__p">
                    <u-price :amount="priceOf(otherNow).now" :currency="currency" />
                    <small v-if="priceOf(otherNow).save > 0" class="md-save">{{ t("medio.card.save", "Save {amount}", { amount: moneyWhole(priceOf(otherNow).save) }) }}</small>
                  </span>
                </span>
              </router-link>
              <button :aria-label="t('medio.scroll.next', 'Scroll forward')" class="md-arrow -sm" type="button" @click="otherGo(1)"><span class="ms md-chev">chevron_right</span></button>
            </div>
          </div>
        </template>

        <!-- ▆▆▆▆ Buy ▆▆▆▆ -->
        <div ref="buyCard" class="md-pdp__buy">
          <div class="md-pdp__more">
            <s-product-section-service v-model:preferences="preferences"></s-product-section-service>
            <s-product-section-valuation
              v-if="preferences && preferences.valuation"
              :correspondingBasketItem="corresponding_basket_item"
              :current-variant="current_variant"
              :preferences="preferences"
            ></s-product-section-valuation>
          </div>
          <s-product-section-extra-pricings
            :current-variant="current_variant"
            :preferences="preferences"
            :quantity="corresponding_basket_item?.count"
            :selected-vendor-product="selected_vendor_product"
            @select="(val) => $refs.buy_section?.triggerBuyButton(val.min)"
          ></s-product-section-extra-pricings>
          <kalio-basket-line
            v-if="canBuy && corresponding_basket_item"
            :line="corresponding_basket_item"
            :product="$product"
            :stock="current_variant ? current_variant.quantity : $product.quantity"
            class="md-pdp__line"
          />
          <!-- A plain physical product: the quantity, then Add to basket. -->
          <div v-else-if="simpleBuy" class="md-pdp__add">
            <label class="md-qty">
              <span class="k-sr">{{ t("medio.pdp.qty", "Quantity") }}</span>
              <select v-model.number="qty" :aria-label="t('medio.pdp.qty', 'Quantity')" :disabled="stock <= 0">
                <option v-for="n in qtyOptions" :key="n" :value="n">{{ n }}</option>
              </select>
              <span aria-hidden="true" class="ms">expand_more</span>
            </label>
            <button :disabled="stock <= 0 || adding" class="md-btn -buy" type="button" @click="addToCart">
              <span class="ms">shopping_basket</span>{{ stock > 0 ? t("medio.card.add", "Add to basket") : t("medio.card.outOfStock", "Out of stock") }}
            </button>
          </div>
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
            class="md-pdp__selldone-buy"
          ></s-product-section-buy-button>
        </div>

        <div class="md-pdp__acts">
          <button :aria-pressed="isSaved ? 'true' : 'false'" :class="{ '-on': isSaved }" class="md-later" type="button" @click="toggleSave">
            <span :class="{ fill: isSaved }" class="ms">favorite</span>{{ isSaved ? t("medio.card.saved", "Saved") : t("medio.card.saveLater", "Save for later") }}
          </button>
          <button v-if="!quickBuyMode" class="md-later" type="button" @click="share">
            <span class="ms">share</span>{{ shared ? t("medio.pdp.copied", "Link copied") : t("medio.pdp.share", "Share") }}
          </button>
        </div>

        <template v-if="!quickBuyMode">
          <!-- The shop's own delivery ways, and help rows (links to its pages). -->
          <div class="md-srows">
            <button v-for="w in ways" :key="w.key" class="md-srow" type="button" @click="$emit('open', 'delivery')">
              <span class="ms">{{ w.icon === "storefront" ? "storefront" : "local_shipping" }}</span>
              <span class="md-srow__w">
                <b>{{ wayWords(w).word }}</b>
                <small v-if="w.free">{{ t("medio.pdp.free", "Free") }}</small>
                <small v-else-if="w.freeOver">{{ t("medio.pdp.freeOverShort", "Free on orders over {amount}", { amount: moneyFrom(w.freeOver, w.currency, { short: "auto" }) }) }}</small>
                <small v-else>{{ t("medio.pdp.priceAtCheckout", "Its price shows at checkout, for your address") }}</small>
              </span>
              <span class="ms md-chev">chevron_right</span>
            </button>
            <button v-if="!ways.length" class="md-srow" type="button" @click="$emit('open', 'delivery')">
              <span class="ms">local_shipping</span>
              <span class="md-srow__w"><b>{{ t("medio.pdp.delivery", "Delivery") }}</b><small>{{ t("medio.pdp.deliveryAtCheckout", "Delivery options and prices are shown at checkout") }}</small></span>
              <span class="ms md-chev">chevron_right</span>
            </button>
            <!-- Selldone's stock nudge ("Almost out of stock…"), as a row of the
                 same list: one left edge, one icon box. -->
            <div v-if="incentHtml" class="md-srow -nudge">
              <span class="ms">{{ incentIcon }}</span><span class="md-srow__w" v-html="incentHtml"></span>
            </div>
            <router-link :to="{ name: window.$storefront.routes.SHOP_PROFILE_PAGE_TERMS }" class="md-srow">
              <span class="ms">assignment_return</span>
              <span class="md-srow__w"><b>{{ t("medio.pdp.returns", "Returns & refunds") }}</b><small>{{ t("medio.pdp.returnsL", "Our returns terms, in plain words") }}</small></span>
              <span class="ms md-chev">chevron_right</span>
            </router-link>
            <router-link :to="helpTo" class="md-srow">
              <span class="ms">support_agent</span>
              <span class="md-srow__w"><b>{{ t("medio.pdp.help", "Help & Support") }}</b><small>{{ t("medio.pdp.helpL", "Questions about this product? Ask us") }}</small></span>
              <span class="ms md-chev">chevron_right</span>
            </router-link>
          </div>
        </template>
        <!-- Selldone's nudge is read from here (hidden) and drawn in the list above. -->
        <s-product-section-incentivise
          ref="incent"
          :variant="current_variant"
          :vendorProduct="selected_vendor_product"
          class="md-incent-src"
        ></s-product-section-incentivise>
        <s-storefront-coupons-list :product-id="$product.id" :variant-id="current_variant ? current_variant.id : undefined"></s-storefront-coupons-list>
        <router-link v-if="quickBuyMode" :to="productTo" class="md-link md-pdp__full">{{ t("medio.pdp.full", "See full details") }}<span class="ms md-chev">chevron_right</span></router-link>
      </section>

      <medio-addons v-if="!quickBuyMode" :product="$product" :variant="current_variant" />
    </div>

    <!-- A computer: a bar at the top once the buy button has scrolled away. -->
    <teleport to="body">
      <transition name="md-topbar">
        <div v-if="showTopBar" :aria-label="t('medio.pdp.buy', 'Buy')" :dir="rtl ? 'rtl' : 'ltr'" class="md-topbar" role="region">
          <div class="md-wrap md-topbar__in">
            <span class="md-topbar__img"><img :src="thumb($product)" alt="" /></span>
            <b class="md-topbar__t">{{ $product.title }}</b>
            <u-price :amount="money.now" :currency="currency" class="md-topbar__p" />
            <router-link v-if="corresponding_basket_item" :to="cartTo" class="md-btn">
              <span class="ms">shopping_basket</span>{{ t("medio.pdp.inBasketGo", "{n} in basket · Checkout", { n: corresponding_basket_item.count }) }}
            </router-link>
            <button v-else-if="simpleBuy" :disabled="stock <= 0 || adding" class="md-btn" type="button" @click="addToCart">
              <span class="ms">shopping_basket</span>{{ stock > 0 ? t("medio.card.add", "Add to basket") : t("medio.card.outOfStock", "Out of stock") }}
            </button>
            <button v-else class="md-btn" type="button" @click="toBuy">{{ t("medio.card.choose", "Choose options") }}</button>
          </div>
        </div>
      </transition>
    </teleport>

    <!-- A phone: a buy bar at the foot of the screen once the buy button
         has scrolled away. -->
    <teleport to="body">
      <transition name="md-bar">
        <div v-if="showBar" :aria-label="t('medio.pdp.buy', 'Buy')" :dir="rtl ? 'rtl' : 'ltr'" class="md-buybar" role="region">
          <div class="md-buybar__p">
            <u-price :amount="money.now" :currency="currency" class="md-buybar__now" />
            <small v-if="money.save > 0">{{ t("medio.card.save", "Save {amount}", { amount: moneyWhole(money.save) }) }}</small>
          </div>
          <router-link v-if="corresponding_basket_item" :to="cartTo" class="md-btn md-buybar__go">
            <span class="ms">shopping_basket</span>{{ t("medio.pdp.inBasketGo", "{n} in basket · Checkout", { n: corresponding_basket_item.count }) }}
          </router-link>
          <button v-else-if="simpleBuy" :disabled="stock <= 0 || adding" class="md-btn md-buybar__go" type="button" @click="addToCart">
            {{ stock > 0 ? t("medio.card.add", "Add to basket") : t("medio.card.outOfStock", "Out of stock") }}
          </button>
          <button v-else class="md-btn md-buybar__go" type="button" @click="toBuy">{{ t("medio.card.choose", "Choose options") }}</button>
        </div>
      </transition>
    </teleport>

    <basket-item-user-message-form
      v-if="basket"
      :basket="basket"
      :product="$product"
      :variant-id="current_variant ? current_variant.id : null"
      class="md-pdp__note"
    ></basket-item-user-message-form>
  </div>
</template>

<script>
import { currentCurrency, isRtl, money as moneyFrom } from "../../region-switcher/region";
import KalioProductOverview from "../../kalio/product/KalioProductOverview.vue";
import MedioDealClock from "../MedioDealClock.vue";
import MedioAddons from "./MedioAddons.vue";
import { addCount } from "../../kalio/kalio-basket";
import { dealsRoute } from "../../kalio/kalio-catalog";
import { freeShippingFrom, waysOf } from "../../walio/walio-home";
import { specRows } from "./medio-spec";
import { badgesOf, brandRoute, colourName, dealEnd, moneyOf, moneyText, readTagIndex, saved, swatchBg, toggleSaved, variantDimension, wayWords } from "../medio";
import { formatDate, t } from "../../kalio/i18n/kalio-i18n";
import { percentOff } from "../../kalio/kalio-catalog";

export default {
  name: "MedioProductOverview",
  extends: KalioProductOverview,
  components: { MedioDealClock, MedioAddons },

  props: {
    /** Related products for "Other customers bought" (the page reads them). */
    related: { type: Array, default: () => [] },
  },
  emits: ["open"],

  data() {
    return {
      compact: false,
      qty: 1,
      adding: false,
      galAt: 0,
      galN: 0,
      incentRaw: "",
      buyInView: true,
      buyAbove: false,
      other_at: 0,
      shared: false,
    };
  },

  computed: {
    rtl() {
      return isRtl();
    },
    currency() {
      return currentCurrency();
    },
    productTo() {
      return { name: window.$storefront.routes.PRODUCT_PAGE, params: { product_id: this.$product.id } };
    },
    brandTo() {
      return brandRoute(this.$product.brand);
    },
    dealsTo() {
      return dealsRoute();
    },
    helpTo() {
      return this.$router.hasRoute("ShopFAQ") ? { name: "ShopFAQ" } : { name: window.$storefront.routes.SHOP_CONTACT_US };
    },
    ways() {
      return waysOf(this.shop || this.$shop).slice(0, 3);
    },
    freeOver() {
      return freeShippingFrom(this.shop || this.$shop);
    },
    badges() {
      return badgesOf(this.$product, false).map((b) => ({
        ...b,
        label: b.key === "new" ? t("medio.badge.new", "New") : b.key === "best" ? t("medio.badge.best", "Best seller") : b.label,
      })).concat(this.money.save > 0 ? [{ key: "deal", label: t("medio.badge.deal", "Deal") }] : []);
    },
    off() {
      if (this.money.was) return Math.round((this.money.save / this.money.was) * 100);
      return percentOff(this.shop || this.$shop, this.$product);
    },
    keySpecs() {
      return specRows(this.$product).slice(0, 8);
    },
    enabledVariants() {
      return this.product_variants.filter((v) => v.enable !== false && v.enable !== 0);
    },
    dimension() {
      return variantDimension(this.enabledVariants);
    },
    dimWord() {
      const k = this.dimension?.key;
      if (k === "color") return t("medio.pdp.colour", "Colour");
      if (k === "volume") return t("medio.pdp.capacity", "Capacity");
      const w = this.dimension?.word || t("medio.pdp.option", "Option");
      return w[0].toUpperCase() + w.slice(1);
    },
    /* One dimension: a tile per variant with its own photo and price. */
    tiles() {
      const d = this.dimension;
      if (!d || d.key === "mixed") return [];
      return this.enabledVariants.map((v) => {
        const own = v.pricing && v.price != null;
        return {
          v,
          img: window.CDN.GET_SHOP_IMAGE_PATH(v.image || this.$product.icon, 128),
          swatch: d.key === "color" ? swatchBg(v.color) : null,
          label: d.key === "color" ? colourName(v.color) || t("medio.pdp.colour", "Colour") : v[d.key],
          price: own ? moneyOf(this.shop, this.$product, v, this.currency).now : null,
        };
      });
    },
    tilesHavePhotos() {
      return this.dimension?.key === "color" || this.enabledVariants.some((v) => v.image);
    },
    currentLabel() {
      const x = this.tiles.find((y) => this.current_variant && y.v.id === this.current_variant.id);
      return x ? x.label : "";
    },
    money() {
      return moneyOf(this.shop, this.$product, this.current_variant, this.currency);
    },
    dealEndsAt() {
      return dealEnd(this.$product, this.current_variant);
    },
    stock() {
      if (this.current_variant) return this.current_variant.quantity || 0;
      return this.$product.quantity || 0;
    },
    others() {
      return (this.related || []).filter((p) => p && p.id !== this.$product.id && p.icon).slice(0, 8);
    },
    otherNow() {
      return this.others[this.other_at % Math.max(1, this.others.length)];
    },
    incentLead() {
      const m = this.incentRaw.match(/^(\p{Extended_Pictographic}️?)\s*/u);
      return m ? m[1] : "";
    },
    incentHtml() {
      return this.incentRaw.replace(/^(\p{Extended_Pictographic}️?)\s*/u, "").trim();
    },
    incentIcon() {
      const e = this.incentLead;
      if (/[⌛⏳]/u.test(e)) return "hourglass_bottom";
      if (/\u{1F6D2}/u.test(e)) return "shopping_basket";
      if (/\u{1F525}/u.test(e)) return "local_fire_department";
      if (/⚡/u.test(e)) return "bolt";
      return "trending_up";
    },
    canBar() {
      return !this.quickBuyMode && !this.isSubscription && (this.simpleBuy || !!this.corresponding_basket_item);
    },
    showBar() {
      return this.compact && this.canBar && !this.buyInView;
    },
    showTopBar() {
      return !this.compact && this.canBar && !this.buyInView && this.buyAbove;
    },
    cartTo() {
      return { name: window.$storefront.routes.BASKET_PAGE, params: { type: (this.$product.type || "PHYSICAL").toUpperCase() } };
    },
    /* A plain physical product gets Medio's quantity menu and Add to basket;
       anything Selldone's own button knows more about keeps that button. */
    simpleBuy() {
      const p = this.$product;
      if (!this.canBuy || !p || this.isSubscription) return false;
      if ((p.type || "PHYSICAL") !== "PHYSICAL") return false;
      if (this.preferences && (this.preferences.valuation || this.preferences.service)) return false;
      if (p.valuation || (p.extra_pricings && p.extra_pricings.length)) return false;
      if (this.product_variants.length && !this.current_variant) return false;
      return true;
    },
    qtyOptions() {
      const max = Math.max(1, Math.min(10, this.stock || 1));
      return Array.from({ length: max }, (_, i) => i + 1);
    },
    comparing() {
      return (this.$store.getters.getProductsComparison || []).some((p) => p.id === this.$product.id);
    },
    isSaved() {
      return saved[this.$product.id] ?? !!this.$product.wishlist;
    },
  },

  created() {
    readTagIndex();
  },

  mounted() {
    /* Selldone's slideshow keeps its own index; Medio's arrows and counter
       follow it. */
    this.$watch(
      () => [this.$refs.gallery?.index ?? 0, this.$refs.gallery?.images_list_embedded?.length ?? 0],
      ([at, n]) => {
        this.galAt = at;
        this.galN = n;
      },
      { immediate: true },
    );
    /* Selldone's stock nudge: its words, without the leading emoji (drawn
       as an icon in the list instead). */
    this.$watch(
      () => (this.$refs.incent ? this.$refs.incent.message || "" : ""),
      (m) => (this.incentRaw = String(m || "").trim()),
      { immediate: true },
    );
    this.onResize();
    window.addEventListener("resize", this.onResize, { passive: true });
    /* The bars show while the buy button is out of view (the top bar only
       once it has scrolled up past it). */
    if (typeof IntersectionObserver !== "undefined" && this.$refs.buyCard) {
      this.buyIo = new IntersectionObserver(
        (entries) => {
          const e = entries[entries.length - 1];
          this.buyInView = !!e?.isIntersecting;
          this.buyAbove = !!e && !e.isIntersecting && e.boundingClientRect.top < 0;
        },
        { rootMargin: "0px 0px -40px 0px" },
      );
      this.buyIo.observe(this.$refs.buyCard);
    }
  },

  beforeUnmount() {
    this.buyIo?.disconnect();
    window.removeEventListener("resize", this.onResize);
  },

  watch: {
    "$product.id"() {
      this.other_at = 0;
      this.shared = false;
    },
  },

  methods: {
    t,
    wayWords,
    moneyFrom,
    onResize() {
      this.compact = window.innerWidth < 900;
    },
    moneyWhole(n) {
      return moneyText(n, this.currency, Math.round(n) === n);
    },
    dateOf(d) {
      return formatDate(d);
    },
    priceOf(p) {
      return moneyOf(this.shop || this.$shop, p, null, this.currency);
    },
    thumb(p) {
      return p?.icon ? window.CDN.GET_SHOP_IMAGE_PATH(p.icon, 128) : null;
    },
    toProduct(p) {
      return { name: window.$storefront.routes.PRODUCT_PAGE, params: { product_id: p.id } };
    },
    otherGo(d) {
      const n = this.others.length;
      if (!n) return;
      this.other_at = (this.other_at + d + n) % n;
    },
    toBuy() {
      this.$refs.buyCard?.scrollIntoView({ behavior: "smooth", block: "center" });
    },
    galGo(d) {
      const g = this.$refs.gallery;
      if (!g || !this.galN) return;
      g.index = (g.index + d + this.galN) % this.galN;
    },
    galZoom() {
      const el = this.$refs.gallery?.$el;
      (el?.querySelector(".v-window-item--active .swiper-slide-image") || el?.querySelector(".swiper-slide-image"))?.click();
    },
    addToCart() {
      this.adding = true;
      addCount(this, this.$product, this.current_variant, this.qty).finally(() => {
        this.adding = false;
        this.qty = 1;
      });
    },
    toggleCompare() {
      if (this.comparing) this.removeFromProductComparison(this.$product, null);
      else this.addToProductComparison(this.$product, this.current_variant, true);
    },
    toggleSave() {
      toggleSaved(this, this.$product);
    },
    /* The phone's share sheet when there is one, else the link is copied. */
    share() {
      const url = window.location.href;
      const done = () => {
        this.shared = true;
        setTimeout(() => (this.shared = false), 2500);
      };
      if (navigator.share) {
        navigator.share({ title: this.$product.title, url }).catch(() => {});
        return;
      }
      navigator.clipboard?.writeText(url).then(done, done);
    },
  },
};
</script>
