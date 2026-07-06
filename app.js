
if(location.search.includes("clear-cache") || location.search.includes("v20-clear-cache")){
  try{
    localStorage.removeItem("ahlak_legal_notice_v20");
    if("caches" in window){ caches.keys().then(keys=>keys.forEach(k=>caches.delete(k))); }
    if(navigator.serviceWorker){ navigator.serviceWorker.getRegistrations().then(rs=>rs.forEach(r=>r.update())); }
  }catch(e){}
}

const VERSION="20260706-v33-oneri-supabase";
const SUPABASE_URL="https://imicltjdfzqlxzvodheq.supabase.co";
const SUPABASE_KEY="sb_publishable_yswUDZAgEoEoB9KDLAic5A_xFSL20MC";
const supabaseClient=window.supabase?window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY):null;

let importBusy=false;
let DATA=[],view="home",filter="all",currentGroup=null,adminSession=null,importedRows=[];
let favorites=loadFavorites(),lang=localStorage.getItem("boykot_lang")||"tr";
const $=id=>document.getElementById(id);
const search=$("search"),clearBtn=$("clearBtn"),barcodeBtn=$("barcodeBtn"),stats=$("stats"),quickActions=$("quickActions"),quickFilters=$("quickFilters"),sectionTitle=$("sectionTitle"),results=$("results"),themeBtn=$("themeBtn");

const I={
tr:{kicker:"V17 Güvenli Bilgilendirme",title:"Ahlak Rehberim",subtitle:"Bilinçli tüket, güvenle tercih et.",search:"Marka, firma, kategori veya barkod ara...",navHome:"Ana",navCompanies:"Firmalar",navCategories:"Kategori",navFavorites:"Favori",navAdmin:"Yönetim",boycott:"İncelenmesi Önerilir",notBoycotted:"Tercih Edilebilir",review:"Bilgi Bekleniyor",withAlt:"Alternatifli",favorites:"Favoriler",all:"Tümü",results:"sonuç",brands:"marka",companies:"Ana Firmalar",categories:"Kategoriler",countries:"Ülkeler",country:"Ülke",category:"Kategori",parent:"Ana Firma",barcode:"Barkod",alternative:"Alternatif",details:"Ayrıntıları Gör →",close:"Kapat",source:"Bilgi Kaynağı",note:"Açıklama",openSource:"Kaynağı aç",noResult:"Sonuç bulunamadı.",safeInfo:"Bu marka boykot listesinde olmayanlar bölümüne eklendi.",quickTitle:"Hızlı Erişim",admin:"Yönetim",login:"Giriş",logout:"Çıkış",email:"E-posta",password:"Şifre",brandName:"Marka adı",save:"Kaydet",resetForm:"Temizle",chooseBrand:"Marka seç",deleteBrand:"Marka Sil",confirmDelete:"Bu markayı silmek istiyor musun?",dataSaved:"Kayıt güncellendi",dataAdded:"Marka eklendi",dataDeleted:"Kayıt silindi",requiredBrand:"Marka adı gerekli",importToSupabase:"data.json → Supabase aktar",exportData:"data.json indir",localOnly:"Giriş yaptıysan değişiklikler Supabase’e kaydedilir.",dataCenter:"📥 LibreOffice / Excel Yükle",chooseFile:"V13 master.xlsx / master.ods dosyanı seç",importFileToSupabase:"☁ Seçilen Dosyayı Supabase’e Aktar",fileRows:"kayıt okundu",fileReady:"Dosya hazır",fileError:"Dosya okunamadı",importDone:"Aktarma tamamlandı",noFileData:"Önce dosya seç", importStarted:"Aktarım başladı...", importNeedLogin:"Önce admin girişi yap", importProgress:"Aktarılıyor", importError:"Aktarım hatası",downloaded:"İndirildi",supabaseReady:"Supabase bağlı",supabaseFallback:"Supabase boş/ulaşılamıyor, data.json yedeği kullanılıyor.",barcodePrompt:"Barkod numarasını yaz:",barcodeMissing:"Barkod alanı yoksa eşleşme bulunmayabilir."},
en:{kicker:"V17 Güvenli Bilgilendirme",title:"Ahlak Rehberim",subtitle:"Choose consciously.",search:"Search brand, company, category or barcode...",navHome:"Home",navCompanies:"Companies",navCategories:"Category",navFavorites:"Favorite",navAdmin:"Admin",boycott:"Review / Caution",notBoycotted:"Alternative / Preferable",review:"Being Reviewed",withAlt:"With Alternatives",favorites:"Favorites",all:"All",results:"results",brands:"brands",companies:"Companies",categories:"Categories",countries:"Countries",country:"Country",category:"Category",parent:"Parent Company",barcode:"Barcode",alternative:"Alternative",details:"View Details →",close:"Close",source:"Information Source",note:"Explanation",openSource:"Open source",noResult:"No results found.",safeInfo:"This brand is in Not Boycotted.",quickTitle:"Quick Access",admin:"Admin",login:"Login",logout:"Logout",email:"Email",password:"Password",brandName:"Brand name",save:"Save",resetForm:"Clear",chooseBrand:"Select brand",deleteBrand:"Delete brand",confirmDelete:"Delete this brand?",dataSaved:"Record updated",dataAdded:"Brand added",dataDeleted:"Record deleted",requiredBrand:"Brand required",importToSupabase:"Import data.json to Supabase",exportData:"Download data.json",localOnly:"If logged in, changes are saved to Supabase.",dataCenter:"Data Center",chooseFile:"Choose ODS / Excel / CSV",importFileToSupabase:"Import file to Supabase",fileRows:"rows found",fileReady:"File ready",fileError:"Could not read file",importDone:"Import complete",noFileData:"Choose a file first", importStarted:"Import started...", importNeedLogin:"Please login first", importProgress:"Importing", importError:"Import error",downloaded:"Downloaded",supabaseReady:"Supabase connected",supabaseFallback:"Supabase empty/unavailable; using data.json fallback.",barcodePrompt:"Enter barcode:",barcodeMissing:"No match if barcode data is missing."},
de:{kicker:"V17 Güvenli Bilgilendirme",title:"Ahlak Rehberim",subtitle:"Bewusst konsumieren.",search:"Marke, Firma, Kategorie oder Barcode suchen...",navHome:"Start",navCompanies:"Firmen",navCategories:"Kategorie",navFavorites:"Favorit",navAdmin:"Admin",boycott:"Prüfen / Achtung",notBoycotted:"Alternative / bevorzugbar",review:"Wird geprüft",withAlt:"Mit Alternativen",favorites:"Favoriten",all:"Alle",results:"Ergebnisse",brands:"Marken",companies:"Firmen",categories:"Kategorien",countries:"Länder",country:"Land",category:"Kategorie",parent:"Mutterfirma",barcode:"Barcode",alternative:"Alternative",details:"Details ansehen →",close:"Schließen",source:"Informationsquelle",note:"Hinweis",openSource:"Quelle öffnen",noResult:"Keine Ergebnisse gefunden.",safeInfo:"Diese Marke ist nicht boykottiert.",quickTitle:"Schnellzugriff",admin:"Verwaltung",login:"Anmelden",logout:"Abmelden",email:"E-Mail",password:"Passwort",brandName:"Markenname",save:"Speichern",resetForm:"Leeren",chooseBrand:"Marke auswählen",deleteBrand:"Marke löschen",confirmDelete:"Diese Marke löschen?",dataSaved:"Eintrag aktualisiert",dataAdded:"Marke hinzugefügt",dataDeleted:"Eintrag gelöscht",requiredBrand:"Marke erforderlich",importToSupabase:"data.json importieren",exportData:"data.json herunterladen",localOnly:"Wenn angemeldet, werden Änderungen in Supabase gespeichert.",dataCenter:"Datenzentrum",chooseFile:"ODS / Excel / CSV wählen",importFileToSupabase:"Datei importieren",fileRows:"Einträge gefunden",fileReady:"Datei bereit",fileError:"Datei konnte nicht gelesen werden",importDone:"Import abgeschlossen",noFileData:"Bitte zuerst Datei wählen", importStarted:"Import gestartet...", importNeedLogin:"Bitte zuerst anmelden", importProgress:"Import läuft", importError:"Importfehler",downloaded:"Heruntergeladen",supabaseReady:"Supabase verbunden",supabaseFallback:"Supabase leer/nicht verfügbar; data.json wird genutzt.",barcodePrompt:"Barcode eingeben:",barcodeMissing:"Keine Übereinstimmung ohne Barcode-Daten."}
};


function legalText(k){
  const langKey = (typeof LANG !== "undefined" ? LANG : (localStorage.getItem("lang") || localStorage.getItem("ahlak_lang") || "tr"));
  const texts = {
    tr: {
      title: "Ahlak Rehberim Bilgilendirme",
      text: "Ahlak Rehberim, kullanıcıların etik tüketim tercihlerini desteklemek amacıyla hazırlanmış bir bilgi rehberidir. İçerikler kamuya açık bilgiler, kullanıcı katkıları ve editoryal değerlendirmeler temel alınarak sunulur. Buradaki bilgiler herhangi bir kişi, marka veya kuruluş hakkında kesin hukuki değerlendirme, suç isnadı ya da doğruluğu garanti edilen olgu beyanı olarak değerlendirilmemelidir. Nihai değerlendirme ve satın alma kararı kullanıcıya aittir. Bilgiler zamanla değişebilir; lütfen bağımsız kaynaklardan da kontrol ediniz.",
      accept: "Okudum ve Devam Ediyorum",
      short: "Bilgi rehberi niteliğindedir; kesin hukuki değerlendirme, suçlama veya doğruluk garantisi içermez.",
      correction: "Hatalı, eksik veya güncel olmayan bilgi görürseniz düzeltme talebi gönderebilir ve kamuya açık kaynak paylaşabilirsiniz."
    },
    de: {
      title: "Hinweis zu Ahlak Rehberim",
      text: "Ahlak Rehberim ist ein Informationsleitfaden, der Nutzerinnen und Nutzer bei ethischen Konsumentscheidungen unterstützen soll. Die Inhalte beruhen auf öffentlich zugänglichen Informationen, Nutzerbeiträgen und redaktionellen Bewertungen. Die Informationen stellen keine endgültige rechtliche Bewertung, keine Beschuldigung und keine Garantie für die Richtigkeit von Tatsachen über Personen, Marken oder Organisationen dar. Die endgültige Bewertung und Kaufentscheidung liegt bei den Nutzerinnen und Nutzern. Informationen können sich ändern; bitte prüfen Sie auch unabhängige Quellen.",
      accept: "Gelesen und fortfahren",
      short: "Informationsleitfaden; keine rechtliche Bewertung, Beschuldigung oder Garantie für Richtigkeit.",
      correction: "Wenn Informationen falsch, unvollständig oder veraltet sind, können Sie eine Korrektur mit öffentlich zugänglicher Quelle vorschlagen."
    },
    en: {
      title: "Ahlak Rehberim Notice",
      text: "Ahlak Rehberim is an information guide intended to support users in making ethical consumption choices. Content is based on publicly available information, user contributions and editorial assessments. The information should not be understood as a definitive legal assessment, accusation, or guaranteed statement of fact about any person, brand or organization. The final assessment and purchasing decision belong to the user. Information may change; please also check independent sources.",
      accept: "I have read and continue",
      short: "Information guide only; no legal judgment, accusation, or guarantee of accuracy.",
      correction: "If information is incorrect, incomplete or outdated, you may submit a correction with a publicly available source."
    }
  };
  const pack = texts[langKey] || texts.tr;
  return pack[k] || texts.tr[k] || "";
}
function legalDisclaimerText(){ return legalText("text"); }
function legalShortText(){ return legalText("short"); }
function correctionPolicyText(){ return legalText("correction"); }

function showLegalNoticeOnce(){
  const key = "ahlak_legal_notice_v20";
  if(localStorage.getItem(key)==="ok") return;
  setTimeout(()=>{
    const box=document.createElement("div");
    box.className="legalOverlay";
    box.innerHTML=`<div class="legalModal"><h2>${esc(legalText("title"))}</h2><p>${esc(legalDisclaimerText())}</p><div class="legalActions"><button id="legalOk">${esc(legalText("accept"))}</button></div></div>`;
    document.body.appendChild(box);
    document.getElementById("legalOk").onclick=()=>{localStorage.setItem(key,"ok");box.remove();};
  },500);
}

function ensureBarcodeSearch(){
  if(document.getElementById("barcodeBox")) return;
  const searchCard=document.querySelector(".search-card")||document.querySelector(".searchBox")||document.querySelector("#search")?.parentElement;
  if(!searchCard) return;
  const box=document.createElement("div");
  box.id="barcodeBox";
  box.className="barcodeBox";
  box.innerHTML=`<input id="barcodeInput" inputmode="numeric" placeholder="Barkod ara / EAN / GTIN"><button id="barcodeFind">📦 Ara</button>`;
  searchCard.insertAdjacentElement("afterend",box);
  document.getElementById("barcodeFind").onclick=()=>{
    const found=findByBarcode(document.getElementById("barcodeInput").value);
    if(found){ openDetail(found.id); }
    else{ alert("Barkod bulunamadı."); }
  };
  document.getElementById("barcodeInput").addEventListener("keydown",e=>{
    if(e.key==="Enter") document.getElementById("barcodeFind").click();
  });
}


/* V29 Smart Product Relations */

/* V30 Compare */

/* V31 QR + Share */


/* V33 Suggestions Supabase Sync */
async function sendSuggestionToSupabase(s){
  const c=getSbConfig();
  if(!c.url||!c.key) throw new Error("Supabase ayarları eksik.");
  const table="suggestions";
  const url=c.url.replace(/\/+$/,"")+"/rest/v1/"+table;
  const payload={
    tur:s.tur,
    marka:s.marka,
    ana_firma:s.anaFirma,
    url:s.url,
    aciklama:s.aciklama,
    durum:"bekliyor",
    created_at:s.tarih||new Date().toISOString()
  };
  const res=await fetch(url,{method:"POST",headers:sbHeaders(c.key),body:JSON.stringify(payload)});
  const text=await res.text();
  if(!res.ok) throw new Error(text||res.statusText);
  return text;
}
async function sendAllSuggestionsToSupabase(){
  const list=getSuggestions();
  if(!list.length){alert("Gönderilecek öneri yok.");return}
  let ok=0,fail=0,msgs=[];
  for(const s of list){
    try{await sendSuggestionToSupabase(s);ok++}catch(e){fail++;msgs.push(e.message)}
  }
  alert(`Gönderildi: ${ok}\nHata: ${fail}${msgs[0]?"\nİlk hata: "+msgs[0]:""}`);
}
function suggestionSyncButtonHtml(){
  return `<button id="sgSendSupabase">Önerileri Supabase'e Gönder</button>`;
}

/* V32 User Suggestions */
function suggestionKey(){return "ahlak_user_suggestions_v32";}
function getSuggestions(){try{return JSON.parse(localStorage.getItem(suggestionKey())||"[]")}catch(e){return []}}
function setSuggestions(list){localStorage.setItem(suggestionKey(),JSON.stringify(list||[]))}
function suggestionFormHtml(prefill={}){
  return `<section class="suggestPanel">
    <h2>📝 Öneri / Düzeltme Gönder</h2>
    <p class="legal-small">Bu form tarayıcıda yerel olarak kaydedilir. Yönetici daha sonra JSON olarak dışa aktarabilir.</p>
    <div class="adminGrid">
      <label>Talep Türü<select id="sgType">
        <option value="marka">Yeni marka önerisi</option>
        <option value="kaynak">Kaynak ekleme</option>
        <option value="alternatif">Alternatif önerisi</option>
        <option value="duzeltme">Düzeltme / itiraz</option>
      </select></label>
      <label>İlgili Marka<input id="sgBrand" value="${esc(prefill.marka||"")}" placeholder="Marka adı"></label>
      <label>Önerilen Ana Firma<input id="sgCompany" value="${esc(prefill.anaFirma||"")}" placeholder="Varsa"></label>
      <label>Kaynak URL<input id="sgUrl" placeholder="https://..."></label>
    </div>
    <label>Açıklama<textarea id="sgNote" placeholder="Kısa ve tarafsız açıklama yazın. Kesin suçlama içeren ifade kullanmayın."></textarea></label>
    <div class="adminActions">
      <button id="sgSave">Öneriyi Kaydet</button>
      <button id="sgExport">Önerileri JSON İndir</button>${suggestionSyncButtonHtml()}
      <button id="sgClear">Önerileri Temizle</button>
    </div>
    <h3>Kaydedilen Öneriler</h3>
    <div id="sgList"></div>
  </section>`;
}
function readSuggestion(){
  return {
    id:Date.now(),
    tur:document.getElementById("sgType").value,
    marka:document.getElementById("sgBrand").value.trim(),
    anaFirma:document.getElementById("sgCompany").value.trim(),
    url:document.getElementById("sgUrl").value.trim(),
    aciklama:document.getElementById("sgNote").value.trim(),
    tarih:new Date().toISOString()
  };
}
function renderSuggestionList(){
  const box=document.getElementById("sgList");
  if(!box) return;
  const list=getSuggestions();
  box.innerHTML=list.length?list.map((s,i)=>`<div class="suggestItem">
    <div><b>${esc(s.tur)} · ${esc(s.marka||"-")}</b><small>${esc(s.tarih||"")}</small><p>${esc(s.aciklama||"")}</p>${s.url?`<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.url)}</a>`:""}</div>
    <button data-del-suggestion="${i}">Sil</button>
  </div>`).join(""):`<div class="sourceEmpty">Henüz öneri yok.</div>`;
}
function setupSuggestionForm(){
  const save=document.getElementById("sgSave");
  if(!save) return;
  save.onclick=()=>{
    const s=readSuggestion();
    if(!s.marka && !s.aciklama){alert("Marka veya açıklama gerekli.");return}
    const list=getSuggestions(); list.push(s); setSuggestions(list); renderSuggestionList();
    alert("Öneri kaydedildi.");
  };
  document.getElementById("sgExport").onclick=()=>downloadText("ahlak_rehberim_oneriler.json",JSON.stringify(getSuggestions(),null,2));
  document.getElementById("sgClear").onclick=()=>{if(confirm("Tüm öneriler silinsin mi?")){setSuggestions([]);renderSuggestionList()}}; const sgSend=document.getElementById("sgSendSupabase"); if(sgSend) sgSend.onclick=()=>sendAllSuggestionsToSupabase();
  renderSuggestionList();
}
function renderSuggestions(){
  renderStats();
  sectionTitle.innerHTML=`<h2>📝 Öneri / Düzeltme</h2><span>${getSuggestions().length}</span>`;
  results.innerHTML=suggestionFormHtml();
  setupSuggestionForm();
}
function suggestionButton(x){
  return `<button class="suggestBtn" data-suggest-brand="${esc(x.id)}">📝 Düzeltme / Kaynak Öner</button>`;
}

function productUrl(x){
  const base=location.origin+location.pathname;
  return `${base}?marka=${encodeURIComponent(x.marka||"")}`;
}
function qrUrlFor(text){
  return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(text)}`;
}
function renderShareBox(x){
  const url=productUrl(x);
  return `<section class="shareBox">
    <h3>🔗 Paylaş</h3>
    <div class="qrWrap"><img src="${qrUrlFor(url)}" alt="QR ${esc(x.marka)}" loading="lazy"></div>
    <input class="shareInput" value="${esc(url)}" readonly>
    <div class="shareActions">
      <button data-copy-url="${esc(url)}">Linki Kopyala</button>
      <button data-native-share="${esc(x.id)}">Paylaş</button>
    </div>
  </section>`;
}
function openBrandFromUrl(){
  const p=new URLSearchParams(location.search);
  const m=p.get("marka");
  if(!m||!DATA.length) return;
  const found=DATA.find(x=>norm(x.marka)===norm(m))||DATA.find(x=>norm(x.marka).includes(norm(m)));
  if(found) setTimeout(()=>openDetail(found.id),400);
}

function compareKey(){return "ahlak_compare_v30";}
function getCompareIds(){try{return JSON.parse(localStorage.getItem(compareKey())||"[]")}catch(e){return []}}
function setCompareIds(ids){localStorage.setItem(compareKey(),JSON.stringify([...new Set(ids)].slice(0,2)))}
function addCompare(id){
  let ids=getCompareIds();
  id=Number(id);
  if(!ids.includes(id)) ids.push(id);
  if(ids.length>2) ids=ids.slice(ids.length-2);
  setCompareIds(ids);
  alert("Karşılaştırmaya eklendi.");
}
function clearCompare(){setCompareIds([]);renderCompare()}
function compareButton(x){return `<button class="compareAdd" data-compare-add="${esc(x.id)}">⚖️ Karşılaştır</button>`}
function compareCell(x,field){
  if(!x) return "-";
  if(field==="durum") return statusLabel(x.status);
  if(field==="kaynak") return typeof sourceCount==="function"?sourceCount(x):0;
  if(field==="alternatif") return typeof altCount==="function"?altCount(x):0;
  if(field==="barkod") return typeof barcodeCount==="function"?barcodeCount(x):0;
  return esc(x[field]||"-");
}
function renderCompare(){
  renderStats();
  const ids=getCompareIds();
  const items=ids.map(id=>DATA.find(x=>Number(x.id)===Number(id))).filter(Boolean);
  sectionTitle.innerHTML=`<h2>⚖️ Karşılaştırma</h2><span>${items.length}/2</span>`;
  const selector=`<div class="compareSearch">
    <input id="compareSearchInput" placeholder="Karşılaştırmaya marka ekle...">
    <div id="compareSearchResults"></div>
  </div>`;
  if(items.length<2){
    results.innerHTML=selector+`<div class="sourceEmpty">Karşılaştırma için iki marka seç. Marka detayından “Karşılaştır” butonuna basabilir veya yukarıdan arayabilirsin.</div>${renderCompareCards(items)}`;
  }else{
    results.innerHTML=selector+renderCompareTable(items)+`<div class="adminActions"><button onclick="clearCompare()">Karşılaştırmayı Temizle</button></div>`;
  }
  setupCompareSearch();
}
function renderCompareCards(items){
  if(!items.length) return "";
  return `<div class="miniGrid">${items.map(miniBrandButton).join("")}</div>`;
}
function renderCompareTable(items){
  const [a,b]=items;
  const rows=[
    ["Marka","marka"],
    ["Ana Firma","anaFirma"],
    ["Kategori","kategori"],
    ["Ülke","ulke"],
    ["Durum","durum"],
    ["Kaynak Sayısı","kaynak"],
    ["Alternatif Sayısı","alternatif"],
    ["Barkod Sayısı","barkod"],
    ["Son Güncelleme","sonGuncelleme"]
  ];
  return `<div class="compareTable">
    <div class="compareHead"><div>Özellik</div><div>${esc(a.marka)}</div><div>${esc(b.marka)}</div></div>
    ${rows.map(([label,field])=>`<div class="compareRow"><div>${label}</div><div>${compareCell(a,field)}</div><div>${compareCell(b,field)}</div></div>`).join("")}
  </div>`;
}
function setupCompareSearch(){
  const input=document.getElementById("compareSearchInput");
  const box=document.getElementById("compareSearchResults");
  if(!input||!box) return;
  input.oninput=()=>{
    const q=norm(input.value);
    if(!q){box.innerHTML="";return}
    const found=DATA.filter(x=>x.hay.includes(q)).slice(0,8);
    box.innerHTML=found.map(x=>`<button class="compareResult" data-compare-add="${esc(x.id)}"><b>${esc(x.marka)}</b><small>${esc(x.anaFirma||"")} · ${statusLabel(x.status)}</small></button>`).join("");
  };
}

function sameCompanyBrands(x){
  if(!x || !x.anaFirma) return [];
  return DATA.filter(y=>y.id!==x.id && y.anaFirma && y.anaFirma===x.anaFirma).slice(0,24);
}
function sameCategoryBrands(x){
  if(!x || !x.kategori) return [];
  return DATA.filter(y=>y.id!==x.id && y.kategori && y.kategori===x.kategori).slice(0,24);
}
function miniBrandButton(y){
  return `<button class="miniBrand" data-id="${esc(y.id)}">
    <b>${esc(y.marka)}</b>
    <small>${statusLabel(y.status)}${y.ulke?` · ${esc(y.ulke)}`:""}</small>
  </button>`;
}
function renderRelatedBrands(x){
  const company=sameCompanyBrands(x);
  const category=sameCategoryBrands(x);
  return `<section class="relationBox">
    <h3>🏢 Aynı Ana Firmaya Ait Markalar</h3>
    ${company.length?`<div class="miniGrid">${company.map(miniBrandButton).join("")}</div>`:`<div class="relationEmpty">Aynı ana firmaya ait başka marka bulunamadı.</div>`}
    <h3>📂 Aynı Kategorideki Diğer Kayıtlar</h3>
    ${category.length?`<div class="miniGrid">${category.map(miniBrandButton).join("")}</div>`:`<div class="relationEmpty">Aynı kategoride başka kayıt bulunamadı.</div>`}
  </section>`;
}
function productTrustSummary(x){
  const sources=typeof sourceCount==="function"?sourceCount(x):0;
  const alts=typeof altCount==="function"?altCount(x):0;
  const bcs=typeof barcodeCount==="function"?barcodeCount(x):0;
  return `<div class="trustGrid">
    <div><small>📚 Kaynak</small><b>${sources}</b></div>
    <div><small>⭐ Alternatif</small><b>${alts}</b></div>
    <div><small>📦 Barkod</small><b>${bcs}</b></div>
    <div><small>🗓️ Güncelleme</small><b>${esc(x.sonGuncelleme||"-")}</b></div>
  </div>`;
}

function renderLegalFooter(){
  return `<div class="legalFooter"><b>Bilgilendirme:</b> ${esc(legalShortText())}<br>${esc(correctionPolicyText())}<br><a href="hukuki-bilgilendirme.html">Hukuki Bilgilendirme</a> · <a href="kaynak-politikasi.html">Kaynak Politikası</a> · <a href="duzeltme-politikasi.html">Düzeltme Politikası</a></div>`;
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




function parseBarcodes(x){
  if(Array.isArray(x.barkodlar)) return x.barkodlar.filter(b=>b && (b.kod||b.code));
  const raw=Array.isArray(x.barkod)?x.barkod:String(x.barkod||"").split(/[;\n, ]+/);
  return raw.map(v=>String(v).trim()).filter(v=>/^\d{6,14}$/.test(v)).map(v=>({kod:v,tur:"EAN/GTIN",not:""}));
}
function barcodeCount(x){return parseBarcodes(x).length}
function barcodeStatusLabel(x){
  const n=barcodeCount(x);
  if(n>0) return `📦 ${n} Barkod`;
  return "📦 Barkod bekleniyor";
}
function renderBarcodesList(x){
  const list=parseBarcodes(x);
  if(!list.length){
    return `<div class="barcodeEmpty">Bu kayıt için henüz barkod eklenmemiştir.</div>`;
  }
  return `<div class="barcodeList">${list.map(b=>`
    <article class="barcodeItem">
      <b>📦 ${esc(b.kod||b.code)}</b>
      <small>${esc(b.tur||"EAN/GTIN")}</small>
      ${b.not?`<p>${esc(b.not)}</p>`:""}
    </article>`).join("")}</div>`;
}
function findByBarcode(code){
  const clean=String(code||"").replace(/\D+/g,"");
  if(!clean) return null;
  return DATA.find(x=>parseBarcodes(x).some(b=>String(b.kod||b.code)===clean));
}

function parseAlternatives(x){
  if(Array.isArray(x.alternatifler)) return x.alternatifler.filter(a=>a && (a.marka||a.name));
  const raw=String(x.alternatif||"").split(/[;\n,•]+/).map(v=>v.trim()).filter(Boolean);
  return raw.map(v=>({marka:v,kategori:x.kategori||"",ulke:"",not:""}));
}
function altCount(x){return parseAlternatives(x).length}
function altStatusLabel(x){
  const n=altCount(x);
  if(n>0) return `⭐ ${n} Alternatif`;
  return "⭐ Alternatif önerisi bekleniyor";
}
function renderAlternativesList(x){
  const list=parseAlternatives(x);
  if(!list.length){
    return `<div class="altEmpty">Bu kayıt için henüz alternatif önerisi eklenmemiştir. Aynı kategoride tercih edilebilir alternatif biliyorsanız ekleyebilirsiniz.</div>`;
  }
  return `<div class="altList">${list.map(a=>`
    <article class="altItem">
      <b>⭐ ${esc(a.marka||a.name||"Alternatif")}</b>
      <small>${a.kategori?`📂 ${esc(a.kategori)}`:""}${a.ulke?` · 🌍 ${esc(a.ulke)}`:""}</small>
      ${a.not?`<p>${esc(a.not)}</p>`:""}
    </article>`).join("")}</div>`;
}

function parseSources(x){
  if(Array.isArray(x.kaynaklar)) return x.kaynaklar.filter(s=>s && (s.url||s.baslik));
  const raw=String(x.kaynak||"").split(/[;\n]+/).map(v=>v.trim()).filter(Boolean);
  return raw.map(u=>({baslik:"Bilgi kaynağı",url:u,tur:"Kamuya açık kaynak",tarih:"",not:""}));
}
function sourceCount(x){return parseSources(x).length}
function sourceStatusLabel(x){
  const n=sourceCount(x);
  if(n>0) return `📚 ${n} ${t("source")}`;
  return "📚 Kaynak kontrolü gerekli";
}
function renderSourcesList(x){
  const list=parseSources(x);
  if(!list.length){
    return `<div class="sourceEmpty">Bu kayıt için henüz düzenli kaynak eklenmemiştir. Kamuya açık ve doğrulanabilir kaynak eklenmesi önerilir.</div>`;
  }
  return `<div class="sourceList">${list.map(s=>`
    <article class="sourceItem">
      <div><b>${esc(s.baslik||"Bilgi kaynağı")}</b><small>${esc(s.tur||"Kamuya açık kaynak")}${s.tarih?` · ${esc(s.tarih)}`:""}</small></div>
      ${s.url?`<a href="${esc(s.url)}" target="_blank" rel="noopener">Aç</a>`:""}
      ${s.not?`<p>${esc(s.not)}</p>`:""}
    </article>`).join("")}</div>`;
}

function fallbackBrandImage(name){
  const text = encodeURIComponent((name||"A").trim().slice(0,2).toUpperCase());
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='480' height='300' viewBox='0 0 480 300'%3E%3Crect width='480' height='300' rx='34' fill='%23EEF3DF'/%3E%3Ccircle cx='240' cy='140' r='70' fill='%235F7138' opacity='.16'/%3E%3Ctext x='240' y='162' text-anchor='middle' font-family='Arial,sans-serif' font-size='52' font-weight='800' fill='%235F7138'%3E${text}%3C/text%3E%3Ctext x='240' y='225' text-anchor='middle' font-family='Arial,sans-serif' font-size='20' font-weight='700' fill='%235F7138' opacity='.75'%3EAhlak Rehberim%3C/text%3E%3C/svg%3E`;
}
function safeImageUrl(url,name){
  const u=String(url||"").trim();
  if(!u) return fallbackBrandImage(name);
  if(u.startsWith("http://")||u.startsWith("https://")||u.startsWith("data:image/")||u.startsWith("./")||u.startsWith("/")||u.startsWith("images/")||u.startsWith("assets/")) return u;
  return fallbackBrandImage(name);
}
function imageError(el,name){
  el.onerror=null;
  el.src=fallbackBrandImage(name);
}

function statusLabel(s){return{boykot:`🔴 ${t("boycott")}`,safe:`🟢 ${t("notBoycotted")}`,alternatif:`🔵 ${t("alternative")}`,dikkat:"🟠 Dikkat",inceleme:`⚪ ${t("review")}`}[s]||s}
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
  const imageUrl=get(raw,["image_url","imageUrl","image","logo","resim","gorsel","görsel","Görsel URL","Marka Görseli","Görsel","Logo URL"]);

  let status=rawStatus(raw);
  if(typeof isSafeRecord==="function" && isSafeRecord(raw)) status="safe";

  const hay=norm([marka,anaFirma,anaKategori,altKategori,kategori,ulke,alternatif,kaynak,not,barkod.join(" "),imageUrl,statusLabel(status)].join(" "));
  return {id:raw.id||null,marka,anaFirma,anaKategori,altKategori,kategori,ulke,alternatif,kaynak,kaynaklar:raw.kaynaklar||[],alternatifler:raw.alternatifler||[],alternatifDurumu:raw.alternatifDurumu||"",barkodlar:raw.barkodlar||[],barkodDurumu:raw.barkodDurumu||"",sonGuncelleme:raw.sonGuncelleme||raw.son_guncelleme||"",ozet:raw.ozet||raw.özet||"",kaynakDurumu:raw.kaynakDurumu||"",not,barkod,imageUrl,status,hay};
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
    image_url:x.imageUrl||x.image_url||"", kaynaklar:x.kaynaklar||[], alternatifler:x.alternatifler||[], alternatifDurumu:x.alternatifDurumu||"", barkodlar:x.barkodlar||[], barkodDurumu:x.barkodDurumu||"", sonGuncelleme:x.sonGuncelleme||"", ozet:x.ozet||"", kaynakDurumu:x.kaynakDurumu||""
  };
}


let COMPANY_DB=[];
function companyNorm(s){return String(s||"").toLocaleLowerCase("tr-TR").normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/ı/g,"i").replace(/[^a-z0-9]+/g," ").trim();}
function findCompanyFromDb(brand){
  const b=companyNorm(brand);
  for(const c of COMPANY_DB){
    const aliases=c.brandAliases||[];
    for(const a of aliases){
      const k=companyNorm(a);
      if(k && (b===k || (k.length>=5 && (b.startsWith(k+" ") || b.endsWith(" "+k)))) ) return c;
    }
  }
  return null;
}
function enrichCompanies(list){
  return (list||[]).map(item=>{
    const c=findCompanyFromDb(item.marka||item.Marka||item.name||"");
    if(c){
      item.anaFirma=c.name;
      if(!item.ulke && !item["Ülke"]) item.ulke=c.country||"";
    }
    return item;
  });
}
async function loadCompanyDb(){
  try{
    const r=await fetch(`companies.json?v=${VERSION}`,{cache:"reload"});
    COMPANY_DB=await r.json();
  }catch(e){COMPANY_DB=[]}
}

async function loadSession(){if(!supabaseClient)return;const{data}=await supabaseClient.auth.getSession();adminSession=data.session||null}
async function loadSupabase(){if(!supabaseClient)throw new Error("No Supabase");let all=[],from=0,step=1000;while(true){const{data,error}=await supabaseClient.from("brand_cards").select("*").order("marka").range(from,from+step-1);if(error)throw error;all=all.concat(data||[]);if(!data||data.length<step)break;from+=step}return all}
async function loadFallback(){const r=await fetch(`data.json?v=${VERSION}`,{cache:"reload"});const j=await r.json();return Array.isArray(j)?j:(j.data||[])}
async function init(){applyTheme();applyLang();setupServiceWorker();showLegalNoticeOnce();await loadCompanyDb();await loadDataSmart(loadSession);try{let list=[];try{list=await loadSupabase()}catch(e){list=[]}if(!list.length){list=await loadFallback();toast(t("supabaseFallback"))}else toast(t("supabaseReady"));DATA=enrichCompanies(list).map(normalizeItem).sort((a,b)=>a.marka.localeCompare(b.marka,"tr"));render()}catch(e){results.innerHTML=`<div class="empty">${esc(e.message)}</div>`}}

function counts(){return{total:DATA.length,boykot:DATA.filter(x=>x.status==="boykot").length,safe:DATA.filter(x=>x.status==="safe").length,inceleme:DATA.filter(x=>x.status==="inceleme").length,altli:DATA.filter(hasAlternative).length,fav:favorites.length,firmalar:new Set(DATA.map(x=>x.anaFirma||"-")).size,kategoriler:new Set(DATA.map(x=>x.kategori||"-").filter(Boolean)).size,ulkeler:new Set(DATA.map(x=>x.ulke||"").filter(Boolean)).size}}
function renderStats(){const c=counts();stats.innerHTML=`<button class="stat red" data-stat="boykot"><small>🔴 ${t("boycott")}</small><b>${c.boykot}</b></button><button class="stat safe" data-stat="safe"><small>✅ ${t("notBoycotted")}</small><b>${c.safe}</b></button><button class="stat green" data-stat="altli"><small>⭐ ${t("withAlt")}</small><b>${c.altli}</b></button><button class="stat gray" data-stat="inceleme"><small>⚪ ${t("review")}</small><b>${c.inceleme}</b></button>`}
function renderQuickActions(){const c=counts();quickActions.innerHTML=`<h2>${t("quickTitle")}</h2><div class="quickGrid"><button data-go="companies"><span>🏢</span><b>${t("companies")}</b><small>${c.firmalar}</small></button><button data-go="categories"><span>📂</span><b>${t("categories")}</b><small>${c.kategoriler}</small></button><button data-go="countries"><span>🌍</span><b>${t("countries")||"Ülkeler"}</b><small>${c.ulkeler||0}</small></button><button data-go="alternatives"><span>⭐</span><b>${t("withAlt")}</b><small>${c.altli}</small></button><button data-go="favorites"><span>❤️</span><b>${t("favorites")}</b><small>${c.fav}</small></button><button data-go="suggestions"><span>📝</span><b>Öneri</b><small>+</small></button><button data-go="compare"><span>⚖️</span><b>Karşılaştır</b><small>2</small></button><button data-go="admin"><span>⚙️</span><b>${t("admin")}</b><small>ODS</small></button></div>`}
function renderFilters(){const arr=[["all",t("all")],["boykot",`🔴 ${t("boycott")}`],["safe",`✅ ${t("notBoycotted")}`],["altli",`⭐ ${t("withAlt")}`],["inceleme",`⚪ ${t("review")}`],["fav",`❤️ ${t("favorites")}`]];quickFilters.innerHTML=arr.map(([k,l])=>`<button class="chip ${filter===k?'active':''}" data-filter="${k}">${l}</button>`).join("")}
function filteredList(base=DATA){const q=norm(search.value);return base.filter(x=>(!q||x.hay.includes(q))&&(filter==="all"||(filter==="boykot"&&x.status==="boykot")||(filter==="safe"&&x.status==="safe")||(filter==="altli"&&hasAlternative(x))||(filter==="inceleme"&&x.status==="inceleme")||(filter==="fav"&&isFav(x.marka)))).sort((a,b)=>Number(isFav(b.marka))-Number(isFav(a.marka))||a.marka.localeCompare(b.marka,"tr"))}
function imageHtml(x){return x.imageUrl?`<div class="brandImage"><img src="${esc(x.imageUrl)}" alt="${esc(x.marka)}" loading="lazy" onerror="this.parentElement.classList.add('noImage');this.remove();"></div>`:`<div class="brandImage noImage"><span>🌿</span></div>`}
function altHtml(x){if(x.status==="safe"&&!x.alternatif)return`<div class="altBox"><span>${t("notBoycotted")}</span><b>${t("safeInfo")}</b></div>`;if(!hasAlternative(x))return`<div class="altBox"><span>${t("alternative")}</span><b>-</b></div>`;const tags=String(x.alternatif).split(/[;,•]/).map(v=>v.trim()).filter(Boolean).slice(0,8);return`<div class="altBox"><span>${t("alternative")}</span><div class="tags">${tags.map(v=>`<em>${esc(v)}</em>`).join("")}</div></div>`}
function card(x){return`<article class="card ${x.status}" data-brand="${encodeURIComponent(x.marka)}">${imageHtml(x)}<div class="cardTop"><div><div class="badgeLine"><span class="badge ${x.status}">${statusLabel(x.status)}</span>${hasAlternative(x)?`<span class="badge alternatif">⭐ ${t("withAlt")}</span>`:""}</div><h3>${esc(x.marka)}</h3><div class="company">🏢 ${esc(x.anaFirma||"-")}</div></div><button class="fav" data-fav="${encodeURIComponent(x.marka)}">${isFav(x.marka)?"❤️":"♡"}</button></div><div class="meta"><div class="box"><span>${t("category")}</span><b>${esc(x.kategori||"-")}</b></div>${x.ulke?`<div class="box" style="margin-top:8px"><span>${t("country")||"Ülke"}</span><b>${esc(x.ulke)}</b></div>`:""}</div>${altHtml(x)}<button class="more">${t("details")}</button></article>`}
function titleFor(){if(currentGroup)return currentGroup.title;if(view==="favorites"||filter==="fav")return`❤️ ${t("favorites")}`;if(view==="alternatives"||filter==="altli")return`⭐ ${t("withAlt")}`;return t("all")}
function renderHome(base=DATA){const list=filteredList(base);renderStats();ensureBarcodeSearch();renderQuickActions();renderFilters();sectionTitle.innerHTML=`<h2>${esc(titleFor())}</h2><span>${list.length} ${t("results")}</span>`;results.innerHTML=(list.length?list.slice(0,800).map(card).join(""):`<div class="empty">${t("noResult")}</div>`)+renderLegalFooter()}
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
    render();if(!window.__OPEN_BRAND_DONE__){window.__OPEN_BRAND_DONE__=true;openBrandFromUrl();}
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
async function reload(){const list=await loadSupabase();DATA=enrichCompanies(list).map(normalizeItem).sort((a,b)=>a.marka.localeCompare(b.marka,"tr"))}
function adminOptions(){return DATA.map(x=>x.marka).filter((v,i,a)=>v&&a.indexOf(v)===i).sort((a,b)=>a.localeCompare(b,"tr")).map(n=>`<option value="${esc(n)}">${esc(n)}</option>`).join("")}
function getAdminValues(){const raw=$("adminBarkod")?.value.trim()||"";return{marka:$("adminMarka").value.trim(),anaFirma:$("adminAnaFirma").value.trim(),kategori:$("adminKategori").value.trim(),alternatif:$("adminAlternatif").value.trim(),kaynak:$("adminKaynak").value.trim(),not:$("adminNot").value.trim(),barkod:raw?raw.split(/[;, ]+/).filter(Boolean):[],imageUrl:($("adminImageUrl")?.value||"").trim(),status:$("adminDurum").value}}
function fillAdminForm(name){const x=DATA.find(v=>v.marka===name);if(!x)return;$("adminMarka").value=x.marka||"";$("adminAnaFirma").value=x.anaFirma||"";$("adminKategori").value=x.kategori||"";$("adminAlternatif").value=x.alternatif||"";$("adminKaynak").value=x.kaynak||"";$("adminNot").value=x.not||"";$("adminBarkod").value=Array.isArray(x.barkod)?x.barkod.join(", "):"";$("adminImageUrl").value=x.imageUrl||"";$("adminDurum").value=x.status||"boykot"}
function clearAdminForm(){["adminMarka","adminAnaFirma","adminKategori","adminAlternatif","adminKaynak","adminNot","adminBarkod","adminImageUrl"].forEach(id=>$(id).value="");$("adminDurum").value="boykot"}
async function adminLogin(){const{data,error}=await supabaseClient.auth.signInWithPassword({email:$("adminEmail").value.trim(),password:$("adminPassword").value});if(error){toast(error.message);return}adminSession=data.session;toast(t("supabaseReady"));renderAdmin()}
async function adminLogout(){await supabaseClient.auth.signOut();adminSession=null;view="home";filter="all";search.value="";render()}
function downloadDataJson(){const raw=DATA.map(toLegacy);const blob=new Blob([JSON.stringify(raw,null,2)],{type:"application/json"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="data.json";a.click();URL.revokeObjectURL(url);toast(t("downloaded"))}

/* V26 Admin Panel */
function adminStorageKey(){ return "ahlak_admin_local_v26"; }
function getAdminDrafts(){
  try{return JSON.parse(localStorage.getItem(adminStorageKey())||"[]")}catch(e){return []}
}
function setAdminDrafts(list){
  localStorage.setItem(adminStorageKey(), JSON.stringify(list||[]));
}
function downloadText(filename, text){
  const blob=new Blob([text],{type:"application/json;charset=utf-8"});
  const a=document.createElement("a");
  a.href=URL.createObjectURL(blob);
  a.download=filename;
  a.click();
  setTimeout(()=>URL.revokeObjectURL(a.href),1000);
}
function adminFormHtml(existing={}){
  const srcs=Array.isArray(existing.kaynaklar)?existing.kaynaklar:[];
  const alts=Array.isArray(existing.alternatifler)?existing.alternatifler:[];
  const bcs=Array.isArray(existing.barkodlar)?existing.barkodlar:[];
  return `<section class="adminPanel">
    <h2>⚙️ Yönetim Paneli</h2>
    <p class="legal-small">Bu panel tarayıcıda yerel taslak oluşturur. Supabase bağlantısı kurulana kadar değişiklikleri JSON olarak dışa aktarabilirsiniz.</p>
    <div class="adminGrid">
      <label>Marka<input id="admMarka" value="${esc(existing.marka||"")}"></label>
      <label>Ana Firma<input id="admFirma" value="${esc(existing.anaFirma||"")}"></label>
      <label>Kategori<input id="admKategori" value="${esc(existing.kategori||"")}"></label>
      <label>Ülke<input id="admUlke" value="${esc(existing.ulke||"")}"></label>
      <label>Durum<select id="admDurum">
        <option value="boykot">İncelenmesi Önerilir</option>
        <option value="safe">Tercih Edilebilir</option>
        <option value="inceleme">Bilgi Bekleniyor</option>
        <option value="alternatif">Alternatif</option>
      </select></label>
      <label>Görsel URL<input id="admImage" value="${esc(existing.image_url||existing.imageUrl||"")}"></label>
    </div>
    <label>Bilgi Özeti<textarea id="admOzet">${esc(existing.ozet||"")}</textarea></label>
    <label>Açıklama<textarea id="admNot">${esc(existing.not||"")}</textarea></label>
    <h3>📚 Kaynaklar</h3>
    <textarea id="admKaynaklar" placeholder="Her satıra bir kaynak URL">${esc(srcs.map(s=>s.url||"").filter(Boolean).join("\n") || existing.kaynak || "")}</textarea>
    <h3>⭐ Alternatifler</h3>
    <textarea id="admAlternatifler" placeholder="Her satıra bir alternatif marka">${esc(alts.map(a=>a.marka||a.name||"").filter(Boolean).join("\n") || existing.alternatif || "")}</textarea>
    <h3>📦 Barkodlar</h3>
    <textarea id="admBarkodlar" placeholder="Her satıra bir barkod">${esc(bcs.map(b=>b.kod||b.code||"").filter(Boolean).join("\n") || "")}</textarea>
    <div class="adminActions">
      <button id="admSave">Yerel Taslak Kaydet</button>
      <button id="admExportOne">Bu Kaydı JSON İndir</button>
      <button id="admExportAll">Tüm Veriyi JSON İndir</button>
    </div>
    ${supabasePanelHtml()}${supabaseLiveControlsHtml()}<h3>Yerel Taslaklar</h3>
    <div id="admDrafts"></div>
  </section>`;
}
function readAdminForm(){
  const lines=id=>String(document.getElementById(id)?.value||"").split(/\n+/).map(x=>x.trim()).filter(Boolean);
  const marka=document.getElementById("admMarka").value.trim();
  return {
    marka,
    anaFirma:document.getElementById("admFirma").value.trim(),
    kategori:document.getElementById("admKategori").value.trim(),
    ulke:document.getElementById("admUlke").value.trim(),
    durum:document.getElementById("admDurum").value,
    image_url:document.getElementById("admImage").value.trim(),
    ozet:document.getElementById("admOzet").value.trim(),
    not:document.getElementById("admNot").value.trim(),
    kaynaklar:lines("admKaynaklar").map(u=>({baslik:"Bilgi kaynağı",url:u,tur:"Kamuya açık kaynak",tarih:"",not:""})),
    alternatifler:lines("admAlternatifler").map(a=>({marka:a,kategori:document.getElementById("admKategori").value.trim(),ulke:"",not:""})),
    barkodlar:lines("admBarkodlar").map(b=>({kod:b.replace(/\D+/g,""),tur:"EAN/GTIN",not:""})).filter(b=>b.kod),
    sonGuncelleme:new Date().toISOString().slice(0,10),
    kaynakDurumu:"Kaynak kontrolü gerekli",
    alternatifDurumu:"Alternatif kontrolü gerekli",
    barkodDurumu:"Barkod kontrolü gerekli"
  };
}
function renderAdminDrafts(){
  const box=document.getElementById("admDrafts");
  if(!box) return;
  const drafts=getAdminDrafts();
  box.innerHTML=drafts.length?drafts.map((d,i)=>`<div class="draftItem"><b>${esc(d.marka||"-")}</b><span>${esc(d.durum||"")}</span><button data-load-draft="${i}">Aç</button><button data-del-draft="${i}">Sil</button></div>`).join(""):`<div class="sourceEmpty">Henüz yerel taslak yok.</div>`;
}
function setupAdminPanel(){
  const save=document.getElementById("admSave");
  if(!save) return;
  save.onclick=()=>{
    const item=readAdminForm();
    if(!item.marka){alert("Marka adı gerekli.");return;}
    const drafts=getAdminDrafts();
    const idx=drafts.findIndex(x=>String(x.marka).toLowerCase()===String(item.marka).toLowerCase());
    if(idx>=0) drafts[idx]=item; else drafts.push(item);
    setAdminDrafts(drafts);
    renderAdminDrafts();
    alert("Yerel taslak kaydedildi.");
  };
  document.getElementById("admExportOne").onclick=()=>{
    const item=readAdminForm();
    downloadText(`${(item.marka||"kayit").replace(/[^a-z0-9ğüşöçıİĞÜŞÖÇ]+/gi,"_")}.json`, JSON.stringify(item,null,2));
  };
  document.getElementById("admExportAll").onclick=()=>{
    const merged=[...DATA.map(x=>x.raw||x),...getAdminDrafts()];
    downloadText("ahlak_rehberim_export.json", JSON.stringify(merged,null,2));
  };
  renderAdminDrafts();
  setupSupabasePanel();setupSupabaseLiveControls();
}


/* V28 Supabase Live Read */
function useSupabaseLiveKey(){return "ahlak_use_supabase_live_v28";}
function getUseSupabaseLive(){return localStorage.getItem(useSupabaseLiveKey())==="1";}
function setUseSupabaseLive(v){localStorage.setItem(useSupabaseLiveKey(),v?"1":"0")}
function supabaseRowToLegacy(r){
  return {
    id:r.id||null,
    marka:r.marka||"",
    anaFirma:r.ana_firma||r.anaFirma||"",
    kategori:r.kategori||"",
    ulke:r.ulke||"",
    durum:r.durum||"inceleme",
    image_url:r.image_url||"",
    not:r.notlar||r.not||"",
    ozet:r.ozet||"",
    kaynaklar:Array.isArray(r.kaynaklar)?r.kaynaklar:[],
    alternatifler:Array.isArray(r.alternatifler)?r.alternatifler:[],
    barkodlar:Array.isArray(r.barkodlar)?r.barkodlar:[],
    sonGuncelleme:r.son_guncelleme||r.sonGuncelleme||"",
    kaynakDurumu:r.kaynak_durumu||r.kaynakDurumu||"",
    alternatifDurumu:r.alternatif_durumu||r.alternatifDurumu||"",
    barkodDurumu:r.barkod_durumu||r.barkodDurumu||""
  };
}
async function loadSupabaseBrands(){
  const c=getSbConfig();
  if(!c.url||!c.key||!c.table) throw new Error("Supabase ayarları eksik.");
  const url=sbEndpoint(c.table)+"?select=*&order=marka.asc&limit=5000";
  const res=await fetch(url,{headers:sbHeaders(c.key)});
  const text=await res.text();
  if(!res.ok) throw new Error(text||res.statusText);
  const rows=JSON.parse(text);
  return rows.map(supabaseRowToLegacy);
}
async function loadDataSmart(originalLoader){
  if(getUseSupabaseLive()){
    try{
      const rows=await loadSupabaseBrands();
      if(rows.length){
        DATA=enrichCompanies(rows).map(normalizeItem).sort((a,b)=>a.marka.localeCompare(b.marka,"tr"));
        window.__DATA_SOURCE__="supabase";
        render();
        return;
      }
    }catch(e){
      console.warn("Supabase canlı veri alınamadı, data.json kullanılacak:",e);
      window.__DATA_SOURCE__="data.json fallback";
    }
  }
  return originalLoader();
}
function supabaseLiveControlsHtml(){
  return `<section class="supabasePanel">
    <h3>📡 Canlı Veri Okuma</h3>
    <p class="legal-small">Açık ise uygulama markaları Supabase tablosundan okur. Hata olursa otomatik data.json yedeğine döner.</p>
    <label class="switchLine"><input type="checkbox" id="sbLiveToggle" ${getUseSupabaseLive()?"checked":""}> Supabase canlı veriyi kullan</label>
    <div class="adminActions"><button id="sbLiveReload">Canlı Veriyi Yenile</button></div>
    <div id="sbLiveResult" class="sourceEmpty">Veri kaynağı: ${esc(window.__DATA_SOURCE__||"henüz yüklenmedi")}</div>
  </section>`;
}
function setupSupabaseLiveControls(){
  const tgl=document.getElementById("sbLiveToggle");
  if(!tgl) return;
  tgl.onchange=()=>{setUseSupabaseLive(tgl.checked); document.getElementById("sbLiveResult").textContent="Ayar kaydedildi. Sayfayı yenileyin veya Canlı Veriyi Yenile butonuna basın."};
  document.getElementById("sbLiveReload").onclick=()=>location.reload();
}

/* V27 Supabase Admin Sync */
function sbConfigKey(){return "ahlak_supabase_config_v27";}
function getSbConfig(){try{return JSON.parse(localStorage.getItem(sbConfigKey())||"{}")}catch(e){return {}}}
function setSbConfig(c){localStorage.setItem(sbConfigKey(),JSON.stringify(c||{}))}
function sbHeaders(key){return {"apikey":key,"Authorization":"Bearer "+key,"Content-Type":"application/json","Prefer":"return=representation"}}
function sbEndpoint(table){
  const c=getSbConfig();
  if(!c.url||!table) return "";
  return c.url.replace(/\/+$/,"")+"/rest/v1/"+encodeURIComponent(table);
}
function supabasePanelHtml(){
  const c=getSbConfig();
  return `<section class="supabasePanel">
    <h3>🗄️ Supabase Bağlantısı</h3>
    <p class="legal-small">Bu bilgiler sadece senin tarayıcında localStorage içinde tutulur. Public anon key kullan; service_role key kullanma.</p>
    <div class="adminGrid">
      <label>Supabase URL<input id="sbUrl" value="${esc(c.url||"")}" placeholder="https://...supabase.co"></label>
      <label>Publishable / anon key<input id="sbKey" value="${esc(c.key||"")}" placeholder="sb_publishable... veya anon key"></label>
      <label>Tablo adı<input id="sbTable" value="${esc(c.table||"brands")}" placeholder="brands"></label>
    </div>
    <div class="adminActions">
      <button id="sbSave">Ayarları Kaydet</button>
      <button id="sbTest">Bağlantıyı Test Et</button>
      <button id="sbSendOne">Bu Kaydı Supabase'e Gönder</button>
    </div>
    <div id="sbResult" class="sourceEmpty">Henüz test yapılmadı.</div>
  </section>`;
}
function setupSupabasePanel(){
  const save=document.getElementById("sbSave");
  if(!save) return;
  const msg=(m)=>{const r=document.getElementById("sbResult"); if(r) r.textContent=m;};
  save.onclick=()=>{
    setSbConfig({url:document.getElementById("sbUrl").value.trim(),key:document.getElementById("sbKey").value.trim(),table:document.getElementById("sbTable").value.trim()||"brands"});
    msg("Ayarlar kaydedildi.");
  };
  document.getElementById("sbTest").onclick=async()=>{
    try{
      save.click();
      const c=getSbConfig();
      if(!c.url||!c.key) throw new Error("URL ve key gerekli.");
      const res=await fetch(sbEndpoint(c.table)+"?select=*&limit=1",{headers:sbHeaders(c.key)});
      const text=await res.text();
      if(!res.ok) throw new Error(text||res.statusText);
      msg("Bağlantı başarılı.");
    }catch(e){msg("Hata: "+e.message)}
  };
  document.getElementById("sbSendOne").onclick=async()=>{
    try{
      save.click();
      const c=getSbConfig();
      if(!c.url||!c.key) throw new Error("URL ve key gerekli.");
      const item=readAdminForm();
      if(!item.marka) throw new Error("Marka adı gerekli.");
      const payload={
        marka:item.marka,
        ana_firma:item.anaFirma,
        kategori:item.kategori,
        ulke:item.ulke,
        durum:item.durum,
        image_url:item.image_url,
        notlar:item.not,
        ozet:item.ozet,
        kaynaklar:item.kaynaklar,
        alternatifler:item.alternatifler,
        barkodlar:item.barkodlar,
        son_guncelleme:item.sonGuncelleme
      };
      const res=await fetch(sbEndpoint(c.table),{method:"POST",headers:sbHeaders(c.key),body:JSON.stringify(payload)});
      const text=await res.text();
      if(!res.ok) throw new Error(text||res.statusText);
      msg("Kayıt Supabase'e gönderildi.");
    }catch(e){msg("Hata: "+e.message)}
  };
}

function renderAdminLocal(){
  renderStats();
  sectionTitle.innerHTML=`<h2>⚙️ Yönetim</h2><span>V26</span>`;
  results.innerHTML=adminFormHtml();
  setupAdminPanel();
}

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

function render(){document.querySelectorAll(".bottomNav button").forEach(b=>b.classList.toggle("active",b.dataset.view===view));if(currentGroup)return renderHome(currentGroup.items);if(view==="home")return renderHome();if(view==="alternatives"){filter="altli";return renderHome()}if(view==="favorites"){filter="fav";return renderHome()}if(view==="companies")return renderCompanies();if(view==="categories")return renderCategories();if(view==="countries")return renderCountries();if(view==="suggestions")return renderSuggestions();if(view==="compare")return renderCompare();if(view==="admin")return renderAdminLocal()}
function detail(x){const d=$("detailDialog"),c=$("detailContent");c.innerHTML=`<div class="detailHead"><h2>${esc(x.marka)}</h2><p>${statusLabel(x.status)}</p></div><div class="detailBody">${x.imageUrl?`<div class="detailImage"><img src="${esc(x.imageUrl)}" alt="${esc(x.marka)}"></div>`:""}<div class="detailLine"><span>${t("parent")}</span><b>${esc(x.anaFirma||"-")}</b></div><div class="detailLine"><span>${t("category")}</span><b>${esc(x.kategori||"-")}</b></div><div class="detailLine"><span>${t("country")||"Ülke"}</span><b>${esc(x.ulke||"-")}</b></div><div class="detailLine"><span>${t("barcode")}</span><b>${esc((x.barkod||[]).join(", ")||"-")}</b></div><div class="detailLine"><span>${t("alternative")}</span><b>${esc(x.alternatif||"-")}</b></div><div class="detailLine"><span>${t("note")}</span><b>${esc(x.not||"-")}</b></div><div class="legalDetail">⚖️ ${esc(legalShortText())}<br>📝 ${esc(correctionPolicyText())}</div><div class="detailLine"><span>${t("source")}</span><b>${esc(x.kaynak||"-")}</b></div></div>`;d.showModal()}
function handleBarcodeValue(code){const n=norm(code);const item=DATA.find(x=>Array.isArray(x.barkod)&&x.barkod.some(v=>norm(v)===n));if(item)detail(item);else{search.value=code;render()}}
function applyTheme(){const dark=localStorage.getItem("ahlak_theme")==="dark";document.body.classList.toggle("dark",dark);themeBtn.textContent=dark?"☀️":"🌙"}
function applyLang(){document.documentElement.lang=lang;$("kicker").textContent=t("kicker");$("appTitle").textContent=t("title");$("appSubtitle").textContent=t("subtitle");search.placeholder=t("search");$("closeDialog").textContent=t("close");document.querySelectorAll("[data-i]").forEach(el=>el.textContent=t(el.dataset.i));document.querySelectorAll(".langSwitch button").forEach(b=>b.classList.toggle("active",b.dataset.lang===lang))}
function toast(m){const el=document.createElement("div");el.className="toast";el.textContent=m;document.body.appendChild(el);requestAnimationFrame(()=>el.classList.add("show"));setTimeout(()=>{el.classList.remove("show");setTimeout(()=>el.remove(),300)},2800)}
function setupServiceWorker(){if("serviceWorker"in navigator)navigator.serviceWorker.register(`sw.js?v=${VERSION}`).catch(()=>{})}

search.addEventListener("input",()=>{currentGroup=null;if(view!=="home"){view="home";filter="all"}render()});clearBtn.addEventListener("click",()=>{search.value="";filter="all";currentGroup=null;render()});barcodeBtn.addEventListener("click",()=>{const c=prompt(`${t("barcodePrompt")}\n${t("barcodeMissing")}`);if(c)handleBarcodeValue(c.trim())});quickFilters.addEventListener("click",e=>{const b=e.target.closest("[data-filter]");if(!b)return;filter=b.dataset.filter;view="home";currentGroup=null;render()});quickActions.addEventListener("click",e=>{const b=e.target.closest("[data-go]");if(!b)return;view=b.dataset.go;currentGroup=null;if(view==="home")filter="all";render()});stats.addEventListener("click",e=>{const b=e.target.closest("[data-stat]");if(!b)return;filter=b.dataset.stat;view="home";currentGroup=null;render()});results.addEventListener("click",e=>{const f=e.target.closest("[data-fav]");if(f){e.stopPropagation();toggleFav(decodeURIComponent(f.dataset.fav));return}const g=e.target.closest("[data-company]");if(g){const n=decodeURIComponent(g.dataset.company);currentGroup={title:`🏢 ${n}`,items:DATA.filter(x=>x.anaFirma===n)};view="home";search.value="";filter="all";render();return}const cat=e.target.closest("[data-category]");if(cat){const n=decodeURIComponent(cat.dataset.category);currentGroup={title:`${catIcon(n)} ${n}`,items:DATA.filter(x=>x.kategori===n)};view="home";search.value="";filter="all";render();return}const country=e.target.closest("[data-country]");if(country){const n=decodeURIComponent(country.dataset.country);currentGroup={title:`🌍 ${n}`,items:DATA.filter(x=>x.ulke===n)};view="home";search.value="";filter="all";render();return}const c=e.target.closest("[data-brand]");if(c){const n=decodeURIComponent(c.dataset.brand);const item=DATA.find(x=>x.marka===n);if(item)detail(item)}});document.querySelectorAll(".bottomNav button").forEach(b=>b.addEventListener("click",()=>{view=b.dataset.view;currentGroup=null;if(view==="home")filter="all";render()}));document.querySelectorAll(".langSwitch button").forEach(b=>b.addEventListener("click",()=>{lang=b.dataset.lang;localStorage.setItem("boykot_lang",lang);applyLang();render()}));themeBtn.addEventListener("click",()=>{localStorage.setItem("ahlak_theme",document.body.classList.contains("dark")?"light":"dark");applyTheme()});$("closeDialog").addEventListener("click",()=>$("detailDialog").close());
window.adminLogin=adminLogin;window.adminLogout=adminLogout;window.importToSupabase=importToSupabase;window.importSpreadsheetToSupabase=importSpreadsheetToSupabase;window.saveAdminBrand=saveAdminBrand;window.deleteAdminBrand=deleteAdminBrand;window.clearAdminForm=clearAdminForm;window.downloadDataJson=downloadDataJson;
init();