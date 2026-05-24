/* ==========================================================================
   UTM Tracker — Pelephone Sale
   ==========================================================================
   מטרה:
   - בכל טעינת עמוד: לקרוא פרמטרים מה-URL (UTM, gclid, campaign_id)
   - למזג עם הערכים הקיימים ב-sessionStorage (URL חדש דורס; ערכים שלא הופיעו
     שוב נשמרים — כך גלישה בין עמודי האתר לא מאבדת מקור)
   - לחשוף API גלובלי ל-window.PelephoneUtm לקריאה ע"י main.js
   ========================================================================== */

(function () {
  'use strict';

  var STORAGE_KEY = 'pelephone_utm';
  var FIRST_TOUCH_KEY = 'pelephone_utm_first_touch';
  var cfg = window.PELEPHONE_CONFIG || {};
  var KEYS = (cfg.utmKeys && cfg.utmKeys.length) ? cfg.utmKeys : [
    'campaign_id', 'gclid',
    'utm_campaign', 'utm_content', 'utm_id',
    'utm_medium', 'utm_source', 'utm_term'
  ];

  function emptyTemplate() {
    var obj = {};
    for (var i = 0; i < KEYS.length; i++) obj[KEYS[i]] = '';
    return obj;
  }

  function safeRead(key) {
    try {
      var raw = sessionStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }

  function safeWrite(key, value) {
    try {
      sessionStorage.setItem(key, JSON.stringify(value));
    } catch (e) { /* storage may be unavailable (private mode etc) */ }
  }

  function parseFromUrl() {
    var found = {};
    if (!window.location || !window.location.search) return found;
    var params;
    try {
      params = new URLSearchParams(window.location.search);
    } catch (e) {
      return found;
    }
    for (var i = 0; i < KEYS.length; i++) {
      var k = KEYS[i];
      if (params.has(k)) {
        var v = params.get(k);
        if (v !== null && v !== '') found[k] = v;
      }
    }
    return found;
  }

  function captureAndMerge() {
    var stored = safeRead(STORAGE_KEY) || emptyTemplate();
    var fromUrl = parseFromUrl();
    var merged = emptyTemplate();
    var hasNew = false;

    for (var i = 0; i < KEYS.length; i++) {
      var k = KEYS[i];
      if (Object.prototype.hasOwnProperty.call(fromUrl, k) && fromUrl[k] !== '') {
        merged[k] = fromUrl[k];
        hasNew = true;
      } else if (stored[k] !== undefined && stored[k] !== '') {
        merged[k] = stored[k];
      }
    }

    safeWrite(STORAGE_KEY, merged);

    // First-touch attribution: שומר את הפעם הראשונה שהמשתמש הגיע עם UTM
    var firstTouch = safeRead(FIRST_TOUCH_KEY);
    if (!firstTouch && hasNew) {
      var ft = emptyTemplate();
      for (var j = 0; j < KEYS.length; j++) {
        ft[KEYS[j]] = fromUrl[KEYS[j]] || '';
      }
      safeWrite(FIRST_TOUCH_KEY, ft);
    }

    return merged;
  }

  var current = captureAndMerge();

  window.PelephoneUtm = {
    /**
     * מחזיר אובייקט עם כל מפתחות ה-UTM. ערכים חסרים = "".
     */
    get: function () {
      return safeRead(STORAGE_KEY) || emptyTemplate();
    },

    /**
     * מחזיר את הערכים מהפעם הראשונה שהמשתמש הגיע (first-touch).
     */
    getFirstTouch: function () {
      return safeRead(FIRST_TOUCH_KEY) || emptyTemplate();
    },

    /**
     * מאפס את כל הנתונים השמורים (בעיקר לבדיקות).
     */
    clear: function () {
      try {
        sessionStorage.removeItem(STORAGE_KEY);
        sessionStorage.removeItem(FIRST_TOUCH_KEY);
      } catch (e) { /* noop */ }
    }
  };
})();
