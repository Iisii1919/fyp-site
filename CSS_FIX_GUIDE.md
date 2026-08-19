# 網站 CSS 問題修復指南

## 🔴 問題診斷

您的網站顯示為純 HTML 內容，沒有 CSS 樣式，這是因為：
1. Tailwind CSS v4 配置問題
2. 瀏覽器快取舊版本
3. 開發服務器有錯誤

## ✅ 已修復

我已經修復了 CSS 配置問題：
1. ✅ 更新 PostCSS 配置為 Tailwind CSS v4
2. ✅ 修復 CSS 文件結構
3. ✅ 重新構建網站
4. ✅ 開發服務器正在運行

## 🚀 如何訪問網站

### 方法 1: 強制刷新瀏覽器
- 按 `Ctrl + Shift + R` 或 `Ctrl + F5`
- 這會清除頁面快取並重新載入

### 方法 2: 清除瀏覽器快取
1. 按 `Ctrl + Shift + Delete`
2. 選擇 "緩存的圖片和檔案"
3. 時間範圍選 "全部"
4. 點擊 "清除資料"
5. 重新訪問 http://localhost:3000

### 方法 3: 使用無痕模式
- Chrome/Edge: `Ctrl + Shift + N`
- Firefox: `Ctrl + Shift + P`
- 在無痕視窗中訪問 http://localhost:3000

### 方法 4: 訪問測試頁面
- http://localhost:3000/test-css.html
- 這個頁面使用 CDN 版本，應該可以正常顯示

## 📝 訪問端口

開發服務器正在運行，請嘗試以下端口：
- http://localhost:3000 (主要)
- http://localhost:3001 (備用)
- http://localhost:3002 (備用)

## 🔧 如果還是無法顯示

### 步驟 1: 重新啟動開發服務器
```bash
# 打開新的命令提示字元
cd C:\Users\linji\.agnes\temporary\2026-08-19\20260819_2\work\research-participant-site

# 停止現有服務器 (如果運行中)
# 按 Ctrl + C

# 清除構建快取
rmdir /s /q .next

# 重新構建
npm run build

# 啟動開發服務器
npm run dev
```

### 步驟 2: 檢查開發者工具
1. 按 `F12` 打開開發者工具
2. 查看 Console 標籤是否有錯誤
3. 查看 Network 標籤，確認 CSS 文件是否載入
4. 如果 CSS 載入失敗，檢查錯誤訊息

### 步驟 3: 檢查端口占用
```bash
# Windows PowerShell
netstat -ano | findstr :3000
netstat -ano | findstr :3001
```

如果端口被佔用，停止該進程：
```bash
taskkill /PID [PID] /F
```

## 📋 預期效果

修復後，網站應該顯示：
- ✅ 灰色和深棕色配色
- ✅ Playfair Display 標題字體 (serif)
- ✅ Inter 正文字體 (sans-serif)
- ✅ 5個分開的卡片布局
- ✅ 全屏滾動效果
- ✅ 按鈕和卡片的懸停效果
- ✅ 適當的間距和留白

## 🎨 配色方案

- **深棕色**: #3d2b1f (主要按鈕、標題)
- **中棕色**: #8b7355 (強調色)
- **淺棕色**: #d4c4b0 (裝飾)
- **灰色**: #6b5b4f (正文)
- **背景**: #f5f5f5 (淺灰色)
- **白色**: #ffffff (卡片)

## 🔗 測試頁面

訪問以下測試頁面：
- http://localhost:3000/test-css.html (HTML 版本)
- http://localhost:3000/fixed.html (狀態頁面)

## 📞 需要幫助？

如果問題仍然存在：
1. 查看瀏覽器控制台的具體錯誤訊息
2. 查看開發服務器終端的輸出
3. 嘗試在不同的瀏覽器測試
4. 檢查防火牆設置

---

**狀態**: ✅ CSS 配置已修復
**服務器**: 運行中
**最後更新**: 2026-08-19 21:25
