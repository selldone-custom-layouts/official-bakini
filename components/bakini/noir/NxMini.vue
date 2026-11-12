<!--
  Bakini Noir — a compact product row (b/core.js miniRow()): the photo on a
  small plate, the name, the price with the struck was-price and the unit,
  and the + box. "Often added", "Start with a favourite".
-->
<template>
  <div :style="{ '--bk-hue': hueOf(product.category_id) }" class="mini">
    <router-link :to="to" aria-hidden="true" class="th" tabindex="-1"><img :src="img" alt="" class="cut" loading="lazy" /></router-link>
    <div style="min-width: 0">
      <b
        ><router-link :to="to">{{ product.title }}</router-link></b
      >
      <small
        ><span class="now money">{{ money(pv.now) }}</span> <span v-if="pv.was" class="was money">{{ money(pv.was) }}</span> ·
        {{ t("bakini.n.card.per", "per {unit}", { unit: unitOf(product) }) }}</small
      >
    </div>
    <nx-qb :product="product" />
  </div>
</template>

<script>
import NxQb from "./NxQb.vue";
import { hueOf, money, priceView, productImage, productTo, unitOf } from "./noir";
import { currentCurrency } from "../../region-switcher/region";
import { t } from "../../kalio/i18n/kalio-i18n";

export default {
  name: "NxMini",
  components: { NxQb },
  props: { product: { type: Object, required: true } },
  computed: {
    pv() {
      void currentCurrency();
      return priceView(this.$store.getters.getShop, this.product);
    },
    to() {
      return productTo(this.product);
    },
    img() {
      return productImage(this.product, 128);
    },
  },
  methods: { t, money, hueOf, unitOf },
};
</script>
