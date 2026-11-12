<!--
  Bakini — a row that scrolls sideways, with a round white arrow at each end
  (dark, bold chevrons; both always shown, the one at an end greyed). Used
  by the home's round "Shop deals" tiles, the brand cards, the dark Deals
  cards and the hub's carousel. In a right-to-left language the arrows and
  the scroll follow the reading direction.
-->
<template>
  <div :class="['bk-scroller', { '-edge': edge }]">
    <div ref="track" :aria-label="label" class="bk-scroller__track" role="list" @scroll.passive="measure">
      <slot></slot>
    </div>
    <button
      :aria-disabled="at_start ? 'true' : 'false'"
      :aria-label="t('bakini.scroll.back', 'Scroll back')"
      :class="{ '-dim': at_start }"
      class="bk-arrow -l"
      type="button"
      @click="nudge(-1)"
    >
      <span class="ms">{{ rtl ? "chevron_right" : "chevron_left" }}</span>
    </button>
    <button
      :aria-disabled="at_end ? 'true' : 'false'"
      :aria-label="t('bakini.scroll.next', 'Scroll forward')"
      :class="{ '-dim': at_end }"
      class="bk-arrow -r"
      type="button"
      @click="nudge(1)"
    >
      <span class="ms">{{ rtl ? "chevron_left" : "chevron_right" }}</span>
    </button>
  </div>
</template>

<script>
import { isRtl } from "../region-switcher/region";
import { t } from "../kalio/i18n/kalio-i18n";

export default {
  name: "BakiniScroller",
  props: {
    label: { type: String, default: "" },
    /** The track runs to the screen's edges on a phone. */
    edge: Boolean,
    /** Anything that changes the items (to measure again). */
    watchKey: { type: [String, Number, Array, Object], default: null },
  },
  data: () => ({ at_start: true, at_end: false }),
  computed: {
    rtl() {
      return isRtl();
    },
  },
  watch: {
    watchKey() {
      this.$nextTick(() => {
        if (this.$refs.track) this.$refs.track.scrollLeft = 0;
        this.measure();
      });
    },
  },
  mounted() {
    this.measure();
    this.onResize = () => this.measure();
    window.addEventListener("resize", this.onResize, { passive: true });
    setTimeout(() => this.measure(), 600);
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.onResize);
  },
  methods: {
    t,
    measure() {
      const el = this.$refs.track;
      if (!el) return;
      const left = Math.abs(el.scrollLeft);
      this.at_start = left < 4;
      this.at_end = left + el.clientWidth >= el.scrollWidth - 4;
    },
    nudge(dir) {
      const el = this.$refs.track;
      if (!el) return;
      const d = (this.rtl ? -1 : 1) * dir;
      el.scrollBy({ left: d * Math.max(200, Math.round(el.clientWidth * 0.8)), behavior: "smooth" });
    },
  },
};
</script>
