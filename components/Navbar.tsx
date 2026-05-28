"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, BarChart3, ListPlus, Radar } from "lucide-react";
import { cn } from "@/lib/format";

const links = [
  { href: "/", label: "Dashboard", icon: Activity },
  { href: "/analyze", label: "新增分析", icon: Radar },
  { href: "/watchlist", label: "觀察清單", icon: BarChart3 }
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-cyan-300/10 bg-slate-950/80 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="rounded-2xl border border-cyan-300/30 bg-cyan-300/10 p-2 text-cyan-200">
            <ListPlus className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-black tracking-wide text-white sm:text-base">StockPilot AI</p>
            <p className="text-[11px] text-cyan-100/70">AI 台股觀察員</p>
          </div>
        </Link>
        <div className="flex rounded-full border border-slate-700/70 bg-slate-900/70 p-1">
          {links.map((link) => {
            const Icon = link.icon;
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold text-slate-300 transition sm:text-sm",
                  active && "bg-cyan-400/15 text-cyan-100 shadow-lg shadow-cyan-950/30"
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{link.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
