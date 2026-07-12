import Foundation

// ═══ VENTURE KEY · domain models (mirrors the web prototype's data.js) ═══

struct Tier: Identifiable {
    let id: Int
    let threshold: Double
    let emoji: String
    let title: String
    let reward: String
}

enum StopStatus {
    case booked      // pre-seeded reservation
    case book        // bookable via Capital One Travel
    case bookedNow   // booked during this session
    case idea
    case velocity    // secured by Velocity Black
}

struct Stop: Identifiable {
    let id = UUID()
    let time: String
    let title: String
    let sub: String
    var status: StopStatus
    var price: Double? = nil
    var dropApplied: Double? = nil   // Price Watch savings applied
    var dropVia: String? = nil       // external seller offering the lower price
    var paidWithPaze = false
}

struct Day: Identifiable {
    let id = UUID()
    let label: String
    var stops: [Stop]
}

struct Hotel: Identifiable {
    let id: String
    let name: String
    let area: String
    let nightly: Double
    let tier: String       // Standard · Lifestyle · Premier Collection
}

struct ShoppingItem: Identifiable {
    let id = UUID()
    let icon: String
    let name: String
    let price: Double
    let retailer: String
}

struct ScriptSwipe {
    let merchant: String
    let amount: Double
    let icon: String
    let note: String
}

struct Swipe: Identifiable {
    let id = UUID()
    let merchant: String
    let amount: Double
    let cum: Double
    let icon: String
    let note: String
}

struct Txn: Identifiable {
    let id = UUID()
    let icon: String
    let merchant: String
    let desc: String
    let amount: Double
    let isCredit: Bool
    let miles: Int
    var taggedTrip: String? = nil
}

struct ZelleRequest: Identifiable {
    let id = UUID()
    let to: String
    let amount: Double
    var status: ZelleStatus
}

enum ZelleStatus { case requested, received }

// ── Capital One Shopping · trip intelligence context ──
enum WXKind {
    case hot, cold, rain, mild

    var icon: String {
        switch self {
        case .hot: return "sun.max.fill"
        case .cold: return "snowflake"
        case .rain: return "cloud.rain.fill"
        case .mild: return "cloud.sun.fill"
        }
    }
    var localLine: String {
        switch self {
        case .hot: return "Pharmacy sunscreen next to the big sights runs about 3× what you'd pay today."
        case .cold: return "Buying layers in-city means tourist-district markup — roughly double."
        case .rain: return "Street umbrellas double in price the minute it starts raining."
        case .mild: return "Airport electronics run 2–3× the price of ordering tonight."
        }
    }
}

// ── Velocity Black ──
struct VBRequest: Identifiable {
    let id = UUID()
    let icon: String
    let ask: String
    let reply: String
    let stopTime: String
    let stopTitle: String
    let stopSub: String
}

struct VBStation {
    let threshold: Double
    let title: String
    let desc: String
}

struct VBMsg: Identifiable {
    let id = UUID()
    let fromConcierge: Bool
    let text: String
}

struct Trip: Identifiable {
    let id: String
    let flag: String
    let city: String
    let dates: String
    let mate: String
    let zip: String
    let heroWord: String
    let welcome: String
    let tower: String
    let wrapAirports: String
    let wrapPlace: String
    let nights: Int
    let flightRoute: String
    let flightPrice: Double
    let flightTrendUp: Bool   // Hopper-style prediction: fares rising vs easing
    let flightPct: Int
    let wxKind: WXKind
    let wxLabel: String
    let tiers: [Tier]
    let hotels: [Hotel]
    let heroOffer: ShoppingItem
    let shopping: [ShoppingItem]
    var days: [Day]
    let ignition: ScriptSwipe
    let swipe2: ScriptSwipe
    let swipe3: ScriptSwipe
    let vb: [VBRequest]
    let vbStation: VBStation?
    var isStandalone = false
}

// ── per-trip mutable session state ──
struct TripSession {
    var armed = false
    var active = false
    var settled = false
    var spend: Double = 0
    var swipes: [Swipe] = []
    var claimed: Set<Int> = []
    var hotel: Hotel? = nil
    var folioCount = 0
    var zelle: [ZelleRequest] = []
    var travelIntent: Bool? = nil    // nil = not asked · true = booking here · false = skip
    var flightBooked = false
    var flightTravelers = 1
    var flightTotal: Double = 0
    var flightFrozen = false
    var vbUsed: Set<Int> = []        // indices into trip.vb
    var vbExpress = false            // express station accepted
    var vbMessages: [VBMsg] = []
}

// ═══ seed data ═══

enum Seed {
    static let paris = Trip(
        id: "paris", flag: "🇫🇷", city: "Paris", dates: "Jul 12 – 18", mate: "Priya",
        zip: "75004", heroWord: "Paris", welcome: "Bienvenue à Paris 🇫🇷", tower: "🗼",
        wrapAirports: "CDG → IAD", wrapPlace: "Paris, France", nights: 6,
        flightRoute: "IAD → CDG", flightPrice: 612, flightTrendUp: true, flightPct: 8,
        wxKind: .hot, wxLabel: "93°F · heat wave likely",
        tiers: [
            Tier(id: 1, threshold: 100, emoji: "🥐", title: "Pâtisserie Fleur", reward: "Free macaron"),
            Tier(id: 2, threshold: 300, emoji: "🖼️", title: "Musée d'Orsay", reward: "50% off entry"),
            Tier(id: 3, threshold: 600, emoji: "🚤", title: "Seine Sunset Cruise", reward: "$25 statement credit"),
        ],
        hotels: [
            Hotel(id: "std", name: "Hôtel Bastille Speria", area: "Bastille", nightly: 165, tier: "Standard"),
            Hotel(id: "lif", name: "Hôtel Le Marais", area: "Le Marais", nightly: 210, tier: "Lifestyle"),
            Hotel(id: "prem", name: "Hôtel Plaza Vendôme", area: "Champs-Élysées", nightly: 410, tier: "Premier Collection"),
        ],
        heroOffer: ShoppingItem(icon: "🧴", name: "SPF 50 mineral sunscreen", price: 12, retailer: "REI"),
        shopping: [
            ShoppingItem(icon: "🕶️", name: "Polarized sunglasses", price: 28, retailer: "Warby Parker"),
            ShoppingItem(icon: "🧢", name: "Packable sun hat", price: 18, retailer: "REI"),
            ShoppingItem(icon: "🔌", name: "Travel adapter", price: 23, retailer: "Amazon"),
        ],
        days: [
            Day(label: "Sun · Jul 12 — Arrival day", stops: [
                Stop(time: "09:30", title: "Café de Flore", sub: "Breakfast with Priya", status: .booked),
                Stop(time: "11:00", title: "Louvre Museum", sub: "Timed entry · 5x miles", status: .book, price: 22),
                Stop(time: "15:00", title: "Eiffel Tower Summit", sub: "5x miles + VIP access", status: .book, price: 45),
            ]),
            Day(label: "Mon · Jul 13 — Museums & the Seine", stops: [
                Stop(time: "10:00", title: "Musée d'Orsay", sub: "Tier 2 pays half at $300 spend", status: .idea, price: 18),
                Stop(time: "19:30", title: "Seine Sunset Cruise", sub: "Tier 3 credits $25 at $600 spend", status: .idea, price: 38),
            ]),
        ],
        ignition: ScriptSwipe(merchant: "Hôtel Le Marais", amount: 120, icon: "🏨", note: "MCC 7011 · ignition swipe"),
        swipe2: ScriptSwipe(merchant: "Le Baristas", amount: 160, icon: "☕", note: "Flat whites & tartines"),
        swipe3: ScriptSwipe(merchant: "Bistro Chez Anne", amount: 95, icon: "🍷", note: "Dinner in Le Marais"),
        vb: [
            VBRequest(icon: "🍽", ask: "A table at L'Ambroisie — Saturday, two seats",
                      reply: "Done. Saturday 21:00, two covers at L'Ambroisie, Place des Vosges. The chef knows the occasion. Jackets, s'il vous plaît.",
                      stopTime: "21:00", stopTitle: "L'Ambroisie — secured table", stopSub: "Place des Vosges · via Velocity Black"),
            VBRequest(icon: "🖼", ask: "The Louvre after closing — just us",
                      reply: "Arranged. Thursday 21:30, a private hour in the Denon wing with a curator. Enter by the Porte des Lions.",
                      stopTime: "21:30", stopTitle: "Louvre — private after-hours", stopSub: "Denon wing · curator-led"),
            VBRequest(icon: "🚁", ask: "Something unforgettable for the last evening",
                      reply: "Leave the last evening to us. Helicopter from Issy at 18:40, dinner in a vineyard outside Versailles.",
                      stopTime: "18:40", stopTitle: "Vineyard dinner · heli transfer", stopSub: "Curated by Velocity Black"),
        ],
        vbStation: VBStation(threshold: 350, title: "Private Seine boat at golden hour",
                             desc: "Skipper, champagne, 90 minutes — the river to yourselves.")
    )

    static let nyc = Trip(
        id: "nyc", flag: "🗽", city: "New York", dates: "Aug 21 – 24", mate: "Arjun",
        zip: "10003", heroWord: "New York", welcome: "Welcome to New York 🗽", tower: "🗽",
        wrapAirports: "JFK → IAD", wrapPlace: "New York, USA", nights: 3,
        flightRoute: "IAD → JFK", flightPrice: 238, flightTrendUp: false, flightPct: 6,
        wxKind: .hot, wxLabel: "88°F · hot & humid",
        tiers: [
            Tier(id: 1, threshold: 75, emoji: "🥯", title: "Russ & Daughters", reward: "Free bagel & schmear"),
            Tier(id: 2, threshold: 250, emoji: "🎨", title: "MoMA", reward: "50% off admission"),
            Tier(id: 3, threshold: 500, emoji: "🎭", title: "Broadway · TKTS", reward: "$30 ticket credit"),
        ],
        hotels: [
            Hotel(id: "std", name: "Pod 51", area: "Midtown East", nightly: 189, tier: "Standard"),
            Hotel(id: "lif", name: "The Bowery Hotel", area: "NoHo", nightly: 245, tier: "Lifestyle"),
            Hotel(id: "prem", name: "The Mark", area: "Upper East Side", nightly: 520, tier: "Premier Collection"),
        ],
        heroOffer: ShoppingItem(icon: "🔋", name: "10k mAh power bank", price: 29, retailer: "Amazon"),
        shopping: [
            ShoppingItem(icon: "🎒", name: "Anti-theft daypack", price: 39, retailer: "REI"),
            ShoppingItem(icon: "👟", name: "Walking sneakers", price: 79, retailer: "Amazon"),
            ShoppingItem(icon: "🧢", name: "Packable sun hat", price: 18, retailer: "REI"),
        ],
        days: [
            Day(label: "Fri · Aug 21 — Arrival day", stops: [
                Stop(time: "13:00", title: "Katz's Delicatessen", sub: "Pastrami with Arjun", status: .booked),
                Stop(time: "17:30", title: "Summit One Vanderbilt", sub: "Sunset slot · 5x miles", status: .book, price: 42),
            ]),
            Day(label: "Sat · Aug 22 — Museums & bridges", stops: [
                Stop(time: "10:30", title: "MoMA — Timed entry", sub: "Tier 2 pays half at $250 spend", status: .book, price: 28),
                Stop(time: "19:30", title: "Broadway — Hadestown", sub: "Tier 3 credits $30 at $500 spend", status: .idea, price: 89),
            ]),
        ],
        ignition: ScriptSwipe(merchant: "The Bowery Hotel", amount: 140, icon: "🏨", note: "MCC 7011 · ignition swipe"),
        swipe2: ScriptSwipe(merchant: "Ess-a-Bagel", amount: 95, icon: "🥯", note: "Bagels & lox for two"),
        swipe3: ScriptSwipe(merchant: "Joe's Pizza", amount: 85, icon: "🍕", note: "Slices & souvenirs"),
        vb: [
            VBRequest(icon: "🍣", ask: "Omakase counter at Masa — this weekend",
                      reply: "Confirmed. Saturday 19:00, two seats at the counter. Chef's selection — allergies noted from your profile.",
                      stopTime: "19:00", stopTitle: "Masa — omakase counter", stopSub: "Columbus Circle · via Velocity Black"),
            VBRequest(icon: "🏀", ask: "Courtside at the Garden",
                      reply: "Two courtside for Friday. You'll enter through the players' tunnel lounge — ask for Marcus.",
                      stopTime: "19:30", stopTitle: "Knicks — courtside", stopSub: "MSG · players' tunnel entrance"),
        ],
        vbStation: VBStation(threshold: 300, title: "After-hours MoMA with a curator",
                             desc: "The Starry Night with no one else in the room.")
    )

    static let sfo = Trip(
        id: "sfo", flag: "🌉", city: "San Francisco", dates: "Sep 18 – 22", mate: "Diego",
        zip: "94103", heroWord: "San Francisco", welcome: "Welcome to San Francisco 🌉", tower: "🌉",
        wrapAirports: "SFO → IAD", wrapPlace: "San Francisco, USA", nights: 4,
        flightRoute: "IAD → SFO", flightPrice: 348, flightTrendUp: false, flightPct: 7,
        wxKind: .mild, wxLabel: "62°F · fog rolls in by afternoon",
        tiers: [
            Tier(id: 1, threshold: 75, emoji: "🥟", title: "Good Mong Kok Bakery", reward: "Free egg tart"),
            Tier(id: 2, threshold: 275, emoji: "🎨", title: "SFMOMA", reward: "50% off admission"),
            Tier(id: 3, threshold: 550, emoji: "🚋", title: "Cable Car ride pass", reward: "$20 statement credit"),
        ],
        hotels: [
            Hotel(id: "std", name: "Hotel Zephyr", area: "Fisherman's Wharf", nightly: 179, tier: "Standard"),
            Hotel(id: "lif", name: "Hotel Zeppelin", area: "Union Square", nightly: 229, tier: "Lifestyle"),
            Hotel(id: "prem", name: "The Ritz-Carlton", area: "Nob Hill", nightly: 480, tier: "Premier Collection"),
        ],
        heroOffer: ShoppingItem(icon: "🧥", name: "Light layering jacket", price: 59, retailer: "Patagonia"),
        shopping: [
            ShoppingItem(icon: "🎒", name: "Anti-theft daypack", price: 39, retailer: "REI"),
            ShoppingItem(icon: "👟", name: "Walking sneakers", price: 79, retailer: "Amazon"),
            ShoppingItem(icon: "🔋", name: "10k mAh power bank", price: 29, retailer: "Amazon"),
        ],
        days: [
            Day(label: "Fri · Sep 18 — Arrival day", stops: [
                Stop(time: "12:30", title: "Ferry Building Marketplace", sub: "Bay-view lunch with Diego", status: .booked),
                Stop(time: "15:00", title: "Japanese Tea Garden", sub: "Golden Gate Park · 5x miles", status: .book, price: 12),
            ]),
            Day(label: "Sat · Sep 19 — Bridges & the bay", stops: [
                Stop(time: "19:00", title: "Alcatraz Night Tour", sub: "5x miles via C1 Entertainment", status: .book, price: 55),
                Stop(time: "10:00", title: "Coit Tower + North Beach", sub: "Espresso crawl on the way down", status: .idea, price: 24),
            ]),
        ],
        ignition: ScriptSwipe(merchant: "Hotel Zeppelin", amount: 130, icon: "🏨", note: "MCC 7011 · ignition swipe"),
        swipe2: ScriptSwipe(merchant: "Boudin Bakery", amount: 150, icon: "🍜", note: "Clam chowder bread bowls"),
        swipe3: ScriptSwipe(merchant: "Tartine Manufactory", amount: 100, icon: "🥐", note: "Brunch in the Mission"),
        vb: [
            VBRequest(icon: "🌉", ask: "A private sunset sail under the Golden Gate",
                      reply: "A 40-foot sloop, just for you, out past Fort Point as the fog burns gold. Skipper meets you at 18:00.",
                      stopTime: "18:00", stopTitle: "Golden Gate sunset sail", stopSub: "Private skippered sloop · Velocity Black"),
            VBRequest(icon: "🍽", ask: "A chef's counter that never has a table",
                      reply: "Handled. Saturday 20:30, six seats at the pass overlooking the kitchen — ask for Amara.",
                      stopTime: "20:30", stopTitle: "Chef's counter — the pass", stopSub: "Secured by Velocity Black"),
        ],
        vbStation: VBStation(threshold: 320, title: "A table at the city's quietest kitchen",
                             desc: "Ask the concierge — members only.")
    )

    static let miami = Trip(
        id: "miami", flag: "🌴", city: "Miami", dates: "Nov 14 – 17", mate: "Sofia",
        zip: "33139", heroWord: "Miami", welcome: "Welcome to Miami 🌴", tower: "🌴",
        wrapAirports: "MIA → IAD", wrapPlace: "Miami, USA", nights: 3,
        flightRoute: "IAD → MIA", flightPrice: 212, flightTrendUp: true, flightPct: 5,
        wxKind: .hot, wxLabel: "86°F · humid, afternoon storms",
        tiers: [
            Tier(id: 1, threshold: 70, emoji: "🍹", title: "La Sandwicherie", reward: "Free tropical smoothie"),
            Tier(id: 2, threshold: 225, emoji: "🎨", title: "Pérez Art Museum", reward: "50% off admission"),
            Tier(id: 3, threshold: 450, emoji: "🛥️", title: "Sunset Bay Cruise", reward: "$20 statement credit"),
        ],
        hotels: [
            Hotel(id: "std", name: "Found Hotel South Beach", area: "South Beach", nightly: 159, tier: "Standard"),
            Hotel(id: "lif", name: "The Betsy Hotel", area: "South Beach", nightly: 245, tier: "Lifestyle"),
            Hotel(id: "prem", name: "Four Seasons Miami", area: "Brickell", nightly: 520, tier: "Premier Collection"),
        ],
        heroOffer: ShoppingItem(icon: "🧴", name: "SPF 50 mineral sunscreen", price: 12, retailer: "REI"),
        shopping: [
            ShoppingItem(icon: "🕶️", name: "Polarized sunglasses", price: 28, retailer: "Warby Parker"),
            ShoppingItem(icon: "💧", name: "Insulated bottle", price: 24, retailer: "Hydro Flask"),
            ShoppingItem(icon: "🧢", name: "Packable sun hat", price: 18, retailer: "REI"),
        ],
        days: [
            Day(label: "Fri · Nov 14 — Arrival day", stops: [
                Stop(time: "20:00", title: "Joe's Stone Crab", sub: "Dinner with Sofia", status: .booked),
                Stop(time: "17:30", title: "South Beach sunset walk", sub: "Ocean Drive, golden hour", status: .idea),
            ]),
            Day(label: "Sat · Nov 15 — Art & the bay", stops: [
                Stop(time: "11:00", title: "Wynwood Walls + PAMM", sub: "5x miles via C1 Entertainment", status: .book, price: 28),
                Stop(time: "18:30", title: "Bayside Sunset Cruise", sub: "Tier 3 credits $20 at $450 spend", status: .idea, price: 45),
            ]),
        ],
        ignition: ScriptSwipe(merchant: "The Betsy Hotel", amount: 140, icon: "🏨", note: "MCC 7011 · ignition swipe"),
        swipe2: ScriptSwipe(merchant: "Versailles Restaurant", amount: 110, icon: "🥭", note: "Cuban lunch · Little Havana"),
        swipe3: ScriptSwipe(merchant: "La Mar by Gastón", amount: 135, icon: "🐟", note: "Dinner on the bay"),
        vb: [
            VBRequest(icon: "🥂", ask: "A rooftop table, no wait, tonight",
                      reply: "Done — rooftop at 21:00, the corner table with the bay view. Say the reservation is under Velocity.",
                      stopTime: "21:00", stopTitle: "Rooftop — no wait", stopSub: "Secured by Velocity Black"),
            VBRequest(icon: "🚤", ask: "Something only the yacht crowd knows",
                      reply: "A sandbar off Key Biscayne that doesn't show up on the apps. Boat leaves at 11:00 — bring sunscreen.",
                      stopTime: "11:00", stopTitle: "Hidden sandbar day trip", stopSub: "Private charter · Velocity Black"),
        ],
        vbStation: VBStation(threshold: 300, title: "The table South Beach pretends is full",
                             desc: "Ask the concierge — members only.")
    )

    static let orlando = Trip(
        id: "orlando", flag: "🎢", city: "Orlando", dates: "Dec 26 – 30", mate: "Meera",
        zip: "32819", heroWord: "Orlando", welcome: "Welcome to Orlando 🎢", tower: "🎢",
        wrapAirports: "MCO → IAD", wrapPlace: "Orlando, USA", nights: 4,
        flightRoute: "IAD → MCO", flightPrice: 178, flightTrendUp: true, flightPct: 4,
        wxKind: .hot, wxLabel: "84°F · afternoon thunderstorms",
        tiers: [
            Tier(id: 1, threshold: 80, emoji: "🍦", title: "Beaches & Cream", reward: "Free milkshake"),
            Tier(id: 2, threshold: 300, emoji: "🎢", title: "Epic Universe", reward: "50% off day upgrade"),
            Tier(id: 3, threshold: 600, emoji: "🎆", title: "Fireworks Dessert Party", reward: "$25 statement credit"),
        ],
        hotels: [
            Hotel(id: "std", name: "Holiday Inn Resort", area: "International Drive", nightly: 149, tier: "Standard"),
            Hotel(id: "lif", name: "Loews Sapphire Falls", area: "Universal Orlando", nightly: 259, tier: "Lifestyle"),
            Hotel(id: "prem", name: "Four Seasons Orlando", area: "Walt Disney World", nightly: 560, tier: "Premier Collection"),
        ],
        heroOffer: ShoppingItem(icon: "🧴", name: "SPF 50 mineral sunscreen", price: 12, retailer: "REI"),
        shopping: [
            ShoppingItem(icon: "💧", name: "Insulated bottle", price: 24, retailer: "Hydro Flask"),
            ShoppingItem(icon: "🧢", name: "Packable sun hat", price: 18, retailer: "REI"),
            ShoppingItem(icon: "🔋", name: "10k mAh power bank", price: 29, retailer: "Amazon"),
        ],
        days: [
            Day(label: "Sat · Dec 26 — Arrival day", stops: [
                Stop(time: "19:00", title: "Disney Springs dinner", sub: "The whole crew", status: .booked),
                Stop(time: "21:00", title: "Magic Kingdom stroll", sub: "Main Street, lights on", status: .idea),
            ]),
            Day(label: "Sun · Dec 27 — Universal day", stops: [
                Stop(time: "09:30", title: "Universal Epic Universe", sub: "5x miles via C1 Entertainment", status: .book, price: 189),
                Stop(time: "20:30", title: "Fireworks Dessert Party", sub: "Tier 3 credits $25 at $600 spend", status: .idea, price: 65),
            ]),
        ],
        ignition: ScriptSwipe(merchant: "Loews Sapphire Falls", amount: 150, icon: "🏨", note: "MCC 7011 · ignition swipe"),
        swipe2: ScriptSwipe(merchant: "Beaches & Cream", amount: 60, icon: "🍦", note: "Milkshakes for the crew"),
        swipe3: ScriptSwipe(merchant: "Toothsome Emporium", amount: 170, icon: "🍫", note: "Dinner at CityWalk"),
        vb: [
            VBRequest(icon: "🎢", ask: "Skip every line, today",
                      reply: "A private guide meets you at the gate at 9:00 — Lightning Lane on every headliner, no app required.",
                      stopTime: "09:00", stopTitle: "Private VIP park guide", stopSub: "Skip every line · Velocity Black"),
            VBRequest(icon: "🎆", ask: "Best fireworks view, reserved",
                      reply: "A rooftop terrace above Main Street, champagne for the adults, held from 20:30.",
                      stopTime: "20:30", stopTitle: "Rooftop fireworks viewing", stopSub: "Reserved terrace · Velocity Black"),
        ],
        vbStation: VBStation(threshold: 350, title: "A ride the park closes just for you",
                             desc: "Ask the concierge — members only.")
    )

    /// Standalone template — City Key self-provisions this from MSA + MCC alone
    /// when the first out-of-market swipe arrives with no plan on file.
    static let chicago = Trip(
        id: "chicago", flag: "🌆", city: "Chicago", dates: "Right now", mate: "",
        zip: "60611", heroWord: "Chicago", welcome: "Welcome to Chicago 🌆 — no plan, no problem", tower: "🏙️",
        wrapAirports: "ORD → IAD", wrapPlace: "Chicago, USA · the trip that planned itself", nights: 2,
        flightRoute: "IAD → ORD", flightPrice: 196, flightTrendUp: true, flightPct: 4,
        wxKind: .hot, wxLabel: "89°F · lakefront heat",
        tiers: [
            Tier(id: 1, threshold: 75, emoji: "🌭", title: "Portillo's", reward: "Free Chicago dog"),
            Tier(id: 2, threshold: 250, emoji: "🎨", title: "Art Institute", reward: "50% off admission"),
            Tier(id: 3, threshold: 500, emoji: "🏙️", title: "Skydeck Ledge", reward: "$20 statement credit"),
        ],
        hotels: [
            Hotel(id: "std", name: "Hotel Zachary", area: "Wrigleyville", nightly: 159, tier: "Standard"),
            Hotel(id: "lif", name: "The Drake Hotel", area: "Gold Coast", nightly: 225, tier: "Lifestyle"),
            Hotel(id: "prem", name: "Waldorf Astoria", area: "Gold Coast", nightly: 430, tier: "Premier Collection"),
        ],
        heroOffer: ShoppingItem(icon: "💧", name: "Insulated bottle", price: 24, retailer: "Hydro Flask"),
        shopping: [
            ShoppingItem(icon: "🕶️", name: "Polarized sunglasses", price: 28, retailer: "Warby Parker"),
            ShoppingItem(icon: "🧢", name: "Packable sun hat", price: 18, retailer: "REI"),
        ],
        days: [Day(label: "Today — unplanned", stops: [])],
        ignition: ScriptSwipe(merchant: "The Drake Hotel", amount: 130, icon: "🏨", note: "MCC 7011 · ignition swipe"),
        swipe2: ScriptSwipe(merchant: "Lou Malnati's", amount: 95, icon: "🍕", note: "Deep dish for two"),
        swipe3: ScriptSwipe(merchant: "Au Cheval", amount: 80, icon: "🍔", note: "The burger, obviously"),
        vb: [
            VBRequest(icon: "🥩", ask: "The steakhouse with the two-year waitlist",
                      reply: "Held. Tomorrow 20:00, the corner booth. They will not ask how you got it.",
                      stopTime: "20:00", stopTitle: "The impossible booth", stopSub: "Secured by Velocity Black"),
            VBRequest(icon: "🎷", ask: "Something after midnight",
                      reply: "There's a basement in Uptown where the second set never gets announced. Door knows your name now.",
                      stopTime: "00:30", stopTitle: "Unannounced second set", stopSub: "Location shared day-of"),
        ],
        vbStation: VBStation(threshold: 280, title: "A table Chicago pretends not to have",
                             desc: "Ask the concierge — members only."),
        isStandalone: true
    )
}

// ── formatting helpers ──
func money(_ n: Double) -> String {
    let f = NumberFormatter()
    f.numberStyle = .currency
    f.currencyCode = "USD"
    f.maximumFractionDigits = n.truncatingRemainder(dividingBy: 1) == 0 ? 0 : 2
    return f.string(from: NSNumber(value: n)) ?? "$\(n)"
}

func money2(_ n: Double) -> String {
    let f = NumberFormatter()
    f.numberStyle = .currency
    f.currencyCode = "USD"
    f.minimumFractionDigits = 2
    f.maximumFractionDigits = 2
    return f.string(from: NSNumber(value: n)) ?? "$\(n)"
}

/// deterministic hash for mock price-drop math (mirrors web's dropFor)
func stableHash(_ s: String) -> Int {
    var h = 5
    for c in s.unicodeScalars { h = (h &* 33 &+ Int(c.value)) & 0x7FFFFFFF }
    return h
}

func dropFor(title: String, price: Double) -> (save: Double, via: String) {
    let h = stableHash(title)
    let save = max(3, (price * (0.12 + Double(h % 9) / 100)).rounded())
    let via = ["TodayTix", "GetYourGuide", "Viator", "Klook", "Rakuten"][h % 5]
    return (save, via)
}
