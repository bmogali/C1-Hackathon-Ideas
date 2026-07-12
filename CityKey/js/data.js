/* ═══ VENTURE KEY · trip data, constants & shared state ═══ */

/* ═══════════════════════════════════════════════
   VENTURE KEY · multi-trip state machine + authoring
═══════════════════════════════════════════════ */
const TRIPS = {
  paris: {
    key: 'paris', id: 'par-2026-07', name: 'Summer in Paris', flag: '🇫🇷',
    city: 'Paris', country: 'France', zip: '75004', dates: 'Jul 12 – 18', mates: ['Priya'],
    budget: 2400, nights: 6, tower: '🗼', airports: 'CDG', welcome: 'Bienvenue à Paris 🇫🇷',
    heroWord: 'Paris', planSub: 'Five stops sketched in ink. Book them on the card and the trip pays you back before you even board.',
    wx: { kind: 'hot', label: '93°F · heat wave likely' },
    notes: 'Louvre is closed Tuesdays. Métro carnet > single tickets. Dinner reservations run late — 21:00 is normal.',
    places: ['Sainte-Chapelle', 'Luxembourg Gardens'],
    suggest: [
      { emoji: '🥖', title: 'Marché des Enfants Rouges', desc: 'Oldest covered market in Paris' },
      { emoji: '🏰', title: 'Versailles day trip', desc: 'RER C · 40 min' },
      { emoji: '🎠', title: 'Montmartre & Sacré-Cœur', desc: 'Best at golden hour' },
    ],
    tiers: [
      { id: 1, threshold: 100, emoji: '🥐', title: 'Pâtisserie Fleur', reward: 'Free macaron', value: 4, code: 'C1-PARIS-101' },
      { id: 2, threshold: 300, emoji: '🖼️', title: "Musée d'Orsay", reward: '50% off entry', value: 9, code: 'C1-PARIS-202' },
      { id: 3, threshold: 600, emoji: '🚤', title: 'Seine Sunset Cruise', reward: '$25 statement credit', value: 25, code: 'C1-PARIS-303' },
    ],
    partners: ['🖼️ LOUVRE · 5X', '🚤 SEINE · $10', '🚇 RATP · 2X', '🥐 FLEUR · TIER 1'],
    days: [
      { label: 'Sun · Jul 12 — Arrival day', stops: [
        { time: '09:30', cat: 'dining', title: 'Café de Flore', sub: 'Saint-Germain-des-Prés · breakfast with Priya', status: 'booked' },
        { time: '11:00', cat: 'attractions', title: 'Louvre Museum', sub: 'Timed entry', perk: '5x miles via C1 Entertainment', status: 'book', price: 22 },
        { time: '15:00', cat: 'attractions', title: 'Eiffel Tower Summit', sub: '', perk: '5x miles + VIP priority access', status: 'book', price: 45 },
      ]},
      { label: 'Mon · Jul 13 — Museums & the Seine', stops: [
        { time: '10:00', cat: 'attractions', title: "Musée d'Orsay", sub: '', status: 'idea', price: 18, tier: 2,
          lockedHint: '🔒 City Key Tier 2 pays half — unlocks at $300 destination spend',
          openHint: '🎉 Tier 2 live — your Musée d\'Orsay ticket is now half price' },
        { time: '19:30', cat: 'attractions', title: 'Seine Sunset Cruise', sub: '', status: 'idea', price: 38, tier: 3,
          lockedHint: '🔒 City Key Tier 3 credits $25 — unlocks at $600 destination spend',
          openHint: '🎉 Tier 3 live — $25 off your Seine cruise' },
      ]},
    ],
    script: {
      ign: { merchant: 'Hôtel Le Marais', logName: 'Hotel Le Marais', amount: 120, mcc: '7011', icon: '🏨', time: '21:34 · Sat', note: 'MCC 7011 · ignition swipe', date: 'Jul 12', location: 'Paris 75004, FR' },
      s2:  { merchant: 'Le Baristas', label: 'Café', amount: 160, mcc: '5812', icon: '☕', time: '09:12 · Sun', note: 'flat whites & tartines', date: 'Jul 13', location: 'Paris 75004, FR', toast: '93% to Station 2 · only $20 to go' },
      s3:  { merchant: 'Bistro Chez Anne', label: 'Dinner', amount: 95, mcc: '5812', icon: '🍷', time: '20:05 · Sun', note: 'dinner in Le Marais', date: 'Jul 13', location: 'Paris 75004, FR' },
      retDate: 'Jul 18',
    },
    wrapSub: 'Paris, France · Jul 12 – 18 · Bharath + Priya',
    settled: 'Trip settled · Jul 18',
    vb: [
      { icon: '🍽', ask: "A table at L'Ambroisie — Saturday night, two seats", reply: "Done. Saturday 21:00, two covers at L'Ambroisie, Place des Vosges. The chef knows the occasion. Jackets, s'il vous plaît.", stop: { day: 1, time: '21:00', cat: 'dining', title: "L'Ambroisie — secured table", sub: 'Place des Vosges · 2 covers · via Velocity Black' } },
      { icon: '🖼', ask: 'The Louvre after closing — just us', reply: 'Arranged. Thursday 21:30, a private hour in the Denon wing with a curator. Enter by the Porte des Lions — someone will be waiting.', stop: { day: 1, time: '21:30', cat: 'attractions', title: 'Louvre — private after-hours', sub: 'Denon wing · curator-led · 2 guests' } },
      { icon: '🚁', ask: 'Something unforgettable for the last evening', reply: 'Leave the last evening to us. Helicopter from Issy at 18:40, dinner in a vineyard outside Versailles, back by midnight.', stop: { day: 1, time: '18:40', cat: 'entertainment', title: 'Vineyard dinner · heli transfer', sub: 'Curated end-to-end by Velocity Black' } },
    ],
    vbStation: { threshold: 350, title: 'Private Seine boat at golden hour', desc: 'Skipper, champagne, 90 minutes — the river to yourselves.' },
  },

  nyc: {
    key: 'nyc', id: 'nyc-2026-08', name: 'NYC Long Weekend', flag: '🗽',
    city: 'New York', country: 'USA', zip: '10003', dates: 'Aug 21 – 24', mates: ['Arjun'],
    budget: 1800, nights: 3, tower: '🗽', airports: 'JFK', welcome: 'Welcome to New York 🗽',
    heroWord: 'New York', planSub: 'Four days, five stops, one skyline. Book ahead on the card — the city covers the snacks.',
    wx: { kind: 'hot', label: '88°F · hot & humid' },
    notes: 'OMNY caps weekly fares after 12 rides. TKTS booth opens 15:00 for evening shows.',
    places: ['Chelsea Market', 'Top of the Rock'],
    suggest: [
      { emoji: '🌉', title: 'High Line walk', desc: 'Chelsea → Hudson Yards' },
      { emoji: '🍜', title: "Xi'an Famous Foods", desc: 'Spicy cumin lamb noodles' },
      { emoji: '🖼️', title: 'The Met', desc: 'Fifth Ave · full day' },
    ],
    tiers: [
      { id: 1, threshold: 75, emoji: '🥯', title: 'Russ & Daughters', reward: 'Free bagel & schmear', value: 6, code: 'C1-NYC-101' },
      { id: 2, threshold: 250, emoji: '🎨', title: 'MoMA', reward: '50% off admission', value: 14, code: 'C1-NYC-202' },
      { id: 3, threshold: 500, emoji: '🎭', title: 'Broadway · TKTS', reward: '$30 ticket credit', value: 30, code: 'C1-NYC-303' },
    ],
    partners: ['🎨 MOMA · 5X', '🎭 TKTS · $30', '🚇 OMNY · 2X', '🥯 RUSS & D · TIER 1'],
    days: [
      { label: 'Fri · Aug 21 — Arrival day', stops: [
        { time: '13:00', cat: 'dining', title: "Katz's Delicatessen", sub: 'Lower East Side · pastrami with Arjun', status: 'booked' },
        { time: '17:30', cat: 'attractions', title: 'Summit One Vanderbilt', sub: 'Sunset slot', perk: '5x miles via C1 Entertainment', status: 'book', price: 42 },
      ]},
      { label: 'Sat · Aug 22 — Museums & bridges', stops: [
        { time: '10:30', cat: 'attractions', title: 'MoMA — Timed entry', sub: '', perk: '5x miles via C1 Entertainment', status: 'book', price: 28, tier: 2,
          lockedHint: '🔒 City Key Tier 2 pays half — unlocks at $250 destination spend',
          openHint: '🎉 Tier 2 live — MoMA admission is now half price' },
        { time: '16:00', cat: 'walk', title: 'Brooklyn Bridge → DUMBO', sub: 'Golden hour photos', status: 'idea' },
        { time: '19:30', cat: 'entertainment', title: 'Broadway — Hadestown', sub: '', status: 'idea', price: 89, tier: 3,
          lockedHint: '🔒 City Key Tier 3 credits $30 — unlocks at $500 destination spend',
          openHint: '🎉 Tier 3 live — $30 off Broadway tickets' },
      ]},
    ],
    script: {
      ign: { merchant: 'The Bowery Hotel', logName: 'The Bowery Hotel', amount: 140, mcc: '7011', icon: '🏨', time: '15:20 · Fri', note: 'MCC 7011 · ignition swipe', date: 'Aug 21', location: 'New York 10003' },
      s2:  { merchant: 'Ess-a-Bagel', label: 'Bagels', amount: 95, mcc: '5812', icon: '🥯', time: '09:40 · Sat', note: 'bagels & lox for two', date: 'Aug 22', location: 'New York 10003', toast: '94% to Station 2 · only $15 to go' },
      s3:  { merchant: "Joe's Pizza + MoMA Store", label: 'Slices', amount: 85, mcc: '5812', icon: '🍕', time: '19:15 · Sat', note: 'slices & souvenirs', date: 'Aug 22', location: 'New York 10003' },
      retDate: 'Aug 24',
    },
    wrapSub: 'New York, USA · Aug 21 – 24 · Bharath + Arjun',
    settled: 'Trip settled · Aug 24',
    vb: [
      { icon: '🍣', ask: 'Omakase counter at Masa — this weekend', reply: "Confirmed. Saturday 19:00, two seats at the counter. Chef Takayama's selection — allergies noted from your profile.", stop: { day: 1, time: '19:00', cat: 'dining', title: 'Masa — omakase counter', sub: 'Columbus Circle · 2 seats · via Velocity Black' } },
      { icon: '🎭', ask: 'House seats for Hadestown — tonight', reply: 'Handled. Row C center, tonight 19:00. Playbills signed by the cast, waiting at will call under your name.', stop: { day: 0, time: '19:00', cat: 'entertainment', title: 'Hadestown — house seats', sub: 'Row C center · signed playbills' } },
      { icon: '🏀', ask: 'Courtside at the Garden', reply: "Two courtside for Friday. You'll enter through the players' tunnel lounge — ask for Marcus.", stop: { day: 1, time: '19:30', cat: 'entertainment', title: 'Knicks — courtside', sub: "MSG · players' tunnel entrance" } },
    ],
    vbStation: { threshold: 300, title: 'After-hours MoMA with a curator', desc: 'The Starry Night with no one else in the room.' },
  },

  sfo: {
    key: 'sfo', id: 'sfo-2026-09', name: 'San Francisco Weekend', flag: '🌉',
    city: 'San Francisco', country: 'USA', zip: '94103', dates: 'Sep 18 – 22', mates: ['Diego'],
    budget: 2000, nights: 4, tower: '🌉', airports: 'SFO', welcome: 'Welcome to San Francisco 🌉',
    heroWord: 'San Francisco', planSub: 'Bridges, bay, and bakeries. Book ahead on the card — the fog burns off by noon.',
    wx: { kind: 'mild', label: '62°F · fog rolls in by afternoon' },
    notes: 'Fog usually clears the Mission by noon. Pack a light jacket even in July — the bay breeze doesn\'t care about the season.',
    places: ['Lombard Street', 'Twin Peaks lookout'],
    suggest: [
      { emoji: '🌉', title: 'Golden Gate Bridge bike ride', desc: 'Bike to Sausalito, ferry back' },
      { emoji: '🦭', title: 'Pier 39 sea lions', desc: 'Free, always chaotic' },
      { emoji: '🍜', title: 'Chinatown alley crawl', desc: 'Oldest Chinatown in North America' },
    ],
    tiers: [
      { id: 1, threshold: 75, emoji: '🥟', title: 'Good Mong Kok Bakery', reward: 'Free egg tart', value: 4, code: 'C1-SFO-101' },
      { id: 2, threshold: 275, emoji: '🎨', title: 'SFMOMA', reward: '50% off admission', value: 13, code: 'C1-SFO-202' },
      { id: 3, threshold: 550, emoji: '🚋', title: 'Cable Car Museum + ride pass', reward: '$20 statement credit', value: 20, code: 'C1-SFO-303' },
    ],
    partners: ['🎨 SFMOMA · 5X', '🚋 MUNI · 2X', '🦀 FISHERMAN\'S WHARF · $15', '🥟 MONG KOK · TIER 1'],
    days: [
      { label: 'Fri · Sep 18 — Arrival day', stops: [
        { time: '12:30', cat: 'dining', title: 'Ferry Building Marketplace', sub: 'Bay-view lunch with Diego', status: 'booked' },
        { time: '15:00', cat: 'attractions', title: 'Japanese Tea Garden', sub: 'Golden Gate Park', perk: '5x miles via C1 Entertainment', status: 'book', price: 12 },
      ]},
      { label: 'Sat · Sep 19 — Bridges & the bay', stops: [
        { time: '19:00', cat: 'attractions', title: 'Alcatraz Night Tour', sub: '', perk: '5x miles via C1 Entertainment', status: 'book', price: 55, tier: 2,
          lockedHint: '🔒 City Key Tier 2 pays half — unlocks at $275 destination spend',
          openHint: '🎉 Tier 2 live — your SFMOMA admission is now half price' },
        { time: '10:00', cat: 'walk', title: 'Coit Tower + North Beach', sub: 'Espresso crawl on the way down', status: 'idea' },
      ]},
    ],
    script: {
      ign: { merchant: 'Hotel Zeppelin', logName: 'Hotel Zeppelin', amount: 130, mcc: '7011', icon: '🏨', time: '16:40 · Fri', note: 'MCC 7011 · ignition swipe', date: 'Sep 18', location: 'San Francisco 94103' },
      s2:  { merchant: 'Boudin Bakery', label: 'Chowder', amount: 150, mcc: '5812', icon: '🍜', time: '12:15 · Sat', note: 'clam chowder bread bowls', date: 'Sep 19', location: 'San Francisco 94103' },
      s3:  { merchant: 'Tartine Manufactory', label: 'Brunch', amount: 100, mcc: '5812', icon: '🥐', time: '10:30 · Sun', note: 'weekend brunch in the Mission', date: 'Sep 20', location: 'San Francisco 94103' },
      retDate: 'Sep 22',
    },
    wrapSub: 'San Francisco, USA · Sep 18 – 22 · Bharath + Diego',
    settled: 'Trip settled · Sep 22',
    vb: [
      { icon: '🍽', ask: "A chef's counter that never has a table", reply: 'Handled. Saturday 20:30, six seats at the pass overlooking the kitchen — ask for Amara.', stop: { day: 1, time: '20:30', cat: 'dining', title: "San Francisco — chef's counter", sub: 'Secured by Velocity Black' } },
      { icon: '🌉', ask: 'A private sunset sail under the Golden Gate', reply: 'A 40-foot sloop, just for you, out past Fort Point as the fog burns gold. Skipper meets you at the marina at 18:00.', stop: { day: 1, time: '18:00', cat: 'entertainment', title: 'Golden Gate sunset sail', sub: 'Private skippered sloop · Velocity Black' } },
    ],
    vbStation: { threshold: 320, title: "A table at the city's quietest kitchen", desc: 'Ask the concierge — members only.' },
  },

  miami: {
    key: 'miami', id: 'mia-2026-11', name: 'Miami Getaway', flag: '🌴',
    city: 'Miami', country: 'USA', zip: '33139', dates: 'Nov 14 – 17', mates: ['Sofia'],
    budget: 1600, nights: 3, tower: '🌴', airports: 'MIA', welcome: 'Welcome to Miami 🌴',
    heroWord: 'Miami', planSub: 'Art, bay breeze, and dinner reservations that fill fast. Book ahead — the card handles the rest.',
    wx: { kind: 'hot', label: '86°F · humid, afternoon storms' },
    notes: 'South Beach lifeguard stands close by sunset. Friday dinner reservations fill up — book early.',
    places: ['Wynwood Walls', 'Vizcaya Museum & Gardens'],
    suggest: [
      { emoji: '🎨', title: 'Wynwood street art walk', desc: 'Free, best at golden hour' },
      { emoji: '🛥️', title: 'Biscayne Bay boat tour', desc: 'Star Island celebrity homes' },
      { emoji: '🥭', title: 'Little Havana food crawl', desc: 'Cuban coffee + croquetas' },
    ],
    tiers: [
      { id: 1, threshold: 70, emoji: '🍹', title: 'La Sandwicherie', reward: 'Free tropical smoothie', value: 4, code: 'C1-MIA-101' },
      { id: 2, threshold: 225, emoji: '🎨', title: 'Pérez Art Museum', reward: '50% off admission', value: 11, code: 'C1-MIA-202' },
      { id: 3, threshold: 450, emoji: '🛥️', title: 'Sunset Bay Cruise', reward: '$20 statement credit', value: 20, code: 'C1-MIA-303' },
    ],
    partners: ['🎨 PAMM · 5X', '🛥️ BAY CRUISE · $20', '🚇 METROMOVER · FREE', '🍹 SANDWICHERIE · TIER 1'],
    days: [
      { label: 'Fri · Nov 14 — Arrival day', stops: [
        { time: '20:00', cat: 'dining', title: "Joe's Stone Crab", sub: 'Dinner with Sofia', status: 'booked' },
        { time: '17:30', cat: 'walk', title: 'South Beach sunset walk', sub: 'Ocean Drive, golden hour', status: 'idea' },
      ]},
      { label: 'Sat · Nov 15 — Art & the bay', stops: [
        { time: '11:00', cat: 'attractions', title: 'Wynwood Walls + PAMM', sub: '', perk: '5x miles via C1 Entertainment', status: 'book', price: 28, tier: 2,
          lockedHint: '🔒 City Key Tier 2 pays half — unlocks at $225 destination spend',
          openHint: '🎉 Tier 2 live — your Pérez Art Museum admission is now half price' },
        { time: '18:30', cat: 'attractions', title: 'Bayside Sunset Cruise', sub: '', status: 'idea', price: 45, tier: 3,
          lockedHint: '🔒 City Key Tier 3 credits $20 — unlocks at $450 destination spend',
          openHint: '🎉 Tier 3 live — $20 off your bay cruise' },
      ]},
    ],
    script: {
      ign: { merchant: 'The Betsy Hotel', logName: 'The Betsy Hotel', amount: 140, mcc: '7011', icon: '🏨', time: '17:10 · Fri', note: 'MCC 7011 · ignition swipe', date: 'Nov 14', location: 'Miami 33139' },
      s2:  { merchant: 'Versailles Restaurant', label: 'Cuban lunch', amount: 110, mcc: '5812', icon: '🥭', time: '13:00 · Sat', note: 'Cuban lunch in Little Havana', date: 'Nov 15', location: 'Miami 33139' },
      s3:  { merchant: 'La Mar by Gastón Acurio', label: 'Dinner', amount: 135, mcc: '5812', icon: '🐟', time: '20:15 · Sat', note: 'dinner on the bay', date: 'Nov 15', location: 'Miami 33139' },
      retDate: 'Nov 17',
    },
    wrapSub: 'Miami, USA · Nov 14 – 17 · Bharath + Sofia',
    settled: 'Trip settled · Nov 17',
    vb: [
      { icon: '🥂', ask: 'A rooftop table, no wait, tonight', reply: 'Done — rooftop at 21:00, the corner table with the bay view. Say the reservation is under Velocity.', stop: { day: 0, time: '21:00', cat: 'dining', title: 'Miami — rooftop, no wait', sub: 'Secured by Velocity Black' } },
      { icon: '🚤', ask: 'Something only the yacht crowd knows about', reply: "A sandbar off Key Biscayne that doesn't show up on the apps. Boat leaves the marina at 11:00 — bring sunscreen.", stop: { day: 1, time: '11:00', cat: 'entertainment', title: 'Hidden sandbar day trip', sub: 'Private charter · Velocity Black' } },
    ],
    vbStation: { threshold: 300, title: 'The table South Beach pretends is full', desc: 'Ask the concierge — members only.' },
  },

  orlando: {
    key: 'orlando', id: 'orl-2026-12', name: 'Orlando Family Trip', flag: '🎢',
    city: 'Orlando', country: 'USA', zip: '32819', dates: 'Dec 26 – 30', mates: ['Meera', 'Kian'],
    budget: 2600, nights: 4, tower: '🎢', airports: 'MCO', welcome: 'Welcome to Orlando 🎢',
    heroWord: 'Orlando', planSub: 'Parks, fireworks, and a whole crew to keep fed. Book ahead — the card keeps up.',
    wx: { kind: 'hot', label: '84°F · afternoon thunderstorms' },
    notes: 'Parks open early — arrive 30 min before rope drop. Afternoon storms are near-daily; evenings clear up fast.',
    places: ['Disney Springs', 'ICON Park'],
    suggest: [
      { emoji: '🎡', title: 'ICON Park wheel at night', desc: 'Great skyline views' },
      { emoji: '🍩', title: 'Disney Springs dessert crawl', desc: 'Sprinkles, Salt & Straw, more' },
      { emoji: '🐊', title: 'Gatorland day trip', desc: '20 min from the parks' },
    ],
    tiers: [
      { id: 1, threshold: 80, emoji: '🍦', title: 'Beaches & Cream', reward: 'Free milkshake', value: 5, code: 'C1-ORL-101' },
      { id: 2, threshold: 300, emoji: '🎢', title: 'Universal Epic Universe', reward: '50% off single-day upgrade', value: 15, code: 'C1-ORL-202' },
      { id: 3, threshold: 600, emoji: '🎆', title: 'Fireworks Dessert Party', reward: '$25 statement credit', value: 25, code: 'C1-ORL-303' },
    ],
    partners: ['🎢 UNIVERSAL · 5X', '🎆 DESSERT PARTY · $25', '🚌 DISNEY BUS · FREE', '🍦 B&C · TIER 1'],
    days: [
      { label: 'Sat · Dec 26 — Arrival day', stops: [
        { time: '19:00', cat: 'dining', title: 'Disney Springs dinner', sub: 'The whole crew', status: 'booked' },
        { time: '21:00', cat: 'walk', title: 'Magic Kingdom evening stroll', sub: 'Main Street, lights on', status: 'idea' },
      ]},
      { label: 'Sun · Dec 27 — Universal day', stops: [
        { time: '09:30', cat: 'attractions', title: 'Universal Epic Universe', sub: '', perk: '5x miles via C1 Entertainment', status: 'book', price: 189, tier: 2,
          lockedHint: '🔒 City Key Tier 2 pays half off a single-day upgrade — unlocks at $300 destination spend',
          openHint: '🎉 Tier 2 live — 50% off your single-day upgrade' },
        { time: '20:30', cat: 'entertainment', title: 'Fireworks Dessert Party', sub: '', status: 'idea', price: 65, tier: 3,
          lockedHint: '🔒 City Key Tier 3 credits $25 — unlocks at $600 destination spend',
          openHint: '🎉 Tier 3 live — $25 off the dessert party' },
      ]},
    ],
    script: {
      ign: { merchant: 'Loews Sapphire Falls Resort', logName: 'Loews Sapphire Falls Resort', amount: 150, mcc: '7011', icon: '🏨', time: '15:50 · Sat', note: 'MCC 7011 · ignition swipe', date: 'Dec 26', location: 'Orlando 32819' },
      s2:  { merchant: 'Beaches & Cream', label: 'Milkshakes', amount: 60, mcc: '5812', icon: '🍦', time: '16:20 · Sun', note: 'milkshakes for the crew', date: 'Dec 27', location: 'Orlando 32819' },
      s3:  { merchant: 'Toothsome Chocolate Emporium', label: 'Dinner', amount: 170, mcc: '5812', icon: '🍫', time: '19:40 · Sun', note: 'dinner at CityWalk', date: 'Dec 27', location: 'Orlando 32819' },
      retDate: 'Dec 30',
    },
    wrapSub: 'Orlando, USA · Dec 26 – 30 · Bharath + Meera + Kian',
    settled: 'Trip settled · Dec 30',
    vb: [
      { icon: '🎢', ask: 'Skip every line, today', reply: 'A private guide meets you at the gate at 9:00 — Lightning Lane on every headliner, no app required.', stop: { day: 1, time: '09:00', cat: 'entertainment', title: 'Private VIP park guide', sub: 'Skip every line · Velocity Black' } },
      { icon: '🎆', ask: 'Best fireworks view in the park, reserved', reply: 'A rooftop terrace above Main Street, champagne for the adults, held from 20:30.', stop: { day: 1, time: '20:30', cat: 'entertainment', title: 'Rooftop fireworks viewing', sub: 'Reserved terrace · Velocity Black' } },
    ],
    vbStation: { threshold: 350, title: 'A ride the park closes just for you', desc: 'Ask the concierge — members only.' },
  },
};

const freshTripState = () => ({ active: false, settled: false, spend: 0, swipes: [], claimed: new Set(), booked: 0, bookedCount: 0, credits: 0, saved: 0, bought: new Set(), vbThread: [], vbUsed: new Set(), vbGreeted: false, vbExpress: false,
  armed: false, hotel: null, flight: null, hotelAnnounced: false, folioCount: 0, protectionAmt: 0, travelIntent: null, travelExpanded: false, zelleRequests: [] });
const tripState = { paris: freshTripState(), nyc: freshTripState(), sfo: freshTripState(), miami: freshTripState(), orlando: freshTripState() };

let simTrip = 'paris', viewTrip = 'paris', liveTrip = null, curScreen = 'home';
const fired = { ignite: false, swipe2: false, swipe3: false, ret: false };
const BASE_BALANCE = 1284.09, CREDIT_LIMIT = 30000, BASE_MILES = 86420;

const CAT_META = { dining: 'dining · mcc 5812', attractions: 'attractions · mcc 7999', lodging: 'lodging · mcc 7011', transit: 'transit · mcc 4111', shopping: 'shopping · mcc 5942', entertainment: 'entertainment · mcc 7922', walk: 'walk · free' };
const CAT_STYLE = {
  dining:        { i: '🍽', c: '#d97706', bg: 'rgba(217,119,6,.14)' },
  attractions:   { i: '🎟', c: '#0276b1', bg: 'rgba(2,118,177,.14)' },
  entertainment: { i: '🎭', c: '#9333ea', bg: 'rgba(147,51,234,.13)' },
  transit:       { i: '🚇', c: '#0d9488', bg: 'rgba(13,148,136,.15)' },
  shopping:      { i: '🛍', c: '#db2777', bg: 'rgba(219,39,119,.12)' },
  lodging:       { i: '🏨', c: '#4f46e5', bg: 'rgba(79,70,229,.13)' },
  walk:          { i: '🚶', c: '#65a30d', bg: 'rgba(101,163,13,.15)' },
};
const FLAGS = { tokyo: '🇯🇵', lisbon: '🇵🇹', rome: '🇮🇹', barcelona: '🇪🇸', london: '🇬🇧', 'mexico city': '🇲🇽', sydney: '🇦🇺', reykjavik: '🇮🇸', oslo: '🇳🇴', helsinki: '🇫🇮' };

/* ═══════════ CAPITAL ONE SHOPPING · trip intelligence ═══════════ */
const WX = {
  hot:  { icon: '☀️', c: '#dc2626', bg: 'rgba(220,38,38,.12)',  reason: 'Heat forecast' },
  cold: { icon: '❄️', c: '#2563eb', bg: 'rgba(37,99,235,.12)',  reason: 'Extreme cold forecast' },
  rain: { icon: '🌧️', c: '#0d9488', bg: 'rgba(13,148,136,.13)', reason: 'Rainy season' },
  mild: { icon: '⛅', c: '#65a30d', bg: 'rgba(101,163,13,.14)', reason: 'Mild forecast' },
};
const WX_BY_CITY = { tokyo: 'rain', lisbon: 'hot', rome: 'hot', barcelona: 'hot', london: 'rain', reykjavik: 'cold', oslo: 'cold', helsinki: 'cold', zurich: 'cold', sydney: 'mild' };
const WX_LABEL = { hot: '92°F · heat likely', cold: '27°F · extreme cold', rain: '68°F · rainy season', mild: '72°F · mild & clear' };
const RECS = {
  hot: {
    hero: { icon: '🧴', name: 'SPF 50 mineral sunscreen', price: 12, back: 5, retailer: 'REI' },
    kit: [
      { icon: '🕶️', name: 'Polarized sunglasses', why: 'Full-sun afternoons', price: 28, back: 6, retailer: 'Warby Parker' },
      { icon: '🧢', name: 'Packable sun hat', why: 'Long queues, little shade', price: 18, back: 4, retailer: 'REI' },
      { icon: '💧', name: 'Insulated water bottle', why: 'Refill, stay cool', price: 24, back: 5, retailer: 'Hydro Flask' },
    ],
    local: 'Pharmacy sunscreen next to the big sights runs about 3× the price you\'d pay today.',
  },
  cold: {
    hero: { icon: '🧥', name: 'Packable down jacket', price: 119, back: 8, retailer: 'Patagonia' },
    kit: [
      { icon: '🧤', name: 'Thermal touchscreen gloves', why: 'Photos without frostbite', price: 22, back: 6, retailer: 'REI' },
      { icon: '🧣', name: 'Merino wool scarf', why: 'Wind chill below freezing', price: 34, back: 5, retailer: 'Nordstrom' },
      { icon: '🥾', name: 'Waterproof snow boots', why: 'Icy sidewalks ahead', price: 89, back: 7, retailer: 'REI' },
    ],
    local: 'Buying winter layers in-city means tourist-district markup — roughly double.',
  },
  rain: {
    hero: { icon: '🧥', name: 'Packable rain shell', price: 59, back: 7, retailer: 'REI' },
    kit: [
      { icon: '☔', name: 'Compact travel umbrella', why: 'Daily showers expected', price: 19, back: 5, retailer: 'Amazon' },
      { icon: '👟', name: 'Waterproof sneakers', why: 'Wet cobblestones', price: 74, back: 6, retailer: 'Amazon' },
      { icon: '🎒', name: 'Dry-bag daypack', why: 'Keep the camera dry', price: 39, back: 5, retailer: 'REI' },
    ],
    local: 'Street umbrellas double in price the minute it starts raining. They know.',
  },
  mild: {
    hero: { icon: '🔋', name: '10k mAh power bank', price: 29, back: 6, retailer: 'Amazon' },
    kit: [
      { icon: '🎒', name: 'Anti-theft daypack', why: 'Busy old-town streets', price: 39, back: 5, retailer: 'REI' },
      { icon: '👟', name: 'Walking sneakers', why: '20k steps a day', price: 79, back: 7, retailer: 'Amazon' },
      { icon: '🔌', name: 'Universal travel adapter', why: 'Different plugs abroad', price: 23, back: 5, retailer: 'Amazon' },
    ],
    local: 'Airport electronics run 2–3× the price of ordering tonight.',
  },
};

/* ═══════════ CAPITAL ONE TRAVEL · hotels & flights ═══════════
   Mock booking inventory. Real capabilities represented: Hopper price
   prediction, Premier Collection perks, 10x hotel / 5x flight earn (Venture X),
   and the $300 annual travel credit applied automatically at hotel checkout. */
const hashStr = (s) => Math.abs([...String(s)].reduce((a, c) => (a * 31 + c.charCodeAt(0)) | 0, 7));

const HOTELS = {
  paris: [
    { id: 'std',  name: 'Hôtel Bastille Speria', area: 'Bastille', rating: 4.2, nightly: 165, collection: 'standard',  prediction: { advice: 'wait', pct: 6 } },
    { id: 'lif',  name: 'Hôtel Le Marais',       area: 'Le Marais', rating: 4.6, nightly: 210, collection: 'lifestyle', prediction: { advice: 'book_now', pct: 8 } },
    { id: 'prem', name: 'Hôtel Plaza Vendôme Suites', area: 'Champs-Élysées', rating: 4.9, nightly: 410, collection: 'premier', prediction: { advice: 'book_now', pct: 4 } },
  ],
  'new york': [
    { id: 'std',  name: 'Pod 51',          area: 'Midtown East', rating: 4.0, nightly: 189, collection: 'standard',  prediction: { advice: 'book_now', pct: 5 } },
    { id: 'lif',  name: 'The Bowery Hotel', area: 'NoHo',        rating: 4.6, nightly: 245, collection: 'lifestyle', prediction: { advice: 'wait', pct: 7 } },
    { id: 'prem', name: 'The Mark',        area: 'Upper East Side', rating: 4.9, nightly: 520, collection: 'premier', prediction: { advice: 'book_now', pct: 3 } },
  ],
  chicago: [
    { id: 'std',  name: 'Hotel Zachary',   area: 'Wrigleyville', rating: 4.3, nightly: 159, collection: 'standard',  prediction: { advice: 'book_now', pct: 5 } },
    { id: 'lif',  name: 'The Drake Hotel', area: 'Gold Coast',   rating: 4.6, nightly: 225, collection: 'lifestyle', prediction: { advice: 'book_now', pct: 6 } },
    { id: 'prem', name: 'Waldorf Astoria Chicago', area: 'Gold Coast', rating: 4.9, nightly: 430, collection: 'premier', prediction: { advice: 'wait', pct: 5 } },
  ],
  'san francisco': [
    { id: 'std',  name: 'Hotel Zephyr',    area: "Fisherman's Wharf", rating: 4.2, nightly: 179, collection: 'standard',  prediction: { advice: 'wait', pct: 5 } },
    { id: 'lif',  name: 'Hotel Zeppelin',  area: 'Union Square',      rating: 4.5, nightly: 229, collection: 'lifestyle', prediction: { advice: 'book_now', pct: 6 } },
    { id: 'prem', name: 'The Ritz-Carlton San Francisco', area: 'Nob Hill', rating: 4.9, nightly: 480, collection: 'premier', prediction: { advice: 'book_now', pct: 3 } },
  ],
  miami: [
    { id: 'std',  name: 'Found Hotel South Beach', area: 'South Beach', rating: 4.0, nightly: 159, collection: 'standard',  prediction: { advice: 'wait', pct: 6 } },
    { id: 'lif',  name: 'The Betsy Hotel',         area: 'South Beach', rating: 4.6, nightly: 245, collection: 'lifestyle', prediction: { advice: 'book_now', pct: 7 } },
    { id: 'prem', name: 'Four Seasons Hotel Miami', area: 'Brickell',   rating: 4.9, nightly: 520, collection: 'premier', prediction: { advice: 'book_now', pct: 3 } },
  ],
  orlando: [
    { id: 'std',  name: 'Holiday Inn Resort Orlando', area: 'International Drive', rating: 4.1, nightly: 149, collection: 'standard',  prediction: { advice: 'book_now', pct: 5 } },
    { id: 'lif',  name: 'Loews Sapphire Falls Resort', area: 'Universal Orlando',  rating: 4.6, nightly: 259, collection: 'lifestyle', prediction: { advice: 'book_now', pct: 6 } },
    { id: 'prem', name: 'Four Seasons Resort Orlando', area: 'Walt Disney World',  rating: 4.9, nightly: 560, collection: 'premier', prediction: { advice: 'wait', pct: 4 } },
  ],
};

function hotelsFor(T) {
  const key = T.city.toLowerCase();
  if (HOTELS[key]) return HOTELS[key];
  const h = hashStr(T.city);
  const base = 110 + (h % 90);
  return [
    { id: 'std',  name: `${T.city} Central Hotel`,       area: 'City center',    rating: 4.2, nightly: base,       collection: 'standard',  prediction: { advice: h % 2 ? 'book_now' : 'wait', pct: 4 + (h % 6) } },
    { id: 'lif',  name: `The ${T.city} Loft`,             area: 'Design district', rating: 4.5, nightly: base + 55,  collection: 'lifestyle', prediction: { advice: 'book_now', pct: 3 + (h % 5) } },
    { id: 'prem', name: `${T.city} Premier Residences`,   area: 'Old town',        rating: 4.8, nightly: base + 180, collection: 'premier',   prediction: { advice: 'book_now', pct: 2 + (h % 4) } },
  ];
}

const FLIGHTS = {
  paris: { route: 'IAD → CDG', price: 612, prediction: { advice: 'book_now', pct: 8 } },
  'new york': { route: 'IAD → JFK', price: 238, prediction: { advice: 'wait', pct: 6 } },
  chicago: { route: 'IAD → ORD', price: 196, prediction: { advice: 'book_now', pct: 4 } },
  'san francisco': { route: 'IAD → SFO', price: 348, prediction: { advice: 'wait', pct: 7 } },
  miami: { route: 'IAD → MIA', price: 212, prediction: { advice: 'book_now', pct: 5 } },
  orlando: { route: 'IAD → MCO', price: 178, prediction: { advice: 'book_now', pct: 4 } },
};

function flightFor(T) {
  const key = T.city.toLowerCase();
  if (FLIGHTS[key]) return FLIGHTS[key];
  const h = hashStr(T.city);
  return { route: `IAD → ${T.airports}`, price: 380 + (h % 300), prediction: { advice: h % 2 ? 'book_now' : 'wait', pct: 4 + (h % 7) } };
}

/* ── account ledger · tag: null | {trip, mode} ── */
let txnSeq = 0;
const txns = [
  { id: ++txnSeq, icon: '🎭', merchant: 'Telecharge', desc: 'Hadestown × 2 · orchestra', date: 'Jul 1', amount: 178.00, mcc: '7922', category: 'Entertainment', location: 'telecharge.com', miles: 356, status: 'Posted', tag: null },
  { id: ++txnSeq, icon: '🔌', merchant: 'Amazon', desc: 'Universal travel adapter', date: 'Jul 5', amount: 23.47, mcc: '5942', category: 'Merchandise', location: 'amazon.com', miles: 47, status: 'Posted', tag: null },
  { id: ++txnSeq, icon: '⛽', merchant: 'Shell', desc: 'Fuel', date: 'Jul 4', amount: 42.10, mcc: '5541', category: 'Gas', location: 'Chantilly, VA', miles: 84, status: 'Posted', tag: null },
  { id: ++txnSeq, icon: '🛒', merchant: 'Wegmans', desc: 'Groceries', date: 'Jul 3', amount: 118.62, mcc: '5411', category: 'Groceries', location: 'Fairfax, VA', miles: 237, status: 'Posted', tag: null },
  { id: ++txnSeq, icon: '✈️', merchant: 'Air France', desc: 'IAD → CDG · 2 travelers', date: 'Jul 2', amount: 780.00, mcc: '3007', category: 'Airlines', location: 'airfrance.us', miles: 1560, status: 'Posted', tag: null },
];
const SEED_SUM = 1142.19, SEED_MILES = 2284;
let openTxnId = null, openStopForm = null;

const $ = (id) => document.getElementById(id);
const fmt  = (n) => '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2 });
const fmt0 = (n) => '$' + n.toLocaleString('en-US', { maximumFractionDigits: 0 });
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
/* escape a string for safe embedding inside a single-quoted JS argument in an onclick="" attribute
   — several merchant names in this app carry apostrophes (Joe's Pizza, Katz's, Portillo's, Lou Malnati's) */
const jsEsc = (s) => String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'");

const WD = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], MO = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const dLabel = (d) => `${MO[d.getUTCMonth()]} ${d.getUTCDate()}`;

/* ── multi-account · the retail relationship ── */
const ACCOUNTS = [
  { key: 'venturex',    icon: '✈️', name: 'Venture X',                num: '····4907', kind: 'Credit card', primary: true,  bal: 1284.09, note: 'The card that travels' },
  { key: 'checking',    icon: '🏦', name: '360 Checking',             num: '···2201',  kind: 'Deposits',    bal: 8214.55,  note: 'Direct deposit · Fridays' },
  { key: 'savings',     icon: '🌱', name: '360 Performance Savings',  num: '···8832',  kind: 'Deposits',    bal: 24610.03, note: '3.90% APY' },
  { key: 'quicksilver', icon: '💳', name: 'Quicksilver',              num: '····1189', kind: 'Credit card', bal: 0,        note: 'AutoPay on · paid off' },
];

/* ── CITY KEY · standalone template — provisioned from MSA + MCC alone, no plan ── */
const STANDALONE = {
  id: 'chi-2026-07', name: 'City Key · Chicago', flag: '🌆', standalone: true,
  city: 'Chicago', country: 'USA', zip: '60611', dates: 'Right now', mates: [],
  budget: 1200, nights: 2, tower: '🏙️', airports: 'ORD', welcome: 'Welcome to Chicago 🌆 — no plan, no problem',
  heroWord: 'Chicago', planSub: 'Born from a single swipe — City Key provisioned this trip on its own. Draw a line whenever you feel like it.',
  wx: { kind: 'hot', label: '89°F · lakefront heat' },
  notes: '', places: [],
  suggest: [
    { emoji: '🌭', title: 'Chicago dog crawl', desc: 'No ketchup. Ever.' },
    { emoji: '🛥️', title: 'Architecture river cruise', desc: 'The classic first-timer move' },
    { emoji: '🎷', title: 'Green Mill jazz club', desc: 'Uptown · late sets' },
  ],
  tiers: [
    { id: 1, threshold: 75, emoji: '🌭', title: "Portillo's", reward: 'Free Chicago dog', value: 4, code: 'C1-CHI-101' },
    { id: 2, threshold: 250, emoji: '🎨', title: 'Art Institute', reward: '50% off admission', value: 13, code: 'C1-CHI-202' },
    { id: 3, threshold: 500, emoji: '🏙️', title: 'Skydeck Ledge', reward: '$20 statement credit', value: 20, code: 'C1-CHI-303' },
  ],
  partners: ['🎨 ART INST · 5X', '🏙️ SKYDECK · $20', '🚇 CTA · 2X', "🌭 PORTILLO'S · TIER 1"],
  days: [{ label: 'Today — unplanned', stops: [] }],
  script: {
    ign: { merchant: 'The Drake Hotel', logName: 'The Drake Hotel', amount: 130, mcc: '7011', icon: '🏨', time: '14:05 · Today', note: 'MCC 7011 · ignition swipe', date: 'Jul 7', location: 'Chicago 60611' },
    s2:  { merchant: "Lou Malnati's", label: 'Deep dish', amount: 95, mcc: '5812', icon: '🍕', time: '19:20 · Today', note: 'deep dish for two', date: 'Jul 7', location: 'Chicago 60611', toast: '90% to Station 2 · only $25 to go' },
    s3:  { merchant: 'Au Cheval', label: 'Burgers', amount: 80, mcc: '5812', icon: '🍔', time: '13:10 · +1d', note: 'the burger, obviously', date: 'Jul 8', location: 'Chicago 60611' },
    retDate: 'Jul 9',
  },
  wrapSub: 'Chicago, USA · the trip that planned itself · Bharath',
  settled: 'Trip settled · Jul 9',
  vb: [
    { icon: '🥩', ask: 'The steakhouse with the two-year waitlist', reply: 'Held. Tomorrow 20:00, the corner booth. They will not ask how you got it.', stop: { day: 0, time: '20:00', cat: 'dining', title: 'Chicago — the impossible booth', sub: 'Secured by Velocity Black' } },
    { icon: '🎷', ask: 'Something after midnight', reply: "There's a basement in Uptown where the second set never gets announced. Door knows your name now.", stop: { day: 0, time: '00:30', cat: 'entertainment', title: 'Unannounced second set', sub: 'Location shared day-of · Velocity Black' } },
  ],
  vbStation: { threshold: 280, title: 'A table Chicago pretends not to have', desc: 'Ask the concierge — members only.' },
};
