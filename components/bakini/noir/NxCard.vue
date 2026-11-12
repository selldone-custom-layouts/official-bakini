<!--
  Bakini Noir — the product card (b/core.js card()): the cut-out pastry
  floating on a dark plate under its collection's warm halo, a round + in the
  free corner beside it (− n + in place), then the name (two lines at most),
  "per <unit>" (and "Only n left" when five or fewer), the price large with
  the struck was-price, and the saving in gold. The card takes its shape from
  its own width (a container query in the mockup's CSS): narrow cards stack,
  a wide one puts the plate beside the words.

  look: a quick-look button (the eye) in the plate's top corner.
-->
<template>
  <article :class="['pc', { 'has-look': look }, cls]" :style="{ '--bk-hue': hue }">
    <div class="pc-in">
      <div class="pc-plate">
        <router-link :to="to" aria-hidden="true" class="pc-ph" tabindex="-1">
          <img
            :loading="eager ? 'eager' : 'lazy'"
            :src="img"
            :srcset="srcset"
            alt=""
            class="cut"
            decoding="async"
            height="640"
            sizes="(max-width: 760px) 46vw, 260px"
            width="640"
            @error="dropSrcset"
          />
        </router-link>
        <button
          v-if="look"
          :aria-label="t('bakini.n.card.look', 'Quick look: {name}', { name: product.title })"
          :title="t('bakini.n.card.lookShort', 'Quick look')"
          aria-controls="qv"
          class="pc-look"
          type="button"
          @click="quick($event)"
        >
          <nx-icon name="eye" />
        </button>
        <div class="pc-qb"><nx-qb :product="product" /></div>
      </div>
      <div class="pc-body">
        <router-link :to="to" class="pc-name">{{ product.title }}</router-link>
        <div class="pc-unit">
          {{ t("bakini.n.card.per", "per {unit}", { unit: unit }) }}<template v-if="low"> · <span class="pc-low">{{ t("bakini.n.card.onlyLeft", "Only {n} left", { n: product.quantity }) }}</span></template
          ><template v-else-if="soldOut"> · <span class="pc-low">{{ t("bakini.n.card.soldOut", "Sold out") }}</span></template>
        </div>
        <div class="pc-price">
          <span class="now money">{{ money(pv.now) }}</span><span v-if="pv.was" class="was money">{{ money(pv.was) }}</span>
        </div>
        <div v-if="pv.save > 0" class="pc-save">{{ t("bakini.n.card.save", "Save {amount} · {off}%", { amount: money(pv.save), off: pv.off }) }}</div>
        <slot name="extra"></slot>
      </div>
    </div>
  </article>
</template>

<script>
import NxIcon from "./NxIcon.vue";
import NxQb from "./NxQb.vue";
import { hueOf, money, openQuick, priceView, productImage, productTo, unitOf } from "./noir";
import { dropSrcset, productSrcset } from "../../kalio/kalio-catalog";
import { currentCurrency } from "../../region-switcher/region";
import { t } from "../../kalio/i18n/kalio-i18n";

export default {
  name: "NxCard",
  components: { NxIcon, NxQb },
  props: {
    product: { type: Object, required: true },
    look: Boolean,
    eager: Boolean,
    cls: { type: String, default: "" },
  },
  computed: {
    shop() {
      return this.$store.getters.getShop;
    },
    pv() {
      void currentCurrency();
      return priceView(this.shop, this.product);
    },
    hue() {
      return hueOf(this.product.category_id);
    },
    to() {
      return productTo(this.product);
    },
    img() {
      return productImage(this.product);
    },
    srcset() {
      return productSrcset(this.product);
    },
    unit() {
      return unitOf(this.product);
    },
    soldOut() {
      return !(this.product.quantity > 0);
    },
    low() {
      return this.product.quantity > 0 && this.product.quantity <= 5;
    },
  },
  methods: {
    t,
    money,
    dropSrcset,
    quick(e) {
      openQuick(this.product, e.currentTarget);
    },
  },
};
</script>
