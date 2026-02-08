import puppeteer from 'puppeteer';

export async function loginToIBKR(username: string, password: string) {
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

  // Wait for navigation to complete
  await page.waitForNavigation({ waitUntil: 'networkidle2' });

  // Now, you are logged in. You can get the cookies or the session.
  const cookies = await page.cookies();

  // You can also get the current URL to check if login was successful.
  const currentUrl = page.url();

  // Do something with the cookies, for example, extract the session cookie.
  const sessionCookie = cookies.find(cookie => cookie.name === 'session'); // adjust the cookie name as per IBKR

  // Close the browser
  await browser.close();

  return { cookies, currentUrl };
}
