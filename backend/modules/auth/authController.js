import { loginUser } from './authService.js';

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user (🔒 ADMIN ONLY)
 *     tags: [Authentication]
 *     description: |
 *       **Access Level: 🔒 ADMIN ONLY**
 *       
 *       Login with email and password. Returns JWT token for authenticated requests.
 *       Only predefined admin users can access this endpoint.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: admin@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: admin123
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Login successful
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 token:
 *                   type: string
 *                   description: JWT token for authenticated requests
 *       400:
 *         description: Missing email or password
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: 'Email and password are required' });
    }

    const { user, token } = await loginUser(email, password);

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({
      message: 'Login successful',
      user,
      token,
    });
  } catch (error) {
    res.status(401).json({
      message: error.message || 'Error during login',
    });
  }
};

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout user (🔒 ADMIN ONLY)
 *     tags: [Authentication]
 *     description: |
 *       **Access Level: 🔒 ADMIN ONLY**
 *       
 *       Logout and clear authentication cookie.
 *     responses:
 *       200:
 *         description: Logout successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Logout successful
 */
export const logout = (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logout successful' });
};

