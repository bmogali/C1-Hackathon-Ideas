import SwiftUI

// ═══ VENTURE KEY · single source of truth ═══
// Same state machine as the web prototype:
// DORMANT → ARMED (portal booking) → LIVE (first in-market auth) → SETTLED → Wrapped
// Standalone path: no plan on file → City Key self-provisions from MSA + MCC.

enum AppTab: Hashable { case home, wallet, plan, cityKey }

struct ToastData: Equatable {
    let icon: String
    let title: String
    let sub: String
}

@MainActor
final class AppState: ObservableObject {

    // ── trips ──
    @Published var trips: [String: Trip] = [
        "paris": Seed.paris, "nyc": Seed.nyc, "sfo": Seed.sfo, "miami": Seed.miami, "orlando": Seed.orlando,
    ]
    @Published var sessions: [String: TripSession] = [
        "paris": TripSession(), "nyc": TripSession(), "sfo": TripSession(),
        "miami": TripSession(), "orlando": TripSession(),
    ]
    @Published var tripOrder = ["paris", "nyc", "sfo", "miami", "orlando"]

    @Published var curTripID = "paris"
    @Published var liveTripID: String? = nil
    @Published var standaloneMode = false   // 🎲 simulator: ignite with no plan on file

    // ── ui ──
    @Published var tab: AppTab = .home
    @Published var act: Act = .paper
    @Published var showSplash = false
    @Published var showWrap = false
    @Published var showSimulator = false
    @Published var showVB = false
    @Published var showNewTrip = false
    @Published var toast: ToastData? = nil
    @Published var hapticTick = 0            // drives .sensoryFeedback

    // ── accounts ──
    @Published var vxBalance: Double = 1284.09
    @Published var vxMiles: Int = 86420
    @Published var checkingBalance: Double = 8214.55
    @Published var checkingActivity: [Txn] = [
        Txn(icon: "💼", merchant: "Employer Inc", desc: "Direct deposit", amount: 2450, isCredit: true, miles: 0),
        Txn(icon: "💳", merchant: "Venture X ····4907", desc: "Card payment", amount: 1911.30, isCredit: false, miles: 0),
    ]
    @Published var txns: [Txn] = [
        Txn(icon: "✈️", merchant: "Air France", desc: "IAD → CDG · 2 travelers", amount: 780, isCredit: false, miles: 1560),
    ]

    // ── zelle incoming (home) ──
    @Published var incomingPending = true
    let incomingFrom = "Arjun"
    let incomingAmount: Double = 42
    let incomingMemo = "Dinner in Chicago"

    // ── simulator progression flags ──
    @Published var firedIgnite = false
    @Published var firedS2 = false
    @Published var firedS3 = false
    @Published var firedReturn = false

    var pal: Palette { Palette.forAct(act) }
    var curTrip: Trip { trips[curTripID]! }
    var curSession: TripSession { sessions[curTripID]! }
    var liveTrip: Trip? { liveTripID.flatMap { trips[$0] } }

    init() {
        // debug fast-forward for screenshot QA: `simctl launch … -live` / `-wrap`
        let args = ProcessInfo.processInfo.arguments
        if args.contains("-live") || args.contains("-wrap") {
            debugFastForward(wrap: args.contains("-wrap"))
        }
        if args.contains("-plan") { tab = .plan; sessions["paris"]?.travelIntent = true }
        if args.contains("-wallet") { tab = .wallet }
    }

    private func debugFastForward(wrap: Bool) {
        let trip = trips["paris"]!
        curTripID = "paris"; liveTripID = "paris"
        firedIgnite = true; firedS2 = true; firedS3 = true
        var s = sessions["paris"]!
        s.active = true
        var cum: Double = 0
        for sw in [trip.ignition, trip.swipe2, trip.swipe3] {
            cum += sw.amount
            s.swipes.append(Swipe(merchant: sw.merchant, amount: sw.amount, cum: cum, icon: sw.icon, note: sw.note))
        }
        s.spend = cum
        sessions["paris"] = s
        act = .midnight
        tab = .cityKey
        if wrap {
            firedReturn = true
            sessions["paris"]?.settled = true
            act = .dawn
            showWrap = true
        }
    }

    // ═══ helpers ═══

    private var toastTask: Task<Void, Never>? = nil
    func showToast(_ icon: String, _ title: String, _ sub: String = "") {
        withAnimation(.spring(duration: 0.35)) { toast = ToastData(icon: icon, title: title, sub: sub) }
        toastTask?.cancel()
        toastTask = Task {
            try? await Task.sleep(nanoseconds: 2_600_000_000)
            if !Task.isCancelled {
                withAnimation(.easeOut(duration: 0.25)) { self.toast = nil }
            }
        }
    }

    func selectTrip(_ id: String) {
        guard liveTripID == nil else { return }   // locked once a trip is live
        curTripID = id
        standaloneMode = false
    }

    private func postTxn(_ t: Txn, tag: Bool = true) {
        var txn = t
        if tag { txn.taggedTrip = curTripID }
        txns.insert(txn, at: 0)
        if !t.isCredit { vxBalance += t.amount } else { vxBalance -= t.amount }
        vxMiles += t.miles
    }

    func taggedTotal(for tripID: String) -> Double {
        txns.filter { $0.taggedTrip == tripID && !$0.isCredit }.reduce(0) { $0 + $1.amount }
    }

    // ═══ Capital One Travel ═══

    func setTravelIntent(_ id: String, _ wants: Bool) {
        sessions[id]?.travelIntent = wants
    }

    func bookHotel(_ tripID: String, _ hotel: Hotel) {
        guard sessions[tripID]?.hotel == nil else { return }
        let trip = trips[tripID]!
        let total = hotel.nightly * Double(trip.nights)
        let credit = min(300, total)
        sessions[tripID]?.hotel = hotel
        postTxn(Txn(icon: "🏨", merchant: "Capital One Travel", desc: "\(hotel.name) · \(trip.nights) nights · 10x miles",
                    amount: total, isCredit: false, miles: Int(total * 10)))
        postTxn(Txn(icon: "💳", merchant: "Capital One Travel", desc: "Venture X annual travel credit",
                    amount: credit, isCredit: true, miles: 0))
        arm(tripID)
        showToast("🏨", "Booked via Capital One Travel", "\(hotel.name) · \(money(total - credit)) net after $300 credit")
    }

    func bookFlight(_ tripID: String) {
        guard sessions[tripID]?.flightBooked == false, let trip = trips[tripID] else { return }
        let travelers = trip.mate.isEmpty ? 1 : 2
        let total = trip.flightPrice * Double(travelers)
        sessions[tripID]?.flightBooked = true
        sessions[tripID]?.flightTravelers = travelers
        sessions[tripID]?.flightTotal = total
        postTxn(Txn(icon: "✈️", merchant: "Capital One Travel",
                    desc: "\(trip.flightRoute) · \(travelers) traveler\(travelers > 1 ? "s" : "") · 5x miles",
                    amount: total, isCredit: false, miles: Int(total * 5)))
        arm(tripID)
        showToast("✈️", "Flight booked", "\(trip.flightRoute) · \(Int(total * 5).formatted()) miles earned")
    }

    func freezeFlight(_ tripID: String) {
        guard sessions[tripID]?.flightBooked == false, sessions[tripID]?.flightFrozen == false,
              let trip = trips[tripID] else { return }
        sessions[tripID]?.flightFrozen = true
        postTxn(Txn(icon: "✈️", merchant: "Capital One Travel", desc: "Price freeze · \(trip.flightRoute) · 6 days",
                    amount: 8, isCredit: false, miles: 0))
        showToast("✈️", "Price frozen", "\(trip.flightRoute) held at \(money(trip.flightPrice)) for 6 days")
    }

    func arm(_ tripID: String) {
        guard sessions[tripID]?.active == false, sessions[tripID]?.armed == false else { return }
        sessions[tripID]?.armed = true
        hapticTick += 1
        showToast("🗝️", "City Key armed", "Ignites at check-in — or your first swipe")
    }

    func bookStop(_ tripID: String, dayIdx: Int, stopIdx: Int) {
        guard let price = trips[tripID]?.days[dayIdx].stops[stopIdx].price else { return }
        trips[tripID]?.days[dayIdx].stops[stopIdx].status = .bookedNow
        let title = trips[tripID]!.days[dayIdx].stops[stopIdx].title
        postTxn(Txn(icon: "🎟️", merchant: "Capital One Travel", desc: "\(title) · 5x miles",
                    amount: price, isCredit: false, miles: Int(price * 5)))
        showToast("🎟️", "Booked via Capital One Travel", "\(title) · 5x miles earned")
    }

    // ═══ Capital One Shopping · Paze checkout ═══

    func buyShopping(_ item: ShoppingItem) {
        postTxn(Txn(icon: item.icon, merchant: item.retailer, desc: "\(item.name) · via Paze",
                    amount: item.price, isCredit: false, miles: Int(item.price * 2)))
        showToast("🅿️", "Bought on \(item.retailer)", "\(item.name) · paid with Paze")
    }

    // ═══ Price Watch · guards the plan's tickets ═══

    func applyDrop(_ tripID: String, dayIdx: Int, stopIdx: Int) {
        guard let stop = trips[tripID]?.days[dayIdx].stops[stopIdx],
              let price = stop.price, stop.dropApplied == nil else { return }
        let d = dropFor(title: stop.title, price: price)
        trips[tripID]?.days[dayIdx].stops[stopIdx].price = price - d.save
        trips[tripID]?.days[dayIdx].stops[stopIdx].dropApplied = d.save
        trips[tripID]?.days[dayIdx].stops[stopIdx].dropVia = d.via
        showToast("📉", "Price drop applied", "\(stop.title) — saved \(money(d.save)) via \(d.via)")
    }

    /// Complete the external checkout the drop came from — Paze autofills the card
    /// at the seller's site; earns the normal 2x, not the Capital One Travel bonus.
    func payWithPaze(_ tripID: String, dayIdx: Int, stopIdx: Int) {
        guard let stop = trips[tripID]?.days[dayIdx].stops[stopIdx],
              let price = stop.price, let via = stop.dropVia, !stop.paidWithPaze else { return }
        trips[tripID]?.days[dayIdx].stops[stopIdx].status = .bookedNow
        trips[tripID]?.days[dayIdx].stops[stopIdx].paidWithPaze = true
        postTxn(Txn(icon: "🅿️", merchant: via, desc: "\(stop.title) · via Paze",
                    amount: price, isCredit: false, miles: Int(price * 2)))
        showToast("🅿️", "Paid with Paze", "\(stop.title) · Venture X ····4907 · via \(via)")
    }

    // ═══ Velocity Black ═══

    func vbGreetIfNeeded() {
        guard sessions[curTripID]?.vbMessages.isEmpty == true else { return }
        sessions[curTripID]?.vbMessages.append(VBMsg(
            fromConcierge: true,
            text: "Good evening, Bharath. \(curTrip.city) \(curTrip.flag) — excellent. What shall we make happen?"))
    }

    func vbAsk(_ index: Int) {
        let tripID = curTripID
        guard let trip = trips[tripID], index < trip.vb.count,
              sessions[tripID]?.vbUsed.contains(index) == false else { return }
        let req = trip.vb[index]
        sessions[tripID]?.vbUsed.insert(index)
        sessions[tripID]?.vbMessages.append(VBMsg(fromConcierge: false, text: req.ask))

        Task {
            try? await Task.sleep(nanoseconds: 1_300_000_000)
            self.sessions[tripID]?.vbMessages.append(VBMsg(fromConcierge: true, text: req.reply))
            let lastDay = (self.trips[tripID]?.days.count ?? 1) - 1
            self.trips[tripID]?.days[lastDay].stops.append(
                Stop(time: req.stopTime, title: req.stopTitle, sub: req.stopSub, status: .velocity))
            self.hapticTick += 1
            self.showToast("✦", "Secured by Velocity Black", req.stopTitle)
        }
    }

    func acceptExpress() {
        guard let id = liveTripID, let station = trips[id]?.vbStation,
              sessions[id]?.vbExpress == false else { return }
        sessions[id]?.vbExpress = true
        let lastDay = (trips[id]?.days.count ?? 1) - 1
        trips[id]?.days[lastDay].stops.append(
            Stop(time: "19:00", title: station.title, sub: station.desc, status: .velocity))
        hapticTick += 1
        showToast("✦", "Express station claimed", "\(station.title) — on your plan")
    }

    // ═══ Trip authoring ═══

    func createTrip(city rawCity: String, mate: String, nights: Int) {
        let city = rawCity.trimmingCharacters(in: .whitespaces)
        guard !city.isEmpty else { return }
        let key = "custom_" + String(city.lowercased().filter { $0.isLetter }) + String(Int.random(in: 100...999))
        let code = String(city.prefix(3)).uppercased()
        let trip = Trip(
            id: key, flag: "🌍", city: city, dates: "\(nights + 1) days", mate: mate,
            zip: String(Int.random(in: 30000...89999)), heroWord: city,
            welcome: "Welcome to \(city) 🌍", tower: "🌆",
            wrapAirports: "\(code) → IAD", wrapPlace: city, nights: nights,
            flightRoute: "IAD → \(code)", flightPrice: 380, flightTrendUp: true, flightPct: 6,
            wxKind: .mild, wxLabel: "72°F · mild & clear",
            tiers: [
                Tier(id: 1, threshold: 100, emoji: "🎁", title: "\(city) local favorite", reward: "Welcome treat on us"),
                Tier(id: 2, threshold: 300, emoji: "🎟️", title: "\(city) top attraction", reward: "50% off entry"),
                Tier(id: 3, threshold: 600, emoji: "✨", title: "Signature experience", reward: "$25 statement credit"),
            ],
            hotels: [
                Hotel(id: "std", name: "\(city) Central Hotel", area: "City center", nightly: 150, tier: "Standard"),
                Hotel(id: "lif", name: "The \(city) Loft", area: "Design district", nightly: 205, tier: "Lifestyle"),
                Hotel(id: "prem", name: "\(city) Premier Residences", area: "Old town", nightly: 330, tier: "Premier Collection"),
            ],
            heroOffer: ShoppingItem(icon: "🔋", name: "10k mAh power bank", price: 29, retailer: "Amazon"),
            shopping: [
                ShoppingItem(icon: "🎒", name: "Anti-theft daypack", price: 39, retailer: "REI"),
                ShoppingItem(icon: "🔌", name: "Travel adapter", price: 23, retailer: "Amazon"),
            ],
            days: [Day(label: "Day 1 — Arrival", stops: []), Day(label: "Day 2", stops: [])],
            ignition: ScriptSwipe(merchant: "Hotel \(city) Central", amount: 120, icon: "🏨", note: "MCC 7011 · ignition swipe"),
            swipe2: ScriptSwipe(merchant: "Café \(city)", amount: 160, icon: "☕", note: "Coffee & pastries"),
            swipe3: ScriptSwipe(merchant: "Bistro \(city)", amount: 95, icon: "🍽️", note: "Dinner downtown"),
            vb: [
                VBRequest(icon: "🍽", ask: "The impossible table — best kitchen in town",
                          reply: "Consider it held. The chef's counter at the hardest booking in \(city), first night, 20:30.",
                          stopTime: "20:30", stopTitle: "\(city) — the impossible table", stopSub: "Secured by Velocity Black"),
            ],
            vbStation: VBStation(threshold: 350, title: "A night \(city) doesn't sell", desc: "Ask the concierge — members only.")
        )
        trips[key] = trip
        sessions[key] = TripSession()
        tripOrder.append(key)
        curTripID = key
        tab = .plan
        showNewTrip = false
        showToast("🗺️", "Trip to \(city) created", "City Key stations auto-provisioned")
    }

    func addStop(_ tripID: String, dayIdx: Int, title: String, time: String, price: Double?) {
        let clean = title.trimmingCharacters(in: .whitespaces)
        guard !clean.isEmpty, dayIdx < (trips[tripID]?.days.count ?? 0) else { return }
        let bookable = (price ?? 0) > 0
        trips[tripID]?.days[dayIdx].stops.append(
            Stop(time: time.isEmpty ? "12:00" : time, title: clean,
                 sub: bookable ? "5x miles via C1 Entertainment" : "Added by you",
                 status: bookable ? .book : .idea, price: price))
        showToast("🧭", "Stop added", "\(clean) · Day \(dayIdx + 1)")
    }

    // ═══ City Key · auth-stream simulator ═══

    func fireHomeSwipe() {
        showToast("☕", "Starbucks — $4.50", "Home-market swipe. Nothing wakes — that's the point.")
    }

    /// Standalone: first out-of-market swipe with no itinerary on file →
    /// City Key provisions the whole trip from MSA + MCC alone.
    private func provisionStandalone() -> String {
        if trips["chicago"] == nil {
            trips["chicago"] = Seed.chicago
            sessions["chicago"] = TripSession()
            tripOrder.append("chicago")
        }
        return "chicago"
    }

    func fireIgnition() {
        guard !firedIgnite else { return }
        firedIgnite = true
        if standaloneMode { curTripID = provisionStandalone() }
        liveTripID = curTripID
        showSimulator = false
        showSplash = true
        hapticTick += 1

        Task {
            try? await Task.sleep(nanoseconds: 2_300_000_000)
            let trip = self.curTrip
            let ign = trip.ignition
            let merchant = self.sessions[self.curTripID]?.hotel?.name ?? ign.merchant
            withAnimation(.easeInOut(duration: 0.9)) {
                self.act = .midnight
                self.showSplash = false
            }
            self.sessions[self.curTripID]?.active = true
            self.sessions[self.curTripID]?.spend = ign.amount
            self.sessions[self.curTripID]?.swipes.append(
                Swipe(merchant: merchant, amount: ign.amount, cum: ign.amount, icon: ign.icon, note: ign.note))
            self.postTxn(Txn(icon: ign.icon, merchant: merchant, desc: "Ignition swipe · City Key live",
                             amount: ign.amount, isCredit: false, miles: Int(ign.amount * 2)))
            self.tab = .cityKey
            self.showToast("🗝️", trip.isStandalone ? "City Key auto-provisioned" : "City Key activated",
                           trip.isStandalone
                           ? "No plan on file — built from MSA \(trip.zip) + MCC alone"
                           : "Station 1 reached — \(trip.tiers[0].reward.lowercased())")
        }
    }

    private func applySwipe(_ s: ScriptSwipe, celebrate tier: Tier?) {
        guard let id = liveTripID else { return }
        let cum = (sessions[id]?.spend ?? 0) + s.amount
        sessions[id]?.spend = cum
        sessions[id]?.swipes.append(Swipe(merchant: s.merchant, amount: s.amount, cum: cum, icon: s.icon, note: s.note))
        postTxn(Txn(icon: s.icon, merchant: s.merchant, desc: s.note, amount: s.amount, isCredit: false, miles: Int(s.amount * 2)))
        showSimulator = false
        tab = .cityKey
        if let t = tier, cum >= t.threshold {
            hapticTick += 1
            showToast("🏆", "Station \(t.id) unlocked", "\(t.title) — \(t.reward)")
        } else if let next = trips[id]!.tiers.first(where: { cum < $0.threshold }) {
            let pct = Int(cum / next.threshold * 100)
            showToast("📈", "\(s.merchant) — \(money2(s.amount))", "\(pct)% to Station \(next.id)")
        }
    }

    func fireProgressSwipe() {
        guard firedIgnite, !firedS2, let id = liveTripID else { return }
        firedS2 = true
        applySwipe(trips[id]!.swipe2, celebrate: nil)
    }

    func fireTierSwipe() {
        guard firedS2, !firedS3, let id = liveTripID else { return }
        firedS3 = true
        applySwipe(trips[id]!.swipe3, celebrate: trips[id]!.tiers[1])
    }

    func fireFolio() {
        guard let id = liveTripID, sessions[id]?.active == true, (sessions[id]?.folioCount ?? 3) < 3 else { return }
        sessions[id]?.folioCount += 1
        let hotelName = sessions[id]?.hotel?.name ?? trips[id]!.ignition.merchant
        applySwipe(ScriptSwipe(merchant: hotelName, amount: 28, icon: "🛎️", note: "Minibar & incidentals · MCC 7011"),
                   celebrate: nil)
    }

    func fireReturn() {
        guard let id = liveTripID, !firedReturn else { return }
        firedReturn = true
        sessions[id]?.settled = true
        showSimulator = false
        withAnimation(.easeInOut(duration: 0.9)) { act = .dawn }
        hapticTick += 1
        showWrap = true
    }

    func claim(_ tierID: Int) {
        guard let id = liveTripID, let t = trips[id]!.tiers.first(where: { $0.id == tierID }) else { return }
        sessions[id]?.claimed.insert(tierID)
        hapticTick += 1
        showToast("🎁", "Reward claimed", "\(t.title) — \(t.reward)")
    }

    // ═══ Zelle ═══
    // Money moves between bank accounts — credits land in 360 Checking, never on the card.

    func requestZelle() {
        guard let id = liveTripID else { return }
        let trip = trips[id]!
        guard !trip.mate.isEmpty else { return }
        let per = (sessions[id]?.spend ?? 0) / 2
        sessions[id]?.zelle.append(ZelleRequest(to: trip.mate, amount: per, status: .requested))
        showToast("⚡", "Request sent", "\(trip.mate) — \(money(per)) via Zelle®")
    }

    func simulateZelleResponse() {
        let id = liveTripID ?? curTripID
        guard let idx = sessions[id]?.zelle.firstIndex(where: { $0.status == .requested }) else {
            showToast("🔔", "Nothing pending", "No outstanding Zelle requests.")
            return
        }
        let req = sessions[id]!.zelle[idx]
        sessions[id]?.zelle[idx].status = .received
        checkingBalance += req.amount
        checkingActivity.insert(Txn(icon: "⚡", merchant: "Zelle from \(req.to)", desc: "Trip split",
                                    amount: req.amount, isCredit: true, miles: 0), at: 0)
        showSimulator = false
        hapticTick += 1
        showToast("⚡", "\(req.to) paid you back", "\(money2(req.amount)) landed in 360 Checking")
    }

    func payIncoming() {
        guard incomingPending else { return }
        incomingPending = false
        checkingBalance -= incomingAmount
        checkingActivity.insert(Txn(icon: "⚡", merchant: "Zelle to \(incomingFrom)", desc: incomingMemo,
                                    amount: incomingAmount, isCredit: false, miles: 0), at: 0)
        showToast("⚡", "Sent via Zelle®", "\(money2(incomingAmount)) to \(incomingFrom)")
    }

    func declineIncoming() {
        incomingPending = false
        showToast("⚡", "Request declined", "")
    }
}
