# Test Methodology

## Purpose

The automated tests in Yemen Opportunities Portal are deterministic acceptance and regression tests for defined project requirements.

They are not presented as a general benchmark of software quality and do not prove that every possible defect is absent.

## Test Categories

### Listing and Search

`tests/browser-check.js` verifies defined listing, search, filter, bilingual, keyboard, console, and 360px scenarios.

### Opportunity Details and Favorites

`tests/details-favorites-check.js` verifies detail rendering, favorite persistence, deadline states, navigation, responsive behavior, and browser health.

### About Page

`tests/about-page-check.js` verifies RTL/LTR behavior, navigation, language state, assets, safe profile links, keyboard behavior, 360px layout, screenshots, and browser console health.

### Statistics

`tests/statistics-check.js` verifies statistics calculated from the production opportunity dataset and related bilingual/responsive behavior.

### Opportunity Suggestions

`tests/suggest-check.js` verifies the local manual-review submission flow, validation, Pending state, privacy constraints, bilingual behavior, and browser health.

### Offline Operation

`tests/offline-check.js` verifies Service Worker activation, cached application resources, offline reload, offline data access, key application pages, language behavior, responsive layout, and runtime errors.

### Deadline Logic

`tests/deadline-utils-check.js` verifies deterministic deadline-state calculations.

### Weekly Maintenance Report

`tests/weekly-report-check.js` uses deterministic dates to verify the 14-day closing window, expired-record exclusion, rolling/unspecified behavior, the over-90-day verification rule, and production-file immutability.

### Data Validation

`scripts/validate-data.js` verifies the structure and required fields of the manually maintained production dataset.

## Boundary Testing

Boundary fixtures intentionally test cases such as:

- today versus expired
- 14 days versus 15 days
- 90 days versus 91 days
- fixed versus rolling versus unspecified deadlines
- 360px viewport width

These fixtures are designed to test specific rules. Passing them means those rules behaved as specified; it does not mean the test set represents every real-world input.

## Production Data and Test Data

Production opportunity data is maintained separately from synthetic or deterministic testing cases.

Tests must not rewrite `data/opportunities.json`, `data/schema.json`, or the production validator as a side effect.

Protected-file checks are used during major implementation stages to verify this.

## Interpreting ALL TESTS PASSED

`ALL TESTS PASSED` means that every acceptance scenario defined in that particular test suite passed during that execution.

It must not be interpreted as:

- 100% coverage of all possible user behavior
- proof that no defect can exist
- an independent scientific benchmark
- evidence that human usability testing is unnecessary

## Human Testing

Automated browser tests complement, rather than replace, the final required human checks:

- real-device mobile testing where available
- first-time / novice-user testing
- final deployed-site verification
- genuine Antigravity Browser Recording when available and actually produced

## Evidence Integrity

Test results, screenshots, recordings, and agent reports are documented only when they are actually produced.

No missing Browser Recording or human test is represented as completed merely because automated tests passed.
