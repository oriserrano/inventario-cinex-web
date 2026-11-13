const CICLO = ['ok','malo','rep','falta','pend'];   // operativo → dañado → reparación → falta → sin revisar
const LABEL = {ok:'Operativo', rep:'En reparación', malo:'Dañado', falta:'Falta', pend:'Sin revisar'};
const CORTO = {ok:'OK', rep:'REP', malo:'MALO', falta:'FALTA', pend:'SIN REVISAR'};
const CORTOC = {ok:'OK', rep:'REP', malo:'MALO', falta:'FALTA', pend:'N/R'};
const siguiente = e => CICLO[(CICLO.indexOf(e)+1) % CICLO.length];
const seg = p => `width:${p}%;${p>0?'min-width:5px;':''}`;
const CAUSAS = ['Cable / conector','Pantalla o táctil','Pinpad','Impresora','Dispositivo fiscal',
                'Red / cable de red','Fuente o UPS','Mecánico','Otro'];
const ACC_MAP = {reparar:'reparar', sustituir:'comprar', revisar:'revisar'};
const KEY = 'cinex-estado-v2';
const hoy = () => new Date().toISOString().slice(0,10);

/* ================= ICONOS ================= */
const SVG = p => `<svg viewBox="0 0 24 24" class="ic" aria-hidden="true">${p}</svg>`;
const ICO = {
  pos:  '<rect x="3" y="4" width="18" height="12" rx="1.5"/><path d="M8 20h8M12 16v4"/>',
  imp:  '<path d="M7 8V3.5h10V8"/><rect x="3" y="8" width="18" height="8" rx="1.5"/><path d="M7 14h10v6.5H7z"/>',
  pin:  '<rect x="6" y="2.5" width="12" height="19" rx="2"/><path d="M9 6.5h6M9 10h2M12 10h3M9 14h2M12 14h3M9 18h6"/>',
  lec:  '<path d="M3 7.5V4h3.5M21 7.5V4h-3.5M3 16.5V20h3.5M21 16.5V20h-3.5"/><path d="M7.5 8v8M10.5 8v8M13.5 8v8M16.5 8v8"/>',
  gav:  '<rect x="3" y="7" width="18" height="12" rx="1.5"/><path d="M3 12h18M10 15h4"/>',
  tv:   '<rect x="2.5" y="4" width="19" height="13" rx="1.5"/><path d="M8.5 21h7M12 17v4"/>',
  tab:  '<rect x="6.5" y="2.5" width="11" height="19" rx="2"/><path d="M10.5 18.5h3"/>',
  mon:  '<rect x="2.5" y="4.5" width="19" height="12" rx="1.5"/><path d="M9 20.5h6M12 16.5v4"/>',
  tec:  '<rect x="2.5" y="7" width="19" height="10" rx="2"/><path d="M6 11h1.5M9 11h1.5M12 11h1.5M15 11h1.5M18 11h.5M7 14.5h10"/>',
  mou:  '<rect x="7" y="3" width="10" height="18" rx="5"/><path d="M12 7v3.5"/>',
  ups:  '<rect x="3" y="7" width="16" height="10" rx="2"/><path d="M19.5 10.5v3M6 11v2M9 11v2M12 11v2"/>',
  net:  '<rect x="3" y="9" width="18" height="7" rx="1.5"/><path d="M6.5 12.5h.01M9.5 12.5h.01M12.5 12.5h.01M15.5 12.5h.01"/>',
  srv:  '<rect x="4" y="3.5" width="16" height="7" rx="1.5"/><rect x="4" y="14" width="16" height="7" rx="1.5"/><path d="M8 7h.01M8 17.5h.01"/>',
  cpu:  '<rect x="6.5" y="6.5" width="11" height="11" rx="1.5"/><path d="M9.5 3v3.5M14.5 3v3.5M9.5 17.5V21M14.5 17.5V21M3 9.5h3.5M3 14.5h3.5M17.5 9.5H21M17.5 14.5H21"/>',
  gen:  '<rect x="4" y="4" width="16" height="16" rx="2.5"/><path d="M8 9.5h8M8 14h5"/>',
  dis:  '<rect x="3.5" y="6.5" width="17" height="11" rx="2"/><path d="M7 10.5h5M7 14h8"/><circle cx="17" cy="10.5" r="1.2"/>'
};
function icono(t){
  t = (t||'').toLowerCase();
  if(/impresora/.test(t)) return SVG(ICO.imp);
  if(/pinpad|pin pad|v ?tid/.test(t)) return SVG(ICO.pin);
  if(/lector|c[oó]digo|esc[aá]ner/.test(t)) return SVG(ICO.lec);
  if(/gaveta/.test(t)) return SVG(ICO.gav);
  if(/dispositivo/.test(t)) return SVG(ICO.dis);
  if(/tablet|redenci|\bqr\b|tel[eé]fono/.test(t)) return SVG(ICO.tab);
  if(/monitor/.test(t)) return SVG(ICO.mon);
  if(/teclado/.test(t)) return SVG(ICO.tec);
  if(/mouse/.test(t)) return SVG(ICO.mou);
  if(/\bcpu\b|mini pc|comput/.test(t)) return SVG(ICO.cpu);
  if(/servidor|rack|data center/.test(t)) return SVG(ICO.srv);
  if(/ups|regulador|bater/.test(t)) return SVG(ICO.ups);
  if(/switch|router|forti|patch|organizador|punto de red/.test(t)) return SVG(ICO.net);
  if(/tv|pantalla|plasma|menu|board/.test(t)) return SVG(ICO.tv);
  if(/\bpos\b|terminal|caja/.test(t)) return SVG(ICO.pos);
  return SVG(ICO.gen);
}

/* ================= ESTADO ================= */
let S = {est:{}, notas:{}, nuevos:{}, mod:{}, mov:[], hist:{}, vtid:{}, cmod:{}, acc:[], perfil:null,
          causas:[], accionComp:{}, precios:{}, claves:{}, nomb:{}, puesto:{}, orden:{}};
try{ const raw = localStorage.getItem(KEY); if(raw) S = Object.assign(S, JSON.parse(raw)); }catch(e){}
S.notas = S.notas||{}; S.nuevos = S.nuevos||{}; S.mod = S.mod||{}; S.mov = S.mov||{}; S.hist = S.hist||{};
S.vtid = S.vtid||{}; S.cmod = S.cmod||{};
S.nomb = S.nomb||{}; S.puesto = S.puesto||{}; S.orden = S.orden||{};
S.cinesNuevos = S.cinesNuevos||[];
S.meta = S.meta||{};            // ideales por cine que tú ajustes (ideal/inst/oper)
S.ideales = S.ideales||{};      // ideales de runner y ATM por cine
S.qhIdeales = false;            // ¿el bloque de ideales está abierto en Qué hacer?
S.borrados = S.borrados||[];
S.retirados = S.retirados||{};
S.acc = Array.isArray(S.acc)? S.acc : [];
S.perfil = S.perfil || null;
S.causas = Array.isArray(S.causas)? S.causas : [];
S.accionComp = S.accionComp || {};
S.precios = S.precios || {};
S.claves = S.claves || {};
S.obs = S.obs || {};
S.usuarios = S.usuarios || null;
S.mov = Array.isArray(S.mov)? S.mov : [];
const BASE = {};
const AUTOR = () => (S.perfil && S.perfil.nombre) || 'Sin perfil';
const ROL = () => (S.perfil && S.perfil.rol) || 'soporte';
const ROL_TXT = {soporte:'Soporte', coordinacion:'Coordinación',
                 infraestructura:'Infraestructura', gerencia:'Gerencia'};
const EQUIPO_BASE = {
  soporte: ['Danyelis Duran','Adrian de la Rosa','Luis Rivero','Alexander Rojas','Brayan Silva'],
  coordinacion: ['Carlos Alvarez'],
  infraestructura: ['Yalkott Gonzalez'],
  gerencia: ['Oriana Serrano']
};
const USU = ()=>{ if(!S.usuarios) S.usuarios = JSON.parse(JSON.stringify(EQUIPO_BASE));
  return S.usuarios; };
const adminUsuarios = ()=> ROL()==='gerencia' || ROL()==='coordinacion';
const TECNICAS = ['Centro de datos','Taquilla digital','Menú board dulcería','Menú board taquilla',
                  'Plasmas de salas','Lobby','TV Cinexpress','TV Cinexplay'];
const puedeEditar = () => true;   // todos editan; el control lo da la aprobación
function puedeAprobar(m){
  const r = ROL();
  if(r==='coordinacion' || r==='gerencia') return true;
  if(r==='infraestructura') return TECNICAS.includes(m.area);
  return false;
}
function flash(m){ const f=document.getElementById('flash'); f.textContent=m; f.classList.add('on');
  clearTimeout(window.__ft); window.__ft=setTimeout(()=>f.classList.remove('on'),1300); }
function save(){
  S._modif = Date.now();                    // cuándo cambió esto por última vez aquí
  try{ S.hist[hoy()] = conteosTotales(); localStorage.setItem(KEY, JSON.stringify(S)); }
  catch(e){ flash('No se pudo guardar en este navegador'); }
  sbProgramar();
}

/* Los componentes se editan sobre DATA (que no se guarda en save()), así que
   la lista viva se replica en S.comps y se vuelve a aplicar en cada arranque. */
function aplicarComps(){
  if(!S.comps) S.comps = {};
  const poner = it=>{
    const o = S.comps[it.id];
    if(!o) return;
    it.c = o.map(c=>({n:c.n, e:c.e||'pend', v:c.v||''}));
    if(it.c.length===0){ delete it.c; if(it.e===undefined) it.e='pend'; }
  };
  DATA.cines.forEach(c=> c.ar.forEach(a=> a.v.forEach(poner)));
  DATA.cines.forEach(c=> (S.nuevos[c.c]||[]).forEach(poner));
}
function guardarComps(it){
  if(!it || !it.id || !it.c) return;
  S.comps = S.comps || {};
  S.comps[it.id] = it.c.map(c=>({n:c.n, e:c.e||'pend', v:c.v||''}));
}
function ensureIds(){
  DATA.cines.forEach(c=>{
    c.ar.forEach(a=> a.v.forEach((it,ii)=>{
      it.id = c.c+'|'+a.a+'|'+ii+'|'+(it.p||it.n||'');
      if(!S.est[it.id]) S.est[it.id] = {};
      if(!BASE[it.id]) BASE[it.id] = {};
      if(it.c){ it.c.forEach((ch,ci)=>{
        if(S.est[it.id][ci]===undefined) S.est[it.id][ci]=ch.e;
        BASE[it.id][ci]=ch.e; });
      } else {
        if(S.est[it.id].e===undefined) S.est[it.id].e=it.e;
        BASE[it.id].e=it.e;
      }
    }));
  });
}
function findItem(id){
  let res=null;
  if(S.borrados.indexOf(id)>=0) return null;
  DATA.cines.forEach(c=> c.ar.forEach(a=> a.v.forEach(it=>{ if(it.id===id) res=it; })));
  DATA.cines.forEach(c=> (S.nuevos[c.c]||[]).forEach(it=>{ if(it.id===id) res=it; }));
  return res;
}
function partes(id){ const p = String(id).split('|'); return {cine:p[0], area:p[1]}; }
function etiquetaComp(id, idx){
  const it = findItem(id);
  if(!it) return 'Equipo';
  if(it.c && it.c[idx]) return it.c[idx].n;
  return 'Equipo';
}
function estadosItem(it){
  const e = S.est[it.id] || {};
  if(it.c) return it.c.map((ch,ci)=> e[ci]||'falta');
  return [e.e||'ok'];
}
/* Si el componente quedó operativo, su acción del plan no tiene sentido:
   se cierra como ejecutada (antes quedaban planes "reparar" en algo sano). */
function cerrarPlanSiOk(id, idx){
  if(!Array.isArray(S.acc)) return false;
  const acc = S.acc.find(x=> x.key===id+'|'+idx);
  if(!acc || (acc.estado!=='pendiente' && acc.estado!=='cotizado')) return false;
  acc.estado = 'ejecutado';
  acc.cierre = new Date().toISOString();
  acc.autor = AUTOR();
  acc.nota = (acc.nota? acc.nota+' · ' : '') + 'quedó operativo';
  return true;
}
function nuevoDe(id, idx, a, causa, rev){
  const it = findItem(id);
  const p = partes(id);
  // los equipos nuevos tienen id sin tubos (add-179…) → el cine real sale de dondeEsta
  const d = id.indexOf('|')<0 ? dondeEsta(id) : null;
  const cineReal = d? d.c.c : p.cine;
  const areaReal = d? d.area : p.area;
  if(!S.est[id]) S.est[id]={};
  const viejo = S.est[id][idx];
  if(viejo===a) return false;
  S.est[id][idx]=a;
  // si vuelve a operativo se cierra sola la revisión pendiente Y el plan
  if(a==='ok'){
    cerrarPlanSiOk(id, idx);
    S.mov.forEach(m=>{
      if(m.rev!=='pendiente') return;
      const mismo = m.id===id || (!m.id && m.cine===cineReal && m.area===areaReal &&
                    m.eq===(it?it.n:'') && m.comp===etiquetaComp(id,idx));
      if(mismo){ m.rev='ok'; m.rap=new Date().toISOString(); }
    });
  }
  // Centro de datos: nunca pasa por el coordinador
  const revFinal = esCentroDeDatos(id) ? 'ok' : (rev || 'ok');
  S.mov.push({ts: new Date().toISOString(), id, cine:cineReal, area:areaReal,
              eq: it? it.n : '', comp: etiquetaComp(id,idx),
              de: LABEL[viejo||'pend'], a: LABEL[a], causa: causa||'', rev: revFinal,
              autor: AUTOR()});
  if(S.mov.length>800) S.mov = S.mov.slice(-800);
  return true;
}
function conteos(c){
  const r = {ok:0,rep:0,malo:0,falta:0,pend:0,total:0,vacias:0};
  const recorre = items => vivos(items).forEach(it=>{
    if(it.x){ r.vacias++; return; }        // puesto sin equipo: no cuenta componentes
    if(RETIRADO(it)){ r.retirados++; return; }   // retirado
    estadosItem(it).forEach(s=>{ r[s]++; r.total++; });
  });
  c.ar.forEach(a=> recorre(a.v));
  Object.values(nuevosDe(c)).forEach(recorre);
  return r;
}
function conteosTotales(){
  const t = {ok:0,rep:0,malo:0,falta:0,pend:0,total:0,vacias:0,retirados:0};
  DATA.cines.forEach(c=>{ const r=conteos(c); for(const k in t) t[k]+=(r[k]||0); });
  return t;
}
const esMalo = x => x==='malo'||x==='rep'||x==='falta';
function mejora(c){
  const o = {mej:0, emp:0, sin:0};
  const cmp = items => vivos(items).forEach(it=>{
    if(it.x || RETIRADO(it)) return;              // sin equipo o retirado: no cuenta
    const e = S.est[it.id]||{}, b = BASE[it.id]||{};
    if(it.c) it.c.forEach((ch,ci)=>{ const a=e[ci], z=b[ci];
      if(z===undefined) return;
      if(esMalo(z) && !esMalo(a)) o.mej++;
      else if(!esMalo(z) && esMalo(a)) o.emp++;
      else o.sin++; });
    else { const a=e.e, z=b.e;
      if(z===undefined) return;
      if(esMalo(z) && !esMalo(a)) o.mej++;
      else if(!esMalo(z) && esMalo(a)) o.emp++;
      else o.sin++; }
  });
  if(c){ c.ar.forEach(a=>cmp(a.v)); Object.values(nuevosDe(c)).forEach(cmp); }
  else DATA.cines.forEach(x=>{ x.ar.forEach(a=>cmp(a.v)); Object.values(nuevosDe(x)).forEach(cmp); });
  return o;
}
function nuevosDe(c){
  const arr = (S.nuevos[c.c] || []).filter(it=> !BORRADO(it));
  const porArea = {};
  arr.forEach(it=>{ (porArea[it.area] = porArea[it.area]||[]).push(it); });
  return porArea;
}
function pendientes(){ return S.mov.filter(m=>m.rev==='pendiente'); }
/* Cola de revisión agrupada por cine: cada fila con Ver ✓ ✗ y aprobación por cine */
function colaAgrupada(movs, conGlobal){
  if(!movs.length) return '<div class="empty-note">No hay cambios esperando aprobación. ✓</div>';
  const porCine = {};
  movs.forEach(m=>{ const k = m.cine||'Sin cine'; (porCine[k]=porCine[k]||[]).push(m); });
  const cines = Object.keys(porCine).sort((a,b)=> porCine[b].length-porCine[a].length);
  const grupos = cines.map(k=>{
    const lista = porCine[k];
    const filas = lista.map(m=>{
      const i = S.mov.indexOf(m);
      const tag = m.tipoMov ? (m.tipoMov==='alta'?'ALTA':(m.tipoMov==='retiro'?'RETIRO':'BORRA')) : 'CAMBIO';
      return `<div class="alerta q">
        <span class="badge ${m.tipoMov?'mal':'rev'}">${tag}</span>
        <span style="flex:1"><span class="ti">${m.eq} · ${m.comp}</span><br>
          <span class="de">${m.area? m.area+' · ':''}${m.de} → <b>${m.a}</b>${
            m.causa? ' · '+m.causa:''}<br><b>${m.autor||'Sin perfil'}</b> · ${m.ts.slice(5,16).replace('T',' ')}</span></span>
        <span class="qacts">
          <button data-verfic="${m.cine||''}" title="Ver la ficha del equipo">Ver</button>
          <button data-aprobar="${i}" title="Aprobar">✓</button>
          <button data-rechazar="${i}" title="Rechazar">✗</button>
        </span>
      </div>`;
    }).join('');
    return `<div class="qcine">
      <div class="qhd"><b>${k}</b>
        <span class="ad">${lista.length} ${lista.length===1?'cambio':'cambios'}</span>
        <button data-aprobar-todo="${k}" title="Aprueba todo lo de este cine">✓ Aprobar todo</button></div>
      ${filas}
    </div>`;
  }).join('');
  const global = conGlobal? `<div class="rowbtn" style="margin-top:10px">
      <button class="btn-p" data-aprobar-todo="todos">✓ Aprobar los ${movs.length}</button></div>` : '';
  return grupos + global;
}
function modeloDe(it){
  if(!it) return '';
  const m = S.mod[it.id];
  if(m!==undefined && m!=='') return m;
  if(it.m && it.m!=='0') return it.m;
  if(it.d) return it.d.split(' · ').slice(0,2).join(' · ');
  return '';
}

/* ---- distribución del mostrador ---- */
const ORDEN_MOST = [
  ['Monitor principal', 'm3'], ['Monitor secundario', 'm3'],
  ['Terminal POS', 'm2'], ['Lector de barras', 'm2'], ['Pinpad', 'm2'],
  ['Impresora fiscal', 'm2'], ['Dispositivo fiscal', 'm2'], ['Gaveta', 'm2'],
  ['UPS/Regulador', 'm3'], ['Punto de red', 'm3']
];
const ETIQ = {'Terminal POS':'CPU', 'Lector de barras':'Escáner'};
function esVacio(v){ v=(v||'').trim();
  return !v || v==='0' || v.toUpperCase()==='NO' || /^vaci[oó]$/i.test(v); }
function valorComp(it, ci, ch){
  const k = S.cmod[it.id+'|'+ci];
  if(k) return k;
  if(ch.n==='Terminal POS') return modeloDe(it);
  const v = (ch.v||'').trim();
  if(esVacio(v) || /^(si|no|true|false)$/i.test(v)) return '';
  return v;
}
function vtidDe(it){
  if(!it || !it.c) return '';
  const ci = it.c.findIndex(ch=>ch.n==='VTID');
  if(ci<0) return '';
  const base = it.c[ci].v;
  return S.vtid[it.id]!==undefined ? S.vtid[it.id] : (esVacio(base)? '' : base);
}
function vtidHtml(it){
  const ci = it.c.findIndex(ch=>ch.n==='VTID');
  if(ci<0) return '';
  const est = (S.est[it.id]||{})[ci];
  const val = vtidDe(it);
  const esc = String(val).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;');
  return `<div class="vtid"><span>VTID</span>
    <input type="text" data-vtid="${it.id}" value="${esc}"
      placeholder="${est==='falta'? 'sin VTID' : 'PBVGTAQ01'}"></div>`;
}

/* ================= VISTA ================= */
let vista = {tab:'resumen', modo:'home', cine:null, filtro:'all', areaF:'todas',
             planF:'todo', planC:'todos'};
let scrollObj = null;                 // null = mantener la posición actual

// recordar qué grupos de "Qué hacer" están abiertos (sin redibujar)
document.addEventListener('toggle', e=>{
  const d = e.target;
  if(!d.dataset || d.dataset.gkey===undefined) return;
  if(vista.planAbrirTodo && !d.open){
    vista.planAbrirTodo = false;
    vista.planAbiertos = [...document.querySelectorAll('details.grupo[data-gkey][open]')]
      .map(x=>x.dataset.gkey);
    return;
  }
  const arr = Array.isArray(vista.planAbiertos)? vista.planAbiertos : [];
  const k = d.dataset.gkey, i = arr.indexOf(k);
  if(d.open){ if(i<0) arr.push(k); } else if(i>=0) arr.splice(i, 1);
  vista.planAbiertos = arr;
}, true);

// visitas: el borrador vive en vista.vis para que render() no pierda lo escrito
document.addEventListener('change', e=>{
  if(!vista.vis || !e.target.matches) return;
  if(e.target.matches('[data-vcheck]')){
    vista.vis.check[e.target.dataset.vcheck] = e.target.checked; render(); return; }
  if(e.target.matches('[data-vcine]')){ vista.vis.cine = e.target.value; vista.vis.areas = []; render(); }
  else if(e.target.matches('[data-vfecha]')){ vista.vis.fecha = e.target.value; }
});
document.addEventListener('input', e=>{
  if(vista.vis && e.target.matches && e.target.matches('[data-vobs]')) vista.vis.obs = e.target.value;
});

function render(){
  const app = document.getElementById('app');
  const y = window.scrollY;
  if(!S.perfil){
    app.innerHTML = accesoHTML();
    window.scrollTo(0,0);
    return;
  }
  const permitidos = tabsPermitidos();
  if(permitidos.indexOf(vista.tab)<0){          // módulo sin acceso a esa pestaña
    vista.tab = 'resumen'; vista.modo = 'home'; vista.cine = null; scrollObj = 0;
  }
  if(vista.tab==='quehacer') app.innerHTML = queHacerIdeales() + queHacer();
  else if(vista.tab==='visitas') app.innerHTML = visitas();
  else if(vista.tab==='dashboard') app.innerHTML = dashboard();
  else if(vista.tab==='gestion') app.innerHTML = gestion();
  else app.innerHTML = vista.modo==='home' ? home() : cineVista(DATA.cines.find(c=>c.c===vista.cine));
  if(vista.tab==='visitas') bindFirma();
  document.querySelectorAll('[data-tab]').forEach(b=>{
    const ok = permitidos.indexOf(b.dataset.tab)>=0;
    b.hidden = !ok;
    b.classList.toggle('on', ok && b.dataset.tab===vista.tab);
    if(b.dataset.tab==='gestion'){
      const n = pendientes().length;
      let bd = b.querySelector('.tabnum');
      if(n){
        if(!bd){ bd = document.createElement('span'); bd.className='tabnum'; b.appendChild(bd); }
        bd.textContent = n;
        bd.title = n+' cambios esperando tu revisión';
      } else if(bd) bd.remove();
    }
  });
  const bp = document.getElementById('btn-perfil');
  if(bp) bp.textContent = S.perfil ? AUTOR().split(' ')[0] : 'Perfil';
  // si la ventana de estado está abierta, repintar su ficha con los cambios recientes
  if(typeof mPend!=='undefined' && mPend){
    const mf = document.getElementById('m-ficha');
    if(mf) mf.innerHTML = fichaHTML(mPend.id, mPend.idx);
  }
  const destino = scrollObj===null ? y : scrollObj;
  scrollObj = null;
  window.scrollTo(0, destino);
}

function sparkline(hist){
  const fechas = Object.keys(hist||{}).sort().slice(-14);
  if(fechas.length<2) return `<div style="font-size:12px;color:var(--mut)">
    Todavía no hay historial: se registra cada día que se guarda el avance.</div>`;
  const pts = fechas.map(f=>{ const t=hist[f]; return t.total? t.ok/t.total*100 : 0; });
  const w=100, h=54;
  const x = i=> (i/(pts.length-1))*w;
  const y = v=> h - (v/100)*(h-8) - 4;
  const d = pts.map((v,i)=> `${i?'L':'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
  const area = d + ` L${w},${h} L0,${h} Z`;
  return `<svg class="spark" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none">
    <path d="${area}" fill="rgba(31,157,85,.15)"></path>
    <path d="${d}" fill="none" stroke="#1f9d55" stroke-width="1.6" vector-effect="non-scaling-stroke"></path>
  </svg>
  <div style="font-size:11.5px;color:var(--mut)">${fechas[0]} → ${fechas[fechas.length-1]}
    · % de componentes operativos</div>`;
}

/* Cuánto falta por cine para dejarlo100% operativo */
function metaCine(c){
  let comprar = 0, reparar = 0, costo = 0, total = 0, ok = 0, pend = 0, vacias = 0;
  const revisar = it=>{
    if(BORRADO(it) || RETIRADO(it)) return; // borrado o retirado: no entra en la meta
    if(it.x){ vacias++; comprar++; costo += PRECIO_ESTACION; return; }
    const ests = estadosItem(it);
    const nombres = it.c? it.c.map(ch=> ETIQ[ch.n]||ch.n) : [it.n];
    ests.forEach((e, i)=>{
      total++;
      if(e==='ok') ok++;
      else if(e==='pend') pend++;
      else if(e==='falta'){ comprar++; costo += Number(precioDe(nombres[i]))||0; }
      else if(e==='malo' || e==='rep') reparar++;
    });
  };
  c.ar.forEach(a=> a.v.forEach(revisar));
  Object.values(nuevosDe(c)).forEach(arr=> arr.forEach(revisar));
  return {comprar, reparar, costo, total, ok, pend, vacias,
          pct: total? Math.round(ok/total*100) : 0};
}

/* ---- indicadores del tablero ejecutivo ---- */
function avanceGlobal(){
  const t = conteosTotales();
  const cines = DATA.cines.map(c=>({c, m:metaCine(c)}));
  const enMeta = cines.filter(x=> x.m.pct>=90).length;
  const sinDatos = cines.filter(x=> x.m.total===0).length;
  return {t, cines, enMeta, sinDatos,
          pct: t.total? Math.round(t.ok/t.total*100) : 0};
}
function topProblemas(n){
  const m = {};
  const suma = (chs, est)=> chs.forEach(x=>{ if(['falta','malo','rep'].indexOf(est(x))>=0)
    m[x.n] = (m[x.n]||0)+1; });
  DATA.cines.forEach(c=> c.ar.forEach(a=> vivos(a.v).forEach(it=>{
    if(it.x || RETIRADO(it)) return;
    const e = S.est[it.id]||{};
    if(it.c) suma(it.c.map((ch,i)=>({n:ETIQ[ch.n]||ch.n, e:e[i]})), x=> x.e||'falta');
    else suma([{n:it.n, e:e.e}], x=> x.e||'ok');
  })));
  return Object.entries(m).sort((a,b)=> b[1]-a[1]).slice(0, n);
}
function planPorEstado(){
  return EST_PLAN.map(([k, txt])=>{
    const filas = S.acc.filter(a=> a.estado===k);
    return {k, txt, n:filas.length,
            monto: filas.reduce((s,a)=> s+(Number(a.monto)||0), 0)};
  }).filter(x=> x.n);
}
/* ================= VISITAS: checklist + firma + historial ================= */
const CHECK_VISITA = [
  ['eq',   'Equipos encendidos y probados en el sitio'],
  ['est',  'Estados actualizados en el panel (verde / amarillo / rojo)'],
  ['falt', 'Faltantes y equipos dañados confirmados'],
  ['prec', 'Precios de reposición confirmados'],
  ['obs',  'Observaciones anotadas para el plan'],
];
function fechaHoy(){ const d=new Date();
  return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); }
function fechaBonita(f){ const p=String(f||'').split('-'); return p.length===3? p[2]+'/'+p[1]+'/'+p[0] : (f||'—'); }
function borradorVisita(){
  return {cine: vista.cine || (DATA.cines[0] && DATA.cines[0].c), fecha: fechaHoy(),
          areas:[], check:{}, obs:'', firma:null};
}
/* Lista global de componentes en un estado (para los clics del Resumen general) */
function listaGlobal(est){
  const out = [];
  DATA.cines.forEach(c=> c.ar.forEach(a=> vivos(a.v).forEach(it=>{
    if(S.borrados.indexOf(it.id)>=0) return;
    if(est==='vacias'){ if(it.x) out.push({cine:c.c, cn:c.n, area:a.a, eq:it.n, comp:'—'}); return; }
    if(it.x || RETIRADO(it)) return;
    const e = S.est[it.id] || {};
    if(it.c) it.c.forEach((ch,i)=>{
      const s = (e[i]!==undefined? e[i] : ch.e) || 'pend';
      if(s===est) out.push({cine:c.c, cn:c.n, area:a.a, eq:it.n, comp:ETIQ[ch.n]||ch.n});
    });
    else {
      const s = (e.e!==undefined? e.e : it.e) || 'pend';
      if(s===est) out.push({cine:c.c, cn:c.n, area:a.a, eq:it.n, comp:it.n});
    }
  })));
  return out;
}
function tarjetaFiltro(){
  const est = vista.gf;
  const filas = listaGlobal(est);
  const mostrar = vista.gfTodo? filas : filas.slice(0,60);
  const tit = {ok:'operativos', rep:'en reparación', malo:'dañados',
               falta:'faltantes', pend:'sin revisar', vacias:'puestos sin equipo'}[est] || est;
  return `<div class="card secc"><div class="hd"><h2>${filas.length} ${tit}</h2>
    <span class="ad">${vista.gfTodo? 'lista completa' : 'mostrando '+mostrar.length}</span>
    <button data-gfclose class="btn-ghost">Limpiar filtro ✕</button></div><div class="bd">
    ${filas.length? `<div class="flist">${mostrar.map(f=>`<div class="frow">
        <span><b>${f.cn}</b> · ${f.area} · ${f.eq}${f.comp!=='—'? ' · '+f.comp:''}</span>
        <button data-gfcine="${f.cine}">Ver cine</button></div>`).join('')}</div>`
      : '<div class="empty-note">Nada en este estado ✓</div>'}
    ${(!vista.gfTodo && filas.length>mostrar.length)?
      `<div class="rowbtn"><button data-gfall>Ver las ${filas.length}</button></div>`:''}
  </div></div>`;
}
/* ============ DASHBOARD (solo Gerencia) · se descarga en PDF ============ */
function datosDashboard(){
  const t = conteosTotales();
  const pctOper = t.total? Math.round(t.ok/t.total*100) : 0;
  const meta = DATA.meta || {};
  let ideal = 0, inst = 0;
  DATA.cines.forEach(c=>{ const m = meta[c.c]; if(m && m.ideal){ ideal += m.ideal; inst += (m.inst||0); } });
  const avance = ideal? Math.round(inst/ideal*100) : null;

  const vivas = (S.acc||[]).filter(a=> a.estado!=='ejecutado');
  const porCine = {}, porComp = {};
  vivas.forEach(a=>{
    const cant = Number(a.cant)||1;
    const g = porCine[a.cine] || (porCine[a.cine] = {comprar:0, reparar:0, revisar:0, monto:0, n:0});
    const h = porComp[a.comp] || (porComp[a.comp] = {comprar:0, reparar:0, revisar:0, monto:0});
    if(a.tipo==='comprar'){ g.comprar+=cant; h.comprar+=cant; }
    else if(a.tipo==='reparar'){ g.reparar+=cant; h.reparar+=cant; }
    else { g.revisar+=cant; h.revisar+=cant; }
    g.monto += Number(a.monto)||0; g.n++;
    h.monto += Number(a.monto)||0;
  });
  const filasCine = DATA.cines.map(c=>{
    const r = conteos(c), m = meta[c.c] || {};
    const p = porCine[c.c] || {comprar:0, reparar:0, revisar:0, monto:0, n:0};
    return {cod:c.c, n:c.n, p, ideal:m.ideal, disp:m.disp,
            oper: r.total? Math.round(r.ok/r.total*100) : 0};
  }).filter(x=> x.p.n || x.ideal)
    .sort((a,b)=> (b.p.monto - a.p.monto) || (a.oper - b.oper));

  const tot = vivas.reduce((s,a)=> s+(Number(a.monto)||0), 0);
  const totComprar = vivas.filter(a=>a.tipo==='comprar').reduce((s,a)=> s+(Number(a.cant)||1), 0);
  const totReparar = vivas.filter(a=>a.tipo==='reparar').reduce((s,a)=> s+(Number(a.cant)||1), 0);
  const compras = Object.entries(porComp).filter(([,v])=> v.comprar>0)
    .sort((a,b)=> b[1].monto - a[1].monto);
  const enReparacion = Object.entries(porComp).filter(([,v])=> v.reparar>0)
    .sort((a,b)=> b[1].monto - a[1].monto);
  const estadosPlan = EST_PLAN.map(([k,txt])=>({k, txt,
    n:(S.acc||[]).filter(a=>a.estado===k).length,
    v:(S.acc||[]).filter(a=>a.estado===k).reduce((s,a)=> s+(Number(a.monto)||0), 0)}));
  return {t, pctOper, ideal, inst, avance, filasCine, compras, enReparacion, tot,
          totComprar, totReparar, estadosPlan, vivas};
}
/* ===== Ideales runner/ATM y estado de TV por cine ===== */
const TIPOS_TV = [['afichera','Afichera', /aficher/i],
                  ['videowall','Videowall', /videowall|video\s*wall/i],
                  ['menuboard','Menú board', /men[úu]\s*board/i],
                  ['cartelera','Cartelera digital', /cartelera\s*digital/i]];
function itemsConPatron(c, pat){
  const out = [];
  itemsDeCine(c).forEach(({it, area})=>{
    if(pat.test(area||'') || pat.test(it.n||'')) out.push(it);
  });
  return vivos(out).filter(it=> !RETIRADO(it));
}
function estadosDe(items){
  const r = {ok:0, malo:0, falta:0, pend:0, total:0};
  items.forEach(it=>{
    estadosItem(it).forEach(e=>{
      r.total++;
      if(e==='ok') r.ok++;
      else if(e==='falta') r.falta++;
      else if(e==='pend') r.pend++;
      else r.malo++;
    });
  });
  return r;
}
function idealDe(cine, clave){
  const v = (S.ideales[cine]||{})[clave];
  return (v===undefined || v===null || v==='') ? null : Number(v);
}
function setIdeal(cine, clave, valor){
  const n = Number(valor);
  if(!S.ideales) S.ideales = {};
  const o = S.ideales[cine] = S.ideales[cine] || {};
  o[clave] = (valor==='' || isNaN(n)) ? null : n;
  save(); render();
}
function tablasIdealesHTML(){
  const ed = puedeEditarIdeales();
  const inp = (cod, campo, val)=> ed
    ? `<input class="ined" type="number" min="0" step="1" inputmode="numeric"
         value="${val===null? '' : val}" data-ic="${cod}" data-ik="${campo}" aria-label="${campo}">`
    : (val===null? '—' : val);
  const filas = DATA.cines.map(c=>{
    const r = itemsConPatron(c, /^runner$/i);
    const a = itemsConPatron(c, /^atm$/i);
    return {c, rn:{ideal:idealDe(c.c,'runner'), real:r.length},
               at:{ideal:idealDe(c.c,'atm'), real:a.length},
               tv: TIPOS_TV.map(([k, txt, pat])=>{
                 const it = itemsConPatron(c, pat);
                 return {k, txt, n:it.length, e:estadosDe(it)};
               })};
  });
  const saldo = o => o.ideal===null? '<span class="ad">—</span>'
    : `<b style="color:${(o.ideal-o.real)===0? 'var(--ok)':'var(--mal)'}">${o.ideal-o.real}</b>`;
  const pill = t => t.n? `<b style="color:${t.e.ok===t.e.total? 'var(--ok)'
      : (t.e.malo+t.e.falta? 'var(--mal)':'#9a6d00')}">${t.e.ok}/${t.e.total}</b>
      <span class="ad">${t.n} ${t.n===1?'equipo':'equipos'}</span>` : '<span class="ad">—</span>';
  const tR = filas.reduce((s,f)=>({i:s.i+(f.rn.ideal||0), r:s.r+f.rn.real}), {i:0,r:0});
  const tA = filas.reduce((s,f)=>({i:s.i+(f.at.ideal||0), r:s.r+f.at.real}), {i:0,r:0});
  return `
  <div class="tbl-wrap"><table class="tbl">
    <thead><tr><th>Cine</th><th class="num">Ideal runner</th><th class="num">Real</th>
      <th class="num">Saldo</th><th class="num">Ideal ATM</th><th class="num">Real</th>
      <th class="num">Saldo</th></tr></thead>
    <tbody>${filas.map(f=>`<tr><td><b>${f.c.n}</b></td>
      <td class="num">${inp(f.c.c,'runner',f.rn.ideal)}</td>
      <td class="num">${f.rn.real}</td><td class="num">${saldo(f.rn)}</td>
      <td class="num">${inp(f.c.c,'atm',f.at.ideal)}</td>
      <td class="num">${f.at.real}</td><td class="num">${saldo(f.at)}</td></tr>`).join('')}</tbody>
    <tfoot><tr><td><b>Total</b></td><td class="num"><b>${tR.i||'—'}</b></td>
      <td class="num"><b>${tR.r}</b></td><td class="num"><b>${tR.i? tR.i-tR.r : '—'}</b></td>
      <td class="num"><b>${tA.i||'—'}</b></td><td class="num"><b>${tA.r}</b></td>
      <td class="num"><b>${tA.i? tA.i-tA.r : '—'}</b></td></tr></tfoot>
  </table></div>

  <div class="ad" style="margin:16px 0 7px;font-weight:800;color:var(--ink)">Estado de TV por tipo
    <span style="font-weight:400;color:var(--mut)"> — operativos/total · se cuenta solo del inventario</span></div>
  <div class="tbl-wrap"><table class="tbl">
    <thead><tr><th>Cine</th>${TIPOS_TV.map(([,txt])=>`<th class="num">${txt}</th>`).join('')}</tr></thead>
    <tbody>${filas.map(f=>`<tr><td><b>${f.c.n}</b></td>${
      f.tv.map(t=>`<td class="num">${pill(t)}</td>`).join('')}</tr>`).join('')}</tbody>
    <tfoot><tr><td><b>Total</b></td>${TIPOS_TV.map((_,i)=>{
      const n = filas.reduce((s,f)=> s+f.tv[i].n, 0);
      const ok = filas.reduce((s,f)=> s+f.tv[i].e.ok, 0);
      return `<td class="num"><b>${n? ok+'/'+n : '—'}</b></td>`; }).join('')}</tr></tfoot>
  </table></div>`;
}
function queHacerIdeales(){
  return `<details class="grupo card secc" data-qhides ${vista.qhIdeales? 'open':''}
      style="margin-bottom:12px">
    <summary style="cursor:pointer;padding:13px 15px;display:flex;gap:10px;align-items:center;list-style:none">
      <b style="font-size:14.5px">Ideales runner/ATM y estado de TV</b>
      <span class="ad" style="margin-left:auto">por cine</span>
      <span class="gcar" aria-hidden="true">▾</span></summary>
    <div style="padding:0 14px 14px">${tablasIdealesHTML()}</div>
  </details>`;
}
function histMovimiento(){
  const f = Object.keys(S.hist||{}).sort();
  if(f.length<2) return null;
  const a = S.hist[f[f.length-2]], b = S.hist[f[f.length-1]];
  return {a:f[f.length-2], b:f[f.length-1],
    ok:(b.ok||0)-(a.ok||0), falta:(b.falta||0)-(a.falta||0),
    malo:((b.malo||0)+(b.rep||0))-((a.malo||0)+(a.rep||0)),
    pend:(b.pend||0)-(a.pend||0)};
}
function dashboard(){
  const d = datosDashboard();
  const hoy = new Date().toLocaleDateString('es-VE', {day:'2-digit', month:'long', year:'numeric'});
  const filas = d.filasCine;
  const suma = (fn)=> filas.reduce((s,f)=> s+fn(f), 0);
  return `
  <div class="dash-tit">
    <div><h2>Informe para Gerencia</h2>
      <span class="ad">Inventario CINEX · ${hoy} · ${DATA.cines.length} cines</span></div>
    <div class="rowbtn no-print">
      <button class="btn-p" id="dash-pdf">⬇ Descargar PDF</button>
      <button id="dash-share">↗ Compartir</button>
    </div>
  </div>

  <div class="kpis dash-kpi">
    <div><b>${d.pctOper}%</b><span>Operatividad de la cadena</span></div>
    <div><b>${d.avance===null? '—' : d.avance+'%'}</b><span>Avance (ideal vs instalado)</span></div>
    <div><b>${d.t.ok}/${d.t.total}</b><span>Componentes operativos</span></div>
    <div><b>${fmt(d.tot)}</b><span>Inversión planificada</span></div>
    <div><b>${d.totComprar}</b><span>Piezas a comprar</span></div>
    <div><b>${d.totReparar}</b><span>Piezas a reparar</span></div>
  </div>

  <div class="card secc"><div class="hd"><h2>Espacios disponibles por cine</h2>
    <span class="ad">${puedeEditarIdeales()
      ? 'ideal vs instalado · toca Ideal, Instalado u Operativo para editarlo'
      : 'base v3 · ideal vs instalado'}</span></div><div class="bd">
    ${(()=>{ const meta = DATA.meta || {};
      const filas = DATA.cines.map(c=>({c, m:meta[c.c]||{}}))
        .filter(x=> x.m.ideal!==null && x.m.ideal!==undefined)
        .sort((a,b)=> (b.m.disp||0)-(a.m.disp||0));
      if(!filas.length) return '<div class="empty-note">Todavía no hay ideales cargados.</div>';
      const ed = puedeEditarIdeales();
      const inp = (cod, campo, val)=> ed
        ? `<input class="ined" type="number" min="0" step="1" inputmode="numeric"
             value="${(val===null||val===undefined)?'':val}"
             data-mc="${cod}" data-mk="${campo}" aria-label="${campo}">`
        : ((val===null||val===undefined)? '—' : val);
      const tot = filas.reduce((s,x)=>({ideal:s.ideal+(Number(x.m.ideal)||0),
        inst:s.inst+(Number(x.m.inst)||0), oper:s.oper+(Number(x.m.oper)||0),
        disp:s.disp+(Number(x.m.disp)||0)}), {ideal:0,inst:0,oper:0,disp:0});
      const sinMeta = DATA.cines.filter(c=> !meta[c.c] || meta[c.c].ideal===null
        || meta[c.c].ideal===undefined).map(c=>c.n);
      return `<div class="tbl-wrap"><table class="tbl">
        <thead><tr><th>Cine</th><th class="num">Ideal</th><th class="num">Instalado</th>
          <th class="num">Operativo</th><th class="num">Disponibles</th></tr></thead>
        <tbody>${filas.map(x=>`<tr><td><b>${x.c.n}</b></td>
          <td class="num">${inp(x.c.c,'ideal',x.m.ideal)}</td>
          <td class="num">${inp(x.c.c,'inst',x.m.inst)}</td>
          <td class="num">${inp(x.c.c,'oper',x.m.oper)}</td>
          <td class="num"><b style="color:${x.m.disp? 'var(--mal)':'var(--ok)'}">${
            (x.m.disp===null||x.m.disp===undefined)? '—' : x.m.disp}</b></td>
        </tr>`).join('')}</tbody>
        <tfoot><tr><td><b>Total</b></td><td class="num"><b>${tot.ideal}</b></td>
          <td class="num"><b>${tot.inst}</b></td><td class="num"><b>${tot.oper}</b></td>
          <td class="num"><b>${tot.disp}</b></td></tr></tfoot>
      </table></div>
      <div class="ad" style="margin-top:9px">Fuente: POS-Complejos-v3 (29/10/2025) ·
        Disponibles = Ideal − Instalado${
        sinMeta.length? ' · sin dato en esa base: '+sinMeta.join(', ') : ''}</div>`; })()}
    </div></div>

  <div class="card secc"><div class="hd"><h2>Ideales runner/ATM y estado de TV</h2>
    <span class="ad">${puedeEditarIdeales()
      ? 'toca el ideal para editarlo · lo real sale del inventario'
      : 'del inventario por cine'}</span></div>
    <div class="bd">${tablasIdealesHTML()}</div></div>

  <div class="card secc"><div class="hd"><h2>Lo que falta por cine</h2>
    <span class="ad">plan pendiente · mayor inversión primero</span></div><div class="bd">
    <div class="tbl-wrap"><table class="tbl">
      <thead><tr><th>Cine</th><th class="num">Operatividad</th><th class="num">Espacios disp.</th>
        <th class="num">A comprar</th><th class="num">A reparar</th><th class="num">Inversión</th></tr></thead>
      <tbody>${filas.map(f=>`<tr>
        <td><b>${f.n}</b></td>
        <td class="num"><b style="color:${f.oper>=90?'var(--ok)':(f.oper>=70?'#9a6d00':'var(--mal)')}${
          f.oper>=90?';font-weight:800':''}">${f.oper}%</b></td>
        <td class="num">${(f.disp===null||f.disp===undefined)? '—' : f.disp}</td>
        <td class="num">${f.p.comprar||'—'}</td>
        <td class="num">${f.p.reparar||'—'}</td>
        <td class="num"><b>${fmt(f.p.monto)}</b></td></tr>`).join('')}</tbody>
      <tfoot><tr><td><b>Total</b></td><td class="num"><b>${d.pctOper}%</b></td>
        <td class="num">${d.ideal? d.ideal-d.inst : '—'}</td>
        <td class="num"><b>${suma(f=>f.p.comprar)}</b></td>
        <td class="num"><b>${suma(f=>f.p.reparar)}</b></td>
        <td class="num"><b>${fmt(d.tot)}</b></td></tr></tfoot>
    </table></div></div></div>

  <div class="grid2">
    <div class="card secc"><div class="hd"><h2>Qué debo comprar</h2>
      <span class="ad">${d.compras.length} tipos</span></div><div class="bd">
      ${d.compras.length? d.compras.map(([k,v])=>`<div class="filaest">
        <span>${k}</span>
        <span class="bar"><i style="width:${Math.min(100, v.comprar*100/Math.max(1,d.compras[0][1].comprar))}%;background:var(--brand)"></i></span>
        <b>${v.comprar}</b><span class="ad">${v.monto? fmt(v.monto):'sin precio'}</span></div>`).join('')
        : '<div class="empty-note">Nada pendiente de compra ✓</div>'}
    </div></div>

    <div class="card secc"><div class="hd"><h2>Qué está en reparación</h2>
      <span class="ad">${d.enReparacion.length} tipos</span></div><div class="bd">
      ${d.enReparacion.length? d.enReparacion.map(([k,v])=>`<div class="filaest">
        <span>${k}</span>
        <span class="bar"><i style="width:${Math.min(100, v.reparar*100/Math.max(1,d.enReparacion[0][1].reparar))}%;background:#b98200"></i></span>
        <b>${v.reparar}</b><span class="ad">${v.monto? fmt(v.monto):'—'}</span></div>`).join('')
        : '<div class="empty-note">Nada en reparación ✓</div>'}
    </div></div>
  </div>

  <div class="card secc"><div class="hd"><h2>Plan de acción</h2>
    <span class="ad">${(S.acc||[]).length} acciones</span>
    <button class="btn-p no-print" id="dash-add">+ Agregar acción</button></div><div class="bd">
    <div class="tbl-wrap"><table class="tbl">
      <thead><tr><th>Estado</th><th class="num">Acciones</th><th class="num">Monto</th></tr></thead>
      <tbody>${d.estadosPlan.map(e=>`<tr><td>${e.txt}</td>
        <td class="num">${e.n}</td><td class="num">${fmt(e.v)}</td></tr>`).join('')}</tbody>
      <tfoot><tr><td><b>Total</b></td>
        <td class="num"><b>${(S.acc||[]).length}</b></td>
        <td class="num"><b>${fmt((S.acc||[]).reduce((s,a)=> s+(Number(a.monto)||0),0))}</b></td></tr></tfoot>
    </table></div>
    <div class="ad no-print" style="margin-top:9px">El detalle completo está en la pestaña "Qué hacer".</div>
    </div></div>`;
}
function visitas(){
  if(!vista.vis) vista.vis = borradorVisita();
  const v = vista.vis;
  const cine = DATA.cines.find(c=>c.c===v.cine) || DATA.cines[0];
  const areas = ((cine && cine.ar) || []).map(a=>a.a);
  const todas = S.visitas || [];
  const lista = todas.filter(x=> !vista.visFil || vista.visFil==='todas' || x.cine===vista.visFil);
  const cinesVis = [...new Set(todas.map(x=>x.cine))];
  const hechos = CHECK_VISITA.filter(([k])=> v.check[k]).length;
  return `
  <div class="card secc"><div class="hd"><h2>Registrar visita</h2>
    <span class="ad">${AUTOR()}</span></div><div class="bd">
    <div class="vform">
      <label class="campo"><span>Cine</span>
        <select data-vcine>${DATA.cines.map(c=>`<option value="${c.c}" ${c.c===v.cine?'selected':''}>${c.n}</option>`).join('')}</select></label>
      <label class="campo"><span>Fecha</span>
        <input type="date" data-vfecha value="${v.fecha}"></label>
    </div>
    <div class="sb">Áreas recorridas</div>
    <div class="chipsel">${areas.length? areas.map(a=>
      `<button type="button" data-varea="${a}" class="${v.areas.indexOf(a)>=0?'on':''}">${a}</button>`).join('')
      : '<span class="ad">Este cine todavía no tiene áreas.</span>'}</div>
    <div class="sb">Checklist de la visita · ${hechos}/${CHECK_VISITA.length}</div>
    <div class="checks">${CHECK_VISITA.map(([k,t])=>`
      <label class="chk"><input type="checkbox" data-vcheck="${k}" ${v.check[k]?'checked':''}>
        <span>${t}</span></label>`).join('')}</div>
    <div class="sb">Observaciones</div>
    <textarea data-vobs rows="3" placeholder="Qué se vio, qué falta, qué se acordó con el equipo del cine…">${(v.obs||'').replace(/</g,'&lt;')}</textarea>
    <div class="sb">Firma del visitante</div>
    <canvas id="vis-firma" width="640" height="180"></canvas>
    <div class="rowbtn"><button id="vis-limpiar">Limpiar firma</button></div>
    <div class="rowbtn"><button class="btn-p" id="vis-guardar">Guardar visita</button></div>
  </div></div>

  <div class="card secc"><div class="hd"><h2>Historial de visitas</h2>
    <span class="ad">${todas.length} registrada${todas.length===1?'':'s'}</span></div><div class="bd">
    <div class="filters">
      <button data-vfil="todas" class="${!vista.visFil||vista.visFil==='todas'?'on':''}">Todas</button>
      ${cinesVis.map(c=>`<button data-vfil="${c}" class="${vista.visFil===c?'on':''}">${c}</button>`).join('')}
    </div>
    ${lista.length? lista.map(x=>`
      <div class="vitem">
        <div class="vh"><span><b>${fechaBonita(x.fecha)}</b> · ${x.cine} · ${x.visitante||'—'}</span>
          <span class="ad">${(x.check||[]).length}/${CHECK_VISITA.length}</span>
          <button data-vdel="${x.id}">Borrar</button></div>
        ${(x.areas&&x.areas.length)? `<div class="vareas">${x.areas.join(' · ')}</div>`:''}
        ${(x.check&&x.check.length)? `<div class="vchk">${x.check.map(k=>{
            const f = CHECK_VISITA.find(c=>c[0]===k); return f? f[1] : k; }).join(' · ')} ✓</div>`:''}
        ${x.obs? `<div class="vobs">${x.obs.replace(/</g,'&lt;')}</div>`:''}
        ${x.firma? `<img class="vfirma" src="${x.firma}" alt="Firma">`:''}
      </div>`).join('')
      : '<div class="empty-note">Todavía no hay visitas registradas.</div>'}
  </div></div>`;
}
function bindFirma(){
  const c = document.getElementById('vis-firma');
  if(!c || !c.getContext) return;
  const ctx = c.getContext('2d');
  const pintarFondo = ()=>{ ctx.fillStyle='#fff'; ctx.fillRect(0,0,c.width,c.height); };
  pintarFondo();
  ctx.lineWidth = 5; ctx.lineCap='round'; ctx.lineJoin='round'; ctx.strokeStyle='#0a5cad';
  if(vista.vis && vista.vis.firma){
    const img = new Image();
    img.onload = ()=> ctx.drawImage(img,0,0,c.width,c.height);
    img.src = vista.vis.firma;
  }
  let dib = false;
  const pos = e=>{ const r=c.getBoundingClientRect();
    return [(e.clientX-r.left)*c.width/r.width, (e.clientY-r.top)*c.height/r.height]; };
  const cortar = ()=>{ if(!dib) return; dib=false;
    if(vista.vis) vista.vis.firma = c.toDataURL('image/png'); };
  c.onpointerdown = e=>{ e.preventDefault(); dib=true; const [x,y]=pos(e);
    ctx.beginPath(); ctx.moveTo(x,y); try{ c.setPointerCapture(e.pointerId); }catch(err){} };
  c.onpointermove = e=>{ if(!dib) return; const [x,y]=pos(e); ctx.lineTo(x,y); ctx.stroke(); };
  c.onpointerup = cortar;
  c.onpointercancel = cortar;
  c.onpointerleave = cortar;
  c._limpiar = ()=>{ pintarFondo(); if(vista.vis) vista.vis.firma = null; };
}
function guardarVisita(){
  const v = vista.vis;
  if(!v) return;
  if(!v.cine){ flash('Elige el cine de la visita'); return; }
  const hayAlgo = v.areas.length || Object.keys(v.check).some(k=>v.check[k]) || (v.obs||'').trim();
  if(!hayAlgo){ flash('Marca al menos un área, un ítem del checklist o una observación'); return; }
  const reg = {id:'v-'+Date.now(), fecha:v.fecha||fechaHoy(), cine:v.cine,
               visitante:AUTOR(), areas:v.areas.slice(),
               check:CHECK_VISITA.filter(([k])=> v.check[k]).map(([k])=>k),
               obs:(v.obs||'').trim(), firma:v.firma||null,
               ts:new Date().toISOString()};
  S.visitas = S.visitas || [];
  S.visitas.unshift(reg);
  save();
  vista.vis = borradorVisita();
  render();
  flash('Visita registrada ✓');
}
function home(){
  const tot = conteosTotales();
  const pj = k => tot.total? (tot[k]/tot.total*100):0;
  const m = mejora(null);
  const pend = pendientes();
  const den = (m.mej+m.emp+m.sin)||1;

  const ranking = DATA.cines.map(c=>{ const r=conteos(c);
    return {c, inc:r.rep+r.malo, r}; }).sort((a,b)=> b.inc-a.inc);
  const criticos = ranking.slice(0,5).filter(x=>x.inc>0);

  const alertas = [];
  if(pend.length) alertas.push({t:`${pend.length} cambios esperan revisión del coordinador`,
    d: pend.slice(0,3).map(x=>`${x.cine} · ${x.eq} · ${x.comp} (${x.causa||'sin causa'})`).join(' — '),
    b:'rev'});
  if(tot.pend) alertas.push({t:`${tot.pend} componentes todavía sin revisar`,
    d:'Marca el estado en la visita del miércoles / jueves', b:'rev'});
  criticos.forEach(x=> alertas.push({
    t:`${x.c.n}: ${x.inc} componentes con incidencia`,
    d:`${x.r.malo} dañados · ${x.r.rep} en reparación · ${x.r.falta} faltantes · ${x.r.ok} operativos`,
    b:'mal', cine:x.c.c}));

  const tiles = DATA.cines.map(c=>{
    const r = conteos(c);
    const dotc = r.malo? 'var(--mal)' : (r.rep? 'var(--rep)' : (r.pend? 'var(--fal)':'var(--ok)'));
    return `<div class="card cine" data-cine="${c.c}">
      <div class="dot" style="background:${dotc}"></div>
      <div class="nm">${c.n}</div><div class="cd">${c.c}</div>
      <div class="bar">
        <i style="${seg(r.total?r.ok/r.total*100:0)};background:var(--ok)"></i>
        <i style="${seg(r.total?r.rep/r.total*100:0)};background:var(--rep)"></i>
        <i style="${seg(r.total?r.malo/r.total*100:0)};background:var(--mal)"></i>
        <i style="${seg(r.total?r.falta/r.total*100:0)};background:var(--fal)"></i>
        <i class="pendseg" style="${seg(r.total?r.pend/r.total*100:0)}"></i>
      </div>
      <div class="nums"><span><b>${r.ok}</b> OK</span><span><b>${r.rep}</b> rep.</span>
        <span><b>${r.malo}</b> malos</span><span><b>${r.falta}</b> faltan</span>
        ${r.pend?`<span><b>${r.pend}</b> sin revisar</span>`:''}</div>
    </div>`;
  }).join('');

  return `
  <div class="card secc"><div class="hd"><h2>Resumen general</h2>
    <span style="font-size:12px;color:var(--mut)">${tot.total} componentes</span></div>
    <div class="bd">
      <div class="bar" style="margin-top:0;height:9px">
        <i style="${seg(pj('ok'))};background:var(--ok)"></i>
        <i style="${seg(pj('rep'))};background:var(--rep)"></i>
        <i style="${seg(pj('malo'))};background:var(--mal)"></i>
        <i style="${seg(pj('falta'))};background:var(--fal)"></i>
        <i class="pendseg" style="${seg(pj('pend'))}"></i>
      </div>
      <div class="kpis" style="margin-top:9px">
        <button class="kpi-f${vista.gf==='ok'?' on':''}" data-gf="ok"><b style="color:var(--ok)">${tot.ok}</b> operativos</button>
        <button class="kpi-f${vista.gf==='rep'?' on':''}" data-gf="rep"><b style="color:#9a6d00">${tot.rep}</b> reparación</button>
        <button class="kpi-f${vista.gf==='malo'?' on':''}" data-gf="malo"><b style="color:var(--mal)">${tot.malo}</b> dañados</button>
        <button class="kpi-f${vista.gf==='falta'?' on':''}" data-gf="falta"><b>${tot.falta}</b> faltantes</button>
        <button class="kpi-f${vista.gf==='pend'?' on':''}" data-gf="pend"><b>${tot.pend}</b> sin revisar</button>
        ${tot.vacias? `<button class="kpi-f${vista.gf==='vacias'?' on':''}" data-gf="vacias"><b>${tot.vacias}</b> puestos sin equipo</button>`:''}
        ${tot.retirados? `<span><b>${tot.retirados}</b> retirados</span>`:''}
      </div>
    </div></div>
  ${vista.gf? tarjetaFiltro():''}

  ${ROL()!=='soporte'? `<div class="card secc cola-focus">
    <div class="hd"><h2>Cola de revisión</h2>
      ${pend.length? `<span class="badge mal">${pend.length}</span>`:''}
      ${pend.length? `<button data-gsec-foco="aprob">Ver en Gestión</button>`:''}</div>
    <div class="bd">${colaAgrupada(pend.slice(0,8), false)}
      ${pend.length>8? `<div class="ad" style="margin-top:8px">y ${pend.length-8} más en Gestión → Aprobaciones</div>`:''}
    </div></div>` : ''}

  <div class="card secc"><div class="hd"><h2>Mejora vs estado inicial</h2></div><div class="bd">
    <div class="split">
      <i style="${seg(m.mej/den*100)};background:var(--ok)"></i>
      <i style="${seg(m.emp/den*100)};background:var(--mal)"></i>
      <i class="pendseg" style="${seg(m.sin/den*100)}"></i>
    </div>
    <div class="kpis">
      <span><b style="color:var(--ok)">${m.mej}</b> mejoraron</span>
      <span><b style="color:var(--mal)">${m.emp}</b> empeoraron</span>
      <span><b>${m.sin}</b> sin cambio</span>
    </div>
      <div class="legend" style="margin:4px 0 2px">
        <span><i class="sw" style="background:var(--ok)"></i>mejoraron</span>
        <span><i class="sw" style="background:var(--mal)"></i>empeoraron</span>
        <span><i class="sw pendseg"></i>sin cambio</span>
      </div>
    ${sparkline(S.hist)}
  </div></div>

  ${(()=>{ const mov = histMovimiento(); if(!mov) return `
    <div class="card secc"><div class="hd"><h2>¿Cómo se movieron los números?</h2></div><div class="bd">
      <div class="empty-note">Todavía no hay un registro anterior con el que comparar:
      los contadores se guardan cada día que usas el panel.</div></div></div>`;
    const pila = (txt, d, subeBien)=> `<span class="delta ${
      d===0? 'flat' : ((d>0)===!!subeBien? 'up':'down')}">${
      d>0? '▲ +'+d : d<0? '▼ '+d : '• sin cambio'} ${txt}</span>`;
    return `<div class="card secc"><div class="hd"><h2>¿Cómo se movieron los números?</h2>
      <span class="ad">${mov.a} → ${mov.b}</span></div><div class="bd">
      <div class="legend" style="margin-top:0">
        ${pila('operativos', mov.ok, true)}
        ${pila('faltantes', mov.falta, false)}
        ${pila('dañados/reparación', mov.malo, false)}
        ${pila('sin revisar', mov.pend, false)}
      </div></div></div>`; })()}

  ${veMeta()? `<div class="card secc"><div class="hd"><h2>Meta: dejar cada cine al100%</h2>
    ${adminUsuarios()? '<button id="nuevo-cine">＋ Nuevo cine</button>' : ''}</div>
    <div class="bd">
      <div class="ad" style="margin-bottom:9px">Ordenado de lo más atrás a lo más adelantado.
        <b>A comprar</b> = equipo que falta · <b>A reparar</b> = dañado o en reparación.</div>
      <div class="tbl-wrap"><table class="tbl">
        <thead><tr><th>Cine</th><th>Operativo</th><th>A comprar</th><th>A reparar</th>
          <th>Sin revisar</th><th>Costo compra</th><th></th></tr></thead>
        <tbody>${DATA.cines.map(c=>({c, m:metaCine(c)}))
          .sort((a,b)=> a.m.pct - b.m.pct || b.m.comprar - a.m.comprar)
          .map(({c,m})=>`<tr>
            <td><b>${c.n}</b></td>
            <td class="num"><b style="color:${m.pct>=90?'var(--ok)':(m.pct>=70?'#9a6d00':'var(--mal)')}">${m.pct}%</b></td>
            <td class="num">${m.comprar||'—'}</td>
            <td class="num">${m.reparar||'—'}</td>
            <td class="num">${m.pend||'—'}</td>
            <td class="num">${m.costo? fmt(m.costo):'—'}</td>
            <td class="num"><button data-cine="${c.c}">Ver</button></td>
          </tr>`).join('')}</tbody>
      </table></div>
    </div></div>` : ''}

  <div class="card secc"><div class="hd"><h2>Alertas</h2>
    ${pend.length?`<span class="badge rev">${pend.length} por revisar</span>`:''}</div>
    <div class="bd">
      ${alertas.length? alertas.map(a=>`<div class="alerta" ${a.cine?`data-cine="${a.cine}" style="cursor:pointer"`:''}>
          <span class="badge ${a.b}">${a.b==='rev'?'REV':'ALERTA'}</span>
          <span><span class="ti">${a.t}</span><br><span class="de">${a.d}</span></span>
        </div>`).join('')
        : '<div class="empty-note">Sin alertas: todo operativo y revisado.</div>'}
    </div></div>

  <div class="legend">
    <span><i class="sw" style="background:var(--ok)"></i>Operativo</span>
    <span><i class="sw" style="background:var(--rep)"></i>En reparación</span>
    <span><i class="sw" style="background:var(--mal)"></i>Dañado</span>
    <span><i class="sw" style="background:var(--fal)"></i>Falta</span>
    <span><i class="sw pendseg"></i>Sin revisar</span>
  </div>
  <div class="grid">${tiles}</div>
  <div style="margin-top:14px;display:flex;gap:8px;flex-wrap:wrap">
    <button class="btn-p" id="exp-todo">⬇ Inventario (Excel)</button>
    <button id="exp-mov">⬇ Cambios (Excel)</button>
  </div>`;
}

function chipHtml(it, ci, ch){
  const est = (S.est[it.id]||{})[ci] || 'falta';
  const v = (ch.v||'').trim();
  const vacio = !v || v==='0' || v.toUpperCase()==='NO' || /^vaci[oó]$/i.test(v);
  const mostrar = (!vacio && est!=='falta') ? v : CORTO[est];
  return `<div class="chip ${est}" data-item="${it.id}" data-chip="${ci}">
    <span class="cl">${ch.n}</span><span class="cv">${mostrar}</span></div>`;
}

const BORRADO = it => S.borrados.indexOf(it.id)>=0;
const RETIRADO = it => S.retirados[it.id] || null;
function vivos(items){ return items.filter(it=> !BORRADO(it)); }
function nombreDe(it){ return S.nomb[it.id] || it.n || ''; }
function puestoDe(it){ return S.puesto[it.id]!==undefined && S.puesto[it.id]!=='' ? S.puesto[it.id] : (it.p||''); }
function itemsArea(c, nombre){
  const a = c.ar.find(x=>x.a===nombre);
  let items = a? vivos(a.v) : [];
  const nuevos = (nuevosDe(c)[nombre])||[];
  if(nuevos.length) items = items.concat(nuevos);
  const ord = S.orden[c.c+'|'+nombre];
  if(ord){
    const pos = id=>{ const i = ord.indexOf(id); return i<0? 9999 : i; };
    items = items.slice().sort((x,y)=> pos(x.id)-pos(y.id));
  }
  return items;
}
function dondeEsta(id){
  for(const c of DATA.cines){
    for(const a of c.ar){ if(a.v.some(x=>x.id===id)) return {c, area:a.a}; }
    const it = (S.nuevos[c.c]||[]).find(x=>x.id===id);
    if(it) return {c, area:it.area||''};
  }
  return null;
}
function moverEquipo(id, dir){
  const d = dondeEsta(id);
  if(!d) return false;
  const c = d.c, p = {cine:c.c, area:d.area};
  const clave = p.cine+'|'+p.area;
  const items = itemsArea(c, p.area);
  const ids = items.map(i=>i.id);
  const i = ids.indexOf(id), j = i+dir;
  if(i<0 || j<0 || j>=ids.length) return false;
  const t = ids[i]; ids[i] = ids[j]; ids[j] = t;
  S.orden[clave] = ids;
  save();
  return true;
}
let mEd = null;
function abrirEdicion(id){
  const it = findItem(id); if(!it) return;
  const d = dondeEsta(id); if(!d) return;
  mEd = id;
  document.getElementById('ed-sub').textContent = d.c.n + ' · ' + d.area;
  document.getElementById('ed-nombre').value = nombreDe(it);
  document.getElementById('ed-puesto').value = puestoDe(it);
  document.getElementById('ed-modelo').value = modeloDe(it)||'';
  document.getElementById('ed-nuevocomp').value = '';
  const br = document.getElementById('ed-retirar');
  br.textContent = RETIRADO(it)? 'Reincorporar equipo' : 'Retirar equipo';
  const bo = document.getElementById('ed-obsoleto');
  if(bo) bo.textContent = esObsoleto(id)? 'Dejar de ser obsoleto' : 'Marcar como obsoleto';
  pintarCompsEd();
  actualizarPos();
  document.getElementById('modal-ed').classList.add('on');
}
function actualizarPos(){
  if(!mEd) return;
  const d = dondeEsta(mEd); if(!d) return;
  const items = itemsArea(d.c, d.area);
  const i = items.findIndex(x=>x.id===mEd);
  const el = document.getElementById('ed-pos');
  if(el) el.textContent = 'Posición '+(i+1)+' de '+items.length;
}
function cerrarEdicion(){ mEd=null; document.getElementById('modal-ed').classList.remove('on'); }
function pintarCompsEd(){
  const it = findItem(mEd), box = document.getElementById('ed-comps');
  if(!it || !box) return;
  if(!it.c){
    box.innerHTML = '<div class="ad">Equipo simple (un solo estado). Agrega abajo los periféricos si se compone.</div>';
    return;
  }
  box.innerHTML = it.c.map((ch,i)=>{
    const est = (S.est[it.id]||{})[i] || 'falta';
    const crit = ES_CRITICO(ch.n);
    return `<button type="button" class="chipcomp${crit?' crit':''}" data-qcomp="${i}"
      title="${crit?'Afecta la facturación':'Quitar componente'}">
      <span>${ETIQ[ch.n]||ch.n}</span><span class="pill ${est}">${CORTOC[est]}</span><b aria-hidden="true">✕</b></button>`;
  }).join('');
}
function quitarComponente(ci){
  const it = findItem(mEd); if(!it || !it.c || !it.c[ci]) return;
  const nombre = ETIQ[it.c[ci].n] || it.c[ci].n;
  pedir({titulo:'Quitar componente', sub: nombre+' de '+nombreDe(it),
         campos:[], ok:'Quitar componente'}).then(async r=>{
    if(!r) return;
    it.c.splice(ci,1);
    const e = S.est[it.id] || {}, ne = {};
    Object.keys(e).forEach(k=>{
      if(k==='e'){ ne.e = e.e; return; }
      const i = +k;
      if(i===ci) return;
      ne[i>ci? i-1 : i] = e[k];
    });
    S.est[it.id] = ne;
    // el plan se renumera y pierde la acción de ese componente
    const pref = it.id+'|';
    S.acc = S.acc.filter(a=>{
      if(!a.key || a.key.indexOf(pref)!==0) return true;
      const suf = a.key.slice(pref.length);
      if(suf==='est') return true;
      const i = +suf;
      if(isNaN(i)) return true;
      if(i===ci) return false;
      a.key = pref + (i>ci? i-1 : i);
      return true;
    });
    const na = {};
    Object.keys(S.accionComp).forEach(k=>{
      if(k.indexOf(pref)!==0){ na[k]=S.accionComp[k]; return; }
      const i = +k.slice(pref.length);
      if(isNaN(i) || i===ci) return;
      na[pref+(i>ci? i-1:i)] = S.accionComp[k];
    });
    S.accionComp = na;
    guardarComps(it);
    save(); pintarCompsEd(); render();
    flash(nombre+' quitado del equipo ✓');
  });
}
function agregarComponente(){
  const it = findItem(mEd); if(!it) return;
  const input = document.getElementById('ed-nuevocomp');
  const nombre = (input.value||'').trim();
  if(!nombre){ flash('Escribe el nombre del componente'); return; }
  if(!it.c){
    const est0 = (S.est[it.id]||{}).e || 'ok';
    it.c = [{n:nombre, e:est0, v:''}];
    S.est[it.id] = {0:est0};
  } else {
    if(it.c.some(c=> c.n.toLowerCase()===nombre.toLowerCase())){ flash('Ese componente ya existe'); return; }
    it.c.push({n:nombre, e:'pend', v:''});
    S.est[it.id] = S.est[it.id] || {};
    S.est[it.id][it.c.length-1] = 'pend';
  }
  input.value = '';
  guardarComps(it);
  save(); pintarCompsEd(); render();
  flash(nombre+' agregado ✓');
}
async function borrarEquipo(){
  const it = findItem(mEd); if(!it) return;
  const r = await pedir({
    titulo:'Borrar equipo', sub: nombreDe(it)+' — desaparece del panel, de los totales y de la meta. No se puede deshacer.',
    campos:[{id:'ok', label:'Escribe BORRAR para confirmar'}], ok:'Borrar equipo',
    validar: v=> (v.ok||'').trim().toUpperCase()!=='BORRAR' ? 'Escribe BORRAR para confirmar.' : null});
  if(!r) return;
  S.borrados.push(mEd);
  delete S.est[mEd]; delete S.notas[mEd]; delete S.mod[mEd]; delete S.retirados[mEd];
  S.acc = S.acc.filter(a=> !(a.key && a.key.indexOf(mEd+'|')===0));
  const dBor = dondeEsta(mEd) || {c:{c:''}, area:''};
  S.mov.push({ts:new Date().toISOString(), id:mEd, cine:dBor.c.c||'', area:dBor.area||'',
              eq:nombreDe(it), comp:'Borrado de equipo', de:'Activo', a:'Borrado',
              causa:'', rev: revDe(esCentroDeDatos(mEd)), autor:AUTOR(), tipoMov:'borrado', ref:mEd});
  save(); cerrarEdicion(); render();
  flash(revDe(esCentroDeDatos(mEd))==='pendiente'
    ? 'Equipo borrado ✓ · va a revisión del coordinador'
    : 'Equipo borrado ✓ · pasó directo');
}
async function retirarEquipo(){
  const it = findItem(mEd); if(!it) return;
  const ya = RETIRADO(it);
  if(ya){                       // reincorporar
    delete S.retirados[mEd];
    save(); cerrarEdicion(); render();
    flash('Equipo reincorporado ✓');
    return;
  }
  const r = await pedir({
    titulo:'Retirar equipo',
    sub: nombreDe(it)+' — sale de totales, meta y plan. Justifica el retiro:',
    campos:[{id:'motivo', label:'Motivo',
             placeholder:'Ej. Mudanza, remodelación, donación, se cambió por otro…'}],
    ok:'Retirar equipo',
    validar: v=> !(v.motivo||'').trim() ? 'Justifica el retiro para dejarlo en la bitácora.' : null});
  if(!r) return;
  S.retirados[mEd] = {motivo:r.motivo.trim(), ts:new Date().toISOString(), autor:AUTOR()};
  S.acc = S.acc.filter(a=> !(a.key && a.key.indexOf(mEd+'|')===0));
  const dRet = dondeEsta(mEd) || {c:{c:''}, area:''};
  S.mov.push({ts:new Date().toISOString(), id:mEd, cine:dRet.c.c||'', area:dRet.area||'',
              eq:nombreDe(it), comp:'Retiro de equipo', de:'Activo', a:'Retirado',
              causa:r.motivo.trim(), rev: revDe(esCentroDeDatos(mEd)), autor:AUTOR(),
              tipoMov:'retiro', ref:mEd});
  save(); cerrarEquipo(); render();
  flash('Equipo retirado ✓ '+r.motivo.trim()+(
    revDe(esCentroDeDatos(mEd))==='pendiente' ? ' · va a revisión del coordinador' : ''));
}
function guardarEdicion(){
  const it = findItem(mEd); if(!it) return;
  const n = (document.getElementById('ed-nombre').value||'').trim();
  if(!n){ flash('El nombre no puede quedar vacío'); return; }
  const pu = (document.getElementById('ed-puesto').value||'').trim();
  const mo = (document.getElementById('ed-modelo').value||'').trim();
  S.nomb[mEd] = n;
  if(pu) S.puesto[mEd] = pu; else delete S.puesto[mEd];
  S.mod[mEd] = mo;
  save(); cerrarEdicion(); render();
  flash('Equipo actualizado ✓');
}
const ES_CRITICO = n => n==='Terminal POS' || n==='Impresora fiscal' || n==='CPU';
function movsDe(id, ci){
  const it = findItem(id); if(!it) return [];
  const d = dondeEsta(id); if(!d) return [];
  const ch = it.c && it.c[ci];
  const compNombre = ch? (ETIQ[ch.n]||ch.n) : null;
  return (S.mov||[]).filter(m=>{
      if(m.id && m.id!==id) return false;
      if(m.cine!==d.c.c || m.area!==d.area) return false;
      if(m.eq && m.eq!==nombreDe(it)) return false;
      if(ch && m.comp && m.comp!==compNombre && m.comp!==ch.n) return false;
      return true;
    }).sort((a,b)=> String(b.ts||'').localeCompare(String(a.ts||'')));
}
function fechaCorta(ts){ if(!ts) return ''; const f=String(ts).slice(0,10).split('-');
  return f.length===3? f[2]+'/'+f[1] : ''; }
/* Línea "⚠ causa · fecha" bajo el componente: es la puerta al detalle */
const ES_DISCO = n => /disco/i.test(n||'');
const DISCO_EST = ['ok','deg','mal'];
const DISCO_TXT = {ok:'bueno', deg:'degradado', mal:'dañado'};
function discosDe(id, ci){
  const key = id+'|'+ci;
  if(!S.discos) S.discos = {};
  if(!S.discos[key]) S.discos[key] = ['ok','ok','ok','ok'];   //4 por defecto
  return S.discos[key];
}
function discosHtml(id, ci){
  const arr = discosDe(id, ci);
  return `<div class="discos">${arr.map((e,i)=>
    `<button type="button" class="disco ${e}" data-disco="${id}|${ci}|${i}"
      title="Disco ${i+1}: ${DISCO_TXT[e]||e} — toca para cambiarlo"></button>`).join('')}
    <button type="button" class="dad" data-det="${id}|${ci}"
      title="Ver detalle: agregar o quitar discos">${arr.length} discos ▸</button></div>`;
}
function detalleLinea(it, ci){
  const est = (S.est[it.id]||{})[ci];
  const movs = movsDe(it.id, ci);
  if(!movs.length && (est==='ok' || est==='pend' || est==='falta')) return '';
  const m = movs[0];
  const causa = (m && m.causa) ? m.causa
              : (m ? ((LABEL[m.a]||m.a||'cambio')+' · sin causa') : 'sin causa anotada');
  const quien = m && m.autor ? m.autor.split(' ')[0] : '';
  const fecha = m ? fechaCorta(m.ts) : '';
  return `<button type="button" class="dlinea ${est||''}" data-det="${it.id}|${ci}"
      title="Ver detalle: quién lo marcó, por qué y qué sigue">
      ⚠ ${causa}${quien? ' · '+quien:''}${fecha? ' · '+fecha:''}</button>`;
}
/* ===== Detalle de incidencia: quién lo marcó, por qué y qué sigue ===== */
function abrirDetalle(id, ci){
  const it = findItem(id); if(!it) return;
  const d = dondeEsta(id); if(!d) return;
  if(ci!==undefined && ci!==null){              // coherencia: si está ok, cerrar plan
    if(estadoActualDe(id, ci)==='ok' && cerrarPlanSiOk(id, ci)) save();
  }
  const tit = document.getElementById('dt-tit');
  const sub = document.getElementById('dt-sub');
  const estBox = document.getElementById('dt-estado');
  const hist = document.getElementById('dt-hist');
  const plan = document.getElementById('dt-plan');
  if(!tit) return;
  tit.textContent = nombreDe(it);
  sub.textContent = d.c.n+' · '+d.area+(puestoDe(it)? ' · puesto '+puestoDe(it):'');
  const comps = it.c || [];
  const estDe = k => (S.est[it.id]||{})[k] || (comps[k]? comps[k].e : (it.e||'pend'));

  if(ci===undefined || ci===null){                 // --- lista: qué está malo aquí ---
    const filas = comps.map((ch,i)=>({ch, i, e:estDe(i)})).filter(x=> x.e!=='ok');
    estBox.innerHTML = filas.length? `<div class="dlist">${filas.map(x=>{
      const m = movsDe(id, x.i)[0];
      return `<button class="drow" data-det="${id}|${x.i}">
        <span class="pill ${x.e}">${CORTOC[x.e]}</span>
        <span class="dnm">${ETIQ[x.ch.n]||x.ch.n}</span>
        <span class="ad">${m? (m.causa||'sin causa') : 'así vino del inventario'}</span></button>`;}).join('')}</div>`
      : `<div class="empty-note">Todo operativo en este equipo ✓</div>`;
    hist.innerHTML = ''; plan.innerHTML = '';
    document.getElementById('modal-det').classList.add('on');
    return;
  }

  const ch = comps[ci];
  const e = estDe(ci);
  tit.textContent = ch? (ETIQ[ch.n]||ch.n) : nombreDe(it);
  estBox.innerHTML = `<div class="dest"><span class="pill ${e}">${LABEL[e]||e}</span>
    <span class="ad">${ch? '' : 'equipo simple'}</span></div>`;

  const movs = movsDe(id, ci);
  hist.innerHTML = movs.length? `<div class="dhist">${movs.slice(0,8).map(m=>`
      <div class="dhrow"><b>${fechaCorta(m.ts)} ${String(m.ts||'').slice(11,16)}</b>
        <span>${m.de||'—'} → <b>${m.a||'—'}</b></span>
        ${m.causa? `<span class="dcau">${m.causa}</span>`:''}
        <span class="ad">${m.autor||''}${m.rev==='pendiente'? ' · esperando aprobación':''}</span>
      </div>`).join('')}</div>`
    : (it.o? `<div class="dhist"><div class="dhrow"><b>Observación del inventario</b>
        <span>${String(it.o).replace(/</g,'&lt;').slice(0,400)}</span></div></div>`
      : '<div class="empty-note">Sin movimientos: así vino del inventario.</div>');

  const nombre = ch? (ETIQ[ch.n]||ch.n) : nombreDe(it);
  if(ES_DISCO(nombre)){
    const arr = discosDe(id, ci);
    estBox.innerHTML += `<div class="discos" style="margin-top:9px">${arr.map((e,i)=>
      `<span class="disco ${e}" title="Disco ${i+1}: ${DISCO_TXT[e]}"></span>`).join('')}
      <span class="dad">${arr.length} discos</span></div>
      <div class="rowbtn" style="margin-top:9px">
        <button data-dadd="${id}|${ci}">+ Agregar disco</button>
        <button data-ddel="${id}|${ci}">Quitar disco</button></div>`;
  }
  const acc = (S.acc||[]).find(a=> a.key===id+'|'+ci) ||
              (S.acc||[]).find(a=> a.cine===d.c.c && a.area===d.area &&
                 a.eq===nombreDe(it) && a.comp===nombre);
  const etapa = acc && EST_PLAN.find(x=>x[0]===acc.estado);
  plan.innerHTML = acc? `<div class="dplan">
      <span class="badge ${acc.tipo==='reparar'?'mal':'rev'}">${acc.tipo==='reparar'?'REPARAR':'COMPRAR'}</span>
      <span>${acc.cant||1} · ${etapa? etapa[1] : acc.estado}</span>
      <b>${(acc.monto!==''&&acc.monto!==undefined)? fmt(acc.monto):'sin precio'}</b>
      ${acc.nota? `<div class="ad">${acc.nota}</div>`:''}</div>`
    : '<div class="empty-note">Sin acción en el plan para este componente.</div>';

  document.getElementById('modal-det').classList.add('on');
}
function itemHtml(it){
  const vacio = !!it.x;
  const ests = estadosItem(it);
  const p = partes(it.id);
  const revAqui = pendientes().some(x=> x.id===it.id ||
      (!x.id && x.cine===p.cine && x.area===p.area && x.eq===it.n));
  const cls = revAqui ? 'rv' : (ests.includes('malo') ? 'rp' : '');
  const nota = S.notas[it.id];
  const mod = modeloDe(it);

  if(it.c){
    const malos = ests.filter(s=>s==='malo'||s==='rep').length;
    const tienePinpad = it.c.some(c=>c.n==='Pinpad');
    const tarjeta = (nombre, span)=>{
      const ci = it.c.findIndex(ch=>ch.n===nombre);
      if(ci<0) return '';
      const ch = it.c[ci];
      const est = (S.est[it.id]||{})[ci] || 'falta';
      const val = valorComp(it, ci, ch);
      const esCpu = nombre==='Terminal POS';
      const crit = ES_CRITICO(nombre);
      const campoVtid = nombre==='Pinpad' ? vtidHtml(it) : '';
      return `<div class="mc ${span} ${est}${crit?' crit':''}" data-comp="${it.id}|${ci}"
          ${crit? 'title="Componente crítico: afecta la facturación"' : ''}>
        <div class="mhd">
          <span class="icow">${icono(esCpu? 'cpu' : (ETIQ[nombre]||nombre))}</span>
          <span class="mnm">${ETIQ[nombre]||nombre}${crit?'<i class="ptoe" aria-hidden="true"></i>':''}</span>
          <span class="pill ${est}">${CORTOC[est]}</span>
        </div>
        ${nombre==='VTID' && tienePinpad ? '' :
          `<div class="mv ${val?'':'vac'}" ${esCpu? `data-mod="${it.id}"` : `data-cmod="${it.id}|${ci}"`}>${val||'+ Modelo'}</div>`}
        ${campoVtid}
        ${ES_DISCO(nombre)? discosHtml(it.id, ci) : ''}
        ${detalleLinea(it, ci)}
      </div>`;
    };
    const tarjetas =
      ORDEN_MOST.filter(([n])=> it.c.some(ch=>ch.n===n) &&
                       !(n==='VTID' && tienePinpad))
        .map(([n, span])=> tarjeta(n, span)).join('')
      + it.c.filter(ch=> !ORDEN_MOST.some(([n])=> n===ch.n) &&
                       !(ch.n==='VTID' && tienePinpad))
        .map(ch=> tarjeta(ch.n, 'm2')).join('');
    return `<div class="eq ${vacio?'empty':''} ${cls}" data-eq="${it.id}">
      <div class="eh">
        <span class="icow">${icono(nombreDe(it)+' '+(it.m||'')+' '+mod)}</span>
        <span class="etit"><span class="en" data-edit="${it.id}" title="Editar nombre y posición">${nombreDe(it)}</span>
          <span class="em">${puestoDe(it)? 'Puesto '+puestoDe(it) : ''}</span></span>
        ${malos? `<button class="badge mal" data-incid="${it.id}"
            title="Ver qué está malo en este equipo">${malos} incid.</button>`:''}
        ${revAqui? `<span class="badge rev">REV</span>`:''}
        <span class="acts">
          <button data-note="${it.id}" title="Nota">✎</button>
          <button data-ok="${it.id}" title="Todo operativo">✓</button>
        </span>
      </div>
      ${RETIRADO(it)? `<span class="badge ret">RETIRADO · ${RETIRADO(it).motivo||''}</span>`:''}
      ${esObsoleto(it.id)? `<span class="badge obs" title="${((S.obsoletos[it.id]||{}).nota||'')+' · '+((S.obsoletos[it.id]||{}).autor||'')}">OBSOLETO</span>`:''}
      <div class="most">${tarjetas}</div>
    </div>`;
  }
  const est = (S.est[it.id]||{}).e || 'ok';
  return `<div class="eq ${cls}" data-eq="${it.id}">
    <div class="eh">
      <span class="icow">${icono(nombreDe(it)+' '+mod)}</span>
      <span class="etit"><span class="en" data-edit="${it.id}" title="Editar nombre y posición">${nombreDe(it)}</span>
        <span class="em ${mod?'':'vac'}" data-mod="${it.id}">${mod? mod : '+ Modelo'}</span></span>
      <span class="pill ${est}" data-single="${it.id}">${LABEL[est]}</span>
      ${revAqui? `<span class="badge rev">REV</span>`:''}
      ${esObsoleto(it.id)? `<span class="badge obs">OBSOLETO</span>`:''}
      <span class="acts"><button data-note="${it.id}">✎</button></span>
    </div>
    ${RETIRADO(it)? `<span class="badge ret">RETIRADO · ${RETIRADO(it).motivo||''}</span>`:''}
  </div>`;
}

function cineVista(c){
  const r = conteos(c);
  const m = mejora(c);
  const den = (m.mej+m.emp+m.sin)||1;
  const nuevos = nuevosDe(c);
  let areas = [];
  c.ar.forEach(a=> areas.push({nombre:a.a, items:itemsArea(c, a.a), ro:a.ro||''}));
  Object.keys(nuevos).forEach(k=>{ if(!areas.find(a=>a.nombre===k)) areas.push({nombre:k, items:nuevos[k], ro:''}); });

  // filtro por área
  if(vista.areaF && vista.areaF!=='todas')
    areas = areas.filter(a=> a.nombre===vista.areaF);

  const filtrado = it => {
    if(vista.filtro==='all') return true;
    const ests = estadosItem(it);
    if(vista.filtro==='inc') return ests.some(s=>s==='malo'||s==='rep');
    if(vista.filtro==='falta') return ests.some(s=>s==='falta');
    return true;
  };

  const htmlAreas = areas.map(a=>{
    const vis = a.items.filter(filtrado);
    if(!vis.length && vista.filtro!=='all') return '';
    const cA = {ok:0,rep:0,malo:0,falta:0,pend:0,total:0};
    vivos(a.items).forEach(it=>{
      if(it.x || RETIRADO(it)) return;
      estadosItem(it).forEach(s=>{ cA[s]++; cA.total++; });
    });
    return `<div class="card area">
      <div class="hd"><h2>${nombreArea(c.c, a.nombre)}
          <button class="mini" data-arenom="${c.c}|${a.nombre}"
            title="Cambiar el nombre de esta área">✎</button></h2>
        <span class="c">${cA.ok}/${cA.total} OK</span>
        <button data-ok-area="${a.nombre}" title="Marcar área operativa">✓ todo</button>
        <button class="mini danger" data-areadel="${c.c}|${a.nombre}"
          title="Borrar esta área del panel">🗑</button>
      </div>
      ${a.ro?`<div class="ro">${a.ro}</div>`:''}
      <div class="body">
        ${vis.length? vis.map(itemHtml).join('') : '<div class="empty-note">Sin equipos en esta área todavía.</div>'}
        <div class="addrow"><button data-add="${a.nombre}" class="btn-add">＋ Agregar equipo</button></div>
      </div>
    </div>`;
  }).join('');

  const todasAreas = [];
  c.ar.forEach(a=> todasAreas.push({nombre:a.a, items:itemsArea(c, a.a)}));
  Object.keys(nuevos).forEach(k=>{ if(!todasAreas.find(a=>a.nombre===k)) todasAreas.push({nombre:k, items:nuevos[k]}); });
  const nEquipos = areas.reduce((s,a)=> s + vivos(a.items).filter(it=>!RETIRADO(it)).length, 0);
  const nComponentes = r.total;
  const chipsArea = `<div class="gbar" role="group" aria-label="Filtrar por área">
    <button data-areaf="todas" class="${!vista.areaF||vista.areaF==='todas'?'on':''}">Todas (${todasAreas.length})</button>
    ${todasAreas.map(a=>`<button data-areaf="${a.nombre}"
       class="${vista.areaF===a.nombre?'on':''}">${a.nombre} (${a.items.length})</button>`).join('')}
  </div>`;

  return `
  <div class="subbar">
    <button class="back" id="volver">← Cines</button>
    <strong style="font-size:16px">${c.n}</strong>
    <span style="font-size:11px;color:var(--mut)">${c.c}</span>
    <span style="flex:1"></span>
    <button class="btn-p" id="exp-cine">⬇ Excel</button>
  </div>
  <div class="counts counts7">
    <div><b>${nEquipos}</b><span>Equipos</span></div>
    <div><b>${nComponentes}</b><span>Componentes</span></div>
    <div><b style="color:var(--ok)">${r.ok}</b><span>Operativos</span></div>
    <div><b style="color:#9a6d00">${r.rep}</b><span>Reparación</span></div>
    <div><b style="color:var(--mal)">${r.malo}</b><span>Dañados</span></div>
    <div><b style="color:#5d6b78">${r.falta}</b><span>Faltantes</span></div>
    <div><b style="color:#5d6b78">${r.pend}</b><span>Sin revisar</span></div>
  </div>
  ${chipsArea}
  <div class="card secc" style="margin-bottom:12px"><div class="hd"><h2>Mejora de este cine</h2></div>
    <div class="bd">
      <div class="split">
        <i style="${seg(m.mej/den*100)};background:var(--ok)"></i>
        <i style="${seg(m.emp/den*100)};background:var(--mal)"></i>
        <i class="pendseg" style="${seg(m.sin/den*100)}"></i>
      </div>
      <div class="kpis"><span><b style="color:var(--ok)">${m.mej}</b> mejoraron</span>
        <span><b style="color:var(--mal)">${m.emp}</b> empeoraron</span>
        <span><b>${m.sin}</b> sin cambio</span></div>
      <div class="legend" style="margin:4px 0 2px">
        <span><i class="sw" style="background:var(--ok)"></i>mejoraron</span>
        <span><i class="sw" style="background:var(--mal)"></i>empeoraron</span>
        <span><i class="sw pendseg"></i>sin cambio</span>
      </div>
    </div></div>
  <div class="filters">
    <button data-f="all" class="${vista.filtro==='all'?'on':''}">Todos</button>
    <button data-f="inc" class="${vista.filtro==='inc'?'on':''}">Con incidencias</button>
    <button data-f="falta" class="${vista.filtro==='falta'?'on':''}">Faltantes</button>
  </div>
  ${htmlAreas}
  <div class="addrow" style="margin-top:6px">
    <input type="text" id="nueva-area" placeholder="Agregar área (ej. Runner)…">
    <button id="btn-area">+ Área</button>
  </div>`;
}

/* ================= PERFIL ================= */
function pintarNombres(rol, sel){
  const cont = document.getElementById('p-nombres');
  if(!cont) return;
  if(!rol){ cont.innerHTML=''; return; }
  cont.innerHTML = (USU()[rol]||[]).map(n=>
    `<button data-pnombre="${n}" class="${n===sel?'on':''}">${n}</button>`).join('');
}
function abrirPerfil(){
  if(!S.perfil) return;                       // sin perfil la pantalla de acceso ya está visible
  if(tabsPermitidos().indexOf('gestion')<0){  // módulo sin Gestión: cuenta rápida
    pedir({
      titulo:'Tu cuenta',
      sub: AUTOR()+' · '+(ROL_TXT[ROL()]||''),
      campos:[
        {id:'op', type:'select', label:'Qué quieres hacer', value:'salir',
         opciones:[['salir','Cambiar de usuario'],['clave','Cambiar mi clave']]},
        {id:'clave', type:'password', label:'Nueva clave (déjala vacía si solo cambias de usuario)',
         autocomplete:'new-password'}
      ],
      ok:'Continuar'
    }).then(async r=>{
      if(!r) return;
      if(r.op==='clave'){
        const k = (r.clave||'').trim();
        if(k.length<3){ flash('La clave debe tener al menos3 caracteres'); return; }
        S.claves[AUTOR()] = hashClave(k);
        save(); flash('Clave actualizada ✓');
        return;
      }
      S.perfil = null; accesoSel = null;
      save(); render(); flash('Saliste del panel ✓');
    });
    return;
  }
  scrollObj = 0;
  vista.tab = 'gestion'; vista.gseccion = 'usuarios';
  render();
}
function cerrarPerfil(){ /* la pantalla de acceso no se cierra: sin perfil no hay panel */ }

/* ================= AGREGAR EQUIPO CON COMPONENTES ================= */
const COMP_CAT = ['CPU','Monitor principal','Monitor secundario','Teclado','Mouse',
  'Impresora fiscal','Impresora térmica','Dispositivo fiscal','Escáner','Gaveta','Pinpad','VTID',
  'UPS/Regulador','Punto de red','Tablet','TV','Switch / red','Servidor'];
const PLANTILLAS = {
  pos: ['CPU','Monitor principal','Monitor secundario','Impresora fiscal','Dispositivo fiscal',
        'Escáner','Gaveta','Pinpad','VTID','UPS/Regulador','Punto de red'],
  pc:  ['CPU','Monitor principal','Teclado','Mouse'],
  tv:  ['TV'],
  simple: [],
  custom: null
};
let mEq = {area:'', plant:'simple', comps:[]};
function pintarPlantillas(){
  document.querySelectorAll('[data-plant]').forEach(b=>
    b.classList.toggle('on', b.dataset.plant===mEq.plant));
  const box = document.getElementById('e-comps');
  const ver = mEq.plant==='custom';
  box.style.display = ver? 'flex' : 'none';
  const libre = document.getElementById('e-libre-row');
  if(libre) libre.style.display = ver? 'flex' : 'none';
  if(ver){
    box.innerHTML = COMP_CAT.map(c=>
      `<button data-compadd="${c}">${c}</button>`).join('');
  }
  if(ver){
    box.querySelectorAll('[data-compadd]').forEach(b=>
      b.classList.toggle('on', mEq.comps.indexOf(b.dataset.compadd)>=0));
  }
}
function abrirEquipo(area){
  mEq = {area, plant:'simple', comps:[]};
  document.getElementById('e-area').textContent = 'Área: '+area;
  document.getElementById('e-nombre').value = '';
  document.getElementById('e-modelo').value = '';
  document.getElementById('e-comps').innerHTML = '';
  pintarPlantillas();
  document.getElementById('modal-e').classList.add('on');
}
function cerrarEquipo(){ document.getElementById('modal-e').classList.remove('on'); }
function crearEquipo(){
  const c = DATA.cines.find(x=>x.c===vista.cine);
  if(!c){ cerrarEquipo(); return; }
  const nombre = (document.getElementById('e-nombre').value||'').trim();
  if(!nombre){ flash('Escribe el nombre del equipo'); return; }
  const modelo = (document.getElementById('e-modelo').value||'').trim();
  const comps = mEq.plant==='custom' ? mEq.comps.slice()
               : (PLANTILLAS[mEq.plant]||[]).slice();
  const id = 'add-'+Date.now();
  const it = {id, area:mEq.area, n:nombre, d:modelo, o:''};
  if(comps.length){
    it.c = comps.map(n=>({n, e:'pend', v:''}));
    S.est[id] = {};
    it.c.forEach((ch,i)=> S.est[id][i]='pend');
  } else {
    it.e = 'pend';
    S.est[id] = {e:'pend'};
  }
  (S.nuevos[c.c] = S.nuevos[c.c]||[]).push(it);
  S.mov.push({ts:new Date().toISOString(), id:it.id, cine:c.c, area:mEq.area,
              eq:nombre, comp:'Alta de equipo', de:'—', a:'Nuevo equipo',
              causa:'', rev: revDe(esCentroDeDatos(it.id)), autor:AUTOR(), tipoMov:'alta', ref:it.id});
  save(); cerrarEquipo(); render();
  const revAlta = revDe(esCentroDeDatos(it.id));
  flash(nombre+' agregado'+(comps.length? ' con '+comps.length+' componentes':'')+
        ' ✓'+(revAlta==='pendiente' ? ' · va a revisión del coordinador' : ' · pasó directo'));
}

/* ================= PLAN DE TRABAJO (QUÉ HACER) ================= */
/* Precios oficiales — tabla de cotizaciones enviada por Oriana,
   columna "Precio unitario" (se mantiene lo que ya estaba si esta no lo trae). */
const PRECIOS = {
  'Terminal POS': 320,            // MiniPC i58va Gen, 8GB DDR4,128 M.2
  'CPU': 320,
  'Monitor principal': 290,       // Pantalla Táctil15.6"
  'Monitor secundario': 48,       // Monitor18,5" Vista Cliente
  'Impresora fiscal': 1269.5,     // HKA80A + Dispositivo Fiscal (va incluido)
  'Dispositivo fiscal': '',       // va dentro de la impresora fiscal
  'Lector de barras': 48,         // Lector QR1D/2D Domo
  'Escáner': 48,
  'Gaveta': 53,                   // Gavetas de Dinero
  'UPS/Regulador': 65,            // UPS500va (taquillas)
  'Regulador de TV': 22,          // Regulador de Voltaje (TV)
  'Pinpad': '',                   // sigue sin cotizar
  'VTID': '',
  'Punto de red': ''
};
// Estación completa = CPU + impresora + gaveta + escáner + monitor
const PRECIO_ESTACION = (PRECIOS['Terminal POS']||0) + (PRECIOS['Impresora fiscal']||0)
  + (PRECIOS['Gaveta']||0) + (PRECIOS['Lector de barras']||0)
  + (PRECIOS['Monitor secundario']||0);
const TIPO_EST = {malo:'reparar', rep:'reparar', falta:'comprar'};
const EST_PLAN = [['pendiente','Pendiente'],['cotizado','Cotizado'],
                  ['aprobado','Aprobado por gerencia'],['comprado','Comprado'],
                  ['ejecutado','Ejecutado']];
const fmt = n => '$'+Number(n||0).toLocaleString('es-VE',{maximumFractionDigits:0});
const CATALOGO = ['CPU','Monitor principal','Monitor secundario','Impresora fiscal',
  'Dispositivo fiscal','Escáner','Gaveta','Pinpad','UPS/Regulador','Punto de red','TV','Tablet',
  'Estación completa'];
function precioDe(n){
  if(S.precios[n]!==undefined && S.precios[n]!=='') return S.precios[n];
  // la acción se guarda como "Estación completa (puesto3)"
  if(n==='Estación completa' || n.indexOf('Estación completa')===0) return PRECIO_ESTACION;
  if(PRECIOS[n]!==undefined) return PRECIOS[n];
  const alt = n==='CPU' ? 'Terminal POS' : (n==='Escáner' ? 'Lector de barras' : null);
  return (alt && PRECIOS[alt]!==undefined) ? PRECIOS[alt] : '';
}
const hashClave = s=>{ let h=5381; for(const c of String(s)) h=(((h<<5)+h)>>>0)+c.charCodeAt(0);
  return (h>>>0).toString(16); };
function itemsDeCine(c){
  const out = [];
  c.ar.forEach(a=> vivos(a.v).forEach(it=> out.push({it, area:a.a})));
  (S.nuevos[c.c]||[]).forEach(it=> out.push({it, area:it.area}));
  return out;
}
function nuevaAccion(o){
  S.acc.push(Object.assign({
    key:'m-'+Date.now()+'-'+Math.random().toString(36).slice(2,6),
    tipo:'comprar', monto:'', estado:'pendiente',
    autor:AUTOR(), ts:new Date().toISOString()}, o));
}
/* Repara claves rotas y quita acciones duplicadas (mismo equipo·puesto·componente). */
function repararAcc(){
  if(!Array.isArray(S.acc) || !S.acc.length) return 0;
  const porRef = {};
  DATA.cines.forEach(c=> c.ar.forEach(area=> vivos(area.v).forEach(it=>{
    if(!it.id) return;
    porRef[[c.c, area.a, it.n||'', String(it.p||'')].join('\u00a7')] = it;
  })));
  const vistas = {}, muertos = [];
  const orden = ['pendiente','cotizado','aprobado','comprado','ejecutado'];
  S.acc.forEach(a=>{
    // clave canónica: id|índice de componente (id|est para estaciones sin equipo)
    const it = porRef[[a.cine, a.area, a.eq||'', String(a.puesto||'')].join('\u00a7')];
    if(it){
      let k = null;
      if(a.comp==='Estación completa' && it.x) k = it.id+'|est';
      else if(it.c){
        const i = it.c.findIndex(z=> (ETIQ[z.n]||z.n)===a.comp);
        if(i>=0) k = it.id+'|'+i;
      } else k = it.id+'|e';
      if(k) a.key = k;
    }
    const k = [a.cine, a.area, String(a.puesto||''), a.eq||'', a.comp].join('\u00a7');
    const queQueda = vistas[k];
    if(queQueda){
      if((queQueda.monto===''||queQueda.monto===undefined) && a.monto!=='' && a.monto!==undefined)
        queQueda.monto = a.monto;
      if(!queQueda.nota && a.nota) queQueda.nota = a.nota;
      if(orden.indexOf(queQueda.estado) < orden.indexOf(a.estado)) queQueda.estado = a.estado;
      muertos.push(a);
    } else vistas[k] = a;
  });
  if(muertos.length) S.acc = S.acc.filter(a=> muertos.indexOf(a)<0);
  return muertos.length;
}

/* Montos que se guardaron con la tabla de precios ANTERIOR: si todavía traen
   ese número exacto, se actualizan al precio oficial nuevo (si lo hubo). */
const PRECIOS_ANTERIORES = {'Terminal POS':800, 'CPU':800, 'Impresora fiscal':1017,
  'Lector de barras':45, 'Escáner':45, 'Gaveta':100, 'Monitor secundario':120,
  'Estación completa':2082};
function actualizarMontosViejos(){
  let c = 0;
  (S.acc||[]).forEach(a=>{
    const antes = PRECIOS_ANTERIORES[a.comp];
    if(antes===undefined || Number(a.monto)!==antes) return;
    const p = precioDe(a.comp);
    if(p!=='' && p!==undefined && Number(p)!==Number(a.monto)){ a.monto = p; c++; }
  });
  return c;
}
function sincronizarPlan(){
  actualizarMontosViejos();
  const quitados = repararAcc();
  let n = quitados;      // si solo se deduplicó, hay que guardar igual
  // montos vacíos se completan con el catálogo (los escritos a mano no se tocan)
  S.acc.forEach(a=>{
    if(a.comp && a.comp.indexOf('Estación completa (puesto')===0){
      // unificar: el puesto vive en a.puesto, no en el nombre del componente
      if(!a.puesto){ const m = a.comp.match(/puesto\s*(\d+)/i); if(m) a.puesto = Number(m[1]); }
      a.comp = 'Estación completa';
    }
    if(a.monto==='' || a.monto===null || a.monto===undefined){
      const p = precioDe(a.comp);
      if(p!=='' && p!==undefined) a.monto = p;
    }
  });
  DATA.cines.forEach(c=>{
    itemsDeCine(c).forEach(({it, area})=>{
      const ests = estadosItem(it);
      const base = {cine:c.c, area, eq:it.n, puesto:it.p||''};
      const cerrar = (a, est)=>{
        if(est==='ok' && a && (a.estado==='pendiente'||a.estado==='cotizado')){
          a.estado='ejecutado'; a.cierre=new Date().toISOString(); a.autor=AUTOR();
        }
      };
      if(it.x){                                  // puesto sin equipo: una sola acción
        const key = it.id+'|est';
        const est = ests[0];
        let a = S.acc.find(x=>x.key===key);
        if(!a && est!=='ok'){
          nuevaAccion(Object.assign({}, base, {key, comp:'Estación completa',
            tipo:'comprar', monto: precioDe('Estación completa'), cant:1}));
          n++;
        } else cerrar(a, est);
        return;
      }
      if(it.c){
        it.c.forEach((ch,ci)=>{
          const est = ests[ci];
          if(est==='pend') return;
          const key = it.id+'|'+ci;
          let a = S.acc.find(x=>x.key===key);
          // VTID va dentro del pinpad: si no hay pinpad (o el pinpad también
          // falta) no se cuenta aparte; solo si el pinpad está y sin VTID.
          if(ch.n==='VTID'){
            const ip = it.c.findIndex(c=> c.n==='Pinpad');
            const ePin = ip>=0 ? ((S.est[it.id]||{})[ip] || it.c[ip].e) : 'falta';
            if(ePin==='falta'){
              if(a && a.estado!=='ejecutado' && a.estado!=='comprado'){
                a.estado='ejecutado'; a.cierre=new Date().toISOString();
                a.autor=AUTOR();
                a.nota=(a.nota? a.nota+' · ' : '')+'va con el pinpad (no se compra aparte)';
              }
              return;
            }
          }
          if(!a && (est==='malo'||est==='rep'||est==='falta')){
            nuevaAccion(Object.assign({}, base, {key, comp:ETIQ[ch.n]||ch.n,
              tipo: est==='falta' ? 'comprar' : (S.accionComp[key] || TIPO_EST[est]),
              monto: precioDe(ETIQ[ch.n]||ch.n), cant:1}));
            n++;
          } else if(a){
            if(est==='falta' && a.tipo!=='comprar') a.tipo='comprar';   // nada que reparar
            cerrar(a, est);
          }
        });
      } else {
        const est = ests[0];
        if(est==='pend') return;
        const key = it.id+'|e';
        let a = S.acc.find(x=>x.key===key);
        if(!a && (est==='malo'||est==='rep'||est==='falta')){
          nuevaAccion(Object.assign({}, base, {key, comp:it.n, tipo: TIPO_EST[est],
            monto: precioDe(it.n), cant:1}));
          n++;
        } else cerrar(a, est);
      }
    });
  });
  repararAcc();      // segunda pasada: si nacieron duplicados en este ciclo, se limpian ya
  return n;
}
function barrasHTML(datos, color){
  if(!datos.length) return '<div class="ad">Sin datos todavía.</div>';
  const max = Math.max(1, ...datos.map(d=>d.v));
  return '<div class="bars">'+datos.map(d=>`<div class="barrow">
    <span>${d.k}</span>
    <span class="bg"><i style="width:${(d.v/max*100).toFixed(1)}%;background:${color||'var(--brand)'}"></i></span>
    <span class="bv">${fmt(d.v)}</span></div>`).join('')+'</div>';
}
function agruparPlan(C){
  const agrup = {};
  S.acc.filter(a=> !C || C==='todos' || a.cine===C).forEach(a=>{
    const k = a.tipo+'|'+a.comp;
    const g = agrup[k] || (agrup[k] = {tipo:a.tipo, comp:a.comp, cant:0, monto:0, obs:[], n:0});
    g.cant += Number(a.cant)||1;
    g.monto += (Number(a.monto)||0);
    g.n++;
    if(a.nota && g.obs.indexOf(a.nota)<0) g.obs.push(a.nota);
  });
  return Object.values(agrup).sort((x,y)=> (y.monto-x.monto) || (y.cant-x.cant));
}
function exportarResumen(){
  const filas = [['Tipo','Componente','Cantidad','Precio unitario (US$)','Subtotal (US$)',
                  'Motivo / observación']];
  const ET = {reparar:'Reparar', comprar:'Comprar', revisar:'Revisar'};
  agruparPlan(vista.planC).forEach(g=> filas.push([ET[g.tipo]||g.tipo, g.comp, g.cant,
      precioDe(g.comp), g.monto, g.obs.join(' · ')]));
  bajar('resumen-cantidades-'+hoy()+'.csv', filas);
}
function queHacer(){
  const nuevas = sincronizarPlan();
  if(nuevas) save();
  else if(!Array.isArray(S.acc)) S.acc = [];
  const F = vista.planF, C = vista.planC, G = vista.planG || 'tipo';
  const cines = DATA.cines.map(c=>`<option value="${c.c}" ${C===c.c?'selected':''}>${c.n}</option>`).join('');
  const suma = arr => arr.reduce((s,a)=> s+(Number(a.monto)||0), 0);
  const total = suma(S.acc);
  const colores = {pendiente:'#9aa7b2', cotizado:'#e0a100', aprobado:'#7b4fd6',
                   comprado:'#0b5cad', ejecutado:'#1f9d55'};
  const porEstado = EST_PLAN.map(([k,t])=>({k, t,
    n:S.acc.filter(a=>a.estado===k).length, v: suma(S.acc.filter(a=>a.estado===k))}));
  const stkMax = Math.max(1, total);

  /* ---------- A) RESUMEN POR COMPONENTE: una fila, sin repetir ---------- */
  const porComp = {};
  S.acc.filter(a=> C==='todos' || a.cine===C).forEach(a=>{
    const g = porComp[a.comp] || (porComp[a.comp] =
      {comp:a.comp, comprar:0, reparar:0, revisar:0, monto:0, precio:precioDe(a.comp)});
    const cant = Number(a.cant)||1;
    if(a.tipo==='comprar') g.comprar += cant;
    else if(a.tipo==='reparar') g.reparar += cant;
    else g.revisar += cant;
    g.monto += Number(a.monto)||0;
  });
  const resumen = Object.values(porComp)
    .sort((a,b)=> (b.monto-a.monto) || ((b.comprar+b.reparar)-(a.comprar+a.reparar)));
  const totComprar = resumen.reduce((s,g)=> s+g.comprar, 0);
  const totReparar = resumen.reduce((s,g)=> s+g.reparar, 0);
  const totMonto   = resumen.reduce((s,g)=> s+g.monto, 0);

  /* ---------- B) POR CINE ---------- */
  const porCineMap = {};
  S.acc.forEach(a=>{
    const g = porCineMap[a.cine] || (porCineMap[a.cine] = {cine:a.cine, comprar:0, reparar:0, monto:0});
    if(a.tipo==='comprar') g.comprar += Number(a.cant)||1;
    else if(a.tipo==='reparar') g.reparar += Number(a.cant)||1;
    g.monto += Number(a.monto)||0;
  });
  const porCineFilas = Object.values(porCineMap).sort((a,b)=> b.monto-a.monto);

  /* ---------- C) ACCIONES AGRUPADAS (acordeón, sin scroll infinito) ---------- */
  const lista = S.acc.filter(a=> (F==='todo'||a.tipo===F) && (C==='todos'||a.cine===C));
  const abiertos = Array.isArray(vista.planAbiertos)? vista.planAbiertos : [];
  const esta = k => vista.planAbrirTodo || abiertos.indexOf(k)>=0;

  const fila = a=>{
    const idx = S.acc.indexOf(a);
    return `<div class="acc">
      <div class="ah">
        <span class="badge ${a.tipo==='reparar'?'mal':'rev'}">${
          a.tipo==='reparar'?'REPARAR':(a.tipo==='comprar'?'COMPRAR':'REVISAR')}</span>
        <span class="at">${a.eq? a.eq+' · ':''}${a.cine} · ${a.area}${
          a.puesto? ' · puesto '+a.puesto:''}</span>
        <button data-accdel="${idx}" title="Quitar acción">×</button>
      </div>
      <input class="obs" type="text" placeholder="Observación / motivo"
        value="${(a.nota||'').replace(/"/g,'&quot;')}" data-accobs="${idx}">
      <div class="af">
        <select data-acc="${idx}" data-campo="tipo">
          <option value="reparar" ${a.tipo==='reparar'?'selected':''}>Reparar</option>
          <option value="comprar" ${a.tipo==='comprar'?'selected':''}>Comprar</option>
          <option value="revisar" ${a.tipo==='revisar'?'selected':''}>Revisar</option>
        </select>
        <input class="cant" type="number" min="1" inputmode="numeric" title="Cantidad"
          value="${a.cant||1}" data-accc="${idx}">
        <select data-acc="${idx}" data-campo="estado">
          ${EST_PLAN.map(([k,t])=>`<option value="${k}" ${a.estado===k?'selected':''}>${t}</option>`).join('')}
        </select>
        <input class="monto" type="number" inputmode="decimal" placeholder="US$"
          value="${a.monto===''?'':a.monto}" data-accm="${idx}">
      </div>
    </div>`;
  };

  const LIM = 12;
  const limite = k => (vista.planLimit && vista.planLimit[k]) || LIM;
  const cuerpo = (k, filas)=>{
    const n = limite(k);
    const ver = filas.slice(0, n);
    const resto = filas.length - ver.length;
    return ver.map(fila).join('') + (resto>0
      ? `<button class="mas" data-accmas="${String(k).replace(/"/g,'&quot;')}">
           Ver ${resto} ${resto===1?'más acción':'más acciones'} (de ${filas.length})</button>` : '');
  };
  const cab = (k, titulo, filas) => `<summary data-gk="${String(k).replace(/"/g,'&quot;')}">
      <span class="gk">${titulo}</span>
      <span class="gnum">${filas.length} ${filas.length===1?'acción':'acciones'}</span>
      <span class="gmonto">${fmt(suma(filas))}</span>
      <span class="gcar" aria-hidden="true">▾</span></summary>`;

  let acordeon = '';
  if(G==='tipo'){
    const grupos = {};
    lista.forEach(a=>{ const k = ETIQ[a.comp]||a.comp; (grupos[k]=grupos[k]||[]).push(a); });
    const orden = Object.keys(grupos).sort((x,y)=> grupos[y].length-grupos[x].length);
    acordeon = orden.map(k=>`<details class="grupo" data-gkey="${k.replace(/"/g,'&quot;')}"
        ${esta(k)?'open':''}>${cab(k, k, grupos[k])}
      <div class="gbd">${cuerpo(k, grupos[k])}</div></details>`).join('');
  } else {
    const porC = {};
    lista.forEach(a=>{ (porC[a.cine]=porC[a.cine]||[]).push(a); });
    const cineOrden = Object.keys(porC).sort((x,y)=> porC[y].length-porC[x].length);
    acordeon = cineOrden.map(cine=>{
      const filas = porC[cine];
      const subs = {};
      filas.forEach(a=>{ const k = ETIQ[a.comp]||a.comp; (subs[k]=subs[k]||[]).push(a); });
      const subOrden = Object.keys(subs).sort((x,y)=> subs[y].length-subs[x].length);
      return `<details class="grupo" data-gkey="${cine}" ${esta(cine)?'open':''}>
          ${cab(cine, cine, filas)}
          <div class="gbd">${subOrden.map(k=>`<details class="grupo sub"
              data-gkey="${(cine+'|'+k).replace(/"/g,'&quot;')}" ${esta(cine+'|'+k)?'open':''}>
              ${cab(cine+'|'+k, k, subs[k])}
              <div class="gbd">${cuerpo(cine+'|'+k, subs[k])}</div></details>`).join('')}</div>
        </details>`;
    }).join('');
  }
  if(!acordeon) acordeon = '<div class="empty-note">Sin acciones para este filtro.</div>';

  return `
  <div class="kpi">
    <div><b>${fmt(total)}</b><span>Total estimado</span></div>
    <div><b>${fmt(suma(S.acc.filter(a=>a.estado==='pendiente')))}</b><span>Pendiente</span></div>
    <div><b>${fmt(suma(S.acc.filter(a=>a.estado==='ejecutado')))}</b><span>Ejecutado</span></div>
    <div><b>${S.acc.length}</b><span>Acciones</span></div>
  </div>

  <div class="card secc"><div class="hd"><h2>Faltan, por componente</h2>
    <span class="ad">una fila por equipo · ${C==='todos'?'todos los cines':C}</span>
    <button id="exp-resumen">⬇ Excel</button></div>
    <div class="bd">
      <div class="tbl-wrap"><table class="tbl">
        <thead><tr><th>Componente</th><th class="num">A comprar</th><th class="num">A reparar</th>
          <th class="num">Precio c/u</th><th class="num">Subtotal</th></tr></thead>
        <tbody>${resumen.map(g=>`<tr>
          <td><b>${g.comp}</b></td>
          <td class="num">${g.comprar||'—'}</td>
          <td class="num">${g.reparar||'—'}</td>
          <td class="num">${g.precio===''||g.precio===undefined? '—' : fmt(g.precio)}</td>
          <td class="num"><b>${fmt(g.monto)}</b></td></tr>`).join('')}</tbody>
        <tfoot><tr><td><b>Total</b></td><td class="num"><b>${totComprar}</b></td>
          <td class="num"><b>${totReparar}</b></td><td class="num"></td>
          <td class="num"><b>${fmt(totMonto)}</b></td></tr></tfoot>
      </table></div>
    </div></div>

  <div class="card secc"><div class="hd"><h2>Faltan, por cine</h2>
    <span class="ad">clic en un cine para filtrar</span></div>
    <div class="bd">
      <div class="tbl-wrap"><table class="tbl">
        <thead><tr><th>Cine</th><th class="num">A comprar</th><th class="num">A reparar</th>
          <th class="num">Subtotal</th><th></th></tr></thead>
        <tbody>${porCineFilas.map(g=>`<tr>
          <td><b>${g.cine}</b></td>
          <td class="num">${g.comprar||'—'}</td>
          <td class="num">${g.reparar||'—'}</td>
          <td class="num"><b>${fmt(g.monto)}</b></td>
          <td class="num"><button data-pc-set="${g.cine}">Filtrar</button></td></tr>`).join('')}</tbody>
      </table></div>
    </div></div>

  <div class="card secc"><div class="hd"><h2>Acciones (${lista.length})</h2>
    <button id="exp-plan">⬇ Excel</button></div>
    <div class="bd">
      <div class="filters" style="margin-bottom:10px">
        <button data-pg="tipo" class="${G==='tipo'?'on':''}">Por tipo de equipo</button>
        <button data-pg="cine" class="${G==='cine'?'on':''}">Por cine + equipo</button>
        <span style="flex:1"></span>
        <button data-pg-abrir="todo">Abrir todo</button>
        <button data-pg-abrir="nada">Cerrar</button>
      </div>
      <div class="filters" style="margin-bottom:10px">
        <button data-pf="todo" class="${F==='todo'?'on':''}">Todas</button>
        <button data-pf="reparar" class="${F==='reparar'?'on':''}">Reparar</button>
        <button data-pf="comprar" class="${F==='comprar'?'on':''}">Comprar</button>
        <select data-pc style="min-height:44px;padding:10px 12px">
          <option value="todos" ${C==='todos'?'selected':''}>Todos los cines</option>
          ${cines}
        </select>
      </div>
      ${(F!=='todo' || C!=='todos')? `<div class="filtro-on">
        Filtrando: <b>${C!=='todos'? cineNombre(C) : 'todos los cines'}</b>
        · <b>${F==='todo'? 'todas las acciones'
             : (F==='reparar'? 'solo reparar' : 'solo comprar')}</b>
        <button data-pfreset>Quitar filtro ✕</button></div>` : ''}
      ${acordeon}
      <div class="rowbtn" style="margin-top:10px">
        <button id="acc-add">+ Acción manual</button>
      </div>
    </div></div>

  <div class="charts">
    <div class="card secc"><div class="hd"><h2>Inversión por cine</h2></div>
      <div class="bd">${barrasHTML(Object.entries(porCineMap)
        .map(([k,v])=>({k, v:v.monto})).sort((a,b)=>b.v-a.v))}</div></div>
    <div class="card secc"><div class="hd"><h2>Avance del plan</h2>
      <span class="ad">Total ${fmt(total)}</span></div><div class="bd">
      <div class="stk">${porEstado.map(e=>
        `<i style="width:${(e.v/stkMax*100).toFixed(1)}%;background:${colores[e.k]}"></i>`).join('')}</div>
      <div class="bars">${porEstado.map(e=>`<div class="barrow">
        <span>${e.t} (${e.n})</span>
        <span class="bg"><i style="width:${(e.v/stkMax*100).toFixed(1)}%;background:${colores[e.k]}"></i></span>
        <span class="bv">${fmt(e.v)}</span></div>`).join('')}</div>
    </div></div>
  </div>

  <details class="grupo precios"><summary data-gk="__precios">
    <span class="gk">Precios de referencia</span>
    <span class="gnum">${CATALOGO.length} equipos</span>
    <span class="gmonto">${fmt(suma(S.acc.filter(a=>C==='todos'||a.cine===C)))}</span>
    <span class="gcar">▾</span></summary>
    <div class="gbd">
    <div class="rowbtn" style="margin-top:0"><button data-rellenar>Rellenar montos vacíos</button></div>
      <div class="carga-masiva">
        <div class="sb">Carga masiva — pega aquí (desde Excel: copia las columnas nombre y precio)</div>
        <textarea id="prec-masivo" rows="4" placeholder="Impresora fiscal	1017
Monitor secundario	120
Escáner = 45
Gaveta100"></textarea>
        <div class="rowbtn">
          <button class="btn-p" id="prec-aplicar">Aplicar precios</button>
          <button id="prec-limpiar">Limpiar</button>
        </div>
      </div>
      <div class="precgrid">${CATALOGO.map(n=>`
        <label class="prec"><span>${n}</span>
          <input type="number" inputmode="decimal" data-prec="${n}"
            value="${precioDe(n)===''?'':precioDe(n)}" placeholder="US$"></label>`).join('')}</div>
    </div></details>`;
}

/* ================= GESTIÓN (MÓDULOS) ================= */
function gestion(){
  const pend = pendientes();
  const logs = S.mov.slice(-50).reverse();
  const personas = {};
  S.mov.forEach(m=>{ const k=m.autor||'Sin perfil';
    personas[k] = personas[k]||{cambios:0, apr:0, acc:0};
    personas[k].cambios++;
    if(m.rev==='ok'&&m.rap) personas[k].apr++; });
  S.acc.forEach(a=>{ const k=a.autor||'Sin perfil';
    personas[k] = personas[k]||{cambios:0, apr:0, acc:0}; personas[k].acc++; });
  const tot = conteosTotales();
  const m = mejora(null);

  const personasHTML = Object.entries(personas).map(([n,d])=>{
    const ini = n.split(' ').map(x=>x[0]).slice(0,2).join('').toUpperCase();
    let rol = '—';
    for(const k in USU()) if((USU()[k]||[]).includes(n)) rol = ROL_TXT[k];
    if(S.perfil && S.perfil.nombre===n) rol = ROL_TXT[S.perfil.rol];
    return `<div class="persona"><span class="avatar">${ini}</span>
      <span style="flex:1"><b>${n}</b><br><span class="ad">${rol}</span></span>
      <span class="ad">${d.cambios} ${d.cambios===1?'cambio':'cambios'} · ${d.acc} ${d.acc===1?'acción':'acciones'}</span></div>`;
  }).join('') || '<div class="empty-note">Aún no hay movimientos.</div>';

  const INI = {soporte:'S', coordinacion:'C', infraestructura:'I', gerencia:'G'};
  const roster = Object.entries(USU()).map(([rol, nombres])=>
    `<div class="persona"><span class="avatar">${INI[rol]}</span>
      <span style="flex:1"><b>${ROL_TXT[rol]||rol}</b> <span class="ad">(${nombres.length})</span><br>
        <span class="ad">${nombres.join(' · ')||'—'}${S.perfil && nombres.includes(S.perfil.nombre)?
          ' <b style="color:var(--brand)">← activo</b>':''}</span></span></div>`).join('');

  const colaHTML = colaAgrupada(pend, true);

  const auditHTML = logs.map(x=>`<div class="log">
      <span class="who">${(x.autor||'Sin perfil').split(' ')[0]}</span>
      <span style="flex:1">${x.eq} · ${x.comp}: <b>${x.de}</b> → <b>${x.a}</b>
        ${x.causa? '<br>'+x.causa : ''}
        ${x.rev==='pendiente'? '<br><span class="badge rev">pendiente de aprobación</span>':''}
        ${x.rev==='rechazado'? '<br><span class="badge mal">rechazado</span>'+(x.com?': '+x.com:''):''}
        ${x.rap? '<br><span class="badge rev">aprobado</span>':''}</span>
      <span class="when">${x.ts.slice(5,16).replace('T',' ')}</span>
    </div>`).join('') || '<div class="empty-note">Sin movimientos todavía.</div>';

  const sec = vista.gseccion || (ROL()==='coordinacion' ? "aprob" : "tablero");
  const GSEC = [["tablero","Tablero"],["aprob","Aprobaciones"],["usuarios","Usuarios"],
                ["auditoria","Auditoría"],["personas","Personas"],["exportar","Exportar"]];

  // cifras del tablero gerencial
  const metas = DATA.cines.map(c=>({c, m:metaCine(c)}));
  const piezasComprar = metas.reduce((s,x)=> s + x.m.comprar, 0);
  const costoComprar  = metas.reduce((s,x)=> s + x.m.costo, 0);
  const aReparar      = metas.reduce((s,x)=> s + x.m.reparar, 0);
  const sinRevisar    = conteosTotales().pend;
  const rezagados     = metas.slice()
    .sort((a,b)=> a.m.pct - b.m.pct || b.m.comprar - a.m.comprar).slice(0,4);
  const gbar = `<div class="gbar">${GSEC.map(([k,t])=>
    `<button data-gsec="${k}" class="${k===sec?"on":""}">${t}${
      k==="aprob" && pend.length? ` <span class="badge rev">${pend.length}</span>`:""}</button>`).join("")}</div>`;

  const modCard = `
  <div class="card secc"><div class="hd"><h2>Módulo activo</h2></div><div class="bd">
    <div class="persona"><span class="avatar">${AUTOR().split(' ').map(x=>x[0]).slice(0,2).join('').toUpperCase()}</span>
      <span style="flex:1"><b>${AUTOR()}</b><br><span class="ad">${ROL_TXT[ROL()]}</span></span>
      <button id="btn-perfil2">Cambiar</button>
      <button id="btn-clave">Cambiar clave</button></div>
    <div class="perm"><b>Soporte</b> (Danyelis, Adrian, Luis, Alexander, Brayan): carga estados, equipos y plan ·
      <b>Coordinación</b> (Carlos): corrige y aprueba/rechaza todo ·
      <b>Infraestructura</b> (Yalkott): carga lo suyo y aprueba lo técnico (red, centro de datos, plasmas) ·
      <b>Gerencia</b> (Oriana): edita inventario y montos, aprueba el plan y ve las gráficas.</div>
  </div></div>`;
  const tarjetas = {
    tablero: (()=>{
      const av = avanceGlobal();
      const tops = topProblemas(6);
      const maxTop = tops.length? tops[0][1] : 1;
      const porEstado = planPorEstado();
      const maxEst = Math.max(1, ...porEstado.map(x=>x.n));
      const COL = {pendiente:'#e0a100', cotizado:'#2f6fb3', aprobado:'#7b5cd6',
                   comprado:'#1f9d55', ejecutado:'#0d7a4f'};
      const planPend = S.acc.filter(a=> a.estado==='pendiente' || a.estado==='cotizado');
      const montoPend = planPend.reduce((s,a)=> s+(Number(a.monto)||0), 0);
      return `
      <div class="grid2">
        <div class="card secc"><div class="hd"><h2>Avance hacia el100%</h2>
          <span class="ad">${av.enMeta}/${DATA.cines.length} cines en la meta</span></div>
          <div class="bd">
            <div class="avance"><b>${av.pct}%</b>
              <span class="bar"><i style="width:${av.pct}%;background:${
                av.pct>=90? 'var(--ok)':(av.pct>=70? '#e0a100':'var(--mal)')}"></i></span></div>
            <div class="kpis" style="margin-top:10px">
              <span><b style="color:var(--ok)">${av.t.ok}</b> operativos</span>
              <span><b style="color:var(--mal)">${av.t.malo+av.t.rep}</b> con incidencia</span>
              <span><b>${av.t.falta}</b> faltantes</span>
              <span><b>${av.t.vacias}</b> puestos vacíos</span>
              <span><b>${av.t.pend}</b> sin revisar</span>
            </div>
          </div></div>

        <div class="card secc"><div class="hd"><h2>Pendiente de tu decisión</h2>
          ${(pend.length||planPend.length)? `<span class="badge mal">${pend.length+planPend.length}</span>`:''}</div>
          <div class="bd">
            ${pend.length? `<div class="alerta"><span class="badge rev">REV</span>
              <span style="flex:1"><span class="ti">${pend.length} cambios esperan aprobación</span><br>
                <span class="de">${[...new Set(pend.map(x=>x.cine))].join(' · ')}</span></span>
              <button data-gsec="aprob">Revisar</button></div>`
 : `<div class="empty-note">Sin cambios esperando aprobación ✓</div>`}
            ${planPend.length? `<div class="alerta"><span class="badge mal">PLAN</span>
              <span style="flex:1"><span class="ti">${planPend.length} acciones · ${fmt(montoPend)}</span><br>
                <span class="de">esperan aprobación de monto</span></span>
              <button data-tab="quehacer">Ver plan</button></div>`:''}
          </div></div>
      </div>

      <div class="grid2">
        <div class="card secc"><div class="hd"><h2>Plan de reemplazos</h2>
          <button data-tab="quehacer">Plan completo</button></div>
          <div class="bd">
            ${porEstado.length? porEstado.map(x=>`<div class="filaest">
                <span>${x.txt}</span>
                <span class="bar"><i style="width:${x.n/maxEst*100}%;background:${COL[x.k]||'#8aa0b3'}"></i></span>
                <b>${x.n}</b><span class="ad">${x.monto? fmt(x.monto):''}</span></div>`).join('')
              : '<div class="empty-note">Todavía no hay acciones en el plan.</div>'}
          </div></div>

        <div class="card secc"><div class="hd"><h2>Qué está fallando más</h2>
          <span class="ad">faltantes + dañados</span></div>
          <div class="bd">
            ${tops.map(([n,v])=>`<div class="filaest"><span>${n}</span>
                <span class="bar"><i style="width:${v/maxTop*100}%;background:var(--mal)"></i></span>
                <b>${v}</b></div>`).join('') || '<div class="empty-note">Sin incidencias ✓</div>'}
          </div></div>
      </div>

      <div class="card secc"><div class="hd"><h2>Cines más rezagados</h2>
        <span class="ad">para llegar al100%</span></div>
        <div class="bd">${rezagados.map(x=>`<div class="alerta">
          <span class="badge ${x.m.pct>=70?'rev':'mal'}">${x.m.pct}%</span>
          <span style="flex:1"><span class="ti">${x.c.n}</span><br>
            <span class="de">comprar ${x.m.comprar} · reparar ${x.m.reparar}${
              x.m.costo? ' · '+fmt(x.m.costo) : ''}</span></span>
          <button data-cine="${x.c.c}">Ver</button></div>`).join('')}</div></div>

        <div class="rowbtn">
        <button class="btn-p" data-gsec="exportar">Exportar resultados</button>
        <button data-gsec="auditoria">Auditoría</button>
        <button data-gsec="usuarios">Usuarios</button>
      </div>`;
    })(),
    usuarios: `<div class="card secc"><div class="hd"><h2>Equipo y módulos</h2>
    ${adminUsuarios()? '<span class="badge rev">admin</span>':''}</div>
    <div class="bd">${roster}
      ${adminUsuarios()? `
      <div class="addrow" style="margin-top:12px">
        <input type="text" id="u-nombre" placeholder="Nombre y apellido del nuevo usuario">
        <select id="u-rol" class="usel">
          <option value="soporte">Soporte</option>
          <option value="coordinacion">Coordinación</option>
          <option value="infraestructura">Infraestructura</option>
          <option value="gerencia">Gerencia</option>
        </select>
        <button id="u-add" class="btn-p">+ Agregar</button>
      </div>
      <div class="ad" style="margin-top:8px">Al agregarlo, esa persona crea su clave la primera
        que entra. Puedes quitarla o reiniciarle la clave.</div>` : `
      <div class="ad" style="margin-top:8px">Solo Gerencia y Coordinación administran usuarios.</div>`}
      ${adminUsuarios()? `<div style="margin-top:10px">${
        Object.entries(USU()).flatMap(([rol, nombres])=> nombres.map(n=>{
          const ini = n.split(' ').map(x=>x[0]).slice(0,2).join('').toUpperCase();
          const tieneClave = !!S.claves[n];
          return `<div class="persona"><span class="avatar">${ini}</span>
            <span style="flex:1"><b>${n}</b><br>
              <span class="ad">${ROL_TXT[rol]||rol} · ${tieneClave?'clave definida':'sin clave'}</span></span>
            <button data-clavereset="${n}">Reset clave</button>
            <button data-userdel="${rol}|${n}">Quitar</button></div>`;
        })).join('') || '<div class="ad">Sin usuarios.</div>'
      }</div>`:''}
    </div></div>`,
    aprob: `<div class="card secc"><div class="hd"><h2>Por aprobar</h2>
    ${pend.length?`<span class="badge rev">${pend.length}</span>`:''}</div>
    <div class="bd">${colaHTML}</div></div>`,
    auditoria: `<div class="card secc"><div class="hd"><h2>Auditoría (quién hizo qué)</h2>
    <button id="exp-mov2">⬇ Excel</button></div>
    <div class="bd">${auditHTML}</div></div>`,
    personas: `<div class="card secc"><div class="hd"><h2>Personas</h2></div>
    <div class="bd">${personasHTML}</div></div>`,
    exportar: `<div class="card secc"><div class="hd"><h2>Exportar</h2></div><div class="bd">
    <div class="rowbtn">
      <button class="btn-p" id="exp-todo2">Inventario</button>
      <button id="exp-mov3">Cambios</button>
      <button id="exp-plan2">Plan de trabajo</button>
    </div></div></div>`
  };
  const kpis = `<div class="kpi">
    <div><b>${tot.total}</b><span>Componentes</span></div>
    <div><b>${tot.total? Math.round(tot.ok/tot.total*100):0}%</b><span>Operativos</span></div>
    <div><b>${tot.rep+tot.malo}</b><span>Incidencias</span></div>
    <div><b>${fmt(S.acc.reduce((s,a)=>s+(Number(a.monto)||0),0))}</b><span>Plan estimado</span></div>
  </div>`;
  return kpis + modCard + gbar + (tarjetas[sec] || tarjetas.usuarios);
}

/* ================= MODAL DE CAUSA ================= */
let mPend = null, mCausa = '';
function pintarCausas(sel){
  const lista = CAUSAS.concat(S.causas);
  document.getElementById('m-causas').innerHTML =
    lista.map(c=>`<button data-causa="${c.replace(/"/g,'&quot;')}"
      ${c===sel?'class="on"':''}>${c}</button>`).join('') +
    `<button data-causa-nueva style="border-style:dashed">+ Agregar causa</button>`;
}
function esCentroDeDatos(id){
  const d = dondeEsta(id);
  return !!(d && /centro de datos/i.test(d.area||''));
}
function estadoActualDe(id, idx){
  const it = findItem(id) || {};
  const e = S.est[id] || (S.est[id]={});
  if(idx==='e') return e.e || it.e || 'pend';
  if(it.c && it.c[idx]) return e[idx] || it.c[idx].e || 'pend';
  return e[idx] || 'pend';
}
function actualizarFalloModal(){
  if(!mPend) return;
  const es = mPend.nuevo;
  const fallo = es==='malo' || es==='rep';
  const falta = es==='falta';
  const box = document.getElementById('m-fallo');
  if(box) box.hidden = !(fallo || falta);
  // "falta" solo pide el porqué: no hay causas ni acción de reparación
  const pideCausa = el=>{ const e = document.getElementById(el); if(e) e.hidden = !fallo; };
  pideCausa('m-tit-causa'); pideCausa('m-causas');
  pideCausa('m-tit-accion'); pideCausa('m-accion');
  const det = document.getElementById('m-det');
  if(det) det.placeholder = falta
    ? '¿Por qué falta? Ej. no se compró · el cine lo guardó · se retiró'
    : 'Detalle (opcional): ej. cable de red de3 m a sustituir';
  const it = findItem(mPend.id);
  document.getElementById('m-sb').textContent =
    `${it? it.n:''} · ${etiquetaComp(mPend.id, mPend.idx)} · actual: ${
      LABEL[mPend.viejo]} → ${LABEL[mPend.nuevo]}`;
}
/* Acción de plan vinculada a un equipo/componente (misma lógica que usaba la ficha) */
function accDe(id, idx){
  const it = findItem(id); if(!it) return null;
  const d = dondeEsta(id);
  const esSimple = (idx==='e' || !it.c);
  const ch = (!esSimple && it.c[idx]) ? it.c[idx] : null;
  return (S.acc||[]).find(a=> a.key===id+'|'+idx) ||
    (d && (S.acc||[]).find(a=> a.cine===d.c.c && a.area===d.area &&
      a.eq===nombreDe(it) && (!ch || a.comp===(ETIQ[ch.n]||ch.n)))) || null;
}
/* --- nombre visible de área (se puede renombrar sin tocar los ids) --- */
function nombreArea(cine, area){
  return (S.areaNombres && S.areaNombres[cine+'|'+area]) || area;
}
function cineNombre(cod){
  const c = DATA.cines.find(x=>x.c===cod);
  return c? c.n : cod;
}
/* --- áreas borradas: se quitan de DATA en cada arranque --- */
function aplicarBorradosArea(){
  if(!Array.isArray(S.areaBorr) || !S.areaBorr.length) return;
  const fuera = new Set(S.areaBorr);
  DATA.cines.forEach(c=>{ c.ar = c.ar.filter(a=> !fuera.has(c.c+'|'+a.a)); });
  Object.keys(S.nuevos||{}).forEach(cod=>{
    S.nuevos[cod] = (S.nuevos[cod]||[]).filter(it=> !fuera.has(cod+'|'+(it.area||'')));
  });
}
function esObsoleto(id){ return !!(S.obsoletos && S.obsoletos[id]); }
function esAreaBorrada(clave){ return Array.isArray(S.areaBorr) && S.areaBorr.indexOf(clave)>=0; }

/* Ficha del equipo dentro de la ventana de estado: todo lo que se sabe de él */
function fichaHTML(id, idx){
  const it = findItem(id); if(!it) return '';
  const d = dondeEsta(id);
  const esSimple = (idx==='e' || !it.c);
  const ch = (!esSimple && it.c[idx]) ? it.c[idx] : null;
  const modEq = modeloDe(it) || '';
  const modCh = ch? valorComp(it, idx, ch) : '';
  const nota = S.notas[id] || '';
  const obs = (S.obs && Object.prototype.hasOwnProperty.call(S.obs, id))
    ? S.obs[id] : (it.o || '');
  const movs = movsDe(id, esSimple? undefined : idx);
  const acc = accDe(id, idx);
  const etapa = acc && EST_PLAN.find(x=>x[0]===acc.estado);
  const ed = attr=> `<button class="fed" ${attr} title="Editar">✎</button>`;
  const fila = (k, v, cls, btn)=>
    (v||btn)? `<div class="frow2"><span>${k}</span><b class="${cls||''}">${v||'—'}</b>${btn||''}</div>` : '';
  const movsHtml = movs.slice(0,3).map(m=>
    `<div class="fmov"><b>${fechaCorta(m.ts)} ${String(m.ts||'').slice(11,16)}</b>
      <span>${m.de||'—'} → <b>${m.a||'—'}</b></span>
      ${m.causa? `<span class="fcau">${m.causa}</span>`:''}
      <span class="ad">${m.autor||''}</span></div>`).join('');
  const obsTxt = obs? String(obs).replace(/</g,'&lt;') : '';
  const obsVis = obsTxt.length>260? obsTxt.slice(0,260)+'…' : obsTxt;
  const TIPO_TXT = {reparar:'REPARAR', comprar:'COMPRAR', revisar:'REVISAR'};
  const planRow = acc
    ? `<div class="frow2"><span>Plan</span><b>${TIPO_TXT[acc.tipo]||'REPARAR'} ${acc.cant||1} · ${
        etapa? etapa[1]:acc.estado} · ${
        (acc.monto!==''&&acc.monto!==undefined)? fmt(acc.monto):'sin precio'}${
        acc.nota? ' · '+String(acc.nota).replace(/</g,'&lt;'):''}</b>${
        ed(`data-fplan="${id}|${idx}"`)}</div>`
    : TIPO_EST[estadoActualDe(id, idx)]
      ? `<div class="frow2"><span>Plan</span><b class="ad">Sin acción en el plan</b><button class="fed"
          data-fplannew="${id}|${idx}" title="Agregar al plan">＋</button></div>`
      : '';
  return [
    fila('Equipo', `${nombreDe(it)}${puestoDe(it)? ' · puesto '+puestoDe(it):''}`,
        '', ed(`data-fed="${id}"`)),
    fila('Ubicación', d? `${d.area} · ${d.c.n}` : ''),
    fila('Modelo', [modEq? 'equipo: '+modEq:'', modCh? 'componente: '+modCh:'']
        .filter(Boolean).join(' · '), '', ed(`data-mod="${id}"`)),
    fila('Nota', nota.replace(/</g,'&lt;'), '', ed(`data-note="${id}"`)),
    fila('Observación inv.', obsVis, '', ed(`data-fobs="${id}"`)),
    planRow,
    movsHtml? `<div class="fhist"><span class="fh-t">Últimos cambios</span>${movsHtml}</div>` : ''
  ].join('');
}
function abrirModal(id, idx){
  const it = findItem(id); if(!it) return;
  const actual = estadoActualDe(id, idx);
  mPend = {id, idx, nuevo: actual, viejo: actual}; mCausa='';
  const d = dondeEsta(id);
  const enCD = esCentroDeDatos(id);
  document.getElementById('m-sb').textContent =
    `${it.n} · ${etiquetaComp(id,idx)} · Estado actual: ${LABEL[actual]}`;
  document.querySelectorAll('#m-estados [data-estado]').forEach(b=>
    b.classList.toggle('on', b.dataset.estado===actual));
  pintarCausas('');
  document.getElementById('m-det').value='';
  document.querySelectorAll('[data-accion]').forEach(b=>
    b.classList.toggle('on', b.dataset.accion==='reparar'));
  const ficha = document.getElementById('m-ficha');
  if(ficha) ficha.innerHTML = fichaHTML(id, idx);
  const lbl = document.getElementById('m-rev').closest('label');
  const pasaPorCoor = soloSoporte() && !enCD;   // solo Soporte manda a Coordinación
  lbl.hidden = !pasaPorCoor;
  const chkRev = document.getElementById('m-rev');
  chkRev.checked = pasaPorCoor;
  if(lbl.lastChild && lbl.lastChild.nodeType === 3)
    lbl.lastChild.textContent = pasaPorCoor
      ? ' Enviar a revisión del coordinador · obligatorio para Soporte'
      : ' Enviar a revisión del coordinador';
  actualizarFalloModal();
  document.getElementById('modal').classList.add('on');
}
function cerrarModal(){ document.getElementById('modal').classList.remove('on'); mPend=null; }
function confirmarModal(){
  if(!mPend) return;
  const det = document.getElementById('m-det').value.trim();
  const enCD = esCentroDeDatos(mPend.id);
  const chkRev2 = document.getElementById('m-rev');
  const rev = (enCD || !soloSoporte() || !chkRev2.checked) ? 'ok' : 'pendiente';
  const causa = [mCausa, det].filter(Boolean).join(' — ');
  const accSel = document.querySelector('[data-accion].on');
  const tipo = (mPend.nuevo==='falta') ? 'comprar'      // falta → se compra
    : (ACC_MAP[(accSel && accSel.dataset.accion) || 'reparar'] || 'reparar');
  const {id, idx, nuevo, viejo} = mPend;
  if(nuevo===viejo && !causa){ cerrarModal(); return; }   // no cambió nada
  const key = id+'|'+idx;
  if(nuevoDe(id, idx, nuevo, causa, rev)){
    S.accionComp[key] = tipo;                 // decide qué va al plan
    const existente = S.acc.find(a=>a.key===key);
    if(existente){ existente.tipo = tipo; existente.nota = causa; existente.autor=AUTOR(); }
    else {
      const it = findItem(id); const p = partes(id);
      S.acc.push({key, cine:p.cine, area:p.area, eq: it?it.n:'', comp: etiquetaComp(id,idx),
        puesto: (it&&it.p)||'', tipo, monto: precioDe(etiquetaComp(id,idx)), cant:1,
        estado:'pendiente', nota: causa, autor:AUTOR(), ts:new Date().toISOString()});
    }
  }
  save(); cerrarModal(); render();
  flash(rev==='pendiente' ? 'Guardado · en revisión del coordinador' : 'Guardado ✓');
}

/* ================= NUBE: Supabase (datos compartidos entre dispositivos) ================= */
const SB = {
  url: 'https://gowtxlbyyjhsuefgyvoa.supabase.co',
  key: 'sb_publishable_DDSHL0mYSKTB0C2rfxy5Sw_ERzc4PRB',
  jwt: null, uid: null,
  estado: 'local'          // local | conectado
};
function sbHdr(extra){
  return Object.assign({apikey: SB.key, 'Content-Type': 'application/json',
    Authorization: 'Bearer ' + (SB.jwt || SB.key)}, extra || {});
}
function jwtExp(t){
  try { return JSON.parse(atob(t.split('.')[1])).exp; } catch(e){ return null; }
}
async function sbConectar(){
  try{
    const guard = JSON.parse(localStorage.getItem('cinex-nube') || 'null');
    if(guard && guard.jwt && guard.exp > Date.now()/1000){
      SB.jwt = guard.jwt; SB.uid = guard.uid; SB.estado = 'conectado'; return true;
    }
    const r = await fetch(SB.url + '/auth/v1/signup', {
      method:'POST',
      headers:{apikey: SB.key, Authorization: 'Bearer ' + SB.key,
               'Content-Type':'application/json'},
      body: '{}'
    });
    if(!r.ok){ SB.estado = 'local'; return false; }      // anónimos apagados -> modo local
    const j = await r.json();
    SB.jwt = j.access_token;
    SB.uid = j.user && j.user.id;
    SB.estado = 'conectado';
    localStorage.setItem('cinex-nube', JSON.stringify({
      jwt: SB.jwt, uid: SB.uid, exp: jwtExp(SB.jwt) || Math.floor(Date.now()/1000) + 3600
    }));
    return true;
  }catch(e){ SB.estado = 'local'; return false; }
}
async function sbCargar(){
  if(SB.estado !== 'conectado') return null;
  try{
    const r = await fetch(SB.url + '/rest/v1/estado?id=eq.1&select=data,actualizado',
      {headers: sbHdr()});
    if(!r.ok) return null;
    const arr = await r.json();
    if(!arr.length || !arr[0].data || !Object.keys(arr[0].data).length) return null;
    return arr[0];
  }catch(e){ return null; }
}
function fusionarRemoto(rem){
  const remTs = Date.parse(rem.actualizado || 0) || 0;
  const locTs = S._sync || 0;
  if(remTs <= locTs) return false;                     // lo local está más al día
  const r = rem.data || {};
  // eventos: unión (nada se pierde)
  const vistos = new Set((S.mov||[]).map(m=> m.ts+'|'+m.id+'|'+m.de+'|'+m.a));
  (r.mov||[]).forEach(m=>{
    const k = m.ts+'|'+m.id+'|'+m.de+'|'+m.a;
    if(!vistos.has(k)){ S.mov.push(m); vistos.add(k); }
  });
  S.mov.sort((a,b)=> String(a.ts).localeCompare(String(b.ts)));
  // el resto del estado: lo más reciente manda
  // el perfil NO viaja desde la nube: cada dispositivo pide su clave
  Object.keys(r).forEach(k=>{ if(k!=='mov' && k!=='perfil') S[k] = r[k]; });
  S._sync = remTs;
  return true;
}
/* Unión sin pérdidas: lo local pisa (estamos a punto de subirlo) y lo que falta
   en este dispositivo llega de la base. Así nadie pisa lo del otro equipo. */
function fusionarSeguro(rem){
  const r = rem.data || {};
  const remTs = Date.parse(rem.actualizado || 0) || 0;
  if(!r || typeof r !== 'object') return false;
  // eventos: unión por su clave compuesta
  const vistos = new Set((S.mov||[]).map(m=> m.ts+'|'+m.id+'|'+m.de+'|'+m.a));
  (r.mov||[]).forEach(m=>{ const k = m.ts+'|'+m.id+'|'+m.de+'|'+m.a;
    if(!vistos.has(k)){ S.mov.push(m); vistos.add(k); } });
  S.mov.sort((a,b)=> String(a.ts).localeCompare(String(b.ts)));
  // mapas por clave (claves, obsoletos, componentes, estados, renombres de área)
  ['claves','obsoletos','areaNombres','comps','est'].forEach(k=>{
    if(r[k] && typeof r[k]==='object' && !Array.isArray(r[k]))
      S[k] = Object.assign({}, r[k], S[k] || {});   // lo local pisa; lo que falta llega
  });
  // equipos agregados a mano: unión por id dentro de cada cine
  if(r.nuevos && typeof r.nuevos==='object'){
    const sal = {}, cines = new Set([...Object.keys(S.nuevos||{}), ...Object.keys(r.nuevos)]);
    cines.forEach(c=>{
      const lista = [], v = new Set();
      [...(r.nuevos[c]||[]), ...((S.nuevos&&S.nuevos[c])||[])].forEach(x=>{
        if(x && x.id && !v.has(x.id)){ v.add(x.id); lista.push(x); }
      });
      if(lista.length) sal[c] = lista;
    });
    S.nuevos = sal;
  }
  // listas simples (visitas, retirados, borrados, áreas borradas)
  ['visitas','retirados','borrados','areaBorr'].forEach(k=>{
    if(Array.isArray(r[k])){
      const base = Array.isArray(S[k]) ? S[k] : [];
      const idDe = x => (x && typeof x==='object') ? (x.id || x.fecha || x.k || JSON.stringify(x)) : String(x);
      const v = new Set(base.map(idDe));
      S[k] = base.concat(r[k].filter(x=> !v.has(idDe(x))));
    }
  });
  // el resto (meta, hist…): lo más reciente manda. El perfil NUNCA viaja de la nube
  const propios = ['mov','perfil','claves','obsoletos','areaNombres','comps','est','nuevos',
                   'visitas','retirados','borrados','areaBorr',
                   'cine','tab','gseccion','planAbiertos','planLimit','_modif','_sync'];
  Object.keys(r).forEach(k=>{ if(propios.indexOf(k)<0) S[k] = r[k]; });
  if(remTs) S._sync = Math.max(S._sync||0, remTs);
  return true;
}
/* La base como fuente de verdad de las claves. null = no se pudo contactar. */
async function sbClavesRemotas(){
  if(SB.estado !== 'conectado') return null;
  try{
    const r = await fetch(SB.url + '/rest/v1/estado?id=eq.1&select=data,actualizado',
                          {headers: sbHdr()});
    if(!r.ok) return null;
    const arr = await r.json();
    if(!arr.length) return {};                       // alcanzable, pero aún no hay fila
    fusionarSeguro(arr[0]);
    return (arr[0].data || {}).claves || {};
  }catch(e){ return null; }
}
let sbTimer = null;
function sbProgramar(){
  if(SB.estado !== 'conectado') return;
  clearTimeout(sbTimer);
  sbTimer = setTimeout(sbSubir, 1200);
}
async function sbSubir(){
  if(SB.estado !== 'conectado') return;
  try{
    //1) primero bajar lo que esté en la base y fusionarlo: así nadie pisa lo del otro
    try{
      const previo = await fetch(SB.url + '/rest/v1/estado?id=eq.1&select=data,actualizado',
                                 {headers: sbHdr()});
      if(previo.ok){
        const arr = await previo.json();
        if(arr.length) fusionarSeguro(arr[0]);
      }
    }catch(e){ /* sin red en el paso previo: se sube igual */ }
    const iso = new Date().toISOString();
    const copia = JSON.parse(JSON.stringify(S));
    delete copia.perfil;              // el perfil es de este dispositivo: nunca viaja a la nube
    copia._sync = Date.parse(iso);
    const cuerpo = JSON.stringify({data: copia, actualizado: iso,
      actualizado_por: (S.perfil && S.perfil.nombre) || 'sin perfil'});
    let r = await fetch(SB.url + '/rest/v1/estado?id=eq.1', {
      method: 'PATCH', headers: sbHdr({'Prefer':'return=minimal'}), body: cuerpo});
    if(r.ok){
      //2) un PATCH sobre0 filas responde ok sin escribir: si no existe la fila, crearla
      const chk = await fetch(SB.url + '/rest/v1/estado?id=eq.1&select=id', {headers: sbHdr()});
      const filas = chk.ok ? await chk.json() : [];
      if(Array.isArray(filas) && !filas.length){
        r = await fetch(SB.url + '/rest/v1/estado', {
          method: 'POST', headers: sbHdr({'Prefer':'return=minimal'}),
          body: JSON.stringify([{id:1, data: copia, actualizado: iso,
            actualizado_por:(S.perfil && S.perfil.nombre)||'sin perfil'}])});
      }
    }
    if(r.ok) S._sync = Date.parse(iso);
  }catch(e){ /* sin red: se reintenta en el próximo guardado */ }
}
function pintarNube(){
  const el = document.getElementById('subtop');
  if(!el) return;
  const base = 'Operatividad de equipos · ' + DATA.cines.length + ' cines · base ' + DATA.gen;
  el.textContent = SB.estado==='conectado'
    ? base + ' · ☁ nube conectada'
    : base + ' · 💾 solo en este dispositivo';
}

/* ================= DIÁLOGO INTERNO (reemplaza prompt/confirm) ================= */
let gOp = null, gResolver = null;
function pedir(op){
  return new Promise(resolve=>{
    gOp = op; gResolver = resolve;
    const m = document.getElementById('modal-gen');
    document.getElementById('g-tit').textContent = op.titulo || '';
    const sub = document.getElementById('g-sub');
    sub.textContent = op.sub || '';
    sub.hidden = !op.sub;
    document.getElementById('g-campos').innerHTML = (op.campos||[]).map(c=>{
      const id = 'g-'+c.id;
      const val = String(c.value==null? '' : c.value)
        .replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;');
      if(c.type==='select'){
        return `<label class="fld" for="${id}"><span>${c.label}</span>
          <select id="${id}" name="${id}">${(c.opciones||[]).map(o=>
            `<option value="${String(o[0]).replace(/"/g,'&quot;')}"${
              String(o[0])===val? ' selected':''}>${o[1]}</option>`).join('')}</select></label>`;
      }
      if(c.type==='textarea'){
        return `<label class="fld" for="${id}"><span>${c.label}</span>
          <textarea id="${id}" name="${id}" rows="${c.rows||5}"
            placeholder="${c.placeholder||''}">${val}</textarea></label>`;
      }
      return `<label class="fld" for="${id}"><span>${c.label}</span>
        <input type="${c.type||'text'}" id="${id}" name="${id}" value="${val}"
          placeholder="${c.placeholder||''}" ${c.inputmode? `inputmode="${c.inputmode}"`:''}
          autocomplete="${c.autocomplete || 'off'}"
          ${c.type==='password'? 'spellcheck="false"':''}></label>`;
    }).join('');
    const err = document.getElementById('g-err');
    err.hidden = true; err.textContent = '';
    document.getElementById('btn-g-ok').textContent = op.ok || 'Guardar';
    m.classList.add('on');
    setTimeout(()=>{
      const f = document.querySelector('#g-campos input, #g-campos select, #g-campos textarea')
        || document.getElementById('btn-g-ok');
      if(f) f.focus();
    }, 60);
  });
}
function cerrarGen(valor){
  const m = document.getElementById('modal-gen');
  if(m) m.classList.remove('on');
  gOp = null;
  if(gResolver){ const r = gResolver; gResolver = null; r(valor); }
}
function valoresGen(){
  const o = {};
  document.querySelectorAll('#g-campos input, #g-campos select, #g-campos textarea').forEach(i=>{
    o[i.id.replace(/^g-/,'')] = i.value;
  });
  return o;
}
function errorGen(msg){
  const e = document.getElementById('g-err');
  e.textContent = msg; e.hidden = false;
  const f = document.querySelector('#g-campos input, #g-campos textarea');
  if(f) f.focus();
}
function rolDe(nombre){
  const u = USU();
  for(const k in u) if((u[k]||[]).indexOf(nombre)>=0) return k;
  return 'soporte';
}
function iniciales(nombre){
  return String(nombre||'?').split(' ').map(x=>x[0]).slice(0,2).join('').toUpperCase();
}

/* Qué pestañas ve cada módulo (la Gerencia ve todo) */
function tabsPermitidos(){
  if(!S.perfil) return [];
  const rol = ROL();
  const base = ['resumen','visitas'];                          // todos registran visitas
  if(rol==='soporte') return base;
  if(rol==='infraestructura') return base.concat(['gestion']);
  if(rol==='coordinacion') return base.concat(['quehacer','gestion']);
  return base.concat(['quehacer','gestion','dashboard']);      // dashboard: solo gerencia
}
function veMeta(){ return ROL()==='gerencia' || ROL()==='coordinacion'; }
/* Solo Soporte manda sus cambios a Coordinación: Gerencia, Coordinación,
   Infraestructura y Centro de datos pasan directo. */
function revDe(enCD){
  if(enCD) return 'ok';
  return ROL()==='soporte' ? 'pendiente' : 'ok';
}
function soloSoporte(){ return ROL()==='soporte'; }
function puedeEditarIdeales(){ return !!S.perfil && ROL()!=='soporte'; }
/* Lo que tú ajustes en ideales se guarda en S.meta (navegador + nube) y se
   aplica encima de DATA.meta (base v3) en cada arranque. */
function aplicarMeta(){
  if(!S.meta) return;
  DATA.meta = DATA.meta || {};
  Object.keys(S.meta).forEach(k=>{
    DATA.meta[k] = Object.assign({}, DATA.meta[k] || {}, S.meta[k]);
  });
}
function editarMeta(cine, campo, valor){
  const n = Number(valor);
  if(!S.meta) S.meta = {};
  const m = S.meta[cine] = S.meta[cine] || {};
  m[campo] = (valor === '' || isNaN(n)) ? null : n;
  DATA.meta = DATA.meta || {};
  const d = DATA.meta[cine] = Object.assign({}, DATA.meta[cine] || {}, m);
  if(d.ideal !== null && d.ideal !== undefined && d.inst !== null && d.inst !== undefined)
    d.disp = Math.max(0, Number(d.ideal) - Number(d.inst));
  else d.disp = m.disp;
  m.disp = d.disp;
  save(); render();
}

/* ---------- Barra flotante: aparece al bajar con el scroll ---------- */
(function barraScroll(){
  const el = document.getElementById('sbar');
  if(!el) return;
  const revisar = ()=>{
    const y = window.scrollY || document.documentElement.scrollTop || 0;
    el.classList.toggle('on', y > 240);
  };
  addEventListener('scroll', revisar, {passive:true});
  addEventListener('resize', revisar);
  revisar();
})();

/* Guardar ideales cuando sales de la celda (Enter o al quitar el foco) */
document.addEventListener('change', e=>{
  const t = e.target; if(!t || !t.closest) return;
  const mc = t.closest('[data-mc]');
  if(mc){ if(puedeEditarIdeales()) editarMeta(mc.dataset.mc, mc.dataset.mk, mc.value); return; }
  const ic = t.closest('[data-ic]');
  if(ic){ if(puedeEditarIdeales()) setIdeal(ic.dataset.ic, ic.dataset.ik, ic.value); return; }
});
/* Recordar si el bloque de ideales está abierto en Qué hacer */
document.addEventListener('toggle', e=>{
  const el = e.target;
  if(el && el.matches && el.matches('[data-qhides]')) vista.qhIdeales = !!el.open;
}, true);

/* ================= ACCESO: pantalla de entrada ================= */
let accesoSel = null;
function accesoHTML(){
  const nombres = Object.entries(USU()).flatMap(([rol, arr])=>
    (arr||[]).map(n=>({n, rol})));
  const conClave = accesoSel && S.claves[accesoSel];
  return `<div class="acceso"><div class="card-acceso">
    <div class="marca">
      <img src="icons/icon-192.png" alt="" width="44" height="44">
      <div><b>Inventario CINEX</b><span>Operatividad de los cines</span></div>
    </div>
    <h2>Entra al panel</h2>
    <p class="sub">Elige tu nombre. El módulo lo asigna Coordinación o Gerencia.</p>
    <div class="nombres" role="group" aria-label="Usuarios del panel">
      ${nombres.map(x=>`<button type="button" data-acc="${x.n}"
          class="${x.n===accesoSel? 'on':''}" aria-pressed="${x.n===accesoSel}">
          <span class="avatar" aria-hidden="true">${iniciales(x.n)}</span>
          <span>${x.n}</span>
          <span class="rol">${ROL_TXT[x.rol]||x.rol}</span>
        </button>`).join('') || '<p class="sub">Sin usuarios: pide alta a Coordinación.</p>'}
    </div>
    ${accesoSel? `
      <label class="fld" for="acc-clave">
        <span>${conClave? 'Tu clave' : 'Crea tu clave (mínimo3 caracteres)'}</span>
        <input type="password" id="acc-clave" name="acc-clave"
          autocomplete="${conClave? 'current-password':'new-password'}"
          inputmode="numeric" placeholder="••••" spellcheck="false">
      </label>
      <p class="err" id="acc-err" role="alert" hidden></p>
      <button class="btn-p" id="acc-entrar" type="button">Entrar</button>
      <p class="pie">¿Otro usuario? Elige tu nombre arriba.</p>`
    : `<p class="pie">Si tu nombre no aparece, pídele a Coordinación o Gerencia
        que te agregue desde <b>Gestión</b>.</p>`}
  </div></div>`;
}
async function entrarAcceso(){
  const n = accesoSel;
  if(!n) return;
  const input = document.getElementById('acc-clave');
  const err = document.getElementById('acc-err');
  const pin = (input && input.value || '').trim();
  const fallo = msg=>{ err.textContent = msg; err.hidden = false; if(input) input.focus(); };
  //1) la base manda: se baja la clave guardada en Supabase antes de comparar
  const rem = await sbClavesRemotas();
  if(rem && rem[n]) S.claves[n] = rem[n];      // si la base la tiene, ésta es la válida
  const guardada = S.claves[n];
  if(guardada){
    if(hashClave(pin) !== guardada) return fallo('Clave incorrecta. Inténtalo otra vez.');
  } else {
    if(rem === null) return fallo('Sin conexión con la base: no se pudo verificar tu clave. Revisa la conexión e inténtalo de nuevo.');
    if(pin.length < 3) return fallo('La clave debe tener al menos3 caracteres.');
    S.claves[n] = hashClave(pin);              // primera vez: se crea y queda en la base
  }
  const rol = rolDe(n);
  S.perfil = {nombre:n, rol};
  accesoSel = null;
  // Coordinación arranca en lo que debe revisar
  if(rol==='coordinacion'){ vista.tab='gestion'; vista.gseccion='aprob'; scrollObj=0; }
  save(); render();
  flash(guardada? 'Entraste como '+ROL_TXT[rol]+' · '+n : 'Clave creada ✓ Entraste como '+n);
}

async function cambiarClave(){
  const n = AUTOR();
  const r = await pedir({
    titulo: 'Cambiar mi clave',
    sub: n + ' · ' + (ROL_TXT[ROL()]||''),
    campos: [{id:'clave', label:'Nueva clave (mínimo3 caracteres)', type:'password',
              autocomplete:'new-password'}],
    ok: 'Guardar clave',
    validar: v => ((v.clave||'').trim().length < 3)? 'Debe tener al menos3 caracteres.' : null
  });
  if(!r) return;
  S.claves[n] = hashClave(r.clave.trim());
  save();
  flash('Clave actualizada ✓');
}

/* ================= INTERACCIÓN ================= */
document.addEventListener('keydown', ev=>{
  if(ev.key==='Enter' && document.activeElement && document.activeElement.id==='e-libre'){
    ev.preventDefault();
    const b = document.getElementById('e-libre-add');
    if(b) b.click();
    return;
  }
  const gen = document.getElementById('modal-gen');
  const abierto = gen && gen.classList.contains('on');
  if(abierto && ev.key==='Enter'){
    ev.preventDefault();
    document.getElementById('btn-g-ok').click();
    return;
  }
  if(abierto && ev.key==='Escape'){ ev.preventDefault(); cerrarGen(null); return; }
  if(ev.key==='Enter'){
    const actual = document.activeElement;
    if(actual && actual.id==='ed-nuevocomp'){ ev.preventDefault(); agregarComponente(); return; }
  }
  if(!abierto && ev.key==='Enter'){
    const actual = document.activeElement;
    if(actual && actual.id==='acc-clave'){ ev.preventDefault(); entrarAcceso(); }
    return;
  }
  if(ev.key==='Escape'){
    const g = document.getElementById('modal-gen');
    if(g && g.classList.contains('on')) cerrarGen(null);
    else { cerrarEquipo(); cerrarEdicion(); cerrarModal(); }
  }
});

document.addEventListener('click', async ev=>{
  const t = ev.target;
  if(t.tagName==='INPUT') return;

  const tab = t.closest('[data-tab]');
  if(tab){
    scrollObj = 0;
    vista.tab = tab.dataset.tab;
    if(vista.tab==='resumen'){ vista.modo = 'home'; vista.cine = null; }
    render();
    return;
  }
  // ---------- diálogo interno (antes: prompt/confirm de Chrome) ----------
  if(t.id==='btn-g-ok'){
    const vals = valoresGen();
    if(gOp && gOp.validar){
      const msg = gOp.validar(vals);
      if(msg){ errorGen(msg); return; }
    }
    cerrarGen(vals);
    return;
  }
  if(t.id==='g-no' || t.id==='modal-gen'){ cerrarGen(null); return; }

  if(t.id==='btn-perfil'){ abrirPerfil(); return; }

  // ---------- acceso ----------
  const acc = t.closest('[data-acc]');
  if(acc){
    accesoSel = acc.dataset.acc;
    render();
    setTimeout(()=>{ const i = document.getElementById('acc-clave'); if(i) i.focus(); }, 60);
    return;
  }
  if(t.id==='acc-entrar'){ entrarAcceso(); return; }

  // ---------- cuenta ----------
  if(t.id==='btn-clave'){ cambiarClave(); return; }
  if(t.id==='btn-perfil2'){
    S.perfil = null; accesoSel = null;
    save(); render(); flash('Saliste del panel ✓');
    return;
  }

  const editando = t.closest('[data-chip],[data-single],[data-comp],[data-ok],[data-ok-area],[data-add],[data-note],[data-mod],[data-cmod],#btn-area,[data-fed],[data-fobs],[data-fplan],[data-fplannew]');
  if(editando && !puedeEditar()){ flash('Módulo Gerencia: solo lectura'); return; }

  const pf = t.closest('[data-pf]');
  if(pf){ vista.planF = pf.dataset.pf; render(); return; }
  if(t.closest('[data-pfreset]')){ vista.planF='todo'; vista.planC='todos';
    vista.planG = vista.planG || 'tipo'; render(); return; }

  const pg = t.closest('[data-pg]');
  if(pg){ vista.planG = pg.dataset.pg; render(); return; }
  const pga = t.closest('[data-pg-abrir]');
  if(pga){
    if(pga.dataset.pgAbrir==='todo'){ vista.planAbrirTodo = true; }
    else { vista.planAbrirTodo = false; vista.planAbiertos = []; }
    render(); return; }
  const am = t.closest('[data-accmas]');
  if(am){
    vista.planLimit = vista.planLimit || {};
    const k = am.dataset.accmas;
    vista.planLimit[k] = (vista.planLimit[k] || 12) + 60;
    render(); return;
  }
  const gf = t.closest('[data-gf]');
  if(gf){ vista.gf = (vista.gf===gf.dataset.gf? null : gf.dataset.gf);
    vista.gfTodo = false; render(); return; }
  if(t.closest('[data-gfclose]')){ vista.gf = null; render(); return; }
  if(t.closest('[data-gfall]')){ vista.gfTodo = true; render(); return; }
  const gfc = t.closest('[data-gfcine]');
  if(gfc){ vista.gf = null; vista.tab='resumen'; vista.modo='cine';
    vista.cine = gfc.dataset.gfcine; scrollObj = 0; render(); return; }

  const pcs = t.closest('[data-pc-set]');
  if(pcs){ vista.planC = pcs.dataset.pcSet; render(); return; }
  const acdel = t.closest('[data-accdel]');
  if(acdel){
    S.acc.splice(+acdel.dataset.accdel,1); save(); render(); return;
  }
  if(t.id==='acc-add'){
    const r = await pedir({
      titulo:'Nueva acción',
      sub:'Se agrega al plan de trabajo del cine filtrado.',
      campos:[
        {id:'desc', label:'Descripción (ej. Comprar pinpad para dulcería 3)'},
        {id:'monto', label:'Monto estimado (US$)', inputmode:'decimal', placeholder:'0'}
      ],
      ok:'Agregar al plan',
      validar: v => !(v.desc||'').trim()? 'Escribe qué hay que hacer.' : null
    });
    if(!r) return;
    const cineSel = vista.planC!=='todos'? vista.planC : 'Varios';
    nuevaAccion({comp:r.desc.trim(), cine:cineSel, area:'Varios', tipo:'comprar',
                 monto: Number(String(r.monto||'').replace(',','.'))||0});
    save(); render(); flash('Acción agregada ✓');
    return;
  }
  if(t.id==='nuevo-cine'){
    if(!adminUsuarios()){ flash('Solo Coordinación o Gerencia agregan cines'); return; }
    const r = await pedir({
      titulo:'Nuevo cine o local',
      sub:'Aparece en la portada con sus áreas. Después agregas los equipos con + Agregar equipo.',
      campos:[
        {id:'nombre', label:'Nombre (ej. Multiplaza Valencia)'},
        {id:'areas', label:'Áreas separadas por coma',
         placeholder:'Taquilla, Dulcería, Plasmas'}
      ],
      ok:'Crear cine',
      validar: v => !(v.nombre||'').trim()? 'Escribe el nombre del cine.' : null
    });
    if(!r) return;
    const nombre = r.nombre.trim();
    let cod = nombre.normalize('NFD').replace(/[\u0300-\u036f]/g,'')
      .replace(/[^A-Za-z]/g,'').slice(0,3).toUpperCase();
    if(!cod) cod = 'CN' + (S.cinesNuevos.length+1);
    while(DATA.cines.some(c=>c.c===cod)) cod = cod.slice(0,2) + (Math.floor(Math.random()*9)+1);
    const areas = (r.areas||'').split(',').map(s=>s.trim()).filter(Boolean);
    const cine = {n:nombre, c:cod, ar:(areas.length? areas : ['Por definir'])
      .map(a=>({a, v:[], vacio:false}))};
    S.cinesNuevos.push(cine);
    DATA.cines.push(cine);
    save(); render();
    flash(nombre+' creado ✓ código '+cod);
    return;
  }
  if(t.id==='prec-aplicar'){
    const txt = document.getElementById('prec-masivo').value || '';
    if(!txt.trim()){ flash('Pega primero la lista de precios'); return; }
    const lineas = txt.split(/\r?\n/).map(s=>s.trim()).filter(Boolean);
    let ok = 0, malos = [];
    lineas.forEach(l=>{
      const m = l.match(/^(.+?)[\s]*(?:=|,|;|\t)\s*([\d.,]+)\s*$/);
      if(!m){ malos.push(l); return; }
      const nombre = m[1].trim();
      const val = parseFloat(m[2].replace(/\./g,'').replace(',','.'));
      if(!nombre || isNaN(val)){ malos.push(l); return; }
      S.precios[nombre] = val;
      ok++;
    });
    save(); render();
    if(ok) flash(ok+' precio(s) aplicado(s)'+(malos.length? ' · '+malos.length+' línea(s) no reconocida(s)':' ✓'));
    else flash('No reconocí ningún precio. Formato: nombre = monto');
    return;
  }
  if(t.id==='prec-limpiar'){
    const ta = document.getElementById('prec-masivo');
    if(ta) ta.value = '';
    return;
  }
  if(t.id==='u-add'){
    if(!adminUsuarios()){ flash('Solo Gerencia y Coordinación administran usuarios'); return; }
    const n = (document.getElementById('u-nombre').value||'').trim();
    const rol = document.getElementById('u-rol').value;
    if(!n){ flash('Escribe el nombre'); return; }
    const u = USU();
    if(Object.values(u).some(l=>l.some(x=>x.toLowerCase()===n.toLowerCase()))){
      flash('Ese nombre ya existe'); return;
    }
    u[rol] = u[rol] || [];
    u[rol].push(n);
    save(); render(); flash(n+' agregado a '+ROL_TXT[rol]+' ✓');
    return;
  }
  const udel = t.closest('[data-userdel]');
  if(udel){
    if(!adminUsuarios()){ flash('Solo Gerencia y Coordinación administran usuarios'); return; }
    const raw = udel.dataset.userdel, k = raw.indexOf('|');
    const rol = raw.slice(0,k), n = raw.slice(k+1);
    const seguro = await pedir({titulo:'Quitar usuario',
      sub:n+' · '+ROL_TXT[rol]+'. Dejará de aparecer en la pantalla de acceso.',
      campos:[], ok:'Sí, quitar'});
    if(!seguro) return;
    const u = USU();
    u[rol] = (u[rol]||[]).filter(x=>x!==n);
    save(); render(); flash(n+' quitado ✓');
    return;
  }
  const creset = t.closest('[data-clavereset]');
  if(creset){
    if(!adminUsuarios()){ flash('Solo Gerencia y Coordinación administran usuarios'); return; }
    const n = creset.dataset.clavereset;
    const seguro = await pedir({titulo:'Reiniciar clave',
      sub:n+' tendrá que crear una clave nueva en su próximo ingreso.',
      campos:[], ok:'Sí, reiniciar'});
    if(!seguro) return;
    delete S.claves[n];
    save(); render(); flash('Clave de '+n+' reiniciada ✓');
    return;
  }
  if(t.id==='exp-plan'||t.id==='exp-plan2'){ exportarPlan(); return; }
  if(t.id==='exp-resumen'){ exportarResumen(); return; }
  if(t.closest('[data-rellenar]')){
    let n = 0;
    S.acc.forEach(a=>{
      if(a.monto==='' || a.monto===0){
        const p = precioDe(a.comp);
        if(p!==''){ a.monto = p; n++; }
      }
      if(!a.cant){ a.cant = 1; n++; }
      a.autor = AUTOR();
    });
    save(); render();
    flash(n? n+' montos rellenados ✓' : 'No hay montos vacíos');
    return;
  }
  if(t.id==='exp-todo2'){ exportar(DATA.cines); return; }
  if(t.id==='exp-mov2'||t.id==='exp-mov3'){ exportarCambios(); return; }
  const rech = t.closest('[data-rechazar]');
  if(rech){
    const mov = S.mov[+rech.dataset.rechazar];
    if(!mov || !puedeAprobar(mov)){
      flash(ROL()==='infraestructura'
        ? 'Infraestructura corrige solo áreas técnicas'
        : 'Solo Coordinación o Gerencia pueden rechazar');
      return;
    }
    const i = +rech.dataset.rechazar;
    const rr = await pedir({titulo:'Rechazar o corregir',
      sub:'El motivo queda en la auditoría con tu nombre.',
      campos:[{id:'motivo', label:'Motivo'}], ok:'Rechazar cambio',
      validar: v => !(v.motivo||'').trim()? 'Escribe el motivo del rechazo.' : null});
    if(!rr) return;
    const motivo = rr.motivo.trim();
    const m = S.mov[i];
    let accion = 'Cambio rechazado';
    if(m){
      m.rev='rechazado'; m.com=motivo;
      m.aprobarTs = new Date().toISOString(); m.rap = m.aprobarTs;
      m.aprobadoPor=AUTOR();
      // deshacer lo estructural: el rechazo devuelve el inventario a como estaba
      if(m.tipoMov==='alta' && m.ref && S.borrados.indexOf(m.ref)<0){
        S.borrados.push(m.ref);
        delete S.est[m.ref]; delete S.notas[m.ref]; delete S.mod[m.ref];
        S.acc = S.acc.filter(a=> !(a.key && a.key.indexOf(m.ref+'|')===0));
        accion = 'Alta rechazada · el equipo no se incorpora';
      } else if(m.tipoMov==='retiro' && m.ref){
        delete S.retirados[m.ref];
        accion = 'Retiro rechazado · el equipo vuelve a los totales';
      } else if(m.tipoMov==='borrado' && m.ref){
        S.borrados = S.borrados.filter(x=> x!==m.ref);
        accion = 'Borrado rechazado · el equipo se restaura';
      }
    }
    save(); render(); flash(accion);
    return;
  }

  if(t.closest('#modal') && !t.closest('.mbox')){ cerrarModal(); return; }
  const causa = t.closest('[data-causa]');
  if(causa){
    mCausa = causa.dataset.causa;
    [...document.querySelectorAll('[data-causa]')].forEach(b=>b.classList.remove('on'));
    causa.classList.add('on');
    return;
  }
  if(t.closest('[data-causa-nueva]')){
    const rc = await pedir({titulo:'Nueva causa de daño',
      sub:'Aparecerá en la lista al marcar un equipo dañado.',
      campos:[{id:'causa', label:'Nombre de la causa', placeholder:'Ej. Cinta transportadora'}],
      ok:'Agregar causa',
      validar: v => !(v.causa||'').trim()? 'Escribe la causa.' : null});
    if(rc){
      const nueva = rc.causa.trim();
      if(!S.causas.includes(nueva)) S.causas.push(nueva);
      mCausa = nueva; save(); pintarCausas(nueva);
      flash('Causa agregada ✓');
    }
    return;
  }
  const accb = t.closest('[data-accion]');
  if(accb){
    [...document.querySelectorAll('[data-accion]')].forEach(b=>b.classList.remove('on'));
    accb.classList.add('on');
    return;
  }
  if(t.id==='m-si'){ confirmarModal(); return; }
  if(t.id==='m-no'){ cerrarModal(); return; }

  const aprTodo = t.closest('[data-aprobar-todo]');
  if(aprTodo){
    if(ROL()!=='coordinacion' && ROL()!=='gerencia'){
      flash('Solo Coordinación o Gerencia aprueban'); return;
    }
    const filtro = aprTodo.dataset.aprobarTodo;
    let n = 0;
    S.mov.forEach(m=>{
      if(m.rev!=='pendiente') return;
      if(filtro!=='todos' && m.cine!==filtro) return;
      m.rev='ok'; m.rap=new Date().toISOString(); m.aprobadoPor=AUTOR(); n++;
    });
    save(); render();
    flash(n? n+' cambios aprobados ✓' : 'Nada pendiente con ese filtro');
    return;
  }

  const verfic = t.closest('[data-verfic]');
  if(verfic){
    const cine = verfic.dataset.verfic;
    if(cine){ scrollObj=0; vista={...vista, modo:'cine', cine, filtro:'all', areaF:'todas'};
      vista.tab='resumen'; render(); }
    return;
  }

  const apr = t.closest('[data-aprobar]');
  if(apr){
    const mov = S.mov[+apr.dataset.aprobar];
    if(!mov || !puedeAprobar(mov)){
      flash(ROL()==='infraestructura'
        ? 'Infraestructura aprueba solo áreas técnicas (red, centro de datos, plasmas)'
        : 'Solo Coordinación o Gerencia aprueban');
      return;
    }
    const i = +apr.dataset.aprobar;
    if(S.mov[i]){ S.mov[i].rev='ok'; S.mov[i].rap=new Date().toISOString();
      S.mov[i].aprobadoPor=AUTOR(); }
    save(); render(); flash('Revisión aprobada ✓'); return;
  }

  const cine = t.closest('[data-cine]');
  if(cine){ scrollObj=0; vista={...vista, modo:'cine', cine:cine.dataset.cine,
    filtro:'all', areaF:'todas'}; render(); return; }
  if(t.id==='volver'){ scrollObj=0; vista={...vista, modo:'home', cine:null, filtro:'all'}; render(); return; }
  if(t.id==='sbar-top'){ try{ window.scrollTo({top:0, behavior:'smooth'}); }catch(e){ window.scrollTo(0,0); } return; }
  if(t.id==='sbar-reset'){
    vista.gf=null; vista.gfTodo=false; vista.filtro='all';
    vista.planF='todo'; vista.planC='todos';
    render(); flash('Filtros restablecidos ✓'); return;
  }
  if(t.id==='sbar-back'){
    if(vista.modo==='cine'){ scrollObj=0; vista={...vista, modo:'home', cine:null, filtro:'all'}; render(); }
    else if(vista.tab && vista.tab!=='resumen'){ scrollObj=0; vista.tab='resumen'; render(); }
    else { try{ window.scrollTo({top:0, behavior:'smooth'}); }catch(e){ window.scrollTo(0,0); } }
    return;
  }

  if(t.id==='btn-entrar-bloq'){ abrirPerfil(); return; }

  const gsf = t.closest('[data-gsec-foco]');
  if(gsf){ scrollObj=0; vista.tab='gestion'; vista.gseccion=gsf.dataset.gsecFoco; render(); return; }

  const gs = t.closest('[data-gsec]');
  if(gs){ vista.gseccion = gs.dataset.gsec; scrollObj = 0; render(); return; }

  // --- VISITAS ---
  const va = t.closest('[data-varea]');
  if(va && vista.vis){ const a = va.dataset.varea, i = vista.vis.areas.indexOf(a);
    if(i>=0) vista.vis.areas.splice(i,1); else vista.vis.areas.push(a);
    render(); return; }
  const vf = t.closest('[data-vfil]');
  if(vf){ vista.visFil = vf.dataset.vfil; render(); return; }
  if(t.id==='vis-guardar'){ guardarVisita(); return; }
  if(t.id==='vis-limpiar'){ const c = document.getElementById('vis-firma');
    if(c && c._limpiar) c._limpiar(); return; }
  const vd = t.closest('[data-vdel]');
  if(vd){
    const id = vd.dataset.vdel;
    const reg = (S.visitas||[]).find(x=>x.id===id);
    pedir({titulo:'Borrar visita', campos:[],
      sub: reg? (fechaBonita(reg.fecha)+' · '+reg.cine+' · '+(reg.visitante||'')) : '',
      ok:'Borrar'}).then(r=>{ if(!r) return;
        S.visitas = (S.visitas||[]).filter(x=>x.id!==id);
        save(); render(); flash('Visita borrada ✓'); });
    return;
  }

  // --- DASHBOARD (solo gerencia): PDF, compartir, agregar acción ---
  if(t.id==='dash-pdf'){ window.print(); return; }
  if(t.id==='dash-share'){
    const url = location.href, txt = 'Inventario CINEX · informe para Gerencia';
    if(navigator.share){ navigator.share({title:'Inventario CINEX', text:txt, url}).catch(()=>{}); return; }
    if(navigator.clipboard && navigator.clipboard.writeText){
      navigator.clipboard.writeText(url).then(()=>flash('Enlace copiado ✓'))
        .catch(()=>flash('No se pudo copiar el enlace')); return;
    }
    flash('Usa "Descargar PDF" y compártelo');
    return;
  }
  if(t.id==='dash-add'){
    const rv = await pedir({titulo:'Nueva acción de plan',
      sub:'Se agrega al plan de toda la cadena.',
      campos:[
        {id:'comp', label:'Qué falta (ej. Impresora fiscal)',
         placeholder:'Nombre del equipo o componente'},
        {id:'cine', type:'select', label:'Cine', opciones: DATA.cines.map(c=>[c.c, c.n])},
        {id:'cant', type:'number', label:'Cantidad', value:'1', inputmode:'numeric'},
        {id:'monto', type:'number', label:'Monto unitario (US$)', inputmode:'decimal'}
      ], ok:'Agregar al plan',
      validar: v=> !(v.comp||'').trim()? 'Escribe qué falta.' : null});
    if(!rv) return;
    nuevaAccion({comp: rv.comp.trim(), cine: rv.cine, area:'Varios', eq:'', puesto:'',
      tipo:'comprar', cant: Math.max(1, Number(rv.cant)||1),
      monto: (rv.monto===''||rv.monto==null)? ''
             : (Number(String(rv.monto).replace(/[^\d.]/g,''))||0)});
    save(); render(); flash('Acción agregada al plan ✓');
    return;
  }

  // --- ÁREAS: renombrar / borrar (papelerita) ---
  const aren = t.closest('[data-arenom]');
  if(aren){
    const clave = aren.dataset.arenom, k = clave.indexOf('|');
    const cod = clave.slice(0,k), ar = clave.slice(k+1);
    const rv = await pedir({titulo:'Nombre del área',
      sub: cineNombre(cod)+' · cambia solo la vista; los equipos conservan su lugar y sus historiales.',
      campos:[{id:'v', label:'Nombre', value: nombreArea(cod, ar),
               placeholder:'Ej. Taquilla + Dulcería'}], ok:'Guardar nombre'});
    if(!rv) return;
    const nvo = (rv.v||'').trim();
    S.areaNombres = S.areaNombres || {};
    if(!nvo || nvo===ar) delete S.areaNombres[clave];
    else S.areaNombres[clave] = nvo;
    save(); render(); flash('Nombre del área actualizado ✓');
    return;
  }
  const ard = t.closest('[data-areadel]');
  if(ard){
    const clave = ard.dataset.areadel, k = clave.indexOf('|');
    const cod = clave.slice(0,k), ar = clave.slice(k+1);
    const rv = await pedir({titulo:'Borrar área',
      sub: nombreArea(cod, ar)+' · desaparece del panel, de los totales, del plan y de la exportación. No toca a los demás cines.',
      campos:[{id:'ok', label:'Escribe BORRAR para confirmar'}], ok:'Borrar área',
      validar: v=> (v.ok||'').trim().toUpperCase()!=='BORRAR' ? 'Escribe BORRAR para confirmar.' : null});
    if(!rv) return;
    S.areaBorr = Array.isArray(S.areaBorr)? S.areaBorr : [];
    if(S.areaBorr.indexOf(clave)<0) S.areaBorr.push(clave);
    aplicarBorradosArea();          // se quita de DATA ahora mismo
    save(); render(); flash('Área borrada ✓');
    return;
  }

  // --- OBSOLETO ---
  if(t.id==='ed-obsoleto'){
    const id = mEd, it = findItem(id); if(!it) return;
    if(esObsoleto(id)){
      delete S.obsoletos[id];
      (S.acc||[]).forEach(a=>{ if(a.key===id+'|obsoleto' &&
        (a.estado==='pendiente'||a.estado==='cotizado')){
          a.estado='ejecutado'; a.cierre=new Date().toISOString();
          a.autor=AUTOR(); a.nota='dejó de ser obsoleto'; }});
      save(); render(); abrirEdicion(id); flash('Dejó de ser obsoleto ✓');
      return;
    }
    const rv = await pedir({titulo:'Marcar como obsoleto',
      sub: nombreDe(it)+' · entra en las compras como reemplazo.',
      campos:[{id:'nota', label:'Motivo (opcional)',
               placeholder:'Ej. sin refacciones / fuera de garantía'}], ok:'Marcar obsoleto'});
    if(!rv) return;
    const nota = (rv.nota||'').trim();
    S.obsoletos = S.obsoletos || {};
    S.obsoletos[id] = {ts:new Date().toISOString(), autor:AUTOR(), nota};
    const dd = id.indexOf('|')<0 ? dondeEsta(id) : null;
    const cine = dd? dd.c.c : partes(id).cine;
    const area = dd? dd.area : partes(id).area;
    const comp = nombreDe(it);
    S.acc = S.acc || [];
    if(!S.acc.find(a=> a.key===id+'|obsoleto')){
      S.acc.push({key:id+'|obsoleto', cine, area, eq:comp, comp, puesto:(it.p||''),
        tipo:'comprar', monto: it.c? (precioDe('Estación completa')||'') : (precioDe(comp)||''),
        cant:1, estado:'pendiente', nota:'obsoleto'+(nota? ': '+nota : ' · reemplazo'),
        autor:AUTOR(), ts:new Date().toISOString()});
    }
    save(); render(); abrirEdicion(id);
    flash('Obsoleto ✓ · ya cuenta en las compras');
    return;
  }

  const edit = t.closest('[data-edit]');
  if(edit){ abrirEdicion(edit.dataset.edit); return; }
  if(t.id==='ed-si'){ guardarEdicion(); return; }
  const qc = t.closest('[data-qcomp]');
  if(qc){ quitarComponente(+qc.dataset.qcomp); return; }
  if(t.id==='ed-addcomp'){ agregarComponente(); return; }
  if(t.id==='ed-borrar'){ borrarEquipo(); return; }
  if(t.id==='ed-retirar'){ retirarEquipo(); return; }
  if(t.id==='ed-no' || t.id==='modal-ed'){ cerrarEdicion(); return; }
  if(t.id==='ed-arriba' || t.id==='ed-abajo'){
    if(!mEd) return;
    if(moverEquipo(mEd, t.id==='ed-arriba'? -1 : 1)){ render(); actualizarPos(); }
    else flash('Ya está en el extremo del área');
    return;
  }

  const mod = t.closest('[data-mod]');
  if(mod){
    const id = mod.dataset.mod;
    const it0 = findItem(id);
    const rv = await pedir({titulo:'Modelo del equipo',
      sub: it0? nombreDe(it0) : '',
      campos:[{id:'v', label:'Modelo', value: modeloDe(it0)||'', placeholder:'Ej. HP ProDesk 400'}],
      ok:'Guardar modelo'});
    if(rv){ S.mod[id]=rv.v.trim(); save(); render(); flash('Modelo guardado ✓'); }
    return;
  }
  const cmod = t.closest('[data-cmod]');
  if(cmod){
    const raw = cmod.dataset.cmod, k = raw.lastIndexOf('|');
    const id = raw.slice(0,k), ci = +raw.slice(k+1);
    const it = findItem(id);
    const ch = it && it.c ? it.c[ci] : null;
    const rcv = await pedir({titulo:'Modelo del componente',
      sub: ch? ch.n : 'Componente',
      campos:[{id:'v', label:'Modelo / número de serie',
               value: S.cmod[raw] || (ch && !esVacio(ch.v)? ch.v : '')}],
      ok:'Guardar modelo'});
    if(rcv){ S.cmod[raw]=rcv.v.trim(); save(); render(); flash('Modelo guardado ✓'); }
    return;
  }
  const det = t.closest('[data-det]');
  if(det){ const raw = det.dataset.det, k = raw.lastIndexOf('|');
    abrirDetalle(raw.slice(0,k), +raw.slice(k+1)); return; }
  const inc = t.closest('[data-incid]');
  if(inc){ abrirDetalle(inc.dataset.incid); return; }
  if(t.id==='dt-cerrar' || t.id==='modal-det'){
    document.getElementById('modal-det').classList.remove('on'); return; }

  const dis = t.closest('[data-disco]');
  if(dis){
    const raw = dis.dataset.disco;
    const i1 = raw.lastIndexOf('|'), i = +raw.slice(i1+1);
    const r2 = raw.slice(0, i1), j = r2.lastIndexOf('|');
    const id = r2.slice(0, j), ci = +r2.slice(j+1);
    const arr = discosDe(id, ci);
    arr[i] = DISCO_EST[(DISCO_EST.indexOf(arr[i]) + 1) % DISCO_EST.length];
    save(); render(); return;
  }
  const dadd = t.closest('[data-dadd]');
  if(dadd){ const raw = dadd.dataset.dadd, k = raw.lastIndexOf('|');
    const id = raw.slice(0,k), ci = +raw.slice(k+1);
    discosDe(id, ci).push('ok'); save(); render(); abrirDetalle(id, ci);
    flash('Disco agregado ✓'); return; }
  const ddel = t.closest('[data-ddel]');
  if(ddel){ const raw = ddel.dataset.ddel, k = raw.lastIndexOf('|');
    const id = raw.slice(0,k), ci = +raw.slice(k+1);
    const arr = discosDe(id, ci);
    if(arr.length>1) arr.pop(); else { flash('Debe quedar al menos1 disco'); return; }
    save(); render(); abrirDetalle(id, ci);
    flash('Disco quitado ✓'); return; }

  const comp = t.closest('[data-comp]');
  if(comp){ const raw = comp.dataset.comp, k = raw.lastIndexOf('|');
    abrirModal(raw.slice(0,k), +raw.slice(k+1)); return; }

  const chip = t.closest('[data-chip]');
  if(chip){ abrirModal(chip.dataset.item, +chip.dataset.chip); return; }

  const single = t.closest('[data-single]');
  if(single){ abrirModal(single.dataset.single, 'e'); return; }

  // selector de estado dentro de la ventana
  const estBtn = t.closest('#m-estados [data-estado]');
  if(estBtn && mPend){
    mPend.nuevo = estBtn.dataset.estado;
    document.querySelectorAll('#m-estados [data-estado]').forEach(b=>
      b.classList.toggle('on', b===estBtn));
    actualizarFalloModal(); return;
  }

  const nota = t.closest('[data-note]');
  if(nota){
    const id = nota.dataset.note;
    const rn = await pedir({titulo:'Nota / observación',
      sub:'Déjala vacía para borrar la nota actual.',
      campos:[{id:'v', label:'Nota', value: S.notas[id]||'',
               placeholder:'Ej. Repuesto pedido, llega el viernes'}],
      ok:'Guardar nota'});
    if(rn){
      if(rn.v.trim()) S.notas[id] = rn.v.trim();
      else delete S.notas[id];
      save(); render();
      flash('Nota guardada ✓');
    }
    return;
  }

  // ---------- edición desde la ficha de la ventana de estado ----------
  const fed = t.closest('[data-fed]');
  if(fed){
    const id = fed.dataset.fed;
    cerrarModal();
    abrirEdicion(id);
    return;
  }

  const fobs = t.closest('[data-fobs]');
  if(fobs){
    const id = fobs.dataset.fobs;
    const ito = findItem(id);
    if(!ito) return;
    const orig = (S.obs && Object.prototype.hasOwnProperty.call(S.obs, id))
      ? S.obs[id] : (ito.o || '');
    const ro = await pedir({titulo:'Observación del inventario',
      sub: `${nombreDe(ito)} · texto de la hoja / Ops`,
      campos:[{id:'v', type:'textarea', rows:7, label:'Observación inv.',
               value: orig, placeholder:'Lo que traiga la hoja u Ops…'}],
      ok:'Guardar observación'});
    if(ro){
      S.obs = S.obs || {};
      const v = String(ro.v||'');
      if(v.trim() === String(orig).trim()) delete S.obs[id];   // sin cambios: no guardamos copia
      else S.obs[id] = v;
      save(); render();
      flash('Observación guardada ✓');
    }
    return;
  }

  const fplan = t.closest('[data-fplan]');
  if(fplan){
    const raw = fplan.dataset.fplan, k = raw.lastIndexOf('|');
    const id = raw.slice(0,k), ix = raw.slice(k+1);
    const idx = ix==='e'? 'e' : +ix;
    const itp = findItem(id); if(!itp) return;
    const ap = accDe(id, idx);
    if(!ap){ flash('Esta acción todavía no está en el plan'); return; }
    const rp = await pedir({titulo:'Acción del plan',
      sub: `${nombreDe(itp)} · ${etiquetaComp(id, idx)}`,
      campos:[
        {id:'tipo', type:'select',
         label: estadoActualDe(id, idx)==='falta' ? 'Acción (un faltante se compra)'
                : 'Acción',
         value: estadoActualDe(id, idx)==='falta' ? 'comprar' : (ap.tipo||'reparar'),
         opciones:[['comprar','Comprar'],['reparar','Reparar'],['revisar','Revisar']]},
        {id:'cant', type:'number', label:'Cantidad', value: ap.cant||1, inputmode:'numeric'},
        {id:'estado', type:'select', label:'Estado', value: ap.estado||'pendiente',
         opciones: EST_PLAN},
        {id:'monto', type:'number', label:'Monto (US$)', inputmode:'decimal',
         value: (ap.monto===''||ap.monto==null)? '' : ap.monto},
        {id:'nota', label:'Observación / motivo', value: ap.nota||'',
         placeholder:'Ej. repuesto en espera'}
      ],
      ok:'Guardar plan'});
    if(rp){
      ap.tipo = estadoActualDe(id, idx)==='falta' ? 'comprar'
        : (['reparar','comprar','revisar'].includes(rp.tipo)? rp.tipo : ap.tipo);
      ap.cant = Math.max(1, Number(rp.cant)||1);
      ap.estado = EST_PLAN.some(e=>e[0]===rp.estado)? rp.estado : (ap.estado||'pendiente');
      ap.monto = (rp.monto===''||rp.monto==null)? ''
        : (Number(String(rp.monto).replace(/[^\d.]/g,''))||0);
      ap.nota = String(rp.nota||'').trim();
      ap.autor = AUTOR(); ap.ts = new Date().toISOString();
      save(); render();
      flash('Plan actualizado ✓');
    }
    return;
  }

  const fpn = t.closest('[data-fplannew]');
  if(fpn){
    const raw = fpn.dataset.fplannew, k = raw.lastIndexOf('|');
    const id = raw.slice(0,k), ix = raw.slice(k+1);
    const idx = ix==='e'? 'e' : +ix;
    const itp = findItem(id); if(!itp) return;
    const p = partes(id); if(!p) return;
    // equipos nuevos (id sin tubos): el cine real sale de dondeEsta
    const dd = id.indexOf('|')<0 ? dondeEsta(id) : null;
    const cine = dd? dd.c.c : p.cine, area = dd? dd.area : p.area;
    const comp = etiquetaComp(id, idx);
    S.acc.push({key: id+'|'+idx, cine: cine, area: area, eq: itp.n, comp: comp,
      puesto: (itp.p||''), tipo: TIPO_EST[estadoActualDe(id, idx)] || 'reparar',
      monto: precioDe(comp), cant: 1, estado:'pendiente', nota:'',
      autor: AUTOR(), ts: new Date().toISOString()});
    save(); render();
    flash('Agregada al plan ✓');
    return;
  }
  const ok = t.closest('[data-ok]');
  if(ok){
    const id = ok.dataset.ok;
    const it = findItem(id);
    if(it && it.c) it.c.forEach((ch,ci)=> nuevoDe(id, ci, 'ok'));
    else nuevoDe(id, 'e', 'ok');
    save(); render(); return;
  }
  const okArea = t.closest('[data-ok-area]');
  if(okArea){
    const nombre = okArea.dataset.okArea;
    const c = DATA.cines.find(x=>x.c===vista.cine);
    const marcar = items => items.forEach(it=>{
      if(it.c) it.c.forEach((ch,ci)=> nuevoDe(it.id, ci, 'ok'));
      else nuevoDe(it.id, 'e', 'ok');
    });
    (c.ar.find(a=>a.a===nombre)||{v:[]}).v.forEach(marcar);
    ((nuevosDe(c)[nombre])||[]).forEach(marcar);
    save(); render(); return;
  }
  const af = t.closest('[data-areaf]');
  if(af){ vista.areaF = af.dataset.areaf; scrollObj = 0; render(); return; }

  const f = t.closest('[data-f]');
  if(f){ vista.filtro = f.dataset.f; render(); return; }

  const add = t.closest('[data-add]');
  if(add){ abrirEquipo(add.dataset.add); return; }
  if(t.closest('[data-plant]')){
    mEq.plant = t.closest('[data-plant]').dataset.plant;
    pintarPlantillas();
    return;
  }
  const ca = t.closest('[data-compadd]');
  if(ca){
    const n = ca.dataset.compadd;
    const i = mEq.comps.indexOf(n);
    if(i>=0) mEq.comps.splice(i,1); else mEq.comps.push(n);
    pintarPlantillas();
    return;
  }
  if(t.id==='e-si'){ crearEquipo(); return; }
  if(t.id==='e-libre-add'){
    const i = document.getElementById('e-libre');
    const nombre = (i.value||'').trim();
    if(!nombre){ flash('Escribe el componente'); return; }
    if(!COMP_CAT.some(c=> c.toLowerCase()===nombre.toLowerCase())){
      COMP_CAT.push(nombre);                 // queda disponible para los próximos
      if(mEq.comps.indexOf(nombre)<0) mEq.comps.push(nombre);
      i.value = '';
      pintarPlantillas();
      flash(nombre+' agregado al equipo ✓');
    } else {
      flash('Ese componente ya está en la lista');
    }
    return;
  }
  if(t.id==='e-no' || t.id==='modal-e'){ cerrarEquipo(); return; }
  if(t.id==='btn-area'){
    const v = (document.getElementById('nueva-area').value||'').trim();
    if(!v){ flash('Escribe el nombre del área'); return; }
    const c = DATA.cines.find(x=>x.c===vista.cine);
    (S.nuevos[c.c] = S.nuevos[c.c]||[]).push(
      {id:'add-'+Date.now(), area:v, n:'Equipo nuevo', d:'', o:'', e:'pend'});
    save(); render(); return;
  }
  if(t.id==='exp-cine'){ exportar([DATA.cines.find(x=>x.c===vista.cine)]); return; }
  if(t.id==='exp-todo'){ exportar(DATA.cines); return; }
  if(t.id==='exp-mov'){ exportarCambios(); return; }
});

document.addEventListener('keydown', ev=>{
  if(ev.key==='Enter' && ev.target.dataset && ev.target.dataset.addInput){
    const btn = document.querySelector(`[data-add="${CSS.escape(ev.target.dataset.addInput)}"]`);
    if(btn) btn.click();
  }
  // Escape se maneja en el listener de teclado (arriba)
});

document.addEventListener('change', ev=>{
  const t = ev.target;
  const d = t.dataset || {};
  if(d.pc!==undefined){ vista.planC = t.value; render(); return; }
  if(d.acc!==undefined){
    const a = S.acc[+d.acc];
    if(a){ a[d.campo] = t.value; a.autor=AUTOR(); a.ts=new Date().toISOString(); }
    save(); render(); return;
  }
  if(d.accm!==undefined){
    const a = S.acc[+d.accm];
    if(a){ a.monto = Number(String(t.value).replace(/[^\d.]/g,''))||0;
           a.autor=AUTOR(); a.ts=new Date().toISOString(); }
    save(); render(); return;
  }
  if(d.prec!==undefined){
    S.precios[d.prec] = Number(String(t.value).replace(/[^\d.]/g,''))||'';
    save(); render(); return;
  }
  if(d.accc!==undefined){
    const a = S.acc[+d.accc];
    if(a){ a.cant = Math.max(1, Number(t.value)||1); a.autor=AUTOR(); a.ts=new Date().toISOString(); }
    save(); render(); return;
  }
  if(d.accobs!==undefined){
    const a = S.acc[+d.accobs];
    if(a){ a.nota = t.value.trim(); a.autor=AUTOR(); a.ts=new Date().toISOString(); }
    save(); render(); return;
  }
  if(!d.vtid) return;
  const id = d.vtid;
  const val = t.value.trim();
  S.vtid[id] = val;
  const it = findItem(id);
  if(it && it.c){
    const ci = it.c.findIndex(ch=>ch.n==='VTID');
    if(ci>=0){
      const e = S.est[id] || (S.est[id]={});
      if(val && (e[ci]==='falta'||e[ci]===undefined)) e[ci]='ok';
      if(!val) e[ci]='falta';
    }
  }
  save(); flash(val? 'VTID guardado ✓' : 'VTID vacío');
  render();
});

/* ================= EXPORTAR ================= */
function bajar(nombre, filas){
  const csv = '\uFEFF' + filas.map(f=> f.map(x=> '"'+String(x==null?'':x).replace(/"/g,'""')+'"').join(';')).join('\r\n');
  const blob = new Blob([csv], {type:'text/csv;charset=utf-8;'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = nombre;
  document.body.appendChild(a); a.click(); a.remove();
  flash('Archivo descargado ✓');
}
function exportar(cines){
  const filas = [['Cine','Código','Área','Equipo / Puesto','Modelo','VTID','Componente','Estado',
                 'Causa / nota','Revisión','Fecha']];
  const fecha = hoy();
  cines.forEach(c=>{
    const nuevos = nuevosDe(c);
    const areas = c.ar.map(a=>({nombre:a.a, items:a.v.concat(nuevos[a.a]||[])}));
    Object.keys(nuevos).forEach(k=>{ if(!areas.find(a=>a.nombre===k)) areas.push({nombre:k, items:nuevos[k]}); });
    areas.forEach(a=> a.items.forEach(it=>{
      const obsDe = (S.obs && Object.prototype.hasOwnProperty.call(S.obs, it.id))
        ? S.obs[it.id] : it.o;
      const nota = [obsDe, S.notas[it.id]].filter(Boolean).join(' | ');
      const rev = pendientes().some(x=> x.cine===c.c && x.area===a.nombre && x.eq===it.n) ? 'PENDIENTE' : '';
      if(it.c){
        const vt = vtidDe(it);
        it.c.forEach((ch,ci)=>{
          if(ch.n==='VTID') return;                       // el VTID viaja en su propia columna
          const est = (S.est[it.id]||{})[ci]||'falta';
          const mod = valorComp(it, ci, ch) || (ch.n==='Terminal POS'? modeloDe(it) : '');
          filas.push([c.n, c.c, a.nombre, it.n+(it.p? ' (puesto '+it.p+')':''), mod, vt,
                      (ETIQ[ch.n]||ch.n), LABEL[est], nota, rev, fecha]);
        });
      } else {
        const est = (S.est[it.id]||{}).e||'ok';
        filas.push([c.n, c.c, a.nombre, it.n, modeloDe(it), '', '—', LABEL[est], nota, rev, fecha]);
      }
    }));
  });
  bajar('inventario-cinex-'+(cines.length===1? cines[0].c.toLowerCase():'todo')+'-'+fecha+'.csv', filas);
}
function exportarCambios(){
  const filas = [['Fecha y hora','Cine','Área','Equipo','Componente','Estado anterior',
                 'Estado nuevo','Causa','Revisión','Aprobado por / Fecha','Cargado por']];
  S.mov.slice().reverse().forEach(m=>{
    filas.push([m.ts, m.cine, m.area, m.eq, m.comp, m.de, m.a, m.causa||'',
                m.rev==='pendiente'?'PENDIENTE':(m.rev==='rechazado'?'RECHAZADO':'OK'),
                (m.aprobadoPor? m.aprobadoPor+' '+(m.rap||'').slice(0,10):''), m.autor||'']);
  });
  bajar('cambios-cinex-'+hoy()+'.csv', filas);
}
function exportarPlan(){
  const filas = [['Cine','Área','Puesto','Equipo','Componente','Acción','Cantidad',
                  'Monto estimado (US$)','Estado','Causa / detalle','Cargado por','Fecha','Cerrado']];
  const ET = {reparar:'Reparar', comprar:'Comprar/Sustituir', revisar:'Revisar'};
  const ES = {pendiente:'Pendiente', cotizado:'Cotizado', comprado:'Comprado', ejecutado:'Ejecutado'};
  S.acc.forEach(a=> filas.push([a.cine, a.area, a.puesto||'', a.eq||'', a.comp,
      ET[a.tipo]||a.tipo, a.cant||1, a.monto===''? '' : a.monto, ES[a.estado]||a.estado,
      a.nota||'', a.autor||'', (a.ts||'').slice(0,10), (a.cierre||'').slice(0,10)]));
  bajar('plan-trabajo-cinex-'+hoy()+'.csv', filas);
}

pintarNube();
(async ()=>{
  if(await sbConectar()){
    const rem = await sbCargar();
    if(rem && fusionarRemoto(rem)){ aplicarComps(); aplicarBorradosArea();
      ensureIds(); sincronizarPlan(); save(); }
  }
  pintarNube();
  if(S.perfil) render();
})();
if(S.cinesNuevos.length){
  S.cinesNuevos.forEach(c=>{ if(!DATA.cines.some(x=>x.c===c.c)) DATA.cines.push(c); });
}
aplicarComps();
aplicarBorradosArea();
aplicarMeta();
ensureIds();
sincronizarPlan();          // crea/completa el plan DESPUÉS de asignar ids
document.getElementById('subtop').textContent =
  'Operatividad de equipos · ' + DATA.cines.length + ' cines · base ' + DATA.gen;
save();
render();
accesoSel = null;

/* ================= PWA: instalable y sin conexión ================= */
let pwaPrompt = null;
window.addEventListener('beforeinstallprompt', (ev)=>{
  ev.preventDefault();
  pwaPrompt = ev;
  const b = document.getElementById('btn-instalar');
  if(b) b.style.display = '';
});
window.addEventListener('appinstalled', ()=>{
  const b = document.getElementById('btn-instalar');
  if(b) b.style.display = 'none';
  flash('App instalada en el dispositivo ✓');
});
document.addEventListener('click', (ev)=>{
  if(ev.target.id==='btn-instalar' && pwaPrompt){
    pwaPrompt.prompt();
    pwaPrompt.userChoice.then(()=>{
      pwaPrompt = null;
      const b = document.getElementById('btn-instalar');
      if(b) b.style.display = 'none';
    });
  }
});
if('serviceWorker' in navigator && /^https?:$/.test(location.protocol)){
  window.addEventListener('load', ()=>{
    navigator.serviceWorker.register('sw.js').catch(()=>{});
  });
}
