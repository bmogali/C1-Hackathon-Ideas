import SwiftUI

// ═══ VENTURE KEY · design system ═══
// Three acts: paper (planning) → midnight (live) → dawn (wrapped).
// Rules that keep it looking expensive:
//   · SF Symbols only — no emoji in UI chrome
//   · one accent per act; partner brands appear as tinted marks, not new palettes
//   · no card borders in daylight — depth comes from soft shadow and spacing
//   · serif reserved for hero statements; SF Pro text styles everywhere else

enum Act { case paper, midnight, dawn }

struct Palette {
    let bg: Color
    let card: Color
    let card2: Color
    let ink: Color
    let sub: Color
    let faint: Color
    let accent: Color
    let glowA: Color   // aurora backdrop tints
    let glowB: Color

    static let paper = Palette(
        bg: Color(hex: 0xF5F2EB), card: .white, card2: Color(hex: 0xEFEBE1),
        ink: Color(hex: 0x1A1611), sub: Color(hex: 0x7A7264), faint: Color(hex: 0xABA294),
        accent: Color(hex: 0x0276B1),
        glowA: Color(hex: 0x0276B1).opacity(0.07), glowB: Color(hex: 0xD96D2A).opacity(0.05)
    )
    static let midnight = Palette(
        bg: Color(hex: 0x060910), card: Color(hex: 0x10141D), card2: Color(hex: 0x181E2A),
        ink: Color(hex: 0xEDF4F8), sub: Color(hex: 0x8CA0AE), faint: Color(hex: 0x55606E),
        accent: Color(hex: 0x4CC8DE),
        glowA: Color(hex: 0x37D6EA).opacity(0.10), glowB: Color(hex: 0x0276B1).opacity(0.12)
    )
    static let dawn = Palette(
        bg: Color(hex: 0xF7EEE5), card: Color(hex: 0xFFFAF4), card2: Color(hex: 0xF1E5D8),
        ink: Color(hex: 0x221610), sub: Color(hex: 0x8A7466), faint: Color(hex: 0xB49C8A),
        accent: Color(hex: 0xC96A2E),
        glowA: Color(hex: 0xE8A25C).opacity(0.14), glowB: Color(hex: 0xCC2427).opacity(0.05)
    )

    static func forAct(_ act: Act) -> Palette {
        switch act {
        case .paper: return .paper
        case .midnight: return .midnight
        case .dawn: return .dawn
        }
    }
}

extension Color {
    init(hex: UInt32) {
        self.init(
            red: Double((hex >> 16) & 0xFF) / 255,
            green: Double((hex >> 8) & 0xFF) / 255,
            blue: Double(hex & 0xFF) / 255
        )
    }
    static let keyGreen = Color(hex: 0x8FBF4D)
    static let keyGreenDark = Color(hex: 0x5C8F1D)
    static let c1Red = Color(hex: 0xCC2427)
    static let zelle = Color(hex: 0x6D1ED4)
    static let vbGold = Color(hex: 0xCDA95B)
    static let vbInk = Color(hex: 0x0C0B10)
    static let vbCream = Color(hex: 0xEFE6D2)
}

// ── emoji → SF Symbol · data stays expressive, chrome stays native ──
func sym(_ emoji: String) -> String {
    switch emoji {
    case "🏨": return "bed.double.fill"
    case "☕": return "cup.and.saucer.fill"
    case "🍷", "🍽", "🍽️", "🥐", "🥯", "🍕", "🍔", "🥭", "🐟", "🍜", "🍦", "🍫", "🌭", "🥟", "🍹", "🍣": return "fork.knife"
    case "🖼️", "🖼", "🎨": return "paintpalette.fill"
    case "🚤", "🛥️", "🚁", "🌉": return "sailboat.fill"
    case "🎭", "🎢", "🎆": return "theatermasks.fill"
    case "🏀": return "basketball.fill"
    case "🛎️": return "bell.fill"
    case "✈️": return "airplane"
    case "🎟️", "🎫": return "ticket.fill"
    case "🧴", "🕶️", "🧢", "🔌", "🎒", "👟", "💧", "🔋", "🧥", "🧤", "🧣", "🥾", "☔": return "bag.fill"
    case "💼": return "banknote.fill"
    case "💳": return "creditcard.fill"
    case "⚡": return "bolt.fill"
    case "🥩", "🎷": return "sparkles"
    case "🛬": return "airplane.arrival"
    case "🗝️", "🗝": return "key.fill"
    case "🏆": return "trophy.fill"
    case "📈": return "chart.line.uptrend.xyaxis"
    case "📉": return "chart.line.downtrend.xyaxis"
    case "🎁": return "gift.fill"
    case "✦": return "sparkle"
    case "🧭": return "mappin.and.ellipse"
    case "🗺️", "🗺": return "map.fill"
    case "🔔": return "bell.badge.fill"
    case "🛍️", "🛍": return "bag.fill"
    case "📤": return "square.and.arrow.up"
    case "🅿️": return "checkmark.seal.fill"
    case "💸": return "paperplane.fill"
    case "✏️": return "pencil"
    default: return "creditcard.fill"
    }
}

// ═══ primitives ═══

/// Serif hero: "Paris, " + italic accent state word — the app's voice.
struct HeroTitle: View {
    let word: String
    let state: String
    let pal: Palette
    var sep: String = ", "
    var body: some View {
        (Text("\(word)\(sep)")
            + Text(state).italic().foregroundColor(pal.accent))
            .font(.system(size: 34, weight: .medium, design: .serif))
            .foregroundStyle(pal.ink)
            .kerning(-0.5)
    }
}

struct SectionHeader: View {
    let text: String
    let pal: Palette
    var body: some View {
        Text(text)
            .font(.system(size: 11, weight: .semibold))
            .tracking(1.4)
            .textCase(.uppercase)
            .foregroundStyle(pal.faint)
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(.horizontal, 6)
    }
}

/// Icon in a soft tinted circle — the app's only icon container.
struct IconBadge: View {
    let symbol: String
    let tint: Color
    var size: CGFloat = 36
    var body: some View {
        Image(systemName: symbol)
            .font(.system(size: size * 0.42, weight: .medium))
            .foregroundStyle(tint)
            .frame(width: size, height: size)
            .background(tint.opacity(0.12), in: Circle())
    }
}

// ── card: borderless, continuous corners, soft elevation ──
struct CardStyle: ViewModifier {
    let pal: Palette
    var padding: CGFloat = 18
    @Environment(\.colorScheme) private var scheme
    func body(content: Content) -> some View {
        content
            .padding(padding)
            .background(pal.card, in: RoundedRectangle(cornerRadius: 24, style: .continuous))
            .overlay(
                RoundedRectangle(cornerRadius: 24, style: .continuous)
                    .strokeBorder(.white.opacity(scheme == .dark ? 0.06 : 0))
            )
            .shadow(color: .black.opacity(scheme == .dark ? 0 : 0.05), radius: 14, y: 6)
    }
}

extension View {
    func card(_ pal: Palette, padding: CGFloat = 18) -> some View {
        modifier(CardStyle(pal: pal, padding: padding))
    }

    /// subtle scroll choreography — content settles into place as it enters
    func drift() -> some View {
        scrollTransition(.interactive) { content, phase in
            content
                .opacity(phase.isIdentity ? 1 : 0.4)
                .scaleEffect(phase.isIdentity ? 1 : 0.96, anchor: .center)
                .blur(radius: phase.isIdentity ? 0 : 1.5)
        }
    }
}

// ── buttons: one shape (capsule), three intensities + gold ──
enum CapsuleKind { case prominent, tinted, quiet, gold }

struct CapsuleButtonStyle: ButtonStyle {
    let kind: CapsuleKind
    let pal: Palette
    var compact = false

    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.system(size: compact ? 13 : 15, weight: .semibold))
            .padding(.horizontal, compact ? 14 : 20)
            .padding(.vertical, compact ? 8 : 12)
            .foregroundStyle(fg)
            .background(bg, in: Capsule())
            .overlay(kind == .gold ? Capsule().strokeBorder(Color.vbGold.opacity(0.55)) : nil)
            .opacity(configuration.isPressed ? 0.75 : 1)
            .scaleEffect(configuration.isPressed ? 0.96 : 1)
            .animation(.spring(duration: 0.25), value: configuration.isPressed)
    }

    private var fg: Color {
        switch kind {
        case .prominent: return .white
        case .tinted: return pal.accent
        case .quiet: return pal.sub
        case .gold: return .vbGold
        }
    }
    private var bg: Color {
        switch kind {
        case .prominent: return pal.accent
        case .tinted: return pal.accent.opacity(0.12)
        case .quiet: return pal.card2
        case .gold: return .vbInk
        }
    }
}

// ── status tag: quiet, lowercase, never shouting ──
struct Tag: View {
    let text: String
    let color: Color
    var body: some View {
        Text(text)
            .font(.system(size: 12, weight: .semibold))
            .foregroundStyle(color)
            .padding(.horizontal, 10).padding(.vertical, 4)
            .background(color.opacity(0.12), in: Capsule())
    }
}

// ── aurora: soft radial atmosphere behind each screen ──
struct Aurora: View {
    let pal: Palette
    var body: some View {
        GeometryReader { geo in
            ZStack {
                Circle()
                    .fill(pal.glowA)
                    .frame(width: geo.size.width * 1.3)
                    .blur(radius: 80)
                    .offset(x: geo.size.width * 0.35, y: -geo.size.height * 0.32)
                Circle()
                    .fill(pal.glowB)
                    .frame(width: geo.size.width * 1.1)
                    .blur(radius: 90)
                    .offset(x: -geo.size.width * 0.4, y: geo.size.height * 0.45)
            }
        }
        .ignoresSafeArea()
        .allowsHitTesting(false)
    }
}
