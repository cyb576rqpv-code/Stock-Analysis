"use client";

import Link from "next/link";
import { Trash2 } from "lucide-react";
import { formatDateTime, formatNumber } from "@/lib/format";
import type { StockCard as StockCardType } from "@/types/stock";
import { RiskBadge } from "@/components/RiskBadge";
import { ScoreBar } from "@/components/ScoreBar";
import { StatusBadge } from "@/components/StatusBadge";

export function StockCard({
  stock,
  onRemove,
  compact = false
}: {
  stock: StockCardType;
  onRemove?: (id: string) => void;
  compact?: boolean;
}) {
  const positive = stock.changePercent >= 0;

  return (
    <article className="rounded-3xl border border-slate-700/70 bg-slate-900/80 p-5 card-glow transition hover:border-cyan-300/40">
      <div className="flex items-start justify-between gap-3">
        <Link href={`/stock/${stock.symbol}`} className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-xl font-black text-white">{stock.symbol}</h3>
            <span className="truncate text-sm text-slate-300">{stock.name}</span>
          </div>
          <div className="mt-3 flex items-end gap-2">
            <span className="text-3xl font-black text-white">{formatNumber(stock.latestPrice)}</span>
            <span className={positive ? "pb-1 text-sm font-bold text-emerald-300" : "pb-1 text-sm font-bold text-rose-300"}>
              {positive ? "+" : ""}
              {formatNumber(stock.changePercent)}%
            </span>
          </div>
        </Link>
        {onRemove ? (
          <button
            type="button"
            onClick={() => onRemove(stock.id)}
            className="rounded-full border border-rose-300/20 p-2 text-rose-200 transition hover:bg-rose-400/10"
            aria-label="刪除觀察卡片"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <StatusBadge status={stock.status} />
        <RiskBadge level={stock.riskLevel} />
        {stock.userPlan.isHolding ? (
          <span className="rounded-full border border-blue-300/40 bg-blue-400/10 px-2.5 py-1 text-xs font-semibold text-blue-200">
            已持有
          </span>
        ) : null}
      </div>

      {!compact ? (
        <div className="mt-5 space-y-3">
          <ScoreBar label="技術分數" value={stock.technicalScore} />
          <ScoreBar label="基本面分數" value={stock.fundamentalScore} tone="emerald" />
          <ScoreBar label="籌碼分數" value={stock.chipScore} tone="amber" />
        </div>
      ) : null}

      <p className="mt-5 line-clamp-3 text-sm leading-6 text-slate-300">{stock.aiAnalysis.currentStatus}</p>
      <div className="mt-5 grid grid-cols-3 gap-2 rounded-2xl border border-slate-700/60 bg-slate-950/50 p-3 text-xs">
        <div>
          <p className="text-slate-500">支撐</p>
          <p className="mt-1 font-bold text-cyan-100">{formatNumber(stock.technicals.support)}</p>
        </div>
        <div>
          <p className="text-slate-500">壓力</p>
          <p className="mt-1 font-bold text-cyan-100">{formatNumber(stock.technicals.resistance)}</p>
        </div>
        <div>
          <p className="text-slate-500">停損觀察</p>
          <p className="mt-1 font-bold text-cyan-100">{formatNumber(stock.userPlan.stopLoss)}</p>
        </div>
      </div>
      <p className="mt-4 text-xs text-slate-500">更新：{formatDateTime(stock.updatedAt)}</p>
    </article>
  );
}
