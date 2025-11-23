# Vercel Deployment Script for Development and Production (PowerShell)
# Usage: .\scripts\deploy.ps1 [dev|prod]

param(
    [string]$Environment = "dev"
)

Write-Host "🚀 Starting Vercel deployment for: $Environment" -ForegroundColor Cyan

# Check if Vercel CLI is installed
try {
    $vercelVersion = vercel --version 2>&1
    Write-Host "✅ Vercel CLI found: $vercelVersion" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Vercel CLI not found. Installing..." -ForegroundColor Yellow
    npm install -g vercel
}

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Blue
npm run install:all

# Build frontend
Write-Host "🔨 Building frontend..." -ForegroundColor Blue
npm run build:frontend

# Build backend (install dependencies)
Write-Host "🔨 Preparing backend..." -ForegroundColor Blue
npm run build:backend

# Deploy based on environment
if ($Environment -eq "prod") {
    Write-Host "🚀 Deploying to PRODUCTION..." -ForegroundColor Green
    vercel --prod
    Write-Host "✅ Production deployment complete!" -ForegroundColor Green
} else {
    Write-Host "🚀 Deploying to DEVELOPMENT/PREVIEW..." -ForegroundColor Green
    vercel
    Write-Host "✅ Development deployment complete!" -ForegroundColor Green
}

Write-Host "✨ Deployment finished!" -ForegroundColor Green

