/**
 * Statistics Dashboard browser verification.
 * Zero external packages: Node.js + Chrome DevTools Protocol only.
 */

const fs = require('fs');
const path = require('path');
const cp = require('child_process');

const APP_URL = 'http://127.0.0.1:8080';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const USER_DATA_DIR = path.resolve('scratch-cdp');
const CDP_PORT = 9224;

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function run() {
  try {
    const serverCheck = await fetch(`${APP_URL}/statistics.html?lang=ar`);
    if (!serverCheck.ok) {
      throw new Error(`Local server returned HTTP ${serverCheck.status}`);
    }
  } catch (error) {
    console.error(`Local server is not available at ${APP_URL}`);
    console.error('Keep python -m http.server 8080 running first.');
    console.error(error.message);
    process.exit(1);
  }

  const datasetResponse = await fetch(`${APP_URL}/data/opportunities.json`);
  const dataset = await datasetResponse.json();

  if (!dataset || !Array.isArray(dataset.opportunities)) {
    console.error('Production dataset is malformed.');
    process.exit(1);
  }

  const opportunities = dataset.opportunities;

  const expected = {
    total: opportunities.length,
    typeCounts: new Map(),
    categoryCounts: new Map(),
    countryCounts: new Map(),
    fundingCounts: new Map()
  };

  const increment = (map, key) => {
    map.set(key, (map.get(key) || 0) + 1);
  };

  opportunities.forEach((opp) => {
    if (typeof opp.type === 'string' && opp.type.trim()) {
      increment(expected.typeCounts, opp.type.trim());
    }

    const categories = Array.isArray(opp.categories) ? opp.categories : [];
    categories.forEach((category) => {
      if (typeof category === 'string' && category.trim()) {
        increment(expected.categoryCounts, category.trim());
      }
    });

    let countryKey = '__global__';

    if (typeof opp.country === 'string' && opp.country.trim()) {
      countryKey = opp.country.trim();
    } else if (opp.country && typeof opp.country === 'object') {
      if (typeof opp.country.code === 'string' && opp.country.code.trim()) {
        countryKey = opp.country.code.trim();
      } else if (
        opp.country.name &&
        typeof opp.country.name === 'object' &&
        typeof opp.country.name.en === 'string' &&
        opp.country.name.en.trim()
      ) {
        countryKey = opp.country.name.en.trim();
      }
    }

    increment(expected.countryCounts, countryKey);

    const fundingKey =
      typeof opp.fundingType === 'string' && opp.fundingType.trim()
        ? opp.fundingType.trim()
        : '__unspecified__';

    increment(expected.fundingCounts, fundingKey);
  });

  const expectedCategoryAssignments =
    [...expected.categoryCounts.values()].reduce((sum, count) => sum + count, 0);

  const expectedFullyFunded =
    expected.fundingCounts.get('fully-funded') || 0;

  console.log('Launching headless Chrome for Statistics Dashboard verification...');

  const chrome = cp.spawn(
    CHROME_PATH,
    [
      '--headless=new',
      `--remote-debugging-port=${CDP_PORT}`,
      '--disable-gpu',
      '--no-sandbox',
      '--window-size=1440,1000',
      `--user-data-dir=${USER_DATA_DIR}`,
      `${APP_URL}/statistics.html?lang=ar`
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
      await wait(900);
    }

    await send('Page.enable');
    await send('Runtime.enable');
    await send('DOM.enable');

    await wait(1000);

    const results = [];

    const initial = await evaluate(`(() => ({
      total: Number(document.getElementById('totalOpportunities').textContent),
      countries: Number(document.getElementById('countryCount').textContent),
      categories: Number(document.getElementById('categoryCount').textContent),
      fullyFunded: Number(document.getElementById('fullyFundedCount').textContent),
      contentVisible: !document.getElementById('statisticsContent').hidden,
      errorHidden: document.getElementById('statisticsError').hidden,
      lang: document.documentElement.lang,
      dir: document.documentElement.dir
    }))()`);

    results.push({
      name: 'Production dataset loads and total is dynamic',
      passed:
        initial.contentVisible &&
        initial.errorHidden &&
        initial.total === expected.total,
      details: {
        displayedTotal: initial.total,
        datasetLength: expected.total
      }
    });

    results.push({
      name: 'Arabic RTL rendering',
      passed: initial.lang === 'ar' && initial.dir === 'rtl',
      details: {
        lang: initial.lang,
        dir: initial.dir
      }
    });

    const typeStats = await evaluate(`(() => {
      const values = [...document.querySelectorAll(
        '#typeStatistics .statistics-bar-count'
      )].map((el) => Number(el.textContent));

      return {
        groups: values.length,
        sum: values.reduce((a, b) => a + b, 0)
      };
    })()`);

    results.push({
      name: 'Type statistics calculated from production data',
      passed:
        typeStats.groups === expected.typeCounts.size &&
        typeStats.sum === expected.total,
      details: {
        displayedGroups: typeStats.groups,
        expectedGroups: expected.typeCounts.size,
        displayedSum: typeStats.sum,
        expectedSum: expected.total
      }
    });

    const categoryStats = await evaluate(`(() => {
      const values = [...document.querySelectorAll(
        '#categoryStatistics .statistics-bar-count'
      )].map((el) => Number(el.textContent));

      return {
        groups: values.length,
        sum: values.reduce((a, b) => a + b, 0),
        summary: Number(document.getElementById('categoryCount').textContent)
      };
    })()`);

    results.push({
      name: 'Category statistics calculated correctly',
      passed:
        categoryStats.groups === expected.categoryCounts.size &&
        categoryStats.sum === expectedCategoryAssignments &&
        categoryStats.summary === expected.categoryCounts.size,
      details: {
        displayedGroups: categoryStats.groups,
        expectedGroups: expected.categoryCounts.size,
        displayedAssignments: categoryStats.sum,
        expectedAssignments: expectedCategoryAssignments
      }
    });

    const countryStats = await evaluate(`(() => {
      const values = [...document.querySelectorAll(
        '#countryStatistics .statistics-bar-count'
      )].map((el) => Number(el.textContent));

      return {
        groups: values.length,
        sum: values.reduce((a, b) => a + b, 0),
        summary: Number(document.getElementById('countryCount').textContent)
      };
    })()`);

    results.push({
      name: 'Country and global-scope statistics calculated correctly',
      passed:
        countryStats.groups === expected.countryCounts.size &&
        countryStats.sum === expected.total &&
        countryStats.summary === expected.countryCounts.size,
      details: {
        displayedGroups: countryStats.groups,
        expectedGroups: expected.countryCounts.size,
        displayedSum: countryStats.sum,
        expectedSum: expected.total
      }
    });

    const fundingStats = await evaluate(`(() => {
      const values = [...document.querySelectorAll(
        '#fundingStatistics .statistics-bar-count'
      )].map((el) => Number(el.textContent));

      return {
        groups: values.length,
        sum: values.reduce((a, b) => a + b, 0),
        fullyFunded:
          Number(document.getElementById('fullyFundedCount').textContent)
      };
    })()`);

    results.push({
      name: 'Funding statistics calculated correctly',
      passed:
        fundingStats.groups === expected.fundingCounts.size &&
        fundingStats.sum === expected.total &&
        fundingStats.fullyFunded === expectedFullyFunded,
      details: {
        displayedGroups: fundingStats.groups,
        expectedGroups: expected.fundingCounts.size,
        displayedSum: fundingStats.sum,
        expectedSum: expected.total,
        fullyFunded: fundingStats.fullyFunded
      }
    });

    const desktopScreenshot = await send('Page.captureScreenshot', {
      format: 'png',
      captureBeyondViewport: false
    });

    const desktopPath =
      path.resolve('docs/evidence/desktop-statistics-dashboard.png');

    fs.writeFileSync(
      desktopPath,
      Buffer.from(desktopScreenshot.data, 'base64')
    );

    console.log('Saved desktop statistics screenshot to:', desktopPath);

    await navigate(`${APP_URL}/statistics.html?lang=en`);

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
      total: Number(document.getElementById('totalOpportunities').textContent)
    }))()`);

    results.push({
      name: 'English LTR rendering',
      passed:
        english.lang === 'en' &&
        english.dir === 'ltr' &&
        english.languageButton === 'العربية' &&
        english.total === expected.total,
      details: english
    });

    results.push({
      name: 'Navigation preserves selected language',
      passed:
        english.opportunitiesHref.includes('lang=en') &&
        english.statisticsHref.includes('lang=en') &&
        english.aboutHref.includes('lang=en'),
      details: {
        opportunities: english.opportunitiesHref,
        statistics: english.statisticsHref,
        about: english.aboutHref
      }
    });

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
          className:
            typeof el.className === 'string' ? el.className : '',
          scrollW: el.scrollWidth,
          clientW: el.clientWidth
        }));

      return {
        winW: window.innerWidth,
        scrollW: Math.max(doc.scrollWidth, body.scrollWidth),
        clientW: doc.clientWidth,
        noHorizontalScroll:
          Math.max(doc.scrollWidth, body.scrollWidth) <=
          window.innerWidth + 1,
        overflowingCount: overflowing.length,
        overflowing
      };
    })()`);

    results.push({
      name: 'Mobile 360px viewport and zero horizontal overflow',
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

    const mobilePath =
      path.resolve('docs/evidence/mobile-360px-statistics-dashboard.png');

    fs.writeFileSync(
      mobilePath,
      Buffer.from(mobileScreenshot.data, 'base64')
    );

    console.log('Saved mobile statistics screenshot to:', mobilePath);

    const keyboard = await evaluate(`(() => {
      const skip = document.querySelector('.skip-link');
      const opportunities = document.getElementById('opportunitiesNav');
      const statistics = document.getElementById('statisticsNav');
      const about = document.getElementById('aboutNav');
      const language = document.getElementById('langToggle');

      const controls = [skip, opportunities, statistics, about, language];

      const results = controls.map((element) => {
        element.focus();
        return document.activeElement === element;
      });

      return {
        focusResults: results,
        allFocusable: results.every(Boolean)
      };
    })()`);

    results.push({
      name: 'Keyboard focus behavior',
      passed: keyboard.allFocusable === true,
      details: keyboard
    });

    const errorConsoleMessages = consoleLogs.filter(
      (entry) => entry.type === 'error' || entry.type === 'assert'
    );

    results.push({
      name: 'Browser console has zero errors',
      passed:
        errorConsoleMessages.length === 0 &&
        browserExceptions.length === 0,
      details: {
        consoleErrors: errorConsoleMessages.length,
        exceptions: browserExceptions.length
      }
    });

    console.log('\n==================================================');
    console.log('Statistics Dashboard Browser Verification');
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
    console.error('Statistics browser test fatal error:', error);
    chrome.kill();
    process.exit(1);
  }
}

run();