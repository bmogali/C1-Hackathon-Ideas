import SwiftUI

struct HomeView: View {
    @EnvironmentObject var app: AppState

    var body: some View {
        Screen(word: "Where to", state: "next?", sep: " ", subtitle: "Good evening, Bharath") {
            VentureCardView().drift()

            SectionHeader(text: "Your trips", pal: app.pal)
            VStack(spacing: 12) {
                ForEach(app.tripOrder, id: \.self) { id in
                    tripRow(id).drift()
                }
                Button { app.showNewTrip = true } label: {
                    HStack(spacing: 10) {
                        Image(systemName: "plus")
                            .font(.system(size: 13, weight: .semibold))
                        Text("Plan your next Venture")
                            .font(.subheadline.weight(.semibold))
                        Spacer()
                    }
                    .foregroundStyle(app.pal.accent)
                    .padding(.horizontal, 18).padding(.vertical, 15)
                    .background(app.pal.accent.opacity(0.08), in: RoundedRectangle(cornerRadius: 22, style: .continuous))
                }
                .buttonStyle(.plain)
                .disabled(app.liveTripID != nil)
                .drift()
            }

            SectionHeader(text: "City Key", pal: app.pal)
            cityKeyRow.drift()

            if app.incomingPending {
                SectionHeader(text: "Requests", pal: app.pal)
                zelleRequestCard.drift()
            }
        }
    }

    private func tripRow(_ id: String) -> some View {
        let trip = app.trips[id]!
        return Button {
            app.selectTrip(id)
            app.tab = .plan
        } label: {
            HStack(spacing: 14) {
                Text(trip.flag)
                    .font(.system(size: 22))
                    .frame(width: 40, height: 40)
                    .background(app.pal.card2, in: Circle())
                VStack(alignment: .leading, spacing: 2) {
                    Text(trip.heroWord)
                        .font(.body.weight(.semibold))
                        .foregroundStyle(app.pal.ink)
                    Text("\(trip.dates)\(trip.mate.isEmpty ? "" : " · with \(trip.mate)")")
                        .font(.footnote)
                        .foregroundStyle(app.pal.sub)
                }
                Spacer()
                if app.liveTripID == id {
                    Tag(text: "Live", color: .c1Red)
                } else if app.sessions[id]?.armed == true {
                    Tag(text: "Armed", color: .keyGreenDark)
                }
                Image(systemName: "chevron.right")
                    .font(.system(size: 13, weight: .semibold))
                    .foregroundStyle(app.pal.faint)
            }
            .card(app.pal, padding: 14)
        }
        .buttonStyle(.plain)
    }

    private var ckLive: Bool { app.liveTripID != nil }

    private var cityKeyRow: some View {
        Button { app.tab = .cityKey } label: {
            HStack(spacing: 14) {
                IconBadge(symbol: "key.radiowaves.forward",
                          tint: ckLive ? app.pal.accent : app.pal.faint, size: 40)
                VStack(alignment: .leading, spacing: 2) {
                    Text(ckLive ? "Live in \(app.liveTrip?.city ?? "")" : "Dormant")
                        .font(.body.weight(.semibold))
                        .foregroundStyle(ckLive ? app.pal.accent : app.pal.ink)
                    Text(ckLive ? "The line is lit — tap to view" : "Wakes on your first swipe out of market")
                        .font(.footnote).foregroundStyle(app.pal.sub)
                }
                Spacer()
                Image(systemName: "chevron.right")
                    .font(.system(size: 13, weight: .semibold))
                    .foregroundStyle(app.pal.faint)
            }
            .card(app.pal, padding: 14)
        }
        .buttonStyle(.plain)
    }

    private var zelleRequestCard: some View {
        VStack(alignment: .leading, spacing: 14) {
            HStack(spacing: 12) {
                IconBadge(symbol: "bolt.fill", tint: .zelle, size: 36)
                VStack(alignment: .leading, spacing: 1) {
                    Text("\(app.incomingFrom) requested \(money2(app.incomingAmount))")
                        .font(.subheadline.weight(.semibold))
                        .foregroundStyle(app.pal.ink)
                    Text("\(app.incomingMemo) · Zelle®")
                        .font(.footnote).foregroundStyle(app.pal.sub)
                }
                Spacer()
            }
            HStack(spacing: 10) {
                Button("Pay") { app.payIncoming() }
                    .buttonStyle(CapsuleButtonStyle(kind: .prominent, pal: app.pal, compact: true))
                Button("Decline") { app.declineIncoming() }
                    .buttonStyle(CapsuleButtonStyle(kind: .quiet, pal: app.pal, compact: true))
                Spacer()
            }
        }
        .card(app.pal)
    }
}

// ── the Venture X card, rendered as an object ──
struct VentureCardView: View {
    @EnvironmentObject var app: AppState

    var body: some View {
        Button { app.tab = .wallet } label: {
            VStack(alignment: .leading, spacing: 0) {
                HStack {
                    Text("VENTURE X")
                        .font(.system(size: 11, weight: .semibold))
                        .kerning(2.4)
                        .opacity(0.6)
                    Spacer()
                    Image("CapitalOneLogoDark")
                        .resizable()
                        .scaledToFit()
                        .frame(height: 20)
                }
                Spacer()
                RoundedRectangle(cornerRadius: 5, style: .continuous)
                    .fill(LinearGradient(colors: [Color(hex: 0xE3C173), Color(hex: 0xA98735)],
                                         startPoint: .topLeading, endPoint: .bottomTrailing))
                    .frame(width: 36, height: 26)
                Spacer().frame(height: 14)
                Text("••••  ••••  ••••  4907")
                    .font(.system(size: 14, weight: .regular, design: .monospaced))
                    .kerning(1.2)
                    .opacity(0.75)
                Spacer().frame(height: 16)
                HStack(alignment: .bottom) {
                    VStack(alignment: .leading, spacing: 3) {
                        Text("BALANCE").font(.system(size: 9, weight: .medium)).kerning(1.6).opacity(0.5)
                        Text(money2(app.vxBalance)).font(.system(size: 20, weight: .semibold))
                            .contentTransition(.numericText())
                    }
                    Spacer()
                    VStack(alignment: .trailing, spacing: 3) {
                        Text("MILES").font(.system(size: 9, weight: .medium)).kerning(1.6).opacity(0.5)
                        Text(app.vxMiles.formatted())
                            .font(.system(size: 18, weight: .semibold))
                            .foregroundStyle(Color(hex: 0x6FD6E8))
                            .contentTransition(.numericText())
                    }
                }
            }
            .foregroundStyle(.white)
            .padding(22)
            .frame(maxWidth: .infinity)
            .aspectRatio(1.62, contentMode: .fit)
            .background(
                LinearGradient(colors: [Color(hex: 0x0C1B2A), Color(hex: 0x143247), Color(hex: 0x0A2236)],
                               startPoint: .topLeading, endPoint: .bottomTrailing),
                in: RoundedRectangle(cornerRadius: 26, style: .continuous)
            )
            .overlay(
                RoundedRectangle(cornerRadius: 26, style: .continuous)
                    .strokeBorder(.white.opacity(0.08))
            )
            .shadow(color: Color(hex: 0x0C1B2A).opacity(0.35), radius: 24, y: 14)
        }
        .buttonStyle(.plain)
    }
}
