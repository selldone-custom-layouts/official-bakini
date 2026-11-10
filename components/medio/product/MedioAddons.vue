<!--
  Medio — "What you'll need to make it even better" on the product page:
  three real products from the shop that go with this one, each with a tick
  box, its price and saving, and one "Add n selected to basket". They are
  the merchant's own cross-sells when there are any; otherwise products
  from other departments that share one of this product's tags and cost
  less than it (the things you add to a purchase), else the best-priced
  ones from other departments. Each goes in with its first colour or
  capacity in stock. Nothing pops up; the button says when they are in.
-->
<template>
  <section v-if="items.length" aria-labelledby="md-addons-h" class="md-pcard md-addons">
    <h2 id="md-addons-h" class="md-addons__h">{{ t("medio.addons.h", "What you’ll need to make it even better") }}</h2>
    <label v-for="it in items" :key="it.p.id" :class="{ '-on': it.on }" class="md-addon">
      <input v-model="it.on" type="checkbox" />
      <i aria-hidden="true"><span class="ms">check</span></i>
      <span class="md-addon__img"><img :src="image(it)" alt="" loading="lazy" /></span>
      <span class="md-addon__w">
        <router-link :to="to(it.p)" class="md-addon__t">{{ it.p.title }}</router-link>
        <span class="md-addon__p">
          <u-price :amount="price(it).now" :currency="currency" />
          <small v-if="price(it).save > 0" class="md-save">{{ t("medio.card.save", "Save {amount}", { amount: whole(price(it).save) }) }}</small>
        </span>
      </span>
    </label>
    <button :disabled="!count || adding" class="md-btn -line -block md-addons__go" type="button" @click="addPicked">
      <template v-if="done"><span class="ms">check</span>{{ t("medio.addons.done", "Added to your basket") }}</template>
      <template v-else>{{ t("medio.addons.add", { one: "Add {n} selected to basket", other: "Add {n} selected to basket" }, { n: count }) }}</template>
    </button>
  </section>
</template>

<script>
import { currentCurrency } from "../../region-switcher/region";
import CurrencyMixin from "@selldone/components-vue/mixin/currency/CurrencyMixin.ts";
import { addVariant, mayBuy, quickAdd } from "../../kalio/kalio-basket";
import { catalogue, leadVariant, mixByCategory, moneyOf, moneyText, tagged } from "../medio";
import { t } from "../../kalio/i18n/kalio-i18n";

export default {
  name: "MedioAddons",
  mixins: [CurrencyMixin],
  props: {
    product: { type: Object, required: true },
    variant: { type: Object, default: null },
  },
  data: () => ({ items: [], adding: false, done: false }),
  computed: {
    shop() {
      return this.$store.getters.getShop;
    },
    currency() {
      return currentCurrency();
    },
    count() {
      return this.items.filter((it) => it.on).length;
    },
  },
  watch: {
    "product.id": {
      handler() {
        this.read();
      },
      immediate: true,
    },
  },
  methods: {
    t,
    variantOf(p) {
      const list = (p.product_variants || []).filter((v) => v.enable !== false);
      return leadVariant(p) || list.find((v) => v.quantity > 0) || null;
    },
    price(it) {
      return moneyOf(this.shop, it.p, it.v && it.v.id ? it.v : null, this.currency);
    },
    whole(n) {
      return moneyText(Math.round(n), this.currency, true);
    },
    image(it) {
      return window.CDN.GET_SHOP_IMAGE_PATH((it.v && it.v.image) || it.p.icon, 128);
    },
    to(p) {
      return { name: window.$storefront.routes.PRODUCT_PAGE, params: { product_id: p.id } };
    },
    async read() {
      this.done = false;
      const me = this.product;
      const [all, tags] = await Promise.all([catalogue(), tagged()]);
      if (this.product.id !== me.id) return;
      const rich = new Map(all.map((p) => [p.id, p]));
      const ok = (p) => p && p.id !== me.id && p.icon && p.quantity > 0 && p.category_id !== me.category_id;
      const mine = moneyOf(this.shop, me, null, this.currency).now;
      const seen = new Set();
      const out = [];
      const add = (p) => {
        if (!ok(p) || seen.has(p.id)) return;
        seen.add(p.id);
        out.push(p);
      };
      /* 1. the merchant's cross-sells */
      for (const c of me.cross_sells || []) add(rich.get((c.target || c.product || c)?.id) || c.target || c.product);
      /* 2. other departments sharing a tag, cheaper than this product */
      const myTags = [...tags.entries()].filter(([, list]) => list.some((p) => p.id === me.id)).map(([tg]) => tg);
      const cheaper = (p) => moneyOf(this.shop, p, null, this.currency).now < mine;
      for (const tg of myTags) for (const p of tags.get(tg) || []) if (cheaper(p)) add(rich.get(p.id) || p);
      /* 3. the best-priced ones from other departments */
      if (out.length < 3) {
        const rest = all.filter((p) => ok(p) && !seen.has(p.id) && cheaper(p)).sort((a, b) => moneyOf(this.shop, a, null, this.currency).now - moneyOf(this.shop, b, null, this.currency).now);
        mixByCategory(rest, 3 - out.length).forEach(add);
      }
      this.items = mixByCategory(out, 3).map((p, i) => ({ p, v: this.variantOf(p), on: i < 2 }));
    },
    async addPicked() {
      if (!mayBuy(this)) return;
      this.adding = true;
      try {
        for (const it of this.items.filter((x) => x.on)) {
          if (it.v && it.v.id) await addVariant(this, it.p, it.v);
          else await quickAdd(this, it.p, () => null);
        }
        this.done = true;
        setTimeout(() => (this.done = false), 2500);
      } finally {
        this.adding = false;
      }
    },
  },
};
</script>
