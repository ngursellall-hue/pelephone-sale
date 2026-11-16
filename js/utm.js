/* ==========================================================================
   UTM Tracker — Pelephone Sale
   ==========================================================================
   מטרה:
   - בכל טעינת עמוד: לקרוא פרמטרים מה-URL (UTM, gclid, campaign_id)
   - למזג עם הערכים הקיימים ב-localStorage ל-30 יום (URL חדש דורס; ערכים שלא
     הופיעו שוב נשמרים — כך גם ביקור חוזר לא מאבד מקור)
   - אם אין gclid — גיבוי מעוגיית _gcl_aw של GTM
   - לחשוף API גלובלי ל-window.PelephoneUtm לקריאה ע"י main.js
   ========================================================================== */

(function () {
  'use strict';

  var STORAGE_KEY = 'pelephone_utm';
  var FIRST_TOUCH_KEY = 'pelephone_utm_first_touch';
  // נשמר ב-localStorage ל-30 יום, כדי שלקוח שחוזר בביקור נוסף עדיין יישלח עם ה-gclid
  var TTL_MS = 30 * 24 * 60 * 60 * 1000;
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

  // ערך שמור = { data, ts }; אחרי 30 יום מהגעה אחרונה עם פרמטרים הוא נחשב ריק
  function safeRead(key) {
    try {
      var raw = localStorage.getItem(key);
      var box = raw ? JSON.parse(raw) : null;
      if (!box || !box.data || !(Date.now() - box.ts < TTL_MS)) return null;
      return box.data;
    } catch (e) { return null; }
  }

  function safeWrite(key, value, keepTs) {
    try {
      var ts = Date.now();
      if (keepTs) {
        var old = JSON.parse(localStorage.getItem(key) || 'null');
        if (old && old.ts) ts = old.ts;
      }
      localStorage.setItem(key, JSON.stringify({ data: value, ts: ts }));
    } catch (e) { /* storage may be unavailable (private mode etc) */ }
  }

  // גיבוי: עוגיית _gcl_aw ש-GTM (Conversion Linker) שומר, בפורמט GCL.<זמן>.<gclid>
  function gclidFromCookie() {
    try {
      var m = document.cookie.match(/(?:^|;\s*)_gcl_aw=([^;]+)/);
      if (!m) return '';
      var parts = decodeURIComponent(m[1]).split('.');
      return parts.length >= 3 ? parts.slice(2).join('.') : '';
    } catch (e) { return ''; }
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

    // ה-30 יום נספרים מהפעם האחרונה שהלקוח הגיע עם פרמטרים, לא מכל מעבר עמוד
    safeWrite(STORAGE_KEY, merged, !hasNew);

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
      var data = safeRead(STORAGE_KEY) || emptyTemplate();
      if (!data.gclid) data.gclid = gclidFromCookie();
      return data;
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
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(FIRST_TOUCH_KEY);
      } catch (e) { /* noop */ }
    }
  };
})();
