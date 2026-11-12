<!--
  Bakini Noir — the counter on a map (home "Visit & pickup", Contact). The
  mockup draws an illustration of one city's streets; the Layout shows the
  shop's real place instead, so any bakery gets its own: a static map of the
  shop's location (Selldone's map service: the dark style in dark mode, the
  street style in light), the mockup's caramel pin in its centre and a small
  card with the shop's name and line. Without a location: the plate's calm
  gradient and the pin, nothing invented.
-->
<template>
  <div :class="['nx-map', { '-none': !src }]">
    <img v-if="src" :alt="t('bakini.n.map.alt', 'Map of the streets around {place}', { place: line || title })" :src="src" class="nx-map__img" loading="lazy" />
    <svg aria-hidden="true" class="nx-map__pin" viewBox="-30 -56 60 64">
      <circle class="mpin-halo" r="26" />
      <path class="mpin-body" d="M0 0c-9-10-15-17-15-25a15 15 0 0 1 30 0c0 8-6 15-15 25z" />
      <text class="mpin-b" y="-19">{{ letter }}</text>
    </svg>
    <div v-if="title" class="nx-map__card">
      <b><bdi>{{ title }}</bdi></b><small v-if="line"><bdi>{{ line }}</bdi></small>
    </div>
  </div>
</template>

<script>
import { SetupService } from "@selldone/core-js/server";
import { themeState } from "../../theme-switcher/theme-switcher";
import { t } from "../../kalio/i18n/kalio-i18n";

export default {
  name: "NxMap",
  props: {
    location: { type: Object, default: null },
    title: { type: String, default: "" },
    line: { type: String, default: "" },
    zoom: { type: Number, default: 15 },
  },
  data: () => ({ theme: themeState }),
  computed: {
    letter() {
      return (String(this.title || "").trim().charAt(0) || "·").toLowerCase();
    },
    dark() {
      return this.theme.mode === "dark" || document.documentElement.classList.contains("bk-dark");
    },
    src() {
      const l = this.location;
      if (!l || !Number(l.lat) || !Number(l.lng)) return null;
      const token = SetupService.MapToken();
      if (!token) return null;
      const style = this.dark ? "dark-v11" : "streets-v12";
      return `https://api.mapbox.com/styles/v1/mapbox/${style}/static/${l.lng},${l.lat},${this.zoom},0,0/1000x640@2x?access_token=${token}`;
    },
  },
  methods: { t },
};
</script>
