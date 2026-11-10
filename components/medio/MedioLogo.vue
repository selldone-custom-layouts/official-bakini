<!--
  Medio — the logo: a round violet mark with the brand name inside in white
  (a sticker), and a small magenta dot at its top right. The name is
  BRAND.name in kalio-brand.ts (the one line to change), drawn in lower
  case; with no brand name set, the shop's own title is drawn the same way.
  The disc is the light primary (--md-head), so a palette or a merchant's
  brand colour repaints it, in light and dark alike.
-->
<template>
  <component :is="to ? 'router-link' : 'span'" :aria-label="`${word} – ${t('medio.logo.home', 'home')}`" :to="to" class="md-logo">
    <span class="md-logo__disc"><span class="md-logo__w">{{ word }}</span></span>
  </component>
</template>

<script>
import { BRAND } from "../kalio/kalio-brand";
import { t } from "../kalio/i18n/kalio-i18n";

export default {
  name: "MedioLogo",
  inject: { $shop: { default: null } },
  props: {
    to: { type: [Object, String], default: () => ({ path: "/" }) },
  },
  computed: {
    word() {
      return (BRAND.name || this.$shop?.title || "").toLowerCase();
    },
  },
  methods: { t },
};
</script>
