---
name: pelephone-sale-numbers
description: >-
  Continue the Pelephone Sale tracking-number swap for pelephone-sale.co.il.
  Use when the user mentions Paycall, CheckCall, 050, 055, טלפון חדש,
  pelepone sale page.csv, landing-page phone numbers, Google Ads call assets,
  GTM website-call conversions, or GTM-5B2W396 in this repo.
---

# Pelephone Sale number swap

Paycall setup for every in-scope landing number is done. The live site, Google Ads, and Google Tag Manager still show the old numbers. Do not start those phases until the user names the phase.

Read [numbers.md](numbers.md) for the full map. Read [paycall.md](paycall.md) only when a Paycall number must be checked or fixed.

## Talk to the user

The user writes in Hebrew. Reply in Hebrew.

- Wrap Hebrew in `<div dir="rtl">`.
- Never put Hebrew and English on the same line. Put paths, commands, URLs, phone numbers, and campaign ids on their own line or in a code block.
- Keep the first answer short.
- Do not commit or push unless the user asks.
- Do not type or ask for passwords. If Paycall, Google Ads, or Tag Manager shows a login page, unlock the browser and ask the user to sign in.

## Hard rules

- Homepage `0723931015` (CSV `723931015`, path `/`, channel אורגני) is out of scope.
- Never disconnect an old number from its destination. Old and new stay attached together.
- Column `טלפון` is the live site number. Leave it unchanged until the user approves the website phase.
- Column `טלפון חדש` is documentation only. `scripts/build-campaigns.js` reads columns 0–4 and ignores it.
- Do not run `npm run build` until column `טלפון` is intentionally changed. A build rewrites `campaigns.json`, `js/campaign-routes.js`, and `vercel.json`, and a deploy would change the number on the site.
- Do not edit Google Ads assets, the Tag Manager website-call tag, or the Google Ads conversion goal until the user asks for that phase.
- New phones are stored without a leading 0. `0552116915` is `552116915`.

## Current status

Done in Paycall, for all 27 rows that start with `050`:

- A new `055` number exists.
- Description equals the CSV channel name.
- Webhook, POST, and `campaign_id` (end of call only) are set.
- The new number is on the same destination or destinations as the old one.
- The old number is still on that destination.
- `טלפון חדש` is filled. `טלפון` is still the old number.

Not done: website display, ad call assets, Tag Manager, conversion goal.

## Next phases

Wait for the user to name the phase. Do one phase at a time.

### 1. Website

1. Copy `טלפון חדש` into `טלפון` only for rows the user approved. Skip `/`.
2. Run `npm run build`.
3. Confirm `js/campaign-routes.js` shows the new display number for those paths only.
4. Do not deploy unless the user asks.

`formatPhone` treats 9 digits starting with `5` as mobile and inserts a dash after the prefix.

### 2. Google Ads call assets

Match each ad's phone to the campaign id in the CSV. Change only the call number. Do not change bids, budgets, keywords, or other assets. The user prefers their own Chrome, where the accounts are already signed in.

### 3. Tag Manager website-call tag

Container on the site: `GTM-5B2W396`. The website-call conversion is not in this repo. `thank-you.html` contains a placeholder `AW-XXXXXXXXX`. Do not treat that placeholder as the real conversion id. Replace the tracked number inside the existing website-call tag. Do not create a second conversion.

### 4. Google Ads conversion goal

Update the website-call conversion goal so it uses the new number. This is separate from the Tag Manager tag and from the ad assets.

## If Paycall must be fixed

Follow [paycall.md](paycall.md). Never click release-number or delete-destination. Append a number to a destination. Never replace the current selection.
