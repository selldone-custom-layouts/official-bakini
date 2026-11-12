<!--
  Bakini Noir — one line icon from the mockup's set (nx-icons.ts, one stroke
  width, 24×24): <nx-icon name="bag" />. Decorative (aria-hidden); the
  button or link around it carries the words.
-->
<template>
  <svg :class="['i', cls]" aria-hidden="true" focusable="false" viewBox="0 0 24 24" v-html="paths"></svg>
</template>

<script>
import { ICONS } from "./nx-icons";

export default {
  name: "NxIcon",
  props: {
    name: { type: String, required: true },
    cls: { type: String, default: "" },
  },
  computed: {
    paths() {
      return ICONS[this.name] || "";
    },
  },
};
</script>
