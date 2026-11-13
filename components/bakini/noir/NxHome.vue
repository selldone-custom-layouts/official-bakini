<!--
  Bakini Noir — the home (bakio-design/home-b.html, b/pages-shop.js home):
  every section from the shop's live data; nothing names a product, price,
  collection or delivery way.

   1. The carousel (NxCarousel.vue, bakio-design/home-hero4-b.html): the
      shop's address and line, then every collection as an arched card with
      its own photo, best-selling first; the chosen one's best seller and
      button under it. It replaced the stage, which blew one 640 px product
      photo up (soft, and cut at the top).
   2. "Explore the collections": every collection as a tall dark card.
   3. "Tonight's selection": best sellers, mixed across collections.
   4. "Everything you need to know": a bento of the shop's real facts (open
      days and counter hours, the courier's windows, shipping and its free
      threshold, the way to pay, pickup, pieces sold one by one).
   5. "Most loved": the best seller large, eight more beside it.
   6. "Which <unit> is yours?": the top collection's four best sellers side
      by side (two of its own spec rows, stock), "Compare all four".
   7. Deals: the saving as the headline, the biggest saving with its roundel,
      then the biggest saving of each collection in a row.
   8. "Compose a trio": three collections, a piece of each to swap, the live
      total and "Add all three".
   9. The bakery's story (its facts) with a collage of five pieces.
  10. "Visit & pickup": the map and the counter's lines.
  11. The journal: the four newest posts, last.
-->
<template>
  <div class="nx nx-home">
    <!-- 1. The carousel -->
    <nx-carousel :cats="catsBySells" :eyebrow="shortAddress ? t('bakini.n.home.eyebrow', 'Pâtisserie · {address}', { address: shortAddress }) : ''" :lede="heroLede" />

    <!-- 2. The collections -->
    <section v-if="noir.cats.length" class="sec lu-sec">
      <div class="wrap">
        <div class="sec-hd">
          <div>
            <p class="eyebrow">{{ t("bakini.n.home.colsEyebrow", "The collections") }}</p>
            <h2>{{ t("bakini.n.home.colsH", "Explore the") }} <em>{{ t("bakini.n.home.colsHem", "collections.") }}</em></h2>
          </div>
          <div class="tools lu-arrows">
            <button :aria-label="t('bakini.n.row.back', 'Scroll back')" class="arrow" type="button" @click="page('lineup', -1)"><nx-icon name="left" /></button>
            <button :aria-label="t('bakini.n.row.forward', 'Scroll forward')" class="arrow" type="button" @click="page('lineup', 1)"><nx-icon name="right" /></button>
          </div>
        </div>
        <div ref="lineup" class="lineup row-track">
          <router-link v-for="c in noir.cats" :key="c.id" :style="{ '--bk-hue': hueOf(c.id) }" :to="catTo(c)" class="lu">
            <span class="lu-top"
              ><span class="lu-k">{{ t("bakini.n.home.collection", "Collection") }}</span><b><bdi>{{ catTitle(c) }}</bdi></b
              ><span v-if="c.description" class="lu-d"><bdi>{{ c.description }}</bdi></span></span
            >
            <span class="lu-ph"><img v-if="catImg(c)" :src="catImg(c)" alt="" class="cut" loading="lazy" /></span>
            <span class="lu-go">{{ t("bakini.n.home.shopCol", "Shop {name}", { name: catTitle(c).toLowerCase() }) }}<nx-icon name="arrow" /></span>
          </router-link>
        </div>
      </div>
    </section>

    <!-- 3. Tonight's selection -->
    <nx-row
      v-if="selection.length"
      :accent="t('bakini.n.home.selHem', 'selection.')"
      :eyebrow="t('bakini.n.home.selEyebrow', 'A little of everything')"
      :items="selection"
      :more-label="topCat ? t('bakini.n.home.shopAllIn', 'Shop all {name}', { name: catTitle(topCat).toLowerCase() }) : ''"
      :more-to="topCat ? catTo(topCat) : null"
      :title="t('bakini.n.home.selH', 'Tonight’s')"
    />

    <!-- 4. The practical part -->
    <section v-if="bentoOn" class="sec">
      <div class="wrap">
        <div class="sec-hd">
          <div>
            <p class="eyebrow">{{ t("bakini.n.home.bentoEyebrow", "The practical part") }}</p>
            <h2>{{ t("bakini.n.home.bentoH", "Everything you need") }} <em>{{ t("bakini.n.home.bentoHem", "to know.") }}</em></h2>
          </div>
        </div>
        <div class="bento">
          <div v-if="facts.days.length || facts.hours" class="bt bt-hours">
            <div :aria-label="daysAria" class="bt-days">
              <span v-for="d in facts.days" :key="d">{{ dayShort(d) }}</span>
            </div>
            <p class="eyebrow">{{ facts.everyDay ? t("bakini.n.home.counterEvery", "The counter · open every day") : t("bakini.n.home.counter", "The counter") }}</p>
            <p v-if="hoursParts" class="bt-big serif">
              {{ hoursParts[0] }}<span>–</span>{{ hoursParts[1] }}
            </p>
            <p class="bt-t">{{ counterLine }}</p>
            <router-link :to="contactTo" class="link">{{ t("bakini.n.home.directions", "Address and contact") }}<nx-icon name="arrow" /></router-link>
          </div>
          <div v-if="facts.courier" class="bt bt-win">
            <span class="bt-ic"><nx-icon name="bike" /></span>
            <p class="bt-h">{{ facts.courier.title }}<template v-if="facts.courier.fee === 0"> · {{ t("bakini.n.home.free", "free") }}</template></p>
            <p class="bt-t">{{ courierLine }}</p>
            <div v-if="facts.courier.windows.length" class="bt-chips">
              <span v-for="w in facts.courier.windows" :key="w" class="chip">{{ w }}</span>
            </div>
          </div>
          <div v-if="facts.shipping" class="bt">
            <span class="bt-ic"><nx-icon name="plane" /></span>
            <p class="bt-h">{{ facts.shipping.title }}</p>
            <p class="bt-num serif">{{ facts.shipping.fee ? money(facts.shipping.fee, true) : t("bakini.n.home.freeCap", "Free") }}</p>
            <p v-if="facts.shipping.freeOver" class="bt-t">{{ t("bakini.n.home.freeOver", "Free on orders over {amount}.", { amount: money(facts.shipping.freeOver, true) }) }}</p>
          </div>
          <div v-if="facts.gateway" class="bt">
            <span class="bt-ic"><nx-icon name="cash" /></span>
            <p class="bt-h">{{ facts.gateway.name }}</p>
            <p v-if="facts.gateway.description" class="bt-t">{{ facts.gateway.description }}</p>
          </div>
          <div v-if="facts.pickup" class="bt bt-wide">
            <span class="bt-ic"><nx-icon name="store" /></span>
            <div>
              <p class="bt-h">{{ facts.pickup.title }}<template v-if="facts.pickup.fee === 0"> · {{ t("bakini.n.home.free", "free") }}</template></p>
              <p class="bt-t">{{ pickupLine }}</p>
            </div>
          </div>
          <div class="bt bt-wide">
            <span class="bt-ic"><nx-icon name="sparkle" /></span>
            <div>
              <p class="bt-h">{{ t("bakini.n.home.oneByOne", "Sold one by one") }}</p>
              <p class="bt-t">{{ oneByOneLine }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 5. Most loved -->
    <section v-if="loved.top" id="most-loved" class="sec">
      <div class="wrap">
        <div class="sec-hd">
          <div>
            <p class="eyebrow">{{ t("bakini.n.home.lovedEyebrow", "Ranked by what sells") }}</p>
            <h2>{{ t("bakini.n.home.lovedH", "Most") }} <em>{{ t("bakini.n.home.lovedHem", "loved.") }}</em></h2>
          </div>
          <router-link :to="dealsTo" class="link">{{ t("bakini.n.home.everyDeal", "Shop every deal") }}<nx-icon name="arrow" /></router-link>
        </div>
        <div class="loved">
          <article :style="{ '--bk-hue': hueOf(loved.top.category_id) }" class="lv-hero">
            <div class="lv-ph"><img :alt="loved.top.title" :src="img(loved.top)" class="cut" loading="lazy" /></div>
            <div class="lv-txt">
              <p class="eyebrow">{{ t("bakini.n.home.no1", "No. 1 · {name}", { name: catTitle(catOf(loved.top.category_id)) }) }}</p>
              <h3><router-link :to="productTo(loved.top)">{{ loved.top.title }}</router-link></h3>
              <p class="muted">
                {{ t("bakini.n.card.per", "per {unit}", { unit: unitOf(loved.top) }) }}<template v-if="loved.top.quantity > 0 && loved.top.quantity <= 5">
                  · <span class="pc-low">{{ t("bakini.n.card.onlyLeft", "Only {n} left", { n: loved.top.quantity }) }}</span></template
                >
              </p>
              <p class="lv-price">
                <span class="serif money">{{ money(pv(loved.top).now) }}</span>{{ " " }}<span v-if="pv(loved.top).was" class="was money">{{ money(pv(loved.top).was) }}</span>{{ " " }}<span v-if="pv(loved.top).save > 0" class="gold">{{ t("bakini.n.home.save", "Save {amount}", { amount: money(pv(loved.top).save) }) }}</span>
              </p>
              <nx-qb :label="t('bakini.n.qb.addToBag', 'Add to bag')" :product="loved.top" size="mid" />
            </div>
          </article>
          <nx-card v-for="p in loved.rest" :key="p.id" :product="p" />
        </div>
      </div>
    </section>

    <!-- 6. Which <unit> is yours? -->
    <section v-if="which.items.length >= 2" class="sec wc-sec">
      <div class="wrap">
        <div class="sec-hd">
          <div>
            <p class="eyebrow">{{ t("bakini.n.home.sideBySide", "Side by side") }}</p>
            <h2>{{ t("bakini.n.home.whichH", "Which {unit}", { unit: which.unit }) }} <em>{{ t("bakini.n.home.whichHem", "is yours?") }}</em></h2>
          </div>
          <router-link :to="compareAllTo" class="btn tone"><nx-icon name="compare" />{{ t("bakini.n.home.compareAll", { one: "Compare it", other: "Compare all {n}" }, { n: which.items.length }) }}</router-link>
        </div>
        <div :aria-label="t('bakini.n.home.whichAria', 'Side by side')" class="wc-row" tabindex="0">
          <div v-for="p in which.items" :key="p.id" :style="{ '--bk-hue': hueOf(p.category_id) }" class="wc">
            <router-link :to="productTo(p)" aria-hidden="true" class="wc-ph" tabindex="-1"><img :src="img(p)" alt="" class="cut" loading="lazy" /></router-link>
            <h3><router-link :to="productTo(p)">{{ p.title }}</router-link></h3>
            <p class="wc-price">
              <span class="serif money">{{ money(pv(p).now) }}</span>{{ " " }}<span v-if="pv(p).was" class="was money">{{ money(pv(p).was) }}</span>
            </p>
            <dl>
              <div v-for="k in which.keys" :key="k">
                <dt>{{ k }}</dt>
                <dd>{{ specValue(p, k) || "—" }}</dd>
              </div>
              <div>
                <dt>{{ t("bakini.n.home.inStock", "In stock") }}</dt>
                <dd>{{ p.quantity > 0 ? p.quantity : t("bakini.n.card.soldOut", "Sold out") }}</dd>
              </div>
            </dl>
            <div class="wc-add"><nx-qb :label="t('bakini.n.qb.addToBag', 'Add to bag')" :product="p" size="mid" /></div>
          </div>
        </div>
      </div>
    </section>

    <!-- 7. Deals -->
    <section v-if="deal.big" class="sec deal-sec">
      <div class="wrap">
        <div :style="{ '--bk-hue': hueOf(deal.big.category_id) }" class="deal-band">
          <div class="db-copy">
            <p class="eyebrow">{{ t("bakini.n.home.dealsEyebrow", "Deals") }}</p>
            <h2 class="serif">
              <template v-if="deal.every">{{ t("bakini.n.home.dealsEvery", "{off}% off.", { off: deal.off }) }} <em>{{ t("bakini.n.home.dealsEveryEm", "Every piece.") }}</em></template>
              <template v-else>{{ t("bakini.n.home.dealsUpTo", "Up to {off}% off.", { off: deal.off }) }} <em>{{ t("bakini.n.home.dealsUpToEm", "This week.") }}</em></template>
            </h2>
            <p>{{ dealLine }}</p>
            <router-link :to="dealsTo" class="btn">{{ t("bakini.n.home.seeDeals", "See every deal") }}<nx-icon name="arrow" /></router-link>
          </div>
          <div class="db-ph">
            <img :src="img(deal.big)" alt="" class="cut" loading="lazy" />
            <span ref="roundel" class="db-roundel"
              ><b>{{ t("bakini.n.home.saveCap", "Save") }}</b><b>{{ money(pv(deal.big).save) }}</b></span
            >
          </div>
        </div>
        <div class="row deal-row">
          <div class="sec-hd" style="margin: 28px 0 18px">
            <h3 class="serif db-h3">{{ t("bakini.n.home.dealsRow", "The biggest saving in each collection") }}</h3>
            <span class="row-arrows">
              <button :aria-label="t('bakini.n.row.back', 'Scroll back')" class="arrow" type="button" @click="page('dealrow', -1)"><nx-icon name="left" /></button>
              <button :aria-label="t('bakini.n.row.forward', 'Scroll forward')" class="arrow" type="button" @click="page('dealrow', 1)"><nx-icon name="right" /></button>
            </span>
          </div>
          <div ref="dealrow" class="row-track">
            <nx-card v-for="p in deal.list" :key="p.id" :product="p" />
          </div>
        </div>
      </div>
    </section>

    <!-- 8. Compose a trio -->
    <section v-if="trio.length === 3" class="sec">
      <div class="wrap">
        <div class="trio">
          <div class="trio-hd">
            <p class="eyebrow">{{ t("bakini.n.home.trioEyebrow", "Buy together") }}</p>
            <h2 class="serif">{{ t("bakini.n.home.trioH", "Compose a") }} <em>{{ t("bakini.n.home.trioHem", "trio.") }}</em></h2>
            <p class="muted">{{ trioLede }}</p>
          </div>
          <div class="trio-cols">
            <div v-for="(col, i) in trio" :key="col.cat.id" class="tr-col">
              <p class="eyebrow">{{ t("bakini.n.home.aUnit", "A {unit}", { unit: col.unit }) }}</p>
              <div :style="{ '--bk-hue': hueOf(col.cat.id) }" class="tr-stage">
                <button :aria-label="t('bakini.n.home.prevOf', 'Previous {unit}', { unit: col.unit })" class="arrow sm" type="button" @click="trioStep(i, -1)"><nx-icon name="left" /></button>
                <div class="tr-ph"><img :alt="trioPick(i).title" :src="img(trioPick(i))" class="cut" /></div>
                <button :aria-label="t('bakini.n.home.nextOf', 'Next {unit}', { unit: col.unit })" class="arrow sm" type="button" @click="trioStep(i, 1)"><nx-icon name="right" /></button>
              </div>
              <p class="tr-name"><router-link :to="productTo(trioPick(i))">{{ trioPick(i).title }}</router-link></p>
              <p class="tr-price">
                <span class="money">{{ money(pv(trioPick(i)).now) }}</span>{{ " " }}<span v-if="pv(trioPick(i)).was" class="was money">{{ money(pv(trioPick(i)).was) }}</span>
              </p>
              <p aria-hidden="true" class="tr-dots"><i v-for="(x, j) in col.list" :key="x.id" :class="{ on: j === col.at }"></i></p>
            </div>
          </div>
          <div id="trio-sum" class="trio-sum">
            <div class="nts-lines">
              <span>{{ t("bakini.n.home.threePieces", "Three pieces") }}{{ " " }}<span v-if="trioSum.save > 0" class="was money">{{ money(trioSum.was) }}</span></span>
              <span v-if="trioSum.save > 0" class="gold">{{ t("bakini.n.home.youSave", "You save {amount}", { amount: money(trioSum.save) }) }}</span>
            </div>
            <div class="nts-tot">
              <span class="serif money">{{ money(trioSum.now) }}</span>
              <button :disabled="trioBusy" class="btn lg" type="button" @click="addTrio">
                <nx-icon :name="trioDone ? 'check' : 'bag'" />{{ trioDone ? t("bakini.n.home.inBag", "In your bag") : t("bakini.n.home.addThree", "Add all three") }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 9. The bakery -->
    <section v-if="collage.length" class="sec story">
      <div class="wrap story-in">
        <div class="story-copy">
          <p class="eyebrow">{{ t("bakini.n.home.storyEyebrow", "The bakery") }}</p>
          <h2 class="serif">{{ t("bakini.n.home.storyH", "Made to be chosen") }} <em>{{ t("bakini.n.home.storyHem", "one at a time.") }}</em></h2>
          <p>{{ storyP1 }}</p>
          <p v-if="storyP2">{{ storyP2 }}</p>
          <router-link :to="aboutTo" class="link">{{ t("bakini.n.home.about", "About {shop}", { shop: shopName }) }}<nx-icon name="arrow" /></router-link>
        </div>
        <div aria-hidden="true" class="collage">
          <span v-for="(p, i) in collage" :key="p.id" :class="['cg', 'cg' + i]" :style="{ '--bk-hue': hueOf(p.category_id) }"><img :src="img(p)" alt="" class="cut" loading="lazy" /></span>
        </div>
      </div>
    </section>

    <!-- 10. Visit & pickup -->
    <section v-if="facts.address" class="sec">
      <div class="wrap">
        <div class="visit">
          <div class="visit-map"><nx-map :line="mapLine" :location="facts.location" :title="shopName" /></div>
          <div class="visit-txt">
            <p class="eyebrow">{{ facts.pickup ? t("bakini.n.home.visitEyebrow", "Visit & pickup") : t("bakini.n.home.visitOnly", "Visit") }}</p>
            <h2 class="serif">{{ t("bakini.n.home.visitH", "The counter at") }} <em>{{ visitPlace }}</em></h2>
            <div class="ilines">
              <div class="iline">
                <nx-icon name="pin" />
                <div>
                  <b><bdi>{{ street }}</bdi></b><span><bdi>{{ cityLine }}</bdi></span>
                </div>
              </div>
              <div v-if="hoursLine" class="iline">
                <nx-icon name="clock" />
                <div>
                  <b>{{ facts.everyDay ? t("bakini.n.home.openEvery", "Open every day") : t("bakini.n.home.open", "Open") }}</b><span>{{ hoursLine }}</span>
                </div>
              </div>
              <div v-if="facts.pickup" class="iline">
                <nx-icon name="store" />
                <div>
                  <b>{{ facts.pickup.fee === 0 ? t("bakini.n.home.pickupFree", "Pickup is free") : facts.pickup.title }}</b><span>{{ pickupLine }}</span>
                </div>
              </div>
              <div v-if="facts.phone || facts.email" class="iline">
                <nx-icon name="phone" />
                <div>
                  <b v-if="facts.phone"><a :href="'tel:' + facts.phone.replace(/[^\d+]/g, '')" dir="ltr">{{ facts.phone }}</a></b><span v-if="facts.email">{{ facts.email }}</span>
                </div>
              </div>
            </div>
            <div class="visit-acts">
              <router-link v-if="facts.pickup" :to="bagTo" class="btn">{{ t("bakini.n.home.orderPickup", "Order for pickup") }}</router-link>
              <router-link :to="contactTo" class="btn ghost">{{ t("bakini.n.home.contact", "Contact") }}</router-link>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 11. The journal (last) -->
    <section v-if="posts.length" class="sec">
      <div class="wrap">
        <div class="sec-hd">
          <div>
            <p class="eyebrow">{{ t("bakini.n.home.journalEyebrow", "Journal") }}</p>
            <h2>{{ t("bakini.n.home.journalH", "From the") }} <em>{{ t("bakini.n.home.journalHem", "journal.") }}</em></h2>
          </div>
          <router-link :to="blogTo" class="link">{{ t("bakini.n.home.allStories", "All stories") }}<nx-icon name="arrow" /></router-link>
        </div>
        <div class="jn-grid">
          <nx-post v-for="b in posts" :key="b.id" :post="b" />
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import NxIcon from "./NxIcon.vue";
import NxQb from "./NxQb.vue";
import NxCard from "./NxCard.vue";
import NxRow from "./NxRow.vue";
import NxMap from "./NxMap.vue";
import NxPost from "./NxPost.vue";
import NxCarousel from "./NxCarousel.vue";
import {
  bySells,
  catImage,
  catOf,
  catTitle,
  catTo,
  hueOf,
  inCat,
  loadNoir,
  mixed,
  money,
  noir,
  priceView,
  productImage,
  productTo,
  scrollBehavior,
  shopFacts,
  specGroups,
  specValue,
  unitOf,
} from "./noir";
import { addCount } from "../../kalio/kalio-basket";
import { dealsRoute } from "../../kalio/kalio-catalog";
import { journalPage, journalRoute } from "../../kalio/pages/kalio-journal";
import { breakable, fitInCircle } from "../fit-in-circle";
import { currentCurrency, isRtl } from "../../region-switcher/region";
import { t } from "../../kalio/i18n/kalio-i18n";

const list = (items) => {
  try {
    return new Intl.ListFormat(document.documentElement.lang || "en", { style: "long", type: "conjunction" }).format(items);
  } catch {
    return items.join(", ");
  }
};

export default {
  name: "NxHome",
  components: { NxIcon, NxQb, NxCard, NxRow, NxMap, NxPost, NxCarousel },

  data: () => ({ noir, posts: [], trioAt: [0, 0, 0], trioBusy: false, trioDone: false }),

  computed: {
    shop() {
      return this.$store.getters.getShop;
    },
    currency() {
      return currentCurrency();
    },
    facts() {
      return shopFacts(this.shop);
    },
    shopName() {
      const n = this.shop?.title || "";
      return n.charAt(0).toUpperCase() + n.slice(1);
    },
    products() {
      return this.noir.products;
    },
    /* Collections by how much they sell. */
    catsBySells() {
      return [...this.noir.cats]
        .map((c) => ({ c, s: inCat(c.id).reduce((n, p) => n + (p.sells || 0), 0) }))
        .filter((x) => inCat(x.c.id).length)
        .sort((a, b) => b.s - a.s)
        .map((x) => x.c);
    },
    topCat() {
      return this.catsBySells[0] || null;
    },
    heroLede() {
      const names = this.noir.cats.map((c) => catTitle(c).toLowerCase());
      if (!names.length) return "";
      const first = list(names);
      const lead = first.charAt(0).toUpperCase() + first.slice(1);
      const parts = [t("bakini.n.home.ledeSold", "{collections} — sold one by one.", { collections: lead })];
      const how = [];
      if (this.facts.courier) how.push(this.facts.courier.days.length >= 7 ? t("bakini.n.home.ledeDelivered", "Delivered every day") : t("bakini.n.home.ledeDeliveredSome", "Delivered"));
      if (this.facts.pickup && this.facts.hours) how.push(t("bakini.n.home.ledeCollected", "collected at the counter from {from} to {to}", { from: this.hoursParts?.[0], to: this.hoursParts?.[1] }));
      else if (this.facts.pickup) how.push(t("bakini.n.home.ledeCollectedNoHours", "collected at the counter"));
      if (how.length) parts.push(how.join(t("bakini.n.home.ledeOr", ", or ")) + ".");
      return parts.join(" ");
    },
    selection() {
      return mixed(bySells(this.products.filter((p) => p.quantity > 0))).slice(0, 12);
    },
    hoursParts() {
      const h = this.facts.hours;
      return h ? h.split("–") : null;
    },
    daysAria() {
      const d = this.facts.days;
      return d.length ? t("bakini.n.home.openDays", "Open {from} to {to}", { from: d[0], to: d[d.length - 1] }) : "";
    },
    counterLine() {
      const days = this.facts.everyDay ? t("bakini.n.home.monSun", "Monday to Sunday") : this.facts.days.join(", ");
      return this.shortAddress ? t("bakini.n.home.counterAt", "{days} at {address}.", { days, address: this.shortAddress }) : days;
    },
    hoursLine() {
      const f = this.facts;
      if (!f.hours) return "";
      return f.everyDay ? t("bakini.n.home.counterHours", "Counter {hours}, Monday to Sunday", { hours: f.hours }) : t("bakini.n.home.counterHoursOnly", "Counter {hours}", { hours: f.hours });
    },
    courierLine() {
      const c = this.facts.courier;
      if (!c) return "";
      const near = c.distance ? t("bakini.n.home.within", "Within {km} km of the bakery", { km: c.distance }) : "";
      const every = c.days.length >= 7 ? t("bakini.n.home.everyDayLower", "every day") : "";
      const lead = [near, every].filter(Boolean).join(", ");
      const choose = c.windows.length ? t("bakini.n.home.chooseWindow", "Choose a window at checkout:") : "";
      return [lead ? lead.charAt(0).toUpperCase() + lead.slice(1) + "." : "", choose].filter(Boolean).join(" ");
    },
    pickupLine() {
      const p = this.facts.pickup;
      if (!p) return "";
      const note = this.facts.pickupNote;
      const windows = p.windows.length ? t("bakini.n.home.pickupWindows", "Choose a {windows} window.", { windows: p.windows.join(t("bakini.n.home.or", " or ")) }) : "";
      return [note, windows].filter(Boolean).join(" ");
    },
    oneByOneLine() {
      const units = [...new Set(this.noir.cats.map((c) => unitOf(inCat(c.id)[0] || {}).toLowerCase()))].slice(0, 3);
      if (!units.length) return t("bakini.n.home.oneByOneP0", "Every pastry is a single piece, so you choose exactly what you want.");
      const ones = list(units.map((u) => t("bakini.n.home.oneUnit", "one {unit}", { unit: u })));
      return t("bakini.n.home.oneByOneP", "Every pastry is a single piece — {examples} — so you choose exactly what you want.", { examples: ones });
    },
    bentoOn() {
      return !!(this.facts.days.length || this.facts.courier || this.facts.shipping || this.facts.gateway || this.facts.pickup);
    },
    loved() {
      const all = bySells(this.products);
      return { top: all[0] || null, rest: all.slice(1, 9) };
    },
    /* The top collection's four best sellers and two of its own spec rows
       whose values are short and differ between them. */
    which() {
      const c = this.topCat;
      if (!c) return { items: [], keys: [], unit: "" };
      const items = bySells(inCat(c.id)).slice(0, 4);
      const first = specGroups(items[0] || {})[0];
      const keys = (first?.rows || [])
        .map((r) => r[0])
        .filter((k) => {
          const vals = items.map((p) => specValue(p, k));
          return vals.every((v) => v && v.length <= 28) && new Set(vals).size > 1;
        })
        .slice(0, 2);
      return { items, keys, unit: unitOf(items[0]).toLowerCase() };
    },
    compareAllTo() {
      return { name: window.$storefront.routes.COMPARISON_PAGE, query: { list: this.which.items.map((p) => "p" + p.id).join("_") } };
    },
    deal() {
      const withSave = this.products.map((p) => ({ p, v: this.pv(p) })).filter((x) => x.v.save > 0 && x.p.quantity > 0);
      if (!withSave.length) return { big: null, list: [], off: 0, every: false };
      const by = (a, b) => b.v.save - a.v.save || a.p.id - b.p.id;
      const big = [...withSave].sort(by)[0].p;
      const tiers = [0, 1].map((k) =>
        this.noir.cats
          .map((c) => withSave.filter((x) => x.p.category_id === c.id).sort(by)[k])
          .filter(Boolean)
          .sort(by)
          .map((x) => x.p),
      );
      const offs = withSave.map((x) => x.v.off);
      const off = Math.max(...offs);
      const every = withSave.length === this.products.length && Math.min(...offs) === off;
      return { big, list: tiers[0].concat(tiers[1]), off, every, cat: catOf(big.category_id) };
    },
    dealLine() {
      const c = this.deal.cat;
      const base = t("bakini.n.home.dealLine", "The saving is already in every price, with no code to enter.");
      return c ? `${base} ${t("bakini.n.home.dealLargest", "The largest savings are on {name}.", { name: catTitle(c).toLowerCase() })}` : base;
    },
    /* Three collections (by sales), each starting on its best seller. */
    trio() {
      return this.catsBySells.slice(0, 3).map((c, i) => {
        const l = bySells(inCat(c.id).filter((p) => p.quantity > 0));
        return { cat: c, list: l, at: Math.min(this.trioAt[i], Math.max(0, l.length - 1)), unit: unitOf(l[0]).toLowerCase() };
      }).filter((x) => x.list.length);
    },
    trioLede() {
      const u = this.trio.map((x) => t("bakini.n.home.oneUnit", "one {unit}", { unit: x.unit }));
      const l = list(u);
      return t("bakini.n.home.trioLede", "{pieces} — swap each piece, watch the total, add all three at once.", { pieces: l.charAt(0).toUpperCase() + l.slice(1) });
    },
    trioSum() {
      let now = 0;
      let was = 0;
      this.trio.forEach((_, i) => {
        const v = this.pv(this.trioPick(i));
        now += v.now;
        was += v.was || v.now;
      });
      return { now, was, save: was - now };
    },
    collage() {
      const out = [];
      const used = new Set();
      for (const p of bySells(this.products)) {
        if (out.length < 5 && !used.has(p.category_id)) {
          out.push(p);
          used.add(p.category_id);
        }
      }
      for (const p of bySells(this.products)) if (out.length < 5 && !out.includes(p)) out.push(p);
      return out;
    },
    storyP1() {
      const names = list(this.noir.cats.map((c) => catTitle(c).toLowerCase()));
      const at = this.shortAddress ? t("bakini.n.home.storyAt", "{shop} is a pâtisserie counter at {address}.", { shop: this.shopName, address: this.shortAddress }) : t("bakini.n.home.storyIs", "{shop} is a pâtisserie counter.", { shop: this.shopName });
      return names ? `${at} ${t("bakini.n.home.storyCase", "The case holds its collections — {names} — and every piece is sold individually.", { names })}` : at;
    },
    storyP2() {
      const units = this.trio.map((x) => x.unit);
      const simple = units.length >= 2 ? t("bakini.n.home.storySimple", "That makes an order simple: a single {a} for the morning, a {b} for later.", { a: units[0], b: units[1] }) : "";
      const open = this.facts.hours ? (this.facts.everyDay ? t("bakini.n.home.storyOpenEvery", "The counter is open every day from {from} to {to}.", { from: this.hoursParts[0], to: this.hoursParts[1] }) : t("bakini.n.home.storyOpen", "The counter is open from {from} to {to}.", { from: this.hoursParts[0], to: this.hoursParts[1] })) : "";
      return [simple, open].filter(Boolean).join(" ");
    },
    street() {
      const p = this.facts.pickupPoint;
      return p?.address || this.facts.address.split(",")[0];
    },
    cityLine() {
      const f = this.facts;
      return [f.city, [f.region ? this.regionShort(f.region) : "", f.postal].filter(Boolean).join(" ")].filter(Boolean).join(", ");
    },
    shortAddress() {
      return [this.street, this.facts.city].filter(Boolean).join(", ");
    },
    visitPlace() {
      return this.street ? this.street.replace(/^\d+\s+/, "") + "." : "";
    },
    mapLine() {
      return [this.street, this.facts.hours].filter(Boolean).join(" · ");
    },
    r() {
      return window.$storefront.routes;
    },
    dealsTo() {
      return dealsRoute();
    },
    blogTo() {
      return journalRoute();
    },
    contactTo() {
      return { name: this.r.SHOP_CONTACT_US };
    },
    aboutTo() {
      return { name: this.r.SHOP_PROFILE_PAGE_ABOUT_US };
    },
    bagTo() {
      return { name: this.r.BASKET_PAGE, params: { type: "PHYSICAL" } };
    },
  },

  watch: {
    "deal.big": {
      handler() {
        this.$nextTick(() => {
          this.fitRoundel();
          setTimeout(() => this.fitRoundel(), 300);
        });
      },
      immediate: true,
    },
    currency() {
      this.$nextTick(() => this.fitRoundel());
    },
  },

  created() {
    loadNoir();
  },

  mounted() {
    journalPage({ page: 1, limit: 8 })
      .then(({ articles }) => (this.posts = (articles || []).slice(0, 4)))
      .catch(() => (this.posts = []));
    this.onResize = () => this.fitRoundel();
    window.addEventListener("resize", this.onResize, { passive: true });
    document.fonts?.ready?.then(() => this.fitRoundel());
  },

  beforeUnmount() {
    window.removeEventListener("resize", this.onResize);
  },

  methods: {
    t,
    money,
    hueOf,
    catOf,
    catTitle,
    catTo,
    unitOf,
    productTo,
    specValue,
    pv(p) {
      void this.currency;
      return priceView(this.shop, p);
    },
    img(p) {
      return productImage(p);
    },
    thumb(p) {
      return productImage(p, 128);
    },
    catImg(c) {
      return catImage(c, 512);
    },
    dayShort(d) {
      return String(d).slice(0, 3);
    },
    regionShort(region) {
      const US = { California: "CA", "New York": "NY", Texas: "TX", Washington: "WA", Illinois: "IL", Florida: "FL" };
      return US[region] || region;
    },
    page(ref, dir) {
      const tr = this.$refs[ref];
      if (!tr) return;
      tr.scrollBy({ left: dir * (isRtl() ? -1 : 1) * tr.clientWidth * 0.84, behavior: scrollBehavior() });
    },
    trioPick(i) {
      const col = this.trio[i];
      return col ? col.list[col.at] : null;
    },
    trioStep(i, d) {
      const col = this.trio[i];
      if (!col) return;
      const n = col.list.length;
      const next = [...this.trioAt];
      next[i] = (col.at + d + n) % n;
      this.trioAt = next;
    },
    async addTrio() {
      this.trioBusy = true;
      try {
        for (let i = 0; i < this.trio.length; i++) await addCount(this, this.trioPick(i), null, 1);
        this.trioDone = true;
        setTimeout(() => (this.trioDone = false), 1600);
      } finally {
        this.trioBusy = false;
      }
    },
    fitRoundel() {
      const el = this.$refs.roundel;
      if (el) fitInCircle(el);
    },
    breakable,
  },
};
</script>
