"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { calculateMASeries } from "@/lib/indicators";
import type { StockPriceData } from "@/types/stock";

export function PriceVolumeChart({ data }: { data: StockPriceData[] }) {
  const ma5 = calculateMASeries(data, 5);
  const ma20 = calculateMASeries(data, 20);
  const ma60 = calculateMASeries(data, 60);
  const chartData = data.map((item, index) => ({
    date: item.date.slice(5),
    close: item.close,
    volume: item.volume,
    ma5: ma5[index]?.value,
    ma20: ma20[index]?.value,
    ma60: ma60[index]?.value
  }));

  return (
    <section className="rounded-3xl border border-slate-700/70 bg-slate-900/80 p-5 card-glow">
      <h3 className="font-bold text-white">價格與量能圖表</h3>
      <p className="mt-1 text-sm text-slate-400">收盤價、MA5 / MA20 / MA60 與成交量</p>
      <div className="mt-5 h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
            <XAxis dataKey="date" stroke="#94a3b8" minTickGap={24} />
            <YAxis stroke="#94a3b8" domain={["dataMin - 5", "dataMax + 5"]} />
            <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 16 }} />
            <Legend />
            <Line type="monotone" dataKey="close" name="收盤價" stroke="#22d3ee" dot={false} strokeWidth={2} />
            <Line type="monotone" dataKey="ma5" name="MA5" stroke="#34d399" dot={false} strokeWidth={1.5} />
            <Line type="monotone" dataKey="ma20" name="MA20" stroke="#fbbf24" dot={false} strokeWidth={1.5} />
            <Line type="monotone" dataKey="ma60" name="MA60" stroke="#a78bfa" dot={false} strokeWidth={1.5} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-5 h-44">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
            <XAxis dataKey="date" stroke="#94a3b8" minTickGap={24} />
            <YAxis stroke="#94a3b8" />
            <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 16 }} />
            <Bar dataKey="volume" name="成交量" fill="#38bdf8" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
