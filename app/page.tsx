"use client";

import Link from "next/link";
import { AlertTriangle, Clock, Layers, Radar, ShieldAlert, TrendingUp } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { StockCard } from "@/components/StockCard";
import { formatDateTime } from "@/lib/format";
import { useWatchlist } from "@/hooks/useWatchlist";
import type { StockCard as StockCardType, StockStatus } from "@/types/stock";

const sections: { title: string; status: StockStatus; description: string }[] = [
  { title: "放量突破", status: "放量突破", description: "價格突破並搭配量能放大" },
  { title: "回測觀察", status: "回測觀察", description: "回測均線與支撐，等待止跌確認" },
  { title: "盤整壓縮", status: "盤整壓縮", description: "波動收斂，觀察方向選擇" },
  { title: "風險警示", status: "跌破警示", description: "跌破支撐或技術結構轉弱" }
];

export default function DashboardPage() {
  const { watchlist, isLoaded } = useWatchlist();
  const latestUpdated = watchlist
    .map((stock) => stock.updatedAt)
    .sort()
    .at(-1);
  const stats = [
    { label: "觀察清單總數", value: watchlist.length, icon: Layers },
    { label: "今日觸發觀察條件", value: countTriggeredToday(watchlist), icon: Radar },
    { label: "風險警示", value: watchlist.filter((stock) => stock.riskLevel === "高" || stock.status === "跌破警示").length, icon: ShieldAlert },
    { label: "趨勢偏強", value: watchlist.filter((stock) => stock.status === "趨勢偏強").length, icon: TrendingUp },
    { label: "盤整壓縮", value: watchlist.filter((stock) => stock.status === "盤整壓縮").length, icon: AlertTriangle },
    { label: "最近更新", value: formatDateTime(latestUpdated), icon: Clock, wide: true }
  ];

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-cyan-300/20 bg-slate-900/75 p-6 card-glow">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-cyan-200">StockPilot AI</p>
            <h1 className="mt-3 text-3xl font-black text-white sm:text-5xl">AI 台股觀察員</h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">
              整合股價、技術指標、K 線型態、基本面與籌碼面，將觀察條件、風險與失敗條件整理成可追蹤卡片。
            </p>
          </div>
          <Link
            href="/analyze"
            className="inline-flex items-center justify-center rounded-full bg-cyan-300 px-6 py-3 text-sm font-black text-slate-950 transition hover:bg-cyan-200"
          >
            新增股票分析
          </Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className={`rounded-3xl border border-slate-700/70 bg-slate-900/75 p-5 card-glow ${stat.wide ? "lg:col-span-1" : ""}`}
            >
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-400">{stat.label}</p>
                <Icon className="h-4 w-4 text-cyan-200" />
              </div>
              <p className="mt-3 text-2xl font-black text-white">{stat.value}</p>
            </div>
          );
        })}
      </section>

      {!isLoaded ? null : watchlist.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid gap-6 xl:grid-cols-2">
          {sections.map((section) => {
            const stocks =
              section.status === "跌破警示"
                ? watchlist.filter((stock) => stock.status === "跌破警示" || stock.riskLevel === "高")
                : watchlist.filter((stock) => stock.status === section.status);
            return (
              <section key={section.title} className="rounded-3xl border border-slate-700/70 bg-slate-950/30 p-4">
                <div className="mb-4">
                  <h2 className="text-xl font-black text-white">{section.title}</h2>
                  <p className="mt-1 text-sm text-slate-400">{section.description}</p>
                </div>
                {stocks.length ? (
                  <div className="grid gap-4">
                    {stocks.slice(0, 3).map((stock) => (
                      <StockCard key={stock.id} stock={stock} compact />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-700 p-6 text-center text-sm text-slate-500">
                    目前沒有符合此分類的股票
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

function countTriggeredToday(stocks: StockCardType[]) {
  const today = new Date().toISOString().slice(0, 10);
  return stocks.filter((stock) => {
    const updatedToday = stock.updatedAt.slice(0, 10) === today;
    return updatedToday && ["放量突破", "回測觀察", "跌破警示", "過熱風險"].includes(stock.status);
  }).length;
}
