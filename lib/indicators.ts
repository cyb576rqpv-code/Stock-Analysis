import type { StockPriceData, TechnicalIndicators } from "@/types/stock";

const round = (value: number, digits = 2) => {
  if (!Number.isFinite(value)) return 0;
  const base = 10 ** digits;
  return Math.round(value * base) / base;
};

const closes = (data: StockPriceData[]) => data.map((item) => item.close);

const average = (values: number[]) => {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
};

export function calculateMA(data: StockPriceData[], period: number): number {
  if (!data.length) return 0;
  const slice = closes(data).slice(-period);
  return round(average(slice));
}

export function calculateBollingerBands(
  data: StockPriceData[],
  period = 20,
  multiplier = 2
): { upper: number; middle: number; lower: number } {
  if (!data.length) return { upper: 0, middle: 0, lower: 0 };
  const slice = closes(data).slice(-period);
  const middle = average(slice);
  const variance = average(slice.map((value) => (value - middle) ** 2));
  const standardDeviation = Math.sqrt(variance);
  return {
    upper: round(middle + multiplier * standardDeviation),
    middle: round(middle),
    lower: round(middle - multiplier * standardDeviation)
  };
}

export function calculatePercentB(close: number, upper: number, lower: number): number {
  if (upper === lower) return 0.5;
  return round((close - lower) / (upper - lower), 3);
}

export function calculateBandwidth(upper: number, middle: number, lower: number): number {
  if (!middle) return 0;
  return round((upper - lower) / middle, 3);
}

export function calculateRSI(data: StockPriceData[], period = 14): number {
  if (data.length < 2) return 50;
  const usable = data.slice(-(period + 1));
  let gains = 0;
  let losses = 0;

  for (let index = 1; index < usable.length; index += 1) {
    const change = usable[index].close - usable[index - 1].close;
    if (change >= 0) gains += change;
    else losses += Math.abs(change);
  }

  const averageGain = gains / period;
  const averageLoss = losses / period;
  if (averageLoss === 0) return 100;
  const relativeStrength = averageGain / averageLoss;
  return round(100 - 100 / (1 + relativeStrength));
}

const ema = (values: number[], period: number) => {
  if (!values.length) return [];
  const multiplier = 2 / (period + 1);
  const result: number[] = [values[0]];
  for (let index = 1; index < values.length; index += 1) {
    result.push(values[index] * multiplier + result[index - 1] * (1 - multiplier));
  }
  return result;
};

export function calculateMACD(data: StockPriceData[]): {
  dif: number;
  dea: number;
  histogram: number;
} {
  const closeValues = closes(data);
  if (!closeValues.length) return { dif: 0, dea: 0, histogram: 0 };
  const ema12 = ema(closeValues, 12);
  const ema26 = ema(closeValues, 26);
  const difSeries = closeValues.map((_, index) => (ema12[index] ?? 0) - (ema26[index] ?? 0));
  const deaSeries = ema(difSeries, 9);
  const dif = difSeries.at(-1) ?? 0;
  const dea = deaSeries.at(-1) ?? 0;
  return {
    dif: round(dif, 3),
    dea: round(dea, 3),
    histogram: round(dif - dea, 3)
  };
}

export function calculateKD(data: StockPriceData[], period = 9): { k: number; d: number } {
  if (!data.length) return { k: 50, d: 50 };
  let k = 50;
  let d = 50;

  data.forEach((_, index) => {
    const slice = data.slice(Math.max(0, index - period + 1), index + 1);
    const highestHigh = Math.max(...slice.map((item) => item.high));
    const lowestLow = Math.min(...slice.map((item) => item.low));
    const close = data[index].close;
    const rsv = highestHigh === lowestLow ? 50 : ((close - lowestLow) / (highestHigh - lowestLow)) * 100;
    k = (2 / 3) * k + (1 / 3) * rsv;
    d = (2 / 3) * d + (1 / 3) * k;
  });

  return { k: round(k), d: round(d) };
}

export function calculateVolumeMA(data: StockPriceData[], period: number): number {
  if (!data.length) return 0;
  const slice = data.slice(-period).map((item) => item.volume);
  return Math.round(average(slice));
}

export function findSupportResistance(
  data: StockPriceData[],
  lookback = 60
): { support: number; resistance: number } {
  if (!data.length) return { support: 0, resistance: 0 };
  const slice = data.slice(-lookback);
  return {
    support: round(Math.min(...slice.map((item) => item.low))),
    resistance: round(Math.max(...slice.map((item) => item.high)))
  };
}

export function calculateAllIndicators(data: StockPriceData[]): TechnicalIndicators {
  const latest = data.at(-1);
  const close = latest?.close ?? 0;
  const bollinger = calculateBollingerBands(data);
  const macd = calculateMACD(data);
  const kd = calculateKD(data);
  const volumeMa5 = calculateVolumeMA(data, 5);
  const volumeMa20 = calculateVolumeMA(data, 20);
  const { support, resistance } = findSupportResistance(data);

  return {
    ma5: calculateMA(data, 5),
    ma10: calculateMA(data, 10),
    ma20: calculateMA(data, 20),
    ma60: calculateMA(data, 60),
    bollingerUpper: bollinger.upper,
    bollingerMiddle: bollinger.middle,
    bollingerLower: bollinger.lower,
    percentB: calculatePercentB(close, bollinger.upper, bollinger.lower),
    bandwidth: calculateBandwidth(bollinger.upper, bollinger.middle, bollinger.lower),
    rsi14: calculateRSI(data),
    macdDif: macd.dif,
    macdDea: macd.dea,
    macdHistogram: macd.histogram,
    k: kd.k,
    d: kd.d,
    volumeMa5,
    volumeMa20,
    volumeRatio: volumeMa20 ? round((latest?.volume ?? 0) / volumeMa20, 2) : 0,
    support,
    resistance
  };
}

export function calculateMASeries(data: StockPriceData[], period: number) {
  return data.map((item, index) => {
    const slice = data.slice(Math.max(0, index - period + 1), index + 1);
    return {
      date: item.date,
      value: round(average(slice.map((price) => price.close)))
    };
  });
}
