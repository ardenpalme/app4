import { addHour, addMinute, diffSeconds, format } from "@formkit/tempo";
import OAuth from "oauth-1.0a";
import crypto from 'crypto';
import { XMLParser } from "fast-xml-parser";

type ETRADECredentials = {
  api_key: string,
  api_key_secret: string
}

class ETRADEManager {
  is_authorized : boolean;
  auth_ts : Date;
  reauth_ts : Date;
  creds : ETRADECredentials;
  oauth : OAuth

  constructor(creds: ETRADECredentials) {
    this.creds = creds;
    this.is_authorized = false;
    this.oauth = new OAuth({
      consumer: { 
        key: creds.api_key, 
        secret: creds.api_key_secret
      },
      signature_method: 'HMAC-SHA1',
      hash_function(base_string, key) {
        return crypto.createHmac('sha1', key).update(base_string).digest('base64');
      },
    });
    this.auth_ts = new Date()
    this.reauth_ts = new Date()

    this.auth_ts.setTime(Date.now())
    this.reauth_ts.setTime(Date.now())
  }

  async authenticate() {
    const req_token_url = "https://api.etrade.com/oauth/request_token";
    const oauth_headers = this.oauth.toHeader(this.oauth.authorize({
      url: req_token_url,
      method: "GET",
      data: {
        oauth_callback: "oob"
      }
    }))

    const oauth_resp = await fetch(req_token_url, {
      method: "GET",
      headers: oauth_headers,
    });

    const oauth_resp_text = await oauth_resp.text();
    const params = new URLSearchParams(oauth_resp_text);
    const oauth_token = params.get('oauth_token') ?? ""
    const oauth_token_secret = params.get('oauth_token_secret') ?? ""

    const authorizeUrl = new URL("https://us.etrade.com/e/t/etws/authorize");
    authorizeUrl.searchParams.set("key", process.env.E_TRADE_PROD_API_KEY!);
    authorizeUrl.searchParams.set("token", oauth_token ?? "");

    return {authorizeUrl, oauth_token: oauth_token, oauth_token_secret: oauth_token_secret}
  }

  async access(oauth_verifier : string, oauth_token : string,  oauth_token_secret : string) {
    const access_url = "https://api.etrade.com/oauth/access_token";

    const oauth_headers = this.oauth.toHeader(
      this.oauth.authorize(
        {
          url: access_url,
          method: "GET",
          data: { oauth_verifier },
        },
        {
          key: oauth_token,
          secret: oauth_token_secret,
        }
      )
    );

    const access_resp = await fetch(access_url, {
      method: "GET",
      headers: oauth_headers,
    });

    const text = await access_resp.text();
    const params = new URLSearchParams(text);
    const access_token = params.get("oauth_token") ?? ""
    const access_secret = params.get("oauth_token_secret") ?? ""
    this.auth_ts.setTime(Date.now())
    this.reauth_ts = addHour(this.auth_ts, 2)
    //this.reauth_ts = addMinute(this.auth_ts, 1) // TESTING
    this.is_authorized = true
    console.log(`Authenticated at ${format(this.auth_ts, {time: 'medium'})} must re-authenticate at ${format(this.reauth_ts, {time: 'medium'})}`)

    return {access_token, access_secret}
  }

  async fetch(url : string, access_token : string, access_secret : string) {
    const oauth_headers = this.oauth.toHeader(this.oauth.authorize(
      { url: url, method: "GET"},
      { key: access_token ?? "", secret: access_secret ?? ""}
    ))

    const resp = await fetch(url, {
      method: "GET",
      headers: oauth_headers,
    });

    const xmlData = await resp.text();
    const parser = new XMLParser({ ignoreAttributes: false, parseAttributeValue: true });
    console.log(xmlData)
    return parser.parse(xmlData);
  }
};

const creds : ETRADECredentials = {
  api_key: process.env.E_TRADE_PROD_API_KEY!,
  api_key_secret: process.env.E_TRADE_PROD_API_KEY_SECRET!,
}
export const etrade= new ETRADEManager(creds);
