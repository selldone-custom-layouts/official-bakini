<!--
  Bakini Noir — a journal story (bakio-design/article-b.html, b/pages-read.js
  N.pages.article): one centred reading column (744px), the breadcrumb, the
  date, the title and the story's own description; the cover wider than the
  column; the story's text (body 18px, line-height 1.72; its links are the
  only underlined words on the site); then, under the text, ONE panel with
  the pastries the story links to (its /product/<id> links, read live; at
  most four, in a row, "Add all" in the panel's head; two by two on a
  phone); the Share row; the comments (Selldone's) with the sign-in in the
  same column; "More from the journal" last.
-->
<template>
  <div class="nx nx-article">
    <article v-if="article" class="ar">
      <div class="ar-col">
        <header class="ar-hd">
          <nx-crumbs :items="[{ label: t('bakini.n.rd.journal', 'Journal'), to: journalRoute() }, { label: t('bakini.n.rd.story', 'Story') }]" />
          <p v-if="article.created_at" class="eyebrow">
            <time :datetime="article.created_at">{{ fmtDate(article.created_at) }}</time>
          </p>
          <h1 class="serif">{{ article.title }}</h1>
          <p v-if="lede" class="ar-lede">{{ lede }}</p>
        </header>
      </div>
      <figure v-if="cover" class="ar-cover">
        <img :src="cover" :srcset="coverSrcset" alt="" fetchpriority="high" height="900" sizes="(max-width: 1160px) 96vw, 1120px" width="1600" @error="dropSrcset" />
      </figure>
      <div class="ar-col">
        <div v-if="body" class="ar-body prose" @click="bodyClick" v-html="body"></div>
        <div v-else class="ar-body">
          <div class="ar-soon">
            <span class="ec"><nx-icon name="book" /></span>
            <div>
              <b>{{ t("bakini.n.rd.soonT", "The full story is not published yet") }}</b>
              <p class="muted">{{ t("bakini.n.rd.soonP", "Only this summary is in the shop for now. Browse the other stories in the meantime.") }}</p>
              <router-link :to="journalRoute()" class="link">{{ t("bakini.n.rd.backJournal", "Back to the journal") }}<nx-icon name="arrow" /></router-link>
            </div>
          </div>
        </div>

        <section v-if="products.length" aria-labelledby="ar-p" class="ar-panel">
          <div class="ar-panel-hd">
            <div>
              <p class="eyebrow">{{ t("bakini.n.rd.fromStory", "From this story") }}</p>
              <h2 id="ar-p" class="serif">{{ t("bakini.n.rd.mentionedH", "The pastries") }} <em>{{ t("bakini.n.rd.mentionedHem", "mentioned.") }}</em></h2>
            </div>
            <button :disabled="adding" class="btn" type="button" @click="addAll">
              <nx-icon :name="added ? 'check' : 'bag'" />{{ added ? t("bakini.n.rd.inBag", "In your bag") : t("bakini.n.rd.addAll", "Add all") }}
            </button>
          </div>
          <div class="ar-cards">
            <article v-for="p in products" :key="p.id" :style="{ '--bk-hue': hueOf(p.category_id) }" class="arc">
              <router-link :to="productTo(p)" aria-hidden="true" class="arc-ph" tabindex="-1"><img :src="productImage(p)" alt="" class="cut" loading="lazy" /></router-link>
              <router-link :to="productTo(p)" class="arc-n">{{ p.title }}</router-link>
              <p class="arc-p">
                <span class="money">{{ money(pv(p).now) }}</span>{{ " " }}<span v-if="pv(p).was" class="was money">{{ money(pv(p).was) }}</span>
              </p>
              <nx-qb :label="t('bakini.n.rd.add', 'Add')" :product="p" size="mid" />
            </article>
          </div>
        </section>

        <div class="ar-share">
          <span class="eyebrow">{{ t("bakini.n.rd.share", "Share") }}</span>
          <button class="btn ghost sm" type="button" @click="copyLink">
            <nx-icon :name="copied ? 'check' : 'link'" />{{ copied ? t("bakini.n.rd.copied", "Link copied") : t("bakini.n.rd.copy", "Copy link") }}
          </button>
          <a :href="mailto" class="btn ghost sm"><nx-icon name="mail" />{{ t("bakini.n.rd.email", "Email") }}</a>
        </div>

        <section aria-labelledby="ar-c" class="ar-com">
          <h2 id="ar-c" class="serif">{{ t("bakini.n.rd.comments", "Comments") }}</h2>
          <s-article-comments :article-id="article.id" :article-user-id="article.user_id" class="nx-comments" is-selldone is-shop>
            <template v-slot:login>
              <div class="ar-com-empty">
                <span class="ec"><nx-icon name="chat" /></span>
                <div>
                  <b>{{ t("bakini.n.rd.comFirstT", "Join the conversation") }}</b>
                  <p class="muted">{{ t("bakini.n.rd.comFirstP", "Sign in to leave a comment.") }}</p>
                </div>
                <button class="btn" type="button" @click="signIn">{{ t("bakini.n.rd.comSignIn", "Sign in to comment") }}</button>
              </div>
            </template>
          </s-article-comments>
        </section>
      </div>
    </article>

    <div v-else-if="busy" aria-hidden="true" class="ar nx-skel">
      <div class="ar-col">
        <div class="nx-skel__line -t"></div>
        <div class="nx-skel__line"></div>
      </div>
      <div class="ar-cover"></div>
    </div>

    <section v-else class="wrap nx-gone">
      <nx-empty :text="t('bakini.n.rd.goneP', 'The link may be old, or the story has moved. Every other story is in the journal.')" :title="t('bakini.n.rd.goneT', 'We can’t find this story')" icon="book">
        <router-link :to="journalRoute()" class="btn">{{ t("bakini.n.rd.backJournal", "Back to the journal") }}</router-link>
      </nx-empty>
    </section>

    <section v-if="more.length" class="sec tight">
      <div class="wrap">
        <div class="sec-hd">
          <div>
            <p class="eyebrow">{{ t("bakini.n.rd.keepReading", "Keep reading") }}</p>
            <h2>{{ t("bakini.n.rd.moreH", "More from") }} <em>{{ t("bakini.n.rd.moreHem", "the journal.") }}</em></h2>
          </div>
          <router-link :to="journalRoute()" class="link">{{ t("bakini.n.rd.allStories", "All stories") }}<nx-icon name="arrow" /></router-link>
        </div>
        <div class="jr-next">
          <nx-post v-for="b in more" :key="b.id" :post="b" />
        </div>
      </div>
    </section>
  </div>
</template>

<script lang="ts">
import SArticleComments from "@selldone/components-vue/article/comment/SArticleComments.vue";
import { EventBus } from "@selldone/components-vue/utils/events/EventBus.ts";
import { StorefrontSeo } from "../../../helpers/StorefrontSeo";
import NxIcon from "@app-storefront/components/bakini/noir/NxIcon.vue";
import NxQb from "@app-storefront/components/bakini/noir/NxQb.vue";
import NxPost from "@app-storefront/components/bakini/noir/NxPost.vue";
import NxCrumbs from "@app-storefront/components/bakini/noir/read/NxCrumbs.vue";
import NxEmpty from "@app-storefront/components/bakini/noir/read/NxEmpty.vue";
import { fmtDate, hueOf, loadNoir, money, noir, priceView, productImage, productTo } from "@app-storefront/components/bakini/noir/noir";
import { plainText } from "@app-storefront/components/bakini/noir/read/rd";
import { addCount, basketLine, mayBuy } from "@app-storefront/components/kalio/kalio-basket";
import { dropSrcset, photoSrcset } from "@app-storefront/components/kalio/kalio-catalog";
import { journalPage, journalPost, journalRoute, productsIn } from "@app-storefront/components/kalio/pages/kalio-journal";
import { currentCurrency } from "@app-storefront/components/region-switcher/region";
import { t } from "@app-storefront/components/kalio/i18n/kalio-i18n";

/** The product ids a story's text links to, in order, once each. */
function linkedIds(html: string): number[] {
  const ids: number[] = [];
  for (const m of String(html || "").matchAll(/href="[^"]*\/product\/(\d+)[^"]*"/g)) {
    const id = Number(m[1]);
    if (id && !ids.includes(id)) ids.push(id);
  }
  return ids;
}

export default {
  name: "StorefrontPageBlogsView",
  components: { SArticleComments, NxIcon, NxQb, NxPost, NxCrumbs, NxEmpty },
  inject: ["$shop"],

  data: () => ({
    article: null as any,
    busy: false,
    more: [] as any[],
    adding: false,
    added: false,
    copied: false,
    noir,
    seoNavigation: StorefrontSeo.captureNavigation(),
  }),

  computed: {
    blogId() {
      return this.$route.params.blog_id;
    },
    shop() {
      return this.$store.getters.getShop;
    },
    /* The shop's text, with the editor's leftovers taken out. */
    body() {
      return String(this.article?.body || "")
        .replace(/\scontenteditable="[^"]*"/g, "")
        .replace(/src="http:/g, 'src="');
    },
    /* The cover, unless the text opens with the same picture. */
    cover() {
      const image = this.article?.image;
      if (!image) return null;
      const file = String(image).split("/").pop()!.split("?")[0].slice(0, 40);
      const first = /<img[^>]+src="([^"]+)"/.exec(this.article.body || "");
      if (first && file && first[1].includes(file)) return null;
      return window.CDN.GET_SHOP_IMAGE_PATH(image, null);
    },
    coverSrcset() {
      return photoSrcset(this.cover);
    },
    /* The description, unless it is only the first words of the text. */
    lede() {
      const d = plainText(this.article?.description);
      if (!d) return "";
      const start = plainText(this.article?.body).slice(0, 40);
      return start && d.startsWith(start) ? "" : d;
    },
    /* The pastries the story links to (else the ones it names), at most four. */
    products() {
      if (!this.article) return [];
      const byId = new Map(this.noir.products.map((p: any) => [p.id, p]));
      const linked = linkedIds(this.article.body)
        .map((id) => byId.get(id))
        .filter(Boolean)
        .slice(0, 4);
      if (linked.length) return linked;
      return productsIn(this.article.body, this.noir.products, 4);
    },
    mailto() {
      return `mailto:?subject=${encodeURIComponent(this.article?.title || "")}&body=${encodeURIComponent(location.href)}`;
    },
  },

  watch: {
    blogId() {
      this.load();
    },
    "$route.fullPath"() {
      this.seoNavigation = StorefrontSeo.captureNavigation();
    },
  },

  created() {
    loadNoir();
    this.load();
  },

  methods: {
    t,
    money,
    fmtDate,
    hueOf,
    productImage,
    productTo,
    journalRoute,
    dropSrcset,
    pv(p: any) {
      void currentCurrency();
      return priceView(this.shop, p);
    },
    load() {
      const asked = this.blogId;
      this.busy = true;
      this.article = null;
      this.more = [];
      journalPost(asked)
        .then((data: any) => {
          if (asked !== this.blogId) return;
          this.article = data.article;
          this.setPageTitle?.(data.article.title);
          StorefrontSeo.updateArticle(data.article, this.$store.getters.getShop, this.seoNavigation);
          journalPage({ page: 1, limit: 4 })
            .then(({ articles }: any) => {
              if (asked === this.blogId) this.more = (articles || []).filter((a: any) => a.id !== data.article.id).slice(0, 3);
            })
            .catch(() => {});
        })
        .catch(() => {})
        .finally(() => {
          if (asked === this.blogId) this.busy = false;
        });
    },
    /* A link inside the story to this shop opens in the app. */
    bodyClick(e: MouseEvent) {
      const a = (e.target as HTMLElement)?.closest?.("a") as HTMLAnchorElement | null;
      if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || a.target === "_blank") return;
      let url: URL;
      try {
        url = new URL(a.getAttribute("href") || "", location.href);
      } catch {
        return;
      }
      if (url.origin !== location.origin) return;
      const m = /\/product\/(\d+)/.exec(url.pathname);
      e.preventDefault();
      if (m) this.$router.push(productTo({ id: Number(m[1]) }));
      else this.$router.push(url.pathname + url.search + url.hash).catch(() => {});
    },
    async addAll() {
      if (!mayBuy(this)) return;
      this.adding = true;
      try {
        for (const p of this.products) {
          if (!(p.quantity > 0)) continue;
          if (basketLine(this, p)?.count > 0) continue;
          await addCount(this, p, null, 1);
        }
        this.added = true;
        setTimeout(() => (this.added = false), 1500);
      } finally {
        this.adding = false;
      }
    },
    copyLink() {
      const done = () => {
        this.copied = true;
        setTimeout(() => (this.copied = false), 1500);
      };
      try {
        navigator.clipboard?.writeText(location.href).then(done, done);
      } catch {
        done();
      }
    },
    signIn() {
      EventBus.$emit("need-login", true);
    },
  },
};
</script>
