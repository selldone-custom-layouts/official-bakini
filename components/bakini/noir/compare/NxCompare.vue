<!--
  Bakini Noir — the compare page (bakio-design/compare-b.html,
  b/pages-product.js compare): the picks side by side, their heads sticking
  to the top while the rows scroll (photo, name, price, Add, ✕ inside the
  card's corner); one empty column "Add a pastry" while there are fewer than
  four (a list of the shop's collections and pieces opens beside it); the
  price and stock, then the spec rows in the shop's own groups: a row whose
  values differ gets a small dot and bolder values, a row that is the same
  everywhere is one line ("value · all"); an "Only differences" switch hides
  those; then "Why pick it" (each pick's own pros) and the reviews (an
  honest "No reviews yet" with the rating criteria until there are some);
  and a card to copy the link. On a phone the heads and rows scroll sideways
  together, each column 66% of the screen.

  Everything else is Kalio's compare (extends KalioCompare): the list in the
  address (Selldone's ?list=p1_p2v3), Selldone's comparison store, the
  full products read once.
-->
<template>
  <div class="nx nx-cmp">
    <div :class="['cmp', { 'only-diff': diffOnly }]" :style="{ '--bk-cols': cols }">
      <div class="wrap cmp-top">
        <nav :aria-label="t('bakini.n.cmp.crumbs', 'Breadcrumb')" class="crumbs">
          <router-link :to="{ path: '/' }">{{ t("bakini.n.cmp.home", "Home") }}</router-link>
          <nx-icon name="right" />
          <span aria-current="page">{{ t("bakini.n.cmp.crumb", "Compare") }}</span>
        </nav>
        <div class="cmp-title">
          <div>
            <h1 class="serif">{{ t("bakini.n.cmp.h1", "Compare") }}{{ " " }}<em>{{ t("bakini.n.cmp.h1em", "side by side.") }}</em></h1>
            <p v-if="items.length" class="muted">{{ names }}</p>
          </div>
          <div v-if="items.length > 1" class="cmp-tools">
            <label class="switch"><input v-model="diffOnly" type="checkbox" /><span class="tr"></span>{{ t("bakini.n.cmp.onlyDiff", "Only differences") }}</label>
            <button class="btn ghost sm" type="button" @click="copyLink('top')">
              <nx-icon :name="copied === 'top' ? 'check' : 'link'" />{{ copied === "top" ? t("bakini.n.cmp.copied", "Link copied") : t("bakini.n.cmp.copy", "Copy link") }}
            </button>
          </div>
        </div>
      </div>

      <!-- Nothing picked yet -->
      <div v-if="!items.length" class="wrap">
        <div class="empty nx-cmp-empty">
          <span class="ec"><nx-icon name="compare" /></span>
          <h3>{{ busy ? t("bakini.n.cmp.loading", "Opening your comparison…") : t("bakini.n.cmp.emptyT", "Nothing to compare yet") }}</h3>
          <p v-if="!busy">{{ t("bakini.n.cmp.emptyP", "Add up to four pastries and see them side by side, row by row.") }}</p>
          <div v-if="!busy" class="acts">
            <button aria-controls="cmp-pick" class="btn" type="button" @click="pick($event)"><nx-icon name="plus" />{{ t("bakini.n.cmp.addOne", "Add a pastry") }}</button>
            <router-link :to="catalogue" class="btn ghost">{{ t("bakini.n.cmp.browse", "Browse every pastry") }}</router-link>
          </div>
        </div>
      </div>

      <template v-else>
        <div class="cmp-stick">
          <div class="wrap">
            <div ref="sxh" class="cmp-sx" @scroll.passive="sync($event, 'sxb')">
              <div class="cmp-grid cmp-heads">
                <div class="ck-pad">
                  <p class="eyebrow">{{ t("bakini.n.cmp.nOf4", "{n} of {max}", { n: items.length, max: MAX }) }}</p>
                </div>
                <div v-for="it in items" :key="it.key" :style="{ '--bk-hue': hueOf(it.product.category_id) }" class="ch-card">
                  <div class="ch-in">
                    <router-link :to="productRoute(it)" aria-hidden="true" class="ch-ph" tabindex="-1"><img :src="it.image" alt="" class="cut" /></router-link>
                    <button :aria-label="t('bakini.n.cmp.remove', 'Remove {name} from the comparison', { name: it.product.title })" class="iconbtn ch-x" type="button" @click="remove(it)">
                      <nx-icon name="close" />
                    </button>
                    <router-link :to="productRoute(it)" class="ch-name">{{ it.product.title }}</router-link>
                    <p class="ch-price">
                      <span class="money">{{ fmt(it.price.now) }}</span>{{ " " }}<span v-if="it.price.was" class="was money">{{ fmt(it.price.was) }}</span>
                    </p>
                    <div class="ch-add"><nx-qb :label="t('bakini.n.cmp.add', 'Add')" :product="it.product" size="mid" /></div>
                  </div>
                </div>
                <div v-if="items.length < MAX" class="ch-card ch-empty">
                  <button :aria-expanded="layer.open === 'cmp-pick' ? 'true' : 'false'" aria-controls="cmp-pick" class="ch-addbtn" type="button" @click="pick($event)">
                    <span class="ch-plus"><nx-icon name="plus" /></span><b>{{ t("bakini.n.cmp.addOne", "Add a pastry") }}</b
                    ><span class="muted">{{ t("bakini.n.cmp.upTo", "Up to four side by side") }}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="wrap">
          <div ref="sxb" class="cmp-sx" @scroll.passive="sync($event, 'sxh')">
            <div class="cmp-grid-body">
              <!-- Price and stock -->
              <div class="cg-h">
                <h3>{{ t("bakini.n.cmp.priceH", "Price & stock") }}</h3>
              </div>
              <div v-for="r in priceRows" :key="r.key" :class="['cr', r.diff ? 'diff' : 'same']" :data-same="r.diff ? undefined : ''">
                <template v-if="r.diff">
                  <div class="ck"><i aria-hidden="true" class="cdot"></i>{{ r.label }}<span class="vh"> {{ t("bakini.n.cmp.differs", "(differs)") }}</span></div>
                  <div v-for="(c, i) in r.cells" :key="i" class="cv">
                    <b :class="r.cls">{{ c.main }}</b
                    ><template v-if="c.was">{{ " " }}<span class="was money">{{ c.was }}</span></template>
                  </div>
                  <div v-if="items.length < MAX" aria-hidden="true" class="cv cv-pad"></div>
                </template>
                <template v-else>
                  <div class="ck">{{ r.label }}</div>
                  <div class="call">
                    {{ r.cells[0].main }}<template v-if="r.cells[0].was">{{ " " }}<span class="was money">{{ r.cells[0].was }}</span></template
                    >{{ " " }}<span class="muted">· {{ allWord }}</span>
                  </div>
                </template>
              </div>

              <!-- The spec, in the shop's own groups -->
              <template v-for="g in groups" :key="g.title">
                <div class="cg-h">
                  <h3>{{ g.title }}</h3>
                </div>
                <div v-for="r in g.rows" :key="g.title + r.key" :class="['cr', r.same ? 'same' : 'diff']" :data-same="r.same ? '' : undefined">
                  <template v-if="r.same">
                    <div class="ck">{{ r.key }}</div>
                    <div class="call">
                      {{ r.values[0] || "—" }}{{ " " }}<span class="muted">· {{ allWord }}</span>
                    </div>
                  </template>
                  <template v-else>
                    <div class="ck">
                      <i v-if="r.diff" aria-hidden="true" class="cdot"></i>{{ r.key }}<span v-if="r.diff" class="vh"> {{ t("bakini.n.cmp.differs", "(differs)") }}</span>
                    </div>
                    <div v-for="(v, i) in r.values" :key="i" class="cv">
                      <b>{{ v || "—" }}</b>
                    </div>
                    <div v-if="items.length < MAX" aria-hidden="true" class="cv cv-pad"></div>
                  </template>
                </div>
              </template>

              <!-- Why pick it -->
              <template v-if="anyPros">
                <div class="cg-h">
                  <h3>{{ t("bakini.n.cmp.whyH", "Why pick it") }}</h3>
                </div>
                <div class="cr cr-tall">
                  <div class="ck">{{ t("bakini.n.cmp.fromShop", "From the shop") }}</div>
                  <div v-for="it in items" :key="it.key" class="cv">
                    <ul class="cpros">
                      <li v-for="(x, i) in prosOf(it.product)" :key="i">
                        <b>{{ x[0] }}</b><span>{{ x[1] }}</span>
                      </li>
                    </ul>
                  </div>
                  <div v-if="items.length < MAX" aria-hidden="true" class="cv cv-pad"></div>
                </div>
              </template>

              <!-- Reviews -->
              <div class="cg-h">
                <h3>{{ t("bakini.n.cmp.reviewsH", "Reviews") }}</h3>
              </div>
              <div class="cr cr-tall">
                <div class="ck">{{ t("bakini.n.cmp.customerReviews", "Customer reviews") }}</div>
                <div v-for="it in items" :key="it.key" class="cv">
                  <p class="crev">
                    <template v-if="it.rateCount > 0">
                      <b class="nx-stars">★ {{ it.rate.toFixed(1) }}</b
                      ><span class="muted">{{ t("bakini.n.cmp.reviewsN", { one: "{n} review", other: "{n} reviews" }, { n: it.rateCount }) }}</span>
                    </template>
                    <template v-else>
                      <b>{{ t("bakini.n.cmp.noReviews", "No reviews yet") }}</b
                      ><span v-if="ratingNames(it.product).length" class="muted">{{ ratingNames(it.product).join(" · ") }}</span>
                    </template>
                  </p>
                </div>
                <div v-if="items.length < MAX" aria-hidden="true" class="cv cv-pad"></div>
              </div>
            </div>
          </div>

          <div class="cmp-share">
            <span class="iline"
              ><nx-icon name="share" /><span
                ><b>{{ t("bakini.n.cmp.shareT", "Share this comparison") }}</b
                ><span class="muted">{{ t("bakini.n.cmp.shareP", "The link keeps these pastries in this order.") }}</span></span
              ></span
            >
            <button class="btn" type="button" @click="copyLink('foot')">
              <nx-icon :name="copied === 'foot' ? 'check' : 'link'" />{{ copied === "foot" ? t("bakini.n.cmp.copied", "Link copied") : t("bakini.n.cmp.copy", "Copy link") }}
            </button>
          </div>
        </div>
      </template>
    </div>

    <!-- Add a pastry: the shop's collections and their pieces. -->
    <teleport to="body">
      <div class="nx nx-layers">
        <div id="cmp-pick" ref="pickPop" :aria-label="t('bakini.n.cmp.addOne', 'Add a pastry')" :class="['pop', 'cmp-pick', { open: layer.open === 'cmp-pick' }]" :style="pickPos" role="dialog">
          <h3>{{ t("bakini.n.cmp.addOne", "Add a pastry") }}</h3>
          <div class="cmp-pick-l">
            <template v-for="c in noir.cats" :key="c.id">
              <p class="cpk-c"><bdi>{{ catTitle(c) }}</bdi></p>
              <button v-for="p in pickable(c)" :key="p.id" type="button" @click="choose(p)">
                <span class="th"><img :src="thumb(p)" alt="" /></span><span>{{ p.title }}</span><span class="money muted">{{ fmt(priceView(shop, p).now) }}</span>
              </button>
            </template>
          </div>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script>
import KalioCompare from "../../../kalio/compare/KalioCompare.vue";
import NxIcon from "../NxIcon.vue";
import NxQb from "../NxQb.vue";
import { catTitle, closeLayer, hueOf, layer, loadNoir, money as fmt, noir, openLayer, priceView, productImage, prosOf, ratingNames, unitOf } from "../noir";
import { isEnglish, plural } from "../product/pd";
import { catalogueRoute } from "../../../kalio/kalio-catalog";
import { t } from "../../../kalio/i18n/kalio-i18n";

export default {
  name: "NxCompare",
  extends: KalioCompare,
  components: { NxIcon, NxQb },

  data() {
    return { layer, noir, pickPos: {} };
  },

  computed: {
    cols() {
      return this.items.length + (this.items.length < this.MAX ? 1 : 0);
    },
    names() {
      return this.items.map((it) => it.product.title).join(", ");
    },
    allWord() {
      return t("bakini.n.cmp.all", "all");
    },
    catalogue() {
      return catalogueRoute({});
    },
    anyPros() {
      return this.items.some((it) => prosOf(it.product).length);
    },
    /* Price, saving and stock, each a row like the spec's. */
    priceRows() {
      const items = this.items;
      const many = items.length > 1;
      const row = (key, label, cells, cls = "") => {
        const same = many && cells.every((c) => c.main === cells[0].main && (c.was || "") === (cells[0].was || ""));
        return { key, label, cells, cls, diff: !same };
      };
      const out = [
        row(
          "price",
          t("bakini.n.cmp.pricePer", "Price per piece"),
          items.map((it) => ({ main: fmt(it.price.now), was: it.price.was ? fmt(it.price.was) : "" })),
          "money",
        ),
      ];
      if (items.some((it) => it.price.was && it.price.was > it.price.now))
        out.push(row("save", t("bakini.n.cmp.youSave", "You save"), items.map((it) => ({ main: it.price.was ? fmt(it.price.was - it.price.now) : "—", was: "" })), "gold money"));
      out.push(
        row(
          "stock",
          t("bakini.n.cmp.inStock", "In stock"),
          items.map((it) => ({ main: this.stockText(it), was: "" })),
        ),
      );
      return out;
    },
  },

  watch: {
    "layer.open"(id) {
      if (id === "cmp-pick") this.$nextTick(() => this.place());
    },
  },

  created() {
    loadNoir();
  },

  mounted() {
    this.onResize = () => {
      if (this.layer.open === "cmp-pick") this.place();
    };
    window.addEventListener("resize", this.onResize, { passive: true });
  },

  beforeUnmount() {
    window.removeEventListener("resize", this.onResize);
    if (this.layer.open === "cmp-pick") closeLayer(true);
  },

  methods: {
    t,
    fmt,
    hueOf,
    catTitle,
    prosOf,
    ratingNames,
    priceView,
    thumb(p) {
      return productImage(p, 128);
    },
    stockText(it) {
      const n = Number(it.stock) || 0;
      if (n <= 0) return t("bakini.n.cmp.soldOut", "Sold out");
      const unit = unitOf(it.product).toLowerCase();
      return isEnglish() ? `${n} ${plural(unit, n)}` : String(n);
    },
    /* The heads and the rows scroll sideways together. */
    sync(e, other) {
      if (this.syncing) return;
      const to = this.$refs[other];
      if (!to) return;
      this.syncing = true;
      to.scrollLeft = e.target.scrollLeft;
      requestAnimationFrame(() => (this.syncing = false));
    },
    pickable(c) {
      return this.noir.products.filter((p) => p.category_id === c.id && !this.ids.includes(p.id));
    },
    pick(e) {
      if (this.layer.open === "cmp-pick") closeLayer();
      else openLayer("cmp-pick", e?.currentTarget || null);
    },
    choose(p) {
      closeLayer(true);
      this.add(p);
    },
    /* Under the button, never within 12px of an edge. */
    place() {
      const btn = document.activeElement?.closest?.('[aria-controls="cmp-pick"]') || this.$el.querySelector('[aria-controls="cmp-pick"]');
      const el = this.$refs.pickPop;
      if (!btn || !el) return;
      const r = btn.getBoundingClientRect();
      const w = el.offsetWidth || 360;
      const h = el.offsetHeight || 400;
      const left = Math.max(12, Math.min(window.innerWidth - w - 12, r.left));
      const below = r.bottom + 10;
      const top = below + h > window.innerHeight - 12 ? Math.max(12, r.top - h - 10) : below;
      this.pickPos = { top: `${top}px`, left: `${left}px` };
    },
    copyLink(where) {
      const done = () => {
        this.copied = where;
        clearTimeout(this.copy_timer);
        this.copy_timer = setTimeout(() => (this.copied = null), 1600);
      };
      try {
        navigator.clipboard.writeText(this.link).then(done, done);
      } catch {
        done();
      }
    },
  },
};
</script>
