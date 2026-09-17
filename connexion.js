// Espace client : meme mise en page que l'ecran de connexion de Sixt —
// connexion par e-mail, connexion via Google ou Apple, bascule vers la
// creation de compte. Il n'y a pas encore d'authentification derriere : au
// lieu de simuler une session, chaque action explique que l'espace ouvre
// bientot et prepare l'e-mail qui inscrit l'adresse sur la liste d'ouverture.
// La rubrique « Mes reservations » viendra se brancher ici.
(function () {
  var panels = {
    signin: document.getElementById('ac-panel-signin'),
    signup: document.getElementById('ac-panel-signup')
  };
  var signinForm = document.getElementById('ac-signin-form');
  var signupForm = document.getElementById('ac-signup-form');
  var signinEmail = document.getElementById('ac-signin-email');
  var signupEmail = document.getElementById('ac-signup-email');
  var firstName = document.getElementById('ac-firstname');
  var lastName = document.getElementById('ac-lastname');
  var done = document.getElementById('ac-done');
  var doneText = document.getElementById('ac-done-text');
  var pro = document.getElementById('ac-pro');
  var socials = document.querySelectorAll('.ac-social');

  var EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  var view = 'signin';
  var lastDone = null;

  function mailto(subject, body) {
    return 'mailto:' + WARENT.bookingEmail +
      '?subject=' + encodeURIComponent(subject) +
      '&body=' + encodeURIComponent(body);
  }

  // Le lien entreprise porte du texte pre-rempli : il est donc reconstruit a
  // chaque changement de langue, comme le reste de la page.
  function applyLinks() {
    if (!pro) return;
    pro.href = mailto(
      WARENT.t('WaRent — location pour une entreprise', 'WaRent — company rental'),
      WARENT.t(
        'Bonjour,\n\nJe loue pour une entreprise.\n\nSociété :\nBesoin (véhicule, durée, fréquence) :\nContact :\n\n',
        'Hello,\n\nI rent for a company.\n\nCompany:\nNeed (vehicle, duration, frequency):\nContact:\n\n'
      )
    );
  }

  // Un seul encart de reponse pour les deux formulaires : on retient de quoi
  // il parle pour pouvoir le retraduire au changement de langue.
  function showDone(kind, data) {
    lastDone = { kind: kind, data: data || {} };
    if (!done || !doneText) return;
    doneText.textContent = doneMessage();
    done.hidden = false;
  }

  function doneMessage() {
    if (!lastDone) return '';
    if (lastDone.kind === 'social') {
      return WARENT.t(
        'La connexion ' + lastDone.data.provider + ' arrivera avec l’ouverture de l’espace client. ' +
        'En attendant, laissez votre e-mail ci-dessus : vous serez prévenu le jour où il ouvre.',
        lastDone.data.provider + ' sign-in will arrive when the customer area opens. ' +
        'In the meantime, leave your email above and we’ll tell you the day it opens.'
      );
    }
    return WARENT.t(
      'L’espace client n’est pas encore ouvert. Votre messagerie s’ouvre avec un message déjà rempli : envoyez-le, c’est lui qui inscrit votre adresse sur la liste.',
      'The customer area isn’t open yet. Your mail app opens with the message already written — send it, that’s what puts your address on the list.'
    );
  }

  function showError(el, show) {
    if (!el) return;
    var field = document.getElementById(el.getAttribute('id').replace('-error', '-email'));
    el.hidden = !show;
    if (field) {
      field.classList.toggle('is-invalid', show);
      field.setAttribute('aria-invalid', show ? 'true' : 'false');
    }
  }

  function clearErrorOnInput(input, error) {
    if (!input) return;
    input.addEventListener('input', function () { showError(error, false); });
  }

  // Bascule connexion <-> inscription. L'encart de reponse suit le panneau
  // affiche : on repart d'un ecran propre a chaque aller-retour.
  function setView(next) {
    view = next === 'signup' ? 'signup' : 'signin';
    Object.keys(panels).forEach(function (key) {
      if (panels[key]) panels[key].hidden = key !== view;
    });
    if (done) done.hidden = true;
    lastDone = null;
    var focus = view === 'signup' ? firstName : signinEmail;
    if (focus) focus.focus();
  }

  Array.prototype.forEach.call(document.querySelectorAll('[data-go]'), function (btn) {
    btn.addEventListener('click', function () {
      setView(btn.getAttribute('data-go'));
    });
  });

  clearErrorOnInput(signinEmail, document.getElementById('ac-signin-error'));
  clearErrorOnInput(signupEmail, document.getElementById('ac-signup-error'));
  [firstName, lastName].forEach(function (input) {
    if (input) input.addEventListener('input', function () {
      showError(document.getElementById('ac-signup-error'), false);
    });
  });

  Array.prototype.forEach.call(socials, function (btn) {
    btn.addEventListener('click', function () {
      showDone('social', { provider: btn.getAttribute('data-provider') });
    });
  });

  if (signinForm) {
    signinForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var error = document.getElementById('ac-signin-error');
      var value = (signinEmail.value || '').trim();
      if (!EMAIL.test(value)) {
        showError(error, true);
        signinEmail.focus();
        return;
      }
      showError(error, false);
      showDone('mail');
      window.location.href = mailto(
        WARENT.t('WaRent — me prévenir à l’ouverture de l’espace client',
                 'WaRent — notify me when the customer area opens'),
        WARENT.t(
          'Bonjour,\n\nMerci de me prévenir à l’ouverture de l’espace client WaRent.\n\nMon e-mail : ' + value + '\n\n',
          'Hello,\n\nPlease let me know when the WaRent customer area opens.\n\nMy email: ' + value + '\n\n'
        )
      );
    });
  }

  if (signupForm) {
    signupForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var error = document.getElementById('ac-signup-error');
      var first = (firstName.value || '').trim();
      var last = (lastName.value || '').trim();
      var value = (signupEmail.value || '').trim();
      if (!first || !last || !EMAIL.test(value)) {
        showError(error, true);
        (!first ? firstName : !last ? lastName : signupEmail).focus();
        return;
      }
      showError(error, false);
      showDone('mail');
      window.location.href = mailto(
        WARENT.t('WaRent — création de compte à l’ouverture de l’espace client',
                 'WaRent — account creation when the customer area opens'),
        WARENT.t(
          'Bonjour,\n\nJe souhaite un compte WaRent dès l’ouverture de l’espace client.\n\nPrénom : ' + first + '\nNom : ' + last + '\nE-mail : ' + value + '\n\n',
          'Hello,\n\nI would like a WaRent account as soon as the customer area opens.\n\nFirst name: ' + first + '\nLast name: ' + last + '\nEmail: ' + value + '\n\n'
        )
      );
    });
  }

  var STORAGE_KEY = 'warent-lang';
  var titles = { fr: 'WaRent — Espace client', en: 'WaRent — Customer area' };
  var btns = document.querySelectorAll('.lang-btn');
  var textEls = document.querySelectorAll('[data-fr][data-en]');
  var labelEls = document.querySelectorAll('[data-label-fr][data-label-en]');

  function setLanguage(lang) {
    if (lang !== 'en') lang = 'fr';
    document.documentElement.lang = lang;
    document.body.classList.toggle('lang-en', lang === 'en');
    document.title = titles[lang];
    textEls.forEach(function (el) {
      el.textContent = lang === 'en' ? el.dataset.en : el.dataset.fr;
    });
    // Les boutons Google et Apple ne portent qu'un logo : leur nom accessible
    // vit dans aria-label, qui se traduit donc a part.
    labelEls.forEach(function (el) {
      el.setAttribute('aria-label', lang === 'en' ? el.dataset.labelEn : el.dataset.labelFr);
    });
    btns.forEach(function (btn) {
      var isActive = btn.getAttribute('data-lang-btn') === lang;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });
    [signinEmail, signupEmail].forEach(function (input) {
      if (input) input.placeholder = lang === 'en' ? 'name@mail.com' : 'nom@mail.com';
    });
    if (lastDone && doneText) doneText.textContent = doneMessage();
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
