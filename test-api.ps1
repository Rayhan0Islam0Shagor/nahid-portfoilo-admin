# Quick API Test Script
$baseUrl = "https://nahid-admin-panel.vercel.app"

Write-Host "Testing API endpoints..." -ForegroundColor Cyan
Write-Host ""

# Test health endpoint
Write-Host "1. Testing /api/health..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/health"
    Write-Host "✅ Health check passed!" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor Cyan
    $response | ConvertTo-Json
} catch {
    Write-Host "❌ Health check failed!" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        Write-Host "Status Code: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    }
}

Write-Host ""

# Test frontend
Write-Host "2. Testing frontend..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri $baseUrl -UseBasicParsing
    Write-Host "✅ Frontend accessible! Status: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "❌ Frontend check failed!" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

