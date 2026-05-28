import type {
  AIAnalysis,
  BasicInfo,
  ChipAnalysis,
  FundamentalAnalysis,
  IndustryTrendAnalysis,
  StockDataPayload,
  StockPriceData,
  StockStatus
} from "@/types/stock";

type MockProfile = {
  symbol: string;
  name: string;
  industry: string;
  base: number;
  trend: number;
  volatility: number;
  volumeBase: number;
  statusBias: StockStatus;
};

const profiles: MockProfile[] = [
  {
    symbol: "2330",
    name: "台積電",
    industry: "半導體",
    base: 780,
    trend: 1.45,
    volatility: 8,
    volumeBase: 31000,
    statusBias: "趨勢偏強"
  },
  {
    symbol: "2317",
    name: "鴻海",
    industry: "電子代工",
    base: 145,
    trend: 0.25,
    volatility: 2.6,
    volumeBase: 52000,
    statusBias: "回測觀察"
  },
  {
    symbol: "2454",
    name: "聯發科",
    industry: "IC 設計",
    base: 980,
    trend: 1.1,
    volatility: 13,
    volumeBase: 7800,
    statusBias: "放量突破"
  },
  {
    symbol: "6667",
    name: "信紘科",
    industry: "半導體設備",
    base: 156,
    trend: 0.08,
    volatility: 3.2,
    volumeBase: 1500,
    statusBias: "盤整壓縮"
  },
  {
    symbol: "3260",
    name: "威剛",
    industry: "記憶體模組",
    base: 88,
    trend: -0.05,
    volatility: 2.1,
    volumeBase: 12500,
    statusBias: "過熱風險"
  }
];

const profileMap = new Map(profiles.map((profile) => [profile.symbol, profile]));

const pseudoRandom = (seed: number) => {
  const value = Math.sin(seed) * 10000;
  return value - Math.floor(value);
};

const tradingDate = (daysAgo: number) => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  let remaining = daysAgo;
  while (remaining > 0) {
    date.setDate(date.getDate() - 1);
    const day = date.getDay();
    if (day !== 0 && day !== 6) remaining -= 1;
  }
  return date.toISOString().slice(0, 10);
};

export function generateMockPriceHistory(profile: MockProfile, days = 120): StockPriceData[] {
  const history: StockPriceData[] = [];
  let close = profile.base;

  for (let index = 0; index < days; index += 1) {
    const wave = Math.sin(index / 6) * profile.volatility;
    const noise = (pseudoRandom(index + Number(profile.symbol)) - 0.5) * profile.volatility;
    const directional = profile.trend * (index / 18);
    const statusAdjustment =
      profile.statusBias === "盤整壓縮"
        ? Math.sin(index / 4) * profile.volatility * 0.35
        : profile.statusBias === "過熱風險" && index > days - 16
          ? (index - (days - 16)) * profile.volatility * 0.28
          : profile.statusBias === "放量突破" && index > days - 8
            ? (index - (days - 8)) * profile.volatility * 0.45
            : 0;
    close = Math.max(10, profile.base + directional + wave + noise + statusAdjustment);
    const open = close + (pseudoRandom(index * 3 + 7) - 0.5) * profile.volatility * 0.75;
    const high = Math.max(open, close) + pseudoRandom(index * 5 + 11) * profile.volatility;
    const low = Math.min(open, close) - pseudoRandom(index * 7 + 13) * profile.volatility;
    const volumePulse =
      profile.statusBias === "放量突破" && index > days - 5
        ? 1.9
        : profile.statusBias === "過熱風險" && index > days - 8
          ? 1.45
          : 1;
    const volume = Math.round(profile.volumeBase * (0.78 + pseudoRandom(index * 11 + 19) * 0.55) * volumePulse);

    history.push({
      date: tradingDate(days - index),
      open: Number(open.toFixed(2)),
      high: Number(high.toFixed(2)),
      low: Number(Math.max(1, low).toFixed(2)),
      close: Number(close.toFixed(2)),
      volume
    });
  }

  return history;
}

const fundamentals: Record<string, FundamentalAnalysis> = {
  "2330": {
    per: 23.8,
    pbr: 5.4,
    monthlyRevenueYoY: 28.6,
    eps: 32.1,
    grossMargin: 54.2,
    operatingMargin: 43.1,
    score: 82,
    summary: "月營收與獲利結構維持高水準，估值需搭配產業循環觀察。",
    strengths: ["先進製程需求能見度高", "毛利率維持產業領先", "現金流與客戶結構穩健"],
    risks: ["資本支出龐大", "地緣政治與匯率波動", "高基期下成長率可能放緩"]
  },
  "2317": {
    per: 15.6,
    pbr: 1.4,
    monthlyRevenueYoY: 9.8,
    eps: 10.2,
    grossMargin: 6.4,
    operatingMargin: 3.1,
    score: 64,
    summary: "營收規模穩定，AI 伺服器與電動車題材提供觀察動能。",
    strengths: ["客戶組合多元", "供應鏈整合能力強", "AI 伺服器出貨具想像空間"],
    risks: ["毛利率偏低", "終端需求循環變化", "大型專案執行風險"]
  },
  "2454": {
    per: 20.5,
    pbr: 3.3,
    monthlyRevenueYoY: 18.4,
    eps: 54.7,
    grossMargin: 48.5,
    operatingMargin: 24.2,
    score: 76,
    summary: "手機、連網與 AI 邊緣晶片需求回溫，獲利品質仍需追蹤庫存循環。",
    strengths: ["產品線橫跨手機與智慧裝置", "毛利率具韌性", "股利與獲利紀錄穩定"],
    risks: ["消費電子需求波動", "同業競爭", "匯率與庫存調整"]
  },
  "6667": {
    per: 19.2,
    pbr: 2.7,
    monthlyRevenueYoY: 6.1,
    eps: 8.6,
    grossMargin: 31.7,
    operatingMargin: 13.4,
    score: 61,
    summary: "半導體設備與廠務需求支撐基本盤，短線仍需觀察接單延續性。",
    strengths: ["利基型設備服務", "毛利率高於傳統製造", "受惠半導體資本支出"],
    risks: ["營收規模較小", "接單集中度", "股價波動容易放大"]
  },
  "3260": {
    per: 13.9,
    pbr: 1.8,
    monthlyRevenueYoY: 34.5,
    eps: 6.8,
    grossMargin: 17.2,
    operatingMargin: 7.9,
    score: 67,
    summary: "記憶體報價循環改善有助營運，但景氣循環轉折風險需同步納入。",
    strengths: ["記憶體價格回升時具營運槓桿", "通路與品牌能見度佳", "估值相對低於高本益比族群"],
    risks: ["商品價格循環劇烈", "庫存評價波動", "短線題材容易過熱"]
  }
};

const chips: Record<string, ChipAnalysis> = {
  "2330": {
    foreignInvestorNetBuy5d: 12600,
    investmentTrustNetBuy5d: 1800,
    dealerNetBuy5d: -500,
    marginBalanceChange: -1200,
    shortBalanceChange: 180,
    score: 78,
    summary: "外資與投信近 5 日偏買超，融資下降代表籌碼相對沉澱。",
    signals: ["法人偏多", "融資餘額下降", "券資變化未見明顯壓力"]
  },
  "2317": {
    foreignInvestorNetBuy5d: 4200,
    investmentTrustNetBuy5d: 700,
    dealerNetBuy5d: 120,
    marginBalanceChange: 900,
    shortBalanceChange: 260,
    score: 62,
    summary: "法人小幅買超，融資增加使籌碼穩定度需持續觀察。",
    signals: ["法人買超", "融資同步增加", "籌碼分歧不大"]
  },
  "2454": {
    foreignInvestorNetBuy5d: 3600,
    investmentTrustNetBuy5d: 2100,
    dealerNetBuy5d: 330,
    marginBalanceChange: -450,
    shortBalanceChange: -120,
    score: 75,
    summary: "外資與投信同步加碼，融資下降，籌碼面偏正向。",
    signals: ["法人同步買超", "投信買盤延續", "融資降溫"]
  },
  "6667": {
    foreignInvestorNetBuy5d: 120,
    investmentTrustNetBuy5d: 40,
    dealerNetBuy5d: -30,
    marginBalanceChange: 160,
    shortBalanceChange: 20,
    score: 55,
    summary: "法人著墨不深，籌碼變化溫和，適合搭配量價確認。",
    signals: ["法人小幅買超", "融資變化有限", "籌碼訊號中性"]
  },
  "3260": {
    foreignInvestorNetBuy5d: -1800,
    investmentTrustNetBuy5d: 300,
    dealerNetBuy5d: -260,
    marginBalanceChange: 2200,
    shortBalanceChange: 540,
    score: 42,
    summary: "外資賣超且融資增加，短線若追價需留意籌碼鬆動。",
    signals: ["外資賣超", "融資升高", "券資同步偏熱"]
  }
};

const trendByIndustry: Record<string, IndustryTrendAnalysis> = {
  "半導體": {
    industry: "半導體",
    trend: "positive",
    summary: "AI、高速運算與先進製程需求仍是主要觀察主軸，景氣循環與資本支出節奏需同步追蹤。",
    opportunities: ["AI/HPC 需求", "先進封裝", "高階製程滲透率提升"],
    risks: ["資本支出遞延", "地緣政治", "終端需求修正"]
  },
  "電子代工": {
    industry: "電子代工",
    trend: "neutral",
    summary: "大型代工廠受惠 AI 伺服器與電動車專案，但傳統消費電子仍具循環性。",
    opportunities: ["AI 伺服器", "電動車電子", "全球製造布局"],
    risks: ["低毛利壓力", "客戶訂單調整", "匯率波動"]
  },
  "IC 設計": {
    industry: "IC 設計",
    trend: "positive",
    summary: "邊緣 AI、手機規格升級與通訊晶片需求回溫提供觀察空間。",
    opportunities: ["邊緣 AI 晶片", "高階手機平台", "Wi-Fi 與車用連網"],
    risks: ["消費性需求波動", "競爭者價格策略", "庫存循環"]
  },
  "半導體設備": {
    industry: "半導體設備",
    trend: "neutral",
    summary: "設備與廠務需求跟隨晶圓廠資本支出，個股接單能見度是關鍵。",
    opportunities: ["先進製程擴產", "廠務系統升級", "在地供應鏈"],
    risks: ["訂單集中", "資本支出延後", "股本小波動高"]
  },
  "記憶體模組": {
    industry: "記憶體模組",
    trend: "positive",
    summary: "記憶體報價循環改善有助庫存評價與獲利，但價格反轉時風險也較明顯。",
    opportunities: ["DRAM/NAND 報價回升", "AI 裝置升級容量", "通路庫存回補"],
    risks: ["商品價格反轉", "庫存跌價", "短線題材過熱"]
  }
};

export function getMockProfile(symbol: string): MockProfile {
  return (
    profileMap.get(symbol) ?? {
      symbol,
      name: `台股 ${symbol}`,
      industry: "未知產業",
      base: 80 + (Number(symbol.slice(-2)) || 20),
      trend: 0.18,
      volatility: 2.8,
      volumeBase: 6000,
      statusBias: "回測觀察"
    }
  );
}

export function getMockStockData(symbol: string): StockDataPayload {
  const profile = getMockProfile(symbol);
  const basicInfo: BasicInfo = {
    symbol: profile.symbol,
    name: profile.name,
    industry: profile.industry,
    market: "TWSE/TPEx"
  };
  const fallbackFundamental = fundamentals[symbol] ?? {
    score: 50,
    summary: "目前使用模擬基本面資料，尚無足夠資訊形成明確評分。",
    strengths: ["待補資料"],
    risks: ["缺少真實財報與營收資料"]
  };
  const fallbackChip = chips[symbol] ?? {
    score: 50,
    summary: "目前使用模擬籌碼資料，法人與融資券訊號僅供展示。",
    signals: ["待接入 FinMind 籌碼資料"]
  };
  const industry = trendByIndustry[profile.industry] ?? {
    industry: profile.industry,
    trend: "unknown",
    summary: "缺少明確產業資料，僅能以技術與籌碼訊號進行保守觀察。",
    opportunities: ["等待資料補齊"],
    risks: ["產業趨勢資訊不足"]
  };

  return {
    priceHistory: generateMockPriceHistory(profile),
    basicInfo,
    fundamental: fallbackFundamental,
    chip: fallbackChip,
    industry,
    source: "mock",
    warning: "目前使用 mock data，可設定 FINMIND_API_TOKEN 取得真實資料。"
  };
}

export function getMockAIAnalysis(input: {
  name: string;
  symbol: string;
  status: StockStatus;
  riskLevel: "低" | "中" | "高";
  technicalSummary: string;
  candlestickSummary: string;
  fundamentalSummary: string;
  chipSummary: string;
  industrySummary: string;
}): AIAnalysis {
  return {
    currentStatus: `${input.name}（${input.symbol}）目前歸類為「${input.status}」，適合作為交易觀察標的而非直接買賣建議。`,
    technicalSummary: input.technicalSummary,
    candlestickSummary: input.candlestickSummary,
    fundamentalSummary: input.fundamentalSummary,
    chipSummary: input.chipSummary,
    industrySummary: input.industrySummary,
    bullishPoints: ["技術結構若維持在主要均線之上，代表短線仍有承接。", "量能若延續放大，可提高突破或轉強可信度。", "基本面與產業題材提供中期觀察支撐。"],
    riskPoints: ["若跌破支撐或 MA20，原先觀察條件可能失效。", "若 RSI 與 %B 過熱，追價風險提高。", "缺少即時新聞與完整財報資料時，前景判讀需保守。"],
    watchConditions: ["收盤價能否站穩 MA20 與關鍵壓力區。", "突破時成交量是否高於 20 日均量 1.5 倍。", "法人買賣超與融資餘額是否與價格方向一致。"],
    failureConditions: ["收盤跌破近 60 日支撐或停損觀察價。", "放量長黑且隔日無法收復。", "基本面數據轉弱或籌碼連續轉為賣超。"],
    strategy: "以分批觀察與條件觸發為主，等待價格、量能與風險條件同時確認；若條件未成立，維持觀察不追價。",
    riskLevel: input.riskLevel,
    disclaimer: "本報告僅作為交易觀察與分析輔助，不構成投資建議，也不保證任何漲跌結果。"
  };
}
