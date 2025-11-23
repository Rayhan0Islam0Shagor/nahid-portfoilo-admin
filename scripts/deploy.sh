#!/bin/bash

# Vercel Deployment Script for Development and Production
# Usage: ./scripts/deploy.sh [dev|prod]

set -e

ENVIRONMENT=${1:-dev}

echo "🚀 Starting Vercel deployment for: $ENVIRONMENT"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo -e "${YELLOW}⚠️  Vercel CLI not found. Installing...${NC}"
    npm install -g vercel
fi

# Install dependencies
echo -e "${BLUE}📦 Installing dependencies...${NC}"
npm run install:all

# Build frontend
echo -e "${BLUE}🔨 Building frontend...${NC}"
npm run build:frontend

# Build backend (install dependencies)
echo -e "${BLUE}🔨 Preparing backend...${NC}"
npm run build:backend

# Deploy based on environment
if [ "$ENVIRONMENT" = "prod" ]; then
    echo -e "${GREEN}🚀 Deploying to PRODUCTION...${NC}"
    vercel --prod
    echo -e "${GREEN}✅ Production deployment complete!${NC}"
else
    echo -e "${GREEN}🚀 Deploying to DEVELOPMENT/PREVIEW...${NC}"
    vercel
    echo -e "${GREEN}✅ Development deployment complete!${NC}"
fi

echo -e "${GREEN}✨ Deployment finished!${NC}"

