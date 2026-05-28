import { formatCompact } from "@/lib/format";
import type { ChipAnalysis } from "@/types/stock";
import { ScoreBar } from "@/components/ScoreBar";

export function ChipAnalysisCard({ data }: { data: ChipAnalysis }) {
  const metrics: [string, number | undefined][] = [
    ["外資近 5 日", data.foreignInvestorNetBuy5d],
    ["投信近 5 日", data.investmentTrustNetBuy5d],
    ["自營商近 5 日", data.dealerNetBuy5d],
    ["融資變化", data.marginBalanceChange],
    ["融券變化", data.shortBalanceChange]
  ];

  return (
    <section className="rounded-3xl border border-slate-700/70 bg-slate-900/80 p-5 card-glow">
      <h3 className="font-bold text-white">籌碼面分析</h3>
      <p className="mt-2 text-sm leading-6 text-slate-300">{data.summary}</p>
      <div className="mt-5">
        <ScoreBar label="籌碼面評分" value={data.score} tone="amber" />
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {metrics.map(([label, value]) => (
          <div key={label} className="rounded-2xl bg-slate-950/60 p-3">
            <p className="text-xs text-slate-500">{label}</p>
            <p className={(value ?? 0) >= 0 ? "mt-1 font-bold text-emerald-200" : "mt-1 font-bold text-rose-200"}>
              {formatCompact(value)}
            </p>
          </div>
        ))}
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        {data.signals.map((signal) => (
          <span key={signal} className="rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1 text-xs font-semibold text-amber-100">
            {signal}
          </span>
        ))}
      </div>
    </section>
  );
}
