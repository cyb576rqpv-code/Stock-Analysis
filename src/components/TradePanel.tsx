import { useState } from 'react'
import type { Stock } from '../types'
import { formatCurrency } from '../utils/format'

interface TradePanelProps {
  stock: Stock | null
  cash: number
  holding?: { shares: number; avgCost: number }
  onBuy: (symbol: string, shares: number) => void
  onSell: (symbol: string, shares: number) => void
}

export function TradePanel({ stock, cash, holding, onBuy, onSell }: TradePanelProps) {
  const [shares, setShares] = useState(1)
  const [mode, setMode] = useState<'buy' | 'sell'>('buy')

  if (!stock) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500 text-sm">
        請選擇一檔股票進行交易
      </div>
    )
  }

  const total = shares * stock.price
  const canBuy = total <= cash && shares > 0
  const canSell = holding ? shares > 0 && shares <= holding.shares : false
  const maxBuy = Math.floor(cash / stock.price)
  const maxSell = holding?.shares ?? 0

  const handleSubmit = () => {
    if (mode === 'buy' && canBuy) {
      onBuy(stock.symbol, shares)
    } else if (mode === 'sell' && canSell) {
      onSell(stock.symbol, shares)
    }
  }

  return (
    <div className="p-5 space-y-5">
      <div>
        <h3 className="text-lg font-semibold">{stock.name}</h3>
        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-2xl font-mono font-bold">{formatCurrency(stock.price)}</span>
          <span className="text-sm text-gray-500">{stock.symbol}</span>
        </div>
      </div>

      <div className="flex rounded-lg overflow-hidden border border-market-border">
        <button
          onClick={() => setMode('buy')}
          className={`flex-1 py-2 text-sm font-medium transition-colors ${
            mode === 'buy'
              ? 'bg-market-up text-white'
              : 'bg-market-card text-gray-400 hover:text-white'
          }`}
        >
          買入
        </button>
        <button
          onClick={() => setMode('sell')}
          className={`flex-1 py-2 text-sm font-medium transition-colors ${
            mode === 'sell'
              ? 'bg-market-down text-white'
              : 'bg-market-card text-gray-400 hover:text-white'
          }`}
        >
          賣出
        </button>
      </div>

      <div>
        <label className="text-xs text-gray-500 mb-1 block">股數</label>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShares(Math.max(1, shares - 1))}
            className="w-9 h-9 rounded-lg bg-market-border hover:bg-gray-600 text-lg font-bold transition-colors"
          >
            −
          </button>
          <input
            type="number"
            value={shares}
            onChange={(e) => setShares(Math.max(1, parseInt(e.target.value) || 1))}
            className="flex-1 h-9 bg-market-bg border border-market-border rounded-lg text-center font-mono text-sm focus:outline-none focus:border-market-accent"
            min={1}
          />
          <button
            onClick={() => setShares(shares + 1)}
            className="w-9 h-9 rounded-lg bg-market-border hover:bg-gray-600 text-lg font-bold transition-colors"
          >
            +
          </button>
        </div>
        <div className="flex gap-2 mt-2">
          <button
            onClick={() => setShares(mode === 'buy' ? Math.min(maxBuy, 10) : Math.min(maxSell, 10))}
            className="text-xs px-2 py-1 rounded bg-market-border hover:bg-gray-600 transition-colors"
          >
            10 股
          </button>
          <button
            onClick={() => setShares(mode === 'buy' ? maxBuy : maxSell)}
            className="text-xs px-2 py-1 rounded bg-market-border hover:bg-gray-600 transition-colors"
          >
            全部
          </button>
        </div>
      </div>

      <div className="bg-market-bg rounded-lg p-3 space-y-1 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500">預估金額</span>
          <span className="font-mono">{formatCurrency(total)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">可用現金</span>
          <span className="font-mono">{formatCurrency(cash)}</span>
        </div>
        {holding && (
          <div className="flex justify-between">
            <span className="text-gray-500">持有股數</span>
            <span className="font-mono">{holding.shares} 股</span>
          </div>
        )}
      </div>

      <button
        onClick={handleSubmit}
        disabled={mode === 'buy' ? !canBuy : !canSell}
        className={`w-full py-3 rounded-lg font-semibold text-sm transition-all ${
          mode === 'buy'
            ? canBuy
              ? 'bg-market-up hover:bg-green-600 text-white'
              : 'bg-gray-700 text-gray-500 cursor-not-allowed'
            : canSell
              ? 'bg-market-down hover:bg-red-600 text-white'
              : 'bg-gray-700 text-gray-500 cursor-not-allowed'
        }`}
      >
        {mode === 'buy' ? '確認買入' : '確認賣出'}
      </button>
    </div>
  )
}
