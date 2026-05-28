import { cn } from "@/lib/format";

export function ScoreBar({
  label,
  value,
  tone = "cyan"
}: {
  label: string;
  value: number;
  tone?: "cyan" | "emerald" | "amber";
}) {
  const color =
    tone === "emerald" ? "from-emerald-400 to-teal-300" : tone === "amber" ? "from-amber-300 to-orange-300" : "from-cyan-300 to-blue-400";

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs text-slate-300">
        <span>{label}</span>
        <span className="font-semibold text-white">{value}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-800">
        <div className={cn("h-full rounded-full bg-gradient-to-r", color)} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
      </div>
    </div>
  );
}
