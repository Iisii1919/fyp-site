# Git 初始化與首次提交腳本
# 用法：在 PowerShell 中右鍵「以系統管理員身分執行」，或直接執行
# Usage: Run this script in PowerShell

$ErrorActionPreference = "Stop"

$projectDir = "C:\Users\linji\.agnes\temporary\2026-08-19\20260819_2\work\research-participant-site"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Git 初始化與首次提交" -ForegroundColor Cyan
Write-Host "  Git Init & First Commit" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 檢查 Git 是否安裝
Write-Host "[1/5] 檢查 Git 安裝..." -ForegroundColor Yellow
try {
    $gitVersion = git --version
    Write-Host "  ✓ Git 已安裝: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Git 未安裝，請先安裝 Git: https://git-scm.com/download/win" -ForegroundColor Red
    Read-Host "按 Enter 鍵離開"
    exit 1
}

# 進入專案目錄
Write-Host ""
Write-Host "[2/5] 進入專案目錄..." -ForegroundColor Yellow
Set-Location $projectDir
Write-Host "  ✓ 目前目錄: $(Get-Location)" -ForegroundColor Green

# 如果已有 .git，先移除重新開始
if (Test-Path ".git") {
    Write-Host ""
    Write-Host "  偵測到既有 .git 目錄，將移除重新初始化..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force ".git"
    Start-Sleep -Seconds 1
}

# 初始化 Git
Write-Host ""
Write-Host "[3/5] 初始化 Git 倉庫..." -ForegroundColor Yellow
git init
git config user.name "User"
git config user.email "user@example.com"
git config core.fscache false
Write-Host "  ✓ Git 倉庫已初始化" -ForegroundColor Green

# 添加所有文件
Write-Host ""
Write-Host "[4/5] 添加文件到暫存區..." -ForegroundColor Yellow
git add -A
$stagedCount = (git diff --cached --name-only | Measure-Object -Line).Lines
Write-Host "  ✓ 已添加 $stagedCount 個文件" -ForegroundColor Green

# 首次提交
Write-Host ""
Write-Host "[5/5] 創建首次提交..." -ForegroundColor Yellow
git commit -m "Initial commit: research participant site with premium dark theme

- Hero landing page with ambient glow and animations
- Informed consent form
- Participant information form
- 5 full-screen video players with scroll snap
- Questionnaire with scale and text questions
- Admin dashboard for data collection
- CSV export functionality
- Dark luxury gold theme design"

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  ✓ 完成！Git 已初始化並保存首次版本" -ForegroundColor Green
Write-Host "  ✓ Done! Git initialized with first commit" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "常用指令 / Common commands:" -ForegroundColor Cyan
Write-Host "  git log --oneline     查看提交歷史" -ForegroundColor White
Write-Host "  git status            查看當前狀態" -ForegroundColor White
Write-Host "  git add -A            暫存所有修改" -ForegroundColor White
Write-Host "  git commit -m 'msg'   提交修改" -ForegroundColor White
Write-Host "  git reset --hard HEAD~1  回退到上一版本" -ForegroundColor White
Write-Host ""
Read-Host "按 Enter 鍵離開"
