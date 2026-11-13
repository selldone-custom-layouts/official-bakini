/*
 * Bakini Noir — what the bag page's B markup reads on top of Selldone's own
 * basket page script (pages/basket/cart/StorefrontPageBasketCart.vue keeps
 * its whole script: bill, basket config, coupons, shipping options, guest
 * email, the payment window). Mixed into that page.
 *
 * - The page has two stages, as the mockup's two pages: the bag (rows,
 *   delivery preview, receipt, "Checkout") and the checkout (step pills,
 *   numbered glass cards, the floating receipt). ?step=checkout opens the
 *   second; both are the same Selldone basket.
 * - The checkout's cards write Selldone's own basket config: the guest's
 *   email (guest_email), the receiver's phone and note (receiver_info.phone,
 *   .message), the delivery way and its window (delivery_info.type, .custom,
 *   .days, .time_spans), the billing address (billing).
 * - Pickup is Selldone's: the pickup point becomes the receiver (its address,
 *   phone and place), so the bag shows the counter instead of an address.
 */
import { ShopTransportations } from "@selldone/core-js/enums/logistic/ShopTransportations";
import { catImage, catOf, catTitle, catTo, hueOf, loadNoir, noir, bySells, shopFacts, unitOf, productTo, wayTitle } from "../noir";
import { catalogueRoute } from "../../../kalio/kalio-catalog";
import { shownCount, stepTo } from "../../../kalio/kalio-basket";
import { productImage } from "../../../kalio/kalio-catalog";
import { money } from "../../../region-switcher/region";
import { t } from "../../../kalio/i18n/kalio-i18n";

declare const window: any;

/** The shop's own record of a way (its fee and free threshold live there;
    the bill's copy may leave them out). */
export function shopWay(shop: any, way: any): any {
  return (shop?.transportations || []).find((x: any) => x.type === way?.type && (!way?.id || !x.id || x.id === way.id)) || (shop?.transportations || []).find((x: any) => x.type === way?.type) || way;
}

/** A delivery way's icon in the mockup's set. */
export function wayIcon(type: string): string {
  if (type === ShopTransportations.Pickup.code) return "store";
  if (["Global", "Post", "Airplane", "Ship"].includes(type)) return "plane";
  return "bike";
}

/** A delivery window by the shop's own word ("Morning"), not Selldone's hours. */
export function windowWord(value: string): string {
  const words: Record<string, string> = {
    Morning: t("bakini.n.co.winMorning", "Morning"),
    Evening: t("bakini.n.co.winEvening", "Evening"),
    Night: t("bakini.n.co.winNight", "Night"),
    Instant: t("bakini.n.co.winInstant", "Instant"),
  };
  return words[value] || value;
}

/** "<way> · <window>" when the shopper chose one window. */
export function wayWindowLine(shop: any, info: any): string {
  if (!info?.type) return "";
  const name = wayTitle(shopWay(shop, { type: info.type }), shop);
  const win = info.custom && (info.time_spans || []).length === 1 ? windowWord(info.time_spans[0]) : "";
  return win ? `${name} · ${win}` : name;
}

/** The way's reach, from its own data ("Local delivery within 30 km of the
    bakery", "Ships anywhere"). */
export function wayReach(shop: any, given: any): string {
  const item = { ...(given || {}), ...shopWay(shop, given) };
  if (item.message) return item.message;
  /* A pickup has no reach: the counter's address and hours say it (Bakio's
     pickup order SM-40 read "Local delivery within 100 km", 13 Nov 2026). */
  if (item.type === ShopTransportations.Pickup.code) return "";
  if (item.type === "Global") return t("bakini.n.co.anywhere", "Ships anywhere");
  if (item.distance && item.distance < 1000) return t("bakini.n.co.within", "Local delivery within {km} km of the bakery", { km: item.distance });
  return "";
}

/** True when the order or bill is collected at a pickup counter. */
export function isPickupWay(info: any): boolean {
  return info?.type === ShopTransportations.Pickup.code;
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default {
  data: () => ({ noir, nx_touched: {} as Record<string, boolean>, nx_billing_other: false, nx_note: "" }),

  computed: {
    nx_stage(this: any): "bag" | "checkout" {
      return this.$route?.query?.step === "checkout" ? "checkout" : "bag";
    },
    nx_facts(this: any) {
      return shopFacts(this.$shop);
    },
    nx_lines(this: any): any[] {
      return (this.basket?.items || []).filter((it: any) => shownCount(it.product || { id: it.product_id }, it) > 0);
    },
    nx_currency(this: any): string {
      return this.bill?.currency || this.basket?.currency;
    },
    /* The receipt, in Selldone's own sums: full price, the items' savings,
       offers, delivery, the total. */
    nx_rc(this: any) {
      const b = this.bill || {};
      return {
        full: Number(b.items_price) || 0,
        save: Number(b.items_discount) || 0,
        offer: Number(b.offer) || 0,
        delivery: typeof b.delivery_price === "number" ? b.delivery_price : -1,
        total: Number(b.sum) || 0,
      };
    },
    /* "Savings · 25% off" when every line saves the same percent. */
    nx_save_label(this: any): string {
      const offs = this.nx_lines.filter((it: any) => it.dis > 0).map((it: any) => Math.round((it.dis / (it.price + it.dis)) * 100));
      if (offs.length && offs.length === this.nx_lines.length && offs.every((x: number) => x === offs[0]))
        return t("bakini.n.co.savingsOff", "Savings · {off}% off", { off: offs[0] });
      return t("bakini.n.co.savings", "Savings");
    },
    nx_way(this: any) {
      return this.transportation_now || null;
    },
    nx_is_pickup(this: any): boolean {
      return this.delivery_info?.type === ShopTransportations.Pickup.code;
    },
    nx_pickup_point(this: any) {
      const way = this.transportation_list?.find((x: any) => x.type === ShopTransportations.Pickup.code);
      return way?.pickups?.[0] || this.nx_facts.pickupPoint || null;
    },
    /* The receiver is the pickup counter (left from choosing pickup). */
    nx_receiver_is_pickup(this: any): boolean {
      const r = this.receiver_info;
      const pickups = this.transportation_list?.filter((x: any) => x.type === ShopTransportations.Pickup.code).flatMap((x: any) => x.pickups || []) || [];
      return !!r?.address && pickups.some((p: any) => p.address === r.address && (p.name || "") === (r.name || ""));
    },
    nx_has_address(this: any): boolean {
      return !!(this.receiver_info?.address && this.is_valid_location && !this.nx_receiver_is_pickup);
    },
    nx_email: {
      get(this: any): string {
        return this.user ? this.user.email || "" : this.guest_email || "";
      },
      set(this: any, v: string) {
        if (this.user) return;
        this.guest_email = (v || "").trim();
      },
    },
    nx_phone: {
      get(this: any): string {
        const r = this.receiver_info || {};
        if (this.nx_receiver_is_pickup && r.phone === this.nx_pickup_point?.phone) return "";
        return r.phone || "";
      },
      set(this: any, v: string) {
        if (!this.basket) return;
        if (!this.basket.receiver_info || Array.isArray(this.basket.receiver_info)) this.basket.receiver_info = {};
        this.basket.receiver_info.phone = v;
      },
    },
    nx_note_value: {
      get(this: any): string {
        const r = this.receiver_info || {};
        /* the counter's own note (left from choosing pickup) is not the buyer's */
        if (this.nx_receiver_is_pickup && r.message && r.message === this.nx_pickup_point?.message) return "";
        return r.message || "";
      },
      set(this: any, v: string) {
        if (!this.basket) return;
        if (!this.basket.receiver_info || Array.isArray(this.basket.receiver_info)) this.basket.receiver_info = {};
        this.basket.receiver_info.message = v;
      },
    },
    nx_email_ok(this: any): boolean {
      return !!this.user || EMAIL.test(this.guest_email || "");
    },
    nx_phone_ok(this: any): boolean {
      return String(this.nx_phone || "").replace(/\D/g, "").length >= 7;
    },
    nx_billing_custom(this: any): boolean {
      return !!this.billing?.custom || this.nx_billing_other;
    },
    /* What is still needed before Pay, named (the mockup's list). */
    nx_missing(this: any): { key: string; label: string }[] {
      const m: { key: string; label: string }[] = [];
      if (!this.user && !this.has_guest_payment) m.push({ key: "signin", label: t("bakini.n.co.needSignIn", "signing in") });
      if (!this.user && this.has_guest_payment && !this.nx_email_ok)
        m.push({ key: "email", label: this.guest_email ? t("bakini.n.co.needEmailValid", "a valid email") : t("bakini.n.co.needEmail", "your email") });
      if (this.has_delivery && !this.isService && !this.nx_phone_ok) m.push({ key: "phone", label: t("bakini.n.co.needPhone", "a phone number") });
      if (this.has_delivery && !this.isService && !this.nx_is_pickup && !this.nx_has_address)
        m.push({ key: "address", label: t("bakini.n.co.needAddress", "a delivery address") });
      if (this.nx_billing_custom && !(this.billing?.address && this.billing?.name)) m.push({ key: "billing", label: t("bakini.n.co.needBilling", "the billing address") });
      return m;
    },
    /* Step pills: Bag (done), Details, Delivery, Payment. */
    nx_steps(this: any) {
      const miss = this.nx_missing.map((x: any) => x.key);
      const details = miss.some((k: string) => ["signin", "email", "phone"].includes(k)) ? "cur" : "done";
      const delivery = miss.some((k: string) => ["address", "billing"].includes(k)) ? (details === "done" ? "cur" : "todo") : details === "done" ? "done" : "todo";
      const payment = details === "done" && delivery === "done" ? "cur" : "todo";
      return [
        { key: "bag", label: t("bakini.n.co.stepBag", "Bag"), state: "done", to: { query: {} } },
        { key: "details", label: t("bakini.n.co.stepDetails", "Details"), state: details, anchor: "co-details" },
        { key: "delivery", label: t("bakini.n.co.stepDelivery", "Delivery"), state: delivery, anchor: "co-delivery" },
        { key: "payment", label: t("bakini.n.co.stepPayment", "Payment"), state: payment, anchor: "co-pay" },
      ];
    },
    /* Every way to pay is cash on delivery (Bakio): the button says so. */
    nx_cod_only(this: any): boolean {
      const ways = this.payment_ways;
      return !!ways && ways.length > 0 && ways.every((g: any) => g.cod);
    },
    nx_no_gateway(this: any): boolean {
      return !!this.payment_ways && !this.payment_ways.length && this.nx_rc.total > 0 && !this.is_service_need_pricing && !this.isSubscription;
    },
    nx_place_label(this: any): string {
      const total = this.nx_money(this.nx_rc.total);
      if (this.is_service_need_pricing) return this.$t("basket_page.pre_confirm_service");
      return this.nx_cod_only ? t("bakini.n.co.placeCod", "Place order · pay {total} on delivery", { total }) : t("bakini.n.co.place", "Place order · pay {total}", { total });
    },
    nx_way_line(this: any): string {
      const way = this.nx_way;
      if (!way) return "";
      const name = wayTitle(way, this.$shop);
      const spans = this.delivery_info?.custom && this.delivery_info?.time_spans?.length === 1 ? windowWord(this.delivery_info.time_spans[0]) : "";
      return spans ? `${name} · ${spans}` : name;
    },
    nx_delivery_label(this: any): string {
      const way = this.nx_way;
      return way ? wayTitle(way, this.$shop) : t("bakini.n.co.delivery", "Delivery");
    },
    /* The receipt's delivery value. Selldone sends -1 for "paid on delivery"
       (the way's SOD switch); a way with no fee at all (no fixed fee, no rate
       by distance or weight) is free either way, as its card says. */
    nx_delivery_value(this: any): string {
      const d = this.nx_rc.delivery;
      if (d > 0) return this.nx_money(d);
      if (d === 0 || this.nx_way_is_free) return t("bakini.n.co.free", "Free");
      return t("bakini.n.co.atDoor", "On delivery");
    },
    /* The chosen way costs nothing: no fixed fee, no rate by distance or weight. */
    nx_way_is_free(this: any): boolean {
      const way = this.nx_way ? { ...this.nx_way, ...shopWay(this.$shop, this.nx_way) } : null;
      if (!way) return false;
      if (way.type === ShopTransportations.Pickup.code) return true;
      return !(Number(way.const) > 0) && !(Number(way.distance_rate) > 0) && !(Number(way.weight_rate) > 0);
    },
    /* The bag's delivery ways in the checkout's order: the ways, then pickup. */
    nx_ways_in_order(this: any): any[] {
      const list = this.transportation_list || [];
      const pickup = ShopTransportations.Pickup.code;
      return [...list.filter((w: any) => w.type !== pickup), ...list.filter((w: any) => w.type === pickup)];
    },
    shopTo(): any {
      return catalogueRoute({});
    },
    nx_often(this: any): any[] {
      const inBag = new Set(this.nx_lines.map((it: any) => it.product_id));
      return bySells(this.noir.products.filter((p: any) => p.quantity > 0 && !inBag.has(p.id))).slice(0, 12);
    },
  },

  created() {
    loadNoir();
  },

  methods: {
    t,
    hueOf,
    catTo,
    wayIcon,
    catImg(c: any) {
      return catImage(c, 128);
    },
    /* The way's own title, else words from its kind (noir.ts). */
    wayTitleOf(this: any, way: any): string {
      return wayTitle(way, this.$shop);
    },
    unitOf,
    productTo,
    nx_cat(this: any, it: any): string {
      return catTitle(catOf(it.product?.category_id));
    },
    nx_img(it: any): string | null {
      return productImage(it.product || {}, true);
    },
    nx_money(this: any, n: number): string {
      return money(Number(n) || 0, this.nx_currency);
    },
    nx_shown(it: any): number {
      return shownCount(it.product || { id: it.product_id }, it);
    },
    nx_remove(this: any, it: any) {
      stepTo(this, { id: it.product_id, type: it.product?.type }, it, 0);
    },
    nx_unit(it: any): string {
      return unitOf(it.product || {});
    },
    nx_go_checkout(this: any) {
      this.$router.push({ query: { ...this.$route.query, step: "checkout" } }).catch(() => {});
      window.scrollTo({ top: 0 });
    },
    nx_go_bag(this: any) {
      const q = { ...this.$route.query };
      delete q.step;
      this.$router.push({ query: q }).catch(() => {});
    },
    nx_scroll_to(this: any, id: string) {
      const el = document.getElementById(id);
      if (!el) return;
      const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
      el.scrollIntoView({ block: "center", behavior: reduce ? "auto" : "smooth" });
      const input = el.querySelector("input, textarea, button") as HTMLElement | null;
      try {
        input?.focus({ preventScroll: true });
      } catch {
        /* nothing to focus */
      }
    },
    nx_goto(this: any, key: string) {
      this.nx_touched = { ...this.nx_touched, [key]: true };
      if (key === "signin") return this.NeedLogin();
      if (key === "address") return this.nx_scroll_to("co-address");
      if (key === "billing") return this.nx_scroll_to("co-billing");
      return this.nx_scroll_to("co-f-" + key);
    },
    nx_save_contact(this: any) {
      this.nx_touched = { ...this.nx_touched, email: true, phone: true };
      if (!this.user && this.guest_email && !this.nx_email_ok) return;
      this.setBasketConfig();
    },
    nx_set_billing(this: any, custom: boolean) {
      this.nx_billing_other = custom;
      if (!custom) {
        this.billing = { ...(this.billing || {}), custom: false };
        this.setBasketConfig();
      }
    },
    /* Bag stage: choosing a way here writes Selldone's delivery type (and,
       for pickup, the pickup point as the receiver, as Selldone's own
       pickup choice does). */
    nx_pick_way(this: any, way: any) {
      if (!this.basket || !way) return;
      /* the buyer's own phone and note go with them from way to way */
      const phone = this.nx_phone;
      const note = this.nx_note_value;
      const fromPickup = this.nx_receiver_is_pickup;
      this.delivery_info.type = way.type;
      if (way.type === ShopTransportations.Pickup.code && way.pickups?.length) {
        const point = way.pickups[0];
        this.basket.receiver_info = Object.assign({}, point, { phone: phone || point.phone, message: note || point.message });
      } else if (fromPickup) {
        /* leaving pickup: the counter's address is not a delivery address */
        this.basket.receiver_info = { phone, message: note };
      }
      this.setBasketConfig();
    },
    nx_way_fee(this: any, given: any): string {
      if (!given) return "";
      const way = { ...given, ...shopWay(this.$shop, given) };
      const free = !!way.free_shipping && !(Number(way.free_shipping_limit) > 0);
      if (way.type === ShopTransportations.Pickup.code || free) return t("bakini.n.co.free", "Free");
      const fee = Number(way.const) || 0;
      /* priced by distance or weight: the address sets it */
      if (!fee && (Number(way.distance_rate) > 0 || Number(way.weight_rate) > 0)) return way.sod ? t("bakini.n.co.atDoor", "On delivery") : t("bakini.n.co.byAddress", "Set by your address");
      const over = way.free_shipping && Number(way.free_shipping_limit) > 0 ? money(Number(way.free_shipping_limit), way.currency, { short: "auto" }) : "";
      if (!fee) return over ? t("bakini.n.co.freeOver", "Free over {amount}", { amount: over }) : t("bakini.n.co.free", "Free");
      const base = money(fee, way.currency);
      return over ? t("bakini.n.co.feeFreeOver", "{fee} · free over {amount}", { fee: base, amount: over }) : base;
    },
    /* Place order: what is missing first (named, the first one focused),
       then Selldone's own Pay (the payment window). */
    nx_place(this: any) {
      const miss = this.nx_missing;
      if (miss.length) {
        const touched: Record<string, boolean> = { ...this.nx_touched };
        miss.forEach((x: any) => (touched[x.key] = true));
        this.nx_touched = touched;
        const box = this.$el?.querySelector?.("[data-miss]");
        if (box) {
          box.classList.add("shake");
          setTimeout(() => box.classList.remove("shake"), 400);
        }
        if (miss[0].key === "address") return this.openAddress();
        return this.nx_goto(miss[0].key);
      }
      this.setBasketConfig();
      this.onPay();
    },
  },
};
