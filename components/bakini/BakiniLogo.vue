<!--
  Bakini Noir — the wordmark (bakio-design/b/core.css `.wm`): the shop's own
  live title in lower case, Instrument Serif, its last part in italic, then a
  small gold dot. Nothing is written in: the word is BRAND.name when the
  Layout sets one (kalio-brand.ts), else the shop's title, so another bakery
  that imports the Layout gets its own name drawn the same way.

  The italic part: for a one-word title, its last two fifths ("bak" + "io");
  for several words, the last word ("maison" + "noir").
-->
<template>
  <component :is="to ? 'router-link' : 'span'" :aria-label="label" :to="to" class="wm bk-wm">
    <span aria-hidden="true" class="bk-wm__w">{{ parts[0] }}<b v-if="parts[1]">{{ parts[1] }}</b><i></i></span>
  </component>
</template>

<script>
import { BRAND } from "../kalio/kalio-brand";
import { t } from "../kalio/i18n/kalio-i18n";

/** "bakio" → ["bak", "io"]; "maison noir" → ["maison ", "noir"]. */
export function wordmarkParts(title) {
  const word = String(title || "").trim().toLowerCase();
  if (!word) return ["", ""];
  const space = word.lastIndexOf(" ");
  if (space > 0) return [word.slice(0, space + 1), word.slice(space + 1)];
  const chars = Array.from(word);
  if (chars.length < 3) return [word, ""];
  const cut = Math.ceil(chars.length * 0.6);
  return [chars.slice(0, cut).join(""), chars.slice(cut).join("")];
}

export default {
  name: "BakiniLogo",
  inject: { $shop: { default: null } },
  props: {
    to: { type: [Object, String], default: () => ({ path: "/" }) },
  },
  computed: {
    word() {
      return (BRAND.name || this.$shop?.title || "").trim();
    },
    parts() {
      return wordmarkParts(this.word);
    },
    label() {
      return this.to ? t("bakini.logo.homeOf", "{name}, home", { name: this.word.toLowerCase() }) : this.word.toLowerCase();
    },
  },
};
</script>
