import type { Holding, Stock } from '../types'
import { formatCurrency, formatPercent } from '../utils/format'

interface PortfolioSummaryProps {
  cash: number
  portfolioValue: number
  totalAssets: number
  holdings: Holding[]
  stocks: Stock[]
  onReset: () => void
}

export function PortfolioSummary({
  cash,
  portfolioValue,
  totalAssets,
  holdings,
  stocks,
  onReset,
}: PortfolioSummaryProps) {
  const initialCash = 1_000_000
  const totalReturn = ((totalAssets - initialCash) / initialCash) * 100
  const isProfit = totalReturn >= 0

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="總資產" value={formatCurrency(totalAssets)} highlight />
        <StatCard
          label="總報酬"
          value={formatPercent(totalReturn)}
          valueClass={isProfit ? 'text-market-up' : 'text-market-down'}
        />
        <StatCard label="可用現金" value={formatCurrency(cash)} />
        <StatCard label="持股市值" value={formatCurrency(portfolioValue)} />
      </div>

      {holdings.length > 0 && (
        <div>
          <h4 className="text-xs text-gray-500 uppercase tracking-wider mb-2">持股明細</h4>
          <div className="space-y-2">
            {holdings.map((h) => {
              const stock = stocks.find((s) => s.symbol === h.symbol)
              if (!stock) return null
              const marketValue = stock.price * h.shares
              const cost = h.avgCost * h.shares
              const pnl = ((marketValue - cost) / cost) * 100

              return (
                <div
                  key={h.symbol}
                  className="flex items-center justify-between bg-market-bg rounded-lg px-3 py-2 text-sm"
                >
                  <div>
                    <div className="font-medium">{stock.name}</div>
                    <div className="text-xs text-gray-500">
                      {h.shares} 股 · 均價 {formatCurrency(h.avgCost)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono">{formatCurrency(marketValue)}</div>
                    <div className={`text-xs font-mono ${pnl >= 0 ? 'text-market-up' : 'text-market-down'}`}>
                      {formatPercent(pnl)}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <button
        onClick={onReset}
        className="w-full py-2 text-xs text-gray-500 hover:text-red-400 border border-market-border rounded-lg transition-colors"
      >
        重置投資組合
      </button>
    </div>
  )
}

function StatCard({
  label,
  value,
  highlight,
  valueClass,
}: {
  label: string
  value: string
  highlight?: boolean
  valueClass?: string
}) {
  return (
    <div className="bg-market-bg rounded-lg p-3">
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div
        className={`font-mono font-semibold ${highlight ? 'text-lg' : 'text-sm'} ${valueClass ?? 'text-white'}`}
      >
        {value}
      </div>
    </div>
  )
}
