/* Cookapli — préférences alimentaires (partagé par l'accueil, Friscan et le Livre de recettes).
   Réglage gardé sur le téléphone (localStorage « cookapli.filtres »), choisi dans perso.html.
   Le repérage se fait à partir des ingrédients des recettes. Il est volontairement prudent
   (une recette douteuse est écartée), mais il ne remplace pas la lecture des étiquettes. */
(function () {
  var CLE = 'cookapli.filtres';
  var LISTE = [
    { id: 'vege', n: 'Végétarien', court: 'végétarien', g: 'regime', d: 'Sans viande ni poisson' },
    { id: 'vegan', n: 'Végan', court: 'végan', g: 'regime', d: 'Aucun produit animal (ni lait, ni œufs, ni miel)' },
    { id: 'gluten', n: 'Sans gluten', court: 'sans gluten', g: 'allergie', d: 'Blé, seigle, orge, pâtes, pain…' },
    { id: 'coque', n: 'Sans fruits à coque', court: 'sans fruits à coque', g: 'allergie', d: 'Noix, amandes, noisettes, pistaches…' },
    { id: 'arachide', n: 'Sans arachides', court: 'sans arachides', g: 'allergie', d: 'Cacahuètes, huile d\'arachide…' },
    { id: 'poisson', n: 'Sans poisson', court: 'sans poisson', g: 'allergie', d: 'Saumon, thon, cabillaud, anchois…' },
    { id: 'fruitsmer', n: 'Sans fruits de mer', court: 'sans fruits de mer', g: 'allergie', d: 'Crevettes, moules, crabe, huîtres, calamars…' }
  ];
  function norm(s) {
    return ' ' + String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
      .replace(/œ/g, 'oe').replace(/æ/g, 'ae').replace(/[’'`\-_]/g, ' ').replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ') + ' ';
  }
  function re(mots) { return new RegExp(' (?:' + mots.join('|') + ')'); }
  /* produits de la mer */
  var POISSON = ['poisson', 'saumon', 'thon', 'cabillaud', 'colin', 'merlu', 'lieu', 'dorade', 'daurade', 'bar ', 'loup de mer', 'sole', 'truite', 'sardine', 'maquereau', 'hareng', 'anchois', 'morue', 'haddock', 'eglefin', 'lotte', 'raie', 'turbot', 'fletan', 'espadon', 'tilapia', 'perche', 'sandre', 'brochet', 'carpe', 'rouget', 'saint pierre', 'merlan', 'surimi', 'oeufs? de lump', 'tarama', 'nuoc mam', 'sauce poisson', 'sauce de poisson', 'fumet de poisson', 'bonite', 'dashi'];
  var FDM = ['crevette', 'gambas', 'langoustine', 'homard', 'langouste', 'crabe', 'tourteau', 'ecrevisse', 'moule', 'huitre', 'palourde', 'saint jacques', 'st jacques', 'noix de saint', 'petoncle', 'bulot', 'bigorneau', 'calamar', 'calmar', 'encornet', 'seiche', 'poulpe', 'oursin', 'fruits? de mer'];
  var MER = POISSON.concat(FDM);
  var VIANDE = ['viande', 'boeuf', 'veau', 'porc', 'cochon', 'agneau', 'mouton', 'chevreau', 'cheval', 'gibier', 'chevreuil', 'sanglier', 'lapin', 'lievre', 'poulet', 'poule ', 'poularde', 'chapon', 'coquelet', 'pintade', 'dinde', 'dindonneau', 'canard', 'oie ', 'caille', 'pigeon', 'volaille', 'magret', 'foie', 'foies', 'gesier', 'rognon', 'jambon', 'lardon', 'lard ', 'bacon', 'pancetta', 'coppa', 'speck', 'chorizo', 'saucisse', 'saucisson', 'merguez', 'chipolata', 'andouille', 'boudin', 'rillette', 'pate de foie', 'pate de campagne', 'pate en croute', 'steak', 'escalope', 'cote de', 'cotes de', 'cotelette', 'gigot', 'epaule', 'filet mignon', 'roti', 'entrecote', 'bavette', 'onglet', 'paleron', 'jarret', 'joue de', 'queue de boeuf', 'osso', 'blanc de poulet', 'cuisse', 'aiguillette', 'chair a saucisse', 'gelatine', 'saindoux', 'graisse de canard', 'graisse d oie', 'bouillon de boeuf', 'bouillon de volaille', 'bouillon de poule', 'fond de veau', 'fond de volaille', 'cube de volaille', 'kebab', 'nugget', 'knack', 'strasbourg', 'mortadelle', 'bresaola', 'serrano', 'prosciutto', 'parme '];
  var LAIT = ['lait(?! de coco| d amande| de soja| d avoine| de riz| vegetal| de noisette| de cajou)', 'laitage', 'lactose', 'beurre(?! de cacahuete| d arachide| de cacahuetes)', 'creme(?! de coco| vegetale| de soja| d avoine| de marron| de cassis| de balsamique)', 'creme fraiche', 'chantilly', 'fromage(?! vegetal)', 'yaourt(?! vegetal| de soja)', 'yogourt', 'skyr', 'kefir', 'petit suisse', 'faisselle', 'ricotta', 'mascarpone', 'mozzarella', 'burrata', 'parmesan', 'parmigiano', 'grana', 'pecorino', 'emmental', 'gruyere', 'comte', 'beaufort', 'cheddar', 'gouda', 'edam', 'mimolette', 'raclette', 'reblochon', 'tomme', 'cantal', 'saint nectaire', 'camembert', 'brie', 'coulommiers', 'munster', 'maroilles', 'roquefort', 'bleu d', 'gorgonzola', 'feta', 'chevre', 'saint moret', 'boursin', 'kiri', 'vache qui rit', 'cancoillotte', 'halloumi', 'cottage', 'quark', 'fromage blanc', 'bechamel', 'ghee', 'lait concentre', 'dulce de leche', 'caramel au beurre', 'ganache', 'brioche', 'croissant', 'gratine', 'pate feuilletee', 'pate brisee', 'pate sablee', 'chocolat au lait', 'chocolat blanc'];
  var OEUF = ['oeuf', 'jaunes? d oeuf', 'blancs? d oeuf', 'blancs en neige', 'mayonnaise', 'mayo ', 'aioli', 'meringue', 'brioche', 'pate fraiche', 'tagliatelle', 'nouilles aux oeufs', 'biscuit', 'genoise', 'creme anglaise', 'flan', 'quiche'];
  var GLUTEN = ['farine(?! de riz| de mais| de sarrasin| de pois chiche| de chataigne| de coco| d amande| de lentille| de quinoa| sans gluten| de millet)', 'ble ', 'ble$', 'froment', 'epeautre', 'seigle', 'orge', 'avoine', 'kamut', 'triticale', 'seitan', 'pates?(?! d amande| de fruit| de pistache| de curry| de piment| de tomate| de sesame| de cacahuete| a tartiner)', 'spaghetti', 'tagliatelle', 'penne', 'fusilli', 'farfalle', 'macaroni', 'coquillette', 'linguine', 'lasagne', 'ravioli', 'gnocchi', 'tortellini', 'cannelloni', 'vermicelle', 'nouille', 'udon', 'ramen', 'semoule', 'couscous', 'boulgour', 'bulgur', 'pain', 'baguette', 'brioche', 'croissant', 'chapelure', 'panure', 'biscotte', 'crouton', 'biscuit', 'speculoos', 'boudoir', 'gateaux? cuill', 'biscuits? a la cuill', 'bun', 'buns', 'muffin anglais', 'genoise', 'pate brisee', 'pate feuilletee', 'pate sablee', 'pate a pizza', 'feuille de brick', 'brick', 'filo', 'tortilla', 'wrap', 'galette de ble', 'crepe', 'blini', 'gaufre', 'biere', 'sauce soja', 'soja sauce', 'tamari', 'roux', 'bechamel', 'levure de biere', 'bouillon cube', 'cube de bouillon', 'cubes? de volaille', 'cubes? de legumes', 'bouillon'];
  var COQUE = ['noix(?! de coco| de muscade| de saint| de st| de beurre| de veau| d entrecote)', 'cerneaux', 'amande', 'noisette', 'pistache', 'cajou', 'pecan', 'macadamia', 'noix du bresil', 'praline', 'pralin', 'nougat', 'frangipane', 'massepain', 'gianduja', 'nutella', 'pate a tartiner', 'pignon', 'fruits secs', 'fruits a coque', 'amaretto', 'orgeat', 'lait d amande', 'poudre d amande'];
  var ARACHIDE = ['arachide', 'cacahuete', 'cacahouete', 'beurre de cacahuete', 'peanut', 'sate', 'satay', 'huile d arachide'];
  var ANIMAL = ['miel', 'gelatine', 'colle de poisson', 'saindoux', 'suif', 'presure', 'cochenille'];
  var R = {
    poisson: re(POISSON),
    fruitsmer: re(FDM),
    vege: re(VIANDE.concat(MER)),
    vegan: re(VIANDE.concat(MER, LAIT, OEUF, ANIMAL)),
    gluten: re(GLUTEN),
    lait: re(LAIT),
    oeuf: re(OEUF),
    coque: re(COQUE),
    arachide: re(ARACHIDE)
  };
  function lire() { try { var f = JSON.parse(localStorage.getItem(CLE) || 'null') || [], ids = LISTE.map(function (x) { return x.id; }), out = []; f.forEach(function (id) { (id === 'mer' ? ['poisson', 'fruitsmer'] : [id]).forEach(function (k) { if (ids.indexOf(k) >= 0 && out.indexOf(k) < 0) out.push(k); }); }); return out; } catch (e) { return []; } }
  function ecrire(f) { try { localStorage.setItem(CLE, JSON.stringify(f || [])); } catch (e) {} }
  /* raisons pour lesquelles un texte d'ingrédients ne convient pas (liste vide = ça convient) */
  function raisons(texte, f) {
    f = f || lire(); var t = norm(texte), out = [], vg = t.indexOf(' vgnok ') >= 0;
    f.forEach(function (id) { if (vg && /^(vege|vegan|poisson|fruitsmer)$/.test(id)) return; var r = R[id]; if (r && r.test(t)) out.push(id); });
    return out;
  }
  function ok(texte, f) { return raisons(texte, f).length === 0; }
  /* recette rapide de Friscan : ing = [[id, quantité, unité, précision], …] */
  function texteFriscan(r, ING) {
    return [r.n].concat((r.ing || []).map(function (i) { var g = ING && ING[i[0]]; return (g ? g.n : String(i[0]).replace(/_/g, ' ')) + ' ' + (i[3] || ''); })).join(' , ');
  }
  /* fiche du Livre : ing = [{t: '200 g de farine'}, …] ; sans fiche, on ne peut pas savoir */
  /* type = colonne « Type » du tableau : « Vegan » vaut garantie (végan, végétarien, sans poisson ni fruits de mer) */
  function texteFiche(nom, fiche, type) {
    if (!fiche || !fiche.ing || !fiche.ing.length) return null;
    return (/vegan/i.test(type || '') ? ' vgnok , ' : '') + [nom].concat(fiche.ing.map(function (i) { return typeof i === 'string' ? i : (i.t || ''); })).join(' , ');
  }
  function okTexte(t, f) { f = f || lire(); if (!f.length) return true; if (t == null) return false; return ok(t, f); }
  function libelle(f) { f = f || lire(); return f.map(function (id) { for (var i = 0; i < LISTE.length; i++) if (LISTE[i].id === id) return LISTE[i].court; return id; }).join(', '); }
  /* recettes avec des œufs crus : un avertissement s'affiche sur la fiche (règle d'Olivier, 18/11/2026 : à vérifier pour chaque nouvelle recette ;
     ajouter le nom ici, ou « crus: 1 » sur une recette rapide de Friscan) */
  var CRUS = re(['tiramisu', 'tirami su', 'glacage royal', 'glacage choux', 'nougat glace', 'cheesecake au citron sans cuisson', 'mousse au chocolat(?! aquafaba)', 'mayonnaise maison', 'aioli', 'steak tartare', 'tartare de boeuf']);
  var AVERT_CRUS = '⚠️ Œufs crus : déconseillé aux femmes enceintes, aux jeunes enfants, aux personnes âgées ou fragiles. Prends des œufs très frais et garde la préparation au frigo.';
  function oeufsCrus(nom, flag) { return !!flag || CRUS.test(norm(nom)); }
  window.CookFiltres = { LISTE: LISTE, oeufsCrus: oeufsCrus, AVERT_CRUS: AVERT_CRUS, lire: lire, ecrire: ecrire, raisons: raisons, ok: ok, okTexte: okTexte, texteFriscan: texteFriscan, texteFiche: texteFiche, libelle: libelle, norm: norm };
})();
