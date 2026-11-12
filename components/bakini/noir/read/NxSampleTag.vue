<!--
  Bakini Noir — the label on every page whose text is a stand-in
  (b/pages-read.js SAMPLE): "Sample text — the shop has not written this
  page yet".
-->
<template>
  <p class="sample-tag"><nx-icon name="info" />{{ t("bakini.n.rd.sample", "Sample text — the shop has not written this page yet") }}</p>
</template>

<script>
import NxIcon from "../NxIcon.vue";
import { t } from "../../../kalio/i18n/kalio-i18n";

export default {
  name: "NxSampleTag",
  components: { NxIcon },
  methods: { t },
};
</script>
