import React, { useMemo, useState } from 'react';
import { Pause, Play, ArrowUpRight, ArrowDownRight, ShieldCheck } from 'lucide-react';
import {
  ChartPoint,
  GoldVaultState,
  LedgerFilter,
  OrderSide,
  OrderUnit,
  Timeframe,
} from '../types/app';
import { GOLD_SPREAD, GST_RATE } from '../data/defaults';
import { formatINR } from '../utils/formatters';

interface GoldVaultViewProps {
  gold: GoldVaultState;
  chartSeries: ChartPoint[];
  onChangeTimeframe: (tf: Timeframe) => void;
  onToggleLiveFeed: () => void;
  onOpenDeposit: () => void;
  onExecuteOrder: (side: OrderSide, unit: OrderUnit, rawAmount: number) => void;
  onRedeemCoin: (grams: number, mintingFee: number) => void;
  onUpdateState: (patch: Partial<GoldVaultState>) => void;
}

const BULLION_IMAGE = '/src/assets/images/gold_bullion_showcase_1795517649952.jpg';

const COIN_CATALOG = [
  { grams: 1, label: '1g Minted Coin', fee: 350 },
  { grams: 2, label: '2g Sovereign Coin', fee: 550 },
  { grams: 5, label: '5g Hallmarked Bar', fee: 950 },
  { grams: 10, label: '10g Vault Bar', fee: 1400 },
];

export const GoldVaultView: React.FC<GoldVaultViewProps> = ({
  gold,
  chartSeries,
  onChangeTimeframe,
  onToggleLiveFeed,
  onOpenDeposit,
  onExecuteOrder,
  onRedeemCoin,
  onUpdateState,
}) => {
  const [amountInput, setAmountInput] = useState<string>('5000');
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const [imgFailed, setImgFailed] = useState(false);

  const sellPrice = +(gold.buyPrice * (1 - GOLD_SPREAD)).toFixed(2);
  const rate22k = gold.buyPrice * 0.9167;
  const currentValue = gold.goldGrams * sellPrice;
  const pnl = currentValue - gold.investedInr;
  const pnlPct = gold.investedInr > 0 ? (pnl / gold.investedInr) * 100 : 0;
  const dayDiffPct = ((gold.buyPrice - gold.openPrice) / gold.openPrice) * 100;

  // Order calculation
  const orderCalc = useMemo(() => {
    const raw = parseFloat(amountInput) || 0;
    if (gold.orderSide === 'buy') {
      if (gold.orderUnit === 'inr') {
        const totalInr = raw;
        const goldValue = totalInr / (1 + GST_RATE);
        const gst = totalInr - goldValue;
        const grams = goldValue / gold.buyPrice;
        return { raw, rate: gold.buyPrice, goldValue, gst, totalInr, grams };
      }
      const grams = raw;
      const goldValue = grams * gold.buyPrice;
      const gst = goldValue * GST_RATE;
      const totalInr = goldValue + gst;
      return { raw, rate: gold.buyPrice, goldValue, gst, totalInr, grams };
    }
    if (gold.orderUnit === 'inr') {
      const totalInr = raw;
      const grams = totalInr / sellPrice;
      return { raw, rate: sellPrice, goldValue: totalInr, gst: 0, totalInr, grams };
    }
    const grams = raw;
    const totalInr = grams * sellPrice;
    return { raw, rate: sellPrice, goldValue: totalInr, gst: 0, totalInr, grams };
  }, [amountInput, gold.orderSide, gold.orderUnit, gold.buyPrice, sellPrice]);

  const orderValidationError = useMemo(() => {
    if (orderCalc.raw <= 0) return null;
    if (orderCalc.totalInr < 100) return 'Minimum order value is ₹100.00.';
    if (gold.orderSide === 'buy' && orderCalc.totalInr > gold.walletInr) {
      return 'Insufficient INR wallet balance. Add INR funds to proceed.';
    }
    if (gold.orderSide === 'sell' && orderCalc.grams > gold.goldGrams + 1e-6) {
      return `Insufficient gold balance (${gold.goldGrams.toFixed(4)} g available).`;
    }
    return null;
  }, [orderCalc, gold.orderSide, gold.walletInr, gold.goldGrams]);

  // SVG Chart Geometry
  const chartGeometry = useMemo(() => {
    const W = 700;
    const H = 220;
    const padY = 18;
    if (!chartSeries.length) {
      return { coords: [], linePath: '', areaPath: '', min: 0, max: 0 };
    }
    const prices = chartSeries.map((d) => d.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const range = max - min || 1;
    const coords = chartSeries.map((d, i) => {
      const x = (i / Math.max(1, chartSeries.length - 1)) * W;
      const y = H - padY - ((d.price - min) / range) * (H - padY * 2);
      return { x, y, ...d };
    });
    const linePath = coords
      .map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`)
      .join(' ');
    const areaPath = `${linePath} L ${W} ${H} L 0 ${H} Z`;
    return { coords, linePath, areaPath, min, max };
  }, [chartSeries]);

  const hoveredPoint = hoverIdx !== null ? chartGeometry.coords[hoverIdx] : null;

  const filteredTransactions = useMemo(() => {
    if (gold.ledgerFilter === 'ALL') return gold.transactions;
    return gold.transactions.filter((t) => t.type === gold.ledgerFilter);
  }, [gold.transactions, gold.ledgerFilter]);

  const quickPresets = useMemo(() => {
    if (gold.orderSide === 'buy') {
      return gold.orderUnit === 'inr'
        ? [
            { label: '₹1,000', val: 1000 },
            { label: '₹5,000', val: 5000 },
            { label: '₹10,000', val: 10000 },
            { label: '₹25,000', val: 25000 },
          ]
        : [
            { label: '0.5 g', val: 0.5 },
            { label: '1 g', val: 1 },
            { label: '5 g', val: 5 },
            { label: '10 g', val: 10 },
          ];
    }
    return [0.25, 0.5, 0.75, 1].map((pct) => ({
      label: pct === 1 ? 'MAX' : `${pct * 100}%`,
      val:
        gold.orderUnit === 'grams'
          ? +(gold.goldGrams * pct).toFixed(4)
          : +(gold.goldGrams * sellPrice * pct).toFixed(2),
    }));
  }, [gold.orderSide, gold.orderUnit, gold.goldGrams, sellPrice]);

  const switchSide = (side: OrderSide) => {
    onUpdateState({ orderSide: side });
    if (side === 'sell' && gold.orderUnit === 'grams') {
      setAmountInput(Math.min(1, gold.goldGrams).toFixed(4));
    }
  };

  const switchUnit = (unit: OrderUnit) => {
    onUpdateState({ orderUnit: unit });
    setAmountInput(unit === 'inr' ? '5000' : '1');
  };

  return (
    <div className="space-y-6">
      {/* Section Header & Quick Wallet Action */}
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <p className="text-xs font-medium text-amber-400">24K · 99.9% Hallmarked Digital Bullion</p>
          <h1 className="mt-1 font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Digital Gold Vault & Execution
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onToggleLiveFeed}
            className="inline-flex min-h-[40px] items-center gap-2 rounded-lg border border-slate-800 bg-[#121722] px-3.5 py-2 text-xs font-medium text-slate-200 transition-colors hover:border-slate-700 cursor-pointer whitespace-nowrap shrink-0"
          >
            {gold.liveFeed ? (
              <Pause className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" />
            ) : (
              <Play className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
            )}
            <span>{gold.liveFeed ? 'Live Market' : 'Market Paused'}</span>
          </button>
          <button
            type="button"
            onClick={onOpenDeposit}
            className="min-h-[40px] rounded-lg border border-amber-400/40 bg-amber-400/10 px-4 py-2 text-xs font-semibold text-amber-300 transition-colors hover:bg-amber-400/20 cursor-pointer whitespace-nowrap shrink-0"
          >
            + Add INR Funds
          </button>
        </div>
      </div>

      {/* 4-Column Portfolio KPI Strip */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-800 bg-[#121722] p-5">
          <div className="text-xs font-medium text-slate-400">Gold Locker · Insured Vault</div>
          <div className="mt-2 font-mono text-2xl font-bold text-white tabular-nums">
            {gold.goldGrams.toFixed(4)} g
          </div>
          <div className="mt-1.5 text-xs text-slate-400">24K 999 Pure Bullion</div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-[#121722] p-5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-slate-400">Current Sell Valuation</span>
            <span
              className={`inline-flex items-center gap-0.5 font-mono text-xs font-semibold tabular-nums ${
                pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {pnl >= 0 ? (
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
              ) : (
                <ArrowDownRight className="h-3.5 w-3.5" aria-hidden="true" />
              )}
              {pnl >= 0 ? '+' : ''}
              {pnlPct.toFixed(2)}%
            </span>
          </div>
          <div className="mt-2 font-mono text-2xl font-bold text-white tabular-nums">
            {formatINR(currentValue)}
          </div>
          <div className="mt-1.5 text-xs text-slate-400 tabular-nums">
            Invested {formatINR(gold.investedInr)} · P&L {pnl >= 0 ? '+' : ''}
            {formatINR(pnl)}
          </div>
        </div>

        <div className="rounded-xl border border-amber-500/30 bg-[#121722] p-5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-amber-300">Live 24K Buy Rate</span>
            <span
              className={`font-mono text-xs font-semibold tabular-nums ${
                dayDiffPct >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {dayDiffPct >= 0 ? 'Gain ' : 'Drop '}
              {Math.abs(dayDiffPct).toFixed(2)}%
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="font-mono text-2xl font-bold text-amber-300 tabular-nums">
              {formatINR(gold.buyPrice)}
            </span>
            <span className="text-xs text-slate-400">/ g</span>
          </div>
          <div className="mt-1.5 text-xs text-slate-400 tabular-nums">
            Sell {formatINR(sellPrice)} · 22K {formatINR(rate22k)}
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-[#121722] p-5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-slate-400">INR Wallet</span>
            <button
              type="button"
              onClick={onOpenDeposit}
              className="text-xs font-semibold text-amber-400 hover:text-amber-300 cursor-pointer"
            >
              Deposit
            </button>
          </div>
          <div className="mt-2 font-mono text-2xl font-bold text-white tabular-nums">
            {formatINR(gold.walletInr)}
          </div>
          <div className="mt-1.5 text-xs text-slate-400">Instant UPI & IMPS settlement</div>
        </div>
      </div>

      {/* Main Trading Workspace: Chart + Execution Panel */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
        {/* Left: Price History Chart & Physical Redemption */}
        <div className="space-y-6 lg:col-span-7">
          <div className="rounded-xl border border-slate-800 bg-[#121722] p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-white">24K Gold Market Trend</h2>
                <p className="mt-0.5 text-xs text-slate-400 tabular-nums">
                  {hoveredPoint ? (
                    <>
                      <span className="font-mono font-semibold text-amber-300">
                        {formatINR(hoveredPoint.price)} / g
                      </span>{' '}
                      ·{' '}
                      {new Date(hoveredPoint.ts).toLocaleString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </>
                  ) : (
                    'Move pointer over chart to inspect historical price ticks'
                  )}
                </p>
              </div>
              <div className="flex items-center gap-1 rounded-lg bg-[#0B0E14] p-1">
                {(['1H', '1D', '1W', '1M', '1Y'] as Timeframe[]).map((tf) => (
                  <button
                    key={tf}
                    type="button"
                    onClick={() => onChangeTimeframe(tf)}
                    className={`min-h-[32px] rounded-md px-2.5 py-1 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      gold.timeframe === tf
                        ? 'bg-[#1E2636] text-amber-300'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative mt-5 h-60 w-full select-none">
              <svg
                className="h-full w-full overflow-visible"
                viewBox="0 0 700 220"
                preserveAspectRatio="none"
                onMouseMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const relX = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                  const idx = Math.round(relX * (chartGeometry.coords.length - 1));
                  setHoverIdx(idx);
                }}
                onMouseLeave={() => setHoverIdx(null)}
              >
                <defs>
                  <linearGradient id="goldAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#EAB308" stopOpacity="0.32" />
                    <stop offset="100%" stopColor="#EAB308" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {[0.25, 0.5, 0.75].map((ratio) => (
                  <line
                    key={ratio}
                    x1="0"
                    y1={ratio * 220}
                    x2="700"
                    y2={ratio * 220}
                    stroke="#1E293B"
                    strokeWidth="1"
                  />
                ))}
                {chartGeometry.areaPath && (
                  <path d={chartGeometry.areaPath} fill="url(#goldAreaGrad)" />
                )}
                {chartGeometry.linePath && (
                  <path
                    d={chartGeometry.linePath}
                    fill="none"
                    stroke="#FACC15"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}
                {hoveredPoint && (
                  <>
                    <line
                      x1={hoveredPoint.x}
                      y1="0"
                      x2={hoveredPoint.x}
                      y2="220"
                      stroke="#64748B"
                      strokeDasharray="4 4"
                      strokeWidth="1"
                    />
                    <circle
                      cx={hoveredPoint.x}
                      cy={hoveredPoint.y}
                      r="5"
                      fill="#FACC15"
                      stroke="#0B0E14"
                      strokeWidth="2"
                    />
                  </>
                )}
              </svg>
              <div className="mt-2 flex justify-between font-mono text-[11px] text-slate-400 tabular-nums">
                <span>Low: {formatINR(chartGeometry.min)} / g</span>
                <span>High: {formatINR(chartGeometry.max)} / g</span>
              </div>
            </div>
          </div>

          {/* Physical Bullion & Coin Redemption */}
          <div className="overflow-hidden rounded-xl border border-slate-800 bg-[#121722]">
            <div className="grid grid-cols-1 sm:grid-cols-12 items-stretch">
              <div className="relative min-h-[160px] sm:col-span-5 bg-[#0B0E14]">
                {!imgFailed ? (
                  <img
                    src={BULLION_IMAGE}
                    alt="24K pure hallmarked gold bars and minted coins on dark slate"
                    referrerPolicy="no-referrer"
                    onError={() => setImgFailed(true)}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-[#1A1F2B] to-[#0B0E14] p-6 text-center">
                    <ShieldCheck className="h-8 w-8 text-amber-400" aria-hidden="true" />
                    <span className="mt-2 text-xs font-semibold text-amber-300">
                      999.9 Mint Certified Bullion
                    </span>
                  </div>
                )}
              </div>
              <div className="p-5 sm:col-span-7 flex flex-col justify-between">
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-sm font-semibold text-white">Physical Coin & Bar Redemption</h3>
                    <span
                      className={`text-xs font-medium tabular-nums ${
                        gold.goldGrams >= 1 ? 'text-emerald-400' : 'text-slate-400'
                      }`}
                    >
                      {gold.goldGrams >= 1
                        ? `Eligible · ${gold.goldGrams.toFixed(2)} g available`
                        : 'Min 1.0000 g required'}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-400">
                    Convert vaulted digital gold into tamper-evident 24K minted coins delivered via insured courier.
                  </p>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2.5">
                  {COIN_CATALOG.map((coin) => (
                    <button
                      key={coin.grams}
                      type="button"
                      onClick={() => onRedeemCoin(coin.grams, coin.fee)}
                      className="min-h-[48px] rounded-lg bg-[#0B0E14] px-3 py-2 text-left transition-colors hover:bg-[#19202F] cursor-pointer"
                    >
                      <div className="text-xs font-semibold text-amber-300">{coin.label}</div>
                      <div className="mt-0.5 font-mono text-[11px] text-slate-400 tabular-nums">
                        Minting ₹{coin.fee.toLocaleString('en-IN')}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Buy & Sell Execution Panel */}
        <div className="rounded-xl border border-slate-800 bg-[#121722] p-5 sm:p-6 lg:col-span-5">
          {/* Buy / Sell Segmented Switch */}
          <div className="grid grid-cols-2 gap-1 rounded-lg bg-[#0B0E14] p-1">
            <button
              type="button"
              onClick={() => switchSide('buy')}
              className={`min-h-[44px] rounded-md py-2.5 text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                gold.orderSide === 'buy'
                  ? 'bg-amber-400 text-slate-950'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Buy Gold
            </button>
            <button
              type="button"
              onClick={() => switchSide('sell')}
              className={`min-h-[44px] rounded-md py-2.5 text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                gold.orderSide === 'sell'
                  ? 'bg-rose-500 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sell Gold
            </button>
          </div>

          {/* Order Mode Unit Switch */}
          <div className="mt-5 flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Order Entry Mode</span>
            <div className="flex items-center gap-1 rounded-lg bg-[#0B0E14] p-1">
              <button
                type="button"
                onClick={() => switchUnit('inr')}
                className={`min-h-[34px] rounded-md px-3 py-1 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  gold.orderUnit === 'inr'
                    ? 'bg-[#1E2636] text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Rupees (₹)
              </button>
              <button
                type="button"
                onClick={() => switchUnit('grams')}
                className={`min-h-[34px] rounded-md px-3 py-1 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  gold.orderUnit === 'grams'
                    ? 'bg-[#1E2636] text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Grams (g)
              </button>
            </div>
          </div>

          {/* Input Box */}
          <div className="mt-4">
            <label htmlFor="gold-order-input" className="block text-xs font-medium text-slate-400">
              {gold.orderSide === 'buy'
                ? gold.orderUnit === 'inr'
                  ? 'Total Payable Amount (incl. 3% GST)'
                  : 'Weight to Purchase (Grams)'
                : gold.orderUnit === 'inr'
                ? 'Target Payout Amount (₹)'
                : 'Weight to Sell (Grams)'}
            </label>
            <div className="relative mt-2">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-mono text-base font-semibold text-slate-400">
                {gold.orderUnit === 'inr' ? '₹' : 'g'}
              </span>
              <input
                id="gold-order-input"
                type="number"
                step="any"
                min="0"
                value={amountInput}
                onChange={(e) => setAmountInput(e.target.value)}
                className="w-full min-h-[52px] rounded-xl border border-slate-700 bg-[#0B0E14] py-3 pl-10 pr-16 font-mono text-xl font-bold text-white tabular-nums outline-none transition-colors focus:border-amber-400"
              />
              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-500">
                {gold.orderUnit === 'inr' ? 'INR' : 'GRAMS'}
              </span>
            </div>
          </div>

          {/* Quick Amount Selectors */}
          <div className="mt-3 grid grid-cols-4 gap-2">
            {quickPresets.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => setAmountInput(String(p.val))}
                className="min-h-[38px] rounded-lg bg-[#0B0E14] py-1.5 font-mono text-xs font-medium text-slate-300 tabular-nums transition-colors hover:bg-[#19202F] hover:text-white cursor-pointer"
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Breakdown Rows (Hairline Dividers, No Nested Card Border) */}
          <div className="mt-6 space-y-3 border-t border-slate-800 pt-4 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>{gold.orderSide === 'buy' ? 'Locked 24K Buy Rate' : 'Locked 24K Sell Rate'}</span>
              <span className="font-mono font-medium text-slate-200 tabular-nums">
                {formatINR(orderCalc.rate)} / g
              </span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>{gold.orderSide === 'buy' ? 'Base Gold Value' : 'Gross Gold Value'}</span>
              <span className="font-mono font-medium text-slate-200 tabular-nums">
                {formatINR(orderCalc.goldValue)}
              </span>
            </div>
            {gold.orderSide === 'buy' && (
              <div className="flex justify-between text-slate-400">
                <span>GST (3.00%)</span>
                <span className="font-mono font-medium text-slate-200 tabular-nums">
                  {formatINR(orderCalc.gst)}
                </span>
              </div>
            )}
            <div className="flex justify-between border-t border-slate-800 pt-3 text-sm font-semibold">
              <span className="text-slate-200">
                {gold.orderSide === 'buy'
                  ? gold.orderUnit === 'inr'
                    ? 'Gold Allocated'
                    : 'Total Payable'
                  : gold.orderUnit === 'inr'
                  ? 'Gold Deducted'
                  : 'Instant INR Payout'}
              </span>
              <span className="font-mono text-amber-300 tabular-nums">
                {gold.orderUnit === 'inr'
                  ? `${orderCalc.grams.toFixed(4)} g`
                  : formatINR(orderCalc.totalInr)}
              </span>
            </div>
          </div>

          {orderValidationError && (
            <p role="alert" className="mt-3 text-xs font-medium text-rose-400">
              {orderValidationError}
            </p>
          )}

          <button
            type="button"
            onClick={() => onExecuteOrder(gold.orderSide, gold.orderUnit, orderCalc.raw)}
            disabled={!!orderValidationError || orderCalc.raw <= 0}
            className={`mt-5 w-full min-h-[48px] rounded-xl py-3 text-sm font-semibold transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 ${
              gold.orderSide === 'buy'
                ? 'bg-amber-400 text-slate-950 hover:bg-amber-300'
                : 'bg-rose-500 text-white hover:bg-rose-400'
            }`}
          >
            {gold.orderSide === 'buy' ? 'Buy 24K Gold Instantly' : 'Sell Gold & Credit INR'}
          </button>

          <p className="mt-3 text-center text-[11px] text-slate-400">
            100% backed by allocated physical 99.9% 24K bullion in insured vaults.
          </p>
        </div>
      </div>

      {/* Transaction History Ledger */}
      <div className="rounded-xl border border-slate-800 bg-[#121722] p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-white">Transaction Ledger</h2>
            <p className="text-xs text-slate-400">
              Auditable history of purchases, sales, wallet deposits, and physical redemptions
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-1 rounded-lg bg-[#0B0E14] p-1">
            {(['ALL', 'BUY', 'SELL', 'DEPOSIT', 'REDEEM'] as LedgerFilter[]).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => onUpdateState({ ledgerFilter: f })}
                className={`min-h-[34px] rounded-md px-3 py-1 text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                  gold.ledgerFilter === f
                    ? 'bg-[#1E2636] text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {f === 'ALL'
                  ? 'All'
                  : f === 'BUY'
                  ? 'Buys'
                  : f === 'SELL'
                  ? 'Sells'
                  : f === 'DEPOSIT'
                  ? 'Deposits'
                  : 'Redeemed'}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="pb-3 font-medium">Date & Reference</th>
                <th className="pb-3 font-medium">Type</th>
                <th className="pb-3 font-medium text-right">Quantity (g)</th>
                <th className="pb-3 font-medium text-right">Rate / g</th>
                <th className="pb-3 font-medium text-right">GST (3%)</th>
                <th className="pb-3 font-medium text-right">Total (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400">
                    No transactions recorded for this filter.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((t) => {
                  const dt = new Date(t.ts).toLocaleString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  });
                  const typeColor =
                    t.type === 'BUY'
                      ? 'text-emerald-400'
                      : t.type === 'SELL'
                      ? 'text-rose-400'
                      : t.type === 'REDEEM'
                      ? 'text-amber-300'
                      : 'text-sky-400';

                  return (
                    <tr key={t.id} className="h-[44px] hover:bg-slate-800/25">
                      <td className="py-2.5 text-slate-200">
                        {dt} <span className="text-slate-500">·</span>{' '}
                        <span className="font-mono text-[11px] text-slate-400">{t.id}</span>
                      </td>
                      <td className={`py-2.5 font-semibold ${typeColor}`}>{t.type}</td>
                      <td className="py-2.5 text-right font-mono text-white tabular-nums">
                        {t.grams > 0 ? `${t.grams.toFixed(4)} g` : '—'}
                      </td>
                      <td className="py-2.5 text-right font-mono text-slate-300 tabular-nums">
                        {t.rate > 0 ? formatINR(t.rate) : '—'}
                      </td>
                      <td className="py-2.5 text-right font-mono text-slate-400 tabular-nums">
                        {t.gst > 0 ? formatINR(t.gst) : '—'}
                      </td>
                      <td className="py-2.5 text-right font-mono font-semibold text-white tabular-nums">
                        {formatINR(t.totalInr)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
