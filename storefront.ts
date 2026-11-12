/*
 * Copyright (c) 2023. Selldone® Business OS™
 *
 * Author: M.Pajuhaan
 * Web: https://selldone.com
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *
 * All rights reserved. In the weave of time, where traditions and innovations intermingle, this content was crafted.
 * From the essence of thought, through the corridors of creativity, each word, and sentiment has been molded.
 * Not just to exist, but to inspire. Like an artist's stroke or a sculptor's chisel, every nuance is deliberate.
 * Our journey is not just about reaching a destination, but about creating a masterpiece.
 * Tread carefully, for you're treading on dreams.
 */

//█████████████████████████████████████████████████████████████
//―――――――――――――――― Imports ――――――――――――――――
//█████████████████████████████████████████████████████████████
import "@selldone/core-js/utils/service-worker/registerServiceWorker"; // Register service worker:
import {createApp} from "vue";
import StorefrontApp from "./StorefrontApp.vue";
import router from "./router/StorefrontRouter";
import store from "./store/StorefrontStore";
import {i18n} from "./lang/i18n_shop";
import {Language} from "@selldone/core-js/enums/language/Language";
import {
    ApplicationExecutorStorefront
} from "@selldone/core-js/models/application/executor/storefront/ApplicationExecutorStorefront.ts";
import {StorefrontSDK} from "@selldone/sdk-storefront";
import StorefrontMixin from "./mixin/StorefrontMixin";
import {CapiCommunity} from "@selldone/sdk-community"; // Register the service worker.
import {VuetifyInstance} from "@selldone/components-vue/plugins/vuetify/vuetify";
//█████████████████████████████████████████████████████████████
//―――――――――――― Selldone® Components ――――――――――――
//█████████████████████████████████████████████████████████████
import {createComponents} from "@selldone/components-vue/components";
// Load fonts:
import "@fortawesome/fontawesome-free/css/all.css"; // Ensure your project is capable of handling css files
import "@selldone/components-vue/style/fonts/material-design-fonts/material-design-icons.scss"; // Ensure your project is capable of handling css files
import "@selldone/components-vue/style/fonts/lang/fa/lang-fa-iransans.css";
import "./components/kalio/kalio-fonts"; // Kalio typefaces, loaded by the app so they reach production
import { PageHyper } from "@selldone/page-builder/PageHyperService.ts";
import {SetupPageBuilder} from "@selldone/page-builder/page-builder.ts";
import {SetupService} from "@selldone/core-js/server";
import {Shop} from "@selldone/core-js/models";
import { bootThemeSwitcher } from "./components/theme-switcher/theme-switcher"; // the shared theme switcher
import { BAKINI_THEME } from "./components/bakini/bakini-theme";
import { bootRegion, prepareLanguage } from "./components/region-switcher/region"; // language + currency (the owner's choice B)
import { priceText } from "./components/kalio/i18n/price-text"; // money in sentences written as u-price writes it
import { EN as BAKINI_EN, LOADERS as BAKINI_LANGUAGES } from "./components/kalio/i18n"; // the Kalio base + Bakini's own words
import { bootI18n, i18nGlobals, loadLanguage } from "./components/kalio/i18n/kalio-i18n"; // the Layout's own words in the visitor's language (lazy per language)

const vuetify = VuetifyInstance(i18n);
// Vuetify's light error red reads 4.5:1 on white (its #ff5252 is 3.3:1); set
// here, not in the switcher's config, so it stays when the switcher is hidden.
try { vuetify.theme.themes.value.light.colors.error = "#c4122f"; } catch (e) {}
// Noir is dark first: the designed default (bakini-theme.settings.ts, mode
// "dark") is painted before the first paint on every shop, Vuetify's dark
// theme included. On Bakini's own showcase shop the footer's Theme row lets a
// shopper pick a palette and Light / Dark, kept in the browser.
bootThemeSwitcher(BAKINI_THEME, vuetify);

//█████████████████████████████████████████████████████████████
//―――――――――――――― Global Types ―――――――――――――――
//█████████████████████████████████████████████████████████████

// ━━━ Global Language ━━━
// @ts-ignore
window.$language = Language[i18n.locale] ? Language[i18n.locale] : Language.en;

//━━━  Multi languages support ━━━
window.$i18n_global = i18n.global; // Important! used by styler!
//━━━  Globally keep store ━━━
window.$global_store = store; // Important! used in page builder!
//━━━  Globally keep route ━━━
window.$global_router = router; // Important! used by styler!
//━━━  Globally keep vuetify ━━━
window.$global_vuetify = vuetify; // Important! used by page build dynamic component generator!  USE THIS NOW: vuetify=Vue.prototype.$vuetify

// ━━━ App Interface ━━━
window.AppInterface = new ApplicationExecutorStorefront();
// ━━━ Override language packs ━━━
window.OverrideShopLanguagePacks = {};

//█████████████████████████████████████████████████████████████
//――――――――――――― Initialize Vue App ―――――――――――――
//█████████████████████████████████████████████████████████████
// @ts-ignore
const app = createApp(StorefrontApp);

const components = createComponents({});
app.use(components);
Object.assign(app.config.globalProperties, i18nGlobals); // t(), formatNumber(), formatDate() in every template

//█████████████████████████████████████████████████████████████
//――――――――――― Selldone® Storefront SDK ―――――――――――
//█████████████████████████████████████████████████████████████

// ━━━ Storefront SDK (xapi) ━━━
StorefrontSDK.Setup(); // Set up the Shop SDK.
// The visitor's currency and language, mirrored for money() and t(). Money is
// written as Selldone's u-price writes it ("$26.42"), one way per page in every
// language (price-text.ts, the SM-355 lesson).
// showSingle: the pill shows even with one currency and one language (the B
// mockup's "USD" pill; its panel says what the shop sells in).
bootRegion(store, { showSingle: true, format: (amount, code, decimals) => priceText(amount, code, store.getters.getShop, { decimals }) });
bootI18n(BAKINI_EN, BAKINI_LANGUAGES); // <html lang/dir>, and a language's words fetched when it is picked
prepareLanguage((code) => loadLanguage(code)); // a picked language arrives with its words, never English first

// ━━━ Community SDK (capi) ━━━
CapiCommunity.Setup(); // Setup community.

//█████████████████████████████████████████████████████████████
//―――――――――――――――― Cookie ―――――――――――――――――
//█████████████████████████████████████████████████████████████
/**
 * Sets a token in the cookies and the Authorization header. Also fetches user and shop info.
 *
 * @param token - The token to set.
 * @param expire_date - The expiration date for the token cookie.
 */
window.SetToken = function (
  token: string,
  expire_date: Date | null = null,
  cookie_key: string = "access_token",
): void {
  console.log("Set Customer Token!");

  window.$cookies.set(
    cookie_key,
    token,
    expire_date ? expire_date.toUTCString() : "",
    window.$storefront.prefix_url,
    undefined,
    false,
  );
  window.axios.defaults.headers.common["Authorization"] = "Bearer " + token;

  (storefrontVueApp as InstanceType<typeof StorefrontMixin>)?.UpdateUserInfo();
  (
    storefrontVueApp as InstanceType<typeof StorefrontMixin>
  )?.fetchBasketAndShop();
};

//█████████████████████████████████████████████████████████████
//―――――――――――――――――― Vue ―――――――――――――――――
//█████████████████████████████████████████████████████████████

// ━━━ Global Mixin ━━━
// @ts-ignore
app.mixin(StorefrontMixin); // Mixin with global helper methods.

// ━━━ Native App Interface ━━━
//require("@selldone/components-vue/plugins/native/NativeAppInterface");

// ━━━ Vue Instance ━━━

app.use(i18n);
app.use(router);
app.use(store);
app.use(vuetify);

//――――――――――――――――――――――――― Page Builder ―――――――――――――――――――――――――
const $PageHyper=PageHyper(app, { mode: "view" });

function isNumericNumber(value) {
  return typeof value === "string" && /^\d+$/.test(value.trim());
}

const CUSTOM_HOME = SetupService.GetMetaValue("custom-home") as Shop.Home;

if(CUSTOM_HOME && isNumericNumber(CUSTOM_HOME) && !window.location.pathname?.includes("/product/")/*Fast load product page!*/){
  SetupPageBuilder(app, { mode: "view" });
  $PageHyper.isInitialized.value = true;
  console.log("⚡ Turbo loading landing page.")
}


// Mount the application
const storefrontVueApp = app.mount("#app");
