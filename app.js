let allBrands = [], filtered = [], shown = 40, currentFilter = 'all', scanner = null;
const grid = document.getElementById('brandGrid');
const countBar = document.getElementById('countBar');
const searchInput = document.getElementById('searchInput');
const categorySelect = document.getElementById('categorySelect');
const loadMoreBtn = document.getElementById('loadMoreBtn');

const JUNK = new Set(['temizlik', 'gıda', 'içecek', 'kozmetik ve kişisel bakım', 'sağlık ve kişisel bakım',
  'çamaşır deterjanı', 'bulaşık deterjanı', 'bulaşık makinesi deterjanı', 'yüzey temizleyici',
  'tuvalet temizleyici', 'yumuşatıcı', 'cam temizleyici', 'oda kokusu', 'sünger / bez / temizlik aparatı',
  'şampuan / saç bakım', 'sabun / duş jeli', 'diş macunu / ağız bakım', 'deodorant', 'tıraş / jilet',
  'makyaj', 'cilt bakım / dermokozmetik', 'bebek bakım', 'makarna', 'süt ve süt ürünleri', 'dondurma',
  'kahvaltılık gevrek', 'konserve / salça / sos', 'baharat', 'vegan / bitkisel ürün']);

async function init() {
  try {
    const res = await fetch('data.json?v=' + Date.now());
    const raw = await res.json();
    const parents = new Set(raw.map(x => (x.anaFirma || '').toLowerCase().trim()).filter(Boolean));
    allBrands = raw.filter(b => {
      const m = (b.marka || '').toLowerCase().trim();
      return m && !JUNK.has(m) && (!parents.has(m) || b.anaFirma || b.kategori);
    });
    [...new Set(allBrands.map(b => b.kategori).filter(Boolean))].sort()
      .forEach(c => categorySelect.add(new Option(c, c)));
    applyFilters();
  } catch { grid.innerHTML = '<p class="empty">Veriler yüklenemedi.</p>'; }
}

function applyFilters() {
  const q = searchInput.value.toLowerCase().trim();
  const cat = categorySelect.value;
  filtered = allBrands.filter(b => {
    const matchText = (b.marka || '').toLowerCase().includes(q) ||
      (b.anaFirma || '').toLowerCase().includes(q) || (b.barkodlar || []).some(c => String(c).includes(q));
    const matchCat = cat === 'all' || b.kategori === cat;
    const hasAlt = Array.isArray(b.alternatifler) && b.alternatifler.length > 0;
    const matchStatus = currentFilter === 'all' || b.status === currentFilter || (currentFilter === 'alt' && hasAlt);
    return matchText && matchCat && matchStatus;
  });
  shown = 40;
  render();
}

function render() {
  countBar.textContent = `${filtered.length} marka bulundu`;
  if (!filtered.length) { grid.innerHTML = '<p class="empty">Sonuç bulunamadı.</p>'; loadMoreBtn.hidden = true; return; }
  grid.innerHTML = filtered.slice(0, shown).map(b => {
    const isPref = b.status === 'preferred';
    const alts = (b.alternatifler || []).map(a => a.marka).filter(Boolean).join(', ');
    const meta = [b.kategori, b.altKategori, b.anaFirma].filter(Boolean).join(' • ');
    return `<article class="card ${isPref ? 'preferred' : 'review'}">
      <div class="card-head">
        <span class="brand-name">${b.marka}</span>
        <span class="badge ${isPref ? 'preferred' : 'review'}">${isPref ? '🟢 Tercih Edilebilir' : '🔴 İnceleme'}</span>
      </div>
      ${meta ? `<div class="meta">${meta}</div>` : ''}
      ${alts ? `<div class="alt">⭐ <b>Alternatifler:</b> ${alts}</div>` : ''}
    </article>`;
  }).join('');
  loadMoreBtn.hidden = shown >= filtered.length;
}

loadMoreBtn.onclick = () => { shown += 40; render(); };
searchInput.oninput = applyFilters;
categorySelect.onchange = applyFilters;
document.querySelectorAll('.pill').forEach(p => p.onclick = () => {
  document.querySelectorAll('.pill').forEach(x => x.classList.remove('active'));
  p.classList.add('active'); currentFilter = p.dataset.filter; applyFilters();
});

const scanBox = document.getElementById('scanner-box');
document.getElementById('openScanBtn').onclick = () => {
  scanBox.hidden = false;
  scanner = new Html5Qrcode("reader");
  scanner.start({ facingMode: "environment" }, { fps: 10, qrbox: { width: 220, height: 140 } }, txt => {
    searchInput.value = txt; stopScan(); applyFilters();
  }).catch(() => stopScan());
};
function stopScan() { scanBox.hidden = true; if (scanner) scanner.stop().then(() => scanner.clear()).catch(() => {}); }
document.getElementById('closeScanBtn').onclick = stopScan;
document.getElementById('manualSearchBtn').onclick = () => {
  searchInput.value = document.getElementById('manualBarcode').value; stopScan(); applyFilters();
};
init();
