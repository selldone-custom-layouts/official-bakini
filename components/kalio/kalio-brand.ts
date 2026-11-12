/* ━━━━━━━━━━━━ The Layout's own name and mark ━━━━━━━━━━━━
   Bakini Noir draws the shop's own live title (Bakio: "bakio") as its
   wordmark (components/bakini/BakiniLogo.vue), so the Layout works when it is
   cloned into another bakery: nothing about the shop is written here.
   `name: null` keeps the shop's title; a string would replace it everywhere
   the storefront names the shop (header, footer, page titles), as Medio and
   Walio did on a shared shop.

   The mark (the browser tab's icon, the avatar on order messages and the
   compare page's share card) is drawn from the same title: its first letter
   in an italic serif, ivory on the Noir stage, with the gold dot of the
   wordmark. It is an inline SVG, so no image file is needed. */

export const BRAND: { name: string | null; mark: string } = {
  name: null,
  mark: markFor(""),
};

/** The mark as an SVG data URL: the title's first letter on the Noir stage. */
export function markFor(title: string): string {
  const letter = (String(title || "").trim().charAt(0) || "·").toLowerCase();
  const esc = letter.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string);
  const svg =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">' +
    '<rect width="64" height="64" rx="16" fill="#120c10"/>' +
    '<text x="29" y="45" text-anchor="middle" font-family="Instrument Serif, Iowan Old Style, Georgia, serif" font-style="italic" font-size="44" fill="#f4ede6">' +
    esc +
    "</text>" +
    '<circle cx="47" cy="42" r="4" fill="#d4a373"/>' +
    "</svg>";
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}

/** Put the Layout's name (if any) on the shop record, and draw the mark from its title. */
export function applyBrand(shop: any): void {
  if (shop && BRAND.name && shop.title && shop.title !== BRAND.name) {
    renameTab(shop.title);
    shop.title = BRAND.name;
  }
  if (shop?.title) BRAND.mark = markFor(shop.title);
  brandIcon();
  bagWords();
}

/** The first page keeps the head the server wrote; later pages build their
    titles from the renamed shop. Put the Layout's name in the tab. */
function renameTab(original: string): void {
  if (typeof document === "undefined" || !document.title.includes(original)) return;
  document.title = document.title.split(original).join(BRAND.name as string);
}

/** The tab's icon (and the home-screen icon) is the Layout's mark. */
export function brandIcon(): void {
  if (typeof document === "undefined") return;
  for (const rel of ["icon", "apple-touch-icon"]) {
    let link = document.head.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement("link");
      link.rel = rel;
      document.head.appendChild(link);
    }
    if (link.href !== BRAND.mark) {
      link.href = BRAND.mark;
      if (rel === "icon") link.type = "image/svg+xml";
    }
  }
}

/* ━━━━━━━━━━━━ One word for the basket: "bag" ━━━━━━━━━━━━
   Bakini says "bag" everywhere ("Add to bag", "Your bag"), its own words
   (t() in components/kalio/i18n) and Selldone's own English strings: the buy
   button, the basket page and menu, the remove dialogs, the share-order
   dialog and the "others have this" line. Merged once, in English only;
   another language keeps Selldone's own words in that language. */
let wordsMerged = false;
export function bagWords(): void {
  if (wordsMerged || typeof window === "undefined") return;
  const i18n = (window as any).$i18n_global;
  const locale = i18n?.locale?.value ?? i18n?.locale;
  if (!i18n?.mergeLocaleMessage || !String(locale).startsWith("en")) return;
  const remove = { title: "Remove from your bag", message: "Do you want to remove this item from your bag?" };
  i18n.mergeLocaleMessage(locale, {
    buy_button: { quantity_in_basket: "In your bag", add_to_basket: "Add to bag" },
    layout_shop: {
      shop_menu: { basket: "Your bag" },
      item_in_basket_message: "{count} of this item are in your bag.",
    },
    basket_top_menu: { basket: "Bag", basket_is_empty: "Your bag is empty.", view_basket: "Your bag" },
    basket_page: { title: "Your bag", basket_empty: "Your bag is empty" },
    avocado: { delete_item_dialog: remove },
    hyper: { delete_item_dialog: remove },
    share_order: {
      message:
        "It's a secure link, only share it with those you know. Everybody with this link can duplicate your order and see the selected address. It will contain the items in your bag.",
      address_included: "Share bag items + address",
      address_excluded: "Share only bag items",
    },
    /* Selldone's shared words (lang/en.ts puts them under "global"). */
    global: {
      commons: { add_to_carts: "Add to bags", cart: "Bag", cart_list: "Bag", new_carts: "New bags", carts: "Bags", in_cart: "In your bag" },
      actions: { add_to_cart: "Add to bag" },
      basket_item_message: {
        product_inputs_preview_message:
          "These customization options are available for your ordered product. Once the item is in your bag, you will be able to make adjustments here.",
      },
      product_section_incentivise: { have_in_their_bag: "<b>{in_carts}</b> others have this in their bags!" },
      /* Selldone's countdown (only with a real dis_end): days, hrs, min, sec. */
      count_down: { days: "days", hours: "hrs", minutes: "min", seconds: "sec" },
    },
  });
  wordsMerged = true;
}
