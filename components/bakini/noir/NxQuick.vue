<!--
  Bakini Noir — the quick look (b/core.js quickHTML()): a dialog (a bottom
  sheet on a phone) with the pastry on its plate, the collection, the name,
  "per <unit>" and the stock, the price with was and the saving, the first
  "why you'll love it" line, the quantity box and "View full details". ✕,
  Esc and a click on the scrim close it.
-->
<template>
  <div id="qv" :aria-label="p ? p.title : ''" :class="['dialog', { open }]" aria-modal="true" role="dialog" style="--bk-dw: 880px">
    <template v-if="p">
      <button :aria-label="t('bakini.n.qv.close', 'Close quick look')" class="iconbtn x" type="button" @click="close"><nx-icon name="close" /></button>
      <div :style="{ '--bk-hue': hueOf(p.category_id) }" class="qv">
        <div class="qv-stage">
          <div class="qv-ph"><img :alt="p.title" :src="img" class="cut" /></div>
        </div>
        <div class="qv-info">
          <p class="eyebrow">
            <bdi>{{ catTitle(catOf(p.category_id)) }}</bdi>
          </p>
          <h2 id="qv-t">{{ p.title }}</h2>
          <p class="muted">
            {{ t("bakini.n.card.per", "per {unit}", { unit: unitOf(p) }) }} ·
            <span v-if="p.quantity > 0 && p.quantity <= 5" class="pc-low">{{ t("bakini.n.card.onlyLeft", "Only {n} left", { n: p.quantity }) }}</span>
            <span v-else-if="p.quantity > 0">{{ t("bakini.n.qv.inStock", "In stock") }}</span>
            <span v-else class="pc-low">{{ t("bakini.n.card.soldOut", "Sold out") }}</span>
          </p>
          <div class="qv-price">
            <span class="now money">{{ money(pv.now) }}</span><span v-if="pv.was" class="was money">{{ money(pv.was) }}</span
            ><span v-if="pv.save > 0" class="save">{{ t("bakini.n.card.save", "Save {amount} · {off}%", { amount: money(pv.save), off: pv.off }) }}</span>
          </div>
          <p v-if="desc" class="qv-desc">{{ desc }}</p>
          <nx-qb :product="p" size="big" />
          <router-link :to="to" class="link" @click="close">{{ t("bakini.n.qv.details", "View full details") }}<nx-icon name="arrow" /></router-link>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import NxIcon from "./NxIcon.vue";
import NxQb from "./NxQb.vue";
import { catOf, catTitle, closeLayer, hueOf, layer, money, priceView, productImage, productTo, prosOf, unitOf } from "./noir";
import { currentCurrency } from "../../region-switcher/region";
import { t } from "../../kalio/i18n/kalio-i18n";

export default {
  name: "NxQuick",
  components: { NxIcon, NxQb },
  data: () => ({ layer }),
  computed: {
    open() {
      return this.layer.open === "qv";
    },
    p() {
      return this.layer.quick;
    },
    pv() {
      void currentCurrency();
      return priceView(this.$store.getters.getShop, this.p);
    },
    img() {
      return productImage(this.p);
    },
    to() {
      return productTo(this.p);
    },
    desc() {
      return (prosOf(this.p)[0] || [])[1] || "";
    },
  },
  methods: {
    t,
    money,
    hueOf,
    catOf,
    catTitle,
    unitOf,
    close() {
      closeLayer();
    },
  },
};
</script>
