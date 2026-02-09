import { NextRequest } from 'next/server';
import { ibrk } from '@/lib/ibrk';
import axios from 'axios';
import https from 'https';
import '@/lib/envConfig'

export async function GET(request: NextRequest) {
  const base_url = "https://localhost:5000/v1/api"
  const agent = new https.Agent({
    rejectUnauthorized: false // WebAPI has self-signed cert
  });

  if(ibrk.get_isGWRunning() == false) {
    const res = await ibrk.startGW()
    console.log(res)
  }

  if(await ibrk.get_isLoggedIn() == false) {
    const res = await ibrk.login()
    console.log(res)

    const resp = await axios.get(base_url + `/iserver/auth/status`, {
      httpsAgent:agent,
      headers :{
        'Accept':'application/json',
        'User-Agent':'Mozilla/5.0',
        'Connection':'keep-alive',
      }
    });
    console.log(resp.data)
  }

  const resp = await axios.get(base_url + `/portfolio/${process.env.IBRK_accountId}/summary`, {
    httpsAgent:agent,
    headers :{
      'Accept':'application/json',
      'User-Agent':'Mozilla/5.0',
      'Connection':'keep-alive',
    }
  });
  const pf_summary = resp.data;

  return Response.json({pf_summary})
}

