import { PfTokResp } from "@/lib/types";

const ADDR_TO_DEC: Record<string, number> = {
  "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48": 6, // USDC
  "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2": 18 // ETH
}

const ADDR_TO_SYM: Record<string, string> = {
  "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48": "USDC",
  "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2": "ETH"
}

// Define the response structure
interface TokenBalance {
  contractAddress: string;
  tokenBalance: string;
}

interface TokenBalanceResult {
  address: string;
  tokenBalances: TokenBalance[];
}

interface AlchemyResponse<Result> {
    jsonrpc: string;
    id: number;
    result: Result;
}

interface TokenMetaData {
  name: string,
  symbol: string,
  decimals: number,
  logo: string
}

type btc_balance_res = {
    final_balance: number,
    n_tx: number,
    total_received : number,
}
type BTCResp = Record<string, btc_balance_res>

export async function GET() {
  const alchemyUrl = 'https://eth-mainnet.g.alchemy.com/v2/4qvjXduqxyINu3Ksfx-2P';
  const address = '0x2be433a6b41b3917086220c7D4386c7181D19942';

  const btc_addr  = 'bc1qarvpt9dldfcey6m86sqzlfgg4vjutlsdehr39k'

  const params = new URLSearchParams({ "active": btc_addr });
  const btc_res  = await fetch(`https://blockchain.info/balance?${params}`);
  const btc_data : BTCResp = await btc_res.json()
  const btc_balance = btc_data[btc_addr].final_balance / 1e8

  // Get ERC-20 tokens
  const res = await fetch(alchemyUrl , {
    method: 'POST',
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    }, 
    body: JSON.stringify({
    id: 1,
    jsonrpc: "2.0",
    method: "alchemy_getTokenBalances",
    params: [
        "0x2be433a6b41b3917086220c7D4386c7181D19942",
        "erc20"
        ]
    })
  });
  const alchemy_data : AlchemyResponse<TokenBalanceResult> = await res.json()

  // Get ETH mainnet token
  const ethRes = await fetch(alchemyUrl, {
      method: 'POST',
      headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
      }, 
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'eth_getBalance',
        params: [address, 'latest']
      })
    });
    
    const ethData = await ethRes.json();
    const ethBalance = parseInt(ethData.result, 16) / 1e18;

  const tok_promises = alchemy_data.result.tokenBalances.map(
    // with async we get an array of promises
    async (e : TokenBalance) => {
      try { 
        const res = await fetch(alchemyUrl, {
          method: 'POST',
          headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
          }, 
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'alchemy_getTokenMetadata',
            params: [e.contractAddress]
          })
        });
        const data : AlchemyResponse<TokenMetaData> = await res.json();
      
        const decimals = data.result.decimals
        const symbol = data.result.symbol
        const logo = data.result.logo
        
        // Convert hex to decimal
        const hexBalance = e.tokenBalance.startsWith('0x') ? e.tokenBalance.slice(2) : e.tokenBalance;
        const balanceBigInt = BigInt('0x' + hexBalance);
        const final_tok_bal = decimals ? Number(balanceBigInt) / 10 ** decimals : 0.0

        if(final_tok_bal > 0) { 
          return {
            symbol: symbol,
            balance: final_tok_bal,
            contractAddress: e.contractAddress,
            error: false,
            logo: logo,
          };
        }else{
          return null
        }
      } catch (error) {
        console.error(`Failed to fetch metadata for token at address ${e.contractAddress}:`, error);
        return {
          symbol: 'UNKNOWN',
          balance: 0.0,
          logo: '',
          contractAddress: e.contractAddress,
          error: true,
        };
      }
    }
  );

  const toks : (PfTokResp | null )[] = await Promise.all(tok_promises) // await all promises in parallel (pipelined time)
  const filteredToks = toks.filter(tok => tok !== null && tok !== undefined);
  const processedData : PfTokResp[] = [
    ...filteredToks,
    {symbol: 'BTC', balance: btc_balance, logo: "https://static.alchemyapi.io/images/assets/1.png", contractAddress: '', error: false},
    {symbol: 'ETH', balance: ethBalance, logo: "/eth-logo.png", contractAddress: '0x4f7A67464B5976d7547c860109e4432d50AfB38e', error: false}
  ];

  return Response.json(processedData)
}
