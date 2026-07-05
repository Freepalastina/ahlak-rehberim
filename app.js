const VERSION = "20260705-v6-admin-panel";
let DATA = [];
let view = "home";
let filter = "all";
let currentGroup = null;
let favorites = loadFavorites();
let lang = localStorage.getItem("boykot_lang") || "tr";

const $ = id => document.getElementById(id);
const search = $("search");
const clearBtn = $("clearBtn");
const barcodeBtn = $("barcodeBtn");
const barcodeDialog = $("barcodeDialog");
const barcodeVideo = $("barcodeVideo");
const scannerStatus = $("scannerStatus");
const scannerTitle = $("scannerTitle");
const scannerHelp = $("scannerHelp");
const closeScanner = $("closeScanner");
const manualBarcode = $("manualBarcode");
let barcodeStream = null;
let barcodeTimer = null;
let barcodeDetector = null;
const stats = $("stats");
const quickActions = $("quickActions");
const quickFilters = $("quickFilters");
const sectionTitle = $("sectionTitle");
const results = $("results");
const themeBtn = $("themeBtn");
const installBtn = $("installBtn");
let deferredInstallPrompt = null;

const I = {
  tr: {
    htmlLang:"tr", kicker:"Bilinçli Tüketim Rehberi", title:"Ahlak Rehberim",
    subtitle:"Bilinçli tüket, güvenle tercih et.", search:"Marka, firma, kategori veya barkod ara...",
    navHome:"Ana", navCompanies:"Firmalar", navCategories:"Kategori", navFavorites:"Favori", navAbout:"Bilgi",
    total:"Toplam", boycott:"Boykot", caution:"Dikkat", alternative:"Alternatif",
    notBoycotted:"Boykotta Değil", review:"İnceleniyor", withAlt:"Alternatifli",
    favorites:"Favoriler", all:"Tümü", results:"sonuç", brands:"marka", companies:"Ana Firmalar",
    categories:"Kategoriler", category:"Kategori", code:"Kod", parent:"Ana Firma", barcode:"Barkod",
    details:"Ayrıntıları Gör →", close:"Kapat", source:"Kaynak", note:"Not", openSource:"Kaynağı aç",
    noResult:"Sonuç bulunamadı.", dataError:"Veri yüklenemedi.", dataHelp:"data.json dosyası index.html ile aynı klasörde olmalı.",
    safeInfo:"Bu marka boykot listesinde olmayanlar bölümüne eklendi.",
    quickTitle:"Hızlı Erişim", open:"Aç", back:"Geri",
    barcodePrompt:"Barkod numarasını yaz:", barcodeMissing:"Bu veri içinde barkod alanı yoksa eşleşme bulunmayabilir.", scanBarcode:"Barkod Tara", scanHelp:"Kamerayı barkoda doğru tut.", scannerStarting:"Kamera hazırlanıyor...", scannerFound:"Barkod bulundu:", scannerUnsupported:"Bu cihazda kamera ile barkod okuma desteklenmiyor. Manuel giriş kullanabilirsin.", scannerError:"Kamera açılamadı. Manuel giriş kullanabilirsin.", scannerSearching:"Barkod aranıyor...", manualBarcode:"Barkod numarası yaz",
    aboutTitle:"📖 Ahlak Rehberim", aboutIntro:"Markaları, ana firmaları, kategorileri ve alternatifleri hızlıca bulmak için hazırlanmış mobil uyumlu rehber.",
    listStatus:"📊 Liste Durumu",
    listStatusText:c=>`${c.total} toplam kayıt var. ${c.boykot} boykot, ${c.safe} boykotta değil, ${c.altli} alternatif bilgisi içeriyor.`,
    safeText:"Bu bölüm, eklenen alternatif listesinden gelen ve ana boykot listesinde bulunmayan markaları gösterir.",
    howSearch:"🔍 Nasıl Aranır?", howSearchText:"Arama kutusuna marka adı, ana firma, kategori, alternatif veya barkod yazabilirsin.",
    companiesText:"Aynı şirkete ait markaları görmek için Firmalar bölümünü aç.",
    favText:"Kalp işaretine basarak markaları favorilere ekleyebilirsin.",
    altText:"Alternatif olarak gösterilen ürünler aynı ürün grubunda değerlendirilebilecek seçeneklerdir. Satın almadan önce kendi araştırmanı yapman tavsiye edilir.",
    disclaimer:"⚠️ Bilgilendirme", disclaimerText:"Bu uygulama yalnızca bilgilendirme amacıyla hazırlanmıştır. Bilgiler farklı kaynaklardan derlenmiştir ve zamanla değişebilir.",
    update:"🔄 Güncelleme", updateText:"Yeni marka eklemek veya bilgileri değiştirmek için data.json dosyasını güncellemen yeterlidir.", installApp:"Uygulamayı kur", updateReady:"Yeni sürüm hazır. Sayfayı yenile.", offlineReady:"Uygulama çevrimdışı kullanım için hazır."
  },
  en: {
    htmlLang:"en", kicker:"Conscious Choice Guide", title:"Ahlak Rehberim",
    subtitle:"Choose consciously, shop with confidence.", search:"Search brand, company, category or barcode...",
    navHome:"Home", navCompanies:"Companies", navCategories:"Category", navFavorites:"Favorite", navAbout:"About",
    total:"Total", boycott:"Boycott", caution:"Caution", alternative:"Alternative",
    notBoycotted:"Not Boycotted", review:"Under Review", withAlt:"With Alternatives",
    favorites:"Favorites", all:"All", results:"results", brands:"brands", companies:"Parent Companies",
    categories:"Categories", category:"Category", code:"Code", parent:"Parent Company", barcode:"Barcode",
    details:"View Details →", close:"Close", source:"Source", note:"Note", openSource:"Open source",
    noResult:"No results found.", dataError:"Data could not be loaded.", dataHelp:"data.json must be in the same folder as index.html.",
    safeInfo:"This brand was added to the Not Boycotted section.",
    quickTitle:"Quick Access", open:"Open", back:"Back",
    barcodePrompt:"Enter barcode number:", barcodeMissing:"If barcode data is not present, no match may be found.", scanBarcode:"Scan Barcode", scanHelp:"Point your camera at the barcode.", scannerStarting:"Preparing camera...", scannerFound:"Barcode found:", scannerUnsupported:"Camera barcode scanning is not supported on this device. You can use manual entry.", scannerError:"Could not open camera. You can use manual entry.", scannerSearching:"Searching barcode...", manualBarcode:"Enter barcode number",
    aboutTitle:"📖 Ahlak Rehberim", aboutIntro:"A mobile-friendly guide for quickly finding brands, parent companies, categories and alternatives.",
    listStatus:"📊 List Status",
    listStatusText:c=>`${c.total} total records. ${c.boykot} boycott entries, ${c.safe} not boycotted entries, ${c.altli} include alternatives.`,
    safeText:"This section shows brands from the added alternatives list that are not found in the main boycott list.",
    howSearch:"🔍 How to Search", howSearchText:"Search by brand name, parent company, category, alternative or barcode.",
    companiesText:"Open Companies to view brands that belong to the same parent company.",
    favText:"Tap the heart to add brands to favorites.",
    altText:"Suggested alternatives are options in the same product group. Please do your own research before buying.",
    disclaimer:"⚠️ Disclaimer", disclaimerText:"This app is for informational purposes only. Information is compiled from different sources and may change over time.",
    update:"🔄 Updates", updateText:"To add or edit brands, update the data.json file.", installApp:"Install app", updateReady:"New version ready. Refresh the page.", offlineReady:"App is ready for offline use."
  },
  de: {
    htmlLang:"de", kicker:"Bewusster Konsum", title:"Ahlak Rehberim",
    subtitle:"Bewusst konsumieren, sicher wählen.", search:"Marke, Firma, Kategorie oder Barcode suchen...",
    navHome:"Start", navCompanies:"Firmen", navCategories:"Kategorie", navFavorites:"Favorit", navAbout:"Info",
    total:"Gesamt", boycott:"Boykott", caution:"Achtung", alternative:"Alternative",
    notBoycotted:"Nicht boykottiert", review:"In Prüfung", withAlt:"Mit Alternativen",
    favorites:"Favoriten", all:"Alle", results:"Ergebnisse", brands:"Marken", companies:"Mutterfirmen",
    categories:"Kategorien", category:"Kategorie", code:"Code", parent:"Mutterfirma", barcode:"Barcode",
    details:"Details ansehen →", close:"Schließen", source:"Quelle", note:"Notiz", openSource:"Quelle öffnen",
    noResult:"Keine Ergebnisse gefunden.", dataError:"Daten konnten nicht geladen werden.", dataHelp:"data.json muss im selben Ordner wie index.html liegen.",
    safeInfo:"Diese Marke wurde dem Bereich Nicht boykottiert hinzugefügt.",
    quickTitle:"Schnellzugriff", open:"Öffnen", back:"Zurück",
    barcodePrompt:"Barcode-Nummer eingeben:", barcodeMissing:"Wenn keine Barcode-Daten vorhanden sind, wird eventuell nichts gefunden.", scanBarcode:"Barcode scannen", scanHelp:"Halte die Kamera auf den Barcode.", scannerStarting:"Kamera wird vorbereitet...", scannerFound:"Barcode gefunden:", scannerUnsupported:"Barcode-Scan mit Kamera wird auf diesem Gerät nicht unterstützt. Du kannst die manuelle Eingabe nutzen.", scannerError:"Kamera konnte nicht geöffnet werden. Du kannst die manuelle Eingabe nutzen.", scannerSearching:"Barcode wird gesucht...", manualBarcode:"Barcode-Nummer eingeben",
    aboutTitle:"📖 Ahlak Rehberim", aboutIntro:"Ein mobiler Ratgeber, um Marken, Mutterfirmen, Kategorien und Alternativen schnell zu finden.",
    listStatus:"📊 Listenstatus",
    listStatusText:c=>`${c.total} Einträge. ${c.boykot} Boykott, ${c.safe} nicht boykottiert, ${c.altli} mit Alternativen.`,
    safeText:"Dieser Bereich zeigt Marken aus der Alternativliste, die nicht in der Haupt-Boykottliste vorkommen.",
    howSearch:"🔍 So suchst du", howSearchText:"Suche nach Marke, Mutterfirma, Kategorie, Alternative oder Barcode.",
    companiesText:"Öffne Firmen, um Marken derselben Mutterfirma zu sehen.",
    favText:"Tippe auf das Herz, um Marken zu Favoriten hinzuzufügen.",
    altText:"Vorgeschlagene Alternativen sind Optionen aus derselben Produktgruppe. Bitte selbst prüfen.",
    disclaimer:"⚠️ Hinweis", disclaimerText:"Diese App dient nur zur Information. Daten können sich ändern.",
    update:"🔄 Aktualisierung", updateText:"Um Daten zu ändern, aktualisiere die Datei data.json.", installApp:"App installieren", updateReady:"Neue Version bereit. Seite neu laden.", offlineReady:"App ist für Offline-Nutzung bereit."
  }
};

function t(k){return (I[lang] && I[lang][k]) || I.tr[k] || k}
function esc(s){return String(s ?? "").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;")}
function norm(s){return String(s||"").toLocaleLowerCase("tr-TR").normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[’'`´]/g,"").replace(/[^a-z0-9ğüşöçıİĞÜŞÖÇäöüß]+/gi," ").trim()}
function get(o,names){for(const n of names){if(o && o[n]!==undefined && o[n]!==null && String(o[n]).trim()!=="") return String(o[n]).trim()}return ""}
function loadFavorites(){try{return JSON.parse(localStorage.getItem("ahlak_favorites_v4")||"[]")}catch{return[]}}
function saveFavorites(){localStorage.setItem("ahlak_favorites_v4",JSON.stringify(favorites))}
function favKey(m){return norm(m)}
function isFav(m){return favorites.includes(favKey(m))}
function toggleFav(m){const k=favKey(m); favorites=isFav(m)?favorites.filter(x=>x!==k):[...favorites,k]; saveFavorites(); render()}

function rawStatus(r,kod){
  const d=norm(get(r,["durum","Durum","status"]));
  if(d.includes("boykottadegil") || d.includes("boykotta degil") || d.includes("not boycotted") || d==="safe") return "safe";
  if(d.includes("alternatif") || d.includes("alternative")) return "alternatif";
  if(d.includes("dikkat") || d.includes("caution")) return "dikkat";
  if(d.includes("incelen") || d.includes("review")) return "inceleme";
  if(/^E/i.test(kod)) return "safe";
  if(/^C/i.test(kod)) return "alternatif";
  if(/^B/i.test(kod)) return "dikkat";
  if(/^D/i.test(kod)) return "inceleme";
  return "boykot";
}
function statusLabel(s){
  return {boykot:`🔴 ${t("boycott")}`,dikkat:`🟠 ${t("caution")}`,alternatif:`🟢 ${t("alternative")}`,safe:`✅ ${t("notBoycotted")}`,inceleme:`⚪ ${t("review")}`}[s] || s
}
function hasAlternative(x){
  const a=norm(x.alternatif);
  return !!a && !a.includes("alternatif manuel eklenmeli");
}
function normalizeItem(raw,i){
  const marka=get(raw,["marka","Marka","brand"]) || `Marka ${i+1}`;
  const anaFirma=get(raw,["anaFirma","anafirma","Ana Firma","AnaFirma","ana_firma","parentCompany"]) || marka;
  const kod=get(raw,["kod","Kod","code"]) || "";
  const kategori=get(raw,["kategori","Kategori","category"]);
  const alternatif=get(raw,["alternatif","Alternatif","alternative","alternatives"]);
  const kaynak=get(raw,["kaynak","Kaynak","kanyak","source","link"]);
  const not=get(raw,["not","Not","note"]);
  const barkod=get(raw,["barkod","Barkod","barcode","ean","EAN","gtin","GTIN"]);
  const status=rawStatus(raw,kod);
  const hay=norm([marka,anaFirma,kategori,alternatif,kaynak,not,barkod,statusLabel(status)].join(" "));
  return {marka,anaFirma,kod,kategori,alternatif,kaynak,not,barkod,status,hay,created:i};
}


function loadLocalDataOverride(){
  try{
    const raw = localStorage.getItem("ahlak_data_override_v6");
    if(!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : null;
  }catch{return null}
}
function saveLocalDataOverride(){
  const raw = DATA.map(x => ({
    marka: x.marka,
    anaFirma: x.anaFirma,
    kategori: x.kategori,
    alternatif: x.alternatif,
    kaynak: x.kaynak,
    not: x.not,
    barkod: x.barkod,
    durum: x.status
  }));
  localStorage.setItem("ahlak_data_override_v6", JSON.stringify(raw));
}
function downloadDataJson(){
  const raw = DATA.map(x => {
    const item = {
      marka: x.marka,
      anaFirma: x.anaFirma,
      kategori: x.kategori,
      alternatif: x.alternatif,
      kaynak: x.kaynak,
      not: x.not,
      durum: x.status
    };
    if(x.barkod){
      item.barkod = x.barkod;
    }
    Object.keys(item).forEach(k => {
      if(item[k] === "" || item[k] === null || item[k] === undefined) delete item[k];
    });
    return item;
  });
  const text = JSON.stringify(raw, null, 2);
  const blob = new Blob([text], {type:"application/json"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "data.json";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  toast(t("downloaded"));
}
function importDataJson(file){
  if(!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try{
      const parsed = JSON.parse(reader.result);
      const list = Array.isArray(parsed) ? parsed : (Array.isArray(parsed.data) ? parsed.data : []);
      DATA = list.map(normalizeItem).sort((a,b)=>a.marka.localeCompare(b.marka,"tr"));
      saveLocalDataOverride();
      toast(t("dataSaved"));
      view = "admin";
      render();
    }catch(e){
      toast(t("dataError"));
    }
  };
  reader.readAsText(file, "utf-8");
}
function adminOptions(){
  return DATA
    .map(x=>x.marka)
    .filter((v,i,a)=>v && a.indexOf(v)===i)
    .sort((a,b)=>a.localeCompare(b,"tr"))
    .map(name=>`<option value="${esc(name)}">${esc(name)}</option>`)
    .join("");
}
function getAdminFormValues(){
  const barkodRaw = $("adminBarkod").value.trim();
  const barkod = barkodRaw.includes(",") || barkodRaw.includes(";")
    ? barkodRaw.split(/[;,]+/).map(x=>x.trim()).filter(Boolean)
    : barkodRaw;
  return {
    marka: $("adminMarka").value.trim(),
    anaFirma: $("adminAnaFirma").value.trim(),
    kategori: $("adminKategori").value.trim(),
    alternatif: $("adminAlternatif").value.trim(),
    kaynak: $("adminKaynak").value.trim(),
    not: $("adminNot").value.trim(),
    barkod,
    durum: $("adminDurum").value
  };
}
function fillAdminForm(name){
  const item = DATA.find(x=>x.marka === name);
  if(!item) return;
  $("adminMarka").value = item.marka || "";
  $("adminAnaFirma").value = item.anaFirma || "";
  $("adminKategori").value = item.kategori || "";
  $("adminAlternatif").value = item.alternatif || "";
  $("adminKaynak").value = item.kaynak || "";
  $("adminNot").value = item.not || "";
  $("adminBarkod").value = Array.isArray(item.barkod) ? item.barkod.join(", ") : (item.barkod || "");
  $("adminDurum").value = item.status || "boykot";
}
function clearAdminForm(){
  ["adminMarka","adminAnaFirma","adminKategori","adminAlternatif","adminKaynak","adminNot","adminBarkod"].forEach(id=>$(id).value="");
  $("adminDurum").value = "boykot";
}
function saveAdminBrand(){
  const raw = getAdminFormValues();
  if(!raw.marka){
    toast(t("requiredBrand"));
    return;
  }
  if(!raw.anaFirma) raw.anaFirma = raw.marka;
  const idx = DATA.findIndex(x=>norm(x.marka) === norm(raw.marka));
  const normalized = normalizeItem(raw, idx >= 0 ? idx : DATA.length);
  if(idx >= 0){
    DATA[idx] = normalized;
    toast(t("dataSaved"));
  }else{
    DATA.push(normalized);
    toast(t("dataAdded"));
  }
  DATA.sort((a,b)=>a.marka.localeCompare(b.marka,"tr"));
  saveLocalDataOverride();
  renderAdmin();
}
function deleteAdminBrand(){
  const name = $("adminSelect").value || $("adminMarka").value;
  if(!name) return;
  if(!confirm(t("confirmDelete"))) return;
  DATA = DATA.filter(x=>x.marka !== name);
  saveLocalDataOverride();
  clearAdminForm();
  toast(t("dataDeleted"));
  renderAdmin();
}
function renderAdmin(){
  stats.innerHTML="";
  quickActions.innerHTML="";
  quickFilters.innerHTML="";
  sectionTitle.innerHTML=`<h2>⚙️ ${t("admin")}</h2><span>${DATA.length} ${t("brands")}</span>`;
  results.innerHTML = `
    <section class="adminPanel">
      <p class="adminNotice">${esc(t("localOnly"))}</p>

      <div class="adminTools">
        <button type="button" onclick="downloadDataJson()">⬇️ ${esc(t("exportData"))}</button>
        <label class="importLabel">⬆️ ${esc(t("importData"))}<input id="adminImport" type="file" accept=".json,application/json"></label>
      </div>

      <div class="adminSelectRow">
        <label>${esc(t("chooseBrand"))}</label>
        <select id="adminSelect">
          <option value="">—</option>
          ${adminOptions()}
        </select>
      </div>

      <div class="adminForm">
        <label>${esc(t("brandName"))}<input id="adminMarka" type="text"></label>
        <label>${esc(t("parent"))}<input id="adminAnaFirma" type="text"></label>
        <label>${esc(t("category"))}<input id="adminKategori" type="text"></label>
        <label>${esc(t("alternative"))}<textarea id="adminAlternatif"></textarea></label>
        <label>${esc(t("barcode"))}<textarea id="adminBarkod" placeholder="3017620422003, 869..."></textarea></label>
        <label>${esc(t("source"))}<input id="adminKaynak" type="text"></label>
        <label>${esc(t("note"))}<textarea id="adminNot"></textarea></label>
        <label>Durum
          <select id="adminDurum">
            <option value="boykot">${esc(t("boycott"))}</option>
            <option value="safe">${esc(t("notBoycotted"))}</option>
            <option value="alternatif">${esc(t("alternative"))}</option>
            <option value="dikkat">${esc(t("caution"))}</option>
            <option value="inceleme">${esc(t("review"))}</option>
          </select>
        </label>
      </div>

      <div class="adminButtons">
        <button type="button" onclick="saveAdminBrand()">✅ ${esc(t("save"))}</button>
        <button type="button" onclick="clearAdminForm()">🧹 ${esc(t("resetForm"))}</button>
        <button type="button" class="danger" onclick="deleteAdminBrand()">🗑️ ${esc(t("deleteBrand"))}</button>
      </div>
    </section>`;
  $("adminSelect").addEventListener("change", e=>fillAdminForm(e.target.value));
  $("adminImport").addEventListener("change", e=>importDataJson(e.target.files[0]));
}

async function clearOldCaches(){
  try{
    if("caches" in window){
      const keys=await caches.keys();
      await Promise.all(keys.filter(k=>k.includes("boykot") || k.includes("ahlak")).map(k=>caches.delete(k)));
    }
  }catch(e){}
}
async function init(){
  applyTheme();
  applyLang();
  await clearOldCaches();
  try{
    const res=await fetch(`data.json?v=${VERSION}`,{cache:"reload"});
    if(!res.ok) throw new Error(`data.json: ${res.status}`);
    const json=await res.json();
    const override = loadLocalDataOverride();
    const list = override || (Array.isArray(json) ? json : (Array.isArray(json.data) ? json.data : []));
    DATA=list.map(normalizeItem).sort((a,b)=>a.marka.localeCompare(b.marka,"tr"));
    render();
  }catch(err){
    stats.innerHTML="";
    quickActions.innerHTML="";
    quickFilters.innerHTML="";
    sectionTitle.innerHTML="";
    results.innerHTML=`<div class="empty"><b>${esc(t("dataError"))}</b><br>${esc(err.message)}<br><br>${esc(t("dataHelp"))}</div>`;
  }
}
function counts(){
  return {
    total:DATA.length,
    boykot:DATA.filter(x=>x.status==="boykot").length,
    dikkat:DATA.filter(x=>x.status==="dikkat").length,
    alternatif:DATA.filter(x=>x.status==="alternatif").length,
    safe:DATA.filter(x=>x.status==="safe").length,
    inceleme:DATA.filter(x=>x.status==="inceleme").length,
    altli:DATA.filter(hasAlternative).length,
    fav:favorites.length,
    firmalar:new Set(DATA.map(x=>x.anaFirma||"-")).size,
    kategoriler:new Set(DATA.map(x=>x.kategori||"-").filter(x=>x && x !== "-")).size
  };
}
function renderStats(){
  const c=counts();
  stats.innerHTML=`
    <button class="stat red" data-stat="boykot" type="button"><small>🔴 ${t("boycott")}</small><b>${c.boykot}</b></button>
    <button class="stat safe" data-stat="safe" type="button"><small>✅ ${t("notBoycotted")}</small><b>${c.safe}</b></button>
    <button class="stat green" data-stat="altli" type="button"><small>⭐ ${t("withAlt")}</small><b>${c.altli}</b></button>
    <button class="stat gray" data-stat="inceleme" type="button"><small>⚪ ${t("review")}</small><b>${c.inceleme}</b></button>`;
}
function renderQuickActions(){
  const c=counts();
  quickActions.innerHTML=`
    <h2>${t("quickTitle")}</h2>
    <div class="quickGrid">
      <button data-go="companies" type="button"><span>🏢</span><b>${t("companies")}</b><small>${c.firmalar}</small></button>
      <button data-go="categories" type="button"><span>📂</span><b>${t("categories")}</b><small>${c.kategoriler}</small></button>
      <button data-go="alternatives" type="button"><span>⭐</span><b>${t("withAlt")}</b><small>${c.altli}</small></button>
      <button data-go="favorites" type="button"><span>❤️</span><b>${t("favorites")}</b><small>${c.fav}</small></button>
      <button data-export-barcodes="1" type="button"><span>📦</span><b>${t("exportBarcodes")}</b><small>JSON</small></button>
      <button data-go="admin" type="button"><span>⚙️</span><b>${t("admin")}</b><small>JSON</small></button>
    </div>`;
}
function renderFilters(){
  const arr=[
    ["all",t("all")],
    ["boykot",`🔴 ${t("boycott")}`],
    ["safe",`✅ ${t("notBoycotted")}`],
    ["altli",`⭐ ${t("withAlt")}`],
    ["inceleme",`⚪ ${t("review")}`],
    ["fav",`❤️ ${t("favorites")}`]
  ];
  quickFilters.innerHTML=arr.map(([k,l])=>`<button class="chip ${filter===k?'active':''}" data-filter="${k}" type="button">${l}</button>`).join("");
}
function filteredList(base=DATA){
  const q=norm(search.value);
  return base.filter(x=>{
    const okQ=!q || x.hay.includes(q);
    const okF=filter==="all"
      || (filter==="boykot" && x.status==="boykot")
      || (filter==="safe" && x.status==="safe")
      || (filter==="altli" && hasAlternative(x))
      || (filter==="inceleme" && x.status==="inceleme")
      || (filter==="fav" && isFav(x.marka));
    return okQ && okF;
  }).sort((a,b)=>Number(isFav(b.marka))-Number(isFav(a.marka)) || a.marka.localeCompare(b.marka,"tr"));
}
function badge(x){
  return `<span class="badge ${x.status}">${statusLabel(x.status)} <b>${esc(x.kod||"")}</b></span>`;
}
function altHtml(x){
  if(x.status==="safe" && !x.alternatif) return `<div class="altBox"><span>${t("notBoycotted")}</span><b>${t("safeInfo")}</b></div>`;
  if(!hasAlternative(x)) return `<div class="altBox"><span>${t("alternative")}</span><b>-</b></div>`;
  const tags=x.alternatif.split(/[;,•]/).map(v=>v.trim()).filter(Boolean).slice(0,8);
  return `<div class="altBox"><span>${t("alternative")}</span><div class="tags">${tags.map(v=>`<em>${esc(v)}</em>`).join("")}</div></div>`;
}
function card(x){
  return `<article class="card ${x.status}" data-brand="${encodeURIComponent(x.marka)}">
    <div class="cardTop">
      <div>
        <div class="badgeLine">${badge(x)}${hasAlternative(x)?`<span class="badge alternatif">⭐ ${t("withAlt")}</span>`:""}</div>
        <h3>${esc(x.marka)}</h3>
        <div class="company">🏢 ${esc(x.anaFirma||"-")}</div>
      </div>
      <button class="fav" data-fav="${encodeURIComponent(x.marka)}" type="button" aria-label="Favori">${isFav(x.marka)?"❤️":"♡"}</button>
    </div>
    <div class="meta metaSingle"><div class="box"><span>${t("category")}</span><b>${esc(x.kategori||"-")}</b></div></div>
    ${altHtml(x)}
    <button class="more" type="button">${t("details")}</button>
  </article>`;
}
function titleFor(){
  if(currentGroup) return currentGroup.title;
  if(view==="boykot" || filter==="boykot") return `🔴 ${t("boycott")}`;
  if(view==="safe" || filter==="safe") return `✅ ${t("notBoycotted")}`;
  if(view==="favorites" || filter==="fav") return `❤️ ${t("favorites")}`;
  if(view==="alternatives" || filter==="altli") return `⭐ ${t("withAlt")}`;
  return t("all");
}
function renderHome(base=DATA){
  const list=filteredList(base);
  renderStats();
  renderQuickActions();
  renderFilters();
  sectionTitle.innerHTML=`<h2>${esc(titleFor())}</h2><span>${list.length} ${t("results")}</span>`;
  results.innerHTML=list.length
    ? list.slice(0,800).map(card).join("") + (list.length>800 ? `<div class="empty">800 ${t("results")}. Daha dar arama yap.</div>` : "")
    : `<div class="empty">${t("noResult")}</div>`;
}
function groupBy(key,base=DATA){
  const m=new Map();
  for(const x of base){
    const name=x[key] || "-";
    if(!m.has(name)) m.set(name,[]);
    m.get(name).push(x);
  }
  return [...m.entries()].sort((a,b)=>b[1].length-a[1].length || a[0].localeCompare(b[0],"tr"));
}
function renderCompanies(){
  currentGroup=null;
  renderStats();
  renderQuickActions();
  quickFilters.innerHTML="";
  search.value="";
  const g=groupBy("anaFirma");
  sectionTitle.innerHTML=`<h2>🏢 ${t("companies")}</h2><span>${g.length}</span>`;
  results.innerHTML=g.map(([name,items])=>`<button class="group" data-company="${encodeURIComponent(name)}" type="button">
    <div><b>${esc(name)}</b><small>${items.slice(0,4).map(x=>esc(x.marka)).join(", ")}${items.length>4?"...":""}</small></div>
    <div class="count">${items.length}</div>
  </button>`).join("");
}
function categoryIcon(name){
  const n=norm(name);
  if(n.includes("icecek")||n.includes("su")) return "🥤";
  if(n.includes("gida")||n.includes("cikolata")||n.includes("biskuvi")) return "🍫";
  if(n.includes("temizlik")||n.includes("bulasik")) return "🧼";
  if(n.includes("kozmetik")||n.includes("bakim")) return "💄";
  if(n.includes("saglik")||n.includes("ilac")||n.includes("vitamin")) return "💊";
  if(n.includes("giyim")) return "👕";
  if(n.includes("oyuncak")) return "🧸";
  return "📂";
}
function renderCategories(){
  currentGroup=null;
  renderStats();
  renderQuickActions();
  quickFilters.innerHTML="";
  search.value="";
  const g=groupBy("kategori").filter(([name])=>name && name !== "-");
  sectionTitle.innerHTML=`<h2>📂 ${t("categories")}</h2><span>${g.length}</span>`;
  results.innerHTML=g.map(([name,items])=>`<button class="group categoryGroup" data-category="${encodeURIComponent(name)}" type="button">
    <div><b>${categoryIcon(name)} ${esc(name)}</b><small>${items.length} ${t("brands")}</small></div>
    <div class="count">${items.length}</div>
  </button>`).join("");
}
function renderAbout(){
  const c=counts();
  currentGroup=null;
  stats.innerHTML="";
  quickActions.innerHTML="";
  quickFilters.innerHTML="";
  sectionTitle.innerHTML="";
  search.value="";
  results.innerHTML=`<section class="aboutHero"><h2>${t("aboutTitle")}</h2><p>${t("aboutIntro")}</p></section>
  <div class="aboutGrid">
    <div class="aboutCard"><h3>${t("listStatus")}</h3><p>${I[lang].listStatusText(c)}</p></div>
    <div class="aboutCard"><h3>✅ ${t("notBoycotted")}</h3><p>${t("safeText")}</p></div>
    <div class="aboutCard"><h3>${t("howSearch")}</h3><p>${t("howSearchText")}</p></div>
    <div class="aboutCard"><h3>🏢 ${t("companies")}</h3><p>${t("companiesText")}</p></div>
    <div class="aboutCard"><h3>❤️ ${t("favorites")}</h3><p>${t("favText")}</p></div>
    <div class="aboutCard"><h3>⭐ ${t("alternative")}</h3><p>${t("altText")}</p></div>
    <div class="aboutCard"><h3>${t("disclaimer")}</h3><p>${t("disclaimerText")}</p></div>
    <div class="aboutCard"><h3>${t("update")}</h3><p>${t("updateText")}</p></div>
  </div>`;
}
function render(){
  document.querySelectorAll(".bottomNav button").forEach(b=>b.classList.toggle("active",b.dataset.view===view));
  if(currentGroup) return renderHome(currentGroup.items);
  if(view==="home") return renderHome();
  if(view==="boykot"){filter="boykot"; return renderHome();}
  if(view==="safe"){filter="safe"; return renderHome();}
  if(view==="alternatives"){filter="altli"; return renderHome();}
  if(view==="favorites"){filter="fav"; return renderHome();}
  if(view==="companies") return renderCompanies();
  if(view==="categories") return renderCategories();
  if(view==="admin") return renderAdmin();
  if(view==="about") return renderAbout();
}
function detail(x){
  const d=$("detailDialog"), c=$("detailContent");
  c.innerHTML=`<div class="detailHead"><h2>${esc(x.marka)}</h2><p>${statusLabel(x.status)}</p></div>
  <div class="detailBody">
    <div class="detailLine"><span>${t("parent")}</span><b>${esc(x.anaFirma||"-")}</b></div>
    <div class="detailLine"><span>${t("category")}</span><b>${esc(x.kategori||"-")}</b></div>
    <div class="detailLine"><span>${t("barcode")}</span><b>${esc(x.barkod||"-")}</b></div>
    <div class="detailLine"><span>${t("alternative")}</span><b>${esc(x.alternatif||"-")}</b></div>
    <div class="detailLine"><span>${t("note")}</span><b>${esc(x.not||"-")}</b></div>
    <div class="detailLine"><span>${t("source")}</span><b>${x.kaynak && /^https?:\/\//i.test(x.kaynak)?`<a href="${esc(x.kaynak)}" target="_blank" rel="noopener">${t("openSource")}</a>`:esc(x.kaynak||"-")}</b></div>
  </div>`;
  d.showModal();
}
function applyTheme(){
  const dark=localStorage.getItem("ahlak_theme")==="dark";
  document.body.classList.toggle("dark",dark);
  themeBtn.textContent=dark ? "☀️" : "🌙";
}
function applyLang(){
  document.documentElement.lang=t("htmlLang");
  $("kicker").textContent=t("kicker");
  $("appTitle").textContent=t("title");
  $("appSubtitle").textContent=t("subtitle");
  search.placeholder=t("search");
  $("closeDialog").textContent=t("close");
  document.querySelectorAll("[data-i]").forEach(el=>el.textContent=t(el.dataset.i));
  document.querySelectorAll(".langSwitch button").forEach(b=>b.classList.toggle("active",b.dataset.lang===lang));
  setScannerText();
  if(installBtn) installBtn.title = t("installApp");
}
function goHome(){
  currentGroup=null;
  view="home";
  filter="all";
  render();
}


function setScannerText(){
  if(scannerTitle) scannerTitle.textContent = t("scanBarcode");
  if(scannerHelp) scannerHelp.textContent = t("scanHelp");
  if(manualBarcode) manualBarcode.textContent = t("manualBarcode");
}
function manualBarcodeSearch(){
  const code = prompt(`${t("barcodePrompt")}\n${t("barcodeMissing")}`);
  if(code){
    stopBarcodeScanner();
    search.value = code.trim();
    currentGroup = null;
    view = "home";
    filter = "all";
    render();
  }
}
async function startBarcodeScanner(){
  setScannerText();
  if(!barcodeDialog || !barcodeVideo){
    manualBarcodeSearch();
    return;
  }

  barcodeDialog.showModal();
  scannerStatus.textContent = t("scannerStarting");

  if(!("BarcodeDetector" in window)){
    scannerStatus.textContent = t("scannerUnsupported");
    return;
  }

  try{
    const formats = ["ean_13","ean_8","upc_a","upc_e","code_128","code_39","code_93","itf","codabar"];
    barcodeDetector = new BarcodeDetector({formats});
    barcodeStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: "environment" } },
      audio: false
    });

    barcodeVideo.srcObject = barcodeStream;
    await barcodeVideo.play();
    scannerStatus.textContent = t("scannerSearching");

    barcodeTimer = setInterval(scanBarcodeFrame, 450);
  }catch(err){
    scannerStatus.textContent = t("scannerError");
  }
}
async function scanBarcodeFrame(){
  if(!barcodeDetector || !barcodeVideo || barcodeVideo.readyState < 2) return;
  try{
    const codes = await barcodeDetector.detect(barcodeVideo);
    if(codes && codes.length){
      const value = codes[0].rawValue || "";
      if(value){
        scannerStatus.textContent = `${t("scannerFound")} ${value}`;
        stopBarcodeScanner(false);
        search.value = value;
        currentGroup = null;
        view = "home";
        filter = "all";
        render();
      }
    }
  }catch(e){}
}
function stopBarcodeScanner(close=true){
  if(barcodeTimer){
    clearInterval(barcodeTimer);
    barcodeTimer = null;
  }
  if(barcodeStream){
    barcodeStream.getTracks().forEach(track=>track.stop());
    barcodeStream = null;
  }
  if(barcodeVideo){
    barcodeVideo.pause();
    barcodeVideo.srcObject = null;
  }
  if(close && barcodeDialog && barcodeDialog.open){
    barcodeDialog.close();
  }
}


function toast(message){
  const el = document.createElement("div");
  el.className = "toast";
  el.textContent = message;
  document.body.appendChild(el);
  requestAnimationFrame(()=>el.classList.add("show"));
  setTimeout(()=>{
    el.classList.remove("show");
    setTimeout(()=>el.remove(), 300);
  }, 2800);
}
function setupInstallPrompt(){
  if(!installBtn) return;
  installBtn.title = t("installApp");
  window.addEventListener("beforeinstallprompt", event=>{
    event.preventDefault();
    deferredInstallPrompt = event;
    installBtn.hidden = false;
  });
  installBtn.addEventListener("click", async ()=>{
    if(!deferredInstallPrompt) return;
    installBtn.hidden = true;
    deferredInstallPrompt.prompt();
    await deferredInstallPrompt.userChoice;
    deferredInstallPrompt = null;
  });
  window.addEventListener("appinstalled", ()=>{
    deferredInstallPrompt = null;
    installBtn.hidden = true;
  });
}
function setupServiceWorker(){
  if(!("serviceWorker" in navigator)) return;
  navigator.serviceWorker.register(`sw.js?v=${VERSION}`).then(reg=>{
    if(reg.waiting){
      toast(t("updateReady"));
    }
    reg.addEventListener("updatefound", ()=>{
      const worker = reg.installing;
      if(!worker) return;
      worker.addEventListener("statechange", ()=>{
        if(worker.state === "installed" && navigator.serviceWorker.controller){
          toast(t("updateReady"));
        }
      });
    });
  }).catch(()=>{});
  navigator.serviceWorker.addEventListener("controllerchange", ()=>{
    // prevent forced reload loops; user can refresh manually
  });
}

search.addEventListener("input",()=>{currentGroup=null;if(view!=="home"){view="home";filter="all"} render();});
clearBtn.addEventListener("click",()=>{search.value="";search.focus();currentGroup=null;render();});
barcodeBtn.addEventListener("click",()=>startBarcodeScanner());
if(closeScanner){closeScanner.addEventListener("click",()=>stopBarcodeScanner());}
if(manualBarcode){manualBarcode.addEventListener("click",()=>manualBarcodeSearch());}
quickFilters.addEventListener("click",e=>{const b=e.target.closest("[data-filter]"); if(!b)return; currentGroup=null; filter=b.dataset.filter; view="home"; render();});
quickActions.addEventListener("click",e=>{
  const exportBtn = e.target.closest("[data-export-barcodes]");
  if(exportBtn){ exportLearnedBarcodes(); return; }
  const b=e.target.closest("[data-go]");
  if(!b)return;
  currentGroup=null;
  view=b.dataset.go;
  if(view==="alternatives")filter="altli";
  if(view==="favorites")filter="fav";
  render();
});
stats.addEventListener("click",e=>{const b=e.target.closest("[data-stat]"); if(!b)return; currentGroup=null; filter=b.dataset.stat; view=filter==="safe"?"safe":"home"; render();});
results.addEventListener("click",e=>{
  const f=e.target.closest("[data-fav]");
  if(f){e.stopPropagation();toggleFav(decodeURIComponent(f.dataset.fav));return}
  const g=e.target.closest("[data-company]");
  if(g){
    const name=decodeURIComponent(g.dataset.company);
    currentGroup={title:`🏢 ${name}`,items:DATA.filter(x=>x.anaFirma===name)};
    view="home";filter="all";search.value="";render();return
  }
  const cat=e.target.closest("[data-category]");
  if(cat){
    const name=decodeURIComponent(cat.dataset.category);
    currentGroup={title:`${categoryIcon(name)} ${name}`,items:DATA.filter(x=>x.kategori===name)};
    view="home";filter="all";search.value="";render();return
  }
  const c=e.target.closest("[data-brand]");
  if(c){const name=decodeURIComponent(c.dataset.brand);const item=DATA.find(x=>x.marka===name);if(item)detail(item)}
});
document.querySelectorAll(".bottomNav button").forEach(b=>b.addEventListener("click",()=>{currentGroup=null;view=b.dataset.view;if(view==="home")filter="all";render();}));
document.querySelectorAll(".langSwitch button").forEach(b=>b.addEventListener("click",()=>{lang=b.dataset.lang;localStorage.setItem("boykot_lang",lang);applyLang();render();}));
themeBtn.addEventListener("click",()=>{const next=document.body.classList.contains("dark")?"light":"dark";localStorage.setItem("ahlak_theme",next);applyTheme();});
$("closeDialog").addEventListener("click",()=>$("detailDialog").close());

setupInstallPrompt();
setupServiceWorker();
init();
