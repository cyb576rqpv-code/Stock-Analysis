import { cn } from "@/lib/format";
import type { RiskLevel } from "@/types/stock";

const styles: Record<RiskLevel, string> = {
  低: "border-emerald-400/40 bg-emerald-400/10 text-emerald-200",
  中: "border-amber-400/40 bg-amber-400/10 text-amber-200",
  高: "border-rose-400/40 bg-rose-400/10 text-rose-200"
};

export function RiskBadge({ level, className }: { level: RiskLevel; className?: string }) {
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold", styles[level], className)}>
      風險 {level}
    </span>
  );
}
