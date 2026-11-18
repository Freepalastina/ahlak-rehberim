let allBrands = [], filtered = [], shown = 40, currentFilter = 'all', scanner = null;
const grid = document.getElementById('brandGrid');
const countBar = document.getElementById('countBar');
const searchInput = document.getElementById('searchInput');
const categorySelect = document.getElementById('categorySelect');
const loadMoreBtn = document.getElementById('loadMoreBtn');

const PARENT_RULES = [
  ['Nestlé S.A.', ['nespresso', 'nestle', 'nescafe', 'nesquik', 'kitkat', 'maggi', 'lion', 'smarties', 'aftereight', 'buitoni', 'thomy', 'wagner', 'purina', 'felix', 'cerelac', 'nan', 'beba', 'vittel', 'pellegrino', 'perrier', 'movenpick', 'smartwater', 'puredelife', 'cailler', 'crunchbar', 'rolo', 'qualitystreet', 'herta', 'garden gourmet']],
  ['Unilever', ['dove', 'axe', 'lynx', 'rexona', 'sure', 'lux', 'lifebuoy', 'signal', 'closeup', 'pepsodent', 'sunsilk', 'tresemme', 'clear', 'vaseline', 'ponds', 'omo', 'surf', 'comfort', 'cif', 'domestos', 'sunlight', 'knorr', 'hellmanns', 'calve', 'magnum', 'cornetto', 'walls', 'algida', 'benjerry', 'cartedor', 'viennetta', 'langnese', 'lipton', 'unilever', 'rama', 'becel', 'maizena', 'mondamin']],
  ['Procter & Gamble', ['ariel', 'tide', 'dash', 'vizir', 'lenor', 'downy', 'fairy', 'meisterpropper', 'mrclean', 'mrproper', 'febreze', 'swiffer', 'pampers', 'luvs', 'always', 'tampax', 'discreet', 'gillette', 'venus', 'braun', 'kingcgillette', 'oralb', 'blendamed', 'ipana', 'crest', 'headshoulders', 'pantene', 'herbalessences', 'aussie', 'olay', 'oldspice', 'secret', 'wick', 'vicks', 'metamucil']],
  ['Mars, Incorporated', ['mars', 'snickers', 'twix', 'bounty', 'mms', 'maltesers', 'milkyway', 'celebrations', 'balisto', 'orbit', 'extra', 'airwaves', 'hubbabubba', 'doublemint', 'juicyfruit', 'wrigleys', 'skittles', 'starburst', 'bensoriginal', 'whiskas', 'pedigree', 'sheba', 'royalcanin', 'cesar', 'dreamies', 'frolic', 'kitekat', 'perfectfit', 'chappi', 'bekind']],
  ['Mondelēz International', ['milka', 'oreo', 'toblerone', 'cadbury', 'tuc', 'ritz', 'belvita', 'halls', 'trident', 'stimorol', 'dentyne', 'clorets', 'cotedor', 'daim', 'marabou', 'alpengold', 'lu', 'prince', 'barni', 'tassimo', 'philadelphia', 'suchard', 'mirabell', 'mikado', 'chipsahoy', 'triscuit', 'sourpatch']],
  ['The Coca-Cola Company', ['cocacola', 'fanta', 'sprite', 'cappy', 'schweppes', 'fuzetea', 'minutemaid', 'powerade', 'aquarius', 'costacoffee', 'innocent', 'dasani', 'bonaqua', 'glaceau', 'mezzomix', 'kinley', 'appletiser', 'honesttea', 'vio', 'damla']],
  ['PepsiCo', ['pepsi', '7up', 'mirinda', 'mountaindew', 'gatorade', 'tropicana', 'lipton', 'lays', 'doritos', 'cheetos', 'ruffles', 'quaker', 'walkers', 'tostitos', 'naked', 'kevita', 'rockstar', 'sodastream', 'sabra']],
  ['L’Oréal Groupe', ['loreal', 'garnier', 'maybelline', 'nyx', 'cerave', 'larocheposay', 'vichy', 'kiehls', 'lancome', 'kerastase', 'redken', 'essie', 'biotherm', 'giorgioarmani', 'armani', 'yvessaintlaurent', 'valentino', 'prada', 'maisonmargiela', 'diesel', 'cacharel', 'urban decay', 'itcosmetics']],
  ['Henkel', ['schwarzkopf', 'syoss', 'taft', 'gliss', 'fa', 'schauma', 'got2b', 'palette', 'diadermine', 'persil', 'perwoll', 'spee', 'weisserriese', 'dixan', 'fewa', 'pril', 'somat', 'bref', 'sidolin', 'clin', 'dergeneral', 'vernel', 'silan', 'loctite', 'pattex', 'pritt', 'ceresit', 'metylan']],
  ['Reckitt', ['finish', 'calgon', 'vanish', 'durex', 'strepsils', 'nurofen', 'gaviscon', 'veet', 'dettol', 'sagrotan', 'lysol', 'harpic', 'cillitbang', 'airwick', 'woolite', 'clearasil', 'scholl', 'dobendan', 'enfamil']],
  ['Beiersdorf AG', ['nivea', 'eucerin', 'labello', 'hansaplast', '8x4', 'hidrofugal', 'laprairie', 'florena', 'tesa']],
  ['Estée Lauder Companies', ['esteelauder', 'mac', 'maccosmetics', 'clinique', 'bobbibrown', 'tomford', 'jomalone', 'lamer', 'aveda', 'origins', 'smashbox', 'glamglow', 'toofaced', 'bykilian', 'darphin', 'labseries']],
  ['Kenvue / Johnson & Johnson', ['johnsons', 'johnsonjohnson', 'neutrogena', 'aveeno', 'cleanandclear', 'listerine', 'obtampons', 'carefree', 'penaten', 'bebe', 'tylenol', 'imodium', 'nicorette', 'compeed', 'pizbuin', 'bandaid']],
  ['Ferrero Group', ['ferrero', 'ferrerorocher', 'nutella', 'kinder', 'kinderbueno', 'kinderjoy', 'kinderschokolade', 'kinderriegel', 'kinderpinguin', 'kindercountry', 'kinderdelice', 'hanuta', 'duplo', 'moncheri', 'raffaello', 'tictac', 'pocketcoffee', 'giotto', 'yogurette']],
  ['Danone', ['danone', 'activia', 'actimel', 'alpro', 'aptamil', 'nutricia', 'evian', 'volvic', 'danette', 'oikos', 'yopro', 'badoit', 'milupa', 'nutrilon']],
  ['SC Johnson', ['raid', 'glade', 'brise', 'duck', 'wcento', 'mrmuscle', 'windex', 'pledge', 'pronto', 'off', 'autan', 'ziploc', 'kiwi', 'ecover', 'mrsmeyers']],
  ['JDE Peet’s', ['jacobs', 'jacobscoffee', 'senseo', 'tassimo', 'douweegberts', 'kenco', 'peetscoffee', 'hagcoffee', 'onko', 'moccona']],
  ['Inditex', ['zara', 'bershka', 'pullbear', 'massimodutti', 'stradivarius', 'oysho']],
  ['Restaurant Brands / Yum! / McDonald’s', ['mcdonalds', 'burgerking', 'kfc', 'pizzahut', 'tacobell', 'popeyes', 'subway', 'dominospizza', 'starbucks']]
];

const JUNK = new Set(['temizlik', 'gıda', 'içecek', 'kozmetik ve kişisel bakım', 'sağlık ve kişisel bakım',
  'çamaşır deterjanı', 'bulaşık deterjanı', 'bulaşık makinesi deterjanı', 'yüzey temizleyici',
  'tuvalet temizleyici', 'yumuşatıcı', 'cam temizleyici', 'oda kokusu', 'sünger / bez / temizlik aparatı',
  'şampuan / saç bakım', 'sabun / duş jeli', 'diş macunu / ağız bakım', 'deodorant', 'tıraş / jilet',
  'makyaj', 'cilt bakım / dermokozmetik', 'bebek bakım', 'makarna', 'süt ve süt ürünleri', 'dondurma',
  'kahvaltılık gevrek', 'konserve / salça / sos', 'baharat', 'vegan / bitkisel ürün',
  'hazır çorba / bulyon / sos', 'temel gıda / bakliyat / pirinç', 'bitkisel yağ / zeytinyağı', 'bebek gıdası / hassas kategori']);

const norm = s => (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');

function resolveParent(brandName, existingParent) {
  if (existingParent && existingParent.trim()) return existingParent.trim();
  const key = norm(brandName);
  for (const [parent, list] of PARENT_RULES) {
    if (list.includes(key)) return parent;
  }
  return '';
}

async function init() {
  try {
    const res = await fetch('data.json?v=' + Date.now());
    const raw = await res.json();
    const parents = new Set(raw.map(x => norm(x.anaFirma)).filter(Boolean));
    PARENT_RULES.forEach(([p]) => parents.add(norm(p)));
    const map = new Map();

    raw.forEach(b => {
      const cleanName = (b.marka || '').replace(/:$/, '').trim();
      const key = norm(cleanName);
      if (!key || JUNK.has(cleanName.toLowerCase()) || (parents.has(key) && !b.anaFirma && !b.kategori)) return;
      const linkedParent = resolveParent(cleanName, b.anaFirma);
      const item = { ...b, marka: cleanName, anaFirma: linkedParent };
      const prev = map.get(key);
      if (!prev || (!prev.kategori && item.kategori) || (!prev.anaFirma && item.anaFirma) || (item.alternatifler?.length > (prev.alternatifler?.length || 0))) {
        map.set(key, item);
      }
    });

    allBrands = [...map.values()].sort((a, b) => a.marka.localeCompare(b.marka, 'tr'));
    [...new Set(allBrands.map(b => b.kategori).filter(Boolean))].sort()
      .forEach(c => categorySelect.add(new Option(c, c)));
    applyFilters();
  } catch { grid.innerHTML = '<p class="empty">Veriler yüklenemedi.</p>'; }
}

function applyFilters() {
  const q = searchInput.value.toLowerCase().trim();
  const cat = categorySelect.value;
  filtered = allBrands.filter(b => {
    const matchText = b.marka.toLowerCase().includes(q) ||
      (b.anaFirma || '').toLowerCase().includes(q) || (b.barkodlar || []).some(c => String(c).includes(q));
    const matchCat = cat === 'all' || b.kategori === cat;
    const hasAlt = Array.isArray(b.alternatifler) && b.alternatifler.some(a => norm(a.marka) !== norm(b.marka));
    const matchStatus = currentFilter === 'all' || b.status === currentFilter || (currentFilter === 'alt' && hasAlt);
    return matchText && matchCat && matchStatus;
  });
  shown = 40;
  render();
}

function render() {
  countBar.textContent = `${filtered.length} marka listeleniyor`;
  if (!filtered.length) { grid.innerHTML = '<p class="empty">Aramanıza uygun marka bulunamadı.</p>'; loadMoreBtn.hidden = true; return; }
  grid.innerHTML = filtered.slice(0, shown).map(b => {
    const isPref = b.status === 'preferred';
    const alts = (b.alternatifler || []).map(a => a.marka).filter(m => m && norm(m) !== norm(b.marka)).join(', ');
    const meta = [b.anaFirma ? `🏢 ${b.anaFirma}` : '', b.kategori, b.altKategori].filter(Boolean).join(' • ');
    const src = (b.kaynaklar || []);
    return `<article class="card ${isPref ? 'preferred' : 'review'}" onclick="this.querySelector('.details')?.toggleAttribute('hidden')">
      <div class="card-head">
        <span class="brand-name">${b.marka}</span>
        <span class="badge ${isPref ? 'preferred' : 'review'}">${isPref ? '🟢 Tercih Edilebilir' : '🔴 İnceleme / Boykot'}</span>
      </div>
      ${meta ? `<div class="meta">${meta}</div>` : ''}
      ${alts ? `<div class="alt">⭐ <b>Alternatifler:</b> ${alts}</div>` : ''}
      ${(b.not || src) ? `<div class="details" hidden>${b.not ? `<p>${b.not}</p>` : ''}${src?.url ? `<a href="${src.url}" target="_blank" rel="noopener">🔗 Kaynağı Görüntüle</a>` : ''}</div>` : ''}
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
