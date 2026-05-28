import type {
  CandlestickAnalysis,
  ChipAnalysis,
  FundamentalAnalysis,
  StockStatus,
  TechnicalIndicators
} from "@/types/stock";

const clamp = (value: number) => Math.max(0, Math.min(100, Math.round(value)));

export function calculateTechnicalScore(
  indicators: TechnicalIndicators,
  candlestick: CandlestickAnalysis
): number {
  let score = 50;
  if (indicators.ma5 > indicators.ma20) score += 12;
  if (indicators.ma20 > indicators.ma60) score += 10;
  if (indicators.percentB > 0.55 && indicators.percentB < 1.05) score += 10;
  if (indicators.rsi14 >= 45 && indicators.rsi14 <= 68) score += 8;
  if (indicators.macdHistogram > 0) score += 8;
  if (indicators.k > indicators.d && indicators.k < 85) score += 6;
  if (indicators.volumeRatio > 1.2 && candlestick.signal === "bullish") score += 8;
  if (candlestick.signal === "bearish") score -= 16;
  if (indicators.percentB > 1.1 || indicators.rsi14 > 78) score -= 12;
  if (indicators.percentB < 0.15) score -= 8;
  return clamp(score);
}

export function calculateFundamentalScore(fundamental: FundamentalAnalysis): number {
  let score = fundamental.score || 50;
  if ((fundamental.monthlyRevenueYoY ?? 0) > 10) score += 8;
  if ((fundamental.eps ?? 0) > 0) score += 6;
  if ((fundamental.grossMargin ?? 0) > 30) score += 6;
  if ((fundamental.per ?? 0) > 0 && (fundamental.per ?? 99) < 25) score += 5;
  if ((fundamental.pbr ?? 0) > 4) score -= 5;
  if ((fundamental.monthlyRevenueYoY ?? 0) < -10) score -= 10;
  return clamp(score);
}

export function calculateChipScore(chip: ChipAnalysis): number {
  let score = chip.score || 50;
  const institutional =
    (chip.foreignInvestorNetBuy5d ?? 0) + (chip.investmentTrustNetBuy5d ?? 0) + (chip.dealerNetBuy5d ?? 0);
  if (institutional > 0) score += 10;
  if ((chip.investmentTrustNetBuy5d ?? 0) > 0) score += 6;
  if ((chip.marginBalanceChange ?? 0) < 0) score += 4;
  if (institutional < 0) score -= 10;
  if ((chip.marginBalanceChange ?? 0) > 1500) score -= 6;
  if ((chip.shortBalanceChange ?? 0) > 800) score -= 5;
  return clamp(score);
}

export function classifyStockStatus(
  indicators: TechnicalIndicators,
  candlestick: CandlestickAnalysis,
  chip: ChipAnalysis
): StockStatus {
  if (candlestick.patterns.includes("跌破支撐") || indicators.percentB < 0.08) return "跌破警示";
  if (indicators.percentB > 1.05 && indicators.rsi14 > 75) return "過熱風險";
  if (candlestick.patterns.includes("突破前高") && indicators.volumeRatio > 1.5) return "放量突破";
  if (indicators.bandwidth > 0 && indicators.bandwidth < 0.075 && indicators.volumeRatio < 1.25) return "盤整壓縮";
  if (candlestick.patterns.includes("回測均線") && indicators.ma20 >= indicators.ma60 * 0.98) return "回測觀察";
  if (
    indicators.ma5 > indicators.ma20 &&
    indicators.ma20 >= indicators.ma60 * 0.98 &&
    indicators.percentB > 0.6 &&
    indicators.percentB < 1.1
  ) {
    return "趨勢偏強";
  }
  if ((chip.foreignInvestorNetBuy5d ?? 0) < 0 && indicators.ma5 < indicators.ma20) return "弱勢整理";
  return "弱勢整理";
}

export function classifyRiskLevel(
  indicators: TechnicalIndicators,
  candlestick: CandlestickAnalysis,
  fundamental: FundamentalAnalysis,
  chip: ChipAnalysis
): "低" | "中" | "高" {
  const technicalScore = calculateTechnicalScore(indicators, candlestick);
  const fundamentalScore = calculateFundamentalScore(fundamental);
  const chipScore = calculateChipScore(chip);
  const status = classifyStockStatus(indicators, candlestick, chip);

  if (
    status === "跌破警示" ||
    status === "過熱風險" ||
    technicalScore < 38 ||
    fundamentalScore < 35 ||
    chipScore < 35
  ) {
    return "高";
  }
  if (technicalScore > 68 && fundamentalScore > 55 && chipScore > 50 && indicators.rsi14 < 72) return "低";
  return "中";
}
