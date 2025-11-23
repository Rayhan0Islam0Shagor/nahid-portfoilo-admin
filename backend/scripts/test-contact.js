/**
 * Test script to send a contact form submission
 * This will test if Gmail email functionality is working
 * 
 * Usage:
 *   node backend/scripts/test-contact.js
 * 
 * Make sure to set these environment variables:
 *   - API_URL (default: http://localhost:5000/api)
 *   - API_KEY (optional, if API key is required)
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: resolve(__dirname, '../../.env') });

const API_URL = process.env.API_URL || 'http://localhost:5000/api';
const API_KEY = process.env.API_KEY || '';

const testContact = async () => {
  const contactData = {
    name: 'Test User',
    phoneNumber: '+1234567890',
    email: 'test@example.com',
    subject: 'Test Email - Gmail Functionality Check',
    message: 'This is a test message to verify that Gmail email notifications are working correctly. If you receive this email, the email service is configured properly.',
  };

  try {
    console.log('📧 Sending test contact form submission...');
    console.log(`📍 API URL: ${API_URL}/contacts`);
    console.log('📝 Contact Data:', JSON.stringify(contactData, null, 2));
    console.log('');

    const headers = {
      'Content-Type': 'application/json',
    };

    // Add API key if provided
    if (API_KEY) {
      headers['x-api-key'] = API_KEY;
    }

    const response = await fetch(`${API_URL}/contacts`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(contactData),
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ Contact form submitted successfully!');
      console.log('');
      console.log('Response:', JSON.stringify(data, null, 2));
      console.log('');
      console.log('📬 Check your admin email inbox for the notification email.');
      console.log('   Make sure ADMIN_EMAIL is set in your environment variables.');
      console.log('');
      console.log('💡 Note: The contact was saved to the database.');
      console.log('   Check the admin panel Contacts page to see the submission.');
    } else {
      console.error('❌ Failed to submit contact form');
      console.error('Status:', response.status);
      console.error('Response:', JSON.stringify(data, null, 2));
      
      if (response.status === 401 || response.status === 403) {
        console.error('');
        console.error('⚠️  Authentication/Authorization error.');
        console.error('   Make sure API_KEY is set correctly if required.');
      }
      
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error sending contact form:', error.message);
    console.error('');
    console.error('Make sure:');
    console.error('  1. The backend server is running');
    console.error('  2. API_URL is correct (current:', API_URL, ')');
    console.error('  3. Network connection is available');
    process.exit(1);
  }
};

testContact();

