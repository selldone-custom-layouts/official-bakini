<!--
  Bakini Noir — Terms of use and Privacy (bakio-design/terms-b.html,
  privacy-b.html; b/pages-read.js N.pages.terms / privacy).

  Terms: numbered sections with a sticky index beside them that follows the
  section being read. Privacy: three "at a glance" cards, a row of section
  chips, the sections as cards with an icon, and where to ask. The same
  family, not a copy.

  The text is the shop's own page (Selldone dashboard › Shop › Profile)
  when it has written one: its headings become the index. Until then sample
  copy from the shop's own facts, labelled "Sample text — the shop has not
  written this page yet".
-->
<template>
  <div :class="['nx', 'nx-legal', '-' + kind]">
    <section :class="['wrap', 'legal', { priv: kind === 'privacy' && !own }]">
      <div class="legal-hd">
        <nx-sample-tag v-if="!own && !busy" />
        <h1 v-if="kind === 'terms'" class="serif">{{ t("bakini.n.rd.termsH", "Terms of") }} <em>{{ t("bakini.n.rd.termsHem", "use.") }}</em></h1>
        <h1 v-else class="serif">{{ t("bakini.n.rd.privH", "Privacy,") }} <em>{{ t("bakini.n.rd.privHem", "plainly.") }}</em></h1>
        <p class="muted">{{ updated ? t("bakini.n.rd.updated", "Last updated: {date}", { date: updated }) : t("bakini.n.rd.notYet", "Last updated: not yet published by the shop.") }}</p>
      </div>

      <!-- The shop's own text, with its headings as the index -->
      <div v-if="own" class="legal-grid">
        <nav v-if="toc.length > 1" :aria-label="t('bakini.n.rd.sections', 'Sections')" class="legal-idx">
          <p class="eyebrow">{{ t("bakini.n.rd.sections", "Sections") }}</p>
          <ol>
            <li v-for="(s, i) in toc" :key="s.id">
              <a :aria-current="active === s.id ? 'true' : undefined" :href="'#' + s.id" @click.prevent="jump(s.id)"
                ><span>{{ i + 1 }}</span>{{ s.title }}</a
              >
            </li>
          </ol>
        </nav>
        <div ref="own" class="legal-body prose" v-html="ownHtml"></div>
      </div>

      <!-- Terms: sample sections with an index -->
      <div v-else-if="kind === 'terms'" class="legal-grid">
        <nav :aria-label="t('bakini.n.rd.sections', 'Sections')" class="legal-idx">
          <p class="eyebrow">{{ t("bakini.n.rd.sections", "Sections") }}</p>
          <ol>
            <li v-for="(s, i) in sections" :key="i">
              <a :aria-current="active === 't' + (i + 1) ? 'true' : undefined" :href="'#t' + (i + 1)" @click.prevent="jump('t' + (i + 1))"
                ><span>{{ i + 1 }}</span>{{ s.title }}</a
              >
            </li>
          </ol>
        </nav>
        <div class="legal-body">
          <section v-for="(s, i) in sections" :id="'t' + (i + 1)" :key="i" class="legal-sec">
            <h2>
              <span class="serif">{{ (i + 1 < 10 ? "0" : "") + (i + 1) }}</span>{{ s.title }}
            </h2>
            <p>{{ s.text }}</p>
          </section>
        </div>
      </div>

      <!-- Privacy: at a glance, chips, section cards, where to ask -->
      <template v-else>
        <div class="glance">
          <div class="gl">
            <span class="dm-ic"><nx-icon name="lock" /></span><b>{{ t("bakini.n.rd.glOnlyT", "Only what an order needs") }}</b><span>{{ t("bakini.n.rd.glOnly", "Contact, address and your note.") }}</span>
          </div>
          <div class="gl">
            <span class="dm-ic"><nx-icon name="cash" /></span><b>{{ f.gateway?.cod ? t("bakini.n.rd.glNoCardT", "No card details") : t("bakini.n.rd.glPayT", "Paid at checkout") }}</b
            ><span>{{ f.gateway?.cod ? t("bakini.n.rd.glNoCard", "Orders are paid in cash on delivery.") : t("bakini.n.rd.glPay", "Payment goes through the way to pay you choose.") }}</span>
          </div>
          <div class="gl">
            <span class="dm-ic"><nx-icon name="user" /></span><b>{{ guest ? t("bakini.n.rd.glGuestT", "Guest checkout") : t("bakini.n.rd.glAcctT", "Your account") }}</b
            ><span>{{ guest ? t("bakini.n.rd.glGuest", "An account is optional.") : t("bakini.n.rd.glAcct", "Your details stay in your account.") }}</span>
          </div>
        </div>
        <nav :aria-label="t('bakini.n.rd.sections', 'Sections')" class="priv-idx">
          <a v-for="(s, i) in sections" :key="i" :href="'#p' + (i + 1)" class="chip" @click.prevent="jump('p' + (i + 1))">{{ i + 1 }}. {{ s.title }}</a>
        </nav>
        <div class="priv-grid">
          <section v-for="(s, i) in sections" :id="'p' + (i + 1)" :key="i" class="gcard priv-sec">
            <span class="dm-ic"><nx-icon :name="s.icon || 'doc'" /></span>
            <h2>
              <span class="gold">{{ i + 1 }}.</span>{{ " " + s.title }}
            </h2>
            <p>{{ s.text }}</p>
          </section>
        </div>
        <div v-if="f.email || f.phone" class="gcard priv-ask">
          <div class="iline">
            <nx-icon name="mail" />
            <div>
              <b>{{ t("bakini.n.rd.askT", "Questions about your data?") }}</b>
              <span v-if="f.email && f.phone"
                >{{ t("bakini.n.rd.askWrite", "Write to") }} <a :href="'mailto:' + f.email" class="t-act">{{ f.email }}</a> {{ t("bakini.n.rd.askCall", "or call") }}
                <bdi dir="ltr">{{ f.phone }}</bdi>.</span
              >
              <span v-else-if="f.email">{{ t("bakini.n.rd.askWrite", "Write to") }} <a :href="'mailto:' + f.email" class="t-act">{{ f.email }}</a>.</span>
              <span v-else>{{ t("bakini.n.rd.askCallOnly", "Call") }} <bdi dir="ltr">{{ f.phone }}</bdi>.</span>
            </div>
          </div>
        </div>
      </template>
    </section>
  </div>
</template>

<script lang="ts">
import NxIcon from "../NxIcon.vue";
import NxSampleTag from "./NxSampleTag.vue";
import { money, shopFacts } from "../noir";
import { guestCheckout, ownText, samplePrivacy, sampleTerms, shopProfile } from "./rd";
import { currentCurrency } from "../../../region-switcher/region";
import { formatDate, t } from "../../../kalio/i18n/kalio-i18n";

export default {
  name: "NxLegal",
  components: { NxIcon, NxSampleTag },
  inject: ["$shop"],
  props: {
    /** "terms" | "privacy" */
    kind: { type: String, required: true },
  },

  data: () => ({ profile: null as any, busy: true, toc: [] as { id: string; title: string }[], active: "" }),

  computed: {
    shop() {
      return this.$store.getters.getShop;
    },
    f() {
      return shopFacts(this.shop);
    },
    guest() {
      return guestCheckout(this.shop);
    },
    own() {
      return ownText(this.profile?.body);
    },
    ownHtml() {
      return String(this.profile?.body || "").replace(/\scontenteditable="[^"]*"/g, "");
    },
    updated() {
      if (!this.own) return "";
      const d = this.profile?.updated_at || this.profile?.created_at;
      return d ? formatDate(d) : "";
    },
    sections() {
      return this.kind === "terms" ? sampleTerms(this.shop, this.f, (n: number) => money(n, true), currentCurrency()) : samplePrivacy(this.f);
    },
  },

  created() {
    this.setPageTitle?.(this.kind === "terms" ? t("bakini.n.rd.termsTitle", "Terms of use") : t("bakini.n.rd.privTitle", "Privacy"));
    shopProfile(this.$shop.name, this.kind).then((p) => {
      this.profile = p;
      this.busy = false;
      this.$nextTick(() => this.index());
    });
  },

  mounted() {
    this.$nextTick(() => this.follow());
  },

  beforeUnmount() {
    this.io?.disconnect();
  },

  methods: {
    t,
    /* The shop's own headings become the index. */
    index() {
      const root = this.$refs.own as HTMLElement | undefined;
      if (root) {
        const heads = [...root.querySelectorAll("h2")];
        const list = heads.length > 1 ? heads : [...root.querySelectorAll("h3")];
        this.toc = list.map((el, i) => {
          el.id = `l${i + 1}`;
          el.classList.add("legal-anchor");
          return { id: el.id, title: (el.textContent || "").trim() };
        });
      }
      this.$nextTick(() => this.follow());
    },
    /* The index follows the section being read. */
    follow() {
      this.io?.disconnect();
      if (!("IntersectionObserver" in window)) return;
      const ids = this.own ? this.toc.map((s: any) => s.id) : this.sections.map((_: any, i: number) => (this.kind === "terms" ? "t" : "p") + (i + 1));
      this.io = new IntersectionObserver(
        (es) => es.forEach((e) => e.isIntersecting && (this.active = (e.target as HTMLElement).id)),
        { rootMargin: "-30% 0px -60% 0px" },
      );
      ids.forEach((id: string) => {
        const el = document.getElementById(id);
        if (el) this.io.observe(el);
      });
    },
    jump(id: string) {
      const el = document.getElementById(id);
      if (!el) return;
      const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
      el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
      this.active = id;
    },
  },
};
</script>
