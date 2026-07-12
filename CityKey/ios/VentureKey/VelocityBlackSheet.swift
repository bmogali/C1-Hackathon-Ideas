import SwiftUI

// ═══ VELOCITY BLACK · concierge — a Capital One company ═══
// Deliberately its own visual language: near-black, gold, serif.
// If a flow involves the unbuyable, it lives here.

struct VelocityBlackSheet: View {
    @EnvironmentObject var app: AppState

    var body: some View {
        ZStack {
            LinearGradient(colors: [Color(hex: 0x0E0D13), Color(hex: 0x0B0A10), Color(hex: 0x120F09)],
                           startPoint: .top, endPoint: .bottom)
                .ignoresSafeArea()

            VStack(alignment: .leading, spacing: 0) {
                // header
                VStack(alignment: .leading, spacing: 5) {
                    HStack(spacing: 8) {
                        Image(systemName: "sparkle")
                            .font(.system(size: 11, weight: .medium))
                        Text("Velocity Black")
                            .font(.system(size: 13, weight: .semibold))
                            .tracking(4)
                            .textCase(.uppercase)
                    }
                    .foregroundStyle(Color.vbGold)
                    Text("Concierge · always on · a Capital One company")
                        .font(.caption2)
                        .foregroundStyle(Color.vbCream.opacity(0.45))
                }
                .padding(.horizontal, 24)
                .padding(.top, 28)
                .padding(.bottom, 18)

                Rectangle().fill(Color.vbGold.opacity(0.18)).frame(height: 0.5)

                // thread
                ScrollViewReader { proxy in
                    ScrollView {
                        VStack(alignment: .leading, spacing: 10) {
                            ForEach(app.curSession.vbMessages) { msg in
                                if msg.fromConcierge {
                                    Text(msg.text)
                                        .font(.system(size: 14, design: .serif))
                                        .foregroundStyle(Color.vbCream)
                                        .lineSpacing(3)
                                        .padding(14)
                                        .background(Color.white.opacity(0.04))
                                        .overlay(Rectangle().fill(Color.vbGold.opacity(0.8)).frame(width: 1.5), alignment: .leading)
                                        .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
                                        .frame(maxWidth: 300, alignment: .leading)
                                        .frame(maxWidth: .infinity, alignment: .leading)
                                } else {
                                    Text(msg.text)
                                        .font(.system(size: 13.5))
                                        .foregroundStyle(Color.vbCream)
                                        .padding(13)
                                        .background(Color.vbGold.opacity(0.13), in: RoundedRectangle(cornerRadius: 14, style: .continuous))
                                        .frame(maxWidth: 280, alignment: .trailing)
                                        .frame(maxWidth: .infinity, alignment: .trailing)
                                }
                            }
                            Color.clear.frame(height: 1).id("bottom")
                        }
                        .padding(.horizontal, 22)
                        .padding(.vertical, 18)
                    }
                    .onChange(of: app.curSession.vbMessages.count) {
                        withAnimation { proxy.scrollTo("bottom") }
                    }
                }

                Rectangle().fill(Color.vbGold.opacity(0.18)).frame(height: 0.5)

                // request chips
                VStack(alignment: .leading, spacing: 9) {
                    let remaining = remainingRequests
                    if remaining.isEmpty {
                        Text("Anything else? Just ask — we're always on.")
                            .font(.caption)
                            .foregroundStyle(Color.vbCream.opacity(0.4))
                            .frame(maxWidth: .infinity)
                    } else {
                        Text("Make a request")
                            .font(.caption2.weight(.semibold))
                            .tracking(2.2)
                            .textCase(.uppercase)
                            .foregroundStyle(Color.vbCream.opacity(0.35))
                        ForEach(remaining, id: \.index) { item in
                            Button { app.vbAsk(item.index) } label: {
                                HStack(spacing: 10) {
                                    Image(systemName: "sparkle")
                                        .font(.system(size: 10, weight: .medium))
                                        .foregroundStyle(Color.vbGold.opacity(0.8))
                                    Text(item.req.ask)
                                        .font(.system(size: 13.5, weight: .medium))
                                        .foregroundStyle(Color.vbCream)
                                        .multilineTextAlignment(.leading)
                                    Spacer()
                                }
                                .padding(.horizontal, 16).padding(.vertical, 12)
                                .background(RoundedRectangle(cornerRadius: 24, style: .continuous)
                                    .strokeBorder(Color.vbGold.opacity(0.35)))
                            }
                            .buttonStyle(.plain)
                        }
                    }
                }
                .padding(.horizontal, 22)
                .padding(.top, 16)
                .padding(.bottom, 26)
            }
        }
        .onAppear { app.vbGreetIfNeeded() }
        .preferredColorScheme(.dark)
    }

    private var remainingRequests: [(index: Int, req: VBRequest)] {
        app.curTrip.vb.enumerated()
            .filter { !app.curSession.vbUsed.contains($0.offset) }
            .map { (index: $0.offset, req: $0.element) }
    }
}
