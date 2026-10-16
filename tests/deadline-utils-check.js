/**
 * Deadline utility boundary verification.
 * Zero external dependencies.
 */

'use strict';

const assert = require('node:assert/strict');

const {
  CLOSING_SOON_DAYS,
  dateOnlyToUtcMs,
  getDeadlineStatus
} = require('../js/deadlines.js');

const referenceDate = '2026-10-13';

const cases = [
  {
    name: '14-day boundary is closing soon',
    deadline: { type: 'fixed', date: '2026-10-27' },
    expected: {
      kind: 'future',
      daysRemaining: 14,
      isClosingSoon: true
    }
  },
  {
    name: '15-day boundary is not closing soon',
    deadline: { type: 'fixed', date: '2026-10-28' },
    expected: {
      kind: 'future',
      daysRemaining: 15,
      isClosingSoon: false
    }
  },
  {
    name: 'Deadline today is closing soon',
    deadline: { type: 'fixed', date: '2026-10-13' },
    expected: {
      kind: 'today',
      daysRemaining: 0,
      isClosingSoon: true
    }
  },
  {
    name: 'Expired deadline is not closing soon',
    deadline: { type: 'fixed', date: '2026-10-12' },
    expected: {
      kind: 'expired',
      daysRemaining: -1,
      isClosingSoon: false
    }
  },
  {
    name: 'Rolling deadline has no invented date',
    deadline: { type: 'rolling', date: null },
    expected: {
      kind: 'rolling',
      daysRemaining: null,
      isClosingSoon: false
    }
  },
  {
    name: 'Unspecified deadline has no invented date',
    deadline: { type: 'unspecified', date: null },
    expected: {
      kind: 'unspecified',
      daysRemaining: null,
      isClosingSoon: false
    }
  },
  {
    name: 'Impossible calendar date is rejected',
    deadline: { type: 'fixed', date: '2026-02-31' },
    expected: {
      kind: 'invalid',
      daysRemaining: null,
      isClosingSoon: false
    }
  },
  {
    name: 'Missing deadline is treated as unspecified',
    deadline: null,
    expected: {
      kind: 'unspecified',
      daysRemaining: null,
      isClosingSoon: false
    }
  }
];

assert.equal(
  CLOSING_SOON_DAYS,
  14,
  'Closing-soon threshold must remain 14 days.'
);

assert.equal(
  dateOnlyToUtcMs('2026-02-31'),
  null,
  'Impossible calendar dates must return null.'
);

cases.forEach((testCase, index) => {
  const actual = getDeadlineStatus(
    testCase.deadline,
    referenceDate
  );

  assert.deepEqual(
    actual,
    testCase.expected,
    testCase.name
  );

  console.log(
    `[${index + 1}] PASS: ${testCase.name}`
  );
});

console.log('');
console.log(
  `All ${cases.length} deadline utility tests passed.`
);