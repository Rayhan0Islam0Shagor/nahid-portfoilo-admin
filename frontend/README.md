# Nahid Dashboard

A modern, production-ready dashboard built with React 19, Vite, React Router DOM v7, React Query, and Tailwind CSS.

## Features

- ✅ **React 19** with Vite for fast development
- ✅ **React Router DOM v7** for routing with protected routes
- ✅ **React Query** (@tanstack/react-query) for data fetching management
- ✅ **Tailwind CSS** for modern, responsive styling
- ✅ **Authentication** with localStorage persistence
- ✅ **Protected Routes** - automatic redirect to login if not authenticated
- ✅ **Modern UI** with sidebar navigation and topbar
- ✅ **Responsive Design** - mobile-friendly with collapsible sidebar

## Project Structure

```
src/
├─ components/        # Reusable components
├─ pages/            # Page components
│  ├─ Login.jsx      # Login page
│  └─ Dashboard.jsx  # Dashboard page
├─ layout/           # Layout components
│  └─ DashboardLayout.jsx  # Main dashboard layout with sidebar & topbar
├─ hooks/            # Custom React hooks
├─ context/          # React Context providers
│  └─ AuthContext.jsx  # Authentication context
├─ router/           # Routing configuration
│  └─ AppRouter.jsx  # Main router with protected routes
├─ main.jsx          # Application entry point
└─ App.jsx           # Root component
```

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Authentication

### Login Credentials

- **Email:** `admin@example.com`
- **Password:** `123456`

The authentication state is persisted in `localStorage` and will be restored on page refresh.

## Features Overview

### Protected Routes

- Unauthenticated users are automatically redirected to `/login`
- Authenticated users trying to access `/login` are redirected to `/dashboard`

### Dashboard Layout

- **Sidebar Navigation** with menu items (Dashboard, Analytics, Users, Settings)
- **Topbar** with logout button and notifications icon
- **Responsive** - sidebar collapses on mobile devices
- **User Info** displayed in sidebar footer

### Dashboard Page

- **Stats Cards** showing key metrics
- **Recent Activity** section
- **Quick Actions** grid

## Technologies Used

- **React 19** - UI library
- **Vite** - Build tool and dev server
- **React Router DOM v7** - Routing
- **@tanstack/react-query** - Data fetching and caching
- **Tailwind CSS** - Utility-first CSS framework
- **ESLint** - Code linting

## License

MIT
