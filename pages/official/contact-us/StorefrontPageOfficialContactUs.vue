<!--
  Bakini Noir — Contact (bakio-design/contact-b.html, b/pages-read.js
  N.pages.contact): "Talk to the bakery." with the shop's real lines (the
  address, the phone, the email, the open days and counter hours, the pickup
  counter) beside the counter on the map; then the message form (name,
  email, message, Send), sent with Selldone's own contact call. Missing
  fields are named under each field before sending. When the shop has
  written its own "Contact us" page, its text shows above the form. A
  missing page is not an error: nothing red is shown ("Store profile not
  found" never appears).
-->
<template>
  <div class="nx nx-contact">
    <section class="wrap ct">
      <div class="ct-hd">
        <nx-crumbs :items="[{ label: t('bakini.n.rd.contactCrumb', 'Contact') }]" />
        <h1 class="serif">{{ t("bakini.n.rd.ctH", "Talk to") }} <em>{{ t("bakini.n.rd.ctHem", "the bakery.") }}</em></h1>
        <p class="muted">{{ lede }}</p>
      </div>

      <div class="ct-grid">
        <div class="gcard ct-info">
          <div class="ilines">
            <div v-if="f.address" class="iline">
              <nx-icon name="pin" />
              <div>
                <b><bdi>{{ street }}</bdi></b><span><bdi>{{ fullCity }}</bdi></span>
              </div>
            </div>
            <div v-if="f.phone" class="iline">
              <nx-icon name="phone" />
              <div>
                <b><a :href="'tel:' + f.phone.replace(/[^\d+]/g, '')" dir="ltr">{{ f.phone }}</a></b
                ><span>{{ f.hours ? t("bakini.n.rd.phoneHours", "Every day during counter hours") : t("bakini.n.rd.phoneAny", "Call the bakery") }}</span>
              </div>
            </div>
            <div v-if="f.email" class="iline">
              <nx-icon name="mail" />
              <div>
                <b><a :href="'mailto:' + f.email">{{ f.email }}</a></b><span>{{ t("bakini.n.rd.mailFor", "For orders, ingredients and allergens") }}</span>
              </div>
            </div>
            <div v-if="open" class="iline">
              <nx-icon name="clock" />
              <div>
                <b>{{ open }}</b><span v-if="f.everyDay">{{ t("bakini.n.rd.monSunShort", "Monday to Sunday") }}</span>
              </div>
            </div>
            <div v-if="f.pickup" class="iline">
              <nx-icon name="store" />
              <div>
                <b>{{ t("bakini.n.rd.pickupCounter", "Pickup counter") }}</b><span>{{ pickupLine }}</span>
              </div>
            </div>
          </div>
          <div v-if="f.location" class="ct-map"><nx-map :line="[street, f.hours].filter(Boolean).join(' · ')" :location="f.location" :title="name" /></div>
        </div>

        <form class="gcard ct-form" novalidate @submit.prevent="send">
          <div class="gc-hd">
            <h2>{{ t("bakini.n.rd.sendH", "Send a message") }}</h2>
          </div>
          <div v-if="own" class="prose nx-own" v-html="ownHtml"></div>
          <template v-if="!sent">
            <div class="fgrid">
              <label :class="['fld', { err: errs.name }]">
                <span>{{ t("bakini.n.rd.fName", "Name") }}</span>
                <input v-model.trim="form.name" :placeholder="t('bakini.n.rd.fNamePh', 'Your name')" autocomplete="name" name="name" />
                <small class="hint">{{ errs.name }}</small>
              </label>
              <label :class="['fld', { err: errs.email }]">
                <span>{{ t("bakini.n.rd.fEmail", "Email") }}</span>
                <input v-model.trim="form.email" autocomplete="email" name="email" placeholder="you@example.com" type="email" />
                <small class="hint">{{ errs.email }}</small>
              </label>
              <label :class="['fld', 'full', { err: errs.message }]">
                <span>{{ t("bakini.n.rd.fMessage", "Message") }}</span>
                <textarea v-model="form.message" :placeholder="t('bakini.n.rd.fMessagePh', 'How can the bakery help?')" name="message" rows="6"></textarea>
                <small class="hint">{{ errs.message }}</small>
              </label>
            </div>
            <p v-if="failed" class="nx-fail" role="alert">{{ failed }}</p>
            <div class="ct-send">
              <p class="muted">{{ t("bakini.n.rd.replies", "The bakery replies by email.") }}</p>
              <button :disabled="busy" class="btn lg" type="submit"><nx-icon name="send" />{{ t("bakini.n.rd.send", "Send") }}</button>
            </div>
          </template>
          <div v-else class="ct-ok" role="status">
            <span class="ec big"><nx-icon name="check" /></span>
            <b class="serif">{{ t("bakini.n.rd.thanks", "Thank you.") }}</b>
            <p class="muted">{{ t("bakini.n.rd.sentP", "Your message is on its way. The bakery replies at the email you gave.") }}</p>
            <button class="btn ghost sm" type="button" @click="sent = false">{{ t("bakini.n.rd.another", "Send another message") }}</button>
          </div>
        </form>
      </div>
    </section>
  </div>
</template>

<script lang="ts">
import NxIcon from "@app-storefront/components/bakini/noir/NxIcon.vue";
import NxMap from "@app-storefront/components/bakini/noir/NxMap.vue";
import NxCrumbs from "@app-storefront/components/bakini/noir/read/NxCrumbs.vue";
import { shopFacts } from "@app-storefront/components/bakini/noir/noir";
import { cityLine, openLine, ownText, shopName, shopProfile, streetOf } from "@app-storefront/components/bakini/noir/read/rd";
import { t } from "@app-storefront/components/kalio/i18n/kalio-i18n";

export default {
  name: "StorefrontPageOfficialContactUs",
  components: { NxIcon, NxMap, NxCrumbs },
  inject: ["$shop"],

  data: () => ({
    profile: null as any,
    form: { name: "", email: "", message: "" },
    errs: { name: "", email: "", message: "" } as Record<string, string>,
    busy: false,
    sent: false,
    failed: "",
  }),

  computed: {
    shop() {
      return this.$store.getters.getShop;
    },
    f() {
      return shopFacts(this.shop);
    },
    name() {
      return shopName(this.shop);
    },
    street() {
      return streetOf(this.f);
    },
    fullCity() {
      return [cityLine(this.f), this.f.country].filter(Boolean).join(", ");
    },
    open() {
      return openLine(this.f);
    },
    pickupLine() {
      const note = this.f.pickupNote ? this.f.pickupNote.split(".")[0] + "." : "";
      const free = this.f.pickup && !this.f.pickup.fee ? t("bakini.n.rd.pickupChoose", "Choose Pickup at checkout — it is free.") : t("bakini.n.rd.pickupChoosePaid", "Choose Pickup at checkout.");
      return [note, free].filter(Boolean).join(" ");
    },
    lede() {
      return this.f.everyDay
        ? t("bakini.n.rd.ctLede", "Questions about an order, ingredients or allergens — the counter is open every day.")
        : t("bakini.n.rd.ctLede2", "Questions about an order, ingredients or allergens — write or call the bakery.");
    },
    own() {
      return ownText(this.profile?.body);
    },
    ownHtml() {
      return String(this.profile?.body || "").replace(/\scontenteditable="[^"]*"/g, "");
    },
  },

  created() {
    this.setPageTitle?.(t("bakini.n.rd.contactCrumb", "Contact"));
    shopProfile(this.$shop.name, "contact-us").then((p) => (this.profile = p));
    const u = this.USER?.();
    if (u) {
      this.form.name = u.name || "";
      this.form.email = u.email || "";
    }
  },

  methods: {
    t,
    check() {
      const f = this.form;
      this.errs = {
        name: f.name.length > 1 ? "" : t("bakini.n.rd.errName", "Add your name"),
        email: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email) ? "" : f.email ? t("bakini.n.rd.errEmailBad", "Check the email address") : t("bakini.n.rd.errEmail", "Add your email"),
        message: f.message.trim().length > 3 ? "" : t("bakini.n.rd.errMessage", "Write a message"),
      };
      const first = ["name", "email", "message"].find((k) => this.errs[k]);
      if (first) (this.$el.querySelector(`[name="${first}"]`) as HTMLElement | null)?.focus();
      return !first;
    },
    send() {
      this.failed = "";
      if (!this.check()) return;
      this.busy = true;
      window.axios
        .post(window.XAPI.POST_CONTACT_US_FORM(this.$shop.name), {
          name: this.form.name,
          email: this.form.email,
          phone: this.USER?.()?.phone || null,
          message: this.form.message.trim(),
          category: "Contact",
          url: window.location.href,
        })
        .then(({ data }: any) => {
          if (data?.error) {
            this.failed = t("bakini.n.rd.failed", "That did not go through. Please try again.");
            return;
          }
          this.form.message = "";
          this.sent = true;
        })
        .catch(() => (this.failed = t("bakini.n.rd.failedLater", "That did not go through. Please try again in a moment.")))
        .finally(() => (this.busy = false));
    },
  },
};
</script>
