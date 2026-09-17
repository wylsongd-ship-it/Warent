// Espace client : la mise en page reprend l'ecran de connexion de Sixt, mais
// sans authentification — il n'y a pas encore de comptes derriere. Donc :
// pas de champ mot de passe, pas de bouton Google/Apple qui ferait croire a
// une connexion qui n'existe pas. Le bouton principal fait quelque chose de
// reel : il prepare un e-mail pour etre prevenu a l'ouverture de l'espace.
// La rubrique « Mes reservations » viendra se brancher ici.
(function () {
  var form = document.getElementById('ac-form');
  var input = document.getElementById('ac-email');
  var error = document.getElementById('ac-error');
  var done = document.getElementById('ac-done');
  var wa = document.getElementById('ac-wa');
  var mail = document.getElementById('ac-mail');
  var pro = document.getElementById('ac-pro');

  var EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function mailto(subject, body) {
    return 'mailto:' + WARENT.bookingEmail +
      '?subject=' + encodeURIComponent(subject) +
      '&body=' + encodeURIComponent(body);
  }

  // Les liens portent du texte pre-rempli : ils sont donc reconstruits a
  // chaque changement de langue, comme le reste de la page.
  function applyLinks() {
    if (wa) {
      wa.href = 'https://wa.me/' + WARENT.phone + '?text=' +
        encodeURIComponent(WARENT.t(
          'Bonjour, je souhaite un point sur ma réservation WaRent.',
          'Hello, I would like an update on my WaRent booking.'
        ));
    }

    if (mail) {
      mail.href = mailto(
        WARENT.t('WaRent — ma réservation', 'WaRent — my booking'),
        WARENT.t(
          'Bonjour,\n\nJe vous écris au sujet de ma réservation WaRent.\n\n',
          'Hello,\n\nI am writing about my WaRent booking.\n\n'
        )
      );
    }

    if (pro) {
      pro.href = mailto(
        WARENT.t('WaRent — location pour une entreprise', 'WaRent — company rental'),
        WARENT.t(
          'Bonjour,\n\nJe loue pour une entreprise.\n\nSociété :\nBesoin (véhicule, durée, fréquence) :\nContact :\n\n',
          'Hello,\n\nI rent for a company.\n\nCompany:\nNeed (vehicle, duration, frequency):\nContact:\n\n'
        )
      );
    }
  }

  function showError(show) {
    if (!error) return;
    error.hidden = !show;
    if (input) {
      input.classList.toggle('is-invalid', show);
      input.setAttribute('aria-invalid', show ? 'true' : 'false');
    }
  }

  if (input) {
    input.addEventListener('input', function () { showError(false); });
  }

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var value = (input.value || '').trim();
      if (!EMAIL.test(value)) {
        showError(true);
        input.focus();
        return;
      }
      showError(false);

      var href = mailto(
        WARENT.t('WaRent — me prévenir à l’ouverture de l’espace client',
                 'WaRent — notify me when the customer area opens'),
        WARENT.t(
          'Bonjour,\n\nMerci de me prévenir à l’ouverture de l’espace client WaRent.\n\nMon e-mail : ' + value + '\n\n',
          'Hello,\n\nPlease let me know when the WaRent customer area opens.\n\nMy email: ' + value + '\n\n'
        )
      );

      form.hidden = true;
      if (done) done.hidden = false;
      window.location.href = href;
    });
  }

  var STORAGE_KEY = 'warent-lang';
  var titles = { fr: 'WaRent — Espace client', en: 'WaRent — Customer area' };
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
    if (input) {
      input.placeholder = lang === 'en' ? 'name@mail.com' : 'nom@mail.com';
    }
    applyLinks();
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
})();
