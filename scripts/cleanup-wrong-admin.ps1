# Script to delete wrong admin panel
# Run this after stopping the dev server

Write-Host "🗑️  Deleting wrong admin panel (apps/admin)..." -ForegroundColor Yellow

if (Test-Path "apps/admin") {
    # Stop any processes using the directory
    Write-Host "⚠️  Please stop the dev server first if it's running" -ForegroundColor Yellow
    Write-Host "Then run: Remove-Item -Path apps/admin -Recurse -Force" -ForegroundColor Cyan
} else {
    Write-Host "✅ Admin directory already deleted" -ForegroundColor Green
}







