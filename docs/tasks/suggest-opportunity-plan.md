# Suggest an Opportunity - Implementation Plan

## Goal

Add a safe bilingual community suggestion workflow to Yemen Opportunities Portal.

The feature allows a visitor to suggest an opportunity for later manual review by the project owner.

## Core Safety Rule

A submitted suggestion must NEVER be inserted automatically into the production opportunity dataset.

Every suggestion remains:

**Pending / Awaiting Manual Review**

until the project owner personally verifies the official source and manually decides whether to add it to production.

## Data Privacy

The form will request only:

- Submitter name - required

The form will NOT request:

- Email address
- Phone number
- Account information
- Any sensitive personal information

## Proposed Fields

- Submitter name - required
- Opportunity title - required
- Opportunity type - required
- Organization / provider - required
- Official HTTPS source URL - required
- Optional reviewer note

## Storage Model

Suggestions will be stored only in browser localStorage.

No backend is used.

The interface must clearly explain that:

- The suggestion is saved only on the current device.
- It is not automatically published.
- It has not been verified.
- It remains Pending until manually reviewed.

## Planned Files

- `suggest.html`
- `css/suggest.css`
- `js/suggest.js`
- `tests/suggest-check.js`
- `docs/testing/suggest-browser-evidence.md`
- `docs/evidence/desktop-suggest-opportunity.png`
- `docs/evidence/mobile-360px-suggest-opportunity.png`

Existing navigation pages may receive a language-preserving Suggest link.

## Interface Requirements

- Arabic primary language.
- Full English mode.
- Correct RTL / LTR switching.
- Consistent product design with the rest of the portal.
- Responsive at 360px with zero horizontal overflow.
- Keyboard accessible.
- Clear validation messages.
- Clear Pending status after save.
- Clear explanation that saving locally does not publish the opportunity.

## Validation Requirements

- Required fields cannot be empty.
- Source URL must be valid HTTPS.
- Unsafe URL schemes must be rejected.
- Form values must be rendered using safe DOM APIs.
- No unsafe HTML interpolation.

## Automated Browser Tests

Automated browser verification must test:

- Suggestion page loads successfully.
- Arabic renders with `lang=ar` and `dir=rtl`.
- English renders with `lang=en` and `dir=ltr`.
- Navigation preserves selected language.
- Required-field validation works.
- Non-HTTPS source URLs are rejected.
- A valid suggestion is saved as Pending.
- Saved suggestion persists after page reload.
- Production dataset length remains unchanged.
- `data/opportunities.json` remains untouched.
- 360px viewport has zero horizontal overflow.
- Keyboard focus works.
- Browser console error count is zero.

## Protected Files

The implementation must not modify:

- `data/opportunities.json`
- `data/schema.json`
- `scripts/validate-data.js`

## Success Criteria

The feature is complete only when:

- Valid suggestions can be saved locally as Pending.
- No suggestion can enter production automatically.
- Browser tests pass.
- Desktop and mobile screenshots are captured.
- Protected files remain unchanged.
- Final Git diff is reviewed before commit.

## Human Review

Status: Approved before implementation; implemented and verified on 2026-10-17.

Project-owner revision before approval:

- Request submitter name as the only personal field.
- Do not request email, phone number, account information, or sensitive personal information.


## Final Verification

- Suggest browser verification: ALL TESTS PASSED.
- Suggestions are stored locally with Pending status.
- Submitter name is the only requested personal field.
- HTTP source URLs are rejected; HTTPS is required.
- Arabic RTL and English LTR verified.
- Language-preserving navigation verified.
- 360px viewport verified with zero horizontal overflow.
- Keyboard focus verified.
- Browser console errors: 0.
- Browser exceptions: 0.
- Production dataset remained at 50 records and was byte-for-byte unchanged.
- Production validator: 50 records, 0 structural errors.
- Protected data/schema/validator files unchanged.
- Existing portal regression tests passed after navigation integration.
- Desktop and mobile evidence screenshots captured.
