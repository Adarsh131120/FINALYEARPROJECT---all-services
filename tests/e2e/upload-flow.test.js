// tests/e2e/upload-flow.test.js

const puppeteer = require('puppeteer');

describe('File Upload Flow', () => {
  let browser;
  let page;
  
  beforeAll(async () => {
    browser = await puppeteer.launch();
    page = await browser.newPage();
  });
  
  afterAll(async () => {
    await browser.close();
  });
  
  test('Complete upload and analysis flow', async () => {
    // Navigate to app
    await page.goto('http://localhost:3000');
    
    // Upload file
    const fileInput = await page.$('input[type="file"]');
    await fileInput.uploadFile('test-files/test.exe');
    
    // Click analyze button
    await page.click('button[type="submit"]');
    
    // Wait for analysis
    await page.waitForSelector('.result-card', { timeout: 600000 });
    
    // Check results
    const malwareType = await page.$eval('.malware-type', el => el.textContent);
    expect(malwareType).toBeTruthy();
  }, 600000);
});