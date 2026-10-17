# TEST_RESULTS.md — gift-wishlist-bd (run #79, 14:00 slot, 2026-10-17)

## Unit tests (node tests/unit.test.js)
62/62 passed, 0 failed.
Hand-verified values:
- fmtMoney(150050, en) = ৳1,500.50; bn = ৳১,৫০০.৫০ (Bengali digits incl. fraction)
- parseAmount: plain / decimals / commas / Bengali digits / ৳ prefix accepted;
  junk / 3 decimals / negative / >10,000,000 rejected
- Stats on 3-item scenario: total 3, planned 2, given 1,
  plannedSpend 1,250,025 paisa, givenSpend 150,050 paisa
- Eid budget 1,000,000 vs spend 1,250,025 -> pct capped 100, over = true
- Share text: EN header + "Total planned spend: ৳7,500.25"; BN header "আমার উপহার তালিকা"
- Import rejects: wrong app, wrong version, bad occasion, duplicate id,
  negative budget, bad lang — data intact

Repairs: 1 real app bug found by tests — fmtMoney('bn') left the fraction digits
in Western numerals (e.g. ৫০ rendered as 50). Fixed by converting the whole
formatted string to Bengali digits. 0 further failures.

## Smoke tests (headless Chromium 152, raw CDP, file://)
- Desktop 1280px: 25/25 passed, 0 console/page errors
- Mobile 390px: 25/25 passed, 0 console/page errors
Covered: title/h1/stats render, empty state, add via form (Perfume 2500.50),
card + price + planned-spend stat, localStorage persistence,
Idea -> Planned move, illegal Given button absent, edit rename,
budget 2000 -> "Over budget!" flag, BN toggle (h1 + Bengali digits ২,৫০০.৫০),
lang persisted in storage, share-text contains item, malformed import rejected,
typed-DELETE erase clears list + storage, no horizontal overflow both widths.

Harness note: first smoke run failed with ECONNREFUSED — Chrome needs ~4s to
open its DevTools port. Harness wait raised 1.5s -> 4s (test-side fix only).

## Source hygiene
grep -P '[^\x00-\x7F]' over index.html, js/, css/ -> zero matches (pure ASCII;
Bengali as \uXXXX escapes in JS, numeric entities in HTML).
