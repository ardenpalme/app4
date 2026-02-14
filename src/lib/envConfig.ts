import { loadEnvConfig } from '@next/env'
import { LaunchOptions } from 'puppeteer'

const projectDir = process.cwd()
loadEnvConfig(projectDir)

export const puppeteer_params : LaunchOptions = {
  headless: true,
  args :  [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--ignore-certificate-errors',
    '--ignore-certificate-errors-spki-list',
    '--disable-web-security',
    '--disable-features=IsolateOrigins,site-per-process'
  ],
  //executablePath: '/usr/bin/chromium-browser' 
}

