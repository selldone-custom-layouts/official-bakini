<!--
  Bakini Noir: the shop's privacy page (NxLegal: the shop's own text when it has
  written one, else sample copy from its facts, labelled as sample).
-->
<template>
  <nx-legal kind="privacy" />
</template>

<script lang="ts">
import NxLegal from "@app-storefront/components/bakini/noir/read/NxLegal.vue";

export default {
  name: "StorefrontPageOfficialPrivacy",
  components: { NxLegal },
};
</script>
