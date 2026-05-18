const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  
  console.log('=== LIVE SITE TEST ===');
  
  // Test Colordle Archive
  console.log('\nTesting colordle archive on live site...');
  await page.goto('https://wordsolver.tech/colordle-archive', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);
  
  const cdDays = await page.locator('.day-clickable').all();
  console.log('Colordle clickable days: ' + cdDays.length);
  
  let cdPass = 0;
  for (let i = 0; i < Math.min(3, cdDays.length); i++) {
    await cdDays[i].click();
    await page.waitForTimeout(500);
    const rb = await page.locator('.reveal-btn').count();
    if (rb > 0) {
      await page.locator('.reveal-btn').click();
      await page.waitForTimeout(500);
      const rc = await page.locator('.reveal-content').count();
      if (rc > 0) {
        const txt = await page.locator('.reveal-content').textContent();
        console.log('Date ' + i + ' OK: ' + txt.replace(/\s+/g, ' ').substring(0, 100));
        cdPass++;
      }
    }
  }
  console.log('Colordle live: ' + cdPass + '/3 passed');
  
  // Test Colorfle Archive
  console.log('\nTesting colorfle archive on live site...');
  await page.goto('https://wordsolver.tech/colorfle-archive', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);
  
  const cfDays = await page.locator('.day-clickable').all();
  console.log('Colorfle clickable days: ' + cfDays.length);
  
  let cfPass = 0;
  for (let i = 0; i < Math.min(3, cfDays.length); i++) {
    await cfDays[i].click();
    await page.waitForTimeout(500);
    const rb = await page.locator('.reveal-btn').count();
    if (rb > 0) {
      await page.locator('.reveal-btn').click();
      await page.waitForTimeout(500);
      const rc = await page.locator('.reveal-content').count();
      if (rc > 0) {
        const txt = await page.locator('.reveal-content').textContent();
        console.log('Date ' + i + ' OK: ' + txt.replace(/\s+/g, ' ').substring(0, 100));
        cfPass++;
      }
    }
  }
  console.log('Colorfle live: ' + cfPass + '/3 passed');
  
  await page.screenshot({ path: '/home/z/my-project/download/live-colorfle-reveal.png', fullPage: false });
  
  await browser.close();
  console.log('\n=== LIVE SITE TEST COMPLETE ===');
})();
