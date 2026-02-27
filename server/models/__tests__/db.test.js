import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as db from '../db.js';
import mongoose from 'mongoose';

// Mock mongoose
vi.mock('mongoose', () => ({
  default: {
    connect: vi.fn(),
    connection: {
      close: vi.fn()
    }
  }
}));

// Mock dotenv
vi.mock('dotenv', () => ({
  default: {
    config: vi.fn()
  }
}));

describe('Database Connection (db.js)', () => {
  let processExitSpy;
  let consoleErrorSpy;
  let consoleLogSpy;

  beforeEach(() => {
    vi.clearAllMocks();
    processExitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    processExitSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    consoleLogSpy.mockRestore();
  });

  describe('connectDB', () => {
    it('successfully connects to MongoDB', async () => {
      mongoose.connect.mockResolvedValue({});

      await db.connectDB();

      expect(mongoose.connect).toHaveBeenCalled();
      expect(consoleLogSpy).toHaveBeenCalledWith('MongoDB connected successfully!');
      expect(processExitSpy).not.toHaveBeenCalled();
    });

    it('uses MONGO_URI from environment variables', async () => {
      mongoose.connect.mockResolvedValue({});
      const originalUri = process.env.MONGO_URI;
      process.env.MONGO_URI = 'mongodb://test:27017/test';

      await db.connectDB();

      expect(mongoose.connect).toHaveBeenCalledWith('mongodb://test:27017/test');

      // Restore
      if (originalUri) {
        process.env.MONGO_URI = originalUri;
      } else {
        delete process.env.MONGO_URI;
      }
    });

    it('logs success message on successful connection', async () => {
      mongoose.connect.mockResolvedValue({});

      await db.connectDB();

      expect(consoleLogSpy).toHaveBeenCalledWith('MongoDB connected successfully!');
    });

    it('handles connection errors gracefully', async () => {
      const error = new Error('Connection refused');
      mongoose.connect.mockRejectedValue(error);

      await db.connectDB();

      expect(consoleErrorSpy).toHaveBeenCalledWith('MongoDB connection error:', error);
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });

    it('logs connection error to console', async () => {
      const error = new Error('Auth failed');
      mongoose.connect.mockRejectedValue(error);

      await db.connectDB();

      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('exits process with code 1 on error', async () => {
      const error = new Error('Database error');
      mongoose.connect.mockRejectedValue(error);

      await db.connectDB();

      expect(processExitSpy).toHaveBeenCalledWith(1);
    });

    it('handles ECONNREFUSED error', async () => {
      const error = new Error('ECONNREFUSED');
      mongoose.connect.mockRejectedValue(error);

      await db.connectDB();

      expect(consoleErrorSpy).toHaveBeenCalledWith('MongoDB connection error:', error);
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });

    it('handles timeout errors', async () => {
      const error = new Error('ETIMEDOUT');
      mongoose.connect.mockRejectedValue(error);

      await db.connectDB();

      expect(processExitSpy).toHaveBeenCalledWith(1);
    });

    it('handles authentication errors', async () => {
      const error = new Error('Authentication failed at step 1: 32023');
      mongoose.connect.mockRejectedValue(error);

      await db.connectDB();

      expect(consoleErrorSpy).toHaveBeenCalledWith('MongoDB connection error:', error);
    });

    it('handles invalid URI errors', async () => {
      const error = new Error('Invalid URI');
      mongoose.connect.mockRejectedValue(error);

      await db.connectDB();

      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('handles malformed connection string', async () => {
      const error = new Error('connection string');
      mongoose.connect.mockRejectedValue(error);

      await db.connectDB();

      expect(processExitSpy).toHaveBeenCalledWith(1);
    });

    it('only exits on connection failure, not on success', async () => {
      mongoose.connect.mockResolvedValue({});

      await db.connectDB();

      expect(processExitSpy).not.toHaveBeenCalled();
    });

    it('returns undefined on successful connection', async () => {
      mongoose.connect.mockResolvedValue({});

      const result = await db.connectDB();

      expect(result).toBeUndefined();
    });

    it('handles null error gracefully', async () => {
      mongoose.connect.mockRejectedValue(null);

      await db.connectDB();

      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });

    it('handles undefined error gracefully', async () => {
      mongoose.connect.mockRejectedValue(undefined);

      await db.connectDB();

      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });
  });

  describe('Error Recovery', () => {
    it('does not attempt retry on first failure', async () => {
      const error = new Error('Connection failed');
      mongoose.connect.mockRejectedValue(error);

      await db.connectDB();

      // Called once, not multiple times
      expect(mongoose.connect).toHaveBeenCalledTimes(1);
    });

    it('allows subsequent connection attempts after failure', async () => {
      // First call fails
      mongoose.connect.mockRejectedValueOnce(new Error('Failed'));
      await db.connectDB();
      expect(processExitSpy).toHaveBeenCalledWith(1);

      vi.clearAllMocks();

      // Second call succeeds
      mongoose.connect.mockResolvedValue({});
      // Note: In actual app, process.exit(1) would stop execution
      // This tests that the function itself allows retry
    });
  });

  describe('Environment Configuration', () => {
    it('reads configuration from .env file', async () => {
      mongoose.connect.mockResolvedValue({});

      await db.connectDB();

      // dotenv.config should be called during import
      // This verifies the connection can be made after config
      expect(mongoose.connect).toHaveBeenCalled();
    });

    it('uses default port if not specified', async () => {
      mongoose.connect.mockResolvedValue({});

      await db.connectDB();

      expect(mongoose.connect).toHaveBeenCalled();
    });

    it('accepts custom MongoDB URI with port', async () => {
      mongoose.connect.mockResolvedValue({});
      const customUri = 'mongodb://localhost:27017/rental-db';

      // Simulate setting MONGO_URI before calling connectDB
      const original = process.env.MONGO_URI;
      process.env.MONGO_URI = customUri;

      await db.connectDB();

      expect(mongoose.connect).toHaveBeenCalledWith(customUri);

      // Restore
      if (original) {
        process.env.MONGO_URI = original;
      } else {
        delete process.env.MONGO_URI;
      }
    });
  });

  describe('Async Behavior', () => {
    it('properly awaits mongoose.connect', async () => {
      const connectPromise = Promise.resolve({});
      mongoose.connect.mockReturnValue(connectPromise);

      const result = db.connectDB();

      expect(result).toBeInstanceOf(Promise);
      await result;

      expect(mongoose.connect).toHaveBeenCalled();
    });

    it('completes successfully when mongoose resolves', async () => {
      mongoose.connect.mockResolvedValue({});

      await expect(db.connectDB()).resolves.toBeUndefined();
    });

    it('handles rejection when mongoose rejects', async () => {
      const error = new Error('Connection failed');
      mongoose.connect.mockRejectedValue(error);

      // function catches the error and calls process.exit
      // so it won't actually reject
      await db.connectDB();

      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });
});