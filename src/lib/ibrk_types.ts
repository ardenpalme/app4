export interface IBRKAccount {
  id: string;
  PrepaidCrypto: Record<string, boolean>;
  brokerageAccess: boolean;
  accountId: string;
  accountVan: string;
  accountTitle: string;
  displayName: string;
  accountAlias: string | null;
  accountStatus: number;
  currency: string;
  type: string;
  tradingType: string;
  businessType: string;
  category: string;
  ibEntity: string;
  faclient: boolean;
  clearingStatus: string;
  covestor: boolean;
  noClientTrading: boolean;
  trackVirtualFXPortfolio: boolean;
  acctCustType: string;
  parent: {
    mmc: any[];
    accountId: string;
    isMParent: boolean;
    isMChild: boolean;
    isMultiplex: boolean;
  };
  desc: string;
} 

export interface LongShortHoldings {
  [key: string]: number;
}

export interface CategoryHoldings {
  long: LongShortHoldings;
  short: LongShortHoldings;
}

export interface PortfolioHoldings {
  assetClass: CategoryHoldings;
  sector: CategoryHoldings;
  group: CategoryHoldings;
}

export interface Position {
  acctId: string;
  conid: number;
  contractDesc: string; // e.g., "SPY", "TSLA", etc.
  position: number;
  mktPrice: number;
  mktValue: number;
  currency: string; // e.g., "USD"
  avgCost: number;
  avgPrice: number;
  realizedPnl: number;
  unrealizedPnl: number;
  exchs: any; // Depending on what this data is, you may want to type it further
  expiry: any; // Same as above, can be typed more specifically
  putOrCall: any;
  multiplier: number | null;
  strike: number;
  exerciseStyle: any;
  conExchMap: any[]; // Assuming this is an array of exchange-related data, but you can adjust the type
  assetClass: string; // e.g., "STK"
  undConid: number;
  model: string;
}

export interface Positions {
  [key: string]: Position; // Index signature using contractDesc and assetClass combined or conid as the key
}
