# Number map

Source file: `pelepone sale page.csv`

Phones below are stored without a leading 0. The first phone column is what the site still shows. The second is the new Paycall number.

`shared` means both destinations `601137` and `1004128`. `sale-all` means destination `414168` only.

Skip the homepage. It has no new number.

| Path | Live phone | New phone | Campaign id | Destination |
|---|---|---|---|---|
| `/` | 723931015 | | 0 | out of scope |
| `/a/` | 509695698 | 552116915 | 18862440154 | sale-all |
| `/active/` | 509695754 | 552116575 | 12440073323 | sale-all |
| `/active-2/` | 509990472 | 552116592 | 21582700793 | sale-all |
| `/am/` | 509695791 | 552116612 | 18868006212 | shared |
| `/b/` | 509695700 | 552116627 | 18857864352 | sale-all |
| `/bm/` | 509695793 | 552115249 | 18875105030 | shared |
| `/c/` | 509695723 | 552115317 | 18857987730 | sale-all |
| `/cm/` | 509695805 | 552115351 | 21583009175 | shared |
| `/d/` | 509695733 | 552115373 | 18862902919 | sale-all |
| `/deal/` | 508308739 | 552115377 | 8866624275 | shared |
| `/desktop/` | 509695696 | 552115389 | 18863711270 | sale-all |
| `/e/` | 509695735 | 552115404 | 18863405701 | sale-all |
| `/em/` | 509697001 | 552115406 | 24215673294 | shared |
| `/f/` | 508308900 | 552116847 | 21576014079 | sale-all |
| `/fm/` | 509695695 | 552116848 | 21582919373 | shared |
| `/g/` | 509997822 | 552116849 | 21586313728 | sale-all |
| `/gm/` | 509697029 | 552116909 | 21576335673 | shared |
| `/h/` | 509997824 | 552116910 | 21576107685 | sale-all |
| `/i/` | 509997913 | 552116912 | 21586372537 | sale-all |
| `/im/` | 508303611 | 552116914 | 18874927355 | shared |
| `/jm/` | 508307584 | 552116920 | 18868112373 | shared |
| `/km/` | 508307583 | 552114650 | 21576335670 | shared |
| `/pmax/` | 509990471 | 552114651 | 22937037576 | sale-all |
| `/hm/` | 508303605 | 552114652 | 21576335664 | shared |
| `/dm/` | 509695880 | 552114653 | 21586605061 | shared |
| `/demand/` | 508307495 | 552114654 | 24255062314 | shared |
| `/main/` | 508090356 | 552115060 | 8866584363 | sale-all |

CSV urls for `/pmax/`, `/hm/`, `/dm/`, `/demand/`, and `/main/` use `www.pelephone-sale.co.il`. The build lowercases the path. Channel names with exact spacing and quotes live only in the CSV. Copy them from the file, not from this table.

Known did ids for the newest batch, if a Paycall edit must be reopened:

| New phone | did |
|---|---|
| 552116915 | 491009 |
| 552116575 | 490949 |
| 552116592 | 490950 |
| 552116612 | 490951 |
| 552116627 | 490952 |
| 552115249 | 490788 |
| 552115317 | 490789 |
| 552115351 | 490790 |
| 552115373 | 490791 |
| 552115377 | 490792 |
| 552115389 | 490793 |
| 552115404 | 490794 |
| 552115406 | 490795 |
| 552116847 | 491002 |
| 552116848 | 491003 |
| 552116849 | 491004 |
| 552116909 | 491005 |
| 552116910 | 491006 |
| 552116912 | 491007 |
| 552116914 | 491008 |
| 552116920 | 491010 |
| 552114650 | 490741 |
| 552114651 | 490742 |
| 552114652 | 490743 |
| 552114653 | 490744 |
| 552114654 | 490745 |
| 552115060 | 490747 |
