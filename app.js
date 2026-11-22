/* Codex JDR — appli compagnon de JDR (PWA, hors-ligne) */
'use strict';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const uid = () => Math.random().toString(36).slice(2, 10);
const norm = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[’']/g, ' ');

/* ---------- Systèmes ---------- */
const SYSTEMS = { sw: window.SW_DATA, sda: window.SDA_DATA, ygg: window.YGG_DATA, motw: window.MOTW_DATA };
const SYS_LIST = [
  { id: 'sw', name: 'Star Wars (FFG)' },
  { id: 'sda', name: 'Le Seigneur des Anneaux (CODA)' },
  { id: 'motw', name: 'Monster of the Week' },
  { id: 'ygg', name: 'Yggdrasill' },
];

/* ---------- Stockage ---------- */
const KEY = 'codex.v1';
let S = load();
function load() {
  let d = {};
  try { d = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { }
  return Object.assign({ sys: 'sw', chars: [], mj: {} }, d);
}
function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { toast('Stockage plein !'); } }
const D = () => SYSTEMS[S.sys];

function toast(t) { const el = $('#toast'); el.textContent = t; el.classList.add('on'); clearTimeout(toast.t); toast.t = setTimeout(() => el.classList.remove('on'), 1800); }
function modal(html) { $('#modalBox').innerHTML = html; $('#modal').classList.add('on'); }
function closeModal() { $('#modal').classList.remove('on'); }
$('#modal').addEventListener('click', e => { if (e.target.id === 'modal') closeModal(); });

/* ---------- Navigation ---------- */
let VIEW = 'persos';
$$('nav button').forEach(b => b.onclick = () => go(b.dataset.v));
function go(v) {
  VIEW = v;
  $$('nav button').forEach(b => b.classList.toggle('on', b.dataset.v === v));
  $$('.view').forEach(s => s.classList.toggle('on', s.id === 'v-' + v));
  render();
  window.scrollTo(0, 0);
}
function render() {
  const M = (window.MODS || {})[S.sys];
  if (M && M[VIEW]) return M[VIEW]();
  ({ persos: renderPersos, des: renderDice, mj: renderMJ, regles: renderRules })[VIEW]();
}
$('#sysSel').innerHTML = SYS_LIST.map(s => `<option value="${s.id}" ${s.disabled ? 'disabled' : ''}>${esc(s.name)}</option>`).join('');
$('#sysSel').value = S.sys;
$('#sysSel').onchange = e => { S.sys = e.target.value; CUR = null; save(); render(); };

/* =====================================================================
   DÉS NARRATIFS
   s succès · a avantage · t triomphe · f échec · h menace · d désastre · L lumière · D obscurité
   ===================================================================== */
const DICE = {
  ability:     { nm: 'Aptitude',   col: 'var(--ab)', sh: 'd8',  txt: '#fff', f: ['', 's', 's', 'ss', 'a', 'a', 'sa', 'aa'] },
  proficiency: { nm: 'Maîtrise',   col: 'var(--pr)', sh: 'd12', txt: '#000', f: ['', 's', 's', 'ss', 'ss', 'a', 'sa', 'sa', 'sa', 'aa', 'aa', 't'] },
  boost:       { nm: 'Fortune',    col: 'var(--bo)', sh: 'd6',  txt: '#000', f: ['', '', 's', 'sa', 'aa', 'a'] },
  difficulty:  { nm: 'Difficulté', col: 'var(--di)', sh: 'd8',  txt: '#fff', f: ['', 'f', 'ff', 'h', 'h', 'h', 'hh', 'fh'] },
  challenge:   { nm: 'Défi',       col: 'var(--ch)', sh: 'd12', txt: '#fff', f: ['', 'f', 'f', 'ff', 'ff', 'h', 'h', 'fh', 'fh', 'hh', 'hh', 'd'] },
  setback:     { nm: 'Infortune',  col: 'var(--se)', sh: 'd6',  txt: '#fff', f: ['', '', 'f', 'f', 'h', 'h'] },
  force:       { nm: 'Force',      col: 'var(--fo)', sh: 'd12', txt: '#000', f: ['D', 'D', 'D', 'D', 'D', 'D', 'DD', 'L', 'L', 'LL', 'LL', 'LL'] },
};
const ORDER = ['ability', 'proficiency', 'boost', 'difficulty', 'challenge', 'setback', 'force'];
const SYM = { s: '✦', a: '⬢', t: '★', f: '✖', h: '⬣', d: '☠', L: '○', D: '●' };
const SYMNM = { s: 'Succès', a: 'Avantage', t: 'Triomphe', f: 'Échec', h: 'Menace', d: 'Désastre', L: 'Lumière', D: 'Obscurité' };
let POOL = Object.fromEntries(ORDER.map(k => [k, 0]));
let LAST = null, POOL_LABEL = '';

function shape(k, size = 14) {
  const c = DICE[k].col, st = k === 'setback' ? '#888' : '#0006';
  const sh = DICE[k].sh;
  const p = sh === 'd6' ? `<rect x="2" y="2" width="20" height="20" rx="3"/>` :
    sh === 'd8' ? `<path d="M12 1L23 12L12 23L1 12Z"/>` : `<path d="M12 1L22 7V17L12 23L2 17V7Z"/>`;
  return `<svg class="pip" width="${size}" height="${size}" viewBox="0 0 24 24" fill="${c}" stroke="${st}" stroke-width="1.5">${p}</svg>`;
}
function poolHTML(p) { return ORDER.flatMap(k => Array(p[k] || 0).fill(shape(k))).join(''); }

function buildPool(car, rank) {
  const hi = Math.max(car, rank), lo = Math.min(car, rank);
  return { proficiency: lo, ability: hi - lo };
}
function rollPool(p) {
  const out = [];
  ORDER.forEach(k => { for (let i = 0; i < (p[k] || 0); i++) { const f = DICE[k].f[Math.floor(Math.random() * DICE[k].f.length)]; out.push({ k, f }); } });
  const c = { s: 0, a: 0, t: 0, f: 0, h: 0, d: 0, L: 0, D: 0 };
  out.forEach(r => [...r.f].forEach(ch => c[ch]++));
  const succ = c.s + c.t - c.f - c.d, adv = c.a - c.h;
  return { dice: out, c, succ, adv };
}

function renderDice() {
  const el = $('#v-des');
  el.innerHTML = `
  <h2>Lanceur de dés narratifs</h2>
  ${POOL_LABEL ? `<div class="mut" style="margin-bottom:8px">Réserve : <b style="color:var(--acc)">${esc(POOL_LABEL)}</b></div>` : ''}
  <div class="dice-pick">${ORDER.map(k => `
    <div class="dp"><div>${shape(k, 26)}</div><div class="nm">${DICE[k].nm}</div><div class="cnt">${POOL[k]}</div>
    <div class="pm"><button class="b sm" data-m="${k}">−</button><button class="b sm" data-p="${k}">+</button></div></div>`).join('')}
    <div class="dp" style="display:flex;flex-direction:column;justify-content:center;gap:6px">
      <button class="b sm" id="upA" title="Améliorer l'aptitude">⇧ Aptitude</button>
      <button class="b sm" id="upD" title="Améliorer la difficulté">⇧ Difficulté</button>
    </div>
  </div>
  <div class="row" style="margin-top:10px">
    <span class="mut">Difficulté rapide :</span>
    ${['Simple', 'Facile', 'Moyenne', 'Difficile', 'Intimidante', 'Formidable'].map((n, i) => `<button class="b sm" data-diff="${i}">${n}${i ? ' (' + i + ')' : ''}</button>`).join('')}
  </div>
  <div class="row" style="margin-top:12px">
    <button class="b grow" id="clr">Vider</button>
    <button class="b acc grow" id="roll" style="flex:2">Lancer</button>
  </div>
  <div id="result">${LAST ? resultHTML(LAST) : ''}</div>
  <div class="card mut" style="margin-top:14px">
    ${Object.entries(SYM).map(([k, v]) => `<span style="margin-right:10px">${v} ${SYMNM[k]}</span>`).join('')}
  </div>`;
  $$('[data-p]', el).forEach(b => b.onclick = () => { POOL[b.dataset.p]++; renderDice(); });
  $$('[data-m]', el).forEach(b => b.onclick = () => { POOL[b.dataset.m] = Math.max(0, POOL[b.dataset.m] - 1); renderDice(); });
  $$('[data-diff]', el).forEach(b => b.onclick = () => { POOL.difficulty = +b.dataset.diff; POOL.challenge = 0; renderDice(); });
  $('#upA').onclick = () => { if (POOL.ability > 0) { POOL.ability--; POOL.proficiency++; } else POOL.ability++; renderDice(); };
  $('#upD').onclick = () => { if (POOL.difficulty > 0) { POOL.difficulty--; POOL.challenge++; } else POOL.difficulty++; renderDice(); };
  $('#clr').onclick = () => { POOL = Object.fromEntries(ORDER.map(k => [k, 0])); LAST = null; POOL_LABEL = ''; renderDice(); };
  $('#roll').onclick = () => {
    if (!ORDER.some(k => POOL[k])) return toast('Ajoute des dés');
    LAST = rollPool(POOL); if (navigator.vibrate) navigator.vibrate(30); renderDice();
  };
}
function resultHTML(r) {
  const dice = r.dice.map(d => `<div class="die" style="background:${DICE[d.k].col};color:${DICE[d.k].txt};${d.k === 'setback' ? 'border:1px solid #555' : ''}">${[...d.f].map(c => SYM[c]).join('') || '·'}</div>`).join('');
  const hasCheck = r.dice.some(d => d.k !== 'force');
  let v = '';
  if (hasCheck) v = r.succ > 0 ? `<div class="verdict ok">Réussite (${r.succ} ✦ net)</div>` : `<div class="verdict ko">Échec</div>`;
  const parts = [];
  if (hasCheck) {
    if (r.adv > 0) parts.push(`<span class="ok">${r.adv} ⬢ Avantage${r.adv > 1 ? 's' : ''}</span>`);
    if (r.adv < 0) parts.push(`<span class="ko">${-r.adv} ⬣ Menace${r.adv < -1 ? 's' : ''}</span>`);
    if (r.c.t) parts.push(`<span style="color:var(--pr)">${r.c.t} ★ Triomphe</span>`);
    if (r.c.d) parts.push(`<span class="ko">${r.c.d} ☠ Désastre</span>`);
  }
  if (r.c.L || r.c.D) parts.push(`<span>${r.c.L} ○ Lumière · ${r.c.D} ● Obscurité</span>`);
  return `<div class="res">${dice}</div>${v}<div class="sum">${parts.join('') || (hasCheck ? '<span class="mut">Aucun avantage ni menace</span>' : '')}</div>`;
}
function sendToDice(pool, label) {
  POOL = Object.assign(Object.fromEntries(ORDER.map(k => [k, 0])), pool);
  POOL_LABEL = label; LAST = null; go('des');
}

/* =====================================================================
   PERSONNAGES (Star Wars FFG)
   ===================================================================== */
let CUR = null;      // id perso ouvert
let PTAB = 'fiche';  // onglet de fiche

function newChar() {
  const c = {
    id: uid(), sys: 'sw', name: 'Nouveau perso', player: '', book: 'eote', creation: true,
    species: '', career: '', specs: [], car: {}, skills: {}, free: { career: [], spec: [], species: [] },
    talents: [], extras: [], xpBonus: 0, xpEarned: 0, credits: 500,
    oblig: { type: '', val: 10, opts: [] }, duty: { type: '', val: 10, opts: [] }, moral: { val: 50, strength: '', weak: '', opt: '' },
    motivation: '', desc: '', weapons: [], armor: { name: '', soak: 0, def: 0, rdef: 0 }, gear: '', notes: '',
    wounds: 0, strain: 0, crits: '', force: 0, forceManual: false,
    tree: {}, powers: {}, dedi: {}, motiv: {}, pocket: 0,
  };
  D().chars.forEach(k => c.car[k.id] = 1);
  return c;
}
const getChar = id => S.chars.find(c => c.id === id);
const sp = c => D().species.find(s => s.id === c.species);
const career = c => D().careers.find(s => s.id === c.career);
const allSpecs = () => D().careers.flatMap(cr => cr.specs.map(s => Object.assign({ career: cr.id, careerName: cr.name }, s)));
const specById = id => allSpecs().find(s => s.id === id);

function careerSkills(c) {
  const set = new Set();
  const cr = career(c); if (cr) cr.skills.forEach(s => set.add(s));
  c.specs.forEach(id => { const s = specById(id); if (s) s.skills.forEach(k => set.add(k)); });
  const s = sp(c); if (s && s.extraCareer) s.extraCareer.forEach(k => set.add(k));
  return set;
}
function freeRanks(c, sk) {
  return ['career', 'spec', 'species'].reduce((n, k) => n + (c.free[k] || []).filter(x => x === sk).length, 0);
}
function rank(c, sk) { return freeRanks(c, sk) + ((c.skills[sk] || {}).buy || 0); }
function baseChar(c, id) { const s = sp(c); return s ? s.car[id] : 1; }

function xpCost(c) {
  const cs = careerSkills(c);
  let chars = 0, skills = 0, specs = 0, tal = 0, ex = 0;
  if (sp(c)) D().chars.forEach(k => { for (let v = baseChar(c, k.id) + 1; v <= (c.car[k.id] || 0); v++) chars += 10 * v; });
  Object.keys(c.skills).forEach(sk => {
    const f = freeRanks(c, sk), b = (c.skills[sk] || {}).buy || 0;
    for (let r = f + 1; r <= f + b; r++) skills += 5 * r + (cs.has(sk) ? 0 : 5);
  });
  c.specs.forEach((id, i) => { if (i === 0) return; const s = specById(id); specs += 10 * (i + 1) + (s && s.career === c.career ? 0 : 10); });
  c.talents.forEach(t => tal += 5 * (+t.row || 0));
  Object.entries(c.tree || {}).forEach(([sid, idx]) => { if (c.specs.includes(sid)) idx.forEach(i => tal += 5 * (Math.floor(i / 4) + 1)); });
  let pw = 0;
  Object.entries(c.powers || {}).forEach(([pid, nodes]) => { const P = powerById(pid); if (P) nodes.forEach(k => { const [r, i] = k.split(',').map(Number); pw += (P.rows[r] || { c: [] }).c[i] || 0; }); });
  c.extras.forEach(e => ex += (+e.xp || 0));
  return { chars, skills, specs, tal, pw, ex, total: chars + skills + specs + tal + pw + ex };
}
function xpTotal(c) { const s = sp(c); return (s ? s.xp : 0) + (+c.xpBonus || 0) + trades(c).xp + (+c.xpEarned || 0); }
/* Bonus de création via Obligation (eote), Devoir (aor) ou Moralité (fad) */
function trades(c) {
  const r = D().books_rules, out = { xp: 0, cr: 0, ob: 0, du: 0, mo: 0 };
  if (c.book === 'eote') (c.oblig.opts || []).forEach(id => { const o = r.eote.extra.find(x => x.id === id); if (o) { out.xp += o.xp || 0; out.cr += o.cr || 0; out.ob += o.ob || 0; } });
  if (c.book === 'aor') (c.duty.opts || []).forEach(id => { const o = r.aor.extra.find(x => x.id === id); if (o) { out.xp += o.xp || 0; out.cr += o.cr || 0; out.du += o.du || 0; } });
  if (c.book === 'fad') { const o = r.fad.extra.find(x => x.id === (c.moral.opt || '')); if (o) { out.xp += o.xp || 0; out.cr += o.cr || 0; out.mo += o.mo || 0; } }
  return out;
}
const obTotal = c => (+c.oblig.val || 0) + trades(c).ob;
const duTotal = c => Math.max(0, (+c.duty.val || 0) - trades(c).du);
const moTotal = c => c.creation ? 50 + trades(c).mo : (+c.moral.val || 50);
function derived(c) {
  const s = sp(c), v = id => cv(c, id);
  const arm = c.armor || {};
  const baseWT = (!c.creation && c.baseWT) ? c.baseWT : (s ? s.wound : 10) + v('vig');
  const baseST = (!c.creation && c.baseST) ? c.baseST : (s ? s.strain : 10) + v('vol');
  const baseF = Math.max((career(c) || {}).force || 0, ...c.specs.map(id => (specById(id) || {}).force || 0));
  return {
    wt: baseWT + 2 * talCount(c, 'TOUGH'),
    st: baseST + talCount(c, 'GRIT'),
    soak: v('vig') + (+arm.soak || 0) + talCount(c, 'ENDUR'),
    def: +arm.def || 0, rdef: +arm.rdef || 0,
    enc: 5 + v('vig'),
    force: c.forceManual ? +c.force : (baseF ? baseF + talCount(c, 'FORCERAT') : 0),
  };
}
/* ----- Talents des arbres ----- */
const TAL = () => window.SW_TALENTS || {};
const TREE = sid => (window.SW_TREES || {})[sid];
const powerById = id => (window.SW_POWERS || []).find(p => p.id === id);
function cv(c, k) { return (c.car[k] || 0) + Object.values(c.dedi || {}).filter(x => x === k).length; }
function ownedTalents(c) {
  const out = [];
  c.specs.forEach(sid => { const T = TREE(sid); if (!T) return; ((c.tree || {})[sid] || []).forEach(i => out.push({ key: T.t[Math.floor(i / 4)][i % 4], sid, i })); });
  const s = sp(c); if (s && s.talents) s.talents.forEach(k => out.push({ key: k, sid: 'espece', i: -1 }));
  return out;
}
function talCount(c, key) { return ownedTalents(c).filter(t => t.key === key).length; }
function treeLinks(T, i) { return (T.d[Math.floor(i / 4)] || [])[i % 4] || ''; }
function treeAvailable(T, owned, i) {
  const r = Math.floor(i / 4), col = i % 4, L = treeLinks(T, i);
  if (r === 0) return true;
  return (L.includes('U') && owned.includes(i - 4)) || (L.includes('D') && owned.includes(i + 4)) ||
    (L.includes('L') && col > 0 && owned.includes(i - 1)) || (L.includes('R') && col < 3 && owned.includes(i + 1));
}
function treeConnected(T, owned) {
  // tous les talents possédés doivent rester reliés à la première rangée
  const set = new Set(owned), seen = new Set(owned.filter(i => i < 4)), stack = [...seen];
  while (stack.length) {
    const i = stack.pop(), L = treeLinks(T, i), col = i % 4;
    const nb = [];
    if (L.includes('U')) nb.push(i - 4); if (L.includes('D')) nb.push(i + 4);
    if (L.includes('L') && col > 0) nb.push(i - 1); if (L.includes('R') && col < 3) nb.push(i + 1);
    nb.forEach(j => { if (set.has(j) && !seen.has(j)) { seen.add(j); stack.push(j); } });
  }
  return seen.size === set.size;
}

function renderPersos() {
  const el = $('#v-persos');
  if (CUR && getChar(CUR)) return renderSheet(getChar(CUR));
  CUR = null;
  el.innerHTML = `
  <h2>Personnages</h2>
  <div class="list">${S.chars.filter(c => c.sys === S.sys).map(c => {
    const s = sp(c), cr = career(c);
    return `<div class="it" data-open="${c.id}"><div class="grow"><b>${esc(c.name)}</b>
      <div class="mut">${esc([s && s.name, cr && cr.name, c.specs.map(x => (specById(x) || {}).name).join(' / ')].filter(Boolean).join(' · ') || 'À créer')}</div></div>
      ${c.creation ? '<span class="pill c">création</span>' : ''}</div>`;
  }).join('') || '<p class="mut">Aucun personnage pour l\'instant.</p>'}</div>
  <div class="row"><button class="b acc grow" id="newC">+ Créer un personnage</button><button class="b" id="impC">Importer</button></div>
  <input type="file" id="impF" accept=".json,application/json" hidden>`;
  $('#newC').onclick = () => { const c = newChar(); S.chars.push(c); save(); CUR = c.id; PTAB = 'creation'; render(); window.scrollTo(0, 0); };
  $$('[data-open]', el).forEach(d => d.onclick = () => { CUR = d.dataset.open; PTAB = getChar(CUR).creation ? 'creation' : 'fiche'; render(); });
  $('#impC').onclick = () => $('#impF').click();
  $('#impF').onchange = async e => {
    try { const c = JSON.parse(await e.target.files[0].text()); c.id = uid(); S.chars.push(c); save(); toast('Personnage importé'); render(); }
    catch (err) { toast('Fichier invalide'); }
  };
}

function renderSheet(c) {
  const el = $('#v-persos');
  const tabs = [['creation', c.creation ? 'Création' : 'Progression'], ['fiche', 'Fiche'], ['equip', 'Équipement'], ['notes', 'Notes']];
  el.innerHTML = `
  <div class="row" style="margin-bottom:10px"><button class="b sm" id="back">← Persos</button>
    <div class="grow"></div><button class="b sm" id="prt">🖨️ PDF</button><button class="b sm" id="exp">Exporter</button><button class="b sm bad" id="del">Suppr.</button></div>
  <input id="cname" value="${esc(c.name)}" style="font-size:20px;font-weight:800;margin-bottom:10px">
  <div class="tabs">${tabs.map(([k, n]) => `<button class="b sm ${PTAB === k ? 'on' : ''}" data-t="${k}">${n}</button>`).join('')}</div>
  <div id="sheet"></div>`;
  $('#back').onclick = () => { CUR = null; render(); };
  $('#cname').onchange = e => { c.name = e.target.value; save(); };
  $('#del').onclick = () => { if (confirm('Supprimer ' + c.name + ' ?')) { S.chars = S.chars.filter(x => x !== c); CUR = null; save(); render(); } };
  $('#prt').onclick = () => printSheet(c);
  $('#exp').onclick = () => download(c.name.replace(/\W+/g, '_') + '.json', JSON.stringify(c, null, 1));
  $$('[data-t]', el).forEach(b => b.onclick = () => { PTAB = b.dataset.t; renderSheet(c); window.scrollTo(0, 0); });
  ({ creation: tabCreation, fiche: tabFiche, equip: tabEquip, notes: tabNotes })[PTAB](c, $('#sheet'));
}

function xpBar(c) {
  const t = xpTotal(c), k = xpCost(c), rest = t - k.total;
  return `<div class="xpbar"><span>XP : ${t}</span><span>Dépensée : ${k.total}</span><span class="${rest < 0 ? 'neg' : ''}">Reste : ${rest}</span></div>`;
}

/* ----- Onglet création / progression ----- */
function tabCreation(c, el) {
  const d = D(), s = sp(c), cr = career(c), cs = careerSkills(c);
  const books = d.books;
  const specOpts = allSpecs();
  const chosenSpec0 = specById(c.specs[0]);
  el.innerHTML = `
  ${xpBar(c)}
  ${c.creation ? `
  <div class="card">
    <label class="f">Gamme de départ</label>
    <select id="book">${Object.entries(books).map(([k, v]) => `<option value="${k}" ${c.book === k ? 'selected' : ''}>${esc(v)}</option>`).join('')}</select>
    <p class="mut" style="margin:6px 0 0">Détermine Obligation (Aux confins), Devoir (L'Ère de la Rébellion) ou Moralité (Force et Destinée). Les espèces et carrières des 3 livres sont compatibles.</p>
  </div>
  <h2>1 · Espèce</h2>
  <div class="card">
    <select id="spec-ies"><option value="">— choisir —</option>${Object.entries(books).map(([bk, bn]) => `<optgroup label="${esc(bn)}">${d.species.filter(x => x.book === bk).map(x => `<option value="${x.id}" ${c.species === x.id ? 'selected' : ''}>${esc(x.name)}</option>`).join('')}</optgroup>`).join('')}</select>
    ${s ? `<div class="row" style="margin-top:10px">${d.chars.map(k => `<span class="pill">${k.abbr} ${s.car[k.id]}</span>`).join('')}</div>
      <p class="mut">Seuil de blessure ${s.wound} + Vigueur · Seuil de stress ${s.strain} + Volonté · XP de départ ${s.xp}</p>
      <div style="font-size:14px">${s.abil.map(a => `<p style="margin:4px 0">• ${esc(a)}</p>`).join('')}</div>
      ${speciesFreeUI(c, s)}` : ''}
  </div>
  <h2>2 · Carrière</h2>
  <div class="card">
    <select id="career"><option value="">— choisir —</option>${Object.entries(books).map(([bk, bn]) => `<optgroup label="${esc(bn)}">${d.careers.filter(x => x.book === bk && !x.universal).map(x => `<option value="${x.id}" ${c.career === x.id ? 'selected' : ''}>${esc(x.name)}</option>`).join('')}</optgroup>`).join('')}</select>
    ${cr ? `<p class="mut">Compétences de carrière : ${cr.skills.map(k => skName(k)).join(', ')}${cr.force ? ` · Indice de Force ${cr.force}` : ''}</p>
     ${pickFree(c, 'career', cr.skills, nCareerFree(c), `Choisis ${nCareerFree(c)} compétences de carrière (1 rang gratuit chacune)`)}` : ''}
  </div>
  ${cr ? `<h2>3 · Spécialisation</h2>
  <div class="card">
    <select id="spec0"><option value="">— choisir —</option>${cr.specs.map(x => `<option value="${x.id}" ${c.specs[0] === x.id ? 'selected' : ''}>${esc(x.name)}</option>`).join('')}</select>
    ${chosenSpec0 ? `<p class="mut">Compétences de carrière bonus : ${chosenSpec0.skills.map(k => skName(k)).join(', ')}</p>
      ${pickFree(c, 'spec', chosenSpec0.skills, nSpecFree(c), `Choisis ${nSpecFree(c)} compétences bonus (1 rang gratuit chacune)`)}` : ''}
  </div>` : ''}` : `
  <div class="card">
    <label class="f">XP gagnée en jeu</label>
    <div class="row"><input id="xpE" type="number" value="${+c.xpEarned || 0}" class="grow"><button class="b sm" data-xpadd="5">+5</button><button class="b sm" data-xpadd="10">+10</button><button class="b sm" data-xpadd="15">+15</button></div>
    <p class="mut">Hors création, les caractéristiques ne s'achètent plus avec de l'XP (sauf talent spécial) : modifie-les à la main dans la fiche si besoin. Les rangs de compétence n'ont plus de maximum de 2.</p>
  </div>`}

  <h2>${c.creation ? '4 · ' : ''}Caractéristiques</h2>
  <div class="chars">${d.chars.map(k => `<div class="ch"><div class="n">${k.name}</div><div class="v">${cv(c, k.id)}</div>
    <div class="pm"><button class="b sm" data-cm="${k.id}">−</button><button class="b sm" data-cp="${k.id}">+</button></div></div>`).join('')}</div>
  ${c.creation ? `<p class="mut">Coût : 10 × nouvelle valeur. Maximum 5 à la création. C'est le seul moment pour les augmenter avec de l'XP !</p>` : ''}

  <h2>${c.creation ? '5 · ' : ''}Compétences</h2>
  <div class="card">${['general', 'combat', 'connaissance'].map(t => `<h3>${{ general: 'Générales', combat: 'Combat', connaissance: 'Connaissances' }[t]}</h3>` +
    d.skills.filter(k => k.type === t).map(k => {
      const r = rank(c, k.id), f = freeRanks(c, k.id), car = cv(c, k.car);
      return `<div class="sk"><div class="nm">${esc(k.name)} <small class="car">(${carAbbr(k.car)})</small> ${cs.has(k.id) ? '<span class="pill c">carrière</span>' : ''}
        <div class="pool">${poolHTML(buildPool(car, r))}</div></div>
        <div style="font-weight:800;font-size:18px;min-width:34px;text-align:center">${r}${f ? `<div class="mut" style="font-size:10px">${f} offert${f > 1 ? 's' : ''}</div>` : ''}</div>
        <div class="row" style="gap:4px"><button class="b sm" data-sm="${k.id}">−</button><button class="b sm" data-sp="${k.id}">+</button></div></div>`;
    }).join('')).join('')}
  <p class="mut">Coût : 5 × nouveau rang (+5 hors carrière).${c.creation ? ' Maximum 2 rangs à la création.' : ''}</p></div>

  <h2>Spécialisations supplémentaires</h2>
  <div class="card">
    ${c.specs.slice(1).map((id, i) => { const x = specById(id); return `<div class="row" style="margin-bottom:6px"><span class="grow">${esc(x ? x.name : id)} <span class="mut">(${esc(x ? x.careerName : '')})</span></span><span class="mut">${10 * (i + 2) + (x && x.career === c.career ? 0 : 10)} XP</span><button class="b sm bad" data-rs="${i + 1}">✕</button></div>`; }).join('') || '<p class="mut" style="margin:0 0 8px">Aucune.</p>'}
    <div class="row"><select id="addSpec" class="grow"><option value="">+ ajouter une spécialisation…</option>${d.careers.map(cr2 => `<optgroup label="${esc(cr2.name)}">${cr2.specs.filter(x => !c.specs.includes(x.id)).map(x => `<option value="${x.id}">${esc(x.name)}</option>`).join('')}</optgroup>`).join('')}</select></div>
    <p class="mut">Coût : 10 × nombre de spécialisations après achat (+10 si hors carrière). Ajoute aussi 4 compétences de carrière.</p>
  </div>

  <h2>Arbres de talents</h2>
  ${c.specs.length ? c.specs.map(sid => treeHTML(c, sid)).join('') : '<p class="mut">Choisis une spécialisation pour afficher son arbre.</p>'}
  <p class="mut">Touche un talent : <span style="color:var(--acc)">doré</span> = acquis, <span style="color:var(--acc2)">bleu</span> = achetable (relié à un talent acquis ou en 1re rangée). Coût = 5 × rangée.</p>
  ${derived(c).force ? `<h2>Pouvoirs de la Force</h2>${Object.keys(c.powers || {}).map(pid => powerHTML(c, pid)).join('')}
  <div class="row"><select id="addPow" class="grow"><option value="">+ apprendre un pouvoir…</option>${(window.SW_POWERS || []).filter(p => !(c.powers || {})[p.id]).map(p => `<option value="${p.id}">${esc(p.name)} (${p.rows[0].c[0]} XP)</option>`).join('')}</select></div>
  <p class="mut">Le pouvoir de base s'achète d'abord, puis les améliorations reliées. Valeur de Force : ${derived(c).force}.</p>` : ''}
  <h2>Talents hors arbre</h2>
  <div class="card">
    ${c.talents.map((t, i) => `<div class="row" style="margin-bottom:6px;flex-wrap:nowrap"><input value="${esc(t.name)}" data-tn="${i}" placeholder="Nom du talent" class="grow">
      <select data-tr="${i}" style="width:92px">${[0, 1, 2, 3, 4, 5].map(r => `<option value="${r}" ${+t.row === r ? 'selected' : ''}>${r ? 'Rang ' + r : 'Gratuit'}</option>`).join('')}</select>
      <button class="b sm bad" data-td="${i}">✕</button></div>`).join('')}
    <button class="b sm" id="addT">+ Talent</button>
    <p class="mut">Pour les talents offerts par un supplément, le MJ, etc. Les talents d'espèce sont ajoutés automatiquement.</p>
  </div>

  <h2>Autres dépenses d'XP</h2>
  <div class="card">
    ${c.extras.map((t, i) => `<div class="row" style="margin-bottom:6px;flex-wrap:nowrap"><input value="${esc(t.name)}" data-en="${i}" placeholder="Pouvoir de Force, amélioration…" class="grow"><input type="number" value="${+t.xp || 0}" data-ex="${i}" style="width:80px"><button class="b sm bad" data-ed="${i}">✕</button></div>`).join('')}
    <button class="b sm" id="addE">+ Dépense</button>
    <label class="f">XP bonus manuelle (ajustement MJ)</label><input type="number" id="xpB" value="${+c.xpBonus || 0}">
  </div>

  ${c.creation ? `<h2>6 · ${{ eote: 'Obligation', aor: 'Devoir', fad: 'Moralité' }[c.book]}</h2>
  <div class="card">${bookBlock(c)}
    ${c.book === 'fad' ? '<button class="b sm" id="rollMo" style="margin-top:8px">🎲 Tirer force et faiblesse (d100)</button>' : ''}
  </div>
  <h2>7 · Motivation</h2>
  <div class="card">${motivBlock(c)}</div>
  <h2>8 · Équipement de départ</h2>
  <div class="card">
    <p style="margin-top:0">Budget : <b>500 crédits</b>${trades(c).cr ? ` + <b>${trades(c).cr}</b> (échange)` : ''}. Crédits disponibles : <b>${money(c)}</b>.</p>
    <button class="b sm" id="goEquip">🛒 Ouvrir le catalogue (onglet Équipement)</button>
    ${c.book !== 'aor' ? `<p class="mut">Une fois les achats terminés, lance 1d100 : c'est ton argent de poche (non dépensable à la création).</p>
    <button class="b sm" id="pocket" ${c.pocket ? 'disabled' : ''}>🎲 Argent de poche (1d100)${c.pocket ? ' : ' + c.pocket : ''}</button>` : '<p class="mut">Dans L\'Ère de la Rébellion, l\'Alliance peut fournir du matériel de mission en plus (voir avec le MJ).</p>'}
  </div>
  <div class="card"><b>Résumé XP</b>${(() => { const k = xpCost(c); return `<p class="mut">Caractéristiques ${k.chars} · Compétences ${k.skills} · Spécialisations ${k.specs} · Talents ${k.tal} · Pouvoirs ${k.pw} · Autres ${k.ex}</p>`; })()}
    <button class="b acc" id="finish" style="width:100%">Terminer la création</button>
    <p class="mut">Les règles de création se verrouillent (max 5 / max 2). L'XP non dépensée est conservée.</p></div>` : `
  <div class="card"><button class="b" id="reopen" style="width:100%">Revenir en mode création</button></div>`}`;

  const re = () => { save(); tabCreation(c, el); };
  const on = (sel, ev, fn) => { const x = $(sel, el); if (x) x[ev] = fn; };
  on('#book', 'onchange', e => { c.book = e.target.value; re(); });
  on('#spec-ies', 'onchange', e => {
    c.species = e.target.value; const s2 = sp(c);
    if (s2) d.chars.forEach(k => c.car[k.id] = s2.car[k.id]);
    c.free.species = []; re();
  });
  on('#career', 'onchange', e => { c.career = e.target.value; c.specs = []; c.free.career = []; c.free.spec = []; re(); });
  on('#spec0', 'onchange', e => { c.specs[0] = e.target.value; c.specs = c.specs.filter(Boolean); c.free.spec = []; re(); });
  on('#addSpec', 'onchange', e => { if (e.target.value) { if (!c.specs.length) toast('Choisis d\'abord une spécialisation de départ'); else c.specs.push(e.target.value); } re(); });
  $$('[data-rs]', el).forEach(b => b.onclick = () => { c.specs.splice(+b.dataset.rs, 1); re(); });
  $$('[data-free]', el).forEach(b => b.onchange = () => {
    const [kind, sk] = b.dataset.free.split('|');
    const arr = c.free[kind] = c.free[kind] || [];
    if (b.checked) arr.push(sk); else arr.splice(arr.indexOf(sk), 1);
    re();
  });
  $$('[data-spfree]', el).forEach(b => b.onchange = () => {
    const i = +b.dataset.spfree; c.free.species[i] = b.value; c.free.species = c.free.species.filter((x, j) => j < 99); re();
  });
  $$('[data-cp]', el).forEach(b => b.onclick = () => {
    const k = b.dataset.cp; if (!sp(c)) return toast('Choisis une espèce');
    if (c.creation && c.car[k] >= 5) return toast('Max 5 à la création');
    c.car[k]++; re();
  });
  $$('[data-cm]', el).forEach(b => b.onclick = () => {
    const k = b.dataset.cm; if (c.creation && c.car[k] <= baseChar(c, k)) return; if (c.car[k] <= 1) return; c.car[k]--; re();
  });
  $$('[data-sp]', el).forEach(b => b.onclick = () => {
    const k = b.dataset.sp; const r = rank(c, k);
    if (c.creation && r >= 2) return toast('Max 2 rangs à la création');
    if (r >= 5) return; c.skills[k] = c.skills[k] || { buy: 0 }; c.skills[k].buy++; re();
  });
  $$('[data-sm]', el).forEach(b => b.onclick = () => { const k = b.dataset.sm; if (c.skills[k] && c.skills[k].buy > 0) { c.skills[k].buy--; re(); } });
  on('#addT', 'onclick', () => { c.talents.push({ name: '', row: 1, desc: '' }); re(); });
  $$('[data-tc]', el).forEach(b => b.onclick = () => talentModal(c, b.dataset.tc, re));
  $$('[data-pn]', el).forEach(b => b.onclick = () => powerModal(c, b.dataset.pn, re));
  $$('[data-pdel]', el).forEach(b => b.onclick = () => { if (confirm('Oublier ce pouvoir et ses améliorations ?')) { delete c.powers[b.dataset.pdel]; re(); } });
  on('#addPow', 'onchange', e => { const v = e.target.value; if (v) { c.powers = c.powers || {}; c.powers[v] = ['0,0']; } re(); });
  $$('[data-tn]', el).forEach(i => i.onchange = () => { c.talents[+i.dataset.tn].name = i.value; save(); });
  $$('[data-tdesc]', el).forEach(i => i.onchange = () => { c.talents[+i.dataset.tdesc].desc = i.value; save(); });
  $$('[data-tr]', el).forEach(i => i.onchange = () => { c.talents[+i.dataset.tr].row = +i.value; re(); });
  $$('[data-td]', el).forEach(b => b.onclick = () => { c.talents.splice(+b.dataset.td, 1); re(); });
  on('#addE', 'onclick', () => { c.extras.push({ name: '', xp: 0 }); re(); });
  $$('[data-en]', el).forEach(i => i.onchange = () => { c.extras[+i.dataset.en].name = i.value; save(); });
  $$('[data-ex]', el).forEach(i => i.onchange = () => { c.extras[+i.dataset.ex].xp = +i.value; re(); });
  $$('[data-ed]', el).forEach(b => b.onclick = () => { c.extras.splice(+b.dataset.ed, 1); re(); });
  on('#xpB', 'onchange', e => { c.xpBonus = +e.target.value; re(); });
  on('#xpE', 'onchange', e => { c.xpEarned = +e.target.value; re(); });
  $$('[data-xpadd]', el).forEach(b => b.onclick = () => { c.xpEarned = (+c.xpEarned || 0) + (+b.dataset.xpadd); re(); });
  bindMotiv(c, el, re);
  on('#rollMo', 'onclick', () => { const [s, w] = rollMorality(); c.moral.strength = s; c.moral.weak = w; re(); });
  on('#goEquip', 'onclick', () => { PTAB = 'equip'; renderSheet(c); window.scrollTo(0, 0); });
  on('#pocket', 'onclick', () => { const r = 1 + Math.floor(Math.random() * 100); c.pocket = r; c.credits = (+c.credits || 0) + r; toast(`+${r} crédits`); re(); });
  bindBookBlock(c, el, re);
  on('#finish', 'onclick', () => {
    const rest = xpTotal(c) - xpCost(c).total;
    if (!c.species || !c.career || !c.specs.length) return toast('Espèce, carrière et spécialisation requises');
    if (rest < 0) return toast('XP dépensée supérieure à l\'XP disponible');
    { const s0 = sp(c); c.baseWT = (s0 ? s0.wound : 10) + cv(c, 'vig'); c.baseST = (s0 ? s0.strain : 10) + cv(c, 'vol'); if (!c.creditsInit) { c.credits = (+c.credits || 0); } } c.credits = (+c.credits || 0) + trades(c).cr; c.moral.val = moTotal(c); c.creation = false; c.wounds = 0; c.strain = 0; save(); PTAB = 'fiche'; renderSheet(c); window.scrollTo(0, 0);
  });
  on('#reopen', 'onclick', () => { c.credits = (+c.credits || 0) - trades(c).cr; c.creation = true; save(); renderSheet(c); });
}
function nCareerFree(c) { const s = sp(c), cr = career(c); return (s && s.careerFree) || (cr ? cr.freeRanks : 4); }
function nSpecFree(c) { const s = sp(c); return (s && s.specFree) || 2; }
function skName(id) { const k = D().skills.find(s => s.id === id); return k ? k.name : id; }
function carAbbr(id) { return (D().chars.find(k => k.id === id) || {}).abbr || id; }

function pickFree(c, kind, list, n, title) {
  const chosen = c.free[kind] || [];
  return `<label class="f">${esc(title)} — ${chosen.length}/${n}</label>
  <div class="row">${list.map(k => {
    const on = chosen.includes(k);
    const dis = !on && chosen.length >= n;
    return `<label class="b sm" style="display:inline-flex;gap:6px;align-items:center;${on ? 'border-color:var(--acc);color:var(--acc)' : ''}${dis ? ';opacity:.4' : ''}">
      <input type="checkbox" data-free="${kind}|${k}" ${on ? 'checked' : ''} ${dis ? 'disabled' : ''} style="width:auto">${esc(skName(k))}</label>`;
  }).join('')}</div>`;
}
function speciesFreeUI(c, s) {
  if (!s.free || !s.free.length) return '';
  // s.free = [{ label, from:[ids] | 'noncareer' | 'any' }]
  const cs = careerSkills(c);
  return `<label class="f">Rangs offerts par l'espèce</label>` + s.free.map((f, i) => {
    let opts = Array.isArray(f.from) ? f.from : D().skills.map(k => k.id).filter(k => f.from === 'noncareer' ? !cs.has(k) : true);
    if (opts.length === 1 && c.free.species[i] !== opts[0]) { c.free.species[i] = opts[0]; }
    return `<div class="row" style="margin-bottom:6px"><span class="mut grow">${esc(f.label)}</span>
      <select data-spfree="${i}" style="width:auto;max-width:60%"><option value="">—</option>${opts.map(k => `<option value="${k}" ${c.free.species[i] === k ? 'selected' : ''}>${esc(skName(k))}</option>`).join('')}</select></div>`;
  }).join('');
}

function bookBlock(c) {
  const d = D(), r = d.books_rules, t = trades(c);
  const dl = (id, list) => `<datalist id="${id}">${list.map(x => `<option value="${esc(x)}">`).join('')}</datalist>`;
  const checks = (kind, opts, chosen, key, startVal) => opts.map(o => {
    const on = chosen.includes(o.id);
    const used = chosen.reduce((n, id) => n + ((opts.find(x => x.id === id) || {})[key] || 0), 0);
    const dis = !on && used + (o[key] || 0) > startVal;
    return `<label class="b sm" style="display:flex;gap:8px;align-items:center;margin-bottom:6px;${on ? 'border-color:var(--acc);color:var(--acc)' : ''}${dis ? ';opacity:.4' : ''}">
      <input type="checkbox" data-trade="${kind}|${o.id}" ${on ? 'checked' : ''} ${dis ? 'disabled' : ''} style="width:auto"><span class="grow">${esc(o.label)}</span><span class="mut">${kind === 'eote' ? '+' : '−'}${o[key]} ${kind === 'eote' ? 'Obligation' : 'Devoir'}</span></label>`;
  }).join('');
  if (c.book === 'eote') return `
    <label class="f">Type d'Obligation</label><input id="obT" list="obL" value="${esc(c.oblig.type)}" placeholder="Dette, Prime, Famille…">${dl('obL', d.obligations)}
    <label class="f">Valeur de départ (selon la taille du groupe)</label>
    <select id="obV">${r.eote.start.map(([n, v]) => `<option value="${v}" ${+c.oblig.val === v ? 'selected' : ''}>${n} joueurs : ${v}</option>`).join('')}</select>
    <label class="f">Obligation supplémentaire (chaque option une fois, au plus le double du départ)</label>
    ${checks('eote', r.eote.extra, c.oblig.opts || [], 'ob', +c.oblig.val || 0)}
    <p class="mut">Obligation totale : <b>${obTotal(c)}</b>${t.xp ? ` · +${t.xp} XP` : ''}${t.cr ? ` · +${t.cr} crédits` : ''}</p>`;
  if (c.book === 'aor') return `
    <label class="f">Type de Devoir</label><input id="duT" list="duL" value="${esc(c.duty.type)}" placeholder="Renseignements, Secours…">${dl('duL', d.duties)}
    <label class="f">Valeur de départ (selon la taille du groupe)</label>
    <select id="duV">${r.aor.start.map(([n, v]) => `<option value="${v}" ${+c.duty.val === v ? 'selected' : ''}>${n} joueurs : ${v}</option>`).join('')}</select>
    <label class="f">Déductions de Devoir (chaque option une fois, sans dépasser la valeur de départ)</label>
    ${checks('aor', r.aor.extra, c.duty.opts || [], 'du', +c.duty.val || 0)}
    <p class="mut">Devoir total : <b>${duTotal(c)}</b>${t.xp ? ` · +${t.xp} XP` : ''}${t.cr ? ` · +${t.cr} crédits` : ''}</p>`;
  return `
    <label class="f">Option de départ (une seule)</label>
    <select id="moX">${r.fad.extra.map(o => `<option value="${o.id}" ${(c.moral.opt || '') === o.id ? 'selected' : ''}>${esc(o.label)}</option>`).join('')}</select>
    <p class="mut">Moralité de départ : <b>${moTotal(c)}</b>${t.xp ? ` · +${t.xp} XP` : ''}${t.cr ? ` · +${t.cr} crédits` : ''}</p>
    <div class="row" style="margin-top:6px;flex-wrap:nowrap">
      <div class="grow"><label class="f">Force émotionnelle</label><input id="moS" list="moSL" value="${esc(c.moral.strength)}">${dl('moSL', d.strengths)}</div>
      <div class="grow"><label class="f">Faiblesse émotionnelle</label><input id="moW" list="moWL" value="${esc(c.moral.weak)}">${dl('moWL', d.weaknesses)}</div>
    </div>`;
}
function bindBookBlock(c, el, re) {
  const set = (id, fn, ev = 'onchange') => { const x = $(id, el); if (x) x[ev] = e => { fn(e.target.value); re(); }; };
  set('#obT', v => c.oblig.type = v);
  set('#obV', v => { c.oblig.val = +v; c.oblig.opts = []; });
  set('#duT', v => c.duty.type = v);
  set('#duV', v => { c.duty.val = +v; c.duty.opts = []; });
  set('#moX', v => { c.moral.opt = v; c.moral.val = 50 + trades(c).mo; });
  set('#moS', v => c.moral.strength = v);
  set('#moW', v => c.moral.weak = v);
  $$('[data-trade]', el).forEach(b => b.onchange = () => {
    const [kind, id] = b.dataset.trade.split('|');
    const o = kind === 'eote' ? c.oblig : c.duty;
    o.opts = o.opts || [];
    if (b.checked) o.opts.push(id); else o.opts = o.opts.filter(x => x !== id);
    re();
  });
}



/* ----- Motivations (Aux confins / Ère de la Rébellion) et Moralité ----- */
function motivBlock(c) {
  const M = (window.SW_EXTRA.motivations || {})[c.book];
  c.motiv = c.motiv || {};
  if (!M) return `<label class="f">Motivation (facultatif)</label><input id="motiv" value="${esc(c.motivation)}" placeholder="Ce qui pousse ton perso à agir">
    <p class="mut">Dans Force et Destinée, la personnalité passe surtout par la Moralité (force et faiblesse émotionnelles).</p>`;
  const m = c.motiv, list = M.lists[m.type] || [];
  return `<div class="row" style="flex-wrap:nowrap"><div class="grow"><label class="f">Type</label><select id="mvT"><option value="">—</option>${M.types.map(t => `<option ${m.type === t ? 'selected' : ''}>${esc(t)}</option>`).join('')}</select></div>
    <div class="grow"><label class="f">Précision</label><input id="mvS" list="mvL" value="${esc(m.spec || '')}"><datalist id="mvL">${list.map(x => `<option value="${esc(x)}">`).join('')}</datalist></div></div>
    <label class="f">Détails</label><input id="motiv" value="${esc(c.motivation)}" placeholder="Qui, quoi, pourquoi…">
    ${m.type2 ? `<p style="margin:8px 0 0">2e Motivation : <b>${esc(m.type2)} : ${esc(m.spec2)}</b> <button class="b sm" id="mv2x">✕</button></p>` : ''}
    <button class="b sm" id="mvR" style="margin-top:8px">🎲 Tirer au hasard (d10)</button>`;
}
function bindMotiv(c, el, re) {
  const M = (window.SW_EXTRA.motivations || {})[c.book];
  const on = (s, ev, fn) => { const x = $(s, el); if (x) x[ev] = fn; };
  on('#motiv', 'onchange', e => { c.motivation = e.target.value; save(); });
  if (!M) return;
  on('#mvT', 'onchange', e => { c.motiv.type = e.target.value; c.motiv.spec = ''; re(); });
  on('#mvS', 'onchange', e => { c.motiv.spec = e.target.value; save(); });
  on('#mvR', 'onclick', () => {
    const pick = t => M.lists[t][Math.floor(Math.random() * M.lists[t].length)];
    const d10 = 1 + Math.floor(Math.random() * 10);
    if (d10 === 10) { const sh = [...M.types].sort(() => Math.random() - .5); c.motiv = { type: sh[0], spec: pick(sh[0]), type2: sh[1], spec2: pick(sh[1]) }; toast('10 : deux Motivations !'); }
    else { const t = M.types[d10 <= 3 ? 0 : d10 <= 6 ? 1 : 2]; c.motiv = { type: t, spec: pick(t) }; }
    re(); });
  on('#mv2x', 'onclick', () => { delete c.motiv.type2; delete c.motiv.spec2; re(); });
}
function motivText(c) { const m = c.motiv || {}; return [m.type, m.spec].filter(Boolean).join(' : ') + (m.type2 ? ' + ' + m.type2 + ' : ' + m.spec2 : '') + (c.motivation ? (m.type ? ' — ' : '') + c.motivation : ''); }
function rollMorality() {
  const T = window.SW_EXTRA.morality, pick = () => { const r = 1 + Math.floor(Math.random() * 100); return r > 96 ? null : T.find(x => r >= x[0] && r <= x[1]); };
  let a = pick(); if (!a) { const x = pick() || T[0], y = pick() || T[1]; toast('97-00 : deux tirages !'); return [x[2], y[3]]; }
  return [a[2], a[3]];
}
/* ----- Rendu des arbres de talents et des pouvoirs ----- */
function treeHTML(c, sid) {
  const T = TREE(sid), S2 = specById(sid); if (!T) return '';
  const owned = (c.tree || {})[sid] || [];
  const cells = [];
  for (let i = 0; i < 20; i++) {
    const k = T.t[Math.floor(i / 4)][i % 4], t = TAL()[k] || { n: k, a: '' }, L = treeLinks(T, i);
    const own = owned.includes(i), av = !own && treeAvailable(T, owned, i);
    const lr = L.includes('R') && i % 4 < 3, ld = L.includes('D') && i < 16;
    cells.push(`<div class="tc ${own ? 'own' : av ? 'av' : 'lock'} ${t.a && t.a !== 'Passif' ? 'act' : ''}" data-tc="${sid}|${i}">
      <div class="nm">${esc(t.n)}${t.f ? ' ✦' : ''}</div><div class="cost">${5 * (Math.floor(i / 4) + 1)} XP${t.r ? ' · cumul.' : ''}</div>
      ${lr ? `<span class="cr ${own && owned.includes(i + 1) ? 'on' : ''}"></span>` : ''}${ld ? `<span class="cd ${own && owned.includes(i + 4) ? 'on' : ''}"></span>` : ''}</div>`);
  }
  return `<div class="card"><div class="row" style="justify-content:space-between;margin-bottom:8px"><b>${esc(S2 ? S2.name : sid)}</b><span class="mut">${owned.length}/20 · ${owned.reduce((n, i) => n + 5 * (Math.floor(i / 4) + 1), 0)} XP</span></div>
    <div class="tree">${cells.join('')}</div></div>`;
}
function talentModal(c, ref, re) {
  const [sid, si] = ref.split('|'), i = +si, T = TREE(sid);
  const key = T.t[Math.floor(i / 4)][i % 4], t = TAL()[key] || { n: key };
  c.tree = c.tree || {}; const owned = c.tree[sid] = c.tree[sid] || [];
  const own = owned.includes(i), av = treeAvailable(T, owned, i), cost = 5 * (Math.floor(i / 4) + 1);
  const rest = xpTotal(c) - xpCost(c).total;
  const canRemove = own && treeConnected(T, owned.filter(x => x !== i));
  modal(`<h2 style="margin-top:0">${esc(t.n)}</h2>
    <p><span class="pill">${esc(t.a || '')}</span> ${t.r ? '<span class="pill">Cumulable</span>' : ''} ${t.f ? '<span class="pill c">Talent de la Force</span>' : ''} <span class="pill">${cost} XP</span></p>
    ${key === 'DEDI' ? '<p class="mut">Entraînement : +1 à une caractéristique (6 maximum). Choisis laquelle à l\'achat.</p>' : ''}
    ${own ? `<p class="ok">Acquis.</p>` : av ? `<p>Disponible. XP restante : <b class="${rest - cost < 0 ? 'ko' : ''}">${rest}</b></p>` : '<p class="mut">Pas encore accessible : il faut d\'abord acquérir un talent relié.</p>'}
    <div class="row" style="margin-top:12px">
      ${!own && av ? (key === 'DEDI' ? D().chars.map(k => `<button class="b sm acc" data-buy="${k.id}">+1 ${k.abbr}</button>`).join('') : '<button class="b acc" data-buy="1">Acheter</button>') : ''}
      ${own ? `<button class="b bad" id="rmT" ${canRemove ? '' : 'disabled'}>Retirer</button>` : ''}
      <button class="b" id="lookT">📖 Voir dans les livres</button>
      <button class="b" onclick="closeModal()">Fermer</button>
    </div>
    ${own && !canRemove ? '<p class="mut">Retire d\'abord les talents qui en dépendent.</p>' : ''}`);
  $$('[data-buy]').forEach(b => b.onclick = () => {
    if (key === 'DEDI') { const k = b.dataset.buy; if (cv(c, k) >= 6) return toast('Maximum 6'); c.dedi = c.dedi || {}; c.dedi[sid + ':' + i] = k; }
    owned.push(i); closeModal(); re();
  });
  const rm = $('#rmT'); if (rm) rm.onclick = () => { c.tree[sid] = owned.filter(x => x !== i); if (c.dedi) delete c.dedi[sid + ':' + i]; closeModal(); re(); };
  $('#lookT').onclick = () => { closeModal(); lookUp(t.n); };
}
function powerNodes(P) {
  const out = [];
  P.rows.forEach((row, r) => row.k.forEach((k, i) => { if (row.s[i] > 0) out.push({ r, i, span: row.s[i], key: r + ',' + i, abil: k, cost: row.c[i], dir: row.d[i] || '' }); }));
  return out;
}
function powerAvailable(P, owned, n) {
  if (n.r === 0) return true;
  const nodes = powerNodes(P), has = m => owned.includes(m.key);
  const overlap = m => m.i < n.i + n.span && n.i < m.i + m.span;
  return nodes.some(m => has(m) && (
    (n.dir.includes('U') && m.r === n.r - 1 && overlap(m)) || (n.dir.includes('D') && m.r === n.r + 1 && overlap(m)) ||
    (n.dir.includes('L') && m.r === n.r && m.i + m.span === n.i) || (n.dir.includes('R') && m.r === n.r && m.i === n.i + n.span)));
}
function powerHTML(c, pid) {
  const P = powerById(pid); if (!P) return '';
  const owned = c.powers[pid] || [];
  const nodes = powerNodes(P);
  return `<div class="card"><div class="row" style="justify-content:space-between;margin-bottom:8px"><b>${esc(P.name)}</b><button class="b sm bad" data-pdel="${pid}">✕</button></div>
    <div class="tree">${nodes.map(n => { const own = owned.includes(n.key), av = !own && powerAvailable(P, owned, n);
      return `<div class="tc ${own ? 'own' : av ? 'av' : 'lock'}" style="grid-column:${n.i + 1} / span ${n.span}" data-pn="${pid}|${n.key}"><div class="nm">${esc(P.lab[n.abil] || n.abil)}</div><div class="cost">${n.cost} XP</div></div>`; }).join('')}</div></div>`;
}
function powerModal(c, ref, re) {
  const [pid, key] = ref.split('|'), P = powerById(pid), owned = c.powers[pid];
  const n = powerNodes(P).find(x => x.key === key), own = owned.includes(key), av = powerAvailable(P, owned, n);
  const lab = P.lab[n.abil] || n.abil;
  const others = owned.filter(k => k !== key);
  const stillOk = others.every(k => { const m = powerNodes(P).find(x => x.key === k); return m.r === 0 || powerAvailable(P, others.filter(x => x !== k).concat([]), m) || powerAvailable(P, others, m); });
  modal(`<h2 style="margin-top:0">${esc(P.name)} — ${esc(lab)}</h2><p><span class="pill">${n.cost} XP</span></p>
    ${own ? '<p class="ok">Acquis.</p>' : av ? '<p>Disponible.</p>' : '<p class="mut">Pas encore accessible.</p>'}
    <div class="row">${!own && av ? '<button class="b acc" id="buyP">Acheter</button>' : ''}${own && key !== '0,0' ? '<button class="b bad" id="rmP">Retirer</button>' : ''}
    <button class="b" id="lookP">📖 Voir dans les livres</button><button class="b" onclick="closeModal()">Fermer</button></div>`);
  const b = $('#buyP'); if (b) b.onclick = () => { owned.push(key); closeModal(); re(); };
  const r = $('#rmP'); if (r) r.onclick = () => { c.powers[pid] = owned.filter(k => k !== key); closeModal(); re(); };
  $('#lookP').onclick = () => { closeModal(); lookUp(P.name + ' ' + lab.replace(/\s\d+$/, '')); };
}
function lookUp(q) { LASTQ = q; RTAB = 'search'; go('regles'); }

/* ----- Fiche de jeu ----- */
function tabFiche(c, el) {
  const d = D(), dv = derived(c), s = sp(c), cr = career(c);
  const crCredits = c.creation ? trades(c).cr : 0;
  el.innerHTML = `
  <p class="mut" style="margin-top:0">${esc([s && s.name, cr && cr.name, c.specs.map(x => (specById(x) || {}).name).join(' / ')].filter(Boolean).join(' · '))}</p>
  <div class="chars">${d.chars.map(k => `<div class="ch"><div class="v">${cv(c, k.id)}</div><div class="n">${k.name}</div>
   ${!c.creation ? `<div class="pm"><button class="b sm" data-fm="${k.id}">−</button><button class="b sm" data-fp="${k.id}">+</button></div>` : ''}</div>`).join('')}</div>
  <h2>Santé</h2>
  <div class="card">
    <div class="row" style="justify-content:space-between"><b>Blessures</b><div class="trk"><button class="b sm" data-w="-1">−</button><span class="v ${c.wounds > dv.wt ? 'ko' : ''}">${c.wounds}/${dv.wt}</span><button class="b sm" data-w="1">+</button></div></div>
    <div class="row" style="justify-content:space-between;margin-top:8px"><b>Stress</b><div class="trk"><button class="b sm" data-st="-1">−</button><span class="v ${c.strain > dv.st ? 'ko' : ''}">${c.strain}/${dv.st}</span><button class="b sm" data-st="1">+</button></div></div>
    ${c.wounds > dv.wt ? '<p class="ko">Seuil de blessure dépassé : hors de combat + blessure critique !</p>' : ''}
    ${c.strain > dv.st ? '<p class="ko">Seuil de stress dépassé : inconscient / hors de combat.</p>' : ''}
    <label class="f">Blessures critiques</label><textarea id="crits" placeholder="Ex. : 45 – Désorienté…">${esc(c.crits)}</textarea>
    <button class="b sm" id="critRoll">Tirer une blessure critique (d100)</button> <span id="critOut" class="mut"></span>
  </div>
  <div class="stats">
    <div class="stat"><div class="v">${dv.soak}</div><div class="n">Encaissement</div></div>
    <div class="stat"><div class="v">${dv.def}/${dv.rdef}</div><div class="n">Déf. CàC / Dist.</div></div>
    <div class="stat"><div class="v">${dv.enc}</div><div class="n">Encombrement</div></div>
    <div class="stat"><div class="v">${dv.force}</div><div class="n">Indice Force</div></div>
  </div>
  <div class="card" style="margin-top:12px">
    ${c.book === 'eote' ? `<b>Obligation</b> : ${esc(c.oblig.type || '—')} ${obTotal(c)}<br>` : ''}
    ${c.book === 'aor' ? `<b>Devoir</b> : ${esc(c.duty.type || '—')} ${duTotal(c)}<br>` : ''}
    ${c.book === 'fad' ? `<div class="row" style="justify-content:space-between"><b>Moralité</b><div class="trk"><button class="b sm" data-mo="-1">−</button><span class="v">${moTotal(c)}</span><button class="b sm" data-mo="1">+</button></div></div><span class="mut">Force ${esc(c.moral.strength || '—')} · Faiblesse ${esc(c.moral.weak || '—')}</span>
      <div class="row" style="justify-content:space-between;margin-top:6px"><b>Conflit (séance)</b><div class="trk"><button class="b sm" data-cfl="-1">−</button><span class="v">${c.conflict || 0}</span><button class="b sm" data-cfl="1">+</button></div></div><br>` : ''}
    ${motivText(c) ? `<b>Motivation</b> : ${esc(motivText(c))}<br>` : ''}
    <b>Crédits</b> : ${(+c.credits || 0)}${crCredits ? ` (+${crCredits} via échange)` : ''} · <b>XP restante</b> : ${xpTotal(c) - xpCost(c).total}
  </div>
  <h2>Compétences — touche pour lancer</h2>
  <div class="card">${['general', 'combat', 'connaissance'].map(t => d.skills.filter(k => k.type === t).map(k => {
    const r = rank(c, k.id), car = cv(c, k.car), p = buildPool(car, r);
    return `<div class="sk" data-roll="${k.id}" style="cursor:pointer"><div class="nm">${esc(k.name)} <small class="car">(${carAbbr(k.car)})</small></div><div class="pool">${poolHTML(p)}</div><div style="font-weight:800;width:22px;text-align:right">${r}</div></div>`;
  }).join('')).join('')}</div>
  ${c.weapons.length ? `<h2>Armes</h2><div class="card">${c.weapons.map((w, i) => {
    const sk = d.skills.find(k => k.id === w.skill); const r = sk ? rank(c, sk.id) : 0, car = sk ? cv(c, sk.car) : 0;
    const dmg = w.melee ? `${(+w.dmg || 0) + cv(c, 'vig')}` : w.dmg;
    return `<div class="sk" data-wroll="${i}" style="cursor:pointer"><div class="nm"><b>${esc(w.name)}</b> <small>${esc(sk ? sk.name : '')} · Dég ${esc(dmg)} · Crit ${esc(w.crit)} · ${esc(w.range)} ${w.special ? '· ' + esc(w.special) : ''}</small></div><div class="pool">${poolHTML(buildPool(car, r))}</div><div></div></div>`;
  }).join('')}</div>` : ''}
  ${(() => { const own = ownedTalents(c), cnt = {}; own.forEach(t => cnt[t.key] = (cnt[t.key] || 0) + 1);
    const extra = c.talents.filter(t => t.name);
    if (!own.length && !extra.length) return '';
    return `<h2>Talents</h2><div class="card">${Object.entries(cnt).sort((x, y) => (TAL()[x[0]] || {n: x[0]}).n.localeCompare((TAL()[y[0]] || {n: y[0]}).n)).map(([k, n]) => { const t = TAL()[k] || { n: k, a: '' };
      return `<div class="sk" data-look="${esc(t.n)}" style="cursor:pointer;grid-template-columns:1fr auto"><div class="nm"><b>${esc(t.n)}</b>${n > 1 ? ` <span class="pill">rang ${n}</span>` : ''} <small>${esc(t.a)}</small></div><span class="mut">📖</span></div>`; }).join('')}
      ${extra.map(t => `<p style="margin:6px 0"><b>${esc(t.name)}</b> ${t.desc ? `<span class="mut">— ${esc(t.desc)}</span>` : ''}</p>`).join('')}
      <p class="mut">Touche un talent pour lire sa description dans tes livres.</p></div>`; })()}
  ${Object.keys(c.powers || {}).length ? `<h2>Pouvoirs de la Force</h2><div class="card">${Object.entries(c.powers).map(([pid, nodes]) => { const P = powerById(pid); if (!P) return '';
      const labs = nodes.filter(k => k !== '0,0').map(k => { const n = powerNodes(P).find(x => x.key === k); return n ? P.lab[n.abil] : ''; });
      return `<div class="sk" data-look="${esc(P.name)}" style="cursor:pointer;grid-template-columns:1fr auto"><div class="nm"><b>${esc(P.name)}</b><br><small>${esc(labs.join(', ') || 'Pouvoir de base')}</small></div><span class="mut">📖</span></div>`; }).join('')}</div>` : ''}
  ${s ? `<h2>Capacités d'espèce</h2><div class="card">${s.abil.map(a => `<p style="margin:4px 0">• ${esc(a)}</p>`).join('')}</div>` : ''}`;

  const re = () => { save(); tabFiche(c, el); };
  $$('[data-cfl]', el).forEach(b => b.onclick = () => { c.conflict = Math.max(0, (c.conflict || 0) + (+b.dataset.cfl)); re(); });
  $$('[data-mo]', el).forEach(b => b.onclick = () => { if (c.creation) return toast('Modifiable après la création'); c.moral.val = Math.min(100, Math.max(0, moTotal(c) + (+b.dataset.mo))); re(); });
  $$('[data-w]', el).forEach(b => b.onclick = () => { c.wounds = Math.max(0, c.wounds + (+b.dataset.w)); re(); });
  $$('[data-st]', el).forEach(b => b.onclick = () => { c.strain = Math.max(0, c.strain + (+b.dataset.st)); re(); });
  $$('[data-fp]', el).forEach(b => b.onclick = () => { if (c.car[b.dataset.fp] < 6) { c.car[b.dataset.fp]++; re(); } });
  $$('[data-fm]', el).forEach(b => b.onclick = () => { if (c.car[b.dataset.fm] > 1) { c.car[b.dataset.fm]--; re(); } });
  $('#crits', el).onchange = e => { c.crits = e.target.value; save(); };
  $('#critRoll', el).onclick = () => {
    const n = (c.crits.match(/\n?\S/g) ? c.crits.split('\n').filter(x => x.trim()).length : 0);
    const roll = 1 + Math.floor(Math.random() * 100), tot = roll + 10 * n;
    const row = D().crits.find(r => tot >= r[0] && tot <= r[1]) || D().crits[D().crits.length - 1];
    $('#critOut', el).innerHTML = `d100 = ${roll} + ${10 * n} (crit. existantes) = <b>${tot}</b> → <b>${esc(row[2])}</b> (${esc(row[3])})`;
  };
  $$('[data-roll]', el).forEach(r => r.onclick = () => {
    const k = d.skills.find(x => x.id === r.dataset.roll);
    const p = buildPool(cv(c, k.car), rank(c, k.id));
    sendToDice(Object.assign({ difficulty: 2 }, p), `${c.name} · ${k.name}`);
  });
  $$('[data-look]', el).forEach(r => r.onclick = () => lookUp(r.dataset.look));
  $$('[data-wroll]', el).forEach(r => r.onclick = () => {
    const w = c.weapons[+r.dataset.wroll], k = d.skills.find(x => x.id === w.skill); if (!k) return;
    const p = buildPool(cv(c, k.car), rank(c, k.id));
    sendToDice(Object.assign({ difficulty: w.melee ? 2 : 2 }, p), `${c.name} · ${w.name}`);
  });
}


/* ----- Impression / PDF de la fiche ----- */
function printSheet(c) {
  const d = D(), s = sp(c), cr = career(c), dv = derived(c);
  const own = ownedTalents(c), cnt = {}; own.forEach(t => cnt[t.key] = (cnt[t.key] || 0) + 1);
  const row = (k, v) => `<tr><th>${k}</th><td>${v}</td></tr>`;
  const html = `<h1>${esc(c.name)}</h1>
    <p>${esc([s && s.name, cr && cr.name, c.specs.map(x => (specById(x) || {}).name).join(' / ')].filter(Boolean).join(' · '))}${c.player ? ' — joueur : ' + esc(c.player) : ''}</p>
    <table class="pc">${d.chars.map(k => `<td><b>${cv(c, k.id)}</b><br>${k.name}</td>`).join('')}</table>
    <table class="pc"><td><b>${dv.soak}</b><br>Encaissement</td><td><b>${dv.wt}</b><br>Seuil de blessure</td><td><b>${dv.st}</b><br>Seuil de stress</td><td><b>${dv.def}/${dv.rdef}</b><br>Défense</td><td><b>${dv.force}</b><br>Force</td></table>
    <table>${c.book === 'eote' ? row('Obligation', esc(c.oblig.type || '') + ' ' + obTotal(c)) : ''}${c.book === 'aor' ? row('Devoir', esc(c.duty.type || '') + ' ' + duTotal(c)) : ''}${c.book === 'fad' ? row('Moralité', moTotal(c) + ' — force : ' + esc(c.moral.strength || '') + ', faiblesse : ' + esc(c.moral.weak || '')) : ''}
      ${motivText(c) ? row('Motivation', esc(motivText(c))) : ''}${row('XP', xpTotal(c) + ' (reste ' + (xpTotal(c) - xpCost(c).total) + ')')}${row('Crédits', +c.credits || 0)}</table>
    <h2>Compétences</h2><table class="sk2">${d.skills.map(k => { const r = rank(c, k.id), cs = careerSkills(c).has(k.id);
      return `<tr><td>${cs ? '■' : '□'} ${esc(k.name)} (${k.abbr || carAbbr(k.car)})</td><td>${r}</td><td>${'●'.repeat(Math.min(r, cv(c, k.car)))}${'○'.repeat(Math.abs(cv(c, k.car) - r))}</td></tr>`; }).join('')}</table>
    <p class="sm">■ compétence de carrière · ● maîtrise (jaune) · ○ aptitude (vert)</p>
    ${c.weapons.length ? `<h2>Armes</h2><table>${c.weapons.map(w => `<tr><td><b>${esc(w.name)}</b></td><td>${esc(skName(w.skill))}</td><td>Dég ${w.melee ? (+w.dmg || 0) + cv(c, 'vig') : esc(w.dmg)}</td><td>Crit ${esc(w.crit)}</td><td>${esc(w.range)}</td><td>${esc(w.special || '')}${(w.kits || []).length ? ' — kits : ' + w.kits.map(k => esc(k.n)).join(', ') : ''}</td></tr>`).join('')}</table>` : ''}
    ${c.armor.name ? `<p><b>Armure :</b> ${esc(c.armor.name)} (encaissement +${c.armor.soak}, défense ${c.armor.def}/${c.armor.rdef})</p>` : ''}
    ${Object.keys(cnt).length ? `<h2>Talents</h2><p>${Object.entries(cnt).map(([k, n]) => { const t = TAL()[k] || { n: k, a: '' }; return `<b>${esc(t.n)}</b>${n > 1 ? ' ' + n : ''} <span class="sm">(${esc(t.a)})</span>`; }).join(' · ')}</p>` : ''}
    ${Object.keys(c.powers || {}).length ? `<h2>Pouvoirs de la Force</h2><p>${Object.entries(c.powers).map(([pid, nodes]) => { const P = powerById(pid); return P ? `<b>${esc(P.name)}</b> : ${nodes.filter(k => k !== '0,0').map(k => { const n = powerNodes(P).find(x => x.key === k); return n ? esc(P.lab[n.abil]) : ''; }).join(', ') || 'base'}` : ''; }).join('<br>')}</p>` : ''}
    ${s ? `<h2>Capacités d'espèce</h2><p>${s.abil.map(esc).join('<br>')}</p>` : ''}
    ${c.gear ? `<h2>Matériel</h2><p>${esc(c.gear).replace(/\n/g, '<br>')}</p>` : ''}
    ${c.desc ? `<h2>Historique</h2><p>${esc(c.desc).replace(/\n/g, '<br>')}</p>` : ''}
    <p class="sm">Blessures : ____ / ${dv.wt} · Stress : ____ / ${dv.st} · Blessures critiques : ______________________</p>`;
  let p = $('#print'); if (!p) { p = document.createElement('div'); p.id = 'print'; document.body.appendChild(p); }
  p.innerHTML = html; setTimeout(() => window.print(), 50);
}
/* ----- Équipement ----- */
function tabEquip(c, el) {
  const d = D();
  const cmb = d.skills.filter(k => k.type === 'combat');
  el.innerHTML = `
  <h2>Crédits</h2><div class="card"><input type="number" id="cr" value="${+c.credits || 0}">${c.creation && trades(c).cr ? `<p class="mut">+ ${trades(c).cr} crédits d'échange (ajoutés à la fin de la création) → ${money(c)} disponibles.</p>` : ''}
    <button class="b acc" id="shop" style="width:100%;margin-top:10px">🛒 Catalogue (armes, armures, matériel)</button></div>
  <h2>Armes</h2>
  <div class="card">${c.weapons.map((w, i) => `
    <div style="border-bottom:1px solid var(--line);padding-bottom:10px;margin-bottom:10px">
      <div class="row"><input class="grow" data-w="${i}|name" value="${esc(w.name)}" placeholder="Nom"><button class="b sm bad" data-wd="${i}">✕</button></div>
      <div class="row" style="margin-top:6px;flex-wrap:nowrap">
        <select data-w="${i}|skill">${cmb.map(k => `<option value="${k.id}" ${w.skill === k.id ? 'selected' : ''}>${esc(k.name)}</option>`).join('')}</select>
        <input data-w="${i}|dmg" value="${esc(w.dmg)}" placeholder="Dég" style="width:64px"><input data-w="${i}|crit" value="${esc(w.crit)}" placeholder="Crit" style="width:58px">
      </div>
      <div class="row" style="margin-top:6px;flex-wrap:nowrap"><input data-w="${i}|range" value="${esc(w.range)}" placeholder="Portée"><input data-w="${i}|special" value="${esc(w.special)}" placeholder="Spécial"></div>
      <label class="mut"><input type="checkbox" data-wm="${i}" ${w.melee ? 'checked' : ''} style="width:auto"> Arme de mêlée (dégâts = Vigueur + bonus)</label>
      ${kitsUI('w', i, w, w.skill === 'sabre' ? 'sabre' : 'arme')}
    </div>`).join('')}
    <button class="b sm" id="addW">+ Arme</button></div>
  <h2>Armure</h2>
  <div class="card"><input id="arN" value="${esc(c.armor.name)}" placeholder="Nom de l'armure">
    <div class="row" style="margin-top:6px;flex-wrap:nowrap">
      <div><label class="f">Encaissement</label><input type="number" id="arS" value="${+c.armor.soak || 0}"></div>
      <div><label class="f">Déf. CàC</label><input type="number" id="arD" value="${+c.armor.def || 0}"></div>
      <div><label class="f">Déf. dist.</label><input type="number" id="arR" value="${+c.armor.rdef || 0}"></div>
    </div>${kitsUI('a', 0, c.armor, 'armure')}</div>
  <h2>Indice de Force</h2>
  <div class="card"><label class="mut"><input type="checkbox" id="fM" ${c.forceManual ? 'checked' : ''} style="width:auto"> Saisie manuelle</label>
    <input type="number" id="fV" value="${derived(c).force}" ${c.forceManual ? '' : 'disabled'}></div>
  <h2>Matériel</h2><div class="card"><textarea id="gear" placeholder="Medipac, comlink, vibrocouteau…">${esc(c.gear)}</textarea></div>`;
  const re = () => { save(); tabEquip(c, el); };
  $('#cr', el).onchange = e => { c.credits = +e.target.value; save(); };
  $('#shop', el).onclick = () => shopModal(c, 'w', '', () => { save(); tabEquip(c, el); });
  $('#addW', el).onclick = () => { c.weapons.push({ name: '', skill: cmb[0].id, dmg: '', crit: '', range: '', special: '', melee: false }); re(); };
  $$('[data-w]', el).forEach(i => i.onchange = () => { const [n, f] = i.dataset.w.split('|'); c.weapons[+n][f] = i.value; save(); });
  $$('[data-wm]', el).forEach(i => i.onchange = () => { c.weapons[+i.dataset.wm].melee = i.checked; save(); });
  $$('[data-wd]', el).forEach(b => b.onclick = () => { c.weapons.splice(+b.dataset.wd, 1); re(); });
  $('#arN', el).onchange = e => { c.armor.name = e.target.value; save(); };
  $('#arS', el).onchange = e => { c.armor.soak = +e.target.value; save(); };
  $('#arD', el).onchange = e => { c.armor.def = +e.target.value; save(); };
  $('#arR', el).onchange = e => { c.armor.rdef = +e.target.value; save(); };
  $('#fM', el).onchange = e => { c.forceManual = e.target.checked; c.force = derived(c).force; re(); };
  $('#fV', el).onchange = e => { c.force = +e.target.value; save(); };
  $('#gear', el).onchange = e => { c.gear = e.target.value; save(); };
  $$('[data-khp]', el).forEach(i => i.onchange = () => { const [t, n] = i.dataset.khp.split('|'); (t === 'w' ? c.weapons[+n] : c.armor).hp = +i.value; re(); });
  $$('[data-kdel]', el).forEach(b => b.onclick = () => { const [t, n, k] = b.dataset.kdel.split('|'); (t === 'w' ? c.weapons[+n] : c.armor).kits.splice(+k, 1); re(); });
  $$('[data-kadd]', el).forEach(s => s.onchange = () => {
    if (s.value === '') return; const [t, n] = s.dataset.kadd.split('|'), it = window.SW_EXTRA.kits[+s.value], obj = t === 'w' ? c.weapons[+n] : c.armor;
    obj.kits = obj.kits || []; const used = obj.kits.reduce((x, k) => x + (k.hp || 0), 0);
    if (obj.hp != null && used + it[4] > obj.hp) { toast('Plus assez d\'emplacements'); s.value = ''; return; }
    if (confirm(`Payer ${it[2]} crédits pour « ${it[1]} » ? (Annuler = ajouter sans payer)`)) { if (money(c) < it[2]) { toast('Pas assez de crédits'); s.value = ''; return; } c.credits = (+c.credits || 0) - it[2]; }
    obj.kits.push({ n: it[1], hp: it[4] }); re(); });
}
function kitsUI(t, i, obj, cat) {
  const kits = obj.kits || [], used = kits.reduce((x, k) => x + (k.hp || 0), 0);
  const list = window.SW_EXTRA.kits.map((k, j) => [k, j]).filter(([k]) => k[0] === cat);
  return `<div style="margin-top:8px"><div class="row" style="flex-wrap:nowrap"><span class="mut grow">Kits · emplacements ${used}/</span><input type="number" data-khp="${t}|${i}" value="${obj.hp != null ? obj.hp : ''}" placeholder="?" style="width:58px;padding:5px"></div>
    <div class="row" style="margin:4px 0">${kits.map((k, j) => `<span class="pill">${esc(k.n)} <span data-kdel="${t}|${i}|${j}" style="cursor:pointer">✕</span></span>`).join('')}</div>
    <select data-kadd="${t}|${i}"><option value="">+ ajouter un kit…</option>${list.map(([k, j]) => `<option value="${j}">${esc(k[1])} (${k[2]} cr, ${k[4]} empl.)</option>`).join('')}</select></div>`;
}

/* ----- Catalogue d'équipement ----- */
const money = c => (+c.credits || 0) + (c.creation ? trades(c).cr : 0);
function pay(c, n) { c.credits = (+c.credits || 0) - n; }
function shopModal(c, tab, q, done) {
  const X = window.SW_EXTRA, nq = norm(q || ''), match = n => !nq || norm(n).includes(nq);
  const bk = it => it.split(' ').includes(c.book);
  let rows = '';
  if (tab === 'w') rows = X.weapons.filter(w => match(w[0])).map((w, i) => `<div class="hit"><div class="row" style="justify-content:space-between"><b>${esc(w[0])}</b><span class="mut">${w[8] ? '(R) ' : ''}${w[7]} cr</span></div>
      <div class="mut">${esc(skName(w[1]))} · Dég ${w[2].startsWith('+') ? 'VIG' + w[2] : w[2]} · Crit ${w[3]} · ${esc(w[4])} · Enc ${w[5]} · Rareté ${w[9]}${w[10] ? ' · ' + esc(w[10]) : ''}${bk(w[11]) ? '' : ' · <i>autre gamme</i>'}</div>
      <div class="row" style="margin-top:6px"><button class="b sm acc" data-sb="w|${X.weapons.indexOf(w)}">Acheter</button><button class="b sm" data-sa="w|${X.weapons.indexOf(w)}">Ajouter sans payer</button></div></div>`).join('');
  if (tab === 'a') rows = X.armors.filter(a => match(a[0])).map(a => `<div class="hit"><div class="row" style="justify-content:space-between"><b>${esc(a[0])}</b><span class="mut">${a[4] ? '(R) ' : ''}${a[3]} cr</span></div>
      <div class="mut">Défense ${a[1]} · Encaissement +${a[2]} · Enc ${a[5]} · Rareté ${a[7]}</div>
      <div class="row" style="margin-top:6px"><button class="b sm acc" data-sb="a|${X.armors.indexOf(a)}">Acheter</button><button class="b sm" data-sa="a|${X.armors.indexOf(a)}">Équiper sans payer</button></div></div>`).join('');
  if (tab === 'g') { let cat = ''; rows = X.gear.filter(g => match(g[1])).map(g => { const h = g[0] !== cat ? `<h3>${esc(cat = g[0])}</h3>` : '';
      return h + `<div class="row" style="padding:6px 0;border-bottom:1px solid var(--line);flex-wrap:nowrap"><span class="grow">${esc(g[1])} <span class="mut">${g[3] ? '(R) ' : ''}${g[2]} cr · Enc ${g[4]}</span></span><button class="b sm acc" data-sb="g|${X.gear.indexOf(g)}">Acheter</button><button class="b sm" data-sa="g|${X.gear.indexOf(g)}">+</button></div>`; }).join(''); }
  modal(`<div class="row" style="margin-bottom:8px"><b class="grow">Catalogue — ${money(c)} crédits</b><button class="b sm" onclick="closeModal()">✕</button></div>
    <div class="tabs">${[['w', 'Armes'], ['a', 'Armures'], ['g', 'Matériel']].map(([k, n]) => `<button class="b sm ${tab === k ? 'on' : ''}" data-st="${k}">${n}</button>`).join('')}</div>
    <input id="shopQ" placeholder="Rechercher…" value="${esc(q || '')}" style="margin-bottom:10px">
    ${rows || '<p class="mut">Rien trouvé.</p>'}
    <p class="mut">(R) = objet restreint (illégal sans autorisation). « Acheter » retire le prix de tes crédits.</p>`);
  $$('[data-st]').forEach(b => b.onclick = () => shopModal(c, b.dataset.st, $('#shopQ').value, done));
  $('#shopQ').onchange = e => shopModal(c, tab, e.target.value, done);
  const add = (ref, pay) => {
    const [t, i] = ref.split('|'), it = (t === 'w' ? X.weapons : t === 'a' ? X.armors : X.gear)[+i];
    const price = t === 'g' ? it[2] : t === 'w' ? it[7] : it[3];
    if (pay) { if (money(c) < price) return toast('Pas assez de crédits'); c.credits = (+c.credits || 0) - price; }
    if (t === 'w') c.weapons.push({ name: it[0], skill: it[1], dmg: it[2].replace('+', ''), melee: it[2].startsWith('+'), crit: String(it[3]), range: it[4], special: it[10], hp: it[6], kits: [] });
    if (t === 'a') c.armor = { name: it[0], soak: it[2], def: it[1], rdef: it[1], hp: it[6], kits: [] };
    if (t === 'g') c.gear = (c.gear ? c.gear.replace(/\s*$/, '') + '\n' : '') + '• ' + it[1];
    toast(pay ? `Acheté : ${t === 'g' ? it[1] : it[0]}` : 'Ajouté'); save(); shopModal(c, tab, $('#shopQ').value, done); done();
  };
  $$('[data-sb]').forEach(b => b.onclick = () => add(b.dataset.sb, true));
  $$('[data-sa]').forEach(b => b.onclick = () => add(b.dataset.sa, false));
}
function tabNotes(c, el) {
  el.innerHTML = `<label class="f">Joueur</label><input id="pl" value="${esc(c.player)}">
  <label class="f">Description, historique</label><textarea id="ds" style="min-height:140px">${esc(c.desc)}</textarea>
  <label class="f">Notes de campagne</label><textarea id="nt" style="min-height:180px">${esc(c.notes)}</textarea>`;
  $('#pl', el).onchange = e => { c.player = e.target.value; save(); };
  $('#ds', el).onchange = e => { c.desc = e.target.value; save(); };
  $('#nt', el).onchange = e => { c.notes = e.target.value; save(); };
}
function download(name, txt) {
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([txt], { type: 'application/json' })); a.download = name; a.click();
}

/* =====================================================================
   ESPACE MJ
   ===================================================================== */
let MTAB = 'init';
function mj() { S.mj = Object.assign({ init: [], cur: 0, round: 1, destiny: [], npcs: [], ob: [], notes: '', vehicles: [], clog: [] }, S.mj); return S.mj; }
let ADVQ = '', ADVT = '', VEHQ = '';

function renderMJ() {
  const el = $('#v-mj'), m = mj();
  const tabs = [['init', 'Initiative'], ['destin', 'Destin'], ['pnj', 'PNJ'], ['adv', 'Adversaires'], ['veh', 'Véhicules'], ['oblig', 'Obligation/Devoir'], ['conflit', 'Conflit'], ['notes', 'Notes']];
  el.innerHTML = `<h2>Espace MJ</h2><div class="tabs">${tabs.map(([k, n]) => `<button class="b sm ${MTAB === k ? 'on' : ''}" data-mt="${k}">${n}</button>`).join('')}</div><div id="mjc"></div>`;
  $$('[data-mt]', el).forEach(b => b.onclick = () => { MTAB = b.dataset.mt; renderMJ(); });
  const c = $('#mjc'), re = () => { save(); renderMJ(); };

  if (MTAB === 'init') {
    c.innerHTML = `
    <div class="row" style="margin-bottom:10px"><b class="grow">Round ${m.round}</b><button class="b sm" id="iSort">Trier</button><button class="b sm" id="iReset">Reset</button><button class="b acc sm" id="iNext">Tour suivant ▶</button></div>
    <div class="list ini">${m.init.map((x, i) => `<div class="it ${i === m.cur ? 'cur' : ''}">
      <span class="pill ${x.t === 'PJ' ? 'c' : ''}" data-it="${i}" style="cursor:pointer">${x.t}</span>
      <input value="${esc(x.n)}" data-in="${i}" class="grow" style="padding:6px">
      <input type="number" value="${x.s}" data-is="${i}" style="width:70px;padding:6px" title="Succès puis avantages (ex. 2.1)">
      <button class="b sm bad" data-id="${i}">✕</button></div>`).join('') || '<p class="mut">Ajoute les emplacements d\'initiative (PJ / PNJ).</p>'}</div>
    <div class="row"><button class="b grow" id="aPJ">+ Emplacement PJ</button><button class="b grow" id="aPNJ">+ Emplacement PNJ</button></div>
    <p class="mut">Score = succès,avantages (ex. 2.1 = 2 succès 1 avantage). Dans ce système, les PJ choisissent librement qui agit sur un emplacement PJ.</p>
    <div class="row"><button class="b sm" id="iPJ">Ajouter tous les persos</button></div>`;
    $('#aPJ').onclick = () => { m.init.push({ n: 'PJ', t: 'PJ', s: 0 }); re(); };
    $('#aPNJ').onclick = () => { m.init.push({ n: 'PNJ', t: 'PNJ', s: 0 }); re(); };
    $('#iPJ').onclick = () => { S.chars.filter(x => x.sys === S.sys && !x.creation).forEach(x => m.init.push({ n: x.name, t: 'PJ', s: 0 })); re(); };
    $('#iSort').onclick = () => { m.init.sort((a, b) => b.s - a.s || (a.t === 'PJ' ? -1 : 1)); m.cur = 0; re(); };
    $('#iReset').onclick = () => { m.round = 1; m.cur = 0; re(); };
    $('#iNext').onclick = () => { if (!m.init.length) return; m.cur++; if (m.cur >= m.init.length) { m.cur = 0; m.round++; toast('Round ' + m.round); } re(); };
    $$('[data-in]', c).forEach(i => i.onchange = () => { m.init[+i.dataset.in].n = i.value; save(); });
    $$('[data-is]', c).forEach(i => i.onchange = () => { m.init[+i.dataset.is].s = +i.value; save(); });
    $$('[data-it]', c).forEach(i => i.onclick = () => { const x = m.init[+i.dataset.it]; x.t = x.t === 'PJ' ? 'PNJ' : 'PJ'; re(); });
    $$('[data-id]', c).forEach(b => b.onclick = () => { m.init.splice(+b.dataset.id, 1); if (m.cur >= m.init.length) m.cur = 0; re(); });
  }

  if (MTAB === 'destin') {
    const L = m.destiny.filter(x => x).length, Dk = m.destiny.length - L;
    c.innerHTML = `<div class="card" style="text-align:center">
      <div style="font-size:15px;margin-bottom:8px"><b style="color:#9cf">${L} Lumière</b> · <b style="color:#f77">${Dk} Obscurité</b></div>
      <div>${m.destiny.map((x, i) => `<span class="tok ${x ? 'l' : 'd'}" data-tk="${i}">${x ? '○' : '●'}</span>`).join('') || '<p class="mut">Réserve vide</p>'}</div>
      <p class="mut">Touche un jeton pour le dépenser (il bascule de côté).</p></div>
    <div class="row"><input type="number" id="nbP" value="${S.chars.filter(x => x.sys === S.sys).length || 4}" style="width:80px"><button class="b acc grow" id="gen">Générer (1 dé de Force par joueur)</button></div>
    <div class="row" style="margin-top:8px"><button class="b grow" id="addL">+ Lumière</button><button class="b grow" id="addD">+ Obscurité</button><button class="b bad" id="clrD">Vider</button></div>`;
    $$('[data-tk]', c).forEach(t => t.onclick = () => { const i = +t.dataset.tk; m.destiny[i] = !m.destiny[i]; re(); });
    $('#gen').onclick = () => {
      const n = +$('#nbP').value || 1; const r = rollPool({ force: n }); m.destiny = [...Array(r.c.L).fill(true), ...Array(r.c.D).fill(false)];
      toast(`${r.c.L} Lumière / ${r.c.D} Obscurité`); re();
    };
    $('#addL').onclick = () => { m.destiny.push(true); re(); };
    $('#addD').onclick = () => { m.destiny.push(false); re(); };
    $('#clrD').onclick = () => { m.destiny = []; re(); };
  }

  if (MTAB === 'pnj') {
    c.innerHTML = `${m.npcs.map((n, i) => `<div class="card">
      <div class="row"><input value="${esc(n.n)}" data-nn="${i}" class="grow" style="font-weight:700">
        <select data-nt="${i}" style="width:auto">${['Sbire', 'Rival', 'Némésis'].map(t => `<option ${n.t === t ? 'selected' : ''}>${t}</option>`).join('')}</select></div>
      <div class="chars" style="grid-template-columns:repeat(6,1fr);margin-top:8px">${D().chars.map(k => `<div class="ch" style="padding:4px"><input type="number" value="${n.car[k.id] || 2}" data-nc="${i}|${k.id}" style="text-align:center;padding:4px;font-weight:800"><div class="n">${k.abbr}</div></div>`).join('')}</div>
      <div class="row" style="margin-top:8px;flex-wrap:nowrap">
        <div><label class="f">Encaiss.</label><input type="number" value="${n.soak}" data-nf="${i}|soak"></div>
        <div><label class="f">Seuil bless.</label><input type="number" value="${n.wt}" data-nf="${i}|wt"></div>
        <div><label class="f">Déf.</label><input value="${esc(n.def)}" data-nf="${i}|def"></div>
        ${n.t === 'Sbire' ? `<div><label class="f">Nb</label><input type="number" value="${n.nb || 1}" data-nf="${i}|nb"></div>` : ''}
      </div>
      <div class="row" style="justify-content:space-between;margin-top:8px"><b>Blessures</b><div class="trk"><button class="b sm" data-nw="${i}|-1">−</button><span class="v">${n.w || 0}/${n.t === 'Sbire' ? (n.wt * (n.nb || 1)) : n.wt}</span><button class="b sm" data-nw="${i}|1">+</button></div></div>
      ${n.t === 'Sbire' ? `<p class="mut" style="margin:4px 0">Sbires restants : ${Math.max(0, (n.nb || 1) - Math.floor((n.w || 0) / Math.max(1, n.wt)))}</p>` : ''}
      <label class="f">Compétences, armes, talents</label><textarea data-nf="${i}|txt" style="min-height:60px">${esc(n.txt || '')}</textarea>
      <div class="row" style="margin-top:6px"><button class="b sm" data-ndup="${i}">Dupliquer</button><button class="b sm bad" data-nd="${i}">Supprimer</button></div>
    </div>`).join('')}
    <button class="b acc" id="addN" style="width:100%">+ PNJ</button>`;
    $('#addN').onclick = () => { m.npcs.push({ n: 'Stormtrooper', t: 'Sbire', car: { vig: 3, agi: 3, int: 2, rus: 2, vol: 3, pre: 1 }, soak: 5, wt: 5, def: '0', nb: 3, w: 0, txt: '' }); re(); };
    $$('[data-nn]', c).forEach(i => i.onchange = () => { m.npcs[+i.dataset.nn].n = i.value; save(); });
    $$('[data-nt]', c).forEach(i => i.onchange = () => { m.npcs[+i.dataset.nt].t = i.value; re(); });
    $$('[data-nc]', c).forEach(i => i.onchange = () => { const [n, k] = i.dataset.nc.split('|'); m.npcs[+n].car[k] = +i.value; save(); });
    $$('[data-nf]', c).forEach(i => i.onchange = () => { const [n, k] = i.dataset.nf.split('|'); m.npcs[+n][k] = i.type === 'number' ? +i.value : i.value; re(); });
    $$('[data-nw]', c).forEach(b => b.onclick = () => { const [n, d] = b.dataset.nw.split('|'); const x = m.npcs[+n]; x.w = Math.max(0, (x.w || 0) + (+d)); re(); });
    $$('[data-ndup]', c).forEach(b => b.onclick = () => { const x = JSON.parse(JSON.stringify(m.npcs[+b.dataset.ndup])); x.w = 0; m.npcs.push(x); re(); });
    $$('[data-nd]', c).forEach(b => b.onclick = () => { m.npcs.splice(+b.dataset.nd, 1); re(); });
  }

  if (MTAB === 'oblig') {
    const tot = m.ob.reduce((a, x) => a + (+x.v || 0), 0);
    c.innerHTML = `<div class="card">${m.ob.map((x, i) => `<div class="row" style="margin-bottom:6px;flex-wrap:nowrap"><input value="${esc(x.n)}" data-on="${i}" class="grow" placeholder="Perso · type"><input type="number" value="${x.v}" data-ov="${i}" style="width:70px"><button class="b sm bad" data-od="${i}">✕</button></div>`).join('')}
      <div class="row"><button class="b sm" id="addO">+ Ligne</button><button class="b sm" id="impO">Importer des persos</button></div>
      <p class="mut">Total du groupe : <b>${tot}</b></p></div>
      <button class="b acc" id="rollO" style="width:100%">Lancer le d100 de début de session</button>
      <div id="oOut" class="card" style="margin-top:10px;display:none"></div>
      <p class="mut">Obligation : si le résultat est ≤ au total, l'Obligation du perso concerné se déclenche (seuil de stress réduit pour le groupe ce jour-là). Devoir : si le résultat est ≤ au total, le Devoir du perso concerné augmente le moral du groupe. Un double (11, 22…) renforce l'effet pour ce perso.</p>`;
    $('#addO').onclick = () => { m.ob.push({ n: '', v: 5 }); re(); };
    $('#impO').onclick = () => {
      S.chars.filter(x => x.sys === S.sys).forEach(x => {
        if (x.book === 'eote') m.ob.push({ n: `${x.name} · ${x.oblig.type || 'Obligation'}`, v: obTotal(x) });
        if (x.book === 'aor') m.ob.push({ n: `${x.name} · ${x.duty.type || 'Devoir'}`, v: duTotal(x) });
      }); re();
    };
    $$('[data-on]', c).forEach(i => i.onchange = () => { m.ob[+i.dataset.on].n = i.value; save(); });
    $$('[data-ov]', c).forEach(i => i.onchange = () => { m.ob[+i.dataset.ov].v = +i.value; re(); });
    $$('[data-od]', c).forEach(b => b.onclick = () => { m.ob.splice(+b.dataset.od, 1); re(); });
    $('#rollO').onclick = () => {
      const r = 1 + Math.floor(Math.random() * 100); let acc = 0, who = null;
      for (const x of m.ob) { if (r > acc && r <= acc + (+x.v || 0)) { who = x; break; } acc += (+x.v || 0); }
      const dbl = r % 11 === 0 && r < 100;
      const o = $('#oOut'); o.style.display = 'block';
      o.innerHTML = `<div style="font-size:30px;font-weight:800;text-align:center;color:var(--acc)">${r}</div>` +
        (who ? `<p style="text-align:center"><b>Déclenché : ${esc(who.n)}</b>${dbl ? '<br><span class="ko">Double ! Effet renforcé.</span>' : ''}</p>` : `<p class="mut" style="text-align:center">Rien ne se déclenche (total ${tot}).</p>`);
    };
  }

  if (MTAB === 'adv') {
    const L = (window.SW_ADV || []).filter(x => (!ADVT || x.t === ADVT) && (!ADVQ || norm(x.n).includes(norm(ADVQ))));
    c.innerHTML = `<div class="row" style="flex-wrap:nowrap"><input id="aq" placeholder="Stormtrooper, Hutt, droïde…" value="${esc(ADVQ)}"><select id="at" style="width:auto"><option value="">Tous</option>${['Sbire', 'Rival', 'Némésis'].map(t => `<option ${ADVT === t ? 'selected' : ''}>${t}</option>`).join('')}</select></div>
      <p class="mut">${L.length} adversaire(s) des trois livres de base.</p>
      <div class="list">${L.map(x => `<div class="it" data-adv="${(window.SW_ADV).indexOf(x)}" style="cursor:pointer"><div class="grow"><b>${esc(x.n)}</b><div class="mut">${x.t} · Enc. ${x.soak} · Bless. ${x.wt}${x.st ? ' · Stress ' + x.st : ''}</div></div><span class="pill ${x.t === 'Némésis' ? 'c' : ''}">${x.t}</span></div>`).join('')}</div>`;
    $('#aq').onchange = e => { ADVQ = e.target.value; renderMJ(); };
    $('#at').onchange = e => { ADVT = e.target.value; renderMJ(); };
    $$('[data-adv]', c).forEach(d => d.onclick = () => advModal(+d.dataset.adv));
  }

  if (MTAB === 'veh') {
    const L = (window.SW_VEH || []).filter(v => !VEHQ || norm(v.n + ' ' + v.type + ' ' + v.en).includes(norm(VEHQ)));
    c.innerHTML = `${m.vehicles.map((v, i) => `<div class="card">
        <div class="row"><input value="${esc(v.n)}" data-vn="${i}" class="grow" style="font-weight:700"><button class="b sm bad" data-vd="${i}">✕</button></div>
        <p class="mut" style="margin:6px 0">Gabarit ${v.sil} · Vitesse ${v.spd} · Maniabilité ${v.hand >= 0 ? '+' : ''}${v.hand} · Blindage ${v.arm} · Déf. ${v.def.map(x => x == null ? '–' : x).join('/')}</p>
        <div class="row" style="justify-content:space-between"><b>Coque</b><div class="trk"><button class="b sm" data-vh="${i}|-1">−</button><span class="v ${v.hull > v.htt ? 'ko' : ''}">${v.hull}/${v.htt}</span><button class="b sm" data-vh="${i}|1">+</button></div></div>
        <div class="row" style="justify-content:space-between;margin-top:6px"><b>Stress système</b><div class="trk"><button class="b sm" data-vs="${i}|-1">−</button><span class="v ${v.strain > v.sst ? 'ko' : ''}">${v.strain}/${v.sst}</span><button class="b sm" data-vs="${i}|1">+</button></div></div>
        ${v.hull > v.htt ? '<p class="ko">Seuil de coque dépassé : véhicule détruit ou hors service.</p>' : ''}${v.strain > v.sst ? '<p class="ko">Seuil de stress système dépassé : systèmes en panne.</p>' : ''}
        <label class="f">Dégâts critiques, munitions, notes</label><textarea data-vt="${i}" style="min-height:50px">${esc(v.txt || '')}</textarea>
        <button class="b sm" data-vcrit="${i}">Tirer un coup critique (d100)</button> <span class="mut" id="vco${i}"></span>
      </div>`).join('')}
      <div class="row" style="flex-wrap:nowrap"><input id="vq" placeholder="YT-1300, X-Wing, TIE, motojet…" value="${esc(VEHQ)}"></div>
      <p class="mut">${L.length} véhicule(s). Touche pour voir la fiche et l'ajouter au suivi (vaisseau du groupe, ennemis…).</p>
      <div class="list">${L.map(v => `<div class="it" data-veh="${(window.SW_VEH).indexOf(v)}" style="cursor:pointer"><div class="grow"><b>${esc(v.n)}</b><div class="mut">${esc(v.type)} · Gabarit ${v.sil} · Vitesse ${v.spd} · Coque ${v.htt}</div></div></div>`).join('')}</div>`;
    $('#vq').onchange = e => { VEHQ = e.target.value; renderMJ(); };
    $$('[data-veh]', c).forEach(d => d.onclick = () => vehModal(+d.dataset.veh));
    $$('[data-vn]', c).forEach(i => i.onchange = () => { m.vehicles[+i.dataset.vn].n = i.value; save(); });
    $$('[data-vt]', c).forEach(i => i.onchange = () => { m.vehicles[+i.dataset.vt].txt = i.value; save(); });
    $$('[data-vd]', c).forEach(b => b.onclick = () => { m.vehicles.splice(+b.dataset.vd, 1); re(); });
    $$('[data-vh]', c).forEach(b => b.onclick = () => { const [i, d] = b.dataset.vh.split('|'); const v = m.vehicles[+i]; v.hull = Math.max(0, v.hull + (+d)); re(); });
    $$('[data-vs]', c).forEach(b => b.onclick = () => { const [i, d] = b.dataset.vs.split('|'); const v = m.vehicles[+i]; v.strain = Math.max(0, v.strain + (+d)); re(); });
    $$('[data-vcrit]', c).forEach(b => b.onclick = () => { const i = +b.dataset.vcrit, v = m.vehicles[i]; v.crits = v.crits || 0;
      const bonus = +(prompt('Bonus de l\'arme (Sanguinaire ×10, etc.) ?', '0') || 0), r = 1 + Math.floor(Math.random() * 100), tot = r + 10 * v.crits + bonus;
      const row = window.SW_EXTRA.vcrits.find(x => tot >= x[0] && tot <= x[1]) || window.SW_EXTRA.vcrits.slice(-1)[0];
      v.crits++; v.txt = (v.txt ? v.txt + '\n' : '') + `Critique ${tot} : ${row[2]} (${row[3]})`; re(); toast(row[2]); });
  }

  if (MTAB === 'conflit') {
    const L = S.chars.filter(x => x.sys === S.sys);
    c.innerHTML = `<p class="mut" style="margin-top:0">Pendant la séance, ajoute du Conflit aux persos pour leurs actes égoïstes, cruels ou violents (et l'usage du côté obscur). En fin de séance : 1d10 − Conflit = variation de Moralité.</p>
      ${L.map(x => `<div class="card"><div class="row" style="justify-content:space-between"><b>${esc(x.name)}</b><span class="mut">Moralité ${moTotal(x)}</span></div>
        <div class="row" style="justify-content:space-between;margin-top:8px"><span>Conflit</span><div class="trk"><button class="b sm" data-cf="${x.id}|-1">−</button><span class="v">${x.conflict || 0}</span><button class="b sm" data-cf="${x.id}|1">+</button><button class="b sm" data-cf="${x.id}|5">+5</button></div></div></div>`).join('') || '<p class="mut">Aucun personnage.</p>'}
      ${L.length ? '<button class="b acc" id="endS" style="width:100%">🎲 Fin de séance : résoudre le Conflit</button>' : ''}
      ${m.clog.length ? `<h3>Historique</h3><div class="card">${m.clog.slice(-12).reverse().map(t => `<p style="margin:4px 0">${esc(t)}</p>`).join('')}</div>` : ''}`;
    $$('[data-cf]', c).forEach(b => b.onclick = () => { const [id, d] = b.dataset.cf.split('|'), x = getChar(id); x.conflict = Math.max(0, (x.conflict || 0) + (+d)); re(); });
    const e = $('#endS'); if (e) e.onclick = () => {
      L.forEach(x => { const r = 1 + Math.floor(Math.random() * 10), cf = x.conflict || 0, dv = r - cf, before = moTotal(x);
        if (!x.creation) x.moral.val = Math.max(0, Math.min(100, before + dv));
        m.clog.push(`${x.name} : d10 ${r} − Conflit ${cf} = ${dv >= 0 ? '+' : ''}${dv} → Moralité ${x.creation ? '(perso en création, non appliqué)' : x.moral.val}`); x.conflict = 0; });
      re(); toast('Conflit résolu');
    };
  }

  if (MTAB === 'notes') {
    c.innerHTML = `<textarea id="mjN" style="min-height:60vh" placeholder="Intrigues, PNJ, lieux, secrets…">${esc(m.notes)}</textarea>`;
    $('#mjN').oninput = e => { m.notes = e.target.value; clearTimeout(renderMJ.t); renderMJ.t = setTimeout(save, 400); };
  }
}


/* ----- Adversaires et véhicules (MJ) ----- */
function weaponStats(w) {
  if (w.dmg != null && w.dmg !== '') return w;
  const it = (window.SW_EXTRA.weapons || []).find(x => norm(x[0]) === norm(w.n));
  return it ? { n: w.n, sk: it[1], dmg: it[2], crit: it[3], rng: it[4], q: it[10] } : w;
}
function advModal(i) {
  const x = window.SW_ADV[i], d = D();
  const sk = Object.entries(x.sk || {});
  modal(`<div class="row" style="margin-bottom:6px"><h2 class="grow" style="margin:0">${esc(x.n)}</h2><button class="b sm" onclick="closeModal()">✕</button></div>
    <p><span class="pill ${x.t === 'Némésis' ? 'c' : ''}">${x.t}</span> <span class="mut">${x.b.map(b => d.books[b]).join(' · ')}</span></p>
    <div class="chars" style="grid-template-columns:repeat(6,1fr)">${d.chars.map(k => `<div class="ch" style="padding:4px"><div class="v" style="font-size:20px">${x.c[k.id]}</div><div class="n">${k.abbr}</div></div>`).join('')}</div>
    <div class="stats" style="margin-top:8px"><div class="stat"><div class="v">${x.soak}</div><div class="n">Encaiss.</div></div><div class="stat"><div class="v">${x.wt}</div><div class="n">Seuil bless.</div></div>
      <div class="stat"><div class="v">${x.st || '–'}</div><div class="n">Seuil stress</div></div><div class="stat"><div class="v">${x.def ? x.def.join('/') : '0/0'}</div><div class="n">Déf. CàC/dist.</div></div></div>
    <h3>Compétences${x.t === 'Sbire' ? ' (de groupe : rang = nb de sbires − 1)' : ''}</h3>
    ${sk.map(([k, r]) => { const s = d.skills.find(z => z.id === k); return `<div class="sk" data-ars="${k}|${r}" style="cursor:pointer"><div class="nm">${esc(s ? s.name : k)}${x.t === 'Sbire' ? '' : ' ' + r}</div><div class="pool">${poolHTML(buildPool(x.c[s.car], x.t === 'Sbire' ? 0 : r))}</div><div></div></div>`; }).join('') || '<p class="mut">—</p>'}
    ${x.tal ? `<h3>Talents</h3><p>${x.tal.map(esc).join(', ')}</p>` : ''}
    ${x.ab ? `<h3>Capacités</h3><p>${x.ab.map(esc).join(', ')}</p>` : ''}
    ${x.w ? `<h3>Armes</h3>${x.w.map(w0 => { const w = weaponStats(w0), s = d.skills.find(z => z.id === w.sk);
      return `<p style="margin:6px 0"><b>${esc(w.n)}</b>${w.dmg != null && w.dmg !== '' ? ` <span class="mut">(${esc(s ? s.name : '')} ; dégâts ${String(w.dmg).startsWith('+') ? 'VIG ' + w.dmg + ' = ' + (x.c.vig + (+String(w.dmg).slice(1))) : w.dmg} ; crit ${w.crit} ; ${esc(w.rng || '')}${w.q ? ' ; ' + esc(w.q) : ''})</span>` : ''}</p>`; }).join('')}` : ''}
    ${x.g ? `<h3>Équipement</h3><p class="mut">${x.g.map(esc).join(' · ')}</p>` : ''}
    <div class="row" style="margin-top:12px">${x.t === 'Sbire' ? '<input type="number" id="advN" value="3" style="width:70px">' : ''}<button class="b acc grow" id="advAdd">+ Ajouter aux PNJ</button><button class="b" id="advLook">📖</button></div>`);
  $$('[data-ars]').forEach(r => r.onclick = () => { const [k, rk] = r.dataset.ars.split('|'), s = d.skills.find(z => z.id === k);
    const n = x.t === 'Sbire' ? Math.max(0, (+($('#advN') || {}).value || 1) - 1) : +rk; closeModal(); sendToDice(Object.assign({ difficulty: 2 }, buildPool(x.c[s.car], n)), `${x.n} · ${s.name}`); });
  $('#advAdd').onclick = () => { const m = mj(), nb = x.t === 'Sbire' ? (+$('#advN').value || 1) : 1;
    const txt = [Object.entries(x.sk || {}).map(([k, r]) => skName(k) + (x.t === 'Sbire' ? '' : ' ' + r)).join(', '), x.tal ? 'Talents : ' + x.tal.join(', ') : '', x.ab ? 'Capacités : ' + x.ab.join(', ') : '',
      x.w ? 'Armes : ' + x.w.map(w0 => { const w = weaponStats(w0); return w.n + (w.dmg ? ` (${String(w.dmg).startsWith('+') ? 'VIG' : ''}${w.dmg}/crit ${w.crit}/${w.rng || ''})` : ''); }).join(' ; ') : ''].filter(Boolean).join('\n');
    m.npcs.push({ n: x.n, t: x.t, car: Object.assign({}, x.c), soak: x.soak, wt: x.wt, def: x.def ? x.def.join('/') : '0', nb, w: 0, txt }); save(); closeModal(); MTAB = 'pnj'; renderMJ(); toast('Ajouté aux PNJ'); };
  $('#advLook').onclick = () => { closeModal(); lookUp(x.n); };
}
function vehModal(i) {
  const v = window.SW_VEH[i], d = D();
  modal(`<div class="row" style="margin-bottom:6px"><h2 class="grow" style="margin:0">${esc(v.n)}</h2><button class="b sm" onclick="closeModal()">✕</button></div>
    <p class="mut">${esc(v.type)} · ${v.b.map(b => d.books[b]).join(' · ')}</p>
    <div class="stats"><div class="stat"><div class="v">${v.sil}</div><div class="n">Gabarit</div></div><div class="stat"><div class="v">${v.spd}</div><div class="n">Vitesse</div></div>
      <div class="stat"><div class="v">${v.hand >= 0 ? '+' : ''}${v.hand}</div><div class="n">Maniabilité</div></div><div class="stat"><div class="v">${v.arm}</div><div class="n">Blindage</div></div></div>
    <div class="stats" style="margin-top:8px"><div class="stat"><div class="v">${v.htt}</div><div class="n">Seuil coque</div></div><div class="stat"><div class="v">${v.sst}</div><div class="n">Stress syst.</div></div>
      <div class="stat" style="grid-column:span 2"><div class="v">${v.def.map(x => x == null ? '–' : x).join(' / ')}</div><div class="n">Déf. avant/bâbord/tribord/arrière</div></div></div>
    <div class="card" style="margin-top:10px">
      ${v.hyp ? `<p style="margin:3px 0">Hyperpropulsion : classe ${v.hyp}${v.hypb ? ' (secours ' + v.hypb + ')' : ''}</p>` : ''}
      <p style="margin:3px 0">Équipage : ${esc(v.crew || '—')} · Passagers : ${esc(v.pass || '0')}</p>
      <p style="margin:3px 0">Capacité d'encombrement : ${esc(v.enc || '—')} · Autonomie : ${esc(v.cons)}</p>
      <p style="margin:3px 0">Emplacements de modification : ${v.hp} · Prix : ${v.r ? '(R) ' : ''}${v.price.toLocaleString('fr-FR')} cr · Rareté ${v.rar}</p></div>
    ${v.w.length ? `<h3>Armement</h3>${v.w.map(w => `<p style="margin:6px 0"><b>${w.qty > 1 ? w.qty + ' × ' : ''}${esc(w.n)}</b> <span class="mut">(${esc(w.arcs)} ; dégâts ${w.dmg} ; crit ${w.crit} ; portée ${esc(w.rng || '')}${w.q ? ' ; ' + esc(w.q) : ''})</span></p>`).join('')}` : '<p class="mut">Pas d\'armement.</p>'}
    <div class="row" style="margin-top:12px"><button class="b acc grow" id="vehAdd">+ Suivre en jeu</button><button class="b" id="vehLook">📖</button></div>`);
  $('#vehAdd').onclick = () => { const m = mj(); m.vehicles.push({ n: v.n, sil: v.sil, spd: v.spd, hand: v.hand, arm: v.arm, def: v.def, htt: v.htt, sst: v.sst, hull: 0, strain: 0, txt: '' }); save(); closeModal(); renderMJ(); toast('Ajouté au suivi'); };
  $('#vehLook').onclick = () => { closeModal(); lookUp(v.n.replace(/^(Cargo léger|Cargo moyen|Chasseur|Intercepteur|Transport) /, '')); };
}
/* =====================================================================
   RÈGLES : recherche hors-ligne dans l'index importé (IndexedDB)
   ===================================================================== */
const IDB = {
  db: null,
  open() {
    if (this.db) return Promise.resolve(this.db);
    return new Promise((res, rej) => {
      const r = indexedDB.open('codex-jdr', 1);
      r.onupgradeneeded = () => r.result.createObjectStore('idx');
      r.onsuccess = () => { this.db = r.result; res(this.db); };
      r.onerror = () => rej(r.error);
    });
  },
  async get(k) { const db = await this.open(); return new Promise(res => { const q = db.transaction('idx').objectStore('idx').get(k); q.onsuccess = () => res(q.result); q.onerror = () => res(null); }); },
  async set(k, v) { const db = await this.open(); return new Promise((res, rej) => { const t = db.transaction('idx', 'readwrite'); t.objectStore('idx').put(v, k); t.oncomplete = res; t.onerror = () => rej(t.error); }); },
  async del(k) { const db = await this.open(); return new Promise(res => { const t = db.transaction('idx', 'readwrite'); t.objectStore('idx').delete(k); t.oncomplete = res; }); },
};
let INDEX = null, RTAB = 'search', LASTQ = '';
async function loadIndex() {
  if (INDEX && INDEX.sys === S.sys) return INDEX;
  const raw = await IDB.get('index-' + S.sys);
  if (!raw) { INDEX = null; return null; }
  raw.pages.forEach(p => p.n = norm(p.t));
  INDEX = raw; INDEX.sys = S.sys; return INDEX;
}

async function renderRules() {
  const el = $('#v-regles');
  const tabs = [['search', 'Recherche'], ['ref', 'Aide-mémoire'], ['books', 'Livres']];
  el.innerHTML = `<h2>Règles</h2><div class="tabs">${tabs.map(([k, n]) => `<button class="b sm ${RTAB === k ? 'on' : ''}" data-rt="${k}">${n}</button>`).join('')}</div><div id="rc"><p class="mut">Chargement…</p></div>`;
  $$('[data-rt]', el).forEach(b => b.onclick = () => { RTAB = b.dataset.rt; renderRules(); });
  const c = $('#rc');
  const idx = await loadIndex();

  if (RTAB === 'ref') {
    c.innerHTML = `<div class="ref">${D().quickref.map((q, i) => `<details class="card" ${i === 0 ? 'open' : ''}><summary>${esc(q.t)}</summary>${q.h}</details>`).join('')}</div>`;
    return;
  }
  if (RTAB === 'books') {
    c.innerHTML = `<div class="card">
      ${idx ? `<p><b>Index installé</b> : ${idx.books.map(b => `${esc(b.name)} (${b.pages} p.)`).join(', ')}</p><p class="mut">${idx.pages.length} pages indexées, stockées sur cet appareil uniquement.</p>` : `<p>Aucun index installé.</p>`}
      <p class="mut">Importe le fichier <b>index-${S.sys === 'sw' ? 'starwars' : S.sys}.json</b> que Claude t'a fourni. Il reste sur ton téléphone et n'est jamais mis en ligne.</p>
      <button class="b acc" id="impI" style="width:100%">Importer un fichier d'index</button>
      ${idx ? '<button class="b bad" id="delI" style="width:100%;margin-top:8px">Supprimer l\'index</button>' : ''}
      <input type="file" id="impIF" accept=".json,application/json" hidden></div>`;
    $('#impI').onclick = () => $('#impIF').click();
    $('#impIF').onchange = async e => {
      const f = e.target.files[0]; if (!f) return;
      toast('Import en cours…');
      try {
        const j = JSON.parse(await f.text());
        if (!j.pages || !j.books) throw 0;
        await IDB.set('index-' + (j.sys || S.sys), { books: j.books, pages: j.pages.map(p => ({ b: p.b, p: p.p, t: p.t })) });
        INDEX = null; toast('Index importé !'); renderRules();
      } catch (err) { toast('Fichier d\'index invalide'); }
    };
    if (idx) $('#delI').onclick = async () => { if (confirm('Supprimer l\'index ?')) { await IDB.del('index-' + S.sys); INDEX = null; renderRules(); } };
    return;
  }
  // Recherche
  if (!idx) {
    c.innerHTML = `<div class="card"><p>Pour chercher dans les livres, importe d'abord ton fichier d'index.</p><button class="b acc" id="goB">Importer l'index</button></div>
    <p class="mut">En attendant, l'onglet <b>Aide-mémoire</b> fonctionne déjà.</p>`;
    $('#goB').onclick = () => { RTAB = 'books'; renderRules(); };
    return;
  }
  c.innerHTML = `<div class="row" style="flex-wrap:nowrap"><input id="q" placeholder="Ex. : blessure critique, coup de grâce, Force…" value="${esc(LASTQ)}" enterkeyhint="search"><button class="b acc" id="qGo">🔍</button></div>
    <div class="row" style="margin:8px 0">${idx.books.map(b => `<label class="mut" style="display:inline-flex;gap:4px;align-items:center"><input type="checkbox" data-bk="${b.id}" checked style="width:auto">${esc(b.short || b.name)}</label>`).join('')}</div>
    <div id="hits"></div>`;
  const run = () => { LASTQ = $('#q').value; search(LASTQ); };
  $('#qGo').onclick = run;
  $('#q').onkeydown = e => { if (e.key === 'Enter') run(); };
  $$('[data-bk]', c).forEach(b => b.onchange = run);
  if (LASTQ) search(LASTQ);
}

function search(q) {
  const out = $('#hits'); const idx = INDEX; if (!idx) return;
  const terms = norm(q).split(/[^a-z0-9]+/).filter(t => t.length > 1 && !STOP.has(t));
  if (!terms.length) { out.innerHTML = ''; return; }
  const books = new Set($$('[data-bk]').filter(b => b.checked).map(b => b.dataset.bk));
  const phrase = norm(q).trim(), upq = q.trim().toUpperCase();
  const res = [];
  for (const p of idx.pages) {
    if (!books.has(p.b)) continue;
    let score = 0, all = true;
    for (const t of terms) {
      const re = new RegExp('\\b' + t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + (t.length > 4 ? '' : '\\b'), 'g');
      const n = (p.n.match(re) || []).length;
      if (!n) all = false;
      score += n ? 1 + Math.log(1 + n) : 0;
    }
    if (!score) continue;
    if (all) score += 3 * terms.length;
    if (terms.length > 1 && p.n.includes(phrase)) score += 10;
    if (upq.length > 3 && p.t.includes(upq)) score += 15;   // titre en capitales (talents, pouvoirs…)
    res.push({ p, score, all });
  }
  res.sort((a, b) => b.score - a.score);
  const top = res.slice(0, 40);
  out.innerHTML = top.length ? `<p class="mut">${res.length} page(s) trouvée(s)</p>` + top.map(({ p }) => {
    const bk = idx.books.find(b => b.id === p.b);
    return `<div class="hit" data-pg="${p.b}|${p.p}"><div class="src">${esc(bk ? bk.name : p.b)} — page ${p.p}</div><div style="font-size:14px">${snippet(p, terms)}</div></div>`;
  }).join('') : '<p class="mut">Aucun résultat. Essaie un autre mot (l\'OCR peut avoir déformé certains termes).</p>';
  $$('[data-pg]', out).forEach(h => h.onclick = () => { const [b, pg] = h.dataset.pg.split('|'); openPage(b, +pg, terms); });
}
const STOP = new Set('le la les de des du un une et en au aux a d l pour par sur dans est qui que quoi comment ce cette ces son sa ses il elle on se ne pas plus ou je tu me te mon ma mes avec quand quel quelle quels quelles fait faire peut peux'.split(' '));
function snippet(p, terms) {
  const n = p.n; let pos = -1;
  for (const t of terms) { const i = n.indexOf(t); if (i >= 0 && (pos < 0 || i < pos)) pos = i; }
  const st = Math.max(0, pos - 90), en = Math.min(p.t.length, pos + 210);
  return (st > 0 ? '…' : '') + hl(p.t.slice(st, en).replace(/\s+/g, ' '), terms) + (en < p.t.length ? '…' : '');
}
function hl(txt, terms) {
  // surligne en comparant sur la version normalisée (mêmes longueurs pour le latin courant)
  const n = norm(txt); let marks = [];
  terms.forEach(t => { let i = 0; while ((i = n.indexOf(t, i)) >= 0) { marks.push([i, i + t.length]); i += t.length; } });
  if (n.length !== txt.length) return esc(txt);
  marks.sort((a, b) => a[0] - b[0]);
  let o = '', last = 0;
  marks.forEach(([a, b]) => { if (a < last) return; o += esc(txt.slice(last, a)) + '<mark>' + esc(txt.slice(a, b)) + '</mark>'; last = b; });
  return o + esc(txt.slice(last));
}
function openPage(b, pg, terms) {
  const idx = INDEX, p = idx.pages.find(x => x.b === b && x.p === pg); if (!p) return;
  const bk = idx.books.find(x => x.id === b);
  modal(`<div class="row" style="margin-bottom:10px;flex-wrap:nowrap"><button class="b sm" id="pPrev">◀</button><b class="grow" style="text-align:center;color:var(--acc)">${esc(bk ? bk.name : b)} — p. ${pg}</b><button class="b sm" id="pNext">▶</button><button class="b sm" onclick="closeModal()">✕</button></div>
    <div class="page">${hl(p.t, terms || [])}</div>`);
  $('#pPrev').onclick = () => openPage(b, pg - 1, terms);
  $('#pNext').onclick = () => openPage(b, pg + 1, terms);
  $('#modalBox').scrollTop = 0;
}
window.closeModal = closeModal;

/* ---------- Démarrage ---------- */
render();
if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => { });
