<!--
  Bakini Noir — the breadcrumb (b/pages-read.js): Home › … › the page.
  items: [{ label, to }] with the last one the current page (no link).
-->
<template>
  <nav :aria-label="t('bakini.n.rd.crumbs', 'Breadcrumb')" class="crumbs">
    <template v-for="(it, i) in all" :key="i">
      <router-link v-if="i < all.length - 1" :to="it.to">{{ it.label }}</router-link>
      <span v-else aria-current="page">{{ it.label }}</span>
      <nx-icon v-if="i < all.length - 1" cls="k-flip" name="right" />
    </template>
  </nav>
</template>

<script>
import NxIcon from "../NxIcon.vue";
import { t } from "../../../kalio/i18n/kalio-i18n";

export default {
  name: "NxCrumbs",
  components: { NxIcon },
  props: { items: { type: Array, default: () => [] } },
  computed: {
    all() {
      return [{ label: t("bakini.n.rd.home", "Home"), to: { path: "/" } }, ...this.items];
    },
  },
  methods: { t },
};
</script>
