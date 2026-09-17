// « Mes reservations » : on retrouve une demande avec son numero + l'adresse
// e-mail donnee au moment de l'envoi. Les fiches viennent de core.js, qui les
// range dans ce navigateur faute de serveur ; seuls le vehicule, la formule
// et les dates y sont stockes, les montants sont recalcules a l'affichage.
(function () {
  var t = WARENT.t;
  var money = WARENT.money;

  var lookup = document.getElementById('mr-lookup');
  var form = document.getElementById('mr-form');
  var refInput = document.getElementById('mr-ref');
  var mailInput = document.getElementById('mr-email');
  var error = document.getElementById('mr-error');
  var result = document.getElementById('mr-result');

  var EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  var shown = null;   // fiche affichee
  var errorKey = null;

  var MESSAGES = {
    ref: ['Entrez votre numéro de réservation à 10 chiffres, commençant par un 9.',
          'Enter your 10-digit booking number, starting with a 9.'],
    email: ['Entrez l’adresse e-mail utilisée pour la réservation.',
            'Enter the email address used for the booking.'],
    none: ['Aucune réservation ne correspond à ce numéro et à cette adresse. Vérifiez les deux, ou écrivez-nous : nous retrouvons votre demande.',
           'No booking matches this number and address. Check both, or email us and we’ll find your request.']
  };

  // Le texte affiche depend de la langue : on garde la cause de l'erreur,
  // pas la phrase, pour pouvoir la reecrire au changement de langue.
  function showError(key) {
    errorKey = key;
    if (!error) return;
    if (!key) {
      error.hidden = true;
    } else {
      error.textContent = t(MESSAGES[key][0], MESSAGES[key][1]);
      error.hidden = false;
    }
    [refInput, mailInput].forEach(function (input) {
      var bad = !!key && (key === 'none' || (key === 'ref' && input === refInput) ||
                          (key === 'email' && input === mailInput));
      input.classList.toggle('is-invalid', bad);
      input.setAttribute('aria-invalid', bad ? 'true' : 'false');
    });
  }

  [refInput, mailInput].forEach(function (input) {
    input.addEventListener('input', function () { showError(null); });
  });

  function mailto(subject, body) {
    return 'mailto:' + WARENT.bookingEmail +
      '?subject=' + encodeURIComponent(subject) +
      '&body=' + encodeURIComponent(body);
  }

  // ---------- fiche ----------
  function renderResult() {
    if (!shown) return;
    var d = WARENT.bookingDetails(shown);
    if (!d) {           // vehicule retire du catalogue depuis la demande
      showError('none');
      showLookup();
      return;
    }

    var car = d.car;
    var s = d.totals;
    var search = d.search;
    var trans = WARENT.labels.transmission[car.transmission] || ['', ''];
    var others = WARENT.bookingsForEmail(shown.email).filter(function (b) {
      return WARENT.cleanRef(b.ref) !== WARENT.cleanRef(shown.ref);
    });

    document.documentElement.style.setProperty('--accent', car.accent);
    document.documentElement.style.setProperty('--ink', car.ink);

    result.innerHTML =
      '<div class="mr-ref">' +
        '<span class="mr-status">' + t('Demande envoyée', 'Request sent') + '</span>' +
        '<p class="mr-ref-label">' + t('Numéro de réservation', 'Booking number') + '</p>' +
        '<p class="mr-ref-value">' + shown.ref + '</p>' +
        '<p class="mr-ref-date">' + t('Demande du ', 'Requested on ') + WARENT.bookingDate(shown) + '</p>' +
      '</div>' +

      '<div class="bk-recap-head">' +
        '<div class="bk-recap-thumb">' +
          (car.img ? '<img class="bk-recap-photo" src="' + car.img + '" alt="' + car.brand + ' ' + car.model + '">' : '') +
        '</div>' +
        '<div class="bk-recap-id">' +
          '<p class="bk-recap-name">' + car.brand + ' ' + car.model + '</p>' +
          '<p class="bk-recap-cat">' + t(car.catFr, car.catEn) + ' · ' + t(trans[0], trans[1]) + '</p>' +
        '</div>' +
      '</div>' +

      '<h2 class="bk-recap-title">' + t('Prise en charge et retour', 'Pick-up and return') + '</h2>' +
      '<div class="bk-trip">' +
        tripLine(t('Prise en charge', 'Pick-up'), search, 'from') +
        tripLine(t('Retour', 'Return'), search, 'to') +
      '</div>' +

      '<h2 class="bk-recap-title">' + t('Votre formule', 'Your rate') + '</h2>' +
      '<ul class="bk-recap-rows">' +
        '<li><span>' + t(s.duration.fr, s.duration.en) + '</span><b>' + money(s.duration.total) + '</b></li>' +
        (s.extra
          ? '<li><span>' + t('Kilomètres illimités', 'Unlimited mileage') + ' (' + s.duration.days +
            t(' j', ' d') + ' × ' + money(car.kmUnlimited) + ')</span><b>' + money(s.extra) + '</b></li>'
          : '<li><span>' + WARENT.kmPerDay + t(' km par jour', ' km per day') + '</span><b>' +
            t('Inclus', 'Included') + '</b></li>') +
      '</ul>' +

      '<div class="bk-recap-total">' +
        '<span>' + t('Total estimé', 'Estimated total') + '</span>' +
        '<b>' + money(s.total) + '</b>' +
      '</div>' +
      '<p class="bk-recap-note">' + money(s.perDay) +
        t(' / jour · dépôt de garantie en plus, restitué au retour',
          ' / day · security deposit on top, released on return') + '</p>' +

      '<h2 class="bk-recap-title">' + t('Conducteur', 'Driver') + '</h2>' +
      '<ul class="bk-recap-rows">' +
        '<li><span>' + t('Nom', 'Name') + '</span><b>' + esc(shown.first + ' ' + shown.last) + '</b></li>' +
        '<li><span>' + t('E-mail', 'Email') + '</span><b>' + esc(shown.email) + '</b></li>' +
        '<li><span>' + t('Téléphone', 'Phone') + '</span><b>' + esc(shown.phone || '—') + '</b></li>' +
        (shown.company ? '<li><span>' + t('Entreprise', 'Company') + '</span><b>' + esc(shown.company) + '</b></li>' : '') +
      '</ul>' +

      '<p class="mr-note">' +
        t('WaRent confirme la disponibilité par e-mail sous 24 h. Rien n’a été débité : le règlement et le dépôt de garantie se font à la remise des clés.',
          'WaRent confirms availability by email within 24 hours. Nothing has been charged: payment and the deposit are handled at handover.') +
      '</p>' +

      '<div class="bk-done-actions mr-actions">' +
        '<a class="bk-done-again" id="mr-change" href="#">' + t('Modifier ou annuler', 'Change or cancel') + '</a>' +
        '<button type="button" class="bk-done-home" id="mr-back">' + t('Chercher une autre réservation', 'Look up another booking') + '</button>' +
      '</div>' +

      (others.length
        ? '<div class="mr-others">' +
            '<h2 class="bk-recap-title">' + t('Vos autres réservations', 'Your other bookings') + '</h2>' +
            others.map(otherRow).join('') +
          '</div>'
        : '');

    var change = document.getElementById('mr-change');
    if (change) {
      change.href = mailto(
        t('WaRent — réservation ', 'WaRent — booking ') + shown.ref,
        t('Bonjour,\n\nJe souhaite modifier ou annuler la réservation ' + shown.ref + '.\n\n' +
          'Véhicule : ' + car.brand + ' ' + car.model + '\nNom : ' + shown.first + ' ' + shown.last + '\n\n',
          'Hello,\n\nI would like to change or cancel booking ' + shown.ref + '.\n\n' +
          'Vehicle: ' + car.brand + ' ' + car.model + '\nName: ' + shown.first + ' ' + shown.last + '\n\n')
      );
    }

    var back = document.getElementById('mr-back');
    if (back) back.addEventListener('click', showLookup);

    Array.prototype.forEach.call(result.querySelectorAll('[data-ref]'), function (btn) {
      btn.addEventListener('click', function () {
        var found = WARENT.findBooking(btn.getAttribute('data-ref'), shown.email);
        if (!found) return;
        shown = found;
        renderResult();
        window.scrollTo(0, 0);
      });
    });

    lookup.hidden = true;
    result.hidden = false;
  }

  function tripLine(label, search, key) {
    var date = search
      ? t(search[key + 'Fr'], search[key + 'En'])
      : t('Date à confirmer', 'Date to confirm');
    return '<div class="bk-trip-line">' +
      '<span class="bk-trip-dot"></span>' +
      '<div>' +
        '<p class="bk-trip-label">' + label + '</p>' +
        '<p class="bk-trip-value">' + esc(search ? search.city : 'Lorient (56)') + '</p>' +
        '<p class="bk-trip-date">' + esc(date) + '</p>' +
      '</div>' +
    '</div>';
  }

  function otherRow(booking) {
    var car = WARENT.carById(booking.carId);
    return '<button type="button" class="mr-other" data-ref="' + esc(booking.ref) + '">' +
      '<span class="mr-other-ref">' + esc(booking.ref) + '</span>' +
      '<span class="mr-other-car">' + esc(car ? car.brand + ' ' + car.model : t('Véhicule retiré', 'Vehicle withdrawn')) + '</span>' +
      '<span class="mr-other-date">' + WARENT.bookingDate(booking) + '</span>' +
    '</button>';
  }

  // Prenom, nom, entreprise et numero viennent d'une saisie libre : ils
  // repassent par le DOM en innerHTML, donc on les echappe.
  function esc(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function showLookup() {
    shown = null;
    result.hidden = true;
    result.innerHTML = '';
    lookup.hidden = false;
    showError(null);
    window.scrollTo(0, 0);
  }

  // ---------- recherche ----------
  function submit(ref, email, focusOnError) {
    if (!WARENT.isBookingRef(ref)) {
      showError('ref');
      if (focusOnError) refInput.focus();
      return false;
    }
    if (!EMAIL.test(String(email || '').trim())) {
      showError('email');
      if (focusOnError) mailInput.focus();
      return false;
    }
    var found = WARENT.findBooking(ref, email);
    if (!found) {
      showError('none');
      if (focusOnError) refInput.focus();
      return false;
    }
    showError(null);
    shown = found;
    renderResult();
    return true;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    submit(refInput.value, mailInput.value, true);
  });

  // ---------- langue ----------
  var STORAGE_KEY = 'warent-lang';
  var titles = { fr: 'WaRent — Mes réservations', en: 'WaRent — My bookings' };
  var btns = document.querySelectorAll('.lang-btn');
  var textEls = document.querySelectorAll('[data-fr][data-en]');
  var placeholders = { fr: 'Numéro de réservation', en: 'Booking number' };

  function setLanguage(lang) {
    if (lang !== 'en') lang = 'fr';
    document.documentElement.lang = lang;
    document.body.classList.toggle('lang-en', lang === 'en');
    document.title = titles[lang];
    textEls.forEach(function (el) {
      el.textContent = lang === 'en' ? el.dataset.en : el.dataset.fr;
    });
    btns.forEach(function (btn) {
      var isActive = btn.getAttribute('data-lang-btn') === lang;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });
    refInput.placeholder = placeholders[lang];
    mailInput.placeholder = lang === 'en' ? 'name@mail.com' : 'nom@mail.com';
    // La fiche et le message d'erreur sont ecrits en JS : ils echappent a
    // textEls et doivent etre redessines dans la nouvelle langue.
    if (errorKey) showError(errorKey);
    if (shown) renderResult();
    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) { }
  }

  btns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      setLanguage(btn.getAttribute('data-lang-btn'));
    });
  });

  var stored = null;
  try { stored = localStorage.getItem(STORAGE_KEY); } catch (e) { }
  setLanguage(stored || 'fr');

  // Arrivee depuis l'ecran de confirmation : le numero et l'adresse sont dans
  // l'URL, la fiche s'ouvre directement. Les champs sont remplis quand meme,
  // pour que le retour a la recherche ne reparte pas d'un formulaire vide.
  var q = WARENT.query();
  if (q.ref || q.email) {
    refInput.value = q.ref || '';
    mailInput.value = q.email || '';
    if (q.ref && q.email) submit(q.ref, q.email, false);
  }
})();
