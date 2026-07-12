import SwiftUI

// ═══ PLAN · Venture Planner — trips, Capital One Travel, Shopping, Price Watch, itinerary ═══

struct PlanView: View {
    @EnvironmentObject var app: AppState
    @State private var showHotels = false
    @State private var addStopDay: Int? = nil

    var body: some View {
        Screen(word: app.curTrip.heroWord, state: "drawn.",
               subtitle: "\(app.curTrip.dates)\(app.curTrip.mate.isEmpty ? "" : " · with \(app.curTrip.mate)")",
               showVBButton: true) {

            tripChips

            SectionHeader(text: "Travel & Stay · Capital One Travel", pal: app.pal)
            travelStayCard.drift()

            SectionHeader(text: "Capital One Shopping · Trip Intelligence", pal: app.pal)
            shoppingIntelligence.drift()

            SectionHeader(text: "Itinerary", pal: app.pal)
            ForEach(Array(app.curTrip.days.enumerated()), id: \.element.id) { dayIdx, day in
                daySection(dayIdx: dayIdx, day: day).drift()
            }

            if !watchedStops.isEmpty {
                SectionHeader(text: "Price Watch · Capital One Shopping", pal: app.pal)
                priceWatchCard.drift()
            }
        }
        .sheet(isPresented: $showHotels) {
            HotelSheet()
                .presentationDetents([.medium, .large])
                .presentationDragIndicator(.visible)
        }
        .sheet(item: Binding(
            get: { addStopDay.map { AddStopContext(dayIdx: $0) } },
            set: { addStopDay = $0?.dayIdx }
        )) { ctx in
            AddStopSheet(dayIdx: ctx.dayIdx)
                .presentationDetents([.medium])
                .presentationDragIndicator(.visible)
        }
    }

    // ── trip chips: quiet text capsules, selected inverts ──
    private var tripChips: some View {
        ScrollView(.horizontal) {
            HStack(spacing: 8) {
                ForEach(app.tripOrder, id: \.self) { id in
                    let t = app.trips[id]!
                    let on = app.curTripID == id
                    Button { app.selectTrip(id) } label: {
                        Text(t.city)
                            .font(.subheadline.weight(.semibold))
                            .foregroundStyle(on ? app.pal.bg : app.pal.sub)
                            .padding(.horizontal, 16).padding(.vertical, 9)
                            .background(on ? app.pal.ink : app.pal.card, in: Capsule())
                    }
                    .buttonStyle(.plain)
                    .disabled(app.liveTripID != nil && !on)
                    .opacity(app.liveTripID != nil && !on ? 0.35 : 1)
                }
                Button { app.showNewTrip = true } label: {
                    Image(systemName: "plus")
                        .font(.system(size: 13, weight: .semibold))
                        .foregroundStyle(app.pal.faint)
                        .padding(.horizontal, 14).padding(.vertical, 10)
                        .background(app.pal.card, in: Capsule())
                }
                .buttonStyle(.plain)
                .disabled(app.liveTripID != nil)
            }
            .padding(.vertical, 3)
            .padding(.horizontal, 2)
        }
        .scrollIndicators(.hidden)
        .scrollClipDisabled()
    }

    // ── day block ──
    private func daySection(dayIdx: Int, day: Day) -> some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack {
                Text(day.label)
                    .font(.footnote.weight(.semibold))
                    .foregroundStyle(app.pal.sub)
                Spacer()
                Button { addStopDay = dayIdx } label: {
                    Image(systemName: "plus.circle.fill")
                        .font(.system(size: 18))
                        .foregroundStyle(app.pal.accent.opacity(0.8))
                }
                .buttonStyle(.plain)
            }
            .padding(.horizontal, 6)

            if day.stops.isEmpty {
                Text("Nothing planned yet — add a stop, ask the concierge, or just go. City Key works either way.")
                    .font(.footnote).foregroundStyle(app.pal.faint)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .card(app.pal, padding: 16)
            } else {
                VStack(spacing: 0) {
                    ForEach(Array(day.stops.enumerated()), id: \.element.id) { stopIdx, stop in
                        StopRow(stop: stop, dayIdx: dayIdx, stopIdx: stopIdx)
                        if stop.id != day.stops.last?.id {
                            Divider().overlay(app.pal.ink.opacity(0.05)).padding(.leading, 72)
                        }
                    }
                }
                .background(app.pal.card, in: RoundedRectangle(cornerRadius: 24, style: .continuous))
                .clipShape(RoundedRectangle(cornerRadius: 24, style: .continuous))
                .shadow(color: .black.opacity(app.act == .midnight ? 0 : 0.05), radius: 14, y: 6)
            }
        }
    }

    // ── Capital One Travel: ask → flight + hotel ──
    @ViewBuilder
    private var travelStayCard: some View {
        let session = app.sessions[app.curTripID]!
        if session.travelIntent == true || session.hotel != nil || session.flightBooked {
            VStack(spacing: 12) {
                flightCard
                hotelPart
            }
        } else if session.travelIntent == nil {
            askCard
        } else {
            skipRow
        }
    }

    // ── flight · Hopper-style prediction, freeze, book ──
    @ViewBuilder
    private var flightCard: some View {
        let trip = app.curTrip
        let session = app.sessions[app.curTripID]!
        let parts = trip.flightRoute.components(separatedBy: " → ")
        if session.flightBooked {
            HStack(alignment: .center, spacing: 14) {
                IconBadge(symbol: "airplane", tint: .keyGreenDark, size: 40)
                VStack(alignment: .leading, spacing: 3) {
                    routeText(parts, size: 19)
                    Text("\(session.flightTravelers) traveler\(session.flightTravelers > 1 ? "s" : "") · \(money(session.flightTotal)) · \(Int(session.flightTotal * 5).formatted()) miles")
                        .font(.footnote).foregroundStyle(app.pal.sub)
                }
                Spacer()
                Tag(text: "Booked", color: .keyGreenDark)
            }
            .card(app.pal)
        } else {
            VStack(alignment: .leading, spacing: 12) {
                HStack {
                    Text("Getting there")
                        .font(.caption2.weight(.semibold))
                        .tracking(1.2)
                        .textCase(.uppercase)
                        .foregroundStyle(app.pal.faint)
                    Spacer()
                    if session.flightFrozen {
                        Tag(text: "Frozen · \(money(trip.flightPrice))", color: app.pal.accent)
                    }
                }
                routeText(parts, size: 26)
                HStack(alignment: .top, spacing: 10) {
                    Image(systemName: trip.flightTrendUp ? "chart.line.uptrend.xyaxis" : "chart.line.downtrend.xyaxis")
                        .font(.system(size: 13, weight: .medium))
                        .foregroundStyle(app.pal.accent)
                        .frame(width: 28, height: 28)
                        .background(app.pal.accent.opacity(0.1), in: Circle())
                    Text(trip.flightTrendUp
                         ? "Fares are trending up \(trip.flightPct)% for these dates — booking today locks the price."
                         : "Fares tend to ease \(trip.flightPct)% before departure — freeze today's rate while you wait.")
                        .font(.footnote)
                        .foregroundStyle(app.pal.sub)
                        .fixedSize(horizontal: false, vertical: true)
                }
                HStack {
                    VStack(alignment: .leading, spacing: 1) {
                        Text(money(trip.flightPrice))
                            .font(.title3.weight(.semibold)).foregroundStyle(app.pal.ink)
                        Text("per traveler · 5x miles")
                            .font(.caption2).foregroundStyle(app.pal.faint)
                    }
                    Spacer()
                    if !session.flightFrozen {
                        Button("Freeze · $8") { app.freezeFlight(app.curTripID) }
                            .buttonStyle(CapsuleButtonStyle(kind: .quiet, pal: app.pal, compact: true))
                    }
                    Button("Book flight") { app.bookFlight(app.curTripID) }
                        .buttonStyle(CapsuleButtonStyle(kind: .prominent, pal: app.pal, compact: true))
                }
            }
            .card(app.pal)
        }
    }

    private func routeText(_ parts: [String], size: CGFloat) -> some View {
        (Text(parts.first ?? "")
         + Text("  →  ").foregroundColor(app.pal.accent)
         + Text(parts.count > 1 ? parts[1] : ""))
            .font(.system(size: size, weight: .medium, design: .serif))
            .foregroundStyle(app.pal.ink)
    }

    @ViewBuilder
    private var hotelPart: some View {
        let session = app.sessions[app.curTripID]!
        if let hotel = session.hotel {
            HStack(alignment: .top, spacing: 14) {
                IconBadge(symbol: "bed.double.fill", tint: .keyGreenDark, size: 40)
                VStack(alignment: .leading, spacing: 3) {
                    Text(hotel.name)
                        .font(.system(size: 19, weight: .medium, design: .serif))
                        .foregroundStyle(app.pal.ink)
                    Text("\(app.curTrip.nights) nights · 10x miles · $300 credit applied")
                        .font(.footnote).foregroundStyle(app.pal.sub)
                    if hotel.tier == "Premier Collection" {
                        Text("Premier Collection")
                            .font(.caption2.weight(.semibold))
                            .tracking(1)
                            .textCase(.uppercase)
                            .foregroundStyle(Color.vbGold)
                    }
                }
                Spacer()
                Tag(text: "Armed", color: .keyGreenDark)
            }
            .card(app.pal)
        } else {
            HStack(spacing: 14) {
                IconBadge(symbol: "bed.double", tint: app.pal.accent, size: 40)
                VStack(alignment: .leading, spacing: 2) {
                    Text("Where are you staying?")
                        .font(.body.weight(.semibold)).foregroundStyle(app.pal.ink)
                    Text("Booking arms City Key before you land.")
                        .font(.footnote).foregroundStyle(app.pal.sub)
                }
                Spacer()
                Button("Find hotel") { showHotels = true }
                    .buttonStyle(CapsuleButtonStyle(kind: .prominent, pal: app.pal, compact: true))
            }
            .card(app.pal)
        }
    }

    private var askCard: some View {
        VStack(alignment: .leading, spacing: 12) {
            (Text("Shall we handle ")
             + Text("getting there?").italic().foregroundColor(app.pal.accent))
                .font(.system(size: 22, weight: .medium, design: .serif))
                .foregroundStyle(app.pal.ink)
            Text("Flights, a hotel, price protection, and your $300 travel credit — booked right here. City Key arms itself for \(app.curTrip.city) the moment you confirm.")
                .font(.footnote).foregroundStyle(app.pal.sub)
                .fixedSize(horizontal: false, vertical: true)
            HStack(spacing: 10) {
                Button("Yes, let's book") { app.setTravelIntent(app.curTripID, true) }
                    .buttonStyle(CapsuleButtonStyle(kind: .prominent, pal: app.pal))
                Button("I'll handle it") { app.setTravelIntent(app.curTripID, false) }
                    .buttonStyle(CapsuleButtonStyle(kind: .quiet, pal: app.pal))
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .card(app.pal)
    }

    private var skipRow: some View {
        HStack {
            Text("Booking handled elsewhere for this trip.")
                .font(.footnote).foregroundStyle(app.pal.faint)
            Spacer()
            Button("Actually, book") { app.setTravelIntent(app.curTripID, true) }
                .font(.footnote.weight(.semibold))
                .foregroundStyle(app.pal.accent)
                .buttonStyle(.plain)
        }
        .padding(.horizontal, 6)
    }

    // ── Shopping · hero offer with trip-context reasoning + kit row ──
    private var shoppingIntelligence: some View {
        let trip = app.curTrip
        let reasons = shoppingReasons(trip)
        return VStack(alignment: .leading, spacing: 14) {
            // hero offer
            VStack(alignment: .leading, spacing: 12) {
                HStack {
                    Text("Top offer · matched to this trip")
                        .font(.caption2.weight(.semibold))
                        .tracking(1.2)
                        .textCase(.uppercase)
                        .foregroundStyle(app.pal.accent)
                    Spacer()
                    HStack(spacing: 5) {
                        Image(systemName: trip.wxKind.icon)
                            .font(.system(size: 10, weight: .semibold))
                        Text(trip.wxLabel)
                            .font(.caption2.weight(.semibold))
                    }
                    .foregroundStyle(app.pal.sub)
                }
                HStack(alignment: .center, spacing: 14) {
                    IconBadge(symbol: sym(trip.heroOffer.icon), tint: app.pal.accent, size: 44)
                    VStack(alignment: .leading, spacing: 2) {
                        Text(trip.heroOffer.name)
                            .font(.body.weight(.semibold)).foregroundStyle(app.pal.ink)
                        Text("on \(trip.heroOffer.retailer) · \(money(trip.heroOffer.price))")
                            .font(.footnote).foregroundStyle(app.pal.sub)
                    }
                    Spacer()
                }
                VStack(alignment: .leading, spacing: 7) {
                    ForEach(reasons, id: \.self) { r in
                        HStack(alignment: .top, spacing: 8) {
                            Circle().fill(app.pal.accent.opacity(0.5))
                                .frame(width: 4, height: 4)
                                .padding(.top, 6)
                            Text(r).font(.footnote).foregroundStyle(app.pal.sub)
                                .fixedSize(horizontal: false, vertical: true)
                        }
                    }
                }
                Button("Buy on \(trip.heroOffer.retailer) · Pay with Paze") {
                    app.buyShopping(trip.heroOffer)
                }
                .buttonStyle(CapsuleButtonStyle(kind: .prominent, pal: app.pal))
                .frame(maxWidth: .infinity)
            }
            .card(app.pal)

            // kit
            ScrollView(.horizontal) {
                HStack(spacing: 12) {
                    ForEach(trip.shopping) { item in
                        VStack(alignment: .leading, spacing: 8) {
                            IconBadge(symbol: sym(item.icon), tint: app.pal.sub, size: 34)
                            Text(item.name)
                                .font(.footnote.weight(.semibold))
                                .foregroundStyle(app.pal.ink)
                                .fixedSize(horizontal: false, vertical: true)
                            Text("on \(item.retailer)")
                                .font(.caption2).foregroundStyle(app.pal.faint)
                            Button("Buy · \(money(item.price))") { app.buyShopping(item) }
                                .buttonStyle(CapsuleButtonStyle(kind: .tinted, pal: app.pal, compact: true))
                        }
                        .frame(width: 136, alignment: .leading)
                        .card(app.pal, padding: 14)
                    }
                }
                .padding(.vertical, 3)
                .padding(.horizontal, 2)
            }
            .scrollIndicators(.hidden)
            .scrollClipDisabled()
        }
    }

    private func shoppingReasons(_ trip: Trip) -> [String] {
        var r: [String] = []
        let day1 = trip.days.first?.stops.map(\.title) ?? []
        if day1.count >= 2 {
            r.append("Day 1 runs \(day1.first!) → \(day1.last!) — hours out, back to back.")
        } else {
            r.append("Your plan leans outdoors once stops land.")
        }
        r.append("Forecast: \(trip.wxLabel) across \(trip.dates).")
        r.append(trip.wxKind.localLine)
        return r
    }

    // ── Price Watch ──
    private var watchedStops: [(dayIdx: Int, stopIdx: Int, stop: Stop)] {
        var out: [(Int, Int, Stop)] = []
        for (di, day) in app.curTrip.days.enumerated() {
            for (si, stop) in day.stops.enumerated() {
                if let p = stop.price, p >= 20, stop.dropApplied == nil,
                   stop.status == .idea || stop.status == .book {
                    out.append((di, si, stop))
                }
            }
        }
        return out
    }

    private var priceWatchCard: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack(spacing: 12) {
                IconBadge(symbol: "chart.line.downtrend.xyaxis", tint: app.pal.accent, size: 36)
                VStack(alignment: .leading, spacing: 1) {
                    Text("Watching \(watchedStops.count) ticket\(watchedStops.count == 1 ? "" : "s") on this plan")
                        .font(.subheadline.weight(.semibold)).foregroundStyle(app.pal.ink)
                    Text("Re-checked every 6 hours across 30,000+ sellers")
                        .font(.caption).foregroundStyle(app.pal.sub)
                }
            }
            ForEach(watchedStops, id: \.stop.id) { item in
                let d = dropFor(title: item.stop.title, price: item.stop.price ?? 0)
                HStack(spacing: 10) {
                    Text(item.stop.title)
                        .font(.footnote.weight(.semibold)).foregroundStyle(app.pal.ink)
                        .lineLimit(1)
                    Spacer()
                    Text(money(item.stop.price ?? 0))
                        .font(.caption).strikethrough().foregroundStyle(app.pal.faint)
                    Text(money((item.stop.price ?? 0) - d.save))
                        .font(.footnote.weight(.semibold)).foregroundStyle(Color.keyGreenDark)
                    Button("Apply") { app.applyDrop(app.curTripID, dayIdx: item.dayIdx, stopIdx: item.stopIdx) }
                        .buttonStyle(CapsuleButtonStyle(kind: .tinted, pal: app.pal, compact: true))
                }
                .padding(.vertical, 10).padding(.horizontal, 14)
                .background(app.pal.card2.opacity(0.6), in: RoundedRectangle(cornerRadius: 14, style: .continuous))
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .card(app.pal)
    }
}

private struct AddStopContext: Identifiable {
    let dayIdx: Int
    var id: Int { dayIdx }
}

// ── one itinerary stop ──
struct StopRow: View {
    @EnvironmentObject var app: AppState
    let stop: Stop
    let dayIdx: Int
    let stopIdx: Int

    var body: some View {
        if stop.status == .velocity {
            velocityRow
        } else {
            standardRow
        }
    }

    // stops secured by Velocity Black get the black-and-gold treatment
    private var velocityRow: some View {
        HStack(alignment: .top, spacing: 14) {
            Image(systemName: "sparkle")
                .font(.system(size: 13, weight: .medium))
                .foregroundStyle(Color.vbGold)
                .frame(width: 46, height: 30)
                .background(Color.vbInk, in: RoundedRectangle(cornerRadius: 9, style: .continuous))
            VStack(alignment: .leading, spacing: 3) {
                Text("\(stop.time) · Velocity Black")
                    .font(.caption2.weight(.semibold))
                    .tracking(1)
                    .textCase(.uppercase)
                    .foregroundStyle(Color.vbGold)
                Text(stop.title)
                    .font(.system(size: 16, weight: .medium, design: .serif))
                    .foregroundStyle(Color.vbCream)
                Text(stop.sub)
                    .font(.caption).foregroundStyle(Color.vbCream.opacity(0.55))
            }
            Spacer()
            Image(systemName: "checkmark.seal.fill")
                .font(.system(size: 15))
                .foregroundStyle(Color.vbGold)
        }
        .padding(.horizontal, 16).padding(.vertical, 14)
        .background(LinearGradient(colors: [Color(hex: 0x0E0D13), Color(hex: 0x14100A)],
                                   startPoint: .topLeading, endPoint: .bottomTrailing))
    }

    private var standardRow: some View {
        HStack(alignment: .top, spacing: 14) {
            Text(stop.time)
                .font(.system(size: 11, weight: .medium, design: .monospaced))
                .foregroundStyle(app.pal.sub)
                .frame(width: 46, height: 30)
                .background(app.pal.card2, in: RoundedRectangle(cornerRadius: 9, style: .continuous))
            VStack(alignment: .leading, spacing: 3) {
                HStack(spacing: 7) {
                    Text(stop.title)
                        .font(.subheadline.weight(.semibold))
                        .foregroundStyle(app.pal.ink)
                    if let saved = stop.dropApplied {
                        Text("−\(money(saved))")
                            .font(.caption2.weight(.semibold))
                            .foregroundStyle(Color.keyGreenDark)
                    }
                }
                Text(stop.sub)
                    .font(.footnote).foregroundStyle(app.pal.sub)
                if stop.status == .book || (stop.status == .idea && stop.dropVia != nil) {
                    HStack(spacing: 8) {
                        if stop.status == .book {
                            Button("Book · C1 Travel") {
                                app.bookStop(app.curTripID, dayIdx: dayIdx, stopIdx: stopIdx)
                            }
                            .buttonStyle(CapsuleButtonStyle(kind: .tinted, pal: app.pal, compact: true))
                        }
                        if stop.dropVia != nil {
                            Button("Pay with Paze") {
                                app.payWithPaze(app.curTripID, dayIdx: dayIdx, stopIdx: stopIdx)
                            }
                            .buttonStyle(CapsuleButtonStyle(kind: .prominent, pal: app.pal, compact: true))
                        }
                    }
                    .padding(.top, 4)
                }
                if stop.status == .bookedNow {
                    Label(stop.paidWithPaze ? "Paid with Paze · via \(stop.dropVia ?? "")" : "Booked · 5x miles earned",
                          systemImage: "checkmark.circle.fill")
                        .font(.caption.weight(.semibold))
                        .foregroundStyle(Color.keyGreenDark)
                        .padding(.top, 3)
                }
            }
            Spacer()
            if stop.status == .booked {
                Image(systemName: "checkmark.circle.fill")
                    .font(.system(size: 17))
                    .foregroundStyle(Color.keyGreenDark.opacity(0.8))
            }
        }
        .padding(.horizontal, 16).padding(.vertical, 14)
    }
}

// ── hotel results, presented as a sheet ──
struct HotelSheet: View {
    @EnvironmentObject var app: AppState
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        ZStack {
            app.pal.bg.ignoresSafeArea()
            ScrollView {
                VStack(alignment: .leading, spacing: 16) {
                    VStack(alignment: .leading, spacing: 5) {
                        (Text("Stay in ")
                         + Text("\(app.curTrip.city).").italic().foregroundColor(app.pal.accent))
                            .font(.system(size: 26, weight: .medium, design: .serif))
                            .foregroundStyle(app.pal.ink)
                        Text("Capital One Travel · 10x miles · $300 annual travel credit auto-applies")
                            .font(.footnote).foregroundStyle(app.pal.sub)
                    }
                    .padding(.top, 26)

                    ForEach(app.curTrip.hotels) { hotel in
                        HotelRow(hotel: hotel) {
                            app.bookHotel(app.curTripID, hotel)
                            dismiss()
                        }
                    }
                }
                .padding(.horizontal, 20)
                .padding(.bottom, 34)
            }
            .scrollIndicators(.hidden)
        }
    }
}

// ── one hotel result, broken out to keep the type-checker fast ──
struct HotelRow: View {
    @EnvironmentObject var app: AppState
    let hotel: Hotel
    let onBook: () -> Void

    private var isPremier: Bool { hotel.tier == "Premier Collection" }
    private var total: Double { hotel.nightly * Double(app.curTrip.nights) }
    private var net: Double { max(0, total - 300) }

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            if isPremier {
                HStack(spacing: 6) {
                    Image(systemName: "sparkle").font(.system(size: 9))
                    Text("Premier Collection")
                        .font(.caption2.weight(.semibold))
                        .tracking(1.6)
                        .textCase(.uppercase)
                }
                .foregroundStyle(Color.vbGold)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 8)
                .background(Color.vbInk)
            }
            HStack(alignment: .top, spacing: 12) {
                VStack(alignment: .leading, spacing: 3) {
                    Text(hotel.name)
                        .font(.system(size: 18, weight: .medium, design: .serif))
                        .foregroundStyle(app.pal.ink)
                    Text("\(hotel.area) · \(hotel.tier)")
                        .font(.footnote).foregroundStyle(app.pal.sub)
                    Text("\(money(hotel.nightly))/night · \(money(net)) after credit")
                        .font(.caption.weight(.semibold))
                        .foregroundStyle(Color.keyGreenDark)
                        .padding(.top, 2)
                }
                Spacer()
                Button("Book", action: onBook)
                    .buttonStyle(CapsuleButtonStyle(kind: .prominent, pal: app.pal, compact: true))
            }
            .padding(16)
        }
        .background(app.pal.card)
        .clipShape(RoundedRectangle(cornerRadius: 22, style: .continuous))
        .overlay(RoundedRectangle(cornerRadius: 22, style: .continuous)
            .strokeBorder(isPremier ? Color.vbGold.opacity(0.4) : .clear))
        .shadow(color: .black.opacity(app.act == .midnight ? 0 : 0.05), radius: 12, y: 5)
    }
}

// ── add-a-stop authoring sheet ──
struct AddStopSheet: View {
    @EnvironmentObject var app: AppState
    @Environment(\.dismiss) private var dismiss
    let dayIdx: Int
    @State private var title = ""
    @State private var time = "12:00"
    @State private var priceText = ""

    var body: some View {
        ZStack {
            app.pal.bg.ignoresSafeArea()
            VStack(alignment: .leading, spacing: 14) {
                (Text("New ") + Text("stop.").italic().foregroundColor(app.pal.accent))
                    .font(.system(size: 26, weight: .medium, design: .serif))
                    .foregroundStyle(app.pal.ink)
                    .padding(.top, 28)
                TextField("What's the plan? e.g. Tsukiji fish market", text: $title)
                    .textFieldStyle(.plain)
                    .padding(14)
                    .background(app.pal.card, in: RoundedRectangle(cornerRadius: 14, style: .continuous))
                HStack(spacing: 10) {
                    TextField("12:00", text: $time)
                        .textFieldStyle(.plain)
                        .padding(14)
                        .frame(width: 104)
                        .background(app.pal.card, in: RoundedRectangle(cornerRadius: 14, style: .continuous))
                    TextField("Price $ (optional → bookable)", text: $priceText)
                        .textFieldStyle(.plain)
                        .padding(14)
                        .background(app.pal.card, in: RoundedRectangle(cornerRadius: 14, style: .continuous))
                }
                Button("Add stop") {
                    app.addStop(app.curTripID, dayIdx: dayIdx, title: title, time: time, price: Double(priceText))
                    dismiss()
                }
                .buttonStyle(CapsuleButtonStyle(kind: .prominent, pal: app.pal))
                .frame(maxWidth: .infinity)
                .disabled(title.trimmingCharacters(in: .whitespaces).isEmpty)
                Spacer()
            }
            .padding(.horizontal, 22)
        }
    }
}

// ── new-trip authoring sheet ──
struct NewTripSheet: View {
    @EnvironmentObject var app: AppState
    @State private var city = ""
    @State private var mate = ""
    @State private var nights = 3

    var body: some View {
        ZStack {
            app.pal.bg.ignoresSafeArea()
            VStack(alignment: .leading, spacing: 14) {
                (Text("Plan your next ") + Text("Venture.").italic().foregroundColor(app.pal.accent))
                    .font(.system(size: 26, weight: .medium, design: .serif))
                    .foregroundStyle(app.pal.ink)
                    .padding(.top, 28)
                Text("Name a city and City Key drafts the line — stations, rewards, and all.")
                    .font(.footnote).foregroundStyle(app.pal.sub)

                TextField("Where to? e.g. Tokyo, Lisbon, Rome", text: $city)
                    .textFieldStyle(.plain)
                    .padding(14)
                    .background(app.pal.card, in: RoundedRectangle(cornerRadius: 14, style: .continuous))
                TextField("Tripmate (optional)", text: $mate)
                    .textFieldStyle(.plain)
                    .padding(14)
                    .background(app.pal.card, in: RoundedRectangle(cornerRadius: 14, style: .continuous))
                Stepper("Nights: \(nights)", value: $nights, in: 1...10)
                    .font(.subheadline.weight(.medium))
                    .foregroundStyle(app.pal.ink)
                    .padding(14)
                    .background(app.pal.card, in: RoundedRectangle(cornerRadius: 14, style: .continuous))

                Button("Draw the line") {
                    app.createTrip(city: city, mate: mate, nights: nights)
                }
                .buttonStyle(CapsuleButtonStyle(kind: .prominent, pal: app.pal))
                .frame(maxWidth: .infinity)
                .disabled(city.trimmingCharacters(in: .whitespaces).isEmpty)

                Text("City Key auto-provisions reward stations for any destination — no itinerary required.")
                    .font(.caption2).foregroundStyle(app.pal.faint)
                Spacer()
            }
            .padding(.horizontal, 22)
        }
    }
}
