<!--
  Bakini Noir — a one-line scroll row with visible dark arrows (b/core.js
  row()): a section head (eyebrow, title with an italic accent, a line), a
  "more" link and two round arrows that page the row; then the cards.
  An arrow is disabled at its end. Right to left, the arrows swap.
-->
<template>
  <section :id="id || undefined" :class="['sec', cls]">
    <div class="wrap">
      <div class="sec-hd">
        <div>
          <p v-if="eyebrow" class="eyebrow">{{ eyebrow }}</p>
          <h2>{{ title }}{{ accent ? " " : "" }}<em v-if="accent">{{ accent }}</em></h2>
          <p v-if="sub">{{ sub }}</p>
        </div>
        <div class="tools">
          <router-link v-if="moreTo && moreLabel" :to="moreTo" class="link">{{ moreLabel }}<nx-icon name="arrow" /></router-link>
          <span class="row-arrows">
            <button :aria-label="t('bakini.n.row.back', 'Scroll back')" :disabled="atStart" class="arrow" type="button" @click="page(-1)"><nx-icon name="left" /></button>
            <button :aria-label="t('bakini.n.row.forward', 'Scroll forward')" :disabled="atEnd" class="arrow" type="button" @click="page(1)"><nx-icon name="right" /></button>
          </span>
        </div>
      </div>
      <div class="row">
        <div ref="track" class="row-track" @scroll.passive="update">
          <slot>
            <nx-card v-for="p in items" :key="p.id" :look="look" :product="p" />
          </slot>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import NxIcon from "./NxIcon.vue";
import NxCard from "./NxCard.vue";
import { scrollBehavior } from "./noir";
import { isRtl } from "../../region-switcher/region";
import { t } from "../../kalio/i18n/kalio-i18n";

export default {
  name: "NxRow",
  components: { NxIcon, NxCard },
  props: {
    id: { type: String, default: "" },
    cls: { type: String, default: "" },
    eyebrow: { type: String, default: "" },
    title: { type: String, default: "" },
    accent: { type: String, default: "" },
    sub: { type: String, default: "" },
    moreTo: { type: [Object, String], default: null },
    moreLabel: { type: String, default: "" },
    items: { type: Array, default: () => [] },
    look: Boolean,
  },
  data: () => ({ atStart: true, atEnd: false }),
  watch: {
    items() {
      this.$nextTick(() => {
        if (this.$refs.track) this.$refs.track.scrollLeft = 0;
        this.update();
      });
    },
  },
  mounted() {
    this.onResize = () => this.update();
    window.addEventListener("resize", this.onResize, { passive: true });
    this.update();
    setTimeout(() => this.update(), 400);
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.onResize);
  },
  methods: {
    t,
    update() {
      const tr = this.$refs.track;
      if (!tr) return;
      const x = Math.abs(tr.scrollLeft);
      const max = tr.scrollWidth - tr.clientWidth - 2;
      this.atStart = x <= 2;
      this.atEnd = x >= max;
    },
    page(dir) {
      const tr = this.$refs.track;
      if (!tr) return;
      const sign = isRtl() ? -1 : 1;
      tr.scrollBy({ left: dir * sign * tr.clientWidth * 0.84, behavior: scrollBehavior() });
    },
  },
};
</script>
