import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../modules/auth/index.js';

dotenv.config();

const initDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/nahid-admin',
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      },
    );

    // Predefined admin users
    const predefinedUsers = [
      {
        email: 'admin@nahid.me',
        password: 'Admin@123',
        name: 'Admin User',
        role: 'admin',
      },
    ];

    let createdCount = 0;
    let existingCount = 0;

    for (const userData of predefinedUsers) {
      const existingUser = await User.findOne({ email: userData.email });

      if (existingUser) {
        existingCount++;
        continue;
      }

      const user = new User(userData);
      await user.save();
      createdCount++;
    }

    process.exit(0);
  } catch (error) {
    process.exit(1);
  }
};

initDatabase();
