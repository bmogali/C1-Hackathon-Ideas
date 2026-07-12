# Spec: Zelle® & Paze℠ Integration

**Project:** Venture Key (Venture Planner + City Key)
**Doc status:** Implementation spec for the hackathon prototype (`index.html` + `js/*`)
**Why this doc exists:** Zelle and Paze are both operated by Early Warning Services — the same bank consortium — but they solve two unrelated problems. This spec keeps them separate on purpose: Zelle moves money *between people*, Paze moves money *at merchant checkout*. Blurring them together is the fastest way to build something that doesn't match how either product actually works.

---

## 1. The integration thesis

| Product | What it actually is (real, shipping today) | What Venture Key does with it |
|---|---|---|
| **Zelle®** | Send or request money between enrolled US bank accounts via phone/email. Settlement depends on the *recipient* acting in their own banking app — it is not instant on request, and there is no native "split 4 ways" primitive. | Powers **"Split this trip"** on Wrap and mid-trip settle-up: turn a shared, tagged expense into individual Zelle requests to tripmates, and track who's paid. |
| **Paze℠** | A one-tap guest-checkout wallet at participating *online merchants* (autofills a saved card, no retyping, no giving the merchant your raw card number). It is not a P2P tool and does not touch in-person/NFC payments. | Replaces manual card entry the moment Venture Key sends a user *off-platform* to complete a booking — a Price Watch drop, a Capital One Shopping retailer, a partner ticketing site. |

**The rule that keeps this honest:** if a flow involves another *person*, it's Zelle. If a flow involves another *merchant's checkout page*, it's Paze. Neither product ever appears in the other's lane — Zelle never shows up at a merchant checkout, Paze never shows up when splitting a bill with Priya.

---

## 2. Where each one shows up

```
┌─────────────────────────────┐        ┌──────────────────────────────┐
│  TRIP WRAP / ACCOUNT LEDGER  │        │  PLANNER / SHOPPING / WATCH   │
│  "who owes what"             │        │  "checking out somewhere      │
│                              │        │   that isn't Capital One"     │
│   ▸ Split this trip          │        │   ▸ Price Watch → Apply drop  │
│   ▸ Mid-trip settle-up       │        │   ▸ Shopping → Buy on retailer│
│   ▸ Incoming request (Home)  │        │                                │
│         powered by           │        │          powered by           │
│        ┌──────────┐          │        │        ┌──────────┐            │
│        │  ZELLE®  │          │        │        │  PAZE℠   │            │
│        └──────────┘          │        │        └──────────┘            │
└─────────────────────────────┘        └──────────────────────────────┘
```

Zelle requests settle into **360 Checking**, never onto the Venture X card — Zelle moves cash between bank accounts, it cannot post a statement credit to a credit card. Paze checkouts post as an ordinary card charge with the ordinary MCC-based earn rate — Paze is a *rail*, not a rewards program, so it never changes miles math.

---

## 3. Feature specs

### F1 · Split this trip (Wrap screen)
**Surface:** a new "💸 Split this trip · Zelle®" module on the Wrap screen, directly below the boarding-pass stub, above the existing "Share your Wrapped" button row. Hidden entirely for solo trips (`T.mates.length === 0`).

- Pull the trip's tagged ledger total (`ledgerFor(tripKey).total` — already computed for the Wrap stats) and divide evenly across `1 + T.mates.length` travelers.
- Header stat: *"You fronted $1,920 on Venture X · split evenly, everyone owes $480."*
- One row per tripmate: initial avatar, name, amount, a status pill, and an action button:

| Status | Pill | Action |
|---|---|---|
| Not yet requested | — | **Request $480 via Zelle®** |
| Requested | `Requested · pending` (amber) | **Remind** |
| Received | `Paid ✓` (green) | — |

- Aggregate line under the rows: *"1 of 2 tripmates settled · $480 received into 360 Checking."*

**Data schema (mock):**
```json
{
  "request_id": "zl-8841",
  "trip_id": "par-2026-07",
  "to": "Priya",
  "contact": "(•••) •••-4821",
  "amount": 480.00,
  "memo": "Summer in Paris — your share",
  "status": "requested",
  "requested_at": "2026-07-19T14:02:00Z"
}
```

### F2 · Request composer
Clicking **Request via Zelle®** opens a lightweight modal (same visual pattern as the existing ticket/new-trip modals):
- Recipient (name + masked contact pulled from a small mock contacts map per trip — real Zelle requires a phone number or email on the Zelle network).
- Amount, pre-filled with the even split, editable (a real trip is rarely split perfectly evenly — someone skipped a dinner, someone else covered the Ubers).
- Memo, pre-filled ("{Trip name} — your share"), editable.
- **Send request** → posts the mock request object, closes the modal, updates the tripmate's row to `Requested · pending`, toast: *"Request sent to Priya via Zelle®."*

Nothing here can auto-complete. See §7 for why.

### F3 · Mid-trip settle-up (Account screen)
Splitting shouldn't have to wait until the trip is over — the person who covered dinner wants their money back that night. In the Account screen's transaction detail (the existing expand-on-tap panel that already shows Category/MCC/Location/Status and tag buttons), any transaction **tagged to a trip with tripmates** gets one more action: **"Split this charge"**. It opens the same composer from F2, scoped to that single transaction's amount divided across travelers, instead of the whole trip.

This reuses the transaction-detail UI already built for tagging — no new surface, just one more action row.

### F4 · Incoming request (Home)
The reverse case: a tripmate requests money *from* Bharath (they covered something). Home gets a slim strip — same visual weight as the existing City Key status strip — that appears when there's a pending incoming request:

*"💰 Arjun requested $42.00 — Dinner in Chicago"* → **Pay with Zelle®** / **Decline**

Paying posts a debit from 360 Checking (not the Venture X card — Zelle sends move cash, they don't run through the card network) and clears the strip.

### F5 · Paze at external checkout
**Surface:** anywhere Venture Key currently narrates a purchase happening *outside* Capital One's own portals.

1. **Price Watch → Apply.** Today, applying a price drop just narrates "saved $15 via TodayTix" with no purchase step. Add a real completion step: after applying, show **"Continue to TodayTix → Pay with Paze"**. One tap, no redirect required for the mock — toast confirms *"Paid with Paze · Venture X ····4907 · via TodayTix"* and posts the normal ledger charge at the normal earn rate for that MCC.
2. **Capital One Shopping → Buy.** The existing `buyRec()` flow currently posts the purchase as if "Capital One Shopping" were the merchant. Relabel the CTA to **"Buy on {retailer} · Pay with Paze"** — accurate to how Shopping actually works (it hands you off to the real retailer's checkout; Paze is what lets that checkout complete without retyping a card number).
3. **Explicitly out of scope for Paze:** Velocity Black bookings (phone/concierge-arranged, never a merchant checkout page), City Key reward redemptions (in-store code, not e-commerce), and any Capital One Travel booking (Capital One Travel already knows the card — there's nothing for a wallet to autofill).

Paze never appears next to a phone reservation or an in-person swipe. If there's no merchant checkout page, there's no Paze button.

---

## 4. Mock data & state additions

| File | Addition |
|---|---|
| `js/data.js` | `zelleRequests: []` on `freshTripState()`; small `MATE_CONTACTS` map (`{ Priya: '(•••) •••-4821', ... }`) for composer realism |
| `js/payments.js` *(new)* | `openZelleComposer()`, `sendZelleRequest()`, `simulateZelleResponse()`, `payWithPaze()` — kept in its own file, same modular pattern as `velocity.js` |
| `js/account.js` | 360 Checking balance/activity gains the Zelle credit/debit lines (F1/F4) — this already has its own detail page from the multi-account work, so the reimbursement has somewhere real to land |
| `js/citykey.js` (Wrap) | `runWrap()` calls `renderSplitModule(T, S)` |
| `index.html` | `#modal-zelle` composer modal; simulator deck gains one dev-trigger: `🔔 Zelle Response` |

**Simulator dev-trigger:** `🔔 Zelle Response` flips the oldest `requested` entry in `S.zelleRequests` to `received` and posts the credit to 360 Checking. This stands in for the real-world action of the *counterparty* approving the request in their own bank's app — something Venture Key's UI can never trigger on its own (see §7).

---

## 5. Visual language

Reuse the existing design system (Fraunces display type, `srf`/`srf2` surfaces, the same button idiom as Capital One Travel/Shopping sections) — Zelle and Paze get a small brand accent (Zelle's purple mark, Paze's own wordmark) the same restrained way Capital One Travel and Shopping already get a label and nothing more. The container language stays Venture Key's; only the small logo/accent signals which partner is doing the work.

---

## 6. Demo script (45 seconds)

1. Live tab: fire the swipe sequence, then **🛬 Fly Home** → Wrap renders.
2. Scroll to **Split this trip** → click **Request $480 via Zelle®** for Priya → composer opens pre-filled → **Send request** → row flips to `Requested · pending`.
3. Simulator: **🔔 Zelle Response** → row flips to `Paid ✓`, toast confirms the credit landed in 360 Checking.
4. Navigate to Plan → Price Watch → **Apply** a drop → **Pay with Paze** → toast confirms the charge posted at the normal earn rate.
5. Close with the honesty line: *"Same card, same rewards — Zelle just moved the reimbursement, Paze just skipped the typing."*

---

## 7. Honesty boundary — what we claim vs. don't

- **We cannot auto-complete a Zelle request.** The recipient must independently approve it inside their own bank's app; Venture Key can only ever show "sent." The simulator's `🔔 Zelle Response` button is explicitly a demo stand-in for that external action, not something the real product could trigger itself.
- **"Split" is not a Zelle feature.** Zelle exposes ordinary one-to-one send/request. "Split this trip" is Capital One's own convenience layer that fires several individual Zelle requests — it should never be described as a Zelle capability, only as something Venture Key *built on top of* Zelle.
- **Zelle requires both sides enrolled** with a US bank on the Zelle network. If a tripmate isn't reachable via Zelle, the product needs a fallback (a plain reminder or share link) — never a dead button.
- **Paze changes nothing about rewards.** It's a checkout rail, not a card. Every Paze transaction earns exactly what a normal Venture X swipe at that merchant/MCC would earn.
- **Paze only exists at merchants who've integrated it.** Don't show a "Pay with Paze" button anywhere the mock wouldn't realistically support it — no phone reservations, no in-person swipes, no Capital One-native checkouts that already have the card on file.
