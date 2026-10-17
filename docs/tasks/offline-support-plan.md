# Offline Support - Implementation Plan

## Goal

Implement US-07: Yemen Opportunities Portal must continue to work offline after the user has visited it successfully at least once.

## Scope

Offline support will cover the portal application shell and the production opportunity dataset needed for browsing previously loaded portal content.

Planned offline-capable pages:

- `index.html`
- `detail.html`
- `about.html`
- `statistics.html`
- `suggest.html`

## Planned Files

- `service-worker.js`
- `js/offline.js`
- `tests/offline-check.js`
- `docs/testing/offline-browser-evidence.md`
- Offline evidence screenshots

Existing HTML pages will be updated only to register the Service Worker.

## Caching Strategy

- Use a versioned application cache.
- Pre-cache essential local HTML, CSS, JavaScript, images, and `data/opportunities.json`.
- Do not cache external websites or official opportunity destination pages.
- Do not use a CDN or external package.
- Keep production opportunity data read-only.

## Required Local Assets

The Service Worker should cache the local resources required for the main portal experience, including:

- Main HTML pages
- Shared CSS
- Page-specific CSS
- Shared JavaScript
- Page-specific JavaScript
- `data/opportunities.json`
- Local portal logo
- Local creator image where used

## Runtime Behavior

- First successful online visit installs the Service Worker and application cache.
- After installation, supported portal pages must load without network access.
- Search and filtering must continue to work offline.
- Opportunity details must continue to load from cached production data.
- Statistics must continue to calculate from cached production data.
- Favorites must continue to work through localStorage.
- Suggestion drafts / Pending suggestions must continue to use localStorage.

## Data Integrity

Offline support must never modify:

- `data/opportunities.json`
- `data/schema.json`
- `scripts/validate-data.js`

No opportunity data may be generated, rewritten, or invented by the Service Worker.

## Update Safety

- Cache name must include a version.
- Old portal caches should be removed during Service Worker activation.
- New application versions should be able to replace old cached assets safely.

## Failure Handling

- Network failures should use a cached local response when available.
- The portal must not fake successful access to an external official source while offline.
- External official links remain real HTTPS links and may require internet access.

## Browser Verification

Automated browser testing must verify:

- Service Worker registers successfully.
- Service Worker reaches an activated state.
- Essential portal resources are cached.
- Online first visit succeeds.
- Network is then disabled.
- `index.html` reloads successfully offline.
- Search/filter functionality works offline.
- Opportunity details load offline.
- About page loads offline.
- Statistics page loads offline.
- Suggest page loads offline.
- Production dataset remains available offline.
- Arabic RTL remains correct.
- English LTR remains correct.
- 360px viewport has zero horizontal overflow.
- Browser console has zero unexpected errors.

## Manual Browser Verification

The final evidence should demonstrate the required sequence:

1. Open the portal online.
2. Allow the Service Worker to install.
3. Confirm the application is cached.
4. Disable network access.
5. Reload the portal.
6. Navigate and use core portal functionality offline.

## Success Criteria

Offline support is complete only when:

- The portal works after the first successful visit with network disabled.
- Core user stories remain usable from cached local resources.
- Automated offline browser verification passes.
- Production data remains unchanged.
- Existing browser regression suites still pass.
- Evidence is documented before commit.

## Human Review

Status: Approved before implementation; implemented and verified on 2026-10-17.


## Final Verification

- Service Worker registered and activated successfully.
- Versioned application cache verified.
- Essential local application resources cached.
- Network was disabled during automated browser verification.
- Portal successfully reloaded offline.
- Search remained interactive offline.
- Opportunity details loaded offline.
- About page loaded offline.
- Statistics dashboard calculated from cached production data.
- Suggest page remained available offline.
- Arabic RTL and English LTR verified offline.
- 360px viewport verified with zero horizontal overflow.
- Browser console errors: 0.
- Browser exceptions: 0.
- Network loading failures: 0.
- Existing portal regression suites: ALL TESTS PASSED.
- Deadline utilities: 8 / 8 passed.
- Production dataset: 50 records, 0 structural errors.
- Protected production data/schema/validator files unchanged.
- Desktop and mobile Offline screenshots captured.
