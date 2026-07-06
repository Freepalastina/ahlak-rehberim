const VERSION="20260706-v17-legal-safety";
const SUPABASE_URL="https://imicltjdfzqlxzvodheq.supabase.co";
const SUPABASE_KEY="sb_publishable_yswUDZAgEoEoB9KDLAic5A_xFSL20MC";
const supabaseClient=window.supabase?window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY):null;

let importBusy=false;
let DATA=[],view="home",filter="all",currentGroup=null,adminSession=null,importedRows=[];
let favorites=loadFavorites(),lang=localStorage.getItem("boykot_lang")||"tr";
const $=id=>document.getElementById(id);
const search=$("search"),clearBtn=$("clearBtn"),barcodeBtn=$("barcodeBtn"),stats=$("stats"),quickActions=$("quickActions"),quickFilters=$("quickFilters"),sectionTitle=$("sectionTitle"),results=$("results"),themeBtn=$("themeBtn");

const I={
tr:{kicker:"V17 Güvenli Bilgilendirme",title:"Ahlak Rehberim",subtitle:"Bilinçli tüket, güvenle tercih et.",search:"Marka, firma, kategori veya barkod ara...",navHome:"Ana",navCompanies:"Firmalar",navCategories:"Kategori",navFavorites:"Favori",navAdmin:"Yönetim",boycott:"İncele / Dikkat",notBoycotted:"Alternatif / Tercih Edilebilir",review:"Kontrol Ediliyor",withAlt:"Alternatifli",favorites:"Favoriler",all:"Tümü",results:"sonuç",brands:"marka",companies:"Ana Firmalar",categories:"Kategoriler",countries:"Ülkeler",country:"Ülke",category:"Kategori",parent:"Ana Firma",barcode:"Barkod",alternative:"Alternatif",details:"Ayrıntıları Gör →",close:"Kapat",source:"Bilgi Kaynağı",note:"Açıklama",openSource:"Kaynağı aç",noResult:"Sonuç bulunamadı.",safeInfo:"Bu marka boykot listesinde olmayanlar bölümüne eklendi.",quickTitle:"Hızlı Erişim",admin:"Yönetim",login:"Giriş",logout:"Çıkış",email:"E-posta",password:"Şifre",brandName:"Marka adı",save:"Kaydet",resetForm:"Temizle",chooseBrand:"Marka seç",deleteBrand:"Marka Sil",confirmDelete:"Bu markayı silmek istiyor musun?",dataSaved:"Kayıt güncellendi",dataAdded:"Marka eklendi",dataDeleted:"Kayıt silindi",requiredBrand:"Marka adı gerekli",importToSupabase:"data.json → Supabase aktar",exportData:"data.json indir",localOnly:"Giriş yaptıysan değişiklikler Supabase’e kaydedilir.",dataCenter:"📥 LibreOffice / Excel Yükle",chooseFile:"V13 master.xlsx / master.ods dosyanı seç",importFileToSupabase:"☁ Seçilen Dosyayı Supabase’e Aktar",fileRows:"kayıt okundu",fileReady:"Dosya hazır",fileError:"Dosya okunamadı",importDone:"Aktarma tamamlandı",noFileData:"Önce dosya seç", importStarted:"Aktarım başladı...", importNeedLogin:"Önce admin girişi yap", importProgress:"Aktarılıyor", importError:"Aktarım hatası",downloaded:"İndirildi",supabaseReady:"Supabase bağlı",supabaseFallback:"Supabase boş/ulaşılamıyor, data.json yedeği kullanılıyor.",barcodePrompt:"Barkod numarasını yaz:",barcodeMissing:"Barkod alanı yoksa eşleşme bulunmayabilir."},
en:{kicker:"V17 Güvenli Bilgilendirme",title:"Ahlak Rehberim",subtitle:"Choose consciously.",search:"Search brand, company, category or barcode...",navHome:"Home",navCompanies:"Companies",navCategories:"Category",navFavorites:"Favorite",navAdmin:"Admin",boycott:"Review / Caution",notBoycotted:"Alternative / Preferable",review:"Being Reviewed",withAlt:"With Alternatives",favorites:"Favorites",all:"All",results:"results",brands:"brands",companies:"Companies",categories:"Categories",countries:"Countries",country:"Country",category:"Category",parent:"Parent Company",barcode:"Barcode",alternative:"Alternative",details:"View Details →",close:"Close",source:"Information Source",note:"Explanation",openSource:"Open source",noResult:"No results found.",safeInfo:"This brand is in Not Boycotted.",quickTitle:"Quick Access",admin:"Admin",login:"Login",logout:"Logout",email:"Email",password:"Password",brandName:"Brand name",save:"Save",resetForm:"Clear",chooseBrand:"Select brand",deleteBrand:"Delete brand",confirmDelete:"Delete this brand?",dataSaved:"Record updated",dataAdded:"Brand added",dataDeleted:"Record deleted",requiredBrand:"Brand required",importToSupabase:"Import data.json to Supabase",exportData:"Download data.json",localOnly:"If logged in, changes are saved to Supabase.",dataCenter:"Data Center",chooseFile:"Choose ODS / Excel / CSV",importFileToSupabase:"Import file to Supabase",fileRows:"rows found",fileReady:"File ready",fileError:"Could not read file",importDone:"Import complete",noFileData:"Choose a file first", importStarted:"Import started...", importNeedLogin:"Please login first", importProgress:"Importing", importError:"Import error",downloaded:"Downloaded",supabaseReady:"Supabase connected",supabaseFallback:"Supabase empty/unavailable; using data.json fallback.",barcodePrompt:"Enter barcode:",barcodeMissing:"No match if barcode data is missing."},
de:{kicker:"V17 Güvenli Bilgilendirme",title:"Ahlak Rehberim",subtitle:"Bewusst konsumieren.",search:"Marke, Firma, Kategorie oder Barcode suchen...",navHome:"Start",navCompanies:"Firmen",navCategories:"Kategorie",navFavorites:"Favorit",navAdmin:"Admin",boycott:"Prüfen / Achtung",notBoycotted:"Alternative / bevorzugbar",review:"Wird geprüft",withAlt:"Mit Alternativen",favorites:"Favoriten",all:"Alle",results:"Ergebnisse",brands:"Marken",companies:"Firmen",categories:"Kategorien",countries:"Länder",country:"Land",category:"Kategorie",parent:"Mutterfirma",barcode:"Barcode",alternative:"Alternative",details:"Details ansehen →",close:"Schließen",source:"Informationsquelle",note:"Hinweis",openSource:"Quelle öffnen",noResult:"Keine Ergebnisse gefunden.",safeInfo:"Diese Marke ist nicht boykottiert.",quickTitle:"Schnellzugriff",admin:"Verwaltung",login:"Anmelden",logout:"Abmelden",email:"E-Mail",password:"Passwort",brandName:"Markenname",save:"Speichern",resetForm:"Leeren",chooseBrand:"Marke auswählen",deleteBrand:"Marke löschen",confirmDelete:"Diese Marke löschen?",dataSaved:"Eintrag aktualisiert",dataAdded:"Marke hinzugefügt",dataDeleted:"Eintrag gelöscht",requiredBrand:"Marke erforderlich",importToSupabase:"data.json importieren",exportData:"data.json herunterladen",localOnly:"Wenn angemeldet, werden Änderungen in Supabase gespeichert.",dataCenter:"Datenzentrum",chooseFile:"ODS / Excel / CSV wählen",importFileToSupabase:"Datei importieren",fileRows:"Einträge gefunden",fileReady:"Datei bereit",fileError:"Datei konnte nicht gelesen werden",importDone:"Import abgeschlossen",noFileData:"Bitte zuerst Datei wählen", importStarted:"Import gestartet...", importNeedLogin:"Bitte zuerst anmelden", importProgress:"Import läuft", importError:"Importfehler",downloaded:"Heruntergeladen",supabaseReady:"Supabase verbunden",supabaseFallback:"Supabase leer/nicht verfügbar; data.json wird genutzt.",barcodePrompt:"Barcode eingeben:",barcodeMissing:"Keine Übereinstimmung ohne Barcode-Daten."}
};

function legalDisclaimerText(){
  return `Bu uygulama yalnızca bilgilendirme ve kişisel tüketim tercihi amacıyla hazırlanmıştır. Buradaki bilgiler kamuya açık kaynaklar, kullanıcı katkıları ve kişisel değerlendirmelerden oluşur. Hiçbir marka, firma veya kişi hakkında kesin suçlama ya da hukuki hüküm içermez. Satın alma kararı kullanıcıya aittir. Bilgiler zamanla değişebilir; lütfen kendi araştırmanızı da yapınız.`;
}
function legalShortText(){
  return `Bilgilendirme amaçlıdır; kesin hukuki değerlendirme veya suçlama değildir.`;
}
function showLegalNoticeOnce(){
  const key = "ahlak_legal_notice_v17";
  if(localStorage.getItem(key)==="ok") return;
  setTimeout(()=>{
    const box=document.createElement("div");
    box.className="legalOverlay";
    box.innerHTML=`<div class="legalModal"><h2>Bilgilendirme Notu</h2><p>${esc(legalDisclaimerText())}</p><div class="legalActions"><button id="legalOk">Anladım</button></div></div>`;
    document.body.appendChild(box);
    document.getElementById("legalOk").onclick=()=>{localStorage.setItem(key,"ok");box.remove();};
  },500);
}
function renderLegalFooter(){
  return `<div class="legalFooter"><b>Bilgilendirme:</b> ${esc(legalShortText())}<br>Bir kaydın hatalı olduğunu düşünüyorsanız lütfen düzeltme talebi gönderin ve kamuya açık kaynak ekleyin.</div>`;
}

function t(k){return(I[lang]&&I[lang][k])||I.tr[k]||k}
function esc(s){return String(s??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;")}
function norm(s){return String(s||"").toLocaleLowerCase("tr-TR").normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9ğüşöçıİĞÜŞÖÇäöüß]+/gi," ").trim()}
function get(o,names){for(const n of names){if(o&&o[n]!=null&&String(o[n]).trim()!=="")return String(o[n]).trim()}return""}
function loadFavorites(){try{return JSON.parse(localStorage.getItem("ahlak_fav_v10")||"[]")}catch{return[]}}
function saveFavorites(){localStorage.setItem("ahlak_fav_v10",JSON.stringify(favorites))}
function isFav(m){return favorites.includes(norm(m))}
function toggleFav(m){const k=norm(m);favorites=isFav(m)?favorites.filter(x=>x!==k):[...favorites,k];saveFavorites();render()}

function isSafeRecord(raw){
  const fields = [
    get(raw,["durum","status"]),
    get(raw,["kategori","category","Kategori"]),
    get(raw,["kaynak","source","url","link","Kaynak"]),
    get(raw,["not","note","notlar"]),
    get(raw,["alternatif","alternative","Alternatif"])
  ].join(" ");

  const d = norm(fields);
  const compact = String(fields || "")
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g,"")
    .replace(/ı/g,"i")
    .replace(/[^a-z0-9]+/g,"")
    .trim();

  return (
    compact.includes("boykottadegil") ||
    compact.includes("boykotdegil") ||
    compact.includes("boykotlistesindeolmayan") ||
    compact.includes("alternatifods") ||
    compact.includes("notboycotted") ||
    compact.includes("notboycott") ||
    compact.includes("safe") ||
    d.includes("boykotta degil") ||
    d.includes("boykot degil") ||
    d.includes("boykot listesinde olmayan") ||
    d.includes("alternatif.ods") ||
    d.includes("not boycotted")
  );
}

function rawStatus(r){
  const original = get(r,["durum","status"]);
  const compact = String(original || "")
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g,"")
    .replace(/ı/g,"i")
    .replace(/[^a-z0-9]+/g,"")
    .trim();

  const d = norm(original);

  if(
    compact === "boykottadegil" ||
    compact === "boykotdegil" ||
    compact === "boykotadegil" ||
    compact === "notboycotted" ||
    compact === "notboycott" ||
    compact === "safe" ||
    compact === "boycottfree" ||
    d.includes("safe") ||
    d.includes("boykotta degil") ||
    d.includes("boykot degil") ||
    d.includes("boykot_degil") ||
    d.includes("not boycotted") ||
    d.includes("not boycott")
  ) return "safe";

  if(
    compact === "alternatif" ||
    compact === "alternative" ||
    d.includes("alternatif") ||
    d.includes("alternative")
  ) return "alternatif";

  if(
    compact === "dikkat" ||
    compact === "caution" ||
    d.includes("dikkat") ||
    d.includes("caution")
  ) return "dikkat";

  if(
    compact === "inceleme" ||
    compact === "inceleniyor" ||
    compact === "review" ||
    compact === "underreview" ||
    d.includes("incelen") ||
    d.includes("review")
  ) return "inceleme";

  if(compact === "boykot" || compact === "boycott") return "boykot";

  return d ? d : "boykot";
}
function statusLabel(s){return{boykot:`🔴 ${t("boycott")}`,safe:`✅ ${t("notBoycotted")}`,alternatif:`🟢 ${t("alternative")}`,dikkat:"🟠 Dikkat",inceleme:`⚪ ${t("review")}`}[s]||s}
function hasAlternative(x){if(x.status==="alternatif")return true;const a=norm(x.alternatif);return !!a&&a!=="-"&&a!=="yok"&&!a.includes("alternatif manuel eklenmeli")}
function normalizeItem(raw,i){
  const marka=get(raw,["marka","name","Marka","brand"])||`Marka ${i+1}`;
  const anaFirma=get(raw,["anaFirma","ana_firma","Ana Firma","company","firma"])||marka;

  const anaKategori=get(raw,["anaKategori","Ana Kategori","mainCategory","main_category"]);
  const altKategori=get(raw,["altKategori","Alt Kategori","subCategory","sub_category"]);
  const kategori=get(raw,["kategori","category","Kategori"]) || altKategori || anaKategori;

  const ulke=get(raw,["ulke","ülke","Ülke","country","Country"]);
  const alternatif=get(raw,["alternatif","alternative","Alternatif"]);
  const kaynak=get(raw,["kaynak","source","url","link","Kaynak"]);
  const not=get(raw,["not","note","notlar","Not"]);
  const barkodRaw=raw.barkod??raw.barcode??raw.ean??raw.gtin??[];
  const barkod=Array.isArray(barkodRaw)?barkodRaw:(barkodRaw?String(barkodRaw).split(/[;, ]+/).filter(Boolean):[]);
  const imageUrl=get(raw,["image_url","imageUrl","image","logo","resim","gorsel","görsel","Görsel URL"]);

  let status=rawStatus(raw);
  if(typeof isSafeRecord==="function" && isSafeRecord(raw)) status="safe";

  const hay=norm([marka,anaFirma,anaKategori,altKategori,kategori,ulke,alternatif,kaynak,not,barkod.join(" "),imageUrl,statusLabel(status)].join(" "));
  return {id:raw.id||null,marka,anaFirma,anaKategori,altKategori,kategori,ulke,alternatif,kaynak,not,barkod,imageUrl,status,hay};
}
function toLegacy(x){
  let normalizedStatus = rawStatus({durum:x.status || x.durum || ""});
  if(typeof isSafeRecord==="function" && isSafeRecord({
    durum:x.status || x.durum || "",
    kategori:x.kategori || "",
    kaynak:x.kaynak || "",
    not:x.not || "",
    alternatif:x.alternatif || ""
  })) normalizedStatus = "safe";

  return {
    marka:x.marka,
    anaFirma:x.anaFirma,
    kategori:x.kategori,
    anaKategori:x.anaKategori || "",
    altKategori:x.altKategori || "",
    ulke:x.ulke || "",
    alternatif:x.alternatif,
    kaynak:x.kaynak,
    not:x.not,
    durum:normalizedStatus,
    barkod:Array.isArray(x.barkod)?x.barkod:[],
    image_url:x.imageUrl||""
  };
}

async function loadSession(){if(!supabaseClient)return;const{data}=await supabaseClient.auth.getSession();adminSession=data.session||null}
async function loadSupabase(){if(!supabaseClient)throw new Error("No Supabase");let all=[],from=0,step=1000;while(true){const{data,error}=await supabaseClient.from("brand_cards").select("*").order("marka").range(from,from+step-1);if(error)throw error;all=all.concat(data||[]);if(!data||data.length<step)break;from+=step}return all}
async function loadFallback(){const r=await fetch(`data.json?v=${VERSION}`,{cache:"reload"});const j=await r.json();return Array.isArray(j)?j:(j.data||[])}
async function init(){applyTheme();applyLang();setupServiceWorker();showLegalNoticeOnce();await loadSession();try{let list=[];try{list=await loadSupabase()}catch(e){list=[]}if(!list.length){list=await loadFallback();toast(t("supabaseFallback"))}else toast(t("supabaseReady"));DATA=list.map(normalizeItem).sort((a,b)=>a.marka.localeCompare(b.marka,"tr"));render()}catch(e){results.innerHTML=`<div class="empty">${esc(e.message)}</div>`}}

function counts(){return{total:DATA.length,boykot:DATA.filter(x=>x.status==="boykot").length,safe:DATA.filter(x=>x.status==="safe").length,inceleme:DATA.filter(x=>x.status==="inceleme").length,altli:DATA.filter(hasAlternative).length,fav:favorites.length,firmalar:new Set(DATA.map(x=>x.anaFirma||"-")).size,kategoriler:new Set(DATA.map(x=>x.kategori||"-").filter(Boolean)).size,ulkeler:new Set(DATA.map(x=>x.ulke||"").filter(Boolean)).size}}
function renderStats(){const c=counts();stats.innerHTML=`<button class="stat red" data-stat="boykot"><small>🔴 ${t("boycott")}</small><b>${c.boykot}</b></button><button class="stat safe" data-stat="safe"><small>✅ ${t("notBoycotted")}</small><b>${c.safe}</b></button><button class="stat green" data-stat="altli"><small>⭐ ${t("withAlt")}</small><b>${c.altli}</b></button><button class="stat gray" data-stat="inceleme"><small>⚪ ${t("review")}</small><b>${c.inceleme}</b></button>`}
function renderQuickActions(){const c=counts();quickActions.innerHTML=`<h2>${t("quickTitle")}</h2><div class="quickGrid"><button data-go="companies"><span>🏢</span><b>${t("companies")}</b><small>${c.firmalar}</small></button><button data-go="categories"><span>📂</span><b>${t("categories")}</b><small>${c.kategoriler}</small></button><button data-go="countries"><span>🌍</span><b>${t("countries")||"Ülkeler"}</b><small>${c.ulkeler||0}</small></button><button data-go="alternatives"><span>⭐</span><b>${t("withAlt")}</b><small>${c.altli}</small></button><button data-go="favorites"><span>❤️</span><b>${t("favorites")}</b><small>${c.fav}</small></button><button data-go="admin"><span>⚙️</span><b>${t("admin")}</b><small>ODS</small></button></div>`}
function renderFilters(){const arr=[["all",t("all")],["boykot",`🔴 ${t("boycott")}`],["safe",`✅ ${t("notBoycotted")}`],["altli",`⭐ ${t("withAlt")}`],["inceleme",`⚪ ${t("review")}`],["fav",`❤️ ${t("favorites")}`]];quickFilters.innerHTML=arr.map(([k,l])=>`<button class="chip ${filter===k?'active':''}" data-filter="${k}">${l}</button>`).join("")}
function filteredList(base=DATA){const q=norm(search.value);return base.filter(x=>(!q||x.hay.includes(q))&&(filter==="all"||(filter==="boykot"&&x.status==="boykot")||(filter==="safe"&&x.status==="safe")||(filter==="altli"&&hasAlternative(x))||(filter==="inceleme"&&x.status==="inceleme")||(filter==="fav"&&isFav(x.marka)))).sort((a,b)=>Number(isFav(b.marka))-Number(isFav(a.marka))||a.marka.localeCompare(b.marka,"tr"))}
function imageHtml(x){return x.imageUrl?`<div class="brandImage"><img src="${esc(x.imageUrl)}" alt="${esc(x.marka)}" loading="lazy" onerror="this.parentElement.classList.add('noImage');this.remove();"></div>`:`<div class="brandImage noImage"><span>🌿</span></div>`}
function altHtml(x){if(x.status==="safe"&&!x.alternatif)return`<div class="altBox"><span>${t("notBoycotted")}</span><b>${t("safeInfo")}</b></div>`;if(!hasAlternative(x))return`<div class="altBox"><span>${t("alternative")}</span><b>-</b></div>`;const tags=String(x.alternatif).split(/[;,•]/).map(v=>v.trim()).filter(Boolean).slice(0,8);return`<div class="altBox"><span>${t("alternative")}</span><div class="tags">${tags.map(v=>`<em>${esc(v)}</em>`).join("")}</div></div>`}
function card(x){return`<article class="card ${x.status}" data-brand="${encodeURIComponent(x.marka)}">${imageHtml(x)}<div class="cardTop"><div><div class="badgeLine"><span class="badge ${x.status}">${statusLabel(x.status)}</span>${hasAlternative(x)?`<span class="badge alternatif">⭐ ${t("withAlt")}</span>`:""}</div><h3>${esc(x.marka)}</h3><div class="company">🏢 ${esc(x.anaFirma||"-")}</div></div><button class="fav" data-fav="${encodeURIComponent(x.marka)}">${isFav(x.marka)?"❤️":"♡"}</button></div><div class="meta"><div class="box"><span>${t("category")}</span><b>${esc(x.kategori||"-")}</b></div>${x.ulke?`<div class="box" style="margin-top:8px"><span>${t("country")||"Ülke"}</span><b>${esc(x.ulke)}</b></div>`:""}</div>${altHtml(x)}<button class="more">${t("details")}</button></article>`}
function titleFor(){if(currentGroup)return currentGroup.title;if(view==="favorites"||filter==="fav")return`❤️ ${t("favorites")}`;if(view==="alternatives"||filter==="altli")return`⭐ ${t("withAlt")}`;return t("all")}
function renderHome(base=DATA){const list=filteredList(base);renderStats();renderQuickActions();renderFilters();sectionTitle.innerHTML=`<h2>${esc(titleFor())}</h2><span>${list.length} ${t("results")}</span>`;results.innerHTML=(list.length?list.slice(0,800).map(card).join(""):`<div class="empty">${t("noResult")}</div>`)+renderLegalFooter()}
function groupBy(key){const m=new Map();DATA.forEach(x=>{const n=x[key]||"-";if(!m.has(n))m.set(n,[]);m.get(n).push(x)});return[...m.entries()].sort((a,b)=>b[1].length-a[1].length||a[0].localeCompare(b[0],"tr"))}
function renderCompanies(){renderStats();renderQuickActions();quickFilters.innerHTML="";search.value="";const g=groupBy("anaFirma");sectionTitle.innerHTML=`<h2>🏢 ${t("companies")}</h2><span>${g.length}</span>`;results.innerHTML=g.map(([n,it])=>`<button class="group" data-company="${encodeURIComponent(n)}"><div><b>${esc(n)}</b><small>${it.slice(0,4).map(x=>esc(x.marka)).join(", ")}${it.length>4?"...":""}</small></div><div class="count">${it.length}</div></button>`).join("")}
function catIcon(n){const x=norm(n);if(x.includes("icecek")||x.includes("su"))return"🥤";if(x.includes("gida")||x.includes("cikolata"))return"🍫";if(x.includes("temizlik"))return"🧼";if(x.includes("kozmetik"))return"💄";return"📂"}
function renderCountries(){
  renderStats();
  renderQuickActions();
  quickFilters.innerHTML="";
  search.value="";
  const g=groupBy("ulke").filter(([n])=>n&&n!=="-");
  sectionTitle.innerHTML=`<h2>🌍 ${t("countries")||"Ülkeler"}</h2><span>${g.length}</span>`;
  results.innerHTML=g.length?g.map(([n,it])=>`<button class="group" data-country="${encodeURIComponent(n)}"><div><b>🌍 ${esc(n)}</b><small>${it.length} ${t("brands")}</small></div><div class="count">${it.length}</div></button>`).join(""):`<div class="empty">${t("noResult")}</div>`;
}

function renderCategories(){renderStats();renderQuickActions();quickFilters.innerHTML="";search.value="";const g=groupBy("kategori").filter(([n])=>n&&n!=="-");sectionTitle.innerHTML=`<h2>📂 ${t("categories")}</h2><span>${g.length}</span>`;results.innerHTML=g.map(([n,it])=>`<button class="group" data-category="${encodeURIComponent(n)}"><div><b>${catIcon(n)} ${esc(n)}</b><small>${it.length} ${t("brands")}</small></div><div class="count">${it.length}</div></button>`).join("")}

function fieldValue(row,names){
  for(const name of names){
    const k=Object.keys(row).find(x=>norm(x)===norm(name));
    if(k&&row[k]!=null&&String(row[k]).trim()!=="")return String(row[k]).trim();
  }
  return "";
}
function rowHasHeaderKeys(row){
  const keys = Object.keys(row).map(norm).join(" ");
  return keys.includes("marka") || keys.includes("brand") || keys.includes("ana firma") || keys.includes("kategori");
}
function mapSheetRow(row){
  const barkodRaw=fieldValue(row,["barkod","barcode","ean","gtin","Barkod"]);
  return{
    marka:fieldValue(row,["marka","Marka","brand"]),
    anaFirma:fieldValue(row,["anaFirma","Ana Firma","anafirma","ana_firma","company"]),
    anaKategori:fieldValue(row,["Ana Kategori","anaKategori","mainCategory"]),
    altKategori:fieldValue(row,["Alt Kategori","altKategori","subCategory"]),
    kategori:fieldValue(row,["kategori","Kategori","category","Alt Kategori","Ana Kategori"]),
    ulke:fieldValue(row,["Ülke","Ulke","ulke","country","Country"]),
    alternatif:fieldValue(row,["alternatif","Alternatif","alternative"]),
    kaynak:fieldValue(row,["kaynak","Kaynak","source","url","link"]),
    not:fieldValue(row,["not","Not","note","notlar"]),
    status:fieldValue(row,["durum","Durum","status"])||"boykot",
    barkod:barkodRaw?String(barkodRaw).split(/[;, ]+/).filter(Boolean):[],
    imageUrl:fieldValue(row,["image_url","image","logo","resim","gorsel","Görsel URL"])
  };
}
function rawRowToBrand(arr){
  const vals = (arr||[]).map(v=>String(v??"").trim());
  const marka = vals[0] || "";
  if(!marka) return null;
  const second = norm(vals[1]||"");
  let status = "boykot";
  if(second==="" || second==="-" || second==="0") status = "inceleme";
  if(second.includes("degil") || second.includes("safe") || second.includes("not")) status = "safe";
  if(second.includes("alt")) status = "alternatif";
  return {
    marka,
    anaFirma: vals[2] || marka,
    kategori: vals[3] || "",
    alternatif: vals[4] || "",
    kaynak: vals[5] || "",
    not: vals[6] || "",
    status,
    barkod: vals[7] ? vals[7].split(/[;, ]+/).filter(Boolean) : [],
    imageUrl: vals[8] || ""
  };
}
function normalizeHeaderKey(s){
  return norm(s).replace(/\s+/g," ");
}
function sheetRowsByName(workbook, wanted){
  const found = workbook.SheetNames.find(n => normalizeHeaderKey(n) === normalizeHeaderKey(wanted));
  if(!found) return [];
  return XLSX.utils.sheet_to_json(workbook.Sheets[found], {defval:""});
}
function getRowValue(row, aliases){
  const keys = Object.keys(row);
  for(const a of aliases){
    const k = keys.find(x => normalizeHeaderKey(x) === normalizeHeaderKey(a));
    if(k && row[k] !== undefined && row[k] !== null && String(row[k]).trim() !== "") return String(row[k]).trim();
  }
  return "";
}
function parseMasterWorkbook(workbook){
  const brandRows = sheetRowsByName(workbook, "Markalar");
  if(!brandRows.length) return [];

  const sourcesRows = sheetRowsByName(workbook, "Kaynaklar");
  const barcodeRows = sheetRowsByName(workbook, "Barkodlar");
  const altRows = sheetRowsByName(workbook, "Alternatifler");

  const byBrand = {};
  const makeKey = v => norm(v);

  for(const row of brandRows){
    const marka = getRowValue(row, ["Marka","marka","Brand","name"]);
    if(!marka) continue;
    const anaKategori = getRowValue(row, ["Ana Kategori","anaKategori","mainCategory"]);
    const altKategori = getRowValue(row, ["Alt Kategori","altKategori","subCategory"]);
    const kategori = getRowValue(row, ["Kategori","category"]) || altKategori || anaKategori;
    const k = makeKey(marka);
    byBrand[k] = {
      marka,
      anaFirma: getRowValue(row, ["Ana Firma","anaFirma","ana_firma","Firma"]),
      anaKategori,
      altKategori,
      kategori,
      ulke: getRowValue(row, ["Ülke","Ulke","ülke","ulke","Country","country"]),
      status: getRowValue(row, ["Durum","status"]) || "boykot",
      not: getRowValue(row, ["Not","note","notlar"]),
      imageUrl: getRowValue(row, ["Görsel URL","Gorsel URL","image_url","image","logo","resim","gorsel"]),
      kaynak: "",
      barkod: [],
      alternatif: ""
    };
  }

  for(const row of sourcesRows){
    const marka = getRowValue(row, ["Marka","marka","Brand"]);
    const url = getRowValue(row, ["URL","Kaynak","kaynak","source","link"]);
    if(!marka || !url) continue;
    const k = makeKey(marka);
    if(!byBrand[k]) continue;
    const list = byBrand[k].kaynak ? byBrand[k].kaynak.split(";").map(x=>x.trim()).filter(Boolean) : [];
    if(!list.includes(url)) list.push(url);
    byBrand[k].kaynak = list.join("; ");
  }

  for(const row of barcodeRows){
    const marka = getRowValue(row, ["Marka","marka","Brand"]);
    const barkod = getRowValue(row, ["Barkod","barcode","ean","gtin"]);
    if(!marka || !barkod) continue;
    const k = makeKey(marka);
    if(!byBrand[k]) continue;
    if(!byBrand[k].barkod.includes(barkod)) byBrand[k].barkod.push(barkod);
  }

  for(const row of altRows){
    const marka = getRowValue(row, ["Marka","marka","Brand","Boykot Marka"]);
    const alt = getRowValue(row, ["Alternatif","Alternatif Marka","alternative"]);
    if(!marka || !alt) continue;
    const k = makeKey(marka);
    if(!byBrand[k]) continue;
    const list = byBrand[k].alternatif ? byBrand[k].alternatif.split(";").map(x=>x.trim()).filter(Boolean) : [];
    if(!list.includes(alt)) list.push(alt);
    byBrand[k].alternatif = list.join("; ");
  }

  return Object.values(byBrand);
}
function parseWorkbook(workbook){
  const normalized = parseMasterWorkbook(workbook);
  if(normalized.length) return normalized;

  let best = [];
  for(const sheetName of workbook.SheetNames){
    const sheet = workbook.Sheets[sheetName];

    const jsonRows = XLSX.utils.sheet_to_json(sheet, {defval:""});
    const mapped = jsonRows.map(mapSheetRow).filter(x=>x.marka);
    if(mapped.length > best.length) best = mapped;

    const raw = XLSX.utils.sheet_to_json(sheet, {header:1, defval:"", blankrows:false});
    const rawMapped = raw
      .filter(r => Array.isArray(r) && String(r[0]??"").trim() !== "")
      .filter(r => {
        const first = norm(r[0]);
        return first !== "marka" && first !== "brand" && first !== "ürün" && first !== "urun";
      })
      .map(rawRowToBrand)
      .filter(Boolean);

    if(rawMapped.length > best.length) best = rawMapped;
  }
  return best;
}

function normalizeImportedStatusRows(rows){
  return (rows || []).map(item => {
    item.status = rawStatus({durum:item.status || item.durum || ""});
    return item;
  });
}

function readSpreadsheetFile(file){
  if(!file){toast(t("noFileData"));return}
  const r=new FileReader();
  r.onload=e=>{
    try{
      const wb=XLSX.read(new Uint8Array(e.target.result),{type:"array"});
      importedRows=normalizeImportedStatusRows(parseWorkbook(wb));
      renderImportPreview();
      toast(`${t("fileReady")}: ${importedRows.length}`);
    }catch(err){
      console.error(err);
      toast(t("fileError"));
    }
  };
  r.readAsArrayBuffer(file);
}
function renderImportPreview(){
  const box=$("importPreview");
  if(!box)return;
  const s=importedRows.slice(0,10);
  box.innerHTML=`<div class="importSummary"><b>${importedRows.length}</b> ${esc(t("fileRows"))}</div><div class="importTable"><table><thead><tr><th>Marka</th><th>Ana Firma</th><th>Kategori</th><th>Ülke</th><th>Durum</th><th>Barkod</th></tr></thead><tbody>${s.map(r=>`<tr><td>${esc(r.marka)}</td><td>${esc(r.anaFirma)}</td><td>${esc(r.kategori)}</td><td>${esc(r.ulke||"")}</td><td>${esc(r.status)}</td><td>${esc((r.barkod||[]).join(", "))}</td></tr>`).join("")}</tbody></table></div>`;
}
function setImportStatus(msg){
  let el = document.getElementById("importStatus");
  if(el) el.textContent = msg || "";
}
async function importSpreadsheetToSupabase(){
  if(!adminSession){toast(t("importNeedLogin") || t("login"));return}
  if(!importedRows.length){toast(t("noFileData"));return}
  if(importBusy) return;
  importBusy = true;
  setImportStatus(t("importStarted"));
  try{
    let ok = 0;
    for(const r of importedRows){
      await importLegacy(r);
      ok++;
      if(ok % 25 === 0) setImportStatus(`${t("importProgress")}: ${ok}/${importedRows.length}`);
    }
    setImportStatus(`${t("importDone")}: ${ok}/${importedRows.length}`);
    toast(t("importDone"));
    await reload();
    view="admin";
    render();
  }catch(err){
    console.error(err);
    setImportStatus(`${t("importError")}: ${err.message || err}`);
    toast(err.message || t("importError"));
  }finally{
    importBusy = false;
  }
}
async function importLegacy(item){const legacy=toLegacy(item);const {error}=await supabaseClient.rpc("import_legacy_brand",{p_item:legacy});if(error)throw error}
async function importSpreadsheetToSupabase(){if(!adminSession){toast(t("login"));return}if(!importedRows.length){toast(t("noFileData"));return}for(const r of importedRows){await importLegacy(r)}toast(t("importDone"));await reload();view="admin";render()}
async function importToSupabase(){if(!adminSession){toast(t("login"));return}for(const item of DATA){await importLegacy(item)}toast(t("importDone"));await reload();view="admin";render()}
async function saveAdminBrand(){if(!adminSession){toast(t("login"));return}const v=getAdminValues();if(!v.marka){toast(t("requiredBrand"));return}if(!v.anaFirma)v.anaFirma=v.marka;await importLegacy(v);toast(t("dataSaved"));await reload();view="admin";render()}
async function deleteAdminBrand(){if(!adminSession){toast(t("login"));return}const name=$("adminSelect").value||$("adminMarka").value;if(!name||!confirm(t("confirmDelete")))return;const item=DATA.find(x=>x.marka===name);const {error}=await supabaseClient.from("brands").delete().eq(item?.id?"id":"name",item?.id||name);if(error){toast(error.message);return}toast(t("dataDeleted"));await reload();view="admin";render()}
async function reload(){const list=await loadSupabase();DATA=list.map(normalizeItem).sort((a,b)=>a.marka.localeCompare(b.marka,"tr"))}
function adminOptions(){return DATA.map(x=>x.marka).filter((v,i,a)=>v&&a.indexOf(v)===i).sort((a,b)=>a.localeCompare(b,"tr")).map(n=>`<option value="${esc(n)}">${esc(n)}</option>`).join("")}
function getAdminValues(){const raw=$("adminBarkod")?.value.trim()||"";return{marka:$("adminMarka").value.trim(),anaFirma:$("adminAnaFirma").value.trim(),kategori:$("adminKategori").value.trim(),alternatif:$("adminAlternatif").value.trim(),kaynak:$("adminKaynak").value.trim(),not:$("adminNot").value.trim(),barkod:raw?raw.split(/[;, ]+/).filter(Boolean):[],imageUrl:($("adminImageUrl")?.value||"").trim(),status:$("adminDurum").value}}
function fillAdminForm(name){const x=DATA.find(v=>v.marka===name);if(!x)return;$("adminMarka").value=x.marka||"";$("adminAnaFirma").value=x.anaFirma||"";$("adminKategori").value=x.kategori||"";$("adminAlternatif").value=x.alternatif||"";$("adminKaynak").value=x.kaynak||"";$("adminNot").value=x.not||"";$("adminBarkod").value=Array.isArray(x.barkod)?x.barkod.join(", "):"";$("adminImageUrl").value=x.imageUrl||"";$("adminDurum").value=x.status||"boykot"}
function clearAdminForm(){["adminMarka","adminAnaFirma","adminKategori","adminAlternatif","adminKaynak","adminNot","adminBarkod","adminImageUrl"].forEach(id=>$(id).value="");$("adminDurum").value="boykot"}
async function adminLogin(){const{data,error}=await supabaseClient.auth.signInWithPassword({email:$("adminEmail").value.trim(),password:$("adminPassword").value});if(error){toast(error.message);return}adminSession=data.session;toast(t("supabaseReady"));renderAdmin()}
async function adminLogout(){await supabaseClient.auth.signOut();adminSession=null;view="home";filter="all";search.value="";render()}
function downloadDataJson(){const raw=DATA.map(toLegacy);const blob=new Blob([JSON.stringify(raw,null,2)],{type:"application/json"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="data.json";a.click();URL.revokeObjectURL(url);toast(t("downloaded"))}
function renderAdmin(){
stats.innerHTML="";
quickActions.innerHTML="";
quickFilters.innerHTML="";
sectionTitle.innerHTML=`<h2>⚙️ ${t("admin")}</h2><span>${DATA.length} ${t("brands")}</span>`;

results.innerHTML=`<section class="adminPanel">
  <div class="dataCenter dataCenterTop">
    <h3>📥 LibreOffice / Excel / CSV Yükle</h3>
    <p>.ods, .xlsx, .xls veya .csv dosyanı buradan seç. Önizleme geldikten sonra Supabase’e aktar.</p>
    <input id="spreadsheetFile" type="file" accept=".ods,.xlsx,.xls,.csv,application/vnd.oasis.opendocument.spreadsheet,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv">
    <div id="importPreview" class="importPreview"></div><div id="importStatus" class="importStatus"></div>
    <button type="button" onclick="importSpreadsheetToSupabase()">☁ Seçilen Dosyayı Supabase’e Aktar</button>
  </div>

  <p class="adminNotice">${esc(t("localOnly"))}</p>

  <div class="adminLogin">
    ${adminSession
      ? `<button type="button" onclick="adminLogout()">🚪 ${esc(t("logout"))}</button>`
      : `<input id="adminEmail" placeholder="${esc(t("email"))}">
         <input id="adminPassword" type="password" placeholder="${esc(t("password"))}">
         <button type="button" onclick="adminLogin()">🔐 ${esc(t("login"))}</button>`}
  </div>

  <div class="adminTools">
    <button type="button" onclick="importToSupabase()">☁ ${esc(t("importToSupabase"))}</button>
    <button type="button" onclick="downloadDataJson()">⬇️ ${esc(t("exportData"))}</button>
  </div>

  <div class="adminSelectRow">
    <label>${esc(t("chooseBrand"))}</label>
    <select id="adminSelect"><option value="">—</option>${adminOptions()}</select>
  </div>

  <div class="adminForm">
    <label>${esc(t("brandName"))}<input id="adminMarka"></label>
    <label>${esc(t("parent"))}<input id="adminAnaFirma"></label>
    <label>${esc(t("category"))}<input id="adminKategori"></label>
    <label>${esc(t("alternative"))}<textarea id="adminAlternatif"></textarea></label>
    <label>${esc(t("barcode"))}<textarea id="adminBarkod"></textarea></label>
    <label>Görsel URL<input id="adminImageUrl" placeholder="https://..."></label>
    <label>${esc(t("source"))}<input id="adminKaynak"></label>
    <label>${esc(t("note"))}<textarea id="adminNot"></textarea></label>
    <label>Durum
      <select id="adminDurum">
        <option value="boykot">${esc(t("boycott"))}</option>
        <option value="safe">${esc(t("notBoycotted"))}</option>
        <option value="alternatif">${esc(t("alternative"))}</option>
        <option value="dikkat">Dikkat</option>
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

const sel = $("adminSelect");
if(sel) sel.addEventListener("change", e=>fillAdminForm(e.target.value));

const fileInput = $("spreadsheetFile");
if(fileInput) fileInput.addEventListener("change", e=>readSpreadsheetFile(e.target.files[0]));
}

function render(){document.querySelectorAll(".bottomNav button").forEach(b=>b.classList.toggle("active",b.dataset.view===view));if(currentGroup)return renderHome(currentGroup.items);if(view==="home")return renderHome();if(view==="alternatives"){filter="altli";return renderHome()}if(view==="favorites"){filter="fav";return renderHome()}if(view==="companies")return renderCompanies();if(view==="categories")return renderCategories();if(view==="countries")return renderCountries();if(view==="admin")return renderAdmin()}
function detail(x){const d=$("detailDialog"),c=$("detailContent");c.innerHTML=`<div class="detailHead"><h2>${esc(x.marka)}</h2><p>${statusLabel(x.status)}</p></div><div class="detailBody">${x.imageUrl?`<div class="detailImage"><img src="${esc(x.imageUrl)}" alt="${esc(x.marka)}"></div>`:""}<div class="detailLine"><span>${t("parent")}</span><b>${esc(x.anaFirma||"-")}</b></div><div class="detailLine"><span>${t("category")}</span><b>${esc(x.kategori||"-")}</b></div><div class="detailLine"><span>${t("country")||"Ülke"}</span><b>${esc(x.ulke||"-")}</b></div><div class="detailLine"><span>${t("barcode")}</span><b>${esc((x.barkod||[]).join(", ")||"-")}</b></div><div class="detailLine"><span>${t("alternative")}</span><b>${esc(x.alternatif||"-")}</b></div><div class="detailLine"><span>${t("note")}</span><b>${esc(x.not||"-")}</b></div><div class="legalDetail">⚖️ ${esc(legalShortText())}</div><div class="detailLine"><span>${t("source")}</span><b>${esc(x.kaynak||"-")}</b></div></div>`;d.showModal()}
function handleBarcodeValue(code){const n=norm(code);const item=DATA.find(x=>Array.isArray(x.barkod)&&x.barkod.some(v=>norm(v)===n));if(item)detail(item);else{search.value=code;render()}}
function applyTheme(){const dark=localStorage.getItem("ahlak_theme")==="dark";document.body.classList.toggle("dark",dark);themeBtn.textContent=dark?"☀️":"🌙"}
function applyLang(){document.documentElement.lang=lang;$("kicker").textContent=t("kicker");$("appTitle").textContent=t("title");$("appSubtitle").textContent=t("subtitle");search.placeholder=t("search");$("closeDialog").textContent=t("close");document.querySelectorAll("[data-i]").forEach(el=>el.textContent=t(el.dataset.i));document.querySelectorAll(".langSwitch button").forEach(b=>b.classList.toggle("active",b.dataset.lang===lang))}
function toast(m){const el=document.createElement("div");el.className="toast";el.textContent=m;document.body.appendChild(el);requestAnimationFrame(()=>el.classList.add("show"));setTimeout(()=>{el.classList.remove("show");setTimeout(()=>el.remove(),300)},2800)}
function setupServiceWorker(){if("serviceWorker"in navigator)navigator.serviceWorker.register(`sw.js?v=${VERSION}`).catch(()=>{})}

search.addEventListener("input",()=>{currentGroup=null;if(view!=="home"){view="home";filter="all"}render()});clearBtn.addEventListener("click",()=>{search.value="";filter="all";currentGroup=null;render()});barcodeBtn.addEventListener("click",()=>{const c=prompt(`${t("barcodePrompt")}\n${t("barcodeMissing")}`);if(c)handleBarcodeValue(c.trim())});quickFilters.addEventListener("click",e=>{const b=e.target.closest("[data-filter]");if(!b)return;filter=b.dataset.filter;view="home";currentGroup=null;render()});quickActions.addEventListener("click",e=>{const b=e.target.closest("[data-go]");if(!b)return;view=b.dataset.go;currentGroup=null;if(view==="home")filter="all";render()});stats.addEventListener("click",e=>{const b=e.target.closest("[data-stat]");if(!b)return;filter=b.dataset.stat;view="home";currentGroup=null;render()});results.addEventListener("click",e=>{const f=e.target.closest("[data-fav]");if(f){e.stopPropagation();toggleFav(decodeURIComponent(f.dataset.fav));return}const g=e.target.closest("[data-company]");if(g){const n=decodeURIComponent(g.dataset.company);currentGroup={title:`🏢 ${n}`,items:DATA.filter(x=>x.anaFirma===n)};view="home";search.value="";filter="all";render();return}const cat=e.target.closest("[data-category]");if(cat){const n=decodeURIComponent(cat.dataset.category);currentGroup={title:`${catIcon(n)} ${n}`,items:DATA.filter(x=>x.kategori===n)};view="home";search.value="";filter="all";render();return}const country=e.target.closest("[data-country]");if(country){const n=decodeURIComponent(country.dataset.country);currentGroup={title:`🌍 ${n}`,items:DATA.filter(x=>x.ulke===n)};view="home";search.value="";filter="all";render();return}const c=e.target.closest("[data-brand]");if(c){const n=decodeURIComponent(c.dataset.brand);const item=DATA.find(x=>x.marka===n);if(item)detail(item)}});document.querySelectorAll(".bottomNav button").forEach(b=>b.addEventListener("click",()=>{view=b.dataset.view;currentGroup=null;if(view==="home")filter="all";render()}));document.querySelectorAll(".langSwitch button").forEach(b=>b.addEventListener("click",()=>{lang=b.dataset.lang;localStorage.setItem("boykot_lang",lang);applyLang();render()}));themeBtn.addEventListener("click",()=>{localStorage.setItem("ahlak_theme",document.body.classList.contains("dark")?"light":"dark");applyTheme()});$("closeDialog").addEventListener("click",()=>$("detailDialog").close());
window.adminLogin=adminLogin;window.adminLogout=adminLogout;window.importToSupabase=importToSupabase;window.importSpreadsheetToSupabase=importSpreadsheetToSupabase;window.saveAdminBrand=saveAdminBrand;window.deleteAdminBrand=deleteAdminBrand;window.clearAdminForm=clearAdminForm;window.downloadDataJson=downloadDataJson;
init();