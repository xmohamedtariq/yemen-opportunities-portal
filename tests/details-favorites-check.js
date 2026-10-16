/**
 * Yemen Opportunities Portal
 * Opportunity Details & Favorites Browser Verification
 *
 * Zero external packages:
 * Node.js native fetch, WebSocket, child_process, and fs only.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const cp = require('child_process');

const BASE_URL = 'http://127.0.0.1:8080';
const CHROME_PATH =
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const USER_DATA_DIR = path.resolve(
  'scratch-cdp',
  'details-favorites'
);

const DEBUG_PORT = 9225;
const FAVORITES_KEY =
  'yemen-opportunities:favorites:v1';

const sleep = ms =>
  new Promise(resolve => setTimeout(resolve, ms));

async function run() {
  try {
    const serverCheck = await fetch(
      `${BASE_URL}/detail.html`
    );

    if (!serverCheck.ok) {
      throw new Error(
        `Local server returned HTTP ${serverCheck.status}`
      );
    }
  } catch (error) {
    console.error(
      'Local server is not available at ' + BASE_URL
    );
    console.error(
      'Keep python -m http.server 8080 running first.'
    );
    console.error(error.message);
    process.exit(1);
  }

  console.log(
    'Launching headless Chrome for detail-page tests...'
  );

  const chrome = cp.spawn(CHROME_PATH, [
    '--headless=new',
    `--remote-debugging-port=${DEBUG_PORT}`,
    '--disable-gpu',
    '--no-sandbox',
    '--user-data-dir=' + USER_DATA_DIR,
    `${BASE_URL}/index.html`
  ]);

  await sleep(2000);

  try {
    const targetsResponse = await fetch(
      `http://127.0.0.1:${DEBUG_PORT}/json`
    );

    const targets = await targetsResponse.json();
    const pageTarget = targets.find(
      target => target.type === 'page'
    );

    if (
      !pageTarget ||
      !pageTarget.webSocketDebuggerUrl
    ) {
      throw new Error(
        'No Chrome page target was found.'
      );
    }

    const ws = new WebSocket(
      pageTarget.webSocketDebuggerUrl
    );

    await new Promise((resolve, reject) => {
      ws.onopen = resolve;
      ws.onerror = reject;
    });

    let messageId = 1;

    function send(method, params = {}) {
      return new Promise((resolve, reject) => {
        const id = messageId++;

        const onMessage = event => {
          const message = JSON.parse(event.data);

          if (message.id !== id) return;

          ws.removeEventListener(
            'message',
            onMessage
          );

          if (message.error) {
            reject(
              new Error(message.error.message)
            );
          } else {
            resolve(message.result);
          }
        };

        ws.addEventListener(
          'message',
          onMessage
        );

        ws.send(
          JSON.stringify({
            id,
            method,
            params
          })
        );
      });
    }

    await send('Page.enable');
    await send('Runtime.enable');
    await send('DOM.enable');
    await send('Log.enable');

    const browserIssues = [];

    ws.addEventListener('message', event => {
      const message = JSON.parse(event.data);

      if (
        message.method ===
        'Runtime.exceptionThrown'
      ) {
        browserIssues.push({
          type: 'exception',
          value:
            message.params.exceptionDetails
              .exception?.description ||
            message.params.exceptionDetails.text
        });
      }

      if (
        message.method ===
        'Runtime.consoleAPICalled' &&
        ['error', 'warning'].includes(
          message.params.type
        )
      ) {
        browserIssues.push({
          type: message.params.type,
          value: message.params.args
            .map(arg =>
              arg.value ??
              arg.description ??
              ''
            )
            .join(' ')
        });
      }

      if (
        message.method === 'Log.entryAdded' &&
        ['error', 'warning'].includes(
          message.params.entry.level
        )
      ) {
        browserIssues.push({
          type: message.params.entry.level,
          value: message.params.entry.text
        });
      }
    });

    async function evaluate(expression) {
      const result = await send(
        'Runtime.evaluate',
        {
          expression,
          returnByValue: true,
          awaitPromise: true
        }
      );

      if (result.exceptionDetails) {
        throw new Error(
          'Browser evaluation error: ' +
          JSON.stringify(
            result.exceptionDetails
          )
        );
      }

      return result.result.value;
    }

    async function navigate(relativeUrl) {
      await send('Page.navigate', {
        url: BASE_URL + relativeUrl
      });

      await sleep(800);
    }

    async function waitFor(
      expression,
      timeoutMs = 6000
    ) {
      const started = Date.now();

      while (
        Date.now() - started <
        timeoutMs
      ) {
        try {
          const ready = await evaluate(
            expression
          );

          if (ready) return true;
        } catch (_error) {
          // Page may still be navigating.
        }

        await sleep(150);
      }

      throw new Error(
        'Timed out waiting for: ' +
        expression
      );
    }

    async function waitForDetail() {
      return waitFor(`(() => {
        const content =
          document.getElementById(
            'detailContent'
          );

        return Boolean(
          content &&
          content.hidden === false
        );
      })()`);
    }

    async function waitForError() {
      return waitFor(`(() => {
        const error =
          document.getElementById(
            'detailError'
          );

        return Boolean(
          error &&
          error.hidden === false
        );
      })()`);
    }

    const results = [];

    async function test(name, callback) {
      try {
        const details = await callback();

        results.push({
          name,
          passed: true,
          details
        });
      } catch (error) {
        results.push({
          name,
          passed: false,
          details: {
            error: error.message
          }
        });
      }
    }

    /*
     * Establish the portal origin and clear
     * favorites for a deterministic test.
     */
    await navigate('/index.html');

    await evaluate(
      `localStorage.removeItem(
        ${JSON.stringify(FAVORITES_KEY)}
      ); true;`
    );

    await test(
      'Valid Arabic opportunity detail',
      async () => {
        await navigate(
          '/detail.html?id=yop-2027-001&lang=ar'
        );

        await waitForDetail();

        const detail = await evaluate(`(() => ({
          lang:
            document.documentElement.lang,
          dir:
            document.documentElement.dir,
          title:
            document.getElementById(
              'detailTitle'
            ).textContent,
          organization:
            document.getElementById(
              'detailOrganization'
            ).textContent,
          country:
            document.getElementById(
              'detailCountry'
            ).textContent,
          deadline:
            document.getElementById(
              'detailDeadline'
            ).textContent,
          contentVisible:
            document.getElementById(
              'detailContent'
            ).hidden === false,
          errorHidden:
            document.getElementById(
              'detailError'
            ).hidden === true
        }))()`);

        if (
          detail.lang !== 'ar' ||
          detail.dir !== 'rtl' ||
          !detail.title.includes(
            'Reach Oxford'
          ) ||
          !detail.organization.includes(
            'أكسفورد'
          ) ||
          !detail.country.includes(
            'المملكة المتحدة'
          ) ||
          !detail.deadline.includes(
            '2027-01-26'
          ) ||
          !detail.contentVisible ||
          !detail.errorHidden
        ) {
          throw new Error(
            JSON.stringify(detail)
          );
        }

        return detail;
      }
    );

    await test(
      'Secure official-source link',
      async () => {
        const link = await evaluate(`(() => {
          const element =
            document.getElementById(
              'officialSourceLink'
            );

          return {
            hidden: element.hidden,
            href: element.href,
            target: element.target,
            rel: element.rel
          };
        })()`);

        if (
          link.hidden ||
          !link.href.startsWith('https://') ||
          link.target !== '_blank' ||
          !link.rel.includes('noopener') ||
          !link.rel.includes('noreferrer')
        ) {
          throw new Error(
            JSON.stringify(link)
          );
        }

        return link;
      }
    );

    await test(
      'Null application link remains hidden',
      async () => {
        const hidden = await evaluate(
          `document.getElementById(
            'applicationLink'
          ).hidden`
        );

        if (hidden !== true) {
          throw new Error(
            'Application link should be hidden.'
          );
        }

        return { hidden };
      }
    );

    await test(
      'Add favorite and store stable ID only',
      async () => {
        await evaluate(`(() => {
          document.getElementById(
            'favoriteButton'
          ).click();
        })()`);

        await sleep(150);

        const favorite = await evaluate(`(() => ({
          pressed:
            document.getElementById(
              'favoriteButton'
            ).getAttribute(
              'aria-pressed'
            ),
          text:
            document.getElementById(
              'favoriteButton'
            ).textContent,
          stored:
            localStorage.getItem(
              ${JSON.stringify(
                FAVORITES_KEY
              )}
            )
        }))()`);

        const parsed = JSON.parse(
          favorite.stored
        );

        if (
          favorite.pressed !== 'true' ||
          parsed.length !== 1 ||
          parsed[0] !== 'yop-2027-001'
        ) {
          throw new Error(
            JSON.stringify(favorite)
          );
        }

        return favorite;
      }
    );

    await test(
      'Favorite persists after page reload',
      async () => {
        await send('Page.reload', {
          ignoreCache: true
        });

        await waitForDetail();

        const persisted = await evaluate(
          `(() => ({
            pressed:
              document.getElementById(
                'favoriteButton'
              ).getAttribute(
                'aria-pressed'
              ),
            stored:
              localStorage.getItem(
                ${JSON.stringify(
                  FAVORITES_KEY
                )}
              )
          }))()`
        );

        if (
          persisted.pressed !== 'true' ||
          !persisted.stored.includes(
            'yop-2027-001'
          )
        ) {
          throw new Error(
            JSON.stringify(persisted)
          );
        }

        return persisted;
      }
    );

    await test(
      'Remove favorite',
      async () => {
        await evaluate(`(() => {
          document.getElementById(
            'favoriteButton'
          ).click();
        })()`);

        await sleep(150);

        const removed = await evaluate(
          `(() => ({
            pressed:
              document.getElementById(
                'favoriteButton'
              ).getAttribute(
                'aria-pressed'
              ),
            stored:
              localStorage.getItem(
                ${JSON.stringify(
                  FAVORITES_KEY
                )}
              )
          }))()`
        );

        if (
          removed.pressed !== 'false' ||
          removed.stored !== '[]'
        ) {
          throw new Error(
            JSON.stringify(removed)
          );
        }

        return removed;
      }
    );

    await test(
      'Language switch to English and LTR',
      async () => {
        await evaluate(`(() => {
          document.getElementById(
            'langToggle'
          ).click();
        })()`);

        await sleep(150);

        const language = await evaluate(
          `(() => ({
            lang:
              document.documentElement.lang,
            dir:
              document.documentElement.dir,
            title:
              document.getElementById(
                'detailTitle'
              ).textContent,
            url:
              window.location.href
          }))()`
        );

        if (
          language.lang !== 'en' ||
          language.dir !== 'ltr' ||
          language.title !==
            'Reach Oxford Scholarship 2027' ||
          !language.url.includes('lang=en')
        ) {
          throw new Error(
            JSON.stringify(language)
          );
        }

        return language;
      }
    );

    await test(
      'Rolling deadline state',
      async () => {
        await navigate(
          '/detail.html?id=yop-2026-025&lang=ar'
        );

        await waitForDetail();

        const text = await evaluate(
          `document.getElementById(
            'detailDeadline'
          ).textContent`
        );

        if (!text.includes('تقديم مستمر')) {
          throw new Error(text);
        }

        return { deadlineText: text };
      }
    );

    await test(
      'Unspecified deadline state',
      async () => {
        await navigate(
          '/detail.html?id=yop-2027-005&lang=ar'
        );

        await waitForDetail();

        const text = await evaluate(
          `document.getElementById(
            'detailDeadline'
          ).textContent`
        );

        if (
          !text.includes(
            'غير محدد في المصدر الرسمي'
          )
        ) {
          throw new Error(text);
        }

        return { deadlineText: text };
      }
    );

    await test(
      'Invalid opportunity ID',
      async () => {
        await navigate(
          '/detail.html?id=not-a-real-id&lang=ar'
        );

        await waitForError();

        const error = await evaluate(
          `(() => ({
            title:
              document.getElementById(
                'detailErrorTitle'
              ).textContent,
            message:
              document.getElementById(
                'detailErrorMessage'
              ).textContent,
            contentHidden:
              document.getElementById(
                'detailContent'
              ).hidden
          }))()`
        );

        if (
          !error.title.includes(
            'تعذر العثور'
          ) ||
          !error.message.includes(
            'معرّف الفرصة'
          ) ||
          !error.contentHidden
        ) {
          throw new Error(
            JSON.stringify(error)
          );
        }

        return error;
      }
    );

    await test(
      'Missing opportunity ID',
      async () => {
        await navigate(
          '/detail.html?lang=ar'
        );

        await waitForError();

        const message = await evaluate(
          `document.getElementById(
            'detailErrorMessage'
          ).textContent`
        );

        if (
          !message.includes(
            'لم يتم تحديد الفرصة'
          )
        ) {
          throw new Error(message);
        }

        return { message };
      }
    );

    await test(
      'Listing provides detail and favorite controls',
      async () => {
        await navigate('/index.html');

        await waitFor(
          `document.querySelectorAll(
            '.opportunity-card'
          ).length === 50`
        );

        const integration = await evaluate(
          `(() => ({
            cards:
              document.querySelectorAll(
                '.opportunity-card'
              ).length,
            details:
              document.querySelectorAll(
                '.details-link'
              ).length,
            favorites:
              document.querySelectorAll(
                '.favorite-button'
              ).length,
            firstHref:
              document.querySelector(
                '.details-link'
              )?.getAttribute('href') || ''
          }))()`
        );

        if (
          integration.cards !== 50 ||
          integration.details !== 50 ||
          integration.favorites !== 50 ||
          !integration.firstHref.includes(
            'detail.html?id='
          )
        ) {
          throw new Error(
            JSON.stringify(integration)
          );
        }

        return integration;
      }
    );

    await test(
      'Detail page at 360px without horizontal overflow',
      async () => {
        await send(
          'Emulation.setDeviceMetricsOverride',
          {
            width: 360,
            height: 740,
            deviceScaleFactor: 1,
            mobile: true
          }
        );

        await navigate(
          '/detail.html?id=yop-2027-001&lang=ar'
        );

        await waitForDetail();

        const layout = await evaluate(
          `(() => {
            const doc =
              document.documentElement;

            const overflow = [];

            document
              .querySelectorAll('*')
              .forEach(element => {
                const rect =
                  element.getBoundingClientRect();

                if (
                  rect.width > 360 ||
                  element.scrollWidth > 360 ||
                  element.offsetWidth > 360
                ) {
                  overflow.push({
                    tag: element.tagName,
                    id: element.id,
                    className:
                      element.className,
                    rectWidth: rect.width,
                    scrollWidth:
                      element.scrollWidth,
                    offsetWidth:
                      element.offsetWidth
                  });
                }
              });

            return {
              innerWidth:
                window.innerWidth,
              scrollWidth:
                doc.scrollWidth,
              clientWidth:
                doc.clientWidth,
              noHorizontalScroll:
                doc.scrollWidth <=
                doc.clientWidth,
              overflowingElements:
                overflow
            };
          })()`
        );

        if (
          !layout.noHorizontalScroll ||
          layout.overflowingElements.length > 0
        ) {
          throw new Error(
            JSON.stringify(layout)
          );
        }

        const screenshot =
          await send(
            'Page.captureScreenshot',
            { format: 'png' }
          );

        const screenshotPath = path.resolve(
          'docs/evidence/mobile-360px-details.png'
        );

        fs.writeFileSync(
          screenshotPath,
          Buffer.from(
            screenshot.data,
            'base64'
          )
        );

        return layout;
      }
    );

    await test(
      'Detail keyboard focus behavior',
      async () => {
        const focus = await evaluate(
          `(() => {
            const elements = [
              document.getElementById(
                'backToList'
              ),
              document.getElementById(
                'langToggle'
              ),
              document.getElementById(
                'favoriteButton'
              ),
              document.getElementById(
                'officialSourceLink'
              )
            ];

            const results =
              elements.map(element => {
                element.focus();
                return (
                  document.activeElement ===
                  element
                );
              });

            return {
              results,
              allFocusable:
                results.every(Boolean)
            };
          })()`
        );

        if (!focus.allFocusable) {
          throw new Error(
            JSON.stringify(focus)
          );
        }

        return focus;
      }
    );

    await send(
      'Emulation.setDeviceMetricsOverride',
      {
        width: 1280,
        height: 800,
        deviceScaleFactor: 1,
        mobile: false
      }
    );

    await navigate(
      '/detail.html?id=yop-2027-001&lang=ar'
    );

    await waitForDetail();

    const desktopScreenshot =
      await send(
        'Page.captureScreenshot',
        { format: 'png' }
      );

    fs.writeFileSync(
      path.resolve(
        'docs/evidence/desktop-opportunity-details.png'
      ),
      Buffer.from(
        desktopScreenshot.data,
        'base64'
      )
    );

    console.log('');
    console.log(
      '=========================================='
    );
    console.log(
      'Details & Favorites Verification Results'
    );
    console.log(
      '=========================================='
    );
    console.log('');

    let allPassed = true;

    results.forEach((result, index) => {
      const status = result.passed
        ? '✔ PASS'
        : '✖ FAIL';

      if (!result.passed) {
        allPassed = false;
      }

      console.log(
        `[${index + 1}] ${status}: ${result.name}`
      );

      console.log(
        '    Details:',
        JSON.stringify(result.details)
      );
    });

    console.log('');
    console.log(
      'Browser error/warning count:',
      browserIssues.length
    );

    if (browserIssues.length > 0) {
      console.log(
        'Browser issues:',
        JSON.stringify(browserIssues)
      );

      allPassed = false;
    }

    console.log('');
    console.log(
      'Final Test Verdict:',
      allPassed
        ? 'ALL TESTS PASSED'
        : 'SOME TESTS FAILED'
    );
    console.log('');

    ws.close();
    chrome.kill();

    process.exit(allPassed ? 0 : 1);
  } catch (error) {
    console.error(
      'Detail test suite fatal error:',
      error
    );

    chrome.kill();
    process.exit(1);
  }
}

run();
