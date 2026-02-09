import { NextRequest } from 'next/server';
import { ibrk } from '@/lib/ibrk';
import { delay } from '@/lib/utils';
import axios from 'axios';
import https from 'https';
import '@/lib/envConfig'

export async function GET(request: NextRequest) {
  if(ibrk.get_isLoggedIn() == false) {
    const res = await ibrk.login()
    console.error(res)
    delay(2000)
  }


  const base_url = "https://localhost:5000/v1/api"
  const agent = new https.Agent({
    rejectUnauthorized: false // WebAPI has self-signed cert
  });
  const resp = await axios.get(base_url + `/iserver/auth/status`, {
    httpsAgent:agent,
    headers :{
      'Accept':'application/json',
      'User-Agent':'Mozilla/5.0',
      'Connection':'keep-alive',
    }
  });
  console.log(resp.data)

  const resp1 = await axios.get(base_url + `/portfolio/${process.env.IBRK_accountId}/summary`, {
    httpsAgent:agent,
    headers :{
      'Accept':'application/json',
      'User-Agent':'Mozilla/5.0',
      'Connection':'keep-alive',
    }
  });
  const pf_summary = resp1.data;

  return Response.json({pf_summary})
}

