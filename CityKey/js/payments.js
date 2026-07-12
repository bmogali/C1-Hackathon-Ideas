/* ═══ VENTURE KEY · Zelle® (split & request) + Paze℠ (merchant checkout) ═══
   See zelle-paze-spec.md. Kept strictly separate: Zelle only ever moves
   money between people (into 360 Checking, never the card); Paze only ever
   appears at an external merchant checkout, at the normal card earn rate. */

/* deterministic mock contact so any tripmate name — including custom ones
   added via addMate() — gets a plausible masked phone number */
function contactFor(name) {
  const h = hashStr(name);
  return '(•••) •••-' + String(1000 + (h % 9000)).slice(-4);
}

/* ═══════════ ZELLE · split & request composer ═══════════ */
let zelleCtx = null;

function openZelleComposer(tripKey, mateIdx, presetAmount, presetMemo) {
  const T = TRIPS[tripKey];
  if (!T.mates.length) return;
  const travelers = 1 + T.mates.length;
  const led = ledgerFor(tripKey);
  const amount = presetAmount != null ? presetAmount : led.total / travelers;
  const memo = presetMemo || `${T.name} — your share`;
  zelleCtx = { tripKey, mateIdx: Math.min(mateIdx, T.mates.length - 1) };

  $('zl-mate-picker').innerHTML = T.mates.map((m, i) =>
    `<button onclick="selectZelleMate(${i})" class="zl-chip trip-chip ${i === zelleCtx.mateIdx ? 'on' : ''} srf rounded-full px-3 py-1.5 text-xs font-bold">${esc(m)}</button>`
  ).join('');
  updateZelleRecipient();
  $('zl-amount').value = amount.toFixed(2);
  $('zl-memo').value = memo;

  const m = $('modal-zelle');
  m.classList.remove('hidden'); m.classList.add('flex');
}

function selectZelleMate(i) {
  zelleCtx.mateIdx = i;
  document.querySelectorAll('#zl-mate-picker .zl-chip').forEach((el, idx) => el.classList.toggle('on', idx === i));
  updateZelleRecipient();
}

function updateZelleRecipient() {
  const T = TRIPS[zelleCtx.tripKey];
  const mate = T.mates[zelleCtx.mateIdx];
  $('zl-avatar').textContent = mate[0].toUpperCase();
  $('zl-name').textContent = mate;
  $('zl-contact').textContent = contactFor(mate);
}

function closeZelleComposer() {
  const m = $('modal-zelle');
  m.classList.add('hidden'); m.classList.remove('flex');
  zelleCtx = null;
}

function sendZelleRequest() {
  if (!zelleCtx) return;
  const { tripKey, mateIdx } = zelleCtx;
  const T = TRIPS[tripKey], S = tripState[tripKey];
  const mate = T.mates[mateIdx];
  const amount = Math.max(0, parseFloat($('zl-amount').value) || 0);
  const memo = $('zl-memo').value.trim() || `${T.name} — your share`;
  if (!amount) { toast('✏️', 'Add an amount', 'How much should this request be for?'); return; }

  S.zelleRequests.push({ id: 'req_' + Date.now().toString(36), to: mate, amount, memo, status: 'requested', ts: Date.now() });
  console.log(`[Zelle] request.sent → to:${mate}, amount:$${amount.toFixed(2)}, trip_id:${T.id}`);
  closeZelleComposer();
  renderSplitModule(tripKey);
  toast('⚡', 'Request sent', `${mate} — ${fmt(amount)} via Zelle®`, 'brand');
}

function remindZelleRequest(tripKey, reqId) {
  const req = tripState[tripKey].zelleRequests.find((r) => r.id === reqId);
  if (!req) return;
  toast('⚡', 'Reminder sent', `${req.to} — ${fmt(req.amount)} still pending via Zelle®`);
}

/* the counterparty has to approve a Zelle request in their OWN bank's app —
   this button stands in for that external action so the demo can show the
   full loop without a second phone. Real Venture Key can never trigger this itself. */
function simulateZelleResponse() {
  const tripKey = liveTrip || viewTrip;
  const S = tripState[tripKey];
  const req = S.zelleRequests.find((r) => r.status === 'requested');
  if (!req) { toast('🔔', 'Nothing pending', `No outstanding Zelle requests for ${TRIPS[tripKey].name}.`); return; }
  req.status = 'received';
  creditChecking(req.amount, '⚡', `Zelle from ${req.to} — ${req.memo}`, 'Just now');
  console.log(`[Zelle] request.accepted → to:${req.to}, amount:$${req.amount.toFixed(2)}, trip_id:${TRIPS[tripKey].id}`);
  toast('⚡', `${req.to} paid you back`, `${fmt(req.amount)} landed in 360 Checking`, 'brand');
  renderSplitModule(tripKey);
}

/* ═══════════ WRAP · Split this trip module ═══════════ */
function renderSplitModule(tripKey) {
  const el = $('wrap-split');
  if (!el) return;
  const T = TRIPS[tripKey], S = tripState[tripKey];
  if (!T.mates.length) { el.classList.add('hidden'); el.innerHTML = ''; return; }

  const led = ledgerFor(tripKey);
  const travelers = 1 + T.mates.length;
  const perPerson = led.total / travelers;
  const receivedTotal = S.zelleRequests.filter((r) => r.status === 'received').reduce((a, r) => a + r.amount, 0);

  el.classList.remove('hidden');
  el.innerHTML = `
    <p class="microlabel acc mb-4">💸 Split this trip · Zelle®</p>
    <div class="srf rounded-2xl p-6">
      <p class="font-bold">You fronted ${fmt0(led.total)} on Venture X · split evenly, everyone owes ${fmt0(perPerson)}</p>
      <div class="mt-4 space-y-2">
        ${T.mates.map((m) => {
          const req = [...S.zelleRequests].reverse().find((r) => r.to === m);
          let pill = '', action = '';
          if (req && req.status === 'received') {
            pill = `<span class="text-[10px] font-bold uppercase tracking-widest rounded-full px-3 py-1.5" style="background: rgba(159,211,86,.14); color:#5c8f1d;">Paid ✓</span>`;
          } else if (req && req.status === 'requested') {
            pill = `<span class="text-[10px] font-bold uppercase tracking-widest rounded-full px-3 py-1.5" style="background: rgba(245,158,11,.14); color:#b45309;">Requested · pending</span>`;
            action = `<button onclick="remindZelleRequest('${tripKey}','${req.id}')" class="rounded-full srf2 text-xs font-bold px-4 py-2 hover:opacity-75">Remind</button>`;
          } else {
            const idx = T.mates.indexOf(m);
            action = `<button onclick="openZelleComposer('${tripKey}',${idx})" class="rounded-full text-white text-xs font-bold px-4 py-2 hover:brightness-110 active:scale-95 transition" style="background:#6d1ed4;">Request ${fmt0(perPerson)} via Zelle®</button>`;
          }
          return `
          <div class="flex flex-wrap items-center justify-between gap-3 rounded-xl srf2 px-4 py-3">
            <div class="flex items-center gap-3">
              <span class="h-9 w-9 rounded-full bg-c1navy text-white text-xs font-bold flex items-center justify-center shrink-0">${esc(m[0].toUpperCase())}</span>
              <div>
                <p class="text-sm font-bold">${esc(m)}</p>
                <p class="text-[11px] mut">${fmt0(perPerson)} owed</p>
              </div>
            </div>
            <div class="flex items-center gap-2">${pill}${action}</div>
          </div>`;
        }).join('')}
      </div>
      ${receivedTotal ? `<p class="text-[11px] mut mt-4">${fmt0(receivedTotal)} received into 360 Checking.</p>` : ''}
    </div>`;
}

/* ═══════════ HOME · incoming Zelle request ═══════════ */
const incomingRequest = { from: 'Arjun', amount: 42.00, memo: 'Dinner in Chicago', status: 'pending' };

function renderIncomingRequest() {
  const el = $('home-zelle-incoming');
  if (!el) return;
  if (incomingRequest.status !== 'pending') { el.classList.add('hidden'); el.innerHTML = ''; return; }
  el.classList.remove('hidden');
  el.innerHTML = `
    <span class="text-lg">💰</span>
    <p class="text-sm font-bold mut flex-1">${esc(incomingRequest.from)} requested ${fmt(incomingRequest.amount)} — ${esc(incomingRequest.memo)}</p>
    <button onclick="payIncomingRequest()" class="rounded-full text-white text-xs font-bold px-4 py-2 hover:brightness-110 active:scale-95 transition shrink-0" style="background:#6d1ed4;">Pay with Zelle®</button>
    <button onclick="declineIncomingRequest()" class="text-xs font-bold fnt hover:opacity-70 shrink-0">Decline</button>`;
}

function payIncomingRequest() {
  if (incomingRequest.status !== 'pending') return;
  incomingRequest.status = 'paid';
  debitChecking(incomingRequest.amount, '⚡', `Zelle to ${incomingRequest.from} — ${incomingRequest.memo}`, 'Just now');
  console.log(`[Zelle] request.paid → to:${incomingRequest.from}, amount:$${incomingRequest.amount.toFixed(2)}`);
  toast('⚡', 'Sent via Zelle®', `${fmt(incomingRequest.amount)} to ${incomingRequest.from}`, 'brand');
  renderIncomingRequest();
}

function declineIncomingRequest() {
  incomingRequest.status = 'declined';
  toast('⚡', 'Request declined', `${incomingRequest.from} will see this in their Zelle activity`);
  renderIncomingRequest();
}

/* ═══════════ PAZE · merchant checkout ═══════════
   Paze never touches rewards math — it's a checkout rail, not a card.
   Every Paze purchase earns exactly what a normal swipe at that MCC would. */
function payWithPaze(tripKey, di, si) {
  const T = TRIPS[tripKey], S = tripState[tripKey];
  const stop = T.days[di].stops[si];
  if (!stop.dropVia) return;
  stop.status = 'bookedNow';
  stop.paidWithPaze = true;
  const mccMatch = (CAT_META[stop.cat] || '').match(/mcc (\d+)/);
  const mcc = mccMatch ? mccMatch[1] : '5999';
  addTxn({
    icon: '🅿️', merchant: stop.dropVia, desc: `${stop.title} · via Paze`, date: 'Jul 9',
    amount: stop.price, mcc, category: 'Merchandise', location: `${stop.dropVia.toLowerCase().replace(/\s+/g, '')}.com`,
    miles: stop.price * 2, tag: { trip: tripKey, mode: 'auto' },
  });
  console.log(`[Paze] checkout.completed → merchant:${stop.dropVia}, amount:$${stop.price}, trip_id:${T.id}`);
  toast('🅿️', 'Paid with Paze', `${stop.title} · Venture X ····4907 · via ${stop.dropVia}`, 'brand');
  renderPlan();
}
