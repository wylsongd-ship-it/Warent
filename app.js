// La page d'accueil : hero, carrousel de la flotte, fiche detaillee et
// barre de recherche. Les donnees et les tarifs viennent de core.js.

(function () {
  // Le hero est une image fixe : le preloader s'efface des qu'elle est
  // decodee (ou au bout de 4 s si le reseau traine), pour ne jamais bloquer
  // l'affichage du site.
  var img = document.getElementById('hero-media');
  var preloader = document.getElementById('preloader');
  var preloaderText = document.getElementById('preloader-text');

  if (preloaderText) preloaderText.textContent = 'WaRent';

  function hidePreloader() {
    if (preloader) preloader.classList.add('hide');
  }

  if (!img || (img.complete && img.naturalWidth)) {
    hidePreloader();
  } else {
    img.addEventListener('load', hidePreloader, { once: true });
    img.addEventListener('error', hidePreloader, { once: true });
  }
  setTimeout(hidePreloader, 4000);
})();

(function () {
  var ICONS = WARENT.icons;
  var TRANSMISSION = WARENT.labels.transmission;
  var FUEL = WARENT.labels.fuel;
  var BADGES = WARENT.labels.badges;
  var FLEET = WARENT.fleet;

  function silhouette(category) {
    if (category === 'berline') {
      return '<svg class="car-silhouette" viewBox="0 0 300 132" preserveAspectRatio="xMidYMid meet" aria-hidden="true">' +
        '<ellipse class="car-shadow" cx="154" cy="118" rx="126" ry="7"></ellipse>' +
        '<path class="car-body" d="M16,92 Q18,68 44,62 L86,38 Q104,28 146,28 L206,28 Q238,30 254,48 L274,64 Q292,68 292,92 L292,98 L266,98 Q266,78 246,78 Q226,78 226,98 L92,98 Q92,78 72,78 Q52,78 52,98 L16,98 Z"></path>' +
        '<path class="car-glass" d="M92,62 L114,42 Q126,36 152,36 L198,36 Q212,38 222,52 L232,62 Z"></path>' +
        '<circle class="car-wheel" cx="72" cy="100" r="16"></circle>' +
        '<circle class="car-wheel" cx="246" cy="100" r="16"></circle>' +
        '</svg>';
    }
    return '<svg class="car-silhouette" viewBox="0 0 300 132" preserveAspectRatio="xMidYMid meet" aria-hidden="true">' +
      '<ellipse class="car-shadow" cx="152" cy="118" rx="104" ry="7"></ellipse>' +
      '<path class="car-body" d="M48,92 Q50,66 76,60 L102,34 Q116,24 148,24 L188,24 Q212,26 224,42 L240,60 Q258,64 258,92 L258,98 L236,98 Q236,78 216,78 Q196,78 196,98 L114,98 Q114,78 94,78 Q74,78 74,98 L48,98 Z"></path>' +
      '<path class="car-glass" d="M108,60 L126,38 Q134,32 154,32 L180,32 Q192,34 200,46 L208,60 Z"></path>' +
      '<circle class="car-wheel" cx="94" cy="100" r="15"></circle>' +
      '<circle class="car-wheel" cx="216" cy="100" r="15"></circle>' +
      '</svg>';
  }

  function specChip(icon, fr, en) {
    return '<span class="spec-chip">' + ICONS[icon] + '<span data-fr="' + fr + '" data-en="' + en + '">' + fr + '</span></span>';
  }

  function buildCard(car) {
    var badge = BADGES[car.badge];
    var trans = TRANSMISSION[car.transmission];
    var fuel = FUEL[car.fuel];
    var fuelIcon = (car.fuel === 'electrique' || car.fuel === 'hybride') ? 'bolt' : 'drop';
    // The photo sits on top; if the file is missing the browser fires
    // onerror and we fall back to the vector silhouette, so a card is
    // never left empty.
    var visual = car.img
      ? '<span class="car-ground"></span>' +
        '<span class="car-fallback">' + silhouette(car.category) + '</span>' +
        '<img class="car-photo" src="' + car.img + '" alt="' + car.brand + ' ' + car.model + '"' +
        ' onerror="this.parentNode.querySelector(\'.car-fallback\').style.display=\'flex\';this.remove();">'
      : silhouette(car.category);
    var styleVars = 'style="--accent:' + car.accent + '; --accent-bg: linear-gradient(165deg,' + car.accent + '26,#0a0b0d 72%);"';

    return '' +
      '<div class="car-tilt">' +
        '<div class="car-flip">' +
          '<div class="car-face car-face-front">' +
            '<div class="car-face-inner" ' + styleVars + '>' +
              '<div class="car-visual">' +
                (badge ? '<span class="car-badge" data-fr="' + badge[0] + '" data-en="' + badge[1] + '">' + badge[0] + '</span>' : '') +
                '<span class="car-logo">WaRent</span>' +
                visual +
              '</div>' +
              '<div class="car-info">' +
                '<p class="car-name">' + car.brand + ' ' + car.model + '</p>' +
                '<p class="car-cat" data-fr="' + car.catFr + '" data-en="' + car.catEn + '">' + car.catFr + '</p>' +
                '<div class="car-specs">' +
                  specChip('seat', car.seats + ' places', car.seats + ' seats') +
                  specChip('gear', trans[0], trans[1]) +
                  specChip(fuelIcon, fuel[0], fuel[1]) +
                '</div>' +
                '<div class="car-meta-row">' +
                  '<span class="car-price">' + car.price + '€<small data-fr="/jour" data-en="/day"> /jour</small></span>' +
                  '<button type="button" class="car-cta" data-detail="' + car.id + '" data-fr="Détails" data-en="Details">Détails</button>' +
                '</div>' +
              '</div>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>';
  }

  var viewport = document.getElementById('fleet-viewport');
  var track = document.getElementById('fleet-track');
  var prevBtn = document.getElementById('fleet-prev');
  var nextBtn = document.getElementById('fleet-next');
  var pills = document.querySelectorAll('.fleet-pill');
  if (!viewport || !track) return;

  var currentCars = FLEET.slice();
  var cardEls = [];
  var progress = 0, targetProgress = 0, spacing = 240, wrap = false;

  function lerp(a, b, t) { return a + (b - a) * t; }
  function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

  // Looping only makes sense with enough cards; below that the wrap-around
  // would push the neighbour card to one side only. Small sets scroll
  // linearly and stay inside their bounds instead.
  function clampTarget() {
    if (!wrap) targetProgress = clamp(targetProgress, 0, Math.max(0, cardEls.length - 1));
  }

  function measure() {
    if (!cardEls.length) return;
    var w = cardEls[0].getBoundingClientRect().width;
    if (w > 0) spacing = w * 0.86;
  }

  function positionCards() {
    var n = cardEls.length;
    if (!n) return;
    cardEls.forEach(function (el, i) {
      var d = i - progress;
      if (wrap) d = ((d + n / 2) % n + n) % n - n / 2;
      var absD = Math.abs(d);
      var t = clamp(absD / 2.6, 0, 1);
      var s = t * t * (3 - 2 * t);
      var scale = lerp(1, 0.6, s);
      var opacity = lerp(1, 0.1, clamp(absD / 1.35, 0, 1));
      var x = d * spacing;
      var rot = clamp(d * -22, -68, 68);
      var z = -absD * 170;
      el.style.transform = 'translateX(' + x.toFixed(1) + 'px) translateZ(' + z.toFixed(1) + 'px) rotateY(' + rot.toFixed(1) + 'deg) scale(' + scale.toFixed(3) + ')';
      el.style.opacity = opacity.toFixed(2);
      el.style.zIndex = Math.round(1000 - absD * 10);
      el.style.pointerEvents = opacity < 0.1 ? 'none' : '';
    });
  }

  function loop() {
    progress += (targetProgress - progress) * 0.14;
    positionCards();
    requestAnimationFrame(loop);
  }

  function renderCars() {
    track.innerHTML = '';
    cardEls = [];
    currentCars.forEach(function (car) {
      var el = document.createElement('div');
      el.className = 'car-slot';
      el.setAttribute('data-id', car.id);
      el.innerHTML = buildCard(car);
      track.appendChild(el);
      cardEls.push(el);
    });
    wrap = cardEls.length >= 4;
    progress = 0;
    targetProgress = 0;
    measure();
    positionCards();

    var lang = document.documentElement.lang === 'en' ? 'en' : 'fr';
    track.querySelectorAll('[data-fr][data-en]').forEach(function (el) {
      el.textContent = lang === 'en' ? el.dataset.en : el.dataset.fr;
    });
  }

  var dragging = false, moved = false, startX = 0, startProgress = 0, suppressClick = false;

  // La carte s'incline au survol : entre le pointerdown et le click, la
  // transition de l'inclinaison peut la deplacer de quelques pixels sous le
  // curseur, et le click finit alors sur le viewport plutot que sur la carte.
  // On memorise donc la carte visee au pointerdown et on s'en sert au click.
  var downSlot = null;

  viewport.addEventListener('pointerdown', function (e) {
    dragging = true;
    moved = false;
    startX = e.clientX;
    startProgress = targetProgress;
    downSlot = e.target.closest ? e.target.closest('.car-slot') : null;
    viewport.classList.add('is-dragging');
    try { viewport.setPointerCapture(e.pointerId); } catch (err) {}
  });
  viewport.addEventListener('pointermove', function (e) {
    if (!dragging) return;
    var dx = e.clientX - startX;
    if (Math.abs(dx) > 6) moved = true;
    if (moved) {
      targetProgress = startProgress - dx / spacing;
      clampTarget();
    }
  });
  function endDrag() {
    if (!dragging) return;
    dragging = false;
    viewport.classList.remove('is-dragging');
    if (moved) {
      targetProgress = Math.round(targetProgress);
      clampTarget();
      suppressClick = true;
      setTimeout(function () { suppressClick = false; }, 60);
    }
    moved = false;
  }
  viewport.addEventListener('pointerup', endDrag);
  viewport.addEventListener('pointercancel', endDrag);
  viewport.addEventListener('pointerleave', endDrag);

  viewport.addEventListener('wheel', function (e) {
    if (Math.abs(e.deltaX) < Math.abs(e.deltaY)) return;
    e.preventDefault();
    targetProgress += e.deltaX / spacing;
    clampTarget();
    clearTimeout(viewport._wheelSnap);
    viewport._wheelSnap = setTimeout(function () {
      targetProgress = Math.round(targetProgress);
      clampTarget();
    }, 220);
  }, { passive: false });

  if (prevBtn) prevBtn.addEventListener('click', function () { targetProgress = Math.round(targetProgress) - 1; clampTarget(); });
  if (nextBtn) nextBtn.addEventListener('click', function () { targetProgress = Math.round(targetProgress) + 1; clampTarget(); });

  track.addEventListener('pointermove', function (e) {
    var slot = e.target.closest ? e.target.closest('.car-slot') : null;
    cardEls.forEach(function (el) {
      var tiltEl = el.querySelector('.car-tilt');
      if (!tiltEl) return;
      if (el === slot) {
        var rect = el.getBoundingClientRect();
        var px = (e.clientX - rect.left) / rect.width - 0.5;
        var py = (e.clientY - rect.top) / rect.height - 0.5;
        tiltEl.style.setProperty('--ry', (px * 12).toFixed(2) + 'deg');
        tiltEl.style.setProperty('--rx', (py * -8).toFixed(2) + 'deg');
      } else {
        tiltEl.style.setProperty('--ry', '0deg');
        tiltEl.style.setProperty('--rx', '0deg');
      }
    });
  });
  viewport.addEventListener('mouseleave', function () {
    cardEls.forEach(function (el) {
      var tiltEl = el.querySelector('.car-tilt');
      if (tiltEl) {
        tiltEl.style.setProperty('--ry', '0deg');
        tiltEl.style.setProperty('--rx', '0deg');
      }
    });
  });

  // Un clic sur une carte laterale la ramene au centre ; une fois au centre,
  // la carte (ou son bouton Details) ouvre la fiche detaillee.
  viewport.addEventListener('click', function (e) {
    if (suppressClick) return;
    if (e.target.closest && e.target.closest('.carousel-nav')) return;
    var slot = (e.target.closest && e.target.closest('.car-slot')) || downSlot;
    downSlot = null;
    if (!slot || !slot.isConnected) return;
    var i = cardEls.indexOf(slot);
    var n = cardEls.length;
    if (i < 0 || !n) return;

    var centre = ((Math.round(targetProgress) % n) + n) % n;
    if (i !== centre) {
      if (wrap) {
        var d = i - centre;
        if (d > n / 2) d -= n;
        if (d < -n / 2) d += n;
        targetProgress = Math.round(targetProgress) + d;
      } else {
        targetProgress = i;
      }
      clampTarget();
      return;
    }

    var id = slot.getAttribute('data-id');
    if (id && WARENT.openDetail) WARENT.openDetail(id);
  });

  pills.forEach(function (pill) {
    pill.addEventListener('click', function () {
      pills.forEach(function (p) { p.classList.remove('active'); });
      pill.classList.add('active');
      var cat = pill.getAttribute('data-cat');
      currentCars = cat === 'all' ? FLEET.slice() : FLEET.filter(function (c) { return c.category === cat; });
      renderCars();
    });
  });

  window.addEventListener('resize', measure);

  renderCars();
  requestAnimationFrame(loop);
})();

// ---- Fiche detaillee vehicule, ouverte depuis les cartes de la flotte ----
// Remplace l'ancienne section Tarifs : les prix vivent maintenant dans cette
// fiche, generee a partir de WARENT.fleet, donc toujours en phase avec les
// cartes de la flotte.
(function () {
  var FLEET = WARENT.fleet;
  if (!FLEET || !FLEET.length) return;

  var ICONS = WARENT.icons;
  var TRANSMISSION = WARENT.labels.transmission;
  var FUEL = WARENT.labels.fuel;
  var KM_PER_DAY = WARENT.kmPerDay;
  var INCLUDED = WARENT.included;

  var t = WARENT.t;
  var money = WARENT.money;
  var durationsFor = WARENT.durationsFor;

  var overlay = document.createElement('div');
  overlay.className = 'vd-overlay';
  overlay.id = 'vehicle-detail';
  overlay.hidden = true;
  overlay.innerHTML =
    '<div class="vd-backdrop" data-close="1"></div>' +
    '<div class="vd-dialog" role="dialog" aria-modal="true" aria-labelledby="vd-name"></div>';
  document.body.appendChild(overlay);

  var dialog = overlay.querySelector('.vd-dialog');
  var current = null;
  var choice = { duration: 'day', km: 'included' };
  var lastFocus = null;

  function spec(icon, fr, en) {
    return '<li>' + (ICONS[icon] || '') +
      '<span data-fr="' + fr + '" data-en="' + en + '">' + t(fr, en) + '</span></li>';
  }

  function option(group, id, selected, titleFr, titleEn, subFr, subEn, priceHtml) {
    return '<button type="button" class="vd-option' + (selected ? ' is-selected' : '') + '"' +
      ' role="radio" aria-checked="' + (selected ? 'true' : 'false') + '"' +
      ' data-group="' + group + '" data-value="' + id + '">' +
      '<span class="vd-radio" aria-hidden="true"></span>' +
      '<span class="vd-option-text">' +
        '<span class="vd-option-title" data-fr="' + titleFr + '" data-en="' + titleEn + '">' + t(titleFr, titleEn) + '</span>' +
        '<span class="vd-option-sub" data-fr="' + subFr + '" data-en="' + subEn + '">' + t(subFr, subEn) + '</span>' +
      '</span>' +
      '<span class="vd-option-price">' + priceHtml + '</span>' +
    '</button>';
  }

  function totals(car) {
    return WARENT.totals(car, choice);
  }

  function render() {
    var car = current;
    if (!car) return;
    var trans = TRANSMISSION[car.transmission] || ['', ''];
    var fuel = FUEL[car.fuel] || ['', ''];
    var durations = durationsFor(car);
    var sums = totals(car);

    var visual = car.img
      ? '<img class="vd-photo" src="' + car.img + '" alt="' + car.brand + ' ' + car.model + '">'
      : '';

    // L'accent du vehicule est pose sur le dialogue : il cascade ainsi sur
    // les options selectionnees, les puces et le bouton, pas seulement sur
    // la colonne visuelle.
    dialog.style.setProperty('--accent', car.accent);
    dialog.style.setProperty('--ink', car.ink);

    dialog.innerHTML =
      '<button type="button" class="vd-close" data-close="1" aria-label="' + t('Fermer', 'Close') + '">' +
        '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>' +
      '</button>' +
      '<div class="vd-visual">' +
        '<div class="vd-visual-head">' +
          '<p class="vd-name" id="vd-name">' + car.brand + ' ' + car.model + '</p>' +
          '<p class="vd-cat"><span data-fr="' + car.catFr + '" data-en="' + car.catEn + '">' + t(car.catFr, car.catEn) + '</span> · ' +
            '<span data-fr="' + trans[0] + '" data-en="' + trans[1] + '">' + t(trans[0], trans[1]) + '</span></p>' +
        '</div>' +
        '<div class="vd-photo-wrap">' + visual + '</div>' +
        '<ul class="vd-specs">' +
          spec('seat', car.seats + ' places', car.seats + ' seats') +
          spec('bag', car.luggage + ' valises', car.luggage + ' suitcases') +
          spec('cabin', car.cabin + ' bagage cabine', car.cabin + ' cabin bag') +
          spec('gear', trans[0], trans[1]) +
          spec('door', car.doors + ' portes', car.doors + ' doors') +
          spec('id', 'Âge min. ' + car.minAge + ' ans', 'Min. age ' + car.minAge) +
        '</ul>' +
      '</div>' +
      '<div class="vd-panel">' +
        '<div class="vd-scroll">' +
          '<h3 class="vd-group-title" data-fr="Durée de location" data-en="Rental duration">' + t('Durée de location', 'Rental duration') + '</h3>' +
          '<div class="vd-options" role="radiogroup">' +
            durations.map(function (d) {
              return option('duration', d.id, d.id === sums.duration.id, d.fr, d.en, d.subFr, d.subEn,
                '<b>' + money(d.total) + '</b><small>' + money(Math.round(d.total / d.days)) +
                t(' / jour', ' / day') + '</small>');
            }).join('') +
          '</div>' +
          '<h3 class="vd-group-title" data-fr="Kilométrage" data-en="Mileage">' + t('Kilométrage', 'Mileage') + '</h3>' +
          '<div class="vd-options" role="radiogroup">' +
            option('km', 'included', choice.km === 'included',
              KM_PER_DAY + ' km par jour', KM_PER_DAY + ' km per day',
              'Au-delà, chaque km est facturé au tarif du contrat', 'Beyond that, each km is charged at the contract rate',
              '<b data-fr="Inclus" data-en="Included">' + t('Inclus', 'Included') + '</b>') +
            option('km', 'unlimited', choice.km === 'unlimited',
              'Kilomètres illimités', 'Unlimited mileage',
              'Aucune limite pendant toute la location', 'No limit for the whole rental',
              '<b>+ ' + money(car.kmUnlimited) + '</b><small>' + t('par jour', 'per day') + '</small>') +
          '</div>' +
          '<ul class="vd-included">' +
            INCLUDED.map(function (i) {
              return '<li data-fr="' + i[0] + '" data-en="' + i[1] + '">' + t(i[0], i[1]) + '</li>';
            }).join('') +
          '</ul>' +
          '<p class="vd-legal" data-fr="Un dépôt de garantie est demandé à la remise des clés, son montant dépend du véhicule et vous est précisé avant la réservation. Permis et pièce d\'identité originaux vérifiés en personne. Le bouton Réserver ouvre la page de demande : la réservation n\'est ferme qu\'une fois confirmée par WaRent." data-en="A deposit is taken at handover; the amount depends on the vehicle and is confirmed before you book. Original licence and ID checked in person. The Book button opens the request form: the booking is only firm once WaRent confirms it.">' +
            t('Un dépôt de garantie est demandé à la remise des clés, son montant dépend du véhicule et vous est précisé avant la réservation. Permis et pièce d\'identité originaux vérifiés en personne. Le bouton Réserver ouvre la page de demande : la réservation n\'est ferme qu\'une fois confirmée par WaRent.',
              'A deposit is taken at handover; the amount depends on the vehicle and is confirmed before you book. Original licence and ID checked in person. The Book button opens the request form: the booking is only firm once WaRent confirms it.') +
          '</p>' +
        '</div>' +
        '<div class="vd-foot">' +
          '<div class="vd-total">' +
            '<b>' + money(sums.total) + '</b>' +
            '<span>' + t('Total', 'Total') + ' · ' + money(sums.perDay) + t(' / jour', ' / day') + '</span>' +
          '</div>' +
          '<a class="vd-cta" href="' + bookingHref(car) + '"' +
            ' data-fr="Réserver" data-en="Book now">' + t('Réserver', 'Book now') + '</a>' +
        '</div>' +
      '</div>';
  }

  function bookingHref(car) {
    return WARENT.bookingUrl(car, choice);
  }

  function open(id) {
    var car = FLEET.filter(function (c) { return c.id === id; })[0];
    if (!car) return;
    if (!overlay.hidden && current === car) return;
    current = car;
    // Si le visiteur a deja choisi ses dates, la fiche s'ouvre sur cette duree.
    var s = WARENT.search;
    choice.duration = 'day';
    if (s && s.days === 2) choice.duration = 'weekend';
    else if (s && s.days === 7) choice.duration = 'week';
    else if (s && s.days) choice.duration = 'search';
    choice.km = 'included';
    render();
    lastFocus = document.activeElement;
    overlay.hidden = false;
    document.body.classList.add('vd-open');
    var close = dialog.querySelector('.vd-close');
    if (close) close.focus();
  }

  function close() {
    overlay.hidden = true;
    document.body.classList.remove('vd-open');
    current = null;
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  overlay.addEventListener('click', function (e) {
    if (e.target.closest && e.target.closest('[data-close]')) { close(); return; }
    var opt = e.target.closest ? e.target.closest('.vd-option') : null;
    if (!opt) return;
    choice[opt.getAttribute('data-group')] = opt.getAttribute('data-value');
    render();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !overlay.hidden) close();
  });

  // Le bouton Details des cartes ouvre la fiche ; le clic sur la carte elle-meme
  // est gere par le carrousel, qui appelle WARENT.openDetail.
  document.addEventListener('click', function (e) {
    var btn = e.target.closest ? e.target.closest('[data-detail]') : null;
    if (!btn) return;
    e.preventDefault();
    e.stopPropagation();
    open(btn.getAttribute('data-detail'));
  });

  WARENT.openDetail = open;
  WARENT.closeDetail = close;
  WARENT.renderDetail = function () { if (current) render(); };
})();



(function () {
  var form = document.getElementById('search-form');
  if (!form) return;

  var city = document.getElementById('pickup-city');
  var sd = document.getElementById('start-date');
  var st = document.getElementById('start-time');
  var ed = document.getElementById('end-date');
  var et = document.getElementById('end-time');
  var errorEl = document.getElementById('search-error');

  function isoDate(d) {
    var m = String(d.getMonth() + 1);
    var day = String(d.getDate());
    if (m.length < 2) m = '0' + m;
    if (day.length < 2) day = '0' + day;
    return d.getFullYear() + '-' + m + '-' + day;
  }

  // Valeurs par défaut : demain -> dans 4 jours, pour que le formulaire
  // ne soit jamais vide au chargement.
  var now = new Date();
  var DAY = 86400000;
  sd.value = isoDate(new Date(now.getTime() + DAY));
  ed.value = isoDate(new Date(now.getTime() + 4 * DAY));
  sd.min = isoDate(now);
  ed.min = isoDate(now);

  // Creneaux horaires en 24h, toutes les 30 min. Un <select> plutot qu'un
  // <input type="time"> : le format natif suit la langue du systeme (donc
  // AM/PM sur un appareil configure en anglais) et reste capricieux au tap
  // sur iOS. Ici l'affichage est garanti identique partout.
  function fillTimes(sel, selected) {
    var html = '';
    for (var h = 0; h < 24; h++) {
      for (var m = 0; m < 60; m += 30) {
        var v = (h < 10 ? '0' : '') + h + ':' + (m === 0 ? '00' : '30');
        html += '<option value="' + v + '"' + (v === selected ? ' selected' : '') + '>' + v + '</option>';
      }
    }
    sel.innerHTML = html;
  }
  fillTimes(st, '10:00');
  fillTimes(et, '10:00');

  sd.addEventListener('change', function () {
    ed.min = sd.value;
    if (ed.value && ed.value < sd.value) ed.value = sd.value;
  });

  function prettyDate(value) {
    var p = value.split('-');
    return p[2] + '/' + p[1] + '/' + p[0];
  }

  function showError(fr, en) {
    errorEl.textContent = document.documentElement.lang === 'en' ? en : fr;
    errorEl.hidden = false;
  }

  // Lien generique, pour l'en-tete et le bloc contact.
  function generalWaLink() {
    var msg = 'Bonjour, je souhaite louer un véhicule ';
    msg += WARENT.search ? WARENT.search.sentence : 'à Lorient';
    return 'https://wa.me/' + WARENT.phone + '?text=' + encodeURIComponent(msg + '.');
  }

  // Tout lien portant [data-car] repart avec les dates choisies.
  function refreshLinks() {
    Array.prototype.forEach.call(document.querySelectorAll('[data-car]'), function (a) {
      a.href = WARENT.waLink(a.getAttribute('data-car'), a.getAttribute('data-price'));
    });
    var general = generalWaLink();
    var head = document.getElementById('whatsapp-link');
    if (head) head.href = general;
    var contact = document.getElementById('contact-wa');
    if (contact) contact.href = general;
  }
  WARENT.refreshLinks = refreshLinks;
  refreshLinks();

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    if (!sd.value || !ed.value || !st.value || !et.value) {
      showError('Merci de renseigner les dates et les heures.', 'Please fill in both dates and times.');
      return;
    }
    var startAt = new Date(sd.value + 'T' + st.value);
    var endAt = new Date(ed.value + 'T' + et.value);
    if (isNaN(startAt.getTime()) || isNaN(endAt.getTime())) {
      showError('Dates invalides.', 'Invalid dates.');
      return;
    }
    if (endAt <= startAt) {
      showError('Le retour doit être après le départ.', 'The return must be after the pick-up.');
      return;
    }

    errorEl.hidden = true;

    var place = city.value || 'Lorient';
    WARENT.search = {
      city: place,
      days: Math.max(1, Math.ceil((endAt - startAt) / DAY)),
      fromFr: prettyDate(sd.value) + ' à ' + st.value,
      fromEn: prettyDate(sd.value) + ' at ' + st.value,
      toFr: prettyDate(ed.value) + ' à ' + et.value,
      toEn: prettyDate(ed.value) + ' at ' + et.value,
      sentence: 'à ' + place + ', du ' + prettyDate(sd.value) + ' à ' + st.value +
                ' au ' + prettyDate(ed.value) + ' à ' + et.value
    };
    refreshLinks();

    var fleet = document.getElementById('fleet');
    if (fleet) fleet.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
})();

(function () {
  var STORAGE_KEY = 'warent-lang';
  var titles = {
    fr: 'WaRent — Location de voitures premium',
    en: 'WaRent — Premium Car Rental'
  };
  var btns = document.querySelectorAll('.lang-btn');
  var textEls = document.querySelectorAll('[data-fr][data-en]');
  var waLink = document.getElementById('whatsapp-link');
  var waLabels = { fr: 'Contacter sur WhatsApp', en: 'Ask on WhatsApp' };

  function getStoredLang() {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch (e) {
      return null;
    }
  }
  function storeLang(lang) {
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch (e) { }
  }

  function setLanguage(lang) {
    if (lang !== 'en') lang = 'fr';

    document.documentElement.lang = lang;
    document.body.classList.toggle('lang-en', lang === 'en');
    document.title = titles[lang];

    textEls.forEach(function (el) {
      el.textContent = lang === 'en' ? el.dataset.en : el.dataset.fr;
    });

    if (waLink) waLink.setAttribute('aria-label', waLabels[lang]);

    btns.forEach(function (btn) {
      var isActive = btn.getAttribute('data-lang-btn') === lang;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });

    // La fiche detaillee est generee en JS : elle n'est pas dans textEls,
    // il faut la redessiner si elle est ouverte au moment du changement.
    if (WARENT.renderDetail) WARENT.renderDetail();

    storeLang(lang);
  }

  btns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      setLanguage(btn.getAttribute('data-lang-btn'));
    });
  });

  setLanguage(getStoredLang() || 'fr');
})();
