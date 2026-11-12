<!--
  Bakini Noir — an empty state (b/pages-shop.js N.emptyCard()): an icon in a
  soft circle, the title, a line, the actions and anything below them.
-->
<template>
  <div class="empty">
    <span class="ec"><nx-icon :name="icon" /></span>
    <h3>{{ title }}</h3>
    <p v-if="text">{{ text }}</p>
    <div v-if="$slots.default" class="acts"><slot></slot></div>
    <slot name="extra"></slot>
  </div>
</template>

<script>
import NxIcon from "../NxIcon.vue";

export default {
  name: "NxEmpty",
  components: { NxIcon },
  props: {
    icon: { type: String, default: "info" },
    title: { type: String, default: "" },
    text: { type: String, default: "" },
  },
};
</script>
