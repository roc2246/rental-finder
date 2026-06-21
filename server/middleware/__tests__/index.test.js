import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  validateRentalBody,
  authorize,
  validateRentalQuery,
  isValidObjectId,
  validateObjectId
} from '../index.js';

describe('Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    vi.clearAllMocks();
    req = {
      body: {},
      query: {},
      params: {},
      headers: {}
    };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
    next = vi.fn();
  });

  describe('validateRentalBody', () => {
    it('allows valid rental data', () => {
      req.body = {
        title: 'Modern Apartment',
        location: 'Boston, MA',
        listingURL: 'http://example.com/rental/1',
        price: '$2000',
        dailyRate: 100,
        bedrooms: 2,
        description: 'A beautiful apartment'
      };

      validateRentalBody(req, res, next);
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('rejects title with less than 3 characters', () => {
      req.body = { title: 'AB' };
      validateRentalBody(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Bad Request',
          details: expect.arrayContaining([expect.stringContaining('title')])
        })
      );
    });

    it('rejects non-string location', () => {
      req.body = { location: 123 };
      validateRentalBody(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('rejects negative dailyRate', () => {
      req.body = { dailyRate: -50 };
      validateRentalBody(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          details: expect.arrayContaining([expect.stringContaining('dailyRate')])
        })
      );
    });

    it('rejects description over 1000 characters', () => {
      req.body = { description: 'a'.repeat(1001) };
      validateRentalBody(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('allows empty body (for partial updates)', () => {
      req.body = {};
      validateRentalBody(req, res, next);
      expect(next).toHaveBeenCalled();
    });
  });

  describe('authorize', () => {
    it('allows user with correct role', () => {
      req.user = { _id: '123', role: 'admin' };
      const authorizeAdmin = authorize(['admin']);
      
      authorizeAdmin(req, res, next);
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('allows user with one of multiple allowed roles', () => {
      req.user = { _id: '123', role: 'agent' };
      const authorizeMulti = authorize(['admin', 'agent']);
      
      authorizeMulti(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it('rejects user without correct role', () => {
      req.user = { _id: '123', role: 'user' };
      const authorizeAdmin = authorize(['admin']);
      
      authorizeAdmin(req, res, next);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Forbidden',
          message: expect.stringContaining('admin')
        })
      );
    });

    it('rejects unauthenticated user', () => {
      req.user = null;
      const authorize_admin = authorize(['admin']);
      
      authorize_admin(req, res, next);
      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('allows all authenticated users when no roles specified', () => {
      req.user = { _id: '123', role: 'user' };
      const authorizeAll = authorize([]);
      
      authorizeAll(req, res, next);
      expect(next).toHaveBeenCalled();
    });
  });

  describe('validateRentalQuery', () => {
    it('accepts valid query parameters', () => {
      req.query = { page: '1', pagesize: '20' };
      validateRentalQuery(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it('rejects page below 1', () => {
      req.query = { page: '0' };
      validateRentalQuery(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('rejects pageSize above 100', () => {
      req.query = { pagesize: '200' };
      validateRentalQuery(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('rejects disallowed filter keys', () => {
      req.query = { filters: JSON.stringify({ invalidKey: 'value' }) };
      validateRentalQuery(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('invalidKey')
        })
      );
    });

    it('accepts allowed filter keys', () => {
      req.query = { filters: JSON.stringify({ location: 'Boston' }) };
      validateRentalQuery(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it('rejects invalid JSON in filters', () => {
      req.query = { filters: '{invalid json}' };
      validateRentalQuery(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('valid JSON')
        })
      );
    });
  });

  describe('isValidObjectId', () => {
    it('validates correct MongoDB ObjectId format', () => {
      expect(isValidObjectId('507f1f77bcf86cd799439011')).toBe(true);
    });

    it('rejects invalid ObjectId (too short)', () => {
      expect(isValidObjectId('507f1f77bcf86cd79943901')).toBe(false);
    });

    it('rejects invalid ObjectId (non-hex characters)', () => {
      expect(isValidObjectId('507f1f77bcf86cd799439zzz')).toBe(false);
    });

    it('rejects empty string', () => {
      expect(isValidObjectId('')).toBe(false);
    });
  });

  describe('validateObjectId', () => {
    it('allows valid ObjectId in params', () => {
      req.params.id = '507f1f77bcf86cd799439011';
      validateObjectId(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it('rejects invalid ObjectId', () => {
      req.params.id = 'invalid-id';
      validateObjectId(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Bad Request',
          message: expect.stringContaining('Invalid rental ID format')
        })
      );
    });

    it('rejects missing id', () => {
      req.params = {};
      validateObjectId(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });
});
