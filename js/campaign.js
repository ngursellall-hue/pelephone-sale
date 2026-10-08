/* ==========================================================================
   Campaign routes — phone, campaign_id, channel_name, page_path, lead_source_id per URL path
   Routes are generated from pelepone sale page.csv → js/campaign-routes.js
   הקמפיין שהגולש נכנס ממנו נשמר ב-sessionStorage, כך שבמעבר לעמודים אחרים
   (דף הבית, אודות, מאמרים, צור קשר) הטלפון והטופס ממשיכים לשייך לאותו קמפיין.
   ========================================================================== */

(function () {
  'use strict';

  var ROUTES = window.PELEPHONE_CAMPAIGN_ROUTES || {};

  var DEFAULT = {
    phoneDisplay: '072-393-1015',
    phoneTel: '0723931015',
    campaignId: null,
    channelName: null,
    pagePath: null
  };

  function normalizePath(pathname) {
    var p = pathname || '/';
    p = p.toLowerCase();
    if (/\/index\.html$/i.test(p)) {
      p = p.replace(/\/index\.html$/i, '') || '/';
    }
    if (p.length > 1 && p.charAt(p.length - 1) !== '/') {
      p += '/';
    }
    return p;
  }

  var SESSION_KEY = 'pelephone_campaign_path';

  function readSessionPath() {
    try { return sessionStorage.getItem(SESSION_KEY); } catch (e) { return null; }
  }

  function writeSessionPath(path) {
    try { sessionStorage.setItem(SESSION_KEY, path); } catch (e) { /* storage may be unavailable */ }
  }

  // נתיב קמפיין (לא דף הבית) תמיד גובר ונשמר לסשן.
  // דף הבית או עמוד ללא נתיב — משתמשים בקמפיין שנשמר בסשן, ואם אין — בדף הבית.
  function getRouteConfig() {
    var path = normalizePath(window.location.pathname);
    if (path !== '/' && ROUTES[path]) {
      writeSessionPath(path);
      return ROUTES[path];
    }
    var saved = readSessionPath();
    if (saved && ROUTES[saved]) return ROUTES[saved];
    if (ROUTES['/']) {
      writeSessionPath('/');
      return ROUTES['/'];
    }
    return null;
  }

  function canonicalizeUrlCase(canonicalPath) {
    if (!canonicalPath) return;
    var current = window.location.pathname;
    if (current === canonicalPath) return;
    // Replace only when the difference is purely letter-case, to avoid
    // unrelated URL rewrites (e.g. /index.html or missing trailing slash).
    if (current.toLowerCase() !== current &&
        normalizePath(current) === canonicalPath &&
        window.history && typeof window.history.replaceState === 'function') {
      try {
        window.history.replaceState(
          window.history.state,
          document.title,
          canonicalPath + window.location.search + window.location.hash
        );
      } catch (e) { /* noop */ }
    }
  }

  function formatSchemaTelephone(telDigits) {
    var d = String(telDigits).replace(/\D/g, '');
    if (d.indexOf('972') === 0) return '+' + d;
    if (d.charAt(0) === '0' && d.length >= 10) {
      return '+972-' + d.substring(1, 3) + '-' + d.substring(3);
    }
    return '+972-' + d;
  }

  function applyToPage(cfg) {
    var telHref = 'tel:' + cfg.phoneTel;

    document.querySelectorAll('a[href^="tel:"]:not([data-fixed-tel])').forEach(function (link) {
      link.setAttribute('href', telHref);
    });

    document.querySelectorAll('.campaign-phone-display').forEach(function (el) {
      el.textContent = cfg.phoneDisplay;
    });

    var campaignIdEl = document.getElementById('campaign_id');
    if (campaignIdEl) campaignIdEl.value = cfg.campaignId || '';

    var channelEl = document.getElementById('channel_name');
    if (channelEl) channelEl.value = cfg.channelName || '';

    var pathEl = document.getElementById('page_path');
    if (pathEl && !pathEl.hasAttribute('data-fixed')) pathEl.value = cfg.pagePath || '';

    var leadSourceEl = document.getElementById('lead_source_id_powerlink');
    if (leadSourceEl && cfg.leadSourceIdPowerlink !== undefined && cfg.leadSourceIdPowerlink !== null) {
      leadSourceEl.value = String(cfg.leadSourceIdPowerlink);
    }

    var schemaTel = document.querySelector('script[data-campaign-schema-tel]');
    if (schemaTel) {
      try {
        var data = JSON.parse(schemaTel.textContent);
        if (data && cfg.phoneTel) {
          data.telephone = formatSchemaTelephone(cfg.phoneTel);
          schemaTel.textContent = JSON.stringify(data);
        }
      } catch (e) { /* noop */ }
    }
  }

  function init() {
    var route = getRouteConfig();
    var cfg = route
      ? {
          phoneDisplay: route.phoneDisplay,
          phoneTel: route.phoneTel,
          campaignId: route.campaignId,
          channelName: route.channelName,
          pagePath: route.pagePath,
          leadSourceIdPowerlink: route.leadSourceIdPowerlink
        }
      : {
          phoneDisplay: DEFAULT.phoneDisplay,
          phoneTel: DEFAULT.phoneTel,
          campaignId: null,
          channelName: null,
          pagePath: normalizePath(window.location.pathname)
        };

    window.PELEPHONE_CAMPAIGN = {
      get: function () {
        var r = getRouteConfig();
        return r
          ? {
              phoneDisplay: r.phoneDisplay,
              phoneTel: r.phoneTel,
              campaignId: r.campaignId,
              channelName: r.channelName,
              pagePath: r.pagePath,
              leadSourceIdPowerlink: r.leadSourceIdPowerlink
            }
          : null;
      },
      getAssetBase: function () {
        return '';
      },
      isCampaignRoute: function () {
        return !!getRouteConfig();
      }
    };

    if (route) {
      if (normalizePath(window.location.pathname) === route.pagePath) {
        canonicalizeUrlCase(route.pagePath);
      }
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () {
          applyToPage(cfg);
        });
      } else {
        applyToPage(cfg);
      }
    }
  }

  init();
})();
