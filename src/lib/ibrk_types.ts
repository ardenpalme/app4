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
