let allBrands = [], filtered = [], shown = 40, currentFilter = 'all', lang = 'tr', scanner = null;
const grid = document.getElementById('brandGrid'), countBar = document.getElementById('countBar'), searchInput = document.getElementById('searchInput'), categorySelect = document.getElementById('categorySelect'), loadMoreBtn = document.getElementById('loadMoreBtn');

const I18N = {
  tr: { sub: 'Bilinçli Tüket, Doğru Tercih', ph: 'Marka, ana firma veya barkod...', scan: 'Tara', all: 'Tümü', rev: '🔴 İnceleme / Boykot', pref: '🟢 Tercih Edilebilir', alt: '⭐ Alternatifli', allCat: '📂 Tüm Kategoriler', more: 'Daha Fazla Göster', found: 'marka listeleniyor', empty: 'Sonuç bulunamadı.', altLbl: 'Alternatifler:', src: '🔗 Kaynağı Görüntüle' },
  de: { sub: 'Bewusst konsumieren, richtig wählen', ph: 'Marke, Mutterkonzern oder Barcode...', scan: 'Scannen', all: 'Alle', rev: '🔴 Prüfung / Boykott', pref: '🟢 Empfehlenswert', alt: '⭐ Mit Alternativen', allCat: '📂 Alle Kategorien', more: 'Mehr anzeigen', found: 'Marken gefunden', empty: 'Keine Ergebnisse gefunden.', altLbl: 'Alternativen:', src: '🔗 Quelle ansehen' },
  en: { sub: 'Consume Consciously, Choose Right', ph: 'Search brand, parent company or barcode...', scan: 'Scan', all: 'All', rev: '🔴 Review / Boycott', pref: '🟢 Recommended', alt: '⭐ Alternatives', allCat: '📂 All Categories', more: 'Show More', found: 'brands listed', empty: 'No results found.', altLbl: 'Alternatives:', src: '🔗 View Source' }
};

const norm = s => (s || '').toLowerCase().replace(/ı/g, 'i').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');

function getLogoUrl(b) {
  const raw = b.logoUrl || b.image_url || '';
  if (raw && /\.(png|jpg|jpeg|svg|webp)(\?.*)?$/i.test(raw)) return raw;
  let domain = '';
  if (raw) { try { domain = new URL(raw).hostname.replace(/^www\./, ''); } catch (e) {} }
  if (!domain && Array.isArray(b.kaynaklar)) {
    const src = b.kaynaklar.find(x => x && x.url);
    if (src) { try { const h = new URL(src.url.split(',').shift().trim()).hostname.replace(/^www\./, ''); if (!['wikipedia.org', 'linkedin.com', 'timesofisrael.com', 'jpost.com', 'tag24.de'].some(d => h.includes(d))) domain = h; } catch (e) {} }
  }
  const k = norm(b.marka);
  if (!domain && k.length >= 3) domain = k + '.com';
  return domain ? 'https://google.com' + domain + '&sz=128' : '';
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
      if (!k) return;
      const parent = (b.anaFirma || '').indexOf('/') === -1 ? (b.anaFirma || '').trim() : '';
      if (!map.has(k)) map.set(k, Object.assign({}, b, { marka: clean, anaFirma: parent }));
    });
    allBrands = Array.from(map.values()).sort((a, b) => a.marka.localeCompare(b.marka, 'tr'));
    Array.from(new Set(allBrands.map(b => b.kategori).filter(Boolean))).sort().forEach(c => categorySelect.add(new Option(c, c)));
    applyFilters();
  } catch (e) { grid.innerHTML = '<p class="empty">Veriler yüklenemedi.</p>'; }
}

function applyFilters() {
  const q = searchInput.value.toLowerCase().trim(), cat = categorySelect.value;
  filtered = allBrands.filter(b => (b.marka.toLowerCase().includes(q) || (b.anaFirma || '').toLowerCase().includes(q) || (b.barkodlar || []).some(c => String(c).includes(q))) && (cat === 'all' || b.kategori === cat) && (currentFilter === 'all' || b.status === currentFilter || (currentFilter === 'alt' && Array.isArray(b.alternatifler) && b.alternatifler.length > 0)));
  shown = 40; render();
}

function render() {
  const t = I18N[lang]; countBar.textContent = filtered.length + ' ' + t.found;
  if (!filtered.length) { grid.innerHTML = '<p class="empty">' + t.empty + '</p>'; loadMoreBtn.hidden = true; return; }
  grid.innerHTML = filtered.slice(0, shown).map(b => {
    const isPref = b.status === 'preferred', logo = getLogoUrl(b), ini = b.marka.slice(0, 2).toUpperCase();
    const alts = (b.alternatifler || []).map(a => a.marka).filter(Boolean).join(', ');
    const meta = [b.anaFirma ? '🏢 ' + b.anaFirma : '', b.kategori, b.altKategori].filter(Boolean).join(' • ');
    const src = Array.isArray(b.kaynaklar) ? b.kaynaklar.find(k => k && k.url) : null;
    return `<article class="card ${isPref ? 'preferred' : 'review'}" onclick="this.querySelector('.details')?.toggleAttribute('hidden')"><div class="card-main"><div class="brand-avatar">${logo ? `<img src="${logo}" loading="lazy" onload="if(this.naturalWidth<=1)this.parentElement.textContent='${ini}'" onerror="this.parentElement.textContent='${ini}'">` : ini}</div><div class="card-info"><div class="card-head"><span class="brand-name">${b.marka}</span><span class="badge ${isPref ? 'preferred' : 'review'}">${isPref ? t.pref : t.rev}</span></div>${meta ? `<div class="meta">${meta}</div>` : ''}</div></div>${alts ? `<div class="alt">⭐ <b>${t.altLbl}</b> ${alts}</div>` : ''}${(b.not || src) ? `<div class="details" hidden>${b.not ? `<p>${b.not}</p>` : ''}${src ? `<a href="${src.url.split(',').shift().trim()}" target="_blank">${t.src}</a>` : ''}</div>` : ''}</article>`;
  }).join('');
  loadMoreBtn.hidden = shown >= filtered.length;
}

document.querySelectorAll('.lang-btn').forEach(b => b.onclick = () => { document.querySelectorAll('.lang-btn').forEach(x => x.classList.remove('active')); b.classList.add('active'); setLang(b.dataset.lang); });
loadMoreBtn.onclick = () => { shown += 40; render(); }; searchInput.oninput = applyFilters; categorySelect.onchange = applyFilters;
document.querySelectorAll('.pill').forEach(p => p.onclick = () => { document.querySelectorAll('.pill').forEach(x => x.classList.remove('active')); p.classList.add('active'); currentFilter = p.dataset.filter; applyFilters(); });
const scanBox = document.getElementById('scanner-box');
document.getElementById('openScanBtn').onclick = () => { if (typeof Html5Qrcode === 'undefined') { alert('Scanner yükleniyor, tekrar deneyin.'); return; } scanBox.hidden = false; scanner = new Html5Qrcode('reader'); scanner.start({ facingMode: 'environment' }, { fps: 10, qrbox: { width: 220, height: 140 } }, txt => { searchInput.value = txt; stopScan(); applyFilters(); }).catch(() => stopScan()); };
function stopScan() { scanBox.hidden = true; if (scanner) scanner.stop().then(() => scanner.clear()).catch(() => {}); }
document.getElementById('closeScanBtn').onclick = stopScan; document.getElementById('manualSearchBtn').onclick = () => { searchInput.value = document.getElementById('manualBarcode').value; stopScan(); applyFilters(); };
init();
