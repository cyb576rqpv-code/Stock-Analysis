import { NextResponse } from "next/server";
import { getMockStockData } from "@/lib/mockData";
import type { ChipAnalysis, FundamentalAnalysis, IndustryTrendAnalysis, StockPriceData } from "@/types/stock";

const FINMIND_ENDPOINT = "https://api.finmindtrade.com/api/v4/data";

const toNumber = (value: unknown) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const sixMonthsAgo = () => {
  const date = new Date();
  date.setMonth(date.getMonth() - 8);
  return date.toISOString().slice(0, 10);
};

async function fetchFinMind(dataset: string, symbol: string, token: string, params: Record<string, string> = {}) {
  const url = new URL(FINMIND_ENDPOINT);
  url.searchParams.set("dataset", dataset);
  url.searchParams.set("data_id", symbol);
  url.searchParams.set("token", token);
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));

  const response = await fetch(url, { next: { revalidate: 3600 } });
  if (!response.ok) throw new Error(`FinMind ${dataset} failed`);
  const json = (await response.json()) as { data?: Record<string, unknown>[]; msg?: string; status?: number };
  if (!Array.isArray(json.data)) throw new Error(json.msg || `FinMind ${dataset} empty`);
  return json.data;
}

function parsePriceHistory(rows: Record<string, unknown>[]): StockPriceData[] {
  return rows
    .map((row) => ({
      date: String(row.date ?? ""),
      open: toNumber(row.open) ?? 0,
      high: toNumber(row.max) ?? toNumber(row.high) ?? 0,
      low: toNumber(row.min) ?? toNumber(row.low) ?? 0,
      close: toNumber(row.close) ?? 0,
      volume: toNumber(row.Trading_Volume) ?? toNumber(row.volume) ?? 0
    }))
    .filter((item) => item.date && item.close > 0)
    .slice(-120);
}

function parseFundamental(
  perRows: Record<string, unknown>[],
  revenueRows: Record<string, unknown>[],
  statementRows: Record<string, unknown>[],
  fallback: FundamentalAnalysis
): FundamentalAnalysis {
  const latestPer = perRows.at(-1);
  const latestRevenue = revenueRows.at(-1);
  const epsRow = [...statementRows].reverse().find((row) => String(row.type ?? "").toUpperCase().includes("EPS"));
  const grossRow = [...statementRows]
    .reverse()
    .find((row) => String(row.type ?? "").toLowerCase().includes("gross"));
  const operatingRow = [...statementRows]
    .reverse()
    .find((row) => String(row.type ?? "").toLowerCase().includes("operating"));

  return {
    per: toNumber(latestPer?.PER) ?? fallback.per,
    pbr: toNumber(latestPer?.PBR) ?? fallback.pbr,
    monthlyRevenueYoY:
      toNumber(latestRevenue?.revenue_growth_rate) ??
      toNumber(latestRevenue?.YoY) ??
      fallback.monthlyRevenueYoY,
    eps: toNumber(epsRow?.value) ?? fallback.eps,
    grossMargin: toNumber(grossRow?.value) ?? fallback.grossMargin,
    operatingMargin: toNumber(operatingRow?.value) ?? fallback.operatingMargin,
    score: fallback.score,
    summary: "已接入 FinMind 基本面資料；若部分欄位缺漏，會保留保守 mock 摘要作為展示。",
    strengths: fallback.strengths,
    risks: fallback.risks
  };
}

function parseChip(
  institutionalRows: Record<string, unknown>[],
  marginRows: Record<string, unknown>[],
  fallback: ChipAnalysis
): ChipAnalysis {
  const recentInstitutional = institutionalRows.slice(-15);
  const sumByName = (keyword: string) =>
    recentInstitutional
      .filter((row) => String(row.name ?? row.Institutional_Investors ?? "").includes(keyword))
      .reduce((sum, row) => {
        const direct = toNumber(row.buy_sell);
        const buy = toNumber(row.buy) ?? 0;
        const sell = toNumber(row.sell) ?? 0;
        return sum + (direct ?? buy - sell);
      }, 0);
  const recentMargin = marginRows.slice(-6);
  const firstMargin = recentMargin.at(0);
  const lastMargin = recentMargin.at(-1);
  const marginChange =
    (toNumber(lastMargin?.MarginPurchaseTodayBalance) ?? toNumber(lastMargin?.MarginPurchaseLimit) ?? 0) -
    (toNumber(firstMargin?.MarginPurchaseTodayBalance) ?? toNumber(firstMargin?.MarginPurchaseLimit) ?? 0);
  const shortChange =
    (toNumber(lastMargin?.ShortSaleTodayBalance) ?? toNumber(lastMargin?.ShortSaleLimit) ?? 0) -
    (toNumber(firstMargin?.ShortSaleTodayBalance) ?? toNumber(firstMargin?.ShortSaleLimit) ?? 0);

  return {
    foreignInvestorNetBuy5d: sumByName("外資") || fallback.foreignInvestorNetBuy5d,
    investmentTrustNetBuy5d: sumByName("投信") || fallback.investmentTrustNetBuy5d,
    dealerNetBuy5d: sumByName("自營") || fallback.dealerNetBuy5d,
    marginBalanceChange: marginChange || fallback.marginBalanceChange,
    shortBalanceChange: shortChange || fallback.shortBalanceChange,
    score: fallback.score,
    summary: "已接入 FinMind 籌碼資料；法人買賣超與融資券欄位依可用資料保守估算。",
    signals: fallback.signals
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol")?.trim();

  if (!symbol) {
    return NextResponse.json({ error: "請輸入股票代號。" }, { status: 400 });
  }

  const token = process.env.FINMIND_API_TOKEN;
  const mock = getMockStockData(symbol);

  if (!token) {
    return NextResponse.json(mock);
  }

  try {
    const start_date = sixMonthsAgo();
    const [priceResult, perResult, revenueResult, statementResult, institutionalResult, marginResult] =
      await Promise.allSettled([
        fetchFinMind("TaiwanStockPrice", symbol, token, { start_date }),
        fetchFinMind("TaiwanStockPER", symbol, token, { start_date }),
        fetchFinMind("TaiwanStockMonthRevenue", symbol, token, { start_date }),
        fetchFinMind("FinancialStatements", symbol, token, { start_date }),
        fetchFinMind("InstitutionalInvestorsBuySell", symbol, token, { start_date }),
        fetchFinMind("TaiwanStockMarginPurchaseShortSale", symbol, token, { start_date })
      ]);

    if (priceResult.status !== "fulfilled") {
      return NextResponse.json({
        ...mock,
        warning: "FinMind 股價資料暫時無法取得，已改用 mock data。"
      });
    }

    const priceHistory = parsePriceHistory(priceResult.value);
    if (!priceHistory.length) {
      return NextResponse.json({
        ...mock,
        warning: "FinMind 沒有回傳可用股價資料，已改用 mock data。"
      });
    }

    const fundamental = parseFundamental(
      perResult.status === "fulfilled" ? perResult.value : [],
      revenueResult.status === "fulfilled" ? revenueResult.value : [],
      statementResult.status === "fulfilled" ? statementResult.value : [],
      mock.fundamental
    );
    const chip = parseChip(
      institutionalResult.status === "fulfilled" ? institutionalResult.value : [],
      marginResult.status === "fulfilled" ? marginResult.value : [],
      mock.chip
    );
    const industry: IndustryTrendAnalysis = {
      ...mock.industry,
      industry: mock.basicInfo.industry
    };

    return NextResponse.json({
      priceHistory,
      basicInfo: mock.basicInfo,
      fundamental,
      chip,
      industry,
      source: "finmind",
      warning:
        perResult.status === "rejected" || revenueResult.status === "rejected"
          ? "部分基本面或籌碼資料未取得，已用保守 fallback 補齊。"
          : undefined
    });
  } catch {
    return NextResponse.json({
      ...mock,
      warning: "FinMind API 發生錯誤，已改用 mock data。"
    });
  }
}
