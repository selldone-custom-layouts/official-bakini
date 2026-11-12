<!--
  Bakini Noir — About (bakio-design/about-b.html, b/pages-read.js
  N.pages.about): the story beside a collage of nine pastries; "The counter"
  (address, hours, the courier's windows, the way to pay); the collections;
  how an order works in three steps; the counter on the map.

  The story is the shop's own About page (Selldone dashboard › Shop ›
  Profile) when it has written one; until then sample copy built only from
  the shop's facts (its address, collections, delivery ways and way to
  pay), with the label "Sample text — the shop has not written this page
  yet". Never invented history, awards, names or counts.
-->
<template>
  <div class="nx nx-about">
    <section class="ab-hero">
      <div class="wrap ab-hero-in">
        <div class="ab-copy">
          <nx-sample-tag v-if="!own" />
          <h1 v-if="own" class="serif">{{ t("bakini.n.rd.aboutOwnH", "About") }} <em>{{ name }}.</em></h1>
          <h1 v-else class="serif">{{ t("bakini.n.rd.aboutH", "A pâtisserie counter") }} <em>{{ headEm }}</em></h1>
          <div v-if="own" class="prose nx-own" v-html="ownHtml"></div>
          <template v-else>
            <p>{{ storyP1 }}</p>
            <p v-if="storyP2">{{ storyP2 }}</p>
          </template>
          <div class="ab-acts">
            <router-link :to="shopTo" class="btn">{{ t("bakini.n.rd.shopCollections", "Shop the collections") }}</router-link>
            <router-link :to="contactTo" class="btn ghost">{{ t("bakini.n.rd.visitCounter", "Visit the counter") }}</router-link>
          </div>
        </div>
        <div aria-hidden="true" class="ab-col">
          <span v-for="(p, i) in collage" :key="p.id" :class="['abc', 'abc' + i]" :style="{ '--bk-hue': hueOf(p.category_id) }"><img :src="productImage(p)" alt="" class="cut" /></span>
        </div>
      </div>
    </section>

    <section v-if="factCards.length" class="sec tight">
      <div class="wrap">
        <div class="sec-hd">
          <div>
            <p class="eyebrow">{{ t("bakini.n.rd.theCounter", "The counter") }}</p>
            <h2 v-if="f.everyDay">{{ t("bakini.n.rd.openH", "Open") }} <em>{{ t("bakini.n.rd.openHem", "every day.") }}</em></h2>
            <h2 v-else>{{ t("bakini.n.rd.findH", "Find") }} <em>{{ t("bakini.n.rd.findHem", "the counter.") }}</em></h2>
          </div>
        </div>
        <div class="ab-facts">
          <div v-for="c in factCards" :key="c.key" class="gcard">
            <span class="dm-ic"><nx-icon :name="c.icon" /></span><b>{{ c.title }}</b><span>{{ c.line }}</span>
          </div>
        </div>
      </div>
    </section>

    <section v-if="noir.cats.length" class="sec tight">
      <div class="wrap">
        <div class="sec-hd">
          <div>
            <p class="eyebrow">{{ t("bakini.n.rd.theCollections", "The collections") }}</p>
            <h2>{{ t("bakini.n.rd.caseH", "What is") }} <em>{{ t("bakini.n.rd.caseHem", "in the case.") }}</em></h2>
          </div>
        </div>
        <div class="ab-cats">
          <router-link v-for="c in noir.cats" :key="c.id" :style="{ '--bk-hue': hueOf(c.id) }" :to="catTo(c)" class="ab-cat">
            <span class="ab-cat-ph"><img v-if="catImage(c, 256)" :src="catImage(c, 256)" alt="" class="cut" /></span>
            <span
              ><b><bdi>{{ catTitle(c) }}</bdi></b><small v-if="c.description"><bdi>{{ c.description }}</bdi></small></span
            >
            <nx-icon cls="k-flip" name="arrow" />
          </router-link>
        </div>
      </div>
    </section>

    <section class="sec tight">
      <div class="wrap">
        <div class="ab-how">
          <nx-sample-tag />
          <div class="ab-steps">
            <div v-for="(s, i) in steps" :key="i">
              <span class="pro-n serif">{{ "0" + (i + 1) }}</span>
              <h3>{{ s.title }}</h3>
              <p>{{ s.text }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section v-if="f.address" class="sec tight">
      <div class="wrap">
        <div class="visit">
          <div class="visit-map"><nx-map :line="[street, f.hours].filter(Boolean).join(' · ')" :location="f.location" :title="name" /></div>
          <div class="visit-txt">
            <p class="eyebrow">{{ t("bakini.n.rd.findUs", "Find us") }}</p>
            <h2 class="serif">{{ t("bakini.n.rd.comeH", "Come to") }} <em>{{ t("bakini.n.rd.comeHem", "the counter.") }}</em></h2>
            <div class="ilines">
              <div class="iline">
                <nx-icon name="pin" />
                <div>
                  <b><bdi>{{ street }}</bdi></b><span><bdi>{{ city }}</bdi></span>
                </div>
              </div>
              <div v-if="open" class="iline">
                <nx-icon name="clock" />
                <div>
                  <b>{{ f.everyDay ? t("bakini.n.rd.openEvery", "Open every day") : t("bakini.n.rd.openDays", "Open") }}</b><span>{{ f.hours || f.days.join(", ") }}</span>
                </div>
              </div>
              <div v-if="f.phone || f.email" class="iline">
                <nx-icon name="phone" />
                <div>
                  <b v-if="f.phone"><a :href="'tel:' + f.phone.replace(/[^\d+]/g, '')" dir="ltr">{{ f.phone }}</a></b><span v-if="f.email">{{ f.email }}</span>
                </div>
              </div>
            </div>
            <div class="visit-acts">
              <router-link :to="contactTo" class="btn">{{ t("bakini.n.rd.contact", "Contact") }}</router-link>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script lang="ts">
import NxIcon from "@app-storefront/components/bakini/noir/NxIcon.vue";
import NxMap from "@app-storefront/components/bakini/noir/NxMap.vue";
import NxSampleTag from "@app-storefront/components/bakini/noir/read/NxSampleTag.vue";
import { bySells, catImage, catTitle, catTo, hueOf, loadNoir, mixed, noir, productImage, shopFacts, unitOf } from "@app-storefront/components/bakini/noir/noir";
import { cityLine, listWords, openLine, ownText, paySentence, shopName, shopProfile, shortAddress, streetOf } from "@app-storefront/components/bakini/noir/read/rd";
import { catalogueRoute } from "@app-storefront/components/kalio/kalio-catalog";
import { t } from "@app-storefront/components/kalio/i18n/kalio-i18n";

export default {
  name: "StorefrontPageOfficialAboutUs",
  components: { NxIcon, NxMap, NxSampleTag },
  inject: ["$shop"],

  data: () => ({ noir, profile: null as any }),

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
    own() {
      return ownText(this.profile?.body);
    },
    ownHtml() {
      return String(this.profile?.body || "").replace(/\scontenteditable="[^"]*"/g, "");
    },
    street() {
      return streetOf(this.f);
    },
    city() {
      return cityLine(this.f);
    },
    open() {
      return openLine(this.f);
    },
    headEm() {
      return this.f.city ? t("bakini.n.rd.aboutHemCity", "in {city}.", { city: this.f.city }) : t("bakini.n.rd.aboutHem", "near you.");
    },
    collectionsWords() {
      return listWords(this.noir.cats.map((c: any) => catTitle(c).toLowerCase()));
    },
    storyP1() {
      const where = shortAddress(this.f);
      const lead = where
        ? t("bakini.n.rd.storyAt", "{shop} is a pâtisserie at {address}.", { shop: this.name, address: where })
        : t("bakini.n.rd.storyIs", "{shop} is a pâtisserie.", { shop: this.name });
      const units = this.units;
      const small = units[0] ? t("bakini.n.rd.storySmall", ", so an order can be as small as one {unit}", { unit: units[0] }) : "";
      const hold = this.collectionsWords ? t("bakini.n.rd.storyCase", "The counter holds its collections — {names} — and every piece is sold on its own{small}.", { names: this.collectionsWords, small }) : "";
      return [lead, hold].filter(Boolean).join(" ");
    },
    storyP2() {
      const kinds: string[] = [];
      if (this.f.courier) kinds.push(t("bakini.n.rd.byCourier", "travel by the {name} across the city", { name: this.f.courier.title }));
      if (this.f.shipping) kinds.push(t("bakini.n.rd.byShipping", "ship further away"));
      if (this.f.pickup) kinds.push(t("bakini.n.rd.byPickup", "wait at the counter for pickup"));
      const how = kinds.length ? t("bakini.n.rd.ordersHow", "Orders {kinds}.", { kinds: listWords(kinds, "disjunction") }) : "";
      const pay = this.f.gateway?.cod ? t("bakini.n.rd.payEasy", "Payment is simple: cash when the order arrives.") : "";
      return [how, pay].filter(Boolean).join(" ");
    },
    units() {
      return [...new Set(this.noir.cats.map((c: any) => unitOf(this.noir.products.find((p: any) => p.category_id === c.id) || {}).toLowerCase()))];
    },
    collage() {
      return mixed(bySells(this.noir.products)).slice(0, 9);
    },
    factCards() {
      const f = this.f;
      const out: any[] = [];
      if (f.address) out.push({ key: "pin", icon: "pin", title: this.street, line: [this.city, f.pickupNote ? f.pickupNote.split(".")[0] : ""].filter(Boolean).join(" · ") });
      if (f.hours || f.days.length) out.push({ key: "clock", icon: "clock", title: f.hours || t("bakini.n.rd.openDays", "Open"), line: f.everyDay ? t("bakini.n.rd.monSun", "Monday to Sunday, every day of the week") : f.days.join(", ") });
      if (f.courier && f.courier.windows.length) {
        const n = f.courier.windows.length;
        out.push({
          key: "bike",
          icon: "bike",
          title: t("bakini.n.rd.windowsT", { one: "{n} delivery window", other: "{n} delivery windows" }, { n }),
          line: f.courier.distance ? t("bakini.n.rd.windowsL", "{windows}, within {km} km", { windows: listWords(f.courier.windows), km: f.courier.distance }) : listWords(f.courier.windows),
        });
      }
      if (f.gateway) out.push({ key: "cash", icon: "cash", title: f.gateway.name, line: f.gateway.description || paySentence(f) });
      return out.slice(0, 4);
    },
    steps() {
      const f = this.f;
      const u = this.units;
      const ex = u.length >= 3 ? t("bakini.n.rd.s1ex", " — one {a}, two {b}, a single {c}", { a: u[0], b: u[1] + "s", c: u[2] }) : "";
      const ways: string[] = [];
      if (f.courier) ways.push(f.courier.windows.length ? t("bakini.n.rd.wCourier", "courier in a window that suits you") : t("bakini.n.rd.wCourierPlain", "courier delivery"));
      if (f.shipping) ways.push(t("bakini.n.rd.wShipping", "{name}", { name: f.shipping.title.toLowerCase() }));
      if (f.pickup) ways.push(t("bakini.n.rd.wPickup", "pickup at the counter"));
      const w = listWords(ways, "disjunction");
      return [
        { title: t("bakini.n.rd.s1T", "Choose piece by piece"), text: t("bakini.n.rd.s1", "Add exactly the pastries you want{ex}.", { ex }) },
        { title: t("bakini.n.rd.s2T", "Pick how it reaches you"), text: w ? w.charAt(0).toUpperCase() + w.slice(1) + "." : t("bakini.n.rd.s2", "Choose how it reaches you at checkout.") },
        f.gateway?.cod
          ? { title: t("bakini.n.rd.s3T", "Pay when it arrives"), text: t("bakini.n.rd.s3", "Cash on delivery — nothing is charged online.") }
          : { title: t("bakini.n.rd.s3Tb", "Pay at checkout"), text: paySentence(f) },
      ];
    },
    shopTo() {
      return catalogueRoute({});
    },
    contactTo() {
      return { name: window.$storefront.routes.SHOP_CONTACT_US };
    },
  },

  created() {
    loadNoir();
    this.setPageTitle?.(t("bakini.n.rd.aboutTitle", "About {shop}", { shop: shopName(this.$store.getters.getShop) }));
    shopProfile(this.$shop.name, "about-us").then((p) => (this.profile = p));
  },

  methods: { t, hueOf, catTo, catTitle, catImage, productImage },
};
</script>
