# Spec: Card-Linked Offers Nearby

**Project:** Venture Key (Venture Planner + City Key)
**Doc status:** Implementation spec for the hackathon prototype — covers both the web build (`index.html` + `js/*`) and the native iOS build (`ios/VentureKey/*.swift`)
**Why this doc exists:** Capital One Offers is a real, shipping product with a specific mechanic — *activate before you spend, credit posts after you spend* — that's easy to flatten into "instant discount" if you're not careful. This spec keeps the mechanic honest and gives City Key's "the card becomes a key to the city" moment a third unlock (alongside Velocity Black tables and Entertainment presales) that requires zero merchant integration, because Capital One already runs the offers network.

---

## 1. The integration thesis

| Capital One Offers capability (real, shipping today) | What Venture Key does with it |
|---|---|
| Curated merchant offers ("5% back at X," "3x miles first $50 at Y"), browsable by category/location | Surface a short, destination-scoped list — **not** every merchant in the city, a handful matched to the trip |
| **Activate before you spend** — tapping an offer flags it to the card; it does nothing retroactively | City Key's Activate button is a card-side flag only. No booking, no reservation, no external checkout |
| Purchase at an enrolled merchant with the linked card | The scripted swipe stream (already MCC + zip tagged, see `js/citykey.js:logEvent`) is the trigger — no new plumbing, just a match check against activated offers |
| Statement credit / bonus miles post **after settlement**, typically within a few days in the real product | Prototype shows it same-session for demo pacing, but copy is honest that real credit isn't instant (§7) |

**The line that keeps this distinct from everything else already built:** Capital One Shopping is pre-trip and product-shaped (buy a power adapter, a rain shell, browser-extension cash back at online checkout). Capital One Offers here is in-destination and merchant-shaped (spend at a real place near where you are, get a credit back later). They should never share a button or a buy flow.

---

## 2. Where it shows up

Gated to the same signal City Key already uses to know a trip is real — **ARMED or LIVE** (a destination is known). Dormant/no-trip has no offers to be near.

```
┌────────────────────────────────────┐
│  CITY KEY / LIVE TAB                │
│  (existing spend rail + Line)       │
│                                      │
│   Destination spend  ▸ unchanged    │
│   ─────────────────────────────     │
│   ▸ NEW: Nearby offers rail         │
│     (horizontal scroll, 4–6 cards)  │
│   ─────────────────────────────     │
│   The line                          │
│   (existing timeline, unchanged)    │
└────────────────────────────────────┘
```

Also a compact 3-card teaser on the Plan tab's destination hub (below Shopping's Trip Intelligence), CTA "See all nearby offers →" deep-links into City Key's full rail — lets a planner-stage user activate early, but the rail itself lives in City Key because that's where "the card becomes a key to the city" already happens.

---

## 3. Feature specs

### F1 · Nearby offers rail
**Surface:** City Key screen, directly under the spend rail, above "The Line" section header. Horizontal scroll, one card per offer.

Each card:

| Field | Example |
|---|---|
| Merchant + category icon | ☕ Blue Bottle Coffee |
| Terms | 5% back, up to $8 |
| Proximity chip (mocked, not GPS) | 0.3 mi from Base Camp |
| Action | **Activate** → flips to **Activated ✓** |

4–6 offers per destination, curated per trip (not "everything in the city" — real Offers coverage is finite, and the mock should read that way).

### F2 · Activation
Tapping **Activate** is instant and free — it's a card-side flag, not a purchase or reservation:
- Button → filled `Activated ✓` (green, same visual family as Zelle's `Paid ✓` pill)
- Toast: *"Offer added to Venture X — spend $25+ at Blue Bottle Coffee to earn $8 back"*
- A small badge count appears on the City Key tab/section header: "3 offers active"

Activating an offer that was already activated, or activating after the trip has already ended, are no-ops — the button simply reflects current state.

### F3 · Match on swipe
The scripted swipe stream that already powers The Line (`logEvent`/`addTxn` in web, the simulator triggers in iOS) gains one more check: after a swipe posts, compare its `mcc`/`merchant` against the trip's **activated** offers.

- Match → the swipe's entry on the Line gets a small gold "offer" tag, and a **second, separate credit line** posts a beat later: *"Capital One Offers · Blue Bottle Coffee · +$8.00 back"* (never folded into the original charge — real statement credits are their own line item).
- No match → nothing happens; most swipes won't match, and that's correct.
- An offer can only match **once per activation** (matches the real one-time-bonus shape of most Offers).

**Ordering matters:** a swipe that happened *before* activation must never retroactively match. This is the one rule the demo script (§6) has to respect.

### F4 · Wrap summary line
Trip Wrap gains one new stat, alongside miles/spend: *"Offers redeemed: $13.50 back"* — kept as its own line, never summed into miles (it's cash-back-shaped, not a miles multiplier).

### F5 · Plan-tab teaser (optional, lower priority)
3-card preview under Shopping's Trip Intelligence module on the Plan tab, same card component as F1 in miniature, "See all nearby offers →" routes to City Key. Lets a user activate before the trip goes live; activated state persists into the City Key rail.

---

## 4. Data schema (mock)

```json
{
  "offer_id": "off-8825",
  "trip_id": "par-2026-07",
  "merchant": "Blue Bottle Coffee",
  "mcc": "5814",
  "category": "Dining",
  "terms": "5% back, up to $8",
  "radius_label": "0.3 mi from Base Camp",
  "status": "available",
  "activated_at": null,
  "redeemed_amount": null
}
```

`status` transitions: `available → activated → redeemed`. `redeemed` is terminal for that offer instance (no re-matching).

---

## 5. Web implementation (`index.html` + `js/*`)

| File | Addition |
|---|---|
| `js/data.js` | `OFFERS_BY_CITY` map (city key → array of 4–6 offer objects, schema above); `offers: []` (activated/redeemed subset) added to `freshTripState()` |
| `js/offers.js` *(new)* | `renderOffersRail(T, S)`, `activateOffer(offerId)`, `maybeRedeemOffer(swipe)` — kept in its own file, same modular pattern as `velocity.js`/`payments.js` |
| `js/citykey.js` | `logEvent()`/`addTxn()` call sites (already firing for every scripted swipe, e.g. lines 305, 322, 379, 424, 448) each call `maybeRedeemOffer(swipe)` right after posting the swipe; `renderLine()` renders the rail via `renderOffersRail()` |
| `index.html` | New `#offers-rail` container in the City Key section, between the spend/progress block and the Line timeline; Plan-tab teaser container under Shopping's Trip Intelligence block |

Reuses the zip/MCC tagging already on every scripted swipe (`{ amount, merchant, mcc, zip }` passed into `logEvent`) — no new event plumbing needed, just a lookup against `S.offers`.

---

## 6. iOS implementation (`ios/VentureKey/*.swift`)

| File | Addition |
|---|---|
| `Models.swift` | `struct Offer: Identifiable { let id, merchant, icon, mcc, terms, radiusLabel; var status: OfferStatus }`, `enum OfferStatus { case available, activated, redeemed }`; `Trip` gains `let offers: [Offer]`; `TripSession` gains `var activatedOfferIDs: Set<String> = []`, `var redeemedOfferTotal: Double = 0` |
| `AppState.swift` | `func activateOffer(_ tripID: String, _ offerID: String)` — flips status, posts toast, no txn. `func checkOfferMatch(_ tripID: String, mcc: String, merchant: String)` — called from wherever scripted swipes currently post (the simulator swipe triggers already used for The Line); on match, calls `postTxn` with a distinct `Capital One Offers` merchant line and bumps `redeemedOfferTotal` |
| `CityKeyView.swift` | New `offersRail` computed view inserted between `spendRail` and the `SectionHeader(text: "The line", …)` call in `body`; horizontal `ScrollView` of a new `OfferCard: View` |
| `SplashAndWrap.swift` | Wrap stat block gains one row: "Offers redeemed" reading `money(session.redeemedOfferTotal)`, same row style as the existing miles/spend stats |

`OfferCard` should reuse `IconBadge`/`Tag`/`CapsuleButtonStyle` from `Theme.swift` rather than introducing new primitives — the `Activated ✓` state should use the same green (`Color.keyGreenDark`) already established for Zelle's `Paid ✓` tag, so the visual vocabulary for "a Capital One product settled" stays consistent across Zelle, Paze, and Offers.

---

## 7. Visual language

Same restrained partner-mark treatment as Zelle/Paze/Velocity Black elsewhere in the app: the container is always Venture Key's card language (`CardStyle`/`.card()` on iOS, `srf`/`srf2` on web) — Capital One Offers gets a label and an accent, never its own visual system. Proximity chip uses the muted/faint text color, not the accent — it's context, not the offer itself. The gold "offer" tag on a matched Line swipe should be small enough that it reads as a footnote to the swipe, not a competing headline.

---

## 8. Demo script (~30 seconds)

1. City Key tab, trip is LIVE. Scroll to **Nearby offers** → tap **Activate** on Blue Bottle Coffee → toast confirms, badge count ticks to "1 offer active."
2. Fire the next scripted swipe in the simulator (a coffee-shop MCC swipe) → the swipe lands on the Line with a small gold offer tag → a beat later, a second credit line posts: *"Capital One Offers · Blue Bottle Coffee · +$8.00 back."*
3. Jump to Wrap → point at the new "Offers redeemed: $8.00 back" line, separate from the miles total.
4. Close with the honesty line: *"We didn't coupon that café. We activated the card — the credit is just Capital One recognizing its own merchant network."*

---

## 9. Honesty boundary — what we claim vs. don't

- **Activation must precede the swipe.** A swipe that happened before an offer was activated can never retroactively match — this is the one sequencing rule the demo script exists to protect. Real Capital One Offers work the same way: activating is not retroactive.
- **Credit isn't instant in the real product.** It typically posts as a statement credit or bonus miles within a few days of the qualifying purchase settling. The prototype shows it same-session for demo pacing; any detail/receipt view for a redeemed offer should say "usually credits within a few days" so the UI doesn't quietly overclaim real-time settlement.
- **Not every merchant participates.** The rail shows a curated, finite list (4–6 per destination) — never framed as "every merchant near you," because Offers coverage in the real product is a finite, curated network, not blanket citywide coverage.
- **Distinct from Capital One Shopping.** Shopping is pre-trip, product-shaped, online-checkout cash back. Offers here is in-destination, merchant-shaped, activate-then-spend-then-credit. They must never share a buy button or a card component that implies they're the same mechanic.
- **Distinct from Paze and Zelle.** No overlap — Offers never appears at a Paze checkout screen, never involves a second person, never touches Zelle's P2P rails.
- **Proximity is simulated, not GPS.** Same non-GPS stance the rest of City Key already takes — "nearby" is derived from the trip's destination MSA/zip, not a live location permission, and copy should never imply real-time location tracking.
