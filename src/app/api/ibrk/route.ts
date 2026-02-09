import { NextRequest } from 'next/server';
import { ibrk } from '@/lib/ibrk';
import '@/lib/envConfig'
import axios from 'axios';
import https from 'https';

export async function GET(request: NextRequest) {
  if(ibrk.get_isGWRunning() === false) {
    const res = await ibrk.startGW();
    console.error(res)
  }

  if(ibrk.get_isLoggedIn() == false) {
    const res = await ibrk.login()
    console.error(res)
  }

  const base_url = "https://localhost:5000/v1/api"
  const agent = new https.Agent({
    rejectUnauthorized: false
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

  return Response.json({ex: "test"})
}

