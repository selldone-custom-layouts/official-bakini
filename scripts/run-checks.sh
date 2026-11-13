#!/usr/bin/env bash
# Every kit check, one after the other (never two browsers on the shop at once: 429),
# each into its own log, then one line per check with its TOTAL.
#
# usage: bash scripts/run-checks.sh <base-url> <log-folder> [checks]
#   checks: comma list of names below (default: all)
# Needs MSYS_NO_PATHCONV=1 on Git Bash (set here). Dev: http://localhost:9135 · live: https://bakini.selldone.shop
set -u
export MSYS_NO_PATHCONV=1
BASE="${1:-http://localhost:9135}"
OUT="${2:-check-logs}"
ONLY="${3:-}"
KIT="$(cd "$(dirname "$0")/../.." && (pwd -W 2>/dev/null || pwd))/new-shop-kits"
ROOT="$(cd "$(dirname "$0")/.." && (pwd -W 2>/dev/null || pwd))"
mkdir -p "$OUT"
WAIT=".ftr"
SK='bakini-theme'
DARK="{\"$SK\":\"{\\\"palette\\\":\\\"caramel\\\",\\\"mode\\\":\\\"dark\\\"}\"}"
LIGHT="{\"$SK\":\"{\\\"palette\\\":\\\"caramel\\\",\\\"mode\\\":\\\"light\\\"}\"}"
YELLOW="{\"$SK\":\"{\\\"palette\\\":\\\"custom\\\",\\\"custom\\\":\\\"#ffff00\\\",\\\"mode\\\":\\\"dark\\\"}\"}"
AR="{\"local-shop-bakio\":\"ar\"}"
PAGES_ALL='home=/,category=/croissants-category,deals=/?filter={"only_has_discount":true},search=/?search=pistachio,product=/product/720375,product2=/product/720359,compare=/comparison?list=p720375_p720378_p720380,blog=/blog,about=/about-us,terms=/terms,privacy=/privacy,contact=/contact-us,faq=/faq,404=/no-such-page,cart=/basket/PHYSICAL,account=/user'
PAGES_MAIN='home=/,category=/croissants-category,deals=/?filter={"only_has_discount":true},search=/?search=pistachio,product=/product/720375,compare=/comparison?list=p720375_p720378_p720380,blog=/blog,404=/no-such-page'

want() { [ -z "$ONLY" ] || [[ ",$ONLY," == *",$1,"* ]]; }
run() { # name, command...
  local name="$1"; shift
  want "$name" || return 0
  echo "▶ $name"
  ( "$@" ) > "$OUT/$name.log" 2>&1
  printf '%-28s %s\n' "$name" "$(grep -E '^(TOTAL|PROBLEMS)' "$OUT/$name.log" | tail -1 || true)" | tee -a "$OUT/summary.txt"
}

run ring-dark   env PAGES="$PAGES_ALL" STORAGE="$DARK"  node "$KIT/single-vendor-shop/ring-sweep.cjs" "$BASE" "$WAIT"
run ring-light  env PAGES="$PAGES_ALL" STORAGE="$LIGHT" node "$KIT/single-vendor-shop/ring-sweep.cjs" "$BASE" "$WAIT"
run card-edge   node "$KIT/single-vendor-shop/card-edge-check.cjs" "$BASE/" "$BASE/#cat" "$BASE/?search=pistachio" "$BASE/?filter=%7B%22only_has_discount%22%3Atrue%7D"
run card-edge-noir-dark  env STORAGE="$DARK"  node "$ROOT/scripts/card-edge-noir.cjs" "$BASE/" "$BASE/#cat" "$BASE/?search=pistachio" "$BASE/?filter=%7B%22only_has_discount%22%3Atrue%7D" "$BASE/blog" "$BASE/about-us" "$BASE/faq" "$BASE/contact-us"
run card-edge-noir-light env STORAGE="$LIGHT" node "$ROOT/scripts/card-edge-noir.cjs" "$BASE/" "$BASE/#cat" "$BASE/?search=pistachio"
run corner      env PAGES="$PAGES_MAIN" STORAGE="$DARK" node "$KIT/single-vendor-shop/corner-clear-check.cjs" "$BASE" "$WAIT"
run circle      env PAGES='home=/,deals=/?filter={"only_has_discount":true}' LONG=1 node "$KIT/single-vendor-shop/circle-fit-check.cjs" "$BASE" "$WAIT"
run circle-ar   env PAGES='home=/' LONG=1 STORAGE="$AR" node "$KIT/single-vendor-shop/circle-fit-check.cjs" "$BASE" "$WAIT"
run contrast-dark   env PAGES="$PAGES_ALL" STORAGE="$DARK"   node "$ROOT/components/theme-switcher/tools/contrast-audit.cjs" "$BASE" "$WAIT"
run contrast-light  env PAGES="$PAGES_ALL" STORAGE="$LIGHT"  node "$ROOT/components/theme-switcher/tools/contrast-audit.cjs" "$BASE" "$WAIT"
run contrast-yellow env PAGES="$PAGES_MAIN" STORAGE="$YELLOW" node "$ROOT/components/theme-switcher/tools/contrast-audit.cjs" "$BASE" "$WAIT"
run contrast-states-dark  env PAGES='home=/' STORAGE="$DARK"  OPEN='(async () => { const b = document.querySelector(innerWidth < 761 ? ".menu-btn" : ".bag-btn"); if (!b) return "FAIL no button"; b.click(); return true; })()' node "$ROOT/components/theme-switcher/tools/contrast-audit.cjs" "$BASE" "$WAIT"
run contrast-states-light env PAGES='home=/' STORAGE="$LIGHT" OPEN='(async () => { const b = document.querySelector(innerWidth < 761 ? ".menu-btn" : ".bag-btn"); if (!b) return "FAIL no button"; b.click(); return true; })()' node "$ROOT/components/theme-switcher/tools/contrast-audit.cjs" "$BASE" "$WAIT"
run contrast-signin-dark  env PAGES='home=/' STORAGE="$DARK" OPEN='(async () => { const sleep = (ms) => new Promise((r) => setTimeout(r, ms)); if (innerWidth < 761) { document.querySelector(".menu-btn").click(); await sleep(500); const s = [...document.querySelectorAll(".pmenu button")].find((x) => /Sign in/i.test(x.textContent)); if (!s) return "FAIL no sign-in row"; s.click(); } else { document.querySelector(".acct-btn").click(); await sleep(500); const s = [...document.querySelectorAll(".acct-pop button")].find((x) => /Sign in/i.test(x.textContent)); if (!s) return "FAIL no sign-in button"; s.click(); } await sleep(1500); return true; })()' node "$ROOT/components/theme-switcher/tools/contrast-audit.cjs" "$BASE" "$WAIT"
run contrast-ar     env PAGES="$PAGES_MAIN" STORAGE="$AR" node "$ROOT/components/theme-switcher/tools/contrast-audit.cjs" "$BASE" "$WAIT"
run cart-dark   env SHOP=bakio WAIT="$WAIT" CART=".bag-btn" STORAGE_KEY="$SK" node "$ROOT/components/theme-switcher/tools/cart-audit.cjs" "$BASE" caramel dark
run cart-light  env SHOP=bakio WAIT="$WAIT" CART=".bag-btn" STORAGE_KEY="$SK" node "$ROOT/components/theme-switcher/tools/cart-audit.cjs" "$BASE" caramel light
run currency    env SHOP=bakio MENU=".menu-btn" MEGA=".hdr-nav [aria-controls=mega]" CART=".bag-btn" CATEGORY=/croissants-category DEALS='/?filter={"only_has_discount":true}' node "$ROOT/components/region-switcher/tools/currency-check.cjs" "$BASE" "$WAIT"
run box-dark    env STORAGE="$DARK"  node "$ROOT/scripts/box-check.cjs" "$BASE" "$WAIT"
run box-light   env STORAGE="$LIGHT" node "$ROOT/scripts/box-check.cjs" "$BASE" "$WAIT"
run box-ar      env STORAGE="$AR" STATES=0 node "$ROOT/scripts/box-check.cjs" "$BASE" "$WAIT"
run underline-dark  env STORAGE="$DARK"  node "$ROOT/scripts/underline-check.cjs" "$BASE" "$WAIT"
run underline-light env STORAGE="$LIGHT" WIDTHS=1440 node "$ROOT/scripts/underline-check.cjs" "$BASE" "$WAIT"
run ring-ar     env PAGES="$PAGES_MAIN" STORAGE="$AR" node "$KIT/single-vendor-shop/ring-sweep.cjs" "$BASE" "$WAIT"
echo "done"
