import { NextRequest } from 'next/server';
import { IBRKCredentials, IBRKManager } from '@/lib/ibrk';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

export async function GET(request: NextRequest) {
  const creds : IBRKCredentials = {
    username : "gallery4484",
    password : "KKYt&PD8ZezRxz%Ee",
    secret : "LKM42F626IDDFS4BLUFFBTWL55VZN42U"
  }

  const ibrk = new IBRKManager(creds);

  if(ibrk.get_isGWRunning() === false) {
    const res = await ibrk.startGW();
    console.error(res)
  }

  if(ibrk.get_isLoggedIn() == false) {
    const res = await ibrk.login()
    console.error(res)
  }

  const base_url = "https://localhost:5000/v1/api"

  const res1 = await fetch(base_url + '/iserver/auth/status', {
    method: 'GET',
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    }
  }); 
  const resp1 = await res1.json();
  console.error(resp1)

  return Response.json({resp1})
}

