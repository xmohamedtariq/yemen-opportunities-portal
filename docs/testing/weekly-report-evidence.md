# Weekly Read-Only Report - Verification Evidence

## Verification Date

2026-10-17

## Purpose

Verify the weekly maintenance report that identifies:

- fixed deadlines closing within the next 14 days
- opportunity records whose verification date is older than 90 days

## Implementation

- `scripts/weekly-report.js`
- `tests/weekly-report-check.js`

The implementation is zero-dependency and read-only.

It does not modify production opportunity data.

## Deterministic Test Command

`agy-node.cmd tests/weekly-report-check.js`

## Automated Test Results

- 14-day boundary included: PASS
- 15-day boundary excluded: PASS
- deadline today included: PASS
- expired deadline excluded: PASS
- rolling deadline receives no invented date: PASS
- unspecified deadline receives no invented date: PASS
- exactly 90-day verification age not flagged: PASS
- 91-day verification age flagged: PASS
- production dataset byte-for-byte unchanged: PASS
- production record count remains 50: PASS

**Final Test Verdict: ALL TESTS PASSED**

## Production Sample Report

Reference date: `2026-10-17`

Production records checked: `50`

Closing within 14 days: `0`

Verification older than 90 days: `0`

The report confirmed that no production records were modified.

## Protected Files

The following files remained unchanged:

- `data/opportunities.json`
- `data/schema.json`
- `scripts/validate-data.js`

## Scheduled Task

**Status: Pending**

The Antigravity weekly scheduled task has not yet been configured.

No claim is made that scheduled execution exists until genuine configuration evidence is available.
