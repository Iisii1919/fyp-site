# 網站樣式問題修復指南

## 🔴 問題診斷

您看到的網站顯示為純 HTML 內容，沒有 CSS 樣式，這是因為：

1. **瀏覽器快取** - 舊的錯誤版本被快取
2. **CSS 載入問題** - Tailwind CSS 沒有正確處理
3. **開發服務器狀態** - 舊的服務器有錯誤

## ✅ 解決方案

### 方法 1: 強制刷新瀏覽器

1. **Chrome/Edge**: 按 `Ctrl + Shift + R` 或 `Ctrl + F5`
2. **Firefox**: 按 `Ctrl + Shift + R`
3. **Safari**: 按 `Cmd + Option + R`

如果還是不行，請嘗試方法 2。

### 方法 2: 清除瀏覽器快取

1. 按 `Ctrl + Shift + Delete`
2. 選擇 "緩存的圖片和檔案"
3. 時間範圍選 "全部"
4. 點擊 "清除資料"
5. 重新訪問 http://localhost:3000

### 方法 3: 使用無痕模式

1. 按 `Ctrl + Shift + N` (Chrome/Edge) 或 `Ctrl + Shift + P` (Firefox)
2. 在無痕視窗中訪問 http://localhost:3000

### 方法 4: 重新啟動開發服務器

```bash
# 打開新的命令提示字元 (CMD)
cd C:\Users\linji\.agnes\temporary\2026-08-19\20260819_2\work\research-participant-site

# 停止現有服務器 (如果在運行)
# 按 Ctrl + C

# 清除構建快取
rmdir /s /q .next

# 重新構建
npm run build

# 啟動開發服務器
npm run dev
```

然後訪問 http://localhost:3000

### 方法 5: 檢查開發者工具

1. 按 `F12` 打開開發者工具
2. 查看 Console 標籤是否有錯誤
3. 查看 Network 標籤，確認 CSS 文件是否載入
4. 如果 CSS 載入失敗，檢查錯誤訊息

## 🔍 常見錯誤和解決方法

### 錯誤 1: "Failed to load CSS"
**解決**:
- 檢查網絡連接
- 清除瀏覽器快取
- 重新啟動開發服務器

### 錯誤 2: "Tailwind CSS not found"
**解決**:
```bash
npm install tailwindcss @tailwindcss/postcss
npm run build
npm run dev
```

### 錯誤 3: "Port already in use"
**解決**:
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID [PID] /F
```

### 錯誤 4: "Hydration failed"
**解決**:
- 清除 `.next` 目錄
- 重新構建
- 強制刷新瀏覽器

## 📝 驗證修復

修復後，網站應該：
1. ✅ 有灰色和深棕色配色
2. ✅ 標題使用 Playfair Display 字體 (serif)
3. ✅ 正文使用 Inter 字體 (sans-serif)
4. ✅ 5個研究特點卡片分開排列
5. ✅ 全屏滾動效果
6. ✅ 按鈕有懸停效果
7. ✅ 卡片有陰影和圓角

## 🚀 快速測試

訪問以下 URL：
- http://localhost:3000 (主要)
- http://localhost:3001 (備用)
- http://localhost:3002 (備用)

## ⚠️ 注意事項

1. **端口選擇** - 開發服務器可能使用不同端口
2. **瀏覽器快取** - 清除快取很重要
3. **網絡連接** - 需要網絡才能載入 Google Fonts
4. **防火牆** - 檢查是否阻止本地連接

## 📞 需要幫助？

如果問題仍然存在：
1. 查看瀏覽器控制台的具體錯誤
2. 查看開發服務器終端的輸出
3. 嘗試不同的瀏覽器
4. 檢查防火牆設置

---

**狀態**: 🔧 修復中
**最後更新**: 2026-08-19 21:05
