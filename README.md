# PinchBar landing page

A static marketing page for PinchBar (by MacPaw, on Setapp). Plain HTML, CSS and vanilla JS — no build step.

## Run locally

```bash
python3 -m http.server 4174
```

Then open http://127.0.0.1:4174

## Files
- `index.html` — the page. Sections in order: nav, hero (animated panel + 4 callouts), trust strip, why (3 cards), feature story 01–04 with a sticky index, "Try an action" demo (dark band), how it works, comparison (stats + the 10 built-in actions with shortcuts), custom actions (4 example actions), get PinchBar + credits card, free trial via Setapp, FAQ (8), final CTA, footer.
- `assets/styles.css` — design tokens on `:root` (colors, type, spacing, radius, shadow, motion), then components and sections.
- `assets/main.js` — mobile menu (animated), staggered scroll reveal, lazy-image fade-in, sticky chapter index, animated FAQ accordion, the hero panel loop, and the demo (pre-written outputs).
- Hero panel (`.pb` in `index.html`, styles under "hero: animated PinchBar panel") — an HTML/CSS replica of the PinchBar panel, not a video. It scales with its container (`cqi` units), loops: a new copy arrives, then Fix & Native, Translate, Shorten and Draft Reply run on it, credits tick down. Pauses when off-screen, when the tab is hidden, or with the pause button; with reduced motion it shows the static Fix & Native result. Callouts are pinned to the parts they label by JS.
- `assets/fonts/` — Plus Jakarta Sans (all text; variable font instanced to weights 400–700 and subset to Latin, ~19 KB, preloaded) and JetBrains Mono (shortcut keys, step numbers, kickers). Both woff2, OFL, from the google/fonts repository.
- `assets/img/` — app icon (from the app's `AppIcon.appiconset`), favicons, `og.png` (1200×630, rendered from the page CSS in Plus Jakarta Sans).
- `assets/shots/` — real app screenshots as WebP, 2–3 sizes each. Not used on the page right now (kept for reuse): `panel-fix-native-*` (hero screenshot before the animated panel), `settings-history-*`, `settings-shortcut-*`.
- `raw/` — full-size PNG originals. Gitignored, not committed.

## Style
Layout follows marketer.com (thin vertical rules, hairline section dividers, two-tone headlines, split hero, sticky 01–04 index, one dark band, two-column FAQ, pill buttons with a green arrow chip), recoloured with PinchBar pink: accent `#8F4F7D`, accent-soft `#F3BADA`, blush panels `#FBEFF5→#EFCFE0` with grain, plum `#2B1626`, paper `#FFFEFB`, ink `#0D0D0D`, muted `#737373`, rules `#EBEAE6`. Button arrow chip green `#3CCF83` (`--go`); on hover the chip grows with a green ring and the arrow slides through.

Type is sans-serif only: Plus Jakarta Sans for headlines and body, JetBrains Mono only for shortcut keys, step numbers and kickers.
- Headlines (display, h2, h3, card and step titles, trust strip values, stats, the price "Free", FAQ questions, mobile menu links) are weight 600 with negative tracking (display −0.035em, h2 −0.03em, h3 −0.025em) and tight line height (1.02–1.2).
- Two-tone headlines: ink, then muted grey (`.dim`). The hero and final CTA use the accent colour on the second phrase (`.display em`), upright, kept on one line.
- Body text is weight 400, line height 1.6.

## Versions
- `v1-first-build` (tag) — first full build.
- `v2-verified` (tag) — after the Step 5 checks (fonts trimmed, tap targets, OG image).
- `v3-sans` (tag) — sans-serif only (Plus Jakarta Sans replaces Newsreader and Hanken Grotesk), new OG image, mobile menu height fix.
- `v4-motion` (tag) — animated hero panel, green button chips, smoother motion (reveals, menu, FAQ), hero headline fit, tick alignment, pricing/FAQ copy.
- `v5-cursor` (tag) — hero cursor no longer jumps on click (position via `translate`, press `scale: .9` around the arrow tip).
- `v6-actions` (tag) — demo actions on one row (2×2 on phones), step 01 tag adds the bonus credits, the 10 built-in actions listed in Compare, new Custom actions section.

## Verification (2026-10-05, re-run for v6-actions)
- Full-page screenshots at 360, 768, 1024, 1280 and 1536 in Chromium and WebKit: no horizontal scroll, no console errors, no overflow or clipping in the hero callouts.
- Menu, demo tabs (incl. arrow keys), action buttons and FAQ clicked through in both engines.
- Lighthouse mobile (served with gzip via `npx serve`): Performance 100, Accessibility 100, Best Practices 100, SEO 100 (v6-actions; CLS 0, LCP 1.6 s). Reduced motion checked in both engines. With plain `python3 -m http.server` (no compression) Performance is ~89.

## Screenshots and demo content
Captured from PinchBar 1.0.16 (Debug build) running in an isolated home folder, so real data was untouched. The UI is dark (the app doesn't follow light mode).
- The texts in the screenshots and in the demo (team email, Priya's backpack message, Monday sync notes, the six-month study of 40 product teams, the `sk-demo` token) are invented demo content, not claims.
- The credit balance in the panel footer (31,0xx of 41,000) is a real test balance and was left unblurred on purpose.
- The custom-action examples (Release Notes, Bug Report, Friendlier Tone, the British-spelling edit to Fix & Native) are written for the page, not shipped with the app. The one-line action descriptions in Compare are paraphrased from the built-in prompts in `Models/PromptTemplate.swift`.
- The demo outputs are pre-written and labelled "Example output". The Fix & Native output for the team email matches the real result in the hero screenshot; the others are written by hand.
- Setapp step images are captures of the public pages `account.setapp.com/get-free/apps/pinchbar` and `setapp.com/apps/pinchbar`, cropped to leave out Setapp's rating badge.

## Facts checked in the app code
- Panel shortcut Control+C (`Utilities/Constants.swift`); action shortcuts Control+1…0.
- Default provider Setapp AI (`Models/AppSettings.swift`).
- Apple Intelligence runs on-device via `LanguageModelSession` and makes no Setapp calls, so it spends no credits (`Services/FoundationModelsService.swift`; Settings labels it "On-device · Private · Free").
- History keeps 200 items by default, minimum limit 10, set as a number in Settings → General (`AppConstants.defaultMaxHistory`, `minAllowedMaxHistory`).
- Secrets are saved as locked cards, OTP codes are skipped, and copies from 1Password, Keychain Access, Passwords, LastPass, Bitwarden, Dashlane, KeePassXC and System Settings are ignored (`Models/CaptureRule.swift`).
- Selected Text Actions: the result window's buttons are Copy and **Paste Text** (`SelectionOutputPanelView.swift`).

## Before launch (TODOs)
Search the code for `TODO` to find each spot.
- **Domain:** `pinchbar.app` is confirmed; remove the `TODO(copy)` notes next to the canonical and `og:image` tags when publishing.
- **Footer links:** Support, Privacy and Terms point to `#`. Confirm the legal entity in the copyright line ("MacPaw Way Ltd.").
- **Logos:** MacPaw, Setapp and Apple Intelligence appear as text only. Swap in official logos once brand use is approved (no Apple logo).
- **TODO(asset):** a screenshot of the Setapp desktop app installing PinchBar would be a better Step 2 image than the store page.
- **Screenshot note:** the AI Provider crop (credits card) shows the Apple logo on the Apple Intelligence card, as the app's UI does. Replace if brand review objects.
- **Hosting:** turn on compression and long cache headers for `/assets/` (Lighthouse flags caching on local servers). Bump the `?v=` query on `styles.css`/`main.js` on every publish.

## [UNVERIFIED]
- "Most Mac apps where you can select text, including browsers and chat apps" (FAQ) — based on the code and recent fixes for web/Electron hosts, not a full app-compatibility test.
- "Use Google, Apple or your email" (Setapp step 1) — from the Setapp sign-in page as of 2026-10-05.
