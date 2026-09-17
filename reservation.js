// Page de demande de reservation : le vehicule et la formule arrivent par
// l'URL, le recap est recalcule a partir de core.js (jamais recopie), et
// l'envoi ouvre la messagerie du client avec le recapitulatif deja redige.
(function () {
  var sel = WARENT.readBookingUrl();
  var car = sel.car;
  var choice = sel.choice;
  var t = WARENT.t;
  var money = WARENT.money;

  var form = document.getElementById('booking-form');
  var recapEl = document.getElementById('bk-recap');
  var headerTotal = document.getElementById('header-total');
  var doneEl = document.getElementById('bk-done');
  var mainEl = document.getElementById('bk-main');

  // Le retour ramene a la liste des vehicules en conservant les dates.
  var backEl = document.getElementById('bk-back');
  if (backEl) backEl.setAttribute('href', WARENT.fleetUrl());

  document.documentElement.style.setProperty('--accent', car.accent);
  document.documentElement.style.setProperty('--ink', car.ink);

  function sums() {
    return WARENT.totals(car, choice);
  }

  // ---------- recapitulatif ----------
  function renderRecap() {
    var s = sums();
    var trans = WARENT.labels.transmission[car.transmission] || ['', ''];
    var search = WARENT.search;
    var visual = car.img
      ? '<img class="bk-recap-photo" src="' + car.img + '" alt="' + car.brand + ' ' + car.model + '">'
      : '';

    headerTotal.textContent = money(s.total);

    recapEl.innerHTML =
      '<div class="bk-recap-head">' +
        '<div class="bk-recap-thumb">' + visual + '</div>' +
        '<div class="bk-recap-id">' +
          '<p class="bk-recap-name">' + car.brand + ' ' + car.model + '</p>' +
          '<p class="bk-recap-cat">' + t(car.catFr, car.catEn) + ' · ' + t(trans[0], trans[1]) + '</p>' +
        '</div>' +
      '</div>' +

      '<h3 class="bk-recap-title">' + t('Prise en charge et retour', 'Pick-up and return') + '</h3>' +
      '<div class="bk-trip">' +
        '<div class="bk-trip-line">' +
          '<span class="bk-trip-dot"></span>' +
          '<div>' +
            '<p class="bk-trip-label">' + t('Prise en charge', 'Pick-up') + '</p>' +
            '<p class="bk-trip-value">' + (search ? search.city : 'Lorient (56)') + '</p>' +
            '<p class="bk-trip-date">' + (search ? t(search.fromFr, search.fromEn) : t('Date à confirmer', 'Date to confirm')) + '</p>' +
          '</div>' +
        '</div>' +
        '<div class="bk-trip-line">' +
          '<span class="bk-trip-dot"></span>' +
          '<div>' +
            '<p class="bk-trip-label">' + t('Retour', 'Return') + '</p>' +
            '<p class="bk-trip-value">' + (search ? search.city : 'Lorient (56)') + '</p>' +
            '<p class="bk-trip-date">' + (search ? t(search.toFr, search.toEn) : t('Date à confirmer', 'Date to confirm')) + '</p>' +
          '</div>' +
        '</div>' +
      '</div>' +

      '<h3 class="bk-recap-title">' + t('Votre formule', 'Your rate') + '</h3>' +
      '<ul class="bk-recap-rows">' +
        '<li><span>' + t(s.duration.fr, s.duration.en) + '</span><b>' + money(s.duration.total) + '</b></li>' +
        (s.extra
          ? '<li><span>' + t('Kilomètres illimités', 'Unlimited mileage') + ' (' + s.duration.days +
            t(' j', ' d') + ' × ' + money(car.kmUnlimited) + ')</span><b>' + money(s.extra) + '</b></li>'
          : '<li><span>' + WARENT.kmPerDay + t(' km par jour', ' km per day') + '</span><b>' + t('Inclus', 'Included') + '</b></li>') +
      '</ul>' +

      '<h3 class="bk-recap-title">' + t('Ce qui est inclus', "What's included") + '</h3>' +
      '<ul class="bk-recap-incl">' +
        WARENT.included.map(function (i) { return '<li>' + t(i[0], i[1]) + '</li>'; }).join('') +
      '</ul>' +

      '<div class="bk-recap-total">' +
        '<span>' + t('Total estimé', 'Estimated total') + '</span>' +
        '<b>' + money(s.total) + '</b>' +
      '</div>' +
      '<p class="bk-recap-note">' + money(s.perDay) + t(' / jour · dépôt de garantie en plus, restitué au retour',
                                                        ' / day · security deposit on top, released on return') + '</p>';
  }

  // ---------- conditions dependantes du vehicule ----------
  function renderRequirements() {
    var article = /^[aeiouyéèêAEIOUY]/.test(car.brand) ? "l'" : 'la ';
    document.getElementById('bk-requirements').textContent =
      t('Pour ' + article + car.brand + ' ' + car.model + ', WaRent demande ' + car.minAge +
        ' ans minimum et ' + car.licenceYears + ' ans de permis. Les originaux sont vérifiés en personne à la remise des clés.',
        'For the ' + car.brand + ' ' + car.model + ', WaRent requires a minimum age of ' + car.minAge +
        ' and ' + car.licenceYears + ' years of licence. Originals are checked in person at handover.');
    document.getElementById('bk-age-label').textContent =
      t("J'ai " + car.minAge + ' ans ou plus', 'I am ' + car.minAge + ' or older');
    document.getElementById('bk-licence-label').textContent =
      t("J'ai le permis depuis au moins " + car.licenceYears + ' ans',
        'I have held my licence for at least ' + car.licenceYears + ' years');
  }

  // ---------- validation ----------
  function showError(id, msg) {
    var el = document.querySelector('.bk-error[data-for="' + id + '"]');
    if (!el) return;
    el.textContent = msg;
    el.hidden = false;
    var field = document.getElementById(id);
    if (field) field.classList.add('is-invalid');
  }

  function clearErrors() {
    Array.prototype.forEach.call(document.querySelectorAll('.bk-error'), function (el) { el.hidden = true; });
    Array.prototype.forEach.call(document.querySelectorAll('.is-invalid'), function (el) { el.classList.remove('is-invalid'); });
  }

  function value(id) {
    return (document.getElementById(id).value || '').trim();
  }

  function validate() {
    clearErrors();
    var ok = true;
    var email = value('bk-email');
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      showError('bk-email', t('Merci d\'indiquer une adresse e-mail valide.', 'Please enter a valid email address.'));
      ok = false;
    }
    if (!value('bk-first')) {
      showError('bk-first', t('Votre prénom est requis.', 'Your first name is required.'));
      ok = false;
    }
    if (!value('bk-last')) {
      showError('bk-last', t('Votre nom est requis.', 'Your last name is required.'));
      ok = false;
    }
    var phone = value('bk-phone').replace(/[\s.\-]/g, '');
    if (!phone || !/^\d{6,15}$/.test(phone)) {
      showError('bk-phone', t('Merci d\'indiquer un numéro de téléphone valide.', 'Please enter a valid phone number.'));
      ok = false;
    }
    if (!document.getElementById('bk-age').checked || !document.getElementById('bk-licence').checked) {
      showError('bk-checks', t('Ces deux conditions doivent être remplies pour louer ce véhicule.',
                               'Both conditions must be met to rent this vehicle.'));
      ok = false;
    }
    if (!document.getElementById('bk-consent').checked) {
      showError('bk-consent', t('Merci d\'accepter les conditions pour envoyer la demande.',
                                'Please accept the conditions to send your request.'));
      ok = false;
    }
    if (!ok) {
      var first = document.querySelector('.bk-error:not([hidden])');
      if (first && first.scrollIntoView) first.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    return ok;
  }

  // ---------- e-mail recapitulatif ----------
  // Un numero saisi "06 12 …" derriere un indicatif international donnerait
  // "+33 06 12 …" : on retire le zero de tete.
  function fullPhone() {
    var dial = document.getElementById('bk-dial').value;
    var raw = value('bk-phone').replace(/[\s.\-]/g, '');
    if (raw.charAt(0) === '0') raw = raw.slice(1);
    return dial + ' ' + raw;
  }

  // Numero de reservation : tire a l'envoi, il part dans l'objet de l'e-mail,
  // s'affiche sur la confirmation et sert de cle a « Mes reservations ».
  function saveBooking(ref) {
    WARENT.saveBooking({
      ref: ref,
      createdAt: new Date().toISOString(),
      email: value('bk-email'),
      first: value('bk-first'),
      last: value('bk-last'),
      phone: fullPhone(),
      company: value('bk-company'),
      message: value('bk-message'),
      carId: car.id,
      duration: choice.duration,
      km: choice.km,
      search: WARENT.search
    });
  }

  function mailHref(ref) {
    var NL = String.fromCharCode(13, 10);
    var s = sums();
    var search = WARENT.search;
    var company = value('bk-company');
    var message = value('bk-message');
    var lines = [
      t('Bonjour,', 'Hello,'),
      '',
      t('Je souhaite réserver le véhicule suivant.', 'I would like to book the following vehicle.'),
      '',
      t('Numéro de réservation : ', 'Booking number: ') + ref,
      '',
      '--- ' + t('VÉHICULE', 'VEHICLE') + ' ---',
      t('Véhicule : ', 'Vehicle: ') + car.brand + ' ' + car.model + ' (' + t(car.catFr, car.catEn) + ')',
      t('Formule : ', 'Rate: ') + t(s.duration.fr, s.duration.en),
      t('Durée : ', 'Duration: ') + s.duration.days + (s.duration.days > 1 ? t(' jours', ' days') : t(' jour', ' day')),
      t('Kilométrage : ', 'Mileage: ') + WARENT.kmLabel(car, choice),
      t('Prise en charge : ', 'Pick-up: ') + (search ? search.city : 'Lorient (56)'),
      t('Départ : ', 'Departure: ') + (search ? t(search.fromFr, search.fromEn) : t('à convenir', 'to be agreed')),
      t('Retour : ', 'Return: ') + (search ? t(search.toFr, search.toEn) : t('à convenir', 'to be agreed')),
      t('Total estimé : ', 'Estimated total: ') + s.total + ' € (' + s.perDay + t(' €/jour)', ' €/day)'),
      '',
      '--- ' + t('CONDUCTEUR', 'DRIVER') + ' ---',
      t('Nom : ', 'Name: ') + value('bk-first') + ' ' + value('bk-last'),
      t('E-mail : ', 'Email: ') + value('bk-email'),
      t('Téléphone : ', 'Phone: ') + fullPhone()
    ];
    if (company) lines.push(t('Entreprise : ', 'Company: ') + company);
    lines.push(t('Confirme avoir ' + car.minAge + ' ans ou plus et ' + car.licenceYears + ' ans de permis.',
                 'Confirms being ' + car.minAge + ' or older with ' + car.licenceYears + ' years of licence.'));
    if (message) {
      lines.push('');
      lines.push('--- ' + t('MESSAGE', 'MESSAGE') + ' ---');
      lines.push(message);
    }
    lines.push('');
    lines.push(t('Merci de me confirmer la disponibilité, le dépôt de garantie et l\'heure de remise.',
                 'Please confirm availability, the deposit and the handover time.'));

    return 'mailto:' + WARENT.bookingEmail +
      '?subject=' + encodeURIComponent(
        t('Demande de réservation ', 'Booking request ') + ref + ' — ' + car.brand + ' ' + car.model +
        ' — ' + value('bk-first') + ' ' + value('bk-last')) +
      '&body=' + encodeURIComponent(lines.join(NL));
  }

  // ---------- confirmation ----------
  // Le numero est ce que le client doit repartir avec : il est donne en
  // grand, copiable d'un geste, et l'ecran renvoie vers « Mes reservations »
  // ou il servira de cle.
  function renderDone(href, ref) {
    var article = /^[aeiouyéèêAEIOUY]/.test(car.brand) ? "l'" : 'la ';
    doneEl.innerHTML =
      '<div class="bk-done-card">' +
        '<span class="bk-done-mark" aria-hidden="true"></span>' +
        '<h1 class="bk-done-title">' + t('Demande envoyée', 'Request sent') + '</h1>' +
        '<div class="bk-ref">' +
          '<p class="bk-ref-label">' + t('Votre numéro de réservation', 'Your booking number') + '</p>' +
          '<p class="bk-ref-value" id="bk-ref-value">' + ref + '</p>' +
          '<button type="button" class="bk-ref-copy" id="bk-ref-copy">' + t('Copier', 'Copy') + '</button>' +
        '</div>' +
        '<p class="bk-done-text">' +
          t('Votre messagerie s\'est ouverte avec le récapitulatif. Vérifiez qu\'il est bien parti : WaRent vous confirme la disponibilité de ' + article + car.brand + ' ' + car.model + ' sous 24 h.',
            'Your mail app has opened with the summary. Check that it went out: WaRent will confirm availability of the ' + car.brand + ' ' + car.model + ' within 24 hours.') +
        '</p>' +
        '<p class="bk-done-sub">' +
          t('Gardez ce numéro : avec l\'adresse ' + value('bk-email') + ', il retrouve votre réservation dans « Mes réservations ». Rien n\'a été débité — le règlement et le dépôt de garantie se font à la remise des clés.',
            'Keep this number: together with ' + value('bk-email') + ', it brings your booking up under "My bookings". Nothing has been charged — payment and the deposit are handled at handover.') +
        '</p>' +
        '<div class="bk-done-actions">' +
          '<a class="bk-done-again" href="mes-reservations.html?ref=' + encodeURIComponent(ref) +
            '&email=' + encodeURIComponent(value('bk-email')) + '">' +
            t('Voir ma réservation', 'View my booking') + '</a>' +
          '<a class="bk-done-home" href="' + href + '">' + t('Rouvrir l\'e-mail', 'Reopen the email') + '</a>' +
        '</div>' +
      '</div>';
    mainEl.hidden = true;
    doneEl.hidden = false;
    window.scrollTo(0, 0);

    var copy = document.getElementById('bk-ref-copy');
    if (copy) {
      copy.addEventListener('click', function () {
        var label = copy.textContent;
        function feedback(text) {
          copy.textContent = text;
          setTimeout(function () { copy.textContent = label; }, 1800);
        }
        // Le presse-papiers n'existe pas partout (page servie en http, vieux
        // navigateur, permission refusee) : on selectionne alors le numero et
        // on le dit, le client finit le copier lui-meme.
        function fallback() {
          selectRef();
          feedback(t('Sélectionné — copiez-le', 'Selected — copy it'));
        }
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(ref).then(
            function () { feedback(t('Copié', 'Copied')); },
            fallback
          );
        } else {
          fallback();
        }
      });
    }
  }

  function selectRef() {
    var el = document.getElementById('bk-ref-value');
    if (!el || !window.getSelection || !document.createRange) return;
    var range = document.createRange();
    range.selectNodeContents(el);
    var selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!validate()) return;
    var ref = WARENT.newBookingRef();
    saveBooking(ref);
    var href = mailHref(ref);
    window.location.href = href;
    setTimeout(function () { renderDone(href, ref); }, 400);
  });

  // ---------- langue ----------
  var STORAGE_KEY = 'warent-lang';
  var titles = { fr: 'WaRent — Demande de réservation', en: 'WaRent — Booking request' };
  var btns = document.querySelectorAll('.lang-btn');
  var textEls = document.querySelectorAll('[data-fr][data-en]');

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
    try { localStorage.setItem(STORAGE_KEY, lang); } catch (err) { }
    // Tout ce qui est genere en JS doit etre redessine dans la nouvelle langue.
    renderRecap();
    renderRequirements();
  }

  btns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      setLanguage(btn.getAttribute('data-lang-btn'));
    });
  });

  var stored = null;
  try { stored = localStorage.getItem(STORAGE_KEY); } catch (err) { }
  setLanguage(stored || 'fr');
})();
