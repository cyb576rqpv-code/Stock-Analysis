export type StockStatus =
  | "趨勢偏強"
  | "放量突破"
  | "回測觀察"
  | "盤整壓縮"
  | "過熱風險"
  | "跌破警示"
  | "弱勢整理";

export type RiskLevel = "低" | "中" | "高";

export type StockPriceData = {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

export type TechnicalIndicators = {
  ma5: number;
  ma10: number;
  ma20: number;
  ma60: number;
  bollingerUpper: number;
  bollingerMiddle: number;
  bollingerLower: number;
  percentB: number;
  bandwidth: number;
  rsi14: number;
  macdDif: number;
  macdDea: number;
  macdHistogram: number;
  k: number;
  d: number;
  volumeMa5: number;
  volumeMa20: number;
  volumeRatio: number;
  support: number;
  resistance: number;
};

export type CandlestickSignal = "bullish" | "neutral" | "bearish";

export type CandlestickAnalysis = {
  patterns: string[];
  signal: CandlestickSignal;
  summary: string;
  details: string[];
};

export type FundamentalAnalysis = {
  per?: number;
  pbr?: number;
  monthlyRevenueYoY?: number;
  eps?: number;
  grossMargin?: number;
  operatingMargin?: number;
  score: number;
  summary: string;
  strengths: string[];
  risks: string[];
};

export type ChipAnalysis = {
  foreignInvestorNetBuy5d?: number;
  investmentTrustNetBuy5d?: number;
  dealerNetBuy5d?: number;
  marginBalanceChange?: number;
  shortBalanceChange?: number;
  score: number;
  summary: string;
  signals: string[];
};

export type IndustryTrendAnalysis = {
  industry: string;
  trend: "positive" | "neutral" | "negative" | "unknown";
  summary: string;
  opportunities: string[];
  risks: string[];
};

export type AIAnalysis = {
  currentStatus: string;
  technicalSummary: string;
  candlestickSummary: string;
  fundamentalSummary: string;
  chipSummary: string;
  industrySummary: string;
  bullishPoints: string[];
  riskPoints: string[];
  watchConditions: string[];
  failureConditions: string[];
  strategy: string;
  riskLevel: RiskLevel;
  disclaimer: string;
};

export type UserPlan = {
  reason: string;
  entryCondition: string;
  exitCondition: string;
  stopLoss?: number;
  targetPrice?: number;
  note: string;
  isHolding: boolean;
  averageCost?: number;
  shares?: number;
};

export type BasicInfo = {
  symbol: string;
  name: string;
  industry: string;
  market?: string;
};

export type StockDataPayload = {
  priceHistory: StockPriceData[];
  basicInfo: BasicInfo;
  fundamental: FundamentalAnalysis;
  chip: ChipAnalysis;
  industry: IndustryTrendAnalysis;
  source: "finmind" | "mock";
  warning?: string;
};

export type StockCard = {
  id: string;
  symbol: string;
  name: string;
  latestPrice: number;
  changePercent: number;
  status: StockStatus;
  technicalScore: number;
  fundamentalScore: number;
  chipScore: number;
  riskLevel: RiskLevel;
  technicals: TechnicalIndicators;
  candlestick: CandlestickAnalysis;
  fundamental: FundamentalAnalysis;
  chip: ChipAnalysis;
  industry: IndustryTrendAnalysis;
  aiAnalysis: AIAnalysis;
  userPlan: UserPlan;
  priceHistory: StockPriceData[];
  createdAt: string;
  updatedAt: string;
};

export type AnalyzeResult = StockCard & {
  source: "finmind" | "mock";
};
