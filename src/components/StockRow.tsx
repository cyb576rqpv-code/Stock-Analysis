import type { Stock } from '../types'
import { formatCurrency, formatPercent } from '../utils/format'
import { PriceChart } from './PriceChart'

interface StockRowProps {
  stock: Stock
  isSelected: boolean
  holding?: { shares: number; avgCost: number }
  onSelect: () => void
}

export function StockRow({ stock, isSelected, holding, onSelect }: StockRowProps) {
  const change = stock.price - stock.openPrice
  const changePercent = (change / stock.openPrice) * 100
  const isUp = change >= 0

  return (
    <button
      onClick={onSelect}
      className={`w-full text-left px-4 py-3 border-b border-market-border transition-colors hover:bg-white/5 ${
        isSelected ? 'bg-market-accent/10 border-l-2 border-l-market-accent' : ''
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm">{stock.symbol}</span>
            <span className="text-xs text-gray-500 truncate">{stock.name}</span>
          </div>
          <span className="text-xs text-gray-600">{stock.sector}</span>
        </div>

        <PriceChart data={stock.priceHistory} />

        <div className="text-right shrink-0">
          <div className="font-mono font-medium text-sm">{formatCurrency(stock.price)}</div>
          <div className={`text-xs font-mono ${isUp ? 'text-market-up' : 'text-market-down'}`}>
            {isUp ? '▲' : '▼'} {formatPercent(changePercent)}
          </div>
        </div>

        {holding && (
          <div className="text-right shrink-0 w-16">
            <div className="text-xs text-gray-500">持股</div>
            <div className="text-sm font-mono">{holding.shares}</div>
          </div>
        )}
      </div>
    </button>
  )
}
