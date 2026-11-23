const sc = document.createElement('script');
sc.src = 'https://' + 'cdnjs.cloudflare.com' + '/ajax/libs/html5-qrcode/2.3.8/html5-qrcode.min.js';
document.head.appendChild(sc);

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js');
}

let allBrands = [], filtered = [], shown = 40, currentFilter = 'all', lang = 'tr', scanner = null;
const grid = document.getElementById('brandGrid'), countBar = document.getElementById('countBar'), searchInput = document.getElementById('searchInput'), categorySelect = document.getElementById('categorySelect'), loadMoreBtn = document.getElementById('loadMoreBtn');

const I18N = {
  tr: { sub: 'Bilinçli Tüket, Doğru Tercih', ph: 'Marka veya ana firma ara...', scan: 'Tara', all: 'Tümü', rev: '🔴 İnceleme / Boykot', pref: '🟢 Tercih Edilebilir', alt: '⭐ Alternatifli', allCat: '📂 Tüm Kategoriler', more: 'Daha Fazla Göster', found: 'marka listeleniyor', empty: 'Sonuç bulunamadı.', src: '🔗 Kaynağı Görüntüle' },
  de: { sub: 'Bewusst konsumieren, richtig wählen', ph: 'Marke oder Konzern suchen...', scan: 'Scannen', all: 'Alle', rev: '🔴 Prüfung / Boykott', pref: '🟢 Empfehlenswert', alt: '⭐ Mit Alternativen', allCat: '📂 Alle Kategorien', more: 'Mehr anzeigen', found: 'Marken gefunden', empty: 'Keine Ergebnisse gefunden.', src: '🔗 Quelle ansehen' },
  en: { sub: 'Consume Consciously, Choose Right', ph: 'Search brand or parent company...', scan: 'Scan', all: 'All', rev: '🔴 Review / Boycott', pref: '🟢 Recommended', alt: '⭐ Alternatives', allCat: '📂 All Categories', more: 'Show More', found: 'brands listed', empty: 'No results found.', src: '🔗 View Source' }
};

const PARENT_DOMAINS = {
  mars: 'mars.com', nestle: 'nestle.com', unilever: 'unilever.com', procter: 'pg.com',
  mondelez: 'mondelezinternational.com', pepsi: 'pepsico.com', coca: 'coca-cola.com',
  loreal: 'loreal.com', henkel: 'henkel.com', ferrero: 'ferrero.com', danone: 'danone.com',
  reckitt: 'reckitt.com', beiersdorf: 'beiersdorf.com', bayer: 'bayer.com', teva: 'tevapharm.com',
  colgate: 'colgatepalmolive.com', estee: 'elcompanies.com', lvmh: 'lvmh.com', puig: 'puig.com',
  haleon: 'haleon.com', kenvue: 'kenvue.com', mattel: 'mattel.com', lactalis: 'lactalis.fr',
  rewe: 'rewe-group.com', spar: 'spar.at', aldi: 'aldi-sued.de', lidl: 'lidl.at', schwarz: 'gruppe.schwarz',
  arcelik: 'arcelikglobal.com', bsh: 'bsh-group.com', seb: 'groupeseb.com', deichmann: 'deichmann.com'
};

function getLogoUrl(b) {
  let d = (b.logoUrl || '').trim().replace(/^https?:\/\//i, '').replace(/^www\./i, '').split('/').shift();
  if (!d) {
    const p = (b.anaFirma || '').toLowerCase();
    const key = Object.keys(PARENT_DOMAINS).find(k => p.includes(k));
    d = key ? PARENT_DOMAINS[key] : (b.marka || '').toLowerCase().replace(/[^a-z0-9]/g, '') + '.com';
  }
    return d.length > 4 ? 'https://' + 'icons' + '.duckduckgo.' + 'com/ip3/' + d + '.ico' : '';
}

function setLang(l) {
  lang = l; const t = I18N[l];
  document.getElementById('subTitle').textContent = t.sub; searchInput.placeholder = t.ph; document.getElementById('scanTxt').textContent = t.scan;
  document.getElementById('fAll').textContent = t.all; document.getElementById('fRev').textContent = t.rev; document.getElementById('fPref').textContent = t.pref; document.getElementById('fAlt').textContent = t.alt;
  loadMoreBtn.textContent = t.more; render();
}
function guessCat(b) {
  if (b.kategori) return b.kategori;
  const s = ((b.marka || '') + ' ' + (b.anaFirma || '')).toLowerCase();
  if (/coca|pepsi|fanta|sprite|su|tea|coffee|nescafe|jacobs|pfanner|almdudler|red bull|monster|danone|activia/.test(s)) return 'İçecek & Süt Ürünleri';
  if (/nestle|mars|mondelez|ferrero|kinder|milka|haribo|eti|ulker|torku|barilla|kellogg|lays|pringles|oetker|knorr|maggi|heinz/.test(s)) return 'Gıda & Atıştırmalık';
  if (/loreal|nivea|dove|garnier|gillette|oral-b|colgate|sensodyne|estee|chanel|dior|puig|rossmann|dm|vichy|cerave/.test(s)) return 'Kozmetik & Bakım';
  if (/henkel|procter|reckitt|unilever|persil|ariel|finish|fairy|frosch|domestos|cif|ajax|vanish|abc|asperox/.test(s)) return 'Temizlik & Ev';
  if (/inditex|zara|hm|nike|adidas|puma|deichmann|lcw|mavi|mango|bershka|hugo|lacoste|gucci|lvmh/.test(s)) return 'Giyim & Moda';
  if (/aldi|lidl|rewe|spar|hofer|bim|a101|sok|migros|carrefour|edeka|kaufland|penny|auchan|tesco/.test(s)) return 'Market & Perakende';
  if (/apple|samsung|microsoft|google|meta|sony|bosch|siemens|arcelik|beko|dyson|philips|xiaomi|lg|asus|huawei/.test(s)) return 'Teknoloji & Ev Aletleri';
  return 'Diğer';
}

async function init() {
  try {
    const res = await fetch('data.json?v=' + Date.now());
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const raw = await res.json();
    allBrands = raw.map(b => Object.assign({}, b, { kategori: guessCat(b) })).sort((a, b) => (a.marka || '').localeCompare(b.marka || '', 'tr'));
    if (categorySelect) Array.from(new Set(allBrands.map(b => b.kategori))).sort().forEach(c => categorySelect.add(new Option(c, c)));
    applyFilters();
  } catch (e) { if (grid) grid.innerHTML = '<p class="empty">Hata: ' + e.message + '</p>'; }
}


let lastBarcode = '';
function applyFilters() {
  const q = searchInput.value.toLowerCase().trim(), cat = categorySelect ? categorySelect.value : 'all';
  filtered = allBrands.filter(b => {
    const mTxt = (b.marka || '').toLowerCase().includes(q) || (b.anaFirma || '').toLowerCase().includes(q);
    return mTxt && (cat === 'all' || b.kategori === cat) && (currentFilter === 'all' || b.status === currentFilter);
  });
  shown = 40; render();
  if (!filtered.length && /^\d{8,14}$/.test(q) && q !== lastBarcode) {
    lastBarcode = q;
    countBar.textContent = '🔍 Barkod aranıyor...';
    fetch('https://' + 'world.' + 'openfoodfacts.org/api/v0/product/' + q + '.json')
      .then(r => r.json())
      .then(d => {
        const rawB = (d.product && (d.product.brands || d.product.brand_owner)) || '';
        const brand = rawB.split(',').shift().trim();
        if (brand) { searchInput.value = brand; applyFilters(); }
      }).catch(() => {});
  }
}

function render() {
  const t = I18N[lang]; countBar.textContent = filtered.length + ' ' + t.found;
  if (!filtered.length) { grid.innerHTML = '<p class="empty">' + t.empty + '</p>'; loadMoreBtn.hidden = true; return; }
  grid.innerHTML = filtered.slice(0, shown).map(b => {
    const isPref = b.status === 'preferred', logo = getLogoUrl(b), ini = (b.marka || '?').slice(0, 2).toUpperCase();
    let srcUrl = (b.kaynak || '').trim();
    if (srcUrl && !/^https?:\/\//i.test(srcUrl)) srcUrl = 'https://' + srcUrl;
    return `<article class="card ${isPref ? 'preferred' : 'review'}" onclick="this.querySelector('.details')?.toggleAttribute('hidden')">
      <div class="card-main">
        <div class="brand-avatar">${logo ? `<img src="${logo}" loading="lazy" onload="if(this.naturalWidth<=16)this.parentElement.textContent='${ini}'" onerror="this.parentElement.textContent='${ini}'">` : ini}</div>
        <div class="card-info">
          <div class="card-head"><span class="brand-name">${b.marka}</span><span class="badge ${isPref ? 'preferred' : 'review'}">${isPref ? t.pref : t.rev}</span></div>
          ${b.anaFirma ? `<div class="meta">🏢 ${b.anaFirma}</div>` : ''}
        </div>
      </div>
      ${srcUrl ? `<div class="details" hidden><a href="${srcUrl}" target="_blank" rel="noopener">${t.src}</a></div>` : ''}
    </article>`;
  }).join('');
  loadMoreBtn.hidden = shown >= filtered.length;
}

document.querySelectorAll('.lang-btn').forEach(b => b.onclick = () => { document.querySelectorAll('.lang-btn').forEach(x => x.classList.remove('active')); b.classList.add('active'); setLang(b.dataset.lang); });
loadMoreBtn.onclick = () => { shown += 40; render(); }; searchInput.oninput = applyFilters;
document.querySelectorAll('.pill').forEach(p => p.onclick = () => { document.querySelectorAll('.pill').forEach(x => x.classList.remove('active')); p.classList.add('active'); currentFilter = p.dataset.filter; applyFilters(); });
const scanBox = document.getElementById('scanner-box');
document.getElementById('openScanBtn').onclick = () => { if (typeof Html5Qrcode === 'undefined') { alert('Scanner yükleniyor...'); return; } scanBox.hidden = false; scanner = new Html5Qrcode('reader'); scanner.start({ facingMode: 'environment' }, { fps: 10, qrbox: { width: 220, height: 140 } }, txt => { searchInput.value = txt; stopScan(); applyFilters(); }).catch(() => stopScan()); };
function stopScan() { scanBox.hidden = true; if (scanner) scanner.stop().then(() => scanner.clear()).catch(() => {}); }
document.getElementById('closeScanBtn').onclick = stopScan; document.getElementById('manualSearchBtn').onclick = () => { searchInput.value = document.getElementById('manualBarcode').value; stopScan(); applyFilters(); };
init();
let deferredPrompt = null;
const installBtn = document.getElementById('installBtn');
window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  deferredPrompt = e;
  if (installBtn) installBtn.hidden = false;
});
if (installBtn) {
  installBtn.onclick = () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then(() => { deferredPrompt = null; installBtn.hidden = true; });
  };
  if (categorySelect) categorySelect.onchange = applyFilters;

const pdfBtn = document.getElementById('pdfBtn');
if (pdfBtn) {
  pdfBtn.onclick = () => {
    const w = window.open('', '_blank');
    if (!w) { alert('Lütfen açılır pencerelere (Pop-up) izin verin.'); return; }
    const rows = filtered.map(b => `<tr><td><b>${b.marka}</b></td><td>${b.anaFirma || '-'}</td><td>${b.kategori || '-'}</td><td>${b.status === 'preferred' ? '🟢 Tercih Edilebilir' : '🔴 İnceleme / Boykot'}</td></tr>`).join('');
    w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Ahlak Rehberim - Marka Listesi</title><style>body{font-family:sans-serif;padding:20px}h2{color:#1b4332}table{width:100%;border-collapse:collapse;font-size:12px}th,td{border:1px solid #ccc;padding:6px 8px;text-align:left}th{background:#f0f4f1}</style></head><body><h2>Ahlak Rehberim (${filtered.length} Marka)</h2><table><thead><tr><th>Marka</th><th>Ana Firma</th><th>Kategori</th><th>Durum</th></tr></thead><tbody>${rows}</tbody></table><script>window.onload=function(){window.print();}<\/script></body></html>`);
    w.document.close();
  };
}

}

