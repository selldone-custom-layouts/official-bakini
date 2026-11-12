<!--
  Bakini — a row of product cards on one line that scrolls sideways, with a
  round arrow at each end ("Best sellers", "Just arrived", the product
  page's "We recommend" and "More like this"). Five cards to a computer
  screen, two and a bit on a phone. A row with nothing to show renders
  nothing; while it loads it shows skeleton cards.
-->
<template>
  <section v-if="products === null || products.length" :aria-label="title" class="bk-sec bk-railsec">
    <header class="bk-head">
      <h2>{{ title }}</h2>
      <slot name="head"></slot>
      <router-link v-if="moreTo" :to="moreTo" class="bk-more">{{ moreLabel || t("bakini.rail.seeAll", "See all") }}<span class="ms bk-chev">chevron_right</span></router-link>
    </header>
    <bakini-scroller :label="title" :watch-key="products ? products.map((p) => p.id).join() : 'loading'" class="bk-rail" edge>
      <template v-if="products === null">
        <div v-for="n in 6" :key="'s' + n" aria-hidden="true" class="bk-card -skeleton" role="listitem"><i></i><b></b><b class="-short"></b></div>
      </template>
      <template v-else>
        <div v-for="p in products" :key="p.id" class="bk-rail__item" role="listitem">
          <bakini-card :product="p" @quick-buy="$emit('quick-buy', $event)" />
        </div>
      </template>
    </bakini-scroller>
  </section>
</template>

<script>
import BakiniCard from "./BakiniCard.vue";
import BakiniScroller from "./BakiniScroller.vue";
import { t } from "../kalio/i18n/kalio-i18n";

export default {
  name: "BakiniRail",
  components: { BakiniCard, BakiniScroller },
  props: {
    title: { type: String, required: true },
    /** null while loading. */
    products: { type: Array, default: null },
    moreTo: { type: Object, default: null },
    moreLabel: { type: String, default: "" },
  },
  emits: ["quick-buy"],
  methods: { t },
};
</script>
