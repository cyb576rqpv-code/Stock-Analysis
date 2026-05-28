import type { CandlestickAnalysis, StockPriceData } from "@/types/stock";

const bodySize = (candle: StockPriceData) => Math.abs(candle.close - candle.open);
const rangeSize = (candle: StockPriceData) => Math.max(candle.high - candle.low, 0.01);

export function detectDoji(candle: StockPriceData): boolean {
  return bodySize(candle) / rangeSize(candle) < 0.12;
}

export function detectLongBullish(candle: StockPriceData): boolean {
  return candle.close > candle.open && bodySize(candle) / rangeSize(candle) > 0.62;
}

export function detectLongBearish(candle: StockPriceData): boolean {
  return candle.close < candle.open && bodySize(candle) / rangeSize(candle) > 0.62;
}

export function detectBullishEngulfing(prev: StockPriceData, current: StockPriceData): boolean {
  return (
    prev.close < prev.open &&
    current.close > current.open &&
    current.open <= prev.close &&
    current.close >= prev.open
  );
}

export function detectBearishEngulfing(prev: StockPriceData, current: StockPriceData): boolean {
  return (
    prev.close > prev.open &&
    current.close < current.open &&
    current.open >= prev.close &&
    current.close <= prev.open
  );
}

export function detectBreakout(data: StockPriceData[], resistance: number): boolean {
  const latest = data.at(-1);
  const previous = data.at(-2);
  if (!latest || !previous || !resistance) return false;
  return latest.close > resistance * 0.995 && latest.close > previous.close;
}

export function detectSupportBreak(data: StockPriceData[], support: number): boolean {
  const latest = data.at(-1);
  if (!latest || !support) return false;
  return latest.close < support * 1.005;
}

export function detectPullbackToMA(data: StockPriceData[], ma20: number): boolean {
  const latest = data.at(-1);
  if (!latest || !ma20) return false;
  const distance = Math.abs(latest.close - ma20) / ma20;
  return distance <= 0.025 && latest.close >= ma20 * 0.98;
}

export function analyzeVolumePrice(data: StockPriceData[]): {
  matched: boolean;
  summary: string;
} {
  if (data.length < 6) return { matched: false, summary: "資料不足，暫不判斷量價配合。" };
  const recent = data.slice(-5);
  const previous = data.slice(-10, -5);
  const recentVolume = recent.reduce((sum, item) => sum + item.volume, 0) / recent.length;
  const previousVolume = previous.length
    ? previous.reduce((sum, item) => sum + item.volume, 0) / previous.length
    : recentVolume;
  const priceChange = recent.at(-1)!.close - recent[0].close;
  const matched = priceChange > 0 && recentVolume > previousVolume * 1.1;

  if (matched) {
    return { matched, summary: "近 5 日價格墊高且均量放大，量價配合偏正向。" };
  }
  if (priceChange < 0 && recentVolume > previousVolume * 1.15) {
    return { matched: false, summary: "近 5 日下跌伴隨放量，需留意賣壓擴大。" };
  }
  return { matched: false, summary: "近 5 日量價尚未形成明確同步訊號。" };
}

export function analyzeLatestCandle(
  data: StockPriceData[],
  ma20 = 0,
  support = 0,
  resistance = 0
): CandlestickAnalysis {
  const latest = data.at(-1);
  const prev = data.at(-2);
  if (!latest) {
    return {
      patterns: ["資料不足"],
      signal: "neutral",
      summary: "尚無足夠 K 線資料可分析。",
      details: ["請確認股票代號或資料來源後再試。"]
    };
  }

  const patterns: string[] = [];
  const details: string[] = [];

  if (detectLongBullish(latest)) {
    patterns.push("長紅 K");
    details.push("最新 K 線實體偏長且收盤高於開盤，短線買盤較積極。");
  }
  if (detectLongBearish(latest)) {
    patterns.push("長黑 K");
    details.push("最新 K 線實體偏長且收盤低於開盤，短線賣壓較明顯。");
  }
  if (detectDoji(latest)) {
    patterns.push("十字線");
    details.push("最新 K 線實體很小，代表多空力道暫時接近平衡。");
  }
  if (prev && detectBullishEngulfing(prev, latest)) {
    patterns.push("多方吞噬");
    details.push("最新 K 線吞噬前一根黑 K，可能代表低檔承接力道增加。");
  }
  if (prev && detectBearishEngulfing(prev, latest)) {
    patterns.push("空方吞噬");
    details.push("最新 K 線吞噬前一根紅 K，需觀察賣壓是否延續。");
  }
  if (resistance && latest.close >= resistance * 0.98) {
    patterns.push("接近壓力區");
    details.push(`收盤價接近近 60 日壓力 ${resistance}，突破前宜觀察量能是否跟上。`);
  }
  if (detectPullbackToMA(data, ma20)) {
    patterns.push("回測均線");
    details.push(`股價接近 MA20 ${ma20}，可觀察是否出現止跌與量縮。`);
  }
  if (detectBreakout(data, resistance)) {
    patterns.push("突破前高");
    details.push("最新收盤接近或越過近 60 日高點區，屬於突破觀察訊號。");
  }
  if (detectSupportBreak(data, support)) {
    patterns.push("跌破支撐");
    details.push(`收盤價跌近或跌破近 60 日支撐 ${support}，需提高風險控管。`);
  }

  const volumePrice = analyzeVolumePrice(data);
  details.push(volumePrice.summary);
  if (volumePrice.matched) patterns.push("量價配合");
  if (!patterns.length) patterns.push("無明確型態");

  const bearishCount = patterns.filter((pattern) => ["長黑 K", "空方吞噬", "跌破支撐"].includes(pattern)).length;
  const bullishCount = patterns.filter((pattern) =>
    ["長紅 K", "多方吞噬", "突破前高", "量價配合"].includes(pattern)
  ).length;

  const signal = bullishCount > bearishCount ? "bullish" : bearishCount > bullishCount ? "bearish" : "neutral";

  return {
    patterns,
    signal,
    summary:
      signal === "bullish"
        ? "K 線結構偏多方觀察，但仍需搭配壓力區與量能確認。"
        : signal === "bearish"
          ? "K 線出現風險訊號，宜先觀察支撐與賣壓是否收斂。"
          : "K 線訊號中性，適合等待更明確的量價方向。",
    details
  };
}
