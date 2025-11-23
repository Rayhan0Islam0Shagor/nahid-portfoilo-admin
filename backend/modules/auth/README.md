# Auth Module

This module contains all authentication-related functionality for the application.

## Structure

```
modules/auth/
├── models/
│   └── User.js              # User database model
├── services/
│   └── authService.js       # Business logic for authentication
├── controllers/
│   └── authController.js    # Request handlers
├── middleware/
│   └── authMiddleware.js    # Authentication middleware
├── routes/
│   └── authRoutes.js       # API route definitions
├── index.js                 # Module exports
└── README.md               # This file
```

## Components

### Models (`models/User.js`)
- **User**: MongoDB model for user accounts
- Handles password hashing automatically
- Includes `comparePassword` method for authentication

### Services (`services/authService.js`)
Business logic layer - handles core authentication operations:
- `loginUser(email, password)` - Authenticate user and generate token
- `getUserById(userId)` - Get user by ID
- `generateToken(user)` - Generate JWT token

### Controllers (`controllers/authController.js`)
Request handlers - process HTTP requests and responses:
- `login(req, res)` - Handle login request
- `logout(req, res)` - Handle logout request

### Middleware (`middleware/authMiddleware.js`)
Express middleware for authentication:
- `authenticateToken` - Protect routes (requires valid token)
- `optionalAuth` - Optional authentication (adds user if token valid)

### Routes (`routes/authRoutes.js`)
API route definitions:
- `POST /api/auth/login` - Login endpoint
- `POST /api/auth/logout` - Logout endpoint

## Usage

### Importing the Module

```javascript
// Import everything
import { authRoutes, authenticateToken, User, loginUser } from './modules/auth/index.js';

// Or import specific parts
import { authRoutes } from './modules/auth/index.js';
import { authenticateToken } from './modules/auth/index.js';
```

### Using in Server

```javascript
import { authRoutes } from './modules/auth/index.js';

app.use('/api/auth', authRoutes);
```

### Using Middleware in Routes

```javascript
import { authenticateToken } from './modules/auth/index.js';

router.post('/protected-route', authenticateToken, async (req, res) => {
  // req.user contains decoded token info
  const userId = req.user.userId;
  // ...
});
```

### Using Services

```javascript
import { loginUser, getUserById } from './modules/auth/index.js';

// In a controller
const { user, token } = await loginUser(email, password);
```

## Flow

1. **Request** → Route handler (controller)
2. **Controller** → Calls service for business logic
3. **Service** → Uses model to interact with database
4. **Response** → Controller sends response back

## Example Flow: Login

```
Client Request (POST /api/auth/login)
    ↓
authRoutes.js → authController.login()
    ↓
authService.loginUser()
    ↓
User Model (find user, compare password)
    ↓
authService.generateToken()
    ↓
authController (set cookie, send response)
    ↓
Client receives token
```

## Benefits of This Structure

1. **Separation of Concerns**: Each layer has a specific responsibility
2. **Reusability**: Services can be used in multiple controllers
3. **Testability**: Easy to test each layer independently
4. **Maintainability**: Clear structure makes code easy to understand
5. **Scalability**: Easy to add new features or modify existing ones

