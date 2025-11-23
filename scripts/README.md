# Deployment Scripts

This directory contains deployment scripts for Vercel.

## Available Scripts

### `deploy.sh` (Linux/Mac)

Bash script for deploying to Vercel.

**Usage:**
```bash
chmod +x scripts/deploy.sh
./scripts/deploy.sh dev    # Development/preview deployment
./scripts/deploy.sh prod   # Production deployment
```

### `deploy.ps1` (Windows PowerShell)

PowerShell script for deploying to Vercel.

**Usage:**
```powershell
.\scripts\deploy.ps1 dev    # Development/preview deployment
.\scripts\deploy.ps1 prod    # Production deployment
```

## What These Scripts Do

1. Check if Vercel CLI is installed (install if missing)
2. Install all dependencies (backend + frontend)
3. Build the frontend
4. Prepare the backend
5. Deploy to Vercel (dev or prod based on argument)

## Prerequisites

- Node.js installed
- npm installed
- Vercel CLI (will be installed automatically if missing)

## First Time Setup

Before running the scripts, make sure you're logged into Vercel:

```bash
vercel login
```

Then link your project (first time only):

```bash
vercel link
```

