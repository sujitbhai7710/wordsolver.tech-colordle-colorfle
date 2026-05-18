const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  
  console.log('=== FULL LIVE DEPLOYMENT TEST ===');
  
  // Test Colordle Archive
  console.log('\n--- Colordle Archive ---');
  await page.goto('https://f6460f7b.wordsolver.pages.dev/colordle-archive', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);
  
  const cdDays = await page.locator('.day-clickable').all();
  console.log('Clickable days: ' + cdDays.length);
  
  let cdPass = 0;
  for (let i = 0; i < Math.min(5, cdDays.length); i++) {
    await cdDays[i].click();
    await page.waitForTimeout(500);
    const rb = await page.locator('.reveal-btn').count();
    if (rb > 0) {
      await page.locator('.reveal-btn').click();
      await page.waitForTimeout(500);
      const rc = await page.locator('.reveal-content').count();
      if (rc > 0) {
        const txt = await page.locator('.reveal-content').textContent();
        console.log('Date ' + i + ': ' + txt.replace(/\s+/g, ' ').substring(0, 80));
        cdPass++;
      }
    }
  }
  console.log('Colordle: ' + cdPass + '/5 passed');
  
  // Test Colorfle Archive
  console.log('\n--- Colorfle Archive ---');
  await page.goto('https://f6460f7b.wordsolver.pages.dev/colorfle-archive', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);
  
  const cfDays = await page.locator('.day-clickable').all();
  console.log('Clickable days: ' + cfDays.length);
  
  let cfPass = 0;
  for (let i = 0; i < Math.min(5, cfDays.length); i++) {
    await cfDays[i].click();
    await page.waitForTimeout(500);
    const rb = await page.locator('.reveal-btn').count();
    if (rb > 0) {
      await page.locator('.reveal-btn').click();
      await page.waitForTimeout(500);
      const rc = await page.locator('.reveal-content').count();
      if (rc > 0) {
        const txt = await page.locator('.reveal-content').textContent();
        console.log('Date ' + i + ': ' + txt.replace(/\s+/g, ' ').substring(0, 80));
        cfPass++;
      }
    }
  }
  console.log('Colorfle: ' + cfPass + '/5 passed');
  
  // Test List View
  console.log('\n--- List View (Colordle) ---');
  await page.goto('https://f6460f7b.wordsolver.pages.dev/colordle-archive', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);
  await page.locator('.toggle-btn', { hasText: 'List' }).click();
  await page.waitForTimeout(1000);
  
  const listItems = await page.locator('.list-item').all();
  console.log('List items: ' + listItems.length);
  
  let listPass = 0;
  for (let i = 0; i < Math.min(3, listItems.length); i++) {
    await listItems[i].click();
    await page.waitForTimeout(500);
    const rb = await page.locator('.reveal-btn').count();
    if (rb > 0) {
      await page.locator('.reveal-btn').click();
      await page.waitForTimeout(500);
      const rc = await page.locator('.reveal-content').count();
      if (rc > 0) listPass++;
    }
  }
  console.log('List view: ' + listPass + '/3 passed');
  
  const total = cdPass + cfPass + listPass;
  console.log('\nTotal: ' + total + '/13');
  console.log(total >= 13 ? 'ALL PASSED!' : 'SOME FAILED');
  
  await browser.close();
  console.log('\n=== DEPLOYMENT TEST COMPLETE ===');
})();
