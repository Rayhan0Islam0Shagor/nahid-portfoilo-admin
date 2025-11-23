import express from 'express';
import Track from '../tracks/Track.js';
import Gallery from '../gallery/Gallery.js';
import Pricing from '../pricing/Pricing.js';
import Sale from '../sales/Sale.js';
import Contact from '../contacts/Contact.js';
import { authenticateToken } from '../auth/index.js';
import { cacheMiddleware } from '../../middleware/cache.js';
import { sendContactNotification, testEmailConfig } from '../../utils/email.js';

const router = express.Router();

/**
 * @swagger
 * /dashboard/stats:
 *   get:
 *     summary: Get dashboard statistics (🔒 ADMIN ONLY)
 *     tags: [Dashboard]
 *     description: |
 *       **Access Level: 🔒 ADMIN ONLY**
 *       
 *       Get dashboard statistics including:
 *       - Total tracks
 *       - Total tracks sold
 *       - Total profit
 *       - Total images
 *       - Total pricing plans
 *       - Total contacts
 *       - Unread contacts count
 *       
 *       Requires admin authentication.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DashboardStats'
 *       401:
 *         description: Unauthorized
 */
// Get dashboard statistics
router.get('/stats', cacheMiddleware.short, authenticateToken, async (req, res) => {
  try {
    const [tracks, images, pricingPlans, sales, contacts] = await Promise.all([
      Track.find(),
      Gallery.find(),
      Pricing.find(),
      Sale.find(),
      Contact.find(),
    ]);

    const totalTracks = tracks.length;
    const totalTracksSold = sales.length;
    
    // Calculate total profit (sum of all completed sales)
    const totalProfit = sales
      .filter((sale) => sale.paymentStatus === 'completed')
      .reduce((sum, sale) => sum + (sale.price || 0), 0);

    const totalImages = images.length;
    const totalPricingPlans = pricingPlans.length;
    const totalContacts = contacts.length;
    const unreadContacts = contacts.filter((contact) => !contact.isRead).length;

    res.json({
      totalTracks,
      totalTracksSold,
      totalProfit,
      totalImages,
      totalPricingPlans,
      totalContacts,
      unreadContacts,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching dashboard statistics',
      error: error.message,
    });
  }
});

/**
 * @swagger
 * /dashboard/sales-stats:
 *   get:
 *     summary: Get sales statistics (🔒 ADMIN ONLY)
 *     tags: [Dashboard]
 *     description: |
 *       **Access Level: 🔒 ADMIN ONLY**
 *
 *       Get detailed sales statistics including:
 *       - Sales by date (last 30 days)
 *       - Sales by track
 *       - Sales by payment method
 *       - Sales by status
 *       Requires admin authentication.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 30
 *         description: Number of days to analyze
 *     responses:
 *       200:
 *         description: Sales statistics
 *       401:
 *         description: Unauthorized
 */
// Get sales statistics
router.get('/sales-stats', cacheMiddleware.short, authenticateToken, async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const daysNum = parseInt(days, 10) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysNum);

    const sales = await Sale.find({
      createdAt: { $gte: startDate },
    })
      .populate('trackId', 'title category')
      .sort({ createdAt: -1 });

    // Sales by date (last 30 days)
    const salesByDate = {};
    sales.forEach((sale) => {
      const date = new Date(sale.createdAt).toISOString().split('T')[0];
      if (!salesByDate[date]) {
        salesByDate[date] = { count: 0, revenue: 0 };
      }
      if (sale.paymentStatus === 'completed') {
        salesByDate[date].count += 1;
        salesByDate[date].revenue += sale.price || 0;
      }
    });

    // Sales by track
    const salesByTrack = {};
    sales.forEach((sale) => {
      const trackId = sale.trackId?._id?.toString() || sale.trackId?.toString();
      const trackTitle = sale.trackTitle || sale.trackId?.title || 'Unknown';
      if (!salesByTrack[trackId]) {
        salesByTrack[trackId] = {
          trackId: trackId,
          trackTitle: trackTitle,
          count: 0,
          revenue: 0,
        };
      }
      if (sale.paymentStatus === 'completed') {
        salesByTrack[trackId].count += 1;
        salesByTrack[trackId].revenue += sale.price || 0;
      }
    });

    // Sales by payment method
    const salesByMethod = {};
    sales.forEach((sale) => {
      const method = sale.paymentMethod || 'unknown';
      if (!salesByMethod[method]) {
        salesByMethod[method] = { count: 0, revenue: 0 };
      }
      if (sale.paymentStatus === 'completed') {
        salesByMethod[method].count += 1;
        salesByMethod[method].revenue += sale.price || 0;
      }
    });

    // Sales by status
    const salesByStatus = {};
    sales.forEach((sale) => {
      const status = sale.paymentStatus || 'pending';
      if (!salesByStatus[status]) {
        salesByStatus[status] = { count: 0, revenue: 0 };
      }
      salesByStatus[status].count += 1;
      if (status === 'completed') {
        salesByStatus[status].revenue += sale.price || 0;
      }
    });

    // Top selling tracks
    const topTracks = Object.values(salesByTrack)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    return res.json({
      success: true,
      data: {
        period: {
          days: daysNum,
          startDate: startDate.toISOString(),
          endDate: new Date().toISOString(),
        },
        salesByDate: Object.entries(salesByDate)
          .map(([date, data]) => ({ date, ...data }))
          .sort((a, b) => a.date.localeCompare(b.date)),
        salesByTrack: Object.values(salesByTrack),
        salesByMethod: Object.entries(salesByMethod).map(([method, data]) => ({
          method,
          ...data,
        })),
        salesByStatus: Object.entries(salesByStatus).map(([status, data]) => ({
          status,
          ...data,
        })),
        topTracks,
        totalSales: sales.length,
        completedSales: sales.filter((s) => s.paymentStatus === 'completed').length,
        totalRevenue: sales
          .filter((s) => s.paymentStatus === 'completed')
          .reduce((sum, s) => sum + (s.price || 0), 0),
      },
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching sales statistics',
      error: error.message,
    });
  }
});

/**
 * @swagger
 * /dashboard/payment-history:
 *   get:
 *     summary: Get payment history (🔒 ADMIN ONLY)
 *     tags: [Dashboard]
 *     description: |
 *       **Access Level: 🔒 ADMIN ONLY**
 *
 *       Get recent payment history with pagination.
 *       Requires admin authentication.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of records to return
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, completed, failed, refunded]
 *         description: Filter by payment status
 *     responses:
 *       200:
 *         description: Payment history
 *       401:
 *         description: Unauthorized
 */
// Get payment history
router.get('/payment-history', cacheMiddleware.short, authenticateToken, async (req, res) => {
  try {
    const { limit = 20, page = 1, status } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const query = {};
    if (status) {
      query.paymentStatus = status;
    }

    const [payments, total] = await Promise.all([
      Sale.find(query)
        .populate('trackId', 'title thumbnail category')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Sale.countDocuments(query),
    ]);

    return res.json({
      success: true,
      data: {
        payments,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching payment history',
      error: error.message,
    });
  }
});

/**
 * @swagger
 * /dashboard/test-email:
 *   post:
 *     summary: Test email configuration (🔒 ADMIN ONLY)
 *     tags: [Dashboard]
 *     description: |
 *       **Access Level: 🔒 ADMIN ONLY**
 *
 *       Test email sending functionality and configuration.
 *       Requires admin authentication.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Email test result
 *       401:
 *         description: Unauthorized
 */
// Test email configuration
router.post('/test-email', authenticateToken, async (req, res) => {
  try {
    // Check environment variables
    const envCheck = {
      EMAIL_USER: !!process.env.EMAIL_USER,
      EMAIL_PASSWORD: !!process.env.EMAIL_PASSWORD,
      ADMIN_EMAIL: !!process.env.ADMIN_EMAIL,
    };

    if (!envCheck.EMAIL_USER || !envCheck.EMAIL_PASSWORD) {
      return res.status(400).json({
        success: false,
        message: 'Email configuration is missing',
        details: {
          envCheck,
          error: 'EMAIL_USER and EMAIL_PASSWORD must be set in environment variables',
        },
      });
    }

    // Use ADMIN_EMAIL if set, otherwise use EMAIL_USER as the admin email
    const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;

    // Test email connection
    let connectionTest = false;
    try {
      connectionTest = await testEmailConfig();
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Email connection test failed',
        details: {
          envCheck,
          connectionTest: false,
          error: error.message,
          errorCode: error.code,
        },
      });
    }

    if (!connectionTest) {
      return res.status(400).json({
        success: false,
        message: 'Email configuration is invalid',
        details: {
          envCheck,
          connectionTest: false,
          error: 'Unable to verify email credentials',
        },
      });
    }

    // Send test email
    const testContactData = {
      name: 'Email Test User',
      phoneNumber: '+1234567890',
      email: 'test@example.com',
      subject: 'Test Email - Gmail Functionality Check',
      message: 'This is a test message to verify that Gmail email notifications are working correctly. If you receive this email, the email service is configured properly.',
    };

    const emailResult = await sendContactNotification(testContactData);

    if (emailResult.success) {
      return res.json({
        success: true,
        message: 'Test email sent successfully',
        details: {
          envCheck,
          connectionTest: true,
          emailSent: true,
          messageId: emailResult.messageId,
          recipient: adminEmail,
          note: process.env.ADMIN_EMAIL ? 'Using ADMIN_EMAIL' : 'Using EMAIL_USER as admin email',
        },
      });
    } else {
      return res.status(500).json({
        success: false,
        message: 'Failed to send test email',
        details: {
          envCheck,
          connectionTest: true,
          emailSent: false,
          error: emailResult.error,
        },
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error testing email configuration',
      details: {
        error: error.message,
        errorCode: error.code,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
    });
  }
});

export default router;

