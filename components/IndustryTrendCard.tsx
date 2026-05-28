import type { IndustryTrendAnalysis } from "@/types/stock";

const trendText = {
  positive: "正向",
  neutral: "中性",
  negative: "負向",
  unknown: "未知"
};

export function IndustryTrendCard({ data }: { data: IndustryTrendAnalysis }) {
  return (
    <section className="rounded-3xl border border-slate-700/70 bg-slate-900/80 p-5 card-glow">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-bold text-white">產業趨勢分析</h3>
          <p className="mt-1 text-sm text-slate-400">{data.industry}</p>
        </div>
        <span className="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-3 py-1 text-xs font-bold text-cyan-100">
          {trendText[data.trend]}
        </span>
      </div>
      <p className="mt-4 text-sm leading-6 text-slate-300">{data.summary}</p>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <List title="機會" items={data.opportunities} color="bg-emerald-300" />
        <List title="風險" items={data.risks} color="bg-rose-300" />
      </div>
    </section>
  );
}

function List({ title, items, color }: { title: string; items: string[]; color: string }) {
  return (
    <div>
      <p className="text-sm font-bold text-white">{title}</p>
      <ul className="mt-2 space-y-2 text-sm text-slate-300">
        {items.map((item) => (
          <li key={item} className="flex gap-2">
            <span className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${color}`} />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
