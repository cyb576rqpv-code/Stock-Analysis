export interface Stock {
  symbol: string
  name: string
  sector: string
  price: number
  openPrice: number
  priceHistory: number[]
}

export interface Holding {
  symbol: string
  shares: number
  avgCost: number
}

export interface Transaction {
  id: string
  symbol: string
  type: 'buy' | 'sell'
  shares: number
  price: number
  total: number
  timestamp: number
}

export interface Portfolio {
  cash: number
  holdings: Holding[]
  transactions: Transaction[]
}

export interface MarketState {
  stocks: Stock[]
  portfolio: Portfolio
}
