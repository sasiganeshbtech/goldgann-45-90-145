import { useEffect, useState } from 'react';
import {
  Calculator,
  Coins,
  Layers,
  TrendingUp,
  X,
  Zap,
} from 'lucide-react';
import {
  AppTab,
  BTSTData,
  ChartPoint,
  GoldVaultState,
  OrderSide,
  OrderUnit,
  PreviousDayData,
  SavedSnapshot,
  SetsData,
  Timeframe,
  UpiRow,
} from './types/app';
import {
  DEFAULT_BTST,
  DEFAULT_GOLD_STATE,
  DEFAULT_PDM,
  DEFAULT_SETS,
  DEFAULT_UPI_ROWS,
  GOLD_SPREAD,
  GST_RATE,
} from './data/defaults';
import { formatINR, generateChartSeries } from './utils/formatters';
import { PWAInstallButton } from './components/PWAInstallButton';
import { OfflineIndicator } from './components/OfflineIndicator';
import { GoldVaultView } from './components/GoldVaultView';
import {
  BTSTView,
  FourSetsView,
  PrevDayView,
  QuantToolbar,
  UpiEntriesView,
} from './components/QuantSuiteViews';

const STORAGE_KEY = 'aurumquant_state_v1';

interface PersistedState {
  activeTab: AppTab;
  fullPrecision: boolean;
  gold: GoldVaultState;
  pdm: PreviousDayData;
  btst: BTSTData;
  sets: SetsData;
  upiRows: UpiRow[];
  snapshots: SavedSnapshot[];
}

function loadInitialState(): PersistedState {
  const fallback: PersistedState = {
    activeTab: 'gold',
    fullPrecision: false,
    gold: structuredClone(DEFAULT_GOLD_STATE),
    pdm: structuredClone(DEFAULT_PDM),
    btst: structuredClone(DEFAULT_BTST),
    sets: structuredClone(DEFAULT_SETS),
    upiRows: structuredClone(DEFAULT_UPI_ROWS),
    snapshots: [],
  };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<PersistedState>;
    return {
      activeTab: parsed.activeTab || 'gold',
      fullPrecision: !!parsed.fullPrecision,
      gold: { ...fallback.gold, ...(parsed.gold || {}) },
      pdm: { ...fallback.pdm, ...(parsed.pdm || {}) },
      btst: { ...fallback.btst, ...(parsed.btst || {}) },
      sets: { ...fallback.sets, ...(parsed.sets || {}) },
      upiRows: Array.isArray(parsed.upiRows) ? parsed.upiRows : fallback.upiRows,
      snapshots: Array.isArray(parsed.snapshots) ? parsed.snapshots : [],
    };
  } catch {
    return fallback;
  }
}

const NAV_ITEMS: { id: AppTab; label: string; mobileLabel: string; icon: typeof Coins }[] = [
  { id: 'gold', label: 'Gold Vault', mobileLabel: 'Gold', icon: Coins },
  { id: 'pdm', label: 'Prev Day', mobileLabel: 'Prev Day', icon: TrendingUp },
  { id: 'btst', label: 'BTST', mobileLabel: 'BTST', icon: Zap },
  { id: 'sets', label: '4 Sets', mobileLabel: '4 Sets', icon: Layers },
  { id: 'upi', label: 'UPI & Entries', mobileLabel: 'UPI', icon: Calculator },
];

export default function App() {
  const [appState, setAppState] = useState<PersistedState>(loadInitialState);
  const [chartSeries, setChartSeries] = useState<ChartPoint[]>(() =>
    generateChartSeries(appState.gold.timeframe, appState.gold.buyPrice)
  );
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositInput, setDepositInput] = useState('25000');
  const [toast, setToast] = useState<{ msg: string; isError?: boolean } | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
    } catch {
      // ignore storage quota errors
    }
  }, [appState]);

  const notify = (msg: string, isError = false) => {
    setToast({ msg, isError });
  };

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  // Live gold price ticker
  useEffect(() => {
    if (!appState.gold.liveFeed) return;
    const id = window.setInterval(() => {
      setAppState((prev) => {
        const delta = (Math.random() - 0.48) * 18;
        const nextPrice = +Math.max(9000, prev.gold.buyPrice + delta).toFixed(2);
        setChartSeries((series) =>
          series.length
            ? [...series.slice(1), { ts: Date.now(), price: nextPrice }]
            : generateChartSeries(prev.gold.timeframe, nextPrice)
        );
        return {
          ...prev,
          gold: {
            ...prev.gold,
            buyPrice: nextPrice,
          },
        };
      });
    }, 4000);
    return () => window.clearInterval(id);
  }, [appState.gold.liveFeed]);

  const updateGold = (patch: Partial<GoldVaultState>) => {
    setAppState((prev) => ({
      ...prev,
      gold: { ...prev.gold, ...patch },
    }));
  };

  const handleChangeTimeframe = (tf: Timeframe) => {
    updateGold({ timeframe: tf });
    setChartSeries(generateChartSeries(tf, appState.gold.buyPrice));
  };

  const handleExecuteGoldOrder = (side: OrderSide, unit: OrderUnit, rawAmount: number) => {
    if (!rawAmount || rawAmount <= 0) {
      notify('Enter a valid order amount.', true);
      return;
    }

    const buyRate = appState.gold.buyPrice;
    const sellRate = +(buyRate * (1 - GOLD_SPREAD)).toFixed(2);

    if (side === 'buy') {
      const goldValue = unit === 'inr' ? rawAmount / (1 + GST_RATE) : rawAmount * buyRate;
      const totalInr = unit === 'inr' ? rawAmount : goldValue * (1 + GST_RATE);
      const gst = totalInr - goldValue;
      const grams = goldValue / buyRate;

      if (totalInr < 100) {
        notify('Minimum buy order is ₹100.00.', true);
        return;
      }
      if (totalInr > appState.gold.walletInr) {
        notify('Insufficient INR wallet balance.', true);
        return;
      }

      setAppState((prev) => ({
        ...prev,
        gold: {
          ...prev.gold,
          walletInr: +(prev.gold.walletInr - totalInr).toFixed(2),
          goldGrams: +(prev.gold.goldGrams + grams).toFixed(4),
          investedInr: +(prev.gold.investedInr + totalInr).toFixed(2),
          transactions: [
            {
              id: `TXN-${Math.floor(1000 + Math.random() * 9000)}`,
              ts: Date.now(),
              type: 'BUY',
              grams: +grams.toFixed(4),
              rate: buyRate,
              gst: +gst.toFixed(2),
              totalInr: +totalInr.toFixed(2),
            },
            ...prev.gold.transactions,
          ],
        },
      }));
      notify(`Purchased ${grams.toFixed(4)} g of 24K gold for ${formatINR(totalInr)}.`);
      return;
    }

    // Sell Gold
    const totalInr = unit === 'inr' ? rawAmount : rawAmount * sellRate;
    const grams = unit === 'inr' ? rawAmount / sellRate : rawAmount;

    if (totalInr < 100) {
      notify('Minimum sell order is ₹100.00.', true);
      return;
    }
    if (grams > appState.gold.goldGrams + 1e-6) {
      notify('Insufficient gold balance in your locker.', true);
      return;
    }

    const soldGrams = Math.min(appState.gold.goldGrams, grams);
    const remainingGrams = Math.max(0, +(appState.gold.goldGrams - soldGrams).toFixed(4));
    const ratio = appState.gold.goldGrams > 0 ? remainingGrams / appState.gold.goldGrams : 0;

    setAppState((prev) => ({
      ...prev,
      gold: {
        ...prev.gold,
        investedInr: remainingGrams <= 0.00001 ? 0 : +(prev.gold.investedInr * ratio).toFixed(2),
        goldGrams: remainingGrams,
        walletInr: +(prev.gold.walletInr + totalInr).toFixed(2),
        transactions: [
          {
            id: `TXN-${Math.floor(1000 + Math.random() * 9000)}`,
            ts: Date.now(),
            type: 'SELL',
            grams: +soldGrams.toFixed(4),
            rate: sellRate,
            gst: 0,
            totalInr: +totalInr.toFixed(2),
          },
          ...prev.gold.transactions,
        ],
      },
    }));
    notify(`Sold ${soldGrams.toFixed(4)} g and credited ${formatINR(totalInr)} to wallet.`);
  };

  const handleRedeemCoin = (grams: number, mintingFee: number) => {
    if (appState.gold.goldGrams < grams) {
      notify(`Need at least ${grams} g in your locker to redeem a ${grams}g coin.`, true);
      return;
    }
    if (appState.gold.walletInr < mintingFee) {
      notify(`Insufficient INR wallet balance for ₹${mintingFee} minting & delivery fee.`, true);
      return;
    }

    const remaining = Math.max(0, +(appState.gold.goldGrams - grams).toFixed(4));
    const ratio = appState.gold.goldGrams > 0 ? remaining / appState.gold.goldGrams : 0;
    const sellRate = +(appState.gold.buyPrice * (1 - GOLD_SPREAD)).toFixed(2);

    setAppState((prev) => ({
      ...prev,
      gold: {
        ...prev.gold,
        investedInr: remaining <= 0.00001 ? 0 : +(prev.gold.investedInr * ratio).toFixed(2),
        goldGrams: remaining,
        walletInr: +(prev.gold.walletInr - mintingFee).toFixed(2),
        transactions: [
          {
            id: `REDEEM-${Math.floor(100 + Math.random() * 900)}`,
            ts: Date.now(),
            type: 'REDEEM',
            grams,
            rate: sellRate,
            gst: 0,
            totalInr: mintingFee,
          },
          ...prev.gold.transactions,
        ],
      },
    }));
    notify(`Redeemed ${grams}g 24K Coin. Scheduled for insured courier dispatch.`);
  };

  const handleConfirmDeposit = () => {
    const amt = parseFloat(depositInput);
    if (!amt || amt < 100) {
      notify('Minimum deposit is ₹100.00.', true);
      return;
    }
    setAppState((prev) => ({
      ...prev,
      gold: {
        ...prev.gold,
        walletInr: +(prev.gold.walletInr + amt).toFixed(2),
        transactions: [
          {
            id: `DEP-${Math.floor(1000 + Math.random() * 9000)}`,
            ts: Date.now(),
            type: 'DEPOSIT',
            grams: 0,
            rate: 0,
            gst: 0,
            totalInr: +amt.toFixed(2),
          },
          ...prev.gold.transactions,
        ],
      },
    }));
    setShowDepositModal(false);
    notify(`${formatINR(amt)} added to your INR wallet.`);
  };

  const handleSaveSnapshot = () => {
    const icp =
      appState.sets.rows.reduce((s, r) => s + (Number(r.low) || 0), 0) /
      Math.max(1, appState.sets.rows.length);

    const entry: SavedSnapshot = {
      id: Date.now(),
      ts: new Date().toLocaleString('en-IN'),
      label: `${appState.btst.script} · Strike ${appState.pdm.strike}`,
      icp,
      btstLtp: appState.btst.ltp,
      btstUpi: appState.btst.upi,
      goldGrams: appState.gold.goldGrams,
      snapshot: structuredClone({
        pdm: appState.pdm,
        btst: appState.btst,
        sets: appState.sets,
        upiRows: appState.upiRows,
      }),
    };

    setAppState((prev) => ({
      ...prev,
      snapshots: [entry, ...prev.snapshots],
    }));
    notify('Saved daily workbook snapshot locally.');
  };

  const handleLoadSnapshot = (id: number) => {
    const found = appState.snapshots.find((s) => s.id === id);
    if (!found) return;
    setAppState((prev) => ({
      ...prev,
      pdm: structuredClone(found.snapshot.pdm),
      btst: structuredClone(found.snapshot.btst),
      sets: structuredClone(found.snapshot.sets),
      upiRows: structuredClone(found.snapshot.upiRows),
      activeTab: 'pdm',
    }));
    notify(`Loaded snapshot: ${found.label}`);
  };

  const handleDeleteSnapshot = (id: number) => {
    setAppState((prev) => ({
      ...prev,
      snapshots: prev.snapshots.filter((s) => s.id !== id),
    }));
  };

  const handleResetWorkbook = () => {
    setAppState((prev) => ({
      ...prev,
      pdm: structuredClone(DEFAULT_PDM),
      btst: structuredClone(DEFAULT_BTST),
      sets: structuredClone(DEFAULT_SETS),
      upiRows: structuredClone(DEFAULT_UPI_ROWS),
    }));
    notify('Quant workbook values reset to defaults.');
  };

  const handleResetGoldVault = () => {
    const fresh = structuredClone(DEFAULT_GOLD_STATE);
    setAppState((prev) => ({
      ...prev,
      gold: fresh,
    }));
    setChartSeries(generateChartSeries(fresh.timeframe, fresh.buyPrice));
    notify('Gold vault reset to default demo balances.');
  };

  return (
    <div className="min-h-screen bg-[#0B0E14] text-slate-100 pb-20 md:pb-8">
      {/* Strict 3-Zone Top Bar Contract */}
      <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-[#0B0E14]/90 backdrop-blur-md">
        <div className="mx-auto flex h-13 md:h-16 max-w-7xl items-center justify-between gap-8 px-4 sm:px-6">
          {/* Zone 1: Single-element Brand Wordmark */}
          <button
            type="button"
            onClick={() => setAppState((p) => ({ ...p, activeTab: 'gold' }))}
            className="font-[family-name:var(--font-display)] text-lg font-bold tracking-tight text-white whitespace-nowrap shrink-0 cursor-pointer"
          >
            AurumQuant
          </button>

          {/* Zone 2: 5 concise single-line nav links */}
          <nav aria-label="Primary navigation" className="hidden md:flex items-center gap-6">
            {NAV_ITEMS.map((item) => {
              const active = appState.activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setAppState((p) => ({ ...p, activeTab: item.id }))}
                  className={`py-2 text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer border-b-2 ${
                    active
                      ? 'border-amber-400 text-white'
                      : 'border-transparent text-slate-400 hover:text-white'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Single primary action (Install App / Add INR) */}
          <div className="flex items-center shrink-0">
            <PWAInstallButton
              fallbackAction={() => setShowDepositModal(true)}
              fallbackLabel="+ Add INR"
            />
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:py-8">
        {appState.activeTab === 'gold' && (
          <GoldVaultView
            gold={appState.gold}
            chartSeries={chartSeries}
            onChangeTimeframe={handleChangeTimeframe}
            onToggleLiveFeed={() => updateGold({ liveFeed: !appState.gold.liveFeed })}
            onOpenDeposit={() => setShowDepositModal(true)}
            onExecuteOrder={handleExecuteGoldOrder}
            onRedeemCoin={handleRedeemCoin}
            onUpdateState={updateGold}
          />
        )}

        {appState.activeTab === 'pdm' && (
          <div className="space-y-6">
            <QuantToolbar
              title="Previous Day Method"
              subtitle="26.11% Range Breakout · Entry Rate Method 1 · Up & Down Targets"
              fullPrecision={appState.fullPrecision}
              onTogglePrecision={() =>
                setAppState((p) => ({ ...p, fullPrecision: !p.fullPrecision }))
              }
              onSaveSnapshot={handleSaveSnapshot}
              onResetDefaults={handleResetWorkbook}
            />
            <PrevDayView
              data={appState.pdm}
              fullPrecision={appState.fullPrecision}
              onChange={(pdm) => setAppState((p) => ({ ...p, pdm }))}
            />
          </div>
        )}

        {appState.activeTab === 'btst' && (
          <div className="space-y-6">
            <QuantToolbar
              title="BTST Signal & Polarity Engine"
              subtitle="1st Bar & 12:30 PM Bar (±0.2611%) · Poles, Tropics & Equator"
              fullPrecision={appState.fullPrecision}
              onTogglePrecision={() =>
                setAppState((p) => ({ ...p, fullPrecision: !p.fullPrecision }))
              }
              onSaveSnapshot={handleSaveSnapshot}
              onResetDefaults={handleResetWorkbook}
            />
            <BTSTView
              data={appState.btst}
              fullPrecision={appState.fullPrecision}
              onChange={(btst) => setAppState((p) => ({ ...p, btst }))}
              onOpenUpi={() => setAppState((p) => ({ ...p, activeTab: 'upi' }))}
            />
          </div>
        )}

        {appState.activeTab === 'sets' && (
          <div className="space-y-6">
            <QuantToolbar
              title="4 Sets & Inner Circle Premium"
              subtitle="4-Strike Option Low Average · 3.83 & 0.7389 Expansion Matrix"
              fullPrecision={appState.fullPrecision}
              onTogglePrecision={() =>
                setAppState((p) => ({ ...p, fullPrecision: !p.fullPrecision }))
              }
              onSaveSnapshot={handleSaveSnapshot}
              onResetDefaults={handleResetWorkbook}
            />
            <FourSetsView
              data={appState.sets}
              fullPrecision={appState.fullPrecision}
              onChange={(sets) => setAppState((p) => ({ ...p, sets }))}
            />
          </div>
        )}

        {appState.activeTab === 'upi' && (
          <div className="space-y-6">
            <QuantToolbar
              title="UPI Calculator & Daily Entries"
              subtitle="OI-Weighted Midpoint Index · Direct BTST Integration & Local Snapshots"
              fullPrecision={appState.fullPrecision}
              onTogglePrecision={() =>
                setAppState((p) => ({ ...p, fullPrecision: !p.fullPrecision }))
              }
              onSaveSnapshot={handleSaveSnapshot}
              onResetDefaults={handleResetWorkbook}
            />
            <UpiEntriesView
              rows={appState.upiRows}
              snapshots={appState.snapshots}
              fullPrecision={appState.fullPrecision}
              onChangeRows={(upiRows) => setAppState((p) => ({ ...p, upiRows }))}
              onSendToBtst={(upiVal) => {
                setAppState((p) => ({
                  ...p,
                  btst: { ...p.btst, upi: +upiVal.toFixed(2) },
                  activeTab: 'btst',
                }));
                notify(`Sent UPI ${upiVal.toFixed(2)} to BTST calculator.`);
              }}
              onSaveSnapshot={handleSaveSnapshot}
              onLoadSnapshot={handleLoadSnapshot}
              onDeleteSnapshot={handleDeleteSnapshot}
            />
          </div>
        )}
      </main>

      {/* Quiet Footer with Secondary Utility Actions */}
      <footer className="mx-auto mt-6 flex max-w-7xl flex-wrap items-center justify-between gap-4 border-t border-slate-800/70 px-4 py-6 text-xs text-slate-400 sm:px-6">
        <span>AurumQuant · 24K Bullion & Quant Levels</span>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setShowDepositModal(true)}
            className="hover:text-white cursor-pointer"
          >
            Add INR Funds
          </button>
          <button
            type="button"
            onClick={handleResetGoldVault}
            className="hover:text-white cursor-pointer"
          >
            Reset Gold Demo
          </button>
        </div>
      </footer>

      {/* Mobile Bottom Tab Bar (Thumb Zone, <= 15% total sticky height) */}
      <nav
        aria-label="Mobile navigation"
        className="fixed bottom-0 left-0 right-0 z-40 grid h-14 grid-cols-5 border-t border-slate-800 bg-[#121722]/95 backdrop-blur-md md:hidden"
      >
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = appState.activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setAppState((p) => ({ ...p, activeTab: item.id }))}
              className={`flex min-h-[44px] flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors cursor-pointer ${
                active ? 'text-amber-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              <span className="whitespace-nowrap">{item.mobileLabel}</span>
            </button>
          );
        })}
      </nav>

      {/* Add INR Funds Modal */}
      {showDepositModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="deposit-modal-title"
            className="w-full max-w-md rounded-2xl border border-slate-800 bg-[#121722] p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <h2 id="deposit-modal-title" className="text-base font-semibold text-white">
                Add Funds to INR Wallet
              </h2>
              <button
                type="button"
                onClick={() => setShowDepositModal(false)}
                aria-label="Close deposit modal"
                className="flex min-h-[36px] min-w-[36px] items-center justify-center rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-1 text-xs text-slate-400">
              Simulated instant UPI deposit for testing 24K gold orders and coin redemptions.
            </p>
            <input
              type="number"
              min="100"
              value={depositInput}
              onChange={(e) => setDepositInput(e.target.value)}
              className="mt-4 w-full min-h-[48px] rounded-xl border border-slate-700 bg-[#0B0E14] px-4 py-3 font-mono text-lg font-bold text-white tabular-nums outline-none focus:border-amber-400"
            />
            <div className="mt-3 grid grid-cols-3 gap-2">
              {[10000, 50000, 100000].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setDepositInput(String(val))}
                  className="min-h-[38px] rounded-lg bg-[#0B0E14] py-2 font-mono text-xs text-slate-300 tabular-nums hover:bg-[#19202F] hover:text-white cursor-pointer"
                >
                  +₹{val.toLocaleString('en-IN')}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={handleConfirmDeposit}
              className="mt-5 w-full min-h-[46px] rounded-xl bg-amber-400 py-3 text-sm font-semibold text-slate-950 hover:bg-amber-300 cursor-pointer"
            >
              Deposit Funds Instantly
            </button>
          </div>
        </div>
      )}

      {/* Toast Banner */}
      {toast && (
        <div
          role="status"
          className={`fixed bottom-18 right-4 z-50 max-w-sm rounded-xl border px-4 py-3 text-xs font-medium shadow-xl md:bottom-5 ${
            toast.isError
              ? 'border-rose-500/50 bg-rose-950/95 text-rose-100'
              : 'border-emerald-500/40 bg-[#121722] text-emerald-200'
          }`}
        >
          {toast.msg}
        </div>
      )}

      <OfflineIndicator />
    </div>
  );
}
