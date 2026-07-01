import type { Transaction } from '../types'
import { formatCurrency, formatTime } from '../utils/format'

const STOCK_NAMES: Record<string, string> = {
  TSMC: '台積電',
  HONHAI: '鴻海',
  MEDIATEK: '聯發科',
  DELTA: '台達電',
  QUANTA: '廣達',
  ASUS: '華碩',
  FUBON: '富邦金',
  CATHAY: '國泰金',
  CHIMEI: '奇美',
  FORMOSA: '台塑',
}

interface TransactionHistoryProps {
  transactions: Transaction[]
}

export function TransactionHistory({ transactions }: TransactionHistoryProps) {
  if (transactions.length === 0) {
    return (
      <div className="text-center text-gray-500 text-sm py-8">尚無交易紀錄</div>
    )
  }

  return (
    <div className="space-y-1 max-h-64 overflow-y-auto">
      {transactions.map((tx) => (
        <div
          key={tx.id}
          className="flex items-center justify-between px-3 py-2 bg-market-bg rounded-lg text-sm"
        >
          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                tx.type === 'buy'
                  ? 'bg-market-up/20 text-market-up'
                  : 'bg-market-down/20 text-market-down'
              }`}
            >
              {tx.type === 'buy' ? '買' : '賣'}
            </span>
            <div>
              <div className="font-medium">{STOCK_NAMES[tx.symbol] ?? tx.symbol}</div>
              <div className="text-xs text-gray-500">{formatTime(tx.timestamp)}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="font-mono text-xs">
              {tx.shares} 股 × {formatCurrency(tx.price)}
            </div>
            <div className="font-mono font-medium">{formatCurrency(tx.total)}</div>
          </div>
        </div>
      ))}
    </div>
  )
}
