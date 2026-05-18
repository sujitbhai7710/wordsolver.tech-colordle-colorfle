const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  
  const errors = [];
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
  
  // TEST 1: Colordle calendar - click 5 dates
  console.log('=== FINAL VERIFICATION ===');
  
  await page.goto('http://localhost:4329/colordle-archive/index.html', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  
  let colordlePass = 0;
  const cdDays = await page.locator('.day-clickable').all();
  for (let i = 0; i < Math.min(5, cdDays.length); i++) {
    await cdDays[i].click();
    await page.waitForTimeout(300);
    const rb = await page.locator('.reveal-btn').count();
    if (rb > 0) {
      await page.locator('.reveal-btn').click();
      await page.waitForTimeout(300);
      const rc = await page.locator('.reveal-content').count();
      if (rc > 0) colordlePass++;
    }
  }
  console.log('Colordle calendar: ' + colordlePass + '/5 dates passed');
  
  // TEST 2: Colorfle calendar - click 5 dates
  await page.goto('http://localhost:4329/colorfle-archive/index.html', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  
  let colorflePass = 0;
  const cfDays = await page.locator('.day-clickable').all();
  for (let i = 0; i < Math.min(5, cfDays.length); i++) {
    await cfDays[i].click();
    await page.waitForTimeout(300);
    const rb = await page.locator('.reveal-btn').count();
    if (rb > 0) {
      await page.locator('.reveal-btn').click();
      await page.waitForTimeout(300);
      const rc = await page.locator('.reveal-content').count();
      if (rc > 0) colorflePass++;
    }
  }
  console.log('Colorfle calendar: ' + colorflePass + '/5 dates passed');
  
  // TEST 3: Colordle list view
  await page.goto('http://localhost:4329/colordle-archive/index.html', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await page.locator('.toggle-btn', { hasText: 'List' }).click();
  await page.waitForTimeout(1000);
  
  let cdListPass = 0;
  const cdList = await page.locator('.list-item').all();
  for (let i = 0; i < Math.min(5, cdList.length); i++) {
    await cdList[i].click();
    await page.waitForTimeout(300);
    const rb = await page.locator('.reveal-btn').count();
    if (rb > 0) {
      await page.locator('.reveal-btn').click();
      await page.waitForTimeout(300);
      const rc = await page.locator('.reveal-content').count();
      if (rc > 0) cdListPass++;
    }
  }
  console.log('Colordle list: ' + cdListPass + '/5 dates passed');
  
  // TEST 4: Colorfle list view
  await page.goto('http://localhost:4329/colorfle-archive/index.html', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await page.locator('.toggle-btn', { hasText: 'List' }).click();
  await page.waitForTimeout(1000);
  
  let cfListPass = 0;
  const cfList = await page.locator('.list-item').all();
  for (let i = 0; i < Math.min(5, cfList.length); i++) {
    await cfList[i].click();
    await page.waitForTimeout(300);
    const rb = await page.locator('.reveal-btn').count();
    if (rb > 0) {
      await page.locator('.reveal-btn').click();
      await page.waitForTimeout(300);
      const rc = await page.locator('.reveal-content').count();
      if (rc > 0) cfListPass++;
    }
  }
  console.log('Colorfle list: ' + cfListPass + '/5 dates passed');
  
  // TEST 5: Reveal resets on date change
  await page.goto('http://localhost:4329/colordle-archive/index.html', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  const resetDays = await page.locator('.day-clickable').all();
  let resetWorks = false;
  if (resetDays.length > 1) {
    await resetDays[0].click();
    await page.waitForTimeout(300);
    await page.locator('.reveal-btn').click();
    await page.waitForTimeout(300);
    await resetDays[1].click();
    await page.waitForTimeout(300);
    const resetBtn = await page.locator('.reveal-btn').count();
    const hiddenContent = await page.locator('.reveal-content').count();
    resetWorks = resetBtn > 0 && hiddenContent === 0;
  }
  console.log('Reveal reset on date change: ' + (resetWorks ? 'PASS' : 'FAIL'));
  
  const total = colordlePass + colorflePass + cdListPass + cfListPass + (resetWorks ? 1 : 0);
  const maxTotal = 21;
  console.log('\nFinal score: ' + total + '/' + maxTotal);
  console.log(errors.length > 0 ? 'Errors: ' + errors.join('; ') : 'No console errors');
  
  await browser.close();
  console.log('\n=== FINAL VERIFICATION COMPLETE ===');
})();
