"use client";

import { useMemo, useState } from "react";
import { EmptyState } from "@/components/EmptyState";
import { StockCard } from "@/components/StockCard";
import { WatchlistFilter, type WatchlistFilterValue } from "@/components/WatchlistFilter";
import { formatNumber } from "@/lib/format";
import { useWatchlist } from "@/hooks/useWatchlist";
import type { StockCard as StockCardType } from "@/types/stock";

export default function WatchlistPage() {
  const { watchlist, isLoaded, removeStock, updateStock } = useWatchlist();
  const [filter, setFilter] = useState<WatchlistFilterValue>("全部");
  const filtered = useMemo(() => {
    if (filter === "全部") return watchlist;
    if (filter === "已持有") return watchlist.filter((stock) => stock.userPlan.isHolding);
    return watchlist.filter((stock) => stock.status === filter);
  }, [filter, watchlist]);

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-cyan-300/20 bg-slate-900/75 p-6 card-glow">
        <p className="text-sm font-bold uppercase tracking-[0.3em] text-cyan-200">Watchlist</p>
        <h1 className="mt-3 text-3xl font-black text-white">觀察清單</h1>
        <p className="mt-3 text-sm leading-7 text-slate-300">
          管理股票卡片、交易計畫、停損觀察價、目標價、持有狀態與備註。資料會儲存在瀏覽器 localStorage。
        </p>
      </section>

      <WatchlistFilter value={filter} onChange={setFilter} />

      {!isLoaded ? null : watchlist.length === 0 ? (
        <EmptyState />
      ) : filtered.length === 0 ? (
        <EmptyState title="沒有符合篩選的股票" description="切換分類或新增其他股票分析。" />
      ) : (
        <div className="grid gap-6 xl:grid-cols-2">
          {filtered.map((stock) => (
            <div key={stock.id} className="space-y-3">
              <StockCard stock={stock} onRemove={removeStock} />
              <PlanEditor stock={stock} onUpdate={(next) => updateStock(stock.id, next)} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PlanEditor({
  stock,
  onUpdate
}: {
  stock: StockCardType;
  onUpdate: (partial: Partial<StockCardType>) => void;
}) {
  const updatePlan = (field: keyof StockCardType["userPlan"], value: string | boolean | number | undefined) => {
    onUpdate({
      userPlan: {
        ...stock.userPlan,
        [field]: value
      }
    });
  };

  return (
    <section className="rounded-3xl border border-slate-700/70 bg-slate-900/70 p-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-bold text-white">交易觀察計畫</h3>
        <label className="flex items-center gap-2 text-sm text-slate-300">
          <input
            type="checkbox"
            checked={stock.userPlan.isHolding}
            onChange={(event) => updatePlan("isHolding", event.target.checked)}
            className="h-4 w-4 accent-cyan-300"
          />
          已持有
        </label>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <NumberField
          label="停損觀察價"
          value={stock.userPlan.stopLoss}
          onChange={(value) => updatePlan("stopLoss", value)}
        />
        <NumberField
          label="目標價"
          value={stock.userPlan.targetPrice}
          onChange={(value) => updatePlan("targetPrice", value)}
        />
        <NumberField
          label="平均成本"
          value={stock.userPlan.averageCost}
          onChange={(value) => updatePlan("averageCost", value)}
        />
      </div>
      <label className="mt-4 block">
        <span className="text-xs text-slate-400">使用者備註</span>
        <textarea
          value={stock.userPlan.note}
          onChange={(event) => updatePlan("note", event.target.value)}
          placeholder={`例如：站穩 ${formatNumber(stock.technicals.resistance)} 且量能放大再觀察。`}
          className="mt-2 min-h-24 w-full rounded-2xl border border-slate-700 bg-slate-950/70 p-3 text-sm text-white outline-none focus:border-cyan-300/60"
        />
      </label>
    </section>
  );
}

function NumberField({
  label,
  value,
  onChange
}: {
  label: string;
  value?: number;
  onChange: (value?: number) => void;
}) {
  return (
    <label>
      <span className="text-xs text-slate-400">{label}</span>
      <input
        type="number"
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value === "" ? undefined : Number(event.target.value))}
        className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950/70 p-3 text-sm text-white outline-none focus:border-cyan-300/60"
      />
    </label>
  );
}
