# PowerShell script to help set up environment variables in Vercel
# This script provides a guide and can be used to set variables via CLI

Write-Host "🔧 Vercel Environment Variables Setup" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Check if Vercel CLI is installed
try {
    $vercelVersion = vercel --version 2>&1
    Write-Host "✅ Vercel CLI found: $vercelVersion" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Vercel CLI not found. Installing..." -ForegroundColor Yellow
    npm install -g vercel
}

Write-Host "This script will help you set environment variables for Vercel." -ForegroundColor Blue
Write-Host "You can set them via CLI or manually in the Vercel dashboard." -ForegroundColor Blue
Write-Host ""

$useCli = Read-Host "Do you want to set variables via CLI? (y/n)"

if ($useCli -eq "y" -or $useCli -eq "Y") {
    Write-Host ""
    Write-Host "Setting Backend Variables (Runtime)" -ForegroundColor Green
    Write-Host "-----------------------------------" -ForegroundColor Green
    
    $mongodbUri = Read-Host "MONGODB_URI"
    $jwtSecret = Read-Host "JWT_SECRET"
    $frontendUrl = Read-Host "FRONTEND_URL (e.g., https://your-app.vercel.app)"
    $cloudinaryName = Read-Host "CLOUDINARY_CLOUD_NAME"
    $cloudinaryKey = Read-Host "CLOUDINARY_API_KEY"
    $cloudinarySecret = Read-Host "CLOUDINARY_API_SECRET"
    
    Write-Host ""
    Write-Host "Setting Frontend Variables (Build-time)" -ForegroundColor Green
    Write-Host "-----------------------------------" -ForegroundColor Green
    $viteApiUrl = Read-Host "VITE_API_URL (e.g., https://your-app.vercel.app/api)"
    
    Write-Host ""
    Write-Host "Select environments to apply:" -ForegroundColor Yellow
    Write-Host "1. Production only"
    Write-Host "2. Preview only"
    Write-Host "3. Development only"
    Write-Host "4. All environments"
    $envChoice = Read-Host "Choice (1-4)"
    
    $envType = ""
    switch ($envChoice) {
        "1" { $envType = "production" }
        "2" { $envType = "preview" }
        "3" { $envType = "development" }
        "4" { $envType = "" }
        default { 
            Write-Host "Invalid choice. Using all environments." -ForegroundColor Yellow
            $envType = "" 
        }
    }
    
    Write-Host ""
    Write-Host "Setting variables..." -ForegroundColor Blue
    
    # Set backend variables
    Write-Host "MONGODB_URI..."
    $mongodbUri | vercel env add MONGODB_URI $envType
    
    Write-Host "JWT_SECRET..."
    $jwtSecret | vercel env add JWT_SECRET $envType
    
    Write-Host "FRONTEND_URL..."
    $frontendUrl | vercel env add FRONTEND_URL $envType
    
    Write-Host "CLOUDINARY_CLOUD_NAME..."
    $cloudinaryName | vercel env add CLOUDINARY_CLOUD_NAME $envType
    
    Write-Host "CLOUDINARY_API_KEY..."
    $cloudinaryKey | vercel env add CLOUDINARY_API_KEY $envType
    
    Write-Host "CLOUDINARY_API_SECRET..."
    $cloudinarySecret | vercel env add CLOUDINARY_API_SECRET $envType
    
    # Set frontend variables
    Write-Host "VITE_API_URL..."
    $viteApiUrl | vercel env add VITE_API_URL $envType
    
    Write-Host ""
    Write-Host "✅ Environment variables set successfully!" -ForegroundColor Green
    Write-Host "⚠️  Remember to redeploy after setting variables." -ForegroundColor Yellow
} else {
    Write-Host ""
    Write-Host "Manual Setup Instructions:" -ForegroundColor Blue
    Write-Host "1. Go to https://vercel.com and select your project"
    Write-Host "2. Navigate to Settings → Environment Variables"
    Write-Host "3. Add the following variables:"
    Write-Host ""
    Write-Host "Backend Variables:" -ForegroundColor Green
    Write-Host "  - MONGODB_URI"
    Write-Host "  - JWT_SECRET"
    Write-Host "  - FRONTEND_URL"
    Write-Host "  - CLOUDINARY_CLOUD_NAME"
    Write-Host "  - CLOUDINARY_API_KEY"
    Write-Host "  - CLOUDINARY_API_SECRET"
    Write-Host ""
    Write-Host "Frontend Variables (must have VITE_ prefix):" -ForegroundColor Green
    Write-Host "  - VITE_API_URL"
    Write-Host ""
    Write-Host "See VERCEL_ENV_SETUP.md for complete details."
}

