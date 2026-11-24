import React from 'react';
import { Plus, Trash2, Download, ArrowRight, BookmarkCheck } from 'lucide-react';
import {
  BTSTData,
  PreviousDayData,
  SavedSnapshot,
  SetsData,
  UpiRow,
} from '../types/app';
import { calcRowUpi, exportUpiCsv, fmtNum } from '../utils/formatters';

interface QuantToolbarProps {
  title: string;
  subtitle: string;
  fullPrecision: boolean;
  onTogglePrecision: () => void;
  onSaveSnapshot: () => void;
  onResetDefaults: () => void;
}

export const QuantToolbar: React.FC<QuantToolbarProps> = ({
  title,
  subtitle,
  fullPrecision,
  onTogglePrecision,
  onSaveSnapshot,
  onResetDefaults,
}) => (
  <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-800/80 pb-5">
    <div>
      <p className="text-xs font-medium text-amber-400">{subtitle}</p>
      <h1 className="mt-1 font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight text-white sm:text-3xl">
        {title}
      </h1>
    </div>
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={onTogglePrecision}
        className="min-h-[40px] rounded-lg border border-slate-800 bg-[#121722] px-3 py-2 text-xs font-medium text-slate-200 hover:border-slate-700 cursor-pointer whitespace-nowrap shrink-0"
      >
        {fullPrecision ? 'Full Precision' : '2 Decimals'}
      </button>
      <button
        type="button"
        onClick={onSaveSnapshot}
        className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg bg-amber-400 px-3.5 py-2 text-xs font-semibold text-slate-950 hover:bg-amber-300 cursor-pointer whitespace-nowrap shrink-0"
      >
        <BookmarkCheck className="h-3.5 w-3.5" aria-hidden="true" />
        <span>Save Entry</span>
      </button>
      <button
        type="button"
        onClick={onResetDefaults}
        className="min-h-[40px] rounded-lg border border-slate-800 bg-[#121722] px-3 py-2 text-xs font-medium text-slate-400 hover:text-white cursor-pointer whitespace-nowrap shrink-0"
      >
        Reset Workbook
      </button>
    </div>
  </div>
);

/* ==================== SHEET 1: PREVIOUS DAY METHOD ==================== */
interface PrevDayViewProps {
  data: PreviousDayData;
  fullPrecision: boolean;
  onChange: (next: PreviousDayData) => void;
}

export const PrevDayView: React.FC<PrevDayViewProps> = ({ data, fullPrecision, onChange }) => {
  const d3 = (data.callHigh - data.callLow) * 0.2611;
  const e3 = data.callLow + d3;
  const d5 = (data.putHigh - data.putLow) * 0.2611;
  const e5 = data.putLow + d5;
  const e7 = (e3 + e5) / 2;

  const upTargets = [
    { label: '1st Target · +26.11%', val: e7 + e7 * 0.2611 },
    { label: '2nd Target · +50.00%', val: e7 + e7 * 0.5 },
    { label: '3rd Target · +73.89%', val: e7 + e7 * 0.7389 },
    { label: '4th Target · +100.00%', val: e7 + e7 * 1.0 },
    { label: '5th Target · +126.11%', val: e7 + e7 * 1.2611 },
    { label: '6th Target · +150.00%', val: e7 + e7 * 1.5 },
    { label: '7th Target · +173.89%', val: e7 + e7 * 1.7389 },
    { label: '8th Target · +226.11%', val: e7 + e7 * 2.2611 },
  ];

  const downTargets = [
    { label: '1st Target · -26.11%', val: e7 - e7 * 0.2611 },
    { label: '2nd Target · -50.00%', val: e7 - e7 * 0.5 },
    { label: '3rd Target · -73.89%', val: e7 - e7 * 0.7389 },
    { label: '4th Target · -100.00%', val: 0 },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
      <div className="rounded-xl border border-slate-800 bg-[#121722] p-5 sm:p-6 lg:col-span-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-sm font-semibold text-white">Strike & Previous Session Inputs</h2>
          <span className="font-mono text-xs text-slate-400">26.11% Factor</span>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-3">
          <div>
            <label className="text-[11px] text-slate-400">Strike</label>
            <input
              type="number"
              value={data.strike}
              onChange={(e) => onChange({ ...data, strike: parseFloat(e.target.value) || 0 })}
              className="mt-1 w-full min-h-[40px] rounded-lg border border-slate-700 bg-[#0B0E14] px-3 py-1.5 font-mono text-sm font-semibold text-white tabular-nums outline-none focus:border-amber-400"
            />
          </div>
          <div>
            <label className="text-[11px] text-slate-400">Trade Date</label>
            <input
              type="text"
              value={data.tradeDate}
              onChange={(e) => onChange({ ...data, tradeDate: e.target.value })}
              className="mt-1 w-full min-h-[40px] rounded-lg border border-slate-700 bg-[#0B0E14] px-3 py-1.5 text-xs text-white outline-none focus:border-amber-400"
            />
          </div>
          <div>
            <label className="text-[11px] text-slate-400">Entry Date</label>
            <input
              type="text"
              value={data.entryDate}
              onChange={(e) => onChange({ ...data, entryDate: e.target.value })}
              className="mt-1 w-full min-h-[40px] rounded-lg border border-slate-700 bg-[#0B0E14] px-3 py-1.5 text-xs text-white outline-none focus:border-amber-400"
            />
          </div>
        </div>

        {/* Call Inputs */}
        <div className="mt-5 border-t border-slate-800 pt-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-400">CALL (CE)</span>
            <span className="font-mono text-xs text-slate-400 tabular-nums">
              26.11% + Low:{' '}
              <strong className="text-emerald-300">{fmtNum(e3, fullPrecision)}</strong>
            </span>
          </div>
          <div className="mt-2.5 grid grid-cols-3 gap-2.5">
            <div>
              <label className="text-[11px] text-slate-400">High</label>
              <input
                type="number"
                step="any"
                value={data.callHigh}
                onChange={(e) => onChange({ ...data, callHigh: parseFloat(e.target.value) || 0 })}
                className="mt-1 w-full min-h-[40px] rounded-lg border border-slate-700 bg-[#0B0E14] px-2.5 py-1.5 font-mono text-sm text-white tabular-nums outline-none focus:border-emerald-400"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400">Low</label>
              <input
                type="number"
                step="any"
                value={data.callLow}
                onChange={(e) => onChange({ ...data, callLow: parseFloat(e.target.value) || 0 })}
                className="mt-1 w-full min-h-[40px] rounded-lg border border-slate-700 bg-[#0B0E14] px-2.5 py-1.5 font-mono text-sm text-white tabular-nums outline-none focus:border-emerald-400"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400">26.11% Range</label>
              <div className="mt-1 flex min-h-[40px] items-center rounded-lg bg-[#0B0E14] px-2.5 font-mono text-sm text-slate-300 tabular-nums">
                {fmtNum(d3, fullPrecision)}
              </div>
            </div>
          </div>
        </div>

        {/* Put Inputs */}
        <div className="mt-4 border-t border-slate-800 pt-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-400">PUT (PE)</span>
            <span className="font-mono text-xs text-slate-400 tabular-nums">
              26.11% + Low: <strong className="text-rose-300">{fmtNum(e5, fullPrecision)}</strong>
            </span>
          </div>
          <div className="mt-2.5 grid grid-cols-3 gap-2.5">
            <div>
              <label className="text-[11px] text-slate-400">High</label>
              <input
                type="number"
                step="any"
                value={data.putHigh}
                onChange={(e) => onChange({ ...data, putHigh: parseFloat(e.target.value) || 0 })}
                className="mt-1 w-full min-h-[40px] rounded-lg border border-slate-700 bg-[#0B0E14] px-2.5 py-1.5 font-mono text-sm text-white tabular-nums outline-none focus:border-rose-400"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400">Low</label>
              <input
                type="number"
                step="any"
                value={data.putLow}
                onChange={(e) => onChange({ ...data, putLow: parseFloat(e.target.value) || 0 })}
                className="mt-1 w-full min-h-[40px] rounded-lg border border-slate-700 bg-[#0B0E14] px-2.5 py-1.5 font-mono text-sm text-white tabular-nums outline-none focus:border-rose-400"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400">26.11% Range</label>
              <div className="mt-1 flex min-h-[40px] items-center rounded-lg bg-[#0B0E14] px-2.5 font-mono text-sm text-slate-300 tabular-nums">
                {fmtNum(d5, fullPrecision)}
              </div>
            </div>
          </div>
        </div>

        {/* Entry Rate Method 1 */}
        <div className="mt-5 flex items-center justify-between rounded-xl bg-[#0B0E14] p-4 border-t border-slate-800">
          <div>
            <div className="text-xs font-semibold text-amber-300">Entry Rate Method 1</div>
            <div className="text-[11px] text-slate-400">(Call Level + Put Level) / 2</div>
          </div>
          <div className="font-mono text-2xl font-bold text-white tabular-nums">
            {fmtNum(e7, fullPrecision)}
          </div>
        </div>
      </div>

      {/* Targets Panel */}
      <div className="space-y-6 lg:col-span-7">
        <div className="rounded-xl border border-slate-800 bg-[#121722] p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-emerald-400">Up Targets · Bullish Expansion</h2>
            <span className="text-xs text-slate-400">From Entry Rate</span>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {upTargets.map((t) => (
              <div key={t.label} className="rounded-lg bg-[#0B0E14] p-3.5">
                <div className="text-[11px] text-slate-400">{t.label}</div>
                <div className="mt-1 font-mono text-base font-bold text-emerald-300 tabular-nums">
                  {fmtNum(t.val, fullPrecision)}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-[#121722] p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-rose-400">Down Targets · Bearish Retracement</h2>
            <span className="text-xs text-slate-400">100% floor = 0</span>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {downTargets.map((t) => (
              <div key={t.label} className="rounded-lg bg-[#0B0E14] p-3.5">
                <div className="text-[11px] text-slate-400">{t.label}</div>
                <div className="mt-1 font-mono text-base font-bold text-rose-300 tabular-nums">
                  {fmtNum(t.val, fullPrecision)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ==================== SHEET 2: BTST ==================== */
interface BTSTViewProps {
  data: BTSTData;
  fullPrecision: boolean;
  onChange: (next: BTSTData) => void;
  onOpenUpi: () => void;
}

export const BTSTView: React.FC<BTSTViewProps> = ({
  data,
  fullPrecision,
  onChange,
  onOpenUpi,
}) => {
  const e3 = data.b1High + data.b1High * 0.002611;
  const e5 = data.b1Low - data.b1Low * 0.002611;
  const e7 = data.b2High + data.b2High * 0.002611;
  const e9 = data.b2Low - data.b2Low * 0.002611;

  const sig1 = data.ltp > e3 && data.ltp > e7 ? 'BUY CALL ONLY' : 'NO ACTION';
  const sig2 = data.ltp < e5 && data.ltp < e9 ? 'BUY PUT ONLY' : 'NO ACTION';
  const sig3 = data.ltp > e7 && data.ltp > e3 ? 'BUY CALL ONLY' : 'NO ACTION';
  const sig4 = data.ltp < e5 && data.ltp < e9 ? 'BUY PUT ONLY' : 'NO ACTION';

  const opSup = data.b1High - data.upi;
  const opRes = data.b1Low + data.upi;
  const north = e3;
  const south = e5;
  const equator = (e3 + e5) / 2;
  const factor = (e3 - e5) * 0.2611;
  const cancer = north - factor;
  const capricorn = south + factor;

  const pct =
    north > south ? Math.max(0, Math.min(100, ((data.ltp - south) / (north - south)) * 100)) : 50;

  let zone = 'Between Capricorn & Cancer';
  if (data.ltp >= north) zone = 'Above North Pole · Strong Bullish';
  else if (data.ltp >= cancer) zone = 'Cancer to North Pole Zone';
  else if (data.ltp >= equator) zone = 'Upper Hemisphere · Equator to Cancer';
  else if (data.ltp >= capricorn) zone = 'Lower Hemisphere · Capricorn to Equator';
  else if (data.ltp >= south) zone = 'South Pole to Capricorn Zone';
  else zone = 'Below South Pole · Strong Bearish';

  const signalClass = (s: string) =>
    s === 'BUY CALL ONLY'
      ? 'text-emerald-300 bg-emerald-500/15'
      : s === 'BUY PUT ONLY'
      ? 'text-rose-300 bg-rose-500/15'
      : 'text-slate-400 bg-slate-800';

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 rounded-xl border border-slate-800 bg-[#121722] p-4 sm:grid-cols-5">
        <div>
          <label className="text-[11px] text-slate-400">Script</label>
          <input
            type="text"
            value={data.script}
            onChange={(e) => onChange({ ...data, script: e.target.value })}
            className="mt-1 w-full min-h-[40px] rounded-lg border border-slate-700 bg-[#0B0E14] px-3 py-1.5 text-sm font-semibold text-white outline-none focus:border-amber-400"
          />
        </div>
        <div>
          <label className="text-[11px] text-slate-400">Session Label</label>
          <input
            type="text"
            value={data.label}
            onChange={(e) => onChange({ ...data, label: e.target.value })}
            className="mt-1 w-full min-h-[40px] rounded-lg border border-slate-700 bg-[#0B0E14] px-3 py-1.5 text-sm text-white outline-none focus:border-amber-400"
          />
        </div>
        <div>
          <label className="text-[11px] text-slate-400">LTP @ 3:25 PM</label>
          <input
            type="number"
            step="any"
            value={data.ltp}
            onChange={(e) => onChange({ ...data, ltp: parseFloat(e.target.value) || 0 })}
            className="mt-1 w-full min-h-[40px] rounded-lg border border-amber-500/40 bg-[#0B0E14] px-3 py-1.5 font-mono text-sm font-bold text-amber-300 tabular-nums outline-none focus:border-amber-400"
          />
        </div>
        <div>
          <label className="text-[11px] text-slate-400">UPI Input</label>
          <input
            type="number"
            step="any"
            value={data.upi}
            onChange={(e) => onChange({ ...data, upi: parseFloat(e.target.value) || 0 })}
            className="mt-1 w-full min-h-[40px] rounded-lg border border-slate-700 bg-[#0B0E14] px-3 py-1.5 font-mono text-sm font-bold text-white tabular-nums outline-none focus:border-amber-400"
          />
        </div>
        <div className="col-span-2 flex items-end sm:col-span-1">
          <button
            type="button"
            onClick={onOpenUpi}
            className="inline-flex min-h-[40px] w-full items-center justify-center gap-1.5 rounded-lg bg-[#0B0E14] px-3 py-2 text-xs font-medium text-amber-300 hover:bg-[#19202F] cursor-pointer whitespace-nowrap"
          >
            <span>Pick from UPI</span>
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
        <div className="space-y-6 lg:col-span-7">
          {/* 1st Bar */}
          <div className="rounded-xl border border-slate-800 bg-[#121722] p-5">
            <h2 className="text-sm font-semibold text-white">1st Bar Levels (±0.2611%)</h2>
            <div className="mt-4 space-y-3">
              <div className="grid grid-cols-12 items-center gap-3 rounded-lg bg-[#0B0E14] p-3.5">
                <div className="col-span-4 sm:col-span-3">
                  <span className="text-[11px] text-slate-400">1st Bar High</span>
                  <input
                    type="number"
                    step="any"
                    value={data.b1High}
                    onChange={(e) => onChange({ ...data, b1High: parseFloat(e.target.value) || 0 })}
                    className="mt-1 w-full rounded border border-slate-700 bg-[#121722] px-2 py-1 font-mono text-sm text-white tabular-nums outline-none focus:border-amber-400"
                  />
                </div>
                <div className="col-span-4 sm:col-span-4">
                  <span className="text-[11px] text-slate-400">Breakout (+0.2611%)</span>
                  <div className="mt-1 font-mono text-sm font-bold text-emerald-300 tabular-nums">
                    {fmtNum(e3, fullPrecision)}
                  </div>
                </div>
                <div className="col-span-4 sm:col-span-5 text-right">
                  <span className={`inline-block rounded-md px-2.5 py-1 text-[11px] font-bold ${signalClass(sig1)}`}>
                    {sig1}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-12 items-center gap-3 rounded-lg bg-[#0B0E14] p-3.5">
                <div className="col-span-4 sm:col-span-3">
                  <span className="text-[11px] text-slate-400">1st Bar Low</span>
                  <input
                    type="number"
                    step="any"
                    value={data.b1Low}
                    onChange={(e) => onChange({ ...data, b1Low: parseFloat(e.target.value) || 0 })}
                    className="mt-1 w-full rounded border border-slate-700 bg-[#121722] px-2 py-1 font-mono text-sm text-white tabular-nums outline-none focus:border-amber-400"
                  />
                </div>
                <div className="col-span-4 sm:col-span-4">
                  <span className="text-[11px] text-slate-400">Breakdown (-0.2611%)</span>
                  <div className="mt-1 font-mono text-sm font-bold text-rose-300 tabular-nums">
                    {fmtNum(e5, fullPrecision)}
                  </div>
                </div>
                <div className="col-span-4 sm:col-span-5 text-right">
                  <span className={`inline-block rounded-md px-2.5 py-1 text-[11px] font-bold ${signalClass(sig2)}`}>
                    {sig2}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 12:30 PM Bar */}
          <div className="rounded-xl border border-slate-800 bg-[#121722] p-5">
            <h2 className="text-sm font-semibold text-white">12:30 PM Bar Levels (±0.2611%)</h2>
            <div className="mt-4 space-y-3">
              <div className="grid grid-cols-12 items-center gap-3 rounded-lg bg-[#0B0E14] p-3.5">
                <div className="col-span-4 sm:col-span-3">
                  <span className="text-[11px] text-slate-400">12:30 High</span>
                  <input
                    type="number"
                    step="any"
                    value={data.b2High}
                    onChange={(e) => onChange({ ...data, b2High: parseFloat(e.target.value) || 0 })}
                    className="mt-1 w-full rounded border border-slate-700 bg-[#121722] px-2 py-1 font-mono text-sm text-white tabular-nums outline-none focus:border-amber-400"
                  />
                </div>
                <div className="col-span-4 sm:col-span-4">
                  <span className="text-[11px] text-slate-400">Breakout (+0.2611%)</span>
                  <div className="mt-1 font-mono text-sm font-bold text-emerald-300 tabular-nums">
                    {fmtNum(e7, fullPrecision)}
                  </div>
                </div>
                <div className="col-span-4 sm:col-span-5 text-right">
                  <span className={`inline-block rounded-md px-2.5 py-1 text-[11px] font-bold ${signalClass(sig3)}`}>
                    {sig3}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-12 items-center gap-3 rounded-lg bg-[#0B0E14] p-3.5">
                <div className="col-span-4 sm:col-span-3">
                  <span className="text-[11px] text-slate-400">12:30 Low</span>
                  <input
                    type="number"
                    step="any"
                    value={data.b2Low}
                    onChange={(e) => onChange({ ...data, b2Low: parseFloat(e.target.value) || 0 })}
                    className="mt-1 w-full rounded border border-slate-700 bg-[#121722] px-2 py-1 font-mono text-sm text-white tabular-nums outline-none focus:border-amber-400"
                  />
                </div>
                <div className="col-span-4 sm:col-span-4">
                  <span className="text-[11px] text-slate-400">Breakdown (-0.2611%)</span>
                  <div className="mt-1 font-mono text-sm font-bold text-rose-300 tabular-nums">
                    {fmtNum(e9, fullPrecision)}
                  </div>
                </div>
                <div className="col-span-4 sm:col-span-5 text-right">
                  <span className={`inline-block rounded-md px-2.5 py-1 text-[11px] font-bold ${signalClass(sig4)}`}>
                    {sig4}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Poles & Zones */}
        <div className="space-y-6 lg:col-span-5">
          <div className="rounded-xl border border-slate-800 bg-[#121722] p-5">
            <h2 className="text-sm font-semibold text-amber-300">Strategic Poles & Tropics</h2>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-[#0B0E14] p-3">
                <div className="text-[11px] text-slate-400">OP Support (High - UPI)</div>
                <div className="mt-1 font-mono text-base font-bold text-emerald-300 tabular-nums">
                  {fmtNum(opSup, fullPrecision)}
                </div>
              </div>
              <div className="rounded-lg bg-[#0B0E14] p-3">
                <div className="text-[11px] text-slate-400">OP Resistance (Low + UPI)</div>
                <div className="mt-1 font-mono text-base font-bold text-rose-300 tabular-nums">
                  {fmtNum(opRes, fullPrecision)}
                </div>
              </div>
              <div className="rounded-lg bg-[#0B0E14] p-3">
                <div className="text-[11px] text-slate-400">North Pole</div>
                <div className="mt-1 font-mono text-base font-bold text-white tabular-nums">
                  {fmtNum(north, fullPrecision)}
                </div>
              </div>
              <div className="rounded-lg bg-[#0B0E14] p-3">
                <div className="text-[11px] text-slate-400">Cancer (North - Factor)</div>
                <div className="mt-1 font-mono text-base font-bold text-amber-300 tabular-nums">
                  {fmtNum(cancer, fullPrecision)}
                </div>
              </div>
              <div className="col-span-2 flex items-center justify-between rounded-lg bg-[#0B0E14] px-4 py-3">
                <span className="text-xs font-semibold text-slate-300">Equator Midpoint</span>
                <span className="font-mono text-lg font-bold text-white tabular-nums">
                  {fmtNum(equator, fullPrecision)}
                </span>
              </div>
              <div className="rounded-lg bg-[#0B0E14] p-3">
                <div className="text-[11px] text-slate-400">Capricorn (South + Factor)</div>
                <div className="mt-1 font-mono text-base font-bold text-amber-300 tabular-nums">
                  {fmtNum(capricorn, fullPrecision)}
                </div>
              </div>
              <div className="rounded-lg bg-[#0B0E14] p-3">
                <div className="text-[11px] text-slate-400">South Pole</div>
                <div className="mt-1 font-mono text-base font-bold text-white tabular-nums">
                  {fmtNum(south, fullPrecision)}
                </div>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-slate-800 pt-3 text-xs">
              <span className="text-slate-400">26.11% Factor ((North - South) × 0.2611)</span>
              <span className="font-mono font-bold text-amber-300 tabular-nums">
                {fmtNum(factor, fullPrecision)}
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-[#121722] p-5">
            <div className="flex justify-between text-xs text-slate-400">
              <span>South Pole</span>
              <span>LTP Position</span>
              <span>North Pole</span>
            </div>
            <div className="mt-2.5 h-2.5 w-full overflow-hidden rounded-full bg-[#0B0E14]">
              <div
                className="h-full bg-gradient-to-r from-rose-500 via-amber-400 to-emerald-400 transition-transform"
                style={{ width: `${pct.toFixed(1)}%` }}
              />
            </div>
            <p className="mt-2.5 text-center font-mono text-xs text-slate-300 tabular-nums">
              LTP {fmtNum(data.ltp, fullPrecision)} · {pct.toFixed(1)}% · {zone}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ==================== SHEET 3: 4 SETS ==================== */
interface FourSetsViewProps {
  data: SetsData;
  fullPrecision: boolean;
  onChange: (next: SetsData) => void;
}

export const FourSetsView: React.FC<FourSetsViewProps> = ({ data, fullPrecision, onChange }) => {
  const icp = data.rows.reduce((s, r) => s + (Number(r.low) || 0), 0) / data.rows.length;
  const b7 = icp * 0.7389;
  const d6 = icp / 0.7389;

  const sets = [
    { title: 'Set 1', accent: 'text-amber-300', vals: [icp * 3.83, b7 * 3.83, icp, b7] },
    { title: 'Set 2', accent: 'text-emerald-300', vals: [d6 * 3.83, icp * 3.83, d6, icp] },
    { title: 'Set 3', accent: 'text-sky-300', vals: [d6, icp, d6 / 3.83, icp / 3.83] },
    { title: 'Set 4', accent: 'text-rose-300', vals: [icp, b7, icp / 3.83, b7 / 3.83] },
  ];

  const updateRow = (idx: number, field: keyof (typeof data.rows)[number], val: string) => {
    const nextRows = data.rows.map((r, i) =>
      i === idx
        ? { ...r, [field]: field === 'name' ? val : parseFloat(val) || 0 }
        : r
    );
    onChange({ ...data, rows: nextRows });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-12 items-stretch">
        <div className="grid grid-cols-2 gap-3 rounded-xl border border-slate-800 bg-[#121722] p-5 sm:grid-cols-4 md:col-span-8">
          <div>
            <label className="text-[11px] text-slate-400">Prev Date</label>
            <input
              type="text"
              value={data.prevDate}
              onChange={(e) => onChange({ ...data, prevDate: e.target.value })}
              className="mt-1 w-full min-h-[40px] rounded-lg border border-slate-700 bg-[#0B0E14] px-2.5 py-1.5 text-xs text-white outline-none focus:border-amber-400"
            />
          </div>
          <div>
            <label className="text-[11px] text-slate-400">Nifty Close</label>
            <input
              type="number"
              step="any"
              value={data.niftyClose}
              onChange={(e) => onChange({ ...data, niftyClose: parseFloat(e.target.value) || 0 })}
              className="mt-1 w-full min-h-[40px] rounded-lg border border-slate-700 bg-[#0B0E14] px-2.5 py-1.5 font-mono text-sm font-semibold text-white tabular-nums outline-none focus:border-amber-400"
            />
          </div>
          <div>
            <label className="text-[11px] text-slate-400">Trade Date</label>
            <input
              type="text"
              value={data.tradeDate}
              onChange={(e) => onChange({ ...data, tradeDate: e.target.value })}
              className="mt-1 w-full min-h-[40px] rounded-lg border border-slate-700 bg-[#0B0E14] px-2.5 py-1.5 text-xs text-white outline-none focus:border-amber-400"
            />
          </div>
          <div>
            <label className="text-[11px] text-slate-400">Date of Trading</label>
            <input
              type="text"
              value={data.tradingDate}
              onChange={(e) => onChange({ ...data, tradingDate: e.target.value })}
              className="mt-1 w-full min-h-[40px] rounded-lg border border-slate-700 bg-[#0B0E14] px-2.5 py-1.5 text-xs text-white outline-none focus:border-amber-400"
            />
          </div>
        </div>

        <div className="flex items-center justify-between rounded-xl border border-amber-500/35 bg-[#121722] p-5 md:col-span-4">
          <div>
            <div className="text-xs font-semibold text-amber-300">Inner Circle Premium</div>
            <div className="text-xs text-slate-400">Average of 4 Option Lows</div>
          </div>
          <div className="font-mono text-2xl font-bold text-white tabular-nums">
            {fmtNum(icp, fullPrecision)}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-800 bg-[#121722] p-5">
        <h2 className="text-sm font-semibold text-white">Option Chain Input · 4 Strikes</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[540px] text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="pb-2.5 font-medium">Contract</th>
                <th className="pb-2.5 font-medium">Open</th>
                <th className="pb-2.5 font-medium">High</th>
                <th className="pb-2.5 font-medium text-amber-300">Low (Used in ICP)</th>
                <th className="pb-2.5 font-medium">Close</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70">
              {data.rows.map((r, i) => (
                <tr key={i} className="h-[44px]">
                  <td className="py-2 pr-2">
                    <input
                      type="text"
                      value={r.name}
                      onChange={(e) => updateRow(i, 'name', e.target.value)}
                      className="w-28 rounded border border-slate-700 bg-[#0B0E14] px-2.5 py-1.5 text-xs font-semibold text-white outline-none focus:border-amber-400"
                    />
                  </td>
                  <td className="py-2 pr-2">
                    <input
                      type="number"
                      step="any"
                      value={r.open}
                      onChange={(e) => updateRow(i, 'open', e.target.value)}
                      className="w-24 rounded border border-slate-700 bg-[#0B0E14] px-2.5 py-1.5 font-mono text-xs text-white tabular-nums outline-none"
                    />
                  </td>
                  <td className="py-2 pr-2">
                    <input
                      type="number"
                      step="any"
                      value={r.high}
                      onChange={(e) => updateRow(i, 'high', e.target.value)}
                      className="w-24 rounded border border-slate-700 bg-[#0B0E14] px-2.5 py-1.5 font-mono text-xs text-white tabular-nums outline-none"
                    />
                  </td>
                  <td className="py-2 pr-2">
                    <input
                      type="number"
                      step="any"
                      value={r.low}
                      onChange={(e) => updateRow(i, 'low', e.target.value)}
                      className="w-24 rounded border border-amber-500/40 bg-[#0B0E14] px-2.5 py-1.5 font-mono text-xs font-bold text-amber-300 tabular-nums outline-none focus:border-amber-400"
                    />
                  </td>
                  <td className="py-2">
                    <input
                      type="number"
                      step="any"
                      value={r.close}
                      onChange={(e) => updateRow(i, 'close', e.target.value)}
                      className="w-24 rounded border border-slate-700 bg-[#0B0E14] px-2.5 py-1.5 font-mono text-xs text-white tabular-nums outline-none"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {sets.map((s) => (
          <div key={s.title} className="rounded-xl border border-slate-800 bg-[#121722] p-5">
            <div className={`text-xs font-semibold ${s.accent}`}>{s.title}</div>
            <div className="mt-3 space-y-2">
              {s.vals.map((v, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between rounded-lg bg-[#0B0E14] px-3 py-2"
                >
                  <span className="text-[11px] text-slate-400">Level {idx + 1}</span>
                  <span className="font-mono text-sm font-bold text-white tabular-nums">
                    {fmtNum(v, fullPrecision)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ==================== SHEET 4 + SAVED ENTRIES: UPI CALC ==================== */
interface UpiEntriesViewProps {
  rows: UpiRow[];
  snapshots: SavedSnapshot[];
  fullPrecision: boolean;
  onChangeRows: (next: UpiRow[]) => void;
  onSendToBtst: (upiVal: number) => void;
  onSaveSnapshot: () => void;
  onLoadSnapshot: (id: number) => void;
  onDeleteSnapshot: (id: number) => void;
}

export const UpiEntriesView: React.FC<UpiEntriesViewProps> = ({
  rows,
  snapshots,
  fullPrecision,
  onChangeRows,
  onSendToBtst,
  onSaveSnapshot,
  onLoadSnapshot,
  onDeleteSnapshot,
}) => {
  const avgUpi =
    rows.length > 0
      ? rows.reduce((sum, r) => sum + calcRowUpi(r).upi, 0) / rows.length
      : 0;

  const updateCell = (idx: number, field: keyof UpiRow, val: string) => {
    const next: UpiRow[] = rows.map((r, i) => {
      if (i !== idx) return r;
      if (field === 'inst') return { ...r, inst: val };
      if (field === 'strike') {
        const strikeVal: number | '' = val === '' ? '' : parseFloat(val) || 0;
        return { ...r, strike: strikeVal };
      }
      return { ...r, [field]: parseFloat(val) || 0 };
    });
    onChangeRows(next);
  };

  const addRow = () => {
    onChangeRows([
      {
        inst: 'NIFTY',
        strike: 25000,
        ceH: 150,
        ceL: 80,
        peH: 140,
        peL: 70,
        ceOI: 1000000,
        peOI: 1000000,
      },
      ...rows,
    ]);
  };

  const deleteRow = (idx: number) => {
    onChangeRows(rows.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-800 bg-[#121722] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-white">
              UPI Calculator · OI-Weighted Midpoint Index
            </h2>
            <p className="mt-0.5 font-mono text-[11px] text-slate-400">
              UPI = ((CE_MP × CE_OI) + (PE_MP × PE_OI)) / (CE_OI + PE_OI) · Avg{' '}
              <strong className="text-amber-300">{fmtNum(avgUpi, fullPrecision)}</strong>
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={addRow}
              className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg bg-amber-400 px-3 py-1.5 text-xs font-semibold text-slate-950 hover:bg-amber-300 cursor-pointer whitespace-nowrap"
            >
              <Plus className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Add Row</span>
            </button>
            <button
              type="button"
              onClick={() => exportUpiCsv(rows)}
              className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg border border-slate-700 bg-[#0B0E14] px-3 py-1.5 text-xs font-medium text-slate-200 hover:border-slate-600 cursor-pointer whitespace-nowrap"
            >
              <Download className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="pb-2.5 pr-2 font-medium">Inst.</th>
                <th className="pb-2.5 pr-2 font-medium">Strike</th>
                <th className="pb-2.5 pr-2 font-medium">CE High</th>
                <th className="pb-2.5 pr-2 font-medium">CE Low</th>
                <th className="pb-2.5 pr-2 font-medium">PE High</th>
                <th className="pb-2.5 pr-2 font-medium">PE Low</th>
                <th className="pb-2.5 pr-2 font-medium text-slate-300">CE MP</th>
                <th className="pb-2.5 pr-2 font-medium text-slate-300">PE MP</th>
                <th className="pb-2.5 pr-2 font-medium">CE OI</th>
                <th className="pb-2.5 pr-2 font-medium">PE OI</th>
                <th className="pb-2.5 pr-2 font-medium text-amber-300">UPI</th>
                <th className="pb-2.5 text-right font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70">
              {rows.map((r, i) => {
                const { ceMP, peMP, upi } = calcRowUpi(r);
                return (
                  <tr key={i} className="h-[42px] hover:bg-slate-800/25">
                    <td className="py-1.5 pr-2">
                      <input
                        type="text"
                        value={r.inst}
                        onChange={(e) => updateCell(i, 'inst', e.target.value)}
                        className="w-16 rounded border border-slate-700 bg-[#0B0E14] px-1.5 py-1 text-[11px] text-white outline-none"
                      />
                    </td>
                    <td className="py-1.5 pr-2">
                      <input
                        type="number"
                        value={r.strike}
                        onChange={(e) => updateCell(i, 'strike', e.target.value)}
                        className="w-16 rounded border border-slate-700 bg-[#0B0E14] px-1.5 py-1 font-mono text-[11px] text-white tabular-nums outline-none"
                      />
                    </td>
                    <td className="py-1.5 pr-2">
                      <input
                        type="number"
                        step="any"
                        value={r.ceH}
                        onChange={(e) => updateCell(i, 'ceH', e.target.value)}
                        className="w-16 rounded border border-slate-700 bg-[#0B0E14] px-1.5 py-1 font-mono text-[11px] text-white tabular-nums outline-none"
                      />
                    </td>
                    <td className="py-1.5 pr-2">
                      <input
                        type="number"
                        step="any"
                        value={r.ceL}
                        onChange={(e) => updateCell(i, 'ceL', e.target.value)}
                        className="w-16 rounded border border-slate-700 bg-[#0B0E14] px-1.5 py-1 font-mono text-[11px] text-white tabular-nums outline-none"
                      />
                    </td>
                    <td className="py-1.5 pr-2">
                      <input
                        type="number"
                        step="any"
                        value={r.peH}
                        onChange={(e) => updateCell(i, 'peH', e.target.value)}
                        className="w-16 rounded border border-slate-700 bg-[#0B0E14] px-1.5 py-1 font-mono text-[11px] text-white tabular-nums outline-none"
                      />
                    </td>
                    <td className="py-1.5 pr-2">
                      <input
                        type="number"
                        step="any"
                        value={r.peL}
                        onChange={(e) => updateCell(i, 'peL', e.target.value)}
                        className="w-16 rounded border border-slate-700 bg-[#0B0E14] px-1.5 py-1 font-mono text-[11px] text-white tabular-nums outline-none"
                      />
                    </td>
                    <td className="py-1.5 pr-2 font-mono text-slate-300 tabular-nums">
                      {fmtNum(ceMP, fullPrecision)}
                    </td>
                    <td className="py-1.5 pr-2 font-mono text-slate-300 tabular-nums">
                      {fmtNum(peMP, fullPrecision)}
                    </td>
                    <td className="py-1.5 pr-2">
                      <input
                        type="number"
                        value={r.ceOI}
                        onChange={(e) => updateCell(i, 'ceOI', e.target.value)}
                        className="w-20 rounded border border-slate-700 bg-[#0B0E14] px-1.5 py-1 font-mono text-[11px] text-white tabular-nums outline-none"
                      />
                    </td>
                    <td className="py-1.5 pr-2">
                      <input
                        type="number"
                        value={r.peOI}
                        onChange={(e) => updateCell(i, 'peOI', e.target.value)}
                        className="w-20 rounded border border-slate-700 bg-[#0B0E14] px-1.5 py-1 font-mono text-[11px] text-white tabular-nums outline-none"
                      />
                    </td>
                    <td className="py-1.5 pr-2 font-mono font-bold text-amber-300 tabular-nums">
                      {fmtNum(upi, fullPrecision)}
                    </td>
                    <td className="py-1.5 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => onSendToBtst(upi)}
                        className="rounded bg-amber-400/15 px-2 py-1 text-[11px] font-semibold text-amber-300 hover:bg-amber-400 hover:text-slate-950 cursor-pointer"
                      >
                        Send to BTST
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteRow(i)}
                        aria-label="Delete UPI row"
                        className="ml-1.5 inline-flex items-center justify-center rounded p-1 text-rose-400 hover:bg-rose-500/15 cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Saved Daily Entries Archive */}
      <div className="rounded-xl border border-slate-800 bg-[#121722] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-white">Saved Daily Entries</h2>
            <p className="text-xs text-slate-400">
              Archive current Previous Day, BTST, 4 Sets, and UPI inputs locally
            </p>
          </div>
          <button
            type="button"
            onClick={onSaveSnapshot}
            className="min-h-[38px] rounded-lg border border-amber-400/40 bg-amber-400/10 px-3.5 py-1.5 text-xs font-semibold text-amber-300 hover:bg-amber-400/20 cursor-pointer"
          >
            Save Snapshot
          </button>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
          {snapshots.length === 0 ? (
            <div className="col-span-2 rounded-lg border border-dashed border-slate-800 py-8 text-center text-xs text-slate-400">
              No saved entries yet. Click Save Entry to store your current session.
            </div>
          ) : (
            snapshots.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between gap-3 rounded-lg bg-[#0B0E14] p-4"
              >
                <div>
                  <div className="text-sm font-semibold text-white">{s.label}</div>
                  <div className="mt-0.5 font-mono text-[11px] text-slate-400 tabular-nums">
                    {s.ts} · LTP {fmtNum(s.btstLtp, fullPrecision)} · UPI{' '}
                    {fmtNum(s.btstUpi, fullPrecision)} · ICP {fmtNum(s.icp, fullPrecision)}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => onLoadSnapshot(s.id)}
                    className="min-h-[36px] rounded-lg bg-amber-400 px-3 py-1.5 text-xs font-semibold text-slate-950 hover:bg-amber-300 cursor-pointer"
                  >
                    Load
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteSnapshot(s.id)}
                    className="min-h-[36px] rounded-lg border border-slate-700 px-2.5 py-1.5 text-xs text-rose-400 hover:bg-rose-500/10 cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
