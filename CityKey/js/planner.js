/* ═══ VENTURE KEY · Venture Planner — authoring, booking, Shopping, Price Watch, tickets ═══ */

let hotelSearchOpen = null; // tripKey whose hotel results panel is expanded

function metaChips(stop) {
  const cs = CAT_STYLE[stop.cat] || CAT_STYLE.walk;
  let h = `<span class="chip" style="color:var(--accent); background: color-mix(in srgb, var(--accent) 13%, transparent);">🕒 ${esc(stop.time)}</span>`;
  h += `<span class="chip" style="color:${cs.c}; background:${cs.bg};">${cs.i} ${esc(stop.cat)}</span>`;
  const mcc = (CAT_META[stop.cat] || '').match(/mcc (\d+)/);
  if (mcc) h += `<span class="chip font-mono" style="background: var(--surface2); color: var(--muted); letter-spacing:.06em;">MCC ${mcc[1]}</span>`;
  if (stop.price) h += `<span class="chip" style="color:#5c8f1d; background: rgba(159,211,86,.18);">$${stop.price}</span>`;
  if (stop.dropApplied) h += `<span class="chip" style="color:#db2777; background: rgba(219,39,119,.12);">🛍 −$${stop.dropApplied} applied</span>`;
  return `<div class="flex flex-wrap gap-1.5">${h}</div>`;
}

/* ── e-tickets · QR access for C1 Travel bookings ── */
const ticketCode = (s) => 'C1T-' + Math.abs([...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) | 0, 7)).toString(36).toUpperCase().padStart(6, 'X').slice(0, 6);
function showTicket(tripKey, di, si) {
  const T = TRIPS[tripKey], day = T.days[di], stop = day.stops[si];
  $('tk-title').textContent = stop.title;
  $('tk-sub').textContent = `${T.city} ${T.flag} · ${day.label.split(' — ')[0]}`;
  $('tk-code').textContent = ticketCode(stop.title + T.id);
  $('tk-time').textContent = '🕒 ' + stop.time;
  $('tk-price').textContent = stop.price ? '$' + stop.price + '.00' : 'Included';
  drawQR($('tk-qr'), ticketCode(stop.title + T.id) + stop.title);
  const m = $('modal-ticket'); m.classList.remove('hidden'); m.classList.add('flex');
}
function closeTicket() { const m = $('modal-ticket'); m.classList.add('hidden'); m.classList.remove('flex'); }
function drawQR(canvas, seed) {
  const N = 25, sz = canvas.width / N, ctx = canvas.getContext('2d');
  ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, canvas.width, canvas.height);
  let h = 2166136261;
  [...seed].forEach((c) => { h = (h ^ c.charCodeAt(0)) * 16777619 | 0; });
  const rnd = () => { h ^= h << 13; h ^= h >>> 17; h ^= h << 5; return (h >>> 0) / 4294967296; };
  ctx.fillStyle = '#10131c';
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
    const inFinder = (r < 8 && c < 8) || (r < 8 && c >= N - 8) || (r >= N - 8 && c < 8);
    if (!inFinder && rnd() > 0.52) ctx.fillRect(c * sz, r * sz, sz, sz);
  }
  for (let i = 8; i < N - 8; i += 2) { ctx.fillRect(i * sz, 6 * sz, sz, sz); ctx.fillRect(6 * sz, i * sz, sz, sz); }
  const finder = (x, y) => {
    ctx.fillRect(x * sz, y * sz, 7 * sz, 7 * sz);
    ctx.fillStyle = '#fff'; ctx.fillRect((x + 1) * sz, (y + 1) * sz, 5 * sz, 5 * sz);
    ctx.fillStyle = '#10131c'; ctx.fillRect((x + 2) * sz, (y + 2) * sz, 3 * sz, 3 * sz);
  };
  finder(0, 0); finder(N - 7, 0); finder(0, N - 7);
}

/* what the itinerary + forecast + history actually say about YOU */
function whyFor(T) {
  const day1 = T.days[0]?.stops.map((s) => s.title).slice(0, 3) || [];
  const route = day1.length >= 2 ? `${day1[0]} → ${day1[day1.length - 1]}` : (day1[0] || 'your first day');
  const wxLine = {
    hot: `Forecast says ${T.wx.label.toLowerCase()} across ${T.dates} — peak UV lands mid-afternoon, right on your outdoor slots.`,
    cold: `Forecast says ${T.wx.label.toLowerCase()} across ${T.dates} — wind chill will find you between stops.`,
    rain: `Forecast says ${T.wx.label.toLowerCase()} across ${T.dates} — showers cluster in the afternoon.`,
    mild: `Forecast says ${T.wx.label.toLowerCase()} across ${T.dates} — long days on your feet.`,
  }[T.wx.kind];
  return [
    day1.length ? `Day 1 runs ${route} — hours outdoors, back to back.` : 'Your plan leans outdoors once you add stops.',
    wxLine,
    RECS[T.wx.kind].local,
  ];
}

function renderShopping(T, S) {
  const wx = WX[T.wx.kind], R = RECS[T.wx.kind];
  const travelers = 1 + T.mates.length;
  const why = whyFor(T);
  const stopCount = T.days.reduce((a, d) => a + d.stops.length, 0);
  return `
    <p class="microlabel acc mt-10 mb-3">🛍 Capital One Shopping · Trip Intelligence</p>
    <div class="srf rounded-3xl overflow-hidden">
      <div class="px-6 pt-6 pb-5">
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p class="font-display text-3xl font-light">Offers that fit <em class="acc" style="font-style:italic;">this trip.</em></p>
            <p class="text-sm mut mt-2 max-w-lg leading-relaxed">Matched to your itinerary and the ${esc(T.dates)} forecast for ${esc(T.city)} — not a generic deals feed.</p>
          </div>
          <div class="flex flex-col items-end gap-1.5">
            <span class="chip" style="color:${wx.c}; background:${wx.bg};">${wx.icon} ${esc(T.wx.label)}</span>
            <span class="chip" style="color:#5c8f1d; background: rgba(159,211,86,.18);">💵 ${fmt(S.credits)} credits earned</span>
          </div>
        </div>

      </div>

      <!-- hero offer · matched to context -->
      <div class="px-6 py-5" style="background: color-mix(in srgb, var(--accent) 7%, transparent); border-top: 1px solid var(--border); border-bottom: 1px solid var(--border);">
        <p class="microlabel acc mb-3">Top offer · matched to this trip</p>
        <div class="flex flex-wrap items-start gap-5">
          <span class="h-16 w-16 rounded-2xl srf flex items-center justify-center text-3xl shrink-0">${R.hero.icon}</span>
          <div class="flex-1 min-w-[220px]">
            <p class="text-xl font-bold">${R.hero.name} <span class="mut text-sm font-medium">× ${travelers} traveler${travelers > 1 ? 's' : ''} · on ${R.hero.retailer}</span></p>
            <ul class="mt-2 space-y-1.5">
              ${why.map((w) => `<li class="text-[13px] mut leading-snug flex gap-2"><span class="acc font-bold shrink-0">·</span>${esc(w)}</li>`).join('')}
            </ul>
          </div>
          <div class="text-right shrink-0">
            <p class="text-2xl font-bold" style="font-variant-numeric:tabular-nums;">$${R.hero.price * travelers}</p>
            <p class="text-[11px] font-bold" style="color:#5c8f1d;">${R.hero.back}% back in credits</p>
            ${S.bought.has('hero')
              ? '<p class="mt-2.5 text-sm font-bold" style="color:#79a83e;">In your trip kit ✓</p>'
              : `<button onclick="buyRec('hero')" class="mt-2.5 rounded-full bg-c1blue hover:bg-[#026597] text-white text-sm font-bold px-5 py-2.5 transition-colors">Buy on ${R.hero.retailer} · Pay with Paze</button>`}
          </div>
        </div>
      </div>

      <!-- complete the kit -->
      <div class="px-6 pt-5 pb-6">
        <p class="microlabel fnt mb-3">More offers that fit this trip</p>
        <div class="grid sm:grid-cols-3 gap-2.5">
          ${R.kit.map((r, i) => `
            <div class="rounded-xl srf2 px-4 py-3">
              <div class="flex items-center justify-between">
                <span class="text-xl">${r.icon}</span>
                ${S.bought.has(String(i))
                  ? '<span class="text-[11px] font-bold" style="color:#79a83e;">Added ✓</span>'
                  : `<button onclick="buyRec(${i})" class="rounded-full bg-c1blue text-white text-[11px] font-bold px-3 py-1 hover:bg-[#026597]">Buy on ${r.retailer} · Paze</button>`}
              </div>
              <p class="text-sm font-bold mt-2 leading-tight">${r.name}</p>
              <p class="text-[11px] mut mt-0.5">${r.why} · <b style="color:#5c8f1d;">${r.back}% back</b></p>
            </div>`).join('')}
        </div>
        <p class="text-[10px] fnt mt-4 leading-relaxed">Matched using your itinerary (${stopCount} stops), the ${esc(T.dates)} forecast, and ${travelers} traveler${travelers > 1 ? 's' : ''} — nothing else. Merchant-funded offers; orders post to your card and auto-tag to this trip.</p>
      </div>
    </div>`;
}

/* price watch lives with the plan — it guards the tickets you already chose */
function renderPriceWatch(T, S) {
  const drops = [];
  T.days.forEach((day, di) => day.stops.forEach((stop, si) => {
    if (stop.price && stop.price >= 20 && !stop.dropApplied && (stop.status === 'idea' || stop.status === 'book')) drops.push({ di, si, stop });
  }));
  const totalPossible = drops.reduce((a, d) => a + dropFor(d.stop).save, 0);
  const protection = S.hotel && S.hotel.dropDetected ? `
    <div class="rounded-xl px-4 py-3 mb-3 flex flex-wrap items-center gap-3" style="background: color-mix(in srgb, var(--accent) 8%, transparent); border:1px solid color-mix(in srgb, var(--accent) 25%, transparent);">
      <span class="text-lg">🛡️</span>
      <div class="flex-1 min-w-0">
        <p class="text-sm font-bold">${esc(S.hotel.name)} — rate dropped ${fmt0(S.hotel.dropAmt)} after booking</p>
        <p class="text-[11px] mut mt-0.5">${S.hotel.protectionClaimed ? 'Credit posted to your account ✓' : 'Price drop protection filed · credit posts in 3–5 days'}</p>
      </div>
      ${S.hotel.protectionClaimed
        ? `<span class="text-xs font-bold" style="color:#5c8f1d;">Claimed ✓</span>`
        : `<button onclick="claimProtection('${T.key}')" class="rounded-full text-white text-xs font-bold px-4 py-2 hover:brightness-110" style="background:#10131c;">Claim</button>`}
    </div>` : '';
  return `
    <p class="microlabel acc mt-10 mb-3">📉 Price Watch · Capital One Travel &amp; Shopping</p>
    <div class="srf rounded-2xl p-5 max-w-2xl">
      ${protection}
      <div class="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p class="font-bold">${drops.length ? `Watching ${drops.length} ticket${drops.length > 1 ? 's' : ''} on this plan` : 'Every ticket on this plan is at its best price'}</p>
          <p class="text-[11px] mut mt-0.5">Hopper-grade prediction before you book · drop protection after — re-checked every 6 hours across 30,000+ sellers.</p>
        </div>
        ${S.saved ? `<span class="chip" style="color:#5c8f1d; background: rgba(159,211,86,.18);">saved ${fmt0(S.saved)} so far</span>`
          : drops.length ? `<span class="chip" style="color:var(--accent); background: color-mix(in srgb, var(--accent) 13%, transparent);">${fmt0(totalPossible)} on the table</span>` : `<span class="chip" style="color:#5c8f1d; background: rgba(159,211,86,.18);">✓ all optimal</span>`}
      </div>
      ${drops.length ? `<div class="mt-4 space-y-1.5">
        ${drops.map((d) => {
          const alt = dropFor(d.stop);
          return `<div class="rounded-xl srf2 px-4 py-2.5 flex flex-wrap items-center gap-3">
            <span class="text-lg">${(CAT_STYLE[d.stop.cat] || CAT_STYLE.walk).i}</span>
            <p class="text-sm font-bold flex-1 min-w-0 truncate">${esc(d.stop.title)}</p>
            <p class="text-sm"><span class="line-through fnt">$${d.stop.price}</span> <b style="color:#5c8f1d;">$${d.stop.price - alt.save}</b> <span class="text-[11px] mut">· ${alt.via}</span></p>
            <button onclick="applyDrop(${d.di},${d.si})" class="rounded-full text-white text-xs font-bold px-3.5 py-1.5 hover:brightness-110" style="background:#10131c;">Apply</button>
          </div>`;
        }).join('')}</div>` : ''}
    </div>`;
}

/* ═══════════ CAPITAL ONE TRAVEL · flights & hotels ═══════════
   See c1-travel-hotels-spec.md. Booking a hotel or flight here is the
   trigger that arms City Key (§2 of the spec) before a single swipe happens.
   We ask before we build — customers who don't want booking help never
   see the widget clutter. */
function renderGettingThere(T, S) {
  const hasBookings = !!(S.hotel || S.flight);

  if (!hasBookings && S.travelIntent === null) {
    return `
    <div class="travel-shell travel-ask p-8 sm:p-12 mb-10 text-center">
      <p class="microlabel acc mb-4">Travel &amp; Stay · Capital One Travel</p>
      <p class="font-display text-3xl sm:text-5xl font-light max-w-xl mx-auto leading-[1.05]">Shall we handle getting <em>there?</em></p>
      <p class="mut text-sm sm:text-base mt-4 max-w-md mx-auto leading-relaxed">
        Flights, a hotel, price protection, and your $300 annual travel credit — booked right here.
        City Key arms itself for ${esc(T.city)} the moment you confirm.
      </p>
      <div class="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button onclick="setTravelIntent('${T.key}','yes')" class="btn-travel-primary">Yes, let's book →</button>
        <button onclick="setTravelIntent('${T.key}','skip')" class="btn-travel-ghost">I'll handle it myself</button>
      </div>
    </div>`;
  }

  if (!hasBookings && S.travelIntent === 'skip') {
    return `
    <div class="flex flex-wrap items-center justify-between gap-3 mb-10 px-1">
      <p class="text-xs fnt">✈️ Flights and hotel aren't being booked here for this trip.</p>
      <button onclick="setTravelIntent('${T.key}','yes')" class="text-xs font-bold acc hover:opacity-70">Actually, let's book →</button>
    </div>`;
  }

  const flightBooked = !!(S.flight && S.flight.total);
  const fullyBooked = flightBooked && !!S.hotel;

  if (fullyBooked && !S.travelExpanded) return renderTravelSummary(T, S);

  const f = flightFor(T);
  const pred = f.prediction.advice === 'book_now'
    ? { icon: '📈', text: `Fares are trending up ${f.prediction.pct}% for these dates — booking today locks the price.` }
    : { icon: '🧊', text: `Fares tend to ease before departure — freeze today's rate while you wait.` };
  const [origin, dest] = f.route.split(' → ');

  const flightCard = flightBooked ? `
    <div class="travel-card p-6 sm:p-7" style="border-color: rgba(159,211,86,.5);">
      <div class="flex items-start justify-between gap-3">
        <div>
          <p class="microlabel fnt mb-2">Getting there · booked</p>
          <p class="font-display text-3xl sm:text-4xl font-light">${esc(origin)} <span class="acc">→</span> ${esc(dest)}</p>
        </div>
        <span class="text-[10px] font-bold uppercase tracking-widest rounded-full px-3 py-1.5 shrink-0" style="background: rgba(159,211,86,.14); color:#5c8f1d;">Confirmed ✓</span>
      </div>
      <div class="grid grid-cols-3 gap-3 mt-5">
        <div class="travel-stat"><p class="microlabel fnt">Travelers</p><p class="text-lg font-bold mt-1">${S.flight.travelers}</p></div>
        <div class="travel-stat"><p class="microlabel fnt">Total fare</p><p class="text-lg font-bold mt-1">${fmt0(S.flight.total)}</p></div>
        <div class="travel-stat"><p class="microlabel fnt">Miles earned</p><p class="text-lg font-bold mt-1 acc">${Math.round(S.flight.total * 5).toLocaleString()}</p></div>
      </div>
    </div>` : `
    <div class="travel-card p-6 sm:p-7">
      <p class="microlabel fnt mb-2">Getting there</p>
      <p class="font-display text-3xl sm:text-4xl font-light">${esc(origin)} <span class="acc">→</span> ${esc(dest)}</p>
      <div class="insight-row mt-5">
        <span class="insight-dot" style="background: color-mix(in srgb, var(--accent) 14%, transparent); color: var(--accent);">${pred.icon}</span>
        <div class="min-w-0 pt-1.5">
          <p class="text-sm font-semibold leading-snug">${pred.text}</p>
          <p class="text-[11px] mut mt-1.5">⭐ 5x miles on this fare · Capital One Travel price prediction</p>
        </div>
      </div>
      ${S.flight && S.flight.frozen ? `<p class="text-[11px] mt-3 font-semibold acc">🧊 Frozen at ${fmt0(S.flight.frozenPrice)} · 6 days left to book</p>` : ''}
      <div class="mt-6 flex flex-wrap items-center justify-between gap-4">
        <p class="text-2xl font-bold" style="font-variant-numeric:tabular-nums;">${fmt0(f.price)}<span class="text-sm mut font-medium"> · per traveler</span></p>
        <div class="flex flex-wrap gap-2.5">
          <button onclick="freezeFlight('${T.key}')" class="btn-travel-ghost">Freeze rate · $8</button>
          <button onclick="bookFlight('${T.key}')" class="btn-travel-primary">Book flight</button>
        </div>
      </div>
    </div>`;

  const hotelCard = S.hotel ? `
    <div class="travel-card p-6 sm:p-7 mt-4" style="border-color: rgba(159,211,86,.5);">
      <div class="flex items-start justify-between gap-3">
        <div>
          <p class="microlabel fnt mb-2">Staying at</p>
          <p class="font-display text-2xl sm:text-3xl font-light">${esc(S.hotel.name)}</p>
          ${S.hotel.collection === 'premier' ? `<p class="text-xs font-bold mt-1.5" style="color:#b8860b;">◆ Premier Collection</p>` : ''}
        </div>
        <span class="text-[10px] font-bold uppercase tracking-widest rounded-full px-3 py-1.5 shrink-0" style="background: rgba(159,211,86,.14); color:#5c8f1d;">Armed ✓</span>
      </div>
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
        <div class="travel-stat"><p class="microlabel fnt">Nights</p><p class="text-lg font-bold mt-1">${S.hotel.nights}</p></div>
        <div class="travel-stat"><p class="microlabel fnt">Total</p><p class="text-lg font-bold mt-1">${fmt0(S.hotel.total)}</p></div>
        <div class="travel-stat"><p class="microlabel fnt">Travel credit</p><p class="text-lg font-bold mt-1" style="color:#5c8f1d;">−${fmt0(S.hotel.creditApplied)}</p></div>
        <div class="travel-stat"><p class="microlabel fnt">Net · miles</p><p class="text-lg font-bold mt-1">${fmt0(S.hotel.net)} <span class="acc">· ${S.hotel.miles.toLocaleString()}mi</span></p></div>
      </div>
    </div>` : `
    <div class="travel-card p-6 sm:p-7 mt-4">
      <div class="flex flex-wrap items-center justify-between gap-5">
        <div class="min-w-[220px]">
          <p class="microlabel fnt mb-2">Where you'll stay</p>
          <p class="font-display text-2xl sm:text-3xl font-light">Let's find your <em class="acc" style="font-style:italic;">home base.</em></p>
          <p class="text-sm mut mt-2 max-w-sm leading-relaxed">Booking now arms City Key for ${esc(T.city)} before you land — Base Camp appears on your line automatically.</p>
        </div>
        <button onclick="toggleHotelSearch('${T.key}')" class="btn-travel-primary shrink-0">${hotelSearchOpen === T.key ? 'Hide hotels' : 'Search hotels'}</button>
      </div>
      ${hotelSearchOpen === T.key ? renderHotelResults(T) : ''}
    </div>`;

  return `
    <div class="mb-10">
      <div class="flex items-center justify-between mb-4">
        <p class="microlabel acc">✈️ Travel &amp; Stay · Capital One Travel</p>
        ${fullyBooked ? `<button onclick="toggleTravelSummary('${T.key}')" class="text-xs font-bold fnt hover:opacity-70">▲ Show compact</button>` : ''}
      </div>
      ${flightCard}
      ${hotelCard}
    </div>`;
}

/* once both legs are booked, the full stat-grid cards give way to one
   compact confirmation strip — the rest of the plan (Shopping, Explore,
   itinerary) shouldn't have to fight travel logistics for space. */
function renderTravelSummary(T, S) {
  const [origin, dest] = flightFor(T).route.split(' → ');
  const totalMiles = Math.round(S.flight.total * 5) + S.hotel.miles;
  return `
    <div class="mb-10">
      <p class="microlabel acc mb-4">✈️ Travel &amp; Stay · Capital One Travel</p>
      <button onclick="toggleTravelSummary('${T.key}')" class="travel-card w-full text-left p-5 flex flex-wrap items-center justify-between gap-4">
        <div class="flex items-center gap-4 min-w-0">
          <div class="flex -space-x-2 shrink-0">
            <span class="h-11 w-11 rounded-full flex items-center justify-center text-lg border-2" style="background: color-mix(in srgb, var(--accent) 16%, var(--surface)); border-color: var(--surface);">✈️</span>
            <span class="h-11 w-11 rounded-full flex items-center justify-center text-lg border-2" style="background: color-mix(in srgb, var(--accent) 16%, var(--surface)); border-color: var(--surface);">🏨</span>
          </div>
          <div class="min-w-0">
            <p class="font-bold text-sm sm:text-base truncate">${esc(origin)} → ${esc(dest)} · ${esc(S.hotel.name)}</p>
            <p class="text-[11px] mut mt-1">${S.hotel.nights} nights · ${totalMiles.toLocaleString()} miles earned · both confirmed</p>
          </div>
        </div>
        <div class="flex items-center gap-3 shrink-0">
          <span class="text-[10px] font-bold uppercase tracking-widest rounded-full px-3 py-1.5" style="background: rgba(159,211,86,.14); color:#5c8f1d;">Booked ✓</span>
          <span class="text-xs font-bold fnt">Details ▾</span>
        </div>
      </button>
    </div>`;
}

function toggleTravelSummary(tripKey) {
  const S = tripState[tripKey];
  S.travelExpanded = !S.travelExpanded;
  renderPlan();
}

function renderHotelResults(T) {
  const nights = T.nights || 3;
  return `
    <div class="grid sm:grid-cols-3 gap-4 mt-6">
      ${hotelsFor(T).map((h) => {
        const total = h.nightly * nights;
        const net = Math.max(0, total - 300);
        const isPremier = h.collection === 'premier';
        const pred = h.prediction.advice === 'book_now'
          ? { icon: '📈', text: `Trending up ${h.prediction.pct}% — book today` }
          : { icon: '🧊', text: `May ease ${h.prediction.pct}% — freeze or wait` };
        return `
        <div class="travel-card ${isPremier ? 'premier' : ''} overflow-hidden flex flex-col">
          ${isPremier ? `<div class="travel-ribbon px-4 py-2.5 text-center"><p class="text-[10px] font-bold uppercase tracking-[.3em]">◆ Premier Collection</p></div>` : ''}
          <div class="p-5 flex-1 flex flex-col">
            <p class="font-display text-xl font-light leading-tight">${esc(h.name)}</p>
            <p class="text-xs mut mt-1.5">${esc(h.area)} · ${h.rating}★</p>
            <div class="insight-row mt-4">
              <span class="insight-dot" style="background: color-mix(in srgb, var(--accent) 14%, transparent); color: var(--accent); font-size:13px;">${pred.icon}</span>
              <p class="text-xs mut leading-snug pt-2">${pred.text}</p>
            </div>
            ${isPremier ? `<p class="text-[11px] mt-3 leading-relaxed" style="color:#b8860b;">$100 experience credit · daily breakfast for two · upgrade when available</p>` : ''}
            <div class="mt-auto pt-5">
              <p class="text-2xl font-bold" style="font-variant-numeric:tabular-nums;">${fmt0(h.nightly)}<span class="text-xs mut font-medium"> / night</span></p>
              <p class="text-[11px] mut mt-1">${fmt0(total)} total · <b style="color:#5c8f1d;">${fmt0(net)} after credit</b> · ⭐ 10x miles</p>
              <button onclick="bookHotel('${T.key}','${h.id}')" class="btn-travel-primary w-full mt-3">Book this stay</button>
            </div>
          </div>
        </div>`;
      }).join('')}
    </div>`;
}

function setTravelIntent(tripKey, val) {
  tripState[tripKey].travelIntent = val;
  renderPlan();
}

function toggleHotelSearch(tripKey) {
  hotelSearchOpen = hotelSearchOpen === tripKey ? null : tripKey;
  renderPlan();
}

function bookHotel(tripKey, hotelId) {
  const T = TRIPS[tripKey], S = tripState[tripKey];
  if (S.hotel) return;
  const hotel = hotelsFor(T).find((h) => h.id === hotelId);
  const nights = T.nights || 3;
  const total = hotel.nightly * nights;
  const creditApplied = Math.min(300, total);
  const net = total - creditApplied;
  const miles = total * 10;
  S.hotel = { ...hotel, nights, total, creditApplied, net, miles, dropDetected: false, protectionClaimed: false };
  S.booked += net; S.bookedCount += 1;
  addTxn({ icon: '🏨', merchant: 'Capital One Travel', desc: `${hotel.name} · ${nights} nights · 10x miles`, date: 'Jul 6', amount: total, mcc: '7011', category: 'Lodging', location: 'capitalonetravel.com', miles, tag: { trip: tripKey, mode: 'auto' } });
  addTxn({ icon: '💳', merchant: 'Capital One Travel', desc: 'Venture X annual travel credit applied', date: 'Jul 6', amount: -creditApplied, credit: true, mcc: '7011', category: 'Credit', location: 'capitalonetravel.com', miles: 0, tag: { trip: tripKey, mode: 'auto' } });
  T.basePerk = { threshold: 400, desc: `Spend $400 anywhere in ${T.city} → late checkout + rooftop apéritif at ${hotel.name}` };
  hotelSearchOpen = null;
  if (hotel.collection === 'premier' && !T.vb.some((v) => v.premier)) {
    T.vb.push({ premier: true, icon: '🥂', ask: 'Have the hotel do something for our anniversary', reply: `Arranged with the property directly — champagne on arrival, a table held at their signature restaurant, and a note from the GM. ${hotel.name} knows.`, stop: { day: 0, time: '19:00', cat: 'dining', title: `${hotel.name} — anniversary surprise`, sub: 'Arranged via Velocity Black × Premier Collection' } });
  }
  armTrip(tripKey);
  console.log(`[C1Travel] booking.confirmed → trip_id:${T.id}, product:hotel, property:${hotel.name}, credit:$${creditApplied}`);
  toast('🏨', 'Booked via Capital One Travel', `${hotel.name} · ${nights} nights · ${fmt0(net)} net after $${creditApplied} credit`, 'brand');
  renderPlan();
}

function bookFlight(tripKey) {
  const T = TRIPS[tripKey], S = tripState[tripKey];
  if (S.flight && !S.flight.frozen) return;
  const f = flightFor(T);
  const travelers = 1 + T.mates.length;
  const total = f.price * travelers;
  S.flight = { ...f, total, travelers };
  S.booked += total; S.bookedCount += 1;
  addTxn({ icon: '✈️', merchant: 'Capital One Travel', desc: `${f.route} · ${travelers} traveler${travelers > 1 ? 's' : ''} · 5x miles`, date: 'Jul 6', amount: total, mcc: '3007', category: 'Airlines', location: 'capitalonetravel.com', miles: total * 5, tag: { trip: tripKey, mode: 'auto' } });
  armTrip(tripKey);
  console.log(`[C1Travel] booking.confirmed → trip_id:${T.id}, product:flight, route:${f.route}`);
  toast('✈️', 'Booked via Capital One Travel', `${f.route} confirmed · 5x miles earned`, 'brand');
  renderPlan();
}

function freezeFlight(tripKey) {
  const T = TRIPS[tripKey], S = tripState[tripKey];
  const f = flightFor(T);
  S.flight = { ...f, frozen: true, frozenPrice: f.price };
  addTxn({ icon: '🧊', merchant: 'Capital One Travel', desc: 'Price freeze fee · 6 days', date: 'Jul 6', amount: 8, mcc: '3007', category: 'Airlines', location: 'capitalonetravel.com', miles: 0, tag: { trip: tripKey, mode: 'auto' } });
  console.log(`[C1Travel] price.freeze → trip_id:${T.id}, route:${f.route}, held:$${f.price}`);
  toast('🧊', 'Price frozen', `${f.route} held at ${fmt0(f.price)} for 6 days`, 'brand');
  renderPlan();
}

function buyRec(id) {
  const T = TRIPS[viewTrip], S = tripState[viewTrip];
  const R = RECS[T.wx.kind];
  const travelers = 1 + T.mates.length;
  const r = id === 'hero' ? R.hero : R.kit[id];
  const amount = id === 'hero' ? r.price * travelers : r.price;
  S.bought.add(String(id));
  S.credits += amount * r.back / 100;
  /* Shopping hands the purchase off to the real retailer's checkout — Paze
     is what completes it there without retyping a card number. Same card,
     same 2x earn, same Shopping credits-back; Paze only changes checkout. */
  addTxn({ icon: r.icon, merchant: r.retailer, desc: `${r.name}${id === 'hero' ? ` × ${travelers}` : ''} · via Paze · ${r.back}% Shopping credits back`, date: 'Jul 7', amount, mcc: '5942', category: 'Merchandise', location: `${r.retailer.toLowerCase().replace(/\s+/g, '')}.com`, miles: amount * 2, tag: { trip: viewTrip, mode: 'shop' } });
  console.log(`[Paze] checkout.completed → merchant:${r.retailer}, amount:$${amount}, trip_id:${T.id}`);
  toast('🅿️', `Bought on ${r.retailer}`, `Paid with Paze · ${fmt(amount * r.back / 100)} Shopping credits earned`, 'brand');
  renderPlan();
}

function dropFor(stop) {
  const h = Math.abs([...stop.title].reduce((a, c) => (a * 33 + c.charCodeAt(0)) | 0, 5));
  const save = Math.max(3, Math.round(stop.price * (0.12 + (h % 9) / 100)));
  const via = ['TodayTix', 'GetYourGuide', 'Viator', 'Klook', 'Rakuten'][h % 5];
  return { save, via };
}

function applyDrop(di, si) {
  const S = tripState[viewTrip];
  const stop = TRIPS[viewTrip].days[di].stops[si];
  const d = dropFor(stop);
  stop.price -= d.save;
  stop.dropApplied = d.save;
  stop.dropVia = d.via;
  S.saved += d.save;
  console.log(`[C1Shopping] price drop applied → ${stop.title}, saved $${d.save} via ${d.via}`);
  toast('📉', 'Price drop applied', `${stop.title} — saved $${d.save} via ${d.via}`);
  renderPlan();
}

/* ── trip selection & dynamic chrome ── */
/* viewTrip (what Plan shows) and simTrip (what the simulator will ignite)
   stay in sync until a trip actually goes live — otherwise picking a trip
   in the planner silently leaves Live/Wrap pointed at whatever city the
   simulator defaulted to, which reads as "hardcoded to Paris." */
function setViewTrip(key) {
  viewTrip = key;
  hotelSearchOpen = null;
  if (!liveTrip) {
    simTrip = key;
    renderSimToggle();
    renderSimLabels();
    renderLiveHeader();
  }
  renderTripSwitch();
  renderPlan();
}
function renderTripSwitch() {
  $('trip-switch').innerHTML = Object.values(TRIPS).map((T) =>
    `<button class="trip-chip ${viewTrip === T.key ? 'on' : ''} rounded-full px-5 py-2 text-sm font-bold srf" onclick="setViewTrip('${T.key}')">${T.flag} ${esc(T.name)}</button>`
  ).join('') + `<button onclick="openNewTrip()" class="rounded-full px-4 py-2 text-sm font-bold fnt srf hover:opacity-80 transition-opacity">＋ New</button>`;
}
function renderHomeTrips() {
  $('home-trips').innerHTML = Object.values(TRIPS).map((T) =>
    `<button onclick="setViewTrip('${T.key}'); go('plan')" class="rounded-full srf text-sm font-bold px-5 py-3 hover:opacity-80 transition-opacity">${T.flag} ${esc(T.name)} <span class="fnt font-medium">· ${T.dates}</span></button>`
  ).join('');
}

/* ═══════════ AUTHORING · new trip ═══════════ */
function openNewTrip() { const m = $('modal-new'); m.classList.remove('hidden'); m.classList.add('flex'); }
function closeNewTrip() { const m = $('modal-new'); m.classList.add('hidden'); m.classList.remove('flex'); }

function createTrip() {
  const city = ($('nt-dest').value.trim() || 'Tokyo').replace(/\b\w/g, (c) => c.toUpperCase());
  const key = city.toLowerCase().replace(/[^a-z]/g, '') + '_' + Date.now().toString(36);
  const start = new Date($('nt-start').value + 'T00:00:00Z'), end = new Date($('nt-end').value + 'T00:00:00Z');
  const mate = $('nt-mate').value.trim();
  const budget = parseInt($('nt-budget').value) || 2000;
  const flag = FLAGS[city.toLowerCase()] || '🌍';
  const dates = `${dLabel(start)} – ${start.getUTCMonth() === end.getUTCMonth() ? end.getUTCDate() : dLabel(end)}`;

  const days = [];
  for (let d = new Date(start), i = 0; d <= end && i < 10; d.setUTCDate(d.getUTCDate() + 1), i++) {
    days.push({ label: `${WD[d.getUTCDay()]} · ${dLabel(d)}${i === 0 ? ' — Arrival day' : ''}`, stops: [] });
  }
  const zip = String(30000 + Math.floor(Math.random() * 60000));
  const nights = Math.max(1, Math.round((end - start) / 86400000));

  TRIPS[key] = {
    key, id: `${key.slice(0, 3)}-2026`, name: `Trip to ${city}`, flag,
    city, country: '', zip, dates, mates: mate ? [mate] : [],
    budget, nights, tower: '🌆', airports: city.slice(0, 3).toUpperCase(), welcome: `Welcome to ${city} ${flag}`,
    heroWord: city, planSub: 'A fresh line, waiting for ink. Add stops, jot notes, invite tripmates — City Key handles the city.',
    wx: { kind: WX_BY_CITY[city.toLowerCase()] || 'mild', label: WX_LABEL[WX_BY_CITY[city.toLowerCase()] || 'mild'] },
    notes: '', places: [],
    suggest: [
      { emoji: '📍', title: `${city} old town walk`, desc: 'Most-loved free route' },
      { emoji: '🍽️', title: 'Neighborhood tasting tour', desc: 'Bookable via C1 Dining' },
      { emoji: '🌅', title: 'Sunset viewpoint', desc: 'Golden hour spot' },
    ],
    tiers: [
      { id: 1, threshold: 100, emoji: '🎁', title: `${city} local favorite`, reward: 'Welcome treat on us', value: 5, code: `C1-${city.slice(0, 3).toUpperCase()}-101` },
      { id: 2, threshold: 300, emoji: '🎟️', title: `${city} top attraction`, reward: '50% off entry', value: 12, code: `C1-${city.slice(0, 3).toUpperCase()}-202` },
      { id: 3, threshold: 600, emoji: '✨', title: 'Signature experience', reward: '$25 statement credit', value: 25, code: `C1-${city.slice(0, 3).toUpperCase()}-303` },
    ],
    partners: ['🎁 LOCAL · TIER 1', '🎟️ TOP SIGHT · 5X', '🚇 TRANSIT · 2X', '✨ EXPERIENCE · $25'],
    days,
    script: {
      ign: { merchant: `Hotel ${city} Central`, logName: `Hotel ${city} Central`, amount: 120, mcc: '7011', icon: '🏨', time: '20:10 · Day 1', note: 'MCC 7011 · ignition swipe', date: dLabel(start), location: `${city} ${zip}` },
      s2:  { merchant: `Café ${city}`, label: 'Café', amount: 160, mcc: '5812', icon: '☕', time: '09:30 · Day 2', note: 'coffee & pastries', date: dLabel(start), location: `${city} ${zip}`, toast: '93% to Station 2 · only $20 to go' },
      s3:  { merchant: `Bistro ${city}`, label: 'Dinner', amount: 95, mcc: '5812', icon: '🍽️', time: '20:00 · Day 2', note: 'dinner downtown', date: dLabel(start), location: `${city} ${zip}` },
      retDate: dLabel(end),
    },
    wrapSub: `${city} · ${dates} · Bharath${mate ? ' + ' + mate : ''}`,
    settled: `Trip settled · ${dLabel(end)}`,
    vb: [
      { icon: '🍽', ask: 'The impossible table — best kitchen in town', reply: `Consider it held. The chef's counter at the hardest booking in ${city}, first night, 20:30. They know you're coming.`, stop: { day: 0, time: '20:30', cat: 'dining', title: `${city} — the impossible table`, sub: 'Secured by Velocity Black' } },
      { icon: '🗝', ask: 'Something locals think is closed', reply: `There's a room in ${city} that doesn't take bookings. It will take yours. Details the morning of — dress well.`, stop: { day: 0, time: '22:00', cat: 'entertainment', title: `${city} — after-hours access`, sub: 'Location shared day-of · Velocity Black' } },
    ],
    vbStation: { threshold: 350, title: `A night ${city} doesn't sell`, desc: 'Ask the concierge — it exists for members only.' },
  };
  tripState[key] = freshTripState();

  closeNewTrip();
  renderHomeTrips();
  setViewTrip(key); // syncs simTrip too, so the new trip is what Live/Wrap will ignite
  go('plan');
  console.log(`[VenturePlanner] trip created → trip_id: ${TRIPS[key].id}, city: ${city}`);
  toast('🗺️', `${flag} Trip to ${city} created`, 'The line is drawn — City Key stations auto-provisioned');
}

/* ═══════════ PLAN · Wanderlog-style workspace ═══════════ */
function renderPlan() {
  const T = TRIPS[viewTrip], S = tripState[viewTrip];
  $('plan-kicker').textContent = `${T.dates}${T.mates.length ? ' · with ' + T.mates.join(' & ') : ' · solo — for now'}`;
  $('plan-title').innerHTML = `${esc(T.heroWord)}, <em>drawn.</em>`;
  $('plan-sub').textContent = T.planSub;
  $('rail-dest').textContent = `${T.city} ${T.flag}`;
  $('rail-booked').textContent = `${fmt0(S.booked)} · ${S.bookedCount} stop${S.bookedCount === 1 ? '' : 's'}`;
  $('rail-mates').innerHTML = ['B', ...T.mates.map((m) => m[0].toUpperCase())].map((i, idx) =>
    `<span class="h-6 w-6 rounded-full text-[10px] font-bold flex items-center justify-center text-white ${idx === 0 ? 'bg-c1navy' : 'bg-c1blue'}">${i}</span>`).join('') +
    `<button onclick="$('rail-mate-form').classList.toggle('hidden')" class="h-6 w-6 rounded-full srf2 text-xs font-bold fnt hover:opacity-70">+</button>`;
  renderLedger();

  const led = ledgerFor(viewTrip);
  const committed = led.total;
  const pct = Math.min(100, Math.round((committed / T.budget) * 100));

  $('plan-body').innerHTML = `
    <!-- ░░ CAPITAL ONE TRAVEL · flights & hotels ░░ -->
    ${renderGettingThere(T, S)}

    <!-- ░░ EXPLORE ░░ -->
    <p class="microlabel acc mb-3">Explore · curated for ${esc(T.city)}</p>
    <div class="grid sm:grid-cols-3 gap-3">
      ${T.suggest.map((s, i) => `
        <div class="srf rounded-2xl p-4 flex items-start gap-3">
          <span class="text-2xl">${s.emoji}</span>
          <div class="flex-1 min-w-0">
            <p class="font-bold text-sm leading-tight">${esc(s.title)}</p>
            <p class="text-[11px] mut mt-0.5">${esc(s.desc)}</p>
          </div>
          <button onclick="addSuggestion(${i})" class="rounded-full srf2 text-xs font-bold px-3 py-1.5 hover:opacity-70 shrink-0">＋</button>
        </div>`).join('')}
    </div>

    <!-- ░░ CAPITAL ONE SHOPPING · trip intelligence ░░ -->
    ${renderShopping(T, S)}

    <!-- ░░ NOTES + PLACES ░░ -->
    <div class="grid lg:grid-cols-2 gap-4 mt-8">
      <div class="srf rounded-2xl p-5">
        <p class="microlabel acc mb-3">📝 Notes</p>
        <textarea onchange="TRIPS['${viewTrip}'].notes=this.value" rows="4"
          class="field" style="resize:vertical; font-size:13px; line-height:1.6;"
          placeholder="Reservations, métro tips, door codes…">${esc(T.notes)}</textarea>
      </div>
      <div class="srf rounded-2xl p-5">
        <p class="microlabel acc mb-3">📍 Places to visit</p>
        <div class="space-y-1.5 mb-3">
          ${T.places.length ? T.places.map((p, i) => `
            <div class="flex items-center gap-2 rounded-xl srf2 px-3.5 py-2">
              <span class="text-sm font-bold flex-1">${esc(p)}</span>
              <button onclick="placeToDay(${i})" class="text-[10px] font-bold acc hover:opacity-70 uppercase tracking-wider">→ Day 1</button>
              <button onclick="removePlace(${i})" class="text-xs fnt hover:opacity-70">✕</button>
            </div>`).join('') : '<p class="text-xs fnt">Nothing saved yet — add ideas below or from Explore.</p>'}
        </div>
        <div class="flex gap-2">
          <input id="place-input" class="field" style="padding:8px 14px; font-size:13px;" placeholder="Add a place…" onkeydown="if(event.key==='Enter')addPlace()" />
          <button onclick="addPlace()" class="rounded-full bg-c1blue text-white text-xs font-bold px-4 hover:bg-[#026597]">Add</button>
        </div>
      </div>
    </div>

    <!-- ░░ ITINERARY ░░ -->
    <p class="microlabel acc mt-10 mb-4">🧭 Itinerary</p>
    ${T.days.map((day, di) => `
      <p class="microlabel acc mb-4 ml-16 ${di > 0 ? 'mt-2' : ''}">${esc(day.label)}</p>
      ${day.stops.map((stop, si) => renderStop(T, S, day, stop, di, si)).join('')}
      ${openStopForm === viewTrip + '|' + di ? renderStopForm(di) : `
      <div class="relative pl-16 pb-8 ${di === T.days.length - 1 ? '' : 'plan-track'} ml-8">
        <button onclick="openStopForm='${viewTrip}|${di}'; renderPlan()"
          class="rounded-full srf text-sm font-bold px-5 py-2.5 fnt hover:opacity-75 transition-opacity">＋ Add a stop</button>
      </div>`}
    `).join('')}
    <button onclick="addDay()" class="ml-24 rounded-full srf text-sm font-bold px-5 py-2.5 fnt hover:opacity-75 transition-opacity">＋ Add a day</button>

    <!-- ░░ PRICE WATCH · guards the plan's tickets ░░ -->
    ${renderPriceWatch(T, S)}

    <!-- ░░ BUDGET ░░ -->
    <p class="microlabel acc mt-10 mb-3">💰 Budget</p>
    <div class="srf rounded-2xl p-5 max-w-2xl">
      <div class="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p class="text-3xl font-bold" style="font-variant-numeric:tabular-nums;">${fmt0(committed)} <span class="text-base mut font-medium">of ${fmt0(T.budget)}</span></p>
          <p class="text-[11px] mut font-semibold mt-1">${fmt0(S.booked)} booked via C1 Travel · ${fmt0(led.total)} tagged on the card · ${fmt0(Math.max(0, T.budget - committed))} left${S.saved ? ` · <b style="color:#5c8f1d;">🛍 Shopping saved ${fmt0(S.saved)}</b>` : ''}</p>
        </div>
        <p class="text-2xl font-display font-light acc">${pct}%</p>
      </div>
      <div class="mt-3 h-2 rounded-full srf2 overflow-hidden">
        <div class="h-full rounded-full" style="width:${pct}%; background: linear-gradient(90deg, var(--accent), #9fd356); transition: width 1s cubic-bezier(.22,1,.36,1);"></div>
      </div>
    </div>`;
}

function renderStop(T, S, day, stop, di, si) {
  const n = T.days.slice(0, di).reduce((a, d) => a + d.stops.length, 0) + si + 1;
  const tierOpen = stop.tier && S.spend >= T.tiers[stop.tier - 1].threshold;
  const booked = stop.status === 'booked' || stop.status === 'bookedNow';

  /* ✦ stops secured by Velocity Black get the luxe treatment */
  if (stop.status === 'velocity') {
    return `
    <div class="relative pl-16 pb-8 plan-track ml-8 stop-card">
      <span class="absolute -left-[13px] top-1 h-6 w-6 rounded-full flex items-center justify-center text-[11px] font-bold ring-4"
        style="--tw-ring-color: var(--bg); background:#0b0a0f; color:#d4af37; border:1px solid rgba(212,175,55,.6);">${n}</span>
      <div class="rounded-2xl p-5 max-w-2xl relative" style="background: linear-gradient(150deg,#0d0c12,#120e08); border:1px solid rgba(212,175,55,.45);">
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div class="min-w-0">
            <p class="text-[10px] font-bold vb-gold" style="letter-spacing:.35em;">✦ ${esc(stop.time)} · VELOCITY BLACK</p>
            <p class="text-xl font-bold mt-2" style="color:#f0e6cd; font-family:'Fraunces',Georgia,serif;">${esc(stop.title)}</p>
            ${stop.sub ? `<p class="text-sm mt-1" style="color: rgba(239,230,212,.6);">${esc(stop.sub)}</p>` : ''}
            <p class="text-[11px] mt-2.5" style="color: rgba(212,175,55,.75);">Concierge holds every detail — nothing to print, no one to call.</p>
          </div>
          <span class="text-[10px] font-bold uppercase tracking-widest rounded-full px-3 py-1.5"
            style="background: rgba(212,175,55,.15); color:#d4af37; border:1px solid rgba(212,175,55,.4);">Secured ✦</span>
        </div>
      </div>
    </div>`;
  }

  const ticketBtn = `<button onclick="showTicket('${viewTrip}',${di},${si})"
    class="rounded-full text-xs font-bold px-4 py-2 hover:brightness-110 active:scale-95 transition text-white flex items-center gap-1.5"
    style="background:#10131c;">▦ View ticket · QR</button>`;
  let statusHtml = '', bodyHtml = '';
  if (booked) {
    statusHtml = `<span class="text-[10px] font-bold uppercase tracking-widest rounded-full px-3 py-1.5" style="background: rgba(159,211,86,.14); color:#5c8f1d;">Booked ✓</span>`;
    bodyHtml = `<div class="mt-4 flex flex-wrap items-center gap-3">
      ${stop.status === 'bookedNow'
        ? `<p class="text-sm font-bold" style="color:#79a83e;">${stop.paidWithPaze ? `Paid with Paze ✓ · via ${esc(stop.dropVia)}` : 'Booked via Capital One Travel ✓ · 5x miles earned'}</p>`
        : ''}
      ${ticketBtn}
    </div>`;
  } else {
    statusHtml = stop.status === 'book'
      ? `<span class="text-[10px] font-bold uppercase tracking-widest text-amber-600 rounded-full px-3 py-1.5" style="background: rgba(245,158,11,.13);">Pending</span>`
      : `<span class="text-[10px] font-bold uppercase tracking-widest fnt rounded-full px-3 py-1.5 srf2">Idea</span>`;
    const actions = [];
    if (stop.status === 'book') {
      actions.push(`<button onclick="bookItem('${viewTrip}',${di},${si})"
        class="rounded-full bg-c1blue hover:bg-[#026597] active:bg-[#014e74] text-white text-sm font-bold px-5 py-2.5 transition-colors">
        Book via Capital One Travel</button>`);
    }
    /* a price drop was found on an external site — Paze completes that
       checkout directly, at the normal earn rate for the category, not the
       Capital One Travel bonus (this isn't a Capital One Travel booking) */
    if (stop.dropApplied) {
      actions.push(`<button onclick="payWithPaze('${viewTrip}',${di},${si})"
        class="rounded-full text-white text-sm font-bold px-5 py-2.5 hover:brightness-110 active:scale-95 transition" style="background:#0a5c53;">
        Pay with Paze · via ${esc(stop.dropVia)}</button>`);
    }
    if (actions.length) bodyHtml = `<div class="mt-4 flex flex-wrap items-center gap-3">${actions.join('')}</div>`;
  }
  const hint = stop.tier
    ? (tierOpen ? `<p class="mut text-sm mt-0.5"><b class="text-keyg">${stop.openHint}</b></p>`
                : `<p class="mut text-sm mt-0.5">${stop.lockedHint}</p>`)
    : (stop.sub ? `<p class="mut text-sm mt-0.5">${esc(stop.sub)}</p>` : '');

  return `
  <div class="relative pl-16 pb-8 plan-track ml-8 stop-card">
    <span class="absolute -left-[13px] top-1 h-6 w-6 rounded-full flex items-center justify-center text-[11px] font-bold text-white bg-c1blue ring-4" style="--tw-ring-color: var(--bg);">${n}</span>
    <div class="srf rounded-2xl p-5 max-w-2xl relative">
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div class="min-w-0">
          ${metaChips(stop)}
          <p class="text-xl font-bold mt-2">${esc(stop.title)}</p>
          ${hint}
          ${stop.perk ? `<p class="mut text-sm mt-0.5"><span class="acc font-bold">${stop.perk}</span></p>` : ''}
          ${stop.note ? `<p class="text-xs fnt mt-1.5">📝 ${esc(stop.note)}</p>` : ''}
        </div>
        <div class="flex items-center gap-1.5 shrink-0">
          <span class="stop-tools flex items-center gap-1.5">
            ${si > 0 ? `<button onclick="moveStop(${di},${si},-1)" title="Move up" class="h-6 w-6 rounded-full srf2 text-[11px] fnt hover:opacity-70">↑</button>` : ''}
            ${si < day.stops.length - 1 ? `<button onclick="moveStop(${di},${si},1)" title="Move down" class="h-6 w-6 rounded-full srf2 text-[11px] fnt hover:opacity-70">↓</button>` : ''}
            <button onclick="delStop(${di},${si})" title="Remove" class="h-6 w-6 rounded-full srf2 text-[11px] fnt hover:opacity-70">✕</button>
          </span>
          ${statusHtml}
        </div>
      </div>
      ${bodyHtml}
    </div>
  </div>`;
}

function renderStopForm(di) {
  return `
  <div class="relative pl-16 pb-8 plan-track ml-8">
    <span class="absolute -left-[13px] top-1 h-6 w-6 rounded-full flex items-center justify-center text-[11px] font-bold text-white bg-c1blue ring-4" style="--tw-ring-color: var(--bg);">＋</span>
    <div class="srf rounded-2xl p-5 max-w-2xl anim-rise">
      <p class="microlabel fnt mb-3">New stop</p>
      <div class="grid sm:grid-cols-[90px_1fr] gap-2.5">
        <input id="ns-time" class="field" placeholder="12:00" value="12:00" />
        <input id="ns-title" class="field" placeholder="What's the plan? e.g. Tsukiji fish market" />
      </div>
      <div class="grid sm:grid-cols-3 gap-2.5 mt-2.5">
        <select id="ns-cat" class="field">
          <option value="dining">🍽 Dining</option><option value="attractions">🎟 Attraction</option>
          <option value="entertainment">🎭 Entertainment</option><option value="transit">🚇 Transit</option>
          <option value="shopping">🛍 Shopping</option><option value="walk">🚶 Walk / free</option>
        </select>
        <input id="ns-price" type="number" class="field" placeholder="Price $ (optional)" />
        <label class="field flex items-center gap-2 cursor-pointer" style="font-size:12px;">
          <input type="checkbox" id="ns-book" checked class="accent-[#0276b1]" /> Bookable via C1 Travel
        </label>
      </div>
      <input id="ns-note" class="field mt-2.5" placeholder="Note (optional)" />
      <div class="mt-3.5 flex gap-2">
        <button onclick="addStop(${di})" class="rounded-full bg-c1blue hover:bg-[#026597] text-white text-sm font-bold px-6 py-2.5 transition-colors">Add stop</button>
        <button onclick="openStopForm=null; renderPlan()" class="rounded-full srf text-sm font-bold px-5 py-2.5 fnt hover:opacity-70">Cancel</button>
      </div>
    </div>
  </div>`;
}

/* ── authoring actions ── */
function addStop(di) {
  const T = TRIPS[viewTrip];
  const title = $('ns-title').value.trim();
  if (!title) { toast('✏️', 'Give the stop a name', 'What are you planning?'); return; }
  const price = parseFloat($('ns-price').value) || 0;
  const bookable = $('ns-book').checked && price > 0;
  T.days[di].stops.push({
    time: $('ns-time').value.trim() || '12:00', cat: $('ns-cat').value, title,
    sub: '', note: $('ns-note').value.trim(), price: price || undefined,
    perk: bookable ? '5x miles via C1 Entertainment' : undefined,
    status: bookable ? 'book' : 'idea',
  });
  openStopForm = null;
  renderPlan();
  console.log(`[VenturePlanner] stop added → "${title}" (${TRIPS[viewTrip].id}, day ${di + 1})`);
  toast('🧭', 'Stop added to the line', `${title} · Day ${di + 1}`);
}
function delStop(di, si) {
  const [gone] = TRIPS[viewTrip].days[di].stops.splice(si, 1);
  renderPlan();
  toast('🗑️', 'Stop removed', gone.title);
}
function moveStop(di, si, dir) {
  const stops = TRIPS[viewTrip].days[di].stops;
  [stops[si], stops[si + dir]] = [stops[si + dir], stops[si]];
  renderPlan();
}
function addDay() {
  const T = TRIPS[viewTrip];
  T.days.push({ label: `Day ${T.days.length + 1} — untitled`, stops: [] });
  renderPlan();
}
function addPlace() {
  const v = $('place-input').value.trim();
  if (!v) return;
  TRIPS[viewTrip].places.push(v);
  renderPlan();
}
function removePlace(i) { TRIPS[viewTrip].places.splice(i, 1); renderPlan(); }
function placeToDay(i) {
  const T = TRIPS[viewTrip];
  const [p] = T.places.splice(i, 1);
  T.days[0].stops.push({ time: 'anytime', cat: 'walk', title: p, sub: '', status: 'idea' });
  renderPlan();
  toast('🧭', 'Moved to Day 1', p);
}
function addSuggestion(i) {
  const T = TRIPS[viewTrip], s = T.suggest[i];
  T.places.push(s.title);
  renderPlan();
  toast(s.emoji, 'Saved to Places to visit', s.title);
}
function addMate() {
  const v = $('rail-mate-name').value.trim();
  if (!v) return;
  TRIPS[viewTrip].mates.push(v);
  $('rail-mate-form').classList.add('hidden');
  renderPlan();
  toast('🤝', `${v} invited`, `They can now co-author ${TRIPS[viewTrip].name}`);
}

function bookItem(tripKey, di, si) {
  const T = TRIPS[tripKey], S = tripState[tripKey];
  const stop = T.days[di].stops[si];
  stop.status = 'bookedNow';
  S.booked += stop.price; S.bookedCount += 1;
  addTxn({ icon: '🎟️', merchant: 'Capital One Travel', desc: `${stop.title} · 5x miles`, date: 'Jul 6', amount: stop.price, mcc: '4722', category: 'Travel', location: 'capitalonetravel.com', miles: stop.price * 5, tag: { trip: tripKey, mode: 'auto' } });
  console.log(`[VenturePlanner] booking_status: PENDING_PARTNER_CONVERSION → BOOKED_VIA_PARTNER (${stop.title}) trip_id: ${T.id}`);
  toast('🎟️', 'Booked via Capital One Travel', `${stop.title} confirmed · 5x miles earned`);
  renderPlan();
}
