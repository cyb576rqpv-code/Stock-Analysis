import { analyzeLatestCandle } from "@/lib/candlestick";
import { calculateAllIndicators } from "@/lib/indicators";
import {
  calculateChipScore,
  calculateFundamentalScore,
  calculateTechnicalScore,
  classifyRiskLevel,
  classifyStockStatus
} from "@/lib/scoring";
import type { AIAnalysis, AnalyzeResult, StockDataPayload, UserPlan } from "@/types/stock";

const nowIso = () => new Date().toISOString();

export function createDefaultUserPlan(input: {
  support: number;
  resistance: number;
  status: string;
}): UserPlan {
  return {
    reason: `納入觀察原因：目前狀態為 ${input.status}，等待條件確認。`,
    entryCondition: "價格站穩關鍵均線，且量能高於 20 日均量。",
    exitCondition: "跌破支撐、跌破停損觀察價，或量價轉弱。",
    stopLoss: input.support ? Number((input.support * 0.97).toFixed(2)) : undefined,
    targetPrice: input.resistance ? Number((input.resistance * 1.05).toFixed(2)) : undefined,
    note: "",
    isHolding: false,
    averageCost: undefined,
    shares: undefined
  };
}

export function buildAnalysisContext(payload: StockDataPayload) {
  const technicals = calculateAllIndicators(payload.priceHistory);
  const candlestick = analyzeLatestCandle(
    payload.priceHistory,
    technicals.ma20,
    technicals.support,
    technicals.resistance
  );
  const status = classifyStockStatus(technicals, candlestick, payload.chip);
  const riskLevel = classifyRiskLevel(technicals, candlestick, payload.fundamental, payload.chip);
  const technicalScore = calculateTechnicalScore(technicals, candlestick);
  const fundamentalScore = calculateFundamentalScore(payload.fundamental);
  const chipScore = calculateChipScore(payload.chip);

  return {
    technicals,
    candlestick,
    status,
    riskLevel,
    technicalScore,
    fundamentalScore,
    chipScore
  };
}

export function createAnalyzeResult(payload: StockDataPayload, aiAnalysis: AIAnalysis): AnalyzeResult {
  const context = buildAnalysisContext(payload);
  const latest = payload.priceHistory.at(-1);
  const previous = payload.priceHistory.at(-2);
  const changePercent = latest && previous ? ((latest.close - previous.close) / previous.close) * 100 : 0;
  const timestamp = nowIso();

  return {
    id: `${payload.basicInfo.symbol}-${timestamp}`,
    symbol: payload.basicInfo.symbol,
    name: payload.basicInfo.name,
    latestPrice: latest?.close ?? 0,
    changePercent: Number(changePercent.toFixed(2)),
    status: context.status,
    technicalScore: context.technicalScore,
    fundamentalScore: context.fundamentalScore,
    chipScore: context.chipScore,
    riskLevel: context.riskLevel,
    technicals: context.technicals,
    candlestick: context.candlestick,
    fundamental: payload.fundamental,
    chip: payload.chip,
    industry: payload.industry,
    aiAnalysis,
    userPlan: createDefaultUserPlan({
      support: context.technicals.support,
      resistance: context.technicals.resistance,
      status: context.status
    }),
    priceHistory: payload.priceHistory,
    createdAt: timestamp,
    updatedAt: timestamp,
    source: payload.source
  };
}
