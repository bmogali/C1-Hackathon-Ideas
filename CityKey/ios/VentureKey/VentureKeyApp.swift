import SwiftUI

@main
struct VentureKeyApp: App {
    @StateObject private var app = AppState()

    var body: some Scene {
        WindowGroup {
            RootView()
                .environmentObject(app)
        }
    }
}

struct RootView: View {
    @EnvironmentObject var app: AppState

    var body: some View {
        TabView(selection: $app.tab) {
            HomeView()
                .tabItem { Label("Home", systemImage: "house") }
                .tag(AppTab.home)
            WalletView()
                .tabItem { Label("Wallet", systemImage: "creditcard") }
                .tag(AppTab.wallet)
            PlanView()
                .tabItem { Label("Plan", systemImage: "map") }
                .tag(AppTab.plan)
            CityKeyView()
                .tabItem { Label("City Key", systemImage: "key.radiowaves.forward") }
                .tag(AppTab.cityKey)
        }
        .tint(app.pal.accent)
        .preferredColorScheme(app.act == .midnight ? .dark : .light)
        .overlay(alignment: .top) { ToastView() }
        .fullScreenCover(isPresented: $app.showSplash) { IgnitionSplash() }
        .fullScreenCover(isPresented: $app.showWrap) { WrapView() }
        .sheet(isPresented: $app.showSimulator) {
            SimulatorSheet()
                .presentationDetents([.medium, .large])
                .presentationDragIndicator(.visible)
        }
        .sheet(isPresented: $app.showVB) {
            VelocityBlackSheet()
                .presentationDetents([.large])
                .presentationDragIndicator(.visible)
        }
        .sheet(isPresented: $app.showNewTrip) {
            NewTripSheet()
                .presentationDetents([.medium, .large])
                .presentationDragIndicator(.visible)
        }
        .sensoryFeedback(.success, trigger: app.hapticTick)
    }
}

// ── floating toast · quiet material capsule ──
struct ToastView: View {
    @EnvironmentObject var app: AppState

    var body: some View {
        if let t = app.toast {
            HStack(spacing: 11) {
                Image(systemName: sym(t.icon))
                    .font(.system(size: 15, weight: .semibold))
                    .foregroundStyle(app.pal.accent)
                VStack(alignment: .leading, spacing: 1) {
                    Text(t.title).font(.subheadline.weight(.semibold))
                    if !t.sub.isEmpty {
                        Text(t.sub).font(.caption).foregroundStyle(.secondary)
                    }
                }
                Spacer(minLength: 0)
            }
            .padding(.horizontal, 16).padding(.vertical, 12)
            .frame(maxWidth: 340)
            .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 20, style: .continuous))
            .shadow(color: .black.opacity(0.14), radius: 20, y: 8)
            .padding(.horizontal, 24)
            .transition(.move(edge: .top).combined(with: .opacity))
            .onTapGesture { withAnimation { app.toast = nil } }
        }
    }
}

// ── reusable screen scaffold: aurora backdrop + serif hero + floating actions ──
struct Screen<Content: View>: View {
    @EnvironmentObject var app: AppState
    let word: String
    let state: String
    var sep: String = ", "
    var subtitle: String? = nil
    var showVBButton = false
    @ViewBuilder var content: Content

    var body: some View {
        ZStack {
            app.pal.bg.ignoresSafeArea()
            Aurora(pal: app.pal)
            ScrollView {
                VStack(alignment: .leading, spacing: 20) {
                    VStack(alignment: .leading, spacing: 6) {
                        HeroTitle(word: word, state: state, pal: app.pal, sep: sep)
                        if let s = subtitle {
                            Text(s).font(.subheadline).foregroundStyle(app.pal.sub)
                        }
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(.top, 10)
                    .padding(.horizontal, 2)

                    content
                }
                .padding(.horizontal, 20)
                .padding(.bottom, 120)
            }
            .scrollIndicators(.hidden)
        }
        .overlay(alignment: .bottomTrailing) {
            HStack(spacing: 10) {
                if showVBButton {
                    Button { app.showVB = true } label: {
                        Image(systemName: "sparkle")
                            .font(.system(size: 15, weight: .medium))
                            .foregroundStyle(Color.vbGold)
                            .frame(width: 44, height: 44)
                            .background(Color.vbInk, in: Circle())
                            .overlay(Circle().strokeBorder(Color.vbGold.opacity(0.4)))
                            .shadow(color: .black.opacity(0.25), radius: 12, y: 5)
                    }
                    .accessibilityLabel("Velocity Black concierge")
                }
                Button { app.showSimulator = true } label: {
                    Image(systemName: "wand.and.stars")
                        .font(.system(size: 15, weight: .medium))
                        .foregroundStyle(Color(hex: 0x4CC8DE))
                        .frame(width: 44, height: 44)
                        .background(Color(hex: 0x101722), in: Circle())
                        .overlay(Circle().strokeBorder(Color(hex: 0x4CC8DE).opacity(0.3)))
                        .shadow(color: .black.opacity(0.25), radius: 12, y: 5)
                }
                .accessibilityLabel("Open auth-stream simulator")
            }
            .padding(.trailing, 20)
            .padding(.bottom, 14)
        }
    }
}
