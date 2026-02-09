import puppeteer from 'puppeteer';
import { delay } from '@/lib/utils';
import { TOTP } from '@otplib/totp';
import NodeCryptoPlugin from '@otplib/plugin-crypto-node';
import ScureBase32Plugin from '@otplib/plugin-base32-scure';
import { addHour, diffSeconds, format } from "@formkit/tempo"
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
  login_ts : Date;
  relogin_ts : Date;
  curr_time : Date;
  // TODO: Last login, must re-login every 12h

  constructor(creds : IBRKCredentials) {
    this.login_ts = new Date()
    this.relogin_ts = new Date()
    this.curr_time = new Date()

    this.creds = creds;
    this.isLoggedIn  = false;
    this.isGWRunning = false;
  }

  async get_isLoggedIn() : Promise<boolean> {
    this.curr_time.setTime(Date.now())
    console.log(`Current time: ${format(this.curr_time,{ date: "full", time: "short"})}`)
    console.log(`Re-login time: ${format(this.relogin_ts,{ date: "full", time: "short"})}`)
    if(this.isLoggedIn && diffSeconds(this.curr_time, this.relogin_ts, 'floor') > 0) {
      await this.startGW()
      return false;
    }
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
      cwd:`/home/${process.env.Hostname}/cli_gw`
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
        ],
      executablePath: '/usr/bin/chromium-browser' 
    });
    const page = await browser.newPage();
    await page.setBypassCSP(true);
    await page.goto('https://localhost:5000', { waitUntil: 'networkidle2' });
    console.log("accessed page")

    await page.type('input[name="username"]', this.creds.username);
    await page.type('input[name="password"]', this.creds.password);
    await page.click('button[type="submit"]');
    console.log("credentials submitted")

    await page.waitForSelector('#xyz-field-silver-response', { 
      visible: true, 
      timeout: 10000 
    });
    console.log("TOTP input field available")

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
    console.log("inputed TOTP")

    await page.waitForNavigation()
    console.log(await browser.cookies())
    console.log(await page.content())
    await browser.close();

    this.login_ts.setTime(Date.now());
    this.relogin_ts = addHour(this.login_ts, 12)
    console.log(`Logged in at ${format(this.login_ts,{ date: "full", time: "short" })}`)
    console.log(`Must login again at ${format(this.relogin_ts,{ date: "full", time: "short" })}`)
    this.isLoggedIn = true

    await randomDelay(800, 1500)

    return page.url()
  }
}

const creds : IBRKCredentials = {
    username : process.env.IBRK_username ?? 'X',
    password : process.env.IBRK_password ?? 'Y',
    secret : process.env.IBRK_secret ?? 'Z',
}
export const ibrk= new IBRKManager(creds);

