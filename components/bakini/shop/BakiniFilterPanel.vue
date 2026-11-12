<!--
  Bakini — the results page's Filters panel (a white card on the left on a
  computer; on a phone the same panel in a side sheet, teleported to the
  body, with "Show results"):
    "Filters" and Clear all;
    a "Hide out of stock" switch (Selldone's own only_available);
    Deals: On sale;
    By price: min and max boxes in the visitor's currency with Apply, and
      four ranges cut where the category's own prices fall;
    then the listing's live Selldone filter groups (walio-filters.ts):
      brands, colours (swatches), the other variant values, and the
      merchant's spec keys, each folding open and closed, five values and
      "Show N more".
  Every change applies at once; the page hands it to the listing. Nothing
  here claims anything the data does not hold (there is no delivery
  filter: Selldone has no per-product delivery data to filter by).
-->
<template>
  <div class="bk-fpanel">
    <header class="bk-fpanel__head">
      <h2>{{ t("bakini.filters.title", "Filters") }}</h2>
      <button v-if="onCount || hideOut" class="bk-link" type="button" @click="clearAll">{{ t("bakini.filters.clear", "Clear all") }}</button>
    </header>

    <label class="bk-switch">
      <input :checked="hideOut" type="checkbox" @change="$emit('update:hideOut', $event.target.checked)" />
      <i aria-hidden="true"></i>{{ t("bakini.filters.hideOut", "Hide out of stock") }}
    </label>

    <section v-if="!ignore.includes('discount')" class="bk-fgroup">
      <button :aria-expanded="isOpen('deals') ? 'true' : 'false'" class="bk-fgroup__h" type="button" @click="fold('deals')">
        {{ t("bakini.filters.deals", "Deals") }}<span class="ms">{{ isOpen("deals") ? "expand_less" : "expand_more" }}</span>
      </button>
      <div v-if="isOpen('deals')" class="bk-fgroup__b">
        <label class="bk-check">
          <input :checked="!!value.only_has_discount" type="checkbox" @change="toggleDeals" />
          <i aria-hidden="true"><span class="ms">check</span></i>{{ t("bakini.filters.onSale", "On sale") }}
        </label>
      </div>
    </section>

    <section v-if="has_price" class="bk-fgroup">
      <button :aria-expanded="isOpen('price') ? 'true' : 'false'" class="bk-fgroup__h" type="button" @click="fold('price')">
        {{ t("bakini.filters.price", "By price") }}<span class="ms">{{ isOpen("price") ? "expand_less" : "expand_more" }}</span>
      </button>
      <div v-if="isOpen('price')" class="bk-fgroup__b">
        <form class="bk-pricebox" @submit.prevent="applyBoxes">
          <label>
            <span>{{ sign }}</span>
            <input v-model="box_lo" :aria-label="t('bakini.filters.min', 'Minimum price')" :placeholder="t('bakini.filters.minPh', 'Min')" inputmode="decimal" />
          </label>
          <em>{{ t("bakini.filters.to", "to") }}</em>
          <label>
            <span>{{ sign }}</span>
            <input v-model="box_hi" :aria-label="t('bakini.filters.max', 'Maximum price')" :placeholder="t('bakini.filters.maxPh', 'Max')" inputmode="decimal" />
          </label>
          <button class="bk-btn -sm" type="submit">{{ t("bakini.filters.apply", "Apply") }}</button>
        </form>
        <label v-for="b in bands" :key="b.key" class="bk-check">
          <input :checked="bandOn(b)" type="checkbox" @change="pickBand(b)" />
          <i aria-hidden="true"><span class="ms">check</span></i><span v-if="b.range" class="bk-range">{{ b.label }}</span><template v-else>{{ b.label }}</template>
        </label>
      </div>
    </section>

    <section v-for="g in ordered" :key="g.kind + g.key" class="bk-fgroup">
      <button :aria-expanded="isOpen(g.key) ? 'true' : 'false'" class="bk-fgroup__h" type="button" @click="fold(g.key)">
        {{ groupLabel(g) }}<span class="ms">{{ isOpen(g.key) ? "expand_less" : "expand_more" }}</span>
      </button>
      <div v-if="isOpen(g.key)" :class="{ '-sw': g.key === 'colors' }" class="bk-fgroup__b">
        <template v-if="g.key === 'colors'">
          <button
            v-for="v in g.values"
            :key="v"
            :aria-label="colourName(valueLabel(v)) || valueLabel(v)"
            :aria-pressed="picked(g).includes(v) ? 'true' : 'false'"
            :class="{ '-on': picked(g).includes(v) }"
            :style="{ '--sw': swatchBg(valueLabel(v)) }"
            :title="colourName(valueLabel(v))"
            class="bk-sw -lg"
            type="button"
            @click="toggle(g, v)"
          ></button>
        </template>
        <template v-else>
          <label v-for="v in shownValues(g)" :key="v" class="bk-check">
            <input :checked="picked(g).includes(v)" type="checkbox" @change="toggle(g, v)" />
            <i aria-hidden="true"><span class="ms">check</span></i>{{ valueLabel(v) }}
          </label>
          <button v-if="g.values.length > 5" class="bk-link bk-fgroup__more" type="button" @click="moreOf(g.key)">
            {{ more[g.key] ? t("bakini.menu.showFewer", "Show fewer") : t("bakini.menu.showMore", "Show {n} more", { n: g.values.length - 5 }) }}
          </button>
        </template>
      </div>
    </section>
  </div>
</template>

<script>
import { currentCurrency, signOf } from "../../region-switcher/region";
import { PriceHelper } from "@selldone/core-js/helper";
import { clone, countOn, groupsOf, picked, valueLabel, withGroup } from "../../walio/shop/walio-filters";
import { colourName, moneyText, swatchBg } from "../bakini";
import { t } from "../../kalio/i18n/kalio-i18n";

export default {
  name: "BakiniFilterPanel",
  inject: ["$shop"],
  emits: ["update:modelValue", "update:hideOut"],

  props: {
    filters: { type: Object, default: null },
    modelValue: { type: Object, default: null },
    hideOut: Boolean,
  },

  data: () => ({ closed: {}, more: {}, box_lo: "", box_hi: "" }),

  computed: {
    value() {
      return clone(this.modelValue);
    },
    ignore() {
      return this.filters?.ignore || [];
    },
    /* Brands, colours, the other variant values, then the spec keys. */
    ordered() {
      const rank = (x) => (x.kind === "brand" ? 0 : x.key === "colors" ? 1 : x.kind === "variant" ? 2 : 3);
      return [...groupsOf(this.filters)].sort((a, b) => rank(a) - rank(b));
    },
    onCount() {
      return countOn(this.modelValue);
    },
    currency() {
      return currentCurrency();
    },
    sign() {
      return signOf(this.currency);
    },
    price_rows() {
      return (this.filters?.prices || []).filter((row) => this.rate(row.currency, true));
    },
    price_min() {
      const values = this.price_rows.map((row) => row.min * this.rate(row.currency, true));
      return values.length ? Math.floor(Math.min(...values)) : 0;
    },
    price_max() {
      const values = this.price_rows.map((row) => row.max * this.rate(row.currency, true));
      return values.length ? Math.ceil(Math.max(...values)) : 0;
    },
    has_price() {
      return !this.ignore.includes("price") && this.price_rows.length && this.price_max > this.price_min;
    },
    /* Four ranges with friendly edges, cut evenly across the category's own
       span in the visitor's currency. */
    bands() {
      if (!this.has_price) return [];
      const lo = this.price_min;
      const hi = this.price_max;
      const nice = (v) => {
        if (v <= 0) return 0;
        const e = Math.pow(10, Math.floor(Math.log10(v)));
        const s = v / e;
        return (s < 1.5 ? 1 : s < 2.25 ? 2 : s < 3.5 ? 2.5 : s < 7.5 ? 5 : 10) * e;
      };
      const cuts = [...new Set([0.25, 0.5, 0.75].map((q) => nice(lo + (hi - lo) * q)))].filter((c) => c > lo && c < hi).sort((a, b) => a - b);
      if (!cuts.length) return [];
      const m = (n) => moneyText(n, this.currency, true);
      const out = [{ key: "b0", lo, hi: cuts[0], label: t("bakini.filters.under", "Under {amount}", { amount: m(cuts[0]) }) }];
      for (let i = 1; i < cuts.length; i++) out.push({ key: "b" + i, lo: cuts[i - 1], hi: cuts[i], label: `${m(cuts[i - 1])} – ${m(cuts[i])}`, range: true });
      out.push({ key: "bx", lo: cuts[cuts.length - 1], hi, label: t("bakini.filters.andOver", "{amount} and over", { amount: m(cuts[cuts.length - 1]) }) });
      return out;
    },
    range() {
      const row = this.price_rows[0];
      const set = row && this.modelValue?.prices?.[row.currency];
      if (!set) return null;
      const r = this.rate(row.currency, true) || 1;
      return [set[0] * r, set[1] * r];
    },
  },

  watch: {
    range: {
      handler(r) {
        this.box_lo = r ? String(Math.round(r[0])) : "";
        this.box_hi = r ? String(Math.round(r[1])) : "";
      },
      immediate: true,
    },
  },

  methods: {
    t,
    valueLabel,
    swatchBg,
    colourName,
    groupLabel(g) {
      if (g.kind === "brand") return t("bakini.filters.brand", "Brand");
      if (g.key === "colors") return t("bakini.filters.colour", "Colour");
      if (g.key === "volumes") return t("bakini.filters.capacity", "Capacity");
      return g.label;
    },
    isOpen(key) {
      return !this.closed[key];
    },
    fold(key) {
      this.closed = { ...this.closed, [key]: !this.closed[key] };
    },
    moreOf(key) {
      this.more = { ...this.more, [key]: !this.more[key] };
    },
    shownValues(g) {
      return this.more[g.key] || g.values.length <= 5 ? g.values : g.values.slice(0, 5);
    },
    picked(g) {
      return picked(this.modelValue, g);
    },
    rate(currency, toUser) {
      return toUser
        ? PriceHelper.getExchangeRateValue(this.$shop, currency, this.currency, null)
        : PriceHelper.getExchangeRateValue(this.$shop, this.currency, currency, null);
    },
    /* A range in the visitor's currency, sent keyed by each row's own
       currency (Selldone filters by the product's currency). */
    pricesFor(lo, hi) {
      if (lo <= this.price_min && hi >= this.price_max) return null;
      const out = {};
      for (const row of this.price_rows) {
        const r = this.rate(row.currency, false) || 1;
        out[row.currency] = [Math.floor(lo * r * 100) / 100, Math.ceil(hi * r * 100) / 100];
      }
      return out;
    },
    emit(next) {
      this.$emit("update:modelValue", next);
    },
    toggleDeals() {
      const next = clone(this.modelValue);
      next.only_has_discount = !next.only_has_discount;
      this.emit(next);
    },
    toggle(g, v) {
      const now = this.picked(g);
      this.emit(withGroup(this.modelValue, g, now.includes(v) ? now.filter((x) => x !== v) : [...now, v]));
    },
    applyBoxes() {
      const num = (s, d) => {
        const n = Number(String(s).replace(/[^0-9.]/g, ""));
        return String(s).trim() === "" || !Number.isFinite(n) ? d : n;
      };
      let lo = Math.max(this.price_min, num(this.box_lo, this.price_min));
      let hi = Math.min(this.price_max, num(this.box_hi, this.price_max));
      if (lo > hi) [lo, hi] = [hi, lo];
      const next = clone(this.modelValue);
      next.prices = this.pricesFor(lo, hi);
      this.emit(next);
    },
    bandOn(b) {
      const r = this.range;
      return !!r && Math.abs(r[0] - b.lo) < 1 && Math.abs(r[1] - b.hi) < 1;
    },
    pickBand(b) {
      const next = clone(this.modelValue);
      next.prices = this.bandOn(b) ? null : this.pricesFor(b.lo, b.hi);
      this.emit(next);
    },
    clearAll() {
      this.emit(clone(null));
      if (this.hideOut) this.$emit("update:hideOut", false);
    },
  },
};
</script>
