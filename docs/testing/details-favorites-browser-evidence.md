# Details and Favorites Browser Evidence

**Verification date:** 2026-10-15
**Feature:** Opportunity details, favorites, and deadline states
**Production records:** 50

## Test Environment

The portal was served locally at:

`http://127.0.0.1:8080`

Automated browser interaction used Google Chrome through the Chrome DevTools Protocol with Node.js built-in APIs only.

No external testing package was installed.

## Details and Favorites Results

| Scenario | Result |
|---|---|
| Valid Arabic opportunity details | PASS |
| Correct Arabic RTL state | PASS |
| Secure official-source link | PASS |
| Null application link remains hidden | PASS |
| Add favorite | PASS |
| Store stable ID only | PASS |
| Favorite persists after reload | PASS |
| Remove favorite | PASS |
| Switch to English and LTR | PASS |
| Rolling deadline | PASS |
| Unspecified deadline | PASS |
| Invalid opportunity ID | PASS |
| Missing opportunity ID | PASS |
| Detail and favorite controls on all 50 cards | PASS |
| Detail page at 360px | PASS |
| Zero horizontal overflow | PASS |
| Keyboard focus behavior | PASS |

The automated suite grouped these checks into 14 passing browser scenarios.

Browser error/warning count:

**0**

Final details and favorites verdict:

**ALL TESTS PASSED**

## Listing Regression Results

The existing listing regression suite was run again after integration.

| Scenario | Result |
|---|---|
| Initial 50-record load | PASS |
| Arabic keyword search | PASS |
| English keyword search | PASS |
| Opportunity type filter | PASS |
| Combined search and filters | PASS |
| Reset filters | PASS |
| No-results state | PASS |
| Switch to English | PASS |
| Switch back to Arabic | PASS |
| Mobile 360px without overflow | PASS |
| Keyboard focus behavior | PASS |

Console log count:

**0**

Final listing regression verdict:

**ALL TESTS PASSED**

## Deadline Utility Coverage

Deterministic tests cover:

- 14-day inclusive closing-soon boundary.
- 15-day non-closing-soon boundary.
- Deadline today.
- Expired deadline.
- Rolling deadline.
- Unspecified deadline.
- Impossible calendar date.
- Missing deadline value.

## Screenshots

- `docs/evidence/desktop-opportunity-details.png`
- `docs/evidence/mobile-360px-details.png`
- `docs/evidence/desktop-initial-load.png`
- `docs/evidence/mobile-360px-view.png`

## External Link Security

Displayed external links:

- Require HTTPS.
- Open in a new tab.
- Use `rel="noopener noreferrer"`.

## Browser Recording Status

A dedicated Antigravity Browser Recording was not available because the individual quota was exhausted during implementation.

No Browser Recording is claimed. Automated browser evidence and screenshots are provided instead.

## Protected-File Verification

Git confirmed no changes to:

- `data/opportunities.json`
- `data/schema.json`
- `scripts/validate-data.js`
