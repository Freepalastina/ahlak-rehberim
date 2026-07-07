const VERSION="20260707-v50-language-fixed";

const I18N={
  tr:{
    title:"Etik tüketim rehberi",
    subtitle:"Marka, ana firma, kategori, alternatif ve kaynak bilgilerini inceleyin.",
    refresh:"Veriyi Yenile",
    clear:"Temizle",
    searchPlaceholder:"Marka, ana firma, kategori veya barkod ara...",
    review:"İncelenmesi önerilir",
    preferred:"Tercih edilebilir",
    alternative:"Alternatifli kayıt",
    sourced:"Kaynaklı kayıt",
    control:"Kontrol gerekli",
    allFilter:"Filtre / tümü",
    categoryAll:"Kategori / tümü",
    companyAll:"Ana firma / tümü",
    countryAll:"Ülke / tümü",
    detail:"Detay",
    alternatives:"Alternatifler",
    sources:"Kaynaklar",
    barcodes:"Barkodlar",
    info:"Bilgilendirme",
    sourceCheck:"Kaynak kontrolü gerekli.",
    altEmpty:"Alternatif önerisi henüz eklenmemiş.",
    barcodeScan:"Barkod Tara"
  },
  de:{
    title:"Ethischer Einkaufsratgeber",
    subtitle:"Prüfe Marke, Mutterfirma, Kategorie, Alternativen und Quellen.",
    refresh:"Daten aktualisieren",
    clear:"Löschen",
    searchPlaceholder:"Marke, Mutterfirma, Kategorie oder Barcode suchen...",
    review:"Zur Prüfung empfohlen",
    preferred:"Bevorzugbar",
    alternative:"Mit Alternativen",
    sourced:"Mit Quellen",
    control:"Prüfung erforderlich",
    allFilter:"Filter / alle",
    categoryAll:"Kategorie / alle",
    companyAll:"Mutterfirma / alle",
    countryAll:"Land / alle",
    detail:"Details",
    alternatives:"Alternativen",
    sources:"Quellen",
    barcodes:"Barcodes",
    info:"Hinweis",
    sourceCheck:"Quellenprüfung erforderlich.",
    altEmpty:"Noch keine Alternative eingetragen.",
    barcodeScan:"Barcode scannen"
  },
  en:{
    title:"Ethical consumption guide",
    subtitle:"Review brands, parent companies, categories, alternatives and sources.",
    refresh:"Refresh data",
    clear:"Clear",
    searchPlaceholder:"Search brand, parent company, category or barcode...",
    review:"Recommended for review",
    preferred:"Preferred",
    alternative:"With alternatives",
    sourced:"With sources",
    control:"Check required",
    allFilter:"Filter / all",
    categoryAll:"Category / all",
    companyAll:"Parent company / all",
    countryAll:"Country / all",
    detail:"Details",
    alternatives:"Alternatives",
    sources:"Sources",
    barcodes:"Barcodes",
    info:"Notice",
    sourceCheck:"Source check required.",
    altEmpty:"No alternative suggestion added yet.",
    barcodeScan:"Scan barcode"
  },
  ar:{
    title:"دليل الاستهلاك الأخلاقي",
    subtitle:"راجع العلامات التجارية والشركات والفئات والبدائل والمصادر.",
    refresh:"تحديث البيانات",
    clear:"مسح",
    searchPlaceholder:"ابحث عن علامة تجارية أو شركة أو فئة أو باركود...",
    review:"يوصى بمراجعته",
    preferred:"مفضل",
    alternative:"له بدائل",
    sourced:"له مصادر",
    control:"يتطلب التحقق",
    allFilter:"التصفية / الكل",
    categoryAll:"الفئة / الكل",
    companyAll:"الشركة / الكل",
    countryAll:"الدولة / الكل",
    detail:"التفاصيل",
    alternatives:"البدائل",
    sources:"المصادر",
    barcodes:"الباركود",
    info:"تنبيه",
    sourceCheck:"يلزم التحقق من المصدر.",
    altEmpty:"لم تتم إضافة بديل بعد.",
    barcodeScan:"مسح الباركود"
  }
};
let LANG=localStorage.getItem("ahlak_lang")||"tr";
function tt(k){return (I18N[LANG]&&I18N[LANG][k])||I18N.tr[k]||k}
function applyLanguage(){
  document.documentElement.lang=LANG;
  document.documentElement.dir=LANG==="ar"?"rtl":"ltr";
  const sel=document.getElementById("langSelect");
  if(sel) sel.value=LANG;
  document.querySelectorAll("[data-i18n]").forEach(el=>{el.textContent=tt(el.dataset.i18n)});
  document.querySelectorAll("[data-i18n-placeholder]").forEach(el=>{el.placeholder=tt(el.dataset.i18nPlaceholder)});
  const statusFilter=document.getElementById("statusFilter");
  if(statusFilter){
    const opts=statusFilter.options;
    if(opts[0]) opts[0].textContent=tt("allFilter");
    if(opts[1]) opts[1].textContent=tt("review");
    if(opts[2]) opts[2].textContent=tt("preferred");
    if(opts[3]) opts[3].textContent=tt("alternative");
    if(opts[4]) opts[4].textContent=tt("sourced");
    if(opts[5]) opts[5].textContent=tt("control");
  }
  const cat=document.getElementById("categoryFilter"); if(cat&&cat.options[0]) cat.options[0].textContent=tt("categoryAll");
  const comp=document.getElementById("companyFilter"); if(comp&&comp.options[0]) comp.options[0].textContent=tt("companyAll");
  const country=document.getElementById("countryFilter"); if(country&&country.options[0]) country.options[0].textContent=tt("countryAll");
  const barcode=document.getElementById("barcodeBtn"); if(barcode) barcode.textContent="📷 "+tt("barcodeScan");
}
document.addEventListener("change",e=>{
  if(e.target&&e.target.id==="langSelect"){
    LANG=e.target.value;
    localStorage.setItem("ahlak_lang",LANG);
    applyLanguage();
    render();
  }
});

let DATA=[];
let FILTERED=[];
const $=s=>document.querySelector(s);
const esc=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
const norm=s=>String(s??"").toLocaleLowerCase("tr").normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/ı/g,"i");

function statusLabel(x){
  if(x==="preferred") return "✅ "+tt("preferred");
  if(x==="control") return "⚪ "+tt("control");
  if(x==="alternative") return "⭐ "+tt("alternative");
  return "🔴 "+tt("review");
}
function normalizeItem(x,i){
  const alts=Array.isArray(x.alternatifler)?x.alternatifler:[];
  const srcs=Array.isArray(x.kaynaklar)?x.kaynaklar:[];
  const bcs=Array.isArray(x.barkodlar)?x.barkodlar:[];
  const status=x.status==="preferred"?"preferred":"review";
  return {
    id:i+1,
    marka:x.marka||x.name||"",
    anaFirma:x.anaFirma||x.companyName||"",
    kategori:x.kategori||x.categoryName||"",
    altKategori:x.altKategori||x.subcategoryName||"",
    ulke:x.ulke||x.country||"",
    status,
    statusLabel:x.statusLabel||"İncelenmesi önerilir",
    kontrolGerekli:!!x.kontrolGerekli,
    kontrolNotu:x.kontrolNotu||"",
    alternatifler:alts,
    kaynaklar:srcs,
    barkodlar:bcs,
    image_url:x.image_url||x.imageUrl||x.productImage||x.logoUrl||"",
    sonGuncelleme:x.sonGuncelleme||x.updatedAt||"",
    not:x.not||x.note||"",
    hay:norm([x.marka,x.name,x.anaFirma,x.companyName,x.kategori,x.altKategori,x.ulke,alts.map(a=>a.marka||a.name||a.alternatifMarka).join(" "),bcs.map(b=>b.kod||b.code).join(" ")].join(" "))
  };
}
async function loadData(){
  const res=await fetch("data/data.json?v="+VERSION);
  const raw=await res.json();
  DATA=raw.map(normalizeItem).filter(x=>x.marka).sort((a,b)=>a.marka.localeCompare(b.marka,"tr"));
  FILTERED=DATA;
  fillFilters();
  render();
  showLegalNoticeIfNeeded();
}
function unique(arr){return [...new Set(arr.filter(Boolean))].sort((a,b)=>a.localeCompare(b,"tr"))}
function fillSelect(sel,values){
  const first=sel.options[0].outerHTML;
  sel.innerHTML=first+values.map(v=>`<option value="${esc(v)}">${esc(v)}</option>`).join("");
}
function fillFilters(){
  fillSelect($("#categoryFilter"),unique(DATA.map(x=>x.kategori)));
  fillSelect($("#companyFilter"),unique(DATA.map(x=>x.anaFirma)).slice(0,700));
  fillSelect($("#countryFilter"),unique(DATA.map(x=>x.ulke)));
}
function counts(){
  return {
    total:DATA.length,
    review:DATA.filter(x=>x.status==="review").length,
    preferred:DATA.filter(x=>x.status==="preferred").length,
    alternative:DATA.filter(x=>x.alternatifler.length>0).length,
    sourced:DATA.filter(x=>x.kaynaklar.length>0).length,
    control:DATA.filter(x=>x.kontrolGerekli||!x.anaFirma||!x.kaynaklar.length).length
  };
}
function renderStats(){
  const c=counts();
  $("#stats").innerHTML=`
    <article class="stat review"><span>🔴 ${tt("review")}</span><b>${c.review}</b></article>
    <article class="stat preferred"><span>✅ ${tt("preferred")}</span><b>${c.preferred}</b></article>
    <article class="stat"><span>⭐ ${tt("alternative")}</span><b>${c.alternative}</b></article>
    <article class="stat"><span>📚 ${tt("sourced")}</span><b>${c.sourced}</b></article>`;
}
function currentFilters(){
  return {
    q:norm($("#searchInput").value),
    cat:$("#categoryFilter").value,
    comp:$("#companyFilter").value,
    country:$("#countryFilter").value,
    status:$("#statusFilter").value
  };
}
function applyFilters(){
  const f=currentFilters();
  FILTERED=DATA.filter(x=>{
    if(f.q && !x.hay.includes(f.q)) return false;
    if(f.cat && x.kategori!==f.cat) return false;
    if(f.comp && x.anaFirma!==f.comp) return false;
    if(f.country && x.ulke!==f.country) return false;
    if(f.status==="review" && x.status!=="review") return false;
    if(f.status==="preferred" && x.status!=="preferred") return false;
    if(f.status==="alternative" && !x.alternatifler.length) return false;
    if(f.status==="sourced" && !x.kaynaklar.length) return false;
    if(f.status==="control" && !(x.kontrolGerekli||!x.anaFirma||!x.kaynaklar.length)) return false;
    return true;
  });
}
function render(){
  renderStats();
  applyFilters();
  $("#resultCount").textContent=`${FILTERED.length} kayıt`;
  const list=FILTERED.slice(0,500);
  $("#results").innerHTML=list.length?list.map(cardHtml).join(""):`<div class="empty">Sonuç bulunamadı.</div>`;
}
function cardHtml(x){
  const control=x.kontrolGerekli||!x.anaFirma||!x.kaynaklar.length;
  return `<article class="card">
    <span class="badge ${x.status}">${statusLabel(x.status)}</span>
    <h3>${esc(x.marka)}</h3>
    <div class="meta">🏢 ${esc(x.anaFirma||"Ana firma kontrol gerekli")}</div>
    <div class="meta">📂 ${esc(x.kategori||"-")}${x.altKategori?` · ${esc(x.altKategori)}`:""}</div>
    <div class="pillrow">
      <span class="pill">⭐ ${x.alternatifler.length}</span>
      <span class="pill">📚 ${x.kaynaklar.length}</span>
      <span class="pill">📦 ${x.barkodlar.length}</span>
      ${control?`<span class="pill">⚪ Kontrol</span>`:""}
    </div>
    <button data-open="${x.id}">${tt("detail")}</button>
  </article>`;
}
function detailHtml(x){
  const control=x.kontrolGerekli||!x.anaFirma||!x.kaynaklar.length;
  return `<div class="detail">
    <span class="badge ${x.status}">${statusLabel(x.status)}</span>
    <h2>${esc(x.marka)}</h2>
    <p class="meta">${esc(x.not||"Bu kayıt etik inceleme listesinde yer aldığı için incelenmesi önerilir.")}</p>
    <div class="detailGrid">
      <div class="infoBox"><small>Ana firma</small><b>${esc(x.anaFirma||"Kontrol gerekli")}</b></div>
      <div class="infoBox"><small>Kategori</small><b>${esc(x.kategori||"-")}</b></div>
      <div class="infoBox"><small>Alt kategori</small><b>${esc(x.altKategori||"-")}</b></div>
      <div class="infoBox"><small>Son güncelleme</small><b>${esc(x.sonGuncelleme||"-")}</b></div>
    </div>
    ${control?`<h3>⚪ Bilgi/kaynak kontrolü</h3><div class="listItem">${esc(x.kontrolNotu||"Bu kayıtta ana firma, kaynak veya lisans bilgisi ayrıca kontrol edilmelidir.")}</div>`:""}
    <h3>⭐ ${tt("alternatives")}</h3>
    <div class="list">${x.alternatifler.length?x.alternatifler.map(a=>`<div class="listItem"><b>${esc(a.marka||a.name||a.alternatifMarka||a)}</b><br><span class="meta">${esc(a.kategori||x.altKategori||"")}</span></div>`).join(""):`<div class="listItem">${tt("altEmpty")}</div>`}</div>
    <h3>📚 ${tt("sources")}</h3>
    <div class="list">${x.kaynaklar.length?x.kaynaklar.map(s=>`<div class="listItem"><b>${esc(s.baslik||s.title||"Bilgi kaynağı")}</b><br><a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.url)}</a><p class="meta">${esc(s.not||"")}</p></div>`).join(""):`<div class="listItem">${tt("sourceCheck")}</div>`}</div>
    <h3>ℹ️ ${tt("info")}</h3><div class="listItem">Bu kayıt kamuya açık kaynaklar ve uygulama veri tabanı üzerinden hazırlanmıştır. Bilgiler zaman içinde değişebilir. Güncel durumu doğrulamak için ilgili kaynakları inceleyiniz.</div>
    <h3>📦 ${tt("barcodes")}</h3>
    <div class="pillrow">${x.barkodlar.length?x.barkodlar.map(b=>`<span class="pill">${esc(b.kod||b.code||b)}</span>`).join(""):`<span class="pill">Barkod eklenmemiş</span>`}</div>
  </div>`;
}
function openDetail(id){
  const x=DATA.find(v=>v.id==id);
  if(!x) return;
  $("#detailBody").innerHTML=detailHtml(x);
  $("#detailDialog").showModal();
}
function setQuick(v){
  $("#statusFilter").value=v;
  render();
}
function clearFilters(){
  $("#searchInput").value="";
  $("#categoryFilter").value="";
  $("#companyFilter").value="";
  $("#countryFilter").value="";
  $("#statusFilter").value="";
  render();
}
document.addEventListener("click",e=>{
  const open=e.target.closest("[data-open]");
  if(open) return openDetail(open.dataset.open);
  const q=e.target.closest("[data-quick]");
  if(q) return setQuick(q.dataset.quick);
});
["searchInput","categoryFilter","companyFilter","countryFilter","statusFilter"].forEach(id=>{
  document.addEventListener("input",e=>{if(e.target.id===id) render()});
  document.addEventListener("change",e=>{if(e.target.id===id) render()});
});
$("#closeDialog").onclick=()=>$("#detailDialog").close();
$("#clearBtn").onclick=clearFilters;
$("#refreshBtn").onclick=()=>location.reload();
$("#installBtn").onclick=installApp;
loadData().catch(err=>{
  console.error(err);
  $("#results").innerHTML=`<div class="empty">Veri yüklenemedi: ${esc(err.message)}</div>`;
});

let deferredInstallPrompt=null;
window.addEventListener("beforeinstallprompt",e=>{
  e.preventDefault();
  deferredInstallPrompt=e;
  const btn=document.getElementById("installBtn");
  if(btn){btn.hidden=false;btn.textContent="📲 Uygulamayı Yükle";}
});
window.addEventListener("appinstalled",()=>{
  deferredInstallPrompt=null;
  const btn=document.getElementById("installBtn");
  if(btn){btn.textContent="✅ Uygulama Yüklendi";btn.disabled=true;}
});
async function installApp(){
  const isIOS=/iphone|ipad|ipod/i.test(navigator.userAgent);
  const isStandalone=window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone;
  if(isStandalone){
    alert("Uygulama zaten yüklü görünüyor.");
    return;
  }
  if(deferredInstallPrompt){
    deferredInstallPrompt.prompt();
    await deferredInstallPrompt.userChoice;
    deferredInstallPrompt=null;
    return;
  }
  const help=document.getElementById("installHelp");
  if(help && help.showModal){
    help.showModal();
    return;
  }
  if(isIOS){
    alert("iPhone için Safari ile açın: Paylaş > Ana Ekrana Ekle.");
  }else{
    alert("Android Chrome: ⋮ menüsü > Ana ekrana ekle / Uygulamayı yükle.");
  }
}
if("serviceWorker" in navigator){
  window.addEventListener("load",()=>navigator.serviceWorker.register("sw.js").catch(()=>{}));
}

document.addEventListener("click",e=>{
  if(e.target && e.target.id==="closeInstallHelp"){
    const d=document.getElementById("installHelp");
    if(d) d.close();
  }
});


const LEGAL_ACCEPT_KEY="ahlak_rehberim_legal_notice_v1";
function showLegalNoticeIfNeeded(){
  if(localStorage.getItem(LEGAL_ACCEPT_KEY)==="accepted") return;
  const d=document.getElementById("legalNotice");
  if(d && d.showModal) d.showModal();
}
function acceptLegalNotice(){
  localStorage.setItem(LEGAL_ACCEPT_KEY,"accepted");
  const d=document.getElementById("legalNotice");
  if(d) d.close();
}
function exitApp(){
  document.body.innerHTML=`<main class="wrap"><section class="empty"><h2>Bilgilendirme kabul edilmedi</h2><p>Uygulamayı kullanmak için bilgilendirmeyi okuyup kabul etmeniz gerekir.</p></section></main>`;
}
function showLegalAgain(){
  const d=document.getElementById("legalNotice");
  if(d && d.showModal) d.showModal();
}


document.addEventListener("click",e=>{
  if(e.target && e.target.id==="acceptLegalNoticeBtn") acceptLegalNotice();
  if(e.target && e.target.id==="exitLegalNoticeBtn") exitApp();
  if(e.target && e.target.id==="openLegalNoticeBtn") showLegalAgain();
});


let barcodeStream=null;
let barcodeTimer=null;

function findByBarcode(code){
  const c=String(code||"").replace(/\D/g,"");
  if(!c) return null;
  return DATA.find(x=>(x.barkodlar||[]).some(b=>String(b.kod||b.code||b).replace(/\D/g,"")===c));
}

async function openBarcodeScanner(){
  const d=document.getElementById("barcodeDialog");
  const video=document.getElementById("barcodeVideo");
  const msg=document.getElementById("barcodeMessage");
  if(!d||!video) return alert("Barkod ekranı bulunamadı.");
  msg.textContent="";
  d.showModal();
  if(!("BarcodeDetector" in window)){
    msg.textContent="Bu tarayıcı otomatik barkod okumayı desteklemiyor. Barkod numarasını arama kutusuna yazabilirsin.";
    return;
  }
  try{
    barcodeStream=await navigator.mediaDevices.getUserMedia({video:{facingMode:"environment"}});
    video.srcObject=barcodeStream;
    const detector=new BarcodeDetector({formats:["ean_13","ean_8","upc_a","upc_e","code_128","qr_code"]});
    barcodeTimer=setInterval(async()=>{
      try{
        const codes=await detector.detect(video);
        if(codes && codes.length){
          const value=codes[0].rawValue||"";
          stopBarcodeScanner();
          d.close();
          const found=findByBarcode(value);
          if(found){
            document.getElementById("searchInput").value=value;
            FILTERED=[found];
            document.getElementById("resultCount").textContent="1 kayıt";
            document.getElementById("results").innerHTML=cardHtml(found);
            openDetail(found.id);
          }else{
            document.getElementById("searchInput").value=value;
            render();
            alert("Barkod okundu ama kayıt bulunamadı: "+value);
          }
        }
      }catch(e){}
    },600);
  }catch(err){
    msg.textContent="Kamera açılamadı. Telefon ayarlarından kamera iznini kontrol et.";
  }
}
function stopBarcodeScanner(){
  if(barcodeTimer){clearInterval(barcodeTimer);barcodeTimer=null;}
  if(barcodeStream){barcodeStream.getTracks().forEach(t=>t.stop());barcodeStream=null;}
}
document.addEventListener("click",e=>{
  if(e.target && e.target.id==="barcodeBtn") openBarcodeScanner();
  if(e.target && (e.target.id==="closeBarcode"||e.target.id==="stopBarcodeBtn")){
    stopBarcodeScanner();
    const d=document.getElementById("barcodeDialog");
    if(d) d.close();
  }
});

