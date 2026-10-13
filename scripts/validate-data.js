#!/usr/bin/env node

/**
 * Yemen Opportunities Portal - Data Validator
 *
 * Standalone zero-dependency validator for the local opportunities dataset.
 * Enforces project rules, data integrity, ISO country codes, HTTPS URLs,
 * and date policies defined in AGENTS.md and docs/data-model.md.
 */

const fs = require('node:fs');
const path = require('node:path');
const process = require('node:process');

// Centralized Constants
const CLOSING_SOON_THRESHOLD_DAYS = 14;
const FRESHNESS_WARNING_THRESHOLD_DAYS = 90;
const EXPECTED_SCHEMA_VERSION = '1.0.0';

// Complete official ISO 3166-1 alpha-2 allowlist (249 standard codes)
const ISO_3166_1_ALPHA_2 = new Set([
  'AD', 'AE', 'AF', 'AG', 'AI', 'AL', 'AM', 'AO', 'AQ', 'AR', 'AS', 'AT', 'AU', 'AW', 'AX', 'AZ',
  'BA', 'BB', 'BD', 'BE', 'BF', 'BG', 'BH', 'BI', 'BJ', 'BL', 'BM', 'BN', 'BO', 'BQ', 'BR', 'BS',
  'BT', 'BV', 'BW', 'BY', 'BZ', 'CA', 'CC', 'CD', 'CF', 'CG', 'CH', 'CI', 'CK', 'CL', 'CM', 'CN',
  'CO', 'CR', 'CU', 'CV', 'CW', 'CX', 'CY', 'CZ', 'DE', 'DJ', 'DK', 'DM', 'DO', 'DZ', 'EC', 'EE',
  'EG', 'EH', 'ER', 'ES', 'ET', 'FI', 'FJ', 'FK', 'FM', 'FO', 'FR', 'GA', 'GB', 'GD', 'GE', 'GF',
  'GG', 'GH', 'GI', 'GL', 'GM', 'GN', 'GP', 'GQ', 'GR', 'GS', 'GT', 'GU', 'GW', 'GY', 'HK', 'HM',
  'HN', 'HR', 'HT', 'HU', 'ID', 'IE', 'IL', 'IM', 'IN', 'IO', 'IQ', 'IR', 'IS', 'IT', 'JE', 'JM',
  'JO', 'JP', 'KE', 'KG', 'KH', 'KI', 'KM', 'KN', 'KP', 'KR', 'KW', 'KY', 'KZ', 'LA', 'LB', 'LC',
  'LI', 'LK', 'LR', 'LS', 'LT', 'LU', 'LV', 'LY', 'MA', 'MC', 'MD', 'ME', 'MF', 'MG', 'MH', 'MK',
  'ML', 'MM', 'MN', 'MO', 'MP', 'MQ', 'MR', 'MS', 'MT', 'MU', 'MV', 'MW', 'MX', 'MY', 'MZ', 'NA',
  'NC', 'NE', 'NF', 'NG', 'NI', 'NL', 'NO', 'NP', 'NR', 'NU', 'NZ', 'OM', 'PA', 'PE', 'PF', 'PG',
  'PH', 'PK', 'PL', 'PM', 'PN', 'PR', 'PS', 'PT', 'PW', 'PY', 'QA', 'RE', 'RO', 'RS', 'RU', 'RW',
  'SA', 'SB', 'SC', 'SD', 'SE', 'SG', 'SH', 'SI', 'SJ', 'SK', 'SL', 'SM', 'SN', 'SO', 'SR', 'SS',
  'ST', 'SV', 'SX', 'SY', 'SZ', 'TC', 'TD', 'TF', 'TG', 'TH', 'TJ', 'TK', 'TL', 'TM', 'TN', 'TO',
  'TR', 'TT', 'TV', 'TW', 'TZ', 'UA', 'UG', 'UM', 'US', 'UY', 'UZ', 'VA', 'VC', 'VE', 'VG', 'VI',
  'VN', 'VU', 'WF', 'WS', 'YE', 'YT', 'ZA', 'ZM', 'ZW'
]);

// Controlled Vocabulary Sets
const CONTROLLED_TYPES = new Set([
  'scholarship',
  'internship',
  'course',
  'fellowship',
  'training',
  'competition',
  'grant',
  'exchange'
]);

const CONTROLLED_CATEGORIES = new Set([
  'technology',
  'engineering',
  'health',
  'business',
  'humanities',
  'education',
  'arts',
  'general'
]);

const CONTROLLED_EDUCATION_LEVELS = new Set([
  'school',
  'bachelor',
  'master',
  'phd',
  'fresh-graduate',
  'professional',
  'open-to-all'
]);

const CONTROLLED_FUNDING_TYPES = new Set([
  'fully-funded',
  'partially-funded',
  'free',
  'paid-stipend',
  'self-funded'
]);

const CONTROLLED_DELIVERY_MODES = new Set([
  'online',
  'in-person',
  'hybrid'
]);

const CONTROLLED_APPLICATION_STATUSES = new Set([
  'open',
  'upcoming',
  'closed',
  'suspended'
]);

const CONTROLLED_DEADLINE_TYPES = new Set([
  'fixed',
  'rolling',
  'unspecified'
]);

// Helper Functions
function isValidCalendarDate(dateStr) {
  if (typeof dateStr !== 'string') return false;
  if (!/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.test(dateStr)) return false;
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year &&
         date.getUTCMonth() === month - 1 &&
         date.getUTCDate() === day;
}

function parseUtcDate(dateStr) {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function daysDiff(d1, d2) {
  // Calendar days difference: d1 - d2
  return Math.round((d1.getTime() - d2.getTime()) / (1000 * 60 * 60 * 24));
}

function isValidHttpsUrl(urlString) {
  if (typeof urlString !== 'string') return false;
  try {
    const parsed = new URL(urlString);
    return parsed.protocol === 'https:' && parsed.hostname.length > 0;
  } catch {
    return false;
  }
}

function containsArabic(str) {
  return typeof str === 'string' && /[\u0600-\u06FF]/.test(str);
}

function containsLatin(str) {
  return typeof str === 'string' && /[A-Za-z]/.test(str);
}

function parseCommandLineArgs(argv) {
  const args = argv.slice(2);
  let targetFile = null;
  let minRecords = 0;
  let todayOverride = null;

  for (const arg of args) {
    if (arg === '--final') {
      minRecords = 50;
    } else if (arg.startsWith('--min-records=')) {
      const parsedMin = parseInt(arg.split('=')[1], 10);
      if (isNaN(parsedMin) || parsedMin < 0) {
        console.error(`Error: Invalid value for --min-records: '${arg}'`);
        process.exit(1);
      }
      minRecords = parsedMin;
    } else if (arg.startsWith('--today=')) {
      const dateVal = arg.split('=')[1];
      if (!isValidCalendarDate(dateVal)) {
        console.error(`Error: Invalid date format for --today: '${dateVal}'. Must be YYYY-MM-DD.`);
        process.exit(1);
      }
      todayOverride = dateVal;
    } else if (!arg.startsWith('--') && !targetFile) {
      targetFile = arg;
    } else {
      console.error(`Error: Unrecognized argument: '${arg}'`);
      process.exit(1);
    }
  }

  if (!targetFile) {
    targetFile = 'data/opportunities.json';
  }

  return { targetFile, minRecords, todayOverride };
}

function validateDataset(data, options) {
  const errors = [];
  const warnings = [];
  const todayUtc = parseUtcDate(options.todayStr);

  // 1. Top-Level Object Validation
  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    errors.push('Root structure must be a JSON object.');
    return { errors, warnings };
  }

  // 1.1. schemaVersion
  if (typeof data.schemaVersion !== 'string' || data.schemaVersion.trim() === '') {
    errors.push("Top-level 'schemaVersion' is required and must be a non-empty string.");
  } else if (data.schemaVersion !== EXPECTED_SCHEMA_VERSION) {
    errors.push(`Top-level 'schemaVersion' must be '${EXPECTED_SCHEMA_VERSION}', got '${data.schemaVersion}'.`);
  }

  // 1.2. lastUpdated
  let lastUpdatedDate = null;
  if (!data.lastUpdated) {
    errors.push("Top-level 'lastUpdated' is required.");
  } else if (!isValidCalendarDate(data.lastUpdated)) {
    errors.push(`Top-level 'lastUpdated' ('${data.lastUpdated}') is not a valid YYYY-MM-DD calendar date.`);
  } else {
    lastUpdatedDate = parseUtcDate(data.lastUpdated);
    if (lastUpdatedDate > todayUtc) {
      errors.push(`Top-level 'lastUpdated' (${data.lastUpdated}) cannot be in the future (reference today: ${options.todayStr}).`);
    }
  }

  // 1.3. opportunities array
  if (!Array.isArray(data.opportunities)) {
    errors.push("Top-level 'opportunities' must be an array.");
    return { errors, warnings };
  }

  const opportunities = data.opportunities;

  // 2. Minimum Records / Final Readiness Check
  if (options.minRecords > 0 && opportunities.length < options.minRecords) {
    errors.push(
      `Readiness check failed: expected at least ${options.minRecords} records, found ${opportunities.length}.`
    );
  }

  // Track IDs for uniqueness
  const seenIds = new Map();
  let latestVerificationDateStr = null;
  let latestVerificationDateObj = null;

  // 3. Record-Level Validation
  opportunities.forEach((item, index) => {
    const recordLabel = `Record [${index}]`;

    if (typeof item !== 'object' || item === null || Array.isArray(item)) {
      errors.push(`${recordLabel}: Must be a JSON object.`);
      return;
    }

    const itemLabel = item.id ? `${recordLabel} (ID: '${item.id}')` : recordLabel;

    // 3.1. id
    if (typeof item.id !== 'string' || item.id.trim() === '') {
      errors.push(`${itemLabel}: Field 'id' is required and must be a non-empty string.`);
    } else {
      if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(item.id)) {
        errors.push(`${itemLabel}: ID '${item.id}' is invalid. Must be lowercase kebab-case (e.g., 'yop-2026-001').`);
      }
      if (seenIds.has(item.id)) {
        errors.push(`${itemLabel}: Duplicate ID '${item.id}' previously defined in Record [${seenIds.get(item.id)}].`);
      } else {
        seenIds.set(item.id, index);
      }
    }

    // 3.2. type
    if (typeof item.type !== 'string' || !CONTROLLED_TYPES.has(item.type)) {
      errors.push(`${itemLabel}: Field 'type' ('${item.type}') must be one of: [${Array.from(CONTROLLED_TYPES).join(', ')}].`);
    }

    // 3.3. title (bilingual)
    if (!item.title || typeof item.title !== 'object') {
      errors.push(`${itemLabel}: Field 'title' is required and must be an object with 'ar' and 'en'.`);
    } else {
      if (typeof item.title.ar !== 'string' || item.title.ar.trim() === '') {
        errors.push(`${itemLabel}: Field 'title.ar' is required and must be non-empty.`);
      } else if (!containsArabic(item.title.ar)) {
        errors.push(`${itemLabel}: Field 'title.ar' must contain Arabic text.`);
      }

      if (typeof item.title.en !== 'string' || item.title.en.trim() === '') {
        errors.push(`${itemLabel}: Field 'title.en' is required and must be non-empty.`);
      } else if (!containsLatin(item.title.en)) {
        errors.push(`${itemLabel}: Field 'title.en' must contain English text.`);
      }
    }

    // 3.4. organization (bilingual)
    if (!item.organization || typeof item.organization !== 'object') {
      errors.push(`${itemLabel}: Field 'organization' is required and must be an object with 'ar' and 'en'.`);
    } else {
      if (typeof item.organization.ar !== 'string' || item.organization.ar.trim() === '') {
        errors.push(`${itemLabel}: Field 'organization.ar' is required and must be non-empty.`);
      }
      if (typeof item.organization.en !== 'string' || item.organization.en.trim() === '') {
        errors.push(`${itemLabel}: Field 'organization.en' is required and must be non-empty.`);
      }
    }

    // 3.5. country
    if (item.country !== null) {
      if (typeof item.country !== 'object' || Array.isArray(item.country)) {
        errors.push(`${itemLabel}: Field 'country' must be an object with 'code' and 'name', or null for global/international programs.`);
      } else {
        if (typeof item.country.code !== 'string' || !ISO_3166_1_ALPHA_2.has(item.country.code)) {
          errors.push(`${itemLabel}: Country code '${item.country.code}' is not a valid ISO 3166-1 alpha-2 code.`);
        }
        if (!item.country.name || typeof item.country.name !== 'object') {
          errors.push(`${itemLabel}: Field 'country.name' must be an object with 'ar' and 'en'.`);
        } else {
          if (typeof item.country.name.ar !== 'string' || item.country.name.ar.trim() === '') {
            errors.push(`${itemLabel}: Field 'country.name.ar' must be non-empty.`);
          }
          if (typeof item.country.name.en !== 'string' || item.country.name.en.trim() === '') {
            errors.push(`${itemLabel}: Field 'country.name.en' must be non-empty.`);
          }
        }
      }
    }

    // 3.6. categories (multi-category)
    if (!Array.isArray(item.categories) || item.categories.length === 0) {
      errors.push(`${itemLabel}: Field 'categories' must be a non-empty array with at least one category.`);
    } else {
      const seenCategories = new Set();
      item.categories.forEach(cat => {
        if (!CONTROLLED_CATEGORIES.has(cat)) {
          errors.push(`${itemLabel}: Category '${cat}' is not in controlled list: [${Array.from(CONTROLLED_CATEGORIES).join(', ')}].`);
        }
        if (seenCategories.has(cat)) {
          errors.push(`${itemLabel}: Duplicate category '${cat}' in categories list.`);
        }
        seenCategories.add(cat);
      });
    }

    // 3.7. educationLevels (optional/nullable array)
    if (item.educationLevels !== null && item.educationLevels !== undefined) {
      if (!Array.isArray(item.educationLevels)) {
        errors.push(`${itemLabel}: Field 'educationLevels' must be an array or null.`);
      } else {
        const seenLevels = new Set();
        item.educationLevels.forEach(lvl => {
          if (!CONTROLLED_EDUCATION_LEVELS.has(lvl)) {
            errors.push(`${itemLabel}: Education level '${lvl}' is not in controlled list: [${Array.from(CONTROLLED_EDUCATION_LEVELS).join(', ')}].`);
          }
          if (seenLevels.has(lvl)) {
            errors.push(`${itemLabel}: Duplicate education level '${lvl}'.`);
          }
          seenLevels.add(lvl);
        });
      }
    }

    // 3.8. fundingType (optional/nullable)
    if (item.fundingType !== null && item.fundingType !== undefined) {
      if (!CONTROLLED_FUNDING_TYPES.has(item.fundingType)) {
        errors.push(`${itemLabel}: Funding type '${item.fundingType}' must be one of: [${Array.from(CONTROLLED_FUNDING_TYPES).join(', ')}] or null.`);
      }
    }

    // 3.9. deliveryMode (optional/nullable)
    if (item.deliveryMode !== null && item.deliveryMode !== undefined) {
      if (!CONTROLLED_DELIVERY_MODES.has(item.deliveryMode)) {
        errors.push(`${itemLabel}: Delivery mode '${item.deliveryMode}' must be one of: [${Array.from(CONTROLLED_DELIVERY_MODES).join(', ')}] or null.`);
      }
    }

    // 3.10. languages (optional/nullable array)
    if (item.languages !== null && item.languages !== undefined) {
      if (!Array.isArray(item.languages)) {
        errors.push(`${itemLabel}: Field 'languages' must be an array of ISO 639-1 language codes or null.`);
      } else {
        item.languages.forEach(lang => {
          if (typeof lang !== 'string' || !/^[a-z]{2}$/.test(lang)) {
            errors.push(`${itemLabel}: Language code '${lang}' must be a 2-letter lowercase code (e.g. 'ar', 'en').`);
          }
        });
      }
    }

    // 3.11. applicationStatus (optional/nullable)
    if (item.applicationStatus !== null && item.applicationStatus !== undefined) {
      if (!CONTROLLED_APPLICATION_STATUSES.has(item.applicationStatus)) {
        errors.push(`${itemLabel}: Field 'applicationStatus' ('${item.applicationStatus}') must be one of: [${Array.from(CONTROLLED_APPLICATION_STATUSES).join(', ')}] or null.`);
      }
    }

    // 3.12. deadline
    let deadlineDateObj = null;
    if (!item.deadline || typeof item.deadline !== 'object') {
      errors.push(`${itemLabel}: Field 'deadline' is required and must be an object.`);
    } else {
      if (!CONTROLLED_DEADLINE_TYPES.has(item.deadline.type)) {
        errors.push(`${itemLabel}: Deadline type '${item.deadline.type}' must be one of: [${Array.from(CONTROLLED_DEADLINE_TYPES).join(', ')}].`);
      }

      if (item.deadline.type === 'fixed') {
        if (!item.deadline.date) {
          errors.push(`${itemLabel}: Fixed deadline must include a valid 'date' string (YYYY-MM-DD).`);
        } else if (!isValidCalendarDate(item.deadline.date)) {
          errors.push(`${itemLabel}: Deadline date '${item.deadline.date}' is not a valid YYYY-MM-DD calendar date.`);
        } else {
          deadlineDateObj = parseUtcDate(item.deadline.date);
        }
      } else {
        // rolling or unspecified
        if (item.deadline.date !== null && item.deadline.date !== undefined) {
          errors.push(`${itemLabel}: Deadline date must be strictly null when deadline type is '${item.deadline.type}'.`);
        }
      }

      if (item.deadline.notes !== null && item.deadline.notes !== undefined) {
        if (typeof item.deadline.notes !== 'object' || Array.isArray(item.deadline.notes)) {
          errors.push(`${itemLabel}: Deadline 'notes' must be an object with 'ar' and 'en', or null.`);
        }
      }
    }

    // 3.13. shortDescription (optional/nullable)
    if (item.shortDescription !== null && item.shortDescription !== undefined) {
      if (typeof item.shortDescription !== 'object' || Array.isArray(item.shortDescription)) {
        errors.push(`${itemLabel}: Field 'shortDescription' must be an object with 'ar' and 'en', or null.`);
      } else {
        if (typeof item.shortDescription.ar !== 'string' || item.shortDescription.ar.trim() === '') {
          errors.push(`${itemLabel}: Field 'shortDescription.ar' must be a non-empty string.`);
        }
        if (typeof item.shortDescription.en !== 'string' || item.shortDescription.en.trim() === '') {
          errors.push(`${itemLabel}: Field 'shortDescription.en' must be a non-empty string.`);
        }
      }
    }

    // 3.14. eligibilityNote (optional/nullable)
    if (item.eligibilityNote !== null && item.eligibilityNote !== undefined) {
      if (typeof item.eligibilityNote !== 'object' || Array.isArray(item.eligibilityNote)) {
        errors.push(`${itemLabel}: Field 'eligibilityNote' must be an object with 'ar' and 'en', or null.`);
      } else {
        if (typeof item.eligibilityNote.ar !== 'string' || item.eligibilityNote.ar.trim() === '') {
          errors.push(`${itemLabel}: Field 'eligibilityNote.ar' must be a non-empty string.`);
        }
        if (typeof item.eligibilityNote.en !== 'string' || item.eligibilityNote.en.trim() === '') {
          errors.push(`${itemLabel}: Field 'eligibilityNote.en' must be a non-empty string.`);
        }
      }
    }

    // 3.15. officialSourceUrl
    if (!item.officialSourceUrl) {
      errors.push(`${itemLabel}: Field 'officialSourceUrl' is required.`);
    } else if (!isValidHttpsUrl(item.officialSourceUrl)) {
      errors.push(`${itemLabel}: Field 'officialSourceUrl' ('${item.officialSourceUrl}') must be a valid HTTPS URL.`);
    }

    // 3.16. applicationUrl (optional/nullable)
    if (item.applicationUrl !== null && item.applicationUrl !== undefined) {
      if (!isValidHttpsUrl(item.applicationUrl)) {
        errors.push(`${itemLabel}: Field 'applicationUrl' ('${item.applicationUrl}') must be a valid HTTPS URL or null.`);
      }
    }

    // 3.17. verificationDate
    let verificationDateObj = null;
    if (!item.verificationDate) {
      errors.push(`${itemLabel}: Field 'verificationDate' is required.`);
    } else if (!isValidCalendarDate(item.verificationDate)) {
      errors.push(`${itemLabel}: Field 'verificationDate' ('${item.verificationDate}') is not a valid YYYY-MM-DD calendar date.`);
    } else {
      verificationDateObj = parseUtcDate(item.verificationDate);
      if (verificationDateObj > todayUtc) {
        errors.push(`${itemLabel}: Verification date (${item.verificationDate}) cannot be in the future (reference today: ${options.todayStr}).`);
      } else {
        // Track newest verification date
        if (!latestVerificationDateObj || verificationDateObj > latestVerificationDateObj) {
          latestVerificationDateObj = verificationDateObj;
          latestVerificationDateStr = item.verificationDate;
        }

        // Freshness warning (> 90 days)
        const ageInDays = daysDiff(todayUtc, verificationDateObj);
        if (ageInDays > FRESHNESS_WARNING_THRESHOLD_DAYS) {
          warnings.push(
            `${itemLabel}: Verification date (${item.verificationDate}) is ${ageInDays} days old (> ${FRESHNESS_WARNING_THRESHOLD_DAYS} days). Manual re-verification recommended.`
          );
        }
      }
    }

    // 4. Logical Consistency Checks (Warnings)
    if (item.applicationStatus === 'open' && deadlineDateObj) {
      if (deadlineDateObj < todayUtc) {
        warnings.push(
          `${itemLabel}: Contradictory status: recorded applicationStatus is 'open', but fixed deadline (${item.deadline.date}) has already passed relative to ${options.todayStr}.`
        );
      }
    }
  });

  // 5. Relationship between dataset lastUpdated and newest verificationDate
  if (lastUpdatedDate && latestVerificationDateObj && lastUpdatedDate < latestVerificationDateObj) {
    errors.push(
      `Top-level 'lastUpdated' (${data.lastUpdated}) cannot be earlier than the newest opportunity verificationDate (${latestVerificationDateStr}).`
    );
  }

  return { errors, warnings };
}

function run() {
  const { targetFile, minRecords, todayOverride } = parseCommandLineArgs(process.argv);
  const resolvedPath = path.resolve(process.cwd(), targetFile);

  const realTodayStr = new Date().toISOString().slice(0, 10);
  const todayStr = todayOverride || realTodayStr;

  console.log(`\n==================================================`);
  console.log(`Yemen Opportunities Portal - Dataset Validator`);
  console.log(`Target:    ${targetFile}`);
  console.log(`Reference: ${todayStr}${todayOverride ? ' (explicit override)' : ' (current date)'}`);
  if (minRecords > 0) {
    console.log(`Readiness: Minimum ${minRecords} records required (--final / --min-records)`);
  }
  console.log(`==================================================\n`);

  if (!fs.existsSync(resolvedPath)) {
    console.error(`✖ File not found: ${resolvedPath}\n`);
    process.exit(1);
  }

  let content;
  try {
    content = fs.readFileSync(resolvedPath, 'utf8');
  } catch (err) {
    console.error(`✖ Unable to read file: ${err.message}\n`);
    process.exit(1);
  }

  let data;
  try {
    data = JSON.parse(content);
  } catch (err) {
    console.error(`✖ Malformed JSON syntax in ${targetFile}:`);
    console.error(`  ${err.message}\n`);
    process.exit(1);
  }

  const { errors, warnings } = validateDataset(data, {
    minRecords,
    todayStr
  });

  // Print Warnings
  if (warnings.length > 0) {
    console.warn(`⚠ Warnings (${warnings.length}):`);
    warnings.forEach((warn, i) => {
      console.warn(`  [${i + 1}] ${warn}`);
    });
    console.warn('');
  }

  // Print Errors
  if (errors.length > 0) {
    console.error(`✖ Validation Errors (${errors.length}):`);
    errors.forEach((err, i) => {
      console.error(`  [${i + 1}] ${err}`);
    });
    console.error(`\nValidation FAILED with ${errors.length} error(s).\n`);
    process.exit(1);
  }

  const recordCount = Array.isArray(data.opportunities) ? data.opportunities.length : 0;
  console.log(`✔ Validation PASSED: ${recordCount} record(s) checked successfully with 0 structural errors.`);
  if (warnings.length > 0) {
    console.log(`  (Note: ${warnings.length} non-fatal warning(s) reported above.)`);
  }
  console.log('');
  process.exit(0);
}

run();
