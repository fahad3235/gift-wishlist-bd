# Gift Wishlist BD 🎁

An offline, bilingual (English / বাংলা) gift wishlist & gift-idea organizer for Bangladesh.
Plan gifts, cap spending per occasion, track each gift from idea → planned → bought → given.

Live demo: https://fahad3235.github.io/gift-wishlist-bd/

## Problem

Gift-giving in Bangladesh runs on memory: Eid, birthdays, weddings, and anniversaries
pile up, budgets get blown, and good gift ideas are forgotten by the time the occasion
arrives. This app turns that into one small, private planner that lives entirely in
the browser — no account, no network, no one else's data.

## Features

1. **Gift CRUD** — name, recipient, occasion, price estimate, priority, optional
   store link, optional note. Inline validation on every field.
2. **Status state machine** — Idea → Planned → Bought → Given (plus Dropped).
   Only legal transitions are ever rendered as buttons; illegal moves are rejected
   by the logic layer too.
3. **Occasion budgets** — set a spending cap per occasion (Birthday, Eid, Wedding…).
   Spend counts every non-Dropped item; the bar turns red and flags "Over budget!".
4. **Dashboard** — total items, planned spend, bought spend, gifts given.
5. **Search, filter & sort** — Bangla-safe text search plus status / occasion /
   priority filters and 4 sort orders.
6. **Share as text** — copy the wishlist as a plain-text list (clipboard with
   textarea fallback).
7. **Data portability** — JSON export / strict import (wrong app, wrong version,
   bad occasion, duplicate id, bad budget, bad language all rejected with data
   intact) and typed-`DELETE` erase-all.
8. **Bilingual UI** — EN/বাংলা toggle persisted across reloads, Bengali digits
   in all amounts, 390px mobile layout, zero network requests.

## Stack

Vanilla HTML / CSS / JavaScript. No framework, no build step, no dependencies.
Money is integer paisa (1 BDT = 100 paisa) so totals never suffer float error.
All source files are pure ASCII — Bengali text is stored as `\uXXXX` escapes in
JavaScript and numeric character references in HTML (this keeps GitHub's file
push API from corrupting text in transit).

## Prerequisites

Any modern browser. For the tests: Node.js 18+ and a Chromium binary.

## Run locally

Open `index.html` in a browser, or serve the folder:

```bash
npx serve .
# or
python3 -m http.server 8000
```

## Testing

```bash
node tests/unit.test.js        # 62 logic assertions
node tests/smoke.mjs           # 25 headless-Chrome desktop checks
node tests/smoke.mjs --mobile  # 25 headless-Chrome 390px mobile checks
```

The smoke tests drive real Chromium over CDP: add → move → edit → budget →
language toggle → share → erase, plus a horizontal-overflow check and a
zero-console-error assertion.

## Deployment

Static site — any static host works. GitHub Pages serves it from the `main`
branch root.

## Limitations

- Data lives in one browser's `localStorage` (no sync, no account). Export a
  JSON backup before clearing browser data.
- Prices are your own estimates, not live store prices; links are not checked
  for availability.
- Not connected to any store, calendar, or contact list — by design.
- Budget math counts the full estimated price of every non-Dropped item for an
  occasion; it does not split shared gifts across recipients.

## Status

MVP complete. See `TEST_RESULTS.md` for verified results.
