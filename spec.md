# Specification: Project Venture Key (Unified Itinerary & Micro-Contextual Gamification)

## 1. Project Vision & Framing
"Traditional banks only own the transaction. We want Capital One to own the inspiration, the organization, and the execution of the entire travel journey." 

Venture Key turns the Capital One mobile app into an active travel companion through a decoupled dual-engine system:
1. **Venture Planner (Pre-Trip Engine):** A collaborative itinerary builder where planned travel activities seamlessly prompt one-tap booking conversions via Capital One Travel/Entertainment.
2. **City Key (On-Trip Gamification Engine):** A transaction-driven, real-time gamification layer. It activates autonomously when an out-of-market transaction hits the card auth stream (no battery-draining GPS tracking). Vacation spending increments dynamic "spend slabs" to unlock merchant-funded local rewards in real time.

---

## 2. System Architecture & Modular Decoupling
# Specification: Project Venture Key (Unified Itinerary & Micro-Contextual Gamification)

## 1. Project Vision & Framing
"Traditional banks only own the transaction. We want Capital One to own the inspiration, the organization, and the execution of the entire travel journey." 

Venture Key turns the Capital One mobile app into an active travel companion through a decoupled dual-engine system:
1. **Venture Planner (Pre-Trip Engine):** A collaborative itinerary builder where planned travel activities seamlessly prompt one-tap booking conversions via Capital One Travel/Entertainment.
2. **City Key (On-Trip Gamification Engine):** A transaction-driven, real-time gamification layer. It activates autonomously when an out-of-market transaction hits the card auth stream (no battery-draining GPS tracking). Vacation spending increments dynamic "spend slabs" to unlock merchant-funded local rewards in real time.

---

## 2. System Architecture & Modular Decoupling


+---------------------------+
|   Real-Time Auth Stream   |
+-------------+-------------+
|
v (Out-of-market transaction)
+-----------------------+       +-------------+-------------+
|    Venture Planner    |       |      City Key Engine      |
|  (Optional Itinerary) +------>+ (Independent State Machine)|
+-----------------------+       +-------------+-------------+
|
v
+-------------+-------------+
|  Dynamic Spend Slabs/MCC  |
+---------------------------+

### Architectural Rules for Claude Code:
*   **Decoupled State Execution:** The `City Key Engine` must run completely independently of whether a user has built an itinerary in the `Venture Planner`. 
*   **Data Trigger Rule:** If no itinerary exists, City Key initializes state automatically using the `Merchant_MSA` (Metropolitan Statistical Area) and `MCC` (Merchant Category Code) parsed from the first out-of-market transaction.
*   **Tech Stack:** FastAPI (Backend Python), React (Frontend SPA), Tailwind CSS for styling, Mock WebSocket / Polling stream for real-time transaction events.

---

## 3. Component & Technical Core Specifications

### Component A: Venture Planner (Pre-Trip)
*   **Functional Goal:** Interactive timeline component that manages a multi-day trip schema.
*   **Data Schema Input/Output:**
    ```json
    {
      "trip_id": "par-2026-07",
      "destination": "Paris, France",
      "days": [
        {
          "day_number": 1,
          "items": [
            {
              "time": "15:00",
              "activity": "Eiffel Tower Tour",
              "mcc_category": "Attractions (7999)",
              "booking_status": "PENDING_PARTNER_CONVERSION",
              "partner_deal": {
                "provider": "Capital One Entertainment",
                "perk": "5x Miles Multiplier + VIP Priority Access",
                "price_usd": 45.00
              }
            }
          ]
        }
      ]
    }
    ```
*   **Frontend UI Requirement:** Render an itemized itinerary card view. If `booking_status` is `PENDING_PARTNER_CONVERSION`, render a high-visibility, branded button: `"BOOK via Capital One Travel"`. Clicking this converts state to `BOOKED_VIA_PARTNER`.

### Component B: City Key Engine (On-Trip Gamification)
*   **Functional Goal:** An independent transaction state engine tracking milestones ("Slabs").
*   **The Activation Logic:** Listen to a mock transaction payload. If `merchant_zip_or_msa` != `user_home_zip`, toggle `city_key_active = true` and push a real-time event notification alert ("CITY KEY ACTIVATED!").
*   **Slab & Milestone Data Logic:**
    ```json
    {
      "current_city": "Paris",
      "total_destination_spend": 150.00,
      "next_milestone_threshold": 300.00,
      "unlocked_tiers": [
        {
          "tier_id": 1,
          "spend_required": 100.00,
          "reward_title": "Free Macaron at Patisserie Fleur",
          "claimed": true
        }
      ],
      "locked_tiers": [
        {
          "tier_id": 2,
          "spend_required": 300.00,
          "reward_title": "50% OFF Musée d'Orsay Ticket",
          "claimed": false
        }
      ]
    }
    ```
*   **Frontend UI Requirement:** A dynamic progress bar showing progress toward the next milestone tier (e.g., "95% toward Next Milestone: $300"). Display a visual rewards map tracking unlocked claims alongside partner carousel cards ("LA LOUVRE: 5X Points", "SEINE CRUISE: $10 Credit").

---

## 4. Mock Data Pipeline (For Live Simulation)
To simulate the prototype without active bank connections, write a mock event emitter endpoint (`/api/simulate-transaction`) that can inject the following distinct triggers:

1.  **Trigger 1 (Home Base Transaction - Passive Engine State):**
    `{"amount": 4.50, "merchant": "Starbucks", "mcc": "5814", "zip": "20120"}` -> *Should NOT activate City Key.*
2.  **Trigger 2 (First Travel Transaction - Ignition Event):**
    `{"amount": 120.00, "merchant": "Hotel Le Marais", "mcc": "7011", "zip": "75004"}` -> *Must toggle City Key Activation State UI instantly.*
3.  **Trigger 3 (Milestone Progression Transaction):**
    `{"amount": 160.00, "merchant": "Le Baristas", "mcc": "5812", "zip": "75004"}` -> *Pushes total travel spend to $280, dynamically updating progress metrics towards Tier 2.*

---

## 5. Hackathon Verification Criteria (Self-Test Checklist)

Claude Code must run and pass the following functional checks prior to code finalization:
*   [ ] **Verification 1:** Verify the backend backend routes parse incoming transactions and correctly return a `city_key_active: true` flag if the ZIP parameters differ from user home values.
*   [ ] **Verification 2:** Verify that the UI component updates the state dynamically when a mock payload is fired without requiring a hard page refresh.
*   [ ] **Verification 3:** Verify that clicking the "BOOK via Capital One Travel" button accurately reflects the mutation in state representation inside the console logs or backend.
*   [ ] **Verification 4:** Run full build compilation steps (`npm run build` or local equivalent) to verify zero typescript/linter blockages.

