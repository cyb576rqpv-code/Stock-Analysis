import Link from "next/link";
import { Search } from "lucide-react";

export function EmptyState({
  title = "尚無觀察標的",
  description = "輸入股票代號建立第一張 AI 觀察卡片。"
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="rounded-3xl border border-dashed border-cyan-300/20 bg-slate-900/50 p-8 text-center card-glow">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-200">
        <Search className="h-6 w-6" />
      </div>
      <h3 className="text-lg font-bold text-white">{title}</h3>
      <p className="mt-2 text-sm text-slate-400">{description}</p>
      <Link
        href="/analyze"
        className="mt-5 inline-flex rounded-full bg-cyan-300 px-5 py-2 text-sm font-bold text-slate-950 transition hover:bg-cyan-200"
      >
        開始分析
      </Link>
    </div>
  );
}
