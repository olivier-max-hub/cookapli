/* Cookapli — informations batch cooking d'une recette (données : cookapli/batch.json, classement validé).
   CookBatch.monter(conteneur, nomRecette) remplit le conteneur avec l'encadré « Batch cooking ». */
(function () {
  var URL_DONNEES = new URL('batch.json?v=2', document.currentScript ? document.currentScript.src : location.href).href;
  var donnees = null, attente = null;
  function norm(x) { return String(x || '').replace(/œ/gi, 'oe').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]/g, ''); }
  function charger() {
    if (donnees) return Promise.resolve(donnees);
    if (!attente) attente = fetch(URL_DONNEES).then(function (r) { return r.json(); }).then(function (j) {
      donnees = {}; (j.recettes || []).forEach(function (e) { donnees[norm(e.n)] = e; }); return donnees;
    }).catch(function () { attente = null; return null; });
    return attente;
  }
  function info(nom) { return donnees ? donnees[norm(nom)] || null : null; }
  var CSS = '.bcard{margin:14px 0 0;background:#eef7f0;border:1px solid #b9dcc4;border-radius:16px;padding:12px 14px;color:#1f3a2a}' +
    '.bcard h3{margin:0 0 6px;font-size:1.05rem;color:#1f6b3d}.bcard ul{margin:0;padding:0;list-style:none;display:grid;gap:4px}' +
    '.bcard li{display:flex;gap:8px;align-items:flex-start;font-weight:600;line-height:1.3}.bcard li>span:first-child{flex:none;width:1.4em;text-align:center}' +
    '.bcard .bfin{margin:8px 0 0;background:#fff;border-radius:12px;padding:8px 10px;font-weight:700}.bcard.non{background:#f4f4f2;border-color:#ddd;color:#444}.bcard.non h3{color:#555}';
  function style() { if (document.getElementById('bCss')) return; var s = document.createElement('style'); s.id = 'bCss'; s.textContent = CSS; document.head.appendChild(s); }
  function esc(x) { return String(x).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function html(e) {
    if (!e || e.type === 'dessert') return '';
    var L = [];
    if (e.tenue === 'jourmeme') return '<div class="bcard non"><h3>🍱 Batch cooking</h3><ul><li><span>⏰</span><span>À cuisiner au moment de manger : ce plat ne se prépare pas à l\'avance.</span></li></ul></div>';
    L.push(['🧊', e.tenue === 'ideale' ? 'Se prépare à l\'avance : 3 à 4 jours au frigo, se réchauffe bien.' : 'Se prépare à l\'avance : 1 à 2 jours au frigo.']);
    L.push(['❄️', e.congele ? 'Se congèle (jusqu\'à 3 mois) : idéal pour la fin de semaine.' : 'Ne se congèle pas : à manger en début de semaine.']);
    L.push(['🔥', { four: 'Cuisson au four.', plaque: 'Cuisson sur les feux.', cru: 'Sans cuisson.', friture: 'Cuisson en friture.' }[e.cuisson] || '']);
    return '<div class="bcard"><h3>🍱 Batch cooking</h3><ul>' + L.filter(function (x) { return x[1]; }).map(function (x) { return '<li><span>' + x[0] + '</span><span>' + esc(x[1]) + '</span></li>'; }).join('') + '</ul>' +
      (e.fin ? '<p class="bfin">Le jour même : ' + esc(e.fin) + '</p>' : '') + '</div>';
  }
  function monter(box, nom) {
    if (!box) return; style();
    charger().then(function () { if (box.isConnected !== false) box.innerHTML = html(info(nom)); });
  }
  window.CookBatch = { charger: charger, info: info, html: html, monter: monter };
})();
