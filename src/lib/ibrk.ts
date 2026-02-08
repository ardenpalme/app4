import puppeteer from 'puppeteer';
import { delay } from '@/lib/utils';
import { TOTP } from '@otplib/totp';
import NodeCryptoPlugin from '@otplib/plugin-crypto-node';
import ScureBase32Plugin from '@otplib/plugin-base32-scure';
import '@/lib/envConfig'

function randomDelay(min: number, max: number) {
    const ms: number = Math.floor(Math.random() * (max - min + 1)) + min;
    return delay(ms)
}

interface IBRKCredentials {
  username: string,
  password: string,
  secret: string
}

class IBRKManager {
  isLoggedIn : boolean;
  isGWRunning: boolean;
  creds : IBRKCredentials;
  // TODO: Last login, must re-login every 12h

  constructor(creds : IBRKCredentials) {
    this.creds = creds;
    this.isLoggedIn  = false;
    this.isGWRunning = false;
  }

  get_isLoggedIn() : boolean {
    return this.isLoggedIn
  }

  get_isGWRunning() : boolean {
    return this.isGWRunning;
  }

  async startGW() : Promise<string> {
    let stdout = ''
    let stderr = ''
    const { spawn } = require('node:child_process');
    const child = spawn('./bin/run.sh', ['root/conf.yaml'],{
      cwd:'/home/linux/cli_gw'
    });

    child.stdout.on('data', (data : string) => {
      stdout += data
    })

    child.stderr.on('data', (data : string) => {
      stderr += data
    });

    await delay(1000)

    this.isGWRunning = true;
    return stdout + "\n" + stderr
  }

  async login() : Promise<string> {
    const browser = await puppeteer.launch({
      headless: true, 
      args: [
            '--ignore-certificate-errors',
            '--ignore-certificate-errors-spki-list',
            '--disable-web-security',
            '--disable-features=IsolateOrigins,site-per-process'
        ]
    });
    const page = await browser.newPage();
    await page.setBypassCSP(true);
    await page.goto('https://localhost:5000', { waitUntil: 'networkidle2' });

    await page.type('input[name="username"]', this.creds.username);
    await page.type('input[name="password"]', this.creds.password);
    await page.click('button[type="submit"]');

    await page.waitForSelector('#xyz-field-silver-response', { 
      visible: true, 
      timeout: 10000 
    });

    await randomDelay(150,350)

    const totp = new TOTP({
      issuer: 'MyApp',
      label: 'user@example.com',
      crypto: new NodeCryptoPlugin(),
      base32: new ScureBase32Plugin(),
    });
    const token = await totp.generate({secret : this.creds.secret});

    await page.type('#xyz-field-silver-response', token);
    await page.keyboard.press('Enter');
    await page.waitForNavigation()

    await browser.close();

    this.isLoggedIn = true
    return page.url()
  }
}

const creds : IBRKCredentials = {
    username : process.env.IBRK_username ?? 'X',
    password : process.env.IBRK_password ?? 'Y',
    secret : process.env.IBRK_secret ?? 'Z',
}
export const ibrk= new IBRKManager(creds);

