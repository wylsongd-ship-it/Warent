// État partagé entre la barre de recherche et les cartes véhicules.
var WARENT = {
  phone: '971501234567',
  search: null
};

WARENT.waLink = function (label, price) {
  var msg = 'Bonjour, je souhaite réserver la ' + label;
  if (price) msg += ' (' + price + '€/jour)';
  if (WARENT.search) msg += ' ' + WARENT.search.sentence;
  msg += '.';
  return 'https://wa.me/' + WARENT.phone + '?text=' + encodeURIComponent(msg);
};

(function () {
  var video = document.getElementById('hero-video');
  var preloader = document.getElementById('preloader');
  var preloaderText = document.getElementById('preloader-text');

  video.loop = true;

  video.addEventListener('ended', function () {
    video.currentTime = 0;
    video.play();
  });

  video.addEventListener('pause', function () {
    video.play();
  });

  document.addEventListener('visibilitychange', function () {
    if (!document.hidden) {
      video.play();
    }
  });

  video.play().catch(function () { });

  function updateBuffered() {
    if (video.duration && video.buffered.length) {
      var bufferedEnd = video.buffered.end(video.buffered.length - 1);
      var pct = Math.min(100, Math.round((bufferedEnd / video.duration) * 100));
      preloaderText.textContent = pct + '%';
    }
  }
  video.addEventListener('progress', updateBuffered);

  function hidePreloader() {
    preloader.classList.add('hide');
  }
  video.addEventListener('canplaythrough', hidePreloader, { once: true });
  setTimeout(hidePreloader, 6000);

})();

(function () {
  var ICONS = {
    seat: '<svg viewBox="0 0 24 24"><path d="M7 13V7a2 2 0 012-2h6a2 2 0 012 2v6M5 13h14v4a2 2 0 01-2 2H7a2 2 0 01-2-2v-4z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"/></svg>',
    gear: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3.2" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M12 3v2.4M12 18.6V21M21 12h-2.4M5.4 12H3M18.4 5.6l-1.7 1.7M7.3 16.7l-1.7 1.7M18.4 18.4l-1.7-1.7M7.3 7.3L5.6 5.6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
    drop: '<svg viewBox="0 0 24 24"><path d="M12 3s6 6.6 6 11a6 6 0 11-12 0c0-4.4 6-11 6-11z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>',
    bolt: '<svg viewBox="0 0 24 24"><path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z" fill="currentColor"/></svg>'
  };

  var TRANSMISSION = { auto: ['Automatique', 'Automatic'], manual: ['Manuelle', 'Manual'] };
  var FUEL = { essence: ['Essence', 'Petrol'], diesel: ['Diesel', 'Diesel'], electrique: ['Électrique', 'Electric'], hybride: ['Hybride', 'Hybrid'] };
  var BADGES = {
    available: ['Disponible', 'Available'],
    popular: ['Populaire', 'Popular'],
    electric: ['Électrique', 'Electric'],
    premium: ['Premium', 'Premium']
  };

  // Source unique des tarifs : les cartes de la flotte ET la section Tarifs
  // sont generees a partir de ce tableau, elles ne peuvent donc pas diverger.
  var FLEET = [
    { id: 'c0', category: 'citadine', catFr: 'Citadine', catEn: 'City car', brand: 'Renault', model: 'Clio 5 Esprit Alpine',
      badge: 'popular', tagFr: 'Le plus demandé', tagEn: 'Most booked',
      price: 89, priceWeekend: 160, priceWeek: 490,
      seats: 5, transmission: 'auto', fuel: 'hybride', luggage: 3, minAge: 21,
      accent: '#22c1c3', ink: '#05201f', img: 'clio.webp' },
    { id: 'b0', category: 'berline', catFr: 'Berline', catEn: 'Sedan', brand: 'Audi', model: 'A3 (2026)',
      badge: 'premium', tagFr: 'Premium', tagEn: 'Premium',
      price: 129, priceWeekend: 235, priceWeek: 710,
      seats: 5, transmission: 'auto', fuel: 'essence', luggage: 3, minAge: 23,
      accent: '#3b82f6', ink: '#06122b', img: 'audi.webp' }
  ];

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

  function specRow(labelFr, labelEn, valueFr, valueEn) {
    return '<li><span data-fr="' + labelFr + '" data-en="' + labelEn + '">' + labelFr + '</span><span data-fr="' + valueFr + '" data-en="' + valueEn + '">' + valueFr + '</span></li>';
  }

  function buildCard(car) {
    var badge = BADGES[car.badge];
    var trans = TRANSMISSION[car.transmission];
    var fuel = FUEL[car.fuel];
    var fuelIcon = (car.fuel === 'electrique' || car.fuel === 'hybride') ? 'bolt' : 'drop';
    // La photo passe au-dessus ; si le fichier manque, le navigateur
    // declenche onerror et la silhouette vectorielle reprend la main,
    // donc une carte n'est jamais vide.
    var visual = car.img
      ? '<span class="car-ground"></span>' +
        '<span class="car-fallback">' + silhouette(car.category) + '</span>' +
        '<img class="car-photo" src="' + car.img + '" alt="' + car.brand + ' ' + car.model + '"' +
        ' onerror="this.parentNode.querySelector(\'.car-fallback\').style.display=\'flex\';this.remove();">'
      : silhouette(car.category);
    var styleVars = 'style="--accent:' + car.accent + '; --accent-bg: linear-gradient(165deg,' + car.accent + '26,#0a0b0d 72%);"';
    var carLabel = car.brand + ' ' + car.model;

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
                '<p class="car-name">' + carLabel + '</p>' +
                '<p class="car-cat" data-fr="' + car.catFr + '" data-en="' + car.catEn + '">' + car.catFr + '</p>' +
                '<div class="car-specs">' +
                  specChip('seat', car.seats + ' places', car.seats + ' seats') +
                  specChip('gear', trans[0], trans[1]) +
                  specChip(fuelIcon, fuel[0], fuel[1]) +
                '</div>' +
                '<div class="car-meta-row">' +
                  '<span class="car-price">' + car.price + '€<small data-fr="/jour" data-en="/day"> /jour</small></span>' +
                  '<button type="button" class="car-cta" data-fr="Détails" data-en="Details">Détails</button>' +
                '</div>' +
              '</div>' +
            '</div>' +
          '</div>' +
          '<div class="car-face car-face-back">' +
            '<div class="car-face-inner">' +
              '<div class="car-back-bg" ' + styleVars + '></div>' +
              '<div class="car-back-overlay"></div>' +
              '<div class="car-back-content">' +
                '<p class="car-back-name">' + carLabel + '</p>' +
                '<p class="car-back-prices"><b>' + car.price + '€</b> <span data-fr="/ jour" data-en="/ day">/ jour</span> · <b>' + car.priceWeek + '€</b> <span data-fr="/ semaine" data-en="/ week">/ semaine</span></p>' +
                '<ul class="car-spec-list">' +
                  specRow('Places', 'Seats', String(car.seats), String(car.seats)) +
                  specRow('Boîte', 'Transmission', trans[0], trans[1]) +
                  specRow('Carburant', 'Fuel', fuel[0], fuel[1]) +
                  specRow('Bagages', 'Luggage', String(car.luggage), String(car.luggage)) +
                  specRow('Âge minimum', 'Min. age', car.minAge + ' ans', car.minAge + ' yo') +
                '</ul>' +
                '<p class="car-back-location" data-fr="Prise en charge : Lorient (56)" data-en="Pickup: Lorient, Brittany">Prise en charge : Lorient (56)</p>' +
                '<a class="car-reserve" href="' + WARENT.waLink(carLabel, car.price) + '" data-car="' + carLabel + '" data-price="' + car.price + '" target="_blank" rel="noopener" data-fr="Réserver maintenant" data-en="Reserve now">Réserver maintenant</a>' +
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

  viewport.addEventListener('pointerdown', function (e) {
    dragging = true;
    moved = false;
    startX = e.clientX;
    startProgress = targetProgress;
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

  function unflipAll() {
    cardEls.forEach(function (el) {
      var f = el.querySelector('.car-flip');
      if (f) f.classList.remove('is-flipped');
    });
  }

  function endDrag() {
    if (!dragging) return;
    dragging = false;
    viewport.classList.remove('is-dragging');
    if (moved) {
      targetProgress = Math.round(targetProgress);
      clampTarget();
      unflipAll();
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

  if (prevBtn) prevBtn.addEventListener('click', function () { targetProgress = Math.round(targetProgress) - 1; clampTarget(); unflipAll(); });
  if (nextBtn) nextBtn.addEventListener('click', function () { targetProgress = Math.round(targetProgress) + 1; clampTarget(); unflipAll(); });

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

  track.addEventListener('click', function (e) {
    if (suppressClick) return;
    if (e.target.closest && e.target.closest('.car-reserve')) return;
    var slot = e.target.closest ? e.target.closest('.car-slot') : null;
    if (!slot) return;
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
      unflipAll();
      return;
    }

    var flipEl = slot.querySelector('.car-flip');
    if (flipEl) flipEl.classList.toggle('is-flipped');
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

  WARENT.fleet = FLEET;

  renderCars();
  requestAnimationFrame(loop);
})();

// ---- Section Tarifs, generee depuis FLEET ----
(function () {
  var grid = document.getElementById('price-grid');
  if (!grid || !WARENT.fleet) return;

  function row(labelFr, labelEn, amount) {
    return '<li><span data-fr="' + labelFr + '" data-en="' + labelEn + '">' + labelFr +
           '</span><b>' + amount + ' €</b></li>';
  }

  var INCLUDED = [
    ['200 km inclus par jour', '200 km included per day'],
    ['Assurance et entretien inclus', 'Insurance and servicing included'],
    ['Véhicule nettoyé et contrôlé avant chaque départ', 'Cleaned and checked before every rental'],
    ['Livraison possible dans le Morbihan', 'Delivery available across Morbihan']
  ];

  grid.innerHTML = WARENT.fleet.map(function (car) {
    var label = car.brand + ' ' + car.model;
    return '<article class="price-card" style="--accent:' + car.accent + '; --ink:' + car.ink + '">' +
      '<span class="price-tag" data-fr="' + car.tagFr + '" data-en="' + car.tagEn + '">' + car.tagFr + '</span>' +
      '<h3 class="price-name">' + label + '</h3>' +
      '<p class="price-cat" data-fr="' + car.catFr + '" data-en="' + car.catEn + '">' + car.catFr + '</p>' +
      '<ul class="price-rows">' +
        row('1 jour', '1 day', car.price) +
        row('Week-end (2 jours)', 'Weekend (2 days)', car.priceWeekend) +
        row('Semaine (7 jours)', 'Week (7 days)', car.priceWeek) +
      '</ul>' +
      '<ul class="price-incl">' +
        INCLUDED.map(function (i) {
          return '<li data-fr="' + i[0] + '" data-en="' + i[1] + '">' + i[0] + '</li>';
        }).join('') +
      '</ul>' +
      '<a class="price-cta" href="#" data-car="' + label + '" data-price="' + car.price + '"' +
      ' target="_blank" rel="noopener" data-fr="Réserver sur WhatsApp" data-en="Book on WhatsApp">Réserver sur WhatsApp</a>' +
    '</article>';
  }).join('');
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

  // Créneaux horaires en 24h, toutes les 30 min. Un <select> plutôt qu'un
  // <input type="time"> : le format natif suit la langue du système (donc
  // AM/PM sur un appareil configuré en anglais) et reste capricieux au tap
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

  // [data-car] couvre a la fois les cartes de la flotte et les boutons de la
  // section Tarifs, pour que tous repartent avec les dates choisies.
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

    storeLang(lang);
  }

  btns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      setLanguage(btn.getAttribute('data-lang-btn'));
    });
  });

  setLanguage(getStoredLang() || 'fr');
})();

