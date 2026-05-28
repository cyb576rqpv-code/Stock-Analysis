import type { StockCard } from "@/types/stock";
import { CandlestickAnalysisCard } from "@/components/CandlestickAnalysisCard";
import { ChipAnalysisCard } from "@/components/ChipAnalysisCard";
import { FundamentalCard } from "@/components/FundamentalCard";
import { IndustryTrendCard } from "@/components/IndustryTrendCard";
import { RiskBadge } from "@/components/RiskBadge";
import { ScoreBar } from "@/components/ScoreBar";
import { StatusBadge } from "@/components/StatusBadge";
import { TechnicalIndicatorTable } from "@/components/TechnicalIndicatorTable";
import { formatNumber } from "@/lib/format";

export function AnalysisPanel({
  result,
  onAdd,
  added
}: {
  result: StockCard & { source?: "finmind" | "mock" };
  onAdd?: () => void;
  added?: boolean;
}) {
  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-cyan-300/20 bg-slate-900/85 p-6 card-glow">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-3xl font-black text-white">
                {result.symbol} {result.name}
              </h2>
              <StatusBadge status={result.status} />
              <RiskBadge level={result.riskLevel} />
            </div>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">{result.aiAnalysis.currentStatus}</p>
            <p className="mt-2 text-xs text-cyan-100/70">
              資料來源：{result.source === "finmind" ? "FinMind API" : "Mock data fallback / localStorage"}
            </p>
          </div>
          <div className="min-w-52 rounded-3xl border border-slate-700/70 bg-slate-950/60 p-4">
            <p className="text-xs text-slate-500">最新價</p>
            <p className="mt-1 text-4xl font-black text-white">{formatNumber(result.latestPrice)}</p>
            <p className={result.changePercent >= 0 ? "text-sm font-bold text-emerald-300" : "text-sm font-bold text-rose-300"}>
              {result.changePercent >= 0 ? "+" : ""}
              {formatNumber(result.changePercent)}%
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <ScoreBar label="技術分數" value={result.technicalScore} />
          <ScoreBar label="基本面分數" value={result.fundamentalScore} tone="emerald" />
          <ScoreBar label="籌碼分數" value={result.chipScore} tone="amber" />
        </div>

        {onAdd ? (
          <button
            type="button"
            onClick={onAdd}
            disabled={added}
            className="mt-6 rounded-full bg-cyan-300 px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
          >
            {added ? "已加入觀察清單" : "加入觀察清單"}
          </button>
        ) : null}
      </section>

      <section className="rounded-3xl border border-slate-700/70 bg-slate-900/80 p-5 card-glow">
        <h3 className="font-bold text-white">AI 完整分析報告</h3>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <ReportBlock title="技術面重點" body={result.aiAnalysis.technicalSummary} />
          <ReportBlock title="K 線解讀" body={result.aiAnalysis.candlestickSummary} />
          <ReportBlock title="籌碼面解讀" body={result.aiAnalysis.chipSummary} />
          <ReportBlock title="基本面解讀" body={result.aiAnalysis.fundamentalSummary} />
          <ReportBlock title="公司前景 / 產業趨勢" body={result.aiAnalysis.industrySummary} />
          <ReportBlock title="適合策略" body={result.aiAnalysis.strategy} />
        </div>
        <div className="mt-5 grid gap-4 lg:grid-cols-4">
          <ReportList title="偏多理由" items={result.aiAnalysis.bullishPoints} />
          <ReportList title="風險理由" items={result.aiAnalysis.riskPoints} danger />
          <ReportList title="觀察條件" items={result.aiAnalysis.watchConditions} />
          <ReportList title="失敗條件" items={result.aiAnalysis.failureConditions} danger />
        </div>
        <p className="mt-5 rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4 text-sm leading-6 text-amber-100">
          {result.aiAnalysis.disclaimer}
        </p>
      </section>

      <TechnicalIndicatorTable indicators={result.technicals} />
      <CandlestickAnalysisCard analysis={result.candlestick} />
      <div className="grid gap-6 lg:grid-cols-2">
        <FundamentalCard data={result.fundamental} />
        <ChipAnalysisCard data={result.chip} />
      </div>
      <IndustryTrendCard data={result.industry} />
    </div>
  );
}

function ReportBlock({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl bg-slate-950/60 p-4">
      <p className="text-sm font-bold text-cyan-100">{title}</p>
      <p className="mt-2 text-sm leading-6 text-slate-300">{body}</p>
    </div>
  );
}

function ReportList({ title, items, danger = false }: { title: string; items: string[]; danger?: boolean }) {
  return (
    <div className="rounded-2xl bg-slate-950/60 p-4">
      <p className={danger ? "text-sm font-bold text-rose-200" : "text-sm font-bold text-cyan-100"}>{title}</p>
      <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-300">
        {items.map((item) => (
          <li key={item} className="flex gap-2">
            <span className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${danger ? "bg-rose-300" : "bg-cyan-300"}`} />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
