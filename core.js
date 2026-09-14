// Socle commun a la page d'accueil et a la page de reservation : donnees de la
// flotte, libelles, calcul des tarifs et petits utilitaires de langue.
// Charge avant app.js et reservation.js. Une seule source de verite, donc les
// prix affiches sur les cartes, dans la fiche et sur le recap ne peuvent pas
// diverger.
var WARENT = {
  bookingEmail: 'wylsongd@gmail.com',
  phone: '971501234567',
  kmPerDay: 200,
  search: null
};

WARENT.lang = function () {
  return document.documentElement.lang === 'en' ? 'en' : 'fr';
};

WARENT.t = function (fr, en) {
  return WARENT.lang() === 'en' ? en : fr;
};

WARENT.money = function (n) {
  return n.toLocaleString(WARENT.lang() === 'en' ? 'en-GB' : 'fr-FR') + ' €';
};

WARENT.icons = {
  seat: '<svg viewBox="0 0 24 24"><path d="M7 13V7a2 2 0 012-2h6a2 2 0 012 2v6M5 13h14v4a2 2 0 01-2 2H7a2 2 0 01-2-2v-4z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"/></svg>',
  gear: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3.2" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M12 3v2.4M12 18.6V21M21 12h-2.4M5.4 12H3M18.4 5.6l-1.7 1.7M7.3 16.7l-1.7 1.7M18.4 18.4l-1.7-1.7M7.3 7.3L5.6 5.6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
  drop: '<svg viewBox="0 0 24 24"><path d="M12 3s6 6.6 6 11a6 6 0 11-12 0c0-4.4 6-11 6-11z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>',
  bolt: '<svg viewBox="0 0 24 24"><path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z" fill="currentColor"/></svg>',
  bag: '<svg viewBox="0 0 24 24"><rect x="4" y="7.5" width="16" height="12.5" rx="2" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M9 7.5V5.6A1.6 1.6 0 0110.6 4h2.8A1.6 1.6 0 0115 5.6v1.9" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
  cabin: '<svg viewBox="0 0 24 24"><rect x="6" y="9" width="12" height="11" rx="1.8" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M10 9V6.4A1.4 1.4 0 0111.4 5h1.2A1.4 1.4 0 0114 6.4V9" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
  door: '<svg viewBox="0 0 24 24"><path d="M5 20V6.6a1.6 1.6 0 011.3-1.57l9-1.8A1.6 1.6 0 0117 4.8V20z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><circle cx="13.6" cy="12.4" r="1" fill="currentColor"/></svg>',
  id: '<svg viewBox="0 0 24 24"><rect x="3" y="5.5" width="18" height="13" rx="2.2" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="9" cy="11" r="2" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M14 10h4M14 13.5h4M5.6 16c.6-1.6 1.9-2.4 3.4-2.4s2.8.8 3.4 2.4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
  pin: '<svg viewBox="0 0 24 24"><path d="M12 21s7-5.6 7-11a7 7 0 10-14 0c0 5.4 7 11 7 11z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><circle cx="12" cy="10" r="2.6" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>',
  calendar: '<svg viewBox="0 0 24 24"><rect x="3.5" y="5.5" width="17" height="15" rx="2.2" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M3.5 10h17M8 3.5v4M16 3.5v4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>'
};

WARENT.labels = {
  transmission: { auto: ['Automatique', 'Automatic'], manual: ['Manuelle', 'Manual'] },
  fuel: {
    essence: ['Essence', 'Petrol'],
    diesel: ['Diesel', 'Diesel'],
    electrique: ['Électrique', 'Electric'],
    hybride: ['Hybride', 'Hybrid']
  },
  badges: {
    available: ['Disponible', 'Available'],
    popular: ['Populaire', 'Popular'],
    electric: ['Électrique', 'Electric'],
    premium: ['Premium', 'Premium']
  }
};

WARENT.fleet = [
  { id: 'c0', category: 'citadine', catFr: 'Citadine', catEn: 'City car', brand: 'Renault', model: 'Clio 5 Esprit Alpine',
    badge: 'popular', tagFr: 'Le plus demandé', tagEn: 'Most booked',
    price: 89, priceWeekend: 160, priceWeek: 490, kmUnlimited: 10,
    seats: 5, doors: 5, transmission: 'auto', fuel: 'hybride', luggage: 3, cabin: 1, minAge: 21, licenceYears: 2,
    accent: '#22c1c3', ink: '#05201f', img: 'clio.webp' },
  { id: 'b0', category: 'berline', catFr: 'Berline', catEn: 'Sedan', brand: 'Audi', model: 'A3 (2026)',
    badge: 'premium', tagFr: 'Premium', tagEn: 'Premium',
    price: 129, priceWeekend: 235, priceWeek: 710, kmUnlimited: 15,
    seats: 5, doors: 5, transmission: 'auto', fuel: 'essence', luggage: 3, cabin: 1, minAge: 23, licenceYears: 3,
    accent: '#3b82f6', ink: '#06122b', img: 'audi.webp' }
];

WARENT.included = [
  ['Assurance et entretien inclus', 'Insurance and servicing included'],
  ['Véhicule nettoyé et contrôlé avant chaque départ', 'Cleaned and checked before every rental'],
  ['Retrait à Lorient, livraison possible dans le Morbihan', 'Pick-up in Lorient, delivery available across Morbihan']
];

WARENT.carById = function (id) {
  return WARENT.fleet.filter(function (c) { return c.id === id; })[0] || null;
};

// Meilleure combinaison des tarifs publies pour une duree donnee : on ne
// facture jamais plus que la formule la plus avantageuse affichee au client.
WARENT.bestPrice = function (car, days) {
  var weeks = Math.floor(days / 7);
  var rest = days % 7;
  var restCost = Math.floor(rest / 2) * car.priceWeekend + (rest % 2) * car.price;
  var byBlocks = weeks * car.priceWeek + restCost;
  var byDays = days * car.price;
  var best = Math.min(byBlocks, byDays);
  if (days > 7 * weeks && weeks >= 1) best = Math.min(best, (weeks + 1) * car.priceWeek);
  if (days <= 7) best = Math.min(best, car.priceWeek);
  return best;
};

WARENT.durationsFor = function (car) {
  var list = [
    { id: 'day', days: 1, fr: '1 jour', en: '1 day', subFr: 'Formule journée', subEn: 'Day rate', total: car.price },
    { id: 'weekend', days: 2, fr: 'Week-end', en: 'Weekend', subFr: '2 jours consécutifs', subEn: '2 consecutive days', total: car.priceWeekend },
    { id: 'week', days: 7, fr: 'Semaine', en: 'Week', subFr: '7 jours consécutifs', subEn: '7 consecutive days', total: car.priceWeek }
  ];
  var s = WARENT.search;
  if (s && s.days && s.days !== 1 && s.days !== 2 && s.days !== 7) {
    list.unshift({
      id: 'search', days: s.days,
      fr: 'Vos dates (' + s.days + ' jours)', en: 'Your dates (' + s.days + ' days)',
      subFr: 'Du ' + s.fromFr + ' au ' + s.toFr, subEn: 'From ' + s.fromEn + ' to ' + s.toEn,
      total: WARENT.bestPrice(car, s.days)
    });
  }
  return list;
};

WARENT.totals = function (car, choice) {
  var durations = WARENT.durationsFor(car);
  var d = durations.filter(function (x) { return x.id === choice.duration; })[0] || durations[0];
  var extra = choice.km === 'unlimited' ? car.kmUnlimited * d.days : 0;
  return {
    duration: d,
    extra: extra,
    total: d.total + extra,
    perDay: Math.round((d.total + extra) / d.days)
  };
};

WARENT.kmLabel = function (car, choice) {
  return choice.km === 'unlimited'
    ? WARENT.t('Kilomètres illimités (+' + car.kmUnlimited + ' €/jour)',
               'Unlimited mileage (+' + car.kmUnlimited + ' €/day)')
    : WARENT.kmPerDay + WARENT.t(' km par jour inclus', ' km per day included');
};

WARENT.pickupLabel = function () {
  var s = WARENT.search;
  if (!s) return 'Lorient (56)';
  return s.city + WARENT.t(', du ' + s.fromFr + ' au ' + s.toFr,
                           ', from ' + s.fromEn + ' to ' + s.toEn);
};

// La selection voyage d'une page a l'autre dans l'URL : pas de stockage, donc
// un lien de reservation reste valable si le client l'envoie a quelqu'un.
WARENT.bookingUrl = function (car, choice) {
  var p = ['car=' + encodeURIComponent(car.id),
           'dur=' + encodeURIComponent(choice.duration),
           'km=' + encodeURIComponent(choice.km)];
  var s = WARENT.search;
  if (s) {
    p.push('days=' + s.days);
    p.push('city=' + encodeURIComponent(s.city));
    p.push('from=' + encodeURIComponent(s.fromFr));
    p.push('to=' + encodeURIComponent(s.toFr));
    p.push('fromEn=' + encodeURIComponent(s.fromEn));
    p.push('toEn=' + encodeURIComponent(s.toEn));
  }
  return 'reservation.html?' + p.join('&');
};

WARENT.readBookingUrl = function () {
  var q = {};
  var raw = window.location.search.replace(/^\?/, '');
  if (raw) {
    raw.split('&').forEach(function (pair) {
      var i = pair.indexOf('=');
      if (i < 0) return;
      q[decodeURIComponent(pair.slice(0, i))] = decodeURIComponent(pair.slice(i + 1).replace(/\+/g, ' '));
    });
  }
  if (q.days && q.from && q.to) {
    WARENT.search = {
      city: q.city || 'Lorient',
      days: parseInt(q.days, 10) || 1,
      fromFr: q.from, toFr: q.to,
      fromEn: q.fromEn || q.from, toEn: q.toEn || q.to,
      sentence: 'à ' + (q.city || 'Lorient') + ', du ' + q.from + ' au ' + q.to
    };
  }
  var car = WARENT.carById(q.car) || WARENT.fleet[0];
  var choice = {
    duration: ['day', 'weekend', 'week', 'search'].indexOf(q.dur) > -1 ? q.dur : 'day',
    km: q.km === 'unlimited' ? 'unlimited' : 'included'
  };
  return { car: car, choice: choice };
};
