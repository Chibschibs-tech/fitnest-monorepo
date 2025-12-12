# Simple PowerShell Test Script for Admin Endpoints
# Tests the updated admin endpoints

$baseUrl = "http://localhost:3002"
$adminEmail = "chihab@ekwip.ma"
$adminPassword = "FITnest123!"

Write-Host "Testing Admin Panel Fixes" -ForegroundColor Cyan
Write-Host "Base URL: $baseUrl" -ForegroundColor Gray
Write-Host ""

# Test results
$results = @{
    Passed = @()
    Failed = @()
}

# Helper function to test endpoints
function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Method,
        [string]$Url,
        [hashtable]$Headers = @{},
        [object]$Body = $null,
        [Microsoft.PowerShell.Commands.WebRequestSession]$Session = $null
    )
    
    try {
        Write-Host "Testing: $Name" -ForegroundColor Yellow
        
        $params = @{
            Method = $Method
            Uri = $Url
            Headers = $Headers
            ErrorAction = "Stop"
        }
        
        if ($Session) {
            $params.WebSession = $Session
        }
        
        if ($Body) {
            $params.Body = ($Body | ConvertTo-Json)
            $params.ContentType = "application/json"
        }
        
        $response = Invoke-WebRequest @params
        
        if ($response.StatusCode -ge 200 -and $response.StatusCode -lt 300) {
            Write-Host "  [PASS] PASSED" -ForegroundColor Green
            $results.Passed += $Name
            return $true
        } else {
            Write-Host "  [FAIL] Status $($response.StatusCode)" -ForegroundColor Red
            $results.Failed += $Name
            return $false
        }
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Host "  [FAIL] $statusCode - $($_.Exception.Message)" -ForegroundColor Red
        $results.Failed += $Name
        return $false
    }
}

# Step 1: Login to get session
Write-Host "Logging in as admin..." -ForegroundColor Cyan
try {
    $loginBody = @{
        email = $adminEmail
        password = $adminPassword
    } | ConvertTo-Json
    
    $loginResponse = Invoke-WebRequest -Method POST -Uri "$baseUrl/api/auth/login" `
        -ContentType "application/json" `
        -Body $loginBody `
        -SessionVariable session
    
    $sessionCookie = $session.Cookies.GetCookies($baseUrl) | Where-Object { $_.Name -eq "session-id" }
    
    if (-not $sessionCookie) {
        Write-Host "[ERROR] Failed to get session cookie" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "[OK] Logged in successfully" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "[ERROR] Login failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   Make sure the dev server is running and admin user exists" -ForegroundColor Yellow
    Write-Host "   Start server with: pnpm dev" -ForegroundColor Yellow
    exit 1
}

# Test Express Shop Endpoints
Write-Host "Testing Express Shop CRUD..." -ForegroundColor Cyan

Test-Endpoint -Name "Express Shop - GET (List)" `
    -Method "GET" `
    -Url "$baseUrl/api/admin/products/express-shop" `
    -Headers @{} `
    -Session $session

# Test Orders Endpoints
Write-Host ""
Write-Host "Testing Orders API..." -ForegroundColor Cyan

Test-Endpoint -Name "Orders - GET (List)" `
    -Method "GET" `
    -Url "$baseUrl/api/admin/orders" `
    -Headers @{} `
    -Session $session

Test-Endpoint -Name "Orders - GET (Filtered)" `
    -Method "GET" `
    -Url "$baseUrl/api/admin/orders?status=pending" `
    -Headers @{} `
    -Session $session

# Test Authentication (should fail)
Write-Host ""
Write-Host "Testing Authentication..." -ForegroundColor Cyan

try {
    $response = Invoke-WebRequest -Method GET -Uri "$baseUrl/api/admin/products/express-shop" -ErrorAction Stop
    Write-Host "  [FAIL] Should have returned 401" -ForegroundColor Red
    $results.Failed += "Auth - No Session"
} catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 401) {
        Write-Host "  [PASS] Correctly blocked unauthorized access" -ForegroundColor Green
        $results.Passed += "Auth - No Session"
    } else {
        Write-Host "  [WARN] Unexpected status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Yellow
    }
}

# Print Summary
Write-Host ""
Write-Host ("=" * 60) -ForegroundColor Cyan
Write-Host "TEST SUMMARY" -ForegroundColor Cyan
Write-Host ("=" * 60) -ForegroundColor Cyan
Write-Host "[PASS] Passed: $($results.Passed.Count)" -ForegroundColor Green
Write-Host "[FAIL] Failed: $($results.Failed.Count)" -ForegroundColor Red

if ($results.Passed.Count -gt 0) {
    Write-Host ""
    Write-Host "Passed Tests:" -ForegroundColor Green
    $results.Passed | ForEach-Object { Write-Host "   - $_" -ForegroundColor Gray }
}

if ($results.Failed.Count -gt 0) {
    Write-Host ""
    Write-Host "Failed Tests:" -ForegroundColor Red
    $results.Failed | ForEach-Object { Write-Host "   - $_" -ForegroundColor Gray }
}

Write-Host ""
Write-Host ("=" * 60) -ForegroundColor Cyan

if ($results.Failed.Count -eq 0) {
    Write-Host "All tests passed!" -ForegroundColor Green
    exit 0
} else {
    Write-Host "Some tests failed" -ForegroundColor Yellow
    exit 1
}

