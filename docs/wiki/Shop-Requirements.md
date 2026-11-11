# Shop Requirements

The Layout reads everything from your shop. Nothing about Digini is hard-coded. Here is what your shop's data needs so that each part looks as it does on [medio.selldone.shop](https://medio.selldone.shop). A section with no data folds away; it never shows an empty box.

## Settings (yours to choose)

| Setting | What to set | What the Layout does |
| --- | --- | --- |
| **OAuth client id** | Set it up for your shop first | Sign in opens your shop's own sign-in. Without it, Sign in leaves for Selldone and shows an error. |
| **Business model** | A normal shop | Medio shows no seller names, seller pages or seller sections. |
| **Guest checkout** | Your choice | When guests may buy, "Add to basket" works signed out; otherwise it asks the shopper to sign in first, as Selldone's own button does. |
| **Payment methods** | At least one, for your currency | Without one, the basket says the shop is not taking payments yet, and Pay does not open an empty window. |
| **Shipping methods / pickup points** | What you offer | The product page's Delivery and returns card lists them; "Delivery method" in the basket appears only when there is a choice. |
| **Login modes** | Your choice | The sign-in window follows them. |
| **Currency, country, language** | Your market | Prices, the address form, and the language and currency pill in the header (the phone menu's last row). Medio's own words are translated into English, Arabic, Hindi and Danish; another language needs one file (see [Customize](Customize#languages)). |
| **Home of the domain** | The shop page | The designed home is the shop page. A Page Builder page set as Home replaces it on `/`. |

## Categories

- Each **top-level category** is a round tile in the home's "Shop deals" row (its top deal's packshot, "Up to $X off" or "From $X"), an entry in the header's "Shop All" panel and the phone menu, a round tile on every category hub and the 404, and its own results page with a hub on top.
- Give each one an **icon**: a product cut-out (packshot) on a transparent ground. It sits in the "Shop All" panel and the phone menu.
- Order them in Selldone; the Layout keeps your order.
- **Promo tiles** (one tall, four square, two wide) show from seven categories with products on, the biggest saving first.
- **Photos (optional):** `portrait-`, `square-` or `wide-<slug>.webp` in `assets/medio/` for the promo tiles (see [Customize](Customize#photos)). Without a photo a tile shows a collage of the category's own products.

## Products

- A square **photo** on white; more photos for the gallery.
- A **brand**. It makes the Brand filter, "The latest from <brand>" (the brand with the most products, its three newest in stock), "Deals from our top brands" and the brands on each hub.
- **Variants:** colour variants show as swatches on the card and as named tiles on the product page; capacity, size or pack variants as chips with their own price, and the card says "From $X" and "Choose options". A variant photo replaces the main photo when that variant is picked.
- A **product code** (SKU) shows on the product page.
- **Specs** (flat, below) give the list row's six bullets and the product page's key-spec grid.
- A **discount** makes the Deal badge, the magenta "Save $X" and "Was $Y", and puts the product in the hero, the dark "Deals" cards, "Discover our amazing offers", the Deals panel and each hub's Top deals.
- **Discount dates:** a deal with an end date gets a clock on the card, the dark deal cards and the product page, counting to that date. The header strip, the home's campaign strip and each hub's strip name the earliest real end date of the running deals. With no end dates they name the saving only. No date is ever invented.

## Specs and filters

The results page's Filters panel (and its phone sheet) comes from **product specs** and the category's **filter list**:

- Write specs **flat**: `{"Group": "group", "Key": ["value"]}` with `spec_order`. Nested specs are ignored by Selldone.
- After changing specs, save the category's filter list again (its values are frozen when saved).
- Sort by, Hide out of stock, Deals, Price, Brand and Colour come for free.
- The product page's Specifications card shows the same specs in your groups.

## Tags (merchandising)

Tags are found from your products, never named in code. A tag with no products shows nothing; a new tag on any product shows up without a code change.

- `best-seller` → the Best seller badge and the home's "Best sellers" tab.
- `new-arrival` → the New badge and the home's "Just arrived" tab (else the newest products).
- **Any other tag** → a tab in the home's "Popular picks" (the six most used), a link in each hub's "Popular links", and a choice in each hub's "Can't decide?" (with its own photo slot, `choose-<tag>.webp`; see [Customize](Customize#photos)).

## Content

- **Blog posts:** the four newest show as "Guides & inspiration", last on the home, and as "Buying guides" on each hub.
- **About us, Terms, Privacy, Contact us** profiles. Until you write them, sample text shows under a clear "Sample text" note.
- **FAQ** entries: the Help & Support page (the header's Help, the footer's Help & support), with topic tiles from the FAQ's tags.
- **Social links:** shown in the footer's legal row.

## Checklist

- [ ] The shop's OAuth client id is set up
- [ ] Categories have icons (packshots)
- [ ] Products have photos, brands, SKUs and variants
- [ ] Some products have discounts, with end dates where the deal really ends
- [ ] Specs are flat and categories' filter lists are saved
- [ ] At least one payment method and one shipping method
- [ ] Tags for best sellers and new arrivals, and any others you want as Popular picks
- [ ] The domain's Home is the shop page
