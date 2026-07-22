// ===================== ARCHIVOS JSON LOCALES ===================== //
const SEARCH_FISICO_JSON  = 'search_fisico.json';
const SEARCH_DIGITAL_JSON = 'search_digital.json';

// ===================== CONFIG ===================== //
const FAV_KEY = 'uade:favs';

// Estado de datos cargados
let searchFisico = [];       
let searchDigital = [];      
let catalogCache = [];       

// Estado DOM global
let valMsg, selectMod, inputQ, btnSearch, favDrawer, overlay;
let homeView, resultsView, resultsGrid, resultsEmpty, resultsQuery, resultsCount;

// Modal detalle refs
const D = {
  bound:false, wrap:null, bd:null, close:null,
  t:null, a:null, p:null, y:null, l:null, f:null, isbn:null, d:null,
  colWrap:null, col:null, // Referencias para la Colección
  btnCopy:null, btnFav:null, btnAI:null, __item:null
};

// Estado búsqueda
const Results = {
  yearName: 'y',
  langName: 'lang',
  fmtName:  'fmt',
  pubName:  'pub',
  authName: 'auth'
};

let __resultBase = [];
const PAGE_SIZE = 50;        
const MAX_RENDERED = 1000;   
let __renderedCount = 0;     
let __filteredCache = [];    
let __ioSentinel = null;     

// ===================== HELPERS FAVORITOS ===================== //
const getFavs   = () => JSON.parse(localStorage.getItem(FAV_KEY) || '[]');
const setFavs   = (arr) => localStorage.setItem(FAV_KEY, JSON.stringify(arr));
const isFav     = (id)  => getFavs().some(x => x.id === id);
const addFav    = (item)=> setFavs([...getFavs().filter(f=>f.id!==item.id), item]);
const removeFav = (id)  => setFavs(getFavs().filter(f => f.id !== id));
const toggleFav = (item)=> (isFav(item.id) ? removeFav(item.id) : addFav(item));

// ===================== TOAST DE FEEDBACK ===================== //
let __toastTimer = null;
function showToast(msg){
  const t = document.getElementById('toast');
  if(!t) return;
  t.textContent = msg;
  t.hidden = false;
  void t.offsetWidth;
  t.classList.add('show');
  if(__toastTimer) clearTimeout(__toastTimer);
  __toastTimer = setTimeout(()=>{
    t.classList.remove('show');
    setTimeout(()=>{ t.hidden = true; }, 250);
  }, 1800);
}

// ===================== MAPEO DE FORMATO ===================== //
function humanFormat(book){
  if (book.is_open_access) return 'Open access';
  if (book.is_digital)     return 'Libro electrónico (eBook)';
  if (book.is_fisico)      return 'Impreso';
  if (book.formato === 'OPEN_ACCESS') return 'Open access';
  if (book.formato === 'DIGITAL')     return 'Libro electrónico (eBook)';
  if (book.formato === 'FISICO')      return 'Impreso';
  return 'Formato desconocido';
}

function humanLang(code){ return code || ''; }

// ===================== CARD TEMPLATE ===================== //
function cardTpl(book) {
  const data = {
    // Usamos el id_titulo real si existe, o armamos un fallback
    id: book.id_titulo || (book.titulo + '|' + book.autor + '|' + book.anio),
    title: book.titulo || 'Título s/d',
    authors: book.autor || 'Autor s/d',
    year: book.anio || '',
    format: humanFormat(book),
    lang: humanLang(book.idioma || ''),
    publisher: book.editorial || '',
    summary: book.descripcion || '',
    isbn: book.isbn || '',
    url:  book.url  || ''
  };

  const el = document.createElement('article');
  el.className = 'card';
  el.setAttribute('role','listitem');
  el.dataset.id = data.id;

  el.innerHTML = `
    <div class="card-actions">
      <button class="icon-tile copy" title="Copiar cita" aria-label="Copiar"><img src="copy.png" alt=""></button>
      <button class="icon-tile heart ${isFav(data.id) ? 'active' : ''}" title="Favorito" aria-label="Favorito"><img src="fav.png" alt=""></button>
    </div>
    <h3>${data.title}</h3>
    <div class="authors">${data.authors}</div>
    <div class="rule"></div>
    <div class="meta">${data.year ? data.year + ' · ' : ''}${data.format}${data.lang ? ' · ' + data.lang : ''}</div>
  `;

  el.querySelector('.copy').addEventListener('click', (e) => {
    e.stopPropagation();
    const cita = `${data.authors} (${data.year || 's/f'}). ${data.title}.`;
    navigator.clipboard.writeText(cita).then(()=> showToast('Cita copiada')).catch(()=> showToast('No se pudo copiar'));
  });

  el.querySelector('.heart').addEventListener('click', (ev) => {
    ev.stopPropagation();
    toggleFav(data);
    ev.currentTarget.classList.toggle('active', isFav(data.id));
    renderFavs();
    syncFavStateInModal(data.id);
  });

  el.addEventListener('click', () => openDetailFromCard(data));
  return el;
}

// ===================== MODAL DETALLE ===================== //
function bindDetailRefs(){
  if (D.bound) return;
  D.wrap = document.getElementById('detail-modal');
  D.bd = document.getElementById('detail-backdrop');
  D.close = document.getElementById('detail-close');
  D.t = document.getElementById('d-title');
  D.a = document.getElementById('d-authors');
  D.p = document.getElementById('d-publisher');
  D.y = document.getElementById('d-year');
  D.l = document.getElementById('d-lang');
  D.f = document.getElementById('d-format');
  D.isbn = document.getElementById('d-isbn');
  D.d = document.getElementById('d-desc');
  
  // Nuevas referencias para la Colección
  D.colWrap = document.getElementById('d-col-wrap');
  D.col = document.getElementById('d-collection');

  D.btnCopy = document.getElementById('d-copy');
  D.btnFav = document.getElementById('d-fav');
  D.btnAI = document.getElementById('d-ai');

  if (!D.wrap) return;
  D.close?.addEventListener('click', closeDetail);
  D.bd?.addEventListener('click', closeDetail);
  window.addEventListener('keydown', e=>{ if(e.key==='Escape' && D.wrap.classList.contains('open')) closeDetail(); });

  D.btnCopy?.addEventListener('click', ()=>{
    if(!D.__item) return;
    const cita = `${D.__item.authors || 'Autor'} (${D.__item.year||'s/f'}). ${D.__item.title||'Título'}.`;
    navigator.clipboard.writeText(cita).then(()=> showToast('Cita copiada'));
  });

  D.btnFav?.addEventListener('click', ()=>{
    if(!D.__item) return;
    toggleFav(D.__item);
    syncFavStateInModal(D.__item.id);
    document.querySelector(`.card[data-id="${D.__item.id}"] .heart`)?.classList.toggle('active', isFav(D.__item.id));
    renderFavs();
  });

  D.btnAI?.addEventListener('click', ()=>{
    if(!D.__item) return;
    window.open('https://chatgpt.com/g/g-6986073600bc8191bdbf17e35c91a872-asistente-bibliografico-bot-de-uade', '_blank', 'noopener');
  });
  D.bound = true;
}

function syncFavStateInModal(id){
  if(!D.btnFav) return;
  const active = isFav(id);
  D.btnFav.classList.toggle('active', active);
  const label = document.getElementById('d-fav-label');
  if(label) label.textContent = active ? 'En favoritos' : 'Favoritos';
}

function fillDetailView(payload){
  D.t.textContent = payload.title || '—';
  D.a.textContent = payload.authors || '—';
  D.p.textContent = payload.publisher || '—';
  D.y.textContent = payload.year ?? '—';
  D.l.textContent = payload.lang || '—';
  D.f.textContent = payload.format || '—';
  if (D.isbn) D.isbn.textContent = payload.isbn || '—';
  D.d.textContent = payload.summary || '—';
  syncFavStateInModal(payload.id);

  // Link Open Access
  let oaLinkEl = document.getElementById('d-oa-link');
  if (!oaLinkEl) {
    oaLinkEl = document.createElement('div');
    oaLinkEl.id = 'd-oa-link';
    oaLinkEl.style.cssText = 'margin-top:12px;';
    D.d.parentElement.insertBefore(oaLinkEl, D.d);
  }
  if (payload.url) {
    oaLinkEl.innerHTML = `
      <span style="display:inline-block;background:#1a7f4b;color:#fff;font-size:11px;font-weight:700;padding:2px 8px;border-radius:999px;letter-spacing:.5px;margin-bottom:8px;">OPEN ACCESS</span>
      <div>
        <a href="${payload.url}" target="_blank" rel="noopener"
           style="color:#05255A;font-size:13px;font-weight:600;text-decoration:underline;">
          Ver libro en OAPEN →
        </a>
      </div>`;
  } else {
    oaLinkEl.innerHTML = '';
  }

    // Lógica de Colección + link de acceso basada en el ID
  if (D.colWrap && D.col) {
    // Pasamos a mayúsculas para evitar problemas
    const checkId = String(payload.id).toUpperCase();
    let colName = '';
    let colUrl  = '';

    // Verificamos si contiene alguna de las cadenas clave
    if (checkId.includes('CAT-')) {
      colName = 'Cátedra';
      colUrl  = 'https://elibro.net/en/lc/uade/colecciones/ELC004?prev=col';
    } else if (checkId.includes('HAM-')) {
      colName = 'Hammurabi';
      colUrl  = 'https://www.digitalbd.uade.edu.ar/login?url=https://biblioteca.hammurabidigital.com.ar/auth/ip';
    } else if (checkId.includes('CP67-')) {
      colName = 'CP67';
      colUrl  = 'https://www.digitalbd.uade.edu.ar/login?url=https://bibliotecadigital.cp67.com/auth/ip';
    }

    // Si encontramos coincidencia, mostramos el div con el link; si no, lo ocultamos.
        if (colName) {
      D.col.innerHTML = colName +
        '<br><a href="' + colUrl + '" target="_blank" rel="noopener" ' +
        'style="display:inline-block;margin-top:8px;padding:8px 16px;' +
        'background:#1a7f4b;color:#fff;font-weight:700;font-size:13px;' +
        'border-radius:8px;text-decoration:none;">' +
        'Acceder al ebook</a>';
      D.colWrap.style.display = 'block';
    } else {
      D.colWrap.style.display = 'none';
    }
  }
}

function openDetailFromCard(data){
  bindDetailRefs();
  if(!D.wrap) return;
  D.__item = data;
  fillDetailView(data);
  D.wrap.classList.add('open');
  D.wrap.setAttribute('aria-hidden','false');
  if (D.bd) D.bd.hidden = false;
}

function closeDetail(){
  if(!D.wrap) return;
  D.wrap.classList.remove('open');
  D.wrap.setAttribute('aria-hidden','true');
  if (D.bd) D.bd.hidden = true;
  D.__item = null;
}

// ===================== FAVORITOS DRAWER ===================== //
function openDrawer(state) {
  favDrawer.classList.toggle('open', state);
  overlay.hidden = !state;
}
function hookDrawer() {
  document.getElementById('btn-favs')?.addEventListener('click', () => { renderFavs(); openDrawer(true); });
  document.getElementById('fav-close')?.addEventListener('click', () => openDrawer(false));
  overlay?.addEventListener('click', () => openDrawer(false));
}
function renderFavs() {
  const list = document.getElementById('fav-list');
  if (!list) return;
  const favs = getFavs();
  list.innerHTML = favs.length ? '' : '<p class="small" style="font-size:13px;color:#4E738A;margin:0;">No agregaste favoritos aún.</p>';
  favs.forEach(f => {
    const row = document.createElement('div');
    row.className = 'fav-item';
    row.dataset.id = f.id;
    row.innerHTML = `
      <div class="fav-top">
        <div>
          <div class="fav-title" style="font-weight:700;font-size:16px;color:#2a5166;margin-bottom:6px">${f.title}</div>
          <div class="fav-meta">${f.year || ''} · ${f.format || ''} · ${f.lang || ''}</div>
        </div>
        <button class="btn-trash" title="Quitar" aria-label="Quitar"><img src="delete.png" alt=""></button>
      </div>`;
    row.querySelector('.btn-trash').addEventListener('click', () => {
      removeFav(f.id); renderFavs();
      document.querySelector(`.card[data-id="${f.id}"] .heart`)?.classList.remove('active');
      syncFavStateInModal(f.id);
    });
    list.appendChild(row);
  });
}

// ===================== SEARCH ===================== //
function buildCatalogCache() {
  const map = new Map();
  function pushList(list){
    list.forEach(bk=>{
      const id = bk.id_titulo || (bk.titulo + '|' + bk.autor + '|' + bk.anio);
      if(!map.has(id)){
        map.set(id, bk);
      }else{
        const prev = map.get(id);
        map.set(id, { ...prev, ...bk, is_fisico: prev.is_fisico || bk.is_fisico, is_digital: prev.is_digital || bk.is_digital, is_open_access: prev.is_open_access || bk.is_open_access });
      }
    });
  }
  pushList(searchFisico);
  pushList(searchDigital);
  catalogCache = [...map.values()];
}

function fmtKindFromBook(book){ return (book.is_open_access || book.is_digital) ? 'digital' : 'fisico'; }
function filterByModality(items){
  const m = selectMod.value;
  if (!m) return items;
  if (m === 'online') return items.filter(it => fmtKindFromBook(it)==='digital');
  return items;
}

const STOPWORDS = new Set(['a','al','algo','algun','alguna','algunas','alguno','algunos','ante','antes','aqui','aquel','aquella','aquellas','aquello','aquellos','asi','aun','aunque','bajo','bien','cada','como','con','contra','cual','cuales','cualquier','cuando','cuanto','de','del','desde','donde','dos','e','el','ella','ellas','ello','ellos','en','entre','era','eran','eres','es','esa','esas','ese','eso','esos','esta','estaba','estan','estar','estas','este','esto','estos','fue','fueron','fui','ha','han','hasta','hay','la','las','le','les','lo','los','mas','mi','mis','mucho','muy','ni','no','nos','nuestra','nuestras','nuestro','nuestros','o','os','otra','otras','otro','otros','para','pero','poco','por','porque','pues','que','quien','quienes','se','sea','segun','ser','si','sido','sin','sobre','solo','son','soy','su','sus','tambien','tan','tanto','te','ti','tiene','tienen','toda','todas','todo','todos','tras','tu','tus','un','una','unas','uno','unos','va','van','vos','y','ya','yo','the','of','and','or','in','on','to','for','with','by','an','a','is','are','this','that']);
function norm(s){ return (s == null ? '' : String(s)).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,''); }
function normIsbn(s){ return (s == null ? '' : String(s)).toLowerCase().replace(/[^0-9x]/g,''); }
function looksLikeIsbn(rawQuery){ const cleaned = normIsbn(rawQuery); return cleaned.length === 8 || cleaned.length === 10 || cleaned.length === 13; }
function tokenizeQuery(raw){
  if(!raw) return [];
  const cleaned = norm(raw).replace(/[^\p{L}\p{N}\s]/gu,' ');
  const all = cleaned.split(/\s+/).filter(Boolean);
  const useful = all.filter(t => t.length > 1 && !STOPWORDS.has(t));
  return useful.length ? useful : all;
}

function scoreItem(book, qTokens, isbnQuery){
  if(qTokens.length===0 && !isbnQuery) return 1;
  if(isbnQuery){
    const bookIsbn = normIsbn(book.isbn);
    if(bookIsbn && bookIsbn.includes(isbnQuery)) return 1000; 
  }
  if(qTokens.length===0) return 0;
  const blob = [book.titulo, book.autor, book.descripcion, book.editorial, book.formato, book.idioma, book.isbn, String(book.anio||''), ...(book.tematicas||[])].map(norm).join(' ');
  let s = 0;
  for(const tok of qTokens){ if (blob.includes(tok)) s += 1; else return 0; }
  return s;
}

function doSearch(){
  if(!selectMod.value){
    valMsg.hidden = false; document.querySelector('.search-composite')?.classList.add('has-error'); selectMod.focus(); return;
  }
  valMsg.hidden = true; document.querySelector('.search-composite')?.classList.remove('has-error');
  btnSearch?.classList.add('is-loading');

  setTimeout(()=>{
    const raw = inputQ.value.trim();
    const qTokens = tokenizeQuery(raw);
    const isbnQuery = looksLikeIsbn(raw) ? normIsbn(raw) : null;
    let base = filterByModality(catalogCache);
    let scored = base.map(it=>({it, s:scoreItem(it,qTokens,isbnQuery)})).filter(obj=> ((qTokens.length===0 && !isbnQuery) ? true : obj.s>0));
    scored.sort((a,b)=>{ if (b.s!==a.s) return b.s-a.s; return ( (b.it.anio||0) - (a.it.anio||0) ); });
    __resultBase = scored.map(o=>o.it);

    updateFormatStateForModality();

    homeView.hidden = true;
    resultsView.hidden = false;
    resultsQuery.textContent = raw ? raw : 'Resultados';
    renderResults(); 
    
    if (!document.querySelector('.search-composite').classList.contains('is-refreshing')) {
        window.scrollTo({top:0,behavior:'smooth'});
    }
    document.querySelector('.search-composite').classList.remove('is-refreshing');
    
    btnSearch?.classList.remove('is-loading');
  }, 150);
}

// ===================== FILTROS FACETADOS (sidebar) ===================== //

function updateDynamicFiltersFaceted() {
  const checkedPubs = [...document.querySelectorAll(`input[name="${Results.pubName}"]:checked`)].map(i=>i.value);
  const checkedAuths = [...document.querySelectorAll(`input[name="${Results.authName}"]:checked`)].map(i=>i.value);
  const checkedLangs = [...document.querySelectorAll(`input[name="${Results.langName}"]:checked`)].map(i=>i.value);

  // 1. Editoriales
  const itemsSinPub = applyFilters(__resultBase, { skipPub: true });
  const pubCounts = new Map();
  itemsSinPub.forEach(book => {
    const pub = (book.editorial||'').trim();
    if(pub && !pub.toLowerCase().includes('s/d')) pubCounts.set(pub, (pubCounts.get(pub)||0) + 1);
  });

  // 2. Autores
  const itemsSinAuth = applyFilters(__resultBase, { skipAuth: true });
  const authCounts = new Map();
  itemsSinAuth.forEach(book => {
    const aut = (book.autor||'').trim();
    if(aut && !aut.toLowerCase().includes('autor s/d')){
      const main = aut.split(',')[0].trim();
      if(main) authCounts.set(main, (authCounts.get(main)||0) + 1);
    }
  });

  // 3. Idiomas (excluye Open Access)
  const itemsSinLang = applyFilters(__resultBase, { skipLang: true });
  const langCounts = new Map();
  itemsSinLang.forEach(book => {
    const rawLang = (book.idioma||'').trim();
    if(rawLang && rawLang.toLowerCase() !== 's/d' && rawLang.toLowerCase() !== 'n/a') {
      const niceLang = rawLang.charAt(0).toUpperCase() + rawLang.slice(1).toLowerCase();
      langCounts.set(niceLang, (langCounts.get(niceLang)||0) + 1);
    }
  });

  function populateSection(map, regexTitle, inputName, checkedArr) {
    const targetFg = [...document.querySelectorAll('.filters .fg')].find(fg => {
      const t = fg.querySelector('.fg-title');
      return t && regexTitle.test(t.textContent);
    });
    if(!targetFg) return;

    let top = [...map.entries()].sort((a,b)=> b[1]-a[1]);
    const topNames = top.slice(0, 8).map(x => x[0]);
    
    checkedArr.forEach(val => {
      if(!topNames.includes(val)) top.unshift([val, map.get(val) || 0]);
    });

    const finalRender = top.slice(0, Math.max(8, checkedArr.length));
    if(finalRender.length === 0){
      targetFg.style.display = 'none'; return;
    }
    
    targetFg.style.display = '';
    const title = targetFg.querySelector('.fg-title');
    targetFg.innerHTML = '';
    targetFg.appendChild(title);

    finalRender.forEach(([name, count]) => {
      const isChecked = checkedArr.includes(name) ? 'checked' : '';
      const op = count === 0 ? '0.5' : '1';
      const label = document.createElement('label');
      label.className = 'chk';
      label.style.opacity = op;
      label.innerHTML = `<input type="checkbox" name="${inputName}" value="${name.replace(/"/g,'&quot;')}" ${isChecked} /><span>${name} <span style="color:#7f8ea0;font-weight:500;">(${count})</span></span>`;
      targetFg.appendChild(label);
    });
  }

  populateSection(langCounts, /idioma/i, Results.langName, checkedLangs);
  populateSection(pubCounts, /editorial/i, Results.pubName, checkedPubs);
  populateSection(authCounts, /autor/i, Results.authName, checkedAuths);
}

function updateFormatStateForModality(){
  const chkFisico = document.querySelector('input[name="fmt"][value="fisico"]');
  const chkDigital = document.querySelector('input[name="fmt"][value="digital"]');
  const chkOpen = document.querySelector('input[name="fmt"][value="open"]');
  if(selectMod.value === 'online'){
    if(chkFisico){ chkFisico.checked = false; chkFisico.disabled = true; chkFisico.nextElementSibling.style.opacity = '0.5'; }
    if(chkDigital) chkDigital.checked = true;
    if(chkOpen) chkOpen.checked = true;
  } else {
    if(chkFisico){ chkFisico.disabled = false; chkFisico.checked = true; chkFisico.nextElementSibling.style.opacity = '1'; }
    if(chkDigital) chkDigital.checked = true;
    if(chkOpen) chkOpen.checked = true;
  }
}

function applyFilters(items, options = {}) {
  let out = [...items];
  const thisYear = new Date().getFullYear();

  // 1. Filtro Año
  const yVal = (document.querySelector(`input[name="${Results.yearName}"]:checked`)?.value)||'';
  if(yVal==='lt3') out = out.filter(i => i.anio && (thisYear - i.anio) <= 3);
  else if(yVal==='lt10') out = out.filter(i => i.anio && (thisYear - i.anio) <= 10);

  // 2. Filtro Idioma
  if(!options.skipLang) {
    const langs = [...document.querySelectorAll(`input[name="${Results.langName}"]:checked`)].map(i=>i.value.toLowerCase());
    if(langs.length){
      out = out.filter(i => {
        const l = (i.idioma||'').trim().toLowerCase();
        return langs.includes(l);
      });
    }
  }

  // 3. Filtro Formato
  const fmts = [...document.querySelectorAll(`input[name="${Results.fmtName}"]:checked`)].map(i=>i.value);
  out = out.filter(book => {
    let keep = false;
    if (fmts.includes('fisico') && book.is_fisico) keep = true;
    if (fmts.includes('digital') && book.is_digital && !book.is_open_access) keep = true;
    if (fmts.includes('open') && book.is_open_access) keep = true;
    return keep;
  });

  // 4. Filtro Editorial
  if(!options.skipPub) {
    const pubs = [...document.querySelectorAll(`input[name="${Results.pubName}"]:checked`)].map(i=>i.value);
    if(pubs.length){
      out = out.filter(i => pubs.includes((i.editorial||'').trim()));
    }
  }

  // 5. Filtro Autor
  if(!options.skipAuth) {
    const auths = [...document.querySelectorAll(`input[name="${Results.authName}"]:checked`)].map(i=>i.value);
    if(auths.length){
      out = out.filter(i => {
        const mainA = (i.autor||'').split(',')[0].trim();
        return auths.includes(mainA);
      });
    }
  }

  return out;
}

function renderResults(){
  __filteredCache = applyFilters(__resultBase);
  resultsCount.textContent = __filteredCache.length;
  resultsEmpty.hidden = __filteredCache.length > 0;

  resultsGrid.replaceChildren();
  __renderedCount = 0;

  appendNextPage();
  setupInfiniteScroll();
  updateDynamicFiltersFaceted();
}

function appendNextPage(){
  if(__renderedCount >= __filteredCache.length) return;
  if(__renderedCount >= MAX_RENDERED) return;
  const nextEnd = Math.min(__renderedCount + PAGE_SIZE, __filteredCache.length, MAX_RENDERED);
  const slice = __filteredCache.slice(__renderedCount, nextEnd);
  const frag = document.createDocumentFragment();
  slice.forEach(book => frag.appendChild(cardTpl(book)));
  resultsGrid.appendChild(frag);
  __renderedCount = nextEnd;
  updateSentinel();
}

function updateSentinel(){
  let sentinel = document.getElementById('results-sentinel');
  if(!sentinel){
    sentinel = document.createElement('div');
    sentinel.id = 'results-sentinel';
    sentinel.className = 'results-sentinel';
  }
  resultsGrid.parentNode.appendChild(sentinel);
  const total = __filteredCache.length;
  if(__renderedCount >= total){
    if(total === 0){ sentinel.textContent = ''; sentinel.classList.remove('done'); }
    else { sentinel.textContent = total > PAGE_SIZE ? `Llegaste al final · ${total} resultados` : ''; sentinel.classList.add('done'); }
  } else if(__renderedCount >= MAX_RENDERED){
    sentinel.innerHTML = `Mostrando los ${MAX_RENDERED} resultados más relevantes de ${total}.<br><span class="hint">Refiná la búsqueda o usá los filtros para ver otros.</span>`;
    sentinel.classList.add('done');
  } else {
    sentinel.textContent = 'Cargando más resultados…';
    sentinel.classList.remove('done');
  }
}

function setupInfiniteScroll(){
  if(__ioSentinel){ __ioSentinel.disconnect(); __ioSentinel = null; }
  const sentinel = document.getElementById('results-sentinel');
  if(!sentinel) return;
  __ioSentinel = new IntersectionObserver(entries => {
    for(const entry of entries){
      if(entry.isIntersecting && __renderedCount < __filteredCache.length && __renderedCount < MAX_RENDERED){
        appendNextPage();
      }
    }
  }, { root: null, rootMargin: '600px 0px', threshold: 0 });
  __ioSentinel.observe(sentinel);
}

function hookSideFilters(){
  document.addEventListener('change', (e)=>{
    if(e.target.matches(`input[name="${Results.yearName}"],input[name="${Results.langName}"],input[name="${Results.fmtName}"],input[name="${Results.pubName}"],input[name="${Results.authName}"]`)){
      renderResults();
    }
  });
}

function hookModalityChange(){
  selectMod.addEventListener('change', ()=>{
    if(!resultsView.hidden && inputQ.value.trim()) doSearch();
    else if(!resultsView.hidden){ updateFormatStateForModality(); renderResults(); }
    if(selectMod.value){ valMsg.hidden = true; document.querySelector('.search-composite')?.classList.remove('has-error'); }
  });
}

// ===================== INIT / DATA LOAD ===================== //
function grabDomRefs(){
  valMsg = document.getElementById('val-msg');
  selectMod = document.getElementById('modality');
  inputQ = document.getElementById('q');
  btnSearch = document.getElementById('btn-search');
  favDrawer = document.getElementById('fav-drawer');
  overlay = document.getElementById('overlay');
  homeView = document.getElementById('home-view');
  resultsView = document.getElementById('results-view');
  resultsGrid = document.getElementById('results-grid');
  resultsEmpty = document.getElementById('results-empty');
  resultsQuery = document.getElementById('res-query');
  resultsCount = document.getElementById('res-count');
}

async function loadDataJSON(){
  try {
    const fisRaw = await fetch(SEARCH_FISICO_JSON).then(r=>r.json());
    searchFisico = Array.isArray(fisRaw) ? fisRaw : [];
    buildCatalogCache();
  } catch(e) { console.error("Error al cargar catálogo principal:", e); }
}

function loadDigitalInBackground() {
  fetch(SEARCH_DIGITAL_JSON)
    .then(r => r.json())
    .then(digRaw => {
       searchDigital = Array.isArray(digRaw) ? digRaw : [];
       buildCatalogCache(); 
       console.log("Catálogo digital cargado silenciosamente.");
       
       if (!resultsView.hidden) {
           document.querySelector('.search-composite').classList.add('is-refreshing');
           doSearch();
       }
    })
    .catch(e => console.error("Error cargando digitales:", e));
}

function initEventsAndUI(){
  hookDrawer();
  hookSideFilters();
  hookModalityChange();

  // Acordeón de Filtros Celular
  document.getElementById('btn-toggle-filters')?.addEventListener('click', () => {
    document.getElementById('filters-col')?.classList.toggle('is-open');
  });

  btnSearch?.addEventListener('click', doSearch);
  inputQ?.addEventListener('keydown', e=>{ if(e.key==='Enter') doSearch(); });

  document.getElementById('btn-assist')?.addEventListener('click', () => {
    window.open('https://chatgpt.com/g/g-6986073600bc8191bdbf17e35c91a872-asistente-bibliografico-bot-de-uade', '_blank', 'noopener');
  });

  const btnEmptyAI = document.getElementById('btn-empty-ai');
  if (btnEmptyAI) {
    btnEmptyAI.addEventListener('click', () => {
      const userQuery = (inputQ?.value || '').trim();
      if (!userQuery) return;
      const modalityLabel = selectMod?.value === 'online' ? 'carrera online' : selectMod?.value === 'presencial' ? 'carrera presencial' : 'carrera universitaria';
      const url = 'https://chatgpt.com/g/g-6986073600bc8191bdbf17e35c91a872-asistente-bibliografico-bot-de-uade';
      window.open(url, '_blank', 'noopener');
    });
  }

  bindDetailRefs();
  
  document.querySelector('.brand')?.addEventListener('click', (e)=>{
    e.preventDefault(); homeView.hidden = false; resultsView.hidden = true; inputQ.value = ''; window.scrollTo({top:0, behavior:'instant'});
  });

  document.getElementById('btn-new-search')?.addEventListener('click', ()=>{
    homeView.hidden = false; resultsView.hidden = true; inputQ.value = ''; window.scrollTo({top:0, behavior:'instant'});
  });
}

async function init(){
  grabDomRefs();
  if(inputQ) { inputQ.disabled = true; inputQ.placeholder = "⏳ Iniciando buscador..."; }
  if(btnSearch) btnSearch.disabled = true;
  if(selectMod) selectMod.disabled = true;

  await loadDataJSON(); 

  initEventsAndUI();
  
  if(inputQ) { inputQ.disabled = false; inputQ.placeholder = "Buscar por título, autor, ISBN/ISSN o tema…"; }
  if(btnSearch) btnSearch.disabled = false;
  if(selectMod) selectMod.disabled = false;

  loadDigitalInBackground();
}

window.addEventListener('DOMContentLoaded', init);