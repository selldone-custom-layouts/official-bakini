/*
 * Medio's messages. English is the source and ships in the bundle; every
 * other language is a file beside it with the same keys (ar.ts, da.ts,
 * hi.ts…), fetched only when a visitor picks that language (kalio-i18n.ts
 * bootI18n). Add a language here when the owner enables it in the shop
 * (Selldone: Shop > Settings > Languages); a missing key falls back to the
 * English written at the call site: t("medio.home.shopDeals", "Shop deals").
 */
import { en } from "./en";

export const MEDIO_MESSAGES: Record<string, Record<string, string>> = { en };

/** Languages loaded on demand ({ ar: () => import("./ar") }). */
export const MEDIO_LANGUAGES: Record<string, () => Promise<any>> = {};
