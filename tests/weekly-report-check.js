'use strict';

const fs = require('fs');
const path = require('path');

const { analyze, formatReport } = require('../scripts/weekly-report.js');

const DATA_PATH = path.resolve(__dirname, '..', 'data', 'opportunities.json');
const TODAY = '2026-10-17';

function record(id, deadlineType, deadlineDate, verificationDate) {
  return {
    id,
    title: { ar: `AR ${id}`, en: `EN ${id}` },
    deadline: {
      type: deadlineType,
      date: deadlineDate,
      notes: null
    },
    verificationDate
  };
}

function assert(name, condition, details) {
  if (!condition) {
    console.error(`[FAIL] ${name}`);
    if (details !== undefined) {
      console.error(`       ${JSON.stringify(details)}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log(`[PASS] ${name}`);
}

const fixture = {
  opportunities: [
    record('fixed-14', 'fixed', '2026-10-31', '2026-10-17'),
    record('fixed-15', 'fixed', '2026-11-01', '2026-10-17'),
    record('fixed-today', 'fixed', '2026-10-17', '2026-10-17'),
    record('fixed-expired', 'fixed', '2026-10-16', '2026-10-17'),
    record('rolling', 'rolling', null, '2026-10-17'),
    record('unspecified', 'unspecified', null, '2026-10-17'),
    record('verification-90', 'rolling', null, '2026-07-19'),
    record('verification-91', 'rolling', null, '2026-07-18')
  ]
};

const result = analyze(fixture, TODAY);
const closingIds = result.closingSoon.map((item) => item.id);
const staleIds = result.staleVerification.map((item) => item.id);

assert('14-day boundary is included', closingIds.includes('fixed-14'));
assert('15-day boundary is excluded', !closingIds.includes('fixed-15'));
assert('deadline today is included', closingIds.includes('fixed-today'));
assert('expired deadline is excluded', !closingIds.includes('fixed-expired'));
assert('rolling deadline gets no invented date', !closingIds.includes('rolling'));
assert('unspecified deadline gets no invented date', !closingIds.includes('unspecified'));
assert('exactly 90-day verification age is not flagged', !staleIds.includes('verification-90'));
assert('91-day verification age is flagged', staleIds.includes('verification-91'));

const beforeBytes = fs.readFileSync(DATA_PATH);
const production = JSON.parse(beforeBytes.toString('utf8'));

const productionResult = analyze(production, TODAY);
formatReport(productionResult);

const afterBytes = fs.readFileSync(DATA_PATH);

assert(
  'production dataset remains byte-for-byte unchanged',
  beforeBytes.equals(afterBytes)
);

assert(
  'production record count remains 50',
  production.opportunities.length === 50,
  { count: production.opportunities.length }
);

if (process.exitCode) {
  console.log('\nFinal Test Verdict: SOME TESTS FAILED');
} else {
  console.log('\nFinal Test Verdict: ALL TESTS PASSED');
}
