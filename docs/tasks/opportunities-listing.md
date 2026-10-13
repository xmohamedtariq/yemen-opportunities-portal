# Task 02 - Opportunities Listing, Search, and Filtering

## Goal

Build Agent A's part of the Yemen Opportunities Portal:

- Load and display the 50 production opportunities.
- Implement bilingual keyword search.
- Implement client-side filters.
- Support Arabic RTL and English LTR.
- Work correctly at 360px.
- Keep the production data and validator files unchanged.

## Context

The task used the existing validated production dataset in:

`data/opportunities.json`

The dataset already contained 50 verified records before Agent A implementation.

## Constraints

- Vanilla HTML, CSS, and JavaScript only.
- No CDN or external runtime packages.
- Do not modify `data/opportunities.json`.
- Do not modify `data/schema.json`.
- Do not modify `scripts/validate-data.js`.
- No favorites, detail page, Service Worker, dashboard, or submission form in this task.
- Opportunity data must be rendered using safe DOM APIs.

## Human Review of the Initial Plan

Before implementation, the plan was revised to:

1. Rename the Agent A logic file from `app.js` to `list.js` to match the assignment structure.
2. Require safe DOM rendering with `createElement()` and `textContent` instead of unsafe opportunity-data HTML interpolation.
3. Require browser evidence rather than relying only on implementation claims.
4. Generate filter options from values actually present in the production dataset.
5. Treat WCAG AA as a target to verify rather than an untested claim.
6. Require Git evidence proving protected data/schema/validator files remain unchanged.
7. Keep user search plain-text and Arabic normalization intentionally small.

The revised plan was reviewed and explicitly approved before implementation.

## Files Implemented

- `index.html`
- `css/styles.css`
- `js/translations.js`
- `js/list.js`
- `tests/browser-check.js`
- `docs/evidence/desktop-initial-load.png`
- `docs/evidence/mobile-360px-view.png`

## Verification

Automated browser verification was performed using Chrome DevTools Protocol against the locally served application.

All 11 scenarios passed:

- Initial 50-record load
- Arabic keyword search
- English keyword search
- Opportunity type filter
- Combined search and filters
- Reset filters
- No-results state
- Switch Arabic to English
- Switch English back to Arabic
- 360px viewport with no horizontal overflow
- Keyboard focus behavior

Console log count during the verification suite: 0.

## Browser Recording

A dedicated Antigravity Browser Recording was not produced because the individual Antigravity quota was reached before the agent completed its final artifact workflow.

This limitation is recorded honestly. Automated real-browser testing and desktop/mobile screenshots were successfully produced instead.

## Protected Files

The following files were treated as immutable during Agent A:

- `data/opportunities.json`
- `data/schema.json`
- `scripts/validate-data.js`

Their Git diff is checked before the final commit.

## Delivery

No Git commit was created automatically. Final staging and commit remain under human review.
