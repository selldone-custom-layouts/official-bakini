/*
 * Bakini — the photo slots (the one registry).
 *
 * Bakio has no lifestyle photos, and the Noir pages are complete without
 * them: every picture is a product cut-out on a dark plate. A merchant who
 * has photos may add them: a slot uses assets/photos/<file> when that file
 * exists at build time (import.meta.glob lists only the files that are
 * there); until then the slot draws nothing (BakiniSlot.vue). To add the
 * photos: put the WebP files in assets/photos/, build and release. No code
 * change.
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
  "about-hero": { file: "about-hero.webp", ratio: 8 / 3, where: "About us: the banner (2400×900)" },
  "help-hero": { file: "help-hero.webp", ratio: 15 / 4, where: "FAQ: the banner (2400×640)" },
  notfound: { file: "notfound.webp", ratio: 4 / 3, where: "404 page: the picture (1200×900)" },
};

/** The photo's address when the file is in the build, else null (nothing drawn). */
export function slotSrc(slot: Slot | null | undefined): string | null {
  return (slot && BY_FILE.get(slot.file)) || null;
}
