import SwiftUI

// ═══ CITY KEY · the Line — dormant / armed / live ═══

struct CityKeyView: View {
    @EnvironmentObject var app: AppState

    private var session: TripSession { app.sessions[app.curTripID]! }
    private var live: Bool { app.liveTripID == app.curTripID && session.active }

    var body: some View {
        Screen(word: app.curTrip.heroWord, state: stateWord,
               subtitle: heroSub, showVBButton: live) {
            if live {
                spendRail.drift()
                SectionHeader(text: "The line", pal: app.pal)
                LineView(trip: app.curTrip, session: session)
            } else {
                dormantCard.drift()
            }
        }
    }

    private var stateWord: String {
        if live { return "alive." }
        if session.armed { return "armed." }
        return "asleep."
    }

    private var heroSub: String {
        if live { return "The line is lit. Every swipe moves you toward the next station." }
        if session.armed, let h = session.hotel {
            return "Base Camp is set at \(h.name). Ignites at check-in — or your first swipe."
        }
        return "The line is dark. Your first out-of-market swipe lights it."
    }

    private var dormantCard: some View {
        VStack(spacing: 14) {
            Image(systemName: session.armed ? "key.radiowaves.forward.fill" : "key.fill")
                .font(.system(size: 34, weight: .light))
                .foregroundStyle(session.armed ? app.pal.accent : app.pal.faint)
                .symbolEffect(.bounce, value: session.armed)
                .frame(width: 74, height: 74)
                .background(app.pal.card2.opacity(0.7), in: Circle())
            Text(session.armed ? "Armed for \(app.curTrip.city)" : "The line is dark")
                .font(.title3.weight(.semibold))
                .foregroundStyle(app.pal.ink)
            Text(session.armed
                 ? "A Capital One Travel booking told us where and when — no GPS, no check-ins needed."
                 : "City Key ignites on your first out-of-market card swipe. No itinerary needed. No GPS.")
                .font(.footnote)
                .foregroundStyle(app.pal.sub)
                .multilineTextAlignment(.center)
                .fixedSize(horizontal: false, vertical: true)
                .padding(.horizontal, 10)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 40)
        .card(app.pal)
    }

    private var spendRail: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack(alignment: .firstTextBaseline) {
                Text("Destination spend")
                    .font(.caption2.weight(.semibold))
                    .tracking(1.2)
                    .textCase(.uppercase)
                    .foregroundStyle(app.pal.faint)
                Spacer()
                if let next = app.curTrip.tiers.first(where: { session.spend < $0.threshold }) {
                    Text("\(money(next.threshold - session.spend)) to Station \(next.id)")
                        .font(.caption.weight(.semibold))
                        .foregroundStyle(app.pal.accent)
                } else {
                    Text("All stations unlocked")
                        .font(.caption.weight(.semibold))
                        .foregroundStyle(Color.keyGreenDark)
                }
            }
            Text(money(session.spend))
                .font(.system(size: 44, weight: .medium, design: .serif))
                .foregroundStyle(app.pal.ink)
                .contentTransition(.numericText())

            GeometryReader { geo in
                ZStack(alignment: .leading) {
                    Capsule().fill(app.pal.card2)
                    Capsule()
                        .fill(LinearGradient(colors: [app.pal.accent, .keyGreen],
                                             startPoint: .leading, endPoint: .trailing))
                        .frame(width: geo.size.width * progressFraction)
                }
            }
            .frame(height: 6)
            .animation(.spring(duration: 0.8), value: session.spend)
        }
        .card(app.pal)
    }

    private var progressFraction: CGFloat {
        guard let next = app.curTrip.tiers.first(where: { session.spend < $0.threshold }) else { return 1 }
        return CGFloat(min(1, session.spend / next.threshold))
    }
}

// ── the Line as a native timeline ──

private enum LineEvent: Identifiable {
    case origin(String)
    case swipe(Swipe)
    case station(Tier)
    case express(VBStation)
    case terminus

    var id: String {
        switch self {
        case .origin: return "origin"
        case .swipe(let s): return s.id.uuidString
        case .station(let t): return "tier-\(t.id)"
        case .express: return "express"
        case .terminus: return "terminus"
        }
    }

    var pos: Double {
        switch self {
        case .origin: return 0
        case .swipe(let s): return s.cum
        case .station(let t): return t.threshold
        case .express(let v): return v.threshold
        case .terminus: return .infinity
        }
    }
}

struct LineView: View {
    @EnvironmentObject var app: AppState
    let trip: Trip
    let session: TripSession

    private var events: [LineEvent] {
        var e: [LineEvent] = [.origin(trip.zip)]
        var mixed: [LineEvent] = trip.tiers.map { .station($0) } + session.swipes.map { .swipe($0) }
        if let vbs = trip.vbStation { mixed.append(.express(vbs)) }
        mixed.sort {
            if $0.pos != $1.pos { return $0.pos < $1.pos }
            if case .swipe = $0 { return false }
            return true
        }
        e.append(contentsOf: mixed)
        e.append(.terminus)
        return e
    }

    var body: some View {
        VStack(spacing: 0) {
            let evs = events
            ForEach(Array(evs.enumerated()), id: \.element.id) { idx, ev in
                LineRow(
                    event: ev,
                    isLast: idx == evs.count - 1,
                    segmentFill: segmentFill(from: ev.pos, to: idx + 1 < evs.count ? evs[idx + 1].pos : .infinity)
                )
                .drift()
            }
        }
    }

    private func segmentFill(from a: Double, to b: Double) -> Double {
        guard b.isFinite, b > a else { return 0 }
        return min(1, max(0, (session.spend - a) / (b - a)))
    }
}

private struct LineRow: View {
    @EnvironmentObject var app: AppState
    let event: LineEvent
    let isLast: Bool
    let segmentFill: Double

    var body: some View {
        HStack(alignment: .top, spacing: 16) {
            VStack(spacing: 0) {
                node
                if !isLast {
                    ZStack(alignment: .top) {
                        Rectangle().fill(app.pal.card2).frame(width: 3)
                        GeometryReader { geo in
                            Rectangle()
                                .fill(LinearGradient(colors: [app.pal.accent, .keyGreen],
                                                     startPoint: .top, endPoint: .bottom))
                                .frame(width: 3, height: geo.size.height * segmentFill)
                        }
                        .frame(width: 3)
                    }
                    .frame(width: 3)
                    .frame(maxHeight: .infinity)
                }
            }
            .frame(width: 36)

            content
                .padding(.bottom, isLast ? 0 : 26)

            Spacer(minLength: 0)
        }
        .fixedSize(horizontal: false, vertical: true)
    }

    @ViewBuilder private var node: some View {
        switch event {
        case .origin:
            Circle().strokeBorder(app.pal.accent, lineWidth: 2.5)
                .frame(width: 15, height: 15)
        case .swipe:
            Circle().fill(app.pal.accent)
                .frame(width: 11, height: 11)
                .padding(.top, 5)
        case .station(let tier):
            let unlocked = isUnlocked(tier.threshold)
            Image(systemName: sym(tier.emoji))
                .font(.system(size: 13, weight: .medium))
                .foregroundStyle(unlocked ? Color.keyGreenDark : app.pal.faint)
                .frame(width: 36, height: 36)
                .background(app.pal.card, in: Circle())
                .overlay(Circle().strokeBorder(unlocked ? Color.keyGreen : app.pal.card2, lineWidth: 2.5))
                .shadow(color: unlocked ? Color.keyGreen.opacity(0.45) : .clear, radius: 8)
                .animation(.spring(duration: 0.5), value: unlocked)
        case .express(let station):
            let unlocked = isUnlocked(station.threshold)
            Image(systemName: "sparkle")
                .font(.system(size: 12, weight: .medium))
                .foregroundStyle(Color.vbGold)
                .frame(width: 36, height: 36)
                .background(Color.vbInk, in: Circle())
                .overlay(Circle().strokeBorder(Color.vbGold.opacity(unlocked ? 0.9 : 0.35), lineWidth: 2))
                .shadow(color: unlocked ? Color.vbGold.opacity(0.5) : .clear, radius: 8)
                .animation(.spring(duration: 0.5), value: unlocked)
        case .terminus:
            Circle().strokeBorder(app.pal.faint, style: StrokeStyle(lineWidth: 1.5, dash: [3]))
                .frame(width: 13, height: 13)
        }
    }

    @ViewBuilder private var content: some View {
        switch event {
        case .origin(let zip):
            VStack(alignment: .leading, spacing: 2) {
                caps("Origin", color: app.pal.faint)
                Text("Ignition — first swipe in market \(zip)")
                    .font(.footnote.weight(.medium)).foregroundStyle(app.pal.sub)
            }
        case .swipe(let s):
            HStack(spacing: 12) {
                IconBadge(symbol: sym(s.icon), tint: app.pal.accent, size: 34)
                VStack(alignment: .leading, spacing: 1) {
                    Text(s.merchant).font(.subheadline.weight(.semibold)).foregroundStyle(app.pal.ink)
                    Text(s.note).font(.caption).foregroundStyle(app.pal.sub)
                }
                Spacer()
                VStack(alignment: .trailing, spacing: 1) {
                    Text(money2(s.amount)).font(.subheadline.weight(.semibold)).foregroundStyle(app.pal.ink)
                    Text(money(s.cum)).font(.caption2).foregroundStyle(app.pal.faint)
                }
            }
            .card(app.pal, padding: 14)
        case .station(let tier):
            let unlocked = isUnlocked(tier.threshold)
            let claimed = isClaimed(tier.id)
            VStack(alignment: .leading, spacing: 4) {
                caps("Station \(tier.id) · \(money(tier.threshold)) · \(unlocked ? "unlocked" : "locked")",
                     color: unlocked ? .keyGreenDark : app.pal.faint)
                Text("\(tier.title) — \(tier.reward)")
                    .font(.system(size: 16, weight: .medium, design: .serif))
                    .foregroundStyle(unlocked ? app.pal.ink : app.pal.sub)
                if unlocked {
                    if claimed {
                        Label("Claimed · show code in store", systemImage: "checkmark.circle.fill")
                            .font(.caption.weight(.semibold)).foregroundStyle(Color.keyGreenDark)
                            .padding(.top, 2)
                    } else {
                        Button("Claim reward") { app.claim(tier.id) }
                            .buttonStyle(CapsuleButtonStyle(kind: .prominent, pal: app.pal, compact: true))
                            .tint(Color.keyGreenDark)
                            .padding(.top, 4)
                    }
                } else {
                    Text("Merchant-funded · unlocks from the auth stream")
                        .font(.caption).foregroundStyle(app.pal.faint)
                }
            }
        case .express(let station):
            expressContent(station)
        case .terminus:
            caps("End of line · keep exploring", color: app.pal.faint)
                .padding(.top, 3)
        }
    }

    @ViewBuilder private func expressContent(_ station: VBStation) -> some View {
        let unlocked = isUnlocked(station.threshold)
        VStack(alignment: .leading, spacing: 4) {
            if unlocked {
                caps("Velocity Black · express unlocked", color: .vbGold)
                Text(station.title)
                    .font(.system(size: 16, weight: .medium, design: .serif))
                    .foregroundStyle(app.pal.ink)
                Text(station.desc)
                    .font(.footnote).foregroundStyle(app.pal.sub)
                if expressAccepted {
                    Label("On your plan — concierge will confirm timing", systemImage: "sparkle")
                        .font(.caption.weight(.semibold))
                        .foregroundStyle(Color.vbGold)
                        .padding(.top, 2)
                } else {
                    HStack(spacing: 8) {
                        Button("Accept") { app.acceptExpress() }
                            .buttonStyle(CapsuleButtonStyle(kind: .gold, pal: app.pal, compact: true))
                        Button("Ask the concierge") { app.showVB = true }
                            .buttonStyle(CapsuleButtonStyle(kind: .quiet, pal: app.pal, compact: true))
                    }
                    .padding(.top, 4)
                }
            } else {
                caps("Express station", color: app.pal.faint)
                Text("Something the city doesn't sell")
                    .font(.system(size: 16, weight: .medium, design: .serif))
                    .italic()
                    .foregroundStyle(app.pal.sub)
                Text("Keep moving down the line — reserved for Venture X · Velocity Black")
                    .font(.caption).foregroundStyle(app.pal.faint)
            }
        }
    }

    private func caps(_ text: String, color: Color) -> some View {
        Text(text)
            .font(.caption2.weight(.semibold))
            .tracking(1.1)
            .textCase(.uppercase)
            .foregroundStyle(color)
    }

    private func isUnlocked(_ threshold: Double) -> Bool {
        guard let id = app.liveTripID else { return false }
        return (app.sessions[id]?.spend ?? 0) >= threshold
    }

    private func isClaimed(_ tierID: Int) -> Bool {
        guard let id = app.liveTripID else { return false }
        return app.sessions[id]?.claimed.contains(tierID) ?? false
    }

    private var expressAccepted: Bool {
        guard let id = app.liveTripID else { return false }
        return app.sessions[id]?.vbExpress ?? false
    }
}
