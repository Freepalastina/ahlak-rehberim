let allBrands = [], filtered = [], shown = 40, currentFilter = 'all', lang = 'tr', scanner = null;
const grid = document.getElementById('brandGrid'), countBar = document.getElementById('countBar'), searchInput = document.getElementById('searchInput'), categorySelect = document.getElementById('categorySelect'), loadMoreBtn = document.getElementById('loadMoreBtn');

const I18N = {
  tr: { sub: 'Bilinçli Tüket, Doğru Tercih', ph: 'Marka, ana firma veya barkod...', scan: 'Tara', all: 'Tümü', rev: '🔴 İnceleme / Boykot', pref: '🟢 Tercih Edilebilir', alt: '⭐ Alternatifli', allCat: '📂 Tüm Kategoriler', more: 'Daha Fazla Göster', found: 'marka listeleniyor', empty: 'Sonuç bulunamadı.', altLbl: 'Alternatifler:', src: '🔗 Kaynağı Görüntüle' },
  de: { sub: 'Bewusst konsumieren, richtig wählen', ph: 'Marke, Mutterkonzern oder Barcode...', scan: 'Scannen', all: 'Alle', rev: '🔴 Prüfung / Boykott', pref: '🟢 Empfehlenswert', alt: '⭐ Mit Alternativen', allCat: '📂 Alle Kategorien', more: 'Mehr anzeigen', found: 'Marken gefunden', empty: 'Keine Ergebnisse gefunden.', altLbl: 'Alternativen:', src: '🔗 Quelle ansehen' },
  en: { sub: 'Consume Consciously, Choose Right', ph: 'Search brand, parent company or barcode...', scan: 'Scan', all: 'All', rev: '🔴 Review / Boycott', pref: '🟢 Recommended', alt: '⭐ Alternatives', allCat: '📂 All Categories', more: 'Show More', found: 'brands listed', empty: 'No results found.', altLbl: 'Alternatives:', src: '🔗 View Source' }
};

const FIX_DATA = {
  airwaves: ['Mars, Incorporated', 'mars.com'], ajax: ['Colgate-Palmolive', 'colgatepalmolive.com'],
  akmina: ['Danone', 'danone.com'], aktren: ['Bayer AG', 'bayer.com'], alfajr: ['Al-Fajr', 'alfajr.com'],
  albert: ['Ahold Delhaize', 'albert.cz'], albertheijn: ['Ahold Delhaize', 'ah.nl'],
  alcare: ['SC Johnson', 'scjohnson.com'], aldinord: ['Unternehmensgruppe Aldi Nord', 'aldi-nord.de'],
  aldisud: ['Unternehmensgruppe Aldi Süd', 'aldi-sued.de'], a101: ['Yeni Mağazacılık A.Ş.', 'a101.com.tr'],
  aboutyou: ['Otto Group', 'aboutyou.de'], abtei: ['Perrigo Company', 'abtei.de'],
  adidas: ['Adidas AG', 'adidas.com'], nike: ['Nike, Inc.', 'nike.com'], puma: ['Puma SE', 'puma.com'],
  zara: ['Inditex', 'zara.com'], hm: ['H&M Group', 'hm.com'], apple: ['Apple Inc.', 'apple.com'],
  microsoft: ['Microsoft Corporation', 'microsoft.com'], google: ['Alphabet Inc.', 'google.com'],
  amazon: ['Amazon.com, Inc.', 'amazon.com'], starbucks: ['Starbucks Corporation', 'starbucks.com'],
  mcdonalds: ["McDonald's Corp.", 'mcdonalds.com'], burgerking: ['Restaurant Brands International', 'burgerking.de'],
  cocacola: ['The Coca-Cola Company', 'coca-cola.com'], pepsi: ['PepsiCo', 'pepsi.com'],
  nestle: ['Nestlé S.A.', 'nestle.com'], nescafe: ['Nestlé S.A.', 'nescafe.com'],
  kitkat: ['Nestlé S.A.', 'kitkat.com'], nutella: ['Ferrero Group', 'nutella.com'],
  kinder: ['Ferrero Group', 'kinder.com'], milka: ['Mondelēz International', 'milka.de'],
  oreo: ['Mondelēz International', 'oreo.com'], nivea: ['Beiersdorf AG', 'nivea.de'],
  dove: ['Unilever', 'dove.com'], loreal: ["L'Oréal Groupe", 'loreal.com'],
  ariel: ['Procter & Gamble', 'ariel.de'], persil: ['Henkel', 'persil.de'],
  bosch: ['Robert Bosch GmbH', 'bosch.com'], siemens: ['Siemens AG', 'siemens.com'],
  samsung: ['Samsung Electronics', 'samsung.com'], ulker: ['Yıldız Holding', 'ulker.com.tr'],
  eti: ['Eti Gıda', 'etietieti.com'], torku: ['Konya Şeker', 'torku.com.tr'],
  bim: ['BİM Birleşik Mağazalar', 'bim.com.tr'], sok: ['Yıldız Holding', 'sokmarket.com.tr'],
  migros: ['Migros Ticaret', 'migros.com.tr'], spar: ['SPAR Österreich / International', 'spar.at'],
  carrefour: ['Carrefour S.A.', 'carrefour.com'], lidl: ['Schwarz Gruppe', 'lidl.de'],
  dm: ['dm-drogerie markt', 'dm.de'], rossmann: ['Dirk Rossmann GmbH', 'rossmann.de']
};

const norm = s => (s || '').toLowerCase().replace(/ı/g, 'i').replace(/×/g, 'x').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');

function getLogoUrl(b) {
  const rawUrl = b.logoUrl || b.image_url || '';
  if (rawUrl && /\.(png|jpg|jpeg|svg|webp)(\?.*)?$/i.test(rawUrl)) return rawUrl;
  const k = norm(b.marka);
  let domain = (FIX_DATA[k] && FIX_DATA[k][1]) ? FIX_DATA[k][1] : '';
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

        }
      } catch {}
    }
  }
  return k.length >= 3 ? `https://google.com{k}.com&sz=128` : '';
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
    const map = new Map();
    raw.forEach(b => {
      const clean = (b.marka || '').replace(/bokyot|etik inceleme/gi, '').replace(/[:(]+$/, '').trim();
      const k = norm(clean);
      if (!k || ['action', 'fgh', 'sm', 'gau5'].includes(k)) return;
      let parent = (b.anaFirma || '').trim();
      if (FIX_DATA[k]) parent = FIX_DATA[k].at(0);
      else if (parent.includes('/')) parent = '';
      if (!map.has(k)) map.set(k, { ...b, marka: clean, anaFirma: parent });
    });
    allBrands = [...map.values()].sort((a, b) => a.marka.localeCompare(b.marka, 'tr'));
    [...new Set(allBrands.map(b => b.kategori).filter(Boolean))].sort().forEach(c => categorySelect.add(new Option(c, c)));
    applyFilters();
  } catch { grid.innerHTML = '<p class="empty">Veriler yüklenemedi.</p>'; }
}

function applyFilters() {
  const q = searchInput.value.toLowerCase().trim(), cat = categorySelect.value;
const norm = s => (s || '').toLowerCase().replace(/ı/g, 'i').replace(/×/g, 'x').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');

function getLogoUrl(b) {
  const rawUrl = b.logoUrl || b.image_url || '';
  if (rawUrl && /\.(png|jpg|jpeg|svg|webp)(\?.*)?$/i.test(rawUrl)) return rawUrl;
  const k = norm(b.marka);
  let domain = FIX_DATA[k]?.at(1) || '';
  if (!domain && rawUrl) {
    try { domain = new URL(rawUrl).hostname.replace(/^www\./, ''); } catch {}
  }
  if (!domain && Array.isArray(b.kaynaklar)) {
    const src = b.kaynaklar.find(x => x && x.url);
    if (src) {
      try {
        const h = new URL(src.url.split(',').at(0).trim()).hostname.replace(/^www\./, '');
        if (!['wikipedia.org', 'linkedin.com', 'timesofisrael.com', 'jpost.com', 'tag24.de', 'reuters.com', 'handelsblatt.com'].some(d => h.includes(d))) domain = h;
      } catch {}
    }
  }
  return domain ? `https://google.com{domain}&sz=128` : (k.length >= 3 ? `https://google.com{k}.com&sz=128` : '');
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
    const map = new Map();
    raw.forEach(b => {
      const clean = (b.marka || '').replace(/bokyot|etik inceleme/gi, '').replace(/[:(]+$/, '').trim();
      const k = norm(clean);
      if (!k || ['action', 'fgh', 'sm', 'gau5'].includes(k)) return;
      let parent = (b.anaFirma || '').trim();
      if (FIX_DATA[k]) parent = FIX_DATA[k].at(0);
      else if (parent.includes('/')) parent = '';
      if (!map.has(k)) {
        map.set(k, { ...b, marka: clean, anaFirma: parent });
      } else {
        const prev = map.get(k);
        if (!prev.anaFirma && parent) prev.anaFirma = parent;
        if ((!prev.kaynaklar || !prev.kaynaklar.length) && Array.isArray(b.kaynaklar) && b.kaynaklar.length) prev.kaynaklar = b.kaynaklar;
        if ((!prev.alternatifler || !prev.alternatifler.length) && Array.isArray(b.alternatifler) && b.alternatifler.length) prev.alternatifler = b.alternatifler;
      }
    });
    allBrands = [...map.values()].sort((a, b) => a.marka.localeCompare(b.marka, 'tr'));
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
    const sources = Array.isArray(b.kaynaklar) ? b.kaynaklar.filter(k => k && k.url) : [];
    const srcHtml = sources.map(s => `<a href="${s.url.split(',').at(0).trim()}" target="_blank" rel="noopener">${t.src}</a>`).join(' ');
    return `<article class="card ${isPref ? 'preferred' : 'review'}" onclick="this.querySelector('.details')?.toggleAttribute('hidden')">
      <div class="card-main">
        <div class="brand-avatar">${logo ? `<img src="${logo}" alt="" loading="lazy" onload="if(this.naturalWidth<=16)this.parentElement.textContent='${initials}'" onerror="this.parentElement.textContent='${initials}'">` : initials}</div>
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
