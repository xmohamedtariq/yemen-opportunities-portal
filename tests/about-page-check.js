/**
 * Yemen Opportunities Portal
 * About Page Browser Verification
 *
 * Zero external packages.
 * Uses Chrome DevTools Protocol with Node.js native APIs.
 */

const fs = require('fs');
const path = require('path');
const cp = require('child_process');

const CHROME_PATH =
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const USER_DATA_DIR =
  path.resolve('scratch-cdp', 'about-check');

const CDP_PORT = 9226;

const BASE_URL =
  'http://127.0.0.1:8080';

const wait = ms =>
  new Promise(resolve => setTimeout(resolve, ms));

async function run() {
  console.log(
    'Launching headless Chrome for About verification...'
  );

  const chrome = cp.spawn(
    CHROME_PATH,
    [
      '--headless=new',
      `--remote-debugging-port=${CDP_PORT}`,
      '--disable-gpu',
      '--no-sandbox',
      '--window-size=1440,1000',
      '--user-data-dir=' + USER_DATA_DIR,
      `${BASE_URL}/about.html?lang=ar&test=1`
    ],
    {
      stdio: 'ignore'
    }
  );

  await wait(2000);

  try {
    const response = await fetch(
      `http://127.0.0.1:${CDP_PORT}/json`
    );

    const targets = await response.json();

    const pageTarget =
      targets.find(target => target.type === 'page');

    if (
      !pageTarget ||
      !pageTarget.webSocketDebuggerUrl
    ) {
      throw new Error(
        'No browser page target found.'
      );
    }

    const ws =
      new WebSocket(
        pageTarget.webSocketDebuggerUrl
      );

    await new Promise((resolve, reject) => {
      ws.onopen = resolve;
      ws.onerror = reject;
    });

    let messageId = 1;

    function send(method, params = {}) {
      return new Promise(
        (resolve, reject) => {
          const id = messageId++;

          const listener = event => {
            const message =
              JSON.parse(event.data);

            if (message.id !== id) {
              return;
            }

            ws.removeEventListener(
              'message',
              listener
            );

            if (message.error) {
              reject(
                new Error(
                  message.error.message
                )
              );
            } else {
              resolve(message.result);
            }
          };

          ws.addEventListener(
            'message',
            listener
          );

          ws.send(
            JSON.stringify({
              id,
              method,
              params
            })
          );
        }
      );
    }

    await send('Page.enable');
    await send('Runtime.enable');
    await send('Log.enable');
    await send('DOM.enable');

    const browserProblems = [];

    ws.addEventListener(
      'message',
      event => {
        const message =
          JSON.parse(event.data);

        if (
          message.method ===
          'Runtime.consoleAPICalled'
        ) {
          const type =
            message.params.type;

          if (
            type === 'error' ||
            type === 'warning'
          ) {
            browserProblems.push({
              source: 'console',
              type,
              text:
                message.params.args
                  .map(arg =>
                    arg.value ??
                    arg.description ??
                    ''
                  )
                  .join(' ')
            });
          }
        }

        if (
          message.method ===
          'Runtime.exceptionThrown'
        ) {
          browserProblems.push({
            source: 'exception',
            text:
              message.params
                .exceptionDetails
                .text
          });
        }

        if (
          message.method ===
          'Log.entryAdded'
        ) {
          const entry =
            message.params.entry;

          if (
            entry.level === 'error' ||
            entry.level === 'warning'
          ) {
            browserProblems.push({
              source: 'log',
              type: entry.level,
              text: entry.text
            });
          }
        }
      }
    );

    async function evaluate(expression) {
      const result =
        await send(
          'Runtime.evaluate',
          {
            expression,
            returnByValue: true,
            awaitPromise: true
          }
        );

      if (result.exceptionDetails) {
        throw new Error(
          'Browser evaluation failed: ' +
          JSON.stringify(
            result.exceptionDetails
          )
        );
      }

      return result.result.value;
    }

    async function navigate(url) {
      await send(
        'Page.navigate',
        { url }
      );

      await wait(1200);
    }

    async function screenshot(filePath) {
      const result =
        await send(
          'Page.captureScreenshot',
          {
            format: 'png',
            captureBeyondViewport: false
          }
        );

      fs.mkdirSync(
        path.dirname(filePath),
        { recursive: true }
      );

      fs.writeFileSync(
        filePath,
        Buffer.from(
          result.data,
          'base64'
        )
      );
    }

    const tests = [];

    await wait(1000);

    /* =========================================
       Test 1: Arabic initial state
       ========================================= */

    const arabicState =
      await evaluate(`(() => ({
        lang:
          document.documentElement.lang,
        dir:
          document.documentElement.dir,
        title:
          document.title,
        button:
          document
            .getElementById('langToggle')
            ?.textContent.trim(),
        aboutNav:
          document
            .getElementById('aboutNav')
            ?.textContent.trim(),
        hero:
          document
            .getElementById(
              'heroTitlePrimary'
            )
            ?.textContent.trim()
      }))()`);

    tests.push({
      name:
        'Arabic About page loads in RTL',
      passed:
        arabicState.lang === 'ar' &&
        arabicState.dir === 'rtl' &&
        arabicState.button ===
          'الإنجليزية' &&
        arabicState.aboutNav ===
          'عن البوابة',
      details: arabicState
    });

    /* =========================================
       Test 2: Branding assets
       ========================================= */

    const assets =
      await evaluate(`(() => {
        const logo =
          document.querySelector(
            '.yp-brand-logo'
          );

        const photo =
          document.querySelector(
            '.yp-creator-photo'
          );

        return {
          logoSrc:
            logo?.getAttribute('src'),
          logoLoaded:
            Boolean(
              logo &&
              logo.complete &&
              logo.naturalWidth > 0
            ),
          photoSrc:
            photo?.getAttribute('src'),
          photoLoaded:
            Boolean(
              photo &&
              photo.complete &&
              photo.naturalWidth > 0
            ),
          photoAlt:
            photo?.getAttribute('alt')
        };
      })()`);

    tests.push({
      name:
        'Logo and creator portrait load',
      passed:
        assets.logoLoaded === true &&
        assets.photoLoaded === true &&
        assets.logoSrc ===
          'assets/images/yemen-opportunities-logo.png' &&
        assets.photoSrc ===
          'assets/images/mohammed-tariq-profile.jpg',
      details: assets
    });

    /* =========================================
       Test 3: Creator identity
       ========================================= */

    const creator =
      await evaluate(`(() => ({
        name:
          document
            .getElementById('creatorName')
            ?.textContent.trim(),
        role:
          document
            .getElementById('creatorRole')
            ?.textContent.trim(),
        bioVisible:
          Boolean(
            document
              .getElementById(
                'creatorBio'
              )
              ?.textContent.trim()
          )
      }))()`);

    tests.push({
      name:
        'Creator section is present',
      passed:
        creator.name ===
          'Mohammed Tariq Al-Saqaf' &&
        creator.role ===
          'AI Solutions Developer & Data Analyst' &&
        creator.bioVisible === true,
      details: creator
    });

    /* =========================================
       Test 4: Social profiles
       ========================================= */

    const social =
      await evaluate(`(() => {
        const github =
          document.querySelector(
            '.yp-social-github'
          );

        const linkedin =
          document.querySelector(
            '.yp-social-linkedin'
          );

        return {
          githubHref:
            github?.href,
          githubTarget:
            github?.target,
          githubRel:
            github?.rel,
          githubText:
            github?.textContent.trim(),

          linkedinHref:
            linkedin?.href,
          linkedinTarget:
            linkedin?.target,
          linkedinRel:
            linkedin?.rel,
          linkedinText:
            linkedin?.textContent.trim()
        };
      })()`);

    tests.push({
      name:
        'GitHub and LinkedIn icon links',
      passed:
        social.githubHref ===
          'https://github.com/xmohamedtariq' &&
        social.githubTarget ===
          '_blank' &&
        social.githubRel.includes(
          'noopener'
        ) &&
        social.githubRel.includes(
          'noreferrer'
        ) &&
        social.githubText === '' &&
        social.linkedinHref ===
          'https://www.linkedin.com/in/mohammed-tariq-3a1a0824a/' &&
        social.linkedinTarget ===
          '_blank' &&
        social.linkedinRel.includes(
          'noopener'
        ) &&
        social.linkedinRel.includes(
          'noreferrer'
        ) &&
        social.linkedinText === '',
      details: social
    });

    /* =========================================
       Test 5: Switch to English
       ========================================= */

    await evaluate(`(() => {
      document
        .getElementById('langToggle')
        .click();
    })()`);

    await wait(400);

    const englishState =
      await evaluate(`(() => ({
        lang:
          document.documentElement.lang,
        dir:
          document.documentElement.dir,
        button:
          document
            .getElementById('langToggle')
            ?.textContent.trim(),
        home:
          document
            .getElementById('homeNav')
            ?.textContent.trim(),
        about:
          document
            .getElementById('aboutNav')
            ?.textContent.trim(),
        url:
          window.location.href,
        creatorBio:
          document
            .getElementById('creatorBio')
            ?.textContent.trim()
      }))()`);

    tests.push({
      name:
        'Language switch to English',
      passed:
        englishState.lang === 'en' &&
        englishState.dir === 'ltr' &&
        englishState.button ===
          'Arabic' &&
        englishState.home ===
          'Opportunities' &&
        englishState.about ===
          'About' &&
        englishState.url.includes(
          'lang=en'
        ) &&
        englishState.creatorBio.startsWith(
          "I'm Mohammed"
        ),
      details: {
        lang: englishState.lang,
        dir: englishState.dir,
        button:
          englishState.button,
        home: englishState.home,
        about: englishState.about,
        url: englishState.url
      }
    });

    /* =========================================
       Test 6: English navigation preserved
       ========================================= */

    const navigation =
      await evaluate(`(() => ({
        home:
          document
            .getElementById('homeNav')
            ?.getAttribute('href'),
        brand:
          document
            .querySelector(
              '.yp-brand'
            )
            ?.getAttribute('href'),
        explore:
          document
            .getElementById(
              'exploreButton'
            )
            ?.getAttribute('href'),
        cta:
          document
            .getElementById(
              'ctaButton'
            )
            ?.getAttribute('href')
      }))()`);

    tests.push({
      name:
        'English navigation preserves language',
      passed:
        [
          navigation.home,
          navigation.brand,
          navigation.explore,
          navigation.cta
        ].every(
          href =>
            typeof href === 'string' &&
            href.includes(
              'index.html?lang=en'
            )
        ),
      details: navigation
    });

    /* =========================================
       Test 7: Actual navigation to listing
       ========================================= */

    await navigate(
      `${BASE_URL}/index.html?lang=en`
    );

    const listingState =
      await evaluate(`(() => ({
        lang:
          document.documentElement.lang,
        dir:
          document.documentElement.dir,
        count:
          document.querySelectorAll(
            '.opportunity-card'
          ).length,
        firstTitle:
          document.querySelector(
            '.card-title'
          )?.textContent
      }))()`);

    tests.push({
      name:
        'About to Opportunities keeps English',
      passed:
        listingState.lang === 'en' &&
        listingState.dir === 'ltr' &&
        listingState.count === 50 &&
        listingState.firstTitle ===
          'Reach Oxford Scholarship 2027',
      details: listingState
    });

    /* Return to About English */

    await navigate(
      `${BASE_URL}/about.html?lang=en&test=1`
    );

    /* =========================================
       Test 8: Desktop screenshot
       ========================================= */

    await send(
      'Emulation.clearDeviceMetricsOverride'
    );

    await wait(500);

    const desktopPath =
      path.resolve(
        'docs',
        'evidence',
        'desktop-about-page.png'
      );

    await screenshot(desktopPath);

    tests.push({
      name:
        'Desktop About screenshot captured',
      passed:
        fs.existsSync(desktopPath) &&
        fs.statSync(desktopPath).size > 0,
      details: {
        file:
          'docs/evidence/desktop-about-page.png'
      }
    });

    /* =========================================
       Test 9: Mobile 360px
       ========================================= */

    await send(
      'Emulation.setDeviceMetricsOverride',
      {
        width: 360,
        height: 740,
        deviceScaleFactor: 1,
        mobile: true
      }
    );

    await wait(600);

    const mobile =
      await evaluate(`(() => {
        const doc =
          document.documentElement;

        const width =
          window.innerWidth;

        const overflowing = [];

        document
          .querySelectorAll('*')
          .forEach(element => {
            const rect =
              element.getBoundingClientRect();

            if (
              rect.right >
                width + 1 ||
              rect.left < -1
            ) {
              overflowing.push({
                tag:
                  element.tagName,
                id:
                  element.id || '',
                className:
                  typeof element.className ===
                    'string'
                    ? element.className
                    : '',
                left:
                  Math.round(rect.left),
                right:
                  Math.round(rect.right)
              });
            }
          });

        return {
          innerWidth:
            width,
          scrollWidth:
            doc.scrollWidth,
          clientWidth:
            doc.clientWidth,
          noHorizontalScroll:
            doc.scrollWidth <=
            doc.clientWidth,
          overflowingElements:
            overflowing.slice(0, 10)
        };
      })()`);

    tests.push({
      name:
        'About page at 360px without horizontal overflow',
      passed:
        mobile.innerWidth === 360 &&
        mobile.scrollWidth === 360 &&
        mobile.clientWidth === 360 &&
        mobile.noHorizontalScroll ===
          true &&
        mobile
          .overflowingElements
          .length === 0,
      details: mobile
    });

    const mobilePath =
      path.resolve(
        'docs',
        'evidence',
        'mobile-360px-about-page.png'
      );

    await screenshot(mobilePath);

    /* =========================================
       Test 10: Keyboard focus
       ========================================= */

    const keyboard =
      await evaluate(`(() => {
        const controls = [
          document.getElementById(
            'skipLink'
          ),
          document.getElementById(
            'langToggle'
          ),
          document.getElementById(
            'exploreButton'
          ),
          document.querySelector(
            '.yp-social-github'
          ),
          document.querySelector(
            '.yp-social-linkedin'
          )
        ];

        const results =
          controls.map(control => {
            if (!control) {
              return false;
            }

            control.focus();

            return (
              document.activeElement ===
              control
            );
          });

        return {
          results,
          allFocusable:
            results.every(Boolean)
        };
      })()`);

    tests.push({
      name:
        'About keyboard focus behavior',
      passed:
        keyboard.allFocusable === true,
      details: keyboard
    });

    /* =========================================
       Test 11: Browser health
       ========================================= */

    await wait(400);

    tests.push({
      name:
        'No browser errors or warnings',
      passed:
        browserProblems.length === 0,
      details: {
        count:
          browserProblems.length,
        messages:
          browserProblems
      }
    });

    console.log(
      '\n=========================================='
    );

    console.log(
      'About Page Verification Results'
    );

    console.log(
      '==========================================\n'
    );

    let allPassed = true;

    tests.forEach((test, index) => {
      const status =
        test.passed
          ? '✔ PASS'
          : '✖ FAIL';

      if (!test.passed) {
        allPassed = false;
      }

      console.log(
        `[${index + 1}] ${status}: ${test.name}`
      );

      console.log(
        '    Details:',
        JSON.stringify(test.details)
      );
    });

    console.log(
      '\nBrowser error/warning count:',
      browserProblems.length
    );

    console.log(
      '\nFinal Test Verdict:',
      allPassed
        ? 'ALL TESTS PASSED'
        : 'SOME TESTS FAILED'
    );

    console.log('');

    ws.close();
    chrome.kill();

    process.exit(
      allPassed ? 0 : 1
    );

  } catch (error) {
    console.error(
      'About Test Suite Fatal Error:',
      error
    );

    chrome.kill();

    process.exit(1);
  }
}

run();
