const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Check the new deployment URL
  console.log('Testing deployment URL...');
  await page.goto('https://f6460f7b.wordsolver.pages.dev/colordle-archive', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(5000);
  
  // Get all button elements
  const allBtns = await page.locator('button').count();
  console.log('All buttons: ' + allBtns);
  
  const dayCells = await page.locator('.day-clickable').count();
  console.log('Day cells: ' + dayCells);
  
  const calendarCard = await page.locator('.calendar-card').count();
  console.log('Calendar card: ' + calendarCard);
  
  // Check if Svelte component rendered
  const archiveCal = await page.locator('.archive-calendar').count();
  console.log('Archive calendar: ' + archiveCal);
  
  // Get page content to see what rendered
  const body = await page.evaluate(() => document.body.innerHTML.substring(0, 5000));
  console.log('Body HTML (first 5000 chars): ' + body.substring(0, 3000));
  
  await page.screenshot({ path: '/home/z/my-project/download/deploy-colordle.png', fullPage: false });
  
  await browser.close();
})();
