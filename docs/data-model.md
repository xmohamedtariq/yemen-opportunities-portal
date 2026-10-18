# Yemen Opportunities Portal - Data Model & Validation Strategy

## 1. Overview & Architectural Principles

The **Yemen Opportunities Portal** is a bilingual, offline-first platform designed to provide Yemeni students and young people with access to manually verified educational and professional opportunities.

### Key Architectural Principles
- **Local JSON Storage**: All opportunity data resides in `data/opportunities.json`. No external database or backend server is required.
- **Zero External Dependencies**: The dataset validation tool (`scripts/validate-data.js`) runs strictly with vanilla Node.js built-in modules (`node:fs`, `node:path`, `node:process`).
- **No Data Scraping or AI Generation**: As defined in [AGENTS.md](../AGENTS.md), every opportunity record must be manually verified from official sources. Information must never be invented or guessed.
- **Offline & Mobile Readiness**: The single-file JSON catalog is cached via a Service Worker on initial load, enabling full search, filtering, and favorites functionality offline on screens as narrow as 360px without horizontal scroll.

---

## 2. Dataset Metadata & Structure

The root of `data/opportunities.json` is a JSON object containing dataset metadata and the opportunities collection:

```json
{
  "schemaVersion": "1.0.0",
  "lastUpdated": "2026-10-13",
  "opportunities": []
}
```

### Top-Level Metadata Fields
- **`schemaVersion`** (`string`, required): Semantic specification version. Must be `"1.0.0"`.
- **`lastUpdated`** (`string`, required): ISO 8601 calendar date (`YYYY-MM-DD`) when the dataset was last updated.
  - Must not be in the future relative to the validation reference date.
  - When opportunities exist, `lastUpdated` cannot be earlier than the newest `verificationDate` among all opportunities ($\text{lastUpdated} \ge \max(\text{verificationDate})$).
  - The project owner must update this date whenever records are added or modified.
- **`opportunities`** (`array`, required): The collection of opportunity records. Starts empty (`[]`) during initial project setup.

---

## 3. Opportunity Record Specification

| Field Name | Type | Requirement | Description & Rules |
| :--- | :--- | :--- | :--- |
| `id` | `string` | **Required** | Stable unique identifier in lowercase kebab-case (`^[a-z0-9]+(-[a-z0-9]+)*$`). Example: `yop-2026-001`. |
| `type` | `string` | **Required** | Controlled enum representing opportunity category. |
| `title` | `object` | **Required** | Bilingual title object containing `ar` (Arabic text) and `en` (English text). |
| `organization` | `object` | **Required** | Bilingual provider name containing `ar` (Arabic text) and `en` (English text). |
| `country` | `object` \| `null` | **Required (nullable)** | Physical host country (`code` + `name`) or `null` for global/international programs. |
| `categories` | `string[]` | **Required** | Non-empty array of controlled fields (minimum 1 item). Use `["general"]` for broad multidisciplinary programs. |
| `educationLevels` | `string[]` \| `null` | Optional / Nullable | Array of applicable levels or `null` if unstated in official announcement. |
| `deadline` | `object` | **Required** | Object with `type` (`"fixed"` \| `"rolling"` \| `"unspecified"`), `date` (`string` \| `null`), and optional `notes`. |
| `officialSourceUrl` | `string` | **Required** | Verified official announcement URL. Must strictly use HTTPS protocol. |
| `verificationDate` | `string` | **Required** | Calendar date (`YYYY-MM-DD`) on which the record was manually verified by the project owner. Must be $\le \text{today}$. |
| `fundingType` | `string` \| `null` | Optional / Nullable | Controlled enum or `null` if not specified in official source. |
| `deliveryMode` | `string` \| `null` | Optional / Nullable | Controlled enum (`"online"`, `"in-person"`, `"hybrid"`) or `null` if not specified. |
| `languages` | `string[]` \| `null` | Optional / Nullable | Array of ISO 639-1 language codes (e.g., `["ar"]`, `["en"]`) or `null` if unstated. |
| `applicationStatus` | `string` \| `null` | Optional / Nullable | Manually verified status (`"open"`, `"upcoming"`, `"closed"`, `"suspended"`) or `null` if unstated. |
| `shortDescription` | `object` \| `null` | Optional / Nullable | Bilingual concise summary (1-2 sentences) containing `ar` and `en`, or `null`. |
| `applicationUrl` | `string` \| `null` | Optional / Nullable | Direct HTTPS application link if distinct from official announcement, or `null`. |
| `eligibilityNote` | `object` \| `null` | Optional / Nullable | Bilingual summary of key verified constraints, or `null`. |

---

## 4. Controlled Vocabulary Dictionary

### 4.1. Opportunity Type (`type`)
- `scholarship` â€” Ù…Ù†Ø­Ø© Ø¯Ø±Ø§Ø³ÙŠØ© / Scholarship
- `internship` â€” ØªØ¯Ø±ÙŠØ¨ Ø¹Ù…Ù„ÙŠ / Internship
- `course` â€” Ø¯ÙˆØ±Ø© ØªØ¹Ù„ÙŠÙ…ÙŠØ© / Course
- `fellowship` â€” Ø²Ù…Ø§Ù„Ø© / Fellowship
- `training` â€” Ø¨Ø±Ù†Ø§Ù…Ø¬ ØªØ¯Ø±ÙŠØ¨ÙŠ / Training Program
- `competition` â€” Ù…Ø³Ø§Ø¨Ù‚Ø© / Competition
- `grant` â€” Ù…Ù†Ø­Ø© Ù…Ø§Ù„ÙŠØ© / Grant
- `exchange` â€” Ø¨Ø±Ù†Ø§Ù…Ø¬ ØªØ¨Ø§Ø¯Ù„ Ø«Ù‚Ø§ÙÙŠ Ø£Ùˆ Ø£ÙƒØ§Ø¯ÙŠÙ…ÙŠ / Exchange Program

### 4.2. Fields / Categories (`categories`)
- `technology` â€” ØªÙƒÙ†ÙˆÙ„ÙˆØ¬ÙŠØ§ Ø§Ù„Ù…Ø¹Ù„ÙˆÙ…Ø§Øª ÙˆØ§Ù„Ø¨Ø±Ù…Ø¬Ø© / Technology & IT
- `engineering` â€” Ø§Ù„Ù‡Ù†Ø¯Ø³Ø© ÙˆØ§Ù„Ø¹Ù„ÙˆÙ… Ø§Ù„ØªØ·Ø¨ÙŠÙ‚ÙŠØ© / Engineering
- `health` â€” Ø§Ù„Ø·Ø¨ ÙˆØ§Ù„Ø¹Ù„ÙˆÙ… Ø§Ù„ØµØ­ÙŠØ© / Medicine & Health
- `business` â€” Ø¥Ø¯Ø§Ø±Ø© Ø§Ù„Ø£Ø¹Ù…Ø§Ù„ ÙˆØ§Ù„Ø±ÙŠØ§Ø¯Ø© / Business & Management
- `humanities` â€” Ø§Ù„Ø¹Ù„ÙˆÙ… Ø§Ù„Ø¥Ù†Ø³Ø§Ù†ÙŠØ© ÙˆØ§Ù„Ø§Ø¬ØªÙ…Ø§Ø¹ÙŠØ© / Humanities & Social Sciences
- `education` â€” Ø§Ù„ØªØ¹Ù„ÙŠÙ… ÙˆØ§Ù„ØªØ¯Ø±ÙŠØ³ / Education & Teaching
- `arts` â€” Ø§Ù„ÙÙ†ÙˆÙ† ÙˆØ§Ù„Ø¥Ø¹Ù„Ø§Ù… ÙˆØ§Ù„ØªØµÙ…ÙŠÙ… / Arts & Design
- `general` â€” ØªØ®ØµØµØ§Øª Ø¹Ø§Ù…Ø© ÙˆÙ…ØªØ¹Ø¯Ø¯Ø© / General & Multidisciplinary

### 4.3. Education & Career Levels (`educationLevels`)
- `school` â€” Ø·Ù„Ø§Ø¨ Ø§Ù„Ù…Ø¯Ø§Ø±Ø³ / High School
- `bachelor` â€” Ø¨ÙƒØ§Ù„ÙˆØ±ÙŠÙˆØ³ / Undergraduate
- `master` â€” Ù…Ø§Ø¬Ø³ØªÙŠØ± / Master's
- `phd` â€” Ø¯ÙƒØªÙˆØ±Ø§Ù‡ / PhD
- `fresh-graduate` â€” Ø­Ø¯ÙŠØ«Ùˆ Ø§Ù„ØªØ®Ø±Ø¬ / Fresh Graduates
- `professional` â€” Ù…Ù…Ø§Ø±Ø³ÙˆÙ† ÙˆÙ…Ù‡Ù†ÙŠÙˆÙ† / Professionals
- `open-to-all` â€” Ù…ØªØ§Ø­ Ù„Ù„Ø¬Ù…ÙŠØ¹ / Open to All

### 4.4. Funding Types (`fundingType`)
- `fully-funded` â€” Ù…Ù…ÙˆÙ„Ø© Ø¨Ø§Ù„ÙƒØ§Ù…Ù„ / Fully Funded
- `partially-funded` â€” Ù…Ù…ÙˆÙ„Ø© Ø¬Ø²Ø¦ÙŠØ§Ù‹ / Partially Funded
- `free` â€” Ù…Ø¬Ø§Ù†ÙŠØ© Ø¨Ø§Ù„ÙƒØ§Ù…Ù„ / Free (no fees)
- `paid-stipend` â€” Ù…Ø¯ÙÙˆØ¹Ø© Ø§Ù„Ø£Ø¬Ø± / Paid (stipend provided)
- `self-funded` â€” Ø±Ø³ÙˆÙ… Ø°Ø§ØªÙŠØ© Ø£Ùˆ Ù…Ø®ÙØ¶Ø© / Self-funded

### 4.5. Delivery Modes (`deliveryMode`)
- `online` â€” Ø¹Ø¨Ø± Ø§Ù„Ø¥Ù†ØªØ±Ù†Øª / Online
- `in-person` â€” Ø­Ø¶ÙˆØ±ÙŠØ§Ù‹ / In-Person
- `hybrid` â€” Ù…Ø¯Ù…Ø¬ / Hybrid

### 4.6. Application Status (`applicationStatus`)
- `open` â€” Ù…ØªØ§Ø­ Ù„Ù„ØªÙ‚Ø¯ÙŠÙ… / Open
- `upcoming` â€” ÙŠÙØªØ­ Ù‚Ø±ÙŠØ¨Ø§Ù‹ / Upcoming
- `closed` â€” Ù…ØºÙ„Ù‚ / Closed
- `suspended` â€” Ù…Ø¹Ù„Ù‚ Ù…Ø¤Ù‚ØªØ§Ù‹ / Suspended

### 4.7. Deadline Types (`deadline.type`)
- `fixed` â€” Ù…ÙˆØ¹Ø¯ Ù…Ø­Ø¯Ø¯ Ø¨ØªÙ‚ÙˆÙŠÙ… Ø²Ù…Ù†ÙŠ / Fixed Calendar Date
- `rolling` â€” ØªÙ‚Ø¯ÙŠÙ… Ù…Ø³ØªÙ…Ø± Ø¹Ù„Ù‰ Ù…Ø¯Ø§Ø± Ø§Ù„Ø¹Ø§Ù… / Rolling Deadline
- `unspecified` â€” ØºÙŠØ± Ù…Ø­Ø¯Ø¯ ÙÙŠ Ø§Ù„Ù…ØµØ¯Ø± Ø§Ù„Ø±Ø³Ù…ÙŠ / Unspecified in Official Source

---

## 5. Geographic Model & ISO 3166-1 Policy

1. **Host Country**:
   When an opportunity has a specific geographic host country (e.g. Germany, Yemen, Saudi Arabia):
   ```json
   "country": {
     "code": "YE",
     "name": {
       "ar": "Ø§Ù„ÙŠÙ…Ù†",
       "en": "Yemen"
     }
   }
   ```
   The `code` must strictly match one of the 249 standard codes in the **ISO 3166-1 alpha-2 allowlist**.
2. **International / Global Programs**:
   When an opportunity has no single host country or is open globally, `country` is explicitly set to `null`:
   ```json
   "country": null
   ```
   Inventing fake country codes (such as `"ONLINE"` or `"ZZ"`) is strictly disallowed.
3. **Delivery Mode Separation**:
   Online participation is captured via `deliveryMode: "online"`, completely independent of geographic nationality.
4. **UI Behavior**:
   - `country !== null`: Renders the localized country name and ISO badge.
   - `country === null`: Renders "ÙØ±ØµØ© Ø¯ÙˆÙ„ÙŠØ© / Ø¹Ø§Ù…Ø©" (Arabic) / "International / Global" (English).

---

## 6. Deadline Policy & 14-Day "Closing Soon" Standard

### 6.1. Deadline Types
- **Fixed Deadline (`type: "fixed"`)**:
  - `date`: Valid calendar date string `YYYY-MM-DD`.
  - Computes exact days remaining: $\text{daysRemaining} = \lceil (\text{date} - \text{today}) / (24 \times 3600 \times 1000) \rceil$.
- **Rolling Deadline (`type: "rolling"`)**:
  - `date`: Strictly `null`. Displays "ØªÙ‚Ø¯ÙŠÙ… Ù…Ø³ØªÙ…Ø±" (Arabic) / "Rolling Deadline" (English).
- **Unspecified Deadline (`type: "unspecified"`)**:
  - `date`: Strictly `null`. Displays "ØºÙŠØ± Ù…Ø­Ø¯Ø¯ ÙÙŠ Ø§Ù„Ù…ØµØ¯Ø± Ø§Ù„Ø±Ø³Ù…ÙŠ" (Arabic) / "Not specified in official source" (English).

### 6.2. Standard 14-Day "Closing Soon" Rule
- **Threshold**: Exactly **14 days**.
- Defined centrally as `CLOSING_SOON_THRESHOLD_DAYS = 14`.
- **Badge Trigger**:
  $$\text{deadline.type} = \text{'fixed'} \quad \text{AND} \quad 0 \le \text{daysRemaining} \le 14$$
- Consistent across UI deadline badges, automated test assertions, documentation, and future weekly reports.

---

## 7. Verification Date & Freshness Policy

- Must be a valid calendar date `YYYY-MM-DD`.
- Must never be set to a future date relative to the reference date ($\text{verificationDate} \le \text{today}$).
- **90-Day Freshness Warning**:
  - If $\text{today} - \text{verificationDate} > 90 \text{ days}$, the validator outputs a non-fatal warning:
    `[WARNING] Verification date is older than 90 days. Manual re-verification recommended.`
  - The record remains structurally valid and the warning does not fail the validator exit code.

---

## 8. Runtime Effective Status Fallback Matrix

Official sources often omit an explicit "open" status while providing a deadline. The data owner must never guess `applicationStatus`. At runtime, the application evaluates the **effective display status** (`effectiveStatus`) via this deterministic fallback matrix:

| Recorded `applicationStatus` | `deadline.type` | Condition | Effective Status (`effectiveStatus`) | Localized UI Display (AR / EN) |
| :--- | :--- | :--- | :--- | :--- |
| Any | `fixed` | $\text{deadline.date} < \text{today}$ | `expired` | Ù…Ù†ØªÙ‡ÙŠØ© / Expired |
| `"closed"` | Any | Any | `closed` | Ù…ØºÙ„Ù‚ Ø±Ø³Ù…ÙŠØ§Ù‹ / Closed |
| `"suspended"` | Any | Any | `suspended` | Ù…Ø¹Ù„Ù‚ Ù…Ø¤Ù‚ØªØ§Ù‹ / Suspended |
| `"upcoming"` | Any | Any | `upcoming` | ÙŠÙØªØ­ Ù‚Ø±ÙŠØ¨Ø§Ù‹ / Upcoming |
| `"open"` | `fixed` | $0 \le \text{daysRemaining} \le 14$ | `closing-soon` | ÙŠÙ†ØªÙ‡ÙŠ Ù‚Ø±ÙŠØ¨Ø§Ù‹ / Closing Soon |
| `"open"` | `fixed` | $\text{daysRemaining} > 14$ | `open` | Ù…ØªØ§Ø­ Ù„Ù„ØªÙ‚Ø¯ÙŠÙ… / Open |
| `"open"` | `rolling` | `date === null` | `open` | ØªÙ‚Ø¯ÙŠÙ… Ù…Ø³ØªÙ…Ø± / Rolling (Open) |
| `"open"` | `unspecified` | `date === null` | `open` | Ù…ØªØ§Ø­ Ù„Ù„ØªÙ‚Ø¯ÙŠÙ… / Open |
| `null` | `fixed` | $0 \le \text{daysRemaining} \le 14$ | `closing-soon` | ÙŠÙ†ØªÙ‡ÙŠ Ù‚Ø±ÙŠØ¨Ø§Ù‹ / Closing Soon |
| `null` | `fixed` | $\text{daysRemaining} > 14$ | `active` | Ù…ØªØ§Ø­ Ø­ØªÙ‰ Ø§Ù„Ù…ÙˆØ¹Ø¯ / Active until deadline |
| `null` | `rolling` | `date === null` | `rolling` | ØªÙ‚Ø¯ÙŠÙ… Ù…Ø³ØªÙ…Ø± / Rolling Application |
| `null` | `unspecified` | `date === null` | `check-source` | Ù…Ø±Ø§Ø¬Ø¹Ø© Ø§Ù„Ù…ØµØ¯Ø± Ø§Ù„Ø±Ø³Ù…ÙŠ / Check Official Source |

---

## 9. Dataset Validation Engine (`scripts/validate-data.js`)

The validator script enforces data integrity with zero external dependencies.

### Command-Line Usage

1. **Development Validation (Allows empty dataset)**:
   ```bash
   node scripts/validate-data.js data/opportunities.json
   ```
   Returns exit code `0` when empty or valid.

2. **Final Production Readiness Check (Enforces $\ge 50$ records)**:
   ```bash
   node scripts/validate-data.js data/opportunities.json --final
   # OR
   node scripts/validate-data.js data/opportunities.json --min-records=50
   ```
   Fails with exit code `1` if fewer than 50 records exist.

3. **Deterministic Date Override (For testing and reproducibility)**:
   ```bash
   node scripts/validate-data.js tests/fixtures/valid-opportunity.json --today=2026-10-13
   ```
   Allows reproducible evaluation of future verification dates, freshness warnings, and deadline boundaries.

---

## 10. Manual Data-Entry Quality Workflow (Checklist)

Before adding any of the 50 production opportunities to `data/opportunities.json`, the project owner must verify and check each item:

```markdown
### Opportunity Entry Checklist
1. [ ] Information was copied directly from an official source (no aggregators or third-party blogs).
2. [ ] officialSourceUrl is verified, live, and uses strict HTTPS.
3. [ ] applicationUrl is verified and uses HTTPS (or set to null if not distinct from announcement).
4. [ ] Deadline is copied exactly from the official announcement (never guessed).
       Use type: "rolling" or type: "unspecified" if no calendar date is stated.
5. [ ] Arabic and English titles are checked for accuracy, proper grammar, and correct script.
6. [ ] country contains a valid ISO 3166-1 alpha-2 code if hosted in a specific country, or null if international/global.
7. [ ] Controlled fields without official data (e.g., fundingType, deliveryMode, languages) are left as null (never inferred).
8. [ ] applicationStatus is recorded only if explicitly stated by the provider; otherwise set to null.
9. [ ] verificationDate is recorded as the exact date of manual review (YYYY-MM-DD).
10. [ ] Eligibility summary claims only conditions explicitly stated in the official announcement.
11. [ ] Top-level lastUpdated in data/opportunities.json is updated to the date of modification.
```
