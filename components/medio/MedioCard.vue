<!--
  Medio — a product, in two shapes (medio-buy.ts holds what both share).

  GRID card (rails, the home, a phone's results): a white rounded card; the
  square white picture with small badges (Deal, New, Best seller: the deal
  and the shop's own tags) and a heart; a two-line name; the price with a
  magenta "Save $X" and "Was $Y"; the deal's own clock ("Ends in 364d
  23:15:07", its line kept on every card so a row stays level); colour
  swatches (a tap picks that colour: its photo, price and stock) or capacity
  chips; a full-width violet "Add to basket" that turns into "− n +" in
  place ("Choose options" opens the quick-buy sheet for a capacity product);
  Compare and Save at the foot. Nothing pops up.

  LIST row (the results page's List view on a computer, the reference
  site's signature): the picture on the left; in the middle the name, five
  to seven bullets from the product's own flat spec and an offer box (the
  deal's clock, "Compare with similar products"); on the right the price
  column (price, Save, Was, true badges, stock and delivery lines from the
  shop's own delivery ways, an outline "View product", a filled "Add to
  basket"); Compare and "Save for later" at the row's foot.

  `inside`: drawn inside Selldone's own card (the results grid), which is
  itself the link to the product, so this card has no links of its own
  then, and follows the page's List / Grid toggle (medio.ts listingView).
-->
<template>
  <!-- ▆▆▆▆ LIST row ▆▆▆▆ -->
  <article v-if="asRow" class="md-lrow">
    <div class="md-lrow__media">
      <div class="md-lrow__img">
        <img
          v-if="pictureIcon"
          :alt="product.title"
          :src="picture"
          :srcset="srcset"
          loading="lazy"
          sizes="200px"
          @error="dropSrcset"
        />
      </div>
    </div>

    <div class="md-lrow__mid">
      <span class="md-lrow__t">{{ product.title }}</span>
      <p v-if="product.brand" class="md-lrow__brand">{{ product.brand }}</p>
      <ul v-if="bullets.length" class="md-lrow__specs">
        <li v-for="b in bullets" :key="b.key"><b>{{ b.key }}:</b> {{ b.value }}</li>
      </ul>
      <div v-if="colours.length" :aria-label="t('medio.card.colourOf', 'Colour of {name}', { name: product.title })" class="md-swrow" role="radiogroup" @click.prevent.stop>
        <button
          v-for="(v, i) in colours.slice(0, 8)"
          :key="i"
          :aria-checked="i === pick ? 'true' : 'false'"
          :aria-label="colourName(v.color)"
          :class="{ '-on': i === pick, '-out': v.quantity === 0 }"
          :style="{ '--sw': swatchBg(v.color) }"
          :title="colourName(v.color)"
          class="md-sw"
          role="radio"
          type="button"
          @click.prevent.stop="pick = i"
        ></button>
        <em v-if="colours.length > 8">+{{ colours.length - 8 }}</em>
      </div>
      <div v-else-if="chips.length" class="md-caps">
        <span v-for="c in chips.slice(0, 5)" :key="c">{{ c }}</span>
      </div>
      <div class="md-lrow__offers" @click.prevent.stop>
        <div v-if="dealEndsAt" class="md-lrow__offer -deal">
          <span class="ms">schedule</span>
          <span class="md-lrow__ow">{{ t("medio.card.dealEnds", "Deal ends in") }} <medio-deal-clock :end="dealEndsAt" mode="bare" /></span>
        </div>
        <button class="md-lrow__offer" type="button" @click.prevent.stop="toggleCompare">
          <span class="ms">compare_arrows</span>
          <span class="md-lrow__ow">{{ comparing ? t("medio.card.inCompare", "Added to compare") : t("medio.card.compareSimilar", "Compare with similar products") }}</span>
          <span class="ms md-chev md-lrow__chev">chevron_right</span>
        </button>
      </div>
    </div>

    <div class="md-lrow__buy">
      <div class="md-price -lg">
        <small v-if="choose && fromPrice !== null" class="md-price__from">{{ t("medio.card.from", "From") }}</small>
        <u-price :amount="choose && fromPrice !== null ? fromPrice : money.now" :currency="currency" class="md-price__now" />
      </div>
      <div class="md-was">
        <template v-if="money.save > 0 && !choose">
          <span class="md-save">{{ t("medio.card.save", "Save {amount}", { amount: moneyWhole(money.save) }) }}</span>
          <span class="md-was__t">{{ t("medio.card.was", "Was") }} <s><u-price :amount="money.was" :currency="currency" /></s></span>
        </template>
        <span v-else-if="choose && off > 0" class="md-save">{{ t("medio.card.upToOff", "Up to {n}% off", { n: off }) }}</span>
      </div>
      <div v-if="badges.length || off > 0" class="md-lrow__badges">
        <span v-for="b in badges" :key="b.key" :class="'-' + b.key" class="md-badge">{{ badgeWord(b) }}</span>
        <span v-if="off > 0 && !choose" class="md-badge -off">{{ t("medio.card.pctOff", "{n}% off", { n: off }) }}</span>
      </div>
      <ul class="md-lrow__avail">
        <li :class="soldOut ? '-no' : '-ok'">
          <span class="ms">{{ soldOut ? "cancel" : "check_circle" }}</span>{{ soldOut ? t("medio.card.outOfStock", "Out of stock") : t("medio.card.inStock", "In stock") }}
        </li>
        <li v-if="!soldOut && ways.delivery"><span class="ms">local_shipping</span>{{ t("medio.card.delivery", "Available for delivery") }}</li>
        <li v-if="!soldOut && ways.collect"><span class="ms">storefront</span>{{ t("medio.card.collect", "Collection available") }}</li>
      </ul>
      <span class="md-btn -line -block md-lrow__view">{{ t("medio.card.view", "View product") }}</span>
      <div class="md-lrow__add" @click.prevent.stop>
        <div v-if="shown > 0" :class="{ '-busy': busy }" :aria-label="t('medio.card.qtyInBasket', 'Quantity in basket')" class="md-step" role="group">
          <button :aria-label="shown > 1 ? t('medio.card.fewer', 'One fewer') : t('medio.card.remove', 'Remove from basket')" type="button" @click.prevent.stop="step(-1)">
            <span class="ms">{{ shown > 1 ? "remove" : "delete" }}</span>
          </button>
          <output aria-live="polite"><b>{{ shown }}</b><small> {{ t("medio.card.inBasket", "in basket") }}</small></output>
          <button :aria-label="t('medio.card.more', 'One more')" type="button" @click.prevent.stop="step(1)"><span class="ms">add</span></button>
        </div>
        <button v-else-if="soldOut" class="md-btn -block -off" disabled type="button">{{ t("medio.card.outOfStock", "Out of stock") }}</button>
        <button v-else-if="choose" class="md-btn -block" type="button" @click.prevent.stop="$emit('quick-buy', product)">{{ t("medio.card.choose", "Choose options") }}</button>
        <button v-else class="md-btn -block" type="button" @click.prevent.stop="add"><span class="ms">shopping_basket</span>{{ t("medio.card.add", "Add to basket") }}</button>
      </div>
    </div>

    <div class="md-lrow__foot" @click.prevent.stop>
      <button :aria-pressed="comparing ? 'true' : 'false'" :class="{ '-on': comparing }" class="md-cmp" type="button" @click.prevent.stop="toggleCompare">
        <i><span class="ms">check</span></i>{{ t("medio.card.compare", "Compare") }}
      </button>
      <button :aria-pressed="isSaved ? 'true' : 'false'" :class="{ '-on': isSaved }" class="md-later" type="button" @click.prevent.stop="toggleSave">
        <span :class="{ fill: isSaved }" class="ms">favorite</span>{{ isSaved ? t("medio.card.saved", "Saved") : t("medio.card.saveLater", "Save for later") }}
      </button>
    </div>
  </article>

  <!-- ▆▆▆▆ GRID card ▆▆▆▆ -->
  <article v-else :class="{ '-inside': inside }" class="md-card">
    <div class="md-card__media">
      <component :is="inside ? 'div' : 'router-link'" :to="inside ? undefined : productTo" class="md-card__img" tabindex="-1">
        <img
          v-if="pictureIcon"
          :alt="product.title"
          :sizes="inside ? '(max-width: 600px) 46vw, (max-width: 1280px) 24vw, 260px' : '(max-width: 600px) 46vw, (max-width: 1280px) 22vw, 230px'"
          :src="picture"
          :srcset="srcset"
          loading="lazy"
          @error="dropSrcset"
        />
      </component>
      <div v-if="badges.length" class="md-card__badges">
        <span v-for="b in badges.slice(0, 2)" :key="b.key" :class="'-' + b.key" class="md-badge">{{ badgeWord(b) }}</span>
      </div>
    </div>

    <div class="md-card__body">
      <component :is="inside ? 'span' : 'router-link'" :to="inside ? undefined : productTo" class="md-card__t">{{ product.title }}</component>

      <div v-if="product.rate_count && product.rate" class="md-card__rate">
        <span :style="{ '--k-rate': product.rate }" class="k-stars"></span><small>({{ product.rate_count }})</small>
      </div>

      <div class="md-price">
        <small v-if="choose && fromPrice !== null" class="md-price__from">{{ t("medio.card.from", "From") }}</small>
        <u-price :amount="choose && fromPrice !== null ? fromPrice : money.now" :currency="currency" class="md-price__now" />
        <span v-if="money.save > 0 && !choose" class="md-save">{{ t("medio.card.save", "Save {amount}", { amount: moneyWhole(money.save) }) }}</span>
        <span v-else-if="choose && off > 0" class="md-save">{{ t("medio.card.upToOff", "Up to {n}% off", { n: off }) }}</span>
      </div>
      <div class="md-was">
        <span v-if="money.save > 0 && !choose" class="md-was__t">{{ t("medio.card.was", "Was") }} <s><u-price :amount="money.was" :currency="currency" /></s></span>
      </div>
      <!-- The deal's clock; its line is kept on every card so a row stays level. -->
      <div class="md-card__cd"><medio-deal-clock :end="dealEndsAt" mode="line" /></div>

      <div v-if="colours.length" :aria-label="t('medio.card.colourOf', 'Colour of {name}', { name: product.title })" class="md-swrow" role="radiogroup">
        <button
          v-for="(v, i) in colours.slice(0, maxSwatches)"
          :key="i"
          :aria-checked="i === pick ? 'true' : 'false'"
          :aria-label="colourName(v.color)"
          :class="{ '-on': i === pick, '-out': v.quantity === 0 }"
          :style="{ '--sw': swatchBg(v.color) }"
          :title="colourName(v.color)"
          class="md-sw"
          role="radio"
          type="button"
          @click.prevent.stop="pick = i"
        ></button>
        <em v-if="colours.length > maxSwatches">+{{ colours.length - maxSwatches }}</em>
      </div>
      <div v-else-if="chips.length" class="md-caps">
        <span v-for="c in chips.slice(0, 3)" :key="c">{{ c }}</span>
        <em v-if="chips.length > 3">+{{ chips.length - 3 }}</em>
      </div>
      <div v-else class="md-swrow -none"></div>

      <div class="md-card__buy" @click.prevent.stop>
        <div v-if="shown > 0" :class="{ '-busy': busy }" :aria-label="t('medio.card.qtyInBasket', 'Quantity in basket')" class="md-step" role="group">
          <button :aria-label="shown > 1 ? t('medio.card.fewer', 'One fewer') : t('medio.card.remove', 'Remove from basket')" type="button" @click.prevent.stop="step(-1)">
            <span class="ms">{{ shown > 1 ? "remove" : "delete" }}</span>
          </button>
          <output aria-live="polite"><b>{{ shown }}</b><small> {{ t("medio.card.inBasket", "in basket") }}</small></output>
          <button :aria-label="t('medio.card.more', 'One more')" type="button" @click.prevent.stop="step(1)"><span class="ms">add</span></button>
        </div>
        <button v-else-if="soldOut" class="md-btn -block -off" disabled type="button">{{ t("medio.card.outOfStock", "Out of stock") }}</button>
        <button v-else-if="choose" class="md-btn -block" type="button" @click.prevent.stop="$emit('quick-buy', product)">
          <span class="md-long">{{ t("medio.card.choose", "Choose options") }}</span><span class="md-short">{{ t("medio.card.options", "Options") }}</span>
        </button>
        <button v-else class="md-btn -block" type="button" @click.prevent.stop="add">
          <span class="md-long">{{ t("medio.card.add", "Add to basket") }}</span><span class="md-short">{{ t("medio.card.addShort", "Add") }}</span>
        </button>
      </div>

      <div class="md-card__foot" @click.prevent.stop>
        <button :aria-pressed="comparing ? 'true' : 'false'" :class="{ '-on': comparing }" class="md-cmp" type="button" @click.prevent.stop="toggleCompare">
          <i><span class="ms">check</span></i>{{ t("medio.card.compare", "Compare") }}
        </button>
        <button
          :aria-label="isSaved ? t('medio.card.unsaveName', 'Remove {name} from saved items', { name: product.title }) : t('medio.card.saveName', 'Save {name} for later', { name: product.title })"
          :aria-pressed="isSaved ? 'true' : 'false'"
          :class="{ '-on': isSaved }"
          class="md-later"
          type="button"
          @click.prevent.stop="toggleSave"
        >
          <span :class="{ fill: isSaved }" class="ms">favorite</span><span class="md-later__w">{{ isSaved ? t("medio.card.saved", "Saved") : t("medio.card.saveShort", "Save") }}</span>
        </button>
      </div>
    </div>
  </article>
</template>

<script>
import BuyMixin from "./medio-buy";
import MedioDealClock from "./MedioDealClock.vue";
import { dropSrcset, productSrcset } from "../kalio/kalio-catalog";
import { badgesOf, catalogueById, deliveryKinds, moneyOf, readTagIndex, viewMode } from "./medio";
import { specRows } from "./product/medio-spec";
import { t } from "../kalio/i18n/kalio-i18n";

export default {
  name: "MedioCard",
  components: { MedioDealClock },
  mixins: [BuyMixin],

  props: {
    product: { type: Object, required: true },
    /** Inside Selldone's card (the results page): no links of its own, and
        the page's List / Grid toggle decides the shape. */
    inside: Boolean,
  },

  data: () => ({ rich: null }),

  computed: {
    asRow() {
      return this.inside && viewMode() === "list";
    },
    maxSwatches() {
      return 5;
    },
    picture() {
      return this.pictureIcon ? window.CDN.GET_SHOP_IMAGE_PATH(this.pictureIcon, null) : null;
    },
    srcset() {
      return productSrcset(this.product, this.variant?.image || null);
    },
    badges() {
      return badgesOf(this.product, this.off > 0);
    },
    /* Five to seven bullets from the product's own flat spec (the
       catalogue's record carries it when the listing's does not). */
    bullets() {
      const p = this.product?.spec ? this.product : this.rich || this.product;
      return specRows(p).slice(0, 6);
    },
    ways() {
      return deliveryKinds(this.shop);
    },
    /* A capacity (or size, pack) product: its lowest price over the choices. */
    fromPrice() {
      if (!this.choose) return null;
      const list = this.variants.filter((v) => v && v.enable !== false && v.quantity > 0);
      const prices = (list.length ? list : this.variants).map((v) => moneyOf(this.shop, this.product, v.id ? v : null, this.currency).now);
      const ok = prices.filter((n) => Number.isFinite(n) && n > 0);
      return ok.length ? Math.min(...ok) : null;
    },
  },

  watch: {
    asRow: {
      handler(row) {
        if (row && !this.product?.spec && !this.rich) {
          catalogueById().then((map) => (this.rich = map.get(this.product?.id) || null));
        }
      },
      immediate: true,
    },
  },

  created() {
    readTagIndex();
  },

  methods: {
    t,
    dropSrcset,
    badgeWord(b) {
      if (b.key === "deal") return t("medio.badge.deal", "Deal");
      if (b.key === "new") return t("medio.badge.new", "New");
      if (b.key === "best") return t("medio.badge.best", "Best seller");
      return b.label;
    },
  },
};
</script>
