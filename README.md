# StockPilot AI｜AI 台股觀察員

台股交易觀察與分析輔助工具，使用 Next.js + TypeScript + Tailwind CSS 建立，可部署到 Vercel。

> 本工具不是投資建議系統，不提供「一定買進」「保證上漲」等結論。所有輸出都以觀察條件、風險與失敗條件呈現。

## 功能

- 輸入股票代號並分析最近 120 個交易日股價
- FinMind API 串接；未設定 API key 或 API 失敗時自動使用 mock data
- 技術指標：MA、布林通道、%B、Bandwidth、RSI、MACD、KD、均量、量比、支撐與壓力
- K 線分析：長紅/長黑、十字線、吞噬、突破、跌破、回測均線、量價配合
- 基本面、籌碼面、產業趨勢與 AI 分析報告
- localStorage 觀察清單：備註、是否持有、平均成本、停損觀察價、目標價
- Dashboard、分析頁、觀察清單頁、單檔詳細頁

## 安裝

```bash
npm install
```

## 啟動

```bash
npm run dev
```

打開 http://localhost:3000。

## 環境變數

複製 `.env.example`：

```bash
cp .env.example .env.local
```

可選設定：

```bash
FINMIND_API_TOKEN=
OPENAI_API_KEY=
```

- `FINMIND_API_TOKEN`：用於抓取 FinMind 的台股價格、PER、月營收、財報、法人與融資券資料。
- `OPENAI_API_KEY`：用於產生 JSON 格式 AI 分析報告。
- 未設定時仍可使用內建 mock data 與 mock AI analysis 展示完整流程。

## 部署到 Vercel

1. 將 repository 匯入 Vercel。
2. Framework Preset 選擇 Next.js。
3. 在 Vercel Project Settings 設定環境變數：
   - `FINMIND_API_TOKEN`
   - `OPENAI_API_KEY`
4. 部署後即可使用。

## 指令

```bash
npm run dev
npm run build
npm run typecheck
```

## 免責聲明

StockPilot AI 僅作為交易觀察與分析輔助，不構成投資建議、招攬或任何保證獲利承諾。使用者應自行評估風險並承擔投資決策結果。