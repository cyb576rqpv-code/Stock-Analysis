import { formatNumber } from "@/lib/format";
import type { FundamentalAnalysis } from "@/types/stock";
import { ScoreBar } from "@/components/ScoreBar";

export function FundamentalCard({ data }: { data: FundamentalAnalysis }) {
  const metrics = [
    ["PER", data.per],
    ["PBR", data.pbr],
    ["月營收 YoY", data.monthlyRevenueYoY],
    ["EPS", data.eps],
    ["毛利率", data.grossMargin],
    ["營益率", data.operatingMargin]
  ];

  return (
    <section className="rounded-3xl border border-slate-700/70 bg-slate-900/80 p-5 card-glow">
      <h3 className="font-bold text-white">基本面分析</h3>
      <p className="mt-2 text-sm leading-6 text-slate-300">{data.summary}</p>
      <div className="mt-5">
        <ScoreBar label="基本面評分" value={data.score} tone="emerald" />
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {metrics.map(([label, value]) => (
          <div key={label} className="rounded-2xl bg-slate-950/60 p-3">
            <p className="text-xs text-slate-500">{label}</p>
            <p className="mt-1 font-bold text-cyan-50">{formatNumber(value as number | undefined)}</p>
          </div>
        ))}
      </div>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <List title="優勢" items={data.strengths} tone="emerald" />
        <List title="風險" items={data.risks} tone="rose" />
      </div>
    </section>
  );
}

function List({ title, items, tone }: { title: string; items: string[]; tone: "emerald" | "rose" }) {
  return (
    <div>
      <p className="text-sm font-bold text-white">{title}</p>
      <ul className="mt-2 space-y-2 text-sm text-slate-300">
        {items.map((item) => (
          <li key={item} className="flex gap-2">
            <span className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${tone === "emerald" ? "bg-emerald-300" : "bg-rose-300"}`} />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
