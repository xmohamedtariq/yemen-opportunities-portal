# Opportunity Details, Favorites, and Deadline States

## Goal

Extend the Yemen Opportunities Portal with:

- A complete bilingual opportunity detail page.
- Persistent browser-based favorites.
- Date-only days-remaining calculations.
- A consistent 14-day closing-soon policy.
- Clear rolling, unspecified, today, and expired deadline states.

## Existing Context

The feature extends the existing listing, search, and filtering implementation.

The production dataset remains read-only and contains 50 manually verified opportunities.

## Constraints

- Vanilla HTML, CSS, and JavaScript only.
- No framework, CDN, package, backend, or database.
- Do not modify the production dataset, schema, or validator.
- Do not invent missing opportunity information.
- Store stable opportunity IDs only in localStorage.
- Render opportunity-controlled content through safe DOM APIs.

## Human Review Decisions

The implementation was designed and reviewed with these decisions:

1. Centralize deadline calculations in `js/deadlines.js`.
2. Parse date-only values using UTC calendar-day calculations to prevent timezone off-by-one errors.
3. Define closing soon as 0 to 14 days remaining, inclusive.
4. Never classify rolling, unspecified, or expired deadlines as closing soon.
5. Store favorites under the versioned key `yemen-opportunities:favorites:v1`.
6. Store only unique stable opportunity IDs, never full opportunity objects.
7. Recover safely from malformed localStorage content.
8. Load details through `detail.html?id=<stable-id>&lang=<ar|en>`.
9. Treat missing and invalid IDs as localized error states.
10. Require HTTPS for displayed external links and enforce `noopener noreferrer`.
11. Preserve the existing listing, search, filters, RTL/LTR, and mobile behavior.

## Files Created

- `detail.html`
- `js/deadlines.js`
- `js/favorites.js`
- `js/detail.js`
- `tests/deadline-utils-check.js`
- `tests/details-favorites-check.js`
- `docs/evidence/desktop-opportunity-details.png`
- `docs/evidence/mobile-360px-details.png`

## Files Extended

- `index.html`
- `css/styles.css`
- `js/list.js`
- `js/translations.js`
- `docs/evidence/desktop-initial-load.png`
- `docs/evidence/mobile-360px-view.png`

## Favorites Architecture

Favorites are stored as a JSON array of unique stable IDs:

`["yop-2027-001", "yop-2027-002"]`

No complete opportunity objects, personal information, or sensitive information are stored.

## Deadline Architecture

The shared deadline utility handles:

- Fixed future deadlines.
- Deadline today.
- Expired deadlines.
- Rolling deadlines.
- Unspecified deadlines.
- Invalid calendar dates.

Closing soon is true only for a valid fixed deadline with 0 to 14 days remaining.

## Browser Verification

The details and favorites browser suite passed all 14 scenarios with zero browser errors or warnings.

The original listing browser suite also continued to pass all 11 scenarios with zero console errors.

## Browser Recording

A dedicated Antigravity Browser Recording was not captured because the individual quota was unavailable during implementation.

No recording is claimed or fabricated.

Automated real-browser testing and desktop/mobile screenshots were produced. A full Antigravity Browser Recording can be added during final project testing after quota renewal.

## Protected Files

These files remained unchanged:

- `data/opportunities.json`
- `data/schema.json`
- `scripts/validate-data.js`

## Git Policy

No automatic commit was created. Staging and committing remain subject to final human review.
