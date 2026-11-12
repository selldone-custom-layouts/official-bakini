<!--
  Bakini Noir — FAQ (bakio-design/faq-b.html, b/pages-read.js N.pages.faq):
  "Questions, answered." with topic chips; the questions as an accordion
  (the first open); beside them "Still have a question?" with the bakery's
  phone and email and "Contact the bakery".

  The questions are the shop's own (Selldone's FAQ, its tags as the topics)
  when it has some; until then sample questions about ordering pieces,
  delivery windows, pickup, the way to pay and allergens, built from the
  shop's facts and labelled "Sample text — the shop has not written this
  page yet".
-->
<template>
  <div class="nx nx-faq">
    <section class="wrap faq">
      <div class="faq-hd">
        <nx-sample-tag v-if="!own && !busy" />
        <h1 class="serif">{{ t("bakini.n.rd.faqH", "Questions,") }} <em>{{ t("bakini.n.rd.faqHem", "answered.") }}</em></h1>
        <div v-if="groups.length > 1" :aria-label="t('bakini.n.rd.topics', 'Topics')" class="faq-tabs" role="group">
          <button :aria-pressed="group === '' ? 'true' : 'false'" class="chip" type="button" @click="group = ''">{{ t("bakini.n.rd.all", "All") }}</button>
          <button v-for="g in groups" :key="g" :aria-pressed="group === g ? 'true' : 'false'" class="chip" type="button" @click="group = g">{{ g }}</button>
        </div>
      </div>
      <div class="faq-grid">
        <div class="faq-list">
          <template v-if="!busy">
            <details v-for="(q, i) in shown" :key="q.key" :open="i === 0" class="fq">
              <summary>
                <span>{{ q.q }}</span><span class="fq-i"><nx-icon name="plus" /></span>
              </summary>
              <div v-if="q.html" class="prose nx-faq-a" v-html="q.a"></div>
              <p v-else>{{ q.a }}</p>
            </details>
          </template>
          <div v-else aria-hidden="true" class="nx-skel">
            <div v-for="n in 4" :key="n" class="nx-skel__line -fq"></div>
          </div>
        </div>
        <aside class="gcard faq-ask">
          <span class="dm-ic"><nx-icon name="help" /></span>
          <h2 class="serif">{{ t("bakini.n.rd.stillH", "Still have a question?") }}</h2>
          <p class="muted">{{ t("bakini.n.rd.stillP", "The bakery answers about orders, ingredients and allergens.") }}</p>
          <div v-if="f.phone || f.email" class="ilines">
            <div v-if="f.phone" class="iline">
              <nx-icon name="phone" />
              <div>
                <b><a :href="'tel:' + f.phone.replace(/[^\d+]/g, '')" dir="ltr">{{ f.phone }}</a></b><span v-if="f.hours">{{ f.everyDay ? t("bakini.n.rd.everyDayHours", "Every day {hours}", { hours: f.hours }) : f.hours }}</span>
              </div>
            </div>
            <div v-if="f.email" class="iline">
              <nx-icon name="mail" />
              <div>
                <b><a :href="'mailto:' + f.email">{{ f.email }}</a></b><span>{{ t("bakini.n.rd.byEmail", "Replies by email") }}</span>
              </div>
            </div>
          </div>
          <router-link :to="{ name: contactRoute }" class="btn">{{ t("bakini.n.rd.contactBakery", "Contact the bakery") }}</router-link>
        </aside>
      </div>
    </section>
  </div>
</template>

<script lang="ts">
import NxIcon from "@app-storefront/components/bakini/noir/NxIcon.vue";
import NxSampleTag from "@app-storefront/components/bakini/noir/read/NxSampleTag.vue";
import { money, shopFacts } from "@app-storefront/components/bakini/noir/noir";
import { guestCheckout, sampleFaq } from "@app-storefront/components/bakini/noir/read/rd";
import { withRetry } from "@app-storefront/components/bakini/bakini";
import { t } from "@app-storefront/components/kalio/i18n/kalio-i18n";

export default {
  name: "StorefrontPageFaq",
  components: { NxIcon, NxSampleTag },
  props: { shop: { type: Object } },

  data: () => ({ faqs: [] as any[], busy: true, group: "" }),

  computed: {
    theShop() {
      return this.$store.getters.getShop || this.shop;
    },
    f() {
      return shopFacts(this.theShop);
    },
    own() {
      return this.faqs.length > 0;
    },
    /* The shop's questions (its first tag is the topic), else the sample. */
    items() {
      if (this.own)
        return this.faqs.map((x: any) => ({
          key: "f" + x.id,
          group: (x.tags && x.tags[0]) || "",
          q: x.question,
          a: x.answer || "",
          html: /<[a-z][\s\S]*>/i.test(String(x.answer || "")),
        }));
      return sampleFaq(this.theShop, this.f, (n: number) => money(n, true), guestCheckout(this.theShop)).map((x, i) => ({ key: "s" + i, group: x.group, q: x.q, a: x.a, html: false }));
    },
    groups() {
      return [...new Set(this.items.map((x: any) => x.group).filter(Boolean))];
    },
    shown() {
      return this.group ? this.items.filter((x: any) => x.group === this.group) : this.items;
    },
    contactRoute() {
      return window.$storefront.routes.SHOP_CONTACT_US;
    },
  },

  created() {
    this.setPageTitle?.(t("bakini.n.rd.faqTitle", "FAQ"));
    withRetry(() => window.axios.get(window.XAPI.GET_FAQ(this.theShop.name), { params: { offset: 0, limit: 50 } }))
      .then(({ data }: any) => (this.faqs = data?.faqs || []))
      .catch(() => (this.faqs = []))
      .finally(() => (this.busy = false));
  },

  methods: { t },
};
</script>
