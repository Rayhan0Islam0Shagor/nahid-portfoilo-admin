# Backend Modules

This directory contains all backend modules organized by feature/domain. Each module is self-contained with all related files in a single folder.

## Module Structure

Each module follows this simple structure:

```
modules/[module-name]/
├── [Module]Model.js      # Database model (if needed)
├── [module]Routes.js     # API routes
├── [module]Service.js    # Business logic (if needed)
├── [module]Controller.js # Request handlers (if needed)
├── [module]Middleware.js # Middleware (if needed)
├── index.js              # Module exports
└── README.md             # Module documentation (optional)
```

## Available Modules

### Auth Module (`auth/`)
Handles all authentication functionality:
- `User.js` - User database model
- `authService.js` - Business logic (login, token generation)
- `authController.js` - Request handlers
- `authMiddleware.js` - Authentication middleware
- `authRoutes.js` - API routes

**Usage:**
```javascript
import { authRoutes, authenticateToken, User } from './modules/auth/index.js';
```

### Tracks Module (`tracks/`)
Handles track management:
- `Track.js` - Track database model
- `tracksRoutes.js` - API routes

**Usage:**
```javascript
import { tracksRoutes, Track } from './modules/tracks/index.js';
```

### Gallery Module (`gallery/`)
Handles gallery/image management:
- `Gallery.js` - Gallery database model
- `galleryRoutes.js` - API routes

**Usage:**
```javascript
import { galleryRoutes, Gallery } from './modules/gallery/index.js';
```

### Pricing Module (`pricing/`)
Handles pricing plan management:
- `Pricing.js` - Pricing database model
- `pricingRoutes.js` - API routes

**Usage:**
```javascript
import { pricingRoutes, Pricing } from './modules/pricing/index.js';
```

### Dashboard Module (`dashboard/`)
Handles dashboard statistics:
- `dashboardRoutes.js` - API routes

**Usage:**
```javascript
import { dashboardRoutes } from './modules/dashboard/index.js';
```

## Module Pattern

Each module:
1. Contains all related files in one folder
2. Has an `index.js` that exports everything
3. Is self-contained and independent
4. Can be easily understood by looking at one folder

## Benefits

- **Simple Structure**: All related files in one place
- **Easy to Understand**: Everything for a feature is together
- **Easy to Navigate**: No need to jump between folders
- **Self-Contained**: Each module is independent
- **Scalable**: Easy to add new modules
