import type { CandlestickAnalysis } from "@/types/stock";

const signalColor = {
  bullish: "text-emerald-200 bg-emerald-400/10 border-emerald-400/30",
  neutral: "text-amber-200 bg-amber-400/10 border-amber-400/30",
  bearish: "text-rose-200 bg-rose-400/10 border-rose-400/30"
};

export function CandlestickAnalysisCard({ analysis }: { analysis: CandlestickAnalysis }) {
  return (
    <section className="rounded-3xl border border-slate-700/70 bg-slate-900/80 p-5 card-glow">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-bold text-white">K 線專業分析</h3>
          <p className="mt-1 text-sm text-slate-400">{analysis.summary}</p>
        </div>
        <span className={`rounded-full border px-3 py-1 text-xs font-bold ${signalColor[analysis.signal]}`}>
          {analysis.signal === "bullish" ? "偏多" : analysis.signal === "bearish" ? "偏空" : "中性"}
        </span>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {analysis.patterns.map((pattern) => (
          <span key={pattern} className="rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold text-cyan-100">
            {pattern}
          </span>
        ))}
      </div>
      <ul className="mt-5 space-y-2 text-sm leading-6 text-slate-300">
        {analysis.details.map((detail) => (
          <li key={detail} className="flex gap-2">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-300" />
            <span>{detail}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
