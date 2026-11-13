# Go Live

An uploaded version changes nothing until it is **attached** to your shop, or to one domain of it. Bakini goes live on **one domain first**: you see it on a real address while your other addresses stay as they are. Move the whole shop over only when you are happy.

Before you go live, check that your shop's **OAuth client id** is set up (see [Shop Requirements](Shop-Requirements)). Without it, sign-in on the Layout leaves for Selldone and shows an error.

## 1. Attach the version to one domain (how Bakini runs)

A shop can show a different Layout on one of its domains. Bakini started on `bakini.selldone.shop` alone, one domain of the shop Bakio, while the shop's default and its other addresses still carried the older Layout. Once the owner was happy, it became the shop default as well (step 2).

**In the dashboard:** shop › **Domains**, open the domain's settings and pick your Layout and the exact version for that domain.

**With the Selldone MCP connector:**

1. Confirm that `selldone_current_connection` returns **your** shop id. The connector picks the shop from its own connection, not from anything you pass.
2. Call `selldone_api_call` → `api.shops.domains.layout.set`, with `confirm: true`:

```json
api.shops.domains.layout.set   path { "domain_key": "<the domain's id>" }
body { "mode": "private", "layout_id": <your Layout id>, "layout_version": "1.0.4" }
```

Your Layout id is the one printed after your first upload. Pin the **exact** version, never `latest`, so an unverified upload never goes live.

Set that domain's own Home to the shop page too: `selldone_shop_home_domain_set` with `domain_address` and `page_id: "shop"`.

While you test on one domain, **don't** pin the shop default when you release this Layout: that would move every other address too. Check both addresses' `window.sdShopLayout` after a release.

## 2. The whole shop (when you are ready)

**In the dashboard:** shop › **Domains** › **Default layout** › **Change layout**. Pick your Layout and the exact version.

**With the MCP connector:** `selldone_api_call` → `api.shops.layout.set`, with `confirm: true` and this body:

```json
{ "mode": "private", "layout_id": <your Layout id>, "layout_version": "1.0.4" }
```

Read `api.shops.layout.options` before and after.

### Make every domain inherit it

A custom domain **keeps its own Layout selection**. It can stay on an old version, or on another Layout, while the shop moves on.

- Set each domain to **inherit**: `api.shops.domains.layout.set` with `{ "mode": "inherit" }`, or the same setting on the domain in the dashboard. This also ends the one-domain setup of step 1.
- Check every address after a release: `name.myselldone.com`, your custom domain, and any sub-domain.

Skip this for a domain that carries its own Layout on purpose.

Or keep the domain's own pin. Bakio kept `bakini.selldone.shop` pinned on its own, so it survives if the default is ever switched back. The cost is that every release is pinned twice: on the shop default and on that domain, both with the same exact version.

## 3. Home = Shop page

If `/` shows a Page Builder landing page while `/shop` shows the Layout, the Home is a page. Set it to the shop page:

- in the dashboard, set **Home** to **Shop**;
- or call `selldone_shop_home_default_set` with `page_id: "shop"` (for one domain: `selldone_shop_home_domain_set`).

## 4. Verify

Open the address **without a query** (a query shows the catalogue instead of the home). Then:

- the page source's `window.sdShopLayout` → `"saved"` block names your package and the new version;
- the header shows your shop's title as the wordmark, and the home starts with the dark stage (one pastry under a spotlight), then "Explore the collections";
- no blank page and no flash of an old design;
- Sign in opens the sign-in sheet with your shop's own ways in;
- the bag drawer opens from the header, and the checkout lists your delivery ways and their windows;
- check on a phone-sized screen too.

A headless browser that opens a `/product/` link directly gets Selldone's SEO page, not the Layout. Open the home first and move with the Layout's own links, or test in a normal browser.

## Custom domain on Cloudflare (example: `name.selldone.shop`)

1. Create an **A** record to `34.117.142.64`, **DNS only** (proxy off).
2. Create the **TXT** record Selldone gives you (`<sub>-challenge.<zone>`).
3. Add the domain with `selldone_domain_add`, `ssl_proxy: true`, or in the dashboard. HTTPS is issued within seconds.

Plain HTTP serves the shop too. The first custom domain becomes primary. Then either give the domain its own Layout (step 1) or make it **inherit** the shop's (step 2).
