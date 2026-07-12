import SwiftUI

// ═══ WALLET · multi-account relationship + servicing detail ═══

struct AccountInfo: Identifiable {
    let id: String
    let icon: String
    let name: String
    let num: String
    let kind: String
    let note: String
}

let ACCOUNTS: [AccountInfo] = [
    AccountInfo(id: "venturex", icon: "airplane", name: "Venture X", num: "····4907", kind: "Credit", note: "The card that travels"),
    AccountInfo(id: "checking", icon: "building.columns", name: "360 Checking", num: "···2201", kind: "Deposits", note: "Direct deposit · Fridays"),
    AccountInfo(id: "savings", icon: "leaf", name: "360 Performance Savings", num: "···8832", kind: "Deposits", note: "3.90% APY"),
    AccountInfo(id: "quicksilver", icon: "creditcard", name: "Quicksilver", num: "····1189", kind: "Credit", note: "AutoPay on · paid off"),
]

// ── card themes · one gradient per Capital One product, same as the web wallet ──
struct CardTheme {
    let colors: [Color]
    let ink: Color
    let dim: Color
}

let CARD_THEMES: [String: CardTheme] = [
    "venturex":    CardTheme(colors: [Color(hex: 0x0C1B2A), Color(hex: 0x143247), Color(hex: 0x0A2236)],
                             ink: .white, dim: .white.opacity(0.55)),
    "quicksilver": CardTheme(colors: [Color(hex: 0xE7EAEE), Color(hex: 0xBCC3CB), Color(hex: 0xDDE1E6)],
                             ink: Color(hex: 0x1B2530), dim: Color(hex: 0x1B2530).opacity(0.55)),
    "checking":    CardTheme(colors: [Color(hex: 0x0AA3C2), Color(hex: 0x0276B1), Color(hex: 0x015C8A)],
                             ink: .white, dim: .white.opacity(0.6)),
    "savings":     CardTheme(colors: [Color(hex: 0x237A56), Color(hex: 0x2E8B62), Color(hex: 0x175C40)],
                             ink: .white, dim: .white.opacity(0.6)),
]

struct WalletView: View {
    @EnvironmentObject var app: AppState

    var body: some View {
        NavigationStack {
            Screen(word: "Your", state: "wallet.", sep: " ", subtitle: "$32,824 in deposits · 2 cards") {
                SectionHeader(text: "Accounts", pal: app.pal)
                // the stack: deposit cards peek behind, Venture X leads
                VStack(spacing: -128) {
                    walletStrip("quicksilver")
                    walletStrip("savings")
                    walletStrip("checking")
                    ventureFront
                }
                .padding(.top, 2)
                .drift()
            }
            .navigationDestination(for: String.self) { id in
                AccountDetailView(accountID: id)
            }
        }
    }

    private func walletStrip(_ id: String) -> some View {
        let acct = ACCOUNTS.first { $0.id == id }!
        let theme = CARD_THEMES[id]!
        return NavigationLink(value: id) {
            VStack(alignment: .leading, spacing: 0) {
                HStack(alignment: .top) {
                    VStack(alignment: .leading, spacing: 3) {
                        Text(acct.name)
                            .font(.system(size: 12, weight: .semibold))
                            .tracking(1.4)
                            .textCase(.uppercase)
                            .foregroundStyle(theme.dim)
                        Text(acct.note)
                            .font(.caption2)
                            .foregroundStyle(theme.dim)
                    }
                    Spacer()
                    VStack(alignment: .trailing, spacing: 3) {
                        Text(balance(id))
                            .font(.system(size: 17, weight: .semibold))
                            .foregroundStyle(theme.ink)
                            .contentTransition(.numericText())
                        Text("\(acct.kind) \(acct.num)")
                            .font(.caption2)
                            .foregroundStyle(theme.dim)
                    }
                }
                Spacer()
            }
            .padding(20)
            .frame(height: 190)
            .frame(maxWidth: .infinity)
            .background(
                LinearGradient(colors: theme.colors, startPoint: .topLeading, endPoint: .bottomTrailing),
                in: RoundedRectangle(cornerRadius: 24, style: .continuous)
            )
            .overlay(RoundedRectangle(cornerRadius: 24, style: .continuous).strokeBorder(.white.opacity(0.08)))
            .shadow(color: .black.opacity(0.18), radius: 16, y: -6)
        }
        .buttonStyle(.plain)
    }

    private var ventureFront: some View {
        let theme = CARD_THEMES["venturex"]!
        return NavigationLink(value: "venturex") {
            VStack(alignment: .leading, spacing: 0) {
                HStack {
                    Text("VENTURE X")
                        .font(.system(size: 11, weight: .semibold))
                        .kerning(2.4)
                        .foregroundStyle(theme.dim)
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
                Spacer().frame(height: 12)
                Text("••••  ••••  ••••  4907")
                    .font(.system(size: 14, design: .monospaced))
                    .kerning(1.2)
                    .foregroundStyle(.white.opacity(0.75))
                Spacer().frame(height: 14)
                HStack(alignment: .bottom) {
                    VStack(alignment: .leading, spacing: 3) {
                        Text("BALANCE").font(.system(size: 9, weight: .medium)).kerning(1.6).foregroundStyle(theme.dim)
                        Text(money2(app.vxBalance))
                            .font(.system(size: 20, weight: .semibold)).foregroundStyle(.white)
                            .contentTransition(.numericText())
                    }
                    Spacer()
                    VStack(alignment: .trailing, spacing: 3) {
                        Text("MILES").font(.system(size: 9, weight: .medium)).kerning(1.6).foregroundStyle(theme.dim)
                        Text(app.vxMiles.formatted())
                            .font(.system(size: 18, weight: .semibold))
                            .foregroundStyle(Color(hex: 0x6FD6E8))
                            .contentTransition(.numericText())
                    }
                }
            }
            .padding(22)
            .frame(height: 212)
            .frame(maxWidth: .infinity)
            .background(
                LinearGradient(colors: theme.colors, startPoint: .topLeading, endPoint: .bottomTrailing),
                in: RoundedRectangle(cornerRadius: 26, style: .continuous)
            )
            .overlay(RoundedRectangle(cornerRadius: 26, style: .continuous).strokeBorder(.white.opacity(0.08)))
            .shadow(color: Color(hex: 0x0C1B2A).opacity(0.4), radius: 22, y: -8)
        }
        .buttonStyle(.plain)
    }

    private func balance(_ id: String) -> String {
        switch id {
        case "venturex": return money2(app.vxBalance)
        case "checking": return money2(app.checkingBalance)
        case "savings": return "$24,610.03"
        default: return "$0.00"
        }
    }
}

struct AccountDetailView: View {
    @EnvironmentObject var app: AppState
    let accountID: String

    private var acct: AccountInfo { ACCOUNTS.first { $0.id == accountID }! }

    var body: some View {
        ZStack {
            app.pal.bg.ignoresSafeArea()
            Aurora(pal: app.pal)
            ScrollView {
                VStack(alignment: .leading, spacing: 20) {
                    // vitals
                    HStack(spacing: 12) {
                        vital("Balance", primaryBalance)
                        vital(secondaryLabel, secondaryValue)
                    }
                    if accountID == "venturex" {
                        HStack(spacing: 12) {
                            vital("Miles", app.vxMiles.formatted(), accent: true)
                            vital("Tagged to trip", money(app.taggedTotal(for: app.curTripID)))
                        }
                    }

                    SectionHeader(text: "Recent activity", pal: app.pal)
                    VStack(spacing: 0) {
                        ForEach(activity) { t in
                            HStack(spacing: 13) {
                                IconBadge(symbol: sym(t.icon),
                                          tint: t.isCredit ? .keyGreenDark : app.pal.accent, size: 36)
                                VStack(alignment: .leading, spacing: 1) {
                                    Text(t.merchant).font(.subheadline.weight(.semibold)).foregroundStyle(app.pal.ink)
                                    HStack(spacing: 4) {
                                        Text(t.desc).font(.caption).foregroundStyle(app.pal.sub)
                                        if t.taggedTrip != nil {
                                            Image(systemName: "key.fill")
                                                .font(.system(size: 8))
                                                .foregroundStyle(app.pal.accent)
                                        }
                                    }
                                }
                                Spacer()
                                VStack(alignment: .trailing, spacing: 1) {
                                    Text("\(t.isCredit ? "+" : "−")\(money2(t.amount))")
                                        .font(.subheadline.weight(.semibold))
                                        .foregroundStyle(t.isCredit ? .keyGreenDark : app.pal.ink)
                                    if t.miles > 0 {
                                        Text("+\(t.miles) mi").font(.caption2.weight(.medium))
                                            .foregroundStyle(app.pal.accent)
                                    }
                                }
                            }
                            .padding(.vertical, 11).padding(.horizontal, 16)
                            if t.id != activity.last?.id {
                                Divider().overlay(app.pal.ink.opacity(0.05)).padding(.leading, 64)
                            }
                        }
                        if activity.isEmpty {
                            Text("Demo account — this build deep-dives Venture X.")
                                .font(.footnote).foregroundStyle(app.pal.sub)
                                .padding(18)
                        }
                    }
                    .background(app.pal.card, in: RoundedRectangle(cornerRadius: 24, style: .continuous))
                    .shadow(color: .black.opacity(app.act == .midnight ? 0 : 0.05), radius: 14, y: 6)
                }
                .padding(.horizontal, 20)
                .padding(.bottom, 60)
            }
            .scrollIndicators(.hidden)
        }
        .navigationTitle("\(acct.name) \(acct.num)")
        .toolbarTitleDisplayMode(.inline)
    }

    private var activity: [Txn] {
        switch accountID {
        case "venturex": return app.txns
        case "checking": return app.checkingActivity
        default: return []
        }
    }

    private var primaryBalance: String {
        switch accountID {
        case "venturex": return money2(app.vxBalance)
        case "checking": return money2(app.checkingBalance)
        case "savings": return "$24,610.03"
        default: return "$0.00"
        }
    }

    private var secondaryLabel: String {
        switch accountID {
        case "venturex": return "Available credit"
        case "checking": return "Overdraft"
        case "savings": return "APY"
        default: return "Limit"
        }
    }

    private var secondaryValue: String {
        switch accountID {
        case "venturex": return money(30000 - app.vxBalance)
        case "checking": return "No-Fee"
        case "savings": return "3.90%"
        default: return "$8,000"
        }
    }

    private func vital(_ label: String, _ value: String, accent: Bool = false) -> some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(label)
                .font(.system(size: 10, weight: .medium))
                .tracking(1.2)
                .textCase(.uppercase)
                .foregroundStyle(app.pal.faint)
            Text(value)
                .font(.title3.weight(.semibold))
                .foregroundStyle(accent ? app.pal.accent : app.pal.ink)
                .contentTransition(.numericText())
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .card(app.pal, padding: 16)
    }
}
