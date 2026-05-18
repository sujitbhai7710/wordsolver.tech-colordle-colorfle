const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  
  console.log('=== TEST 1: COLORDLE ARCHIVE ===');
  
  await page.goto('http://localhost:4329/colordle-archive/index.html', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  
  console.log('Page loaded');
  
  const dayCells = await page.locator('.day-clickable').all();
  console.log('Clickable days: ' + dayCells.length);
  
  if (dayCells.length > 0) {
    await dayCells[0].click();
    await page.waitForTimeout(2000);
    
    const answerSection = await page.locator('#archive-answer').count();
    console.log('Answer section visible: ' + (answerSection > 0));
    
    const revealBtn = await page.locator('.reveal-btn').count();
    console.log('Reveal button visible: ' + (revealBtn > 0));
    
    if (revealBtn > 0) {
      await page.locator('.reveal-btn').click();
      await page.waitForTimeout(2000);
      
      const revealContent = await page.locator('.reveal-content').count();
      console.log('Content visible after reveal: ' + (revealContent > 0));
      
      if (revealContent > 0) {
        const txt = await page.locator('.reveal-content').textContent();
        console.log('Colordle Answer: ' + txt.substring(0, 300));
      }
      
      await page.screenshot({ path: '/home/z/my-project/download/colordle-after-reveal.png', fullPage: false });
    }
  }
  
  console.log('\n=== TEST 2: COLORFLE ARCHIVE ===');
  
  await page.goto('http://localhost:4329/colorfle-archive/index.html', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  
  const dayCells2 = await page.locator('.day-clickable').all();
  console.log('Clickable days: ' + dayCells2.length);
  
  if (dayCells2.length > 0) {
    await dayCells2[0].click();
    await page.waitForTimeout(2000);
    
    const revealBtn2 = await page.locator('.reveal-btn').count();
    console.log('Reveal button visible: ' + (revealBtn2 > 0));
    
    if (revealBtn2 > 0) {
      await page.locator('.reveal-btn').click();
      await page.waitForTimeout(2000);
      
      const content2 = await page.locator('.reveal-content').count();
      console.log('Content visible after reveal: ' + (content2 > 0));
      
      if (content2 > 0) {
        const txt2 = await page.locator('.reveal-content').textContent();
        console.log('Colorfle Answer: ' + txt2.substring(0, 300));
      }
      
      await page.screenshot({ path: '/home/z/my-project/download/colorfle-after-reveal.png', fullPage: false });
    }
  }
  
  console.log('\n=== TEST 3: MULTIPLE DATE CLICKS ===');
  await page.goto('http://localhost:4329/colordle-archive/index.html', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  
  const allDays = await page.locator('.day-clickable').all();
  let allPassed = true;
  for (let i = 0; i < Math.min(5, allDays.length); i++) {
    await allDays[i].click();
    await page.waitForTimeout(500);
    
    const rb = await page.locator('.reveal-btn').count();
    if (rb > 0) {
      await page.locator('.reveal-btn').click();
      await page.waitForTimeout(500);
      const rc = await page.locator('.reveal-content').count();
      if (rc === 0) { allPassed = false; console.log('FAIL: Date ' + i + ' reveal failed'); }
      else {
        const txt = await page.locator('.reveal-content').textContent();
        console.log('Date ' + i + ' OK: ' + txt.substring(0, 100));
      }
    } else {
      allPassed = false;
      console.log('FAIL: Date ' + i + ' no reveal button');
    }
  }
  console.log('All 5 dates tested: ' + (allPassed ? 'ALL PASSED' : 'SOME FAILED'));
  
  await browser.close();
  console.log('\n=== ALL TESTS COMPLETE ===');
  process.exit(0);
})();
