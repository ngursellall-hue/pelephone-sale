/* ==========================================================================
   Campaign routes — dynamic phone, manual_campaign, page_path per URL
   ========================================================================== */

(function () {
  'use strict';

  var ROUTES = {
    '/a/': {
      phoneDisplay: '050-9697015',
      phoneTel: '0509697015',
      manualCampaign: '20355432231',
      pagePath: '/a/',
      assetBase: '../'
    }
  };

  var DEFAULT = {
    phoneDisplay: '050-830-8939',
    phoneTel: '0508308939',
    manualCampaign: null,
    pagePath: null,
    assetBase: ''
  };

  function normalizePath(pathname) {
    var p = pathname || '/';
    if (/\/index\.html$/i.test(p)) {
      p = p.replace(/\/index\.html$/i, '') || '/';
    }
    if (p.length > 1 && p.charAt(p.length - 1) !== '/') {
      p += '/';
    }
    return p;
  }

  function getRouteConfig() {
    var path = normalizePath(window.location.pathname);
    return ROUTES[path] || null;
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

    document.querySelectorAll('a[href^="tel:"]').forEach(function (link) {
      link.setAttribute('href', telHref);
    });

    document.querySelectorAll('.campaign-phone-display').forEach(function (el) {
      el.textContent = cfg.phoneDisplay;
    });

    var manualEl = document.getElementById('manual_campaign');
    if (manualEl) manualEl.value = cfg.manualCampaign || '';

    var pathEl = document.getElementById('page_path');
    if (pathEl) pathEl.value = cfg.pagePath || '';

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
          manualCampaign: route.manualCampaign,
          pagePath: route.pagePath,
          assetBase: route.assetBase || ''
        }
      : {
          phoneDisplay: DEFAULT.phoneDisplay,
          phoneTel: DEFAULT.phoneTel,
          manualCampaign: null,
          pagePath: normalizePath(window.location.pathname),
          assetBase: DEFAULT.assetBase
        };

    window.PELEPHONE_CAMPAIGN = {
      get: function () {
        return getRouteConfig() ? {
          phoneDisplay: getRouteConfig().phoneDisplay,
          phoneTel: getRouteConfig().phoneTel,
          manualCampaign: getRouteConfig().manualCampaign,
          pagePath: getRouteConfig().pagePath,
          assetBase: getRouteConfig().assetBase || ''
        } : null;
      },
      getAssetBase: function () {
        var r = getRouteConfig();
        return r && r.assetBase ? r.assetBase : '';
      },
      isCampaignRoute: function () {
        return !!getRouteConfig();
      }
    };

    if (route) {
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
