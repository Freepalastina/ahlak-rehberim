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
