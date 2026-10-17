# Agent C - About Page and Bilingual Documentation Plan

## Goal

Finalize and verify the About page, bilingual navigation, and project documentation for Yemen Opportunities Portal as a professional public product experience.

## Scope

Agent C is responsible only for the About experience and supporting public documentation.

The task includes:

- Review and finalize `about.html`.
- Review bilingual Arabic RTL and English LTR behavior.
- Verify shared navigation and language switching.
- Verify creator information and external profile links.
- Review `README.md` for clarity and professional presentation.
- Ensure technical evidence stays in repository documentation rather than cluttering the public website.
- Preserve responsive behavior at 360px.
- Verify keyboard accessibility and browser console health.

## Allowed Files

- `about.html`
- About-related CSS or shared styles only when required.
- About-related JavaScript or translation files only when required.
- `README.md`
- `docs/testing/about-page-browser-evidence.md`
- About evidence screenshots.

## Protected Files

Agent C must not modify:

- `data/opportunities.json`
- `data/schema.json`
- `scripts/validate-data.js`
- production opportunity records
- security evidence
- scheduled-maintenance files

## Interface Requirements

- Arabic is fully RTL.
- English is fully LTR.
- Language state remains consistent during navigation.
- Public wording must look like a real product, not an internal development page.
- No CDN or external runtime dependency may be introduced.
- Layout must work at 360px without horizontal overflow.
- Interactive controls must remain keyboard accessible.
- External links opened in a new tab must use `noopener noreferrer`.

## Documentation Requirements

- README must remain concise and easy to scan.
- Do not turn README into a long reference manual.
- Keep implementation evidence in `docs/`.
- Do not claim tests or evidence that were not actually produced.

## Browser Verification

The final browser verification must check:

1. Arabic About page loads in RTL.
2. English About page loads in LTR.
3. Language switch labels are correct.
4. Navigation preserves the selected language.
5. Logo and creator image load successfully.
6. GitHub and LinkedIn links are present and safe.
7. Navigation back to Opportunities works.
8. 360px viewport has no horizontal page overflow.
9. Keyboard focus is usable.
10. Browser console contains no unexpected errors.

## Success Criteria

Agent C is complete only when:

- Approved scope is followed.
- Public About page is professional in Arabic and English.
- README remains concise and reviewer-friendly.
- Automated browser verification passes.
- Desktop and 360px evidence are available.
- Protected files remain unchanged.
- Final Git diff is reviewed by the project owner before commit.

## Human Review

Status: Approved by the project owner before execution on 2026-10-17.

The project owner explicitly approved this plan before the Agent C finalization run begins.
