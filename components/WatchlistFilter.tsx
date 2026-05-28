import { cn } from "@/lib/format";
import type { StockStatus } from "@/types/stock";

export type WatchlistFilterValue = "全部" | StockStatus | "已持有";

const filters: WatchlistFilterValue[] = [
  "全部",
  "趨勢偏強",
  "放量突破",
  "回測觀察",
  "盤整壓縮",
  "過熱風險",
  "跌破警示",
  "已持有"
];

export function WatchlistFilter({
  value,
  onChange
}: {
  value: WatchlistFilterValue;
  onChange: (value: WatchlistFilterValue) => void;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {filters.map((filter) => (
        <button
          key={filter}
          type="button"
          onClick={() => onChange(filter)}
          className={cn(
            "shrink-0 rounded-full border border-slate-700 bg-slate-900/70 px-4 py-2 text-sm font-semibold text-slate-300 transition",
            value === filter && "border-cyan-300/50 bg-cyan-300/15 text-cyan-100"
          )}
        >
          {filter}
        </button>
      ))}
    </div>
  );
}
