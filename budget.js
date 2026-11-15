/* Cookapli — budget estimé des recettes (outil indicatif)
   Les prix moyens viennent de prix.json (euros par kilo ou par litre), mis à jour chaque mois
   avec Open Prices (Open Food Facts, licence ODbL). Le coût d'une recette = somme des
   ingrédients (grammes × prix au kilo), divisée par le nombre de personnes.
   On affiche un niveau (€, €€, €€€) plutôt qu'un prix précis : les prix changent selon le
   magasin, la région et la marque. Utilisé par le Livre de recettes et Friscan. */
(function () {
  var base = (document.currentScript && document.currentScript.src || '').replace(/budget\.js.*$/, '');
  var PRIX = null, attente = null;

  var SEUILS = [[1.5, '€', 'Petit budget'], [3, '€€', 'Budget moyen'], [Infinity, '€€€', 'Plus cher']]; /* euros par personne */
  var AVERT = 'Estimation indicative : le budget est calculé automatiquement à partir des ingrédients et de prix moyens relevés en France. Les prix varient selon le magasin, la région et la marque.';

  function charger() {
    if (!attente) attente = fetch(base + 'prix.json?m=' + new Date().toISOString().slice(0, 7))
      .then(function (r) { if (!r.ok) throw 0; return r.json(); })
      .then(function (d) { PRIX = d; return d; })
      .catch(function () { return null; });
    return attente;
  }
  function pret() { return !!PRIX; }
  function prixKg(id) { var p = PRIX && PRIX.p && PRIX.p[id]; return p && p.e > 0 ? p.e : null; }
  function niveau(pp) {
    for (var i = 0; i < SEUILS.length; i++) if (pp < SEUILS[i][0]) return { s: SEUILS[i][1], t: SEUILS[i][2], n: i + 1 };
  }
  /* fourchette arrondie à l'euro, pour un total */
  function fourchette(tot) {
    var a = Math.max(1, Math.floor(tot * 0.8)), b = Math.max(a + 1, Math.ceil(tot * 1.2));
    return 'environ ' + a + ' à ' + b + ' €';
  }
  function dateMaj() {
    if (!PRIX || !PRIX.maj) return '';
    var m = PRIX.maj.split('-'), mois = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
    return mois[+m[1] - 1] + ' ' + m[0];
  }
  function euros(x) { return (Math.round(x * 10) / 10).toFixed(2).replace('.', ',') + ' €'; }

  /* grammes d'un ingrédient Friscan à partir de sa quantité écrite (« 200 g », « 2 à 3 », « 1 boîte »…) ;
     renvoie {g, st} avec st = ok | neg (quantité négligeable ou condiment) | nq (impossible à lire) */
  var CONDIMENTS = /^(?:sel|poivre|epices|herbes|herbes_seches|huile|vinaigre|piment|ail|moutarde|sauce_soja|bouillon|levure|levure_boulangere|vanille|eau_fleur|gelatine|sucre|farine|cafe)$/;
  var NEG = /^(?:un peu|1 peu|peu|pincees?|une pincee|1 pincee|selon (?:les )?gouts?|facultatif|qs|q\.s\.|a volonte|filet|un filet|1 filet|trait|un trait|1 trait)\b/;
  var UNITES = [[/^kg\b/, 1000, 1], [/^(?:g|gr|grammes?)\b/, 1, 1], [/^(?:l|litres?)\b/, 1000, 1], [/^cl\b/, 10, 1], [/^ml\b/, 1, 1],
    [/^(?:c\.? ?a\.? ?s\.?|cs|cuill?eres? a soupe|c\. a soupe)/, 15], [/^(?:c\.? ?a\.? ?c\.?|cc|cuill?eres? a cafe|c\. a cafe)/, 5],
    [/^(?:petites? )?boites?\b/, 0, 'boite'], [/^poignees?\b/, 30], [/^noix\b/, 10], [/^noisettes?\b/, 5], [/^portions?\b/, 20], [/^steaks?\b/, 120],
    [/^(?:cotes?|escalopes?)\b/, 150], [/^cm\b/, 5], [/^tranches?\b/, 0, 'tranche'], [/^tasses?\b/, 150], [/^verres?\b/, 200], [/^boudoirs?\b/, 6], [/^sachets?\b/, 10], [/^bottes?\b/, 150],
    [/^bouquets?\b/, 20], [/^brins?\b/, 1], [/^feuilles?\b/, 1], [/^dizaines?\b/, 0, 'dizaine'], [/^pots?\b/, 125], [/^briques?\b/, 200]];
  var BOITE = { thon: 140, sardines: 100, maquereau: 120, mais: 140, haricots_rouges: 250, haricots_blancs: 250, pois_chiches: 250, lentilles: 250, sauce_tomate: 400, lait_coco: 400 };
  function norm(s) { return String(s || '').toLowerCase().replace(/½/g, ' 1/2').replace(/¼/g, ' 1/4').replace(/¾/g, ' 3/4').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/œ/g, 'oe').replace(/\s+/g, ' ').trim(); }
  function nombre(s) {
    s = s.replace(/^(?:une?|1) demie?\b/, '0.5').replace(/^quelques\b/, '3').replace(/^(?:une?)\b/, '1');
    var m = s.match(/^(\d+(?:[.,]\d+)?)(?:\s+(\d+)\/(\d+)|\s*\/\s*(\d+))?(?:\s*(?:a|-|ou)\s*(\d+(?:[.,]\d+)?))?/);
    if (!m) { m = s.match(/^(\d+)\/(\d+)/); if (m) return { v: +m[1] / +m[2], reste: s.slice(m[0].length).trim() }; return null; }
    var v = parseFloat(m[1].replace(',', '.'));
    if (m[2]) v += +m[2] / +m[3];
    if (m[4]) v = v / +m[4];
    if (m[5]) v = (v + parseFloat(m[5].replace(',', '.'))) / 2;
    return { v: v, reste: s.slice(m[0].length).trim() };
  }
  function grammes(qty, d, id) {
    var s = norm(qty).replace(/\(.*?\)/g, '').trim(), cond = CONDIMENTS.test(id || '');
    if (!s) return { g: 0, st: cond ? 'neg' : 'nq' };
    if (NEG.test(s)) return { g: 0, st: 'neg' };
    var parts = s.split(/\s*\+\s*/), tot = 0;
    for (var i = 0; i < parts.length; i++) {
      var n = nombre(parts[i]);
      if (!n) { if (cond) continue; return { g: 0, st: 'nq' }; }
      var r = n.reste.replace(/^(?:de |d')/, ''), v = n.v, g = null;
      for (var j = 0; j < UNITES.length && g == null; j++) if (UNITES[j][0].test(r)) g = UNITES[j][2] === 'boite' ? v * (BOITE[id] || 250) : UNITES[j][2] === 'tranche' ? v * (d && d.pu || 25) : UNITES[j][2] === 'dizaine' ? v * 10 * (d && d.pu || 5) : v * UNITES[j][1];
      if (g == null) g = d && d.pu ? v * d.pu : (d && d.u === 'p') ? v * 100 : v >= 20 ? v : null;
      if (g == null) return { g: 0, st: 'nq' };
      tot += g;
    }
    return { g: tot, st: 'ok' };
  }

  /* recette Friscan : ing = [[id, quantité, facultatif?, libellé?], …] pour r.pers personnes */
  function recetteFriscan(r, ING) {
    if (!PRIX || !r || !r.ing || !r.pers) return null;
    var tot = 0, ok = 0, ko = 0;
    r.ing.forEach(function (x) {
      if (x[2]) return; /* ingrédient facultatif : non compté */
      var d = ING[x[0]], a = grammes(x[1], d, x[0]), e = prixKg(x[0]);
      if (a.st === 'neg') { ok++; return; }
      if (a.st !== 'ok' || e == null) { ko++; return; }
      tot += a.g / 1000 * e; ok++;
    });
    if (!ok || ko * 3 > ok || tot <= 0) return null;
    return { tot: tot, pers: r.pers, pp: tot / r.pers, niv: niveau(tot / r.pers) };
  }

  /* calories d'une recette Friscan (kcal pour 100 g du référentiel ING), par personne, arrondies à 10 ; 0 si impossible.
     Ne dépend pas des prix : utilisable même si prix.json n'est pas chargé. Outil indicatif, sans valeur médicale. */
  function kcalFriscan(r, ING) {
    if (!r || !r.ing || !r.pers) return 0;
    var tot = 0, ok = 0, ko = 0;
    r.ing.forEach(function (x) {
      if (x[2]) return;
      var d = ING[x[0]], a = grammes(x[1], d, x[0]);
      if (a.st === 'neg') { ok++; return; }
      if (a.st !== 'ok' || !d || d.kc == null) { ko++; return; }
      tot += a.g * d.kc / 100; ok++;
    });
    if (!ok || ko * 3 > ok || tot <= 0 || tot / r.pers > 3000) return 0;
    return Math.max(10, Math.round(tot / r.pers / 10) * 10);
  }

  window.CookBudget = { kcalFriscan: kcalFriscan, charger: charger, pret: pret, prixKg: prixKg, niveau: niveau, fourchette: fourchette, dateMaj: dateMaj, euros: euros, grammes: grammes, recetteFriscan: recetteFriscan, AVERT: AVERT };
})();
