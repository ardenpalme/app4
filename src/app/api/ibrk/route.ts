import { NextRequest } from 'next/server';
import { ibrk } from '@/lib/ibrk';
import '@/lib/envConfig'

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

  // only re-login if necessary (i.e. request fails)
  const saved_rej_status = process.env.NODE_TLS_REJECT_UNAUTHORIZED
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  const res2 = await fetch(base_url + `/portfolio/${process.env.IBRK_accountId}/allocation`, {
    method: 'GET',
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    }
  }); 
  const resp2 = await res2.json();
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = saved_rej_status;

  return Response.json({resp2})
}

