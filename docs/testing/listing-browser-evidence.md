# Agent A - Browser Verification Evidence

**Verification date:** 2026-10-13
**Task:** Opportunities listing, search, and filtering
**Dataset:** 50 production opportunities

## Test Environment

The application was served locally and tested in Google Chrome through the Chrome DevTools Protocol using:

`agy-node.cmd tests/browser-check.js`

The test runner uses Node.js built-in functionality and Chrome DevTools Protocol without external packages.

## Results

| Scenario | Result | Evidence |
|---|---|---|
| Initial production load | PASS | 50 cards, Arabic, RTL |
| Arabic search: أكسفورد | PASS | 3 matching opportunities |
| English search: Erasmus | PASS | 9 matching opportunities |
| Type filter: internship | PASS | 9 matching opportunities |
| Combined search + filters | PASS | Reach Oxford only |
| Reset filters | PASS | Restored all 50 records |
| No-results state | PASS | 0 cards + localized empty state |
| Switch to English | PASS | `lang=en`, `dir=ltr` |
| Switch back to Arabic | PASS | `lang=ar`, `dir=rtl` |
| Mobile 360px | PASS | scrollWidth=360, clientWidth=360, 0 overflowing elements |
| Keyboard focus | PASS | Tested controls were programmatically focusable |

## Console

Console messages recorded during the suite: **0**

Final automated browser verdict:

**ALL TESTS PASSED**

## Screenshots

- `docs/evidence/desktop-initial-load.png`
- `docs/evidence/mobile-360px-view.png`

The mobile evidence was captured at a true 360 x 740 viewport.

## Browser Recording Status

A dedicated Antigravity Browser Recording was not completed because the Antigravity individual quota was reached during the Agent A session.

No recording is claimed or fabricated.

The automated browser verification and screenshots above provide the available evidence for this implementation task. Full user-story Browser Recording can be captured later during the project's dedicated final testing phase when Antigravity browser capacity is available.

## Protected File Verification

Before committing Agent A, Git will verify that these files remain unchanged:

- `data/opportunities.json`
- `data/schema.json`
- `scripts/validate-data.js`
