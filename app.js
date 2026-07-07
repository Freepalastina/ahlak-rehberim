const VERSION="20260707-v44-legal-notice";
let DATA=[];
let FILTERED=[];
const $=s=>document.querySelector(s);
const esc=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
const norm=s=>String(s??"").toLocaleLowerCase("tr").normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/ı/g,"i");

function statusLabel(x){
  if(x==="preferred") return "✅ Tercih edilebilir";
  if(x==="control") return "⚪ Bilgi/kaynak kontrolü gerekli";
  if(x==="alternative") return "⭐ Alternatifli";
  return "🔴 İncelenmesi önerilir";
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
    companies:new Set(DATA.map(x=>x.anaFirma||"").filter(Boolean)).size,
    control:DATA.filter(x=>x.kontrolGerekli||!x.anaFirma||!x.kaynaklar.length).length
  };
}
function renderStats(){
  const c=counts();
  $("#stats").innerHTML=`
    <article class="stat review"><span>🔴 İncelenmesi önerilir</span><b>${c.review}</b></article>
    <article class="stat preferred"><span>✅ Tercih edilebilir</span><b>${c.preferred}</b></article>
    <article class="stat"><span>⭐ Alternatifli kayıt</span><b>${c.alternative}</b></article>
    <article class="stat"><span>📚 Kaynaklı kayıt</span><b>${c.sourced}</b></article>`;
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
    <div class="brandVisual">${x.image_url?`<img src="${esc(x.image_url)}" alt="${esc(x.marka)}" loading="lazy" onerror="this.src=\'assets/product-placeholder.svg\'">`:`<div class="visualFallback"><b>${esc((x.marka||"?").slice(0,2).toLocaleUpperCase("tr"))}</b><span>Ürün görseli</span></div>`}</div>
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
    <button data-open="${x.id}">Detay</button>
  </article>`;
}
function detailHtml(x){
  const control=x.kontrolGerekli||!x.anaFirma||!x.kaynaklar.length;
  return `<div class="detail">
    <span class="badge ${x.status}">${statusLabel(x.status)}</span>
    <h2>${esc(x.marka)}</h2><div class="detailVisual">${x.image_url?`<img src="${esc(x.image_url)}" alt="${esc(x.marka)}" onerror="this.src=\'assets/product-placeholder.svg\'">`:`<img src="assets/product-placeholder.svg" alt="Ürün görseli">`}</div>
    <p class="meta">${esc(x.not||"Bu kayıt etik inceleme listesinde yer aldığı için incelenmesi önerilir.")}</p>
    <div class="detailGrid">
      <div class="infoBox"><small>Ana firma</small><b>${esc(x.anaFirma||"Kontrol gerekli")}</b></div>
      <div class="infoBox"><small>Kategori</small><b>${esc(x.kategori||"-")}</b></div>
      <div class="infoBox"><small>Alt kategori</small><b>${esc(x.altKategori||"-")}</b></div>
      <div class="infoBox"><small>Son güncelleme</small><b>${esc(x.sonGuncelleme||"-")}</b></div>
    </div>
    ${control?`<h3>⚪ Bilgi/kaynak kontrolü</h3><div class="listItem">${esc(x.kontrolNotu||"Bu kayıtta ana firma, kaynak veya lisans bilgisi ayrıca kontrol edilmelidir.")}</div>`:""}
    <h3>⭐ Alternatifler</h3>
    <div class="list">${x.alternatifler.length?x.alternatifler.map(a=>`<div class="listItem"><b>${esc(a.marka||a.name||a.alternatifMarka||a)}</b><br><span class="meta">${esc(a.kategori||x.altKategori||"")}</span></div>`).join(""):`<div class="listItem">Alternatif önerisi henüz eklenmemiş.</div>`}</div>
    <h3>📚 Kaynaklar</h3>
    <div class="list">${x.kaynaklar.length?x.kaynaklar.map(s=>`<div class="listItem"><b>${esc(s.baslik||s.title||"Bilgi kaynağı")}</b><br><a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.url)}</a><p class="meta">${esc(s.not||"")}</p></div>`).join(""):`<div class="listItem">Kaynak kontrolü gerekli.</div>`}</div>
    <h3>ℹ️ Bilgilendirme</h3><div class="listItem">Bu kayıt kamuya açık kaynaklar ve uygulama veri tabanı üzerinden hazırlanmıştır. Bilgiler zaman içinde değişebilir. Güncel durumu doğrulamak için ilgili kaynakları inceleyiniz.</div><h3>📦 Barkodlar</h3>
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
