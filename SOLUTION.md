# 網站樣式問題解決方案

## 🔴 問題
您看到的網站顯示為純 HTML 內容，沒有 CSS 樣式，這是因為瀏覽器快取或 CSS 載入問題。

## ✅ 解決方案（按順序嘗試）

### 1️⃣ 強制刷新瀏覽器
- 按 `Ctrl + Shift + R` 或 `Ctrl + F5`
- 這會清除頁面快取並重新載入

### 2️⃣ 清除瀏覽器快取
1. 按 `Ctrl + Shift + Delete`
2. 選擇 "緩存的圖片和檔案"
3. 時間範圍選 "全部"
4. 點擊 "清除資料"
5. 重新訪問 http://localhost:3000

### 3️⃣ 使用無痕模式
- Chrome/Edge: `Ctrl + Shift + N`
- Firefox: `Ctrl + Shift + P`
- 在無痕視窗中訪問 http://localhost:3000

### 4️⃣ 重新啟動開發服務器
```bash
# 打開新的命令提示字元
cd C:\Users\linji\.agnes\temporary\2026-08-19\20260819_2\work\research-participant-site

# 清除構建快取
rmdir /s /q .next

# 重新構建
npm run build

# 啟動開發服務器
npm run dev
```

### 5️⃣ 檢查開發者工具
1. 按 `F12` 打開開發者工具
2. 查看 Console 標籤是否有錯誤
3. 查看 Network 標籤，確認 CSS 文件是否載入
4. 如果 CSS 載入失敗，檢查錯誤訊息

## 📝 預期效果
修復後，網站應該顯示：
- ✅ 灰色和深棕色配色
- ✅ Playfair Display 標題字體 (serif)
- ✅ Inter 正文字體 (sans-serif)
- ✅ 5個分開的卡片布局
- ✅ 全屏滾動效果
- ✅ 按鈕和卡片的懸停效果

## 🔗 測試頁面
訪問以下測試頁面來驗證樣式：
- http://localhost:3000/style-test.html
- http://localhost:3000/test.html

## 🚀 如果還是無法解決
請執行以下命令重新安裝依賴：
```bash
npm install
npm run build
npm run dev
```

然後訪問 http://localhost:3000

---
**狀態**: 🔧 等待測試
**端口**: 3000, 3001, 3002
