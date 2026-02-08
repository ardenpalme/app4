import { NextRequest } from 'next/server';
import { loginToIBKR } from '@/lib/ibrk';
import { TOTP } from '@otplib/totp';
import { NodeCryptoPlugin } from '@otplib/plugin-crypto-node';
import { ScureBase32Plugin } from '@otplib/plugin-base32-scure';

export async function GET(request: NextRequest) {
  const totp = new TOTP({
    issuer: 'MyApp',
    label: 'user@example.com',
    crypto: new NodeCryptoPlugin(),
    base32: new ScureBase32Plugin(),
  });

  const secret = "LKM42F626IDDFS4BLUFFBTWL55VZN42U";
  const token = await totp.generate({ secret});
  //const isValid = await totp.verify(token, {secret});
  //@assert(isValid)

  const res = await loginToIBKR('gallery4484', 'KKYt&PD8ZezRxz%Ee', token);
  console.error(res)
  return Response.json({res})
}

