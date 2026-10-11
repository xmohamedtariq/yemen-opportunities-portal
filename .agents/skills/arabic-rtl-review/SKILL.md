---
name: arabic-rtl-review
description: Review Arabic and bilingual web interfaces for correct RTL/LTR direction, typography, punctuation, mobile layout, and usability.
---

# Arabic RTL Interface Review

Use this skill whenever reviewing an Arabic or bilingual web interface.

## Direction

1. Verify that Arabic pages use `lang="ar"` and `dir="rtl"` on the appropriate root element.
2. Verify that English content uses LTR direction where necessary.
3. Check mixed Arabic-English text carefully.
4. Ensure numbers, URLs, email addresses, dates, code, and English names display in the correct direction.
5. Check that brackets, punctuation marks, slashes, and parentheses do not appear reversed or misplaced.

## Typography

6. Confirm Arabic text is readable and visually balanced.
7. Do not load fonts from a CDN.
8. Use a local or system Arabic-capable font stack.
9. Confirm headings, labels, buttons, and body text have a clear hierarchy.

## Layout

10. Test the interface at 360px viewport width.
11. Confirm there is no horizontal scrolling.
12. Check long Arabic and English names for wrapping and overflow.
13. Verify buttons and controls remain usable on mobile.
14. Check spacing and alignment in both RTL and LTR modes.

## Bilingual Behavior

15. Test switching between Arabic and English.
16. Confirm the page direction changes correctly.
17. Confirm content does not disappear or become misaligned after language switching.
18. Confirm saved user state is not lost merely because the interface language changes.

## Usability

19. Verify form labels are clear.
20. Verify keyboard focus is visible on interactive controls.
21. Check empty states, errors, and "no results" states in Arabic and English.
22. Report every issue with:
    - page,
    - element,
    - expected behavior,
    - actual behavior,
    - severity,
    - recommended fix.

Do not silently fix issues during a review unless explicitly asked. Produce a review report first.
