# Phase 4 â€” 50 Opportunity Source Verification Evidence

**Verification date:** 2026-10-13
**Production target:** 50 real opportunities
**Source policy:** Official HTTPS sources only; unsupported optional data remains `null` or `unspecified`.
**Owner workflow:** Project owner confirmed review of the research pack on 2026-10-13; assistant independently re-checked the official-source set before production preparation.

## Audit result

- Records prepared: **50**
- Unique IDs: **50**
- Preflight structural errors: **0**
- Preflight consistency warnings: **0**
- All production `officialSourceUrl` values use HTTPS.
- Final confirmation still uses the repository validator: `node scripts/validate-data.js data/opportunities.json --final --today=2026-10-13`.

## Corrections made during independent re-check

1. **GrEnFIn:** confirmed the 2027â€“2028 deadline as 7 January 2027; applications open 14 October 2026, so status remains `upcoming` on the 13 October verification date.
2. **ITCILO Financial Education:** added Arabic to the language array. `Filipino` is shown by the official page but is not encoded because the current schema accepts ISO 639-1 codes only and Filipino has no ISO 639-1 code.
3. **UNITAR Conflict Analysis:** replaced the localized product URL with the clean official full-catalog URL.
4. **UNITAR Restoring Governance of Natural Resources:** replaced the Spanish print URL with the clean official full-catalog URL.
5. **UNITAR Milestones in UN Peacekeeping:** replaced the Chinese localized URL with the clean official full-catalog URL.
6. **NOHA:** retained the 2027â€“2029 scholarship title because the official page explicitly states the 2027â€“2029 intake is open and gives the Erasmus Mundus grant deadline as 15 December 2026; the page also contains an inconsistent older cohort label elsewhere, so the production record relies only on the explicit current-intake statement and deadline.

## Distribution

- course: 22
- fellowship: 1
- internship: 9
- scholarship: 15
- training: 3

## Record ledger

| # | ID | Opportunity | Type | Deadline | Status | Official source |
|---:|---|---|---|---|---|---|
| 1 | `yop-2027-001` | Reach Oxford Scholarship 2027 | scholarship | 2027-01-26 | upcoming | https://www.ox.ac.uk/admissions/undergraduate/fees-and-funding/oxford-bursaries-and-scholarships/reach-oxford |
| 2 | `yop-2027-002` | UBC International Scholars Program 2027 | scholarship | 2026-11-15 | open | https://you.ubc.ca/financial-planning/scholarships-awards-international-students/international-scholars/ |
| 3 | `yop-2027-003` | Yenching Academy Fellowship 2027 | fellowship | 2026-11-30 | open | https://yenchingacademy.pku.edu.cn/ADMISSIONS.htm |
| 4 | `yop-2027-004` | KAUST Fall 2027 Graduate Admission with KAUST Fellowship | scholarship | 2027-01-03 | open | https://admissions.kaust.edu.sa/how-to-apply/admission-timelines |
| 5 | `yop-2027-005` | Oxfordâ€“Sheikh Mohammed bin Rashid Al Maktoum (MBRF) Graduate Scholarship | scholarship | unspecified | not stated | https://www.ox.ac.uk/admissions/graduate/fees-and-funding/fees-funding-and-scholarship-search/scholarships-a-z-listing |
| 6 | `yop-2027-006` | Oxford Centre for Islamic Studies (OCIS) Scholarships 2027 | scholarship | unspecified | not stated | https://www.ox.ac.uk/admissions/graduate/fees-and-funding/fees-funding-and-scholarship-search/oxford-centre-islamic-studies-ocis-scholarships |
| 7 | `yop-2027-007` | Mundus MAPP Financial Aid 2027â€“2029 | scholarship | 2026-12-01 | open | https://www.mundusmapp.org/admissions-calendar/ |
| 8 | `yop-2027-008` | EMMIR Edition 14 (2027â€“2029) Scholarship Application | scholarship | 2026-12-20 | open | https://www.emmir.org/application-procedures |
| 9 | `yop-2027-009` | Mundus Journalism Erasmus Mundus Scholarship 2027â€“2029 | scholarship | 2027-01-10 | upcoming | https://mundusjournalism.com/admissions/application-process |
| 10 | `yop-2027-010` | Europubhealth+ Erasmus Mundus Scholarship 2027â€“2029 | scholarship | 2027-01-08 | open | https://www.europubhealth.org/application-procedure/ |
| 11 | `yop-2027-011` | Euroculture Erasmus Mundus Scholarship 2027â€“2029 | scholarship | 2027-01-15 | upcoming | https://www.euroculturemaster.eu/online-application-tool |
| 12 | `yop-2027-012` | GrEnFIn Erasmus Mundus 2027â€“2028 | scholarship | 2027-01-07 | upcoming | https://greening-energy-market-finance-emjm.eu/application |
| 13 | `yop-2027-013` | ILSPSD Erasmus Mundus Scholarship 2027â€“2029 | scholarship | 2027-01-04 | open | https://master-international-law-erasmusmundus.eu/ |
| 14 | `yop-2027-014` | NOHA Erasmus Mundus Scholarship 2027â€“2029 | scholarship | 2026-12-15 | open | https://www.nohanet.org/en/masters |
| 15 | `yop-2027-015` | Neurasmus Erasmus Mundus Scholarship 2027â€“2029 | scholarship | 2026-12-01 | open | https://www.neurasmus.u-bordeaux.fr/admission/key-dates-admission/ |
| 16 | `yop-2027-016` | MIPDaL Erasmus Mundus Scholarship 2027/2028 | scholarship | 2027-01-15 | open | https://mipdal.eu/admission/ |
| 17 | `yop-2026-017` | Internship - Chambers/Case Law Database | internship | 2026-12-31 | open | https://www.icc-cpi.int/jobs/internships-and-visiting-professionals |
| 18 | `yop-2026-018` | Internship - Chambers | internship | 2026-12-31 | open | https://www.icc-cpi.int/jobs/internships-and-visiting-professionals |
| 19 | `yop-2026-019` | Internship - Archives and Legacy | internship | 2026-12-31 | open | https://www.icc-cpi.int/jobs/internships-and-visiting-professionals |
| 20 | `yop-2026-020` | Internship - Information Management Office - Migration Project | internship | 2026-12-31 | open | https://www.icc-cpi.int/jobs/internships-and-visiting-professionals |
| 21 | `yop-2026-021` | Internship - Human Resources - Strategic Workforce Planning and HR Analytics | internship | 2026-12-31 | open | https://www.icc-cpi.int/jobs/internships-and-visiting-professionals |
| 22 | `yop-2026-022` | Internship - Presidency - External Relations | internship | 2026-12-31 | open | https://www.icc-cpi.int/jobs/internships-and-visiting-professionals |
| 23 | `yop-2026-023` | Internship - Legal Office | internship | 2026-12-31 | open | https://www.icc-cpi.int/jobs/internships-and-visiting-professionals |
| 24 | `yop-2026-024` | Internship - Counsel Support Section | internship | 2026-12-31 | open | https://www.icc-cpi.int/jobs/internships-and-visiting-professionals |
| 25 | `yop-2026-025` | KAUST Visiting Student Research Program (VSRP) | internship | rolling | open | https://admissions.kaust.edu.sa/study/internships |
| 26 | `yop-2026-026` | MOOC on the Social and Solidarity Economy | course | rolling | open | https://www.itcilo.org/courses/mooc-social-and-solidarity-economy |
| 27 | `yop-2026-027` | Developing and implementing bilateral labour migration agreements | training | rolling | open | https://www.itcilo.org/courses/developing-and-implementing-bilateral-labour-migration-agreements |
| 28 | `yop-2026-028` | E-Learning Financial Education: (Self guided course) | course | rolling | open | https://www.itcilo.org/courses/e-learning-financial-education-self-guided-course |
| 29 | `yop-2026-029` | Work in Freedom: self-guided course on lessons learned | course | rolling | open | https://www.itcilo.org/courses/work-freedom-self-guided-course-lessons-learned |
| 30 | `yop-2026-030` | Training Toolkit on Establishing Fair Recruitment Processes | training | rolling | open | https://www.itcilo.org/courses/training-toolkit-establishing-fair-recruitment-processes |
| 31 | `yop-2026-031` | Transition from informality to formality | course | rolling | open | https://www.itcilo.org/it/courses/formalisation-informal-economy |
| 32 | `yop-2026-032` | Understanding Fragility | course | rolling | open | https://www.itcilo.org/courses/understanding-fragility |
| 33 | `yop-2026-033` | Data collection and research on child labour and forced labour | course | rolling | open | https://www.itcilo.org/courses/data-collection-and-research-child-labour-and-forced-labour |
| 34 | `yop-2026-034` | Introduction to International Labour Standards | course | rolling | open | https://www.itcilo.org/courses/introduction-international-labour-standards |
| 35 | `yop-2026-035` | BuildProc MOOC | course | rolling | open | https://www.itcilo.org/it/courses/buildproc-mooc |
| 36 | `yop-2026-036` | Discrimination, violence and harassment: self-guided learning on ILO conventions No. 111 and No. 190 | course | rolling | open | https://www.itcilo.org/courses/discrimination-violence-and-harassment-self-guided-learning-ilo-conventions-no-111-and-no-0 |
| 37 | `yop-2026-037` | EMPLOYMENT POLICY: Self-guided learning on ILO convention NO.122 | course | rolling | open | https://www.itcilo.org/it/courses/employment-policy-mooc-ilo-convention-no122 |
| 38 | `yop-2026-038` | Climate, Environmental and Social Standards MOOC â€“ Sustain 2 | course | rolling | open | https://www.itcilo.org/it/courses/massive-open-online-course-social-environmental-and-climate-standards-sustain-2 |
| 39 | `yop-2026-039` | Digital Facilitation in Synchronous Events | training | rolling | open | https://www.itcilo.org/courses/digital-facilitation-synchronous-events |
| 40 | `yop-2026-040` | Human-centred AI for SMEs | course | rolling | open | https://www.itcilo.org/courses/human-centred-ai-smes |
| 41 | `yop-2026-041` | Conflict series: 1. What is conflict? - PTP.2026.01 | course | rolling | open | https://event.unitar.org/full-catalog/conflict-series-1-what-conflict-ptp202601-0 |
| 42 | `yop-2026-042` | Conflict series: 2. Conflict analysis - PTP.2026.02 | course | rolling | open | https://event.unitar.org/full-catalog/conflict-series-2-conflict-analysis-ptp202602-1 |
| 43 | `yop-2026-043` | Conflict series: 3. From Conflict to Peace - PTP.2026.03 | course | rolling | open | https://event.unitar.org/full-catalog/conflict-series-3-conflict-peace-ptp202603-1 |
| 44 | `yop-2026-044` | Youth and Peacebuilding - PTP.2026.22 | course | rolling | open | https://event.unitar.org/full-catalog/youth-and-peacebuilding-ptp202622 |
| 45 | `yop-2026-045` | Introduction to Security Sector Reform - PTP.2026.09 | course | rolling | open | https://event.unitar.org/full-catalog/introduction-security-sector-reform-ptp202609 |
| 46 | `yop-2026-046` | Introduction to Environment, Natural Resources and UN Peacekeeping Operations - PTP.2026.07 | course | rolling | open | https://event.unitar.org/full-catalog/introduction-environment-natural-resources-and-un-peacekeeping-operations-ptp202607 |
| 47 | `yop-2026-047` | Environment, Natural Resources and UN Peacekeeping Operations: Restoring Governance of Natural Resources - PTP.2026.08 | course | rolling | open | https://event.unitar.org/full-catalog/environment-natural-resources-and-un-peacekeeping-operations-restoring-governance-12 |
| 48 | `yop-2026-048` | Milestones in UN Peacekeeping - PTP.2026.11 | course | rolling | open | https://event.unitar.org/full-catalog/milestones-un-peacekeeping-ptp202611 |
| 49 | `yop-2026-049` | Gender Matters - PTP.2026.16 | course | rolling | open | https://event.unitar.org/full-catalog/gender-matters-ptp202616 |
| 50 | `yop-2026-050` | Military Gender Advisor Course [2026] | course | rolling | open | https://event.unitar.org/full-catalog/military-gender-advisor-course-2026 |

## Final repository verification command

```powershell
node scripts/validate-data.js data/opportunities.json --final --today=2026-10-13
```

Expected result after replacing the production dataset: **50 records, 0 structural errors, exit code 0**.

## Local Final Validation Evidence

Date: 2026-10-13

Command:

`agy-node.cmd scripts/validate-data.js data/opportunities.json --final --today=2026-10-13`

Result:

- Production records checked: 50
- Structural errors: 0
- Final readiness requirement: PASSED
- Exit code: 0

The production dataset contains 50 records and successfully satisfies the project's final minimum-record readiness check.
