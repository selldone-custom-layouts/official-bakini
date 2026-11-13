<!--
  - Copyright (c) 2024. Selldone® Business OS™
  -
  - Author: M.Pajuhaan
  - Web: https://selldone.com
  - ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  -
  - All rights reserved. In the weave of time, where traditions and innovations intermingle, this content was crafted.
  - From the essence of thought, through the corridors of creativity, each word, and sentiment has been molded.
  - Not just to exist, but to inspire. Like an artist's stroke or a sculptor's chisel, every nuance is deliberate.
  - Our journey is not just about reaching a destination, but about creating a masterpiece.
  - Tread carefully, for you're treading on dreams.
  -->

<!--
  Bakini Noir — one package's way to the shopper (checkout-b.html "Delivery
  method", delivery-b.html): the shop's ways as cards (the mockup's .dmc:
  icon, name, a line about it, the fee), its pickup points as cards too,
  then the way's time windows as chips (one chosen, a ring inside). A way
  that asks for a date gets a date field. The data and every rule are
  Selldone's (the days and windows the way offers, lead time, the earliest
  date); choosing a window writes delivery_info.custom, .days and
  .time_spans, as Selldone's own "choose a time" does.
-->
<template>
  <section class="nx-ship">
    <div v-if="transportation_exclude_pickup?.length || pickups?.length" :aria-label="t('bakini.n.co.method', 'Delivery method')" class="dms" role="group">
      <button
        v-for="item in transportation_exclude_pickup"
        :key="item.type"
        :aria-pressed="transportation?.type === item.type && !selectedPickup ? 'true' : 'false'"
        class="dmc"
        type="button"
        @click="pickWay(item)"
      >
        <span class="dm-ic"><nx-icon :name="wayIcon(item.type)" /></span>
        <b>{{ wayTitleOf(item) }}</b>
        <span v-if="noteOf(item)" class="dmc-n">{{ noteOf(item) }}</span>
        <span class="dmc-f">{{ feeOf(item) }}</span>
      </button>
      <button
        v-for="(pickup, i) in pickups || []"
        :key="'p' + i"
        :aria-pressed="selectedPickup?.address && selectedPickup.address === pickup.address ? 'true' : 'false'"
        class="dmc"
        type="button"
        @click="pickPickup(pickup)"
      >
        <span class="dm-ic"><nx-icon name="store" /></span>
        <b>{{ pickup_transportation?.title || t("bakini.way.pickupAt", "Pickup at {place}", { place: pickup.title || pickup.name || pickup.address }) }}</b>
        <span class="dmc-n">{{ pickup.message || MapHelper.GenerateFullAddressFromMapInfo(pickup) }}</span>
        <span class="dmc-f">{{ t("bakini.n.co.free", "Free") }}</span>
      </button>
    </div>

    <template v-if="transportation">
      <template v-if="windowsOn && timeItems.length">
        <p class="dm-lbl">{{ t("bakini.n.co.window", "Time window") }}</p>
        <div :aria-label="t('bakini.n.co.window', 'Time window')" class="dm-win" role="group">
          <button
            v-for="span in timeItems"
            :key="span.value"
            :aria-pressed="isWindow(span.value) ? 'true' : 'false'"
            :disabled="span.props?.disabled"
            class="chip"
            type="button"
            @click="pickWindow(span.value)"
          >
            <nx-icon name="clock" />{{ windowName(span) }}
          </button>
        </div>
      </template>
      <template v-if="need_ask_shipping_date">
        <p class="dm-lbl">{{ t("bakini.n.co.date", "Date") }}</p>
        <label class="fld nx-ship__date">
          <span class="vh">{{ t("bakini.n.co.date", "Date") }}</span>
          <input :min="minDate" :type="transportation.eta === ETA.date.code ? 'date' : 'datetime-local'" :value="dateValue" @change="setDate($event.target.value)" />
        </label>
      </template>
      <p v-if="max_lead_time > 0 || transportation?.etd" class="nx-ship__hint">
        <nx-icon name="clock" />{{ t("bakini.n.co.readyIn", { one: "Ready in about {n} hour.", other: "Ready in about {n} hours." }, { n: max_lead_time + (transportation?.etd ? transportation.etd : 0) }) }}
      </p>
    </template>
  </section>
</template>

<script lang="ts">
import { money as moneyFrom } from "../../../components/region-switcher/region";
import { defineComponent } from "vue";
import { t } from "../../../components/kalio/i18n/kalio-i18n";
import ProductsDenseImagesCircles from "@selldone/components-vue/storefront/product/products-dense-images-circles/ProductsDenseImagesCircles.vue";
import { ShopTransportations } from "@selldone/core-js/enums/logistic/ShopTransportations.ts";
import { ETA } from "@selldone/core-js/enums/logistic/ETA.ts";
import { MapHelper, ShopOptionsHelper } from "@selldone/core-js/helper";
import { ProductType } from "@selldone/core-js/enums/product/ProductType.ts";
import { WeekDays } from "@selldone/core-js/enums/logistic/WeekDays.ts";
import { TimeSpans } from "@selldone/core-js/enums/logistic/TimeSpans.ts";
import TemplateMixin from "@selldone/components-vue/mixin/template/TemplateMixin.ts";
import ProductMixin from "@selldone/components-vue/mixin/product/ProductMixin.ts";
import MapMixin from "@selldone/components-vue/mixin/map/MapMixin.ts";
import NxIcon from "../../../components/bakini/noir/NxIcon.vue";
import { shopWay, wayIcon } from "../../../components/bakini/noir/buy/noir-cart";
import { wayTitle } from "../../../components/bakini/noir/noir";

export default defineComponent({
  name: "SCartShippingOptions",
  mixins: [TemplateMixin, ProductMixin, MapMixin],

  components: {
    ProductsDenseImagesCircles,
    NxIcon,
  },
  inject: ["$shop"],
  emits: ["update:transportation", "set-basket-config", "pickupSelected"],
  props: {
    basket: {
      require: true,
    },

    transportations: {},
    transportation: {},

    deliveryInfo: {},
    /**
     * Included item ids in this shipping option
     */
    itemIds: { type: Array },
    weight: {},
    volume: {},
    distance: {},
    cost: {},
    warehouse: {
      type: Object,
    },

    selectedPickup: {},

    pickupItemBgColor: {},
  },
  data: () => ({
    ETA: ETA,

    show_package_info: false,

    customDeliveryTimes: false,
  }),

  computed: {
    /* The way offers parts of the day to choose from. */
    windowsOn() {
      return !!this.transportation && [ETA.weekday_timeframe.code, ETA.timeframe.code].includes(this.transportation.eta);
    },
    MapHelper() {
      return MapHelper;
    },
    /** The shop's pickup points for this package. */
    pickups() {
      return this.isPhysicalBasket ? this.pickup_transportation?.pickups || [] : [];
    },
    isPhysicalBasket() {
      return this.basket?.type === ProductType.PHYSICAL.code;
    },
    /** The earliest the shopper may ask for (now + the method's dispatch
     *  time + the slowest product's lead time), as the date input wants it. */
    minDate() {
      if (!this.transportation) return null;
      const hours = (this.transportation.etd || 0) + (this.max_lead_time > 0 ? this.max_lead_time : 0);
      return this.inputDate(new Date(Date.now() + hours * 3600e3));
    },
    dateValue() {
      return this.deliveryInfo?.date ? this.inputDate(new Date(this.deliveryInfo.date)) : "";
    },
    cod_payment_exists() {
      return this.$shop.gateways?.some(
        (gateway) => gateway.currency === this.basket.currency && gateway.cod,
      );
    },
    warehouse_address() {
      return MapHelper.GenerateFullAddressFromMapInfo(this.warehouse);
    },
    // transport_types -> transportations
    //delivery_info->deliveryInfo

    no_map() {
      return !ShopOptionsHelper.HasMap(this.$shop);
    },

    size_unit() {
      return ShopOptionsHelper.GetSizeUnit(this.$shop);
    },

    mass_unit() {
      return ShopOptionsHelper.GetMassUnit(this.$shop);
    },
    distance_unit() {
      return ShopOptionsHelper.GetDistanceUnit(this.$shop);
    },

    isService() {
      return this.type === ProductType.SERVICE.code;
    },

    max_lead_time() {
      if (!this.basket) return 0;
      let max_lead = 0;
      this.basket.items.forEach((item) => {
        let lead = this.leadProduct(
          item.product,
          item.variant,
          item.vendor_product,
        );
        if (lead) max_lead = Math.max(max_lead, lead);
      });

      return max_lead;
    },

    light_checkout() {
      return this.$shop.theme && this.$shop.theme.light_checkout;
    },

    receiver_info() {
      return this.basket?.receiver_info || null;
    },

    has_delivery() {
      return ShopOptionsHelper.AskShippingAddress(this.$shop, this.basket.type);
      /*
      if (this.isPhysical || this.isService) {
        return true;
      }
      return false;*/
    },

    showCustomDeliveryTimeButton() {
      return (
        this.has_delivery &&
        this.receiver_info &&
        this.receiver_info.address &&
        this.is_valid_location
      );
    },

    is_valid_location() {
      if (this.no_map) return !!this.receiver_info.address; // Only enter address!
      return (
        this.receiver_info.location &&
        !!this.receiver_info.location.lat &&
        !!this.receiver_info.location.lng
      );
    },

    // ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Pickup ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅

    pickup_transportation() {
      return (
        this.transportations &&
        this.transportations.find(
          (t) => t.type === ShopTransportations.Pickup.code,
        )
      );
    },
    transportation_exclude_pickup() {
      return (
        this.transportations &&
        this.transportations.filter(
          (t) => t.type !== ShopTransportations.Pickup.code,
        )
      );
    },

    need_ask_shipping_date() {
      return (
        this.transportation &&
        [ETA.date.code, ETA.date_time.code].includes(this.transportation.eta)
      );
    },

    /**
     * Generates a list of day items based on the transportation days.
     * Each day item corresponds to a day in the WeekDays object.
     *
     * @returns {Array} - An array of day items.
     */
    dayItems() {
      const out = [];

      // If transportation is not defined, return an empty array
      if (!this.transportation) return out;

      // Iterate over each item in transportation.days
      this.transportation.days.forEach((item) => {
        // Check if the day exists in WeekDays
        if (WeekDays[item]) {
          out.push(Object.assign({}, WeekDays[item]));
        } else {
          out.push({
            value: item,
            name: t("shipping.invalid", "Invalid {value}", { value: String(item) }),
            icon: null,
            props: { disabled: true },
          });
        }
      });

      return out;
    },

    /**
     * Generates a list of time items with their properties.
     * Time items are marked as disabled if they are not included in the transportation time spans.
     * Additionally, invalid time spans (not in TimeSpans) are marked as disabled.
     *
     * @returns {{name,value,icon,props}[]} - An array of time items with properties.
     */
    timeItems() {
      let out = [];

      // If transportation is not defined, return an empty array
      if (!this.transportation) return out;

      // Iterate over each item in transportation.time_spans
      this.transportation.time_spans.forEach((item) => {
        // Check if the time_span exists in TimeSpans
        if (TimeSpans[item]) {
          out.push(Object.assign({}, TimeSpans[item]));
        } else {
          out.push({
            value: item,
            name: t("shipping.invalid", "Invalid {value}", { value: String(item) }),
            icon: null,
            props: { disabled: true },
          });
        }
      });

      return out;
    },
  },

  watch: {
    timeItems(timeItems) {
      // FIX MISS MATCH ISSUES:  Filter time_spans based on the values in the out array
      this.deliveryInfo.time_spans = this.deliveryInfo.time_spans?.filter(
        (timeSpan) => timeItems.some((it) => it.value === timeSpan),
      );
    },
    dayItems(dayItems) {
      // FIX MISS MATCH ISSUES:  Filter days based on the values in the out array
      this.deliveryInfo.days = this.deliveryInfo.days?.filter((day) =>
        dayItems.some((it) => it.value === day),
      );
    },

    transportation(transportation) {
      if (!this.has_delivery) return;

      this.deliveryInfo.type = transportation ? transportation.type : null;
      this.$nextTick(() => this.firstWindow());
    },

    transportations() {
      this.autoSelectTransportationType();
    },

    customDeliveryTimes(custom) {
      // this.deliveryInfo.days = [];
      //  this.deliveryInfo.time_spans = [];

      if (custom && this.transportation) {
        // Set all times for default custom delivery time!
        this.deliveryInfo.days = this.transportation.days.slice(0);
        this.deliveryInfo.time_spans = this._window ? [this._window] : this.transportation.time_spans.slice(0);
      }

      this.deliveryInfo.custom = custom;

      if (this.deliveryInfo.custom !== this.deliveryInfo?.custom) {
        //console.log("🧨 watch ===> customDeliveryTimes : setBasketConfig (customDeliveryTimes)");
        this.setBasketConfig();
      }
    },

    //------------- Force Show Date & Time inputs -----------
    need_ask_shipping_date(value) {
      if (value) {
        // We should ask user to select a date!
        this.customDeliveryTimes = true;
      }
    },
  },
  mounted() {
    this.customDeliveryTimes =
      this.need_ask_shipping_date || this.deliveryInfo.custom;
    this.autoSelectTransportationType();
    this.$nextTick(() => this.firstWindow());
  },

  methods: {
    moneyFrom,
    t,
    wayIcon,
    /* ── Bakini Noir ── */
    wayTitleOf(item) {
      return item?.title || wayTitle(item, this.$shop);
    },
    /* A line about the way, from its own data. */
    noteOf(given) {
      if (!given) return "";
      const item = { ...given, ...shopWay(this.$shop, given) };
      if (item.message) return item.message;
      const parts = [];
      if (item.type === "Global") parts.push(t("bakini.n.co.anywhere", "Ships anywhere"));
      else if (item.type !== "Pickup" && item.distance && item.distance < 1000) parts.push(t("bakini.n.co.within", "Local delivery within {km} km of the bakery", { km: item.distance }));
      if (item.free_shipping && item.free_shipping_limit > 0)
        parts.push(t("bakini.n.co.freeOverOrders", "free on orders over {amount}", { amount: moneyFrom(item.free_shipping_limit, item.currency, { short: "auto" }) }));
      const line = parts.join("; ");
      return line.charAt(0).toUpperCase() + line.slice(1);
    },
    feeOf(given) {
      if (!given) return "";
      const item = { ...given, ...shopWay(this.$shop, given) };
      const free = item.free_shipping && !(item.free_shipping_limit > 0);
      const fee = Number(item.const) || 0;
      const over = item.free_shipping && item.free_shipping_limit > 0 ? moneyFrom(item.free_shipping_limit, item.currency, { short: "auto" }) : "";
      if (free || !fee) return over ? t("bakini.n.co.freeOver", "Free over {amount}", { amount: over }) : t("bakini.n.co.free", "Free");
      const base = moneyFrom(fee, item.currency);
      return over ? t("bakini.n.co.feeFreeOver", "{fee} · free over {amount}", { fee: base, amount: over }) : base;
    },
    /* The shop's window by its own name ("Morning"), not Selldone's hours. */
    windowName(span) {
      const words = {
        Morning: t("bakini.n.co.winMorning", "Morning"),
        Evening: t("bakini.n.co.winEvening", "Evening"),
        Night: t("bakini.n.co.winNight", "Night"),
        Instant: t("bakini.n.co.winInstant", "Instant"),
      };
      return words[span.value] || this.$t(span.name);
    },
    isWindow(value) {
      return !!this.deliveryInfo?.custom && this.deliveryInfo.time_spans?.length === 1 && this.deliveryInfo.time_spans[0] === value;
    },
    /* One window: Selldone's own "choose a time" with that one part of the day. */
    pickWindow(value) {
      this._window = value;
      this.customDeliveryTimes = true;
      this.deliveryInfo.custom = true;
      this.deliveryInfo.days = this.transportation.days.slice(0);
      this.deliveryInfo.time_spans = [value];
      this.setBasketConfig();
    },
    /* A way with windows always has one chosen (the mockup): the first,
       until the shopper picks another. */
    firstWindow() {
      if (!this.transportation || !this.windowsOn || !this.timeItems.length) return;
      const cur = this.deliveryInfo?.time_spans;
      if (this.deliveryInfo?.custom && cur?.length === 1 && this.transportation.time_spans.includes(cur[0])) return;
      const first = this.timeItems.find((x) => !x.props?.disabled);
      if (first) this.pickWindow(first.value);
    },
    getShopTransportationObject(type) {
      return ShopTransportations[type];
    },

    autoSelectTransportationType() {
      if (!this.has_delivery || this.isService || !this.deliveryInfo) return; // Service has address (destination) but not need transportation type and delivery!
      /*  console.log(
        "%cautoSelectTransportationType: START",
        "background: #0097A7; color: #fff"
      );*/

      // Return if delivery type selected and valid (exist in acceptable transportations)
      console.log(
        "autoSelectTransportationType | autoSelectTransportationType > type: ",
        this.deliveryInfo.type,
      );
      if (this.deliveryInfo.type) {
        const found = this.transportations?.find(
          (it) => it.type === this.deliveryInfo.type,
        );
        if (found) {
          this.$emit("update:transportation", found);
          /* console.log(
            "autoSelectTransportationType",
            "Found transportation : ",
            found
          );*/
          return;
        }
      }

      if (!this.transportations?.length) {
        //console.log("autoSelectTransportationType", "transportations is null!");

        this.$emit("update:transportation", null);
        return null;
      }

      // Do not auto select pickup!
      const eligible_transportations = this.transportations?.filter(
        (x) => x.type !== "Pickup",
      );

      if (eligible_transportations.length) {
        this.$emit("update:transportation", eligible_transportations[0]);

        console.log(
          "%cautoSelectTransportationType: SELECT :::" +
            this.transportation?.type,
          "background: #0097A7; color: #fff",
        );
      }
    },

    setBasketConfig() {
      this.$emit("set-basket-config");
    },

    // ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Kalio ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅
    /* The buyer's own phone and note, apart from the counter's (Selldone
       copies the pickup point, with its phone and note, into the receiver). */
    buyerBits() {
      const r = this.basket?.receiver_info || {};
      const point = r.address ? (this.pickups || []).find((p) => p.address === r.address && (p.name || "") === (r.name || "")) : null;
      return {
        point,
        phone: point && r.phone === point.phone ? "" : r.phone || "",
        message: point && r.message === point.message ? "" : r.message || "",
      };
    },
    pickPickup(pickup) {
      const me = this.buyerBits();
      this.$emit("pickupSelected", { pickup: { ...pickup, phone: me.phone || pickup.phone, message: me.message || pickup.message }, transportation: this.pickup_transportation });
    },
    pickWay(item) {
      /* leaving pickup: the counter's address is not a delivery address */
      const me = this.buyerBits();
      if (me.point && this.basket) this.basket.receiver_info = { phone: me.phone, message: me.message };
      this.$emit("update:transportation", item);
      this.$nextTick(() => this.setBasketConfig());
    },
    /* A day or a part of the day on or off; one always stays on. */
    toggle(field, value) {
      const list = [...(this.deliveryInfo[field] || [])];
      const at = list.indexOf(value);
      if (at >= 0) {
        if (list.length === 1) return;
        list.splice(at, 1);
      } else list.push(value);
      this.deliveryInfo[field] = list;
      this.setBasketConfig();
    },
    setDate(value) {
      this.deliveryInfo.date = value ? new Date(value).toISOString() : null;
      this.setBasketConfig();
    },
    /* yyyy-mm-dd (a date) or yyyy-mm-ddThh:mm (a date and time), local. */
    inputDate(date) {
      const pad = (n) => String(n).padStart(2, "0");
      const day = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
      return this.transportation?.eta === ETA.date.code ? day : `${day}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
    },
  },
});
</script>

<style scoped lang="scss"></style>
