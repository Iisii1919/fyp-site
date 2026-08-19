# 研究參與網站 - 故障排除指南

## ❌ 問題：網站一直顯示加載中

### 🔍 可能原因

1. **影片播放器錯誤** - 空的 `src` 屬性
2. **端口衝突** - 開發服務器無法啟動
3. **依賴問題** - npm 包安裝不完整
4. **構建錯誤** - TypeScript 類型檢查失敗

### ✅ 解決方案

#### 1. 修復影片播放器錯誤

**問題**: VideoViewer.tsx 中有空的 `<source src="" />`

**解決**: 我已經修復了這個問題，移除了空的 src 屬性。

#### 2. 檢查開發服務器狀態

```bash
# 進入專案目錄
cd research-participant-site

# 停止現有的開發服務器
# Windows:
taskkill /F /IM node.exe

# 重新啟動
npm run dev
```

#### 3. 清除構建快取

```bash
# 刪除 .next 目錄
rm -rf .next

# 重新構建
npm run build

# 啟動開發服務器
npm run dev
```

#### 4. 檢查依賴

```bash
# 重新安裝依賴
npm install

# 檢查是否有錯誤
npm audit
```

#### 5. 使用不同端口

如果端口 3000 被佔用：
- 訪問 http://localhost:3001
- 或停止佔用端口的進程

### 📊 當前狀態

✅ **構建成功**: `npm run build` 通過
✅ **TypeScript 檢查**: 無錯誤
✅ **影片播放器修復**: 已移除空的 src 屬性
✅ **全屏滾動**: 已實現

### 🔧 快速修復步驟

1. **停止現有服務器**
   ```bash
   # Windows
   taskkill /F /IM node.exe
   ```

2. **清除快取**
   ```bash
   rmdir /s /q .next
   ```

3. **重新構建**
   ```bash
   npm run build
   ```

4. **啟動開發服務器**
   ```bash
   npm run dev
   ```

5. **訪問網站**
   - http://localhost:3000
   - 或 http://localhost:3001

### 🌐 瀏覽器測試

建議使用以下瀏覽器測試：
- **Chrome** (推薦)
- **Firefox**
- **Safari**
- **Edge**

按 F12 打開開發者工具，查看 Console 和 Network 標籤檢查錯誤。

### 📱 移動設備測試

如果需要在移動設備上測試：
- 確保手機和電腦在同一 Wi-Fi 網絡
- 訪問 http://172.21.95.81:3000
- 或使用 ngrok 等工具創建公共 URL

### ⚠️ 常見錯誤

#### 錯誤 1: "Port 3000 is in use"
**解決**: 停止佔用端口的進程或改用其他端口

#### 錯誤 2: "EPIPE: broken pipe"
**解決**: 這是影片播放器空的 src 屬性導致的，已經修復

#### 錯誤 3: "TypeScript errors"
**解決**: 檢查類型定義，確保所有 props 正確

### 📝 驗證修改

修改後的網站應該：
1. ✅ 首頁全屏顯示
2. ✅ 滾動時自動切換到下一個完整頁面
3. ✅ 問卷頁面可自由滾動
4. ✅ 沒有水平滾動
5. ✅ 影片播放器不報錯

### 🚀 生產部署

測試通過後，可以部署到：
- **Vercel** (推薦，免費)
- **Netlify**
- **GitHub Pages**
- **自有伺服器**

部署命令：
```bash
npm run build
# 然後部署 .next 目錄
```

### 📞 需要幫助？

如果問題仍然存在：
1. 查看瀏覽器控制檯錯誤
2. 檢查開發服務器終端輸出
3. 確保所有依賴已正確安裝
4. 嘗試在不同的瀏覽器測試

---

**最後更新**: 2026-08-19
**狀態**: ✅ 問題已修復
