/* Module « Yggdrasill » pour Codex JDR. Utilise les outils communs d'app.js. */
'use strict';
window.MODS = window.MODS || {};
(function () {
  const X = () => window.YGG_DATA;
  const CA = () => X().carac;
  const CN = id => X().carac.find(c => c.id === id);
  const SKB = id => X().skills.find(s => s[0] === id);
  const base = key => key.split(':')[0];
  const skName = key => { const [b, sp] = key.split(':'); const s = SKB(b); return (s ? s[1] : b) + (sp ? ' (' + sp + ')' : ''); };
  const sg = n => (n >= 0 ? '+' : '') + n;
  const sum = o => Object.values(o || {}).reduce((a, b) => a + (+b || 0), 0);
  const d10 = () => 1 + Math.floor(Math.random() * 10);
  const PRW = n => X().prouesses.find(p => p[0] === n);
  const lvlName = v => { let r = ''; X().levels.forEach(([m, n]) => { if (v >= m) r = n; }); return r; };
  let STAB = 'fiche', MJT = 'init';
  /* état du lanceur */
  let DN = 2, DB = 0, DMOD = 0, DSR = 14, DKEEP = 2, DLAB = '', DDMG = null, DCHAR = null, DFLAGS = { destin: false, don: false, faib: false }, DLAST = null;

  function newYgg() {
    return { id: uid(), sys: 'ygg', name: 'Nouveau héros', player: '', creation: true, arch: '', concept: '', clan: '',
      runes: [], car: { pui: 1, vig: 1, agi: 1, int: 1, per: 1, ten: 1, cha: 1, ins: 1, com: 1 }, dons: [], faib: '', fauve: '', affinite: '',
      sk: {}, fav: [], prw: {}, sej: [], gal: {}, run: [], xcar: {}, xsk: {}, xlog: [], pl: 0, renomX: 0,
      dmg: 0, fur: null, epuise: false, transe: false, weapons: [], armor: '', pieces: [], shield: false, gear: '', purse: '', notes: '', desc: '' };
  }

  /* ---------- Calculs ---------- */
  const car = (c, k) => (+c.car[k] || 0) + (+(c.xcar || {})[k] || 0);
  const skv = (c, k) => (+c.sk[k] || 0) + (+(c.xsk || {})[k] || 0);
  const hasDon = (c, d) => (c.dons || []).includes(d);
  function sec(c) {
    const C = k => car(c, k), corps = C('pui') + C('vig') + C('agi'), esprit = C('int') + C('per') + C('ten'), ame = C('cha') + C('ins') + C('com');
    const pv = corps * 3 + esprit * 2 + ame;
    const fur = hasDon(c, 'Guerrier-fauve') ? C('vig') + C('ten') + C('ins') : hasDon(c, 'Initié') ? C('vig') + C('int') + C('ins') : Math.floor((C('vig') + C('ten') + C('ins')) / 2);
    const arm = X().armors.find(a => a[0] === c.armor), pcs = X().pieces.filter(p => (c.pieces || []).includes(p[0]));
    const prot = (arm ? arm[1] : 0) + pcs.reduce((a, p) => a + p[1], 0);
    const enc = (arm ? arm[2] : 0) + pcs.reduce((a, p) => a + p[2], 0) + (c.weapons || []).reduce((a, n) => { const w = X().weapons.find(x => x[0] === n); return a + (w ? w[4] : 0); }, 0);
    const cpe = C('pui') * 2 + C('vig');
    const maxSk = Math.max(0, ...Object.keys(Object.assign({}, c.sk, c.xsk)).map(k => skv(c, k)));
    return { pv, b: Math.floor(pv / 2), m: Math.floor(pv / 4), mort: -Math.floor(pv / 4), rea: C('int') + C('per') + C('ins'), dp: C('agi') + C('vig') + C('ins') + (c.shield ? X().shield.dp : 0),
      dpBase: C('agi') + C('vig') + C('ins'), dm: C('ten') + C('ins') + C('int'), dep: C('agi') + C('vig'), cpe, fur, prot, enc, renom: maxSk + (+c.renomX || 0), actions: C('agi') + 1 };
  }
  function state(c) {
    const s = sec(c), cur = s.pv - (c.dmg || 0), fauve = c.transe && hasDon(c, 'Guerrier-fauve');
    let st = 'Fringant', mal = 0, keep = 0;
    if (cur <= (fauve ? -s.pv : s.mort)) st = 'Mort';
    else if (cur <= 0) st = fauve ? 'Indestructible !' : 'Inconscient';
    else if (cur < s.m) { st = 'Meurtri'; keep = 1; }
    else if (cur < s.b) { st = 'Blessé'; mal = -3; }
    if (fauve) { mal = 0; keep = 0; }
    const furCur = c.fur == null ? s.fur : c.fur;
    if (furCur <= 0 || c.epuise) keep++;
    const gene = s.enc > s.cpe ? (s.enc > 3 * s.cpe ? 'Surchargé' : s.enc > 2 * s.cpe ? 'Encombré (SR +1 cran)' : 'Gêné (−3)') : '';
    if (s.enc > s.cpe && s.enc <= 2 * s.cpe) mal -= 3;
    return { cur, st, mal, keep: 2 - keep, furCur, gene };
  }
  function creaCosts(c) {
    const carUsed = sum(c.car) - 9;
    let skUsed = 0; Object.entries(c.sk).forEach(([k, v]) => skUsed += v * (c.fav.includes(k) ? 1 : 2));
    let pp = 0;
    Object.entries(c.prw || {}).forEach(([n, lv]) => lv.forEach(l => pp += l * 3));
    (c.sej || []).forEach(n => { const s = X().sejdr.find(z => z[2] === n); pp += (s ? s[1] : 1) * 3; });
    Object.values(c.gal || {}).forEach(L => { for (let i = 1; i <= L; i++) pp += i * 3; });
    (c.run || []).forEach(n => { const r = X().runesMag.find(z => z[0] === n); pp += (r ? r[1] : 1) * 3; });
    return { carUsed, skUsed, pp };
  }

  /* ---------- Liste des héros ---------- */
  function persos() {
    const el = $('#v-persos');
    if (CUR && getChar(CUR) && getChar(CUR).sys === 'ygg') return sheet(getChar(CUR));
    CUR = null;
    el.innerHTML = `<h2>Héros de Midgardr</h2>
      <div class="list">${S.chars.filter(c => c.sys === 'ygg').map(c => `<div class="it" data-open="${c.id}"><div class="grow"><b>${esc(c.name)}</b><div class="mut">${esc(c.arch || 'À créer')}${c.runes.length ? ' · ' + c.runes.map(r => X().runes.find(z => z[0] === r.a && z[1] === r.n)[2]).join(', ') : ''}</div></div>${c.creation ? '<span class="pill c">création</span>' : ''}</div>`).join('') || '<p class="mut">Aucun héros pour l\'instant.</p>'}</div>
      <div class="row"><button class="b acc grow" id="newC">+ Créer un héros</button><button class="b" id="impC">Importer</button></div><input type="file" id="impF" accept=".json" hidden>`;
    $('#newC').onclick = () => { const c = newYgg(); S.chars.push(c); save(); CUR = c.id; STAB = 'creation'; render(); window.scrollTo(0, 0); };
    $$('[data-open]', el).forEach(d => d.onclick = () => { CUR = d.dataset.open; STAB = getChar(CUR).creation ? 'creation' : 'fiche'; render(); });
    $('#impC').onclick = () => $('#impF').click();
    $('#impF').onchange = async e => { try { const c = JSON.parse(await e.target.files[0].text()); c.id = uid(); c.sys = 'ygg'; S.chars.push(c); save(); render(); } catch (err) { toast('Fichier invalide'); } };
  }
  function sheet(c) {
    const el = $('#v-persos');
    const tabs = [['creation', c.creation ? 'Création' : 'Progression'], ['fiche', 'Fiche'], ['magie', 'Prouesses & magie'], ['equip', 'Équipement'], ['notes', 'Notes']];
    el.innerHTML = `<div class="row" style="margin-bottom:10px"><button class="b sm" id="back">← Héros</button><div class="grow"></div><button class="b sm" id="exp">Exporter</button><button class="b sm bad" id="del">Suppr.</button></div>
      <input id="cname" value="${esc(c.name)}" style="font-size:20px;font-weight:800;margin-bottom:10px">
      <div class="tabs">${tabs.map(([k, n]) => `<button class="b sm ${STAB === k ? 'on' : ''}" data-t="${k}">${n}</button>`).join('')}</div><div id="sheet"></div>`;
    $('#back').onclick = () => { CUR = null; render(); };
    $('#cname').onchange = e => { c.name = e.target.value; save(); };
    $('#del').onclick = () => { if (confirm('Supprimer ' + c.name + ' ?')) { S.chars = S.chars.filter(x => x !== c); CUR = null; save(); render(); } };
    $('#exp').onclick = () => download(c.name.replace(/\W+/g, '_') + '.json', JSON.stringify(c, null, 1));
    $$('[data-t]', el).forEach(b => b.onclick = () => { STAB = b.dataset.t; sheet(c); window.scrollTo(0, 0); });
    ({ creation: c.creation ? creation : progression, fiche, magie, equip, notes })[STAB](c, $('#sheet'));
  }
  const counter = (used, max, label) => `<div class="mut" style="margin:6px 0">${label} : <b class="${used > max ? 'ko' : used === max ? 'ok' : ''}">${used} / ${max}</b></div>`;
  const opts = (list, cur, empty = '—') => `<option value="">${empty}</option>` + list.map(x => { const [v, n] = Array.isArray(x) ? x : [x, x]; return `<option value="${esc(v)}" ${String(cur) === String(v) ? 'selected' : ''}>${esc(n)}</option>`; }).join('');
  const pm = (key, val) => `<div class="row" style="gap:4px;flex-wrap:nowrap"><button class="b sm" data-m="${key}">−</button><b style="min-width:26px;text-align:center">${val}</b><button class="b sm" data-p="${key}">+</button></div>`;
  const runeName = r => { const z = X().runes.find(q => q[0] === r.a && q[1] === r.n); return z ? z[2] : '?'; };

  /* ---------- Création ---------- */
  function creation(c, el) {
    const x = X(), cc = creaCosts(c), A = x.archetypes.find(a => a.n === c.arch);
    const initie = hasDon(c, 'Initié');
    const skKeys = [...new Set([...x.skills.filter(s => !s[4]).map(s => s[0]), ...Object.keys(c.sk), ...c.fav.filter(k => !k.startsWith('+'))])]
      .filter(k => SKB(base(k)) && (SKB(base(k))[2] !== 's' || initie || c.sk[k]));
    const groups = [['g', 'Compétences générales'], ['m', 'Compétences martiales'], ['s', 'Compétences magiques (don Initié)']];
    el.innerHTML = `
    <h2>1 · Concept</h2>
    <div class="card"><label class="f">Archétype</label><select id="arch">${opts(x.archetypes.map(a => [a.n, a.g + ' — ' + a.n]), c.arch, 'Libre / aucun')}</select>
      ${A ? `<p class="mut">Compétences privilégiées suggérées : ${A.fav.map(k => k.startsWith('+') ? 'une compétence ' + k.slice(1) + ' au choix' : skName(k)).join(', ')}.${A.don ? ' Don obligatoire : <b>' + A.don + '</b>.' : ''}${A.note ? ' ' + A.note : ''}</p>` : ''}
      <label class="f">Concept, clan, royaume</label><input id="concept" value="${esc(c.concept)}" placeholder="Hirdmen querelleur du clan…">
      <label class="f">Joueur</label><input id="pl" value="${esc(c.player)}"></div>

    <h2>2 · Destin</h2>
    <div class="card"><p class="mut" style="margin-top:0">Lance 1D8 pour chaque aett. Interprète au moins deux runes en positif et une en négatif (ou l'inverse), avec le MJ.</p>
      <button class="b sm" id="rollR">🎲 Tirer les 3 runes</button>
      ${(c.runes || []).map((r, i) => { const z = x.runes.find(q => q[0] === r.a && q[1] === r.n);
        return `<div class="card" style="margin:8px 0;padding:10px"><b>${esc(x.aetts[r.a])} · ${r.n} — ${esc(z[2])}</b>
          <div class="row" style="margin-top:6px">${z[3] === 'pn' ? `<label class="mut"><input type="radio" name="rs${i}" value="+" ${r.s === '+' ? 'checked' : ''} style="width:auto"> Positif</label><label class="mut"><input type="radio" name="rs${i}" value="-" ${r.s === '-' ? 'checked' : ''} style="width:auto"> Négatif</label>` : `<span class="pill">${z[3] === 'p' ? 'Exclusivement positive' : 'Exclusivement négative'}</span>`}</div>
          <p class="mut" style="margin:6px 0">${esc((r.s === '-' ? z[5] : z[4]) || z[4] || z[5])}</p><input data-rnote="${i}" value="${esc(r.note || '')}" placeholder="Interprétation pour ce héros…"></div>`; }).join('')}
    </div>

    <h2>3 · Caractéristiques</h2>
    <div class="card">${counter(sum(c.car), 19, 'Points (min 1, max 4 à la création)')}
      ${['Corps', 'Esprit', 'Âme'].map(g => `<label class="f">${g}</label>` + CA().filter(a => a.g === g).map(a => `<div class="sk" style="grid-template-columns:1fr auto"><div class="nm">${a.name}</div>${pm('car|' + a.id, c.car[a.id])}</div>`).join('')).join('')}</div>

    <h2>4 · Dons et faiblesse</h2>
    <div class="card"><p class="mut" style="margin-top:0">1 don ; un 2e don possible en échange d'une faiblesse.</p>
      <select id="don0">${opts(x.dons.map(d => [d[0], d[0] + ' — ' + d[1]]), c.dons[0], 'Don…')}</select>
      <select id="don1" style="margin-top:6px">${opts(x.dons.map(d => [d[0], d[0] + ' — ' + d[1]]), c.dons[1], '2e don (optionnel)…')}</select>
      ${c.dons[1] ? `<select id="faib" style="margin-top:6px">${opts(x.faiblesses.map(d => [d[0], d[0] + ' — ' + d[1]]), c.faib, 'Faiblesse (obligatoire)…')}</select>` : ''}
      ${hasDon(c, 'Guerrier-fauve') ? `<label class="f">Type de guerrier-fauve</label><select id="fauve">${opts(x.fauves, c.fauve)}</select>` : ''}
      ${hasDon(c, 'Affinité') ? `<label class="f">Affinité magique</label><select id="aff">${opts(['Galdr', 'Sejdr', 'Runes'], c.affinite)}</select>` : ''}</div>

    <h2>5 · Compétences</h2>
    <div class="card">${counter(cc.skUsed, 35, 'Points (privilégiée 1/niveau, autre 2/niveau, max 7)')}
      ${counter(c.fav.length, 5, 'Compétences privilégiées ★ (touche l\'étoile)')}
      ${groups.map(([t, n]) => { const ks = skKeys.filter(k => SKB(base(k))[2] === t); if (!ks.length) return ''; return `<label class="f">${n}</label>` + ks.map(k => `<div class="sk" style="grid-template-columns:auto 1fr auto"><button class="b sm ${c.fav.includes(k) ? 'acc' : ''}" data-fav="${esc(k)}">★</button><div class="nm">${esc(skName(k))}${SKB(base(k))[3] ? ' *' : ''}</div>${pm('sk|' + k, c.sk[k] || 0)}</div>`).join(''); }).join('')}
      <label class="f">Ajouter une spécialisation</label>
      <div class="row" style="flex-wrap:nowrap"><select id="spB" style="width:40%">${x.skills.filter(s => s[4]).map(s => `<option value="${s[0]}">${s[1]}</option>`).join('')}</select><input id="spT" placeholder="ex. Géographie, Forge, Chant…" class="grow"><button class="b sm" id="spAdd">+</button></div>
      <p class="mut">* compétence impossible à tester sans au moins 1 niveau.</p></div>

    <h2>6 · Prouesses et magie (12 points)</h2>
    <div class="card">${counter(cc.pp, 12, 'Points dépensés (niveau × 3)')}
      <p class="mut" style="margin-top:0">Choisis-les dans l'onglet <b>Prouesses &amp; magie</b> : les achats y sont comptés tant que le héros est en création.</p></div>

    <h2>7 · Résumé</h2>
    <div class="card">${(() => { const s = sec(c); return `<p>PV ${s.pv} (${s.b} / ${s.m} / 0 / ${s.mort}) · Réaction ${s.rea} · DP ${s.dpBase} · DM ${s.dm} · Déplacement ${s.dep} · Encombrement ${s.cpe} · Furor ${s.fur} · Renommée ${s.renom}</p>`; })()}
      <button class="b acc" id="finish" style="width:100%">Terminer la création</button><div id="warn" class="mut" style="margin-top:8px"></div></div>`;

    const re = () => { save(); creation(c, el); };
    const on = (sel, fn, ev = 'onchange') => { const z = $(sel, el); if (z) z[ev] = fn; };
    on('#arch', e => { c.arch = e.target.value; const a = x.archetypes.find(z => z.n === c.arch); if (a) { c.fav = a.fav.filter(k => !k.startsWith('+')); if (a.don && !c.dons.includes(a.don)) c.dons[0] = a.don; } re(); });
    on('#concept', e => { c.concept = e.target.value; save(); });
    on('#pl', e => { c.player = e.target.value; save(); });
    on('#rollR', () => { c.runes = [0, 1, 2].map(a => { const n = 1 + Math.floor(Math.random() * 8), z = x.runes.find(q => q[0] === a && q[1] === n); return { a, n, s: z[3] === 'n' ? '-' : '+', note: '' }; }); re(); }, 'onclick');
    c.runes.forEach((r, i) => $$(`[name=rs${i}]`, el).forEach(z => z.onchange = () => { r.s = z.value; re(); }));
    $$('[data-rnote]', el).forEach(z => z.onchange = () => { c.runes[+z.dataset.rnote].note = z.value; save(); });
    on('#don0', e => { c.dons[0] = e.target.value; c.dons = c.dons.filter((d, i) => d || i === 0); re(); });
    on('#don1', e => { c.dons[1] = e.target.value; if (!c.dons[1]) { c.dons.length = 1; c.faib = ''; } re(); });
    on('#faib', e => { c.faib = e.target.value; re(); });
    on('#fauve', e => { c.fauve = e.target.value; re(); });
    on('#aff', e => { c.affinite = e.target.value; re(); });
    $$('[data-fav]', el).forEach(b => b.onclick = () => { const k = b.dataset.fav; if (c.fav.includes(k)) c.fav = c.fav.filter(z => z !== k); else { if (c.fav.length >= 5) return toast('5 compétences privilégiées maximum'); c.fav.push(k); } re(); });
    on('#spAdd', () => { const t = $('#spT').value.trim(); if (!t) return toast('Précise la spécialisation'); const k = $('#spB').value + ':' + t; if (!(k in c.sk)) c.sk[k] = 0; re(); }, 'onclick');
    const bump = (key, d) => {
      const i = key.indexOf('|'), t = key.slice(0, i), k = key.slice(i + 1);
      if (t === 'car') { const v = c.car[k] + d; if (v < 1 || v > 4) return toast('Entre 1 et 4 à la création'); if (d > 0 && sum(c.car) >= 19) return toast('19 points maximum'); c.car[k] = v; }
      if (t === 'sk') { const v = (c.sk[k] || 0) + d; if (v < 0) { if (k.includes(':')) delete c.sk[k]; return re(); } if (v > 7) return toast('Maximum 7 à la création'); c.sk[k] = v; if (!v && !k.includes(':')) delete c.sk[k]; }
      re();
    };
    $$('[data-p]', el).forEach(b => b.onclick = () => bump(b.dataset.p, 1));
    $$('[data-m]', el).forEach(b => b.onclick = () => bump(b.dataset.m, -1));
    on('#finish', () => {
      const w = [], cc2 = creaCosts(c);
      if (sum(c.car) !== 19) w.push(`Caractéristiques : ${sum(c.car)}/19.`);
      if (c.runes.length !== 3) w.push('Tire les 3 runes du Destin.');
      if (!c.dons[0]) w.push('Choisis un don.');
      if (c.dons[1] && !c.faib) w.push('Un 2e don demande une faiblesse.');
      if (A && A.don && !hasDon(c, A.don)) w.push(`L'archétype ${A.n} demande le don ${A.don}.`);
      if (cc2.skUsed !== 35) w.push(`Compétences : ${cc2.skUsed}/35.`);
      if (c.fav.length !== 5) w.push(`Compétences privilégiées : ${c.fav.length}/5.`);
      if (!initie && Object.keys(c.sk).some(k => SKB(base(k))[2] === 's' && c.sk[k])) w.push('Les compétences magiques demandent le don Initié.');
      if (cc2.pp > 12) w.push(`Prouesses et magie : ${cc2.pp}/12.`);
      if (w.length && !confirm('À vérifier :\n• ' + w.join('\n• ') + '\n\nTerminer quand même ?')) { $('#warn').innerHTML = w.map(esc).join('<br>'); return; }
      c.creation = false; c.fur = sec(c).fur; save(); STAB = 'fiche'; sheet(c); window.scrollTo(0, 0);
    }, 'onclick');
  }

  /* ---------- Progression (Points de Légende) ---------- */
  function progression(c, el) {
    const x = X(), spent = (c.xlog || []).reduce((a, l) => a + l.cost, 0), dispo = (+c.pl || 0) - spent;
    const allSk = [...new Set([...x.skills.filter(s => !s[4]).map(s => s[0]), ...Object.keys(c.sk), ...Object.keys(c.xsk || {})])];
    el.innerHTML = `<div class="card"><label class="f">Points de Légende gagnés (total)</label>
      <div class="row" style="flex-wrap:nowrap"><input type="number" id="pl" value="${+c.pl || 0}"><button class="b sm" data-pl="2">+2</button><button class="b sm" data-pl="5">+5</button><button class="b sm" data-pl="10">+10</button></div>
      <p>Disponibles : <b class="${dispo < 0 ? 'ko' : 'ok'}">${dispo}</b> PL</p></div>
    <h2>Caractéristiques (5 × nouvelle valeur)</h2><div class="card">${CA().map(a => { const v = car(c, a.id); return `<div class="sk" style="grid-template-columns:1fr auto auto"><div class="nm">${a.name} <b>${v}</b></div><span class="mut">${v < 5 ? (v + 1) * 5 + ' PL' : 'max'}</span><button class="b sm" data-uc="${a.id}" ${v >= 5 ? 'disabled' : ''}>+1</button></div>`; }).join('')}</div>
    <h2>Compétences (2 × nouveau niveau ; nouvelle : 5 PL)</h2><div class="card">
      <select id="usk">${allSk.map(k => `<option value="${esc(k)}">${esc(skName(k))} (${skv(c, k)})</option>`).join('')}</select>
      <button class="b acc" id="uskB" style="width:100%;margin-top:6px">Augmenter la compétence choisie</button>
      <div class="row" style="flex-wrap:nowrap;margin-top:8px"><select id="spB" style="width:40%">${x.skills.filter(s => s[4]).map(s => `<option value="${s[0]}">${s[1]}</option>`).join('')}</select><input id="spT" placeholder="nouvelle spécialisation" class="grow"><button class="b sm" id="spAdd">+</button></div></div>
    <h2>Prouesses et sorts (5 × niveau)</h2><div class="card"><p class="mut" style="margin:0">Achète-les dans l'onglet <b>Prouesses &amp; magie</b> : le coût est déduit ici automatiquement.</p></div>
    <h2>Renommée</h2><div class="card"><div class="row" style="justify-content:space-between"><span>Bonus de Renommée (exploits)</span>${pm('renom', c.renomX || 0)}</div></div>
    <h2>Historique</h2><div class="card">${(c.xlog || []).map((l, i) => `<div class="row" style="justify-content:space-between;padding:4px 0;border-bottom:1px solid var(--line)"><span>${esc(l.lab)}</span><span class="mut">${l.cost} PL <button class="b sm bad" data-xd="${i}">✕</button></span></div>`).join('') || '<p class="mut">Aucune dépense.</p>'}</div>
    <div class="card"><button class="b" id="reopen" style="width:100%">Revenir en mode création</button></div>`;
    const re = () => { save(); progression(c, el); };
    const spend = (lab, cost, apply, undo) => { if (cost > dispo && !confirm(`Il manque ${cost - dispo} PL. Ajouter quand même ?`)) return; apply(); c.xlog.push({ lab, cost, undo }); re(); };
    $('#pl').onchange = e => { c.pl = +e.target.value; re(); };
    $$('[data-pl]', el).forEach(b => b.onclick = () => { c.pl = (+c.pl || 0) + (+b.dataset.pl); re(); });
    $$('[data-uc]', el).forEach(b => b.onclick = () => { const k = b.dataset.uc, v = car(c, k) + 1; spend(`${CN(k).name} → ${v}`, v * 5, () => { c.xcar[k] = (c.xcar[k] || 0) + 1; }, ['xcar', k]); });
    $('#uskB').onclick = () => { const k = $('#usk').value, v = skv(c, k) + 1; spend(`${skName(k)} → ${v}`, v === 1 ? 5 : v * 2, () => { c.xsk[k] = (c.xsk[k] || 0) + 1; }, ['xsk', k]); };
    $('#spAdd').onclick = () => { const t = $('#spT').value.trim(); if (!t) return; const k = $('#spB').value + ':' + t; c.xsk[k] = c.xsk[k] || 0; re(); };
    $$('[data-p]', el).forEach(b => b.onclick = () => { c.renomX = (c.renomX || 0) + 1; re(); });
    $$('[data-m]', el).forEach(b => b.onclick = () => { c.renomX = Math.max(0, (c.renomX || 0) - 1); re(); });
    $$('[data-xd]', el).forEach(b => b.onclick = () => { const l = c.xlog[+b.dataset.xd]; const u = l.undo;
      if (u) { if (u[0] === 'xcar' || u[0] === 'xsk') c[u[0]][u[1]] = Math.max(0, (c[u[0]][u[1]] || 0) - 1); if (u[0] === 'prw') { c.prw[u[1]] = (c.prw[u[1]] || []).filter(v => v !== u[2]); if (!c.prw[u[1]].length) delete c.prw[u[1]]; }
        if (u[0] === 'sej') c.sej = c.sej.filter(n => n !== u[1]); if (u[0] === 'run') c.run = c.run.filter(n => n !== u[1]); if (u[0] === 'gal') c.gal[u[1]] = (c.gal[u[1]] || 1) - 1; }
      c.xlog.splice(+b.dataset.xd, 1); re(); });
    $('#reopen').onclick = () => { c.creation = true; save(); sheet(c); };
  }

  /* ---------- Fiche ---------- */
  function rollTo(c, n, bonus, lab, opt = {}) {
    const st = state(c);
    DN = n; DB = bonus; DMOD = (opt.mod || 0) + st.mal; DKEEP = st.keep; DLAB = `${c.name} · ${lab}` + (st.mal ? ` (malus ${st.mal})` : '') + (st.keep < 2 ? ` (${st.keep} dé gardé)` : '');
    DSR = opt.sr || 14; DDMG = opt.dmg || null; DCHAR = c.id; DFLAGS = { destin: false, don: false, faib: false }; DLAST = null; go('des');
  }
  function chooseCar(c, k) {
    const def = SKB(base(k))[5], v = skv(c, k);
    modal(`<div class="row"><h2 class="grow" style="margin:0">${esc(skName(k))} ${sg(v)}</h2><button class="b sm" onclick="closeModal()">✕</button></div>
      <p class="mut">Quelle caractéristique ? (le MJ décide selon l'approche)</p>
      <div class="chars">${CA().map(a => `<button class="ch b ${a.id === def ? 'acc' : ''}" data-cc="${a.id}" style="display:block"><div class="n">${a.name}</div><div class="v">${car(c, a.id)}</div></button>`).join('')}</div>`);
    $$('[data-cc]').forEach(b => b.onclick = () => { closeModal(); rollTo(c, car(c, b.dataset.cc), v, `${CN(b.dataset.cc).abbr} + ${skName(k)}`); });
  }
  function fiche(c, el) {
    const x = X(), s = sec(c), st = state(c);
    const allSk = [...new Set([...x.skills.filter(z => !z[4]).map(z => z[0]), ...Object.keys(c.sk), ...Object.keys(c.xsk || {})])].filter(k => SKB(base(k)));
    const shown = allSk.filter(k => skv(c, k) || !SKB(base(k))[3]).sort((a, b) => skv(c, b) - skv(c, a) || skName(a).localeCompare(skName(b)));
    el.innerHTML = `<p class="mut" style="margin-top:0">${esc([c.arch, c.concept].filter(Boolean).join(' · '))}</p>
    ${['Corps', 'Esprit', 'Âme'].map(g => `<div class="chars" style="margin-bottom:6px">${CA().filter(a => a.g === g).map(a => `<div class="ch" data-pure="${a.id}" style="cursor:pointer"><div class="n">${a.name}</div><div class="v">${car(c, a.id)}</div></div>`).join('')}</div>`).join('')}
    <p class="mut" style="margin:0 0 8px">Touche une caractéristique pour un test pur (dés + valeur).</p>
    <div class="stats"><div class="stat"><div class="v">${s.rea}</div><div class="n">Réaction</div></div><div class="stat"><div class="v">${c.transe ? 0 : s.dp}</div><div class="n">Déf. physique</div></div><div class="stat"><div class="v">${s.dm}</div><div class="n">Déf. mentale</div></div><div class="stat"><div class="v">${s.prot}</div><div class="n">Protection</div></div></div>
    <div class="stats" style="margin-top:8px"><div class="stat"><div class="v">${s.dep}</div><div class="n">Déplacement</div></div><div class="stat"><div class="v">${s.enc}/${s.cpe}</div><div class="n">Encombr.</div></div><div class="stat"><div class="v">${s.actions}</div><div class="n">Actions</div></div><div class="stat"><div class="v">${s.renom}</div><div class="n">Renommée</div></div></div>
    <h2>État</h2><div class="card">
      <div class="row" style="justify-content:space-between"><b>Points de vie</b><div class="trk"><button class="b sm" data-dm="-1">−</button><span class="v">${st.cur}/${s.pv}</span><button class="b sm" data-dm="1">+1</button><button class="b sm" data-dm="5">+5</button><button class="b sm" data-dm="10">+10</button></div></div>
      <p style="margin:6px 0">État : <b class="${st.st === 'Fringant' ? 'ok' : 'ko'}">${st.st}</b> <span class="mut">· seuils ${s.b} / ${s.m} / 0 / ${s.mort}${st.gene ? ' · ' + st.gene : ''}</span></p>
      <div class="row" style="justify-content:space-between;margin-top:8px"><b>Furor</b><div class="trk"><button class="b sm" data-fu="-1">−</button><span class="v">${st.furCur}/${s.fur}</span><button class="b sm" data-fu="1">+</button><button class="b sm" id="furFull">Nuit</button></div></div>
      ${st.furCur <= 0 ? '<p class="ko" style="margin:4px 0">Épuisé : un dé gardé de moins.</p>' : ''}
      ${hasDon(c, 'Guerrier-fauve') ? `<label class="mut" style="display:block;margin-top:8px"><input type="checkbox" id="transe" ${c.transe ? 'checked' : ''} style="width:auto"> En transe de combat (${esc(c.fauve || 'guerrier-fauve')})</label>` : ''}
      <p class="mut" style="margin:6px 0 0">Les malus d'état sont appliqués quand tu lances depuis la fiche.</p></div>
    <h2>Destin</h2><div class="card">${c.runes.map(r => `<p style="margin:4px 0"><b>${esc(runeName(r))}</b> (${r.s === '-' ? 'négatif' : 'positif'}) <span class="mut">${esc(r.note || '')}</span></p>`).join('') || '<p class="mut">Aucune rune tirée.</p>'}
      <p class="mut" style="margin:4px 0 0">Si une rune prend sens : coche « Destin » dans le lanceur (3 dés gardés).</p></div>
    <h2>Compétences — touche pour lancer</h2><div class="card">
      ${shown.map(k => { const v = skv(c, k); return `<div class="sk" data-sk="${esc(k)}" style="cursor:pointer;grid-template-columns:1fr auto auto"><div class="nm">${c.fav.includes(k) ? '★ ' : ''}${esc(skName(k))}${SKB(base(k))[3] ? ' *' : ''}</div><span class="mut" style="font-size:12px">${esc(lvlName(v))}</span><b style="min-width:30px;text-align:right">${sg(v)}</b></div>`; }).join('')}</div>
    ${c.weapons.length ? `<h2>Armes</h2><div class="card">${c.weapons.map((n, i) => { const w = x.weapons.find(z => z[0] === n) || [n, 'lutte', 0]; const v = skv(c, w[1]), ranged = ['atir', 'lancer'].includes(w[1]), two = c.twoHands && c.twoHands[i];
      const modes = ranged ? [['agi', 'Posé', 0], [w[1] === 'atir' ? 'ins' : 'pui', 'Arrêt', w[1] === 'atir' ? car(c, 'ins') : car(c, 'pui')], ['per', 'Précis', 0]] : [['agi', 'Classique', 0], ['pui', 'En force', car(c, 'pui')], ['per', 'Précise', 0]];
      return `<div style="padding:6px 0;border-bottom:1px solid var(--line)"><b>${esc(n)}</b> <span class="mut">${esc(skName(w[1]))} ${sg(v)} · dégâts ${w[2]}${two ? ' +3 (2 mains)' : ''}${w[5] ? ' · portée ' + esc(w[5]) : ''}</span>
        <div class="row" style="margin-top:4px">${modes.map(m => `<button class="b sm" data-atk="${i}|${m[0]}|${m[2]}|${m[1]}">${m[1]} (${CN(m[0]).abbr})</button>`).join('')}${!ranged && w[1] === 'alongues' ? `<label class="mut"><input type="checkbox" data-2h="${i}" ${two ? 'checked' : ''} style="width:auto"> 2 mains</label>` : ''}</div></div>`; }).join('')}
      <div class="row" style="margin-top:8px"><button class="b sm" id="parry">Parade (AGI)</button><button class="b sm" id="dodge">Esquive (AGI)</button><button class="b sm" id="ini">Initiative</button></div>
      <p class="mut">Dévastatrice / visée : malus −PUI / −PER, effet ×3 (voir aide-mémoire).</p></div>` : ''}
    <h2>Dons et faiblesse</h2><div class="card">${c.dons.filter(Boolean).map(d => { const z = x.dons.find(q => q[0] === d); return `<p style="margin:4px 0"><b>${esc(d)}</b>${d === 'Guerrier-fauve' && c.fauve ? ' (' + esc(c.fauve) + ')' : ''}${d === 'Affinité' && c.affinite ? ' (' + esc(c.affinite) + ')' : ''} <span class="mut">${esc(z ? z[1] : '')}</span></p>`; }).join('')}
      ${c.faib ? `<p style="margin:4px 0" class="ko"><b>${esc(c.faib)}</b> <span class="mut">${esc((x.faiblesses.find(q => q[0] === c.faib) || [, ''])[1])}</span></p>` : ''}
      <p class="mut" style="margin:4px 0 0">Don : +1 dé (1 fois par séance). Faiblesse : garder le meilleur et le pire dé.</p></div>`;
    const re = () => { save(); fiche(c, el); };
    $$('[data-pure]', el).forEach(z => z.onclick = () => { const k = z.dataset.pure; rollTo(c, car(c, k), car(c, k), CN(k).name + ' (test pur)'); });
    $$('[data-sk]', el).forEach(z => z.onclick = () => chooseCar(c, z.dataset.sk));
    $$('[data-dm]', el).forEach(b => b.onclick = () => { c.dmg = Math.max(0, (c.dmg || 0) + (+b.dataset.dm)); if (+b.dataset.dm >= s.b) toast('Blessure grave ? Test de Vigueur SR = dégâts'); re(); });
    $$('[data-fu]', el).forEach(b => b.onclick = () => { c.fur = Math.max(0, Math.min(s.fur + 20, st.furCur + (+b.dataset.fu))); re(); });
    $('#furFull', el).onclick = () => { c.fur = s.fur; toast('Réserve de furor reconstituée'); re(); };
    const tr = $('#transe', el); if (tr) tr.onchange = () => { c.transe = tr.checked; re(); };
    $$('[data-atk]', el).forEach(b => b.onclick = () => { const [i, k, bonusDmg, mode] = b.dataset.atk.split('|'); const n = c.weapons[+i], w = x.weapons.find(z => z[0] === n) || [n, 'lutte', 0];
      const two = c.twoHands && c.twoHands[+i]; rollTo(c, car(c, k), skv(c, w[1]), `${n} · ${mode}`, { dmg: w[2] + (+bonusDmg) + (two ? 3 : 0) }); });
    $$('[data-2h]', el).forEach(z => z.onchange = () => { c.twoHands = c.twoHands || {}; c.twoHands[z.dataset['2h']] = z.checked; re(); });
    const wsk = () => { const ws = c.weapons.map(n => (x.weapons.find(z => z[0] === n) || [, 'lutte'])[1]); return ws.reduce((a, k) => skv(c, k) > skv(c, a) ? k : a, ws[0] || 'lutte'); };
    const p = $('#parry', el); if (p) p.onclick = () => rollTo(c, car(c, 'agi'), skv(c, wsk()), 'Parade (' + skName(wsk()) + ')', { sr: 14 });
    const d = $('#dodge', el); if (d) d.onclick = () => rollTo(c, car(c, 'agi'), skv(c, 'esquive'), 'Esquive', { sr: 14 });
    const ini = $('#ini', el); if (ini) ini.onclick = () => { const r = d10() + s.rea - (c.twoHands && Object.values(c.twoHands).some(Boolean) ? 2 : 0); toast(`Initiative : ${r}`); };
  }

  /* ---------- Prouesses et magie ---------- */
  function magie(c, el) {
    const x = X(), cc = creaCosts(c), initie = hasDon(c, 'Initié');
    const ownL = n => (c.prw[n] || []);
    const buy = (lab, lvl, apply, undo) => { if (!c.creation) { c.xlog = c.xlog || []; c.xlog.push({ lab, cost: lvl * 5, undo }); } apply(); save(); magie(c, el); };
    el.innerHTML = `${c.creation ? counter(cc.pp, 12, 'Points de création (niveau × 3)') : '<p class="mut">Hors création, chaque achat coûte 5 × niveau en Points de Légende (déduit dans Progression).</p>'}
    <h2>Prouesses martiales</h2><div class="card">
      ${Object.keys(c.prw).map(n => { const p = PRW(n); return p ? `<div class="sk" style="grid-template-columns:1fr auto"><div class="nm"><b>${esc(n)}</b> <span class="pill">${{ A: 'Attaque', D: 'Défense', U: 'Utilitaire' }[p[1]]} niv. ${ownL(n).join(', ')}</span><br><small>${esc(p[4])} · malus ${ownL(n).map(l => -3 * l).join(' / ')}</small></div><button class="b sm bad" data-prd="${esc(n)}">✕</button></div>` : ''; }).join('') || '<p class="mut">Aucune prouesse.</p>'}
      <select id="prAdd" style="margin-top:6px"><option value="">+ apprendre une prouesse…</option>${x.prouesses.map(p => { const lv = Array.isArray(p[2]) ? Array.from({ length: p[2][1] - p[2][0] + 1 }, (_, i) => p[2][0] + i) : [p[2]];
        return lv.filter(l => !ownL(p[0]).includes(l)).map(l => `<option value="${esc(p[0])}|${l}">${esc(p[0])} (niv. ${l} · ${p[3]})</option>`).join(''); }).join('')}</select>
      <p class="mut">Une prouesse de chaque type (attaque, défense, utilitaire) par tour de combat. Malus = −3 × niveau.</p></div>
    <h2>Magie</h2>${!initie ? '<div class="card"><p class="mut" style="margin:0">La magie demande le don <b>Initié</b>.</p></div>' : `
    <div class="card"><h3 style="margin-top:0">Sejdr <span class="mut">INS ${car(c, 'ins')} + Sejdr ${skv(c, 'sejdr')}</span></h3>
      ${(c.sej || []).map(n => { const z = x.sejdr.find(q => q[2] === n); return `<div class="sk" style="grid-template-columns:1fr auto auto"><div class="nm"><b>${esc(n)}</b> <span class="mut">niv. ${z[1]} · ${esc(z[3])}</span><br><small>${esc(z[4])}</small></div><button class="b sm acc" data-sjr="${esc(n)}">Lancer</button><button class="b sm bad" data-sjd="${esc(n)}">✕</button></div>`; }).join('') || '<p class="mut">Aucun sort.</p>'}
      <select id="sjAdd" style="margin-top:6px"><option value="">+ apprendre un sort de Sejdr…</option>${['Divination', 'Transmission de forces', 'Guérison', 'Maîtrise des éléments', 'Malédictions'].map(g => `<optgroup label="${g}">${x.sejdr.filter(z => z[0] === g && !(c.sej || []).includes(z[2])).map(z => `<option value="${esc(z[2])}">${esc(z[2])} (niv. ${z[1]})</option>`).join('')}</optgroup>`).join('')}</select>
      <label class="mut" style="display:block;margin-top:6px"><input type="checkbox" id="sjNeg" style="width:auto"> Effet négatif sur une cible (SR 14 + DM)</label> <input type="number" id="sjDM" placeholder="DM de la cible" style="margin-top:4px"></div>
    <div class="card"><h3 style="margin-top:0">Galdr <span class="mut">CHA ${car(c, 'cha')} + Galdr ${skv(c, 'galdr')}</span></h3>
      ${Object.entries(x.galdr).map(([v, doms]) => { const L = c.gal[v] || 0; return `<div class="sk" style="grid-template-columns:1fr auto"><div class="nm"><b>${v}</b><br><small>${L ? doms.slice(0, L).join(', ') : 'aucun domaine'}</small></div><div class="row" style="gap:4px;flex-wrap:nowrap">${L ? `<button class="b sm" data-gd="${v}">−</button>` : ''}${L < 5 ? `<button class="b sm" data-ga="${v}">+ ${esc(doms[L])}</button>` : ''}</div></div>`; }).join('')}
      <label class="f">Composer un sort</label>
      <select id="gV">${Object.keys(x.galdr).filter(v => c.gal[v]).map(v => `<option>${v}</option>`).join('')}</select>
      <select id="gD" style="margin-top:4px"></select><select id="gT" style="margin-top:4px">${x.galdrDur.map((d, i) => `<option value="${(i + 1) * 3}">Durée : ${d} (SD ${(i + 1) * 3})</option>`).join('')}</select>
      <select id="gZ" style="margin-top:4px"></select><p id="gSR" style="margin:6px 0"></p><button class="b acc" id="gRoll" style="width:100%">Lancer le Galdr</button></div>
    <div class="card"><h3 style="margin-top:0">Runes <span class="mut">COM ${car(c, 'com')} + Runes ${skv(c, 'runes')}</span></h3>
      ${(c.run || []).map(n => { const z = x.runesMag.find(q => q[0] === n); return `<div class="sk" style="grid-template-columns:1fr auto"><div class="nm"><b>${esc(n)}</b> <span class="mut">niv. ${z[1]}</span><br><small>${esc([z[2] && 'Positif : ' + z[2], z[3] && 'Négatif : ' + z[3]].filter(Boolean).join(' · '))}</small></div><button class="b sm bad" data-rnd="${esc(n)}">✕</button></div>`; }).join('') || '<p class="mut">Aucune rune connue.</p>'}
      <select id="rnAdd" style="margin-top:6px"><option value="">+ apprendre une rune…</option>${x.runesMag.filter(z => !(c.run || []).includes(z[0])).map(z => `<option value="${esc(z[0])}">${esc(z[0])} (niv. ${z[1]})</option>`).join('')}</select>
      <label class="f">Graver une rune</label><select id="rR">${(c.run || []).map(n => `<option>${esc(n)}</option>`).join('')}</select>
      <div class="row" style="flex-wrap:nowrap;margin-top:4px"><span class="mut">Puissance</span><input type="number" id="rP" value="3" min="1" max="15" style="width:70px"><select id="rS" class="grow">${x.runeSupport.map((s, i) => `<option value="${(i + 1) * 3}">${s[0]} (dure puissance × ${s[1]}, gravure ${6 - car(c, 'agi')} ${s[2]})</option>`).join('')}</select></div>
      <p id="rSR" style="margin:6px 0"></p><button class="b acc" id="rRoll" style="width:100%">Graver (dépense 1 dé de furor)</button></div>`}`;
    const re = () => { save(); magie(c, el); };
    const pa = $('#prAdd', el); pa.onchange = () => { if (!pa.value) return; const [n, l] = pa.value.split('|'); buy(`Prouesse ${n} niv. ${l}`, +l, () => { c.prw[n] = [...(c.prw[n] || []), +l].sort(); }, ['prw', n, +l]); };
    $$('[data-prd]', el).forEach(b => b.onclick = () => { delete c.prw[b.dataset.prd]; re(); });
    if (!initie) return;
    const sa = $('#sjAdd', el); sa.onchange = () => { if (!sa.value) return; const z = x.sejdr.find(q => q[2] === sa.value); buy(`Sejdr : ${z[2]}`, z[1], () => { c.sej = [...(c.sej || []), z[2]]; }, ['sej', z[2]]); };
    $$('[data-sjd]', el).forEach(b => b.onclick = () => { c.sej = c.sej.filter(n => n !== b.dataset.sjd); re(); });
    $$('[data-sjr]', el).forEach(b => b.onclick = () => { const z = x.sejdr.find(q => q[2] === b.dataset.sjr), neg = $('#sjNeg').checked, dm = +$('#sjDM').value || 0;
      rollTo(c, car(c, 'ins'), skv(c, 'sejdr'), `Sejdr : ${z[2]} (prép. ${z[3]})`, { mod: -3 * z[1], sr: 14 + (neg ? dm : 0) }); DLAB += ' · durée selon la marge'; });
    $$('[data-ga]', el).forEach(b => b.onclick = () => { const v = b.dataset.ga, L = (c.gal[v] || 0) + 1; buy(`Galdr ${v} : ${x.galdr[v][L - 1]}`, L, () => { c.gal[v] = L; }, ['gal', v]); });
    $$('[data-gd]', el).forEach(b => b.onclick = () => { c.gal[b.dataset.gd]--; re(); });
    const gV = $('#gV', el), gD = $('#gD', el), gZ = $('#gZ', el), gT = $('#gT', el);
    const gFill = () => { const v = gV.value; if (!v) { gD.innerHTML = ''; gZ.innerHTML = ''; $('#gSR').textContent = 'Achète d\'abord un domaine.'; return; }
      gD.innerHTML = x.galdr[v].slice(0, c.gal[v]).map((d, i) => `<option value="${(i + 1) * 3}">${d} (SD ${(i + 1) * 3})</option>`).join('');
      gZ.innerHTML = (v === 'Illusions' ? x.galdrZone : x.galdrCibles).map((d, i) => `<option value="${(i + 1) * 3}">${v === 'Illusions' ? 'Zone' : 'Cibles'} : ${d} (SD ${(i + 1) * 3})</option>`).join(''); gSR(); };
    const gSR = () => { if (!gV.value) return; $('#gSR').innerHTML = `SR = <b>${+gD.value + +gT.value + +gZ.value}</b> · préparation 3 actions · résistance : TEN + DM (Illusion : seulement si la cible doute)`; };
    gV.onchange = gFill; gD.onchange = gSR; gT.onchange = gSR; gZ.onchange = gSR; gFill();
    $('#gRoll', el).onclick = () => { if (!gV.value) return toast('Aucun domaine'); rollTo(c, car(c, 'cha'), skv(c, 'galdr'), `Galdr : ${gV.value} — ${gD.selectedOptions[0].text}`, { sr: +gD.value + +gT.value + +gZ.value }); };
    const ra = $('#rnAdd', el); ra.onchange = () => { if (!ra.value) return; const z = x.runesMag.find(q => q[0] === ra.value); buy(`Rune ${z[0]}`, z[1], () => { c.run = [...(c.run || []), z[0]]; }, ['run', z[0]]); };
    $$('[data-rnd]', el).forEach(b => b.onclick = () => { c.run = c.run.filter(n => n !== b.dataset.rnd); re(); });
    const rR = $('#rR', el), rP = $('#rP', el), rS = $('#rS', el);
    const rSR = () => { const z = x.runesMag.find(q => q[0] === rR.value); if (!z) { $('#rSR').textContent = ''; return; } const p = Math.max(1, Math.min(15, +rP.value || 1)); $('#rSR').innerHTML = `SR = <b>${p + +rS.value + z[1] * 3}</b> (puissance ${p} + support ${rS.value} + niveau ${z[1] * 3}) · résistance : TEN + DM ≥ ${14 + p}`; };
    rR.onchange = rSR; rP.oninput = rSR; rS.onchange = rSR; rSR();
    $('#rRoll', el).onclick = () => { const z = x.runesMag.find(q => q[0] === rR.value); if (!z) return toast('Aucune rune'); const p = Math.max(1, Math.min(15, +rP.value || 1));
      const st = state(c); if (st.furCur <= 0) return toast('Il faut au moins 1 dé de furor'); c.fur = st.furCur - 1; save();
      rollTo(c, car(c, 'com'), skv(c, 'runes'), `Rune ${z[0]} (puissance ${p})`, { sr: p + +rS.value + z[1] * 3 }); };
  }

  /* ---------- Équipement et notes ---------- */
  function equip(c, el) {
    const x = X(), s = sec(c);
    el.innerHTML = `<div class="stats"><div class="stat"><div class="v">${s.prot}</div><div class="n">Protection</div></div><div class="stat"><div class="v">${s.enc}/${s.cpe}</div><div class="n">Encombrement</div></div><div class="stat"><div class="v">${s.dp}</div><div class="n">DP</div></div></div>
    <h2>Armes</h2><div class="card">${c.weapons.map((n, i) => { const w = x.weapons.find(z => z[0] === n) || [n, 'lutte', 0, 0, 0, '', '']; return `<div class="row" style="flex-wrap:nowrap;margin-bottom:6px"><span class="grow"><b>${esc(n)}</b> <span class="mut">${esc(skName(w[1]))} · dégâts ${w[2]} · solidité ${w[3]} · enc. ${w[4]}${w[5] ? ' · ' + esc(w[5]) : ''}</span></span><button class="b sm bad" data-wd="${i}">✕</button></div>`; }).join('') || '<p class="mut">Aucune arme.</p>'}
      <select id="wAdd">${opts(x.weapons.map(w => [w[0], `${w[0]} (dégâts ${w[2]}, enc. ${w[4]}, ${w[6]} once${w[7] ? ', jetable' : ''})`]), '', '+ ajouter une arme…')}</select></div>
    <h2>Armure</h2><div class="card"><select id="arm">${opts(x.armors.map(a => [a[0], `${a[0]} (protection ${a[1]}, enc. ${a[2]}, ${a[3]} once)`]), c.armor, 'Aucune')}</select>
      ${x.pieces.map(p => `<label class="mut" style="display:block;margin-top:6px"><input type="checkbox" data-pc="${esc(p[0])}" ${(c.pieces || []).includes(p[0]) ? 'checked' : ''} style="width:auto"> ${p[0]} (+${p[1]}, enc. ${p[2]})</label>`).join('')}
      <label class="mut" style="display:block;margin-top:6px"><input type="checkbox" id="shd" ${c.shield ? 'checked' : ''} style="width:auto"> Bouclier (DP +3, solidité 18)</label>
      <p class="mut">Option : quand l'armure absorbe tout un coup, une pièce perd 1 point. Dans l'eau, la protection devient un malus en Natation.</p></div>
    <h2>Bourse</h2><div class="card"><input id="purse" value="${esc(c.purse)}" placeholder="onces d'argent, pièces (1/10 once)"></div>
    <h2>Matériel</h2><div class="card"><textarea id="gear" placeholder="Besace, corde, amadou, patins…">${esc(c.gear)}</textarea></div>`;
    const re = () => { save(); equip(c, el); };
    $('#wAdd', el).onchange = e => { if (e.target.value) c.weapons.push(e.target.value); re(); };
    $$('[data-wd]', el).forEach(b => b.onclick = () => { c.weapons.splice(+b.dataset.wd, 1); re(); });
    $('#arm', el).onchange = e => { c.armor = e.target.value; re(); };
    $$('[data-pc]', el).forEach(z => z.onchange = () => { c.pieces = (c.pieces || []).filter(n => n !== z.dataset.pc); if (z.checked) c.pieces.push(z.dataset.pc); re(); });
    $('#shd', el).onchange = e => { c.shield = e.target.checked; re(); };
    $('#purse', el).onchange = e => { c.purse = e.target.value; save(); };
    $('#gear', el).onchange = e => { c.gear = e.target.value; save(); };
  }
  function notes(c, el) {
    el.innerHTML = `<label class="f">Historique (clan, famille, but, manies…)</label><textarea id="ds" style="min-height:140px">${esc(c.desc)}</textarea>
      <label class="f">Notes, saga en cours</label><textarea id="nt" style="min-height:180px">${esc(c.notes)}</textarea>`;
    $('#ds', el).onchange = e => { c.desc = e.target.value; save(); };
    $('#nt', el).onchange = e => { c.notes = e.target.value; save(); };
  }

  /* ---------- Dés ---------- */
  function rollTest() {
    const n = Math.max(0, DN) + (DFLAGS.don ? 1 : 0);
    const dice = Array.from({ length: n }, d10);
    const baseDice = dice.slice(0, DN);
    let keep = DKEEP + (DFLAGS.destin ? 1 : 0);
    keep = Math.min(keep, n);
    const idx = dice.map((v, i) => i).sort((a, b) => dice[b] - dice[a]);
    let kept;
    if (keep <= 0) kept = [];
    else if (DFLAGS.faib && n > 1) kept = [...idx.slice(0, keep - 1), idx[idx.length - 1]];
    else kept = idx.slice(0, keep);
    const extra = {};
    kept.forEach(i => { if (dice[i] === 10) { const ch = []; let e; do { e = d10(); ch.push(e); } while (e === 10); extra[i] = ch; } });
    const ones = baseDice.filter(v => v === 1).length;
    const fumble = DN === 1 ? ones >= 1 : DN === 2 ? ones >= 2 : ones >= 3;
    return { dice, kept, extra, fumble, furor: [], impossible: keep <= 0 };
  }
  function des() {
    const el = $('#v-des'), x = X(), r = DLAST;
    let res = '';
    if (r) {
      const keptSum = r.kept.reduce((a, i) => a + r.dice[i] + (r.extra[i] || []).reduce((p, q) => p + q, 0), 0);
      const tot = keptSum + DB + DMOD + r.furor.reduce((a, b) => a + b, 0);
      const ok = !r.impossible && !r.fumble && tot >= DSR, crit = ok && tot >= DSR * 2, mr = tot - DSR;
      const verdict = r.impossible ? ['Impossible (aucun dé gardé)', 'ko'] : r.fumble ? ['Échec critique !', 'ko'] : crit ? ['Réussite critique !', 'ok'] : ok ? ['Réussite', 'ok'] : ['Échec', 'ko'];
      const dur = ok && /Sejdr/.test(DLAB) ? (x.sejdrDur.filter(d => mr >= d[0]).pop() || [, ''])[1] : '';
      res = `<div class="res">${r.dice.map((v, i) => `<div class="die" style="background:${r.kept.includes(i) ? 'var(--acc)' : '#3a3a3a'};color:${r.kept.includes(i) ? '#1b1200' : '#aaa'}">${v}${r.extra[i] ? '<small>+' + r.extra[i].join('+') + '</small>' : ''}</div>`).join('')}${r.furor.map(v => `<div class="die" style="background:#b33;color:#fff">${v}</div>`).join('')}</div>
        <div class="sum"><span class="big">${tot}</span><span class="mut">= dés ${keptSum} ${DB ? sg(DB) : ''} ${DMOD ? sg(DMOD) : ''}${r.furor.length ? ' + furor ' + r.furor.join('+') : ''}</span></div>
        <div class="verdict ${verdict[1]}">${verdict[0]} <span class="mut" style="font-size:14px">(marge ${sg(mr)} / SR ${DSR})</span></div>
        ${ok && DDMG != null ? `<p style="text-align:center">Dégâts : <b>${mr + DDMG}</b> (marge ${mr} + ${DDMG}) − protection de la cible${crit ? ' · critique : ×2 ou table des coups parfaits' : ''}</p>` : ''}
        ${dur ? `<p style="text-align:center">Durée du sort : <b>${dur}</b></p>` : ''}
        <div class="row" style="justify-content:center"><button class="b sm" id="addF">+1 dé de furor</button><button class="b sm" id="tbl">${r.fumble ? 'Table des maladresses' : crit ? 'Table des coups parfaits' : 'Tables critiques'}</button></div>`;
    }
    el.innerHTML = `<h2>Test (D10)</h2>${DLAB ? `<div class="mut" style="margin-bottom:8px">Test : <b style="color:var(--acc)">${esc(DLAB)}</b></div>` : ''}
      <div class="card">
        <div class="sk" style="grid-template-columns:1fr auto"><div class="nm">Dés lancés (caractéristique)</div>${pm('n', DN)}</div>
        <div class="sk" style="grid-template-columns:1fr auto"><div class="nm">Bonus (compétence ou carac.)</div>${pm('b', sg(DB))}</div>
        <div class="sk" style="grid-template-columns:1fr auto"><div class="nm">Modificateur</div>${pm('mod', sg(DMOD))}</div>
        <div class="sk" style="grid-template-columns:1fr auto"><div class="nm">Dés gardés (2 normalement)</div>${pm('k', DKEEP)}</div>
        <div class="row" style="margin-top:6px"><label class="mut"><input type="checkbox" data-fl="destin" ${DFLAGS.destin ? 'checked' : ''} style="width:auto"> Destin (+1 gardé)</label><label class="mut"><input type="checkbox" data-fl="don" ${DFLAGS.don ? 'checked' : ''} style="width:auto"> Don (+1 dé)</label><label class="mut"><input type="checkbox" data-fl="faib" ${DFLAGS.faib ? 'checked' : ''} style="width:auto"> Faiblesse</label></div>
        <label class="f">Seuil de réussite</label><div class="row">${x.sr.map(s => `<button class="b sm ${DSR === s[1] ? 'acc' : ''}" data-sr="${s[1]}">${s[0]} ${s[1]}</button>`).join('')}</div>
        <div class="row" style="margin-top:6px">${pm('sr', DSR)}<span class="mut">Attaque : 14 + DP de la cible</span></div></div>
      <div class="row"><button class="b grow" id="clr">Réinitialiser</button><button class="b acc grow" id="roll" style="flex:2">Lancer ${DN + (DFLAGS.don ? 1 : 0)}D10</button></div>
      <div id="result">${res}</div>
      <div class="card mut" style="margin-top:12px">On garde les 2 meilleurs dés, un 10 gardé se relance et s'ajoute. Réussite critique : total ≥ 2 × SR. Furor : +1D10 au résultat.</div>`;
    const bump = (k, d) => { if (k === 'n') DN = Math.max(1, Math.min(10, DN + d)); if (k === 'b') DB += d; if (k === 'mod') DMOD += d; if (k === 'k') DKEEP = Math.max(0, Math.min(5, DKEEP + d)); if (k === 'sr') DSR = Math.max(0, DSR + d); des(); };
    $$('[data-p]', el).forEach(b => b.onclick = () => bump(b.dataset.p, 1));
    $$('[data-m]', el).forEach(b => b.onclick = () => bump(b.dataset.m, -1));
    $$('[data-sr]', el).forEach(b => b.onclick = () => { DSR = +b.dataset.sr; des(); });
    $$('[data-fl]', el).forEach(z => z.onchange = () => { DFLAGS[z.dataset.fl] = z.checked; des(); });
    $('#clr').onclick = () => { DN = 2; DB = 0; DMOD = 0; DSR = 14; DKEEP = 2; DLAB = ''; DDMG = null; DCHAR = null; DFLAGS = { destin: false, don: false, faib: false }; DLAST = null; des(); };
    $('#roll').onclick = () => { DLAST = rollTest(); if (navigator.vibrate) navigator.vibrate(30); des(); };
    const af = $('#addF'); if (af) af.onclick = () => {
      const c = DCHAR && getChar(DCHAR);
      if (c) { const st = state(c); if (st.furCur <= 0) return toast('Réserve de furor vide'); c.fur = st.furCur - 1; save(); if (c.fur === 0) toast('Réserve vide : épuisé !'); }
      DLAST.furor.push(d10()); des(); };
    const tb = $('#tbl'); if (tb) tb.onclick = () => {
      const roll = d10(), f = x.fumbles.find(z => roll <= z[0]), cr = x.crits.find(z => roll <= z[0]);
      modal(`<div class="row"><h2 class="grow" style="margin:0">1D10 = ${roll}</h2><button class="b sm" onclick="closeModal()">✕</button></div>
        <h3>Maladresse</h3><p>${esc(f[1])}</p><h3>Coup parfait</h3><p>${esc(cr[1])}</p><p class="mut">Tables optionnelles. Plus simple : critique = dégâts ×2, ou briser l'arme adverse en défense.</p>`); };
  }

  /* ---------- Espace MJ ---------- */
  function mjS() { S.mjYgg = Object.assign({ init: [], cur: 0, round: 1, foes: [], notes: '' }, S.mjYgg); return S.mjYgg; }
  function mj() {
    const el = $('#v-mj'), m = mjS(), x = X();
    const tabs = [['init', 'Initiative'], ['foes', 'Figurants'], ['best', 'Bestiaire'], ['seq', 'Blessures'], ['notes', 'Notes']];
    el.innerHTML = `<h2>Espace Meneur</h2><div class="tabs">${tabs.map(([k, n]) => `<button class="b sm ${MJT === k ? 'on' : ''}" data-mt="${k}">${n}</button>`).join('')}</div><div id="mjc"></div>`;
    $$('[data-mt]', el).forEach(b => b.onclick = () => { MJT = b.dataset.mt; mj(); });
    const c = $('#mjc'), re = () => { save(); mj(); };
    const addFoe = (n, a, carac = []) => { const f = { n, co: a.co, cd: a.cd, rel: a.rel, phy: a.phy, men: a.men, mya: a.mya, myp: a.myp, vit: a.vit, st: 0, tags: a.tags || '', dmgB: 0 };
      carac.forEach(cn => { const z = x.caracteres.find(q => q[0] === cn); if (!z) return; Object.entries(z[1]).forEach(([k, v]) => f[k] = Math.max(0, Math.min(20, (f[k] || 0) + v))); if (/Dégâts \+2/.test(z[2] || '')) f.dmgB = 2; });
      if (carac.length) f.tags = [f.tags, carac.join(', ')].filter(Boolean).join(' · '); m.foes.push(f); m.init.push({ n, rea: Math.max(0, Math.round(f.men)), v: null }); };
    if (MJT === 'init') {
      c.innerHTML = `<div class="row" style="margin-bottom:10px"><b class="grow">Tour ${m.round}</b><button class="b sm" id="iRoll">🎲 Tout lancer</button><button class="b acc sm" id="iNext">Suivant ▶</button></div>
        <div class="list ini">${m.init.map((z, i) => `<div class="it ${i === m.cur ? 'cur' : ''}"><input value="${esc(z.n)}" data-in="${i}" class="grow" style="padding:6px"><span class="mut">Réa.</span><input type="number" value="${z.rea}" data-ir="${i}" style="width:54px;padding:6px"><b style="min-width:30px;text-align:center">${z.v ?? '–'}</b><button class="b sm bad" data-id="${i}">✕</button></div>`).join('') || '<p class="mut">Ajoute les combattants.</p>'}</div>
        <div class="row"><button class="b grow" id="iAdd">+ Combattant</button><button class="b grow" id="iPJ">+ Tous les héros</button><button class="b" id="iClr">Vider</button></div>
        <p class="mut">Initiative = Réaction + 1D10. Actions = AGI + 1 (figurants : 2, ou 3 si Conflit ≥ 10). Malus : −2, −5, −10, −15, −20.</p>`;
      $('#iAdd').onclick = () => { m.init.push({ n: 'Combattant', rea: 5 }); re(); };
      $('#iPJ').onclick = () => { S.chars.filter(z => z.sys === 'ygg' && !z.creation).forEach(z => m.init.push({ n: z.name, rea: sec(z).rea })); re(); };
      $('#iClr').onclick = () => { m.init = []; m.cur = 0; m.round = 1; re(); };
      $('#iRoll').onclick = () => { m.init.forEach(z => z.v = d10() + (+z.rea || 0)); m.init.sort((a, b) => b.v - a.v || b.rea - a.rea); m.cur = 0; re(); };
      $('#iNext').onclick = () => { if (!m.init.length) return; m.cur++; if (m.cur >= m.init.length) { m.cur = 0; m.round++; toast('Tour ' + m.round); } re(); };
      $$('[data-in]', c).forEach(i => i.onchange = () => { m.init[+i.dataset.in].n = i.value; save(); });
      $$('[data-ir]', c).forEach(i => i.onchange = () => { m.init[+i.dataset.ir].rea = +i.value; save(); });
      $$('[data-id]', c).forEach(b => b.onclick = () => { m.init.splice(+b.dataset.id, 1); re(); });
    }
    if (MJT === 'foes') {
      const ST = ['Fringant', 'Blessé', 'Mort'];
      c.innerHTML = `<div class="card"><label class="f">Ajouter des figurants</label><select id="fT">${x.figurants.map((f, i) => `<option value="${i}">${f[0]} (Conflit ${f[1]}/${f[2]}, Vitalité ${f[8]})</option>`).join('')}</select>
        <select id="fC" multiple size="5" style="margin-top:6px">${x.caracteres.map(z => `<option>${z[0]}</option>`).join('')}</select><p class="mut" style="margin:4px 0">Caractères : 0 à 3 (maintenir pour en choisir plusieurs).</p>
        <div class="row"><input type="number" id="fN" value="1" style="width:70px"><button class="b acc grow" id="fAdd">+ Ajouter</button></div></div>` +
        m.foes.map((f, i) => `<div class="card"><div class="row"><input value="${esc(f.n)}" data-fn="${i}" class="grow" style="font-weight:700"><button class="b sm" data-fdup="${i}">⧉</button><button class="b sm bad" data-fdel="${i}">✕</button></div>
          <p class="mut" style="margin:6px 0">Conflit ${f.co}/${f.cd} · Relationnel ${f.rel} · Physique ${f.phy} · Mental ${f.men} · Mystique ${f.mya}/${f.myp} · Vitalité ${f.vit}${f.tags ? ' · ' + esc(f.tags) : ''}</p>
          <p style="margin:4px 0">Attaque : 2D10 + ${f.co} · le toucher : SR ${14 + f.cd} · dégâts : ${f.phy}${f.dmgB ? ' + 2' : ''} + MR + 1D10 · ${f.co >= 10 ? 3 : 2} actions</p>
          <div class="row"><span>État : <b class="${f.st ? 'ko' : 'ok'}">${ST[f.st]}</b></span><div class="grow"></div><input type="number" placeholder="dégâts" data-fhit="${i}" style="width:90px"><button class="b sm" data-fatk="${i}">🎲 Attaque</button></div></div>`).join('');
      $('#fAdd').onclick = () => { const t = x.figurants[+$('#fT').value], car = [...$('#fC').selectedOptions].map(o => o.value).slice(0, 3), n = Math.max(1, +$('#fN').value || 1);
        for (let k = 0; k < n; k++) addFoe(t[0] + (n > 1 ? ' ' + (k + 1) : ''), { co: t[1], cd: t[2], rel: t[3], phy: t[4], men: t[5], mya: t[6], myp: t[7], vit: t[8] }, car);
        re(); toast('Ajouté (et à l\'initiative)'); };
      $$('[data-fn]', c).forEach(i => i.onchange = () => { m.foes[+i.dataset.fn].n = i.value; save(); });
      $$('[data-fdel]', c).forEach(b => b.onclick = () => { m.foes.splice(+b.dataset.fdel, 1); re(); });
      $$('[data-fdup]', c).forEach(b => b.onclick = () => { const f = JSON.parse(JSON.stringify(m.foes[+b.dataset.fdup])); f.st = 0; m.foes.push(f); re(); });
      $$('[data-fhit]', c).forEach(i => i.onchange = () => { const f = m.foes[+i.dataset.fhit], d = +i.value || 0; if (d >= 2 * f.vit) f.st = 2; else if (d >= f.vit) f.st = Math.min(2, f.st + 1); else toast('Blessure superficielle'); re(); });
      $$('[data-fatk]', c).forEach(b => b.onclick = () => { const f = m.foes[+b.dataset.fatk], a = d10(), bb = d10(); toast(`${f.n} : ${a}+${bb}+${f.co} = ${a + bb + f.co} · dégâts ${f.phy + (f.dmgB || 0)} + MR + ${d10()}`); });
    }
    if (MJT === 'best') {
      c.innerHTML = `<div class="list">${x.animaux.map((z, i) => `<div class="it" data-cr="${i}" style="cursor:pointer"><div class="grow"><b>${esc(z[0])}</b><div class="mut">Conflit ${z[1]}/${z[2]} · Physique ${z[4]} · Vitalité ${z[8]}${z[9] ? ' · ' + esc(z[9]) : ''}</div></div></div>`).join('')}
        <div class="it" id="kraken" style="cursor:pointer"><div class="grow"><b>Le Seigneur-Kraken des îles Lofoten</b><div class="mut">Créature unique (règles de personnage)</div></div></div></div>
        <details class="card"><summary>Pouvoirs des créatures</summary><p><b>Armure naturelle (x)</b> : protection x. <b>Terreur (x)</b> : TEN + DM SR 14 − x, sinon malus = marge d'échec contre elle. <b>Ravageur</b> : relance le dé de dégâts sur 10. <b>Increvable</b> : meurt à 3 × Vitalité. <b>Attaques multiples (x)</b> : x attaques, −2 × x chacune. <b>Point faible</b> : attaque à −12, Vitalité /2. <b>Crocs de gel</b> : TEN + DM SR 22 + Mystique, sinon initiative −2 et première action à −2. <b>Murmure</b> : INS + DM SR 14 + Mystique, sinon obéit. <b>Brouillard glacial</b> : −3 Perception et tir, Vigueur SR 14 + INS par tour ou −1 PV. <b>Aquatique</b>, <b>Armes naturelles</b> (2D10 garde le meilleur aux dégâts).</p></details>`;
      $$('[data-cr]', c).forEach(d => d.onclick = () => { const z = x.animaux[+d.dataset.cr];
        modal(`<div class="row"><h2 class="grow" style="margin:0">${esc(z[0])}</h2><button class="b sm" onclick="closeModal()">✕</button></div>
          <p>Conflit ${z[1]}/${z[2]} · Relationnel ${z[3]} · Physique ${z[4]} · Mental ${z[5]} · Mystique ${z[6]}/${z[7]} · <b>Vitalité ${z[8]}</b></p>${z[9] ? `<p>${esc(z[9])}</p>` : ''}
          <select id="crC" multiple size="5">${x.caracteres.map(q => `<option>${q[0]}</option>`).join('')}</select>
          <div class="row" style="margin-top:6px"><input type="number" id="crN" value="1" style="width:70px"><button class="b acc grow" id="crAdd">+ Ajouter au combat</button></div>`);
        $('#crAdd').onclick = () => { const n = +$('#crN').value || 1, car = [...$('#crC').selectedOptions].map(o => o.value).slice(0, 3);
          for (let k = 0; k < n; k++) addFoe(z[0] + (n > 1 ? ' ' + (k + 1) : ''), { co: z[1], cd: z[2], rel: z[3], phy: z[4], men: z[5], mya: z[6], myp: z[7], vit: z[8], tags: z[9] }, car);
          save(); closeModal(); MJT = 'foes'; mj(); toast('Ajouté au combat et à l\'initiative'); }; });
      $('#kraken').onclick = () => modal(`<div class="row"><h2 class="grow" style="margin:0">Le Seigneur-Kraken</h2><button class="b sm" onclick="closeModal()">✕</button></div>
        <p>Corps : PUI 10, VIG 14, AGI 6 · Esprit : INT 2, PER 4, TEN 8 · Âme : CHA 0, INS 6, COM 0</p>
        <p>DP 26 · DM 13 · Déplacement 20 · Réaction 12 · <b>PV 112</b> (56 / 28 / 0 / −28) · Protection 12</p>
        <p>Compétences : Saisir et broyer 16, Natation 20. Pouvoirs : Armure naturelle (12), Terreur (10), Brouillard glacial, Attaques multiples (×6), Ravageur, Point faible (yeux), Aquatique.</p>`);
    }
    if (MJT === 'seq') {
      c.innerHTML = `<div class="card"><p style="margin-top:0">Blessure grave : perte ≥ PV/2 en un coup. Vigueur SR = dégâts, sinon à terre (Ténacité SR 14 chaque tour).</p><button class="b acc" id="sqR" style="width:100%">🎲 Tirer une séquelle (2D10)</button><div id="sqO"></div></div>
        <div class="card">${x.sequelles.map((z, i) => `<p style="margin:4px 0"><b>${i && x.sequelles[i - 1][0] + 1 !== z[0] ? (x.sequelles[i - 1][0] + 1) + '-' : ''}${z[0]} · ${esc(z[1])}</b> <span class="mut">${esc(z[2])}</span></p>`).join('')}</div>`;
      $('#sqR').onclick = () => { const r = d10() + d10(), z = x.sequelles.find(q => r <= q[0]); $('#sqO').innerHTML = `<p><b>${r} — ${esc(z[1])}</b><br>${esc(z[2])}</p>`; };
    }
    if (MJT === 'notes') {
      c.innerHTML = `<textarea id="mjN" style="min-height:60vh" placeholder="Saga, PNJ, lieux, runes à faire jouer…">${esc(m.notes)}</textarea>`;
      $('#mjN').oninput = e => { m.notes = e.target.value; clearTimeout(mj.t); mj.t = setTimeout(save, 400); };
    }
  }

  window.MODS.ygg = { persos, des, mj };
})();
