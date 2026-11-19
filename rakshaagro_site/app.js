// 1. DATA
const ROLES = {
  retailers: {
    title: 'Agro-Input Retailers & Dealers',
    pain: 'Counterfeit batches & tight seasonal working capital.',
    sol: '100% QR traceability, instant Form IX, +5–7% slab margin & 2% UPI CD.'
  },
  fpos: {
    title: 'Farmer Producer Organizations',
    pain: 'High middleman rates & lack of molecule guidance.',
    sol: 'Factory-gate bulk pricing paired with crop-stage pest calendars.'
  },
  formulators: {
    title: 'Regional & Mid-Sized Formulators',
    pain: 'High field sales cost & delayed C&F settlements.',
    sol: 'Plug-and-play access to 200+ verified dealers/hub with predictable payouts.'
  }
};

const CATALOG = [
  { id: 'CLR-185', name: 'Chlorantraniliprole 18.5% SC', cat: 'Insecticides', margin: '12%', price: 9600, pack: '10×150ml', pest: 'Bollworm, Stem Borer', cir: 'CIR-9(4)-8841' },
  { id: 'EMB-005', name: 'Emamectin Benzoate 5% SG', cat: 'Insecticides', margin: '14%', price: 7200, pack: '20×250g', pest: 'Fall Armyworm', cir: 'CIR-9(4)-4412' },
  { id: 'THM-025', name: 'Thiamethoxam 25% WG', cat: 'Insecticides', margin: '10%', price: 6400, pack: '20×250g', pest: 'BPH, Aphids', cir: 'CIR-9(3)-7109' },
  { id: 'BSP-010', name: 'Bispyribac Sodium 10% SC', cat: 'Herbicides', margin: '15%', price: 8400, pack: '20×200ml', pest: 'Paddy Weeds', cir: 'CIR-9(4)-3320' },
  { id: 'PND-030', name: 'Pendimethalin 30% EC', cat: 'Herbicides', margin: '11%', price: 5800, pack: '10×1L', pest: 'Pre-emergence Wheat', cir: 'CIR-9(4)-9180' },
  { id: 'CLD-015', name: 'Clodinafop-Propargyl 15% WP', cat: 'Herbicides', margin: '16%', price: 6200, pack: '25×160g', pest: 'Phalaris Minor', cir: 'CIR-9(4)-5501' },
  { id: 'AZX-023', name: 'Azoxystrobin 23% SC', cat: 'Fungicides', margin: '16%', price: 11200, pack: '10×500ml', pest: 'Blast, Sheath Blight', cir: 'CIR-9(4)-6012' },
  { id: 'TBC-025', name: 'Tebuconazole 25.9% EC', cat: 'Fungicides', margin: '14%', price: 7800, pack: '10×500ml', pest: 'Yellow Rust, Mildew', cir: 'CIR-9(4)-2287' },
  { id: 'CBM-075', name: 'Carbendazim + Mancozeb', cat: 'Fungicides', margin: '13%', price: 5400, pack: '20×500g', pest: 'Leaf Blight', cir: 'CIR-9(4)-1904' },
  { id: 'NEM-150', name: 'Neem Oil (Azadirachtin)', cat: 'Bio-Pesticides & PGRs', margin: '28%', price: 4800, pack: '10×1L', pest: 'Whitefly (Bio)', cir: 'CIR-9(3B)-1102' },
  { id: 'TRC-001', name: 'Trichoderma Viride 1.5% WP', cat: 'Bio-Pesticides & PGRs', margin: '32%', price: 3600, pack: '20×1kg', pest: 'Root Rot (Bio)', cir: 'CIR-9(3B)-7740' },
  { id: 'GBA-001', name: 'Gibberellic Acid + Humic PGR', cat: 'Bio-Pesticides & PGRs', margin: '34%', price: 5200, pack: '20×500ml', pest: 'Yield Booster', cir: 'CIR-9(4)-8831' }
];

const QR_DB = {
  'RA-CLR-2026-884': { name: 'Chlorantraniliprole 18.5% SC', gtin: '8904123400884', exp: 'Sep 2028', cir: 'CIR-9(4)-8841', note: 'Wash skin with soap & water.' },
  'RA-AZX-2026-319': { name: 'Azoxystrobin 23% SC', gtin: '8904123400319', exp: 'Aug 2028', cir: 'CIR-9(4)-6012', note: 'Symptomatic care; do not induce vomiting.' },
  'RA-NEEM-2026-102': { name: 'Neem Oil (Azadirachtin)', gtin: '8904123400102', exp: 'Oct 2028', cir: 'CIR-9(3B)-1102', note: 'Non-toxic botanical; rinse with clean water.' }
};

// 2. STATE & HELPERS
const $ = id => document.getElementById(id);
const $$ = sel => document.querySelectorAll(sel);
let state = { view: 'storefront', lang: 'en', role: 'retailers', cat: 'All', q: '', pay: 'upi', cart: [{ id: 'CLR-185', qty: 1 }, { id: 'NEM-150', qty: 1 }] };
let chartsReady = false, mixChart = null, marginChart = null, toastTimer = null;

function toast(msg) {
  $('toast').textContent = msg;
  $('toast').classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $('toast').classList.add('hidden'), 2400);
}

// 3. NAVIGATION
function switchView(view) {
  state.view = view;
  $$('.app-view').forEach(el => el.classList.add('hidden'));
  $(`view-${view}`).classList.remove('hidden');
  $$('.nav-btn').forEach(b => b.classList.toggle('bg-shield', b.dataset.view === view) || b.classList.toggle('text-white', b.dataset.view === view));
  $$('.mob-btn').forEach(b => b.classList.toggle('text-shield', b.dataset.view === view));
  toggleSidebar(false);
  if (view === 'overview') initCharts();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function toggleSidebar(open) {
  $('appSidebar').classList.toggle('-translate-x-full', !open);
  $('sidebarBackdrop').classList.toggle('hidden', !open);
}

// 4. RENDER FUNCTIONS
function renderRole() {
  const r = ROLES[state.role];
  $$('.role-btn').forEach(b => {
    const on = b.dataset.role === state.role;
    b.className = `role-btn px-3 py-1.5 rounded-lg text-xs font-bold ${on ? 'bg-shield text-white' : 'bg-paper border text-slate-700'}`;
  });
  $('stakeholderCard').innerHTML = `
    <div class="p-3.5 rounded-xl bg-rose-50 border border-rose-200"><strong class="block text-rose-800 mb-1">${r.title} — Pain</strong>${r.pain}</div>
    <div class="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200"><strong class="block text-shield mb-1">RakshaAgro Solution</strong>${r.sol}</div>`;
}

function renderCatalog() {
  const q = state.q.toLowerCase();
  const items = CATALOG.filter(i => (state.cat === 'All' || i.cat === state.cat) && (!q || i.name.toLowerCase().includes(q) || i.pest.toLowerCase().includes(q)));
  $('catalogGrid').innerHTML = items.length ? items.map(i => `
    <div class="card p-4 flex flex-col justify-between">
      <div>
        <div class="flex justify-between text-[10px] font-mono mb-1.5">
          <span class="px-2 py-0.5 rounded bg-slate-100 font-bold">${i.cat}</span>
          <span class="px-2 py-0.5 rounded bg-amber-50 text-amberx font-bold">${i.margin} Margin</span>
        </div>
        <div class="font-bold text-sm">${i.name}</div>
        <div class="text-xs text-slate-500 mt-0.5">${i.pest} • ${i.pack}</div>
      </div>
      <div class="mt-3 pt-3 border-t flex justify-between items-center">
        <span class="font-mono font-bold">₹${i.price.toLocaleString('en-IN')}</span>
        <button type="button" onclick="addCart('${i.id}')" class="px-3 py-1.5 rounded-lg bg-slatex hover:bg-shield text-white text-xs font-bold">+ Add</button>
      </div>
    </div>`).join('') : '<div class="col-span-full text-center py-8 text-xs text-slate-500">No matching SKUs.</div>';
}

window.addCart = id => {
  const item = state.cart.find(c => c.id === id);
  item ? item.qty++ : state.cart.push({ id, qty: 1 });
  renderCart();
  toast('Added to Order Sheet');
};

window.stepCart = (id, d) => {
  const item = state.cart.find(c => c.id === id);
  if (!item) return;
  item.qty += d;
  if (item.qty <= 0) state.cart = state.cart.filter(c => c.id !== id);
  renderCart();
};

function renderCart() {
  const count = state.cart.reduce((s, c) => s + c.qty, 0);
  ['sidebarCartBadge', 'topCartCount', 'drawerCartCount', 'mobCartBadge'].forEach(id => $(id).textContent = count);

  let bio = 0, chem = 0, sub = 0;
  state.cart.forEach(c => {
    const p = CATALOG.find(x => x.id === c.id);
    if (!p) return;
    sub += p.price * c.qty;
    p.cat.includes('Bio') ? bio += c.qty : chem += c.qty;
  });

  $('bundleBar').innerHTML = `<strong class="${bio && chem ? 'text-shield' : 'text-amberx'}">${bio && chem ? '✓ BIO-BUNDLE ACTIVE' : 'BUNDLE TIP'}:</strong> ${bio} Bio + ${chem} Chemical SKUs in cart.`;
  const pct = Math.min(100, Math.round((sub / 15000) * 100));
  $('deliveryBar').style.width = `${pct}%`;
  $('deliveryPct').textContent = `${pct}%`;
  $('deliveryText').textContent = sub >= 15000 ? '✓ Free 48h delivery unlocked!' : `Add ₹${(15000 - sub).toLocaleString('en-IN')} for free delivery`;

  $('cartList').innerHTML = state.cart.length ? state.cart.map(c => {
    const p = CATALOG.find(x => x.id === c.id);
    return `<div class="p-2.5 rounded-xl border bg-paper flex justify-between items-center text-xs">
      <div class="truncate pr-2"><strong>${p.name}</strong><div class="font-mono text-slate-500">₹${p.price.toLocaleString('en-IN')}</div></div>
      <div class="flex items-center gap-1 shrink-0">
        <button type="button" onclick="stepCart('${p.id}',-1)" class="w-6 h-6 border rounded bg-white font-bold">−</button>
        <span class="w-5 text-center font-mono font-bold">${c.qty}</span>
        <button type="button" onclick="stepCart('${p.id}',1)" class="w-6 h-6 border rounded bg-white font-bold">+</button>
      </div></div>`;
  }).join('') : '<div class="text-center py-6 text-xs text-slate-500">Order sheet is empty.</div>';

  const cd = state.pay === 'upi' ? Math.round(sub * 0.02) : 0;
  $('cartSummary').innerHTML = `
    <div class="flex justify-between"><span>Gross</span><span class="font-mono">₹${sub.toLocaleString('en-IN')}</span></div>
    <div class="flex justify-between text-shield"><span>2% UPI CD</span><span class="font-mono">−₹${cd.toLocaleString('en-IN')}</span></div>
    <div class="flex justify-between font-bold text-sm pt-1 border-t"><span>Net Payable</span><span class="font-mono">₹${(sub - cd).toLocaleString('en-IN')}</span></div>`;
  $('checkoutBtn').disabled = $('copyWaBtn').disabled = !state.cart.length;
}

function renderQr(code) {
  const k = code.trim().toUpperCase(), r = QR_DB[k];
  $('qrResultBox').innerHTML = r
    ? `<div class="font-mono text-xs font-bold text-shield mb-2">✓ VERIFIED • ${k}</div><div class="text-sm font-bold">${r.name}</div><div class="text-xs font-mono text-slate-500 mt-1">GTIN: ${r.gtin} • CIR: ${r.cir} • Exp: ${r.exp}</div><div class="mt-3 p-2.5 rounded bg-amber-50 text-xs"><strong>Antidote:</strong> ${r.note}</div>`
    : `<div class="font-mono text-xs font-bold text-rose-700">✕ SPURIOUS ALERT • ${k || 'EMPTY'}</div><p class="text-xs text-slate-600 mt-1">Batch not found in CIB&amp;RC audited ledger.</p>`;
}

function renderFormIX() {
  $('formIXPreview').innerHTML = `
    <div class="border-b-2 border-slatex pb-2 mb-3 flex justify-between items-center">
      <div><div class="font-mono text-[10px] text-slate-500">RULE 10(4A)</div><h3 class="font-serif text-lg font-bold">FORM IX — Principal Certificate</h3></div>
      <span class="px-2 py-0.5 border border-shield text-shield font-mono text-[10px] font-bold">ENDORSED</span>
    </div>
    <div class="space-y-2 text-xs">
      <div class="flex justify-between"><span>Dealer:</span><strong>${$('kycShop').value}</strong></div>
      <div class="flex justify-between"><span>Territory:</span><strong>${$('kycDistrict').value}</strong></div>
      <div class="flex justify-between"><span>Form VIII:</span><strong class="font-mono">${$('kycLicense').value}</strong></div>
      <div class="flex justify-between"><span>GSTIN:</span><strong class="font-mono">${$('kycGst').value}</strong></div>
    </div>`;
}

function initCharts() {
  if (typeof Chart === 'undefined') return;
  if (chartsReady) { mixChart?.resize(); marginChart?.resize(); return; }
  chartsReady = true;
  mixChart = new Chart($('mixChart'), {
    type: 'bar',
    data: { labels: ['Insecticides', 'Herbicides', 'Fungicides', 'Bio & PGRs'], datasets: [{ label: 'Share %', data: [40, 25, 20, 15], backgroundColor: '#1E293B' }, { label: 'Margin %', data: [11, 13, 15, 28.5], backgroundColor: '#14452F' }] },
    options: { responsive: true, maintainAspectRatio: false }
  });
  marginChart = new Chart($('marginChart'), {
    type: 'bar',
    data: { labels: ['Traditional 3-Tier', 'RakshaAgro Direct'], datasets: [{ label: 'Profit (₹)', data: [1950, 3500], backgroundColor: ['#94A3B8', '#D97706'] }] },
    options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
  });
}

// 5. EVENT WIRING & INIT
$$('.nav-btn, .mob-btn').forEach(b => b.addEventListener('click', () => switchView(b.dataset.view)));
$('topOrderBtn').addEventListener('click', () => switchView('marketplace'));
$('openSidebarBtn').addEventListener('click', () => toggleSidebar(true));
$('closeSidebarBtn').addEventListener('click', () => toggleSidebar(false));
$('sidebarBackdrop').addEventListener('click', () => toggleSidebar(false));

['hubSelector', 'mobileHubSelector'].forEach(id => $(id).addEventListener('change', e => {
  $('hubSelector').value = $('mobileHubSelector').value = $('sidebarHubName').textContent = $('alertHubText').textContent = e.target.value;
  toast(`Hub: ${e.target.value}`);
}));

$('langToggleBtn').addEventListener('click', e => {
  state.lang = state.lang === 'en' ? 'hi' : 'en';
  e.target.textContent = state.lang === 'hi' ? 'हिं ✓' : 'EN / हिं';
  $('storefrontHeadline').innerHTML = state.lang === 'hi'
    ? 'असली सुरक्षा, <span class="text-shield underline decoration-amberx decoration-4">मंडी स्पीड</span> पर सीधी डिलीवरी।'
    : 'Verified Crop Protection, Delivered at <span class="text-shield underline decoration-amberx decoration-4">Mandi Speed.</span>';
  toast(state.lang === 'hi' ? 'भाषा हिंदी में बदली गई' : 'Language: English');
});

$$('.role-btn').forEach(b => b.addEventListener('click', () => { state.role = b.dataset.role; renderRole(); }));
$$('.cat-btn').forEach(b => b.addEventListener('click', () => {
  state.cat = b.dataset.cat;
  $$('.cat-btn').forEach(x => x.className = `cat-btn px-3 py-1.5 rounded-lg text-xs font-bold ${x.dataset.cat === state.cat ? 'bg-shield text-white' : 'bg-paper border'}`);
  renderCatalog();
}));
$('catalogSearch').addEventListener('input', e => { state.q = e.target.value; renderCatalog(); });

$$('.pay-btn').forEach(b => b.addEventListener('click', () => {
  state.pay = b.dataset.pay;
  $$('.pay-btn').forEach(x => x.className = `pay-btn py-2 rounded-lg text-xs font-bold ${x.dataset.pay === state.pay ? 'bg-shield text-white' : 'bg-white border'}`);
  renderCart();
}));

$('copyWaBtn').addEventListener('click', () => {
  const txt = `*RakshaAgro Order (${$('hubSelector').value})*\n` + state.cart.map(c => `• ${CATALOG.find(x => x.id === c.id).name} x ${c.qty}`).join('\n');
  navigator.clipboard?.writeText(txt).catch(() => {});
  toast('WhatsApp order copied!');
});

$('checkoutBtn').addEventListener('click', () => { $('orderModal').classList.remove('hidden'); state.cart = []; renderCart(); });
$('closeModalBtn').addEventListener('click', () => $('orderModal').classList.add('hidden'));
$('verifyQrBtn').addEventListener('click', () => renderQr($('qrInput').value));
$$('.sample-qr').forEach(b => b.addEventListener('click', () => { $('qrInput').value = b.dataset.code; renderQr(b.dataset.code); }));
$('kycForm').addEventListener('submit', e => { e.preventDefault(); renderFormIX(); toast('Form IX updated'); });
$('printBtn').addEventListener('click', () => window.print());

renderRole(); renderCatalog(); renderCart(); renderQr('RA-CLR-2026-884'); renderFormIX();
