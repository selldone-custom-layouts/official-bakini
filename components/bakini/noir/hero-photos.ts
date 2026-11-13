/*
 * Bakini Noir — the collection photos of the home's carousel (bakio-design/hero/CODEX-PROMPTS.md).
 *
 * One portrait photo (4:5, served at 900×1125) per collection, matched by the collection's own
 * `name` (its address slug): assets/bakini/hero-<name>.webp. The only shop-specific files in the
 * Layout; a collection without a photo gets a collage of its own best sellers instead, so a new
 * collection or a cloned shop never shows an empty card. import.meta.glob lists only the files
 * that exist at build time.
 */
const FILES = import.meta.glob("../../../assets/bakini/hero-*.webp", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;

const BY_NAME = new Map<string, string>(
  Object.entries(FILES).map(([path, url]) => [path.split("/").pop()!.replace(/^hero-/, "").replace(/\.\w+$/, ""), url]),
);

/** The collection's carousel photo, or null (then its collage stands in). */
export function heroPhotoOf(category: any): string | null {
  const slug = category?.name;
  return (slug && BY_NAME.get(String(slug))) || null;
}
