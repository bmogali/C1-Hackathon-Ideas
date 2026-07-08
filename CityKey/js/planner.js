/* ═══ VENTURE KEY · Venture Planner — authoring, booking, Shopping, Price Watch, tickets ═══ */

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
            <p class="text-xl font-bold">${R.hero.name} <span class="mut text-sm font-medium">× ${travelers} traveler${travelers > 1 ? 's' : ''}</span></p>
            <ul class="mt-2 space-y-1.5">
              ${why.map((w) => `<li class="text-[13px] mut leading-snug flex gap-2"><span class="acc font-bold shrink-0">·</span>${esc(w)}</li>`).join('')}
            </ul>
          </div>
          <div class="text-right shrink-0">
            <p class="text-2xl font-bold" style="font-variant-numeric:tabular-nums;">$${R.hero.price * travelers}</p>
            <p class="text-[11px] font-bold" style="color:#5c8f1d;">${R.hero.back}% back in credits</p>
            ${S.bought.has('hero')
              ? '<p class="mt-2.5 text-sm font-bold" style="color:#79a83e;">In your trip kit ✓</p>'
              : `<button onclick="buyRec('hero')" class="mt-2.5 rounded-full bg-c1blue hover:bg-[#026597] text-white text-sm font-bold px-5 py-2.5 transition-colors">Add to trip kit</button>`}
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
                  : `<button onclick="buyRec(${i})" class="rounded-full bg-c1blue text-white text-[11px] font-bold px-3 py-1 hover:bg-[#026597]">Add · $${r.price}</button>`}
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
  return `
    <p class="microlabel acc mt-10 mb-3">📉 Price Watch · Capital One Shopping</p>
    <div class="srf rounded-2xl p-5 max-w-2xl">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p class="font-bold">${drops.length ? `Watching ${drops.length} ticket${drops.length > 1 ? 's' : ''} on this plan` : 'Every ticket on this plan is at its best price'}</p>
          <p class="text-[11px] mut mt-0.5">Re-checked every 6 hours across 30,000+ sellers${drops.length ? ` — apply a drop and your plan updates instantly` : ` — we'll keep watching`}.</p>
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

function buyRec(id) {
  const T = TRIPS[viewTrip], S = tripState[viewTrip];
  const R = RECS[T.wx.kind];
  const travelers = 1 + T.mates.length;
  const r = id === 'hero' ? R.hero : R.kit[id];
  const amount = id === 'hero' ? r.price * travelers : r.price;
  S.bought.add(String(id));
  S.credits += amount * r.back / 100;
  addTxn({ icon: r.icon, merchant: 'Capital One Shopping', desc: `${r.name}${id === 'hero' ? ` × ${travelers}` : ''} · ${r.back}% credits back`, date: 'Jul 7', amount, mcc: '5942', category: 'Merchandise', location: 'capitaloneshopping.com', miles: amount * 2, tag: { trip: viewTrip, mode: 'shop' } });
  console.log(`[C1Shopping] rec purchased → ${r.name} $${amount}, tagged trip_id: ${T.id}`);
  toast('🛍️', 'Added to your trip kit', `${r.name} · ${fmt(amount * r.back / 100)} credits earned · tagged to ${T.name}`);
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
  S.saved += d.save;
  console.log(`[C1Shopping] price drop applied → ${stop.title}, saved $${d.save} via ${d.via}`);
  toast('📉', 'Price drop applied', `${stop.title} — saved $${d.save} via ${d.via}`);
  renderPlan();
}

/* ── trip selection & dynamic chrome ── */
function setViewTrip(key) { viewTrip = key; renderTripSwitch(); renderPlan(); }
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

  TRIPS[key] = {
    key, id: `${key.slice(0, 3)}-2026`, name: `Trip to ${city}`, flag,
    city, country: '', zip, dates, mates: mate ? [mate] : [],
    budget, tower: '🌆', airports: city.slice(0, 3).toUpperCase(), welcome: `Welcome to ${city} ${flag}`,
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
  renderHomeTrips(); renderTripSwitch(); renderSimToggle();
  if (!liveTrip) { simTrip = key; renderSimToggle(); renderSimLabels(); }
  setViewTrip(key);
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
  const committed = S.booked + led.total;
  const pct = Math.min(100, Math.round((committed / T.budget) * 100));

  $('plan-body').innerHTML = `
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
      ${stop.status === 'bookedNow' ? `<p class="text-sm font-bold" style="color:#79a83e;">Booked via Capital One Travel ✓ · 5x miles earned</p>` : ''}
      ${ticketBtn}
    </div>`;
  } else if (stop.status === 'book') {
    statusHtml = `<span class="text-[10px] font-bold uppercase tracking-widest text-amber-600 rounded-full px-3 py-1.5" style="background: rgba(245,158,11,.13);">Pending</span>`;
    bodyHtml = `<button onclick="bookItem('${viewTrip}',${di},${si})"
      class="mt-4 rounded-full bg-c1blue hover:bg-[#026597] active:bg-[#014e74] text-white text-sm font-bold px-5 py-2.5 transition-colors">
      Book via Capital One Travel</button>`;
  } else {
    statusHtml = `<span class="text-[10px] font-bold uppercase tracking-widest fnt rounded-full px-3 py-1.5 srf2">Idea</span>`;
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
