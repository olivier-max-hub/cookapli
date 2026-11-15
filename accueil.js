/* Cookapli — accueil personnalisable par profils (partagé par index.html et perso.html)
   Chaque bloc de l'accueil a un identifiant. Un profil = une liste de blocs affichés, dans l'ordre.
   Le réglage de l'utilisateur est gardé sur son téléphone (localStorage « cookapli.accueil »).
   Ajouter un bloc plus tard : l'ajouter à BLOCS avec « depuis » (numéro de version Cookapli) et,
   si besoin, dans les profils qui l'affichent par défaut. Il sera annoncé sur l'accueil (« Nouveau »). */
(function () {
  var BLOCS = [
    { id: 'reserves', href: '../friscan/#frigo', n: 'Mes réserves', sel: '#t-have', depuis: 1 },
    { id: 'quecuisiner', href: '../friscan/#recettes', n: 'Que cuisiner avec mes réserves ?', sel: '#t-cook', depuis: 1 },
    { id: 'chrono', href: '../friscan/#chrono', n: '30 minutes chrono', sel: '#t-chrono', depuis: 1 },
    { id: 'antigaspi', n: 'Idées Anti gaspi', sel: '#t-gaspi', depuis: 1 },
    { id: 'courses', href: 'courses.html', n: 'Liste de courses', sel: '#t-courses', depuis: 1 },
    { id: 'equilibre', href: '../recettes/#equilibre', n: 'Équilibre alimentaire', sel: '#t-equilibre', depuis: 1 },
    { id: 'livre', href: '../recettes/', n: 'Livre de recettes', sel: '#t-recettes', depuis: 1 },
    { id: 'celebrations', n: 'Célébrations', sel: '#t-occasion', depuis: 1 },
    { id: 'batch', n: 'Batch cooking 3h', sel: 'section.batch', grand: 1, depuis: 1 },
    { id: 'saison', href: './#s-season', n: 'De saison ce mois-ci', sel: '#s-season', grand: 1, depuis: 1 },
    { id: 'inspiration', href: './#s-ideas', n: "Besoin d'inspiration ?", sel: '#s-ideas', grand: 1, depuis: 1 }
  ];
  var PROFILS = [
    { id: 'famille', n: 'Famille au quotidien', sub: 'Menus de la semaine et courses', blocs: ['reserves', 'batch', 'courses', 'quecuisiner', 'chrono', 'livre'] },
    { id: 'debutant', n: 'Je débute', sub: 'Des recettes simples et rapides', blocs: ['reserves', 'chrono', 'quecuisiner', 'livre', 'courses'] },
    { id: 'gourmand', n: 'Gourmand passionné', sub: 'Inspiration et repas de fête', blocs: ['reserves', 'celebrations', 'inspiration', 'livre', 'saison', 'equilibre'] },
    { id: 'antigaspi', n: 'Anti-gaspi, petit budget', sub: 'Rien ne se perd', blocs: ['reserves', 'antigaspi', 'quecuisiner', 'chrono', 'courses', 'livre'] },
    { id: 'tout', n: 'Tous les outils', sub: 'Tous les outils de Cookapli', blocs: BLOCS.map(function (b) { return b.id; }) }
  ];
  var CLE = 'cookapli.accueil';

  function bloc(id) { for (var i = 0; i < BLOCS.length; i++) if (BLOCS[i].id === id) return BLOCS[i]; return null; }
  function profil(id) { for (var i = 0; i < PROFILS.length; i++) if (PROFILS[i].id === id) return PROFILS[i]; return null; }
  /* blocs d'un profil : ceux du profil d'abord (affichés), puis les autres (masqués) */
  function preset(pid) {
    var p = profil(pid) || profil('tout');
    return p.blocs.map(function (id) { return { id: id, on: true }; })
      .concat(BLOCS.filter(function (b) { return p.blocs.indexOf(b.id) < 0; }).map(function (b) { return { id: b.id, on: false }; }));
  }
  function lire() {
    var s = null;
    try { s = JSON.parse(localStorage.getItem(CLE) || 'null'); } catch (e) { s = null; }
    if (!s || !s.profil || !profil(s.profil)) return null;
    /* blocs inconnus retirés, blocs manquants ajoutés à la fin (masqués) : ils seront annoncés comme nouveautés */
    var vus = {};
    s.blocs = (s.blocs || []).filter(function (x) { if (!bloc(x.id) || vus[x.id]) return false; vus[x.id] = 1; return true; });
    BLOCS.forEach(function (b) { if (!vus[b.id]) s.blocs.push({ id: b.id, on: false }); });
    s.connus = s.connus || BLOCS.map(function (b) { return b.id; });
    /* accueil non modifié : il suit toujours la version actuelle de son profil */
    if (!s.perso) { var connus = s.connus; s.blocs = preset(s.profil); s.blocs.forEach(function (x) { if (connus.indexOf(x.id) < 0) x.on = false; }); }
    return s;
  }
  function ecrire(s) { try { localStorage.setItem(CLE, JSON.stringify(s)); } catch (e) {} }
  function choisirProfil(pid) {
    var s = { v: 1, profil: pid, perso: false, blocs: preset(pid), connus: BLOCS.map(function (b) { return b.id; }) };
    ecrire(s); return s;
  }
  /* nouveautés : blocs que l'utilisateur ne connaît pas encore.
     S'il n'a rien modifié et que son profil prévoit le bloc, il apparaît tout seul (et reste annoncé). */
  function nouveautes(s) {
    var p = profil(s.profil), out = [];
    BLOCS.forEach(function (b) {
      if (s.connus.indexOf(b.id) >= 0) return;
      var x = s.blocs.filter(function (y) { return y.id === b.id; })[0];
      if (!s.perso && p.blocs.indexOf(b.id) >= 0) s.blocs = preset(s.profil);
      out.push({ bloc: b, affiche: !!(x && x.on) || (!s.perso && p.blocs.indexOf(b.id) >= 0) });
    });
    return out;
  }
  function marquerConnu(s, id, ajouter) {
    if (s.connus.indexOf(id) < 0) s.connus.push(id);
    if (ajouter) {
      s.blocs = s.blocs.filter(function (x) { return x.id !== id; }); s.blocs.push({ id: id, on: true }); s.perso = true;
    }
    ecrire(s);
  }

  window.CookAccueil = { BLOCS: BLOCS, PROFILS: PROFILS, bloc: bloc, profil: profil, preset: preset, lire: lire, ecrire: ecrire, choisirProfil: choisirProfil, nouveautes: nouveautes, marquerConnu: marquerConnu };
})();
