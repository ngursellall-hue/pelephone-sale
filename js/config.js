/* ==========================================================================
   קונפיגורציה גלובלית — Pelephone Sale
   ==========================================================================
   החליפו את הערכים כאן בלבד. אין צורך לערוך את שאר קבצי ה-JS.
   ========================================================================== */

window.PELEPHONE_CONFIG = window.PELEPHONE_CONFIG || {
  // כתובת ה-webhook שאליה נשלחים הלידים.
  // אם הערך מכיל את המחרוזת "REPLACE_ME" — השליחה לא תתבצע (placeholder mode).
  webhookUrl: 'https://n8n.sellall.co.il/webhook/pelephone-sale',

  // קבועים שנשלחים יחד עם כל ליד
  leadCategory: 'PELEPHONE',
  leadSourceIdPowerlink: 4,
  campaignId: '123123',
  channelName: 'homepage',

  // שירות לזיהוי כתובת IP הציבורית של המבקר (נשלח כ-visitor_ip ב-webhook)
  ipLookupUrl: 'https://api.ipify.org?format=json',
  ipLookupTimeoutMs: 2500,

  // רשימת מפתחות ה-UTM/קמפיין שאנחנו לוכדים מה-URL ושומרים בסשן
  utmKeys: [
    'campaign_id',
    'gclid',
    'utm_campaign',
    'utm_content',
    'utm_id',
    'utm_medium',
    'utm_source',
    'utm_term'
  ]
};
