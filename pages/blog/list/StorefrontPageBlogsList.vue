<!--
  Bakini Noir — the journal (bakio-design/blog-b.html, b/pages-read.js
  N.pages.blog): the breadcrumb, "The journal." and a line; the newest post
  as a wide featured card ("Latest · <date>", its title, its description,
  "Read the story"); then the others in a grid of journal cards with their
  dates (never "1 min read": the list has no text to count). Whatever posts
  the shop has, newest first; "More stories" reads the next page. A topic,
  tag, author or search narrows the list and says so in the heading.
-->
<template>
  <div class="nx nx-journal">
    <section class="wrap jr">
      <div class="jr-hd">
        <nx-crumbs :items="[{ label: t('bakini.n.rd.journal', 'Journal') }]" />
        <h1 v-if="!filtered" class="serif">{{ t("bakini.n.rd.jrH", "The") }} <em>{{ t("bakini.n.rd.jrHem", "journal.") }}</em></h1>
        <h1 v-else class="serif">
          <em>{{ heading }}</em>
        </h1>
        <p class="muted">{{ lede }}</p>
      </div>

      <template v-if="articles.length">
        <article v-if="feature" class="jr-feat">
          <router-link :to="postRoute(feature)" aria-hidden="true" class="jr-feat-ph" tabindex="-1">
            <img v-if="feature.image" :src="image(feature)" :srcset="srcset(feature)" alt="" height="1000" sizes="(max-width: 760px) 92vw, 760px" width="1600" @error="dropSrcset" />
          </router-link>
          <div class="jr-feat-t">
            <p class="eyebrow">
              {{ t("bakini.n.rd.latest", "Latest") }}<template v-if="feature.created_at">{{ " · " }}<time :datetime="feature.created_at">{{ fmtDate(feature.created_at) }}</time></template>
            </p>
            <h2 class="serif">
              <router-link :to="postRoute(feature)">{{ feature.title }}</router-link>
            </h2>
            <p v-if="feature.description">{{ feature.description }}</p>
            <router-link :to="postRoute(feature)" class="btn">{{ t("bakini.n.rd.readStory", "Read the story") }}<nx-icon name="arrow" /></router-link>
          </div>
        </article>
        <div v-if="rest.length" class="jr-grid">
          <nx-post v-for="b in rest" :key="b.id" :post="b" />
        </div>
        <div v-if="articles.length < total" class="nx-more">
          <button :disabled="busy" class="btn ghost" type="button" @click="loadMore">{{ t("bakini.n.rd.moreStories", "More stories") }}</button>
        </div>
      </template>

      <div v-else-if="busy" aria-hidden="true" class="jr-grid nx-skel">
        <div v-for="n in 3" :key="n" class="post"><span class="post-ph"></span></div>
      </div>

      <nx-empty
        v-else
        :text="filtered ? t('bakini.n.rd.noMatchP', 'Nothing in the journal matches this yet. Every story is one tap away.') : t('bakini.n.rd.noPostsP', 'The bakery has not published any stories yet.')"
        :title="filtered ? t('bakini.n.rd.noMatchT', 'No stories here yet') : t('bakini.n.rd.noPostsT', 'No stories yet')"
        icon="book"
      >
        <router-link v-if="filtered" :to="journalRoute()" class="btn">{{ t("bakini.n.rd.allStories", "All stories") }}</router-link>
        <router-link v-else :to="{ path: '/' }" class="btn">{{ t("bakini.n.rd.backShop", "Back to the shop") }}</router-link>
      </nx-empty>
    </section>
  </div>
</template>

<script lang="ts">
import NxIcon from "@app-storefront/components/bakini/noir/NxIcon.vue";
import NxPost from "@app-storefront/components/bakini/noir/NxPost.vue";
import NxCrumbs from "@app-storefront/components/bakini/noir/read/NxCrumbs.vue";
import NxEmpty from "@app-storefront/components/bakini/noir/read/NxEmpty.vue";
import { fmtDate } from "@app-storefront/components/bakini/noir/noir";
import { dropSrcset, photoSrcset } from "@app-storefront/components/kalio/kalio-catalog";
import { journalExtra, journalPage, journalRoute, postRoute } from "@app-storefront/components/kalio/pages/kalio-journal";
import { t } from "@app-storefront/components/kalio/i18n/kalio-i18n";

/* One featured story and a grid of three across: 1 + 12 on the first page. */
const FIRST = 13;

export default {
  name: "StorefrontPageBlogsList",
  components: { NxIcon, NxPost, NxCrumbs, NxEmpty },
  inject: ["$shop"],

  data: () => ({ articles: [] as any[], total: 0, busy: false, page: 1, categories: [] as any[] }),

  computed: {
    current_category() {
      return this.$route.query.category || null;
    },
    current_tag() {
      return this.$route.query.tags || null;
    },
    current_search() {
      return this.$route.query.search || "";
    },
    current_author() {
      return this.$route.params.author || null;
    },
    current_author_id() {
      return this.$route.params.author_id || null;
    },
    filtered() {
      return !!(this.current_category || this.current_tag || this.current_search || this.current_author_id);
    },
    category() {
      return this.categories.find((it: any) => String(it.id) === String(this.current_category)) || null;
    },
    heading() {
      if (this.current_category) return this.category?.title || this.category?.name || t("bakini.n.rd.topic", "Topic");
      if (this.current_author_id) return this.articles[0]?.user?.name || this.current_author || t("bakini.n.rd.author", "Author");
      if (this.current_tag) return `#${this.current_tag}`;
      return t("bakini.n.rd.searchFor", "“{q}”", { q: String(this.current_search) });
    },
    lede() {
      if (this.current_category) return this.category?.description || t("bakini.n.rd.ledeTopic", "Every story on this topic, newest first.");
      if (this.filtered) return t("bakini.n.rd.ledeMatch", "The stories that match, newest first.");
      return t("bakini.n.rd.jrLede", "Guides to the collections, how orders reach you, and small ideas for ordering pastries one by one.");
    },
    feature() {
      return this.filtered ? null : this.articles[0] || null;
    },
    rest() {
      return this.feature ? this.articles.slice(1) : this.articles;
    },
  },

  watch: {
    "$route.fullPath"() {
      this.load();
    },
  },

  created() {
    this.setPageTitle?.(t("bakini.n.rd.journal", "Journal"));
    this.load();
    journalExtra()
      .then(({ categories }: any) => (this.categories = categories || []))
      .catch(() => {});
  },

  methods: {
    t,
    fmtDate,
    postRoute,
    journalRoute,
    dropSrcset,
    image(a: any) {
      return a?.image ? window.CDN.GET_SHOP_IMAGE_PATH(a.image, null) : null;
    },
    srcset(a: any) {
      return photoSrcset(this.image(a));
    },
    query(offsetPage: number, limit: number) {
      return {
        page: offsetPage,
        limit,
        category: this.current_category,
        author: this.current_author,
        author_id: this.current_author_id,
        tag: this.current_tag,
        search: this.current_search,
      };
    },
    load() {
      const asked = this.$route.fullPath;
      this.busy = true;
      this.page = 1;
      journalPage(this.query(1, FIRST))
        .then(({ articles, total }: any) => {
          if (asked !== this.$route.fullPath) return;
          this.articles = articles || [];
          this.total = total || this.articles.length;
        })
        .catch(() => {
          this.articles = [];
          this.total = 0;
        })
        .finally(() => (this.busy = false));
    },
    /* The next thirteen. */
    loadMore() {
      if (this.busy) return;
      this.busy = true;
      this.page = (this.page || 1) + 1;
      journalPage(this.query(this.page, FIRST))
        .then(({ articles }: any) => {
          const seen = new Set(this.articles.map((a: any) => a.id));
          const fresh = (articles || []).filter((a: any) => !seen.has(a.id));
          this.articles = this.articles.concat(fresh);
          if (!fresh.length) this.total = this.articles.length;
        })
        .catch(() => {})
        .finally(() => (this.busy = false));
    },
  },
};
</script>
