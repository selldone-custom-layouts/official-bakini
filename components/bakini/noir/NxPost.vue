<!--
  Bakini Noir — a journal card (b/pages-shop.js N.post): the cover, the date
  (never "1 min read": the list has no text to count), the title and the
  post's own description. `big`: the featured card.
-->
<template>
  <article :class="['post', { big }]">
    <router-link :to="to" aria-hidden="true" class="post-ph" tabindex="-1">
      <img v-if="img" :sizes="big ? '(max-width: 760px) 92vw, 760px' : '(max-width: 760px) 92vw, 340px'" :src="img" :srcset="srcset" alt="" height="900" loading="lazy" width="1600" @error="dropSrcset" />
    </router-link>
    <div class="post-txt">
      <time v-if="post.created_at" :datetime="post.created_at">{{ fmtDate(post.created_at) }}</time>
      <h3><router-link :to="to">{{ post.title }}</router-link></h3>
      <p v-if="post.description">{{ post.description }}</p>
    </div>
  </article>
</template>

<script>
import { fmtDate } from "./noir";
import { postRoute } from "../../kalio/pages/kalio-journal";
import { dropSrcset, photoSrcset } from "../../kalio/kalio-catalog";

export default {
  name: "NxPost",
  props: { post: { type: Object, required: true }, big: Boolean },
  computed: {
    to() {
      return postRoute(this.post);
    },
    img() {
      return this.post.image ? window.CDN.GET_SHOP_IMAGE_PATH(this.post.image, null) : null;
    },
    srcset() {
      return photoSrcset(this.img);
    },
  },
  methods: { fmtDate, dropSrcset },
};
</script>
