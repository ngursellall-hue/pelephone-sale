# Paycall / CheckCall

Portal: `https://checkcall.paycall.co.il/login.php`

Account email shown in the UI: `eliran.sellall@gmail.com`. Never type the password. A save often redirects to `login.php` even when it succeeded. Unlock the browser, ask the user to sign in, then verify before doing more.

## Do not click

- מחיקת יעד
- שחרור מספר
- עדכון כללי
- Any save button that is not the number form or `saveEditCust` on the destination you just checked

## Number settings

These are the same on every in-scope number:

- Webhook: `https://n8n.sellall.co.il/webhook/paycall_sale_sellall`
- Method: POST
- Custom field key: `campaign_id`
- Custom field value: that row's campaign id
- Checked only on end of call. Start and answer stay off.
- Send-at-end switch on. Start and answer switches off.
- Description: the CSV `channel_name`, copied exactly.

Edit is not a link. On `numbers.php`, set `#editNumberForm` `#didid` and `#updateType=single`, then POST to `editNumbers.php`.

On the edit page, `window.didid` selects which number is saved. To configure another number without leaving the page, set `window.didid`, then save. For the custom field, clear `#customFieldsBody` and add a new row with `data-field-id="0"` before `saveCustomFields()`. Reusing the previous row can update the previous number.

Save calls that already worked:

- `updateNumbersGeneral('description')` reads `#description`
- `updateNumbersIntegration('liveLink')` reads `#liveLink`
- Set method with jQuery `val('POST')` and `trigger('change')`, then `updateNumbersIntegration('liveLinkMethod')`
- `saveCustomFields()`
- `jQuery('#sendEndReqStatus').bootstrapSwitch('setState', true)` then `updateNumbersIntegration('sendReqStatus')`. A raw click does not flip the switch.
- Success text: הפעולה הושלמה בהצלחה
- The custom-field callback checks `Result`, but the API returns `Response: 1`, so it alerts success and does not reload. Reopen the edit page to confirm.

## Destinations

Append only. Read the current selected ids, add the new option, confirm every previous id is still selected, confirm the destination name and route phone are unchanged, then call `saveEditCust()`.

The select is `select.numbersFieldsSelect2`. Option value is the CheckCall did id, not the phone. Add with `new Option(phone, didId, true, true)` and trigger `change`.

After `saveEditCust()` the tab may show `chrome-error://chromewebdata/`. Open `numbers.php` and confirm the destination column. Do not assume the save failed because of that error.

| Destination | custId | Route | Used for |
|---|---|---|---|
| פלאפון סייל - סיילאול בלבד | 414168 | 0779018701 | Sale-all pages. Direct extension. |
| פלאפון סייל משותף - סיילאול | 601137 | 0779018701 | Shared pages, together with the next row |
| פלאפון סייל משותף - שי בטיטו | 1004128 | 043741356 | Shared pages, together with the previous row |

Shared pages use smart routing and must be on both shared destinations. Sale-all pages go only on `414168`.

## Adding numbers

Page: `https://checkcall.paycall.co.il/addRegularNumbers.php`

Choose prefix `055`. The page shows a maximum count. Each extra number costs 5 shekels. If the maximum is 0, stop and tell the user to ask Paycall to raise the regular-number allowance. Do not buy numbers unless the user asked to add more.
