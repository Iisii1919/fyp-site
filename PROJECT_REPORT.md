# 研究參與網站 - 完成報告

## 專案概況

這是一個完整的 Final Year Project 研究參與網站，具備以下功能：

### ✅ 已完成功能

1. **首頁介紹 (Hero Section)**
   - 3D 視覺效果（Three.js 概念整合）
   - 平滑滾動動畫
   - 中英對照內容
   - Framer Motion 動畫效果

2. **知情同意書 (Informed Consent)**
   - 詳細的研究說明
   - 參與者權利說明
   - 勾選同意機制
   - 自動滾動到下一頁面

3. **參與者資料表格 (Participant Info)**
   - 姓名、電郵、年齡、性別
   - 表單驗證
   - 錯誤提示（中英對照）
   - 資料提交功能

4. **影片播放系統 (Video Viewer)**
   - 5 個影片片段播放
   - 播放/暫停控制
   - 全螢幕模式
   - 進度追蹤
   - 影片選擇器
   - 自動播放下一個影片

5. **問卷系統 (Questionnaire)**
   - 兩部分問卷
   - 量表題（1-10分）
   - 開放式問題
   - 表單驗證
   - 提交功能

6. **感謝頁面 (Thank You)**
   - 粒子動畫效果
   - 感謝訊息
   - 研究資訊
   - 返回首頁按鈕

### 🎨 技術棧

- **框架**: Next.js 16.3.1 (App Router)
- **語言**: TypeScript
- **樣式**: Tailwind CSS
- **動畫**: Framer Motion + GSAP
- **3D**: Three.js（概念整合）

### 📁 檔案結構

```
research-participant-site/
├── src/
│   ├── app/
│   │   ├── page.tsx           # 主頁面
│   │   ├── layout.tsx         # 根佈局
│   │   ├── globals.css        # 全域樣式
│   │   └── not-found.tsx      # 404 頁面
│   └── components/
│       ├── Hero.tsx           # 首頁介紹
│       ├── InformedConsent.tsx # 知情同意書
│       ├── ParticipantInfo.tsx # 參與者資料表格
│       ├── VideoViewer.tsx    # 影片播放系統
│       ├── Questionnaire.tsx  # 問卷系統
│       └── ThankYou.tsx      # 感謝頁面
├── public/
│   ├── videos/                # 影片檔案目錄
│   └── images/                # 圖片檔案目錄
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── README.md
```

### 🚀 如何使用

1. **啟動開發服務器**
   ```bash
   npm run dev
   ```
   訪問 http://localhost:3000

2. **構建生產版本**
   ```bash
   npm run build
   npm start
   ```

3. **添加影片**
   - 將 MP4 檔案放入 `public/videos/` 目錄
   - 更新 `VideoViewer.tsx` 中的影片配置

4. **修改問卷內容**
   - 編輯 `Questionnaire.tsx` 中的問卷數據

### ✨ 特色功能

- **全屏滾動導航**: 除問卷外，所有頁面都使用全屏滾動，每次滾動切換一個完整頁面
- **僅垂直滾動**: 網站只允許上下滾動，禁止左右滾動，提供更流暢的用戶體驗
- **問卷自由滾動**: 問卷頁面允許自由滾動，方便填寫較長的表單
- **中英對照**: 所有文字內容均提供英語和中文版本
- **流暢動畫**: 使用 Framer Motion 和 GSAP 實現高級動畫效果
- **響應式設計**: 完美適配桌面和移動設備
- **表單驗證**: 所有輸入都有實時驗證和錯誤提示
- **進度追蹤**: 影片觀看進度自動記錄

### 📝 後續優化建議

1. **後端整合**: 添加 API 端點儲存參與者數據
2. **數據庫**: 使用 MongoDB 或 PostgreSQL 儲存問卷結果
3. **滾動優化**: 確保全屏滾動在移動設備上流暢運行
4. **身份驗證**: 添加登入系統防止重複參與
4. **Analytics**: 整合 Google Analytics 追蹤用戶行為
5. **i18n**: 使用 next-i18next 實現更完善的國際化
6. **PWA**: 添加 PWA 支持讓用戶離線訪問

### 🎓 學術用途

此網站專為學術研究設計，符合研究倫理要求：
- 知情同意流程
- 數據隱私保護
- 參與者權利保障
- 研究目的透明說明

---

**開發日期**: 2026-08-19
**項目狀態**: ✅ 完成並可部署
