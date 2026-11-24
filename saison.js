/* Cookapli · produits de saison (France) — liste commune à toutes les pages.
   CookSaison.ok(texte) : vrai si le texte contient un produit de saison ce mois-ci. */
(function(){
  var SEASON=[
    [["🥬","Poireau"],["🥬","Chou"],["🥦","Chou-fleur"],["🥔","Céleri"],["🥗","Endive"],["🥔","Navet"],["🥕","Panais"],["🥗","Mâche"],["🎃","Courge"],["🟣","Betterave"],["🍊","Orange"],["🍊","Clémentine"],["🥝","Kiwi"],["🍎","Pomme"],["🍐","Poire"]],
    [["🥬","Poireau"],["🥬","Chou"],["🥦","Chou-fleur"],["🥔","Céleri"],["🥗","Endive"],["🥔","Navet"],["🥕","Panais"],["🥗","Mâche"],["🎃","Courge"],["🟣","Betterave"],["🍊","Orange"],["🍊","Clémentine"],["🥝","Kiwi"],["🍎","Pomme"],["🍐","Poire"]],
    [["🥬","Poireau"],["🥬","Chou"],["🥦","Chou-fleur"],["🥔","Céleri"],["🥗","Endive"],["🥔","Navet"],["🌿","Épinard"],["🔴","Radis"],["🥗","Mâche"],["🟣","Betterave"],["🍊","Orange"],["🥝","Kiwi"],["🍎","Pomme"]],
    [["🌱","Asperge"],["🔴","Radis"],["🌿","Épinard"],["🌸","Rhubarbe"],["🍓","Fraise"],["🥬","Salade"],["🥗","Endive"],["🥬","Poireau"],["🥦","Chou-fleur"],["🥝","Kiwi"],["🍎","Pomme"]],
    [["🌱","Asperge"],["🌼","Artichaut"],["🫛","Petits pois"],["🔴","Radis"],["🌿","Épinard"],["🍓","Fraise"],["🌸","Rhubarbe"],["🍒","Cerise"],["🥒","Concombre"],["🥬","Salade"],["🍎","Pomme"]],
    [["🥒","Courgette"],["🍅","Tomate"],["🍆","Aubergine"],["🫛","Haricot vert"],["🫛","Petits pois"],["🥒","Concombre"],["🌼","Artichaut"],["🥦","Brocoli"],["🌿","Fenouil"],["🥬","Blette"],["🍓","Fraise"],["🍒","Cerise"],["🍑","Abricot"],["🫐","Framboise"],["🍈","Melon"],["🍑","Pêche"]],
    [["🍅","Tomate"],["🥒","Courgette"],["🍆","Aubergine"],["🫑","Poivron"],["🫛","Haricot vert"],["🥒","Concombre"],["🥦","Brocoli"],["🥬","Blette"],["🟣","Betterave"],["🍑","Abricot"],["🍑","Pêche"],["🍈","Melon"],["🫐","Framboise"],["🫐","Myrtille"],["🟣","Prune"],["🍒","Cerise"]],
    [["🍅","Tomate"],["🥒","Courgette"],["🍆","Aubergine"],["🫑","Poivron"],["🫛","Haricot vert"],["🌽","Maïs"],["🥒","Concombre"],["🥦","Brocoli"],["🍈","Melon"],["🍑","Pêche"],["🟣","Prune"],["🟣","Figue"],["🫐","Myrtille"],["🍇","Raisin"],["🍐","Poire"],["🍎","Pomme"]],
    [["🍅","Tomate"],["🥒","Courgette"],["🍆","Aubergine"],["🫑","Poivron"],["🎃","Courge"],["🍄","Champignons"],["🥦","Brocoli"],["🥔","Céleri"],["🥬","Chou"],["🌿","Fenouil"],["🌿","Épinard"],["🍠","Patate douce"],["🍇","Raisin"],["🟣","Figue"],["🟣","Prune"],["🍐","Poire"],["🍎","Pomme"]],
    [["🎃","Courge"],["🎃","Potiron"],["🍄","Champignons"],["🥬","Poireau"],["🥬","Chou"],["🥦","Chou-fleur"],["🥦","Brocoli"],["🥔","Céleri"],["🌿","Épinard"],["🥗","Endive"],["🥔","Navet"],["🍠","Patate douce"],["🫑","Poivron"],["🌰","Châtaigne"],["🍎","Pomme"],["🍐","Poire"],["🍇","Raisin"],["🍐","Coing"]],
    [["🎃","Butternut"],["🎃","Potiron"],["🥬","Poireau"],["🥬","Chou"],["🥬","Chou de Bruxelles"],["🥦","Chou-fleur"],["🥔","Céleri"],["🥗","Endive"],["🌿","Épinard"],["🥔","Navet"],["🥕","Panais"],["🍠","Patate douce"],["🌰","Châtaigne"],["🍎","Pomme"],["🍐","Poire"],["🍊","Clémentine"],["🥝","Kiwi"]],
    [["🥬","Chou"],["🥬","Chou de Bruxelles"],["🥦","Chou-fleur"],["🥬","Poireau"],["🥔","Céleri"],["🥗","Endive"],["🥔","Navet"],["🥕","Panais"],["🎃","Courge"],["🍠","Patate douce"],["🥗","Mâche"],["🌰","Châtaigne"],["🍊","Clémentine"],["🍊","Orange"],["🥝","Kiwi"],["🍎","Pomme"],["🍐","Poire"]]
  ];
  var SYN={courge:["courge(?!tte)","butternut","potiron","potimarron"],potiron:["potiron","potimarron","courge(?!tte)"],butternut:["butternut","courge(?!tte)"],champignons:["champignon","cepe","girolle"],"petits pois":["petits pois","petit pois"],"haricot vert":["haricots verts","haricot vert"],chou:["chou(?! fleur| de bruxelles)\\b","choux(?! de bruxelles)"],"chou fleur":["chou fleur"],"chou de bruxelles":["bruxelles"],pomme:["pommes?\\b(?! de terre)"],poire:["poires?\\b"],salade:["laitue","salade verte","roquette","batavia","feuilles? de salade","jeunes pousses"],tomate:["tomates?(?! sech)(?! conc)"],prune:["prunes?\\b","mirabelle","quetsche"],framboise:["framboise","fruits rouges","mures?\\b"],mais:["mais (en grains|doux)","grains de mais"],orange:["oranges?(?!r)"],mache:["mache\\b"],blette:["blettes?","bettes?\\b"],fenouil:["(?<!graines de )fenouil"],endive:["endive","chicon"],cerise:["(?<!tomates? )cerise"],raisin:["raisins?(?! sec)"],clementine:["clementine","mandarine"],chataigne:["chataigne","marron"],"patate douce":["patates? douces?"],myrtille:["myrtille","cassis"],peche:["peche","nectarine"],celeri:["celeri"],epinard:["epinard"],navet:["navet","topinambour"]};
  var MOIS=["janvier","février","mars","avril","mai","juin","juillet","août","septembre","octobre","novembre","décembre"];
  var m=new Date().getMonth();
  function nrm(x){return String(x||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[_-]+/g," ")}
  var RX=SEASON[m].map(function(p){var k=nrm(p[1]);return (SYN[k]||[k.replace(/s$/,"")]).map(function(w){return new RegExp("\\b"+w)})});
  function ok(t){t=" "+nrm(t)+" ";return RX.some(function(L){return L.some(function(r){return r.test(t)})})}
  function texteFiche(n,f){return (n||"")+" "+(f&&f.ing?f.ing.map(function(i){return i.t||""}).join(" "):"")}
  function texteRapide(r,ING){return r.n+" "+(r.ing||[]).map(function(i){return i[0]+" "+(i[3]||"")+" "+(ING&&ING[i[0]]?ING[i[0]].n:"")}).join(" ")}
  var BADGE='<span class="saison-tag" style="display:inline-block;align-self:flex-start;width:max-content;background:#ffe3c2;color:#000;font-weight:700;font-size:.72rem;border-radius:999px;padding:2px 8px;line-height:1.4">🍂 De saison</span>';
  /* tri stable : de saison d'abord, l'ordre existant est gardé à l'intérieur de chaque groupe */
  function trier(list,txt){var a=[],b=[];list.forEach(function(x){(ok(txt(x))?a:b).push(x)});return a.concat(b)}
  window.CookSaison={SEASON:SEASON,mois:m,nomMois:MOIS[m],produits:SEASON[m].map(function(p){return p[1]}),ok:ok,texteFiche:texteFiche,texteRapide:texteRapide,trier:trier,BADGE:BADGE};
})();
