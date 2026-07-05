const VERSION = "20260705-v4-ui-bayrakli-dil";
let DATA = [];
let view = "home";
let filter = "all";
let favorites = loadFavorites();
let lang = localStorage.getItem("boykot_lang") || "tr";

const $ = id => document.getElementById(id);
const search = $("search");
const clearBtn = $("clearBtn");
const stats = $("stats");
const quickActions = $("quickActions");
const quickFilters = $("quickFilters");
const sectionTitle = $("sectionTitle");
const results = $("results");
const themeBtn = $("themeBtn");

const I = {
  tr: {
    htmlLang:"tr", kicker:"Bilinçli Tüketim Rehberi", title:"Ahlak Rehberim",
    subtitle:"Bilinçli tüket, güvenle tercih et.", search:"Marka, firma veya kategori ara...",
    navHome:"Ana", navCompanies:"Firmalar", navCategories:"Kategori", navFavorites:"Favori", navAbout:"Bilgi",
    total:"Toplam", boycott:"Boykot", caution:"Dikkat", alternative:"Alternatif",
    notBoycotted:"Boykotta Değil", review:"İnceleniyor", withAlt:"Alternatifli",
    favorites:"Favoriler", all:"Tümü", results:"sonuç", brands:"marka", companies:"Ana Firmalar",
    categories:"Kategoriler", category:"Kategori", code:"Kod", parent:"Ana Firma",
    details:"Ayrıntıları Gör →", close:"Kapat", source:"Kaynak", note:"Not", openSource:"Kaynağı aç",
    noResult:"Sonuç bulunamadı.", dataError:"Veri yüklenemedi.", dataHelp:"data.json dosyası index.html ile aynı klasörde olmalı.",
    safeInfo:"Bu marka boykot listesinde olmayanlar bölümüne eklendi.",
    quickTitle:"Hızlı Erişim", open:"Aç",
    aboutTitle:"📖 Ahlak Rehberim", aboutIntro:"Markaları, ana firmaları, kategorileri ve alternatifleri hızlıca bulmak için hazırlanmış mobil uyumlu rehber.",
    listStatus:"📊 Liste Durumu",
    listStatusText:c=>`${c.total} toplam kayıt var. ${c.boykot} boykot, ${c.safe} boykotta değil, ${c.altli} alternatif bilgisi içeriyor.`,
    safeText:"Bu bölüm, eklenen alternatif listesinden gelen ve ana boykot listesinde bulunmayan markaları gösterir.",
    howSearch:"🔍 Nasıl Aranır?", howSearchText:"Arama kutusuna marka adı, ana firma, kategori, kod veya alternatif ürün yazabilirsin.",
    companiesText:"Aynı şirkete ait markaları görmek için Firmalar bölümünü aç.",
    favText:"Kalp işaretine basarak markaları favorilere ekleyebilirsin.",
    altText:"Alternatif olarak gösterilen ürünler aynı ürün grubunda değerlendirilebilecek seçeneklerdir. Satın almadan önce kendi araştırmanı yapman tavsiye edilir.",
    disclaimer:"⚠️ Bilgilendirme", disclaimerText:"Bu uygulama yalnızca bilgilendirme amacıyla hazırlanmıştır. Bilgiler farklı kaynaklardan derlenmiştir ve zamanla değişebilir.",
    update:"🔄 Güncelleme", updateText:"Yeni marka eklemek veya bilgileri değiştirmek için data.json dosyasını güncellemen yeterlidir."
  },
  en: {
    htmlLang:"en", kicker:"Conscious Choice Guide", title:"Ahlak Rehberim",
    subtitle:"Choose consciously, shop with confidence.", search:"Search brand, company or category...",
    navHome:"Home", navCompanies:"Companies", navCategories:"Category", navFavorites:"Favorite", navAbout:"About",
    total:"Total", boycott:"Boycott", caution:"Caution", alternative:"Alternative",
    notBoycotted:"Not Boycotted", review:"Under Review", withAlt:"With Alternatives",
    favorites:"Favorites", all:"All", results:"results", brands:"brands", companies:"Parent Companies",
    categories:"Categories", category:"Category", code:"Code", parent:"Parent Company",
    details:"View Details →", close:"Close", source:"Source", note:"Note", openSource:"Open source",
    noResult:"No results found.", dataError:"Data could not be loaded.", dataHelp:"data.json must be in the same folder as index.html.",
    safeInfo:"This brand was added to the Not Boycotted section.",
    quickTitle:"Quick Access", open:"Open",
    aboutTitle:"📖 Ahlak Rehberim", aboutIntro:"A mobile-friendly guide for quickly finding brands, parent companies, categories and alternatives.",
    listStatus:"📊 List Status",
    listStatusText:c=>`${c.total} total records. ${c.boykot} boycott entries, ${c.safe} not boycotted entries, ${c.altli} include alternatives.`,
    safeText:"This section shows brands from the added alternatives list that are not found in the main boycott list.",
    howSearch:"🔍 How to Search", howSearchText:"Search by brand name, parent company, category, code or alternative product.",
    companiesText:"Open Companies to view brands that belong to the same parent company.",
    favText:"Tap the heart to add brands to favorites.",
    altText:"Suggested alternatives are options in the same product group. Please do your own research before buying.",
    disclaimer:"⚠️ Disclaimer", disclaimerText:"This app is for informational purposes only. Information is compiled from different sources and may change over time.",
    update:"🔄 Updates", updateText:"To add or edit brands, update the data.json file."
  },
  de: {
    htmlLang:"de", kicker:"Bewusster Konsum", title:"Ahlak Rehberim",
    subtitle:"Bewusst konsumieren, sicher wählen.", search:"Marke, Firma oder Kategorie suchen...",
    navHome:"Start", navCompanies:"Firmen", navCategories:"Kategorie", navFavorites:"Favorit", navAbout:"Info",
    total:"Gesamt", boycott:"Boykott", caution:"Achtung", alternative:"Alternative",
    notBoycotted:"Nicht boykottiert", review:"In Prüfung", withAlt:"Mit Alternativen",
    favorites:"Favoriten", all:"Alle", results:"Ergebnisse", brands:"Marken", companies:"Mutterfirmen",
    categories:"Kategorien", category:"Kategorie", code:"Code", parent:"Mutterfirma",
    details:"Details ansehen →", close:"Schließen", source:"Quelle", note:"Notiz", openSource:"Quelle öffnen",
    noResult:"Keine Ergebnisse gefunden.", dataError:"Daten konnten nicht geladen werden.", dataHelp:"data.json muss im selben Ordner wie index.html liegen.",
    safeInfo:"Diese Marke wurde dem Bereich Nicht boykottiert hinzugefügt.",
    quickTitle:"Schnellzugriff", open:"Öffnen",
    aboutTitle:"📖 Ahlak Rehberim", aboutIntro:"Ein mobiler Ratgeber, um Marken, Mutterfirmen, Kategorien und Alternativen schnell zu finden.",
    listStatus:"📊 Listenstatus",
    listStatusText:c=>`${c.total} Einträge. ${c.boykot} Boykott, ${c.safe} nicht boykottiert, ${c.altli} mit Alternativen.`,
    safeText:"Dieser Bereich zeigt Marken aus der Alternativliste, die nicht in der Haupt-Boykottliste vorkommen.",
    howSearch:"🔍 So suchst du", howSearchText:"Suche nach Marke, Mutterfirma, Kategorie, Code oder Alternative.",
    companiesText:"Öffne Firmen, um Marken derselben Mutterfirma zu sehen.",
    favText:"Tippe auf das Herz, um Marken zu Favoriten hinzuzufügen.",
    altText:"Vorgeschlagene Alternativen sind Optionen aus derselben Produktgruppe. Bitte selbst prüfen.",
    disclaimer:"⚠️ Hinweis", disclaimerText:"Diese App dient nur zur Information. Daten können sich ändern.",
    update:"🔄 Aktualisierung", updateText:"Um Daten zu ändern, aktualisiere die Datei data.json."
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
  const kod=get(raw,["kod","Kod","code"]) || "A2";
  const kategori=get(raw,["kategori","Kategori","category"]);
  const alternatif=get(raw,["alternatif","Alternatif","alternative","alternatives"]);
  const kaynak=get(raw,["kaynak","Kaynak","kanyak","source","link"]);
  const not=get(raw,["not","Not","note"]);
  const barkod=get(raw,["barkod","Barkod","barcode","ean","EAN"]);
  const status=rawStatus(raw,kod);
  const hay=norm([marka,anaFirma,kod,kategori,alternatif,kaynak,not,barkod,statusLabel(status)].join(" "));
  return {marka,anaFirma,kod,kategori,alternatif,kaynak,not,barkod,status,hay};
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
    const list=Array.isArray(json) ? json : (Array.isArray(json.data) ? json.data : []);
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
    kategoriler:new Set(DATA.map(x=>x.kategori||"-")).size
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
    <div class="meta">
      <div class="box"><span>${t("category")}</span><b>${esc(x.kategori||"-")}</b></div>
      <div class="box"><span>${t("code")}</span><b>${esc(x.kod||"-")}</b></div>
    </div>
    ${altHtml(x)}
    <button class="more" type="button">${t("details")}</button>
  </article>`;
}
function titleFor(){
  if(view==="boykot" || filter==="boykot") return `🔴 ${t("boycott")}`;
  if(view==="safe" || filter==="safe") return `✅ ${t("notBoycotted")}`;
  if(view==="favorites" || filter==="fav") return `❤️ ${t("favorites")}`;
  if(view==="alternatives" || filter==="altli") return `⭐ ${t("withAlt")}`;
  return t("all");
}
function renderHome(list=filteredList(),title=titleFor()){
  renderStats();
  renderQuickActions();
  renderFilters();
  sectionTitle.innerHTML=`<h2>${esc(title)}</h2><span>${list.length} ${t("results")}</span>`;
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
  if(view==="home") return renderHome();
  if(view==="boykot"){filter="boykot"; return renderHome();}
  if(view==="safe"){filter="safe"; return renderHome();}
  if(view==="alternatives"){filter="altli"; return renderHome();}
  if(view==="favorites"){filter="fav"; return renderHome();}
  if(view==="companies") return renderCompanies();
  if(view==="categories") return renderCategories();
  if(view==="about") return renderAbout();
}
function detail(x){
  const d=$("detailDialog"), c=$("detailContent");
  c.innerHTML=`<div class="detailHead"><h2>${esc(x.marka)}</h2><p>${statusLabel(x.status)}</p></div>
  <div class="detailBody">
    <div class="detailLine"><span>${t("parent")}</span><b>${esc(x.anaFirma||"-")}</b></div>
    <div class="detailLine"><span>${t("category")}</span><b>${esc(x.kategori||"-")}</b></div>
    <div class="detailLine"><span>${t("code")}</span><b>${esc(x.kod||"-")}</b></div>
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
}

search.addEventListener("input",()=>{if(view!=="home"){view="home";filter="all"} render();});
clearBtn.addEventListener("click",()=>{search.value="";search.focus();render();});
quickFilters.addEventListener("click",e=>{const b=e.target.closest("[data-filter]"); if(!b)return; filter=b.dataset.filter; view="home"; render();});
quickActions.addEventListener("click",e=>{const b=e.target.closest("[data-go]"); if(!b)return; view=b.dataset.go; if(view==="alternatives")filter="altli"; if(view==="favorites")filter="fav"; render();});
stats.addEventListener("click",e=>{const b=e.target.closest("[data-stat]"); if(!b)return; filter=b.dataset.stat; view=filter==="safe"?"safe":"home"; render();});
results.addEventListener("click",e=>{
  const f=e.target.closest("[data-fav]");
  if(f){e.stopPropagation();toggleFav(decodeURIComponent(f.dataset.fav));return}
  const g=e.target.closest("[data-company]");
  if(g){const name=decodeURIComponent(g.dataset.company);view="home";filter="all";search.value=name;render();return}
  const cat=e.target.closest("[data-category]");
  if(cat){const name=decodeURIComponent(cat.dataset.category);view="home";filter="all";search.value=name;render();return}
  const c=e.target.closest("[data-brand]");
  if(c){const name=decodeURIComponent(c.dataset.brand);const item=DATA.find(x=>x.marka===name);if(item)detail(item)}
});
document.querySelectorAll(".bottomNav button").forEach(b=>b.addEventListener("click",()=>{view=b.dataset.view;if(view==="home")filter="all";render();}));
document.querySelectorAll(".langSwitch button").forEach(b=>b.addEventListener("click",()=>{lang=b.dataset.lang;localStorage.setItem("boykot_lang",lang);applyLang();render();}));
themeBtn.addEventListener("click",()=>{const next=document.body.classList.contains("dark")?"light":"dark";localStorage.setItem("ahlak_theme",next);applyTheme();});
$("closeDialog").addEventListener("click",()=>$("detailDialog").close());
if("serviceWorker" in navigator){navigator.serviceWorker.register("sw.js?v="+VERSION).catch(()=>{})}
init();
