import { NextResponse } from "next/server";
import { getMockAIAnalysis } from "@/lib/mockData";
import { buildAnalysisContext } from "@/lib/stockBuilder";
import type { AIAnalysis, StockDataPayload } from "@/types/stock";

const OPENAI_ENDPOINT = "https://api.openai.com/v1/chat/completions";

function fallbackAnalysis(payload: StockDataPayload): AIAnalysis {
  const context = buildAnalysisContext(payload);
  return getMockAIAnalysis({
    name: payload.basicInfo.name,
    symbol: payload.basicInfo.symbol,
    status: context.status,
    riskLevel: context.riskLevel,
    technicalSummary: `MA5 ${context.technicals.ma5}、MA20 ${context.technicals.ma20}、RSI ${context.technicals.rsi14}、%B ${context.technicals.percentB}。`,
    candlestickSummary: context.candlestick.summary,
    fundamentalSummary: payload.fundamental.summary,
    chipSummary: payload.chip.summary,
    industrySummary: payload.industry.summary
  });
}

function normalizeAIAnalysis(value: Partial<AIAnalysis>, fallback: AIAnalysis): AIAnalysis {
  return {
    currentStatus: value.currentStatus || fallback.currentStatus,
    technicalSummary: value.technicalSummary || fallback.technicalSummary,
    candlestickSummary: value.candlestickSummary || fallback.candlestickSummary,
    fundamentalSummary: value.fundamentalSummary || fallback.fundamentalSummary,
    chipSummary: value.chipSummary || fallback.chipSummary,
    industrySummary: value.industrySummary || fallback.industrySummary,
    bullishPoints: Array.isArray(value.bullishPoints) ? value.bullishPoints : fallback.bullishPoints,
    riskPoints: Array.isArray(value.riskPoints) ? value.riskPoints : fallback.riskPoints,
    watchConditions: Array.isArray(value.watchConditions) ? value.watchConditions : fallback.watchConditions,
    failureConditions: Array.isArray(value.failureConditions) ? value.failureConditions : fallback.failureConditions,
    strategy: value.strategy || fallback.strategy,
    riskLevel: value.riskLevel === "低" || value.riskLevel === "中" || value.riskLevel === "高" ? value.riskLevel : fallback.riskLevel,
    disclaimer:
      value.disclaimer ||
      "本內容僅為交易觀察與分析輔助，不構成投資建議，也不保證任何漲跌結果。"
  };
}

export async function POST(request: Request) {
  const payload = (await request.json()) as StockDataPayload;

  if (!payload?.basicInfo?.symbol || !payload.priceHistory?.length) {
    return NextResponse.json({ error: "分析資料不足，請重新輸入股票代號。" }, { status: 400 });
  }

  const fallback = fallbackAnalysis(payload);
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ aiAnalysis: fallback, source: "mock" });
  }

  const context = buildAnalysisContext(payload);
  const latest = payload.priceHistory.at(-1);

  try {
    const response = await fetch(OPENAI_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "你是台股技術分析與產業研究助理。你不提供買賣建議、不預測或保證漲跌，只根據輸入資料做交易觀察與分析輔助。缺資料要明確說明。所有輸出必須是繁體中文 JSON，不要 Markdown。"
          },
          {
            role: "user",
            content: JSON.stringify({
              instructions: [
                "請用 JSON 格式回傳 currentStatus, technicalSummary, candlestickSummary, fundamentalSummary, chipSummary, industrySummary, bullishPoints, riskPoints, watchConditions, failureConditions, strategy, riskLevel, disclaimer。",
                "偏多理由只能描述觀察到的條件，不可使用一定買進、保證上漲等措辭。",
                "公司前景與產業趨勢若沒有外部新聞資料，只能根據公司產業分類與輸入資料做保守推論，不能捏造最新新聞。",
                "策略請以觀察條件、風險條件、失敗條件呈現。"
              ],
              stock: payload.basicInfo,
              latestPrice: latest?.close,
              derivedStatus: context.status,
              riskLevel: context.riskLevel,
              technicals: context.technicals,
              candlestick: context.candlestick,
              fundamental: payload.fundamental,
              chip: payload.chip,
              industry: payload.industry
            })
          }
        ],
        temperature: 0.3
      })
    });

    if (!response.ok) throw new Error("OpenAI API failed");
    const json = (await response.json()) as { choices?: { message?: { content?: string } }[] };
    const content = json.choices?.[0]?.message?.content;
    if (!content) throw new Error("OpenAI empty response");
    const parsed = JSON.parse(content) as Partial<AIAnalysis>;
    return NextResponse.json({ aiAnalysis: normalizeAIAnalysis(parsed, fallback), source: "openai" });
  } catch {
    return NextResponse.json({
      aiAnalysis: fallback,
      source: "mock",
      warning: "OpenAI API 暫時無法使用，已改用保守 mock AI analysis。"
    });
  }
}
