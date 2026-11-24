import {
  BTSTData,
  GoldVaultState,
  PreviousDayData,
  SetsData,
  UpiRow,
} from '../types/app';

export const GST_RATE = 0.03;
export const GOLD_SPREAD = 0.03;

export const DEFAULT_GOLD_STATE: GoldVaultState = {
  walletInr: 100000,
  goldGrams: 2.5,
  investedInr: 31500,
  buyPrice: 12650,
  openPrice: 12580,
  orderSide: 'buy',
  orderUnit: 'inr',
  timeframe: '1D',
  ledgerFilter: 'ALL',
  liveFeed: true,
  transactions: [
    {
      id: 'TXN-1002',
      ts: Date.now() - 86400000,
      type: 'BUY',
      grams: 2.5,
      rate: 12233.01,
      gst: 917.48,
      totalInr: 31500,
    },
    {
      id: 'TXN-1001',
      ts: Date.now() - 86400000 * 2,
      type: 'DEPOSIT',
      grams: 0,
      rate: 0,
      gst: 0,
      totalInr: 131500,
    },
  ],
};

export const DEFAULT_PDM: PreviousDayData = {
  strike: 25300,
  tradeDate: '24/11/2026',
  entryDate: '25/11/2026',
  callHigh: 782.4,
  callLow: 273,
  putHigh: 225,
  putLow: 51,
};

export const DEFAULT_BTST: BTSTData = {
  script: 'NIFTY',
  label: '26th NOV',
  ltp: 25109,
  upi: 67.7,
  b1High: 25310,
  b1Low: 24856.1,
  b2High: 24862,
  b2Low: 24850.85,
};

export const DEFAULT_SETS: SetsData = {
  prevDate: '5/3/2026',
  niftyClose: 24765.9,
  tradeDate: '6/3/2026',
  tradingDate: '21/11/2027',
  rows: [
    { name: '25750 ce', open: 27, high: 145.7, low: 18.05, close: 106.1 },
    { name: '25750 pe', open: 433.2, high: 453.85, low: 90, close: 226.25 },
    { name: '25850 ce', open: 27, high: 119, low: 15, close: 83.45 },
    { name: '25850 pe', open: 419, high: 488, low: 113, close: 141.75 },
  ],
};

export const DEFAULT_UPI_ROWS: UpiRow[] = [
  { inst: 'NIFTY', strike: 24550, ceH: 306.5, ceL: 148.4, peH: 79.9, peL: 158.25, ceOI: 999825, peOI: 1352400 },
  { inst: 'NIFTY', strike: 24750, ceH: 175, ceL: 69.5, peH: 275.4, peL: 127.45, ceOI: 3876375, peOI: 1008450 },
  { inst: 'NIFTY', strike: 24650, ceH: 235, ceL: 103.35, peH: 210.95, peL: 88.1, ceOI: 2617425, peOI: 1311525 },
  { inst: 'NIFTY', strike: 24700, ceH: 203.7, ceL: 85, peH: 241.85, peL: 106.7, ceOI: 7489350, peOI: 3490875 },
  { inst: 'NIFTY', strike: 25000, ceH: 172.95, ceL: 67.15, peH: 168.7, peL: 44.1, ceOI: 4200150, peOI: 7967325 },
  { inst: 'NIFTY', strike: 25200, ceH: 150, ceL: 227.55, peH: 161, peL: 68.85, ceOI: 5335350, peOI: 4660950 },
  { inst: 'NIFTY', strike: 25100, ceH: 51.8, ceL: 21.1, peH: 479, peL: 330, ceOI: 1180475, peOI: 70475 },
  { inst: 'NIFTY', strike: 25000, ceH: 40.75, ceL: 16.2, peH: 521.8, peL: 366.95, ceOI: 5470025, peOI: 1066600 },
  { inst: 'NIFTY', strike: 25050, ceH: 24.75, ceL: 9.85, peH: 614.15, peL: 452.2, ceOI: 2577250, peOI: 260400 },
  { inst: 'NIFTY', strike: 25150, ceH: 22.9, ceL: 6.15, peH: 710, peL: 541, ceOI: 3483350, peOI: 165025 },
  { inst: '', strike: 6300, ceH: 104.7, ceL: 60.75, peH: 190.55, peL: 130.9, ceOI: 119700, peOI: 38200 },
  { inst: '', strike: 9200, ceH: 137.25, ceL: 36.5, peH: 107.95, peL: 44.3, ceOI: 50025, peOI: 80325 },
  { inst: '', strike: 5400, ceH: 39.25, ceL: 13.2, peH: 95.5, peL: 50, ceOI: 15000, peOI: 15900 },
  { inst: '', strike: '', ceH: 64, ceL: 80.8, peH: 62.55, peL: 28.05, ceOI: 8700, peOI: 9000 },
  { inst: '', strike: '', ceH: 119.7, ceL: 91.05, peH: 18, peL: 7, ceOI: 11300, peOI: 10900 },
  { inst: '', strike: 650, ceH: 7, ceL: 2.6, peH: 8.5, peL: 2.95, ceOI: 860000, peOI: 488750 },
  { inst: '', strike: 24150, ceH: 250, ceL: 141, peH: 242, peL: 101, ceOI: 3162750, peOI: 4333200 },
  { inst: '', strike: 24550, ceH: 127, ceL: 46.7, peH: 268.2, peL: 107, ceOI: 4994975, peOI: 1329425 },
  { inst: '', strike: 23800, ceH: 238.4, ceL: 137.35, peH: 240.35, peL: 121.5, ceOI: 4053225, peOI: 4526625 },
  { inst: '', strike: 51300, ceH: 1428.1, ceL: 982.1, peH: 966.6, peL: 504.5, ceOI: 246810, peOI: 233550 },
];
