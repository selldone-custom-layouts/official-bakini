<!--
  Medio — a row of product cards on one line that scrolls sideways, with
  round arrows at its ends ("New arrivals", "<Tag> Items", the product
  page's "Related products" and "More in <category>"). Six cards to a
  computer screen, five on a laptop, two and a half on a phone. A row with
  nothing to show renders nothing; while it loads it shows skeletons.
-->
<template>
  <section v-if="products === null || products.length" :aria-label="title" class="md-sec">
    <header class="md-head">
      <h2>{{ title }}</h2>
      <slot name="head"></slot>
      <router-link v-if="moreTo" :to="moreTo" class="md-more">{{ moreLabel }}<span class="ms">chevron_right</span></router-link>
      <button v-else-if="moreAction" class="md-more" type="button" @click="$emit('more')">{{ moreLabel }}</button>
    </header>
    <div class="md-rail">
      <div ref="track" class="md-rail__track" @scroll.passive="measure">
        <template v-if="products === null">
          <div v-for="n in 6" :key="'s' + n" aria-hidden="true" class="md-card -skeleton"><i></i><b></b><b class="-short"></b></div>
        </template>
        <template v-else>
          <slot :products="products">
            <medio-card v-for="p in products" :key="p.id" :product="p" @quick-buy="$emit('quick-buy', $event)" />
          </slot>
        </template>
      </div>
      <button v-show="!at_start" aria-label="Scroll back" class="md-arrow -l" type="button" @click="nudge(-1)"><span class="ms">chevron_left</span></button>
      <button v-show="!at_end" aria-label="Scroll forward" class="md-arrow -r" type="button" @click="nudge(1)"><span class="ms">chevron_right</span></button>
    </div>
  </section>
</template>

<script>
import MedioCard from "./MedioCard.vue";

export default {
  name: "MedioRail",
  components: { MedioCard },
  props: {
    title: { type: String, required: true },
    /** null while loading. */
    products: { type: Array, default: null },
    moreTo: { type: Object, default: null },
    moreLabel: { type: String, default: "See all" },
    moreAction: Boolean,
  },
  emits: ["quick-buy", "more"],
  data: () => ({ at_start: true, at_end: false }),
  watch: {
    products() {
      this.$nextTick(this.measure);
    },
  },
  mounted() {
    this.measure();
    this.onResize = () => this.measure();
    window.addEventListener("resize", this.onResize, { passive: true });
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.onResize);
  },
  methods: {
    measure() {
      const t = this.$refs.track;
      if (!t) return;
      const left = Math.abs(t.scrollLeft);
      this.at_start = left < 4;
      this.at_end = left + t.clientWidth >= t.scrollWidth - 4;
    },
    nudge(dir) {
      const t = this.$refs.track;
      if (!t) return;
      t.scrollBy({ left: dir * Math.round(t.clientWidth * 0.8), behavior: "smooth" });
    },
  },
};
</script>
