import { useCallback, useEffect, useRef, useState } from 'react'
import type { MarketState } from '../types'
import { tickPrice } from '../utils/market'
import {
  buyStock,
  loadState,
  resetPortfolio,
  saveState,
  sellStock,
} from '../utils/portfolio'

const TICK_INTERVAL = 2000

export function useMarket() {
  const [state, setState] = useState<MarketState>(loadState)
  const stateRef = useRef(state)
  stateRef.current = state

  useEffect(() => {
    saveState(state)
  }, [state])

  useEffect(() => {
    const interval = setInterval(() => {
      setState((prev) => ({
        ...prev,
        stocks: prev.stocks.map(tickPrice),
      }))
    }, TICK_INTERVAL)
    return () => clearInterval(interval)
  }, [])

  const handleBuy = useCallback((symbol: string, shares: number) => {
    setState((prev) => {
      const stock = prev.stocks.find((s) => s.symbol === symbol)
      if (!stock) return prev
      const newPortfolio = buyStock(prev.portfolio, symbol, shares, stock.price)
      if (!newPortfolio) return prev
      return { ...prev, portfolio: newPortfolio }
    })
  }, [])

  const handleSell = useCallback((symbol: string, shares: number) => {
    setState((prev) => {
      const stock = prev.stocks.find((s) => s.symbol === symbol)
      if (!stock) return prev
      const newPortfolio = sellStock(prev.portfolio, symbol, shares, stock.price)
      if (!newPortfolio) return prev
      return { ...prev, portfolio: newPortfolio }
    })
  }, [])

  const handleReset = useCallback(() => {
    if (!confirm('確定要重置投資組合嗎？所有持股與交易紀錄將被清除。')) return
    setState((prev) => ({
      ...prev,
      portfolio: resetPortfolio(),
    }))
  }, [])

  const getHolding = useCallback(
    (symbol: string) => state.portfolio.holdings.find((h) => h.symbol === symbol),
    [state.portfolio.holdings],
  )

  const portfolioValue = state.portfolio.holdings.reduce((sum, h) => {
    const stock = state.stocks.find((s) => s.symbol === h.symbol)
    return sum + (stock ? stock.price * h.shares : 0)
  }, 0)

  const totalAssets = state.portfolio.cash + portfolioValue

  return {
    stocks: state.stocks,
    portfolio: state.portfolio,
    handleBuy,
    handleSell,
    handleReset,
    getHolding,
    portfolioValue,
    totalAssets,
  }
}
