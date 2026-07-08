/* ═══ VENTURE KEY · Velocity Black — concierge drawer & express station ═══ */

/* ═══════════ VELOCITY BLACK · concierge ═══════════ */
const vbTrip = () => (curScreen === 'live' ? (liveTrip || simTrip) : viewTrip);

function openVB() {
  $('vb-drawer').classList.add('open');
  renderVB();
}
function closeVB() { $('vb-drawer').classList.remove('open'); }

function renderVB(typing = false) {
  const K = vbTrip(), T = TRIPS[K], S = tripState[K];
  if (!S.vbGreeted) {
    S.vbGreeted = true;
    S.vbThread.push({ who: 'c', text: `Good evening, Bharath. ${T.city} ${T.flag} — excellent. What shall we make happen?` });
  }
  $('vb-thread').innerHTML = S.vbThread.map((m) => {
    if (m.who === 'u') return `<div class="vb-bubble-u anim-rise">${esc(m.text)}</div>`;
    if (m.who === 'card') return `
      <div class="vb-card anim-pop">
        <p class="text-[9px] font-bold vb-gold" style="letter-spacing:.4em;">✦ SECURED</p>
        <p class="text-sm font-bold mt-1.5" style="font-family:'Fraunces',Georgia,serif; color:#f0e6cd;">${esc(m.title)}</p>
        <p class="text-[11px] mt-1" style="color: rgba(239,230,212,.55);">${esc(m.sub)} · added to your plan</p>
      </div>`;
    return `<div class="vb-bubble-c anim-rise">${esc(m.text)}</div>`;
  }).join('') + (typing ? `<div class="vb-bubble-c vb-dots" style="width:64px;"><span></span><span></span><span></span></div>` : '');
  $('vb-thread').scrollTop = $('vb-thread').scrollHeight;

  const remaining = T.vb.map((r, i) => ({ r, i })).filter(({ i }) => !S.vbUsed.has(i));
  $('vb-chips').innerHTML = typing ? '' : remaining.length
    ? `<p class="text-[9px] font-bold mb-1" style="letter-spacing:.3em; color: rgba(239,230,212,.4);">MAKE A REQUEST</p>` +
      remaining.map(({ r, i }) => `<button onclick="vbAsk(${i})" class="vb-chip">${r.icon}&nbsp; ${esc(r.ask)}</button>`).join('')
    : `<p class="text-[11px] text-center" style="color: rgba(239,230,212,.45);">Anything else? Just ask — we're always on. ✦</p>`;
}

function vbAsk(i) {
  const K = vbTrip(), T = TRIPS[K], S = tripState[K];
  const req = T.vb[i];
  if (S.vbUsed.has(i)) return;
  S.vbUsed.add(i);
  S.vbThread.push({ who: 'u', text: req.ask });
  renderVB(true);
  setTimeout(() => {
    S.vbThread.push({ who: 'c', text: req.reply });
    S.vbThread.push({ who: 'card', title: req.stop.title, sub: req.stop.sub });
    const di = Math.min(req.stop.day, T.days.length - 1);
    T.days[di].stops.push({ time: req.stop.time, cat: req.stop.cat, title: req.stop.title, sub: req.stop.sub, status: 'velocity' });
    renderVB();
    renderPlan();
    console.log(`[VelocityBlack] request fulfilled → "${req.stop.title}" (trip_id: ${T.id})`);
    toast('✦', 'Secured by Velocity Black', req.stop.title, 'vb');
  }, 1500);
}

function vbAccept() {
  const K = liveTrip || vbTrip(), T = TRIPS[K], S = tripState[K];
  if (S.vbExpress) return;
  S.vbExpress = true;
  const bs = T.vbStation;
  T.days[T.days.length - 1].stops.push({ time: '19:00', cat: 'entertainment', title: bs.title, sub: bs.desc, status: 'velocity' });
  if (liveTrip) renderLine();
  renderPlan();
  console.log(`[VelocityBlack] express station accepted → "${bs.title}" (trip_id: ${T.id})`);
  toast('✦', 'Express station claimed', `${bs.title} — on your plan`, 'vb');
}
