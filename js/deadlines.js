/**
 * Yemen Opportunities Portal - Deadline Utilities
 *
 * Centralized date-only deadline calculations.
 * Uses UTC day numbers internally to avoid timezone-related off-by-one errors.
 */

(function (global) {
  'use strict';

  const DAY_MS = 24 * 60 * 60 * 1000;
  const CLOSING_SOON_DAYS = 14;

  /**
   * Parses YYYY-MM-DD as a calendar date and returns a UTC day number.
   * Returns null for malformed or impossible calendar dates.
   */
  function dateOnlyToUtcMs(value) {
    if (typeof value !== 'string') return null;

    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    if (!match) return null;

    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);

    const utcMs = Date.UTC(year, month - 1, day);
    const parsed = new Date(utcMs);

    if (
      parsed.getUTCFullYear() !== year ||
      parsed.getUTCMonth() !== month - 1 ||
      parsed.getUTCDate() !== day
    ) {
      return null;
    }

    return utcMs;
  }

  /**
   * Converts a Date or YYYY-MM-DD string into a UTC calendar-day value.
   *
   * For Date objects, local calendar components are intentionally used because
   * the portal presents date-only deadlines to the user in their local session.
   */
  function referenceDateToUtcMs(referenceDate) {
    if (typeof referenceDate === 'string') {
      return dateOnlyToUtcMs(referenceDate);
    }

    const date = referenceDate instanceof Date ? referenceDate : new Date();

    if (Number.isNaN(date.getTime())) return null;

    return Date.UTC(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );
  }

  /**
   * Returns normalized deadline status without inventing missing dates.
   *
   * kind:
   * - future
   * - today
   * - expired
   * - rolling
   * - unspecified
   * - invalid
   */
  function getDeadlineStatus(deadline, referenceDate) {
    if (!deadline || typeof deadline !== 'object') {
      return {
        kind: 'unspecified',
        daysRemaining: null,
        isClosingSoon: false
      };
    }

    if (deadline.type === 'rolling') {
      return {
        kind: 'rolling',
        daysRemaining: null,
        isClosingSoon: false
      };
    }

    if (deadline.type === 'unspecified') {
      return {
        kind: 'unspecified',
        daysRemaining: null,
        isClosingSoon: false
      };
    }

    if (deadline.type !== 'fixed' || !deadline.date) {
      return {
        kind: 'invalid',
        daysRemaining: null,
        isClosingSoon: false
      };
    }

    const deadlineUtcMs = dateOnlyToUtcMs(deadline.date);
    const todayUtcMs = referenceDateToUtcMs(referenceDate);

    if (deadlineUtcMs === null || todayUtcMs === null) {
      return {
        kind: 'invalid',
        daysRemaining: null,
        isClosingSoon: false
      };
    }

    const daysRemaining = Math.round(
      (deadlineUtcMs - todayUtcMs) / DAY_MS
    );

    if (daysRemaining < 0) {
      return {
        kind: 'expired',
        daysRemaining,
        isClosingSoon: false
      };
    }

    if (daysRemaining === 0) {
      return {
        kind: 'today',
        daysRemaining: 0,
        isClosingSoon: true
      };
    }

    return {
      kind: 'future',
      daysRemaining,
      isClosingSoon:
        daysRemaining >= 0 &&
        daysRemaining <= CLOSING_SOON_DAYS
    };
  }

  const api = Object.freeze({
    CLOSING_SOON_DAYS,
    dateOnlyToUtcMs,
    getDeadlineStatus
  });

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }

  if (global) {
    global.DeadlineUtils = api;
  }
})(typeof window !== 'undefined' ? window : globalThis);
