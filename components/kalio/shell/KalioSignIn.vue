<!--
  Bakini Noir — the sign-in sheet (bakio-design/login-b.html, b/pages-buy.js
  N.pages.login): the wordmark (the shop's live title), "Sign in to <shop>."
  and why; the shop's own social ways in (Google, Apple, GitHub, LinkedIn,
  as the shop has switched them on) as quiet buttons; "or with email": the
  email field and "Email me a one-time code", then the six-digit code; and
  "Continue as guest" when the shop's checkout does not need an account. A
  dialog on a computer, a bottom sheet on a phone (the mockup's .dialog);
  ✕, Esc and a click outside close it. No "Login by Selldone" and no
  Selldone mark: Selldone's own account login is reached the same way as
  the socials only when it is the shop's single way in.

  The sign-in itself is Selldone's: socials go through the storefront's
  LoginShop (its OAuth page), the email code through
  window.$storefront.auth.email (requestOtp / verifyOTP) and SetToken, as
  Selldone's SShopLogin does. A phone (SMS) login, when the shop uses it,
  is Selldone's own SShopLogin, placed under the ways in. The sheet opens on
  the app's "need-login" event, as Selldone's did.
-->
<template>
  <teleport to="body">
    <div :dir="rtl ? 'rtl' : 'ltr'" class="nx nx-signin">
      <div :class="['scrim', { open: show }]" @click="close"></div>
      <div
        :aria-hidden="show ? undefined : 'true'"
        ref="dlg"
        :class="['dialog', 'nx-lg', { open: show }]"
        aria-labelledby="lg-t"
        aria-modal="true"
        role="dialog"
        tabindex="-1"
        @keydown.esc.stop="close"
      >
        <div :data-step="step" class="lg-card">
          <button :aria-label="t('bakini.n.rd.lgClose', 'Close')" class="iconbtn x nx-lg__x" type="button" @click="close"><nx-icon name="close" /></button>
          <bakini-logo :to="null" class="lg-wm" />

          <!-- 1. The ways in -->
          <div class="lg-s lg-start">
            <h1 id="lg-t" class="serif">{{ t("bakini.n.rd.lgH", "Sign in to") }} <em>{{ shopWord }}.</em></h1>
            <p class="muted">{{ t("bakini.n.rd.lgP", "Follow orders, keep addresses and reorder in a tap.") }}</p>
            <div v-if="socials.length" class="soc">
              <button v-for="s in socials" :key="s.mode" :disabled="!!redirecting" class="btn ghost" type="button" @click="social(s.mode)">
                <nx-icon :name="s.icon" />{{ redirecting === s.mode ? t("bakini.n.rd.lgOpening", "Opening…") : s.label }}
              </button>
            </div>
            <template v-if="emailOn">
              <p v-if="socials.length" class="or"><span>{{ t("bakini.n.rd.lgOr", "or with email") }}</span></p>
              <form class="lg-email" novalidate @submit.prevent="requestCode">
                <label :class="['fld', { err: emailErr }]">
                  <span>{{ t("bakini.n.rd.fEmail", "Email") }}</span>
                  <input ref="email" v-model.trim="email" autocomplete="email" placeholder="you@example.com" type="email" />
                  <small class="hint">{{ emailErr }}</small>
                </label>
                <button :disabled="busy" class="btn lg block" type="submit">{{ busy ? t("bakini.n.rd.lgSending", "Sending…") : t("bakini.n.rd.lgCode", "Email me a one-time code") }}</button>
              </form>
            </template>
            <s-shop-login v-if="smsOn" v-model:show="show" class="nx-lg__sms" />
            <template v-if="guest">
              <button class="btn quiet block" type="button" @click="close">{{ t("bakini.n.rd.lgGuest", "Continue as guest") }}</button>
              <p class="lg-note">{{ t("bakini.n.rd.lgGuestNote", "Checkout does not need an account.") }}</p>
            </template>
            <p class="lg-note">
              {{ t("bakini.n.rd.lgLegal", "By continuing you agree to the") }}
              <router-link :to="{ name: routes.SHOP_PROFILE_PAGE_TERMS }" class="t-act" @click="close">{{ t("bakini.n.rd.lgTerms", "Terms") }}</router-link>
              {{ t("bakini.n.rd.lgAnd", "and") }}
              <router-link :to="{ name: routes.SHOP_PROFILE_PAGE_PRIVACY }" class="t-act" @click="close">{{ t("bakini.n.rd.lgPrivacy", "Privacy") }}</router-link>.
            </p>
          </div>

          <!-- 2. The code -->
          <div class="lg-s lg-code">
            <button class="btn quiet sm" type="button" @click="back"><nx-icon cls="k-flip" name="arrowL" />{{ t("bakini.n.rd.lgBack", "Back") }}</button>
            <h1 class="serif">{{ t("bakini.n.rd.lgCheckH", "Check your") }} <em>{{ t("bakini.n.rd.lgCheckHem", "email.") }}</em></h1>
            <p class="muted">
              {{ t("bakini.n.rd.lgSent", "We sent a 6-digit code to") }} <b>{{ email }}</b>{{ t("bakini.n.rd.lgExpires", ". It expires in 10 minutes.") }}
            </p>
            <div class="otp" dir="ltr">
              <input
                v-for="(d, i) in digits"
                :key="i"
                :ref="(el) => (boxes[i] = el)"
                :aria-label="t('bakini.n.rd.lgDigit', 'Digit {n}', { n: i + 1 })"
                :value="d"
                autocomplete="one-time-code"
                inputmode="numeric"
                maxlength="1"
                @input="onDigit(i, $event)"
                @keydown="onKey(i, $event)"
                @paste="onPaste($event)"
              />
            </div>
            <p class="hint-err" role="alert">{{ codeErr }}</p>
            <button :disabled="busy" class="btn lg block" type="button" @click="verify">{{ busy ? t("bakini.n.rd.lgChecking", "Checking…") : t("bakini.n.rd.lgSignIn", "Sign in") }}</button>
            <button :disabled="busy" class="link" type="button" @click="requestCode">{{ t("bakini.n.rd.lgResend", "Send a new code") }}</button>
          </div>

          <!-- 3. Signed in -->
          <div class="lg-s lg-done">
            <span class="ec big"><nx-icon name="check" /></span>
            <h1 class="serif">{{ t("bakini.n.rd.lgDoneH", "You’re") }} <em>{{ t("bakini.n.rd.lgDoneHem", "signed in.") }}</em></h1>
            <p class="muted">{{ email ? t("bakini.n.rd.lgAs", "Signed in as {email}.", { email }) : "" }}</p>
            <router-link :to="{ name: 'KalioAccountHome' }" class="btn lg block" @click="close">{{ t("bakini.n.rd.lgAccount", "Go to your account") }}</router-link>
            <button class="btn quiet block" type="button" @click="close">{{ t("bakini.n.rd.lgBackShop", "Back to the shop") }}</button>
          </div>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script>
import { throttle } from "lodash-es";
import SShopLogin from "@selldone/components-vue/storefront/login/SShopLogin.vue";
import { EventBus } from "@selldone/components-vue/utils/events/EventBus.ts";
import BakiniLogo from "../../bakini/BakiniLogo.vue";
import NxIcon from "../../bakini/noir/NxIcon.vue";
import { guestCheckout } from "../../bakini/noir/read/rd";
import { isRtl } from "../../region-switcher/region";
import { t } from "../i18n/kalio-i18n";

/* The social ways in this sheet draws, in the mockup's order. */
const SOCIAL = [
  { mode: "google", icon: "google", label: "Google" },
  { mode: "apple", icon: "apple", label: "Apple" },
  { mode: "github", icon: "github", label: "GitHub" },
  { mode: "linkedin", icon: "linkedin", label: "LinkedIn" },
  { mode: "facebook", icon: "user", label: "Facebook" },
];

export default {
  name: "KalioSignIn",
  components: { SShopLogin, BakiniLogo, NxIcon },
  inject: ["$shop"],

  data: () => ({
    show: false,
    step: "start",
    email: "",
    emailErr: "",
    digits: ["", "", "", "", "", ""],
    boxes: [],
    codeErr: "",
    busy: false,
    redirecting: "",
  }),

  computed: {
    shop() {
      return this.$store.getters.getShop || this.$shop;
    },
    routes() {
      return window.$storefront.routes;
    },
    rtl() {
      return isRtl();
    },
    shopWord() {
      return String(this.shop?.title || "").toLowerCase();
    },
    modes() {
      return Array.isArray(this.shop?.login_modes) ? this.shop.login_modes : [];
    },
    socials() {
      const list = SOCIAL.filter((s) => this.modes.includes(s.mode));
      /* Selldone's own account login only when it is the shop's single way in. */
      if (!list.length && !this.emailOn && !this.smsOn && this.modes.includes("selldone")) return [{ mode: "selldone", icon: "user", label: t("bakini.n.rd.lgContinue", "Continue") }];
      return list;
    },
    emailOn() {
      return this.modes.includes("email");
    },
    smsOn() {
      return this.modes.includes("sms");
    },
    guest() {
      return guestCheckout(this.shop) && !this.$store.getters.getUser;
    },
    user() {
      return this.$store.getters.getUser;
    },
  },

  watch: {
    show(value) {
      this.$store.commit("setForceHideNavigation", value);
      document.documentElement.style.overflow = value ? "hidden" : "";
      if (value) {
        this.step = "start";
        this.codeErr = "";
        this.emailErr = "";
        this.redirecting = "";
        /* Focus moves into the sheet (Tab and Esc work at once) and back to
           the button that opened it on close. */
        this.opener = document.activeElement;
        this.$nextTick(() => this.$refs.dlg?.focus({ preventScroll: true }));
      } else if (this.opener && document.contains(this.opener)) {
        this.opener.focus({ preventScroll: true });
        this.opener = null;
      }
    },
    /* Signed in (by the code or a redirect back): say so, then close. */
    user(u) {
      if (u && this.show) {
        this.step = "done";
        setTimeout(() => (this.show = false), 1400);
      }
    },
  },

  mounted() {
    /* Esc closes the sheet wherever the focus is (a click on the page behind
       can leave it outside the sheet). */
    this.onEsc = (e) => {
      if (e.key === "Escape" && this.show) this.close();
    };
    document.addEventListener("keydown", this.onEsc);
  },
  beforeUnmount() {
    document.removeEventListener("keydown", this.onEsc);
  },

  created() {
    EventBus.$on(
      "need-login",
      throttle((show) => {
        this.show = show;
      }, 800),
    );
  },

  methods: {
    t,
    close() {
      this.show = false;
    },
    back() {
      this.step = "start";
      this.$nextTick(() => this.$refs.email?.focus());
    },
    social(mode) {
      this.redirecting = mode;
      try {
        this.LoginShop(null, mode === "selldone" ? null : mode, false);
      } catch (e) {
        this.redirecting = "";
      }
    },
    requestCode() {
      const ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(this.email || "");
      this.emailErr = ok ? "" : this.email ? t("bakini.n.rd.errEmailBad", "Check the email address") : t("bakini.n.rd.errEmail", "Add your email");
      if (!ok) return this.$refs.email?.focus();
      this.busy = true;
      this.codeErr = "";
      window.$storefront.auth.email
        .requestOtp(this.email)
        .then(() => {
          this.digits = ["", "", "", "", "", ""];
          this.step = "code";
          this.$nextTick(() => this.boxes[0]?.focus());
        })
        .catch((e) => {
          const msg = e?.error_msg || t("bakini.n.rd.lgFailed", "That did not go through. Please try again.");
          if (this.step === "code") this.codeErr = msg;
          else this.emailErr = msg;
        })
        .finally(() => (this.busy = false));
    },
    verify() {
      const code = this.digits.join("");
      if (code.length < 6) {
        this.codeErr = t("bakini.n.rd.lgAll6", "Enter all 6 digits.");
        return;
      }
      this.busy = true;
      this.codeErr = "";
      window.$storefront.auth.email
        .verifyOTP(this.email, code, "customer")
        .then(({ token, expires_in }) => {
          const expire = new Date();
          expire.setUTCSeconds(expires_in);
          window.SetToken(token, expire, "access_token");
          this.step = "done";
        })
        .catch((e) => (this.codeErr = e?.error_msg || t("bakini.n.rd.lgWrong", "That code did not work. Check it, or send a new one.")))
        .finally(() => (this.busy = false));
    },
    onDigit(i, e) {
      const v = String(e.target.value || "").replace(/\D/g, "").slice(-1);
      this.digits[i] = v;
      e.target.value = v;
      if (v && this.boxes[i + 1]) this.boxes[i + 1].focus();
      if (v && i === 5 && this.digits.join("").length === 6) this.verify();
    },
    onKey(i, e) {
      if (e.key === "Backspace" && !this.digits[i] && this.boxes[i - 1]) this.boxes[i - 1].focus();
      if (e.key === "Enter") this.verify();
    },
    onPaste(e) {
      const text = (e.clipboardData?.getData("text") || "").replace(/\D/g, "").slice(0, 6);
      if (!text) return;
      e.preventDefault();
      text.split("").forEach((c, k) => (this.digits[k] = c));
      (this.boxes[text.length] || this.boxes[5])?.focus();
      if (text.length === 6) this.verify();
    },
  },
};
</script>
