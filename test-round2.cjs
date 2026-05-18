const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Collect console errors
  const errors = [];
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
  
  console.log('=== ROUND 2: THOROUGH COLORFLE TESTING ===');
  
  await page.goto('http://localhost:4329/colorfle-archive/index.html', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  
  // Test 5 different dates
  const dayCells = await page.locator('.day-clickable').all();
  console.log('Colorfle clickable days: ' + dayCells.length);
  
  let allPassed = true;
  for (let i = 0; i < Math.min(5, dayCells.length); i++) {
    await dayCells[i].click();
    await page.waitForTimeout(500);
    
    const rb = await page.locator('.reveal-btn').count();
    if (rb > 0) {
      await page.locator('.reveal-btn').click();
      await page.waitForTimeout(500);
      const rc = await page.locator('.reveal-content').count();
      if (rc === 0) { allPassed = false; console.log('FAIL: Colorfle date ' + i); }
      else {
        const txt = await page.locator('.reveal-content').textContent();
        console.log('Colorfle date ' + i + ' OK: ' + txt.replace(/\s+/g, ' ').substring(0, 120));
      }
    } else {
      allPassed = false;
      console.log('FAIL: Colorfle date ' + i + ' no reveal button');
    }
  }
  console.log('Colorfle 5 dates: ' + (allPassed ? 'ALL PASSED' : 'SOME FAILED'));
  
  console.log('\n=== TEST: DATE CHANGE RESETS REVEAL ===');
  await page.goto('http://localhost:4329/colordle-archive/index.html', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  
  const days = await page.locator('.day-clickable').all();
  if (days.length > 1) {
    // Click first date, reveal
    await days[0].click();
    await page.waitForTimeout(500);
    await page.locator('.reveal-btn').click();
    await page.waitForTimeout(500);
    let revealed = await page.locator('.reveal-content').count();
    console.log('First date revealed: ' + (revealed > 0));
    
    // Click second date - should reset to reveal button
    await days[1].click();
    await page.waitForTimeout(500);
    let resetBtn = await page.locator('.reveal-btn').count();
    let stillRevealed = await page.locator('.reveal-content').count();
    console.log('Second date shows reveal button: ' + (resetBtn > 0));
    console.log('Second date content hidden: ' + (stillRevealed === 0));
  }
  
  console.log('\n=== TEST: COLORFLE LIST VIEW ===');
  await page.goto('http://localhost:4329/colorfle-archive/index.html', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  
  const listBtn = await page.locator('.toggle-btn', { hasText: 'List' });
  if (await listBtn.count() > 0) {
    await listBtn.click();
    await page.waitForTimeout(1000);
    
    const listItems = await page.locator('.list-item').all();
    console.log('Colorfle list items: ' + listItems.length);
    
    if (listItems.length > 0) {
      await listItems[0].click();
      await page.waitForTimeout(500);
      
      const listReveal = await page.locator('.reveal-btn').count();
      if (listReveal > 0) {
        await page.locator('.reveal-btn').click();
        await page.waitForTimeout(500);
        const listContent = await page.locator('.reveal-content').count();
        console.log('Colorfle list reveal works: ' + (listContent > 0));
        if (listContent > 0) {
          const txt = await page.locator('.reveal-content').textContent();
          console.log('Colorfle list answer: ' + txt.replace(/\s+/g, ' ').substring(0, 120));
        }
      }
    }
  }
  
  console.log('\n=== TEST: COLORFLE 5 DATES IN LIST VIEW ===');
  if (listItems && listItems.length > 4) {
    let listAllPassed = true;
    for (let i = 0; i < Math.min(5, listItems.length); i++) {
      await listItems[i].click();
      await page.waitForTimeout(500);
      
      const rb = await page.locator('.reveal-btn').count();
      if (rb > 0) {
        await page.locator('.reveal-btn').click();
        await page.waitForTimeout(500);
        const rc = await page.locator('.reveal-content').count();
        if (rc === 0) { listAllPassed = false; console.log('FAIL: List date ' + i); }
        else {
          const txt = await page.locator('.reveal-content').textContent();
          console.log('List date ' + i + ' OK: ' + txt.replace(/\s+/g, ' ').substring(0, 100));
        }
      }
    }
    console.log('Colorfle list 5 dates: ' + (listAllPassed ? 'ALL PASSED' : 'SOME FAILED'));
  }
  
  if (errors.length > 0) {
    console.log('\nConsole errors: ' + errors.join('; '));
  } else {
    console.log('\nNo console errors');
  }
  
  await browser.close();
  console.log('\n=== ROUND 2 COMPLETE ===');
})();
