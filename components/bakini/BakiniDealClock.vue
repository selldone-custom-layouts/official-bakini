<!--
  Bakini — a deal's countdown.
  It is handed the deal's own end (bakini.ts dealEnd: Selldone's PriceHelper
  rule, the chosen variant's dates when that variant has its own pricing)
  and counts on the page's one shared ticker (bakini.ts tick), so a grid of
  cards never runs one interval each, and only this small piece re-renders
  every second. A deal with no end date, or one that has ended, shows
  nothing.
    line   — the quiet line on product cards: "Ends in 364d 23:15:07"
    bare   — just the time ("364d 23:15:07"), inside a sentence of its own
    blocks — the product page: days, hrs, min and sec
-->
<template>
  <span v-if="left && mode === 'line'" :title="title" class="bk-cd">
    <span class="ms">schedule</span><span class="bk-cd__w">{{ t("bakini.clock.endsIn", "Ends in") }} </span><b>{{ left.text }}</b>
  </span>
  <b v-else-if="left && mode === 'bare'" :title="title" class="bk-cd-bare">{{ left.text }}</b>
  <div v-else-if="left && mode === 'blocks'" :title="title" class="bk-cd-blocks">
    <div aria-live="off" class="bk-count" :class="{ '-days': left.d > 0 }">
      <span v-if="left.d"><b>{{ left.d }}</b>{{ left.d === 1 ? t("bakini.clock.day", "day") : t("bakini.clock.days", "days") }}</span><span><b>{{ left.h }}</b>{{ t("bakini.clock.hrs", "hrs") }}</span><span><b>{{ left.m }}</b>{{ t("bakini.clock.min", "min") }}</span><span><b>{{ left.s }}</b>{{ t("bakini.clock.sec", "sec") }}</span>
    </div>
  </div>
</template>

<script>
import { startClock, tick, timeLeft } from "./bakini";
import { formatDate, t } from "../kalio/i18n/kalio-i18n";

export default {
  name: "BakiniDealClock",
  props: {
    /** The deal's end (a Date), or null for no clock. */
    end: { type: Date, default: null },
    mode: { type: String, default: "line" },
  },
  computed: {
    left() {
      return timeLeft(this.end, tick.now);
    },
    title() {
      return this.end ? t("bakini.clock.title", "Deal ends {date}", { date: formatDate(this.end, { dateStyle: "medium", timeStyle: "short" }) }) : null;
    },
  },
  mounted() {
    startClock();
  },
  methods: { t },
};
</script>
