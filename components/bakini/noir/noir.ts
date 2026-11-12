/*
 * Bakini Noir — the shared shell state and the shop's data as the B mockup
 * (bakio-design/b/core.js) uses it, read live from the shop:
 *
 * - `noir`: the collections (root categories, the shop's order) and the
 *   whole catalogue, read once and shared by every page;
 * - the layers (the mockup's openLayer / closeLayer): one open at a time;
 *   menus open on a click, a second click, Esc or a click outside closes;
 *   a sheet, drawer or dialog adds the scrim and stops the page scrolling;
 * - helpers the mockup's markup needs: a collection's warm hue, a product's
 *   unit, price, saving and stock, its spec groups and pros, the shop's
 *   facts (address, days, counter hours, delivery ways and windows, payment).
 *
 * Nothing names a product, price, collection or delivery way: another bakery
 * that imports the Layout gets its own.
 */
import { reactive } from "vue";
import { aisleImage, aisles, aisleRoute } from "../../kalio/kalio-catalog";
import { catalogue, moneyOf, moneyText, percentOff } from "../bakini";
import { currentCurrency } from "../../region-switcher/region";
import { t } from "../../kalio/i18n/kalio-i18n";

declare const window: any;

/* ━━━━━━━━━━━━ Data ━━━━━━━━━━━━ */

/** The mockup's six warm hues, given to the collections in the shop's order
    (Bakio: cookies, croissants, Danish, mini cakes, muffins, tarts get the
    mockup's exact hues), cycled for a shop with more. */
export const HUES = ["#c27c4a", "#e7a93f", "#e0784f", "#e0857a", "#c99a5c", "#e8c14a"];

export const noir = reactive({ cats: [] as any[], products: [] as any[], ready: false, catsReady: false });

let booted = false;
/** Read the collections and the catalogue once (every page calls it). */
export function loadNoir(): void {
  if (booted) return;
  booted = true;
  aisles().then((list) => {
    noir.cats = list;
    noir.catsReady = true;
  });
  catalogue().then((list) => {
    noir.products = list;
    noir.ready = true;
  });
}

export function catOf(id: number | null | undefined): any {
  return noir.cats.find((c) => c.id === id) || null;
}

export function hueOf(catId: number | null | undefined): string {
  const i = noir.cats.findIndex((c) => c.id === catId);
  return HUES[(i < 0 ? 0 : i) % HUES.length];
}

export function catTitle(c: any): string {
  return (c && (c.title || c.name)) || "";
}

export function catTo(c: any) {
  return aisleRoute(c);
}

export function catImage(c: any, size = 256): string | null {
  return c?.id ? aisleImage(c, size) : null;
}

export function inCat(catId: number): any[] {
  return noir.products.filter((p) => p.category_id === catId);
}

/** Most sold first (Selldone's `sells`), the shop's order on a tie. */
export function bySells(list: any[]): any[] {
  return [...list].sort((a, b) => (b.sells || 0) - (a.sells || 0) || a.id - b.id);
}

/** Round-robin across collections, so a row never shows one kind only. */
export function mixed(list: any[]): any[] {
  const groups = new Map<any, any[]>();
  for (const p of list) {
    if (!groups.has(p.category_id)) groups.set(p.category_id, []);
    groups.get(p.category_id)!.push(p);
  }
  const qs = [...groups.values()];
  const out: any[] = [];
  while (qs.some((q) => q.length)) for (const q of qs) if (q.length) out.push(q.shift());
  return out;
}

export function productTo(p: any) {
  return { name: window.$storefront.routes.PRODUCT_PAGE, params: { product_id: p?.id } };
}

export function productImage(p: any, size: number | null = null): string | null {
  return p?.icon ? window.CDN.GET_SHOP_IMAGE_PATH(p.icon, size) : null;
}

/** The unit a product is sold by ("croissant"), or "piece". */
export function unitOf(p: any): string {
  return (p?.unit && String(p.unit).trim()) || t("bakini.unit.piece", "piece");
}

export interface PriceView {
  now: number;
  was: number | null;
  save: number;
  off: number;
  currency: string;
}

/** Price now, before, the saving and the percent, by Selldone's own rules,
    in the visitor's currency. */
export function priceView(shop: any, p: any, variant: any = null): PriceView {
  const currency = currentCurrency();
  const m = moneyOf(shop, p, variant, currency);
  const off = m.was ? Math.round((m.save / m.was) * 100) : percentOff(shop, p);
  return { now: m.now, was: m.was, save: m.save, off, currency };
}

/** An amount in the visitor's currency, written as the mockup writes it ("$3.15"). */
export function money(n: number, whole = false): string {
  return moneyText(n || 0, currentCurrency(), whole);
}

/** The flat spec ({"Group":"group","Key":["v"]}) as the mockup's groups. */
export function specGroups(p: any): { group: string; rows: [string, string][] }[] {
  const spec = p?.spec;
  if (!spec || typeof spec !== "object") return [];
  const keys: string[] = Array.isArray(p.spec_order) && p.spec_order.length ? p.spec_order : Object.keys(spec);
  const out: { group: string; rows: [string, string][] }[] = [];
  let cur: { group: string; rows: [string, string][] } | null = null;
  for (const k of keys) {
    const v = spec[k];
    if (v === "group") {
      cur = { group: k, rows: [] };
      out.push(cur);
      continue;
    }
    if (v == null || v === "") continue;
    const text = Array.isArray(v) ? v.filter((x) => x != null && x !== "").join(", ") : String(v);
    if (!text) continue;
    if (!cur) {
      cur = { group: "", rows: [] };
      out.push(cur);
    }
    cur.rows.push([k, text]);
  }
  return out.filter((g) => g.rows.length);
}

/** One spec value by key (the first group that has it). */
export function specValue(p: any, key: string): string {
  for (const g of specGroups(p)) for (const r of g.rows) if (r[0] === key) return r[1];
  return "";
}

/** The pros as [title, text] pairs. */
export function prosOf(p: any): [string, string][] {
  const pros = p?.pros;
  if (!pros) return [];
  if (Array.isArray(pros)) return pros.map((x: any) => (Array.isArray(x) ? [String(x[0] || ""), String(x[1] || "")] : [String(x?.title || ""), String(x?.text || x?.body || "")])) as [string, string][];
  return Object.entries(pros).map(([k, v]) => [k, String(v || "")]) as [string, string][];
}

/** The rating criteria's names ("Flakiness", "Flavor"…). */
export function ratingNames(p: any): string[] {
  return (p?.ratings || []).map((r: any) => r?.name).filter(Boolean);
}

/* ━━━━━━━━━━━━ The shop's facts ━━━━━━━━━━━━ */

export interface DeliveryWay {
  id: number;
  type: string;
  title: string;
  windows: string[];
  fee: number;
  freeOver: number | null;
  free: boolean;
  distance: number;
  cod: boolean;
  days: string[];
  pickups: any[];
  pickup: boolean;
}

const COURIER = ["Motorbike", "Bicycle", "Car", "Truck", "Drone", "Walking", "Scooter"];

/** A delivery way's name: the merchant's own title, else words from its kind. */
export function wayTitle(tr: any, shop: any): string {
  if (tr?.title) return tr.title;
  const raw = String(shop?.title || "");
  const name = raw.charAt(0).toUpperCase() + raw.slice(1);
  if (tr?.type === "Pickup") {
    const p = (tr.pickups || [])[0];
    return p?.name ? t("bakini.way.pickupAt", "Pickup at {place}", { place: p.name }) : t("bakini.way.pickup", "Pickup");
  }
  if (COURIER.includes(tr?.type)) return t("bakini.way.courier", "{shop} courier", { shop: name });
  if (tr?.type === "Global") return t("bakini.way.worldwide", "Worldwide shipping");
  if (tr?.type === "Post") return t("bakini.way.post", "Post");
  return t("bakini.way.delivery", "Delivery");
}

export function deliveryWays(shop: any): DeliveryWay[] {
  return (shop?.transportations || [])
    .filter((x: any) => x && x.enable !== false)
    .map((x: any) => {
      const free = !!x.free_shipping && !(Number(x.free_shipping_limit) > 0);
      return {
        id: x.id,
        type: x.type,
        title: wayTitle(x, shop),
        windows: Array.isArray(x.time_spans) ? x.time_spans : [],
        fee: free ? 0 : Number(x.const) || 0,
        freeOver: x.free_shipping && Number(x.free_shipping_limit) > 0 ? Number(x.free_shipping_limit) : null,
        free,
        distance: Number(x.distance) || 0,
        cod: !!x.cod,
        days: Array.isArray(x.days) ? x.days : [],
        pickups: Array.isArray(x.pickups) ? x.pickups : [],
        pickup: x.type === "Pickup",
      };
    });
}

/** "8:00–18:00" from the shop's own words (the pickup counter's note), else "". */
export function hoursFrom(text: string): string {
  const m = String(text || "").match(/(\d{1,2}[:.]\d{2})\s*(?:-|–|—|to)\s*(\d{1,2}[:.]\d{2})/i);
  return m ? `${m[1]}–${m[2]}` : "";
}

export interface ShopFacts {
  title: string;
  address: string;
  city: string;
  region: string;
  postal: string;
  country: string;
  phone: string;
  email: string;
  days: string[];
  everyDay: boolean;
  hours: string;
  location: { lat: number; lng: number } | null;
  ways: DeliveryWay[];
  courier: DeliveryWay | null;
  shipping: DeliveryWay | null;
  pickup: DeliveryWay | null;
  pickupPoint: any;
  pickupNote: string;
  gateway: { name: string; description: string; cod: boolean } | null;
  gateways: any[];
}

const WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export function shopFacts(shop: any): ShopFacts {
  const info = shop?.info || {};
  const ways = deliveryWays(shop);
  const pickup = ways.find((w) => w.pickup) || null;
  const point = pickup?.pickups?.[0] || null;
  const note = String(point?.message || "");
  const days: string[] = Array.isArray(info.days_open) ? info.days_open : [];
  const gws = (shop?.gateways || []).filter((g: any) => g && g.enable !== false);
  const g = gws[0] || null;
  return {
    title: shop?.title || "",
    address: info.address || (point ? [point.address, point.city].filter(Boolean).join(", ") : ""),
    city: info.locality || point?.city || "",
    region: info.region || point?.state || "",
    postal: info.postal_code || point?.postal || "",
    country: info.country || "",
    phone: info.phone || point?.phone || "",
    email: info.email || "",
    days: WEEK.filter((d) => days.includes(d)),
    everyDay: WEEK.every((d) => days.includes(d)),
    hours: hoursFrom(note) || hoursFrom(info.hours || ""),
    location: info.location?.lat ? info.location : point?.location?.lat ? point.location : null,
    ways,
    courier: ways.find((w) => COURIER.includes(w.type)) || null,
    shipping: ways.find((w) => w.type === "Global" || w.type === "Post") || null,
    pickup,
    pickupPoint: point,
    pickupNote: note,
    gateway: g ? { name: g.name || "", description: g.description || "", cod: !!(g.cod || g.type === "cod") } : null,
    gateways: gws,
  };
}

/* ━━━━━━━━━━━━ Layers ━━━━━━━━━━━━ */

export const layer = reactive({ open: "" as string, quick: null as any, product: null as any });
let opener: HTMLElement | null = null;
const MODAL = new Set(["drawer", "qv", "langsheet", "fsheet"]);

/** Open a layer by id; the button that opened it gets focus back on close. */
export function openLayer(id: string, btn?: HTMLElement | null): void {
  if (layer.open && layer.open !== id) closeLayer(true);
  layer.open = id;
  opener = btn || (document.activeElement as HTMLElement) || null;
  if (MODAL.has(id) || id === "pmenu") document.documentElement.style.overflow = "hidden";
}

export function closeLayer(silent = false): void {
  if (!layer.open) return;
  const was = layer.open;
  layer.open = "";
  document.documentElement.style.overflow = "";
  if (!silent && opener && opener.focus) {
    try {
      opener.focus({ preventScroll: true });
    } catch {
      /* gone */
    }
  }
  /* The language sheet came from the phone menu: back to the menu. */
  if (was === "langsheet" && window.innerWidth <= 760) {
    layer.open = "pmenu";
    document.documentElement.style.overflow = "hidden";
  }
}

export function toggleLayer(id: string, btn?: HTMLElement | null): void {
  if (layer.open === id) closeLayer();
  else openLayer(id, btn);
}

export function isModal(id: string): boolean {
  return MODAL.has(id);
}

/** The quick look dialog for a product. */
export function openQuick(p: any, btn?: HTMLElement | null): void {
  layer.quick = p;
  openLayer("qv", btn);
}

let wired = false;
/** Esc closes; a click outside an open menu closes it (once, app-wide). */
export function wireLayers(): void {
  if (wired || typeof document === "undefined") return;
  wired = true;
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && layer.open) {
      e.preventDefault();
      closeLayer();
    }
  });
  document.addEventListener(
    "click",
    (e) => {
      if (!layer.open || isModal(layer.open)) return;
      const tEl = e.target as HTMLElement;
      if (!tEl || !document.contains(tEl)) return;
      const el = document.getElementById(layer.open);
      if (el && el.contains(tEl)) return;
      if (tEl.closest(`[aria-controls="${layer.open}"]`)) return;
      closeLayer(true);
    },
    true,
  );
}

/** A route change closes whatever is open. */
export function closeOnRoute(router: any): void {
  router?.afterEach?.(() => {
    if (layer.open) closeLayer(true);
  });
}

/** Smooth unless the visitor asked for less motion. */
export function scrollBehavior(): ScrollBehavior {
  return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ? "auto" : "smooth";
}

export function fmtDate(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  try {
    return d.toLocaleDateString(document.documentElement.lang || "en", { day: "numeric", month: "long", year: "numeric" });
  } catch {
    return d.toDateString();
  }
}
