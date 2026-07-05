
const VERSION = "20260705-v7-1-supabase-no-conflict";
const SUPABASE_URL = "https://imicltjdfzqlxzvodheq.supabase.co";
const SUPABASE_KEY = "sb_publishable_yswUDZAgEoEoB9KDLAic5A_xFSL20MC";
const supabaseClient = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY) : null;

let DATA = [];
let view = "home";
let filter = "all";
let currentGroup = null;
let favorites = loadFavorites();
let lang = localStorage.getItem("boykot_lang") || "tr";
let adminSession = null;

const $ = id => document.getElementById(id);
const search = $("search");
const clearBtn = $("clearBtn");
const barcodeBtn = $("barcodeBtn");
const stats = $("stats");
const quickActions = $("quickActions");
const quickFilters = $("quickFilters");
const sectionTitle = $("sectionTitle");
const results = $("results");
const themeBtn = $("themeBtn");
const installBtn = $("installBtn");

const I = {
  tr:{htmlLang:"tr",kicker:"Supabase V7",title:"Ahlak Rehberim",subtitle:"Bilinçli tüket, güvenle tercih et.",search:"Marka, firma, kategori veya barkod ara...",navHome:"Ana",navCompanies:"Firmalar",navCategories:"Kategori",navFavorites:"Favori",navAbout:"Bilgi",boycott:"Boykot",notBoycotted:"Boykotta Değil",review:"İnceleniyor",withAlt:"Alternatifli",favorites:"Favoriler",all:"Tümü",results:"sonuç",brands:"marka",companies:"Ana Firmalar",categories:"Kategoriler",category:"Kategori",parent:"Ana Firma",barcode:"Barkod",alternative:"Alternatif",details:"Ayrıntıları Gör →",close:"Kapat",source:"Kaynak",note:"Not",openSource:"Kaynağı aç",noResult:"Sonuç bulunamadı.",safeInfo:"Bu marka boykot listesinde olmayanlar bölümüne eklendi.",quickTitle:"Hızlı Erişim",admin:"Yönetim",login:"Giriş",logout:"Çıkış",email:"E-posta",password:"Şifre",brandName:"Marka adı",save:"Kaydet",resetForm:"Formu temizle",chooseBrand:"Marka seç",deleteBrand:"Marka Sil",confirmDelete:"Bu markayı silmek istiyor musun?",dataSaved:"Kayıt güncellendi",dataAdded:"Marka eklendi",dataDeleted:"Kayıt silindi",requiredBrand:"Marka adı gerekli",importToSupabase:"data.json → Supabase aktar",exportData:"data.json indir",supabaseReady:"Supabase bağlı",supabaseFallback:"Supabase boş/ulaşılamıyor, data.json yedeği kullanılıyor.",localOnly:"Giriş yaptıysan değişiklikler Supabase’e kaydedilir.",aboutTitle:"📖 Ahlak Rehberim",aboutIntro:"Supabase destekli marka, barkod ve alternatif rehberi.",listStatus:"📊 Liste Durumu",listStatusText:c=>`${c.total} toplam kayıt var. ${c.boykot} boykot, ${c.safe} boykotta değil, ${c.altli} alternatif bilgisi içeriyor.`,howSearch:"🔍 Nasıl Aranır?",howSearchText:"Marka, ana firma, kategori, alternatif veya barkod yazabilirsin.",disclaimer:"⚠️ Bilgilendirme",disclaimerText:"Bu uygulama yalnızca bilgilendirme amacıyla hazırlanmıştır.",update:"🔄 Güncelleme",updateText:"V7 ile veriler Supabase üzerinden güncellenir.",scanBarcode:"Barkod Tara",barcodePrompt:"Barkod numarasını yaz:",barcodeMissing:"Barkod alanı yoksa eşleşme bulunmayabilir.",downloaded:"İndirildi"},
  en:{htmlLang:"en",kicker:"Supabase V7",title:"Ahlak Rehberim",subtitle:"Choose consciously, shop with confidence.",search:"Search brand, company, category or barcode...",navHome:"Home",navCompanies:"Companies",navCategories:"Category",navFavorites:"Favorite",navAbout:"About",boycott:"Boycott",notBoycotted:"Not Boycotted",review:"Under Review",withAlt:"With Alternatives",favorites:"Favorites",all:"All",results:"results",brands:"brands",companies:"Parent Companies",categories:"Categories",category:"Category",parent:"Parent Company",barcode:"Barcode",alternative:"Alternative",details:"View Details →",close:"Close",source:"Source",note:"Note",openSource:"Open source",noResult:"No results found.",safeInfo:"This brand was added to Not Boycotted.",quickTitle:"Quick Access",admin:"Admin",login:"Login",logout:"Logout",email:"Email",password:"Password",brandName:"Brand name",save:"Save",resetForm:"Clear form",chooseBrand:"Select brand",deleteBrand:"Delete brand",confirmDelete:"Delete this brand?",dataSaved:"Record updated",dataAdded:"Brand added",dataDeleted:"Record deleted",requiredBrand:"Brand name required",importToSupabase:"Import data.json to Supabase",exportData:"Download data.json",supabaseReady:"Supabase connected",supabaseFallback:"Supabase empty/unavailable; using data.json fallback.",localOnly:"If logged in, changes are saved to Supabase.",aboutTitle:"📖 Ahlak Rehberim",aboutIntro:"Supabase-powered brand, barcode and alternative guide.",listStatus:"📊 List Status",listStatusText:c=>`${c.total} records. ${c.boykot} boycott, ${c.safe} not boycotted, ${c.altli} with alternatives.`,howSearch:"🔍 How to Search",howSearchText:"Search by brand, company, category, alternative or barcode.",disclaimer:"⚠️ Disclaimer",disclaimerText:"Informational purposes only.",update:"🔄 Updates",updateText:"In V7, data is updated through Supabase.",scanBarcode:"Scan Barcode",barcodePrompt:"Enter barcode number:",barcodeMissing:"If no barcode data exists, no match may be found.",downloaded:"Downloaded"},
  de:{htmlLang:"de",kicker:"Supabase V7",title:"Ahlak Rehberim",subtitle:"Bewusst konsumieren, sicher wählen.",search:"Marke, Firma, Kategorie oder Barcode suchen...",navHome:"Start",navCompanies:"Firmen",navCategories:"Kategorie",navFavorites:"Favorit",navAbout:"Info",boycott:"Boykott",notBoycotted:"Nicht boykottiert",review:"In Prüfung",withAlt:"Mit Alternativen",favorites:"Favoriten",all:"Alle",results:"Ergebnisse",brands:"Marken",companies:"Mutterfirmen",categories:"Kategorien",category:"Kategorie",parent:"Mutterfirma",barcode:"Barcode",alternative:"Alternative",details:"Details ansehen →",close:"Schließen",source:"Quelle",note:"Notiz",openSource:"Quelle öffnen",noResult:"Keine Ergebnisse gefunden.",safeInfo:"Diese Marke wurde dem Bereich Nicht boykottiert hinzugefügt.",quickTitle:"Schnellzugriff",admin:"Verwaltung",login:"Anmelden",logout:"Abmelden",email:"E-Mail",password:"Passwort",brandName:"Markenname",save:"Speichern",resetForm:"Leeren",chooseBrand:"Marke auswählen",deleteBrand:"Marke löschen",confirmDelete:"Diese Marke löschen?",dataSaved:"Eintrag aktualisiert",dataAdded:"Marke hinzugefügt",dataDeleted:"Eintrag gelöscht",requiredBrand:"Markenname erforderlich",importToSupabase:"data.json nach Supabase importieren",exportData:"data.json herunterladen",supabaseReady:"Supabase verbunden",supabaseFallback:"Supabase leer/nicht verfügbar; data.json wird genutzt.",localOnly:"Wenn angemeldet, werden Änderungen in Supabase gespeichert.",aboutTitle:"📖 Ahlak Rehberim",aboutIntro:"Supabase-basierter Marken-, Barcode- und Alternativen-Ratgeber.",listStatus:"📊 Listenstatus",listStatusText:c=>`${c.total} Einträge. ${c.boykot} Boykott, ${c.safe} nicht boykottiert, ${c.altli} mit Alternativen.`,howSearch:"🔍 So suchst du",howSearchText:"Suche nach Marke, Firma, Kategorie, Alternative oder Barcode.",disclaimer:"⚠️ Hinweis",disclaimerText:"Nur zur Information.",update:"🔄 Aktualisierung",updateText:"In V7 werden Daten über Supabase aktualisiert.",scanBarcode:"Barcode scannen",barcodePrompt:"Barcode-Nummer eingeben:",barcodeMissing:"Wenn keine Barcode-Daten vorhanden sind, wird eventuell nichts gefunden.",downloaded:"Heruntergeladen"}
};

function t(k){return (I[lang]&&I[lang][k])||I.tr[k]||k}
function esc(s){return String(s??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;")}
function norm(s){return String(s||"").toLocaleLowerCase("tr-TR").normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9ğüşöçıİĞÜŞÖÇäöüß]+/gi," ").trim()}
function get(o,names){for(const n of names){if(o&&o[n]!==undefined&&o[n]!==null&&String(o[n]).trim()!=="")return String(o[n]).trim()}return""}
function loadFavorites(){try{return JSON.parse(localStorage.getItem("ahlak_favorites_v7")||"[]")}catch{return[]}}
function saveFavorites(){localStorage.setItem("ahlak_favorites_v7",JSON.stringify(favorites))}
function isFav(m){return favorites.includes(norm(m))}
function toggleFav(m){const k=norm(m);favorites=isFav(m)?favorites.filter(x=>x!==k):[...favorites,k];saveFavorites();render()}

function rawStatus(r){const d=norm(get(r,["durum","status"]));if(d.includes("safe")||d.includes("boykotta degil")||d.includes("not boycotted"))return"safe";if(d.includes("alternatif")||d.includes("alternative"))return"alternatif";if(d.includes("dikkat")||d.includes("caution"))return"dikkat";if(d.includes("incelen")||d.includes("review"))return"inceleme";return d||"boykot"}
function statusLabel(s){return {boykot:`🔴 ${t("boycott")}`,safe:`✅ ${t("notBoycotted")}`,alternatif:`🟢 ${t("alternative")}`,dikkat:"🟠 Dikkat",inceleme:`⚪ ${t("review")}`}[s]||s}
function hasAlternative(x){const a=norm(x.alternatif);return !!a&&!a.includes("alternatif manuel eklenmeli")}
function normalizeItem(raw,i){
  const marka=get(raw,["marka","Marka","brand"])||`Marka ${i+1}`;
  const anaFirma=get(raw,["anaFirma","ana_firma","anafirma","Ana Firma"])||marka;
  const kategori=get(raw,["kategori","Kategori","category"]);
  const alternatif=get(raw,["alternatif","Alternatif","alternative"]);
  const kaynak=get(raw,["kaynak","Kaynak","source"]);
  const not=get(raw,["notlar","not","Not","note"]);
  const barkodRaw=raw.barkod??raw.barcode??raw.ean??raw.gtin??[];
  const barkod=Array.isArray(barkodRaw)?barkodRaw:(barkodRaw?String(barkodRaw).split(/[;, ]+/).filter(Boolean):[]);
  const status=rawStatus(raw);
  const hay=norm([marka,anaFirma,kategori,alternatif,kaynak,not,barkod.join(" "),statusLabel(status)].join(" "));
  return {id:raw.id||null,marka,anaFirma,kategori,alternatif,kaynak,not,barkod,status,hay};
}
function toDbRow(x){return {marka:x.marka,ana_firma:x.anaFirma,kategori:x.kategori,alternatif:x.alternatif,kaynak:x.kaynak,notlar:x.not,durum:x.status,barkod:Array.isArray(x.barkod)?x.barkod:[]}}
function fromDbRow(r){return {id:r.id,marka:r.marka,anaFirma:r.ana_firma,kategori:r.kategori,alternatif:r.alternatif,kaynak:r.kaynak,not:r.notlar,durum:r.durum,barkod:r.barkod||[]}}

async function loadSupabaseSession(){if(!supabaseClient)return;const {data}=await supabaseClient.auth.getSession();adminSession=data.session||null}
async function loadSupabaseData(){if(!supabaseClient)throw new Error("No Supabase");let all=[];let from=0;const step=1000;while(true){const {data,error}=await supabaseClient.from("brands").select("*").order("marka").range(from,from+step-1);if(error)throw error;all=all.concat(data||[]);if(!data||data.length<step)break;from+=step}return all.map(fromDbRow)}
async function loadFallbackData(){const res=await fetch(`data.json?v=${VERSION}`,{cache:"reload"});const json=await res.json();return Array.isArray(json)?json:(json.data||[])}
async function init(){applyTheme();applyLang();setupServiceWorker();await loadSupabaseSession();try{let list=[];try{list=await loadSupabaseData()}catch(e){list=[]}if(!list.length){list=await loadFallbackData();toast(t("supabaseFallback"))}else toast(t("supabaseReady"));DATA=list.map(normalizeItem).sort((a,b)=>a.marka.localeCompare(b.marka,"tr"));render()}catch(err){results.innerHTML=`<div class="empty">${esc(err.message)}</div>`}}

function counts(){return {total:DATA.length,boykot:DATA.filter(x=>x.status==="boykot").length,safe:DATA.filter(x=>x.status==="safe").length,inceleme:DATA.filter(x=>x.status==="inceleme").length,altli:DATA.filter(hasAlternative).length,fav:favorites.length,firmalar:new Set(DATA.map(x=>x.anaFirma||"-")).size,kategoriler:new Set(DATA.map(x=>x.kategori||"-").filter(Boolean)).size}}
function renderStats(){const c=counts();stats.innerHTML=`<button class="stat red" data-stat="boykot"><small>🔴 ${t("boycott")}</small><b>${c.boykot}</b></button><button class="stat safe" data-stat="safe"><small>✅ ${t("notBoycotted")}</small><b>${c.safe}</b></button><button class="stat green" data-stat="altli"><small>⭐ ${t("withAlt")}</small><b>${c.altli}</b></button><button class="stat gray" data-stat="inceleme"><small>⚪ ${t("review")}</small><b>${c.inceleme}</b></button>`}
function renderQuickActions(){const c=counts();quickActions.innerHTML=`<h2>${t("quickTitle")}</h2><div class="quickGrid"><button data-go="companies"><span>🏢</span><b>${t("companies")}</b><small>${c.firmalar}</small></button><button data-go="categories"><span>📂</span><b>${t("categories")}</b><small>${c.kategoriler}</small></button><button data-go="alternatives"><span>⭐</span><b>${t("withAlt")}</b><small>${c.altli}</small></button><button data-go="favorites"><span>❤️</span><b>${t("favorites")}</b><small>${c.fav}</small></button><button data-go="admin"><span>⚙️</span><b>${t("admin")}</b><small>DB</small></button></div>`}
function renderFilters(){const arr=[["all",t("all")],["boykot",`🔴 ${t("boycott")}`],["safe",`✅ ${t("notBoycotted")}`],["altli",`⭐ ${t("withAlt")}`],["inceleme",`⚪ ${t("review")}`],["fav",`❤️ ${t("favorites")}`]];quickFilters.innerHTML=arr.map(([k,l])=>`<button class="chip ${filter===k?'active':''}" data-filter="${k}">${l}</button>`).join("")}
function filteredList(base=DATA){const q=norm(search.value);return base.filter(x=>{const okQ=!q||x.hay.includes(q);const okF=filter==="all"||(filter==="boykot"&&x.status==="boykot")||(filter==="safe"&&x.status==="safe")||(filter==="altli"&&hasAlternative(x))||(filter==="inceleme"&&x.status==="inceleme")||(filter==="fav"&&isFav(x.marka));return okQ&&okF}).sort((a,b)=>Number(isFav(b.marka))-Number(isFav(a.marka))||a.marka.localeCompare(b.marka,"tr"))}
function altHtml(x){if(x.status==="safe"&&!x.alternatif)return`<div class="altBox"><span>${t("notBoycotted")}</span><b>${t("safeInfo")}</b></div>`;if(!hasAlternative(x))return`<div class="altBox"><span>${t("alternative")}</span><b>-</b></div>`;const tags=x.alternatif.split(/[;,•]/).map(v=>v.trim()).filter(Boolean).slice(0,8);return`<div class="altBox"><span>${t("alternative")}</span><div class="tags">${tags.map(v=>`<em>${esc(v)}</em>`).join("")}</div></div>`}
function card(x){return`<article class="card ${x.status}" data-brand="${encodeURIComponent(x.marka)}"><div class="cardTop"><div><div class="badgeLine"><span class="badge ${x.status}">${statusLabel(x.status)}</span>${hasAlternative(x)?`<span class="badge alternatif">⭐ ${t("withAlt")}</span>`:""}</div><h3>${esc(x.marka)}</h3><div class="company">🏢 ${esc(x.anaFirma||"-")}</div></div><button class="fav" data-fav="${encodeURIComponent(x.marka)}">${isFav(x.marka)?"❤️":"♡"}</button></div><div class="meta metaSingle"><div class="box"><span>${t("category")}</span><b>${esc(x.kategori||"-")}</b></div></div>${altHtml(x)}<button class="more">${t("details")}</button></article>`}
function titleFor(){if(currentGroup)return currentGroup.title;if(view==="favorites"||filter==="fav")return`❤️ ${t("favorites")}`;if(view==="alternatives"||filter==="altli")return`⭐ ${t("withAlt")}`;return t("all")}
function renderHome(base=DATA){const list=filteredList(base);renderStats();renderQuickActions();renderFilters();sectionTitle.innerHTML=`<h2>${esc(titleFor())}</h2><span>${list.length} ${t("results")}</span>`;results.innerHTML=list.length?list.slice(0,800).map(card).join(""):`<div class="empty">${t("noResult")}</div>`}
function groupBy(key,base=DATA){const m=new Map();for(const x of base){const name=x[key]||"-";if(!m.has(name))m.set(name,[]);m.get(name).push(x)}return[...m.entries()].sort((a,b)=>b[1].length-a[1].length||a[0].localeCompare(b[0],"tr"))}
function renderCompanies(){currentGroup=null;renderStats();renderQuickActions();quickFilters.innerHTML="";search.value="";const g=groupBy("anaFirma");sectionTitle.innerHTML=`<h2>🏢 ${t("companies")}</h2><span>${g.length}</span>`;results.innerHTML=g.map(([name,items])=>`<button class="group" data-company="${encodeURIComponent(name)}"><div><b>${esc(name)}</b><small>${items.slice(0,4).map(x=>esc(x.marka)).join(", ")}${items.length>4?"...":""}</small></div><div class="count">${items.length}</div></button>`).join("")}
function categoryIcon(name){const n=norm(name);if(n.includes("icecek")||n.includes("su"))return"🥤";if(n.includes("gida")||n.includes("cikolata"))return"🍫";if(n.includes("temizlik"))return"🧼";if(n.includes("kozmetik"))return"💄";if(n.includes("saglik"))return"💊";if(n.includes("giyim"))return"👕";return"📂"}
function renderCategories(){currentGroup=null;renderStats();renderQuickActions();quickFilters.innerHTML="";search.value="";const g=groupBy("kategori").filter(([name])=>name&&name!=="-");sectionTitle.innerHTML=`<h2>📂 ${t("categories")}</h2><span>${g.length}</span>`;results.innerHTML=g.map(([name,items])=>`<button class="group" data-category="${encodeURIComponent(name)}"><div><b>${categoryIcon(name)} ${esc(name)}</b><small>${items.length} ${t("brands")}</small></div><div class="count">${items.length}</div></button>`).join("")}
function renderAbout(){const c=counts();stats.innerHTML="";quickActions.innerHTML="";quickFilters.innerHTML="";sectionTitle.innerHTML="";results.innerHTML=`<section class="aboutHero"><h2>${t("aboutTitle")}</h2><p>${t("aboutIntro")}</p></section><div class="aboutGrid"><div class="aboutCard"><h3>${t("listStatus")}</h3><p>${I[lang].listStatusText(c)}</p></div><div class="aboutCard"><h3>${t("howSearch")}</h3><p>${t("howSearchText")}</p></div><div class="aboutCard"><h3>${t("disclaimer")}</h3><p>${t("disclaimerText")}</p></div><div class="aboutCard"><h3>${t("update")}</h3><p>${t("updateText")}</p></div></div>`}

function adminOptions(){return DATA.map(x=>x.marka).filter((v,i,a)=>v&&a.indexOf(v)===i).sort((a,b)=>a.localeCompare(b,"tr")).map(name=>`<option value="${esc(name)}">${esc(name)}</option>`).join("")}
function getAdminValues(){const raw=$("adminBarkod")?.value.trim()||"";return {marka:$("adminMarka").value.trim(),anaFirma:$("adminAnaFirma").value.trim(),kategori:$("adminKategori").value.trim(),alternatif:$("adminAlternatif").value.trim(),kaynak:$("adminKaynak").value.trim(),not:$("adminNot").value.trim(),barkod:raw?raw.split(/[;, ]+/).filter(Boolean):[],status:$("adminDurum").value}}
async function saveAdminBrand(){
  if(!adminSession){toast(t("login"));return}
  const v=getAdminValues();
  if(!v.marka){toast(t("requiredBrand"));return}
  if(!v.anaFirma)v.anaFirma=v.marka;

  const row=toDbRow(v);
  let existing=DATA.find(x=>norm(x.marka)===norm(v.marka));
  let res;

  if(existing && existing.id){
    res = await supabaseClient.from("brands").update(row).eq("id", existing.id);
  }else{
    const check = await supabaseClient.from("brands").select("id,marka").ilike("marka", v.marka).limit(1);
    if(check.error){toast(check.error.message);return}

    if(check.data && check.data.length){
      res = await supabaseClient.from("brands").update(row).eq("id", check.data[0].id);
      existing = true;
    }else{
      res = await supabaseClient.from("brands").insert(row);
    }
  }

  if(res.error){toast(res.error.message);return}
  toast(existing?t("dataSaved"):t("dataAdded"));
  await reloadFromSupabase();
  view="admin";
  render();
}
async function deleteAdminBrand(){if(!adminSession){toast(t("login"));return}const name=$("adminSelect").value||$("adminMarka").value;if(!name||!confirm(t("confirmDelete")))return;const item=DATA.find(x=>x.marka===name);if(item?.id){const {error}=await supabaseClient.from("brands").delete().eq("id",item.id);if(error){toast(error.message);return}}toast(t("dataDeleted"));await reloadFromSupabase();view="admin";render()}
async function importToSupabase(){
  if(!adminSession){toast(t("login"));return}

  for(const item of DATA){
    const row = toDbRow(item);
    const check = await supabaseClient.from("brands").select("id").ilike("marka", item.marka).limit(1);
    if(check.error){toast(check.error.message);return}

    if(check.data && check.data.length){
      const {error} = await supabaseClient.from("brands").update(row).eq("id", check.data[0].id);
      if(error){toast(error.message);return}
    }else{
      const {error} = await supabaseClient.from("brands").insert(row);
      if(error){toast(error.message);return}
    }
  }

  toast(t("dataSaved"));
  await reloadFromSupabase();
  view="admin";
  render();
}
async function reloadFromSupabase(){const list=await loadSupabaseData();DATA=list.map(normalizeItem).sort((a,b)=>a.marka.localeCompare(b.marka,"tr"))}
function fillAdminForm(name){const item=DATA.find(x=>x.marka===name);if(!item)return;$("adminMarka").value=item.marka||"";$("adminAnaFirma").value=item.anaFirma||"";$("adminKategori").value=item.kategori||"";$("adminAlternatif").value=item.alternatif||"";$("adminKaynak").value=item.kaynak||"";$("adminNot").value=item.not||"";$("adminBarkod").value=Array.isArray(item.barkod)?item.barkod.join(", "):(item.barkod||"");$("adminDurum").value=item.status||"boykot"}
function clearAdminForm(){["adminMarka","adminAnaFirma","adminKategori","adminAlternatif","adminKaynak","adminNot","adminBarkod"].forEach(id=>$(id).value="");$("adminDurum").value="boykot"}
async function adminLogin(){const email=$("adminEmail").value.trim();const password=$("adminPassword").value;const {data,error}=await supabaseClient.auth.signInWithPassword({email,password});if(error){toast(error.message);return}adminSession=data.session;toast(t("supabaseReady"));renderAdmin()}
async function adminLogout(){await supabaseClient.auth.signOut();adminSession=null;renderAdmin()}
function downloadDataJson(){const raw=DATA.map(x=>{const o={marka:x.marka,anaFirma:x.anaFirma,kategori:x.kategori,alternatif:x.alternatif,kaynak:x.kaynak,not:x.not,durum:x.status};if(x.barkod?.length)o.barkod=x.barkod;Object.keys(o).forEach(k=>{if(!o[k]||(Array.isArray(o[k])&&!o[k].length))delete o[k]});return o});const blob=new Blob([JSON.stringify(raw,null,2)],{type:"application/json"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="data.json";a.click();URL.revokeObjectURL(url);toast(t("downloaded"))}
function renderAdmin(){stats.innerHTML="";quickActions.innerHTML="";quickFilters.innerHTML="";sectionTitle.innerHTML=`<h2>⚙️ ${t("admin")}</h2><span>${DATA.length} ${t("brands")}</span>`;results.innerHTML=`<section class="adminPanel"><p class="adminNotice">${esc(t("localOnly"))}</p><div class="adminLogin">${adminSession?`<button onclick="adminLogout()">🚪 ${esc(t("logout"))}</button>`:`<input id="adminEmail" placeholder="${esc(t("email"))}"><input id="adminPassword" type="password" placeholder="${esc(t("password"))}"><button onclick="adminLogin()">🔐 ${esc(t("login"))}</button>`}</div><div class="adminTools"><button onclick="importToSupabase()">☁️ ${esc(t("importToSupabase"))}</button><button onclick="downloadDataJson()">⬇️ ${esc(t("exportData"))}</button></div><div class="adminSelectRow"><label>${esc(t("chooseBrand"))}</label><select id="adminSelect"><option value="">—</option>${adminOptions()}</select></div><div class="adminForm"><label>${esc(t("brandName"))}<input id="adminMarka"></label><label>${esc(t("parent"))}<input id="adminAnaFirma"></label><label>${esc(t("category"))}<input id="adminKategori"></label><label>${esc(t("alternative"))}<textarea id="adminAlternatif"></textarea></label><label>${esc(t("barcode"))}<textarea id="adminBarkod"></textarea></label><label>${esc(t("source"))}<input id="adminKaynak"></label><label>${esc(t("note"))}<textarea id="adminNot"></textarea></label><label>Durum<select id="adminDurum"><option value="boykot">${esc(t("boycott"))}</option><option value="safe">${esc(t("notBoycotted"))}</option><option value="alternatif">${esc(t("alternative"))}</option><option value="dikkat">Dikkat</option><option value="inceleme">${esc(t("review"))}</option></select></label></div><div class="adminButtons"><button onclick="saveAdminBrand()">✅ ${esc(t("save"))}</button><button onclick="clearAdminForm()">🧹 ${esc(t("resetForm"))}</button><button class="danger" onclick="deleteAdminBrand()">🗑️ ${esc(t("deleteBrand"))}</button></div></section>`;$("adminSelect").addEventListener("change",e=>fillAdminForm(e.target.value))}

function render(){document.querySelectorAll(".bottomNav button").forEach(b=>b.classList.toggle("active",b.dataset.view===view));if(currentGroup)return renderHome(currentGroup.items);if(view==="home")return renderHome();if(view==="alternatives"){filter="altli";return renderHome()}if(view==="favorites"){filter="fav";return renderHome()}if(view==="companies")return renderCompanies();if(view==="categories")return renderCategories();if(view==="admin")return renderAdmin();if(view==="about")return renderAbout()}
function detail(x){const d=$("detailDialog"),c=$("detailContent");c.innerHTML=`<div class="detailHead"><h2>${esc(x.marka)}</h2><p>${statusLabel(x.status)}</p></div><div class="detailBody"><div class="detailLine"><span>${t("parent")}</span><b>${esc(x.anaFirma||"-")}</b></div><div class="detailLine"><span>${t("category")}</span><b>${esc(x.kategori||"-")}</b></div><div class="detailLine"><span>${t("barcode")}</span><b>${esc(Array.isArray(x.barkod)?x.barkod.join(", "):(x.barkod||"-"))}</b></div><div class="detailLine"><span>${t("alternative")}</span><b>${esc(x.alternatif||"-")}</b></div><div class="detailLine"><span>${t("note")}</span><b>${esc(x.not||"-")}</b></div><div class="detailLine"><span>${t("source")}</span><b>${x.kaynak&&/^https?:\/\//i.test(x.kaynak)?`<a href="${esc(x.kaynak)}" target="_blank">${t("openSource")}</a>`:esc(x.kaynak||"-")}</b></div></div>`;d.showModal()}
function handleBarcodeValue(code){const n=norm(code);const item=DATA.find(x=>Array.isArray(x.barkod)&&x.barkod.some(v=>norm(v)===n));if(item)detail(item);else{search.value=code;render()}}
function toast(message){const el=document.createElement("div");el.className="toast";el.textContent=message;document.body.appendChild(el);requestAnimationFrame(()=>el.classList.add("show"));setTimeout(()=>{el.classList.remove("show");setTimeout(()=>el.remove(),300)},2800)}
function setupServiceWorker(){if("serviceWorker" in navigator)navigator.serviceWorker.register(`sw.js?v=${VERSION}`).catch(()=>{})}
function applyTheme(){const dark=localStorage.getItem("ahlak_theme")==="dark";document.body.classList.toggle("dark",dark);themeBtn.textContent=dark?"☀️":"🌙"}
function applyLang(){document.documentElement.lang=t("htmlLang");$("kicker").textContent=t("kicker");$("appTitle").textContent=t("title");$("appSubtitle").textContent=t("subtitle");search.placeholder=t("search");$("closeDialog").textContent=t("close");document.querySelectorAll("[data-i]").forEach(el=>el.textContent=t(el.dataset.i));document.querySelectorAll(".langSwitch button").forEach(b=>b.classList.toggle("active",b.dataset.lang===lang))}

search.addEventListener("input",()=>{currentGroup=null;if(view!=="home"){view="home";filter="all"}render()});
clearBtn.addEventListener("click",()=>{search.value="";search.focus();currentGroup=null;render()});
if(barcodeBtn)barcodeBtn.addEventListener("click",()=>{const code=prompt(`${t("barcodePrompt")}\n${t("barcodeMissing")}`);if(code)handleBarcodeValue(code.trim())});
quickFilters.addEventListener("click",e=>{const b=e.target.closest("[data-filter]");if(!b)return;currentGroup=null;filter=b.dataset.filter;view="home";render()});
quickActions.addEventListener("click",e=>{const b=e.target.closest("[data-go]");if(!b)return;currentGroup=null;view=b.dataset.go;if(view==="alternatives")filter="altli";if(view==="favorites")filter="fav";render()});
stats.addEventListener("click",e=>{const b=e.target.closest("[data-stat]");if(!b)return;currentGroup=null;filter=b.dataset.stat;view="home";render()});
results.addEventListener("click",e=>{const f=e.target.closest("[data-fav]");if(f){e.stopPropagation();toggleFav(decodeURIComponent(f.dataset.fav));return}const g=e.target.closest("[data-company]");if(g){const name=decodeURIComponent(g.dataset.company);currentGroup={title:`🏢 ${name}`,items:DATA.filter(x=>x.anaFirma===name)};view="home";filter="all";search.value="";render();return}const cat=e.target.closest("[data-category]");if(cat){const name=decodeURIComponent(cat.dataset.category);currentGroup={title:`${categoryIcon(name)} ${name}`,items:DATA.filter(x=>x.kategori===name)};view="home";filter="all";search.value="";render();return}const c=e.target.closest("[data-brand]");if(c){const name=decodeURIComponent(c.dataset.brand);const item=DATA.find(x=>x.marka===name);if(item)detail(item)}});
document.querySelectorAll(".bottomNav button").forEach(b=>b.addEventListener("click",()=>{currentGroup=null;view=b.dataset.view;if(view==="home")filter="all";render()}));
document.querySelectorAll(".langSwitch button").forEach(b=>b.addEventListener("click",()=>{lang=b.dataset.lang;localStorage.setItem("boykot_lang",lang);applyLang();render()}));
themeBtn.addEventListener("click",()=>{const next=document.body.classList.contains("dark")?"light":"dark";localStorage.setItem("ahlak_theme",next);applyTheme()});
$("closeDialog").addEventListener("click",()=>$("detailDialog").close());
window.saveAdminBrand=saveAdminBrand;window.deleteAdminBrand=deleteAdminBrand;window.clearAdminForm=clearAdminForm;window.downloadDataJson=downloadDataJson;window.importToSupabase=importToSupabase;window.adminLogin=adminLogin;window.adminLogout=adminLogout;
init();
