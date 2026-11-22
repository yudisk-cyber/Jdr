/* Module « Le Seigneur des Anneaux » (CODA) pour Codex JDR. Utilise les outils communs d'app.js. */
'use strict';
window.MODS = window.MODS || {};
(function () {
  const X = () => window.SDA_DATA;
  const SK = id => X().skills.find(s => s[0] === id);
  const skN = id => (SK(id) || [, id])[1];
  const ATN = id => X().attrs.find(a => a.id === id);
  const modOf = v => v <= 1 ? -3 : v === 2 ? -2 : v === 3 ? -1 : v <= 7 ? 0 : v <= 9 ? 1 : v <= 11 ? 2 : v <= 13 ? 3 : v <= 15 ? 4 : v <= 17 ? 5 : 5 + Math.floor((v - 16) / 2);
  const sg = n => (n >= 0 ? '+' : '') + n;
  const RACE = c => X().races.find(r => r.id === c.race);
  const SUB = c => { const r = RACE(c); return r && r.subs.find(s => s.id === c.sub); };
  const ORD = id => X().orders.find(o => o.id === id) || X().elite.find(o => o.id === id);
  const edgeInfo = n => X().edges.find(e => e[0] === n);
  const cnt = (o, k) => (o && o[k]) || 0;
  const sum = o => Object.values(o || {}).reduce((a, b) => a + (+b || 0), 0);
  let STAB = 'fiche', MJT = 'init', DMOD = 0, DSD = 10, DLAB = '', DLAST = null, DCOUR = 0;

  function newSda() {
    return { id: uid(), sys: 'sda', name: 'Nouveau héros', player: '', creation: true, age: 'adulte', meth: 'sel', pool: [10, 9, 7, 7, 5, 4], asg: {}, pts: {},
      race: '', sub: '', rmode: 'stereo', rst: 0, rsk: {}, red: [], rflaw: '', rflawEdge: '', adapt: 'rap', compet: {}, langs: [],
      order: '', pattr: [], preact: '', omode: 'stereo', ost: 0, obonus: {}, olib: {}, oedge: '', oabil: '', flaws: [],
      free: { sk: {}, at: {}, ed: [] }, prog: [], xp: 0, dmg: 0, fat: 0, cour: null, weapons: [], armor: '', shield: '', gear: '', notes: '', desc: '', spells: [], purse: '' };
  }

  /* ---------- Calculs ---------- */
  const progCount = (c, t, k) => (c.prog || []).filter(p => p.t === t && (k == null || p.k === k)).length;
  function baseAttr(c, a) { const i = (c.asg || {})[a]; return (i != null && c.pool[i] != null ? c.pool[i] : 0) + (c.meth === 'sel' ? cnt(c.pts, a) : 0); }
  function attr(c, a) {
    const s = SUB(c), ag = X().ages.find(x => x.id === c.age) || { mod: {} };
    return baseAttr(c, a) + (s ? cnt(s.mod, a) : 0) + cnt(ag.mod, a) + cnt(c.free.at, a) + progCount(c, 'pattr', a) + progCount(c, 'attr', a);
  }
  const amod = (c, a) => modOf(attr(c, a));
  function orderIds(c) { return [c.order, ...(c.prog || []).filter(p => p.t === 'order').map(p => p.k)].filter(Boolean); }
  function orderSkills(c) { const set = new Set(); orderIds(c).forEach(id => { const o = ORD(id); if (o) o.skills.forEach(k => set.add(k)); }); return set; }
  function raceSk(c) { const r = RACE(c); if (!r) return {}; if (c.rmode === 'stereo') { const st = r.stereos[c.rst]; return st ? st.sk : {}; } return c.rsk || {}; }
  function orderSk(c) {
    const o = ORD(c.order); if (!o) return {};
    if (c.omode === 'stereo') { const st = o.stereos[c.ost] || { sk: {} }; const out = Object.assign({}, st.sk); Object.entries(c.obonus || {}).forEach(([k, v]) => out[k] = (out[k] || 0) + v); return out; }
    return c.olib || {};
  }
  function rank(c, k) {
    let r = cnt(raceSk(c), k) + cnt(c.compet, k) + cnt(orderSk(c), k) + cnt(c.free.sk, k);
    (c.flaws || []).forEach(f => { if (f.g === 'sk:' + k) r++; });
    r += progCount(c, 'oskill', k) + progCount(c, 'rskill', k) + progCount(c, 'fskill', k);
    return r;
  }
  function edges(c) {
    const out = [], r = RACE(c);
    if (r && c.rmode === 'stereo' && r.stereos[c.rst] && r.stereos[c.rst].ed) out.push(...r.stereos[c.rst].ed);
    if (r && c.rmode === 'libre') out.push(...(c.red || []));
    if (c.rflaw && c.rflawEdge) out.push(c.rflawEdge);
    if (c.oedge) out.push(c.oedge);
    (c.flaws || []).forEach(f => { if (f.g && f.g.startsWith('ed:')) out.push(f.g.slice(3)); });
    out.push(...(c.free.ed || []));
    (c.prog || []).filter(p => p.t === 'edge').forEach(p => out.push(p.k));
    const m = {}; out.forEach(n => m[n] = (m[n] || 0) + 1); return m;
  }
  function flawsList(c) { return [c.rflaw, ...(c.flaws || []).map(f => f.n)].filter(Boolean); }
  function abilities(c) { return [c.oabil, ...(c.prog || []).filter(p => p.t === 'ability').map(p => p.k)].filter(Boolean); }
  function react(c, id) {
    const R = X().reactions.find(r => r.id === id), ag = X().ages.find(x => x.id === c.age) || { react: {} }, E = edges(c);
    let v = Math.max(...R.from.map(a => amod(c, a))) + cnt(ag.react, id) + progCount(c, 'preact', id) + progCount(c, 'react', id);
    if (RACE(c) && RACE(c).adaptable && c.adapt === id) v += 2;
    if (id === 'vol') v += 2 * cnt(E, 'Forte tête') + cnt(E, 'Résolu');
    if (id === 'vig') v += cnt(E, 'Résolu');
    return v;
  }
  function derived(c) {
    const r = RACE(c) || { wounds: 5, courage: 3 }, E = edges(c);
    const arm = X().armors.find(a => a[0] === c.armor), sh = X().shields.find(a => a[0] === c.shield);
    return { def: 10 + amod(c, 'viv'), sante: attr(c, 'vit') + amod(c, 'for') + progCount(c, 'sante'),
      courage: r.courage + progCount(c, 'courage'), renom: progCount(c, 'renom'), levels: r.wounds + 1,
      armor: (arm ? arm[1] : 0) + (E['Armure des héros'] && !arm ? 2 : 0), parry: sh ? sh[1] : 0, endurant: !!E['Endurant'], faible: flawsList(c).includes('Faible') };
  }
  function penalty(c) {
    const d = derived(c), W = X().wounds, lvl = Math.min(Math.floor((c.dmg || 0) / Math.max(1, d.sante)), d.levels);
    let wp = lvl < W.length ? W[lvl][1] : -99; if (wp < 0 && d.endurant) wp = Math.min(0, wp + 2); if (wp < 0 && d.faible) wp -= 2;
    const fp = (X().fatigue[c.fat || 0] || [, 0])[1] || 0;
    return { lvl, wp, fp, total: (wp > -99 ? wp : 0) + fp, dead: lvl >= d.levels };
  }

  /* ---------- Liste des héros ---------- */
  function persos() {
    const el = $('#v-persos');
    if (CUR && getChar(CUR) && getChar(CUR).sys === 'sda') return sheet(getChar(CUR));
    CUR = null;
    el.innerHTML = `<h2>Héros de la Terre du Milieu</h2>
      <div class="list">${S.chars.filter(c => c.sys === 'sda').map(c => { const s = SUB(c), o = ORD(c.order);
        return `<div class="it" data-open="${c.id}"><div class="grow"><b>${esc(c.name)}</b><div class="mut">${esc([s && s.name, o && o.name].filter(Boolean).join(' · ') || 'À créer')}</div></div>${c.creation ? '<span class="pill c">création</span>' : ''}</div>`; }).join('') || '<p class="mut">Aucun héros pour l\'instant.</p>'}</div>
      <div class="row"><button class="b acc grow" id="newC">+ Créer un héros</button><button class="b" id="impC">Importer</button></div><input type="file" id="impF" accept=".json" hidden>`;
    $('#newC').onclick = () => { const c = newSda(); S.chars.push(c); save(); CUR = c.id; STAB = 'creation'; render(); window.scrollTo(0, 0); };
    $$('[data-open]', el).forEach(d => d.onclick = () => { CUR = d.dataset.open; STAB = getChar(CUR).creation ? 'creation' : 'fiche'; render(); });
    $('#impC').onclick = () => $('#impF').click();
    $('#impF').onchange = async e => { try { const c = JSON.parse(await e.target.files[0].text()); c.id = uid(); c.sys = 'sda'; S.chars.push(c); save(); render(); } catch (err) { toast('Fichier invalide'); } };
  }
  function sheet(c) {
    const el = $('#v-persos');
    const tabs = [['creation', c.creation ? 'Création' : 'Progression'], ['fiche', 'Fiche'], ['equip', 'Équipement'], ['notes', 'Notes']];
    el.innerHTML = `<div class="row" style="margin-bottom:10px"><button class="b sm" id="back">← Héros</button><div class="grow"></div><button class="b sm" id="exp">Exporter</button><button class="b sm bad" id="del">Suppr.</button></div>
      <input id="cname" value="${esc(c.name)}" style="font-size:20px;font-weight:800;margin-bottom:10px">
      <div class="tabs">${tabs.map(([k, n]) => `<button class="b sm ${STAB === k ? 'on' : ''}" data-t="${k}">${n}</button>`).join('')}</div><div id="sheet"></div>`;
    $('#back').onclick = () => { CUR = null; render(); };
    $('#cname').onchange = e => { c.name = e.target.value; save(); };
    $('#del').onclick = () => { if (confirm('Supprimer ' + c.name + ' ?')) { S.chars = S.chars.filter(x => x !== c); CUR = null; save(); render(); } };
    $('#exp').onclick = () => download(c.name.replace(/\W+/g, '_') + '.json', JSON.stringify(c, null, 1));
    $$('[data-t]', el).forEach(b => b.onclick = () => { STAB = b.dataset.t; sheet(c); window.scrollTo(0, 0); });
    ({ creation: c.creation ? creation : progression, fiche, equip, notes })[STAB](c, $('#sheet'));
  }
  const counter = (used, max, label) => `<div class="mut" style="margin:6px 0">${label} : <b class="${used > max ? 'ko' : used === max ? 'ok' : ''}">${used} / ${max}</b></div>`;
  const opts = (list, cur, empty = '—') => `<option value="">${empty}</option>` + list.map(x => { const [v, n] = Array.isArray(x) ? x : [x, x]; return `<option value="${esc(v)}" ${String(cur) === String(v) ? 'selected' : ''}>${esc(n)}</option>`; }).join('');
  const pm = (key, val, extra = '') => `<div class="row" style="gap:4px;flex-wrap:nowrap"><button class="b sm" data-m="${key}">−</button><b style="min-width:26px;text-align:center">${val}</b><button class="b sm" data-p="${key}">+</button>${extra}</div>`;

  /* ---------- Création ---------- */
  function creation(c, el) {
    const x = X(), r = RACE(c), s = SUB(c), o = ORD(c.order);
    const ptsUsed = sum(c.pts);
    const used = new Set(Object.values(c.asg || {}).map(Number));
    const raceChoices = c.rmode === 'libre' ? sum(c.rsk) + (c.red || []).length : 0;
    const oSet = o ? o.skills : [];
    const oUsed = c.omode === 'stereo' ? sum(c.obonus) : sum(c.olib);
    const oMax = c.omode === 'stereo' ? 5 : 20;
    const flawsTot = flawsList(c).length;
    const freeUsed = sum(c.free.sk) + sum(c.free.at) + (c.free.ed || []).length;
    const langMax = Math.max(0, attr(c, 'esp')) * 3, langUsed = (c.langs || []).reduce((a, l) => a + (+l.r || 0), 0);
    const allOrderEdges = o ? [...new Set(o.stereos ? o.stereos.flatMap(st => st.ed) : [])] : [];
    const edgeNames = x.edges.map(e => e[0]);
    const raceEdgeList = r ? (r.edges === '*' ? edgeNames : r.edges) : [];
    const raceFlawList = r ? (r.flaws === '*' ? x.flaws.map(f => f[0]) : r.flaws) : [];
    const skRow = (k, val, key, max, note = '') => `<div class="sk"><div class="nm">${esc(skN(k))} <small class="car">(${ATN(SK(k)[2]).abbr})</small> ${note}</div><div class="mut">${rank(c, k)}</div>${pm(key + '|' + k, val)}</div>`;
    el.innerHTML = `
    <h2>1 · Concept</h2>
    <div class="card"><label class="f">Âge</label><select id="age">${opts(x.ages.map(a => [a.id, a.name]), c.age)}</select>
      <label class="f">Joueur</label><input id="pl" value="${esc(c.player)}"></div>

    <h2>2 · Attributs</h2>
    <div class="card">
      <div class="row"><label class="mut"><input type="radio" name="meth" value="sel" ${c.meth === 'sel' ? 'checked' : ''} style="width:auto"> Méthode sélective (10, 9, 7, 7, 5, 4 + 8 points)</label>
      <label class="mut"><input type="radio" name="meth" value="alea" ${c.meth === 'alea' ? 'checked' : ''} style="width:auto"> Méthode aléatoire (2d6 × 9, garder 6)</label></div>
      ${c.meth === 'alea' ? `<button class="b sm" id="rollAt" style="margin:8px 0">🎲 Lancer 9 × 2d6</button> <span class="mut">Valeurs : ${c.pool.join(', ')}</span>` : counter(ptsUsed, 8, 'Points supplémentaires (max 12 avant la race)')}
      ${x.attrs.map(a => { const i = (c.asg || {})[a.id];
        return `<div class="sk" style="grid-template-columns:1fr auto auto"><div class="nm"><b>${a.name}</b> <span class="mut">= ${attr(c, a.id)} (${sg(amod(c, a.id))})</span></div>
          <select data-asg="${a.id}" style="width:74px">${`<option value="">—</option>` + c.pool.map((v, j) => `<option value="${j}" ${String(i) === String(j) ? 'selected' : ''} ${used.has(j) && String(i) !== String(j) ? 'disabled' : ''}>${v}</option>`).join('')}</select>
          ${c.meth === 'sel' ? pm('pt|' + a.id, cnt(c.pts, a.id)) : '<span></span>'}</div>`; }).join('')}
    </div>

    <h2>3 · Race</h2>
    <div class="card">
      <div class="row" style="flex-wrap:nowrap"><select id="race">${opts(x.races.map(z => [z.id, z.name]), c.race)}</select>
      ${r ? `<select id="sub">${opts(r.subs.map(z => [z.id, z.name]), c.sub)}</select>` : ''}</div>
      ${s ? `<p class="mut">Ajustements : ${Object.entries(s.mod).map(([k, v]) => ATN(k).abbr + ' ' + sg(v)).join(', ')}${s.min ? ' · minimums requis' : ''}</p>` : ''}
      ${r ? `<details><summary>Capacités raciales</summary>${[...r.abil, ...(s ? s.abil : [])].map(t => `<p style="margin:4px 0">• ${esc(t)}</p>`).join('')}<p class="mut">${esc(r.orders)}</p></details>
      ${r.adaptable ? `<label class="f">Adaptable : +2 à</label><select id="adapt">${opts(x.reactions.filter(z => z.id !== 'sag').map(z => [z.id, z.name]), c.adapt)}</select>` : ''}
      <div class="row" style="margin-top:10px"><label class="mut"><input type="radio" name="rmode" value="stereo" ${c.rmode === 'stereo' ? 'checked' : ''} style="width:auto"> Stéréotype</label>
        <label class="mut"><input type="radio" name="rmode" value="libre" ${c.rmode === 'libre' ? 'checked' : ''} style="width:auto"> 6 choix libres</label></div>
      ${c.rmode === 'stereo' ? `<select id="rst">${r.stereos.map((st, i) => `<option value="${i}" ${+c.rst === i ? 'selected' : ''}>${esc(st.name)}</option>`).join('')}</select>
        <p class="mut">${(() => { const st = r.stereos[c.rst] || { sk: {} }; return Object.entries(st.sk).map(([k, v]) => skN(k) + ' +' + v).join(', ') + (st.ed ? ' · ' + st.ed.join(', ') : ''); })()}</p>`
        : `${counter(raceChoices, 6, 'Choix (1 rang ou 1 avantage chacun, compétence max 6)')}
        ${r.skills.map(k => skRow(k, cnt(c.rsk, k), 'rsk')).join('')}
        <label class="f">Avantages raciaux</label><div class="row">${(c.red || []).map((n, i) => `<span class="pill">${esc(n)} <span data-rmed="${i}" style="cursor:pointer">✕</span></span>`).join('')}</div>
        <select id="redAdd">${opts(raceEdgeList, '', '+ avantage racial…')}</select>`}
      ${r.adaptable ? `<label class="f">Compétent : 2 rangs supplémentaires (${sum(c.compet)}/2)</label><select id="compAdd">${opts(r.skills.map(k => [k, skN(k)]), '', '+1 rang à…')}</select>
        <div class="row" style="margin-top:4px">${Object.entries(c.compet || {}).map(([k, v]) => `<span class="pill">${esc(skN(k))} +${v} <span data-rmc="${k}" style="cursor:pointer">✕</span></span>`).join('')}</div>` : ''}
      <label class="f">Handicap racial (optionnel, donne 1 avantage)</label>
      <div class="row" style="flex-wrap:nowrap"><select id="rflaw">${opts(raceFlawList, c.rflaw, 'Aucun')}</select>${c.rflaw ? `<select id="rflawEdge">${opts(raceEdgeList, c.rflawEdge, 'avantage gagné…')}</select>` : ''}</div>
      <label class="f">Langages et Savoirs indigènes (Esprit × 3) — ${langUsed}/${langMax}</label>
      <p class="mut" style="margin:0 0 6px">Langues habituelles : ${esc(r.langs)}</p>
      ${(c.langs || []).map((l, i) => `<div class="row" style="flex-wrap:nowrap;margin-bottom:4px"><input value="${esc(l.n)}" data-ln="${i}" class="grow">${pm('lg|' + i, l.r || 0)}<button class="b sm bad" data-ld="${i}">✕</button></div>`).join('')}
      <div class="row"><button class="b sm" data-ladd="Langage : ">+ Langage</button><button class="b sm" data-ladd="Savoir : ">+ Savoir</button></div>` : ''}
    </div>

    <h2>4 · Ordre</h2>
    <div class="card">
      <select id="order">${opts(x.orders.map(z => [z.id, z.name]), c.order)}</select>
      ${o ? `${o.cond ? `<p class="mut">${esc(o.cond)}</p>` : ''}<p class="mut">Attributs conseillés : ${esc(o.attrs)} · réaction conseillée : ${esc(x.reactions.find(z => z.id === o.react).name)}</p>
      <div class="row" style="flex-wrap:nowrap"><select id="pa0">${opts(x.attrs.map(a => [a.id, a.name]), c.pattr[0], 'attribut préféré 1')}</select><select id="pa1">${opts(x.attrs.map(a => [a.id, a.name]), c.pattr[1], 'attribut préféré 2')}</select></div>
      <select id="preact" style="margin-top:6px">${opts(x.reactions.map(z => [z.id, z.name]), c.preact, 'réaction préférée')}</select>
      <div class="row" style="margin-top:10px"><label class="mut"><input type="radio" name="omode" value="stereo" ${c.omode === 'stereo' ? 'checked' : ''} style="width:auto"> Stéréotype + 5 bonus</label>
        <label class="mut"><input type="radio" name="omode" value="libre" ${c.omode === 'libre' ? 'checked' : ''} style="width:auto"> 15 rangs (max +3) + 5 rangs</label></div>
      ${c.omode === 'stereo' ? `<select id="ost">${o.stereos.map((st, i) => `<option value="${i}" ${+c.ost === i ? 'selected' : ''}>${esc(st.name)}</option>`).join('')}</select>
        <p class="mut">${Object.entries((o.stereos[c.ost] || { sk: {} }).sk).map(([k, v]) => skN(k) + ' +' + v).join(', ')}</p>` : ''}
      ${counter(oUsed, oMax, c.omode === 'stereo' ? 'Bonus +1 aux compétences d\'ordre' : 'Rangs d\'ordre')}
      ${oSet.map(k => skRow(k, c.omode === 'stereo' ? cnt(c.obonus, k) : cnt(c.olib, k), c.omode === 'stereo' ? 'ob' : 'ol')).join('')}
      <p class="mut">Les rangs raciaux s'ajoutent. Maximum 6 rangs par compétence à la création. Artisanat, Langage, Savoir… : précise la spécialité dans les notes.</p>
      <label class="f">Avantage d'ordre</label><select id="oedge">${opts(c.omode === 'stereo' ? (o.stereos[c.ost] || { ed: [] }).ed : allOrderEdges, c.oedge)}</select>
      <label class="f">Capacité d'ordre</label><select id="oabil">${opts(o.abil.map(a => [a[0], a[0] + (a[1] ? ' (' + a[1] + ')' : '')]), c.oabil)}</select>
      ${c.oabil ? `<p class="mut">${esc((o.abil.find(a => a[0] === c.oabil) || [, , ''])[2])}</p>` : ''}
      <label class="f">Handicaps supplémentaires (${flawsTot}/4 au total) — chacun : +1 compétence d'ordre ou 1 avantage d'ordre</label>
      ${(c.flaws || []).map((f, i) => `<div class="row" style="flex-wrap:nowrap;margin-bottom:4px"><select data-fn="${i}">${opts(x.flaws.map(z => z[0]), f.n)}</select>
        <select data-fg="${i}">${opts([...oSet.map(k => ['sk:' + k, '+1 ' + skN(k)]), ...allOrderEdges.map(e => ['ed:' + e, 'Avantage : ' + e])], f.g, 'gain…')}</select><button class="b sm bad" data-fd="${i}">✕</button></div>`).join('')}
      ${flawsTot < 4 ? '<button class="b sm" id="addFlaw">+ Handicap</button>' : ''}` : ''}
    </div>

    <h2>5 · Choix gratuits</h2>
    <div class="card">${counter(freeUsed, 5, 'Choix (+1 compétence, +1 attribut ou 1 avantage)')}
      <label class="f">Attributs</label>${x.attrs.map(a => `<div class="sk" style="grid-template-columns:1fr auto"><div class="nm">${a.name} <span class="mut">${attr(c, a.id)}</span></div>${pm('fa|' + a.id, cnt(c.free.at, a.id))}</div>`).join('')}
      <label class="f">Compétences</label>${Object.keys(c.free.sk).map(k => skRow(k, c.free.sk[k], 'fs')).join('')}
      <select id="fsAdd">${opts(x.skills.map(z => [z[0], z[1]]), '', '+ compétence…')}</select>
      <label class="f">Avantages</label><div class="row">${(c.free.ed || []).map((n, i) => `<span class="pill">${esc(n)} <span data-fed="${i}" style="cursor:pointer">✕</span></span>`).join('')}</div>
      <select id="feAdd">${opts(edgeNames, '', '+ avantage…')}</select>
    </div>
    <div class="card"><button class="b acc" id="finish" style="width:100%">Terminer la création</button><div id="warn" class="mut" style="margin-top:8px"></div></div>`;

    const re = () => { save(); creation(c, el); };
    const on = (sel, fn, ev = 'onchange') => { const z = $(sel, el); if (z) z[ev] = fn; };
    on('#age', e => { c.age = e.target.value; re(); });
    on('#pl', e => { c.player = e.target.value; save(); });
    $$('[name=meth]', el).forEach(i => i.onchange = () => { c.meth = i.value; c.asg = {}; c.pts = {}; c.pool = c.meth === 'sel' ? [10, 9, 7, 7, 5, 4] : [0, 0, 0, 0, 0, 0]; re(); });
    on('#rollAt', () => { const v = Array.from({ length: 9 }, () => 2 + Math.floor(Math.random() * 6) + Math.floor(Math.random() * 6)).sort((a, b) => b - a); c.pool = v.slice(0, 6); c.asg = {}; toast('Tirés : ' + v.join(', ')); re(); }, 'onclick');
    $$('[data-asg]', el).forEach(z => z.onchange = () => { if (z.value === '') delete c.asg[z.dataset.asg]; else c.asg[z.dataset.asg] = +z.value; re(); });
    on('#race', e => { c.race = e.target.value; const rr = RACE(c); c.sub = rr && rr.subs.length === 1 ? rr.subs[0].id : ''; c.rst = 0; c.rsk = {}; c.red = []; c.rflaw = ''; c.rflawEdge = ''; c.compet = {}; re(); });
    on('#sub', e => { c.sub = e.target.value; const rr = RACE(c), i = rr.stereos.findIndex(st => st.sub === c.sub); if (i >= 0) c.rst = i; re(); });
    on('#adapt', e => { c.adapt = e.target.value; re(); });
    $$('[name=rmode]', el).forEach(i => i.onchange = () => { c.rmode = i.value; re(); });
    on('#rst', e => { c.rst = +e.target.value; const st = RACE(c).stereos[c.rst]; if (st && st.sub) c.sub = st.sub; re(); });
    on('#redAdd', e => { if (e.target.value) c.red.push(e.target.value); re(); });
    $$('[data-rmed]', el).forEach(b => b.onclick = () => { c.red.splice(+b.dataset.rmed, 1); re(); });
    on('#compAdd', e => { const k = e.target.value; if (k && sum(c.compet) < 2) c.compet[k] = (c.compet[k] || 0) + 1; re(); });
    $$('[data-rmc]', el).forEach(b => b.onclick = () => { delete c.compet[b.dataset.rmc]; re(); });
    on('#rflaw', e => { c.rflaw = e.target.value; if (!c.rflaw) c.rflawEdge = ''; re(); });
    on('#rflawEdge', e => { c.rflawEdge = e.target.value; re(); });
    $$('[data-ladd]', el).forEach(b => b.onclick = () => { c.langs.push({ n: b.dataset.ladd, r: 1 }); re(); });
    $$('[data-ln]', el).forEach(i => i.onchange = () => { c.langs[+i.dataset.ln].n = i.value; save(); });
    $$('[data-ld]', el).forEach(b => b.onclick = () => { c.langs.splice(+b.dataset.ld, 1); re(); });
    on('#order', e => { c.order = e.target.value; c.ost = 0; c.obonus = {}; c.olib = {}; c.oedge = ''; c.oabil = ''; const oo = ORD(c.order); if (oo && !c.preact) c.preact = oo.react; re(); });
    on('#pa0', e => { c.pattr[0] = e.target.value; re(); }); on('#pa1', e => { c.pattr[1] = e.target.value; re(); });
    on('#preact', e => { c.preact = e.target.value; re(); });
    $$('[name=omode]', el).forEach(i => i.onchange = () => { c.omode = i.value; c.oedge = ''; re(); });
    on('#ost', e => { c.ost = +e.target.value; c.oedge = ''; re(); });
    on('#oedge', e => { c.oedge = e.target.value; re(); });
    on('#oabil', e => { c.oabil = e.target.value; re(); });
    on('#addFlaw', () => { c.flaws.push({ n: '', g: '' }); re(); }, 'onclick');
    $$('[data-fn]', el).forEach(z => z.onchange = () => { c.flaws[+z.dataset.fn].n = z.value; re(); });
    $$('[data-fg]', el).forEach(z => z.onchange = () => { c.flaws[+z.dataset.fg].g = z.value; re(); });
    $$('[data-fd]', el).forEach(b => b.onclick = () => { c.flaws.splice(+b.dataset.fd, 1); re(); });
    on('#fsAdd', e => { const k = e.target.value; if (k) c.free.sk[k] = (c.free.sk[k] || 0) + 1; re(); });
    on('#feAdd', e => { if (e.target.value) c.free.ed.push(e.target.value); re(); });
    $$('[data-fed]', el).forEach(b => b.onclick = () => { c.free.ed.splice(+b.dataset.fed, 1); re(); });
    // boutons +/−
    const bump = (key, d) => {
      const [t, k] = key.split('|');
      if (t === 'pt') { if (d > 0 && (sum(c.pts) >= 8 || baseAttr(c, k) >= 12)) return toast(sum(c.pts) >= 8 ? '8 points maximum' : 'Maximum 12 avant la race'); c.pts[k] = Math.max(0, cnt(c.pts, k) + d); }
      const maxCheck = () => { if (d > 0 && rank(c, k) >= 6) { toast('Maximum 6 rangs à la création'); return false; } return true; };
      if (t === 'rsk') { if (d > 0 && (sum(c.rsk) + c.red.length >= 6 || !maxCheck())) return toast('6 choix maximum'); c.rsk[k] = Math.max(0, cnt(c.rsk, k) + d); }
      if (t === 'ob') { if (d > 0 && (sum(c.obonus) >= 5 || !maxCheck())) return; c.obonus[k] = Math.max(0, cnt(c.obonus, k) + d); }
      if (t === 'ol') { if (d > 0 && (sum(c.olib) >= 20 || !maxCheck())) return; c.olib[k] = Math.max(0, cnt(c.olib, k) + d); }
      if (t === 'fs') { if (d > 0 && !maxCheck()) return; c.free.sk[k] = Math.max(0, cnt(c.free.sk, k) + d); if (!c.free.sk[k]) delete c.free.sk[k]; }
      if (t === 'fa') c.free.at[k] = Math.max(0, cnt(c.free.at, k) + d);
      if (t === 'lg' && d > 0 && langUsed >= langMax) return toast('Maximum : Esprit × 3');
      if (t === 'lg') c.langs[+k].r = Math.max(0, (+c.langs[+k].r || 0) + d);
      re();
    };
    $$('[data-p]', el).forEach(b => b.onclick = () => bump(b.dataset.p, 1));
    $$('[data-m]', el).forEach(b => b.onclick = () => bump(b.dataset.m, -1));
    on('#finish', () => {
      const w = [];
      if (x.attrs.some(a => (c.asg || {})[a.id] == null)) w.push('Attribue une valeur à chaque attribut.');
      if (c.meth === 'sel' && ptsUsed !== 8) w.push(`Points d'attribut : ${ptsUsed}/8.`);
      if (!c.race || !c.sub) w.push('Choisis une race.');
      if (c.rmode === 'libre' && raceChoices !== 6) w.push(`Choix raciaux : ${raceChoices}/6.`);
      if (s && s.min) Object.entries(s.min).forEach(([k, v]) => { if (attr(c, k) < v) w.push(`${ATN(k).name} minimum ${v}.`); });
      if (r && r.adaptable && sum(c.compet) !== 2) w.push('Compétent : 2 rangs à répartir.');
      if (langUsed !== langMax) w.push(`Langages/Savoirs : ${langUsed}/${langMax}.`);
      if (c.order && oUsed !== oMax) w.push(`Rangs d'ordre : ${oUsed}/${oMax}.`);
      if (c.order && (!c.oedge || !c.oabil)) w.push('Choisis un avantage et une capacité d\'ordre.');
      if (c.order && c.pattr.filter(Boolean).length < 2) w.push('Choisis 2 attributs préférés.');
      if (freeUsed !== 5) w.push(`Choix gratuits : ${freeUsed}/5.`);
      if (w.length && !confirm('À vérifier :\n• ' + w.join('\n• ') + '\n\nTerminer quand même ?')) { $('#warn').innerHTML = w.map(esc).join('<br>'); return; }
      c.creation = false; c.cour = derived(c).courage; save(); STAB = 'fiche'; sheet(c); window.scrollTo(0, 0);
    }, 'onclick');
  }

  /* ---------- Progression ---------- */
  function progression(c, el) {
    const x = X(), avail = Math.floor((+c.xp || 0) / 1000) * 5 + (+c.extraPicks || 0), spent = (c.prog || []).reduce((a, p) => a + p.cost, 0);
    const oS = orderSkills(c);
    const r = RACE(c);
    const targets = t => {
      if (['oskill'].includes(t)) return [...oS].map(k => [k, skN(k)]);
      if (t === 'fskill') return x.skills.filter(z => !oS.has(z[0])).map(z => [z[0], z[1]]);
      if (t === 'rskill') return [['lang', 'Langage'], ['savoir', 'Savoir']];
      if (t === 'edge') return x.edges.map(e => e[0]);
      if (t === 'preact') return [[c.preact, (x.reactions.find(z => z.id === c.preact) || {}).name || '—']];
      if (t === 'react') return x.reactions.filter(z => z.id !== c.preact).map(z => [z.id, z.name]);
      if (t === 'pattr') return c.pattr.filter(Boolean).map(a => [a, ATN(a).name]);
      if (t === 'attr') return x.attrs.filter(a => !c.pattr.includes(a.id)).map(a => [a.id, a.name]);
      if (t === 'ability') return orderIds(c).flatMap(id => ORD(id).abil.map(a => [a[0], a[0] + ' (' + ORD(id).name + ')']));
      if (t === 'order') return [...x.orders, ...x.elite].filter(o => !orderIds(c).includes(o.id)).map(o => [o.id, o.name + (o.cond ? ' — ' + o.cond : '')]);
      if (t === 'spec') return [['spec', 'Spécialité (préciser en note)']];
      return [['+', '+1']];
    };
    el.innerHTML = `<div class="card"><label class="f">Points d'expérience</label>
      <div class="row" style="flex-wrap:nowrap"><input type="number" id="xp" value="${+c.xp || 0}"><button class="b sm" data-xp="100">+100</button><button class="b sm" data-xp="500">+500</button><button class="b sm" data-xp="1000">+1000</button></div>
      <p>Choix de progression : <b class="${spent > avail ? 'ko' : ''}">${spent} / ${avail}</b> <span class="mut">(1 000 XP = 1 progression = 5 choix)</span></p>
      <label class="f">Choix bonus (handicap pris en progression…)</label><input type="number" id="ep" value="${+c.extraPicks || 0}"></div>
    <h2>Nouveau choix</h2><div class="card">
      <select id="pt">${x.progress.map(p => `<option value="${p[0]}">${esc(p[1])} — ${p[2]} choix</option>`).join('')}</select>
      <select id="pk" style="margin-top:6px"></select><button class="b acc" id="padd" style="width:100%;margin-top:8px">Ajouter</button>
      <p class="mut">Limites : par progression, +2 rangs max dans une compétence d'ordre, +1 dans les autres. Attribut max 12 + modificateur racial.</p></div>
    <h2>Historique</h2><div class="card">${(c.prog || []).map((p, i) => { const P = x.progress.find(z => z[0] === p.t);
      return `<div class="row" style="justify-content:space-between;padding:4px 0;border-bottom:1px solid var(--line)"><span>${esc(P ? P[1] : p.t)} : <b>${esc(p.lab || p.k)}</b></span><span class="mut">${p.cost} <button class="b sm bad" data-pd="${i}">✕</button></span></div>`; }).join('') || '<p class="mut">Aucune progression.</p>'}</div>
    <div class="card"><button class="b" id="reopen" style="width:100%">Revenir en mode création</button></div>`;
    const re = () => { save(); progression(c, el); };
    const fill = () => { const t = $('#pt').value; $('#pk').innerHTML = targets(t).map(z => { const [v, n] = Array.isArray(z) ? z : [z, z]; return `<option value="${esc(v)}">${esc(n)}</option>`; }).join(''); };
    $('#pt').onchange = fill; fill();
    $('#xp').onchange = e => { c.xp = +e.target.value; re(); };
    $('#ep').onchange = e => { c.extraPicks = +e.target.value; re(); };
    $$('[data-xp]', el).forEach(b => b.onclick = () => { c.xp = (+c.xp || 0) + (+b.dataset.xp); re(); });
    $('#padd').onclick = () => { const t = $('#pt').value, k = $('#pk').value, P = x.progress.find(z => z[0] === t); if (!k) return;
      c.prog = c.prog || []; c.prog.push({ t, k, cost: P[2], lab: $('#pk').selectedOptions[0].text }); toast('Ajouté'); re(); };
    $$('[data-pd]', el).forEach(b => b.onclick = () => { c.prog.splice(+b.dataset.pd, 1); re(); });
    $('#reopen').onclick = () => { c.creation = true; save(); sheet(c); };
  }

  /* ---------- Fiche ---------- */
  function fiche(c, el) {
    const x = X(), d = derived(c), pen = penalty(c), E = edges(c), oS = orderSkills(c);
    const W = x.wounds.slice(0, d.levels);
    const cour = c.cour == null ? d.courage : c.cour;
    el.innerHTML = `<p class="mut" style="margin-top:0">${esc([SUB(c) && SUB(c).name, orderIds(c).map(id => ORD(id).name).join(' / ')].filter(Boolean).join(' · '))}</p>
    <div class="chars">${x.attrs.map(a => `<div class="ch" data-roll="attr|${a.id}" style="cursor:pointer"><div class="n">${a.name}${c.pattr.includes(a.id) ? ' ★' : ''}</div><div class="v">${attr(c, a.id)}</div><div class="mut">${sg(amod(c, a.id))}</div></div>`).join('')}</div>
    <div class="stats" style="margin-top:10px">${x.reactions.map(z => `<div class="stat" data-roll="react|${z.id}" style="cursor:pointer"><div class="v">${sg(react(c, z.id))}</div><div class="n">${z.name}${c.preact === z.id ? ' ★' : ''}</div></div>`).join('')}</div>
    <div class="stats" style="margin-top:8px"><div class="stat"><div class="v">${d.def}</div><div class="n">Défense</div></div><div class="stat"><div class="v">${d.sante}</div><div class="n">Santé</div></div>
      <div class="stat"><div class="v">${d.armor}${d.parry ? '/' + sg(d.parry) : ''}</div><div class="n">Armure${d.parry ? '/parade' : ''}</div></div><div class="stat"><div class="v">${d.renom}</div><div class="n">Renom</div></div></div>
    <h2>État</h2><div class="card">
      <div class="row" style="justify-content:space-between"><b>Courage</b><div class="trk"><button class="b sm" data-cr="-1">−</button><span class="v">${cour}/${d.courage}</span><button class="b sm" data-cr="1">+</button></div></div>
      <div class="row" style="justify-content:space-between;margin-top:8px"><b>Dégâts subis</b><div class="trk"><button class="b sm" data-dm="-1">−</button><span class="v">${c.dmg || 0}</span><button class="b sm" data-dm="1">+</button><button class="b sm" data-dm="5">+5</button></div></div>
      <div class="row" style="margin-top:6px;gap:4px">${W.map((w, i) => `<span class="pill ${i === pen.lvl ? 'c' : ''}" style="${i < pen.lvl ? 'opacity:.4' : ''}">${w[0]}${w[1] ? ' ' + w[1] : ''}</span>`).join('')}</div>
      ${pen.dead ? '<p class="ko">Au-delà du dernier niveau : mort !</p>' : `<p class="mut">Chaque niveau encaisse ${d.sante} dégâts.</p>`}
      <label class="f">Fatigue</label><select id="fat">${x.fatigue.map((f, i) => `<option value="${i}" ${+c.fat === i ? 'selected' : ''}>${f[0]}${f[1] ? ' (' + f[1] + ')' : ''}</option>`).join('')}</select>
      <p>Malus actuel aux tests : <b class="${pen.total < 0 ? 'ko' : ''}">${sg(pen.total)}</b> <span class="mut">(appliqué quand tu lances depuis la fiche)</span></p></div>
    <h2>Compétences — touche pour lancer</h2><div class="card">
      ${x.skills.map(z => { const r = rank(c, z[0]); if (!r && !z[4]) return ''; const tot = amod(c, z[2]) + r;
        return `<div class="sk" data-roll="sk|${z[0]}" style="cursor:pointer;grid-template-columns:1fr auto auto"><div class="nm">${oS.has(z[0]) ? '■' : '□'} ${esc(z[1])} <small class="car">(${ATN(z[2]).abbr})</small></div><span class="mut">${r || '–'}</span><b style="min-width:32px;text-align:right">${sg(tot)}</b></div>`; }).join('')}
      ${(c.langs || []).map(l => `<div class="sk" data-roll="lang|${esc(l.n)}|${l.r}" style="cursor:pointer;grid-template-columns:1fr auto auto"><div class="nm">◆ ${esc(l.n)}</div><span class="mut">${l.r}</span><b style="min-width:32px;text-align:right">${sg(amod(c, 'esp') + (+l.r || 0))}</b></div>`).join('')}
      <p class="mut">■ compétence d'ordre · □ néophyte possible (attribut seul) · ◆ langage/savoir indigène</p></div>
    ${c.weapons.length ? `<h2>Armes</h2><div class="card">${c.weapons.map((w, i) => { const skId = w.sk || 'ca', r = rank(c, skId), tot = amod(c, 'viv') + r;
      return `<div class="sk" data-roll="wp|${i}" style="cursor:pointer;grid-template-columns:1fr auto"><div class="nm"><b>${esc(w.n)}</b><br><small>${esc(skN(skId))} ${sg(tot)} · dégâts ${esc(w.dmg)}${skId === 'ca' ? ' ' + sg(amod(c, 'for')) : ''}${w.par && w.par !== '0' ? ' · parade ' + esc(w.par) : ''}</small></div><b>${sg(tot)}</b></div>`; }).join('')}</div>` : ''}
    <h2>Avantages et handicaps</h2><div class="card">
      ${Object.entries(E).map(([n, k]) => { const e = edgeInfo(n); return `<p style="margin:4px 0"><b>${esc(n)}</b>${k > 1 ? ' ' + k : ''} <span class="mut">${esc(e ? e[3] : '')}</span></p>`; }).join('') || '<p class="mut">—</p>'}
      ${flawsList(c).map(n => { const f = x.flaws.find(z => z[0] === n); return `<p style="margin:4px 0" class="ko"><b>${esc(n)}</b> <span class="mut">${esc(f ? f[1] : '')}</span></p>`; }).join('')}</div>
    <h2>Capacités</h2><div class="card">
      ${RACE(c) ? [...RACE(c).abil, ...(SUB(c) ? SUB(c).abil : [])].map(t => `<p style="margin:4px 0">• ${esc(t)}</p>`).join('') : ''}
      ${abilities(c).map(n => { const a = orderIds(c).map(id => ORD(id).abil.find(z => z[0] === n)).find(Boolean); return `<p style="margin:6px 0"><b>${esc(n)}</b> <span class="mut">${esc(a ? a[2] : '')}</span></p>`; }).join('')}</div>
    ${abilities(c).some(n => /Magie/.test(n)) || (c.spells || []).length ? spellsBlock(c) : ''}`;
    const re = () => { save(); fiche(c, el); };
    $$('[data-cr]', el).forEach(b => b.onclick = () => { c.cour = Math.max(0, Math.min(d.courage, cour + (+b.dataset.cr))); re(); });
    $$('[data-dm]', el).forEach(b => b.onclick = () => { c.dmg = Math.max(0, (c.dmg || 0) + (+b.dataset.dm)); re(); });
    $('#fat', el).onchange = e => { c.fat = +e.target.value; re(); };
    $$('[data-roll]', el).forEach(z => z.onclick = () => {
      const [t, k, k2] = z.dataset.roll.split('|'); let m = 0, lab = '';
      if (t === 'attr') { m = amod(c, k); lab = ATN(k).name; }
      if (t === 'react') { m = react(c, k); lab = x.reactions.find(y => y.id === k).name; }
      if (t === 'sk') { const s = SK(k); m = amod(c, s[2]) + rank(c, k); lab = s[1]; }
      if (t === 'lang') { m = amod(c, 'esp') + (+k2 || 0); lab = k; }
      if (t === 'wp') { const w = c.weapons[+k]; m = amod(c, 'viv') + rank(c, w.sk || 'ca'); lab = w.n; }
      DMOD = m + (pen.total || 0); DLAB = `${c.name} · ${lab}${pen.total ? ' (malus ' + pen.total + ')' : ''}`; DLAST = null; go('des');
    });
    bindSpells(c, el, re);
  }
  function spellsBlock(c) {
    const max = abilities(c).reduce((a, n) => a + (n === 'Magie' ? (ORD('savoir') && c.order === 'savoir' ? 2 : 5) : n === 'Magie supérieure' ? 5 : 0), 0);
    const used = (c.spells || []).reduce((a, n) => { const s = X().spells.find(z => z[0] === n); return a + (s ? s[5] : 1); }, 0);
    return `<h2>Sorts</h2><div class="card"><div class="mut">Choix de sorts utilisés : ${used} / ${max || '?'} (le coût de chaque sort est indiqué)</div>
      ${(c.spells || []).map((n, i) => { const s = X().spells.find(z => z[0] === n) || [n]; return `<div class="sk" style="grid-template-columns:1fr auto"><div class="nm"><b>${esc(n)}</b>${s[9] ? ' <span class="pill">Sorcellerie</span>' : ''}<br><small>${esc([s[1] && 'Incant. ' + s[1], s[2], s[3], s[4] && 'Fatigue SD ' + s[4], s[7]].filter(Boolean).join(' · '))}</small></div><button class="b sm bad" data-spd="${i}">✕</button></div>`; }).join('')}
      <select id="spAdd" style="margin-top:6px"><option value="">+ apprendre un sort…</option>${X().spells.filter(s => !(c.spells || []).includes(s[0])).map(s => `<option value="${esc(s[0])}">${esc(s[0])} (${s[5]} choix${s[6] ? ' · cond. ' + s[6] : ''})</option>`).join('')}</select>
      <p class="mut">* par point de Prestance. Tester la Vigueur contre la Fatigue (SD indiqué) à chaque sort.</p></div>`;
  }
  function bindSpells(c, el, re) {
    const a = $('#spAdd', el); if (a) a.onchange = () => { if (a.value) { c.spells = c.spells || []; c.spells.push(a.value); } re(); };
    $$('[data-spd]', el).forEach(b => b.onclick = () => { c.spells.splice(+b.dataset.spd, 1); re(); });
  }

  /* ---------- Équipement et notes ---------- */
  function equip(c, el) {
    const x = X();
    el.innerHTML = `<h2>Armes</h2><div class="card">${c.weapons.map((w, i) => `<div class="row" style="flex-wrap:nowrap;margin-bottom:6px"><span class="grow"><b>${esc(w.n)}</b> <span class="mut">${esc(skN(w.sk))} · ${esc(w.dmg)}${w.par && w.par !== '0' ? ' · parade ' + esc(w.par) : ''}${w.rng ? ' · ' + esc(w.rng) : ''}</span></span><button class="b sm bad" data-wd="${i}">✕</button></div>`).join('') || '<p class="mut">Aucune arme.</p>'}
      <select id="wAdd">${opts(x.weapons.map((w, i) => [i, `${w[0]} (${w[2]}${w[6] ? ' · ' + w[6] : ''})`]), '', '+ ajouter une arme…')}</select></div>
    <h2>Armure</h2><div class="card"><select id="arm">${opts(x.armors.map(a => [a[0], `${a[0]} (absorbe ${a[1]}, ${a[2]}, ${a[3]})${a[4] ? ' ' + a[4] : ''}`]), c.armor, 'Aucune')}</select>
      <select id="shd" style="margin-top:6px">${opts(x.shields.map(s => [s[0], `${s[0]} (parade +${s[1]}, distance ${s[2]})`]), c.shield, 'Pas de bouclier')}</select>
      <p class="mut">Haubert complet : +1 absorbé mais −1 aux tests de Vivacité. Mailles garnies de plaques : +1.</p></div>
    <h2>Bourse</h2><div class="card"><input id="purse" value="${esc(c.purse)}" placeholder="ex. 3 PA, 12 sa"></div>
    <h2>Matériel</h2><div class="card"><textarea id="gear" placeholder="Corde elfique, lembas, cape…">${esc(c.gear)}</textarea></div>`;
    const re = () => { save(); equip(c, el); };
    $('#wAdd', el).onchange = e => { const w = x.weapons[+e.target.value]; if (w) c.weapons.push({ n: w[0], sk: w[1], dmg: w[2], par: w[1] === 'ca' ? w[3] : '', rng: w[1] === 'cad' ? w[3] : '' }); re(); };
    $$('[data-wd]', el).forEach(b => b.onclick = () => { c.weapons.splice(+b.dataset.wd, 1); re(); });
    $('#arm', el).onchange = e => { c.armor = e.target.value; re(); };
    $('#shd', el).onchange = e => { c.shield = e.target.value; re(); };
    $('#purse', el).onchange = e => { c.purse = e.target.value; save(); };
    $('#gear', el).onchange = e => { c.gear = e.target.value; save(); };
  }
  function notes(c, el) {
    el.innerHTML = `<label class="f">Description, histoire</label><textarea id="ds" style="min-height:140px">${esc(c.desc)}</textarea>
      <label class="f">Notes (spécialités d'Artisanat, Savoir…, chronique)</label><textarea id="nt" style="min-height:180px">${esc(c.notes)}</textarea>`;
    $('#ds', el).onchange = e => { c.desc = e.target.value; save(); };
    $('#nt', el).onchange = e => { c.notes = e.target.value; save(); };
  }

  /* ---------- Dés CODA ---------- */
  function roll2d6() {
    const a = 1 + Math.floor(Math.random() * 6), b = 1 + Math.floor(Math.random() * 6), dice = [a, b];
    if (a === 6 && b === 6) { let e; do { e = 1 + Math.floor(Math.random() * 6); dice.push(e); } while (e === 6); }
    return dice;
  }
  function des() {
    const el = $('#v-des'), x = X();
    const r = DLAST;
    let res = '';
    if (r) {
      const tot = r.dice.reduce((a, b) => a + b, 0) + DMOD + 3 * DCOUR, diff = tot - DSD;
      const deg = x.degrees.find(g => diff >= g[0]);
      res = `<div class="res">${r.dice.map((v, i) => `<div class="die" style="background:${i > 1 ? 'var(--acc)' : '#e8e2d0'};color:#1b1200">${v}</div>`).join('')}</div>
        <div class="sum"><span class="big">${tot}</span><span class="mut">= ${r.dice.join(' + ')} ${sg(DMOD)}${DCOUR ? ' + ' + 3 * DCOUR + ' (Courage)' : ''}</span></div>
        <div class="verdict ${deg[2]}">${deg[1]} <span class="mut" style="font-size:14px">(${sg(diff)} / SD ${DSD})</span></div>${r.dice.length > 2 ? '<p style="text-align:center" class="ok">Double 6 ! Dés supplémentaires ajoutés.</p>' : ''}
        <div class="row" style="justify-content:center"><button class="b sm" id="addC">+1 Courage (+3)</button></div>`;
    }
    el.innerHTML = `<h2>Test (2d6)</h2>${DLAB ? `<div class="mut" style="margin-bottom:8px">Test : <b style="color:var(--acc)">${esc(DLAB)}</b></div>` : ''}
      <div class="card"><label class="f">Modificateur total (attribut + compétence + bonus)</label>${pm('mod', sg(DMOD))}
      <label class="f">Seuil de difficulté</label><div class="row">${x.sd.map(s => `<button class="b sm ${DSD === s[1] ? 'acc' : ''}" data-sd="${s[1]}">${s[0]} ${s[1]}</button>`).join('')}</div>
      <div class="row" style="margin-top:6px">${pm('sd', DSD)}</div></div>
      <div class="row"><button class="b grow" id="clr">Réinitialiser</button><button class="b acc grow" id="roll" style="flex:2">Lancer 2d6</button></div>
      <div id="result">${res}</div>
      <div class="card mut" style="margin-top:12px">Double 6 : on ajoute un dé, et on relance tant qu'il fait 6. Chaque point de Courage dépensé ajoute +3 (max 4 par round), même après le jet.</div>`;
    $$('[data-p]', el).forEach(b => b.onclick = () => { if (b.dataset.p === 'mod') DMOD++; else DSD++; des(); });
    $$('[data-m]', el).forEach(b => b.onclick = () => { if (b.dataset.m === 'mod') DMOD--; else DSD = Math.max(0, DSD - 1); des(); });
    $$('[data-sd]', el).forEach(b => b.onclick = () => { DSD = +b.dataset.sd; des(); });
    $('#clr').onclick = () => { DMOD = 0; DSD = 10; DLAB = ''; DLAST = null; DCOUR = 0; des(); };
    $('#roll').onclick = () => { DLAST = { dice: roll2d6() }; DCOUR = 0; if (navigator.vibrate) navigator.vibrate(30); des(); };
    const ac = $('#addC'); if (ac) ac.onclick = () => { if (DCOUR >= 4) return toast('4 points max par round'); DCOUR++; des(); };
  }

  /* ---------- Espace MJ ---------- */
  function mjS() { S.mjSda = Object.assign({ init: [], cur: 0, round: 1, foes: [], notes: '' }, S.mjSda); return S.mjSda; }
  function mj() {
    const el = $('#v-mj'), m = mjS(), x = X();
    const tabs = [['init', 'Initiative'], ['foes', 'Adversaires'], ['best', 'Bestiaire'], ['notes', 'Notes']];
    el.innerHTML = `<h2>Espace Narrateur</h2><div class="tabs">${tabs.map(([k, n]) => `<button class="b sm ${MJT === k ? 'on' : ''}" data-mt="${k}">${n}</button>`).join('')}</div><div id="mjc"></div>`;
    $$('[data-mt]', el).forEach(b => b.onclick = () => { MJT = b.dataset.mt; mj(); });
    const c = $('#mjc'), re = () => { save(); mj(); };
    if (MJT === 'init') {
      c.innerHTML = `<div class="row" style="margin-bottom:10px"><b class="grow">Round ${m.round}</b><button class="b sm" id="iRoll">🎲 Tout lancer</button><button class="b acc sm" id="iNext">Suivant ▶</button></div>
        <div class="list ini">${m.init.map((z, i) => `<div class="it ${i === m.cur ? 'cur' : ''}"><input value="${esc(z.n)}" data-in="${i}" class="grow" style="padding:6px"><span class="mut">Rap.</span><input type="number" value="${z.rap}" data-ir="${i}" style="width:54px;padding:6px"><b style="min-width:30px;text-align:center">${z.v ?? '–'}</b><button class="b sm bad" data-id="${i}">✕</button></div>`).join('') || '<p class="mut">Ajoute les combattants.</p>'}</div>
        <div class="row"><button class="b grow" id="iAdd">+ Combattant</button><button class="b grow" id="iPJ">+ Tous les héros</button><button class="b" id="iClr">Vider</button></div>
        <p class="mut">Initiative : test de Rapidité (2d6 + Rapidité), du plus haut au plus bas. Prudent donne +3.</p>`;
      $('#iAdd').onclick = () => { m.init.push({ n: 'Adversaire', rap: 0 }); re(); };
      $('#iPJ').onclick = () => { S.chars.filter(z => z.sys === 'sda' && !z.creation).forEach(z => m.init.push({ n: z.name, rap: react(z, 'rap') + (edges(z)['Prudent'] ? 3 : 0) })); re(); };
      $('#iClr').onclick = () => { m.init = []; m.cur = 0; m.round = 1; re(); };
      $('#iRoll').onclick = () => { m.init.forEach(z => z.v = roll2d6().reduce((a, b) => a + b, 0) + (+z.rap || 0)); m.init.sort((a, b) => b.v - a.v); m.cur = 0; re(); };
      $('#iNext').onclick = () => { if (!m.init.length) return; m.cur++; if (m.cur >= m.init.length) { m.cur = 0; m.round++; toast('Round ' + m.round); } re(); };
      $$('[data-in]', c).forEach(i => i.onchange = () => { m.init[+i.dataset.in].n = i.value; save(); });
      $$('[data-ir]', c).forEach(i => i.onchange = () => { m.init[+i.dataset.ir].rap = +i.value; save(); });
      $$('[data-id]', c).forEach(b => b.onclick = () => { m.init.splice(+b.dataset.id, 1); re(); });
    }
    if (MJT === 'foes') {
      c.innerHTML = m.foes.map((f, i) => { const lvl = Math.min(Math.floor((f.dmg || 0) / Math.max(1, f.h)), 5);
        return `<div class="card"><div class="row"><input value="${esc(f.n)}" data-fn="${i}" class="grow" style="font-weight:700"><button class="b sm" data-fdup="${i}">⧉</button><button class="b sm bad" data-fdel="${i}">✕</button></div>
          <p class="mut" style="margin:6px 0">Santé ${f.h} · Défense ${f.def} · Armure ${f.arm || 0} · Rap. ${sg(f.rap)}</p>
          <div class="row" style="justify-content:space-between"><b>Dégâts</b><div class="trk"><button class="b sm" data-fdm="${i}|-1">−</button><span class="v">${f.dmg || 0}</span><button class="b sm" data-fdm="${i}|1">+</button><button class="b sm" data-fdm="${i}|5">+5</button></div></div>
          <p style="margin:6px 0">${lvl >= 6 ? '<b class="ko">Mort</b>' : `État : <b class="${lvl ? 'ko' : 'ok'}">${x.wounds[lvl][0]}</b>`}</p>
          ${f.sk ? `<p class="mut" style="margin:4px 0">${esc(f.sk)}</p>` : ''}${f.ab ? `<p class="mut" style="margin:4px 0">${esc(f.ab)}</p>` : ''}</div>`; }).join('') + `<button class="b acc" id="fAdd" style="width:100%">+ Adversaire vierge</button><p class="mut">Ou ajoute une créature depuis le Bestiaire.</p>`;
      $('#fAdd').onclick = () => { m.foes.push({ n: 'Adversaire', h: 8, def: 10, arm: 0, rap: 0, dmg: 0 }); re(); };
      $$('[data-fn]', c).forEach(i => i.onchange = () => { m.foes[+i.dataset.fn].n = i.value; save(); });
      $$('[data-fdel]', c).forEach(b => b.onclick = () => { m.foes.splice(+b.dataset.fdel, 1); re(); });
      $$('[data-fdup]', c).forEach(b => b.onclick = () => { const f = JSON.parse(JSON.stringify(m.foes[+b.dataset.fdup])); f.dmg = 0; m.foes.push(f); re(); });
      $$('[data-fdm]', c).forEach(b => b.onclick = () => { const [i, d] = b.dataset.fdm.split('|'); const f = m.foes[+i]; f.dmg = Math.max(0, (f.dmg || 0) + (+d)); re(); });
    }
    if (MJT === 'best') {
      c.innerHTML = `<div class="list">${x.creatures.map((z, i) => `<div class="it" data-cr="${i}" style="cursor:pointer"><div class="grow"><b>${esc(z.n)}</b><div class="mut">Santé ${z.h} · Rapidité ${sg(z.r[0])} · Vigueur ${sg(z.r[2])}</div></div></div>`).join('')}</div>`;
      $$('[data-cr]', c).forEach(d => d.onclick = () => {
        const z = x.creatures[+d.dataset.cr], AB = ['ESP', 'FOR', 'PER', 'PRE', 'VIT', 'VIV'];
        modal(`<div class="row"><h2 class="grow" style="margin:0">${esc(z.n)}</h2><button class="b sm" onclick="closeModal()">✕</button></div>
          <div class="chars" style="grid-template-columns:repeat(6,1fr);margin-top:8px">${z.a.map((v, j) => `<div class="ch" style="padding:4px"><div class="v" style="font-size:18px">${v}</div><div class="n">${AB[j]} ${sg(modOf(v))}</div></div>`).join('')}</div>
          <p>Rapidité ${sg(z.r[0])} · Sagesse ${sg(z.r[1])} · Vigueur ${sg(z.r[2])} · Volonté ${sg(z.r[3])} · <b>Santé ${z.h}</b> · Défense ${10 + modOf(z.a[5])}</p>
          <h3>Compétences</h3><p>${esc(z.sk)}</p><h3>Capacités</h3><p>${esc(z.ab)}</p>
          <div class="row"><input type="number" id="crN" value="1" style="width:70px"><button class="b acc grow" id="crAdd">+ Ajouter au combat</button></div>`);
        $('#crAdd').onclick = () => { const n = +$('#crN').value || 1, arm = (z.ab.match(/(\d+) armure/) || [, 0])[1];
          for (let k = 0; k < n; k++) { m.foes.push({ n: z.n + (n > 1 ? ' ' + (k + 1) : ''), h: z.h, def: 10 + modOf(z.a[5]), arm: +arm, rap: z.r[0], dmg: 0, sk: z.sk, ab: z.ab }); m.init.push({ n: z.n + (n > 1 ? ' ' + (k + 1) : ''), rap: z.r[0] }); }
          save(); closeModal(); MJT = 'foes'; mj(); toast('Ajouté au combat et à l\'initiative'); };
      });
    }
    if (MJT === 'notes') {
      c.innerHTML = `<textarea id="mjN" style="min-height:60vh" placeholder="Chapitres, objectifs, PNJ, lieux…">${esc(m.notes)}</textarea>`;
      $('#mjN').oninput = e => { m.notes = e.target.value; clearTimeout(mj.t); mj.t = setTimeout(save, 400); };
    }
  }

  window.MODS.sda = { persos, des, mj };
})();
