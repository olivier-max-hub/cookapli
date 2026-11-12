/* Cookapli — commentaire commun à toutes les pages (actuelles et futures).
   - Bouton « Commentaire » avec la toque : en haut à droite sur grand écran, flottant (déplaçable) sur téléphone.
   - Section repliée : seul le texte « Laisser un commentaire » est visible ; le formulaire s'ouvre quand on appuie dessus.
   - Un seul texte de confidentialité, sous le bouton « Envoyer ».
   À ajouter en bas de chaque nouvelle page, après friscan/data.js (qui fournit l'adresse MES_RECETTES.comment) :
     <script src="../cookapli/commentaire.js" data-context="Cookapli · Nom de la page" data-extra="Phrase de confidentialité propre à la page (facultatif)"></script>
   Options : data-header="sélecteur" (où placer le bouton du haut), data-after="sélecteur" (où placer la section). */
(function () {
  "use strict";
  var me = document.currentScript || {};
  var ds = me.dataset || {};
  var URL_ = ""; try { URL_ = (typeof MES_RECETTES !== "undefined" && MES_RECETTES.comment) || ""; } catch (x) {}
  if (!URL_) return;
  var CTX = ds.context || document.title || "Cookapli";
  var TOQUE = '<svg viewBox="0 0 100 100" aria-hidden="true" focusable="false"><g stroke="#0f6b78" stroke-width="3" stroke-linejoin="round"><circle cx="30" cy="27" r="16" fill="#fff"/><circle cx="50" cy="19" r="19" fill="#fff"/><circle cx="70" cy="27" r="16" fill="#fff"/><circle cx="50" cy="66" r="28" fill="#fbd9b5"/><rect x="25" y="36" width="50" height="14" rx="5" fill="#d9f0f3"/></g><circle cx="40" cy="65" r="3.2" fill="#1f2a24"/><circle cx="60" cy="65" r="3.2" fill="#1f2a24"/><circle cx="33" cy="73" r="4" fill="#f6a6a0" opacity=".75"/><circle cx="67" cy="73" r="4" fill="#f6a6a0" opacity=".75"/><path d="M38 75Q50 89 62 75" fill="none" stroke="#1f2a24" stroke-width="3" stroke-linecap="round"/></svg><span>Commentaire</span>';
  var PRIV = "Confidentialité : ton commentaire et ton adresse e-mail restent privés, aucun autre visiteur ne les voit. Ton adresse sert uniquement à te répondre et à t’envoyer un e-mail de remerciement, puis elle est supprimée après 24 heures. Tu peux demander la suppression de ton message à tout moment en écrivant à ";

  var css = document.createElement("style");
  css.textContent =
    ".ckc-wrap{max-width:560px;margin:18px auto 8px;padding:0 16px}" +
    ".ckc-wrap .cm{display:grid;gap:10px;justify-items:center;font:1rem/1.5 Economica,'Arial Narrow',Arial,sans-serif;color:#1f2a24}" +
    ".ckc-wrap .cm.open{justify-items:stretch;padding:18px;background:#fff;border:1px solid #d3e6ea;border-radius:22px}" +
    ".ckc-wrap .cm input,.ckc-wrap .cm textarea{width:100%;box-sizing:border-box;padding:10px 12px;border:1px solid #d3e6ea;border-radius:16px;font:inherit;background:#fff;color:#1f2a24}" +
    ".ckc-wrap .cm input::placeholder,.ckc-wrap .cm textarea::placeholder{color:#5d6f73}" +
    ".ckc-wrap .send{justify-self:start;border:0;border-radius:99px;background:#0f6b78;color:#fff;font:700 1.05rem Economica,'Arial Narrow',Arial,sans-serif;padding:10px 22px;cursor:pointer}" +
    ".ckc-wrap .send:disabled{opacity:.6;cursor:default}" +
    ".ckc-wrap .st{margin:0;color:#000;font-weight:700}.ckc-wrap .st:empty{display:none}" +
    ".ckc-wrap .hp{position:absolute;left:-9999px;width:1px;height:1px;opacity:0}" +
    ".cm-toggle{display:inline-flex;align-items:center;gap:8px;background:none;border:0;padding:6px 2px;font:700 1.2rem Economica,'Arial Narrow',Arial,sans-serif;color:#0f6b78;text-decoration:underline;text-underline-offset:4px;cursor:pointer}" +
    ".cm.open .cm-toggle{justify-self:start;text-decoration:none}" +
    ".cm-toggle .chev{display:inline-block;transition:transform .2s}.cm.open .cm-toggle .chev{transform:rotate(180deg)}" +
    ".cm-body{display:grid;gap:10px}.cm-body[hidden]{display:none}" +
    ".cm-privacy a{color:#0f6b78;font-weight:700}" +
    ".cm-privacy{margin:4px 0 0;padding:10px 12px;background:#e3f6f8;border-left:4px solid #0f6b78;border-radius:10px;color:#000;font-weight:700;font-size:.95rem;line-height:1.35}" +
    ".ckc-toque{display:none;align-items:center;gap:8px;margin-left:auto;flex:none;padding:5px 16px 5px 8px;background:#fff;color:#0f6b78;font:700 1.1rem/1 Economica,'Arial Narrow',Arial,sans-serif;text-decoration:none;border-radius:99px;box-shadow:0 2px 6px rgba(0,0,0,.25)}" +
    ".ckc-toque svg{width:44px;height:44px;flex:none}" +
    ".ckc-fab{display:flex;position:fixed;right:12px;bottom:calc(16px + env(safe-area-inset-bottom,0px));z-index:15;align-items:center;gap:6px;padding:4px 12px 4px 6px;background:#fff;color:#0f6b78;font:700 1rem/1 Economica,'Arial Narrow',Arial,sans-serif;text-decoration:none;border-radius:99px;border:2px solid #0f6b78;box-shadow:0 3px 8px rgba(0,0,0,.35);touch-action:none;user-select:none;-webkit-user-select:none;-webkit-user-drag:none;cursor:grab}" +
    ".ckc-fab svg{width:38px;height:38px;flex:none}" +
    "@media (min-width:700px){.ckc-toque{display:flex}.ckc-fab{display:none}}" +
    "#commentaire{scroll-margin-top:150px}";
  document.head.appendChild(css);

  function deviceType() { var ua = navigator.userAgent || ""; return (/Android|iPhone|iPad|iPod|Mobile/i.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1) || matchMedia("(max-width:699px)").matches) ? "Mobile" : "PC"; }
  function el(tag, cls, txt) { var x = document.createElement(tag); if (cls) x.className = cls; if (txt) x.textContent = txt; return x; }

  /* ---- section repliable ---- */
  var wrap = el("section", "ckc-wrap"); wrap.setAttribute("aria-label", "Commentaire");
  var f = el("form", "cm"); f.id = "commentaire"; 
  var tg = el("button", "cm-toggle"); tg.type = "button"; tg.setAttribute("aria-expanded", "false"); tg.setAttribute("aria-controls", "cmBody");
  tg.innerHTML = '<span aria-hidden="true">💬</span> Laisser un commentaire <span class="chev" aria-hidden="true">▾</span>';
  var body = el("div", "cm-body"); body.id = "cmBody"; body.hidden = true;
  var e = el("input"); e.type = "email"; e.required = true; e.maxLength = 200; e.autocomplete = "email"; e.placeholder = "Ton adresse e-mail"; e.setAttribute("aria-label", "Adresse e-mail");
  var t = el("textarea"); t.required = true; t.rows = 4; t.maxLength = 1000; t.placeholder = "Ton commentaire"; t.setAttribute("aria-label", "Commentaire");
  var hp = el("input", "hp"); hp.type = "text"; hp.tabIndex = -1; hp.autocomplete = "off"; hp.setAttribute("aria-hidden", "true");
  var b = el("button", "send", "Envoyer"); b.type = "submit";
  var s = el("p", "st"); s.setAttribute("role", "status");
  var p = el("p", "cm-privacy", PRIV); var ml = el("a", null, "contact@cookapli.com"); ml.href = "mailto:contact@cookapli.com"; p.appendChild(ml); p.appendChild(document.createTextNode("." + (ds.extra ? " " + ds.extra : "")));
  [e, t, hp, b, s, p].forEach(function (x) { body.appendChild(x); });
  f.appendChild(tg); f.appendChild(body); wrap.appendChild(f);
  function setOpen(o) { body.hidden = !o; f.classList.toggle("open", o); tg.setAttribute("aria-expanded", String(o)); }
  tg.addEventListener("click", function () { setOpen(body.hidden); if (!body.hidden) setTimeout(function () { e.focus({ preventScroll: true }); }, 50); });
  f.addEventListener("submit", function (ev) {
    ev.preventDefault(); if (hp.value) return;
    var last = 0; try { last = +localStorage.getItem("cookapli-cm") || 0; } catch (x) {}
    if (Date.now() - last < 30000) { s.textContent = "Patiente quelques secondes avant d’envoyer un autre message."; return; }
    b.disabled = true; s.textContent = "Envoi…";
    var data = new URLSearchParams({ recipe: CTX, email: e.value.trim(), comment: t.value.trim(), device: deviceType() });
    fetch(URL_, { method: "POST", mode: "no-cors", body: data })
      .then(function () { try { localStorage.setItem("cookapli-cm", String(Date.now())); } catch (x) {} t.value = ""; s.textContent = "Merci, ton commentaire a été envoyé."; b.disabled = false; })
      .catch(function () { s.textContent = "L’envoi a échoué. Réessaie dans un instant."; b.disabled = false; });
  });
  var after = ds.after && document.querySelector(ds.after);
  var foot = document.querySelector("body > footer");
  if (after) after.parentNode.insertBefore(wrap, after.nextSibling);
  else if (foot) foot.parentNode.insertBefore(wrap, foot);
  else document.body.appendChild(wrap);

  function goComment(ev) {
    ev.preventDefault(); setOpen(true);
    var calm = matchMedia("(prefers-reduced-motion:reduce)").matches;
    f.scrollIntoView({ behavior: calm ? "auto" : "smooth", block: "start" });
    if (matchMedia("(min-width:700px)").matches) setTimeout(function () { e.focus({ preventScroll: true }); }, 500);
  }

  /* ---- bouton du haut (grand écran) ---- */
  var hdr = null; (ds.header ? [ds.header] : ["header .top", "header .wrap", "header"]).some(function (q) { return (hdr = document.querySelector(q)); });
  if (hdr) { var th = el("a", "ckc-toque"); th.href = "#commentaire"; th.innerHTML = TOQUE; th.addEventListener("click", goComment); hdr.appendChild(th); }

  /* ---- bouton flottant déplaçable (téléphone) ---- */
  var tf = el("a", "ckc-fab"); tf.href = "#commentaire"; tf.draggable = false; tf.innerHTML = TOQUE; document.body.appendChild(tf);
  (function setupFab(k) {
    var drag = false, id = null, sx = 0, sy = 0, ox = 0, oy = 0, pos = null;
    function place(x, y) { var w = k.offsetWidth, h = k.offsetHeight; x = Math.min(Math.max(4, x), innerWidth - w - 4); y = Math.min(Math.max(4, y), innerHeight - h - 4); k.style.left = x + "px"; k.style.top = y + "px"; k.style.right = "auto"; k.style.bottom = "auto"; }
    try { pos = JSON.parse(localStorage.getItem("cookapli-fab")); } catch (x) {}
    if (pos && pos.length === 2) place(pos[0], pos[1]);
    k.addEventListener("pointerdown", function (ev) { id = ev.pointerId; try { k.setPointerCapture(id); } catch (x) {} var r = k.getBoundingClientRect(); sx = ev.clientX; sy = ev.clientY; ox = r.left; oy = r.top; drag = false; });
    k.addEventListener("pointermove", function (ev) { if (ev.pointerId !== id) return; var dx = ev.clientX - sx, dy = ev.clientY - sy; if (!drag && Math.abs(dx) + Math.abs(dy) < 8) return; drag = true; place(ox + dx, oy + dy); });
    function end(ev) { if (ev.pointerId !== id) return; id = null; if (drag) { var r = k.getBoundingClientRect(); try { localStorage.setItem("cookapli-fab", JSON.stringify([r.left, r.top])); } catch (x) {} setTimeout(function () { drag = false; }, 0); } }
    k.addEventListener("pointerup", end); k.addEventListener("pointercancel", end);
    k.addEventListener("click", function (ev) { if (drag) { ev.preventDefault(); return; } goComment(ev); });
    addEventListener("resize", function () { if (k.style.left) place(parseFloat(k.style.left), parseFloat(k.style.top)); });
  })(tf);
  if (location.hash === "#commentaire") setTimeout(function () { goComment({ preventDefault: function () {} }); }, 300);
})();
