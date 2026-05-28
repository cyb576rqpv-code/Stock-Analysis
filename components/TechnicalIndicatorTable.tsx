import { formatCompact, formatNumber } from "@/lib/format";
import type { TechnicalIndicators } from "@/types/stock";

export function TechnicalIndicatorTable({ indicators }: { indicators: TechnicalIndicators }) {
  const rows = [
    ["MA5", indicators.ma5],
    ["MA10", indicators.ma10],
    ["MA20", indicators.ma20],
    ["MA60", indicators.ma60],
    ["布林上緣", indicators.bollingerUpper],
    ["布林中線", indicators.bollingerMiddle],
    ["布林下緣", indicators.bollingerLower],
    ["%B", indicators.percentB],
    ["Bandwidth", indicators.bandwidth],
    ["RSI 14", indicators.rsi14],
    ["MACD DIF", indicators.macdDif],
    ["MACD DEA", indicators.macdDea],
    ["MACD Histogram", indicators.macdHistogram],
    ["KD K", indicators.k],
    ["KD D", indicators.d],
    ["5 日均量", indicators.volumeMa5, "compact"],
    ["20 日均量", indicators.volumeMa20, "compact"],
    ["量比", indicators.volumeRatio],
    ["支撐", indicators.support],
    ["壓力", indicators.resistance]
  ] as const;

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-700/70 bg-slate-900/80 card-glow">
      <div className="border-b border-slate-700/60 px-5 py-4">
        <h3 className="font-bold text-white">技術指標表</h3>
        <p className="mt-1 text-xs text-slate-400">最近 120 個交易日計算結果</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4">
        {rows.map(([label, value, mode]) => (
          <div key={label} className="border-b border-r border-slate-800/80 p-4">
            <p className="text-xs text-slate-500">{label}</p>
            <p className="mt-1 text-lg font-bold text-cyan-50">
              {mode === "compact" ? formatCompact(value) : formatNumber(value, label.includes("%B") || label.includes("Bandwidth") ? 3 : 2)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
