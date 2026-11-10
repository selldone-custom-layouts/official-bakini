<!--
  Medio — "Buy together and save" (product page): this product ("Currently
  viewing") and two more from other departments, each with a tick to leave
  it out, the total of the ticked ones, their deals' saving when there is
  one, and one "Add all to basket". The two come from the merchant's own
  cross-sells when there are any; otherwise from other departments that
  share one of this product's tags (deals first), else the best-priced ones
  from other departments. "and save" is said only when the ticked items
  really carry a saving. Each goes in with its first colour or capacity in
  stock. Nothing pops up.
-->
<template>
  <section v-if="items.length > 1" aria-labelledby="md-together-h" class="md-together">
    <h2 id="md-together-h" class="md-together__h">{{ saving > 0 ? t("medio.together.hSave", "Buy together and save") : t("medio.together.h", "Buy together") }}</h2>
    <div class="md-together__box">
      <div class="md-together__row">
        <template v-for="(it, i) in items" :key="it.p.id">
          <span v-if="i" aria-hidden="true" class="md-together__plus"><span class="ms">add</span></span>
          <div :class="{ '-off': !it.on }" class="md-together__it">
            <router-link :to="to(it.p)" class="md-together__img"><img :src="image(it.p)" alt="" loading="lazy" /></router-link>
            <label class="md-together__pick">
              <input v-model="it.on" type="checkbox" />
              <i aria-hidden="true"><span class="ms">check</span></i>
              <span class="md-together__w">
                <small v-if="!i" class="md-together__now">{{ t("medio.together.viewing", "Currently viewing") }}</small>
                <span class="md-together__t">{{ it.p.title }}</span>
              </span>
            </label>
            <span class="md-together__price">
              <u-price :amount="priceOf(it)" :currency="currency" />
              <small v-if="saveOf(it) > 0" class="md-save">{{ t("medio.card.save", "Save {amount}", { amount: whole(saveOf(it)) }) }}</small>
            </span>
          </div>
        </template>
      </div>
      <div class="md-together__sum">
        <span class="md-together__total">
          <small>{{ t("medio.together.total", { one: "Total for {n} item", other: "Total for {n} items" }, { n: count }) }}</small>
          <u-price :amount="total" :currency="currency" />
          <b v-if="saving > 0" class="md-save">{{ t("medio.card.save", "Save {amount}", { amount: whole(saving) }) }}</b>
        </span>
        <button :disabled="!count || adding" class="md-btn" type="button" @click="addAll">
          <template v-if="done"><span class="ms">check</span>{{ t("medio.addons.done", "Added to your basket") }}</template>
          <template v-else><span class="ms">shopping_basket</span>{{ t("medio.together.add", "Add {n} to basket", { n: count }) }}</template>
        </button>
      </div>
    </div>
  </section>
</template>

<script>
import { currentCurrency } from "../../region-switcher/region";
import CurrencyMixin from "@selldone/components-vue/mixin/currency/CurrencyMixin.ts";
import { addVariant, mayBuy, quickAdd } from "../../kalio/kalio-basket";
import { catalogue, moneyOf, moneyText, tagged } from "../medio";
import { t } from "../../kalio/i18n/kalio-i18n";

export default {
  name: "MedioTogether",
  mixins: [CurrencyMixin],
  props: {
    product: { type: Object, required: true },
  },
  data: () => ({ items: [], curated: false, adding: false, done: false }),
  computed: {
    shop() {
      return this.$store.getters.getShop;
    },
    currency() {
      return currentCurrency();
    },
    count() {
      return this.items.filter((x) => x.on).length;
    },
    total() {
      return this.items.filter((x) => x.on).reduce((s, x) => s + this.priceOf(x), 0);
    },
    saving() {
      return this.items.filter((x) => x.on).reduce((s, x) => s + this.saveOf(x), 0);
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
    saveOf(it) {
      return moneyOf(this.shop, it.p, it.v, this.currency).save || 0;
    },
    whole(n) {
      return moneyText(Math.round(n), this.currency, true);
    },
    firstVariant(p) {
      const list = (p.product_variants || []).filter((v) => v.enable !== false);
      return list.find((v) => v.quantity > 0) || null;
    },
    priceOf(it) {
      return moneyOf(this.shop, it.p, it.v, this.currency).now;
    },
    image(p) {
      return window.CDN.GET_SHOP_IMAGE_PATH(p.icon, 128);
    },
    to(p) {
      return { name: window.$storefront.routes.PRODUCT_PAGE, params: { product_id: p.id } };
    },
    async read() {
      this.done = false;
      const me = this.product;
      const all = await catalogue();
      const rich = new Map(all.map((p) => [p.id, p]));
      const base = rich.get(me.id) || me;
      const ok = (p) => p && p.id !== me.id && p.icon && p.quantity > 0;
      /* 1. the merchant's cross-sells */
      const cross = (me.cross_sells || [])
        .map((c) => c.target || c.product || c)
        .map((p) => rich.get(p?.id) || p)
        .filter(ok);
      let picks = cross.slice(0, 2);
      this.curated = picks.length >= 1;
      /* 2. other departments sharing a tag */
      if (picks.length < 2) {
        const tags = await tagged();
        const mine = [...tags.entries()].filter(([, list]) => list.some((p) => p.id === me.id)).map(([tg]) => tg);
        const pool = mine
          .flatMap((tg) => tags.get(tg))
          .filter((p) => ok(p) && p.category_id !== me.category_id)
          .sort((a, b) => Number(b.discount > 0) - Number(a.discount > 0));
        for (const p of pool) if (picks.length < 2 && !picks.some((x) => x.id === p.id || x.category_id === p.category_id)) picks.push(rich.get(p.id) || p);
      }
      /* 3. the lowest-priced from other departments */
      if (picks.length < 2) {
        const pool = all
          .filter((p) => ok(p) && p.category_id !== me.category_id)
          .sort((a, b) => moneyOf(this.shop, a, null, this.currency).now - moneyOf(this.shop, b, null, this.currency).now);
        for (const p of pool) if (picks.length < 2 && !picks.some((x) => x.id === p.id || x.category_id === p.category_id)) picks.push(p);
      }
      if (this.product.id !== me.id) return;
      this.items = [base, ...picks].map((p) => ({ p, v: this.firstVariant(p), on: true }));
    },
    async addAll() {
      if (!mayBuy(this)) return;
      this.adding = true;
      try {
        for (const it of this.items.filter((x) => x.on)) {
          if (it.v) await addVariant(this, it.p, it.v);
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
