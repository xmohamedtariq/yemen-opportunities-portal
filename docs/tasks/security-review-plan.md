# Security Review - Read-Only Plan

## Record Integrity Note

This plan was reviewed and approved by the project owner in the project conversation before the local security scan was executed on 2026-10-17.

During post-scan verification, the expected local plan file was found to be missing.

This file was therefore reconstructed after the scan from the already-approved review scope.

No claim is made that this local Markdown file existed before the scan.

## Goal

Perform a read-only security review of Yemen Opportunities Portal before publication.

Any confirmed issue requiring a fix must be handled separately after the review.

## Review Mode

Read-only.

The review must not:

- modify application code
- modify production opportunity data
- install packages
- expose secrets
- automatically remediate findings

## Security Scope

### Secrets and Credentials

Check for API keys, tokens, passwords, private keys, `.env` files, credentials, and secret configuration.

### External Runtime Resources

Check for external scripts, stylesheets, fonts, CDN dependencies, images, and unexpected third-party runtime resources.

### Unsafe DOM Rendering and Code Execution

Review use of `innerHTML`, `outerHTML`, `insertAdjacentHTML`, `document.write`, `eval`, `new Function`, and `srcdoc`.

### URL Safety

Check production URLs for HTTPS, dangerous URL schemes, and external links opened in new tabs without `noopener noreferrer`.

### Suggestion Form

Verify HTTPS URL validation, safe rendering, Pending-only local storage behavior, and minimal personal-data collection.

### localStorage

Review Favorites and Pending suggestion storage for secrets or sensitive credentials.

### Service Worker

Verify same-origin handling, versioned caches, old-cache cleanup, and no external opportunity-site caching.

### Production Data Protection

Confirm the review does not modify:

- `data/opportunities.json`
- `data/schema.json`
- `scripts/validate-data.js`

### Project Security Rules

Confirm `AGENTS.md` contains rules covering secrets, `.env`, packages/CDN, deletion safety, scraping restrictions, and opportunity-data integrity.

## Findings Process

Confirmed findings are classified as Critical, High, Medium, Low, or Informational.

Any remediation must be performed separately from the read-only review.

## Antigravity Review

A separate Antigravity read-only security-agent review should be added when available.

Do not claim that agent review has occurred until genuine evidence exists.

## Human Review

Status: Approved by the project owner in conversation before the local read-only scan on 2026-10-17. Local plan file reconstructed after the scan because the expected file was missing.
