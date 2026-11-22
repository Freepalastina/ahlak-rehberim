let allBrands = [], filtered = [], shown = 40, currentFilter = 'all', lang = 'tr', scanner = null;
const grid = document.getElementById('brandGrid'), countBar = document.getElementById('countBar'), searchInput = document.getElementById('searchInput'), categorySelect = document.getElementById('categorySelect'), loadMoreBtn = document.getElementById('loadMoreBtn');

const I18N = {
  tr: { sub: 'Bilinçli Tüket, Doğru Tercih', ph: 'Marka, ana firma veya barkod...', scan: 'Tara', all: 'Tümü', rev: '🔴 İnceleme / Boykot', pref: '🟢 Tercih Edilebilir', alt: '⭐ Alternatifli', allCat: '📂 Tüm Kategoriler', more: 'Daha Fazla Göster', found: 'marka listeleniyor', empty: 'Sonuç bulunamadı.', altLbl: 'Alternatifler:', src: '🔗 Kaynağı Görüntüle' },
  de: { sub: 'Bewusst konsumieren, richtig wählen', ph: 'Marke, Mutterkonzern oder Barcode...', scan: 'Scannen', all: 'Alle', rev: '🔴 Prüfung / Boykott', pref: '🟢 Empfehlenswert', alt: '⭐ Mit Alternativen', allCat: '📂 Alle Kategorien', more: 'Mehr anzeigen', found: 'Marken gefunden', empty: 'Keine Ergebnisse gefunden.', altLbl: 'Alternativen:', src: '🔗 Quelle ansehen' },
  en: { sub: 'Consume Consciously, Choose Right', ph: 'Search brand, parent company or barcode...', scan: 'Scan', all: 'All', rev: '🔴 Review / Boycott', pref: '🟢 Recommended', alt: '⭐ Alternatives', allCat: '📂 All Categories', more: 'Show More', found: 'brands listed', empty: 'No results found.', altLbl: 'Alternatives:', src: '🔗 View Source' }
};

const FIX_DATA = {
  '3m': ['3M Company', '3m.com'], '5gum': ['Mars, Incorporated', 'mars.com'], '5star': ['Mondelēz International', 'mondelezinternational.com'],
  '7days': ['Mondelēz International', '7days.com'], '7up': ['PepsiCo, Inc.', '7up.com'], '8x4': ['Beiersdorf AG', '8x4.de'],
  a101: ['Turgut Aydın Holding A.Ş.', 'a101.com.tr'], aarealbank: ['Aareal Bank AG', 'aareal-bank.com'],
  abc: ['ABC Deterjan Sanayi ve Ticaret A.Ş.', 'abcdeterjan.com.tr'], aboutyou: ['ABOUT YOU Holding SE', 'aboutyou.de'],
  abtei: ['Perrigo Company plc', 'abtei.de'], ace: ['Fater S.p.A.', 'ace.info'],
  acquadiparma: ['LVMH Moët Hennessy Louis Vuitton SE', 'acquadiparma.com'], actimel: ['Danone S.A.', 'actimel.de'],
  action: ['3i Group plc', 'action.com'], activia: ['Danone S.A.', 'activia.de'],
  acuvue: ['Johnson & Johnson', 'acuvue.com'], adeg: ['REWE International AG', 'adeg.at'],
  adidas: ['adidas AG', 'adidas.com'], aeg: ['AB Electrolux', 'aeg.de'],
  airwick: ['Reckitt Benckiser Group plc', 'airwick.de'], airwaves: ['Mars, Incorporated', 'mars.com'],
  ajax: ['Colgate-Palmolive Company', 'colgatepalmolive.com'], albert: ['Koninklijke Ahold Delhaize N.V.', 'albert.cz'],
  albertheijn: ['Koninklijke Ahold Delhaize N.V.', 'ah.nl'], aldinord: ['Unternehmensgruppe Aldi Nord', 'aldi-nord.de'],
  aldisud: ['Unternehmensgruppe Aldi Süd', 'aldi-sued.de'], algida: ['Unilever plc', 'algida.com.tr'],
  allianz: ['Allianz SE', 'allianz.com'], almdudler: ['Almdudler Limonade A. & S. Klein GmbH & Co KG', 'almdudler.com'],
  alnatura: ['Alnatura Produktions- und Handels GmbH', 'alnatura.de'], alpecin: ['Dr. Kurt Wolff GmbH & Co. KG', 'alpecin.com'],
  alpecine: ['Dr. Kurt Wolff GmbH & Co. KG', 'alpecin.com'], alpro: ['Danone S.A.', 'alpro.com'],
  altus: ['Arçelik A.Ş.', 'altus.com.tr'], always: ['Procter & Gamble Company', 'always.com'],
  alza: ['Alza.cz a.s.', 'alza.at'], amazon: ['Amazon.com, Inc.', 'amazon.com'],
  apple: ['Apple Inc.', 'apple.com'], aptamil: ['Danone S.A.', 'aptaclub.de'],
  aquafresh: ['Haleon plc', 'aquafresh.com'], arcelik: ['Arçelik A.Ş.', 'arcelik.com.tr'],
  ariel: ['Procter & Gamble Company', 'ariel.co.uk'], armani: ['Giorgio Armani S.p.A.', 'armani.com'],
  asics: ['ASICS Corporation', 'asics.com'], asperox: ['Beyaz Kağıt ve Hijyenik Ürünler A.Ş.', 'asperox.com.tr'],
  aspirin: ['Bayer AG', 'aspirin.de'], asus: ['ASUSTeK Computer Inc.', 'asus.com'],
  auchan: ['Auchan Retail International S.A.', 'auchan-retail.com'], audi: ['AUDI AG', 'audi.com'],
  axe: ['Unilever plc', 'axe.com'], aygaz: ['Aygaz A.Ş.', 'aygaz.com.tr'],
  barbie: ['Mattel, Inc.', 'mattel.com'], barilla: ['Barilla G. e R. Fratelli S.p.A.', 'barilla.com'],
  bauknecht: ['Beko Europe B.V.', 'bauknecht.de'], beiersdorf: ['Beiersdorf AG', 'beiersdorf.com'],
  beko: ['Arçelik A.Ş.', 'beko.com'], benjerrys: ['Unilever plc', 'benjerry.com'],
  bepanthen: ['Bayer AG', 'bepanthen.de'], bershka: ['Industria de Diseño Textil, S.A. (Inditex)', 'bershka.com'],
  billa: ['REWE International AG', 'billa.at'], bim: ['BİM Birleşik Mağazalar A.Ş.', 'bim.com.tr'],
  bipa: ['REWE International AG', 'bipa.at'], bmw: ['Bayerische Motoren Werke AG', 'bmw.com'],
  booking: ['Booking Holdings Inc.', 'booking.com'], bosch: ['Robert Bosch GmbH', 'bosch.com'],
  braun: ['Procter & Gamble Company', 'braun.de'], burgerking: ['Restaurant Brands International Inc.', 'burgerking.de'],
  ca: ['COFRA Holding AG', 'c-and-a.com'], carrefour: ['Carrefour S.A.', 'carrefour.com'],
  cerave: ["L'Oréal S.A.", 'cerave.de'], chanel: ['Chanel Limited', 'chanel.com'],
  cocacola: ['The Coca-Cola Company', 'coca-cola.com'], colgate: ['Colgate-Palmolive Company', 'colgate.de'],
  danone: ['Danone S.A.', 'danone.com'], decathlon: ['Association Familiale Mulliez', 'decathlon.at'],
  deichmann: ['Deichmann SE', 'deichmann.com'], dm: ['dm-drogerie markt GmbH + Co. KG', 'dm.at'],
  dove: ['Unilever plc', 'dove.com'], droetker: ['Dr. August Oetker KG', 'oetker.at'],
  dyson: ['Dyson Limited', 'dyson.at'], edeka: ['EDEKA Zentrale Stiftung & Co. KG', 'edeka.de'],
  eti: ['Eti Gıda Sanayi ve Ticaret A.Ş.', 'etietieti.com'], fanta: ['The Coca-Cola Company', 'coca-cola.com'],
  farmasi: ['Tanalize Kozmetik A.Ş.', 'farmasi.com.tr'], ferrero: ['Ferrero International S.A.', 'ferrero.com'],
  finish: ['Reckitt Benckiser Group plc', 'finish.de'], frosch: ['Werner & Mertz GmbH', 'frosch.de'],
  garnier: ["L'Oréal S.A.", 'garnier.de'], gillette: ['Procter & Gamble Company', 'gillette.de'],
  google: ['Alphabet Inc.', 'google.com'], haribo: ['HARIBO GmbH & Co. KG', 'haribo.com'],
  heinz: ['The Kraft Heinz Company', 'heinz.com'], hm: ['H & M Hennes & Mauritz AB', 'hm.com'],
  hofer: ['Unternehmensgruppe Aldi Süd', 'hofer.at'], ikea: ['Inter IKEA Holding B.V.', 'ikea.com'],
  instagram: ['Meta Platforms, Inc.', 'instagram.com'], jacobs: ["JDE Peet's N.V.", 'jacobs-kaffee.at'],
  kaufland: ['Schwarz Gruppe', 'kaufland.de'], kelloggs: ['Kellanova', 'kelloggs.de'],
  kfc: ['Yum! Brands, Inc.', 'kfc.at'], kinder: ['Ferrero International S.A.', 'kinder.com'],
  kitkat: ['Nestlé S.A.', 'kitkat.de'], knorr: ['Unilever plc', 'knorr.com'],
  lays: ['PepsiCo, Inc.', 'lays.com'], lenor: ['Procter & Gamble Company', 'lenor.de'],
  lidl: ['Schwarz Gruppe', 'lidl.at'], lipton: ['LIPTON Teas and Infusions', 'lipton.com'],
  loreal: ["L'Oréal S.A.", 'loreal-paris.at'], magnum: ['Unilever plc', 'magnumicecream.com'],
  mars: ['Mars, Incorporated', 'mars.com'], maybelline: ["L'Oréal S.A.", 'maybelline.at'],
  mcdonalds: ["McDonald's Corporation", 'mcdonalds.at'], mediamarkt: ['Ceconomy AG', 'mediamarkt.at'],
  microsoft: ['Microsoft Corporation', 'microsoft.com'], miele: ['Miele & Cie. KG', 'miele.at'],
  migros: ['Migros-Genossenschafts-Bund', 'migros.ch'], milka: ['Mondelēz International', 'milka.at'],
  nescafe: ['Nestlé S.A.', 'nescafe.com'], nestle: ['Nestlé S.A.', 'nestle.com'],
  netflix: ['Netflix, Inc.', 'netflix.com'], nike: ['Nike, Inc.', 'nike.com'],
  nivea: ['Beiersdorf AG', 'nivea.at'], nutella: ['Ferrero International S.A.', 'nutella.com'],
  oralb: ['Procter & Gamble Company', 'oralb.de'], oreo: ['Mondelēz International', 'oreo.com'],
  pampers: ['Procter & Gamble Company', 'pampers.de'], pantene: ['Procter & Gamble Company', 'pantene.de'],
  penny: ['REWE Group', 'penny.at'], pepsi: ['PepsiCo, Inc.', 'pepsi.com'],
  persil: ['Henkel AG & Co. KGaA', 'persil.at'], philips: ['Koninklijke Philips N.V.', 'philips.at'],
  prima: ['Procter & Gamble Company', 'prima.com.tr'], pringles: ['Kellanova', 'pringles.com'],
  puma: ['PUMA SE', 'puma.com'], redbull: ['Red Bull GmbH', 'redbull.com'],
  rewe: ['REWE Group', 'rewe.de'], rexona: ['Unilever plc', 'rexona.com'],
  rossmann: ['Dirk Rossmann GmbH', 'rossmann.de'], samsung: ['Samsung Electronics Co., Ltd.', 'samsung.com'],
  schwarzkopf: ['Henkel AG & Co. KGaA', 'schwarzkopf.at'], sensodyne: ['Haleon plc', 'sensodyne.at'],
  siemens: ['Siemens AG', 'siemens.com'], snickers: ['Mars, Incorporated', 'snickers.com'],
  sok: ['Yıldız Holding A.Ş.', 'sokmarket.com.tr'], spar: ['SPAR Österreichische Warenhandels-AG', 'spar.at'],
  sprite: ['The Coca-Cola Company', 'coca-cola.com'], starbucks: ['Starbucks Corporation', 'starbucks.com'],
  torku: ['Konya Şeker Sanayi ve Ticaret A.Ş.', 'torku.com.tr'], ulker: ['Yıldız Holding A.Ş.', 'ulker.com.tr'],
  unilever: ['Unilever plc', 'unilever.com'], vichy: ["L'Oréal S.A.", 'vichy.at'],
  volkswagen: ['Volkswagen AG', 'volkswagen.at'], whatsapp: ['Meta Platforms, Inc.', 'whatsapp.com'],
  xiaomi: ['Xiaomi Corporation', 'mi.com'], zalando: ['Zalando SE', 'zalando.at'],
  zara: ['Industria de Diseño Textil, S.A. (Inditex)', 'zara.com']
};
const norm = s => (s || '').toLowerCase().replace(/ı/g, 'i').replace(/×/g, 'x').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');

function getLogoUrl(b) {
  const rawUrl = b.logoUrl || b.image_url || '';
  if (rawUrl && /\.(png|jpg|jpeg|svg|webp)(\?.*)?$/i.test(rawUrl)) return rawUrl;
  const k = norm(b.marka);
  let domain = FIX_DATA[k] ? FIX_DATA[k][1] : '';
  if (!domain && rawUrl) {
    try { domain = new URL(rawUrl).hostname.replace(/^www\./, ''); } catch (e) {}
  }
  if (!domain && Array.isArray(b.kaynaklar)) {
    const src = b.kaynaklar.find(x => x && x.url);
    if (src) {
      try {
        const h = new URL(src.url.split(',')[0].trim()).hostname.replace(/^www\./, '');
        if (!['wikipedia.org', 'linkedin.com', 'timesofisrael.com', 'jpost.com', 'tag24.de', 'reuters.com', 'handelsblatt.com'].some(d => h.includes(d))) domain = h;
      } catch (e) {}
    }
  }
  return domain ? 'https://google.com' + domain + '&sz=128' : (k.length >= 3 ? 'https://google.com' + k + '.com&sz=128' : '');
}

function setLang(l) {
  lang = l; const t = I18N[l];
  document.getElementById('subTitle').textContent = t.sub; searchInput.placeholder = t.ph; document.getElementById('scanTxt').textContent = t.scan;
  document.getElementById('fAll').textContent = t.all; document.getElementById('fRev').textContent = t.rev; document.getElementById('fPref').textContent = t.pref; document.getElementById('fAlt').textContent = t.alt;
  if (categorySelect.options.length > 0) categorySelect.options[0].textContent = t.allCat;
  loadMoreBtn.textContent = t.more; render();
}

async function init() {
  try {
    const res = await fetch('data.json?v=' + Date.now());
    const raw = await res.json();
    const map = new Map();
    raw.forEach(function(b) {
      const clean = (b.marka || '').replace(/bokyot|etik inceleme/gi, '').replace(/[:(]+$/, '').trim();
      const k = norm(clean);
      if (!k || ['action', 'fgh', 'sm', 'gau5'].indexOf(k) !== -1) return;
      let parent = (b.anaFirma || '').trim();
      if (FIX_DATA[k]) parent = FIX_DATA[k][0];
      else if (parent.indexOf('/') !== -1) parent = '';
      if (!map.has(k)) {
        map.set(k, Object.assign({}, b, { marka: clean, anaFirma: parent }));
      } else {
        const prev = map.get(k);
        if (!prev.anaFirma && parent) prev.anaFirma = parent;
        if ((!prev.kaynaklar || !prev.kaynaklar.length) && Array.isArray(b.kaynaklar) && b.kaynaklar.length) prev.kaynaklar = b.kaynaklar;
        if ((!prev.alternatifler || !prev.alternatifler.length) && Array.isArray(b.alternatifler) && b.alternatifler.length) prev.alternatifler = b.alternatifler;
      }
    });
    allBrands = Array.from(map.values()).sort(function(a, b) { return a.marka.localeCompare(b.marka, 'tr'); });
    Array.from(new Set(allBrands.map(function(b) { return b.kategori; }).filter(Boolean))).sort().forEach(function(c) { categorySelect.add(new Option(c, c)); });
    applyFilters();
  } catch (e) { grid.innerHTML = '<p class="empty">Veriler yüklenemedi.</p>'; }
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
    const sources = Array.isArray(b.kaynaklar) ? b.kaynaklar.filter(k => k && k.url) : [];
    const srcHtml = sources.map(s => `<a href="${s.url.split(',')[0].trim()}" target="_blank" rel="noopener">${t.src}</a>`).join(' ');
    return `<article class="card ${isPref ? 'preferred' : 'review'}" onclick="this.querySelector('.details')?.toggleAttribute('hidden')">
      <div class="card-main">
        <div class="brand-avatar">${logo ? `<img src="${logo}" alt="" loading="lazy" onload="if(this.naturalWidth<=1)this.parentElement.textContent='${initials}'" onerror="this.parentElement.textContent='${initials}'">` : initials}</div>
        <div class="card-info">
          <div class="card-head"><span class="brand-name">${b.marka}</span><span class="badge ${isPref ? 'preferred' : 'review'}">${isPref ? t.pref : t.rev}</span></div>
          ${meta ? `<div class="meta">${meta}</div>` : ''}
        </div>
      </div>
      ${alts ? `<div class="alt">⭐ <b>${t.altLbl}</b> ${alts}</div>` : ''}
      ${(b.not || srcHtml) ? `<div class="details" hidden>${b.not ? `<p>${b.not}</p>` : ''}${srcHtml}</div>` : ''}
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
