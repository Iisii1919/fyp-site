// src/app/api/submit/route.ts
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // 添加時間戳
    const submissionData = {
      ...data,
      timestamp: new Date().toISOString(),
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    };
    
    // 保存數據到 JSON 文件
    const submissionsDir = path.join(process.cwd(), 'data', 'submissions');
    if (!fs.existsSync(submissionsDir)) {
      fs.mkdirSync(submissionsDir, { recursive: true });
    }
    
    const filename = `submission_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.json`;
    const filepath = path.join(submissionsDir, filename);
    
    fs.writeFileSync(filepath, JSON.stringify(submissionData, null, 2));
    
    return NextResponse.json({ 
      success: true, 
      message: '數據保存成功',
      id: filename.replace('.json', '')
    });
  } catch (error) {
    console.error('提交錯誤:', error);
    return NextResponse.json(
      { success: false, error: '保存失敗' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // 讀取所有提交數據
    const submissionsDir = path.join(process.cwd(), 'data', 'submissions');
    
    if (!fs.existsSync(submissionsDir)) {
      return NextResponse.json({ submissions: [] });
    }
    
    const files = fs.readdirSync(submissionsDir);
    const submissions = files.map(file => {
      const content = fs.readFileSync(path.join(submissionsDir, file), 'utf8');
      return JSON.parse(content);
    });
    
    // 按時間排序
    submissions.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    
    return NextResponse.json({ submissions });
  } catch (error) {
    console.error('讀取錯誤:', error);
    return NextResponse.json(
      { error: '讀取數據失敗' },
      { status: 500 }
    );
  }
}
