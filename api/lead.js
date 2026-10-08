// Vercel Serverless Function: מקבל ליד מהטופס, בודק Turnstile + פורמט, ומעביר ל-n8n.
// כתובת n8n והסודות נמצאים רק ב-Environment Variables של Vercel ולא מגיעים לדפדפן.
//   N8N_WEBHOOK_URL  — כתובת ה-webhook ב-n8n
//   N8N_SECRET       — נשלח בכותרת X-Lead-Secret (Header Auth ב-n8n)
//   TURNSTILE_SECRET — Secret Key של Cloudflare Turnstile
//
// ליד שנכשל בבדיקה לא נזרק: הוא מועבר עם is_suspicious=true ו-n8n שומר אותו בצד בלי לשלוח לפיירברי.

const SITEVERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
const PHONE_RE = /^0\d{8,9}$/;
const BAD_NAME_CHARS = /[<>{}[\]$=;\\]/;
const MAX_NAME_LEN = 50;

function clientIp(req) {
  return String(req.headers['x-real-ip'] || req.headers['x-forwarded-for'] || '').split(',')[0].trim();
}

async function verifyTurnstile(token, ip) {
  if (!token) return 'no_turnstile_token';
  try {
    const res = await fetch(SITEVERIFY_URL, {
      method: 'POST',
      body: new URLSearchParams({ secret: process.env.TURNSTILE_SECRET, response: token, remoteip: ip })
    });
    const data = await res.json();
    return data.success ? null : 'turnstile_failed:' + (data['error-codes'] || []).join('|');
  } catch (err) {
    // ponytail: Cloudflare לא זמין → מסמנים חשוד ולא חוסמים, כדי לא לאבד לידים
    console.error('[lead] siteverify error', err);
    return 'turnstile_unreachable';
  }
}

function formatProblems(body) {
  const problems = [];
  const name = String(body.full_name || '').trim();
  if (name.length < 2 || name.length > MAX_NAME_LEN || BAD_NAME_CHARS.test(name)) problems.push('bad_name');
  if (!PHONE_RE.test(String(body.lead_phone || ''))) problems.push('bad_phone');
  return problems;
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ ok: false });

  const { N8N_WEBHOOK_URL, N8N_SECRET, TURNSTILE_SECRET } = process.env;
  if (!N8N_WEBHOOK_URL || !N8N_SECRET || !TURNSTILE_SECRET) {
    console.error('[lead] missing env vars');
    return res.status(500).json({ ok: false });
  }

  const body = req.body && typeof req.body === 'object' ? req.body : {};
  const { cf_turnstile_token: token, ...lead } = body;
  const ip = clientIp(req);

  const turnstileProblem = await verifyTurnstile(token, ip);
  const reasons = formatProblems(lead).concat(turnstileProblem ? [turnstileProblem] : []);

  const payload = {
    ...lead,
    visitor_ip: ip,
    user_agent: String(req.headers['user-agent'] || ''),
    is_suspicious: reasons.length > 0,
    suspicious_reasons: reasons.join(',')
  };

  try {
    const r = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Lead-Secret': N8N_SECRET },
      body: JSON.stringify(payload)
    });
    if (!r.ok) throw new Error('n8n HTTP ' + r.status);
  } catch (err) {
    console.error('[lead] forward to n8n failed', err);
    return res.status(502).json({ ok: false });
  }

  // תמיד אותה תשובה — בוט לא יודע אם סומן כחשוד
  return res.status(200).json({ ok: true });
};
