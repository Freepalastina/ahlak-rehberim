const sc = document.createElement('script');
sc.src = 'https://' + 'cdnjs.cloudflare.com' + '/ajax/libs/html5-qrcode/2.3.8/html5-qrcode.min.js';
document.head.appendChild(sc);

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js');
}

let allBrands = [], filtered = [], shown = 40, currentFilter = 'all', lang = 'tr', scanner = null;
const grid = document.getElementById('brandGrid'), countBar = document.getElementById('countBar'), searchInput = document.getElementById('searchInput'), categorySelect = document.getElementById('categorySelect'), loadMoreBtn = document.getElementById('loadMoreBtn');

const I18N = {
  tr: { sub: 'Bilinçli Tüket, Doğru Tercih', ph: 'Marka, ana firma veya barkod...', scan: 'Tara', all: 'Tümü', rev: '🟡 İnceleme Önerisi', pref: '🟢 Yerel / Alternatif', alt: '⭐ Alternatifli', allCat: '📂 Tüm Kategoriler', more: 'Daha Fazla Göster', found: 'marka listeleniyor', empty: 'Sonuç bulunamadı.', altLbl: 'Alternatifler:', src: '🔗 Kaynağı İncele' },
  de: { sub: 'Bewusst konsumieren, richtig wählen', ph: 'Marke, Mutterkonzern oder Barcode...', scan: 'Scannen', all: 'Alle', rev: '🟡 Prüfhinweis', pref: '🟢 Alternative / Regional', alt: '⭐ Mit Alternativen', allCat: '📂 Alle Kategorien', more: 'Mehr anzeigen', found: 'Marken gefunden', empty: 'Keine Ergebnisse gefunden.', altLbl: 'Alternativen:', src: '🔗 Quelle ansehen' },
  en: { sub: 'Consume Consciously, Choose Right', ph: 'Search brand, parent company or barcode...', scan: 'Scan', all: 'All', rev: '🟡 Review Note', pref: '🟢 Regional / Alternative', alt: '⭐ Alternatives', allCat: '📂 All Categories', more: 'Show More', found: 'brands listed', empty: 'No results found.', altLbl: 'Alternatives:', src: '🔗 View Source' }
};

function getLogoUrl(b) {
  let d = (b.logoUrl || '').trim().replace(/^https?:\/\//i, '').replace(/^www\./i, '').split('/').shift();
  if (!d || /^5gum\.com$/i.test(d)) {
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
const SMART_ALTS = [
  { test: /a101|carrefour|aldi|lidl|rewe|billa|penny|tesco|auchan|walmart|edenred|sodexo/i, tr: 'BİM, ŞOK, Migros, Tarım Kredi', eu: 'Hofer / Aldi Süd, SPAR, DM, Rossmann, Denn’s BioMarkt' },
  { test: /5gum|orbit|mentos|vivident|falım|haribo|mars|snickers|twix|milka|kitkat|oreo|5star|7days|kinder|ferrero|nutella/i, tr: 'Torku, Eti, Ülker, Şölen', eu: 'Manner, Zotter, Ritter Sport, Katjes, Alnatura' },
  { test: /coca|pepsi|fanta|sprite|7up|lipton|nescafe|jacobs|starbucks|red bull|monster|danone|activia|actimel/i, tr: 'Uludağ, Çaykur, Beypazarı, Niğde Gazozu, Kızılay', eu: 'Almdudler, Rauch, Vöslauer, Fritz-Kola, Ja! Natürlich' },
  { test: /ariel|persil|omo|tide|finish|fairy|domestos|cif|ajax|vanish|henkel|reckitt|lenor|calgon/i, tr: 'ABC, Boron, Bingo, Asperox, Duru', eu: 'Frosch, Claro, Denkmit (DM), Ecover, Sonett' },
  { test: /loreal|garnier|nivea|dove|head|pantene|elidor|gillette|oral-b|colgate|sensodyne|rexona|axe|8x4|cerave|vichy/i, tr: 'Duru, Arko, Eyüp Sabri Tuncer, Otacı, Bebak', eu: 'Balea (DM), Alverde, Alterra (Rossmann), Weleda, Lavera' },
  { test: /zara|bershka|pull|stradivarius|mango|hm|nike|adidas|puma|reebok|lcw|defacto|levi|hugo|lacoste/i, tr: 'Koton, Mavi, Kiğılı, Sarar, DeFacto', eu: 'Armedangels, Hessnatur, Trigema, C&A' },
  { test: /apple|samsung|microsoft|google|hp|dell|lenovo|asus|intel|siemens|bosch|dyson|philips|braun|oral/i, tr: 'Arçelik, Beko, Vestel, Grundig', eu: 'Miele, Grundig, Kärcher, Fairphone' }
];

async function init() {
  try {
    const res = await fetch('data.json?v=' + Date.now());
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const raw = await res.json();
    allBrands = raw.map(b => Object.assign({}, b, { kategori: guessCat(b) })).sort((a, b) => (a.marka || '').localeCompare(b.marka || '', 'tr'));
        allBrands.forEach(b => {
      if (b.status === 'preferred') return;
      const txt = (b.marka || '') + ' ' + (b.anaFirma || '');
      const match = SMART_ALTS.find(s => s.test.test(txt));
      if (match) { b.altsTr = match.tr; b.altsEu = match.eu; }
    });

    if (categorySelect) Array.from(new Set(allBrands.map(b => b.kategori))).sort().forEach(c => categorySelect.add(new Option(c, c)));
    applyFilters();
  } catch (e) { if (grid) grid.innerHTML = '<p class="empty">Hata: ' + e.message + '</p>'; }
}

let lastBarcode = '';
function applyFilters() {
  const q = searchInput.value.toLowerCase().trim(), cat = categorySelect ? categorySelect.value : 'all';
  filtered = allBrands.filter(b => {
    const mTxt = (b.marka || '').toLowerCase().includes(q) || (b.anaFirma || '').toLowerCase().includes(q);
    const hasAlt = Boolean(b.altsTr || b.altsEu); 
    return mTxt && (cat === 'all' || b.kategori === cat) && (currentFilter === 'all' || b.status === currentFilter || (currentFilter === 'alt' && hasAlt));
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
    const alts = (lang === 'tr' ? b.altsTr : b.altsEu) || '';
    const meta = [b.anaFirma ? '🏢 ' + b.anaFirma : '', b.kategori].filter(Boolean).join(' • ');
    let srcUrl = (b.kaynak || '').trim();
    if (srcUrl && !/^https?:\/\//i.test(srcUrl)) srcUrl = 'https://' + srcUrl;
    return `<article class="card ${isPref ? 'preferred' : 'review'}" onclick="this.querySelector('.details')?.toggleAttribute('hidden')"><div class="card-main"><div class="brand-avatar">${logo ? `<img src="${logo}" loading="lazy" onload="if(this.naturalWidth<=16||this.naturalWidth===64)this.parentElement.textContent='${ini}'"
 ${isPref ? 'preferred' : 'review'}">${isPref ? t.pref : t.rev}</span></div>${meta ? `<div class="meta">${meta}</div>` : ''}</div></div>${alts ? `<div class="alt">⭐ <b>${t.altLbl}</b> ${alts}</div>` : ''}${srcUrl ? `<div class="details" hidden><a href="${srcUrl}" target="_blank" rel="noopener">${t.src}</a></div>` : ''}</article>`;
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
    const rows = filtered.map(b => `<tr><td><b>${b.marka}</b></td><td>${b.anaFirma || '-'}</td><td>${b.kategori || '-'}</td><td>${b.status === 'preferred' ? '🟢 Tercih Edilebilir' : '🔴 İnceleme / Boykot'}</td></tr>`).join('');
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Ahlak Rehberim</title><style>body{font-family:sans-serif;padding:20px}h2{color:#1b4332}table{width:100%;border-collapse:collapse;font-size:12px}th,td{border:1px solid #ccc;padding:6px 8px;text-align:left}th{background:#f0f4f1}</style></head><body><h2>Ahlak Rehberim (${filtered.length} Marka)</h2><table><thead><tr><th>Marka</th><th>Ana Firma</th><th>Kategori</th><th>Durum</th></tr></thead><tbody>${rows}</tbody></table></body></html>`;
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'Ahlak-Rehberim-Liste.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
}

}

