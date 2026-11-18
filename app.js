let allBrands = [], filtered = [], shown = 40, currentFilter = 'all', lang = 'tr', scanner = null;
const grid = document.getElementById('brandGrid'), countBar = document.getElementById('countBar');
const searchInput = document.getElementById('searchInput'), categorySelect = document.getElementById('categorySelect');
const loadMoreBtn = document.getElementById('loadMoreBtn');

const I18N = {
  tr: { sub: 'Bilinçli Tüket, Doğru Tercih', ph: 'Marka, ana firma veya barkod...', scan: 'Tara', all: 'Tümü', rev: '🔴 İnceleme / Boykot', pref: '🟢 Tercih Edilebilir', alt: '⭐ Alternatifli', allCat: '📂 Tüm Kategoriler', more: 'Daha Fazla Göster', found: 'marka listeleniyor', empty: 'Sonuç bulunamadı.', altLbl: 'Alternatifler:', src: '🔗 Kaynağı Görüntüle' },
  de: { sub: 'Bewusst konsumieren, richtig wählen', ph: 'Marke, Mutterkonzern oder Barcode...', scan: 'Scannen', all: 'Alle', rev: '🔴 Prüfung / Boykott', pref: '🟢 Empfehlenswert', alt: '⭐ Mit Alternativen', allCat: '📂 Alle Kategorien', more: 'Mehr anzeigen', found: 'Marken gefunden', empty: 'Keine Ergebnisse gefunden.', altLbl: 'Alternativen:', src: '🔗 Quelle ansehen' },
  en: { sub: 'Consume Consciously, Choose Right', ph: 'Search brand, parent company or barcode...', scan: 'Scan', all: 'All', rev: '🔴 Review / Boycott', pref: '🟢 Recommended', alt: '⭐ Alternatives', allCat: '📂 All Categories', more: 'Show More', found: 'brands listed', empty: 'No results found.', altLbl: 'Alternatives:', src: '🔗 View Source' }
};

const PARENT_RULES = [
  ['Nestlé S.A.', ['nespresso', 'nestle', 'nescafe', 'nesquik', 'kitkat', 'maggi', 'lion', 'smarties', 'aftereight', 'buitoni', 'thomy', 'wagner', 'purina', 'felix', 'cerelac', 'nan', 'beba', 'vittel', 'pellegrino', 'perrier', 'movenpick', 'smartwater', 'puredelife', 'cailler', 'crunchbar', 'rolo', 'qualitystreet', 'gardengourmet']],
  ['Unilever', ['dove', 'axe', 'lynx', 'rexona', 'sure', 'lux', 'lifebuoy', 'signal', 'closeup', 'pepsodent', 'sunsilk', 'tresemme', 'clear', 'vaseline', 'ponds', 'omo', 'surf', 'comfort', 'cif', 'domestos', 'sunlight', 'knorr', 'hellmanns', 'calve', 'magnum', 'cornetto', 'walls', 'algida', 'benjerry', 'cartedor', 'viennetta', 'langnese', 'lipton', 'rama', 'maizena', 'mondamin']],
  ['Procter & Gamble', ['ariel', 'tide', 'dash', 'vizir', 'lenor', 'downy', 'fairy', 'meisterpropper', 'mrclean', 'mrproper', 'febreze', 'swiffer', 'pampers', 'luvs', 'always', 'tampax', 'discreet', 'gillette', 'venus', 'braun', 'kingcgillette', 'oralb', 'blendamed', 'ipana', 'crest', 'headshoulders', 'pantene', 'herbalessences', 'aussie', 'olay', 'oldspice', 'secret', 'wick', 'vicks']],
  ['Mars, Incorporated', ['mars', 'snickers', 'twix', 'bounty', 'mms', 'maltesers', 'milkyway', 'celebrations', 'balisto', 'orbit', 'extra', 'airwaves', 'hubbabubba', 'doublemint', 'juicyfruit', 'wrigleys', 'skittles', 'starburst', 'bensoriginal', 'whiskas', 'pedigree', 'sheba', 'royalcanin', 'cesar', 'dreamies', 'frolic', 'kitekat', 'perfectfit', 'chappi', 'bekind']],
  ['Mondelēz International', ['milka', 'oreo', 'toblerone', 'cadbury', 'tuc', 'ritz', 'belvita', 'halls', 'trident', 'stimorol', 'dentyne', 'clorets', 'cotedor', 'daim', 'marabou', 'alpengold', 'lu', 'prince', 'barni', 'tassimo', 'philadelphia', 'suchard', 'mirabell', 'mikado', 'chipsahoy', 'triscuit', 'sourpatch']],
  ['The Coca-Cola Company', ['cocacola', 'fanta', 'sprite', 'cappy', 'schweppes', 'fuzetea', 'minutemaid', 'powerade', 'aquarius', 'costacoffee', 'innocent', 'dasani', 'bonaqua', 'glaceau', 'mezzomix', 'kinley', 'appletiser', 'honesttea', 'vio', 'damla']],
  ['PepsiCo', ['pepsi', '7up', 'mirinda', 'mountaindew', 'gatorade', 'tropicana', 'lays', 'doritos', 'cheetos', 'ruffles', 'quaker', 'walkers', 'tostitos', 'naked', 'kevita', 'rockstar', 'sodastream', 'sabra']],
  ['L’Oréal Groupe', ['loreal', 'garnier', 'maybelline', 'nyx', 'cerave', 'larocheposay', 'vichy', 'kiehls', 'lancome', 'kerastase', 'redken', 'essie', 'biotherm', 'giorgioarmani', 'armani', 'yvessaintlaurent', 'maisonmargiela', 'diesel']],
  ['Henkel', ['schwarzkopf', 'syoss', 'taft', 'gliss', 'fa', 'schauma', 'got2b', 'palette', 'persil', 'perwoll', 'spee', 'weisserriese', 'dixan', 'fewa', 'pril', 'somat', 'bref', 'sidolin', 'clin', 'dergeneral', 'vernel', 'silan', 'loctite', 'pattex', 'pritt', 'ceresit', 'metylan']],
  ['Reckitt', ['finish', 'calgon', 'vanish', 'durex', 'strepsils', 'nurofen', 'gaviscon', 'veet', 'dettol', 'sagrotan', 'lysol', 'harpic', 'cillitbang', 'airwick', 'woolite', 'clearasil', 'dobendan', 'enfamil']],
  ['Beiersdorf AG', ['nivea', 'eucerin', 'labello', 'hansaplast', '8x4', 'hidrofugal', 'laprairie', 'florena', 'tesa']],
  ['Estée Lauder Companies', ['esteelauder', 'mac', 'maccosmetics', 'clinique', 'bobbibrown', 'tomford', 'jomalone', 'lamer', 'aveda', 'origins', 'smashbox', 'glamglow', 'toofaced', 'bykilian', 'darphin', 'labseries']],
  ['Kenvue / Johnson & Johnson', ['johnsons', 'johnsonjohnson', 'neutrogena', 'aveeno', 'cleanandclear', 'listerine', 'obtampons', 'carefree', 'penaten', 'bebe', 'tylenol', 'imodium', 'nicorette', 'pizbuin', 'bandaid']],
  ['Ferrero Group', ['ferrero', 'ferrerorocher', 'nutella', 'kinder', 'kinderbueno', 'kinderjoy', 'kinderschokolade', 'kinderriegel', 'kinderpinguin', 'kindercountry', 'kinderdelice', 'hanuta', 'duplo', 'moncheri', 'raffaello', 'tictac', 'pocketcoffee', 'giotto', 'yogurette']],
  ['Danone', ['danone', 'activia', 'actimel', 'alpro', 'aptamil', 'nutricia', 'evian', 'volvic', 'danette', 'oikos', 'yopro', 'badoit', 'milupa', 'nutrilon']],
  ['SC Johnson', ['raid', 'glade', 'brise', 'duck', 'wcento', 'mrmuscle', 'windex', 'pledge', 'pronto', 'off', 'autan', 'ziploc', 'kiwi', 'ecover', 'mrsmeyers']],
  ['JDE Peet’s', ['jacobs', 'jacobscoffee', 'senseo', 'douweegberts', 'kenco', 'peetscoffee', 'hagcoffee', 'onko', 'moccona']],
  ['Inditex', ['zara', 'bershka', 'pullbear']],
  ['Fast Food & Coffee', ['mcdonalds', 'burgerking', 'kfc', 'pizzahut', 'subway', 'dominospizza', 'starbucks']]
];

const JUNK = new Set(['temizlik', 'gıda', 'içecek', 'kozmetik ve kişisel bakım', 'sağlık ve kişisel bakım', 'çamaşır deterjanı', 'bulaşık deterjanı', 'bulaşık makinesi deterjanı', 'yüzey temizleyici', 'tuvalet temizleyici', 'yumuşatıcı', 'cam temizleyici', 'oda kokusu', 'sünger / bez / temizlik aparatı', 'şampuan / saç bakım', 'sabun / duş jeli', 'diş macunu / ağız bakım', 'deodorant', 'tıraş / jilet', 'makyaj', 'cilt bakım / dermokozmetik', 'bebek bakım', 'makarna', 'süt ve süt ürünleri', 'dondurma', 'kahvaltılık gevrek', 'konserve / salça / sos', 'baharat', 'vegan / bitkisel ürün', 'hazır çorba / bulyon / sos', 'temel gıda / bakliyat / pirinç', 'bitkisel yağ / zeytinyağı', 'bebek gıdası / hassas kategori']);
const norm = s => (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');
function getLogoUrl(b) {
  if (b.logoUrl || b.image_url) return b.logoUrl || b.image_url;
  const firstSrc = Array.isArray(b.kaynaklar) ? b.kaynaklar.find(k => k && k.url) : null;
  if (!firstSrc) return '';
  try {
    const cleanUrl = firstSrc.url.split(',').at(0).trim();
    const host = new URL(cleanUrl).hostname.replace(/^www\./, '');
    if (['wikipedia.org', 'linkedin.com', 'timesofisrael.com', 'jpost.com', 'tag24.de'].some(d => host.includes(d))) return '';
    return `https://google.com{host}&sz=128`;
  } catch { return ''; }
}

function setLang(l) {
  lang = l; const t = I18N[l];
  document.getElementById('subTitle').textContent = t.sub;
  searchInput.placeholder = t.ph;
  document.getElementById('scanTxt').textContent = t.scan;
  document.getElementById('fAll').textContent = t.all;
  document.getElementById('fRev').textContent = t.rev;
  document.getElementById('fPref').textContent = t.pref;
  document.getElementById('fAlt').textContent = t.alt;
  if (categorySelect.options.length > 0) categorySelect.options.item(0).textContent = t.allCat;
  loadMoreBtn.textContent = t.more;
  render();
}

async function init() {
  try {
    const res = await fetch('data.json?v=' + Date.now());
    const raw = await res.json();
    const parents = new Set(raw.map(x => norm(x.anaFirma)).filter(Boolean));
    PARENT_RULES.forEach(([p]) => parents.add(norm(p)));
    const map = new Map();
function setLang(l) {
  lang = l; const t = I18N[l];
  document.getElementById('subTitle').textContent = t.sub;
  searchInput.placeholder = t.ph;
  document.getElementById('scanTxt').textContent = t.scan;
  document.getElementById('fAll').textContent = t.all;
  document.getElementById('fRev').textContent = t.rev;
  document.getElementById('fPref').textContent = t.pref;
  document.getElementById('fAlt').textContent = t.alt;
  if (categorySelect.options.length > 0) categorySelect.options.item(0).textContent = t.allCat;
  loadMoreBtn.textContent = t.more;
  render();
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
    const isPref = b.status === 'preferred', logo = getLogoUrl(b);
    const initials = b.marka.slice(0, 2).toUpperCase();
    const alts = (b.alternatifler || []).map(a => a.marka).filter(m => m && norm(m) !== norm(b.marka)).join(', ');
    const meta = [b.anaFirma ? `🏢 ${b.anaFirma}` : '', b.kategori, b.altKategori].filter(Boolean).join(' • ');
    const firstSrc = Array.isArray(b.kaynaklar) ? b.kaynaklar.find(k => k && k.url) : null;
    const fb = `if(!this.dataset.f){this.dataset.f=1;this.src='https://google.com{logo.replace('https://clearbit.com','')}&sz=128';}else{this.parentElement.textContent='${initials}';}`;
    return `<article class="card ${isPref ? 'preferred' : 'review'}" onclick="this.querySelector('.details')?.toggleAttribute('hidden')">
      <div class="card-main">
        <div class="brand-avatar">${logo ? `<img src="${logo}" alt="" loading="lazy" onerror="${fb}">` : initials}</div>
        <div class="card-info">
          <div class="card-head">
            <span class="brand-name">${b.marka}</span>
            <span class="badge ${isPref ? 'preferred' : 'review'}">${isPref ? t.pref : t.rev}</span>
          </div>
          ${meta ? `<div class="meta">${meta}</div>` : ''}
        </div>
      </div>
      ${alts ? `<div class="alt">⭐ <b>${t.altLbl}</b> ${alts}</div>` : ''}
      ${(b.not || firstSrc) ? `<div class="details" hidden>${b.not ? `<p>${b.not}</p>` : ''}${firstSrc ? `<a href="${firstSrc.url.split(',').at(0).trim()}" target="_blank" rel="noopener">${t.src}</a>` : ''}</div>` : ''}
    </article>`;
  }).join('');
  loadMoreBtn.hidden = shown >= filtered.length;
}

document.querySelectorAll('.lang-btn').forEach(b => b.onclick = () => {
  document.querySelectorAll('.lang-btn').forEach(x => x.classList.remove('active')); b.classList.add('active'); setLang(b.dataset.lang);
});
loadMoreBtn.onclick = () => { shown += 40; render(); };
searchInput.oninput = applyFilters; categorySelect.onchange = applyFilters;
document.querySelectorAll('.pill').forEach(p => p.onclick = () => {
  document.querySelectorAll('.pill').forEach(x => x.classList.remove('active')); p.classList.add('active'); currentFilter = p.dataset.filter; applyFilters();
});
const scanBox = document.getElementById('scanner-box');
document.getElementById('openScanBtn').onclick = () => {
  scanBox.hidden = false; scanner = new Html5Qrcode("reader");
  scanner.start({ facingMode: "environment" }, { fps: 10, qrbox: { width: 220, height: 140 } }, txt => { searchInput.value = txt; stopScan(); applyFilters(); }).catch(() => stopScan());
};
function stopScan() { scanBox.hidden = true; if (scanner) scanner.stop().then(() => scanner.clear()).catch(() => {}); }
document.getElementById('closeScanBtn').onclick = stopScan;
document.getElementById('manualSearchBtn').onclick = () => { searchInput.value = document.getElementById('manualBarcode').value; stopScan(); applyFilters(); };
init();
