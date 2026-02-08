import puppeteer from 'puppeteer';

function randomDelay(min: number, max: number) {
    const ms: number = Math.floor(Math.random() * (max - min + 1)) + min;
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function loginToIBKR(username: string, password: string, totp_tok: string) {
  const browser = await puppeteer.launch({
    headless: false, 
    args: [
          '--ignore-certificate-errors',
          '--ignore-certificate-errors-spki-list',
          '--disable-web-security',
          '--disable-features=IsolateOrigins,site-per-process'
      ]
  });
  const page = await browser.newPage();

  // Ignore SSL errors (because of self-signed certificate)
  await page.setBypassCSP(true);
  await page.goto('https://localhost:5000', { waitUntil: 'networkidle2' });

  // Fill in the username and password
  await page.type('input[name="username"]', username);
  await page.type('input[name="password"]', password);
  
  // Click the login button
  await page.click('button[type="submit"]');

  console.log('Waiting for 2FA input...');
  await randomDelay(1500,3000)
  
  try {
    // Wait for the 2FA input field to appear (with timeout)
    await page.waitForSelector('#xyz-field-silver-response', { 
      visible: true, 
      timeout: 10000 // 10 second timeout
    });
    
    console.log('2FA field found, generating TOTP code...');
    
    const navigationPromise = page.waitForNavigation({ waitUntil: 'networkidle2' });
    // Enter the TOTP code
    await page.type('#xyz-field-silver-response', totp_tok);
    
    // Submit the 2FA form (press Enter or find submit button)
    // Option A: Press Enter key
    await page.keyboard.press('Enter');
    
    // Option B: If there's a submit button, click it
    // await page.click('button[type="submit"]');
    
    console.log('Submitted 2FA code, waiting for navigation...');
    await navigationPromise; // Wait for navigation to complete
    
  } catch (error) {
    console.log('No 2FA field found or timed out. Continuing...');
  }

  await randomDelay(4000,5000)

  const cookies = await browser.cookies();
  const currentUrl = page.url();

  await browser.close();

  return { cookies, currentUrl };
}
