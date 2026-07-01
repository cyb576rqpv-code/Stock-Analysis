import type { MarketState, Portfolio, Transaction } from '../types'
import { createInitialStocks } from './market'

const STORAGE_KEY = 'stock-market-simulator'

const INITIAL_CASH = 1_000_000

export function createInitialState(): MarketState {
  return {
    stocks: createInitialStocks(),
    portfolio: {
      cash: INITIAL_CASH,
      holdings: [],
      transactions: [],
    },
  }
}

export function loadState(): MarketState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return createInitialState()
    const parsed = JSON.parse(raw) as MarketState
    if (!parsed.stocks?.length || !parsed.portfolio) return createInitialState()
    return parsed
  } catch {
    return createInitialState()
  }
}

export function saveState(state: MarketState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export function buyStock(
  portfolio: Portfolio,
  symbol: string,
  shares: number,
  price: number,
): Portfolio | null {
  const total = shares * price
  if (shares <= 0 || total > portfolio.cash) return null

  const existing = portfolio.holdings.find((h) => h.symbol === symbol)
  let holdings = [...portfolio.holdings]

  if (existing) {
    const newShares = existing.shares + shares
    const newAvgCost = (existing.avgCost * existing.shares + total) / newShares
    holdings = holdings.map((h) =>
      h.symbol === symbol ? { ...h, shares: newShares, avgCost: newAvgCost } : h,
    )
  } else {
    holdings.push({ symbol, shares, avgCost: price })
  }

  const transaction: Transaction = {
    id: crypto.randomUUID(),
    symbol,
    type: 'buy',
    shares,
    price,
    total,
    timestamp: Date.now(),
  }

  return {
    cash: portfolio.cash - total,
    holdings,
    transactions: [transaction, ...portfolio.transactions],
  }
}

export function sellStock(
  portfolio: Portfolio,
  symbol: string,
  shares: number,
  price: number,
): Portfolio | null {
  const holding = portfolio.holdings.find((h) => h.symbol === symbol)
  if (!holding || shares <= 0 || shares > holding.shares) return null

  const total = shares * price
  let holdings = [...portfolio.holdings]

  if (shares === holding.shares) {
    holdings = holdings.filter((h) => h.symbol !== symbol)
  } else {
    holdings = holdings.map((h) =>
      h.symbol === symbol ? { ...h, shares: h.shares - shares } : h,
    )
  }

  const transaction: Transaction = {
    id: crypto.randomUUID(),
    symbol,
    type: 'sell',
    shares,
    price,
    total,
    timestamp: Date.now(),
  }

  return {
    cash: portfolio.cash + total,
    holdings,
    transactions: [transaction, ...portfolio.transactions],
  }
}

export function resetPortfolio(): Portfolio {
  return createInitialState().portfolio
}
