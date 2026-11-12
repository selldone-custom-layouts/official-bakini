<!--
  Bakini Noir — the product's reviews (b/pages-product.js .rv). With no
  review yet: an honest card ("No reviews yet.") beside the shop's own
  rating criteria, each "Not rated yet" — never stars or numbers. "Write the
  first review" asks a guest to sign in and opens Selldone's own review box
  (KalioReviews: only a buyer can rate) for a signed-in shopper. With
  reviews: the criteria and Selldone's reviews (KalioReviews) in the card.
-->
<template>
  <section id="k-reviews" class="sec tight">
    <div class="wrap">
      <div v-if="!rated" class="rv">
        <div class="rv-l">
          <p class="eyebrow">{{ t("bakini.n.pd.reviews", "Reviews") }}</p>
          <h2 class="serif">{{ t("bakini.n.pd.noReviewsH", "No reviews") }}{{ " " }}<em>{{ t("bakini.n.pd.noReviewsHem", "yet.") }}</em></h2>
          <p class="muted">
            {{
              criteria.length
                ? criteria.length === 1
                  ? t("bakini.n.pd.noReviewsP1", "Nobody has reviewed the {name} yet. Reviews are scored on the point beside this note.", { name: product.title })
                  : t("bakini.n.pd.noReviewsPn", "Nobody has reviewed the {name} yet. Reviews are scored on the {n} points beside this note.", { name: product.title, n: numberWord(criteria.length).toLowerCase() })
                : t("bakini.n.pd.noReviewsP0", "Nobody has reviewed the {name} yet.", { name: product.title })
            }}
          </p>
          <button v-if="!writing" class="btn ghost" type="button" @click="write"><nx-icon name="edit" />{{ t("bakini.n.pd.writeFirst", "Write the first review") }}</button>
        </div>
        <ul v-if="criteria.length" class="rv-crit">
          <li v-for="c in criteria" :key="c">
            <span>{{ c }}</span><span aria-hidden="true" class="rv-bar"><i></i><i></i><i></i><i></i><i></i></span><span class="muted">{{ t("bakini.n.pd.notRated", "Not rated yet") }}</span>
          </li>
        </ul>
      </div>
      <div v-if="rated || writing" :class="['nx-rv-sd', { '-rated': rated }]">
        <div v-if="rated" class="sec-hd">
          <div>
            <p class="eyebrow">{{ t("bakini.n.pd.reviews", "Reviews") }}</p>
            <h2>{{ t("bakini.n.pd.reviewsH", "What people") }}{{ " " }}<em>{{ t("bakini.n.pd.reviewsHem", "say.") }}</em></h2>
          </div>
        </div>
        <kalio-reviews />
      </div>
    </div>
  </section>
</template>

<script>
import NxIcon from "../NxIcon.vue";
import KalioReviews from "../../../kalio/product/KalioReviews.vue";
import { ratingNames } from "../noir";
import { numberWord } from "./pd";
import { EventBus } from "@selldone/components-vue/utils/events/EventBus.ts";
import { t } from "../../../kalio/i18n/kalio-i18n";

export default {
  name: "NxReviews",
  components: { NxIcon, KalioReviews },
  props: { product: { type: Object, required: true } },
  data: () => ({ writing: false }),
  computed: {
    rated() {
      return Number(this.product.rate_count) > 0;
    },
    criteria() {
      return ratingNames(this.product);
    },
  },
  watch: {
    "product.id"() {
      this.writing = false;
    },
  },
  methods: {
    t,
    numberWord,
    write() {
      if (!this.USER()) {
        EventBus.$emit("need-login", true);
        return;
      }
      this.writing = true;
    },
  },
};
</script>
