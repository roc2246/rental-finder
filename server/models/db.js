// db.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../config/.env') });

/**
 * Establishes a connection to the MongoDB database
 * Uses MONGO_URI from environment variables configured in config/.env
 * @async
 * @returns {Promise<void>} - Resolves when connection is established
 * @throws {Error} - Logs error and exits process (code 1) if connection fails
 * @example
 * await connectDB();
 * console.log('Database connected and ready for queries');
 */
export async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected successfully!');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1); 
  }
}
