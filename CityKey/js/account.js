/* ═══ VENTURE KEY · account servicing — ledger, tagging, vitals, multi-account ═══ */

/* ═══════════ ACCOUNT SERVICING ═══════════ */
function addTxn(t) {
  txns.unshift({ id: ++txnSeq, status: 'Pending', ...t });
  renderAccountVitals();
  if ($('screen-account').classList.contains('on')) renderTxns();
}

function tagChip(tag) {
  if (!tag) return '';
  const T = TRIPS[tag.trip];
  const label = tag.mode === 'auto' ? `🗝️ ${T.city} · auto` : tag.mode === 'shop' ? `🛍️ ${T.city} · shopping` : `🏷️ ${T.city}`;
  return `<span class="tag-chip text-[9px] font-bold uppercase tracking-widest rounded-full px-2 py-1"
    style="background: rgba(2,118,177,.12); color: var(--accent);">${label}</span>`;
}

function renderTxns() {
  $('txn-list').innerHTML = txns.map((t) => {
    const open = t.id === openTxnId;
    const tagButtons = Object.values(TRIPS).map((T, i) =>
      `<button onclick="event.stopPropagation(); tagTxn(${t.id},'${T.key}')"
        class="rounded-full text-xs font-bold px-4 py-2 text-white hover:brightness-110 active:scale-95 transition"
        style="background:${i % 2 ? '#013d5b' : 'var(--accent)'};">${T.flag} ${esc(T.name)}</button>`).join('');
    return `
    <div class="border-b last:border-b-0" style="border-color: var(--border);">
      <div class="txn-row px-5 py-4 flex items-center gap-4" onclick="toggleTxn(${t.id})">
        <span class="h-10 w-10 rounded-full srf2 flex items-center justify-center text-lg shrink-0">${t.icon}</span>
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 flex-wrap">
            <p class="font-bold truncate">${esc(t.merchant)}</p>
            ${t.status === 'Pending' ? '<span class="text-[9px] font-bold uppercase tracking-widest fnt rounded-full px-2 py-0.5 srf2">Pending</span>' : ''}
            ${tagChip(t.tag)}
          </div>
          <p class="text-xs mut truncate mt-0.5">${t.date} · ${esc(t.desc)}</p>
        </div>
        <div class="text-right shrink-0">
          <p class="font-bold" style="font-variant-numeric:tabular-nums; ${t.credit ? 'color:#5c8f1d;' : ''}">${t.credit ? '+' : '-'}${fmt(Math.abs(t.amount))}</p>
          ${t.miles ? `<p class="text-[10px] acc font-bold">+${t.miles.toLocaleString()} mi</p>` : ''}
        </div>
        <span class="fnt text-sm transition-transform ${open ? 'rotate-90' : ''}">›</span>
      </div>

      <div class="txn-detail ${open ? 'open' : ''}"><div>
        <div class="px-5 pb-5 pt-1 ml-14">
          <div class="grid sm:grid-cols-4 gap-3 text-xs rounded-xl srf2 px-4 py-3">
            <div><p class="microlabel fnt" style="letter-spacing:.15em;">Category</p><p class="font-bold mt-1">${t.category}</p></div>
            <div><p class="microlabel fnt" style="letter-spacing:.15em;">MCC</p><p class="font-bold mt-1 font-mono">${t.mcc}</p></div>
            <div><p class="microlabel fnt" style="letter-spacing:.15em;">Location</p><p class="font-bold mt-1">${esc(t.location)}</p></div>
            <div><p class="microlabel fnt" style="letter-spacing:.15em;">Status</p><p class="font-bold mt-1">${t.status}</p></div>
          </div>
          <div class="mt-3 flex items-center flex-wrap gap-2">
            ${t.tag
              ? `<p class="text-xs font-bold acc">${t.tag.mode === 'auto'
                  ? `🗝️ Auto-tagged to <u>${esc(TRIPS[t.tag.trip].name)}</u> by City Key — in-market swipe`
                  : t.tag.mode === 'shop'
                  ? `🛍️ Auto-tagged to <u>${esc(TRIPS[t.tag.trip].name)}</u> by Capital One Shopping — trip gear`
                  : `🏷️ Tagged to <u>${esc(TRIPS[t.tag.trip].name)}</u>`}</p>
                 ${t.tag.mode === 'manual' ? `<button onclick="event.stopPropagation(); untagTxn(${t.id})" class="text-[11px] font-bold fnt hover:opacity-70">✕ remove</button>` : ''}
                 ${TRIPS[t.tag.trip].mates.length ? `<button onclick="event.stopPropagation(); openZelleComposer('${t.tag.trip}',0,${(t.amount / (1 + TRIPS[t.tag.trip].mates.length)).toFixed(2)},'${jsEsc(t.merchant)} — your share')"
                     class="rounded-full text-white text-xs font-bold px-4 py-2 hover:brightness-110 active:scale-95 transition" style="background:#6d1ed4;">💸 Split this charge</button>` : ''}`
              : `<p class="microlabel fnt mr-1" style="letter-spacing:.15em;">Tag to a plan</p>
                 ${tagButtons}
                 <button onclick="event.stopPropagation(); openNewTrip()"
                   class="rounded-full text-xs font-bold px-4 py-2 srf hover:opacity-80 transition-opacity">＋ New plan</button>`}
          </div>
        </div>
      </div></div>
    </div>`;
  }).join('');
}

function toggleTxn(id) { openTxnId = openTxnId === id ? null : id; renderTxns(); }

function tagTxn(id, tripKey) {
  const t = txns.find((x) => x.id === id);
  t.tag = { trip: tripKey, mode: 'manual' };
  renderTxns(); renderLedger();
  console.log(`[VenturePlanner] txn ${t.merchant} $${t.amount} tagged → trip_id: ${TRIPS[tripKey].id}`);
  toast('🏷️', `Tagged to ${TRIPS[tripKey].name}`, `${t.merchant} · ${fmt(t.amount)} added to the trip ledger`);
}
function untagTxn(id) {
  const t = txns.find((x) => x.id === id);
  t.tag = null;
  renderTxns(); renderLedger();
  toast('🏷️', 'Tag removed', `${t.merchant} is no longer on a trip ledger`);
}

function ledgerFor(tripKey) {
  const list = txns.filter((t) => t.tag && t.tag.trip === tripKey);
  return {
    count: list.length,
    total: list.reduce((a, t) => a + t.amount, 0),
    manualMiles: list.filter((t) => t.tag.mode === 'manual').reduce((a, t) => a + t.miles, 0),
    milesTotal: list.reduce((a, t) => a + t.miles, 0),
  };
}

function renderLedger() {
  let total = 0, count = 0;
  const parts = [];
  Object.keys(TRIPS).forEach((k) => {
    const l = ledgerFor(k);
    total += l.total; count += l.count;
    if (l.count) parts.push(`${l.count} ${TRIPS[k].city}`);
  });
  $('acct-tagged').textContent = fmt0(total);
  $('acct-tagged-note').textContent = count ? `${count} txns · ${parts.join(' · ')}` : '0 transactions';
  const v = ledgerFor(viewTrip);
  $('rail-tagged').textContent = `${fmt0(v.total)} · ${v.count} txn${v.count === 1 ? '' : 's'}`;
}

function renderAccountVitals() {
  const extra = txns.reduce((a, t) => a + t.amount, 0) - SEED_SUM;
  const bal = BASE_BALANCE + Math.max(0, extra);
  const miles = BASE_MILES + txns.reduce((a, t) => a + t.miles, 0) - SEED_MILES;
  $('acct-balance').textContent = fmt(bal);
  $('home-balance').textContent = fmt(bal);
  $('acct-credit').textContent = fmt0(CREDIT_LIMIT - bal);
  $('acct-miles').textContent = Math.round(miles).toLocaleString();
  renderLedger();
}

/* ── stacked wallet · Capital One card themes ── */
const CARD_THEMES = {
  venturex:    { bg: 'linear-gradient(135deg,#0e1f2f 0%,#16344b 55%,#0b2438 110%)', ink: '#ffffff', dim: 'rgba(255,255,255,.55)', logo: '#fff' },
  quicksilver: { bg: 'linear-gradient(135deg,#e6e9ed 0%,#b7bec7 45%,#dfe2e7 100%)', ink: '#1b2530', dim: 'rgba(27,37,48,.55)', logo: '#013d5b' },
  checking:    { bg: 'linear-gradient(135deg,#0aa3c2 0%,#0276b1 60%,#015c8a 110%)', ink: '#ffffff', dim: 'rgba(255,255,255,.6)', logo: '#fff' },
  savings:     { bg: 'linear-gradient(135deg,#237a56 0%,#2e8b62 55%,#175c40 110%)', ink: '#ffffff', dim: 'rgba(255,255,255,.6)', logo: '#fff' },
};

function renderWallet() {
  const box = $('wallet');
  if (!box) return;
  const strip = (key) => {
    const a = ACCOUNTS.find((x) => x.key === key), th = CARD_THEMES[key];
    return `
    <div class="wcard" onclick="pickAccount('${key}')" style="background:${th.bg}; color:${th.ink};">
      <div class="flex items-start justify-between">
        <div>
          <p class="microlabel" style="color:${th.dim};">${a.name} <span class="font-mono">${a.num}</span></p>
          <p class="text-[11px] font-semibold mt-1" style="color:${th.dim};">${a.note}</p>
        </div>
        <div class="text-right">
          <p class="text-lg font-bold" style="font-variant-numeric:tabular-nums;">${fmt(a.bal)}</p>
          <p class="text-[9px] font-bold uppercase tracking-widest" style="color:${th.dim};">${a.kind}</p>
        </div>
      </div>
    </div>`;
  };
  const th = CARD_THEMES.venturex;
  box.innerHTML = strip('quicksilver') + strip('savings') + strip('checking') + `
    <div class="wcard vcard" onclick="go('account')" style="background:${th.bg}; color:#fff;">
      <div class="flex items-center justify-between relative z-10">
        <p class="microlabel" style="color:${th.dim};">Venture X <span class="font-mono">····4907</span></p>
        <svg class="h-5 w-auto" style="--logo-word:#fff" viewBox="0 0 418 150" role="img" aria-label="Capital One"><use href="#c1logo"/></svg>
      </div>
      <div class="relative z-10 mt-4 h-7 w-10 rounded-md" style="background: linear-gradient(135deg,#e8c56b,#b8933f);"></div>
      <div class="relative z-10 flex items-end justify-between mt-6">
        <div>
          <p class="text-[9px] font-bold uppercase tracking-[.25em]" style="color:${th.dim};">Bharath Mogali</p>
          <p class="text-xl font-bold mt-1" style="font-variant-numeric:tabular-nums;" id="home-balance">$1,284.09</p>
        </div>
        <div class="text-right">
          <p class="text-[9px] font-bold uppercase tracking-[.25em]" style="color:${th.dim};">Miles</p>
          <p class="text-lg font-bold text-key">86,420</p>
        </div>
      </div>
    </div>`;
}

/* ── detail pages · 360 Checking, Savings, Quicksilver ── */
let selectedAcct = 'checking';

const ACCT_DETAILS = {
  checking: {
    em: '···2201',
    vitals: [
      ['Available balance', '$8,214.55', 'no fees · no minimums'],
      ['Pending', '−$86.12', '2 transactions'],
      ['Direct deposit', '$2,450.00', 'Fridays · Employer Inc'],
      ['Overdraft', 'No-Fee', 'coverage on'],
    ],
    actions: [['💸', 'Transfer money'], ['🧾', 'Pay bills'], ['⚡', 'Zelle®'], ['🔒', 'Lock debit card']],
    txns: [
      { icon: '💼', name: 'Employer Inc — direct deposit', date: 'Jul 4', amt: 2450.00 },
      { icon: '💳', name: 'Payment to Venture X ····4907', date: 'Jul 1', amt: -1911.30 },
      { icon: '🏠', name: 'Oakwood Apartments — rent', date: 'Jul 1', amt: -1850.00 },
      { icon: '🌱', name: 'Auto-save → 360 Savings ···8832', date: 'Jun 28', amt: -500.00 },
      { icon: '⚡', name: 'Zelle to Priya — dinner split', date: 'Jun 27', amt: -42.50 },
    ],
  },
  savings: {
    em: '···8832',
    vitals: [
      ['Balance', '$24,610.03', 'FDIC insured'],
      ['APY', '3.90%', 'variable rate'],
      ['Interest YTD', '$312.44', 'paid monthly'],
      ['Auto-save', '$500/mo', 'from 360 Checking'],
    ],
    goal: { name: 'Trip fund — Summer in Paris 🇫🇷', cur: 1920, target: 2400 },
    actions: [['↕️', 'Transfer in'], ['🎯', 'Edit trip fund'], ['🌱', 'Auto-save rules']],
    txns: [
      { icon: '✨', name: 'Interest payment — 3.90% APY', date: 'Jun 30', amt: 78.11 },
      { icon: '🌱', name: 'Auto-save from 360 Checking', date: 'Jun 28', amt: 500.00 },
      { icon: '✨', name: 'Interest payment — 3.90% APY', date: 'May 31', amt: 76.02 },
      { icon: '↕️', name: 'Transfer from 360 Checking', date: 'May 20', amt: 1000.00 },
    ],
  },
  quicksilver: {
    em: '····1189',
    vitals: [
      ['Current balance', '$0.00', 'paid in full'],
      ['Available credit', '$8,000', 'of $8,000 limit'],
      ['Cash back YTD', '$214.31', '1.5% on everything'],
      ['AutoPay', 'On', 'statement balance'],
    ],
    actions: [['💵', 'Redeem cash back'], ['🔒', 'Lock card'], ['📄', 'Statements']],
    txns: [
      { icon: '✅', name: 'AutoPay — statement paid in full', date: 'Jun 30', amt: 389.22 },
      { icon: '🎯', name: 'Target', date: 'Jun 22', amt: -64.13 },
      { icon: '📺', name: 'Netflix', date: 'Jun 18', amt: -15.49 },
      { icon: '🌯', name: 'Chipotle', date: 'Jun 12', amt: -11.85 },
      { icon: '💵', name: 'Cash back redeemed → 360 Checking', date: 'Jun 1', amt: 50.00 },
    ],
  },
};

/* ── 360 Checking is where Zelle money actually lands · never the card ── */
let checkingActivity = [...ACCT_DETAILS.checking.txns];
function checkingBal() { return ACCOUNTS.find((a) => a.key === 'checking').bal; }
function creditChecking(amount, icon, name, date) {
  const acc = ACCOUNTS.find((a) => a.key === 'checking');
  acc.bal += amount;
  checkingActivity.unshift({ icon, name, date, amt: amount });
  renderWallet();
  if (selectedAcct === 'checking' && curScreen === 'acct2') renderAcct2();
}
function debitChecking(amount, icon, name, date) { creditChecking(-amount, icon, name, date); }

function pickAccount(key) {
  if (key === 'venturex') { go('account'); return; }
  selectedAcct = key;
  go('acct2');
}

function acctSwitchHtml(active) {
  return ACCOUNTS.map((a) => a.key === active
    ? `<span class="rounded-full px-4 py-1.5 text-xs font-bold" style="background: var(--text); color: var(--bg);">${a.icon} ${a.name} ${a.num}</span>`
    : `<button onclick="pickAccount('${a.key}')" class="rounded-full px-4 py-1.5 text-xs font-bold srf mut hover:opacity-75 transition-opacity">${a.icon} ${a.name}</button>`).join('');
}
function renderAcctSwitch() {
  const box = $('acct-switch');
  if (box) box.innerHTML = acctSwitchHtml('venturex');
}

function renderAcct2() {
  const a = ACCOUNTS.find((x) => x.key === selectedAcct), d = ACCT_DETAILS[selectedAcct];
  const th = CARD_THEMES[selectedAcct];
  const vitals = selectedAcct === 'checking'
    ? [['Available balance', fmt(checkingBal()), 'no fees · no minimums'], ...d.vitals.slice(1)]
    : d.vitals;
  const activityList = selectedAcct === 'checking' ? checkingActivity : d.txns;
  $('acct2-body').innerHTML = `
    <div class="flex items-end justify-between flex-wrap gap-4">
      <div>
        <p class="microlabel acc mb-3">Account servicing</p>
        <h1 class="display-hero text-5xl sm:text-7xl">${a.name} <em>${d.em}</em></h1>
      </div>
      <button onclick="go('home')" class="text-sm font-bold mut hover:opacity-70 pb-2">← Back to home</button>
    </div>

    <div class="mt-6 flex flex-wrap gap-2">${acctSwitchHtml(selectedAcct)}</div>

    <div class="mt-6 rounded-2xl p-5 max-w-3xl" style="background:${th.bg}; color:${th.ink};">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <p class="microlabel" style="color:${th.dim};">${a.name} <span class="font-mono">${a.num}</span> · ${a.note}</p>
        <p class="text-2xl font-bold" style="font-variant-numeric:tabular-nums;">${fmt(a.bal)}</p>
      </div>
    </div>

    <div class="mt-5 grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-3xl">
      ${vitals.map(([k, v, n]) => `
        <div class="srf rounded-2xl p-5">
          <p class="microlabel fnt">${k}</p>
          <p class="text-2xl font-bold mt-1.5" style="font-variant-numeric:tabular-nums;">${v}</p>
          <p class="text-[11px] mut font-semibold mt-1">${n}</p>
        </div>`).join('')}
    </div>

    ${d.goal ? `
    <div class="mt-5 srf rounded-2xl p-5 max-w-3xl">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <p class="font-bold">${d.goal.name}</p>
        <p class="text-sm font-bold" style="font-variant-numeric:tabular-nums;">${fmt0(d.goal.cur)} <span class="mut font-medium">of ${fmt0(d.goal.target)}</span></p>
      </div>
      <div class="mt-3 h-2 rounded-full srf2 overflow-hidden">
        <div class="h-full rounded-full" style="width:${Math.round(d.goal.cur / d.goal.target * 100)}%; background: linear-gradient(90deg, var(--accent), #9fd356);"></div>
      </div>
      <p class="text-[11px] mut font-semibold mt-2">${Math.round(d.goal.cur / d.goal.target * 100)}% funded · auto-save lands the rest before Jul 12 · linked to your Venture plan</p>
    </div>` : ''}

    <div class="mt-5 flex flex-wrap gap-2.5">
      ${d.actions.map(([i, label]) => `
        <button onclick="toast('${i}','${label}','Demo action — this prototype deep-dives Venture X')"
          class="rounded-full srf text-sm font-bold px-5 py-2.5 hover:opacity-80 transition-opacity">${i} ${label}</button>`).join('')}
    </div>

    <div class="mt-8 max-w-3xl">
      <p class="microlabel fnt mb-3">Recent activity</p>
      <div class="srf rounded-3xl overflow-hidden">
        ${activityList.map((t) => `
          <div class="px-5 py-4 flex items-center gap-4 border-b last:border-b-0" style="border-color: var(--border);">
            <span class="h-10 w-10 rounded-full srf2 flex items-center justify-center text-lg shrink-0">${t.icon}</span>
            <div class="flex-1 min-w-0">
              <p class="font-bold truncate">${t.name}</p>
              <p class="text-xs mut">${t.date}</p>
            </div>
            <p class="font-bold" style="font-variant-numeric:tabular-nums; ${t.amt > 0 ? 'color:#5c8f1d;' : ''}">${t.amt > 0 ? '+' : '−'}${fmt(Math.abs(t.amt))}</p>
          </div>`).join('')}
      </div>
    </div>`;
}
