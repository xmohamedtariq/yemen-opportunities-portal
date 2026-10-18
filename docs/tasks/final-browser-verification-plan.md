# Final Browser Verification Plan

## Status

Approved by project owner before execution on 2026-10-18.

## Date

2026-10-18

## Goal

Perform the final browser-based acceptance verification of the Yemen Opportunities Portal before public deployment and submission.

This testing pass verifies the required user stories using the real production dataset and records genuine browser evidence.

## Protected Files

The testing agent must not modify:

- `data/opportunities.json`
- `data/schema.json`
- `scripts/validate-data.js`
- production opportunity content

Testing should be read-only unless a genuine defect is found. Any proposed fix must stop the testing pass and return to human review before implementation.

## Required User Stories

### US-01 — Search

Verify that a user can search opportunities using a meaningful keyword and receive relevant results.

### US-02 — Filters

Verify country, field/category, education-level, and related filters, including reset behavior.

### US-03 — Deadline Awareness

Verify that opportunities with approaching fixed deadlines display the intended deadline state and that rolling/unspecified deadlines are handled correctly.

### US-04 — Opportunity Details

Open a production opportunity and verify title, organization, deadline, source, verification information, eligibility information, and navigation.

### US-05 — Favorites

Add an opportunity to favorites, reload/navigate, confirm persistence, then remove it.

### US-06 — Mobile 360px

Test at 360px viewport width and confirm there is no unintended horizontal page overflow and that navigation, cards, filters, buttons, and content remain usable.

### US-07 — Offline After First Load

Load the application online first, allow the service worker/app shell to cache, then switch the browser offline and verify that previously available core pages continue to function as designed.

## Additional Required Checks

- Arabic RTL presentation
- English LTR presentation
- language switching
- keyboard-accessible core controls
- no unexpected browser console errors
- production dataset loads successfully
- official-source links remain external links
- statistics page loads from production data
- suggestion page does not modify production opportunities automatically

## Browser Evidence

Preferred evidence: genuine Antigravity Browser Recording covering the required user stories.

Where a single recording cannot clearly demonstrate a requirement, save a real browser screenshot as supporting evidence.

Never claim that a Browser Recording exists unless Antigravity actually creates one.

## Mobile Evidence

The 360px browser viewport test is part of automated/browser verification.

A separate real-phone test will be completed by the project owner after public deployment.

## Offline Evidence

Offline testing must occur only after an initial successful online load.

The test must distinguish a genuinely cached offline experience from a browser page that merely remained open in memory.

## Evidence Output

Create or update:

- `docs/testing/final-browser-verification.md`
- genuine Browser Recording reference if produced
- supporting screenshots only when actually captured

The evidence document must state exactly which checks passed, failed, or could not be recorded.

## Regression Tests

After browser verification, run the existing automated acceptance/regression tests and dataset validator.

Expected existing suites include:

- listing/search/filter checks
- details/favorites checks
- about-page checks
- statistics checks
- suggestion checks
- offline/service-worker checks
- deadline utility checks

## Success Criteria

The final browser verification passes only when:

1. Required user stories US-01 through US-07 are genuinely tested.
2. No blocking browser or console error is found.
3. The 360px browser test passes.
4. Offline behavior is genuinely tested after first load.
5. Production data remains unchanged by the testing pass.
6. Existing regression tests still pass.
7. Evidence distinguishes actual recordings/screenshots from checks without visual evidence.

## Human Review

Approval status: APPROVED BY PROJECT OWNER BEFORE EXECUTION ON 2026-10-18

No final browser testing should begin until the project owner explicitly approves this plan.
