<!--
  Bakini Noir — the quantity box for a line already in the bag (the drawer,
  the bag page): − n + in the soft style. It steps the bag's own line through
  kalio-basket's queue (a tap shows at once; quick taps are never lost); "−"
  at 1 takes the line out.
-->
<template>
  <div :data-q="n" class="qb soft">
    <button
      :aria-label="n > 1 ? t('bakini.n.qb.less', 'Remove one {name}', { name }) : t('bakini.n.qb.remove', 'Remove {name} from the bag', { name })"
      class="m"
      type="button"
      @click.prevent.stop="step(-1)"
    >
      <nx-icon :name="n > 1 ? 'minus' : 'trash'" />
    </button>
    <span aria-live="polite" class="n">{{ n }}</span>
    <button
      :aria-disabled="n >= max ? 'true' : undefined"
      :aria-label="t('bakini.n.qb.more', 'Add one {name} to bag', { name })"
      :title="n >= max ? t('bakini.n.qb.noMore', 'No more in stock') : undefined"
      class="p"
      type="button"
      @click.prevent.stop="n < max && step(1)"
    >
      <nx-icon name="plus" />
    </button>
  </div>
</template>

<script>
import NxIcon from "./NxIcon.vue";
import { shownCount, stepTo } from "../../kalio/kalio-basket";
import { t } from "../../kalio/i18n/kalio-i18n";

export default {
  name: "NxLineQb",
  components: { NxIcon },
  props: { item: { type: Object, required: true } },
  computed: {
    product() {
      return this.item.product || { id: this.item.product_id };
    },
    name() {
      return this.product.title || "";
    },
    n() {
      return shownCount(this.product, this.item);
    },
    max() {
      const q = this.item.vendor_product?.quantity ?? this.item.variant?.quantity ?? this.item.product?.quantity;
      return Number.isFinite(Number(q)) && Number(q) > 0 ? Number(q) : 99;
    },
  },
  methods: {
    t,
    step(d) {
      stepTo(this, { id: this.item.product_id, type: this.item.product?.type }, this.item, this.n + d);
    },
  },
};
</script>
