"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AnalysisPanel } from "@/components/AnalysisPanel";
import { ChipAnalysisCard } from "@/components/ChipAnalysisCard";
import { FundamentalCard } from "@/components/FundamentalCard";
import { IndustryTrendCard } from "@/components/IndustryTrendCard";
import { LoadingAnalysis } from "@/components/LoadingAnalysis";
import { PriceVolumeChart } from "@/components/PriceVolumeChart";
import { TechnicalIndicatorTable } from "@/components/TechnicalIndicatorTable";
import { CandlestickAnalysisCard } from "@/components/CandlestickAnalysisCard";
import { RiskBadge } from "@/components/RiskBadge";
import { StatusBadge } from "@/components/StatusBadge";
import { createAnalyzeResult } from "@/lib/stockBuilder";
import { formatDateTime, formatNumber } from "@/lib/format";
import { useWatchlist } from "@/hooks/useWatchlist";
import type { AIAnalysis, AnalyzeResult, StockDataPayload } from "@/types/stock";

export function StockDetailClient({ symbol }: { symbol: string }) {
  const { watchlist, updateStock, addStock } = useWatchlist();
  const stored = useMemo(() => watchlist.find((stock) => stock.symbol === symbol), [symbol, watchlist]);
  const [remote, setRemote] = useState<AnalyzeResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const stock = stored ?? remote;

  useEffect(() => {
    if (stored || remote || loading) return;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const stockResponse = await fetch(`/api/stock-data?symbol=${encodeURIComponent(symbol)}`);
        const stockJson = await stockResponse.json();
        if (!stockResponse.ok) throw new Error(stockJson.error || "無法取得股票資料。");
        const stockData = stockJson as StockDataPayload;
        const aiResponse = await fetch("/api/analyze-stock", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(stockData)
        });
        const aiJson = (await aiResponse.json()) as { aiAnalysis?: AIAnalysis; error?: string };
        if (!aiResponse.ok || !aiJson.aiAnalysis) throw new Error(aiJson.error || "AI 分析失敗。");
        setRemote(createAnalyzeResult(stockData, aiJson.aiAnalysis));
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : "讀取資料失敗。");
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [loading, remote, stored, symbol]);

  if (loading) return <LoadingAnalysis />;
  if (error) {
    return (
      <div className="rounded-3xl border border-rose-300/20 bg-rose-400/10 p-6 text-rose-100">
        {error}
        <div className="mt-4">
          <Link href="/analyze" className="font-bold text-white underline">
            返回新增分析
          </Link>
        </div>
      </div>
    );
  }
  if (!stock) return null;

  const updatePlan = (field: keyof AnalyzeResult["userPlan"], value: string | boolean | number | undefined) => {
    if (!stored) return;
    updateStock(stored.id, {
      userPlan: {
        ...stored.userPlan,
        [field]: value
      }
    });
  };

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-cyan-300/20 bg-slate-900/75 p-6 card-glow">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-black text-white">
                {stock.symbol} {stock.name}
              </h1>
              <StatusBadge status={stock.status} />
              <RiskBadge level={stock.riskLevel} />
            </div>
            <p className="mt-3 text-sm leading-7 text-slate-300">{stock.aiAnalysis.currentStatus}</p>
            <p className="mt-2 text-xs text-slate-500">最後更新：{formatDateTime(stock.updatedAt)}</p>
          </div>
          {!stored ? (
            <button
              type="button"
              onClick={() => addStock(stock)}
              className="rounded-full bg-cyan-300 px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-cyan-200"
            >
              加入觀察清單
            </button>
          ) : null}
        </div>
      </section>

      <PriceVolumeChart data={stock.priceHistory} />
      <div className="grid gap-6 lg:grid-cols-3">
        <Metric title="最新價格" value={formatNumber(stock.latestPrice)} />
        <Metric title="支撐 / 壓力" value={`${formatNumber(stock.technicals.support)} / ${formatNumber(stock.technicals.resistance)}`} />
        <Metric title="停損觀察價" value={formatNumber(stock.userPlan.stopLoss)} />
      </div>

      <TechnicalIndicatorTable indicators={stock.technicals} />
      <div className="grid gap-6 lg:grid-cols-2">
        <CandlestickAnalysisCard analysis={stock.candlestick} />
        <section className="rounded-3xl border border-slate-700/70 bg-slate-900/80 p-5 card-glow">
          <h3 className="font-bold text-white">均線 / 布林 / 動能解讀</h3>
          <div className="mt-4 space-y-3 text-sm leading-6 text-slate-300">
            <p>均線：MA5 {formatNumber(stock.technicals.ma5)}、MA20 {formatNumber(stock.technicals.ma20)}、MA60 {formatNumber(stock.technicals.ma60)}。</p>
            <p>布林通道：%B {formatNumber(stock.technicals.percentB, 3)}、Bandwidth {formatNumber(stock.technicals.bandwidth, 3)}，用於觀察壓縮或過熱。</p>
            <p>RSI / MACD / KD：RSI {formatNumber(stock.technicals.rsi14)}，MACD Histogram {formatNumber(stock.technicals.macdHistogram, 3)}，K/D {formatNumber(stock.technicals.k)} / {formatNumber(stock.technicals.d)}。</p>
            <p>成交量：量比 {formatNumber(stock.technicals.volumeRatio)}，若突破時未放量，訊號可信度需打折。</p>
          </div>
        </section>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <ChipAnalysisCard data={stock.chip} />
        <FundamentalCard data={stock.fundamental} />
      </div>
      <IndustryTrendCard data={stock.industry} />

      <section className="rounded-3xl border border-slate-700/70 bg-slate-900/80 p-5 card-glow">
        <h3 className="font-bold text-white">使用者交易計畫</h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <NumberField label="停損觀察價" value={stock.userPlan.stopLoss} disabled={!stored} onChange={(value) => updatePlan("stopLoss", value)} />
          <NumberField label="目標價" value={stock.userPlan.targetPrice} disabled={!stored} onChange={(value) => updatePlan("targetPrice", value)} />
          <NumberField label="平均成本" value={stock.userPlan.averageCost} disabled={!stored} onChange={(value) => updatePlan("averageCost", value)} />
        </div>
        <label className="mt-4 flex items-center gap-2 text-sm text-slate-300">
          <input
            type="checkbox"
            checked={stock.userPlan.isHolding}
            disabled={!stored}
            onChange={(event) => updatePlan("isHolding", event.target.checked)}
            className="h-4 w-4 accent-cyan-300"
          />
          是否持有
        </label>
        <textarea
          value={stock.userPlan.note}
          disabled={!stored}
          onChange={(event) => updatePlan("note", event.target.value)}
          placeholder={stored ? "記錄你的觀察條件、失敗條件與執行紀律。" : "加入觀察清單後即可編輯交易計畫。"}
          className="mt-4 min-h-28 w-full rounded-2xl border border-slate-700 bg-slate-950/70 p-3 text-sm text-white outline-none focus:border-cyan-300/60 disabled:text-slate-500"
        />
      </section>

      <section className="rounded-3xl border border-slate-700/70 bg-slate-900/80 p-5 card-glow">
        <h3 className="font-bold text-white">操作紀錄 timeline</h3>
        <div className="mt-5 space-y-4">
          <TimelineItem time={stock.createdAt} title="建立觀察卡片" body={`${stock.symbol} ${stock.name} 加入 AI 觀察流程。`} />
          <TimelineItem time={stock.updatedAt} title="最後更新" body={`目前狀態：${stock.status}，風險等級：${stock.riskLevel}。`} />
          {stock.userPlan.note ? <TimelineItem time={stock.updatedAt} title="使用者備註" body={stock.userPlan.note} /> : null}
        </div>
      </section>

      <AnalysisPanel result={stock} />
    </div>
  );
}

function Metric({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-3xl border border-slate-700/70 bg-slate-900/80 p-5 card-glow">
      <p className="text-xs text-slate-500">{title}</p>
      <p className="mt-2 text-2xl font-black text-white">{value}</p>
    </div>
  );
}

function NumberField({
  label,
  value,
  disabled,
  onChange
}: {
  label: string;
  value?: number;
  disabled?: boolean;
  onChange: (value?: number) => void;
}) {
  return (
    <label>
      <span className="text-xs text-slate-400">{label}</span>
      <input
        type="number"
        value={value ?? ""}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value === "" ? undefined : Number(event.target.value))}
        className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950/70 p-3 text-sm text-white outline-none focus:border-cyan-300/60 disabled:text-slate-500"
      />
    </label>
  );
}

function TimelineItem({ time, title, body }: { time: string; title: string; body: string }) {
  return (
    <div className="flex gap-3">
      <div className="mt-1 h-3 w-3 rounded-full bg-cyan-300 shadow-lg shadow-cyan-300/30" />
      <div>
        <p className="text-sm font-bold text-white">{title}</p>
        <p className="text-xs text-slate-500">{formatDateTime(time)}</p>
        <p className="mt-1 text-sm leading-6 text-slate-300">{body}</p>
      </div>
    </div>
  );
}
