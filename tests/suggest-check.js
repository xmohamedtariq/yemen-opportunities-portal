/**
 * Suggest an Opportunity - Automated Browser Verification
 * Zero external packages: Node.js + Chrome DevTools Protocol only.
 */

const fs = require('fs');
const path = require('path');
const cp = require('child_process');

const APP_URL = 'http://127.0.0.1:8080';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const USER_DATA_DIR = path.resolve('scratch-cdp-suggest');
const CDP_PORT = 9226;
const STORAGE_KEY = 'yemen-opportunities:suggestions:v1';

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function run() {
  let beforeDatasetText = '';

  try {
    const pageCheck = await fetch(`${APP_URL}/suggest.html?lang=ar`);
    if (!pageCheck.ok) {
      throw new Error(`Suggest page returned HTTP ${pageCheck.status}`);
    }

    const datasetResponse = await fetch(`${APP_URL}/data/opportunities.json`);
    beforeDatasetText = await datasetResponse.text();

    const parsed = JSON.parse(beforeDatasetText);
    if (!parsed || !Array.isArray(parsed.opportunities)) {
      throw new Error('Production dataset is malformed.');
    }
  } catch (error) {
    console.error('Local application is unavailable or invalid.');
    console.error(error.message);
    process.exit(1);
  }

  const beforeDataset = JSON.parse(beforeDatasetText);
  const expectedDatasetLength = beforeDataset.opportunities.length;

  const chrome = cp.spawn(
    CHROME_PATH,
    [
      '--headless=new',
      `--remote-debugging-port=${CDP_PORT}`,
      '--disable-gpu',
      '--no-sandbox',
      '--window-size=1440,1000',
      `--user-data-dir=${USER_DATA_DIR}`,
      `${APP_URL}/suggest.html?lang=ar`
    ],
    { stdio: 'ignore' }
  );

  await wait(2000);

  try {
    const targetsResponse = await fetch(`http://127.0.0.1:${CDP_PORT}/json`);
    const targets = await targetsResponse.json();
    const pageTarget = targets.find((target) => target.type === 'page');

    if (!pageTarget || !pageTarget.webSocketDebuggerUrl) {
      throw new Error('No Chrome page target found.');
    }

    const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);

    await new Promise((resolve, reject) => {
      ws.onopen = resolve;
      ws.onerror = reject;
    });

    let messageId = 1;
    const pending = new Map();
    const consoleLogs = [];
    const browserExceptions = [];

    ws.addEventListener('message', (event) => {
      const message = JSON.parse(event.data);

      if (message.id && pending.has(message.id)) {
        const { resolve, reject } = pending.get(message.id);
        pending.delete(message.id);

        if (message.error) {
          reject(new Error(message.error.message));
        } else {
          resolve(message.result);
        }
        return;
      }

      if (message.method === 'Runtime.consoleAPICalled') {
        consoleLogs.push({
          type: message.params.type,
          args: message.params.args.map((arg) => arg.value)
        });
      }

      if (message.method === 'Runtime.exceptionThrown') {
        browserExceptions.push(message.params.exceptionDetails);
      }
    });

    function send(method, params = {}) {
      return new Promise((resolve, reject) => {
        const id = messageId++;
        pending.set(id, { resolve, reject });
        ws.send(JSON.stringify({ id, method, params }));
      });
    }

    async function evaluate(expression) {
      const response = await send('Runtime.evaluate', {
        expression,
        returnByValue: true,
        awaitPromise: true
      });

      if (response.exceptionDetails) {
        throw new Error(
          'Browser evaluation failed: ' +
          JSON.stringify(response.exceptionDetails)
        );
      }

      return response.result.value;
    }

    async function navigate(url) {
      await send('Page.navigate', { url });
      await wait(850);
    }

    await send('Page.enable');
    await send('Runtime.enable');
    await send('DOM.enable');
    await wait(850);

    const results = [];

    await evaluate(
      `localStorage.removeItem(${JSON.stringify(STORAGE_KEY)}); true`
    );

    const initial = await evaluate(`(() => ({
      lang: document.documentElement.lang,
      dir: document.documentElement.dir,
      formExists: Boolean(document.getElementById('suggestForm')),
      pendingCount: document.getElementById('pendingCount').textContent.trim()
    }))()`);

    results.push({
      name: 'Suggestion page loads successfully in Arabic RTL',
      passed:
        initial.formExists &&
        initial.lang === 'ar' &&
        initial.dir === 'rtl' &&
        initial.pendingCount === '0',
      details: initial
    });

    const required = await evaluate(`(() => {
      const form = document.getElementById('suggestForm');
      return {
        formValid: form.checkValidity(),
        nameRequired: document.getElementById('submitterName').required,
        titleRequired: document.getElementById('opportunityTitle').required,
        typeRequired: document.getElementById('opportunityType').required,
        organizationRequired: document.getElementById('organization').required,
        sourceRequired: document.getElementById('officialSourceUrl').required
      };
    })()`);

    results.push({
      name: 'Required-field validation works',
      passed:
        required.formValid === false &&
        required.nameRequired &&
        required.titleRequired &&
        required.typeRequired &&
        required.organizationRequired &&
        required.sourceRequired,
      details: required
    });

    const httpRejected = await evaluate(`(() => {
      document.getElementById('submitterName').value = 'Browser Tester';
      document.getElementById('opportunityTitle').value = 'HTTP Test Opportunity';
      document.getElementById('opportunityType').value = 'scholarship';
      document.getElementById('organization').value = 'Official Test Organization';
      document.getElementById('officialSourceUrl').value = 'http://example.org/opportunity';

      document.getElementById('suggestForm').dispatchEvent(
        new Event('submit', { bubbles: true, cancelable: true })
      );

      const saved = JSON.parse(
        localStorage.getItem(${JSON.stringify(STORAGE_KEY)}) || '[]'
      );

      return {
        savedCount: saved.length,
        errorVisible: !document.getElementById('sourceError').hidden,
        errorText: document.getElementById('sourceError').textContent.trim()
      };
    })()`);

    results.push({
      name: 'Non-HTTPS source URLs are rejected',
      passed:
        httpRejected.savedCount === 0 &&
        httpRejected.errorVisible === true &&
        httpRejected.errorText.length > 0,
      details: httpRejected
    });

    const saved = await evaluate(`(() => {
      document.getElementById('submitterName').value = 'Browser Tester';
      document.getElementById('opportunityTitle').value = 'Verified Test Opportunity';
      document.getElementById('opportunityType').value = 'scholarship';
      document.getElementById('organization').value = 'Official Test Organization';
      document.getElementById('officialSourceUrl').value = 'https://example.org/opportunity';
      document.getElementById('reviewerNote').value = 'Automated browser verification.';

      document.getElementById('suggestForm').dispatchEvent(
        new Event('submit', { bubbles: true, cancelable: true })
      );

      const items = JSON.parse(
        localStorage.getItem(${JSON.stringify(STORAGE_KEY)}) || '[]'
      );
      const item = items[0] || null;

      return {
        savedCount: items.length,
        status: item && item.status,
        submitterName: item && item.submitterName,
        title: item && item.opportunityTitle,
        type: item && item.opportunityType,
        organization: item && item.organization,
        source: item && item.officialSourceUrl,
        successVisible: !document.getElementById('successPanel').hidden,
        pendingCount: document.getElementById('pendingCount').textContent.trim(),
        savedName: document.getElementById('savedName').textContent.trim(),
        savedOpportunity:
          document.getElementById('savedOpportunity').textContent.trim()
      };
    })()`);

    results.push({
      name: 'Valid suggestion is stored locally as Pending',
      passed:
        saved.savedCount === 1 &&
        saved.status === 'pending' &&
        saved.submitterName === 'Browser Tester' &&
        saved.title === 'Verified Test Opportunity' &&
        saved.type === 'scholarship' &&
        saved.organization === 'Official Test Organization' &&
        saved.source === 'https://example.org/opportunity' &&
        saved.successVisible === true &&
        saved.pendingCount === '1' &&
        saved.savedName === 'Browser Tester' &&
        saved.savedOpportunity === 'Verified Test Opportunity',
      details: saved
    });

    const desktopScreenshot = await send('Page.captureScreenshot', {
      format: 'png',
      captureBeyondViewport: false
    });

    const desktopPath = path.resolve(
      'docs/evidence/desktop-suggest-opportunity.png'
    );

    fs.writeFileSync(
      desktopPath,
      Buffer.from(desktopScreenshot.data, 'base64')
    );

    console.log('Saved desktop Suggest screenshot to:', desktopPath);

    await navigate(`${APP_URL}/suggest.html?lang=ar`);

    const persistence = await evaluate(`(() => {
      const items = JSON.parse(
        localStorage.getItem(${JSON.stringify(STORAGE_KEY)}) || '[]'
      );

      return {
        savedCount: items.length,
        status: items[0] && items[0].status,
        pendingCount: document.getElementById('pendingCount').textContent.trim()
      };
    })()`);

    results.push({
      name: 'Pending suggestion persists after page reload',
      passed:
        persistence.savedCount === 1 &&
        persistence.status === 'pending' &&
        persistence.pendingCount === '1',
      details: persistence
    });

    await navigate(`${APP_URL}/suggest.html?lang=en`);

    const english = await evaluate(`(() => ({
      lang: document.documentElement.lang,
      dir: document.documentElement.dir,
      languageButton: document.getElementById('langToggle').textContent.trim(),
      opportunitiesHref:
        document.getElementById('opportunitiesNav').getAttribute('href'),
      statisticsHref:
        document.getElementById('statisticsNav').getAttribute('href'),
      aboutHref:
        document.getElementById('aboutNav').getAttribute('href'),
      suggestHref:
        document.getElementById('suggestNav').getAttribute('href')
    }))()`);

    results.push({
      name: 'English renders with lang=en and dir=ltr',
      passed:
        english.lang === 'en' &&
        english.dir === 'ltr' &&
        english.languageButton === 'العربية',
      details: english
    });

    results.push({
      name: 'Navigation preserves the selected language',
      passed:
        english.opportunitiesHref.includes('lang=en') &&
        english.statisticsHref.includes('lang=en') &&
        english.aboutHref.includes('lang=en') &&
        english.suggestHref.includes('lang=en'),
      details: {
        opportunities: english.opportunitiesHref,
        statistics: english.statisticsHref,
        about: english.aboutHref,
        suggest: english.suggestHref
      }
    });

    await navigate(`${APP_URL}/suggest.html?lang=ar`);

    await send('Emulation.setDeviceMetricsOverride', {
      width: 360,
      height: 740,
      deviceScaleFactor: 1,
      mobile: true
    });

    await wait(350);

    const mobile = await evaluate(`(() => {
      const doc = document.documentElement;
      const body = document.body;

      const overflowing = [...document.querySelectorAll('body *')]
        .filter((el) => {
          const style = getComputedStyle(el);

          if (
            style.position === 'fixed' ||
            style.display === 'none' ||
            style.visibility === 'hidden'
          ) {
            return false;
          }

          return el.scrollWidth > el.clientWidth + 1;
        })
        .slice(0, 10)
        .map((el) => ({
          tag: el.tagName,
          id: el.id || '',
          className: typeof el.className === 'string' ? el.className : '',
          scrollW: el.scrollWidth,
          clientW: el.clientWidth
        }));

      return {
        winW: window.innerWidth,
        scrollW: Math.max(doc.scrollWidth, body.scrollWidth),
        clientW: doc.clientWidth,
        noHorizontalScroll:
          Math.max(doc.scrollWidth, body.scrollWidth) <= window.innerWidth + 1,
        overflowingCount: overflowing.length,
        overflowing
      };
    })()`);

    results.push({
      name: '360px viewport has zero horizontal overflow',
      passed:
        mobile.winW === 360 &&
        mobile.noHorizontalScroll === true &&
        mobile.overflowingCount === 0,
      details: mobile
    });

    const mobileScreenshot = await send('Page.captureScreenshot', {
      format: 'png',
      captureBeyondViewport: false
    });

    const mobilePath = path.resolve(
      'docs/evidence/mobile-360px-suggest-opportunity.png'
    );

    fs.writeFileSync(
      mobilePath,
      Buffer.from(mobileScreenshot.data, 'base64')
    );

    console.log('Saved mobile Suggest screenshot to:', mobilePath);

    const keyboard = await evaluate(`(() => {
      const controls = [
        document.getElementById('skipLink'),
        document.getElementById('submitterName'),
        document.getElementById('opportunityType'),
        document.getElementById('officialSourceUrl'),
        document.getElementById('saveSuggestion'),
        document.getElementById('langToggle')
      ];

      const focusResults = controls.map((element) => {
        element.focus();
        return document.activeElement === element;
      });

      return {
        focusResults,
        allFocusable: focusResults.every(Boolean)
      };
    })()`);

    results.push({
      name: 'Keyboard focus works',
      passed: keyboard.allFocusable === true,
      details: keyboard
    });

    const afterDatasetResponse = await fetch(
      `${APP_URL}/data/opportunities.json`
    );
    const afterDatasetText = await afterDatasetResponse.text();
    const afterDataset = JSON.parse(afterDatasetText);

    results.push({
      name: 'Production dataset remains unchanged',
      passed:
        afterDataset.opportunities.length === expectedDatasetLength &&
        afterDatasetText === beforeDatasetText,
      details: {
        beforeLength: expectedDatasetLength,
        afterLength: afterDataset.opportunities.length,
        byteForByteUnchanged: afterDatasetText === beforeDatasetText
      }
    });

    const errorConsoleMessages = consoleLogs.filter(
      (entry) => entry.type === 'error' || entry.type === 'assert'
    );

    results.push({
      name: 'Browser console error count is zero',
      passed:
        errorConsoleMessages.length === 0 &&
        browserExceptions.length === 0,
      details: {
        consoleErrors: errorConsoleMessages.length,
        exceptions: browserExceptions.length
      }
    });

    await evaluate(
      `localStorage.removeItem(${JSON.stringify(STORAGE_KEY)}); true`
    );

    console.log('\n==================================================');
    console.log('Suggest an Opportunity Browser Verification');
    console.log('==================================================\n');

    let allPassed = true;

    results.forEach((result, index) => {
      const status = result.passed ? '✔ PASS' : '✖ FAIL';

      if (!result.passed) {
        allPassed = false;
      }

      console.log(`[${index + 1}] ${status}: ${result.name}`);
      console.log('    Details:', JSON.stringify(result.details));
    });

    console.log(`\nConsole logs count: ${consoleLogs.length}`);
    console.log(`Browser exceptions count: ${browserExceptions.length}`);

    console.log(
      `\nFinal Test Verdict: ${
        allPassed ? 'ALL TESTS PASSED' : 'SOME TESTS FAILED'
      }\n`
    );

    ws.close();
    chrome.kill();
    process.exit(allPassed ? 0 : 1);
  } catch (error) {
    console.error('Suggest browser test fatal error:', error);
    chrome.kill();
    process.exit(1);
  }
}

run();
