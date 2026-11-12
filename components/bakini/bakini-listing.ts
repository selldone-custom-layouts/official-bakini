/*
 * Bakini — the results page's "Show 20 / 40 / 60" (a page size the shopper
 * picks). Selldone's SProductsListing sizes its pages by screen width and
 * view (a computed `limit`, 20–100); this module puts the shopper's pick in
 * front of it, once, when first imported (no change in modules/). The page
 * then asks the listing to read again (fetchData).
 */
import { reactive } from "vue";
import SProductsListing from "@selldone/components-vue/storefront/products/listing/SProductsListing.vue";

export const PAGE_SIZES = [20, 40, 60];

export const perPage = reactive<{ n: number }>({ n: 20 });

const L: any = SProductsListing;
if (!L.__bakiniPerPage) {
  L.__bakiniPerPage = true;
  const limit = L.computed?.limit;
  if (limit) {
    L.computed.limit = function (this: any) {
      return perPage.n || limit.call(this);
    };
  }
}
