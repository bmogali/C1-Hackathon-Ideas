import SwiftUI

// ═══ AUTH-STREAM SIMULATOR · the demo remote control ═══
// Stands in for real card-network events; every button is one webhook.

struct SimulatorSheet: View {
    @EnvironmentObject var app: AppState

    var body: some View {
        ZStack {
            Color(hex: 0x0B0F14).ignoresSafeArea()
            ScrollView {
                VStack(alignment: .leading, spacing: 14) {
                    HStack(spacing: 7) {
                        Circle().fill(Color(hex: 0x34D399)).frame(width: 6, height: 6)
                        Text("Auth stream · live")
                            .font(.caption2.weight(.semibold))
                            .tracking(1.6)
                            .textCase(.uppercase)
                            .foregroundStyle(Color(hex: 0x34D399))
                        Spacer()
                    }
                    .padding(.top, 24)

                    (Text("The ") + Text("simulator.").italic().foregroundColor(Color(hex: 0x4CC8DE)))
                        .font(.system(size: 26, weight: .medium, design: .serif))
                        .foregroundStyle(.white)
                    Text("Inject card swipes for \(app.standaloneMode ? "an unplanned city" : app.curTrip.city) and watch the app react in real time.")
                        .font(.footnote)
                        .foregroundStyle(.white.opacity(0.55))

                    // standalone: prove City Key needs no plan at all
                    if !app.firedIgnite {
                        Button { app.standaloneMode.toggle() } label: {
                            HStack(spacing: 12) {
                                Image(systemName: "dice")
                                    .font(.system(size: 16, weight: .medium))
                                    .foregroundStyle(Color(hex: 0x4CC8DE))
                                VStack(alignment: .leading, spacing: 1) {
                                    Text("Standalone — no plan on file")
                                        .font(.subheadline.weight(.semibold)).foregroundStyle(.white)
                                    Text("Ignition self-provisions Chicago from MSA + MCC alone")
                                        .font(.caption2).foregroundStyle(.white.opacity(0.5))
                                }
                                Spacer()
                                Image(systemName: app.standaloneMode ? "checkmark.circle.fill" : "circle")
                                    .foregroundStyle(app.standaloneMode ? Color(hex: 0x4CC8DE) : .white.opacity(0.25))
                            }
                            .padding(.horizontal, 16).padding(.vertical, 12)
                            .background(.white.opacity(app.standaloneMode ? 0.12 : 0.05),
                                        in: RoundedRectangle(cornerRadius: 18, style: .continuous))
                        }
                        .buttonStyle(.plain)
                    }

                    VStack(spacing: 9) {
                        simButton("cup.and.saucer.fill", "Home swipe", "Starbucks · $4.50 · zip 20120 — engine stays passive",
                                  enabled: true) { app.fireHomeSwipe() }

                        simButton("airplane.departure", "First out-of-town swipe",
                                  app.standaloneMode
                                  ? "The Drake Hotel · $130 · zip 60611 — no itinerary exists"
                                  : "\(app.curTrip.ignition.merchant) · \(money(app.curTrip.ignition.amount)) · zip \(app.curTrip.zip)",
                                  enabled: !app.firedIgnite, prominent: true) { app.fireIgnition() }

                        simButton(sym(app.curTrip.swipe2.icon), app.curTrip.swipe2.merchant,
                                  "\(money(app.curTrip.swipe2.amount)) · progress toward Station 2",
                                  enabled: app.firedIgnite && !app.firedS2) { app.fireProgressSwipe() }

                        simButton(sym(app.curTrip.swipe3.icon), app.curTrip.swipe3.merchant,
                                  "\(money(app.curTrip.swipe3.amount)) · crosses Station 2",
                                  enabled: app.firedS2 && !app.firedS3) { app.fireTierSwipe() }

                        simButton("bell.fill", "Hotel folio", "$28 minibar · MCC 7011 — counts toward every slab",
                                  enabled: app.firedIgnite && !app.firedReturn) { app.fireFolio() }

                        simButton("airplane.arrival", "Fly home", "First home-market swipe settles the trip",
                                  enabled: app.firedIgnite && !app.firedReturn) { app.fireReturn() }

                        simButton("bolt.fill", "Zelle response", "Stands in for the recipient approving in their own bank app",
                                  enabled: true, tint: .zelle) { app.simulateZelleResponse() }
                    }
                    .padding(.top, 4)

                    Text("Every trigger maps to §4 of the project spec — mock webhooks a FastAPI backend would emit.")
                        .font(.caption2)
                        .foregroundStyle(.white.opacity(0.3))
                        .padding(.top, 4)
                }
                .padding(.horizontal, 22)
                .padding(.bottom, 32)
            }
            .scrollIndicators(.hidden)
        }
        .preferredColorScheme(.dark)
    }

    private func simButton(_ symbol: String, _ title: String, _ sub: String,
                           enabled: Bool, prominent: Bool = false, tint: Color? = nil,
                           action: @escaping () -> Void) -> some View {
        Button(action: action) {
            HStack(spacing: 13) {
                Image(systemName: symbol)
                    .font(.system(size: 15, weight: .medium))
                    .foregroundStyle(prominent ? .white : (tint ?? Color(hex: 0x4CC8DE)))
                    .frame(width: 32)
                VStack(alignment: .leading, spacing: 2) {
                    Text(title).font(.subheadline.weight(.semibold)).foregroundStyle(.white)
                    Text(sub).font(.caption2).foregroundStyle(.white.opacity(0.5))
                        .multilineTextAlignment(.leading)
                }
                Spacer()
                if !enabled {
                    Image(systemName: "checkmark")
                        .font(.system(size: 12, weight: .semibold))
                        .foregroundStyle(.white.opacity(0.25))
                }
            }
            .padding(.horizontal, 16).padding(.vertical, 13)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(
                prominent
                    ? AnyShapeStyle(LinearGradient(colors: [Color(hex: 0xB5322B), Color(hex: 0x7E1F1A)],
                                                   startPoint: .leading, endPoint: .trailing))
                    : AnyShapeStyle((tint ?? .white).opacity(tint == nil ? 0.06 : 0.18)),
                in: RoundedRectangle(cornerRadius: 18, style: .continuous)
            )
        }
        .buttonStyle(.plain)
        .disabled(!enabled)
        .opacity(enabled ? 1 : 0.45)
    }
}
