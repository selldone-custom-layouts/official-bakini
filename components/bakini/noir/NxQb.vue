<!--
  Bakini Noir — the quantity box (b/core.js qb()): "+" (or a labelled "Add"),
  then − n + in place, one element that is never replaced, so quick taps are
  never lost. The count is the bag's own line (kalio-basket's queue: a tap
  shows at once, the requests go out one at a time). A product with options
  opens the quick look instead ("Choose"). No toast: the box itself answers.

  size: "" (round +, the card's free corner), "mid", "big" (full width,
  "Add to bag · $3.15" while empty), "soft" (bag rows).
-->
<template>
  <div :class="['qb', size]" :data-q="q">
    <button :aria-label="t('bakini.n.qb.less', 'Remove one {name}', { name: product.title })" class="m" type="button" @click.prevent.stop="less">
      <nx-icon name="minus" />
    </button>
    <span aria-live="polite" class="n">{{ q }}</span>
    <button
      :aria-disabled="full ? 'true' : undefined"
      :aria-label="addLabel"
      :title="full ? t('bakini.n.qb.noMore', 'No more in stock') : undefined"
      class="p"
      type="button"
      @click.prevent.stop="more($event)"
    >
      <nx-icon name="plus" /><span class="lbl">{{ shownLabel }}</span>
    </button>
  </div>
</template>

<script>
import BuyMixin from "../bakini-buy";
import NxIcon from "./NxIcon.vue";
import { openQuick } from "./noir";
import { t } from "../../kalio/i18n/kalio-i18n";

export default {
  name: "NxQb",
  components: { NxIcon },
  mixins: [BuyMixin],
  props: {
    product: { type: Object, required: true },
    size: { type: String, default: "" },
    label: { type: String, default: "" },
  },
  computed: {
    q() {
      return this.choose ? 0 : this.shown || 0;
    },
    full() {
      if (this.soldOut) return true;
      const max = Number(this.variant ? this.variant.quantity : this.product.quantity);
      return Number.isFinite(max) && max > 0 && this.q >= max;
    },
    shownLabel() {
      if (this.soldOut) return t("bakini.n.qb.soldOut", "Sold out");
      if (this.choose) return t("bakini.n.qb.choose", "Choose");
      return this.label || (this.size === "big" ? t("bakini.n.qb.addToBag", "Add to bag") : t("bakini.n.qb.add", "Add"));
    },
    addLabel() {
      if (this.choose) return t("bakini.n.qb.chooseOf", "Choose options for {name}", { name: this.product.title });
      return t("bakini.n.qb.more", "Add one {name} to bag", { name: this.product.title });
    },
  },
  methods: {
    t,
    more(e) {
      if (this.full) return;
      if (this.choose) return openQuick(this.product, e.currentTarget);
      if (!this.q) return this.add();
      this.step(1);
    },
    less() {
      if (this.q > 0) this.step(-1);
    },
  },
};
</script>
