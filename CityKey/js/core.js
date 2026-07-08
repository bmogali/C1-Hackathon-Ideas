/* ═══ VENTURE KEY · app shell — navigation, theming, toasts, fx ═══ */

/* ── night sky ── */
(function stars() {
  const box = $('stars');
  for (let i = 0; i < 70; i++) {
    const s = document.createElement('i');
    s.style.left = Math.random() * 100 + 'vw';
    s.style.top = Math.random() * 60 + 'vh';
    s.style.animationDelay = Math.random() * 3 + 's';
    s.style.transform = `scale(${.5 + Math.random() * 1.4})`;
    box.appendChild(s);
  }
})();

/* ── navigation ── */
const SCREENS = ['home', 'account', 'acct2', 'plan', 'live', 'wrap'];
const ORDER = ['home', 'plan', 'live', 'wrap'];
function go(name) {
  if (name === 'wrap' && !(liveTrip && tripState[liveTrip].settled)) return;
  curScreen = name;
  SCREENS.forEach((s) => $('screen-' + s).classList.toggle('on', s === name));
  document.querySelectorAll('#stepper .step').forEach((b) => {
    const s = b.dataset.step;
    b.classList.toggle('now', s === name);
    b.classList.toggle('done', ORDER.indexOf(name) > -1 && ORDER.indexOf(s) > -1 && ORDER.indexOf(s) < ORDER.indexOf(name));
  });
  $('nav-account').style.outline = (name === 'account' || name === 'acct2') ? '2px solid var(--accent)' : 'none';
  $('vb-btn').classList.toggle('hidden', !(name === 'plan' || name === 'live'));
  if (!(name === 'plan' || name === 'live')) closeVB();
  if (name === 'live') { renderLiveHeader(); if (liveTrip) requestAnimationFrame(computeFill); }
  if (name === 'account') { renderTxns(); renderAcctSwitch(); }
  if (name === 'acct2') renderAcct2();
  if (name === 'plan') renderPlan();
  if (name === 'wrap') runWrap();
}

/* ── toast ── */
let toastTimer;
function toast(icon, title, sub, tone = 'light') {
  const t = $('toast');
  const styles = tone === 'brand'
    ? 'background: linear-gradient(120deg,#013d5b,#0276b1); color:#fff; border:1px solid rgba(55,214,234,.4);'
    : tone === 'vb'
    ? 'background:#0b0a0f; color:#f0e6cd; border:1px solid rgba(212,175,55,.55);'
    : 'background: var(--surface); color: var(--text); border:1px solid var(--border); backdrop-filter: blur(12px);';
  t.innerHTML = `
    <div class="anim-toast rounded-2xl shadow-2xl px-4 py-3.5 flex items-center gap-3" style="${styles}">
      <span class="text-2xl">${icon}</span>
      <div class="min-w-0">
        <p class="text-sm font-bold leading-tight">${title}</p>
        <p class="text-xs opacity-75 leading-snug mt-0.5">${sub}</p>
      </div>
    </div>`;
  t.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.add('hidden'), 3800);
}

function logEvent(payload, verdict) {
  $('event-log').innerHTML = JSON.stringify(payload) +
    ` <span class="text-white/30">→</span> <span class="${verdict.color}">${verdict.text}</span>`;
}

function countUp(id, target, format) {
  const el = $(id), t0 = performance.now(), dur = 1400;
  (function tick(t) {
    const p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
    el.textContent = format(target * e);
    if (p < 1) requestAnimationFrame(tick);
  })(t0);
}

/* ── confetti ── */
function spawnConfetti(count = 36) {
  const colors = ['#37d6ea', '#9fd356', '#cc2427', '#ffffff', '#f4a259', '#f6c344'];
  for (let i = 0; i < count; i++) {
    const c = document.createElement('span');
    c.className = 'confetti';
    c.style.left = Math.random() * 100 + 'vw';
    c.style.width = 5 + Math.random() * 7 + 'px';
    c.style.height = 8 + Math.random() * 9 + 'px';
    c.style.background = colors[i % colors.length];
    c.style.animationDuration = 1.8 + Math.random() * 1.8 + 's';
    c.style.animationDelay = Math.random() * 0.8 + 's';
    document.body.appendChild(c);
    setTimeout(() => c.remove(), 4500);
  }
}
