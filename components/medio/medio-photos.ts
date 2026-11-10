/*
 * Medio — the photo slots (the one registry).
 *
 * Every lifestyle photo slot on Medio's pages that is not a category's own
 * photo (those are assets/medio/<shape>-<category slug>.webp, the owner's
 * textless category photos, see medio.ts photoOf) is listed here: slot →
 * file name, its size and where it shows.
 *
 * A slot uses assets/photos/<file> when that file exists at build time
 * (import.meta.glob lists only the files that are there). Until then it
 * draws a calm tinted placeholder of the same shape with a photo icon and
 * the file's name in it (MedioSlot.vue), so the page still looks
 * intentional and the owner can see which file goes where. To add the
 * photos: put the WebP files in assets/photos/, build and release. No code
 * change. The prompts that make them are in digini-design/codex-photos-medio.md.
 *
 * One kind of slot follows the shop's live data and so takes a name part:
 *  - choose-<tag>.webp: one per product tag in a category hub's "Can't
 *    decide?" chooser (wireless, portable, 4k, gaming today, reused from
 *    Argon's Codex set; a new tag looks for its own file and shows a
 *    placeholder until it is there).
 */

const FILES = import.meta.glob("../../assets/photos/*.webp", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;

const BY_FILE = new Map<string, string>(Object.entries(FILES).map(([path, url]) => [path.split("/").pop()!, url]));

export interface Slot {
  /** The file name in assets/photos/. */
  file: string;
  /** width / height of the slot (and of the photo to make). */
  ratio: number;
  /** Where it shows, for people. */
  where: string;
}

/** The fixed slots. */
export const SLOTS: Record<string, Slot> = {
  "hero-main": { file: "hero-main.webp", ratio: 5 / 2, where: "Home: the big hero banner (2400×960)" },
  "why-deals": { file: "why-deals.webp", ratio: 1, where: "Home: Why shop with Medio, real deal end dates (800×800)" },
  "why-compare": { file: "why-compare.webp", ratio: 1, where: "Home: Why shop with Medio, compare (800×800)" },
  "why-track": { file: "why-track.webp", ratio: 1, where: "Home: Why shop with Medio, track every order (800×800)" },
  "why-returns": { file: "why-returns.webp", ratio: 1, where: "Home: Why shop with Medio, returns (800×800)" },
  "why-help": { file: "why-help.webp", ratio: 1, where: "Home: Why shop with Medio, help and support (800×800)" },
  "why-secure": { file: "why-secure.webp", ratio: 1, where: "Home: Why shop with Medio, secure checkout (800×800)" },
  "help-hero": { file: "help-hero.webp", ratio: 15 / 4, where: "Help & Support (FAQ): the banner (2400×640)" },
  "about-hero": { file: "about-hero.webp", ratio: 8 / 3, where: "About us: the banner (2400×900)" },
  notfound: { file: "notfound.webp", ratio: 4 / 3, where: "404 page: the picture (1200×900)" },
};

/** A slot name made from live data ("4K" → "4k"). */
export function slug(text: string): string {
  return String(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** A tag's "Can't decide?" slot. */
export function chooseSlot(tag: string): Slot {
  return { file: `choose-${slug(tag)}.webp`, ratio: 3 / 2, where: `Category hub: Can't decide?, ${tag} (1200×800)` };
}

/** The photo's address when the file is in the build, else null (placeholder). */
export function slotSrc(slot: Slot | null | undefined): string | null {
  return (slot && BY_FILE.get(slot.file)) || null;
}
