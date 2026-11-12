/*
 * Bakini Noir — what the content pages share (journal, article, About,
 * Terms, Privacy, Contact, FAQ, 404): the shop's own page texts (Selldone's
 * shop profiles), and the sample copy that stands in while the shop has not
 * written a page, built only from the shop's live facts (shopFacts(): its
 * address, open days, counter hours, collections, delivery ways and windows,
 * the way to pay). No invented history, awards, names, counts or reviews.
 * Every sample is shown with the label "Sample text — the shop has not
 * written this page yet" (NxSampleTag.vue).
 */
import { shopFacts, type ShopFacts } from "../noir";
import { t } from "../../../kalio/i18n/kalio-i18n";

declare const window: any;

/** A page's plain text, for "has the shop written it?". */
export function plainText(html: string | null | undefined): string {
  return String(html || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** The shop's own page: "about-us", "terms", "privacy", "contact-us"; null when none. */
export function shopProfile(name: string, kind: string): Promise<any | null> {
  return window.axios
    .get(window.XAPI.GET_SHOP_PROFILE(name, kind))
    .then(({ data }: any) => (data?.error ? null : data?.profile || null))
    .catch(() => null);
}

/** Text that is the shop's own (not Selldone's default "It's my awesome … website"). */
export function ownText(html: string | null | undefined): boolean {
  const text = plainText(html);
  return text.length > 20 && !/my awesome .* website/i.test(text);
}

const list = (items: string[], type: "conjunction" | "disjunction" = "conjunction"): string => {
  try {
    return new Intl.ListFormat(document.documentElement.lang || "en", { style: "long", type }).format(items);
  } catch {
    return items.join(", ");
  }
};
export { list as listWords };

/** "US dollars", in the visitor's language. */
export function currencyWords(code: string): string {
  try {
    const part = new Intl.NumberFormat(document.documentElement.lang || "en", { style: "currency", currency: code, currencyDisplay: "name" })
      .formatToParts(2)
      .find((x) => x.type === "currency");
    return part?.value || code;
  } catch {
    return code;
  }
}

/** The shop's name as a name ("Bakio"). */
export function shopName(shop: any): string {
  const n = String(shop?.title || "");
  return n.charAt(0).toUpperCase() + n.slice(1);
}

/** "1 The Embarcadero, San Francisco". */
export function shortAddress(f: ShopFacts): string {
  const street = f.pickupPoint?.address || String(f.address || "").split(",")[0];
  return [street, f.city].filter(Boolean).join(", ");
}

/** "1 The Embarcadero". */
export function streetOf(f: ShopFacts): string {
  return f.pickupPoint?.address || String(f.address || "").split(",")[0] || "";
}

/** "San Francisco, CA 94111". */
export function cityLine(f: ShopFacts): string {
  const US: Record<string, string> = { California: "CA", "New York": "NY", Texas: "TX", Washington: "WA", Illinois: "IL", Florida: "FL" };
  const region = f.region ? US[f.region] || f.region : "";
  return [f.city, [region, f.postal].filter(Boolean).join(" ")].filter(Boolean).join(", ");
}

/** "Open every day · 8:00–18:00" (or the days). */
export function openLine(f: ShopFacts): string {
  if (!f.days.length && !f.hours) return "";
  const days = f.everyDay ? t("bakini.n.rd.openEvery", "Open every day") : f.days.map((d) => d.slice(0, 3)).join(", ");
  return f.hours ? `${days} · ${f.hours}` : days;
}

/** How each delivery way reaches the buyer, in one sentence each. */
export function waySentences(f: ShopFacts, money: (n: number) => string): string[] {
  const out: string[] = [];
  const c = f.courier;
  if (c) {
    const near = c.distance ? t("bakini.n.rd.within", " within {km} km of the bakery", { km: c.distance }) : "";
    const win = c.windows.length ? t("bakini.n.rd.inWindow", " in the window you choose: {windows}", { windows: list(c.windows) }) : "";
    out.push(t("bakini.n.rd.courierSays", "The {name} delivers{near}{win}.", { name: c.title, near, win }));
  }
  const s = f.shipping;
  if (s) {
    const fee = s.fee ? t("bakini.n.rd.costs", "costs {fee}", { fee: money(s.fee) }) : t("bakini.n.rd.isFree", "is free");
    const free = s.freeOver ? t("bakini.n.rd.freeOver", " and is free on orders over {amount}", { amount: money(s.freeOver) }) : "";
    out.push(t("bakini.n.rd.shippingSays", "{name} {fee}{free}.", { name: s.title, fee, free }));
  }
  const p = f.pickup;
  if (p) {
    const at = f.pickupPoint?.address ? t("bakini.n.rd.pickupAtPlace", " at {place}", { place: f.pickupPoint.address }) : "";
    const hrs = f.hours ? `, ${f.hours}` : "";
    out.push(p.fee ? t("bakini.n.rd.pickupPaid", "Pickup{at}{hrs}.", { at, hrs }) : t("bakini.n.rd.pickupFree", "Pickup is free{at}{hrs}.", { at, hrs }));
  }
  return out;
}

/** How a buyer pays, in one sentence. */
export function paySentence(f: ShopFacts): string {
  const g = f.gateway;
  if (!g) return t("bakini.n.rd.payNone", "The ways to pay are shown at checkout.");
  if (g.cod) return t("bakini.n.rd.payCod", "Orders are paid by cash on delivery: you pay the courier when the order arrives. No card is charged online.");
  return t("bakini.n.rd.payWay", "Orders are paid with {name}, at checkout.", { name: g.name });
}

export interface Section {
  title: string;
  text: string;
  icon?: string;
}

/** Sample terms, numbered (Terms of use). */
export function sampleTerms(shop: any, f: ShopFacts, money: (n: number) => string, currency: string): Section[] {
  const name = shopName(shop);
  const contact = [name, f.address, f.phone, f.email].filter(Boolean).join(" · ");
  const ways = waySentences(f, money);
  return [
    { title: t("bakini.n.rd.tUseT", "Using this site"), text: t("bakini.n.rd.tUse", "These sample terms describe how the {shop} online shop works. By placing an order you agree to them. They will be replaced by the shop's own terms.", { shop: name }) },
    { title: t("bakini.n.rd.tOrdersT", "Orders"), text: t("bakini.n.rd.tOrders", "An order is a request to buy individual pastries at the prices shown at checkout. The bakery confirms each order on the order page. If a pastry is no longer available, the bakery contacts you before preparing the order.") },
    { title: t("bakini.n.rd.tPricesT", "Prices"), text: t("bakini.n.rd.tPrices", "Prices are in {currency} and include any saving shown on the product. The total you pay is the price of the items, less any saving, plus the delivery fee of the method you choose.", { currency: currencyWords(currency) }) },
    ...(ways.length ? [{ title: t("bakini.n.rd.tDeliveryT", "Delivery and pickup"), text: ways.join(" ") }] : []),
    { title: t("bakini.n.rd.tPayT", "Payment"), text: paySentence(f) },
    { title: t("bakini.n.rd.tFreshT", "Freshness and allergens"), text: t("bakini.n.rd.tFresh", "Pastries are fresh products. Ingredients and allergen information are available from the bakery on request; contact {shop} before ordering if you have a dietary requirement.", { shop: name }) },
    { title: t("bakini.n.rd.tCancelT", "Cancellations"), text: t("bakini.n.rd.tCancel", "To change or cancel an order, write to the bakery from your order page or by email as early as possible, before the order is prepared.") },
    ...(contact ? [{ title: t("bakini.n.rd.tContactT", "Contact"), text: contact + "." }] : []),
  ];
}

/** Sample privacy notice: the sections, each with an icon. */
export function samplePrivacy(f: ShopFacts): Section[] {
  const ask = f.email ? t("bakini.n.rd.pChoicesMail", " by writing to {email}", { email: f.email }) : "";
  return [
    { icon: "doc", title: t("bakini.n.rd.pWhatT", "What we collect"), text: t("bakini.n.rd.pWhat", "When you order: your email, phone, the receiver's name and the delivery address you enter or set on the map, and any note you add. If you sign in, your account email.") },
    { icon: "box", title: t("bakini.n.rd.pWhyT", "Why we use it"), text: t("bakini.n.rd.pWhy", "To prepare, deliver and confirm your order, to contact you about it, and to keep your saved addresses if you have an account.") },
    { icon: "user", title: t("bakini.n.rd.pWhoT", "Who sees it"), text: t("bakini.n.rd.pWho", "The bakery and the courier who delivers your order. Your details are not sold.") },
    { icon: "clock", title: t("bakini.n.rd.pKeepT", "How long we keep it"), text: t("bakini.n.rd.pKeep", "Order records are kept as long as needed for the order and for the bakery's records. You can ask for your account details to be removed.") },
    { icon: "grid", title: t("bakini.n.rd.pCookiesT", "Cookies and storage"), text: t("bakini.n.rd.pCookies", "The shop remembers your bag and your colour theme in your own browser so they are there when you come back.") },
    { icon: "shield", title: t("bakini.n.rd.pChoicesT", "Your choices"), text: t("bakini.n.rd.pChoices", "You can check out as a guest, ask what details the bakery holds about you, and ask for them to be corrected or deleted{ask}.", { ask }) },
  ];
}

export interface Faq {
  group: string;
  q: string;
  a: string;
}

/** Sample questions (labelled sample), from the shop's facts. */
export function sampleFaq(shop: any, f: ShopFacts, money: (n: number) => string, guest: boolean): Faq[] {
  const G = {
    order: t("bakini.n.rd.gOrdering", "Ordering"),
    deliver: t("bakini.n.rd.gDelivery", "Delivery & pickup"),
    pay: t("bakini.n.rd.gPayment", "Payment"),
    allergen: t("bakini.n.rd.gAllergens", "Allergens"),
  };
  const reach = [f.phone, f.email].filter(Boolean).join(t("bakini.n.rd.or", " or "));
  const out: Faq[] = [
    { group: G.order, q: t("bakini.n.rd.fq1", "Can I order a single pastry?"), a: t("bakini.n.rd.fa1", "Yes. Every pastry is sold individually, so you add exactly the pieces you want.") },
    { group: G.order, q: t("bakini.n.rd.fq2", "How do I order several of the same pastry?"), a: t("bakini.n.rd.fa2", "Tap + on the pastry; it turns into a − n + counter. Each tap adds one more piece, up to the number the bakery has in stock.") },
  ];
  if (guest) out.push({ group: G.order, q: t("bakini.n.rd.fq3", "Do I need an account?"), a: t("bakini.n.rd.fa3", "No. Checkout works as a guest. An account only keeps your addresses and past orders together.") });
  if (f.courier) {
    const c = f.courier;
    const win = c.windows.length ? t("bakini.n.rd.fWin", " Choose a {windows} window at checkout.", { windows: list(c.windows, "disjunction") }) : "";
    const near = c.distance ? t("bakini.n.rd.within", " within {km} km of the bakery", { km: c.distance }) : "";
    const fee = c.fee ? "" : t("bakini.n.rd.fFree", " Courier delivery is free.");
    out.push({ group: G.deliver, q: t("bakini.n.rd.fq4", "When can the courier deliver?"), a: t("bakini.n.rd.fa4", "The {name} delivers{near}{days}.{win}{fee}", { name: c.title, near, days: c.days.length >= 7 ? t("bakini.n.rd.everyDayComma", ", every day") : "", win, fee }) });
  }
  if (f.shipping) {
    const s = f.shipping;
    const fee = s.fee ? t("bakini.n.rd.fCosts", " It costs {fee}", { fee: money(s.fee) }) : t("bakini.n.rd.fNoFee", " It is free");
    const free = s.freeOver ? t("bakini.n.rd.fFreeOver", " and is free on orders over {amount}", { amount: money(s.freeOver) }) : "";
    out.push({ group: G.deliver, q: t("bakini.n.rd.fq5", "Do you ship further away?"), a: t("bakini.n.rd.fa5", "Yes, with {name}.{fee}{free}. Pastries are delicate, so consider the distance.", { name: s.title.toLowerCase(), fee, free }) });
  }
  if (f.pickup) {
    const where = [f.pickupNote || "", f.address ? t("bakini.n.rd.fAt", "The counter is at {address}.", { address: f.address }) : ""].filter(Boolean).join(" ");
    out.push({ group: G.deliver, q: t("bakini.n.rd.fq6", "Where do I pick up my order?"), a: (where + " " + (f.pickup.fee ? "" : t("bakini.n.rd.fPickupFree", "Pickup is free."))).trim() });
  }
  out.push({ group: G.pay, q: t("bakini.n.rd.fq7", "How do I pay?"), a: paySentence(f) });
  out.push({ group: G.pay, q: t("bakini.n.rd.fq8", "Are the savings already in the price?"), a: t("bakini.n.rd.fa8", "Yes. Every price on the site already includes the current saving, and the receipt shows the full price, the saving and the total.") });
  out.push({
    group: G.allergen,
    q: t("bakini.n.rd.fq9", "Do your pastries contain allergens?"),
    a: reach
      ? t("bakini.n.rd.fa9", "Allergen information is not yet verified on the site, and no pastry is claimed to be allergen-free. Please contact the bakery before ordering: {reach}.", { reach })
      : t("bakini.n.rd.fa9b", "Allergen information is not yet verified on the site, and no pastry is claimed to be allergen-free. Please contact the bakery before ordering."),
  });
  out.push({ group: G.allergen, q: t("bakini.n.rd.fq10", "Where can I see the ingredients?"), a: t("bakini.n.rd.fa10", "Ask the bakery for the verified ingredient list of the pastry you are interested in before you order.") });
  return out;
}

/** Whether the shop lets a buyer check out without an account. */
export function guestCheckout(shop: any): boolean {
  const opt = (shop?.options || []).find((o: any) => o?.code === "checkout");
  return opt?.value?.mode === "login-free";
}

export function facts(shop: any): ShopFacts {
  return shopFacts(shop);
}
