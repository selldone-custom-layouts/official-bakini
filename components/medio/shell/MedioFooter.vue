<!--
  Medio — the footer, after a big electronics retailer's: a dark slate
  band with five link columns (Help & support, Services, Payments & care,
  Our pages, About us), every link one of the shop's own pages; then the
  Theme strip (the owner's rule of 10 November 2026: palettes, a custom
  colour and Light / Dark in the footer, above the legal row; only on
  Medio's showcase shop); then the legal row: the shop's policies, the
  copyright, Selldone's cookie settings and a small "made with selldone",
  and the shop's own social links. A shop with custom footer code keeps
  Selldone's footer.
-->
<template>
  <footer class="md-footer">
    <div class="md-wrap md-footer__grid">
      <nav :aria-label="t('medio.footer.help', 'Help & support')">
        <h4>{{ t("medio.footer.help", "Help & support") }}</h4>
        <router-link :to="{ name: r.SHOP_CONTACT_US }">{{ t("medio.footer.contact", "Contact us") }}</router-link>
        <router-link :to="ordersTo">{{ t("medio.footer.track", "Track my order") }}</router-link>
        <router-link :to="{ name: r.SHOP_PROFILE_PAGE_TERMS }">{{ t("medio.footer.returns", "Delivery & returns") }}</router-link>
        <router-link :to="helpTo">{{ t("medio.footer.faq", "Help & FAQ") }}</router-link>
      </nav>
      <nav :aria-label="t('medio.footer.services', 'Services')">
        <h4>{{ t("medio.footer.services", "Services") }}</h4>
        <router-link :to="dealsTo">{{ t("medio.footer.deals", "Today’s deals") }}</router-link>
        <router-link :to="{ name: r.COMPARISON_PAGE }">{{ t("medio.footer.compare", "Compare products") }}</router-link>
        <router-link :to="newTo">{{ t("medio.footer.new", "New in") }}</router-link>
        <router-link :to="allTo">{{ t("medio.footer.all", "All products") }}</router-link>
        <router-link :to="blogTo">{{ t("medio.footer.guides", "Buying guides") }}</router-link>
      </nav>
      <nav :aria-label="t('medio.footer.pay', 'Payments & care')">
        <h4>{{ t("medio.footer.pay", "Payments & care") }}</h4>
        <router-link :to="helpTo">{{ t("medio.footer.ways", "Ways to pay") }}</router-link>
        <router-link v-if="user" :to="{ name: 'KalioAccountHome' }">{{ t("medio.footer.account", "Your account") }}</router-link>
        <button v-else class="md-footer__btn" type="button" @click="signIn">{{ t("medio.footer.signIn", "Sign in") }}</button>
        <router-link v-if="user" :to="{ name: r.USER_FAVORITES_PAGE }">{{ t("medio.footer.saved", "Saved items") }}</router-link>
        <button v-else class="md-footer__btn" type="button" @click="signIn">{{ t("medio.footer.saved", "Saved items") }}</button>
        <button class="md-footer__btn" type="button" @click="openCart">{{ t("medio.footer.basket", "Your basket") }}</button>
      </nav>
      <nav :aria-label="t('medio.footer.pages', 'Our pages')">
        <h4>{{ t("medio.footer.pages", "Our pages") }}</h4>
        <router-link :to="{ path: '/' }">{{ t("medio.footer.home", "Home") }}</router-link>
        <router-link v-for="c in cats.slice(0, 4)" :key="c.id" :to="catTo(c)">{{ c.title || c.name }}</router-link>
      </nav>
      <nav :aria-label="t('medio.footer.about', 'About us')">
        <h4>{{ t("medio.footer.about", "About us") }}</h4>
        <router-link v-for="(l, i) in aboutLinks" :key="i" :to="l.to">{{ l.name }}</router-link>
        <router-link :to="{ name: r.SHOP_PROFILE_PAGE_TERMS }">{{ t("medio.footer.terms", "Terms & conditions") }}</router-link>
        <router-link :to="{ name: r.SHOP_PROFILE_PAGE_PRIVACY }">{{ t("medio.footer.privacy", "Privacy policy") }}</router-link>
      </nav>
    </div>

    <!-- The theme switcher (the owner, 10 November 2026: in the footer on
         every Layout): palettes, a custom colour and Light / Dark, in a strip
         of its own above the legal row; only on Medio's showcase shop. -->
    <div class="md-footer__theme">
      <div class="md-wrap"><theme-switcher-row /></div>
    </div>

    <div class="md-footer__legal">
      <div class="md-wrap md-footer__legal-in">
        <nav :aria-label="t('medio.footer.legal', 'Legal')" class="md-footer__legal-links">
          <router-link :to="{ name: r.SHOP_PROFILE_PAGE_PRIVACY }">{{ t("medio.footer.privacyCookies", "Privacy & cookies") }}</router-link>
          <router-link :to="{ name: r.SHOP_PROFILE_PAGE_TERMS }">{{ t("medio.footer.terms", "Terms & conditions") }}</router-link>
          <router-link :to="{ name: r.SHOP_CONTACT_US }">{{ t("medio.footer.contact", "Contact us") }}</router-link>
          <s-footer-section-gdpr class="md-footer__gdpr"></s-footer-section-gdpr>
        </nav>
        <s-storefront-social-buttons class="md-footer__social"></s-storefront-social-buttons>
      </div>
      <div class="md-wrap md-footer__copy">
        <span>© {{ year }} {{ shopTitle }}</span>
        <s-footer-section-selldone class="md-footer__made"></s-footer-section-selldone>
      </div>
    </div>
  </footer>
</template>

<script>
import { iso } from "../medio";
import ThemeSwitcherRow from "../../theme-switcher/ThemeSwitcherRow.vue";
import SStorefrontSocialButtons from "@selldone/components-vue/storefront/social/SStorefrontSocialButtons.vue";
import SFooterSectionGdpr from "@selldone/components-vue/storefront/footer/section/gdpr/SFooterSectionGdpr.vue";
import SFooterSectionSelldone from "@selldone/components-vue/storefront/footer/section/selldone/SFooterSectionSelldone.vue";
import { EventBus } from "@selldone/components-vue/utils/events/EventBus.ts";
import { aisleRoute, aisles, catalogueRoute, dealsRoute } from "../../kalio/kalio-catalog";
import { journalRoute } from "../../kalio/pages/kalio-journal";
import { t } from "../../kalio/i18n/kalio-i18n";

export default {
  name: "MedioFooter",
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
      return items.length ? items : [{ name: t("medio.footer.aboutShop", "About {name}", { name: iso(this.shopTitle) }), to: { name: r.SHOP_PROFILE_PAGE_ABOUT_US } }];
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
      EventBus.$emit("medio:open-cart");
    },
  },
};
</script>
