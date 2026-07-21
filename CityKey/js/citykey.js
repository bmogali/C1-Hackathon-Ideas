/* ═══ VENTURE KEY · City Key engine — the Line, simulator triggers, Wrapped ═══ */

function setSimTrip(key) {
  if (liveTrip) return;
  simTrip = key;
  renderSimToggle(); renderSimLabels(); renderLiveHeader();
  if (key !== 'standalone') {
    viewTrip = key;
    renderTripSwitch();
    if (curScreen === 'plan') renderPlan();
  }
}
function renderSimToggle() {
  $('sim-city-toggle').innerHTML = Object.values(TRIPS).map((T) =>
    `<button onclick="setSimTrip('${T.key}')" ${liveTrip ? 'disabled' : ''}
      class="px-2.5 py-1.5 text-[11px] font-bold ${simTrip === T.key ? 'bg-white/20' : 'hover:bg-white/10'}" title="${esc(T.city)} · planned trip">${T.flag}</button>`
  ).join('') + `<button onclick="setSimTrip('standalone')" ${liveTrip ? 'disabled' : ''}
      class="px-2.5 py-1.5 text-[11px] font-bold ${simTrip === 'standalone' ? 'bg-white/20' : 'hover:bg-white/10'}"
      title="Standalone · no plan on file — City Key self-provisions">🎲</button>`;
}

/* standalone: clone the template into a live trip at ignition time */
function provisionStandalone() {
  const key = 'chicago_' + Date.now().toString(36);
  TRIPS[key] = { ...JSON.parse(JSON.stringify(STANDALONE)), key };
  tripState[key] = freshTripState();
  console.log(`[CityKey] no itinerary on file → auto-provisioned trip_id: ${STANDALONE.id} from MSA 60611 + MCC 7011`);
  return key;
}
function renderSimLabels() {
  const T = simTrip === 'standalone' ? STANDALONE : TRIPS[simTrip], s = T.script;
  $('lbl-ignite').textContent = simTrip === 'standalone' ? `$${s.ign.amount} · no plan on file` : `$${s.ign.amount} · ${T.city}`;
  $('lbl-swipe2').textContent = `${s.s2.icon} ${s.s2.label}`;
  $('lbl-swipe2b').textContent = `$${s.s2.amount}`;
  $('lbl-swipe3').textContent = `${s.s3.icon} ${s.s3.label}`;
  $('lbl-swipe3b').textContent = `$${s.s3.amount}`;
}

/* ═══════════ CAPITAL ONE TRAVEL × CITY KEY · ARMED state ═══════════
   A portal hotel/flight booking is first-party Capital One data — it tells
   us destination MSA + arrival window before a single card swipe happens.
   That lets City Key pre-arm instead of waiting cold for ignition. */
function armTrip(tripKey) {
  const T = TRIPS[tripKey], S = tripState[tripKey];
  if (S.active) {
    if (!S.hotelAnnounced) {
      S.hotelAnnounced = true;
      toast('🏨', 'Base Camp added', `${T.city} now has a hotel on the line`, 'brand');
    }
    if (liveTrip === tripKey) renderLine();
    return;
  }
  if (S.armed) return;
  S.armed = true;
  console.log(`[CityKey] booking.confirmed → trip_id:${T.id} ARMED (MSA ${T.zip}, arrival ${T.dates})`);
  toast('🗝️', 'City Key armed', `Armed for ${T.city} — ignites at check-in or your first swipe`, 'brand');
}

/* ═══════════ THE LINE ═══════════ */
function renderDormantCard() {
  const box = $('live-dormant');
  const key = liveTrip || simTrip;
  if (key === 'standalone') {
    box.innerHTML = `
      <p class="text-5xl grayscale opacity-50">🎲</p>
      <p class="text-xl font-bold mt-5">The line is dark. No plan exists.</p>
      <p class="mut text-sm mt-2 max-w-sm mx-auto leading-relaxed">
        City Key ignites on your <b class="txt">first out-of-market card swipe</b> — no itinerary, no GPS, no hotel booking required.
        Fire “✈️ First Out-of-Town Swipe” and watch it provision itself from MSA + MCC alone.
      </p>`;
    return;
  }
  const T = TRIPS[key], S = tripState[key];
  if (S.armed && S.hotel) {
    box.innerHTML = `
      <p class="text-5xl">🏨</p>
      <p class="text-xl font-bold mt-5">Base Camp is set.</p>
      <p class="mut text-sm mt-2 max-w-md mx-auto leading-relaxed">
        <b class="txt">${esc(S.hotel.name)}</b> · ${S.hotel.nights} nights, booked via Capital One Travel.
        City Key is <b class="acc">armed</b> for ${esc(T.city)} — it ignites automatically at check-in, or on your first swipe, whichever comes first.
      </p>
      <div class="mt-4 inline-block rounded-xl srf2 px-4 py-3 text-left">
        <p class="text-[10px] font-bold uppercase tracking-widest fnt">Base Camp perk</p>
        <p class="text-sm font-bold mt-1 max-w-xs">${esc(T.basePerk.desc)}</p>
      </div>`;
    return;
  }
  box.innerHTML = `
    <p class="text-5xl grayscale opacity-50">🗝️</p>
    <p class="text-xl font-bold mt-5">The line is dark.</p>
    <p class="mut text-sm mt-2 max-w-sm mx-auto leading-relaxed">
      City Key ignites on your <b class="txt">first out-of-market card swipe</b>. No itinerary needed. No GPS.
      Book a hotel in the planner to arm it early, or pick a city in the simulator and fire “✈️ First Out-of-Town Swipe”.
    </p>`;
}

function renderLiveHeader() {
  const key = liveTrip || simTrip;
  if (key === 'standalone') {
    $('live-kicker').textContent = 'Standalone mode · no plan required';
    $('live-hero').innerHTML = 'Anywhere, <em>asleep.</em>';
    $('live-sub').textContent = "City Key doesn't need the planner. The first out-of-market swipe — any city, any merchant — provisions the whole game from the auth stream alone.";
    renderDormantCard();
    return;
  }
  const T = TRIPS[key], S = tripState[key];
  if (!liveTrip || !S.active) {
    if (S.armed && S.hotel) {
      $('live-kicker').textContent = `Armed for ${T.city}`;
      $('live-hero').innerHTML = `${esc(T.heroWord)}, <em>armed.</em>`;
      $('live-sub').textContent = `Base Camp is set at ${S.hotel.name}. City Key ignites automatically at check-in — or on your first swipe, whichever comes first.`;
    } else {
      $('live-kicker').textContent = 'Awaiting ignition';
      $('live-hero').innerHTML = `${esc(T.heroWord)}, <em>asleep.</em>`;
      $('live-sub').textContent = 'The line is dark. Your first out-of-market swipe lights it — straight off the card auth stream.';
    }
    renderDormantCard();
  } else {
    $('live-kicker').textContent = `City Key · live in ${T.city}`;
    $('live-hero').innerHTML = `${esc(T.heroWord)}, <em>alive.</em>`;
    $('live-sub').textContent = 'The line is lit. Every swipe moves you toward the next station — rewards funded by the city itself.';
    $('rail-live-city').textContent = `City Key · Live · ${T.city}`;
    $('rail-partners').innerHTML = T.partners.map((p) => `<span class="text-[10px] font-bold rounded-full px-2.5 py-1 srf2">${p}</span>`).join('');
    const alone = $('rail-alone');
    if (T.standalone) {
      alone.classList.remove('hidden');
      alone.innerHTML = `
        <div class="rounded-xl srf2 px-3.5 py-3">
          <p class="text-[11px] mut leading-snug"><b class="txt">Standalone session.</b> No itinerary existed — City Key provisioned everything from MSA ${T.zip} + MCC. The planner is optional.</p>
          <button onclick="setViewTrip('${T.key}'); go('plan')" class="mt-2.5 rounded-full bg-c1blue hover:bg-[#026597] text-white text-xs font-bold px-4 py-2 transition-colors">📝 Draw a plan or book a hotel →</button>
        </div>`;
    } else alone.classList.add('hidden');
  }
  renderOffersRail();
}

function renderLine(newTierIds = []) {
  const T = TRIPS[liveTrip], S = tripState[liveTrip];
  const rows = [];
  if (S.hotel) {
    rows.push(`
      <div class="relative grid grid-cols-[64px_1fr] pb-7">
        <div class="flex justify-center pt-1"><span class="lnode h-8 w-8 rounded-full flex items-center justify-center text-sm" data-pos="0"
          style="background: var(--accent); color:#fff;">🏨</span></div>
        <div class="pt-1"><p class="microlabel acc">Base Camp · ${esc(S.hotel.name)}</p>
        <p class="text-sm font-bold mut mt-0.5">${S.hotel.nights} nights via Capital One Travel · 10x miles${T.standalone ? ' · booked mid-trip' : ''}</p></div>
      </div>`);
  } else {
    rows.push(`
      <div class="relative grid grid-cols-[64px_1fr] pb-7">
        <div class="flex justify-center pt-1"><span class="lnode h-4 w-4 rounded-full border-[3px]" data-pos="0"
          style="border-color: var(--accent); background: var(--bg);"></span></div>
        <div class="pt-0.5"><p class="microlabel fnt">Origin · ${T.standalone ? 'no itinerary on file' : 'Home base VA'}</p>
        <p class="text-sm font-bold mut mt-0.5">${T.standalone ? `Auto-provisioned from MSA ${T.zip} + MCC — nothing was planned` : `Ignition — first swipe in market ${T.zip}`}</p></div>
      </div>`);
  }

  const events = [
    ...T.tiers.map((t) => ({ kind: 'station', pos: t.threshold, t })),
    ...(T.vbStation ? [{ kind: 'black', pos: T.vbStation.threshold }] : []),
    ...(T.basePerk ? [{ kind: 'basecamp', pos: T.basePerk.threshold }] : []),
    ...S.swipes.map((s) => ({ kind: 'swipe', pos: s.cum, s })),
  ].sort((a, b) => a.pos - b.pos || (a.kind === 'swipe' ? 1 : -1));

  for (const ev of events) {
    if (ev.kind === 'basecamp') {
      const unlocked = S.spend >= T.basePerk.threshold;
      rows.push(`
        <div class="relative grid grid-cols-[64px_1fr] pb-7">
          <div class="flex justify-center"><span class="lnode station ${unlocked ? 'unlocked anim-ping' : ''}" data-pos="${T.basePerk.threshold}">🏨</span></div>
          <div class="pt-1 max-w-xl">
            <p class="microlabel ${unlocked ? 'text-keyg' : 'fnt'}">Base Camp perk · ${fmt0(T.basePerk.threshold)} ${unlocked ? '· unlocked' : '· locked'}</p>
            <p class="text-lg font-bold mt-0.5 ${unlocked ? '' : 'mut'}">${esc(T.basePerk.desc)}</p>
            <p class="text-xs fnt mt-1.5">${unlocked ? 'hotel-funded · show your room key at check-in' : `funded by ${esc(S.hotel.name)} · unlocks automatically`}</p>
          </div>
        </div>`);
      continue;
    }
    if (ev.kind === 'black') {
      const bs = T.vbStation;
      const unlocked = S.spend >= bs.threshold;
      rows.push(`
        <div class="relative grid grid-cols-[64px_1fr] pb-7">
          <div class="flex justify-center"><span class="lnode station-black ${unlocked ? 'unlocked anim-ping' : ''}" data-pos="${bs.threshold}">✦</span></div>
          <div class="pt-1 max-w-xl">
            ${unlocked ? `
              <p class="text-[10px] font-bold vb-gold" style="letter-spacing:.35em;">✦ VELOCITY BLACK · EXPRESS UNLOCKED</p>
              <p class="text-lg font-bold mt-1" style="font-family:'Fraunces',Georgia,serif;">${esc(bs.title)}</p>
              <p class="text-sm mut mt-0.5">${esc(bs.desc)}</p>
              <div class="mt-2.5 flex flex-wrap gap-2">
                ${S.vbExpress
                  ? `<p class="text-xs font-bold vb-gold">On your plan ✦ — concierge will confirm timing</p>`
                  : `<button onclick="vbAccept()" class="rounded-full text-xs font-bold px-4 py-2 hover:brightness-125 active:scale-95 transition"
                      style="background:#0b0a0f; color:#d4af37; border:1px solid rgba(212,175,55,.55);">✦ Accept — add to plan</button>
                     <button onclick="openVB()" class="rounded-full text-xs font-bold px-4 py-2 srf2 mut hover:opacity-75">Ask the concierge</button>`}
              </div>`
            : `
              <p class="microlabel fnt" style="letter-spacing:.35em;">✦ ??? · express station</p>
              <p class="text-lg font-bold mt-0.5 mut" style="font-family:'Fraunces',Georgia,serif;">Something the city doesn't sell</p>
              <p class="text-xs fnt mt-1.5">Keep moving down the line — reserved for Venture X · Velocity Black</p>`}
          </div>
        </div>`);
      continue;
    }
    if (ev.kind === 'swipe') {
      const s = ev.s;
      rows.push(`
        <div class="relative grid grid-cols-[64px_1fr] pb-7 anim-rise">
          <div class="flex justify-center pt-3"><span class="lnode stop-dot" data-pos="${s.cum}"></span></div>
          <div class="srf rounded-2xl px-5 py-4 max-w-xl">
            <div class="flex items-center justify-between gap-3">
              <div class="flex items-center gap-3 min-w-0">
                <span class="text-xl">${s.icon}</span>
                <div class="min-w-0">
                  <p class="font-bold truncate">${esc(s.merchant)}</p>
                  <p class="text-[11px] mut truncate">${s.time} · ${esc(s.note)}</p>
                </div>
              </div>
              <div class="text-right shrink-0">
                <p class="font-bold" style="font-variant-numeric:tabular-nums;">${fmt(s.amount)}</p>
                <p class="text-[10px] fnt font-bold" style="font-variant-numeric:tabular-nums;">Σ ${fmt0(s.cum)}</p>
              </div>
            </div>
          </div>
        </div>`);
    } else {
      const t = ev.t;
      const unlocked = S.spend >= t.threshold;
      const isNew = newTierIds.includes(t.id);
      const claimed = S.claimed.has(t.id);
      rows.push(`
        <div class="relative grid grid-cols-[64px_1fr] pb-7">
          <div class="flex justify-center"><span class="lnode station ${unlocked ? 'unlocked' : ''} ${isNew ? 'anim-ping' : ''}" data-pos="${t.threshold}">${t.emoji}</span></div>
          <div class="pt-1 max-w-xl">
            <div class="flex flex-wrap items-center gap-x-3 gap-y-1">
              <p class="microlabel ${unlocked ? 'text-keyg' : 'fnt'}">Station ${t.id} · ${fmt0(t.threshold)} ${unlocked ? '· unlocked' : '· locked'}</p>
              ${!unlocked ? `<p class="microlabel fnt" style="letter-spacing:.1em;">${fmt0(t.threshold - S.spend)} away</p>` : ''}
            </div>
            <p class="text-lg font-bold mt-0.5 ${unlocked ? '' : 'mut'}">${esc(t.title)} — <span class="${unlocked ? 'acc' : ''}">${esc(t.reward)}</span></p>
            ${unlocked ? (claimed
              ? `<p class="text-xs font-bold text-keyg mt-2">Claimed ✓ · show ${t.code} in store</p>`
              : `<button onclick="claimTier(${t.id})" class="mt-2.5 rounded-full text-white text-xs font-bold px-4 py-2 hover:brightness-110 active:scale-95 transition" style="background:#79a83e;">Claim reward</button>`)
              : `<p class="text-xs fnt mt-1.5">merchant-funded · auto-unlocks from the auth stream</p>`}
          </div>
        </div>`);
    }
  }

  rows.push(`
    <div class="relative grid grid-cols-[64px_1fr]">
      <div class="flex justify-center pt-1"><span class="h-4 w-4 rounded-full border-[3px] border-dashed" style="border-color: var(--track);"></span></div>
      <div class="pt-0.5"><p class="microlabel fnt">End of line · keep exploring ✦</p></div>
    </div>`);

  $('line-rows').innerHTML = rows.join('');
  requestAnimationFrame(computeFill);
}

function computeFill() {
  if (!liveTrip) return;
  const cont = $('live-line');
  if (!cont || cont.offsetParent === null) return;
  const S = tripState[liveTrip];
  const nodes = [...cont.querySelectorAll('.lnode')].map((el) => {
    const r = el.getBoundingClientRect(), c = cont.getBoundingClientRect();
    return { pos: parseFloat(el.dataset.pos), y: r.top - c.top + r.height / 2 };
  }).sort((a, b) => a.pos - b.pos);
  if (!nodes.length) return;
  let px = nodes[0].y;
  for (let i = 0; i < nodes.length; i++) {
    if (S.spend >= nodes[i].pos) px = nodes[i].y;
    else {
      const a = nodes[i - 1], b = nodes[i];
      if (a) px = a.y + ((S.spend - a.pos) / (b.pos - a.pos)) * (b.y - a.y);
      break;
    }
  }
  $('line-fill').style.height = px + 'px';
}
window.addEventListener('resize', () => liveTrip && computeFill());

function renderRail() {
  const T = TRIPS[liveTrip], S = tripState[liveTrip];
  $('rail-spend').textContent = fmt0(Math.round(S.spend));
  const next = T.tiers.find((t) => S.spend < t.threshold);
  if (next) {
    const pct = Math.min(100, Math.round((S.spend / next.threshold) * 100));
    $('rail-bar').style.width = pct + '%';
    $('rail-next').textContent = `${pct}% toward Station ${next.id} · ${fmt0(next.threshold - S.spend)} to ${next.title}`;
  } else {
    $('rail-bar').style.width = '100%';
    $('rail-next').textContent = 'End of line — all stations unlocked 🎉';
  }
}

function claimTier(id) {
  const T = TRIPS[liveTrip], S = tripState[liveTrip];
  S.claimed.add(id);
  renderLine();
  const t = T.tiers.find((x) => x.id === id);
  toast('🎁', 'Reward claimed', `${t.title} — ${t.reward} · ${t.code}`, 'brand');
}

/* ═══════════ SIMULATOR TRIGGERS ═══════════ */
function fireHomeSwipe() {
  logEvent({ amount: 4.5, merchant: 'Starbucks', mcc: '5814', zip: '20120' },
    { text: 'zip == home → engine passive', color: 'text-white/60' });
  addTxn({ icon: '☕', merchant: 'Starbucks', desc: 'Home-market swipe', date: 'Jul 6', amount: 4.50, mcc: '5814', category: 'Dining', location: 'Centreville, VA', miles: 9, tag: null });
  toast('☕', 'Starbucks — $4.50', 'Home-market swipe. Posted to your account — nothing else wakes.');
}

function fireIgnition() {
  if (fired.ignite) return;
  fired.ignite = true;
  if (simTrip === 'standalone') simTrip = provisionStandalone();
  liveTrip = simTrip;
  const T = TRIPS[liveTrip], S = tripState[liveTrip], sc = T.script.ign;
  const wasArmed = S.armed && S.hotel;
  $('btn-ignite').disabled = true;
  $('btn-home-swipe').disabled = true;
  renderSimToggle(); renderHomeTrips(); renderTripSwitch();

  logEvent({ amount: sc.amount, merchant: sc.logName, mcc: sc.mcc, zip: T.zip },
    { text: T.standalone
        ? `${T.zip} ≠ 20120 · no itinerary on file → 🗝️ CITY KEY AUTO-PROVISIONED · MSA: ${T.city}`
        : wasArmed
        ? `${T.zip} ≠ 20120 · trip ARMED via Capital One Travel → 🗝️ CITY KEY LIVE · MSA: ${T.city}`
        : `${T.zip} ≠ 20120 → 🗝️ CITY KEY ACTIVATED · MSA: ${T.city}`, color: 'text-key font-bold' });

  $('splash-zip').textContent = wasArmed ? `check-in swipe · Base Camp confirmed` : `out-of-market swipe · zip ${T.zip} ≠ 20120`;
  $('splash-welcome').textContent = wasArmed ? `Check-in confirmed · ${T.welcome} · Base Camp is live` : `City Key activated · ${T.welcome}`;
  $('splash-txn').textContent = `${sc.merchant} · ${fmt(sc.amount)}`;
  $('splash-meta').textContent = `MSA ${T.city} · MCC ${sc.mcc} · city_key_active: true${T.standalone ? ' · itinerary: none — self-provisioned' : ''}`;
  const splash = $('splash');
  splash.classList.remove('hidden'); splash.classList.add('flex');

  setTimeout(() => {
    splash.classList.add('hidden'); splash.classList.remove('flex');

    document.documentElement.classList.add('night');
    document.body.classList.add('night');
    $('tower').textContent = T.tower;

    const ignMerchant = wasArmed ? S.hotel.name : sc.merchant;
    const ignDesc = wasArmed ? 'Check-in incidental · Base Camp confirmed' : 'Ignition swipe · City Key activated';
    S.active = true;
    S.spend = sc.amount;
    S.swipes.push({ merchant: ignMerchant, amount: sc.amount, cum: sc.amount, icon: sc.icon, time: sc.time, note: sc.note });
    addTxn({ icon: sc.icon, merchant: ignMerchant, desc: ignDesc, date: sc.date, amount: sc.amount, mcc: sc.mcc, category: 'Lodging', location: sc.location, miles: sc.amount * 2, tag: { trip: liveTrip, mode: 'auto' } });
    maybeRedeemOffer(liveTrip, ignMerchant, sc.mcc, sc.date);

    $('mode-text').innerHTML = `<span class="inline-block h-1.5 w-1.5 rounded-full bg-c1red live-dot align-middle mr-1.5"></span>Live · ${T.city}`;
    $('home-ck').innerHTML = `🗝️ <span class="acc">Live in ${T.city}</span> — the line is lit`;
    $('rail-night').classList.remove('hidden');
    $('live-dormant').classList.add('hidden');
    $('live-line-wrap').classList.remove('hidden');

    go('live');
    renderLine([1]);
    renderRail();
    setTimeout(computeFill, 150);

    const t1 = T.tiers[0];
    toast('🗝️', 'City Key activated', `Station 1 reached — ${t1.reward.toLowerCase()} unlocked ${t1.emoji}`, 'brand');
    $('btn-swipe2').disabled = false;
    $('btn-return').disabled = false;
    $('btn-folio').disabled = false;
  }, 3000);
}

/* ── hotel folio · F4 the merchant-funded flywheel ──
   Incidentals charged directly to the hotel (not the C1 Travel portal)
   earn Venture X's base 2x, same as any other card swipe. */
function fireFolioSwipe() {
  if (!liveTrip) return;
  const T = TRIPS[liveTrip], S = tripState[liveTrip];
  if (S.folioCount >= 3) { toast('🛎️', 'Quiet at the hotel', 'No more incidentals to charge right now.'); return; }
  S.folioCount++;
  const hotelName = S.hotel ? S.hotel.name : T.script.ign.merchant;
  const amount = 28, cum = S.spend + amount;
  logEvent({ amount, merchant: hotelName, mcc: '7011', zip: T.zip },
    { text: `${fmt0(S.spend)} → ${fmt0(cum)} · hotel folio (MCC 7011)`, color: 'text-key' });
  S.spend = cum;
  S.swipes.push({ merchant: hotelName, amount, cum, icon: '🛎️', time: '—', note: 'MCC 7011 · minibar & incidentals' });
  addTxn({ icon: '🛎️', merchant: hotelName, desc: 'Minibar & incidentals', date: T.script.s2.date, amount, mcc: '7011', category: 'Lodging', location: T.script.ign.location, miles: amount * 2, tag: { trip: liveTrip, mode: 'auto' } });
  maybeRedeemOffer(liveTrip, hotelName, '7011', T.script.s2.date);
  renderLine();
  renderRail();
  if (S.folioCount >= 3) $('btn-folio').disabled = true;
  if (T.basePerk && cum >= T.basePerk.threshold) { toast('🏨', 'Base Camp perk unlocked', T.basePerk.desc, 'brand'); spawnConfetti(20); }
  else toast('🛎️', `${hotelName} — $28.00`, 'Folio charge · counts toward every slab on the line', 'brand');
}

/* ── price drop protection · F3, two-step: detect then claim ── */
function fireRateDrop() {
  const key = liveTrip || simTrip;
  if (key === 'standalone') { toast('📉', 'No hotel on file', 'Book a hotel via the planner to enable price protection.'); return; }
  const T = TRIPS[key], S = tripState[key];
  if (!S.hotel) { toast('📉', 'No hotel booked yet', `Book ${T.city}'s hotel via Capital One Travel first — then rates can drop in your favor.`); return; }
  if (S.hotel.dropDetected) { toast('📉', 'Already watching', 'This stay already has a protection claim on file.'); return; }
  S.hotel.dropDetected = true;
  S.hotel.dropAmt = Math.round(S.hotel.total * 0.14);
  console.log(`[C1Travel] price.dropped → booking:${S.hotel.name}, amount:$${S.hotel.dropAmt}`);
  toast('📉', 'Rate drop detected', `${fmt0(S.hotel.dropAmt)} price-drop protection filed for ${S.hotel.name}`, 'brand');
  if (curScreen === 'plan') renderPlan();
}

function claimProtection(tripKey) {
  const T = TRIPS[tripKey], S = tripState[tripKey];
  if (!S.hotel || !S.hotel.dropDetected || S.hotel.protectionClaimed) return;
  S.hotel.protectionClaimed = true;
  S.protectionAmt += S.hotel.dropAmt;
  addTxn({ icon: '🛡️', merchant: 'Capital One Travel', desc: `Price drop protection · ${S.hotel.name}`, date: T.script.retDate, amount: -S.hotel.dropAmt, credit: true, mcc: '7011', category: 'Credit', location: 'capitalonetravel.com', miles: 0, tag: { trip: tripKey, mode: 'auto' } });
  console.log(`[C1Travel] protection.claimed → trip_id:${T.id}, credit:$${S.hotel.dropAmt}`);
  toast('🛡️', 'Protection credit posted', `${fmt0(S.hotel.dropAmt)} back for ${S.hotel.name}`, 'brand');
  renderPlan();
}

function fireProgressSwipe() {
  if (fired.swipe2 || !liveTrip) return;
  fired.swipe2 = true;
  $('btn-swipe2').disabled = true;
  $('btn-swipe3').disabled = false;

  const T = TRIPS[liveTrip], S = tripState[liveTrip], sc = T.script.s2;
  const cum = S.spend + sc.amount;
  logEvent({ amount: sc.amount, merchant: sc.merchant, mcc: sc.mcc, zip: T.zip },
    { text: `${fmt0(S.spend)} → ${fmt0(cum)} · closing on Station 2`, color: 'text-key' });

  S.spend = cum;
  S.swipes.push({ merchant: sc.merchant, amount: sc.amount, cum, icon: sc.icon, time: sc.time, note: `MCC ${sc.mcc} · ${sc.note}` });
  addTxn({ icon: sc.icon, merchant: sc.merchant, desc: sc.note, date: sc.date, amount: sc.amount, mcc: sc.mcc, category: 'Dining', location: sc.location, miles: sc.amount * 2, tag: { trip: liveTrip, mode: 'auto' } });
  maybeRedeemOffer(liveTrip, sc.merchant, sc.mcc, sc.date);
  go('live');
  renderLine();
  renderRail();
  const next = T.tiers.find((t) => cum < t.threshold);
  const progressMsg = next
    ? `${Math.round((cum / next.threshold) * 100)}% to Station ${next.id} · ${fmt0(next.threshold - cum)} to go`
    : 'Every station is within reach — check the line!';
  toast('📈', `${sc.merchant} — ${fmt(sc.amount)}`, progressMsg, 'brand');
}

function fireTierSwipe() {
  if (fired.swipe3 || !liveTrip) return;
  fired.swipe3 = true;
  $('btn-swipe3').disabled = true;

  const T = TRIPS[liveTrip], S = tripState[liveTrip], sc = T.script.s3;
  const cum = S.spend + sc.amount;
  const t2 = T.tiers[1];
  logEvent({ amount: sc.amount, merchant: sc.merchant, mcc: sc.mcc, zip: T.zip },
    { text: `${fmt0(S.spend)} → ${fmt0(cum)} ≥ ${fmt0(t2.threshold)} · 🏆 STATION 2 UNLOCKED`, color: 'text-keyg font-bold' });

  S.spend = cum;
  S.swipes.push({ merchant: sc.merchant, amount: sc.amount, cum, icon: sc.icon, time: sc.time, note: `MCC ${sc.mcc} · ${sc.note}` });
  addTxn({ icon: sc.icon, merchant: sc.merchant, desc: sc.note, date: sc.date, amount: sc.amount, mcc: sc.mcc, category: 'Dining', location: sc.location, miles: sc.amount * 2, tag: { trip: liveTrip, mode: 'auto' } });
  maybeRedeemOffer(liveTrip, sc.merchant, sc.mcc, sc.date);
  go('live');
  renderLine([2]);
  renderRail();
  spawnConfetti(30);
  toast('🏆', 'Station 2 unlocked', `${t2.title} — ${t2.reward}. Claim it on the line.`, 'brand');
  if (T.vbStation && cum >= T.vbStation.threshold) {
    setTimeout(() => toast('✦', 'An express station just lit up', 'Velocity Black has something for you on the line', 'vb'), 2600);
  }
}

function fireReturnSwipe() {
  if (fired.ret || !liveTrip) return;
  fired.ret = true;
  ['btn-swipe2', 'btn-swipe3', 'btn-return', 'btn-folio'].forEach((b) => $(b).disabled = true);

  const T = TRIPS[liveTrip], S = tripState[liveTrip];
  logEvent({ amount: 6.2, merchant: 'Dulles Coffee Co', mcc: '5814', zip: '20120' },
    { text: 'zip == home after trip → 🧾 TRIP SETTLED · generating Wrapped', color: 'text-amber-300 font-bold' });

  addTxn({ icon: '🛬', merchant: 'Dulles Coffee Co', desc: 'Welcome-home coffee · trip settled', date: T.script.retDate, amount: 6.20, mcc: '5814', category: 'Dining', location: 'Dulles, VA', miles: 12, tag: null });
  S.settled = true;

  document.documentElement.classList.remove('night');
  document.body.classList.remove('night');
  document.documentElement.classList.add('dawn');
  document.body.classList.add('dawn');
  $('mode-text').textContent = 'Home · trip settled';

  go('wrap');
  toast('🛬', 'Welcome home', 'City Key sealed the trip and built your Wrapped', 'brand');
}

/* ── wrap builder ── */
let wrapRan = false;
function runWrap() {
  if (wrapRan || !liveTrip) return;
  wrapRan = true;
  const T = TRIPS[liveTrip], S = tripState[liveTrip];
  const led = ledgerFor(liveTrip);
  const ledger = led.total;
  const stations = T.tiers.filter((t) => t.threshold <= S.spend).length;
  const claimedVal = [...S.claimed].reduce((a, id) => a + T.tiers.find((t) => t.id === id).value, 0);
  const miles = Math.round(led.milesTotal);
  const top = S.swipes.reduce((a, b) => (b.amount > (a?.amount || 0) ? b : a), null);

  $('wrap-kicker').textContent = T.settled;
  $('wrap-title').innerHTML = `${esc(T.heroWord)}, <em>wrapped.</em>`;
  $('w-airports').innerHTML = `${T.airports} <span class="text-white/40 text-4xl align-middle">→</span> IAD`;
  $('w-sub').textContent = T.wrapSub;

  countUp('w-share', 100, (v) => Math.round(v) + '%');
  countUp('w-spend', ledger, (v) => fmt0(Math.round(v)));
  countUp('w-miles', miles, (v) => Math.round(v).toLocaleString());
  countUp('w-claimed', claimedVal, (v) => fmt0(Math.round(v)));
  $('w-stations').innerHTML = `${stations}<span class="text-white/40 text-xl">/3</span>`;
  $('w-top').textContent = top ? `Top swipe: ${top.merchant} · ${fmt(top.amount)}` : 'No destination swipes';
  const vbMoments = S.vbUsed.size + (S.vbExpress ? 1 : 0);
  $('w-fact').textContent = `${S.swipes.length} swipes in ${T.city} · ${led.count} txns on the trip ledger · ${S.bookedCount} stops pre-booked via C1 Travel (${fmt0(S.booked)})`
    + (S.saved || S.credits ? ` · 🛍 Shopping: saved ${fmt0(S.saved)} + ${fmt(S.credits)} credits` : '')
    + (vbMoments ? ` · ✦ ${vbMoments} Velocity Black moment${vbMoments > 1 ? 's' : ''}` : '')
    + (S.offerCredits ? ` · 💳 Capital One Offers redeemed: ${fmt(S.offerCredits)} back` : '');

  const portalEl = $('w-portal');
  if (portalEl) {
    if (S.hotel || S.flight) {
      const flightMiles = S.flight ? S.flight.total * 5 : 0;
      const hotelMiles = S.hotel ? S.hotel.miles : 0;
      const parts = [];
      if (S.flight) parts.push(`✈️ 5x flight`);
      if (S.hotel) parts.push(`🏨 10x hotel`);
      portalEl.textContent = `${parts.join(' + ')} = ${Math.round(flightMiles + hotelMiles).toLocaleString()} miles from the portal alone`
        + (S.hotel ? ` · $${S.hotel.creditApplied} credit applied` : '')
        + (S.protectionAmt ? ` · price protection recovered ${fmt0(S.protectionAmt)}` : '');
      portalEl.classList.remove('hidden');
    } else {
      portalEl.classList.add('hidden');
    }
  }
  renderSplitModule(liveTrip);
  spawnConfetti(34);
}
