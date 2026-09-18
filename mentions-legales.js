// Page des mentions legales : du texte, rien d'autre. Le seul comportement est
// le selecteur de langue, identique a celui des autres pages — tout le contenu
// porte ses deux versions dans data-fr / data-en, donc il n'y a rien a
// recalculer, juste a recopier la bonne.
(function () {

  var STORAGE_KEY = 'warent-lang';
  var titles = { fr: 'WaRent — Mentions légales', en: 'WaRent — Legal notice' };
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
