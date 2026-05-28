"use client";

import { FormEvent, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { AnalysisPanel } from "@/components/AnalysisPanel";
import { LoadingAnalysis } from "@/components/LoadingAnalysis";
import { createAnalyzeResult } from "@/lib/stockBuilder";
import { useWatchlist } from "@/hooks/useWatchlist";
import type { AIAnalysis, AnalyzeResult, StockDataPayload } from "@/types/stock";

export default function AnalyzePage() {
  const [symbol, setSymbol] = useState("2330");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<AnalyzeResult | null>(null);
  const { watchlist, addStock } = useWatchlist();
  const added = useMemo(
    () => Boolean(result && watchlist.some((stock) => stock.symbol === result.symbol)),
    [result, watchlist]
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalized = symbol.trim();
    if (!normalized) {
      setError("請輸入股票代號，例如 2330。");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const stockResponse = await fetch(`/api/stock-data?symbol=${encodeURIComponent(normalized)}`);
      const stockJson = await stockResponse.json();
      if (!stockResponse.ok) throw new Error(stockJson.error || "無法取得股票資料。");
      const stockData = stockJson as StockDataPayload;
      if (!stockData.priceHistory?.length) throw new Error("查無可用股價資料，請確認股票代號。");

      const aiResponse = await fetch("/api/analyze-stock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(stockData)
      });
      const aiJson = (await aiResponse.json()) as { aiAnalysis?: AIAnalysis; error?: string };
      if (!aiResponse.ok || !aiJson.aiAnalysis) throw new Error(aiJson.error || "AI 分析暫時無法完成。");

      setResult(createAnalyzeResult(stockData, aiJson.aiAnalysis));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "分析失敗，請稍後再試。");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-cyan-300/20 bg-slate-900/75 p-6 card-glow">
        <p className="text-sm font-bold uppercase tracking-[0.3em] text-cyan-200">Analyze</p>
        <h1 className="mt-3 text-3xl font-black text-white">新增股票分析</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
          輸入台股代號後，系統會抓取最近 120 個交易日資料，計算技術指標、K 線型態、基本面、籌碼面，並產生 AI 觀察報告。
        </p>
        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3 sm:flex-row">
          <label className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
            <input
              value={symbol}
              onChange={(event) => setSymbol(event.target.value)}
              placeholder="輸入股票代號，例如 2330"
              className="w-full rounded-full border border-slate-700 bg-slate-950/80 py-3 pl-12 pr-4 text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-300/60"
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="rounded-full bg-cyan-300 px-6 py-3 text-sm font-black text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
          >
            {loading ? "分析中..." : "開始分析"}
          </button>
        </form>
        {error ? (
          <p className="mt-4 rounded-2xl border border-rose-300/20 bg-rose-400/10 p-4 text-sm text-rose-100">{error}</p>
        ) : null}
      </section>

      {loading ? <LoadingAnalysis /> : null}
      {result ? <AnalysisPanel result={result} added={added} onAdd={() => addStock(result)} /> : null}
    </div>
  );
}
