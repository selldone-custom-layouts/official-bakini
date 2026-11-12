<!--
  Bakini — one photo slot (bakini-photos.ts): the photo when its file is in
  assets/photos/, else nothing at all (Bakio has no lifestyle photos; the
  pages are complete with product cut-outs, the brief's rule).
  `place` is a slot name from SLOTS or a Slot object (the chooser's choose-<tag> slots).
-->
<template>
  <div v-if="src" :style="{ '--ratio': String(info.ratio) }" class="bk-slot">
    <img :alt="alt" :src="src" :loading="eager ? 'eager' : 'lazy'" class="bk-slot__img" />
  </div>
</template>

<script>
import { SLOTS, slotSrc } from "./bakini-photos";

export default {
  name: "BakiniSlot",
  props: {
    place: { type: [String, Object], required: true },
    alt: { type: String, default: "" },
    eager: Boolean,
  },
  computed: {
    info() {
      return typeof this.place === "string" ? SLOTS[this.place] || { file: `${this.place}.webp`, ratio: 1 } : this.place;
    },
    src() {
      return slotSrc(this.info);
    },
  },
};
</script>
