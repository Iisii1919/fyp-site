# 問卷數據收集方案

## 🎯 目標
讓研究參與者填寫的問卷數據能夠保存到伺服器，方便研究人員查看和分析。

## 📋 現有問題

1. **沒有後端 API** - 問卷提交後數據丟失
2. **沒有數據庫** - 無法存儲參與者信息
3. **沒有管理後台** - 無法查看收集的數據
4. **沒有身份驗證** - 無法防止重複提交

## 🔧 推薦解決方案

### 方案 1: 使用 Vercel + MongoDB (推薦)

**優點:**
- 免費層級足夠學術研究使用
- 易於部署和維護
- 支持真實數據收集

**實現步驟:**
1. 創建 MongoDB Atlas 帳戶（免費）
2. 添加 Next.js API 路由
3. 實現數據保存功能
4. 創建管理後台查看數據

### 方案 2: 使用 Google Sheets API

**優點:**
- 無需數據庫
- 數據直接保存到 Google Sheets
- 易於分析和匯出

**實現步驟:**
1. 創建 Google Cloud 項目
2. 啟用 Google Sheets API
3. 添加認證憑證
4. 實現 API 路由

### 方案 3: 使用 JSON 文件保存（簡單版）

**優點:**
- 無需數據庫
- 實現簡單
- 適合小型研究

**缺點:**
- 不適合大量數據
- 需要手動管理檔案

## 📝 快速實現（JSON 文件版）

### 1. 創建 API 路由

```typescript
// src/app/api/submit/route.ts
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // 保存數據到 JSON 文件
    const submissionsDir = path.join(process.cwd(), 'data', 'submissions');
    if (!fs.existsSync(submissionsDir)) {
      fs.mkdirSync(submissionsDir, { recursive: true });
    }
    
    const filename = `submission_${Date.now()}.json`;
    const filepath = path.join(submissionsDir, filename);
    
    fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
    
    return NextResponse.json({ success: true, message: '數據保存成功' });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '保存失敗' },
      { status: 500 }
    );
  }
}
```

### 2. 更新問卷組件

```typescript
// 在 Questionnaire.tsx 中更新提交邏輯
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (validate()) {
    try {
      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      if (response.ok) {
        onSubmit(formData);
        // 滾動到感謝頁面
        setTimeout(() => {
          const thankYouSection = document.querySelector('[data-section="5"]');
          thankYouSection?.scrollIntoView({ behavior: 'smooth' });
        }, 500);
      } else {
        alert('提交失敗，請重試');
      }
    } catch (error) {
      alert('網絡錯誤，請檢查連接');
    }
  }
};
```

### 3. 創建管理後台

```typescript
// src/app/admin/page.tsx
'use client';

import { useState, useEffect } from 'react';
import fs from 'fs';
import path from 'path';

export default function AdminPage() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  
  useEffect(() => {
    // 讀取所有提交數據
    const submissionsDir = path.join(process.cwd(), 'data', 'submissions');
    if (fs.existsSync(submissionsDir)) {
      const files = fs.readdirSync(submissionsDir);
      const data = files.map(file => {
        const content = fs.readFileSync(path.join(submissionsDir, file), 'utf8');
        return JSON.parse(content);
      });
      setSubmissions(data);
    }
  }, []);
  
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-8">問卷數據管理後台</h1>
      
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">
          提交總數: {submissions.length}
        </h2>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="p-2 text-left">時間</th>
                <th className="p-2 text-left">姓名</th>
                <th className="p-2 text-left">電郵</th>
                <th className="p-2 text-left">年齡</th>
                <th className="p-2 text-left">性別</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((sub, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="p-2">{new Date(sub.timestamp).toLocaleString()}</td>
                  <td className="p-2">{sub.name}</td>
                  <td className="p-2">{sub.email}</td>
                  <td className="p-2">{sub.age}</td>
                  <td className="p-2">{sub.gender}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
```

## 🚀 部署選項

### 1. Vercel (推薦)
- 免費層級足夠學術研究
- 自動部署從 GitHub
- 支持 Next.js

### 2. Railway
- 免費層級
- 支持數據庫
- 易於使用

### 3. Render
- 免費層級
- 支持後端 API
- 簡單的部署流程

## 📊 數據查看方式

### 方式 1: JSON 文件
- 位置: `data/submissions/`
- 格式: 每個提交一個 JSON 文件
- 查看: 直接打開文件或使用編輯器

### 方式 2: 管理後台
- 訪問: http://localhost:3000/admin
- 功能: 查看、搜索、導出數據
- 優點: 易於分析和匯出

### 方式 3: 匯出到 CSV/Excel
- 在管理後台添加匯出功能
- 使用庫如 `papaparse` 或 `xlsx`

## 🔒 數據隱私考量

1. **匿名化处理** - 不存儲可識別個人身份的信息
2. **數據加密** - 敏感數據應該加密存儲
3. **訪問控制** - 管理後台需要密碼保護
4. **數據保留** - 明確數據保留政策

## 📝 下一步

1. 選擇數據存儲方案
2. 實現 API 路由
3. 更新問卷組件
4. 創建管理後台
5. 測試數據收集
6. 部署到生產環境

---

**需要我幫您實現哪個方案？**
