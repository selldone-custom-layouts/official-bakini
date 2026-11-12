<!--
  Bakini Noir — the bag drawer (b/core.js drawerHTML(), renderDrawer(),
  bagRow()): "Your bag" from the right; a row per line (the photo on its
  plate, the name, the price with was and the saving, the line total and
  − n +); "Often added" (best sellers from collections not in the bag); the
  receipt (items at full price, savings, delivery at checkout, the total)
  with "View bag" and "Checkout". Empty: a calm card, "Continue shopping" and
  "Start with a favourite". The lines are Selldone's own basket (every count
  through kalio-basket's queue), its amounts in the visitor's currency.
-->
<template>
  <aside id="drawer" :aria-label="t('bakini.n.bag.title', 'Your bag')" :class="['drawer', { open }]" aria-modal="true" role="dialog">
    <div class="drawer-hd">
      <h2>{{ t("bakini.n.bag.title", "Your bag") }}</h2>
      <button :aria-label="t('bakini.n.bag.close', 'Close bag')" class="iconbtn" type="button" @click="close"><nx-icon name="close" /></button>
    </div>
    <div class="drawer-body">
      <template v-if="lines.length">
        <div v-for="it in lines" :key="it.id" :style="{ '--bk-hue': hueOf(it.product?.category_id) }" class="brow">
          <router-link :to="productTo(it)" aria-hidden="true" class="th" tabindex="-1" @click="close"><img :src="image(it)" alt="" class="cut" loading="lazy" /></router-link>
          <div style="min-width: 0">
            <router-link :to="productTo(it)" class="nm" @click="close">{{ it.product?.title }}</router-link>
            <div class="meta">
              <span class="money">{{ amount(it.price, it) }}</span>
              <template v-if="it.dis > 0">
                <span class="was money">{{ amount(it.price + it.dis, it) }}</span> · <span class="gold">{{ t("bakini.n.bag.save", "Save {amount}", { amount: amount(it.dis, it) }) }}</span></template
              >
            </div>
          </div>
          <div class="rt">
            <span class="lt money">{{ amount(it.price * shown(it), it) }}</span>
            <nx-line-qb :item="it" />
          </div>
        </div>
        <div v-if="often.length" class="often">
          <h3>{{ t("bakini.n.bag.often", "Often added") }}</h3>
          <div class="often-list"><nx-mini v-for="p in often" :key="p.id" :product="p" /></div>
        </div>
      </template>
      <template v-else>
        <div class="empty" style="margin-top: 8px">
          <span class="ec"><nx-icon name="bag" /></span>
          <h3>{{ t("bakini.n.bag.emptyT", "Your bag is empty") }}</h3>
          <p>{{ t("bakini.n.bag.emptyP", "Pastries are sold one by one, so add exactly the pieces you want.") }}</p>
          <div class="acts"><router-link :to="shopTo" class="btn" @click="close">{{ t("bakini.n.bag.continue", "Continue shopping") }}</router-link></div>
        </div>
        <div v-if="often.length" class="often">
          <h3>{{ t("bakini.n.bag.favourite", "Start with a favourite") }}</h3>
          <div class="often-list"><nx-mini v-for="p in often" :key="p.id" :product="p" /></div>
        </div>
      </template>
    </div>
    <div v-if="lines.length" class="drawer-ft">
      <div class="rcpt">
        <div class="ln">
          <span>{{ t("bakini.n.rc.full", "Items at full price") }}</span><span class="money">{{ money(sum.full, sum.currency) }}</span>
        </div>
        <div v-if="sum.save > 0" class="ln save">
          <span>{{ t("bakini.n.rc.savings", "Savings") }}</span><span class="money">−{{ money(sum.save, sum.currency) }}</span>
        </div>
        <div class="ln">
          <span>{{ t("bakini.n.rc.delivery", "Delivery") }}</span><span>{{ t("bakini.n.rc.atCheckout", "Chosen at checkout") }}</span>
        </div>
        <div class="ln tot">
          <span>{{ t("bakini.n.rc.total", "Total") }}</span><span class="money">{{ money(sum.total, sum.currency) }}</span>
        </div>
      </div>
      <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-top: 16px; flex-wrap: wrap">
        <router-link :to="bagTo" class="link" @click="close">{{ t("bakini.n.bag.view", "View bag") }}</router-link>
        <router-link :to="bagTo" class="btn lg" @click="close">{{ t("bakini.n.bag.checkout", "Checkout") }}<nx-icon name="arrow" /></router-link>
      </div>
    </div>
  </aside>
</template>

<script>
import NxIcon from "./NxIcon.vue";
import NxLineQb from "./NxLineQb.vue";
import NxMini from "./NxMini.vue";
import { bySells, closeLayer, hueOf, layer, noir } from "./noir";
import { shownCount } from "../../kalio/kalio-basket";
import { catalogueRoute, productImage } from "../../kalio/kalio-catalog";
import { money } from "../../region-switcher/region";
import { t } from "../../kalio/i18n/kalio-i18n";

export default {
  name: "NxBagDrawer",
  components: { NxIcon, NxLineQb, NxMini },
  data: () => ({ layer, noir }),
  computed: {
    open() {
      return this.layer.open === "drawer";
    },
    basket() {
      return this.getBaskets().find((b) => b?.type === "PHYSICAL") || this.getBaskets().find((b) => b?.items?.length) || null;
    },
    lines() {
      return (this.basket?.items || []).filter((it) => shownCount(it.product || { id: it.product_id }, it) > 0);
    },
    sum() {
      const b = this.basket || {};
      let full = 0;
      let save = 0;
      for (const it of this.lines) {
        const n = this.shown(it);
        full += (it.price + (it.dis || 0)) * n;
        save += (it.dis || 0) * n;
      }
      save += this.lines.reduce((s, it) => s + (it.offer_amount || 0), 0);
      return { full, save, total: full - save, currency: b.bill?.currency || b.currency };
    },
    /* Three best sellers, one per collection not already in the bag. */
    often() {
      const inBag = new Set(this.lines.map((it) => it.product_id));
      const cats = new Set(this.lines.map((it) => it.product?.category_id));
      const picks = [];
      const used = new Set();
      const all = bySells(this.noir.products.filter((p) => p.quantity > 0));
      for (const p of all) {
        if (picks.length < 3 && !inBag.has(p.id) && !cats.has(p.category_id) && !used.has(p.category_id)) {
          picks.push(p);
          used.add(p.category_id);
        }
      }
      for (const p of all) if (picks.length < 3 && !inBag.has(p.id) && !picks.includes(p)) picks.push(p);
      return picks;
    },
    bagTo() {
      return { name: window.$storefront.routes.BASKET_PAGE, params: { type: "PHYSICAL" } };
    },
    shopTo() {
      return catalogueRoute({});
    },
  },
  methods: {
    t,
    money,
    hueOf,
    close() {
      closeLayer();
    },
    shown(it) {
      return shownCount(it.product || { id: it.product_id }, it);
    },
    amount(n, it) {
      return money(n, it.currency || this.sum.currency);
    },
    image(it) {
      return productImage(it.product || {}, true);
    },
    productTo(it) {
      return { name: window.$storefront.routes.PRODUCT_PAGE, params: { product_id: it.product_id } };
    },
  },
};
</script>
