# Suggest an Opportunity - Browser Verification Evidence

**Verification date:** 2026-10-17
**Feature:** Suggest an Opportunity
**Storage:** Browser localStorage only
**Production dataset:** 50 opportunities

## Purpose

The Suggest an Opportunity feature allows a visitor to submit a potential opportunity for later manual review.

The feature does not automatically publish, verify, or insert suggestions into the production opportunity dataset.

## Personal Data

The form requests only:

- Submitter name

It does not request:

- Email address
- Phone number
- Account credentials
- Sensitive personal information

## Suggestion Fields

- Submitter name
- Opportunity title
- Opportunity type
- Organization / provider
- Official HTTPS source URL
- Optional reviewer note

## Review Status

Every successfully saved suggestion receives the status:

**Pending / Awaiting Manual Review**

A suggestion cannot enter the production dataset automatically.

## Automated Browser Verification

Command:

`agy-node.cmd tests/suggest-check.js`

Results:

| Scenario | Result |
|---|---|
| Arabic RTL page load | PASS |
| Required-field validation | PASS |
| Non-HTTPS source rejected | PASS |
| Valid HTTPS suggestion saved | PASS |
| Suggestion stored as Pending | PASS |
| Pending suggestion persists after reload | PASS |
| English LTR rendering | PASS |
| Language-preserving navigation | PASS |
| 360px mobile viewport | PASS |
| Zero horizontal overflow | PASS |
| Keyboard focus | PASS |
| Production dataset unchanged | PASS |
| Browser console errors | 0 |
| Browser exceptions | 0 |

Final automated verdict:

**ALL TESTS PASSED**

## Production Data Integrity

The browser test independently compared the production dataset before and after saving a suggestion.

Result:

- Before: 50 records
- After: 50 records
- Production dataset: byte-for-byte unchanged

The production validator was also rerun:

`agy-node.cmd scripts/validate-data.js data/opportunities.json --final --today=2026-10-17`

Result:

**50 records checked successfully with 0 structural errors.**

## Regression Verification

Existing portal browser suites were rerun after adding Suggest navigation.

Final regression verdict:

**ALL TESTS PASSED**

Deadline utility tests also passed:

**8 / 8 tests passed.**

## Protected Files

Git verification confirmed no changes to:

- `data/opportunities.json`
- `data/schema.json`
- `scripts/validate-data.js`

## Screenshots

- `docs/evidence/desktop-suggest-opportunity.png`
- `docs/evidence/mobile-360px-suggest-opportunity.png`

## Safety Notes

- Suggestions are stored locally on the current browser/device.
- Suggestions are not submitted to a backend.
- Suggestions are not automatically published.
- Official source URLs must use HTTPS.
- Form values are rendered using safe DOM APIs.
- No external package or CDN is required.
- Manual verification remains mandatory before any opportunity can be added to production.

## Browser Recording

No dedicated Antigravity Browser Recording is claimed for this feature.

Automated real-browser tests and desktop/mobile screenshots are used as the available implementation evidence.
