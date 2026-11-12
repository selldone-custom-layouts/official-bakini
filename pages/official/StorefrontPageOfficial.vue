<!--
  - Copyright (c) 2023. Selldone® Business OS™
  -
  - Author: M.Pajuhaan
  - Web: https://selldone.com
  - ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  -
  - All rights reserved. In the weave of time, where traditions and innovations intermingle, this content was crafted.
  - From the essence of thought, through the corridors of creativity, each word, and sentiment has been molded.
  - Not just to exist, but to inspire. Like an artist's stroke or a sculptor's chisel, every nuance is deliberate.
  - Our journey is not just about reaching a destination, but about creating a masterpiece.
  - Tread carefully, for you're treading on dreams.
  -->

<!--
  Bakini Noir: About, Terms, Privacy and Contact in the Layout's own frame;
  each page draws its own head (b/pages-read.js), so the frame is only the
  slot Selldone fills above it and the page.
-->
<template>
  <div class="k-official">
    <slot name="header"></slot>
    <router-view class="k-official__body" />
  </div>
</template>

<script lang="ts">
import UBreadcrumb from "@selldone/components-vue/ui/breadcrumb/UBreadcrumb.vue";
import { SBusinessProfileBreadcrumbsHelper } from "@selldone/components-vue/storefront/business-profile/helper/SBusinessProfileBreadcrumbsHelper";

export default {
  name: "StorefrontPageOfficial",
  components: { UBreadcrumb },
  inject: ["$shop"],

  props: {},

  data: function () {
    return {};
  },

  computed: {
    page_name() {
      const name = this.$route.name;
      return name === window.$storefront.routes.SHOP_PROFILE_PAGE_ABOUT_US
        ? this.$t("official_pages.about_us")
        : name === window.$storefront.routes.SHOP_PROFILE_PAGE_TERMS
          ? this.$t("official_pages.terms")
          : name === window.$storefront.routes.SHOP_PROFILE_PAGE_PRIVACY
            ? this.$t("official_pages.privacy")
            : name === window.$storefront.routes.SHOP_CONTACT_US
              ? this.$t("official_pages.contact_us")
              : "";
    },
    hierarchy_items() {
      return SBusinessProfileBreadcrumbsHelper.GeneratePageHierarchy(
        this.$t("global.store"),
        this.page_name,
      );
    },
  },

  watch: {},
  created() {},

  methods: {},
};
</script>

<style lang="scss" scoped></style>
