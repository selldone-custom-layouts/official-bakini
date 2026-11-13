<!--
  - Copyright (c) 2023. Selldone® Business OS™
  -
  - Author: M.Pajuhaan
  - Web: https://selldone.com
  - ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  -
  - All rights reserved. In the weave of time, where traditions and innovations intermingle, this content was crafted.
  - From the essence of thought, through the corridors of creativity, each word, and sentiment has been molded.
  - Not just to exist, but to inspire. Like an artist's stroke or a sculptor's chisel, every nuance is deliberate.
  - Our journey is not just about reaching a destination, but about creating a masterpiece.
  - Tread carefully, for you're treading on dreams.
  -->


<!--
  Bakini Noir — the bag and the checkout (bakio-design/cart-b.html,
  checkout-b.html; b/pages-buy.js cart and checkout). One Selldone basket
  page in two stages (noir-cart.ts): the bag (rows with − n + and Remove,
  the delivery ways to choose now or later, the receipt and "Checkout",
  "Often added") and the checkout (?step=checkout: step pills, then
  numbered glass cards — Contact, Delivery method and its time window,
  Delivery address or the pickup counter, Billing, Note — and the floating
  receipt with "Place order · pay $X on delivery", what is still missing
  named above it). Empty: a calm card, "Continue shopping" and the
  collections.

  Everything that works is Selldone's and stays as it was in the script
  below: the bill, the basket config (receiver, delivery, billing, the
  shop's checkout questions, the guest's email), coupons and prizes, the
  shipping options, the address sheet (map on or off), the payment window
  and the service order.
-->
<template>
  <div class="nx nx-cartpage">
    <!-- ▆▆▆▆ Empty ▆▆▆▆ -->
    <section v-if="!(basket && basket.items && basket.items.length)" class="wrap cart">
      <div class="cart-hd">
        <nav :aria-label="t('bakini.n.co.crumbs', 'Breadcrumb')" class="crumbs">
          <router-link :to="{ path: '/' }">{{ t("bakini.n.co.home", "Home") }}</router-link><nx-icon name="right" /><span aria-current="page">{{ t("bakini.n.co.bag", "Bag") }}</span>
        </nav>
        <h1 class="serif">{{ t("bakini.n.co.your", "Your") }}{{ " " }}<em>{{ t("bakini.n.co.bagEm", "bag.") }}</em></h1>
      </div>
      <div class="empty">
        <span class="ec"><nx-icon name="bag" /></span>
        <h3>{{ t("bakini.n.co.emptyT", "Your bag is empty") }}</h3>
        <p>{{ t("bakini.n.co.emptyP", "Every pastry is sold individually — pick one piece or a few to begin.") }}</p>
        <div class="acts">
          <router-link :to="shopTo" class="btn">{{ t("bakini.n.co.continue", "Continue shopping") }}</router-link>
        </div>
      </div>
      <div v-if="noir.cats.length" class="cat-chips nx-cart-cats">
        <router-link v-for="c in noir.cats" :key="c.id" :to="catTo(c)" class="chip"><img v-if="catImg(c)" :src="catImg(c)" alt="" /><bdi>{{ c.title || c.name }}</bdi></router-link>
      </div>
    </section>

    <!-- ▆▆▆▆ Bag ▆▆▆▆ -->
    <template v-else-if="nx_stage === 'bag'">
      <section class="wrap cart">
        <div class="cart-hd">
          <nav :aria-label="t('bakini.n.co.crumbs', 'Breadcrumb')" class="crumbs">
            <router-link :to="{ path: '/' }">{{ t("bakini.n.co.home", "Home") }}</router-link><nx-icon name="right" /><span aria-current="page">{{ t("bakini.n.co.bag", "Bag") }}</span>
          </nav>
          <h1 class="serif">{{ t("bakini.n.co.your", "Your") }}{{ " " }}<em>{{ t("bakini.n.co.bagEm", "bag.") }}</em></h1>
        </div>
        <div class="cart-grid">
          <div class="cart-main">
            <div class="gcard cart-rows">
              <div v-for="it in nx_lines" :key="it.id" :style="{ '--bk-hue': hueOf(it.product?.category_id) }" class="crow">
                <router-link :to="productTo({ id: it.product_id })" aria-hidden="true" class="th" tabindex="-1"><img :src="nx_img(it)" alt="" class="cut" /></router-link>
                <div class="crow-t">
                  <p v-if="nx_cat(it)" class="eyebrow"><bdi>{{ nx_cat(it) }}</bdi></p>
                  <router-link :to="productTo({ id: it.product_id })" class="nm">{{ it.product?.title }}</router-link>
                  <p class="meta">
                    <span class="money">{{ nx_money(it.price) }}</span>{{ " " }}<span v-if="it.dis > 0" class="was money">{{ nx_money(it.price + it.dis) }}</span>
                    {{ " · " + t("bakini.n.co.per", "per {unit}", { unit: nx_unit(it) }) }}<template v-if="it.dis > 0">{{ " · " }}<span class="gold">{{ t("bakini.n.co.save", "Save {amount}", { amount: nx_money(it.dis) }) }}</span></template>
                  </p>
                </div>
                <div class="crow-q">
                  <nx-line-qb :item="it" />
                  <button :aria-label="t('bakini.n.co.removeOf', 'Remove {name}', { name: it.product?.title || '' })" class="crow-rm" type="button" @click="nx_remove(it)">
                    <nx-icon name="trash" /><span>{{ t("bakini.n.co.remove", "Remove") }}</span>
                  </button>
                </div>
                <span class="crow-lt money">{{ nx_money(it.price * nx_shown(it)) }}</span>
              </div>
            </div>

            <div v-if="transportation_list.length && has_delivery && !isService" class="gcard cart-dl">
              <div class="gc-hd">
                <h2>{{ t("bakini.n.co.delivery", "Delivery") }}</h2>
                <span class="muted">{{ t("bakini.n.co.chooseNow", "Choose now or at checkout") }}</span>
              </div>
              <div class="dpv">
                <button
                  v-for="way in nx_ways_in_order"
                  :key="way.type + (way.id || '')"
                  :aria-pressed="delivery_info?.type === way.type ? 'true' : 'false'"
                  class="dpv-o"
                  type="button"
                  @click="nx_pick_way(way)"
                >
                  <span class="dm-ic"><nx-icon :name="wayIcon(way.type)" /></span>
                  <span class="dm-t"
                    ><b>{{ wayTitleOf(way) }}</b><span v-if="way.time_spans?.length">{{ way.time_spans.join(" · ") }}</span></span
                  >
                  <span class="dm-fee">{{ nx_way_fee(way) }}</span>
                </button>
              </div>
            </div>
          </div>

          <aside class="cart-side">
            <div :class="{ '-busy': busy_bill || refreshing_price }" class="rc-card">
              <h2 class="serif">{{ t("bakini.n.co.receipt", "Receipt") }}</h2>
              <div v-if="bill" class="rcpt">
                <div class="ln">
                  <span>{{ t("bakini.n.co.full", "Items at full price") }}</span><span class="money">{{ nx_money(nx_rc.full) }}</span>
                </div>
                <div v-if="nx_rc.save > 0" class="ln save">
                  <span>{{ nx_save_label }}</span><span class="money">−{{ nx_money(nx_rc.save) }}</span>
                </div>
                <div v-if="nx_rc.offer > 0" class="ln save">
                  <span>{{ t("bakini.n.co.offers", "Offers") }}</span><span class="money">−{{ nx_money(nx_rc.offer) }}</span>
                </div>
                <div class="ln">
                  <span>{{ t("bakini.n.co.deliveryOf", "Delivery · {way}", { way: nx_delivery_label }) }}</span>
                  <span>{{ nx_rc.delivery < 0 && !nx_way_is_free ? t("bakini.n.co.atCheckout", "At checkout") : nx_delivery_value }}</span>
                </div>
                <div class="ln tot">
                  <span>{{ t("bakini.n.co.total", "Total") }}</span><span class="money">{{ nx_money(nx_rc.total) }}</span>
                </div>
              </div>
              <p v-else-if="!busy_bill" class="rc-pay"><nx-icon name="info" /><span>{{ t("bakini.n.co.billError", "We could not work out the bill. Please reload the page.") }}</span></p>
              <button class="btn lg block" type="button" @click="nx_go_checkout">{{ t("bakini.n.co.checkout", "Checkout") }}<nx-icon name="arrow" /></button>
              <p v-if="nx_cod_only" class="rc-pay"><nx-icon name="cash" /><span>{{ t("bakini.n.co.codNote", "Cash on delivery — pay the courier when it arrives.") }}</span></p>
            </div>
          </aside>
        </div>
      </section>
      <nx-row
        v-if="nx_often.length"
        :accent="t('bakini.n.co.oftenEm', 'with your bag.')"
        :eyebrow="t('bakini.n.co.oftenEyebrow', 'Often added')"
        :items="nx_often"
        :title="t('bakini.n.co.oftenH', 'Pairs well')"
      />
    </template>

    <!-- ▆▆▆▆ Checkout ▆▆▆▆ -->
    <div v-else class="co-stage">
      <section class="wrap co-top">
        <div class="co-title">
          <div>
            <nav :aria-label="t('bakini.n.co.crumbs', 'Breadcrumb')" class="crumbs">
              <a href="#" @click.prevent="nx_go_bag">{{ t("bakini.n.co.bag", "Bag") }}</a><nx-icon name="right" /><span aria-current="page">{{ t("bakini.n.co.checkout", "Checkout") }}</span>
            </nav>
            <h1 class="serif">{{ t("bakini.n.co.check", "Check") }}<em>{{ t("bakini.n.co.out", "out.") }}</em></h1>
          </div>
          <ol :aria-label="t('bakini.n.co.steps', 'Checkout steps')" class="steps">
            <li v-for="(s, i) in nx_steps" :key="s.key" :aria-current="s.state === 'cur' ? 'step' : undefined" :class="['sp', s.state]">
              <a v-if="s.key === 'bag'" href="#" @click.prevent="nx_go_bag"
                ><span class="sp-n"><nx-icon name="check" /></span>{{ s.label }}</a
              >
              <a v-else :href="'#' + s.anchor" @click.prevent="nx_scroll_to(s.anchor)"
                ><span class="sp-n"><nx-icon v-if="s.state === 'done'" name="check" /><template v-else>{{ i + 1 }}</template></span>{{ s.label }}</a
              >
            </li>
          </ol>
        </div>
      </section>

      <section class="wrap co">
        <div class="co-main">
          <!-- 1. Contact -->
          <section id="co-details" class="gcard">
            <div class="gc-hd">
              <span class="gc-n">1</span>
              <h2>{{ t("bakini.n.co.contact", "Contact") }}</h2>
              <a v-if="!user" class="link" href="#" @click.prevent="NeedLogin">{{ t("bakini.n.co.signIn", "Sign in") }}</a>
            </div>
            <template v-if="user">
              <p class="muted gc-sub">{{ t("bakini.n.co.signedAs", "Signed in as {name}.", { name: user.name || user.email || "" }) }}</p>
            </template>
            <p v-else-if="busy_user" class="muted gc-sub">{{ t("bakini.n.co.checking", "Checking your sign-in…") }}</p>
            <p v-else-if="has_guest_payment" class="muted gc-sub">{{ t("bakini.n.co.noAccount", "No account needed — we only use these for this order.") }}</p>
            <p v-else class="muted gc-sub">{{ t("bakini.n.co.signInToOrder", "Sign in to place the order.") }}</p>
            <div class="fgrid">
              <label id="co-f-email" :class="['fld', { err: nx_touched.email && !nx_email_ok }]">
                <span>{{ t("bakini.n.co.email", "Email") }}</span>
                <input
                  :disabled="!!user || (!user && !has_guest_payment)"
                  :value="nx_email"
                  autocomplete="email"
                  inputmode="email"
                  name="email"
                  placeholder="you@example.com"
                  type="email"
                  @blur="nx_save_contact"
                  @input="nx_email = $event.target.value"
                />
                <small class="hint">{{ nx_touched.email && !nx_email_ok ? t("bakini.n.co.emailHint", "Add a valid email") : "" }}</small>
              </label>
              <label v-if="has_delivery && !isService" id="co-f-phone" :class="['fld', { err: nx_touched.phone && !nx_phone_ok }]">
                <span>{{ t("bakini.n.co.phone", "Phone") }}</span>
                <input :value="nx_phone" autocomplete="tel" dir="ltr" name="phone" placeholder="+1 …" type="tel" @blur="nx_save_contact" @input="nx_phone = $event.target.value" />
                <small class="hint">{{ nx_touched.phone && !nx_phone_ok ? t("bakini.n.co.phoneHint", "Add a phone number") : "" }}</small>
              </label>
            </div>
            <button v-if="!user && !has_guest_payment" class="btn" style="margin-top: 14px" type="button" @click="NeedLogin">{{ t("bakini.n.co.signIn", "Sign in") }}</button>
          </section>

          <!-- 2. Delivery method and its window (Selldone's shipping options) -->
          <section v-if="has_delivery && !isService && bill" id="co-delivery" class="gcard">
            <div class="gc-hd">
              <span class="gc-n">2</span>
              <h2>{{ t("bakini.n.co.method", "Delivery method") }}</h2>
              <button class="link" type="button" @click="delivery_sheet = true">{{ t("bakini.n.co.allDetails", "All details") }}</button>
            </div>
            <s-shop-connect-shipping-options
              :basket="basket"
              :start-package-index="0"
              @change="
                (connect_shippings) => {
                  delivery_info.connect_shippings = connect_shippings;
                  setBasketConfig();
                }
              "
            ></s-shop-connect-shipping-options>
            <s-order-shipping-vendors-options
              :basket="basket"
              :deliveryInfo="delivery_info"
              :start-package-index="bill?.connect_shipping_options?.length"
              @set-basket-config="setBasketConfig"
            ></s-order-shipping-vendors-options>
            <s-order-shipping-stores-options
              v-if="!delivery_sheet"
              :basket="basket"
              :delivery-info="delivery_info"
              :start-package-index="bill?.connect_shipping_options?.length + bill?.vendor_shipping_options?.length"
              @set-basket-config="setBasketConfig"
            ></s-order-shipping-stores-options>
          </section>

          <!-- 3. Delivery address, or the pickup counter -->
          <section v-if="has_delivery" id="co-address" class="gcard">
            <div class="gc-hd">
              <span class="gc-n">{{ has_delivery && !isService && bill ? 3 : 2 }}</span>
              <h2>{{ nx_is_pickup ? t("bakini.n.co.pickupCounter", "Pickup counter") : isService ? t("bakini.n.co.serviceAddress", "Service address") : t("bakini.n.co.address", "Delivery address") }}</h2>
            </div>
            <div v-if="nx_is_pickup" class="addr-card pk">
              <span class="dm-ic"><nx-icon name="store" /></span>
              <div>
                <b><bdi>{{ receiver_info?.name || receiver_info?.title || nx_pickup_point?.name }}</bdi></b>
                <span
                  ><bdi>{{ [receiver_info?.address, receiver_info?.city, receiver_info?.postal].filter(Boolean).join(", ") }}</bdi
                  ><template v-if="receiver_info?.message || nx_pickup_point?.message">{{ " · " + (nx_pickup_point?.message || "") }}</template></span
                >
              </div>
            </div>
            <div v-else-if="nx_has_address" class="addr-card">
              <span class="dm-ic"><nx-icon name="pin" /></span>
              <div>
                <b v-if="receiver_info.name"><bdi>{{ receiver_info.name }}</bdi></b>
                <span><bdi>{{ address_line }}</bdi><template v-if="receiver_info.city">{{ ", " + [receiver_info.city, receiver_info.state, receiver_info.postal].filter(Boolean).join(" ") }}</template></span>
                <span v-if="receiver_info.phone" dir="ltr">{{ receiver_info.phone }}</span>
              </div>
              <button class="btn ghost sm" type="button" @click="openAddress()"><nx-icon name="edit" />{{ t("bakini.n.co.change", "Change") }}</button>
            </div>
            <div v-else :class="['addr-card', 'none', { err: nx_touched.address }]">
              <span class="dm-ic"><nx-icon name="pin" /></span>
              <div>
                <b>{{ t("bakini.n.co.noAddress", "No delivery address yet") }}</b>
                <span>{{ no_map ? t("bakini.n.co.noAddressP0", "Add the receiver and the street.") : t("bakini.n.co.noAddressP", "Drop a pin on the map, then add the receiver and street.") }}</span>
              </div>
              <button class="btn sm" type="button" @click="openAddress()"><nx-icon name="pin" />{{ no_map ? t("bakini.n.co.addAddress", "Add your address") : t("bakini.n.co.addOnMap", "Add on the map") }}</button>
            </div>
          </section>

          <!-- 4. Billing -->
          <section id="co-billing" class="gcard">
            <div class="gc-hd">
              <span class="gc-n">{{ (has_delivery && !isService && bill ? 3 : 2) + (has_delivery ? 1 : 0) }}</span>
              <h2>{{ t("bakini.n.co.billing", "Billing") }}</h2>
            </div>
            <div class="bill">
              <button :aria-pressed="!nx_billing_custom ? 'true' : 'false'" class="bill-o" type="button" @click="nx_set_billing(false)">
                <span class="rd"></span
                ><span
                  ><b>{{ t("bakini.n.co.same", "Same as delivery") }}</b
                  ><span>{{ nx_is_pickup ? t("bakini.n.co.sameReceiver", "Use the receiver details") : t("bakini.n.co.sameAddress", "Use the delivery address") }}</span></span
                >
              </button>
              <button :aria-pressed="nx_billing_custom ? 'true' : 'false'" class="bill-o" type="button" @click="nx_set_billing(true)">
                <span class="rd"></span
                ><span
                  ><b>{{ t("bakini.n.co.other", "Different billing address") }}</b><span>{{ t("bakini.n.co.otherP", "Add another name and address") }}</span></span
                >
              </button>
            </div>
            <s-shop-billing-address-form
              v-if="nx_billing_custom"
              v-model="billing"
              :receiver-info="receiver_info"
              class="nx-billform"
              force-show-form
              @change="setBasketConfig"
            ></s-shop-billing-address-form>
          </section>

          <!-- 5. Note for the bakery (the receiver's note) -->
          <section v-if="has_delivery && !isService" id="co-note" class="gcard">
            <div class="gc-hd">
              <span class="gc-n">{{ (has_delivery && !isService && bill ? 4 : 3) + (has_delivery ? 1 : 0) }}</span>
              <h2>{{ t("bakini.n.co.note", "Note for the bakery") }}</h2>
              <span class="muted">{{ t("bakini.n.co.optional", "Optional") }}</span>
            </div>
            <label class="fld">
              <span class="vh">{{ t("bakini.n.co.note", "Note for the bakery") }}</span>
              <textarea
                :placeholder="t('bakini.n.co.notePh', 'Anything about this order — for example a door code or a pickup time.')"
                :value="nx_note_value"
                name="note"
                @blur="setBasketConfig"
                @input="nx_note_value = $event.target.value"
              ></textarea>
            </label>
          </section>

          <!-- The shop's own checkout questions (Selldone) -->
          <s-order-checkout-form
            :key="'socf-' + basket?.id"
            v-model="form"
            :country="receiver_info?.country ? receiver_info.country : billing?.country"
            class="nx-coform"
            @changed="setBasketConfig"
          ></s-order-checkout-form>

          <!-- Coupons and prizes, only when the shopper has some -->
          <s-storefront-coupons-list
            v-if="!isSubscription"
            v-model="basket.coupon"
            :basket="basket"
            class="nx-offers"
            return-object
            selectable
            @loading="(val) => (refreshing_price = val)"
            @update:model-value="selectCoupon"
          ></s-storefront-coupons-list>
          <s-storefront-lottery-prizes-list
            v-if="!isSubscription"
            v-model="basket.lottery"
            :basket="basket"
            class="nx-offers"
            return-object
            selectable
            @loading="(val) => (refreshing_price = val)"
            @update:model-value="selectLottery"
          ></s-storefront-lottery-prizes-list>
        </div>

        <!-- The floating receipt -->
        <aside id="co-pay" class="co-side">
          <div :class="['rc-card', 'float', { '-busy': busy_bill || refreshing_price || busy_save }]">
            <div class="rc-hd">
              <h2 class="serif">{{ t("bakini.n.co.yourOrder", "Your order") }}</h2>
              <a class="link" href="#" @click.prevent="nx_go_bag">{{ t("bakini.n.co.editBag", "Edit bag") }}</a>
            </div>
            <div class="rc-items">
              <div v-for="it in nx_lines" :key="it.id" :style="{ '--bk-hue': hueOf(it.product?.category_id) }" class="rc-it">
                <span class="th"><img :src="nx_img(it)" alt="" class="cut" /><i>{{ nx_shown(it) }}</i></span>
                <span class="nm">{{ it.product?.title }}</span>
                <span class="money">{{ nx_money(it.price * nx_shown(it)) }}</span>
              </div>
            </div>
            <div v-if="bill" class="rcpt">
              <div class="ln">
                <span>{{ t("bakini.n.co.full", "Items at full price") }}</span><span class="money">{{ nx_money(nx_rc.full) }}</span>
              </div>
              <div v-if="nx_rc.save > 0" class="ln save">
                <span>{{ nx_save_label }}</span><span class="money">−{{ nx_money(nx_rc.save) }}</span>
              </div>
              <div v-if="nx_rc.offer > 0" class="ln save">
                <span>{{ t("bakini.n.co.offers", "Offers") }}</span><span class="money">−{{ nx_money(nx_rc.offer) }}</span>
              </div>
              <div v-if="discount_code_amount > 0" class="ln save">
                <span>{{ discount_code?.code ? t("bakini.n.co.codeNamed", "Code {code}", { code: discount_code.code }) : t("bakini.n.co.code", "Code") }}</span
                ><span class="money">−{{ nx_money(discount_code_amount) }}</span>
              </div>
              <div v-if="coupon && coupon_discount > 0" class="ln save">
                <span>{{ coupon.title || $t("global.commons.coupon") }}</span><span class="money">−{{ nx_money(coupon_discount) }}</span>
              </div>
              <div v-if="customer_club_discount > 0" class="ln save">
                <span>{{ t("bakini.n.co.club", "Club") }}</span><span class="money">−{{ nx_money(customer_club_discount) }}</span>
              </div>
              <div v-if="wallet" class="ln save">
                <span>{{ $t("global.commons.my_wallet") }}</span><span class="money">−{{ nx_money(wallet) }}</span>
              </div>
              <div v-if="!isService" class="ln">
                <span>{{ nx_delivery_label }}</span>
                <span>{{ nx_delivery_value }}</span>
              </div>
              <div v-if="bill.tax" class="ln">
                <span>{{ $t("global.commons.tax") }}</span><span class="money">{{ nx_money(bill.tax) }}</span>
              </div>
              <div class="ln tot">
                <span>{{ nx_cod_only ? t("bakini.n.co.payOnDelivery", "Pay on delivery") : t("bakini.n.co.total", "Total") }}</span><span class="money">{{ nx_money(nx_rc.total) }}</span>
              </div>
            </div>
            <p v-if="nx_way_line" class="rc-line">
              <nx-icon :name="wayIcon(nx_way?.type)" /><span>{{ nx_way_line }}</span>
            </p>
            <div v-if="!isSubscription" class="nx-code">
              <s-discount-code-input
                v-model="basket.discount_code"
                :basket="basket"
                :currency="basket.currency"
                @loading="(val) => (refreshing_price = val)"
                @update:model-value="selectDiscountCode"
              />
            </div>
            <div v-if="nx_missing.length" class="rc-miss" data-miss role="status">
              <b>{{ t("bakini.n.co.beforePlace", "Before you place the order, add:") }}</b>
              <ul>
                <li v-for="x in nx_missing" :key="x.key">
                  <button type="button" @click="nx_goto(x.key)">{{ x.label }}</button>
                </li>
              </ul>
            </div>
            <div v-if="nx_no_gateway" class="pay-none-c">
              <span class="ec"><nx-icon name="lock" /></span>
              <div>
                <b>{{ t("bakini.n.co.noPayT", "This shop is not taking payment right now") }}</b>
                <span>{{ nx_facts.phone ? t("bakini.n.co.noPayP", "Your bag is saved. Please try again later, or contact the bakery on {phone}.", { phone: nx_facts.phone }) : t("bakini.n.co.noPayP0", "Your bag is saved. Please try again later.") }}</span>
              </div>
            </div>
            <p v-else-if="pay_blocker && !nx_missing.length" class="rc-pay"><nx-icon name="info" /><span>{{ pay_blocker }}</span></p>
            <button v-if="!nx_no_gateway" :disabled="busy_submit" class="btn lg block" type="button" @click="nx_place">
              <span v-if="busy_save || busy_bill || busy_submit" class="nx-spin" aria-hidden="true"></span>{{ nx_place_label }}
            </button>
            <p class="rc-pay">
              <nx-icon name="lock" /><span>{{
                nx_cod_only
                  ? nx_is_pickup
                    ? t("bakini.n.co.cashPickup", "Nothing is charged online. You pay in cash at the counter or to the courier.")
                    : t("bakini.n.co.cash", "Nothing is charged online. You pay the courier in cash.")
                  : t("bakini.n.co.secure", "You choose how to pay in the next step.")
              }}</span>
            </p>
          </div>
        </aside>
      </section>
    </div>

    <!-- ▆▆▆▆ The delivery sheet (delivery-b): every way, its windows, the counter ▆▆▆▆ -->
    <teleport to="body">
      <div class="nx nx-buy-layers">
        <div :class="['scrim', { open: delivery_sheet }]" @click="delivery_sheet = false"></div>
        <div id="dlsheet" ref="dlsheet" :class="['dialog', { open: delivery_sheet }]" aria-labelledby="dl-t" aria-modal="true" role="dialog" style="--bk-dw: 720px" tabindex="-1" @keydown.esc.stop="delivery_sheet = false">
          <button :aria-label="t('bakini.n.co.close', 'Close')" class="iconbtn x" type="button" @click="delivery_sheet = false"><nx-icon name="close" /></button>
          <div v-if="delivery_sheet && basket && bill" class="sh-in">
            <p class="eyebrow">{{ t("bakini.n.co.delivery", "Delivery") }}</p>
            <h2 id="dl-t" class="sh-h">{{ t("bakini.n.co.howReach", "How should it reach you?") }}</h2>
            <s-order-shipping-stores-options
              :basket="basket"
              :delivery-info="delivery_info"
              :start-package-index="bill?.connect_shipping_options?.length + bill?.vendor_shipping_options?.length"
              class="nx-dlsheet"
              @set-basket-config="setBasketConfig"
            ></s-order-shipping-stores-options>
            <div class="sh-foot">
              <button class="btn lg" type="button" @click="delivery_sheet = false">{{ t("bakini.n.co.done", "Done") }}</button>
            </div>
          </div>
        </div>
      </div>
    </teleport>

    <!-- ▆▆▆▆ The address sheet (map-b; map on or off) ▆▆▆▆ -->
    <kalio-address-sheet
      v-if="has_delivery"
      v-model="address_sheet"
      :center="center"
      :countries="$shop.countries?.length ? $shop.countries : null"
      :heading="isService ? t('bakini.n.co.whereService', 'Where should we come?') : no_map ? t('bakini.n.co.yourAddress', 'Your address') : t('bakini.n.co.setPin', 'Set the pin')"
      :lede="t('bakini.n.co.addressLede', 'Delivery address')"
      :no-map="no_map"
      :receiver-info="nx_receiver_is_pickup ? {} : receiver_info"
      @save="onClickSetLocation"
    />

    <div v-if="busy_shop" class="busy-overlay">
      <div class="text-h4 font-weight-thin">{{ $t("global.commons.waiting") }}...</div>
    </div>
  </div>
</template>

<script lang="ts">
import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

import { ShopTransportations } from "@selldone/core-js/enums/logistic/ShopTransportations";
import SDiscountCodeInput from "@selldone/components-vue/storefront/discount-code/input/SDiscountCodeInput.vue";
import { GtagEcommerce } from "@selldone/components-vue/plugins/gtag/GtagEcommerce";
import SStorefrontCouponsList from "@selldone/components-vue/storefront/coupon/list/SStorefrontCouponsList.vue";
import { ProductType } from "@selldone/core-js/enums/product/ProductType";
import SStorefrontLotteryPrizesList from "@selldone/components-vue/storefront/lottery/prizes-list/SStorefrontLotteryPrizesList.vue";
import VariantItemMini from "@selldone/components-vue/storefront/product/variant/VariantItemMini.vue";
import { ShopOptionsHelper } from "@selldone/core-js/helper/shop/ShopOptionsHelper";
import UTextValueDashed from "@selldone/components-vue/ui/text/value-dashed/UTextValueDashed.vue";
import { StorefrontLocalStorages } from "@selldone/core-js/helper/local-storage/StorefrontLocalStorages";
import SShopShareOrderButton from "@selldone/components-vue/storefront/order/share-order/SShopShareOrderButton.vue";
import SShopBillingAddressForm from "@selldone/components-vue/storefront/order/billing/SShopBillingAddressForm.vue";
import BillingPeriod from "@selldone/core-js/enums/subscription/BillingPeriod";
import SShopConnectShippingOptions from "@selldone/components-vue/storefront/order/shipping/connect/SShopConnectShippingOptions.vue";
import { ETA } from "@selldone/core-js/enums/logistic/ETA";
import { ShadeColor } from "@selldone/core-js/helper/color/ColorGenerator";
import { throttle } from "lodash-es";
import UPaymentStripeSplit from "@selldone/components-vue/ui/payment/stripe/split/UPaymentStripeSplit.vue";
import { BasketHelper } from "@selldone/core-js/helper/shop/BasketHelper";
import SOrderShippingVendorsOptions from "@selldone/components-vue/storefront/order/shipping/vendor/SOrderShippingVendorsOptions.vue";
import SOrderShippingStoresOptions from "@selldone/components-vue/storefront/order/shipping/store/SOrderShippingStoresOptions.vue";
import ULoadingEllipsis from "@selldone/components-vue/ui/loading/ellipsis/ULoadingEllipsis.vue";
import { Basket } from "@selldone/core-js/models";
import TemplateMixin from "@selldone/components-vue/mixin/template/TemplateMixin.ts";
import CurrencyMixin from "@selldone/components-vue/mixin/currency/CurrencyMixin.ts";
import ProductMixin from "@selldone/components-vue/mixin/product/ProductMixin.ts";
import MapMixin from "@selldone/components-vue/mixin/map/MapMixin.ts";
import AuthMixin from "@selldone/components-vue/mixin/auth/AuthMixin.ts";
import ClubMixin from "@selldone/components-vue/mixin/club/ClubMixin.ts";
import DateMixin from "@selldone/components-vue/mixin/date/DateMixin.ts";
import SOrderCheckoutForm from "@selldone/components-vue/storefront/order/checkout/SOrderCheckoutForm.vue";
import { WeekDays } from "@selldone/core-js/enums/logistic/WeekDays";
import { TimeSpans } from "@selldone/core-js/enums/logistic/TimeSpans";
import KalioCartLines from "../../../components/kalio/checkout/KalioCartLines.vue";
import KalioOftenAdded from "../../../components/kalio/KalioOftenAdded.vue";
import KalioAddressSheet from "../../../components/kalio/checkout/KalioAddressSheet.vue";
import { formatDate, t } from "../../../components/kalio/i18n/kalio-i18n";
import NoirCart from "../../../components/bakini/noir/buy/noir-cart";
import NxIcon from "../../../components/bakini/noir/NxIcon.vue";
import NxLineQb from "../../../components/bakini/noir/NxLineQb.vue";
import NxRow from "../../../components/bakini/noir/NxRow.vue";

export default {
  name: "StorefrontPageBasketCart",
  mixins: [
    TemplateMixin,
    CurrencyMixin,
    ProductMixin,
    MapMixin,
    AuthMixin,
    ClubMixin,
    DateMixin,
    NoirCart,
  ],

  components: {
    NxIcon,
    NxLineQb,
    NxRow,
    KalioCartLines,
    KalioOftenAdded,
    KalioAddressSheet,
    SOrderCheckoutForm,
    ULoadingEllipsis,
    SOrderShippingStoresOptions,
    SOrderShippingVendorsOptions,
    UPaymentStripeSplit,

    SShopConnectShippingOptions,
    SShopBillingAddressForm,
    SShopShareOrderButton,

    VariantItemMini,
    SStorefrontLotteryPrizesList,
    SStorefrontCouponsList,
    SDiscountCodeInput,
  },

  inject: ["$shop"],
  /**
   * ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
   *  🔷 Props
   * ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
   */
  props: {},
  /**
   * ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
   *  🔷 Data
   * ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
   */
  data: () => ({
    ETA: ETA,

    types: ProductType,
    type: ProductType.PHYSICAL.code,

    center: null, //{ lat: 40.943397271692135, lng: -73.83711692458752 },

    map_dialog: false,
    dialog_pre: false,

    delivery_info: {},

    startup_mode_map_dialog: "default",

    //-------------- Lottery Prize ---------------
    lottery_win_selected_variant: null,

    show_package_info: false,

    //-------------- Billing Info -------------
    busy_bill: false,

    same_billing: true,

    billing: null,

    busy_save: false,

    guest_email: null,

    form: null,
    //-------------- Billing Info -------------

    refreshing_price: false,

    //-------------- Service -------------
    busy_submit: false,

    //-------------- Dynamic buttons -------------
    intersect_location_btn: false,
    intersect_payment_btn: false,

    //-------------- Kalio -------------
    delivery_sheet: false,
    address_sheet: false,
    guest_email_touched: false,
  }),
  /**
   * ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
   *  🔷 Computed
   * ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
   */
  computed: {
    receiver_info() {
      return this.basket?.receiver_info || null; // Kalio: no basket yet (a guest with nothing in it)
    },
    theme() {
      return this.$shop.theme;
    },
    busy_shop() {
      return this.$store.getters.getBusyShop;
    },

    isSubscription() {
      return this.type === ProductType.SUBSCRIPTION.code;
    },

    checkout() {
      return ShopOptionsHelper.GetCheckout(this.$shop);
    },
    no_map() {
      return !ShopOptionsHelper.HasMap(this.$shop);
    },

    size_unit() {
      return ShopOptionsHelper.GetSizeUnit(this.$shop);
    },

    mass_unit() {
      return ShopOptionsHelper.GetMassUnit(this.$shop);
    },

    light_checkout() {
      return this.$shop.theme?.light_checkout;
    },
    //-------------- Lottery Prize ---------------
    prize() {
      if (!this.basket) return null;
      return this.basket?.lottery;
    },

    //-------------- Discount Code ---------------
    discount_code() {
      return this.basket?.discount_code;
    },

    basket() {
      return this.getBasket(this.type) as Basket;
    },

    bill() {
      return this.basket ? (this.basket.bill as Basket.ICalculatedBill) : null;
    },
    can_pay() {
      return this.bill?.can_pay; // IMPORTANT! If for any reason user can not pay this order then it should be false!
    },

    isPhysical() {
      return this.type === ProductType.PHYSICAL.code;
    },
    isVirtual() {
      return this.type === ProductType.VIRTUAL.code;
    },
    isFile() {
      return this.type === ProductType.FILE.code;
    },
    isService() {
      return this.type === ProductType.SERVICE.code;
    },
    is_service_need_pricing() {
      /**
       * It needs pricing by the seller after checkout.
       */
      return BasketHelper.IsServiceAndNeedPricing(this.basket);
    },

    wallet() {
      return this.bill.wallet;
    },

    net_price() {
      return this.bill.price - (this.bill.tax_included ? this.bill.tax : 0);
    },

    final_price() {
      return this.bill && this.bill.sum;
    },

    filtered_types() {
      return Object.values(ProductType).filter((type) => {
        return this.getCount(type.code);
      });
    },

    raw_items_price() {
      return this.bill ? this.bill.items_price : 0;
    },

    //-------------- Coupon ---------------
    coupon() {
      return this.basket?.coupon;
    },
    discount_code_amount() {
      return this.bill ? this.bill.discount_code : 0;
    },

    customer_club_discount() {
      return this.bill ? this.bill.club : 0;
    },

    coupon_discount() {
      return this.bill ? this.bill.coupon : 0;
    },

    prize_discount() {
      return this.bill ? this.bill.lottery : 0;
    },

    /**
     * It determines delivery and product type support COD or not!
     */
    deliverySupportCOD() {
      return this.bill?.can_cod; // Only for physical and service!
    },

    can_pay_cod() {
      return (
        this.deliverySupportCOD &&
        this.$shop.gateways?.some(
          (gateway) => gateway.currency === this.basket.currency && gateway.cod,
        )
      );
    },

    shipping_cost() {
      return this.bill ? this.bill.delivery_price : 0;
    },
    has_custom_delivery() {
      // True when at least one item deliver by this shop (Not selldone drop-shipping or connect)
      return this.bill && this.bill.has_custom_delivery;
    },
    extra_shipping_counts() {
      // Number of shops drop shop (Main sellers)
      return this.bill && this.bill.extra_shipping_counts;
    },

    items() {
      if (!this.basket || !this.basket.items) return [];
      return this.basket?.items || [];
    },

    max_lead_time() {
      if (!this.basket) return 0;
      let max_lead = 0;
      this.basket.items.forEach((item) => {
        let lead = this.leadProduct(
          item.product,
          item.variant,
          item.vendor_product,
        );
        if (lead) max_lead = Math.max(max_lead, lead);
      });

      return max_lead;
    },

    total_price() {
      return this.bill ? this.bill.items_price : 0;
    },

    total_price_after_offer() {
      return this.total_price - this.total_offers_amount;
    },

    total_price_with_delivery() {
      let total = this.total_price_after_offer;
      if (this.shipping_cost > 0) total += this.shipping_cost;
      return total;
    },
    total_price_with_delivery_and_discount() {
      return this.total_price_with_delivery - this.discount_code_amount;
    },

    total_items_discount() {
      return this.bill ? this.bill.items_discount : 0;
    },

    cross_selling_discount() {
      return this.bill ? this.bill.cross_selling_discount : 0;
    },

    total_offers_amount() {
      return this.bill ? this.bill.offer : 0;
    },

    basketTypeCanCOD() {
      return this.type === ProductType.PHYSICAL.code;
    },

    canPayAndComplete() {
      if (this.isPhysical || this.isService || this.isSubscription) {
        if (!this.has_delivery) return true; // Seller select do not ask for shipping address.

        return (
          this.receiver_info &&
          this.receiver_info.address &&
          this.receiver_info.phone &&
          this.is_valid_location
        );
      } else if (this.isVirtual) {
        return true;
      } else if (this.isFile) {
        return true;
      }

      return false;
    },

    hasErrorInReceiverInfo() {
      if (this.isPhysical && this.has_delivery) {
        return (
          this.receiver_info &&
          this.receiver_info.address &&
          (!this.receiver_info.phone || !this.is_valid_location)
        );
      }
      return false;
    },

    has_delivery() {
      return ShopOptionsHelper.AskShippingAddress(this.$shop, this.type);
    },

    showCustomDeliveryTimeButton() {
      return (
        this.has_delivery &&
        this.receiver_info &&
        this.receiver_info.address &&
        this.is_valid_location
      );
    },

    error_message_payment() {
      if (this.isPhysical && this.has_delivery) {
        if (this.receiver_info) {
          if (!this.receiver_info.address)
            return this.$t("basket_page.errors.no_address");
          if (!this.receiver_info.phone)
            return this.$t("basket_page.errors.no_phone");
        }
      }

      return null;
    },

    is_valid_location() {
      if (this.no_map) return !!this.receiver_info.address; // Only enter address!
      return (
        this.receiver_info.location &&
        !!this.receiver_info.location.lat &&
        !!this.receiver_info.location.lng
      );
    },

    // ---------- Lottery --------
    prize_available_variants() {
      if (!this.prize || !this.prize || !this.prize.product) return [];
      return this.prize.variant
        ? [this.prize.variant]
        : this.prize.product.product_variants;
    },

    club() {
      return this.getClub();
    },

    // ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Address Button (SHipping or Billing) ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅

    vendor_shipping_options() {
      return this.bill?.vendor_shipping_options;
    },
    store_shipping_options() {
      return this.bill?.store_shipping_options;
    },
    connect_shipping_options() {
      return this.bill?.connect_shipping_options;
    },
    /**
     * Check here all shipping methods are pickup!?
     */
    all_is_pickup() {
      if (
        !this.delivery_info ||
        this.connect_shipping_options
          ?.length /*In connect shipping mode always we ask shipping address*/
      )
        return false;

      if (this.vendor_shipping_options?.length) {
        return this.delivery_info.vendor_shippings.every(
          (vendor_shipping) =>
            vendor_shipping.type == ShopTransportations.Pickup.code,
        );
      }
      if (this.store_shipping_options?.length) {
        return (
          this.delivery_info.delivery_type == ShopTransportations.Pickup.code
        );
      }
      return false;
    },

    // ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ 🎗️ Subscription ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅
    subscription_prices() {
      return this.items.map((item) => item.subscription_price);
    },
    subscription_period() {
      return (
        this.subscription_prices.length && this.subscription_prices[0].period
      );
    },
    subscription_period_obj() {
      return (
        this.subscription_period && BillingPeriod[this.subscription_period]
      );
    },

    // ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Checkout Flow ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅
    user() {
      return this.USER();
    },
    busy_user() {
      return this.$store.getters.getBusyUser;
    },
    has_guest_payment() {
      return ShopOptionsHelper.HasGuestPayment(this.$shop);
    },
    enter_guest_email_error(){
      return   !this.user &&  this.has_guest_payment && !this.guest_email // Guest email is required!
    },

    // ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Kalio ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅
    /** How many things are in the basket (2 breads are 2). */
    units() {
      return this.items.reduce((sum, item) => sum + (item.count || 0), 0);
    },
    seller_count() {
      return new Set(this.items.map((item) => item.vendor_id || 0)).size;
    },
    /** Everything the shopper saves, for the receipt's pill. */
    saved_total() {
      return (
        (this.total_items_discount || 0) +
        (this.total_offers_amount || 0) +
        (this.cross_selling_discount > 0 ? this.cross_selling_discount : 0) +
        (this.discount_code_amount > 0 ? this.discount_code_amount : 0) +
        (this.customer_club_discount > 0 ? this.customer_club_discount : 0) +
        (this.coupon ? this.coupon_discount || 0 : 0) +
        (this.prize ? this.prize_discount || 0 : 0)
      );
    },
    address_line() {
      const info = this.receiver_info;
      if (!info) return "";
      return [
        info.address,
        info.no && t("basket.where.no", "No. {no}", { no: String(info.no) }),
        info.unit && t("basket.where.unit", "Unit {unit}", { unit: String(info.unit) }),
      ]
        .filter(Boolean)
        .join(", ");
    },
    /** "You save {amount}": the words before and after the price the
     *  template draws, so a language can put the amount where it reads. */
    save_words() {
      const text = t("basket.receipt.youSaveAmount", "You save {amount}");
      const at = text.indexOf("{amount}");
      return at < 0 ? [text + " ", ""] : [text.slice(0, at), text.slice(at + "{amount}".length)];
    },
    /** Every way the shop has to send this basket (shipping methods, pickup
     *  points), from the bill. */
    transportation_list() {
      const out = [];
      for (const option of this.store_shipping_options || []) out.push(...(option.transportations || []));
      for (const option of this.vendor_shipping_options || []) out.push(...(option.transportations || []));
      return out;
    },
    /** The Delivery method card shows when there is something to choose: a shipping
     *  method, a pickup point, or a delivery service. */
    show_when() {
      if (!this.has_delivery || this.isService || !this.bill) return false;
      if (this.connect_shipping_options?.length) return true;
      return this.transportation_list.some(
        (t) => t.type !== ShopTransportations.Pickup.code || t.pickups?.length,
      );
    },
    transportation_now() {
      const type = this.delivery_info?.type;
      return type ? this.transportation_list.find((t) => t.type === type) : null;
    },
    when_chip() {
      const info = this.delivery_info || {};
      const parts = [];
      if (info.date) {
        parts.push(formatDate(info.date, { weekday: "short", month: "short", day: "numeric" }));
      } else if (info.custom && info.days?.length && info.days.length < 7) {
        parts.push(info.days.map((day) => (WeekDays[day] ? this.$t(WeekDays[day].name).slice(0, 3) : day)).join(", "));
      }
      if (info.custom && info.time_spans?.length && info.time_spans.length < (this.transportation_now?.time_spans?.length || 99)) {
        parts.push(info.time_spans.map((span) => (TimeSpans[span] ? this.$t(TimeSpans[span].name) : span)).join(", "));
      }
      if (!parts.length && this.transportation_now && this.transportation_now.type !== ShopTransportations.Pickup.code)
        parts.push(t("shipping.anyTime", "Any time"));
      return parts.join(" · ");
    },
    when_text() {
      const way = this.transportation_now;
      if (!way) return t("basket.delivery.chooseHow", "Choose how it reaches you.");
      const name = this.transportationName(way);
      if (way.type === ShopTransportations.Pickup.code) {
        const place = this.receiver_info?.title || this.receiver_info?.name || this.receiver_info?.address;
        return place ? t("basket.delivery.pickupFrom", "Pickup from {place}.", { place }) : t("basket.delivery.method", "{name}.", { name });
      }
      return this.shipping_cost === 0 ? t("basket.delivery.methodFree", "{name}, free.", { name }) : t("basket.delivery.method", "{name}.", { name });
    },
    /* Walio: the four steps over the checkout. */
    steps() {
      const delivery = !this.has_delivery || this.isService || (this.is_valid_location && !this.error_message_payment);
      const contact = !!this.user || (this.has_guest_payment && !!this.guest_email && this.guest_email_ok);
      const list = [
        { key: "cart", label: "Basket", done: true },
        { key: "delivery", label: "Delivery", done: delivery },
        { key: "contact", label: "Contact", done: contact },
        { key: "pay", label: "Review & pay", done: false },
      ];
      const now = list.findIndex((s) => !s.done);
      return list.map((s, i) => ({ ...s, state: s.done ? "-done" : i === now ? "-now" : "" }));
    },
    detail_cards() {
      return (this.show_when ? 1 : 0) + (this.has_delivery ? 1 : 0) + 1;
    },
    guest_email_ok() {
      return !this.guest_email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.guest_email);
    },
    /** The ways to pay this basket: the shop's gateways in its currency
     *  (cash on delivery only when the delivery allows it), as Selldone's
     *  payment window lists them. null when the shop did not say. */
    payment_ways() {
      const gateways = this.$shop?.gateways;
      if (!Array.isArray(gateways)) return null;
      const currency = this.basket?.currency;
      return gateways.filter(
        (g) => g.enable !== false && (!currency || g.currency === currency) && (this.deliverySupportCOD || !g.cod),
      );
    },
    /** What still stands between the shopper and paying, in a line. */
    pay_blocker() {
      if (!this.user && !this.has_guest_payment) return t("basket.who.signInToOrder", "Sign in to place the order.");
      if (this.has_delivery && !this.is_valid_location) return t("basket.pay.needAddress", "Add your address to pay.");
      if (this.error_message_payment) return this.error_message_payment;
      if (this.enter_guest_email_error) return t("basket.pay.needEmail", "Add your email to pay.");
      if (!this.guest_email_ok) return t("basket.pay.checkEmail", "Check your email address.");
      if (this.bill && !this.can_pay) return t("basket.pay.cannotPay", "This bag cannot be paid yet.");
      if (
        this.payment_ways &&
        !this.payment_ways.length &&
        this.final_price > 0 &&
        !this.is_service_need_pricing &&
        !this.isSubscription
      )
        return t("basket.pay.noGateways", "This shop is not taking payments yet. Please check back soon.");
      return null;
    },
    can_press_pay() {
      return !this.pay_blocker && this.canPayAndComplete;
    },
    pay_label() {
      if (this.is_service_need_pricing) return this.$t("basket_page.pre_confirm_service");
      if (!this.user && !this.has_guest_payment) return t("common.signIn", "Sign in");
      if (this.has_delivery && !this.is_valid_location) return t("basket.addAddress", "Add your address");
      return t("basket.pay.label", "Pay");
    },
    pay_label_short() {
      return this.is_service_need_pricing ? this.$t("basket_page.pre_confirm_service") : this.pay_label;
    },
  },

  /**
   * ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
   *  🔷 Watch
   * ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
   */

  watch: {
    /* The tab names the stage: "Your bag", then "Checkout" (not "Open bag"). */
    nx_stage: {
      handler(stage) {
        this.setPageTitle(stage === "checkout" ? t("bakini.n.co.pageTitle", "Checkout") : t("basket.pageTitle", "Your bag"));
      },
      immediate: true,
    },
    /* The delivery sheet takes the focus (Tab and Esc work at once) and gives
       it back to "All details" on close; Esc closes it wherever the focus is. */
    delivery_sheet(open) {
      if (open) {
        this.nx_dl_opener = document.activeElement;
        this.nx_dl_esc = (e) => {
          if (e.key === "Escape") this.delivery_sheet = false;
        };
        document.addEventListener("keydown", this.nx_dl_esc);
        this.$nextTick(() => this.$refs.dlsheet?.focus({ preventScroll: true }));
      } else {
        document.removeEventListener("keydown", this.nx_dl_esc);
        if (this.nx_dl_opener && document.contains(this.nx_dl_opener)) this.nx_dl_opener.focus({ preventScroll: true });
        this.nx_dl_opener = null;
      }
    },
    map_dialog(val) {
      this.$store.commit("setForceHideNavigation", val);
    },
    address_sheet(val) {
      this.$store.commit("setForceHideNavigation", val);
    },

    prize(prize) {
      this.lottery_win_selected_variant =
        prize &&
        this.prize_available_variants &&
        this.prize_available_variants.length
          ? this.prize_available_variants[0]
          : null;
    },

    type(type) {
      if (type !== this.$route.params.type)
        this.$router.replace({ params: { type: type } });
    },
    "$route.params"(params) {
      this.resetToDefault(); // 🞇 Reset to default
      this.type = params.type;
    },

    //------------- Customer previous auto save -----------

    basket(basket) {
      //  console.log("Debug basket",'Change basket!',basket)
      this.loadFromBasket();
    },
  },
  /**
   * ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
   *  🔷 Component Lifecycle Section
   * ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
   */
  created() {
    //  console.log("Debug basket",'Create basket page.')
    this.center = this.$store.getters.getInitialLocation;

    this.type = this.$route.params.type;


    GtagEcommerce.MeasuringCheckoutSteps(this.basket, 0, "");

    this.loadFromBasket();
  },
  beforeUnmount() {
    if (this.nx_dl_esc) document.removeEventListener("keydown", this.nx_dl_esc);
  },
  mounted() {
    if (
      ShopOptionsHelper.HasMap(this.$shop) &&
      (!this.basket ||
        !this.basket.receiver_info ||
        !this.basket.receiver_info.location)
    )
      try {
        navigator.geolocation.getCurrentPosition((position, error) => {
          if (error) {
            console.error("Get current location", error);
            return;
          }

          if (this.basket?.receiver_info?.location) return; // Prevent lagged update location bug!
          //const userCoordinates = [position.coords.longitude, position.coords.latitude];
          this.center = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
        });
      } catch (e) {
        console.error(e);
      }
  },

  /**
   * ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
   *  🔷 Methods Section
   * ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
   */
  methods: {
    ShadeColor,

    // ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Kalio ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅
    transportationName(transportation) {
      return transportation.title || this.$t(ShopTransportations[transportation.type]?.name || transportation.type);
    },
    openAddress() {
      this.address_sheet = true;
    },
    onGuestEmail() {
      this.guest_email_touched = true;
      if (this.guest_email_ok) this.setBasketConfig();
    },
    /* Pay, or take the shopper to what is still missing. */
    onPay() {
      if (!this.user && !this.has_guest_payment) return this.NeedLogin();
      if (this.has_delivery && !this.is_valid_location) return this.openAddress();
      if (this.error_message_payment) return this.openAddress();
      if (this.enter_guest_email_error || !this.guest_email_ok) {
        this.guest_email_touched = true;
        const input = this.$el?.querySelector?.(".k-cart__input");
        input?.scrollIntoView({ behavior: "smooth", block: "center" });
        input?.focus({ preventScroll: true });
        return;
      }
      if (!this.canPayAndComplete || this.pay_blocker) {
        // Nothing to fill in: show the receipt's reason (out of view on a phone).
        this.$el?.querySelector?.(".k-cart__pay")?.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }
      if (this.is_service_need_pricing) return this.submitServiceOrder();
      this.goToPaymentBasket(null);
    },
    selectLottery(lottery) {
      // console.log("---selectLottery---", lottery);
      this.basket.lottery = lottery;
      this.$store.dispatch("setBasket", this.basket);
    },

    selectCoupon(coupon) {
      // console.log("---selectCoupon---", coupon);
      this.basket.coupon = coupon;
      this.$store.dispatch("setBasket", this.basket);
    },
    selectDiscountCode(discount_code) {
      // console.log("---selectDiscountCode---", discount_code);
      this.basket.discount_code = discount_code;
      this.$store.dispatch("setBasket", this.basket);
    },

    loadFromBasket() {
      if (!this.basket) return;

      //  console.log("watch ===> basket : Load saved values");

      // Prevent critical values be null:
      if (
        !this.basket.delivery_info ||
        Array.isArray(this.basket.delivery_info)
      )
        this.basket.delivery_info = {};
      if (
        !this.basket.receiver_info ||
        Array.isArray(this.basket.receiver_info)
      )
        this.basket.receiver_info = {};
      if (!this.basket.billing || Array.isArray(this.basket.billing))
        this.basket.billing = {};

      // this.receiver_info = Object.assign({}, this.basket.receiver_info); // Local Clone

      this.delivery_info = Object.assign({}, this.basket.delivery_info); // Local Clone

      this.billing = this.basket.billing;

      // Set map center:
      if (this.basket.delivery_info && this.basket.receiver_info.location) {
        //console.log("load-center-map", this.basket.receiver_info.location);
        this.center = {
          lat: this.basket.receiver_info.location.lat,
          lng: this.basket.receiver_info.location.lng,
        };
      }

      this.form = Object.assign({}, this.basket.form);

      this.guest_email=this.basket.guest_email;


      if (!this.bill) {
        // Fetch if not loaded!
        this.fetchBill();
      }
    },
    //---------------------------- Get Calculated Bill --------------------
    fetchBill() {
      // console.log("watch ===> basket : fetchBill");

      this.busy_bill = true;

      axios
        .get(window.XAPI.GET_BASKET_BILL(this.$shop.name, this.type))
        .then(({ data }) => {
          if (!data.error) {
            this.setBasketBill(this.basket, data.bill);
          } else {
            NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy_bill = false;
        });
    },
    //---------------------------- Update customer info set --------------------

    setBasketConfig() {
      this.PENDING_UPDATE = true;
      this.setBasketConfigThrottle();
    },
    setBasketConfigThrottle: throttle(
      function setBasketConfig() {
        this.PENDING_UPDATE = false;

        this.busy_save = true;
        //console.log("🧨 setBasketConfig");

        axios
          .put(
            window.XAPI.PUT_SET_BASKET_CONFIG(this.$shop.name, this.basket.id),
            {
              // currency:this.GetUserSelectedCurrency().code, // Not important! currency set in change currency api call! Guest + User
              receiver_info: this.receiver_info,
              delivery_info: this.delivery_info,
              billing: this.billing,
              form: this.form,
              guest_email: this.guest_email,
            },
          )
          .then(({ data }) => {
            if (!data.error) {
              if (this.PENDING_UPDATE) {
                console.log(
                  "⏳ Not update local basket because of pending update!",
                );
                return; // Update only on last function call to prevent jump back basket changes!
              }
              console.log("✅ Local cart updated.");

              // ➔ Update tax in basket (Only these items changed!)
              this.setBasketBill(this.basket, data.bill);

              // ➔ Update user delivery info:
              this.basket.receiver_info = data.receiver_info;
              this.basket.delivery_info = data.delivery_info;
              this.basket.billing = this.isObject(data.billing)
                ? data.billing
                : {}; // Solve return array!

              this.basket.form = data.form;

              this.basket.guest_email=data.guest_email
            } else {
              NotificationService.showErrorAlert(null, data.error_msg);
            }
          })
          .catch((error) => {
            NotificationService.showLaravelError(error);
          })
          .finally(() => {
            this.busy_save = false;
          });
      },
      3000,
      {
        leading: true, // Call immediately on the first call
        trailing: true, // Optional: Set to false if you don't want it called after the wait period
      },
    ),

    getCount(type) {
      let basket = this.getBasket(type);
      return basket && basket.items ? basket.items.length : 0;
    },

    getShopTransportationObject(type) {
      return ShopTransportations[type];
    },

    onClickSetLocation(info) {
      if (!info.phone) info.phone = this.USER() ? this.USER().phone : null; // Autofill phone!

      this.basket.receiver_info = info;
      this.map_dialog = false;
      this.address_sheet = false;

      this.setBasketConfig();

      GtagEcommerce.MeasuringCheckoutSteps(this.basket, 1, "");
    },

    showMap() {
      this.dialog_pre = false;
      this.$nextTick(() => {
        this.dialog_pre = true;
        this.$nextTick(() => {
          this.map_dialog = true;
        });
      });
    },

    //―――――――――――――――――――――― Final Step > Go to payment (Physical, Virtual, File) ――――――――――――――――――――

    goToPaymentBasket(gateway) {
      //―――――― 🎗️ Subscription ――――――
      // The payment process for subscription is different! We send permitted gateways from the backend.
      if (this.isSubscription) {
        if (!this.USER()) {
          // Force to log in for subscription.
          this.NeedLogin();
          return;
        }

        // Get list of gateways from subscription_price:
        const gateway_codes = this.items
          .map((item) => item.subscription_price?.gateway_code)
          .filter((g) => !!g)
          .unique();

        //  console.log('gateway_codes,',gateway_codes)

        this.ShowPaymentDialogSubscription(
          this.basket.currency,
          this.basket,
          this.bill,
          gateway_codes,
          /*Used for in site payment flow & free orders!*/
          (data) => {
            if (!this._isDestroyed)
              this.goToOrderInfo(this.type, data.target_id);
          },
        );
        return;
      }

      if (
        !this.USER() &&
        !ShopOptionsHelper.HasGuestPayment(this.getShop()) /*🥶 Guest*/
      ) {
        this.NeedLogin();
        return;
      }

      console.log(
        "🧨 goToPaymentBasket | Selected Gayteway: ",
        gateway,
        "Can COD: ",
        this.deliverySupportCOD,
      );
      /* Kalio (8 November 2026): a guest's order is bound to the device's
         guest code at the moment of buying, and Selldone's payment window
         saves that code for the order (so the order page opens it after the
         code rotates). It saves basket.code, which Selldone no longer sends
         with a guest's cart: nothing was saved, and a guest who had just
         ordered read "We can't open this order" (the owner's buyer test).
         Pass the device's guest code when the basket has none. */
      this.ShowPaymentDialogBasket(
        this.basket.code || (!this.USER() ? StorefrontLocalStorages.GetShopGuestCode() : undefined) /*🥶 Guest*/,
        this.basket,
        this.type,
        this.bill,
        this.lottery_win_selected_variant
          ? this.lottery_win_selected_variant.id
          : null,
        gateway,
        this.deliverySupportCOD,
        /*Used for in site payment flow & free orders!*/
        (data) => {
          if (!this._isDestroyed) this.goToOrderInfo(this.type, data.target_id);
        },
      );

      GtagEcommerce.MeasuringCheckoutSteps(this.basket, 2, gateway);
    },
    //―――――――――――――――――――――― Final Step > Submit service order (No payment here) (Service) ――――――――――――――――――――

    submitServiceOrder() {
      this.busy_submit = true;

      axios
        .post(
          window.XAPI.POST_SUBMIT_SERVICE_BASKET(this.$shop.name, this.type),
          {
            currency: this.GetUserSelectedCurrency().code,
            selected_variant_id: this.lottery_win_selected_variant
              ? this.lottery_win_selected_variant.id
              : null,

            code: this.basket.code /*🥶 Guest*/,
          },
        )
        .then(({ data }) => {
          if (!data.error) {
            // ▀▀▀▀▀▀▀▀▀ 🥶 Guest ▀▀▀▀▀▀▀▀▀
            if (!this.USER()) {
              // Save array of guest codes in local storage:
              StorefrontLocalStorages.AddCurrentGuestCodeToHistory(
                this.type,
                data.basket_id,
                data.code,
              );
            }

            this.fetchBasketAndShop();
            NotificationService.showSuccessAlert(
              t("basket.toast.submittedTitle", "Order submitted"),
              t("basket.toast.submittedText", "Your order has been submitted successfully. We will send bill to you."),
            );
            this.$router.push({
              name: "MyServiceOrderInfoPage",
              params: { basket_id: data.basket_id },
            });
          } else {
            NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy_submit = false;
        });
    },
  },
};
</script>
