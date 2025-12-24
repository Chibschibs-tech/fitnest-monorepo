# Cleanup Obsolete Markdown Files
# Run this script to remove outdated documentation files

$filesToDelete = @(
    "ADMIN_ANALYSIS_AND_RESPONSES.md",
    "ADMIN_PANEL_AUDIT_PLAN.md",
    "ADMIN_PANEL_FIXES_COMPLETE.md",
    "ADMIN_PANEL_FULL_AUDIT.md",
    "ADMIN_PANEL_PHASE1_COMPLETE.md",
    "ARCHITECTURE_CLARIFIED.md",
    "CART_AND_SUBSCRIPTION_REVIEW.md",
    "CART_IMPLEMENTATION_COMPLETE.md",
    "CART_REBUILD_PLAN.md",
    "CART_REBUILD_STATUS.md",
    "CART_REBUILD_SUMMARY.md",
    "CART_REBUILD_TEST_PLAN.md",
    "CART_TESTING_COMPLETE.md",
    "CLARIFICATION_SUMMARY.md",
    "CLEANUP_COMPLETE_REPORT.md",
    "CLEANUP_PLAN.md",
    "CLEANUP_PROGRESS.md",
    "CLEANUP_SUMMARY.md",
    "CRITICAL_FIXES_COMPLETE.md",
    "DATABASE_CONNECTION_FIX.md",
    "DEPLOYMENT_CONFIRMATION.md",
    "DEPLOYMENT_FIX_COMPLETE.md",
    "DEPLOYMENT_FIX.md",
    "DEPLOYMENT_SUCCESS.md",
    "DEPLOYMENT_SYSTEM_CHECK.md",
    "DOCUMENTATION_STATUS.md",
    "DOMAIN_VERIFICATION.md",
    "FINAL_MASTERY_REPORT.md",
    "FINAL_STATUS.md",
    "FINAL_TEST_REPORT.md",
    "MASTERY_GAPS_AND_QUESTIONS.md",
    "MASTERY_PROGRESS.md",
    "MASTERY_UPDATED.md",
    "MP_CATEGORIES_IMPLEMENTATION.md",
    "NEXT_STEPS.md",
    "PHASE_2_COMPLETE.md",
    "PHASE1_DEPLOYMENT.md",
    "PHASE1_PROGRESS.md",
    "PRODUCTION_DEPLOYMENT.md",
    "PROJECT_STATUS.md",
    "QUICK_FIX_DATABASE.md",
    "QUICK_TEST_CHECKLIST.md",
    "README_RESUMPTION.md",
    "RUN_TESTS.md",
    "SESSION_SUMMARY_CART_WORK.md",
    "SESSION_SUMMARY.md",
    "SUBSCRIPTION_CREATION_REVIEW.md",
    "TEST_ADMIN_FIXES.md",
    "TEST_REPORT.md",
    "TEST_RESULTS_FINAL.md",
    "TEST_RESULTS.md",
    "TESTING_GUIDE.md",
    "TROUBLESHOOTING_DATABASE.md",
    "VERCEL_DOMAIN_SETUP.md"
)

Write-Host "Cleaning up obsolete markdown files..." -ForegroundColor Yellow
Write-Host ""

$deleted = 0
$notFound = 0

foreach ($file in $filesToDelete) {
    if (Test-Path $file) {
        Remove-Item $file -Force
        Write-Host "  ✓ Deleted: $file" -ForegroundColor Green
        $deleted++
    } else {
        Write-Host "  - Not found: $file" -ForegroundColor Gray
        $notFound++
    }
}

Write-Host ""
Write-Host "Summary:" -ForegroundColor Cyan
Write-Host "  Deleted: $deleted files" -ForegroundColor Green
Write-Host "  Not found: $notFound files" -ForegroundColor Gray
Write-Host ""
Write-Host "✅ Cleanup complete!" -ForegroundColor Green





