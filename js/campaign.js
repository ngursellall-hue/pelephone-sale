/* ==========================================================================
   Campaign routes — phone, campaign_id, channel_name, page_path per URL path
   Routes are generated from pelepone sale page.csv → js/campaign-routes.js
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

    var campaignIdEl = document.getElementById('campaign_id');
    if (campaignIdEl) campaignIdEl.value = cfg.campaignId || '';

    var channelEl = document.getElementById('channel_name');
    if (channelEl) channelEl.value = cfg.channelName || '';

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
          campaignId: route.campaignId,
          channelName: route.channelName,
          pagePath: route.pagePath
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
              pagePath: r.pagePath
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
