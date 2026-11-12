<!--
  Bakini Noir: the shop's terms page (NxLegal: the shop's own text when it has
  written one, else sample copy from its facts, labelled as sample).
-->
<template>
  <nx-legal kind="terms" />
</template>

<script lang="ts">
import NxLegal from "@app-storefront/components/bakini/noir/read/NxLegal.vue";

export default {
  name: "StorefrontPageOfficialTerms",
  components: { NxLegal },
};
</script>
