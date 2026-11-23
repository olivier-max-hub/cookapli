/* Cookapli — « Mes outils » : profil, outils du profil, autres outils, régime et allergies.
   Utilisé par perso.html et par la dernière page de la glisse de l'accueil.
   CookMesOutils.monter(conteneur, { change: fn(type), voir: fn }) */
(function () {
  var OUTILS = {
    quecuisiner: ['🍳', 'Des recettes pour toi', 'ce que tu peux cuisiner avec tes réserves'],
    planif: ['🗓️', 'Planificateur semaine', 'tes repas du lundi au dimanche, midi et soir'],
    chrono: ['⏱️', 'Max 30 min', 'des recettes prêtes en 30 minutes'],
    antigaspi: ['♻️', 'Zéro gaspi', "on cuisine d'abord ce qui doit partir vite"],
    courses: ['🛒', 'Courses auto', 'en un clic, ce qui manque pour ta recette'],
    equilibre: ['⚖️', 'Calories / personne', 'compose ton menu et estime ses calories'],
    batch: ['🍱', 'Batch cooking 3 h', 'tes repas de la semaine prêts le week-end']
  };
  var ICF = { vege: '🥕', vegan: '🌱', gluten: '🌾', coque: '🌰', arachide: '🥜', poisson: '🐟', fruitsmer: '🦐' };
  var CSS = '.mo h2{margin:0 0 4px;font-size:1.2rem;color:#0f6b78;font-weight:800}.mo section{margin:0 0 18px}' +
    '.mo-chips{display:flex;flex-wrap:wrap;gap:8px}.mo-chip{border:2px solid #0f6b78;background:#fff;color:#0f6b78;border-radius:99px;padding:8px 14px;font:inherit;font-weight:800;font-size:.95rem;cursor:pointer;min-height:44px}' +
    '.mo-chip[aria-pressed="true"]{background:#0f6b78;color:#fff}' +
    '.mo-list{list-style:none;margin:0;padding:0 2px;display:flex;flex-direction:column}.mo-list li{border-bottom:1px solid rgba(15,107,120,.14)}.mo-list li:last-child{border-bottom:0}' +
    '.mo-l{display:flex;align-items:center;gap:12px;padding:10px 2px;cursor:pointer}.mo-i{flex:none;width:28px;text-align:center;font-size:1.25rem;line-height:1}' +
    '.mo-t{flex:1;min-width:0;display:flex;flex-direction:column;line-height:1.2}.mo-t b{font-size:1.05rem;font-weight:800;color:#0b4f59;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
    '.mo-t small{font-size:.86rem;color:#3d5559;font-weight:600}.mo-c{flex:none;width:26px;height:26px;margin:0;accent-color:#1f9d55;cursor:pointer}' +
    '.mo-avert{background:#fff6e0;border:1px solid #e9c44a;border-radius:14px;padding:10px 12px;font-size:.92rem;color:#3a2a00;margin:8px 0 0}' +
    '.mo-btns{display:grid;gap:10px}.mo-btn{display:flex;align-items:center;justify-content:center;min-height:48px;border:2px solid #0f6b78;border-radius:99px;background:#0f6b78;color:#fff;font:inherit;font-size:1.05rem;font-weight:800;cursor:pointer;text-decoration:none}' +
    '.mo-btn.alt{background:#fff;color:#0f6b78}.mo-vit{display:block;text-align:center;margin-top:4px;color:#0b4f59;font-weight:800;text-underline-offset:3px}.mo [hidden]{display:none!important}' +
    '#moToast{position:fixed;left:50%;bottom:calc(20px + env(safe-area-inset-bottom,0px));transform:translate(-50%,14px);width:min(520px,calc(100% - 32px));display:flex;align-items:center;gap:12px;background:#fff;color:#1f2a24;border:1px solid #d3e6ea;border-left:6px solid #0f6b78;border-radius:16px;padding:12px 14px;box-shadow:0 8px 24px rgba(0,0,0,.18);font-weight:700;opacity:0;pointer-events:none;transition:opacity .2s,transform .2s;z-index:60}' +
    '#moToast.on{opacity:1;transform:translate(-50%,0);pointer-events:auto}#moToast::before{content:"✓";flex:none;width:28px;height:28px;border-radius:50%;background:#0f6b78;color:#fff;display:grid;place-items:center;font-weight:700}' +
    '#moToast>span{flex:1}#moToast button{flex:none;border:1px solid #0f6b78;background:#e3f6f8;color:#0b4f59;border-radius:99px;padding:6px 14px;font:inherit;font-size:.95rem;font-weight:700;cursor:pointer}';
  function style() { if (document.getElementById('moCss')) return; var s = document.createElement('style'); s.id = 'moCss'; s.textContent = CSS; document.head.appendChild(s); }
  function toast(m, annuler) {
    var t = document.getElementById('moToast'); if (!t) { t = document.createElement('div'); t.id = 'moToast'; t.setAttribute('role', 'status'); t.setAttribute('aria-live', 'polite'); document.body.appendChild(t); }
    t.innerHTML = ''; var sp = document.createElement('span'); sp.textContent = m; t.appendChild(sp);
    if (annuler) { var b = document.createElement('button'); b.type = 'button'; b.textContent = 'Annuler'; b.onclick = function () { annuler(); t.classList.remove('on'); }; t.appendChild(b); }
    t.classList.add('on'); clearTimeout(toast.t); toast.t = setTimeout(function () { t.classList.remove('on'); }, 4000);
  }
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function ligne(ic, titre, sous, coche, onchange) {
    var li = el('li'), l = el('label', 'mo-l', '<span class="mo-i" aria-hidden="true"></span><span class="mo-t"><b></b><small></small></span><input type="checkbox" class="mo-c">');
    l.querySelector('.mo-i').innerHTML = ic; l.querySelector('b').textContent = titre; l.querySelector('small').textContent = sous;
    var c = l.querySelector('input'); c.checked = coche; c.onchange = function () { onchange(c.checked); }; li.appendChild(l); return li;
  }
  function monter(box, opt) {
    opt = opt || {}; style();
    var A = window.CookAccueil, F = window.CookFiltres; if (!A || !box) return;
    /* rien n'est enregistré tant que l'utilisateur n'a rien touché : la vitrine reste la vitrine */
    var lu = A.lire(), vierge = !lu || (lu.profil === 'tout' && !lu.perso);
    var s = vierge ? { v: 1, profil: 'famille', perso: false, blocs: A.preset('famille'), connus: A.BLOCS.map(function (b) { return b.id; }) } : lu;
    box.classList.add('mo'); box.innerHTML = '';
    var sp = el('section', null, '<h2>Ton profil</h2><div class="mo-chips" role="group" aria-label="Profil"></div>'),
      so = el('section', null, '<h2>Les outils de ton profil</h2><ul class="mo-list"></ul>'),
      sa = el('section', null, '<h2>Autres outils</h2><ul class="mo-list"></ul>'),
      sf = el('section', null, '<h2>Régime et allergies</h2><ul class="mo-list"></ul><p class="mo-avert"><b>⚠️ Allergies :</b> Cookapli repère les ingrédients des recettes, mais ne connaît pas la composition exacte des produits que tu achètes (traces, bouillons, sauces…). Vérifie toujours les étiquettes.</p>'),
      bt = el('div', 'mo-btns');
    [sp, so, sa, sf, bt].forEach(function (x) { box.appendChild(x); });
    function signal(k) { if (opt.change) opt.change(k); }
    function dessiner() {
      var P = sp.querySelector('.mo-chips'); P.textContent = '';
      A.PROFILS.filter(function (p) { return p.id !== 'tout'; }).forEach(function (p) {
        var on = !vierge && p.id === s.profil, b = el('button', 'mo-chip'); b.type = 'button'; b.setAttribute('aria-pressed', String(on)); b.textContent = p.n + (on && s.perso ? ' (modifié)' : '');
        b.onclick = function () { if (on && !s.perso) return; var avant = JSON.stringify(s); s = A.choisirProfil(p.id); vierge = false; dessiner();
          toast("C'est noté. Ton accueil te ressemble", function () { s = JSON.parse(avant); A.ecrire(s); dessiner(); signal('profil'); }); signal('profil'); };
        P.appendChild(b);
      });
      var note = sp.querySelector('.mo-note'); if (vierge && !note) { note = el('p', 'mo-note', 'Choisis le profil qui te ressemble, puis ajuste tes outils.'); sp.insertBefore(note, P); } else if (!vierge && note) note.remove();
      var prof = A.profil(s.profil).blocs, BP = so.querySelector('ul'), BA = sa.querySelector('ul'); BP.textContent = ''; BA.textContent = '';
      s.blocs.forEach(function (x) { var o = OUTILS[x.id]; if (!o) return;
        (prof.indexOf(x.id) >= 0 ? BP : BA).appendChild(ligne(o[0], o[1], o[2], x.on, function (v) { x.on = v; s.perso = true; vierge = false; A.ecrire(s); toast("C'est noté. Ton accueil te ressemble"); signal('outil'); }));
      });
      sa.hidden = !BA.children.length;
    }
    function filtres() { if (!F) { sf.hidden = true; return; } var ul = sf.querySelector('ul'), f = F.lire(); ul.textContent = '';
      F.LISTE.forEach(function (x) { ul.appendChild(ligne(ICF[x.id] || '•', x.n, x.d, f.indexOf(x.id) >= 0, function (v) { f = F.lire().filter(function (i) { return i !== x.id; }); if (v) f.push(x.id); F.ecrire(f); toast("C'est noté. Les propositions te ressemblent"); signal('filtre'); })); });
    }
    var voir = el('a', 'mo-btn', 'Voir mon profil personnalisé'); voir.href = './';
    if (opt.voir) voir.onclick = function (e) { e.preventDefault(); opt.voir(); };
    var reset = el('button', 'mo-btn alt', 'Réinitialiser les outils du profil'); reset.type = 'button';
    reset.onclick = function () { var avant = JSON.stringify(s); s = A.choisirProfil(s.profil === 'tout' ? 'famille' : s.profil); dessiner();
      toast('Les outils du profil sont rétablis', function () { s = JSON.parse(avant); A.ecrire(s); dessiner(); signal('outil'); }); signal('outil'); };
    bt.appendChild(voir); bt.appendChild(reset);
    var vit = el('a', 'mo-vit', '👀 Revoir la présentation de Cookapli'); vit.href = './?vitrine=1'; bt.appendChild(vit);
    dessiner(); filtres();
  }
  window.CookMesOutils = { monter: monter, toast: toast };
})();
