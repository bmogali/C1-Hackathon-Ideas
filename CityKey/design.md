# Capital One Design Language Reference

Extracted from a scan of [capitalone.com](https://www.capitalone.com) (July 2026) — colors, typography, and voice observed directly in the live homepage HTML/CSS. Use this as the design foundation for CityKey to keep it on-brand.

---

## 1. Color Palette

### Primary brand colors

| Token | Hex | Usage observed |
|---|---|---|
| Core Blue (interactive) | `#0276B1` | Links, primary buttons, interactive elements — the most-used brand color on the page |
| Deep Navy | `#013D5B` | Headers, dark hero backgrounds, footer, emphasis text |
| Brand Red | `#CC2427` | Accents, alerts, the red swoosh of the logo (official logo red is `#D03027`) |
| Ink (near-black) | `#141414` | Body text — the single most frequent color on the page |
| White | `#FFFFFF` | Backgrounds, text on dark surfaces |

### Secondary blues (hover / pressed states)

| Token | Hex | Usage |
|---|---|---|
| Blue – hover | `#026597` | Button/link hover state |
| Blue – pressed | `#014E74` | Active/pressed state |

### Neutrals (grayscale ramp)

| Token | Hex | Usage |
|---|---|---|
| Gray 100 | `#F4F4F4` | Section backgrounds, cards |
| Gray 200 | `#EBEBEB` / `#E6E6E6` | Dividers, subtle fills |
| Gray 300 | `#D4D4D4` | Borders, input outlines |
| Gray 500 | `#7D7D7D` / `#696969` | Secondary/muted text |
| Gray 700 | `#3D3D3D` | Strong secondary text |
| Gray 900 | `#1F1F1F` | Near-black surfaces |

### Accent colors (used sparingly)

| Token | Hex | Usage |
|---|---|---|
| Teal | `#42B6C9` | Illustration accents, highlights |
| Bright Cyan | `#2AC7E1` | Illustration accents |
| Green | `#88B131` | Positive/financial-wellness accents |

**Rules of thumb**
- Ink `#141414` on white for body copy; never pure black.
- One interactive color: everything clickable is Core Blue `#0276B1`.
- Red is reserved for the brand mark and rare emphasis — it is *not* a UI action color.
- Dark sections use Deep Navy `#013D5B`, not gray or black.

---

## 2. Typography

### Typeface

**Optimist** — Capital One's proprietary sans-serif, served as `woff2` in four weights.

```css
font-family: Optimist, "Helvetica Neue", Helvetica, Arial, sans-serif;
```

For a hackathon build without licensed access to Optimist, the fallback stack alone works, or use a similar open humanist sans (e.g. **Inter** or **Source Sans 3**).

### Weights in use

| Weight | File | Usage |
|---|---|---|
| 200 (Extra Light) | `Optimist_W_XLt.woff2` | Large display headlines |
| 300 (Light) | `Optimist_W_Lt.woff2` | Headlines, hero copy (most common declared weight) |
| 400 (Regular) | `Optimist_W_Rg.woff2` | Body text |
| 600 (Semibold) | `Optimist_W_SBd.woff2` | Buttons, labels, nav items, emphasis |

**Rules of thumb**
- Headlines are *light* (300), large, and dark navy or ink — not bold. The brand reads calm and confident, not shouty.
- Bold moments come from Semibold (600), used on CTAs and small labels; 700+ is essentially absent.
- Sentence case everywhere — headlines, buttons, and nav ("Check My Eligibility" being a rare title-case exception for CTAs).

---

## 3. Brand Voice

### Tone

Conversational yet authoritative. Customer-centric and empowering, never institutional or jargon-heavy. Speaks *to* you ("your credit", "you can actually use"), leads with benefit, and quantifies friction removed ("90 seconds, no credit score impact").

### Observed headline patterns

- "Take charge of your credit" — empowerment, imperative verb first
- "Bank with confidence" — trust, short imperative
- "Find a car you love" — lifestyle, emotional
- "Unlimited miles you can actually use" — benefit + plainspoken qualifier

### Voice rules

1. **Imperative verb first**: Take, Find, Bank, Explore, Compare, Start, Get.
2. **Second person, plain words**: "you/your" in nearly every line; no fintech jargon.
3. **Benefit before feature**: what the customer gets, then how.
4. **Disarm friction explicitly**: "for free", "no credit score impact", "in 90 seconds".
5. **Short**: headlines ≤ 7 words; CTAs 2–4 words.

### CTA copy style

"Check My Eligibility" · "Compare credit cards" · "Explore banking" · "Start shopping" · "Get CreditWise for free" — verb-led, specific, no generic "Learn more" as a primary action.

---

## 4. Imagery & Iconography

- **Photography**: lifestyle shots of diverse, real-feeling people — traveling, working, holding cards. Warm and candid, not stocky-corporate.
- **Illustration**: minimal, modern flat vector icons (piggy banks, handshakes, car keys) using the teal/cyan/green accent palette.
- **Mix**: photography for hero/emotional moments, illustration for features and utility sections.

---

## 5. Layout & Components

- **Navigation**: slim top bar — product categories (Credit Cards, Checking & Savings, Auto, Business, Commercial, Benefits & Tools) plus utility links (Help Center, Locations, Sign In) and global search.
- **Hero**: prominent secure sign-in module alongside the marketing headline — utility and marketing share the top fold.
- **Sections**: alternating white / Gray-100 `#F4F4F4` bands; occasional Deep Navy band for contrast.
- **Cards**: white surfaces on gray backgrounds, subtle borders (`#D4D4D4`), generous padding, rounded corners.
- **Buttons**: pill/rounded, solid Core Blue `#0276B1` primary with white Semibold text; hover darkens to `#026597`, pressed `#014E74`. Secondary buttons are blue-outlined on white.
- **Trust patterns**: explicit reassurance moments — e.g. an exit-warning modal ("You are now leaving the Capital One website") and "no credit score impact" microcopy near any action that sounds risky.

---

## 6. Quick-start tokens (CSS)

```css
:root {
  /* Brand */
  --c1-blue: #0276b1;
  --c1-blue-hover: #026597;
  --c1-blue-pressed: #014e74;
  --c1-navy: #013d5b;
  --c1-red: #cc2427;

  /* Text & surfaces */
  --c1-ink: #141414;
  --c1-text-muted: #696969;
  --c1-surface: #ffffff;
  --c1-surface-alt: #f4f4f4;
  --c1-border: #d4d4d4;

  /* Accents */
  --c1-teal: #42b6c9;
  --c1-cyan: #2ac7e1;
  --c1-green: #88b131;

  /* Type */
  --c1-font: Optimist, "Helvetica Neue", Helvetica, Arial, sans-serif;
}
```
