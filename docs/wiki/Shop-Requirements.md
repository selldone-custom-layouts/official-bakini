# Shop Requirements

The Layout reads everything from your shop. Nothing about Bakio is hard-coded. Here is what your shop's data needs so that each part looks as it does on [bakini.selldone.shop](https://bakini.selldone.shop). A section with no data folds away; it never shows an empty box, and no fact is invented to fill one.

## Settings (yours to choose)

| Setting | What to set | What the Layout does |
| --- | --- | --- |
| **OAuth client id** | Set it up for your shop first | Sign-in uses your shop's own sign-in. Without it, sign-in leaves for Selldone and shows an error. |
| **Business model** | A normal shop with one seller | Bakini is made for one bakery. |
| **Shop title** | The name you want read | It is drawn as the wordmark, the tab icon's letter and the page titles. |
| **Guest checkout** | Your choice | When guests may buy, the sign-in sheet offers "Continue as guest"; otherwise the shopper signs in first. |
| **Payment methods** | At least one, for your currency (cash on delivery is fine) | The bento, the product page and the footer name it. Without one, the checkout says "This shop is not taking payment right now" instead of showing Pay. |
| **Delivery ways** (transportations) | What you offer, each with a title, a fixed fee, a free-shipping threshold if you have one, and **time windows** | The home's bento, the product page's delivery lines, the bag and the checkout's delivery cards. A way without a title gets words from its kind ("<Shop> courier", "Worldwide shipping", "By post", "Pickup"). The windows (`time_spans`) are the choices at checkout. |
| **Pickup point** | If you have a counter: a pickup point with a note that holds the hours, e.g. "Open daily, 8:00-18:00" | The counter hours are read from that note (a time range like `8:00-18:00`, `8:00–18:00` or `8:00 to 18:00`). They show in the stage's line, the bento, the story, Visit & pickup, Contact and the footer. With no hours in the note, the hours are left out. |
| **Checkout map** | On or off | On: the address sheet has a map and a pin. Off: it is a short form with search. |
| **Login modes** | Your choice | The sign-in sheet shows your shop's own ways in (social logins as you switch them on, an email code, phone). |
| **Currency, country, language** | Your market | Prices, the address form, and the language and currency pill in the header (the phone menu's "Language & currency" row). The pill shows even with one currency and one language. Bakini's own words are in English and Arabic; another language needs one file (see [Customize](Customize#languages)). |
| **Home of the domain** | The shop page | The designed home is the shop page. A Page Builder page set as Home replaces it on `/`. |

## Shop info

The facts on the home, the footer, Contact and the sample pages come from the shop's own info (Selldone dashboard, the shop's contact information):

- **Address**, city, region and postal code: the stage's eyebrow, the story, Visit & pickup, Contact, the footer ("A counter at <address>.").
- **Location** (the pin on the map): the real map on Visit & pickup and Contact, dark in dark mode. Without a location the map is a calm plate with the pin, no streets.
- **Open days:** "Open every day" or the days you list, in the bento, the footer and Contact.
- **Phone** and **email:** the footer's "Visit the counter" and Contact.

## Collections (categories)

- Each **top-level category** is a collection: a tall dark card in the home's "Explore the collections", an entry in the header's Shop panel and the phone menu, a chip on every listing and the 404, a column in the footer, and its own listing page.
- Give each one an **image**: a pastry cut-out on a transparent ground. It sits on the collection's card, in the Shop panel, in the listing head and on the chips.
- Give each one a short **description**: its line in the Shop panel and the listing head.
- Order them in Selldone; the Layout keeps your order. The six warm hues behind the pastries are given to the collections in that order, then repeat.
- The stage, the trio and "Which <unit> is yours?" pick the **best-selling** collections; Buy together takes the best seller of two other collections.

## Products

- The **main photo** as a **transparent cut-out** (PNG or WebP, the pastry alone on no ground). Every card, the stage, the quick look and the product page set it on a dark plate under a warm halo; a photo with its own ground shows as a square. More photos make the product page's gallery.
- A **unit** (Selldone's `unit` field, for example "croissant"): "per croissant" on every card, "per croissant · sold individually" on the product page, "In stock · 3 croissants left", and the home's "Which croissant is yours?". Without one, the Layout says "piece".
- A **price**, and a **discount** for a saving: the struck was-price, "Save $X" in gold, the Deals page, the deals band and its Save roundel. The deals band's headline is "Up to X% off.", or "X% off. Every piece." when every product has the same saving.
- **Discount dates:** a deal with a real end date gets a clock on the product page. Without an end date there is no clock; no date is ever invented.
- **Pros** (Selldone's product pros, a title and a line each): "Why you'll love it" on the product page (numbered), its first line in the quick look, "Why pick it" on Compare.
- **Rating criteria** (for example "Flakiness", "Flavor"): shown as "Not rated yet" beside "No reviews yet." until the first review.
- **Stock:** "Only n left" on a card at five or fewer; out-of-stock pieces leave Tonight's selection, the trio and the deals band, and the stage picks a piece in stock when its collection has one.
- **Variants** only when the product really has options: tiles with their own photo on the product page; the quick look then says "Choose options" and opens the product.
- A **product code** (SKU) shows under Product information.
- **Sales:** best sellers, the stage, Most loved, the trio and the compare strip are ranked by Selldone's own sales count. With no sales yet, the older products come first.
- Bakini reads up to **250 products** in one go; a larger catalogue shows its first 250 in the listings and on the home.

## Specs and filters

The listing's filter panel (and its phone sheet), the product page's Product information, Compare and the home's "Which <unit> is yours?" come from each product's **spec**:

- Write specs **flat**: `{"Group": "group", "Key": ["value"]}` with `spec_order`. A nested spec is not shown anywhere.
- Keep the values you want as filters **short**. A spec key becomes a filter only when the products on that page have **two or more different values** for it, each **28 characters or fewer**. A long sentence (an allergen note, a description of the finish) is never a filter, but it still shows under Product information.
- **Price** (a two-thumb range with short boxes) is always there, and **On offer** whenever something on the page has a saving. Nothing else is invented, so a collection may show fewer filters than another.
- The filters are read live from the products, so a spec change shows on the next visit. No category filter list is needed.
- Sort: Featured, Best sellers, Customer review, Price low to high, Price high to low, Newest (the Deals page adds Biggest saving first).
- "Which <unit> is yours?" shows two rows of the first spec group whose values are short and differ between the four pastries.

## Content

- **Articles** (blog posts) with **cover images**: the four newest show as the journal, last on the home; the journal page shows them all, newest first. Publish **four or more** for a full row.
- In an article's text, **link the pastries** it talks about (`/product/<id>` links): the article ends with one panel of those pastries (four at most) and "Add all". Without links, the panel shows the pastries the text names.
- **FAQ** entries: the FAQ page, with topic tabs from the FAQ's tags. Until you add some, it shows sample questions (ordering pieces, delivery windows, pickup, the way to pay, allergens) built from your shop's facts, under the sample label below.
- **About us, Terms, Privacy, Contact us** pages (Selldone's shop profiles). Until you write them, About, Terms and Privacy show sample text built only from your shop's facts (no invented history, names or reviews), under a clear "Sample text — the shop has not written this page yet" label. Contact always shows your real lines and the message form; your own Contact text shows above the form.
- A **footer menu** (Selldone menu, type Footer): the footer's column under your shop's name. Without one: Home, About and Contact.
- **Social links:** shown in the footer's legal row.

## Checklist

- [ ] The shop's OAuth client id is set up
- [ ] The shop's title reads the way the wordmark should
- [ ] Collections have cut-out images and a short description
- [ ] Products have a cut-out main photo, a unit, pros, flat specs with short values, and an SKU
- [ ] Some products have discounts, with end dates only where the deal really ends
- [ ] At least one payment method (cash on delivery is fine)
- [ ] Delivery ways with titles, fees and time windows; a pickup point whose note holds the hours
- [ ] The shop info has an address, a location on the map, open days, a phone and an email
- [ ] Four or more articles with covers, linking the pastries they talk about
- [ ] FAQ entries, and your own About, Terms and Privacy
- [ ] The domain's Home is the shop page
