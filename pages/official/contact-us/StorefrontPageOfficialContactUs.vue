<!--
  - Copyright (c) 2023. Selldone® Business OS™
  -
  - Author: M.Pajuhaan
  - Web: https://selldone.com
  -->
<!--
  Medio — Contact us (digini-design/contact-b.html).

  A message form (name, email, order number, topic, message) sent with
  Selldone's own contact form call, and beside it how else to reach the
  shop. When the shop has written its "Contact us" page in the dashboard,
  that text is shown there; until then sample cards under a clear "Sample
  text" note (the owner's rule for a test shop), and always a card to track
  an order. A missing page is not an error: nothing red is shown.
-->
<template>
  <div class="md-contact">
    <h1 class="md-contact__h">{{ t("contact.pageTitle", "Contact us") }}</h1>
    <p class="md-contact__lede">{{ t("medio.contact.lede", "Questions about a product or an order? Write to us and we'll get back to you.") }}</p>

    <div class="md-contact__cols">
      <section aria-labelledby="md-contact-form" class="md-contact__form">
        <template v-if="submitted">
          <div class="md-empty">
            <span class="md-empty__ic"><span class="ms">mark_email_read</span></span>
            <p id="md-contact-form" class="md-empty__t">{{ t("medio.contact.sent", "Thanks, your message is on its way") }}</p>
            <p class="md-empty__p">{{ t("medio.contact.sentLine", "We usually answer within a working day, at the email you gave us.") }}</p>
            <button class="md-btn -line" type="button" @click="submitted = false">{{ t("medio.contact.another", "Send another message") }}</button>
          </div>
        </template>
        <form v-else novalidate @submit.prevent="sendForm">
          <h2 id="md-contact-form">{{ t("medio.contact.formTitle", "Send us a message") }}</h2>
          <div class="md-form">
            <label class="md-field">
              <span>{{ t("medio.contact.name", "Name") }}</span>
              <input v-model.trim="name" :placeholder="t('medio.contact.namePh', 'Your name')" autocomplete="name" type="text" />
            </label>
            <label :class="{ '-bad': tried && !emailOk }" class="md-field">
              <span>{{ t("basket.who.email", "Email") }}</span>
              <input v-model.trim="email" autocomplete="email" placeholder="you@example.com" type="email" />
              <small v-if="tried && !emailOk">{{ t("medio.contact.emailBad", "Please enter your email, so we can answer.") }}</small>
            </label>
            <label class="md-field">
              <span>{{ t("medio.contact.order", "Order number (optional)") }}</span>
              <input v-model.trim="order" :placeholder="t('medio.contact.orderPh', 'e.g. {n}', { n: '1042' })" type="text" />
            </label>
            <label class="md-field">
              <span>{{ t("blog.heading.topic", "Topic") }}</span>
              <select v-model="category">
                <option v-for="tp in topics" :key="tp.v" :value="tp.v">{{ tp.label }}</option>
              </select>
            </label>
            <label :class="{ '-bad': tried && !message }" class="md-field -wide">
              <span>{{ t("medio.contact.message", "Message") }}</span>
              <textarea v-model="message" :placeholder="t('medio.contact.messagePh', 'How can we help?')" rows="5"></textarea>
              <small v-if="tried && !message">{{ t("medio.contact.messageBad", "Please write your message.") }}</small>
            </label>
          </div>
          <div class="md-contact__send">
            <button :disabled="busy_send" class="md-btn" type="submit">
              <span class="ms">send</span>{{ busy_send ? t("medio.contact.sending", "Sending…") : t("medio.contact.send", "Send message") }}
            </button>
            <small>{{ t("medio.contact.answer", "We usually answer within a working day.") }}</small>
          </div>
          <p v-if="error" class="md-contact__err" role="alert">{{ error }}</p>
        </form>
      </section>

      <aside :aria-label="t('medio.contact.other', 'Other ways to reach us')" class="md-contact__side">
        <div v-if="profile && profileText" class="md-contact__card -profile">
          <s-article-editor :body="profile.body" :edit="false" :enable-title="false" :only-view="true" class="k-prose" />
        </div>
        <template v-else-if="!busy">
          <kalio-sample-note />
          <div v-for="c in samples" :key="c.title" class="md-contact__card">
            <span class="md-contact__ic"><span class="ms">{{ c.icon }}</span></span>
            <div>
              <b>{{ c.title }}</b>
              <p>{{ c.line }}</p>
              <span class="md-contact__more">{{ c.more }}</span>
            </div>
          </div>
        </template>
        <div class="md-contact__card">
          <span class="md-contact__ic"><span class="ms">local_shipping</span></span>
          <div>
            <b>{{ t("medio.contact.track", "Track an order") }}</b>
            <p>{{ t("medio.contact.trackLine", "Your orders, their status and messages are in your account.") }}</p>
            <router-link :to="{ name: window.$storefront.routes.HISTORY_ORDERS_PHYSICAL }" class="md-link">{{ t("medio.contact.trackGo", "Track order") }}<span class="ms md-chev">chevron_right</span></router-link>
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>

<script lang="ts">
import SArticleEditor from "@selldone/components-vue/article/SArticleEditor.vue";
import KalioSampleNote from "../../../components/kalio/pages/KalioSampleNote.vue";
import { plainText } from "../../../components/kalio/pages/kalio-sample-pages";
import { t } from "@app-storefront/components/kalio/i18n/kalio-i18n";

export default {
  name: "StorefrontPageOfficialContactUs",
  components: { SArticleEditor, KalioSampleNote },
  inject: ["$shop"],

  data: () => ({
    window,
    profile: null as any,
    busy: false,
    name: "",
    email: "",
    order: "",
    message: "",
    /* Sent to the shop in English (the team reads one language); shown in
       the visitor's. */
    category: "A product question",
    busy_send: false,
    submitted: false,
    tried: false,
    error: null as string | null,
  }),

  computed: {
    emailOk(): boolean {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email || "");
    },
    profileText(): string {
      return plainText(this.profile?.body);
    },
    topics() {
      return [
        { v: "A product question", label: t("medio.contact.t1", "A product question") },
        { v: "An order I placed", label: t("medio.contact.t2", "An order I placed") },
        { v: "Delivery or pickup", label: t("medio.contact.t3", "Delivery or pickup") },
        { v: "Returns and refunds", label: t("medio.contact.t4", "Returns and refunds") },
        { v: "Something else", label: t("medio.contact.t5", "Something else") },
      ];
    },
    samples() {
      /* Sample cards (the address and number are sample data, as written). */
      return [
        { icon: "mail", title: t("medio.contact.emailUs", "Email us"), line: "hello@medio.example", more: t("medio.contact.emailMore", "Answers within a working day") },
        { icon: "call", title: t("medio.contact.callUs", "Call us"), line: "+1 305 555 0100", more: t("medio.contact.callMore", "Mon–Fri, 9 AM – 6 PM") },
        { icon: "location_on", title: t("medio.contact.visit", "Visit"), line: "100 Biscayne Blvd, Miami, FL 33132", more: t("medio.contact.visitMore", "Pickup point") },
      ];
    },
  },

  created() {
    this.setPageTitle(t("contact.pageTitle", "Contact us"));
    this.fetchProfile();
    const u = this.USER();
    if (u) {
      this.name = u.name || "";
      this.email = u.email || "";
    }
  },

  methods: {
    /* The shop's own "Contact us" page, if it wrote one. None is not an error. */
    fetchProfile() {
      this.busy = true;
      window.axios
        .get(window.XAPI.GET_SHOP_PROFILE(this.$shop.name, "contact-us"))
        .then(({ data }: any) => {
          this.profile = data?.error ? null : data.profile;
        })
        .catch(() => (this.profile = null))
        .finally(() => (this.busy = false));
    },
    sendForm() {
      this.tried = true;
      this.error = null;
      const text = String(this.message || "").replace(/<[^>]*>?/gm, "").trim();
      if (!text || !this.emailOk) return;
      this.busy_send = true;
      window.axios
        .post(window.XAPI.POST_CONTACT_US_FORM(this.$shop.name), {
          name: this.name,
          email: this.email,
          phone: this.USER()?.phone || null,
          message: this.order ? `Order ${this.order}\n\n${text}` : text,
          category: this.category,
          url: window.location.href,
        })
        .then(({ data }: any) => {
          if (data?.error) {
            this.error = data.error_msg || t("medio.contact.failed", "That did not go through. Please try again.");
            return;
          }
          this.message = "";
          this.order = "";
          this.tried = false;
          this.submitted = true;
        })
        .catch(() => (this.error = t("medio.contact.failedLater", "That did not go through. Please try again in a moment.")))
        .finally(() => (this.busy_send = false));
    },
  },
};
</script>
