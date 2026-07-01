# 模擬股市

一個基於瀏覽器的虛擬股票交易模擬器，使用 React + TypeScript 建構。

## 功能

- **即時報價**：10 檔台股模擬標的，每 2 秒自動更新價格
- **買賣交易**：使用 100 萬虛擬台幣進行模擬交易
- **投資組合**：追蹤持股、損益與總資產
- **交易紀錄**：完整記錄每筆買賣
- **資料持久化**：使用 localStorage 保存進度

## 快速開始

```bash
npm install
npm run dev
```

開啟 http://localhost:5173 即可開始交易。

## 建置

```bash
npm run build
npm run preview
```

## 模擬標的

| 代號 | 名稱 | 產業 |
|------|------|------|
| TSMC | 台積電 | 半導體 |
| HONHAI | 鴻海 | 電子製造 |
| MEDIATEK | 聯發科 | 半導體 |
| DELTA | 台達電 | 電子零組件 |
| QUANTA | 廣達 | 電腦週邊 |
| ASUS | 華碩 | 電腦週邊 |
| FUBON | 富邦金 | 金融 |
| CATHAY | 國泰金 | 金融 |
| CHIMEI | 奇美 | 塑化 |
| FORMOSA | 台塑 | 塑化 |
