#!/bin/bash

# Script to help set up environment variables in Vercel
# This script provides a guide and can be used to set variables via CLI

set -e

echo "🔧 Vercel Environment Variables Setup"
echo "======================================"
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

echo -e "${BLUE}This script will help you set environment variables for Vercel.${NC}"
echo -e "${BLUE}You can set them via CLI or manually in the Vercel dashboard.${NC}"
echo ""

read -p "Do you want to set variables via CLI? (y/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo -e "${GREEN}Setting Backend Variables (Runtime)${NC}"
    echo "-----------------------------------"
    
    read -p "MONGODB_URI: " mongodb_uri
    read -p "JWT_SECRET: " jwt_secret
    read -p "FRONTEND_URL (e.g., https://your-app.vercel.app): " frontend_url
    read -p "CLOUDINARY_CLOUD_NAME: " cloudinary_name
    read -p "CLOUDINARY_API_KEY: " cloudinary_key
    read -p "CLOUDINARY_API_SECRET: " cloudinary_secret
    
    echo ""
    echo -e "${GREEN}Setting Frontend Variables (Build-time)${NC}"
    echo "-----------------------------------"
    read -p "VITE_API_URL (e.g., https://your-app.vercel.app/api): " vite_api_url
    
    echo ""
    echo -e "${YELLOW}Select environments to apply:${NC}"
    echo "1. Production only"
    echo "2. Preview only"
    echo "3. Development only"
    echo "4. All environments"
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
    echo "MONGODB_URI..."
    echo "$mongodb_uri" | vercel env add MONGODB_URI $ENV_TYPE
    
    echo "JWT_SECRET..."
    echo "$jwt_secret" | vercel env add JWT_SECRET $ENV_TYPE
    
    echo "FRONTEND_URL..."
    echo "$frontend_url" | vercel env add FRONTEND_URL $ENV_TYPE
    
    echo "CLOUDINARY_CLOUD_NAME..."
    echo "$cloudinary_name" | vercel env add CLOUDINARY_CLOUD_NAME $ENV_TYPE
    
    echo "CLOUDINARY_API_KEY..."
    echo "$cloudinary_key" | vercel env add CLOUDINARY_API_KEY $ENV_TYPE
    
    echo "CLOUDINARY_API_SECRET..."
    echo "$cloudinary_secret" | vercel env add CLOUDINARY_API_SECRET $ENV_TYPE
    
    # Set frontend variables
    echo "VITE_API_URL..."
    echo "$vite_api_url" | vercel env add VITE_API_URL $ENV_TYPE
    
    echo ""
    echo -e "${GREEN}✅ Environment variables set successfully!${NC}"
    echo -e "${YELLOW}⚠️  Remember to redeploy after setting variables.${NC}"
else
    echo ""
    echo -e "${BLUE}Manual Setup Instructions:${NC}"
    echo "1. Go to https://vercel.com and select your project"
    echo "2. Navigate to Settings → Environment Variables"
    echo "3. Add the following variables:"
    echo ""
    echo -e "${GREEN}Backend Variables:${NC}"
    echo "  - MONGODB_URI"
    echo "  - JWT_SECRET"
    echo "  - FRONTEND_URL"
    echo "  - CLOUDINARY_CLOUD_NAME"
    echo "  - CLOUDINARY_API_KEY"
    echo "  - CLOUDINARY_API_SECRET"
    echo ""
    echo -e "${GREEN}Frontend Variables (must have VITE_ prefix):${NC}"
    echo "  - VITE_API_URL"
    echo ""
    echo "See VERCEL_ENV_SETUP.md for complete details."
fi

