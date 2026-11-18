let allBrands = [], filtered = [], shown = 40, currentFilter = 'all', lang = 'tr', scanner = null;
const grid = document.getElementById('brandGrid'), countBar = document.getElementById('countBar'), searchInput = document.getElementById('searchInput'), categorySelect = document.getElementById('categorySelect'), loadMoreBtn = document.getElementById('loadMoreBtn');

const I18N = {
  tr: { sub: 'Bilinçli Tüket, Doğru Tercih', ph: 'Marka, ana firma veya barkod...', scan: 'Tara', all: 'Tümü', rev: '🔴 İnceleme / Boykot', pref: '🟢 Tercih Edilebilir', alt: '⭐ Alternatifli', allCat: '📂 Tüm Kategoriler', more: 'Daha Fazla Göster', found: 'marka listeleniyor', empty: 'Sonuç bulunamadı.', altLbl: 'Alternatifler:', src: '🔗 Kaynağı Görüntüle' },
  de: { sub: 'Bewusst konsumieren, richtig wählen', ph: 'Marke, Mutterkonzern oder Barcode...', scan: 'Scannen', all: 'Alle', rev: '🔴 Prüfung / Boykott', pref: '🟢 Empfehlenswert', alt: '⭐ Mit Alternativen', allCat: '📂 Alle Kategorien', more: 'Mehr anzeigen', found: 'Marken gefunden', empty: 'Keine Ergebnisse gefunden.', altLbl: 'Alternativen:', src: '🔗 Quelle ansehen' },
  en: { sub: 'Consume Consciously, Choose Right', ph: 'Search brand, parent company or barcode...', scan: 'Scan', all: 'All', rev: '🔴 Review / Boycott', pref: '🟢 Recommended', alt: '⭐ Alternatives', allCat: '📂 All Categories', more: 'Show More', found: 'brands listed', empty: 'No results found.', altLbl: 'Alternatives:', src: '🔗 View Source' }
};

const HINTS = {
  a101: 'a101.com.tr', aarealbank: 'aareal-bank.com', aboutyou: 'aboutyou.de', abtei: 'abtei.de', adidas: 'adidas.com', nike: 'nike.com', puma: 'puma.com', zara: 'zara.com', hm: 'hm.com', apple: 'apple.com', microsoft: 'microsoft.com', google: 'google.com', amazon: 'amazon.com', starbucks: 'starbucks.com', mcdonalds: 'mcdonalds.com', burgerking: 'burgerking.de', kfc: 'kfc.com', cocacola: 'coca-cola.com', pepsi: 'pepsi.com', fanta: 'fanta.com', sprite: 'sprite.com', nestle: 'nestle.com', nescafe: 'nescafe.com', nesquik: 'nesquik.com', kitkat: 'kitkat.com', nutella: 'nutella.com', kinder: 'kinder.com', milka: 'milka.de', oreo: 'oreo.com', nivea: 'nivea.de', dove: 'dove.com', loreal: 'loreal.com', garnier: 'garnier.de', ariel: 'ariel.de', persil: 'persil.de', domestos: 'domestos.com', bosch: 'bosch.com', siemens: 'siemens.com', miele: 'miele.de', samsung: 'samsung.com', ulker: 'ulker.com.tr', eti: 'etietieti.com', torku: 'torku.com.tr', sutas: 'sutas.com.tr', pinar: 'pinar.com.tr', bingo: 'bingo.com.tr', frosch: 'frosch.de', haribo: 'haribo.com', '8x4': '8x4.de', colgate: 'colgate.com', palmolive: 'palmolive.com'
};

const norm = s => (s || '').toLowerCase().replace(/ı/g, 'i').replace(/×/g, 'x').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');

function getHost(b) {
  const k = norm(b.marka);
  if (HINTS[k]) return HINTS[k];
  if (Array.isArray(b.kaynaklar)) {
    const src = b.kaynaklar.find(x => x && x.url);
    if (src) {
      try {
        const h = new URL(src.url.split(',').at(0).trim()).hostname.replace(/^www\./, '');
        if (!['wikipedia.org', 'linkedin.com', 'timesofisrael.com', 'jpost.com', 'tag24.de'].some(d => h.includes(d))) return h;
      } catch {}
    }
  }
  return k.length >= 3 ? `${k}.com` : '';
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
    const isPref = b.status === 'preferred', host = getHost(b), initials = b.marka.slice(0, 2).toUpperCase();
    const logo = b.logoUrl || b.image_url || (host ? `https://duckduckgo.com{host}.ico` : '');
    const alts = (b.alternatifler || []).map(a => a.marka).filter(m => m && norm(m) !== norm(b.marka)).join(', ');
    const meta = [b.anaFirma ? `🏢 ${b.anaFirma}` : '', b.kategori, b.altKategori].filter(Boolean).join(' • ');
    const firstSrc = Array.isArray(b.kaynaklar) ? b.kaynaklar.find(k => k && k.url) : null;
    const fb = `if(!this.dataset.f){this.dataset.f=1;this.src='https://google.com{host}&sz=128';}else{this.parentElement.textContent='${initials}';}`;
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
// EINMALIGER AUTO-EXPORT (nach dem Download wieder aus app.js löschen!)
setTimeout(() => {
  if (!allBrands.length) return;
  const P = {
    a101:'Yeni Mağazacılık A.Ş.', aboutyou:'Otto Group', abtei:'Perrigo Company', ace:'Fater S.p.A.',
    ackermann:'Otto Group', acuvue:'Johnson & Johnson', adidas:'Adidas AG', aeg:'Electrolux AB',
    apple:'Apple Inc.', arcelik:'Arçelik (Koç Holding)', asus:'ASUSTeK Computer', audi:'Volkswagen AG',
    bauknecht:'Beko Europe', beko:'Arçelik (Koç Holding)', bershka:'Inditex', bmw:'BMW AG',
    bosch:'Robert Bosch GmbH', bp:'BP p.l.c.', braun:'Procter & Gamble', burgerking:'Restaurant Brands International',
    carrefour:'Carrefour S.A.', chanel:'Chanel Limited', converse:'Nike, Inc.', decathlon:'Association Familiale Mulliez',
    dell:'Dell Technologies', dm:'dm-drogerie markt', dominospizza:"Domino's Pizza, Inc.", duracell:'Berkshire Hathaway',
    dyson:'Dyson Ltd.', edeka:'Edeka Zentrale', fiat:'Stellantis', ford:'Ford Motor Company',
    grundig:'Arçelik (Koç Holding)', gucci:'Kering', hm:'H&M Group', hp:'HP Inc.', hyundai:'Hyundai Motor Group',
    ikea:'Ingka Group', intel:'Intel Corporation', kaufland:'Schwarz Gruppe', kfc:'Yum! Brands',
    levis:'Levi Strauss & Co.', lidl:'Schwarz Gruppe', mango:'Punto Fa, S.L.', mcdonalds:"McDonald's Corp.",
    mercedesbenz:'Mercedes-Benz Group', microsoft:'Microsoft Corporation', miele:'Miele & Cie. KG',
    netflix:'Netflix, Inc.', nike:'Nike, Inc.', nokia:'Nokia Corporation', oppo:'BBK Electronics',
    penny:'REWE Group', philips:'Koninklijke Philips N.V.', pizzahut:'Yum! Brands', pullbear:'Inditex',
    puma:'Puma SE', rewe:'REWE Group', rossmann:'Dirk Rossmann GmbH', rossman:'Dirk Rossmann GmbH',
    samsung:'Samsung Electronics', seat:'Volkswagen AG', shell:'Shell plc', siemens:'Siemens AG',
    sony:'Sony Group Corp.', spotify:'Spotify Technology S.A.', starbucks:'Starbucks Corporation',
    subway:'Roark Capital', tefal:'Groupe SEB', tesla:'Tesla, Inc.', toyota:'Toyota Motor Corp.',
    vestel:'Zorlu Holding', vodafone:'Vodafone Group', volkswagen:'Volkswagen AG', whatsapp:'Meta Platforms',
    whirlpool:'Whirlpool Corp.', wmf:'Groupe SEB', xiaomi:'Xiaomi Corporation', zalando:'Zalando SE', zara:'Inditex'
  };
  const map = new Map();
  allBrands.forEach(b => {
    const clean = (b.marka || '').replace(/bokyot|etik inceleme/gi, '').replace(/[:(]+$/, '').trim();
    const k = norm(clean);
    if (!k || ['action','fgh','sm','gau5'].includes(k)) return;
    const parent = (b.anaFirma && !b.anaFirma.includes('kontrol')) ? b.anaFirma : (P[k] || b.anaFirma || '');
    const alts = (b.alternatifler || []).filter(a => norm(a.marka) !== k);
    if (!map.has(k)) map.set(k, { ...b, marka: clean, anaFirma: parent, alternatifler: alts });
  });
  const out = [...map.values()].sort((a, b) => a.marka.localeCompare(b.marka, 'tr'));
  const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(new Blob([JSON.stringify(out, null, 2)], { type: 'application/json' })), download: 'data.json' });
  a.click();
}, 2500);
