(function () {
  'use strict';

  var COOKIE_KEY = 'pelephone_cookies';
  var A11Y_KEY = 'pelephone_a11y';
  var FONT_MIN = 90;
  var FONT_MAX = 140;
  var FONT_STEP = 10;

  var PACKAGE_DETAILS = {
    '4g-plus': {
      title: '4G plus',
      price: 'החל מ- 28 ₪ לחודש',
      html:
        '<section class="modal__section">' +
          '<h3 class="modal__section-title">1. תנאי התוכנית</h3>' +
          '<div class="modal__section-text">' +
            '<p>התכנית כוללת 3000 דקות, 3000 SMS ו-400GB בחודש.</p>' +
          '</div>' +
        '</section>' +
        '<section class="modal__section">' +
          '<h3 class="modal__section-title">2. מחיר</h3>' +
          '<div class="modal__section-text">' +
            '<p>למצטרפים מנוי 1 — 39.9 ש"ח לחודש למנוי</p>' +
            '<p>למצטרפים מנוי 2 — 35 ש"ח לחודש למנוי</p>' +
            '<p>למצטרפים מנוי 3 — 33 ש"ח לחודש למנוי</p>' +
            '<p>למצטרפים מנוי 4 — 30 ש"ח לחודש למנוי</p>' +
            '<p>למצטרפים מנוי 5 — 28 ש"ח לחודש למנוי</p>' +
            '<p>מהחודש ה-13 יהיה התשלום 69.90 ₪ לחודש לכל מנוי</p>' +
          '</div>' +
        '</section>' +
        '<section class="modal__section">' +
          '<h3 class="modal__section-title">3. פרטים נוספים</h3>' +
          '<div class="modal__section-text">' +
            '<p>כרטיס SIM ללא עלות</p>' +
            '<p class="modal__note">* כפופים לתנאי המבצע המעודכנים בחברת פלאפון. ללא התחייבות. מחירים כוללים מע"מ.</p>' +
          '</div>' +
        '</section>'
    },
    'perfect': {
      title: 'together 5G',
      price: 'החל מ- 35 ₪ לחודש',
      html:
        '<section class="modal__section">' +
          '<h3 class="modal__section-title">1. תנאי התוכנית</h3>' +
          '<div class="modal__section-text">' +
            '<p>התכנית כוללת 5000 דקות, 5000 SMS ו-500GB בחודש. | גלישה בדור 5</p>' +
          '</div>' +
        '</section>' +
        '<section class="modal__section">' +
          '<h3 class="modal__section-title">2. מחיר</h3>' +
          '<div class="modal__section-text">' +
            '<p>למצטרפים מנוי 1 — 39.9 ש"ח לחודש למנוי</p>' +
            '<p>למצטרפים 2 מנויים ומעלה — 35 ש"ח לחודש למנוי</p>' +
            '<p>מהחודש ה-13 יהיה התשלום 69.90 ₪ לחודש לכל מנוי</p>' +
          '</div>' +
        '</section>' +
        '<section class="modal__section">' +
          '<h3 class="modal__section-title">3. פרטים נוספים</h3>' +
          '<div class="modal__section-text">' +
            '<p>כרטיס SIM ללא עלות</p>' +
            '<p class="modal__note">* כפופים לתנאי המבצע המעודכנים בחברת פלאפון. ללא התחייבות. מחירים כוללים מע"מ.</p>' +
          '</div>' +
        '</section>'
    },
    '5g-plus-new': {
      title: '5G Plus NEW',
      price: '39 ₪ לחודש',
      html:
        '<section class="modal__section">' +
          '<h3 class="modal__section-title">1. תנאי התוכנית</h3>' +
          '<div class="modal__section-text">' +
            '<p>התכנית כוללת 5000 דקות, 5000 SMS ו-800GB בחודש. | גלישה בדור 5</p>' +
          '</div>' +
        '</section>' +
        '<section class="modal__section">' +
          '<h3 class="modal__section-title">2. מחיר</h3>' +
          '<div class="modal__section-text">' +
            '<p>39.9 ש"ח לחודש למנוי</p>' +
            '<p>מהחודש ה-13 יהיה התשלום 59.90 ₪ לחודש לכל מנוי</p>' +
          '</div>' +
        '</section>' +
        '<section class="modal__section">' +
          '<h3 class="modal__section-title">3. פרטים נוספים</h3>' +
          '<div class="modal__section-text">' +
            '<p>כרטיס SIM ללא עלות</p>' +
            '<p>הטבת 100 ש"ח לרכישה בפלאפון מוצרים שמחירם מ-599 ש"ח</p>' +
            '<p class="modal__note">* כפופים לתנאי המבצע המעודכנים בחברת פלאפון. ללא התחייבות. מחירים כוללים מע"מ.</p>' +
          '</div>' +
        '</section>'
    }
  };

  /* ---- Skip-to-content link + main landmark ---- */
  function ensureSkipLink() {
    if (document.getElementById('skipLink')) return;
    var link = document.createElement('a');
    link.id = 'skipLink';
    link.className = 'skip-link';
    link.href = '#main';
    link.textContent = 'דלגו לתוכן הראשי';
    document.body.insertBefore(link, document.body.firstChild);

    var main = document.querySelector('main');
    if (main) {
      if (!main.id) main.id = 'main';
      if (!main.hasAttribute('tabindex')) main.setAttribute('tabindex', '-1');
    }
  }
  ensureSkipLink();

  /* ---- aria-current on active nav links ---- */
  (function markActiveNav() {
    var current = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    if (current === '') current = 'index.html';
    document.querySelectorAll('a[href]').forEach(function (a) {
      var href = (a.getAttribute('href') || '').toLowerCase();
      if (!href || href.charAt(0) === '#' || href.indexOf('javascript:') === 0) return;
      var fileOnly = href.split('#')[0].split('?')[0];
      if (fileOnly === current) a.setAttribute('aria-current', 'page');
    });
  })();

  /* ---- Package modal ---- */
  var packageModal = document.getElementById('packageModal');
  var packageModalTitle = document.getElementById('packageModalTitle');
  var packageModalBody = document.getElementById('packageModalBody');
  var packageModalCta = document.getElementById('packageModalCta');
  var packageSelect = document.getElementById('package');
  var lastFocus = null;

  function openPackageModal(pkgId) {
    var info = PACKAGE_DETAILS[pkgId];
    if (!packageModal || !info) return;

    lastFocus = document.activeElement;
    packageModalTitle.textContent = info.title;
    packageModalBody.innerHTML = info.html;
    if (packageModalCta) {
      packageModalCta.setAttribute('data-package', pkgId);
    }
    packageModal.hidden = false;
    document.body.classList.add('modal-open');
    var closeBtn = packageModal.querySelector('.modal__close');
    if (closeBtn) closeBtn.focus();
  }

  function closePackageModal() {
    if (!packageModal) return;
    packageModal.hidden = true;
    document.body.classList.remove('modal-open');
    if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus();
  }

  if (packageModal) {
    document.querySelectorAll('[data-package-info]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        openPackageModal(btn.getAttribute('data-package-info'));
      });
    });

    packageModal.querySelectorAll('[data-modal-close]').forEach(function (el) {
      el.addEventListener('click', closePackageModal);
    });

    if (packageModalCta) {
      packageModalCta.addEventListener('click', function () {
        var pkg = packageModalCta.getAttribute('data-package');
        if (packageSelect && pkg) packageSelect.value = pkg;
        closePackageModal();
      });
    }

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && packageModal && !packageModal.hidden) closePackageModal();
    });
  }

  /* ---- Cookie consent ---- */
  var cookieBanner = document.getElementById('cookieBanner');
  var cookieAccept = document.getElementById('cookieAccept');

  function showCookieBanner() {
    if (!cookieBanner) return;
    cookieBanner.hidden = false;
    document.body.classList.add('cookie-banner-visible');
  }

  function hideCookieBanner(value) {
    if (!cookieBanner) return;
    try { localStorage.setItem(COOKIE_KEY, value); } catch (e) { /* noop */ }
    cookieBanner.hidden = true;
    document.body.classList.remove('cookie-banner-visible');
  }

  try {
    if (!localStorage.getItem(COOKIE_KEY)) showCookieBanner();
  } catch (e) {
    showCookieBanner();
  }

  if (cookieAccept) cookieAccept.addEventListener('click', function () { hideCookieBanner('accepted'); });

  /* ---- Accessibility widget ---- */
  var A11Y_OPTIONS = [
    { id: 'font-up',         label: 'הגדלת טקסט',     toggle: false },
    { id: 'font-down',       label: 'הקטנת טקסט',     toggle: false },
    { id: 'contrast',        label: 'ניגודיות גבוהה', toggle: true },
    { id: 'contrast-light',  label: 'ניגודיות בהירה', toggle: true },
    { id: 'grayscale',       label: 'גווני אפור',     toggle: true },
    { id: 'links',           label: 'הדגשת קישורים',  toggle: true },
    { id: 'highlight-focus', label: 'הדגשת מיקוד',    toggle: true },
    { id: 'readable',        label: 'גופן קריא',      toggle: true },
    { id: 'spacing',         label: 'ריווח שורות',    toggle: true },
    { id: 'big-cursor',      label: 'סמן גדול',       toggle: true },
    { id: 'stop-animations', label: 'עצירת אנימציות', toggle: true },
    { id: 'reset',           label: 'איפוס הגדרות',   toggle: false, reset: true }
  ];

  var a11yFab = document.getElementById('a11yFab');
  var a11yPanel = document.getElementById('a11yPanel');
  var a11yPanelClose = document.getElementById('a11yPanelClose');
  var htmlEl = document.documentElement;

  function readA11y() {
    try { return JSON.parse(localStorage.getItem(A11Y_KEY) || '{}'); }
    catch (e) { return {}; }
  }

  function saveA11y(state) {
    try { localStorage.setItem(A11Y_KEY, JSON.stringify(state)); } catch (e) { /* noop */ }
  }

  function applyA11y(state) {
    state = state || {};
    var font = state.font || 100;
    htmlEl.style.fontSize = font + '%';

    var bodyClasses = {
      'a11y-contrast':        !!state.contrast,
      'a11y-contrast-light':  !!state['contrast-light'],
      'a11y-grayscale':       !!state.grayscale,
      'a11y-links':           !!state.links,
      'a11y-highlight-focus': !!state['highlight-focus'],
      'a11y-readable':        !!state.readable,
      'a11y-spacing':         !!state.spacing,
      'a11y-big-cursor':      !!state['big-cursor'],
      'a11y-stop-animations': !!state['stop-animations']
    };
    Object.keys(bodyClasses).forEach(function (cls) {
      document.body.classList.toggle(cls, bodyClasses[cls]);
    });

    var actionsRoot = a11yPanel ? a11yPanel.querySelector('.a11y-panel__actions') : null;
    if (!actionsRoot) return;
    actionsRoot.querySelectorAll('[data-a11y]').forEach(function (btn) {
      var action = btn.getAttribute('data-a11y');
      var opt = A11Y_OPTIONS.filter(function (o) { return o.id === action; })[0];
      if (opt && opt.toggle) {
        btn.setAttribute('aria-pressed', !!state[action] ? 'true' : 'false');
      }
    });

    var sizeLabel = a11yPanel ? a11yPanel.querySelector('[data-a11y-fontsize]') : null;
    if (sizeLabel) sizeLabel.textContent = font + '%';
  }

  function renderA11yPanel() {
    if (!a11yPanel) return;
    var actionsRoot = a11yPanel.querySelector('.a11y-panel__actions');
    if (!actionsRoot) return;

    actionsRoot.innerHTML = '';

    var sizeRow = document.createElement('div');
    sizeRow.className = 'a11y-panel__row';
    sizeRow.innerHTML =
      '<button type="button" class="a11y-panel__step" data-a11y="font-down" aria-label="הקטנת טקסט">A−</button>' +
      '<span class="a11y-panel__step-label" data-a11y-fontsize aria-live="polite">100%</span>' +
      '<button type="button" class="a11y-panel__step" data-a11y="font-up" aria-label="הגדלת טקסט">A+</button>';
    actionsRoot.appendChild(sizeRow);

    A11Y_OPTIONS.forEach(function (opt) {
      if (opt.id === 'font-up' || opt.id === 'font-down') return;
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'a11y-panel__btn' + (opt.reset ? ' a11y-panel__btn--reset' : '');
      btn.setAttribute('data-a11y', opt.id);
      if (opt.toggle) btn.setAttribute('aria-pressed', 'false');
      btn.textContent = opt.label;
      actionsRoot.appendChild(btn);
    });

    actionsRoot.addEventListener('click', function (e) {
      var btn = e.target.closest && e.target.closest('[data-a11y]');
      if (!btn) return;
      var action = btn.getAttribute('data-a11y');
      var state = readA11y();
      var opt = A11Y_OPTIONS.filter(function (o) { return o.id === action; })[0];

      if (action === 'font-up') {
        state.font = Math.min(FONT_MAX, (state.font || 100) + FONT_STEP);
      } else if (action === 'font-down') {
        state.font = Math.max(FONT_MIN, (state.font || 100) - FONT_STEP);
      } else if (action === 'reset') {
        state = {};
        htmlEl.style.fontSize = '';
      } else if (opt && opt.toggle) {
        state[action] = !state[action];
      }

      saveA11y(state);
      applyA11y(state);
    });
  }

  function openA11yPanel() {
    if (!a11yPanel || !a11yFab) return;
    a11yPanel.hidden = false;
    a11yFab.setAttribute('aria-expanded', 'true');
    if (a11yPanelClose) a11yPanelClose.focus();
  }

  function closeA11yPanel() {
    if (!a11yPanel || !a11yFab) return;
    a11yPanel.hidden = true;
    a11yFab.setAttribute('aria-expanded', 'false');
    a11yFab.focus();
  }

  function toggleA11yPanel() {
    if (!a11yPanel) return;
    if (a11yPanel.hidden) openA11yPanel(); else closeA11yPanel();
  }

  renderA11yPanel();
  applyA11y(readA11y());

  if (a11yFab) a11yFab.addEventListener('click', toggleA11yPanel);
  if (a11yPanelClose) a11yPanelClose.addEventListener('click', closeA11yPanel);

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && a11yPanel && !a11yPanel.hidden) closeA11yPanel();
  });
})();
