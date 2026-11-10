<!--
  Medio — the Deal of the Day, wide.

  A yellow block with the saving in percent and "Ends in" over the days,
  hours, minutes and seconds left on this deal (its own end date, the picked
  colour's when that colour has its own pricing; no end date, no clock), the
  product big, its colours, the price, Add to cart and Compare, and "More top
  deals" beside it. The deal is one of the shop's biggest savings, a
  different one each day (medio.ts dealOfTheDay).
-->
<template>
  <section aria-label="Deal of the Day" class="md-dotd">
    <div class="md-dotd__badge">
      <small>Deal of the Day</small>
      <b v-if="off > 0">{{ off }}% off</b>
      <medio-deal-clock :end="dealEndsAt" mode="blocks" />
    </div>
    <router-link :to="productTo" class="md-dotd__img">
      <img :alt="product.title" :src="picture" :srcset="srcset" sizes="(max-width: 900px) 40vw, 320px" @error="dropSrcset" />
    </router-link>
    <div class="md-dotd__info">
      <span v-if="product.brand" class="md-brand">{{ product.brand }}</span>
      <router-link :to="productTo" class="md-dotd__t">{{ product.title }}</router-link>
      <div v-if="colours.length" :aria-label="`Colour of ${product.title}`" class="md-swrow -big" role="radiogroup">
        <button
          v-for="(v, i) in colours.slice(0, 6)"
          :key="i"
          :aria-checked="i === pick ? 'true' : 'false'"
          :aria-label="colourName(v.color)"
          :class="{ '-on': i === pick, '-out': v.quantity === 0 }"
          :style="{ '--sw': swatchBg(v.color) }"
          :title="colourName(v.color)"
          class="md-sw"
          role="radio"
          type="button"
          @click="pick = i"
        ></button>
      </div>
      <div v-else-if="chips.length" class="md-caps"><span v-for="c in chips.slice(0, 4)" :key="c">{{ c }}</span></div>
      <div class="md-price -lg">
        <u-price :amount="money.now" :currency="currency" class="md-price__now" />
        <span v-if="money.save > 0" class="md-save">Save {{ moneyWhole(money.save) }}</span>
      </div>
      <div class="md-was"><template v-if="money.was">Was <s><u-price :amount="money.was" :currency="currency" /></s></template></div>
      <div class="md-dotd__buy">
        <div v-if="shown > 0" :class="{ '-busy': busy }" aria-label="Quantity in cart" class="md-step" role="group">
          <button :aria-label="shown > 1 ? 'One fewer' : 'Remove from cart'" type="button" @click="step(-1)"><span class="ms">{{ shown > 1 ? "remove" : "delete" }}</span></button>
          <output aria-live="polite"><b>{{ shown }}</b><small> in cart</small></output>
          <button aria-label="One more" type="button" @click="step(1)"><span class="ms">add</span></button>
        </div>
        <button v-else-if="soldOut" class="md-btn -off" disabled type="button">Out of stock</button>
        <button v-else-if="choose" class="md-btn" type="button" @click="$emit('quick-buy', product)"><span class="ms">tune</span>Choose {{ dimension.word }}</button>
        <button v-else class="md-btn" type="button" @click="add"><span class="ms">add_shopping_cart</span>Add to cart</button>
        <button :aria-pressed="comparing ? 'true' : 'false'" :class="{ '-on': comparing }" class="md-link" type="button" @click="toggleCompare">
          <span class="ms">{{ comparing ? "check_box" : "compare_arrows" }}</span>{{ comparing ? "Comparing" : "Compare" }}
        </button>
      </div>
    </div>
    <div v-if="more.length" class="md-dotd__more">
      <h3>More top deals</h3>
      <router-link v-for="p in more" :key="p.id" :to="{ name: window.$storefront.routes.PRODUCT_PAGE, params: { product_id: p.id } }" class="md-mini">
        <span class="md-mini__ph"><img :src="thumb(p)" alt="" loading="lazy" /></span>
        <span><b>{{ p.title }}</b><em><u-price :amount="nowOf(p).now" :currency="currency" /><s v-if="nowOf(p).was"><u-price :amount="nowOf(p).was" :currency="currency" /></s></em></span>
      </router-link>
    </div>
  </section>
</template>

<script>
import BuyMixin from "./medio-buy";
import { dropSrcset, productSrcset } from "../kalio/kalio-catalog";
import MedioDealClock from "./MedioDealClock.vue";
import { moneyOf } from "./medio";

export default {
  name: "MedioDealOfDay",
  components: { MedioDealClock },
  mixins: [BuyMixin],
  props: {
    product: { type: Object, required: true },
    more: { type: Array, default: () => [] },
  },
  computed: {
    picture() {
      return this.pictureIcon ? window.CDN.GET_SHOP_IMAGE_PATH(this.pictureIcon, null) : null;
    },
    srcset() {
      return productSrcset(this.product, this.variant?.image || null);
    },
  },
  methods: {
    dropSrcset,
    thumb(p) {
      return window.CDN.GET_SHOP_IMAGE_PATH(p.icon, 128);
    },
    nowOf(p) {
      return moneyOf(this.shop, p, null, this.currency);
    },
  },
};
</script>
