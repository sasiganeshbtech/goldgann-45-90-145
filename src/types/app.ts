export type AppTab = 'gold' | 'pdm' | 'btst' | 'sets' | 'upi';

export type Timeframe = '1H' | '1D' | '1W' | '1M' | '1Y';
export type OrderSide = 'buy' | 'sell';
export type OrderUnit = 'inr' | 'grams';
export type LedgerFilter = 'ALL' | 'BUY' | 'SELL' | 'DEPOSIT' | 'REDEEM';

export interface GoldTransaction {
  id: string;
  ts: number;
  type: 'BUY' | 'SELL' | 'DEPOSIT' | 'REDEEM';
  grams: number;
  rate: number;
  gst: number;
  totalInr: number;
}

export interface GoldVaultState {
  walletInr: number;
  goldGrams: number;
  investedInr: number;
  buyPrice: number;
  openPrice: number;
  orderSide: OrderSide;
  orderUnit: OrderUnit;
  timeframe: Timeframe;
  ledgerFilter: LedgerFilter;
  liveFeed: boolean;
  transactions: GoldTransaction[];
}

export interface ChartPoint {
  ts: number;
  price: number;
}

export interface PreviousDayData {
  strike: number;
  tradeDate: string;
  entryDate: string;
  callHigh: number;
  callLow: number;
  putHigh: number;
  putLow: number;
}

export interface BTSTData {
  script: string;
  label: string;
  ltp: number;
  upi: number;
  b1High: number;
  b1Low: number;
  b2High: number;
  b2Low: number;
}

export interface SetRow {
  name: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface SetsData {
  prevDate: string;
  niftyClose: number;
  tradeDate: string;
  tradingDate: string;
  rows: SetRow[];
}

export interface UpiRow {
  inst: string;
  strike: number | '';
  ceH: number;
  ceL: number;
  peH: number;
  peL: number;
  ceOI: number;
  peOI: number;
}

export interface SavedSnapshot {
  id: number;
  ts: string;
  label: string;
  icp: number;
  btstLtp: number;
  btstUpi: number;
  goldGrams: number;
  snapshot: {
    pdm: PreviousDayData;
    btst: BTSTData;
    sets: SetsData;
    upiRows: UpiRow[];
  };
}
