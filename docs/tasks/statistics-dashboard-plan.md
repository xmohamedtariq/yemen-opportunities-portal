# Statistics Dashboard - Implementation Plan

## Goal

Add a bilingual statistics dashboard that summarizes the verified production dataset without modifying opportunity data.

## Context

The Yemen Opportunities Portal currently contains 50 manually verified production opportunities in data/opportunities.json.
The dashboard is an optional excellence feature from the graduation-project specification.

## User Value

The dashboard helps users understand the opportunity landscape at a glance, including the distribution of opportunities by field and country.

## Planned Files

- statistics.html
- css/statistics.css
- js/statistics.js
- tests/statistics-check.js
- docs/testing/statistics-browser-evidence.md
- docs/evidence/desktop-statistics-dashboard.png
- docs/evidence/mobile-360px-statistics-dashboard.png

Existing navigation pages may receive a Statistics link while preserving the current language.

## Data Policy

- Read data/opportunities.json only.
- Never add, remove, regenerate, or modify opportunity records.
- Calculate every displayed statistic dynamically from the production dataset.
- Do not hard-code counts that could become stale.
- Do not infer missing opportunity facts.

## Dashboard Content

1. Total verified opportunities.
2. Opportunity counts by type.
3. Opportunity counts by category / field.
4. Opportunity counts by country or international/global scope.
5. Opportunity counts by funding type when the source data contains that value.

## Interface Requirements

- Arabic is the default language.
- Full English support.
- Correct RTL and LTR behavior.
- Consistent with the existing product visual system.
- No horizontal scrolling at 360px.
- Keyboard-accessible controls and visible focus states.
- Clear loading and error states.

## Technical Constraints

- Vanilla HTML, CSS, and JavaScript only.
- No CDN.
- No external chart library.
- No npm packages.
- Use safe DOM APIs such as createElement and textContent.
- Statistics visualization will use native HTML/CSS bars and cards.

## Navigation

- Add a Statistics navigation link to the main product pages.
- Preserve ?lang=ar or ?lang=en while navigating.
- The dashboard language toggle must update lang and dir correctly.

## Testing

Automated browser tests must verify:

- Production dataset loads successfully.
- Total count equals the actual dataset length.
- Type statistics are calculated from data rather than fixed values.
- Category statistics are calculated correctly.
- Country/global statistics are calculated correctly.
- Arabic renders with lang=ar and dir=rtl.
- English renders with lang=en and dir=ltr.
- Navigation preserves the selected language.
- 360px viewport has zero horizontal overflow.
- Keyboard focus works.
- Browser console error count is zero.

## Protected Files

The implementation must not modify:

- data/opportunities.json
- data/schema.json
- scripts/validate-data.js

## Success Criteria

The feature is complete only when browser tests pass, screenshots are captured, protected files are unchanged, and the final Git diff is reviewed before commit.

## Human Review

Status: Approved before implementation; implemented and verified on 2026-10-17.


## Final Verification

- Statistics dashboard browser suite: ALL TESTS PASSED.
- Production dataset: 50 records, 0 structural errors.
- Arabic RTL and English LTR verified.
- 360px viewport verified with zero horizontal overflow.
- Browser console errors: 0.
- Browser exceptions: 0.
- Protected production data/schema/validator files unchanged.
- Desktop and mobile evidence screenshots captured.
