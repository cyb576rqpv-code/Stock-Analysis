import { useState } from 'react'
import { useMarket } from './hooks/useMarket'
import { PortfolioSummary } from './components/PortfolioSummary'
import { StockRow } from './components/StockRow'
import { TradePanel } from './components/TradePanel'
import { TransactionHistory } from './components/TransactionHistory'

type Tab = 'market' | 'portfolio' | 'history'

export default function App() {
  const {
    stocks,
    portfolio,
    handleBuy,
    handleSell,
    handleReset,
    getHolding,
    portfolioValue,
    totalAssets,
  } = useMarket()

  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(stocks[0]?.symbol ?? null)
  const [tab, setTab] = useState<Tab>('market')

  const selectedStock = stocks.find((s) => s.symbol === selectedSymbol) ?? null

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-market-border bg-market-card/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-market-accent flex items-center justify-center text-sm font-bold">
              股
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight">模擬股市</h1>
              <p className="text-xs text-gray-500">虛擬交易 · 即時報價</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-market-up animate-pulse" />
            <span className="text-xs text-gray-400">即時更新中</span>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
          {/* Stock List */}
          <div className="lg:col-span-1 bg-market-card rounded-xl border border-market-border overflow-hidden flex flex-col">
            <div className="px-4 py-3 border-b border-market-border">
              <h2 className="font-semibold text-sm">行情列表</h2>
            </div>
            <div className="flex-1 overflow-y-auto">
              {stocks.map((stock) => (
                <StockRow
                  key={stock.symbol}
                  stock={stock}
                  isSelected={stock.symbol === selectedSymbol}
                  holding={getHolding(stock.symbol)}
                  onSelect={() => {
                    setSelectedSymbol(stock.symbol)
                    setTab('market')
                  }}
                />
              ))}
            </div>
          </div>

          {/* Right Panel */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {/* Tabs */}
            <div className="flex gap-1 bg-market-card rounded-xl border border-market-border p-1">
              {([
                ['market', '交易'],
                ['portfolio', '投資組合'],
                ['history', '交易紀錄'],
              ] as const).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setTab(key)}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                    tab === key
                      ? 'bg-market-accent text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="flex-1 bg-market-card rounded-xl border border-market-border overflow-hidden">
              {tab === 'market' && (
                <TradePanel
                  stock={selectedStock}
                  cash={portfolio.cash}
                  holding={getHolding(selectedSymbol ?? '')}
                  onBuy={handleBuy}
                  onSell={handleSell}
                />
              )}
              {tab === 'portfolio' && (
                <div className="p-5">
                  <PortfolioSummary
                    cash={portfolio.cash}
                    portfolioValue={portfolioValue}
                    totalAssets={totalAssets}
                    holdings={portfolio.holdings}
                    stocks={stocks}
                    onReset={handleReset}
                  />
                </div>
              )}
              {tab === 'history' && (
                <div className="p-5">
                  <TransactionHistory transactions={portfolio.transactions} />
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <footer className="text-center text-xs text-gray-600 py-4">
        此為模擬交易系統，所有價格與交易均為虛擬，不涉及真實金錢
      </footer>
    </div>
  )
}
