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

<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
  <!-- Bakini: Help & Support, a hub after a big retailer's help centre: a
       violet banner with the way to ask (the help-hero.webp photo slot
       beside it), topic tiles that lead to the shop's own pages, then the
       shop's questions and answers (its own topics as pills), or a calm
       card when there are none yet. -->
  <div class="k-official k-faq bk-help">
    <slot name="header"></slot>
    <div class="bk-wrap">
      <nav :aria-label="t('bakini.crumbs', 'Breadcrumb')" class="bk-crumbs">
        <router-link :to="{ path: '/' }">{{ t("bakini.home", "Home") }}</router-link>
        <span aria-hidden="true" class="ms bk-chev">chevron_right</span>
        <router-link v-if="current_tag" :to="{ name: 'ShopFAQ' }">{{ t("bakini.help.h", "Help & Support") }}</router-link>
        <span v-else aria-current="page" class="bk-crumbs__here">{{ t("bakini.help.h", "Help & Support") }}</span>
        <template v-if="current_tag">
          <span aria-hidden="true" class="ms bk-chev">chevron_right</span>
          <span aria-current="page" class="bk-crumbs__here">{{ current_tag }}</span>
        </template>
      </nav>

      <section class="bk-help__hero">
        <div class="bk-help__heroin">
          <h1>{{ t("bakini.help.h", "Help & Support") }}</h1>
          <p>{{ t("bakini.help.p", "Answers on orders, delivery, returns and payment, and a way to ask us anything.") }}</p>
          <div class="bk-help__acts">
            <button v-if="USER()" class="bk-btn -white" type="button" @click="dialog_faq = true"><span class="ms">add</span>{{ t("bakini.help.ask", "Ask a question") }}</button>
            <button v-else class="bk-btn -white" type="button" @click="signIn"><span class="ms">person</span>{{ t("bakini.help.signInAsk", "Sign in to ask") }}</button>
            <router-link :to="{ name: window.$storefront.routes.SHOP_CONTACT_US }" class="bk-help__contact">{{ t("bakini.help.contact", "Contact us") }}<span class="ms bk-chev">chevron_right</span></router-link>
          </div>
        </div>
        <bakini-slot class="bk-help__img" place="help-hero" />
      </section>

      <h2 class="bk-title bk-help__th">{{ t("bakini.help.topics", "Popular topics") }}</h2>
      <div class="bk-help__tiles">
        <router-link v-for="tp in topics" :key="tp.key" :to="tp.to" class="bk-help__tile">
          <span class="bk-help__ic"><span class="ms">{{ tp.icon }}</span></span>
          <b>{{ tp.title }}</b>
          <small>{{ tp.line }}</small>
        </router-link>
      </div>

      <h2 class="bk-title bk-help__th">{{ t("bakini.help.qa", "Questions and answers") }}</h2>
      <nav v-if="tags?.length" :aria-label="t('bakini.help.tags', 'Topics')" class="bk-tabs bk-help__tags">
        <router-link :class="{ '-on': !current_tag }" :to="{ name: 'ShopFAQ' }" class="bk-tab" exact>{{ t("bakini.help.all", "All") }}</router-link>
        <router-link v-for="tag in tags" :key="tag" :class="{ '-on': current_tag === tag }" :to="{ name: 'ShopFAQ', params: { tag: tag } }" class="bk-tab">{{ tag }}</router-link>
      </nav>

      <u-loading-progress v-if="busy_fetch"></u-loading-progress>

      <div v-if="faqs?.length" class="bk-help__list">
        <details v-for="faq in faqs" :key="faq.id" class="bk-help__qa">
          <summary><span v-html="faq.question"></span><span aria-hidden="true" class="ms">expand_more</span></summary>
          <div class="bk-help__a" v-html="faq.answer"></div>
          <a v-if="faq.link" :href="faq.link" class="bk-link" target="_blank">{{ $t("global.faq.read_more") }}<span class="ms">open_in_new</span></a>
        </details>
      </div>
      <div v-else-if="!busy_fetch" class="bk-pcard bk-empty bk-help__empty">
        <span aria-hidden="true" class="bk-empty__ic"><span class="ms">forum</span></span>
        <p class="bk-empty__t">{{ t("bakini.help.noneT", "No questions here yet") }}</p>
        <p class="bk-empty__p">{{ t("bakini.help.noneP", "{name} has not answered any questions here so far. Ask yours, or write to us directly.", { name: iso(shop?.title || "") }) }}</p>
        <router-link :to="{ name: window.$storefront.routes.SHOP_CONTACT_US }" class="bk-btn">{{ t("bakini.help.contact", "Contact us") }}</router-link>
      </div>

      <v-pagination v-if="pageCount > 1" v-model="page" :length="pageCount" class="k-faq__pages" rounded @update:model-value="fetchFAQData()" />
    </div>

    <!-- =================== Dialog =================== -->
    <v-bottom-sheet v-model="dialog_faq" content-class="rounded-t-xl" max-width="98vw" width="860">
      <v-card class="text-start" rounded="t-xl">
        <v-card-title>
          <v-icon class="me-2"> fa:fas fa-question</v-icon>
          {{ $t("global.faq.add_new") }}
        </v-card-title>
        <v-card-text>
          <v-textarea
            v-model="question"
            :label="$t('global.faq.question_input')"
            :placeholder="$t('global.faq.question_input_placeholder')"
            auto-grow
            variant="underlined"
          />
        </v-card-text>
        <v-card-actions>
          <div class="widget-buttons">
            <v-btn :class="{ disabled: !question }" :loading="busy" color="primary" prepend-icon="check" size="x-large" variant="elevated" @click="sendFAQ">
              {{ $t("global.actions.confirm") }}
            </v-btn>
          </div>
        </v-card-actions>
      </v-card>
    </v-bottom-sheet>
  </div>
</template>

<script lang="ts">
import { iso, withRetry } from "@app-storefront/components/bakini/bakini";
import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

import { throttle } from "lodash-es";
import { EventBus } from "@selldone/components-vue/utils/events/EventBus.ts";
import ULoadingProgress from "@selldone/components-vue/ui/loading/progress/ULoadingProgress.vue";
import BakiniSlot from "../../components/bakini/BakiniSlot.vue";
import { t } from "../../components/kalio/i18n/kalio-i18n";

export default {
  name: "StorefrontPageFaq",
  components: { ULoadingProgress, BakiniSlot },
  props: {
    shop: {
      require: true,
      type: Object,
    },
  },

  data() {
    return {
      drawer: false,

      dialog_faq: false,
      question: "",
      busy: false,
      busy_fetch: false,

      faqs: [],
      tags: [],

      total: true,

      search: null,
      //----------------------
      page: 1,
    };
  },
  computed: {
    /* Topic tiles: every one leads to one of the shop's own pages. */
    topics() {
      const r = window.$storefront.routes;
      return [
        { key: "track", icon: "local_shipping", title: t("bakini.svc.track", "Track my order"), line: t("bakini.help.trackL", "Where your parcel is, and its messages"), to: { name: r.HISTORY_ORDERS_PHYSICAL } },
        { key: "returns", icon: "assignment_return", title: t("bakini.svc.returns", "Delivery & returns"), line: t("bakini.help.returnsL", "How delivery and returns work here"), to: { name: r.SHOP_PROFILE_PAGE_TERMS } },
        { key: "account", icon: "person", title: t("bakini.help.account", "Your account"), line: t("bakini.help.accountL", "Orders, addresses and saved items"), to: { name: "KalioAccountHome" } },
        { key: "compare", icon: "compare_arrows", title: t("bakini.svc.compare", "Compare products"), line: t("bakini.help.compareL", "Put up to four side by side"), to: { name: r.COMPARISON_PAGE } },
        { key: "privacy", icon: "shield_lock", title: t("bakini.help.privacy", "Privacy & data"), line: t("bakini.help.privacyL", "How we use and protect your details"), to: { name: r.SHOP_PROFILE_PAGE_PRIVACY } },
        { key: "contact", icon: "mail", title: t("bakini.svc.contact", "Contact us"), line: t("bakini.help.contactL", "Write to our team"), to: { name: r.SHOP_CONTACT_US } },
      ];
    },
    current_tag() {
      return this.$route.params.tag;
    },
    pageCount() {
      return Math.ceil(this.total / 10);
    },
  },
  watch: {
    current_tag() {
      this.drawer = false;
      this.offset = 0;
      this.fetchFAQData();
    },
    search: throttle(function (newVal) {
      this.page = 1;
      this.fetchFAQData(newVal);
    }, window.SERACH_THROTTLE),
  },
  created() {
    this.setPageTitle("FAQ"); // Set Page Title!
    this.fetchFAQData();
    this.fetchFAQTags();
  },
  methods: {
    iso,
    t,
    /** Kalio: sign in to ask a question. */
    signIn() {
      EventBus.$emit("need-login", true);
    },
    //――――――――――――――――――――――― FAQ Tags ―――――――――――――――――――――――

    fetchFAQTags() {
      /* Tried again after a 429 (withRetry); no tags is not an error. */
      withRetry(() => axios.get(window.XAPI.GET_FAQ_TAGS(this.shop.name)))
        .then(({ data }) => {
          this.tags = data.tags;
        })
        .catch(() => {});
    },

    //――――――――――――――――――――――― FAQs ―――――――――――――――――――――――

    fetchFAQData() {
      this.busy_fetch = true;
      withRetry(() =>
        axios.get(window.XAPI.GET_FAQ(this.shop.name), {
          params: {
            offset: (this.page - 1) * 10,
            limit: 10,
            tag: this.$route.params.tag,
            search: this.search,
          },
        }),
      )
        .then(({ data }) => {
          this.faqs = data.faqs;
          this.total = data.total;
        })
        .catch(() => {})
        .finally(() => {
          this.busy_fetch = false;
        });
    },

    sendFAQ() {
      this.busy = true;
      axios
        .post(window.XAPI.POST_SEND_QUESTION(this.shop.name), {
          question: this.question,
        })
        .then(({ data }) => {
          if (data.error) {
            NotificationService.showErrorAlert(null, data.error_msg);
          } else {
            this.question = null;
            NotificationService.showSuccessAlert(
              null,
              this.$t("global.faq.notifications.success_add"),
            );
            this.dialog_faq = false;
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy = false;
        });
    },
  },
};
</script>

<style lang="scss" scoped>
.faq-container {
  text-align: start;
  max-width: 1100px;

  .faq {
    margin: 8px 0;
    padding: 14px 8px;

    .question {
      font-size: 1rem;
      font-weight: 700;
      margin-bottom: 6px;
    }

    .answer {
      font-size: 1rem;
      font-weight: 400;
      line-height: 1.7rem;
    }
  }

  margin: auto;
}
</style>
