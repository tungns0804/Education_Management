# ============================================================
# EduManage — Master Data Seed Runner
# ============================================================
# Cách dùng:
#   .\scripts\run_seed.ps1
#   .\scripts\run_seed.ps1 -DbName my_database
#   .\scripts\run_seed.ps1 -DbUser postgres -DbPass secret -DbName edudb
# ============================================================

param(
  [string]$DbHost = "localhost",
  [string]$DbPort = "5432",
  [string]$DbUser = "postgres",
  [string]$DbPass = "admin12345",
  [string]$DbName = "education_management_database"
)

$PSQL  = "C:\Program Files\PostgreSQL\17\bin\psql.exe"
$SCRIPT = Join-Path $PSScriptRoot "init_master_data.sql"

# ── Kiểm tra psql ────────────────────────────────────────────
if (-not (Test-Path $PSQL)) {
  # Thử tìm phiên bản khác
  $found = Get-ChildItem "C:\Program Files\PostgreSQL" -Recurse -Filter "psql.exe" -ErrorAction SilentlyContinue |
           Where-Object { $_.FullName -notmatch 'pgAdmin' } |
           Select-Object -First 1
  if ($found) { $PSQL = $found.FullName }
  else {
    Write-Host "ERROR: Không tìm thấy psql.exe. Vui lòng cài PostgreSQL hoặc sửa đường dẫn trong script." -ForegroundColor Red
    exit 1
  }
}

# ── Kiểm tra file SQL ────────────────────────────────────────
if (-not (Test-Path $SCRIPT)) {
  Write-Host "ERROR: Không tìm thấy $SCRIPT" -ForegroundColor Red
  exit 1
}

Write-Host ""
Write-Host "═══════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  EduManage — Master Data Seed" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  Host  : $DbHost`:$DbPort"
Write-Host "  DB    : $DbName"
Write-Host "  User  : $DbUser"
Write-Host "  Script: $SCRIPT"
Write-Host "───────────────────────────────────────────" -ForegroundColor Cyan

$env:PGPASSWORD = $DbPass

$result = & $PSQL -h $DbHost -p $DbPort -U $DbUser -d $DbName -f $SCRIPT 2>&1

if ($LASTEXITCODE -eq 0) {
  Write-Host ""
  Write-Host "  Seed hoàn tất!" -ForegroundColor Green
  Write-Host ""
  # In ra dòng cuối (bảng count)
  $result | Select-Object -Last 10 | ForEach-Object { Write-Host "  $_" }
  Write-Host ""
  Write-Host "  Tài khoản demo:" -ForegroundColor Yellow
  Write-Host "    Admin   : admin@school.edu.vn            / Admin@123"
  Write-Host "    Teacher : gv1001@school.edu.vn           / Teacher@123"
  Write-Host "    Student : 20216001@student.school.edu.vn / Student@123"
  Write-Host "═══════════════════════════════════════════" -ForegroundColor Cyan
  Write-Host ""
} else {
  Write-Host ""
  Write-Host "  LỖI khi chạy seed:" -ForegroundColor Red
  $result | ForEach-Object { Write-Host "  $_" -ForegroundColor Red }
  Write-Host "═══════════════════════════════════════════" -ForegroundColor Cyan
  exit 1
}
