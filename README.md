# Nahid Admin Dashboard - Fullstack Application

A fullstack admin dashboard application built with Express.js backend and React frontend.

## Features

- **Authentication**: JWT-based authentication system
- **Tracks Management**: CRUD operations for music tracks
- **Gallery Management**: CRUD operations for images
- **Pricing Plans**: CRUD operations for pricing plans
- **Dashboard**: Statistics and overview

## Tech Stack

### Backend

- Express.js
- MongoDB with Mongoose
- JWT for authentication
- bcryptjs for password hashing

### Frontend

- React 19
- React Router
- Tailwind CSS
- Vite

## Project Structure

```
nahid-admin/
├── backend/
│   ├── models/          # MongoDB models
│   ├── routes/          # API routes
│   ├── middleware/      # Auth middleware
│   └── server.js        # Express server
├── frontend/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── context/     # React contexts
│   │   ├── lib/         # API utilities
│   │   ├── pages/      # Page components
│   │   └── router/      # Routing
│   └── package.json
└── README.md
```

## Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or MongoDB Atlas)

### Backend Setup

1. Navigate to the backend directory:

```bash
cd backend
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the backend directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/nahid-admin
JWT_SECRET=your-secret-key-change-this-in-production
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

4. Start the backend server:

```bash
npm start
# or for development with auto-reload
npm run dev
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the frontend directory (optional):

```env
VITE_API_URL=http://localhost:5000/api
```

4. Start the development server:

```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## API Endpoints

### Authentication

- `POST /api/auth/login` - Login (predefined admin users only)
- `POST /api/auth/logout` - Logout

### Tracks

- `GET /api/tracks` - Get all tracks
- `GET /api/tracks/:id` - Get single track
- `POST /api/tracks` - Create track (protected)
- `PUT /api/tracks/:id` - Update track (protected)
- `DELETE /api/tracks/:id` - Delete track (protected)

### Gallery

- `GET /api/gallery` - Get all images
- `GET /api/gallery/:id` - Get single image
- `POST /api/gallery` - Create image (protected)
- `PUT /api/gallery/:id` - Update image (protected)
- `DELETE /api/gallery/:id` - Delete image (protected)

### Pricing

- `GET /api/pricing` - Get all pricing plans
- `GET /api/pricing/:id` - Get single pricing plan
- `POST /api/pricing` - Create pricing plan (protected)
- `PUT /api/pricing/:id` - Update pricing plan (protected)
- `DELETE /api/pricing/:id` - Delete pricing plan (protected)

### Dashboard

- `GET /api/dashboard/stats` - Get dashboard statistics (protected)

## Initial Setup

1. Start MongoDB (if running locally)
2. Initialize the database with predefined admin users:

```bash
cd backend
npm run init
```

This will create 4 predefined admin users:

- `admin@example.com` / `admin123`
- `admin2@example.com` / `admin123`
- `admin3@example.com` / `admin123`
- `admin4@example.com` / `admin123`

**⚠️ Important:** Change these passwords after first login!

3. Start the backend server:

```bash
npm start
```

4. Login using one of the predefined admin credentials

## Development

- Backend runs on port 5000
- Frontend runs on port 5173
- Make sure MongoDB is running before starting the backend

## Production Build

### Frontend

```bash
cd frontend
npm run build
```

The built files will be in `frontend/dist/` and will be served by the Express server.

### Backend

The Express server will serve the built React app in production mode.

## Vercel Deployment

This application is configured for deployment on Vercel. The setup includes automatic clustering for traditional servers and single-process mode for Vercel's serverless environment.

### Prerequisites

1. Install Vercel CLI (if not already installed):

   ```bash
   npm install -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

### Deployment Commands

**Production Deployment (Recommended):**

```bash
npm run deploy:prod
```

This command builds both frontend and backend, then deploys to production.

**Preview Deployment (For Testing):**

```bash
npm run deploy:dev
```

This command builds and deploys to a preview URL for testing before production.

**Direct Vercel Commands:**

- **Production:**

  ```bash
  npm run vercel:deploy
  # or
  vercel --prod
  ```

- **Preview:**

  ```bash
  npm run vercel:deploy:preview
  # or
  vercel
  ```

- **Build Only (without deploying):**

  ```bash
  npm run vercel:build
  ```

- **Local Vercel Development:**
  ```bash
  npm run vercel:dev
  # or
  vercel dev
  ```

### Environment Variables

Make sure to set the following environment variables in your Vercel project settings:

**Backend Variables:**

- `MONGODB_URI` - Your MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `FRONTEND_URL` - Your frontend URL (e.g., `https://your-app.vercel.app`)
- `NODE_ENV` - Set to `production` for production deployments

**Frontend Variables (if needed):**

- `VITE_API_URL` - Your API URL (e.g., `https://your-app.vercel.app/api`)

### Clustering

- **On Vercel:** The application automatically runs in single-process mode (Vercel handles scaling)
- **On Traditional Servers:** The application uses Node.js clustering to utilize all CPU cores
- **No configuration needed:** The application automatically detects the environment

### Notes

- The build process automatically installs dependencies for both backend and frontend
- Static files are served from `frontend/dist/`
- API routes are handled by serverless functions
- The application supports SPA routing (client-side routing works correctly)

## License

MIT
