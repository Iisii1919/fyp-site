# Research Participant Site - 研究參與網站

This is a Final Year Project research participant website built with Next.js, Tailwind CSS, Framer Motion, GSAP, and Three.js.

## Features / 功能

- **Fullscreen scroll navigation** / 全屏滾動導航
- **Vertical-only scrolling** / 僅垂直滾動
- **Bilingual content (English/Chinese)** / 中英對照
- **Informed consent form** / 知情同意書
- **Participant information collection** / 參與者資料收集
- **Video viewing system** / 影片播放系統
- **Questionnaire system** / 問卷系統
- **Smooth animations and transitions** / 流暢動畫效果
- **3D visual effects** / 3D 視覺效果

## Scroll Behavior / 滾動行為

The website uses fullscreen scrolling for all pages except the questionnaire:
- **Full-page sections** snap to the viewport when scrolling
- **Vertical-only scrolling** is enforced (no horizontal scrolling)
- **Questionnaire page** allows free scrolling for easier form filling
- **Smooth transitions** between sections

網站使用全屏滾動（問卷頁面除外）：
- **全屏頁面**在滾動時自動對齊到視口
- **僅垂直滾動**（禁止水平滾動）
- **問卷頁面**允許自由滾動，方便填寫表單
- **平滑過渡**在頁面之間切換

## Getting Started / 開始使用

### Install Dependencies / 安裝依賴

```bash
npm install
```

### Run Development Server / 運行開發服務器

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## File Structure / 檔案結構

```
src/
├── app/
│   ├── page.tsx          # Main page with scroll sections
│   ├── layout.tsx        # Root layout
│   └── globals.css       # Global styles
└── components/
    ├── Hero.tsx          # Homepage introduction
    ├── InformedConsent.tsx   # Consent form
    ├── ParticipantInfo.tsx   # Participant data form
    ├── VideoViewer.tsx     # Video playback system
    ├── Questionnaire.tsx   # Questionnaire system
    └── ThankYou.tsx      # Thank you page
```

## Customization / 自訂

### Adding Video Files / 添加影片檔案

1. Place your video files in the `public/videos/` folder
2. Update the `videoClips` array in `VideoViewer.tsx`:

```typescript
const videoClips = [
  {
    id: 1,
    title: 'Video Clip 1 / 影片片段一',
    description: '...',
    duration: '2:30',
    thumbnail: '🎬',
    src: '/videos/clip1.mp4',  // Add this line
  },
  // ...
];
```

### Updating Questionnaire / 更新問卷

Edit the `questionnaire` object in `Questionnaire.tsx` to add or modify questions.

## Deployment / 部署

### Vercel (Recommended) / Vercel (推薦)

```bash
npm run build
```

Then deploy to Vercel or your preferred hosting platform.

## License / 授權

This project is for academic research purposes.
