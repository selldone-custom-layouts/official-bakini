<!--
  Medio — a product card, after a big catalogue store's: a white card, the
  photo on top with small badges (Deal, New, Best seller: from the deal and
  the shop's own tags) and a heart at its top right, a two-line name, the
  price (a capacity product says "From $X"), a red "Save $X" with "Was $Y",
  the deal's own countdown ("Ends in 364d 23:15:07", only when the deal has
  an end date; its line is kept on every card so a row's buttons stay level),
  the colour swatches (a tap picks that colour: its photo, price and stock)
  or the capacity chips, then a full-width green "Add to cart" that turns
  into "− n +" in place. A product whose choice is not a colour (capacity,
  size, pack) says "Choose options" and opens the quick-buy sheet, which has
  its own X. Nothing pops up. Compare sits at the foot. (medio-buy.ts)

  `inside`: drawn inside Selldone's own card (the catalogue grid), which is
  itself the link to the product, so this card has no links of its own then;
  its heart is a square button beside "Add to cart", as on a results page.
-->
<template>
  <article :class="{ '-inside': inside }" class="md-card">
    <div class="md-card__media">
      <component :is="inside ? 'div' : 'router-link'" :to="inside ? undefined : productTo" class="md-card__img" tabindex="-1">
        <img
          v-if="pictureIcon"
          :alt="product.title"
          :sizes="inside ? '(max-width: 600px) 46vw, (max-width: 1280px) 24vw, 300px' : '(max-width: 600px) 46vw, (max-width: 1280px) 22vw, 230px'"
          :src="picture"
          :srcset="srcset"
          loading="lazy"
          @error="dropSrcset"
        />
      </component>
      <div v-if="badges.length" class="md-card__badges">
        <span v-for="b in badges" :key="b.key" :class="'-' + b.key" class="md-badge">{{ b.label }}</span>
      </div>
      <button
        v-if="!inside"
        :aria-label="isSaved ? `Remove ${product.title} from your wishlist` : `Add ${product.title} to your wishlist`"
        :aria-pressed="isSaved ? 'true' : 'false'"
        :class="{ '-on': isSaved }"
        class="md-card__heart"
        type="button"
        @click.prevent.stop="toggleSave"
      >
        <span :class="{ fill: isSaved }" class="ms">favorite</span>
      </button>
    </div>

    <div class="md-card__body">
      <component :is="inside ? 'span' : 'router-link'" :to="inside ? undefined : productTo" class="md-card__t">{{ product.title }}</component>

      <div v-if="product.rate_count && product.rate" class="md-card__rate">
        <span :style="{ '--k-rate': product.rate }" class="k-stars"></span><small>({{ product.rate_count }})</small>
      </div>

      <div class="md-price">
        <small v-if="choose && fromPrice !== null" class="md-price__from">From</small>
        <u-price :amount="choose && fromPrice !== null ? fromPrice : money.now" :currency="currency" class="md-price__now" />
      </div>
      <div class="md-was">
        <template v-if="money.save > 0 && !choose">
          <span class="md-save">Save {{ moneyWhole(money.save) }}</span>
          <span class="md-was__t">Was <s><u-price :amount="money.was" :currency="currency" /></s></span>
        </template>
        <span v-else-if="choose && off > 0" class="md-save">Up to {{ off }}% off</span>
      </div>
      <!-- The deal's clock; its line is kept on every card so a row stays level. -->
      <div class="md-card__cd"><medio-deal-clock :end="dealEndsAt" mode="line" /></div>

      <div v-if="colours.length" :aria-label="`Colour of ${product.title}`" class="md-swrow" role="radiogroup">
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
        <div v-if="shown > 0" :class="{ '-busy': busy }" aria-label="Quantity in cart" class="md-step" role="group">
          <button :aria-label="shown > 1 ? 'One fewer' : 'Remove from cart'" type="button" @click.prevent.stop="step(-1)">
            <span class="ms">{{ shown > 1 ? "remove" : "delete" }}</span>
          </button>
          <output aria-live="polite"><b>{{ shown }}</b><small> in cart</small></output>
          <button aria-label="One more" type="button" @click.prevent.stop="step(1)"><span class="ms">add</span></button>
        </div>
        <button v-else-if="soldOut" class="md-btn -block -off" disabled type="button">Out of stock</button>
        <button v-else-if="choose" class="md-btn -block" type="button" @click.prevent.stop="$emit('quick-buy', product)">
          <span class="md-long">Choose options</span><span class="md-short">Options</span>
        </button>
        <button v-else class="md-btn -block" type="button" @click.prevent.stop="add">
          <span class="md-long">Add to cart</span><span class="md-short">Add</span>
        </button>
        <button
          v-if="inside"
          :aria-label="isSaved ? `Remove ${product.title} from your wishlist` : `Add ${product.title} to your wishlist`"
          :aria-pressed="isSaved ? 'true' : 'false'"
          :class="{ '-on': isSaved }"
          class="md-card__sq"
          type="button"
          @click.prevent.stop="toggleSave"
        >
          <span :class="{ fill: isSaved }" class="ms">favorite</span>
        </button>
      </div>

      <div class="md-card__foot" @click.prevent.stop>
        <button :aria-pressed="comparing ? 'true' : 'false'" :class="{ '-on': comparing }" class="md-cmp" type="button" @click.prevent.stop="toggleCompare">
          <i><span class="ms">check</span></i>Compare
        </button>
      </div>
    </div>
  </article>
</template>

<script>
import BuyMixin from "./medio-buy";
import MedioDealClock from "./MedioDealClock.vue";
import { dropSrcset, productSrcset } from "../kalio/kalio-catalog";
import { badgesOf, moneyOf, readTagIndex } from "./medio";

export default {
  name: "MedioCard",
  components: { MedioDealClock },
  mixins: [BuyMixin],

  props: {
    product: { type: Object, required: true },
    /** Inside Selldone's card (the catalogue): no links of its own. */
    inside: Boolean,
  },

  computed: {
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
    /* A capacity (or size, pack) product: its lowest price over the choices. */
    fromPrice() {
      if (!this.choose) return null;
      const list = this.variants.filter((v) => v && v.enable !== false && v.quantity > 0);
      const prices = (list.length ? list : this.variants).map((v) => moneyOf(this.shop, this.product, v.id ? v : null, this.currency).now);
      const ok = prices.filter((n) => Number.isFinite(n) && n > 0);
      return ok.length ? Math.min(...ok) : null;
    },
  },

  created() {
    readTagIndex();
  },

  methods: { dropSrcset },
};
</script>
