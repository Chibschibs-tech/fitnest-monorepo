# Database Setup Script for FitNest
# This script helps you switch between local and live database connections

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("local", "live")]
    [string]$Mode = "local"
)

Write-Host "🔧 Setting up database connection: $Mode" -ForegroundColor Cyan

if ($Mode -eq "local") {
    $dbUrl = "postgresql://fitnest:fitnest_dev_password@localhost:5433/fitnest_db"
    Write-Host "✅ Using LOCAL database" -ForegroundColor Green
} else {
    Write-Host "⚠️  Please provide your LIVE database URL:" -ForegroundColor Yellow
    $liveDbUrl = Read-Host "Enter DATABASE_URL"
    if ([string]::IsNullOrWhiteSpace($liveDbUrl)) {
        Write-Host "❌ No database URL provided. Exiting." -ForegroundColor Red
        exit 1
    }
    $dbUrl = $liveDbUrl
    Write-Host "✅ Using LIVE database" -ForegroundColor Green
}

# Update root .env
$envContent = "DATABASE_URL=$dbUrl"
$envContent | Out-File -FilePath .env -Encoding utf8 -NoNewline
Write-Host "✅ Updated .env" -ForegroundColor Green

# Update apps/web/.env.local
$envContent | Out-File -FilePath apps/web/.env.local -Encoding utf8 -NoNewline
Write-Host "✅ Updated apps/web/.env.local" -ForegroundColor Green

# Update apps/admin/.env.local
$envContent | Out-File -FilePath apps/admin/.env.local -Encoding utf8 -NoNewline
Write-Host "✅ Updated apps/admin/.env.local" -ForegroundColor Green

Write-Host "`n✨ Database configuration updated!" -ForegroundColor Green
Write-Host "`nTo switch modes, run:" -ForegroundColor Cyan
Write-Host "  .\setup-db.ps1 -Mode local   (for local database)" -ForegroundColor White
Write-Host "  .\setup-db.ps1 -Mode live    (for live database)" -ForegroundColor White




