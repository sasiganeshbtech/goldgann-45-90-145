import { ChartPoint, Timeframe, UpiRow } from '../types/app';

export function formatINR(val: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(val);
}

export function fmtNum(n: number | null | undefined, fullPrecision = false): string {
  if (n === null || n === undefined || Number.isNaN(n)) return '—';
  if (fullPrecision) {
    return Number(n)
      .toFixed(6)
      .replace(/\.?0+$/, '');
  }
  return Number(n).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function generateChartSeries(tf: Timeframe, anchorPrice: number): ChartPoint[] {
  const counts: Record<Timeframe, number> = { '1H': 24, '1D': 32, '1W': 28, '1M': 30, '1Y': 36 };
  const vols: Record<Timeframe, number> = { '1H': 15, '1D': 45, '1W': 120, '1M': 240, '1Y': 600 };
  const stepMsMap: Record<Timeframe, number> = {
    '1H': 150000,
    '1D': 2700000,
    '1W': 21600000,
    '1M': 86400000,
    '1Y': 864000000,
  };

  const n = counts[tf];
  const vol = vols[tf];
  const stepMs = stepMsMap[tf];
  const now = Date.now();
  const pts: ChartPoint[] = [];

  let p = anchorPrice - (Math.random() - 0.35) * vol * 2;
  for (let i = 0; i < n - 1; i++) {
    p += (Math.random() - 0.47) * vol;
    p = Math.max(8000, p);
    pts.push({ ts: now - (n - 1 - i) * stepMs, price: +p.toFixed(2) });
  }
  pts.push({ ts: now, price: anchorPrice });
  return pts;
}

export function calcRowUpi(r: UpiRow) {
  const ceH = Number(r.ceH) || 0;
  const ceL = Number(r.ceL) || 0;
  const peH = Number(r.peH) || 0;
  const peL = Number(r.peL) || 0;
  const ceOI = Number(r.ceOI) || 0;
  const peOI = Number(r.peOI) || 0;
  const ceMP = (ceH + ceL) / 2;
  const peMP = (peH + peL) / 2;
  const totalOI = ceOI + peOI;
  const upi = totalOI > 0 ? (ceMP * ceOI + peMP * peOI) / totalOI : 0;
  return { ceMP, peMP, upi };
}

export function exportUpiCsv(rows: UpiRow[]) {
  const headers = ['INSTRUMENT', 'STRIKE', 'CE_HIGH', 'CE_LOW', 'PE_HIGH', 'PE_LOW', 'CE_MP', 'PE_MP', 'CE_OI', 'PE_OI', 'UPI'];
  const lines = [headers.join(',')];
  rows.forEach((r) => {
    const { ceMP, peMP, upi } = calcRowUpi(r);
    lines.push([r.inst, r.strike, r.ceH, r.ceL, r.peH, r.peL, ceMP, peMP, r.ceOI, r.peOI, upi].join(','));
  });
  const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'aurumquant_upi_export.csv';
  a.click();
  URL.revokeObjectURL(url);
}
