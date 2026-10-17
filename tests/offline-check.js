/**
 * Offline Support - Automated Browser Verification
 * Zero external packages: Node.js + Chrome DevTools Protocol only.
 */

const fs = require('fs');
const path = require('path');
const cp = require('child_process');

const APP_URL = 'http://127.0.0.1:8080';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const USER_DATA_DIR = path.resolve('scratch-cdp-offline');
const CDP_PORT = 9228;

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function removeDirectorySafe(target) {
  try {
    fs.rmSync(target, { recursive: true, force: true });
  } catch (error) {}
}

async function waitForHttp(url, timeoutMs = 8000) {
  const started = Date.now();

  while (Date.now() - started < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.ok) return response;
    } catch (error) {}
    await wait(250);
  }

  throw new Error(`Timed out waiting for ${url}`);
}

async function run() {
  let productionText;
  let productionData;

  try {
    const pageResponse = await waitForHttp(`${APP_URL}/index.html?lang=ar`);
    if (!pageResponse.ok) {
      throw new Error(`Index returned HTTP ${pageResponse.status}`);
    }

    const datasetResponse = await waitForHttp(
      `${APP_URL}/data/opportunities.json`
    );

    productionText = await datasetResponse.text();
    productionData = JSON.parse(productionText);

    if (!productionData || !Array.isArray(productionData.opportunities)) {
      throw new Error('Production dataset is malformed.');
    }
  } catch (error) {
    console.error('Local application is unavailable or invalid.');
    console.error(error.message);
    process.exit(1);
  }

  removeDirectorySafe(USER_DATA_DIR);

  const chrome = cp.spawn(
    CHROME_PATH,
    [
      '--headless=new',
      `--remote-debugging-port=${CDP_PORT}`,
      '--disable-gpu',
      '--no-sandbox',
      '--window-size=1440,1000',
      `--user-data-dir=${USER_DATA_DIR}`,
      `${APP_URL}/index.html?lang=ar`
    ],
    { stdio: 'ignore' }
  );

  let ws;

  try {
    await wait(1800);

    const targetsResponse = await waitForHttp(
      `http://127.0.0.1:${CDP_PORT}/json`
    );
    const targets = await targetsResponse.json();
    const pageTarget = targets.find((target) => target.type === 'page');

    if (!pageTarget || !pageTarget.webSocketDebuggerUrl) {
      throw new Error('No Chrome page target found.');
    }

    ws = new WebSocket(pageTarget.webSocketDebuggerUrl);

    await new Promise((resolve, reject) => {
      ws.onopen = resolve;
      ws.onerror = reject;
    });

    let messageId = 1;
    const pending = new Map();
    const consoleLogs = [];
    const browserExceptions = [];
    const loadingFailures = [];

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

      if (message.method === 'Network.loadingFailed') {
        loadingFailures.push(message.params);
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

    async function navigate(url, delay = 900) {
      await send('Page.navigate', { url });
      await wait(delay);
    }

    await send('Page.enable');
    await send('Runtime.enable');
    await send('Network.enable');
    await send('DOM.enable');
    await wait(800);

    const results = [];

    const serviceWorker = await evaluate(`(async () => {
      if (!('serviceWorker' in navigator)) {
        return {
          supported: false,
          ready: false,
          controller: false,
          state: null
        };
      }

      const registration = await Promise.race([
        navigator.serviceWorker.ready,
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Service Worker ready timeout')), 8000)
        )
      ]);

      if (!navigator.serviceWorker.controller) {
        await new Promise((resolve) => {
          const timer = setTimeout(resolve, 2500);
          navigator.serviceWorker.addEventListener(
            'controllerchange',
            () => {
              clearTimeout(timer);
              resolve();
            },
            { once: true }
          );
        });
      }

      const active =
        registration.active ||
        registration.waiting ||
        registration.installing;

      return {
        supported: true,
        ready: Boolean(registration),
        controller: Boolean(navigator.serviceWorker.controller),
        scope: registration.scope,
        state: active ? active.state : null,
        scriptURL: active ? active.scriptURL : null
      };
    })()`);

    results.push({
      name: 'Service Worker registers and reaches an active state',
      passed:
        serviceWorker.supported === true &&
        serviceWorker.ready === true &&
        serviceWorker.controller === true &&
        serviceWorker.state === 'activated' &&
        String(serviceWorker.scriptURL || '').endsWith('/service-worker.js'),
      details: serviceWorker
    });

    await navigate(`${APP_URL}/index.html?lang=ar`, 1000);

    const onlineControlled = await evaluate(`(() => ({
      controller: Boolean(navigator.serviceWorker.controller),
      lang: document.documentElement.lang,
      dir: document.documentElement.dir,
      bodyLength: document.body.innerText.length
    }))()`);

    results.push({
      name: 'Online first visit is controlled by the Service Worker',
      passed:
        onlineControlled.controller === true &&
        onlineControlled.lang === 'ar' &&
        onlineControlled.dir === 'rtl' &&
        onlineControlled.bodyLength > 100,
      details: onlineControlled
    });

    const cacheState = await evaluate(`(async () => {
      const names = await caches.keys();
      const portalName =
        names.find((name) =>
          name.startsWith('yemen-opportunities-portal-')
        ) || null;

      if (!portalName) {
        return {
          names,
          portalName: null,
          cachedCount: 0,
          required: {}
        };
      }

      const cache = await caches.open(portalName);
      const requests = await cache.keys();
      const urls = requests.map((request) => request.url);

      const requiredPaths = [
        '/index.html',
        '/detail.html',
        '/about.html',
        '/statistics.html',
        '/suggest.html',
        '/css/styles.css',
        '/css/product-polish.css',
        '/js/list.js',
        '/js/detail.js',
        '/js/statistics.js',
        '/js/suggest.js',
        '/js/offline.js',
        '/data/opportunities.json',
        '/assets/images/yemen-opportunities-logo.png'
      ];

      const required = Object.fromEntries(
        requiredPaths.map((item) => [
          item,
          urls.some((url) => new URL(url).pathname.endsWith(item))
        ])
      );

      return {
        names,
        portalName,
        cachedCount: urls.length,
        required
      };
    })()`);

    results.push({
      name: 'Essential portal resources are cached',
      passed:
        Boolean(cacheState.portalName) &&
        Object.values(cacheState.required || {}).every(Boolean),
      details: cacheState
    });

    await send('Network.emulateNetworkConditions', {
      offline: true,
      latency: 0,
      downloadThroughput: 0,
      uploadThroughput: 0,
      connectionType: 'none'
    });

    await wait(250);
    await navigate(`${APP_URL}/index.html?lang=ar`, 1100);

    const offlineIndex = await evaluate(`(async () => {
      let datasetLength = null;
      let fetchOk = false;

      try {
        const response = await fetch('data/opportunities.json');
        const data = await response.json();
        datasetLength = Array.isArray(data.opportunities)
          ? data.opportunities.length
          : null;
        fetchOk = response.ok;
      } catch (error) {
        fetchOk = false;
      }

      return {
        controller: Boolean(navigator.serviceWorker.controller),
        lang: document.documentElement.lang,
        dir: document.documentElement.dir,
        title: document.title,
        bodyLength: document.body.innerText.length,
        datasetFetchOk: fetchOk,
        datasetLength
      };
    })()`);

    results.push({
      name: 'Index reloads successfully with the network disabled',
      passed:
        offlineIndex.controller === true &&
        offlineIndex.lang === 'ar' &&
        offlineIndex.dir === 'rtl' &&
        offlineIndex.bodyLength > 100 &&
        offlineIndex.datasetFetchOk === true &&
        offlineIndex.datasetLength === productionData.opportunities.length,
      details: offlineIndex
    });

    const searchOffline = await evaluate(`(() => {
      const input =
        document.querySelector('input[type="search"]') ||
        document.querySelector('#searchInput') ||
        document.querySelector('[id*="search" i]') ||
        document.querySelector('[name*="search" i]');

      if (!input) {
        return {
          found: false,
          value: null,
          bodyLength: document.body.innerText.length
        };
      }

      input.focus();
      input.value = 'Oxford';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));

      return {
        found: true,
        value: input.value,
        bodyContainsOxford: document.body.innerText
          .toLowerCase()
          .includes('oxford'),
        bodyLength: document.body.innerText.length
      };
    })()`);

    results.push({
      name: 'Search remains interactive offline',
      passed:
        searchOffline.found === true &&
        searchOffline.value === 'Oxford' &&
        searchOffline.bodyLength > 100,
      details: searchOffline
    });

    const firstId =
      productionData.opportunities[0] &&
      productionData.opportunities[0].id;

    if (!firstId) {
      throw new Error('Production dataset has no first opportunity ID.');
    }

    await navigate(
      `${APP_URL}/detail.html?id=${encodeURIComponent(firstId)}&lang=ar`,
      1000
    );

    const offlineDetails = await evaluate(`(() => ({
      controller: Boolean(navigator.serviceWorker.controller),
      lang: document.documentElement.lang,
      dir: document.documentElement.dir,
      bodyLength: document.body.innerText.length,
      currentUrl: location.href,
      hasErrorText:
        /not found|غير موجود|تعذر تحميل/i.test(document.body.innerText)
    }))()`);

    results.push({
      name: 'Opportunity details load offline',
      passed:
        offlineDetails.controller === true &&
        offlineDetails.lang === 'ar' &&
        offlineDetails.dir === 'rtl' &&
        offlineDetails.bodyLength > 100 &&
        offlineDetails.hasErrorText === false,
      details: offlineDetails
    });

    await navigate(`${APP_URL}/about.html?lang=ar`, 850);

    const offlineAbout = await evaluate(`(() => ({
      controller: Boolean(navigator.serviceWorker.controller),
      lang: document.documentElement.lang,
      dir: document.documentElement.dir,
      bodyLength: document.body.innerText.length
    }))()`);

    results.push({
      name: 'About page loads offline',
      passed:
        offlineAbout.controller === true &&
        offlineAbout.lang === 'ar' &&
        offlineAbout.dir === 'rtl' &&
        offlineAbout.bodyLength > 100,
      details: offlineAbout
    });

    await navigate(`${APP_URL}/statistics.html?lang=ar`, 1100);

    const offlineStatistics = await evaluate(`(() => ({
      controller: Boolean(navigator.serviceWorker.controller),
      lang: document.documentElement.lang,
      dir: document.documentElement.dir,
      total:
        document.getElementById('totalOpportunities')?.textContent.trim() || '',
      bodyLength: document.body.innerText.length
    }))()`);

    results.push({
      name: 'Statistics dashboard calculates from cached data offline',
      passed:
        offlineStatistics.controller === true &&
        offlineStatistics.lang === 'ar' &&
        offlineStatistics.dir === 'rtl' &&
        offlineStatistics.total === String(productionData.opportunities.length),
      details: offlineStatistics
    });

    await navigate(`${APP_URL}/suggest.html?lang=ar`, 850);

    const offlineSuggest = await evaluate(`(() => ({
      controller: Boolean(navigator.serviceWorker.controller),
      lang: document.documentElement.lang,
      dir: document.documentElement.dir,
      formExists: Boolean(document.getElementById('suggestForm')),
      pendingCount:
        document.getElementById('pendingCount')?.textContent.trim() || null
    }))()`);

    results.push({
      name: 'Suggest page remains available offline',
      passed:
        offlineSuggest.controller === true &&
        offlineSuggest.lang === 'ar' &&
        offlineSuggest.dir === 'rtl' &&
        offlineSuggest.formExists === true,
      details: offlineSuggest
    });

    await navigate(`${APP_URL}/index.html?lang=en`, 1050);

    const offlineEnglish = await evaluate(`(() => ({
      controller: Boolean(navigator.serviceWorker.controller),
      lang: document.documentElement.lang,
      dir: document.documentElement.dir,
      bodyLength: document.body.innerText.length
    }))()`);

    results.push({
      name: 'English LTR mode works offline',
      passed:
        offlineEnglish.controller === true &&
        offlineEnglish.lang === 'en' &&
        offlineEnglish.dir === 'ltr' &&
        offlineEnglish.bodyLength > 100,
      details: offlineEnglish
    });

    await send('Emulation.setDeviceMetricsOverride', {
      width: 360,
      height: 740,
      deviceScaleFactor: 1,
      mobile: true
    });

    await navigate(`${APP_URL}/index.html?lang=ar`, 950);

    const mobileOffline = await evaluate(`(() => {
      const doc = document.documentElement;
      const body = document.body;

      const overflowing = [...document.querySelectorAll('body *')]
        .filter((element) => {
          const style = getComputedStyle(element);

          if (
            style.position === 'fixed' ||
            style.display === 'none' ||
            style.visibility === 'hidden'
          ) {
            return false;
          }

          if (element.closest('.sr-only, .visually-hidden')) {
            return false;
          }

          return element.scrollWidth > element.clientWidth + 1;
        })
        .slice(0, 10)
        .map((element) => ({
          tag: element.tagName,
          id: element.id || '',
          className:
            typeof element.className === 'string'
              ? element.className
              : '',
          scrollW: element.scrollWidth,
          clientW: element.clientWidth
        }));

      return {
        controller: Boolean(navigator.serviceWorker.controller),
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
      name: 'Offline mobile 360px has zero horizontal overflow',
      passed:
        mobileOffline.controller === true &&
        mobileOffline.winW === 360 &&
        mobileOffline.noHorizontalScroll === true &&
        mobileOffline.overflowingCount === 0,
      details: mobileOffline
    });

    const mobileScreenshot = await send('Page.captureScreenshot', {
      format: 'png',
      captureBeyondViewport: false
    });

    fs.writeFileSync(
      path.resolve('docs/evidence/mobile-360px-offline.png'),
      Buffer.from(mobileScreenshot.data, 'base64')
    );

    await send('Emulation.clearDeviceMetricsOverride');
    await navigate(`${APP_URL}/index.html?lang=ar`, 900);

    const desktopScreenshot = await send('Page.captureScreenshot', {
      format: 'png',
      captureBeyondViewport: false
    });

    fs.writeFileSync(
      path.resolve('docs/evidence/desktop-offline.png'),
      Buffer.from(desktopScreenshot.data, 'base64')
    );

    const consoleErrors = consoleLogs.filter(
      (entry) => entry.type === 'error' || entry.type === 'assert'
    );

    results.push({
      name: 'Browser has zero unexpected console errors/exceptions',
      passed:
        consoleErrors.length === 0 &&
        browserExceptions.length === 0,
      details: {
        consoleErrors: consoleErrors.length,
        exceptions: browserExceptions.length,
        loadingFailuresObserved: loadingFailures.length
      }
    });

    await send('Network.emulateNetworkConditions', {
      offline: false,
      latency: 0,
      downloadThroughput: -1,
      uploadThroughput: -1
    });

    console.log('\n==================================================');
    console.log('Offline Support Browser Verification');
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
    console.log(`Network loading failures observed: ${loadingFailures.length}`);

    console.log(
      `\nFinal Test Verdict: ${
        allPassed ? 'ALL TESTS PASSED' : 'SOME TESTS FAILED'
      }\n`
    );

    if (ws) ws.close();
    chrome.kill();

    process.exit(allPassed ? 0 : 1);
  } catch (error) {
    console.error('Offline browser test fatal error:', error);

    try {
      if (ws) ws.close();
    } catch (closeError) {}

    chrome.kill();
    process.exit(1);
  }
}

run();
