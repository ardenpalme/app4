import puppeteer from 'puppeteer';
import { delay } from '@/lib/utils';
import { TOTP } from '@otplib/totp';
import NodeCryptoPlugin from '@otplib/plugin-crypto-node';
import ScureBase32Plugin from '@otplib/plugin-base32-scure';
import { addHour, diffSeconds, format } from "@formkit/tempo"
import axios from 'axios';
import https, { Agent } from 'https';

import '@/lib/envConfig'
import { puppeteer_params_aws } from '@/lib/envConfig';

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
  agent : Agent;
  gwPID : number | null;
  child : any;
  private intervalId: NodeJS.Timeout | null = null;
  private ping_interval : number = 60000;
  dfl_req_hdrs : Record<string,string> = {
    'Accept':'application/json',
    'User-Agent':'Mozilla/5.0',
    'Connection':'keep-alive',
  }

  constructor(creds : IBRKCredentials) {
    this.login_ts = new Date()
    this.relogin_ts = new Date()
    this.curr_time = new Date()

    this.curr_time.setTime(Date.now());
    this.login_ts.setTime(Date.now());
    this.relogin_ts.setTime(Date.now());
    this.relogin_ts = addHour(this.login_ts, 12)

    this.creds = creds;
    this.isLoggedIn  = false;
    this.isGWRunning = false;
    this.gwPID = null;
    this.child = null;

    this.agent = new https.Agent({
      rejectUnauthorized: false // WebAPI has self-signed cert
    });
  }

  get_isLoggedIn() : boolean {
    //verify that we haven't timed out (12h)
    this.curr_time.setTime(Date.now())
    console.log(`Current time: ${format(this.curr_time,{ date: "full", time: "short"})}`)
    console.log(`Re-login time: ${format(this.relogin_ts,{ date: "full", time: "short"})}`)
    if(this.isLoggedIn && diffSeconds(this.curr_time, this.relogin_ts, 'floor') > 0) {
      this.stopGW()
      this.isLoggedIn = false
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
    this.child = spawn('./bin/run.sh', ['root/conf.yaml'],{
      cwd:`/home/${process.env.Hostname}/cli_gw`
    });

    this.gwPID = this.child.pid;

    this.child.stdout.on('data', (data : string) => {
      stdout += data
    })

    this.child.stderr.on('data', (data : string) => {
      stderr += data
    });

    await delay(1000)

    this.isGWRunning = true;
    return stdout + "\n" + stderr
  }

  // stop pinging the gateway and stop GW process
  stopGW() {
    this.stop_pings()
    if (this.gwPID !== null) {
      try {
        process.kill(this.gwPID); // Send SIGTERM signal
        console.log(`Gateway process with PID ${this.gwPID} has been terminated.`);

        this.isGWRunning = false;
        this.gwPID = null;

      } catch (error) {
        console.error(`Failed to terminate process with PID ${this.gwPID}:`, error);
      }
    }else{
      console.log("No gateway process is currently running.");
    }
  }

  async login() {
    const browser = await puppeteer.launch({
      headless: true, 
      args: [
            '--ignore-certificate-errors',
            '--ignore-certificate-errors-spki-list',
            '--disable-web-security',
            '--disable-features=IsolateOrigins,site-per-process'
        ],
        ...puppeteer_params_aws
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
    //console.log(await browser.cookies())
    const welcome_page = await page.content()
    await browser.close();

    this.login_ts.setTime(Date.now());
    this.relogin_ts.setTime(Date.now());
    this.relogin_ts = addHour(this.login_ts, 12)

    const auth_status = await this.request('GET','/iserver/auth/status',{})

    await randomDelay(800, 1500)

    console.log(`Logged in at ${format(this.login_ts,{ date: "full", time: "short" })}`)
    console.log(`Must login again at ${format(this.relogin_ts,{ date: "full", time: "short" })}`)
    this.isLoggedIn = true

    await this.start_pings()

    return {page_note: welcome_page, auth_status}
  }

  async request(
    method : string, 
    endpt : string, 
    params: Record<any, any>,
    headers : Record<string,string> = this.dfl_req_hdrs, 
  ) {
    const base_url = "https://localhost:5000/v1/api"

    try {
      if(method == 'GET') {
        const resp = await axios.get(base_url + endpt, {
          httpsAgent:this.agent,
          headers
        });
        return resp.data

      /*
       * TODO: POST method is broken, check this out later
       * POST endpoint work if you query them with GET
      */
      }
    } catch(e) {
      console.error(`${base_url}${endpt} failed with ${e}`)
      this.isLoggedIn = false;
      this.isGWRunning = false;
    }
    console.error("Unsupported method: " + method)
    return {}
  }

  async start_pings() {
    const ping = async () => {
      if(this.isLoggedIn && this.isGWRunning) {
        const res = await this.request('GET','/tickle',{}, {'Content-Type':'application/json'})
        //console.log('server keep session ping response: ' + res)
      }
    }
    this.intervalId = setInterval(ping, this.ping_interval);
  }

  stop_pings() {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      console.log('Keep-alive pings stopped.');
    }
  }
}

const creds : IBRKCredentials = {
    username : process.env.IBRK_username ?? 'X',
    password : process.env.IBRK_password ?? 'Y',
    secret : process.env.IBRK_secret ?? 'Z',
}
export const ibrk= new IBRKManager(creds);
