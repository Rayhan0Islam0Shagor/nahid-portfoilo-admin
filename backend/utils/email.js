import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Email Service Utility
 * Handles sending emails using nodemailer
 */

// Create transporter for Gmail
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD, // Use App Password for Gmail
    },
  });
};

/**
 * Send contact form notification email
 * @param {object} contactData - Contact form data
 * @returns {Promise<object>} Email send result
 */
export const sendContactNotification = async (contactData) => {
  try {
    const { name, email, phoneNumber, subject, message } = contactData;

    // Validate email configuration - if not configured, silently fail
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      return {
        success: false,
        error: 'Email configuration missing',
      };
    }

    // Use ADMIN_EMAIL if set, otherwise use EMAIL_USER as the admin email
    const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;

    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: adminEmail,
      subject: `New Contact Form Submission: ${subject}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              border: 1px solid #ddd;
              border-radius: 5px;
            }
            .header {
              background-color: #4f46e5;
              color: white;
              padding: 20px;
              border-radius: 5px 5px 0 0;
              margin: -20px -20px 20px -20px;
            }
            .content {
              padding: 20px 0;
            }
            .field {
              margin-bottom: 15px;
            }
            .field-label {
              font-weight: bold;
              color: #555;
              margin-bottom: 5px;
            }
            .field-value {
              padding: 10px;
              background-color: #f5f5f5;
              border-radius: 3px;
              border-left: 3px solid #4f46e5;
            }
            .message-box {
              padding: 15px;
              background-color: #f9f9f9;
              border-radius: 3px;
              border-left: 3px solid #4f46e5;
              white-space: pre-wrap;
            }
            .footer {
              margin-top: 20px;
              padding-top: 20px;
              border-top: 1px solid #ddd;
              font-size: 12px;
              color: #777;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>New Contact Form Submission</h2>
            </div>
            <div class="content">
              <div class="field">
                <div class="field-label">Name:</div>
                <div class="field-value">${name}</div>
              </div>
              <div class="field">
                <div class="field-label">Email:</div>
                <div class="field-value">${email}</div>
              </div>
              <div class="field">
                <div class="field-label">Phone Number:</div>
                <div class="field-value">${phoneNumber}</div>
              </div>
              <div class="field">
                <div class="field-label">Subject:</div>
                <div class="field-value">${subject}</div>
              </div>
              <div class="field">
                <div class="field-label">Message:</div>
                <div class="message-box">${message}</div>
              </div>
            </div>
            <div class="footer">
              <p>This email was sent from your contact form on ${new Date().toLocaleString()}.</p>
              <p>You can reply directly to this email to contact ${name} at ${email}.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
New Contact Form Submission

Name: ${name}
Email: ${email}
Phone: ${phoneNumber}
Subject: ${subject}

Message:
${message}

---
Sent from your contact form on ${new Date().toLocaleString()}
      `,
    };

    const info = await transporter.sendMail(mailOptions);

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Test email configuration
 * @returns {Promise<boolean>} True if email configuration is valid
 * @throws {Error} If email configuration is invalid
 */
export const testEmailConfig = async () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    throw new Error('EMAIL_USER and EMAIL_PASSWORD must be set');
  }

  const transporter = createTransporter();
  await transporter.verify();
  return true;
};

export default {
  sendContactNotification,
  testEmailConfig,
};
