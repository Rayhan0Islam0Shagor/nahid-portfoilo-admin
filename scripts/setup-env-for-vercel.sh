#!/bin/bash

# Quick script to set environment variables for Vercel
# Your Vercel URL: https://nahid-admin-panel.vercel.app

set -e

VERCEL_URL="https://nahid-admin-panel.vercel.app"
API_URL="${VERCEL_URL}/api"

echo "🔧 Setting up environment variables for Vercel"
echo "Vercel URL: $VERCEL_URL"
echo "API URL: $API_URL"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo -e "${YELLOW}⚠️  Vercel CLI not found. Installing...${NC}"
    npm install -g vercel
fi

echo -e "${BLUE}This script will help you set environment variables.${NC}"
echo -e "${YELLOW}You'll be prompted to enter values for each variable.${NC}"
echo ""

read -p "Do you want to set variables via CLI? (y/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo -e "${GREEN}Setting Backend Variables${NC}"
    echo "========================"
    
    echo ""
    echo -e "${BLUE}MONGODB_URI${NC}"
    read -p "Enter MongoDB connection string: " mongodb_uri
    
    echo ""
    echo -e "${BLUE}JWT_SECRET${NC}"
    read -p "Enter JWT secret (min 32 characters): " jwt_secret
    
    echo ""
    echo -e "${BLUE}CLOUDINARY_CLOUD_NAME${NC}"
    read -p "Enter Cloudinary cloud name: " cloudinary_name
    
    echo ""
    echo -e "${BLUE}CLOUDINARY_API_KEY${NC}"
    read -p "Enter Cloudinary API key: " cloudinary_key
    
    echo ""
    echo -e "${BLUE}CLOUDINARY_API_SECRET${NC}"
    read -p "Enter Cloudinary API secret: " cloudinary_secret
    
    echo ""
    echo -e "${YELLOW}Select environments to apply:${NC}"
    echo "1. Production only"
    echo "2. Preview only"
    echo "3. Development only"
    echo "4. All environments (Recommended)"
    read -p "Choice (1-4): " env_choice
    
    ENV_TYPE=""
    case $env_choice in
        1) ENV_TYPE="production" ;;
        2) ENV_TYPE="preview" ;;
        3) ENV_TYPE="development" ;;
        4) ENV_TYPE="" ;;
        *) echo "Invalid choice. Using all environments."; ENV_TYPE="" ;;
    esac
    
    echo ""
    echo -e "${BLUE}Setting variables...${NC}"
    
    # Set backend variables
    echo "$mongodb_uri" | vercel env add MONGODB_URI $ENV_TYPE
    echo "$jwt_secret" | vercel env add JWT_SECRET $ENV_TYPE
    echo "$VERCEL_URL" | vercel env add FRONTEND_URL $ENV_TYPE
    echo "$cloudinary_name" | vercel env add CLOUDINARY_CLOUD_NAME $ENV_TYPE
    echo "$cloudinary_key" | vercel env add CLOUDINARY_API_KEY $ENV_TYPE
    echo "$cloudinary_secret" | vercel env add CLOUDINARY_API_SECRET $ENV_TYPE
    
    # Set frontend variables
    echo "$API_URL" | vercel env add VITE_API_URL $ENV_TYPE
    
    echo ""
    echo -e "${GREEN}✅ Environment variables set successfully!${NC}"
    echo -e "${YELLOW}⚠️  Remember to redeploy: npm run deploy:prod${NC}"
else
    echo ""
    echo -e "${BLUE}Manual Setup Instructions:${NC}"
    echo "1. Go to https://vercel.com/dashboard"
    echo "2. Select your project: nahid-admin-panel"
    echo "3. Go to Settings → Environment Variables"
    echo "4. Add the following variables:"
    echo ""
    echo -e "${GREEN}Backend Variables:${NC}"
    echo "  - MONGODB_URI"
    echo "  - JWT_SECRET"
    echo "  - FRONTEND_URL = $VERCEL_URL"
    echo "  - CLOUDINARY_CLOUD_NAME"
    echo "  - CLOUDINARY_API_KEY"
    echo "  - CLOUDINARY_API_SECRET"
    echo ""
    echo -e "${GREEN}Frontend Variables (must have VITE_ prefix):${NC}"
    echo "  - VITE_API_URL = $API_URL"
    echo ""
    echo "See SETUP_ENV_VERCEL.md for complete details."
fi

