import { cn } from "@/lib/format";
import type { StockStatus } from "@/types/stock";

const styles: Record<StockStatus, string> = {
  趨勢偏強: "border-emerald-400/40 bg-emerald-400/10 text-emerald-200",
  放量突破: "border-cyan-400/40 bg-cyan-400/10 text-cyan-200",
  回測觀察: "border-sky-400/40 bg-sky-400/10 text-sky-200",
  盤整壓縮: "border-amber-400/40 bg-amber-400/10 text-amber-200",
  過熱風險: "border-orange-400/40 bg-orange-400/10 text-orange-200",
  跌破警示: "border-rose-400/40 bg-rose-400/10 text-rose-200",
  弱勢整理: "border-slate-400/40 bg-slate-400/10 text-slate-200"
};

export function StatusBadge({ status, className }: { status: StockStatus; className?: string }) {
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold", styles[status], className)}>
      {status}
    </span>
  );
}
