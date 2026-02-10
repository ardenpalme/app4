import { loadEnvConfig } from '@next/env'
import { PuppeteerError } from 'puppeteer'

const projectDir = process.cwd()
loadEnvConfig(projectDir)

export const puppeteer_params_aws = {
  //executablePath: '/usr/bin/chromium-browser' 
}
