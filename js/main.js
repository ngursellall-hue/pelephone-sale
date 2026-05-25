(function () {
  'use strict';

  var header = document.getElementById('header');
  var leadForm = document.getElementById('leadForm');
  var contactForm = document.getElementById('contactForm');
  var adminContactForm = document.getElementById('adminContactForm');
  var formSuccess = document.getElementById('formSuccess');
  var packageSelect = document.getElementById('package');

  function onScroll() {
    if (header) {
      header.classList.toggle('scrolled', window.scrollY > 10);
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  var revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length && 'IntersectionObserver' in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    revealEls.forEach(function (el) { observer.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('visible'); });
  }

  document.querySelectorAll('.faq-item__question').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var item = btn.closest('.faq-item');
      var isOpen = item.classList.contains('open');

      document.querySelectorAll('.faq-item.open').forEach(function (openItem) {
        openItem.classList.remove('open');
        openItem.querySelector('.faq-item__question').setAttribute('aria-expanded', 'false');
      });

      if (!isOpen) {
        item.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  document.querySelectorAll('[data-package]').forEach(function (link) {
    link.addEventListener('click', function () {
      var pkg = link.getAttribute('data-package');
      if (packageSelect && pkg) {
        packageSelect.value = pkg;
      }
    });
  });

  function isValidPhone(value) {
    var digits = value.replace(/\D/g, '');
    if (digits.indexOf('972') === 0) digits = '0' + digits.slice(3);
    return /^0(5[0-9]|7[2-9])\d{7}$/.test(digits);
  }

  var errorMap = {
    fullName: 'fullNameError',
    phone: 'phoneError',
    package: 'packageError'
  };

  function showError(field, show) {
    var input = document.getElementById(field);
    var errorId = errorMap[field] || (field + 'Error');
    var error = document.getElementById(errorId);
    if (input) {
      input.classList.toggle('error', show);
      input.setAttribute('aria-invalid', show ? 'true' : 'false');
      if (error) {
        var current = input.getAttribute('aria-describedby') || '';
        var has = current.split(' ').indexOf(errorId) !== -1;
        if (show && !has) {
          input.setAttribute('aria-describedby', (current + ' ' + errorId).trim());
        } else if (!show && has) {
          var next = current.split(' ').filter(function (id) { return id && id !== errorId; }).join(' ');
          if (next) input.setAttribute('aria-describedby', next);
          else input.removeAttribute('aria-describedby');
        }
      }
    }
    if (error) error.classList.toggle('visible', show);
    return !show;
  }

  function validateLeadForm(form) {
    var valid = true;
    var name = form.fullName.value.trim();
    var phone = form.phone.value.trim();

    if (name.length < 2) { showError('fullName', true); valid = false; }
    else { showError('fullName', false); }

    if (!isValidPhone(phone)) { showError('phone', true); valid = false; }
    else { showError('phone', false); }

    return valid;
  }

  function saveLead(data) {
    var leads = JSON.parse(localStorage.getItem('pelephone_leads') || '[]');
    leads.push(data);
    localStorage.setItem('pelephone_leads', JSON.stringify(leads));
    try {
      sessionStorage.setItem('pelephone_lastLead', JSON.stringify(data));
    } catch (e) { /* storage may be unavailable */ }
  }

  function redirectToThankYou() {
    // ב-debug mode (?debug=1 ב-URL) — לא מנתבים, כדי שתוכלו לראות לוגים ב-DevTools
    try {
      var qs = new URLSearchParams(window.location.search);
      if (qs.get('debug') === '1') {
        console.log('[Pelephone] debug=1 — דילגנו על ניווט ל-thank-you');
        return;
      }
    } catch (e) { /* noop */ }
    window.location.href = '/thank-you.html';
  }

  // --- Visitor IP (public IP via lookup service; cached per session) -------

  var VISITOR_IP_CACHE_KEY = 'pelephone_visitor_ip';

  function resolveVisitorIp() {
    try {
      var cached = sessionStorage.getItem(VISITOR_IP_CACHE_KEY);
      if (cached) return Promise.resolve(cached);
    } catch (e) { /* storage unavailable */ }

    var cfg = window.PELEPHONE_CONFIG || {};
    var lookupUrl = cfg.ipLookupUrl || 'https://api.ipify.org?format=json';
    var timeoutMs = (typeof cfg.ipLookupTimeoutMs === 'number') ? cfg.ipLookupTimeoutMs : 2500;

    if (typeof fetch !== 'function') return Promise.resolve('');

    return new Promise(function (resolve) {
      var done = false;
      var timer = setTimeout(function () {
        if (done) return;
        done = true;
        resolve('');
      }, timeoutMs);

      fetch(lookupUrl, { credentials: 'omit', mode: 'cors' })
        .then(function (res) {
          if (!res.ok) throw new Error('ip lookup ' + res.status);
          return res.json();
        })
        .then(function (data) {
          if (done) return;
          done = true;
          clearTimeout(timer);
          var ip = (data && data.ip) ? String(data.ip).trim() : '';
          if (ip) {
            try { sessionStorage.setItem(VISITOR_IP_CACHE_KEY, ip); } catch (e) { /* noop */ }
          }
          resolve(ip);
        })
        .catch(function () {
          if (done) return;
          done = true;
          clearTimeout(timer);
          resolve('');
        });
    });
  }

  // טעינה מוקדמת — כך שליחת הטופס לא ממתינה (או ממתינה פחות) ל-IP lookup
  resolveVisitorIp();

  // --- Webhook submission -------------------------------------------------

  function getCampaignPayloadFields(form) {
    var cfg = window.PELEPHONE_CONFIG || {};
    var campaign = (window.PELEPHONE_CAMPAIGN && window.PELEPHONE_CAMPAIGN.get)
      ? window.PELEPHONE_CAMPAIGN.get()
      : null;

    var manualCampaign = cfg.manualCampaign || '123123';
    if (form && form.manual_campaign && form.manual_campaign.value) {
      manualCampaign = form.manual_campaign.value;
    } else if (campaign && campaign.manualCampaign) {
      manualCampaign = campaign.manualCampaign;
    }

    var pagePath = (form && form.page_path && form.page_path.value)
      ? form.page_path.value
      : (campaign && campaign.pagePath)
        ? campaign.pagePath
        : (window.location.pathname || '/');

    return { manual_campaign: manualCampaign, page_path: pagePath };
  }

  function buildWebhookPayload(form, opts) {
    opts = opts || {};
    var cfg = window.PELEPHONE_CONFIG || {};
    var utm = (window.PelephoneUtm && window.PelephoneUtm.get) ? window.PelephoneUtm.get() : {};

    var campaignFields = getCampaignPayloadFields(form);

    var payload = {
      full_name: form.fullName.value.trim(),
      lead_phone: form.phone.value.trim(),
      lead_category: cfg.leadCategory || 'PELEPHONE',
      lead_source_id_powerlink: (typeof cfg.leadSourceIdPowerlink === 'number') ? cfg.leadSourceIdPowerlink : 4,
      manual_campaign: campaignFields.manual_campaign,
      page_path: campaignFields.page_path,
      visitor_ip: ''
    };

    // קבועים מה-config + UTM (כולל ערכי "" אם חסר)
    var keys = (cfg.utmKeys && cfg.utmKeys.length) ? cfg.utmKeys : [
      'campaign_id', 'gclid',
      'utm_campaign', 'utm_content', 'utm_id',
      'utm_medium', 'utm_source', 'utm_term'
    ];
    for (var i = 0; i < keys.length; i++) {
      var k = keys[i];
      payload[k] = (utm[k] !== undefined && utm[k] !== null) ? utm[k] : '';
    }

    if (opts.package) payload.package = opts.package;
    if (opts.message) payload.message = opts.message;

    return payload;
  }

  function sendWebhook(payload) {
    return resolveVisitorIp().then(function (ip) {
      payload.visitor_ip = ip || '';
      return postWebhook(payload);
    });
  }

  function postWebhook(payload) {
    var cfg = window.PELEPHONE_CONFIG || {};
    var url = cfg.webhookUrl;

    if (!url || url.indexOf('REPLACE_ME') !== -1) {
      console.warn('[Pelephone] Webhook URL not configured. Payload:', payload);
      return Promise.resolve({ skipped: true });
    }

    var body = JSON.stringify(payload);
    console.log('[Pelephone] Sending lead to webhook:', url);
    console.log('[Pelephone] Payload:', payload);

    // עדיפות ל-fetch כי הוא נותן לנו תגובה ברורה (status, errors).
    // keepalive: true גורם לבקשה לשרוד גם אם הדפדפן ינווט לעמוד אחר.
    if (typeof fetch === 'function') {
      return fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: body,
        keepalive: true,
        credentials: 'omit',
        mode: 'cors'
      }).then(function (res) {
        if (res.ok) {
          console.log('[Pelephone] ✓ Webhook accepted (HTTP ' + res.status + ')');
          return { ok: true, status: res.status };
        }
        console.error('[Pelephone] ✗ Webhook returned HTTP ' + res.status);
        return { ok: false, status: res.status };
      }).catch(function (err) {
        // CORS / רשת / DNS ייפלו לפה. ננסה sendBeacon כגיבוי אחרון.
        console.error('[Pelephone] ✗ Webhook fetch failed:', err && err.message ? err.message : err);
        if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
          try {
            var blob = new Blob([body], { type: 'application/json' });
            var queued = navigator.sendBeacon(url, blob);
            console.warn('[Pelephone] Fallback sendBeacon queued:', queued);
            return { beacon: queued };
          } catch (e) { /* ignore */ }
        }
        return { error: err };
      });
    }

    // אם fetch לא קיים (דפדפן ישן מאוד) — נשתמש ב-sendBeacon כברירת מחדל
    if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
      try {
        var blob2 = new Blob([body], { type: 'application/json' });
        var ok = navigator.sendBeacon(url, blob2);
        return Promise.resolve({ beacon: ok });
      } catch (e) { /* noop */ }
    }

    return Promise.resolve({ skipped: true });
  }

  // ממתין ל-Promise אבל לא יותר מ-timeoutMs, לאחר מכן ממשיך הלאה.
  function withTimeout(promise, timeoutMs) {
    return new Promise(function (resolve) {
      var done = false;
      var t = setTimeout(function () {
        if (done) return;
        done = true;
        resolve({ timeout: true });
      }, timeoutMs);
      Promise.resolve(promise).then(function (val) {
        if (done) return;
        done = true;
        clearTimeout(t);
        resolve(val);
      }, function (err) {
        if (done) return;
        done = true;
        clearTimeout(t);
        resolve({ error: err });
      });
    });
  }

  if (leadForm) {
    leadForm.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validateLeadForm(leadForm)) return;

      var pkg = leadForm.package ? leadForm.package.value : '';
      var payloadOpts = {};
      if (pkg) payloadOpts.package = pkg;
      var payload = buildWebhookPayload(leadForm, payloadOpts);

      var leadData = {
        fullName: payload.full_name,
        phone: payload.lead_phone,
        submittedAt: new Date().toISOString(),
        page: window.location.pathname,
        webhook: payload
      };
      if (pkg) leadData.package = pkg;
      saveLead(leadData);

      if (typeof gtag === 'function') {
        gtag('event', 'generate_lead', { event_category: 'form' });
      }

      if (formSuccess) formSuccess.classList.add('visible');
      leadForm.style.display = 'none';

      withTimeout(sendWebhook(payload), 4000).then(redirectToThankYou);
    });

    ['fullName', 'phone'].forEach(function (field) {
      if (leadForm[field]) {
        leadForm[field].addEventListener('input', function () {
          showError(field, false);
        });
      }
    });
  }

  function bindAdminContactForm(form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var valid = true;
      var name = form.fullName.value.trim();
      var phone = form.phone.value.trim();

      if (name.length < 2) { showError('fullName', true); valid = false; }
      else { showError('fullName', false); }

      if (!isValidPhone(phone)) { showError('phone', true); valid = false; }
      else { showError('phone', false); }

      var subjectEl = form.subject;
      var subjectVal = subjectEl ? subjectEl.value.trim() : '';
      if (subjectEl && subjectEl.required && subjectVal.length < 2) {
        showError('subject', true);
        valid = false;
      } else if (subjectEl) {
        showError('subject', false);
      }

      if (!valid) return;

      var subject = subjectVal;
      var message = form.message ? form.message.value.trim() : '';
      var combinedMessage = subject
        ? (message ? 'נושא: ' + subject + '\n' + message : 'נושא: ' + subject)
        : message;

      var payload = buildWebhookPayload(form, {
        package: 'site_admin',
        message: combinedMessage
      });
      payload.inquiry_type = 'site_admin';

      saveLead({
        fullName: payload.full_name,
        phone: payload.lead_phone,
        package: 'site_admin',
        message: combinedMessage,
        submittedAt: new Date().toISOString(),
        page: 'contact',
        webhook: payload
      });

      if (typeof gtag === 'function') {
        gtag('event', 'generate_lead', { event_category: 'admin_contact_form' });
      }

      var success = document.getElementById('adminContactSuccess');
      if (success) success.classList.add('visible');
      form.style.display = 'none';

      withTimeout(sendWebhook(payload), 4000);
    });
  }

  if (contactForm) {
    bindAdminContactForm(contactForm);
  }

  if (adminContactForm && adminContactForm !== contactForm) {
    bindAdminContactForm(adminContactForm);
  }

  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var targetId = anchor.getAttribute('href');
      if (targetId === '#') return;
      var target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        var offset = header ? header.offsetHeight + 12 : 0;
        var top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top: top, behavior: 'smooth' });
      }
    });
  });
})();
