# Spec: Capital One Travel & Hotel Booking Integration

**Project:** Venture Key (Venture Planner + City Key)
**Doc status:** Implementation spec for the hackathon prototype (`index.html` + `js/*`)
**Why this doc exists:** Judging awards points for deep integration with Capital One services. This spec wires Venture Key into **Capital One Travel** (flights + hotels) so that every leg of the journey touches a real, nameable Capital One capability — and so the mock stays honest: everything below runs on data Capital One genuinely has (its own portal bookings and its own auth stream). No inferred data, no hype.

---

## 1. The integration thesis

Capital One Travel (powered by Hopper technology) already owns four hard problems we should not rebuild:

| Capital One Travel capability (real, shipping today) | What Venture Key does with it |
|---|---|
| **Price prediction** — "book now vs. wait" advice on flights & hotels | Planner stops show a *prediction chip* before booking; waiting/booking becomes a game decision |
| **Price drop protection** — credit back if price falls after advised booking | Feeds our existing Price Watch section; drops become planner events |
| **Price freeze** — hold a fare/rate for a small fee | "Freeze" action on unbooked lodging/flight stops |
| **Portal earn rates** — 5x miles flights, **10x hotels & rental cars** (Venture X) | Booking CTAs show real multipliers; Wrap math uses them |
| **$300 annual travel credit** (Venture X, portal bookings) | Auto-applied at hotel checkout; visible in Budget + account ledger |
| **Premier Collection** (Venture X): $100 experience credit, daily breakfast, upgrades | Luxury hotel tier in results; hand-off point to Velocity Black |
| **Booking confirmation = first-party itinerary data (PNR)** | **City Key pre-arms**: destination, MSA, and arrival window are known the moment the hotel is booked — no GPS, no inference |

**The headline architectural upgrade:** today City Key is purely reactive (wakes on first out-of-market swipe). With Travel integration it gains a third state — **ARMED** — because a portal hotel booking tells us *where* and *when* the trip starts. Standalone mode still works with zero bookings (spec'd in §6); the two paths compose.

```
                        ┌─────────────────────────┐
                        │   Capital One Travel     │
                        │  (flights · hotels ·     │
                        │   price intelligence)    │
                        └─────┬──────────┬────────┘
              booking.confirmed│          │price events
                     (webhook) │          │(drop / freeze / advice)
                               ▼          ▼
┌──────────────┐      ┌────────────────────────┐      ┌─────────────────────┐
│ Venture      │◄────►│  Trip Service           │◄────►│  Price Watch        │
│ Planner      │      │  (trip_id, stops, PNRs) │      │  (existing section) │
└──────────────┘      └───────────┬────────────┘      └─────────────────────┘
                                  │ arm(msa, window)
                                  ▼
                      ┌────────────────────────┐
                      │  City Key Engine        │   DORMANT → ARMED → LIVE → SETTLED
                      │  (auth-stream driven)   │◄── real-time auth stream (unchanged)
                      └────────────────────────┘
```

---

## 2. State machine change (City Key)

```
DORMANT ──(portal booking confirmed for trip T)──► ARMED(T)
DORMANT ──(out-of-market auth, no booking)───────► LIVE      (standalone §6 — unchanged)
ARMED(T) ─(first in-market auth OR hotel folio auth)─► LIVE(T)
LIVE ─────(first home-market auth after window)──► SETTLED → Wrapped
```

**ARMED rules**
- Set by `booking.confirmed` where `product ∈ {hotel, flight}` and `destination_msa ≠ home_msa`.
- Carries `{trip_id, msa, arrival_date, hotel_property_id?}`.
- UI: Live tab shows a new pre-ignition state — the line is drawn but unlit, with the hotel rendered as **Base Camp** (station 0) and copy: *"Armed for Paris · ignites Jul 12 or on your first swipe — whichever comes first."*
- ARMED expires back to DORMANT if the trip is cancelled (refund webhook).

**Why judges should care:** the arm signal comes from Capital One's own booking system — this is the "we own inspiration → execution" story with a concrete mechanism, and it's data no other issuer's travel portal can hand to a rewards engine this cleanly.

---

## 3. Feature specs

### F1 · Hotel search & booking inside the Planner
**Surface:** Plan screen → any `lodging` stop, plus a persistent "Where are you staying?" card when a trip has no lodging stop.

- CTA: **"Find a hotel · Capital One Travel"** opens an inline results panel (mock, 3 properties):

| Result card fields | Example (Paris) |
|---|---|
| Property, area, rating | Hôtel Le Marais · 4.6★ · Le Marais |
| Nightly rate + total for trip dates | $210/night · $1,260 · Jul 12–18 |
| **Earn chip** | ⭐ **10x miles** = 12,600 miles |
| **Prediction chip** (Hopper) | 📈 "Rates likely to **rise 8%** — book now" or 🧊 "Likely to drop — wait or freeze" |
| Collection badge (one result) | ◆ **Premier Collection** — $100 experience credit · daily breakfast for 2 · upgrade when available |
| Credit banner (Venture X) | 💳 **$300 travel credit auto-applies** → $960 net |

- **Book** →
  1. Stop status → `bookedNow` variant `lodging` (shows confirmation + QR ticket, reuse `showTicket`).
  2. Account ledger txn: `Capital One Travel · Hôtel Le Marais · 10x miles`, auto-tagged to trip, **minus $300 credit as a second, green, positive ledger line** (`Travel credit applied · +$300.00`).
  3. `city_key_armed` fires (§2) → Live tab flips to ARMED state; toast: *"🗝️ City Key armed for Paris — ignites at check-in."*
  4. Trip vitals: "Booked via C1 Travel" now splits `Stays $960 · Activities $67`.

**Data schema (mock):**
```json
{
  "booking_id": "C1T-HTL-88412",
  "trip_id": "par-2026-07",
  "product": "hotel",
  "property": "Hôtel Le Marais",
  "collection": "premier | lifestyle | standard",
  "check_in": "2026-07-12",
  "nights": 6,
  "total_usd": 1260.00,
  "credit_applied_usd": 300.00,
  "earn": { "multiplier": 10, "miles": 12600 },
  "prediction": { "advice": "book_now", "confidence": 0.95, "expected_move_pct": 8 }
}
```

### F2 · Flight anchor
**Surface:** Plan screen header area — one slim "Getting there" row per trip.

- Unbooked: "IAD → CDG · from $612 · ⭐ 5x miles · 📈 book by Jul 9" + **Book via C1 Travel** / **🧊 Freeze price ($8)**.
- Booked: locks the trip dates (authored trips inherit dates from the PNR — planner day rows regenerate), posts ledger txn at 5x, auto-tagged.
- Freeze: stop stores `frozen_until` + frozen price; Price Watch shows "🧊 frozen at $612 · 6 days left."
- The existing seed `Air France $780` untagged txn stays as the *contrast* story: booked outside the portal = 2x, no protection, manual tagging. Booked inside = 5x, protected, auto-tagged. Say this line out loud in the demo.

### F3 · Price intelligence unification (extends existing Price Watch)
- Price Watch gains a second row type for **rate protection** on booked items (vs. pre-book drops on unbooked items):
  - `🛡️ Hôtel Le Marais — rate dropped $180 after booking → price drop protection filed · credit posts in 3–5 days` (mock button: **Claim**, posts green ledger line).
- Section subtitle updates to: *"Hopper-grade prediction before you book · drop protection after."*

### F4 · City Key × hotel: Base Camp
- When ARMED via hotel booking, the Line renders **Base Camp** as station 0: hotel icon, property name, and a hotel-funded perk slab: *"Spend $400 anywhere in Paris → late checkout + rooftop apéritif at Base Camp."*
- Hotel folio auths (MCC 7011 incrementals — minibar, spa) stream onto the Line like any swipe and count toward slabs. This is the merchant-funded flywheel: the hotel funds a perk that pulls spend back on-property.

### F5 · Premier Collection ↔ Velocity Black hand-off
- If the booked hotel is Premier Collection, the Velocity Black drawer gains one context request: *"Have the hotel do something for our anniversary"* → concierge reply + `velocity` stop. One line of data (`collection: "premier"`) buys a cross-service moment: **Travel books it, Velocity elevates it.**

### F6 · Standalone compatibility (do not break §6 of the original spec)
- Zero bookings → ARMED never fires → reactive ignition works exactly as today (🎲 path).
- If a standalone LIVE session later gets a portal hotel booking (user books tonight's hotel from the Live screen — add "Need a room tonight?" chip in the live rail), the session adopts the booking: Base Camp appears mid-line. Rooms-tonight is a real Capital One Travel use case and a strong "engines compose" beat.

### Wrap additions
- New stat row on the boarding pass stub: `✈️ 5x flights + 🏨 10x hotel = 14,010 miles from the portal alone · $300 credit applied · price protection recovered $180`.
- Wallet-share math now includes the hotel — pushing the "100% of the trip on Capital One rails" claim from plausible to obvious.

---

## 4. Mock API pipeline (for the prototype)

No backend; these are the shapes the JS mocks should honor so a future FastAPI drop-in is mechanical (matches original spec §2 tech stack):

| Mock endpoint | Trigger in UI | Effect |
|---|---|---|
| `POST /api/travel/search-hotels {trip_id}` | "Find a hotel" | returns 3 hardcoded results w/ prediction chips |
| `POST /api/travel/book {booking_id}` | Book CTA | ledger txns (charge + credit), stop update, **emits `booking.confirmed`** |
| `POST /api/travel/freeze {stop_id}` | 🧊 Freeze | stop gains frozen price + expiry |
| `webhook booking.confirmed` | internal | `cityKey.arm(trip_id, msa, arrival_date)` |
| `webhook price.dropped {booking_id}` | simulator button (see below) | Price Watch protection row appears |

**Simulator deck addition (one button):** `🏨 Folio Swipe · minibar $28 · MCC 7011` — demonstrates F4 (folio spend advancing slabs). Also add `📉 Rate Drop` dev-trigger that fires `price.dropped` for the booked hotel to demo F3 live.

---

## 5. Implementation map (current codebase)

| File | Changes |
|---|---|
| `js/data.js` | `HOTELS` mock results per city; `flight` field per trip; prediction copy |
| `js/planner.js` | hotel results panel, flight anchor row, freeze action, F1 booking flow |
| `js/citykey.js` | `arm()` + ARMED render state, Base Camp station row, folio trigger |
| `js/account.js` | credit-line ledger entries (positive/green), protection claim txn |
| `js/velocity.js` | Premier Collection context request (F5) |
| `index.html` | simulator: `🏨 Folio` + `📉 Rate Drop` buttons; live rail ARMED slot |

Suggested build order (demo value ÷ effort): **F1 → §2 ARMED state → F4 Base Camp → F3 protection row → F2 flights → F5 → F6 rooms-tonight.** F1 + ARMED alone are a complete, judgeable story.

---

## 6. Demo script (60 seconds, travel-integration beat)

1. Plan screen, Paris → "Find a hotel" → results show **10x**, Hopper prediction chip, Premier Collection badge, **$300 credit** netting the price down. Book it.
2. Toast: *City Key armed for Paris.* Flip to Live: line drawn, unlit, **Base Camp** visible — "ignites Jul 12 or on your first swipe."
3. Fire ignition swipe → everything you already have, plus folio swipe advances the slab; Base Camp perk unlocks at $400.
4. Simulator `📉 Rate Drop` → Price Watch files drop protection, +$180 back on the ledger.
5. Wrap shows the portal math: 14k miles, $300 credit, $180 recovered. *"Every dollar of this trip touched a Capital One service."*

---

## 7. Verification checklist (hackathon)

- [ ] Booking a hotel emits `booking.confirmed` and City Key visibly transitions DORMANT → ARMED without a page refresh.
- [ ] The $300 credit appears as a distinct positive ledger line, auto-tagged, and nets the Budget panel.
- [ ] Base Camp renders as station 0 only when a hotel booking exists; standalone 🎲 path renders no Base Camp and still ignites.
- [ ] Folio swipe (MCC 7011, same MSA) advances slab progress on the Line.
- [ ] Rate-drop trigger produces a protection claim txn and updates Wrap totals.
- [ ] Earn math is consistent everywhere: 10x hotel / 5x flight / 2x everything else (portal vs. non-portal Air France contrast intact).

## 8. Honesty boundary (what we claim vs. don't)

**We claim** only first-party signals: portal bookings (property, dates, MSA), the auth stream, and published earn/credit/protection benefits. **We don't claim** access to non-portal booking contents, email parsing, location tracking, or SKU-level purchase inference — consistent with the product's "no GPS, no hype" positioning.
