'use strict';

const fs = require('fs');
const path = require('path');

const DAY_MS = 24 * 60 * 60 * 1000;
const DATA_PATH = path.resolve(__dirname, '..', 'data', 'opportunities.json');

function parseDateOnly(value) {
  if (typeof value !== 'string') return null;

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return date;
}

function daysBetween(fromDate, toDate) {
  return Math.floor((toDate.getTime() - fromDate.getTime()) / DAY_MS);
}

function localTodayString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function resolveToday(args) {
  const item = args.find((arg) => arg.startsWith('--today='));
  const value = item ? item.slice('--today='.length) : localTodayString();

  if (!parseDateOnly(value)) {
    throw new Error(`Invalid --today date: ${value}. Expected YYYY-MM-DD.`);
  }

  return value;
}

function displayTitle(record) {
  const title = record && record.title;

  if (typeof title === 'string' && title.trim()) {
    return title.trim();
  }

  if (title && typeof title === 'object') {
    const ar = typeof title.ar === 'string' ? title.ar.trim() : '';
    const en = typeof title.en === 'string' ? title.en.trim() : '';

    if (ar && en) return `${ar} / ${en}`;
    if (ar) return ar;
    if (en) return en;
  }

  return '(untitled opportunity)';
}

function analyze(data, todayString) {
  if (!data || !Array.isArray(data.opportunities)) {
    throw new Error('Invalid opportunity dataset.');
  }

  const today = parseDateOnly(todayString);
  if (!today) {
    throw new Error('Invalid reference date.');
  }

  const closingSoon = [];
  const staleVerification = [];

  for (const record of data.opportunities) {
    const deadline = record && record.deadline;

    if (
      deadline &&
      deadline.type === 'fixed' &&
      typeof deadline.date === "string"
    ) {
      const deadlineDate = parseDateOnly(deadline.date);

      if (deadlineDate) {
        const daysRemaining = daysBetween(today, deadlineDate);

        if (daysRemaining >= 0 && daysRemaining <= 14) {
          closingSoon.push({
            id: record.id,
            title: displayTitle(record),
            deadline: deadline.date,
            daysRemaining
          });
        }
      }
    }

    const verificationDate = parseDateOnly(record.verificationDate);

    if (verificationDate) {
      const verificationAgeDays = daysBetween(verificationDate, today);

      if (verificationAgeDays > 90) {
        staleVerification.push({
          id: record.id,
          title: displayTitle(record),
          verificationDate: record.verificationDate,
          verificationAgeDays
        });
      }
    }
  }

  closingSoon.sort((a, b) => {
    if (a.deadline !== b.deadline) {
      return a.deadline.localeCompare(b.deadline);
    }
    return String(a.id).localeCompare(String(b.id));
  });

  staleVerification.sort((a, b) => {
    if (a.verificationDate !== b.verificationDate) {
      return a.verificationDate.localeCompare(b.verificationDate);
    }
    return String(a.id).localeCompare(String(b.id));
  });

  return {
    referenceDate: todayString,
    recordsChecked: data.opportunities.length,
    closingSoon,
    staleVerification
  };
}

function formatReport(result) {
  const lines = [];

  lines.push('==================================================');
  lines.push('Yemen Opportunities Portal - Weekly Read-Only Report');
  lines.push('==================================================');
  lines.push(`Reference date: ${result.referenceDate}`);
  lines.push(`Production records checked: ${result.recordsChecked}`);
  lines.push('');

  lines.push(`Closing Within 14 Days (${result.closingSoon.length})`);
  lines.push('--------------------------------------------------');

  if (result.closingSoon.length === 0) {
    lines.push('No fixed deadlines are closing within the next 14 days.');
  } else {
    for (const item of result.closingSoon) {
      lines.push(
        `- ${item.id} | ${item.title} | deadline ${item.deadline} | ${item.daysRemaining} day(s) remaining`
      );
    }
  }

  lines.push('');
  lines.push(`Verification Older Than 90 Days (${result.staleVerification.length})`);
  lines.push('--------------------------------------------------');

  if (result.staleVerification.length === 0) {
    lines.push('No records are older than 90 days since verification.');
  } else {
    for (const item of result.staleVerification) {
      lines.push(
        `- ${item.id} | ${item.title} | verified ${item.verificationDate} | age ${item.verificationAgeDays} day(s)`
      );
    }
  }

  lines.push('');
  lines.push('Summary');
  lines.push('--------------------------------------------------');
  lines.push(`Closing within 14 days: ${result.closingSoon.length}`);
  lines.push(`Verification older than 90 days: ${result.staleVerification.length}`);
  lines.push('Read-only report: no production records were modified.');

  return lines.join('\n');
}

function loadProductionData() {
  return JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
}

function main() {
  try {
    const today = resolveToday(process.argv.slice(2));
    const data = loadProductionData();
    const result = analyze(data, today);
    console.log(formatReport(result));
  } catch (error) {
    console.error(`Weekly report failed: ${error.message}`);
    process.exitCode = 1;
  }
}

module.exports = {
  parseDateOnly,
  daysBetween,
  resolveToday,
  analyze,
  formatReport
};

if (require.main === module) {
  main();
}
