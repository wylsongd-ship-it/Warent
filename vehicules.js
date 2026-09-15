// Page flotte : n'affiche les vehicules qu'une fois les dates choisies sur
// l'accueil. Les dates arrivent par l'URL (core.js les a deja relues dans
// WARENT.search) ; sans elles, on renvoie le visiteur vers la recherche.
(function () {
  var tripEl = document.getElementById('vh-trip');
  var subtitleEl = document.getElementById('vh-subtitle');
  if (!tripEl) return;

  var t = WARENT.t;

  function icon(name) {
    return WARENT.icons[name] || '';
  }

  function renderTrip() {
    var s = WARENT.search;

    if (!s) {
      // Arrivee directe sur l'URL, sans passer par la recherche.
      tripEl.className = 'vh-trip vh-trip-empty';
      tripEl.innerHTML =
        '<p class="vh-trip-empty-text">' +
          t('Choisissez vos dates pour voir les tarifs correspondants.',
            'Pick your dates to see the matching prices.') +
        '</p>' +
        '<a class="vh-trip-cta" href="index.html">' +
          t('Choisir mes dates', 'Pick my dates') +
        '</a>';
      subtitleEl.textContent = t('Citadine et berline, au départ de Lorient (56).',
                                 'City car and sedan, departing from Lorient (56).');
      return;
    }

    tripEl.className = 'vh-trip';
    tripEl.innerHTML =
      '<div class="vh-trip-item">' +
        '<span class="vh-trip-icon">' + icon('pin') + '</span>' +
        '<div>' +
          '<p class="vh-trip-label">' + t('Prise en charge', 'Pick-up') + '</p>' +
          '<p class="vh-trip-value">' + s.city + '</p>' +
        '</div>' +
      '</div>' +
      '<div class="vh-trip-item">' +
        '<span class="vh-trip-icon">' + icon('calendar') + '</span>' +
        '<div>' +
          '<p class="vh-trip-label">' + t('Départ', 'Departure') + '</p>' +
          '<p class="vh-trip-value">' + t(s.fromFr, s.fromEn) + '</p>' +
        '</div>' +
      '</div>' +
      '<div class="vh-trip-item">' +
        '<span class="vh-trip-icon">' + icon('calendar') + '</span>' +
        '<div>' +
          '<p class="vh-trip-label">' + t('Retour', 'Return') + '</p>' +
          '<p class="vh-trip-value">' + t(s.toFr, s.toEn) + '</p>' +
        '</div>' +
      '</div>' +
      '<a class="vh-trip-edit" href="index.html">' +
        t('Modifier', 'Change') +
      '</a>';

    subtitleEl.textContent = s.days > 1
      ? t('Tarifs calculés pour ' + s.days + ' jours de location.',
          'Prices calculated for a ' + s.days + '-day rental.')
      : t('Tarifs calculés pour 1 jour de location.',
          'Prices calculated for a 1-day rental.');
  }

  renderTrip();
  // Le changement de langue redessine ce bloc, genere en JS.
  WARENT.renderTrip = renderTrip;
})();
