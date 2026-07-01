import type { Stock } from '../types'

export const INITIAL_STOCKS: Omit<Stock, 'price' | 'openPrice' | 'priceHistory'>[] = [
  { symbol: 'TSMC', name: '台積電', sector: '半導體' },
  { symbol: 'HONHAI', name: '鴻海', sector: '電子製造' },
  { symbol: 'MEDIATEK', name: '聯發科', sector: '半導體' },
  { symbol: 'DELTA', name: '台達電', sector: '電子零組件' },
  { symbol: 'QUANTA', name: '廣達', sector: '電腦週邊' },
  { symbol: 'ASUS', name: '華碩', sector: '電腦週邊' },
  { symbol: 'FUBON', name: '富邦金', sector: '金融' },
  { symbol: 'CATHAY', name: '國泰金', sector: '金融' },
  { symbol: 'CHIMEI', name: '奇美', sector: '塑化' },
  { symbol: 'FORMOSA', name: '台塑', sector: '塑化' },
]

const BASE_PRICES: Record<string, number> = {
  TSMC: 980,
  HONHAI: 175,
  MEDIATEK: 1280,
  DELTA: 380,
  QUANTA: 285,
  ASUS: 520,
  FUBON: 78,
  CATHAY: 52,
  CHIMEI: 68,
  FORMOSA: 95,
}

export function createInitialStocks(): Stock[] {
  return INITIAL_STOCKS.map((stock) => {
    const price = BASE_PRICES[stock.symbol] ?? 100
    return {
      ...stock,
      price,
      openPrice: price,
      priceHistory: Array.from({ length: 60 }, () => price),
    }
  })
}

export function tickPrice(stock: Stock): Stock {
  const volatility = stock.sector === '金融' ? 0.003 : 0.008
  const drift = (Math.random() - 0.5) * 2 * volatility
  const newPrice = Math.max(1, stock.price * (1 + drift))
  const rounded = Math.round(newPrice * 100) / 100

  const history = [...stock.priceHistory.slice(-59), rounded]

  return {
    ...stock,
    price: rounded,
    priceHistory: history,
  }
}
