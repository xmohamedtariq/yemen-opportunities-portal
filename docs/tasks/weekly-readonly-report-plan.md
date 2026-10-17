# Weekly Read-Only Opportunity Report - Implementation Plan

## Goal

Implement the required weekly read-only maintenance report for Yemen Opportunities Portal.

The report must identify:

- opportunities with fixed deadlines closing within the next 14 days
- opportunity records whose verification date is older than 90 days

## Read-Only Requirement

The report must never modify:

- `data/opportunities.json`
- `data/schema.json`
- `scripts/validate-data.js`
- any opportunity record

The scheduled task must report findings only.

## Planned Files

- `scripts/weekly-report.js`
- `tests/weekly-report-check.js`
- `docs/testing/weekly-report-evidence.md`

## Report Logic

### Closing Soon

Include only records with:

- `deadline.type === "fixed"`
- a valid fixed deadline date
- deadline date from today through 14 days inclusive

Expired deadlines must not be classified as closing soon.

Rolling and unspecified deadlines must not receive invented dates.

### Verification Age

Calculate age from each record's `verificationDate`.

Flag records whose verification age is greater than 90 days.

## Deterministic Testing

The script should support an explicit reference date argument such as:

`--today=2026-10-17`

This allows reproducible testing and evidence.

## Output

The report should display:

- reference date
- number of production records checked
- Closing Within 14 Days section
- Verification Older Than 90 Days section
- record ID
- bilingual or clear identifying title
- deadline where applicable
- verification date and age where applicable
- summary counts

## Safety

- No package installation.
- No network requests.
- No scraping.
- No data generation.
- No production-data writes.
- No automatic opportunity removal or update.

## Automated Verification

Tests must verify:

- 14-day boundary is included
- 15-day boundary is excluded
- deadline today is included
- expired deadline is excluded
- rolling deadline receives no invented date
- unspecified deadline receives no invented date
- exactly 90-day verification age is not flagged
- 91-day verification age is flagged
- production dataset remains byte-for-byte unchanged
- production record count remains 50

## Scheduled Task

After implementation and testing, configure Antigravity to run a weekly read-only task.

The scheduled task must only read the production dataset and return the report.

It must not edit, commit, push, or rewrite files.

## Evidence

Document:

- deterministic test result
- production-data integrity result
- sample weekly report output
- genuine Antigravity scheduled-task configuration

Do not claim that the scheduled task exists until it is actually configured.

## Success Criteria

- deterministic automated tests pass
- production data remains unchanged
- report correctly identifies both required maintenance conditions
- scheduled Antigravity task is genuinely configured
- task is explicitly read-only
- evidence is documented before final submission

## Human Review

Status: Implemented, tested, scheduled, and verified on 2026-10-17.
