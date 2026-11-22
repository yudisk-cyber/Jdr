/* Module « Monster of the Week » pour Codex JDR. Utilise les outils communs d'app.js. */
'use strict';
window.MODS = window.MODS || {};
(function () {
  const X = () => window.MOTW_DATA;
  const PB = id => X().playbooks.find(p => p.id === id);
  const STN = k => (X().stats.find(s => s[0] === k) || [, k])[1];
  const sg = n => (n >= 0 ? '+' : '') + n;
  const d6 = () => 1 + Math.floor(Math.random() * 6);
  const STATMAP = { Charme: 'charme', Cool: 'cool', 'Futé': 'fute', Coriace: 'coriace', Bizarre: 'bizarre' };
  let STAB = 'fiche', MJT = 'mys';
  let DMOD = 0, DSTAT = '', DLAB = '', DMOVE = null, DCHAR = null, DLAST = null, DFORCE = null, DTEMP = 0;

  function newMotw() {
    return { id: uid(), sys: 'motw', name: 'Nouveau chasseur', player: '', creation: true, pb: '', look: '', line: -1, adj: {}, sec: {}, moves: [], extra: [], weapons: [], wcustom: '', armor: 0,
      history: '', luck: 0, harm: 0, instable: false, xp: 0, imps: [], advs: [], advMoves: [], gear: '', notes: '', refuge: [] };
  }
  function stats(c) {
    const p = PB(c.pb), line = p && c.line >= 0 ? p.stats[c.line] : [0, 0, 0, 0, 0], o = {};
    X().stats.forEach(([k], i) => o[k] = (line[i] || 0) + (+(c.adj || {})[k] || 0));
    return o;
  }
  const allMoves = () => X().playbooks.flatMap(p => p.moves.map(m => [p, m]));
  const moveInfo = n => { const f = allMoves().find(([, m]) => m[0] === n); return f ? { pb: f[0], m: f[1] } : null; };
  /* bonus automatiques liés à certains choix */
  function autoBonus(text) { const m = /^\+1 (Charme|Cool|Futé|Coriace|Bizarre)/.exec(text); if (m) return STATMAP[m[1]];
    if (text === 'Regard fou') return 'bizarre'; if (text === 'Imperturbable') return 'cool'; return null; }
  function setAdj(c, k, d) { c.adj = c.adj || {}; c.adj[k] = (+c.adj[k] || 0) + d; }

  /* ---------- Liste ---------- */
  function persos() {
    const el = $('#v-persos');
    if (CUR && getChar(CUR) && getChar(CUR).sys === 'motw') return sheet(getChar(CUR));
    CUR = null;
    el.innerHTML = `<h2>L'équipe de chasseurs</h2>
      <div class="list">${S.chars.filter(c => c.sys === 'motw').map(c => `<div class="it" data-open="${c.id}"><div class="grow"><b>${esc(c.name)}</b><div class="mut">${esc(PB(c.pb) ? PB(c.pb).n : 'À créer')}${c.creation ? '' : ` · dégâts ${c.harm}/7 · Chance ${7 - c.luck}`}</div></div>${c.creation ? '<span class="pill c">création</span>' : ''}</div>`).join('') || '<p class="mut">Aucun chasseur pour l\'instant.</p>'}</div>
      <div class="row"><button class="b acc grow" id="newC">+ Créer un chasseur</button><button class="b" id="impC">Importer</button></div><input type="file" id="impF" accept=".json" hidden>`;
    $('#newC').onclick = () => { const c = newMotw(); S.chars.push(c); save(); CUR = c.id; STAB = 'creation'; render(); window.scrollTo(0, 0); };
    $$('[data-open]', el).forEach(d => d.onclick = () => { CUR = d.dataset.open; STAB = getChar(CUR).creation ? 'creation' : 'fiche'; render(); });
    $('#impC').onclick = () => $('#impF').click();
    $('#impF').onchange = async e => { try { const c = JSON.parse(await e.target.files[0].text()); c.id = uid(); c.sys = 'motw'; S.chars.push(c); save(); render(); } catch (err) { toast('Fichier invalide'); } };
  }
  function sheet(c) {
    const el = $('#v-persos');
    const tabs = [['creation', c.creation ? 'Création' : 'Galons'], ['fiche', 'Fiche'], ['notes', 'Notes']];
    el.innerHTML = `<div class="row" style="margin-bottom:10px"><button class="b sm" id="back">← Équipe</button><div class="grow"></div><button class="b sm" id="exp">Exporter</button><button class="b sm bad" id="del">Suppr.</button></div>
      <input id="cname" value="${esc(c.name)}" style="font-size:20px;font-weight:800;margin-bottom:10px">
      <div class="tabs">${tabs.map(([k, n]) => `<button class="b sm ${STAB === k ? 'on' : ''}" data-t="${k}">${n}</button>`).join('')}</div><div id="sheet"></div>`;
    $('#back').onclick = () => { CUR = null; render(); };
    $('#cname').onchange = e => { c.name = e.target.value; save(); };
    $('#del').onclick = () => { if (confirm('Supprimer ' + c.name + ' ?')) { S.chars = S.chars.filter(x => x !== c); CUR = null; save(); render(); } };
    $('#exp').onclick = () => download(c.name.replace(/\W+/g, '_') + '.json', JSON.stringify(c, null, 1));
    $$('[data-t]', el).forEach(b => b.onclick = () => { STAB = b.dataset.t; sheet(c); window.scrollTo(0, 0); });
    ({ creation: c.creation ? creation : galons, fiche, notes })[STAB](c, $('#sheet'));
  }
  const counter = (used, max, label) => `<div class="mut" style="margin:6px 0">${label} : <b class="${used > max ? 'ko' : used === max ? 'ok' : ''}">${used} / ${max}</b></div>`;
  const book = n => `<button class="b sm" data-book="${esc(n)}" title="Lire dans le livre">📖</button>`;
  const bindBook = el => $$('[data-book]', el).forEach(b => b.onclick = e => { e.stopPropagation(); lookUp(b.dataset.book); });

  /* ---------- Création ---------- */
  function creation(c, el) {
    const x = X(), p = PB(c.pb);
    const chosenPick = p ? c.moves.filter(n => !p.fixed.includes(n)).length : 0;
    el.innerHTML = `
    <h2>1 · Livret</h2>
    <div class="card"><select id="pb">${`<option value="">Choisir un livret…</option>` + x.playbooks.map(q => `<option value="${q.id}" ${c.pb === q.id ? 'selected' : ''}>${esc(q.n)}</option>`).join('')}</select>
      ${p ? `<p class="mut">${esc(p.d)} <span class="mut">(livre p. ${p.p})</span></p>` : '<p class="mut">Un seul exemplaire de chaque livret par équipe.</p>'}
      <label class="f">Apparence (genre, visage, tenue…)</label><input id="look" value="${esc(c.look)}">
      <label class="f">Joueur</label><input id="pl" value="${esc(c.player)}"></div>
    ${p ? `
    <h2>2 · Caractéristiques</h2>
    <div class="card"><p class="mut" style="margin-top:0">Choisis une ligne.</p>${p.stats.map((l, i) => `<label class="sk" style="grid-template-columns:auto 1fr;cursor:pointer"><input type="radio" name="line" value="${i}" ${c.line === i ? 'checked' : ''} style="width:auto"><span>${x.stats.map(([k, n], j) => `${n} <b>${sg(l[j])}</b>`).join(' · ')}</span></label>`).join('')}</div>
    ${p.sections.map((s, si) => { const cur = c.sec[si] || []; const opts = s.refuge ? x.refuge.map(r => r[0] + ' — ' + r[1]) : s.o; const max = s.k;
      return `<h2>${esc(s.t)}</h2><div class="card">${s.min ? '' : counter(cur.length, max, 'Choix')}${opts.map((o, oi) => `<label class="mut" style="display:block;margin:6px 0"><input type="checkbox" data-sec="${si}|${oi}" ${cur.includes(oi) ? 'checked' : ''} style="width:auto"> ${esc(o)}</label>`).join('')}</div>`; }).join('')}
    <h2>Manœuvres</h2>
    <div class="card"><p class="mut" style="margin-top:0">Toutes les manœuvres de base${p.fixed.length ? ', plus : <b>' + p.fixed.map(esc).join(', ') + '</b>' : ''}.</p>${counter(chosenPick, p.pick, 'Manœuvres à choisir')}
      ${p.moves.filter(m => !p.fixed.includes(m[0])).map(m => `<label class="sk" style="grid-template-columns:auto 1fr auto;cursor:pointer"><input type="checkbox" data-mv="${esc(m[0])}" ${c.moves.includes(m[0]) ? 'checked' : ''} style="width:auto"><span><b>${esc(m[0])}</b><br><small class="mut">${esc(m[1])}</small></span>${book(m[0])}</label>`).join('')}</div>
    <h2>Équipement</h2>
    <div class="card"><p class="mut" style="margin-top:0">${esc(p.gear)}</p>${p.wpick ? counter(c.weapons.length, p.wpick, 'Armes') : ''}
      ${p.weapons.map(w => `<label class="mut" style="display:block;margin:6px 0"><input type="checkbox" data-wp="${esc(w)}" ${c.weapons.includes(w) ? 'checked' : ''} style="width:auto"> ${esc(w)}</label>`).join('')}
      <label class="f">Arme personnalisée (ex. arme spéciale de l'Élu)</label><input id="wcus" value="${esc(c.wcustom)}" placeholder="Nom (dégâts, portée, traits)">
      <label class="f">Armure</label><input type="number" id="arm" value="${c.armor}" min="0" max="3"></div>
    <h2>Présentations et histoire</h2>
    <div class="card"><p class="mut" style="margin-top:0">Présente ton chasseur, puis choisis une ligne d'histoire pour chaque autre chasseur (voir ton livret, p. ${p.p + 3}).</p><textarea id="hist" placeholder="Avec X : … / Avec Y : …">${esc(c.history)}</textarea></div>
    <div class="card"><button class="b acc" id="finish" style="width:100%">Terminer la création</button><div id="warn" class="mut" style="margin-top:8px"></div></div>` : ''}`;
    const re = () => { save(); creation(c, el); };
    const on = (sel, fn, ev = 'onchange') => { const z = $(sel, el); if (z) z[ev] = fn; };
    on('#pb', e => { const was = c.moves.map(autoBonus).filter(Boolean); was.forEach(k => setAdj(c, k, -1));
      c.pb = e.target.value; c.line = -1; c.sec = {}; c.moves = []; c.weapons = []; const q = PB(c.pb); if (q) { c.moves = [...q.fixed]; c.armor = q.armor || 0; } re(); });
    on('#look', e => { c.look = e.target.value; save(); }); on('#pl', e => { c.player = e.target.value; save(); });
    if (!p) return;
    $$('[name=line]', el).forEach(i => i.onchange = () => { c.line = +i.value; re(); });
    $$('[data-sec]', el).forEach(i => i.onchange = () => { const [si, oi] = i.dataset.sec.split('|').map(Number), s = p.sections[si]; const cur = c.sec[si] = c.sec[si] || [];
      if (i.checked) { if (cur.length >= s.k) { i.checked = false; return toast(`${s.k} choix maximum`); } cur.push(oi); } else c.sec[si] = cur.filter(v => v !== oi);
      if (s.refuge) c.refuge = (c.sec[si] || []).map(v => X().refuge[v][0]); re(); });
    $$('[data-mv]', el).forEach(i => i.onchange = () => { const n = i.dataset.mv, b = autoBonus(n);
      if (i.checked) { if (chosenPick >= p.pick) { i.checked = false; return toast(`${p.pick} manœuvre(s) à choisir`); } c.moves.push(n); if (b) setAdj(c, b, 1); }
      else { c.moves = c.moves.filter(v => v !== n); if (b) setAdj(c, b, -1); } re(); });
    $$('[data-wp]', el).forEach(i => i.onchange = () => { const w = i.dataset.wp; if (i.checked) { if (p.wpick && c.weapons.length >= p.wpick) { i.checked = false; return toast(`${p.wpick} arme(s)`); } c.weapons.push(w); } else c.weapons = c.weapons.filter(v => v !== w); re(); });
    on('#wcus', e => { c.wcustom = e.target.value; save(); }); on('#arm', e => { c.armor = +e.target.value || 0; save(); }); on('#hist', e => { c.history = e.target.value; save(); });
    bindBook(el);
    on('#finish', () => {
      const w = [];
      if (c.line < 0) w.push('Choisis une ligne de caractéristiques.');
      p.sections.forEach((s, si) => { const n = (c.sec[si] || []).length; if (s.min ? n < s.min : n !== s.k) w.push(`${s.t} : ${n}/${s.min ? s.min + '+' : s.k}.`); });
      if (chosenPick !== p.pick) w.push(`Manœuvres : ${chosenPick}/${p.pick}.`);
      if (p.wpick && c.weapons.length !== p.wpick) w.push(`Armes : ${c.weapons.length}/${p.wpick}.`);
      if (w.length && !confirm('À vérifier :\n• ' + w.join('\n• ') + '\n\nTerminer quand même ?')) { $('#warn').innerHTML = w.map(esc).join('<br>'); return; }
      c.creation = false; save(); STAB = 'fiche'; sheet(c); window.scrollTo(0, 0);
    }, 'onclick');
  }

  /* ---------- Galons (améliorations) ---------- */
  function galons(c, el) {
    const x = X(), p = PB(c.pb) || { imp: [], adv: [], moves: [] }, n = c.imps.length;
    const others = allMoves().filter(([q, m]) => q.id !== c.pb && !c.extra.includes(m[0]));
    el.innerHTML = `<div class="card"><div class="row" style="justify-content:space-between"><b>Expérience</b><div class="trk"><button class="b sm" data-xp="-1">−</button><span class="v">${c.xp}/5</span><button class="b sm" data-xp="1">+</button></div></div>
      <p class="mut">À 5 XP, coche une amélioration : l'XP repart à 0. Améliorations prises : ${n}${n >= 5 ? ' — avancées débloquées' : ''}.</p></div>
    <h2>Améliorations</h2><div class="card">${p.imp.map((t, i) => `<label class="mut" style="display:block;margin:6px 0"><input type="checkbox" data-imp="${i}" ${c.imps.includes(i) ? 'checked' : ''} style="width:auto"> ${esc(t)}</label>`).join('')}</div>
    <h2>Améliorations avancées</h2><div class="card">${n < 5 ? '<p class="mut" style="margin:0 0 6px">Disponibles après 5 améliorations.</p>' : ''}${[...x.advCommon, ...p.adv].map(t => `<label class="mut" style="display:block;margin:6px 0"><input type="checkbox" data-adv="${esc(t)}" ${c.advs.includes(t) ? 'checked' : ''} ${n < 5 && !c.advs.includes(t) ? 'disabled' : ''} style="width:auto"> ${esc(t)}</label>`).join('')}
      <label class="f">Manœuvres de base avancées (12+)</label>${x.basic.map(b => `<label class="mut" style="display:block;margin:4px 0"><input type="checkbox" data-am="${b.id}" ${c.advMoves.includes(b.id) ? 'checked' : ''} style="width:auto"> ${esc(b.n)}</label>`).join('')}</div>
    <h2>Manœuvres apprises</h2><div class="card">
      ${p.moves.filter(m => !c.moves.includes(m[0])).length ? `<select id="ownAdd"><option value="">+ une autre manœuvre de ton livret…</option>${p.moves.filter(m => !c.moves.includes(m[0])).map(m => `<option>${esc(m[0])}</option>`).join('')}</select>` : ''}
      <select id="othAdd" style="margin-top:6px"><option value="">+ une manœuvre d'un autre livret…</option>${x.playbooks.filter(q => q.id !== c.pb).map(q => `<optgroup label="${esc(q.n)}">${q.moves.filter(m => !c.extra.includes(m[0])).map(m => `<option>${esc(m[0])}</option>`).join('')}</optgroup>`).join('')}</select>
      ${c.extra.map((m, i) => `<div class="row" style="justify-content:space-between;margin-top:6px"><span>${esc(m)} <span class="mut">(${esc(moveInfo(m) ? moveInfo(m).pb.n : '')})</span></span><button class="b sm bad" data-xd="${i}">✕</button></div>`).join('')}</div>
    <h2>Caractéristiques (ajustement manuel)</h2><div class="card">${(() => { const s = stats(c); return x.stats.map(([k, nm]) => `<div class="sk" style="grid-template-columns:1fr auto"><div class="nm">${nm} <b>${sg(s[k])}</b></div><div class="row" style="gap:4px;flex-wrap:nowrap"><button class="b sm" data-adj="${k}|-1">−</button><button class="b sm" data-adj="${k}|1">+</button></div></div>`).join(''); })()}
      <p class="mut">Les +1 des améliorations s'ajoutent tout seuls. « +1 dans n'importe quelle caractéristique » ou un pacte : ajuste ici.</p></div>
    <div class="card"><button class="b" id="reopen" style="width:100%">Revenir en mode création</button></div>`;
    const re = () => { save(); galons(c, el); };
    $$('[data-xp]', el).forEach(b => b.onclick = () => { c.xp = Math.max(0, Math.min(5, c.xp + (+b.dataset.xp))); re(); });
    $$('[data-imp]', el).forEach(i => i.onchange = () => { const k = +i.dataset.imp, t = p.imp[k], b = autoBonus(t);
      if (i.checked) { c.imps.push(k); if (b) setAdj(c, b, 1); if (c.xp >= 5) c.xp = 0; } else { c.imps = c.imps.filter(v => v !== k); if (b) setAdj(c, b, -1); } re(); });
    $$('[data-adv]', el).forEach(i => i.onchange = () => { const t = i.dataset.adv; if (i.checked) { c.advs.push(t); if (c.xp >= 5) c.xp = 0; } else c.advs = c.advs.filter(v => v !== t); re(); });
    $$('[data-am]', el).forEach(i => i.onchange = () => { const t = i.dataset.am; if (i.checked) c.advMoves.push(t); else c.advMoves = c.advMoves.filter(v => v !== t); re(); });
    const oa = $('#ownAdd', el); if (oa) oa.onchange = () => { if (oa.value) { c.moves.push(oa.value); const b = autoBonus(oa.value); if (b) setAdj(c, b, 1); } re(); };
    $('#othAdd', el).onchange = e => { if (e.target.value) { c.extra.push(e.target.value); const b = autoBonus(e.target.value); if (b) setAdj(c, b, 1); } re(); };
    $$('[data-xd]', el).forEach(b => b.onclick = () => { const m = c.extra[+b.dataset.xd], bb = autoBonus(m); if (bb) setAdj(c, bb, -1); c.extra.splice(+b.dataset.xd, 1); re(); });
    $$('[data-adj]', el).forEach(b => b.onclick = () => { const [k, d] = b.dataset.adj.split('|'); setAdj(c, k, +d); re(); });
    $('#reopen').onclick = () => { c.creation = true; save(); sheet(c); };
  }

  /* ---------- Fiche ---------- */
  function rollTo(c, stat, lab, move, mod = 0) { DSTAT = stat; DMOD = (c ? stats(c)[stat] : 0) + mod; DLAB = (c ? c.name + ' · ' : '') + lab; DMOVE = move; DCHAR = c ? c.id : null; DLAST = null; DFORCE = null; DTEMP = 0; go('des'); }
  function fiche(c, el) {
    const x = X(), p = PB(c.pb) || { moves: [], n: '', sections: [] }, s = stats(c);
    const mine = [...c.moves, ...c.extra];
    el.innerHTML = `<p class="mut" style="margin-top:0">${esc([p.n, c.look].filter(Boolean).join(' · '))}</p>
    <div class="stats" style="grid-template-columns:repeat(5,1fr)">${x.stats.map(([k, n]) => `<div class="stat" data-st="${k}" style="cursor:pointer"><div class="v">${sg(s[k])}</div><div class="n">${n}</div></div>`).join('')}</div>
    <h2>État</h2><div class="card">
      <div class="row" style="justify-content:space-between"><b>Dégâts</b><div class="trk"><button class="b sm" data-hm="-1">−</button><span class="v">${c.harm}/7</span><button class="b sm" data-hm="1">+</button></div></div>
      <div class="row" style="gap:3px;margin:6px 0">${[1, 2, 3, 4, 5, 6, 7].map(i => `<span class="pill ${i <= c.harm ? 'c' : ''}" style="${i === 4 ? 'margin-left:8px' : ''}">${i}</span>`).join('')}<span class="mut" style="margin-left:6px">${c.harm >= 8 ? 'mort' : c.harm >= 4 ? 'grave' : c.harm ? 'léger' : 'indemne'}</span></div>
      <label class="mut"><input type="checkbox" id="inst" ${c.instable ? 'checked' : ''} style="width:auto"> Instable (s'aggrave sans soins)</label>
      <div class="row" style="justify-content:space-between;margin-top:10px"><b>Chance</b><div class="trk"><button class="b sm" data-lk="-1">−</button><span class="v">${7 - c.luck} restantes</span><button class="b sm" data-lk="1">Utiliser</button></div></div>
      ${p.luck ? `<p class="mut" style="margin:4px 0">${esc(p.luck)}</p>` : ''}
      <div class="row" style="justify-content:space-between;margin-top:10px"><b>Expérience</b><div class="trk"><button class="b sm" data-xp="-1">−</button><span class="v">${c.xp}/5</span><button class="b sm" data-xp="1">+</button></div></div>
      ${c.xp >= 5 ? '<p class="ok" style="margin:4px 0">Tu prends du galon : choisis une amélioration (onglet Galons).</p>' : ''}
      <p class="mut" style="margin:6px 0 0">Armure ${c.armor}${c.armor ? ' (réduit chaque blessure)' : ''}.</p></div>
    <h2>Manœuvres de base — touche pour lancer</h2><div class="card">${x.basic.map(b => `<div class="sk" data-bm="${b.id}" style="cursor:pointer;grid-template-columns:1fr auto"><div class="nm"><b>${esc(b.n)}</b>${c.advMoves.includes(b.id) ? ' <span class="pill c">avancée</span>' : ''} <span class="mut">+${STN(b.s)}</span></div><b>${sg(s[b.s])}</b></div>`).join('')}</div>
    <h2>Manœuvres de ${esc(p.n || 'livret')}</h2><div class="card">${mine.map(n => { const mi = moveInfo(n), m = mi ? mi.m : [n, '', '']; return `<div class="sk" style="grid-template-columns:1fr auto auto"><div class="nm"><b>${esc(n)}</b>${mi && mi.pb.id !== c.pb ? ' <span class="mut">(' + esc(mi.pb.n) + ')</span>' : ''}<br><small class="mut">${esc(m[1])}</small></div>${m[2] ? `<button class="b sm acc" data-pm="${esc(n)}">${sg(s[m[2]])}</button>` : '<span></span>'}${book(n)}</div>`; }).join('') || '<p class="mut">—</p>'}</div>
    ${p.sections.length ? `<h2>Choix du livret</h2><div class="card">${p.sections.map((q, si) => `<p style="margin:4px 0"><b>${esc(q.t)}</b> : ${esc((c.sec[si] || []).map(i => q.refuge ? X().refuge[i][0] : q.o[i]).join(' · ') || '—')}</p>`).join('')}</div>` : ''}
    <h2>Armes</h2><div class="card">${[...c.weapons, c.wcustom].filter(Boolean).map(w => `<p style="margin:4px 0">• ${esc(w)}</p>`).join('') || '<p class="mut">—</p>'}<p class="mut" style="margin:4px 0">Mains nues : 0 dégât, personnel/allonge.</p></div>`;
    const re = () => { save(); fiche(c, el); };
    $$('[data-st]', el).forEach(z => z.onclick = () => rollTo(c, z.dataset.st, '+' + STN(z.dataset.st), null));
    $$('[data-bm]', el).forEach(z => z.onclick = () => { const b = x.basic.find(q => q.id === z.dataset.bm); rollTo(c, b.s, b.n, b.id); });
    $$('[data-pm]', el).forEach(z => z.onclick = () => { const mi = moveInfo(z.dataset.pm); rollTo(c, mi.m[2], z.dataset.pm, null); });
    $$('[data-hm]', el).forEach(b => b.onclick = () => { c.harm = Math.max(0, Math.min(8, c.harm + (+b.dataset.hm))); if (c.harm >= 4 && +b.dataset.hm > 0) c.instable = true; if (c.harm === 0) c.instable = false; if (c.harm >= 8) toast('8 dégâts : la mort… sauf Chance !'); re(); });
    $('#inst', el).onchange = e => { c.instable = e.target.checked; re(); };
    $$('[data-lk]', el).forEach(b => b.onclick = () => { const d = +b.dataset.lk; if (d > 0 && c.luck >= 7) return toast('Plus de Chance…'); c.luck = Math.max(0, c.luck + d); if (d > 0) toast(c.luck >= 7 ? 'Dernière case de Chance !' : 'Jet → 12 ou blessure → 0'); re(); });
    $$('[data-xp]', el).forEach(b => b.onclick = () => { c.xp = Math.max(0, Math.min(5, c.xp + (+b.dataset.xp))); re(); });
    bindBook(el);
  }
  function notes(c, el) {
    el.innerHTML = `<label class="f">Histoire avec les autres chasseurs</label><textarea id="hi" style="min-height:100px">${esc(c.history)}</textarea>
      <label class="f">Matériel, véhicule, alliés</label><textarea id="ge" style="min-height:100px">${esc(c.gear)}</textarea>
      <label class="f">Notes (mystères, indices, monstres vaincus)</label><textarea id="nt" style="min-height:160px">${esc(c.notes)}</textarea>`;
    $('#hi', el).onchange = e => { c.history = e.target.value; save(); };
    $('#ge', el).onchange = e => { c.gear = e.target.value; save(); };
    $('#nt', el).onchange = e => { c.notes = e.target.value; save(); };
  }

  /* ---------- Dés ---------- */
  function des() {
    const el = $('#v-des'), x = X(), b = DMOVE && x.basic.find(q => q.id === DMOVE), c = DCHAR && getChar(DCHAR);
    let res = '';
    if (DLAST) {
      const tot = DFORCE != null ? DFORCE : DLAST[0] + DLAST[1] + DMOD + DTEMP;
      const adv = b && c && c.advMoves.includes(b.id) && tot >= 12;
      const band = tot >= 10 ? ['10+', 'ok', b && (adv ? b.adv : b.hi)] : tot >= 7 ? ['7-9', 'ok', b && b.mid] : ['6-', 'ko', b ? b.miss : 'Échec : le Gardien fait une manœuvre.'];
      res = `<div class="res">${DLAST.map(v => `<div class="die" style="background:#e8e2d0;color:#1b1200">${v}</div>`).join('')}</div>
        <div class="sum"><span class="big">${tot}</span><span class="mut">${DFORCE != null ? '(Chance : 12)' : `= ${DLAST.join(' + ')} ${sg(DMOD)}${DTEMP ? ' ' + sg(DTEMP) : ''}`}</span></div>
        <div class="verdict ${band[1]}">${band[0] === '10+' ? (adv ? 'Avancé (12+)' : 'Réussite totale') : band[0] === '7-9' ? 'Réussite partielle' : 'Échec'}</div>
        ${band[2] ? `<p style="text-align:center">${esc(band[2])}</p>` : ''}
        ${b && b.q && tot >= 7 ? `<div class="card"><b>Questions (${tot >= 10 ? (b.id === 'evaluer' ? 3 : 2) : 1})</b>${b.q.map(q => `<p style="margin:4px 0">• ${esc(q)}</p>`).join('')}${b.note ? `<p class="mut">${esc(b.note)}</p>` : ''}</div>` : ''}
        ${b && b.effets && tot >= 7 ? `<div class="card"><b>Effets</b>${b.effets.map(q => `<p style="margin:3px 0">• ${esc(q)}</p>`).join('')}${tot < 10 ? `<b>Pépins (au Gardien)</b>${b.pepins.map(q => `<p style="margin:3px 0">• ${esc(q)}</p>`).join('')}` : ''}</div>` : ''}
        ${b && b.note && !b.q ? `<p class="mut" style="text-align:center">${esc(b.note)}</p>` : ''}
        ${c && DFORCE == null ? `<div class="row" style="justify-content:center"><button class="b sm" id="luck">Chance : passer à 12 (${7 - c.luck} restantes)</button></div>` : ''}`;
    }
    el.innerHTML = `<h2>Manœuvre (2d6)</h2>${DLAB ? `<div class="mut" style="margin-bottom:8px">Jet : <b style="color:var(--acc)">${esc(DLAB)}</b></div>` : ''}
      <div class="card"><label class="f">Caractéristique / modificateur</label><div class="row" style="gap:4px;flex-wrap:nowrap"><button class="b sm" data-m="mod">−</button><b style="min-width:30px;text-align:center">${sg(DMOD)}</b><button class="b sm" data-p="mod">+</button></div>
        <label class="f">Bonus temporaire / constant</label><div class="row" style="gap:4px;flex-wrap:nowrap"><button class="b sm" data-m="t">−</button><b style="min-width:30px;text-align:center">${sg(DTEMP)}</b><button class="b sm" data-p="t">+</button></div>
        <label class="f">Manœuvre de base</label><select id="bm"><option value="">— aucune —</option>${x.basic.map(q => `<option value="${q.id}" ${DMOVE === q.id ? 'selected' : ''}>${esc(q.n)} (+${STN(q.s)})</option>`).join('')}</select></div>
      <div class="row"><button class="b grow" id="clr">Réinitialiser</button><button class="b acc grow" id="roll" style="flex:2">Lancer 2d6</button></div>
      <div id="result">${res}</div>
      <div class="card mut" style="margin-top:12px">10+ réussite · 7-9 réussite partielle · 6- échec (1 XP). Sur un jet de chasseur lancé depuis sa fiche, l'XP est cochée automatiquement.</div>`;
    $$('[data-p]', el).forEach(z => z.onclick = () => { if (z.dataset.p === 'mod') DMOD++; else DTEMP++; des(); });
    $$('[data-m]', el).forEach(z => z.onclick = () => { if (z.dataset.m === 'mod') DMOD--; else DTEMP--; des(); });
    $('#bm').onchange = e => { DMOVE = e.target.value || null; const q = x.basic.find(z => z.id === DMOVE); if (q && c) { DSTAT = q.s; DMOD = stats(c)[q.s]; DLAB = c.name + ' · ' + q.n; } des(); };
    $('#clr').onclick = () => { DMOD = 0; DTEMP = 0; DLAB = ''; DMOVE = null; DCHAR = null; DLAST = null; DFORCE = null; des(); };
    $('#roll').onclick = () => { DLAST = [d6(), d6()]; DFORCE = null; if (navigator.vibrate) navigator.vibrate(30);
      if (c && DLAST[0] + DLAST[1] + DMOD + DTEMP <= 6) { c.xp = Math.min(5, c.xp + 1); save(); toast('Échec : +1 XP' + (c.xp >= 5 ? ' — tu prends du galon !' : '')); } des(); };
    const lk = $('#luck'); if (lk) lk.onclick = () => { if (c.luck >= 7) return toast('Plus de Chance…'); c.luck++; save(); DFORCE = 12; des(); };
  }

  /* ---------- Espace Gardien ---------- */
  function mjS() { S.mjMotw = Object.assign({ concept: '', hook: '', cd: ['', '', '', '', '', ''], step: -1, threats: [], notes: '' }, S.mjMotw); return S.mjMotw; }
  function mj() {
    const el = $('#v-mj'), m = mjS(), x = X();
    const tabs = [['mys', 'Mystère'], ['thr', 'Menaces'], ['moves', 'Manœuvres'], ['end', 'Fin de séance'], ['notes', 'Notes']];
    el.innerHTML = `<h2>Espace Gardien</h2><div class="tabs">${tabs.map(([k, n]) => `<button class="b sm ${MJT === k ? 'on' : ''}" data-mt="${k}">${n}</button>`).join('')}</div><div id="mjc"></div>`;
    $$('[data-mt]', el).forEach(b => b.onclick = () => { MJT = b.dataset.mt; mj(); });
    const c = $('#mjc'), re = () => { save(); mj(); };
    if (MJT === 'mys') {
      c.innerHTML = `<div class="card"><label class="f">Concept (monstre + ce qu'il veut)</label><textarea id="mc">${esc(m.concept)}</textarea>
        <label class="f">Accroche (ce qui attire les chasseurs)</label><textarea id="mh">${esc(m.hook)}</textarea></div>
        <h2>Compte à rebours</h2><div class="card"><p class="mut" style="margin-top:0">Ce qui arrive si les chasseurs n'interviennent pas. Touche une étape pour la marquer.</p>
        ${x.countdown.map((n, i) => `<div class="sk" style="grid-template-columns:auto 1fr"><button class="b sm ${i <= m.step ? 'acc' : ''}" data-step="${i}">${esc(n)}</button><input data-cd="${i}" value="${esc(m.cd[i])}" placeholder="…"></div>`).join('')}</div>
        <button class="b bad" id="newM" style="width:100%">Nouveau mystère (tout effacer)</button>`;
      $('#mc').onchange = e => { m.concept = e.target.value; save(); }; $('#mh').onchange = e => { m.hook = e.target.value; save(); };
      $$('[data-cd]', c).forEach(i => i.onchange = () => { m.cd[+i.dataset.cd] = i.value; save(); });
      $$('[data-step]', c).forEach(b => b.onclick = () => { const i = +b.dataset.step; m.step = m.step === i ? i - 1 : i; re(); });
      $('#newM').onclick = () => { if (confirm('Effacer le mystère en cours ?')) { S.mjMotw = null; re(); } };
    }
    if (MJT === 'thr') {
      c.innerHTML = `<div class="card"><div class="row" style="flex-wrap:nowrap"><select id="tc">${Object.keys(x.threats).map(k => `<option>${k}</option>`).join('')}</select><button class="b acc" id="tAdd">+ Menace</button></div></div>` +
        m.threats.map((t, i) => { const T = x.threats[t.cat], ty = T.types.find(z => z[0] === t.type), fight = t.cat === 'Monstre' || t.cat === 'Sbire';
          return `<div class="card"><div class="row"><span class="pill">${t.cat}</span><input value="${esc(t.n)}" data-tn="${i}" class="grow" style="font-weight:700"><button class="b sm bad" data-tdel="${i}">✕</button></div>
            <select data-tt="${i}" style="margin-top:6px">${T.types.map(z => `<option value="${esc(z[0])}" ${t.type === z[0] ? 'selected' : ''}>${esc(z[0])} — ${esc(z[1])}</option>`).join('')}</select>
            <p class="mut" style="margin:4px 0">${esc(T.hint)}</p>
            ${fight ? `<input data-tf="${i}|atk" value="${esc(t.atk || '')}" placeholder="Attaques (ex. griffes : 3 dégâts, allonge)" style="margin-top:4px">
              <div class="row" style="flex-wrap:nowrap;margin-top:4px"><span class="mut">Armure</span><input type="number" data-tf="${i}|arm" value="${t.arm || 0}" style="width:60px"><span class="mut">Capacité</span><input type="number" data-tf="${i}|cap" value="${t.cap || (t.cat === 'Monstre' ? 10 : 6)}" style="width:60px"></div>
              <div class="row" style="justify-content:space-between;margin-top:6px"><b>Dégâts reçus</b><div class="trk"><button class="b sm" data-th="${i}|-1">−</button><span class="v">${t.dmg || 0}/${t.cap || (t.cat === 'Monstre' ? 10 : 6)}</span><button class="b sm" data-th="${i}|1">+</button><button class="b sm" data-th="${i}|3">+3</button></div></div>` : ''}
            ${t.cat === 'Monstre' ? `<input data-tf="${i}|weak" value="${esc(t.weak || '')}" placeholder="Faiblesses" style="margin-top:4px"><input data-tf="${i}|pow" value="${esc(t.pow || '')}" placeholder="Pouvoirs" style="margin-top:4px">` : ''}
            <textarea data-tf="${i}|desc" placeholder="Description, motivation, plans…" style="margin-top:4px">${esc(t.desc || '')}</textarea>
            <details><summary class="mut">Manœuvres de ${t.cat.toLowerCase()}</summary><p class="mut">${T.moves.map(esc).join(' · ')}</p></details></div>`; }).join('');
      $('#tAdd').onclick = () => { const cat = $('#tc').value; m.threats.push({ cat, n: cat === 'Lieu' ? 'Nouveau lieu' : 'Nouvelle menace', type: x.threats[cat].types[0][0], dmg: 0 }); re(); };
      $$('[data-tn]', c).forEach(z => z.onchange = () => { m.threats[+z.dataset.tn].n = z.value; save(); });
      $$('[data-tt]', c).forEach(z => z.onchange = () => { m.threats[+z.dataset.tt].type = z.value; save(); });
      $$('[data-tdel]', c).forEach(b => b.onclick = () => { m.threats.splice(+b.dataset.tdel, 1); re(); });
      $$('[data-tf]', c).forEach(z => z.onchange = () => { const [i, k] = z.dataset.tf.split('|'); m.threats[+i][k] = ['arm', 'cap'].includes(k) ? +z.value : z.value; ['arm', 'cap'].includes(k) ? re() : save(); });
      $$('[data-th]', c).forEach(b => b.onclick = () => { const [i, d] = b.dataset.th.split('|'), t = m.threats[+i]; t.dmg = Math.max(0, (t.dmg || 0) + (+d)); if (t.dmg >= (t.cap || 10)) toast(t.cat === 'Monstre' ? 'Vaincu… s\'il a été frappé par sa faiblesse !' : 'Hors de combat'); re(); });
    }
    if (MJT === 'moves') {
      c.innerHTML = `<div class="card"><b>Manœuvres de base du Gardien</b>${x.keeperMoves.map(k => `<p style="margin:4px 0">• ${esc(k)}</p>`).join('')}</div>
        ${Object.entries(x.threats).map(([k, T]) => `<details class="card"><summary><b>Manœuvres : ${k}</b></summary><p>${T.moves.map(esc).join(' · ')}</p><p class="mut">${T.types.map(z => `<b>${esc(z[0])}</b> (${esc(z[1])})`).join(' · ')}</p></details>`).join('')}
        <details class="card"><summary><b>Faiblesses possibles</b></summary>${x.weaknesses.map(w => `<p style="margin:4px 0">• ${esc(w)}</p>`).join('')}</details>
        <details class="card"><summary><b>Traits d'armes</b></summary>${x.traits.map(w => `<p style="margin:4px 0">• ${esc(w)}</p>`).join('')}</details>
        <details class="card"><summary><b>Types d'alliés</b></summary>${x.allies.map(w => `<p style="margin:4px 0">• ${esc(w)}</p>`).join('')}</details>`;
    }
    if (MJT === 'end') {
      const hs = S.chars.filter(z => z.sys === 'motw' && !z.creation);
      c.innerHTML = `<div class="card">${x.endQuestions.map((q, i) => `<label class="mut" style="display:block;margin:8px 0"><input type="checkbox" data-eq="${i}" style="width:auto"> ${esc(q)}</label>`).join('')}
        <p id="eqR" class="mut"></p><button class="b acc" id="eqGo" style="width:100%">Donner l'XP aux ${hs.length} chasseurs</button></div>
        <div class="card"><b>Équipe</b>${hs.map(z => `<p style="margin:4px 0">${esc(z.name)} <span class="mut">${esc(PB(z.pb) ? PB(z.pb).n : '')} · dégâts ${z.harm}/7 · Chance ${7 - z.luck} · XP ${z.xp}/5</span></p>`).join('') || '<p class="mut">Aucun chasseur terminé.</p>'}</div>`;
      const n = () => $$('[data-eq]', c).filter(i => i.checked).length, xp = () => n() >= 3 ? 2 : n() >= 1 ? 1 : 0;
      $$('[data-eq]', c).forEach(i => i.onchange = () => { $('#eqR').textContent = `${n()} « oui » → ${xp()} XP chacun`; });
      $('#eqGo').onclick = () => { const v = xp(); if (!v) return toast('Aucune réponse « oui »'); hs.forEach(z => z.xp = Math.min(5, z.xp + v)); save(); toast(`+${v} XP pour l'équipe`); mj(); };
    }
    if (MJT === 'notes') {
      c.innerHTML = `<textarea id="mjN" style="min-height:60vh" placeholder="Arcs, mythologie, figurants récurrents…">${esc(m.notes)}</textarea>`;
      $('#mjN').oninput = e => { m.notes = e.target.value; clearTimeout(mj.t); mj.t = setTimeout(save, 400); };
    }
  }

  window.MODS.motw = { persos, des, mj };
})();
