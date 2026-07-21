import SwiftUI

// ═══ IGNITION SPLASH · full-screen takeover on the first out-of-market swipe ═══

struct IgnitionSplash: View {
    @EnvironmentObject var app: AppState
    @State private var keyIn = false
    @State private var textIn = false

    var body: some View {
        ZStack {
            LinearGradient(colors: [Color(hex: 0x040910), Color(hex: 0x0B2A3E), Color(hex: 0x0B5876)],
                           startPoint: .topLeading, endPoint: .bottomTrailing)
                .ignoresSafeArea()
            VStack(spacing: 22) {
                Image(systemName: "key.fill")
                    .font(.system(size: 52, weight: .light))
                    .foregroundStyle(Color(hex: 0x6FD6E8))
                    .rotationEffect(.degrees(keyIn ? 0 : -90))
                    .scaleEffect(keyIn ? 1 : 0.3)
                    .opacity(keyIn ? 1 : 0)
                    .frame(width: 110, height: 110)
                    .background(.white.opacity(0.06), in: Circle())
                    .overlay(Circle().strokeBorder(.white.opacity(0.1)))

                VStack(spacing: 12) {
                    Text("Out-of-market swipe · \(app.curTrip.zip) ≠ 20120")
                        .font(.caption2.weight(.semibold))
                        .tracking(2)
                        .textCase(.uppercase)
                        .foregroundStyle(Color(hex: 0x6FD6E8))

                    (Text("City Key, ") + Text("activated.").italic())
                        .font(.system(size: 36, weight: .medium, design: .serif))
                        .foregroundStyle(.white)

                    Text(app.curTrip.welcome)
                        .font(.subheadline)
                        .foregroundStyle(.white.opacity(0.85))

                    Text("Every swipe now moves you down the line.\nNo GPS. No check-ins.")
                        .font(.caption)
                        .multilineTextAlignment(.center)
                        .foregroundStyle(.white.opacity(0.45))
                }
                .opacity(textIn ? 1 : 0)
                .offset(y: textIn ? 0 : 14)
            }
            .padding(32)
        }
        .onAppear {
            withAnimation(.spring(duration: 0.7, bounce: 0.4)) { keyIn = true }
            withAnimation(.easeOut(duration: 0.5).delay(0.35)) { textIn = true }
        }
        .interactiveDismissDisabled()
    }
}

// ═══ TRIP WRAPPED · boarding pass + Zelle split ═══

struct WrapView: View {
    @EnvironmentObject var app: AppState
    @Environment(\.dismiss) private var dismiss

    private var trip: Trip { app.liveTrip ?? app.curTrip }
    private var session: TripSession { app.sessions[trip.id] ?? TripSession() }
    private let pal = Palette.dawn

    var body: some View {
        ZStack {
            pal.bg.ignoresSafeArea()
            Aurora(pal: pal)
            ScrollView {
                VStack(alignment: .leading, spacing: 20) {
                    VStack(alignment: .leading, spacing: 6) {
                        Text("Trip settled")
                            .font(.caption2.weight(.semibold))
                            .tracking(1.6)
                            .textCase(.uppercase)
                            .foregroundStyle(pal.accent)
                        HeroTitle(word: trip.heroWord, state: "wrapped.", pal: pal)
                        Text("Wheels down. Here's what your card did while you weren't looking at it.")
                            .font(.subheadline).foregroundStyle(pal.sub)
                    }
                    .padding(.top, 28)

                    boardingPass.drift()

                    if !trip.mate.isEmpty {
                        splitModule.drift()
                    }

                    ShareLink(item: shareText) {
                        Label("Share your Wrapped", systemImage: "square.and.arrow.up")
                            .font(.system(size: 15, weight: .semibold))
                            .foregroundStyle(.white)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 14)
                            .background(pal.accent, in: Capsule())
                    }

                    Button {
                        dismiss()
                        app.tab = .home
                    } label: {
                        Text("Done")
                            .font(.system(size: 15, weight: .semibold))
                            .foregroundStyle(pal.sub)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 13)
                            .background(pal.card2, in: Capsule())
                    }
                    .buttonStyle(.plain)
                }
                .padding(.horizontal, 22)
                .padding(.bottom, 40)
            }
            .scrollIndicators(.hidden)
        }
    }

    private var shareText: String {
        "\(trip.heroWord), wrapped — \(money(session.spend)) on the ground · \(stationsUnlocked)/3 City Key stations unlocked · Venture X"
    }

    private var stationsUnlocked: Int {
        trip.tiers.filter { session.spend >= $0.threshold }.count
    }

    private var boardingPass: some View {
        VStack(spacing: 0) {
            VStack(alignment: .leading, spacing: 16) {
                Text("Venture Key · Trip Wrapped")
                    .font(.caption2.weight(.semibold))
                    .tracking(2)
                    .textCase(.uppercase)
                    .foregroundStyle(.white.opacity(0.5))
                Text(trip.wrapAirports)
                    .font(.system(size: 40, weight: .regular, design: .serif))
                    .foregroundStyle(.white)
                Text("\(trip.wrapPlace) · with \(trip.mate)")
                    .font(.footnote).foregroundStyle(.white.opacity(0.65))

                let cols = [GridItem(.flexible()), GridItem(.flexible())]
                LazyVGrid(columns: cols, alignment: .leading, spacing: 16) {
                    stat("Trip ledger", money(session.spend))
                    stat("Miles earned", "\(Int(session.spend * 2).formatted())", tint: Color(hex: 0x6FD6E8))
                    stat("Stations", "\(stationsUnlocked) of 3")
                    stat("Offers redeemed", money2(session.redeemedOfferTotal), tint: Color(hex: 0x6FD6E8))
                }
            }
            .padding(24)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(
                LinearGradient(colors: [Color(hex: 0x1B1030), Color(hex: 0x013D5B), Color(hex: 0xC96A2E)],
                               startPoint: .topLeading, endPoint: .bottomTrailing)
            )

            HStack {
                Text("Boarding pass · Venture Key")
                    .font(.caption2.weight(.medium))
                    .tracking(1.2)
                    .textCase(.uppercase)
                    .foregroundStyle(.white.opacity(0.45))
                Spacer()
                Barcode()
                    .frame(width: 104, height: 24)
                    .foregroundStyle(.white.opacity(0.6))
            }
            .padding(.horizontal, 24).padding(.vertical, 15)
            .background(Color(hex: 0x0F1219))
        }
        .clipShape(RoundedRectangle(cornerRadius: 26, style: .continuous))
        .shadow(color: .black.opacity(0.22), radius: 24, y: 14)
    }

    private func stat(_ label: String, _ value: String, tint: Color = .white) -> some View {
        VStack(alignment: .leading, spacing: 3) {
            Text(label)
                .font(.system(size: 9, weight: .medium))
                .tracking(1.4)
                .textCase(.uppercase)
                .foregroundStyle(.white.opacity(0.45))
            Text(value).font(.system(size: 21, weight: .semibold)).foregroundStyle(tint)
        }
    }

    // ── Zelle split — money lands in 360 Checking, never on the card ──
    private var splitModule: some View {
        let per = session.spend / 2
        let req = session.zelle.last

        return VStack(alignment: .leading, spacing: 14) {
            HStack(spacing: 10) {
                IconBadge(symbol: "bolt.fill", tint: .zelle, size: 32)
                Text("Split this trip · Zelle®")
                    .font(.subheadline.weight(.semibold))
                    .foregroundStyle(pal.ink)
            }
            Text("You fronted \(money(session.spend)) on Venture X — \(trip.mate)'s share is \(money(per)).")
                .font(.footnote)
                .foregroundStyle(pal.sub)

            HStack(spacing: 12) {
                Text(String(trip.mate.prefix(1)))
                    .font(.system(size: 14, weight: .semibold)).foregroundStyle(.white)
                    .frame(width: 36, height: 36)
                    .background(Color(hex: 0x013D5B), in: Circle())
                Text(trip.mate)
                    .font(.subheadline.weight(.semibold)).foregroundStyle(pal.ink)
                Spacer()
                switch req?.status {
                case .received:
                    Tag(text: "Paid", color: .keyGreenDark)
                case .requested:
                    Tag(text: "Pending", color: Color(hex: 0xB45309))
                case nil:
                    Button("Request \(money(per))") { app.requestZelle() }
                        .buttonStyle(CapsuleButtonStyle(kind: .prominent, pal: pal, compact: true))
                        .tint(.zelle)
                }
            }
            if req?.status == .received {
                Text("\(money2(req!.amount)) received into 360 Checking.")
                    .font(.caption).foregroundStyle(pal.sub)
            } else if req?.status == .requested {
                Text("They'll approve it in their own bank's app — the simulator's bell stands in for that.")
                    .font(.caption).foregroundStyle(pal.faint)
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .card(pal)
    }
}

// simple deterministic barcode stripes
struct Barcode: View {
    var body: some View {
        Canvas { ctx, size in
            var x: CGFloat = 0
            var seed: UInt64 = 0x9E3779B9
            while x < size.width {
                seed = seed &* 6364136223846793005 &+ 1442695040888963407
                let w = CGFloat(seed % 3) + 1
                if seed % 5 != 0 {
                    ctx.fill(Path(CGRect(x: x, y: 0, width: w, height: size.height)), with: .foreground)
                }
                x += w + 2
            }
        }
    }
}
