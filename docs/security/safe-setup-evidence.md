# Safe Setup Evidence

## Verification Date

2026-10-18

## Antigravity Version Note

The current Antigravity interface uses updated permission names compared with the terminology used in the original project assignment.

This evidence records the settings exactly as displayed in the current application rather than claiming that legacy labels are still present.

## Terminal Execution Safety

Verified settings:

- `Terminal Command Auto Execution`: `Proceed In Sandbox`
- `Enable Sandbox Mode (Preview)`: Enabled
- `Outside of folders file access policy`: `Always Ask`

Evidence:

`docs/evidence/security-settings/terminal-sandbox-settings.png`

## Review Policies

Verified settings:

- `Plan Review Policy`: `Always Ask`
- `Browser Javascript Execution Policy`: `Request Review`

Evidence:

`docs/evidence/security-settings/review-permissions-settings.png`

## Destructive Command Protection

Commands Outside Sandbox contains eight explicit Deny rules:

- `del`
- `erase`
- `git clean`
- `git reset --hard`
- `rd`
- `Remove-Item`
- `rm`
- `rmdir`

Evidence:

`docs/evidence/security-settings/destructive-command-deny-list.png`

## Verification Result

PASS

The project is configured to use sandboxed terminal execution, explicit review policies, and denial rules for destructive commands outside the sandbox.
