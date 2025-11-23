# PowerShell script to set environment variables for Vercel
# Your Vercel URL: https://nahid-admin-panel.vercel.app

$VERCEL_URL = "https://nahid-admin-panel.vercel.app"
$API_URL = "$VERCEL_URL/api"

Write-Host "🔧 Setting up environment variables for Vercel" -ForegroundColor Cyan
Write-Host "Vercel URL: $VERCEL_URL"
Write-Host "API URL: $API_URL"
Write-Host ""

# Check if Vercel CLI is installed
try {
    $vercelVersion = vercel --version 2>&1
    Write-Host "✅ Vercel CLI found: $vercelVersion" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Vercel CLI not found. Installing..." -ForegroundColor Yellow
    npm install -g vercel
}

Write-Host "This script will help you set environment variables." -ForegroundColor Blue
Write-Host "You'll be prompted to enter values for each variable." -ForegroundColor Yellow
Write-Host ""

$useCli = Read-Host "Do you want to set variables via CLI? (y/n)"

if ($useCli -eq "y" -or $useCli -eq "Y") {
    Write-Host ""
    Write-Host "Setting Backend Variables" -ForegroundColor Green
    Write-Host "========================" -ForegroundColor Green
    
    Write-Host ""
    Write-Host "MONGODB_URI" -ForegroundColor Blue
    $mongodbUri = Read-Host "Enter MongoDB connection string"
    
    Write-Host ""
    Write-Host "JWT_SECRET" -ForegroundColor Blue
    $jwtSecret = Read-Host "Enter JWT secret (min 32 characters)"
    
    Write-Host ""
    Write-Host "CLOUDINARY_CLOUD_NAME" -ForegroundColor Blue
    $cloudinaryName = Read-Host "Enter Cloudinary cloud name"
    
    Write-Host ""
    Write-Host "CLOUDINARY_API_KEY" -ForegroundColor Blue
    $cloudinaryKey = Read-Host "Enter Cloudinary API key"
    
    Write-Host ""
    Write-Host "CLOUDINARY_API_SECRET" -ForegroundColor Blue
    $cloudinarySecret = Read-Host "Enter Cloudinary API secret"
    
    Write-Host ""
    Write-Host "Select environments to apply:" -ForegroundColor Yellow
    Write-Host "1. Production only"
    Write-Host "2. Preview only"
    Write-Host "3. Development only"
    Write-Host "4. All environments (Recommended)"
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
    $mongodbUri | vercel env add MONGODB_URI $envType
    $jwtSecret | vercel env add JWT_SECRET $envType
    $VERCEL_URL | vercel env add FRONTEND_URL $envType
    $cloudinaryName | vercel env add CLOUDINARY_CLOUD_NAME $envType
    $cloudinaryKey | vercel env add CLOUDINARY_API_KEY $envType
    $cloudinarySecret | vercel env add CLOUDINARY_API_SECRET $envType
    
    # Set frontend variables
    $API_URL | vercel env add VITE_API_URL $envType
    
    Write-Host ""
    Write-Host "✅ Environment variables set successfully!" -ForegroundColor Green
    Write-Host "⚠️  Remember to redeploy: npm run deploy:prod" -ForegroundColor Yellow
} else {
    Write-Host ""
    Write-Host "Manual Setup Instructions:" -ForegroundColor Blue
    Write-Host "1. Go to https://vercel.com/dashboard"
    Write-Host "2. Select your project: nahid-admin-panel"
    Write-Host "3. Go to Settings → Environment Variables"
    Write-Host "4. Add the following variables:"
    Write-Host ""
    Write-Host "Backend Variables:" -ForegroundColor Green
    Write-Host "  - MONGODB_URI"
    Write-Host "  - JWT_SECRET"
    Write-Host "  - FRONTEND_URL = $VERCEL_URL"
    Write-Host "  - CLOUDINARY_CLOUD_NAME"
    Write-Host "  - CLOUDINARY_API_KEY"
    Write-Host "  - CLOUDINARY_API_SECRET"
    Write-Host ""
    Write-Host "Frontend Variables (must have VITE_ prefix):" -ForegroundColor Green
    Write-Host "  - VITE_API_URL = $API_URL"
    Write-Host ""
    Write-Host "See SETUP_ENV_VERCEL.md for complete details."
}

