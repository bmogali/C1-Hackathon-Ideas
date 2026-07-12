# Venture Key · iOS (SwiftUI)

The native companion to the web prototype — same three-act theme (paper → midnight → dawn),
same state machine (`DORMANT → ARMED → LIVE → SETTLED → Wrapped`), built with real iOS
patterns: `TabView`, `NavigationStack`, sheets with detents, `fullScreenCover` ignition,
SF Symbols, spring animations, and `sensoryFeedback` haptics.

**Verified**: builds clean with Xcode 26, runs on the iPhone 17 Pro simulator,
and every act (paper Plan, midnight Line, dawn Wrapped) has been screenshot-checked.

## Run it

1. Open `VentureKey.xcodeproj` in Xcode 15+.
2. Pick any iPhone simulator → **⌘R**.

No dependencies, no signing needed for the simulator, no assets to download.

Debug launch arguments for jumping straight to a state (used for screenshot QA):
`-plan`, `-live` (Paris mid-trip, Line lit), `-wrap` (settled + boarding pass).

## Feature set (full parity with the web build's story)

- **5 destinations** — Paris, NYC, San Francisco, Miami, Orlando — each with its own
  tiers, hotels, Velocity Black requests, and swipe script.
- **Trip authoring** — "Plan your next Venture" creates any city; City Key
  auto-provisions stations, hotels, and a simulator script for it. Add stops to any day.
- **Capital One Travel** — ask-first booking card, hotel sheet with Premier Collection
  ribbon, $300 credit netting, booking **arms** City Key before a single swipe.
- **Capital One Shopping · Trip Intelligence** — destination/forecast context chip and a
  hero offer justified by reasons computed from the actual itinerary + weather.
- **Price Watch + Paze** — priced stops are watched; apply a drop, then complete the
  external checkout with Paze at the normal 2x earn (not the Travel bonus).
- **City Key** — dormant / armed / live states; the Line as a native timeline with
  per-segment gradient fill; folio swipes; claimable merchant-funded stations.
- **Velocity Black** — gold ✦ concierge sheet with scripted chat that drops `SECURED ✦`
  stops into the itinerary, plus the express station on the Line.
- **Standalone 🎲** — simulator toggle ignites Chicago with *no plan on file*,
  self-provisioned from MSA + MCC (the original spec's decoupling rule, live).
- **Zelle®** — Wrap split module + incoming request on Home; money settles into
  360 Checking, never onto the card. Simulator 🔔 stands in for the counterparty.
- **Wrapped** — dawn boarding pass with stats, Canvas barcode, and `ShareLink`.

## Files

| File | Owns |
|---|---|
| `VentureKeyApp.swift` | App entry, tab shell, toast overlay, screen scaffold + FABs |
| `AppState.swift` | The whole state machine — trips, sessions, simulator, VB, Zelle, Paze |
| `Models.swift` | Domain types + five city seeds + Chicago standalone template |
| `Theme.swift` | Three-act palettes, card/pill/section primitives |
| `HomeView.swift` | Greeting, Venture X card, trips, City Key status, incoming Zelle |
| `WalletViews.swift` | Multi-account list + servicing detail |
| `PlanView.swift` | Trip chips, Travel & Stay, Shopping intelligence, Price Watch, itinerary, authoring sheets |
| `CityKeyView.swift` | Dormant/armed/live states + the Line (incl. ✦ express station) |
| `VelocityBlackSheet.swift` | Concierge chat in the black-and-gold language |
| `SplashAndWrap.swift` | Ignition takeover + Wrapped boarding pass + Zelle split |
| `SimulatorSheet.swift` | Auth-stream demo remote (+ 🎲 standalone toggle) |
| `Compat.swift` | macOS typecheck shims only — empty on iOS |
