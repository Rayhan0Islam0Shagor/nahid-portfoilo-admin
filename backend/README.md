# Backend Server

Express.js backend server for Nahid Admin Dashboard.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file:
   - Copy `.env.example` to `.env`
   - Or see `SETUP_ENV.md` for detailed instructions
   - Fill in your Cloudinary credentials (required for image/audio uploads)
   - Set your MongoDB connection string
   - Set a secure JWT secret

   Required environment variables:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/nahid-admin
   JWT_SECRET=your-secret-key-change-this-in-production
   FRONTEND_URL=http://localhost:5173
   NODE_ENV=development
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   ```

3. Initialize database (creates 4 predefined admin users):
```bash
npm run init
```

This creates the following admin users:
- `admin@example.com` / `admin123`
- `admin2@example.com` / `admin123`
- `admin3@example.com` / `admin123`
- `admin4@example.com` / `admin123`

**Note:** Registration is disabled. Only predefined admin users can access the system.

4. Start MongoDB (if running locally)

5. Start the server:
```bash
npm start
# or for development
npm run dev
```

## API Routes

All API routes are prefixed with `/api`

- `/auth` - Authentication routes
- `/tracks` - Track management routes
- `/gallery` - Gallery management routes
- `/pricing` - Pricing plan routes
- `/dashboard` - Dashboard statistics

## Authentication

Protected routes require a JWT token in:
- Cookie: `token`
- Header: `Authorization: Bearer <token>`

