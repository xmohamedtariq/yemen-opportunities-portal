# Dataset Validator Test Evidence

This document records the empirical validation evidence produced during the verification of `scripts/validate-data.js` against production and fixture datasets.

> **Environment Note:** In standard Node.js installations, the validator is executed via `node scripts/validate-data.js ...`. In this Google Antigravity environment, the equivalent Node.js runtime (v24.20.0) was invoked via its bundled `agy-node.cmd` wrapper. Both methods execute the identical command-line interface.

---

## 1. Test Suite Configuration

- **Reference Test Date**: `2026-10-13` (enforced deterministically via `--today=2026-10-13`)
- **Zero Fake Data Policy**: `data/opportunities.json` contains strictly **zero** sample, placeholder, or fake opportunity records.
- **Fixture Directory**: All test data resides isolated under `tests/fixtures/`.

---

## 2. Test Execution & Evidence

### Test 1: Empty Production Dataset (Development Mode)
Tests that `data/opportunities.json` starts clean and empty during development without failing validation.

- **Command**:
  ```bash
  node scripts/validate-data.js data/opportunities.json --today=2026-10-13
  ```
- **Expected Exit Code**: `0`
- **Actual Exit Code**: `0`
- **Output**:
  ```text
  ==================================================
  Yemen Opportunities Portal - Dataset Validator
  Target:    data/opportunities.json
  Reference: 2026-10-13 (explicit override)
  ==================================================

  ✔ Validation PASSED: 0 record(s) checked successfully with 0 structural errors.
  ```

---

### Test 2: Production Readiness Check (`--final` Mode)
Tests that running `--final` (or `--min-records=50`) on the empty production dataset fails as expected before real data is gathered.

- **Command**:
  ```bash
  node scripts/validate-data.js data/opportunities.json --final --today=2026-10-13
  ```
- **Expected Exit Code**: `1`
- **Actual Exit Code**: `1`
- **Output**:
  ```text
  ==================================================
  Yemen Opportunities Portal - Dataset Validator
  Target:    data/opportunities.json
  Reference: 2026-10-13 (explicit override)
  Readiness: Minimum 50 records required (--final / --min-records)
  ==================================================

  ✖ Validation Errors (1):
    [1] Readiness check failed: expected at least 50 records, found 0.

  Validation FAILED with 1 error(s).
  ```

---

### Test 3: Valid Test Fixture
Tests that a structurally complete and conforming record passes with zero errors and zero warnings.

- **Command**:
  ```bash
  node scripts/validate-data.js tests/fixtures/valid-opportunity.json --today=2026-10-13
  ```
- **Expected Exit Code**: `0`
- **Actual Exit Code**: `0`
- **Output**:
  ```text
  ==================================================
  Yemen Opportunities Portal - Dataset Validator
  Target:    tests/fixtures/valid-opportunity.json
  Reference: 2026-10-13 (explicit override)
  ==================================================

  ✔ Validation PASSED: 1 record(s) checked successfully with 0 structural errors.
  ```

---

### Test 4: Warning-Only Test Fixture
Tests that non-fatal issues (data freshness >90 days and recorded open status with a passed deadline) emit descriptive warnings while returning exit code 0.

- **Command**:
  ```bash
  node scripts/validate-data.js tests/fixtures/warning-samples.json --today=2026-10-13
  ```
- **Expected Exit Code**: `0`
- **Actual Exit Code**: `0`
- **Warnings Reported**:
  1. Record `sample-warning-001`: `verificationDate` (2026-06-01) is 134 days old (>90 days threshold).
  2. Record `sample-warning-002`: recorded `applicationStatus: "open"` is contradictory with passed deadline `2026-09-01`.
- **Output**:
  ```text
  ==================================================
  Yemen Opportunities Portal - Dataset Validator
  Target:    tests/fixtures/warning-samples.json
  Reference: 2026-10-13 (explicit override)
  ==================================================

  ⚠ Warnings (2):
    [1] Record [0] (ID: 'sample-warning-001'): Verification date (2026-06-01) is 134 days old (> 90 days). Manual re-verification recommended.
    [2] Record [1] (ID: 'sample-warning-002'): Contradictory status: recorded applicationStatus is 'open', but fixed deadline (2026-09-01) has already passed relative to 2026-10-13.

  ✔ Validation PASSED: 2 record(s) checked successfully with 0 structural errors.
    (Note: 2 non-fatal warning(s) reported above.)
  ```

---

### Test 5: Invalid Structural Defects Fixture
Tests that the validator catches and reports all targeted structural errors across multiple records and exits with code 1.

- **Command**:
  ```bash
  node scripts/validate-data.js tests/fixtures/invalid-samples.json --today=2026-10-13
  ```
- **Expected Exit Code**: `1`
- **Actual Exit Code**: `1`
- **Defects Reported (All 7 Caught)**:
  1. Non-existent ISO 3166-1 alpha-2 country code (`"ZZ"`).
  2. Non-HTTPS URL (`http://insecure.example.org/scholarship`).
  3. Future verification date (`2026-12-31`).
  4. Duplicate identifier (`invalid-fixture-001`).
  5. Title field `title.ar` missing Arabic script.
  6. Disallowed category (`"astrology"`).
  7. Impossible calendar date (`2026-02-31`).
- **Output**:
  ```text
  ==================================================
  Yemen Opportunities Portal - Dataset Validator
  Target:    tests/fixtures/invalid-samples.json
  Reference: 2026-10-13 (explicit override)
  ==================================================

  ✖ Validation Errors (7):
    [1] Record [0] (ID: 'invalid-fixture-001'): Country code 'ZZ' is not a valid ISO 3166-1 alpha-2 code.
    [2] Record [0] (ID: 'invalid-fixture-001'): Field 'officialSourceUrl' ('http://insecure.example.org/scholarship') must be a valid HTTPS URL.
    [3] Record [0] (ID: 'invalid-fixture-001'): Verification date (2026-12-31) cannot be in the future (reference today: 2026-10-13).
    [4] Record [1] (ID: 'invalid-fixture-001'): Duplicate ID 'invalid-fixture-001' previously defined in Record [0].
    [5] Record [1] (ID: 'invalid-fixture-001'): Field 'title.ar' must contain Arabic text.
    [6] Record [1] (ID: 'invalid-fixture-001'): Category 'astrology' is not in controlled list: [technology, engineering, health, business, humanities, education, arts, general].
    [7] Record [1] (ID: 'invalid-fixture-001'): Deadline date '2026-02-31' is not a valid YYYY-MM-DD calendar date.

  Validation FAILED with 7 error(s).
  ```

---

### Test 6: Malformed JSON Syntax Fixture
Tests that malformed JSON is intercepted cleanly with line and column syntax error details.

- **Command**:
  ```bash
  node scripts/validate-data.js tests/fixtures/malformed.json --today=2026-10-13
  ```
- **Expected Exit Code**: `1`
- **Actual Exit Code**: `1`
- **Output**:
  ```text
  ==================================================
  Yemen Opportunities Portal - Dataset Validator
  Target:    tests/fixtures/malformed.json
  Reference: 2026-10-13 (explicit override)
  ==================================================

  ✖ Malformed JSON syntax in tests/fixtures/malformed.json:
    Expected ',' or '}' after property value in JSON at position 159 (line 8 column 7)
  ```

---

## 3. Test Summary Table

| Test Target | Flag / Options | Expected Exit | Actual Exit | Verification Status |
| :--- | :--- | :---: | :---: | :---: |
| `data/opportunities.json` | `--today=2026-10-13` | 0 | 0 | **PASSED** |
| `data/opportunities.json` | `--final --today=2026-10-13` | 1 | 1 | **PASSED** |
| `tests/fixtures/valid-opportunity.json` | `--today=2026-10-13` | 0 | 0 | **PASSED** |
| `tests/fixtures/warning-samples.json` | `--today=2026-10-13` | 0 | 0 | **PASSED** |
| `tests/fixtures/invalid-samples.json` | `--today=2026-10-13` | 1 | 1 | **PASSED** |
| `tests/fixtures/malformed.json` | `--today=2026-10-13` | 1 | 1 | **PASSED** |
