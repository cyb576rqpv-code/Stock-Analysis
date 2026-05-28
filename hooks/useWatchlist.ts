"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { StockCard } from "@/types/stock";

const STORAGE_KEY = "stockpilot_watchlist";

function safeRead(): StockCard[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as StockCard[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function safeWrite(stocks: StockCard[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stocks));
  } catch {
    // localStorage can be unavailable in private mode; the in-memory state still works for this session.
  }
}

export function useWatchlist() {
  const [watchlist, setWatchlist] = useState<StockCard[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Reading localStorage after hydration avoids server/client markup mismatches.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setWatchlist(safeRead());
    setIsLoaded(true);
  }, []);

  const persist = useCallback((updater: (current: StockCard[]) => StockCard[]) => {
    setWatchlist((current) => {
      const next = updater(current);
      safeWrite(next);
      return next;
    });
  }, []);

  const getWatchlist = useCallback(() => safeRead(), []);

  const addStock = useCallback(
    (stock: StockCard) => {
      persist((current) => {
        const withoutSameSymbol = current.filter((item) => item.symbol !== stock.symbol);
        return [{ ...stock, updatedAt: new Date().toISOString() }, ...withoutSameSymbol];
      });
    },
    [persist]
  );

  const removeStock = useCallback(
    (id: string) => {
      persist((current) => current.filter((item) => item.id !== id));
    },
    [persist]
  );

  const updateStock = useCallback(
    (id: string, partialData: Partial<StockCard>) => {
      persist((current) =>
        current.map((item) =>
          item.id === id ? { ...item, ...partialData, updatedAt: new Date().toISOString() } : item
        )
      );
    },
    [persist]
  );

  const clearWatchlist = useCallback(() => {
    persist(() => []);
  }, [persist]);

  return useMemo(
    () => ({
      watchlist,
      isLoaded,
      getWatchlist,
      addStock,
      removeStock,
      updateStock,
      clearWatchlist
    }),
    [addStock, clearWatchlist, getWatchlist, isLoaded, removeStock, updateStock, watchlist]
  );
}
