/*
 * Bakini Noir — what the product and compare pages share: the gallery's
 * photos, a unit counted in words, the delivery / pickup / payment lines
 * from the shop's own data, and the "Buy together" picks.
 */
import { bySells, noir, shopFacts, money } from "../noir";
import { t } from "../../../kalio/i18n/kalio-i18n";

declare const window: any;

/** The product's photos: the chosen variant's own first, then the main
    photo, then the gallery (Selldone's images, in their order; a photo
    made for another variant is left out). */
export function galleryOf(product: any, variant: any = null): { src: string; thumb: string; alt: string }[] {
  if (!product) return [];
  const out: { src: string; thumb: string; alt: string }[] = [];
  const seen = new Set<string>();
  const put = (path: string | null | undefined, alt = "") => {
    if (!path) return;
    const src = window.CDN.GET_SHOP_IMAGE_PATH(path);
    if (!src || seen.has(src)) return;
    seen.add(src);
    out.push({ src, thumb: window.CDN.GET_SHOP_IMAGE_PATH(path, 128) || src, alt: alt || product.title || "" });
  };
  if (variant?.image) put(variant.image);
  put(product.icon);
  const images = [...(product.images || [])].sort((a: any, b: any) => (a?.order ?? 0) - (b?.order ?? 0));
  for (const im of images) {
    if (!im?.path) continue;
    if (im.variant_id && (!variant || im.variant_id !== variant.id)) continue;
    put(im.path, im.alt);
  }
  return out;
}

/** "croissants" from "croissant" (English only; another language gets the
    number alone, see countLine). */
export function plural(unit: string, n: number): string {
  if (n === 1) return unit;
  if (/[^aeiou]y$/i.test(unit)) return unit.slice(0, -1) + "ies";
  if (/(s|x|z|ch|sh)$/i.test(unit)) return unit + "es";
  return unit + "s";
}

export function isEnglish(): boolean {
  return String(document.documentElement.lang || "en").toLowerCase().startsWith("en");
}

/** "Four" for 4 in English (the mockup's "Four good reasons."), else the digit. */
export function numberWord(n: number): string {
  const words = ["Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten"];
  return isEnglish() && n >= 0 && n <= 10 ? words[n] : String(n);
}

export interface DeliveryLine {
  key: string;
  icon: string;
  title: string;
  line: string;
}

/** The product page's lines (b/pages-product.js deliveryLines()): each of
    the shop's delivery ways with its price and windows, then the way to pay. */
export function deliveryLines(shop: any): DeliveryLine[] {
  const f = shopFacts(shop);
  const out: DeliveryLine[] = [];
  const priceWord = (fee: number, free: boolean) => (free || !fee ? t("bakini.n.pd.free", "free") : money(fee));
  for (const w of f.ways) {
    if (w.pickup) {
      out.push({
        key: "pickup-" + w.id,
        icon: "store",
        title: `${w.title} — ${priceWord(w.fee, w.free)}`,
        line: f.pickupNote || [f.pickupPoint?.address, f.hours].filter(Boolean).join(", "),
      });
    } else if (w.type === "Global" || w.type === "Post") {
      out.push({
        key: "ship-" + w.id,
        icon: "plane",
        title: `${w.title} — ${priceWord(w.fee, w.free)}`,
        line: w.freeOver ? t("bakini.n.pd.freeOver", "Free on orders over {amount}", { amount: money(w.freeOver, true) }) : "",
      });
    } else {
      const parts: string[] = [];
      if (w.distance) parts.push(t("bakini.n.pd.withinKm", "Within {km} km", { km: w.distance }));
      if (w.days.length >= 7) parts.push(t("bakini.n.pd.everyDay", "every day"));
      const lead = parts.join(", ");
      const windows = w.windows.join(", ");
      out.push({
        key: "way-" + w.id,
        icon: "bike",
        title: `${w.title} — ${priceWord(w.fee, w.free)}`,
        line: [lead ? lead.charAt(0).toUpperCase() + lead.slice(1) : "", windows].filter(Boolean).join(" · "),
      });
    }
  }
  if (f.gateway) out.push({ key: "pay", icon: "cash", title: f.gateway.name, line: f.gateway.description });
  return out;
}

/** "Buy together": the best seller (in stock) of the two best-selling other
    collections. */
export function togetherFor(product: any): any[] {
  if (!product) return [];
  const others = noir.cats.filter((c) => c.id !== product.category_id);
  const sales = (id: number) => noir.products.filter((p) => p.category_id === id).reduce((n, p) => n + (p.sells || 0), 0);
  const cats = [...others].sort((a, b) => sales(b.id) - sales(a.id));
  const out: any[] = [];
  for (const c of cats) {
    const pick = bySells(noir.products.filter((p) => p.category_id === c.id && p.quantity > 0 && !(p.variants && p.variants.length)))[0];
    if (pick) out.push(pick);
    if (out.length === 2) break;
  }
  return out;
}
