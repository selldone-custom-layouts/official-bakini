<!--
  Bakini Noir — the product page's quantity box (b/pages-product.js
  N.qb(p, "big", "Add to bag · $x")): the same .qb markup as the cards, but
  it follows the page's own chosen variant (Selldone's current_variant), so
  a product with real options adds the option the shopper picked. "+" at 0
  adds (kalio-basket addVariant: the guest gate, the queue), then − n + in
  place; quick taps are never lost. No toast: the box answers.
-->
<template>
  <div :class="['qb', size]" :data-q="q">
    <button :aria-label="t('bakini.n.pd.less', 'Remove one {name}', { name: product.title })" class="m" type="button" @click.prevent.stop="less">
      <nx-icon name="minus" />
    </button>
    <span aria-live="polite" class="n">{{ q }}</span>
    <button
      :aria-disabled="blocked ? 'true' : undefined"
      :aria-label="addAria"
      :title="full ? t('bakini.n.pd.noMore', 'No more in stock') : undefined"
      class="p"
      type="button"
      @click.prevent.stop="more"
    >
      <nx-icon name="plus" /><span class="lbl">{{ shownLabel }}</span>
    </button>
  </div>
</template>

<script>
import NxIcon from "../NxIcon.vue";
import { addVariant, basketLine, pendingLine, pendingLineFor, shownCount, stepTo } from "../../../kalio/kalio-basket";
import { t } from "../../../kalio/i18n/kalio-i18n";

export default {
  name: "NxPdQb",
  components: { NxIcon },
  props: {
    product: { type: Object, required: true },
    /** The page's chosen variant (null for a product without options). */
    variant: { type: Object, default: null },
    /** The product has options but none is chosen yet. */
    needsChoice: { type: Boolean, default: false },
    size: { type: String, default: "big" },
    label: { type: String, default: "" },
  },
  computed: {
    line() {
      const p = this.product;
      if (!p) return null;
      if (this.variant) return basketLine(this, p, { id: this.variant.id }) || pendingLineFor(p, this.variant.id);
      if (this.needsChoice) return null;
      return basketLine(this, p) || pendingLine(p);
    },
    q() {
      return shownCount(this.product, this.line);
    },
    stock() {
      const n = this.variant ? this.variant.quantity : this.product.quantity;
      return Number.isFinite(Number(n)) ? Number(n) : 0;
    },
    soldOut() {
      return !(this.stock > 0);
    },
    full() {
      return !this.soldOut && this.q >= this.stock;
    },
    blocked() {
      return this.soldOut || this.full || this.needsChoice;
    },
    shownLabel() {
      if (this.soldOut) return t("bakini.n.pd.soldOut", "Sold out");
      if (this.needsChoice) return t("bakini.n.pd.chooseFirst", "Choose an option");
      return this.label || t("bakini.n.pd.addToBag", "Add to bag");
    },
    addAria() {
      if (this.needsChoice) return t("bakini.n.pd.chooseFirst", "Choose an option");
      return t("bakini.n.pd.more", "Add one {name} to bag", { name: this.product.title });
    },
  },
  methods: {
    t,
    more() {
      if (this.blocked) return;
      if (!this.q || !this.line) return addVariant(this, this.product, this.variant);
      stepTo(this, this.product, this.line, this.q + 1);
    },
    less() {
      if (this.q > 0 && this.line) stepTo(this, this.product, this.line, this.q - 1);
    },
  },
};
</script>
