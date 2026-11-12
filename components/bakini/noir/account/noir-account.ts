/*
 * Bakini Noir — what the account desk's B markup reads (account-b.html):
 * the mockup's four steps over Selldone's five delivery states, and the
 * one-line summary of an order ("Bakio courier · Morning · $14.89 on
 * delivery"). The data is Kalio's (components/kalio/account/kalio-account.ts).
 */
import { t } from "../../../kalio/i18n/kalio-i18n";
import { money } from "../../../region-switcher/region";
import { wayWindowLine } from "../buy/noir-cart";

/** Placed · Baking · On the way · Delivered (Selldone: CheckQueue and
    OrderConfirm, PreparingOrder, SentOrder, ToCustomer). */
export function noirSteps(): { key: string; label: string; icon: string; codes: string[] }[] {
  return [
    { key: "placed", label: t("bakini.n.ord.stPlaced", "Placed"), icon: "check", codes: ["CheckQueue", "OrderConfirm"] },
    { key: "baking", label: t("bakini.n.ord.stBaking", "Baking"), icon: "oven", codes: ["PreparingOrder"] },
    { key: "way", label: t("bakini.n.ord.stWay", "On the way"), icon: "bike", codes: ["SentOrder"] },
    { key: "done", label: t("bakini.n.ord.stDone", "Delivered"), icon: "home", codes: ["ToCustomer"] },
  ];
}

export function noirStepAt(state: string): number {
  const at = noirSteps().findIndex((s) => s.codes.includes(state));
  return at < 0 ? 0 : at;
}

/** A step's class and icon in the timeline (the last one done is "done"). */
export function noirStepClass(i: number, at: number, last: number): string {
  if (i < at || (i === at && i === last)) return "done";
  return i === at ? "cur" : "";
}

/** "Bakio courier · Morning · $14.89 on delivery", from what is known. */
export function orderLine(shop: any, order: any, full: any): string {
  const parts: string[] = [];
  const way = wayWindowLine(shop, full?.delivery_info || order?.delivery_info);
  if (way) parts.push(way);
  const amount = money(Number(order?.price) || 0, order?.currency);
  if (order?.status === "COD") parts.push(t("bakini.n.acc.onDelivery", "{amount} on delivery", { amount }));
  else if (order?.status === "Payed") parts.push(t("bakini.n.acc.paid", "{amount} paid", { amount }));
  else if (order?.status === "Reserved") parts.push(t("bakini.n.acc.toPay", "{amount} to pay", { amount }));
  else if (order?.status === "Canceled") parts.push(t("bakini.n.acc.cancelled", "Cancelled"));
  else parts.push(amount);
  return parts.join(" · ");
}

/** "12 November 2026", in the page's language. */
export function longDate(at: string): string {
  if (!at) return "";
  return new Date(at).toLocaleDateString(document.documentElement.lang || "en", { day: "numeric", month: "long", year: "numeric" });
}
