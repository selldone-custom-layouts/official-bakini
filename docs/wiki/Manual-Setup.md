# Manual Setup

Set Bakini up on your shop yourself. Follow these steps in order, or let an agent do it: [Install with AI](Install-with-AI).

## 0. Before you start: sign-in

Set up your shop's **OAuth client id** first (in the shop dashboard's login / OAuth client settings, or with the Selldone MCP connector's `selldone_shop_client_list` and `selldone_shop_client_create`). Without it, sign-in on the Layout leaves for Selldone and shows an error.

Guest checkout, payment methods, delivery ways, pickup points, the checkout map and login modes are your settings. Bakini handles each choice; see [Shop Requirements](Shop-Requirements).

## 1. Get your own copy

Fork **selldone-custom-layouts/official-bakini** on GitHub (default branch `main`), then clone your fork and fetch Selldone's modules:

```bash
git clone https://github.com/<you>/<your-repo>.git
cd <your-repo>
npm run setup
for p in components translate; do git -C modules/$p apply ../../patches/modules-$p.kalio.patch; done
git remote add upstream https://github.com/selldone/storefront.git
git remote set-url --push upstream DISABLED
```

- `npm run setup` fetches Selldone's six modules into `modules/` (`core`, `components`, `translate`, `storefront-sdk`, `community-sdk`, `pagebuilder`, as listed in `.gitmodules`). Clone with git, not as a ZIP download: the setup needs a git repository.
- The two patches in `patches/` carry the Layout's fixes inside `modules/components` and `modules/translate`.
- `origin` is your repository.
- `upstream` is Selldone's official storefront, used to fetch updates only.
- Never change files inside `modules/*`. A fix there is kept as a patch in `patches/`.

## 2. Install

```bash
npm install --force
```

Node.js 22.15 or newer (the release scripts run `node --use-system-ca`). On Windows use Git Bash for the shell scripts.

## 3. Point development at your shop

Edit `.env`. These are public client values, read only in development; in production Selldone injects the shop that runs the Layout.

```dotenv
VITE_APP_SAMPLE_SHOP_NAME=<your shop handle>
VITE_APP_SAMPLE_SHOP_CUSTOM_HOME=shop
VITE_APP_SAMPLE_DEFAULT_CURRENCY=USD
VITE_APP_SAMPLE_DEFAULT_COUNTRY=US
VITE_APP_SAMPLE_DEFAULT_LANGUAGE=en
VITE_APP_DEV_SERVER_PORT=9135
```

The repository ships with `VITE_APP_SAMPLE_SHOP_NAME=bakio`, the showcase shop. Leave the `VITE_APP_SAMPLE_THEME_COLOR_*` lines as they are: the Layout's colours come from its theme file (step 4).

`VITE_KALIO_ACCOUNT` (in `.env` and `.env.development.local`) is no longer read. Bakini always builds the same account desk: Overview, Orders, Addresses and Profile, with Selldone's other sections (saved, wallet, gift cards, returns, reviews) as small links under the side menu.

## 4. Your name and theme

- **Name:** the wordmark is your **shop's title**, drawn by `components/bakini/BakiniLogo.vue` in lower case, Instrument Serif, its last part in italic, then a small gold dot ("bakio" → "bak" + italic "io"; a title of several words puts its last word in italic). Change the title in the Selldone dashboard and the Layout follows. `BRAND.name` in `components/kalio/kalio-brand.ts` is `null`; a string there replaces the shop's title everywhere the storefront names the shop.
- **Mark:** the tab icon and the avatar on order messages are drawn from the title's first letter (`markFor` in `components/kalio/kalio-brand.ts`): an italic serif letter, ivory on the dark stage, with the gold dot. It is an inline SVG, so there is no image file to replace.
- **Theme:** `components/bakini/bakini-theme.settings.ts`, the one file for colours, dark or light and the visitor switcher. See [Theme and colours](Theme-and-colours).

## 5. Run it

```bash
npm run serve
```

Open <http://localhost:9135>. Check the home, a collection, a product page, the bag, the checkout and the account against your shop. If a section is missing or a pastry sits on a square, see [Shop Requirements](Shop-Requirements).

## 6. Give the Layout your identity

In `manifest.json`:

```json
{
  "deploy_server": "https://layouts.selldone.com",
  "deploy_path": "",
  "package": "mybakery-noir",
  "name": "Mybakery Patisserie",
  "version": "1.0.0",
  "storefront": true,
  "backoffice": false,
  "description": "One sentence about your storefront."
}
```

- `package`: lowercase, unique to you, and **permanent after the first upload**.
- `name`: at least 8 characters.
- `version`: new for every upload, never reused.
- `deploy_server` and `deploy_path`: leave them as they are. The upload sends only `package`, `version`, `name`, `description`, `storefront` and `backoffice`.

## 7. Release and go live

1. [Build and Upload](Build-and-Upload). The first time: `SELLDONE_CLI_SRC=<cli clone> bash scripts/release.sh 1.0.0 desk`. After that, with the id printed after the first upload: `LAYOUT_ID=<your Layout id> SELLDONE_CLI_SRC=<cli clone> bash scripts/release.sh <new version> desk`.
2. [Go Live](Go-Live): pin the exact version on one domain of your shop first (or on the whole shop), and set Home to the shop page.

## 8. Keep up with Selldone

```bash
git fetch upstream main --tags --prune
git merge --no-ff upstream/main
```

Resolve conflicts by keeping Bakini's templates and Selldone's logic. Then re-apply the patches if the modules changed:

```bash
git -C modules/components apply ../../patches/modules-components.kalio.patch
git -C modules/translate apply ../../patches/modules-translate.kalio.patch
```

A patch that no longer applies must be redone by hand, not skipped.
