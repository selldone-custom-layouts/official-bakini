<!--
  Bakini Noir — "Buy together" on the product page (b/pages-product.js bt2):
  this pastry with the best seller of the two best-selling other
  collections, each a tick box (all ticked), the live total with the struck
  full price and the saving, and one button that puts the ticked pieces in
  the bag (kalio-basket's queue; the button itself says it worked).
-->
<template>
  <section v-if="items.length > 1" class="sec tight">
    <div class="wrap">
      <div class="bt2">
        <div class="bt2-hd">
          <p class="eyebrow">{{ t("bakini.n.pd.togetherEyebrow", "Buy together") }}</p>
          <h2 class="serif">{{ t("bakini.n.pd.togetherH", "Complete the") }}{{ " " }}<em>{{ t("bakini.n.pd.togetherHem", "plate.") }}</em></h2>
          <p class="muted">{{ lede }}</p>
        </div>
        <div class="bt2-items">
          <template v-for="(x, i) in items" :key="x.p.id">
            <span v-if="i > 0" aria-hidden="true" class="bt2-plus">+</span>
            <label :style="{ '--bk-hue': hueOf(x.p.category_id) }" class="bt2-it">
              <span class="check"
                ><input v-model="picked[x.p.id]" :aria-label="x.p.title" type="checkbox" /><span class="bx"><nx-icon name="check" /></span
              ></span>
              <span class="bt2-ph"><img :src="img(x.p)" alt="" class="cut" loading="lazy" /></span>
              <span class="bt2-tx">
                <span class="bt2-k">{{ i === 0 ? t("bakini.n.pd.thisUnit", "This {unit}", { unit: unitOf(x.p).toLowerCase() }) : catTitle(catOf(x.p.category_id)) }}</span>
                <b>{{ x.p.title }}</b>
                <span
                  ><span class="money">{{ money(x.v.now) }}</span>{{ " " }}<span v-if="x.v.was" class="was money">{{ money(x.v.was) }}</span></span
                >
              </span>
            </label>
          </template>
        </div>
        <div class="bt2-sum">
          <div class="bt2-tot">
            <span class="muted"
              ><template v-if="chosen.length"
                >{{ t("bakini.n.pd.pieces", { one: "{n} piece", other: "{n} pieces" }, { n: chosen.length }) }}<template v-if="sum.save > 0">
                  · <span class="was money">{{ money(sum.was) }}</span></template
                ></template
              ><template v-else>{{ t("bakini.n.pd.nothing", "Nothing selected") }}</template></span
            >
            <span class="serif money">{{ money(sum.now) }}</span>
            <span class="gold">{{ chosen.length && sum.save > 0 ? t("bakini.n.pd.youSave", "You save {amount}", { amount: money(sum.save) }) : "" }}</span>
          </div>
          <button :disabled="!chosen.length || busy" class="btn lg" type="button" @click="addAll">
            <nx-icon :name="done ? 'check' : 'bag'" />{{
              done ? t("bakini.n.pd.inBag", "In your bag") : chosen.length === items.length ? addAllLabel : t("bakini.n.pd.addSelected", "Add selected")
            }}
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import NxIcon from "../NxIcon.vue";
import { catOf, catTitle, hueOf, loadNoir, money, noir, priceView, productImage, unitOf } from "../noir";
import { numberWord, togetherFor } from "./pd";
import { addCount } from "../../../kalio/kalio-basket";
import { currentCurrency } from "../../../region-switcher/region";
import { t } from "../../../kalio/i18n/kalio-i18n";

export default {
  name: "NxTogether",
  components: { NxIcon },
  props: {
    product: { type: Object, required: true },
    variant: { type: Object, default: null },
  },
  data: () => ({ noir, picked: {}, busy: false, done: false }),
  computed: {
    shop() {
      return this.$store.getters.getShop;
    },
    /* The page's product needs a chosen option before it can join. */
    mainReady() {
      return !(this.product.product_variants || []).length || !!this.variant;
    },
    items() {
      void currentCurrency();
      void this.noir.products.length;
      const list = [{ p: this.product, variant: this.variant }].concat(togetherFor(this.product).map((p) => ({ p, variant: null })));
      return list.map((x) => ({ ...x, v: priceView(this.shop, x.p, x.variant) }));
    },
    chosen() {
      return this.items.filter((x) => this.picked[x.p.id] && (x.p.id !== this.product.id || this.mainReady));
    },
    sum() {
      let now = 0;
      let was = 0;
      for (const x of this.chosen) {
        now += x.v.now;
        was += x.v.was || x.v.now;
      }
      return { now, was, save: Math.max(0, was - now) };
    },
    addAllLabel() {
      const n = this.items.length;
      if (n === 2) return t("bakini.n.pd.addBoth", "Add both");
      return t("bakini.n.pd.addAllN", "Add all {n}", { n: numberWord(n).toLowerCase() });
    },
    lede() {
      const n = this.items.length - 1;
      const unit = unitOf(this.product).toLowerCase();
      if (n === 1) return t("bakini.n.pd.togetherLede1", "This {unit} with one piece from another collection.", { unit });
      return t("bakini.n.pd.togetherLeden", "This {unit} with {n} pieces from other collections.", { unit, n: numberWord(n).toLowerCase() });
    },
  },
  watch: {
    items: {
      handler(list) {
        const next = { ...this.picked };
        for (const x of list) if (!(x.p.id in next)) next[x.p.id] = true;
        this.picked = next;
      },
      immediate: true,
    },
    "product.id"() {
      this.picked = {};
      this.done = false;
    },
  },
  created() {
    loadNoir();
  },
  beforeUnmount() {
    clearTimeout(this.timer);
  },
  methods: {
    t,
    money,
    hueOf,
    catOf,
    catTitle,
    unitOf,
    img(p) {
      return productImage(p, 128);
    },
    async addAll() {
      if (!this.chosen.length) return;
      this.busy = true;
      try {
        for (const x of this.chosen) await addCount(this, x.p, x.variant, 1);
        this.done = true;
        clearTimeout(this.timer);
        this.timer = setTimeout(() => (this.done = false), 1600);
      } finally {
        this.busy = false;
      }
    },
  },
};
</script>
