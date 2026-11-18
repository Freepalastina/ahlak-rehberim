let allBrands = [], filtered = [], shown = 40, currentFilter = 'all', lang = 'tr', scanner = null;
const grid = document.getElementById('brandGrid'), countBar = document.getElementById('countBar'), searchInput = document.getElementById('searchInput'), categorySelect = document.getElementById('categorySelect'), loadMoreBtn = document.getElementById('loadMoreBtn');

const I18N = {
  tr: { sub: 'Bilinçli Tüket, Doğru Tercih', ph: 'Marka, ana firma veya barkod...', scan: 'Tara', all: 'Tümü', rev: '🔴 İnceleme / Boykot', pref: '🟢 Tercih Edilebilir', alt: '⭐ Alternatifli', allCat: '📂 Tüm Kategoriler', more: 'Daha Fazla Göster', found: 'marka listeleniyor', empty: 'Sonuç bulunamadı.', altLbl: 'Alternatifler:', src: '🔗 Kaynağı Görüntüle' },
  de: { sub: 'Bewusst konsumieren, richtig wählen', ph: 'Marke, Mutterkonzern oder Barcode...', scan: 'Scannen', all: 'Alle', rev: '🔴 Prüfung / Boykott', pref: '🟢 Empfehlenswert', alt: '⭐ Mit Alternativen', allCat: '📂 Alle Kategorien', more: 'Mehr anzeigen', found: 'Marken gefunden', empty: 'Keine Ergebnisse gefunden.', altLbl: 'Alternativen:', src: '🔗 Quelle ansehen' },
  en: { sub: 'Consume Consciously, Choose Right', ph: 'Search brand, parent company or barcode...', scan: 'Scan', all: 'All', rev: '🔴 Review / Boycott', pref: '🟢 Recommended', alt: '⭐ Alternatives', allCat: '📂 All Categories', more: 'Show More', found: 'brands listed', empty: 'No results found.', altLbl: 'Alternatives:', src: '🔗 View Source' }
};

const DOMAIN_HINTS = {
  a101: 'a101.com.tr', aarealbank: 'aareal-bank.com', aboutyou: 'aboutyou.de', abtei: 'abtei.de', adidas: 'adidas.com', nike: 'nike.com', puma: 'puma.com', zara: 'zara.com', hm: 'hm.com', apple: 'apple.com', microsoft: 'microsoft.com', google: 'google.com', amazon: 'amazon.com', starbucks: 'starbucks.com', mcdonalds: 'mcdonalds.com', burgerking: 'burgerking.de', kfc: 'kfc.com', cocacola: 'coca-cola.com', pepsi: 'pepsi.com', fanta: 'fanta.com', sprite: 'sprite.com', nestle: 'nestle.com', nescafe: 'nescafe.com', nesquik: 'nesquik.com', kitkat: 'kitkat.com', nutella: 'nutella.com', kinder: 'kinder.com', milka: 'milka.de', oreo: 'oreo.com', nivea: 'nivea.de', dove: 'dove.com', loreal: 'loreal.com', garnier: 'garnier.de', ariel: 'ariel.de', persil: 'persil.de', fairy: 'fairy-dish.co.uk', domestos: 'domestos.com', bosch: 'bosch.com', siemens: 'siemens.com', miele: 'miele.de', samsung: 'samsung.com', ulker: 'ulker.com.tr', eti: 'etietieti.com', torku: 'torku.com.tr', sutas: 'sutas.com.tr', pinar: 'pinar.com.tr', bingo: 'bingo.com.tr', frosch: 'frosch.de', haribo: 'haribo.com', '8x4': '8x4.de', niveamen: 'nivea.de', colgate: 'colgate.com', palmolive: 'palmolive.com'
};

const norm = s => (s || '').toLowerCase().replace(/ı/g, 'i').replace(/×/g, 'x').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');

function getLogoUrl(b) {
  if (b.logoUrl || b.image_url) return b.logoUrl || b.image_url;
  const k = norm(b.marka);
  let host = DOMAIN_HINTS[k] || '';
  if (!host && Array.isArray(b.kaynaklar)) {
    const src = b.kaynaklar.find(x => x && x.url);
    if (src) {
      try {
        const h = new URL(src.url.split(',').at(0).trim()).hostname.replace(/^www\./, '');
        if (!['wikipedia.org', 'linkedin.com', 'timesofisrael.com', 'jpost.com', 'tag24.de'].some(d => h.includes(d))) host = h;
      } catch {}
    }
  }
  if (!host && k.length >= 3) host = `${k}.com`;
  return host ? `https://clearbit.com{host}` : '';
}

function setLang(l) {
  lang = l; const t = I18N[l];
  document.getElementById('subTitle').textContent = t.sub; searchInput.placeholder = t.ph; document.getElementById('scanTxt').textContent = t.scan;
  document.getElementById('fAll').textContent = t.all; document.getElementById('fRev').textContent = t.rev; document.getElementById('fPref').textContent = t.pref; document.getElementById('fAlt').textContent = t.alt;
  if (categorySelect.options.length > 0) categorySelect.options.item(0).textContent = t.allCat;
  loadMoreBtn.textContent = t.more; render();
}

async function init() {
  try {
    const res = await fetch('data.json?v=' + Date.now());
    const raw = await res.json();
    allBrands = raw.filter(b => norm(b.marka) !== 'action').sort((a, b) => a.marka.localeCompare(b.marka, 'tr'));
    [...new Set(allBrands.map(b => b.kategori).filter(Boolean))].sort().forEach(c => categorySelect.add(new Option(c, c)));
    applyFilters();
  } catch { grid.innerHTML = '<p class="empty">Veriler yüklenemedi.</p>'; }
}

function applyFilters() {
  const q = searchInput.value.toLowerCase().trim(), cat = categorySelect.value;
  filtered = allBrands.filter(b => {
    const mTxt = b.marka.toLowerCase().includes(q) || (b.anaFirma || '').toLowerCase().includes(q) || (b.barkodlar || []).some(c => String(c).includes(q));
    const mCat = cat === 'all' || b.kategori === cat;
    const hasAlt = Array.isArray(b.alternatifler) && b.alternatifler.some(a => norm(a.marka) !== norm(b.marka));
    return mTxt && mCat && (currentFilter === 'all' || b.status === currentFilter || (currentFilter === 'alt' && hasAlt));
  });
  shown = 40; render();
}

function render() {
  const t = I18N[lang];
  countBar.textContent = `${filtered.length} ${t.found}`;
  if (!filtered.length) { grid.innerHTML = `<p class="empty">${t.empty}</p>`; loadMoreBtn.hidden = true; return; }
  grid.innerHTML = filtered.slice(0, shown).map(b => {
    const isPref = b.status === 'preferred', logo = getLogoUrl(b), initials = b.marka.slice(0, 2).toUpperCase();
    const alts = (b.alternatifler || []).map(a => a.marka).filter(m => m && norm(m) !== norm(b.marka)).join(', ');
    const meta = [b.anaFirma ? `🏢 ${b.anaFirma}` : '', b.kategori, b.altKategori].filter(Boolean).join(' • ');
    const firstSrc = Array.isArray(b.kaynaklar) ? b.kaynaklar.find(k => k && k.url) : null;
    const fb = `if(!this.dataset.f){this.dataset.f=1;this.src='https://google.com{logo.replace('https://clearbit.com','')}&sz=128';}else{this.parentElement.textContent='${initials}';}`;
    return `<article class="card ${isPref ? 'preferred' : 'review'}" onclick="this.querySelector('.details')?.toggleAttribute('hidden')">
      <div class="card-main">
        <div class="brand-avatar">${logo ? `<img src="${logo}" alt="" loading="lazy" onerror="${fb}">` : initials}</div>
        <div class="card-info">
          <div class="card-head"><span class="brand-name">${b.marka}</span><span class="badge ${isPref ? 'preferred' : 'review'}">${isPref ? t.pref : t.rev}</span></div>
          ${meta ? `<div class="meta">${meta}</div>` : ''}
        </div>
      </div>
      ${alts ? `<div class="alt">⭐ <b>${t.altLbl}</b> ${alts}</div>` : ''}
      ${(b.not || firstSrc) ? `<div class="details" hidden>${b.not ? `<p>${b.not}</p>` : ''}${firstSrc ? `<a href="${firstSrc.url.split(',').at(0).trim()}" target="_blank" rel="noopener">${t.src}</a>` : ''}</div>` : ''}
    </article>`;
  }).join('');
  loadMoreBtn.hidden = shown >= filtered.length;
}

document.querySelectorAll('.lang-btn').forEach(b => b.onclick = () => { document.querySelectorAll('.lang-btn').forEach(x => x.classList.remove('active')); b.classList.add('active'); setLang(b.dataset.lang); });
loadMoreBtn.onclick = () => { shown += 40; render(); };
searchInput.oninput = applyFilters; categorySelect.onchange = applyFilters;
document.querySelectorAll('.pill').forEach(p => p.onclick = () => { document.querySelectorAll('.pill').forEach(x => x.classList.remove('active')); p.classList.add('active'); currentFilter = p.dataset.filter; applyFilters(); });
const scanBox = document.getElementById('scanner-box');
document.getElementById('openScanBtn').onclick = () => { scanBox.hidden = false; scanner = new Html5Qrcode("reader"); scanner.start({ facingMode: "environment" }, { fps: 10, qrbox: { width: 220, height: 140 } }, txt => { searchInput.value = txt; stopScan(); applyFilters(); }).catch(() => stopScan()); };
function stopScan() { scanBox.hidden = true; if (scanner) scanner.stop().then(() => scanner.clear()).catch(() => {}); }
document.getElementById('closeScanBtn').onclick = stopScan;
document.getElementById('manualSearchBtn').onclick = () => { searchInput.value = document.getElementById('manualBarcode').value; stopScan(); applyFilters(); };
init();
