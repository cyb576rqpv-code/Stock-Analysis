export function LoadingAnalysis() {
  return (
    <div className="rounded-3xl border border-cyan-300/20 bg-slate-900/70 p-6 card-glow">
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-cyan-300/20 border-t-cyan-300" />
        <div>
          <p className="font-bold text-white">AI 觀察員正在分析...</p>
          <p className="text-sm text-slate-400">擷取價格資料、計算指標、整理風險與觀察條件。</p>
        </div>
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {[0, 1, 2].map((item) => (
          <div key={item} className="h-24 animate-pulse rounded-2xl bg-slate-800/80" />
        ))}
      </div>
    </div>
  );
}
