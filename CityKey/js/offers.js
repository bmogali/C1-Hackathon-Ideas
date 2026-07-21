/* ═══ VENTURE KEY · Capital One Offers — card-linked, nearby ═══
   Real mechanic, kept honest: activate the card against an offer BEFORE you
   spend — never retroactive — then a matching swipe posts a separate credit
   line a beat later. Coverage is a small, curated list per destination, not
   "every merchant nearby." See card-linked-offers-spec.md. */

function renderOffersRail() {
  const section = $('offers-section'), rail = $('offers-rail');
  const key = liveTrip || (simTrip !== 'standalone' ? simTrip : null);
  const T = key ? TRIPS[key] : null, S = key ? tripState[key] : null;
  const visible = T && S && T.offers && T.offers.length && (S.active || S.armed);
  if (!visible) { section.classList.add('hidden'); rail.innerHTML = ''; return; }

  section.classList.remove('hidden');
  rail.innerHTML = T.offers.map((o) => {
    const status = S.offerStatus[o.id] || 'available';
    let action;
    if (status === 'redeemed') {
      action = `<span class="text-[10px] font-bold uppercase tracking-widest rounded-full px-3 py-1.5" style="background: rgba(159,211,86,.14); color:#5c8f1d;">Redeemed</span>`;
    } else if (status === 'activated') {
      action = `<span class="text-[10px] font-bold uppercase tracking-widest rounded-full px-3 py-1.5" style="background: rgba(159,211,86,.14); color:#5c8f1d;">Activated ✓</span>`;
    } else {
      action = `<button onclick="activateOffer('${key}','${o.id}')" class="rounded-full text-white text-xs font-bold px-4 py-2 hover:brightness-110 active:scale-95 transition" style="background: var(--accent);">Activate</button>`;
    }
    return `
      <div class="srf rounded-2xl p-4 shrink-0" style="width:188px;">
        <div class="flex items-center justify-between">
          <span class="h-9 w-9 rounded-full srf2 flex items-center justify-center text-base">${o.icon}</span>
          ${status === 'redeemed' ? '<span class="text-keyg text-sm">✓</span>' : ''}
        </div>
        <p class="font-bold text-sm mt-2.5 truncate" title="${esc(o.merchant)}">${esc(o.merchant)}</p>
        <p class="text-xs mut mt-0.5">${esc(o.terms)}</p>
        <p class="text-[10px] fnt mt-1">${esc(o.radiusLabel)}</p>
        <div class="mt-3">${action}</div>
      </div>`;
  }).join('');
}

function activateOffer(tripKey, offerId) {
  const S = tripState[tripKey];
  if (!S || (S.offerStatus[offerId] && S.offerStatus[offerId] !== 'available')) return;
  const T = TRIPS[tripKey];
  const offer = T.offers.find((o) => o.id === offerId);
  if (!offer) return;
  S.offerStatus[offerId] = 'activated';
  console.log(`[C1Offers] offer.activated → merchant:${offer.merchant}, trip_id:${T.id}`);
  toast('💳', 'Offer added to Venture X', `Spend at ${offer.merchant} to earn ${offer.terms.toLowerCase()}`, 'brand');
  renderOffersRail();
}

/* called right after a scripted swipe posts — only an offer already
   'activated' at the moment of the swipe can ever match. Never retroactive. */
function maybeRedeemOffer(tripKey, merchant, mcc, date) {
  const T = TRIPS[tripKey], S = tripState[tripKey];
  if (!T.offers) return;
  const offer = T.offers.find((o) => o.merchant === merchant && S.offerStatus[o.id] === 'activated');
  if (!offer) return;
  S.offerStatus[offer.id] = 'redeemed';
  S.offerCredits += offer.creditAmount;
  addTxn({
    icon: '💳', merchant: 'Capital One Offers', desc: `${offer.merchant} · card-linked offer`, date,
    amount: -offer.creditAmount, credit: true, mcc: mcc || '5999', category: 'Credit',
    location: 'capitalone.com', miles: 0, tag: { trip: tripKey, mode: 'auto' },
  });
  console.log(`[C1Offers] offer.redeemed → merchant:${offer.merchant}, credit:$${offer.creditAmount}, trip_id:${T.id}`);
  toast('💳', 'Capital One Offers', `${offer.merchant} · +${fmt(offer.creditAmount)} back`, 'brand');
  renderOffersRail();
}
