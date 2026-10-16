/**
 * Automated Browser Verification Engine using Chrome DevTools Protocol (CDP)
 * Zero external packages: Uses Node.js native fetch, WebSocket, and fs.
 */

const fs = require('fs');
const path = require('path');
const cp = require('child_process');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const USER_DATA_DIR = path.resolve('scratch-cdp');

async function run() {
  console.log('Launching headless Chrome with CDP...');
  const chrome = cp.spawn(CHROME_PATH, [
    '--headless=new',
    '--remote-debugging-port=9224',
    '--disable-gpu',
    '--no-sandbox',
    '--user-data-dir=' + USER_DATA_DIR,
    'http://127.0.0.1:8080/'
  ]);

  // Wait for Chrome to initialize
  await new Promise(r => setTimeout(r, 2000));

  try {
    const res = await fetch('http://127.0.0.1:9224/json');
    const targets = await res.json();
    const pageTarget = targets.find(t => t.type === 'page');

    if (!pageTarget || !pageTarget.webSocketDebuggerUrl) {
      throw new Error('No page target found on CDP endpoint.');
    }

    console.log('Connecting to Page WebSocket:', pageTarget.webSocketDebuggerUrl);
    const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);

    await new Promise((resolve, reject) => {
      ws.onopen = resolve;
      ws.onerror = reject;
    });

    let msgId = 1;
    function send(method, params = {}) {
      return new Promise((resolve, reject) => {
        const id = msgId++;
        const onMessage = (evt) => {
          const msg = JSON.parse(evt.data);
          if (msg.id === id) {
            ws.removeEventListener('message', onMessage);
            if (msg.error) reject(new Error(msg.error.message));
            else resolve(msg.result);
          }
        };
        ws.addEventListener('message', onMessage);
        ws.send(JSON.stringify({ id, method, params }));
      });
    }

    // Enable domains
    await send('Page.enable');
    await send('Runtime.enable');
    await send('DOM.enable');

    // Collect console messages
    const consoleLogs = [];
    ws.addEventListener('message', (evt) => {
      const msg = JSON.parse(evt.data);
      if (msg.method === 'Runtime.consoleAPICalled') {
        consoleLogs.push({ type: msg.params.type, args: msg.params.args.map(a => a.value) });
      }
    });

    // Helper: evaluate in browser
    async function evaluate(code) {
      const res = await send('Runtime.evaluate', { expression: code, returnByValue: true, awaitPromise: true });
      if (res.exceptionDetails) {
        throw new Error('Browser Evaluation Exception: ' + JSON.stringify(res.exceptionDetails));
      }
      return res.result.value;
    }

    // Wait for initial load
    await new Promise(r => setTimeout(r, 1500));

    const testResults = [];

    // --- TEST 1: Initial 50-record load ---
    const initialCount = await evaluate(`(() => document.querySelectorAll('.opportunity-card').length)()`);
    const initialText = await evaluate(`(() => document.getElementById('resultsCount').textContent)()`);
    const initialLang = await evaluate(`(() => document.documentElement.lang)()`);
    const initialDir = await evaluate(`(() => document.documentElement.dir)()`);
    testResults.push({
      name: 'Initial 50-record load',
      passed: initialCount === 50 && initialText.includes('50') && initialLang === 'ar' && initialDir === 'rtl',
      details: { count: initialCount, counterText: initialText, lang: initialLang, dir: initialDir }
    });

    // --- TEST 2: Arabic Keyword Search ---
    await evaluate(`(() => {
      const input = document.getElementById('searchInput');
      input.value = 'أكسفورد';
      input.dispatchEvent(new Event('input'));
    })()`);
    await new Promise(r => setTimeout(r, 300));
    const arSearchCount = await evaluate(`(() => document.querySelectorAll('.opportunity-card').length)()`);
    const arSearchTitles = await evaluate(`(() => Array.from(document.querySelectorAll('.card-title')).map(el => el.textContent))()`);
    testResults.push({
      name: 'Arabic keyword search ("أكسفورد")',
      passed: arSearchCount === 3 && arSearchTitles.some(t => t.includes('Oxford') || t.includes('أكسفورد')),
      details: { count: arSearchCount, titles: arSearchTitles }
    });

    // --- TEST 3: Clear Search & English Keyword Search ---
    await evaluate(`(() => {
      const input = document.getElementById('searchInput');
      input.value = 'Erasmus';
      input.dispatchEvent(new Event('input'));
    })()`);
    await new Promise(r => setTimeout(r, 300));
    const enSearchCount = await evaluate(`(() => document.querySelectorAll('.opportunity-card').length)()`);
    const enSearchTitles = await evaluate(`(() => Array.from(document.querySelectorAll('.card-title')).map(el => el.textContent))()`);
    testResults.push({
      name: 'English keyword search ("Erasmus")',
      passed: enSearchCount === 9 && enSearchTitles.every(t => t.includes('Erasmus') || t.includes('Mundus') || t.includes('إيراسموس')),
      details: { count: enSearchCount, sampleTitle: enSearchTitles[0] }
    });

    // --- TEST 4: Type Filter ("internship") ---
    await evaluate(`(() => {
      document.getElementById('searchInput').value = '';
      document.getElementById('searchInput').dispatchEvent(new Event('input'));
      const select = document.getElementById('filterType');
      select.value = 'internship';
      select.dispatchEvent(new Event('change'));
    })()`);
    await new Promise(r => setTimeout(r, 300));
    const typeFilterCount = await evaluate(`(() => document.querySelectorAll('.opportunity-card').length)()`);
    const typeBadges = await evaluate(`(() => Array.from(document.querySelectorAll('.badge-type')).map(b => b.textContent))()`);
    testResults.push({
      name: 'Type filter ("internship")',
      passed: typeFilterCount === 9 && typeBadges.every(b => b === 'تدريب عملي'),
      details: { count: typeFilterCount, badgeSample: typeBadges[0] }
    });

    // --- TEST 5: Combined Search + Filters ---
    await evaluate(`(() => {
      // Reset first
      document.getElementById('resetFiltersBtn').click();

      // Filter type: scholarship
      const typeSelect = document.getElementById('filterType');
      typeSelect.value = 'scholarship';
      typeSelect.dispatchEvent(new Event('change'));

      // Filter country: GB
      const countrySelect = document.getElementById('filterCountry');
      countrySelect.value = 'GB';
      countrySelect.dispatchEvent(new Event('change'));

      // Search: Reach
      const search = document.getElementById('searchInput');
      search.value = 'Reach';
      search.dispatchEvent(new Event('input'));
    })()`);
    await new Promise(r => setTimeout(r, 300));
    const combinedCount = await evaluate(`(() => document.querySelectorAll('.opportunity-card').length)()`);
    const combinedTitle = await evaluate(`(() => document.querySelector('.card-title')?.textContent)()`);
    testResults.push({
      name: 'Combined search + filters (Scholarship + GB + "Reach")',
      passed: combinedCount === 1 && combinedTitle.includes('Reach Oxford'),
      details: { count: combinedCount, title: combinedTitle }
    });

    // --- TEST 6: Reset Filters ---
    await evaluate(`(() => {
      document.getElementById('resetFiltersBtn').click();
    })()`);
    await new Promise(r => setTimeout(r, 300));
    const resetCount = await evaluate(`(() => document.querySelectorAll('.opportunity-card').length)()`);
    const resetSearchVal = await evaluate(`(() => document.getElementById('searchInput').value)()`);
    const resetTypeVal = await evaluate(`(() => document.getElementById('filterType').value)()`);
    testResults.push({
      name: 'Reset filters',
      passed: resetCount === 50 && resetSearchVal === '' && resetTypeVal === 'all',
      details: { count: resetCount, searchInput: resetSearchVal, filterType: resetTypeVal }
    });

    // --- TEST 7: No-results State ---
    await evaluate(`(() => {
      const input = document.getElementById('searchInput');
      input.value = 'xyznonexistentterm999';
      input.dispatchEvent(new Event('input'));
    })()`);
    await new Promise(r => setTimeout(r, 300));
    const noResultsCount = await evaluate(`(() => document.querySelectorAll('.opportunity-card').length)()`);
    const emptyStateHidden = await evaluate(`(() => document.getElementById('emptyState').hidden)()`);
    const emptyStateTitle = await evaluate(`(() => document.getElementById('emptyTitle').textContent)()`);
    testResults.push({
      name: 'No-results empty state',
      passed: noResultsCount === 0 && emptyStateHidden === false && emptyStateTitle.includes('لا توجد نتائج'),
      details: { cardCount: noResultsCount, emptyStateVisible: !emptyStateHidden, title: emptyStateTitle }
    });

    // Reset back to full list
    await evaluate(`(() => {
      document.getElementById('emptyResetBtn').click();
    })()`);
    await new Promise(r => setTimeout(r, 300));

    // --- TEST 8: Language Switch (Arabic -> English -> Arabic) ---
    await evaluate(`(() => {
      document.getElementById('langToggle').click();
    })()`);
    await new Promise(r => setTimeout(r, 300));
    const enLang = await evaluate(`(() => document.documentElement.lang)()`);
    const enDir = await evaluate(`(() => document.documentElement.dir)()`);
    const enCountText = await evaluate(`(() => document.getElementById('resultsCount').textContent)()`);
    const enBtnText = await evaluate(`(() => document.getElementById('langToggle').textContent.trim())()`);
    const enCardTitle = await evaluate(`(() => document.querySelector('.card-title')?.textContent)()`);

    testResults.push({
      name: 'Language switch to English',
      passed: enLang === 'en' && enDir === 'ltr' && enCountText.includes('50 opportunities') && enBtnText === 'Arabic',
      details: { lang: enLang, dir: enDir, counterText: enCountText, langToggleText: enBtnText, firstCardTitle: enCardTitle }
    });

    // Switch back to Arabic
    await evaluate(`(() => {
      document.getElementById('langToggle').click();
    })()`);
    await new Promise(r => setTimeout(r, 300));
    const arRestoredLang = await evaluate(`(() => document.documentElement.lang)()`);
    const arRestoredDir = await evaluate(`(() => document.documentElement.dir)()`);
    testResults.push({
      name: 'Language switch back to Arabic',
      passed: arRestoredLang === 'ar' && arRestoredDir === 'rtl',
      details: { lang: arRestoredLang, dir: arRestoredDir }
    });

    // --- TEST 9: Mobile 360px Viewport & Zero Horizontal Scrolling ---
    await send('Emulation.setDeviceMetricsOverride', {
      width: 360,
      height: 740,
      deviceScaleFactor: 1,
      mobile: true
    });
    await new Promise(r => setTimeout(r, 500));

    const mobileLayout = await evaluate(`(() => {
      const doc = document.documentElement;
      const winW = window.innerWidth;
      const scrollW = doc.scrollWidth;
      const clientW = doc.clientWidth;
      const overflowing = [];
      document.querySelectorAll('*').forEach(el => {
        const rect = el.getBoundingClientRect();
        if (el.scrollWidth > winW || el.offsetWidth > winW || rect.width > winW) {
          overflowing.push({ tag: el.tagName, id: el.id, className: el.className, scrollW: el.scrollWidth, offsetW: el.offsetWidth, rectW: rect.width });
        }
      });
      return { winW, scrollW, clientW, noHorizontalScroll: scrollW <= winW, overflowingCount: overflowing.length, overflowing };
    })()`);

    testResults.push({
      name: 'Mobile 360px viewport & zero horizontal scroll',
      passed: mobileLayout.noHorizontalScroll === true && mobileLayout.overflowingCount === 0,
      details: mobileLayout
    });

    // Capture true 360px screenshot
    const mobileScreenshot = await send('Page.captureScreenshot', { format: 'png' });
    const mobileScreenshotPath = path.resolve('docs/evidence/mobile-360px-view.png');
    fs.writeFileSync(mobileScreenshotPath, Buffer.from(mobileScreenshot.data, 'base64'));
    console.log('Saved 360px screenshot to:', mobileScreenshotPath);

    // --- TEST 10: Desktop Screenshot (1280x800) ---
    await send('Emulation.setDeviceMetricsOverride', {
      width: 1280,
      height: 800,
      deviceScaleFactor: 1,
      mobile: false
    });
    await new Promise(r => setTimeout(r, 500));

    const desktopScreenshot = await send('Page.captureScreenshot', { format: 'png' });
    const desktopScreenshotPath = path.resolve('docs/evidence/desktop-initial-load.png');
    fs.writeFileSync(desktopScreenshotPath, Buffer.from(desktopScreenshot.data, 'base64'));
    console.log('Saved desktop screenshot to:', desktopScreenshotPath);

    // --- TEST 11: Keyboard Focus Behavior ---
    const keyboardTest = await evaluate(`(() => {
      const skipLink = document.getElementById('skipLink');
      const langToggle = document.getElementById('langToggle');
      const searchInput = document.getElementById('searchInput');
      const filterType = document.getElementById('filterType');

      skipLink.focus();
      const f1 = document.activeElement === skipLink;
      langToggle.focus();
      const f2 = document.activeElement === langToggle;
      searchInput.focus();
      const f3 = document.activeElement === searchInput;
      filterType.focus();
      const f4 = document.activeElement === filterType;

      return { f1, f2, f3, f4, allFocusable: f1 && f2 && f3 && f4 };
    })()`);

    testResults.push({
      name: 'Keyboard focus behavior',
      passed: keyboardTest.allFocusable === true,
      details: keyboardTest
    });

    // Print summary
    console.log('\n==================================================');
    console.log('Browser Verification Suite Results');
    console.log('==================================================\n');
    let allPassed = true;
    testResults.forEach((t, i) => {
      const status = t.passed ? '✔ PASS' : '✖ FAIL';
      if (!t.passed) allPassed = false;
      console.log(`[${i + 1}] ${status}: ${t.name}`);
      console.log('    Details:', JSON.stringify(t.details));
    });

    console.log(`\nConsole logs count: ${consoleLogs.length}`);
    if (consoleLogs.length > 0) {
      console.log('Console logs:', consoleLogs);
    }

    console.log(`\nFinal Test Verdict: ${allPassed ? 'ALL TESTS PASSED' : 'SOME TESTS FAILED'}\n`);

    chrome.kill();
    process.exit(allPassed ? 0 : 1);
  } catch (err) {
    console.error('Test Suite Fatal Error:', err);
    chrome.kill();
    process.exit(1);
  }
}

run();
