# Build and Upload

Every release is a **new version** of your Layout on Selldone. `scripts/release.sh` runs every step in order; this page explains each one.

## One-time setup

```bash
npm i -g selldone-cli                                        # the official CLI
git clone https://github.com/selldone/cli selldone-cli-src   # its packager lives in .agents/
```

Sign in to the CLI once:

1. Run `selldone`.
2. Choose **Login | Login to your Selldone account.**
3. Approve the sign-in in your browser and type your **2FA code** in the terminal.

`selldone login` is not a command. The sign-in is saved in `~/.selldone-dev/.persist`; if that file is empty, every upload answers 401 until you sign in again.

You also need Python 3 (for the packager), Node.js 22.15 or newer (the scripts run `node --use-system-ca`) and Bash with `file`, `unzip` and `cmp` (Git Bash on Windows has them).

## Release

The first upload creates your Layout. Leave `LAYOUT_ID` out:

```bash
SELLDONE_CLI_SRC=../selldone-cli-src bash scripts/release.sh 1.0.0 desk
```

Note the Layout id printed after it (it is also in the Selldone developer panel). Every later release:

```bash
LAYOUT_ID=<your Layout id> SELLDONE_CLI_SRC=../selldone-cli-src \
  bash scripts/release.sh <new version> desk
```

The arguments:
- the **new version**, never used before;
- `desk`, the account design argument of the shared script. Bakini no longer reads it (`VITE_KALIO_ACCOUNT`): its account desk is the same either way.

The variables:
- `SELLDONE_CLI_SRC`: your clone of [selldone/cli](https://github.com/selldone/cli) (required);
- `SELLDONE_CLI`: the installed CLI, by default `$(npm root -g)/selldone-cli`;
- `LAYOUT_ID`: with it, the script also checks the upload on the server.

## What the script does, and why

| Step | Why |
| --- | --- |
| Bump `version` in `manifest.json` | A version number is used up even when an upload fails. Never reuse one. |
| `npm run build-production` | Outputs `dist/app/shop.js`, one stylesheet `dist/app/shop.css` and the chunks, with a **relative base**. Releases are served from `cdn.selldone.com/public/layouts/<id>/releases/<ULID>/app/`. Bakini ships no photo files: every picture is the shop's own. |
| `rm -f dist/index.html` | Every ZIP member must be under `app/`. In production the Layout runs inside Selldone's HTML, so `index.html` is never used. The fonts (Instrument Serif, Manrope) load from the app code (`components/kalio/kalio-fonts.ts`). |
| `scripts/kalio-svg-flatten.mjs` | Selldone accepts only passive SVG attributes. `style`, `<style>`, `xml:space`, `enable-background`, `display`, `fx/fy`, `data-*` and character references in values are refused. |
| MIME check (`file --mime-type`) | Selldone stores the MIME type it sniffs. A chunk starting with `import{` is stored as `text/x-java`, which browsers refuse. Every chunk starts with `"use strict";` (`sniffAsJavaScript` in `vite.config.ts`). |
| No `../shop.js` imports | Selldone's loader reaches `shop.js` through a redirect. A chunk importing `../shop.js` loads the app twice: an old page flashes, then the page goes blank. Shared code lives in a `core` chunk (`coreChunk` in `vite.config.ts`). |
| File count under ~360 | The archive is extracted inside the upload request, behind a ~100 s limit. At 714 files it was cut off mid-way and the version was burned. Bakini's first release had 354 files, close to the limit: SVGs up to 16 KB and small PNG/JPG icons up to 12 KB ride inline, fonts ship as WOFF2 only and country flags load from jsDelivr (all in `vite.config.ts`). A new dependency can push it over. |
| `package_layout.py … --force` | Without `--force`, an old `dist.zip` is kept and it still prints PASS. |
| `cmp` of `shop.js` | Proves the ZIP is this build. |
| `scripts/kalio-deploy.mjs` | Uploads with the official CLI's sign-in and checks, sending only the six manifest fields the server accepts. |
| `scripts/kalio-verify-deploy.mjs` | Asks the server: the newest deploy must show `extracting:false`, `error:null`, `js_match:true` and `css_match:true`. **A CLI exit code is not proof.** |

To check an upload again later:

```bash
node --use-system-ca scripts/kalio-verify-deploy.mjs <selldone-cli root> <your Layout id> dist/app
```

It prints the two newest deploys, each with its release path.

## Upload rules found by testing (November 2026)

- `manifest` holds only `package, version, name, description, storefront, backoffice`.
- No spaces or brackets in any file name (`safeName` in `vite.config.ts`).
- The `package` name never changes after the first upload.
- An upload creates a **beta** version. Your shop doesn't change until you attach it: see [Go Live](Go-Live).

## Restyling from the mockup

Bakini's look comes from five mockup stylesheets, converted by `scripts/noir-css.cjs` into `style/noir/*.css` (generated, scoped to `.nx`). They are part of the repository, so a normal release needs nothing extra. Run the script again only after a change to the mockup itself: `node scripts/noir-css.cjs <path to the mockup's b/ folder>`. Never edit `style/noir/` by hand; see [Customize](Customize#styles).

## Preview a release before it is live

```bash
node --use-system-ca scripts/kalio-live-preview.mjs <release-ULID> 9125
```

This serves a shop's real HTML with the loader pointed at that release, on `http://localhost:9125`. The ULID is in the release path that `kalio-verify-deploy.mjs` prints. It reads the Bakini showcase shop unless you name yours: `SHOP_URL=https://<your handle>.myselldone.com node --use-system-ca scripts/kalio-live-preview.mjs <release-ULID> 9125`.
