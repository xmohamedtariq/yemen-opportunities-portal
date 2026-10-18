# Real Device Test — iPhone Safari

**Date:** 2026-10-18
**Application:** Yemen Opportunities Portal
**Live URL:** https://xmohamedtariq.github.io/yemen-opportunities-portal/
**Device:** Physical Apple iPhone
**Browser:** Safari
**Tester:** Project owner

## Test Scope

This was a genuine physical-device test performed on the deployed GitHub Pages application.

The application was first opened successfully while the iPhone had an active Internet connection.

After the application had loaded and its offline resources had been cached, the network connection was disabled and the portal was opened/reloaded again in Safari.

## Result

**PASS**

The previously loaded portal remained available in Safari while offline, confirming that the deployed Service Worker and cached application shell function on a real iPhone after the first successful online load.

## Verified

- Real physical iPhone device
- Safari browser
- Public GitHub Pages deployment
- Initial online application load
- Offline operation after first successful load
- Service Worker/cache behavior on a real device

## Integrity Note

This document records only the manual test actually performed by the project owner.

No claim is made that this single test represents every iPhone model, iOS version, browser, or network condition.

No automated agent, emulator, or desktop mobile emulation is presented as the physical-device test.
