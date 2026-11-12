/*
 * Bakini's words, per language: the shared Kalio base (base/<lang>.ts, a copy
 * of new-shop-kits/i18n/kalio-base) plus Bakini's own (bakini.<lang>.ts).
 * English is bundled; every other language is its own small chunk, fetched
 * only when a visitor picks it (lang-<code>.ts merges its two files).
 * Bakio sells in English only. Arabic is kept so a right-to-left language
 * works the day a shop enables one (and the kit's checks run with a forced
 * "ar"). A language the owner enables later: copy base/<code>.ts from the
 * kit, write bakini.<code>.ts, add lang-<code>.ts and one line below.
 */
import baseEn from "./base/en";
import bakiniEn from "./bakini.en";

export const EN: Record<string, string> = { ...baseEn, ...bakiniEn };

export const LOADERS: Record<string, () => Promise<any>> = {
  ar: () => import("./lang-ar"),
};
