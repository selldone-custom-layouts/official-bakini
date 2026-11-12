<!--
  Bakini Noir — the footer. PHASE 1 BASE: the inherited footer in Noir's
  words; Phase 2 replaces it with the B mockup's dense dark footer
  (bakio-design/b/core.js footer()). Five link columns (Help, Shop, Your
  account, The collections, About), every link one of the shop's own pages;
  then the
  Theme strip (the owner's rule of 10 November 2026: palettes, a custom
  colour and Light / Dark in the footer, above the legal row; only on
  Bakini's showcase shop); then the legal row: the shop's policies, the
  copyright, Selldone's cookie settings and a small "made with selldone",
  and the shop's own social links. A shop with custom footer code keeps
  Selldone's footer.
-->
<template>
  <footer class="bk-footer">
    <div class="bk-wrap bk-footer__grid">
      <nav :aria-label="t('bakini.footer.help', 'Help')">
        <h4>{{ t("bakini.footer.help", "Help") }}</h4>
        <router-link :to="{ name: r.SHOP_CONTACT_US }">{{ t("bakini.footer.contact", "Contact us") }}</router-link>
        <router-link :to="ordersTo">{{ t("bakini.footer.track", "Your orders") }}</router-link>
        <router-link :to="{ name: r.SHOP_PROFILE_PAGE_TERMS }">{{ t("bakini.footer.returns", "Delivery") }}</router-link>
        <router-link :to="helpTo">{{ t("bakini.footer.faq", "FAQ") }}</router-link>
      </nav>
      <nav :aria-label="t('bakini.footer.shop', 'Shop')">
        <h4>{{ t("bakini.footer.shop", "Shop") }}</h4>
        <router-link :to="dealsTo">{{ t("bakini.footer.deals", "Deals") }}</router-link>
        <router-link :to="{ name: r.COMPARISON_PAGE }">{{ t("bakini.footer.compare", "Compare pastries") }}</router-link>
        <router-link :to="newTo">{{ t("bakini.footer.new", "New in") }}</router-link>
        <router-link :to="allTo">{{ t("bakini.footer.all", "Everything") }}</router-link>
        <router-link :to="blogTo">{{ t("bakini.footer.journal", "Journal") }}</router-link>
      </nav>
      <nav :aria-label="t('bakini.footer.you', 'Your account')">
        <h4>{{ t("bakini.footer.you", "Your account") }}</h4>
        <router-link v-if="user" :to="{ name: 'KalioAccountHome' }">{{ t("bakini.footer.account", "Your account") }}</router-link>
        <button v-else class="bk-footer__btn" type="button" @click="signIn">{{ t("bakini.footer.signIn", "Sign in") }}</button>
        <router-link v-if="user" :to="{ name: r.USER_FAVORITES_PAGE }">{{ t("bakini.footer.saved", "Saved items") }}</router-link>
        <button v-else class="bk-footer__btn" type="button" @click="signIn">{{ t("bakini.footer.saved", "Saved items") }}</button>
        <button class="bk-footer__btn" type="button" @click="openCart">{{ t("bakini.footer.basket", "Your bag") }}</button>
      </nav>
      <nav :aria-label="t('bakini.footer.collections', 'The collections')">
        <h4>{{ t("bakini.footer.collections", "The collections") }}</h4>
        <router-link v-for="c in cats" :key="c.id" :to="catTo(c)">{{ c.title || c.name }}</router-link>
      </nav>
      <nav :aria-label="t('bakini.footer.about', 'About')">
        <h4>{{ t("bakini.footer.about", "About") }}</h4>
        <router-link v-for="(l, i) in aboutLinks" :key="i" :to="l.to">{{ l.name }}</router-link>
        <router-link :to="{ name: r.SHOP_PROFILE_PAGE_TERMS }">{{ t("bakini.footer.terms", "Terms & conditions") }}</router-link>
        <router-link :to="{ name: r.SHOP_PROFILE_PAGE_PRIVACY }">{{ t("bakini.footer.privacy", "Privacy policy") }}</router-link>
      </nav>
    </div>

    <!-- The theme switcher (the owner, 10 November 2026: in the footer on
         every Layout): palettes, a custom colour and Light / Dark, in a strip
         of its own above the legal row; only on Bakini's showcase shop. -->
    <div class="bk-footer__theme">
      <div class="bk-wrap"><theme-switcher-row /></div>
    </div>

    <div class="bk-footer__legal">
      <div class="bk-wrap bk-footer__legal-in">
        <nav :aria-label="t('bakini.footer.legal', 'Legal')" class="bk-footer__legal-links">
          <router-link :to="{ name: r.SHOP_PROFILE_PAGE_PRIVACY }">{{ t("bakini.footer.privacyCookies", "Privacy & cookies") }}</router-link>
          <router-link :to="{ name: r.SHOP_PROFILE_PAGE_TERMS }">{{ t("bakini.footer.terms", "Terms & conditions") }}</router-link>
          <router-link :to="{ name: r.SHOP_CONTACT_US }">{{ t("bakini.footer.contact", "Contact us") }}</router-link>
          <s-footer-section-gdpr class="bk-footer__gdpr"></s-footer-section-gdpr>
        </nav>
        <s-storefront-social-buttons class="bk-footer__social"></s-storefront-social-buttons>
      </div>
      <div class="bk-wrap bk-footer__copy">
        <span>© {{ year }} {{ shopTitle }}</span>
        <s-footer-section-selldone class="bk-footer__made"></s-footer-section-selldone>
      </div>
    </div>
  </footer>
</template>

<script>
import { iso } from "../bakini";
import ThemeSwitcherRow from "../../theme-switcher/ThemeSwitcherRow.vue";
import SStorefrontSocialButtons from "@selldone/components-vue/storefront/social/SStorefrontSocialButtons.vue";
import SFooterSectionGdpr from "@selldone/components-vue/storefront/footer/section/gdpr/SFooterSectionGdpr.vue";
import SFooterSectionSelldone from "@selldone/components-vue/storefront/footer/section/selldone/SFooterSectionSelldone.vue";
import { EventBus } from "@selldone/components-vue/utils/events/EventBus.ts";
import { aisleRoute, aisles, catalogueRoute, dealsRoute } from "../../kalio/kalio-catalog";
import { journalRoute } from "../../kalio/pages/kalio-journal";
import { t } from "../../kalio/i18n/kalio-i18n";

export default {
  name: "BakiniFooter",
  components: { ThemeSwitcherRow, SStorefrontSocialButtons, SFooterSectionGdpr, SFooterSectionSelldone },
  inject: ["$shop"],

  data: () => ({ cats: [], year: new Date().getFullYear() }),

  computed: {
    r() {
      return window.$storefront.routes;
    },
    shopTitle() {
      return this.$shop?.title || "";
    },
    user() {
      return this.$store.getters.getUser;
    },
    allTo() {
      return catalogueRoute();
    },
    ordersTo() {
      return { name: this.r.HISTORY_ORDERS_PHYSICAL };
    },
    helpTo() {
      return this.$router.hasRoute("ShopFAQ") ? { name: "ShopFAQ" } : { name: this.r.SHOP_CONTACT_US };
    },
    dealsTo() {
      return dealsRoute();
    },
    newTo() {
      return catalogueRoute({ sort: "newest" });
    },
    blogTo() {
      return journalRoute();
    },
    /* The merchant's footer menu (Selldone menus, type FOOTER), without what
       the other columns already show, else About us. */
    aboutLinks() {
      const r = this.r;
      const menu = this.$shop?.menus?.find((it) => it.type === "FOOTER" && it.enable !== false);
      const skip = new Set([r.SHOP_PROFILE_PAGE_TERMS, r.SHOP_PROFILE_PAGE_PRIVACY, r.SHOP_CONTACT_US, "ShopFAQ", r.BLOGS_PAGE]);
      const items = (menu?.menu || [])
        .flat()
        .filter((item) => item && item.name && item.to)
        .filter((item) => !item.to.name || this.$router.hasRoute(item.to.name))
        .filter((item) => !skip.has(item.to.name) && item.to.path !== "/" && item.to.name !== r.SHOP_PAGE)
        .slice(0, 3);
      return items.length ? items : [{ name: t("bakini.footer.aboutShop", "About {name}", { name: iso(this.shopTitle) }), to: { name: r.SHOP_PROFILE_PAGE_ABOUT_US } }];
    },
  },

  mounted() {
    aisles().then((list) => (this.cats = list));
  },

  methods: {
    iso,
    t,
    catTo: aisleRoute,
    signIn() {
      EventBus.$emit("need-login", true);
    },
    openCart() {
      EventBus.$emit("bakini:open-cart");
    },
  },
};
</script>
