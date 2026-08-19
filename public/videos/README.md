# 影片上傳指南

請將您的影片檔案放在這裡。

## 支援的格式 / Supported Formats

- MP4 (推薦) / Recommended
- WebM
- MOV

## 建議規格 / Recommended Specs

- 解析度：1920x1080 (Full HD)
- 幀率：30fps 或 60fps
- 檔案大小：每個影片建議小於 100MB

## 命名建議 / Naming Convention

- clip1.mp4
- clip2.mp4
- clip3.mp4
- clip4.mp4
- clip5.mp4

## 更新影片連結

在 `src/components/VideoViewer.tsx` 中更新以下內容：

```typescript
const videoClips = [
  {
    id: 1,
    title: 'Video Clip 1 / 影片片段一',
    description: '...',
    duration: '2:30',
    thumbnail: '🎬',
    src: '/videos/clip1.mp4',  // 添加影片路徑
  },
  // ...
];
```
